# แผนพัฒนา Hybrid UI + Phaser สำหรับบทที่ 2: เส้นทางเดินรถไถ

> เอกสารนี้เป็นแผนพัฒนาสำหรับปรับปรุงบทที่ 2 “เส้นทางเดินรถไถ” หลังการทดสอบพบว่าแนวทางเดิมที่ใช้ **HTML/Bootstrap ทำ UI** และใช้ **Phaser ทำเฉพาะสนามเกม** ให้ผลลัพธ์คมชัด เหมาะกับภาษาไทย และใช้งานได้ดีกว่าการวาดทุกอย่างใน Phaser Canvas

---

## 1. ข้อสรุปแนวทางที่เลือกใช้

ให้ใช้แนวทางเดิมของเกม “เดินหน้าสู่แปลงนา” เป็นฐานหลัก

```text
HTML / Bootstrap
    ใช้สำหรับ UI, ข้อความไทย, ปุ่มคำสั่ง, กล่องคำสั่ง, feedback, ภารกิจ

Phaser Canvas
    ใช้สำหรับกระดานเกม, รถไถ, เป้าหมาย, อุปสรรค, ผลผลิต, animation
```

หลักสำคัญคือ **ไม่ควรย้าย UI ทั้งหมดเข้าไปใน Phaser Canvas** เพราะจะทำให้ข้อความไทยไม่คม วรรณยุกต์เสี่ยงเพี้ยน และจัด responsive ได้ยากกว่า HTML

---

## 2. เป้าหมายการพัฒนา

### 2.1 เป้าหมายด้านคุณภาพ UI

1. รักษาความคมชัดของ UI ด้วย HTML/Bootstrap
2. ลดการใช้ข้อความภาษาไทยใน Phaser Canvas
3. ใช้ Phaser เฉพาะส่วนที่ต้องเคลื่อนที่หรือมี interaction ของเกม
4. ใช้ emoji เป็น asset ต้นแบบชั่วคราว
5. เตรียม code ให้เปลี่ยน emoji เป็นภาพ HD ได้ง่ายในอนาคต
6. ตั้งค่า Phaser ให้รองรับจอ HiDPI/Retina
7. แก้ปัญหาเมาส์อยู่บน canvas แล้วเลื่อนหน้าไม่ได้

### 2.2 เป้าหมายด้านเกม

พัฒนาเกมบทที่ 2 ให้ครบ 3 เกมหลัก

| ไฟล์ | ชื่อเกม | เป้าหมาย |
|---|---|---|
| `stage4.js` | เดินหน้าสู่แปลงนา | สั่งรถไถเดินทางไปถึงจุดหมาย |
| `stage5.js` | หลบหลีกกองฟาง | สั่งรถไถไปถึงจุดหมายโดยไม่ชนสิ่งกีดขวาง |
| `stage6.js` | เก็บเกี่ยวผลผลิต | สั่งรถไถเก็บผลผลิตให้ครบก่อนกลับโรงนา |

ทุกเกมต้องมีด่านย่อย 3 ด่าน และต้องส่งผลลัพธ์กลับระบบด้วย `window.sendResult()` หลังผ่านครบ 3 ด่านย่อยเท่านั้น

---

## 3. เหตุผลที่ใช้ HTML UI ร่วมกับ Phaser

### 3.1 HTML เหมาะกับ UI มากกว่า

HTML/Bootstrap เหมาะกับส่วนที่ต้องคมและอ่านง่าย เช่น

- ชื่อด่าน
- ภารกิจ
- เกร็ดความรู้
- feedback
- ปุ่มคำสั่งลูกศร
- กล่องเรียงคำสั่ง
- ปุ่มล้าง/รันคำสั่ง
- badge, alert, modal, result panel

### 3.2 Phaser เหมาะกับสนามเกม

Phaser ควรใช้กับส่วนที่เป็นเกมจริง เช่น

- วาดกระดาน grid
- แสดงรถไถ
- แสดงเป้าหมาย
- แสดงกองฟาง/หิน/ผลผลิต/โรงนา
- animation รถไถเคลื่อนที่
- effect ชน
- effect เก็บผลผลิต
- effect ผ่านด่าน

---

## 4. ปัญหาความคมชัดของ Phaser และแนวทางแก้

### 4.1 สาเหตุที่ภาพใน Phaser ดูไม่คม

