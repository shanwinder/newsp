-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Mar 04, 2026 at 12:04 AM
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
(1, 'logic', 'คัดแยกผลผลิต (Logic)', 'ฝึกความคิดเชิงตรรกะและการสังเกต (Pattern Recognition) โดยการแยกประเภทผลผลิตทางการเกษตร', 'ความคิดเชิงตรรกะ (Logical Thinking)', '<div class=\"text-center\"><h4>ภารกิจลุยเดี่ยว!</h4><p>สังเกตลักษณะของผลผลิตและจัดหมวดหมู่ให้ถูกต้อง</p></div>', '2026-03-03 19:33:20'),
(2, 'algorithm', 'เส้นทางเดินรถไถ (Sequence)', 'เรียนรู้การเขียนคำสั่งเรียงลำดับขั้นตอน (Sequential Algorithm) พาพาหุ่นยนต์รถไถเดินตามเส้นทาง', 'อัลกอริทึมแบบลำดับ (Sequential Algorithm)', '<div class=\"text-center\"><h4>ภารกิจคู่หู (Driver & Navigator)!</h4><p>ช่วยกันวางแผนและเรียงบล็อกคำสั่งพารถไถเข้าเป้าหมาย</p></div>', '2026-03-03 19:33:20'),
(3, 'condition', 'เครื่องรดน้ำอัจฉริยะ (Condition)', 'ฝึกการคิดแบบมีเงื่อนไข (If-Then-Else) ถ้าน้ำแห้งให้รดน้ำ ถ้าฝนตกให้หยุดพัก', 'อัลกอริทึมแบบมีเงื่อนไข (Conditional Algorithm)', '<div class=\"text-center\"><h4>ภารกิจคู่คิด!</h4><p>ใช้บล็อกเงื่อนไขเพื่อสร้างระบบรดน้ำอัตโนมัติ</p></div>', '2026-03-03 19:33:20'),
(4, 'debugging', 'กู้วิกฤตฟาร์ม (Debugging)', 'ค้นหาข้อผิดพลาด (Bug) ในชุดคำสั่งที่ทำให้ฟาร์มวุ่นวาย แล้วแก้ไขให้ถูกต้อง', 'การตรวจสอบและแก้ไขข้อผิดพลาด (Debugging)', '<div class=\"text-center\"><h4>ภารกิจรวมพลัง (Group)!</h4><p>ช่วยกันวิเคราะห์โค้ดที่ผิดพลาดและสลับตำแหน่งให้ถูกต้อง</p></div>', '2026-03-03 19:33:20');

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
  `logged_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `game_logs`
--

INSERT INTO `game_logs` (`id`, `user_id`, `stage_id`, `action`, `detail`, `logged_at`) VALUES
(48, 13, 1, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 16 s, Attempts: 3', '2026-03-03 20:20:58'),
(49, 13, 1, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 2, Time: 76 s, Attempts: 5', '2026-03-03 20:36:40'),
(50, 13, 1, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 2, Time: 34 s, Attempts: 2', '2026-03-03 21:19:49'),
(51, 13, 1, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 1, Time: 71 s, Attempts: 9', '2026-03-03 22:53:49'),
(52, 13, 1, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 2, Time: 89 s, Attempts: 3', '2026-03-03 22:55:56'),
(53, 13, 1, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 1, Time: 64 s, Attempts: 10', '2026-03-03 23:43:39'),
(54, 13, 1, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 47 s, Attempts: 0', '2026-03-03 23:50:30'),
(55, 18, 1, 'pass', 'Mode: pair, Role: driver (คนกดส่งงาน), Score: 3, Time: 26 s, Attempts: 0', '2026-03-03 23:51:28'),
(56, 19, 1, 'pass', 'Mode: pair, Role: navigator, Score: 3, Time: 26 s, Attempts: 0', '2026-03-03 23:51:28');

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
  `completed_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `progress`
--

INSERT INTO `progress` (`id`, `user_id`, `stage_id`, `score`, `duration_seconds`, `attempts`, `completed_at`) VALUES
(48, 13, 1, 3, 47, 0, '2026-03-04 06:50:30'),
(55, 18, 1, 3, 26, 0, '2026-03-04 06:51:28'),
(56, 19, 1, 3, 26, 0, '2026-03-04 06:51:28');

