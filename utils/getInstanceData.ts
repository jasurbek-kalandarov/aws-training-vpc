import EC2 from 'aws-sdk/clients/ec2';
import { ec2 } from '../aws/sdk';
import { PrivateInstance, PublicInstance } from './interfaces';

export async function getPublicInstanceData(): Promise<PublicInstance> {
  const response: EC2.DescribeInstancesResult = await ec2.describeInstances().promise();

  const {
    InstanceType,
    Tags,
    BlockDeviceMappings,
    PlatformDetails,
    PublicIpAddress
  } = response?.Reservations![1].Instances![0];

  return { InstanceType, Tags, BlockDeviceMappings, PlatformDetails, PublicIpAddress };
}

export async function getPrivateInstanceData(): Promise<PrivateInstance> {
  const response = await ec2.describeInstances().promise();
  const {
    InstanceType,
    Tags,
    BlockDeviceMappings,
    PlatformDetails,
    PrivateIpAddress
  } = response?.Reservations![2].Instances![0];

  return { InstanceType, Tags, BlockDeviceMappings, PlatformDetails, PrivateIpAddress };
}