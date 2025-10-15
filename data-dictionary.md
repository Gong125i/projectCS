# พจนานุกรมข้อมูล (Data Dictionary)
## ระบบจัดการนัดหมาย - Appointment Management System

---

## 📊 **ภาพรวมฐานข้อมูล**

| # | ตาราง | จำนวน Attributes | จำนวน Records (โดยประมาณ) | คำอธิบาย |
|---|--------|------------------|---------------------------|----------|
| 1 | **users** | 11 | 50-200 | ผู้ใช้ระบบ (นักศึกษา, อาจารย์) |
| 2 | **projects** | 7 | 20-100 | โครงงาน/โปรเจค |
| 3 | **project_students** | 3 | 50-300 | ความสัมพันธ์นักศึกษา-โปรเจค |
| 4 | **appointments** | 12 | 100-1000 | นัดหมาย |
| 5 | **comments** | 5 | 50-500 | คอมเมนต์ในนัดหมาย |
| 6 | **notifications** | 8 | 200-2000 | การแจ้งเตือน |
| 7 | **project_archive** | 18 | 10-50 | โปรเจคที่จัดเก็บ |

---

## 1️⃣ **ตาราง Users (ผู้ใช้)**

### **ข้อมูลทั่วไป**
- **ชื่อตาราง**: `users`
- **Primary Key**: `id` (SERIAL)
- **จำนวน Columns**: 11
- **จุดประสงค์**: เก็บข้อมูลผู้ใช้ทั้งนักศึกษาและอาจารย์

### **Attributes (คอลัมน์)**

| ชื่อ Column | Data Type | Constraints | Null | Default | คำอธิบาย | ตัวอย่างข้อมูล |
|------------|-----------|-------------|------|---------|----------|----------------|
| **id** | INTEGER | PK, SERIAL | ❌ | AUTO | รหัสประจำตัวผู้ใช้ (Auto-increment) | 1, 2, 3, ... |
| **student_id** | VARCHAR(20) | UNIQUE | ✅ | NULL | รหัสนักศึกษา/อาจารย์ ใช้สำหรับ login | "655021001327", "0001" |
| **first_name** | VARCHAR(100) | NOT NULL | ❌ | - | ชื่อจริง (รองรับภาษาไทย) | "วรัญชัย", "อาจารย์" |
| **last_name** | VARCHAR(100) | NOT NULL | ❌ | - | นามสกุล | "วีทอง", "สมชาย" |
| **phone** | VARCHAR(20) | UNIQUE, NOT NULL | ❌ | - | เบอร์โทรศัพท์ (ต้องไม่ซ้ำ) | "0812345678" |
| **email** | VARCHAR(255) | - | ✅ | NULL | อีเมล สำหรับส่งการแจ้งเตือน | "user@mail.rmutk.ac.th" |
| **office** | VARCHAR(100) | - | ✅ | NULL | ห้องทำงาน (เฉพาะอาจารย์) | "ห้อง 301 อาคาร IT" |
| **role** | VARCHAR(20) | CHECK | ❌ | - | บทบาท: 'student' หรือ 'advisor' | "student", "advisor" |
| **password_hash** | VARCHAR(255) | - | ✅ | NULL | รหัสผ่านเข้ารหัส (bcrypt), NULL = ใช้ student_id | "$2b$10$abc..." |
| **created_at** | TIMESTAMP | - | ❌ | NOW() | วันเวลาที่สร้าง account | "2024-01-15 10:30:00" |
| **updated_at** | TIMESTAMP | TRIGGER | ❌ | NOW() | วันเวลาที่แก้ไขล่าสุด (อัพเดทอัตโนมัติ) | "2024-01-20 14:15:00" |

### **Indexes**
```sql
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
```

### **Relationships**
- **1:Many** → Projects (as advisor_id)
- **Many:Many** → Projects (as students via project_students)
- **1:Many** → Appointments (as student_id, advisor_id)
- **1:Many** → Comments (as user_id)
- **1:Many** → Notifications (as user_id)

### **Business Rules**
- student_id ต้องไม่ซ้ำ (ถ้ามีค่า)
- phone ต้องไม่ซ้ำเสมอ
- role ต้องเป็น 'student' หรือ 'advisor' เท่านั้น
- password_hash = NULL หมายถึงใช้ student_id เป็นรหัสผ่าน
- email จำเป็นสำหรับการส่งการแจ้งเตือน