1. Canvas มีขนาดเล็กแต่ถูก CSS ขยาย
2. ใช้ emoji เป็น sprite ทำให้คุณภาพขึ้นกับระบบปฏิบัติการ
3. asset ภาพต้นฉบับความละเอียดต่ำ
4. ไม่ได้ตั้งค่า `resolution` ตาม `devicePixelRatio`
5. ใช้ข้อความไทยใน canvas ทำให้ font render ไม่สมบูรณ์
6. ภาพถูก scale ขึ้นเกินขนาดต้นฉบับ

### 4.2 แนวทางแก้ระยะสั้น

- ใช้ emoji เป็น prototype ต่อได้
- รวม emoji ไว้ใน `ASSET_MAP`
- ใส่ TODO ไว้ชัดเจนว่าเป็น placeholder
- ใช้ HTML แสดงข้อความไทยทั้งหมด
- ตั้งค่า Phaser ให้รองรับ DPR/HiDPI

### 4.3 แนวทางแก้ระยะกลาง

เมื่อพร้อม ให้เปลี่ยน emoji เป็นภาพ asset จริง เช่น

```text
tractor.webp
basket.webp
hay.webp
rock.webp
barn.webp
crop.webp
field_tile.webp
```

ภาพควรมีขนาดอย่างน้อย 2 เท่าของขนาดที่แสดงจริง เช่น ถ้าต้องแสดง 64x64 px ให้เตรียมภาพอย่างน้อย 128x128 px

---

## 5. การตั้งค่า Phaser เพื่อให้ภาพคมขึ้น

ให้ใช้ config ประมาณนี้

```javascript
const DPR = Math.min(window.devicePixelRatio || 1, 2);

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-canvas',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    resolution: DPR,
    antialias: true,
    roundPixels: true,
    transparent: true,
    scene: MainScene,
    input: {
        mouse: {
            preventDefaultWheel: false
        },
        touch: {
            capture: false
        }
    }
};
```

และกำหนด CSS ไม่ให้ canvas ถูกขยายเกินจริง

```css
#phaser-canvas canvas {
    width: 480px;
    height: 400px;
    max-width: 100%;
    image-rendering: auto;
}
```

---

## 6. การแก้ปัญหา scroll เมื่อเมาส์อยู่บน Phaser Canvas

เพิ่ม CSS

```css
#phaser-canvas,
#phaser-canvas canvas {
    touch-action: pan-y;
}
```

และใน Phaser config ให้ใส่

```javascript
input: {
    mouse: {
        preventDefaultWheel: false
    },
    touch: {
        capture: false
    }
}
```

เหตุผล: บทที่ 2 ใช้ปุ่ม HTML เป็นตัวสั่งรถไถ ไม่ได้ลาก object ใน canvas เป็นหลัก จึงควรอนุญาตให้เลื่อนหน้าเว็บได้ตามปกติ

---

## 7. การจัดการภาษาไทย

### 7.1 หลักการ

ข้อความภาษาไทยสำคัญทั้งหมดควรอยู่ใน HTML ไม่ใช่ Phaser Canvas

ใช้ HTML สำหรับ

- ชื่อเกม
- ชื่อด่านย่อย
- ภารกิจ
- feedback
- คำอธิบายกฎ
- ปุ่มคำสั่ง
- ข้อความสรุปผล

ใช้ Phaser สำหรับ

- emoji/object
- ตัวละคร
- animation
- icon สั้น ๆ
- effect

### 7.2 เหตุผล

Phaser text เป็นการ render ลง canvas จึงมีโอกาสเกิดปัญหา

- วรรณยุกต์ซ้อนผิด
- font โหลดไม่ทัน
- fallback font ไม่รองรับ
- ความคมลดลงเมื่อ canvas ถูก scale

---

## 8. โครงสร้าง UI ที่ต้องคงไว้

ให้รักษาแนวทางแบบเดิมของ `stage4.js`

```text
game-container
    ├── mission-panel
    │     ├── level-indicator
    │     ├── mission-title
    │     ├── mission-text
    │     └── feedback-box
    │
    ├── game-layout
    │     ├── phaser-canvas
    │     └── command-panel
    │           ├── command-count
    │           ├── sequence-container
    │           ├── arrow-buttons
    │           ├── clear-button
    │           └── run-button
```

---

