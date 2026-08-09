-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 09, 2026 at 11:10 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aquarius`
--
CREATE DATABASE IF NOT EXISTS `aquarius` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `aquarius`;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `admin_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `admin_id`) VALUES
(10, 'AD000001'),
(11, 'AD000002');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `performed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `admin_id`, `action`, `performed_at`) VALUES
(1, 10, 'Approved study material: Python Variables Slides', '2025-08-21 01:00:00'),
(2, 10, 'Approved study material: Control Flow Video', '2025-08-22 01:00:00'),
(3, 10, 'Approved quiz: Variables Quiz', '2025-09-02 00:30:00'),
(4, 11, 'Approved study material: ER Diagram Tutorial', '2025-08-26 02:00:00'),
(5, 11, 'Approved quiz: SQL Fundamentals Quiz', '2025-09-11 01:30:00'),
(6, 10, 'Rejected study material id 5 — missing transcript', '2025-08-25 03:00:00'),
(7, 11, 'Created user account for Dr. Raj Mehta', '2025-08-03 00:00:00'),
(8, 10, 'Created new student account: unjnkmklk, (abc@gmail.com)', '2026-08-05 01:54:32'),
(9, 10, 'Enrolled student ID 14 into course ID 3', '2026-08-05 01:54:55'),
(10, 10, 'Updated user account ID: 14', '2026-08-05 01:55:07'),
(11, 10, 'Deleted user account: unjnkmklk (ID: 14)', '2026-08-05 01:55:23'),
(12, 10, 'Regulated study material: Sorting Algorithms Video (ID: 5) to approved', '2026-08-05 01:55:58'),
(13, 10, 'Regulated quiz: Probability Basics Quiz (ID: 5) to flagged', '2026-08-05 01:58:09'),
(14, 10, 'Regulated quiz: Probability Basics Quiz (ID: 5) to flagged', '2026-08-05 01:58:09'),
(15, 10, 'Regulated study material: Test slide (ID: 13) to approved', '2026-08-07 07:48:49');

-- --------------------------------------------------------

--
-- Table structure for table `bookmarks`
--

CREATE TABLE `bookmarks` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `bookmarked_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookmarks`
--

INSERT INTO `bookmarks` (`id`, `student_id`, `material_id`, `bookmarked_at`) VALUES
(1, 2, 1, '2025-09-05 02:00:00'),
(2, 2, 2, '2025-09-06 03:00:00'),
(4, 4, 8, '2026-01-20 06:00:00'),
(5, 5, 1, '2026-01-21 07:00:00'),
(8, 3, 10, '2026-07-30 12:23:55'),
(9, 3, 9, '2026-07-30 13:25:45'),
(10, 3, 8, '2026-07-30 13:26:12'),
(11, 3, 7, '2026-07-30 13:26:40'),
(12, 3, 6, '2026-08-04 08:00:31'),
(24, 3, 3, '2026-08-07 12:10:00');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `lecturer_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `lecturer_id`, `created_at`) VALUES
(1, 'Introduction to Programming', 'Fundamentals of programming using Python.', 'LC000001', '2025-08-15 02:00:00'),
(2, 'Data Structures & Algorithms', 'Core data structures and algorithmic thinking.', 'LC000001', '2025-08-15 02:05:00'),
(3, 'Database Systems', 'Relational databases, SQL, and NoSQL concepts.', 'LC000002', '2025-08-16 01:00:00'),
(4, 'Statistics for Data Science', 'Probability, hypothesis testing, and regression.', 'LC000003', '2025-08-16 01:30:00'),
(5, 'Web Application Development', 'Full-stack web development with modern frameworks.', 'LC000002', '2025-08-17 03:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `enrollment`
--

CREATE TABLE `enrollment` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `status` enum('active','disenrolled') NOT NULL DEFAULT 'active',
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrollment`
--

INSERT INTO `enrollment` (`id`, `course_id`, `student_id`, `status`, `enrolled_at`) VALUES
(1, 1, 2, 'active', '2025-09-02 00:00:00'),
(2, 2, 2, 'active', '2025-09-02 00:05:00'),
(3, 3, 3, 'active', '2025-09-02 01:00:00'),
(4, 1, 3, 'active', '2025-09-02 01:05:00'),
(5, 4, 4, 'active', '2026-01-16 02:00:00'),
(6, 5, 4, 'active', '2026-01-16 02:10:00'),
(7, 1, 5, 'active', '2026-01-16 03:00:00'),
(8, 3, 5, 'disenrolled', '2026-01-16 03:05:00'),
(9, 4, 6, 'active', '2026-05-02 00:00:00'),
(10, 5, 6, 'active', '2026-05-02 00:10:00');

-- --------------------------------------------------------

--
-- Table structure for table `important_events`
--

CREATE TABLE `important_events` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `event_date` date NOT NULL,
  `event_type` enum('exam','assignment','personal') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `important_events`
--

INSERT INTO `important_events` (`id`, `student_id`, `title`, `event_date`, `event_type`, `created_at`) VALUES
(1, 2, 'Programming Midterm Exam', '2026-08-20', 'exam', '2025-09-15 01:00:00'),
(2, 2, 'Assignment 1 Deadline', '2026-07-05', 'assignment', '2025-09-20 02:00:00'),
(3, 3, 'Database Systems Final Exam', '2026-08-31', 'exam', '2025-10-01 00:00:00'),
(4, 4, 'Statistics Midterm', '2026-07-10', 'exam', '2026-02-01 01:00:00'),
(5, 5, 'Web Dev Project Submission', '2026-07-20', 'assignment', '2026-02-10 03:00:00'),
(6, 6, 'Statistics Assignment 2', '2026-07-15', 'assignment', '2026-05-20 00:00:00'),
(7, 2, 'Study Group Meeting', '2026-08-12', 'personal', '2025-10-01 04:00:00'),
(8, 3, 'CyberSecurity Exam', '2026-08-18', 'exam', '2026-08-02 07:44:39'),
(9, 3, 'Artificial Intelligence Exam', '2026-08-19', 'exam', '2026-08-02 07:57:19'),
(10, 3, 'Capstone Assignment', '2026-08-19', 'assignment', '2026-08-02 07:57:36'),
(11, 3, 'Dog Stacking Tournament', '2026-08-04', 'personal', '2026-08-04 09:28:59'),
(12, 3, 'SQL Revision', '2026-08-10', 'personal', '2026-08-07 14:19:48'),
(13, 3, 'Python Exam', '2026-08-23', 'exam', '2026-08-08 07:23:44');

-- --------------------------------------------------------

--
-- Table structure for table `lecturers`
--

CREATE TABLE `lecturers` (
  `id` int(11) NOT NULL,
  `lecturer_id` varchar(50) NOT NULL,
  `department` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lecturers`
--

INSERT INTO `lecturers` (`id`, `lecturer_id`, `department`) VALUES
(7, 'LC000001', 'Computer Science'),
(8, 'LC000002', 'Information Systems'),
(9, 'LC000003', 'Mathematics & Statistics');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `topic_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `duration_min` smallint(5) UNSIGNED DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `regulation_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `title`, `description`, `topic_id`, `created_by`, `duration_min`, `is_published`, `regulation_status`, `created_at`, `updated_at`) VALUES
(1, 'Variables Quiz', 'Test your understanding of Python variables.', 1, 7, 15, 1, 'approved', '2025-09-01 00:00:00', '2026-08-08 10:47:38'),
(2, 'Control Flow Quiz', 'Questions on loops and conditionals.', 2, 7, 20, 1, 'approved', '2025-09-05 00:00:00', '2025-09-06 00:00:00'),
(3, 'SQL Fundamentals Quiz', 'Basic SQL SELECT and JOIN questions.', 7, 8, 30, 1, 'approved', '2025-09-10 01:00:00', '2025-09-11 01:00:00'),
(4, 'Sorting Algorithms Quiz', 'Identify time complexity of sorting algorithms.', 5, 7, 20, 1, 'pending', '2025-09-15 02:00:00', '2025-09-15 02:00:00'),
(5, 'Probability Basics Quiz', 'Multiple-choice questions on distributions.', 9, 9, 25, 0, '', '2025-09-20 03:00:00', '2026-08-05 01:58:09'),
(6, 'sacabambaspis', 'sacabam', 4, 7, 15, 1, 'pending', '2026-08-06 01:17:56', '2026-08-06 01:17:56');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_answers`
--

CREATE TABLE `quiz_answers` (
  `id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer_text` varchar(500) NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_answers`
