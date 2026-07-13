<?php
/**
 * Shared script loader. $page_scripts contains paths relative to assets/js/.
 */

$asset_prefix = isset($asset_prefix) ? rtrim((string) $asset_prefix, '/') : '..';
$requestedScripts = $page_scripts ?? [];

if (!is_array($requestedScripts)) {
    throw new InvalidArgumentException('$page_scripts must be an array.');
}

$scripts = array_values(array_unique($requestedScripts));
$jsRoot = realpath(__DIR__ . '/../assets/js');
?>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<?php foreach ($scripts as $script): ?>
    <?php
    if (!is_string($script)
        || !preg_match('/\A[a-zA-Z0-9_\/.\-]+\.js\z/', $script)
        || str_contains($script, '..')) {
        throw new InvalidArgumentException('Invalid JavaScript asset path.');
    }

    $absolutePath = $jsRoot === false ? false : realpath($jsRoot . '/' . $script);
    if ($absolutePath === false || !str_starts_with($absolutePath, $jsRoot . DIRECTORY_SEPARATOR)) {
        throw new RuntimeException("Missing JavaScript asset: {$script}");
    }
    $src = $asset_prefix . '/assets/js/' . $script;
    ?>
<script src="<?php echo htmlspecialchars($src, ENT_QUOTES, 'UTF-8'); ?>"></script>
<?php endforeach; ?>
