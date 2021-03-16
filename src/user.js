import bcrypt from 'bcrypt';
import { query } from './db.js';

export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';
  try {
    const result = await query(q, [username]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Could not find user by username.');
    return null;
  }

  return null;
}

export async function findByEmail(email) {
  const q = `
      SELECT
        *
      FROM
        users
      WHERE email = $1`;

  try {
    const result = await query(q, [email]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Could not find user by email.');
    return null;
  }

  return null;
}

export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Could not find user by id.');
  }

  return null;
}

// TODO: útfæra paging
export async function getUsers(req, res) {
  const q = 'SELECT id, username, email, admin FROM users';
  const results = await query(q);
  return res.json(results.rows);
}

export async function createUser(username, email, password, admin = false) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const q = `
      INSERT INTO
        users (username, email, password, admin)
      VALUES
        ($1, $2, $3, $4)
      RETURNING id, username, email, admin`;

  const values = [username, email, hashedPassword, admin];
  const result = await query(q, values);

  return result.rows[0];
}

export async function updateUser(id, email, password) {
  const updates = [];

  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
    updates.push(`password=${hashedPassword}`);
  }

  if (email) {
    updates.push(`email=${email}`);
  }

  const q = `
  UPDATE users
    SET ${updates.join(', ')}
  WHERE
    id = $1
  RETURNING id, username, email, admin`;

  const result = await query(q, [id]);

  return result.rows[0];
}

export function checkUserIsAdmin(req, res, next) {
  if (req.user && req.user.admin) {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden' });
}

export async function comparePasswords(password, hash) {
  const result = await bcrypt.compare(password, hash);
  return result;
}
