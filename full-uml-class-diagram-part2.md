# UML Class Diagram Part 2 - Appointments Methods
## ระบบจัดการนัดหมาย - Appointment Management System

---

## 3️⃣ **Appointment Controller Methods (ต่อจาก Part 1)**

```
╔════════════════════════════════════════════════════════════════════════════╗
║                           «controller»                                     ║
║                      AppointmentsController                                ║
║                   /backend/routes/appointments.js                          ║
╠════════════════════════════════════════════════════════════════════════════╣
║ METHODS (พฤติกรรม) - ทั้งหมด 15 methods                                   ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                             ║
║ 📖 READ OPERATIONS                                                         ║
║ ═══════════════════════════════════════════════════════════════════════   ║
║                                                                             ║
║ + getAppointments(): Appointment[]                                         ║
║   HTTP: GET /api/appointments                                              ║
║   Auth: Required                                                           ║
║   Parameters: None                                                         ║
║   Returns: Array<Appointment> พร้อม student, advisor, project              ║
║   Query:                                                                   ║
║     Advisor: SELECT a.*, s.*, ad.*, p.*                                    ║
║              FROM appointments a                                           ║
║              LEFT JOIN users s ON a.student_id = s.id                      ║
║              JOIN users ad ON a.advisor_id = ad.id                         ║
║              LEFT JOIN projects p ON a.project_id = p.id                   ║
║              WHERE a.advisor_id = $1                                       ║
║     Student: ... WHERE a.student_id = $1 OR ps.student_id = $1             ║
║   Filter: ตาม role (advisor เห็นที่ตัวเองเป็นที่ปรึกษา, student เห็นของตัวเอง) ║
║   Order: date DESC, time DESC                                              ║
║   อธิบาย: ดึงรายการนัดหมายทั้งหมดตาม role พร้อมข้อมูลเกี่ยวข้อง            ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + getAppointmentById(id: Integer): Appointment                             ║
║   HTTP: GET /api/appointments/:id                                          ║
║   Auth: Required                                                           ║
║   Parameters:                                                              ║
║     - id: INTEGER - Appointment ID                                         ║
║   Returns: Appointment object พร้อม student, advisor, project, comments    ║
║   Queries:                                                                 ║
║     1. SELECT appointment with JOINs                                       ║
║     2. SELECT comments with user info                                      ║
║   Authorization: เฉพาะผู้ที่เกี่ยวข้อง (student, advisor, or project member) ║
║   อธิบาย: ดึงข้อมูลนัดหมายเฉพาะ ID พร้อมความคิดเห็นทั้งหมด               ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ ✏️ CREATE OPERATIONS                                                       ║
║ ═══════════════════════════════════════════════════════════════════════   ║
║                                                                             ║
║ + createAppointment(data: AppointmentCreateDTO): Appointment               ║
║   HTTP: POST /api/appointments                                             ║
║   Auth: Required                                                           ║
║   Parameters:                                                              ║
║     - title: VARCHAR(255) - หัวข้อ (required)                              ║
║     - date: DATE - วันที่ (required)                                        ║
║     - time: TIME - เวลา (required)                                         ║
║     - location: VARCHAR(255) - สถานที่ (required)                          ║
║     - notes?: TEXT - หมายเหตุ (optional)                                   ║
║     - projectId: INTEGER - รหัสโปรเจค (required)                           ║
║   Returns: Created Appointment object                                      ║
║   Process:                                                                 ║
║     1. ดึงข้อมูลโปรเจค                                                     ║
║     2. กำหนด student_id, advisor_id ตาม role ผู้สร้าง                      ║
║        - Student: advisor_id จากโปรเจค, student_id = ตัวเอง               ║
║        - Advisor: advisor_id = ตัวเอง, student_id = NULL                   ║
║     3. INSERT appointment                                                  ║
║     4. INSERT notification ให้ผู้รับ                                       ║
║     5. ส่ง email (background, non-blocking)                                ║
║   Side Effects:                                                            ║
║     - สร้าง notification 1-N รายการ                                        ║
║     - ส่ง email 1-N ฉบับ (ในพื้นหลัง)                                      ║
║   Default Status: 'pending'                                                ║
║   อธิบาย: สร้างนัดหมายใหม่ (student→advisor หรือ advisor→students)        ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ 🔄 UPDATE OPERATIONS                                                       ║
║ ═══════════════════════════════════════════════════════════════════════   ║
║                                                                             ║
║ + updateAppointment(id: Integer, data: AppointmentUpdateDTO): Appointment  ║
║   HTTP: PUT /api/appointments/:id                                          ║
║   Auth: Required (Owner only)                                              ║
║   Parameters:                                                              ║
║     - id: INTEGER - Appointment ID                                         ║
║     - title?: VARCHAR(255) - หัวข้อ (optional)                             ║
║     - date?: DATE - วันที่ (optional)                                       ║
║     - time?: TIME - เวลา (optional)                                        ║
║     - location?: VARCHAR(255) - สถานที่ (optional)                         ║
║     - notes?: TEXT - หมายเหตุ (optional)                                   ║
║   Returns: Updated Appointment object                                      ║
║   Query: UPDATE appointments SET {fields}, status = {new_status}           ║
║   Status Changes:                                                          ║
║     - Advisor แก้ไข → status = 'pending_student_confirmation'              ║
║     - Student แก้ไข → status = 'pending_advisor_confirmation'              ║
║   Side Effects:                                                            ║
║     - สร้าง notification ให้อีกฝ่ายที่ต้องยืนยัน                           ║
║     - ส่ง email แจ้งการเปลี่ยนแปลง (background)                            ║
║   Validations:                                                             ║
║     - ไม่สามารถแก้ไขถ้า status = completed, failed, rejected, no_response   ║
║     - ยกเว้น: แก้ไข notes ได้แม้ completed                                 ║
║   อธิบาย: แก้ไขนัดหมาย และเปลี่ยน status ให้รอฝั่งตรงข้ามยืนยัน            ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + updateStatus(id: Integer, status: String): Appointment                   ║
║   HTTP: PUT /api/appointments/:id/status/:status                           ║
║   Auth: Required (Advisor only)                                            ║
║   Parameters:                                                              ║
║     - id: INTEGER - Appointment ID                                         ║
║     - status: VARCHAR(20) - สถานะใหม่                                      ║
║       ค่าที่เป็นไปได้: confirmed, rejected, cancelled                      ║
║   Returns: Updated Appointment object                                      ║
║   Query: UPDATE appointments SET status = $1 WHERE id = $2                 ║
║   Side Effects (ตาม status):                                               ║
║     • confirmed:                                                           ║
║       - สร้าง notification type 'appointment_confirmed'                    ║
║       - ส่ง email ยืนยันการนัดหมาย                                         ║
║     • rejected:                                                            ║
║       - สร้าง notification type 'appointment_rejected'                     ║
║       - ส่ง email ปฏิเสธการนัดหมาย                                         ║
║     • cancelled:                                                           ║
║       - แจ้งเตือนทั้ง student และ advisor                                  ║
║       - ส่ง email ยกเลิกนัดหมาย                                            ║
║   อธิบาย: อาจารย์เปลี่ยนสถานะนัดหมาย (ยืนยัน/ปฏิเสธ/ยกเลิก)              ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ ✅ CONFIRMATION OPERATIONS                                                 ║
║ ═══════════════════════════════════════════════════════════════════════   ║
║                                                                             ║
║ + studentConfirmChanges(id: Integer): Appointment                          ║
║   HTTP: PUT /api/appointments/:id/confirm-changes                          ║
║   Auth: Required (Student owner only)                                      ║
║   Parameters:                                                              ║
║     - id: INTEGER - Appointment ID                                         ║
║   Returns: Updated Appointment object                                      ║
║   Query: UPDATE appointments SET status = 'confirmed' WHERE id = $1        ║
║   Validates:                                                               ║
║     - status ต้องเป็น 'pending_student_confirmation'                       ║
║     - student ต้องเป็นเจ้าของนัดหมาย                                       ║
║   Side Effects:                                                            ║
║     - สร้าง notification ให้ advisor                                       ║
║     - ส่ง email แจ้ง advisor (background)                                  ║
║   อธิบาย: นักศึกษายืนยันการเปลี่ยนแปลงที่อาจารย์แก้ไข                      ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + advisorConfirmChanges(id: Integer): Appointment                          ║
║   HTTP: PUT /api/appointments/:id/advisor-confirm-changes                  ║
║   Auth: Required (Advisor only)                                            ║
║   Parameters:                                                              ║
║     - id: INTEGER - Appointment ID                                         ║
║   Returns: Updated Appointment object                                      ║
║   Query: UPDATE appointments SET status = 'confirmed' WHERE id = $1        ║
║   Validates:                                                               ║
║     - status ต้องเป็น 'pending_advisor_confirmation'                       ║
║   Side Effects:                                                            ║
║     - สร้าง notification ให้ student(s)                                    ║
║     - ส่ง email แจ้ง student(s) (background)                               ║
║       * ถ้ามี student_id: แจ้ง 1 คน                                        ║
║       * ถ้าเป็น project: แจ้งทุกคนในโปรเจค                                ║
║   อธิบาย: อาจารย์ยืนยันการเปลี่ยนแปลงที่นักศึกษาแก้ไข                      ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + studentAccept(id: Integer): Appointment                                  ║
║   HTTP: PUT /api/appointments/:id/accept                                   ║
║   Auth: Required (Student in project)                                      ║
║   Parameters:                                                              ║
║     - id: INTEGER - Appointment ID                                         ║
║   Returns: Updated Appointment object                                      ║
║   Query: UPDATE appointments SET status = 'confirmed' WHERE id = $1        ║
║   Validates:                                                               ║
║     - status ต้องเป็น 'pending'                                            ║
║     - student ต้องอยู่ในโปรเจคของนัดหมาย                                   ║
║   Side Effects:                                                            ║
║     - สร้าง notification type 'appointment_accepted' ให้ advisor           ║
║     - ส่ง email แจ้ง advisor (background)                                  ║
║   อธิบาย: นักศึกษายอมรับนัดหมายที่อาจารย์สร้าง                             ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ ❌ REJECTION OPERATIONS                                                    ║
║ ═══════════════════════════════════════════════════════════════════════   ║
║                                                                             ║
║ + studentRejectChanges(id: Integer): Appointment                           ║
║   HTTP: PUT /api/appointments/:id/reject-changes                           ║
║   Auth: Required (Student owner only)                                      ║
║   Parameters:                                                              ║
║     - id: INTEGER - Appointment ID                                         ║
║   Returns: Updated Appointment object                                      ║
║   Query: UPDATE appointments SET status = 'rejected' WHERE id = $1         ║
║   Validates:                                                               ║
║     - status ต้องเป็น 'pending_student_confirmation'                       ║
║   Side Effects:                                                            ║
║     - สร้าง notification type 'appointment_change_rejected'                ║
║     - ส่ง email แจ้ง advisor                                               ║
║   อธิบาย: นักศึกษาปฏิเสธการเปลี่ยนแปลงที่อาจารย์แก้ไข                      ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + advisorRejectChanges(id: Integer): Appointment                           ║
║   HTTP: PUT /api/appointments/:id/advisor-reject-changes                   ║
║   Auth: Required (Advisor only)                                            ║
║   Parameters:                                                              ║
║     - id: INTEGER - Appointment ID                                         ║
║   Returns: Updated Appointment object                                      ║
║   Query: UPDATE appointments SET status = 'rejected' WHERE id = $1         ║
║   Validates:                                                               ║
║     - status ต้องเป็น 'pending_advisor_confirmation'                       ║
║   Side Effects:                                                            ║
║     - สร้าง notifications ให้ student(s)                                   ║
║     - ส่ง emails แจ้ง student(s)                                           ║
║   อธิบาย: อาจารย์ปฏิเสธการเปลี่ยนแปลงที่นักศึกษาแก้ไข                      ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + studentReject(id: Integer, reason?: String): Appointment                 ║
║   HTTP: PUT /api/appointments/:id/student-reject                           ║
║   Auth: Required (Student in project)                                      ║
║   Parameters:                                                              ║
║     - id: INTEGER - Appointment ID                                         ║
║     - reason?: TEXT - เหตุผลที่ปฏิเสธ (optional)                           ║
║   Returns: Updated Appointment object                                      ║
║   Query: UPDATE appointments SET status = 'rejected' WHERE id = $1         ║
║   Validates:                                                               ║
║     - status ต้องเป็น 'pending'                                            ║
║   Side Effects:                                                            ║
║     - สร้าง notification พร้อม reason (ถ้ามี)                              ║
║     - ส่ง email ให้ advisor                                                ║
║   อธิบาย: นักศึกษาปฏิเสธนัดหมายใหม่จากอาจารย์                             ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ 🗑️ DELETE OPERATIONS                                                      ║
║ ═══════════════════════════════════════════════════════════════════════   ║
║                                                                             ║
║ + deleteAppointment(id: Integer): Success                                  ║
║   HTTP: DELETE /api/appointments/:id                                       ║
║   Auth: Required (Owner only)                                              ║
║   Parameters:                                                              ║
║     - id: INTEGER - Appointment ID                                         ║
║   Returns: {success: Boolean, message: String}                             ║
║   Query: DELETE FROM appointments WHERE id = $1                            ║
║   Cascade Effects:                                                         ║
║     - ลบ comments ทั้งหมดที่เกี่ยวข้อง (ON DELETE CASCADE)                 ║
║     - ลบ notifications ที่เกี่ยวข้อง (ON DELETE CASCADE)                   ║
║   Authorization:                                                           ║
║     - student: เฉพาะนัดหมายของตัวเองหรือในโปรเจค                         ║
║     - advisor: เฉพาะนัดหมายที่ตัวเองเป็นที่ปรึกษา                          ║
║   อธิบาย: ลบนัดหมายออกจากระบบพร้อมข้อมูลที่เกี่ยวข้องทั้งหมด              ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ ⏰ UTILITY OPERATIONS                                                      ║
║ ═══════════════════════════════════════════════════════════════════════   ║
║                                                                             ║
║ + checkExpiredAppointments(): Success                                      ║
║   HTTP: POST /api/appointments/check-expired                               ║
║   Auth: Required                                                           ║
║   Parameters: None                                                         ║
║   Returns: {success: Boolean, updated: Integer}                            ║
║   Query:                                                                   ║
║     SELECT * FROM appointments                                             ║
║     WHERE date < CURRENT_DATE                                              ║
║     AND status = 'pending'                                                 ║
║   Process:                                                                 ║
║     1. หานัดหมายที่หมดอายุ (วันที่ผ่านมาแล้ว + status = pending)          ║
║     2. UPDATE status = 'no_response'                                       ║
║   Execution: เรียกจาก frontend เมื่อโหลดหน้า appointments                  ║
║   อธิบาย: ตรวจสอบและอัปเดตนัดหมายที่หมดอายุเป็น 'no_response'             ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## 4️⃣ **Notification Entity & Operations**

### 📦 **Database Model (Entity)**

```
╔════════════════════════════════════════════════════════════════╗
║                        «entity»                                ║
║                     Notifications                              ║
╠════════════════════════════════════════════════════════════════╣
║ ATTRIBUTES (คุณสมบัติ)                                         ║
╠════════════════════════════════════════════════════════════════╣
║ - id: INTEGER «PK, AUTO_INCREMENT»                             ║
║   อธิบาย: รหัสประจำตัวการแจ้งเตือน                             ║
║                                                                 ║
║ - user_id: INTEGER «FK»                                        ║
║   อธิบาย: รหัสผู้ใช้ที่จะได้รับการแจ้งเตือน                     ║
║   ข้อจำกัด: NOT NULL, REFERENCES users(id) ON DELETE CASCADE   ║
║   Relationship: Many-to-One → Users                            ║
║                                                                 ║
║ - type: VARCHAR(50)                                            ║
║   อธิบาย: ประเภทการแจ้งเตือน                                   ║
║   ข้อจำกัด: NOT NULL                                            ║
║   ค่าที่เป็นไปได้:                                              ║
║     • appointment_request - นัดหมายใหม่                        ║
║     • appointment_accepted - นักศึกษาตอบรับ                    ║
║     • appointment_confirmed - นัดหมายได้รับการยืนยัน            ║
║     • appointment_rejected - นัดหมายถูกปฏิเสธ                  ║
║     • appointment_change_confirmed - ยืนยันการเปลี่ยนแปลง      ║
║     • appointment_change_rejected - ปฏิเสธการเปลี่ยนแปลง        ║
║     • appointment - การแก้ไขนัดหมาย                            ║
║                                                                 ║
║ - title: VARCHAR(255)                                          ║
║   อธิบาย: หัวข้อการแจ้งเตือน                                   ║
║   ข้อจำกัด: NOT NULL                                            ║
║   ตัวอย่าง: "นัดหมายใหม่จากอาจารย์ที่ปรึกษา"                   ║
║                                                                 ║
║ - message: TEXT                                                ║
║   อธิบาย: ข้อความรายละเอียด                                    ║
║   ข้อจำกัด: NOT NULL                                            ║
║   ตัวอย่าง: "อาจารย์ อาจารย์ 1 สร้างนัดหมายใหม่"               ║
║                                                                 ║
║ - is_read: BOOLEAN                                             ║
║   อธิบาย: สถานะการอ่าน                                         ║
║   ค่าเริ่มต้น: FALSE                                            ║
║   ค่า: TRUE = อ่านแล้ว, FALSE = ยังไม่อ่าน                     ║
║                                                                 ║
║ - appointment_id: INTEGER «FK»                                 ║
║   อธิบาย: รหัสนัดหมายที่เกี่ยวข้อง (NULL ได้)                   ║
║   ข้อจำกัด: REFERENCES appointments(id) ON DELETE CASCADE      ║
║   Relationship: Many-to-One → Appointments                     ║
║                                                                 ║
║ - created_at: TIMESTAMP                                        ║
║   อธิบาย: วันเวลาที่สร้างการแจ้งเตือน                          ║
║   ใช้สำหรับ: เรียงลำดับ (ใหม่สุดก่อน)                          ║
╚════════════════════════════════════════════════════════════════╝
```

### 🎮 **Controller Methods**

```
╔════════════════════════════════════════════════════════════════════════════╗
║                           «controller»                                     ║
║                     NotificationsController                                ║
║                  /backend/routes/notifications.js                          ║
╠════════════════════════════════════════════════════════════════════════════╣
║ + getNotifications(): Notification[]                                       ║
║   HTTP: GET /api/notifications                                             ║
║   Auth: Required                                                           ║
║   Parameters: None                                                         ║
║   Returns: Array<Notification>                                             ║
║   Query: SELECT * FROM notifications                                       ║
║          WHERE user_id = $1                                                ║
║          ORDER BY created_at DESC                                          ║
║   Filter: เฉพาะการแจ้งเตือนของผู้ใช้ที่ login                              ║
║   Order: ใหม่สุดก่อน                                                       ║
║   Polling: Frontend เรียกทุก 30 วินาที                                     ║
║   อธิบาย: ดึงการแจ้งเตือนทั้งหมดของผู้ใช้                                  ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + markAsRead(id: Integer): Notification                                    ║
║   HTTP: PUT /api/notifications/:id/read                                    ║
║   Auth: Required (Owner only)                                              ║
║   Parameters:                                                              ║
║     - id: INTEGER - Notification ID                                        ║
║   Returns: Updated Notification object                                     ║
║   Query: UPDATE notifications                                              ║
║          SET is_read = TRUE                                                ║
║          WHERE id = $1 AND user_id = $2                                    ║
║   Authorization: เฉพาะเจ้าของ notification                                 ║
║   อธิบาย: ทำเครื่องหมายว่าอ่านแล้ว (1 รายการ)                             ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + markAllAsRead(): Success                                                 ║
║   HTTP: PUT /api/notifications/read-all                                    ║
║   Auth: Required                                                           ║
║   Parameters: None                                                         ║
║   Returns: {success: Boolean, message: String}                             ║
║   Query: UPDATE notifications                                              ║
║          SET is_read = TRUE                                                ║
║          WHERE user_id = $1 AND is_read = FALSE                            ║
║   อธิบาย: ทำเครื่องหมายว่าอ่านแล้วทั้งหมด                                 ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## 5️⃣ **Comment Entity & Operations**

