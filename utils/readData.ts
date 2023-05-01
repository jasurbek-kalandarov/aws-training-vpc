import fs from 'fs/promises';

export async function readJsonData(fileName: 'cloudxinfo' | 'cloudximage' | 'cloudxserverless') {
  const data = await fs.readFile(`./data/${fileName}Data.json`, { encoding: 'utf-8' });
  return JSON.parse(data);
};