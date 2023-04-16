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

  describe('First VPC', () => {
    before(async () => {
      const { Vpcs } = await ec2.describeVpcs().promise();
      ({ VpcId, CidrBlock, State, Tags} = Vpcs![0]);
  
      expect(Vpcs?.length).to.equal(2);
  
      cloudxinfo = await readJsonData("cloudxinfo");
    });
  
    it('should have VpcId', () => {
      expect(cloudxinfo.vpcs![0].vpcId).to.equal(VpcId);
    });
  
    it('should have vpc cidr block', () => {
      expect(cloudxinfo.vpcs![0].cidrBlock).to.equal(CidrBlock);
    });
  
    it('vpc state should be available', () => {
      expect(cloudxinfo.vpcs![0].state).to.equal(State);
    });
  
    it('should have tags', () => {
      expect(cloudxinfo.vpcs![0].tags).to.deep.equal(Tags);
    });
  });

  describe('Second VPC', () => {
    before(async () => {
      const { Vpcs } = await ec2.describeVpcs().promise();
      ({ VpcId, CidrBlock, State, Tags} = Vpcs![1]);
  
      expect(Vpcs?.length).to.equal(2);
  
      cloudxinfo = await readJsonData("cloudxinfo");
    });
  
    it('should have VpcId', () => {
      expect(cloudxinfo.vpcs![1].vpcId).to.equal(VpcId);
    });
  
    it('should have vpc cidr block', () => {
      expect(cloudxinfo.vpcs![1].cidrBlock).to.equal(CidrBlock);
    });
  
    it('vpc state should be available', () => {
      expect(cloudxinfo.vpcs![1].state).to.equal(State);
    });
  
    it('should have tags', () => {
      expect(cloudxinfo.vpcs![1].tags).to.deep.equal(Tags);
    });
  });
});