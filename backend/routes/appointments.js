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
        LEFT JOIN users s ON a.student_id = s.id
        JOIN users ad ON a.advisor_id = ad.id
        LEFT JOIN projects p ON a.project_id = p.id
        WHERE a.advisor_id = $1
        ORDER BY a.date DESC, a.time DESC
      `;
      params = [req.user.id];
    } else {
      // Students see appointments where they are the student OR where they are part of the project
      query = `
        SELECT DISTINCT a.*, 
               s.id as student_id, s.first_name as student_first_name, s.last_name as student_last_name,
               s.student_id as student_student_id, s.phone as student_phone, s.email as student_email, 
               s.office as student_office, s.role as student_role,
               ad.id as advisor_id, ad.first_name as advisor_first_name, ad.last_name as advisor_last_name,
               ad.student_id as advisor_student_id, ad.phone as advisor_phone, ad.email as advisor_email, 
               ad.office as advisor_office, ad.role as advisor_role,
               p.id as project_id, p.name as project_name
        FROM appointments a
        LEFT JOIN users s ON a.student_id = s.id
        JOIN users ad ON a.advisor_id = ad.id
        LEFT JOIN projects p ON a.project_id = p.id
        LEFT JOIN project_students ps ON p.id = ps.project_id
        WHERE a.student_id = $1 OR ps.student_id = $1
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
          title: row.title,
          date: row.date,
          time: row.time,
          location: row.location,
          notes: row.notes,
          status: row.status,
          studentId: row.student_id,
          advisorId: row.advisor_id,
          projectId: row.project_id,
          student: row.student_id ? {
            id: row.student_id,
            studentId: row.student_student_id,
            firstName: row.student_first_name,
            lastName: row.student_last_name,
            phone: row.student_phone,
            email: row.student_email,
            office: row.student_office,
            role: row.student_role
          } : null,
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

// Get appointments for a specific project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if user has access to this project
    let projectCheck;
    if (req.user.role === 'advisor') {
      projectCheck = await pool.query(
        'SELECT id FROM projects WHERE id = $1 AND advisor_id = $2',
        [projectId, req.user.id]
      );
    } else {
      projectCheck = await pool.query(
        `SELECT p.id FROM projects p
         JOIN project_students ps ON p.id = ps.project_id
         WHERE p.id = $1 AND ps.student_id = $2`,
        [projectId, req.user.id]
      );
    }

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบโปรเจคนี้หรือไม่มีสิทธิ์เข้าถึง'
      });
    }

    const query = `
      SELECT a.*, 
             s.id as student_id, s.first_name as student_first_name, s.last_name as student_last_name,
             s.student_id as student_student_id, s.phone as student_phone, s.email as student_email, 
             s.office as student_office, s.role as student_role,
             ad.id as advisor_id, ad.first_name as advisor_first_name, ad.last_name as advisor_last_name,
             ad.student_id as advisor_student_id, ad.phone as advisor_phone, ad.email as advisor_email, 
             ad.office as advisor_office, ad.role as advisor_role,
             p.id as project_id, p.name as project_name
      FROM appointments a
      LEFT JOIN users s ON a.student_id = s.id
      JOIN users ad ON a.advisor_id = ad.id
      LEFT JOIN projects p ON a.project_id = p.id
      WHERE a.project_id = $1
      ORDER BY a.date DESC, a.time DESC
    `;

    const result = await pool.query(query, [projectId]);

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
          title: row.title,
          date: row.date,
          time: row.time,
          location: row.location,
          notes: row.notes,
          status: row.status,
          studentId: row.student_id,
          advisorId: row.advisor_id,
          projectId: row.project_id,
          student: row.student_id ? {
            id: row.student_id,
            studentId: row.student_student_id,
            firstName: row.student_first_name,
            lastName: row.student_last_name,
            phone: row.student_phone,
            email: row.student_email,
            office: row.student_office,
            role: row.student_role
          } : null,
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
    console.error('Get project appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลนัดหมาย'
    });
  }
});

