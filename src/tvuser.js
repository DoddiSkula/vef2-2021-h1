import express from "express";
import { query } from "./db.js";
import { checkUserIsAdmin } from './user.js';

export async function insertRate(){
  q = `INSERT INTO info (show_id, user_id, rating) VALUES ($1,$2,$3)`;
  //Þórður pls help with getting usr id from token in use :)
  const results = await query(q, [req.params.id, /*here*/, req.body.rating]);
}

export async function insertState(){
  q = `INSERT INTO info (show_id, user_id, watch_state) VALUES ($1,$2,$3)`;
  //Þórður pls help with getting usr id from token in use :)
  const results = await query(q, [req.params.id, /*here*/, req.body.state]);
}