---

## 2️⃣ **ตาราง Projects (โครงงาน)**

### **ข้อมูลทั่วไป**
- **ชื่อตาราง**: `projects`
- **Primary Key**: `id` (SERIAL)
- **จำนวน Columns**: 7
- **จุดประสงค์**: เก็บข้อมูลโครงงาน/โปรเจคของนักศึกษา

### **Attributes (คอลัมน์)**

| ชื่อ Column | Data Type | Constraints | Null | Default | คำอธิบาย | ตัวอย่างข้อมูล |
|------------|-----------|-------------|------|---------|----------|----------------|
| **id** | INTEGER | PK, SERIAL | ❌ | AUTO | รหัสโปรเจค | 1, 2, 3, ... |
| **name** | VARCHAR(255) | NOT NULL | ❌ | - | ชื่อโปรเจค | "ระบบจัดการนัดหมาย" |
| **advisor_id** | INTEGER | FK, NOT NULL | ❌ | - | รหัสอาจารย์ที่ปรึกษา → users.id | 1, 2 |
| **academic_year** | VARCHAR(10) | - | ✅ | NULL | ปีการศึกษา | "2567", "2568" |
| **semester** | VARCHAR(10) | - | ✅ | NULL | ภาคเรียน (⚠️ ไม่ใช้ใน Frontend) | "1", "2", NULL |
| **created_at** | TIMESTAMP | - | ❌ | NOW() | วันที่สร้างโปรเจค | "2024-01-15 10:00:00" |
| **updated_at** | TIMESTAMP | TRIGGER | ❌ | NOW() | วันที่แก้ไขล่าสุด | "2024-01-20 15:30:00" |

### **Foreign Keys**
```sql
advisor_id REFERENCES users(id) ON DELETE CASCADE
```

### **Relationships**
- **Many:1** → Users (advisor)
- **Many:Many** → Users (students via project_students)
- **1:Many** → Appointments
- **1:1** → Project_Archive (when archived)

### **Business Rules**
- โปรเจค 1 โปรเจค มีอาจารย์ที่ปรึกษา 1 คน
- โปรเจค 1 โปรเจค มีได้หลายนักศึกษา
- ลบอาจารย์ → ลบโปรเจคอัตโนมัติ (CASCADE)
- semester ออกแบบไว้แต่ไม่ใช้จริง (Frontend ไม่มี input)

---

## 3️⃣ **ตาราง Project_Students (ความสัมพันธ์)**

### **ข้อมูลทั่วไป**
- **ชื่อตาราง**: `project_students`
- **Primary Key**: Composite (project_id, student_id)
- **จำนวน Columns**: 3
- **จุดประสงค์**: Junction table เชื่อม Many-to-Many ระหว่าง Projects และ Users

### **Attributes (คอลัมน์)**

| ชื่อ Column | Data Type | Constraints | Null | Default | คำอธิบาย | ตัวอย่างข้อมูล |
|------------|-----------|-------------|------|---------|----------|----------------|
| **project_id** | INTEGER | PK, FK | ❌ | - | รหัสโปรเจค → projects.id | 1, 2, 3 |
| **student_id** | INTEGER | PK, FK | ❌ | - | รหัสนักศึกษา → users.id | 5, 6, 7 |
| **created_at** | TIMESTAMP | - | ❌ | NOW() | วันที่เข้าร่วมโปรเจค (⚠️ ไม่ถูกใช้ใน query) | "2024-01-15 10:00:00" |

### **Foreign Keys**
```sql
project_id REFERENCES projects(id) ON DELETE CASCADE
student_id REFERENCES users(id) ON DELETE CASCADE
```

### **Composite Primary Key**
```sql
PRIMARY KEY (project_id, student_id)
```
ป้องกันการเพิ่มนักศึกษาซ้ำในโปรเจคเดียวกัน

### **Relationships**
- **Many:1** → Projects
- **Many:1** → Users (Students)

### **Business Rules**
- นักศึกษา 1 คน อยู่ในได้หลายโปรเจค
- โปรเจค 1 โปรเจค มีได้หลายนักศึกษา
- ไม่สามารถเพิ่มนักศึกษาซ้ำในโปรเจคเดียวกัน (Composite PK)
- ลบโปรเจค/นักศึกษา → ลบความสัมพันธ์อัตโนมัติ (CASCADE)

