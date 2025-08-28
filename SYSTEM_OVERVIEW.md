# ภาพรวมระบบนัดหมาย

## สถาปัตยกรรมระบบ

### Frontend (React + TypeScript)
- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **React Router DOM** - Navigation
- **Axios** - HTTP Client
- **Lucide React** - Icons
- **date-fns** - Date manipulation

### Backend (Express.js + PostgreSQL)
- **Express.js** - Web Framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Multer** - File upload
- **CSV Parser** - CSV processing
- **bcryptjs** - Password hashing

## โครงสร้างฐานข้อมูล

### ตารางหลัก
1. **users** - ข้อมูลผู้ใช้ (นักศึกษา/อาจารย์)
2. **projects** - ข้อมูลโครงงาน
3. **project_students** - ความสัมพันธ์ระหว่างโครงงานและนักศึกษา
4. **appointments** - ข้อมูลนัดหมาย
5. **comments** - คอมเมนต์ในนัดหมาย
6. **notifications** - การแจ้งเตือน

### ความสัมพันธ์
- อาจารย์สามารถสร้างโครงงานได้หลายโครงงาน
- นักศึกษาสามารถอยู่ในโครงงานได้หลายโครงงาน
- นัดหมายเชื่อมโยงระหว่างนักศึกษาและอาจารย์
- คอมเมนต์เชื่อมโยงกับนัดหมาย
- การแจ้งเตือนเชื่อมโยงกับผู้ใช้และนัดหมาย

## ฟีเจอร์หลัก

### การจัดการผู้ใช้
- **นักศึกษา**: เข้าสู่ระบบด้วยเลขนักศึกษา + เบอร์โทร
- **อาจารย์**: เข้าสู่ระบบด้วยเบอร์โทรเท่านั้น
- แก้ไขข้อมูลส่วนตัว
- Import ข้อมูลผู้ใช้จาก CSV (อาจารย์เท่านั้น)

### การจัดการโครงงาน
- อาจารย์สร้างโครงงาน
- เชิญนักศึกษาเข้าร่วมโครงงาน
- ลบนักศึกษาออกจากโครงงาน
- ลบโครงงาน

### การจัดการนัดหมาย
- สร้างนัดหมาย (นักศึกษา/อาจารย์)
- แก้ไขนัดหมาย (ก่อนยืนยัน)
- ยืนยัน/ปฏิเสธนัดหมาย (อาจารย์)
- เสร็จสิ้นนัดหมาย
- เพิ่มคอมเมนต์ในนัดหมาย

### ระบบแจ้งเตือน
- แจ้งเตือนเมื่อมีการสร้างนัดหมายใหม่
- แจ้งเตือนเมื่อนัดหมายได้รับการยืนยัน/ปฏิเสธ
- แจ้งเตือนเมื่อใกล้ถึงเวลานัดหมาย
- ทำเครื่องหมายว่าอ่านแล้ว

## การทำงานของระบบ

### 1. การเข้าสู่ระบบ
```
Frontend → Backend (/api/auth/login) → Database → JWT Token → Frontend
```

### 2. การสร้างนัดหมาย
```
Frontend → Backend (/api/appointments) → Database → Notification → Frontend
```

### 3. การยืนยันนัดหมาย
```
Frontend → Backend (/api/appointments/:id/confirm) → Database → Notification → Frontend
```

### 4. การ Import CSV
```
Frontend → Backend (/api/import/users) → CSV Parser → Database → Frontend
```

## การรักษาความปลอดภัย

### Authentication
- JWT Token สำหรับการยืนยันตัวตน
- Token หมดอายุใน 7 วัน
- Middleware ตรวจสอบ token ในทุก API ที่ต้องการ authentication

### Authorization
- Role-based access control
- นักศึกษาสามารถเข้าถึงข้อมูลของตัวเองเท่านั้น
- อาจารย์สามารถเข้าถึงข้อมูลที่เกี่ยวข้องกับตัวเอง

### Validation
- ตรวจสอบข้อมูลที่ส่งมาจาก Frontend
- ตรวจสอบความถูกต้องของข้อมูลก่อนบันทึกลงฐานข้อมูล
- ตรวจสอบการซ้ำของข้อมูล (เบอร์โทร, เลขนักศึกษา)

## การจัดการข้อผิดพลาด

### Frontend
- Error boundaries สำหรับ React components
- Loading states สำหรับการโหลดข้อมูล
- Error messages สำหรับผู้ใช้

### Backend
- Try-catch blocks ในทุก API endpoints
- Proper HTTP status codes
- Detailed error messages สำหรับ debugging

## การปรับปรุงประสิทธิภาพ

### Database
- Indexes สำหรับ fields ที่ใช้ในการค้นหาบ่อย
- Proper foreign key constraints
- Efficient queries ด้วย JOINs

### Frontend
- React.memo สำหรับ components ที่ไม่เปลี่ยนแปลงบ่อย
- Lazy loading สำหรับ routes
- Optimized re-renders

## การทดสอบ

### Manual Testing
- ทดสอบการเข้าสู่ระบบด้วยข้อมูลที่ถูกต้อง/ไม่ถูกต้อง
- ทดสอบการสร้าง/แก้ไข/ลบข้อมูล
- ทดสอบการ import CSV
- ทดสอบการแจ้งเตือน

### API Testing
- ทดสอบ endpoints ด้วย Postman หรือ curl
- ทดสอบ authentication/authorization
- ทดสอบ error handling

## การ Deploy

### Frontend
- Build ด้วย `npm run build`
- Deploy ไปยัง static hosting (Netlify, Vercel, etc.)

### Backend
- Deploy ไปยัง cloud platform (Heroku, AWS, etc.)
- ตั้งค่า environment variables
- ตั้งค่าฐานข้อมูล PostgreSQL

## การบำรุงรักษา

### Database
- Regular backups
- Monitor performance
- Update indexes as needed

### Application
- Update dependencies
- Monitor logs
- Fix bugs and add features
- Performance optimization
