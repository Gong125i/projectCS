# UML Class Diagram Part 3 - Complete Relationship & Integration
## ระบบจัดการนัดหมาย - Appointment Management System

---

## 🔗 **Complete Entity Relationship Diagram**

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                  COMPLETE ENTITY-RELATIONSHIP DIAGRAM                         ║
║                         (Database + Controllers)                              ║
╚═══════════════════════════════════════════════════════════════════════════════╝

                    ┌──────────────────┐
                    │   «entity»       │
                    │     Users        │
                    │  ┌────────────┐  │
                    │  │ id (PK)    │  │
                    │  │ student_id │  │
                    │  │ first_name │  │
                    │  │ last_name  │  │
                    │  │ phone      │  │
                    │  │ email      │  │
                    │  │ role       │  │
                    │  └────────────┘  │
                    └──────────────────┘
                    ▲    ▲    ▲    ▲    ▲
                    │    │    │    │    │
        ┌───────────┼────┼────┘    │    └────────────┐
        │           │    │         │                 │
        │ 1:*       │    │ 1:*     │ 1:*             │ 1:*
        │           │    │         │                 │
        │  advisor  │    │student  │ author          │ recipient
        │           │    │         │                 │
   ┌────▼──────┐   │    │    ┌────▼──────┐   ┌──────▼──────┐
   │ Projects  │   │    │    │ Comments  │   │Notifications│
   │┌─────────┐│   │    │    │┌─────────┐│   │┌───────────┐│
   ││ id (PK) ││   │    │    ││ id (PK) ││   ││ id (PK)   ││
   ││ name    ││   │    │    ││ content ││   ││ type      ││
   ││advisor_id◄───┘    │    ││appt_id ││   ││ title     ││
   │└─────────┘│        │    ││user_id ││   ││ message   ││
   └───────┬───┘        │    │└────┬───┘│   ││ is_read   ││
           │            │    └─────│────┘   ││ user_id  ││
           │ 1:*        │          │        ││ appt_id  ││
           │  project   │          │ 1:*    │└─────┬───┘│
           │            │          │        └──────│────┘
           │            │          │               │
           │         ┌──▼──────────▼───────────────▼────┐
           │         │      «entity»                    │
           └────────►│    Appointments                  │
                  *:1│  ┌────────────────────────────┐  │
                     │  │ id (PK)                    │  │
                     │  │ title                      │  │
                     │  │ date                       │  │
                     │  │ time                       │  │
                     │  │ location                   │  │
                     │  │ notes                      │  │
                     │  │ status                     │  │
                     │  │ student_id (FK) ──────────►│──┘
                     │  │ advisor_id (FK) ──────────►│
                     │  │ project_id (FK) ──────────►│
                     │  │ created_at                 │
                     │  │ updated_at                 │
                     │  └────────────────────────────┘  │
                     └───────────────────────────────────┘
                              ▲
                              │ manages
                              │
                     ┌────────┴─────────┐
                     │  «controller»    │
                     │ Appointments     │
                     │   Controller     │
                     └──────────────────┘


        ┌──────────────────────────────────────────────────┐
        │         «junction table»                         │
        │       Project_Students                           │
        │  ┌────────────────────────────────────────────┐  │
        │  │ project_id (PK, FK) ────► Projects         │  │
        │  │ student_id (PK, FK) ────► Users            │  │
        │  │ created_at                                 │  │
        │  └────────────────────────────────────────────┘  │
        │  Cardinality: Many-to-Many                       │
        └──────────────────────────────────────────────────┘
```

---

## 🎯 **Method Call Hierarchy**

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        METHOD CALL HIERARCHY                                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Frontend API Call
    │
    ▼
┌─────────────────────────────────────────────┐
│ HTTP Request                                │
│ (Axios with JWT token)                      │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ Express Router                              │
│ app.use('/api/appointments', appointmentRoutes) │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ Middleware Stack                            │
│ 1. authenticateToken()                      │
│    └─ JWT verification                      │
│    └─ Load user from database               │
│ 2. requireRole(['advisor']) (optional)      │
│    └─ Check user.role                       │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ Controller Method                           │
│ router.post('/', async (req, res) => {...}) │
│                                              │
│ Flow:                                        │
│ 1. Extract & Validate Parameters            │
│ 2. Authorization Check                      │
│ 3. Database Operations                      │
│    ├─ SELECT (read/verify)                  │
│    ├─ INSERT (create)                       │
│    ├─ UPDATE (modify)                       │
│    └─ DELETE (remove)                       │
│ 4. Business Logic                           │
│ 5. Create Notifications (await)             │
│ 6. Send Emails (background)                 │
│ 7. Format Response                          │
└────────────────┬────────────────────────────┘
                 │
                 ├─────────────────────────────────┐
                 │                                 │
                 ▼                                 ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│ Database Pool                │   │ Email Service                │
│ (PostgreSQL)                 │   │ (Background)                 │
│                              │   │                              │
│ - Execute SQL Query          │   │ 1. Query recipient           │
│ - Return Result              │   │ 2. Build email template      │
│ - Handle Errors              │   │ 3. Send via SMTP             │
│ - Auto-commit                │   │ 4. Log result                │
└──────────────┬───────────────┘   └──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ HTTP Response                               │
│ {success: true, data: {...}}                │
│ Status Code: 200/201/400/404/500            │
└─────────────────────────────────────────────┘
                 │
                 ▼
           Frontend receives
           Updates UI immediately
```

