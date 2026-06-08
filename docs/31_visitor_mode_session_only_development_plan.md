# แผนการพัฒนา Visitor Mode แบบ Session-only  
## ระบบผู้เยี่ยมชมสำหรับทดลองใช้งานระบบแบบฝึกทักษะออนไลน์

> เป้าหมายของแผนนี้คือเพิ่มโหมด **ผู้เยี่ยมชม / Visitor Mode** ให้ผู้สนใจสามารถทดลองใช้งานระบบได้โดยไม่ต้องมี Join Code, รหัสนักเรียน หรือ PIN และต้องไม่กระทบข้อมูลนักเรียนจริง  
> แนวทางนี้ใช้แบบ **session-only** คือเก็บคะแนนและสถานะทดลองไว้ใน `$_SESSION` เท่านั้น ไม่บันทึกลงฐานข้อมูลจริง

---

## 1. แนวคิดหลัก

Visitor Mode คือโหมดทดลองใช้งานสำหรับผู้เยี่ยมชม เช่น กรรมการ ผู้บริหาร ครูจากโรงเรียนอื่น หรือผู้สนใจทั่วไป ให้สามารถลองใช้งานระบบได้ใกล้เคียงนักเรียนจริง

Flow ที่ต้องการคือ

```text
หน้าแรก
→ กด “ทดลองใช้งาน”
→ เข้าหน้า Dashboard แบบนักเรียน
→ อ่านเกร็ดความรู้
→ เลือกบทเรียน
→ เลือกด่าน
→ เล่นเกม
→ เห็นคะแนนชั่วคราว
→ กลับไปเล่นด่านอื่นได้
```

แต่ข้อมูลของผู้เยี่ยมชมต้องไม่ปนกับข้อมูลจริง เช่น

```text
ไม่บันทึก progress จริง
ไม่บันทึก game_logs จริง
ไม่บันทึก student_works จริง
ไม่แสดงใน Dashboard ครู
ไม่แสดงใน leaderboard จริง
ไม่ถูกนับเป็นนักเรียนในรายงาน
```

---

## 2. เป้าหมายของการพัฒนา

### 2.1 ด้านผู้ใช้งาน

ผู้เยี่ยมชมต้องสามารถ

1. เข้าใช้งานได้โดยไม่ต้อง login
2. เห็น Dashboard แบบนักเรียน
3. เห็นบทเรียนทั้ง 4 บท
4. เข้าอ่านเกร็ดความรู้ได้
5. เข้าเลือกด่านได้
6. เล่นเกมได้
7. เห็นผลคะแนนหลังเล่นจบ
8. เล่นต่อด่านอื่นได้
9. ออกจากโหมดผู้เยี่ยมชมได้

### 2.2 ด้านข้อมูล

ข้อมูล visitor ต้องเก็บเฉพาะใน session เช่น

```php
$_SESSION['visitor_progress']
```

ห้ามเขียนข้อมูล visitor ลงตาราง

```text
progress
game_logs
student_works
project_likes
student_badges
```

### 2.3 ด้านความปลอดภัย

ผู้เยี่ยมชมต้องเข้าได้เฉพาะหน้าฝั่งนักเรียน ไม่สามารถเข้าหน้าครูหรือ admin เช่น

```text
dashboard.php
review_work.php
classrooms.php
manage_students.php
manage_games.php
manage_stages.php
admin/*
```

---

## 3. โครงสร้าง Session สำหรับ Visitor

เมื่อกดปุ่มทดลองใช้งาน ให้ระบบสร้าง session ลักษณะนี้

```php
$_SESSION['visitor_mode'] = true;
$_SESSION['user_id'] = 0;
$_SESSION['student_id'] = 'visitor';
$_SESSION['name'] = 'ผู้เยี่ยมชม';
$_SESSION['role'] = 'visitor';
$_SESSION['mode'] = 'solo';
$_SESSION['team_id'] = 'visitor_' . session_id();
$_SESSION['team_members'] = [0];

$_SESSION['school_id'] = $demoSchoolId;
$_SESSION['classroom_id'] = $demoClassroomId;
$_SESSION['teacher_id'] = $demoTeacherId;
$_SESSION['learning_session_id'] = $demoSessionId;
$_SESSION['join_code'] = 'VISITOR';

$_SESSION['visitor_progress'] = [];
$_SESSION['visitor_started_at'] = date('Y-m-d H:i:s');
```

