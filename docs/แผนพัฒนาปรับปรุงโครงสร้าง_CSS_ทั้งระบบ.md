# แผนพัฒนาปรับปรุงโครงสร้าง CSS ทั้งระบบ

## โครงการ

**ระบบ:** บทเรียนออนไลน์เพื่อส่งเสริมทักษะการแก้ปัญหาอย่างเป็นขั้นตอน  
**Repository:** `shanwinder/newsp`  
**ขอบเขต:** CSS, Bootstrap, Bootstrap Icons, Google Fonts, PHP layout includes, CSS ที่ฝังใน JavaScript และแนวทางทดสอบส่วนติดต่อผู้ใช้ทั้งระบบ

---

## 1. หลักการสำคัญของแผน

การปรับปรุงครั้งนี้เป็นการจัดระเบียบสถาปัตยกรรม CSS ทั้งระบบ โดยยึดหลักสำคัญดังต่อไปนี้

1. **จัดโครงสร้างก่อนปรับดีไซน์**  
   ระยะแรกต้องรักษาหน้าตาและพฤติกรรมเดิมให้ใกล้เคียงที่สุด ไม่เปลี่ยนสี ขนาด ตำแหน่ง หรือ animation โดยไม่จำเป็น

2. **ย้ายทีละส่วนและทดสอบได้ทุกระยะ**  
   ห้ามย้าย CSS ทั้งระบบใน commit เดียว เพราะหากเกิดปัญหาจะค้นหาสาเหตุและย้อนกลับได้ยาก

3. **Bootstrap ยังคงเป็นโครงพื้นฐานของระบบ**  
   ไม่สร้าง utility class ซ้ำกับ Bootstrap เช่น margin, padding, flex, grid, text alignment และ responsive display โดยไม่มีเหตุผล

4. **CSS ของโครงการต้องรับผิดชอบเฉพาะเอกลักษณ์และองค์ประกอบเฉพาะระบบ**  
   เช่น ธีมฟาร์ม, Top Bar นักเรียน, การ์ดภารกิจ, เกมสายพาน, แบบทดสอบ, แบบสอบถาม และเครื่องมือสร้างชิ้นงาน

5. **แยกโครงสร้างตามหน้าที่ ไม่แยกตามความสะดวกชั่วคราว**  
   CSS กลาง, component, page และ game/module ต้องมีขอบเขตชัดเจน

6. **ลดการพึ่งพา `<style>`, inline style, CSS injection และ `!important`**  
   อนุญาตเฉพาะกรณีที่มีเหตุผลและบันทึกไว้ชัดเจน

7. **รองรับมือถือเป็นเงื่อนไขบังคับ**  
   ทุกระยะต้องทดสอบหน้าจอมือถือ แท็บเล็ต และเดสก์ท็อป ไม่ถือว่าหน้าเดสก์ท็อปทำงานได้แล้วเป็นอันเสร็จ

---

## 2. สภาพปัจจุบันที่ตรวจพบ

ระบบปัจจุบันใช้ Bootstrap 5.3.3 ผ่าน CDN เป็นโครงหลัก และใช้ Bootstrap Icons 1.11.3 รวมถึงฟอนต์ Kanit จาก Google Fonts

รูปแบบ CSS ที่มีอยู่ในปัจจุบันแบ่งได้เป็นหลายลักษณะ

### 2.1 CSS กลางที่แยกเป็นไฟล์แล้ว

ตัวอย่างไฟล์สำคัญ

- `assets/css/game_common.css`
- `assets/css/student_topbar.css`
- `assets/css/assessment.css`
- `assets/css/survey.css`
- `assets/css/conveyor_logic.css`
- `assets/css/smart_farm_builder.css`
- `assets/css/smart_farm_debugger.css`
- `assets/css/smart_farm_debugger_lite.css`

### 2.2 CSS ที่ฝังอยู่ในไฟล์ PHP

ตัวอย่างหน้าที่มี `<style>` ภายในไฟล์

- `index.php`
- `pages/login.php`
- `pages/dashboard.php`
- `pages/student_dashboard.php`
- `pages/play_game.php`
- หน้าจัดการครู ผู้ดูแล ห้องเรียน นักเรียน รายงาน และหน้าสร้างชิ้นงานบางหน้า

### 2.3 Inline style ใน HTML

ตัวอย่างการใช้งาน

- กำหนดสีเฉพาะ element
- กำหนด `top`, `z-index`, `width`
- กำหนด gradient ของปุ่ม
- กำหนด progress bar เริ่มต้น
- กำหนดขนาด emoji หรือองค์ประกอบตกแต่ง

Inline style ที่เป็นค่าคงที่ควรถูกย้ายไป class ส่วนค่าที่ JavaScript เปลี่ยนแบบ runtime อาจคงไว้ได้หากเหมาะสม

### 2.4 CSS ที่ JavaScript สร้างขึ้นตอนทำงาน

ไฟล์สำคัญคือ

- `assets/js/logic_game/farm_logic_missions.js`

ไฟล์ดังกล่าวมีฟังก์ชันสร้าง `<style>` และนำไปเพิ่มใน `<head>` ขณะรันเกม ทำให้ CSS ของเกมไม่ถูกรวมอยู่ในโครงสร้าง `assets/css`

### 2.5 Shared include ที่มีอยู่แล้ว

ฝั่งนักเรียนมีแนวทางที่ดีและควรใช้เป็นต้นแบบ ได้แก่

- `includes/student_topbar_head.php`
- `includes/student_topbar_scripts.php`
- `includes/student_navbar.php`
- `tests/topbar_consistency.php`

ส่วนนี้รวม Bootstrap, Bootstrap Icons, Kanit และ CSS ที่เกี่ยวข้องกับ Top Bar ไว้ในจุดกลาง พร้อมมี test ป้องกันการเรียก asset ซ้ำ

### 2.6 ปัญหาหลักของโครงสร้างปัจจุบัน

- CSS กระจายอยู่หลายตำแหน่ง
- Bootstrap CDN ถูกประกาศซ้ำในหลายหน้า
- ชุดน้ำหนักฟอนต์ Kanit ไม่เหมือนกันทุกหน้า
- สีและค่ารูปแบบเดียวกันถูกเขียนซ้ำหลายไฟล์
- selector บางชื่อกว้างเกินไป เช่น `.control-panel`, `.panel-head`, `.item-name`
- มี `!important` หลายจุดเพื่อแก้ specificity
- responsive breakpoint ไม่ได้ใช้มาตรฐานเดียวกันทั้งหมด
- CSS บางส่วนโหลดตามลำดับเพื่อ override กันโดยไม่มีเอกสารกำกับ
- การค้นหาว่า style ใดควบคุม element หนึ่งต้องตรวจทั้ง PHP, CSS และ JavaScript