--

INSERT INTO `quiz_answers` (`id`, `question_id`, `answer_text`, `is_correct`) VALUES
(1, 1, 'var', 0),
(2, 1, 'let', 0),
(3, 1, 'No keyword required', 1),
(4, 1, 'dim', 0),
(5, 2, 'int', 0),
(6, 2, 'float', 1),
(7, 2, 'str', 0),
(8, 2, 'double', 0),
(9, 3, '2name', 0),
(10, 3, '_myVar', 1),
(11, 3, '1stValue', 0),
(12, 3, 'my-var', 0),
(13, 4, 'for loop', 0),
(14, 4, 'while loop', 1),
(15, 4, 'do-while', 0),
(16, 4, 'foreach', 0),
(17, 5, 'break', 0),
(18, 5, 'continue', 1),
(19, 5, 'pass', 0),
(20, 5, 'skip', 0),
(21, 6, '1 2 3', 0),
(22, 6, '0 1 2', 1),
(23, 6, '0 1 2 3', 0),
(24, 6, '1 2', 0),
(25, 7, 'WHERE', 0),
(26, 7, 'HAVING', 1),
(27, 7, 'FILTER', 0),
(28, 7, 'GROUP BY', 0),
(29, 8, 'INNER JOIN', 0),
(30, 8, 'LEFT JOIN', 0),
(31, 8, 'FULL OUTER JOIN', 1),
(32, 8, 'CROSS JOIN', 0),
(33, 9, 'UNIQUE', 0),
(34, 9, 'DISTINCT', 1),
(35, 9, 'FILTER', 0),
(36, 9, 'LIMIT', 0),
(37, 10, 'O(n²)', 0),
(38, 10, 'O(n log n)', 1),
(39, 10, 'O(log n)', 0),
(40, 10, 'O(n)', 0),
(41, 11, 'QuickSort', 0),
(42, 11, 'HeapSort', 0),
(43, 11, 'MergeSort', 1),
(44, 11, 'BubbleSort', 0),
(45, 12, 'The median', 0),
(46, 12, 'The mode', 0),
(47, 12, 'Equal to median and mode', 1),
(48, 12, 'Zero', 0),
(49, 13, 'Binomial', 0),
(50, 13, 'Normal', 0),
(51, 13, 'Poisson', 1),
(52, 13, 'Uniform', 0),
(53, 14, 'YES', 1),
(54, 14, 'NO', 0),
(55, 15, 'lemons', 1),
(56, 15, 'chocolate', 0);

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `completed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_attempts`
--

