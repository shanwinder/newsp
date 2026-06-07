# แผนการพัฒนาปรับปรุงระบบโชว์ผลงานทุกบท
## Online Skill Practice Showcase Refactor Plan
### สำหรับระบบแบบฝึกทักษะออนไลน์ `shanwinder/newsp`

เอกสารนี้จัดทำเพื่อใช้เป็นแผนพัฒนาปรับปรุงระบบ “โชว์ผลงาน” ของทุกบทเรียน หลังพบปัญหาการแสดงผล preview, modal, ปุ่มเล่นผลงานของเพื่อน และการอ่าน `work_data` ที่ไม่สอดคล้องกันระหว่างบทเรียน โดยเฉพาะบทที่ 4 ที่เปลี่ยนมาใช้แนวทาง **Smart Farm Debug Mode: ซ่อมกฎฟาร์มอัจฉริยะ** ซึ่งใช้ฐานเกมสายพานของบทที่ 3 แต่ต้องแยกบทบาทออกจากบทที่ 3 อย่างชัดเจน

เป้าหมายของแผนนี้คือทำให้ระบบโชว์ผลงานรองรับผลงานของทุกบทอย่างถูกต้อง แยก logic ตามบทชัดเจน ลดการเดาข้อมูลผิด ป้องกันปุ่มเล่นพาไปผิดหน้า และทำให้หน้าโชว์ผลงานอ่านง่าย ใช้งานได้ดีทั้งคอมพิวเตอร์และมือถือ

---

# 1. ภาพรวมปัญหา

ระบบโชว์ผลงานปัจจุบันพยายามใช้หน้าเดียว คือ `pages/showcase.php` เพื่อรองรับผลงานจากหลายบทเรียน แต่ผลงานแต่ละบทมีโครงสร้างข้อมูลไม่เหมือนกัน เช่น

- บทที่ 1 เป็นผลงานลักษณะฉากหรือโจทย์เหตุผลเชิงตรรกะ
- บทที่ 2 เป็นเส้นทางรถไถหรือ route-based challenge
- บทที่ 3 เป็นเกมสายพาน Smart Farm Mini Game
- บทที่ 4 เป็น Smart Farm Debug Mode หรือโจทย์ซ่อมกฎฟาร์มอัจฉริยะ

เมื่อใช้ logic เดียวในการ parse, preview, modal และสร้างปุ่มเล่น จึงเกิดปัญหาว่าแต่ละบทแสดงผลไม่ตรงกับชนิดข้อมูลจริง หรือบางกรณีบทที่ 4 ถูกมองเป็นบทที่ 3 เพราะใช้ฐาน engine คล้ายกัน

ปัญหานี้ไม่ใช่แค่ CSS หรือการจัดวาง แต่เป็นปัญหาเชิงโครงสร้างของระบบโชว์ผลงานที่ควรแยกการแสดงผลตามบทเรียนให้ชัดเจน

---

# 2. ปัญหาที่พบ

## 2.1 `showcase.php` รวม logic ของทุกบทไว้ในไฟล์เดียวมากเกินไป

หน้าโชว์ผลงานมีแนวโน้มใช้ hard-code และ if/else หลายชุดเพื่อรองรับผลงานแต่ละบท เช่น กำหนดหน้า create project ตาม `game_id`, กำหนดชื่อบทและ icon ในไฟล์เดียว, parse `work_data` แล้วเดาว่าข้อมูลเป็นประเภทใด, เลือก preview จาก summary ที่ตรวจเจอก่อน และเลือกปุ่มเล่นจากรูปแบบข้อมูลที่ parse ได้

แนวทางนี้ทำให้แก้บทหนึ่งแล้วอาจกระทบบทอื่น และเมื่อบทที่ 4 เปลี่ยนแนวทางจาก Debug Lite เป็น Smart Farm Debug Mode ข้อมูลเก่าหรือ renderer เก่าอาจยังค้างอยู่

## 2.2 ระบบเลือก renderer จากรูปแบบข้อมูลมากกว่าจาก `game_id`

ระบบอาจเลือก renderer จาก `project_type` หรือจาก summary ที่ตรวจเจอ เช่น ถ้าเจอ smartSummary ให้แสดงแบบบทที่ 3, ถ้าเจอ debugSummary ให้แสดงแบบบทที่ 4, ถ้าเจอ tractorSummary ให้แสดงแบบบทที่ 2

แนวทางนี้เสี่ยงมาก เพราะบทที่ 4 ใช้ฐานเกมสายพานของบทที่ 3 ทำให้ข้อมูลบางส่วนคล้ายกับ `smart_farm_mini_game` ได้ หากระบบตรวจเจอ smartSummary ก่อน อาจทำให้ผลงานบทที่ 4 ถูกแสดงเป็นบทที่ 3

ผลกระทบที่อาจเกิดขึ้นคือ

```text
บทที่ 4 ถูกแสดงเป็นงานบทที่ 3
ปุ่มเล่นพาไปหน้า play_smart_farm_work.php
แต่หน้านั้นอาจรองรับเฉพาะ game_id = 3
ทำให้เล่นผลงานไม่ได้ หรือแสดงผิดบท
```

ดังนั้นการเลือก renderer ต้องใช้ `game_id` เป็นหลักก่อนเสมอ

## 2.3 บทที่ 4 ยังชนกันระหว่าง Debug Lite เดิมกับ Debug Mode ใหม่

ก่อนหน้านี้บทที่ 4 เคยพัฒนาเป็น Debug Lite หรือ Smart Farm Debugger แยกต่างหาก แต่แนวทางล่าสุดเปลี่ยนเป็นการยกฐานเกมสายพานของบทที่ 3 มาใช้ แล้วเปลี่ยนเป็นโหมดซ่อมกฎ หรือ Smart Farm Debug Mode

