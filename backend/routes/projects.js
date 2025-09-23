const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all projects (filtered by user role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query, params;

    if (req.user.role === 'advisor') {
      // Advisors see all projects they created
      query = `
        SELECT p.*, 
               u.id as advisor_id, u.first_name as advisor_first_name, u.last_name as advisor_last_name,
               u.student_id as advisor_student_id, u.phone as advisor_phone, u.email as advisor_email, 
               u.office as advisor_office, u.role as advisor_role
        FROM projects p
        JOIN users u ON p.advisor_id = u.id
        WHERE p.advisor_id = $1
        ORDER BY p.created_at DESC
      `;
      params = [req.user.id];
    } else {
      // Students see projects they're part of
      query = `
        SELECT p.*, 
               u.id as advisor_id, u.first_name as advisor_first_name, u.last_name as advisor_last_name,
               u.student_id as advisor_student_id, u.phone as advisor_phone, u.email as advisor_email, 
               u.office as advisor_office, u.role as advisor_role
        FROM projects p
        JOIN users u ON p.advisor_id = u.id
        JOIN project_students ps ON p.id = ps.project_id
        WHERE ps.student_id = $1
        ORDER BY p.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);

    // Get students for each project
    const projects = await Promise.all(
      result.rows.map(async (row) => {
        const studentsResult = await pool.query(
          `SELECT u.id, u.student_id, u.first_name, u.last_name, u.phone, u.email, u.office, u.role
           FROM project_students ps
           JOIN users u ON ps.student_id = u.id
           WHERE ps.project_id = $1`,
          [row.id]
        );

        const students = studentsResult.rows.map(student => ({
          id: student.id,
          studentId: student.student_id,
          firstName: student.first_name,
          lastName: student.last_name,
          phone: student.phone,
          email: student.email,
          office: student.office,
          role: student.role
        }));

        return {
          id: row.id,
          name: row.name,
          advisorId: row.advisor_id,
          advisor: {
            id: row.advisor_id,
            studentId: row.advisor_student_id,
            firstName: row.advisor_first_name,
            lastName: row.advisor_last_name,
            phone: row.advisor_phone,
            email: row.advisor_email,
            office: row.advisor_office,
            role: row.advisor_role
          },
          students,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      })
    );

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโครงงาน'
    });
  }
});

// Get single project
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let query, params;

    if (req.user.role === 'advisor') {
      // Advisors can see projects they created
      query = `
        SELECT p.*, 
               u.id as advisor_id, u.first_name as advisor_first_name, u.last_name as advisor_last_name,
               u.student_id as advisor_student_id, u.phone as advisor_phone, u.email as advisor_email, 
               u.office as advisor_office, u.role as advisor_role
        FROM projects p
        JOIN users u ON p.advisor_id = u.id
        WHERE p.id = $1 AND p.advisor_id = $2
      `;
      params = [id, req.user.id];
    } else {
      // Students can see projects they're part of
      query = `
        SELECT p.*, 
               u.id as advisor_id, u.first_name as advisor_first_name, u.last_name as advisor_last_name,
               u.student_id as advisor_student_id, u.phone as advisor_phone, u.email as advisor_email, 
               u.office as advisor_office, u.role as advisor_role
        FROM projects p
        JOIN users u ON p.advisor_id = u.id
        JOIN project_students ps ON p.id = ps.project_id
        WHERE p.id = $1 AND ps.student_id = $2
      `;
      params = [id, req.user.id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบโครงงานนี้'
      });
    }

    const row = result.rows[0];

    // Get students for the project
    const studentsResult = await pool.query(
      `SELECT u.id, u.student_id, u.first_name, u.last_name, u.phone, u.email, u.office, u.role
       FROM project_students ps
       JOIN users u ON ps.student_id = u.id
       WHERE ps.project_id = $1`,
      [id]
    );

    const students = studentsResult.rows.map(student => ({
      id: student.id,
      studentId: student.student_id,
      firstName: student.first_name,
      lastName: student.last_name,
      phone: student.phone,
      email: student.email,
      office: student.office,
      role: student.role
    }));

    const project = {
      id: row.id,
      name: row.name,
      advisorId: row.advisor_id,
      advisor: {
        id: row.advisor_id,
        studentId: row.advisor_student_id,
        firstName: row.advisor_first_name,
        lastName: row.advisor_last_name,
        phone: row.advisor_phone,
        email: row.advisor_email,
        office: row.advisor_office,
        role: row.advisor_role
      },
      students,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get single project error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโครงงาน'
    });
  }
});

// Create project
router.post('/', authenticateToken, requireRole(['advisor']), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'ชื่อโครงงานเป็นข้อมูลที่จำเป็น'
      });
    }

    const result = await pool.query(
      'INSERT INTO projects (name, advisor_id) VALUES ($1, $2) RETURNING *',
      [name, req.user.id]
    );

    const project = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        advisorId: project.advisor_id,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างโครงงาน'
    });
  }
});

// Update project
router.put('/:id', authenticateToken, requireRole(['advisor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'ชื่อโครงงานเป็นข้อมูลที่จำเป็น'
      });
    }

    // Check if project belongs to the advisor
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND advisor_id = $2',
      [id, req.user.id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบโครงงานนี้'
      });
    }

    const result = await pool.query(
      'UPDATE projects SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name, id]
    );

    const project = result.rows[0];

    res.json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        advisorId: project.advisor_id,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตโครงงาน'
    });
  }
});

// Delete project
router.delete('/:id', authenticateToken, requireRole(['advisor']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project belongs to the advisor
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND advisor_id = $2',
      [id, req.user.id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบโครงงานนี้'
      });
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'ลบโครงงานเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบโครงงาน'
    });
  }
});

// Invite student to project
router.post('/:id/students', authenticateToken, requireRole(['advisor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'รหัสนักศึกษาเป็นข้อมูลที่จำเป็น'
      });
    }

    // Check if project belongs to the advisor
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND advisor_id = $2',
      [id, req.user.id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบโครงงานนี้'
      });
    }

    // Find student by student ID
    const studentResult = await pool.query(
      'SELECT id FROM users WHERE student_id = $1 AND role = $2',
      [studentId, 'student']
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนักศึกษาที่มีรหัสนี้'
      });
    }

    const student = studentResult.rows[0];

    // Check if student is already in the project
    const existingCheck = await pool.query(
      'SELECT project_id FROM project_students WHERE project_id = $1 AND student_id = $2',
      [id, student.id]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'นักศึกษาอยู่ในโครงงานนี้แล้ว'
      });
    }

    // Add student to project
    await pool.query(
      'INSERT INTO project_students (project_id, student_id) VALUES ($1, $2)',
      [id, student.id]
    );

    res.json({
      success: true,
      message: 'เชิญนักศึกษาเข้าร่วมโครงงานเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Invite student error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      projectId: req.params.id,
      studentId: req.body.studentId,
      advisorId: req.user.id
    });
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเชิญนักศึกษา',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Remove student from project
router.delete('/:id/students/:studentId', authenticateToken, requireRole(['advisor']), async (req, res) => {
  try {
    const { id, studentId } = req.params;

    // Check if project belongs to the advisor
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND advisor_id = $2',
      [id, req.user.id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบโครงงานนี้'
      });
    }

    // Find student by student ID
    const studentResult = await pool.query(
      'SELECT id FROM users WHERE student_id = $1 AND role = $2',
      [studentId, 'student']
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนักศึกษาที่มีรหัสนี้'
      });
    }

    const student = studentResult.rows[0];

    // Remove student from project
    await pool.query(
      'DELETE FROM project_students WHERE project_id = $1 AND student_id = $2',
      [id, student.id]
    );

    res.json({
      success: true,
      message: 'ลบนักศึกษาออกจากโครงงานเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบนักศึกษา'
    });
  }
});

module.exports = router;
