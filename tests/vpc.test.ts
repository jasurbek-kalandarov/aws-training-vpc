import { EC2 } from "aws-sdk";
import { ec2 } from "../aws/sdk";
import { expect } from "chai";
import { CloudxInfo } from "../utils/interfaces";
import { readJsonData } from "../utils/readData";

let cloudxinfo: CloudxInfo;

describe.only('VPC', ()=> {
  let VpcId: string | undefined;
  let CidrBlock: string | undefined;
  let State: string | undefined;
  let Tags: EC2.TagList | undefined;

  const vpcs = ['First VPC', 'Second VPC'];
  
  vpcs.forEach((vpc, index) => {
    describe(`${vpc}`, () => {
      before(async () => {
        const { Vpcs } = await ec2.describeVpcs().promise();
        ({ VpcId, CidrBlock, State, Tags} = Vpcs![index]);
    
        expect(Vpcs?.length).to.equal(2);
    
        cloudxinfo = await readJsonData("cloudxinfo");
      });
    
      it('should have VpcId', () => {
        expect(cloudxinfo.vpcs![index].vpcId).to.equal(VpcId);
      });
    
      it('should have vpc cidr block', () => {
        expect(cloudxinfo.vpcs![index].cidrBlock).to.equal(CidrBlock);
      });
    
      it('vpc state should be available', () => {
        expect(cloudxinfo.vpcs![index].state).to.equal(State);
      });
    
      it('should have tags', () => {
        expect(cloudxinfo.vpcs![index].tags).to.deep.equal(Tags);
      });
    });
  });
});