# Class Diagram - User-Database System (Mermaid Format)

## 📋 ภาพรวมระบบ

Class Diagram นี้แสดงโครงสร้างของระบบจัดการนัดหมายที่เน้นความสัมพันธ์ระหว่าง User และ Database โดยใช้ Mermaid syntax

---

## 🎨 Class Diagram (Mermaid)

```mermaid
classDiagram
    %% Enum Definitions
    class RoleEnum {
        <<enumeration>>
        student
        advisor
    }

    class StatusEnum {
        <<enumeration>>
        pending
        confirmed
        rejected
        cancelled
        completed
        failed
        pending_student_confirmation
        pending_advisor_confirmation
        no_response
    }

    class NotificationTypeEnum {
        <<enumeration>>
        appointment_reminder
        appointment_request
        appointment_confirmed
        appointment_rejected
        project_invitation
        system_announcement
    }

    class ImportTypeEnum {
        <<enumeration>>
        users
        projects
        appointments
    }

    class EmailTemplateTypeEnum {
        <<enumeration>>
        appointment_created
        appointment_confirmed
        appointment_rejected
        appointment_updated
        appointment_reminder
        appointment_cancelled
    }

    %% Entity Classes
    class User {
        -id: String
        -studentId: String
        -firstName: String
        -lastName: String
        -phone: String
        -email: String
        -office: String
        -role: RoleEnum
        -passwordHash: String
        -createdAt: Date
        -updatedAt: Date
        +getFullName() String
        +isAdvisor() Boolean
        +isStudent() Boolean
        +authenticate(password: String) Boolean
        +updateProfile(data: User) void
    }

    class Project {
        -id: String
        -name: String
        -advisorId: String
        -academicYear: String
        -semester: String
        -archived: Boolean
        -archivedAt: Date
        -createdAt: Date
        -updatedAt: Date
        +addStudent(studentId: String) void
        +removeStudent(studentId: String) void
        +getStudentCount() Number
        +archive() void
        +isArchived() Boolean
        +canBeArchived() Boolean
    }

    class Appointment {
        -id: String
        -title: String
        -date: Date
        -time: String
        -location: String
        -notes: String
        -status: StatusEnum
        -studentId: String
        -advisorId: String
        -projectId: String
        -createdAt: Date
        -updatedAt: Date
        +confirm() void
        +reject() void
        +cancel() void
        +complete() void
        +isExpired() Boolean
        +canBeModified() Boolean
        +getStatusDisplay() String
        +getDateTimeString() String
    }

    class Comment {
        -id: String
        -content: String
        -appointmentId: String
        -userId: String
        -createdAt: Date
        +getFormattedDate() String
        +getAuthorName() String
        +canBeEdited(userId: String) Boolean
        +updateContent(content: String) void
    }

    class AppointmentRecord {
        -id: String
        -appointmentId: String
        -content: String
        -userId: String
        -createdAt: Date
        -updatedAt: Date
        +getFormattedDate() String
        +getAuthorName() String
        +canBeEdited(userId: String) Boolean
        +updateContent(content: String) void
    }

    class Notification {
        -id: String
        -userId: String
        -type: NotificationTypeEnum
        -title: String
        -message: String
        -isRead: Boolean
        -appointmentId: String
        -createdAt: Date
        +markAsRead() void
        +markAsUnread() void
        +getFormattedDate() String
        +getTypeDisplay() String
        +isRecent() Boolean
    }

    class ArchivedProject {
        -id: String
        -projectId: String
        -projectName: String
        -description: String
        -advisorName: String
        -studentNames: String[]
        -academicYear: String
        -semester: String
        -completionDate: Date
        -projectType: String
        -totalAppointments: Number
        -completedAppointments: Number
        -successRate: String
        -attendanceRate: String
        -appointmentDetails: Object[]
        -archivedAt: Date
        -createdAt: Date
        -updatedAt: Date
        +getCompletionStatus() String
        +getSuccessRateDisplay() String
        +getAttendanceRateDisplay() String
        +getStudentNamesDisplay() String
        +getProjectTypeDisplay() String
        +getFormattedCompletionDate() String
        +getStatistics() Object
        +canBeRestored() Boolean
    }

    class ProjectStudent {
        -projectId: String
        -studentId: String
        -createdAt: Date
        +getProject() Project
        +getStudent() User
        +getJoinDate() Date
    }

    class ImportRecord {
        -id: String
        -fileName: String
        -importType: ImportTypeEnum
        -totalRecords: Number
        -successCount: Number
        -errorCount: Number
        -errors: String[]
        -importedBy: String
        -createdAt: Date
        +getSuccessRate() Number
        +getErrorDetails() String[]
        +getImportSummary() Object
        +canBeRetried() Boolean
    }

    class EmailTemplate {
        -id: String
        -templateType: EmailTemplateTypeEnum
        -subject: String
        -htmlContent: String
        -textContent: String
        -isActive: Boolean
        -createdAt: Date
        -updatedAt: Date
        +renderTemplate(data: Object) String
        +validateTemplate() Boolean
        +getPreview() String
        +activate() void
        +deactivate() void
    }

    %% Relationships
    User ||--o{ Project : "advisor creates"
    User ||--o{ Project : "student participates"
    User ||--o{ Appointment : "student has"
    User ||--o{ Appointment : "advisor has"
    User ||--o{ Notification : "receives"
    User ||--o{ ImportRecord : "imports"
    User ||--o{ Comment : "writes"
    User ||--o{ AppointmentRecord : "creates"
    User ||--o{ ProjectStudent : "participates"

    Project ||--o{ Appointment : "has"
    Project ||--o{ ProjectStudent : "includes"
    Project ||--o| ArchivedProject : "archived as"

    Appointment ||--o{ Comment : "has"
    Appointment ||--o{ AppointmentRecord : "has"
    Appointment ||--o{ Notification : "generates"

    %% Many-to-Many through ProjectStudent
    User }o--o{ Project : "student-project relationship"

    %% Enum Relationships
    User --> RoleEnum : "uses"
    Appointment --> StatusEnum : "uses"
    Notification --> NotificationTypeEnum : "uses"
    ImportRecord --> ImportTypeEnum : "uses"
    EmailTemplate --> EmailTemplateTypeEnum : "uses"
```

