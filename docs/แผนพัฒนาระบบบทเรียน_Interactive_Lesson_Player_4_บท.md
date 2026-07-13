# แผนพัฒนาระบบบทเรียน Interactive Lesson Player สำหรับ 4 บทเรียน

> สถานะเอกสาร: แผนพัฒนาระบบฉบับอ้างอิง
>
> วันที่จัดทำ: 13 กรกฎาคม 2569
>
> Repository: `shanwinder/newsp`
>
> ตรวจสอบสถานะระบบจาก `main` ที่ commit `a878948f5b1971bc46affa1e07323068d013b5b3`

---

## 1. วัตถุประสงค์ของเอกสาร

เอกสารนี้กำหนดแนวทางปรับปรุงหน้า `pages/instruction.php` จากหน้า “คู่มือก่อนเล่นเกม” แบบข้อความและการ์ดคงที่ ให้เป็นระบบ **Interactive Lesson Player** หรือ “ใบความรู้แบบมีชีวิต” สำหรับนักเรียนชั้นประถมศึกษาปีที่ 4

ระบบใหม่ต้องรองรับบทเรียน 4 บท ได้แก่

1. อัลกอริทึม — รู้จักและสร้างขั้นตอน
2. เหตุผลเชิงตรรกะ — กฎและเงื่อนไข
3. การคาดการณ์ผลลัพธ์
4. การแก้ปัญหาอย่างเป็นขั้นตอน

หน้าเนื้อหามีหน้าที่สอน อธิบาย สาธิต และสรุปความรู้ โดยนักเรียนสามารถแตะ กด ฟัง เลื่อน และสำรวจเนื้อหาได้ แต่ **ไม่ใช้เป็นแบบทดสอบ ไม่ตัดสินถูก–ผิด และไม่ให้คะแนนจากคำตอบ** งานฝึกคิดและการแก้ปัญหาจะอยู่ในเกมจริงที่ตามหลังบทเรียน

---

## 2. หลักการออกแบบการเรียนรู้

### 2.1 แยกหน้าที่ระหว่างบทเรียนกับเกม

| ส่วน | หน้าที่หลัก |
|---|---|
| Interactive Lesson | สอนแนวคิด แสดงตัวอย่าง อธิบายความสัมพันธ์ และสรุปความรู้ |
| เกมฝึกทักษะ | ให้นักเรียนนำความรู้ไปวางแผน ทดลอง คาดการณ์ แก้ปัญหา และปรับปรุงวิธีคิด |

หน้าเนื้อหาต้องไม่กลายเป็นเกมย่อยหรือข้อสอบแฝง เช่น ไม่ใช้ระบบหัวใจ คะแนน จับเวลา ดาว คำว่า “ตอบผิด” หรือการบังคับแก้ให้ถูกก่อนเปิดเนื้อหาถัดไป

### 2.2 ธีมใหม่

เปลี่ยนจากธีมฟาร์มเป็น **ชีวิตประจำวันของนักเรียน** เช่น

- การตื่นนอนและเตรียมตัวไปโรงเรียน
- การจัดกระเป๋าตามตารางเรียน
- การเดินทางไปโรงเรียน
- การปฏิบัติตามกฎในโรงเรียน
- การเลือกอาหารในโรงอาหาร
- การยืมหนังสือในห้องสมุด
- การทำเวรห้องเรียน
- การทำงานกลุ่ม
- การทำการบ้านและส่งงาน
- การเตรียมสิ่งของสำหรับวันถัดไป

### 2.3 รูปแบบ “ใบความรู้แบบมีชีวิต”

นักเรียนเรียนรู้ผ่านองค์ประกอบต่อไปนี้

- ข้อความสั้น อ่านง่าย
- ภาพประกอบขนาดใหญ่
- เสียงบรรยายภาษาไทย
- อนิเมชันสาธิต
- Timeline ที่เลื่อนดูได้
- Before / After comparison
- Hotspot สำหรับแตะดูคำอธิบาย
- สวิตช์เปลี่ยนข้อมูลหรือเงื่อนไข
- แผนผังเหตุและผล
- แผนที่กระบวนการ
- ภาพสรุปหรือ Mind Map
- ปุ่มเล่น หยุด ย้อนดู และฟังซ้ำ

ปฏิสัมพันธ์ทุกอย่างมีเป้าหมายเพื่อ **ช่วยให้เข้าใจเนื้อหา** ไม่ใช่ตรวจความจำหรือประเมินผล

---

## 3. สถานะล่าสุดของระบบใน Repository

### 3.1 Flow ปัจจุบัน

เส้นทางของนักเรียนในระบบปัจจุบันคือ

```text
student_dashboard.php
    ↓
instruction.php?game_id=<1-4>
    ↓
game_select.php?game_id=<1-4>
    ↓
play_game.php?stage_id=<1-12>
```

หน้า `student_dashboard.php` ดึงข้อมูลจากตาราง `games` แล้วใช้ `id` เป็นตัวแทนบทเรียน ก่อนส่งมายัง `instruction.php`

### 3.2 `instruction.php` ยังเป็นหน้า Hard-coded

ปัจจุบัน `pages/instruction.php`

- รับค่า `game_id`
- ใช้ `if / else if` แยกเนื้อหา 4 บท
- กำหนด `$mission_desc`, `$steps`, สีธีม และข้อความใน PHP โดยตรง
- แทรก knowledge card เฉพาะแต่ละบทใน HTML
- ไม่มี JavaScript สำหรับบทเรียนแบบ Interactive
- ไม่มีการบันทึกความคืบหน้าการอ่าน
- ไม่มีระบบเสียงบรรยาย
- ไม่มีระบบ section หรือ component
- ไม่มี version ของเนื้อหา

