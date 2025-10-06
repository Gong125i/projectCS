# Class Diagram - User-Database System (UML Format)

## 📋 ภาพรวมระบบ

Class Diagram นี้แสดงโครงสร้างของระบบจัดการนัดหมายที่เน้นความสัมพันธ์ระหว่าง User และ Database โดยใช้ UML notation มาตรฐาน

---

## 🎨 Class Diagram (UML Format)

### **1. Enumeration Classes**

#### RoleEnum
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              <<enumeration>>                                  │
│                              RoleEnum                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + student                   [นักศึกษา]                                         │
│ + advisor                   [อาจารย์ที่ปรึกษา]                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**คำอธิบาย RoleEnum:**
- **วัตถุประสงค์**: กำหนดบทบาทของผู้ใช้ในระบบ
- **หน้าที่หลัก**: แยกประเภทผู้ใช้เพื่อการจัดการสิทธิ์และการแสดงผล

#### StatusEnum
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              <<enumeration>>                                  │
│                              StatusEnum                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + pending                       [รอดำเนินการ]                                  │
│ + confirmed                     [ยืนยันแล้ว]                                   │
│ + rejected                      [ปฏิเสธ]                                       │
│ + cancelled                     [ยกเลิก]                                       │
│ + completed                     [เสร็จสิ้น]                                     │
│ + failed                        [ล้มเหลว]                                      │
│ + pending_student_confirmation  [รอยืนยันจากนักศึกษา]                          │
│ + pending_advisor_confirmation  [รอยืนยันจากอาจารย์]                           │
│ + no_response                   [ไม่มีการตอบสนอง]                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**คำอธิบาย StatusEnum:**
- **วัตถุประสงค์**: กำหนดสถานะของการนัดหมาย
- **หน้าที่หลัก**: ติดตามสถานะการนัดหมายเพื่อการจัดการและแสดงผล

#### NotificationTypeEnum
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              <<enumeration>>                                  │
│                           NotificationTypeEnum                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + appointment_reminder         [แจ้งเตือนการนัดหมาย]                           │
│ + appointment_request          [ขอการนัดหมาย]                                  │
│ + appointment_confirmed        [ยืนยันการนัดหมาย]                              │
│ + appointment_rejected         [ปฏิเสธการนัดหมาย]                              │
│ + project_invitation           [เชิญเข้าร่วมโปรเจค]                            │
│ + system_announcement          [ประกาศระบบ]                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**คำอธิบาย NotificationTypeEnum:**
- **วัตถุประสงค์**: กำหนดประเภทของการแจ้งเตือน
- **หน้าที่หลัก**: แยกประเภทการแจ้งเตือนเพื่อการจัดการและการแสดงผล

#### ImportTypeEnum
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              <<enumeration>>                                  │
│                            ImportTypeEnum                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + users                       [ข้อมูลผู้ใช้]                                   │
│ + projects                    [ข้อมูลโปรเจค]                                  │
│ + appointments                [ข้อมูลการนัดหมาย]                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**คำอธิบาย ImportTypeEnum:**
- **วัตถุประสงค์**: กำหนดประเภทของการนำเข้าข้อมูล
- **หน้าที่หลัก**: แยกประเภทการนำเข้าข้อมูลเพื่อการจัดการและตรวจสอบ

#### EmailTemplateTypeEnum
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              <<enumeration>>                                  │
│                         EmailTemplateTypeEnum                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + appointment_created          [สร้างการนัดหมาย]                              │
│ + appointment_confirmed        [ยืนยันการนัดหมาย]                              │
│ + appointment_rejected         [ปฏิเสธการนัดหมาย]                              │
│ + appointment_updated          [อัปเดตการนัดหมาย]                              │
│ + appointment_reminder         [แจ้งเตือนการนัดหมาย]                           │
│ + appointment_cancelled        [ยกเลิกการนัดหมาย]                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**คำอธิบาย EmailTemplateTypeEnum:**
- **วัตถุประสงค์**: กำหนดประเภทของเทมเพลตอีเมล
- **หน้าที่หลัก**: แยกประเภทเทมเพลตอีเมลเพื่อการจัดการและการใช้งาน

---

### **2. Entity Classes**