หลักสำคัญคือ

- `visitor_mode` เป็น flag หลัก
- `role = visitor` ใช้แยกจากนักเรียนจริง
- `user_id = 0` เพื่อไม่ผูกกับ user จริง
- `visitor_progress` ใช้เก็บคะแนนชั่วคราว
- ใช้ demo classroom/session เป็นบริบทสำหรับโหลดบทเรียน แต่ไม่บันทึกข้อมูลจริงลงบริบทนั้น

---

## 4. ไฟล์ที่ต้องเพิ่ม

### 4.1 เพิ่ม `pages/guest_start.php`

ไฟล์นี้ทำหน้าที่เริ่มต้น Visitor Mode

หน้าที่ของไฟล์

1. `session_start()`
2. `session_regenerate_id(true)`
3. ดึง demo context จากฐานข้อมูล
4. ตั้งค่า visitor session
5. redirect ไป `student_dashboard.php`

ตัวอย่างโครงสร้าง

```php
<?php
session_start();
require_once '../includes/db.php';

session_regenerate_id(true);

$stmt = $conn->prepare("
    SELECT 
        s.id AS school_id,
        c.id AS classroom_id,
        c.teacher_id,
        ls.id AS learning_session_id
    FROM learning_sessions ls
    JOIN classrooms c ON ls.classroom_id = c.id
    JOIN schools s ON c.school_id = s.id
    WHERE ls.join_code = ?
    LIMIT 1
");
$joinCode = 'DEMO4';
$stmt->bind_param("s", $joinCode);
$stmt->execute();
$demo = $stmt->get_result()->fetch_assoc();

if (!$demo) {
    die('ยังไม่พบห้องทดลองใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
}

$_SESSION['visitor_mode'] = true;
$_SESSION['user_id'] = 0;
$_SESSION['student_id'] = 'visitor';
$_SESSION['name'] = 'ผู้เยี่ยมชม';
$_SESSION['role'] = 'visitor';
$_SESSION['mode'] = 'solo';
$_SESSION['team_id'] = 'visitor_' . session_id();
$_SESSION['team_members'] = [0];

$_SESSION['school_id'] = (int)$demo['school_id'];
$_SESSION['classroom_id'] = (int)$demo['classroom_id'];
$_SESSION['teacher_id'] = (int)$demo['teacher_id'];
$_SESSION['learning_session_id'] = (int)$demo['learning_session_id'];
$_SESSION['join_code'] = 'VISITOR';

$_SESSION['visitor_progress'] = [];
$_SESSION['visitor_started_at'] = date('Y-m-d H:i:s');

header("Location: student_dashboard.php");
exit();
```

---

## 5. ไฟล์ที่ต้องปรับ

## 5.1 `index.php`

เพิ่มปุ่มสำหรับทดลองใช้งาน

```html
<a href="pages/guest_start.php" class="btn btn-outline-success btn-lg">
  👀 ทดลองใช้งาน
</a>
```

ข้อความที่แนะนำ

```text
ทดลองใช้งาน
```

หรือ

```text
ทดลองเล่นในฐานะผู้เยี่ยมชม
```

---

## 5.2 `pages/login.php`

เพิ่มทางเลือกสำหรับผู้ที่ไม่มีรหัสนักเรียน

```html
<a href="guest_start.php" class="btn btn-outline-secondary">
  ทดลองใช้งานในฐานะผู้เยี่ยมชม
</a>
```

ข้อความประกอบ

```text
ยังไม่มีรหัสนักเรียน? ทดลองใช้งานระบบได้ที่นี่
```

---

## 5.3 ระบบ Auth / Helper

เพิ่ม helper สำหรับแยก visitor และกลุ่มผู้ใช้แบบนักเรียน

