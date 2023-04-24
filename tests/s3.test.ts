import { s3 } from "../aws/sdk";
import { expect } from "chai";
import FormData from "form-data";
import fs from 'fs';
import  { getListOfBucketsContainingName, RequestBuilder, httpRequest } from "../utils/index";
import { readdir } from 'fs/promises';
import Randomstring from "randomstring";
import { Bucket } from "aws-sdk/clients/s3";
import { Image } from '../utils/interfaces';

describe('Check S3 app metadata', () => {
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

describe('Checkt S3 app functionality', () => {
  let requestConfig: RequestBuilder;

  beforeEach(() => {
    requestConfig = new RequestBuilder();
  });
  
  it('should upload an image to bucket', async () => {
    const data = new FormData();
    data.append('upfile', fs.createReadStream('./screenshots/test report.jpg'));

    requestConfig
      .setUrl('/image')
      .setMethod("post")
      .setData(data)
      .setHeaders("multipart/form-data");

    const resp = await httpRequest<Image[]>(requestConfig);
    expect(resp.status).to.equal(204);
  });

  it('should get all images', async () => {
    requestConfig
      .setUrl('/image')
      .setMethod("get")
      .setHeaders("application/json");
      
    const resp = await httpRequest<Image[]>(requestConfig);

    const expectedKeys = ['id', 'last_modified', 'object_key', 'object_size', 'object_type'];

    expect(resp.status).to.equal(200);
    expect(resp.data.length).to.greaterThan(0);
    expect(resp.data[0]).to.have.all.keys(expectedKeys);
  });

  it('should download an image by id', async () => {
    requestConfig
      .setUrl('/image/file/1')
      .setMethod("get")
      .setHeaders("application/json");

    const resp = await httpRequest(requestConfig);

    //Check response status and data
    expect(resp.status).to.equal(200);
    expect(resp.data).to.be.not.undefined;

    const newFileName = Randomstring.generate(6);

    const downloadedFile = fs.createWriteStream(`./downloads/${newFileName}.jpg`);
    downloadedFile.write(resp.data);

    console.log(newFileName)

    //Check file is successfully downloaded to the folder
    let listOfFiles = await readdir('./downloads/');
    setTimeout(() => {
      expect(listOfFiles).to.include(`${newFileName}.jpg`);
    }, 500);
  });

  it('should be able to delete image by id', async () => {
    requestConfig
      .setUrl('/image')
      .setMethod("get")
      .setHeaders("application/json");

      const { data: allImages } = await httpRequest<Image[]>(requestConfig);
      const lastImageId = allImages[allImages.length - 1].id;
    
    requestConfig
      .setUrl(`/image/${lastImageId}`)
      .setMethod("delete")
      .setHeaders("application/json");

    const deleteResponse = await httpRequest(requestConfig);

    expect(deleteResponse.status).to.equal(204);
  });

  it('should get image metada', async () => {
    requestConfig
      .setUrl('/image/1')
      .setMethod("get")
      .setHeaders("application/json");

    const resp = await httpRequest(requestConfig);

    const expectedKeys = ['id', 'last_modified', 'object_key', 'object_size', 'object_type'];

    expect(resp.status).to.equal(200);
    expect(resp.data).to.have.all.keys(expectedKeys);
  });
  
});
