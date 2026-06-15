<?php

require_once __DIR__ . '/assessment.php';

function survey_csrf_token(): string
{
    if (empty($_SESSION['survey_csrf'])) {
        $_SESSION['survey_csrf'] = bin2hex(random_bytes(24));
    }
    return $_SESSION['survey_csrf'];
}

function survey_verify_csrf(?string $token): bool
{
    return is_string($token) && hash_equals(survey_csrf_token(), $token);
}

function survey_json_response(array $payload, int $status = 200): void
{
    assessment_json_response($payload, $status);
}

function survey_read_json(): array
{
    return assessment_read_json();
}

function survey_is_individual(): bool
{
    return assessment_is_individual();
}

function survey_settings(mysqli $conn, int $learningSessionId): ?array
{
    if ($learningSessionId <= 0) {
        return null;
    }

    $stmt = $conn->prepare(
        "SELECT ss.*, s.title, s.description, s.scale_min, s.scale_max, s.status AS survey_definition_status,
                (SELECT COUNT(*) FROM survey_questions q WHERE q.survey_id=s.id AND q.status='active' AND q.question_type='rating') AS rating_questions,
                (SELECT COUNT(*) FROM survey_questions q WHERE q.survey_id=s.id AND q.status='active' AND q.question_type='open_text') AS open_questions
         FROM survey_settings ss
         LEFT JOIN surveys s ON s.id=ss.survey_id
         WHERE ss.learning_session_id=? LIMIT 1"
    );
    $stmt->bind_param('i', $learningSessionId);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc() ?: null;
}

function survey_response(mysqli $conn, int $surveyId, int $userId, int $learningSessionId): ?array
{
    $stmt = $conn->prepare(
        "SELECT * FROM survey_responses
         WHERE survey_id=? AND user_id=? AND learning_session_id=? AND status='submitted'
         LIMIT 1"
    );
    $stmt->bind_param('iii', $surveyId, $userId, $learningSessionId);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc() ?: null;
}

function survey_posttest_completed(mysqli $conn, int $userId, int $learningSessionId): bool
{
    $settings = assessment_settings($conn, $learningSessionId);
    $posttestId = intval($settings['posttest_assessment_id'] ?? 0);
    if ($posttestId <= 0) {
        return false;
    }
    $attempt = assessment_attempt($conn, $posttestId, $userId, $learningSessionId);
    return ($attempt['status'] ?? '') === 'submitted';
}

function survey_student_status(mysqli $conn, int $userId, array $context): array
{
    $sessionId = intval($context['learning_session_id'] ?? 0);
    $settings = survey_settings($conn, $sessionId);
    $surveyId = intval($settings['survey_id'] ?? 0);
    $response = $surveyId > 0 ? survey_response($conn, $surveyId, $userId, $sessionId) : null;
    $individual = survey_is_individual();
    $posttestCompleted = survey_posttest_completed($conn, $userId, $sessionId);
    $requiresPosttest = !empty($settings['required_after_posttest']);
    $definitionActive = ($settings['survey_definition_status'] ?? '') === 'active';
    $open = ($settings['survey_status'] ?? 'locked') === 'open';
    $eligible = $individual && (!$requiresPosttest || $posttestCompleted);
    $available = (bool) $settings && $surveyId > 0 && $definitionActive && $open && $eligible;

    $state = 'not_configured';
    $message = 'คุณครูยังไม่ได้กำหนดแบบสอบถามสำหรับรอบการเรียนรู้นี้';
    if (!$individual) {
        $state = 'individual_required';
        $message = 'แบบสอบถามเป็นความคิดเห็นรายบุคคล กรุณาเข้าสู่ระบบแบบรายบุคคล';
    } elseif ($response) {
        $state = 'submitted';
        $message = 'ส่งแบบสอบถามเรียบร้อยแล้ว ขอบคุณสำหรับความคิดเห็นของนักเรียน';
    } elseif ($settings && ($settings['survey_status'] ?? '') === 'closed') {
        $state = 'closed';
        $message = 'แบบสอบถามปิดรับคำตอบแล้ว';
    } elseif ($requiresPosttest && !$posttestCompleted) {
        $state = 'posttest_required';
        $message = 'กรุณาทำแบบทดสอบหลังเรียนให้เสร็จก่อนตอบแบบสอบถาม';
    } elseif (!$open) {
        $state = 'locked';
        $message = 'แบบสอบถามความพึงพอใจยังไม่เปิดให้ตอบ';
    } elseif ($available) {
        $state = 'open';
        $message = 'เปิดให้ตอบแบบสอบถามแล้ว';
    }

    return [
        'configured' => (bool) $settings && $surveyId > 0,
        'settings' => $settings,
        'survey_id' => $surveyId,
        'individual' => $individual,
        'posttest_completed' => $posttestCompleted,
        'response' => $response,
        'submitted' => (bool) $response,
        'allow_edit' => !empty($settings['allow_edit']),
        'available' => $available,
        'state' => $state,
        'message' => $message,
    ];
}

function survey_teacher_context(mysqli $conn): array
{
    return assessment_teacher_context($conn);
}

function survey_level(float $mean): string
{
    if ($mean >= 4.51) return 'มากที่สุด';
    if ($mean >= 3.51) return 'มาก';
    if ($mean >= 2.51) return 'ปานกลาง';
    if ($mean >= 1.51) return 'น้อย';
    if ($mean >= 1.00) return 'น้อยที่สุด';
    return '-';
}

