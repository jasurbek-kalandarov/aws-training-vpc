import ec2 from "../aws/sdk.js";
import assert from "assert";

describe('Check stack parameters', ()=> {
  it('should get ec2 metadata',async () => {
    const response = await ec2.describeInstances().promise();
    const { InstanceType, PrivateIpAddress, VpcId, InstanceId } = response.Reservations[1].Instances[0];
    const { AvailabilityZone } = response.Reservations[1].Instances[0].Placement;
    const instanceName = response.Reservations[1].Instances[0].Tags[0].Value;

    assert.equal(instanceName, 'cloudxinfo/PublicInstance/Instance');
    assert.equal(InstanceId, 'i-0bb1fd9a8786b2fe4');
    assert.equal(InstanceType, 't2.micro');
    assert.equal(PrivateIpAddress, '10.0.19.208');    
    assert.equal(VpcId, 'vpc-0c90de88ba5c55887');
    assert.equal(AvailabilityZone, 'us-east-1a');
  });
});