หากระบบโชว์ผลงานยังรองรับเฉพาะ `smart_farm_debug_lite_challenge` หรือยังโหลด engine เดิม เช่น `smart_farm_debugger_lite.js`, `debug_challenge_preview.js`, `smart_farm_debugger_lite.css` จะไม่ตรงกับบทที่ 4 ตัวจริงในปัจจุบัน

แนวทางใหม่ควรกำหนดชนิดผลงานบทที่ 4 ให้ชัดเจน เช่น

```text
project_type = smart_farm_debug_mode
```

และแก้ทุกส่วนที่เกี่ยวข้องให้รองรับชนิดนี้เป็นค่า default ของบทที่ 4

## 2.4 Preview ของแต่ละบทใช้ระบบกลางมากเกินไป

ปัจจุบันระบบ preview มีแนวโน้มใช้ฟังก์ชันกลาง เช่น mini canvas หรือ structured preview แบบเดียวกันกับหลายบท ซึ่งทำให้เกิดปัญหา เช่น

- วัตถุหรือ badge ทับกัน
- preview บนมือถืออ่านยาก
- ข้อมูลบางบทแสดงไม่ครบ
- บทที่มีข้อมูลซับซ้อนถูกย่อจนไม่สื่อความหมาย
- บทที่ 4 อาจพยายาม render เกมเต็ม ทั้งที่ควรเป็นการ์ดสรุปโจทย์ซ่อมกฎ

ระบบโชว์ผลงานควรมี preview เฉพาะบท ไม่ควรใช้ renderer เดียวเดาทุก schema

## 2.5 Modal ใช้ข้อความกลางเกินไป

หัวข้อใน modal บางจุดอาจใช้ข้อความกลาง เช่น “กติกาและเงื่อนไขของด่าน” แต่ผลงานแต่ละบทมีลักษณะต่างกัน จึงควรเปลี่ยนหัวข้อตามบท เช่น

| บท | หัวข้อที่เหมาะสม |
|---|---|
| บทที่ 1 | เงื่อนไขของโจทย์ |
| บทที่ 2 | ภารกิจเส้นทางรถไถ |
| บทที่ 3 | กติกาด่านสายพาน |
| บทที่ 4 | รายละเอียดโจทย์ซ่อมกฎ |

## 2.6 Auto-refresh อาจทำให้การแสดงผลไม่นิ่ง

หากหน้า showcase refresh รายการผลงานบ่อยเกินไป เช่น ทุก 10 วินาที อาจทำให้เกิดปัญหา UX ได้แก่ การ์ดผลงานกระพริบ, preview โหลดใหม่บ่อย, เด็กกำลังอ่านอยู่แล้วรายการเปลี่ยน, scroll position ขยับ, modal หรือ preview เกิดอาการเด้ง และใช้งานบนมือถือไม่ลื่น

ควรปรับเป็น refresh แบบนุ่มนวล หรือ refresh เฉพาะเมื่อมีข้อมูลใหม่จริง ๆ

---

# 3. เป้าหมายของการพัฒนา

## 3.1 เป้าหมายด้านโครงสร้างระบบ

1. แยก renderer ตาม `game_id` ให้ชัดเจน
2. ลดการเดาชนิดผลงานจาก `work_data`
3. ทำให้บทหนึ่งแก้ไขได้โดยไม่กระทบบทอื่น
4. รองรับ schema ของแต่ละบทอย่างเป็นระบบ
5. เพิ่ม fallback เมื่อข้อมูลเก่าหรือข้อมูลเสีย
6. ป้องกันปุ่มเล่นพาไปผิดหน้า

## 3.2 เป้าหมายด้าน UI/UX

1. หน้าโชว์ผลงานแสดงผลงานแต่ละบทอย่างเหมาะสม
2. Preview ไม่ซ้อน ไม่ล้น ไม่พังบนมือถือ
3. Modal แสดงข้อมูลตรงกับบทเรียน
4. ปุ่มเล่นเข้าใจง่ายและพาไปหน้าถูกต้อง
5. กรณีข้อมูลเสียต้องมีข้อความบอกชัดเจน
6. การ refresh ไม่รบกวนผู้ใช้

## 3.3 เป้าหมายด้านบทที่ 4

1. บทที่ 4 ต้องแสดงเป็น Smart Farm Debug Mode ไม่ใช่บทที่ 3
2. บทที่ 4 ต้องใช้ `project_type = smart_farm_debug_mode`
3. หน้าเล่นผลงานของเพื่อนสำหรับบทที่ 4 ต้องโหลด engine ที่ตรงกับ Debug Mode
4. Preview บทที่ 4 ควรเป็นการ์ดสรุปโจทย์ซ่อมกฎ ไม่จำเป็นต้อง render เกมเต็ม
5. ต้องยังรองรับงานเก่าแบบ Debug Lite เป็น fallback ได้ หากมีข้อมูลเก่าในระบบ

---

# 4. แนวทางโครงสร้างใหม่

## 4.1 ใช้ `game_id` เป็นตัวเลือก renderer หลัก

ห้ามเลือก renderer จาก summary ที่ตรวจเจอก่อนเพียงอย่างเดียว ให้ใช้แนวทางนี้แทน

```javascript
const ShowcaseRenderers = {
  1: LogicShowcaseRenderer,
  2: TractorRouteShowcaseRenderer,
  3: SmartFarmShowcaseRenderer,
  4: DebugModeShowcaseRenderer
};

const renderer = ShowcaseRenderers[GAME_ID] || DefaultShowcaseRenderer;
```