### 📦 **Database Model (Entity)**

```
╔════════════════════════════════════════════════════════════════╗
║                        «entity»                                ║
║                       Comments                                 ║
╠════════════════════════════════════════════════════════════════╣
║ ATTRIBUTES (คุณสมบัติ)                                         ║
╠════════════════════════════════════════════════════════════════╣
║ - id: INTEGER «PK, AUTO_INCREMENT»                             ║
║   อธิบาย: รหัสประจำตัวความคิดเห็น                             ║
║                                                                 ║
║ - content: TEXT                                                ║
║   อธิบาย: เนื้อหาความคิดเห็น                                   ║
║   ข้อจำกัด: NOT NULL                                            ║
║   ตัวอย่าง: "ครั้งหน้าเตรียม slides มาด้วยนะครับ"             ║
║                                                                 ║
║ - appointment_id: INTEGER «FK»                                 ║
║   อธิบาย: รหัสนัดหมายที่แสดงความคิดเห็น                        ║
║   ข้อจำกัด: NOT NULL, REFERENCES appointments(id) CASCADE      ║
║   Relationship: Many-to-One → Appointments                     ║
║                                                                 ║
║ - user_id: INTEGER «FK»                                        ║
║   อธิบาย: รหัสผู้ใช้ที่เขียนความคิดเห็น                        ║
║   ข้อจำกัด: NOT NULL, REFERENCES users(id) ON DELETE CASCADE   ║
║   Relationship: Many-to-One → Users                            ║
║                                                                 ║
║ - created_at: TIMESTAMP                                        ║
║   อธิบาย: วันเวลาที่สร้างความคิดเห็น                           ║
║   ค่าเริ่มต้น: CURRENT_TIMESTAMP                                ║
╚════════════════════════════════════════════════════════════════╝
```

