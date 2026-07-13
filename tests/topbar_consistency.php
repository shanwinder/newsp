<?php

$projectRoot = dirname(__DIR__);
$pageFiles = glob($projectRoot . '/pages/*.php') ?: [];
$topbarPages = [];
$errors = [];

foreach ($pageFiles as $pageFile) {
    $contents = file_get_contents($pageFile);
    if ($contents !== false && strpos($contents, 'student_navbar.php') !== false) {
        $topbarPages[] = $pageFile;
    }
}

foreach ($topbarPages as $pageFile) {
    $contents = file_get_contents($pageFile);
    $relativePath = str_replace($projectRoot . '/', '', $pageFile);

    $navbarCount = substr_count($contents, 'student_navbar.php');
    $headLoaderCount = substr_count($contents, 'app_head.php');
    $scriptLoaderCount = substr_count($contents, 'app_scripts.php');
    if ($headLoaderCount !== $navbarCount) {
        $errors[] = "{$relativePath}: must use one shared head loader for each student_navbar.php";
    }
    if ($scriptLoaderCount !== $navbarCount) {
        $errors[] = "{$relativePath}: must use one shared script loader for each student_navbar.php";
    }

    $forbiddenDirectAssets = [
        'bootstrap@5.3.3/dist/css/bootstrap.min.css',
        'bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
        'bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
        'fonts.googleapis.com/css2?family=Kanit',
        '../assets/css/game_common.css',
        '../assets/css/student_topbar.css',
        '../assets/css/components/rank_badges.css',
        '../assets/css/components/student_topbar.css',
        'student_topbar_head.php',
        'student_topbar_scripts.php',
    ];

    foreach ($forbiddenDirectAssets as $asset) {
        if (strpos($contents, $asset) !== false) {
            $errors[] = "{$relativePath}: loads shared Top Bar asset directly ({$asset})";
        }
    }

    foreach (['components/rank_badges.css', 'components/student_topbar.css'] as $sharedStyle) {
        if (strpos($contents, $sharedStyle) === false) {
            $errors[] = "{$relativePath}: missing shared Top Bar style ({$sharedStyle})";
        }
    }
}

if ($topbarPages === []) {
    $errors[] = 'No pages using student_navbar.php were found';
}

if ($errors !== []) {
    fwrite(STDERR, "Top Bar consistency check failed:\n- " . implode("\n- ", $errors) . "\n");
    exit(1);
}

echo 'Top Bar consistency check passed for ' . count($topbarPages) . " pages.\n";