---

## 3. เป้าหมายของการพัฒนา

### 3.1 เป้าหมายหลัก

1. รวม dependency ด้าน UI ไว้ใน include กลาง
2. แยก CSS ตามชั้นความรับผิดชอบอย่างชัดเจน
3. ย้าย `<style>` ออกจากไฟล์ PHP
4. ย้าย CSS injection ออกจาก JavaScript
5. สร้าง design tokens กลางสำหรับสี ระยะห่าง รัศมี เงา และ animation
6. ลด selector ชนกันระหว่างโมดูล
7. ลดการใช้ `!important`
8. กำหนด responsive breakpoint ให้สอดคล้องกับ Bootstrap
9. เพิ่ม test ตรวจโครงสร้าง CSS อัตโนมัติ
10. รักษาหน้าตาและพฤติกรรมเดิมระหว่าง migration

### 3.2 เป้าหมายรอง

- ลดขนาดโค้ดซ้ำ
- เพิ่มความเร็วในการแก้ UI
- ทำให้ผู้พัฒนาค้นหาไฟล์ที่ต้องแก้ได้ง่าย
- เตรียมระบบให้รองรับการเปลี่ยนธีมในอนาคต
- ลดความเสี่ยงจากการแก้ CSS หนึ่งหน้าแล้วกระทบหน้าอื่น

### 3.3 สิ่งที่ยังไม่ทำในแผนนี้

- ไม่เปลี่ยน Bootstrap ไปใช้ framework อื่น
- ไม่เปลี่ยน PHP เป็น frontend framework
- ไม่ redesign ทุกหน้าในระหว่าง migration
- ไม่เปลี่ยน gameplay หรือ logic ของเกม
- ไม่เปลี่ยน schema ฐานข้อมูล
- ไม่บังคับใช้ CSS preprocessor เช่น Sass ในระยะแรก
- ไม่รวม CSS ทั้งหมดเป็นไฟล์เดียวขนาดใหญ่

---

## 4. สถาปัตยกรรม CSS เป้าหมาย

เสนอให้จัดโครงสร้างดังนี้

```text
assets/
└── css/
    ├── core/
    │   ├── tokens.css
    │   ├── base.css
    │   └── accessibility.css
    │
    ├── components/
    │   ├── app_buttons.css
    │   ├── app_cards.css
    │   ├── app_badges.css
    │   ├── rank_badges.css
    │   ├── student_topbar.css
    │   └── media_credit.css
    │
    ├── pages/
    │   ├── landing.css
    │   ├── login.css
    │   ├── teacher_dashboard.css
    │   ├── student_dashboard.css
    │   ├── classrooms.css
    │   ├── user_management.css
    │   ├── reports.css
    │   └── waiting_room.css
    │
    ├── modules/
    │   ├── assessment.css
    │   ├── survey.css
    │   └── showcase.css
    │
    └── games/
        ├── play_game_shell.css
        ├── farm_logic_missions.css
        ├── conveyor_logic.css
        ├── smart_farm_builder.css
        ├── smart_farm_debugger.css
        └── smart_farm_debugger_lite.css
```

> หมายเหตุ: ชื่อและจำนวนไฟล์สุดท้ายให้พิจารณาจากการสำรวจจริงใน Phase 0 เพื่อไม่สร้างไฟล์ย่อยมากเกินความจำเป็น

---

## 5. หน้าที่ของแต่ละชั้น

### 5.1 `core/tokens.css`

เก็บค่ากลางที่ใช้ซ้ำทั้งระบบ

```css
:root {
    /* สีหลักของระบบ */
    --app-primary: #198754;
    --app-primary-dark: #166534;
    --app-primary-soft: #dcfce7;

    /* สีสถานะ */
    --app-success: #16a34a;
    --app-warning: #f59e0b;
    --app-danger: #dc2626;
    --app-info: #0ea5e9;

    /* สีพื้นผิวและตัวอักษร */
    --app-bg: #f0fdf4;
    --app-surface: #ffffff;
    --app-text: #334155;
    --app-muted: #64748b;
    --app-border: #dbe7e1;

    /* รัศมี */
    --app-radius-sm: 8px;
    --app-radius-md: 16px;
    --app-radius-lg: 24px;
    --app-radius-pill: 999px;

    /* เงา */
    --app-shadow-sm: 0 6px 16px rgba(15, 23, 42, 0.08);
    --app-shadow-md: 0 12px 30px rgba(15, 23, 42, 0.12);
    --app-shadow-lg: 0 20px 50px rgba(15, 23, 42, 0.16);

    /* การเคลื่อนไหว */
    --app-transition-fast: 0.18s ease;
    --app-transition-normal: 0.3s ease;
}
```

ข้อกำหนด

- token ต้องตั้งชื่อเชิงหน้าที่ ไม่ตั้งชื่อตามหน้าหนึ่งหน้า
- ห้ามสร้าง token สำหรับค่าที่ใช้ครั้งเดียว
- ระยะแรกให้คงค่าสีเดิมของแต่ละหน้า แล้วค่อยรวมค่าที่ซ้ำจริง
- token ของเกมเฉพาะระบบสามารถประกาศใต้ root class ของเกมนั้นได้

### 5.2 `core/base.css`

ใช้สำหรับค่าพื้นฐานของโครงการที่ Bootstrap ไม่ได้กำหนดตามความต้องการ เช่น

- ฟอนต์ Kanit ของระบบ
- สีข้อความพื้นฐาน
- `box-sizing` กรณีจำเป็น
- รูปภาพ responsive
- focus ring มาตรฐานของโครงการ
- body class กลาง

ห้ามเขียน reset ซ้ำกับ Bootstrap Reboot โดยไม่มีเหตุผล

### 5.3 `core/accessibility.css`

ใช้สำหรับ

- `prefers-reduced-motion`
- focus-visible
- utility สำหรับ screen reader ที่ Bootstrap ไม่มี
- high contrast adjustment ที่จำเป็น
- touch target ขั้นต่ำ

