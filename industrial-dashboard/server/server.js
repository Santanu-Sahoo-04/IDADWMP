import express from 'express';
import session from 'express-session';
import cors from 'cors';
import pgSession from 'connect-pg-simple';
import authRouter from './routes/auth.js';
import { pool } from './db.js';

const app = express();

// Security headers
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-store');
  res.header('Pragma', 'no-cache');
  res.header('Strict-Transport-Security', 'max-age=31536000');
  next();
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Session config
const PgSession = pgSession(session);
app.use(session({
  store: new PgSession({ pool, tableName: 'session' }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400000,
    sameSite: 'lax'
  }
}));

app.use('/api/auth', authRouter);

// Session validation middleware
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
      if (user.rowCount === 0) req.session.destroy();
    } catch (err) {
      console.error('Session validation error:', err);
    }
  }
  next();
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



/*
import express from 'express';
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';
import cors from 'cors';
import { Database } from 'better-sqlite3';
import authRouter from './routes/auth.js';

const app = express();

// Database setup
const db = new Database('./database.db');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Session configuration
const SQLiteSessionStore = SQLiteStore(session);
app.use(session({
  store: new SQLiteSessionStore({
    db: 'sessions.db',
    dir: './'
  }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'lax'
  }
}));

// Attach database to request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/api/auth', authRouter);

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/