```php
function is_visitor_mode(): bool
{
    return !empty($_SESSION['visitor_mode']);
}

function is_student_like(): bool
{
    return in_array($_SESSION['role'] ?? '', ['student', 'visitor'], true);
}

function require_student_like(): void
{
    if (!isset($_SESSION['user_id']) || !is_student_like()) {
        header("Location: login.php");
        exit();
    }
}
```

หน้าฝั่งนักเรียนใช้ `require_student_like()`  
หน้าครู/admin ต้องยังตรวจเฉพาะ `teacher` หรือ `admin` เท่านั้น ห้ามให้ visitor ผ่าน

---

## 5.4 `pages/student_dashboard.php`

สิ่งที่ต้องปรับ

1. อนุญาต role `visitor`
2. แสดงชื่อเป็น “ผู้เยี่ยมชม”
3. แสดง banner โหมดผู้เยี่ยมชม
4. แสดงบทเรียนทั้ง 4 บทตามปกติ
5. คะแนนรวมอ่านจาก `visitor_progress` หรือแสดง 0

ข้อความ banner ที่แนะนำ

```text
โหมดผู้เยี่ยมชม
คุณสามารถทดลองเล่นได้ แต่คะแนนและผลงานจะไม่ถูกบันทึกถาวร
```

ข้อความต้อนรับ

```text
ยินดีต้อนรับ ผู้เยี่ยมชม
เลือกบทเรียนที่ต้องการทดลองเล่นได้เลย
```

---

## 5.5 `includes/student_navbar.php`

Navbar ควรแสดงสถานะผู้เยี่ยมชมให้ชัดเจน

ตัวอย่าง logic

```php
if (!empty($_SESSION['visitor_mode'])) {
    $displayName = 'ผู้เยี่ยมชม';
    $current_title = 'โหมดทดลองใช้';
    $badge_color = 'bg-info';
    $total_stars = 0;

    foreach ($_SESSION['visitor_progress'] ?? [] as $progress) {
        $total_stars += intval($progress['score'] ?? 0);
    }
} else {
    // logic เดิมของนักเรียนจริง
}
```

Badge ที่ควรแสดง

```text
โหมดทดลองใช้
```

---

## 5.6 `pages/instruction.php`

Visitor ต้องเข้าอ่านเกร็ดความรู้ได้

สิ่งที่ต้องตรวจ

1. ไม่ block role `visitor`
2. ปุ่มไปเลือกด่านทำงาน
3. ไม่มีการบันทึกข้อมูลลงฐานข้อมูล
4. แสดง banner visitor ถ้ามี navbar

---

## 5.7 `pages/game_select.php`

หน้านี้ต้องแสดงคะแนนและสถานะด่านของ visitor จาก session ไม่ใช่จากตาราง `progress`

ตัวอย่างแนวทาง

```php
if (!empty($_SESSION['visitor_mode'])) {
    $visitorProgress = $_SESSION['visitor_progress'] ?? [];

    foreach ($stages as &$stage) {
        $stageId = (int)$stage['id'];
        $stage['score'] = $visitorProgress[$stageId]['score'] ?? 0;
        $stage['completed'] = isset($visitorProgress[$stageId]);
    }
} else {
    // logic เดิมที่อ่านจาก progress table
}
```

### การปลดล็อกด่าน

แนะนำให้ visitor ปลดล็อกทุกด่าน เพื่อให้ทดลองระบบได้สะดวก

```php
if (!empty($_SESSION['visitor_mode'])) {
    $isLocked = false;
}
```

### ข้อความบนหน้าเลือกด่าน

```text
โหมดทดลองใช้: ทุกด่านเปิดให้ทดลองเล่น คะแนนจะเก็บชั่วคราวใน session นี้เท่านั้น
```

### CTA สร้างชิ้นงาน

ถ้าเป็น visitor ให้แสดงว่า

```text
ต้องเข้าสู่ระบบนักเรียนก่อน จึงจะสร้างและบันทึกผลงานได้
```

---

## 5.8 `pages/play_game.php`

Visitor ควรเล่นเกมได้เหมือนนักเรียนจริง

สิ่งที่ต้องทำ

