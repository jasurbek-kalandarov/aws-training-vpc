import ec2 from "../aws/sdk.js";
import { expect } from "chai";

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