import express from 'express';
import { query } from './db.js';
export const router = express.Router();

router.get('/tv', async (req, res) => {
  const q = 'SELECT show_name, show_description FROM shows';
  const results = await query(q);
  return res.json(results.rows);
});

router.get('/tv/:id', async (req, res) => {
  const q = 'SELECT show_name, show_description FROM shows WHERE id = $1';
  const results = await query(q, [req.params.id]);
  return res.json(results.rows);
});

router.get('/genres', async (req, res) => {
  const q = 'SELECT genre_name FROM genre';
  const results = await query(q);
  return res.json(results.rows);
});
