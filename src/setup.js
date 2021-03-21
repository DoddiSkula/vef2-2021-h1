import fs, { promises } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cloudinary from 'cloudinary';
import csv from 'csv-parser';
import { queryWNP, query } from './db.js';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const path = dirname(fileURLToPath(import.meta.url));
const schemaFile = join(path, '../sql/schema.sql');

/* Create tables in database specified (.env) */
async function create() {
  const data = await promises.readFile(schemaFile);
  await queryWNP(data.toString('utf-8'));
}
async function insert() {
  /* INSERT series.csv into shows */
  fs.createReadStream(join(path, '../data/series.csv'))
    .pipe(csv())
    .on('data', async (row) => {
      await query(
        `INSERT INTO shows (id, show_name, show_aired, inproduction, tagline, image, show_description, show_language, network, webpage)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          row.id,
          row.name,
          row.airDate,
          row.inProduction,
          row.tagline,
          cloudinary.url(row.image),
          row.description,
          row.language,
          row.network,
          row.homepage,
        ],
      );
    });

  /* INSERT seasons.csv into season */
  fs.createReadStream(join(path, '../data/seasons.csv'))
    .pipe(csv())
    .on('data', async (row) => {
      // eslint-disable-next-line no-param-reassign
      if (row.airDate === '') row.airDate = null;
      await query(
        `INSERT INTO season (season_name, nr, season_aired, season_description, poster, show_id)
    VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          row.name,
          row.number,
          row.airDate,
          row.overview,
          cloudinary.url(row.poster),
          row.serieId,
        ],
      );
    });

  /* INSERT episodes.csv into episode */
  fs.createReadStream(join(path, '../data/episodes.csv'))
    .pipe(csv())
    .on('data', async (row) => {
      // eslint-disable-next-line no-param-reassign
      if (row.airDate === '') { row.airDate = null; }
      await query(
        `INSERT INTO episode (episode_name, nr, episode_aired, episode_description, season_id, show_id)
    VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          row.name,
          row.number,
          row.airDate,
          row.overview,
          row.season,
          row.serieId,
        ],
      );
    });
}

/* Populates genre and show_genre table */
async function genre() {
  const genres = [];
  fs.createReadStream(join(path, '../data/series.csv'))
    .pipe(csv())
    .on('data', (row) => {
      const x = row.genres.split(',');
      // eslint-disable-next-line no-restricted-syntax
      for (const i in x) {
        if (!genres.includes(x[i])) genres.push(x[i]);
      }
    })
    .on('end', async () => {
      for (const x in genres) { // eslint-disable-line
        // eslint-disable-next-line no-await-in-loop
        await query('INSERT INTO genre (genre_name) VALUES ($1)', [genres[x]]);
      }
      fs.createReadStream(join(path, '../data/series.csv'))
        .pipe(csv())
        .on('data', async (row) => {
          const x = row.genres.split(',');
          for (const j in genres) { // eslint-disable-line
            if (x.includes(genres[j])) {
              // eslint-disable-next-line no-await-in-loop
              await query(
                'INSERT INTO show_genre (show_name, genre_name) VALUES ($1,$2)',
                [row.name, genres[j]],
              );
            }
          }
        });
    });
}

async function read() {
  await create().catch((err) => {
    console.error('Error creating schema', err);
  });

  await insert().catch((err) => {
    console.error('Error creating schema', err);
  });

  await genre().catch((err) => {
    console.error('Error creating schema', err);
  });
}

read();