---

## 📊 รายละเอียด Classes

### **1. User**
- **Attributes**: 11 attributes (id, studentId, firstName, lastName, phone, email, office, role, passwordHash, createdAt, updatedAt)
- **Methods**: 5 methods (getFullName, isAdvisor, isStudent, authenticate, updateProfile)
- **Relationships**: One-to-Many กับ Project, Appointment, Notification, ImportRecord, Comment, AppointmentRecord, ProjectStudent

### **2. Project**
- **Attributes**: 9 attributes (id, name, advisorId, academicYear, semester, archived, archivedAt, createdAt, updatedAt)
- **Methods**: 6 methods (addStudent, removeStudent, getStudentCount, archive, isArchived, canBeArchived)
- **Relationships**: One-to-Many กับ Appointment, ProjectStudent; One-to-One กับ ArchivedProject

### **3. Appointment**
- **Attributes**: 11 attributes (id, title, date, time, location, notes, status, studentId, advisorId, projectId, createdAt, updatedAt)
- **Methods**: 8 methods (confirm, reject, cancel, complete, isExpired, canBeModified, getStatusDisplay, getDateTimeString)
- **Relationships**: One-to-Many กับ Comment, AppointmentRecord, Notification

### **4. Comment**
- **Attributes**: 5 attributes (id, content, appointmentId, userId, createdAt)
- **Methods**: 4 methods (getFormattedDate, getAuthorName, canBeEdited, updateContent)
- **Relationships**: Many-to-One กับ Appointment, User

### **5. AppointmentRecord**
- **Attributes**: 6 attributes (id, appointmentId, content, userId, createdAt, updatedAt)
- **Methods**: 4 methods (getFormattedDate, getAuthorName, canBeEdited, updateContent)
- **Relationships**: Many-to-One กับ Appointment, User

