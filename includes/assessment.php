<?php

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/context.php';

function assessment_csrf_token(): string
{
    if (empty($_SESSION['assessment_csrf'])) {
        $_SESSION['assessment_csrf'] = bin2hex(random_bytes(24));
    }
    return $_SESSION['assessment_csrf'];
}

function assessment_verify_csrf(?string $token): bool
{
    return is_string($token) && hash_equals(assessment_csrf_token(), $token);
}

function assessment_is_individual(): bool
{
    return !is_visitor_mode()
        && current_role() === 'student'
        && ($_SESSION['mode'] ?? 'solo') === 'solo';
}

function assessment_settings(mysqli $conn, int $learning_session_id): ?array
{
    if ($learning_session_id <= 0) {
        return null;
    }

    $stmt = $conn->prepare(
        "SELECT s.*, pre.title AS pretest_title, pre.total_questions AS pretest_questions,
                pre.time_limit_minutes AS pretest_minutes,
                post.title AS posttest_title, post.total_questions AS posttest_questions,
                post.time_limit_minutes AS posttest_minutes
         FROM assessment_settings s
         LEFT JOIN assessments pre ON pre.id = s.pretest_assessment_id
         LEFT JOIN assessments post ON post.id = s.posttest_assessment_id
         WHERE s.learning_session_id = ? LIMIT 1"
    );
    $stmt->bind_param('i', $learning_session_id);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc() ?: null;
}

function assessment_attempt(mysqli $conn, int $assessment_id, int $user_id, int $learning_session_id): ?array
{
    $stmt = $conn->prepare(
        "SELECT * FROM assessment_attempts
         WHERE assessment_id = ? AND user_id = ? AND learning_session_id = ?
           AND status IN ('in_progress', 'submitted')
         ORDER BY attempt_no DESC, id DESC LIMIT 1"
    );
    $stmt->bind_param('iii', $assessment_id, $user_id, $learning_session_id);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc() ?: null;
}

function assessment_student_status(mysqli $conn, int $user_id, array $context): array
{
    $settings = assessment_settings($conn, intval($context['learning_session_id'] ?? 0));
    $result = [
        'configured' => (bool) $settings,
        'settings' => $settings,
        'individual' => assessment_is_individual(),
        'pretest' => ['available' => false, 'attempt' => null],
        'posttest' => ['available' => false, 'attempt' => null],
        'pretest_blocking' => false,
    ];

    if (!$settings || is_visitor_mode()) {
        return $result;
    }

    foreach (['pretest', 'posttest'] as $type) {
        $assessmentId = intval($settings[$type . '_assessment_id'] ?? 0);
        $attempt = $assessmentId > 0
            ? assessment_attempt($conn, $assessmentId, $user_id, intval($context['learning_session_id']))
            : null;
        $result[$type] = [
            'assessment_id' => $assessmentId,
            'title' => $settings[$type . '_title'] ?? '',
            'questions' => intval($settings[$type . '_questions'] ?? 0),
            'minutes' => intval($settings[$type . '_minutes'] ?? 0),
            'available' => $assessmentId > 0 && ($settings[$type . '_status'] ?? 'locked') === 'unlocked',
            'attempt' => $attempt,
            'submitted' => ($attempt['status'] ?? '') === 'submitted',
            'in_progress' => ($attempt['status'] ?? '') === 'in_progress',
        ];
    }

    $result['pretest_blocking'] = ($settings['pretest_required'] ?? 0)
        && $result['pretest']['available']
        && !$result['pretest']['submitted'];

    return $result;
}

function assessment_require_pretest_for_game(mysqli $conn): void
{
    if (is_visitor_mode() || current_role() !== 'student') {
        return;
    }

    $status = assessment_student_status($conn, intval($_SESSION['user_id']), session_context());
    if ($status['pretest_blocking']) {
        header('Location: assessment_intro.php?type=pretest&required=1');
        exit();
    }
}

function assessment_json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

function assessment_read_json(): array
{
    $payload = json_decode(file_get_contents('php://input'), true);
    return is_array($payload) ? $payload : [];
}

function assessment_teacher_context(mysqli $conn): array
{
    require_teacher_or_admin();
    ensure_active_account($conn);
    $context = classroom_context($conn, isset($_REQUEST['classroom_id']) ? intval($_REQUEST['classroom_id']) : null);
    if (!$context) {
        http_response_code(404);
        exit('ไม่พบห้องเรียนที่ใช้งาน');
    }
    apply_context_to_session($context);
    return $context;
}

