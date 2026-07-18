<?php

require_once __DIR__ . '/context.php';

function problem_solving_rubric_config(): array
{
    static $config;
    if (!is_array($config)) {
        $config = require __DIR__ . '/../config/problem_solving_rubric.php';
    }
    return $config;
}

function problem_solving_active_version(): string
{
    return (string) (problem_solving_rubric_config()['active_version'] ?? '');
}

function problem_solving_rubric(?string $version = null): array
{
    $config = problem_solving_rubric_config();
    $version = $version ?: (string) ($config['active_version'] ?? '');
    if ($version === '' || !isset($config['versions'][$version])) {
        throw new InvalidArgumentException('ไม่พบเวอร์ชันแบบประเมินที่ระบุ');
    }

    return ['version' => $version] + $config['versions'][$version];
}

function problem_solving_item_map(?string $version = null): array
{
    $rubric = problem_solving_rubric($version);
    $items = [];
    foreach ($rubric['domains'] as $domainKey => $domain) {
        foreach ($domain['items'] as $itemKey => $label) {
            $items[$itemKey] = [
                'domain_key' => $domainKey,
                'domain_label' => $domain['label'],
                'label' => $label,
            ];
        }
    }
    return $items;
}

function problem_solving_mean(array $values): float
{
    $numbers = array_values(array_filter($values, static fn ($value): bool => is_numeric($value)));
    return $numbers === [] ? 0.0 : array_sum($numbers) / count($numbers);
}

function problem_solving_standard_deviation(array $values): float
{
    $numbers = array_values(array_map('floatval', array_filter($values, static fn ($value): bool => is_numeric($value))));
    $count = count($numbers);
    if ($count < 2) {
        return 0.0;
    }
    $mean = problem_solving_mean($numbers);
    $sum = 0.0;
    foreach ($numbers as $value) {
        $sum += ($value - $mean) ** 2;
    }
    return sqrt($sum / ($count - 1));
}

function problem_solving_level(float $mean, ?string $version = null): string
{
    foreach (problem_solving_rubric($version)['levels'] as $level) {
        if ($mean >= (float) $level['min'] && $mean <= (float) $level['max']) {
            return (string) $level['label'];
        }
    }
    return 'ข้อมูลไม่ครบ';
}

function problem_solving_calculate(array $scores, ?string $version = null): array
{
    $rubric = problem_solving_rubric($version);
    $expected = problem_solving_item_map($rubric['version']);
    $domainValues = array_fill_keys(array_keys($rubric['domains']), []);
    $allValues = [];

    foreach ($scores as $itemKey => $entry) {
        if (!isset($expected[$itemKey])) {
            continue;
        }
        $score = is_array($entry) ? ($entry['score'] ?? null) : $entry;
        if (!is_numeric($score) || (int) $score < (int) $rubric['score_min'] || (int) $score > (int) $rubric['score_max']) {
            continue;
        }
        $score = (int) $score;
        $domainValues[$expected[$itemKey]['domain_key']][] = $score;
        $allValues[] = $score;
    }

    $domains = [];
    foreach ($rubric['domains'] as $domainKey => $domain) {
        $values = $domainValues[$domainKey];
        $domains[$domainKey] = [
            'label' => $domain['label'],
            'count' => count($values),
            'expected_count' => count($domain['items']),
            'mean' => $values === [] ? null : problem_solving_mean($values),
        ];
    }

    $overallMean = $allValues === [] ? null : problem_solving_mean($allValues);
    return [
        'domains' => $domains,
        'total_score' => array_sum($allValues),
        'overall_mean' => $overallMean,
        'level' => $overallMean === null ? 'ข้อมูลไม่ครบ' : problem_solving_level($overallMean, $rubric['version']),
        'completed_count' => count($allValues),
        'expected_count' => count($expected),
        'complete' => count($allValues) === count($expected),
    ];
}

function problem_solving_csrf_token(): string
{
    if (empty($_SESSION['problem_solving_csrf_token'])) {
        $_SESSION['problem_solving_csrf_token'] = bin2hex(random_bytes(32));
    }
    return (string) $_SESSION['problem_solving_csrf_token'];
}

function problem_solving_verify_csrf(?string $token): bool
{
    $known = $_SESSION['problem_solving_csrf_token'] ?? '';
    return is_string($token) && $token !== '' && is_string($known) && hash_equals($known, $token);
}

function problem_solving_json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function problem_solving_json_input(): array
{
    $input = json_decode((string) file_get_contents('php://input'), true);
    return is_array($input) ? $input : [];
}

