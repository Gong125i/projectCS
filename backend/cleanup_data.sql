-- Script to clean up all data except users 0001 and 655021001327
-- Run this script to reset the database while keeping specific users

-- Start transaction
BEGIN;

-- 1. Delete all comments
DELETE FROM comments;

-- 2. Delete all notifications
DELETE FROM notifications;

-- 3. Delete all appointments
DELETE FROM appointments;

-- 4. Delete all project_students relationships
DELETE FROM project_students;

-- 5. Delete all project_archive records first
DELETE FROM project_archive;

-- 6. Delete all projects
DELETE FROM projects;

-- 7. Delete all users EXCEPT 0001 and 655021001327
DELETE FROM users 
WHERE student_id NOT IN ('0001', '655021001327');

-- Reset sequences
ALTER SEQUENCE appointments_id_seq RESTART WITH 1;
ALTER SEQUENCE projects_id_seq RESTART WITH 1;
ALTER SEQUENCE comments_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;

-- Commit transaction
COMMIT;

-- Verify remaining users
SELECT student_id, first_name, last_name, role FROM users ORDER BY student_id;

