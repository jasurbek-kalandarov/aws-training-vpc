import fs from 'fs';
import FormData from "form-data";
import { expect } from 'chai';
import { rds }  from '../aws/sdk';
import { CloudxImage, Image } from '../utils/interfaces';
import { readJsonData } from '../utils/readData';
import { Tag } from '@aws-sdk/client-ec2';
import { myDb } from '../db/mysql';
import { RequestBuilder } from '../utils/request-configs';
import httpRequest from '../utils/httpRequester';

describe('RDS', () => {
     
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
    let requestConfig: RequestBuilder;

    before(async () => {
      requestConfig = new RequestBuilder();
      const data = new FormData();
      data.append('upfile', fs.createReadStream('./screenshots/test report.jpg'));
  
      requestConfig
        .setUrl('/image')
        .setMethod("post")
        .setData(data)
        .setHeaders("multipart/form-data");
  
      const resp = await httpRequest(requestConfig);
      expect(resp.status).to.equal(204);
    });

    beforeEach(() => {
      requestConfig = new RequestBuilder();
    });

    it('should be able to get image by id', async () => {
      const expectedImageId = 1
      const [ data ] = await myDb.select('*').from('images').where({ id: expectedImageId }) as Image[];
      expect(expectedImageId).to.equal(data.id);
    });

    it('should have image metada', async () => {
      requestConfig
        .setUrl('/image/1')
        .setMethod("get")
        .setHeaders("application/json");

      const { data: image1 } = await httpRequest<Image>(requestConfig);
      let [ data ] = await myDb.select('*').from('images').where({ id: 1 }) as Image[];
      
      const expectedKeys = [
        'id' as keyof Image, 
        'object_key' as keyof Image, 
        'object_size' as keyof Image, 
        'object_type' as keyof Image
      ];

      expectedKeys.forEach(key => {
        expect(image1[key]).to.equal(data[key]);
      });
    });

    it('The image metadata for the deleted image is also deleted from the database', async () => {
      requestConfig
        .setUrl('/image')
        .setMethod("get")
        .setHeaders("application/json");

      const {data: allImages} = await httpRequest<Image[]>(requestConfig);
      const lastImageId = allImages[allImages.length - 1].id;

      requestConfig
        .setUrl(`/image/${lastImageId}`)
        .setMethod("delete")
        .setHeaders("application/json");

      const deleteResponse = await httpRequest(requestConfig);
      expect(deleteResponse.status).to.equal(204);

      const deletedImage = await myDb.select('*').from('images').where({ id: lastImageId });
      expect(deletedImage).to.be.empty;
    });

  });
});