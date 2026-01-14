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
        // แปลง Array เป็น String เช่น "1,2,5" เพื่อใช้ใน SQL IN (...)
        // ต้องระวัง SQL Injection: ใช้ intval เพื่อความชัวร์
        $clean_ids = array_map('intval', $ids);
        $ids_string = implode(',', $clean_ids);

        $sql = "DELETE FROM users WHERE id IN ($ids_string) AND role = 'student'";

        if ($conn->query($sql)) {
            echo "<script>alert('ลบข้อมูลเรียบร้อยแล้ว!'); window.location.href='dashboard.php';</script>";
        } else {
            echo "Error: " . $conn->error;
        }
    } else {
        header("Location: dashboard.php");
    }
} else {
    header("Location: dashboard.php");
}