จากนั้น renderer ของแต่ละบทค่อยตรวจ `project_type` ภายในอีกครั้ง

## 4.2 กำหนดหน้าที่ของ renderer แต่ละบท

แต่ละ renderer ควรมี function หลักเหมือนกัน เพื่อให้ระบบกลางเรียกใช้ง่าย

```javascript
const Renderer = {
  normalize(work) {},
  getSummary(workData) {},
  renderCardPreview(workData, container) {},
  renderBadges(summary) {},
  renderModal(work, workData) {},
  getPlayUrl(work, workData) {},
  getCreateUrl() {},
  validate(workData) {}
};
```

ข้อดีคือหน้า `showcase.php` ไม่ต้องรู้รายละเอียดลึกของแต่ละบท เพียงส่งข้อมูลให้ renderer ของบทนั้นจัดการ

## 4.3 แยก renderer เป็นไฟล์ย่อย

แนวทางที่แนะนำคือแยกไฟล์ JavaScript ของ showcase เป็นหลายไฟล์

```text
assets/js/showcase/showcase_core.js
assets/js/showcase/showcase_renderer_logic.js
assets/js/showcase/showcase_renderer_tractor.js
assets/js/showcase/showcase_renderer_smart_farm.js
assets/js/showcase/showcase_renderer_debug_mode.js
```

หรือถ้ายังไม่ต้องการแยกไฟล์มาก ให้ทำเป็น object ภายใน `showcase.php` ก่อน แต่ควรวางโครงให้พร้อมแยกในอนาคต

---

# 5. มาตรฐาน `project_type` ของแต่ละบท

ควรกำหนดชนิดผลงานให้ชัดเจน เพื่อป้องกันการสับสน

| บท | ชื่อบทโดยย่อ | project_type ที่ควรใช้ |
|---|---|---|
| บทที่ 1 | เหตุผลเชิงตรรกะ | `logic_sorting_scene` หรือชนิดเดิมของบท 1 |
| บทที่ 2 | อัลกอริทึมพื้นฐาน | `tractor_route` |
| บทที่ 3 | เกมสายพานฟาร์ม | `smart_farm_mini_game` |
| บทที่ 4 | ซ่อมกฎฟาร์ม | `smart_farm_debug_mode` |

หมายเหตุ: หากบทที่ 1 ยังใช้ข้อมูลแบบ array layout เดิมและไม่มี `project_type` ชัดเจน ควรเพิ่ม function normalize เพื่อแปลงเป็น schema กลางก่อนแสดงผล

---

# 6. แผนปรับปรุงบทที่ 4 ในระบบโชว์ผลงาน

## 6.1 กำหนด schema ใหม่ของบทที่ 4

ตัวอย่าง `work_data` สำหรับบทที่ 4

```json
{
  "project_type": "smart_farm_debug_mode",
  "base_engine": "smart_farm_mini_game",
  "title": "โจทย์ซ่อมกฎคัดส้ม",
  "stage_id": 11,
  "level_id": "11-1",
  "logic_type": "if_else",
  "bug_type": "wrong_else_action",
  "mission": "ช่วยซ่อมกฎคัดส้ม",
  "problem": "ส้มเล็กถูกส่งเข้ากล่องพรีเมียม",
  "broken_rules": [
    {
      "slot": "if",
      "condition": "big_orange",
      "action": "premium_box"
    },
    {
      "slot": "else",
      "action": "premium_box"
    }
  ],
  "fixed_rules": [
    {
      "slot": "if",
      "condition": "big_orange",
      "action": "premium_box"
    },
    {
      "slot": "else",
      "action": "juice_box"
    }
  ],
  "items": [],
  "tested": true,
  "test_result": {
    "total": 8,
    "wrong": 0,
    "passed": true
  }
}
```

## 6.2 Preview บทที่ 4 ควรเป็นการ์ดสรุป

ไม่ควร render เกมเต็มในหน้า showcase เพราะจะทำให้ซับซ้อนและเสี่ยง layout พัง

รูปแบบ preview ที่แนะนำ

```text
โจทย์ซ่อมกฎฟาร์ม
ด่าน: ส้มใหญ่ / ส้มเล็ก
ประเภทจุดผิด: คำสั่งกรณีอื่นผิด
อาการ: ส้มเล็กถูกส่งเข้ากล่องพรีเมียม
สถานะ: ทดสอบแล้ว
```

พร้อมปุ่ม

```text
เล่นโจทย์ซ่อมกฎของเพื่อน
```

## 6.3 Modal บทที่ 4

หัวข้อ modal ควรเป็น

```text
รายละเอียดโจทย์ซ่อมกฎ
```

ข้อมูลที่ควรแสดงใน modal

1. ชื่อโจทย์
2. ด่านหรือระดับ
3. ประเภทจุดผิดเป็นภาษาไทย
4. อาการที่พบ
5. กฎเดิมที่น่าสงสัย
6. เป้าหมายที่ควรซ่อม
7. สถานะการทดสอบ
8. ปุ่มเล่นโจทย์ของเพื่อน

ไม่ควรแสดง JSON ดิบหรือ key ภาษาอังกฤษ เช่น `wrong_else_action` ต่อผู้เรียน

## 6.4 หน้าเล่นผลงานของเพื่อนสำหรับบทที่ 4

ให้ปรับ `pages/play_debug_work.php` หรือสร้างหน้าใหม่ให้รองรับ `smart_farm_debug_mode`

เงื่อนไขที่ควรตรวจ