INSERT INTO `quiz_attempts` (`id`, `student_id`, `quiz_id`, `score`, `completed_at`) VALUES
(1, 2, 1, 3.00, '2026-07-10 02:30:00'),
(2, 2, 2, 2.50, '2026-07-12 03:00:00'),
(3, 3, 1, 2.00, '2026-07-10 06:00:00'),
(4, 3, 3, 5.00, '2026-07-15 07:00:00'),
(5, 4, 4, 2.50, '2026-07-22 01:00:00'),
(6, 5, 1, 3.00, '2026-06-23 02:00:00'),
(7, 5, 2, 2.00, '2026-07-24 03:00:00'),
(8, 3, 1, 0.00, '2026-08-04 08:47:59'),
(9, 3, 1, 3.00, '2026-08-04 09:09:02'),
(10, 3, 2, 3.00, '2026-08-04 09:14:55'),
(11, 3, 1, 0.00, '2026-08-06 11:02:24'),
(12, 3, 1, 0.00, '2026-08-06 11:06:13'),
(13, 3, 1, 0.00, '2026-08-06 11:10:39'),
(14, 3, 1, 3.00, '2026-08-06 11:11:44'),
(15, 3, 1, 3.00, '2026-08-06 11:16:00'),
(16, 3, 1, 0.00, '2026-08-06 11:18:05'),
(17, 3, 1, 3.00, '2026-08-06 11:18:28'),
(18, 3, 2, 3.00, '2026-08-06 11:21:52'),
(19, 3, 2, 3.00, '2026-08-06 11:27:01'),
(20, 3, 2, 3.00, '2026-08-06 11:57:25'),
(25, 3, 2, 3.00, '2026-08-06 12:06:52'),
(26, 3, 2, 3.00, '2026-08-06 12:07:08'),
(27, 3, 1, 0.00, '2026-08-07 13:25:40'),
(28, 3, 1, 0.00, '2026-08-07 13:25:40'),
(29, 3, 3, 4.00, '2026-08-07 13:52:09'),
(30, 3, 3, 2.00, '2026-08-07 13:53:35'),
(31, 3, 3, 4.00, '2026-08-07 13:53:43'),
(32, 3, 3, 6.00, '2026-08-07 13:55:05'),
(33, 3, 1, 3.00, '2026-08-07 18:14:39'),
(34, 3, 1, 1.00, '2026-08-08 10:14:54'),
(35, 3, 1, 3.00, '2026-08-08 10:42:07'),
(36, 3, 1, 1.00, '2026-08-08 10:45:04');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempt_details`
--

CREATE TABLE `quiz_attempt_details` (
  `id` int(11) NOT NULL,
  `attempt_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `selected_answer_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_attempt_details`