---

## 4️⃣ **ตาราง Appointments (นัดหมาย)**

### **ข้อมูลทั่วไป**
- **ชื่อตาราง**: `appointments`
- **Primary Key**: `id` (SERIAL)
- **จำนวน Columns**: 12
- **จุดประสงค์**: เก็บข้อมูลการนัดหมายระหว่างนักศึกษาและอาจารย์

### **Attributes (คอลัมน์)**

| ชื่อ Column | Data Type | Constraints | Null | Default | คำอธิบาย | ตัวอย่างข้อมูล |
|------------|-----------|-------------|------|---------|----------|----------------|
| **id** | INTEGER | PK, SERIAL | ❌ | AUTO | รหัสนัดหมาย | 1, 2, 3, ... |
| **title** | VARCHAR(255) | - | ✅ | NULL | หัวข้อนัดหมาย | "ปรึกษาโครงงาน ครั้งที่ 1" |
| **date** | DATE | NOT NULL | ❌ | - | วันที่นัด | "2024-01-15" |
| **time** | TIME | NOT NULL | ❌ | - | เวลานัด | "14:00:00" |
| **location** | VARCHAR(255) | NOT NULL | ❌ | - | สถานที่นัด | "ห้อง 301 อาคาร IT" |
| **notes** | TEXT | - | ✅ | NULL | หมายเหตุ/รายละเอียดเพิ่มเติม | "เตรียม PowerPoint มานำเสนอ" |
| **status** | VARCHAR(20) | CHECK, NOT NULL | ❌ | 'pending' | สถานะนัดหมาย | "pending", "confirmed", "rejected" |
| **student_id** | INTEGER | FK | ✅ | NULL | รหัสนักศึกษา → users.id | 5 |
| **advisor_id** | INTEGER | FK, NOT NULL | ❌ | - | รหัสอาจารย์ → users.id | 1 |
| **project_id** | INTEGER | FK | ✅ | NULL | รหัสโปรเจค → projects.id | 10 |
| **created_at** | TIMESTAMP | - | ❌ | NOW() | วันเวลาที่สร้างนัดหมาย | "2024-01-10 09:30:00" |
| **updated_at** | TIMESTAMP | TRIGGER | ❌ | NOW() | วันเวลาที่แก้ไขนัดล่าสุด | "2024-01-12 16:45:00" |

### **Status Values (ค่าที่เป็นไปได้)**
```sql
CHECK (status IN (
  'pending',                      -- รอการยืนยัน
  'confirmed',                    -- ยืนยันแล้ว
  'rejected',                     -- ปฏิเสธ
  'cancelled',                    -- ยกเลิก
  'completed',                    -- เสร็จสิ้น
  'failed',                       -- ไม่สำเร็จ
  'no_response',                  -- ไม่มีการตอบกลับ (หมดอายุ)
  'pending_student_confirmation', -- รอนักศึกษายืนยัน
  'pending_advisor_confirmation'  -- รออาจารย์ยืนยัน
))
```

### **Indexes**
```sql
CREATE INDEX idx_appointments_student_id ON appointments(student_id);
CREATE INDEX idx_appointments_advisor_id ON appointments(advisor_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
```

### **Foreign Keys**
```sql
student_id REFERENCES users(id) ON DELETE CASCADE
advisor_id REFERENCES users(id) ON DELETE CASCADE
project_id REFERENCES projects(id) ON DELETE SET NULL
```

### **Relationships**
- **Many:1** → Users (student)
- **Many:1** → Users (advisor)
- **Many:1** → Projects
- **1:Many** → Comments
- **1:Many** → Notifications

### **Business Rules**
- นัดหมาย 1 นัด มีนักศึกษา 1 คน และอาจารย์ 1 คน
- student_id อาจเป็น NULL ถ้าอาจารย์สร้างนัดหมายกับนักศึกษาทั้งโปรเจค
- ลบ user → ลบนัดหมายอัตโนมัติ (CASCADE)
- ลบ project → set project_id เป็น NULL (SET NULL)
- status เปลี่ยนได้ตาม flow: pending → confirmed/rejected/cancelled

---

## 5️⃣ **ตาราง Notifications (การแจ้งเตือน)**