### 5.4 `components/`

เก็บ component ที่ถูกใช้ซ้ำข้ามหลายหน้า เช่น

- ปุ่มเฉพาะระบบ
- การ์ดมาตรฐาน
- badge และ rank badge
- Student Top Bar
- Media credit

Component ต้องไม่กำหนด layout ของทั้งหน้า

### 5.5 `pages/`

เก็บรูปแบบเฉพาะหน้าที่ไม่ควรถูกโหลดในหน้าอื่น เช่น

- Landing Page
- Login
- Dashboard ครู
- Dashboard นักเรียน
- ห้องเรียน
- จัดการผู้ใช้

ทุกไฟล์ควรมี root class ของหน้า เช่น

```html
<body class="app-page landing-page">
```

แล้วเขียน selector เช่น

```css
.landing-page .hero-section { ... }
```

### 5.6 `modules/`

เก็บระบบงานที่มีหลายหน้าและรูปแบบร่วมกัน เช่น

- Assessment
- Survey
- Showcase

### 5.7 `games/`

เก็บ CSS ที่เกี่ยวกับเกมและเครื่องมือสร้างเกมโดยตรง

แต่ละเกมต้องมี namespace หรือ root class เช่น

```css
.farm-logic-game .logic-card { ... }
.conveyor-game .control-panel { ... }
.smart-builder .panel-head { ... }
```

---

## 6. ลำดับการโหลด CSS มาตรฐาน

ทุกหน้าควรโหลด CSS ตามลำดับเดียวกัน

```text
1. Bootstrap CSS
2. Bootstrap Icons
3. Google Fonts หรือ local font declaration
4. core/tokens.css
5. core/base.css
6. core/accessibility.css
7. component CSS ที่หน้านั้นใช้
8. module CSS ที่หน้านั้นใช้
9. page หรือ game CSS ของหน้าปัจจุบัน
```

หลักการสำคัญ

- ไฟล์ที่เฉพาะเจาะจงกว่าต้องโหลดภายหลัง
- ห้ามอาศัยลำดับไฟล์โดยไม่มีเอกสารกำกับ
- ห้ามโหลด CSS เดิมซ้ำจากทั้ง include และหน้า PHP
- ทุกหน้าไม่จำเป็นต้องโหลด CSS ทุกไฟล์

---

## 7. Shared Asset Includes เป้าหมาย

เสนอให้สร้างไฟล์กลาง

```text
includes/app_head.php
includes/app_scripts.php
```

### 7.1 `app_head.php`

หน้าที่

- โหลด Bootstrap CSS
- โหลด Bootstrap Icons
- โหลด Kanit ด้วยชุดน้ำหนักมาตรฐานเดียวกัน
- โหลด core CSS
- โหลด component/module/page CSS ที่หน้าปัจจุบันร้องขอ
- ป้องกัน path ที่ไม่ปลอดภัย
- ป้องกัน asset ซ้ำ

รูปแบบการเรียกใช้ที่เสนอ

```php
<?php
// ระบุ CSS เพิ่มเติมของหน้านี้ก่อนเรียกส่วนหัวกลาง
$page_styles = [
    'components/student_topbar.css',
    'pages/student_dashboard.css',
];
require __DIR__ . '/../includes/app_head.php';
?>
```

### 7.2 `app_scripts.php`

หน้าที่

- โหลด Bootstrap bundle
- รองรับ script กลางที่ทุกหน้าต้องใช้
- รองรับ page scripts แบบเลือกโหลด
- ป้องกันการโหลด Bootstrap JavaScript ซ้ำ

### 7.3 การทำงานร่วมกับ Top Bar เดิม

ในช่วง migration ให้คงไฟล์

- `student_topbar_head.php`
- `student_topbar_scripts.php`

ไว้ก่อน เพื่อไม่ทำให้ทุกหน้าฝั่งนักเรียนเสียพร้อมกัน

เมื่อ `app_head.php` และ `app_scripts.php` ผ่านการทดสอบแล้ว จึงปรับ Top Bar ให้เรียกส่วนกลางใหม่ หรือยุบไฟล์เดิมอย่างเป็นขั้นตอน

---

## 8. มาตรฐานการตั้งชื่อ CSS

### 8.1 Prefix ตามระบบ

| ระบบ | Prefix ที่แนะนำ |
|---|---|
| ส่วนกลาง | `app-` |
| นักเรียน | `student-` |
| ครู/ผู้ดูแล | `teacher-`, `admin-` |
| แบบทดสอบ | `assessment-` |
| แบบสอบถาม | `survey-` |
| เกมทั่วไป | `game-` |
| Logic mission | `logic-` |
| สายพาน | `conveyor-` |
| Smart Farm Builder | `builder-` หรืออยู่ใต้ `.smart-builder` |
| Debugger | `debugger-` |

### 8.2 หลีกเลี่ยงชื่อกว้างโดยไม่มี root scope

ควรหลีกเลี่ยง

```css
.panel-head { ... }
.control-panel { ... }
.item-name { ... }
.title { ... }
.card-title { ... }
```

ควรใช้

```css
.smart-builder .panel-head { ... }
.conveyor-game .control-panel { ... }
.smart-builder .catalog-item-name { ... }
```

### 8.3 หลีกเลี่ยงการ style ด้วย ID

ID ให้ใช้สำหรับ JavaScript hook หรือ accessibility relationship เป็นหลัก

ควรเปลี่ยนจาก

```css
#game-container canvas { ... }
```

เป็น class เมื่อทำได้

```css
.game-canvas-host canvas { ... }
```

### 8.4 State class

ใช้ชื่อสถานะที่ชัดเจน

```css
.is-active
.is-selected
.is-disabled
.is-loading
.has-error
.has-success
```

State class ควรอยู่ร่วมกับ root component เพื่อป้องกันชนกัน

---

## 9. กฎเกี่ยวกับ Bootstrap

### 9.1 สิ่งที่ควรใช้ Bootstrap ต่อ

- Grid และ container
- Flex และ display utilities
- Spacing utilities
- Typography utilities
- Form controls
- Button base
- Alert
- Badge
- Progress
- Navbar collapse
- Responsive helpers

### 9.2 สิ่งที่ควรเขียน Custom CSS

