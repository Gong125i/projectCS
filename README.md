# ระบบนัดหมายระหว่างนักศึกษาและอาจารย์ที่ปรึกษา

ระบบจัดการนัดหมายระหว่างนักศึกษาและอาจารย์ที่ปรึกษา พัฒนาด้วย React + TypeScript + Tailwind CSS สำหรับ Frontend และ Express.js + PostgreSQL สำหรับ Backend

## ฟีเจอร์หลัก

### สำหรับนักศึกษา
- ✅ แก้ไขข้อมูลบัญชีตัวเอง (ชื่อ นามสกุล, เบอร์โทร)
- ✅ ดูตารางเวลาของอาจารย์ที่ปรึกษา
- ✅ นัดหมายอาจารย์ที่ปรึกษา (วัน–เวลา–สถานที่–หมายเหตุ)
- ✅ ยกเลิกหรือแก้ไขการนัดหมาย
- ✅ ติดตามความคืบหน้าของโครงงาน
- ✅ บันทึกผลการนัดหมายหรือข้อสรุปหลังการนัดหมายเสร็จสิ้น
- ✅ ระบบแจ้งเตือนเมื่อใกล้ถึงเวลานัดหมาย
- ✅ เข้าสู่ระบบด้วยเลขนักศึกษา + เบอร์โทรศัพท์

### สำหรับอาจารย์ที่ปรึกษา
- ✅ แก้ไขข้อมูลบัญชีตัวเอง (ชื่อ–นามสกุล, เบอร์โทร, อีเมล, ห้องทำงาน)
- ✅ สร้างโครงงานใหม่
- ✅ แก้ไขข้อมูลโครงงาน
- ✅ เชิญนักศึกษาเข้าร่วมโครงงาน (ใช้รหัสนักศึกษา)
- ✅ ลบนักศึกษาออกจากโครงงาน
- ✅ ลบโครงงาน
- ✅ นัดหมายนักศึกษา
- ✅ จัดการตารางเวลานัดหมาย
- ✅ ให้คำแนะนำหรือความคิดเห็นแก่นักศึกษา
- ✅ ยืนยันหรือปฏิเสธการนัดหมาย
- ✅ ระบบแจ้งเตือนเมื่อใกล้ถึงเวลานัดหมาย
- ✅ Import ไฟล์ CSV ที่มีข้อมูลนักศึกษา/อาจารย์
- ✅ เข้าสู่ระบบด้วยเบอร์โทรศัพท์

## การติดตั้ง

### ข้อกำหนดเบื้องต้น
- Node.js (v16 หรือสูงกว่า)
- PostgreSQL (v12 หรือสูงกว่า)
- npm หรือ yarn

### 1. Clone โปรเจค
```bash
git clone <repository-url>
cd appointmentproject
```

### 2. ติดตั้ง Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 3. ตั้งค่าฐานข้อมูล PostgreSQL
1. สร้างฐานข้อมูลใหม่:
```sql
CREATE DATABASE appointment_db;
```

2. รัน SQL schema:
```bash
psql -d appointment_db -f backend/database/schema.sql
```

### 4. ตั้งค่า Environment Variables
สร้างไฟล์ `backend/.env`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=appointment_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-here
```

### 5. เพิ่มข้อมูลเริ่มต้น (Optional)
รันคำสั่ง SQL เพื่อเพิ่มผู้ใช้ทดสอบ:

```sql
-- เพิ่มอาจารย์ที่ปรึกษา
INSERT INTO users (first_name, last_name, phone, email, office, role) 
VALUES ('อาจารย์', 'ทดสอบ', '0812345678', 'advisor@test.com', 'ห้อง 101', 'advisor');

-- เพิ่มนักศึกษา
INSERT INTO users (student_id, first_name, last_name, phone, role) 
VALUES ('6400000001', 'นักศึกษา', 'ทดสอบ', '0898765432', 'student');
```

### 6. รันแอปพลิเคชัน

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
npm run dev
```

แอปพลิเคชันจะทำงานที่:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## การใช้งาน

