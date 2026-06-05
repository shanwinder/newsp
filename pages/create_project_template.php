<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
$app = require __DIR__ . '/../config/app.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$projectConfigs = [
    2 => [
        'title' => 'ออกแบบเส้นทางรถไถแก้ปัญหา',
        'subtitle' => 'สร้างแผนที่ จุดเริ่มต้น จุดหมาย สิ่งกีดขวาง และลำดับคำสั่ง',
        'theme' => '#2563eb',
        'icon' => 'bi-signpost-2',
        'fields' => [
            'map' => ['label' => 'แผนที่หรือฉากที่ออกแบบ', 'placeholder' => 'เช่น ตาราง 5x5 รถไถเริ่มที่มุมซ้ายล่าง เป้าหมายอยู่มุมขวาบน มีกองฟางกลางทาง'],
            'commands' => ['label' => 'ลำดับคำสั่ง', 'placeholder' => 'เช่น ขวา, ขวา, ขึ้น, ขึ้น, ขวา'],
            'reason' => ['label' => 'เหตุผลของการเรียงคำสั่ง', 'placeholder' => 'อธิบายว่าทำไมต้องไปเส้นทางนี้ และหลบสิ่งกีดขวางอย่างไร']
        ],
        'rubric' => 'ตรวจความชัดเจนของแผนที่ ความถูกต้องของลำดับคำสั่ง และเหตุผลในการเลือกเส้นทาง'
    ],
    3 => [
        'title' => 'ออกแบบด่าน Water Hero ของฉัน',
        'subtitle' => 'สร้างสถานการณ์สวน การ์ดเงื่อนไข กฎ If-Then-Else Wave และผลลัพธ์ของด่าน',
        'theme' => '#0891b2',
        'icon' => 'bi-droplet-half',
        'fields' => [
            'stage_story' => ['label' => 'ชื่อด่านและเรื่องราว', 'placeholder' => 'เช่น บอสเมฆดำบุกสวนสมุนไพร น้องหยดน้ำต้องป้องกันสวนก่อนน้ำท่วม'],
            'threats' => ['label' => 'ภัยคุกคามในด่าน', 'placeholder' => 'เช่น แดดแรง, ฝนถล่ม, ถังน้ำรั่ว หรือบั๊กเงื่อนไข'],
            'plots' => ['label' => 'ข้อมูลแปลงผักและเซ็นเซอร์', 'placeholder' => 'เช่น แปลง A ดินแห้ง ไม่มีฝน ถังพร้อม / แปลง B ฝนตกและดินแห้ง / แปลง C ถังน้ำหมด'],
            'cards' => ['label' => 'การ์ดเงื่อนไขและการ์ดคำสั่ง', 'placeholder' => 'เช่น เงื่อนไข: ถังน้ำหมด, ฝนตก, ดินแห้ง / คำสั่ง: แจ้งเติมน้ำ, หยุดรดน้ำ, รดน้ำ, สังเกตต่อ'],
            'rules' => ['label' => 'กฎ If-Then-Else ที่เป็นคำตอบ', 'placeholder' => 'เช่น ถ้าถังน้ำหมด -> แจ้งเติมน้ำ / มิฉะนั้นถ้าฝนตก -> หยุดรดน้ำ / มิฉะนั้นถ้าดินแห้ง -> รดน้ำ / มิฉะนั้น -> สังเกตต่อ'],
            'feedback' => ['label' => 'ผลลัพธ์และ Feedback เมื่อผู้เล่นทำถูกหรือผิด', 'placeholder' => 'เช่น ถ้าตรวจฝนช้า แปลง A น้ำท่วม เพราะระบบรดน้ำตอนฝนตก ลองย้ายฝนตกขึ้นมาก่อนดินแห้ง']
        ],
        'rubric' => 'ตรวจความสนุกของสถานการณ์ ความถูกต้องของเงื่อนไข ความครอบคลุมของ Wave ลำดับการตรวจเงื่อนไข และ Feedback ที่ช่วยให้เพื่อนแก้กฎได้'
    ],
    4 => [
        'title' => 'สร้างโจทย์บั๊กฟาร์มและวิธีแก้ไข',
        'subtitle' => 'ออกแบบชุดคำสั่งที่ผิด ระบุบั๊ก และเสนอวิธีแก้ไขอย่างเป็นขั้นตอน',
        'theme' => '#d97706',
        'icon' => 'bi-bug',
        'fields' => [
            'buggy_steps' => ['label' => 'ชุดคำสั่งที่ผิด', 'placeholder' => 'เช่น ถ้าดินแห้ง -> รดน้ำ / ถ้าฝนตก -> รดน้ำ'],
            'bug_point' => ['label' => 'จุดที่เป็นบั๊ก', 'placeholder' => 'เช่น คำสั่งฝนตกผิด เพราะควรหยุดรดน้ำ ไม่ใช่รดน้ำเพิ่ม'],
            'fix' => ['label' => 'วิธีแก้ไขและเหตุผล', 'placeholder' => 'เช่น ตรวจฝนตกก่อน แล้วค่อยตรวจดินแห้ง เพื่อป้องกันน้ำท่วม']
        ],
        'rubric' => 'ตรวจการระบุบั๊ก ความถูกต้องของวิธีแก้ และความชัดเจนของเหตุผล'
    ]
];

$game_id = isset($project_game_id) ? intval($project_game_id) : intval($_GET['game_id'] ?? 2);
if (!isset($projectConfigs[$game_id])) {
    header("Location: student_dashboard.php");
    exit();
}

$config = $projectConfigs[$game_id];
$user_id = intval($_SESSION['user_id']);
$context = session_context();
$existing = [];
$existingDesc = '';
$revisionFeedback = null;

