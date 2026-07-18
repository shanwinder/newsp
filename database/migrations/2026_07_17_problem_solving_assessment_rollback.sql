-- Emergency rollback for the problem-solving rubric assessment module.
-- WARNING: this permanently removes every evaluation, score, and audit log.
-- Restore the pre-migration database backup if the collected data must be retained.

START TRANSACTION;

DROP TABLE IF EXISTS problem_solving_evaluation_audit_logs;
DROP TABLE IF EXISTS problem_solving_evaluation_scores;
DROP TABLE IF EXISTS problem_solving_evaluations;

COMMIT;