```php
$decoded = json_decode($work['work_data'], true);

if (($work['game_id'] ?? null) != 4) {
    $error = 'ผลงานนี้ไม่ใช่ผลงานบทที่ 4';
}

if (($decoded['project_type'] ?? '') !== 'smart_farm_debug_mode') {
    $error = 'ผลงานนี้ไม่ใช่โจทย์ซ่อมกฎฟาร์ม';
}
```

ไฟล์ที่ควรโหลด

```html
<link rel="stylesheet" href="../assets/css/conveyor_logic.css">
<link rel="stylesheet" href="../assets/css/conveyor_debug_mode.css">

<script src="../assets/js/logic_game/conveyor_drag_drop.js"></script>
<script src="../assets/js/logic_game/conveyor_debug_mode.js"></script>
```

ไม่ควรโหลด engine ของ Debug Lite เป็นค่า default หากบทที่ 4 เปลี่ยนมาใช้ Debug Mode แล้ว

---

# 7. แผนปรับปรุง `showcase.php`

## 7.1 แยกส่วนรับผิดชอบ

หน้า `showcase.php` ควรรับผิดชอบเฉพาะ

1. อ่าน `game_id`
2. โหลด metadata ของบทเรียน
3. แสดง header
4. แสดงปุ่มสร้างผลงาน
5. โหลดผลงานจาก API
6. ส่งข้อมูลให้ renderer ของบทนั้น
7. แสดง modal กลาง
8. จัดการ error และ empty state

ไม่ควรให้ `showcase.php` เป็นที่รวม logic ของทุกบทแบบละเอียด

## 7.2 ตัวอย่างโครงสร้างใหม่

```javascript
const GAME_ID = Number(new URLSearchParams(location.search).get('game_id') || 1);

const renderer = ShowcaseRenderers[GAME_ID] || DefaultShowcaseRenderer;

async function loadShowcase() {
  const works = await fetchWorks(GAME_ID);
  renderGallery(works, renderer);
}

function renderGallery(works, renderer) {
  gallery.innerHTML = '';

  works.forEach(work => {
    const parsed = safeParseWorkData(work.work_data);
    const normalized = renderer.normalize(work, parsed);
    const card = renderer.renderCard(work, normalized);
    gallery.appendChild(card);
  });
}
```

## 7.3 ห้ามให้บทที่ 4 ถูกจับเป็นบทที่ 3

ใน renderer ของบทที่ 3 ต้องตรวจว่าเป็น `game_id = 3` และ `project_type = smart_farm_mini_game` เท่านั้น

ใน renderer ของบทที่ 4 ต้องตรวจว่าเป็น `game_id = 4` และ `project_type = smart_farm_debug_mode`

หากบทที่ 4 มี `base_engine = smart_farm_mini_game` ห้ามนำไปใช้ตัดสินว่าเป็นบทที่ 3 เพราะ `base_engine` เป็นเพียงข้อมูลอ้างอิง ไม่ใช่ชนิดผลงาน

---

# 8. แผนปรับปรุง `api/save_work.php`

## 8.1 เพิ่ม validation ของบทที่ 4

ให้เพิ่ม `smart_farm_debug_mode` ในรายการ `project_type` ที่บทที่ 4 อนุญาต

ตัวอย่าง field ที่ควรมี

```text
project_type
title
stage_id หรือ level_id
logic_type
bug_type
broken_rules
fixed_rules
items หรือ item_set
tested
test_result
```

## 8.2 ป้องกันบทที่ 3 ปลอมเป็นบทที่ 4

หาก `game_id = 4` แต่ `project_type = smart_farm_mini_game` ควรไม่ผ่าน validation ยกเว้นมีการระบุว่าเป็น debug mode ชัดเจน เช่น

```json
{
  "project_type": "smart_farm_debug_mode",
  "base_engine": "smart_farm_mini_game"
}
```

## 8.3 รองรับข้อมูลเก่า

หากมีผลงานเก่าชนิด

```text
smart_farm_debug_lite_challenge
smart_farm_debug_challenge
```

ให้รองรับแบบ fallback เพื่อไม่ให้ข้อมูลเดิมหาย แต่ไม่ควรใช้เป็นค่า default ของงานใหม่

---

# 9. แผนปรับปรุง preview รายบท

## 9.1 บทที่ 1

ลักษณะ preview ที่ควรใช้

- ใช้ mini canvas หรือฉากวัตถุได้
- ต้องจำกัด badge ไม่ให้ทับ object
- ถ้า object เยอะ ให้ย่อเป็นรายการสรุปแทน
- ข้อความต้องไม่ล้น card

หัวข้อ modal

```text
เงื่อนไขของโจทย์
```

## 9.2 บทที่ 2

ลักษณะ preview ที่ควรใช้

- แสดงแผนที่หรือเส้นทางรถไถ
- แสดงจุดเริ่มต้นและเป้าหมาย
- แสดงจำนวนขั้นตอนโดยย่อ
- ปุ่มเล่นต้องไป `play_student_work.php`

หัวข้อ modal

```text
ภารกิจเส้นทางรถไถ
```

## 9.3 บทที่ 3

ลักษณะ preview ที่ควรใช้

- ใช้ Smart Farm Builder Preview เดิมได้
- แสดงชื่อด่าน สินค้าที่คัดแยก และกฎโดยย่อ
- ปุ่มเล่นต้องไป `play_smart_farm_work.php`
- ต้องตรวจว่า `game_id = 3`

หัวข้อ modal

```text
กติกาด่านสายพาน
```

## 9.4 บทที่ 4

ลักษณะ preview ที่ควรใช้

- ใช้การ์ดสรุป ไม่ต้อง render เกมเต็ม
- แสดงประเภทจุดผิดเป็นภาษาไทย
- แสดงกฎเดิมและเป้าหมายแบบย่อ
- ปุ่มเล่นต้องไป `play_debug_work.php`
- ต้องตรวจว่า `game_id = 4`

