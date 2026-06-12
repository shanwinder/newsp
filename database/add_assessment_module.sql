-- Assessment Module: pre-test and post-test for the active learning session.
-- Run once after database/new_learning_game.sql.

CREATE TABLE IF NOT EXISTS `assessments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assessment_type` enum('pretest','posttest') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `total_questions` int NOT NULL DEFAULT 20,
  `full_score` int NOT NULL DEFAULT 20,
  `time_limit_minutes` int NOT NULL DEFAULT 30,
  `status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
  `version_label` varchar(50) NOT NULL DEFAULT 'ชุดที่ 1',
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assessments_type_status` (`assessment_type`,`status`),
  KEY `idx_assessments_created_by` (`created_by`),
  CONSTRAINT `fk_assessments_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `assessment_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assessment_id` int NOT NULL,
  `game_id` int NOT NULL,
  `question_no` int NOT NULL,
  `cognitive_level` enum('remember','understand','apply','analyze') NOT NULL,
  `question_text` text NOT NULL,
  `choice_a` text NOT NULL,
  `choice_b` text NOT NULL,
  `choice_c` text NOT NULL,
  `choice_d` text NOT NULL,
  `correct_choice` enum('A','B','C','D') NOT NULL,
  `explanation` text,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_assessment_question_no` (`assessment_id`,`question_no`),
  KEY `idx_assessment_questions_game` (`game_id`),
  CONSTRAINT `fk_assessment_questions_assessment` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assessment_questions_game` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `assessment_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assessment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `school_id` int NOT NULL,
  `classroom_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `learning_session_id` int NOT NULL,
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `submitted_at` datetime DEFAULT NULL,
  `score` int DEFAULT NULL,
  `full_score` int NOT NULL,
  `percent_score` decimal(5,2) DEFAULT NULL,
  `status` enum('in_progress','submitted','cancelled') NOT NULL DEFAULT 'in_progress',
  `attempt_no` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_assessment_attempt` (`assessment_id`,`user_id`,`learning_session_id`,`attempt_no`),
  KEY `idx_attempt_context` (`school_id`,`classroom_id`,`teacher_id`,`learning_session_id`),
  KEY `idx_attempt_user_status` (`user_id`,`status`),
  CONSTRAINT `fk_attempt_assessment` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_attempt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attempt_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_attempt_classroom` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_attempt_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_attempt_session` FOREIGN KEY (`learning_session_id`) REFERENCES `learning_sessions` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `assessment_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `attempt_id` int NOT NULL,
  `question_id` int NOT NULL,
  `selected_choice` enum('A','B','C','D') NOT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `answered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_attempt_question` (`attempt_id`,`question_id`),
  KEY `idx_answer_question` (`question_id`),
  CONSTRAINT `fk_answer_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `assessment_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `assessment_questions` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `assessment_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `learning_session_id` int NOT NULL,
  `pretest_assessment_id` int DEFAULT NULL,
  `posttest_assessment_id` int DEFAULT NULL,
  `pretest_status` enum('locked','unlocked') NOT NULL DEFAULT 'locked',
  `posttest_status` enum('locked','unlocked') NOT NULL DEFAULT 'locked',
  `pretest_required` tinyint(1) NOT NULL DEFAULT 1,
  `posttest_required` tinyint(1) NOT NULL DEFAULT 0,
  `show_score_to_student` tinyint(1) NOT NULL DEFAULT 0,
  `allow_retake` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_assessment_session` (`learning_session_id`),
  KEY `idx_setting_pretest` (`pretest_assessment_id`),
  KEY `idx_setting_posttest` (`posttest_assessment_id`),
  CONSTRAINT `fk_setting_session` FOREIGN KEY (`learning_session_id`) REFERENCES `learning_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_setting_pretest` FOREIGN KEY (`pretest_assessment_id`) REFERENCES `assessments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_setting_posttest` FOREIGN KEY (`posttest_assessment_id`) REFERENCES `assessments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO assessments (assessment_type, title, description, total_questions, full_score, time_limit_minutes, status, version_label, created_by)
SELECT 'pretest', 'แบบทดสอบก่อนเรียน ชุดที่ 1', 'วัดความรู้พื้นฐานก่อนเริ่มภารกิจ 4 บทเรียน', 20, 20, 30, 'active', 'ชุดที่ 1', NULL
WHERE NOT EXISTS (SELECT 1 FROM assessments WHERE assessment_type = 'pretest' AND version_label = 'ชุดที่ 1');
SET @pre_id = (SELECT id FROM assessments WHERE assessment_type = 'pretest' AND version_label = 'ชุดที่ 1' ORDER BY id LIMIT 1);