แม้ตาราง `games` มีคอลัมน์ `instruction_html` แต่ `instruction.php` ไม่ได้นำคอลัมน์นี้มาใช้เป็น source ของเนื้อหา

### 3.3 CSS ได้รับการปรับโครงสร้างแล้ว

ระบบล่าสุดได้ย้าย CSS ออกจาก PHP เรียบร้อยแล้ว

- `instruction.php` โหลด `assets/css/pages/instruction.css`
- ใช้ `includes/app_head.php` เป็นตัวโหลด CSS กลาง
- ใช้ `includes/app_scripts.php` เป็นตัวโหลด JavaScript กลาง
- มี CSS core, token และ accessibility ส่วนกลาง
- มีชุดทดสอบความสอดคล้องของสถาปัตยกรรม CSS
- มาตรฐานปัจจุบันห้ามเพิ่ม `<style>` หรือ stylesheet injection ใน JavaScript

ดังนั้นการพัฒนา Interactive Lesson Player ต้องต่อยอดระบบนี้ ไม่ย้อนกลับไปใส่ CSS หรือ JavaScript แบบฝังใน `instruction.php`

### 3.4 มีเนื้อหาหลักสูตรบทที่ 1 และ 2 แล้ว

Repository มีเอกสารเนื้อหาฉบับเต็มแล้ว 2 บท

```text
docs/บทเรียนที่1-ขั้นตอนรอบตัว.md
docs/บทเรียนที่2-คิดตามเงื่อนไข.md
```

บทที่ 1 ครอบคลุม

- ความหมายของอัลกอริทึม
- ตัวอย่างชีวิตประจำวัน
- จุดเริ่มต้น ขั้นตอน และผลลัพธ์
- ลักษณะของอัลกอริทึมที่ดี
- ผลจากการข้าม สลับ ทำซ้ำ หรือใช้คำสั่งไม่ชัดเจน
- รูปแบบการนำเสนออัลกอริทึม
- วิธีสร้างอัลกอริทึม
- การอธิบายการทำงาน

บทที่ 2 ครอบคลุม

- ความหมายของเหตุผลเชิงตรรกะ
- ข้อมูล ข้อเท็จจริง กฎ และเงื่อนไข
- การใช้เหตุผลจากสถานการณ์ใกล้ตัว
- การตัดสินใจแบบมีข้อมูลรองรับ
- เงื่อนไขแบบ ถ้า...แล้ว...
- แนวคิด AND, OR และ NOT ในระดับเหมาะสมกับ ป.4

เอกสารเหล่านี้ควรเป็น **Editorial Source** สำหรับออกแบบบทเรียน Interactive ไม่ควรนำ Markdown ทั้งหมดไปแสดงตรง ๆ บนหน้าเว็บ

### 3.5 โครงสร้างข้อมูลเดิมยังมีความหมาย 2 ชั้น

ฐานข้อมูลปัจจุบันใช้

```text
games → stages
```

โดย `games` 4 แถวทำหน้าที่เสมือน “บทเรียน” และ `stages` 12 แถวทำหน้าที่เสมือน “เกม 3 เกมต่อบท”

เป้าหมายใหม่ต้องรองรับ

```text
lessons → learning_games → game_levels
```

จำนวนเป้าหมายคือ

- 4 บทเรียน
- บทละ 3 เกม
- เกมละ 3 ด่านย่อย
- รวม 12 เกม และ 36 ด่านย่อย

ถ้านำตาราง `games` เดิมไปเปลี่ยนความหมายทันที จะกระทบส่วนอื่นที่อ้าง `game_id` อยู่แล้ว เช่น

- Dashboard
- Game selection
- Progress และคะแนน
- Student works
- Assessment questions
- Showcase และ review
- Project creation
- รายงานของครู

### 3.6 ยังไม่มีระบบติดตามการเรียนบทเนื้อหา

ฐานข้อมูลยังไม่มีข้อมูลประเภท

- นักเรียนเริ่มอ่านบทเมื่อใด
- อยู่ section ใด
- ดู section ใดแล้ว
- ฟังเสียงหรือเล่นตัวอย่างใดแล้ว
- อ่านสรุปบทหรือยัง
- เรียนเนื้อหา version ใด
- กลับมาเรียนต่อจากจุดใด

---

## 4. ข้อสรุปเชิงสถาปัตยกรรม

### 4.1 เก็บ `instruction.php` เป็นหน้าแกนกลาง

ไม่จำเป็นต้องสร้างหน้า PHP แยก 4 หน้า

ให้ `instruction.php` เปลี่ยนบทบาทเป็น **Lesson Player Shell** ทำหน้าที่เพียง

1. ตรวจ Login และสิทธิ์
2. ตรวจเงื่อนไข Pre-test
3. อ่าน `lesson_id`
4. โหลด metadata ของบทเรียน
5. โหลด manifest ของ section
6. สร้างโครงหน้า
7. เรียก JavaScript Lesson Player
8. บันทึกและกู้คืนความคืบหน้า
9. เชื่อมไปหน้ารายการเกมของบท

### 4.2 ไม่ใช้ `instruction_html` เป็นแกนหลัก

