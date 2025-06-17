// backend/routes/upload.js
import express from 'express';
import multer from 'multer';
import { pool } from '../db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid'; // CRITICAL: Ensure this is imported for UUID generation

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const allowedMimeTypes = [
  'text/csv',
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  // Generate truly unique filenames using UUID here as well
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`; // e.g., 'a1b2c3d4-e5f6-7890-1234-567890abcdef.csv'
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and XLSX files are allowed'), false);
    }
  }
});

const logFileAction = async (client, fileId, actionType, actionByUserId, actionByDeptId, targetDeptId, details, approvalActionBy = null, notes = null, pendingFileId = null) => {
  try {
    await client.query(`
      INSERT INTO file_actions_log
        (file_id, action_type, action_by, action_by_department_id, target_department_id, details, approval_action_by, notes, pending_file_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [fileId, actionType, actionByUserId, actionByDeptId, targetDeptId, details, approvalActionBy, notes, pendingFileId]);
    console.log(`[LOG_ACTION] Successfully logged action: ${actionType} for file ID: ${fileId}`);
  } catch (logErr) {
    console.error('Failed to log file action:', logErr);
    throw logErr;
  }
};

// =======================================================
// ROUTES FOR FILE OPERATIONS
// =======================================================

router.post('/file', upload.single('dataFile'), async (req, res) => {
  const client = await pool.connect();
  let uploaderDesignation = null;
  let uploaderDeptId = null;
  let userId = null;
  try {
    await client.query('BEGIN');

    if (!req.session.user || req.session.user.role !== 'senior') {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Senior management only.'
      });
    }

    // Capture user details immediately after session check
    userId = req.session.user.id;
    uploaderDeptId = req.session.user.departmentId;
    uploaderDesignation = req.session.user.designation;

    if (!req.file) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const isCMD = uploaderDesignation && uploaderDesignation.toLowerCase() === 'cmd';

    let targetDepartmentId = uploaderDeptId;
    if (isCMD && req.body.targetDepartmentId) {
        targetDepartmentId = parseInt(req.body.targetDepartmentId, 10);
        const deptCheck = await client.query('SELECT department_id FROM departments WHERE department_id = $1', [targetDepartmentId]);
        if (deptCheck.rowCount === 0) {
            fs.unlinkSync(req.file.path);
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Invalid target department specified by CMD.' });
        }
    } else if (!isCMD && req.body.targetDepartmentId && parseInt(req.body.targetDepartmentId, 10) !== uploaderDeptId) {
        fs.unlinkSync(req.file.path);
        await client.query('ROLLBACK');
        return res.status(403).json({ success: false, message: 'Non-CMD seniors can only upload files to their own department.' });
    } else if (isCMD && !req.body.targetDepartmentId) {
        fs.unlinkSync(req.file.path);
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'CMD must specify a target department for the file.' });
    }

    const recordsProcessed = 0;

    const uploadRes = await client.query(`
      INSERT INTO file_uploads
        (filename, original_name, file_path, uploaded_by, records_processed, department_id, status, approval_status, parent_file_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING upload_id;
    `, [
      req.file.filename,
      req.file.originalname, // This should contain the original extension (e.g., "my_report.csv")
      req.file.path,
      userId,
      recordsProcessed,
      targetDepartmentId,
      'active',
      'approved',
      null
    ]);
    const uploadedFileId = uploadRes.rows[0].upload_id;

    await logFileAction(
      client,
      uploadedFileId,
      'upload',
      userId,
      uploaderDeptId,
      targetDepartmentId,
      {
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_mimetype: req.file.mimetype,
        uploaded_by_name: req.session.user.name,
        uploaded_by_designation: uploaderDesignation,
      }
    );

    await client.query('COMMIT');
    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileId: uploadedFileId,
      filename: req.file.filename
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Upload error:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Failed to delete partially uploaded file:', unlinkErr);
      });
    }
    res.status(500).json({
      success: false,
      message: err.message || 'Upload failed'
    });
  } finally {
    client.release();
  }
});

