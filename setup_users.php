<?php
// setup_users.php (รันเพื่อสร้าง Test User แล้วลบทิ้ง)
require 'includes/db.php';

echo "<h3>เริ่มการสร้าง Test IDs (Pair Programming)</h3>";

// เคลียร์ข้อมูลนักเรียนเก่าทิ้ง เพื่อรีเซ็ตสำหรับการทดสอบ
$conn->query("DELETE FROM `users` WHERE `role` = 'student'");

$pwd_admin = password_hash("1234", PASSWORD_DEFAULT);
$pwd_student = password_hash("1111", PASSWORD_DEFAULT);

// 1. สร้าง Admin (ใช้ SELECT * เพื่อหลีกเลี่ยงปัญหาชื่อคอลัมน์ id ไม่ตรง)
$check_admin = $conn->query("SELECT student_id FROM users WHERE student_id = 'admin'");
if ($check_admin->num_rows == 0) {
    $conn->query("INSERT INTO users (student_id, name, password, role) VALUES ('admin', 'ครูผู้สอน', '$pwd_admin', 'admin')");
}

// 2. สร้าง Test Students 16 คน (ไอดี test01 - test16)
$students = [];
for ($i = 1; $i <= 16; $i++) {
    $std_id = 'test' . str_pad($i, 2, '0', STR_PAD_LEFT); 
    $std_name = "นักเรียนทดสอบ ที่ " . $i;
    
    $conn->query("INSERT INTO users (student_id, name, class_level, password, role) 
                  VALUES ('$std_id', '$std_name', 'ป.4/1', '$pwd_student', 'student')");
    
    // ดึงข้อมูลที่เพิ่ง insert กลับมา เพื่อเอาค่า Primary Key (หลีกเลี่ยง error column id)
    $res = $conn->query("SELECT * FROM users WHERE student_id = '$std_id'");
    $row = $res->fetch_assoc();
    
    // หาชื่อคอลัมน์ที่เป็น Primary Key (ส่วนใหญ่จะเป็นคอลัมน์แรกสุด เช่น id หรือ user_id)
    $pk_value = array_values($row)[0]; 
    $pk_column_name = array_keys($row)[0];
    
    $students[] = [
        'pk_col' => $pk_column_name,
        'pk_val' => $pk_value
    ]; 
}

// 3. จับคู่ Test Students (เพื่อจำลองข้อมูลคู่หู)
for ($i = 0; $i < 16; $i += 2) {
    $student_A = $students[$i];
    $student_B = $students[$i+1];

    $pk_col = $student_A['pk_col']; // ชื่อคอลัมน์ primary key
    $val_A = $student_A['pk_val'];
    $val_B = $student_B['pk_val'];

    // คนแรกเป็นผู้วางแผน (Navigator) คู่กับคนที่สอง
    $conn->query("UPDATE users SET partner_id = '$val_B', current_role = 'navigator' WHERE $pk_col = '$val_A'");
    
    // คนที่สองเป็นผู้คุมอุปกรณ์ (Driver) คู่กับคนแรก
    $conn->query("UPDATE users SET partner_id = '$val_A', current_role = 'driver' WHERE $pk_col = '$val_B'");
}

echo "✅ สร้าง Test IDs จำนวน 16 คน (8 คู่) สำเร็จ!<br><br>";
echo "<b>ข้อมูลสำหรับเข้าระบบ:</b><br>";
echo "- <b>Admin:</b> admin / 1234 <br>";
echo "- <b>Students:</b> test01 ถึง test16 / 1111 <br>";
echo "<i>(การจับคู่: test01 คู่ test02, test03 คู่ test04 ไปเรื่อยๆ)</i>";
?>