/* eslint-disable camelcase */
import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { query, queryWNP } from './db.js';
import { checkUserIsAdmin } from './user.js';
import { requireAuthentication, checkAuthentication } from './login.js';
import {
  insertRate, insertState, updateRate, updateState, deleteRate, deleteState,
} from './tvuser.js';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const router = express.Router();
const upload = multer({ dest: 'data/img/' });

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
    name, aired, inproduction, tagline, show_description, show_language, network, webpage,
  } = req.body;
  cloudinary.uploader.upload(req.file);
  const preQuery = 'SELECT MAX(id) FROM shows';
  const id = await queryWNP(preQuery) + 1;
  const q = 'INSERT INTO shows (id, show_name, show_aired, inproduction, tagline, image, show_description, show_language, network, webpage) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)';
  const r = await query(q, [id, name, aired, inproduction, tagline,
    cloudinary.url(req.file), show_description, show_language, network, webpage]);
  return res.json(r.rows);
}

async function insertSeason(req, res) {
  const {
    name, nr, aired, description,
  } = req.body;

  cloudinary.uploader.upload(req.file);
  const q = 'INSERT INTO season (season_name, nr, season_aired, season_description, poster, show_id) VALUES ($1,$2,$3,$4,$5,$6)';
  const r = await query(q, [name, nr, aired, description, cloudinary.url(req.file), req.params.id]);
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
    tagline = null, show_description = null,
    show_language = null, network = null, webpage = null,
  } = req.body;

  cloudinary.uploader.upload(req.file);
  const {image = null} = cloudinary.url(req.file);

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
  const { offset = 0, limit = 10 } = req.query;
  const output = { shows: {}, links: {} };

  const q = 'SELECT * FROM shows ORDER BY id ASC OFFSET $1 LIMIT $2';
  const results = await query(q, [offset, limit]);
  output.shows = results.rows;

  const countq = await query('SELECT COUNT(*) AS count FROM shows');
  const { count } = countq.rows[0];
  if (count <= limit) {
    return res.json(output);
  }
  if (offset <= 0) {
    output.links.next = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) + 10}&limit=10`;
  } else if (Number(offset) + Number(limit) >= count) {
    output.links.prev = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) - 10}&limit=10`;
  } else {
    output.links.prev = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) - 10}&limit=10`;
    output.links.next = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) + 10}&limit=10`;
  }

  return res.json(output);
});

router.get('/tv/:id', checkAuthentication, async (req, res) => {
  const { id } = req.params;
  const { offset = 0, limit = 10 } = req.query;
  const output = {
    show: {}, genres: {}, seasons: {}, links: {},
  };

  const show = 'SELECT * FROM shows WHERE id = $1';
  const showq = await query(show, [id]);
  output.show = showq.rows;

  const genres = 'SELECT genre_name FROM show_genre WHERE show_name = $1';
  const genresq = await query(genres, [showq.rows[0].show_name]);
  output.genres = genresq.rows;

  const seasons = 'SELECT season_name, season_description FROM season WHERE show_id = $1 ORDER BY id ASC OFFSET $2 LIMIT $3';
  const seasonsq = await query(seasons, [id, offset, limit]);
  output.seasons = seasonsq.rows;

  const countq = await query('SELECT COUNT(*) AS count FROM season WHERE show_id = $1', [id]);
  const { count } = countq.rows[0];

  if (req.user) {
    const info = 'SELECT watch_state, rating FROM info WHERE show_id = $1 AND user_id = $2';
    const infoq = await query(info, [id, req.user.id]);
    if (!infoq.rows[0]) {
      output.userInfo = { watch_state: '', rating: '' };
    } else {
      output.userInfo = infoq.rows;
    }
  }

  if (count <= limit) {
    return res.json(output);
  }

  if (offset <= 0) {
    output.links.next = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) + 10}&limit=10`;
  } else if (Number(offset) + Number(limit) >= count) {
    output.links.prev = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) - 10}&limit=10`;
  } else {
    output.links.prev = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) - 10}&limit=10`;
    output.links.next = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) + 10}&limit=10`;
  }

  return res.json(output);
});