router.get('/files', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userId = req.session.user.id;
    const userRole = req.session.user.role;
    const userDesignation = req.session.user.designation;
    const userDepartmentId = req.session.user.departmentId;

    const isCMD = userDesignation && userDesignation.toLowerCase() === 'cmd';

    let query = `
      SELECT
        fu.upload_id,
        fu.filename,
        fu.original_name,
        fu.upload_date,
        fu.status,
        fu.records_processed,
        fu.uploaded_by,
        fu.department_id,
        fu.approval_status,
        fu.parent_file_id,
        u.name as uploader_name,
        d.name as department_name,
        (SELECT COUNT(*) FROM file_uploads WHERE parent_file_id = fu.upload_id AND status = 'pending_edit') > 0 AS has_pending_edit
      FROM file_uploads fu
      JOIN users u ON fu.uploaded_by = u.user_id
      JOIN departments d ON fu.department_id = d.department_id
      WHERE (fu.status = 'active' OR fu.status = 'pending_edit')
    `;
    const queryParams = [];

    if (isCMD) {
      // CMD sees all files
    }
    else if (userRole === 'senior') {
      query += ` AND fu.department_id = $1`;
      queryParams.push(userDepartmentId);
    }
    else {
      return res.status(403).json({ error: 'Access denied. Only seniors can view files.' });
    }

    query += ` ORDER BY fu.upload_date DESC`;

    const result = await pool.query(query, queryParams);

    const files = result.rows.map(row => ({
      ...row,
      viewUrl: `/uploads/${encodeURIComponent(row.filename)}` // This filename is the UUID one from DB
    }));

    res.json(files);
  } catch (err) {
    console.error('Failed to fetch files:', err);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});


router.delete('/file/:filename', async (req, res) => {
  const client = await pool.connect();
  let userId = null;
  let userDesignation = null;
  let userDepartmentId = null;
  try {
    await client.query('BEGIN');

    const { filename } = req.params; // This filename will be the UUID one from the URL
    const filePath = path.join(__dirname, '../uploads', filename);

    if (!req.session.user || req.session.user.role !== 'senior') {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied. Senior management only.' });
    }

    userId = req.session.user.id;
    userDesignation = req.session.user.designation;
    userDepartmentId = req.session.user.departmentId;
    const isCMD = userDesignation && userDesignation.toLowerCase() === 'cmd';

    const fileRes = await client.query(`
      SELECT upload_id, department_id, original_name, status, parent_file_id, file_path
      FROM file_uploads
      WHERE filename = $1 AND (status = 'active' OR status = 'pending_edit')
    `, [filename]);

    if (fileRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'File not found or already deleted.' });
    }

    const fileDetails = fileRes.rows[0];

    if (!isCMD && fileDetails.department_id !== userDepartmentId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied. You can only delete files from your own department.' });
    }

    if (fileDetails.status === 'active') {
        const pendingEditCountRes = await client.query(
            'SELECT COUNT(*) FROM file_uploads WHERE parent_file_id = $1 AND status = \'pending_edit\'',
            [fileDetails.upload_id]
        );
        if (parseInt(pendingEditCountRes.rows[0].count, 10) > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Cannot delete an active file that has a pending edit. Reject the pending edit first.' });
        }
    }

    await client.query(
      'UPDATE file_actions_log SET pending_file_id = NULL WHERE pending_file_id = $1',
      [fileDetails.upload_id]
    );
    console.log(`[FILE_ACTION] Deleted action logs referencing pending_file_id ${fileDetails.upload_id}`);


    await client.query('UPDATE file_uploads SET status = \'deleted\' WHERE upload_id = $1', [fileDetails.upload_id]);

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Physical file deletion error:', err);
        });
    } else {
        console.warn(`[FILE_ACTION] WARNING: Physical file not found for deletion at path (already deleted?): ${filePath}`);
    }

    await logFileAction(
      client,
      fileDetails.upload_id,
      'delete_request',
      userId,
      userDepartmentId,
      fileDetails.department_id,
      {
        filename: filename,
        original_name: fileDetails.original_name,
        deleted_by_name: req.session.user.name,
        deleted_by_designation: userDesignation,
        file_status_before_delete: fileDetails.status
      }
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'File status updated to deleted.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Deletion failed' });
  } finally {
    client.release();
  }
});


