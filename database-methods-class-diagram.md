# Class Diagram: Database ↔ Methods (API & Services)
## ระบบจัดการนัดหมาย - Appointment Management System

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    DATABASE ↔ METHODS CLASS DIAGRAM                        │
│                      (Entity - Controller - Service)                       │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 **Architecture Overview**

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Client    │ ───▶ │  API Routes  │ ───▶ │  Database    │ ───▶ │   Services   │
│  (Frontend) │ ◀─── │ (Controller) │ ◀─── │  (Entities)  │      │   (Email)    │
└─────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
```

---

## 1️⃣ **Users Entity & Methods**

### 📦 **Database Entity**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         «entity»                  ┃
┃          Users                    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ - id: INTEGER «PK»                ┃
┃ - student_id: VARCHAR(20)         ┃
┃ - first_name: VARCHAR(100)        ┃
┃ - last_name: VARCHAR(100)         ┃
┃ - phone: VARCHAR(20)              ┃
┃ - email: VARCHAR(255)             ┃
┃ - office: VARCHAR(100)            ┃
┃ - role: VARCHAR(20)               ┃
┃ - password_hash: VARCHAR(255)     ┃
┃ - created_at: TIMESTAMP           ┃
┃ - updated_at: TIMESTAMP           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
            ▲
            │ uses
            │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              «controller»                          ┃
┃            UsersController                         ┃
┃         /backend/routes/users.js                   ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ + GET    /api/users                                ┃
┃   getAllUsers(): User[]                            ┃
┃   • Query: SELECT * FROM users                     ┃
┃   • Auth: Advisor only                             ┃
┃   • Returns: List of all users                     ┃
┃                                                     ┃
┃ + PUT    /api/users/:id                            ┃
┃   updateUser(id, data): User                       ┃
┃   • Query: UPDATE users SET ... WHERE id = $1      ┃
┃   • Auth: Self or Advisor                          ┃
┃   • Validates: phone uniqueness                    ┃
┃                                                     ┃
┃ + POST   /api/users                                ┃
┃   createUser(data): User                           ┃
┃   • Query: INSERT INTO users ...                   ┃
┃   • Auth: Advisor only                             ┃
┃   • Validates: phone, student_id uniqueness        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              «controller»                          ┃
┃            AuthController                          ┃
┃          /backend/routes/auth.js                   ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ + POST   /api/auth/login                           ┃
┃   login(credentials): {user, token}                ┃
┃   • Query: SELECT * FROM users WHERE student_id    ┃
┃   • Validates: password with bcrypt                ┃
┃   • Returns: JWT token                             ┃
┃                                                     ┃
┃ + GET    /api/auth/me                              ┃
┃   getCurrentUser(): User                           ┃
┃   • Query: SELECT * FROM users WHERE id = $1       ┃
┃   • Auth: Required                                 ┃
┃                                                     ┃
┃ + PUT    /api/auth/change-password                 ┃
┃   changePassword(oldPwd, newPwd): Success          ┃
┃   • Query: UPDATE users SET password_hash          ┃
┃   • Hashes: password with bcrypt                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              «controller»                          ┃
┃            ImportController                        ┃
┃         /backend/routes/import.js                  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ + POST   /api/import/users                         ┃
┃   importUsersFromCSV(file): {success, errors}      ┃
┃   • Query: INSERT INTO users (batch)               ┃
┃   • Validates: CSV format, required fields         ┃
┃   • Uses: multer for file upload                   ┃
┃   • Uses: csv-parser for parsing                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### 📝 **คำอธิบาย Methods แบบละเอียด**

#### **UsersController:**

**1. getAllUsers(): User[]**
```javascript
GET /api/users
Parameters: ไม่มี (ใช้ req.user จาก JWT)
Returns: User[] - อาเรย์ของ User objects
Attributes ที่ return: id, student_id, first_name, last_name, phone, email, office, role, created_at, updated_at
```
- **คำอธิบาย**: ดึงรายการผู้ใช้ทั้งหมดในระบบ (เฉพาะอาจารย์เท่านั้น) ใช้สำหรับหน้าจัดการผู้ใช้และเพิ่มนักศึกษาเข้าโปรเจค
- **Authorization**: Advisor only
- **Query**: `SELECT * FROM users ORDER BY created_at DESC`

**2. updateUser(id: number, data: UpdateUserDto): User**
```javascript
PUT /api/users/:id
Parameters:
  - id: number (URL param) - User ID ที่จะแก้ไข
  - firstName?: string (optional) - ชื่อใหม่
  - lastName?: string (optional) - นามสกุลใหม่
  - phone?: string (optional) - เบอร์โทรใหม่ (ต้อง unique)
  - email?: string (optional) - อีเมลใหม่
  - office?: string (optional) - ห้องทำงานใหม่
Returns: User - User object ที่แก้ไขแล้ว
Attributes ที่ return: ทุก attributes ของ User
```
- **คำอธิบาย**: แก้ไขข้อมูลผู้ใช้ (partial update - ส่งเฉพาะที่ต้องการเปลี่ยน) ตัวเองแก้ไขได้หรืออาจารย์แก้ไขให้คนอื่นได้
- **Authorization**: Self or Advisor
- **Validations**: phone uniqueness, ownership check

**3. createUser(data: CreateUserDto): User**
```javascript
POST /api/users
Parameters:
  - studentId?: string (optional) - รหัสนักศึกษา/อาจารย์ (ต้อง unique)
  - firstName: string (required) - ชื่อ
  - lastName: string (required) - นามสกุล
  - phone: string (required) - เบอร์โทร (ต้อง unique)
  - email?: string (optional) - อีเมล
  - office?: string (optional) - ห้องทำงาน
  - role: 'student' | 'advisor' (required) - บทบาท
Returns: User - User object ที่สร้างใหม่
Attributes ที่ return: ทุก attributes ของ User (password_hash = null)
```
- **คำอธิบาย**: สร้างผู้ใช้ใหม่ในระบบ (เฉพาะอาจารย์) ตรวจสอบไม่ให้เบอร์โทรและรหัสนักศึกษาซ้ำ รหัสผ่านเริ่มต้นคือ student_id
- **Authorization**: Advisor only
- **Validations**: phone uniqueness, student_id uniqueness

---

#### **AuthController:**

**1. login(credentials: LoginDto): {user: User, token: string}**
```javascript
POST /api/auth/login
Parameters:
  - user: string (required) - รหัสนักศึกษา/อาจารย์
  - password: string (required) - รหัสผ่าน
Returns: Object {
  user: User - ข้อมูลผู้ใช้ (ไม่มี password_hash)
  token: string - JWT token
}
Attributes ที่ return (user): id, student_id, first_name, last_name, phone, email, office, role
```
- **คำอธิบาย**: เข้าสู่ระบบด้วยรหัสนักศึกษาและรหัสผ่าน ตรวจสอบรหัสผ่านด้วย bcrypt (ถ้ามี password_hash) หรือเปรียบเทียบกับ student_id (ถ้ายังไม่เปลี่ยนรหัสผ่าน) และคืนค่า JWT token สำหรับใช้งานต่อ
- **JWT Payload**: `{userId: number, role: string}`, expires: 7d
- **Performance**: 50-80ms

**2. getCurrentUser(): User**
```javascript
GET /api/auth/me
Headers:
  - Authorization: Bearer <JWT_TOKEN> (required)
Parameters: ไม่มี (ดึงข้อมูลจาก JWT token ที่ส่งมาใน header)
Returns: User - ข้อมูลผู้ใช้ปัจจุบัน (ไม่รวม password_hash)
Attributes ที่ return: 
  - id: number
  - student_id: string | null
  - first_name: string
  - last_name: string
  - phone: string
  - email: string | null
  - office: string | null
  - role: 'student' | 'advisor'
  - created_at: timestamp
  - updated_at: timestamp
```
- **คำอธิบาย**: ดึงข้อมูลผู้ใช้ปัจจุบันจาก JWT token ที่ login ไว้ ใช้สำหรับแสดงข้อมูลโปรไฟล์ และตรวจสอบสถานะการ login
- **Authorization**: Required (JWT token)
- **Process Flow**:
  1. Client ส่ง request พร้อม JWT token ใน header
  2. Middleware `authenticateToken` ตรวจสอบ token
  3. ถ้า token ถูกต้อง → decode ได้ userId และ role
  4. Query user จาก database: `SELECT * FROM users WHERE id = userId`
  5. Middleware set `req.user` = User object
  6. Controller return `req.user` (ไม่ต้อง query ซ้ำ)
- **Use Cases**:
  - เช็คว่า user ยัง login อยู่หรือไม่
  - โหลดข้อมูล user สำหรับแสดงใน navbar/header
  - ดึงข้อมูลโปรไฟล์สำหรับหน้า Profile
  - ตรวจสอบ role เพื่อแสดง/ซ่อนเมนูตาม permission
- **Performance**: <5ms (อ่านจาก `req.user` ที่ middleware เตรียมไว้แล้ว ไม่ query DB ซ้ำ)
- **Error Responses**:
  - 401: ไม่มี token หรือ token หมดอายุ
  - 403: token ไม่ถูกต้อง
  - 401: ไม่พบ user ในระบบ (ถูกลบไปแล้ว)

**ตัวอย่างการใช้งาน:**
```javascript
// Frontend - Get current user info
const getCurrentUser = async () => {
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('Current user:', user);
      // { id: 5, firstName: 'John', role: 'student', ... }
    }
  } catch (error) {
    console.error('Not authenticated');
    // Redirect to login
  }
};

