import { DynamoDB, Lambda } from 'aws-sdk';
import { dynamoDD, lambda } from '../aws/sdk';
import { CloudxServerless } from '../utils/interfaces';
import { RequestBuilder, getTodayDate, httpRequest, readJsonData } from '../utils';
import { test } from 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import FormData from "form-data";
import { Image } from '../utils/interfaces';
import { readdir } from 'fs/promises';
import Randomstring from "randomstring";

describe('Deployment Validation', () => {
  describe('DynamoDB db validation', () => {
    let cloudxServerless: CloudxServerless;
    let db: DynamoDB.DescribeTableOutput;

    before(async () => {
      cloudxServerless = await readJsonData('cloudxserverless');
      const params: DynamoDB.DescribeTableInput = {
        TableName: cloudxServerless.db.name
      }

      db = await dynamoDD.describeTable(params).promise();
      console.log(db);
    });

    it('table name matches', async () => {
      expect(db.Table?.TableName).to.equal(cloudxServerless.db.name);
    });

    it('provisioned read capacity units is eqaul to 5', async () => {
      expect(db.Table?.ProvisionedThroughput?.ReadCapacityUnits).to.equal(5);
    });

    it('provisioned write capacity units is equal to 1', async () => {
      expect(db.Table?.ProvisionedThroughput?.WriteCapacityUnits).to.equal(1);
    });
  });

  describe('Lambda validation', () => {
    let cloudxServerless: CloudxServerless;
    let labmdaFunction: Lambda.FunctionConfiguration;
    let listOfTags: Lambda.ListTagsResponse;

    before(async () => {
      cloudxServerless = await readJsonData('cloudxserverless');

      labmdaFunction = await lambda.getFunctionConfiguration({
        FunctionName: cloudxServerless.lambda.functionName
      }).promise();

      listOfTags = await lambda.listTags({
        Resource: cloudxServerless.lambda.arn
      }).promise();
    });

    it('function name matches', async () => {
      expect(cloudxServerless.lambda.functionName).to.equal(labmdaFunction.FunctionName)
    });

    it('function memory is 128 mb', async () => {
      expect(labmdaFunction.MemorySize).to.equal(128);
    });

    it('function ephemeral storage is 512 mb', async () => {
      expect(labmdaFunction.EphemeralStorage?.Size).to.equal(512);
    });

    it('function timeout is 3 seconds', async () => {
      expect(labmdaFunction.Timeout).to.equal(3);
    });

    it('function has cloudxserverless tag', async () => {
      expect(listOfTags.Tags).to.haveOwnProperty('aws:cloudformation:stack-name', 'cloudxserverless');
    });
  });
});

describe('Application testing', () => {
  describe.only('Checkt S3 app functionality', () => {
    let requestConfig: RequestBuilder;
    let cloudxServerless: CloudxServerless;

    before(async () => {
      cloudxServerless = await readJsonData('cloudxserverless');
    });
  
    beforeEach(async () => {
      requestConfig = new RequestBuilder();
      requestConfig.setBaseUrl(cloudxServerless.instance.publicIp);
    });
    
    it('should upload an image to bucket', async () => {
      const query: DynamoDB.ScanInput = {
        TableName: cloudxServerless.db.name
      }
      const { Count: numberOfItemsBeforeUpload } = await dynamoDD.scan(query).promise();
      const data = new FormData();
      data.append('upfile', fs.createReadStream('./screenshots/test report.jpg'));
  
      requestConfig
        .setUrl('/image')
        .setMethod("post")
        .setData(data)
        .setHeaders("multipart/form-data");
  
        const resp = await httpRequest(requestConfig);
        expect(resp.status).to.equal(204);

      const { Count: numberOfItemsAfterUpload } = await dynamoDD.scan(query).promise();
      expect(numberOfItemsAfterUpload).to.be.greaterThan(numberOfItemsBeforeUpload!);
    });
  
    it('should get all images', async () => {
      requestConfig
        .setUrl('/image')
        .setMethod("get")
        .setHeaders("application/json");
        
      const resp = await httpRequest<Image[]>(requestConfig);
  
      const expectedKeys = ['id', 'created_at', 'last_modified', 'object_key', 'object_size', 'object_type'];
  
      expect(resp.status).to.equal(200);
      expect(resp.data.length).to.greaterThan(0);
      expect(resp.data[0]).to.have.all.keys(expectedKeys);
    });
  
    it('should download an image by id', async () => {
      requestConfig
        .setUrl('/image')
        .setMethod("get")
        .setHeaders("application/json");
        
      const { data: images } = await httpRequest<Image[]>(requestConfig);

      requestConfig
        .setUrl(`/image/file/${images[0].id}`)
        .setMethod("get")
        .setHeaders("application/json");
  
      const resp = await httpRequest(requestConfig);
  
      //Check response status and data
      expect(resp.status).to.equal(200);
      expect(resp.data).to.be.not.undefined;
  
      const newFileName = Randomstring.generate(6);
      const writePromise = fs.writeFile(`./downloads/${newFileName}.jpg`, JSON.stringify(resp.data), {encoding: "utf-8"}, (err) => {
        if (err) {
          return err;
        }
      });
  
      //Check file is successfully downloaded to the folder
      let listOfFiles = await readdir('./downloads/');
      expect(listOfFiles).to.include(`${newFileName}.jpg`);
    });
  
    it('should be able to delete image by id', async () => {
      requestConfig
        .setUrl('/image')
        .setMethod("get")
        .setHeaders("application/json");
  
        const { data: images } = await httpRequest<Image[]>(requestConfig);
        const lastImageId = images[images.length - 1].id;
      
      requestConfig
        .setUrl(`/image/${lastImageId}`)
        .setMethod("delete")
        .setHeaders("application/json");
  
      const deleteResponse = await httpRequest(requestConfig);
      expect(deleteResponse.status).to.equal(204);

      //Check image id from database
      requestConfig
        .setUrl('/image')
        .setMethod("get")
        .setHeaders("application/json");
        
      const { data: imagesAfterDeletion } = await httpRequest<Image[]>(requestConfig);
      const isImageExisting = imagesAfterDeletion.find(image => image.id === lastImageId);
      expect(isImageExisting).to.be.undefined;
    });
  
    it('should get image metada', async () => {
      requestConfig
        .setUrl('/image')
        .setMethod("get")
        .setHeaders("application/json");
  
      const { data: images } = await httpRequest<Image[]>(requestConfig);
      const expectedKeys = ['id', 'created_at', 'last_modified', 'object_key', 'object_size', 'object_type'];
  
      expect(images[0]).to.have.all.keys(expectedKeys);
    });
  });
  
});