หัวข้อ modal

```text
รายละเอียดโจทย์ซ่อมกฎ
```

---

# 10. แผนปรับปรุง modal

## 10.1 โครง modal กลาง

modal กลางสามารถใช้โครงเดิมได้ แต่ข้อมูลข้างในต้องมาจาก renderer เฉพาะบท

```javascript
function openWorkModal(work) {
  const parsed = safeParseWorkData(work.work_data);
  const renderer = ShowcaseRenderers[work.game_id] || ShowcaseRenderers[GAME_ID];
  modalBody.innerHTML = renderer.renderModal(work, parsed);
  modal.classList.add('is-open');
}
```

## 10.2 ปุ่มเล่นใน modal

ปุ่มเล่นต้องสร้างจาก renderer ของบทนั้นเท่านั้น

```javascript
const playUrl = renderer.getPlayUrl(work, parsed);
```

ห้ามสร้างปุ่มเล่นจากการตรวจเจอ summary แบบรวม เพราะอาจพาไปผิดหน้า

---

# 11. แผนปรับปรุง Auto-refresh

## 11.1 ปัญหาเดิม

หาก refresh บ่อยเกินไป จะรบกวนผู้ใช้และทำให้ preview โหลดใหม่ตลอดเวลา

## 11.2 แนวทางใหม่

1. เพิ่มเวลา refresh เป็น 30–60 วินาที
2. ห้าม refresh ขณะ modal เปิด
3. ห้าม refresh ขณะผู้ใช้กำลัง hover, focus หรือ scroll
4. ใช้ timestamp หรือ hash เพื่อตรวจว่าข้อมูลเปลี่ยนจริงหรือไม่
5. ถ้าข้อมูลไม่เปลี่ยน ไม่ต้อง render ใหม่
6. หาก fetch ล้มเหลว ให้แสดงข้อความ error แบบไม่ล้าง gallery เดิม

## 11.3 ข้อความกรณีโหลดล้มเหลว

```text
ยังโหลดผลงานใหม่ไม่ได้
กรุณาลองอีกครั้ง หรือรีเฟรชหน้า
```

---

# 12. ระบบ fallback เมื่อข้อมูลผิด schema

## 12.1 กรณี JSON parse ไม่ได้

ให้แสดง fallback card

```text
ไม่สามารถแสดงตัวอย่างผลงานนี้ได้
ข้อมูลชิ้นงานอาจเป็นรูปแบบเก่าหรือไม่สมบูรณ์
```

พร้อมปุ่ม

```text
ดูข้อมูลพื้นฐาน
```

## 12.2 กรณี project_type ไม่รองรับ

ให้แสดง

```text
ผลงานนี้ใช้รูปแบบข้อมูลที่ระบบยังไม่รองรับ
กรุณาแก้ไขหรือส่งงานใหม่
```

## 12.3 กรณีบทที่ 4 เจองาน Debug Lite เก่า

ให้แสดง badge

```text
รูปแบบเก่า
```

และยังเปิดดูได้เท่าที่ทำได้ แต่ถ้าเล่นไม่ได้ต้องบอกชัดเจน

```text
ผลงานนี้สร้างจากระบบซ่อมกฎรุ่นเก่า อาจไม่สามารถเล่นด้วยโหมดใหม่ได้
```

---

# 13. ไฟล์ที่ต้องตรวจและปรับปรุง

## 13.1 ไฟล์หลัก

```text
pages/showcase.php
pages/play_student_work.php
pages/play_smart_farm_work.php
pages/play_debug_work.php
api/save_work.php
api/get_showcase_works.php
```

## 13.2 ไฟล์ JavaScript ที่เกี่ยวข้อง

```text
assets/js/showcase/*.js
assets/js/logic_game/conveyor_debug_mode.js
assets/js/logic_game/conveyor_drag_drop.js
assets/js/logic_game/debug_challenge_preview.js
assets/js/logic_game/smart_farm_builder_preview.js
```

## 13.3 ไฟล์ CSS ที่เกี่ยวข้อง

```text
assets/css/showcase.css
assets/css/conveyor_logic.css
assets/css/conveyor_debug_mode.css
assets/css/smart_farm_showcase.css
```

## 13.4 ไฟล์สร้างผลงาน

```text
pages/create_project_logic.php
pages/create_project_algo.php
pages/create_project_condition.php
pages/create_project_debug.php
```

## 13.5 ฐานข้อมูลหรือ seed

```text
database.sql
migrations/*
seeders/*
games table
stages table
student_works table
```

---

# 14. ลำดับการพัฒนา

## Phase 1: ตรวจระบบเดิม

งานที่ต้องทำ

1. เปิด `pages/showcase.php`
2. ไล่ดู function parse, summary, preview, modal, play button
3. ตรวจว่ามีการเลือก renderer จากอะไร
4. ตรวจว่าปุ่มเล่นแต่ละบทพาไปหน้าใด
5. ตรวจ project_type ที่ระบบรองรับ
6. ตรวจข้อมูลเก่าของบทที่ 4

ผลลัพธ์ที่ต้องได้

- รายการปัญหาแยกตามบท
- รู้จุดที่บทที่ 4 ชนกับบทที่ 3
- รู้ไฟล์ที่ต้องแก้จริง

## Phase 2: สร้าง renderer แยกตามบท

งานที่ต้องทำ

