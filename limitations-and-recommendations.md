# ข้อจำกัดและข้อเสนอแนะของระบบจัดการนัดหมาย

## 📋 ข้อจำกัดของระบบ (System Limitations)

### 1. 🔐 ความปลอดภัย (Security)

#### ข้อจำกัด:
- **ไม่มี Rate Limiting**: ระบบไม่มีการจำกัดจำนวนคำขอ (Request) ต่อเวลา ทำให้เสี่ยงต่อการโจมตีแบบ Brute Force หรือ DDoS
- **ไม่มี Input Sanitization ที่ครบถ้วน**: การตรวจสอบข้อมูลนำเข้ามีเพียงการตรวจสอบความครบถ้วนเท่านั้น ไม่มีการป้องกัน XSS หรือ SQL Injection อย่างเต็มรูปแบบ
- **JWT Token ไม่มี Refresh Token**: ใช้ JWT แบบเดียว (7 วัน) ไม่มี Refresh Token ทำให้ไม่สามารถเพิกถอน Token ได้
- **Password Default ไม่ปลอดภัย**: ใช้รหัสนักศึกษาเป็นรหัสผ่านเริ่มต้น ซึ่งเดาได้ง่าย
- **ไม่มี 2FA (Two-Factor Authentication)**: ไม่มีการยืนยันตัวตนแบบสองขั้นตอน
- **HTTPS ไม่ได้บังคับใช้**: ระบบไม่มีการบังคับใช้ HTTPS ในการสื่อสารข้อมูล

#### ข้อเสนอแนะ:
```javascript
// 1. เพิ่ม Rate Limiting
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // จำกัด 5 ครั้งต่อ 15 นาที
  message: 'พยายามเข้าสู่ระบบมากเกินไป กรุณารอ 15 นาที'
});

router.post('/login', loginLimiter, async (req, res) => {
  // ... login logic
});

// 2. เพิ่ม Input Sanitization
const validator = require('validator');
const xss = require('xss');

const sanitizeInput = (input) => {
  return xss(validator.escape(input));
};

// 3. เพิ่ม Refresh Token
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // ลดเหลือ 15 นาที
  );
  
  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// 4. บังคับเปลี่ยนรหัสผ่านครั้งแรก
const requirePasswordChange = async (req, res, next) => {
  if (!req.user.password_hash) {
    return res.status(403).json({
      success: false,
      message: 'กรุณาเปลี่ยนรหัสผ่านก่อนใช้งานระบบ',
      requirePasswordChange: true
    });
  }
  next();
};

// 5. เพิ่ม HTTPS Redirect
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});
```

---

### 2. 📧 ระบบอีเมล (Email System)

#### ข้อจำกัด:
- **ไม่มี Email Queue**: การส่งอีเมลเป็นแบบ Synchronous ทำให้ API ช้าถ้าส่งอีเมลล้มเหลวหรือช้า
- **ไม่มี Retry Mechanism**: ถ้าส่งอีเมลล้มเหลว จะไม่มีการลองส่งใหม่อัตโนมัติ
- **ไม่มี Email Template Engine**: ใช้ HTML String แบบธรรมดา ไม่มี Template Engine ที่ยืดหยุ่น
- **ไม่มีการตรวจสอบ Email Validity**: ไม่มีการตรวจสอบว่าอีเมลที่ส่งไปมีอยู่จริงหรือไม่
- **ไม่มี Unsubscribe Option**: ผู้ใช้ไม่สามารถยกเลิกการรับอีเมลแจ้งเตือนได้