-- --------------------------------------------------------

--
-- Table structure for table `project_likes`
--

CREATE TABLE `project_likes` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `work_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project_likes`
--

INSERT INTO `project_likes` (`id`, `user_id`, `work_id`, `created_at`) VALUES
(2, 3, 2, '2026-01-19 15:24:12'),
(4, 4, 2, '2026-01-19 15:25:08'),
(5, 4, 1, '2026-01-19 15:25:30'),
(8, 3, 1, '2026-01-19 16:30:51');

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
(5, 2, 2, 'หลบหลีกกองฟาง', 'เขียนคำสั่งให้รถไถเดินและเลี้ยวหลบกองฟางไปให้ถึงเป้าหมาย', NULL),
(6, 2, 3, 'เก็บเกี่ยวผลผลิต', 'วางแผนเส้นทางให้รถไถขับไปเก็บเกี่ยวผลผลิตให้ครบทุกจุด', NULL),
(7, 3, 1, 'เช็คดินแห้งหรือเปียก', 'ใช้เงื่อนไข \"ถ้าดินแห้ง ให้รดน้ำ\" เพื่อดูแลต้นกล้า', NULL),
(8, 3, 2, 'รับมือฝนฟ้าคะนอง', 'เพิ่มเงื่อนไข \"มิฉะนั้น (ถ้าฝนตก) ให้หยุดพัก\" เข้าไปในระบบ', NULL),
(9, 3, 3, 'ระบบน้ำครอบจักรวาล', 'ประยุกต์ใช้เงื่อนไขตรวจสอบแปลงผักหลายๆ แปลงต่อเนื่องกัน', NULL),
(10, 4, 1, 'ขั้นตอนที่ผิดเพี้ยน', 'มีคนเรียงลำดับการปลูกข้าวผิด! จงสลับตำแหน่งให้ถูกต้อง', NULL),
(11, 4, 2, 'รถไถหลงทาง', 'แก้ไขบั๊ก (Bug) ในบล็อกคำสั่งที่ทำให้รถไถเดินตกคันนา', NULL),
(12, 4, 3, 'วิกฤตน้ำท่วมฟาร์ม', 'ระบบเซ็นเซอร์ทำงานผิดพลาด ค้นหาและแก้บั๊กเพื่อกู้วิกฤติน้ำล้นแปลง', NULL);

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
  `status` enum('pending','submitted','reviewed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_works`
--

INSERT INTO `student_works` (`id`, `user_id`, `game_id`, `work_data`, `description`, `status`, `feedback`, `submitted_at`) VALUES
(1, 3, 1, '[{\"type\":\"sq_red\",\"x\":294,\"y\":230},{\"type\":\"ci_green\",\"x\":319,\"y\":279},{\"type\":\"tri_blue\",\"x\":264,\"y\":213},{\"type\":\"rabbit\",\"x\":275,\"y\":227}]', 'หกอหอ', 'reviewed', NULL, '2026-01-20 00:39:01'),
(2, 4, 1, '[{\"type\":\"dog\",\"x\":119,\"y\":134},{\"type\":\"cat\",\"x\":384,\"y\":187},{\"type\":\"sq_red\",\"x\":229,\"y\":327}]', 'มั่วจ้า', 'reviewed', NULL, '2026-01-19 22:22:09');

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
(4, 'นักสร้างลำดับ', 15, 'rank-badge rank-coder'),
(5, 'ผู้เชี่ยวชาญแพทเทิร์น', 20, 'rank-badge rank-pattern'),
(6, 'นักแก้บั๊กจิ๋ว', 25, 'rank-badge rank-engineer'),
(7, 'จอมวางแผน', 30, 'rank-badge rank-architect'),
(8, 'วิศวกรอัลกอริทึม', 35, 'rank-badge rank-master'),
(9, 'สถาปนิกผังงาน', 40, 'rank-badge rank-grandmaster'),
(10, '⭐ CODING HERO ⭐', 45, 'rank-badge rank-legend');

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
  `role` enum('student','admin') DEFAULT 'student',
  `pair_id` varchar(50) DEFAULT NULL,
  `pair_role` enum('driver','navigator') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_seen` timestamp NULL DEFAULT NULL,
  `team_id` varchar(50) DEFAULT NULL COMMENT 'ID ของทีมในเซสชันนั้นๆ',
  `mode` enum('solo','pair','group') DEFAULT NULL COMMENT 'รูปแบบการเรียน',
  `team_role` varchar(20) DEFAULT NULL COMMENT 'บทบาทในทีม (เช่น driver, navigator)',
  `group_number` int DEFAULT NULL COMMENT 'หมายเลขกลุ่ม (1-8)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `student_id`, `name`, `class_level`, `password`, `role`, `pair_id`, `pair_role`, `created_at`, `last_seen`, `team_id`, `mode`, `team_role`, `group_number`) VALUES
(1, 'admin', 'ครูผู้สอน', NULL, '$2y$10$rVth9N8rAGirBUBMMpbpDuLwYf0vYyf.SYBuDudRut1r6XEcmi886', 'admin', NULL, NULL, '2026-01-11 17:22:45', NULL, NULL, NULL, NULL, NULL),
(5, 'test01', 'นักเรียนทดสอบ ที่ 1', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, 'team_69a7323594dfc', 'group', 'member', 7),
(6, 'test02', 'นักเรียนทดสอบ ที่ 2', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, NULL, NULL, NULL, NULL),
(7, 'test03', 'นักเรียนทดสอบ ที่ 3', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, 'team_69a7323594dfc', 'group', 'member', 7),
(8, 'test04', 'นักเรียนทดสอบ ที่ 4', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, NULL, NULL, NULL, NULL),
(9, 'test05', 'นักเรียนทดสอบ ที่ 5', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, 'team_69a7323594dfc', 'group', 'member', 7),
(10, 'test06', 'นักเรียนทดสอบ ที่ 6', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, NULL, NULL, NULL, NULL),
(11, 'test07', 'นักเรียนทดสอบ ที่ 7', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, NULL, NULL, NULL, NULL),
(12, 'test08', 'นักเรียนทดสอบ ที่ 8', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, NULL, NULL, NULL, NULL),
(13, 'test09', 'นักเรียนทดสอบ ที่ 9', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, 'team_69a7391267926', 'solo', 'solo', NULL),
(14, 'test10', 'นักเรียนทดสอบ ที่ 10', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, 'team_69a7318247d41', 'group', 'member', 8),
(15, 'test11', 'นักเรียนทดสอบ ที่ 11', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, 'team_69a7318247d41', 'group', 'member', 8),
(16, 'test12', 'นักเรียนทดสอบ ที่ 12', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, 'team_69a7318247d41', 'group', 'member', 8),
(17, 'test13', 'นักเรียนทดสอบ ที่ 13', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, 'team_69a738cdc49d2', 'pair', 'driver', NULL),
(18, 'test14', 'นักเรียนทดสอบ ที่ 14', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, 'team_69a773dd10d3e', 'pair', 'driver', NULL),
(19, 'test15', 'นักเรียนทดสอบ ที่ 15', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, 'team_69a773dd10d3e', 'pair', 'navigator', NULL),
(20, 'test16', 'นักเรียนทดสอบ ที่ 16', 'ป.4/1', '$2y$10$UpPwjE5jC4xItt5tBCxOzuqfACAt1sQnlYe09W7buLcAWTBQkvvmK', 'student', NULL, NULL, '2026-03-03 05:43:04', NULL, 'team_69a738cdc49d2', 'pair', 'navigator', NULL);

--
-- Indexes for dumped tables
--

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
-- Indexes for table `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_stage_unique` (`user_id`,`stage_id`),
  ADD KEY `stage_id` (`stage_id`);

--
-- Indexes for table `project_likes`
--
ALTER TABLE `project_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`user_id`,`work_id`);

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
  ADD UNIQUE KEY `student_id` (`student_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `game_logs`
--
ALTER TABLE `game_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `project_likes`
--
ALTER TABLE `project_likes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `stages`
--
ALTER TABLE `stages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `student_works`
--
ALTER TABLE `student_works`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `titles`
--
ALTER TABLE `titles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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