#### User
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   User                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - id: String                                                                   │
│ - studentId: String                                                            │
│ - firstName: String                                                            │
│ - lastName: String                                                             │
│ - phone: String                                                                │
│ - email: String                                                                │
│ - office: String                                                               │
│ - role: RoleEnum                                                               │
│ - passwordHash: String                                                         │
│ - createdAt: Date                                                              │
│ - updatedAt: Date                                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + getFullName(): String                                                        │
│ + isAdvisor(): Boolean                                                         │
│ + isStudent(): Boolean                                                         │
│ + authenticate(password: String): Boolean                                      │
│ + updateProfile(data: User): void                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `id: String` - Primary Key - รหัสประจำตัวผู้ใช้
- `studentId: String` - รหัสนักศึกษา/อาจารย์ (ไม่บังคับ)
- `firstName: String` - ชื่อจริง
- `lastName: String` - นามสกุล
- `phone: String` - เบอร์โทรศัพท์ (Unique)
- `email: String` - อีเมล (ไม่บังคับ)
- `office: String` - ห้องทำงาน (สำหรับอาจารย์)
- `role: RoleEnum` - บทบาท: student หรือ advisor
- `passwordHash: String` - รหัสผ่านที่เข้ารหัสแล้ว
- `createdAt: Date` - วันที่สร้างบัญชี
- `updatedAt: Date` - วันที่อัปเดตล่าสุด

**Methods:**
- `getFullName(): String` - คืนค่า ชื่อ-นามสกุล รวมกัน
  - Params: ไม่มี
  - Returns: String - ชื่อเต็มในรูปแบบ "firstName lastName"
  - Example: "สมชาย ใจดี"
- `isAdvisor(): Boolean` - ตรวจสอบว่าเป็นอาจารย์หรือไม่
  - Params: ไม่มี
  - Returns: Boolean - true ถ้าเป็นอาจารย์, false ถ้าไม่ใช่
  - Example: true (ถ้า role = "advisor")
- `isStudent(): Boolean` - ตรวจสอบว่าเป็นนักศึกษาหรือไม่
  - Params: ไม่มี
  - Returns: Boolean - true ถ้าเป็นนักศึกษา, false ถ้าไม่ใช่
  - Example: true (ถ้า role = "student")
- `authenticate(password: String): Boolean` - ตรวจสอบรหัสผ่าน
  - Params: password (String) - รหัสผ่านที่ต้องการตรวจสอบ
  - Returns: Boolean - true ถ้ารหัสผ่านถูกต้อง, false ถ้าไม่ถูกต้อง
  - Example: authenticate("123456") → true
- `updateProfile(data: User): void` - อัปเดตข้อมูลโปรไฟล์
  - Params: data (User) - ข้อมูลผู้ใช้ที่ต้องการอัปเดต
  - Returns: void - ไม่คืนค่า
  - Example: updateProfile({firstName: "สมชาย", lastName: "ใจดี"})

**คำอธิบาย Class User:**
- **วัตถุประสงค์**: เก็บข้อมูลผู้ใช้ในระบบ ทั้งนักศึกษาและอาจารย์
- **หน้าที่หลัก**: จัดการข้อมูลส่วนตัว การยืนยันตัวตน และสิทธิ์การเข้าถึง
- **ความสัมพันธ์**: เป็นศูนย์กลางของระบบ เชื่อมโยงกับ Entity อื่นๆ เกือบทั้งหมด

#### Project
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 Project                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - id: String                                                                   │
│ - name: String                                                                 │
│ - advisorId: String                                                            │
│ - academicYear: String                                                         │
│ - semester: String                                                             │
│ - archived: Boolean                                                            │
│ - archivedAt: Date                                                             │
│ - createdAt: Date                                                              │
│ - updatedAt: Date                                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + addStudent(studentId: String): void                                          │
│ + removeStudent(studentId: String): void                                       │
│ + getStudentCount(): Number                                                    │
│ + archive(): void                                                              │
│ + isArchived(): Boolean                                                        │
│ + canBeArchived(): Boolean                                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `id: String` - Primary Key - รหัสโปรเจค
- `name: String` - ชื่อโปรเจค
- `advisorId: String` - Foreign Key - รหัสอาจารย์ที่ปรึกษา
- `academicYear: String` - ปีการศึกษา (เช่น 2567)
- `semester: String` - ภาคเรียน (1 หรือ 2)
- `archived: Boolean` - สถานะการจัดเก็บ (true/false)
- `archivedAt: Date` - วันที่จัดเก็บโปรเจค
- `createdAt: Date` - วันที่สร้างโปรเจค
- `updatedAt: Date` - วันที่อัปเดตล่าสุด

**Methods:**
- `addStudent(studentId: String): void` - เพิ่มนักศึกษาเข้าร่วมโปรเจค
  - Params: studentId (String) - รหัสนักศึกษาที่ต้องการเพิ่ม
  - Returns: void - ไม่คืนค่า
  - Example: addStudent("STU001")
- `removeStudent(studentId: String): void` - ลบนักศึกษาออกจากโปรเจค
  - Params: studentId (String) - รหัสนักศึกษาที่ต้องการลบ
  - Returns: void - ไม่คืนค่า
  - Example: removeStudent("STU001")