router.put('/file/:originalFilename', upload.single('dataFile'), async (req, res) => {
  const client = await pool.connect();
  let newFile = null;
  let userId = null;
  let userDesignation = null;
  let userDepartmentId = null;
  try {
    await client.query('BEGIN');

    const { originalFilename } = req.params; // This `originalFilename` is the UUID filename from the URL, passed from frontend
    newFile = req.file;

    if (!req.session.user || req.session.user.role !== 'senior') {
      if (newFile && fs.existsSync(newFile.path)) fs.unlinkSync(newFile.path);
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied. Senior management only.' });
    }
    if (!newFile) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No new file uploaded for update.' });
    }

    // Capture user details immediately after session check
    userId = req.session.user.id;
    userDesignation = req.session.user.designation;
    userDepartmentId = req.session.user.departmentId;

    const isCMD = userDesignation && userDesignation.toLowerCase() === 'cmd';

    // Find active file by its UUID filename (originalFilename param)
    const originalFileRes = await client.query(`
      SELECT upload_id, department_id, original_name, file_path, status
      FROM file_uploads
      WHERE filename = $1 AND status = 'active'
    `, [originalFilename]);

    if (originalFileRes.rowCount === 0) {
      if (newFile && fs.existsSync(newFile.path)) fs.unlinkSync(newFile.path);
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Original active file not found.' });
    }
    const originalFileDetails = originalFileRes.rows[0];

    if (!isCMD && originalFileDetails.department_id !== userDepartmentId) {
      if (newFile && fs.existsSync(newFile.path)) fs.unlinkSync(newFile.path);
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied. You can only edit files from your own department.' });
    }

    const existingPendingEditRes = await client.query(`
        SELECT upload_id, filename, file_path FROM file_uploads
        WHERE parent_file_id = $1 AND status = 'pending_edit'
    `, [originalFileDetails.upload_id]);

    let pendingFileId = null;

    if (existingPendingEditRes.rowCount > 0) {
        const oldPendingFile = existingPendingEditRes.rows[0];

        await client.query(
            'UPDATE file_actions_log SET pending_file_id = NULL WHERE pending_file_id = $1',
            [oldPendingFile.upload_id]
        );
        console.log(`[FILE_ACTION] Updated log entries for old pending file ID: ${oldPendingFile.upload_id}`);


        if (fs.existsSync(oldPendingFile.file_path)) {
            fs.unlink(oldPendingFile.file_path, (err) => {
                if (err) console.error('Error deleting old pending physical file during new edit submission:', err);
            });
        } else {
            console.warn(`[FILE_ACTION] WARNING: Old pending physical file not found (already deleted?): ${oldPendingFile.file_path}`);
        }

        await client.query(
            `UPDATE file_uploads SET
             filename = $1, original_name = $2, file_path = $3,
             uploaded_by = $4, upload_date = NOW(), approval_status = 'pending'
             WHERE upload_id = $5
             RETURNING upload_id;`,
            [newFile.filename, // This will be the UUID filename from multer
             newFile.originalname,
             newFile.path,
             userId,
             oldPendingFile.upload_id]
        );
        pendingFileId = oldPendingFile.upload_id;
        await logFileAction(
            client,
            originalFileDetails.upload_id,
            'edit_request_overwrite_pending',
            userId,
            userDepartmentId,
            originalFileDetails.department_id,
            {
                original_file_name: originalFileDetails.original_name,
                new_pending_original_name: newFile.originalname,
                new_pending_filename_on_disk: newFile.filename,
                edited_by_name: req.session.user.name,
                edited_by_designation: userDesignation, // userDesignation is defined here
            },
            null, null, pendingFileId
        );
        await client.query('COMMIT');
        return res.json({ success: true, message: 'Existing pending edit updated.', fileId: originalFileDetails.upload_id, pendingFileId: pendingFileId });

    } else {
        const newPendingEditRes = await client.query(`
            INSERT INTO file_uploads
                (filename, original_name, file_path, uploaded_by, records_processed, department_id, status, approval_status, parent_file_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING upload_id;
        `, [
            newFile.filename,
            newFile.originalname,
            newFile.path,
            userId,
            0,
            originalFileDetails.department_id,
            'pending_edit',
            'pending',
            originalFileDetails.upload_id
        ]);
        pendingFileId = newPendingEditRes.rows[0].upload_id;
        await logFileAction(
            client,
            originalFileDetails.upload_id,
            'edit_request',
            userId,
            userDepartmentId,
            originalFileDetails.department_id,
            {
                original_file_name: originalFileDetails.original_name,
                new_pending_original_name: newFile.originalname,
                new_pending_filename_on_disk: newFile.filename,
                edited_by_name: req.session.user.name,
                edited_by_designation: userDesignation,
            },
            null, null, pendingFileId
        );
        await client.query('COMMIT');
        res.json({ success: true, message: 'File edit submitted for approval.', fileId: originalFileDetails.upload_id, pendingFileId: pendingFileId });
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Submit edit error:', err);
    if (newFile && fs.existsSync(newFile.path)) {
      fs.unlink(newFile.path, (unlinkErr) => {
        if (unlinkErr) console.error('Failed to delete new file after edit error:', unlinkErr);
      });
    }
    res.status(500).json({ error: err.message || 'Failed to submit edit.' });
  } finally {
    client.release();
  }
});