// Backend Controller Implementation
router.get('/me', authenticateToken, async (req, res) => {
  // req.user ถูก set โดย authenticateToken middleware แล้ว
  // ไม่ต้อง query database อีกครั้ง
  return res.json(req.user);
});
```

**Security Notes:**
- ⚠️ **ไม่ return password_hash** ในข้อมูล user (ลบออกก่อน return)
- ✅ Token จะหมดอายุหลัง 7 วัน (ต้อง login ใหม่)
- ✅ ใช้ HTTPS ในการส่ง token (production)
- ✅ ตรวจสอบ token signature ทุกครั้ง

**3. changePassword(passwords: ChangePasswordDto): {success: boolean}**
```javascript
PUT /api/auth/change-password
Parameters:
  - currentPassword: string (required) - รหัสผ่านปัจจุบัน
  - newPassword: string (required) - รหัสผ่านใหม่ (min 6 chars)
Returns: Object {
  success: boolean - ผลการดำเนินการ
  message: string - ข้อความตอบกลับ
}
```
- **คำอธิบาย**: เปลี่ยนรหัสผ่าน ต้องยืนยันรหัสผ่านเก่าก่อนแล้วเข้ารหัสรหัสผ่านใหม่ด้วย bcrypt (10 rounds)
- **Authorization**: Required
- **Validations**: verify current password, min length 6
- **Performance**: 60-120ms (bcrypt hashing)

---

#### **ImportController:**

**1. importUsersFromCSV(file: File): {success: number, errors: Array}**
```javascript
POST /api/import/users
Parameters:
  - file: File (multipart/form-data) - ไฟล์ CSV
  CSV Format: student_id,first_name,last_name,phone,email,office,role
Returns: Object {
  success: number - จำนวนที่นำเข้าสำเร็จ
  errors: Array<{row: number, error: string}> - รายการข้อผิดพลาด
  total: number - จำนวนทั้งหมด
}
```
- **คำอธิบาย**: นำเข้าผู้ใช้จากไฟล์ CSV แบบ batch (หลายคนพร้อมกัน) ตรวจสอบรูปแบบไฟล์และฟิลด์ที่จำเป็น คืนค่าผลสำเร็จและข้อผิดพลาด (ถ้ามี)
- **Authorization**: Advisor only
- **Validations**: CSV format, required fields (first_name, last_name, phone, role)
- **Uses**: multer (file upload), csv-parser (parsing)

---

## 2️⃣ **Projects Entity & Methods**

### 📦 **Database Entity**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         «entity»                  ┃
┃         Projects                  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ - id: INTEGER «PK»                ┃
┃ - name: VARCHAR(255)              ┃
┃ - advisor_id: INTEGER «FK»        ┃
┃ - created_at: TIMESTAMP           ┃
┃ - updated_at: TIMESTAMP           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
            ▲
            │ uses
            │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              «controller»                          ┃
┃          ProjectsController                        ┃
┃        /backend/routes/projects.js                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ + GET    /api/projects                             ┃
┃   getProjects(): Project[]                         ┃
┃   • Query: SELECT p.*, u.* FROM projects p         ┃
┃            JOIN users u ON p.advisor_id = u.id     ┃
┃   • Includes: students via project_students        ┃
┃   • Filter: by advisor or student role             ┃
┃                                                     ┃
┃ + GET    /api/projects/:id                         ┃
┃   getProjectById(id): Project                      ┃
┃   • Query: SELECT with JOINs                       ┃
┃   • Includes: advisor, students                    ┃
┃                                                     ┃
┃ + POST   /api/projects                             ┃
┃   createProject(data): Project                     ┃
┃   • Query: INSERT INTO projects                    ┃
┃   • Auth: Advisor only                             ┃
┃                                                     ┃
┃ + PUT    /api/projects/:id                         ┃
┃   updateProject(id, data): Project                 ┃
┃   • Query: UPDATE projects WHERE id = $1           ┃
┃   • Auth: Owner advisor only                       ┃
┃                                                     ┃
┃ + DELETE /api/projects/:id                         ┃
┃   deleteProject(id): Success                       ┃
┃   • Query: DELETE FROM projects WHERE id = $1      ┃
┃   • Cascade: Deletes related project_students      ┃
┃                                                     ┃
┃ + POST   /api/projects/:id/students                ┃
┃   addStudent(projectId, studentId): Success        ┃
┃   • Query: INSERT INTO project_students            ┃
┃   • Validates: student exists, not duplicate       ┃
┃                                                     ┃
┃ + DELETE /api/projects/:id/students/:studentId     ┃
┃   removeStudent(projectId, studentId): Success     ┃
┃   • Query: DELETE FROM project_students            ┃
┃   • Validates: student is in project               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### 📝 **คำอธิบาย Methods แบบละเอียด**

#### **ProjectsController:**

**1. getProjects(): Project[]**
```javascript
GET /api/projects
Parameters: ไม่มี (ใช้ req.user จาก JWT สำหรับ filtering)
Returns: Project[] - อาเรย์ของ Project objects
Attributes ที่ return (Project):
  - id: number
  - name: string
  - advisor_id: number
  - created_at: timestamp
  - updated_at: timestamp
  - advisor: User object (joined)
  - students: User[] (joined via project_students)
```
- **คำอธิบาย**: ดึงรายการโปรเจคทั้งหมด (ถ้าเป็นอาจารย์เห็นโปรเจคตัวเอง, ถ้าเป็นนักศึกษาเห็นโปรเจคที่ตัวเองอยู่) แสดงพร้อมข้อมูลอาจารย์ที่ปรึกษาและนักศึกษาทั้งหมดในโปรเจค
- **Query**: `SELECT p.*, u.* FROM projects p JOIN users u ON p.advisor_id = u.id`
- **Filter**: by advisor_id or student_id (depends on role)

**2. getProjectById(id: number): Project**
```javascript
GET /api/projects/:id
Parameters:
  - id: number (URL param) - Project ID
Returns: Project - Project object พร้อมรายละเอียด
Attributes ที่ return: id, name, advisor_id, created_at, updated_at, advisor (User), students (User[])
```
- **คำอธิบาย**: ดึงข้อมูลโปรเจคตาม ID โดยละเอียด รวมอาจารย์ที่ปรึกษาและรายชื่อนักศึกษาทั้งหมด
- **Query**: SELECT with JOINs (users, project_students)

**3. createProject(data: CreateProjectDto): Project**
```javascript
POST /api/projects
Parameters:
  - name: string (required) - ชื่อโปรเจค
  - studentIds: number[] (optional) - รายการ student IDs ที่จะเพิ่มเข้าโปรเจค
Returns: Project - Project object ที่สร้างใหม่
Attributes ที่ return: id, name, advisor_id, created_at, updated_at
```
- **คำอธิบาย**: สร้างโปรเจคใหม่ (เฉพาะอาจารย์) ระบุชื่อโปรเจคและเพิ่มนักศึกษาเข้าไป
- **Authorization**: Advisor only
- **Query**: INSERT INTO projects + INSERT INTO project_students (if studentIds provided)

**4. updateProject(id: number, data: UpdateProjectDto): Project**
```javascript
PUT /api/projects/:id
Parameters:
  - id: number (URL param) - Project ID
  - name: string (required) - ชื่อโปรเจคใหม่
Returns: Project - Project object ที่แก้ไขแล้ว
Attributes ที่ return: id, name, advisor_id, created_at, updated_at
```
- **คำอธิบาย**: แก้ไขชื่อโปรเจค (เฉพาะอาจารย์เจ้าของโปรเจคเท่านั้น)
- **Authorization**: Owner advisor only
- **Validations**: ownership check

**5. deleteProject(id: number): {success: boolean}**
```javascript
DELETE /api/projects/:id
Parameters:
  - id: number (URL param) - Project ID ที่จะลบ
Returns: Object {
  success: boolean - ผลการดำเนินการ
  message: string - ข้อความตอบกลับ
}
```
- **คำอธิบาย**: ลบโปรเจค (เฉพาะอาจารย์เจ้าของ) จะลบข้อมูลนักศึกษาในโปรเจคอัตโนมัติด้วย (CASCADE)
- **Authorization**: Owner advisor only
- **Cascade**: Deletes project_students automatically

**6. addStudent(projectId: number, studentId: number): {success: boolean}**
```javascript
POST /api/projects/:id/students
Parameters:
  - projectId: number (URL param) - Project ID
  - studentId: number (body) - Student ID ที่จะเพิ่ม
Returns: Object {
  success: boolean - ผลการดำเนินการ
  message: string - ข้อความตอบกลับ
}
```
- **คำอธิบาย**: เพิ่มนักศึกษาเข้าโปรเจค ตรวจสอบว่านักศึกษามีอยู่จริงและยังไม่ได้อยู่ในโปรเจคนี้แล้ว
- **Authorization**: Owner advisor only
- **Validations**: student exists, not duplicate, is student role
- **Query**: INSERT INTO project_students

**7. removeStudent(projectId: number, studentId: number): {success: boolean}**
```javascript
DELETE /api/projects/:id/students/:studentId
Parameters:
  - projectId: number (URL param) - Project ID
  - studentId: number (URL param) - Student ID ที่จะเอาออก