- ธีมฟาร์ม
- รูปแบบการ์ดภารกิจ
- เกมและ canvas wrapper
- animation เฉพาะระบบ
- Top Bar เฉพาะนักเรียน
- ระบบฉายา
- Builder layout
- ตัวเลือกคำตอบแบบเฉพาะ
- การตกแต่ง Landing และ Login

### 9.3 สิ่งที่ไม่ควรทำ

- เขียน `.mt-*`, `.p-*`, `.d-flex` เลียนแบบ Bootstrap
- override `.btn`, `.card`, `.navbar` แบบ global โดยไม่มี root scope
- แก้ไฟล์ Bootstrap โดยตรง
- ผูก UI logic กับสี Bootstrap เพียงอย่างเดียว
- เรียก Bootstrap คนละเวอร์ชันในแต่ละหน้า

---

## 10. แนวทางจัดการ Responsive Design

ให้ใช้ breakpoint ของ Bootstrap เป็นหลัก

| Breakpoint | ความกว้าง |
|---|---:|
| `sm` | 576px |
| `md` | 768px |
| `lg` | 992px |
| `xl` | 1200px |
| `xxl` | 1400px |

ข้อกำหนด

1. ใช้ mobile-first เมื่อสร้าง CSS ใหม่
2. breakpoint เฉพาะ เช่น 760px, 900px หรือ 1180px สามารถใช้ได้ แต่ต้องมีเหตุผลจาก layout จริง
3. หากค่า custom ใกล้ breakpoint Bootstrap มาก ให้เปลี่ยนมาใช้มาตรฐาน Bootstrap
4. Touch target ควรมีขนาดอย่างน้อยประมาณ 44 × 44px สำหรับปุ่มสำคัญ
5. ห้ามใช้ hover เป็นวิธีเดียวในการแสดงข้อมูลสำคัญ
6. เกมต้องทดสอบ orientation แนวตั้งและแนวนอนตามหน้าที่รองรับ

---

## 11. แนวทางจัดการ `!important`

### 11.1 เป้าหมาย

ลด `!important` ให้เหลือเฉพาะกรณีจำเป็นจริง

### 11.2 กรณีที่อาจยอมรับได้

- การ override style ที่มาจาก library ภายนอกและแก้ด้วยลำดับหรือ scope ไม่ได้อย่างเหมาะสม
- canvas sizing ที่ library เขียน inline style ขณะ runtime
- accessibility override ที่ต้องชนะ style อื่นแน่นอน

### 11.3 กรณีที่ไม่ควรใช้

- ใช้แก้ selector ที่กว้างเกินไป
- ใช้เพราะ CSS โหลดผิดลำดับ
- ใช้เพราะ style อยู่คนละไฟล์และชนกัน
- ใช้ต่อกันหลายชั้น

### 11.4 ขั้นตอนการลด

1. เพิ่ม root namespace
2. ปรับลำดับโหลด
3. ลด selector global
4. ย้าย style ไปยังไฟล์ที่ถูกต้อง
5. ลบ `!important` ทีละจุดพร้อม visual test

---

## 12. แนวทางจัดการ Inline Style

### 12.1 Inline style ที่ต้องย้าย

- สีคงที่
- gradient คงที่
- border radius คงที่
- font size คงที่
- spacing คงที่
- decorative position ที่ไม่เปลี่ยน runtime

### 12.2 Inline style ที่อาจคงไว้ได้

- progress width ที่ JavaScript หรือ PHP คำนวณ
- transform หรือ position ของ object ที่เกมคำนวณทุก frame
- CSS custom properties ที่เกิดจากข้อมูล runtime และไม่มีชุด class จำกัด

### 12.3 Theme ของ `play_game.php`

ปัจจุบันมี PHP แทรกสีเข้า `<style>` ควรเปลี่ยนเป็น class ตามบทเรียน เช่น

```html
<body class="game-page game-theme-1">
```

แล้วประกาศใน `play_game_shell.css`

```css
.game-theme-1 {
    --game-page-bg: #e9f7ef;
    --game-accent: #27ae60;
    --game-accent-soft: #82e0aa;
}
```

วิธีนี้ทำให้ย้าย `<style>` ออกจาก PHP ได้ทั้งหมด และยังรักษาธีมแยกตามบทเรียน

---

## 13. แนวทางย้าย CSS ออกจาก JavaScript

### ไฟล์เป้าหมาย

`assets/js/logic_game/farm_logic_missions.js`

### งานที่ต้องทำ

1. สร้าง `assets/css/games/farm_logic_missions.css`
2. ย้าย style ทั้งหมดจาก `ensureLogicStyles()` ไปยังไฟล์ใหม่
3. เพิ่ม root class เช่น `.farm-logic-game`
4. ปรับ HTML ที่ JavaScript สร้างให้มี root class ดังกล่าว
5. โหลดไฟล์ CSS ผ่าน `play_game.php` เฉพาะด่านที่ใช้ engine นี้
6. ลบ `ensureLogicStyles()` หลังยืนยันว่า CSS ใหม่ถูกโหลดครบ
7. ทดสอบด่าน 1–3 ทุกระดับย่อย

### สิ่งที่ต้องระวัง

- ลำดับโหลดเทียบกับ `play_game_shell.css`
- ขนาด canvas
- touch action
- responsive layout ที่ 900px และ 576px
- selector ที่ใช้ ID
- `!important` สำหรับ canvas width/height

---

## 14. แผนการย้ายไฟล์เดิม

| ต้นทาง | เป้าหมาย | หมายเหตุ |
|---|---|---|
| `<style>` ใน `index.php` | `assets/css/pages/landing.css` | ย้ายแบบ visual parity |
| `<style>` ใน `pages/login.php` | `assets/css/pages/login.css` | แยก background, layout, form state |
| `<style>` ใน `pages/dashboard.php` | `assets/css/pages/teacher_dashboard.css` | scope ด้วย `.teacher-dashboard-page` |
| `<style>` ใน `pages/student_dashboard.php` | `assets/css/pages/student_dashboard.css` | คง Top Bar เป็น component |
| `<style>` ใน `pages/play_game.php` | `assets/css/games/play_game_shell.css` | เปลี่ยน theme PHP เป็น class/token |
| CSS ใน `farm_logic_missions.js` | `assets/css/games/farm_logic_missions.css` | ลบ runtime injection |
| `assets/css/game_common.css` | `assets/css/components/rank_badges.css` | ชื่อใหม่ตรงกับเนื้อหาจริง |
| `assets/css/student_topbar.css` | `assets/css/components/student_topbar.css` | ย้าย path หลัง shared head พร้อม |
| `assets/css/assessment.css` | `assets/css/modules/assessment.css` | รักษาหน้าตาเดิมก่อน tokenization |
| `assets/css/survey.css` | `assets/css/modules/survey.css` | รักษาหน้าตาเดิมก่อน tokenization |
| `assets/css/conveyor_logic.css` | `assets/css/games/conveyor_logic.css` | เพิ่ม namespace ก่อนลด selector |
| `assets/css/smart_farm_builder.css` | `assets/css/games/smart_farm_builder.css` | ตรวจ selector ชน conveyor |
| Debugger CSS | `assets/css/games/` | ห้ามรวม lite/full ก่อนตรวจ dependency |