1. Auth ต้องยอมรับ visitor
2. โหลด stage และ game engine ตามปกติ
3. ใช้ `window.sendResult()` เดิม
4. หลังส่งคะแนน redirect ไป `waiting_room.php` ตาม flow เดิม

ไม่ควรแยก engine สำหรับ visitor ถ้าไม่จำเป็น

---

## 5.9 `api/submit_score.php`

นี่คือจุดสำคัญที่สุดของ Visitor Mode

หากเป็น visitor ต้อง

```text
รับคะแนนได้
ส่ง success = true ได้
เก็บคะแนนลง session ได้
ห้ามเขียน progress
ห้ามเขียน game_logs
ห้าม loop team_members
```

ตัวอย่าง logic

```php
if (!empty($_SESSION['visitor_mode'])) {
    $stage_id = intval($input['stage_id'] ?? 0);
    $score = intval($input['score'] ?? 0);
    $duration = intval($input['duration'] ?? 0);
    $attempts = intval($input['attempts'] ?? 1);

    if ($stage_id <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'ไม่พบรหัสด่าน'
        ]);
        exit();
    }

    if (!isset($_SESSION['visitor_progress'])) {
        $_SESSION['visitor_progress'] = [];
    }

    $previousBest = $_SESSION['visitor_progress'][$stage_id]['score'] ?? 0;
    $bestScore = max($previousBest, $score);

    $_SESSION['visitor_progress'][$stage_id] = [
        'score' => $bestScore,
        'last_score' => $score,
        'duration' => $duration,
        'attempts' => $attempts,
        'completed_at' => date('Y-m-d H:i:s')
    ];

    echo json_encode([
        'status' => 'success',
        'success' => true,
        'visitor_mode' => true,
        'message' => 'บันทึกคะแนนทดลองใน session แล้ว'
    ]);
    exit();
}
```

ต้องวาง logic visitor ก่อนส่วนที่ INSERT/UPDATE ฐานข้อมูลจริง

---

## 5.10 `pages/waiting_room.php`

Waiting Room ปกติออกแบบสำหรับนักเรียนจริงที่รอครูควบคุมการไปต่อ แต่ visitor ไม่ควรรอครู

ให้เพิ่มเงื่อนไขด้านบน

```php
if (!empty($_SESSION['visitor_mode'])) {
    // render visitor summary
    exit();
}
```

### หน้า Visitor Summary ที่ควรแสดง

```text
ทดลองเล่นสำเร็จ!

คะแนนของคุณ: 85
สถานะ: คะแนนนี้เก็บเฉพาะในโหมดทดลองใช้

[กลับไปเลือกด่าน]
[กลับหน้า Dashboard]
```

สิ่งที่ต้องปิดสำหรับ visitor

```text
ไม่ต้องแสดง leaderboard จริง
ไม่ต้อง polling navigation_status
ไม่ต้องรอสัญญาณจากครู
ไม่ต้องแสดงรายชื่อนักเรียน
```

---

## 5.11 หน้าสร้างชิ้นงานและ `api/save_work.php`

ไฟล์ที่เกี่ยวข้อง

```text
pages/create_project_logic.php
pages/create_project_algo.php
pages/create_project_condition.php
pages/create_project_debug.php
api/save_work.php
```

Visitor ไม่ควรบันทึก `student_works` จริง

เพิ่มใน `api/save_work.php`

```php
if (!empty($_SESSION['visitor_mode'])) {
    echo json_encode([
        'success' => false,
        'visitor_mode' => true,
        'message' => 'โหมดผู้เยี่ยมชมไม่สามารถบันทึกผลงานถาวรได้ กรุณาเข้าสู่ระบบนักเรียน'
    ]);
    exit();
}
```

ข้อความที่ควรแสดง

```text
โหมดผู้เยี่ยมชมสามารถทดลองเล่นเกมได้
หากต้องการสร้างและส่งผลงานให้ครูตรวจ กรุณาเข้าสู่ระบบนักเรียน
```

---

## 5.12 Logout / Exit Visitor

ใช้ `logout.php` เดิมได้ หากทำลาย session ทั้งหมดอยู่แล้ว

หรือสร้างไฟล์ใหม่