INSERT INTO assessments (assessment_type, title, description, total_questions, full_score, time_limit_minutes, status, version_label, created_by)
SELECT 'posttest', 'แบบทดสอบหลังเรียน ชุดที่ 1', 'วัดผลการเรียนรู้หลังจบภารกิจ 4 บทเรียน', 20, 20, 30, 'active', 'ชุดที่ 1', NULL
WHERE NOT EXISTS (SELECT 1 FROM assessments WHERE assessment_type = 'posttest' AND version_label = 'ชุดที่ 1');
SET @post_id = (SELECT id FROM assessments WHERE assessment_type = 'posttest' AND version_label = 'ชุดที่ 1' ORDER BY id LIMIT 1);

INSERT IGNORE INTO assessment_questions
(assessment_id, game_id, question_no, cognitive_level, question_text, choice_a, choice_b, choice_c, choice_d, correct_choice, explanation) VALUES
(@pre_id,1,1,'remember','ข้อใดอธิบายการใช้เหตุผลเชิงตรรกะได้เหมาะสมที่สุด','เดาคำตอบโดยไม่ดูข้อมูล','พิจารณาข้อมูลและสรุปอย่างมีเหตุผล','เลือกคำตอบที่ยาวที่สุด','ทำตามเพื่อนทุกครั้ง','B','การใช้ตรรกะต้องพิจารณาข้อมูลและเหตุผล'),
(@pre_id,1,2,'understand','ถ้ากำหนดว่า “ผลไม้สีแดงทุกลูกใส่ตะกร้า ก” แอปเปิลสีเขียวควรอยู่ที่ใด','ตะกร้า ก','ไม่เข้าตะกร้า ก','ใส่ได้ทั้งสองที่','ทิ้งทันที','B','แอปเปิลสีเขียวไม่ตรงเงื่อนไขสีแดง'),
(@pre_id,1,3,'apply','มีบัตรเลข 2, 5, 8 กติกาคือเลือกเลขที่มากกว่า 4 ควรเลือกข้อใด','2 เท่านั้น','5 เท่านั้น','5 และ 8','2 และ 5','C','5 และ 8 มากกว่า 4'),
(@pre_id,1,4,'apply','กติกาคัดเมล็ดคือ “ถ้าเมล็ดสมบูรณ์และไม่เปียก ให้เก็บ” เมล็ดสมบูรณ์แต่เปียกควรทำอย่างไร','เก็บ','ไม่เก็บ','เก็บครึ่งหนึ่ง','ข้อมูลไม่เกี่ยวกัน','B','ต้องตรงทั้งสองเงื่อนไข'),
(@pre_id,1,5,'analyze','ข้อมูลใดเพียงพอที่สุดในการตัดสินว่าผักควรผ่านจุดคัดหรือไม่','สีที่ชอบของผู้คัด','เงื่อนไขการคัดและลักษณะของผัก','ชื่อคนปลูก','ราคาตะกร้า','B','ต้องเปรียบเทียบลักษณะจริงกับเงื่อนไข'),
(@pre_id,2,6,'remember','สิ่งใดคือ “ลำดับขั้นตอน”','รายการงานที่ทำสลับอย่างไรก็ได้','การจัดงานตามก่อนและหลัง','การเลือกสีให้สวย','การนับจำนวนคน','B','ลำดับขั้นตอนระบุสิ่งที่ต้องทำก่อนและหลัง'),
(@pre_id,2,7,'understand','เหตุใดการเรียงขั้นตอนจึงสำคัญ','ทำให้งานมีตัวหนังสือมากขึ้น','ช่วยให้งานไปถึงเป้าหมายอย่างถูกต้อง','ทำให้ไม่ต้องตรวจงาน','ทำให้ทุกขั้นใช้เวลาเท่ากัน','B','ลำดับที่ถูกช่วยลดความผิดพลาด'),
(@pre_id,2,8,'apply','ต้องชงนม: 1 เทนม 2 เตรียมแก้ว 3 คนให้เข้ากัน ลำดับใดเหมาะสม','1-2-3','2-1-3','3-1-2','2-3-1','B','ต้องเตรียมภาชนะก่อนเทและคน'),
(@pre_id,2,9,'apply','รถไถหันขึ้น ต้องไปขวาหนึ่งช่อง ควรทำคำสั่งใดก่อน','เดินหน้า','เลี้ยวขวา','เลี้ยวซ้ายสองครั้ง','หยุด','B','ต้องเปลี่ยนทิศก่อนเดินไปทางขวา'),
(@pre_id,2,10,'analyze','แผนเดินทาง “เดินหน้า 2 เลี้ยวซ้าย เดินหน้า 1” แต่มีหินอยู่ช่องที่สอง ควรปรับอย่างไร','ใช้แผนเดิม','วางเส้นทางหลบหินก่อนถึงช่องที่สอง','เพิ่มเดินหน้าอีก 2','ลบทุกคำสั่ง','B','ต้องวิเคราะห์สิ่งกีดขวางและเปลี่ยนเส้นทาง'),
(@pre_id,3,11,'remember','คำว่า “ถ้า...แล้ว...” ใช้ทำอะไร','กำหนดการตัดสินใจตามเงื่อนไข','ตกแต่งข้อความ','นับคะแนนเท่านั้น','เริ่มงานโดยไม่ตรวจอะไร','A','เป็นโครงสร้างเงื่อนไข'),
(@pre_id,3,12,'understand','กฎ “ถ้าฝนตก ให้กางร่ม” เมื่อฝนไม่ตกควรเป็นอย่างไร','ต้องกางร่มเสมอ','ไม่จำเป็นต้องกางร่มตามกฎนี้','ทิ้งร่ม','หยุดเดินตลอดวัน','B','คำสั่งทำเมื่อเงื่อนไขเป็นจริง'),
(@pre_id,3,13,'apply','ถ้าคะแนนตั้งแต่ 8 ขึ้นไปได้ดาวทอง ผู้ที่ได้ 8 คะแนนควรได้อะไร','ไม่ได้ดาว','ดาวทอง','ดาวเงินเท่านั้น','ต้องสอบใหม่','B','ตั้งแต่ 8 รวมค่า 8'),
(@pre_id,3,14,'apply','กฎคือ “ถ้าผักเปื้อนโคลนให้ล้าง มิฉะนั้นส่งบรรจุ” ผักสะอาดควรไปที่ใด','เครื่องล้าง','จุดบรรจุ','ถังขยะ','ย้อนกลับสวน','B','เงื่อนไขเป็นเท็จจึงทำส่วนมิฉะนั้น'),
(@pre_id,3,15,'analyze','กฎใดแยกผลผลิตสุกและไม่สุกได้ครบถ้วนที่สุด','ถ้าสุกให้ขาย','ถ้าสุกให้ขาย มิฉะนั้นส่งไปบ่ม','ขายทุกชิ้น','ส่งไปบ่มทุกชิ้น','B','มีทางเลือกสำหรับทั้งสองกรณี'),
(@pre_id,4,16,'remember','การตรวจสอบและแก้ไขข้อผิดพลาดเรียกว่าอะไร','การสุ่ม','การดีบัก','การตกแต่ง','การทำซ้ำโดยไม่ดูผล','B','Debugging คือการค้นหาและแก้ข้อผิดพลาด'),
(@pre_id,4,17,'understand','เมื่อผลลัพธ์ไม่ตรงเป้าหมาย ควรทำสิ่งใดก่อน','ลบงานทั้งหมดทันที','เปรียบเทียบผลที่ได้กับผลที่คาดหวัง','เดาคำสั่งใหม่หลายคำสั่ง','หยุดตรวจ','B','ต้องเห็นจุดต่างก่อนหาสาเหตุ'),
(@pre_id,4,18,'apply','คำสั่งควรเป็น “เดินหน้า เลี้ยวขวา” แต่เขียน “เดินหน้า เลี้ยวซ้าย” จุดผิดอยู่ที่ใด','คำสั่งแรก','คำสั่งที่สอง','ไม่มีข้อผิดพลาด','ทุกคำสั่ง','B','ทิศการเลี้ยวไม่ตรงแผน'),
(@pre_id,4,19,'apply','กฎให้ล้างแครอทเปื้อนโคลน แต่ระบบปล่อยผ่าน ควรตรวจส่วนใด','เงื่อนไขและคำสั่งเมื่อเงื่อนไขเป็นจริง','สีพื้นหลัง','ชื่อผู้เล่น','จำนวนดาว','A','อาการเกี่ยวกับการตรวจเงื่อนไขหรือคำสั่งล้าง'),
(@pre_id,4,20,'analyze','วิธีใดช่วยยืนยันว่าแก้ข้อผิดพลาดสำเร็จ','แก้แล้วไม่ต้องลอง','ทดสอบด้วยข้อมูลเดิมและกรณีอื่นที่เกี่ยวข้อง','ดูเฉพาะหน้าตา','ถามเพื่อนโดยไม่รัน','B','ต้องทดสอบซ้ำและครอบคลุมหลายกรณี');