Returns: Object {
  success: boolean - ผลการดำเนินการ
  message: string - ข้อความตอบกลับ
}
```
- **คำอธิบาย**: เอานักศึกษาออกจากโปรเจค ตรวจสอบว่านักศึกษาอยู่ในโปรเจคจริงก่อนลบ
- **Authorization**: Owner advisor only
- **Validations**: student is in project
- **Query**: DELETE FROM project_students

---

## 3️⃣ **Appointments Entity & Methods**

### 📦 **Database Entity**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         «entity»                  ┃
┃       Appointments                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ - id: INTEGER «PK»                ┃
┃ - title: VARCHAR(255)             ┃
┃ - date: DATE                      ┃
┃ - time: TIME                      ┃
┃ - location: VARCHAR(255)          ┃
┃ - notes: TEXT                     ┃
┃ - status: VARCHAR(20)             ┃
┃ - student_id: INTEGER «FK»        ┃
┃ - advisor_id: INTEGER «FK»        ┃
┃ - project_id: INTEGER «FK»        ┃
┃ - created_at: TIMESTAMP           ┃
┃ - updated_at: TIMESTAMP           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
            ▲
            │ uses
            │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    «controller»                                  ┃
┃                 AppointmentsController                           ┃
┃              /backend/routes/appointments.js                     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ + GET    /api/appointments                                       ┃
┃   getAppointments(): Appointment[]                               ┃
┃   • Query: SELECT a.*, s.*, ad.*, p.* FROM appointments a        ┃
┃            LEFT JOIN users s, users ad, projects p               ┃
┃   • Filter: by advisor_id or student_id                          ┃
┃   • Order: by date DESC                                          ┃
┃                                                                   ┃
┃ + GET    /api/appointments/:id                                   ┃
┃   getAppointmentById(id): Appointment                            ┃
┃   • Query: SELECT with JOINs                                     ┃
┃   • Includes: student, advisor, project, comments                ┃
┃                                                                   ┃
┃ + POST   /api/appointments                                       ┃
┃   createAppointment(data): Appointment                           ┃
┃   • Query: INSERT INTO appointments                              ┃
┃   • Creates: notification for recipient                          ┃
┃   • Sends: email (background) via EmailService                   ┃
┃   • Logic: student → advisor, advisor → all students             ┃
┃                                                                   ┃
┃ + PUT    /api/appointments/:id                                   ┃
┃   updateAppointment(id, data): Appointment                       ┃
┃   • Query: UPDATE appointments SET ..., status = 'pending_*'     ┃
┃   • Creates: notification for other party                        ┃
┃   • Sends: email (background)                                    ┃
┃   • Changes: status to pending_*_confirmation                    ┃
┃                                                                   ┃
┃ + DELETE /api/appointments/:id                                   ┃
┃   deleteAppointment(id): Success                                 ┃
┃   • Query: DELETE FROM appointments WHERE id = $1                ┃
┃   • Cascade: Deletes comments, updates notifications             ┃
┃                                                                   ┃
┃ + PUT    /api/appointments/:id/status/:status                    ┃
┃   updateStatus(id, status): Appointment                          ┃
┃   • Query: UPDATE appointments SET status = $1                   ┃
┃   • Statuses: pending, confirmed, rejected, cancelled            ┃
┃   • Creates: notification                                        ┃
┃   • Sends: email (background)                                    ┃
┃                                                                   ┃
┃ + PUT    /api/appointments/:id/confirm-changes                   ┃
┃   studentConfirmChanges(id): Appointment                         ┃
┃   • Query: UPDATE SET status = 'confirmed'                       ┃
┃   • Creates: notification to advisor                             ┃
┃   • Sends: email to advisor                                      ┃
┃                                                                   ┃
┃ + PUT    /api/appointments/:id/advisor-confirm-changes           ┃
┃   advisorConfirmChanges(id): Appointment                         ┃
┃   • Query: UPDATE SET status = 'confirmed'                       ┃
┃   • Creates: notifications to students                           ┃
┃   • Sends: emails to students                                    ┃
┃                                                                   ┃
┃ + PUT    /api/appointments/:id/reject-changes                    ┃
┃   studentRejectChanges(id): Appointment                          ┃
┃   • Query: UPDATE SET status = 'rejected'                        ┃
┃   • Creates: notification to advisor                             ┃
┃   • Sends: email to advisor                                      ┃
┃                                                                   ┃
┃ + PUT    /api/appointments/:id/advisor-reject-changes            ┃
┃   advisorRejectChanges(id): Appointment                          ┃
┃   • Query: UPDATE SET status = 'rejected'                        ┃
┃   • Creates: notifications to students                           ┃
┃   • Sends: emails to students                                    ┃
┃                                                                   ┃
┃ + PUT    /api/appointments/:id/accept                            ┃
┃   studentAccept(id): Appointment                                 ┃
┃   • Query: UPDATE SET status = 'confirmed'                       ┃
┃   • Creates: notification to advisor                             ┃
┃   • Sends: email to advisor                                      ┃
┃                                                                   ┃
┃ + PUT    /api/appointments/:id/student-reject                    ┃
┃   studentReject(id, reason): Appointment                         ┃
┃   • Query: UPDATE SET status = 'rejected'                        ┃
┃   • Creates: notification to advisor with reason                 ┃
┃   • Sends: email to advisor                                      ┃
┃                                                                   ┃
┃ + POST   /api/appointments/check-expired                         ┃
┃   checkExpiredAppointments(): Success                            ┃
┃   • Query: SELECT WHERE date < NOW() AND status = 'pending'      ┃
┃   • Updates: status to 'no_response'                             ┃
┃   • Runs: periodically or on-demand                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### 📝 **คำอธิบาย Methods แบบละเอียด**

#### **AppointmentsController:**

**1. getAppointments(): Appointment[]**
```javascript
GET /api/appointments
Parameters: ไม่มี (ใช้ req.user จาก JWT สำหรับ filtering)
Returns: Appointment[] - อาเรย์ของ Appointment objects
Attributes ที่ return (Appointment):
  - id, title, date, time, location, notes, status
  - student_id, advisor_id, project_id
  - created_at, updated_at
  - student: User object (joined)
  - advisor: User object (joined)
  - project: Project object (joined)
```
- **คำอธิบาย**: ดึงรายการนัดหมายทั้งหมดของตัวเอง (อาจารย์เห็นนัดที่เป็นที่ปรึกษา, นักศึกษาเห็นนัดที่เป็นสมาชิก) เรียงจากวันที่ล่าสุด
- **Filter**: by advisor_id or student_id
- **Order**: date DESC

**2. getAppointmentById(id: number): Appointment**
```javascript
GET /api/appointments/:id
Parameters:
  - id: number (URL param) - Appointment ID
Returns: Appointment - Appointment object พร้อมรายละเอียดครบถ้วน
Attributes ที่ return: ทุก attributes + student, advisor, project, comments[]
```
- **คำอธิบาย**: ดึงข้อมูลนัดหมายตาม ID โดยละเอียด รวมข้อมูลนักศึกษา อาจารย์ โปรเจค และคอมเมนต์ทั้งหมด
- **Query**: SELECT with JOINs (users, projects, comments)

**3. createAppointment(data: CreateAppointmentDto): Appointment**
```javascript
POST /api/appointments
Parameters:
  - title: string (required) - หัวข้อนัดหมาย
  - date: string (required) - วันที่นัด (YYYY-MM-DD)
  - time: string (required) - เวลานัด (HH:MM)
  - location: string (required) - สถานที่นัด
  - notes?: string (optional) - หมายเหตุ
  - projectId: number (required) - Project ID
Returns: Appointment - Appointment object ที่สร้างใหม่
Attributes ที่ return: ทุก attributes ของ Appointment (status = 'pending')
```
- **คำอธิบาย**: สร้างนัดหมายใหม่ (ทั้งนักศึกษาและอาจารย์สร้างได้) บันทึกข้อมูลนัด สร้างการแจ้งเตือนให้ผู้เกี่ยวข้อง และส่งอีเมลแบบ background (ไม่รอเสร็จ)
- **Logic**: student → แจ้งอาจารย์, advisor → แจ้งนักศึกษาทุกคน
- **Side Effects**: INSERT notification, send email (async)
- **Performance**: 50-100ms (ไม่รอ email)

**4. updateAppointment(id: number, data: UpdateAppointmentDto): Appointment**
```javascript
PUT /api/appointments/:id
Parameters:
  - id: number (URL param) - Appointment ID
  - title?: string - หัวข้อใหม่
  - date?: string - วันที่ใหม่
  - time?: string - เวลาใหม่
  - location?: string - สถานที่ใหม่
  - notes?: string - หมายเหตุใหม่
Returns: Appointment - Appointment object ที่แก้ไขแล้ว
Attributes ที่ return: ทุก attributes (status เปลี่ยนเป็น pending_*_confirmation)
```
- **คำอธิบาย**: แก้ไขนัดหมาย (partial update) เปลี่ยนสถานะเป็น pending_*_confirmation (รอยืนยันจากอีกฝ่าย) สร้างการแจ้งเตือนและส่งอีเมลแบบ background
- **Authorization**: Owner only (ผู้สร้างนัด)
- **Side Effects**: UPDATE status, INSERT notification, send email (async)

**5. deleteAppointment(id: number): {success: boolean}**
```javascript
DELETE /api/appointments/:id
Parameters:
  - id: number (URL param) - Appointment ID ที่จะลบ
