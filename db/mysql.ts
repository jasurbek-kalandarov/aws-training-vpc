import fs from 'fs';
import { knex } from 'knex';
import { CloudxImage } from '../utils/interfaces';

let db: CloudxImage['db'];

const connectionData = fs.readFileSync('./data/cloudximageData.json', { encoding:"utf-8"});
({db} = JSON.parse(connectionData));

const myDb = knex({
  client: 'mysql2',
  connection: {
    host : '127.0.0.1',
    port : 3306,
    user : `${db.userName}`,
    password : `${db.password}`,
    database : `${db.name}`
  },
});

export { myDb };

