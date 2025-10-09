# Class Diagram - ระบบจัดการนัดหมาย (UML Format)

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
│ + failed                        [ไม่มาตามนัด]                                   │
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
│ + appointment                    [การนัดหมาย]                                  │
│ + appointment_request            [นัดหมายใหม่]                                  │
│ + appointment_accepted           [นักศึกษาตอบรับนัดหมาย]                        │
│ + appointment_confirmed          [นัดหมายได้รับการยืนยัน]                       │
│ + appointment_rejected           [นัดหมายถูกปฏิเสธ]                             │
│ + appointment_change_confirmed   [ยืนยันการเปลี่ยนแปลง]                        │
│ + appointment_change_rejected    [ปฏิเสธการเปลี่ยนแปลง]                        │
│ + pending                        [รอดำเนินการ]                                  │
│ + confirmed                      [ยืนยันแล้ว]                                   │
│ + rejected                       [ปฏิเสธแล้ว]                                   │
│ + completed                      [เสร็จสิ้น]                                    │
│ + failed                         [ไม่มาตามนัด]                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**คำอธิบาย NotificationTypeEnum:**
- **วัตถุประสงค์**: กำหนดประเภทของการแจ้งเตือน
- **หน้าที่หลัก**: แยกประเภทการแจ้งเตือนเพื่อการจัดการและการแสดงผล

---

### **2. Entity Classes**

#### User
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   User                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - id: Integer                                                                  │
│ - student_id: String                                                           │
│ - first_name: String                                                           │
│ - last_name: String                                                            │
│ - phone: String                                                                │
│ - email: String                                                                │
│ - office: String                                                               │
│ - role: RoleEnum                                                               │
│ - password_hash: String                                                        │
│ - created_at: Timestamp                                                        │
│ - updated_at: Timestamp                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + getFullName(): String                                                        │
│ + isAdvisor(): Boolean                                                         │
│ + isStudent(): Boolean                                                         │
│ + authenticate(password: String): Boolean                                      │
│ + updateProfile(data: User): void                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `id: Integer` - Primary Key - รหัสประจำตัวผู้ใช้
- `student_id: String` - รหัสนักศึกษา/อาจารย์ (ไม่บังคับ, UNIQUE)
- `first_name: String` - ชื่อจริง
- `last_name: String` - นามสกุล
- `phone: String` - เบอร์โทรศัพท์ (UNIQUE)
- `email: String` - อีเมล (ไม่บังคับ)
- `office: String` - ห้องทำงาน (สำหรับอาจารย์)
- `role: RoleEnum` - บทบาท: student หรือ advisor
- `password_hash: String` - รหัสผ่านที่เข้ารหัสแล้ว
- `created_at: Timestamp` - วันที่สร้างบัญชี
- `updated_at: Timestamp` - วันที่อัปเดตล่าสุด

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
│ - id: Integer                                                                  │
│ - name: String                                                                 │
│ - advisor_id: Integer                                                          │
│ - created_at: Timestamp                                                        │
│ - updated_at: Timestamp                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + addStudent(studentId: Integer): void                                         │
│ + removeStudent(studentId: Integer): void                                      │
│ + getStudentCount(): Number                                                    │
│ + getAdvisor(): User                                                           │
│ + canBeDeleted(): Boolean                                                      │
│ + getAppointmentCount(): Number                                                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `id: Integer` - Primary Key - รหัสโปรเจค
- `name: String` - ชื่อโปรเจค
- `advisor_id: Integer` - Foreign Key - รหัสอาจารย์ที่ปรึกษา
- `created_at: Timestamp` - วันที่สร้างโปรเจค
- `updated_at: Timestamp` - วันที่อัปเดตล่าสุด

**Methods:**
- `addStudent(studentId: Integer): void` - เพิ่มนักศึกษาเข้าร่วมโปรเจค
  - Params: studentId (Integer) - รหัสนักศึกษาที่ต้องการเพิ่ม
  - Returns: void - ไม่คืนค่า
  - Example: addStudent(123)
- `removeStudent(studentId: Integer): void` - ลบนักศึกษาออกจากโปรเจค
  - Params: studentId (Integer) - รหัสนักศึกษาที่ต้องการลบ
  - Returns: void - ไม่คืนค่า
  - Example: removeStudent(123)
- `getStudentCount(): Number` - นับจำนวนนักศึกษาในโปรเจค
  - Params: ไม่มี
  - Returns: Number - จำนวนนักศึกษาในโปรเจค
  - Example: 3
