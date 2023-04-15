import fs from 'fs/promises';

export async function readJsonData() {
  const data = await fs.readFile('./data/data.json', { encoding: 'utf-8' });
  return JSON.parse(data);
};