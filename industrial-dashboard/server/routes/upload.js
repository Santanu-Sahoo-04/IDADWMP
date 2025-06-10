import express from 'express';
import multer from 'multer';
import { pool } from '../db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Upload CSV file
router.post('/csv', upload.single('csvFile'), async (req, res) => {
  try {
    // Check if user is senior
    if (!req.session.user || req.session.user.role !== 'senior') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Senior management only.' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Create uploads table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        upload_id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        uploaded_by INT REFERENCES users(user_id),
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'success',
        records_processed INT DEFAULT 0
      );
    `);

    // Read and count CSV records (basic processing)
    const csvContent = fs.readFileSync(req.file.path, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const recordsProcessed = Math.max(0, lines.length - 1); // Subtract header

    // Store upload record
    await pool.query(`
      INSERT INTO file_uploads 
        (filename, original_name, file_path, uploaded_by, records_processed)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.session.user.id,
      recordsProcessed
    ]);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      recordsProcessed
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed' 
    });
  }
});

// Get upload history
router.get('/history', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(`
      SELECT 
        filename, 
        original_name, 
        upload_date, 
        status, 
        records_processed,
        uploaded_by
      FROM file_uploads
      ORDER BY upload_date DESC
      LIMIT 10
    `);

    // Attach a direct file view link for each entry
    const uploads = result.rows.map(row => ({
      ...row,
      viewUrl: `/uploads/${encodeURIComponent(row.filename)}` // Changed
    }));

    res.json(uploads);
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});



router.delete('/file/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename); // Absolute path
    console.log('Trying to delete:', filePath); // Add this line

    // Verify user is senior
    if (!req.session.user || req.session.user.role !== 'senior') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete from database first
    await pool.query('DELETE FROM file_uploads WHERE filename = $1', [filename]);

    // Delete file from disk
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('File deletion error:', err);
        return res.status(500).json({ error: 'File deletion failed' });
      }
      res.json({ success: true, message: 'File deleted' });
    });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Deletion failed' });
  }
});
router.delete('/file/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename); // Absolute path

    // Verify user is senior
    if (!req.session.user || req.session.user.role !== 'senior') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete from database first
    await pool.query('DELETE FROM file_uploads WHERE filename = $1', [filename]);

    // Delete file from disk
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('File deletion error:', err);
        return res.status(500).json({ error: 'File deletion failed' });
      }
      res.json({ success: true, message: 'File deleted' });
    });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Deletion failed' });
  }
});


router.put('/file/:filename', upload.single('csvFile'), async (req, res) => {
  try { // <-- Add this
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Only allow senior users to edit
    if (!req.session.user || req.session.user.role !== 'senior') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Overwrite the file
    fs.rename(req.file.path, filePath, (err) => {
      if (err) {
        console.error('File update error:', err);
        return res.status(500).json({ error: 'File update failed' });
      }
      // Update database record if needed
      pool.query(
        'UPDATE file_uploads SET upload_date = NOW() WHERE filename = $1',
        [filename]
      );
      res.json({ success: true, message: 'File updated' });
    });

  } catch (err) { // <-- Now properly paired with try
    console.error('Update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});



export default router;