router.get('/tv/:id/season', async (req, res) => {
  const { id } = req.params;
  const { offset = 0, limit = 10 } = req.query;
  const output = { seasons: {}, links: {} };

  const seasons = 'SELECT * FROM season WHERE show_id = $1 ORDER BY nr ASC OFFSET $2 LIMIT $3';
  const seasonsq = await query(seasons, [id, offset, limit]);
  output.seasons = seasonsq.rows;

  const countq = await query('SELECT COUNT(*) AS count FROM season WHERE show_id = $1', [id]);
  const { count } = countq.rows[0];

  if (count <= limit) {
    return res.json(output);
  }

  if (offset <= 0) {
    output.links.next = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) + 10}&limit=10`;
  } else if (Number(offset) + Number(limit) >= count) {
    output.links.prev = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) - 10}&limit=10`;
  } else {
    output.links.prev = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) - 10}&limit=10`;
    output.links.next = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) + 10}&limit=10`;
  }

  return res.json(output);
});

router.get('/tv/:id/season/:sid', async (req, res) => {
  const { id } = req.params;
  const { sid } = req.params;
  const { offset = 0, limit = 10 } = req.query;
  const output = { season: {}, episodes: {}, links: {} };

  const season = 'SELECT * FROM season WHERE show_id = $1 AND nr = $2 ORDER BY nr ASC';
  const seasonq = await query(season, [id, sid]);
  output.season = seasonq.rows;
  const episodes = 'SELECT * FROM episode WHERE show_id = $1 and season_id = $2 ORDER BY nr ASC OFFSET $3 LIMIT $4';
  const episodesq = await query(episodes, [id, sid, offset, limit]);
  output.episodes = episodesq.rows;

  const countq = await query('SELECT COUNT(*) AS count FROM episode WHERE show_id = $1 and season_id = $2', [id, sid]);
  const { count } = countq.rows[0];

  if (count <= limit) {
    return res.json(output);
  }

  if (offset <= 0) {
    output.links.next = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) + 10}&limit=10`;
  } else if (Number(offset) + Number(limit) >= count) {
    output.links.prev = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) - 10}&limit=10`;
  } else {
    output.links.prev = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) - 10}&limit=10`;
    output.links.next = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) + 10}&limit=10`;
  }

  return res.json(output);
});

router.get('/tv/:id/season/:sid/episode/:eid', async (req, res) => {
  const episode = 'SELECT * FROM episode WHERE show_id = $1 and season_id = $2 and nr = $3';
  const episodeq = await query(episode, [req.params.id, req.params.sid, req.params.eid]);

  return res.json(episodeq.rows);
});

router.get('/genres', async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  const output = { genres: {}, links: {} };
  const q = 'SELECT genre_name FROM genre ORDER BY id ASC OFFSET $1 LIMIT $2';
  const results = await query(q, [offset, limit]);
  output.genres = results.rows;

  const countq = await query('SELECT COUNT(*) AS count FROM genre');
  const { count } = countq.rows[0];

  if (count <= limit) {
    return res.json(output);
  }

  if (offset <= 0) {
    output.links.next = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) + 10}&limit=10`;
  } else if (Number(offset) + Number(limit) >= count) {
    output.links.prev = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) - 10}&limit=10`;
  } else {
    output.links.prev = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) - 10}&limit=10`;
    output.links.next = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) + 10}&limit=10`;
  }

  return res.json(output);
});

/* POSTs */
router.post('/tv', upload.single('image'), requireAuthentication, checkUserIsAdmin, insertShow);
router.post('/tv/:id/season', upload.single('image'), requireAuthentication, checkUserIsAdmin, insertSeason);
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
router.patch('/tv/:id', upload.single('image'), requireAuthentication, checkUserIsAdmin, updateShow);
router.patch('/tv/:id/rate', requireAuthentication, updateRate);
router.patch('/tv/:id/state', requireAuthentication, updateState);
