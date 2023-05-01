import AWS from 'aws-sdk';

AWS.config.getCredentials((err: Error | null) => {
  if (err) {
    console.log(err.stack);
    console.warn('Credentials not found');
  } else {
    console.log('Access key successfully registered');
  }
});

const params = { region: 'us-east-1', apiVersion: '2016-11-15' }

const ec2 = new AWS.EC2(params);
const s3 = new AWS.S3(params);
const rds = new AWS.RDS(params);
const sns = new AWS.SNS(params);
const dynamoDD = new AWS.DynamoDB(params);
const lambda = new AWS.Lambda(params);

export { ec2, s3, rds, sns, dynamoDD, lambda };