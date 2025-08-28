const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all appointments (filtered by user role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query, params;

    if (req.user.role === 'advisor') {
      // Advisors see appointments where they are the advisor
      query = `
        SELECT a.*, 
               s.id as student_id, s.first_name as student_first_name, s.last_name as student_last_name,
               s.student_id as student_student_id, s.phone as student_phone, s.email as student_email, 
               s.office as student_office, s.role as student_role,
               ad.id as advisor_id, ad.first_name as advisor_first_name, ad.last_name as advisor_last_name,
               ad.student_id as advisor_student_id, ad.phone as advisor_phone, ad.email as advisor_email, 
               ad.office as advisor_office, ad.role as advisor_role,
               p.id as project_id, p.name as project_name
        FROM appointments a
        JOIN users s ON a.student_id = s.id
        JOIN users ad ON a.advisor_id = ad.id
        LEFT JOIN projects p ON a.project_id = p.id
        WHERE a.advisor_id = $1
        ORDER BY a.date DESC, a.time DESC
      `;
      params = [req.user.id];
    } else {
      // Students see appointments where they are the student
      query = `
        SELECT a.*, 
               s.id as student_id, s.first_name as student_first_name, s.last_name as student_last_name,
               s.student_id as student_student_id, s.phone as student_phone, s.email as student_email, 
               s.office as student_office, s.role as student_role,
               ad.id as advisor_id, ad.first_name as advisor_first_name, ad.last_name as advisor_last_name,
               ad.student_id as advisor_student_id, ad.phone as advisor_phone, ad.email as advisor_email, 
               ad.office as advisor_office, ad.role as advisor_role,
               p.id as project_id, p.name as project_name
        FROM appointments a
        JOIN users s ON a.student_id = s.id
        JOIN users ad ON a.advisor_id = ad.id
        LEFT JOIN projects p ON a.project_id = p.id
        WHERE a.student_id = $1
        ORDER BY a.date DESC, a.time DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);

    // Get comments for each appointment
    const appointments = await Promise.all(
      result.rows.map(async (row) => {
        const commentsResult = await pool.query(
          `SELECT c.*, u.first_name, u.last_name, u.role
           FROM comments c
           JOIN users u ON c.user_id = u.id
           WHERE c.appointment_id = $1
           ORDER BY c.created_at ASC`,
          [row.id]
        );

        const comments = commentsResult.rows.map(comment => ({
          id: comment.id,
          content: comment.content,
          appointmentId: comment.appointment_id,
          userId: comment.user_id,
          user: {
            id: comment.user_id,
            firstName: comment.first_name,
            lastName: comment.last_name,
            role: comment.role
          },
          createdAt: comment.created_at
        }));

        return {
          id: row.id,
          date: row.date,
          time: row.time,
          location: row.location,
          notes: row.notes,
          status: row.status,
          studentId: row.student_id,
          advisorId: row.advisor_id,
          projectId: row.project_id,
          student: {
            id: row.student_id,
            studentId: row.student_student_id,
            firstName: row.student_first_name,
            lastName: row.student_last_name,
            phone: row.student_phone,
            email: row.student_email,
            office: row.student_office,
            role: row.student_role
          },
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
          project: row.project_id ? {
            id: row.project_id,
            name: row.project_name
          } : null,
          comments,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      })
    );

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลนัดหมาย'
    });
  }
});

// Get single appointment
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*, 
              s.id as student_id, s.first_name as student_first_name, s.last_name as student_last_name,
              s.student_id as student_student_id, s.phone as student_phone, s.email as student_email, 
              s.office as student_office, s.role as student_role,
              ad.id as advisor_id, ad.first_name as advisor_first_name, ad.last_name as advisor_last_name,
              ad.student_id as advisor_student_id, ad.phone as advisor_phone, ad.email as advisor_email, 
              ad.office as advisor_office, ad.role as advisor_role,
              p.id as project_id, p.name as project_name
       FROM appointments a
       JOIN users s ON a.student_id = s.id
       JOIN users ad ON a.advisor_id = ad.id
       LEFT JOIN projects p ON a.project_id = p.id
       WHERE a.id = $1 AND (a.student_id = $2 OR a.advisor_id = $2)`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนัดหมายนี้'
      });
    }

    const row = result.rows[0];

    // Get comments
    const commentsResult = await pool.query(
      `SELECT c.*, u.first_name, u.last_name, u.role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.appointment_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    const comments = commentsResult.rows.map(comment => ({
      id: comment.id,
      content: comment.content,
      appointmentId: comment.appointment_id,
      userId: comment.user_id,
      user: {
        id: comment.user_id,
        firstName: comment.first_name,
        lastName: comment.last_name,
        role: comment.role
      },
      createdAt: comment.created_at
    }));

    const appointment = {
      id: row.id,
      date: row.date,
      time: row.time,
      location: row.location,
      notes: row.notes,
      status: row.status,
      studentId: row.student_id,
      advisorId: row.advisor_id,
      projectId: row.project_id,
      student: {
        id: row.student_id,
        studentId: row.student_student_id,
        firstName: row.student_first_name,
        lastName: row.student_last_name,
        phone: row.student_phone,
        email: row.student_email,
        office: row.student_office,
        role: row.student_role
      },
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
      project: row.project_id ? {
        id: row.project_id,
        name: row.project_name
      } : null,
      comments,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลนัดหมาย'
    });
  }
});

// Create appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { date, time, location, notes, advisorId, studentId, projectId } = req.body;

    if (!date || !time || !location || !advisorId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลที่จำเป็นไม่ครบถ้วน'
      });
    }

    // Check if user is creating appointment for themselves
    if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'คุณสามารถสร้างนัดหมายสำหรับตัวเองเท่านั้น'
      });
    }

    if (req.user.role === 'advisor' && req.user.id !== parseInt(advisorId)) {
      return res.status(403).json({
        success: false,
        message: 'คุณสามารถสร้างนัดหมายสำหรับตัวเองเท่านั้น'
      });
    }

    const result = await pool.query(
      `INSERT INTO appointments (date, time, location, notes, student_id, advisor_id, project_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [date, time, location, notes, studentId, advisorId, projectId]
    );

    const appointment = result.rows[0];

    // Create notification for the other party
    const notificationTitle = req.user.role === 'student' ? 'คำขอการนัดหมายใหม่' : 'นัดหมายใหม่';
    const notificationMessage = req.user.role === 'student' 
      ? `นักศึกษา ${req.user.firstName} ${req.user.lastName} ส่งคำขอการนัดหมาย`
      : `อาจารย์ ${req.user.firstName} ${req.user.lastName} สร้างนัดหมายใหม่`;

    const notificationUserId = req.user.role === 'student' ? advisorId : studentId;

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, appointment_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [notificationUserId, 'appointment_request', notificationTitle, notificationMessage, appointment.id]
    );

    res.status(201).json({
      success: true,
      data: {
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
        location: appointment.location,
        notes: appointment.notes,
        status: appointment.status,
        studentId: appointment.student_id,
        advisorId: appointment.advisor_id,
        projectId: appointment.project_id,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at
      }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างนัดหมาย'
    });
  }
});

