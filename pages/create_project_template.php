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
        'title' => 'ออกแบบภารกิจ Smart Farm Manager ของฉัน',
        'subtitle' => 'สร้างสายพาน วัตถุ เงื่อนไข คำสั่ง กฎ If-Then-Else และผลลัพธ์จากระบบฟาร์มอัตโนมัติ',
        'theme' => '#0891b2',
        'icon' => 'bi-diagram-3',
        'fields' => [
            'stage_story' => ['label' => 'ชื่อภารกิจและเรื่องราว', 'placeholder' => 'เช่น โรงคัดผลไม้ก่อนส่งตลาด ต้องแยกผลไม้ช้ำออกจากสายพาน'],
            'farm_scene' => ['label' => 'ฉากฟาร์มและตำแหน่งสำคัญ', 'placeholder' => 'เช่น สายพานอยู่กลางฉาก เครื่องสแกนอยู่ตรงกลาง ประตูซ้ายไปเครื่องล้าง ประตูขวาไปกล่องขาย'],
            'items' => ['label' => 'วัตถุหรือเหตุการณ์บนสายพาน', 'placeholder' => 'เช่น แครอทเปื้อนโคลน, ไข่ร้าว, วัว, สัตว์ป่วย, ความชื้น 25%, แดดแรงมาก'],
            'cards' => ['label' => 'บล็อกเงื่อนไขและบล็อกคำสั่ง', 'placeholder' => 'เช่น เงื่อนไข: ผลไม้ช้ำ, ความชื้น < 30% / คำสั่ง: คัดออก, เปิดสปริงเกอร์, ปิดระบบ'],
            'rules' => ['label' => 'กฎ If-Then-Else ที่เป็นคำตอบ', 'placeholder' => 'เช่น ถ้า ผลไม้ช้ำ -> คัดออก / หรือถ้า ผลไม้สุกมาก -> ส่งแปรรูป / นอกเหนือจากนี้ -> กล่องขาย'],
            'animation' => ['label' => 'Animation หรือภาพผลลัพธ์ที่อยากให้เห็น', 'placeholder' => 'เช่น วัตถุ snap เข้าเครื่องสแกน ประตูเปิด เครื่องล้างพ่นน้ำ หรือพัดลมหมุน'],
            'feedback' => ['label' => 'ผลลัพธ์และ Feedback เมื่อผู้เล่นทำถูกหรือผิด', 'placeholder' => 'เช่น ถ้าสัตว์ป่วยเข้าคอกปกติ ให้คอกสั่นเตือนและบอกว่าต้องส่งคอกพยาบาล']
        ],
        'rubric' => 'ตรวจความสนุกของภารกิจ Smart Farm Manager ความถูกต้องของเงื่อนไขและคำสั่ง ลำดับการตรวจ If / Else If / Else Animation ที่สื่อผลลัพธ์ และ Feedback ที่ช่วยให้เพื่อนแก้กฎได้'
    ],
    4 => [
        'title' => 'สร้างโจทย์บั๊กฟาร์มของฉัน',
        'subtitle' => 'ออกแบบระบบฟาร์มที่มีบั๊ก ให้เพื่อนสังเกตอาการ จับบล็อกผิด และเสนอวิธีแก้',
        'theme' => '#d97706',
        'icon' => 'bi-bug',
        'fields' => [
            'title' => ['label' => 'ชื่อโจทย์บั๊ก', 'placeholder' => 'เช่น ไข่ร้าวหลุดถาดพรีเมียม'],
            'system_theme' => ['label' => 'ระบบฟาร์มที่เลือก', 'placeholder' => 'เช่น โรงคัดไข่, ระบบรดน้ำ, โรงเรือนอุณหภูมิ, สายพานแครอท'],
            'bug_type' => ['label' => 'ประเภทบั๊ก', 'placeholder' => 'เช่น action_bug, condition_bug, broad_condition_bug, order_bug, missing_else_bug, numeric_bug'],
            'correct_rules' => ['label' => 'กฎที่ถูกต้อง', 'placeholder' => 'เช่น ถ้า ไข่ใบใหญ่และไม่ร้าว -> ถาดพรีเมียม / นอกเหนือจากนี้ -> ถังคัดทิ้ง'],
            'buggy_rules' => ['label' => 'กฎที่ใส่บั๊กให้เพื่อนแก้', 'placeholder' => 'เช่น ถ้า ไข่ใบใหญ่ -> ถาดพรีเมียม / นอกเหนือจากนี้ -> ถังคัดทิ้ง'],
            'symptom' => ['label' => 'อาการที่ผู้เล่นจะเห็นก่อนแก้', 'placeholder' => 'เช่น ไข่ใบใหญ่แต่ร้าวถูกส่งเข้าถาดพรีเมียม'],
            'bug_targets' => ['label' => 'จุดที่เป็นบั๊ก', 'placeholder' => 'เช่น กฎแถวแรก ช่องเงื่อนไข เพราะคำว่า “ไข่ใบใหญ่” กว้างเกินไป'],
            'fix_explanation' => ['label' => 'วิธีแก้และเหตุผล', 'placeholder' => 'เช่น ต้องเปลี่ยนเงื่อนไขแรกเป็น ไข่ใบใหญ่และไม่ร้าว เพื่อกันไข่ร้าวออก'],
            'playtest_note' => ['label' => 'ผลการทดลองเล่นโจทย์', 'placeholder' => 'เช่น เมื่อลองแก้ตามวิธีนี้ ไข่ร้าวไปถังคัดทิ้งและถาดพรีเมียมเหลือเฉพาะไข่ดี']
        ],
        'rubric' => 'ตรวจว่ามีระบบฟาร์ม กฎถูก กฎผิด อาการ จุดบั๊ก วิธีแก้ และเหตุผลครบถ้วน เพื่อนสามารถใช้โจทย์นี้ฝึก Debugging ได้จริง'
    ]
];

$game_id = isset($project_game_id) ? intval($project_game_id) : intval($_GET['game_id'] ?? 2);
if ($game_id === 3) {
    header("Location: create_project_condition.php?game_id=3");
    exit();
}
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
                            <li>มีสายพาน เครื่องสแกน และปลายทางของคำสั่งชัดเจน</li>
                            <li>มีวัตถุหรือเหตุการณ์พร้อมคุณสมบัติที่ใช้ตรวจเงื่อนไข</li>
                            <li>มีแนวคิด Animation ที่แสดงผลจากกฎของระบบฟาร์ม</li>
                            <li>มี Feedback ที่บอกสาเหตุเมื่อกฎผิด</li>
                        <?php elseif ($game_id === 4): ?>
                            <li>มีระบบฟาร์ม กฎที่ถูกต้อง และกฎที่มีบั๊ก</li>
                            <li>มีอาการให้เพื่อนสังเกตก่อนแก้</li>
                            <li>ระบุจุดบั๊กและวิธีแก้พร้อมเหตุผล</li>
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
            const workData = {
                project_type: GAME_ID === 4 ? 'smart_farm_debug_challenge' : 'structured_reflection',
                game_id: GAME_ID,
                builder_version: GAME_ID === 4 ? '1.0' : undefined
            };
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
