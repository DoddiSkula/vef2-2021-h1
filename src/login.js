import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { findById } from './user.js';

dotenv.config();

const {
  JWT_SECRET: jwtSecret,
  DATABASE_URL: databaseUrl,
} = process.env;

if (!jwtSecret || !databaseUrl) {
  console.error('Vantar .env gildi');
  process.exit(1);
}

export const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
  usernameField: 'email',
};

async function strat(data, next) {
  const user = await findById(data.id);

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

passport.use(new Strategy(jwtOptions, strat));

export default passport;