---

## 15. แผนดำเนินงานเป็นระยะ

# Phase 0 — สำรวจและสร้าง Baseline

## เป้าหมาย

รู้ตำแหน่ง CSS ทั้งหมดและบันทึกหน้าตาปัจจุบันก่อนแก้โครงสร้าง

## งาน

- [ ] สำรวจไฟล์ `.css` ทั้งหมด
- [ ] สำรวจ `<style>` ใน `.php`, `.html`, `.js`
- [ ] สำรวจ `style="..."`
- [ ] สำรวจการเรียก Bootstrap, Bootstrap Icons และ Google Fonts
- [ ] สำรวจ `!important`
- [ ] สำรวจ selector ที่ชื่อกว้างและเสี่ยงชนกัน
- [ ] สำรวจ media query และ breakpoint ทั้งหมด
- [ ] จัดทำรายการ page → CSS dependency
- [ ] บันทึก screenshot baseline ของหน้าสำคัญ
- [ ] บันทึก browser console error ก่อนเริ่ม migration

## Deliverables

- รายงาน inventory CSS
- ตาราง dependency
- ชุด screenshot baseline
- รายการความเสี่ยง

## เกณฑ์ผ่าน

- ระบุแหล่ง CSS ได้ครบทั้ง PHP, CSS และ JavaScript
- มี baseline สำหรับหน้าหลักและเกมทุกบท

---

# Phase 1 — สร้าง Core CSS และมาตรฐานกลาง

## เป้าหมาย

สร้างรากฐานใหม่โดยยังไม่ย้ายหน้าขนาดใหญ่

## งาน

- [ ] สร้าง `assets/css/core/tokens.css`
- [ ] สร้าง `assets/css/core/base.css`
- [ ] สร้าง `assets/css/core/accessibility.css`
- [ ] กำหนดชุดน้ำหนัก Kanit มาตรฐาน
- [ ] กำหนด breakpoint policy
- [ ] กำหนด naming convention
- [ ] กำหนดข้อยกเว้น `!important`
- [ ] เพิ่ม `prefers-reduced-motion`
- [ ] เพิ่ม focus-visible มาตรฐาน

## ข้อควรระวัง

อย่าแทนค่าสีเดิมทั้งหมดด้วย token ใน commit แรก ให้สร้าง token และเริ่มใช้เฉพาะส่วนที่มั่นใจ

## เกณฑ์ผ่าน

- core CSS โหลดได้โดยไม่เปลี่ยนหน้าตาเดิมอย่างมีนัยสำคัญ
- ไม่มี console error หรือ missing asset

---

# Phase 2 — สร้าง Shared Asset Loader

## เป้าหมาย

รวม Bootstrap, Icons, Fonts และ core CSS ไว้ในจุดกลาง

## งาน

- [ ] สร้าง `includes/app_head.php`
- [ ] สร้าง `includes/app_scripts.php`
- [ ] รองรับ `$page_styles`
- [ ] รองรับ `$page_scripts`
- [ ] ป้องกัน path traversal
- [ ] ป้องกันรายการ asset ซ้ำ
- [ ] กำหนดลำดับ CSS มาตรฐาน
- [ ] เพิ่ม test ตรวจ shared asset
- [ ] ทดลองกับหน้าความเสี่ยงต่ำ 1–2 หน้า

## หน้า Pilot ที่แนะนำ

- หน้าข้อมูลทั่วไปหรือ About
- หน้าที่ไม่มี game canvas
- หน้าที่ไม่มี form ซับซ้อน

## เกณฑ์ผ่าน

- หน้า Pilot ไม่มี Bootstrap ซ้ำ
- navbar collapse และ component JavaScript ทำงาน
- ฟอนต์และไอคอนแสดงครบ

---

# Phase 3 — จัดระเบียบ Component และ Module CSS ที่แยกแล้ว

## เป้าหมาย

ย้ายไฟล์ที่แยกอยู่แล้วเข้าสู่โครงสร้างใหม่ก่อนย้าย `<style>` ขนาดใหญ่

## งาน

- [ ] ย้าย `game_common.css` เป็น `components/rank_badges.css`
- [ ] ย้าย `student_topbar.css` เป็น `components/student_topbar.css`
- [ ] ย้าย `assessment.css` เป็น `modules/assessment.css`
- [ ] ย้าย `survey.css` เป็น `modules/survey.css`
- [ ] ปรับ include path
- [ ] เพิ่ม root scope ให้ selector ที่เสี่ยง
- [ ] ตรวจ CSS ของ assessment และ survey บนมือถือ
- [ ] ตรวจ Top Bar ทั้ง desktop และ collapsed mode
- [ ] อัปเดต `tests/topbar_consistency.php`

## เกณฑ์ผ่าน

- Assessment และ Survey ทำงานครบ
- Top Bar ไม่เปลี่ยนตำแหน่งหรือสถานะ
- ไม่มี path เก่าเหลือใน PHP

---

# Phase 4 — ย้าย CSS ระดับหน้าออกจาก PHP

## เป้าหมาย

ลด `<style>` ในไฟล์ PHP โดยเริ่มจากหน้าทั่วไปก่อนหน้าเกม

## ลำดับแนะนำ

1. `index.php`
2. `pages/dashboard.php`
3. `pages/student_dashboard.php`
4. หน้าห้องเรียนและจัดการนักเรียน
5. หน้ารายงาน
6. `pages/login.php`

Login ให้ย้ายช่วงท้าย เพราะมี CSS ขนาดใหญ่และองค์ประกอบตกแต่งหลายชั้น

