<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$forbidden = ['panel-head', 'control-panel', 'item-name', 'title', 'content', 'wrapper'];
$errors = [];

foreach (glob($root . '/assets/css/**/*.css') ?: [] as $file) {
    $source = file_get_contents($file);
    if ($source === false) continue;
    foreach ($forbidden as $selector) {
        if (preg_match('/(^|[}\n])\s*\.' . preg_quote($selector, '/') . '(?=[\s,{:#.>+~])/m', $source, $match, PREG_OFFSET_CAPTURE)) {
            $line = substr_count(substr($source, 0, $match[0][1]), "\n") + 1;
            $errors[] = str_replace($root . '/', '', $file) . ":{$line}: .{$selector} must be under a page/module/game namespace";
        }
    }
}

if ($errors !== []) {
    fwrite(STDERR, "CSS selector guard failed:\n- " . implode("\n- ", $errors) . "\n");
    exit(1);
}

echo "CSS selector guard passed.\n";
