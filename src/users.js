// Main router virkni fyrir /users/..
import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { jwtOptions, requireAuthentication } from './login.js';
import {
  checkUserIsAdmin, comparePasswords, createUser, findByEmail, findByUsername, getUsers,
} from './user.js';
import { isNotEmptyString, validateEmail } from './utils.js';

dotenv.config();

export const router = express.Router();

const defaultTokenLifeTime = 60 * 60; // 1 klst

const {
  JWT_TOKEN_LIFETIME: tokenLifetime = defaultTokenLifeTime,
} = process.env;

router.post('/users/register', async (req, res) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!isNotEmptyString(username, { min: 3, max: 32 })) {
    errors.push({
      field: 'username',
      error: 'Username must be at least 3 characters and at most 32 characters.',
    });
  }

  if (!isNotEmptyString(password, { min: 8 })) {
    errors.push({
      field: 'password',
      error: 'Password must be at least 8 characters.',
    });
  }

  if (!isNotEmptyString(email) || !validateEmail(email)) {
    errors.push({
      field: 'email',
      error: 'Invalid email address.',
    });
  }

  if (errors.length > 0) {
    return res.status(400).json(errors);
  }

  const usernameExists = await findByUsername(username);
  if (usernameExists) {
    return res.status(400).json({ error: 'Username exists' });
  }

  const emailExists = await findByEmail(email);
  if (emailExists) {
    return res.status(400).json({ error: 'Email exists' });
  }

  let result;
  try {
    result = await createUser(username, email, password);
  } catch (e) {
    console.error(e);
  }

  return res.status(201).json(result);
});

router.post('/users/login', async (req, res) => {
  const { email, password } = req.body;

  if (!isNotEmptyString(email) || !isNotEmptyString(password)) {
    return res.status(400).json({ error: 'Email or password cannot be empty.' });
  }

  const user = await findByEmail(email);
  if (!user) {
    return res.status(400).json({ error: 'Email not found' });
  }

  const rightPassword = await comparePasswords(password, user.password);

  if (rightPassword) {
    const payload = { id: user.id };
    const tokenOptions = { expiresIn: parseInt(tokenLifetime, 10) };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid password' });
});

router.get('/users', requireAuthentication, checkUserIsAdmin, getUsers);