router.get('/activity-log', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userId = req.session.user.id;
    const userRole = req.session.user.role;
    const userDesignation = req.session.user.designation;
    const userDepartmentId = req.session.user.departmentId;
    const isCMD = userDesignation && userDesignation.toLowerCase() === 'cmd';
    const isDirector = userDesignation && userDesignation.toLowerCase().includes('director');

    let query = `
      SELECT
        fal.log_id,
        fal.file_id,
        fal.action_type,
        fal.action_date,
        fal.details,
        fal.target_department_id,
        fal.pending_file_id,
        u_action.name AS action_by_name,
        u_action.designation AS action_by_designation,
        d_action.name AS action_by_department_name,
        fu_main.original_name AS file_original_name,
        fu_main.filename AS file_current_name,
        d_target.name AS target_department_name,
        (SELECT approval_status FROM file_uploads WHERE upload_id = fal.file_id) AS file_approval_status,
        (SELECT approval_status FROM file_uploads WHERE upload_id = fal.pending_file_id) AS pending_file_approval_status,
        u_approval.name AS approval_action_by_name,
        fal.approval_action_date,
        fal.notes
      FROM file_actions_log fal
      LEFT JOIN users u_action ON fal.action_by = u_action.user_id
      LEFT JOIN departments d_action ON fal.action_by_department_id = d_action.department_id
      LEFT JOIN file_uploads fu_main ON fal.file_id = fu_main.upload_id
      LEFT JOIN departments d_target ON fal.target_department_id = d_target.department_id
      LEFT JOIN users u_approval ON fal.approval_action_by = u_approval.user_id
    `;
    const queryParams = [];
    let whereClauses = [];

    if (isCMD) {
      // CMD sees all logs
    }
    else if (isDirector && userRole === 'senior') {
      whereClauses.push(`fal.target_department_id = $1`);
      queryParams.push(userDepartmentId);
    }
    else if (userRole === 'senior') {
        whereClauses.push(`fal.action_by = $1`);
        queryParams.push(userId);
    }
    else {
      return res.status(403).json({ error: 'Access denied. Only seniors can view activity logs.' });
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }

    query += ` ORDER BY fal.action_date DESC LIMIT 50`;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);

  } catch (err) {
    console.error('Failed to fetch activity log:', err);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});


