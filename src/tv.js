/* eslint-disable camelcase */
import { roundToNearestMinutes } from 'date-fns';
import express from 'express';
import cloudinary from 'cloudinary';
import { query } from './db.js';
import { checkUserIsAdmin } from './user.js';
import { requireAuthentication } from './login.js';
import {
  insertRate, insertState, updateRate, updateState, deleteRate, deleteState
} from './tvuser.js';

export const router = express.Router();

/* FUNCTIONS */

/* DELETEs */
async function deleteShow(req, res) {
  const q = 'DELETE FROM shows WHERE id = $1';
  try {
    await query(q, [req.params.id]);
    return res.status(204).json(`Þætti nr: ${req.params.id} var eytt`);
  } catch (e) {
    return res.status(400).json({ error: 'Could not delete Show' });
  }
}

async function deleteSeason(req, res) {
  const q = 'DELETE FROM season WHERE show_id = $1 and nr = $2';
  try {
    await query(q, [req.params.id, req.params.sid]);
    return res.status(204).json(`Season nr: ${req.params.sid} var eytt`);
  } catch (e) {
    return res.status(400).json({ error: 'Could not delete Season' });
  }
}

async function deleteEpisode(req, res) {
  const q = 'DELETE FROM episode WHERE show_id = $1 and season_id = $2 and nr = $3';
  try {
    await query(q, [req.params.id, req.params.sid, req.params.eid]);
    return res.status(204).json(`Þætti nr: ${req.params.eid} var eytt`);
  } catch (e) {
    return res.status(400).json({ error: 'Could not delete Episode' });
  }
}

/* INSERTs */
async function insertShow(req, res) {
  const {
    name, aired, inproduction, tagline, image, show_description, show_language, network, webpage,
  } = req.body;
  const preQuery = 'SELECT MAX(id) FROM shows';
  const id = await queryWNP(preQuery) + 1;

  //Discuss how to deal with images...
  const q = 'INSERT INTO shows (id, show_name, show_aired, inproduction, tagline, image, show_description, show_language, network, webpage) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)';
  const r = await query(q, [id, name, aired, inproduction, tagline,
    image, show_description, show_language, network, webpage]);
  return res.json(r.rows);
}

async function insertSeason(req, res) {
  const {
    name, nr, aired, description, poster,
  } = req.body;
  const q = 'INSERT INTO season (season_name, nr, season_aired, season_description, poster, show_id) VALUES ($1,$2,$3,$4,$5,$6)';
  const r = await query(q, [name, nr, aired, description, poster, req.params.id ]);
  return res.json(r.rows);
}

async function insertEpisode(req, res) {
  const {
    name, nr, aired, description,
  } = req.body;
  const q = 'INSERT INTO episode (episode_name, nr, episode_aired, episode_description, season_id, show_id) VALUES ($1,$2,$3,$4,$5,$6)';
  const r = await query(q, [name, nr, aired, description, req.params.sid, req.params.id]);
  return res.json(r.rows);
}

async function insertGenre(req, res) {
  const { name } = req.body;
  const q = 'INSERT INTO genre (genre_name) VALUES ($1)';
  const r = await query(q, [name]);
  return res.json(r.rows);
}

/* UPDATEs */
async function updateShow(req, res) {
  const { id } = req.params;

  const {
    show_name = null, show_aired = null, inproduction = null,
    tagline = null, image = null, show_description = null,
    show_language = null, network = null, webpage = null,
  } = req.body;

  const values = [];
  values.push({ column: 'show_name', val: show_name }, { column: 'show_aired', val: show_aired }, { column: 'inproduction', val: inproduction },
    { column: 'tagline', val: tagline }, { column: 'image', val: image }, { column: 'show_description', val: show_description },
    { column: 'show_language', val: show_language }, { column: 'network', val: network }, { column: 'webpage', val: webpage });

  const updates = [];
  values.forEach((value) => {
    if (value.val) {
      updates.push(`${value.column}='${value.val}'`);
    }
  });

  const q = `
    UPDATE shows
    SET ${updates.join(', ')}
    WHERE
    id = $1
    RETURNING *
    `;

  const result = await query(q, [id]);

  return res.json(result.rows[0]);
}

/* ROUTING */
/* GETs */
router.get('/tv', async (req, res) => {
  const q = 'SELECT* FROM shows';
  const results = await query(q);
  return res.json(results.rows);
});

router.get('/tv/:id', async (req, res) => {
  const show = 'SELECT show_name, show_description FROM shows WHERE id = $1';
  const showq = await query(show, [req.params.id]);
  const seasons = 'SELECT season_name, season_description FROM season WHERE show_id = $1';
  const seasonsq = await query(seasons, [req.params.id]);

  return res.json([showq.rows, seasonsq.rows]);
});
  
router.get('/tv/:id/season', async (req, res) => {
  const seasons = 'SELECT* FROM season WHERE show_id = $1';
  const seasonsq = await query(seasons, [req.params.id]);

  return res.json(seasonsq.rows);
});

router.get('/tv/:id/season/:sid', async (req, res) => {
  const season = 'SELECT season_name, season_description FROM season WHERE show_id = $1';
  const seasonq = await query(season, [req.params.id]);
  const episodes =
    'SELECT* FROM episode WHERE show_id = $1 and season_id = $2';
  const episodesq = await query(episodes, [req.params.id, req.params.sid]);

  return res.json([seasonq.rows, episodesq.rows]);
});

router.get('/tv/:id/season/:sid/episode/:eid', async (req, res) => {
  const episode = 'SELECT* FROM episode WHERE show_id = $1 and season_id = $2 and nr = $3';
  const episodeq = await query(episode, [req.params.id, req.params.sid, req.params.eid]);

  return res.json(episodeq.rows);
});

router.get('/genres', async (req, res) => {
  const q = 'SELECT genre_name FROM genre';
  const results = await query(q);
  return res.json(results.rows);
});

/* POSTs */
router.post('/tv', requireAuthentication, checkUserIsAdmin, insertShow);
router.post('/tv/:id/season', requireAuthentication, checkUserIsAdmin, insertSeason);
router.post('/tv/:id/season/:sid/episode', requireAuthentication, checkUserIsAdmin, insertEpisode);
router.post('/genres', requireAuthentication, checkUserIsAdmin, insertGenre);

router.post('/tv/:id/rate', requireAuthentication, insertRate);
router.post('/tv/:id/state', requireAuthentication, insertState);

/* DELETEs */
router.delete('/tv/:id/season/:sid', requireAuthentication, checkUserIsAdmin, deleteShow);
router.delete('/tv/:id', requireAuthentication, checkUserIsAdmin, deleteSeason);
router.delete('/tv/:id/season/:sid/episode/:eid', requireAuthentication, checkUserIsAdmin, deleteEpisode);

router.delete('/tv/:id/rate', requireAuthentication, deleteRate);
router.delete('/tv/:id/state', requireAuthentication, deleteState);

/* PATCHs */
router.patch('/tv/:id', requireAuthentication, checkUserIsAdmin, updateShow);
router.patch('/tv/:id/rate', requireAuthentication, updateRate);
router.patch('/tv/:id/state', requireAuthentication, updateState);