- `getStudentCount(): Number` - นับจำนวนนักศึกษาในโปรเจค
  - Params: ไม่มี
  - Returns: Number - จำนวนนักศึกษาในโปรเจค
  - Example: 3
- `archive(): void` - จัดเก็บโปรเจคเมื่อเสร็จสิ้น
  - Params: ไม่มี
  - Returns: void - ไม่คืนค่า
  - Example: archive() - เปลี่ยน archived = true, archivedAt = now()
- `isArchived(): Boolean` - ตรวจสอบว่าโปรเจคถูกจัดเก็บแล้ว
  - Params: ไม่มี
  - Returns: Boolean - true ถ้าถูกจัดเก็บแล้ว, false ถ้ายังไม่ถูกจัดเก็บ
  - Example: true (ถ้า archived = true)
- `canBeArchived(): Boolean` - ตรวจสอบว่าสามารถจัดเก็บได้หรือไม่
  - Params: ไม่มี
  - Returns: Boolean - true ถ้าสามารถจัดเก็บได้, false ถ้าไม่สามารถ
  - Example: true (ถ้าไม่มีนัดหมายค้างอยู่)

**คำอธิบาย Class Project:**
- **วัตถุประสงค์**: เก็บข้อมูลโปรเจคที่อาจารย์สร้างและนักศึกษาเข้าร่วม
- **หน้าที่หลัก**: จัดการโปรเจค การมอบหมายงาน และการจัดเก็บเมื่อเสร็จสิ้น
- **ความสัมพันธ์**: เชื่อมโยงกับ User (advisor/students), Appointment, และ ArchivedProject

#### Appointment
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               Appointment                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - id: String                                                                   │
│ - title: String                                                                │
│ - date: Date                                                                   │
│ - time: String                                                                 │
│ - location: String                                                             │
│ - notes: String                                                                │
│ - status: StatusEnum                                                           │
│ - studentId: String                                                            │
│ - advisorId: String                                                            │
│ - projectId: String                                                            │
│ - createdAt: Date                                                              │
│ - updatedAt: Date                                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + confirm(): void                                                              │
│ + reject(): void                                                               │
│ + cancel(): void                                                               │
│ + complete(): void                                                              │
│ + isExpired(): Boolean                                                         │
│ + canBeModified(): Boolean                                                     │
│ + getStatusDisplay(): String                                                   │
│ + getDateTimeString(): String                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `id: String` - Primary Key - รหัสการนัดหมาย
- `title: String` - หัวข้อการนัดหมาย (ไม่บังคับ)
- `date: Date` - วันที่นัดหมาย
- `time: String` - เวลานัดหมาย (รูปแบบ HH:MM)
- `location: String` - สถานที่นัดหมาย
- `notes: String` - หมายเหตุ (ไม่บังคับ)
- `status: StatusEnum` - สถานะการนัดหมาย
- `studentId: String` - Foreign Key - รหัสนักศึกษา
- `advisorId: String` - Foreign Key - รหัสอาจารย์
- `projectId: String` - Foreign Key - รหัสโปรเจค (ไม่บังคับ)
- `createdAt: Date` - วันที่สร้างการนัดหมาย
- `updatedAt: Date` - วันที่อัปเดตล่าสุด

**Methods:**
- `confirm(): void` - ยืนยันการนัดหมาย
  - Params: ไม่มี
  - Returns: void - ไม่คืนค่า
  - Example: confirm() - เปลี่ยน status = "confirmed"
- `reject(): void` - ปฏิเสธการนัดหมาย
  - Params: ไม่มี
  - Returns: void - ไม่คืนค่า
  - Example: reject() - เปลี่ยน status = "rejected"
- `cancel(): void` - ยกเลิกการนัดหมาย
  - Params: ไม่มี
  - Returns: void - ไม่คืนค่า
  - Example: cancel() - เปลี่ยน status = "cancelled"
- `complete(): void` - เสร็จสิ้นการนัดหมาย
  - Params: ไม่มี
  - Returns: void - ไม่คืนค่า
  - Example: complete() - เปลี่ยน status = "completed"
- `isExpired(): Boolean` - ตรวจสอบว่าเกินกำหนดแล้วหรือไม่
  - Params: ไม่มี
  - Returns: Boolean - true ถ้าเกินกำหนด, false ถ้ายังไม่เกินกำหนด
  - Example: true (ถ้า date < today)
- `canBeModified(): Boolean` - ตรวจสอบว่าสามารถแก้ไขได้หรือไม่
  - Params: ไม่มี
  - Returns: Boolean - true ถ้าแก้ไขได้, false ถ้าแก้ไขไม่ได้
  - Example: false (ถ้า status = "completed")
