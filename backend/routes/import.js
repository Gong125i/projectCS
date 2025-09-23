const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Import users from CSV
router.post('/users', authenticateToken, requireRole(['advisor']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกไฟล์ CSV'
      });
    }

    const results = [];
    const errors = [];
    let successCount = 0;
    let errorCount = 0;

    // Read CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        try {
          // Process each row
          for (let i = 0; i < results.length; i++) {
            const row = results[i];
            const rowNumber = i + 2; // +2 because CSV starts from row 2 (row 1 is header)

            try {
              // Clean BOM from field names
              const cleanRow = {};
              Object.keys(row).forEach(key => {
                const cleanKey = key.replace(/^\uFEFF/, ''); // Remove BOM
                cleanRow[cleanKey] = row[key];
              });
              
              // Validate required fields
              if (!cleanRow.firstName || !cleanRow.lastName || !cleanRow.phone || !cleanRow.role) {
                errors.push(`Row ${rowNumber}: ข้อมูลที่จำเป็นไม่ครบถ้วน (firstName, lastName, phone, role)`);
                errorCount++;
                continue;
              }

              // Validate role
              if (!['student', 'advisor'].includes(cleanRow.role)) {
                errors.push(`Row ${rowNumber}: role ต้องเป็น 'student' หรือ 'advisor'`);
                errorCount++;
                continue;
              }

              // Check if phone already exists (skip for students with same phone)
              if (cleanRow.role === 'advisor') {
                const phoneCheck = await pool.query(
                  'SELECT id FROM users WHERE phone = $1',
                  [cleanRow.phone]
                );

                if (phoneCheck.rows.length > 0) {
                  errors.push(`Row ${rowNumber}: เบอร์โทรศัพท์ ${cleanRow.phone} ถูกใช้งานแล้ว`);
                  errorCount++;
                  continue;
                }
              }

              // Check if student ID already exists (if provided)
              if (cleanRow.studentId) {
                const studentIdCheck = await pool.query(
                  'SELECT id FROM users WHERE student_id = $1',
                  [cleanRow.studentId]
                );

                if (studentIdCheck.rows.length > 0) {
                  errors.push(`Row ${rowNumber}: เลขนักศึกษา ${cleanRow.studentId} ถูกใช้งานแล้ว`);
                  errorCount++;
                  continue;
                }
              }

              // Insert user
              await pool.query(
                `INSERT INTO users (student_id, first_name, last_name, phone, email, office, role, major)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                  cleanRow.studentId || null,
                  cleanRow.firstName,
                  cleanRow.lastName,
                  cleanRow.phone,
                  cleanRow.email || null,
                  cleanRow.office || null,
                  cleanRow.role,
                  cleanRow.major || null
                ]
              );

              successCount++;
            } catch (error) {
              errors.push(`Row ${rowNumber}: ${error.message}`);
              errorCount++;
            }
          }

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          // Prepare response
          const message = `Import เสร็จสิ้น: ${successCount} รายการสำเร็จ, ${errorCount} รายการล้มเหลว`;
          
          res.json({
            success: true,
            data: {
              success: successCount > 0,
              message,
              successCount,
              errorCount,
              errors: errors.length > 0 ? errors : undefined
            }
          });
        } catch (error) {
          // Clean up uploaded file
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }

          console.error('Import processing error:', error);
          res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์ CSV'
          });
        }
      })
      .on('error', (error) => {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        console.error('CSV parsing error:', error);
        res.status(500).json({
          success: false,
          message: 'เกิดข้อผิดพลาดในการอ่านไฟล์ CSV'
        });
      });
  } catch (error) {
    // Clean up uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการ import ข้อมูล'
    });
  }
});

module.exports = router;
