<?php
session_start();
require_once '../includes/db.php';

// Check Admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

if (isset($_GET['id'])) {
    $delete_id = intval($_GET['id']);

    // ป้องกันการลบตัวเอง (Admin)
    if ($delete_id == $_SESSION['user_id']) {
        echo "<script>alert('ไม่สามารถลบบัญชีตัวเองได้!'); window.location.href='dashboard.php';</script>";
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
        header("Location: dashboard.php");
        exit();
    } else {
        echo "Error deleting record: " . $conn->error;
    }
} else {
    header("Location: dashboard.php");
    exit();
}
?>