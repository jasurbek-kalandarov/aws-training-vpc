import { DynamoDB, Lambda } from 'aws-sdk';
import { dynamoDD, lambda } from '../aws/sdk';
import { CloudxServerless } from '../utils/interfaces';
import { getTodayDate, readJsonData } from '../utils';
import { test } from 'mocha';
import { expect } from 'chai';

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

    test('table name matches', async () => {
      expect(db.Table?.TableName).to.equal(cloudxServerless.db.name);
    });

    test('table creation date is today', async () => {
      const today = getTodayDate();
      const tableCreationDate = db.Table?.CreationDateTime?.toISOString().split('T')[0].split('-').sort().join('-');
      expect(today).to.equal(tableCreationDate);
    });

    test('provisioned read capacity units is eqaul to 5', async () => {
      expect(db.Table?.ProvisionedThroughput?.ReadCapacityUnits).to.equal(5);
    });

    test('provisioned write capacity units is equal to 1', async () => {
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

    test('function name matches', async () => {
      expect(cloudxServerless.lambda.functionName).to.equal(labmdaFunction.FunctionName)
    });

    test('function memory is 128 mb', async () => {
      expect(labmdaFunction.MemorySize).to.equal(128);
    });

    test('function ephemeral storage is 512 mb', async () => {
      expect(labmdaFunction.EphemeralStorage?.Size).to.equal(512);
    });

    test('function timeout is 3 seconds', async () => {
      expect(labmdaFunction.Timeout).to.equal(3);
    });

    test('function has cloudxserverless tag', async () => {
      expect(listOfTags.Tags).to.haveOwnProperty('aws:cloudformation:stack-name', 'cloudxserverless');
    });
  });
});