// Create appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, date, time, location, notes, projectId } = req.body;

    if (!title || !date || !time || !location || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลที่จำเป็นไม่ครบถ้วน'
      });
    }

    // Get project details
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบโปรเจคที่ระบุ'
      });
    }

    const project = projectResult.rows[0];
    let finalAdvisorId, finalStudentId, finalProjectId;

    if (req.user.role === 'student') {
      // Student creating appointment - get advisor from project
      finalAdvisorId = project.advisor_id;
      finalStudentId = req.user.id;
      finalProjectId = projectId;
    } else {
      // Advisor creating appointment - set student_id to null for project-based appointment
      finalAdvisorId = req.user.id;
      finalStudentId = null;
      finalProjectId = projectId;
    }

    const result = await pool.query(
      `INSERT INTO appointments (title, date, time, location, notes, student_id, advisor_id, project_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, date, time, location, notes, finalStudentId, finalAdvisorId, finalProjectId]
    );

    const appointment = result.rows[0];

    // Create notifications
    if (req.user.role === 'student') {
      // Student-initiated appointment - notify advisor
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, appointment_id, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [finalAdvisorId, 'appointment_request', 'คำขอการนัดหมายใหม่',
         `นักศึกษา ${req.user.first_name} ${req.user.last_name} ส่งคำขอการนัดหมาย`, appointment.id]
      );
    } else {
      // Advisor-initiated project appointment - notify all students in project
      const studentsResult = await pool.query(
        'SELECT student_id FROM project_students WHERE project_id = $1',
        [projectId]
      );

      for (const student of studentsResult.rows) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, appointment_id, created_at)
           VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
          [student.student_id, 'appointment_request', 'นัดหมายใหม่จากอาจารย์ที่ปรึกษา',
           `อาจารย์ ${req.user.first_name} ${req.user.last_name} สร้างนัดหมายใหม่สำหรับโปรเจค`, appointment.id]
        );
      }
    }

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
    const { title, date, time, location, notes } = req.body;
    
    console.log('Update appointment request:', { id, title, date, time, location, notes, user: req.user.id });

    // Check if user can update this appointment
    // Allow if user is student, advisor, or student in the project
    const appointmentCheck = await pool.query(
      `SELECT a.* FROM appointments a
       LEFT JOIN project_students ps ON a.project_id = ps.project_id
       WHERE a.id = $1 
       AND (a.student_id = $2 OR a.advisor_id = $2 OR ps.student_id = $2)`,
      [id, req.user.id]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนัดหมายนี้หรือคุณไม่มีสิทธิ์แก้ไข'
      });
    }

    const appointment = appointmentCheck.rows[0];
    
    // Check if appointment can be updated (not completed, failed, rejected, or no_response)
    // Exception: Allow updating notes for completed appointments
    const isOnlyUpdatingNotes = date === undefined && time === undefined && location === undefined && notes !== undefined;
    
    if (['completed', 'failed', 'rejected', 'no_response'].includes(appointment.status) && !isOnlyUpdatingNotes) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถแก้ไขนัดหมายที่เสร็จสิ้น ถูกปฏิเสธ ไม่มาตามนัด หรือไม่ตอบรับแล้ว'
      });
    }

    // Check if advisor or student is editing the appointment
    let newStatus = appointment.status;
    if (req.user.role === 'advisor' && 
        (date || time || location) && appointment.status === 'confirmed') {
      // Advisor edited confirmed appointment - need student confirmation
      newStatus = 'pending_student_confirmation';
    } else if (req.user.role === 'student' && 
               (date || time || location) && appointment.status === 'confirmed') {
      // Student edited confirmed appointment - need advisor confirmation
      newStatus = 'pending_advisor_confirmation';
    }

    const result = await pool.query(
      `UPDATE appointments 
       SET title = COALESCE($1, title),
           date = COALESCE($2, date), 
           time = COALESCE($3, time), 
           location = COALESCE($4, location), 
           notes = COALESCE($5, notes),
           status = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, date, time, location, notes, id, newStatus]
    );

    const updatedAppointment = result.rows[0];

    // Send notification to students if advisor edited the appointment
    if (newStatus === 'pending_student_confirmation') {
      // If appointment has student_id, notify that student
      if (appointment.student_id) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, related_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            appointment.student_id,
            'appointment',
            'อาจารย์แก้ไขนัดหมาย',
            `อาจารย์ได้แก้ไขนัดหมายของคุณ กรุณายืนยันการเปลี่ยนแปลง`,
            id
          ]
        );
      } else if (appointment.project_id) {
        // If appointment is project-based, notify all students in the project
        const studentsResult = await pool.query(
          'SELECT student_id FROM project_students WHERE project_id = $1',
          [appointment.project_id]
        );
        
        for (const studentRow of studentsResult.rows) {
          await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, related_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              studentRow.student_id,
              'appointment',
              'อาจารย์แก้ไขนัดหมาย',
              `อาจารย์ได้แก้ไขนัดหมายของโปรเจค กรุณายืนยันการเปลี่ยนแปลง`,
              id
            ]
          );
        }
      }
    }
    
    // Send notification to advisor if student edited the appointment
    if (newStatus === 'pending_advisor_confirmation' && appointment.advisor_id) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, related_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          appointment.advisor_id,
          'appointment',
          'นักศึกษาแก้ไขนัดหมาย',
          `นักศึกษาได้แก้ไขนัดหมาย กรุณายืนยันการเปลี่ยนแปลง`,
          id
        ]
      );
    }

    res.json({
      success: true,
      data: {
        id: updatedAppointment.id,
        title: updatedAppointment.title,
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

// Advisor confirms student's changes
router.put('/:id/advisor-confirm-changes', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if appointment exists and user is the advisor
    const appointmentCheck = await pool.query(
      'SELECT * FROM appointments WHERE id = $1 AND advisor_id = $2',
      [id, req.user.id]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนัดหมายนี้'
      });
    }

    const appointment = appointmentCheck.rows[0];

    // Check if appointment is pending advisor confirmation
    if (appointment.status !== 'pending_advisor_confirmation') {
      return res.status(400).json({
        success: false,
        message: 'นัดหมายนี้ไม่ได้รอการยืนยันจากอาจารย์'
      });
    }

    // Update status to confirmed
    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['confirmed', id]
    );

    const updatedAppointment = result.rows[0];

    // Send notification to student
    if (appointment.student_id) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, related_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          appointment.student_id,
          'appointment',
          'อาจารย์ยืนยันการเปลี่ยนแปลง',
          `อาจารย์ยืนยันการเปลี่ยนแปลงนัดหมายแล้ว`,
          id
        ]
      );
    }

    res.json({
      success: true,
      message: 'ยืนยันการเปลี่ยนแปลงนัดหมายเรียบร้อยแล้ว',
      data: {
        id: updatedAppointment.id,
        title: updatedAppointment.title,
        date: updatedAppointment.date,
        time: updatedAppointment.time,
        location: updatedAppointment.location,
        notes: updatedAppointment.notes,
        status: updatedAppointment.status,
        studentId: updatedAppointment.student_id,
        advisorId: updatedAppointment.advisor_id,
        projectId: updatedAppointment.project_id
      }
    });
  } catch (error) {
    console.error('Advisor confirm changes error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยืนยันการเปลี่ยนแปลง'
    });
  }
});