### **ข้อมูลทั่วไป**
- **ชื่อตาราง**: `notifications`
- **Primary Key**: `id` (SERIAL)
- **จำนวน Columns**: 8
- **จุดประสงค์**: เก็บการแจ้งเตือนที่ส่งให้ผู้ใช้

### **Attributes (คอลัมน์)**

| ชื่อ Column | Data Type | Constraints | Null | Default | คำอธิบาย | ตัวอย่างข้อมูล |
|------------|-----------|-------------|------|---------|----------|----------------|
| **id** | INTEGER | PK, SERIAL | ❌ | AUTO | รหัสการแจ้งเตือน | 1, 2, 3, ... |
| **user_id** | INTEGER | FK, NOT NULL | ❌ | - | รหัสผู้รับ → users.id | 5 |
| **type** | VARCHAR(50) | NOT NULL | ❌ | - | ประเภทการแจ้งเตือน | "appointment_created" |
| **title** | VARCHAR(255) | NOT NULL | ❌ | - | หัวข้อการแจ้งเตือน | "มีนัดหมายใหม่" |
| **message** | TEXT | NOT NULL | ❌ | - | ข้อความการแจ้งเตือน (HTML) | "คุณมีนัดหมายกับ..." |
| **is_read** | BOOLEAN | - | ❌ | FALSE | อ่านแล้วหรือยัง | true, false |
| **appointment_id** | INTEGER | FK | ✅ | NULL | รหัสนัดหมายที่เกี่ยวข้อง → appointments.id | 20 |
| **created_at** | TIMESTAMP | - | ❌ | NOW() | วันเวลาที่ได้รับการแจ้งเตือน | "2024-01-15 14:00:00" |

### **Type Values (ประเภท)**
```
- appointment_created          - มีนัดหมายใหม่
- appointment_confirmed        - นัดหมายได้รับการยืนยัน
- appointment_rejected         - นัดหมายถูกปฏิเสธ
- appointment_updated          - มีการแก้ไขนัดหมาย
- appointment_cancelled        - นัดหมายถูกยกเลิก
- appointment_accepted         - ยอมรับนัดหมาย
- appointment_change_confirmed - ยืนยันการเปลี่ยนแปลง
- appointment_change_rejected  - ปฏิเสธการเปลี่ยนแปลง
```

