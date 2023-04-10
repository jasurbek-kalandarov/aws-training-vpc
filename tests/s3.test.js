import { s3} from "../aws/sdk.js";
import { expect } from "chai";
import FormData from "form-data";
import fs from 'fs';
import httpRequest from "../utils/httpRequester.js";
import  getListOfBucketsContainingName from "../utils/get-bucket-list.js"
import { readdir } from 'fs/promises';

describe('Check S3 app metadata', () => {
  it('should get a list of S3 buckets', async () => {
    const data = await s3.listBuckets().promise();
    const hasCloudxBuckets = data.Buckets.some(bucket => bucket.Name.includes('cloudx'));
    expect(hasCloudxBuckets).to.equal(true);
  });

  it('should get tags for buckets', async () => {
    const cloudxBuckets = await getListOfBucketsContainingName('cloudx');
    
    for (const bucket of cloudxBuckets) {
      const resp = await s3.getBucketTagging({ Bucket: bucket.Name }).promise();
      const [ cloudxTag ] = resp.TagSet.filter(tagName => tagName.Key === 'cloudx');

      expect(cloudxTag.Key).to.equal('cloudx');
      expect(cloudxTag.Value).to.equal('qa');
    }
  });

  it('should get bucket Encryption', async () => {
    const cloudxBuckets = await getListOfBucketsContainingName('cloudx');

    for (const bucket of cloudxBuckets) {
      const resp = await s3.getBucketEncryption({ Bucket: bucket.Name }).promise();
      const { BucketKeyEnabled } = resp.ServerSideEncryptionConfiguration.Rules[0];

      expect(BucketKeyEnabled).to.be.false;
      expect(BucketKeyEnabled).to.be.false;
    }
  });

  it('should get bucket versioning', async () => {
    const cloudxBuckets = await getListOfBucketsContainingName('cloudx');

    for (const bucket of cloudxBuckets) {
      const resp = await s3.getBucketVersioning({ Bucket: bucket.Name }).promise();
      expect(resp.Status).to.be.undefined;
    }
  });

  it('should get bucket public access', async () => {
    const cloudxBuckets = await getListOfBucketsContainingName('cloudx');

    for (const bucket of cloudxBuckets) {
      const resp = await s3.getBucketAcl({ Bucket: bucket.Name }).promise();

      expect(resp.Grants[0].Grantee.DisplayName).to.equal('jkalandarov');
      expect(resp.Grants[0].Permission).to.equal('FULL_CONTROL');
    }
  });
});

describe('Checkt S3 app functionality', () => {
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
    expect(resp.data).to.be.true;

    const downloadedFile = fs.createWriteStream('./downloads/downdload.jpg');
    downloadedFile.write(resp.data);

    let listOfFiles = await readdir('./downloads/');
    //Check file is successfully downloaded to the folder
    listOfFiles.forEach(fileName => {
      expect(fileName).to.match(/\w+\.jpg/);
    })
  });

  it('should be able to delete image by id', async () => {
    const allImages = await httpRequest({
      url: 'http://52.90.88.242/api/image',
      method: 'get'
    });

    const lastImageId = allImages.data.length;
    
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
