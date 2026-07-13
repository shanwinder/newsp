<?php

function media_credit_app(): array
{
    static $app = null;
    if ($app === null) {
        $app = require __DIR__ . '/../config/app.php';
    }

    return $app;
}

function media_credit_html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function media_credit_developer_text(?array $app = null): string
{
    $app = $app ?? media_credit_app();

    return 'พัฒนาโดย ' . $app['developer_name'] . "\n"
        . $app['developer_position'] . ' | สพป.มุกดาหาร' . "\n"
        . '© ' . $app['release_year_th'] . ' สงวนลิขสิทธิ์';
}

function media_credit_full_notice(?array $app = null): string
{
    $app = $app ?? media_credit_app();

    return $app['copyright_notice'] . "\n\n"
        . $app['developer_position'] . "\n"
        . $app['developer_affiliation'] . "\n\n"
        . 'สงวนลิขสิทธิ์ในระบบเกมแบบฝึกทักษะออนไลน์' . "\n"
        . 'อนุญาตให้ใช้เพื่อการจัดการเรียนรู้โดยต้องอ้างอิงผู้พัฒนา' . "\n"
        . 'ห้ามนำไปใช้เชิงพาณิชย์โดยไม่ได้รับอนุญาต';
}

function render_media_credit_footer(string $aboutHref = 'about_media.php', string $extraClass = ''): void
{
    $app = media_credit_app();
    $classes = trim('media-credit-footer ' . $extraClass);
    ?>
    <footer class="media-credit-footer <?php echo media_credit_html($classes); ?>">
        <div class="media-credit-developer">พัฒนาโดย <?php echo media_credit_html($app['developer_name']); ?></div>
        <div><?php echo media_credit_html($app['developer_position']); ?> | สพป.มุกดาหาร</div>
        <div class="media-credit-meta">© <?php echo media_credit_html($app['release_year_th']); ?> สงวนลิขสิทธิ์ | Version <?php echo media_credit_html($app['system_version']); ?> | <a class="media-credit-link" href="<?php echo media_credit_html($aboutHref); ?>">เกี่ยวกับสื่อ</a></div>
    </footer>
    <?php
}

function render_media_credit_notice(string $extraClass = 'mb-4'): void
{
    $app = media_credit_app();
    ?>
    <div class="media-credit-notice <?php echo media_credit_html($extraClass); ?>">
        <div class="fw-bold">ข้อมูลลิขสิทธิ์สื่อ</div>
        <div><?php echo media_credit_html($app['copyright_notice']); ?> | Version <?php echo media_credit_html($app['system_version']); ?></div>
        <div class="small"><?php echo media_credit_html($app['license_summary']); ?></div>
    </div>
    <?php
}

function write_media_credit_csv_metadata($output, string $reportTitle, ?array $app = null): void
{
    $app = $app ?? media_credit_app();
    fputcsv($output, ['report', $reportTitle]);
    fputcsv($output, ['media_title', $app['app_name']]);
    fputcsv($output, ['developer', $app['developer_name']]);
    fputcsv($output, ['school', $app['school_name']]);
    fputcsv($output, ['affiliation', $app['developer_affiliation']]);
    fputcsv($output, ['version', $app['system_version']]);
    fputcsv($output, ['copyright', $app['copyright_notice']]);
    fputcsv($output, ['license', $app['license_summary']]);
    fputcsv($output, []);
}