- `getStatusDisplay(): String` - คืนค่าสถานะในรูปแบบที่อ่านได้
  - Params: ไม่มี
  - Returns: String - สถานะในรูปแบบที่อ่านได้
  - Example: "ยืนยันแล้ว"
- `getDateTimeString(): String` - คืนค่าวันที่และเวลาในรูปแบบที่อ่านได้
  - Params: ไม่มี
  - Returns: String - วันที่และเวลาในรูปแบบที่อ่านได้
  - Example: "15 มกราคม 2567 เวลา 10:00"

**คำอธิบาย Class Appointment:**
- **วัตถุประสงค์**: เก็บข้อมูลการนัดหมายระหว่างนักศึกษาและอาจารย์
- **หน้าที่หลัก**: จัดการการนัดหมาย ติดตามสถานะ และควบคุมการเปลี่ยนแปลง
- **ความสัมพันธ์**: เชื่อมโยงกับ User (student/advisor), Project, Comment, และ Notification

#### Comment
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                Comment                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - id: String                                                                   │
│ - content: String                                                              │
│ - appointmentId: String                                                        │
│ - userId: String                                                               │
│ - createdAt: Date                                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + getFormattedDate(): String                                                   │
│ + getAuthorName(): String                                                      │
│ + canBeEdited(userId: String): Boolean                                         │
│ + updateContent(content: String): void                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `id: String` - Primary Key - รหัสความคิดเห็น
- `content: String` - เนื้อหาความคิดเห็น
- `appointmentId: String` - Foreign Key - รหัสการนัดหมาย
- `userId: String` - Foreign Key - รหัสผู้เขียนความคิดเห็น
- `createdAt: Date` - วันที่เขียนความคิดเห็น

**Methods:**
- `getFormattedDate(): String` - คืนค่าวันที่ในรูปแบบที่อ่านได้
  - Params: ไม่มี
  - Returns: String - วันที่ในรูปแบบที่อ่านได้
  - Example: "15 มกราคม 2567 เวลา 14:30"
- `getAuthorName(): String` - คืนค่าชื่อผู้เขียนความคิดเห็น
  - Params: ไม่มี
  - Returns: String - ชื่อผู้เขียนความคิดเห็น
  - Example: "สมชาย ใจดี"
- `canBeEdited(userId: String): Boolean` - ตรวจสอบว่าสามารถแก้ไขได้หรือไม่
  - Params: userId (String) - รหัสผู้ใช้ที่ต้องการตรวจสอบ
  - Returns: Boolean - true ถ้าแก้ไขได้, false ถ้าแก้ไขไม่ได้
  - Example: canBeEdited("USER001") → true (ถ้าเป็นเจ้าของความคิดเห็น)
- `updateContent(content: String): void` - อัปเดตเนื้อหาความคิดเห็น
  - Params: content (String) - เนื้อหาใหม่ที่ต้องการอัปเดต
  - Returns: void - ไม่คืนค่า
  - Example: updateContent("ความคิดเห็นใหม่")

**คำอธิบาย Class Comment:**
- **วัตถุประสงค์**: เก็บความคิดเห็นเกี่ยวกับการนัดหมาย
- **หน้าที่หลัก**: จัดการความคิดเห็น การแสดงผล และการแก้ไข
- **ความสัมพันธ์**: เชื่อมโยงกับ Appointment และ User (ผู้เขียนความคิดเห็น)

#### Notification
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Notification                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - id: String                                                                   │
│ - userId: String                                                               │
│ - type: NotificationTypeEnum                                                   │
│ - title: String                                                                │
│ - message: String                                                              │
│ - isRead: Boolean                                                              │
│ - appointmentId: String                                                        │
│ - createdAt: Date                                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + markAsRead(): void                                                           │
│ + markAsUnread(): void                                                         │
│ + getFormattedDate(): String                                                   │
│ + getTypeDisplay(): String                                                     │
│ + isRecent(): Boolean                                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `id: String` - Primary Key - รหัสการแจ้งเตือน
- `userId: String` - Foreign Key - รหัสผู้รับการแจ้งเตือน
- `type: NotificationTypeEnum` - ประเภทการแจ้งเตือน
- `title: String` - หัวข้อการแจ้งเตือน
- `message: String` - เนื้อหาการแจ้งเตือน
- `isRead: Boolean` - สถานะการอ่าน (true/false)
- `appointmentId: String` - Foreign Key - รหัสการนัดหมาย (ไม่บังคับ)
- `createdAt: Date` - วันที่สร้างการแจ้งเตือน