Returns: Object { success: boolean, message: string }
```
- **คำอธิบาย**: ลบนัดหมาย (เฉพาะเจ้าของ) จะลบคอมเมนต์และอัพเดทการแจ้งเตือนที่เกี่ยวข้องอัตโนมัติ
- **Authorization**: Owner only
- **Cascade**: Deletes comments, updates notifications

**6. updateStatus(id: number, status: string): Appointment**
```javascript
PUT /api/appointments/:id/status/:status
Parameters:
  - id: number (URL param) - Appointment ID
  - status: string (URL param) - 'pending' | 'confirmed' | 'rejected' | 'cancelled'
Returns: Appointment - Appointment object ที่อัพเดทสถานะแล้ว
Attributes ที่ return: ทุก attributes (status เปลี่ยนตามที่ระบุ)
```
- **คำอธิบาย**: เปลี่ยนสถานะนัดหมาย สร้างการแจ้งเตือนและส่งอีเมลให้ผู้เกี่ยวข้อง
- **Side Effects**: INSERT notification, send email (async)

**7. studentConfirmChanges(id: number): Appointment**
```javascript
PUT /api/appointments/:id/confirm-changes
Parameters:
  - id: number (URL param) - Appointment ID
Returns: Appointment - Appointment object (status = 'confirmed')
Attributes ที่ return: ทุก attributes
```
- **คำอธิบาย**: นักศึกษายืนยันการแก้ไขนัด เปลี่ยนสถานะเป็น confirmed แจ้งอาจารย์และส่งอีเมล
- **Authorization**: Student in project only
- **Side Effects**: UPDATE status, INSERT notification to advisor, send email

**8. advisorConfirmChanges(id: number): Appointment**
```javascript
PUT /api/appointments/:id/advisor-confirm-changes
Parameters:
  - id: number (URL param) - Appointment ID
Returns: Appointment - Appointment object (status = 'confirmed')
Attributes ที่ return: ทุก attributes
```
- **คำอธิบาย**: อาจารย์ยืนยันการแก้ไขนัด เปลี่ยนสถานะเป็น confirmed แจ้งนักศึกษาทุกคนและส่งอีเมล
- **Authorization**: Advisor only
- **Side Effects**: UPDATE status, INSERT notifications to all students, send emails

**9. studentRejectChanges(id: number): Appointment**
```javascript
PUT /api/appointments/:id/reject-changes
Parameters:
  - id: number (URL param) - Appointment ID
  - reason?: string (optional body) - เหตุผลในการปฏิเสธ
Returns: Appointment - Appointment object (status = 'rejected')
Attributes ที่ return: ทุก attributes
```
- **คำอธิบาย**: นักศึกษาปฏิเสธการแก้ไขนัด เปลี่ยนสถานะเป็น rejected แจ้งอาจารย์พร้อมเหตุผล
- **Authorization**: Student in project only
- **Side Effects**: UPDATE status, INSERT notification with reason, send email

**10. advisorRejectChanges(id: number): Appointment**
```javascript
PUT /api/appointments/:id/advisor-reject-changes
Parameters:
  - id: number (URL param) - Appointment ID
  - reason?: string (optional body) - เหตุผลในการปฏิเสธ
Returns: Appointment - Appointment object (status = 'rejected')
Attributes ที่ return: ทุก attributes
```
- **คำอธิบาย**: อาจารย์ปฏิเสธการแก้ไขนัด เปลี่ยนสถานะเป็น rejected แจ้งนักศึกษาทุกคนพร้อมเหตุผล
- **Authorization**: Advisor only
- **Side Effects**: UPDATE status, INSERT notifications with reason, send emails

**11. studentAccept(id: number): Appointment**
```javascript
PUT /api/appointments/:id/accept
Parameters:
  - id: number (URL param) - Appointment ID
Returns: Appointment - Appointment object (status = 'confirmed')
Attributes ที่ return: ทุก attributes
```
- **คำอธิบาย**: นักศึกษายอมรับนัดหมายที่อาจารย์สร้าง เปลี่ยนสถานะเป็น confirmed แจ้งอาจารย์
- **Authorization**: Student in project only
- **Side Effects**: UPDATE status, INSERT notification, send email

**12. studentReject(id: number, reason: string): Appointment**
```javascript
PUT /api/appointments/:id/student-reject
Parameters:
  - id: number (URL param) - Appointment ID
  - reason?: string (optional body) - เหตุผลในการปฏิเสธ
Returns: Appointment - Appointment object (status = 'rejected')
Attributes ที่ return: ทุก attributes
```
- **คำอธิบาย**: นักศึกษาปฏิเสธนัดหมายที่อาจารย์สร้าง ระบุเหตุผล เปลี่ยนสถานะเป็น rejected แจ้งอาจารย์พร้อมเหตุผล
- **Authorization**: Student in project only
- **Side Effects**: UPDATE status, INSERT notification with reason, send email

**13. checkExpiredAppointments(): {updated: number}**
```javascript
POST /api/appointments/check-expired
Parameters: ไม่มี
Returns: Object {
  updated: number - จำนวนนัดหมายที่อัพเดท
  message: string - ข้อความตอบกลับ
}
```
- **คำอธิบาย**: ตรวจสอบนัดหมายที่หมดอายุ (วันนัดผ่านไปแล้วแต่สถานะยัง pending) เปลี่ยนสถานะเป็น no_response ใช้สำหรับรันเป็นงานตามเวลาหรือเรียกเมื่อต้องการ
- **Query**: `SELECT WHERE date < NOW() AND status = 'pending'`
- **Side Effects**: UPDATE status to 'no_response'
- **Use Case**: Cron job หรือ manual trigger

---

## 4️⃣ **Notifications Entity & Methods**

### 📦 **Database Entity**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         «entity»                  ┃
┃       Notifications               ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ - id: INTEGER «PK»                ┃
┃ - user_id: INTEGER «FK»           ┃
┃ - type: VARCHAR(50)               ┃
┃ - title: VARCHAR(255)             ┃
┃ - message: TEXT                   ┃
┃ - is_read: BOOLEAN                ┃
┃ - appointment_id: INTEGER «FK»    ┃
┃ - created_at: TIMESTAMP           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
            ▲
            │ uses
            │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              «controller»                          ┃
┃         NotificationsController                    ┃
┃       /backend/routes/notifications.js             ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ + GET    /api/notifications                        ┃
┃   getNotifications(): Notification[]               ┃
┃   • Query: SELECT * FROM notifications             ┃
┃            WHERE user_id = $1                      ┃
┃            ORDER BY created_at DESC                ┃
┃   • Filter: by current user                        ┃
┃                                                     ┃
┃ + PUT    /api/notifications/:id/read               ┃
┃   markAsRead(id): Notification                     ┃
┃   • Query: UPDATE notifications                    ┃
┃            SET is_read = TRUE WHERE id = $1        ┃
┃                                                     ┃
┃ + PUT    /api/notifications/read-all               ┃
┃   markAllAsRead(): Success                         ┃
┃   • Query: UPDATE notifications                    ┃
┃            SET is_read = TRUE                      ┃
┃            WHERE user_id = $1                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### 📝 **คำอธิบาย Methods แบบละเอียด**

#### **NotificationsController:**

**1. getNotifications(): Notification[]**
```javascript
GET /api/notifications
Parameters: ไม่มี (ใช้ req.user จาก JWT)
Returns: Notification[] - อาเรย์ของ Notification objects
Attributes ที่ return (Notification):
  - id: number
  - user_id: number
  - type: string (notification type)
  - title: string
  - message: string (HTML text)
  - is_read: boolean
  - appointment_id: number
  - created_at: timestamp
```
- **คำอธิบาย**: ดึงรายการการแจ้งเตือนทั้งหมดของผู้ใช้ปัจจุบัน เรียงจากล่าสุดไปเก่าสุด แสดงทั้งที่อ่านแล้วและยังไม่ได้อ่าน ใช้สำหรับแสดงในหน้าการแจ้งเตือนและ notification bell
- **Filter**: WHERE user_id = current user
- **Order**: created_at DESC
- **Performance**: 10-30ms

**2. markAsRead(id: number): Notification**
```javascript
PUT /api/notifications/:id/read
Parameters:
  - id: number (URL param) - Notification ID