#### ข้อเสนอแนะ:
```javascript
// 1. ใช้ Bull Queue สำหรับ Email Queue
const Queue = require('bull');
const emailQueue = new Queue('email', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

// เพิ่มงานส่งอีเมลเข้า Queue
const sendEmailAsync = async (emailData) => {
  await emailQueue.add(emailData, {
    attempts: 3, // ลองส่งใหม่ 3 ครั้ง
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
};

// Process Queue
emailQueue.process(async (job) => {
  const { appointment, recipient } = job.data;
  await emailService.sendAppointmentCreatedEmail(appointment, recipient);
});

// 2. ใช้ Handlebars สำหรับ Email Template
const handlebars = require('handlebars');
const fs = require('fs').promises;

const sendTemplateEmail = async (templateName, data, recipient) => {
  const template = await fs.readFile(`./templates/${templateName}.hbs`, 'utf-8');
  const compiled = handlebars.compile(template);
  const html = compiled(data);
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipient.email,
    subject: data.subject,
    html
  });
};

// 3. เพิ่มการตรวจสอบ Email
const dns = require('dns').promises;

const verifyEmail = async (email) => {
  const domain = email.split('@')[1];
  try {
    const addresses = await dns.resolveMx(domain);
    return addresses && addresses.length > 0;
  } catch (error) {
    return false;
  }
};

// 4. เพิ่ม Email Preferences
ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN unsubscribe_token VARCHAR(255) UNIQUE;

// ตรวจสอบก่อนส่งอีเมล
if (user.email_notifications) {
  await sendEmail(user);
}
```

---

### 3. 🔔 ระบบแจ้งเตือน (Notification System)

#### ข้อจำกัด:
- **Polling แทน WebSocket**: ใช้ Polling ทุก 30 วินาที ทำให้มี Latency และใช้ Bandwidth มาก
- **ไม่มี Push Notifications**: ไม่มีการแจ้งเตือนแบบ Push บนมือถือหรือเบราว์เซอร์
- **ไม่มีการจัดกลุ่ม Notifications**: แจ้งเตือนไม่มีการจัดกลุ่มตามประเภท
- **ไม่มีการลบ Notifications เก่า**: Notifications จะสะสมในฐานข้อมูลไม่มีกำหนด
- **ไม่มี Notification Preferences**: ผู้ใช้ไม่สามารถเลือกประเภทการแจ้งเตือนที่ต้องการได้

#### ข้อเสนอแนะ:
```javascript
// 1. ใช้ WebSocket แทน Polling
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// เก็บ WebSocket connections ของแต่ละ user
const userConnections = new Map();

wss.on('connection', (ws, req) => {
  const userId = req.user.id;
  userConnections.set(userId, ws);
  
  ws.on('close', () => {
    userConnections.delete(userId);
  });
});

// ส่ง Notification แบบ Real-time
const sendRealtimeNotification = (userId, notification) => {
  const ws = userConnections.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(notification));
  }
};

// 2. เพิ่ม Push Notifications
const webpush = require('web-push');

// Setup VAPID keys
webpush.setVapidDetails(
  'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ส่ง Push Notification
const sendPushNotification = async (subscription, payload) => {
  await webpush.sendNotification(subscription, JSON.stringify(payload));
};

// 3. Auto-delete old notifications
const cron = require('node-cron');

// ลบ notifications เก่ากว่า 30 วัน ทุกวันเวลา 00:00
cron.schedule('0 0 * * *', async () => {
  await pool.query(`
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '30 days'
  `);
  console.log('Cleaned up old notifications');
});

// 4. เพิ่ม Notification Preferences
CREATE TABLE notification_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  appointment_created BOOLEAN DEFAULT TRUE,
  appointment_confirmed BOOLEAN DEFAULT TRUE,
  appointment_rejected BOOLEAN DEFAULT TRUE,
  appointment_updated BOOLEAN DEFAULT TRUE,
  appointment_reminder BOOLEAN DEFAULT TRUE
);

// ตรวจสอบก่อนส่ง notification
const shouldSendNotification = async (userId, notificationType) => {
  const result = await pool.query(
    `SELECT ${notificationType} FROM notification_preferences WHERE user_id = $1`,
    [userId]
  );
  return result.rows.length === 0 || result.rows[0][notificationType];
};
```

---

### 4. 📅 ระบบนัดหมาย (Appointment System)

