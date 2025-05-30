import express from 'express';
import { pool } from '../db.js';
import bcrypt from 'bcryptjs';

const router = express.Router();
const otpStore = new Map();

// ===================== Email Check =====================
router.post('/check-email', async (req, res) => {
  try {
    const { email, role } = req.body;
    const userRes = await pool.query(
      `SELECT * FROM users 
       WHERE LOWER(email) = LOWER($1) AND role = $2`, // Case-insensitive
      [email.trim(), role]
    );
    
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'Unauthorized email' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Email check failed' });
  }
});

// ===================== Password Check =====================
router.post('/check-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userRes = await pool.query(
      `SELECT * FROM users 
       WHERE LOWER(email) = LOWER($1)`, // Case-insensitive
      [email.trim()]
    );
    
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid password' });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Password check failed' });
  }
});

// ===================== OTP Flow =====================
router.post('/send-otp', async (req, res) => {
  try {
    const { email, role } = req.body;
    
    // Validate user exists
    const userRes = await pool.query(
      `SELECT * FROM users 
       WHERE LOWER(email) = LOWER($1) AND role = $2`,
      [email.trim(), role]
    );
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'Unauthorized email' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      user: user
    });

    console.log(`OTP for ${email}: ${otp}`); // For debugging
    res.json({ success: true, otp });

  } catch (err) {
    res.status(500).json({ error: 'OTP generation failed' });
  }
});

// ===================== OTP Verification =====================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedData = otpStore.get(email.trim());
    
    if (!storedData || storedData.otp !== otp.trim() || Date.now() > storedData.expires) {
      return res.status(401).json({ error: 'Invalid/expired OTP' });
    }

    // Create session
    req.session.user = {
      id: storedData.user.user_id,
      email: storedData.user.email,
      role: storedData.user.role
    };

    otpStore.delete(email);
    res.json({ 
      success: true,
      redirect: storedData.user.role === 'senior' ? '/admin-dashboard' : '/user-dashboard'
    });

  } catch (err) {
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

export default router;