### 🎮 **Methods**

```
╔════════════════════════════════════════════════════════════════════════════╗
║ + getComments(appointmentId: Integer): Comment[]                          ║
║   Embedded in: GET /api/appointments/:id                                   ║
║   Query: SELECT c.*, u.first_name, u.last_name                             ║
║          FROM comments c                                                   ║
║          JOIN users u ON c.user_id = u.id                                  ║
║          WHERE c.appointment_id = $1                                       ║
║          ORDER BY c.created_at ASC                                         ║
║   Returns: Array<Comment> พร้อมข้อมูล user                                 ║
║   อธิบาย: ดึงความคิดเห็นทั้งหมดของนัดหมาย (เรียงเก่า→ใหม่)                ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## 6️⃣ **Email Service**

```
╔════════════════════════════════════════════════════════════════════════════╗
║                          «service»                                         ║
║                         EmailService                                       ║
║                  /backend/services/emailService.js                         ║
╠════════════════════════════════════════════════════════════════════════════╣
║ METHODS (พฤติกรรม)                                                        ║
╠════════════════════════════════════════════════════════════════════════════╣
║ + sendAppointmentCreatedEmail(appointment: Object, recipient: User):      ║
║                                Boolean                                     ║
║   Parameters:                                                              ║
║     - appointment: Appointment object                                      ║
║       {id, title, date, time, location, notes}                             ║
║     - recipient: User object {email, first_name, last_name}                ║
║   Returns: Promise<Boolean>                                                ║
║     - true: ส่งสำเร็จ                                                      ║
║     - false: ส่งล้มเหลว                                                    ║
║   Email Template:                                                          ║
║     - Subject: "🔔 มีนัดหมายใหม่"                                          ║
║     - Body: HTML with appointment details                                  ║
║   SMTP: Gmail (smtp.gmail.com:587)                                         ║
║   Execution: Background (non-blocking)                                     ║
║   Error Handling: Catch and log, ไม่ throw error                           ║
║   อธิบาย: ส่งอีเมลแจ้งเตือนนัดหมายใหม่                                     ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + sendAppointmentConfirmedEmail(appointment: Object, recipient: User):    ║
║                                  Boolean                                   ║
║   Subject: "✅ นัดหมายได้รับการยืนยันแล้ว"                                  ║
║   อธิบาย: ส่งอีเมลยืนยันนัดหมาย                                            ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + sendAppointmentRejectedEmail(appointment: Object, recipient: User):     ║
║                                 Boolean                                    ║
║   Subject: "❌ นัดหมายถูกปฏิเสธ"                                            ║
║   อธิบาย: ส่งอีเมลแจ้งการปฏิเสธนัดหมาย                                     ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + sendAppointmentUpdatedEmail(appointment: Object, recipient: User):      ║
║                                Boolean                                     ║
║   Subject: "🔄 มีการแก้ไขนัดหมาย"                                          ║
║   Content: รายละเอียดที่เปลี่ยนแปลง + ขอให้ยืนยัน                          ║
║   อธิบาย: ส่งอีเมลแจ้งการแก้ไขนัดหมาย (ต้องยืนยัน)                        ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + sendAppointmentCancelledEmail(appointment: Object, recipient: User):    ║
║                                  Boolean                                   ║
║   Subject: "🚫 นัดหมายถูกยกเลิก"                                           ║
║   อธิบาย: ส่งอีเมลแจ้งการยกเลิกนัดหมาย                                     ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + sendAppointmentReminderEmail(appointment: Object, recipient: User):     ║
║                                 Boolean                                    ║
║   Subject: "⏰ การแจ้งเตือนนัดหมาย"                                         ║
║   อธิบาย: ส่งอีเมลเตือนก่อนนัดหมาย (ยังไม่ได้ implement)                  ║
║                                                                             ║
║ ─────────────────────────────────────────────────────────────────────────║
║ TECHNICAL DETAILS                                                          ║
║ ─────────────────────────────────────────────────────────────────────────║
║ Transport: nodemailer                                                      ║
║ Protocol: SMTP over TLS                                                    ║
║ Server: smtp.gmail.com:587                                                 ║
║ Auth: OAuth2 or App Password                                               ║
║ Timeout: Default (no custom timeout)                                       ║
║ Retry: ไม่มี (แนะนำให้เพิ่มใน production)                                  ║
║ Queue: ไม่มี (ใช้ Promise.then() แทน)                                      ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## 7️⃣ **Middleware (Security Layer)**

