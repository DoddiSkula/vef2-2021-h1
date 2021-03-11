import { promises } from 'fs';
import { queryWNP } from './db.js';

const schemaFile = './sql/schema.sql'; // þurfti að breytar úr ../sql/ í ./sql/ til að virki hjá mér!

async function create() {
  const data = await promises.readFile(schemaFile);
  await queryWNP(data.toString('utf-8'));
}

create().catch((err) => {
  console.error('Error creating schema', err);
});