- `getAdvisor(): User` - คืนค่าข้อมูลอาจารย์ที่ปรึกษา
  - Params: ไม่มี
  - Returns: User - ข้อมูลอาจารย์ที่ปรึกษา
  - Example: User{id: 1, firstName: "อาจารย์", lastName: "สมชาย"}
- `canBeDeleted(): Boolean` - ตรวจสอบว่าสามารถลบได้หรือไม่
  - Params: ไม่มี
  - Returns: Boolean - true ถ้าสามารถลบได้, false ถ้าไม่สามารถ
  - Example: false (ถ้ามีนัดหมายค้างอยู่)
- `getAppointmentCount(): Number` - นับจำนวนการนัดหมายในโปรเจค
  - Params: ไม่มี
  - Returns: Number - จำนวนการนัดหมายในโปรเจค
  - Example: 5

**คำอธิบาย Class Project:**
- **วัตถุประสงค์**: เก็บข้อมูลโปรเจคที่อาจารย์สร้างและนักศึกษาเข้าร่วม
- **หน้าที่หลัก**: จัดการโปรเจค การมอบหมายงาน และการติดตามความคืบหน้า
- **ความสัมพันธ์**: เชื่อมโยงกับ User (advisor/students) และ Appointment

#### Appointment
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               Appointment                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - id: Integer                                                                  │
│ - title: String                                                                │
│ - date: Date                                                                   │
│ - time: String                                                                 │
│ - location: String                                                             │
│ - notes: String                                                                │
│ - status: StatusEnum                                                           │
│ - student_id: Integer                                                          │
│ - advisor_id: Integer                                                          │
│ - project_id: Integer                                                          │
│ - created_at: Timestamp                                                        │
│ - updated_at: Timestamp                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + confirm(): void                                                              │
│ + reject(): void                                                               │
│ + cancel(): void                                                               │
│ + complete(): void                                                             │
│ + isExpired(): Boolean                                                         │
│ + canBeModified(): Boolean                                                     │
│ + getStatusDisplay(): String                                                   │
│ + getDateTimeString(): String                                                  │
│ + confirmChanges(): void                                                       │
│ + rejectChanges(): void                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `id: Integer` - Primary Key - รหัสการนัดหมาย
- `title: String` - หัวข้อการนัดหมาย (ไม่บังคับ)
- `date: Date` - วันที่นัดหมาย
- `time: String` - เวลานัดหมาย (รูปแบบ HH:MM)
- `location: String` - สถานที่นัดหมาย
- `notes: String` - หมายเหตุ (ไม่บังคับ)
- `status: StatusEnum` - สถานะการนัดหมาย
- `student_id: Integer` - Foreign Key - รหัสนักศึกษา
- `advisor_id: Integer` - Foreign Key - รหัสอาจารย์
- `project_id: Integer` - Foreign Key - รหัสโปรเจค (ไม่บังคับ)
- `created_at: Timestamp` - วันที่สร้างการนัดหมาย
- `updated_at: Timestamp` - วันที่อัปเดตล่าสุด

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
- `confirmChanges(): void` - ยืนยันการเปลี่ยนแปลงนัดหมาย
  - Params: ไม่มี
  - Returns: void - ไม่คืนค่า
  - Example: confirmChanges() - เปลี่ยน status = "confirmed"
- `rejectChanges(): void` - ปฏิเสธการเปลี่ยนแปลงนัดหมาย
  - Params: ไม่มี
  - Returns: void - ไม่คืนค่า
  - Example: rejectChanges() - เปลี่ยน status = "rejected"

**คำอธิบาย Class Appointment:**
- **วัตถุประสงค์**: เก็บข้อมูลการนัดหมายระหว่างนักศึกษาและอาจารย์
- **หน้าที่หลัก**: จัดการการนัดหมาย ติดตามสถานะ และควบคุมการเปลี่ยนแปลง
- **ความสัมพันธ์**: เชื่อมโยงกับ User (student/advisor), Project, Comment, และ Notification

#### Comment
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                Comment                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - id: Integer                                                                  │
│ - content: String                                                              │
│ - appointment_id: Integer                                                      │
│ - user_id: Integer                                                             │
│ - created_at: Timestamp                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + getFormattedDate(): String                                                   │
│ + getAuthorName(): String                                                      │
│ + canBeEdited(userId: Integer): Boolean                                        │
│ + updateContent(content: String): void                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `id: Integer` - Primary Key - รหัสความคิดเห็น
- `content: String` - เนื้อหาความคิดเห็น
- `appointment_id: Integer` - Foreign Key - รหัสการนัดหมาย
- `user_id: Integer` - Foreign Key - รหัสผู้เขียนความคิดเห็น
- `created_at: Timestamp` - วันที่เขียนความคิดเห็น