ไม่ควรเก็บ HTML ทั้งบทไว้ในคอลัมน์เดียวแล้ว render ด้วย `echo` เพราะ

- แยก section ไม่ได้
- จัดการ Interactive component ยาก
- version control ไม่ชัด
- ตรวจ asset path ยาก
- เสี่ยง XSS หากอนาคตมีหน้าหลังบ้าน
- diff และ code review ยาก
- rollback เนื้อหายาก

### 4.3 ใช้ Hybrid Content Architecture

แบ่งหน้าที่ดังนี้

#### Git / JSON

เก็บสิ่งที่ต้อง version control และมีโครงสร้างซับซ้อน

- ลำดับ section
- ข้อความ runtime
- config ของ component
- config ของอนิเมชัน
- asset key
- Phaser scene configuration
- accessibility text

#### MySQL

เก็บข้อมูลสถานะและข้อมูลที่เปลี่ยนตามผู้ใช้

- lesson metadata
- published version
- progress
- completion
- interaction event ที่จำเป็น
- feature flag
- classroom assignment

#### Markdown ใน `docs`

เก็บเนื้อหาต้นฉบับสำหรับครูและผู้พัฒนา

- เนื้อหาหลักสูตรฉบับเต็ม
- rationale
- mapping ระหว่างเนื้อหากับ section
- revision note

---

## 5. โครงสร้างข้อมูลเป้าหมาย

เพื่อไม่ทำลายระบบเดิม ให้สร้างตารางใหม่ควบคู่ก่อน แล้วค่อย cut over ภายหลัง

### 5.1 ตาราง `lessons`

```text
id
code
title
short_title
subtitle
description
theme_key
cover_asset_key
sort_order
status
current_version_id
created_at
updated_at
```

ข้อมูลเริ่มต้น

| id | code | title | subtitle |
|---:|---|---|---|
| 1 | algorithm | อัลกอริทึม | รู้จักและสร้างขั้นตอน |
| 2 | logic | เหตุผลเชิงตรรกะ | กฎและเงื่อนไข |
| 3 | prediction | การคาดการณ์ผลลัพธ์ | คิดล่วงหน้าจากข้อมูลและขั้นตอน |
| 4 | problem_solving | การแก้ปัญหาอย่างเป็นขั้นตอน | เข้าใจ วางแผน ลงมือ และตรวจสอบ |

### 5.2 ตาราง `lesson_versions`

```text
id
lesson_id
version_label
manifest_path
content_hash
status
published_at
change_note
created_at
```

เหตุผลที่ต้องมี version

- ใช้ในงานวิจัยและการเก็บข้อมูล
- ทราบว่านักเรียนแต่ละคนเรียนเนื้อหาชุดใด
- แก้ข้อความโดยไม่ทำให้ข้อมูลเก่าคลุมเครือ
- rollback ได้

### 5.3 ตาราง `lesson_progress`

```text
id
user_id
lesson_id
lesson_version_id
school_id
classroom_id
teacher_id
learning_session_id
current_section_key
viewed_sections_json
started_at
last_activity_at
completed_at
completion_percent
```

หลักการ

- ไม่มี score
- ไม่มี correct / incorrect
- completion เป็นสถานะการเข้าถึงเนื้อหา ไม่ใช่ผลสัมฤทธิ์
- unique key ต้องรวม user, lesson, version และ learning session

### 5.4 ตาราง `lesson_events`

ใช้เก็บเฉพาะ event ที่มีประโยชน์ต่อ UX และการวิจัย

```text
id
progress_id
section_key
event_type
event_detail_json
occurred_at
```

ตัวอย่าง event

- `section_view`
- `animation_play`
- `narration_play`
- `example_switch`
- `summary_view`
- `lesson_complete`

ไม่ควรบันทึกทุก pointer movement หรือทุก frame เพราะทำให้ฐานข้อมูลโตโดยไม่จำเป็น

### 5.5 ตารางเกมใหม่

ในระยะแรกไม่ควรเปลี่ยนความหมายตาราง `games` เดิมทันที ให้สร้าง

```text
learning_games
game_levels
```

#### `learning_games`

```text
id
lesson_id
code
title
description
engine_key
cover_asset_key
sort_order
status
```

#### `game_levels`

```text
id
learning_game_id
level_number
title
description
config_path
difficulty_key
status
```

เมื่อระบบใหม่ครบและข้อมูลเดิมถูก migrate แล้ว จึงพิจารณา rename ตารางใน major migration ภายหลัง

---

## 6. Routing และ Compatibility

### 6.1 URL ใหม่

```text
instruction.php?lesson_id=1
```

### 6.2 รองรับ URL เดิมช่วงเปลี่ยนผ่าน

`instruction.php` ควรรับ `game_id` ชั่วคราว แล้ว map ไป `lesson_id`

```text
instruction.php?game_id=1
    ↓ canonical redirect
instruction.php?lesson_id=1
```

### 6.3 Flow เป้าหมาย

```text
student_dashboard.php
    ↓
instruction.php?lesson_id=1
    ↓
lesson_games.php?lesson_id=1
    ↓
play_game.php?learning_game_id=<id>&level=<1-3>
```

ในช่วง compatibility สามารถใช้ `game_select.php` เดิมต่อได้ แต่ควรเปลี่ยน parameter เป็น `lesson_id` และเพิ่ม adapter สำหรับข้อมูลเก่า

---

## 7. สถาปัตยกรรม Frontend

