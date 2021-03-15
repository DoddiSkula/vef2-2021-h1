import { promises } from 'fs';
import { queryWNP, query } from './db.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import csv from 'csv-parser'

const path = dirname(fileURLToPath(import.meta.url));
const schemaFile = join(path, '../sql/schema.sql'); // Use npm run setup instead of locally node setup

/* Create tables in database specified (.env) */
async function create() {
  const data = await promises.readFile(schemaFile);
  await queryWNP(data.toString('utf-8'));
}

async function insert(){

  /* INSERT series.csv into shows */
  fs.createReadStream(join(path, '../data/series.csv'))
  .pipe( csv())
  .on( 'data', async (row) => {
    await query(`INSERT INTO shows (show_name, show_aired, inproduction, tagline, show_description, show_language, network, webpage)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [row.name, row.airDate, row.inProduction, row.tagline, row.description, row.language, row.network, row.homepage]); 
  });

  /* INSERT seasons.csv into season */
  fs.createReadStream(join(path, '../data/seasons.csv'))
  .pipe( csv())
  .on( 'data', async (row) => {
    if(row.airDate === "") row.airDate = null;
    await query(`INSERT INTO season (season_name, nr, season_aired, season_description, poster, show_id)
    VALUES ($1, $2, $3, $4, $5, $6)`,
    [row.name, row.number, row.airDate, row.overview, row.poster, row.serieId]);
  });

  /* INSERT episodes.csv into episode */
  fs.createReadStream(join(path, '../data/episodes.csv'))
  .pipe( csv())
  .on( 'data', async (row) => {
    if(row.airDate === "") row.airDate = null;
    await query(`INSERT INTO episode (episode_name, nr, episode_aired, episode_description, season_id, show_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [row.name, row.number, row.airDate, row.overview, row.season, row.serieId]);
  });

}
/* Populates table genre */
let gen = [];
async function genre(){
  fs.createReadStream(join(path, '../data/series.csv'))
  .pipe( csv())
  .on( 'data', (row) => {
    let x = row.genres.split(',');
    for(let i = 0; i < x.length; i++){
      gen.push(x[i]);
    }
  });
  
}

await genre().then(()=>{
  console.log(gen);
});

/*await create().catch((err) => {
  console.error('Error creating schema', err);
});

await insert().catch((err) => {
  console.error('Error creating schema', err);
});
await genre().catch((err) => {
  console.error('Error creating schema', err);
});
*/