**Methods:**
- `getFormattedDate(): String` - คืนค่าวันที่ในรูปแบบที่อ่านได้
  - Params: ไม่มี
  - Returns: String - วันที่ในรูปแบบที่อ่านได้
  - Example: "15 มกราคม 2567 เวลา 14:30"
- `getAuthorName(): String` - คืนค่าชื่อผู้เขียนความคิดเห็น
  - Params: ไม่มี
  - Returns: String - ชื่อผู้เขียนความคิดเห็น
  - Example: "สมชาย ใจดี"
- `canBeEdited(userId: Integer): Boolean` - ตรวจสอบว่าสามารถแก้ไขได้หรือไม่
  - Params: userId (Integer) - รหัสผู้ใช้ที่ต้องการตรวจสอบ
  - Returns: Boolean - true ถ้าแก้ไขได้, false ถ้าแก้ไขไม่ได้
  - Example: canBeEdited(123) → true (ถ้าเป็นเจ้าของความคิดเห็น)
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
│ - id: Integer                                                                  │
│ - user_id: Integer                                                             │
│ - type: NotificationTypeEnum                                                   │
│ - title: String                                                                │
│ - message: String                                                              │
│ - is_read: Boolean                                                             │
│ - appointment_id: Integer                                                      │
│ - related_id: Integer                                                          │
│ - created_at: Timestamp                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + markAsRead(): void                                                           │
│ + markAsUnread(): void                                                         │
│ + getFormattedDate(): String                                                   │
│ + getTypeDisplay(): String                                                     │
│ + isRecent(): Boolean                                                          │
│ + getIcon(): String                                                            │
│ + getColor(): String                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `id: Integer` - Primary Key - รหัสการแจ้งเตือน
- `user_id: Integer` - Foreign Key - รหัสผู้รับการแจ้งเตือน
- `type: NotificationTypeEnum` - ประเภทการแจ้งเตือน
- `title: String` - หัวข้อการแจ้งเตือน
- `message: String` - เนื้อหาการแจ้งเตือน
- `is_read: Boolean` - สถานะการอ่าน (true/false)
- `appointment_id: Integer` - Foreign Key - รหัสการนัดหมาย (ไม่บังคับ)
- `related_id: Integer` - รหัสที่เกี่ยวข้อง (ไม่บังคับ)
- `created_at: Timestamp` - วันที่สร้างการแจ้งเตือน

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
- `getIcon(): String` - คืนค่าไอคอนสำหรับการแจ้งเตือน
  - Params: ไม่มี
  - Returns: String - ชื่อไอคอน
  - Example: "CheckCircle" (สำหรับ appointment_confirmed)
- `getColor(): String` - คืนค่าสีสำหรับการแจ้งเตือน
  - Params: ไม่มี
  - Returns: String - สีในรูปแบบ CSS class
  - Example: "text-green-500" (สำหรับ appointment_confirmed)

**คำอธิบาย Class Notification:**
- **วัตถุประสงค์**: เก็บการแจ้งเตือนต่างๆ ในระบบ
- **หน้าที่หลัก**: จัดการการแจ้งเตือน การติดตามสถานะการอ่าน และการแสดงผล
- **ความสัมพันธ์**: เชื่อมโยงกับ User (ผู้รับการแจ้งเตือน) และ Appointment (ไม่บังคับ)

#### ProjectStudent
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ProjectStudent                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│ - project_id: Integer                                                          │
│ - student_id: Integer                                                          │
│ - created_at: Timestamp                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + getProject(): Project                                                        │
│ + getStudent(): User                                                           │
│ + getJoinDate(): Date                                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Attributes:**
- `project_id: Integer` - Foreign Key - รหัสโปรเจค
- `student_id: Integer` - Foreign Key - รหัสนักศึกษา
- `created_at: Timestamp` - วันที่เข้าร่วมโปรเจค

**Methods:**
- `getProject(): Project` - คืนค่าโปรเจคที่เกี่ยวข้อง
  - Params: ไม่มี
  - Returns: Project - ข้อมูลโปรเจคที่เกี่ยวข้อง
  - Example: Project{id: 1, name: "โปรเจค A"}