### 7.1 โครงสร้างไฟล์เป้าหมาย

```text
pages/
└── instruction.php

includes/
├── lesson_repository.php
├── lesson_access.php
└── lesson_manifest.php

api/
├── get_lesson.php
└── save_lesson_progress.php

assets/css/
├── pages/
│   └── instruction.css
├── modules/
│   └── lesson_player.css
└── components/
    ├── lesson_timeline.css
    ├── lesson_hotspot.css
    ├── lesson_comparison.css
    ├── lesson_process_map.css
    └── lesson_summary.css

assets/js/learning/
├── lesson_player.js
├── lesson_progress.js
├── lesson_audio.js
├── lesson_phaser_bridge.js
├── components/
│   ├── hero_story.js
│   ├── concept_cards.js
│   ├── timeline.js
│   ├── hotspot.js
│   ├── comparison.js
│   ├── condition_switch.js
│   ├── cause_effect.js
│   ├── process_map.js
│   └── summary.js
└── demos/
    ├── lesson1_algorithm_demo.js
    ├── lesson2_logic_demo.js
    ├── lesson3_prediction_demo.js
    └── lesson4_problem_solving_demo.js

assets/data/lessons/
├── lesson-1.algorithm.v1.json
├── lesson-2.logic.v1.json
├── lesson-3.prediction.v1.json
└── lesson-4.problem-solving.v1.json

assets/lessons/
├── algorithm/
├── logic/
├── prediction/
└── problem-solving/
```

### 7.2 ตัว Lesson Player

`lesson_player.js` ทำหน้าที่

- โหลด manifest
- ตรวจรูปแบบข้อมูล
- render section ตาม `section_type`
- จัดการปุ่ม ก่อนหน้า / ถัดไป
- อัปเดต progress bar
- บันทึก current section
- restore จุดเรียนล่าสุด
- lazy load asset
- pause media เมื่อเปลี่ยน section
- ส่ง event ที่จำเป็น
- เปิด summary และ transition ไปเกม

### 7.3 Section types รุ่นแรก

| section_type | หน้าที่ |
|---|---|
| `hero_story` | ฉากเปิดด้วยสถานการณ์ชีวิตประจำวัน |
| `concept` | อธิบายแนวคิดหลัก |
| `animated_demo` | สาธิตกระบวนการด้วยอนิเมชัน |
| `timeline` | ดูเหตุการณ์หรือขั้นตอนตามลำดับ |
| `hotspot` | แตะจุดในภาพเพื่ออ่านคำอธิบาย |
| `comparison` | เปรียบเทียบก่อน–หลัง หรือแบบ A–B |
| `condition_switch` | เปลี่ยนข้อมูลแล้วดูผลที่เปลี่ยน |
| `cause_effect` | แสดงเหตุและผลต่อเนื่อง |
| `process_map` | แสดงขั้นตอนการคิดเป็นแผนที่ |
| `daily_examples` | รวมตัวอย่างจากชีวิตประจำวัน |
| `summary` | สรุปสาระสำคัญ |
| `game_transition` | เชื่อมเข้าสู่ 3 เกมของบท |

### 7.4 Phaser 4

ไม่ควรสร้างหน้าเนื้อหาทั้งหมดใน Phaser

ให้ใช้ HTML/CSS/JavaScript สำหรับ

- ข้อความ
- navigation
- timeline
- card
- diagram
- summary
- accessibility

ใช้ Phaser 4 เฉพาะ section ที่ต้องมีฉากสาธิตซับซ้อน เช่น

- ตัวละครทำกิจกรรมทีละขั้น
- ฉากเหตุและผลที่มีวัตถุเคลื่อนไหว
- การเปลี่ยนสถานะหลายจุดพร้อมกัน
- animation sequence ที่ต้อง pause / replay / scrub

ข้อกำหนด

- โหลด Phaser เฉพาะเมื่อ manifest มี `animated_demo` แบบ Phaser
- pin version ที่ผ่านการทดสอบ
- เก็บไฟล์ local หรือมี fallback
- ไม่ผูก Lesson Player ทั้งระบบกับ global Phaser instance
- มี DOM fallback หรือภาพนิ่งสำหรับอุปกรณ์ที่ renderer มีปัญหา
- เคารพ `prefers-reduced-motion`

---

## 8. โครงหน้าจอมาตรฐาน

```text
┌──────────────────────────────────────────────┐
│ บทที่ 1 | ชื่อบท | ความคืบหน้า | เสียง | ออก │
├──────────────────────────────────────────────┤
│                                              │
│             Section ปัจจุบัน                │
│                                              │
│   ข้อความ / ภาพ / Interactive / Demo        │
│                                              │
├──────────────────────────────────────────────┤
│ ย้อนกลับ       จุดนำทาง Section       ถัดไป │
└──────────────────────────────────────────────┘
```

### Desktop / Tablet

- พื้นที่เนื้อหาไม่จำกัดไว้ที่ card 850px แบบเดิม
- ใช้ max-width ตามชนิด section
- section ภาพและ demo ใช้พื้นที่กว้างได้
- มี sticky progress header แบบไม่บังเนื้อหา

### Mobile

- ใช้หนึ่งคอลัมน์
- ปุ่มแตะขนาดไม่น้อยกว่า 44px
- ไม่มี horizontal scrolling
- เสียงบรรยายไม่ autoplay
- control สำคัญอยู่ในระยะนิ้วโป้ง
- section ที่กว้างต้องเปลี่ยน layout ไม่ใช่ย่อจนอ่านไม่ได้

