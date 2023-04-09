import AWS from 'aws-sdk';

AWS.config.getCredentials(function (err) {
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

export { ec2, s3 };