- `getStudent(): User` - คืนค่านักศึกษาที่เกี่ยวข้อง
  - Params: ไม่มี
  - Returns: User - ข้อมูลนักศึกษาที่เกี่ยวข้อง
  - Example: User{id: 123, firstName: "สมชาย", lastName: "ใจดี"}
- `getJoinDate(): Date` - คืนค่าวันที่เข้าร่วม
  - Params: ไม่มี
  - Returns: Date - วันที่เข้าร่วมโปรเจค
  - Example: 2024-01-15T10:30:00Z

**คำอธิบาย Class ProjectStudent:**
- **วัตถุประสงค์**: Junction Table สำหรับความสัมพันธ์ Many-to-Many ระหว่าง Project และ User (นักศึกษา)
- **หน้าที่หลัก**: จัดการความสัมพันธ์ระหว่างโปรเจคและนักศึกษา
- **ความสัมพันธ์**: เชื่อมโยงกับ Project และ User (student role)

---

### **3. Service Classes**

#### EmailService
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            EmailService                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + sendAppointmentCreatedEmail(appointment: Appointment, recipient: User): Boolean│
│ + sendAppointmentConfirmedEmail(appointment: Appointment, recipient: User): Boolean│
│ + sendAppointmentRejectedEmail(appointment: Appointment, recipient: User): Boolean│
│ + sendAppointmentUpdatedEmail(appointment: Appointment, recipient: User): Boolean│
│ + sendAppointmentReminderEmail(appointment: Appointment, recipient: User): Boolean│
│ + sendAppointmentCancelledEmail(appointment: Appointment, recipient: User): Boolean│
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Methods:**
- `sendAppointmentCreatedEmail(appointment: Appointment, recipient: User): Boolean` - ส่งอีเมลแจ้งเตือนนัดหมายใหม่
  - Params: appointment (Appointment) - ข้อมูลการนัดหมาย, recipient (User) - ผู้รับอีเมล
  - Returns: Boolean - true ถ้าส่งสำเร็จ, false ถ้าส่งไม่สำเร็จ
  - Example: sendAppointmentCreatedEmail(appointment, advisor) → true
- `sendAppointmentConfirmedEmail(appointment: Appointment, recipient: User): Boolean` - ส่งอีเมลยืนยันนัดหมาย
  - Params: appointment (Appointment) - ข้อมูลการนัดหมาย, recipient (User) - ผู้รับอีเมล
  - Returns: Boolean - true ถ้าส่งสำเร็จ, false ถ้าส่งไม่สำเร็จ
  - Example: sendAppointmentConfirmedEmail(appointment, student) → true
- `sendAppointmentRejectedEmail(appointment: Appointment, recipient: User): Boolean` - ส่งอีเมลปฏิเสธนัดหมาย
  - Params: appointment (Appointment) - ข้อมูลการนัดหมาย, recipient (User) - ผู้รับอีเมล
  - Returns: Boolean - true ถ้าส่งสำเร็จ, false ถ้าส่งไม่สำเร็จ
  - Example: sendAppointmentRejectedEmail(appointment, student) → true
- `sendAppointmentUpdatedEmail(appointment: Appointment, recipient: User): Boolean` - ส่งอีเมลแจ้งการแก้ไขนัดหมาย
  - Params: appointment (Appointment) - ข้อมูลการนัดหมาย, recipient (User) - ผู้รับอีเมล
  - Returns: Boolean - true ถ้าส่งสำเร็จ, false ถ้าส่งไม่สำเร็จ
  - Example: sendAppointmentUpdatedEmail(appointment, student) → true
- `sendAppointmentReminderEmail(appointment: Appointment, recipient: User): Boolean` - ส่งอีเมลเตือนนัดหมาย
  - Params: appointment (Appointment) - ข้อมูลการนัดหมาย, recipient (User) - ผู้รับอีเมล
  - Returns: Boolean - true ถ้าส่งสำเร็จ, false ถ้าส่งไม่สำเร็จ
  - Example: sendAppointmentReminderEmail(appointment, student) → true
- `sendAppointmentCancelledEmail(appointment: Appointment, recipient: User): Boolean` - ส่งอีเมลยกเลิกนัดหมาย
  - Params: appointment (Appointment) - ข้อมูลการนัดหมาย, recipient (User) - ผู้รับอีเมล
  - Returns: Boolean - true ถ้าส่งสำเร็จ, false ถ้าส่งไม่สำเร็จ
  - Example: sendAppointmentCancelledEmail(appointment, student) → true