--

INSERT INTO `quiz_attempt_details` (`id`, `attempt_id`, `question_id`, `selected_answer_id`) VALUES
(1, 1, 1, 3),
(2, 1, 2, 6),
(3, 1, 3, 10),
(4, 2, 4, 14),
(5, 2, 5, 18),
(6, 2, 6, 23),
(7, 3, 1, 3),
(8, 3, 2, 5),
(9, 3, 3, 9),
(10, 4, 7, 26),
(11, 4, 8, 31),
(12, 4, 9, 34),
(13, 5, 10, 38),
(14, 5, 11, 43),
(15, 6, 1, 3),
(16, 6, 2, 6),
(17, 6, 3, 10),
(18, 7, 4, 14),
(19, 7, 5, 19),
(20, 7, 6, 21),
(21, 8, 1, NULL),
(22, 8, 2, NULL),
(23, 8, 3, NULL),
(24, 9, 1, 3),
(25, 9, 2, 6),
(26, 9, 3, 10),
(27, 10, 4, 14),
(28, 10, 5, 18),
(29, 10, 6, 22),
(30, 11, 1, NULL),
(31, 11, 2, NULL),
(32, 11, 3, NULL),
(33, 12, 1, NULL),
(34, 12, 2, NULL),
(35, 12, 3, NULL),
(36, 13, 1, NULL),
(37, 13, 2, NULL),
(38, 13, 3, NULL),
(39, 14, 1, 3),
(40, 14, 2, 6),
(41, 14, 3, 10),
(42, 15, 1, 3),
(43, 15, 2, 6),
(44, 15, 3, 10),
(45, 16, 1, NULL),
(46, 16, 2, NULL),
(47, 16, 3, NULL),
(48, 17, 1, 3),
(49, 17, 2, 6),
(50, 17, 3, 10),
(51, 18, 4, 14),
(52, 18, 5, 18),
(53, 18, 6, 22),
(54, 19, 4, 14),
(55, 19, 5, 18),
(56, 19, 6, 22),
(57, 20, 4, 14),
(58, 20, 5, 18),
(59, 20, 6, 22),
(72, 25, 4, 14),
(73, 25, 5, 18),
(74, 25, 6, 22),
(75, 26, 4, 14),
(76, 26, 5, 18),
(77, 26, 6, 22),
(78, 27, 1, 2),
(79, 27, 2, 7),
(80, 27, 3, 11),
(81, 28, 1, 2),
(82, 28, 2, 7),
(83, 28, 3, 11),
(84, 29, 7, 25),
(85, 29, 8, 31),
(86, 29, 9, 34),
(87, 30, 7, 25),
(88, 30, 8, 29),
(89, 30, 9, 34),
(90, 31, 7, 25),
(91, 31, 8, 31),
(92, 31, 9, 34),
(93, 32, 7, 26),
(94, 32, 8, 31),
(95, 32, 9, 34),
(96, 33, 1, 3),
(97, 33, 2, 6),
(98, 33, 3, 10),
(99, 34, 1, 3),
(100, 34, 2, 7),
(101, 34, 3, 11),
(102, 35, 1, 3),
(103, 35, 2, 6),
(104, 35, 3, 10),
(105, 36, 1, 3),
(106, 36, 2, 7),
(107, 36, 3, 11);

-- --------------------------------------------------------

--
-- Table structure for table `quiz_feedback`
--

CREATE TABLE `quiz_feedback` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_feedback`
--

INSERT INTO `quiz_feedback` (`id`, `student_id`, `quiz_id`, `comment`, `submitted_at`) VALUES
(1, 2, 1, 'Great quiz! Clear questions and well-paced.', '2025-09-10 03:00:00'),
(2, 2, 2, 'The loop questions were tricky but fair.', '2025-09-12 03:30:00'),
(3, 3, 1, 'Would love more questions on type conversion.', '2025-09-10 06:30:00'),
(4, 3, 3, 'SQL quiz was comprehensive. Enjoyed it.', '2025-09-15 07:30:00'),
(5, 5, 1, 'Good intro quiz for Python beginners.', '2026-01-23 02:30:00'),
(8, 3, 2, 'test update', '2026-08-06 12:06:52');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `explanation` text DEFAULT NULL,
  `order_index` tinyint(3) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_questions`
--

INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question`, `score`, `explanation`, `order_index`) VALUES
(1, 1, 'Which keyword declares a variable in Python?', 1.00, 'Python does not require a keyword; simply assign a value.', 1),
(2, 1, 'What is the data type of 3.14 in Python?', 1.00, 'Floating-point numbers are of type float.', 2),
(3, 1, 'Which of the following is a valid variable name in Python?', 1.00, 'Variable names cannot start with a digit.', 3),
(4, 2, 'Which loop is used when the number of iterations is unknown?', 1.00, 'A while loop continues while its condition is True.', 1),
(5, 2, 'What keyword skips the current iteration in a loop?', 1.00, 'continue skips to the next iteration.', 2),
(6, 2, 'What is the output of: for i in range(3): print(i)?', 1.00, 'range(3) produces 0, 1, 2.', 3),
(7, 3, 'Which SQL clause filters rows after aggregation?', 2.00, 'HAVING filters groups; WHERE filters rows.', 1),
(8, 3, 'What type of JOIN returns all rows from both tables?', 2.00, 'A FULL OUTER JOIN returns all rows from both sides.', 2),
(9, 3, 'Which keyword removes duplicate rows from a result set?', 2.00, 'DISTINCT eliminates duplicate rows.', 3),
(10, 4, 'What is the average time complexity of QuickSort?', 1.50, 'QuickSort averages O(n log n).', 1),
(11, 4, 'Which sort is stable and has O(n log n) in all cases?', 1.50, 'Merge Sort is stable and always O(n log n).', 2),
(12, 5, 'What is the mean of a normal distribution equal to?', 1.00, 'The mean equals the median in a symmetric normal distribution.', 1),
(13, 5, 'Which distribution models the number of events in a fixed interval?', 1.00, 'The Poisson distribution models event counts.', 2),
(14, 6, 'Have you fed your dog today', 5.00, 'maybe', 1),
(15, 6, 'What is the meaning of life', 5.00, 'mayhaps', 2);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `programme` varchar(255) DEFAULT NULL,
  `intake` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `student_id`, `programme`, `intake`) VALUES
(2, 'ST000002', 'Bachelor of Computer Science', '2025-09-01'),
(3, 'ST000003', 'Bachelor of Information Technology', '2025-09-01'),
(4, 'ST000004', 'Bachelor of Software Engineering', '2026-01-15'),
(5, 'ST000005', 'Bachelor of Computer Science', '2026-01-15'),
(6, 'ST000006', 'Diploma in Data Science', '2026-05-01');

-- --------------------------------------------------------

--
-- Table structure for table `student_availability`
--

CREATE TABLE `student_availability` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `available_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_availability`
--

INSERT INTO `student_availability` (`id`, `student_id`, `available_date`) VALUES
(1, 2, '2025-10-06'),
(2, 2, '2025-10-07'),
(3, 3, '2025-10-08'),
(4, 4, '2026-02-02'),
(5, 5, '2026-02-03'),
(6, 6, '2026-05-10'),
(7, 2, '2025-10-13');

-- --------------------------------------------------------

--
-- Table structure for table `study_materials`
--

CREATE TABLE `study_materials` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` enum('pdf','video','slides','document') NOT NULL,
  `topic_id` int(11) NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `regulation_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `study_materials`
--

INSERT INTO `study_materials` (`id`, `title`, `description`, `file_name`, `file_path`, `file_type`, `topic_id`, `uploaded_by`, `regulation_status`, `uploaded_at`) VALUES
(1, 'Python Variables Slides', 'Lecture slides for variables and data types.', 'python_vars.pptx', 'uploads/python_vars.pdf', 'slides', 1, 7, 'approved', '2025-08-20 02:00:00'),
(2, 'Control Flow Video', 'Video walkthrough of Python control flow.', 'control_flow.mp4', 'uploads/control_flow.mp4', 'video', 2, 7, 'approved', '2025-08-21 03:00:00'),
(3, 'Functions Cheat Sheet', 'Quick reference for Python functions.', 'functions_ref.pdf', 'uploads/function_ref.pdf', 'pdf', 3, 7, 'approved', '2025-08-22 01:00:00'),
(4, 'Linked Lists Document', 'Comprehensive notes on linked list operations.', 'linked_lists.docx', 'uploads/linked_lists.docx', 'document', 4, 7, 'approved', '2025-08-23 02:00:00'),
(5, 'Sorting Algorithms Video', 'Step-by-step visual explanation of sorting algorithms.', 'sorting_algo.mp4', 'uploads/sorting_algo.mp4', 'video', 5, 7, 'approved', '2025-08-24 04:00:00'),
(6, 'ER Diagram Tutorial', 'How to draw ER diagrams with examples.', 'er_diagram.pdf', 'uploads/er_diagram.pdf', 'pdf', 6, 8, 'approved', '2025-08-25 00:00:00'),
(7, 'SQL Query Practice Set', 'Practice SQL exercises with solutions.', 'sql_exercises.pdf', 'uploads/sql_exercises.pdf', 'pdf', 7, 8, 'approved', '2025-08-26 01:00:00'),
(8, 'Descriptive Stats Slides', 'Slides covering mean, median, and variance.', 'desc_stats.pptx', 'uploads/desc_stats.pptx', 'slides', 8, 9, 'approved', '2025-08-27 02:00:00'),
(9, 'Probability Distributions PDF', 'Detailed notes on key probability distributions.', 'prob_dist.pdf', 'uploads/prob_dist.pdf', 'pdf', 9, 9, 'approved', '2025-08-28 03:00:00'),
(10, 'HTML & CSS Starter Guide', 'Beginner guide to structuring web pages.', 'html_css_guide.pdf', 'uploads/html_css_guide.pdf', 'pdf', 10, 8, 'approved', '2025-08-29 01:00:00'),
(12, 'Recap 5', 'Recap 5 Lecture Slides', 'Recap 5.pptx', 'uploads/4efc7bc475dc4b2e2523811af7785d10.pptx', 'slides', 4, 7, 'pending', '2026-08-06 01:24:20');

-- --------------------------------------------------------

--
-- Table structure for table `study_material_prerequisites`
--

CREATE TABLE `study_material_prerequisites` (
  `id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `prerequisite_id` int(11) NOT NULL
) ;

