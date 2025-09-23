const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { user, password } = req.body;

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'รหัสนักศึกษา/อาจารย์เป็นข้อมูลที่จำเป็น'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านเป็นข้อมูลที่จำเป็น'
      });
    }

    // Find user by student ID
    const query = 'SELECT * FROM users WHERE student_id = $1';
    const params = [user];

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง'
      });
    }

    const userData = result.rows[0];

    // Check password
    let isPasswordValid = false;

    if (userData.password_hash) {
      // User has a custom password, verify with bcrypt
      isPasswordValid = await bcrypt.compare(password, userData.password_hash);
    } else {
      // User is still using student ID as password (default)
      isPasswordValid = (password === userData.student_id);
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: userData.id, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userResponse = {
      id: userData.id,
      studentId: userData.student_id,
      firstName: userData.first_name,
      lastName: userData.last_name,
      phone: userData.phone,
      email: userData.email,
      office: userData.office,
      major: userData.major,
      role: userData.role,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at
    };

    res.json({
      success: true,
      data: {
        user: userResponse,
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
      major: req.user.major,
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

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'
      });
    }

    // Get current user data
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้'
      });
    }

    const user = userResult.rows[0];

    // Check if user has a password set (not using student ID as password)
    if (user.password_hash) {
      // User has a custom password, verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
        });
      }
    } else {
      // User is still using student ID as password, verify current password matches student ID
      if (currentPassword !== user.student_id) {
        return res.status(400).json({
          success: false,
          message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
        });
      }
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedNewPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน'
    });
  }
});

// Reset password using student ID
router.post('/reset-password', async (req, res) => {
  try {
    const { user, newPassword } = req.body;

    if (!user || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกรหัสนักศึกษา/อาจารย์และรหัสผ่านใหม่'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'
      });
    }

    // Find user by student ID
    const query = 'SELECT * FROM users WHERE student_id = $1';
    const params = [user];

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้ที่ตรงกับข้อมูลที่กรอก'
      });
    }

    const userData = result.rows[0];

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedNewPassword, userData.id]
    );

    res.json({
      success: true,
      message: 'รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน'
    });
  }
});

module.exports = router;