```
╔════════════════════════════════════════════════════════════════════════════╗
║                          «middleware»                                      ║
║                      Authentication & Authorization                        ║
║                    /backend/middleware/auth.js                             ║
╠════════════════════════════════════════════════════════════════════════════╣
║ + authenticateToken(req, res, next): void                                  ║
║   Purpose: ตรวจสอบและยืนยัน JWT token                                      ║
║   Process:                                                                 ║
║     1. Extract token from Authorization header                             ║
║        Format: "Bearer <token>"                                            ║
║     2. Verify token with JWT_SECRET                                        ║
║        Library: jsonwebtoken                                               ║
║     3. Decode payload: {userId, role}                                      ║
║     4. Query user from database:                                           ║
║        SELECT * FROM users WHERE id = userId                               ║
║     5. Attach user to req.user                                             ║
║     6. Call next()                                                         ║
║   Error Handling:                                                          ║
║     - 401: ไม่มี token                                                     ║
║     - 403: Token ไม่ถูกต้องหรือหมดอายุ                                     ║
║     - 401: User ไม่พบในฐานข้อมูล                                           ║
║   อธิบาย: Middleware สำหรับตรวจสอบการ login ทุก protected routes          ║
║   ─────────────────────────────────────────────────────────────────────   ║
║                                                                             ║
║ + requireRole(roles: String[]): Middleware                                 ║
║   Purpose: ตรวจสอบสิทธิ์การเข้าถึงตาม role                                 ║
║   Parameters:                                                              ║
║     - roles: Array<String> - ['student', 'advisor']                        ║
║   Process:                                                                 ║
║     1. ตรวจสอบว่ามี req.user หรือไม่                                       ║
║     2. เปรียบเทียบ req.user.role กับ roles array                            ║
║     3. ถ้าตรง → call next()                                                 ║
║     4. ถ้าไม่ตรง → return 403 Forbidden                                     ║
║   Error Handling:                                                          ║
║     - 401: ไม่มี authentication                                            ║
║     - 403: Role ไม่ตรงกับที่กำหนด                                          ║
║   Usage Example:                                                           ║
║     router.get('/', authenticateToken, requireRole(['advisor']), ...)      ║
║   อธิบาย: Middleware สำหรับจำกัดการเข้าถึงตาม role                         ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## 8️⃣ **Data Flow Diagram**

### **Complete Request-Response Flow**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  EXAMPLE: Student Creates Appointment                   │
└─────────────────────────────────────────────────────────────────────────┘

1️⃣ CLIENT REQUEST
   Frontend: appointmentAPI.createAppointment(data)
   ↓
   HTTP POST /api/appointments
   Headers: {Authorization: "Bearer <JWT>"}
   Body: {
     title: "ปรึกษาโครงงาน",
     date: "2025-10-15",
     time: "14:00",
     location: "ห้อง 301",
     notes: "เตรียม slides",
     projectId: 1
   }

2️⃣ MIDDLEWARE LAYER
   authenticateToken(req, res, next)
   ├─ Extract JWT from header
   ├─ Verify signature
   ├─ Query: SELECT * FROM users WHERE id = decodedUserId
   ├─ Attach req.user = {id, firstName, lastName, role, ...}
   └─ next()

3️⃣ CONTROLLER LAYER
   AppointmentsController.createAppointment()
   
   a) Validate Input
      ✓ title, date, time, location, projectId (required)
   
   b) Get Project
      Query: SELECT * FROM projects WHERE id = 1
      Result: {id: 1, name: "โปรเจค A", advisor_id: 10}
   
   c) Determine IDs
      req.user.role === 'student'
      → finalAdvisorId = 10 (from project)
      → finalStudentId = req.user.id (5)
      → finalProjectId = 1
   
   d) Insert Appointment (50ms)
      Query: INSERT INTO appointments
             (title, date, time, location, notes, student_id, advisor_id, project_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *
      Result: appointment = {id: 100, status: 'pending', ...}
   
   e) Insert Notification (20ms)
      Query: INSERT INTO notifications
             (user_id, type, title, message, appointment_id)
             VALUES (10, 'appointment_request', '...', '...', 100)
   
   f) Send Email (Background - Non-blocking, 0ms wait)
      pool.query('SELECT * FROM users WHERE id = 10')
        .then(advisorResult => {
          emailService.sendAppointmentCreatedEmail(appointment, advisor)
            .catch(err => console.error('Email error:', err));
        });
      
      ⚡ ไม่รอให้ส่งเสร็จ - ทำงานในพื้นหลัง

4️⃣ RESPONSE TO CLIENT
   Status: 201 Created
   Body: {
     success: true,
     data: {
       id: 100,
       title: "ปรึกษาโครงงาน",
       date: "2025-10-15",
       time: "14:00",
       location: "ห้อง 301",
       notes: "เตรียม slides",
       status: "pending",
       studentId: 5,
       advisorId: 10,
       projectId: 1,
       createdAt: "2025-10-09T14:00:00Z",
       updatedAt: "2025-10-09T14:00:00Z"
     }
   }
   
   ⚡ Total Time: ~70-100ms (เร็วมาก!)

5️⃣ BACKGROUND TASKS (Async)
   → Email sending (1-2 seconds later)
   → Notification appears in advisor's feed immediately
```