```text
pages/guest_exit.php
```

ตัวอย่าง

```php
<?php
session_start();
session_unset();
session_destroy();
header("Location: ../index.php");
exit();
```

ปุ่มที่ควรแสดง

```text
ออกจากโหมดผู้เยี่ยมชม
```

---

# 6. UI และข้อความที่ควรใช้

## 6.1 หน้าแรก

```text
ทดลองใช้งาน
```

```text
ทดลองเล่นในฐานะผู้เยี่ยมชม
```

## 6.2 Banner

```text
โหมดผู้เยี่ยมชม
คุณสามารถทดลองเล่นได้ แต่คะแนนและผลงานจะไม่ถูกบันทึกถาวร
```

## 6.3 Dashboard

```text
ยินดีต้อนรับ ผู้เยี่ยมชม
เลือกบทเรียนที่ต้องการทดลองเล่นได้เลย
```

## 6.4 หน้าเลือกด่าน

```text
โหมดทดลองใช้: ทุกด่านเปิดให้ทดลองเล่น
คะแนนจะถูกเก็บชั่วคราวใน session นี้เท่านั้น
```

## 6.5 หลังเล่นจบ

```text
ทดลองเล่นสำเร็จ!
คะแนนนี้เป็นคะแนนทดลอง และจะไม่ถูกบันทึกถาวร
```

## 6.6 เมื่อพยายามสร้างผลงาน

```text
ต้องเข้าสู่ระบบนักเรียนก่อน จึงจะสร้างและส่งผลงานให้ครูตรวจได้
```

---

# 7. Security และ Data Safety

## 7.1 สิ่งที่ต้องป้องกัน

Visitor ห้ามเขียนข้อมูลจริงลง

```text
progress
game_logs
student_works
project_likes
student_badges
```

Visitor ห้ามเข้าถึง

```text
dashboard.php
review_work.php
classrooms.php
manage_students.php
manage_games.php
manage_stages.php
admin/*
```

Visitor ไม่ควรถูกนับใน

```text
leaderboard
teacher dashboard
classroom summary
student progress report
คะแนนเฉลี่ยของห้องเรียน
```

## 7.2 Session Hardening

เมื่อเริ่ม Visitor Mode ให้ใช้

```php
session_regenerate_id(true);
```

## 7.3 การออกจากระบบ

เมื่อ visitor logout ต้องล้าง session ทั้งหมด รวมถึง

```text
visitor_mode
visitor_progress
visitor_started_at
```

---

# 8. ลำดับการพัฒนา

## Phase 1: เพิ่มทางเข้า Visitor

งานที่ต้องทำ

1. เพิ่มปุ่ม “ทดลองใช้งาน” ที่ `index.php`
2. เพิ่มปุ่มหรือข้อความที่ `login.php`
3. สร้าง `pages/guest_start.php`
4. query demo context
5. ตั้งค่า visitor session
6. redirect ไป `student_dashboard.php`

ผลลัพธ์

```text
ผู้เยี่ยมชมกดปุ่มเดียวแล้วเข้า Dashboard นักเรียนได้
```

---

## Phase 2: ปรับระบบสิทธิ์

งานที่ต้องทำ

1. เพิ่ม helper `is_visitor_mode()`
2. เพิ่ม helper `is_student_like()`
3. ปรับหน้าฝั่งนักเรียนให้รับ visitor
4. ตรวจหน้าครูและ admin ไม่ให้ visitor เข้า

ผลลัพธ์

```text
Visitor ใช้หน้าผู้เรียนได้ แต่เข้า teacher/admin ไม่ได้
```

---

## Phase 3: ปรับ Dashboard และ Navbar

งานที่ต้องทำ

1. แสดงชื่อ “ผู้เยี่ยมชม”
2. แสดง badge “โหมดทดลองใช้”
3. แสดง banner แจ้งว่าไม่บันทึกถาวร
4. คะแนนรวมคำนวณจาก session หรือแสดง 0

ผลลัพธ์

```text
ผู้ใช้รู้ทันทีว่ากำลังอยู่ในโหมดทดลองใช้งาน
```

---

