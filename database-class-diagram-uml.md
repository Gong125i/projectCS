# Class Diagram UML - ระบบจัดการนัดหมาย (Appointment Management System)

## 📋 Database Schema - Class Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          APPOINTMENT MANAGEMENT SYSTEM                        │
│                           Database Class Diagram (UML)                        │
└──────────────────────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃            «table»                ┃
┃             Users                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ - id: INTEGER «PK»                ┃
┃ - student_id: VARCHAR(20) «UK»    ┃
┃ - first_name: VARCHAR(100)        ┃
┃ - last_name: VARCHAR(100)         ┃
┃ - phone: VARCHAR(20) «UK»         ┃
┃ - email: VARCHAR(255)             ┃
┃ - office: VARCHAR(100)            ┃
┃ - role: VARCHAR(20)               ┃
┃   «CHECK: 'student' | 'advisor'»  ┃
┃ - password_hash: VARCHAR(255)     ┃
┃ - created_at: TIMESTAMP           ┃
┃ - updated_at: TIMESTAMP           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
       │                    │
       │ 1                  │ 1
       │                    │
       │ advisor_id         │ creates/owns
       │                    │
       ▼ *                  ▼ *
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃            «table»                ┃
┃            Projects               ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ - id: INTEGER «PK»                ┃
┃ - name: VARCHAR(255)              ┃
┃ - advisor_id: INTEGER «FK»        ┃
┃ - created_at: TIMESTAMP           ┃
┃ - updated_at: TIMESTAMP           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
       │                    │
       │ 1                  │ *
       │                    │
       │                    │ project_id
       │                    │
       │                    ▼ *
       │              ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
       │              ┃        «junction table»           ┃
       │              ┃       Project_Students            ┃
       │              ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
       │              ┃ - project_id: INTEGER «PK,FK»     ┃
       │              ┃ - student_id: INTEGER «PK,FK»     ┃
       │              ┃ - created_at: TIMESTAMP           ┃
       │              ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
       │                         │
       │ *                       │ *
       │                         │ student_id
       │                         │
       │                         │
       │                         │
       └─────────────────────────┘
                                 │
       ┌─────────────────────────┼────────────────────────┐
       │                         │                        │
       │ student_id              │ advisor_id             │ user_id
       │                         │                        │
       ▼ *                       ▼ *                      ▼ *
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓              ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃            «table»                ┃              ┃            «table»                ┃
┃          Appointments             ┃              ┃          Notifications            ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫              ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ - id: INTEGER «PK»                ┃              ┃ - id: INTEGER «PK»                ┃
┃ - title: VARCHAR(255)             ┃              ┃ - user_id: INTEGER «FK»           ┃
┃ - date: DATE                      ┃              ┃ - type: VARCHAR(50)               ┃
┃ - time: TIME                      ┃              ┃ - title: VARCHAR(255)             ┃
┃ - location: VARCHAR(255)          ┃              ┃ - message: TEXT                   ┃
┃ - notes: TEXT                     ┃              ┃ - is_read: BOOLEAN                ┃
┃ - status: VARCHAR(20)             ┃              ┃ - appointment_id: INTEGER «FK»    ┃
┃   «CHECK: 'pending' | 'confirmed' ┃              ┃ - created_at: TIMESTAMP           ┃
┃    | 'rejected' | 'cancelled'     ┃              ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┃    | 'completed'»                 ┃                     ▲
┃ - student_id: INTEGER «FK»        ┃                     │
┃ - advisor_id: INTEGER «FK»        ┃                     │ appointment_id
┃ - project_id: INTEGER «FK»        ┃                     │
┃ - created_at: TIMESTAMP           ┃                     │ *
┃ - updated_at: TIMESTAMP           ┃                     │
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛─────────────────────┘
       │
       │ 1
       │ appointment_id
       │
       ▼ *
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃            «table»                ┃
┃            Comments               ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ - id: INTEGER «PK»                ┃
┃ - content: TEXT                   ┃
┃ - appointment_id: INTEGER «FK»    ┃
┃ - user_id: INTEGER «FK»           ┃
┃ - created_at: TIMESTAMP           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
       ▲
       │
       │ user_id
       │
       │ *
       │
   (connects to Users)