// Student confirms advisor's changes
router.put('/:id/confirm-changes', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if appointment exists and student is the owner
    const appointmentCheck = await pool.query(
      'SELECT * FROM appointments WHERE id = $1 AND student_id = $2',
      [id, req.user.id]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนัดหมายนี้'
      });
    }

    const appointment = appointmentCheck.rows[0];

    // Check if appointment is pending student confirmation
    if (appointment.status !== 'pending_student_confirmation') {
      return res.status(400).json({
        success: false,
        message: 'นัดหมายนี้ไม่ได้รอการยืนยันจากนักศึกษา'
      });
    }

    // Update status to confirmed
    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['confirmed', id]
    );

    const updatedAppointment = result.rows[0];

    // Send notification to advisor
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        appointment.advisor_id,
        'appointment',
        'นักศึกษายืนยันการเปลี่ยนแปลง',
        `นักศึกษายืนยันการเปลี่ยนแปลงนัดหมายแล้ว`,
        id
      ]
    );

    res.json({
      success: true,
      message: 'ยืนยันการเปลี่ยนแปลงนัดหมายเรียบร้อยแล้ว',
      data: {
        id: updatedAppointment.id,
        title: updatedAppointment.title,
        date: updatedAppointment.date,
        time: updatedAppointment.time,
        location: updatedAppointment.location,
        notes: updatedAppointment.notes,
        status: updatedAppointment.status,
        studentId: updatedAppointment.student_id,
        advisorId: updatedAppointment.advisor_id,
        projectId: updatedAppointment.project_id
      }
    });
  } catch (error) {
    console.error('Confirm changes error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยืนยันการเปลี่ยนแปลง'
    });
  }
});

