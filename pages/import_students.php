<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';

require_teacher_or_admin();
ensure_active_account($conn);

$context = classroom_context($conn, isset($_GET['classroom_id']) ? intval($_GET['classroom_id']) : null);
if (!$context) {
    header("Location: classrooms.php");
    exit();
}

$report = [];

if (isset($_POST["import"])) {
    $fileName = $_FILES["file"]["tmp_name"];

    if ($_FILES["file"]["size"] > 0) {
        $file = fopen($fileName, "r");

        $count_success = 0;
        $count_fail = 0;
        $row = 0;

        // 🟢 อัปเกรด: เตรียมคำสั่ง SQL ไว้ "นอกลูป" เพื่อความเร็วและปลอดภัย (Prepared Statements)
        $check_stmt = $conn->prepare("SELECT user_id FROM users WHERE student_id = ? AND classroom_id = ?");
        $insert_stmt = $conn->prepare("INSERT INTO users (student_id, name, class_level, password, role, school_id, classroom_id, teacher_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')");
        $role = 'student';

        while (($column = fgetcsv($file, 10000, ",")) !== FALSE) {
            $row++;
            if ($row == 1) continue; // ข้ามบรรทัดหัวตาราง (Header)

            // คาดหวัง CSV: Column 0=student_id, 1=name, 2=class_level, 3=password(opt)
            $student_id = trim($column[0] ?? '');
            $name = trim($column[1] ?? '');
            $class_level = trim($column[2] ?? '');
            $raw_pass = trim($column[3] ?? '');

            if (empty($raw_pass)) {
                $raw_pass = '1234'; // ถ้าไม่ใส่รหัส ให้ default 1234
            }

            if (empty($student_id) || empty($name)) continue;

            // 1. เช็คซ้ำ
            $check_stmt->bind_param("si", $student_id, $context['classroom_id']);
            $check_stmt->execute();
            if ($check_stmt->get_result()->num_rows > 0) {
                $count_fail++; // ซ้ำ ข้ามไป
                continue;
            }

            // 2. เข้ารหัสผ่าน
            $password = password_hash($raw_pass, PASSWORD_DEFAULT);

            // 3. บันทึกข้อมูล
            $insert_stmt->bind_param("sssssiii", $student_id, $name, $class_level, $password, $role, $context['school_id'], $context['classroom_id'], $context['teacher_id']);
            if ($insert_stmt->execute()) {
                $count_success++;
            } else {
                $count_fail++;
            }
        }
        fclose($file);
        $report = ['success' => $count_success, 'fail' => $count_fail];
    }
}
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>นำเข้านักเรียน (CSV)</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">




<?php
$page_styles = array (
  0 => 'pages/import_students.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>

<body class="app-page import-students-page">

    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-7">
                <div class="card border-0 shadow-sm p-4 rounded-4">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h4 class="fw-bold text-success mb-1"><i class="bi bi-file-earmark-spreadsheet-fill"></i> นำเข้าไฟล์ CSV</h4>
                            <div class="small text-muted">ห้อง: <?php echo htmlspecialchars($context['classroom']['classroom_name']); ?> | Join Code: <?php echo htmlspecialchars($context['classroom']['join_code']); ?></div>
                        </div>
                        <a href="dashboard.php?classroom_id=<?php echo $context['classroom_id']; ?>" class="btn btn-outline-secondary rounded-pill btn-sm">กลับ Dashboard</a>
                    </div>

                    <?php if (!empty($report)): ?>
                        <div class="alert alert-info rounded-3 mb-4">
                            <h5>📊 สรุปผลการนำเข้า</h5>
                            <ul class="mb-0">
                                <li class="text-success">นำเข้าสำเร็จ: <strong><?php echo $report['success']; ?></strong> คน</li>
                                <li class="text-danger">ล้มเหลว (รหัสซ้ำ/ข้อมูลไม่ครบ): <strong><?php echo $report['fail']; ?></strong> คน</li>
                            </ul>
                        </div>
                    <?php endif; ?>

                    <div class="alert alert-light border rounded-3">
                        <strong>📌 คำแนะนำ:</strong>
                        <ul>
                            <li>ใช้ไฟล์ <code>.csv</code> เท่านั้น (UTF-8 encoding)</li>
                            <li>เรียงข้อมูลตามนี้: <code>รหัสนักเรียน, ชื่อ-สกุล, ชั้นเรียน, รหัสผ่าน(เว้นได้)</code></li>
                            <li>บรรทัดแรกของไฟล์จะเป็นหัวตาราง (ระบบจะข้ามบรรทัดที่ 1 เสมอ)</li>
                        </ul>
                        <a href="data:text/csv;charset=utf-8,Student ID,Name,Class,Password%0A66001,ด.ช.ตัวอย่าง,ป.4/1,1234%0A66002,ด.ญ.ทดสอบ,ป.4/1,1234"
                            download="sample_students.csv"
                            class="btn btn-sm btn-outline-primary mt-2">
                            <i class="bi bi-download"></i> ดาวน์โหลดไฟล์ตัวอย่าง
                        </a>
                    </div>

                    <form method="post" enctype="multipart/form-data" class="mt-3">
                        <div class="mb-3">
                            <label class="form-label fw-bold">เลือกไฟล์ CSV</label>
                            <input type="file" name="file" class="form-control" accept=".csv" required>
                        </div>
                        <button type="submit" name="import" class="btn btn-success w-100 rounded-pill fw-bold py-2">
                            <i class="bi bi-cloud-upload-fill"></i> อัปโหลดและนำเข้าข้อมูล
                        </button>
                    </form>

                </div>
            </div>
        </div>
    </div>

</body>

</html>
