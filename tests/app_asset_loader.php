<?php

declare(strict_types=1);

$root = dirname(__DIR__);

function loader_check(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

$asset_prefix = '.';
$page_styles = ['pages/pending_approval.css', 'pages/pending_approval.css'];
ob_start();
require $root . '/includes/app_head.php';
$head = ob_get_clean();

loader_check(substr_count($head, 'bootstrap@5.3.3/dist/css/bootstrap.min.css') === 1, 'Bootstrap CSS must load once');
loader_check(substr_count($head, 'bootstrap-icons@1.11.3/font/bootstrap-icons.min.css') === 1, 'Bootstrap Icons must load once');
loader_check(substr_count($head, 'fonts.googleapis.com/css2?family=Kanit') === 1, 'Kanit must load once');
loader_check(substr_count($head, 'pages/pending_approval.css') === 1, 'Duplicate page styles must be removed');
loader_check(strpos($head, 'core/tokens.css') < strpos($head, 'pages/pending_approval.css'), 'Core styles must load before page styles');

$asset_prefix = '.';
$page_styles = ['../config/app.css'];
$blocked = false;
try {
    ob_start();
    require $root . '/includes/app_head.php';
    ob_end_clean();
} catch (InvalidArgumentException $error) {
    if (ob_get_level() > 0) ob_end_clean();
    $blocked = true;
}
loader_check($blocked, 'CSS path traversal must be blocked');

$asset_prefix = '.';
$page_scripts = ['game_audio.js', 'game_audio.js'];
ob_start();
require $root . '/includes/app_scripts.php';
$scripts = ob_get_clean();
loader_check(substr_count($scripts, 'bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js') === 1, 'Bootstrap bundle must load once');
loader_check(substr_count($scripts, 'game_audio.js') === 1, 'Duplicate page scripts must be removed');

echo "Shared asset loader tests passed.\n";