### **6. Notification**
- **Attributes**: 8 attributes (id, userId, type, title, message, isRead, appointmentId, createdAt)
- **Methods**: 5 methods (markAsRead, markAsUnread, getFormattedDate, getTypeDisplay, isRecent)
- **Relationships**: Many-to-One กับ User, Appointment

### **7. ArchivedProject**
- **Attributes**: 18 attributes (id, projectId, projectName, description, advisorName, studentNames, academicYear, semester, completionDate, projectType, totalAppointments, completedAppointments, successRate, attendanceRate, appointmentDetails, archivedAt, createdAt, updatedAt)
- **Methods**: 8 methods (getCompletionStatus, getSuccessRateDisplay, getAttendanceRateDisplay, getStudentNamesDisplay, getProjectTypeDisplay, getFormattedCompletionDate, getStatistics, canBeRestored)
- **Relationships**: One-to-One กับ Project

### **8. ProjectStudent (Junction Table)**
- **Attributes**: 3 attributes (projectId, studentId, createdAt)
- **Methods**: 3 methods (getProject, getStudent, getJoinDate)
- **Relationships**: Many-to-One กับ User, Project

### **9. ImportRecord**
- **Attributes**: 8 attributes (id, fileName, importType, totalRecords, successCount, errorCount, errors, importedBy, createdAt)
- **Methods**: 4 methods (getSuccessRate, getErrorDetails, getImportSummary, canBeRetried)
- **Relationships**: Many-to-One กับ User

### **10. EmailTemplate**
- **Attributes**: 8 attributes (id, templateType, subject, htmlContent, textContent, isActive, createdAt, updatedAt)
- **Methods**: 5 methods (renderTemplate, validateTemplate, getPreview, activate, deactivate)
- **Relationships**: ใช้ EmailTemplateTypeEnum

---

## 🔗 Relationships Summary

### **Primary Relationships**
- **User ↔ Project**: One-to-Many (advisor creates) + Many-to-Many (student participates)
- **User ↔ Appointment**: One-to-Many (both student and advisor)
- **Project ↔ Appointment**: One-to-Many
- **Appointment ↔ Comment**: One-to-Many
- **Appointment ↔ AppointmentRecord**: One-to-Many
- **User ↔ Notification**: One-to-Many
- **Project ↔ ArchivedProject**: One-to-One
- **User ↔ ImportRecord**: One-to-Many

### **Enum Usage**
- **RoleEnum**: ใช้ใน User.role
- **StatusEnum**: ใช้ใน Appointment.status
- **NotificationTypeEnum**: ใช้ใน Notification.type
- **ImportTypeEnum**: ใช้ใน ImportRecord.importType
- **EmailTemplateTypeEnum**: ใช้ใน EmailTemplate.templateType

---

## 📋 Database Tables (9 tables)
- **users** - ข้อมูลผู้ใช้
- **projects** - ข้อมูลโปรเจค
- **project_students** - ความสัมพันธ์โปรเจค-นักศึกษา
- **appointments** - ข้อมูลการนัดหมาย
- **appointment_records** - บันทึกการนัดหมาย
- **notifications** - การแจ้งเตือน
- **project_archive** - โปรเจคที่จัดเก็บแล้ว
- **import_records** - บันทึกการนำเข้าข้อมูล
- **email_templates** - เทมเพลตอีเมล

---

## 🎯 Key Features
- **Role-based Access Control**: ใช้ RoleEnum สำหรับ student/advisor
- **Appointment Management**: ใช้ StatusEnum สำหรับสถานะการนัดหมาย
- **Notification System**: ใช้ NotificationTypeEnum สำหรับประเภทการแจ้งเตือน
- **Import Management**: ใช้ ImportTypeEnum สำหรับประเภทการนำเข้าข้อมูล
- **Email Service**: ใช้ EmailTemplateTypeEnum สำหรับเทมเพลตอีเมล
- **Audit Trail**: ทุก Entity มี createdAt และ updatedAt
- **Data Integrity**: ใช้ Foreign Key relationships และ constraints

Class Diagram นี้แสดงโครงสร้างของระบบจัดการนัดหมายอย่างครบถ้วน โดยใช้ Mermaid syntax และ UML specification ที่ถูกต้อง

