<?php
session_start();
require_once '../includes/db.php';

// Check Admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);

    // ป้องกันการลบตัวเอง (Admin)
    if ($id == $_SESSION['user_id']) {
        echo "<script>alert('ไม่สามารถลบบัญชีตัวเองได้!'); window.location.href='dashboard.php';</script>";
        exit();
    }

    // ลบข้อมูลจาก users และข้อมูลการเล่น (progress) จะหายไปถ้าไม่ได้ทำ cascade ไว้
    // แนะนำให้ลบ progress ด้วยเพื่อความสะอาด
    $conn->query("DELETE FROM progress WHERE user_id = $id");

    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        header("Location: dashboard.php");
    } else {
        echo "Error deleting record: " . $conn->error;
    }
} else {
    header("Location: dashboard.php");
}
