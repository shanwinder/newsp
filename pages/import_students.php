<?php
session_start();
require_once '../includes/db.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
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

        while (($column = fgetcsv($file, 10000, ",")) !== FALSE) {
            $row++;
            if ($row == 1) continue; // ข้ามบรรทัดหัวตาราง (Header)

            // คาดหวัง CSV: Column 0=student_id, 1=name, 2=class_level, 3=password(opt)
            $student_id = trim($column[0] ?? '');
            $name = trim($column[1] ?? '');
            $class_level = trim($column[2] ?? '');
            $raw_pass = trim($column[3] ?? '1234'); // ถ้าไม่ใส่รหัส ให้ default 1234

            if (empty($student_id) || empty($name)) continue;

            // เช็คซ้ำ
            $check = $conn->query("SELECT id FROM users WHERE student_id = '$student_id'");
            if ($check->num_rows > 0) {
                $count_fail++; // ซ้ำ ข้ามไป
                continue;
            }

            $password = password_hash($raw_pass, PASSWORD_DEFAULT);
            $role = 'student';

            $sql = "INSERT INTO users (student_id, name, class_level, password, role) 
                    VALUES ('$student_id', '$name', '$class_level', '$password', '$role')";

            if ($conn->query($sql)) {
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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: #f1f5f9;
        }
    </style>
</head>

<body>

    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-7">
                <div class="card border-0 shadow-sm p-4 rounded-4">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h4 class="fw-bold text-success"><i class="bi bi-file-earmark-spreadsheet-fill"></i> นำเข้าไฟล์ CSV</h4>
                        <a href="dashboard.php" class="btn btn-outline-secondary rounded-pill btn-sm">กลับ Dashboard</a>
                    </div>

                    <?php if (!empty($report)): ?>
                        <div class="alert alert-info rounded-3 mb-4">
                            <h5>📊 สรุปผลการนำเข้า</h5>
                            <ul class="mb-0">
                                <li class="text-success">นำเข้าสำเร็จ: <strong><?php echo $report['success']; ?></strong> คน</li>
                                <li class="text-danger">ล้มเหลว (รหัสซ้ำ): <strong><?php echo $report['fail']; ?></strong> คน</li>
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