#### ข้อจำกัด:
- **ไม่มี Recurring Appointments**: ไม่สามารถสร้างนัดหมายแบบซ้ำ (เช่น ทุกสัปดาห์)
- **ไม่มี Calendar Integration**: ไม่สามารถ Sync กับ Google Calendar, Outlook ได้
- **ไม่มี Conflict Detection**: ไม่มีการตรวจสอบว่านัดหมายซ้อนทับกันหรือไม่
- **ไม่มี Reminder Scheduler**: ไม่มีการส่งการแจ้งเตือนก่อนนัดหมายอัตโนมัติ
- **ไม่มี Timezone Support**: ไม่รองรับเขตเวลาที่แตกต่างกัน
- **ไม่มี Attachment Support**: ไม่สามารถแนบไฟล์เอกสารในนัดหมายได้
- **ไม่มี Video Conference Integration**: ไม่มีการเชื่อมต่อกับ Zoom, Google Meet

#### ข้อเสนอแนะ:
```javascript
// 1. เพิ่ม Recurring Appointments
ALTER TABLE appointments ADD COLUMN recurrence_rule TEXT;
ALTER TABLE appointments ADD COLUMN recurrence_end_date DATE;
ALTER TABLE appointments ADD COLUMN parent_appointment_id INTEGER REFERENCES appointments(id);

// สร้าง Recurring Appointments
const createRecurringAppointments = async (appointmentData, recurrenceRule) => {
  const { frequency, interval, endDate } = recurrenceRule;
  const appointments = [];
  
  let currentDate = new Date(appointmentData.date);
  const end = new Date(endDate);
  
  while (currentDate <= end) {
    const appointment = await pool.query(
      `INSERT INTO appointments (title, date, time, location, notes, 
       student_id, advisor_id, project_id, recurrence_rule, parent_appointment_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [appointmentData.title, currentDate, appointmentData.time, 
       appointmentData.location, appointmentData.notes,
       appointmentData.studentId, appointmentData.advisorId, 
       appointmentData.projectId, JSON.stringify(recurrenceRule),
       appointments[0]?.id || null]
    );
    
    appointments.push(appointment.rows[0]);
    
    // เพิ่มวันตาม frequency
    if (frequency === 'daily') {
      currentDate.setDate(currentDate.getDate() + interval);
    } else if (frequency === 'weekly') {
      currentDate.setDate(currentDate.getDate() + (7 * interval));
    } else if (frequency === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + interval);
    }
  }
  
  return appointments;
};

// 2. Google Calendar Integration
const { google } = require('googleapis');

const syncToGoogleCalendar = async (appointment, userTokens) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  oauth2Client.setCredentials(userTokens);
  
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const event = {
    summary: appointment.title,
    location: appointment.location,
    description: appointment.notes,
    start: {
      dateTime: `${appointment.date}T${appointment.time}`,
      timeZone: 'Asia/Bangkok'
    },
    end: {
      dateTime: `${appointment.date}T${appointment.time}`,
      timeZone: 'Asia/Bangkok'
    }
  };
  
  const result = await calendar.events.insert({
    calendarId: 'primary',
    resource: event
  });
  
  return result.data;
};

// 3. Conflict Detection
const checkAppointmentConflict = async (userId, date, time, duration = 60) => {
  const startTime = new Date(`${date}T${time}`);
  const endTime = new Date(startTime.getTime() + duration * 60000);
  
  const conflicts = await pool.query(`
    SELECT * FROM appointments
    WHERE (student_id = $1 OR advisor_id = $1)
    AND date = $2
    AND status NOT IN ('cancelled', 'rejected')
    AND (
      (time >= $3 AND time < $4)
      OR (time + INTERVAL '1 hour' > $3 AND time < $4)
    )
  `, [userId, date, time, endTime.toTimeString().slice(0, 5)]);
  
  return conflicts.rows;
};

// 4. Automatic Reminders
const cron = require('node-cron');