Returns: Notification - Notification object ที่อัพเดทแล้ว (is_read = TRUE)
Attributes ที่ return: ทุก attributes
```
- **คำอธิบาย**: ทำเครื่องหมายการแจ้งเตือนหนึ่งรายการว่าอ่านแล้ว เปลี่ยน is_read เป็น TRUE ใช้เมื่อคลิกดูการแจ้งเตือน
- **Query**: `UPDATE notifications SET is_read = TRUE WHERE id = $1`
- **Performance**: 5-15ms

**3. markAllAsRead(): {success: boolean, count: number}**
```javascript
PUT /api/notifications/read-all
Parameters: ไม่มี (ใช้ req.user จาก JWT)
Returns: Object {
  success: boolean - ผลการดำเนินการ
  count: number - จำนวนที่อัพเดท
  message: string - ข้อความตอบกลับ
}
```
- **คำอธิบาย**: ทำเครื่องหมายการแจ้งเตือนทั้งหมดของผู้ใช้ว่าอ่านแล้ว เปลี่ยน is_read เป็น TRUE ทั้งหมด ใช้เมื่อกดปุ่ม "อ่านทั้งหมด"
- **Query**: `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`
- **Performance**: 10-30ms

---

## 5️⃣ **Comments Entity & Methods**

### 📦 **Database Entity**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         «entity»                  ┃
┃         Comments                  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ - id: INTEGER «PK»                ┃
┃ - content: TEXT                   ┃
┃ - appointment_id: INTEGER «FK»    ┃
┃ - user_id: INTEGER «FK»           ┃
┃ - created_at: TIMESTAMP           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
            ▲
            │ uses
            │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              «controller»                          ┃
┃           CommentsController                       ┃
┃   (Embedded in /backend/routes/appointments.js)    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ + POST   /api/appointments/:id/comments            ┃
┃   createComment(appointmentId, content): Comment   ┃
┃   • Query: INSERT INTO comments                    ┃
┃   • Auth: Appointment members only                 ┃
┃   • Validates: content not empty                   ┃
┃                                                     ┃
┃ + GET    /api/appointments/:id/comments            ┃
┃   getComments(appointmentId): Comment[]            ┃
┃   • Query: SELECT c.*, u.* FROM comments c         ┃
┃            JOIN users u ON c.user_id = u.id        ┃
┃            WHERE c.appointment_id = $1             ┃
┃            ORDER BY created_at ASC                 ┃
┃   • Includes: user info                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Note: Comments are loaded with appointments via JOIN
```

### 📝 **คำอธิบาย Methods แบบละเอียด**

#### **CommentsController:**

**1. createComment(appointmentId: number, content: string): Comment**
```javascript
POST /api/appointments/:id/comments
Parameters:
  - appointmentId: number (URL param) - Appointment ID
  - content: string (required body) - เนื้อหาคอมเมนต์
Returns: Comment - Comment object ที่สร้างใหม่
Attributes ที่ return (Comment):
  - id: number
  - content: string
  - appointmentId: number
  - userId: number
  - createdAt: timestamp
  - user: User object - {id, firstName, lastName, role}
```
- **คำอธิบาย**: เพิ่มคอมเมนต์ในนัดหมาย สำหรับการสนทนาและบันทึกรายละเอียดเพิ่มเติมในนัดหมาย เฉพาะผู้ที่เกี่ยวข้องกับนัดหมายเท่านั้นที่สามารถคอมเมนต์ได้ (advisor ที่ปรึกษา หรือ students ที่อยู่ในโปรเจค)
- **Authorization**: Appointment members (advisor OR students in project)
- **Validations**: 
  - content ต้องไม่ว่าง
  - user ต้องเป็นสมาชิกในนัดหมาย (ตรวจสอบจาก appointments, projects, project_students)
- **Query**: 
  ```sql
  -- Check permission
  SELECT a.id FROM appointments a
  LEFT JOIN projects p ON a.project_id = p.id
  LEFT JOIN project_students ps ON p.id = ps.project_id
  WHERE a.id = $1 AND (
    a.student_id = $2 OR 
    a.advisor_id = $2 OR 
    p.advisor_id = $2 OR 
    ps.student_id = $2
  )
  
  -- Insert comment
  INSERT INTO comments (content, appointment_id, user_id)
  VALUES ($1, $2, $3) RETURNING *
  ```
- **Performance**: 30-60ms
- **Use Case**: บันทึกข้อความสนทนา, ความคิดเห็น, หมายเหตุเพิ่มเติมในนัดหมาย

**2. getComments(appointmentId: number): Comment[]**
```javascript
GET /api/appointments/:id/comments
Parameters:
  - appointmentId: number (URL param) - Appointment ID
Returns: Comment[] - อาเรย์ของ Comment objects
Attributes ที่ return (Comment):
  - id: number
  - content: string (text)
  - appointment_id: number
  - user_id: number
  - created_at: timestamp
  - user: User object (joined) - {id, first_name, last_name, role}
```
- **คำอธิบาย**: ดึงรายการคอมเมนต์ทั้งหมดในนัดหมายหนึ่งรายการ เรียงจากเก่าสุดไปล่าสุด (เพื่อแสดงลำดับการสนทนา) รวมข้อมูลผู้เขียนคอมเมนต์ด้วย ใช้สำหรับแสดงในหน้ารายละเอียดนัดหมาย
- **Query**: `SELECT c.*, u.* FROM comments c JOIN users u ON c.user_id = u.id WHERE c.appointment_id = $1 ORDER BY created_at ASC`
- **Order**: created_at ASC (เก่าสุดก่อน)
- **Performance**: 10-30ms
- **หมายเหตุ**: คอมเมนต์จะถูกโหลดมาพร้อมนัดหมายด้วย JOIN อัตโนมัติใน getAppointmentById()

---

## 6️⃣ **Email Service**

### 📦 **Service Layer**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      «service»                                   ┃
┃                    EmailService                                  ┃
┃              /backend/services/emailService.js                   ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ + sendAppointmentCreatedEmail(appointment, recipient): Boolean  ┃
┃   • Subject: "🔔 มีนัดหมายใหม่"                                  ┃
┃   • Template: HTML with appointment details                      ┃
┃   • Async: Non-blocking (background)                             ┃
┃                                                                   ┃
┃ + sendAppointmentConfirmedEmail(appointment, recipient): Boolean┃
┃   • Subject: "✅ นัดหมายได้รับการยืนยันแล้ว"                        ┃
┃   • Template: Confirmation details                               ┃
┃                                                                   ┃
┃ + sendAppointmentRejectedEmail(appointment, recipient): Boolean ┃
┃   • Subject: "❌ นัดหมายถูกปฏิเสธ"                                 ┃
┃   • Template: Rejection notice                                   ┃
┃                                                                   ┃
┃ + sendAppointmentUpdatedEmail(appointment, recipient): Boolean  ┃
┃   • Subject: "🔄 มีการแก้ไขนัดหมาย"                               ┃
┃   • Template: Updated details, requires confirmation             ┃
┃                                                                   ┃
┃ + sendAppointmentCancelledEmail(appointment, recipient): Boolean┃
┃   • Subject: "🚫 นัดหมายถูกยกเลิก"                                ┃
┃   • Template: Cancellation notice                                ┃
┃                                                                   ┃
┃ + sendAppointmentReminderEmail(appointment, recipient): Boolean ┃
┃   • Subject: "⏰ การแจ้งเตือนนัดหมาย"                              ┃
┃   • Template: Upcoming appointment reminder                      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
            │
            │ uses
            ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         «config»                  ┃
┃      Email Transporter            ┃
┃   /backend/config/email.js        ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ - host: SMTP server               ┃
┃ - port: 587                       ┃
┃ - auth: {user, pass}              ┃
┃ - Uses: nodemailer                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### 📝 **คำอธิบาย Methods แบบละเอียด**

#### **EmailService:**

**1. sendAppointmentCreatedEmail(appointment: Appointment, recipient: User): Promise<boolean>**
```javascript
Parameters:
  - appointment: Object {
      title: string
      date: string
      time: string
      location: string
      notes: string
      student: User
      advisor: User
      project: Project
    }
  - recipient: User {
      email: string
      first_name: string
      last_name: string
    }
Returns: Promise<boolean> - ผลการส่งอีเมล (true/false)
Email Attributes:
  - from: process.env.EMAIL_USER
  - to: recipient.email
  - subject: "🔔 มีนัดหมายใหม่"
  - html: HTML template with appointment details
```
- **คำอธิบาย**: ส่งอีเมลแจ้งเตือนว่ามีนัดหมายใหม่ ส่งให้ผู้รับ (อาจารย์หรือนักศึกษา) พร้อมรายละเอียดนัดหมายแบบ HTML สวยงาม ทำงานแบบ background (non-blocking) ไม่บล็อกการตอบกลับ API
- **Async**: ใช้ Promise.then().catch() ไม่ใช้ await
- **Performance**: ไม่บล็อก API response (~50-200ms background)

**2. sendAppointmentConfirmedEmail(appointment: Appointment, recipient: User): Promise<boolean>**
```javascript
Parameters: เหมือน sendAppointmentCreatedEmail
Returns: Promise<boolean>
Email Attributes:
  - subject: "✅ นัดหมายได้รับการยืนยันแล้ว"
  - html: Confirmation details template
```
- **คำอธิบาย**: ส่งอีเมลแจ้งว่านัดหมายได้รับการยืนยันแล้ว แสดงรายละเอียดการยืนยันและเตรียมตัวสำหรับวันนัด ใช้เมื่อสถานะเปลี่ยนเป็น confirmed
- **Use Case**: หลัง confirm/accept appointment

**3. sendAppointmentRejectedEmail(appointment: Appointment, recipient: User): Promise<boolean>**
```javascript
Parameters: เหมือน sendAppointmentCreatedEmail + reason (optional)
Returns: Promise<boolean>
Email Attributes:
  - subject: "❌ นัดหมายถูกปฏิเสธ"
  - html: Rejection notice with reason (if provided)
```
- **คำอธิบาย**: ส่งอีเมลแจ้งว่านัดหมายถูกปฏิเสธ แสดงเหตุผลการปฏิเสธ (ถ้ามี) และข้อเสนอแนะในการจัดการต่อ ใช้เมื่อสถานะเปลี่ยนเป็น rejected
- **Use Case**: หลัง reject appointment

