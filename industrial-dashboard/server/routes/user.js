import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Get user profile details
router.get('/profile', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userRes = await pool.query(`
      SELECT 
        u.user_id, u.name, u.email, u.role, u.designation, u.area,
        d.name as department_name,
        l.name as location_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN locations l ON u.location_id = l.location_id
      WHERE u.user_id = $1
    `, [req.session.user.id]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userRes.rows[0]);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