## 9. Asset Strategy: ใช้ emoji เป็นต้นแบบ แต่เตรียมเปลี่ยนเป็น HD

### 9.1 หลักการ

ห้ามฝัง emoji กระจายทั่วไฟล์ เช่น

```javascript
this.add.text(x, y, '🚜')
```

ให้ใช้ helper กลาง เช่น

```javascript
addGameObject(this, 'tractor', x, y)
```

### 9.2 ตัวอย่าง `ASSET_MAP`

```javascript
const USE_EMOJI_ASSETS = true;

/**
 * TODO:
 * ตอนนี้ใช้ emoji เป็นต้นแบบชั่วคราว
 * เมื่อมีกราฟิก HD ให้เปลี่ยน USE_EMOJI_ASSETS = false
 * แล้วโหลดไฟล์ภาพจริงใน preload()
 */
const ASSET_MAP = {
    tractor: {
        emoji: '🚜',
        texture: 'tractor',
        fontSize: '48px',
        targetSize: 64
    },
    target: {
        emoji: '🧺',
        texture: 'basket',
        fontSize: '48px',
        targetSize: 64
    },
    hay: {
        emoji: '🌾',
        texture: 'hay',
        fontSize: '48px',
        targetSize: 64
    },
    rock: {
        emoji: '🪨',
        texture: 'rock',
        fontSize: '48px',
        targetSize: 64
    },
    barn: {
        emoji: '🏚️',
        texture: 'barn',
        fontSize: '48px',
        targetSize: 64
    },
    crop: {
        emoji: '🌽',
        texture: 'crop',
        fontSize: '48px',
        targetSize: 64
    }
};
```

### 9.3 ตัวอย่าง helper

```javascript
function addGameObject(scene, key, x, y) {
    const asset = ASSET_MAP[key];

    if (USE_EMOJI_ASSETS) {
        return scene.add.text(x, y, asset.emoji, {
            fontSize: asset.fontSize,
            fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
        }).setOrigin(0.5);
    }

    return scene.add.image(x, y, asset.texture)
        .setDisplaySize(asset.targetSize, asset.targetSize)
        .setOrigin(0.5);
}
```

---

## 10. แผนพัฒนา Stage 4: เดินหน้าสู่แปลงนา

### 10.1 แนวทาง

Stage 4 ต้องเป็นเกมพื้นฐานที่สุดของบทที่ 2

เป้าหมายคือ

```text
สั่งรถไถเดินทางไปให้ถึงจุดหมาย
```

Stage 4 **ไม่ควรมีสิ่งกีดขวาง** เพราะหน้าที่ของด่านนี้คือเป็น tutorial ของบทที่ 2

### 10.2 ด่านย่อย 3 ด่าน

| ด่านย่อย | รูปแบบ | จุดประสงค์ |
|---|---|---|
| 4.1 | ทางตรง | เข้าใจว่าคำสั่งเรียงกันแล้วรถไถเดินตาม |
| 4.2 | ทางเลี้ยวรูปตัว L | เข้าใจการเปลี่ยนทิศทาง |
| 4.3 | ทางซิกแซกง่าย | ใช้หลายทิศทางเพื่อไปถึงเป้าหมาย |

### 10.3 กติกา

- รถไถต้องไปถึงตะกร้าหรือจุดหมาย
- ไม่มีสิ่งกีดขวาง
- ถ้ารถไถออกนอกแผนที่ นับผิด
- ถ้าคำสั่งหมดแล้วยังไม่ถึงเป้าหมาย นับผิด
- ทุกครั้งที่กดรัน นับ 1 attempt
- ผ่านครบ 3 ด่านย่อยจึงส่งคะแนน

---

## 11. แผนพัฒนา Stage 5: หลบหลีกกองฟาง

### 11.1 แนวทาง

Stage 5 ใช้ engine เดียวกับ Stage 4 แต่เพิ่มสิ่งกีดขวาง

เป้าหมายคือ

```text
สั่งรถไถไปถึงจุดหมายโดยไม่ชนกองฟางหรือหิน
```

### 11.2 ด่านย่อย 3 ด่าน

| ด่านย่อย | รูปแบบ | จุดประสงค์ |
|---|---|---|
| 5.1 | สิ่งกีดขวาง 1 จุด | เริ่มรู้ว่าต้องหลบ |
| 5.2 | สิ่งกีดขวางเป็นแนว | ฝึกวางแผนเส้นทางอ้อม |
| 5.3 | เส้นทางหลอก | ฝึกคิดก่อนรันคำสั่ง |