---

## 📋 **All Database Operations by Entity**

### **Users Table Operations**

```sql
-- READ
SELECT * FROM users ORDER BY created_at DESC;
SELECT * FROM users WHERE id = $1;
SELECT * FROM users WHERE student_id = $1;
SELECT * FROM users WHERE phone = $1;

-- CREATE
INSERT INTO users (student_id, first_name, last_name, phone, email, office, role)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- UPDATE
UPDATE users 
SET first_name = $1, last_name = $2, phone = $3, email = $4, office = $5,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $6
RETURNING *;

UPDATE users 
SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
WHERE id = $2;

-- DELETE
-- ไม่มี (ใช้ CASCADE จาก foreign keys แทน)
```

### **Projects Table Operations**

```sql
-- READ
SELECT p.*, u.* 
FROM projects p
JOIN users u ON p.advisor_id = u.id
WHERE p.advisor_id = $1 
ORDER BY p.created_at DESC;

SELECT p.*, u.*
FROM projects p
JOIN users u ON p.advisor_id = u.id
JOIN project_students ps ON p.id = ps.project_id
WHERE ps.student_id = $1;

-- CREATE
INSERT INTO projects (name, advisor_id, academic_year, semester)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- UPDATE
UPDATE projects 
SET name = $1, academic_year = $2, semester = $3, updated_at = CURRENT_TIMESTAMP
WHERE id = $4
RETURNING *;

-- DELETE
DELETE FROM projects WHERE id = $1 AND advisor_id = $2;
```

### **Project_Students Table Operations**

```sql
-- READ
SELECT u.* 
FROM project_students ps
JOIN users u ON ps.student_id = u.id
WHERE ps.project_id = $1;

-- CHECK
SELECT * FROM project_students 
WHERE project_id = $1 AND student_id = $2;

-- CREATE (Add Student)
INSERT INTO project_students (project_id, student_id)
VALUES ($1, $2);

-- DELETE (Remove Student)
DELETE FROM project_students 
WHERE project_id = $1 AND student_id = $2;
```

### **Appointments Table Operations**

```sql
-- READ
SELECT a.*, s.*, ad.*, p.*
FROM appointments a
LEFT JOIN users s ON a.student_id = s.id
JOIN users ad ON a.advisor_id = ad.id
LEFT JOIN projects p ON a.project_id = p.id
WHERE a.advisor_id = $1
ORDER BY a.date DESC, a.time DESC;

-- CREATE
INSERT INTO appointments (title, date, time, location, notes, student_id, advisor_id, project_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- UPDATE (Multiple patterns)
UPDATE appointments 
SET title = COALESCE($1, title),
    date = COALESCE($2, date),
    time = COALESCE($3, time),
    location = COALESCE($4, location),
    notes = COALESCE($5, notes),
    status = $7,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $6
RETURNING *;

UPDATE appointments 
SET status = $1, updated_at = CURRENT_TIMESTAMP 
WHERE id = $2
RETURNING *;

-- DELETE
DELETE FROM appointments WHERE id = $1;

-- UTILITY
UPDATE appointments 
SET status = 'no_response'
WHERE date < CURRENT_DATE 
AND status = 'pending';
```

### **Notifications Table Operations**

```sql
-- READ
SELECT * FROM notifications
WHERE user_id = $1
ORDER BY created_at DESC;

-- CREATE
INSERT INTO notifications (user_id, type, title, message, appointment_id, created_at)
VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP);

-- Batch CREATE (Parallel)
-- Multiple INSERT statements via Promise.all()

-- UPDATE
UPDATE notifications 
SET is_read = TRUE 
WHERE id = $1 AND user_id = $2
RETURNING *;

UPDATE notifications 
SET is_read = TRUE 
WHERE user_id = $1 AND is_read = FALSE;

-- DELETE
-- CASCADE จาก appointments หรือ users
```

