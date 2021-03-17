import { roundToNearestMinutes } from "date-fns";
import express from "express";
import { query } from "./db.js";
export const router = express.Router();

router.get("/tv", async (req, res) => {
  const q = "SELECT* FROM shows";
  const results = await query(q);
  return res.json(results.rows);
});

async function findShow(req, res) {
  const show = "SELECT show_name, show_description FROM shows WHERE id = $1";
  const showq = await query(show, [req.params.id]);
  const seasons =
    "SELECT season_name, season_description FROM season WHERE show_id = $1";
  const seasonsq = await query(seasons, [req.params.id]);

  return res.json([showq.rows, seasonsq.rows]);
}
// skoða betur0
async function deleteShow(req, res) {
  const q = "DELETE FROM shows WHERE id = $1";
  try {
    await query(q, [req.params.id]);
    return res.status(204).json(`Þætti nr: ${req.params.id} var eytt`);
  } catch (e) {
    console.error("Could not find show or delete it.");
  }
}

async function insertSeries(req, res) {}

router.get("/tv/:id/season", async (req, res) => {
  const seasons =
    "SELECT season_name, season_description FROM season WHERE show_id = $1";
  const seasonsq = await query(seasons, [req.params.id]);

  return res.json(seasonsq.rows);
});

router.get("/tv/:id/season/:id", async (req, res) => {
  //TODO
});

router.get("/tv/:id/season/:id/episode", async (req, res) => {
  //TODO
});

router.get("/tv/:id/season/:id/episode/:id", async (req, res) => {
  //TODO
});

router.get("/genres", async (req, res) => {
  const q = "SELECT genre_name FROM genre";
  const results = await query(q);
  return res.json(results.rows);
});

router.post("/tv/:id/season");

router.get("/tv/:id", findShow);
router.delete("/tv/:id", deleteShow);

//router.patch("/tv/:id", updateShow);