```

---

## 📊 **Relationships Summary (ความสัมพันธ์)**

### **1. Users → Projects**
- **Relationship**: One-to-Many (1:*)
- **Type**: Composition
- **Foreign Key**: `projects.advisor_id → users.id`
- **Description**: อาจารย์คนหนึ่งสามารถมีหลายโปรเจค
- **Cascade**: `ON DELETE CASCADE`

### **2. Users ↔ Projects (via Project_Students)**
- **Relationship**: Many-to-Many (*:*)
- **Type**: Association (Junction Table)
- **Foreign Keys**: 
  - `project_students.student_id → users.id`
  - `project_students.project_id → projects.id`
- **Description**: นักศึกษาหลายคนสามารถอยู่ในหลายโปรเจค
- **Cascade**: `ON DELETE CASCADE` (both sides)

### **3. Users → Appointments (as Student)**
- **Relationship**: One-to-Many (1:*)
- **Type**: Association
- **Foreign Key**: `appointments.student_id → users.id`
- **Description**: นักศึกษาคนหนึ่งสามารถมีหลายนัดหมาย
- **Cascade**: `ON DELETE CASCADE`

### **4. Users → Appointments (as Advisor)**
- **Relationship**: One-to-Many (1:*)
- **Type**: Association
- **Foreign Key**: `appointments.advisor_id → users.id`
- **Description**: อาจารย์คนหนึ่งสามารถมีหลายนัดหมาย
- **Cascade**: `ON DELETE CASCADE`

### **5. Projects → Appointments**
- **Relationship**: One-to-Many (1:*)
- **Type**: Association
- **Foreign Key**: `appointments.project_id → projects.id`
- **Description**: โปรเจคหนึ่งสามารถมีหลายนัดหมาย
- **Cascade**: `ON DELETE SET NULL`

### **6. Appointments → Comments**
- **Relationship**: One-to-Many (1:*)
- **Type**: Composition
- **Foreign Key**: `comments.appointment_id → appointments.id`
- **Description**: นัดหมายหนึ่งสามารถมีหลาย comments
- **Cascade**: `ON DELETE CASCADE`

### **7. Users → Comments**
- **Relationship**: One-to-Many (1:*)
- **Type**: Association
- **Foreign Key**: `comments.user_id → users.id`
- **Description**: ผู้ใช้คนหนึ่งสามารถสร้างหลาย comments
- **Cascade**: `ON DELETE CASCADE`

### **8. Users → Notifications**
- **Relationship**: One-to-Many (1:*)
- **Type**: Association
- **Foreign Key**: `notifications.user_id → users.id`
- **Description**: ผู้ใช้คนหนึ่งสามารถมีหลาย notifications
- **Cascade**: `ON DELETE CASCADE`

### **9. Appointments → Notifications**
- **Relationship**: One-to-Many (1:*)
- **Type**: Association
- **Foreign Key**: `notifications.appointment_id → appointments.id`
- **Description**: นัดหมายหนึ่งสามารถมีหลาย notifications
- **Cascade**: `ON DELETE CASCADE`

---

## 🔑 **Keys & Constraints**

### **Primary Keys (PK)**
- `users.id`
- `projects.id`
- `appointments.id`
- `comments.id`
- `notifications.id`
- `project_students(project_id, student_id)` - Composite PK

### **Foreign Keys (FK)**
| Table | Column | References | On Delete |
|-------|--------|------------|-----------|
| projects | advisor_id | users(id) | CASCADE |
| project_students | project_id | projects(id) | CASCADE |
| project_students | student_id | users(id) | CASCADE |
| appointments | student_id | users(id) | CASCADE |
| appointments | advisor_id | users(id) | CASCADE |
| appointments | project_id | projects(id) | SET NULL |
| comments | appointment_id | appointments(id) | CASCADE |
| comments | user_id | users(id) | CASCADE |
| notifications | user_id | users(id) | CASCADE |
| notifications | appointment_id | appointments(id) | CASCADE |

### **Unique Keys (UK)**
- `users.student_id`
- `users.phone`

### **Check Constraints**
- `users.role IN ('student', 'advisor')`
- `appointments.status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')`