--
-- Dumping data for table `study_material_prerequisites`
--

INSERT INTO `study_material_prerequisites` (`id`, `material_id`, `prerequisite_id`) VALUES
(1, 2, 1),
(6, 2, 8),
(2, 3, 2),
(3, 4, 1),
(4, 5, 4),
(5, 7, 6);

-- --------------------------------------------------------

--
-- Table structure for table `study_material_tags`
--

CREATE TABLE `study_material_tags` (
  `id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `study_material_tags`
--

INSERT INTO `study_material_tags` (`id`, `material_id`, `tag_id`) VALUES
(1, 1, 1),
(2, 1, 6),
(3, 2, 1),
(4, 3, 1),
(5, 4, 3),
(6, 5, 3),
(7, 5, 7),
(8, 6, 2),
(9, 7, 2),
(10, 10, 5);

-- --------------------------------------------------------

--
-- Table structure for table `study_schedule`
--

CREATE TABLE `study_schedule` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `topic_id` int(11) NOT NULL,
  `scheduled_date` date NOT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `study_schedule`
--

INSERT INTO `study_schedule` (`id`, `student_id`, `topic_id`, `scheduled_date`, `generated_at`) VALUES
(1, 2, 1, '2025-09-08', '2025-09-07 12:00:00'),
(2, 2, 2, '2025-09-15', '2025-09-07 12:01:00'),
(3, 2, 4, '2025-09-22', '2025-09-07 12:02:00'),
(4, 3, 6, '2026-09-09', '2025-09-08 11:00:00'),
(5, 3, 7, '2026-08-16', '2025-09-08 11:01:00'),
(6, 4, 8, '2026-01-17', '2026-01-16 12:00:00'),
(7, 5, 1, '2026-01-18', '2026-01-17 12:00:00'),
(8, 6, 9, '2026-05-03', '2026-05-02 11:00:00'),
(11, 3, 1, '2026-08-02', '2026-08-02 08:41:49'),
(12, 3, 1, '2026-08-04', '2026-08-04 09:18:21'),
(13, 3, 1, '2026-08-05', '2026-08-04 09:28:04'),
(14, 3, 7, '2026-08-06', '2026-08-04 09:28:04'),
(15, 3, 2, '2026-08-07', '2026-08-04 09:28:04'),
(16, 3, 3, '2026-08-08', '2026-08-04 09:28:04'),
(17, 3, 1, '2026-08-13', '2026-08-07 14:26:52'),
(18, 3, 7, '2026-08-14', '2026-08-07 14:26:52'),
(19, 3, 2, '2026-08-15', '2026-08-07 14:26:52'),
(20, 3, 1, '2026-08-20', '2026-08-08 07:04:13'),
(21, 3, 7, '2026-08-21', '2026-08-08 07:04:13'),
(22, 3, 2, '2026-08-22', '2026-08-08 07:04:13');

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`) VALUES
(7, 'Advanced'),
(3, 'Algorithms'),
(6, 'Beginner'),
(1, 'Python'),
(2, 'SQL'),
(4, 'Statistics'),
(5, 'Web');

