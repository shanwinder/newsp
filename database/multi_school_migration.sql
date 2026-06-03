START TRANSACTION;

CREATE TABLE IF NOT EXISTS `schools` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `school_code` VARCHAR(50) NULL,
    `school_name` VARCHAR(255) NOT NULL,
    `district` VARCHAR(150) NULL,
    `province` VARCHAR(150) NULL,
    `affiliation` VARCHAR(255) NULL,
    `contact_name` VARCHAR(255) NULL,
    `contact_email` VARCHAR(255) NULL,
    `contact_phone` VARCHAR(50) NULL,
    `status` ENUM('pending','approved','suspended') DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `classrooms` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `school_id` INT NOT NULL,
    `teacher_id` INT NOT NULL,
    `classroom_name` VARCHAR(255) NOT NULL,
    `grade_level` VARCHAR(50) DEFAULT 'ป.4',
    `academic_year` VARCHAR(20) NULL,
    `join_code` VARCHAR(20) NOT NULL,
    `status` ENUM('active','archived') DEFAULT 'active',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_join_code` (`join_code`),
    KEY `idx_classrooms_school` (`school_id`),
    KEY `idx_classrooms_teacher` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `learning_sessions` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `school_id` INT NOT NULL,
    `classroom_id` INT NOT NULL,
    `teacher_id` INT NOT NULL,
    `session_name` VARCHAR(255) NOT NULL,
    `class_status` ENUM('active','paused') DEFAULT 'active',
    `navigation_status` ENUM('locked','unlocked') DEFAULT 'locked',
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `status` ENUM('active','closed','archived') DEFAULT 'active',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL,
    PRIMARY KEY (`id`),
    KEY `idx_sessions_school` (`school_id`),
    KEY `idx_sessions_classroom` (`classroom_id`),
    KEY `idx_sessions_teacher` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `users`
    MODIFY `role` ENUM('student','admin','super_admin','teacher','demo') DEFAULT 'student',
    ADD COLUMN `school_id` INT NULL,
    ADD COLUMN `classroom_id` INT NULL,
    ADD COLUMN `teacher_id` INT NULL,
    ADD COLUMN `email` VARCHAR(255) NULL,
    ADD COLUMN `phone` VARCHAR(50) NULL,
    ADD COLUMN `status` ENUM('pending','active','suspended') DEFAULT 'active',
    ADD COLUMN `approved_at` DATETIME NULL,
    ADD COLUMN `approved_by` INT NULL;

ALTER TABLE `users`
    DROP INDEX `student_id`,
    ADD UNIQUE KEY `student_classroom_unique` (`student_id`, `classroom_id`),
    ADD UNIQUE KEY `uniq_users_email` (`email`),
    ADD KEY `idx_users_school_classroom` (`school_id`, `classroom_id`),
    ADD KEY `idx_users_teacher` (`teacher_id`);

ALTER TABLE `progress`
    ADD COLUMN `school_id` INT NULL,
    ADD COLUMN `classroom_id` INT NULL,
    ADD COLUMN `teacher_id` INT NULL,
    ADD COLUMN `learning_session_id` INT NULL;

ALTER TABLE `progress`
    DROP INDEX `user_stage_unique`,
    ADD UNIQUE KEY `user_stage_session_unique` (`user_id`, `stage_id`, `learning_session_id`);

ALTER TABLE `game_logs`
    ADD COLUMN `school_id` INT NULL,
    ADD COLUMN `classroom_id` INT NULL,
    ADD COLUMN `teacher_id` INT NULL,
    ADD COLUMN `learning_session_id` INT NULL;

ALTER TABLE `student_works`
    ADD COLUMN `school_id` INT NULL,
    ADD COLUMN `classroom_id` INT NULL,
    ADD COLUMN `teacher_id` INT NULL,
    ADD COLUMN `learning_session_id` INT NULL;

ALTER TABLE `project_likes`
    ADD COLUMN `school_id` INT NULL,
    ADD COLUMN `classroom_id` INT NULL;

INSERT INTO `schools` (`id`, `school_code`, `school_name`, `district`, `province`, `affiliation`, `contact_name`, `status`, `created_at`)
VALUES (1, 'DEFAULT', 'โรงเรียนบ้านนาอุดม', NULL, 'มุกดาหาร', 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษามุกดาหาร', 'ครูผู้สอน', 'approved', NOW())
ON DUPLICATE KEY UPDATE `school_name` = VALUES(`school_name`), `status` = 'approved';

UPDATE `users` SET `role` = 'super_admin', `status` = 'active', `school_id` = 1 WHERE `role` = 'admin';

INSERT INTO `classrooms` (`id`, `school_id`, `teacher_id`, `classroom_name`, `grade_level`, `academic_year`, `join_code`, `status`, `created_at`)
SELECT 1, 1, `user_id`, 'ป.4 โรงเรียนบ้านนาอุดม', 'ป.4', '2569', 'DEFAULT4', 'active', NOW()
FROM `users`
WHERE `role` IN ('super_admin','admin')
ORDER BY `user_id`
LIMIT 1
ON DUPLICATE KEY UPDATE `classroom_name` = VALUES(`classroom_name`), `status` = 'active';

INSERT INTO `learning_sessions` (`id`, `school_id`, `classroom_id`, `teacher_id`, `session_name`, `class_status`, `navigation_status`, `status`, `created_at`)
SELECT 1, 1, 1, `teacher_id`, 'รอบการเรียนรู้หลัก', 'active', 'unlocked', 'active', NOW()
FROM `classrooms`
WHERE `id` = 1
ON DUPLICATE KEY UPDATE `class_status` = VALUES(`class_status`), `navigation_status` = VALUES(`navigation_status`), `status` = 'active';

UPDATE `users`
SET `school_id` = 1, `classroom_id` = 1, `teacher_id` = (SELECT `teacher_id` FROM `classrooms` WHERE `id` = 1), `status` = 'active'
WHERE `role` = 'student' AND (`school_id` IS NULL OR `classroom_id` IS NULL);

UPDATE `progress` p
JOIN `users` u ON p.`user_id` = u.`user_id`
SET p.`school_id` = u.`school_id`,
    p.`classroom_id` = u.`classroom_id`,
    p.`teacher_id` = u.`teacher_id`,
    p.`learning_session_id` = 1
WHERE p.`school_id` IS NULL;

UPDATE `game_logs` l
JOIN `users` u ON l.`user_id` = u.`user_id`
SET l.`school_id` = u.`school_id`,
    l.`classroom_id` = u.`classroom_id`,
    l.`teacher_id` = u.`teacher_id`,
    l.`learning_session_id` = 1
WHERE l.`school_id` IS NULL;

UPDATE `student_works` w
JOIN `users` u ON w.`user_id` = u.`user_id`
SET w.`school_id` = u.`school_id`,
    w.`classroom_id` = u.`classroom_id`,
    w.`teacher_id` = u.`teacher_id`,
    w.`learning_session_id` = 1
WHERE w.`school_id` IS NULL;

INSERT INTO `schools` (`id`, `school_code`, `school_name`, `district`, `province`, `affiliation`, `contact_name`, `status`, `created_at`)
VALUES (2, 'DEMO', 'โรงเรียน Demo สำหรับทดลองใช้', 'เมือง', 'มุกดาหาร', 'OBEC Content Center Demo', 'ครูทดลอง', 'approved', NOW())
ON DUPLICATE KEY UPDATE `school_name` = VALUES(`school_name`), `status` = 'approved';

INSERT INTO `users` (`student_id`, `name`, `class_level`, `password`, `role`, `school_id`, `email`, `status`, `approved_at`)
VALUES ('demo_teacher', 'ครูทดลอง', NULL, '$2y$10$gfXRGXXOcEBOfKWWePUj/OjXJXitmcEx4O1SKtiBp24G3pGaWwmbG', 'teacher', 2, 'demo_teacher@example.local', 'active', NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `role` = 'teacher', `school_id` = 2, `status` = 'active';

INSERT INTO `classrooms` (`id`, `school_id`, `teacher_id`, `classroom_name`, `grade_level`, `academic_year`, `join_code`, `status`, `created_at`)
SELECT 2, 2, `user_id`, 'ห้องเรียน Demo ป.4', 'ป.4', '2569', 'DEMO4', 'active', NOW()
FROM `users`
WHERE `student_id` = 'demo_teacher'
ON DUPLICATE KEY UPDATE `teacher_id` = VALUES(`teacher_id`), `status` = 'active';

INSERT INTO `learning_sessions` (`id`, `school_id`, `classroom_id`, `teacher_id`, `session_name`, `class_status`, `navigation_status`, `status`, `created_at`)
SELECT 2, 2, 2, `teacher_id`, 'รอบทดลองใช้ Demo', 'active', 'unlocked', 'active', NOW()
FROM `classrooms`
WHERE `id` = 2
ON DUPLICATE KEY UPDATE `class_status` = 'active', `navigation_status` = 'unlocked', `status` = 'active';

INSERT INTO `users` (`student_id`, `name`, `class_level`, `password`, `role`, `school_id`, `classroom_id`, `teacher_id`, `status`)
SELECT 'demo01', 'นักเรียนทดลอง หนึ่ง', 'ป.4', '$2y$10$DswC7hU5ouhjgaOFermzsOaCw0jNoFvoFkxcEXWq0.J6DxxIsjaEO', 'student', 2, 2, `teacher_id`, 'active'
FROM `classrooms`
WHERE `id` = 2
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `school_id` = 2, `classroom_id` = 2, `teacher_id` = VALUES(`teacher_id`), `status` = 'active';

INSERT INTO `progress` (`user_id`, `stage_id`, `score`, `duration_seconds`, `attempts`, `school_id`, `classroom_id`, `teacher_id`, `learning_session_id`, `completed_at`)
SELECT u.`user_id`, 1, 3, 35, 1, 2, 2, c.`teacher_id`, 2, NOW()
FROM `users` u
JOIN `classrooms` c ON c.`id` = 2
WHERE u.`student_id` = 'demo01'
ON DUPLICATE KEY UPDATE `score` = VALUES(`score`), `duration_seconds` = VALUES(`duration_seconds`), `attempts` = VALUES(`attempts`);

INSERT INTO `student_works` (`user_id`, `game_id`, `work_data`, `description`, `status`, `feedback`, `school_id`, `classroom_id`, `teacher_id`, `learning_session_id`, `submitted_at`)
SELECT u.`user_id`, 1,
       '[{"type":"bug_red","x":380,"y":220,"role":"target"},{"type":"bug_blue","x":560,"y":230,"role":"decoy"},{"type":"newseed","x":240,"y":300,"role":"target"}]',
       '[ฉากหลัง: grid]\n\nโจทย์ Demo: คลิกเฉพาะเป้าหมายที่ตรงตามเงื่อนไข แล้วอธิบายเหตุผลอย่างเป็นขั้นตอน',
       'reviewed',
       'ตัวอย่างชิ้นงานผ่านการตรวจแล้ว',
       2, 2, c.`teacher_id`, 2, NOW()
FROM `users` u
JOIN `classrooms` c ON c.`id` = 2
WHERE u.`student_id` = 'demo01'
  AND NOT EXISTS (
      SELECT 1 FROM `student_works` w
      WHERE w.`user_id` = u.`user_id` AND w.`game_id` = 1 AND w.`learning_session_id` = 2
  );

COMMIT;
