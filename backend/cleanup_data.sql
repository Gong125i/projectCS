-- ลบข้อมูลทั้งหมดออกจาก database ยกเว้น user 0001 และ 655021001327
-- Clean up all data except users 0001 and 655021001327

-- 1. ลบข้อมูลจากตารางที่มี Foreign Key ก่อน (เพื่อไม่ให้เกิด constraint violation)
DELETE FROM project_archive;
DELETE FROM comments;
DELETE FROM notifications;
DELETE FROM appointments;
DELETE FROM project_students;
DELETE FROM projects;

-- 2. ลบ users ยกเว้น 0001 และ 655021001327
DELETE FROM users WHERE student_id NOT IN ('0001', '655021001327');

-- 3. Reset sequences (auto-increment) ให้เริ่มต้นใหม่
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE projects_id_seq RESTART WITH 1;
ALTER SEQUENCE appointments_id_seq RESTART WITH 1;
ALTER SEQUENCE comments_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE project_archive_id_seq RESTART WITH 1;

-- 4. ตรวจสอบข้อมูลที่เหลือ
SELECT 'Users ที่เหลือ:' as info;
SELECT id, student_id, first_name, last_name, role FROM users ORDER BY id;

SELECT 'จำนวน records ในแต่ละตาราง:' as info;
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'project_students', COUNT(*) FROM project_students
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'project_archive', COUNT(*) FROM project_archive;
