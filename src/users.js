// Main router virkni fyrir /users/..
import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { jwtOptions } from './login.js';
import {
  comparePasswords, createUser, findByEmail, findByUsername,
} from './user.js';

dotenv.config();

export const router = express.Router();

const defaultTokenLifeTime = 60 * 60; // 1 klst

const {
  JWT_TOKEN_LIFETIME: tokenLifetime = defaultTokenLifeTime,
} = process.env;

router.post('/users/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await findByEmail(email);
  if (!user) {
    return res.status(400).json({ error: 'Email not found' });
  }

  const rightPassword = await comparePasswords(password, user.password);

  if (rightPassword) {
    const payload = { id: user.id };
    const tokenOptions = { expiresIn: tokenLifetime };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid password' });
});

router.post('/users/register', async (req, res) => {
  const { username, email, password } = req.body;

  const usernameExists = await findByUsername(username);
  if (usernameExists) {
    return res.status(400).json({ error: 'Username exists' });
  }

  const emailExists = await findByEmail(email);
  if (emailExists) {
    return res.status(400).json({ error: 'Email exists' });
  }

  const result = await createUser(username, email, password);

  return res.status(201).json(result);
});
