<?php
// pages/guest_start.php
session_start();
require_once '../includes/db.php';

session_regenerate_id(true);

// Try to find DEMO4 classroom first
$joinCode = 'DEMO4';
$stmt = $conn->prepare("
    SELECT 
        s.id AS school_id,
        c.id AS classroom_id,
        c.teacher_id,
        ls.id AS learning_session_id
    FROM learning_sessions ls
    JOIN classrooms c ON ls.classroom_id = c.id
    JOIN schools s ON c.school_id = s.id
    WHERE c.join_code = ? AND ls.status = 'active'
    LIMIT 1
");
$stmt->bind_param("s", $joinCode);
$stmt->execute();
$demo = $stmt->get_result()->fetch_assoc();

// Fallback: If DEMO4 is not found, get any active session
if (!$demo) {
    $fallback_stmt = $conn->prepare("
        SELECT 
            s.id AS school_id,
            c.id AS classroom_id,
            c.teacher_id,
            ls.id AS learning_session_id
        FROM learning_sessions ls
        JOIN classrooms c ON ls.classroom_id = c.id
        JOIN schools s ON c.school_id = s.id
        WHERE ls.status = 'active'
        LIMIT 1
    ");
    $fallback_stmt->execute();
    $demo = $fallback_stmt->get_result()->fetch_assoc();
}

if (!$demo) {
    die('ยังไม่พบห้องทดลองใช้งานในระบบ (ไม่พบ active learning session) กรุณาติดต่อผู้ดูแลระบบ');
}

// Setup Visitor Session
$_SESSION['visitor_mode'] = true;
$_SESSION['user_id'] = 0;
$_SESSION['student_id'] = 'visitor';
$_SESSION['name'] = 'ผู้เยี่ยมชม';
$_SESSION['role'] = 'visitor';
$_SESSION['mode'] = 'solo';
$_SESSION['team_id'] = 'visitor_' . session_id();
$_SESSION['team_members'] = [0];

$_SESSION['school_id'] = (int)$demo['school_id'];
$_SESSION['classroom_id'] = (int)$demo['classroom_id'];
$_SESSION['teacher_id'] = (int)$demo['teacher_id'];
$_SESSION['learning_session_id'] = (int)$demo['learning_session_id'];
$_SESSION['join_code'] = 'VISITOR';

$_SESSION['visitor_progress'] = [];
$_SESSION['visitor_started_at'] = date('Y-m-d H:i:s');

header("Location: student_dashboard.php");
exit();
