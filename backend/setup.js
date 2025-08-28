const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('กำลังตั้งค่าฐานข้อมูล...');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ สร้างตารางฐานข้อมูลเรียบร้อยแล้ว');

    // Insert sample data
    console.log('กำลังเพิ่มข้อมูลตัวอย่าง...');

    // Add sample advisor
    await pool.query(`
      INSERT INTO users (student_id, first_name, last_name, phone, email, office, role) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (phone) DO NOTHING
    `, ['0001', 'อาจารย์', 'ทดสอบ', '0812345678', 'advisor@test.com', 'ห้อง 101', 'advisor']);

    // Add sample student
    await pool.query(`
      INSERT INTO users (student_id, first_name, last_name, phone, role) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (phone) DO NOTHING
    `, ['6400000001', 'นักศึกษา', 'ทดสอบ', '0898765432', 'student']);

    console.log('✅ เพิ่มข้อมูลตัวอย่างเรียบร้อยแล้ว');

    // Create sample project
    const advisorResult = await pool.query('SELECT id FROM users WHERE phone = $1', ['0812345678']);
    const studentResult = await pool.query('SELECT id FROM users WHERE phone = $1', ['0898765432']);

    if (advisorResult.rows.length > 0 && studentResult.rows.length > 0) {
      const advisorId = advisorResult.rows[0].id;
      const studentId = studentResult.rows[0].id;

      // Create project
      const projectResult = await pool.query(
        'INSERT INTO projects (name, advisor_id) VALUES ($1, $2) RETURNING id',
        ['โครงงานทดสอบ', advisorId]
      );

      if (projectResult.rows.length > 0) {
        const projectId = projectResult.rows[0].id;

        // Add student to project
        await pool.query(
          'INSERT INTO project_students (project_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [projectId, studentId]
        );

        console.log('✅ สร้างโครงงานตัวอย่างเรียบร้อยแล้ว');
      }
    }

    console.log('\n🎉 การตั้งค่าฐานข้อมูลเสร็จสิ้น!');
    console.log('\nข้อมูลสำหรับการทดสอบ:');
    console.log('อาจารย์ที่ปรึกษา: เลขประจำตัว 0001, เบอร์โทร 0812345678');
    console.log('นักศึกษา: เลขนักศึกษา 6400000001, เบอร์โทร 0898765432');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตั้งค่าฐานข้อมูล:', error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
