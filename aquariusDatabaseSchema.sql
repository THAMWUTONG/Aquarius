-- ============================================================
-- AQUARIUS PERSONALIZED STUDY PLATFORM
-- Database Schema
-- ============================================================

CREATE DATABASE aquarius;

USE aquarius;

-- ============================================================
-- SECTION 1: USER MANAGEMENT
-- ============================================================

-- 1. Users
-- Stores user attributes shared across all roles.
-- Role-specific attributes are stored in the Students, Lecturers,
-- and Admins tables using Class Table Inheritance.
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'lecturer', 'admin') NOT NULL,
    last_access TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Students
-- Extends users with student-specific properties.
-- id is a FK to user to enforce one-to-one relationship.
CREATE TABLE students (
    id INT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    programme VARCHAR(255),
    intake DATE NOT NULL,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Lecturers
-- Extends users with lecturer-specific properties.
-- id is a FK to user to enforce one-to-one relationship.
CREATE TABLE lecturers (
    id INT PRIMARY KEY,
    lecturer_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(255),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Admins
-- Extends users with admin-specific properties.
-- id is a FK to user to enforce one-to-one relationship.
CREATE TABLE admins (
    id INT PRIMARY KEY,
	admin_id VARCHAR(50) NOT NULL UNIQUE,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);


-- ============================================================
-- SECTION 2: COURSE STRUCTURE
-- (Defined before tables that reference courses and topics)
-- ============================================================

-- 5. Courses
-- A course groups multiple topics together.
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
	lecturer_id VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id) ON DELETE SET NULL
);

-- 6. Topics
-- A topic belongs to a course and acts as a unit of study.
-- order_index allows topics to be arranged in a defined sequence.
CREATE TABLE topics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index TINYINT UNSIGNED,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 7. Enrollment (bridge between courses and students)
-- Enrolls students to courses.
-- Unique constraints prevent duplicate enrollments.
CREATE TABLE enrollment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('active', 'disenrolled') NOT NULL DEFAULT 'active',
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT unique_student_course_pair UNIQUE (student_id, course_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);


-- ============================================================
-- SECTION 3: STUDY MATERIALS
-- ============================================================

-- 8. Study Material
-- Stores metadata and filesystem path of uploaded study materials.
-- Files are stored in the uploads folder.
-- file_path is a reference to the location of the file. (i.e. uploads/Python1.pdf)
-- regulation_status is the status of admin regulation of the study material.
CREATE TABLE study_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('pdf', 'video', 'slides', 'document') NOT NULL,
    topic_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    regulation_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES lecturers(id)
);

-- 9. Tags
-- Stores unique tag labels that can be applied to study materials.
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
	created_by INT NOT NULL,
	FOREIGN KEY (created_by) REFERENCES lecturers(id)
);

-- 10. Study Material Tags (bridge between study_materials and tags)
-- Stores the associated tags with each study material.
-- Unique constraint prevents duplicate tags on the same study material.
CREATE TABLE study_material_tags (
	id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    tag_id INT NOT NULL,
    CONSTRAINT unique_material_tag_pair UNIQUE (material_id, tag_id),
    FOREIGN KEY (material_id) REFERENCES study_materials(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 11. Study Material Prerequisites
-- material_id refers to the material of which will have a prerequisite in a row.
-- prerequisite refers to the corresponding prerequisite material for a material_id in a row.
-- Unique constraint prevents duplicated prerequisites on the same study material.
-- Check constraint prevents a material from listing itself as a prerequisite.
CREATE TABLE study_material_prerequisites (
	id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    prerequisite_id INT NOT NULL,
    CONSTRAINT unique_material_prerequisite_pair UNIQUE (material_id, prerequisite_id),
	CONSTRAINT chk_prereq_not_self CHECK (material_id != prerequisite_id),
    FOREIGN KEY (material_id) REFERENCES study_materials(id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_id) REFERENCES study_materials(id) ON DELETE CASCADE
);

-- 12. Bookmarks
-- Tracks which materials a student has bookmarked.
-- Unique constraint prevents duplicate bookmarks.
CREATE TABLE bookmarks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    material_id INT NOT NULL,
    bookmarked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT unique_bookmark UNIQUE (student_id, material_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES study_materials(id) ON DELETE CASCADE
);


-- ============================================================
-- SECTION 4: QUIZZES
-- ============================================================

-- 13. Quizzes
-- A quiz belongs to a topic and is created by a lecturer.
-- regulation_status is the status of admin regulation of the quiz.
-- duration_min is the time in minutes given to students who attempt the quiz.
-- is_published controls whether students can see and attempt the quiz.
CREATE TABLE quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    topic_id INT NOT NULL,
    created_by INT NOT NULL,
    duration_min SMALLINT UNSIGNED,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    regulation_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES lecturers(id)
);

-- 14. Quiz Questions
-- Each quiz contains one or more questions.
-- order_index controls the display sequence of questions.
-- explanation is shown to students during answer review.
CREATE TABLE quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question TEXT NOT NULL,
	score DECIMAL(5, 2) NOT NULL,
    explanation TEXT,
    order_index TINYINT UNSIGNED,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 15. Quiz Answers
-- Each question has multiple answer options, but only one correct option.
-- is_correct flags the correct answer among the options.
CREATE TABLE quiz_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    answer_text VARCHAR(500) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- 16. Quiz Attempts
-- Records each time a student attempts a quiz.
CREATE TABLE quiz_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score DECIMAL(5, 2) NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 17. Quiz Attempt Detail
-- Records which answer a student selected for each question in a quiz attempt.
-- selected_answer_id is NULL if the student skipped the question.
CREATE TABLE quiz_attempt_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer_id INT NULL DEFAULT NULL,
    UNIQUE KEY unique_attempt_question (attempt_id, question_id),
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id),
    FOREIGN KEY (selected_answer_id) REFERENCES quiz_answers(id)
);

-- 18. Quiz Feedback
-- Records feedback made by students on a quiz.
-- Unique constraint prevents multiple feedbacks from one student on a quiz.
CREATE TABLE quiz_feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    quiz_id INT NOT NULL,
    comment TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT unique_feedback_per_quiz UNIQUE (student_id, quiz_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);


-- ============================================================
-- SECTION 5: SCHEDULING
-- ============================================================

-- 19. Study Schedule
-- Stores the AI-generated study sessions for each student.
CREATE TABLE study_schedule (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    topic_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- 20. Important Events
-- Stores calendar events marked by the student
-- (exams, assignment deadlines, personal events).
CREATE TABLE important_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id  INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_type ENUM('exam', 'assignment', 'personal') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);


-- ============================================================
-- SECTION 6: PLATFORM MANAGEMENT
-- ============================================================

-- 21. Audit Logs
-- Append-only record of significant actions performed on the platform by admin.
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id)
);
