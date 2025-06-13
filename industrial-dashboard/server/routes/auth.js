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

    // Fetch full user details from the database INCLUDING department_id and dashboard_access_enabled
    const userRes = await pool.query(`
      SELECT
        user_id AS id,
        name,
        email,
        role,
        designation,           -- Include designation
        area,
        department_id,         -- Include department_id
        dashboard_access_enabled
      FROM users
      WHERE user_id = $1
    `, [storedData.user.user_id]);

    const user = userRes.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found after OTP verification.' });
    }

    // Set session data with comprehensive user information
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      designation: user.designation, // ADDED: Store designation in session
      area: user.area,
      departmentId: user.department_id,
      dashboardAccessEnabled: user.dashboard_access_enabled
    };

    // Send user data in response to the frontend
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation, // ADDED: Send designation to frontend
        area: user.area,
        departmentId: user.department_id,
        dashboardAccessEnabled: user.dashboard_access_enabled,
      },
      redirect: '/dashboard'
    });

  } catch (err) {
    console.error('OTP verification failed:', err);
    res.status(500).json({ error: 'OTP verification failed. Please restart.' });
  }
});

// ===================== Check Authentication Status =====================
// NEW/UPDATED: This endpoint is crucial for validating session on page refresh/new tabs
router.get('/check-auth', async (req, res) => {
  if (req.session.user) {
    try {
      // Re-fetch full user data to ensure it's fresh and includes all necessary fields
      const userRes = await pool.query(`
        SELECT
          u.user_id AS id,
          u.name,
          u.email,
          u.role,
          u.designation,
          u.area,
          u.department_id,
          u.dashboard_access_enabled,
          d.name as department_name, -- Include department name
          l.name as location_name    -- Include location name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.department_id
        LEFT JOIN locations l ON u.location_id = l.location_id
        WHERE u.user_id = $1
      `, [req.session.user.id]);

      if (userRes.rows.length > 0) {
        // Return comprehensive user object
        res.json(userRes.rows[0]);
      } else {
        // User not found in DB, destroy session
        req.session.destroy(err => {
          if (err) console.error('Session destroy error on check-auth:', err);
          res.status(401).json({ isAuthenticated: false, message: 'User not found.' });
        });
      }
    } catch (err) {
      console.error('Error in check-auth:', err);
      res.status(500).json({ isAuthenticated: false, message: 'Server error during auth check.' });
    }
  } else {
    // Not authenticated
    res.status(401).json({ isAuthenticated: false, message: 'Not authenticated.' });
  }
});

// ===================== Logout =====================
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ success: true, message: 'Logged out successfully' });
  });
});


export default router;