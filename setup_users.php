<?php
// setup_users.php (รันแล้วลบทิ้ง)
require 'includes/db.php';
$pwd_admin = password_hash("1234", PASSWORD_DEFAULT);
$pwd_student = password_hash("1111", PASSWORD_DEFAULT);

// Insert Admin
$conn->query("INSERT INTO users (student_id, name, password, role) VALUES ('admin', 'ครูผู้สอน', '$pwd_admin', 'admin')");

// Insert Student
$conn->query("INSERT INTO users (student_id, name, class_level, password, role) VALUES ('66001', 'เด็กชายตั้งใจ เรียนดี', 'ป.4/1', '$pwd_student', 'student')");

echo "สร้าง User สำเร็จ! <br>Admin: admin / 1234 <br>Student: 66001 / 1111";
?>