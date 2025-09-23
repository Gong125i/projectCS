const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'appointment_db',
  user: process.env.DB_USER || 'waranchai',
  password: process.env.DB_PASSWORD || ''
});

async function importAdminUsers() {
  try {
    console.log('Starting admin users import...');
    
    // Read CSV file
    const csvPath = path.join(__dirname, '../user_csv/admin_users.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    
    console.log('Headers:', headers);
    
    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = line.split(',');
      
      // Map CSV columns to database fields
      const userData = {
        student_id: values[0],
        first_name: values[1],
        last_name: values[2],
        phone: values[3],
        email: values[4],
        role: values[5],
        password: values[6]
      };
      
      console.log('Processing user:', userData);
      
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE student_id = $1',
        [userData.student_id]
      );
      
      if (existingUser.rows.length > 0) {
        console.log(`User ${userData.student_id} already exists, skipping...`);
        continue;
      }
      
      // Insert user without password_hash (use student_id as password)
      const result = await pool.query(
        `INSERT INTO users (student_id, first_name, last_name, phone, email, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, student_id, first_name, last_name, role`,
        [
          userData.student_id,
          userData.first_name,
          userData.last_name,
          userData.phone,
          userData.email,
          userData.role
        ]
      );
      
      console.log(`✅ Successfully imported user: ${result.rows[0].first_name} ${result.rows[0].last_name} (${result.rows[0].student_id})`);
    }
    
    console.log('✅ Admin users import completed successfully!');
    
    // Show summary
    const userCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['advisor']);
    console.log(`Total advisors in database: ${userCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error importing admin users:', error);
  } finally {
    await pool.end();
  }
}

async function importStudents() {
  try {
    console.log('Starting students import...');
    
    // Read CSV file
    const csvPath = path.join(__dirname, '../user_csv/student_data_cs.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    
    console.log('Headers:', headers);
    
    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = line.split(',');
      
      // Map CSV columns to database fields
      const userData = {
        first_name: values[0],
        last_name: values[1],
        student_id: values[2],
        phone: values[3],
        email: values[4],
        role: values[5],
        password: values[6],
        major: values[7]
      };
      
      console.log('Processing student:', userData);
      
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE student_id = $1',
        [userData.student_id]
      );
      
      if (existingUser.rows.length > 0) {
        console.log(`Student ${userData.student_id} already exists, skipping...`);
        continue;
      }
      
      // Insert student without password_hash (use student_id as password)
      const result = await pool.query(
        `INSERT INTO users (student_id, first_name, last_name, phone, email, role, major, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, student_id, first_name, last_name, role, major`,
        [
          userData.student_id,
          userData.first_name,
          userData.last_name,
          userData.phone,
          userData.email,
          userData.role,
          userData.major
        ]
      );
      
      console.log(`✅ Successfully imported student: ${result.rows[0].first_name} ${result.rows[0].last_name} (${result.rows[0].student_id})`);
    }
    
    console.log('✅ Students import completed successfully!');
    
    // Show summary
    const userCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['student']);
    console.log(`Total students in database: ${userCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error importing students:', error);
  } finally {
    await pool.end();
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--admin')) {
    await importAdminUsers();
  } else if (args.includes('--students')) {
    await importStudents();
  } else {
    console.log('Usage:');
    console.log('  node import_csv.js --admin     # Import admin users');
    console.log('  node import_csv.js --students  # Import students');
    console.log('  node import_csv.js --all       # Import both');
    
    if (args.includes('--all')) {
      await importAdminUsers();
      await importStudents();
    }
  }
}

// Run the import
main();