### การเข้าสู่ระบบ
- **นักศึกษา**: ใช้เลขนักศึกษา + เบอร์โทรศัพท์
- **อาจารย์ที่ปรึกษา**: ใช้เบอร์โทรศัพท์เท่านั้น

### การ Import ข้อมูลผู้ใช้
1. สร้างไฟล์ CSV ตามรูปแบบ:
```csv
firstName,lastName,studentId,phone,email,role
อาจารย์,ทดสอบ,,0812345678,advisor@test.com,advisor
นักศึกษา,ทดสอบ,6400000001,0898765432,,student
```

2. ไปที่หน้า "ผู้ใช้" (สำหรับอาจารย์ที่ปรึกษาเท่านั้น)
3. คลิก "Import CSV" และเลือกไฟล์

## โครงสร้างโปรเจค

```
appointmentproject/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── backend/               # Backend source code
│   ├── config/            # Configuration files
│   ├── database/          # Database schema
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   └── server.js          # Main server file
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - เข้าสู่ระบบ
- `GET /api/auth/me` - ข้อมูลผู้ใช้ปัจจุบัน

### Users
- `GET /api/users` - รายชื่อผู้ใช้ทั้งหมด (อาจารย์เท่านั้น)
- `PUT /api/users/:id` - อัปเดตข้อมูลผู้ใช้

### Projects
- `GET /api/projects` - รายการโครงงาน
- `POST /api/projects` - สร้างโครงงานใหม่
- `PUT /api/projects/:id` - แก้ไขโครงงาน
- `DELETE /api/projects/:id` - ลบโครงงาน
- `POST /api/projects/:id/students` - เชิญนักศึกษา
- `DELETE /api/projects/:id/students/:studentId` - ลบนักศึกษา

### Appointments
- `GET /api/appointments` - รายการนัดหมาย
- `POST /api/appointments` - สร้างนัดหมายใหม่
- `PUT /api/appointments/:id` - แก้ไขนัดหมาย
- `DELETE /api/appointments/:id` - ลบนัดหมาย
- `PUT /api/appointments/:id/confirm` - ยืนยันนัดหมาย
- `PUT /api/appointments/:id/reject` - ปฏิเสธนัดหมาย
- `PUT /api/appointments/:id/complete` - เสร็จสิ้นนัดหมาย
- `POST /api/appointments/:id/comments` - เพิ่มคอมเมนต์
- `GET /api/appointments/:id/comments` - ดูคอมเมนต์

### Notifications
- `GET /api/notifications` - รายการการแจ้งเตือน
- `PUT /api/notifications/:id/read` - ทำเครื่องหมายว่าอ่านแล้ว
- `PUT /api/notifications/read-all` - ทำเครื่องหมายว่าอ่านแล้วทั้งหมด

### Import
- `POST /api/import/users` - Import ข้อมูลผู้ใช้จาก CSV

## การพัฒนา

### Frontend Development
```bash
npm run dev          # รัน development server
npm run build        # Build สำหรับ production
npm run lint         # ตรวจสอบ code quality
```

### Backend Development
```bash
cd backend
npm run dev          # รัน development server with nodemon
npm start            # รัน production server
```

## เทคโนโลยีที่ใช้

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React (Icons)
- date-fns

### Backend
- Express.js
- PostgreSQL
- JWT Authentication
- Multer (File upload)
- CSV Parser
- bcryptjs

## การแก้ไขปัญหา

### ปัญหาการเชื่อมต่อฐานข้อมูล
1. ตรวจสอบว่า PostgreSQL กำลังทำงาน
2. ตรวจสอบการตั้งค่าใน `backend/.env`
3. ตรวจสอบว่า database `appointment_db` ถูกสร้างแล้ว

### ปัญหา CORS
ตรวจสอบว่า backend กำลังทำงานที่ port 3001 และ frontend ใช้ port 5173

### ปัญหา Authentication
ตรวจสอบว่า JWT_SECRET ถูกตั้งค่าใน environment variables

## License

ISC License