-- --------------------------------------------------------

--
-- Table structure for table `topics`
--

CREATE TABLE `topics` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `order_index` tinyint(3) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `topics`
--

INSERT INTO `topics` (`id`, `course_id`, `title`, `description`, `order_index`) VALUES
(1, 1, 'Variables & Data Types', 'Understanding Python variables and primitive types.', 1),
(2, 1, 'Control Flow', 'If-else, loops, and logical operators.', 2),
(3, 1, 'Functions & Modules', 'Defining reusable functions and importing modules.', 3),
(4, 2, 'Arrays & Linked Lists', 'Linear data structures and their operations.', 1),
(5, 2, 'Sorting Algorithms', 'Bubble, merge, quick sort and complexity analysis.', 2),
(6, 3, 'ER Modelling', 'Entity-relationship diagrams and normalisation.', 1),
(7, 3, 'SQL Queries', 'SELECT, JOIN, GROUP BY and subqueries.', 2),
(8, 4, 'Descriptive Statistics', 'Mean, median, variance and visualisation.', 1),
(9, 4, 'Probability Distributions', 'Normal, binomial and Poisson distributions.', 2),
(10, 5, 'HTML & CSS Fundamentals', 'Structure and styling of web pages.', 1),
(11, 5, 'JavaScript Basics', 'DOM manipulation and event handling.', 2);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','lecturer','admin') NOT NULL,
  `last_access` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `last_access`, `created_at`, `updated_at`) VALUES
(2, 'Alice Nguyen', 'alice@mail.com', '$2y$12$qAithEk5E3EM2qwxfmt0feCdd8yCMV54yHacErjxFopNcX8Z30tH6', 'student', '2026-07-31 07:37:50', '2026-01-10 00:00:00', '2026-07-31 07:37:50'),
(3, 'Bob Tan', 'bob@mail.com', '$2y$12$.KeR2lDbKj0FMG5IDcSNSOpKtMl1yXYeEKq5LrMyYJkol9et5u0RS', 'student', '2026-08-08 06:31:47', '2026-01-10 00:05:00', '2026-08-08 06:31:47'),
(4, 'Clara Lee', 'clara@mail.com', '$2y$12$qAithEk5E3EM2qwxfmt0feCdd8yCMV54yHacErjxFopNcX8Z30tH6', 'student', '2026-07-22 06:00:00', '2026-01-11 01:00:00', '2026-07-31 07:52:37'),
(5, 'David Kim', 'david@mail.com', '$2y$12$qAithEk5E3EM2qwxfmt0feCdd8yCMV54yHacErjxFopNcX8Z30tH6', 'student', '2026-07-23 08:45:00', '2026-01-11 01:10:00', '2026-07-31 07:52:37'),
(6, 'Eva Patel', 'eva@mail.com', '$2y$12$qAithEk5E3EM2qwxfmt0feCdd8yCMV54yHacErjxFopNcX8Z30tH6', 'student', '2026-07-24 02:00:00', '2026-01-12 02:00:00', '2026-07-31 07:52:37'),
(7, 'Dr. James Wong', 'jwong@uni.edu', '$2y$12$qAithEk5E3EM2qwxfmt0feCdd8yCMV54yHacErjxFopNcX8Z30tH6', 'lecturer', '2026-08-06 01:10:00', '2025-07-31 23:00:00', '2026-08-06 01:10:00'),
(8, 'Prof. Sara Ali', 'sali@uni.edu', '$2y$12$qAithEk5E3EM2qwxfmt0feCdd8yCMV54yHacErjxFopNcX8Z30tH6', 'lecturer', '2026-08-07 18:46:10', '2025-07-31 23:15:00', '2026-08-07 18:46:10'),
(9, 'Dr. Raj Mehta', 'rmehta@uni.edu', '$2y$12$qAithEk5E3EM2qwxfmt0feCdd8yCMV54yHacErjxFopNcX8Z30tH6', 'lecturer', '2026-07-23 01:00:00', '2025-08-02 00:00:00', '2026-07-31 07:52:37'),
(10, 'Admin One', 'admin1@uni.edu', '$2y$12$qAithEk5E3EM2qwxfmt0feCdd8yCMV54yHacErjxFopNcX8Z30tH6', 'admin', '2026-08-07 18:47:09', '2025-06-30 22:00:00', '2026-08-07 18:47:09'),
(11, 'Admin Two', 'admin2@uni.edu', '$2y$12$qAithEk5E3EM2qwxfmt0feCdd8yCMV54yHacErjxFopNcX8Z30tH6', 'admin', '2026-07-25 10:00:00', '2025-06-30 22:30:00', '2026-07-31 07:52:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admin_id` (`admin_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_bookmark` (`student_id`,`material_id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lecturer_id` (`lecturer_id`);

--
-- Indexes for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_course_pair` (`student_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `important_events`
--
ALTER TABLE `important_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `lecturers`
--
ALTER TABLE `lecturers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lecturer_id` (`lecturer_id`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `topic_id` (`topic_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `quiz_answers`
--
ALTER TABLE `quiz_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`);