function survey_questions(mysqli $conn, int $surveyId): array
{
    $stmt = $conn->prepare(
        "SELECT * FROM survey_questions WHERE survey_id=? AND status='active' ORDER BY question_no"
    );
    $stmt->bind_param('i', $surveyId);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function survey_report_data(mysqli $conn, array $context): array
{
    $settings = survey_settings($conn, intval($context['learning_session_id']));
    $surveyId = intval($settings['survey_id'] ?? 0);

    $studentStmt = $conn->prepare(
        "SELECT user_id, student_id, name, class_level FROM users
         WHERE role='student' AND school_id=? AND classroom_id=? AND teacher_id=?
         ORDER BY student_id, name"
    );
    $studentStmt->bind_param('iii', $context['school_id'], $context['classroom_id'], $context['teacher_id']);
    $studentStmt->execute();
    $students = $studentStmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $studentMap = [];
    foreach ($students as $student) {
        $student['response_id'] = null;
        $student['submitted_at'] = null;
        $student['answers'] = [];
        $student['average'] = 0.0;
        $studentMap[intval($student['user_id'])] = $student;
    }

    $questions = $surveyId > 0 ? survey_questions($conn, $surveyId) : [];
    $ratingQuestions = [];
    $openQuestions = [];
    $categories = [];
    foreach ($questions as $question) {
        $questionId = intval($question['id']);
        if ($question['question_type'] === 'rating') {
            $ratingQuestions[$questionId] = $question;
            $key = $question['category_key'];
            if (!isset($categories[$key])) {
                $categories[$key] = ['key' => $key, 'name' => $question['category_name'], 'question_ids' => [], 'values' => []];
            }
            $categories[$key]['question_ids'][] = $questionId;
        } else {
            $openQuestions[$questionId] = $question;
        }
    }

    $itemValues = array_fill_keys(array_keys($ratingQuestions), []);
    $overallValues = [];
    $comments = [];
    if ($surveyId > 0) {
        $responseStmt = $conn->prepare(
            "SELECT sr.id, sr.user_id, sr.submitted_at, sa.question_id, sa.rating_value, sa.text_answer
             FROM survey_responses sr
             LEFT JOIN survey_answers sa ON sa.response_id=sr.id
             WHERE sr.survey_id=? AND sr.learning_session_id=? AND sr.classroom_id=? AND sr.status='submitted'
             ORDER BY sr.submitted_at, sa.question_id"
        );
        $responseStmt->bind_param('iii', $surveyId, $context['learning_session_id'], $context['classroom_id']);
        $responseStmt->execute();
        $rows = $responseStmt->get_result();
        while ($row = $rows->fetch_assoc()) {
            $userId = intval($row['user_id']);
            if (!isset($studentMap[$userId])) continue;
            $studentMap[$userId]['response_id'] = intval($row['id']);
            $studentMap[$userId]['submitted_at'] = $row['submitted_at'];
            if ($row['question_id'] !== null) {
                $studentMap[$userId]['answers'][intval($row['question_id'])] = [
                    'rating_value' => $row['rating_value'] !== null ? intval($row['rating_value']) : null,
                    'text_answer' => $row['text_answer'],
                ];
            }
        }
    }

    $responded = 0;
    foreach ($studentMap as &$student) {
        if (!$student['response_id']) continue;
        $responded++;
        $studentRatings = [];
        foreach ($ratingQuestions as $questionId => $_question) {
            $value = $student['answers'][$questionId]['rating_value'] ?? null;
            if ($value !== null) {
                $itemValues[$questionId][] = $value;
                $studentRatings[] = $value;
            }
        }
        $student['average'] = assessment_mean($studentRatings);
        if ($studentRatings) $overallValues[] = $student['average'];

        foreach ($categories as $key => &$category) {
            $values = [];
            foreach ($category['question_ids'] as $questionId) {
                $value = $student['answers'][$questionId]['rating_value'] ?? null;
                if ($value !== null) $values[] = $value;
            }
            if ($values) $category['values'][] = assessment_mean($values);
        }
        unset($category);

        $comment = ['student_id' => $student['student_id'], 'name' => $student['name'], 'answers' => []];
        $hasComment = false;
        foreach ($openQuestions as $questionId => $question) {
            $text = trim((string) ($student['answers'][$questionId]['text_answer'] ?? ''));
            $comment['answers'][$questionId] = $text;
            if ($text !== '') $hasComment = true;
        }
        if ($hasComment) $comments[] = $comment;
    }
    unset($student);

    $itemStats = [];
    foreach ($ratingQuestions as $questionId => $question) {
        $values = $itemValues[$questionId];
        $mean = assessment_mean($values);
        $itemStats[] = [
            'question' => $question,
            'respondents' => count($values),
            'mean' => $mean,
            'sd' => assessment_standard_deviation($values),
            'level' => survey_level($mean),
        ];
    }

    $categoryStats = [];
    foreach ($categories as $category) {
        $mean = assessment_mean($category['values']);
        $categoryStats[] = [
            'key' => $category['key'],
            'name' => $category['name'],
            'respondents' => count($category['values']),
            'mean' => $mean,
            'sd' => assessment_standard_deviation($category['values']),
            'level' => survey_level($mean),
        ];
    }

    $overallMean = assessment_mean($overallValues);
    $totalStudents = count($students);
    return [
        'settings' => $settings,
        'questions' => $questions,
        'rating_questions' => array_values($ratingQuestions),
        'open_questions' => array_values($openQuestions),
        'students' => array_values($studentMap),
        'comments' => $comments,
        'item_stats' => $itemStats,
        'category_stats' => $categoryStats,
        'summary' => [
            'total_students' => $totalStudents,
            'responded' => $responded,
            'response_percent' => $totalStudents > 0 ? ($responded / $totalStudents) * 100 : 0.0,
            'mean' => $overallMean,
            'sd' => assessment_standard_deviation($overallValues),
            'level' => survey_level($overallMean),
        ],
    ];
}