// ส่ง reminder ทุก 1 ชั่วโมง
cron.schedule('0 * * * *', async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // หานัดหมายที่จะเกิดขึ้นใน 24 ชั่วโมงข้างหน้า
  const upcomingAppointments = await pool.query(`
    SELECT a.*, 
           s.email as student_email, s.first_name as student_first_name,
           ad.email as advisor_email, ad.first_name as advisor_first_name
    FROM appointments a
    LEFT JOIN users s ON a.student_id = s.id
    JOIN users ad ON a.advisor_id = ad.id
    WHERE a.date = $1
    AND a.status = 'confirmed'
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.appointment_id = a.id
      AND n.type = 'appointment_reminder'
      AND n.created_at > NOW() - INTERVAL '24 hours'
    )
  `, [tomorrow.toISOString().split('T')[0]]);
  
  for (const appointment of upcomingAppointments.rows) {
    // ส่ง notification และ email reminder
    await sendReminder(appointment);
  }
});

// 5. เพิ่ม Timezone Support
ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'Asia/Bangkok';

const moment = require('moment-timezone');

const convertToUserTimezone = (date, time, timezone) => {
  return moment.tz(`${date} ${time}`, 'Asia/Bangkok')
    .tz(timezone)
    .format('YYYY-MM-DD HH:mm:ss');
};

// 6. File Attachments
ALTER TABLE appointments ADD COLUMN attachments JSONB;

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/appointments/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('ประเภทไฟล์ไม่ได้รับอนุญาต'));
    }
  }
});

// 7. Video Conference Integration
const createZoomMeeting = async (appointment) => {
  const axios = require('axios');
  
  const response = await axios.post(
    'https://api.zoom.us/v2/users/me/meetings',
    {
      topic: appointment.title,
      type: 2,
      start_time: `${appointment.date}T${appointment.time}`,
      duration: 60,
      timezone: 'Asia/Bangkok',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.ZOOM_JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return {
    meetingId: response.data.id,
    joinUrl: response.data.join_url,
    startUrl: response.data.start_url
  };
};

ALTER TABLE appointments ADD COLUMN meeting_url TEXT;
ALTER TABLE appointments ADD COLUMN meeting_id VARCHAR(255);
```

---

### 5. 🗄️ ฐานข้อมูล (Database)

#### ข้อจำกัด:
- **ไม่มี Connection Pooling Configuration**: ใช้ค่า default ของ pg Pool ซึ่งอาจไม่เหมาะกับ Production
- **ไม่มี Database Backup Strategy**: ไม่มีระบบสำรองข้อมูลอัตโนมัติ
- **ไม่มี Database Migration Tool**: ใช้ SQL file ธรรมดา ไม่มี Version Control สำหรับ Schema
- **ไม่มี Soft Delete**: การลบข้อมูลเป็นแบบ Hard Delete ไม่สามารถกู้คืนได้
- **ไม่มี Audit Log**: ไม่มีการบันทึกประวัติการแก้ไขข้อมูล
- **Index ไม่ครบถ้วน**: บาง Query ที่ใช้บ่อยอาจไม่มี Index

#### ข้อเสนอแนะ:
```javascript
// 1. ปรับ Connection Pool Configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // จำนวน connection สูงสุด
  idleTimeoutMillis: 30000, // ปิด connection ที่ไม่ได้ใช้งานหลัง 30 วินาที
  connectionTimeoutMillis: 2000, // Timeout สำหรับการสร้าง connection ใหม่
  maxUses: 7500, // จำนวนครั้งที่ใช้ connection ก่อนสร้างใหม่
});

// Monitor pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('New client connected to database');
});

// 2. Database Backup Strategy
const cron = require('node-cron');
const { exec } = require('child_process');

// Backup ทุกวันเวลา 02:00
cron.schedule('0 2 * * *', () => {
  const date = new Date().toISOString().split('T')[0];
  const backupFile = `./backups/backup-${date}.sql`;
  
  const command = `pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -F c -f ${backupFile}`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Backup failed: ${error}`);
      return;
    }
    console.log(`Backup completed: ${backupFile}`);
    
    // ลบ backup เก่ากว่า 30 วัน
    exec(`find ./backups -name "backup-*.sql" -mtime +30 -delete`);
  });
});

// 3. ใช้ Knex.js สำหรับ Migration
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  }
});

// สร้าง Migration
// npx knex migrate:make add_soft_delete_to_appointments

// migrations/20250108_add_soft_delete.js
exports.up = function(knex) {
  return knex.schema.table('appointments', table => {
    table.timestamp('deleted_at').nullable();
    table.index('deleted_at');
  });
};

exports.down = function(knex) {
  return knex.schema.table('appointments', table => {
    table.dropColumn('deleted_at');
  });
};

// 4. Implement Soft Delete
const softDelete = async (table, id) => {
  await pool.query(
    `UPDATE ${table} SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [id]
  );
};