**Methods:**
- `markAsRead(): void` - ทำเครื่องหมายว่าอ่านแล้ว
  - Params: ไม่มี
  - Returns: void - ไม่คืนค่า
  - Example: markAsRead() - เปลี่ยน isRead = true
- `markAsUnread(): void` - ทำเครื่องหมายว่ายังไม่อ่าน
  - Params: ไม่มี
  - Returns: void - ไม่คืนค่า
  - Example: markAsUnread() - เปลี่ยน isRead = false
- `getFormattedDate(): String` - คืนค่าวันที่ในรูปแบบที่อ่านได้
  - Params: ไม่มี
  - Returns: String - วันที่ในรูปแบบที่อ่านได้
  - Example: "15 มกราคม 2567 เวลา 09:15"
- `getTypeDisplay(): String` - คืนค่าประเภทในรูปแบบที่อ่านได้
  - Params: ไม่มี
  - Returns: String - ประเภทการแจ้งเตือนในรูปแบบที่อ่านได้
  - Example: "แจ้งเตือนการนัดหมาย"
- `isRecent(): Boolean` - ตรวจสอบว่าเป็นการแจ้งเตือนใหม่หรือไม่
  - Params: ไม่มี
  - Returns: Boolean - true ถ้าเป็นการแจ้งเตือนใหม่, false ถ้าไม่ใช่
  - Example: true (ถ้า createdAt < 24 ชั่วโมงที่แล้ว)

**คำอธิบาย Class Notification:**
- **วัตถุประสงค์**: เก็บการแจ้งเตือนต่างๆ ในระบบ
- **หน้าที่หลัก**: จัดการการแจ้งเตือน การติดตามสถานะการอ่าน และการแสดงผล
- **ความสัมพันธ์**: เชื่อมโยงกับ User (ผู้รับการแจ้งเตือน) และ Appointment (ไม่บังคับ)

#### ArchivedProject
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ArchivedProject                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - id: String                                                                   │
│ - projectId: String                                                            │
│ - projectName: String                                                          │
│ - description: String                                                          │
│ - advisorName: String                                                          │
│ - studentNames: String[]                                                       │
│ - academicYear: String                                                         │
│ - semester: String                                                             │
│ - completionDate: Date                                                         │
│ - projectType: String                                                          │
│ - totalAppointments: Number                                                    │
│ - completedAppointments: Number                                                │
│ - successRate: String                                                          │
│ - attendanceRate: String                                                       │
│ - appointmentDetails: Object[]                                                 │
│ - archivedAt: Date                                                             │
│ - createdAt: Date                                                              │
│ - updatedAt: Date                                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + getCompletionStatus(): String                                                │
│ + getSuccessRateDisplay(): String                                              │
│ + getAttendanceRateDisplay(): String                                           │
│ + getStudentNamesDisplay(): String                                             │
│ + getProjectTypeDisplay(): String                                              │
│ + getFormattedCompletionDate(): String                                         │
│ + getStatistics(): Object                                                      │
│ + canBeRestored(): Boolean                                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `id: String` - Primary Key - รหัสโปรเจคที่จัดเก็บ
- `projectId: String` - Foreign Key - รหัสโปรเจคเดิม
- `projectName: String` - ชื่อโปรเจค
- `description: String` - คำอธิบายโปรเจค
- `advisorName: String` - ชื่ออาจารย์ที่ปรึกษา
- `studentNames: String[]` - รายชื่อนักศึกษา
- `academicYear: String` - ปีการศึกษา
- `semester: String` - ภาคเรียน
- `completionDate: Date` - วันที่เสร็จสิ้นโปรเจค
- `projectType: String` - ประเภทโปรเจค
- `totalAppointments: Number` - จำนวนการนัดหมายทั้งหมด
- `completedAppointments: Number` - จำนวนการนัดหมายที่เสร็จสิ้น
- `successRate: String` - อัตราความสำเร็จ
- `attendanceRate: String` - อัตราการเข้าร่วม
- `appointmentDetails: Object[]` - รายละเอียดการนัดหมาย
- `archivedAt: Date` - วันที่จัดเก็บ
- `createdAt: Date` - วันที่สร้าง
- `updatedAt: Date` - วันที่อัปเดตล่าสุด

**Methods:**
- `getCompletionStatus(): String` - คืนค่าสถานะการเสร็จสิ้น
  - Params: ไม่มี
  - Returns: String - สถานะการเสร็จสิ้นในรูปแบบที่อ่านได้
  - Example: "เสร็จสิ้น 100%"
- `getSuccessRateDisplay(): String` - คืนค่าอัตราความสำเร็จในรูปแบบที่อ่านได้
  - Params: ไม่มี
  - Returns: String - อัตราความสำเร็จในรูปแบบที่อ่านได้
  - Example: "85%"