**คำอธิบาย Class EmailService:**
- **วัตถุประสงค์**: จัดการการส่งอีเมลแจ้งเตือนต่างๆ ในระบบ
- **หน้าที่หลัก**: ส่งอีเมลแจ้งเตือนตามประเภทการนัดหมาย
- **ความสัมพันธ์**: ใช้ข้อมูลจาก Appointment และ User เพื่อส่งอีเมล

---

### **4. Controller Classes**

#### AppointmentController
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        AppointmentController                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + getAllAppointments(): Array~Appointment~                                     │
│ + getAppointmentById(id: Integer): Appointment                                 │
│ + getAppointmentsByProject(projectId: Integer): Array~Appointment~             │
│ + createAppointment(appointmentData: Object): Appointment                      │
│ + updateAppointment(id: Integer, appointmentData: Object): Appointment         │
│ + deleteAppointment(id: Integer): Boolean                                      │
│ + confirmAppointment(id: Integer): Appointment                                 │
│ + rejectAppointment(id: Integer): Appointment                                  │
│ + acceptAppointment(id: Integer): Appointment                                  │
│ + studentRejectAppointment(id: Integer, reason: String): Appointment           │
│ + completeAppointment(id: Integer): Appointment                                │
│ + updateAppointmentStatus(id: Integer, status: StatusEnum): Appointment        │
│ + confirmChanges(id: Integer): Appointment                                     │
│ + rejectChanges(id: Integer): Appointment                                      │
│ + advisorConfirmChanges(id: Integer): Appointment                              │
│ + advisorRejectChanges(id: Integer): Appointment                               │
│ + addComment(id: Integer, content: String): Comment                            │
│ + getComments(id: Integer): Array~Comment~                                     │
│ + checkExpiredAppointments(): Array~Appointment~                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**คำอธิบาย Class AppointmentController:**
- **วัตถุประสงค์**: จัดการ API endpoints สำหรับการนัดหมาย
- **หน้าที่หลัก**: รับ request จาก frontend และจัดการกับ database
- **ความสัมพันธ์**: ใช้ข้อมูลจาก Appointment, User, Project, Comment

#### ProjectController
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ProjectController                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + getAllProjects(): Array~Project~                                             │
│ + getProjectById(id: Integer): Project                                         │
│ + getArchivedProjects(): Array~Project~                                        │
│ + createProject(projectData: Object): Project                                  │
│ + updateProject(id: Integer, projectData: Object): Project                     │
│ + deleteProject(id: Integer): Boolean                                          │
│ + addStudentToProject(id: Integer, studentId: Integer): Boolean                │
│ + removeStudentFromProject(id: Integer, studentId: Integer): Boolean           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**คำอธิบาย Class ProjectController:**
- **วัตถุประสงค์**: จัดการ API endpoints สำหรับโปรเจค
- **หน้าที่หลัก**: รับ request จาก frontend และจัดการกับ database
- **ความสัมพันธ์**: ใช้ข้อมูลจาก Project, User, ProjectStudent

#### UserController
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            UserController                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + getAllUsers(): Array~User~                                                   │
│ + createUser(userData: Object): User                                           │
│ + updateUser(id: Integer, userData: Object): User                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**คำอธิบาย Class UserController:**
- **วัตถุประสงค์**: จัดการ API endpoints สำหรับผู้ใช้
- **หน้าที่หลัก**: รับ request จาก frontend และจัดการกับ database
- **ความสัมพันธ์**: ใช้ข้อมูลจาก User

#### AuthController
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AuthController                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + login(credentials: Object): AuthToken                                        │
│ + getCurrentUser(): User                                                       │
│ + changePassword(oldPassword: String, newPassword: String): Boolean            │
│ + resetPassword(email: String): Boolean                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**คำอธิบาย Class AuthController:**
- **วัตถุประสงค์**: จัดการ API endpoints สำหรับการยืนยันตัวตน
- **หน้าที่หลัก**: รับ request จาก frontend และจัดการ authentication
- **ความสัมพันธ์**: ใช้ข้อมูลจาก User

