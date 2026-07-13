<?php
/**
 * Shared UI dependency loader.
 *
 * Optional inputs:
 * - $asset_prefix: URL prefix before /assets (defaults to ".." for pages/).
 * - $page_styles: CSS paths relative to assets/css/.
 */

$asset_prefix = isset($asset_prefix) ? rtrim((string) $asset_prefix, '/') : '..';
$requestedStyles = $page_styles ?? [];

if (!is_array($requestedStyles)) {
    throw new InvalidArgumentException('$page_styles must be an array.');
}

$coreStyles = [
    'core/tokens.css',
    'core/base.css',
    'core/accessibility.css',
    'components/media_credit.css',
];
$styles = array_values(array_unique(array_merge($coreStyles, $requestedStyles)));
$cssRoot = realpath(__DIR__ . '/../assets/css');

if ($cssRoot === false) {
    throw new RuntimeException('CSS asset directory is unavailable.');
}
?>
<link rel="icon" href="data:,">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800;900&amp;display=swap" rel="stylesheet">
<?php foreach ($styles as $style): ?>
    <?php
    if (!is_string($style)
        || !preg_match('/\A[a-zA-Z0-9_\/.\-]+\.css\z/', $style)
        || str_contains($style, '..')) {
        throw new InvalidArgumentException('Invalid CSS asset path.');
    }

    $absolutePath = realpath($cssRoot . '/' . $style);
    if ($absolutePath === false || !str_starts_with($absolutePath, $cssRoot . DIRECTORY_SEPARATOR)) {
        throw new RuntimeException("Missing CSS asset: {$style}");
    }
    $href = $asset_prefix . '/assets/css/' . $style;
    ?>
<link rel="stylesheet" href="<?php echo htmlspecialchars($href, ENT_QUOTES, 'UTF-8'); ?>">
<?php endforeach; ?>