$stmt = $conn->prepare("SELECT * FROM student_works WHERE user_id = ? AND game_id = ? AND learning_session_id = ? LIMIT 1");
$stmt->bind_param("iii", $user_id, $game_id, $context['learning_session_id']);
$stmt->execute();
$work = $stmt->get_result()->fetch_assoc();
if ($work) {
    $decoded = json_decode($work['work_data'], true);
    $existing = is_array($decoded) ? $decoded : [];
    $existingDesc = $work['description'];
    if ($work['status'] === 'revision') {
        $revisionFeedback = $work['feedback'];
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($config['title']); ?> - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body { font-family: 'Kanit', sans-serif; background:#f8fafc; min-height:100vh; }
        .hero { background: <?php echo $config['theme']; ?>; color:white; padding:36px 0 28px; }
        .work-panel { background:white; border-radius:16px; border:1px solid #e2e8f0; box-shadow:0 18px 40px rgba(15,23,42,.08); }
        .rubric-box { background:#fffbeb; border-left:5px solid #f59e0b; border-radius:12px; }
        textarea { min-height:130px; resize:vertical; }
    </style>
</head>
<body>
    <div class="hero">
        <div class="container">
            <a href="game_select.php?game_id=<?php echo $game_id; ?>" class="btn btn-light btn-sm rounded-pill mb-3"><i class="bi bi-arrow-left"></i> กลับหน้าเลือกด่าน</a>
            <h1 class="fw-bold mb-2"><i class="bi <?php echo htmlspecialchars($config['icon']); ?>"></i> <?php echo htmlspecialchars($config['title']); ?></h1>
            <p class="fs-5 mb-0 opacity-75"><?php echo htmlspecialchars($config['subtitle']); ?></p>
        </div>
    </div>

    <div class="container py-4">
        <?php if ($revisionFeedback): ?>
            <div class="alert alert-warning border-0 shadow-sm rounded-4">
                <h5 class="fw-bold"><i class="bi bi-arrow-return-left"></i> คุณครูส่งงานกลับให้แก้ไข</h5>
                <p class="mb-0"><?php echo htmlspecialchars($revisionFeedback); ?></p>
            </div>
        <?php endif; ?>

        <div class="row g-4">
            <div class="col-lg-8">
                <div class="work-panel p-4">
                    <form id="project-form">
                        <?php foreach ($config['fields'] as $key => $field): ?>
                            <div class="mb-4">
                                <label class="form-label fw-bold"><?php echo htmlspecialchars($field['label']); ?></label>
                                <textarea class="form-control" id="field-<?php echo htmlspecialchars($key); ?>" placeholder="<?php echo htmlspecialchars($field['placeholder']); ?>"><?php echo htmlspecialchars($existing[$key] ?? ''); ?></textarea>
                            </div>
                        <?php endforeach; ?>
                        <div class="mb-4">
                            <label class="form-label fw-bold">คำอธิบายสรุปผลงาน</label>
                            <textarea class="form-control" id="description" placeholder="สรุปแนวคิดของผลงานนี้ให้คุณครูและเพื่อนเข้าใจ"><?php echo htmlspecialchars($existingDesc); ?></textarea>
                        </div>
                        <div class="d-flex flex-wrap gap-2 justify-content-end">
                            <a href="game_select.php?game_id=<?php echo $game_id; ?>" class="btn btn-outline-secondary rounded-pill px-4">ยกเลิก</a>
                            <button type="submit" class="btn btn-success rounded-pill px-4 fw-bold"><i class="bi bi-cloud-arrow-up-fill"></i> ส่งชิ้นงาน</button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="rubric-box p-4 mb-3">
                    <h5 class="fw-bold text-warning-emphasis"><i class="bi bi-clipboard-check"></i> เกณฑ์ตรวจชิ้นงาน</h5>
                    <p class="mb-0 text-secondary"><?php echo htmlspecialchars($config['rubric']); ?></p>
                </div>
                <div class="work-panel p-4">
                    <h5 class="fw-bold">สิ่งที่ต้องมี</h5>
                    <ul class="mb-0">
                        <li>แนวคิดถูกต้องตามบทเรียน</li>
                        <li>มีขั้นตอนหรือเงื่อนไขชัดเจน</li>
                        <li>อธิบายเหตุผลของการแก้ปัญหาได้</li>
                        <?php if ($game_id === 3): ?>
                            <li>มี Wave หรือสถานการณ์ให้เพื่อนเล่น</li>
                            <li>มี Feedback ที่บอกสาเหตุเมื่อกฎผิด</li>
                        <?php endif; ?>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <script>
        const GAME_ID = <?php echo $game_id; ?>;
        const fieldKeys = <?php echo json_encode(array_keys($config['fields'])); ?>;

        document.getElementById('project-form').addEventListener('submit', function (event) {
            event.preventDefault();
            const workData = { project_type: 'structured_reflection', game_id: GAME_ID };
            let missing = false;
            fieldKeys.forEach((key) => {
                const value = document.getElementById(`field-${key}`).value.trim();
                workData[key] = value;
                if (!value) missing = true;
            });

            const description = document.getElementById('description').value.trim();
            if (!description) missing = true;

            if (missing) {
                alert('กรุณากรอกข้อมูลให้ครบทุกช่องก่อนส่งชิ้นงาน');
                return;
            }

            fetch('../api/save_work.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game_id: GAME_ID,
                    description,
                    items: workData
                })
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    window.location.href = `showcase.php?game_id=${GAME_ID}`;
                    return;
                }
                alert(data.error || data.message || 'บันทึกชิ้นงานไม่สำเร็จ');
            })
            .catch(() => alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'));
        });
    </script>
</body>
</html>