---

## 🔄 **State Machine: Appointment Status**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    APPOINTMENT STATUS LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────────────┘

[NEW]
  │
  └─→ pending (สร้างใหม่)
       │
       ├─→ confirmed (ยืนยันโดยผู้รับ)
       │    │
       │    ├─→ pending_student_confirmation (อาจารย์แก้ไข)
       │    │    │
       │    │    ├─→ confirmed (นักศึกษายืนยัน)
       │    │    └─→ rejected (นักศึกษาปฏิเสธ)
       │    │
       │    ├─→ pending_advisor_confirmation (นักศึกษาแก้ไข)
       │    │    │
       │    │    ├─→ confirmed (อาจารย์ยืนยัน)
       │    │    └─→ rejected (อาจารย์ปฏิเสธ)
       │    │
       │    ├─→ completed (มาตามนัด - by advisor)
       │    ├─→ failed (ไม่มาตามนัด - by advisor)
       │    └─→ cancelled (ยกเลิก)
       │
       ├─→ rejected (ปฏิเสธโดยผู้รับ) [END]
       ├─→ cancelled (ยกเลิกโดยผู้สร้าง) [END]
       └─→ no_response (หมดเวลา - auto) [END]

FINAL STATES: rejected, cancelled, no_response, completed, failed
```

---

## 📊 **Method Summary Table**

| Controller | Total Methods | Create | Read | Update | Delete | Custom |
|------------|---------------|--------|------|--------|--------|--------|
| **Users** | 3 | 1 | 1 | 1 | 0 | 0 |
| **Auth** | 3 | 0 | 1 | 2 | 0 | 0 |
| **Projects** | 6 | 1 | 2 | 1 | 1 | 2 |
| **Appointments** | 11 | 1 | 2 | 7 | 1 | 1 |
| **Notifications** | 3 | 0 | 1 | 2 | 0 | 0 |
| **Comments** | 1 | 0 | 1 | 0 | 0 | 0 |
| **Import** | 1 | 1 | 0 | 0 | 0 | 0 |
| **EmailService** | 6 | 0 | 0 | 0 | 0 | 6 |
| **Total** | **34** | 4 | 8 | 13 | 2 | 9 |

---

**[สิ้นสุด Part 2]**


