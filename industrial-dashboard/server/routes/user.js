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
        l.name as location_name,
        u.department_id,
        u.dashboard_access_enabled
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

// NEW ROUTE: Get all departments (for CMD's upload page dropdown)
router.get('/departments', async (req, res) => {
  try {
    // Only seniors or CMD should be able to fetch all departments like this
    if (!req.session.user || req.session.user.role !== 'senior') {
      return res.status(403).json({ error: 'Access denied. Senior management only.' });
    }
    const result = await pool.query('SELECT department_id, name FROM departments ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Toggle junior dashboard access
router.put('/toggle-dashboard-access', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'senior') {
      return res.status(403).json({ error: 'Access denied. Senior management only.' });
    }

    const { juniorUserId, isEnabled } = req.body;

    const juniorCheckRes = await pool.query(
      'SELECT user_id FROM users WHERE user_id = $1 AND role = \'junior\'',
      [juniorUserId]
    );

    if (juniorCheckRes.rows.length === 0) {
      return res.status(404).json({ error: 'Junior user not found or not a junior.' });
    }

    await pool.query(
      'UPDATE users SET dashboard_access_enabled = $1 WHERE user_id = $2',
      [isEnabled, juniorUserId]
    );

    res.json({ success: true, message: 'Junior dashboard access updated for specific user.' });

  } catch (err) {
    console.error('Failed to toggle dashboard access:', err);
    res.status(500).json({ error: 'Failed to update dashboard access.' });
  }
});

// Fetch juniors for a senior (CMD sees all, others see their department)
router.get('/juniors-for-senior', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'senior') {
      return res.status(403).json({ error: 'Access denied. Senior management only.' });
    }

    const seniorUserId = req.session.user.id;
    const seniorUserDesignation = req.session.user.designation; // Get designation from session

    let juniorsRes;

    // Exception for CMD: If the logged-in senior is the CMD, fetch all juniors
    if (seniorUserDesignation && seniorUserDesignation.toLowerCase() === 'cmd') {
      juniorsRes = await pool.query(`
        SELECT
          user_id,
          name,
          email,
          designation,
          dashboard_access_enabled,
          department_id -- Include department_id for frontend display
        FROM users
        WHERE role = 'junior'
        ORDER BY department_id, name;
      `);
    } else {
      // For all other seniors, filter by their department
      const seniorDeptRes = await pool.query(
        'SELECT department_id FROM users WHERE user_id = $1',
        [seniorUserId]
      );

      if (seniorDeptRes.rows.length === 0) {
        return res.status(404).json({ error: 'Senior user not found.' });
      }

      const seniorDepartmentId = seniorDeptRes.rows[0].department_id;

      // Fetch juniors belonging to the same department as the senior
      juniorsRes = await pool.query(`
        SELECT
          user_id,
          name,
          email,
          designation,
          dashboard_access_enabled,
          department_id -- Include department_id for frontend display
        FROM users
        WHERE role = 'junior' AND department_id = $1
        ORDER BY name;
      `, [seniorDepartmentId]);
    }

    res.json(juniorsRes.rows);

  } catch (err) {
    console.error('Failed to fetch juniors for senior:', err);
    res.status(500).json({ error: 'Failed to fetch junior users.' });
  }
});

export default router;