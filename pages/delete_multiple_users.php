<?php
session_start();
require_once '../includes/db.php';

// Check Admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['selected_ids'])) {
    $ids = $_POST['selected_ids']; // Array ของ ID ที่ถูกติ๊ก

    if (count($ids) > 0) {
        // แปลง Array เป็น String เช่น "1,2,5" และป้องกัน SQL Injection ด้วย intval
        $clean_ids = array_map('intval', $ids);
        $ids_string = implode(',', $clean_ids);

        // 🟢 ขั้นตอนที่ 1: ลบ "ยอดไลก์" ที่เกี่ยวข้องกับเด็กกลุ่มนี้ทั้งหมด
        $conn->query("DELETE FROM project_likes WHERE user_id IN ($ids_string) OR work_id IN (SELECT id FROM student_works WHERE user_id IN ($ids_string))");

        // 🟢 ขั้นตอนที่ 2: ลบ "ผลงาน (Showcase)" ของเด็กกลุ่มนี้
        $conn->query("DELETE FROM student_works WHERE user_id IN ($ids_string)");

        // 🟢 ขั้นตอนที่ 3: ลบข้อมูลการเล่น/คะแนน (Progress)
        $conn->query("DELETE FROM progress WHERE user_id IN ($ids_string)");

        // 🟢 ขั้นตอนที่ 4: ลบตัวบัญชีนักเรียน (แก้ไขจาก id เป็น user_id)
        $sql = "DELETE FROM users WHERE user_id IN ($ids_string) AND role = 'student'";

        if ($conn->query($sql)) {
            echo "<script>alert('ลบข้อมูลที่เลือกเรียบร้อยแล้ว!'); window.location.href='dashboard.php';</script>";
        } else {
            echo "Error: " . $conn->error;
        }
    } else {
        header("Location: dashboard.php");
    }
} else {
    header("Location: dashboard.php");
}
?>