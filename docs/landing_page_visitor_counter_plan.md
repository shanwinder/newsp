# แผนการพัฒนา: เพิ่มระบบนับจำนวนผู้เข้าเยี่ยมชม Landing Page

เอกสารนี้จัดทำเพื่อใช้เป็นแผนงานสำหรับ Codex ในการพัฒนาระบบนับจำนวนผู้เข้าเยี่ยมชมเว็บไซต์บนหน้า Landing Page (`index.php`) ของโปรเจกต์ `new_learning_game`

เป้าหมายคือเพิ่มตัวนับผู้เข้าชมแบบ server-side ที่บันทึกข้อมูลลงฐานข้อมูล แสดงจำนวนผู้เข้าชมทั้งหมดและจำนวนผู้เข้าชมวันนี้บนหน้าแรก โดยไม่กระทบระบบ login, guest mode, dashboard, classroom control และ flow การเรียนรู้เดิม

---

## 1. สถานะปัจจุบันของระบบ

### 1.1 Landing Page

ไฟล์หน้าแรกของเว็บไซต์คือ:

```text
index.php
```

โครงสร้างสำคัญที่มีอยู่แล้ว:

```php
session_start();
require_once 'includes/db.php';
$app = require __DIR__ . '/config/app.php';
```

หน้า `index.php` มีการเชื่อมต่อฐานข้อมูลอยู่แล้วผ่าน `$conn` จึงสามารถเพิ่ม logic บันทึก visitor ได้โดยไม่ต้องสร้าง connection ใหม่

### 1.2 Redirect เมื่อ login แล้ว

ตอนต้นของ `index.php` มี logic ตรวจว่า user login อยู่หรือไม่ ถ้า login แล้วจะ redirect ไป dashboard ทันที

```php
if (isset($_SESSION['user_id'])) {
    if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {
        header("Location: pages/dashboard.php");
    } else {
        header("Location: pages/student_dashboard.php");
    }
    exit();
}
```

ดังนั้นต้องกำหนดให้ชัดเจนว่าจะนับ visitor ก่อนหรือหลัง redirect

---

## 2. นิยามการนับผู้เข้าชม

แนะนำให้ใช้แนวทางนี้:

> นับเฉพาะผู้ที่เข้ามาเห็นหน้า Landing Page จริงเท่านั้น

ดังนั้นให้เพิ่ม logic นับผู้ชม **หลัง block redirect ของผู้ใช้ที่ login อยู่แล้ว** เพื่อให้ผู้ใช้ที่ login แล้วและถูกส่งไป dashboard ทันทีไม่ถูกนับเป็น visitor ของ landing page

### เหตุผล

- ตรงกับคำว่า “ผู้เข้าเยี่ยมชมหน้า Landing Page” มากที่สุด
- ไม่ปนกับ traffic ภายในระบบของนักเรียน/ครูที่ login แล้ว
- จำนวนที่แสดงบนหน้าแรกจะสะท้อนผู้ชมหน้าแรกจริง

---

## 3. รูปแบบการนับที่ต้องการ

ให้ระบบนับแบบ:

```text
1 session ต่อ 1 page ต่อ 1 วัน = 1 visit
```

ตัวอย่าง:

- เปิด `index.php` ครั้งแรกวันนี้ → นับ +1
- refresh ซ้ำใน session เดิม → ไม่เพิ่ม
- ปิด browser แล้วเปิดใหม่ อาจได้ session ใหม่ → นับ +1
- วันถัดไป session เดิมกลับมา → นับ +1 ของวันใหม่

แนวทางนี้ช่วยลดการนับซ้ำจากการ refresh หน้า แต่ยังเรียบง่ายและเหมาะกับเว็บการเรียนรู้

---

## 4. ไฟล์ที่ต้องแก้ไข

### 4.1 ไฟล์หลัก

```text
index.php
```

งานที่ต้องทำ:

- เพิ่ม logic บันทึก visit
- ดึงจำนวนผู้ชมทั้งหมด
- ดึงจำนวนผู้ชมวันนี้
- เพิ่ม UI แสดงตัวเลขใน Hero Section
- เพิ่ม CSS สำหรับ badge/pill แสดงสถิติ

### 4.2 ไฟล์ฐานข้อมูล

ควรอัปเดต schema ทั้ง 2 ไฟล์ ถ้าโปรเจกต์ใช้ทั้งสองไฟล์เป็น reference/migration dump:

```text
new_learning_game.sql
database/new_learning_game.sql
```

