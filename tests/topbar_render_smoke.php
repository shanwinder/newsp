<?php

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

if ($argc < 2) {
    fwrite(STDERR, "Usage: php tests/topbar_render_smoke.php <page.php> [query-string]\n");
    exit(2);
}

$projectRoot = dirname(__DIR__);
$page = basename($argv[1]);
$queryString = $argv[2] ?? '';
$pagePath = $projectRoot . '/pages/' . $page;

if (!is_file($pagePath)) {
    fwrite(STDERR, "Missing page: {$page}\n");
    exit(2);
}

require_once $projectRoot . '/includes/db.php';

function topbar_smoke_check(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

$candidate = $conn->query(
    "SELECT u.user_id, u.student_id, u.name, u.school_id, u.classroom_id, u.teacher_id, ls.id learning_session_id
     FROM users u
     JOIN learning_sessions ls ON ls.classroom_id = u.classroom_id AND ls.status = 'active'
     WHERE u.role = 'student'
     ORDER BY u.user_id LIMIT 1"
)->fetch_assoc();

topbar_smoke_check((bool) $candidate, 'No student with active learning session found');

session_id('codex-topbar-smoke-' . md5($page . $queryString));
session_start();
$_SESSION = [
    'user_id' => intval($candidate['user_id']),
    'student_id' => $candidate['student_id'],
    'name' => $candidate['name'],
    'role' => 'student',
    'mode' => 'solo',
    'school_id' => intval($candidate['school_id']),
    'classroom_id' => intval($candidate['classroom_id']),
    'teacher_id' => intval($candidate['teacher_id']),
    'learning_session_id' => intval($candidate['learning_session_id']),
];

parse_str($queryString, $_GET);
$_POST = [];
$_SERVER['REQUEST_METHOD'] = 'GET';

chdir($projectRoot . '/pages');
ob_start();
include $pagePath;
$html = ob_get_clean();

topbar_smoke_check(strpos($html, 'student-topbar navbar') !== false, "{$page}: missing Top Bar class");
topbar_smoke_check(strpos($html, '../assets/css/components/student_topbar.css') !== false, "{$page}: missing Top Bar CSS");
topbar_smoke_check(strpos($html, 'bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js') !== false, "{$page}: missing Bootstrap bundle");
topbar_smoke_check(strpos($html, 'student-profile-name') !== false && strpos($html, '<strong class="student-profile-name') !== false, "{$page}: student name is not rendered with strong profile class");
topbar_smoke_check(strpos($html, 'student-profile-title') !== false, "{$page}: missing student title badge");

if ($page === 'play_game.php') {
    $stageId = intval($_GET['stage_id'] ?? 0);
    topbar_smoke_check(strpos($html, '../assets/css/games/play_game_shell.css') !== false, 'play_game.php: missing game shell CSS');
    topbar_smoke_check(strpos($html, '<style') === false, 'play_game.php: generated style block remains');
    if ($stageId >= 1 && $stageId <= 3) {
        topbar_smoke_check(strpos($html, '../assets/css/games/farm_logic_missions.css') !== false, 'Logic stage: missing static mission CSS');
        topbar_smoke_check(strpos($html, 'farm-logic-game') !== false, 'Logic stage: missing namespace');
    } elseif ($stageId >= 4 && $stageId <= 6) {
        topbar_smoke_check(strpos($html, '../assets/css/games/farm_missions.css') !== false, 'Sequence stage: missing static mission CSS');
        topbar_smoke_check(strpos($html, 'farm-missions-game') !== false, 'Sequence stage: missing namespace');
    } elseif ($stageId >= 7 && $stageId <= 12) {
        topbar_smoke_check(strpos($html, '../assets/css/games/conveyor_logic.css') !== false, 'Conveyor/debugger stage: missing conveyor CSS');
        topbar_smoke_check(strpos($html, 'conveyor-game') !== false, 'Conveyor/debugger stage: missing namespace');
    }
}

echo "{$page} render smoke passed.\n";
