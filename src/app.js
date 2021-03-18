import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { readFile } from 'fs';
import express from 'express';
import dotenv from 'dotenv';
import passport from './login.js';
import { router as tvRouter } from './tv.js';
import { router as userRouter } from './users.js';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const path = dirname(fileURLToPath(import.meta.url));
const readFileAsync = promisify(readFile);

const app = express();

app.use(express.json());
app.use(passport.initialize());

app.use(tvRouter);
app.use(userRouter);

// Birtir listi.json á '/'
app.get('/', async (req, res) => {
  const pathToList = join(path, '../listi.json');
  let list;
  try {
    const data = await readFileAsync(pathToList);
    list = JSON.parse(data);
  } catch (e) {
    console.error('error', e);
  }
  res.json(list);
});

/**
 * Middleware sem sér um 404 villur.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 */
// eslint-disable-next-line no-unused-vars
function notFoundHandler(req, res, next) {
  res.status(404).json({ error: 'Not found' });
}

/**
 * Middleware sem sér um villumeðhöndlun.
 *
 * @param {object} err Villa sem kom upp
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