### 11.3 กติกา

- รถไถต้องไปถึงเป้าหมาย
- ห้ามชนกองฟางหรือหิน
- ห้ามออกนอกแผนที่
- ถ้าชนให้หยุด animation ทันที
- ทุกครั้งที่ชน นับ mistake
- ทุกครั้งที่กดรัน นับ attempt
- ผ่านครบ 3 ด่านย่อยจึงส่งคะแนน

---

## 12. แผนพัฒนา Stage 6: เก็บเกี่ยวผลผลิต

### 12.1 แนวทาง

Stage 6 ใช้ engine เดียวกับ Stage 4 แต่เปลี่ยนเงื่อนไขชนะให้ซับซ้อนขึ้น

เป้าหมายคือ

```text
สั่งรถไถเก็บผลผลิตให้ครบก่อนกลับถึงโรงนา
```

### 12.2 ด่านย่อย 3 ด่าน

| ด่านย่อย | รูปแบบ | จุดประสงค์ |
|---|---|---|
| 6.1 | เก็บผลผลิต 1 จุด | เข้าใจการเก็บ item |
| 6.2 | เก็บผลผลิต 2 จุด | วางแผนลำดับการเดินทาง |
| 6.3 | เก็บผลผลิต 3 จุดพร้อมอุปสรรค | รวมทักษะการวางแผนและหลบสิ่งกีดขวาง |

### 12.3 กติกา

- รถไถต้องเก็บผลผลิตให้ครบทุกจุด
- ต้องจบที่โรงนา
- ถ้าถึงโรงนาแต่ยังเก็บไม่ครบ ไม่ผ่าน
- ถ้าชนสิ่งกีดขวาง นับผิด
- ถ้าออกนอกแผนที่ นับผิด
- เมื่อรถไถผ่านช่องที่มีผลผลิต ให้ถือว่าเก็บแล้ว
- ผลผลิตที่เก็บแล้วควรหายไปหรือมี effect
- ต้องมีตัวนับ เช่น `เก็บแล้ว 1 / 3`

---

## 13. ระบบให้ดาว

ทุก stage ในบทที่ 2 ให้คำนวณดาวหลังผ่านครบ 3 ด่านย่อย

| เงื่อนไข | ดาว |
|---|---:|
| ผ่านครบ 3 ด่านย่อย โดย attempts รวมไม่เกิน 3 และ mistakes = 0 | 3 |
| ผ่านครบ 3 ด่านย่อย โดย attempts รวม 4–6 หรือ mistakes ไม่เกิน 2 | 2 |
| ผ่านครบ 3 ด่านย่อย โดย attempts มากกว่า 6 หรือ mistakes มากกว่า 2 | 1 |

ตัวอย่าง function

```javascript
function calculateStars() {
    if (attempts <= 3 && mistakes === 0) return 3;
    if (attempts <= 6 || mistakes <= 2) return 2;
    return 1;
}
```

---

## 14. ระบบจบเกมและส่งคะแนน

ทุก stage ต้องเรียก `window.sendResult()` เพียงครั้งเดียว หลังผ่านครบ 3 ด่านย่อย

```javascript
function finishGame() {
    if (isGameEnded) return;
    isGameEnded = true;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const stars = calculateStars();

    showFinalResult(stars, timeTaken, attempts, () => {
        if (window.sendResult && typeof window.STAGE_ID !== 'undefined') {
            window.sendResult(window.STAGE_ID, stars, timeTaken, attempts);
        } else {
            console.log(`Finished: stars=${stars}, time=${timeTaken}, attempts=${attempts}`);
        }
    });
}
```

---

## 15. สิ่งที่ Codex ต้องทำ

ให้ Codex ดำเนินการตามลำดับนี้

