import { s3 } from "../aws/sdk";
import { expect } from "chai";
import FormData from "form-data";
import fs from 'fs';
import httpRequest from "../utils/httpRequester";
import  getListOfBucketsContainingName from "../utils/get-bucket-list"
import { readdir } from 'fs/promises';
import Randomstring from "randomstring";
import S3, { Bucket } from "aws-sdk/clients/s3";

describe.skip('Check S3 app metadata', () => {
  let cloudxBuckets: Bucket[];

  before(async () => {
    cloudxBuckets = await getListOfBucketsContainingName('cloudx');
  });

  it('should get a list of S3 buckets', async () => {
    expect(cloudxBuckets).to.equal(true);
  });

  it('should get tags for buckets', async () => {    
    for (const bucket of cloudxBuckets) {
      const resp = await s3.getBucketTagging({ Bucket: bucket?.Name! }).promise();
      const [ cloudxTag ] = resp.TagSet.filter(tagName => tagName.Key === 'cloudx');

      expect(cloudxTag.Key).to.equal('cloudx');
      expect(cloudxTag.Value).to.equal('qa');
    }
  });

  it('should get bucket Encryption', async () => {
    for (const bucket of cloudxBuckets) {
      const resp = await s3.getBucketEncryption({ Bucket: bucket?.Name! }).promise();
      const { BucketKeyEnabled } = resp?.ServerSideEncryptionConfiguration!.Rules![0];

      expect(BucketKeyEnabled).to.be.false;
      expect(BucketKeyEnabled).to.be.false;
    }
  });

  it('should get bucket versioning', async () => {
    for (const bucket of cloudxBuckets) {
      const resp = await s3.getBucketVersioning({ Bucket: bucket?.Name! }).promise();
      expect(resp.Status).to.be.undefined;
    }
  });

  it('should get bucket public access', async () => {
    for (const bucket of cloudxBuckets) {
      const resp = await s3.getBucketAcl({ Bucket: bucket?.Name! }).promise();

      expect(resp!.Grants![0].Grantee!.DisplayName).to.equal('jkalandarov');
      expect(resp!.Grants![0].Permission).to.equal('FULL_CONTROL');
    }
  });
});

describe.skip('Checkt S3 app functionality', () => {
  it('should upload an image to bucket', async () => {
    const data = new FormData();
    data.append('upfile', fs.createReadStream('./screenshots/test report.jpg'));

    const config = {
      url: 'http://52.90.88.242/api/image',
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data
    }

    const resp = await httpRequest(config);
    expect(resp.status).to.equal(204);
  });

  it('should get all images', async () => {
    const config = {
      url: 'http://52.90.88.242/api/image',
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const resp = await httpRequest(config);

    const expectedKeys = ['id', 'last_modified', 'object_key', 'object_size', 'object_type'];

    expect(resp.status).to.equal(200);
    expect(resp.data.length).to.greaterThan(0);
    expect(resp.data[0]).to.have.all.keys(expectedKeys);
  });

  it('should download an image by id', async () => {
    const config = {
      url: 'http://52.90.88.242/api/image/file/1',
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const resp = await httpRequest(config);

    //Check response status and data
    expect(resp.status).to.equal(200);
    expect(resp.data).to.be.not.undefined;

    const newFileName = Randomstring.generate(6);

    const downloadedFile = fs.createWriteStream(`./downloads/${newFileName}.jpg`);
    downloadedFile.write(resp.data);

    let listOfFiles = await readdir('./downloads/');
    //Check file is successfully downloaded to the folder
    listOfFiles.forEach(fileName => {
      expect(fileName).to.match(/\w+\.jpg/); // need to check with newFileName
    })
  });

  it('should be able to delete image by id', async () => {
    const allImages = await httpRequest({
      url: 'http://52.90.88.242/api/image',
      method: 'get'
    });

    const lastImageId = allImages.data[allImages.data.length - 1].id;
    
    const deleteResponse = await httpRequest({
      url: `http://52.90.88.242/api/image/${lastImageId}`,
      method: 'delete' 
    });

    expect(deleteResponse.status).to.equal(204);
  });

  it('should get image metada', async () => {
    const resp = await httpRequest({
      url: 'http://52.90.88.242/api/image/1',
      method: 'get'
    });

    const expectedKeys = ['id', 'last_modified', 'object_key', 'object_size', 'object_type'];

    expect(resp.status).to.equal(200);
    expect(resp.data).to.have.all.keys(expectedKeys);
  });
  
});
