-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 02, 2026 at 09:23 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

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
-- Table structure for table `game_logs`
--

CREATE TABLE `game_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stage_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL COMMENT 'เช่น pass, fail',
  `detail` text DEFAULT NULL COMMENT 'รายละเอียด เช่น Score: 3, Time: 45s',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `progress_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stage_id` int(11) NOT NULL COMMENT 'รหัสหน่วยการเรียนรู้ (1-4)',
  `score` int(1) DEFAULT 0 COMMENT 'ดาวที่ได้ (1-3)',
  `duration_seconds` int(11) DEFAULT 0 COMMENT 'เวลาที่ใช้ไป (วินาที)',
  `attempts` int(11) DEFAULT 0 COMMENT 'จำนวนครั้งที่ตอบผิด/พลาด',
  `completed_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`, `updated_at`) VALUES
('current_stage_allowed', '1', 'อนุญาตให้เล่นถึงด่านไหน (1-4)', '2026-03-02 08:09:51'),
('is_class_active', '0', '0 = ปิดคลาสเด็กเล่นไม่ได้, 1 = เปิดคลาส', '2026-03-02 08:09:51');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL COMMENT 'รหัสนักเรียน หรือ admin',
  `name` varchar(100) NOT NULL COMMENT 'ชื่อ-นามสกุล',
  `class_level` varchar(20) DEFAULT NULL COMMENT 'ชั้นเรียน เช่น ป.4/1',
  `password` varchar(255) NOT NULL COMMENT 'รหัสผ่าน (Hashed)',
  `role` enum('admin','student') DEFAULT 'student' COMMENT 'สิทธิ์ผู้ใช้งาน',
  `pair_id` int(11) DEFAULT NULL COMMENT 'รหัสกลุ่มคู่ (1-8)',
  `pair_role` enum('driver','navigator') DEFAULT NULL COMMENT 'บทบาทในคู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `student_id`, `name`, `class_level`, `password`, `role`, `pair_id`, `pair_role`) VALUES
(1, 'admin', 'ครูผู้สอน', NULL, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, NULL),
(2, '66001', 'ด.ช. เกษตรก้าวไกล', 'ป.4/1', '$2y$10$wKxN7o0x2oG9O.t1xV8x.eP/b3x2t3.t.b3.t.b3.t.b3.t.b3.t', 'student', 1, 'driver'),
(3, '66002', 'ด.ญ. ข้าวหอม มะลิ', 'ป.4/1', '$2y$10$wKxN7o0x2oG9O.t1xV8x.eP/b3x2t3.t.b3.t.b3.t.b3.t.b3.t', 'student', 1, 'navigator');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `game_logs`
--
ALTER TABLE `game_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`progress_id`),
  ADD UNIQUE KEY `unique_user_stage` (`user_id`,`stage_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD KEY `pair_id` (`pair_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `game_logs`
--
ALTER TABLE `game_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `progress_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `game_logs`
--
ALTER TABLE `game_logs`
  ADD CONSTRAINT `game_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
