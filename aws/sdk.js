import AWS from 'aws-sdk';

AWS.config.getCredentials(function (err) {
  if (err) {
    console.log(err.stack);
    console.warn('Credentials not found');
  } else {
    console.log('Access key successfully registered');
  }
});

const ec2 = new AWS.EC2({ region: 'us-east-1', apiVersion: '2016-11-15' });

export default ec2;