---

## 9. แผนบทเรียนที่ 1 เป็น Vertical Slice

ให้เริ่มพัฒนาระบบจริงจากบทเรียนที่ 1 “ขั้นตอนรอบตัว” เนื่องจากมีเนื้อหาต้นฉบับสมบูรณ์แล้ว และสามารถทดสอบ component หลักได้เกือบทั้งหมด

### 9.1 Section map ที่เสนอ

| ลำดับ | section_key | รูปแบบ | เนื้อหา |
|---:|---|---|---|
| 1 | `morning-rush` | hero_story | เช้าที่เร่งรีบของต้นกล้า |
| 2 | `what-is-algorithm` | concept | ความหมายของอัลกอริทึม |
| 3 | `everyday-examples` | daily_examples | ตัวอย่างรอบตัวนักเรียน |
| 4 | `algorithm-parts` | animated_demo | จุดเริ่มต้น ขั้นตอน ผลลัพธ์ |
| 5 | `why-order-matters` | comparison | ลำดับถูกกับลำดับสลับ |
| 6 | `common-step-errors` | timeline | ข้าม สลับ ทำซ้ำ และคำสั่งกำกวม |
| 7 | `representation-types` | hotspot | ข้อความ รายการ ภาพ ลูกศร ผังงาน |
| 8 | `build-an-algorithm` | process_map | กำหนดเป้าหมาย ระบุกิจกรรม เรียง ตรวจ ทดลอง |
| 9 | `explain-how-it-works` | animated_demo | การอธิบายการทำงานอย่างเป็นลำดับ |
| 10 | `lesson-summary` | summary | แผนผังสรุปความรู้ |
| 11 | `practice-transition` | game_transition | เชื่อมเข้าสู่ 3 เกมฝึกทักษะ |

### 9.2 ปฏิสัมพันธ์ของบทที่ 1

- กดเล่นกิจวัตรเช้าแบบทีละขั้น
- เลื่อน timeline เพื่อดูว่าแต่ละขั้นเกิดอะไรขึ้น
- กดเปรียบเทียบ “ถุงเท้าก่อนรองเท้า” กับ “รองเท้าก่อนถุงเท้า”
- แตะตัวอย่างเพื่อดูจุดเริ่มต้น ขั้นตอน และผลลัพธ์
- เปิดดูผลจากการข้ามหรือสลับขั้นตอน
- สลับรูปแบบนำเสนออัลกอริทึมเดียวกัน
- กดประกอบ Mind Map สรุปทีละหัวข้อ

ระบบต้องเป็นผู้สาธิตและอธิบาย ไม่ให้เด็กเรียงคำตอบเพื่อผ่าน section

### 9.3 การสรุปบท

หน้าสรุปต้องแสดงอย่างน้อย

- อัลกอริทึมคืออะไร
- องค์ประกอบ 3 ส่วน
- เหตุผลที่ลำดับสำคัญ
- ลักษณะของขั้นตอนที่ดี
- วิธีสร้างอัลกอริทึม
- รูปแบบการอธิบาย

เมื่อดูสรุปแล้วจึงแสดงปุ่ม

```text
ไปฝึกใช้ความรู้ในเกม
```

ไม่ใช้ข้อความ “ทำแบบทดสอบ” หรือ “พิสูจน์ว่าจำได้”

---

## 10. เนื้อหาบทที่ 2–4

### บทที่ 2 เหตุผลเชิงตรรกะ

Interactive หลัก

- สวิตช์สภาพอากาศและการกระทำ
- แผนผัง ถ้า...แล้ว...
- แผนผัง ถ้า...มิฉะนั้น...
- การแสดง AND / OR / NOT ด้วยภาพ
- แตะกฎในสถานที่ต่าง ๆ ของโรงเรียน
- เปรียบเทียบข้อเท็จจริงกับความคิดเห็น

ใช้ `docs/บทเรียนที่2-คิดตามเงื่อนไข.md` เป็น editorial source

### บทที่ 3 การคาดการณ์ผลลัพธ์

ต้องจัดทำเนื้อหาต้นฉบับฉบับเต็มก่อนพัฒนา runtime

Interactive หลัก

- Timeline เหตุและผล
- เปลี่ยนข้อมูลหนึ่งตัวแล้วดูผลลัพธ์ใหม่
- Before / After
- การคาดการณ์จากขั้นตอน
- การคาดการณ์จากกฎและเงื่อนไข
- การอธิบายว่าการคาดการณ์ไม่ใช่การเดาสุ่ม และอาจไม่ตรงผลจริงเสมอ

### บทที่ 4 การแก้ปัญหาอย่างเป็นขั้นตอน

ต้องจัดทำเนื้อหาต้นฉบับฉบับเต็มก่อนพัฒนา runtime

Interactive หลัก

- เข้าใจปัญหา
- ระบุเป้าหมาย
- แยกปัญหาใหญ่เป็นงานย่อย
- เลือกข้อมูลสำคัญ
- ดูตัวอย่างแผน
- ลงมือและดูผล
- เปลี่ยนแผนเมื่อมีข้อมูลใหม่
- ตรวจสอบผลลัพธ์

---

## 11. การจัดการ Progress

### 11.1 Completion ไม่ใช่คะแนน

หน้าเนื้อหาแสดงเพียง

- เริ่มเรียนแล้ว
- กำลังเรียน
- เรียนเนื้อหาครบแล้ว