### **Comments Table Operations**

```sql
-- READ
SELECT c.*, u.first_name, u.last_name, u.role
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.appointment_id = $1
ORDER BY c.created_at ASC;

-- CREATE, UPDATE, DELETE
-- ยังไม่ได้ implement (prepare for future)
```

---

## 🔐 **Security & Validation Summary**

### **Authentication Methods**

```
╔════════════════════════════════════════════════════════════════╗
║ JWT Token Structure                                            ║
╠════════════════════════════════════════════════════════════════╣
║ Payload: {                                                     ║
║   userId: INTEGER,                                             ║
║   role: 'student' | 'advisor'                                  ║
║ }                                                               ║
║ Secret: process.env.JWT_SECRET                                 ║
║ Expiration: 7 days                                             ║
║ Algorithm: HS256 (default)                                     ║
╚════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════╗
║ Password Hashing                                               ║
╠════════════════════════════════════════════════════════════════╣
║ Library: bcryptjs                                              ║
║ Salt Rounds: 10                                                ║
║ Method: bcrypt.hash(password, 10)                              ║
║ Verification: bcrypt.compare(input, hash)                      ║
║ Default Password: student_id (plain text)                      ║
║ After First Change: bcrypt hashed                              ║
╚════════════════════════════════════════════════════════════════╝
```

### **Authorization Matrix**

| Resource | Action | Student | Advisor | Owner Only |
|----------|--------|---------|---------|------------|
| **Users** | View All | ❌ | ✅ | - |
| | View Self | ✅ | ✅ | - |
| | Create | ❌ | ✅ | - |
| | Update | ✅ | ✅ | ✅ Self or Advisor |
| | Import CSV | ❌ | ✅ | - |
| **Projects** | View All | ✅ | ✅ | Filter by role |
| | View One | ✅ | ✅ | Member or Owner |
| | Create | ❌ | ✅ | - |
| | Update | ❌ | ✅ | ✅ Owner |
| | Delete | ❌ | ✅ | ✅ Owner |
| | Add Student | ❌ | ✅ | ✅ Owner |
| | Remove Student | ❌ | ✅ | ✅ Owner |
| **Appointments** | View All | ✅ | ✅ | Filter by role |
| | View One | ✅ | ✅ | Participant |
| | Create | ✅ | ✅ | - |
| | Update | ✅ | ✅ | ✅ Owner |
| | Delete | ✅ | ✅ | ✅ Owner |
| | Confirm Status | ❌ | ✅ | - |
| | Accept (New) | ✅ | ❌ | Project member |
| | Confirm Changes | ✅ | ✅ | Role-specific |
| | Reject | ✅ | ✅ | Role-specific |
| | Mark Attendance | ❌ | ✅ | - |
| **Notifications** | View | ✅ | ✅ | ✅ Own only |
| | Mark Read | ✅ | ✅ | ✅ Own only |

---

## 🔄 **Integration Patterns**

### **Pattern 1: Create with Notification**

```javascript
/**
 * สร้าง Entity + Notification + Email
 * ใช้ใน: createAppointment, updateAppointment
 */
async function createWithNotification(entityData, recipients) {
  // 1. INSERT entity
  const entity = await pool.query('INSERT INTO ...');
  
  // 2. INSERT notifications (parallel)
  const notifPromises = recipients.map(user =>
    pool.query('INSERT INTO notifications ...')
  );
  await Promise.all(notifPromises);
  
  // 3. Send emails (background - non-blocking)
  recipients.forEach(user => {
    emailService.sendEmail(entity, user)
      .catch(err => console.error(err));
  });
  
  // 4. Return immediately
  return entity;
}

Time: ~70-100ms (ไม่รอ email)
```

### **Pattern 2: Update with Status Change**

```javascript
/**
 * อัปเดต + เปลี่ยนสถานะ + แจ้งเตือน
 * ใช้ใน: confirmChanges, rejectChanges
 */
async function updateWithStatusChange(id, newStatus, notifyUsers) {
  // 1. UPDATE entity
  const entity = await pool.query(
    'UPDATE ... SET status = $1 WHERE id = $2',
    [newStatus, id]
  );
  
  // 2. Create notifications
  await createNotifications(notifyUsers, entity);
  
  // 3. Send emails (background)
  sendEmailsAsync(notifyUsers, entity);
  
  // 4. Return immediately
  return entity;
}

Time: ~50-80ms
```

### **Pattern 3: Query with Relations**