// แก้ไข Query ให้ไม่แสดงข้อมูลที่ถูกลบ
const getActiveAppointments = async (userId) => {
  return await pool.query(`
    SELECT * FROM appointments
    WHERE (student_id = $1 OR advisor_id = $1)
    AND deleted_at IS NULL
    ORDER BY date DESC
  `, [userId]);
};

// 5. เพิ่ม Audit Log
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id INTEGER NOT NULL,
  action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  user_id INTEGER REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

// Trigger Function สำหรับ Audit Log
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_values)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

// สร้าง Trigger สำหรับแต่ละตาราง
CREATE TRIGGER audit_appointments
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

// 6. เพิ่ม Index ที่จำเป็น
CREATE INDEX idx_appointments_project_id ON appointments(project_id);
CREATE INDEX idx_appointments_date_time ON appointments(date, time);
CREATE INDEX idx_appointments_status_date ON appointments(status, date);
CREATE INDEX idx_project_students_student_id ON project_students(student_id);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_comments_appointment_id ON comments(appointment_id);

// Composite Index สำหรับ Query ที่ใช้บ่อย
CREATE INDEX idx_appointments_advisor_status_date 
ON appointments(advisor_id, status, date DESC);

CREATE INDEX idx_appointments_student_status_date 
ON appointments(student_id, status, date DESC);
```

---

### 6. 🎨 Frontend (UI/UX)

#### ข้อจำกัด:
- **ไม่มี Loading States ที่ครบถ้วน**: บาง Action ไม่มี Loading Indicator
- **ใช้ alert() และ confirm()**: ใช้ Browser Alert แทน Modal ที่สวยงาม (บางส่วน)
- **ไม่มี Error Boundary**: ถ้า Component Error จะทำให้ทั้งแอปพังได้
- **ไม่มี Offline Support**: ไม่สามารถใช้งานแบบ Offline ได้
- **ไม่มี Progressive Web App (PWA)**: ไม่สามารถติดตั้งเป็นแอปบนมือถือได้
- **ไม่มี Dark Mode**: ไม่มีโหมดมืดสำหรับผู้ใช้
- **ไม่มี Accessibility Features**: ไม่รองรับ Screen Reader หรือ Keyboard Navigation
- **ไม่มี Responsive Design ที่สมบูรณ์**: บางหน้าอาจแสดงผลไม่ดีบนมือถือ

#### ข้อเสนอแนะ:
```typescript
// 1. เพิ่ม Global Loading State
// contexts/LoadingContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading: setIsLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

// 2. สร้าง Custom Modal Component
// components/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  type = 'info'
}) => {
  if (!isOpen) return null;

  const colors = {
    info: 'bg-blue-600 hover:bg-blue-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    danger: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <div className="mb-6">{children}</div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {cancelText}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-white rounded-lg ${colors[type]}`}
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// แทนที่ alert() ด้วย Modal
const [showModal, setShowModal] = useState(false);
const [modalConfig, setModalConfig] = useState({
  title: '',
  message: '',
  type: 'info' as const
});

const showAlert = (title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success' = 'info') => {
  setModalConfig({ title, message, type });
  setShowModal(true);
};

// 3. เพิ่ม Error Boundary
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // ส่ง error ไปยัง logging service (เช่น Sentry)
    // Sentry.captureException(error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h1>
            <p className="text-gray-700 mb-4">
              ขออภัย เกิดข้อผิดพลาดในระบบ กรุณารีเฟรชหน้าเว็บ
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              รีเฟรชหน้าเว็บ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ใช้งาน
<ErrorBoundary>
  <App />
</ErrorBoundary>

// 4. เพิ่ม PWA Support
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ระบบจัดการนัดหมาย',
        short_name: 'นัดหมาย',
        description: 'ระบบจัดการนัดหมายระหว่างนักศึกษาและอาจารย์',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300
              }
            }
          }
        ]
      }
    })
  ]
});

