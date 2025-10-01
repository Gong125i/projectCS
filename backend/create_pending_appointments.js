const pool = require('./config/database');

async function createPendingAppointments() {
  try {
    console.log('🔄 กำลังสร้างนัดหมายที่รอยืนยันสำหรับอาจารย์...\n');

    // ดึงข้อมูลโปรเจคและนักศึกษา
    const projectsResult = await pool.query(`
      SELECT p.id, p.name, p.advisor_id,
             ps.student_id,
             u.first_name as student_first_name,
             u.last_name as student_last_name
      FROM projects p
      JOIN project_students ps ON p.id = ps.project_id
      JOIN users u ON ps.student_id = u.id
      WHERE p.archived IS NULL OR p.archived = FALSE
      ORDER BY p.id
      LIMIT 5
    `);

    if (projectsResult.rows.length === 0) {
      console.log('❌ ไม่พบโปรเจคที่มีนักศึกษา');
      return;
    }

    console.log(`📁 พบโปรเจค ${projectsResult.rows.length} รายการที่มีนักศึกษา\n`);

    const appointments = [];
    const today = new Date();

    // สร้างนัดหมาย pending สำหรับแต่ละโปรเจค
    for (const project of projectsResult.rows) {
      // สร้าง 2-3 นัดหมายต่อโปรเจค
      const numAppointments = Math.floor(Math.random() * 2) + 2; // 2-3 นัดหมาย

      console.log(`📝 สร้างนัดหมายสำหรับโปรเจค: ${project.name}`);
      console.log(`   นักศึกษา: ${project.student_first_name} ${project.student_last_name}`);

      for (let i = 0; i < numAppointments; i++) {
        // สุ่มวันที่ในอนาคต (1-7 วันข้างหน้า)
        const randomDays = Math.floor(Math.random() * 7) + 1;
        const appointmentDate = new Date(today);
        appointmentDate.setDate(today.getDate() + randomDays);

        // สุ่มเวลา
        const hours = Math.floor(Math.random() * 7) + 9; // 9-15 น.
        const minutes = Math.random() < 0.5 ? '00' : '30';
        const time = `${hours.toString().padStart(2, '0')}:${minutes}`;

        // สุ่มสถานที่
        const locations = [
          'ห้อง CS-301',
          'ห้องประชุม 1',
          'ห้องปฏิบัติการคอมพิวเตอร์',
          'ห้องทำงานอาจารย์',
          'Microsoft Teams',
          'Google Meet'
        ];
        const location = locations[Math.floor(Math.random() * locations.length)];

        // สุ่มหัวข้อการนัดหมาย
        const titles = [
          'ขออนุมัติหัวข้อโปรเจค',
          'ปรึกษาแบบโปรเจค',
          'รายงานความคืบหน้า',
          'นำเสนอ Prototype',
          'ตรวจสอบ Requirement',
          'วางแผนการพัฒนา',
          'สอบถามข้อสงสัย',
          'ขอคำปรึกษาเทคนิค'
        ];
        const title = titles[Math.floor(Math.random() * titles.length)];

        // สุ่มหมายเหตุ
        const notes = [
          'กรุณาเตรียมเอกสารมาด้วยครับ',
          'ขอนำเสนอแนวคิดโปรเจค',
          'มีปัญหาที่อยากปรึกษา',
          'ต้องการคำแนะนำเพิ่มเติม',
          '',
          'รบกวนให้คำแนะนำด้วยครับ'
        ];
        const note = notes[Math.floor(Math.random() * notes.length)];

        appointments.push({
          projectId: project.id,
          projectName: project.name,
          advisorId: project.advisor_id,
          studentId: project.student_id,
          studentName: `${project.student_first_name} ${project.student_last_name}`,
          date: appointmentDate.toISOString().split('T')[0],
          time,
          location,
          title,
          notes: note,
          status: 'pending' // สถานะรอยืนยัน
        });
      }
    }

    console.log(`\n✅ เตรียมสร้าง ${appointments.length} นัดหมายที่รอยืนยัน\n`);

    // Insert appointments
    let created = 0;
    let failed = 0;

    for (const apt of appointments) {
      try {
        await pool.query(
          `INSERT INTO appointments (
            title, date, time, location, notes,
            student_id, advisor_id, project_id, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            apt.title,
            apt.date,
            apt.time,
            apt.location,
            apt.notes,
            apt.studentId,
            apt.advisorId,
            apt.projectId,
            apt.status
          ]
        );
        created++;
        console.log(`✓ สร้างนัดหมาย: ${apt.title}`);
        console.log(`  โปรเจค: ${apt.projectName}`);
        console.log(`  นักศึกษา: ${apt.studentName}`);
        console.log(`  วันที่: ${apt.date} ${apt.time}`);
        console.log(`  สถานะ: รอยืนยัน\n`);
      } catch (error) {
        failed++;
        console.error(`✗ ล้มเหลว: ${apt.title} - ${error.message}`);
      }
    }

    console.log(`\n📊 สรุปผลลัพธ์:`);
    console.log(`   ✅ สร้างสำเร็จ: ${created} นัดหมาย`);
    console.log(`   ❌ ล้มเหลว: ${failed} นัดหมาย`);

    // แสดงสถิติ
    const statsResult = await pool.query(`
      SELECT 
        status, 
        COUNT(*) as count 
      FROM appointments 
      WHERE status = 'pending'
      GROUP BY status
    `);

    console.log(`\n📈 นัดหมายที่รอยืนยันทั้งหมดในระบบ: ${statsResult.rows[0]?.count || 0} รายการ`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await pool.end();
  }
}

createPendingAppointments();

