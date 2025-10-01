const pool = require('./config/database');

async function createSampleProjects() {
  try {
    console.log('🔄 กำลังสร้างข้อมูลโปรเจคตัวอย่าง...\n');

    // ดึงข้อมูลอาจารย์ที่ปรึกษา
    const advisorsResult = await pool.query(`
      SELECT id, first_name, last_name 
      FROM users 
      WHERE role = 'advisor' 
      ORDER BY id 
      LIMIT 5
    `);

    if (advisorsResult.rows.length === 0) {
      console.log('❌ ไม่พบข้อมูลอาจารย์ กรุณา import ข้อมูลอาจารย์ก่อน');
      return;
    }

    const advisors = advisorsResult.rows;
    console.log(`👨‍🏫 พบอาจารย์ ${advisors.length} คน\n`);

    // ดึงข้อมูลนักศึกษา
    const studentsResult = await pool.query(`
      SELECT id, first_name, last_name, student_id 
      FROM users 
      WHERE role = 'student' 
      ORDER BY id
    `);

    if (studentsResult.rows.length === 0) {
      console.log('❌ ไม่พบข้อมูลนักศึกษา กรุณา import ข้อมูลนักศึกษาก่อน');
      return;
    }

    const students = studentsResult.rows;
    console.log(`👨‍🎓 พบนักศึกษา ${students.length} คน\n`);

    // ข้อมูลโปรเจคตัวอย่าง
    const projectTemplates = [
      {
        name: 'ระบบจัดการร้านกาแฟออนไลน์',
        academicYear: '2567',
        semester: '1'
      },
      {
        name: 'แอปพลิเคชันติดตามสุขภาพส่วนบุคคล',
        academicYear: '2567',
        semester: '1'
      },
      {
        name: 'ระบบจองห้องประชุมออนไลน์',
        academicYear: '2567',
        semester: '1'
      },
      {
        name: 'เว็บไซต์จัดการห้องสมุดดิจิทัล',
        academicYear: '2567',
        semester: '1'
      },
      {
        name: 'ระบบจัดการคลังสินค้า Smart Inventory',
        academicYear: '2567',
        semester: '1'
      },
      {
        name: 'แพลตฟอร์มเรียนออนไลน์ EduConnect',
        academicYear: '2567',
        semester: '2'
      },
      {
        name: 'แอปพลิเคชันจัดการการเงินส่วนบุคคล',
        academicYear: '2567',
        semester: '2'
      },
      {
        name: 'ระบบจัดการโครงการ Project Management Pro',
        academicYear: '2567',
        semester: '2'
      },
      {
        name: 'แอปพลิเคชันหาคู่ออกกำลังกาย FitMatch',
        academicYear: '2567',
        semester: '2'
      },
      {
        name: 'ระบบแนะนำร้านอาหาร FoodFinder AI',
        academicYear: '2567',
        semester: '2'
      }
    ];

    let projectCount = 0;
    let studentIndex = 0;

    // สร้างโปรเจค
    for (const template of projectTemplates) {
      try {
        // สุ่มอาจารย์ที่ปรึกษา
        const advisor = advisors[Math.floor(Math.random() * advisors.length)];

        // สร้างโปรเจค
        const projectResult = await pool.query(
          `INSERT INTO projects (
            name, advisor_id, academic_year, semester, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id, name`,
          [template.name, advisor.id, template.academicYear, template.semester]
        );

        const project = projectResult.rows[0];
        console.log(`✅ สร้างโปรเจค: ${project.name}`);
        console.log(`   อาจารย์ที่ปรึกษา: ${advisor.first_name} ${advisor.last_name}`);

        // เพิ่มนักศึกษา 2-3 คน ต่อโปรเจค
        const numStudents = Math.floor(Math.random() * 2) + 2; // 2-3 คน
        const projectStudents = [];

        for (let i = 0; i < numStudents && studentIndex < students.length; i++) {
          const student = students[studentIndex];
          
          try {
            await pool.query(
              `INSERT INTO project_students (project_id, student_id, created_at)
               VALUES ($1, $2, CURRENT_TIMESTAMP)`,
              [project.id, student.id]
            );
            
            projectStudents.push(student);
            console.log(`   👨‍🎓 เพิ่มนักศึกษา: ${student.first_name} ${student.last_name} (${student.student_id})`);
            studentIndex++;
          } catch (error) {
            console.log(`   ⚠️  ไม่สามารถเพิ่มนักศึกษาได้: ${error.message}`);
          }
        }

        // สร้างนัดหมายตัวอย่างสำหรับโปรเจคนี้
        await createAppointmentsForProject(project.id, advisor.id, projectStudents);

        projectCount++;
        console.log('');

      } catch (error) {
        console.error(`❌ ไม่สามารถสร้างโปรเจค ${template.name}: ${error.message}\n`);
      }
    }

    console.log(`\n📊 สรุปผลลัพธ์:`);
    console.log(`   ✅ สร้างโปรเจคสำเร็จ: ${projectCount} โปรเจค`);

    // แสดงสถิติ
    const stats = await pool.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT ps.student_id) as total_students_in_projects,
        COUNT(a.id) as total_appointments
      FROM projects p
      LEFT JOIN project_students ps ON p.id = ps.project_id
      LEFT JOIN appointments a ON p.id = a.project_id
      WHERE p.archived IS NULL OR p.archived = FALSE
    `);

    console.log(`\n📈 สถิติระบบ:`);
    console.log(`   โปรเจคทั้งหมด: ${stats.rows[0].total_projects}`);
    console.log(`   นักศึกษาในโปรเจค: ${stats.rows[0].total_students_in_projects}`);
    console.log(`   นัดหมายทั้งหมด: ${stats.rows[0].total_appointments}`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await pool.end();
  }
}

// ฟังก์ชันสร้างนัดหมายสำหรับแต่ละโปรเจค
async function createAppointmentsForProject(projectId, advisorId, students) {
  if (students.length === 0) return;

  const today = new Date();
  const numAppointments = Math.floor(Math.random() * 3) + 3; // 3-5 นัดหมาย

  const titles = [
    'ปรึกษาแบบโปรเจค',
    'รายงานความคืบหน้า',
    'นำเสนอผลงาน Sprint 1',
    'ตรวจสอบโค้ด Code Review',
    'วางแผนการพัฒนา',
    'แก้ไข Bug และปัญหา',
    'ทดสอบระบบ UAT',
    'ประชุมทีม Weekly Meeting',
    'ทบทวนผลงาน',
    'วางแผน Sprint ถัดไป'
  ];

  const locations = [
    'ห้อง CS-301',
    'ห้อง CS-302', 
    'ห้องประชุม 1',
    'ห้องปฏิบัติการคอมพิวเตอร์',
    'ห้องทำงานอาจารย์',
    'Microsoft Teams',
    'Google Meet',
    'Zoom Meeting'
  ];

  const notes = [
    'กรุณาเตรียมเอกสารมาด้วย',
    'นำแฟ้มสะสมงานมาด้วย',
    'เตรียม Demo ผลงาน',
    'ติดตั้ง Software ที่จำเป็น',
    'เตรียม Presentation Slide',
    'อย่าลืมนำโค้ดมาด้วย',
    '',
    ''
  ];

  for (let i = 0; i < numAppointments; i++) {
    // สุ่มวันที่ (-30 ถึง +30 วัน)
    const randomDays = Math.floor(Math.random() * 60) - 30;
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + randomDays);

    // สุ่มเวลา (9:00-16:00)
    const hours = Math.floor(Math.random() * 8) + 9;
    const minutes = Math.random() < 0.5 ? '00' : '30';
    const time = `${hours.toString().padStart(2, '0')}:${minutes}`;

    // สุ่มสถานะตามวันที่
    let status;
    if (randomDays < -3) {
      status = Math.random() < 0.8 ? 'completed' : 'failed';
    } else if (randomDays < 0) {
      status = Math.random() < 0.7 ? 'completed' : 'failed';
    } else if (randomDays < 3) {
      status = Math.random() < 0.6 ? 'confirmed' : 'pending';
    } else {
      status = Math.random() < 0.4 ? 'confirmed' : 'pending';
    }

    const title = titles[Math.floor(Math.random() * titles.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const note = notes[Math.floor(Math.random() * notes.length)];

    // สุ่มนักศึกษา
    const student = students[Math.floor(Math.random() * students.length)];

    try {
      await pool.query(
        `INSERT INTO appointments (
          title, date, time, location, notes, 
          student_id, advisor_id, project_id, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          title,
          appointmentDate.toISOString().split('T')[0],
          time,
          location,
          note,
          student.id,
          advisorId,
          projectId,
          status
        ]
      );
    } catch (error) {
      // Ignore duplicate errors
    }
  }
}

// Run
createSampleProjects();
