import { EC2 } from "aws-sdk";

export interface PublicInstance {
  InstanceType: string | undefined;
  Tags: EC2.TagList | undefined;
  BlockDeviceMappings: EC2.InstanceBlockDeviceMappingList | undefined;
  PlatformDetails: string | undefined;
  PublicIpAddress: string | undefined;
}

export interface PrivateInstance {
  InstanceType: string | undefined;
  Tags: EC2.TagList | undefined;
  BlockDeviceMappings: EC2.InstanceBlockDeviceMappingList | undefined;
  PlatformDetails: string | undefined;
  PrivateIpAddress: string | undefined;
}

export interface InstancesData {
  keyPairId: string;
  privateInstance: {
    id: string,
    privateIp: string
  };
  publicInstance: {
    id: string,
    privateIp: string,
    publicIp: string
  }
}