import { expect } from 'chai';
import { rds, rdsQuery }  from '../aws/sdk';
import { CloudxImage } from '../utils/interfaces';
import { readJsonData } from '../utils/readData';
import { Tag } from '@aws-sdk/client-ec2';

describe.skip('RDS', () => {
     
  describe('Check Database metadata', async () => {
    let AllocatedStorage: number | undefined; 
    let StorageType: string | undefined;
    let StorageEncrypted: boolean | undefined;
    let DBName: string | undefined;
    let TagList: Tag[] | undefined;
    let Engine: string | undefined;
    let EngineVersion: string | undefined;
    let MultiAZ: boolean | undefined;
    let DBInstanceClass: string | undefined;

    let db: CloudxImage['db'];

    before(async () => {
      const response = await rds.describeDBInstances().promise();
      ({ 
        AllocatedStorage, 
        StorageType, 
        StorageEncrypted, 
        DBName, 
        TagList, 
        Engine, 
        EngineVersion, 
        MultiAZ, 
        DBInstanceClass
      } = response.DBInstances![0]);

      ({ db } = await readJsonData('cloudximage'));
    });

    it('DB name is cloudximages', () => {
      expect(db.name).to.equal(DBName);
    });

    it('DB instance type is db.t3.micro', () => {
      expect(db.instanceType).to.equal(DBInstanceClass);
    });
    
    it('DB instance is not available in MultiAZ', () => {
      expect(db.multiAZ).to.equal(MultiAZ);
    });
    
    it('DB storage size is 100 GiB', () => {
      expect(db.storageSize).to.equal(AllocatedStorage);
    });
    
    it('DB storage type is gp2', () => {
      expect(db.storageType).to.equal(StorageType);
    });
    
    it('DB encryption is disabled', () => {
      expect(db.encrytion).to.equal(StorageEncrypted);
    });
    
    it('DB instance has tags', () => {
      expect(db.tags).to.deep.equal(TagList);
    });
    
    it('DB engine type is MySQL', () => {
      expect(db.engine).to.equal(Engine);
    });
    
    it('DB engine version is 8.0.28', () => {
      expect(db.engineVersion).to.equal(EngineVersion);
    });
  });

  describe('Check connection and query to DB', () => {
    let endpoint;
    let db: CloudxImage['db'];

    before(async () => {
      ({ db } = await readJsonData('cloudximage'));
      const response = await rds.describeDBInstances().promise();
      endpoint = response.DBInstances![0].Endpoint?.Address;
      // console.log(response);
    });

    it('should be able to get image by id', async () => {
      const params = {
        awsSecretStoreArn: `${db.secretName}`,
        dbClusterOrInstanceArn: db.instanceArn,
        sqlStatements: `select * from ${db.name}`
      }
      const response = rdsQuery.executeSql(params, (err, data) => {
        if (err) {
          throw new Error(err.message);
        }
        console.log(data);
        return data;
      });
      // console.log(response)
    });
  });
});