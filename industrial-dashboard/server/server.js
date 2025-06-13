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
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true // Crucial for sending/receiving cookies
}));

app.use(express.json());

// Serve static files from /uploads (publicly)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session Configuration - MODIFIED FOR SAME-SITE COOKIE HANDLING ON LOCALHOST
app.use(session({
  store: new PgSessionStore({
    pool: pool,
    tableName: 'sessions', // Must match your table name
    createTableIfMissing: true
  }),
  secret: 'your-strong-secret-key-that-should-be-in-env', // Ideally from process.env
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Prevents client-side JS access to cookie
    secure: false,  // Set to true in production with HTTPS. Keep false for HTTP localhost.
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    // IMPORTANT: For localhost development with different ports (3000 & 5000),
    // 'sameSite: 'lax'` can cause issues with sessions not being sent/received
    // with cross-site requests (like window.open from one localhost port to another).
    // Removing sameSite or setting to 'none' (with secure:true) is often needed.
    // For local HTTP dev, just removing `sameSite` often works more permissively.
    // In production, `sameSite: 'lax'` is recommended for security, or 'none' with HTTPS.
    // sameSite: 'lax' // <--- COMMENTED OUT FOR LOCAL DEV COMPATIBILITY
  }
}));

// Session Validation Middleware
app.use(async (req, res, next) => {
  if (req.session.user?.id) {
    try {
      const user = await pool.query(
        'SELECT * FROM users WHERE user_id = $1',
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
