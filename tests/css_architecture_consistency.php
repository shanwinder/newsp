<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$entries = array_merge([$root . '/index.php', $root . '/reset.php'], glob($root . '/pages/*.php') ?: []);
$errors = [];

foreach ($entries as $file) {
    $source = file_get_contents($file);
    if ($source === false || stripos($source, '<head') === false) {
        continue;
    }
    $relative = str_replace($root . '/', '', $file);
    $bodyCount = preg_match_all('/<body\b/i', $source);

    if (strpos($source, 'app_head.php') === false) {
        $errors[] = "{$relative}: missing shared app_head loader";
    }
    if ($bodyCount > 0 && substr_count($source, 'app-page') < $bodyCount) {
        $errors[] = "{$relative}: every document body must include app-page";
    }
    if (preg_match('/<style\b/i', $source)) {
        $errors[] = "{$relative}: embedded <style> is forbidden";
    }
    if (preg_match('~<link\b[^>]+(?:bootstrap|bootstrap-icons|fonts\.googleapis|assets/css/)~i', $source)) {
        $errors[] = "{$relative}: loads a shared stylesheet directly";
    }
    if (preg_match('~<script\b[^>]+bootstrap(?:\.bundle)?(?:\.min)?\.js~i', $source)) {
        $errors[] = "{$relative}: loads Bootstrap JavaScript directly";
    }

    if (preg_match_all('/\bstyle\s*=\s*("|\')(.*?)\1/is', $source, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $value = $match[2];
            $runtimeValue = str_contains($value, '<?') || str_contains($value, '${') || str_contains($value, '--');
            if (!$runtimeValue) {
                $errors[] = "{$relative}: fixed inline style remains ({$value})";
            }
        }
    }
}

$gateway = file_get_contents($root . '/gateway.html');
if ($gateway !== false && preg_match('/<style\b/i', $gateway)) {
    $errors[] = 'gateway.html: embedded <style> is forbidden';
}

$scriptFiles = array_merge(glob($root . '/assets/js/*.js') ?: [], glob($root . '/assets/js/**/*.js') ?: [], $entries);
foreach (array_unique($scriptFiles) as $file) {
    $source = file_get_contents($file);
    if ($source === false) continue;
    $relative = str_replace($root . '/', '', $file);
    if (preg_match('/createElement\s*\(\s*["\']style["\']\s*\)|style\.innerHTML\s*=|appendChild\s*\(\s*style\s*\)/i', $source)) {
        $errors[] = "{$relative}: runtime stylesheet injection is forbidden";
    }
    if (pathinfo($file, PATHINFO_EXTENSION) !== 'css' && str_contains($source, '!important')) {
        $errors[] = "{$relative}: !important must not live in PHP or JavaScript";
    }
}

if ($errors !== []) {
    fwrite(STDERR, "CSS architecture consistency failed:\n- " . implode("\n- ", array_unique($errors)) . "\n");
    exit(1);
}

echo 'CSS architecture consistency passed for ' . count(array_filter($entries, static fn ($file) => stripos((string) file_get_contents($file), '<head') !== false)) . " PHP entry points.\n";
