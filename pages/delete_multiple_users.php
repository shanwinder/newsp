<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';

require_teacher_or_admin();
ensure_active_account($conn);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['selected_ids'])) {
    $ids = $_POST['selected_ids']; // Array ของ ID ที่ถูกติ๊ก

    if (count($ids) > 0) {
        $context = classroom_context($conn);
        if (!$context) {
            header("Location: classrooms.php");
            exit();
        }

        // แปลง Array เป็น String เช่น "1,2,5" และป้องกัน SQL Injection ด้วย intval
        $clean_ids = array_map('intval', $ids);
        $ids_string = implode(',', $clean_ids);

        $allowed = [];
        $filter_sql = "SELECT user_id FROM users WHERE user_id IN ($ids_string) AND role = 'student'";
        if (!is_super_admin()) {
            $filter_sql .= " AND school_id = {$context['school_id']} AND classroom_id = {$context['classroom_id']} AND teacher_id = {$context['teacher_id']}";
        }
        $res = $conn->query($filter_sql);
        while ($row = $res->fetch_assoc()) {
            $allowed[] = intval($row['user_id']);
        }
        if (empty($allowed)) {
            header("Location: dashboard.php?classroom_id=" . $context['classroom_id']);
            exit();
        }
        $ids_string = implode(',', $allowed);

        // 🟢 ขั้นตอนที่ 1: ลบ "ยอดไลก์" ที่เกี่ยวข้องกับเด็กกลุ่มนี้ทั้งหมด
        $conn->query("DELETE FROM project_likes WHERE user_id IN ($ids_string) OR work_id IN (SELECT id FROM student_works WHERE user_id IN ($ids_string))");

        // 🟢 ขั้นตอนที่ 2: ลบ "ผลงาน (Showcase)" ของเด็กกลุ่มนี้
        $conn->query("DELETE FROM student_works WHERE user_id IN ($ids_string)");

        // 🟢 ขั้นตอนที่ 3: ลบข้อมูลการเล่น/คะแนน (Progress)
        $conn->query("DELETE FROM progress WHERE user_id IN ($ids_string)");

        // 🟢 ขั้นตอนที่ 4: ลบตัวบัญชีนักเรียน (แก้ไขจาก id เป็น user_id)
        $sql = "DELETE FROM users WHERE user_id IN ($ids_string) AND role = 'student'";

        if ($conn->query($sql)) {
            echo "<script>alert('ลบข้อมูลที่เลือกเรียบร้อยแล้ว!'); window.location.href='dashboard.php?classroom_id={$context['classroom_id']}';</script>";
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
