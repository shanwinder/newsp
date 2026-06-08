-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Jun 08, 2026 at 01:56 AM
-- Server version: 8.0.40
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `new_learning_game`
--

-- --------------------------------------------------------

--
-- Table structure for table `classrooms`
--

CREATE TABLE `classrooms` (
  `id` int NOT NULL,
  `school_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `classroom_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grade_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'ป.4',
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `join_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classrooms`
--

INSERT INTO `classrooms` (`id`, `school_id`, `teacher_id`, `classroom_name`, `grade_level`, `academic_year`, `join_code`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'ป.4 โรงเรียนบ้านนาอุดม', 'ป.4', '2569', 'DEFAULT4', 'active', '2026-06-03 16:17:26', NULL),
(2, 2, 33, 'ห้องเรียน Demo ป.4', 'ป.4', '2569', 'DEMO4', 'active', '2026-06-03 16:17:26', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE `games` (
  `id` int NOT NULL,
  `code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `learning_topic` varchar(255) DEFAULT NULL,
  `instruction_html` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `games`
--

INSERT INTO `games` (`id`, `code`, `title`, `description`, `learning_topic`, `instruction_html`, `created_at`) VALUES
(1, 'logic', 'ตรรกะคัดแยก', 'ฝึกการคิดเชิงตรรกะและการจำแนกเงื่อนไข โดยแยกแยะเมล็ดพันธุ์ ปุ๋ย และวัชพืชให้ถูกต้องตามโจทย์', 'การใช้เหตุผลเชิงตรรกะ', '<div class=\"text-center\"><h4>ภารกิจฟาร์มแก้ปัญหา</h4><p>สังเกตเงื่อนไข แยกแยะข้อมูล และเลือกคำตอบอย่างมีเหตุผล</p></div>', '2026-03-03 19:33:20'),
(2, 'algorithm', 'เส้นทางเดินรถไถ', 'ฝึกการเรียงลำดับขั้นตอน โดยวางแผนคำสั่งให้รถไถเดินทางไปถึงเป้าหมายอย่างถูกต้อง', 'การเรียงลำดับขั้นตอน', '<div class=\"text-center\"><h4>ภารกิจฟาร์มแก้ปัญหา</h4><p>ช่วยกันวางแผนและเรียงบล็อกคำสั่งพารถไถเข้าเป้าหมาย</p></div>', '2026-03-03 19:33:20'),
(3, 'condition', 'ผู้จัดการฟาร์มอัจฉริยะ', 'ฝึกใช้เงื่อนไข If / Else / Else If เพื่อคัดแยกผลผลิตจากพืชผัก ผลไม้ และผลผลิตจากสัตว์ ด้วยระบบสายพานฟาร์มอัจฉริยะ', 'การใช้เงื่อนไข IF / ELSE', '<div class=\"text-center\"><h4>ผู้จัดการฟาร์มอัจฉริยะ</h4><p>ลากบล็อกเงื่อนไขและคำสั่งเพื่อคัดแยกผลผลิตจากพืชผัก ผลไม้ และผลผลิตจากสัตว์</p></div>', '2026-03-03 19:33:20'),
(4, 'debugging', 'ซ่อมกฎฟาร์มอัจฉริยะ', 'ฝึกตรวจสอบกฎที่ผิดพลาด ทดลองรันระบบ สังเกตผลลัพธ์ที่ผิด แล้วแก้ไขเงื่อนไขและคำสั่งให้ระบบฟาร์มทำงานถูกต้อง', 'การตรวจสอบและแก้ไขข้อผิดพลาด', '<div class=\"text-center\"><h4>ซ่อมกฎฟาร์มอัจฉริยะ</h4><p>ทดสอบระบบฟาร์ม หาเหตุที่ผิด แล้วซ่อมกฎให้ถูกต้อง</p></div>', '2026-03-03 19:33:20');

-- --------------------------------------------------------

--
-- Table structure for table `game_logs`
--

CREATE TABLE `game_logs` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `stage_id` int NOT NULL,
  `action` enum('start','submit','hint','pass','fail') NOT NULL,
  `detail` text,
  `logged_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `school_id` int DEFAULT NULL,
  `classroom_id` int DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  `learning_session_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `game_logs`
--

INSERT INTO `game_logs` (`id`, `user_id`, `stage_id`, `action`, `detail`, `logged_at`, `school_id`, `classroom_id`, `teacher_id`, `learning_session_id`) VALUES
(86, 32, 1, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 1, Time: 102 s, Attempts: 8', '2026-03-06 07:28:25', 1, 1, 1, 1),
(87, 18, 1, 'pass', 'Mode: group, Role: member (คนกดส่งงาน), Score: 3, Time: 15 s, Attempts: 1', '2026-04-03 23:39:54', 1, 1, 1, 1),
(88, 31, 1, 'pass', 'Mode: group, Role: member, Score: 3, Time: 15 s, Attempts: 1', '2026-04-03 23:39:54', 1, 1, 1, 1),
(89, 18, 2, 'pass', 'Mode: group, Role: member (คนกดส่งงาน), Score: 1, Time: 33 s, Attempts: 3', '2026-04-03 23:40:36', 1, 1, 1, 1),
(90, 31, 2, 'pass', 'Mode: group, Role: member, Score: 1, Time: 33 s, Attempts: 3', '2026-04-03 23:40:36', 1, 1, 1, 1),
(91, 18, 3, 'pass', 'Mode: group, Role: member (คนกดส่งงาน), Score: 2, Time: 27 s, Attempts: 3', '2026-04-03 23:41:12', 1, 1, 1, 1),
(92, 31, 3, 'pass', 'Mode: group, Role: member, Score: 2, Time: 27 s, Attempts: 3', '2026-04-03 23:41:12', 1, 1, 1, 1),
(93, 18, 4, 'pass', 'Mode: group, Role: member (คนกดส่งงาน), Score: 2, Time: 148 s, Attempts: 5', '2026-04-04 14:29:21', 1, 1, 1, 1),
(94, 31, 4, 'pass', 'Mode: group, Role: member, Score: 2, Time: 148 s, Attempts: 5', '2026-04-04 14:29:21', 1, 1, 1, 1),
(95, 18, 4, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 131 s, Attempts: 4', '2026-04-07 08:49:48', 1, 1, 1, 1),
(96, 34, 7, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 1, Time: 63 s, Attempts: 1', '2026-06-03 15:44:46', 2, 2, 33, 2),
(97, 34, 10, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 1, Time: 94 s, Attempts: 4', '2026-06-03 15:47:32', 2, 2, 33, 2),
(98, 34, 4, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 47 s, Attempts: 3', '2026-06-03 15:50:01', 2, 2, 33, 2),
(99, 34, 5, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 2, Time: 147 s, Attempts: 2', '2026-06-03 15:52:35', 2, 2, 33, 2),
(100, 34, 6, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 2, Time: 389 s, Attempts: 2', '2026-06-03 15:59:13', 2, 2, 33, 2),
(101, 34, 4, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 220 s, Attempts: 3', '2026-06-03 17:31:30', 2, 2, 33, 2),
(102, 34, 4, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 66 s, Attempts: 3', '2026-06-03 18:59:44', 2, 2, 33, 2),
(103, 34, 5, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 2, Time: 82 s, Attempts: 4', '2026-06-03 19:01:17', 2, 2, 33, 2),
(104, 34, 6, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 97 s, Attempts: 3', '2026-06-03 19:03:02', 2, 2, 33, 2),
(105, 34, 1, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 1, Time: 17 s, Attempts: 5', '2026-06-03 19:25:30', 2, 2, 33, 2),
(106, 34, 2, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 21 s, Attempts: 0', '2026-06-03 19:26:22', 2, 2, 33, 2),
(107, 34, 3, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 29 s, Attempts: 1', '2026-06-03 19:27:08', 2, 2, 33, 2),
(108, 34, 4, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 32 s, Attempts: 3', '2026-06-04 14:43:21', 2, 2, 33, 2),
(109, 34, 6, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 77 s, Attempts: 3', '2026-06-04 16:19:43', 2, 2, 33, 2),
(110, 34, 7, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 2, Time: 130 s, Attempts: 1', '2026-06-05 05:04:27', 2, 2, 33, 2),
(111, 34, 7, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 2, Time: 114 s, Attempts: 1', '2026-06-05 09:42:24', 2, 2, 33, 2),
(112, 34, 7, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 180 s, Attempts: 1', '2026-06-05 14:40:26', 2, 2, 33, 2),
(113, 34, 8, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 1, Time: 2415 s, Attempts: 5', '2026-06-05 15:20:49', 2, 2, 33, 2),
(114, 34, 9, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 1011 s, Attempts: 4', '2026-06-05 15:37:52', 2, 2, 33, 2),
(115, 34, 7, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 325 s, Attempts: 3', '2026-06-06 06:13:07', 2, 2, 33, 2),
(116, 34, 8, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 427 s, Attempts: 3', '2026-06-06 06:20:25', 2, 2, 33, 2),
(117, 34, 7, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 413 s, Attempts: 3', '2026-06-06 11:30:32', 2, 2, 33, 2),
(118, 34, 9, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 318 s, Attempts: 3', '2026-06-06 12:08:22', 2, 2, 33, 2),
(119, 34, 7, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 461 s, Attempts: 3', '2026-06-06 15:03:38', 2, 2, 33, 2),
(120, 34, 8, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 300 s, Attempts: 3', '2026-06-06 15:08:48', 2, 2, 33, 2),
(121, 34, 9, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 222 s, Attempts: 3', '2026-06-06 15:12:38', 2, 2, 33, 2),
(122, 34, 10, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 1, Time: 331 s, Attempts: 3', '2026-06-07 02:16:37', 2, 2, 33, 2),
(123, 34, 10, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 2, Time: 234 s, Attempts: 4', '2026-06-07 02:50:17', 2, 2, 33, 2),
(124, 34, 10, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 2, Time: 151 s, Attempts: 8', '2026-06-07 04:27:00', 2, 2, 33, 2),
(125, 34, 10, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 2, Time: 503 s, Attempts: 6, Detail: {\"game_id\":4,\"stage_id\":10,\"level_ids\":[\"10-1\",\"10-2\",\"10-3\"],\"bug_types\":[\"order\",\"direction\",\"missing_step\"],\"wrong_targets\":0,\"wrong_fixes\":0,\"hints_used\":1}', '2026-06-07 09:07:48', 2, 2, 33, 2),
(126, 34, 5, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 49 s, Attempts: 3', '2026-06-07 10:26:05', 2, 2, 33, 2),
(127, 34, 10, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 248 s, Attempts: 3, Detail: {\"mode\":\"conveyor_debug\",\"average_score\":96,\"level_scores\":[100,96,92],\"total_correct\":16,\"total_items\":16}', '2026-06-07 10:53:03', 2, 2, 33, 2),
(128, 34, 11, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 252 s, Attempts: 3, Detail: {\"mode\":\"conveyor_debug\",\"average_score\":96,\"level_scores\":[100,96,92],\"total_correct\":15,\"total_items\":15}', '2026-06-07 14:30:47', 2, 2, 33, 2),
(129, 34, 12, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 278 s, Attempts: 3, Detail: {\"mode\":\"conveyor_debug\",\"average_score\":96,\"level_scores\":[100,96,92],\"total_correct\":16,\"total_items\":16}', '2026-06-07 17:02:11', 2, 2, 33, 2);

-- --------------------------------------------------------

--
-- Table structure for table `learning_sessions`
--

CREATE TABLE `learning_sessions` (
  `id` int NOT NULL,
  `school_id` int NOT NULL,
  `classroom_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `session_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_status` enum('active','paused') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `navigation_status` enum('locked','unlocked') COLLATE utf8mb4_unicode_ci DEFAULT 'locked',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('active','closed','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `learning_sessions`
--

INSERT INTO `learning_sessions` (`id`, `school_id`, `classroom_id`, `teacher_id`, `session_name`, `class_status`, `navigation_status`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'รอบการเรียนรู้หลัก', 'active', 'unlocked', NULL, NULL, 'active', '2026-06-03 16:17:26', NULL),
(2, 2, 2, 33, 'รอบทดลองใช้ Demo', 'active', 'unlocked', NULL, NULL, 'active', '2026-06-03 16:17:26', '2026-06-03 16:19:50');

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `stage_id` int NOT NULL,
  `score` int DEFAULT '0' COMMENT 'จำนวนดาวที่ได้ (0-3)',
  `duration_seconds` int DEFAULT '0' COMMENT 'เวลาที่ใช้เล่น (วินาที)',
  `attempts` int DEFAULT '1' COMMENT 'จำนวนครั้งที่เล่น',
  `completed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `school_id` int DEFAULT NULL,
  `classroom_id` int DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  `learning_session_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `progress`
--

INSERT INTO `progress` (`id`, `user_id`, `stage_id`, `score`, `duration_seconds`, `attempts`, `completed_at`, `school_id`, `classroom_id`, `teacher_id`, `learning_session_id`) VALUES
(1, 32, 1, 1, 102, 8, '2026-03-06 14:28:25', 1, 1, 1, 1),
(2, 18, 1, 3, 15, 1, '2026-04-04 06:39:54', 1, 1, 1, 1),
(3, 31, 1, 3, 15, 1, '2026-04-04 06:39:54', 1, 1, 1, 1),
(4, 18, 2, 1, 33, 3, '2026-04-04 06:40:36', 1, 1, 1, 1),
(5, 31, 2, 1, 33, 3, '2026-04-04 06:40:36', 1, 1, 1, 1),
(6, 18, 3, 2, 27, 3, '2026-04-04 06:41:12', 1, 1, 1, 1),
(7, 31, 3, 2, 27, 3, '2026-04-04 06:41:12', 1, 1, 1, 1),
(8, 18, 4, 3, 131, 4, '2026-04-07 15:49:48', 1, 1, 1, 1),
(9, 31, 4, 2, 148, 5, '2026-04-04 21:29:21', 1, 1, 1, 1),
(11, 34, 1, 3, 17, 5, '2026-06-04 02:25:30', 2, 2, 33, 2),
(12, 34, 7, 3, 461, 3, '2026-06-06 22:03:38', 2, 2, 33, 2),
(13, 34, 10, 3, 248, 3, '2026-06-07 17:53:03', 2, 2, 33, 2),
(14, 34, 4, 3, 32, 3, '2026-06-04 21:43:21', 2, 2, 33, 2),
(15, 34, 5, 3, 49, 3, '2026-06-07 17:26:05', 2, 2, 33, 2),
(16, 34, 6, 3, 77, 3, '2026-06-04 23:19:43', 2, 2, 33, 2),
(22, 34, 2, 3, 21, 0, '2026-06-04 02:26:22', 2, 2, 33, 2),
(23, 34, 3, 3, 29, 1, '2026-06-04 02:27:08', 2, 2, 33, 2),
(29, 34, 8, 3, 300, 3, '2026-06-06 22:08:48', 2, 2, 33, 2),
(30, 34, 9, 3, 222, 3, '2026-06-06 22:12:38', 2, 2, 33, 2),
(44, 34, 11, 3, 252, 3, '2026-06-07 21:30:47', 2, 2, 33, 2),
(45, 34, 12, 3, 278, 3, '2026-06-08 00:02:11', 2, 2, 33, 2);

-- --------------------------------------------------------

--
-- Table structure for table `project_likes`
--

CREATE TABLE `project_likes` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `work_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `school_id` int DEFAULT NULL,
  `classroom_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project_likes`
--

INSERT INTO `project_likes` (`id`, `user_id`, `work_id`, `created_at`, `school_id`, `classroom_id`) VALUES
(2, 18, 1, '2026-04-04 01:32:52', NULL, NULL),
(3, 34, 4, '2026-06-07 01:36:39', 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

CREATE TABLE `schools` (
  `id` int NOT NULL,
  `school_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `school_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `affiliation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schools`
--

INSERT INTO `schools` (`id`, `school_code`, `school_name`, `district`, `province`, `affiliation`, `contact_name`, `contact_email`, `contact_phone`, `status`, `created_at`, `updated_at`) VALUES
(1, 'DEFAULT', 'โรงเรียนบ้านนาอุดม', NULL, 'มุกดาหาร', 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษามุกดาหาร', 'ครูผู้สอน', NULL, NULL, 'approved', '2026-06-03 16:17:26', NULL),
(2, 'DEMO', 'โรงเรียน Demo สำหรับทดลองใช้', 'เมือง', 'มุกดาหาร', 'OBEC Content Center Demo', 'ครูทดลอง', NULL, NULL, 'approved', '2026-06-03 16:17:26', '2026-06-04 00:59:53');

-- --------------------------------------------------------

--
-- Table structure for table `stages`
--

CREATE TABLE `stages` (
  `id` int NOT NULL,
  `game_id` int NOT NULL,
  `stage_number` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `instruction` text,
  `content_json` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stages`
--

INSERT INTO `stages` (`id`, `game_id`, `stage_number`, `title`, `instruction`, `content_json`) VALUES
(1, 1, 1, 'แยกแยะเมล็ดพันธุ์', 'สังเกตและลากเมล็ดพันธุ์ข้าวที่สมบูรณ์ลงในตะกร้า', NULL),
(2, 1, 2, 'จัดหมวดหมู่ปุ๋ย', 'แยกประเภทปุ๋ยอินทรีย์และเคมีตามสีของกระสอบให้ถูกต้อง', NULL),
(3, 1, 3, 'นักคัดกรองวัชพืช', 'มองหาและกำจัดวัชพืชที่ซ่อนตัวอยู่แปลงผักตามเงื่อนไขที่กำหนด', NULL),
(4, 2, 1, 'เดินหน้าสู่แปลงนา', 'ต่อบล็อกคำสั่งเดินหน้า เพื่อพารถไถไปถึงแปลงนาที่กำหนด', NULL),
(5, 2, 2, 'หลบหลีกกองฟาง', 'เขียนคำสั่งให้รถไถเดินและเลี้ยวหลบกองฟางหรือก้อนหินไปให้ถึงเป้าหมาย', NULL),
(6, 2, 3, 'เก็บเกี่ยวผลผลิต', 'วางแผนเส้นทางให้รถไถเก็บผลผลิตครบทุกจุด แล้วกลับถึงโรงนา', NULL),
(7, 3, 1, 'โรงคัดผักสวนครัว', 'เกมที่ 1 ฝึกใช้ If เพื่อจับเงื่อนไขพิเศษของผลผลิตจากพืชผัก', NULL),
(8, 3, 2, 'โรงคัดผลไม้แสนอร่อย', 'เกมที่ 2 ฝึกใช้ If / Else เพื่อแยกผลไม้เป็น 2 เส้นทาง', NULL),
(9, 3, 3, 'โรงคัดผลผลิตจากฟาร์มสัตว์', 'เกมที่ 3 ฝึกใช้ If / Else If / Else เพื่อคัดเกรดผลผลิตหลายระดับ', NULL),
(10, 4, 1, 'ซ่อมกฎ IF', 'ตรวจและแก้กฎแบบ ถ้า...แล้ว... ผ่านภารกิจแครอทเปื้อนโคลน ผักกาดมีหนอน และมันฝรั่งงอก', NULL),
(11, 4, 2, 'ซ่อมกฎ IF / ELSE', 'ตรวจและแก้กฎแบบ ถ้า...มิฉะนั้น... ผ่านภารกิจส้มใหญ่ / ส้มเล็ก กล้วยสุก / กล้วยดิบ และแตงโมเกรดดี / แปรรูป', NULL),
(12, 4, 3, 'ซ่อมกฎ IF / ELSE IF / ELSE', 'ตรวจและแก้กฎหลายเงื่อนไข ผ่านภารกิจคัดเกรดไข่ไก่ คัดคุณภาพขนแกะ และตรวจคุณภาพน้ำนม', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_works`
--

CREATE TABLE `student_works` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `game_id` int NOT NULL,
  `work_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'เก็บพิกัด JSON',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'คำอธิบายของเด็ก',
  `status` enum('pending','submitted','reviewed','revision') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `school_id` int DEFAULT NULL,
  `classroom_id` int DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  `learning_session_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_works`
--

INSERT INTO `student_works` (`id`, `user_id`, `game_id`, `work_data`, `description`, `status`, `feedback`, `submitted_at`, `school_id`, `classroom_id`, `teacher_id`, `learning_session_id`) VALUES
(1, 18, 1, '[{\"type\":\"bug_red\",\"x\":381,\"y\":335,\"role\":\"target\"},{\"type\":\"bug_blue\",\"x\":655,\"y\":79,\"role\":\"decoy\"},{\"type\":\"fert_green_bag\",\"x\":605,\"y\":306,\"role\":\"target\"},{\"type\":\"fert_red_bag\",\"x\":171,\"y\":314,\"role\":\"decoy\"},{\"type\":\"newseed\",\"x\":357,\"y\":170,\"role\":\"target\"}]', '[ฉากหลัง: farm]\n\nแค่ทดสอบ 3', 'reviewed', 'ไม่ได้เรื่อง', '2026-04-04 08:31:49', 1, 1, 1, 1),
(2, 34, 1, '[{\"type\":\"bug_red\",\"x\":380,\"y\":220,\"role\":\"target\"},{\"type\":\"bug_blue\",\"x\":560,\"y\":230,\"role\":\"decoy\"},{\"type\":\"newseed\",\"x\":240,\"y\":300,\"role\":\"target\"}]', '[ฉากหลัง: v_garden]\n\nโจทย์ Demo: คลิกเฉพาะเป้าหมายที่ตรงตามเงื่อนไข แล้วอธิบายเหตุผลอย่างเป็นขั้นตอน', 'submitted', 'ตัวอย่างชิ้นงานผ่านการตรวจแล้ว', '2026-06-04 02:52:22', 2, 2, 33, 2),
(3, 34, 2, '{\"project_type\":\"tractor_route\",\"mission_type\":\"target\",\"grid\":{\"cols\":6,\"rows\":5},\"start\":{\"col\":0,\"row\":0},\"target\":{\"col\":5,\"row\":4},\"barn\":null,\"obstacles\":[{\"col\":1,\"row\":3,\"type\":\"hay\"},{\"col\":2,\"row\":2,\"type\":\"rock\"},{\"col\":3,\"row\":2,\"type\":\"rock\"},{\"col\":3,\"row\":1,\"type\":\"rock\"},{\"col\":2,\"row\":1,\"type\":\"rock\"}],\"crops\":[],\"commands\":[\"RIGHT\",\"RIGHT\",\"RIGHT\",\"RIGHT\",\"RIGHT\",\"DOWN\",\"DOWN\",\"DOWN\",\"DOWN\"],\"validated\":true}', '[ประเภทภารกิจ: ไปถึงจุดหมาย]\n\nทดสอบจ้า', 'reviewed', 'gpujp,', '2026-06-04 23:26:57', 2, 2, 33, 2),
(4, 34, 3, '{\"project_type\":\"smart_farm_mini_game\",\"game_id\":3,\"builder_version\":\"2.0\",\"logic_type\":\"if\",\"mode\":\"single_action_if\",\"theme\":\"vegetables\",\"themeLabel\":\"วัตถุเกม If\",\"title\":\"แครอท\",\"mission\":\"คัดแครอท\",\"instruction\":\"ดูรอย\",\"items\":[{\"uid\":\"sf_mq341ail_shpaxp\",\"catalogId\":\"carrot_muddy\",\"id\":\"carrot_muddy\",\"label\":\"แครอทเปื้อนโคลน\",\"fallbackIcon\":\"🥕\",\"theme\":\"vegetables\",\"props\":{\"type\":\"carrot\",\"muddy\":true,\"color\":\"orange\",\"mark\":\"mud\"},\"propsDisplay\":[\"ชนิด: แครอท\",\"คราบโคลน: มี\"],\"conditionId\":\"muddy_carrot\",\"conditionLabel\":\"แครอทเปื้อนโคลน\",\"conditionProps\":{\"type\":\"carrot\",\"muddy\":true},\"correctAction\":\"wash\",\"matchesCondition\":true,\"correctResult\":\"wash\",\"expectedRuleBranch\":\"if\",\"isDecoy\":false,\"isAutoDecoy\":false,\"sourceCatalogId\":null,\"decoyVariant\":null,\"decoyReason\":\"\",\"explain\":\"แครอทเปื้อนโคลน เข้าเงื่อนไขพิเศษ จึงควรส่งเข้าเครื่องล้าง\"},{\"uid\":\"sf_mq341b66_143dpu\",\"catalogId\":\"carrot_clean\",\"id\":\"carrot_clean\",\"label\":\"แครอทสะอาด\",\"fallbackIcon\":\"🥕\",\"theme\":\"vegetables\",\"props\":{\"type\":\"carrot\",\"muddy\":false,\"color\":\"orange\",\"mark\":\"none\"},\"propsDisplay\":[\"ชนิด: แครอท\",\"คราบโคลน: ไม่มี\"],\"conditionId\":\"clean_carrot\",\"conditionLabel\":\"แครอทสะอาด\",\"conditionProps\":{\"type\":\"carrot\",\"muddy\":false},\"correctAction\":\"pass_through\",\"matchesCondition\":false,\"correctResult\":\"pass_through\",\"expectedRuleBranch\":\"pass_through\",\"isDecoy\":true,\"isAutoDecoy\":false,\"sourceCatalogId\":null,\"decoyVariant\":null,\"decoyReason\":\"แครอทสะอาด เป็นตัวหลอกหรือกลุ่มอื่นที่ต้องระวัง ไม่เข้าเงื่อนไขพิเศษ จึงควรปล่อยผ่านอัตโนมัติ\",\"explain\":\"แครอทสะอาด เป็นตัวหลอกหรือกลุ่มอื่นที่ต้องระวัง ไม่เข้าเงื่อนไขพิเศษ จึงควรปล่อยผ่านอัตโนมัติ\"},{\"uid\":\"sf_mq341bts_g5zpa7\",\"catalogId\":\"carrot_dark\",\"id\":\"carrot_dark\",\"label\":\"แครอทสีเข้ม\",\"fallbackIcon\":\"🥕\",\"theme\":\"vegetables\",\"props\":{\"type\":\"carrot\",\"muddy\":false,\"color\":\"dark_orange\",\"mark\":\"none\"},\"propsDisplay\":[\"ชนิด: แครอท\",\"สี: เข้ม\",\"คราบโคลน: ไม่มี\"],\"conditionId\":\"dark_carrot\",\"conditionLabel\":\"แครอทสีเข้ม\",\"conditionProps\":{\"type\":\"carrot\",\"color\":\"dark_orange\"},\"correctAction\":\"pass_through\",\"matchesCondition\":false,\"correctResult\":\"pass_through\",\"expectedRuleBranch\":\"pass_through\",\"isDecoy\":true,\"isAutoDecoy\":false,\"sourceCatalogId\":null,\"decoyVariant\":null,\"decoyReason\":\"แครอทสีเข้ม เป็นตัวหลอกหรือกลุ่มอื่นที่ต้องระวัง ไม่เข้าเงื่อนไขพิเศษ จึงควรปล่อยผ่านอัตโนมัติ\",\"explain\":\"แครอทสีเข้ม เป็นตัวหลอกหรือกลุ่มอื่นที่ต้องระวัง ไม่เข้าเงื่อนไขพิเศษ จึงควรปล่อยผ่านอัตโนมัติ\"},{\"uid\":\"sf_mq341ccs_rjxp3x\",\"catalogId\":\"carrot_dust_tip\",\"id\":\"carrot_dust_tip\",\"label\":\"แครอทมีดินติดปลาย\",\"fallbackIcon\":\"🥕\",\"theme\":\"vegetables\",\"props\":{\"type\":\"carrot\",\"muddy\":false,\"color\":\"orange\",\"mark\":\"dust_tip\"},\"propsDisplay\":[\"ชนิด: แครอท\",\"ดินติดปลาย: เล็กน้อย\"],\"conditionId\":\"carrot_dust_tip\",\"conditionLabel\":\"แครอทมีดินติดปลาย\",\"conditionProps\":{\"type\":\"carrot\",\"mark\":\"dust_tip\"},\"correctAction\":\"pass_through\",\"matchesCondition\":false,\"correctResult\":\"pass_through\",\"expectedRuleBranch\":\"pass_through\",\"isDecoy\":true,\"isAutoDecoy\":false,\"sourceCatalogId\":null,\"decoyVariant\":null,\"decoyReason\":\"แครอทมีดินติดปลาย เป็นตัวหลอกหรือกลุ่มอื่นที่ต้องระวัง ไม่เข้าเงื่อนไขพิเศษ จึงควรปล่อยผ่านอัตโนมัติ\",\"explain\":\"แครอทมีดินติดปลาย เป็นตัวหลอกหรือกลุ่มอื่นที่ต้องระวัง ไม่เข้าเงื่อนไขพิเศษ จึงควรปล่อยผ่านอัตโนมัติ\"},{\"uid\":\"sf_mq341dlp_ghg3mx\",\"catalogId\":\"carrot_shadow\",\"id\":\"carrot_shadow\",\"label\":\"แครอทมีเงาสีน้ำตาล\",\"fallbackIcon\":\"🥕\",\"theme\":\"vegetables\",\"props\":{\"type\":\"carrot\",\"muddy\":false,\"color\":\"orange\",\"mark\":\"shadow\"},\"propsDisplay\":[\"ชนิด: แครอท\",\"รอยที่เห็น: เงาจากแสง\"],\"conditionId\":\"carrot_shadow\",\"conditionLabel\":\"แครอทมีเงาสีน้ำตาล\",\"conditionProps\":{\"type\":\"carrot\",\"mark\":\"shadow\"},\"correctAction\":\"pass_through\",\"matchesCondition\":false,\"correctResult\":\"pass_through\",\"expectedRuleBranch\":\"pass_through\",\"isDecoy\":true,\"isAutoDecoy\":false,\"sourceCatalogId\":null,\"decoyVariant\":null,\"decoyReason\":\"แครอทมีเงาสีน้ำตาล เป็นตัวหลอกหรือกลุ่มอื่นที่ต้องระวัง ไม่เข้าเงื่อนไขพิเศษ จึงควรปล่อยผ่านอัตโนมัติ\",\"explain\":\"แครอทมีเงาสีน้ำตาล เป็นตัวหลอกหรือกลุ่มอื่นที่ต้องระวัง ไม่เข้าเงื่อนไขพิเศษ จึงควรปล่อยผ่านอัตโนมัติ\"}],\"conditions\":[{\"id\":\"muddy_carrot\",\"label\":\"แครอทเปื้อนโคลน\",\"type\":\"match\",\"props\":{\"type\":\"carrot\",\"muddy\":true},\"match\":{\"type\":\"carrot\",\"muddy\":true}}],\"actions\":[{\"id\":\"wash\",\"label\":\"ส่งเข้าเครื่องล้าง\",\"destination\":\"เครื่องล้าง\",\"icon\":\"🚿\"},{\"id\":\"pest_table\",\"label\":\"ส่งไปโต๊ะตรวจศัตรูพืช\",\"destination\":\"โต๊ะตรวจ\",\"icon\":\"🔎\"},{\"id\":\"special_sort\",\"label\":\"ส่งไปคัดแยกพิเศษ\",\"destination\":\"คัดแยกพิเศษ\",\"icon\":\"⚠️\"}],\"rules\":[{\"type\":\"if\",\"condition\":\"muddy_carrot\",\"action\":\"wash\"}],\"condition\":{\"id\":\"muddy_carrot\",\"label\":\"แครอทเปื้อนโคลน\",\"type\":\"match\",\"props\":{\"type\":\"carrot\",\"muddy\":true},\"match\":{\"type\":\"carrot\",\"muddy\":true}},\"special_action\":{\"id\":\"wash\",\"label\":\"ส่งเข้าเครื่องล้าง\",\"destination\":\"เครื่องล้าง\",\"icon\":\"🚿\"},\"default_behavior\":{\"type\":\"pass_through\",\"label\":\"ปล่อยผ่านอัตโนมัติ\"},\"previewBar\":{\"clickable\":true,\"showDecoyHintBeforePlay\":true,\"showAnswerAfterPlay\":true},\"builder_assistance\":{\"used_auto_fill\":false,\"auto_fill_count\":0},\"qualityCheck\":{\"balancedBranches\":true,\"hasGoodDecoys\":true,\"usesAllDestinations\":false,\"diverseItems\":false,\"branchCounts\":{\"if\":1,\"else_if\":0,\"else\":0,\"pass_through\":4},\"warnings\":[\"ยังมีปลายทางบางจุดที่ไม่มีวัตถุใดควรไปถึง\",\"วัตถุชนิดเดียวกันมีมากเกินไป ลองเพิ่มชนิดอื่นเพื่อให้ด่านน่าสังเกตขึ้น\"]},\"testResult\":{\"tested\":true,\"correct\":5,\"total\":5,\"accuracy\":1,\"stars\":3,\"lastTestAt\":\"2026-06-07T17:05:14.245Z\"}}', 'แครอท\n\nคัดแครอท\n\nดูรอย', 'submitted', NULL, '2026-06-08 00:05:17', 2, 2, 33, 2),
(5, 34, 4, '{\"project_type\":\"smart_farm_debug_lite_challenge\",\"game_id\":4,\"builder_version\":\"2.0\",\"title\":\"แครอทเลอะไม่ถูกล้าง\",\"symptomId\":\"muddy_carrot\",\"theme\":\"vegetable_repair\",\"themeLabel\":\"แปลงผัก\",\"problemText\":\"แครอทเปื้อนโคลนหลุดผ่านเครื่องล้าง\",\"bugTarget\":\"action\",\"correctFix\":\"wash\",\"bugTargetChoices\":[{\"id\":\"condition\",\"label\":\"เงื่อนไข\"},{\"id\":\"action\",\"label\":\"คำสั่ง\"}],\"fixChoices\":[{\"id\":\"pass\",\"label\":\"ปล่อยผ่าน\"},{\"id\":\"wash\",\"label\":\"ส่งเข้าเครื่องล้าง\"}],\"tested\":true,\"playtest_note\":\"ทดลองแล้ว เมื่อเปลี่ยนคำสั่งเป็นส่งเข้าเครื่องล้าง แครอทเปื้อนโคลนก็ถูกล้างแล้ว\"}', 'ทดสอบ', 'submitted', NULL, '2026-06-08 00:04:28', 2, 2, 33, 2);

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_key`, `setting_value`) VALUES
('class_status', 'active'),
('navigation_status', 'unlocked');

-- --------------------------------------------------------

--
-- Table structure for table `titles`
--

CREATE TABLE `titles` (
  `id` int NOT NULL,
  `title_name` varchar(100) NOT NULL,
  `min_stars_required` int NOT NULL,
  `css_class` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `titles`
--

INSERT INTO `titles` (`id`, `title_name`, `min_stars_required`, `css_class`) VALUES
(1, 'นักคิดเริ่มต้น', 0, 'rank-badge rank-starter'),
(2, 'นักสำรวจข้อมูล', 5, 'rank-badge rank-explorer'),
(3, 'นักคิดตรรกะ', 10, 'rank-badge rank-logic'),
(4, 'นักวางลำดับขั้นตอน', 15, 'rank-badge rank-coder'),
(5, 'ผู้เชี่ยวชาญแพทเทิร์น', 20, 'rank-badge rank-pattern'),
(6, 'นักแก้ไขปัญหา', 25, 'rank-badge rank-engineer'),
(7, 'จอมวางแผน', 30, 'rank-badge rank-architect'),
(8, 'วิศวกรอัลกอริทึม', 35, 'rank-badge rank-master'),
(9, 'สถาปนิกผังงาน', 40, 'rank-badge rank-grandmaster'),
(10, '⭐ Problem Solving Hero ⭐', 45, 'rank-badge rank-legend');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `class_level` varchar(10) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','admin','super_admin','teacher','demo') DEFAULT 'student',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_seen` timestamp NULL DEFAULT NULL,
  `team_id` varchar(50) DEFAULT NULL COMMENT 'ID ของทีมในเซสชันนั้นๆ',
  `mode` enum('solo','group') DEFAULT NULL,
  `team_role` varchar(20) DEFAULT NULL COMMENT 'บทบาทในทีม (เช่น driver, navigator)',
  `group_number` int DEFAULT NULL COMMENT 'หมายเลขกลุ่ม (1-8)',
  `school_id` int DEFAULT NULL,
  `classroom_id` int DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `status` enum('pending','active','suspended') DEFAULT 'active',
  `approved_at` datetime DEFAULT NULL,
  `approved_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `student_id`, `name`, `class_level`, `password`, `role`, `created_at`, `last_seen`, `team_id`, `mode`, `team_role`, `group_number`, `school_id`, `classroom_id`, `teacher_id`, `email`, `phone`, `status`, `approved_at`, `approved_by`) VALUES
(1, 'admin', 'ครูผู้สอน', NULL, '$2y$10$rVth9N8rAGirBUBMMpbpDuLwYf0vYyf.SYBuDudRut1r6XEcmi886', 'super_admin', '2026-01-11 17:22:45', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, 'active', NULL, NULL),
(17, '2645', 'เด็กชายหนึ่งธันวา  ตาทิพย์', 'ป.4', '$2y$10$tGKeW1g37GgPmHn9gVAZPegavjLVTgFRXANeLh9p59BX/5a7HV1ke', 'student', '2026-03-05 16:26:18', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(18, '2646', 'เด็กชายชุติพนธ์  ฉิมพลี', 'ป.4', '$2y$10$Zo3G0FNIpltuOrqR9MHDE.jzCQtVDTJTxPGV26WvHupAcBgUFJtdS', 'student', '2026-03-05 16:26:18', '2026-06-07 17:35:17', 'team_69d4c4a28a190', 'solo', 'solo', NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(19, '2647', 'เด็กชายวิทวัส  เติมศิลป์', 'ป.4', '$2y$10$Sp4YeFk/V3zX4aUY3UMN1ux9guwdvN09mz9wdseN6DM28gzDLJln6', 'student', '2026-03-05 16:26:18', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(20, '2648', 'เด็กชายวีรศรุต  วงศ์สมัคร', 'ป.4', '$2y$10$rQkgt4.9sWzBkUzH55DdteRzPXeUsbWq417tkDJRg83Vd7Iw5IzNC', 'student', '2026-03-05 16:26:18', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(21, '2649', 'เด็กหญิงกัญญาภัทร  กอทอง', 'ป.4', '$2y$10$m/Vtxqx8AgBZZd1XnwzuJuNmTPT0qSdCrMCHOGmdTgCloWbWJ3Tcq', 'student', '2026-03-05 16:26:18', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(22, '2650', 'เด็กหญิงจิตติมา  บุรมย์', 'ป.4', '$2y$10$GLWTNPb/ux1JpSy4eaO9POYOQfFqKz4QHqGTug8E0NqSPPXwF8PYC', 'student', '2026-03-05 16:26:18', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(23, '2651', 'เด็กหญิงบุณยนุช  วรรณพัฒน์', 'ป.4', '$2y$10$FmdOoed4ILMTGqGCCMV2JeK6OPQqoJtlSNp0tqFkXN4eIcP7FK3yW', 'student', '2026-03-05 16:26:19', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(24, '2652', 'เด็กหญิงอภิสรา  ชูรัตน์', 'ป.4', '$2y$10$2WsIAdLkie8r7xpRak32tuAAkjz9SsYJh6hXK4v6Vc3IooKQObaxi', 'student', '2026-03-05 16:26:19', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(25, '2655', 'เด็กหญิงฐิตาภรณ์  ทำนุ', 'ป.4', '$2y$10$DLzopx1NwXLaUTMtCRGITuDwCu2pIlHw1OPZgydM33xsKAo3ud7.6', 'student', '2026-03-05 16:26:19', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(26, '2656', 'เด็กหญิงกชกร  เนาวนิตย์', 'ป.4', '$2y$10$YuvUUPKZBjjor1nvDznmC.TTMo0hRaf/iDLcySiEUyQKaNet2qn7a', 'student', '2026-03-05 16:26:19', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(27, '2657', 'เด็กหญิงกัญญารัตน์  วันซวง', 'ป.4', '$2y$10$WNGriOp1L5V54ZM7FuWwkOsxkKRn0MG0nITBBcTOzS4mM/tpXJTp2', 'student', '2026-03-05 16:26:19', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(28, '2658', 'เด็กหญิงสิริขวัญ  ศรีมาชัย', 'ป.4', '$2y$10$MmF1HiG67071Bb.Lc.F5Lu3.Ge2MWieL4A4KCpfDmdApth2gqv.qq', 'student', '2026-03-05 16:26:19', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(29, '2659', 'เด็กหญิงพรศินี  เอี่ยมจริง', 'ป.4', '$2y$10$lIQa1KXIQllN.9PeGfzItOZ6EYYCd/E6P.8oKsJkD2w17OyIY2qTq', 'student', '2026-03-05 16:26:20', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(30, '2660', 'เด็กชายศิวกร สุวรรณเพชร', 'ป.4', '$2y$10$LrW9Q0TdMVvUOd6XpcPqreBxE2.A80Aoo9RlAIDYln7QEv9ORls3O', 'student', '2026-03-05 16:26:20', NULL, NULL, NULL, NULL, NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(31, '2712', 'เด็กชายภีรวัฒน์ ศรีสรรณ์', 'ป.4', '$2y$10$x31BKZHxKBfCxlMOP2HqeuYJO36CyufS9ca48GYvEd1FndKZE4b26', 'student', '2026-03-05 16:26:20', NULL, 'team_69d04fad06364', 'group', 'member', 1, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(32, '017', 'เด็กชายทดสอบ ลองดู', 'ป.4', '$2y$10$MZrjczSGPvlj8cz1NGyoG.WY8ycL3bS7a6Ub5W5T6tJghNxNJ/op6', 'student', '2026-03-06 07:20:35', '2026-06-03 09:26:58', 'team_6a1fe773bf3dc', 'solo', 'solo', NULL, 1, 1, 1, NULL, NULL, 'active', NULL, NULL),
(33, 'demo_teacher', 'ครูทดลอง', NULL, '$2y$10$gfXRGXXOcEBOfKWWePUj/OjXJXitmcEx4O1SKtiBp24G3pGaWwmbG', 'teacher', '2026-06-03 09:17:26', NULL, NULL, NULL, NULL, NULL, 2, NULL, NULL, 'demo_teacher@example.local', NULL, 'active', '2026-06-04 00:59:53', 1),
(34, 'demo01', 'นักเรียนทดลอง หนึ่ง', 'ป.4', '$2y$10$DswC7hU5ouhjgaOFermzsOaCw0jNoFvoFkxcEXWq0.J6DxxIsjaEO', 'student', '2026-06-03 09:17:26', '2026-06-07 18:57:51', 'team_6a25bd27de3b1', 'solo', 'solo', NULL, 2, 2, 33, NULL, NULL, 'active', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `classrooms`
--
ALTER TABLE `classrooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_join_code` (`join_code`),
  ADD KEY `idx_classrooms_school` (`school_id`),
  ADD KEY `idx_classrooms_teacher` (`teacher_id`);

--
-- Indexes for table `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `game_logs`
--
ALTER TABLE `game_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `stage_id` (`stage_id`);

--
-- Indexes for table `learning_sessions`
--
ALTER TABLE `learning_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sessions_school` (`school_id`),
  ADD KEY `idx_sessions_classroom` (`classroom_id`),
  ADD KEY `idx_sessions_teacher` (`teacher_id`);

--
-- Indexes for table `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_stage_session_unique` (`user_id`,`stage_id`,`learning_session_id`),
  ADD KEY `stage_id` (`stage_id`);

--
-- Indexes for table `project_likes`
--
ALTER TABLE `project_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`user_id`,`work_id`);

--
-- Indexes for table `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stages`
--
ALTER TABLE `stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game_id` (`game_id`);

--
-- Indexes for table `student_works`
--
ALTER TABLE `student_works`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `titles`
--
ALTER TABLE `titles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `title_name` (`title_name`),
  ADD UNIQUE KEY `min_stars_required` (`min_stars_required`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `student_classroom_unique` (`student_id`,`classroom_id`),
  ADD UNIQUE KEY `uniq_users_email` (`email`),
  ADD KEY `idx_users_school_classroom` (`school_id`,`classroom_id`),
  ADD KEY `idx_users_teacher` (`teacher_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `classrooms`
--
ALTER TABLE `classrooms`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `game_logs`
--
ALTER TABLE `game_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT for table `learning_sessions`
--
ALTER TABLE `learning_sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `project_likes`
--
ALTER TABLE `project_likes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stages`
--
ALTER TABLE `stages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `student_works`
--
ALTER TABLE `student_works`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `titles`
--
ALTER TABLE `titles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `game_logs`
--
ALTER TABLE `game_logs`
  ADD CONSTRAINT `game_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_logs_ibfk_2` FOREIGN KEY (`stage_id`) REFERENCES `stages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `progress_ibfk_2` FOREIGN KEY (`stage_id`) REFERENCES `stages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stages`
--
ALTER TABLE `stages`
  ADD CONSTRAINT `stages_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
