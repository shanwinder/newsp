<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';

require_teacher_or_admin();
ensure_active_account($conn);

if (isset($_GET['id'])) {
    $delete_id = intval($_GET['id']);

    // ป้องกันการลบตัวเอง (Admin)
    if ($delete_id == $_SESSION['user_id']) {
        echo "<script>alert('ไม่สามารถลบบัญชีตัวเองได้!'); window.location.href='dashboard.php';</script>";
        exit();
    }

    $check = $conn->prepare("SELECT user_id, classroom_id FROM users WHERE user_id = ? AND role = 'student' AND (? = 1 OR teacher_id = ?)");
    $is_admin = is_super_admin() ? 1 : 0;
    $teacher_id = intval($_SESSION['user_id']);
    $check->bind_param("iii", $delete_id, $is_admin, $teacher_id);
    $check->execute();
    $student = $check->get_result()->fetch_assoc();
    if (!$student) {
        echo "<script>alert('ไม่มีสิทธิ์ลบนักเรียนคนนี้'); window.location.href='dashboard.php';</script>";
        exit();
    }

    // 🟢 ขั้นตอนที่ 1: ลบ "ยอดไลก์" 
    // (ลบทั้งไลก์ที่เด็กคนนี้ไปกดให้เพื่อน และ ไลก์ที่เพื่อนมากดให้ผลงานของเด็กคนนี้)
    $conn->query("DELETE FROM project_likes WHERE user_id = $delete_id OR work_id IN (SELECT id FROM student_works WHERE user_id = $delete_id)");

    // 🟢 ขั้นตอนที่ 2: ลบ "ผลงาน (Showcase)" ที่เด็กคนนี้เคยส่ง
    $conn->query("DELETE FROM student_works WHERE user_id = $delete_id");

    // 🟢 ขั้นตอนที่ 3: ลบข้อมูลการเล่น/คะแนน (ถ้ามี)
    $conn->query("DELETE FROM progress WHERE user_id = $delete_id");

    // 🟢 ขั้นตอนที่ 4: ลบตัวบัญชีผู้ใช้ (เปลี่ยนจาก id เป็น user_id ให้ตรงกับฐานข้อมูล)
    $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $delete_id);

    if ($stmt->execute()) {
        header("Location: dashboard.php?classroom_id=" . intval($student['classroom_id']));
        exit();
    } else {
        echo "Error deleting record: " . $conn->error;
    }
} else {
    header("Location: dashboard.php");
    exit();
}
?>
