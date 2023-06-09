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
  db: Database,
  bucket: {
    name: string;
  },
  keyPairId: string;
  sns: {
    topicArn: string;
  }
  sqs: {
    queueUrl: string;
  }
}

interface Database {
  name: string;
  host: string;
  port: number;
  secretName: string;
  password: string;
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

export interface Image {
  id: number;
  object_key: string;
  object_type: string;
  last_modified: string;
  object_size: number;
}

export interface TopicArn {
  TopicArn: string;
}

export interface CloudxServerless extends CloudxImage {
  lambda: {
    functionName: string;
    arn: string;
  }
}