```javascript
/**
 * ดึงข้อมูลพร้อม Relations
 * ใช้ใน: getAppointments, getProjects
 */
async function getWithRelations(userId, role) {
  // ใช้ JOIN แทน N+1 queries
  const query = `
    SELECT a.*, s.*, ad.*, p.*
    FROM appointments a
    LEFT JOIN users s ON a.student_id = s.id
    JOIN users ad ON a.advisor_id = ad.id
    LEFT JOIN projects p ON a.project_id = p.id
    WHERE ${role === 'advisor' ? 'a.advisor_id' : 'a.student_id'} = $1
  `;
  
  const result = await pool.query(query, [userId]);
  
  return formatResults(result.rows);
}

Time: ~30-50ms (single query)
```

---

## 📊 **Performance Metrics**

### **Query Performance**

| Operation | Queries | Avg Time | Notes |
|-----------|---------|----------|-------|
| Login | 1 SELECT | 10-20ms | With bcrypt: +50ms |
| Get Appointments | 1 SELECT (JOIN) | 30-50ms | Include all relations |
| Create Appointment | 2 INSERT | 50-70ms | Appointment + Notification |
| Update Appointment | 1 UPDATE + 1-N INSERT | 60-80ms | + Notifications |
| Confirm Changes | 1 UPDATE + 1 INSERT | 40-60ms | Simple operation |
| Delete Appointment | 1 DELETE | 20-30ms | CASCADE automatic |
| Get Projects | 1 SELECT + N SELECT | 50-100ms | N = number of projects |
| Send Email | 0 (async) | 0ms wait | 1-2s in background |

### **Optimization Techniques Used**

✅ **JOIN instead of N+1**
- ใช้ JOIN เพื่อดึงข้อมูลที่เกี่ยวข้องในครั้งเดียว
- ลด queries จาก 10+ เหลือ 1-2 queries

✅ **Promise.all() for Parallel Operations**
- Insert notifications พร้อมกันทั้งหมด
- แทนการทำทีละรายการ

✅ **Background Email Sending**
- ไม่ใช้ `await` กับการส่งอีเมล
- ใช้ `.then()` ให้ทำงานในพื้นหลัง
- ลดเวลา response จาก 1-2s → 100ms

✅ **Database Indexes**
```sql
-- Indexes for frequent WHERE clauses
CREATE INDEX idx_appointments_advisor_id ON appointments(advisor_id);
CREATE INDEX idx_appointments_student_id ON appointments(student_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

✅ **Prepared Statements**
- ใช้ parameterized queries ($1, $2, ...)
- ป้องกัน SQL Injection
- Database caching query plans

---

## 🧪 **Method Testing Examples**

### **Unit Test Structure**

```javascript
describe('AppointmentsController', () => {
  describe('createAppointment', () => {
    it('should create appointment successfully', async () => {
      // Arrange
      const mockUser = {id: 5, role: 'student'};
      const mockData = {
        title: 'Test',
        date: '2025-10-15',
        time: '14:00',
        location: 'Room 301',
        projectId: 1
      };
      
      // Act
      const result = await createAppointment(mockData, mockUser);
      
      // Assert
      expect(result.status).toBe('pending');
      expect(result.advisorId).toBeDefined();
    });
    
    it('should send notification to advisor', async () => {
      // Test notification creation
    });
    
    it('should send email in background', async () => {
      // Test email service called
    });
  });
});
```

---

## 📈 **Scalability Considerations**

### **Current Limitations**

1. **No Connection Pool Limits**
   - Default pg Pool settings
   - May cause connection exhaustion under load

2. **No Query Caching**
   - Every request hits database
   - Frequent data (projects list) not cached

3. **No Rate Limiting**
   - Vulnerable to abuse
   - No request throttling

4. **Polling for Notifications**
   - 30-second polling interval
   - Inefficient for real-time updates

### **Recommended Improvements**

1. **Redis Caching**
```javascript
const cached = await redis.get(`projects:${userId}`);
if (cached) return JSON.parse(cached);

const projects = await db.query(...);
await redis.setex(`projects:${userId}`, 300, JSON.stringify(projects));
```

2. **WebSocket for Real-time**
```javascript
// Replace polling with WebSocket
wss.on('connection', (ws, req) => {
  const userId = req.user.id;
  userConnections.set(userId, ws);
});

// Push notification immediately
userConnections.get(userId).send(notification);
```

3. **Connection Pool Config**
```javascript
const pool = new Pool({
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

---

**[สิ้นสุด UML Class Diagram - ครบทุก Entities, Methods, และ Relationships]**


