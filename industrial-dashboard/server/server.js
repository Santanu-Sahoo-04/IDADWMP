import express from 'express';
import session from 'express-session';
import cors from 'cors';
import pgSession from 'connect-pg-simple';
import { pool } from './db.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import uploadRouter from './routes/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PgSessionStore = pgSession(session);



// Security Headers
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.header('Pragma', 'no-cache');
  next();
});

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Session Configuration
app.use(session({
  store: new PgSessionStore({
    pool: pool,
    tableName: 'sessions', // Must match your table name
    createTableIfMissing: true
  }),
  secret: 'your-strong-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    sameSite: 'lax'
  }
}));

// Serve static files from /uploads (publicly)
app.use('/uploads', express.static('uploads')); 
//app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session Validation Middleware
app.use(async (req, res, next) => {
  if (req.session.user?.id) {
    try {
      const user = await pool.query(
        'SELECT * FROM users WHERE user_id = $1', // Changed to user_id
        [req.session.user.id]
      );
      if (user.rowCount === 0) {
        req.session.destroy(err => {
          if (err) console.error('Session destruction error:', err);
        });
      }
    } catch (err) {
      console.error('Session validation error:', err);
    }
  }
  next();
});

//ROUTES
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/upload', uploadRouter);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//app.use('/uploads', express.static('uploads'));
//app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