## งานต่อหน้า

- [ ] เพิ่ม root class ที่ `<body>`
- [ ] สร้าง page CSS
- [ ] ย้าย `<style>` โดยไม่ปรับค่า
- [ ] ย้าย inline style คงที่เป็น class
- [ ] ตรวจ responsive
- [ ] ตรวจ focus และ keyboard navigation
- [ ] ตรวจภาพพื้นหลังและ asset path
- [ ] ลบ `<style>` เดิมเมื่อผ่าน test

## เกณฑ์ผ่าน

- หน้าเป้าหมายไม่มี `<style>`
- inline style เหลือเฉพาะค่าที่เป็น runtime
- visual difference อยู่ในระดับที่ยอมรับได้

---

# Phase 5 — ปรับโครงสร้าง CSS ของหน้าเกม

## เป้าหมาย

แยก shell ของหน้าเกมออกจาก CSS ภายใน และทำ theme ให้เป็น class/static CSS

## งาน

- [ ] สร้าง `games/play_game_shell.css`
- [ ] ย้าย CSS จาก `pages/play_game.php`
- [ ] สร้าง `.game-theme-1` ถึง `.game-theme-4`
- [ ] ย้าย theme colors เป็น CSS variables ภายใต้ class
- [ ] เพิ่ม root class ตามชนิดด่าน
- [ ] ตรวจ wrapper ของ logic, conveyor และ debugger
- [ ] ตรวจ canvas sizing
- [ ] ตรวจ overflow
- [ ] ตรวจหน้าออกจากด่านและหัวข้อด่าน

## Matrix ทดสอบขั้นต่ำ

- ด่าน 1–3: Logic missions
- ด่าน 4–6: Sequence/Algorithm
- ด่าน 7–9: Conveyor condition
- ด่าน 10–12: Debugger

## เกณฑ์ผ่าน

- `play_game.php` ไม่มี PHP-generated CSS block
- เกมทุกบทแสดงในขนาดเดิม
- ผลคะแนนและการเปลี่ยนหน้าไม่กระทบ

---

# Phase 6 — ย้าย CSS Injection ออกจาก JavaScript

## เป้าหมาย

ให้ JavaScript รับผิดชอบ logic และ DOM behavior ไม่รับผิดชอบ stylesheet หลัก

## งาน

- [ ] สร้าง `games/farm_logic_missions.css`
- [ ] ย้าย CSS จาก `ensureLogicStyles()`
- [ ] เพิ่ม `.farm-logic-game` root
- [ ] ปรับ HTML template ของ engine
- [ ] ลบฟังก์ชัน inject CSS
- [ ] เพิ่ม asset dependency ในหน้าเกม
- [ ] ทดสอบ touch drag/click
- [ ] ทดสอบ resize ระหว่างเล่น

## เกณฑ์ผ่าน

- ไม่มี `<style id="farm-logic-missions-style">` ถูกสร้างตอน runtime
- layout และ canvas ตรง baseline
- เกมไม่เกิด flash of unstyled content

---

# Phase 7 — Namespace และลด Specificity

## เป้าหมาย

ลด selector ชนกันและลด `!important`

## งาน

- [ ] เพิ่ม root scope ให้ Conveyor
- [ ] เพิ่ม root scope ให้ Smart Builder
- [ ] เพิ่ม root scope ให้ Debugger
- [ ] เปลี่ยน selector generic ที่เสี่ยง
- [ ] ตรวจ `.control-panel`, `.panel-head`, `.item-name`, `.program-panel`, `.toolbox-panel`
- [ ] ลบ `!important` ทีละกลุ่ม
- [ ] จำกัดการ override Bootstrap ให้อยู่ใต้ root component
- [ ] ตรวจลำดับโหลด `conveyor_logic.css` กับ `smart_farm_builder.css`

## แนวทาง commit

แยก commit ตามโมดูล ห้าม rename selector ของหลายเกมใน commit เดียว

## เกณฑ์ผ่าน

- CSS ของเกมหนึ่งไม่เปลี่ยนเกมอื่น
- จำนวน `!important` ลดลงอย่างมีเหตุผล
- ไม่มี selector ใหม่แบบ global ที่กว้างเกินไป

---

# Phase 8 — Performance, Accessibility และ Offline Resilience

## เป้าหมาย

ปรับปรุงคุณภาพโดยไม่เปลี่ยนโครงสร้างหลักอีกครั้ง

## งาน

- [ ] ตรวจ CSS ที่ไม่ได้ใช้
- [ ] ลด animation ที่ซ้ำหรือหนักเกินไป
- [ ] รองรับ `prefers-reduced-motion`
- [ ] ตรวจ contrast
- [ ] ตรวจ focus-visible
- [ ] ตรวจ touch target
- [ ] ตรวจการโหลด Google Fonts
- [ ] พิจารณา local Bootstrap/Icons หรือ fallback
- [ ] ตรวจ external background texture
- [ ] ตรวจ Cumulative Layout Shift จากฟอนต์และ asset

## หมายเหตุเรื่อง CDN

ในระยะแรกให้คง CDN เพื่อลดขอบเขตการเปลี่ยนแปลง จากนั้นจึงพิจารณา

```text
assets/vendor/bootstrap/
assets/vendor/bootstrap-icons/
```

เพื่อให้ระบบทำงานได้ดีขึ้นในเครือข่ายโรงเรียนที่อินเทอร์เน็ตไม่เสถียร

---

# Phase 9 — Cleanup และบังคับใช้มาตรฐาน

## เป้าหมาย

ลบโครงสร้างเก่าและป้องกันไม่ให้ปัญหากลับมา

## งาน

- [ ] ลบไฟล์ CSS เก่าที่ไม่มีผู้เรียก
- [ ] ลบ include เดิมที่ถูกแทนที่แล้ว
- [ ] ลบ `<style>` ที่หลงเหลือโดยไม่มีข้อยกเว้น
- [ ] ลบ direct CDN link จาก page files
- [ ] ลบ CSS injection ที่หลงเหลือ
- [ ] อัปเดตเอกสารนักพัฒนา
- [ ] เพิ่ม test เข้า smoke test workflow
- [ ] สร้างรายการข้อยกเว้นที่ยอมรับได้

## เกณฑ์ผ่าน

