# การติดตั้งอย่างรวดเร็ว

## ขั้นตอนที่ 1: ติดตั้ง Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

## ขั้นตอนที่ 2: ตั้งค่าฐานข้อมูล PostgreSQL

1. สร้างฐานข้อมูล:
```sql
CREATE DATABASE appointment_db;
```

2. ตั้งค่า environment variables ใน `backend/.env`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=appointment_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-here
```

3. รัน setup script:
```bash
cd backend
npm run setup
```

## ขั้นตอนที่ 3: รันแอปพลิเคชัน

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
npm run dev
```

## ข้อมูลสำหรับการทดสอบ

หลังจากรัน setup script แล้ว คุณสามารถใช้ข้อมูลต่อไปนี้ในการเข้าสู่ระบบ:

### อาจารย์ที่ปรึกษา
- เบอร์โทร: `0812345678`

### นักศึกษา
- เลขนักศึกษา: `6400000001`
- เบอร์โทร: `0898765432`

## การเข้าถึงแอปพลิเคชัน

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health
