const pool = require('./config/database');

async function createSampleAppointments() {
  try {
    console.log('🔄 กำลังสร้างข้อมูลนัดหมายตัวอย่าง...\n');

    // ดึงข้อมูลโปรเจคทั้งหมด
    const projectsResult = await pool.query(`
      SELECT p.id, p.name, p.advisor_id, 
             array_agg(ps.student_id) as student_ids
      FROM projects p
      LEFT JOIN project_students ps ON p.id = ps.project_id
      WHERE p.archived IS NULL OR p.archived = FALSE
      GROUP BY p.id, p.name, p.advisor_id
      ORDER BY p.id
      LIMIT 10
    `);

    const projects = projectsResult.rows;
    console.log(`📁 พบโปรเจค ${projects.length} รายการ\n`);

    const appointments = [];
    const today = new Date();

    // สำหรับแต่ละโปรเจค สร้าง 3-5 นัดหมาย
    for (const project of projects) {
      const numAppointments = Math.floor(Math.random() * 3) + 3; // 3-5 นัดหมาย
      
      console.log(`📝 สร้างนัดหมายสำหรับโปรเจค: ${project.name}`);

      for (let i = 0; i < numAppointments; i++) {
        // สุ่มวันที่ (ตั้งแต่ 30 วันที่แล้ว จนถึง 30 วันข้างหน้า)
        const randomDays = Math.floor(Math.random() * 60) - 30;
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
          'ห้องสมุด ชั้น 3',
          'Microsoft Teams',
          'Google Meet',
          'Zoom Meeting'
        ];
        const location = locations[Math.floor(Math.random() * locations.length)];

        // สุ่มหัวข้อการนัดหมาย
        const titles = [
          'ปรึกษาแบบโปรเจค',
          'รายงานความคืบหน้า',
          'นำเสนอผลงาน',
          'ตรวจสอบโค้ด',
          'วางแผนการพัฒนา',
          'แก้ไขปัญหา Bug',
          'ทดสอบระบบ',
          'ประชุมทีม',
          'สอบถามข้อสงสัย',
          'ติดตามงาน'
        ];
        const title = titles[Math.floor(Math.random() * titles.length)];

        // สุ่มสถานะ (ถ้าเป็นอดีต = completed/failed, ถ้าอนาคต = pending/confirmed)
        let status;
        if (randomDays < -3) {
          // อดีต
          status = Math.random() < 0.8 ? 'completed' : 'failed';
        } else if (randomDays < 0) {
          // เมื่อไม่กี่วันก่อน
          status = Math.random() < 0.7 ? 'completed' : 'failed';
        } else if (randomDays < 3) {
          // ใกล้ๆ
          status = Math.random() < 0.6 ? 'confirmed' : 'pending';
        } else {
          // ไกลๆ
          status = Math.random() < 0.4 ? 'confirmed' : 'pending';
        }

        // สุ่มหมายเหตุ
        const notes = [
          'กรุณาเตรียมเอกสารมาด้วย',
          'นำแฟ้มสะสมงานมาด้วย',
          'เตรียมนำเสนอผลงาน',
          'ติดตั้ง Software ที่จำเป็น',
          '',
          '',
          'อย่าลืมนะ',
          'สำคัญมาก!'
        ];
        const note = notes[Math.floor(Math.random() * notes.length)];

        appointments.push({
          projectId: project.id,
          projectName: project.name,
          advisorId: project.advisor_id,
          studentId: project.student_ids && project.student_ids[0] !== null ? project.student_ids[0] : null,
          date: appointmentDate.toISOString().split('T')[0],
          time,
          location,
          title,
          notes: note,
          status
        });
      }
    }

    console.log(`\n✅ เตรียมสร้าง ${appointments.length} นัดหมาย\n`);

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
        console.log(`✓ สร้างนัดหมาย: ${apt.title} - ${apt.projectName} (${apt.date} ${apt.time}) [${apt.status}]`);
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
      GROUP BY status 
      ORDER BY status
    `);

    console.log(`\n📈 สถิติการนัดหมายทั้งหมดในระบบ:`);
    statsResult.rows.forEach(row => {
      console.log(`   ${row.status}: ${row.count} รายการ`);
    });

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await pool.end();
  }
}

createSampleAppointments();

