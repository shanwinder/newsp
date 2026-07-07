-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: sql306.infinityfree.com
-- Generation Time: Jul 07, 2026 at 04:20 AM
-- Server version: 11.4.12-MariaDB
-- PHP Version: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `if0_40072699_newsp`
--

-- --------------------------------------------------------

--
-- Table structure for table `assessments`
--

CREATE TABLE `assessments` (
  `id` int(11) NOT NULL,
  `assessment_type` enum('pretest','posttest') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `total_questions` int(11) NOT NULL DEFAULT 20,
  `full_score` int(11) NOT NULL DEFAULT 20,
  `time_limit_minutes` int(11) NOT NULL DEFAULT 30,
  `status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
  `version_label` varchar(50) NOT NULL DEFAULT 'ชุดที่ 1',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assessments`
--

INSERT INTO `assessments` (`id`, `assessment_type`, `title`, `description`, `total_questions`, `full_score`, `time_limit_minutes`, `status`, `version_label`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'pretest', 'แบบทดสอบก่อนเรียน ชุดที่ 1', 'วัดความรู้พื้นฐานก่อนเริ่มภารกิจ 4 บทเรียน', 20, 20, 30, 'active', 'ชุดที่ 1', NULL, '2026-06-13 00:55:10', '2026-06-13 00:55:10'),
(2, 'posttest', 'แบบทดสอบหลังเรียน ชุดที่ 1', 'วัดผลการเรียนรู้หลังจบภารกิจ 4 บทเรียน', 20, 20, 30, 'active', 'ชุดที่ 1', NULL, '2026-06-13 00:55:10', '2026-06-13 00:55:10');

-- --------------------------------------------------------

--
-- Table structure for table `assessment_answers`
--

CREATE TABLE `assessment_answers` (
  `id` int(11) NOT NULL,
  `attempt_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `selected_choice` enum('A','B','C','D') NOT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `answered_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assessment_answers`
--

INSERT INTO `assessment_answers` (`id`, `attempt_id`, `question_id`, `selected_choice`, `is_correct`, `answered_at`) VALUES
(26, 4, 1, 'B', 1, '2026-06-13 21:49:25'),
(27, 4, 2, 'A', 0, '2026-06-13 21:49:25'),
(28, 4, 3, 'C', 1, '2026-06-13 21:49:25'),
(29, 4, 4, 'B', 1, '2026-06-13 21:49:25'),
(30, 4, 5, 'B', 1, '2026-06-13 21:49:25'),
(31, 4, 6, 'B', 1, '2026-06-13 21:49:25'),
(32, 4, 7, 'B', 1, '2026-06-13 21:49:25'),
(33, 4, 8, 'B', 1, '2026-06-13 21:49:25'),
(34, 4, 9, 'B', 1, '2026-06-13 21:49:25'),
(35, 4, 10, 'B', 1, '2026-06-13 21:49:25'),
(36, 4, 11, 'A', 1, '2026-06-13 21:49:25'),
(37, 4, 12, 'B', 1, '2026-06-13 21:49:25'),
(38, 4, 13, 'A', 0, '2026-06-13 21:49:25'),
(39, 4, 14, 'B', 1, '2026-06-13 21:49:25'),
(40, 4, 15, 'B', 1, '2026-06-13 21:49:25'),
(41, 4, 16, 'B', 1, '2026-06-13 21:49:25'),
(42, 4, 17, 'B', 1, '2026-06-13 21:49:25'),
(43, 4, 18, 'B', 1, '2026-06-13 21:49:25'),
(44, 4, 19, 'A', 1, '2026-06-13 21:49:25'),
(45, 4, 20, 'B', 1, '2026-06-13 21:49:25'),
(66, 5, 21, 'B', 1, '2026-06-13 21:53:51'),
(67, 5, 22, 'B', 1, '2026-06-13 21:53:51'),
(68, 5, 23, 'B', 1, '2026-06-13 21:53:51'),
(69, 5, 24, 'B', 1, '2026-06-13 21:53:51'),
(70, 5, 25, 'A', 1, '2026-06-13 21:53:51'),
(71, 5, 26, 'B', 1, '2026-06-13 21:53:51'),
(72, 5, 27, 'A', 1, '2026-06-13 21:53:51'),
(73, 5, 28, 'B', 1, '2026-06-13 21:53:51'),
(74, 5, 29, 'A', 1, '2026-06-13 21:53:51'),
(75, 5, 30, 'B', 1, '2026-06-13 21:53:51'),
(76, 5, 31, 'A', 1, '2026-06-13 21:53:51'),
(77, 5, 32, 'B', 1, '2026-06-13 21:53:51'),
(78, 5, 33, 'B', 1, '2026-06-13 21:53:51'),
(79, 5, 34, 'B', 1, '2026-06-13 21:53:51'),
(80, 5, 35, 'B', 1, '2026-06-13 21:53:51'),
(81, 5, 36, 'B', 1, '2026-06-13 21:53:51'),
(82, 5, 37, 'A', 1, '2026-06-13 21:53:51'),
(83, 5, 38, 'A', 1, '2026-06-13 21:53:51'),
(84, 5, 39, 'A', 1, '2026-06-13 21:53:51'),
(85, 5, 40, 'B', 1, '2026-06-13 21:53:51');

-- --------------------------------------------------------

--
-- Table structure for table `assessment_attempts`
--

CREATE TABLE `assessment_attempts` (
  `id` int(11) NOT NULL,
  `assessment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `classroom_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `learning_session_id` int(11) NOT NULL,
  `started_at` datetime NOT NULL DEFAULT current_timestamp(),
  `submitted_at` datetime DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `full_score` int(11) NOT NULL,
  `percent_score` decimal(5,2) DEFAULT NULL,
  `status` enum('in_progress','submitted','cancelled') NOT NULL DEFAULT 'in_progress',
  `attempt_no` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assessment_attempts`
--

INSERT INTO `assessment_attempts` (`id`, `assessment_id`, `user_id`, `school_id`, `classroom_id`, `teacher_id`, `learning_session_id`, `started_at`, `submitted_at`, `score`, `full_score`, `percent_score`, `status`, `attempt_no`) VALUES
(4, 1, 34, 2, 2, 33, 2, '2026-06-13 21:41:50', '2026-06-13 21:49:25', 18, 20, '90.00', 'submitted', 1),
(5, 2, 34, 2, 2, 33, 2, '2026-06-13 21:49:50', '2026-06-13 21:53:51', 20, 20, '100.00', 'submitted', 1);

-- --------------------------------------------------------

--
-- Table structure for table `assessment_questions`
--

CREATE TABLE `assessment_questions` (
  `id` int(11) NOT NULL,
  `assessment_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `question_no` int(11) NOT NULL,
  `cognitive_level` enum('remember','understand','apply','analyze') NOT NULL,
  `question_text` text NOT NULL,
  `choice_a` text NOT NULL,
  `choice_b` text NOT NULL,
  `choice_c` text NOT NULL,
  `choice_d` text NOT NULL,
  `correct_choice` enum('A','B','C','D') NOT NULL,
  `explanation` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assessment_questions`
--

INSERT INTO `assessment_questions` (`id`, `assessment_id`, `game_id`, `question_no`, `cognitive_level`, `question_text`, `choice_a`, `choice_b`, `choice_c`, `choice_d`, `correct_choice`, `explanation`, `status`) VALUES
(1, 1, 1, 1, 'remember', 'ข้อใดอธิบายการใช้เหตุผลเชิงตรรกะได้เหมาะสมที่สุด', 'เดาคำตอบโดยไม่ดูข้อมูล', 'พิจารณาข้อมูลและสรุปอย่างมีเหตุผล', 'เลือกคำตอบที่ยาวที่สุด', 'ทำตามเพื่อนทุกครั้ง', 'B', 'การใช้ตรรกะต้องพิจารณาข้อมูลและเหตุผล', 'active'),
(2, 1, 1, 2, 'understand', 'ถ้ากำหนดว่า “ผลไม้สีแดงทุกลูกใส่ตะกร้า ก” แอปเปิลสีเขียวควรอยู่ที่ใด', 'ตะกร้า ก', 'ไม่เข้าตะกร้า ก', 'ใส่ได้ทั้งสองที่', 'ทิ้งทันที', 'B', 'แอปเปิลสีเขียวไม่ตรงเงื่อนไขสีแดง', 'active'),
(3, 1, 1, 3, 'apply', 'มีบัตรเลข 2, 5, 8 กติกาคือเลือกเลขที่มากกว่า 4 ควรเลือกข้อใด', '2 เท่านั้น', '5 เท่านั้น', '5 และ 8', '2 และ 5', 'C', '5 และ 8 มากกว่า 4', 'active'),
(4, 1, 1, 4, 'apply', 'กติกาคัดเมล็ดคือ “ถ้าเมล็ดสมบูรณ์และไม่เปียก ให้เก็บ” เมล็ดสมบูรณ์แต่เปียกควรทำอย่างไร', 'เก็บ', 'ไม่เก็บ', 'เก็บครึ่งหนึ่ง', 'ข้อมูลไม่เกี่ยวกัน', 'B', 'ต้องตรงทั้งสองเงื่อนไข', 'active'),
(5, 1, 1, 5, 'analyze', 'ข้อมูลใดเพียงพอที่สุดในการตัดสินว่าผักควรผ่านจุดคัดหรือไม่', 'สีที่ชอบของผู้คัด', 'เงื่อนไขการคัดและลักษณะของผัก', 'ชื่อคนปลูก', 'ราคาตะกร้า', 'B', 'ต้องเปรียบเทียบลักษณะจริงกับเงื่อนไข', 'active'),
(6, 1, 2, 6, 'remember', 'สิ่งใดคือ “ลำดับขั้นตอน”', 'รายการงานที่ทำสลับอย่างไรก็ได้', 'การจัดงานตามก่อนและหลัง', 'การเลือกสีให้สวย', 'การนับจำนวนคน', 'B', 'ลำดับขั้นตอนระบุสิ่งที่ต้องทำก่อนและหลัง', 'active'),
(7, 1, 2, 7, 'understand', 'เหตุใดการเรียงขั้นตอนจึงสำคัญ', 'ทำให้งานมีตัวหนังสือมากขึ้น', 'ช่วยให้งานไปถึงเป้าหมายอย่างถูกต้อง', 'ทำให้ไม่ต้องตรวจงาน', 'ทำให้ทุกขั้นใช้เวลาเท่ากัน', 'B', 'ลำดับที่ถูกช่วยลดความผิดพลาด', 'active'),
(8, 1, 2, 8, 'apply', 'ต้องชงนม: 1 เทนม 2 เตรียมแก้ว 3 คนให้เข้ากัน ลำดับใดเหมาะสม', '1-2-3', '2-1-3', '3-1-2', '2-3-1', 'B', 'ต้องเตรียมภาชนะก่อนเทและคน', 'active'),
(9, 1, 2, 9, 'apply', 'รถไถหันขึ้น ต้องไปขวาหนึ่งช่อง ควรทำคำสั่งใดก่อน', 'เดินหน้า', 'เลี้ยวขวา', 'เลี้ยวซ้ายสองครั้ง', 'หยุด', 'B', 'ต้องเปลี่ยนทิศก่อนเดินไปทางขวา', 'active'),
(10, 1, 2, 10, 'analyze', 'แผนเดินทาง “เดินหน้า 2 เลี้ยวซ้าย เดินหน้า 1” แต่มีหินอยู่ช่องที่สอง ควรปรับอย่างไร', 'ใช้แผนเดิม', 'วางเส้นทางหลบหินก่อนถึงช่องที่สอง', 'เพิ่มเดินหน้าอีก 2', 'ลบทุกคำสั่ง', 'B', 'ต้องวิเคราะห์สิ่งกีดขวางและเปลี่ยนเส้นทาง', 'active'),
(11, 1, 3, 11, 'remember', 'คำว่า “ถ้า...แล้ว...” ใช้ทำอะไร', 'กำหนดการตัดสินใจตามเงื่อนไข', 'ตกแต่งข้อความ', 'นับคะแนนเท่านั้น', 'เริ่มงานโดยไม่ตรวจอะไร', 'A', 'เป็นโครงสร้างเงื่อนไข', 'active'),
(12, 1, 3, 12, 'understand', 'กฎ “ถ้าฝนตก ให้กางร่ม” เมื่อฝนไม่ตกควรเป็นอย่างไร', 'ต้องกางร่มเสมอ', 'ไม่จำเป็นต้องกางร่มตามกฎนี้', 'ทิ้งร่ม', 'หยุดเดินตลอดวัน', 'B', 'คำสั่งทำเมื่อเงื่อนไขเป็นจริง', 'active'),
(13, 1, 3, 13, 'apply', 'ถ้าคะแนนตั้งแต่ 8 ขึ้นไปได้ดาวทอง ผู้ที่ได้ 8 คะแนนควรได้อะไร', 'ไม่ได้ดาว', 'ดาวทอง', 'ดาวเงินเท่านั้น', 'ต้องสอบใหม่', 'B', 'ตั้งแต่ 8 รวมค่า 8', 'active'),
(14, 1, 3, 14, 'apply', 'กฎคือ “ถ้าผักเปื้อนโคลนให้ล้าง มิฉะนั้นส่งบรรจุ” ผักสะอาดควรไปที่ใด', 'เครื่องล้าง', 'จุดบรรจุ', 'ถังขยะ', 'ย้อนกลับสวน', 'B', 'เงื่อนไขเป็นเท็จจึงทำส่วนมิฉะนั้น', 'active'),
(15, 1, 3, 15, 'analyze', 'กฎใดแยกผลผลิตสุกและไม่สุกได้ครบถ้วนที่สุด', 'ถ้าสุกให้ขาย', 'ถ้าสุกให้ขาย มิฉะนั้นส่งไปบ่ม', 'ขายทุกชิ้น', 'ส่งไปบ่มทุกชิ้น', 'B', 'มีทางเลือกสำหรับทั้งสองกรณี', 'active'),
(16, 1, 4, 16, 'remember', 'การตรวจสอบและแก้ไขข้อผิดพลาดเรียกว่าอะไร', 'การสุ่ม', 'การดีบัก', 'การตกแต่ง', 'การทำซ้ำโดยไม่ดูผล', 'B', 'Debugging คือการค้นหาและแก้ข้อผิดพลาด', 'active'),
(17, 1, 4, 17, 'understand', 'เมื่อผลลัพธ์ไม่ตรงเป้าหมาย ควรทำสิ่งใดก่อน', 'ลบงานทั้งหมดทันที', 'เปรียบเทียบผลที่ได้กับผลที่คาดหวัง', 'เดาคำสั่งใหม่หลายคำสั่ง', 'หยุดตรวจ', 'B', 'ต้องเห็นจุดต่างก่อนหาสาเหตุ', 'active'),
(18, 1, 4, 18, 'apply', 'คำสั่งควรเป็น “เดินหน้า เลี้ยวขวา” แต่เขียน “เดินหน้า เลี้ยวซ้าย” จุดผิดอยู่ที่ใด', 'คำสั่งแรก', 'คำสั่งที่สอง', 'ไม่มีข้อผิดพลาด', 'ทุกคำสั่ง', 'B', 'ทิศการเลี้ยวไม่ตรงแผน', 'active'),
(19, 1, 4, 19, 'apply', 'กฎให้ล้างแครอทเปื้อนโคลน แต่ระบบปล่อยผ่าน ควรตรวจส่วนใด', 'เงื่อนไขและคำสั่งเมื่อเงื่อนไขเป็นจริง', 'สีพื้นหลัง', 'ชื่อผู้เล่น', 'จำนวนดาว', 'A', 'อาการเกี่ยวกับการตรวจเงื่อนไขหรือคำสั่งล้าง', 'active'),
(20, 1, 4, 20, 'analyze', 'วิธีใดช่วยยืนยันว่าแก้ข้อผิดพลาดสำเร็จ', 'แก้แล้วไม่ต้องลอง', 'ทดสอบด้วยข้อมูลเดิมและกรณีอื่นที่เกี่ยวข้อง', 'ดูเฉพาะหน้าตา', 'ถามเพื่อนโดยไม่รัน', 'B', 'ต้องทดสอบซ้ำและครอบคลุมหลายกรณี', 'active'),
(21, 2, 1, 1, 'remember', 'การตัดสินใจแบบมีเหตุผลควรอาศัยสิ่งใด', 'ความชอบส่วนตัวเท่านั้น', 'ข้อมูล เงื่อนไข และเหตุผล', 'คำตอบของคนข้าง ๆ', 'การเลือกแบบสุ่ม', 'B', 'การใช้ตรรกะอาศัยข้อมูลและเงื่อนไข', 'active'),
(22, 2, 1, 2, 'understand', 'กำหนดว่า “ถุงที่มีเครื่องหมายดาวเท่านั้นจึงผ่าน” ถุงไม่มีดาวควรเป็นอย่างไร', 'ผ่าน', 'ไม่ผ่าน', 'ผ่านครึ่งถุง', 'ต้องเปลี่ยนสี', 'B', 'ถุงไม่มีดาวไม่ตรงเงื่อนไข', 'active'),
(23, 2, 1, 3, 'apply', 'มีเลข 3, 6, 9 กติกาคือเลือกเลขคู่ ควรเลือกข้อใด', '3', '6', '9', '3 และ 9', 'B', '6 เป็นเลขคู่เพียงจำนวนเดียว', 'active'),
(24, 2, 1, 4, 'apply', 'กติกาเก็บผลผลิตคือ “สุกและไม่มีรอยช้ำ” มะเขือเทศสุกแต่ช้ำควรทำอย่างไร', 'เก็บ', 'ไม่เก็บ', 'เก็บเพราะสุกอย่างเดียวพอ', 'ตัดสินไม่ได้ทั้งที่ข้อมูลครบ', 'B', 'เงื่อนไข AND ต้องจริงทั้งคู่', 'active'),
(25, 2, 1, 5, 'analyze', 'เมื่อต้องคัดสิ่งของตามกฎ วิธีใดน่าเชื่อถือที่สุด', 'ตรวจทีละลักษณะเทียบกับกฎ', 'ดูจากชื่อเจ้าของ', 'ใช้ความรู้สึก', 'เลือกทุกชิ้นไว้ก่อน', 'A', 'การเทียบข้อมูลกับกฎอย่างเป็นขั้นตอนตรวจสอบได้', 'active'),
(26, 2, 2, 6, 'remember', 'ข้อใดเป็นตัวอย่างของขั้นตอนที่มีลำดับ', 'กิจกรรมที่เลือกทำแบบใดก็ได้', 'ขั้นตอนล้างมือก่อนรับประทานอาหาร', 'รายชื่อสีที่ชอบ', 'จำนวนโต๊ะในห้อง', 'B', 'การล้างมือมีลำดับการปฏิบัติ', 'active'),
(27, 2, 2, 7, 'understand', 'ถ้าสลับขั้นตอนที่ต้องพึ่งพากัน อาจเกิดอะไรขึ้น', 'ผลลัพธ์อาจผิดหรือทำงานไม่ได้', 'งานถูกเสมอ', 'ไม่มีผลทุกกรณี', 'จำนวนขั้นตอนหายไปเอง', 'A', 'บางขั้นต้องเสร็จก่อนอีกขั้น', 'active'),
(28, 2, 2, 8, 'apply', 'ปลูกต้นไม้: 1 รดน้ำ 2 ใส่ต้นกล้าในหลุม 3 ขุดหลุม ลำดับใดเหมาะสม', '1-2-3', '3-2-1', '2-1-3', '3-1-2', 'B', 'ขุดหลุม ใส่ต้นกล้า แล้วรดน้ำ', 'active'),
(29, 2, 2, 9, 'apply', 'ตัวละครหันซ้าย ต้องการไปด้านบนหนึ่งช่อง ควรทำอย่างไร', 'เลี้ยวขวาแล้วเดินหน้า', 'เดินหน้าเลย', 'เลี้ยวซ้ายแล้วเดินหน้า', 'ถอยหลังสองครั้ง', 'A', 'จากซ้ายเลี้ยวขวาจะหันขึ้น', 'active'),
(30, 2, 2, 10, 'analyze', 'เส้นทางเดิมชนรั้ว วิธีแก้ที่เหมาะสมคือข้อใด', 'เพิ่มคำสั่งเดินหน้าเข้ารั้ว', 'หาจุดที่ชนแล้วปรับลำดับเลี้ยวและเดิน', 'ทำซ้ำแผนเดิม', 'ลบเป้าหมาย', 'B', 'ต้องระบุตำแหน่งปัญหาและออกแบบเส้นทางใหม่', 'active'),
(31, 2, 3, 11, 'remember', 'โครงสร้างใดใช้เลือกทำคำสั่งตามสถานการณ์', 'ถ้า...แล้ว...', 'เขียนคำสั่งเรียงโดยไม่ตรวจ', 'นับหนึ่งถึงสิบ', 'แสดงรูปภาพ', 'A', 'If ใช้ตรวจเงื่อนไข', 'active'),
(32, 2, 3, 12, 'understand', 'กฎ “ถ้าแบตเตอรีต่ำให้ชาร์จ” เมื่อแบตเตอรีเต็มหมายความว่าอย่างไร', 'ต้องชาร์จตามกฎนี้', 'ไม่ต้องทำคำสั่งชาร์จตามกฎนี้', 'ปิดเครื่องเสมอ', 'ลบแบตเตอรี', 'B', 'เงื่อนไขแบตเตอรีต่ำเป็นเท็จ', 'active'),
(33, 2, 3, 13, 'apply', 'ถ้าอุณหภูมิมากกว่า 30 ให้เปิดพัดลม เมื่ออุณหภูมิ 31 ควรทำอย่างไร', 'ปิดพัดลม', 'เปิดพัดลม', 'รอให้อุณหภูมิ 40', 'ทำอะไรก็ได้', 'B', '31 มากกว่า 30', 'active'),
(34, 2, 3, 14, 'apply', 'กฎ “ถ้ากล่องหนักให้ใช้รถเข็น มิฉะนั้นยกด้วยมือ” กล่องเบาควรทำอย่างไร', 'ใช้รถเข็นเท่านั้น', 'ยกด้วยมือ', 'ทิ้งกล่อง', 'เปิดกล่อง', 'B', 'ทำส่วนมิฉะนั้นเมื่อกล่องไม่หนัก', 'active'),
(35, 2, 3, 15, 'analyze', 'ต้องแยกเมล็ดดีและเมล็ดเสีย กฎใดครอบคลุมทุกชิ้น', 'ถ้าเมล็ดดีให้เก็บ', 'ถ้าเมล็ดดีให้เก็บ มิฉะนั้นคัดออก', 'เก็บทั้งหมด', 'คัดออกทั้งหมด', 'B', 'If-else ครอบคลุมทั้งจริงและเท็จ', 'active'),
(36, 2, 4, 16, 'remember', 'เป้าหมายหลักของการดีบักคืออะไร', 'เพิ่มจำนวนข้อผิดพลาด', 'ค้นหาและแก้สาเหตุที่ทำให้ผลลัพธ์ผิด', 'เปลี่ยนสีหน้าจอ', 'ทำงานเดิมโดยไม่ตรวจ', 'B', 'Debugging มุ่งให้ระบบทำงานตามเป้าหมาย', 'active'),
(37, 2, 4, 17, 'understand', 'เหตุใดต้องทดสอบหลังแก้ไข', 'เพื่อยืนยันว่าปัญหาหายและไม่เกิดผลเสียใหม่', 'เพื่อให้ใช้เวลานานขึ้น', 'เพื่อเปลี่ยนคำตอบเดิมเสมอ', 'ไม่จำเป็นต้องทดสอบ', 'A', 'การทดสอบยืนยันผลของการแก้ไข', 'active'),
(38, 2, 4, 18, 'apply', 'แผนต้อง “เลี้ยวซ้าย เดินหน้า” แต่ระบบ “เลี้ยวซ้าย ถอยหลัง” ควรแก้อะไร', 'เปลี่ยนคำสั่งที่สองเป็นเดินหน้า', 'เปลี่ยนคำสั่งแรกเป็นขวา', 'เพิ่มถอยหลัง', 'ไม่ต้องแก้', 'A', 'คำสั่งเคลื่อนที่ตัวที่สองผิด', 'active'),
(39, 2, 4, 19, 'apply', 'ระบบส่งผักสะอาดเข้าเครื่องล้างทั้งที่ควรบรรจุ ควรตรวจอะไร', 'เงื่อนไขที่ระบุว่าผักเปื้อนและทางเลือกมิฉะนั้น', 'รูปประจำตัว', 'ชื่อห้อง', 'เสียงเกม', 'A', 'ปัญหาอยู่ที่กฎแยกเปื้อน/สะอาด', 'active'),
(40, 2, 4, 20, 'analyze', 'มีข้อผิดพลาดหลายจุด วิธีใดช่วยหาสาเหตุได้ดีที่สุด', 'เปลี่ยนทุกอย่างพร้อมกัน', 'ทดสอบทีละส่วนและบันทึกผล', 'เดาคำตอบครั้งเดียว', 'ไม่ใช้ข้อมูลทดสอบ', 'B', 'แยกทดสอบทีละส่วนช่วยระบุต้นเหตุ', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `assessment_settings`
--

CREATE TABLE `assessment_settings` (
  `id` int(11) NOT NULL,
  `learning_session_id` int(11) NOT NULL,
  `pretest_assessment_id` int(11) DEFAULT NULL,
  `posttest_assessment_id` int(11) DEFAULT NULL,
  `pretest_status` enum('locked','unlocked') NOT NULL DEFAULT 'locked',
  `posttest_status` enum('locked','unlocked') NOT NULL DEFAULT 'locked',
  `pretest_required` tinyint(1) NOT NULL DEFAULT 1,
  `posttest_required` tinyint(1) NOT NULL DEFAULT 0,
  `show_score_to_student` tinyint(1) NOT NULL DEFAULT 0,
  `allow_retake` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assessment_settings`
--

INSERT INTO `assessment_settings` (`id`, `learning_session_id`, `pretest_assessment_id`, `posttest_assessment_id`, `pretest_status`, `posttest_status`, `pretest_required`, `posttest_required`, `show_score_to_student`, `allow_retake`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 'locked', 'locked', 1, 0, 0, 0, '2026-06-13 00:55:10', '2026-06-13 00:55:10'),
(2, 2, 1, 2, 'unlocked', 'unlocked', 1, 1, 1, 0, '2026-06-13 00:55:10', '2026-06-13 21:41:07');

-- --------------------------------------------------------

--
-- Table structure for table `classrooms`
--

CREATE TABLE `classrooms` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `classroom_name` varchar(255) NOT NULL,
  `grade_level` varchar(50) DEFAULT 'ป.4',
  `academic_year` varchar(20) DEFAULT NULL,
  `join_code` varchar(20) NOT NULL,
  `status` enum('active','archived') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classrooms`
--

INSERT INTO `classrooms` (`id`, `school_id`, `teacher_id`, `classroom_name`, `grade_level`, `academic_year`, `join_code`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'ป.4 โรงเรียนบ้านนาอุดม', 'ป.4', '2569', 'DEFAULT4', 'active', '2026-06-03 16:17:26', NULL),
(2, 2, 33, 'ห้องเรียน Demo ป.4', 'ป.4', '2569', 'DEMO4', 'active', '2026-06-03 16:17:26', NULL),
(3, 3, 35, 'ป.4/1 ปีการศึกษา 1/2569', 'ป.4', '2569', '9FF10D', 'active', '2026-06-13 02:04:32', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE `games` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `learning_topic` varchar(255) DEFAULT NULL,
  `instruction_html` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
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
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stage_id` int(11) NOT NULL,
  `action` enum('start','submit','hint','pass','fail') NOT NULL,
  `detail` text DEFAULT NULL,
  `logged_at` timestamp NULL DEFAULT current_timestamp(),
  `school_id` int(11) DEFAULT NULL,
  `classroom_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `learning_session_id` int(11) DEFAULT NULL
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
(129, 34, 12, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 278 s, Attempts: 3, Detail: {\"mode\":\"conveyor_debug\",\"average_score\":96,\"level_scores\":[100,96,92],\"total_correct\":16,\"total_items\":16}', '2026-06-07 17:02:11', 2, 2, 33, 2),
(130, 34, 1, 'pass', 'Mode: solo, Role: solo (คนกดส่งงาน), Score: 3, Time: 24 s, Attempts: 1', '2026-06-16 15:42:32', 2, 2, 33, 2);

-- --------------------------------------------------------

--
-- Table structure for table `learning_sessions`
--

CREATE TABLE `learning_sessions` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `classroom_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `session_name` varchar(255) NOT NULL,
  `class_status` enum('active','paused') DEFAULT 'active',
  `navigation_status` enum('locked','unlocked') DEFAULT 'locked',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('active','closed','archived') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `learning_sessions`
--

INSERT INTO `learning_sessions` (`id`, `school_id`, `classroom_id`, `teacher_id`, `session_name`, `class_status`, `navigation_status`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'รอบการเรียนรู้หลัก', 'active', 'unlocked', NULL, NULL, 'active', '2026-06-03 16:17:26', NULL),
(2, 2, 2, 33, 'รอบทดลองใช้ Demo', 'active', 'unlocked', NULL, NULL, 'active', '2026-06-03 16:17:26', '2026-06-03 16:19:50'),
(3, 3, 3, 35, 'รอบการเรียนรู้หลัก', 'active', 'locked', NULL, NULL, 'active', '2026-06-13 02:04:32', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stage_id` int(11) NOT NULL,
  `score` int(11) DEFAULT 0 COMMENT 'จำนวนดาวที่ได้ (0-3)',
  `duration_seconds` int(11) DEFAULT 0 COMMENT 'เวลาที่ใช้เล่น (วินาที)',
  `attempts` int(11) DEFAULT 1 COMMENT 'จำนวนครั้งที่เล่น',
  `completed_at` datetime DEFAULT current_timestamp(),
  `school_id` int(11) DEFAULT NULL,
  `classroom_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `learning_session_id` int(11) DEFAULT NULL
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
(11, 34, 1, 3, 24, 1, '2026-06-16 22:42:32', 2, 2, 33, 2),
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
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `work_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `school_id` int(11) DEFAULT NULL,
  `classroom_id` int(11) DEFAULT NULL
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
  `id` int(11) NOT NULL,
  `school_code` varchar(50) DEFAULT NULL,
  `school_name` varchar(255) NOT NULL,
  `district` varchar(150) DEFAULT NULL,
  `province` varchar(150) DEFAULT NULL,
  `affiliation` varchar(255) DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `status` enum('pending','approved','suspended') DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schools`
--

INSERT INTO `schools` (`id`, `school_code`, `school_name`, `district`, `province`, `affiliation`, `contact_name`, `contact_email`, `contact_phone`, `status`, `created_at`, `updated_at`) VALUES
(1, 'DEFAULT', 'โรงเรียนบ้านนาอุดม', NULL, 'มุกดาหาร', 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษามุกดาหาร', 'ครูผู้สอน', NULL, NULL, 'approved', '2026-06-03 16:17:26', NULL),
(2, 'DEMO', 'โรงเรียน Demo สำหรับทดลองใช้', 'เมือง', 'มุกดาหาร', 'OBEC Content Center Demo', 'ครูทดลอง', NULL, NULL, 'approved', '2026-06-03 16:17:26', '2026-06-04 00:59:53'),
(3, NULL, 'โรงเรียนบ้านทดสอบ', 'ทดสอบ', 'ทดสอบ', 'ทดสอบ', 'นายทดสอบ เป็นครู', 'test@test.com', '0123456789', 'approved', '2026-06-13 02:01:52', '2026-06-13 02:02:20');

-- --------------------------------------------------------

--
-- Table structure for table `stages`
--

CREATE TABLE `stages` (
  `id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `stage_number` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `instruction` text DEFAULT NULL,
  `content_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ;

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
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `work_data` text NOT NULL COMMENT 'เก็บพิกัด JSON',
  `description` text NOT NULL COMMENT 'คำอธิบายของเด็ก',
  `status` enum('pending','submitted','reviewed','revision') NOT NULL DEFAULT 'pending',
  `feedback` text DEFAULT NULL,
  `submitted_at` datetime DEFAULT current_timestamp(),
  `school_id` int(11) DEFAULT NULL,
  `classroom_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `learning_session_id` int(11) DEFAULT NULL
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
-- Table structure for table `surveys`
--

CREATE TABLE `surveys` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `survey_type` varchar(50) NOT NULL DEFAULT 'satisfaction',
  `version_label` varchar(50) NOT NULL DEFAULT 'ชุดที่ 1',
  `scale_min` int(11) NOT NULL DEFAULT 1,
  `scale_max` int(11) NOT NULL DEFAULT 5,
  `status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `surveys`
--

INSERT INTO `surveys` (`id`, `title`, `description`, `survey_type`, `version_label`, `scale_min`, `scale_max`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'แบบสอบถามความพึงพอใจของผู้เรียน', 'ประเมินประสบการณ์ของผู้เรียนที่มีต่อระบบเกมแบบฝึกทักษะออนไลน์ ภารกิจฟาร์มแก้ปัญหา', 'satisfaction', 'ชุดที่ 1', 1, 5, 'active', NULL, '2026-06-13 21:17:52', '2026-06-13 21:17:52');

-- --------------------------------------------------------

--
-- Table structure for table `survey_answers`
--

CREATE TABLE `survey_answers` (
  `id` int(11) NOT NULL,
  `response_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `rating_value` int(11) DEFAULT NULL,
  `text_answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `survey_answers`
--

INSERT INTO `survey_answers` (`id`, `response_id`, `question_id`, `rating_value`, `text_answer`) VALUES
(52, 4, 1, 4, NULL),
(53, 4, 2, 5, NULL),
(54, 4, 3, 4, NULL),
(55, 4, 4, 5, NULL),
(56, 4, 5, 5, NULL),
(57, 4, 6, 4, NULL),
(58, 4, 7, 5, NULL),
(59, 4, 8, 4, NULL),
(60, 4, 9, 5, NULL),
(61, 4, 10, 5, NULL),
(62, 4, 11, 5, NULL),
(63, 4, 12, 5, NULL),
(64, 4, 13, 5, NULL),
(65, 4, 14, 5, NULL),
(66, 4, 15, 4, NULL),
(67, 4, 16, NULL, 'ทดสอบเถอะนะ'),
(68, 4, 17, NULL, 'ทดสอบๆ');

-- --------------------------------------------------------

--
-- Table structure for table `survey_questions`
--

CREATE TABLE `survey_questions` (
  `id` int(11) NOT NULL,
  `survey_id` int(11) NOT NULL,
  `category_key` varchar(80) DEFAULT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  `question_no` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('rating','open_text') NOT NULL DEFAULT 'rating',
  `required` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `survey_questions`
--

INSERT INTO `survey_questions` (`id`, `survey_id`, `category_key`, `category_name`, `question_no`, `question_text`, `question_type`, `required`, `status`) VALUES
(1, 1, 'content_quality', 'ด้านคุณภาพเนื้อหา', 1, 'เนื้อหาในระบบเกมแบบฝึกทักษะออนไลน์มีความสอดคล้องกับเรื่องการแก้ปัญหาอย่างเป็นขั้นตอน', 'rating', 1, 'active'),
(2, 1, 'content_quality', 'ด้านคุณภาพเนื้อหา', 2, 'เนื้อหาในระบบเกมมีความเหมาะสมกับระดับความรู้ของผู้เรียนชั้นประถมศึกษาปีที่ 4', 'rating', 1, 'active'),
(3, 1, 'content_quality', 'ด้านคุณภาพเนื้อหา', 3, 'เนื้อหาในระบบเกมช่วยให้ผู้เรียนเข้าใจการคิดอย่างเป็นเหตุเป็นผลมากขึ้น', 'rating', 1, 'active'),
(4, 1, 'learning_motivation', 'ด้านแรงจูงใจในการเรียนรู้', 4, 'ระบบเกมแบบฝึกทักษะออนไลน์ช่วยกระตุ้นความสนใจของผู้เรียนในการเรียนวิทยาการคำนวณ', 'rating', 1, 'active'),
(5, 1, 'learning_motivation', 'ด้านแรงจูงใจในการเรียนรู้', 5, 'กิจกรรมในระบบเกมช่วยให้ผู้เรียนมีความกระตือรือร้นในการเรียนรู้มากขึ้น', 'rating', 1, 'active'),
(6, 1, 'learning_motivation', 'ด้านแรงจูงใจในการเรียนรู้', 6, 'ระบบเกมช่วยส่งเสริมให้ผู้เรียนพยายามทำภารกิจให้สำเร็จด้วยตนเอง', 'rating', 1, 'active'),
(7, 1, 'user_experience', 'ด้านประสบการณ์ผู้ใช้', 7, 'ระบบเกมแบบฝึกทักษะออนไลน์มีขั้นตอนการเข้าใช้งานที่ชัดเจนและไม่ซับซ้อน', 'rating', 1, 'active'),
(8, 1, 'user_experience', 'ด้านประสบการณ์ผู้ใช้', 8, 'ปุ่ม เมนู ข้อความ และสัญลักษณ์ภายในระบบมีความชัดเจนต่อการใช้งาน', 'rating', 1, 'active'),
(9, 1, 'user_experience', 'ด้านประสบการณ์ผู้ใช้', 9, 'การจัดวางภาพ สี ตัวอักษร และองค์ประกอบบนหน้าจอมีความเหมาะสมต่อผู้เรียน', 'rating', 1, 'active'),
(10, 1, 'feedback_quality', 'ด้านคุณภาพผลย้อนกลับ', 10, 'ระบบเกมแสดงผลการทำกิจกรรมให้ผู้เรียนทราบได้อย่างชัดเจน', 'rating', 1, 'active'),
(11, 1, 'feedback_quality', 'ด้านคุณภาพผลย้อนกลับ', 11, 'ระบบเกมช่วยให้ผู้เรียนเห็นข้อผิดพลาดของตนเองและสามารถปรับปรุงวิธีคิดได้', 'rating', 1, 'active'),
(12, 1, 'feedback_quality', 'ด้านคุณภาพผลย้อนกลับ', 12, 'ผลย้อนกลับภายในระบบช่วยสนับสนุนให้ผู้เรียนแก้ปัญหาได้อย่างเหมาะสมมากขึ้น', 'rating', 1, 'active'),
(13, 1, 'learning_benefit', 'ด้านประโยชน์ทางการเรียนรู้', 13, 'ระบบเกมแบบฝึกทักษะออนไลน์ช่วยส่งเสริมทักษะการคิดและการแก้ปัญหาอย่างเป็นขั้นตอน', 'rating', 1, 'active'),
(14, 1, 'learning_benefit', 'ด้านประโยชน์ทางการเรียนรู้', 14, 'ระบบเกมแบบฝึกทักษะออนไลน์มีประโยชน์ต่อการเรียนรายวิชาวิทยาการคำนวณ', 'rating', 1, 'active'),
(15, 1, 'learning_benefit', 'ด้านประโยชน์ทางการเรียนรู้', 15, 'ระบบเกมแบบฝึกทักษะออนไลน์ช่วยให้ผู้เรียนเห็นคุณค่าของการเรียนรู้ผ่านการลงมือปฏิบัติ', 'rating', 1, 'active'),
(16, 1, 'open_feedback', 'คำถามปลายเปิด', 16, 'สิ่งที่ผู้เรียนชอบมากที่สุดจากการใช้ระบบเกมแบบฝึกทักษะออนไลน์คืออะไร', 'open_text', 0, 'active'),
(17, 1, 'open_feedback', 'คำถามปลายเปิด', 17, 'สิ่งที่ผู้เรียนเห็นว่าควรปรับปรุงหรือพัฒนาเพิ่มเติมในระบบเกมแบบฝึกทักษะออนไลน์คืออะไร', 'open_text', 0, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `survey_responses`
--

CREATE TABLE `survey_responses` (
  `id` int(11) NOT NULL,
  `survey_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `classroom_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `learning_session_id` int(11) NOT NULL,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('submitted','cancelled') NOT NULL DEFAULT 'submitted'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `survey_responses`
--

INSERT INTO `survey_responses` (`id`, `survey_id`, `user_id`, `school_id`, `classroom_id`, `teacher_id`, `learning_session_id`, `submitted_at`, `status`) VALUES
(4, 1, 34, 2, 2, 33, 2, '2026-06-13 21:56:02', 'submitted');

-- --------------------------------------------------------

--
-- Table structure for table `survey_settings`
--

CREATE TABLE `survey_settings` (
  `id` int(11) NOT NULL,
  `learning_session_id` int(11) NOT NULL,
  `survey_id` int(11) DEFAULT NULL,
  `survey_status` enum('locked','open','closed') NOT NULL DEFAULT 'locked',
  `required_after_posttest` tinyint(1) NOT NULL DEFAULT 1,
  `allow_edit` tinyint(1) NOT NULL DEFAULT 0,
  `show_summary_to_student` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `survey_settings`
--

INSERT INTO `survey_settings` (`id`, `learning_session_id`, `survey_id`, `survey_status`, `required_after_posttest`, `allow_edit`, `show_summary_to_student`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'open', 1, 0, 0, '2026-06-13 21:17:52', '2026-06-13 21:36:56'),
(2, 2, 1, 'open', 1, 0, 0, '2026-06-13 21:17:52', '2026-06-13 21:38:15'),
(3, 3, 1, 'locked', 1, 0, 0, '2026-06-13 21:17:52', '2026-06-13 21:17:52');

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
  `id` int(11) NOT NULL,
  `title_name` varchar(100) NOT NULL,
  `min_stars_required` int(11) NOT NULL,
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
  `user_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `class_level` varchar(10) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','admin','super_admin','teacher','demo') DEFAULT 'student',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `last_seen` timestamp NULL DEFAULT NULL,
  `team_id` varchar(50) DEFAULT NULL COMMENT 'ID ของทีมในเซสชันนั้นๆ',
  `mode` enum('solo','group') DEFAULT NULL,
  `team_role` varchar(20) DEFAULT NULL COMMENT 'บทบาทในทีม (เช่น driver, navigator)',
  `group_number` int(11) DEFAULT NULL COMMENT 'หมายเลขกลุ่ม (1-8)',
  `school_id` int(11) DEFAULT NULL,
  `classroom_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `status` enum('pending','active','suspended') DEFAULT 'active',
  `approved_at` datetime DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `student_id`, `name`, `class_level`, `password`, `role`, `created_at`, `last_seen`, `team_id`, `mode`, `team_role`, `group_number`, `school_id`, `classroom_id`, `teacher_id`, `email`, `phone`, `status`, `approved_at`, `approved_by`) VALUES
(1, 'admin', 'ครูผู้สอน', NULL, '$2y$10$rVth9N8rAGirBUBMMpbpDuLwYf0vYyf.SYBuDudRut1r6XEcmi886', 'super_admin', '2026-01-11 17:22:45', '2026-06-12 18:59:38', NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, 'active', NULL, NULL),
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
(34, 'demo01', 'นักเรียนทดลอง หนึ่ง', 'ป.4', '$2y$10$DswC7hU5ouhjgaOFermzsOaCw0jNoFvoFkxcEXWq0.J6DxxIsjaEO', 'student', '2026-06-03 09:17:26', '2026-06-16 16:59:37', 'team_6a316eab8a750', 'solo', 'solo', NULL, 2, 2, 33, NULL, NULL, 'active', NULL, NULL),
(35, 'T40CC702E3E', 'นายทดสอบ เป็นครู', NULL, '$2y$10$RjEbMh/aFEuj43b3.P3LWeJspGQ0RKRVhNrV1nQBJ7CVGG1Wm0zy.', 'teacher', '2026-06-12 19:01:52', '2026-06-12 19:04:38', NULL, NULL, NULL, NULL, 3, NULL, NULL, 'test@test.com', '0123456789', 'active', '2026-06-13 02:02:20', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assessments`
--
ALTER TABLE `assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_assessments_type_status` (`assessment_type`,`status`),
  ADD KEY `idx_assessments_created_by` (`created_by`);

--
-- Indexes for table `assessment_answers`
--
ALTER TABLE `assessment_answers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_attempt_question` (`attempt_id`,`question_id`),
  ADD KEY `idx_answer_question` (`question_id`);

--
-- Indexes for table `assessment_attempts`
--
ALTER TABLE `assessment_attempts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_assessment_attempt` (`assessment_id`,`user_id`,`learning_session_id`,`attempt_no`),
  ADD KEY `idx_attempt_context` (`school_id`,`classroom_id`,`teacher_id`,`learning_session_id`),
  ADD KEY `idx_attempt_user_status` (`user_id`,`status`),
  ADD KEY `fk_attempt_classroom` (`classroom_id`),
  ADD KEY `fk_attempt_teacher` (`teacher_id`),
  ADD KEY `fk_attempt_session` (`learning_session_id`);

--
-- Indexes for table `assessment_questions`
--
ALTER TABLE `assessment_questions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_assessment_question_no` (`assessment_id`,`question_no`),
  ADD KEY `idx_assessment_questions_game` (`game_id`);

--
-- Indexes for table `assessment_settings`
--
ALTER TABLE `assessment_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_assessment_session` (`learning_session_id`),
  ADD KEY `idx_setting_pretest` (`pretest_assessment_id`),
  ADD KEY `idx_setting_posttest` (`posttest_assessment_id`);

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
-- Indexes for table `student_works`
--
ALTER TABLE `student_works`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `surveys`
--
ALTER TABLE `surveys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_survey_type_version` (`survey_type`,`version_label`),
  ADD KEY `idx_surveys_status` (`status`),
  ADD KEY `fk_surveys_creator` (`created_by`);

--
-- Indexes for table `survey_answers`
--
ALTER TABLE `survey_answers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_survey_answer` (`response_id`,`question_id`),
  ADD KEY `idx_survey_answer_question` (`question_id`);

--
-- Indexes for table `survey_questions`
--
ALTER TABLE `survey_questions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_survey_question_no` (`survey_id`,`question_no`),
  ADD KEY `idx_survey_questions_category` (`survey_id`,`category_key`,`question_type`);

--
-- Indexes for table `survey_responses`
--
ALTER TABLE `survey_responses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_survey_response` (`survey_id`,`user_id`,`learning_session_id`),
  ADD KEY `idx_survey_response_context` (`school_id`,`classroom_id`,`teacher_id`,`learning_session_id`),
  ADD KEY `fk_survey_response_user` (`user_id`),
  ADD KEY `fk_survey_response_classroom` (`classroom_id`),
  ADD KEY `fk_survey_response_teacher` (`teacher_id`),
  ADD KEY `fk_survey_response_session` (`learning_session_id`);

--
-- Indexes for table `survey_settings`
--
ALTER TABLE `survey_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_survey_setting_session` (`learning_session_id`),
  ADD KEY `idx_survey_setting_survey` (`survey_id`);

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
-- AUTO_INCREMENT for table `assessments`
--
ALTER TABLE `assessments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `assessment_answers`
--
ALTER TABLE `assessment_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `assessment_attempts`
--
ALTER TABLE `assessment_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `assessment_questions`
--
ALTER TABLE `assessment_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `assessment_settings`
--
ALTER TABLE `assessment_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `classrooms`
--
ALTER TABLE `classrooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `game_logs`
--
ALTER TABLE `game_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

--
-- AUTO_INCREMENT for table `learning_sessions`
--
ALTER TABLE `learning_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `project_likes`
--
ALTER TABLE `project_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stages`
--
ALTER TABLE `stages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_works`
--
ALTER TABLE `student_works`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `surveys`
--
ALTER TABLE `surveys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `survey_answers`
--
ALTER TABLE `survey_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `survey_questions`
--
ALTER TABLE `survey_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `survey_responses`
--
ALTER TABLE `survey_responses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `survey_settings`
--
ALTER TABLE `survey_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `titles`
--
ALTER TABLE `titles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assessments`
--
ALTER TABLE `assessments`
  ADD CONSTRAINT `fk_assessments_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `assessment_answers`
--
ALTER TABLE `assessment_answers`
  ADD CONSTRAINT `fk_answer_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `assessment_attempts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `assessment_questions` (`id`);

--
-- Constraints for table `assessment_attempts`
--
ALTER TABLE `assessment_attempts`
  ADD CONSTRAINT `fk_attempt_assessment` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`),
  ADD CONSTRAINT `fk_attempt_classroom` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms` (`id`),
  ADD CONSTRAINT `fk_attempt_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  ADD CONSTRAINT `fk_attempt_session` FOREIGN KEY (`learning_session_id`) REFERENCES `learning_sessions` (`id`),
  ADD CONSTRAINT `fk_attempt_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_attempt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `assessment_questions`
--
ALTER TABLE `assessment_questions`
  ADD CONSTRAINT `fk_assessment_questions_assessment` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_assessment_questions_game` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`);

--
-- Constraints for table `assessment_settings`
--
ALTER TABLE `assessment_settings`
  ADD CONSTRAINT `fk_setting_posttest` FOREIGN KEY (`posttest_assessment_id`) REFERENCES `assessments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_setting_pretest` FOREIGN KEY (`pretest_assessment_id`) REFERENCES `assessments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_setting_session` FOREIGN KEY (`learning_session_id`) REFERENCES `learning_sessions` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `surveys`
--
ALTER TABLE `surveys`
  ADD CONSTRAINT `fk_surveys_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `survey_questions`
--
ALTER TABLE `survey_questions`
  ADD CONSTRAINT `fk_survey_questions_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `survey_responses`
--
ALTER TABLE `survey_responses`
  ADD CONSTRAINT `fk_survey_response_classroom` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms` (`id`),
  ADD CONSTRAINT `fk_survey_response_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  ADD CONSTRAINT `fk_survey_response_session` FOREIGN KEY (`learning_session_id`) REFERENCES `learning_sessions` (`id`),
  ADD CONSTRAINT `fk_survey_response_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`),
  ADD CONSTRAINT `fk_survey_response_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_survey_response_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `survey_settings`
--
ALTER TABLE `survey_settings`
  ADD CONSTRAINT `fk_survey_setting_session` FOREIGN KEY (`learning_session_id`) REFERENCES `learning_sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_survey_setting_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