function problem_solving_plain_text(mixed $value, int $maxBytes = 10000): ?string
{
    if ($value === null) {
        return null;
    }
    if (!is_string($value)) {
        throw new InvalidArgumentException('ข้อความต้องอยู่ในรูปแบบตัวอักษร');
    }
    $value = trim(str_replace(["\r\n", "\r"], "\n", $value));
    if (strlen($value) > $maxBytes) {
        throw new InvalidArgumentException('ข้อความยาวเกินกว่าที่ระบบกำหนด');
    }
    if (strip_tags($value) !== $value) {
        throw new InvalidArgumentException('ช่องหมายเหตุไม่รองรับ HTML');
    }
    return $value === '' ? null : $value;
}

function problem_solving_context_matches(array $record, array $context): bool
{
    foreach (['school_id', 'classroom_id', 'teacher_id', 'learning_session_id'] as $key) {
        if ((int) ($record[$key] ?? 0) !== (int) ($context[$key] ?? 0)) {
            return false;
        }
    }
    return true;
}

function problem_solving_teacher_context(mysqli $conn, ?int $classroomId = null): ?array
{
    if (!isset($_SESSION['user_id']) || !is_teacher_or_admin()) {
        return null;
    }
    $context = classroom_context($conn, $classroomId);
    if (!$context || ($context['classroom']['status'] ?? '') !== 'active' || ($context['classroom']['school_status'] ?? '') !== 'approved') {
        return null;
    }
    apply_context_to_session($context);
    return $context;
}

function problem_solving_api_account_allowed(mysqli $conn): bool
{
    if (!isset($_SESSION['user_id']) || !is_teacher_or_admin()) {
        return false;
    }
    $userId = (int) $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT status, role FROM users WHERE user_id = ? LIMIT 1");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    return is_array($user)
        && ($user['status'] ?? '') === 'active'
        && in_array($user['role'] ?? '', ['teacher', 'admin', 'super_admin'], true);
}

function problem_solving_student_in_context(mysqli $conn, int $userId, array $context): ?array
{
    $stmt = $conn->prepare(
        "SELECT user_id AS id, student_id, name, class_level, mode, team_id, group_number
         FROM users
         WHERE user_id = ? AND role = 'student' AND status = 'active'
           AND school_id = ? AND classroom_id = ? AND teacher_id = ?
         LIMIT 1"
    );
    $stmt->bind_param(
        'iiii',
        $userId,
        $context['school_id'],
        $context['classroom_id'],
        $context['teacher_id']
    );
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc() ?: null;
}

function problem_solving_students_with_statuses(mysqli $conn, array $context, ?string $version = null): array
{
    $version = $version ?: problem_solving_active_version();
    $stmt = $conn->prepare(
        "SELECT u.user_id AS id, u.student_id, u.name, u.class_level, u.mode, u.team_id, u.group_number,
                e.lesson_id, e.status
         FROM users u
         LEFT JOIN problem_solving_evaluations e
           ON e.user_id = u.user_id AND e.learning_session_id = ? AND e.rubric_version = ?
         WHERE u.role = 'student' AND u.status = 'active'
           AND u.school_id = ? AND u.classroom_id = ? AND u.teacher_id = ?
         ORDER BY u.student_id, u.name, e.lesson_id"
    );
    $stmt->bind_param(
        'isiii',
        $context['learning_session_id'],
        $version,
        $context['school_id'],
        $context['classroom_id'],
        $context['teacher_id']
    );
    $stmt->execute();
    $students = [];
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $id = (int) $row['id'];
        if (!isset($students[$id])) {
            $students[$id] = [
                'id' => $id,
                'student_id' => $row['student_id'],
                'name' => $row['name'],
                'class_level' => $row['class_level'],
                'mode' => $row['mode'] ?: 'solo',
                'team_id' => $row['team_id'],
                'group_number' => $row['group_number'],
                'statuses' => array_fill(1, 4, 'not_started'),
            ];
        }
        $lessonId = (int) ($row['lesson_id'] ?? 0);
        if ($lessonId >= 1 && $lessonId <= 4) {
            $students[$id]['statuses'][$lessonId] = $row['status'];
        }
    }
    return array_values($students);
}

