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
        designation,
        area,
        department_id,          
        dashboard_access_enabled 
      FROM users
      WHERE user_id = $1
    `, [storedData.user.user_id]); // Use the user_id from storedData

    const user = userRes.rows[0];

    if (!user) {
      // This case should theoretically not happen if storedData.user is valid
      return res.status(404).json({ error: 'User not found after OTP verification.' });
    }

    // Set session data with comprehensive user information
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name, // Also good to include name in session
      designation: user.designation, // Include other relevant fields if used elsewhere
      area: user.area,
      departmentId: user.department_id, // Store department ID in camelCase for frontend
      dashboardAccessEnabled: user.dashboard_access_enabled // Store access status in camelCase
    };

    // Send user data in response to the frontend
    res.json({
      success: true,
      user: { // Ensure this object matches what your UserContext `login` function expects
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        area: user.area,
        departmentId: user.department_id, // Match frontend camelCase expectation
        dashboardAccessEnabled: user.dashboard_access_enabled, // Match frontend camelCase expectation
      },
      redirect: '/dashboard'
    });

  } catch (err) {
    console.error('OTP verification failed:', err); // Log the actual error
    res.status(500).json({ error: 'OTP verification failed. Please restart.' });
  }
});

export default router;