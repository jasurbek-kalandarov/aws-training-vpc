import { expect } from 'chai'
import { getPrivateInstanceData, getPublicInstanceData } from '../utils/getInstanceData';
import { readJsonData } from '../utils/readData';
import { InstancesData, PrivateInstance, PublicInstance } from '../utils/interfaces';

describe.only('Get EC2 public intance metadata', () => {
  let publicInstance: PublicInstance; 
  let privateInstance: PrivateInstance;
  let instancesData: InstancesData;

  before(async () => {
    publicInstance = await getPublicInstanceData();
    privateInstance = await getPrivateInstanceData();
    instancesData = await readJsonData();
  });
  

  it.only('should get public IPv4 address', async () => {
    console.log(publicInstance)
    expect(instancesData.publicInstance.publicIp).equal(publicInstance.PublicIpAddress);
  });
});