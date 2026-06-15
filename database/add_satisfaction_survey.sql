-- Satisfaction survey module for the active learning session.
-- Run once after database/add_assessment_module.sql.

CREATE TABLE IF NOT EXISTS `surveys` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `survey_type` varchar(50) NOT NULL DEFAULT 'satisfaction',
  `version_label` varchar(50) NOT NULL DEFAULT 'ชุดที่ 1',
  `scale_min` int NOT NULL DEFAULT 1,
  `scale_max` int NOT NULL DEFAULT 5,
  `status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_survey_type_version` (`survey_type`,`version_label`),
  KEY `idx_surveys_status` (`status`),
  CONSTRAINT `fk_surveys_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `survey_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NOT NULL,
  `category_key` varchar(80) DEFAULT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  `question_no` int NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('rating','open_text') NOT NULL DEFAULT 'rating',
  `required` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_survey_question_no` (`survey_id`,`question_no`),
  KEY `idx_survey_questions_category` (`survey_id`,`category_key`,`question_type`),
  CONSTRAINT `fk_survey_questions_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `survey_responses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NOT NULL,
  `user_id` int NOT NULL,
  `school_id` int NOT NULL,
  `classroom_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `learning_session_id` int NOT NULL,
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('submitted','cancelled') NOT NULL DEFAULT 'submitted',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_survey_response` (`survey_id`,`user_id`,`learning_session_id`),
  KEY `idx_survey_response_context` (`school_id`,`classroom_id`,`teacher_id`,`learning_session_id`),
  CONSTRAINT `fk_survey_response_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_survey_response_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_survey_response_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_survey_response_classroom` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_survey_response_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_survey_response_session` FOREIGN KEY (`learning_session_id`) REFERENCES `learning_sessions` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `survey_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `response_id` int NOT NULL,
  `question_id` int NOT NULL,
  `rating_value` int DEFAULT NULL,
  `text_answer` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_survey_answer` (`response_id`,`question_id`),
  KEY `idx_survey_answer_question` (`question_id`),
  CONSTRAINT `fk_survey_answer_response` FOREIGN KEY (`response_id`) REFERENCES `survey_responses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_survey_answer_question` FOREIGN KEY (`question_id`) REFERENCES `survey_questions` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_survey_rating` CHECK (`rating_value` IS NULL OR (`rating_value` BETWEEN 1 AND 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `survey_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `learning_session_id` int NOT NULL,
  `survey_id` int DEFAULT NULL,
  `survey_status` enum('locked','open','closed') NOT NULL DEFAULT 'locked',
  `required_after_posttest` tinyint(1) NOT NULL DEFAULT 1,
  `allow_edit` tinyint(1) NOT NULL DEFAULT 0,
  `show_summary_to_student` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_survey_setting_session` (`learning_session_id`),
  KEY `idx_survey_setting_survey` (`survey_id`),
  CONSTRAINT `fk_survey_setting_session` FOREIGN KEY (`learning_session_id`) REFERENCES `learning_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_survey_setting_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO surveys (title, description, survey_type, version_label, scale_min, scale_max, status, created_by)
SELECT 'แบบสอบถามความพึงพอใจของผู้เรียน',
       'ประเมินประสบการณ์ของผู้เรียนที่มีต่อระบบเกมแบบฝึกทักษะออนไลน์ ภารกิจฟาร์มแก้ปัญหา',
       'satisfaction', 'ชุดที่ 1', 1, 5, 'active', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM surveys WHERE survey_type = 'satisfaction' AND version_label = 'ชุดที่ 1'
);

SET @survey_id = (
  SELECT id FROM surveys WHERE survey_type = 'satisfaction' AND version_label = 'ชุดที่ 1' ORDER BY id LIMIT 1
);

