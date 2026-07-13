<?php
// pages/instruction.php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';
if (!isset($_SESSION['user_id'])) {
    header("Location: ../login.php");
    exit();
}
assessment_require_pretest_for_game($conn);
$app = require __DIR__ . '/../config/app.php';
$lessons = require __DIR__ . '/../config/lessons.php';

$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 1;
$is_under_construction = false;

// 🎯 กำหนดเนื้อหาคู่มือตามด่านที่เลือก
if ($game_id === 1) {
    $game_title = "บทที่ 1: " . $lessons[1]['title'];
    $game_theme = "success";
    $mission_desc = "แปลงผักของเรากำลังวุ่นวาย! ภารกิจของคุณคือการแยกแยะเมล็ดพันธุ์ ปุ๋ย และกำจัดวัชพืชออกจากแปลง ให้ถูกต้องตามเงื่อนไขที่กำหนด!";

    $steps = [
        ['icon' => 'bi-search', 'title' => '1. สังเกตเงื่อนไข', 'desc' => 'อ่านป้ายคำสั่งให้ดี! บางด่านอาจมีคำหลอก เช่น "ไม่ใช่สีแดง"'],
        ['icon' => 'bi-hand-index-thumb', 'title' => '2. ลาก หรือ คลิก', 'desc' => 'ใช้เมาส์ลากไอเทมลงตะกร้า หรือคลิกกำจัดศัตรูพืช'],
        ['icon' => 'bi-shield-exclamation', 'title' => '3. ระวังตัวหลอก', 'desc' => 'ถ้าคลิกผิดตัว จะถูกหักคะแนนดาวนะ!']
    ];
    $start_link = "../pages/game_select.php?game_id=1";

} else if ($game_id === 2) {
    $game_title = "บทที่ 2: " . $lessons[2]['title'];
    $game_theme = "warning";
    $mission_desc = "วางแผนเส้นทางและประกอบบล็อกคำสั่งลูกศร เพื่อพารถไถอัตโนมัติ (🚜) ไปเก็บเกี่ยวตะกร้าผลผลิต (🧺) ให้สำเร็จอย่างปลอดภัย";

    $steps = [
        ['icon' => 'bi-map', 'title' => '1. สังเกตแผนที่', 'desc' => 'เริ่มด้วยการดูจุดเริ่มต้นของรถไถ ตำแหน่งตะกร้า และเช็คดูโขดหิน (🪨) สิ่งกีดขวางให้ดี'],
        ['icon' => 'bi-puzzle', 'title' => '2. ประกอบบล็อก', 'desc' => 'จินตนาการเส้นทางล่วงหน้า แล้วเรียงลูกศรทิศทาง ⬆️ ⬇️ ⬅️ ➡️ แบบทีละช่อง'],
        ['icon' => 'bi-play-circle', 'title' => '3. สั่งรถไถวิ่ง!', 'desc' => 'ตรวจสอบความถูกต้อง เมื่อเรียงเสร็จแล้วให้กด "รันคำสั่ง" เพื่อดูรถไถวิ่งตามที่คุณเขียนอัลกอริทึม!']
    ];
    $start_link = "../pages/game_select.php?game_id=2";
    $is_under_construction = false;

} else if ($game_id === 3) {
    $game_title = "บทที่ 3: " . $lessons[3]['title'];
    $game_theme = "info";
    $mission_desc = "คุณคือผู้จัดการฟาร์มอัจฉริยะ ต้องใช้ If, If / Else และ If / Else If / Else ให้ถูกสถานการณ์ เพื่อคัดแยกผลผลิตบนสายพานฟาร์มอัตโนมัติ";

    $steps = [
        ['icon' => 'bi-search', 'title' => '1. ตรวจรายการวัตถุ', 'desc' => 'คลิกวัตถุในแถบรายการเพื่อดูคุณสมบัติ คำใบ้ และตัวหลอกก่อนเริ่มสายพาน'],
        ['icon' => 'bi-collection', 'title' => '2. สร้างกฎฟาร์ม', 'desc' => 'เกม If ใช้คำสั่งพิเศษเพียงทางเดียว ส่วนเกม If / Else และ If / Else If / Else จะเพิ่มปลายทางตามโจทย์'],
        ['icon' => 'bi-play-circle', 'title' => '3. เริ่มสายพาน!', 'desc' => 'ระบบจะสแกนผลผลิตทีละชิ้น ประเมินกฎของคุณ และสรุปผลด้วยดาวเป็นคะแนนหลัก']
    ];
    $start_link = "../pages/game_select.php?game_id=3";
    $is_under_construction = false;

} else if ($game_id === 4) {
    $game_title = "บทที่ 4: " . $lessons[4]['title'];
    $game_theme = "danger";
    $mission_desc = "ฝึกตรวจสอบกฎที่ผิดพลาด ทดลองรันระบบ สังเกตผลลัพธ์ที่ผิด แล้วแก้ไขเงื่อนไขและคำสั่งให้ระบบฟาร์มทำงานถูกต้อง";

    $steps = [
        ['icon' => 'bi-play-circle', 'title' => '1. ทดสอบกฎเดิม', 'desc' => 'กดทดสอบก่อน แล้วสังเกตว่าผลผลิตชิ้นไหนไปผิดทาง'],
        ['icon' => 'bi-search', 'title' => '2. หาจุดผิดแล้วซ่อม', 'desc' => 'ดูว่าจุดผิดอยู่ที่เงื่อนไข คำสั่ง ตัวเลข หรือลำดับกฎ'],
        ['icon' => 'bi-arrow-repeat', 'title' => '3. ทดสอบหลังซ่อม', 'desc' => 'ลองใหม่เพื่อดูว่าระบบฟาร์มส่งผลผลิตถูกทางแล้วหรือยัง']
    ];
    $start_link = "../pages/game_select.php?game_id=4";
    $is_under_construction = false;

} else {
    header("Location: student_dashboard.php");
    exit();
}