ห้ามนำไปคำนวณดาวหรืออันดับ

### 11.2 เงื่อนไข completion ที่แนะนำ

บทเรียนถือว่า “ดูครบ” เมื่อ

- นักเรียนเปิด section ที่กำหนดเป็น required ครบ
- เปิด section สรุป
- ไม่จำเป็นต้องเล่น animation ทุกครั้งจนจบ
- ไม่จำเป็นต้องเปิดทุก hotspot
- ไม่ต้องตอบคำถาม

### 11.3 กลับมาเรียนต่อ

เมื่อกลับมาเปิดบทเดิม

- โหลด version เดิมที่นักเรียนเริ่มเรียน
- กลับไป current section ล่าสุด
- มีปุ่ม “เริ่มใหม่ตั้งแต่ต้น”
- ถ้า version ใหม่ถูกเผยแพร่ระหว่างเรียน ให้เก็บ progress เดิม และใช้ policy ที่กำหนดอย่างชัดเจน

---

## 12. Accessibility และความปลอดภัย

### Accessibility

- ทุกภาพมี alt text
- ทุกเสียงบรรยายมี transcript
- ปุ่มใช้ keyboard ได้
- focus state มองเห็นชัด
- สีไม่เป็นตัวสื่อความหมายเพียงอย่างเดียว
- รองรับ `prefers-reduced-motion`
- มีปุ่มหยุด animation
- ไม่ใช้ flashing effect
- font size เหมาะกับ ป.4
- ข้อความไม่วางบนพื้นหลังที่ contrast ต่ำ

### Security

- validate `lesson_id`
- query ฐานข้อมูลด้วย prepared statement
- manifest path มาจาก allowlist หรือข้อมูลที่ตรวจแล้ว
- ไม่ render raw HTML จากฐานข้อมูลโดยตรง
- escape metadata ทุกจุด
- API progress ตรวจ session, classroom และ learning session
- ป้องกันผู้ใช้บันทึก progress ให้ผู้อื่น
- จำกัดรูปแบบ event และขนาด JSON

---

## 13. Performance และ Asset Policy

- โหลดเฉพาะ asset ของ section ปัจจุบันและ section ถัดไป
- ใช้ WebP/AVIF ตามความเหมาะสม พร้อม fallback
- ใช้ spritesheet/atlas สำหรับ animation ที่ซ้ำ
- เสียงใช้ไฟล์บีบอัดและไม่ autoplay
- cache asset ที่ใช้ซ้ำในบทเดียวกัน
- pause animation และ audio เมื่อ tab hidden
- ทำลาย Phaser instance เมื่อออกจาก section
- หลีกเลี่ยงการโหลด Phaser ในบทที่ไม่มี demo แบบ Phaser
- เก็บ critical assets ไว้ใน server/repo ไม่พึ่ง CDN อย่างเดียว

---

## 14. การเชื่อมกับ Teacher Pause

ระบบปัจจุบันมี class control overlay แต่หน้า Interactive ใหม่ต้องรองรับ pause จริง

เมื่อครูกดหยุดชั้นเรียน

- ปิด interaction ชั่วคราว
- pause narration
- pause HTML animation
- pause Phaser scene
- ไม่เลื่อน progress อัตโนมัติ
- กลับมาทำต่อจากตำแหน่งเดิมเมื่อ resume

ให้กำหนด event กลาง เช่น

```text
classroom:pause
classroom:resume
```

Lesson Player และเกมใช้ protocol เดียวกัน

---

## 15. Feature Flag และการเปลี่ยนผ่าน

เพิ่ม feature flag ระดับระบบหรือ learning session

```text
interactive_lessons_enabled
new_game_catalog_enabled
```

พฤติกรรม

- flag ปิด: ใช้ `instruction.php` แบบเดิม
- flag เปิดเฉพาะบท 1: ใช้ Lesson Player สำหรับบท 1 และหน้าเดิมสำหรับบทอื่น
- flag เปิดครบ: ใช้ Lesson Player ทั้ง 4 บท

ข้อดี

- ทดลองกับห้อง Demo ก่อน
- rollback ได้โดยไม่ deploy ย้อน
- พัฒนาทีละบท
- ไม่บล็อกระบบเกมเดิม

---

## 16. ลำดับการพัฒนา

### Phase 0 — Inventory และตรึงขอบเขต

- ยืนยัน commit baseline
- สำรองฐานข้อมูล
- ทำรายการทุกหน้าที่อ้าง `games.id` และ `stages.id`
- ทำรายการ flow ของ solo, group และ visitor
- กำหนด naming convention ใหม่
- กำหนด feature flag
- ยืนยัน runtime PHP และ browser เป้าหมาย

### Phase 1 — Foundation

- เพิ่มตาราง `lessons`, `lesson_versions`, `lesson_progress`, `lesson_events`
- เพิ่ม repository/helper สำหรับ lesson
- เพิ่ม route `lesson_id` และ compatibility redirect
- สร้าง manifest schema
- สร้าง API โหลดบทและบันทึก progress
- สร้าง Lesson Player shell
- ใช้ `app_head.php` และ `app_scripts.php` ตามมาตรฐานปัจจุบัน

### Phase 2 — Shared Components

- hero story
- concept section
- timeline
- comparison
- hotspot
- process map
- summary
- audio controller
- progress controller
- reduced-motion support

### Phase 3 — Lesson 1 Vertical Slice