## Phase 4: ปรับ Game Select

งานที่ต้องทำ

1. อ่านคะแนนจาก `$_SESSION['visitor_progress']`
2. ปลดล็อกทุกด่านสำหรับ visitor
3. แสดงข้อความว่าเป็นโหมดทดลองใช้
4. ปรับ CTA สร้างชิ้นงานให้แจ้งเข้าสู่ระบบจริง

ผลลัพธ์

```text
Visitor เลือกเล่นด่านใดก็ได้ และเห็นคะแนนชั่วคราวได้
```

---

## Phase 5: ปรับ Submit Score

งานที่ต้องทำ

1. ดัก `visitor_mode` ใน `api/submit_score.php`
2. เก็บคะแนนลง session
3. ส่ง JSON success
4. ห้ามเขียน `progress`
5. ห้ามเขียน `game_logs`
6. ห้าม loop team_members

ผลลัพธ์

```text
เกมจบ flow ได้ แต่ฐานข้อมูลจริงไม่เปลี่ยน
```

---

## Phase 6: ปรับ Waiting Room

งานที่ต้องทำ

1. ถ้าเป็น visitor ให้แสดง visitor summary
2. ไม่แสดง leaderboard จริง
3. ไม่ polling navigation status
4. เพิ่มปุ่มกลับเลือกด่านและกลับ Dashboard

ผลลัพธ์

```text
Visitor ไม่ติดหน้ารอสัญญาณครู
```

---

## Phase 7: จำกัดการสร้างชิ้นงาน

งานที่ต้องทำ

1. ปรับ create project pages
2. ปรับ `api/save_work.php`
3. ป้องกันการ INSERT `student_works`
4. แสดงข้อความให้เข้าสู่ระบบนักเรียนจริง

ผลลัพธ์

```text
Visitor ไม่สร้างผลงานจริงในระบบ
```

---

## Phase 8: ทดสอบรวม

ทดสอบเส้นทางเต็ม

```text
index.php
→ ทดลองใช้งาน
→ student_dashboard.php
→ instruction.php
→ game_select.php
→ play_game.php
→ submit_score.php
→ waiting_room.php
→ กลับไปเลือกด่าน
→ logout
```

---

# 9. Test Cases

## Test Case 1: เข้า Visitor Mode

ขั้นตอน

1. เปิด `index.php`
2. กด “ทดลองใช้งาน”
3. ระบบ redirect ไป `student_dashboard.php`

ผลที่ต้องได้

- เห็นชื่อ “ผู้เยี่ยมชม”
- เห็น banner โหมดผู้เยี่ยมชม
- เห็นบทเรียนทั้ง 4 บท

---

## Test Case 2: เข้าเกร็ดความรู้

ขั้นตอน

1. จาก Dashboard เลือกบทเรียน
2. เข้า `instruction.php?game_id=1`
3. ลองเข้า game_id 2, 3, 4

ผลที่ต้องได้

- Visitor อ่านได้
- ไม่มี error เรื่องสิทธิ์
- ปุ่มไปเลือกด่านทำงาน

---

## Test Case 3: เลือกด่าน

ขั้นตอน

1. เข้า `game_select.php?game_id=1`
2. ตรวจด่านทั้งหมด
3. ลองบท 2, 3, 4

ผลที่ต้องได้

- ด่านไม่ล็อก หรือปลดล็อกตาม logic visitor
- มีข้อความว่าเป็นโหมดทดลองใช้
- คะแนนอ่านจาก session

---

## Test Case 4: เล่นเกมและส่งคะแนน

ขั้นตอน

1. เข้า `play_game.php?stage_id=...`
2. เล่นจนจบ
3. ส่งคะแนน

ผลที่ต้องได้

- `api/submit_score.php` ส่ง `success = true`
- `$_SESSION['visitor_progress']` มีข้อมูล
- ตาราง `progress` ไม่เพิ่มแถว
- ตาราง `game_logs` ไม่เพิ่มแถว

---

## Test Case 5: Waiting Room

ขั้นตอน

1. เล่นจบหนึ่งด่าน
2. ถูก redirect ไป `waiting_room.php`

