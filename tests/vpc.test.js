import { ec2, s3} from "../aws/sdk.js";
import { expect } from "chai";
import httpRequest from "../utils/httpRequester.js";

describe('Check stack parameters', ()=> {
  it('should get ec2 metadata',async () => {
    const response = await ec2.describeInstances().promise();
    const { 
      InstanceType, 
      PrivateIpAddress, 
      VpcId, 
      InstanceId,
      Placement: { AvailabilityZone }
    } = response.Reservations[1].Instances[0];
    const instanceName = response.Reservations[1].Instances[0].Tags[0].Value;

    expect(instanceName).to.equal('cloudxinfo/PublicInstance/Instance');
    expect(InstanceId).to.equal('i-0bb1fd9a8786b2fe4');
    expect(InstanceType).to.equal('t2.micro');
    expect(PrivateIpAddress).to.equal('10.0.19.208');    
    expect(VpcId).to.equal('vpc-0c90de88ba5c55887');
    expect(AvailabilityZone).to.equal('us-east-1a');
  });
});

describe('Check S3 app', () => {
  it('should get a list of S3 buckets', async () => {
    const data = await s3.listBuckets().promise();
    const hasCloudxBuckets = data.Buckets.some(bucket => bucket.Name.includes('cloudx'));
    expect(hasCloudxBuckets).to.equal(true);
  });

  it.only('check tags for cloudx', async () => {
    const data = await s3.listBuckets().promise();
    const cloudxBuckets = data.Buckets.filter(bucket => bucket.Name.includes('cloudx'));
    
    for (const bucket of cloudxBuckets) {
      const resp = await s3.getBucketTagging({ Bucket: bucket.Name }).promise();
      const [ cloudxTag ] = resp.TagSet.filter(tagName => tagName.Key === 'cloudx');

      expect(cloudxTag.Key).to.equal('cloudx');
      expect(cloudxTag.Value).to.equal('qa');
    }
  });
});

const config = {
  url: 'http://52.90.88.242/api/image',
  method: 'get'
}
// const response = await httpRequest(config);
// console.log('****', data);