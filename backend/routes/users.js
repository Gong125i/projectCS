const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', authenticateToken, requireRole(['advisor']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, student_id, first_name, last_name, phone, email, office, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    const users = result.rows.map(row => ({
      id: row.id,
      studentId: row.student_id,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      email: row.email,
      office: row.office,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
    });
  }
});

// Update user profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, email, office } = req.body;

    // Check if user is updating their own profile or is an advisor
    if (req.user.id !== parseInt(id) && req.user.role !== 'advisor') {
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้ใช้นี้'
      });
    }

    // Check if phone is already taken by another user
    if (phone) {
      const phoneCheck = await pool.query(
        'SELECT id FROM users WHERE phone = $1 AND id != $2',
        [phone, id]
      );
      if (phoneCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว'
        });
      }
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (firstName) {
      updateFields.push(`first_name = $${paramCount}`);
      values.push(firstName);
      paramCount++;
    }

    if (lastName) {
      updateFields.push(`last_name = $${paramCount}`);
      values.push(lastName);
      paramCount++;
    }

    if (phone) {
      updateFields.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }

    if (email !== undefined) {
      updateFields.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (office !== undefined) {
      updateFields.push(`office = $${paramCount}`);
      values.push(office);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่มีข้อมูลที่จะอัปเดต'
      });
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount}
      RETURNING id, student_id, first_name, last_name, phone, email, office, role, created_at, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้นี้'
      });
    }

    const user = result.rows[0];
    const userData = {
      id: user.id,
      studentId: user.student_id,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      email: user.email,
      office: user.office,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้'
    });
  }
});

// Create user (for testing/initial setup)
router.post('/', authenticateToken, requireRole(['advisor']), async (req, res) => {
  try {
    const { studentId, firstName, lastName, phone, email, office, role } = req.body;

    if (!firstName || !lastName || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลที่จำเป็นไม่ครบถ้วน'
      });
    }

    // Check if phone is already taken
    const phoneCheck = await pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );
    if (phoneCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว'
      });
    }

    // Check if student ID is already taken (if provided)
    if (studentId) {
      const studentIdCheck = await pool.query(
        'SELECT id FROM users WHERE student_id = $1',
        [studentId]
      );
      if (studentIdCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'เลขนักศึกษานี้ถูกใช้งานแล้ว'
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO users (student_id, first_name, last_name, phone, email, office, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, student_id, first_name, last_name, phone, email, office, role, created_at, updated_at`,
      [studentId, firstName, lastName, phone, email, office, role]
    );

    const user = result.rows[0];
    const userData = {
      id: user.id,
      studentId: user.student_id,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      email: user.email,
      office: user.office,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    res.status(201).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้'
    });
  }
});

module.exports = router;