```text
1. ย้อนแนวทางกลับไปใช้ HTML UI + Phaser Canvas แบบ stage4.js เดิม
2. ห้ามย้าย UI หลักหรือข้อความไทยไปไว้ใน Phaser Canvas
3. ปรับ stage4.js ให้เป็นเกมเดินหน้าสู่แปลงนาแบบพื้นฐาน
4. Stage 4 ต้องไม่มีสิ่งกีดขวาง
5. Stage 4 ต้องมีด่านย่อย 3 ด่าน: ทางตรง, ทางเลี้ยว, ทางซิกแซกง่าย
6. สร้างหรือปรับ stage5.js จากฐาน stage4.js
7. Stage 5 ต้องเป็นเกมหลบกองฟาง/หิน มีด่านย่อย 3 ด่าน
8. สร้างหรือปรับ stage6.js จากฐาน stage4.js
9. Stage 6 ต้องเป็นเกมเก็บผลผลิตให้ครบก่อนกลับโรงนา มีด่านย่อย 3 ด่าน
10. ใช้ HTML สำหรับ mission, feedback, ปุ่ม, command panel
11. ใช้ Phaser เฉพาะ grid, รถไถ, เป้าหมาย, สิ่งกีดขวาง, ผลผลิต, animation
12. ใช้ emoji เป็น prototype ผ่าน ASSET_MAP
13. ใส่ TODO comment สำหรับเปลี่ยนเป็นภาพ HD ภายหลัง
14. ตั้งค่า Phaser ให้รองรับ DPR / HiDPI
15. แก้ปัญหา scroll เมื่อเมาส์อยู่บน canvas
16. ห้ามแก้ระบบสร้างชิ้นงานในรอบนี้
17. ห้ามแก้บทที่ 3 และ 4 ในรอบนี้
```

---

## 16. สิ่งที่ยังไม่ทำในรอบนี้

ยังไม่ต้องทำ

- ระบบสร้างชิ้นงาน
- หน้าออกแบบเส้นทางของนักเรียน
- บทที่ 3 เครื่องรดน้ำอัจฉริยะ
- บทที่ 4 กู้วิกฤตฟาร์ม
- ภาพ asset HD จริง
- ระบบเลือก theme
- ระบบสร้างแผนที่เอง

เหตุผลคือ ต้องทำให้บทที่ 2 เสร็จสมบูรณ์ก่อน แล้วจึงค่อยต่อยอดเป็นชิ้นงานปลายบทและบทเรียนถัดไป

---

## 17. Checklist ตรวจรับงาน

| รายการตรวจสอบ | ต้องผ่าน |
|---|---|
| UI หลักเป็น HTML/Bootstrap | ผ่าน |
| Phaser ใช้เฉพาะสนามเกม | ผ่าน |
| ภาษาไทยแสดงถูกต้อง | ผ่าน |
| หน้าเว็บเลื่อนได้แม้เมาส์อยู่บน canvas | ผ่าน |
| Stage 4 ไม่มีสิ่งกีดขวาง | ผ่าน |
| Stage 4 มี 3 ด่านย่อย | ผ่าน |
| Stage 5 มีสิ่งกีดขวางและ 3 ด่านย่อย | ผ่าน |
| Stage 6 มีผลผลิต โรงนา และ 3 ด่านย่อย | ผ่าน |
| รถไถเคลื่อนที่จริงตามคำสั่ง | ผ่าน |
| มี animation/effect เมื่อชน ผ่าน หรือเก็บผลผลิต | ผ่าน |
| ใช้ emoji ผ่าน ASSET_MAP | ผ่าน |
| มี TODO สำหรับเปลี่ยนเป็นภาพ HD | ผ่าน |
| มีระบบ attempts/mistakes/time/stars | ผ่าน |
| เรียก `window.sendResult()` หลังผ่านครบ 3 ด่านย่อย | ผ่าน |
| ไม่แก้ระบบสร้างชิ้นงาน | ผ่าน |
| ไม่แก้บทที่ 3 และ 4 | ผ่าน |

---

## 18. สรุป

แนวทางที่เลือกสำหรับบทที่ 2 คือ **Hybrid UI Architecture**

```text
HTML/Bootstrap = ความคมชัดของ UI และภาษาไทย
Phaser = การเคลื่อนที่และสนามเกม
Emoji = prototype asset
HD Asset = เป้าหมายในระยะต่อไป
```

การพัฒนารอบนี้จึงไม่ใช่การรื้อเกมเดิม แต่เป็นการขัดเกลาแนวทางเดิมให้ดีขึ้น โดยรักษา UI ที่คมชัด ใช้ Phaser เฉพาะส่วนที่เป็นเกมจริง และเตรียม code ให้เปลี่ยนเป็นกราฟิก HD ได้เมื่อ asset พร้อม
