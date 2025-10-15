# ER Diagram - Simple Version

## 📊 **Entity Relationship Diagram**

```mermaid
erDiagram
    USERS {
        int id PK
        varchar student_id UK
        varchar first_name
        varchar last_name
        varchar phone UK
        varchar email
        varchar role
        timestamp created_at
    }

    PROJECTS {
        int id PK
        varchar name
        int advisor_id FK
        varchar academic_year
        timestamp created_at
    }

    PROJECT_STUDENTS {
        int project_id PK,FK
        int student_id PK,FK
        timestamp created_at
    }

    APPOINTMENTS {
        int id PK
        varchar title
        date date
        time time
        varchar location
        varchar status
        int student_id FK
        int advisor_id FK
        int project_id FK
        timestamp created_at
    }

    COMMENTS {
        int id PK
        text content
        int appointment_id FK
        int user_id FK
        timestamp created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        varchar type
        varchar title
        text message
        boolean is_read
        int appointment_id FK
        timestamp created_at
    }

    %% Relationships
    USERS ||--o{ PROJECTS : "เป็นที่ปรึกษา"
    USERS ||--o{ PROJECT_STUDENTS : "เป็นสมาชิก"
    PROJECTS ||--o{ PROJECT_STUDENTS : "มีสมาชิก"
    USERS ||--o{ APPOINTMENTS : "เป็นนักศึกษา"
    USERS ||--o{ APPOINTMENTS : "เป็นอาจารย์"
    PROJECTS ||--o{ APPOINTMENTS : "มีนัดหมาย"
    APPOINTMENTS ||--o{ COMMENTS : "มีคอมเมนต์"
    USERS ||--o{ COMMENTS : "เขียนคอมเมนต์"
    USERS ||--o{ NOTIFICATIONS : "รับการแจ้งเตือน"
    APPOINTMENTS ||--o{ NOTIFICATIONS : "เกี่ยวข้องกับ"
```

## 🔗 **ความสัมพันธ์หลัก**

1. **USERS → PROJECTS** (1:Many) - อาจารย์เป็นที่ปรึกษาโปรเจค
2. **USERS ↔ PROJECTS** (Many:Many) - นักศึกษาในโปรเจค (ผ่าน PROJECT_STUDENTS)
3. **USERS → APPOINTMENTS** (1:Many) - นักศึกษา/อาจารย์ในนัดหมาย
4. **PROJECTS → APPOINTMENTS** (1:Many) - โปรเจคมีนัดหมาย
5. **APPOINTMENTS → COMMENTS** (1:Many) - นัดหมายมีคอมเมนต์
6. **USERS → NOTIFICATIONS** (1:Many) - ผู้ใช้รับการแจ้งเตือน

## 📋 **สัญลักษณ์**

- **PK** = Primary Key
- **FK** = Foreign Key  
- **UK** = Unique Key
- **||--o{** = One-to-Many
- **}o--||** = Many-to-One
