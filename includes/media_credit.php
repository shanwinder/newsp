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
    <footer class="<?php echo media_credit_html($classes); ?>" style="position:relative;z-index:2;margin:28px auto 22px;padding:18px 20px;text-align:center;color:#475569;background:rgba(255,255,255,.86);border:1px solid rgba(15,23,42,.10);border-radius:18px;box-shadow:0 10px 28px rgba(15,23,42,.06);max-width:1180px;">
        <div style="font-weight:800;color:#14532d;">พัฒนาโดย <?php echo media_credit_html($app['developer_name']); ?></div>
        <div><?php echo media_credit_html($app['developer_position']); ?> | สพป.มุกดาหาร</div>
        <div style="font-size:.92rem;">© <?php echo media_credit_html($app['release_year_th']); ?> สงวนลิขสิทธิ์ | Version <?php echo media_credit_html($app['system_version']); ?> | <a href="<?php echo media_credit_html($aboutHref); ?>" style="color:#166534;font-weight:700;text-decoration:none;">เกี่ยวกับสื่อ</a></div>
    </footer>
    <?php
}

function render_media_credit_notice(string $extraClass = 'mb-4'): void
{
    $app = media_credit_app();
    ?>
    <div class="media-credit-notice <?php echo media_credit_html($extraClass); ?>" style="border:1px solid rgba(22,101,52,.18);border-left:5px solid #16a34a;border-radius:14px;background:#f0fdf4;padding:14px 18px;color:#14532d;">
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