1. สร้าง `ShowcaseRenderers`
2. สร้าง renderer สำหรับบท 1
3. สร้าง renderer สำหรับบท 2
4. สร้าง renderer สำหรับบท 3
5. สร้าง renderer สำหรับบท 4
6. ปรับ `renderGallery()` ให้เรียก renderer ตาม `GAME_ID`
7. ปรับ `openModal()` ให้เรียก renderer ตาม `GAME_ID`

ผลลัพธ์ที่ต้องได้

- ระบบไม่เดาผลงานผิดบท
- logic ของแต่ละบทแยกกันชัดเจน
- แก้บทหนึ่งไม่กระทบบทอื่นง่าย

## Phase 3: แก้ preview รายบท

งานที่ต้องทำ

1. ปรับ preview บทที่ 1 ให้ badge ไม่ทับ
2. ปรับ preview บทที่ 2 ให้แสดง route ชัด
3. ปรับ preview บทที่ 3 ให้ใช้ Smart Farm preview เฉพาะบท
4. ปรับ preview บทที่ 4 เป็นการ์ดสรุปโจทย์ซ่อมกฎ
5. เพิ่ม fallback card

ผลลัพธ์ที่ต้องได้

- preview ทุกบทอ่านง่าย
- ไม่ซ้อน ไม่ล้น
- มือถือดูได้
- บทที่ 4 ไม่ถูกแสดงเป็นบทที่ 3

## Phase 4: แก้ปุ่มเล่นและหน้าเล่นผลงาน

งานที่ต้องทำ

1. ตรวจปุ่มเล่นของบท 1
2. ตรวจปุ่มเล่นของบท 2
3. ตรวจปุ่มเล่นของบท 3
4. ตรวจปุ่มเล่นของบท 4
5. แก้ `play_debug_work.php` ให้รองรับ `smart_farm_debug_mode`
6. ตรวจว่าแต่ละหน้าเล่นตรวจ `game_id` ถูกต้อง
7. ตรวจปุ่มกลับจากหน้าเล่นไป showcase ที่ถูกบท

ผลลัพธ์ที่ต้องได้

- ปุ่มเล่นไม่พาไปผิดหน้า
- บทที่ 4 เล่นด้วย Debug Mode ใหม่ได้
- งานเก่ามี fallback

## Phase 5: แก้ modal

งานที่ต้องทำ

1. เปลี่ยนหัวข้อ modal ตามบท
2. ปรับข้อมูลใน modal ให้เหมาะกับบท
3. ปรับปุ่มเล่นใน modal ให้ใช้ renderer ของบทนั้น
4. เพิ่ม fallback modal หากข้อมูลเสีย
5. ตรวจการแสดงผลบนมือถือ

ผลลัพธ์ที่ต้องได้

- modal ทุกบทแสดงข้อมูลตรงเรื่อง
- ไม่มีข้อความกลางที่ทำให้สับสน
- ไม่มี JSON ดิบหรือ key เทคนิคในหน้าผู้เรียน

## Phase 6: แก้ API และ validation

งานที่ต้องทำ

1. ตรวจ `api/save_work.php`
2. เพิ่ม `smart_farm_debug_mode`
3. ตรวจ validation ของบท 1–4
4. ป้องกันบทที่ 3/4 ปนกัน
5. ตรวจ `api/get_showcase_works.php` ว่าส่งข้อมูลพอสำหรับ renderer
6. ตรวจ permission และ status ของผลงาน

ผลลัพธ์ที่ต้องได้

- บันทึกงานทุกบทได้ถูกต้อง
- อ่านงานทุกบทได้ถูกต้อง
- บทที่ 4 ไม่ใช้ schema เก่าผิดที่
- API ไม่ทำให้ preview พัง

## Phase 7: ปรับ auto-refresh

งานที่ต้องทำ

1. ลดความถี่ refresh
2. ห้าม refresh ตอน modal เปิด
3. ห้าม refresh ตอนผู้ใช้ interact
4. ตรวจว่าข้อมูลเปลี่ยนจริงก่อน render ใหม่
5. เพิ่ม error handling

ผลลัพธ์ที่ต้องได้

- หน้าโชว์ผลงานนิ่งขึ้น
- ไม่รบกวนการอ่านผลงาน
- โหลดข้อมูลใหม่ได้โดยไม่กระพริบ

## Phase 8: ทดสอบรวมทุกบท

งานที่ต้องทำ

1. เปิด showcase บทที่ 1
2. เปิด showcase บทที่ 2
3. เปิด showcase บทที่ 3
4. เปิด showcase บทที่ 4
5. ตรวจ preview
6. ตรวจ modal
7. ตรวจปุ่มเล่น
8. ตรวจหน้าเล่นผลงานของเพื่อน
9. ตรวจมือถือ
10. ตรวจงานเก่า
11. ตรวจงานข้อมูลเสีย
12. ตรวจกรณีไม่มีผลงาน

ผลลัพธ์ที่ต้องได้

- ทุกบทแสดงผลถูกต้อง
- ไม่มี console error
- ปุ่มเล่นถูกหน้า
- หน้าไม่พังบนมือถือ
- fallback ทำงาน

---

# 15. Acceptance Criteria

## 15.1 ด้านโครงสร้าง

- มี renderer แยกตาม `game_id`
- ไม่เลือก preview จาก summary ที่ตรวจเจอแบบสุ่ม
- บทที่ 4 ไม่ถูกจับเป็นบทที่ 3
- `showcase.php` ไม่รวม logic ทุกบทแบบกระจัดกระจาย
- มี fallback สำหรับข้อมูลผิด schema

## 15.2 ด้าน preview

- บทที่ 1 preview ไม่ซ้อน
- บทที่ 2 preview route อ่านง่าย
- บทที่ 3 preview สายพานถูกต้อง
- บทที่ 4 preview เป็นการ์ดสรุปโจทย์ซ่อมกฎ
- ทุก preview ใช้งานได้บนมือถือ

