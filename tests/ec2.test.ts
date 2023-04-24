import { expect } from 'chai'
import { 
  getPrivateInstanceData, 
  getPublicInstanceData, 
  readJsonData
} from '../utils/index';
import { CloudxInfo, PrivateInstance, PublicInstance } from '../utils/interfaces';

describe('Public Intance', () => {
  let publicInstance: PublicInstance; 
  let instancesData: CloudxInfo;

  before(async () => {
    publicInstance = await getPublicInstanceData();
    instancesData = await readJsonData('cloudxinfo');
  });
  
  it('should have instance id', async () => {
    expect(instancesData.publicInstance.id).to.equal(publicInstance.InstanceId);
  });

  it('should get public IPv4 address', async () => {
    expect(instancesData.publicInstance.publicIp).equal(publicInstance.PublicIpAddress);
  });

  it('should get cloudx tags from instance',async () => {
    const expectedTags = [
      { Key: 'Name', Value: 'cloudxinfo/PublicInstance/Instance' },
      { Key: 'cloudx', Value: 'qa' }
    ];

    expectedTags.forEach(tag => {
      expect(publicInstance.Tags).to.deep.include(tag);
    });
  });

  it('should have Linux OS', async () => {
    expect(publicInstance.PlatformDetails).to.include('Linux');
  });
});

describe('Private Instance', () => {
  let privateInstance: PrivateInstance;
  let instancesData: CloudxInfo;
  
  before(async () => {
    privateInstance = await getPrivateInstanceData();
    instancesData = await readJsonData('cloudxinfo');
  });

  it('should have instance id', async () => {
    expect(instancesData.privateInstance.id).to.equal(privateInstance.InstanceId);
  });

  it('should get private IPv4 address', async () => {
    expect(instancesData.privateInstance.privateIp).equal(privateInstance.PrivateIpAddress);
  });

  it('should not have public IPv4 address', async () => {
    expect(privateInstance.PublicIpAddress).to.be.undefined;
  });

  it('should get cloudx tags from instance',async () => {
    const expectedTags = [
      { Key: 'Name', Value: 'cloudxinfo/PrivateInstance/Instance' },
      { Key: 'cloudx', Value: 'qa' }
    ];

    expectedTags.forEach(tag => {
      expect(privateInstance.Tags).to.deep.include(tag);
    });
  });

  it('should have Linux OS', async () => {
    expect(privateInstance.PlatformDetails).to.include('Linux');
  });
});