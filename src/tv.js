import express from 'express';
import { query } from './db.js';
export const router = express.Router();

router.get('/tv', async (req, res) => {
  const q = 'SELECT show_name, show_description FROM shows';
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
  const seasons = 'SELECT season_name, season_description FROM season WHERE show_id = $1';
  const seasonsq = await query(seasons, [req.params.id]);

  return res.json(seasonsq.rows);
});

router.get('/tv/:id/season/:id', async (req, res) => {
  //TODO
});

router.get('/tv/:id/season/:id/episode', async (req, res) => {
  //TODO
});

router.get('/tv/:id/season/:id/episode/:id', async (req, res) => {
  //TODO
});

router.get('/genres', async (req, res) => {
  const q = 'SELECT genre_name FROM genre';
  const results = await query(q);
  return res.json(results.rows);
});