## 15.3 ด้าน modal

- modal ใช้หัวข้อเฉพาะบท
- ข้อมูลใน modal ตรงกับผลงาน
- ปุ่มเล่นใน modal ถูกต้อง
- ไม่มี JSON ดิบแสดงต่อผู้เรียน
- ไม่มี key เทคนิคที่เด็กไม่เข้าใจ

## 15.4 ด้านปุ่มเล่น

| บท | หน้าเล่นที่ควรไป |
|---|---|
| บทที่ 1 | หน้าเล่นผลงานบทที่ 1 |
| บทที่ 2 | `play_student_work.php` |
| บทที่ 3 | `play_smart_farm_work.php` |
| บทที่ 4 | `play_debug_work.php` |

## 15.5 ด้านบทที่ 4

- รองรับ `smart_farm_debug_mode`
- แสดงประเภทจุดผิดเป็นภาษาไทย
- preview ไม่ใช้ renderer ของบทที่ 3
- หน้าเล่นโหลด Debug Mode ใหม่
- งาน Debug Lite เก่ายังแสดง fallback ได้

## 15.6 ด้านเทคนิค

- ไม่มี JavaScript error
- ไม่มี PHP warning
- API ส่งข้อมูลถูกต้อง
- mobile responsive ใช้งานได้
- auto-refresh ไม่รบกวนผู้ใช้
- ไม่กระทบการบันทึกผลงาน

---

# 16. Test Cases

## Test Case 1: เปิดโชว์ผลงานบทที่ 1

ขั้นตอน

1. เข้า `showcase.php?game_id=1`
2. ตรวจการ์ดผลงาน
3. เปิด modal
4. กดปุ่มเล่น

ผลที่คาดหวัง

- preview ไม่ซ้อน
- modal ใช้หัวข้อ “เงื่อนไขของโจทย์”
- ปุ่มเล่นพาไปหน้าที่ถูกต้อง

## Test Case 2: เปิดโชว์ผลงานบทที่ 2

ขั้นตอน

1. เข้า `showcase.php?game_id=2`
2. ตรวจ preview เส้นทางรถไถ
3. เปิด modal
4. กดเล่นผลงาน

ผลที่คาดหวัง

- preview แสดงเส้นทางถูกต้อง
- modal ใช้หัวข้อ “ภารกิจเส้นทางรถไถ”
- ปุ่มเล่นไป `play_student_work.php`

## Test Case 3: เปิดโชว์ผลงานบทที่ 3

ขั้นตอน

1. เข้า `showcase.php?game_id=3`
2. ตรวจ preview เกมสายพาน
3. เปิด modal
4. กดเล่นผลงาน

ผลที่คาดหวัง

- preview เป็น Smart Farm Mini Game
- modal ใช้หัวข้อ “กติกาด่านสายพาน”
- ปุ่มเล่นไป `play_smart_farm_work.php`
- ไม่ปนกับบทที่ 4

## Test Case 4: เปิดโชว์ผลงานบทที่ 4

ขั้นตอน

1. เข้า `showcase.php?game_id=4`
2. ตรวจ preview โจทย์ซ่อมกฎ
3. เปิด modal
4. กดเล่นผลงาน

ผลที่คาดหวัง

- preview เป็นการ์ดสรุปโจทย์ซ่อมกฎ
- modal ใช้หัวข้อ “รายละเอียดโจทย์ซ่อมกฎ”
- ปุ่มเล่นไป `play_debug_work.php`
- ไม่ถูกส่งไป `play_smart_farm_work.php`
- ไม่แสดง `wrong_condition` หรือ key อังกฤษบน UI เด็ก

## Test Case 5: ตรวจงานข้อมูลเสีย

ขั้นตอน

1. สร้างหรือจำลอง work_data ที่ parse ไม่ได้
2. เปิดหน้า showcase
3. ดูการ์ดผลงาน

ผลที่คาดหวัง

- ระบบไม่พัง
- แสดง fallback card
- ไม่มี console error

## Test Case 6: ตรวจ auto-refresh

ขั้นตอน

1. เปิดหน้า showcase
2. เปิด modal ค้างไว้
3. รอ 60 วินาที
4. ปิด modal
5. สังเกต gallery

ผลที่คาดหวัง

- ไม่ refresh ขณะ modal เปิด
- gallery ไม่กระพริบ
- ไม่ล้างข้อมูลเดิมเมื่อ fetch ล้มเหลว

---

# 17. Prompt สำหรับสั่ง Codex