INSERT IGNORE INTO survey_questions
(survey_id, category_key, category_name, question_no, question_text, question_type, required, status) VALUES
(@survey_id,'content_quality','ด้านคุณภาพเนื้อหา',1,'เนื้อหาในระบบเกมแบบฝึกทักษะออนไลน์มีความสอดคล้องกับเรื่องการแก้ปัญหาอย่างเป็นขั้นตอน','rating',1,'active'),
(@survey_id,'content_quality','ด้านคุณภาพเนื้อหา',2,'เนื้อหาในระบบเกมมีความเหมาะสมกับระดับความรู้ของผู้เรียนชั้นประถมศึกษาปีที่ 4','rating',1,'active'),
(@survey_id,'content_quality','ด้านคุณภาพเนื้อหา',3,'เนื้อหาในระบบเกมช่วยให้ผู้เรียนเข้าใจการคิดอย่างเป็นเหตุเป็นผลมากขึ้น','rating',1,'active'),
(@survey_id,'learning_motivation','ด้านแรงจูงใจในการเรียนรู้',4,'ระบบเกมแบบฝึกทักษะออนไลน์ช่วยกระตุ้นความสนใจของผู้เรียนในการเรียนวิทยาการคำนวณ','rating',1,'active'),
(@survey_id,'learning_motivation','ด้านแรงจูงใจในการเรียนรู้',5,'กิจกรรมในระบบเกมช่วยให้ผู้เรียนมีความกระตือรือร้นในการเรียนรู้มากขึ้น','rating',1,'active'),
(@survey_id,'learning_motivation','ด้านแรงจูงใจในการเรียนรู้',6,'ระบบเกมช่วยส่งเสริมให้ผู้เรียนพยายามทำภารกิจให้สำเร็จด้วยตนเอง','rating',1,'active'),
(@survey_id,'user_experience','ด้านประสบการณ์ผู้ใช้',7,'ระบบเกมแบบฝึกทักษะออนไลน์มีขั้นตอนการเข้าใช้งานที่ชัดเจนและไม่ซับซ้อน','rating',1,'active'),
(@survey_id,'user_experience','ด้านประสบการณ์ผู้ใช้',8,'ปุ่ม เมนู ข้อความ และสัญลักษณ์ภายในระบบมีความชัดเจนต่อการใช้งาน','rating',1,'active'),
(@survey_id,'user_experience','ด้านประสบการณ์ผู้ใช้',9,'การจัดวางภาพ สี ตัวอักษร และองค์ประกอบบนหน้าจอมีความเหมาะสมต่อผู้เรียน','rating',1,'active'),
(@survey_id,'feedback_quality','ด้านคุณภาพผลย้อนกลับ',10,'ระบบเกมแสดงผลการทำกิจกรรมให้ผู้เรียนทราบได้อย่างชัดเจน','rating',1,'active'),
(@survey_id,'feedback_quality','ด้านคุณภาพผลย้อนกลับ',11,'ระบบเกมช่วยให้ผู้เรียนเห็นข้อผิดพลาดของตนเองและสามารถปรับปรุงวิธีคิดได้','rating',1,'active'),
(@survey_id,'feedback_quality','ด้านคุณภาพผลย้อนกลับ',12,'ผลย้อนกลับภายในระบบช่วยสนับสนุนให้ผู้เรียนแก้ปัญหาได้อย่างเหมาะสมมากขึ้น','rating',1,'active'),
(@survey_id,'learning_benefit','ด้านประโยชน์ทางการเรียนรู้',13,'ระบบเกมแบบฝึกทักษะออนไลน์ช่วยส่งเสริมทักษะการคิดและการแก้ปัญหาอย่างเป็นขั้นตอน','rating',1,'active'),
(@survey_id,'learning_benefit','ด้านประโยชน์ทางการเรียนรู้',14,'ระบบเกมแบบฝึกทักษะออนไลน์มีประโยชน์ต่อการเรียนรายวิชาวิทยาการคำนวณ','rating',1,'active'),
(@survey_id,'learning_benefit','ด้านประโยชน์ทางการเรียนรู้',15,'ระบบเกมแบบฝึกทักษะออนไลน์ช่วยให้ผู้เรียนเห็นคุณค่าของการเรียนรู้ผ่านการลงมือปฏิบัติ','rating',1,'active'),
(@survey_id,'open_feedback','คำถามปลายเปิด',16,'สิ่งที่ผู้เรียนชอบมากที่สุดจากการใช้ระบบเกมแบบฝึกทักษะออนไลน์คืออะไร','open_text',0,'active'),
(@survey_id,'open_feedback','คำถามปลายเปิด',17,'สิ่งที่ผู้เรียนเห็นว่าควรปรับปรุงหรือพัฒนาเพิ่มเติมในระบบเกมแบบฝึกทักษะออนไลน์คืออะไร','open_text',0,'active');

INSERT IGNORE INTO survey_settings
(learning_session_id, survey_id, survey_status, required_after_posttest, allow_edit, show_summary_to_student)
SELECT id, @survey_id, 'locked', 1, 0, 0 FROM learning_sessions;
