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
  const { offset = 0, limit = 10 } = req.query;
  const output = { users: {}, links: {} };

  const q = 'SELECT id, username, email, admin FROM users ORDER BY id ASC OFFSET $1 LIMIT $2';
  const results = await query(q, [offset, limit]);
  output.users = results.rows;

  // paging
  const countq = await query('SELECT COUNT(*) AS count FROM users');
  const { count } = countq.rows[0];
  if (count <= limit) {
    return res.json(output);
  }
  if (offset <= 0) {
    output.links.next = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) + 10}&limit=10`;
  } else if (offset >= count) {
    output.links.prev = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) - 10}&limit=10`;
  } else {
    output.links.prev = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) - 10}&limit=10`;
    output.links.next = `${req.protocol}://${req.get('host')}${req.path}?offset=${Number(offset) + 10}&limit=10`;
  }

  return res.json(output);
}

export async function getUser(username) {
  const q = 'SELECT username, email FROM users WHERE username = $1';
  try {
    const result = await query(q, [username]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Could not find user.');
    return null;
  }

  return null;
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
    updates.push(`password='${hashedPassword}'`);
  }

  if (email) {
    updates.push(`email='${email}'`);
  }

  const q = `
  UPDATE users
    SET ${updates.join(', ')}
  WHERE
    id = $1
  RETURNING username, email`;

  const result = await query(q, [id]);

  return result.rows[0];
}

export async function updateUserStatus(isAdmin, id) {
  const q = 'UPDATE users SET admin = $1 WHERE id = $2 RETURNING username, email, admin';
  const result = await query(q, [isAdmin, id]);
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
