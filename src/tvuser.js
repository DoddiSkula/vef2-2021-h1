/* eslint-disable camelcase */
import express from 'express';
import { query } from './db.js';
import { requireAuthentication } from './login.js';
import { checkUserIsAdmin } from './user.js';

export async function insertRate() {
  const q = 'INSERT INTO info (show_id, user_id, rating) VALUES ($1,$2,$3)';
  // Þórður pls help with getting usr id from token in use :)
  const results = await query(q, [req.params.id /*here*/, , req.body.rating]);
}

export async function insertState() {
  const q = 'INSERT INTO info (show_id, user_id, watch_state) VALUES ($1,$2,$3)';
  // Þórður pls help with getting usr id from token in use :)
  const results = await query(q, [req.params.id /*here*/, , req.body.state]);
}

export async function updateRate(req, res) {
  const { id } = req.params;
  const { rating } = req.body;
  const { userId } = req.user;

  if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer ranging from 0 to 5.' });
  }

  const q = 'UPDATE info SET rating = $1 WHERE show_id = $2 AND user_id = $3 RETURNING *';
  const result = await query(q, [rating, id, userId]);
  return res.json(result.rows[0]);
}

export async function updateState(req, res) {
  const { id } = req.params;
  const { watch_state } = req.body;
  const { userId } = req.user;

  const states = ['langar að horfa', 'er að horfa', 'hef horft'];

  if (typeof watch_state !== 'string' || !states.includes(watch_state.toLowerCase())) {
    return res.status(400).json({ error: `Watch state must be one of: ${states.join(',')}` });
  }

  const q = 'UPDATE info SET watch_state = $1 WHERE show_id = $2 AND user_id = $3 RETURNING *';
  const result = await query(q, [watch_state, id, userId]);
  return res.json(result.rows[0]);
}