**4. sendAppointmentUpdatedEmail(appointment: Appointment, recipient: User): Promise<boolean>**
```javascript
Parameters: เหมือน sendAppointmentCreatedEmail + updatedFields (optional)
Returns: Promise<boolean>
Email Attributes:
  - subject: "🔄 มีการแก้ไขนัดหมาย"
  - html: Updated details with changes highlighted, requires confirmation
```
- **คำอธิบาย**: ส่งอีเมลแจ้งว่ามีการแก้ไขนัดหมาย แสดงรายละเอียดที่เปลี่ยนแปลงและต้องการการยืนยันจากผู้รับ ใช้เมื่อมีการแก้ไขวัน เวลา หรือสถานที่นัด
- **Use Case**: หลัง update appointment
- **Status**: เปลี่ยนเป็น pending_*_confirmation

**5. sendAppointmentCancelledEmail(appointment: Appointment, recipient: User): Promise<boolean>**
```javascript
Parameters: เหมือน sendAppointmentCreatedEmail + reason (optional)
Returns: Promise<boolean>
Email Attributes:
  - subject: "🚫 นัดหมายถูกยกเลิก"
  - html: Cancellation notice with reason, suggest rescheduling
```
- **คำอธิบาย**: ส่งอีเมลแจ้งว่านัดหมายถูกยกเลิก แสดงเหตุผลการยกเลิก (ถ้ามี) และแนะนำให้นัดหมายใหม่ ใช้เมื่อสถานะเปลี่ยนเป็น cancelled
- **Use Case**: หลัง cancel appointment

**6. sendAppointmentReminderEmail(appointment: Appointment, recipient: User): Promise<boolean>**
```javascript
Parameters: เหมือน sendAppointmentCreatedEmail
Returns: Promise<boolean>
Email Attributes:
  - subject: "⏰ การแจ้งเตือนนัดหมาย"
  - html: Reminder with appointment details, preparation checklist
```
- **คำอธิบาย**: ส่งอีเมลเตือนนัดหมายที่กำลังจะถึง แสดงรายละเอียดวัน เวลา สถานที่ และสิ่งที่ต้องเตรียม ใช้สำหรับระบบเตือนอัตโนมัติก่อนวันนัด
- **⚠️ หมายเหตุ**: ยังไม่ได้ implement ในระบบปัจจุบัน (สำหรับอนาคต)
- **Suggested**: ส่งล่วงหน้า 1 วันก่อนนัด

---

#### **Email Transporter Config:**

```javascript
// /backend/config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,  // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,     // Gmail address
    pass: process.env.EMAIL_PASSWORD  // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;
```

**Configuration Details:**
- **Host**: smtp.gmail.com (Gmail SMTP server)
- **Port**: 587 (STARTTLS - TLS upgrade)
- **Secure**: false (ใช้ STARTTLS แทน SSL)
- **Auth**: 
  - user: Gmail address จาก env
  - pass: Gmail App Password (ไม่ใช่รหัสผ่านปกติ)
- **TLS**: rejectUnauthorized = false (สำหรับ development)
- **Library**: nodemailer v6.9+

**Environment Variables Required:**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

**การตั้งค่า Gmail App Password:**
1. เปิด Google Account Settings
2. Security → 2-Step Verification (ต้องเปิดก่อน)
3. App passwords → Create app password
4. เลือก "Mail" และ "Other (Custom name)"
5. คัดลอก 16 ตัวอักษรไปใส่ใน EMAIL_PASSWORD

---

## 7️⃣ **Project Archive Entity & Methods**

### 📦 **Database Entity**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         «entity»                  ┃
┃      Project_Archive              ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ - id: INTEGER «PK»                ┃
┃ - project_id: INTEGER             ┃
┃ - project_name: VARCHAR(255)      ┃
┃ - description: TEXT               ┃
┃ - advisor_name: VARCHAR(255)      ┃
┃ - student_names: TEXT[]           ┃
┃ - academic_year: VARCHAR(10)      ┃
┃ - semester: VARCHAR(10)           ┃
┃ - completion_date: DATE           ┃
┃ - project_type: VARCHAR(100)      ┃
┃ - total_appointments: INTEGER     ┃
┃ - completed_appointments: INTEGER ┃
┃ - success_rate: DECIMAL(5,2)      ┃
┃ - attendance_rate: DECIMAL(5,2)   ┃
┃ - appointment_details: JSONB      ┃
┃ - technology_used: TEXT[]         ┃
┃ - keywords: TEXT[]                ┃
┃ - final_grade: VARCHAR(5)         ┃
┃ - created_at: TIMESTAMP           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
            ▲
            │ uses
            │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              «controller»                          ┃
┃       ProjectArchiveController                     ┃
┃      /backend/routes/projectArchive.js             ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ + POST   /api/project-archive/archive              ┃
┃   archiveProject(data): ProjectArchive             ┃
┃   • Query: INSERT INTO project_archive             ┃
┃   • Updates: projects SET archived = TRUE          ┃
┃   • Auth: Advisor only                             ┃
┃                                                     ┃
┃ + GET    /api/project-archive                      ┃
┃   getArchivedProjects(pagination): ProjectArchive[]┃
┃   • Query: SELECT * FROM project_archive           ┃
┃   • Supports: pagination, sorting                  ┃
┃   • Auth: Advisor only                             ┃
┃                                                     ┃
┃ + GET    /api/project-archive/search               ┃
┃   searchArchivedProjects(filters): ProjectArchive[]┃
┃   • Query: SELECT with WHERE conditions            ┃
┃   • Filters: query, year, semester, advisor, etc   ┃
┃   • Auth: Advisor only                             ┃
┃                                                     ┃
┃ + GET    /api/project-archive/statistics           ┃
┃   getStatistics(): Statistics                      ┃
┃   • Aggregates: COUNT, AVG, GROUP BY               ┃
┃   • Returns: total, average grade, by year/advisor ┃
┃   • Auth: Advisor only                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### 📝 **คำอธิบาย Methods แบบละเอียด**

#### **ProjectArchiveController:**

**1. archiveProject(data: ArchiveProjectDto): ProjectArchive**
```javascript
POST /api/project-archive/archive
Parameters:
  - projectId: number (required) - Project ID ที่จะจัดเก็บ
  - projectName: string (optional) - ชื่อโปรเจค
  - advisorName: string (optional) - ชื่ออาจารย์ที่ปรึกษา
  - studentNames: string[] (optional) - รายชื่อนักศึกษา
  - totalAppointments: number (optional) - จำนวนนัดหมายทั้งหมด
  - completedAppointments: number (optional) - จำนวนนัดที่เสร็จสิ้น
  - successRate: string (optional) - อัตราความสำเร็จ (0.0-100.0)
  - attendanceRate: string (optional) - อัตราการเข้านัด
  - appointmentDetails: Array (optional) - รายละเอียดนัดหมาย (JSON)
  - projectType: string (optional) - ประเภทโปรเจค
Returns: ProjectArchive - โปรเจคที่จัดเก็บแล้ว
Attributes ที่ return: ทุก attributes ของ project_archive
```
- **คำอธิบาย**: จัดเก็บโปรเจคที่เสร็จสิ้นแล้วเข้าระบบ archive ดึงข้อมูลจากตาราง projects และนักศึกษาจาก project_students อัตโนมัติ บันทึกสถิติและรายละเอียดต่างๆ แล้วอัพเดทสถานะ archived ของโปรเจคเป็น TRUE
- **Authorization**: Advisor only (เฉพาะเจ้าของโปรเจค)
- **Validations**: project exists, user is advisor
- **Side Effects**: UPDATE projects SET archived = TRUE, archived_at = NOW()
- **Performance**: 50-100ms

**2. getArchivedProjects(pagination: PaginationDto): {data: ProjectArchive[], pagination: Object}**
```javascript
GET /api/project-archive
Query Parameters:
  - page: number (default: 1) - หน้าที่ต้องการ
  - limit: number (default: 10) - จำนวนรายการต่อหน้า
  - sort: string (default: 'completion_date') - ฟิลด์ที่ใช้เรียงลำดับ
  - order: 'asc' | 'desc' (default: 'desc') - ลำดับการเรียง
Returns: Object {
  data: ProjectArchive[] - รายการโปรเจคที่จัดเก็บ
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}
```
- **คำอธิบาย**: ดึงรายการโปรเจคที่จัดเก็บทั้งหมด รองรับ pagination และการเรียงลำดับตามฟิลด์ต่างๆ (วันที่เสร็จ, ชื่อโปรเจค, ปีการศึกษา)
- **Authorization**: Advisor only
- **Query**: `SELECT * FROM project_archive ORDER BY ${sort} ${order} LIMIT $1 OFFSET $2`
- **Performance**: 20-50ms