--
-- Indexes for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `quiz_id` (`quiz_id`);

--
-- Indexes for table `quiz_attempt_details`
--
ALTER TABLE `quiz_attempt_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attempt_question` (`attempt_id`,`question_id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `selected_answer_id` (`selected_answer_id`);

--
-- Indexes for table `quiz_feedback`
--
ALTER TABLE `quiz_feedback`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_feedback_per_quiz` (`student_id`,`quiz_id`),
  ADD KEY `quiz_id` (`quiz_id`);

--
-- Indexes for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_id` (`quiz_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`);

--
-- Indexes for table `student_availability`
--
ALTER TABLE `student_availability`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `study_materials`
--
ALTER TABLE `study_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `topic_id` (`topic_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `study_material_prerequisites`
--
ALTER TABLE `study_material_prerequisites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_material_prerequisite_pair` (`material_id`,`prerequisite_id`),
  ADD KEY `prerequisite_id` (`prerequisite_id`);

--
-- Indexes for table `study_material_tags`
--
ALTER TABLE `study_material_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_material_tag_pair` (`material_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Indexes for table `study_schedule`
--
ALTER TABLE `study_schedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `topic_id` (`topic_id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `topics`
--
ALTER TABLE `topics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `bookmarks`
--
ALTER TABLE `bookmarks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `important_events`
--
ALTER TABLE `important_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `quiz_answers`
--
ALTER TABLE `quiz_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `quiz_attempt_details`
--
ALTER TABLE `quiz_attempt_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- AUTO_INCREMENT for table `quiz_feedback`
--
ALTER TABLE `quiz_feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `student_availability`
--
ALTER TABLE `student_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `study_materials`
--
ALTER TABLE `study_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `study_material_prerequisites`
--
ALTER TABLE `study_material_prerequisites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `study_material_tags`
--
ALTER TABLE `study_material_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `study_schedule`
--
ALTER TABLE `study_schedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `topics`
--
ALTER TABLE `topics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`);

--
-- Constraints for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD CONSTRAINT `bookmarks_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookmarks_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `study_materials` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`lecturer_id`) ON DELETE SET NULL;

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `enrollment_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollment_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `important_events`
--
ALTER TABLE `important_events`
  ADD CONSTRAINT `important_events_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lecturers`
--
ALTER TABLE `lecturers`
  ADD CONSTRAINT `lecturers_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quizzes_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `lecturers` (`id`);

--
-- Constraints for table `quiz_answers`
--
ALTER TABLE `quiz_answers`
  ADD CONSTRAINT `quiz_answers_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_attempt_details`
--
ALTER TABLE `quiz_attempt_details`
  ADD CONSTRAINT `quiz_attempt_details_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_attempt_details_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`),
  ADD CONSTRAINT `quiz_attempt_details_ibfk_3` FOREIGN KEY (`selected_answer_id`) REFERENCES `quiz_answers` (`id`);

--
-- Constraints for table `quiz_feedback`
--
ALTER TABLE `quiz_feedback`
  ADD CONSTRAINT `quiz_feedback_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_feedback_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_availability`
--
ALTER TABLE `student_availability`
  ADD CONSTRAINT `student_availability_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `study_materials`
--
ALTER TABLE `study_materials`
  ADD CONSTRAINT `study_materials_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `study_materials_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `lecturers` (`id`);

--
-- Constraints for table `study_material_prerequisites`
--
ALTER TABLE `study_material_prerequisites`
  ADD CONSTRAINT `study_material_prerequisites_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `study_materials` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `study_material_prerequisites_ibfk_2` FOREIGN KEY (`prerequisite_id`) REFERENCES `study_materials` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `study_material_tags`
--
ALTER TABLE `study_material_tags`
  ADD CONSTRAINT `study_material_tags_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `study_materials` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `study_material_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `study_schedule`
--
ALTER TABLE `study_schedule`
  ADD CONSTRAINT `study_schedule_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `study_schedule_ibfk_2` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `topics`
--
ALTER TABLE `topics`
  ADD CONSTRAINT `topics_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