- `getAttendanceRateDisplay(): String` - คืนค่าอัตราการเข้าร่วมในรูปแบบที่อ่านได้
  - Params: ไม่มี
  - Returns: String - อัตราการเข้าร่วมในรูปแบบที่อ่านได้
  - Example: "92%"
- `getStudentNamesDisplay(): String` - คืนค่ารายชื่อนักศึกษาในรูปแบบที่อ่านได้
  - Params: ไม่มี
  - Returns: String - รายชื่อนักศึกษาในรูปแบบที่อ่านได้
  - Example: "สมชาย ใจดี, สมหญิง รักดี"
- `getProjectTypeDisplay(): String` - คืนค่าประเภทโปรเจคในรูปแบบที่อ่านได้
  - Params: ไม่มี
  - Returns: String - ประเภทโปรเจคในรูปแบบที่อ่านได้
  - Example: "โปรเจควิทยานิพนธ์"
- `getFormattedCompletionDate(): String` - คืนค่าวันที่เสร็จสิ้นในรูปแบบที่อ่านได้
  - Params: ไม่มี
  - Returns: String - วันที่เสร็จสิ้นในรูปแบบที่อ่านได้
  - Example: "15 มกราคม 2567"
- `getStatistics(): Object` - คืนค่าสถิติทั้งหมด
  - Params: ไม่มี
  - Returns: Object - ข้อมูลสถิติทั้งหมด
  - Example: {totalAppointments: 10, completedAppointments: 8, successRate: "80%"}
- `canBeRestored(): Boolean` - ตรวจสอบว่าสามารถกู้คืนได้หรือไม่
  - Params: ไม่มี
  - Returns: Boolean - true ถ้าสามารถกู้คืนได้, false ถ้าไม่สามารถ
  - Example: false (ถ้าโปรเจคถูกกู้คืนแล้ว)

**คำอธิบาย Class ArchivedProject:**
- **วัตถุประสงค์**: เก็บข้อมูลโปรเจคที่เสร็จสิ้นแล้วและถูกจัดเก็บ
- **หน้าที่หลัก**: จัดการข้อมูลโปรเจคที่เสร็จสิ้น การคำนวณสถิติ และการแสดงผล
- **ความสัมพันธ์**: เชื่อมโยงกับ Project (1:1) และเก็บข้อมูลสถิติการนัดหมาย

#### ProjectStudent
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ProjectStudent                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - projectId: String                                                            │
│ - studentId: String                                                            │
│ - createdAt: Date                                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + getProject(): Project                                                        │
│ + getStudent(): User                                                           │
│ + getJoinDate(): Date                                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `projectId: String` - Foreign Key - รหัสโปรเจค
- `studentId: String` - Foreign Key - รหัสนักศึกษา
- `createdAt: Date` - วันที่เข้าร่วมโปรเจค

**Methods:**
- `getProject(): Project` - คืนค่าโปรเจคที่เกี่ยวข้อง
  - Params: ไม่มี
  - Returns: Project - ข้อมูลโปรเจคที่เกี่ยวข้อง
  - Example: Project{id: "PROJ001", name: "โปรเจค A"}
- `getStudent(): User` - คืนค่านักศึกษาที่เกี่ยวข้อง
  - Params: ไม่มี
  - Returns: User - ข้อมูลนักศึกษาที่เกี่ยวข้อง
  - Example: User{id: "STU001", firstName: "สมชาย", lastName: "ใจดี"}
- `getJoinDate(): Date` - คืนค่าวันที่เข้าร่วม
  - Params: ไม่มี
  - Returns: Date - วันที่เข้าร่วมโปรเจค
  - Example: 2024-01-15T10:30:00Z

**คำอธิบาย Class ProjectStudent:**
- **วัตถุประสงค์**: Junction Table สำหรับความสัมพันธ์ Many-to-Many ระหว่าง Project และ User (นักศึกษา)
- **หน้าที่หลัก**: จัดการความสัมพันธ์ระหว่างโปรเจคและนักศึกษา
- **ความสัมพันธ์**: เชื่อมโยงกับ Project และ User (student role)