// Update appointment status (confirm, reject, complete, fail)
router.put('/:id/status/:status', authenticateToken, async (req, res) => {
  try {
    const { id, status } = req.params;

    // Validate status
    const validStatuses = ['confirmed', 'rejected', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'สถานะไม่ถูกต้อง'
      });
    }

    // Check if user has access to update this appointment
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

    // Authorization logic
    if (status === 'confirmed' || status === 'rejected') {
      if (req.user.role !== 'advisor') {
        return res.status(403).json({
          success: false,
          message: 'เฉพาะอาจารย์ที่ปรึกษาที่สามารถยืนยันหรือปฏิเสธนัดหมายได้'
        });
      }
      if (appointment.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'นัดหมายนี้ไม่ได้อยู่ในสถานะรอการยืนยัน'
        });
      }
    } else if (status === 'completed' || status === 'failed') {
      // Both student and advisor can mark as completed/failed
      if (appointment.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'นัดหมายต้องได้รับการยืนยันก่อนจึงจะสามารถเปลี่ยนเป็นเสร็จสิ้นหรือไม่มาตามนัดได้'
        });
      }
    } else if (status === 'cancelled') {
      // Both student and advisor can cancel, but not if completed/failed/rejected
      if (['completed', 'failed', 'rejected'].includes(appointment.status)) {
        return res.status(400).json({
          success: false,
          message: 'ไม่สามารถยกเลิกนัดหมายที่เสร็จสิ้น ถูกปฏิเสธ หรือไม่มาตามนัดแล้ว'
        });
      }
    }

    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    const updatedAppointment = result.rows[0];

    // Send notifications based on status change
    if (status === 'confirmed') {
      // Notify student
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, related_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          appointment.student_id,
          'appointment',
          'นัดหมายได้รับการยืนยัน',
          `นัดหมายของคุณได้รับการยืนยันแล้ว`,
          id
        ]
      );
    } else if (status === 'rejected') {
      // Notify student
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, related_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          appointment.student_id,
          'appointment',
          'นัดหมายถูกปฏิเสธ',
          `นัดหมายของคุณถูกปฏิเสธ`,
          id
        ]
      );
    }

    res.json({
      success: true,
      message: `อัปเดตสถานะนัดหมายเป็น ${status} เรียบร้อยแล้ว`,
      data: {
        id: updatedAppointment.id,
        title: updatedAppointment.title,
        date: updatedAppointment.date,
        time: updatedAppointment.time,
        location: updatedAppointment.location,
        notes: updatedAppointment.notes,
        status: updatedAppointment.status,
        studentId: updatedAppointment.student_id,
        advisorId: updatedAppointment.advisor_id,
        projectId: updatedAppointment.project_id
      }
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะนัดหมาย'
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

    // Check if appointment can be deleted (not completed, failed, rejected, or no_response)
    if (['completed', 'failed', 'rejected', 'no_response'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบนัดหมายที่เสร็จสิ้น ถูกปฏิเสธ ไม่มาตามนัด หรือไม่ตอบรับแล้ว'
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

    // Create notification for student (only if student_id is not null)
    if (appointment.student_id) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, appointment_id, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [appointment.student_id, 'appointment_confirmed', 'นัดหมายได้รับการยืนยัน', 'นัดหมายของคุณได้รับการยืนยันแล้ว', appointment.id]
      );
    }

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

// Student accept appointment
router.put('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'เฉพาะนักศึกษาที่สามารถยอมรับนัดหมายได้'
      });
    }

    // Check if appointment exists and is pending
    const appointmentResult = await pool.query(
      'SELECT * FROM appointments WHERE id = $1 AND status = $2',
      [id, 'pending']
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนัดหมายที่รอการยืนยัน'
      });
    }

    const appointment = appointmentResult.rows[0];

    // Check if student is part of the project (for project-based appointments)
    if (appointment.project_id) {
      const projectCheck = await pool.query(
        'SELECT * FROM project_students WHERE project_id = $1 AND student_id = $2',
        [appointment.project_id, req.user.id]
      );

      if (projectCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'คุณไม่มีสิทธิ์ยอมรับนัดหมายนี้'
        });
      }
    }

    // Update appointment status
    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['confirmed', id]
    );

    const updatedAppointment = result.rows[0];

    // Create notification for advisor
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, appointment_id, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [appointment.advisor_id, 'appointment_accepted', 'นัดหมายได้รับการยอมรับ', 'นัดหมายได้รับการยอมรับจากนักศึกษา', appointment.id]
    );

    res.json({
      success: true,
      data: {
        id: updatedAppointment.id,
        status: updatedAppointment.status,
        updatedAt: updatedAppointment.updated_at
      }
    });
  } catch (error) {
    console.error('Student accept appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยอมรับนัดหมาย'
    });
  }
});

