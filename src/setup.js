import { promises } from 'fs';
import { queryWNP, query } from './db.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import csv from 'csv-parser'

const path = dirname(fileURLToPath(import.meta.url));
const schemaFile = join(path, '../sql/schema.sql'); // Use npm run setup instead of locally node setup

async function create() {
  const data = await promises.readFile(schemaFile);
  await queryWNP(data.toString('utf-8'));
}
create().catch((err) => {
  console.error('Error creating schema', err);
});



fs.createReadStream(join(path, '../data/series.csv'))
  .pipe(csv())
  .on('data', (row) => {
    query(`INSERT INTO shows (show_name, show_aired, inproduction, tagline, show_description, show_language, network, webpage)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [row.name, row.airDate, row.inProduction, row.tagline, row.description, row.language, row.network, row.homepage]);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