#### ImportRecord
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ImportRecord                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - id: String                                                                   │
│ - fileName: String                                                             │
│ - importType: ImportTypeEnum                                                   │
│ - totalRecords: Number                                                         │
│ - successCount: Number                                                         │
│ - errorCount: Number                                                           │
│ - errors: String[]                                                             │
│ - importedBy: String                                                           │
│ - createdAt: Date                                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + getSuccessRate(): Number                                                     │
│ + getErrorDetails(): String[]                                                  │
│ + getImportSummary(): Object                                                   │
│ + canBeRetried(): Boolean                                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `id: String` - Primary Key - รหัสบันทึกการนำเข้า
- `fileName: String` - ชื่อไฟล์ที่นำเข้า
- `importType: ImportTypeEnum` - ประเภทการนำเข้า (users/projects/appointments)
- `totalRecords: Number` - จำนวนรายการทั้งหมด
- `successCount: Number` - จำนวนรายการที่สำเร็จ
- `errorCount: Number` - จำนวนรายการที่ผิดพลาด
- `errors: String[]` - รายการข้อผิดพลาด
- `importedBy: String` - Foreign Key - รหัสผู้ทำการนำเข้า
- `createdAt: Date` - วันที่ทำการนำเข้า

**Methods:**
- `getSuccessRate(): Number` - คืนค่าอัตราความสำเร็จ (%)
  - Params: ไม่มี
  - Returns: Number - อัตราความสำเร็จเป็นเปอร์เซ็นต์
  - Example: 85.5 (หมายถึง 85.5%)
- `getErrorDetails(): String[]` - คืนค่ารายละเอียดข้อผิดพลาด
  - Params: ไม่มี
  - Returns: String[] - รายการข้อผิดพลาด
  - Example: ["Email already exists", "Invalid phone number"]
- `getImportSummary(): Object` - คืนค่าสรุปผลการนำเข้า
  - Params: ไม่มี
  - Returns: Object - สรุปผลการนำเข้า
  - Example: {total: 100, success: 85, errors: 15, rate: "85%"}
- `canBeRetried(): Boolean` - ตรวจสอบว่าสามารถลองใหม่ได้หรือไม่
  - Params: ไม่มี
  - Returns: Boolean - true ถ้าสามารถลองใหม่ได้, false ถ้าไม่สามารถ
  - Example: true (ถ้ามีข้อผิดพลาดและยังไม่เกินวันที่กำหนด)

**คำอธิบาย Class ImportRecord:**
- **วัตถุประสงค์**: เก็บบันทึกการนำเข้าข้อมูลจากไฟล์ CSV
- **หน้าที่หลัก**: ติดตามผลการนำเข้าข้อมูล จัดการข้อผิดพลาด และสร้างรายงาน
- **ความสัมพันธ์**: เชื่อมโยงกับ User (ผู้ทำการนำเข้า)

#### EmailTemplate
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            EmailTemplate                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - id: String                                                                   │
│ - templateType: EmailTemplateTypeEnum                                          │
│ - subject: String                                                              │
│ - htmlContent: String                                                          │
│ - textContent: String                                                          │
│ - isActive: Boolean                                                            │
│ - createdAt: Date                                                              │
│ - updatedAt: Date                                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + renderTemplate(data: Object): String                                         │
│ + validateTemplate(): Boolean                                                  │
│ + getPreview(): String                                                         │
│ + activate(): void                                                             │
│ + deactivate(): void                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `id: String` - Primary Key - รหัสเทมเพลตอีเมล
- `templateType: EmailTemplateTypeEnum` - ประเภทเทมเพลต
- `subject: String` - หัวข้ออีเมล
- `htmlContent: String` - เนื้อหาอีเมลรูปแบบ HTML
- `textContent: String` - เนื้อหาอีเมลรูปแบบข้อความ
- `isActive: Boolean` - สถานะการใช้งาน (true/false)
- `createdAt: Date` - วันที่สร้างเทมเพลต
- `updatedAt: Date` - วันที่อัปเดตเทมเพลตล่าสุด

**Methods:**
- `renderTemplate(data: Object): String` - แปลงเทมเพลตด้วยข้อมูลจริง
  - Params: data (Object) - ข้อมูลที่ต้องการใส่ในเทมเพลต
  - Returns: String - เนื้อหาอีเมลที่แปลงแล้ว
  - Example: renderTemplate({studentName: "สมชาย", date: "15 มกราคม"})
- `validateTemplate(): Boolean` - ตรวจสอบความถูกต้องของเทมเพลต
  - Params: ไม่มี
  - Returns: Boolean - true ถ้าเทมเพลตถูกต้อง, false ถ้าไม่ถูกต้อง
  - Example: true (ถ้า HTML syntax ถูกต้อง)
- `getPreview(): String` - คืนค่าตัวอย่างเทมเพลต
  - Params: ไม่มี
  - Returns: String - ตัวอย่างเทมเพลตที่แสดงผล
  - Example: "การนัดหมายของคุณกับ {studentName} กำหนดในวันที่ {date}"
- `activate(): void` - เปิดใช้งานเทมเพลต
  - Params: ไม่มี
  - Returns: void - ไม่คืนค่า
  - Example: activate() - เปลี่ยน isActive = true