```text
ตรวจสอบและปรับปรุงระบบลานโชว์ผลงานของทุกบท เนื่องจากพบปัญหาการแสดงผล preview, ปุ่มเล่น, modal และข้อมูลบทเรียนไม่สอดคล้องกัน โดยเฉพาะบทที่ 4 ที่เปลี่ยนมาใช้ Smart Farm Debug Mode ซึ่งใช้ฐานเกมบทที่ 3 แต่ต้องแยกเป็นโหมดซ่อมกฎของบทที่ 4

เป้าหมาย:
1. ทำให้ showcase.php รองรับผลงานแต่ละบทอย่างถูกต้อง
2. แยก renderer ตาม game_id ไม่ใช่เดาจาก project_type อย่างเดียว
3. แก้บทที่ 4 ให้ใช้ Smart Farm Debug Mode ตัวจริง ไม่ใช่ Debug Lite เดิม
4. ป้องกันปัญหาปุ่มเล่นพาไปผิดหน้า
5. ปรับ preview ให้ไม่ซ้อน ไม่พัง และอ่านง่ายบนมือถือ
6. เพิ่ม fallback หาก work_data ไม่ตรง schema หรือ parse ไม่ได้
7. ไม่กระทบการส่งงานและการเล่นผลงานของเพื่อนในบทอื่น

งานที่ต้องทำ:

1. ตรวจ pages/showcase.php
- แยก logic การ render ตาม GAME_ID
- สร้าง ShowcaseRenderers หรือ adapter สำหรับบท 1, 2, 3, 4
- ห้ามให้บท 4 ถูกจับเป็น smartSummary ของบท 3
- ปรับ modal ให้ใช้หัวข้อและข้อมูลตามบท
- ปรับปุ่มเล่นให้เลือกจาก GAME_ID เป็นหลัก

2. ตรวจ project_type ของผลงาน
- บท 1 ใช้ project_type ของตนเองหรือ normalize ข้อมูล array layout เดิม
- บท 2 ใช้ tractor_route
- บท 3 ใช้ smart_farm_mini_game
- บท 4 ใช้ smart_farm_debug_mode
- หากพบ smart_farm_debug_lite_challenge เก่า ให้ยังรองรับแบบ fallback ได้ แต่ไม่ใช้เป็น default

3. แก้ play_debug_work.php
- ให้รองรับ smart_farm_debug_mode
- โหลด engine ของบท 4 ใหม่ เช่น conveyor_debug_mode.js และ CSS ที่เกี่ยวข้อง
- ไม่ควรใช้ smart_farm_debugger_lite.js เป็นค่า default ถ้าเลิกใช้ Debug Lite แล้ว
- ตรวจว่า game_id = 4 เท่านั้น
- ปุ่มกลับต้องกลับ showcase.php?game_id=4

4. แก้ api/save_work.php
- เพิ่ม project_type smart_farm_debug_mode ใน validation ของบทที่ 4
- ตรวจ field จำเป็นของบทที่ 4 เช่น title, logic_type, bug_type, broken_rules, fixed_rules, items, test_result/tested
- ห้ามทำให้ smart_farm_mini_game ของบท 3 ผ่านเป็นบท 4 โดยไม่ระบุ debug mode

5. ปรับ preview
- บท 1 ใช้ preview แบบฉาก/วัตถุได้ แต่ต้องจำกัด badge ไม่ให้ทับ
- บท 2 ใช้ route preview เดิมได้
- บท 3 ใช้ SmartFarmBuilderPreview เดิมได้
- บท 4 ใช้ preview แบบการ์ดสรุปโจทย์ซ่อมกฎ ไม่จำเป็นต้อง render เกมเต็ม
- ถ้า parse work_data ไม่ได้ ให้แสดง fallback card

6. ปรับ modal
- บท 1: หัวข้อ “เงื่อนไขของโจทย์”
- บท 2: หัวข้อ “ภารกิจเส้นทางรถไถ”
- บท 3: หัวข้อ “กติกาด่านสายพาน”
- บท 4: หัวข้อ “รายละเอียดโจทย์ซ่อมกฎ”
- ปุ่มเล่นใน modal ต้องตรงกับบท

7. ปรับ auto-refresh
- อย่า render gallery ใหม่ทั้งหมดทุก 10 วินาที
- เพิ่ม catch กรณี fetch ล้มเหลว
- ถ้าจะ refresh ให้เพิ่มเป็น 30–60 วินาที หรือ update เฉพาะเมื่อข้อมูลเปลี่ยน
- ห้าม refresh ขณะผู้ใช้กำลังอ่านหรือเปิด modal

8. ทดสอบ
- เปิด showcase.php?game_id=1
- เปิด showcase.php?game_id=2
- เปิด showcase.php?game_id=3
- เปิด showcase.php?game_id=4
- ตรวจ card preview ทุกบท
- ตรวจ modal ทุกบท
- ตรวจปุ่มเล่นของแต่ละบท
- ตรวจบนมือถือ
- ตรวจกรณี work_data เก่า
- ตรวจกรณีไม่มีผลงาน
- ตรวจกรณี fetch API ล้มเหลว

หลังแก้ไข ให้สรุป:
1. ไฟล์ที่แก้
2. ปัญหาที่พบในแต่ละบท
3. project_type ที่รองรับ
4. ปุ่มเล่นของแต่ละบทไปหน้าใด
5. วิธีทดสอบทีละบท
```

---

# 18. สรุป

แนวทางแก้ระบบโชว์ผลงานที่ถูกต้องคือไม่ควรไล่แก้เฉพาะ CSS หรือเฉพาะฟังก์ชัน preview จุดใดจุดหนึ่ง แต่ควรปรับโครงสร้างให้ใช้หลัก

```text
game_id → renderer เฉพาะบท → preview เฉพาะบท → modal เฉพาะบท → play page เฉพาะบท
```

โดยเฉพาะบทที่ 4 ต้องแยกออกจากบทที่ 3 อย่างชัดเจน แม้จะใช้ฐาน engine เดียวกัน เพราะบทที่ 3 คือการสร้างกฎ ส่วนบทที่ 4 คือการซ่อมกฎ หากระบบโชว์ผลงานยังเดาจากข้อมูลคล้ายกัน จะเกิดปัญหาปุ่มเล่นผิดหน้าและ preview ผิดบทต่อไป

เมื่อพัฒนาตามแผนนี้ ระบบโชว์ผลงานจะมีความยืดหยุ่น รองรับทุกบทได้ดีขึ้น ลดปัญหาแสดงผลผิด และทำให้การแสดงผลงานของนักเรียนมีความชัดเจน น่าใช้ และเหมาะกับการใช้งานจริงในชั้นเรียนมากขึ้น