$mode = $_SESSION['mode'] ?? 'solo';
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>คู่มือภารกิจ - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">





<?php
$page_styles = array (
  0 => 'pages/instruction.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="app-page instruction-page">

    <div class="instruction-card">
        <div class="card-header-custom">
            <h5 class="text-secondary fw-bold mb-2">📜 แฟ้มภารกิจการแก้ปัญหา</h5>
            <h1 class="fw-bold text-<?php echo $game_theme; ?> mb-0 display-5 floating-element">
                <?php echo $game_title; ?>
            </h1>
        </div>

        <div class="p-4 p-md-5">

            <?php if ($is_under_construction): ?>
                <div class="text-center py-4">
                    <div class="mb-4">
                        <i class="bi bi-cone-striped text-warning bouncing-cone instruction-cone"></i>
                    </div>
                    <h2 class="fw-bold text-dark mb-3">กำลังเตรียมภารกิจการเรียนรู้!</h2>
                    <p class="text-muted fs-5 mb-4">
                        ภารกิจนี้ <strong>อยู่ระหว่างการพัฒนา</strong> <br>
                        คุณครูกำลังเตรียมความสนุกให้พวกเราอยู่ อดใจรออีกนิดนะ!
                    </p>
                    <a href="student_dashboard.php" class="btn btn-secondary btn-lg rounded-pill px-5 shadow-sm fw-bold">
                        <i class="bi bi-arrow-left-circle me-2"></i> กลับหน้าหลัก
                    </a>
                </div>

            <?php else: ?>

                <?php if ($game_id === 1): ?>
                <div class="knowledge-sheet mt-3">
                    <div class="knowledge-title"><i class="bi bi-lightbulb-fill"></i> เกร็ดความรู้: <?php echo htmlspecialchars($lessons[1]['topic']); ?></div>
                    <p class="text-dark fw-bold mb-2 mt-2">การแก้ปัญหาอย่างเป็นขั้นตอน เริ่มจากการเข้าใจ "เงื่อนไข" (Conditions)</p>
                    <p class="text-secondary small mb-3">ในภาษาคอมพิวเตอร์ เรามักจะเจอคำสั่งที่ช่วยในการตัดสินใจ 3 รูปแบบหลักๆ คือ:</p>

                    <div class="row g-2">
                        <div class="col-md-4">
                            <div class="logic-term shadow-sm h-100">
                                <span class="badge bg-primary mb-1">และ (AND)</span><br>
                                ต้องเป็นจริง <strong>ทั้ง 2 อย่าง</strong><br>
                                <span class="text-muted small">เช่น ต้องเป็น "สีแดง" <u>และ</u> "ใบกลม" เท่านั้นถึงจะคลิกได้</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="logic-term shadow-sm h-100">
                                <span class="badge bg-success mb-1">หรือ (OR)</span><br>
                                เป็นจริง <strong>อย่างใดอย่างหนึ่ง</strong> ก็ได้<br>
                                <span class="text-muted small">เช่น เลือกเก็บ "แมลงสีแดง" <u>หรือ</u> "แมลงสีฟ้า" ก็ได้</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="logic-term shadow-sm h-100">
                                <span class="badge bg-danger mb-1">ไม่ใช่ (NOT)</span><br>
                                คือสิ่งที่ <strong>ตรงกันข้าม</strong><br>
                                <span class="text-muted small">เช่น ให้เก็บพืชที่ <u>ไม่ใช่</u> สีเหลือง (แปลว่าเก็บสีอื่นได้หมด)</span>
                            </div>
                        </div>
                    </div>
                </div>
                <?php elseif ($game_id === 2): ?>
                <div class="knowledge-sheet knowledge-sequence mt-3">
                    <div class="knowledge-title"><i class="bi bi-code-square"></i> เกร็ดความรู้: <?php echo htmlspecialchars($lessons[2]['topic']); ?></div>
                    <p class="text-dark fw-bold mb-2 mt-2">ยินดีต้อนรับนักแก้ปัญหา! ในภารกิจนี้เราจะมาฝึกทักษะการเป็นนักเขียนโปรแกรมเบื้องต้น</p>
                    <p class="text-secondary small mb-0">รู้หรือไม่? คอมพิวเตอร์หรือหุ่นยนต์รถไถของเรา <strong>ไม่สามารถคิดเองได้</strong> มันจะทำงานตามคำสั่งที่เราป้อนให้ "ทีละคำสั่ง" เรียงจากคำสั่งแรกไปจนถึงคำสั่งสุดท้ายอย่างเคร่งครัด ถ้าเราวางคำสั่งสลับกันแม้แต่ขั้นตอนเดียว รถไถก็อาจจะวิ่งชนหินหรือหลงทางได้เลยนะ!</p>
                </div>
                <?php elseif ($game_id === 3): ?>
                <div class="knowledge-sheet knowledge-condition mt-3">
                    <div class="knowledge-title"><i class="bi bi-signpost-split"></i> เกร็ดความรู้: <?php echo htmlspecialchars($lessons[3]['topic']); ?></div>
                    <p class="text-dark fw-bold mb-2 mt-2">เงื่อนไขคือกฎที่ทำให้ระบบฟาร์มตัดสินใจเองได้ เหมือนการเขียนสมองให้เครื่องจักรอัตโนมัติ</p>
                    <p class="text-secondary small mb-3">เกมที่ 1 ใช้ If เพื่อจับกรณีพิเศษเท่านั้น: ถ้าเข้าเงื่อนไขให้ส่งไปเครื่องพิเศษ ถ้าไม่เข้าเงื่อนไขระบบจะปล่อยผ่านอัตโนมัติ เกมถัดไปจึงค่อยเพิ่ม Else และ Else If</p>
                    <div class="row g-2">
                        <div class="col-md-4"><div class="logic-term shadow-sm h-100"><span class="badge bg-info mb-1">If</span><br>ถ้าเจอวัตถุที่เข้าเงื่อนไข ให้ทำคำสั่งพิเศษ วัตถุอื่นปล่อยผ่าน</div></div>
                        <div class="col-md-4"><div class="logic-term shadow-sm h-100"><span class="badge bg-success mb-1">If / Else</span><br>แยกวัตถุเป็น 2 ทาง: เข้าเงื่อนไข และกลุ่มที่เหลือทั้งหมด</div></div>
                        <div class="col-md-4"><div class="logic-term shadow-sm h-100"><span class="badge bg-secondary mb-1">If / Else If / Else</span><br>ตรวจหลายเงื่อนไขตามลำดับ แล้วใช้ Else เป็นทางสุดท้าย</div></div>
                    </div>
                </div>
                <?php elseif ($game_id === 4): ?>
                <div class="knowledge-sheet knowledge-debug mt-3">
                    <div class="knowledge-title"><i class="bi bi-wrench-adjustable"></i> เกร็ดความรู้: <?php echo htmlspecialchars($lessons[4]['topic']); ?></div>
                    <p class="text-dark fw-bold mb-2 mt-2">จุดผิดคือส่วนของกฎที่ทำให้ผลลัพธ์ออกมาไม่ถูกต้อง</p>
                    <p class="text-secondary small mb-0">นักซ่อมระบบที่ดีจะทดสอบกฎเดิม ดูผลที่ผิด แล้วค่อยซ่อมกฎ เมื่อซ่อมแล้วต้องทดสอบอีกครั้งเพื่อยืนยันว่าระบบทำงานถูกต้อง</p>
                </div>
                <?php endif; ?>

                <div class="mission-box mb-5 shadow-sm">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-megaphone-fill fs-1 text-success me-3"></i>
                        <div>
                            <strong class="text-success fs-5">เป้าหมายภารกิจ:</strong><br>
                            <?php echo $mission_desc; ?>
                        </div>
                    </div>
                </div>

                <h4 class="fw-bold text-dark mb-4 text-center"><i class="bi bi-controller"></i> วิธีการเล่น</h4>
                <div class="row g-4 mb-5">
                    <?php foreach ($steps as $step): ?>
                    <div class="col-md-4">
                        <div class="step-card">
                            <div class="icon-circle">
                                <i class="bi <?php echo $step['icon']; ?>"></i>
                            </div>
                            <h5 class="fw-bold text-dark"><?php echo $step['title']; ?></h5>
                            <p class="text-secondary small mb-0"><?php echo $step['desc']; ?></p>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>

                <?php if ($game_id === 2): ?>
                <h5 class="fw-bold text-danger mb-3"><i class="bi bi-exclamation-triangle-fill"></i> กฎเหล็กของแปลงเกษตร (ข้อควรระวัง)</h5>
                <div class="row g-3 mb-5">
                    <div class="col-md-4">
                        <div class="instruction-tip instruction-tip-danger p-3 border rounded shadow-sm bg-white h-100">
                            <b class="text-danger fs-6">💥 ห้ามชนสิ่งกีดขวาง</b>
                            <p class="small text-muted mb-0 mt-2">ถ้ารถไถวิ่งไปชนโขดหินปั๊ก เครื่องยนต์จะเสียหาย และต้องเริ่มทำภารกิจใหม่ทั้งหมด</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="instruction-tip instruction-tip-warning p-3 border rounded shadow-sm bg-white h-100">
                            <b class="instruction-orange-text fs-6">🚧 ห้ามตกขอบแปลง</b>
                            <p class="small text-muted mb-0 mt-2">ต้องนับช่องตารางให้แม่นยำ ถ้ารถไถวิ่งทะลุขอบแปลงเกษตรออกไป จะถือว่าทำภารกิจพลาด</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="instruction-tip instruction-tip-success p-3 border rounded shadow-sm bg-white h-100">
                            <b class="text-success fs-6">🎯 หยุดให้ตรงเป้า</b>
                            <p class="small text-muted mb-0 mt-2">ชุดคำสั่งของคุณ ต้องพารถไถไปหยุดที่ช่องตะกร้าผลผลิตพอดีเป๊ะ ห้ามขาดและเกิน!</p>
                        </div>
                    </div>
                </div>
                <?php elseif ($game_id === 3): ?>
                <h5 class="fw-bold text-info mb-3"><i class="bi bi-diagram-3"></i> กฎของสายพานฟาร์มอัจฉริยะ</h5>
                <div class="row g-3 mb-5">
                    <div class="col-md-4"><div class="instruction-tip instruction-tip-danger p-3 border rounded shadow-sm bg-white h-100"><b class="text-danger fs-6">ลำดับกฎสำคัญ</b><p class="small text-muted mb-0 mt-2">ระบบอ่านกฎจากบนลงล่าง และทำคำสั่งแรกที่เข้าเงื่อนไขทันที</p></div></div>
                    <div class="col-md-4"><div class="instruction-tip instruction-tip-info p-3 border rounded shadow-sm bg-white h-100"><b class="text-info fs-6">ดูค่าจากเซ็นเซอร์</b><p class="small text-muted mb-0 mt-2">บางด่านต้องใช้ตัวเลข เช่น น้ำหนัก ความชื้น และอุณหภูมิ เพื่อเลือกคำสั่งให้ถูก</p></div></div>
                    <div class="col-md-4"><div class="instruction-tip instruction-tip-success p-3 border rounded shadow-sm bg-white h-100"><b class="text-success fs-6">If ไม่จำเป็นต้องมี Else</b><p class="small text-muted mb-0 mt-2">ในเกม If วัตถุที่ไม่เข้าเงื่อนไขจะปล่อยผ่านเอง ส่วน Else ใช้ในเกมที่ต้องแยกอีกทางชัดเจน</p></div></div>
                </div>
                <?php elseif ($game_id === 4): ?>
                <h5 class="fw-bold text-danger mb-3"><i class="bi bi-wrench-adjustable"></i> วิธีซ่อมระบบฟาร์ม</h5>
                <div class="row g-3 mb-5">
                    <div class="col-md-4"><div class="instruction-tip instruction-tip-danger p-3 border rounded shadow-sm bg-white h-100"><b class="text-danger fs-6">ทดสอบกฎเดิมก่อน</b><p class="small text-muted mb-0 mt-2">สังเกตว่าผลผลิตชิ้นไหนไปผิดทาง แล้วอ่านรายงานการทดสอบ</p></div></div>
                    <div class="col-md-4"><div class="instruction-tip instruction-tip-warning p-3 border rounded shadow-sm bg-white h-100"><b class="instruction-orange-text">หาจุดผิดให้เจอ</b><p class="small text-muted mb-0 mt-2">จุดผิดอาจอยู่ที่เงื่อนไข คำสั่ง ตัวเลข หรือลำดับ ลองดูทีละจุด</p></div></div>
                    <div class="col-md-4"><div class="instruction-tip instruction-tip-success p-3 border rounded shadow-sm bg-white h-100"><b class="text-success fs-6">ซ่อมแล้วทดสอบอีกครั้ง</b><p class="small text-muted mb-0 mt-2">เลือกบล็อกที่ถูก แล้วกดทดสอบหลังซ่อม ถ้าผลผลิตถูกทางครบแสดงว่าสำเร็จ</p></div></div>
                </div>
                <?php endif; ?>

                <?php if($mode !== 'solo'): ?>
                <div class="alert alert-warning border-0 shadow-sm rounded-4 text-center fw-bold">
                    <i class="bi bi-people-fill text-warning fs-4 align-middle me-2"></i>
                    คุณกำลังเล่นใน "โหมดทีม" อย่าลืมปรึกษากันก่อนคลิกเพื่อฝึกทักษะการทำงานร่วมกันนะ!
                </div>
                <?php endif; ?>

                <div class="text-center mt-2">
                    <a href="<?php echo $start_link; ?>" class="btn btn-start">
                        <i class="bi bi-play-fill me-1"></i> เริ่มฝึกภารกิจ!
                    </a>
                    <div class="mt-3">
                        <a href="student_dashboard.php" class="text-muted text-decoration-none small fw-bold">
                            <i class="bi bi-arrow-left"></i> กลับไปหน้าโปรไฟล์
                        </a>
                    </div>
                </div>
            <?php endif; ?>

        </div>
    </div>

    <?php require __DIR__ . '/../includes/app_scripts.php'; ?>
</body>
</html>
