/* eslint-disable import/no-duplicates */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
import { promises } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cloudinary from 'cloudinary';
import fs from 'fs';
import csv from 'csv-parser';
import { queryWNP, query } from './db.js';

cloudinary.config({
  cloud_name: 'oscar6662',
  api_key: '643914147656538',
  api_secret: 't1Q4jzJPmSWUxr_TZDJjEy8twAE',
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

/* Populates genre table */
async function genre() {
  const gen = [];
  fs.createReadStream(join(path, '../data/series.csv'))
    .pipe(csv())
    .on('data', (row) => {
      const x = row.genres.split(',');
      // eslint-disable-next-line no-restricted-syntax
      for (const i in x) {
        if (!gen.includes(x[i])) gen.push(x[i]);
      }
    })
    .on('end', async () => {
      for (const x in gen) {
        await query('INSERT INTO genre (genre_name) VALUES ($1)', [gen[x]]);
      }
    });
}

/* Populates show_genre table */
async function show_genre() {
  const genres = await queryWNP('SELECT * FROM genre');
  const series = await queryWNP('SELECT id, show_name FROM shows');

  fs.createReadStream(join(path, '../data/series.csv'))
    .pipe(csv())
    .on('data', async (row) => {
      const g = row.genres.split(',');
      for (const x in genres.rows) {
        if (g.includes(genres.rows[x].genre_name)) {
          await query(
            'INSERT INTO show_genre (show_name, genre_name) VALUES ($1,$2)',
            [row.name, genres.rows[x].genre_name]
          );
        }
      }
    })
    .on('end', () => {});
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

  await show_genre().catch((err) => {
    console.error('Error creating schema', err);
  });
}

read();