- แปลงเนื้อหา `บทเรียนที่1-ขั้นตอนรอบตัว.md` เป็น manifest
- สร้าง asset และ animation
- เชื่อม progress
- เชื่อม summary
- เชื่อมปุ่มไปเกม
- ทดสอบบนห้อง Demo

### Phase 4 — Lesson 2

- แปลงเนื้อหา `บทเรียนที่2-คิดตามเงื่อนไข.md`
- เพิ่ม condition switch และ cause/effect component
- ทดสอบคำศัพท์และความเข้าใจสำหรับ ป.4

### Phase 5 — Lesson 3 และ 4

- จัดทำ Markdown ต้นฉบับฉบับเต็ม
- ตรวจความถูกต้องทางหลักสูตร
- สร้าง manifest และ interactive component ที่ขาด
- ทดลองกับนักเรียนกลุ่มเล็ก

### Phase 6 — Game Catalog ใหม่

- เพิ่ม `learning_games` และ `game_levels`
- สร้าง 12 เกม × 3 ด่านย่อย
- ปรับหน้าเลือกเกมให้ใช้ `lesson_id`
- แยกคะแนนระดับเกมและระดับบท
- เชื่อมผลเกมกับ skill mastery

### Phase 7 — Cutover

- เปิด feature flag ครบ
- migrate Dashboard ไป `lessons`
- เปลี่ยนรายงานและ project flow
- ตรวจข้อมูลเก่า
- archive code path เดิมหลังผ่าน regression
- พิจารณา rename ตารางใน major migration ภายหลัง

---

## 17. ไฟล์ที่ต้องแก้ในช่วง Foundation

### แก้ไข

```text
pages/instruction.php
pages/student_dashboard.php
pages/game_select.php
config/lessons.php
includes/app_head.php            # เฉพาะเมื่อจำเป็น ไม่ควรเปลี่ยน contract เดิมโดยไม่จำเป็น
includes/app_scripts.php         # เฉพาะเมื่อจำเป็น
assets/css/pages/instruction.css
```

### เพิ่มใหม่

```text
includes/lesson_repository.php
includes/lesson_access.php
includes/lesson_manifest.php
api/get_lesson.php
api/save_lesson_progress.php
assets/css/modules/lesson_player.css
assets/js/learning/lesson_player.js
assets/js/learning/lesson_progress.js
assets/js/learning/lesson_audio.js
assets/data/lessons/lesson-1.algorithm.v1.json
database/<migration-file>.sql
```

### อัปเดตหลัง migration

```text
database/if0_40072699_newsp.sql
```

---

## 18. ชุดทดสอบที่ต้องเพิ่ม

### PHP / Schema tests

```text
tests/lesson_manifest_validation.php
tests/lesson_asset_paths.php
tests/lesson_schema_consistency.php
tests/instruction_route_compatibility.php
tests/lesson_progress_security.php
```

### ต้องรันชุดเดิมต่อไป

```bash
php tests/app_asset_loader.php
php tests/css_architecture_consistency.php
php tests/css_asset_paths.php
php tests/css_selector_guard.php
php tests/topbar_consistency.php
```

### Manual browser matrix

- Chrome desktop 1366×768
- Chrome Android 360×800
- Chrome Android 390×844
- Tablet 768×1024
- Safari iPad/iPhone ถ้ามีผู้ใช้
- reduced motion
- keyboard only
- network ช้า
- refresh ระหว่าง section
- logout/login แล้วกลับมาเรียนต่อ
- solo, group และ visitor mode

---

## 19. Acceptance Criteria ของระบบ Lesson Player

### Functionality

- `instruction.php?lesson_id=1` โหลดบทที่ 1 ได้
- URL เดิม `game_id` ยังเข้าได้ในช่วง compatibility
- กลับมาเรียนต่อจาก section ล่าสุดได้
- หน้า summary แสดงครบ
- ปุ่มไปเกมส่ง lesson context ถูกต้อง
- ไม่มีคะแนนหรือการตัดสินถูก–ผิดในหน้าเนื้อหา

### Architecture

- ไม่มี `<style>` ใน PHP
- ไม่มี inline JavaScript สำหรับ lesson logic
- CSS อยู่ใน namespace ของ instruction/lesson
- JavaScript โหลดผ่าน `app_scripts.php`
- manifest ผ่าน schema validation
- ไม่มี raw HTML จาก DB
- asset path ทุกไฟล์ตรวจได้

### UX

- นักเรียนเข้าใจว่าเป็นหน้าเรียน ไม่ใช่แบบทดสอบ
- ปฏิสัมพันธ์ช่วยอธิบายเนื้อหา
- ทุก animation หยุดและเล่นซ้ำได้
- mobile ไม่มี horizontal overflow
- ข้อความอ่านได้โดยไม่ต้อง zoom
- ปุ่มสำคัญแตะง่าย

### Accessibility

- ใช้ keyboard ได้
- มี alt และ transcript
- reduced motion ทำงาน
- focus state ชัดเจน
- contrast ผ่านเกณฑ์ที่เหมาะสม

### Data

- progress ผูกกับ learning session
- progress แยกตาม lesson version
- event ไม่บันทึกเกินความจำเป็น
- ไม่มีการบันทึกข้อมูลของผู้ใช้อื่น

---

## 20. ความเสี่ยงและแนวทางลดความเสี่ยง