// 5. เพิ่ม Dark Mode
// contexts/ThemeContext.tsx
const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
} | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1a1a',
          card: '#2d2d2d',
          text: '#e5e5e5'
        }
      }
    }
  }
};

// 6. เพิ่ม Accessibility
// ใช้ semantic HTML
<nav aria-label="Main navigation">
  <button aria-label="เปิดเมนู" aria-expanded={isOpen}>
    <Menu />
  </button>
</nav>

// เพิ่ม keyboard navigation
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
};

<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  aria-label="สร้างนัดหมายใหม่"
>
  สร้างนัดหมาย
</div>

// เพิ่ม focus indicators
.focus-visible:focus {
  @apply ring-2 ring-blue-500 ring-offset-2 outline-none;
}
```

---

### 7. 📊 Performance & Scalability

#### ข้อจำกัด:
- **ไม่มี Caching**: ไม่มีการ Cache ข้อมูลที่ Query บ่อย
- **N+1 Query Problem**: บาง API มี N+1 Query Problem
- **ไม่มี Pagination**: แสดงข้อมูลทั้งหมดในหน้าเดียว
- **ไม่มี CDN**: Static files ไม่ได้ใช้ CDN
- **ไม่มี Load Balancing**: ใช้ Server เดียว
- **ไม่มี Monitoring**: ไม่มีระบบ Monitor Performance

#### ข้อเสนอแนะ:
```javascript
// 1. เพิ่ม Redis Caching
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Cache Middleware
const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Override res.json
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        client.setex(key, duration, JSON.stringify(data));
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

// ใช้งาน
router.get('/appointments', authenticateToken, cacheMiddleware(300), async (req, res) => {
  // ... query logic
});

// Invalidate cache เมื่อมีการแก้ไข
const invalidateCache = async (pattern) => {
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(...keys);
  }
};

router.post('/appointments', authenticateToken, async (req, res) => {
  // ... create appointment
  await invalidateCache('cache:/api/appointments*');
});

// 2. แก้ N+1 Query Problem
// ❌ N+1 Problem
const appointments = await pool.query('SELECT * FROM appointments');
for (const appointment of appointments.rows) {
  const student = await pool.query('SELECT * FROM users WHERE id = $1', [appointment.student_id]);
  appointment.student = student.rows[0];
}

// ✅ ใช้ JOIN แทน
const appointments = await pool.query(`
  SELECT 
    a.*,
    json_build_object(
      'id', s.id,
      'firstName', s.first_name,
      'lastName', s.last_name,
      'email', s.email
    ) as student,
    json_build_object(
      'id', ad.id,
      'firstName', ad.first_name,
      'lastName', ad.last_name,
      'email', ad.email
    ) as advisor
  FROM appointments a
  LEFT JOIN users s ON a.student_id = s.id
  JOIN users ad ON a.advisor_id = ad.id
  WHERE a.advisor_id = $1
`);

