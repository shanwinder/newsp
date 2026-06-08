<?php

function current_role(): string
{
    return $_SESSION['role'] ?? 'guest';
}

function is_visitor_mode(): bool
{
    return !empty($_SESSION['visitor_mode']);
}

function is_student_like(): bool
{
    return in_array(current_role(), ['student', 'visitor'], true);
}

function require_student_like(): void
{
    if (!isset($_SESSION['user_id']) || !is_student_like()) {
        header("Location: login.php");
        exit();
    }
}

function is_super_admin(): bool
{
    return in_array(current_role(), ['admin', 'super_admin'], true);
}

function is_teacher(): bool
{
    return current_role() === 'teacher';
}

function is_teacher_or_admin(): bool
{
    return is_teacher() || is_super_admin();
}

function require_login(): void
{
    if (!isset($_SESSION['user_id'])) {
        header("Location: login.php");
        exit();
    }
}

function require_teacher_or_admin(): void
{
    require_login();
    if (!is_teacher_or_admin()) {
        header("Location: login.php");
        exit();
    }
}

function require_super_admin(): void
{
    require_login();
    if (!is_super_admin()) {
        header("Location: dashboard.php");
        exit();
    }
}

function ensure_active_account(mysqli $conn): void
{
    if (!isset($_SESSION['user_id'])) {
        return;
    }

    $stmt = $conn->prepare("SELECT role, status FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if (!$user) {
        session_destroy();
        header("Location: login.php");
        exit();
    }

    if (($user['role'] ?? '') === 'teacher' && ($user['status'] ?? '') !== 'active') {
        session_destroy();
        header("Location: pending_approval.php");
        exit();
    }
}