**3. searchArchivedProjects(filters: SearchFiltersDto): {data: ProjectArchive[], pagination, filters}**
```javascript
GET /api/project-archive/search
Query Parameters:
  - query: string (optional) - ค้นหาในชื่อ/คำอธิบาย/keywords
  - academic_year: string (optional) - กรองตามปีการศึกษา
  - semester: string (optional) - กรองตามภาคเรียน
  - advisor_name: string (optional) - กรองตามอาจารย์
  - technology: string (optional) - กรองตามเทคโนโลยีที่ใช้
  - grade_range: string (optional) - กรองตามเกรด
  - page: number (default: 1)
  - limit: number (default: 10)
Returns: Object {
  data: ProjectArchive[]
  pagination: Object
  filters: Object - ฟิลเตอร์ที่ใช้
}
```
- **คำอธิบาย**: ค้นหาโปรเจคที่จัดเก็บด้วยเงื่อนไขหลายแบบ รองรับการค้นหาแบบ full-text (ILIKE) และกรองตามหลายเงื่อนไข สามารถค้นหาเทคโนโลยีใน array field ได้
- **Authorization**: Advisor only
- **Query**: Dynamic WHERE clause with multiple conditions
- **Search Features**: ILIKE for text search, ANY for array fields
- **Performance**: 30-80ms

**4. getStatistics(): Statistics**
```javascript
GET /api/project-archive/statistics
Parameters: ไม่มี
Returns: Object {
  total_projects: number - จำนวนโปรเจคทั้งหมด
  average_grade: number - เกรดเฉลี่ย (4.0 scale)
  projects_by_year: Object - จำนวนแยกตามปี {year: count}
  projects_by_semester: Object - จำนวนแยกตามภาคเรียน {semester: count}
  projects_by_advisor: Object - จำนวนแยกตามอาจารย์ {name: count}
}
```
- **คำอธิบาย**: คำนวณสถิติโปรเจคที่จัดเก็บทั้งหมด รวมจำนวนโปรเจค, เกรดเฉลี่ย (แปลงจาก A-F เป็น 4.0 scale), จำนวนแยกตามปีการศึกษา/ภาคเรียน/อาจารย์ (Top 10)
- **Authorization**: Advisor only
- **Aggregations**: COUNT, AVG, GROUP BY
- **Grade Conversion**: A=4.0, B+=3.5, B=3.0, C+=2.5, C=2.0
- **Queries**: 4 parallel queries (Promise.all)
- **Performance**: 50-150ms

---

### ⚠️ **Project_Archive - Attributes Usage Analysis**

| Attribute | INSERT | SELECT | Search | Statistics | สถานะการใช้งาน |
|-----------|--------|--------|--------|------------|----------------|
| **id** | ✅ (auto) | ✅ | ✅ | ✅ | **ใช้เต็มรูปแบบ** |
| **project_id** | ✅ | ✅ | ✅ | ✅ | **ใช้เต็มรูปแบบ** |
| **project_name** | ✅ | ✅ | ✅ | ✅ | **ใช้เต็มรูปแบบ** |
| **description** | ⚠️ (empty) | ✅ | ✅ | ❌ | **INSERT แต่ว่าง** |
| **advisor_name** | ✅ | ✅ | ✅ | ✅ | **ใช้เต็มรูปแบบ** |
| **student_names** | ✅ | ✅ | ❌ | ❌ | **ใช้บางส่วน** |
| **academic_year** | ✅ | ✅ | ✅ | ✅ | **ใช้เต็มรูปแบบ** |
| **semester** | ✅ (default) | ✅ | ✅ | ✅ | **ใช้แต่ค่าเป็น NULL** |
| **completion_date** | ✅ | ✅ | ✅ | ❌ | **ใช้เต็มรูปแบบ** |
| **project_type** | ✅ | ✅ | ❌ | ❌ | **ใช้บางส่วน** |
| **total_appointments** | ✅ | ✅ | ❌ | ❌ | **ใช้บางส่วน** |
| **completed_appointments** | ✅ | ✅ | ❌ | ❌ | **ใช้บางส่วน** |
| **success_rate** | ✅ | ✅ | ❌ | ❌ | **ใช้บางส่วน** |
| **attendance_rate** | ✅ | ✅ | ❌ | ❌ | **ใช้บางส่วน** |
| **appointment_details** | ✅ | ✅ | ❌ | ❌ | **ใช้บางส่วน** |
| **technology_used** | ❌ | ✅ | ✅ | ❌ | **ไม่มี INSERT (NULL)** |
| **keywords** | ❌ | ✅ | ✅ | ❌ | **ไม่มี INSERT (NULL)** |
| **final_grade** | ❌ | ✅ | ✅ | ✅ | **ไม่มี INSERT (NULL)** |
| **created_at** | ✅ (auto) | ✅ | ❌ | ❌ | **ใช้เต็มรูปแบบ** |

---

### 📊 **สรุป Attributes ที่ไม่ได้ใช้งานจริง:**

**❌ ไม่มี INSERT (จะเป็น NULL เสมอ):**
1. **technology_used** - มีใน search WHERE แต่ไม่เคย INSERT ค่า
2. **keywords** - มีใน search WHERE แต่ไม่เคย INSERT ค่า
3. **final_grade** - มีใน statistics แต่ไม่เคย INSERT ค่า

**⚠️ INSERT แต่ไม่มีข้อมูลจริง:**
4. **description** - INSERT แต่ใส่ `''` (empty string) เสมอ
5. **semester** - INSERT แต่ใส่ค่า default/null เสมอ (Frontend ไม่ส่งมา)

**หมายเหตุ:** 
- Attributes เหล่านี้ออกแบบไว้สำหรับอนาคต แต่ยังไม่ได้ implement การใส่ค่าจริง
- Search/Statistics queries ที่ใช้ attributes เหล่านี้จะได้ผลลัพธ์เป็น NULL/empty เสมอ

---

## 8️⃣ **Project Students Entity (Junction Table)**

### 📦 **Database Entity**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         «junction table»          ┃
┃      Project_Students             ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ - project_id: INTEGER «PK, FK»    ┃
┃ - student_id: INTEGER «PK, FK»    ┃
┃ - created_at: TIMESTAMP           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
     ▲                    ▲
     │                    │
     │ FK                 │ FK
     │                    │
┌────┴────┐         ┌────┴────┐
│Projects │         │  Users  │
│         │         │(Student)│
└─────────┘         └─────────┘
```

### 📝 **คำอธิบาย Entity**

**Project_Students (Many-to-Many Junction Table)**
```sql
CREATE TABLE project_students (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, student_id)
);
```

**Attributes:**
- **project_id**: INTEGER (PK, FK) - Project ID (อ้างอิงไปยัง projects.id)
- **student_id**: INTEGER (PK, FK) - Student ID (อ้างอิงไปยัง users.id)
- **created_at**: TIMESTAMP - วันเวลาที่เพิ่มนักศึกษาเข้าโปรเจค

**Composite Primary Key:** (project_id, student_id) - ป้องกันการเพิ่มนักศึกษาซ้ำในโปรเจคเดียวกัน

**Foreign Keys:**
- project_id → projects(id) ON DELETE CASCADE
- student_id → users(id) ON DELETE CASCADE

**Cascade Behavior:**
- ลบโปรเจค → ลบความสัมพันธ์ทั้งหมดอัตโนมัติ
- ลบนักศึกษา → ลบความสัมพันธ์ทั้งหมดอัตโนมัติ

---

### ⚠️ **Attributes Usage Analysis**

| Attribute | INSERT | SELECT | JOIN | WHERE | สถานะการใช้งาน |
|-----------|--------|--------|------|-------|----------------|
| **project_id** | ✅ | ✅ | ✅ | ✅ | **ใช้เต็มรูปแบบ** |
| **student_id** | ✅ | ✅ | ✅ | ✅ | **ใช้เต็มรูปแบบ** |
| **created_at** | ✅ (auto) | ❌ | ❌ | ❌ | **ไม่ถูกเรียกใช้** |

**หมายเหตุ:** 
- **created_at** มีการ INSERT อัตโนมัติ (DEFAULT CURRENT_TIMESTAMP) แต่ไม่เคยถูกใช้ใน SELECT, JOIN, หรือ WHERE clause
- เก็บไว้เพื่อประโยชน์ใน audit/tracking (รู้ว่านักศึกษาเข้าโปรเจคเมื่อไหร่)

---

### 📝 **Methods ที่ใช้งาน Junction Table**

**จาก ProjectsController:**

**addStudent(projectId, studentId)** - เพิ่มนักศึกษาเข้าโปรเจค
```javascript
POST /api/projects/:id/students
Query: INSERT INTO project_students (project_id, student_id) VALUES ($1, $2)
Validation: 
  - ตรวจสอบนักศึกษามีอยู่จริง (users table)
  - ตรวจสอบ role = 'student'
  - ป้องกันการเพิ่มซ้ำ (composite PK)
Returns: {success: true, message: 'Student added'}
```

**removeStudent(projectId, studentId)** - เอานักศึกษาออกจากโปรเจค
```javascript
DELETE /api/projects/:id/students/:studentId
Query: DELETE FROM project_students WHERE project_id = $1 AND student_id = $2
Validation: 
  - ตรวจสอบนักศึกษาอยู่ในโปรเจค
  - เฉพาะอาจารย์เจ้าของโปรเจค
Returns: {success: true, message: 'Student removed'}
```

**getProjects()** - ดึงโปรเจคพร้อมนักศึกษา
```javascript
GET /api/projects
Query: 
  SELECT p.*, u.* FROM projects p
  JOIN project_students ps ON p.id = ps.project_id
  JOIN users u ON ps.student_id = u.id
  WHERE p.id = $1