function problem_solving_load_evaluation(
    mysqli $conn,
    int $studentId,
    int $lessonId,
    array $context,
    ?string $version = null,
    bool $forUpdate = false
): ?array {
    $version = $version ?: problem_solving_active_version();
    $lock = $forUpdate ? ' FOR UPDATE' : '';
    $stmt = $conn->prepare(
        "SELECT e.*, evaluator.name AS evaluator_name,
                (SELECT MAX(a.created_at) FROM problem_solving_evaluation_audit_logs a
                 WHERE a.evaluation_id = e.id AND a.action = 'unlock') AS last_unlocked_at
         FROM problem_solving_evaluations e
         JOIN users evaluator ON evaluator.user_id = e.evaluator_id
         WHERE e.rubric_version = ? AND e.user_id = ? AND e.lesson_id = ?
           AND e.school_id = ? AND e.classroom_id = ? AND e.teacher_id = ? AND e.learning_session_id = ?
         LIMIT 1{$lock}"
    );
    $stmt->bind_param(
        'siiiiii',
        $version,
        $studentId,
        $lessonId,
        $context['school_id'],
        $context['classroom_id'],
        $context['teacher_id'],
        $context['learning_session_id']
    );
    $stmt->execute();
    $evaluation = $stmt->get_result()->fetch_assoc();
    if (!$evaluation) {
        return null;
    }

    $scoreStmt = $conn->prepare(
        "SELECT item_key, domain_key, score, evidence_note
         FROM problem_solving_evaluation_scores WHERE evaluation_id = ? ORDER BY id"
    );
    $scoreStmt->bind_param('i', $evaluation['id']);
    $scoreStmt->execute();
    $scores = [];
    $scoreResult = $scoreStmt->get_result();
    while ($score = $scoreResult->fetch_assoc()) {
        $scores[$score['item_key']] = [
            'score' => (int) $score['score'],
            'note' => $score['evidence_note'],
            'domain_key' => $score['domain_key'],
        ];
    }
    $evaluation['id'] = (int) $evaluation['id'];
    $evaluation['lesson_id'] = (int) $evaluation['lesson_id'];
    $evaluation['scores'] = $scores;
    $evaluation['calculation'] = problem_solving_calculate($scores, $version);
    $evaluation['display_status'] = $evaluation['status'] === 'draft' && $evaluation['last_unlocked_at']
        ? 'unlocked'
        : $evaluation['status'];
    return $evaluation;
}

function problem_solving_evidence(mysqli $conn, int $studentId, int $lessonId, array $context): array
{
    $progressStmt = $conn->prepare(
        "SELECT COALESCE(SUM(p.score), 0) AS total_score,
                COUNT(p.id) AS stages_completed,
                COALESCE(SUM(p.attempts), 0) AS attempts,
                COALESCE(SUM(p.duration_seconds), 0) AS duration_seconds,
                MAX(p.completed_at) AS last_completed_at
         FROM progress p
         JOIN stages s ON s.id = p.stage_id
         WHERE p.user_id = ? AND s.game_id = ?
           AND p.school_id = ? AND p.classroom_id = ? AND p.teacher_id = ? AND p.learning_session_id = ?"
    );
    $progressStmt->bind_param(
        'iiiiii',
        $studentId,
        $lessonId,
        $context['school_id'],
        $context['classroom_id'],
        $context['teacher_id'],
        $context['learning_session_id']
    );
    $progressStmt->execute();
    $progress = $progressStmt->get_result()->fetch_assoc() ?: [];

    $student = problem_solving_student_in_context($conn, $studentId, $context);
    $teamId = (string) ($student['team_id'] ?? '');
    if (($student['mode'] ?? 'solo') === 'group' && $teamId !== '') {
        $workStmt = $conn->prepare(
            "SELECT w.status, w.description, w.feedback, w.submitted_at, w.user_id AS owner_id
             FROM student_works w
             JOIN users owner ON owner.user_id = w.user_id
             WHERE w.game_id = ? AND owner.team_id = ?
               AND w.school_id = ? AND w.classroom_id = ? AND w.teacher_id = ? AND w.learning_session_id = ?
             ORDER BY w.submitted_at DESC, w.id DESC LIMIT 1"
        );
        $workStmt->bind_param(
            'isiiii',
            $lessonId,
            $teamId,
            $context['school_id'],
            $context['classroom_id'],
            $context['teacher_id'],
            $context['learning_session_id']
        );
    } else {
        $workStmt = $conn->prepare(
            "SELECT status, description, feedback, submitted_at, user_id AS owner_id
             FROM student_works
             WHERE user_id = ? AND game_id = ?
               AND school_id = ? AND classroom_id = ? AND teacher_id = ? AND learning_session_id = ?
             ORDER BY submitted_at DESC, id DESC LIMIT 1"
        );
        $workStmt->bind_param(
            'iiiiii',
            $studentId,
            $lessonId,
            $context['school_id'],
            $context['classroom_id'],
            $context['teacher_id'],
            $context['learning_session_id']
        );
    }
    $workStmt->execute();
    $work = $workStmt->get_result()->fetch_assoc();

    return [
        'game_score' => (int) ($progress['total_score'] ?? 0),
        'stages_completed' => (int) ($progress['stages_completed'] ?? 0),
        'attempts' => (int) ($progress['attempts'] ?? 0),
        'duration_seconds' => (int) ($progress['duration_seconds'] ?? 0),
        'last_completed_at' => $progress['last_completed_at'] ?? null,
        'work_status' => $work['status'] ?? 'not_submitted',
        'work_description' => $work['description'] ?? null,
        'teacher_feedback' => $work['feedback'] ?? null,
        'work_submitted_at' => $work['submitted_at'] ?? null,
        'is_group_evidence' => $work && (int) ($work['owner_id'] ?? 0) !== $studentId,
    ];
}

