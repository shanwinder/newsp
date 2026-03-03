-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Mar 03, 2026 at 04:05 AM
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
(1, 'logic', 'นักสืบแพทเทิร์น', 'ฝึกทักษะการสังเกตและจับคู่รูปแบบ (Pattern Recognition)', 'ทักษะการหารูปแบบ (Pattern Recognition)', '\r\n        <div class=\"row align-items-center\">\r\n            <div class=\"col-md-4 text-center\">\r\n                <div style=\"font-size: 8rem;\">🕵️‍♂️</div>\r\n            </div>\r\n            <div class=\"col-md-8 text-start\">\r\n                <h4 class=\"text-warning\">Pattern Recognition คืออะไร?</h4>\r\n                <p class=\"fs-5\">มันคือความสามารถในการ <strong>\"มองหาจุดที่เหมือนกัน\"</strong> และ <strong>\"ทำนายสิ่งที่จะเกิดขึ้น\"</strong> ครับ</p>\r\n                \r\n                <div class=\"bg-white text-dark p-3 rounded-3 mt-3 shadow-sm\">\r\n                    <strong>ตัวอย่าง:</strong><br>\r\n                    🔴 🔵 🔴 🔵 ... ตัวต่อไปคือสีอะไร?<br>\r\n                    <span class=\"text-success fw-bold\">ตอบ: สีแดง 🔴 ไงล่ะ!</span>\r\n                </div>\r\n                \r\n                <p class=\"mt-3\">ในภารกิจนี้ น้องๆ ต้องช่วยกันสังเกตว่า <strong>สัตว์ตัวไหนหายไป</strong> หรือ <strong>รูปร่างไหนที่ต้องมาต่อแถว</strong> นะครับ!</p>\r\n            </div>\r\n        </div>', '2026-01-11 17:47:01'),
(2, 'algorithm', 'หุ่นยนต์เดินตามสั่ง', 'เรียนรู้วิธีการเขียนคำสั่งเป็นลำดับขั้นตอน (Algorithm)', NULL, NULL, '2026-01-11 17:47:01'),
(3, 'text_algo', 'จัดลำดับกิจวัตร', 'ฝึกเรียงลำดับข้อความและเหตุการณ์ในชีวิตประจำวัน', NULL, NULL, '2026-01-11 17:47:01'),
(4, 'pseudocode', 'ห้องทดลองรหัสจำลอง', 'ฝึกคิดแบบเงื่อนไข If-Then ด้วยการ์ดคำสั่ง', NULL, NULL, '2026-01-11 17:47:01'),
(5, 'flowchart', 'วิศวกรผังงาน', 'เรียนรู้สัญลักษณ์และลำดับการทำงานของ Flowchart', NULL, NULL, '2026-01-11 17:47:01');

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
(31, 4, 1, 'pass', 'Score: 3, Time: 6 s, Attempts: 0', '2026-01-15 16:20:22'),
(32, 4, 2, 'pass', 'Score: 3, Time: 6 s, Attempts: 0', '2026-01-15 16:20:49'),
(33, 3, 1, 'pass', 'Score: 3, Time: 6 s, Attempts: 0', '2026-01-15 17:30:13'),
(34, 3, 2, 'pass', 'Score: 3, Time: 12 s, Attempts: 0', '2026-01-15 17:30:40'),
(35, 3, 1, 'pass', 'Score: 3, Time: 19 s, Attempts: 0', '2026-01-15 17:54:42'),
(36, 3, 1, 'pass', 'Score: 3, Time: 47 s, Attempts: 0', '2026-01-15 17:55:50'),
(37, 3, 2, 'pass', 'Score: 3, Time: 38 s, Attempts: 0', '2026-01-15 18:08:23'),
(38, 3, 3, 'pass', 'Score: 1, Time: 139 s, Attempts: 5', '2026-01-15 18:36:17'),
(39, 3, 3, 'pass', 'Score: 3, Time: 50 s, Attempts: 0', '2026-01-15 19:02:31'),
(40, 3, 3, 'pass', 'Score: 2, Time: 22 s, Attempts: 1', '2026-01-18 17:36:11'),
(41, 4, 3, 'pass', 'Score: 3, Time: 26 s, Attempts: 0', '2026-01-19 15:21:11'),
(42, 3, 2, 'pass', 'Score: 3, Time: 0 s, Attempts: 0', '2026-01-19 17:20:20'),
(43, 3, 2, 'pass', 'Score: 3, Time: 0 s, Attempts: 0', '2026-01-19 17:35:50'),
(44, 3, 1, 'pass', 'Score: 3, Time: 0 s, Attempts: 0', '2026-01-19 17:37:45'),
(45, 3, 1, 'pass', 'Score: 2, Time: 0 s, Attempts: 1', '2026-01-19 17:38:33'),
(46, 3, 2, 'pass', 'Score: 3, Time: 0 s, Attempts: 0', '2026-01-19 17:40:46'),
(47, 3, 1, 'pass', 'Score: 3, Time: 0 s, Attempts: 0', '2026-01-19 17:50:54');

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
(31, 4, 1, 3, 6, 0, '2026-01-15 23:20:22'),
(32, 4, 2, 3, 6, 0, '2026-01-15 23:20:49'),
(33, 3, 1, 3, 0, 0, '2026-01-20 00:50:54'),
(34, 3, 2, 3, 0, 0, '2026-01-20 00:40:46'),
(38, 3, 3, 3, 22, 1, '2026-01-19 00:36:11'),
(41, 4, 3, 3, 26, 0, '2026-01-19 22:21:11');

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
(1, 1, 1, 'เรียงลำดับสัตว์น้อย', 'ให้สังเกตและเรียงลำดับสัตว์ให้ถูกต้องตามแบบ', NULL),
(2, 1, 2, 'รูปทรงหรรษา', 'สังเกตรูปทรงและสี แล้วเติมส่วนที่หายไปให้ถูกต้อง', NULL),
(3, 1, 3, 'นักแยกแยะตรรกะ', 'ลากสิ่งของไปใส่กล่องให้ถูกต้องตามเงื่อนไขทางตรรกะ', NULL),
(8, 2, 1, 'เส้นทางสายตรง', 'วางคำสั่งเดินหน้า เพื่อพาหุ่นยนต์ไปชาร์จแบตเตอรี่', NULL);

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
  `id` int NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `class_level` varchar(10) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','admin') DEFAULT 'student',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_seen` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `student_id`, `name`, `class_level`, `password`, `role`, `created_at`, `last_seen`) VALUES
(1, 'admin', 'ครูผู้สอน', NULL, '$2y$10$rVth9N8rAGirBUBMMpbpDuLwYf0vYyf.SYBuDudRut1r6XEcmi886', 'admin', '2026-01-11 17:22:45', NULL),
(3, 'ทดสอบ', 'เด็กชายทดสอบ ลองดู', 'ป.4/1', '$2y$10$cwrGNkq9jO0/QWv7AdmsD.Vp5LGeJYBLslEyng90xyLOAViSNFzMa', 'student', '2026-01-14 17:20:24', '2026-01-19 17:30:55'),
(4, '001', 'ปาล์มมี่', 'ป.4/1', '$2y$10$mxXannVyUI2ioC.W.IjUh.oaghIGAByLFxyKTdOFO.8Gjk0eWxWVO', 'student', '2026-01-14 17:21:06', '2026-01-19 15:27:39');

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
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `game_logs`
--
ALTER TABLE `game_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `project_likes`
--
ALTER TABLE `project_likes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `stages`
--
ALTER TABLE `stages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `game_logs`
--
ALTER TABLE `game_logs`
  ADD CONSTRAINT `game_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_logs_ibfk_2` FOREIGN KEY (`stage_id`) REFERENCES `stages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
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
