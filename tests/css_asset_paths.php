<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$cssRoot = realpath($root . '/assets/css');
$errors = [];
$referenced = [];
$sources = array_merge(
    [$root . '/includes/app_head.php', $root . '/gateway.html', $root . '/index.php', $root . '/reset.php'],
    glob($root . '/pages/*.php') ?: [],
    glob($root . '/includes/*.php') ?: []
);

foreach ($sources as $file) {
    $source = file_get_contents($file);
    if ($source === false) continue;
    if (preg_match_all('/["\'](?:assets\/css\/)?((?:core|components|pages|modules|games)\/[a-zA-Z0-9_.\/-]+\.css)["\']/', $source, $matches)) {
        foreach ($matches[1] as $path) {
            if (str_contains($path, '..')) {
                $errors[] = "Unsafe CSS path in {$file}: {$path}";
                continue;
            }
            $absolute = realpath($root . '/assets/css/' . $path);
            if ($absolute === false || $cssRoot === false || !str_starts_with($absolute, $cssRoot . DIRECTORY_SEPARATOR)) {
                $errors[] = "Missing CSS asset: {$path}";
                continue;
            }
            $referenced[$absolute] = true;
        }
    }
    foreach (['assets/css/assessment.css', 'assets/css/survey.css', 'assets/css/game_common.css', 'assets/css/student_topbar.css', 'assets/css/conveyor_logic.css'] as $legacy) {
        if (str_contains($source, $legacy)) $errors[] = "Legacy CSS path remains in " . str_replace($root . '/', '', $file) . ": {$legacy}";
    }
}

foreach (glob($root . '/assets/css/**/*.css') ?: [] as $file) {
    $source = file_get_contents($file);
    if ($source === false) continue;
    if (preg_match_all('/url\(\s*["\']?(?!data:|https?:|#)([^"\')]+)["\']?\s*\)/i', $source, $matches)) {
        foreach ($matches[1] as $url) {
            $path = realpath(dirname($file) . '/' . trim($url));
            if ($path === false) {
                $errors[] = 'Broken relative url in ' . str_replace($root . '/', '', $file) . ': ' . $url;
            }
        }
    }
    $absolute = realpath($file);
    if ($absolute !== false && !isset($referenced[$absolute])) {
        $errors[] = 'Orphan CSS asset: ' . str_replace($root . '/', '', $file);
    }
}

if ($errors !== []) {
    fwrite(STDERR, "CSS asset path check failed:\n- " . implode("\n- ", array_unique($errors)) . "\n");
    exit(1);
}

echo 'CSS asset path check passed for ' . count($referenced) . " referenced stylesheets.\n";