ผลที่ต้องได้

- แสดงหน้าสรุปผล Visitor
- ไม่แสดง leaderboard จริง
- ไม่รอครู
- มีปุ่มกลับเลือกด่านและกลับ Dashboard

---

## Test Case 6: พยายามสร้างผลงาน

ขั้นตอน

1. เข้า create project page
2. กดบันทึก

ผลที่ต้องได้

- ไม่บันทึกลง `student_works`
- แสดงข้อความให้เข้าสู่ระบบนักเรียนจริง

---

## Test Case 7: ตรวจสิทธิ์หน้าครู

ขั้นตอน

1. เข้า Visitor Mode
2. พยายามเปิด `dashboard.php`
3. พยายามเปิด `review_work.php`

ผลที่ต้องได้

- ถูกปฏิเสธสิทธิ์หรือ redirect
- ไม่เห็นข้อมูลครู

---

## Test Case 8: Logout

ขั้นตอน

1. เข้า Visitor Mode
2. เล่นเกมหนึ่งด่าน
3. กดออกจากระบบ
4. กลับเข้าเว็บใหม่

ผลที่ต้องได้

- session visitor หาย
- visitor_progress หาย
- ต้องกดทดลองใช้งานใหม่จึงเข้าได้

---

# 10. Acceptance Criteria

ระบบถือว่าพัฒนา Visitor Mode สำเร็จเมื่อผ่านเงื่อนไขต่อไปนี้

```text
ผู้เยี่ยมชมเข้าใช้งานได้โดยไม่ต้อง login
ผู้เยี่ยมชมเห็น Dashboard นักเรียน
ผู้เยี่ยมชมเข้าเกร็ดความรู้ได้
ผู้เยี่ยมชมเล่นเกมทั้ง 4 บทได้
คะแนนเก็บเฉพาะใน session
ไม่มีข้อมูล visitor ถูกเขียนลง progress จริง
ไม่มี game_logs ของ visitor
ไม่มี student_works ของ visitor
waiting_room ไม่รอสัญญาณครู
มี banner บอกโหมดผู้เยี่ยมชมชัดเจน
visitor เข้า teacher/admin pages ไม่ได้
logout แล้ว session visitor หาย
```

---

# 11. รายการไฟล์ที่ต้องตรวจหลังพัฒนา

```text
index.php
pages/login.php
pages/guest_start.php
pages/student_dashboard.php
pages/instruction.php
pages/game_select.php
pages/play_game.php
pages/waiting_room.php
pages/create_project_logic.php
pages/create_project_algo.php
pages/create_project_condition.php
pages/create_project_debug.php
api/submit_score.php
api/save_work.php
includes/student_navbar.php
includes/auth.php หรือ includes/context.php
logout.php
```

---

# 12. Prompt สำหรับสั่ง Codex