#### NotificationController
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        NotificationController                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│ + getAllNotifications(): Array~Notification~                                   │
│ + markAsRead(id: Integer): Boolean                                             │
│ + markAllAsRead(): Boolean                                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**คำอธิบาย Class NotificationController:**
- **วัตถุประสงค์**: จัดการ API endpoints สำหรับการแจ้งเตือน
- **หน้าที่หลัก**: รับ request จาก frontend และจัดการกับ database
- **ความสัมพันธ์**: ใช้ข้อมูลจาก Notification, User

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
│   └───0..*──── 0..*── Project (through ProjectStudent)                       │
│                                                                                 │
│  Project ──1──── 0..*── ProjectStudent                                        │
│                                                                                 │
│  RoleEnum ──→ User.role                                                        │
│  StatusEnum ──→ Appointment.status                                             │
│  NotificationTypeEnum ──→ Notification.type                                    │
│                                                                                 │
│  EmailService ──→ Appointment, User (for email notifications)                  │
│  Controllers ──→ All Entity Classes (for API management)                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Entity Summary

### **Entity Classes (6 classes)**
1. **User** - ผู้ใช้ (11 attributes, 5 methods)
2. **Project** - โปรเจค (5 attributes, 6 methods)
3. **Appointment** - การนัดหมาย (12 attributes, 10 methods)
4. **Comment** - ความคิดเห็น (5 attributes, 4 methods)
5. **Notification** - การแจ้งเตือน (9 attributes, 7 methods)
6. **ProjectStudent** - Junction Table (3 attributes, 3 methods)

### **Enumeration Classes (3 classes)**
1. **RoleEnum** - บทบาทผู้ใช้ (student, advisor)
2. **StatusEnum** - สถานะการนัดหมาย (9 สถานะ)
3. **NotificationTypeEnum** - ประเภทการแจ้งเตือน (12 ประเภท)

### **Service Classes (1 class)**
1. **EmailService** - บริการส่งอีเมล (6 methods)

### **Controller Classes (5 classes)**
1. **AppointmentController** - จัดการการนัดหมาย (19 methods)
2. **ProjectController** - จัดการโปรเจค (8 methods)
3. **UserController** - จัดการผู้ใช้ (3 methods)
4. **AuthController** - จัดการการยืนยันตัวตน (4 methods)
5. **NotificationController** - จัดการการแจ้งเตือน (3 methods)

---

## 🎯 Key Features

### **Data Types**
- **Integer**: id, user_id, project_id, appointment_id
- **String**: student_id, first_name, last_name, phone, email, title, location, notes, content
- **Boolean**: is_read
- **Timestamp**: created_at, updated_at
- **Date**: date
- **Enum**: RoleEnum, StatusEnum, NotificationTypeEnum

### **UML Notation**
- **Visibility**: `-` (private), `+` (public)
- **Relationships**: `1..*` (One-to-Many), `0..*` (Zero-to-Many), `0..1` (Zero-to-One), `*..*` (Many-to-Many)
- **Enumerations**: `<<enumeration>>`
- **Methods**: `methodName(param: Type): ReturnType`

### **Database Tables (6 tables)**
- **users** - ข้อมูลผู้ใช้
- **projects** - ข้อมูลโปรเจค
- **project_students** - ความสัมพันธ์โปรเจค-นักศึกษา
- **appointments** - ข้อมูลการนัดหมาย
- **comments** - ความคิดเห็นการนัดหมาย
- **notifications** - การแจ้งเตือน

---

## 🚀 Usage Analysis

### ✅ **Actively Used Methods:**
- All EmailService methods except `sendAppointmentReminderEmail`
- All Controller methods are implemented and used
- All Entity methods are used in business logic

### ❌ **Unused Methods:**
- `EmailService.sendAppointmentReminderEmail()` - No scheduled job implementation

### ❌ **Unused Attributes:**
- `User.office` - Not displayed in UI
- `User.updated_at` - Has trigger but not queried
- `Appointment.updated_at` - Has trigger but not queried
- `Notification.related_id` - Inconsistent usage

### 🔧 **Recommendations:**
1. **Implement Reminder System** - Use `sendAppointmentReminderEmail`
2. **Utilize Timestamps** - Use `updated_at` for audit trails
3. **Display Office Information** - Use `User.office` in UI
4. **Standardize Notification Types** - Consistent use of `related_id`
5. **Add Scheduled Jobs** - For reminders and cleanup tasks

Class Diagram นี้แสดงโครงสร้างของระบบจัดการนัดหมายอย่างครบถ้วน โดยใช้ UML notation มาตรฐานที่สามารถใส่ในรายงานโปรเจคได้

