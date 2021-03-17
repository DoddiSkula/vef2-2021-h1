// Main router virkni fyrir /users/..
import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { jwtOptions, requireAuthentication } from './login.js';
import {
  checkUserIsAdmin, comparePasswords, createUser,
  findByEmail, findById, findByUsername, getUser, getUsers, updateUser, updateUserStatus,
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

router.get('/users/me', requireAuthentication, async (req, res) => {
  const result = await getUser(req.user.username);
  return res.json(result);
});

router.patch('/users/me', requireAuthentication, async (req, res) => {
  const { newEmail = null, newPassword = null } = req.body;

  if (newEmail === null && newPassword === null) {
    return res.status(400).json({ error: 'Email and Password have not been changed.' });
  }

  const errors = [];

  if (newPassword !== null) {
    if (!isNotEmptyString(newPassword, { min: 8 })) {
      errors.push({
        field: 'New password',
        error: 'Password must be at least 8 characters.',
      });
    }
  }

  if (newEmail !== null) {
    const emailExists = await findByEmail(newEmail);
    if (emailExists) {
      return res.status(400).json({ error: 'Email exists.' });
    }

    if (!isNotEmptyString(newEmail) || !validateEmail(newEmail)) {
      errors.push({
        field: 'New email',
        error: 'Invalid email address.',
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json(errors);
  }

  const result = await updateUser(req.user.id, newEmail, newPassword);

  let changes;
  if (newEmail && newPassword) {
    changes = 'Email and password have been changed.';
  } else if (newEmail && !isNotEmptyString(newPassword)) {
    changes = 'Email has been changed.';
  } else {
    changes = 'Password has been changed.';
  }
  const message = {
    msg: changes,
  };

  const returnMessage = [];
  returnMessage.push(message, result);

  return res.json(returnMessage);
});

router.get('/users/:id', requireAuthentication, checkUserIsAdmin, async (req, res) => {
  const { id } = req.params;
  const result = await findById(id);
  delete result.password;
  return res.json(result);
});

router.patch('/users/:id', requireAuthentication, checkUserIsAdmin, async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;

  if (isAdmin === null || typeof isAdmin !== 'boolean') {
    return res.status(400).json({ error: 'Admin status must be of type boolean.' });
  }

  if (req.user.id === Number(id)) {
    return res.status(403).json({ error: 'You cannot change your own admin status.' });
  }
  const result = await updateUserStatus(isAdmin, id);
  return res.json(result);
});
