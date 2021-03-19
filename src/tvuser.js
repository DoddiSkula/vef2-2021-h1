/* eslint-disable camelcase */
import { query } from './db.js';

/* UPDATEs */
export async function updateRate(req, res) {
  const { id } = req.params;
  const { rating } = req.body;

  if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer ranging from 0 to 5.' });
  }

  const q = 'UPDATE info SET rating = $1 WHERE show_id = $2 AND user_id = $3 RETURNING *';
  const result = await query(q, [rating, id, req.user.id]);
  return res.json(result.rows[0]);
}

export async function updateState(req, res) {
  const { id } = req.params;
  const { watch_state } = req.body;

  const states = ['langar að horfa', 'er að horfa', 'hef horft'];

  if (typeof watch_state !== 'string' || !states.includes(watch_state.toLowerCase())) {
    return res.status(400).json({ error: `Watch state must be one of: ${states.join(', ')}` });
  }

  const q = 'UPDATE info SET watch_state = $1 WHERE show_id = $2 AND user_id = $3 RETURNING *';
  const result = await query(q, [watch_state, id, req.user.id]);
  return res.json(result.rows[0]);
}

/* INSERTs */
export async function insertRate(req, res) {
  const { id } = req.params;
  const { rating } = req.body;

  if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer ranging from 0 to 5.' });
  }

  const select = 'SELECT * FROM info WHERE show_id = $1 AND user_id = $2';
  const infoExists = await query(select, [id, req.user.id]);
  if (infoExists.rows[0]) {
    return updateRate(req, res);
  }

  const q = 'INSERT INTO info (show_id, user_id, rating) VALUES ($1,$2,$3) RETURNING *';
  const result = await query(q, [id, req.user.id, rating]);
  return res.json(result.rows[0]);
}

export async function insertState(req, res) {
  const { id } = req.params;
  const { watch_state } = req.body;

  const states = ['langar að horfa', 'er að horfa', 'hef horft'];

  if (typeof watch_state !== 'string' || !states.includes(watch_state.toLowerCase())) {
    return res.status(400).json({ error: `Watch state must be one of: ${states.join(', ')}` });
  }

  const select = 'SELECT * FROM info WHERE show_id = $1 AND user_id = $2';
  const infoExists = await query(select, [id, req.user.id]);
  if (infoExists.rows[0]) {
    return updateState(req, res);
  }

  const q = 'INSERT INTO info (show_id, user_id, watch_state) VALUES ($1,$2,$3) RETURNING *';
  const result = await query(q, [id, req.user.id, watch_state]);
  return res.json(result.rows[0]);
}

/* DELETEs */
export async function deleteRate(req, res) {
  const { id } = req.params;

  const q = 'UPDATE info SET rating = null WHERE show_id = $1 AND user_id = $2';
  try {
    const result = await query(q, [id, req.user.id]);
    return res.json(result.rows[0]);
  } catch (e) {
    return res.status(400).json({ error: 'Could not delete Watch State' });
  }
}

export async function deleteState(req, res) {
  const { id } = req.params;

  const q = 'UPDATE info SET watch_state = null WHERE show_id = $1 AND user_id = $2';
  try {
    const result = await query(q, [id, req.user.id]);
    return res.json(result.rows[0]);
  } catch (e) {
    return res.status(400).json({ error: 'Could not delete Watch State' });
  }
}
