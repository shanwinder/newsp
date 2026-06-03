<?php

require_once __DIR__ . '/auth.php';

function build_join_code(mysqli $conn): string
{
    do {
        $code = strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
        $stmt = $conn->prepare("SELECT id FROM classrooms WHERE join_code = ? LIMIT 1");
        $stmt->bind_param("s", $code);
        $stmt->execute();
        $exists = $stmt->get_result()->num_rows > 0;
    } while ($exists);

    return $code;
}

function active_learning_session(mysqli $conn, int $classroom_id): ?array
{
    $stmt = $conn->prepare("SELECT * FROM learning_sessions WHERE classroom_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1");
    $stmt->bind_param("i", $classroom_id);
    $stmt->execute();
    $session = $stmt->get_result()->fetch_assoc();

    if ($session) {
        return $session;
    }

    $stmt = $conn->prepare("SELECT c.*, s.school_name FROM classrooms c JOIN schools s ON c.school_id = s.id WHERE c.id = ? LIMIT 1");
    $stmt->bind_param("i", $classroom_id);
    $stmt->execute();
    $classroom = $stmt->get_result()->fetch_assoc();
    if (!$classroom) {
        return null;
    }

    $session_name = 'รอบการเรียนรู้หลัก';
    $stmt = $conn->prepare("INSERT INTO learning_sessions (school_id, classroom_id, teacher_id, session_name, class_status, navigation_status, status) VALUES (?, ?, ?, ?, 'active', 'locked', 'active')");
    $stmt->bind_param("iiis", $classroom['school_id'], $classroom_id, $classroom['teacher_id'], $session_name);
    $stmt->execute();

    $new_id = $conn->insert_id;
    $stmt = $conn->prepare("SELECT * FROM learning_sessions WHERE id = ?");
    $stmt->bind_param("i", $new_id);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc() ?: null;
}

function classroom_scope_sql(string $alias = 'u'): string
{
    if (is_super_admin() && empty($_SESSION['classroom_id'])) {
        return "1=1";
    }

    return "{$alias}.school_id = ? AND {$alias}.classroom_id = ? AND {$alias}.teacher_id = ?";
}

function selected_classroom_id(mysqli $conn): ?int
{
    if (isset($_GET['classroom_id'])) {
        $_SESSION['classroom_id'] = intval($_GET['classroom_id']);
    }

    if (isset($_SESSION['classroom_id']) && intval($_SESSION['classroom_id']) > 0) {
        return intval($_SESSION['classroom_id']);
    }

    if (!isset($_SESSION['user_id'])) {
        return null;
    }

    if (is_teacher()) {
        $stmt = $conn->prepare("SELECT id FROM classrooms WHERE teacher_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1");
        $stmt->bind_param("i", $_SESSION['user_id']);
    } else {
        $stmt = $conn->prepare("SELECT id FROM classrooms WHERE status = 'active' ORDER BY id ASC LIMIT 1");
    }

    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    if ($row) {
        $_SESSION['classroom_id'] = intval($row['id']);
        return intval($row['id']);
    }

    return null;
}

function classroom_context(mysqli $conn, ?int $classroom_id = null): ?array
{
    $classroom_id = $classroom_id ?: selected_classroom_id($conn);
    if (!$classroom_id) {
        return null;
    }

    $sql = "SELECT c.*, s.school_name, s.status as school_status, u.name as teacher_name
            FROM classrooms c
            JOIN schools s ON c.school_id = s.id
            JOIN users u ON c.teacher_id = u.user_id
            WHERE c.id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $classroom_id);
    $stmt->execute();
    $classroom = $stmt->get_result()->fetch_assoc();
    if (!$classroom) {
        return null;
    }

    if (is_teacher() && intval($classroom['teacher_id']) !== intval($_SESSION['user_id'])) {
        return null;
    }

    $session = active_learning_session($conn, $classroom_id);
    return [
        'school_id' => intval($classroom['school_id']),
        'classroom_id' => intval($classroom['id']),
        'teacher_id' => intval($classroom['teacher_id']),
        'learning_session_id' => intval($session['id'] ?? 0),
        'classroom' => $classroom,
        'learning_session' => $session,
    ];
}

function apply_context_to_session(array $context): void
{
    $_SESSION['school_id'] = $context['school_id'];
    $_SESSION['classroom_id'] = $context['classroom_id'];
    $_SESSION['teacher_id'] = $context['teacher_id'];
    $_SESSION['learning_session_id'] = $context['learning_session_id'];
}

function session_context(): array
{
    return [
        'school_id' => intval($_SESSION['school_id'] ?? 0),
        'classroom_id' => intval($_SESSION['classroom_id'] ?? 0),
        'teacher_id' => intval($_SESSION['teacher_id'] ?? 0),
        'learning_session_id' => intval($_SESSION['learning_session_id'] ?? 0),
    ];
}