- ทุกหน้าปฏิบัติตาม asset-loading standard
- ไม่มีไฟล์ orphan
- test architecture ผ่านทั้งหมด

---

## 16. ระบบทดสอบที่ต้องเพิ่ม

### 16.1 `tests/css_architecture_consistency.php`

ตรวจอย่างน้อย

- ห้าม page PHP โหลด Bootstrap โดยตรงหลัง migration
- ห้ามโหลด Bootstrap หลายครั้ง
- ห้ามโหลด Bootstrap Icons หลายครั้ง
- ห้ามโหลด Google Fonts หลายครั้ง
- ตรวจว่าหน้าเรียก `app_head.php`
- ตรวจว่าหน้าเรียก `app_scripts.php` เมื่อจำเป็น
- ตรวจ path ของ `$page_styles`
- รายงาน `<style>` ที่ยังเหลือ
- รายงาน inline style ที่ยังเหลือ
- รายงาน CSS injection ใน JavaScript
- รายงาน `!important`

Test ไม่ควร fail ทุกอย่างตั้งแต่วันแรก ให้มี mode รายงานก่อน แล้วค่อยเพิ่ม forbidden rule ตาม Phase

### 16.2 `tests/css_asset_paths.php`

ตรวจว่า

- ไฟล์ CSS ที่ page ระบุมีอยู่จริง
- ไม่มี path เก่า
- ไม่มี duplicate entry
- ไม่มีไฟล์ CSS ที่ไม่ได้ถูกเรียกเลยโดยไม่อยู่ใน allowlist

### 16.3 `tests/css_selector_guard.php`

ตรวจ selector ที่ห้ามเพิ่มใหม่ เช่น

```text
.panel-head
.control-panel
.item-name
.title
.content
.wrapper
```

ยกเว้นเมื่อ selector อยู่ใต้ root namespace

### 16.4 Existing tests

ต้องรันร่วมกับ

- `tests/topbar_consistency.php`
- `tests/topbar_render_smoke.php`
- smoke test อื่นของระบบที่มีอยู่

---

## 17. Manual Test Matrix

### 17.1 บทบาทผู้ใช้

- ผู้เยี่ยมชม
- นักเรียนรายบุคคล
- นักเรียนกลุ่ม
- ครู
- ผู้ดูแล
- Super Admin

### 17.2 หน้าที่ต้องทดสอบ

- Landing Page
- Login
- Teacher registration/pending approval
- Teacher Dashboard
- Classroom management
- Student Dashboard
- Game selection
- Play game ด่าน 1–12
- Waiting room
- Assessment intro/take/result
- Survey start/take/thank you
- Create project ทุกประเภท
- Showcase
- Review work
- Reports
- About/Media credit

### 17.3 ขนาดหน้าจอ

- 360 × 800
- 390 × 844
- 768 × 1024
- 1024 × 768
- 1366 × 768
- 1440 × 900

### 17.4 Browser ที่แนะนำ

- Chrome desktop
- Safari desktop บน macOS
- Chrome Android
- Safari iOS/iPadOS หากมีอุปกรณ์ทดสอบ

### 17.5 รายการตรวจทุกหน้า

- ไม่มี horizontal scroll โดยไม่ตั้งใจ
- navbar collapse ทำงาน
- font แสดงถูกต้อง
- icon แสดงครบ
- ปุ่มกดได้
- modal/dropdown/collapse ทำงาน
- focus มองเห็น
- ข้อความไม่ล้น
- card ไม่ทับกัน
- sticky element ไม่บังเนื้อหา
- animation ไม่ทำให้ใช้งานไม่ได้
- console ไม่มี error ใหม่
- network ไม่มี 404 asset

---

## 18. Visual Regression Strategy

หากยังไม่มีระบบ screenshot automation ให้ใช้วิธีต่อไปนี้ก่อน

1. บันทึก screenshot ก่อน migration
2. ใช้ viewport เดิมทุกครั้ง
3. ใช้ข้อมูลทดสอบเดิม
4. เปรียบเทียบ
   - ระยะห่าง
   - font size
   - card width
   - สี
   - border
   - shadow
   - animation state
5. บันทึกความแตกต่างที่ตั้งใจไว้ใน commit

ในอนาคตสามารถเพิ่ม Playwright screenshot test แต่ไม่จำเป็นต้องเพิ่มพร้อมการย้าย CSS ระยะแรก

---

## 19. ความเสี่ยงและแนวทางป้องกัน

### ความเสี่ยง 1: CSS โหลดผิดลำดับ

**ผลกระทบ:** รูปแบบ Bootstrap หรือ custom style ถูก override ผิด

**ป้องกัน:** ใช้ `app_head.php` เป็นจุดควบคุมลำดับเดียว

### ความเสี่ยง 2: Selector เปลี่ยนแต่ JavaScript ยังอ้างชื่อเก่า

**ผลกระทบ:** ปุ่ม เกม หรือ state ไม่ทำงาน

**ป้องกัน:** แยก JS hook class ออกจาก style class หรือค้นหาการอ้าง selector ก่อน rename

### ความเสี่ยง 3: Asset path เสียหลังย้ายโฟลเดอร์

**ผลกระทบ:** ภาพพื้นหลังไม่ขึ้น

**ป้องกัน:** ตรวจ relative URL ใน CSS และเพิ่ม asset path test

### ความเสี่ยง 4: CSS ของเกมชนกัน

**ผลกระทบ:** หน้า Builder หรือ Debugger เพี้ยนเมื่อโหลด Conveyor CSS ร่วมกัน

**ป้องกัน:** เพิ่ม root namespace ก่อนลด specificity

### ความเสี่ยง 5: Mobile regression

**ผลกระทบ:** ปุ่มเล็ก ข้อความล้น หรือ panel ซ้อนกัน

**ป้องกัน:** ทดสอบ viewport มือถือทุก commit ที่เปลี่ยน layout

### ความเสี่ยง 6: การลบ `!important` ทำให้ Bootstrap ชนะ

**ผลกระทบ:** สีหรือขนาดเปลี่ยน

**ป้องกัน:** ลบทีละ selectorและเพิ่ม scope ที่ถูกต้องแทน

### ความเสี่ยง 7: เปลี่ยนมากเกินไปใน commit เดียว

**ผลกระทบ:** หา regression ไม่เจอ

**ป้องกัน:** หนึ่ง commit ต่อหน้า หรือหนึ่งโมดูลต่อ commit