// Update appointment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, location, notes } = req.body;

    // Check if user can update this appointment
    const appointmentCheck = await pool.query(
      'SELECT * FROM appointments WHERE id = $1 AND (student_id = $2 OR advisor_id = $2)',
      [id, req.user.id]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนัดหมายนี้'
      });
    }

    const appointment = appointmentCheck.rows[0];

    // Only allow updates if appointment is not confirmed or completed
    if (appointment.status === 'confirmed' || appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถแก้ไขนัดหมายที่ยืนยันแล้วได้'
      });
    }

    const result = await pool.query(
      `UPDATE appointments 
       SET date = COALESCE($1, date), 
           time = COALESCE($2, time), 
           location = COALESCE($3, location), 
           notes = COALESCE($4, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [date, time, location, notes, id]
    );

    const updatedAppointment = result.rows[0];

    res.json({
      success: true,
      data: {
        id: updatedAppointment.id,
        date: updatedAppointment.date,
        time: updatedAppointment.time,
        location: updatedAppointment.location,
        notes: updatedAppointment.notes,
        status: updatedAppointment.status,
        studentId: updatedAppointment.student_id,
        advisorId: updatedAppointment.advisor_id,
        projectId: updatedAppointment.project_id,
        createdAt: updatedAppointment.created_at,
        updatedAt: updatedAppointment.updated_at
      }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตนัดหมาย'
    });
  }
});

// Delete appointment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can delete this appointment
    const appointmentCheck = await pool.query(
      'SELECT * FROM appointments WHERE id = $1 AND (student_id = $2 OR advisor_id = $2)',
      [id, req.user.id]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนัดหมายนี้'
      });
    }

    const appointment = appointmentCheck.rows[0];

    // Only allow deletion if appointment is not confirmed or completed
    if (appointment.status === 'confirmed' || appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบนัดหมายที่ยืนยันแล้วได้'
      });
    }

    await pool.query('DELETE FROM appointments WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'ลบนัดหมายเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบนัดหมาย'
    });
  }
});

// Confirm appointment (advisor only)
router.put('/:id/confirm', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'advisor') {
      return res.status(403).json({
        success: false,
        message: 'เฉพาะอาจารย์ที่ปรึกษาที่สามารถยืนยันนัดหมายได้'
      });
    }

    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND advisor_id = $3 RETURNING *',
      ['confirmed', id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนัดหมายนี้'
      });
    }

    const appointment = result.rows[0];

    // Create notification for student
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, appointment_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [appointment.student_id, 'appointment_confirmed', 'นัดหมายได้รับการยืนยัน', 'นัดหมายของคุณได้รับการยืนยันแล้ว', appointment.id]
    );

    res.json({
      success: true,
      data: {
        id: appointment.id,
        status: appointment.status,
        updatedAt: appointment.updated_at
      }
    });
  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยืนยันนัดหมาย'
    });
  }
});

// Reject appointment (advisor only)
router.put('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'advisor') {
      return res.status(403).json({
        success: false,
        message: 'เฉพาะอาจารย์ที่ปรึกษาที่สามารถปฏิเสธนัดหมายได้'
      });
    }

    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND advisor_id = $3 RETURNING *',
      ['rejected', id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนัดหมายนี้'
      });
    }

    const appointment = result.rows[0];

    // Create notification for student
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, appointment_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [appointment.student_id, 'appointment_rejected', 'นัดหมายถูกปฏิเสธ', 'นัดหมายของคุณถูกปฏิเสธ', appointment.id]
    );

    res.json({
      success: true,
      data: {
        id: appointment.id,
        status: appointment.status,
        updatedAt: appointment.updated_at
      }
    });
  } catch (error) {
    console.error('Reject appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการปฏิเสธนัดหมาย'
    });
  }
});

// Complete appointment
router.put('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND (student_id = $3 OR advisor_id = $3) RETURNING *',
      ['completed', id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนัดหมายนี้'
      });
    }

    const appointment = result.rows[0];

    res.json({
      success: true,
      data: {
        id: appointment.id,
        status: appointment.status,
        updatedAt: appointment.updated_at
      }
    });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเสร็จสิ้นนัดหมาย'
    });
  }
});

// Add comment to appointment
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'เนื้อหาคอมเมนต์เป็นข้อมูลที่จำเป็น'
      });
    }

    // Check if user can comment on this appointment
    const appointmentCheck = await pool.query(
      'SELECT id FROM appointments WHERE id = $1 AND (student_id = $2 OR advisor_id = $2)',
      [id, req.user.id]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนัดหมายนี้'
      });
    }

    const result = await pool.query(
      'INSERT INTO comments (content, appointment_id, user_id) VALUES ($1, $2, $3) RETURNING *',
      [content, id, req.user.id]
    );

    const comment = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        appointmentId: comment.appointment_id,
        userId: comment.user_id,
        user: {
          id: req.user.id,
          firstName: req.user.first_name,
          lastName: req.user.last_name,
          role: req.user.role
        },
        createdAt: comment.created_at
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มคอมเมนต์'
    });
  }
});

// Get comments for appointment
router.get('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can view this appointment
    const appointmentCheck = await pool.query(
      'SELECT id FROM appointments WHERE id = $1 AND (student_id = $2 OR advisor_id = $2)',
      [id, req.user.id]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนัดหมายนี้'
      });
    }

    const result = await pool.query(
      `SELECT c.*, u.first_name, u.last_name, u.role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.appointment_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    const comments = result.rows.map(comment => ({
      id: comment.id,
      content: comment.content,
      appointmentId: comment.appointment_id,
      userId: comment.user_id,
      user: {
        id: comment.user_id,
        firstName: comment.first_name,
        lastName: comment.last_name,
        role: comment.role
      },
      createdAt: comment.created_at
    }));

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคอมเมนต์'
    });
  }
});

module.exports = router;