---

## 📌 **Indexes**

### **Performance Indexes**
```sql
-- Users
idx_users_student_id ON users(student_id)
idx_users_phone ON users(phone)
idx_users_role ON users(role)

-- Appointments
idx_appointments_student_id ON appointments(student_id)
idx_appointments_advisor_id ON appointments(advisor_id)
idx_appointments_date ON appointments(date)
idx_appointments_status ON appointments(status)

-- Notifications
idx_notifications_user_id ON notifications(user_id)
idx_notifications_is_read ON notifications(is_read)
```

---

## 🔄 **Triggers**

### **Auto-Update Timestamps**
```sql
-- Function
update_updated_at_column()
  - Updates updated_at to CURRENT_TIMESTAMP

-- Triggers
BEFORE UPDATE ON users
BEFORE UPDATE ON projects
BEFORE UPDATE ON appointments
```

---

## 📈 **Cardinality Summary**

```
Users (1) ──────────── (*) Projects
  │                         │
  │ (advisor)              │
  └─────────────────────────┘

Users (*) ←─── Junction ───→ (*) Projects
              (Project_Students)

Users (1) ──────────── (*) Appointments
  │ (student)              │
  │                        │
  │ (advisor)              │
  │                        ▼
  └──────────────────────→ (*)

Projects (1) ──────────── (*) Appointments

Appointments (1) ─────── (*) Comments

Users (1) ──────────── (*) Comments

Users (1) ──────────── (*) Notifications

Appointments (1) ─────── (*) Notifications
```

---

## 🎯 **Business Rules**

1. **User Types**:
   - Users can be either `student` or `advisor`
   - Students have `student_id`, Advisors have `email` and `office`

2. **Projects**:
   - Each project must have exactly one advisor
   - A project can have multiple students (many-to-many)
   - Deleting an advisor deletes all their projects

3. **Appointments**:
   - Each appointment must have one student and one advisor
   - Appointments can optionally be linked to a project
   - Valid statuses: pending, confirmed, rejected, cancelled, completed
   - Deleting a user deletes all related appointments
   - Deleting a project sets `project_id` to NULL in appointments

4. **Comments**:
   - Each comment belongs to one appointment
   - Each comment has one author (user)
   - Deleting an appointment deletes all its comments

5. **Notifications**:
   - Each notification is sent to one user
   - Notifications can optionally reference an appointment
   - Notifications track read/unread status

---

## 🔐 **Data Integrity**

### **Referential Integrity**
- All foreign keys are enforced
- CASCADE deletes maintain consistency
- SET NULL preserves historical data when project is deleted

### **Domain Integrity**
- CHECK constraints on enums (role, status)
- UNIQUE constraints prevent duplicates
- NOT NULL constraints ensure required data

### **Temporal Integrity**
- Automatic timestamps on create
- Trigger-based updates on modify
- Historical tracking via timestamps

---

## 📝 **Notes**

- **Many-to-Many**: Users ↔ Projects requires junction table `project_students`
- **Soft Delete**: System uses CASCADE for most relationships
- **Optional Project**: Appointments can exist without project (individual meetings)
- **Dual Role**: Users can be both student (in appointments) and advisor (in projects)

---

**สร้างโดย**: Appointment Management System
**วันที่**: 2025-10-09
**Database**: PostgreSQL
**Diagram Type**: UML Class Diagram