```text
พัฒนาฟังก์ชัน “ผู้เยี่ยมชม / Visitor Mode” แบบ session-only ให้ระบบแบบฝึกทักษะออนไลน์ โดยให้ผู้เยี่ยมชมทดลองใช้งานได้โดยไม่ต้องมี Join Code, รหัสนักเรียน หรือ PIN และต้องไม่กระทบข้อมูลนักเรียนจริง

แนวทางสำคัญ:
- Visitor ใช้ session-only
- ไม่สร้าง user จริง
- ไม่เขียน progress จริง
- ไม่เขียน game_logs จริง
- ไม่เขียน student_works จริง
- เล่นเกมได้ครบ 4 บท
- คะแนนเก็บใน $_SESSION['visitor_progress']
- waiting_room ต้องแสดงหน้าสรุปผลทันที ไม่รอสัญญาณครู
- ต้องมี banner ว่า “โหมดผู้เยี่ยมชม คะแนนและผลงานจะไม่ถูกบันทึกถาวร”

งานที่ต้องทำ:

1. เพิ่มปุ่ม “ทดลองใช้งาน” ที่ index.php และ/หรือ login.php
- ปุ่มลิงก์ไป pages/guest_start.php

2. สร้าง pages/guest_start.php
- session_start()
- session_regenerate_id(true)
- ตั้งค่า $_SESSION['visitor_mode'] = true
- ตั้งค่า role = visitor
- ตั้งค่า name = ผู้เยี่ยมชม
- ตั้งค่า user_id = 0
- ตั้งค่า student_id = visitor
- ตั้งค่า team_members = [0]
- ตั้งค่า context ของ demo classroom/session โดย query จากฐานข้อมูล
- ตั้งค่า $_SESSION['visitor_progress'] = []
- redirect ไป student_dashboard.php

3. เพิ่ม helper
- is_visitor_mode()
- is_student_like()
- ให้ student-facing pages รับ role student และ visitor
- teacher/admin pages ต้องไม่รับ visitor

4. แก้ student_dashboard.php
- ให้ visitor เข้าได้
- แสดง banner โหมดผู้เยี่ยมชม
- แสดงชื่อผู้ใช้เป็น ผู้เยี่ยมชม
- แสดงบทเรียนทั้ง 4 บท

5. แก้ includes/student_navbar.php
- ถ้า visitor_mode ให้แสดง ผู้เยี่ยมชม
- แสดง badge โหมดทดลองใช้
- ดาวรวมคำนวณจาก $_SESSION['visitor_progress'] หรือแสดง 0

6. แก้ game_select.php
- ถ้า visitor_mode ให้ใช้คะแนนจาก $_SESSION['visitor_progress']
- ให้ visitor ปลดล็อกทุกด่าน หรือใช้ progress session ตามลำดับ
- CTA สร้างชิ้นงานให้แจ้งว่า ต้องเข้าสู่ระบบนักเรียนเพื่อบันทึกผลงาน

7. แก้ api/submit_score.php
- ถ้า visitor_mode ให้เก็บ score, duration, attempts ลง $_SESSION['visitor_progress'][stage_id]
- ส่ง JSON success = true
- ห้าม INSERT/UPDATE progress
- ห้าม INSERT game_logs
- ห้ามใช้ team_members loop กับ visitor

8. แก้ waiting_room.php
- ถ้า visitor_mode ให้แสดง visitor summary
- ไม่ต้องโหลด leaderboard
- ไม่ต้อง polling navigation_status
- มีปุ่มกลับไปเลือกด่าน และกลับหน้า Dashboard

9. แก้ create project pages และ api/save_work.php
- ถ้า visitor_mode ห้ามบันทึก student_works จริง
- แสดงข้อความว่า โหมดผู้เยี่ยมชมไม่สามารถบันทึกผลงานถาวรได้

10. ทดสอบ
- index.php → ทดลองใช้งาน → student_dashboard.php
- เข้า instruction.php ได้
- เข้า game_select.php ได้
- เล่น play_game.php ได้
- submit_score แล้ว success
- ตรวจ database ว่า progress/game_logs ไม่เพิ่ม
- waiting_room ไม่รอครู
- visitor เข้า dashboard ครูไม่ได้
- logout แล้ว session หาย

หลังแก้ไขให้สรุป:
1. ไฟล์ที่แก้
2. session keys ที่เพิ่ม
3. จุดที่ป้องกันการเขียนฐานข้อมูลจริง
4. วิธีทดสอบ visitor mode แบบ end-to-end
```

---

# 13. สรุป

Visitor Mode แบบ session-only เหมาะกับระบบนี้ เพราะช่วยให้ผู้เยี่ยมชมทดลองใช้งานได้เต็มประสบการณ์ โดยไม่รบกวนข้อมูลนักเรียนจริง

หัวใจของระบบคือ

```text
ลองเล่นได้เหมือนนักเรียน
แต่ไม่เขียนข้อมูลจริงลงฐานข้อมูล
```

จุดที่ต้องระวังมากที่สุดคือ

```text
api/submit_score.php
game_select.php
waiting_room.php
student_navbar.php
api/save_work.php
```

หากจัดการ 5 จุดนี้ถูกต้อง Visitor Mode จะปลอดภัย ใช้งานง่าย และเหมาะสำหรับการนำเสนอระบบต่อกรรมการ ครู ผู้บริหาร หรือผู้สนใจทั่วไป
