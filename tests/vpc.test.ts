import { ec2 } from "../aws/sdk";
import { expect } from "chai";
;

describe.skip('Check stack parameters', ()=> {
  it('should get ec2 metadata',async () => {
    const response = await ec2.describeInstances().promise();
    const { 
      InstanceType, 
      PrivateIpAddress, 
      VpcId, 
      InstanceId,
      // Placement: { AvailabilityZone }
    } = response!.Reservations![1].Instances![0];
    const instanceName = response!.Reservations![1].Instances![0].Tags![0].Value;

    expect(instanceName).to.equal('cloudxinfo/PublicInstance/Instance');
    expect(InstanceId).to.equal('i-0a1ea4ac7bcdbd937');
    expect(InstanceType).to.equal('t2.micro');
    expect(PrivateIpAddress).to.equal('10.0.4.130');    
    expect(VpcId).to.equal('vpc-08b83990e0464a2ac');
    // expect(AvailabilityZone).to.equal('us-east-1a');
  });
});