INSERT IGNORE INTO assessment_questions
(assessment_id, game_id, question_no, cognitive_level, question_text, choice_a, choice_b, choice_c, choice_d, correct_choice, explanation) VALUES
(@post_id,1,1,'remember','การตัดสินใจแบบมีเหตุผลควรอาศัยสิ่งใด','ความชอบส่วนตัวเท่านั้น','ข้อมูล เงื่อนไข และเหตุผล','คำตอบของคนข้าง ๆ','การเลือกแบบสุ่ม','B','การใช้ตรรกะอาศัยข้อมูลและเงื่อนไข'),
(@post_id,1,2,'understand','กำหนดว่า “ถุงที่มีเครื่องหมายดาวเท่านั้นจึงผ่าน” ถุงไม่มีดาวควรเป็นอย่างไร','ผ่าน','ไม่ผ่าน','ผ่านครึ่งถุง','ต้องเปลี่ยนสี','B','ถุงไม่มีดาวไม่ตรงเงื่อนไข'),
(@post_id,1,3,'apply','มีเลข 3, 6, 9 กติกาคือเลือกเลขคู่ ควรเลือกข้อใด','3','6','9','3 และ 9','B','6 เป็นเลขคู่เพียงจำนวนเดียว'),
(@post_id,1,4,'apply','กติกาเก็บผลผลิตคือ “สุกและไม่มีรอยช้ำ” มะเขือเทศสุกแต่ช้ำควรทำอย่างไร','เก็บ','ไม่เก็บ','เก็บเพราะสุกอย่างเดียวพอ','ตัดสินไม่ได้ทั้งที่ข้อมูลครบ','B','เงื่อนไข AND ต้องจริงทั้งคู่'),
(@post_id,1,5,'analyze','เมื่อต้องคัดสิ่งของตามกฎ วิธีใดน่าเชื่อถือที่สุด','ตรวจทีละลักษณะเทียบกับกฎ','ดูจากชื่อเจ้าของ','ใช้ความรู้สึก','เลือกทุกชิ้นไว้ก่อน','A','การเทียบข้อมูลกับกฎอย่างเป็นขั้นตอนตรวจสอบได้'),
(@post_id,2,6,'remember','ข้อใดเป็นตัวอย่างของขั้นตอนที่มีลำดับ','กิจกรรมที่เลือกทำแบบใดก็ได้','ขั้นตอนล้างมือก่อนรับประทานอาหาร','รายชื่อสีที่ชอบ','จำนวนโต๊ะในห้อง','B','การล้างมือมีลำดับการปฏิบัติ'),
(@post_id,2,7,'understand','ถ้าสลับขั้นตอนที่ต้องพึ่งพากัน อาจเกิดอะไรขึ้น','ผลลัพธ์อาจผิดหรือทำงานไม่ได้','งานถูกเสมอ','ไม่มีผลทุกกรณี','จำนวนขั้นตอนหายไปเอง','A','บางขั้นต้องเสร็จก่อนอีกขั้น'),
(@post_id,2,8,'apply','ปลูกต้นไม้: 1 รดน้ำ 2 ใส่ต้นกล้าในหลุม 3 ขุดหลุม ลำดับใดเหมาะสม','1-2-3','3-2-1','2-1-3','3-1-2','B','ขุดหลุม ใส่ต้นกล้า แล้วรดน้ำ'),
(@post_id,2,9,'apply','ตัวละครหันซ้าย ต้องการไปด้านบนหนึ่งช่อง ควรทำอย่างไร','เลี้ยวขวาแล้วเดินหน้า','เดินหน้าเลย','เลี้ยวซ้ายแล้วเดินหน้า','ถอยหลังสองครั้ง','A','จากซ้ายเลี้ยวขวาจะหันขึ้น'),
(@post_id,2,10,'analyze','เส้นทางเดิมชนรั้ว วิธีแก้ที่เหมาะสมคือข้อใด','เพิ่มคำสั่งเดินหน้าเข้ารั้ว','หาจุดที่ชนแล้วปรับลำดับเลี้ยวและเดิน','ทำซ้ำแผนเดิม','ลบเป้าหมาย','B','ต้องระบุตำแหน่งปัญหาและออกแบบเส้นทางใหม่'),
(@post_id,3,11,'remember','โครงสร้างใดใช้เลือกทำคำสั่งตามสถานการณ์','ถ้า...แล้ว...','เขียนคำสั่งเรียงโดยไม่ตรวจ','นับหนึ่งถึงสิบ','แสดงรูปภาพ','A','If ใช้ตรวจเงื่อนไข'),
(@post_id,3,12,'understand','กฎ “ถ้าแบตเตอรีต่ำให้ชาร์จ” เมื่อแบตเตอรีเต็มหมายความว่าอย่างไร','ต้องชาร์จตามกฎนี้','ไม่ต้องทำคำสั่งชาร์จตามกฎนี้','ปิดเครื่องเสมอ','ลบแบตเตอรี','B','เงื่อนไขแบตเตอรีต่ำเป็นเท็จ'),
(@post_id,3,13,'apply','ถ้าอุณหภูมิมากกว่า 30 ให้เปิดพัดลม เมื่ออุณหภูมิ 31 ควรทำอย่างไร','ปิดพัดลม','เปิดพัดลม','รอให้อุณหภูมิ 40','ทำอะไรก็ได้','B','31 มากกว่า 30'),
(@post_id,3,14,'apply','กฎ “ถ้ากล่องหนักให้ใช้รถเข็น มิฉะนั้นยกด้วยมือ” กล่องเบาควรทำอย่างไร','ใช้รถเข็นเท่านั้น','ยกด้วยมือ','ทิ้งกล่อง','เปิดกล่อง','B','ทำส่วนมิฉะนั้นเมื่อกล่องไม่หนัก'),
(@post_id,3,15,'analyze','ต้องแยกเมล็ดดีและเมล็ดเสีย กฎใดครอบคลุมทุกชิ้น','ถ้าเมล็ดดีให้เก็บ','ถ้าเมล็ดดีให้เก็บ มิฉะนั้นคัดออก','เก็บทั้งหมด','คัดออกทั้งหมด','B','If-else ครอบคลุมทั้งจริงและเท็จ'),
(@post_id,4,16,'remember','เป้าหมายหลักของการดีบักคืออะไร','เพิ่มจำนวนข้อผิดพลาด','ค้นหาและแก้สาเหตุที่ทำให้ผลลัพธ์ผิด','เปลี่ยนสีหน้าจอ','ทำงานเดิมโดยไม่ตรวจ','B','Debugging มุ่งให้ระบบทำงานตามเป้าหมาย'),
(@post_id,4,17,'understand','เหตุใดต้องทดสอบหลังแก้ไข','เพื่อยืนยันว่าปัญหาหายและไม่เกิดผลเสียใหม่','เพื่อให้ใช้เวลานานขึ้น','เพื่อเปลี่ยนคำตอบเดิมเสมอ','ไม่จำเป็นต้องทดสอบ','A','การทดสอบยืนยันผลของการแก้ไข'),
(@post_id,4,18,'apply','แผนต้อง “เลี้ยวซ้าย เดินหน้า” แต่ระบบ “เลี้ยวซ้าย ถอยหลัง” ควรแก้อะไร','เปลี่ยนคำสั่งที่สองเป็นเดินหน้า','เปลี่ยนคำสั่งแรกเป็นขวา','เพิ่มถอยหลัง','ไม่ต้องแก้','A','คำสั่งเคลื่อนที่ตัวที่สองผิด'),
(@post_id,4,19,'apply','ระบบส่งผักสะอาดเข้าเครื่องล้างทั้งที่ควรบรรจุ ควรตรวจอะไร','เงื่อนไขที่ระบุว่าผักเปื้อนและทางเลือกมิฉะนั้น','รูปประจำตัว','ชื่อห้อง','เสียงเกม','A','ปัญหาอยู่ที่กฎแยกเปื้อน/สะอาด'),
(@post_id,4,20,'analyze','มีข้อผิดพลาดหลายจุด วิธีใดช่วยหาสาเหตุได้ดีที่สุด','เปลี่ยนทุกอย่างพร้อมกัน','ทดสอบทีละส่วนและบันทึกผล','เดาคำตอบครั้งเดียว','ไม่ใช้ข้อมูลทดสอบ','B','แยกทดสอบทีละส่วนช่วยระบุต้นเหตุ');

-- Create default settings for every existing learning session. Teachers can change them later.
INSERT IGNORE INTO assessment_settings
(learning_session_id, pretest_assessment_id, posttest_assessment_id, pretest_status, posttest_status, pretest_required, posttest_required, show_score_to_student, allow_retake)
SELECT id, @pre_id, @post_id, 'locked', 'locked', 1, 0, 0, 0 FROM learning_sessions;