function problem_solving_report_data(
    mysqli $conn,
    array $context,
    ?int $lessonFilter = null,
    bool $includeDrafts = false,
    ?string $version = null
): array {
    $version = $version ?: problem_solving_active_version();
    $students = problem_solving_students_with_statuses($conn, $context, $version);
    $studentMap = [];
    foreach ($students as $student) {
        $studentMap[$student['id']] = $student;
    }

    $sql = "SELECT e.*, u.student_id, u.name AS student_name, evaluator.name AS evaluator_name,
                   s.item_key, s.domain_key, s.score, s.evidence_note
            FROM problem_solving_evaluations e
            JOIN users u ON u.user_id = e.user_id
            JOIN users evaluator ON evaluator.user_id = e.evaluator_id
            LEFT JOIN problem_solving_evaluation_scores s ON s.evaluation_id = e.id
            WHERE e.rubric_version = ?
              AND e.school_id = ? AND e.classroom_id = ? AND e.teacher_id = ? AND e.learning_session_id = ?";
    if (!$includeDrafts) {
        $sql .= " AND e.status = 'final'";
    }
    if ($lessonFilter !== null) {
        $sql .= ' AND e.lesson_id = ?';
    }
    $sql .= ' ORDER BY u.student_id, e.lesson_id, s.id';
    $stmt = $conn->prepare($sql);
    if ($lessonFilter !== null) {
        $stmt->bind_param(
            'siiiii',
            $version,
            $context['school_id'],
            $context['classroom_id'],
            $context['teacher_id'],
            $context['learning_session_id'],
            $lessonFilter
        );
    } else {
        $stmt->bind_param(
            'siiii',
            $version,
            $context['school_id'],
            $context['classroom_id'],
            $context['teacher_id'],
            $context['learning_session_id']
        );
    }
    $stmt->execute();

    $evaluations = [];
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $id = (int) $row['id'];
        if (!isset($evaluations[$id])) {
            $evaluations[$id] = [
                'id' => $id,
                'user_id' => (int) $row['user_id'],
                'student_id' => $row['student_id'],
                'student_name' => $row['student_name'],
                'lesson_id' => (int) $row['lesson_id'],
                'status' => $row['status'],
                'rubric_version' => $row['rubric_version'],
                'overall_note' => $row['overall_note'],
                'evaluated_at' => $row['evaluated_at'],
                'finalized_at' => $row['finalized_at'],
                'evaluator_name' => $row['evaluator_name'],
                'scores' => [],
            ];
        }
        if ($row['item_key'] !== null) {
            $evaluations[$id]['scores'][$row['item_key']] = [
                'score' => (int) $row['score'],
                'note' => $row['evidence_note'],
                'domain_key' => $row['domain_key'],
            ];
        }
    }

    $rubric = problem_solving_rubric($version);
    $domainValues = array_fill_keys(array_keys($rubric['domains']), []);
    $lessonValues = [];
    $overallValues = [];
    $individuals = [];
    foreach ($evaluations as &$evaluation) {
        $calculation = problem_solving_calculate($evaluation['scores'], $version);
        $evaluation['calculation'] = $calculation;
        $userId = $evaluation['user_id'];
        if (!isset($individuals[$userId])) {
            $individuals[$userId] = [
                'id' => $userId,
                'student_id' => $evaluation['student_id'],
                'name' => $evaluation['student_name'],
                'lessons' => [],
            ];
        }
        $individuals[$userId]['lessons'][$evaluation['lesson_id']] = $evaluation;

        if ($calculation['overall_mean'] !== null) {
            $overallValues[] = $calculation['overall_mean'];
            $lessonValues[$evaluation['lesson_id']]['overall'][] = $calculation['overall_mean'];
        }
        foreach ($calculation['domains'] as $domainKey => $domain) {
            if ($domain['mean'] !== null) {
                $domainValues[$domainKey][] = $domain['mean'];
                $lessonValues[$evaluation['lesson_id']][$domainKey][] = $domain['mean'];
            }
        }
    }
    unset($evaluation);

    foreach ($studentMap as $userId => $student) {
        if (!isset($individuals[$userId])) {
            $individuals[$userId] = [
                'id' => $userId,
                'student_id' => $student['student_id'],
                'name' => $student['name'],
                'lessons' => [],
            ];
        }
    }

    foreach ($individuals as &$individual) {
        ksort($individual['lessons']);
        $means = [];
        $individualDomainValues = array_fill_keys(array_keys($rubric['domains']), []);
        foreach ($individual['lessons'] as $evaluation) {
            if ($evaluation['calculation']['overall_mean'] !== null) {
                $means[] = $evaluation['calculation']['overall_mean'];
            }
            foreach ($evaluation['calculation']['domains'] as $domainKey => $domain) {
                if ($domain['mean'] !== null) {
                    $individualDomainValues[$domainKey][] = $domain['mean'];
                }
            }
        }
        $individual['overall_mean'] = $means === [] ? null : problem_solving_mean($means);
        $individual['level'] = $means === [] ? 'ข้อมูลไม่ครบ' : problem_solving_level($individual['overall_mean'], $version);
        $individual['domain_means'] = [];
        foreach ($individualDomainValues as $domainKey => $values) {
            $individual['domain_means'][$domainKey] = $values === [] ? null : problem_solving_mean($values);
        }
    }
    unset($individual);
    uasort($individuals, static fn (array $a, array $b): int => strcmp((string) $a['student_id'], (string) $b['student_id']));

    $domainSummary = [];
    foreach ($rubric['domains'] as $domainKey => $domain) {
        $values = $domainValues[$domainKey];
        $mean = $values === [] ? null : problem_solving_mean($values);
        $domainSummary[$domainKey] = [
            'label' => $domain['label'],
            'mean' => $mean,
            'sd' => problem_solving_standard_deviation($values),
            'level' => $mean === null ? 'ข้อมูลไม่ครบ' : problem_solving_level($mean, $version),
            'n' => count($values),
        ];
    }

    $lessonSummary = [];
    $lessons = require __DIR__ . '/../config/lessons.php';
    foreach ($lessons as $lessonId => $lesson) {
        $entry = ['id' => $lessonId, 'title' => $lesson['title'], 'topic' => $lesson['topic'], 'domains' => []];
        foreach ($rubric['domains'] as $domainKey => $domain) {
            $values = $lessonValues[$lessonId][$domainKey] ?? [];
            $entry['domains'][$domainKey] = $values === [] ? null : problem_solving_mean($values);
        }
        $values = $lessonValues[$lessonId]['overall'] ?? [];
        $entry['overall_mean'] = $values === [] ? null : problem_solving_mean($values);
        $entry['sd'] = problem_solving_standard_deviation($values);
        $entry['n'] = count($values);
        $lessonSummary[$lessonId] = $entry;
    }

    $completeStudents = 0;
    foreach ($students as $student) {
        if (count(array_filter($student['statuses'], static fn ($status): bool => $status === 'final')) === count($lessons)) {
            $completeStudents++;
        }
    }
    $overallMean = $overallValues === [] ? null : problem_solving_mean($overallValues);

    return [
        'rubric_version' => $version,
        'rubric' => $rubric,
        'filters' => ['lesson_id' => $lessonFilter, 'include_drafts' => $includeDrafts],
        'summary' => [
            'total_students' => count($students),
            'complete_students' => $completeStudents,
            'incomplete_students' => count($students) - $completeStudents,
            'evaluation_count' => count($evaluations),
            'overall_mean' => $overallMean,
            'sd' => problem_solving_standard_deviation($overallValues),
            'level' => $overallMean === null ? 'ข้อมูลไม่ครบ' : problem_solving_level($overallMean, $version),
        ],
        'domains' => $domainSummary,
        'lessons' => $lessonSummary,
        'students' => $students,
        'individuals' => array_values($individuals),
        'evaluations' => array_values($evaluations),
    ];
}
