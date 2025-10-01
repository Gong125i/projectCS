const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

// Archive completed project
router.post('/archive', authenticateToken, async (req, res) => {
  try {
    const { 
      projectId, 
      projectName,
      advisorName,
      studentNames,
      totalAppointments,
      completedAppointments,
      successRate,
      attendanceRate,
      appointmentDetails,
      finalGrade, 
      projectType, 
      technologyUsed, 
      keywords 
    } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!projectId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Project ID is required'
      });
    }

    // Check if project exists and user is the advisor
    const projectQuery = `
      SELECT p.*, u.first_name, u.last_name 
      FROM projects p
      JOIN users u ON p.advisor_id = u.id
      WHERE p.id = $1 AND p.advisor_id = $2
    `;
    
    const projectResult = await pool.query(projectQuery, [projectId, userId]);
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found or you are not the advisor'
      });
    }

    const project = projectResult.rows[0];

    // Get student names
    const studentsQuery = `
      SELECT u.first_name, u.last_name
      FROM project_students ps
      JOIN users u ON ps.student_id = u.id
      WHERE ps.project_id = $1
    `;
    
    const studentsResult = await pool.query(studentsQuery, [projectId]);
    const dbStudentNames = studentsResult.rows.map(row => `${row.first_name} ${row.last_name}`);

    // Insert into project_archive with all project details
    const archiveQuery = `
      INSERT INTO project_archive (
        project_id, project_name, description, advisor_name,
        student_names, academic_year, semester, completion_date,
        final_grade, project_type, technology_used, keywords,
        total_appointments, completed_appointments, success_rate, attendance_rate,
        appointment_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const archiveValues = [
      projectId,
      projectName || project.name,
      project.description || '',
      advisorName || `${project.first_name} ${project.last_name}`,
      studentNames || dbStudentNames,
      '2567', // default academic year
      '1',    // default semester
      new Date(),
      finalGrade || 'A',
      projectType || 'Web Application',
      technologyUsed || ['React', 'Node.js', 'PostgreSQL'],
      keywords || ['การนัดหมาย', 'ระบบจัดการ'],
      totalAppointments || 0,
      completedAppointments || 0,
      successRate || '0.0',
      attendanceRate || '0.0',
      JSON.stringify(appointmentDetails || [])
    ];

    const archiveResult = await pool.query(archiveQuery, archiveValues);
    const archivedProject = archiveResult.rows[0];

    // Update project archived status
    await pool.query(
      'UPDATE projects SET archived = TRUE, archived_at = $1 WHERE id = $2',
      [new Date(), projectId]
    );

    res.status(201).json({
      message: 'Project archived successfully',
      archive: archivedProject
    });

  } catch (error) {
    console.error('Error archiving project:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to archive project'
    });
  }
});

// Get archived projects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'completion_date', order = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM project_archive
      ORDER BY ${sort} ${order}
      LIMIT $1 OFFSET $2
    `;

    const countQuery = 'SELECT COUNT(*) FROM project_archive';

    const [results, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);

    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      data: results.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching archived projects:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch archived projects'
    });
  }
});

// Search archived projects
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { 
      query = '', 
      academic_year = '', 
      semester = '', 
      advisor_name = '', 
      technology = '', 
      grade_range = '',
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Build WHERE conditions
    if (query) {
      paramCount++;
      whereConditions.push(`(
        project_name ILIKE $${paramCount} OR 
        description ILIKE $${paramCount} OR 
        array_to_string(keywords, ' ') ILIKE $${paramCount}
      )`);
      queryParams.push(`%${query}%`);
    }

    if (academic_year) {
      paramCount++;
      whereConditions.push(`academic_year = $${paramCount}`);
      queryParams.push(academic_year);
    }

    if (semester) {
      paramCount++;
      whereConditions.push(`semester = $${paramCount}`);
      queryParams.push(semester);
    }

    if (advisor_name) {
      paramCount++;
      whereConditions.push(`advisor_name ILIKE $${paramCount}`);
      queryParams.push(`%${advisor_name}%`);
    }

    if (technology) {
      paramCount++;
      whereConditions.push(`$${paramCount} = ANY(technology_used)`);
      queryParams.push(technology);
    }

    if (grade_range) {
      paramCount++;
      whereConditions.push(`final_grade = $${paramCount}`);
      queryParams.push(grade_range);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get results
    const searchQuery = `
      SELECT * FROM project_archive
      ${whereClause}
      ORDER BY completion_date DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM project_archive
      ${whereClause}
    `;

    queryParams.push(limit, offset);

    const [results, countResult] = await Promise.all([
      pool.query(searchQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);

    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      data: results.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        query,
        academic_year,
        semester,
        advisor_name,
        technology,
        grade_range
      }
    });

  } catch (error) {
    console.error('Error searching archived projects:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search archived projects'
    });
  }
});

// Get project statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_projects,
        AVG(CASE 
          WHEN final_grade = 'A' THEN 4.0
          WHEN final_grade = 'B+' THEN 3.5
          WHEN final_grade = 'B' THEN 3.0
          WHEN final_grade = 'C+' THEN 2.5
          WHEN final_grade = 'C' THEN 2.0
          ELSE 0 
        END) as average_grade
      FROM project_archive
    `;

    const yearStatsQuery = `
      SELECT academic_year, COUNT(*) as count
      FROM project_archive
      GROUP BY academic_year
      ORDER BY academic_year DESC
    `;

    const semesterStatsQuery = `
      SELECT semester, COUNT(*) as count
      FROM project_archive
      GROUP BY semester
      ORDER BY semester
    `;

    const advisorStatsQuery = `
      SELECT advisor_name, COUNT(*) as count
      FROM project_archive
      GROUP BY advisor_name
      ORDER BY count DESC
      LIMIT 10
    `;

    const [statsResult, yearResult, semesterResult, advisorResult] = await Promise.all([
      pool.query(statsQuery),
      pool.query(yearStatsQuery),
      pool.query(semesterStatsQuery),
      pool.query(advisorStatsQuery)
    ]);

    const stats = statsResult.rows[0];
    const projectsByYear = {};
    const projectsBySemester = {};
    const projectsByAdvisor = {};

    yearResult.rows.forEach(row => {
      projectsByYear[row.academic_year] = parseInt(row.count);
    });

    semesterResult.rows.forEach(row => {
      projectsBySemester[row.semester] = parseInt(row.count);
    });

    advisorResult.rows.forEach(row => {
      projectsByAdvisor[row.advisor_name] = parseInt(row.count);
    });

    res.json({
      total_projects: parseInt(stats.total_projects),
      average_grade: parseFloat(stats.average_grade || 0).toFixed(2),
      projects_by_year: projectsByYear,
      projects_by_semester: projectsBySemester,
      projects_by_advisor: projectsByAdvisor
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
