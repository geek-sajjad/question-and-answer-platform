-- =============================================
-- Database Cleanup Script
-- =============================================
-- This script completely deletes all data from the database
-- WARNING: This will permanently delete ALL data!
-- =============================================

-- Disable foreign key checks temporarily to avoid constraint issues
SET session_replication_role = replica;

-- Delete all data from tables in correct order (respecting foreign key constraints)
-- Start with dependent tables first

-- Delete votes (depends on users and answers)
DELETE FROM vote;

-- Delete answers (depends on users and questions)
DELETE FROM answer;

-- Delete question_tag junction table (many-to-many relationship)
DELETE FROM question_tags_tag;

-- Delete questions (depends on users)
DELETE FROM question;

-- Delete tags
DELETE FROM tag;

-- Delete users (this will be last as other tables depend on it)
DELETE FROM users;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Reset auto-increment sequences (if any tables use serial columns)
-- Note: Since we're using UUID primary keys, this might not be necessary
-- but included for completeness
-- Show confirmation
SELECT 'Database cleanup completed successfully!' as status;