// 3. เพิ่ม Pagination
router.get('/appointments', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  const [appointments, countResult] = await Promise.all([
    pool.query(`
      SELECT * FROM appointments
      WHERE advisor_id = $1
      ORDER BY date DESC, time DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, offset]),
    
    pool.query(`
      SELECT COUNT(*) FROM appointments
      WHERE advisor_id = $1
    `, [req.user.id])
  ]);
  
  const total = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(total / limit);
  
  res.json({
    success: true,
    data: appointments.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// Frontend Pagination Component
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const fetchAppointments = async (page: number) => {
  const response = await appointmentAPI.getAppointments(page, 20);
  setAppointments(response.data);
  setTotalPages(response.pagination.totalPages);
};

// 4. เพิ่ม Monitoring
const prometheus = require('prom-client');

// สร้าง Metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, req.route?.path || req.path, res.statusCode).inc();
  });
  
  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});

// 5. Database Query Optimization
// เพิ่ม EXPLAIN ANALYZE
const analyzeQuery = async (query, params) => {
  const result = await pool.query(`EXPLAIN ANALYZE ${query}`, params);
  console.log('Query Plan:', result.rows);
};

// ใช้ Materialized View สำหรับ Dashboard Stats
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
  u.id as user_id,
  COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END) as confirmed_count,
  COUNT(CASE WHEN a.date >= CURRENT_DATE THEN 1 END) as upcoming_count
FROM users u
LEFT JOIN appointments a ON (u.id = a.advisor_id OR u.id = a.student_id)
GROUP BY u.id;

CREATE UNIQUE INDEX idx_dashboard_stats_user ON dashboard_stats(user_id);

// Refresh ทุก 5 นาที
REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
```

---

### 8. 🧪 Testing & Quality Assurance

#### ข้อจำกัด:
- **ไม่มี Unit Tests**: ไม่มีการเขียน Test ใดๆ
- **ไม่มี Integration Tests**: ไม่มีการ Test API Endpoints
- **ไม่มี E2E Tests**: ไม่มีการ Test User Flow
- **ไม่มี Code Coverage**: ไม่ทราบว่า Code ถูก Test ครอบคลุมเท่าไร
- **ไม่มี CI/CD Pipeline**: ไม่มีการ Deploy อัตโนมัติ

#### ข้อเสนอแนะ:
```javascript
// 1. Unit Tests (Jest)
// __tests__/services/emailService.test.js
const emailService = require('../services/emailService');

describe('EmailService', () => {
  describe('sendAppointmentCreatedEmail', () => {
    it('should send email successfully', async () => {
      const appointment = {
        title: 'Test Meeting',
        date: '2025-01-10',
        time: '10:00',
        location: 'Room 101'
      };
      
      const recipient = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };
      
      const result = await emailService.sendAppointmentCreatedEmail(appointment, recipient);
      expect(result).toBe(true);
    });
    
    it('should handle email sending failure', async () => {
      const appointment = { /* ... */ };
      const recipient = { email: 'invalid-email' };
      
      const result = await emailService.sendAppointmentCreatedEmail(appointment, recipient);
      expect(result).toBe(false);
    });
  });
});

// 2. Integration Tests (Supertest)
// __tests__/routes/appointments.test.js
const request = require('supertest');
const app = require('../server');

describe('Appointments API', () => {
  let authToken;
  
  beforeAll(async () => {
    // Login to get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ user: 'test123', password: 'password' });
    authToken = response.body.data.token;
  });
  
  describe('GET /api/appointments', () => {
    it('should return appointments for authenticated user', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/appointments');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /api/appointments', () => {
    it('should create new appointment', async () => {
      const appointmentData = {
        title: 'Test Appointment',
        date: '2025-01-15',
        time: '14:00',
        location: 'Room 202',
        projectId: 1
      };
      
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(appointmentData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(appointmentData.title);
    });
  });
});

// 3. E2E Tests (Playwright)
// e2e/appointments.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Appointment Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5174/login');
    await page.fill('input[name="user"]', 'test123');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });
  
  test('should create new appointment', async ({ page }) => {
    await page.goto('http://localhost:5174/appointments');
    await page.click('button:has-text("สร้างนัดหมายใหม่")');
    
    await page.fill('input[name="title"]', 'E2E Test Meeting');
    await page.fill('input[name="date"]', '2025-01-20');
    await page.fill('input[name="time"]', '15:00');
    await page.fill('input[name="location"]', 'Online');
    await page.selectOption('select[name="projectId"]', '1');
    
    await page.click('button:has-text("สร้างนัดหมาย")');
    
    await expect(page.locator('text=สร้างนัดหมายเรียบร้อยแล้ว')).toBeVisible();
  });
  
  test('should display appointment list', async ({ page }) => {
    await page.goto('http://localhost:5174/appointments');
    
    const appointments = page.locator('[data-testid="appointment-card"]');
    await expect(appointments).toHaveCountGreaterThan(0);
  });
});

// 4. Code Coverage
// package.json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  },
  "jest": {
    "collectCoverageFrom": [
      "backend/**/*.js",
      "!backend/node_modules/**",
      "!backend/coverage/**"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}

// 5. CI/CD Pipeline (.github/workflows/ci.yml)
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        run: |
          cd backend && npm test
          cd ../frontend && npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Deploy script here
```

---

### 9. 📱 Mobile Responsiveness

#### ข้อจำกัด:
- **บางหน้าไม่ Responsive**: ตารางข้อมูลอาจล้นหน้าจอบนมือถือ
- **ไม่มี Mobile-First Design**: ออกแบบจาก Desktop ก่อน
- **Touch Gestures ไม่เหมาะสม**: ปุ่มเล็กเกินไปสำหรับการแตะ

#### ข้อเสนอแนะ:
```css
/* 1. Mobile-First Approach */
/* Base styles for mobile */
.appointment-card {
  padding: 1rem;
  font-size: 0.875rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .appointment-card {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .appointment-card {
    padding: 2rem;
  }
}

/* 2. Touch-Friendly Buttons */
button {
  min-height: 44px; /* iOS recommended touch target */
  min-width: 44px;
  padding: 0.75rem 1.5rem;
}

/* 3. Responsive Tables */
@media (max-width: 768px) {
  .table-responsive {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Stack table on mobile */
  table, thead, tbody, th, td, tr {
    display: block;
  }
  
  thead tr {
    position: absolute;
    top: -9999px;
    left: -9999px;
  }
  
  tr {
    margin-bottom: 1rem;
    border: 1px solid #ddd;
  }
  
  td {
    border: none;
    position: relative;
    padding-left: 50%;
  }
  
  td:before {
    position: absolute;
    left: 6px;
    width: 45%;
    padding-right: 10px;
    white-space: nowrap;
    content: attr(data-label);
    font-weight: bold;
  }
}
```

---

## 🎯 สรุปข้อเสนอแนะตามลำดับความสำคัญ

### ⚡ ความสำคัญสูงสุด (Critical)
1. **เพิ่ม Rate Limiting และ Security Headers**
2. **เพิ่ม Input Validation และ Sanitization**
3. **เพิ่ม Database Backup Strategy**
4. **เพิ่ม Error Handling และ Logging**
5. **เพิ่ม HTTPS และ Security Best Practices**

### 🔥 ความสำคัญสูง (High Priority)
1. **เพิ่ม WebSocket สำหรับ Real-time Notifications**
2. **เพิ่ม Email Queue System**
3. **เพิ่ม Pagination**
4. **เพิ่ม Caching (Redis)**
5. **เพิ่ม Refresh Token**
6. **เพิ่ม Soft Delete และ Audit Log**

### 📊 ความสำคัญปานกลาง (Medium Priority)
1. **เพิ่ม Unit Tests และ Integration Tests**
2. **เพิ่ม CI/CD Pipeline**
3. **เพิ่ม Monitoring และ Logging**
4. **เพิ่ม PWA Support**
5. **เพิ่ม Conflict Detection**
6. **เพิ่ม Calendar Integration**

### 🎨 ความสำคัญต่ำ (Low Priority)
1. **เพิ่ม Dark Mode**
2. **เพิ่ม Recurring Appointments**
3. **เพิ่ม File Attachments**
4. **เพิ่ม Video Conference Integration**
5. **เพิ่ม Accessibility Features**

---

## 📚 แหล่งข้อมูลเพิ่มเติม

### Security
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Performance
- [Web.dev Performance](https://web.dev/performance/)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)

### Testing
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)

### DevOps
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

**หมายเหตุ**: เอกสารนี้เป็นแนวทางในการพัฒนาระบบให้ดีขึ้น ไม่จำเป็นต้องทำทั้งหมดในครั้งเดียว ควรเลือกทำตามลำดับความสำคัญและทรัพยากรที่มี
