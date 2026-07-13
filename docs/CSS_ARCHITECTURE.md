# สถาปัตยกรรม CSS ของระบบ

เอกสารนี้เป็นผลส่งมอบของแผน `แผนพัฒนาปรับปรุงโครงสร้าง_CSS_ทั้งระบบ.md` และเป็นมาตรฐานสำหรับงาน UI หลังการ migration วันที่ 13 กรกฎาคม 2569

## สถานะหลัง migration

- PHP entry point ที่สร้างเอกสาร HTML 42 จุดใช้ `includes/app_head.php` หรือ compatibility wrapper ของ Student Top Bar แล้ว
- Bootstrap 5.3.3, Bootstrap Icons 1.11.3 และ Kanit ชุดน้ำหนัก `300–900` โหลดจากจุดกลาง
- CSS 51 ไฟล์อยู่ใต้ `core/`, `components/`, `pages/`, `modules/` และ `games/`
- ไม่มี `<style>` ใน PHP/HTML
- ไม่มี stylesheet injection ใน JavaScript
- inline style ที่เหลือเป็นค่าจาก runtime เท่านั้น: theme custom property, progress width และจำนวนคอลัมน์/แถวของ grid
- path ของภาพพื้นหลังหลังย้าย CSS ถูกตรวจด้วย `tests/css_asset_paths.php`
- `gateway.html` เป็น static CMS gateway จึงไม่สามารถเรียก PHP loader ได้ แต่โหลด `assets/css/pages/gateway.css` ภายนอกแทน

## ลำดับโหลดมาตรฐาน

`includes/app_head.php` บังคับลำดับดังนี้

1. Bootstrap CSS
2. Bootstrap Icons
3. Kanit
4. `core/tokens.css`
5. `core/base.css`
6. `core/accessibility.css`
7. component กลาง
8. `$page_styles` ตามลำดับที่หน้าแจ้ง

JavaScript ที่ใช้ Bootstrap ต้องเรียก `includes/app_scripts.php` ซึ่งรองรับ `$page_scripts` และตัดรายการซ้ำ

ตัวอย่างหน้าใหม่:

```php
<?php
$page_styles = ['pages/example.css'];
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="app-page example-page">
```

## Dependency inventory

| กลุ่มหน้า | CSS หลัก |
|---|---|
| Landing/Login/Dashboard/รายงาน/จัดการผู้ใช้ | `assets/css/pages/*.css` ตามชื่อ entry point |
| Student Top Bar | `components/rank_badges.css`, `components/student_topbar.css` |
| Assessment | `modules/assessment.css` และ page CSS ของหน้าครู |
| Survey | `modules/survey.css` และ page CSS ของหน้าครู |
| Logic stages 1–3 | `games/play_game_shell.css`, `games/farm_logic_missions.css` |
| Sequence stages 4–6 | `games/play_game_shell.css`, `games/farm_missions.css` |
| Conveyor stages 7–9 | `games/play_game_shell.css`, `games/conveyor_logic.css` |
| Debugger stages 10–12 | Conveyor CSS ร่วมกับ debugger CSS ในหน้าสร้าง/เล่นผลงานที่เกี่ยวข้อง |
| Smart Farm Builder/Showcase/Review | `games/smart_farm_builder.css` และ page CSS ของแต่ละหน้า |
| Static CMS gateway | `pages/gateway.css` |

รายการ dependency รายไฟล์เป็น source of truth อยู่ใน `$page_styles` ของแต่ละ entry point และถูกตรวจว่าไฟล์มีอยู่จริง/ไม่ orphan โดยอัตโนมัติ

## Namespace และ breakpoint

- ทุก `<body>` ใช้ `app-page` และ root class ตามชื่อหน้า
- เกมใช้ root เช่น `farm-logic-game`, `farm-missions-game`, `conveyor-game`, `debugger-game`, `smart-builder-page`
- selector กว้างที่เสี่ยง (`panel-head`, `control-panel`, `item-name`, `title`, `content`, `wrapper`) ต้องอยู่ใต้ namespace และมี guard test
- ใช้ breakpoint Bootstrap: 576, 768, 992, 1200 และ 1400px; breakpoint 900px ที่คงอยู่ใช้กับ game grid ที่ต้องเปลี่ยนจากสองคอลัมน์เป็นหนึ่งคอลัมน์

## ข้อยกเว้น `!important`

จุดที่เหลืออยู่จำกัดในกรณีต่อไปนี้

- canvas ของ Phaser ที่ library กำหนด width/height inline ขณะ runtime
- `prefers-reduced-motion` และ forced accessibility overrides
- print-only rule ที่ต้องซ่อน navigation
- border accent ของ instruction card ที่ต้องชนะ Bootstrap `.border`
- component บางจุดที่ต้องชนะ Bootstrap spacing/color utility เดิมเพื่อรักษา visual parity

หลัง migration ลดจำนวน `!important` จาก 75 จุดในรอบ inventory ระหว่างงานเหลือ 25 จุด โดย 8 จุดเป็น reduced-motion/accessibility, 9 จุดเป็น canvas/runtime library sizing และที่เหลือเป็น Bootstrap/print override ที่ระบุข้างต้น

ห้ามเพิ่มข้อยกเว้นใหม่โดยไม่ใส่ root namespace และบันทึกเหตุผลไว้ใกล้ declaration

## ชุดทดสอบ

```bash
php tests/app_asset_loader.php
php tests/css_architecture_consistency.php
php tests/css_asset_paths.php
php tests/css_selector_guard.php
php tests/topbar_consistency.php
```

การตรวจ visual วันที่ migration ครอบคลุม static gateway, หน้า pending approval และหน้า about/media ที่ viewport 390×844 และ 1366×768 ไม่พบ horizontal overflow, console error หรือ CSS/image 404 (ยกเว้น favicon ก่อนเพิ่ม data favicon ซึ่งแก้แล้ว)