| ความเสี่ยง | แนวทาง |
|---|---|
| เปลี่ยนความหมาย `game_id` แล้วระบบเดิมพัง | สร้างตารางใหม่และ compatibility layer ก่อน |
| หน้า lesson หนักเกินไป | lazy load, preload เฉพาะ section ถัดไป |
| Interactive กลายเป็นข้อสอบ | review ทุก component ด้วยหลัก “สาธิต ไม่ตัดสิน” |
| เนื้อหาใน DB แก้ยากหรือไม่ปลอดภัย | ใช้ versioned JSON manifest และ metadata DB |
| Phaser ทำให้ข้อความและ responsive ยาก | ใช้ Phaser เฉพาะ animated demo |
| ครู pause แต่ animation ยังทำงาน | ใช้ pause/resume event กลาง |
| เนื้อหาเปลี่ยนระหว่างงานวิจัย | lesson version และ content hash |
| CSS ใหม่กระทบหน้าอื่น | root namespace และชุดทดสอบ CSS เดิม |
| CDN หรือเครือข่ายโรงเรียนมีปัญหา | local critical assets และ fallback |
| นักเรียนกดข้ามทุกหน้า | required section + summary โดยไม่ใช้ข้อสอบ |

---

## 21. สิ่งที่ไม่ควรทำ

- ไม่สร้าง `instruction_lesson1.php` ถึง `instruction_lesson4.php` แยกกัน
- ไม่ยัด HTML ทั้งบทไว้ใน `instruction_html`
- ไม่เขียนทุก component ไว้ใน JavaScript ไฟล์เดียว
- ไม่ใช้ Phaser วาดข้อความเนื้อหาทั้งหมด
- ไม่เปลี่ยนตาราง `games` เดิมเป็น 12 เกมทันที
- ไม่ลบข้อมูล progress หรือผลงานเก่า
- ไม่รวม migration Lesson Player กับการ rewrite เกม 12 เกมใน deployment เดียว
- ไม่ใช้เวลา คะแนน ดาว หรือคำตอบถูก–ผิดในหน้าเนื้อหา
- ไม่บังคับเปิดทุก hotspot เพื่อผ่าน
- ไม่ autoplay เสียง
- ไม่เพิ่ม CSS/JS แบบ inline ซึ่งขัดกับสถาปัตยกรรมล่าสุด

---

## 22. Definition of Done สำหรับบทที่ 1

บทที่ 1 ถือว่าพร้อมเป็นต้นแบบเมื่อ

- เนื้อหาครบตาม `docs/บทเรียนที่1-ขั้นตอนรอบตัว.md`
- มี section map ตามแผนและสรุปบทชัดเจน
- นักเรียนสามารถดู ฟัง หยุด เล่นซ้ำ และย้อน section ได้
- ไม่มีคำถามแบบตัดสินคะแนน
- progress บันทึกและ restore ได้
- รองรับ mobile, tablet และ desktop
- reduced motion ทำงาน
- teacher pause หยุด media ได้
- ปุ่มไป 3 เกมของบททำงาน
- URL เดิมไม่เสีย
- ชุดทดสอบใหม่และชุดทดสอบ CSS เดิมผ่าน
- ทดลองในห้อง Demo ก่อนเปิดใช้จริง

---

## 23. ข้อเสนอการตัดสินใจ

ให้ยืนยันแนวทางต่อไปนี้เป็น architecture decision

1. `instruction.php` คงอยู่ แต่เปลี่ยนเป็น Lesson Player Shell
2. ใช้ `lesson_id` เป็น parameter หลัก
3. ใช้ Hybrid Architecture: Markdown + JSON manifest + MySQL progress/version
4. สร้างตารางบทเรียนใหม่ควบคู่ตารางเดิม
5. ใช้ Lesson 1 เป็น Vertical Slice
6. ใช้ HTML/CSS/JavaScript เป็นแกน และ Phaser 4 เฉพาะ animated demo
7. ไม่มีคะแนนหรือแบบทดสอบในหน้าเนื้อหา
8. ต่อเนื่องกับ CSS architecture และ shared asset loader ล่าสุด
9. ใช้ feature flag เปิดทีละบท
10. แยกการพัฒนา Lesson Player ออกจากการ rewrite เกมทั้งหมด

---

## 24. ผลลัพธ์ที่คาดหวัง

เมื่อดำเนินการตามแผน ระบบจะได้

- หน้าเนื้อหากลางที่รองรับทั้ง 4 บท
- ใบความรู้ Interactive ที่เหมาะกับนักเรียน ป.4
- เนื้อหาและเกมแยกหน้าที่กันชัดเจน
- ระบบ version และ progress ที่ใช้ในการวิจัยได้
- สถาปัตยกรรมที่ขยาย component ได้
- รองรับงานภาพ เสียง และอนิเมชันโดยไม่ทำให้ PHP กลายเป็นไฟล์ขนาดใหญ่
- เปลี่ยนธีมจากฟาร์มเป็นชีวิตประจำวันอย่างเป็นระบบ
- รองรับโครงสร้างอนาคต 4 บท × 3 เกม × 3 ด่านย่อย
- รักษาข้อมูลและ flow เดิมระหว่างการเปลี่ยนผ่าน

แผนนี้จึงเน้น **สร้างระบบบทเรียนใหม่แบบค่อยเป็นค่อยไป มี compatibility และทดสอบได้** แทนการรื้อ `instruction.php`, `games` และ `stages` พร้อมกันทั้งหมด ซึ่งมีความเสี่ยงสูงต่อระบบปัจจุบัน