---

## 20. กลยุทธ์ Commit และ Rollback

รูปแบบ commit ที่แนะนำ

```text
CSS Phase 1: add core tokens and base styles
CSS Phase 2: add shared asset loaders
CSS Phase 3: migrate assessment styles
CSS Phase 3: migrate survey styles
CSS Phase 4: extract landing page styles
CSS Phase 4: extract teacher dashboard styles
CSS Phase 4: extract student dashboard styles
CSS Phase 4: extract login styles
CSS Phase 5: extract play game shell styles
CSS Phase 6: move farm logic styles out of JavaScript
CSS Phase 7: namespace conveyor selectors
CSS Phase 7: namespace smart builder selectors
CSS Phase 9: remove legacy CSS paths
```

ข้อกำหนด

- ห้ามรวม refactor CSS กับ feature ใหม่
- ห้ามรวม refactor CSS กับ database migration
- ห้ามเปลี่ยน selector และปรับดีไซน์ใน commit เดียวกัน
- ทุก commit ต้องมีรายการหน้าที่ทดสอบ
- rollback ต้องทำได้โดย revert commit ของโมดูลนั้น

---

## 21. Definition of Done ราย Phase

งานในแต่ละ Phase ถือว่าเสร็จเมื่อ

- [ ] โค้ดถูกวางในโครงสร้างเป้าหมาย
- [ ] ไม่มี asset 404
- [ ] ไม่มี JavaScript console error ใหม่
- [ ] automated test ที่เกี่ยวข้องผ่าน
- [ ] manual test หน้าที่ได้รับผลกระทบผ่าน
- [ ] mobile viewport ผ่าน
- [ ] desktop viewport ผ่าน
- [ ] visual difference ถูกตรวจและบันทึก
- [ ] path เก่าถูกลบเมื่อไม่มีผู้ใช้แล้ว
- [ ] เอกสารถูกอัปเดตหากมาตรฐานเปลี่ยน

---

## 22. เกณฑ์สำเร็จของโครงการทั้งหมด

โครงการปรับปรุง CSS ทั้งระบบถือว่าสำเร็จเมื่อครบเงื่อนไขต่อไปนี้

1. ทุกหน้าใช้ shared asset loader
2. Bootstrap และ Bootstrap Icons ถูกโหลดไม่เกินหนึ่งครั้งต่อหน้า
3. ชุดฟอนต์ Kanit เป็นมาตรฐานเดียวกัน
4. ไม่มี `<style>` ใน page PHP ยกเว้น allowlist ที่มีเหตุผล
5. ไม่มี stylesheet หลักถูก inject จาก JavaScript
6. inline style คงเหลือเฉพาะค่า runtime ที่จำเป็น
7. CSS แบ่งเป็น core, components, pages, modules และ games
8. selector ของเกมและโมดูลมี namespace
9. `!important` ลดลงและทุกจุดที่เหลือมีเหตุผล
10. หน้าหลักและเกมด่าน 1–12 ผ่าน manual test
11. Top Bar นักเรียนทำงานทั้ง desktop และ mobile
12. Assessment และ Survey ทำงานครบ
13. Builder และ Debugger ไม่เกิด CSS ชนกัน
14. ไม่มี asset path เก่าหรือ orphan CSS
15. architecture tests ผ่านทั้งหมด

---

## 23. ลำดับความสำคัญที่แนะนำ

### ระดับเร่งด่วน

1. Inventory และ baseline
2. Shared asset loader
3. Core tokens/base
4. ย้าย CSS จาก JavaScript
5. ย้าย CSS จาก `play_game.php`

### ระดับสูง

6. Landing, Login และ Dashboard CSS
7. Namespace ของ Conveyor/Builder/Debugger
8. ลด `!important`

### ระดับปรับคุณภาพ

9. Accessibility
10. Performance
11. Local vendor/fallback
12. Visual regression automation

---

## 24. แนวทางสำหรับผู้พัฒนาหลังปรับโครงสร้าง

เมื่อต้องเพิ่มหน้าใหม่

1. ใช้ `app_head.php`
2. เพิ่ม root class ที่ `<body>`
3. ใช้ Bootstrap utility ก่อนสร้าง utility ใหม่
4. สร้าง page CSS เฉพาะเมื่อจำเป็น
5. ไม่ใส่ `<style>` ใน PHP
6. ไม่สร้าง CSS ผ่าน JavaScript
7. ไม่เพิ่ม selector global ที่ไม่มี namespace
8. ไม่ใช้ `!important` โดยไม่อธิบายเหตุผล
9. เพิ่ม responsive rule สำหรับมือถือ
10. เพิ่มหน้าดังกล่าวเข้า architecture test หากเป็นหน้าหลัก

เมื่อต้องเพิ่มเกมใหม่

1. สร้าง root class ของเกม
2. สร้าง CSS ใน `assets/css/games/`
3. แยก game shell กับ game content
4. ใช้ CSS variables ภายใน root class สำหรับ theme
5. ห้าม override Bootstrap แบบ global
6. ทดสอบ touch และ resize
7. ระบุ dependency ใน page loader อย่างชัดเจน

---

## 25. สรุปแนวทางดำเนินการ

การปรับปรุงควรเริ่มจากการสร้างระบบควบคุมกลาง ไม่ใช่เริ่มจากการย้ายไฟล์แบบสุ่ม โดยลำดับที่ปลอดภัยที่สุดคือ

```text
สำรวจและบันทึก baseline
→ สร้าง core CSS
→ สร้าง shared asset loader
→ ย้าย component/module ที่แยกอยู่แล้ว
→ ย้าย CSS จาก PHP
→ ปรับหน้าเกมและ theme
→ ย้าย CSS ออกจาก JavaScript
→ เพิ่ม namespace และลด specificity
→ ปรับ accessibility/performance
→ cleanup และบังคับใช้มาตรฐานด้วย test
```

ผลลัพธ์ที่ต้องการไม่ใช่เพียง “มีไฟล์ CSS เป็นระเบียบ” แต่ต้องทำให้ระบบสามารถแก้ไข ต่อเติม และทดสอบ UI ได้อย่างปลอดภัย โดยไม่ทำให้หน้าหนึ่งกระทบอีกหน้าหนึ่ง และไม่ทำให้เกมหรือบทเรียนที่ใช้งานอยู่เกิด regression
