<?php
$project_game_id = 4;
require_once '../includes/auth.php';
if (!is_student_like() || is_visitor_mode()) {
    header("Location: login.php");
    exit();
}
require __DIR__ . '/create_project_template.php';