- `deactivate(): void` - ปิดใช้งานเทมเพลต
  - Params: ไม่มี
  - Returns: void - ไม่คืนค่า
  - Example: deactivate() - เปลี่ยน isActive = false

**คำอธิบาย Class EmailTemplate:**
- **วัตถุประสงค์**: เก็บเทมเพลตอีเมลสำหรับการแจ้งเตือนต่างๆ
- **หน้าที่หลัก**: จัดการเทมเพลตอีเมล การแปลงข้อมูล และการตรวจสอบความถูกต้อง
- **ความสัมพันธ์**: ใช้โดย EmailService สำหรับส่งอีเมลแจ้งเตือน

---

## 🔗 Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              RELATIONSHIPS                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  User ──1..*──── Project (advisor creates)                                     │
│   │                │                                                           │
│   │                │                                                           │
│   │                └───1──── 0..*── Appointment                               │
│   │                           │                                               │
│   │                           ├───1──── 0..*── Comment                       │
│   │                                                                           │
│   ├───1──── 0..*── Notification                                              │
│   ├───1──── 0..*── ImportRecord                                              │
│   └───0..*──── 0..*── Project (through ProjectStudent)                       │
│                                                                                 │
│  Project ──1──── 0..*── ProjectStudent                                        │
│  Project ──1──── 0..1── ArchivedProject                                       │
│                                                                                 │
│  RoleEnum ──→ User.role                                                        │
│  StatusEnum ──→ Appointment.status                                             │
│  NotificationTypeEnum ──→ Notification.type                                   │
│  ImportTypeEnum ──→ ImportRecord.importType                                    │
│  EmailTemplateTypeEnum ──→ EmailTemplate.templateType                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Entity Summary

### **Entity Classes (9 classes)**
1. **User** - ผู้ใช้ (11 attributes, 5 methods)
2. **Project** - โปรเจค (9 attributes, 6 methods)
3. **Appointment** - การนัดหมาย (11 attributes, 8 methods)
4. **Comment** - ความคิดเห็น (5 attributes, 4 methods)
5. **Notification** - การแจ้งเตือน (8 attributes, 5 methods)
6. **ArchivedProject** - โปรเจคที่จัดเก็บ (18 attributes, 8 methods)
7. **ProjectStudent** - Junction Table (3 attributes, 3 methods)
8. **ImportRecord** - บันทึกการนำเข้าข้อมูล (8 attributes, 4 methods)
9. **EmailTemplate** - เทมเพลตอีเมล (8 attributes, 5 methods)

### **Enumeration Classes (5 classes)**
1. **RoleEnum** - บทบาทผู้ใช้ (student, advisor)
2. **StatusEnum** - สถานะการนัดหมาย (9 สถานะ)
3. **NotificationTypeEnum** - ประเภทการแจ้งเตือน (6 ประเภท)
4. **ImportTypeEnum** - ประเภทการนำเข้าข้อมูล (3 ประเภท)
5. **EmailTemplateTypeEnum** - ประเภทเทมเพลตอีเมล (6 ประเภท)

---

## 🎯 Key Features

### **Data Types**
- **String**: id, name, title, content, email, phone
- **Boolean**: archived, isRead, isActive
- **Date**: createdAt, updatedAt, archivedAt, completionDate
- **Number**: totalRecords, successCount, errorCount, totalAppointments
- **Array**: studentNames[], errors[], appointmentDetails[]
- **Enum**: RoleEnum, StatusEnum, NotificationTypeEnum, ImportTypeEnum, EmailTemplateTypeEnum

### **UML Notation**
- **Visibility**: `-` (private), `+` (public)
- **Relationships**: `1..*` (One-to-Many), `0..*` (Zero-to-Many), `0..1` (Zero-to-One), `*..*` (Many-to-Many)
- **Enumerations**: `<<enumeration>>`
- **Methods**: `methodName(param: Type): ReturnType`

### **Database Tables (9 tables)**
- **users** - ข้อมูลผู้ใช้
- **projects** - ข้อมูลโปรเจค
- **project_students** - ความสัมพันธ์โปรเจค-นักศึกษา
- **appointments** - ข้อมูลการนัดหมาย
- **comments** - ความคิดเห็นการนัดหมาย
- **notifications** - การแจ้งเตือน
- **project_archive** - โปรเจคที่จัดเก็บแล้ว
- **import_records** - บันทึกการนำเข้าข้อมูล
- **email_templates** - เทมเพลตอีเมล

Class Diagram นี้แสดงโครงสร้างของระบบจัดการนัดหมายอย่างครบถ้วน โดยใช้ UML notation มาตรฐานที่สามารถใส่ในรายงานโปรเจคได้