งานที่ต้องทำ:

- เพิ่ม `CREATE TABLE site_visits`
- ไม่ควร insert demo visitor data เว้นแต่จำเป็นต่อการทดสอบ local

### 4.3 ไฟล์ใหม่แบบ optional

ถ้าต้องการแยก logic ให้สะอาดขึ้น สามารถสร้างไฟล์ helper ได้:

```text
includes/visitor_counter.php
```

แต่ในรอบแรกแนะนำให้เพิ่มตรงใน `index.php` ก่อน เพื่อลดความซับซ้อน

---

## 5. Schema ฐานข้อมูลที่แนะนำ

สร้างตารางใหม่ชื่อ `site_visits`

```sql
CREATE TABLE `site_visits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_key` varchar(128) NOT NULL,
  `ip_hash` char(64) DEFAULT NULL,
  `user_agent_hash` char(64) DEFAULT NULL,
  `page` varchar(100) NOT NULL DEFAULT 'landing',
  `visited_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `visit_date` date GENERATED ALWAYS AS (cast(`visited_at` as date)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_session_page_date` (`session_key`, `page`, `visit_date`),
  KEY `idx_page_visited_at` (`page`, `visited_at`),
  KEY `idx_visit_date` (`visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### เหตุผลของแต่ละ field

| Field | เหตุผล |
|---|---|
| `id` | primary key สำหรับแต่ละ visit record |
| `session_key` | ใช้กัน refresh ซ้ำใน session เดิม |
| `ip_hash` | เก็บ hash แทน IP จริงเพื่อลดข้อมูลส่วนบุคคล |
| `user_agent_hash` | ช่วยวิเคราะห์ visitor โดยไม่เก็บ user agent ตรง ๆ |
| `page` | รองรับการนับหลายหน้าในอนาคต เช่น `landing`, `guest_start`, `showcase` |
| `visited_at` | เวลาเข้าเยี่ยมชม |
| `visit_date` | ใช้ unique key และ query รายวันได้ง่าย |

---

## 6. หมายเหตุเรื่อง MySQL compatibility

ถ้า MySQL/MariaDB บางเวอร์ชันมีปัญหากับ generated column ให้ใช้ schema fallback นี้แทน:

```sql
CREATE TABLE `site_visits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_key` varchar(128) NOT NULL,
  `ip_hash` char(64) DEFAULT NULL,
  `user_agent_hash` char(64) DEFAULT NULL,
  `page` varchar(100) NOT NULL DEFAULT 'landing',
  `visited_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `visit_date` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_session_page_date` (`session_key`, `page`, `visit_date`),
  KEY `idx_page_visited_at` (`page`, `visited_at`),
  KEY `idx_visit_date` (`visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

ถ้าใช้ fallback schema ต้อง insert `visit_date` เองจาก PHP:

```php
$visit_date = date('Y-m-d');
```

แนะนำให้ Codex ตรวจรูปแบบ schema เดิมใน repo และเลือกใช้แนวทางที่เข้ากันกับ MySQL version ของระบบ

---

## 7. Logic PHP ที่ต้องเพิ่มใน `index.php`

เพิ่มหลัง block redirect ของ user ที่ login อยู่แล้ว และก่อนปิด PHP แรก

### 7.1 Version สำหรับ generated column

```php
// นับผู้เข้าชม Landing Page แบบ 1 session ต่อ 1 วัน
$total_visits = 0;
$today_visits = 0;

try {
    $visitor_session_key = session_id();
    $visitor_ip_hash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '');
    $visitor_agent_hash = hash('sha256', $_SERVER['HTTP_USER_AGENT'] ?? '');

    $stmt_visit = $conn->prepare("\n        INSERT IGNORE INTO site_visits\n            (session_key, ip_hash, user_agent_hash, page, visited_at)\n        VALUES\n            (?, ?, ?, 'landing', NOW())\n    ");
    $stmt_visit->bind_param("sss", $visitor_session_key, $visitor_ip_hash, $visitor_agent_hash);
    $stmt_visit->execute();

    $res_total = $conn->query("SELECT COUNT(*) AS total FROM site_visits WHERE page = 'landing'");
    if ($res_total) {
        $total_visits = (int)($res_total->fetch_assoc()['total'] ?? 0);
    }

    $res_today = $conn->query("\n        SELECT COUNT(*) AS total\n        FROM site_visits\n        WHERE page = 'landing' AND visit_date = CURDATE()\n    ");
    if ($res_today) {
        $today_visits = (int)($res_today->fetch_assoc()['total'] ?? 0);
    }
} catch (Throwable $e) {
    error_log('Visitor counter error: ' . $e->getMessage());
    $total_visits = 0;
    $today_visits = 0;
}
```

### 7.2 Version สำหรับ fallback schema ที่ไม่มี generated column

```php
// นับผู้เข้าชม Landing Page แบบ 1 session ต่อ 1 วัน
$total_visits = 0;
$today_visits = 0;

try {
    $visitor_session_key = session_id();
    $visitor_ip_hash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '');
    $visitor_agent_hash = hash('sha256', $_SERVER['HTTP_USER_AGENT'] ?? '');
    $visit_date = date('Y-m-d');

    $stmt_visit = $conn->prepare("\n        INSERT IGNORE INTO site_visits\n            (session_key, ip_hash, user_agent_hash, page, visited_at, visit_date)\n        VALUES\n            (?, ?, ?, 'landing', NOW(), ?)\n    ");
    $stmt_visit->bind_param("ssss", $visitor_session_key, $visitor_ip_hash, $visitor_agent_hash, $visit_date);
    $stmt_visit->execute();

    $res_total = $conn->query("SELECT COUNT(*) AS total FROM site_visits WHERE page = 'landing'");
    if ($res_total) {
        $total_visits = (int)($res_total->fetch_assoc()['total'] ?? 0);
    }

    $res_today = $conn->query("\n        SELECT COUNT(*) AS total\n        FROM site_visits\n        WHERE page = 'landing' AND visit_date = CURDATE()\n    ");
    if ($res_today) {
        $today_visits = (int)($res_today->fetch_assoc()['total'] ?? 0);
    }
} catch (Throwable $e) {
    error_log('Visitor counter error: ' . $e->getMessage());
    $total_visits = 0;
    $today_visits = 0;
}
```

---

## 8. ทำไมต้องใช้ `try/catch`

ถ้าฐานข้อมูล production ยังไม่ได้ migrate ตาราง `site_visits` แล้วมีคนเปิดหน้าแรก ระบบไม่ควรล่มทั้งหน้า

ดังนั้น logic visitor counter ควรถูกครอบด้วย `try/catch` และ fallback เป็นเลข `0` หรือซ่อน UI ได้

อย่างไรก็ตาม หลัง deploy จริงควรรัน SQL migration ให้เรียบร้อยก่อน

---

## 9. UI ที่ต้องเพิ่มใน Hero Section

ใน `index.php` ให้เพิ่ม block แสดงจำนวน visitor หลังปุ่ม CTA ใน Hero Section

ตำแหน่งแนะนำ: หลัง div ที่ครอบปุ่ม “เข้าสู่บทเรียน” และ “ทดลองใช้งาน”

ตัวอย่าง:

```php
<div class="visitor-stats mt-4 d-flex justify-content-center gap-3 flex-wrap">
    <div class="visitor-pill">
        <i class="bi bi-eye-fill me-1"></i>
        ผู้เข้าชมทั้งหมด
        <strong><?php echo number_format($total_visits); ?></strong>
        ครั้ง
    </div>
    <div class="visitor-pill">
        <i class="bi bi-calendar-check-fill me-1"></i>
        วันนี้
        <strong><?php echo number_format($today_visits); ?></strong>
        ครั้ง
    </div>
</div>
```

### Optional: ซ่อน UI ถ้ายังไม่มีข้อมูล

ถ้าไม่อยากแสดง `0` เมื่อ table ยังไม่มีหรือเกิด error:

```php
<?php if ($total_visits > 0 || $today_visits > 0): ?>
    <!-- visitor stats html -->
<?php endif; ?>
```

แต่แนะนำให้แสดงเสมอ เพราะเป็นตัวบอกว่าส่วนนี้ทำงานแล้ว

---

## 10. CSS ที่ต้องเพิ่มใน `<style>` ของ `index.php`

```css
.visitor-stats {
    position: relative;
    z-index: 4;
}

.visitor-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.45);
    color: #ffffff;
    padding: 10px 18px;
    border-radius: 999px;
    font-weight: 700;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.visitor-pill strong {
    font-size: 1.15rem;
    font-weight: 900;
    color: #fff8d6;
}

.navbar-grand.scrolled ~ .visitor-pill {
    color: #ffffff;
}

@media (max-width: 576px) {
    .visitor-pill {
        width: 100%;
        justify-content: center;
        font-size: 0.95rem;
    }
}
```

หมายเหตุ: selector `.navbar-grand.scrolled ~ .visitor-pill` อาจไม่จำเป็น เพราะ `visitor-pill` ไม่ใช่ sibling ของ navbar โดยตรง สามารถตัดออกได้ถ้าไม่ใช้

---

## 11. แนวทางด้าน Privacy และความปลอดภัย

### 11.1 ห้ามเก็บ IP address ตรง ๆ

ใช้ hash แทน:

```php
$visitor_ip_hash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '');
```

### 11.2 ห้ามแสดง IP หรือข้อมูล user agent บนหน้าเว็บ

ตัวเลขที่แสดงควรมีแค่:

- ผู้เข้าชมทั้งหมด
- ผู้เข้าชมวันนี้

### 11.3 ใช้ prepared statement ตอน insert

ห้ามประกอบ SQL จาก session/user agent โดยตรง

### 11.4 ไม่ควรเพิ่มข้อมูลส่วนบุคคลเกินจำเป็น

ไม่ต้องเก็บชื่อ user, email, username ใน `site_visits`

---

## 12. Performance Considerations

ตาราง `site_visits` จะโตขึ้นเรื่อย ๆ ตามจำนวน visit จึงควรมี index:

```sql
KEY `idx_page_visited_at` (`page`, `visited_at`),
KEY `idx_visit_date` (`visit_date`)
```

Query ที่ใช้ทุกครั้งใน landing page:

```sql
SELECT COUNT(*) AS total FROM site_visits WHERE page = 'landing';
```

ถ้าในอนาคตจำนวน record เยอะมาก อาจปรับเป็นตาราง summary แยก เช่น:

```text
site_visit_daily_stats
```

แต่ระยะเริ่มต้นยังไม่จำเป็น

---

## 13. ทางเลือกในอนาคต: ตาราง summary

ถ้าต้องการให้ระบบรองรับ traffic เยอะกว่าเดิม ให้พิจารณาเพิ่มตาราง:

```sql
CREATE TABLE site_visit_daily_stats (
    stat_date date NOT NULL,
    page varchar(100) NOT NULL,
    visits int NOT NULL DEFAULT 0,
    PRIMARY KEY (stat_date, page)
);
```

แล้วใช้ logic เพิ่มจำนวนแบบ atomic:

```sql
INSERT INTO site_visit_daily_stats (stat_date, page, visits)
VALUES (CURDATE(), 'landing', 1)
ON DUPLICATE KEY UPDATE visits = visits + 1;
```

แต่ข้อเสียคือกัน refresh ซ้ำยากขึ้น ถ้าไม่มี table `site_visits` เก็บ session รายวันประกอบ

สำหรับรอบนี้ให้ใช้ `site_visits` ก่อน

---

## 14. ขั้นตอนพัฒนาโดยละเอียดสำหรับ Codex

### Step 1: ตรวจ `index.php`

ตรวจว่าไฟล์มี structure เดิมดังนี้:

- `session_start()`
- include `includes/db.php`
- load `$app`
- redirect user ที่ login แล้ว
- hero section มี CTA buttons

อย่าเปลี่ยน flow login/redirect เดิม

### Step 2: เพิ่ม schema `site_visits`

เพิ่ม `CREATE TABLE site_visits` ใน:

```text
new_learning_game.sql
database/new_learning_game.sql
```

วางหลัง table `system_settings` หรือก่อน `titles` เพื่อให้อยู่ในกลุ่ม setting/analytics ของระบบ

### Step 3: เพิ่ม PHP visitor logic

ใน `index.php` เพิ่มหลัง block redirect:

```php
$total_visits = 0;
$today_visits = 0;

try {
    // insert ignore visit
    // query total
    // query today
} catch (Throwable $e) {
    error_log(...);
}
```

### Step 4: เพิ่ม UI

เพิ่ม block HTML หลังปุ่ม CTA ใน hero section

### Step 5: เพิ่ม CSS

เพิ่ม CSS `.visitor-stats`, `.visitor-pill`, `.visitor-pill strong` ใน `<style>` ของ `index.php`

### Step 6: ทดสอบ local

รัน SQL migration แล้วเปิดหน้าแรกหลายครั้งเพื่อตรวจว่าการ refresh ไม่เพิ่มซ้ำใน session เดิม

### Step 7: ตรวจ regression

ตรวจว่า login, guest start, navbar scroll และ footer ยังทำงานเหมือนเดิม

---

## 15. Code Snippet รวมสำหรับ `index.php`

### 15.1 เพิ่มหลัง block redirect

```php
// 2. นับผู้เข้าชม Landing Page แบบ 1 session ต่อ 1 วัน
$total_visits = 0;
$today_visits = 0;

try {
    $visitor_session_key = session_id();
    $visitor_ip_hash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '');
    $visitor_agent_hash = hash('sha256', $_SERVER['HTTP_USER_AGENT'] ?? '');

    $stmt_visit = $conn->prepare("\n        INSERT IGNORE INTO site_visits\n            (session_key, ip_hash, user_agent_hash, page, visited_at)\n        VALUES\n            (?, ?, ?, 'landing', NOW())\n    ");
    $stmt_visit->bind_param("sss", $visitor_session_key, $visitor_ip_hash, $visitor_agent_hash);
    $stmt_visit->execute();

    $res_total = $conn->query("SELECT COUNT(*) AS total FROM site_visits WHERE page = 'landing'");
    if ($res_total) {
        $total_visits = (int)($res_total->fetch_assoc()['total'] ?? 0);
    }

    $res_today = $conn->query("\n        SELECT COUNT(*) AS total\n        FROM site_visits\n        WHERE page = 'landing' AND visit_date = CURDATE()\n    ");
    if ($res_today) {
        $today_visits = (int)($res_today->fetch_assoc()['total'] ?? 0);
    }
} catch (Throwable $e) {
    error_log('Visitor counter error: ' . $e->getMessage());
}
```

### 15.2 เพิ่ม CSS

```css
.visitor-stats {
    position: relative;
    z-index: 4;
}

.visitor-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.45);
    color: #ffffff;
    padding: 10px 18px;
    border-radius: 999px;
    font-weight: 700;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.visitor-pill strong {
    font-size: 1.15rem;
    font-weight: 900;
    color: #fff8d6;
}

@media (max-width: 576px) {
    .visitor-pill {
        width: 100%;
        justify-content: center;
        font-size: 0.95rem;
    }
}
```

### 15.3 เพิ่ม HTML หลังปุ่ม CTA

```php
<div class="visitor-stats mt-4 d-flex justify-content-center gap-3 flex-wrap">
    <div class="visitor-pill">
        <i class="bi bi-eye-fill me-1"></i>
        ผู้เข้าชมทั้งหมด
        <strong><?php echo number_format($total_visits); ?></strong>
        ครั้ง
    </div>
    <div class="visitor-pill">
        <i class="bi bi-calendar-check-fill me-1"></i>
        วันนี้
        <strong><?php echo number_format($today_visits); ?></strong>
        ครั้ง
    </div>
</div>
```

---

## 16. Acceptance Criteria

งานนี้จะถือว่าสำเร็จเมื่อ:

### Database

- [ ] มีตาราง `site_visits`
- [ ] มี unique key กันนับซ้ำต่อ session/page/day
- [ ] มี index สำหรับ query รายวันและ query ตาม page
- [ ] schema ถูกเพิ่มใน `new_learning_game.sql`
- [ ] schema ถูกเพิ่มใน `database/new_learning_game.sql`

### Backend

- [ ] เปิด `index.php` แล้ว insert visit ได้
- [ ] refresh ซ้ำใน session เดิมวันเดียวกันแล้วไม่เพิ่ม record
- [ ] เปิด browser/session ใหม่แล้วเพิ่ม record ได้
- [ ] ผู้ใช้ที่ login แล้วถูก redirect ไม่ถูกนับ ถ้า logic อยู่หลัง redirect
- [ ] ถ้า table ยังไม่พร้อม หน้า landing page ไม่ล่ม เพราะมี `try/catch`

### Frontend

- [ ] แสดงจำนวนผู้เข้าชมทั้งหมด
- [ ] แสดงจำนวนผู้เข้าชมวันนี้
- [ ] ตัวเลขใช้ `number_format()`
- [ ] UI กลืนกับ hero section เดิม
- [ ] mobile ไม่ล้นจอ
- [ ] navbar scroll effect ยังทำงาน

### Regression

- [ ] ปุ่ม `เข้าสู่บทเรียน` ยังไป `pages/login.php`
- [ ] ปุ่ม `ทดลองใช้งาน` ยังไป `pages/guest_start.php`
- [ ] user ที่ login แล้วเข้าหน้าแรกยังถูก redirect ไป dashboard เหมือนเดิม
- [ ] ไม่มี PHP warning/error ในหน้าแรก
- [ ] ไม่มี SQL error หลัง migrate แล้ว

---

## 17. Manual Test Checklist

### Test 1: First visit

1. ล้าง session หรือเปิด incognito
2. เข้า `index.php`
3. ตรวจตาราง `site_visits`
4. ต้องมี record ใหม่ page = `landing`

### Test 2: Refresh same session

1. กด refresh หน้าเดิม
2. ตรวจจำนวน record
3. ต้องไม่เพิ่ม เพราะ `INSERT IGNORE` และ unique key กันซ้ำ

### Test 3: New session

1. เปิด browser ใหม่หรือ incognito ใหม่
2. เข้า `index.php`
3. record ต้องเพิ่ม 1

### Test 4: Today counter

1. ตรวจค่า `today_visits` บนหน้าเว็บ
2. ต้องตรงกับ:

```sql
SELECT COUNT(*) FROM site_visits WHERE page = 'landing' AND visit_date = CURDATE();
```

### Test 5: Total counter

1. ตรวจค่า `total_visits` บนหน้าเว็บ
2. ต้องตรงกับ:

```sql
SELECT COUNT(*) FROM site_visits WHERE page = 'landing';
```

### Test 6: Logged-in user

1. login เป็น student หรือ admin
2. เข้า `/index.php`
3. ต้องถูก redirect ไป dashboard เหมือนเดิม
4. ถ้าใช้แนวทางนับหลัง redirect ต้องไม่เพิ่ม visitor record

---

## 18. Suggested Commit Plan

แนะนำให้ Codex แบ่ง commit เป็น:

1. `Add site visits database schema`
2. `Track landing page visits server side`
3. `Display visitor counters on landing page`
4. `Harden visitor counter fallback behavior`

---

## 19. Prompt สำหรับใช้กับ Codex

ใช้ prompt นี้ใน Codex ได้โดยตรง:

```text
Implement a landing page visitor counter for this PHP/MySQL project.

Requirements:
1. Add a new table `site_visits` to both `new_learning_game.sql` and `database/new_learning_game.sql`.
2. The counter should count one visit per session per page per day.
3. Use page value `landing` for `index.php`.
4. Store hashed IP and hashed user agent only, not raw IP or raw user agent.
5. In `index.php`, after the existing logged-in user redirect block, insert the landing visit using `INSERT IGNORE`.
6. Query total landing visits and today's landing visits.
7. Display both counters in the hero section below the existing CTA buttons.
8. Add CSS so the visitor counter matches the existing glassmorphism hero design and works on mobile.
9. Wrap visitor counting in try/catch so the landing page does not break if migration has not run yet.
10. Do not change the existing login redirect flow, guest_start link, login link, navbar behavior, or footer.

Acceptance criteria:
- Refreshing the landing page in the same session on the same day does not increase the count.
- A new browser session increases the count.
- Logged-in users redirected away from `index.php` are not counted.
- The landing page shows total visits and today's visits.
- No PHP warning, SQL error, or horizontal overflow on mobile.
```

---

## 20. ข้อควรระวัง

1. อย่าเปลี่ยนลำดับ redirect ของ user ที่ login อยู่แล้ว เว้นแต่ตั้งใจให้นับทุก request ก่อน redirect
2. อย่าเก็บ IP จริงลงฐานข้อมูล
3. อย่าใช้ JavaScript-only counter เพราะจะบันทึกไม่แน่นอนและแก้ refresh duplicate ยากกว่า
4. อย่าใช้ `system_settings` เก็บตัวเลขรวมเพียงค่าเดียว เพราะจะขยายเป็นรายวัน/รายหน้าได้ยาก
5. ถ้า deploy แล้ว table ยังไม่มี ต้องมี `try/catch` เพื่อไม่ให้หน้าแรกล่ม
6. ถ้าใช้ generated column ให้ตรวจ compatibility ของ MySQL/MariaDB ก่อน deploy

---

## 21. นิยามงานเสร็จสมบูรณ์

งานนี้เสร็จสมบูรณ์เมื่อหน้า Landing Page (`index.php`) สามารถบันทึกผู้เข้าชมแบบไม่ซ้ำต่อ session/day ได้ แสดงจำนวนผู้เข้าชมทั้งหมดและจำนวนวันนี้ใน Hero Section อย่างสวยงาม และไม่กระทบ flow เดิมของระบบ login, guest mode และ dashboard