### **Indexes**
```sql
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

### **Foreign Keys**
```sql
user_id REFERENCES users(id) ON DELETE CASCADE
appointment_id REFERENCES appointments(id) ON DELETE CASCADE
```

### **Relationships**
- **Many:1** → Users
- **Many:1** → Appointments

### **Business Rules**
- การแจ้งเตือน 1 รายการ ส่งถึง user 1 คน
- is_read default = FALSE (ยังไม่อ่าน)
- ลบ user/appointment → ลบการแจ้งเตือนอัตโนมัติ (CASCADE)
- สร้างอัตโนมัติเมื่อมีการเปลี่ยนแปลงนัดหมาย

---

## 6️⃣ **ตาราง Comments (ความคิดเห็น)**

### **ข้อมูลทั่วไป**
- **ชื่อตาราง**: `comments`
- **Primary Key**: `id` (SERIAL)
- **จำนวน Columns**: 5
- **จุดประสงค์**: เก็บคอมเมนต์/ความคิดเห็นในนัดหมาย

### **Attributes (คอลัมน์)**

| ชื่อ Column | Data Type | Constraints | Null | Default | คำอธิบาย | ตัวอย่างข้อมูล |
|------------|-----------|-------------|------|---------|----------|----------------|
| **id** | INTEGER | PK, SERIAL | ❌ | AUTO | รหัสคอมเมนต์ | 1, 2, 3, ... |
| **content** | TEXT | NOT NULL | ❌ | - | เนื้อหาคอมเมนต์ | "เห็นด้วยกับการเปลี่ยนแปลง" |
| **appointment_id** | INTEGER | FK, NOT NULL | ❌ | - | รหัสนัดหมาย → appointments.id | 20 |
| **user_id** | INTEGER | FK, NOT NULL | ❌ | - | รหัสผู้เขียน → users.id | 5 |
| **created_at** | TIMESTAMP | - | ❌ | NOW() | วันเวลาที่เขียนคอมเมนต์ | "2024-01-15 15:30:00" |

### **Foreign Keys**
```sql
appointment_id REFERENCES appointments(id) ON DELETE CASCADE
user_id REFERENCES users(id) ON DELETE CASCADE
```

### **Relationships**
- **Many:1** → Appointments
- **Many:1** → Users

### **Business Rules**
- คอมเมนต์ 1 อัน อยู่ใน 1 นัดหมาย
- คอมเมนต์ 1 อัน ถูกเขียนโดย 1 คน
- เฉพาะสมาชิกในนัดหมายเท่านั้นที่คอมเมนต์ได้
- ลบนัดหมาย/user → ลบคอมเมนต์อัตโนมัติ (CASCADE)
- ไม่สามารถแก้ไขหรือลบคอมเมนต์ได้ (ไม่มี UPDATE/DELETE method)

---

## 7️⃣ **ตาราง Project_Archive (โครงงานที่จัดเก็บ)**

### **ข้อมูลทั่วไป**
- **ชื่อตาราง**: `project_archive`
- **Primary Key**: `id` (SERIAL)
- **จำนวน Columns**: 18
- **จุดประสงค์**: จัดเก็บประวัติโครงงานที่เสร็จสิ้นแล้ว พร้อมสถิติ

### **Attributes (คอลัมน์)**

| ชื่อ Column | Data Type | Null | Default | คำอธิบาย | ตัวอย่าง | สถานะ |
|------------|-----------|------|---------|----------|----------|-------|
| **id** | INTEGER (PK) | ❌ | AUTO | รหัสการจัดเก็บ | 1, 2, 3 | ✅ ใช้ |
| **project_id** | INTEGER | ✅ | NULL | รหัสโปรเจคเดิม (ไม่ใช่ FK) | 10 | ✅ ใช้ |
| **project_name** | VARCHAR(255) | ❌ | - | ชื่อโปรเจค | "ระบบจัดการนัดหมาย" | ✅ ใช้ |
| **description** | TEXT | ✅ | NULL | คำอธิบายโปรเจค | "" (empty) | ⚠️ ว่าง |
| **advisor_name** | VARCHAR(255) | ✅ | NULL | ชื่ออาจารย์ที่ปรึกษา | "ดร.สมชาย ใจดี" | ✅ ใช้ |
| **student_names** | TEXT[] | ✅ | NULL | รายชื่อนักศึกษา (array) | ["วรัญชัย วีทอง", "..."] | ✅ ใช้ |
| **academic_year** | VARCHAR(10) | ✅ | NULL | ปีการศึกษา | "2567" | ✅ ใช้ |
| **semester** | VARCHAR(10) | ✅ | NULL | ภาคเรียน | NULL (ไม่ใช้) | ⚠️ NULL |
| **completion_date** | DATE | ✅ | NULL | วันที่เสร็จสิ้น | "2024-05-15" | ✅ ใช้ |
| **project_type** | VARCHAR(100) | ✅ | NULL | ประเภทโปรเจค | "Web Application" | ✅ ใช้ |
| **total_appointments** | INTEGER | ✅ | 0 | จำนวนนัดทั้งหมด | 10 | ✅ ใช้ |
| **completed_appointments** | INTEGER | ✅ | 0 | จำนวนนัดที่เสร็จ | 8 | ✅ ใช้ |
| **success_rate** | DECIMAL(5,2) | ✅ | 0.0 | อัตราความสำเร็จ (%) | 80.00 | ✅ ใช้ |
| **attendance_rate** | DECIMAL(5,2) | ✅ | 0.0 | อัตราการเข้านัด (%) | 90.00 | ✅ ใช้ |
| **appointment_details** | JSONB | ✅ | NULL | รายละเอียดนัดหมาย (JSON) | [{...}, {...}] | ✅ ใช้ |
| **technology_used** | TEXT[] | ✅ | NULL | เทคโนโลยีที่ใช้ (array) | NULL (ไม่ INSERT) | ❌ NULL |
| **keywords** | TEXT[] | ✅ | NULL | คำสำคัญ (array) | NULL (ไม่ INSERT) | ❌ NULL |
| **final_grade** | VARCHAR(5) | ✅ | NULL | เกรดสุดท้าย | NULL (ไม่ INSERT) | ❌ NULL |
| **created_at** | TIMESTAMP | ❌ | NOW() | วันที่จัดเก็บ | "2024-05-20 10:00:00" | ✅ ใช้ |

### **Foreign Keys**
ไม่มี - เป็นข้อมูลที่จัดเก็บแยก (snapshot) ไม่อ้างอิงตารางอื่น

### **Relationships**
- ไม่มี Foreign Key relationships (เป็น independent archive)
- เก็บข้อมูลเป็น snapshot ณ เวลาที่จัดเก็บ

### **Business Rules**
- บันทึกข้อมูลสรุปโปรเจคเมื่อเสร็จสิ้น
- ไม่มีการลบ (เก็บถาวร)
- ไม่มีการแก้ไข (read-only archive)
- เฉพาะอาจารย์เท่านั้นที่เข้าถึงได้

### **⚠️ Unused Attributes (ไม่ได้ใช้งาน)**
1. **description** - INSERT แต่ใส่ `''` (empty) เสมอ
2. **semester** - INSERT แต่ค่าเป็น NULL (Frontend ไม่ส่ง)
3. **technology_used** - ไม่มี INSERT (NULL เสมอ)
4. **keywords** - ไม่มี INSERT (NULL เสมอ)
5. **final_grade** - ไม่มี INSERT (NULL เสมอ)

---

## 📊 **สรุปภาพรวม Data Dictionary**

### **จำนวน Attributes รวม**
- **Users**: 11 attributes (ใช้ทั้งหมด)
- **Projects**: 7 attributes (ไม่ใช้ 1 ตัว: semester)
- **Project_Students**: 3 attributes (ไม่ใช้ 1 ตัว: created_at)
- **Appointments**: 12 attributes (ใช้ทั้งหมด)
- **Comments**: 5 attributes (ใช้ทั้งหมด)
- **Notifications**: 8 attributes (ใช้ทั้งหมด)
- **Project_Archive**: 18 attributes (ไม่ใช้ 5 ตัว)

**รวมทั้งหมด: 64 attributes**  
**ใช้งานจริง: 56 attributes**  
**ไม่ได้ใช้: 8 attributes**

---

### **Primary Keys (ทุกตาราง)**
```sql
users.id
projects.id
project_students.(project_id, student_id)  -- Composite PK
appointments.id
comments.id
notifications.id
project_archive.id
```

### **Foreign Keys Summary**
```sql
projects.advisor_id          → users.id
project_students.project_id  → projects.id
project_students.student_id  → users.id
appointments.student_id      → users.id
appointments.advisor_id      → users.id
appointments.project_id      → projects.id
comments.appointment_id      → appointments.id
comments.user_id             → users.id
notifications.user_id        → users.id
notifications.appointment_id → appointments.id
```

### **Cascade Delete Behavior**
- ลบ **User** → ลบ Projects, Appointments, Comments, Notifications ของ user
- ลบ **Project** → ลบ Project_Students, SET NULL ใน Appointments
- ลบ **Appointment** → ลบ Comments, Notifications ที่เกี่ยวข้อง

---

### **Data Types ที่ใช้**
- **INTEGER** - Primary keys, Foreign keys, จำนวนต่างๆ
- **VARCHAR** - ข้อความสั้น (มีความยาวจำกัด)
- **TEXT** - ข้อความยาว (ไม่จำกัดความยาว)
- **DATE** - วันที่ (YYYY-MM-DD)
- **TIME** - เวลา (HH:MM:SS)
- **TIMESTAMP** - วันเวลา (YYYY-MM-DD HH:MM:SS)
- **BOOLEAN** - true/false
- **DECIMAL** - ทศนิยม (สำหรับเปอร์เซ็นต์)
- **JSONB** - JSON binary (เก็บข้อมูล JSON)
- **TEXT[]** - Array of text

---

### **Constraints ที่ใช้**
- **PRIMARY KEY (PK)** - ไม่ซ้ำ, ไม่เป็น NULL
- **FOREIGN KEY (FK)** - อ้างอิงตารางอื่น
- **UNIQUE** - ค่าไม่ซ้ำ
- **NOT NULL** - ต้องมีค่า
- **CHECK** - ตรวจสอบค่าที่อนุญาต
- **DEFAULT** - ค่าเริ่มต้น
- **SERIAL** - Auto-increment (1, 2, 3, ...)

---

### **Triggers (อัตโนมัติ)**
```sql
-- Auto-update updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

**สร้างโดย**: Appointment Management System  
**วันที่**: 2024-10-11  
**Database**: PostgreSQL 14+  
**Encoding**: UTF-8 (รองรับภาษาไทย)

