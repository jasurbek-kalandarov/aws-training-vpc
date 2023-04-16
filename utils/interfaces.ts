import { EC2 } from "aws-sdk";

export interface PublicInstance {
  InstanceType: string | undefined;
  Tags: EC2.TagList | undefined;
  BlockDeviceMappings: EC2.InstanceBlockDeviceMappingList | undefined;
  PlatformDetails: string | undefined;
  PublicIpAddress: string | undefined;
  InstanceId: string | undefined;
}

export interface PrivateInstance {
  InstanceType: string | undefined;
  Tags: EC2.TagList | undefined;
  BlockDeviceMappings: EC2.InstanceBlockDeviceMappingList | undefined;
  PlatformDetails: string | undefined;
  PrivateIpAddress: string | undefined;
  InstanceId: string | undefined;
  PublicIpAddress: string | undefined;
}

export interface CloudxInfo {
  keyPairId: string;
  privateInstance: PrivateInstanceData;
  publicInstance: PublicInstanceData;
  vpcs?: VPC[];
}

export interface CloudxImage {
  instance: PublicInstanceData;
  db: {
    name: string;
    host: string;
    port: number;
    secretName: string;
    userName: string;
    instanceType: string;
    instanceArn: string;
    multiAZ: boolean;
    storageSize: number;
    storageType: string;
    encrytion: boolean;
    engine: string;
    engineVersion: string;
    tags: Tag[] | undefined;
  },
  bucket: {
    name: string;
  },
  keyPairId: string;
}

interface PublicInstanceData {
  id: string,
  privateIp: string,
  publicIp: string
}

interface PrivateInstanceData {
  id: string,
  privateIp: string,
  publicIp: undefined
}

interface VPC {
  cidrBlock: 'string';
  state: 'string';
  vpcId: string;
  tags: Tag[] | [];
}

interface Tag {
  Key: string;
  Value: string;
}