function assessment_type_label(string $type): string
{
    return $type === 'posttest' ? 'แบบทดสอบหลังเรียน' : 'แบบทดสอบก่อนเรียน';
}

function assessment_report_data(mysqli $conn, array $context): array
{
    $settings = assessment_settings($conn, intval($context['learning_session_id']));
    $preId = intval($settings['pretest_assessment_id'] ?? 0);
    $postId = intval($settings['posttest_assessment_id'] ?? 0);

    $studentStmt = $conn->prepare("SELECT user_id, student_id, name, class_level FROM users WHERE role='student' AND school_id=? AND classroom_id=? AND teacher_id=? ORDER BY student_id, name");
    $studentStmt->bind_param('iii', $context['school_id'], $context['classroom_id'], $context['teacher_id']);
    $studentStmt->execute();
    $students = $studentStmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $studentMap = [];
    foreach ($students as $student) {
        $student['pre'] = null;
        $student['post'] = null;
        $student['game_score'] = 0;
        $student['lessons'] = array_fill(1, 4, ['pre' => 0, 'post' => 0]);
        $studentMap[intval($student['user_id'])] = $student;
    }

    if (($preId > 0 || $postId > 0) && $studentMap) {
        $attemptStmt = $conn->prepare("SELECT aa.* FROM assessment_attempts aa WHERE aa.learning_session_id=? AND aa.classroom_id=? AND aa.status='submitted' AND aa.assessment_id IN (?,?) ORDER BY aa.id");
        $attemptStmt->bind_param('iiii', $context['learning_session_id'], $context['classroom_id'], $preId, $postId);
        $attemptStmt->execute();
        $attemptIds = [];
        $attemptResult = $attemptStmt->get_result();
        while ($attempt = $attemptResult->fetch_assoc()) {
            $userId = intval($attempt['user_id']);
            if (!isset($studentMap[$userId])) continue;
            $key = intval($attempt['assessment_id']) === $postId ? 'post' : 'pre';
            $studentMap[$userId][$key] = $attempt;
            $attemptIds[intval($attempt['id'])] = [$userId, $key];
        }

        if ($attemptIds) {
            $ids = implode(',', array_map('intval', array_keys($attemptIds)));
            $lessonResult = $conn->query("SELECT ans.attempt_id, q.game_id, SUM(ans.is_correct) score FROM assessment_answers ans JOIN assessment_questions q ON q.id=ans.question_id WHERE ans.attempt_id IN ($ids) GROUP BY ans.attempt_id,q.game_id");
            while ($lesson = $lessonResult->fetch_assoc()) {
                [$userId, $key] = $attemptIds[intval($lesson['attempt_id'])];
                $currentAttempt = $studentMap[$userId][$key];
                if ($currentAttempt && intval($currentAttempt['id']) === intval($lesson['attempt_id'])) {
                    $studentMap[$userId]['lessons'][intval($lesson['game_id'])][$key] = intval($lesson['score']);
                }
            }
        }
    }

    if ($studentMap) {
        $scoreStmt = $conn->prepare("SELECT p.user_id, SUM(p.score) score FROM progress p JOIN users u ON u.user_id=p.user_id WHERE p.learning_session_id=? AND u.classroom_id=? GROUP BY p.user_id");
        $scoreStmt->bind_param('ii', $context['learning_session_id'], $context['classroom_id']);
        $scoreStmt->execute();
        $scoreResult = $scoreStmt->get_result();
        while ($score = $scoreResult->fetch_assoc()) {
            if (isset($studentMap[intval($score['user_id'])])) {
                $studentMap[intval($score['user_id'])]['game_score'] = intval($score['score']);
            }
        }
    }

    return ['settings' => $settings, 'students' => array_values($studentMap)];
}

function assessment_mean(array $values): float
{
    return $values ? array_sum($values) / count($values) : 0.0;
}

function assessment_standard_deviation(array $values): float
{
    $count = count($values);
    if ($count < 2) return 0.0;
    $mean = assessment_mean($values);
    $sum = 0.0;
    foreach ($values as $value) $sum += ($value - $mean) ** 2;
    return sqrt($sum / ($count - 1));
}
