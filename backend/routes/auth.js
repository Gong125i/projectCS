const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { studentId, phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'เบอร์โทรศัพท์เป็นข้อมูลที่จำเป็น'
      });
    }

    let query, params;

    if (studentId) {
      // Login with student ID/advisor ID and phone
      query = 'SELECT * FROM users WHERE student_id = $1 AND phone = $2';
      params = [studentId, phone];
    } else {
      // Advisor login with phone only (fallback)
      query = 'SELECT * FROM users WHERE phone = $1 AND role = $2';
      params = [phone, 'advisor'];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง'
      });
    }

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
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
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userData = {
      id: req.user.id,
      studentId: req.user.student_id,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      phone: req.user.phone,
      email: req.user.email,
      office: req.user.office,
      role: req.user.role,
      createdAt: req.user.created_at,
      updatedAt: req.user.updated_at
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
    });
  }
});

module.exports = router;