Purpose: โหลดรายชื่อนักศึกษาทั้งหมดในโปรเจค
Returns: Project with students[] array
```

---

### 📊 **Use Cases**

**1. เพิ่มนักศึกษาเข้าโปรเจค**
```javascript
// Frontend
await api.addStudentToProject(projectId, studentId);

// Backend
INSERT INTO project_students (project_id, student_id) 
VALUES (1, 5);
```

**2. ดูรายชื่อนักศึกษาในโปรเจค**
```javascript
// Query
SELECT u.id, u.first_name, u.last_name, u.student_id
FROM users u
INNER JOIN project_students ps ON u.id = ps.student_id
WHERE ps.project_id = 1;
```

**3. ดูโปรเจคของนักศึกษา**
```javascript
// Query
SELECT p.id, p.name, p.advisor_id
FROM projects p
INNER JOIN project_students ps ON p.id = ps.project_id
WHERE ps.student_id = 5;
```

**4. ตรวจสอบนักศึกษาอยู่ในโปรเจคหรือไม่**
```javascript
// Query
SELECT EXISTS(
  SELECT 1 FROM project_students 
  WHERE project_id = 1 AND student_id = 5
) as is_member;
```

---

### ⚙️ **Performance Considerations**

**Indexes:**
```sql
-- Composite PK already creates index on (project_id, student_id)
-- Additional indexes for reverse lookup:
CREATE INDEX idx_project_students_student_id ON project_students(student_id);
CREATE INDEX idx_project_students_project_id ON project_students(project_id);
```

**Query Optimization:**
- ใช้ INNER JOIN แทน N+1 queries
- Batch INSERT สำหรับเพิ่มหลายนักศึกษา
- Composite PK ทำให้การค้นหาเร็ว O(1)

---

## 🔄 **Complete Method Flow Example**

### **สร้างนัดหมาย (Create Appointment)**

```
┌────────────────────────────────────────────────────────────────────┐
│                     CREATE APPOINTMENT FLOW                        │
└────────────────────────────────────────────────────────────────────┘

1. Client Request
   POST /api/appointments
   Body: {title, date, time, location, notes, projectId}
   Header: Authorization: Bearer <token>
          │
          ▼
2. Middleware: authenticateToken
   • Verifies JWT
   • Loads user from database
   • Sets req.user
          │
          ▼
3. Controller: createAppointment()
   ┌─────────────────────────────────────────────────┐
   │ a) Validate Input                               │
   │    - Check required fields                      │
   │                                                  │
   │ b) Get Project Details                          │
   │    Query: SELECT * FROM projects WHERE id = $1  │
   │                                                  │
   │ c) Determine Student/Advisor                    │
   │    - If student → advisor from project          │
   │    - If advisor → student_id = null             │
   │                                                  │
   │ d) Insert Appointment                           │
   │    Query: INSERT INTO appointments              │
   │           VALUES (...) RETURNING *              │
   │                                                  │
   │ e) Create Notifications (Parallel)              │
   │    Query: INSERT INTO notifications             │
   │    - If student → notify advisor                │
   │    - If advisor → notify all students           │
   │                                                  │
   │ f) Send Emails (Background - Non-blocking)      │
   │    EmailService.sendAppointmentCreatedEmail()   │
   │    - Uses Promise.then() for async              │
   │    - Doesn't block response                     │
   │                                                  │
   │ g) Return Response                              │
   │    Response: {success: true, data: appointment} │
   └─────────────────────────────────────────────────┘
          │
          ▼
4. Response to Client
   Status: 201 Created
   Time: ~50-100ms (fast!)
   
5. Background Tasks (Async)
   • Email sending completes later
   • No impact on user experience
```

---

## 📊 **CRUD Operations Summary**

| Entity | Create | Read | Update | Delete | Custom Methods |
|--------|--------|------|--------|--------|----------------|
| **Users** | ✅ POST | ✅ GET | ✅ PUT | ❌ | login, changePassword, import |
| **Projects** | ✅ POST | ✅ GET | ✅ PUT | ✅ DELETE | addStudent, removeStudent |
| **Appointments** | ✅ POST | ✅ GET | ✅ PUT | ✅ DELETE | confirm, reject, accept, checkExpired |
| **Notifications** | ➖ Auto | ✅ GET | ✅ PUT | ❌ | markAsRead, markAllAsRead |
| **Comments** | ➖ | ✅ GET | ❌ | ❌ | Embedded in appointments |

---

## 🔐 **Authentication & Authorization**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         «middleware»              ┃
┃      authenticateToken            ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 1. Extract JWT from header        ┃
┃ 2. Verify token signature         ┃
┃ 3. Query user from database       ┃
┃ 4. Attach user to req.user        ┃
┃ 5. Call next()                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         «middleware»              ┃
┃        requireRole                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 1. Check req.user.role            ┃
┃ 2. Compare with allowed roles     ┃
┃ 3. Return 403 if not allowed      ┃
┃ 4. Call next() if allowed         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         «helper functions»        ┃
┃       Role Check Utilities        ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ • isAdvisor(user): boolean        ┃
┃   return user.role === 'advisor'  ┃
┃                                    ┃
┃ • isStudent(user): boolean        ┃
┃   return user.role === 'student'  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### 📝 **Helper Functions คำอธิบาย**

**isAdvisor(user: User): boolean**
```javascript
// Implementation (inline check)
const isAdvisor = (user) => user.role === 'advisor';

// Usage in controllers:
if (req.user.role === 'advisor') {
  // Advisor-only logic
}
```
- **Purpose**: ตรวจสอบว่า user เป็นอาจารย์หรือไม่
- **Returns**: true/false
- **Use Case**: เช็คสิทธิ์ใน controller logic

**isStudent(user: User): boolean**
```javascript
// Implementation (inline check)  
const isStudent = (user) => user.role === 'student';

// Usage in controllers:
if (req.user.role === 'student') {
  // Student-only logic
}
```
- **Purpose**: ตรวจสอบว่า user เป็นนักศึกษาหรือไม่
- **Returns**: true/false
- **Use Case**: เช็คสิทธิ์ใน controller logic

**หมายเหตุ**: ในโค้ดจริงใช้การเช็คแบบ `req.user.role === 'advisor'` โดยตรง ไม่ได้สร้าง helper functions แยก แต่สามารถสร้างได้ถ้าต้องการ refactor

### **Role-Based Access**
| Method | Student | Advisor |
|--------|---------|---------|
| Create User | ❌ | ✅ |
| Import Users | ❌ | ✅ |
| View All Users | ❌ | ✅ |
| Update Own Profile | ✅ | ✅ |
| Create Project | ❌ | ✅ |
| Delete Project | ❌ | ✅ (own) |
| Create Appointment | ✅ | ✅ |
| Update Appointment | ✅ (own) | ✅ (own) |
| Confirm Appointment | ✅ | ✅ |
| Mark Attendance | ❌ | ✅ |

---

## 🎯 **Database Query Patterns**

### **1. Simple SELECT**
```sql
SELECT * FROM users WHERE id = $1
```

### **2. JOIN (One-to-Many)**
```sql
SELECT a.*, u.first_name, u.last_name
FROM appointments a
JOIN users u ON a.advisor_id = u.id
WHERE a.id = $1
```

### **3. JOIN (Many-to-Many)**
```sql
SELECT p.*, u.*
FROM projects p
JOIN project_students ps ON p.id = ps.project_id
JOIN users u ON ps.student_id = u.id
WHERE p.id = $1
```

### **4. INSERT with RETURNING**
```sql
INSERT INTO appointments (title, date, time, ...)
VALUES ($1, $2, $3, ...)
RETURNING *
```

### **5. UPDATE with Trigger**
```sql
UPDATE appointments
SET status = $1, updated_at = CURRENT_TIMESTAMP
WHERE id = $2
RETURNING *
```

### **6. DELETE with CASCADE**
```sql
DELETE FROM projects WHERE id = $1
-- Automatically deletes related project_students
```

---

## 📈 **Performance Optimizations**

### **1. Database Indexes**
```sql
-- Frequently queried columns
CREATE INDEX idx_appointments_student_id ON appointments(student_id);
CREATE INDEX idx_appointments_advisor_id ON appointments(advisor_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
```

### **2. Query Optimization**
- ✅ Use JOINs instead of N+1 queries
- ✅ SELECT only needed columns
- ✅ Use prepared statements ($1, $2)
- ✅ Batch INSERT for multiple records

### **3. Background Processing**
- ✅ Email sending is non-blocking
- ✅ Use Promise.then() instead of await
- ✅ Log errors, don't throw

### **4. Connection Pooling**
```javascript
const pool = new Pool({
  max: 20,              // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

---

## 🔗 **Dependencies**

```
Controllers → Database Pool → PostgreSQL
     ↓
     → EmailService → Nodemailer → SMTP
     ↓
     → Middleware → JWT → bcrypt
```

---

**สร้างโดย**: Appointment Management System  
**วันที่**: 2025-10-09  
**Architecture**: MVC Pattern (Model-View-Controller)  
**Database**: PostgreSQL  
**ORM**: Native SQL with pg Pool  
**Email**: Nodemailer

