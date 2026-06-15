<?php

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/survey.php';

function check(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

$requiredTables = ['surveys', 'survey_questions', 'survey_responses', 'survey_answers', 'survey_settings'];
foreach ($requiredTables as $table) {
    $escaped = $conn->real_escape_string($table);
    $result = $conn->query("SHOW TABLES LIKE '{$escaped}'");
    check($result->num_rows === 1, "Missing table: {$table}");
}

$survey = $conn->query("SELECT id FROM surveys WHERE survey_type='satisfaction' AND status='active' ORDER BY id LIMIT 1")->fetch_assoc();
check((bool) $survey, 'Missing active satisfaction survey');
$surveyId = intval($survey['id']);
$countStmt = $conn->prepare("SELECT question_type, COUNT(*) total FROM survey_questions WHERE survey_id=? AND status='active' GROUP BY question_type");
$countStmt->bind_param('i', $surveyId);
$countStmt->execute();
$counts = [];
$countResult = $countStmt->get_result();
while ($row = $countResult->fetch_assoc()) $counts[$row['question_type']] = intval($row['total']);
check(($counts['rating'] ?? 0) === 15, 'Expected 15 rating questions');
check(($counts['open_text'] ?? 0) === 2, 'Expected 2 open questions');
check(survey_level(4.51) === 'มากที่สุด' && survey_level(3.51) === 'มาก', 'Survey level boundaries are incorrect');

$candidate = $conn->query(
    "SELECT u.user_id, u.school_id, u.classroom_id, u.teacher_id, ls.id learning_session_id, ss.survey_id
     FROM users u
     JOIN learning_sessions ls ON ls.classroom_id=u.classroom_id AND ls.status='active'
     JOIN survey_settings ss ON ss.learning_session_id=ls.id AND ss.survey_id IS NOT NULL
     LEFT JOIN survey_responses sr ON sr.user_id=u.user_id AND sr.survey_id=ss.survey_id AND sr.learning_session_id=ls.id
     WHERE u.role='student' AND sr.id IS NULL
     ORDER BY u.user_id LIMIT 1"
)->fetch_assoc();
check((bool) $candidate, 'No student is available for the transactional smoke test');

$conn->begin_transaction();
try {
    $insertResponse = $conn->prepare("INSERT INTO survey_responses (survey_id,user_id,school_id,classroom_id,teacher_id,learning_session_id,submitted_at,status) VALUES (?,?,?,?,?,?,NOW(),'submitted')");
    $insertResponse->bind_param('iiiiii', $candidate['survey_id'], $candidate['user_id'], $candidate['school_id'], $candidate['classroom_id'], $candidate['teacher_id'], $candidate['learning_session_id']);
    $insertResponse->execute();
    $responseId = intval($conn->insert_id);

    $questions = survey_questions($conn, intval($candidate['survey_id']));
    $insertAnswer = $conn->prepare("INSERT INTO survey_answers (response_id,question_id,rating_value,text_answer) VALUES (?,?,?,?)");
    foreach ($questions as $question) {
        $questionId = intval($question['id']);
        $rating = $question['question_type'] === 'rating' ? 3 : null;
        $text = $question['question_type'] === 'open_text' ? 'smoke-test' : null;
        $insertAnswer->bind_param('iiis', $responseId, $questionId, $rating, $text);
        $insertAnswer->execute();
    }

    $context = [
        'school_id' => intval($candidate['school_id']),
        'classroom_id' => intval($candidate['classroom_id']),
        'teacher_id' => intval($candidate['teacher_id']),
        'learning_session_id' => intval($candidate['learning_session_id']),
    ];
    $report = survey_report_data($conn, $context);
    $testedStudent = null;
    foreach ($report['students'] as $student) {
        if (intval($student['user_id']) === intval($candidate['user_id'])) $testedStudent = $student;
    }
    check((bool) $testedStudent && abs(floatval($testedStudent['average']) - 3.0) < 0.0001, 'Student average calculation failed');
    check(count($report['category_stats']) === 5, 'Expected 5 survey categories');
    check(count($report['item_stats']) === 15, 'Expected 15 item statistics');
    check($report['summary']['responded'] >= 1, 'Response summary calculation failed');

    $conn->rollback();
    echo "Survey smoke test passed: 5 tables, 15 rating questions, 2 open questions, report calculations OK.\n";
} catch (Throwable $error) {
    $conn->rollback();
    throw $error;
}
