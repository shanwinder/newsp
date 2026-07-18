-- Problem-solving rubric assessment module, version 1.0
-- Back up the target database before applying this migration.

START TRANSACTION;

CREATE TABLE IF NOT EXISTS problem_solving_evaluations (
    id INT NOT NULL AUTO_INCREMENT,
    rubric_version VARCHAR(20) NOT NULL,
    user_id INT NOT NULL,
    lesson_id TINYINT UNSIGNED NOT NULL,
    school_id INT NOT NULL,
    classroom_id INT NOT NULL,
    teacher_id INT NOT NULL,
    learning_session_id INT NOT NULL,
    evaluator_id INT NOT NULL,
    status ENUM('draft', 'final') NOT NULL DEFAULT 'draft',
    overall_note TEXT DEFAULT NULL,
    evaluated_at DATETIME(6) DEFAULT NULL,
    finalized_at DATETIME(6) DEFAULT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uniq_problem_solving_evaluation (rubric_version, user_id, lesson_id, learning_session_id),
    KEY idx_problem_solving_context (school_id, classroom_id, teacher_id, learning_session_id),
    KEY idx_problem_solving_student (user_id, lesson_id),
    KEY idx_problem_solving_evaluator (evaluator_id),
    CONSTRAINT chk_problem_solving_lesson CHECK (lesson_id BETWEEN 1 AND 4),
    CONSTRAINT fk_problem_solving_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_problem_solving_school FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT fk_problem_solving_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
    CONSTRAINT fk_problem_solving_teacher FOREIGN KEY (teacher_id) REFERENCES users(user_id),
    CONSTRAINT fk_problem_solving_session FOREIGN KEY (learning_session_id) REFERENCES learning_sessions(id),
    CONSTRAINT fk_problem_solving_evaluator_user FOREIGN KEY (evaluator_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS problem_solving_evaluation_scores (
    id INT NOT NULL AUTO_INCREMENT,
    evaluation_id INT NOT NULL,
    item_key VARCHAR(60) NOT NULL,
    domain_key VARCHAR(30) NOT NULL,
    score TINYINT UNSIGNED NOT NULL,
    evidence_note TEXT DEFAULT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uniq_problem_solving_item (evaluation_id, item_key),
    KEY idx_problem_solving_domain (evaluation_id, domain_key),
    CONSTRAINT fk_problem_solving_evaluation FOREIGN KEY (evaluation_id)
        REFERENCES problem_solving_evaluations(id) ON DELETE CASCADE,
    CONSTRAINT chk_problem_solving_score CHECK (score BETWEEN 1 AND 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS problem_solving_evaluation_audit_logs (
    id INT NOT NULL AUTO_INCREMENT,
    evaluation_id INT NOT NULL,
    action VARCHAR(40) NOT NULL,
    actor_id INT NOT NULL,
    reason TEXT DEFAULT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_problem_solving_audit_evaluation (evaluation_id),
    KEY idx_problem_solving_audit_actor (actor_id),
    CONSTRAINT fk_problem_solving_audit_evaluation FOREIGN KEY (evaluation_id)
        REFERENCES problem_solving_evaluations(id) ON DELETE CASCADE,
    CONSTRAINT fk_problem_solving_audit_actor FOREIGN KEY (actor_id)
        REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