router.post('/file-action/:activeFileId', async (req, res) => {
  let action;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log(`[FILE_ACTION] Received request for activeFileId: ${req.params.activeFileId}`);
    console.log(`[FILE_ACTION] Request body: ${JSON.stringify(req.body)}`);

    const { activeFileId } = req.params;
    action = req.body.action;
    const { notes } = req.body;

    if (!req.session.user || req.session.user.role !== 'senior') {
      console.log('[FILE_ACTION] Access denied: Not senior.');
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied. Senior management only.' });
    }

    const userId = req.session.user.id;
    const userDesignation = req.session.user.designation;
    const userDepartmentId = req.session.user.departmentId;
    const isCMD = userDesignation && userDesignation.toLowerCase() === 'cmd';
    const isDirector = userDesignation && userDesignation.toLowerCase().includes('director');

    if (!isDirector && !isCMD) {
      console.log('[FILE_ACTION] Access denied: Not Director or CMD.');
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied. Only Directors or CMD can approve/reject files.' });
    }

    const activeFileRes = await client.query(`
      SELECT upload_id, department_id, filename, file_path, original_name
      FROM file_uploads
      WHERE upload_id = $1 AND status = 'active'
    `, [activeFileId]);

    if (activeFileRes.rowCount === 0) {
      console.log(`[FILE_ACTION] Active file ${activeFileId} not found.`);
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Active file not found.' });
    }
    const activeFileDetails = activeFileRes.rows[0];
    console.log(`[FILE_ACTION] Found active file: ${activeFileDetails.original_name}`);

    const pendingFileRes = await client.query(`
        SELECT upload_id, filename, file_path, original_name, uploaded_by
        FROM file_uploads
        WHERE parent_file_id = $1 AND status = 'pending_edit' AND approval_status = 'pending'
    `, [activeFileId]);

    if (pendingFileRes.rowCount === 0) {
        console.log(`[FILE_ACTION] No pending edit found for active file ${activeFileId}.`);
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'No pending edit found for this file, or it\'s not awaiting approval.' });
    }
    const pendingFileDetails = pendingFileRes.rows[0];
    console.log(`[FILE_ACTION] Found pending file: ${pendingFileDetails.original_name} with ID: ${pendingFileDetails.upload_id}`);

    if (!isCMD && activeFileDetails.department_id !== userDepartmentId) {
      console.log(`[FILE_ACTION] Access denied: Director from wrong department. File Dept: ${activeFileDetails.department_id}, User Dept: ${userDepartmentId}`);
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied. You can only approve/reject files from your own department.' });
    }

    let logActionType = '';
    let message = '';

    if (action === 'accept') {
      logActionType = 'accept_edit';
      console.log(`[FILE_ACTION] Accepting edit for file: ${activeFileDetails.original_name}`);

      // Step 1: Clear foreign key references in file_actions_log for the pending file to be deleted
      const updateLogFKResult = await client.query(
        'UPDATE file_actions_log SET pending_file_id = NULL WHERE pending_file_id = $1',
        [pendingFileDetails.upload_id]
      );
      console.log(`[FILE_ACTION] Log FK update (pending_file_id): rows affected = ${updateLogFKResult.rowCount}`);


      // Step 2: Delete the OLD active physical file
      const oldActiveFilePath = activeFileDetails.file_path;
      if (fs.existsSync(oldActiveFilePath)) {
          fs.unlink(oldActiveFilePath, (err) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.warn(`[FILE_ACTION] WARNING: Old active physical file not found (already deleted?): ${oldActiveFilePath}`);
                } else {
                    console.error('Error deleting old active physical file after acceptance:', err);
                }
            } else {
                console.log(`[FILE_ACTION] Deleted old physical file: ${oldActiveFilePath}`);
            }
          });
      } else {
          console.warn(`[FILE_ACTION] WARNING: Old active physical file not found at path (already deleted?): ${oldActiveFilePath}`);
      }

      // CRITICAL FIX: Generate a NEW unique filename for the active record's 'filename' column
      const newUniqueFilenameForActive = `${uuidv4()}${path.extname(pendingFileDetails.filename)}`; // Use original extension
      console.log(`[FILE_ACTION] New unique filename for active record: ${newUniqueFilenameForActive}`);


      // Step 3: Update the ORIGINAL file_uploads record to reflect the new file details
      const updateResult = await client.query(
        `UPDATE file_uploads
         SET filename = $1, file_path = $2, original_name = $3, upload_date = NOW(),
             uploaded_by = $4, status = 'active', approval_status = 'approved'
         WHERE upload_id = $5`,
        [newUniqueFilenameForActive, // Use the new unique filename for the DB record
         pendingFileDetails.file_path, // Keep the physical file path from the pending file
         pendingFileDetails.original_name, // Keep original_name as is
         pendingFileDetails.uploaded_by,
         activeFileId]
      );
      console.log(`[FILE_ACTION] Updated active file record: rows affected = ${updateResult.rowCount}`);

      // Step 4: Delete the pending file's record as it's now merged/superseded
      const deletePendingResult = await client.query('DELETE FROM file_uploads WHERE upload_id = $1', [pendingFileDetails.upload_id]);
      console.log(`[FILE_ACTION] Deleted pending file record: rows affected = ${deletePendingResult.rowCount}`);

      message = 'File changes accepted and applied. Old file deleted.';

    } else if (action === 'reject') {
      logActionType = 'reject_edit';
      console.log(`[FILE_ACTION] Rejecting edit for file: ${activeFileDetails.original_name}`);

      // Step 1: Clear foreign key references in file_actions_log for the pending file to be deleted
      const updateLogFKResult = await client.query(
        'UPDATE file_actions_log SET pending_file_id = NULL WHERE pending_file_id = $1',
        [pendingFileDetails.upload_id]
      );
      console.log(`[FILE_ACTION] Log FK update (pending_file_id): rows affected = ${updateLogFKResult.rowCount}`);

      // Step 2: Delete the PENDING physical file
      const pendingFilePath = pendingFileDetails.file_path;
      if (fs.existsSync(pendingFilePath)) {
          fs.unlink(pendingFilePath, (err) => {
            if (err) {
                console.error('Error deleting rejected pending physical file:', err);
            } else {
                console.log(`[FILE_ACTION] Deleted rejected physical file: ${pendingFilePath}`);
            }
          });
      } else {
          console.warn(`[FILE_ACTION] WARNING: Rejected pending physical file not found (already deleted?): ${pendingFilePath}`);
      }

      // Step 3: Delete the pending file's record
      const deletePendingResult = await client.query('DELETE FROM file_uploads WHERE upload_id = $1', [pendingFileDetails.upload_id]);
      console.log(`[FILE_ACTION] Deleted pending file record: rows affected = ${deletePendingResult.rowCount}`);

      message = 'File changes rejected. Original file remains active.';

    } else {
      console.log(`[FILE_ACTION] Invalid action: ${action}`);
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid action specified. Must be "accept" or "reject".' });
    }

    await logFileAction(
      client,
      activeFileId,
      logActionType,
      userId,
      userDepartmentId,
      activeFileDetails.department_id,
      {
        file_original_name: activeFileDetails.original_name,
        action: action,
        acted_by_name: req.session.user.name,
        acted_by_designation: userDesignation, // userDesignation is defined here
        pending_file_id_acted_on: pendingFileDetails.upload_id,
      },
      userId,
      notes,
      null // CRITICAL FIX: Pass NULL here to avoid FK violation
    );
    console.log(`[LOG_ACTION] Logged action ${logActionType}`);

    await client.query('COMMIT');
    res.json({ success: true, message: message });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[FILE_ACTION] Error performing file action:', err);
    const actionToReport = action || 'unknown_action';
    res.status(500).json({ error: `Failed to ${actionToReport} file due to server.` });
  } finally {
    client.release();
  }
});


router.get('/file-content/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!req.session.user) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userId = req.session.user.id;
    const userRole = req.session.user.role;
    const userDesignation = req.session.user.designation;
    const userDepartmentId = req.session.user.departmentId;

    const isCMD = userDesignation && userDesignation.toLowerCase() === 'cmd';

    const fileRes = await pool.query(`
      SELECT file_path, original_name, department_id, status FROM file_uploads WHERE upload_id = $1
    `, [fileId]);

    if (fileRes.rowCount === 0) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const fileDetails = fileRes.rows[0];

    if (!isCMD && fileDetails.department_id !== userDepartmentId) {
        return res.status(403).json({ error: 'Access denied. You can only view files from your own department.' });
    }
    if (fileDetails.status === 'deleted') {
        return res.status(404).json({ error: 'File not found or has been deleted.' });
    }

    const filePath = fileDetails.file_path;

    res.setHeader('Content-Disposition', `attachment; filename="${fileDetails.original_name}"`);
    res.sendFile(path.resolve(filePath), (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Failed to retrieve file content.' });
      }
    });

  } catch (err) {
    console.error('Error in /file-content/:fileId:', err);
    res.status(500).json({ error: 'Failed to retrieve file content.' });
  }
});

export default router;