// Student reject appointment
router.put('/:id/student-reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'เฉพาะนักศึกษาที่สามารถปฏิเสธนัดหมายได้'
      });
    }

    // Check if appointment exists and is pending
    const appointmentResult = await pool.query(
      'SELECT * FROM appointments WHERE id = $1 AND status = $2',
      [id, 'pending']
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบนัดหมายที่รอการยืนยัน'
      });
    }

    const appointment = appointmentResult.rows[0];

    // Check if student is part of the project (for project-based appointments)
    if (appointment.project_id) {
      const projectCheck = await pool.query(
        'SELECT * FROM project_students WHERE project_id = $1 AND student_id = $2',
        [appointment.project_id, req.user.id]
      );

      if (projectCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'คุณไม่มีสิทธิ์ปฏิเสธนัดหมายนี้'
        });
      }
    }

    // Update appointment status
    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['rejected', id]
    );

    const updatedAppointment = result.rows[0];

    // Create notification for advisor
    const rejectionMessage = reason 
      ? `นัดหมายถูกปฏิเสธจากนักศึกษา เหตุผล: ${reason}`
      : 'นัดหมายถูกปฏิเสธจากนักศึกษา';

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, appointment_id, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [appointment.advisor_id, 'appointment_rejected', 'นัดหมายถูกปฏิเสธ', rejectionMessage, appointment.id]
    );

    res.json({
      success: true,
      data: {
        id: updatedAppointment.id,
        status: updatedAppointment.status,
        updatedAt: updatedAppointment.updated_at
      }
    });
  } catch (error) {
    console.error('Student reject appointment error:', error);
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

// Route /:id/status ถูกแทนที่ด้วย /:id/status/:status แล้ว (บรรทัด 767)

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

// Check expired appointments (for pending and pending_student_confirmation)
router.post('/check-expired', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    
    // Find appointments that are past their date/time and still pending confirmation
    const query = `
      UPDATE appointments 
      SET status = 'no_response', updated_at = CURRENT_TIMESTAMP
      WHERE (status = 'pending' OR status = 'pending_student_confirmation')
        AND (date < $1 OR (date = $1 AND time < $2))
      RETURNING *
    `;
    
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
    
    const result = await pool.query(query, [currentDate, currentTime]);
    
    res.json({
      success: true,
      message: `Updated ${result.rows.length} expired appointments`,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Check expired appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบนัดหมายที่เลยเวลา'
    });
  }
});

module.exports = router;
