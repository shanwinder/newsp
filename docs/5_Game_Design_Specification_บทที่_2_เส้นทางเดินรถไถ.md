# Game Design Specification บทที่ 2: เส้นทางเดินรถไถ (Sequence)

> เอกสารนี้เป็นคำสั่งพัฒนาสำหรับ Codex โดยโฟกัสเฉพาะ **บทที่ 2: เส้นทางเดินรถไถ** ของระบบเกมแบบฝึกทักษะออนไลน์ เรื่อง “การแก้ปัญหาอย่างเป็นขั้นตอน” สำหรับนักเรียนชั้นประถมศึกษาปีที่ 4  
> เป้าหมายคือปรับบทที่ 2 ให้มีความเป็นเกมจริง มีกราฟิก กลไกการเล่น กฎการเล่น ความยากไต่ระดับ และใช้ `stage4.js` เป็นฐานในการสร้าง `stage5.js` และ `stage6.js`

---

## 1. เป้าหมายหลักของงานนี้

ให้พัฒนาเกมบทที่ 2 จำนวน 3 เกมหลัก ได้แก่

| ไฟล์ | ชื่อเกม | เป้าหมาย |
|---|---|---|
| `assets/js/logic_game/stage4.js` | เดินหน้าสู่แปลงนา | สั่งรถไถเดินทางไปถึงจุดหมาย |
| `assets/js/logic_game/stage5.js` | หลบหลีกกองฟาง | สั่งรถไถไปถึงจุดหมายโดยหลบสิ่งกีดขวาง |
| `assets/js/logic_game/stage6.js` | เก็บเกี่ยวผลผลิต | สั่งรถไถเก็บผลผลิตให้ครบก่อนถึงโรงนา |

ทั้ง 3 เกมต้องใช้แนวคิดเดียวกัน คือ **Command Sequencing / Grid Movement Game**  
ผู้เล่นต้องดูแผนที่ วางแผนเส้นทาง เพิ่มคำสั่งลูกศร กดรัน แล้วดูรถไถเคลื่อนที่ตามคำสั่งทีละช่อง

---

## 2. ข้อกำหนดที่ต้องยึดอย่างเคร่งครัด

### 2.1 ต้องมีความเป็นเกม ไม่ใช่แบบฝึกหัด static

ห้ามทำเป็น

- แบบทดสอบเลือกตอบ
- ตารางลากคำตอบเฉย ๆ
- หน้าข้อความแล้วกดปุ่มตอบ
- แบบฝึกที่ไม่มีฉาก ไม่มีตัวละคร ไม่มีการเคลื่อนที่
- เกมที่ไม่มี animation หรือ feedback

ต้องมี

- ฉากเกม
- รถไถ
- เป้าหมาย
- แผนที่ grid
- ปุ่มคำสั่งลูกศร
- พื้นที่เรียงคำสั่ง
- ปุ่มรันคำสั่ง
- animation รถไถเคลื่อนที่
- feedback เมื่อถูกหรือผิด
- ระบบด่านย่อย 3 ด่านในแต่ละเกม
- ระบบดาว เวลา และจำนวนครั้งที่พยายาม
- เรียก `window.sendResult()` เมื่อผ่านครบ 3 ด่านย่อยของไฟล์นั้น

---

## 3. แนวคิดการเรียนรู้ของบทที่ 2

บทที่ 2 เน้นการฝึก **การเรียงลำดับขั้นตอน (Sequence)**

ผู้เรียนควรเข้าใจว่า

1. การแก้ปัญหาต้องมีลำดับขั้นตอน
2. คำสั่งแต่ละคำสั่งมีผลต่อสถานะถัดไป
3. ถ้าเรียงคำสั่งผิด รถไถจะไปไม่ถึงเป้าหมาย
4. การวางแผนก่อนลงมือช่วยลดความผิดพลาด
5. การทดลอง แก้ไข และลองใหม่ เป็นส่วนหนึ่งของการแก้ปัญหาอย่างเป็นขั้นตอน

---

## 4. ปัญหาที่พบจากการทดสอบ และแนวทางแก้

### 4.1 ภาพใน Phaser ดูไม่คมชัด

สาเหตุที่เป็นไปได้

- Canvas มีขนาดเล็กแล้วถูก CSS ขยาย
- ใช้ emoji เป็น sprite ทำให้คุณภาพขึ้นอยู่กับระบบปฏิบัติการ
- ใช้ asset ภาพต้นฉบับความละเอียดต่ำ
- ไม่ได้ตั้งค่า `resolution` ตาม devicePixelRatio
- ข้อความใน canvas ถูก render ด้วย font ที่ไม่เหมาะสม

แนวทางแก้ในรอบนี้

1. ใช้ emoji เป็น asset ต้นแบบต่อไปก่อน
2. เขียน code ให้แยก asset ไว้ที่ `ASSET_MAP`
3. ใส่ comment `TODO` ไว้ชัดเจนว่าอนาคตสามารถเปลี่ยนเป็นภาพ HD ได้
4. ตั้งค่า Phaser ให้รองรับจอความละเอียดสูง
5. หลีกเลี่ยงการขยาย canvas เกินขนาดจริงมากเกินไป

ตัวอย่าง config ที่ควรใช้

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

---

### 4.2 เมื่อเมาส์อยู่บนพื้นที่เกมแล้วเลื่อนหน้าไม่ได้

ให้แก้โดยเพิ่ม CSS หลังสร้าง canvas

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

ข้อกำหนด:  
เนื่องจากบทที่ 2 ควบคุมด้วยปุ่มคำสั่งด้านข้าง ไม่ได้ลาก object ใน canvas เป็นหลัก จึงควรอนุญาตให้เลื่อนหน้าเว็บได้ตามปกติ

---

### 4.3 ภาษาไทยในตัวเกมวรรณยุกต์ไม่แสดง

แนวทางแก้หลักคือ

1. หลีกเลี่ยงการใช้ข้อความไทยยาว ๆ ใน Phaser canvas
2. ให้ใช้ HTML/Bootstrap แสดงข้อความไทย เช่น ภารกิจ คำอธิบาย feedback และปุ่ม
3. ใน Phaser canvas ให้ใช้เฉพาะ emoji, icon, ตัวเลข, ลูกศร หรือข้อความสั้นมากเท่านั้น
4. ถ้าจำเป็นต้องใช้ภาษาไทยใน Phaser ให้กำหนด font family ชัดเจน

```javascript
fontFamily: '"Noto Sans Thai", "Kanit", sans-serif'
```

ข้อกำหนดในงานนี้:  
ข้อความสำคัญ เช่น ชื่อด่านย่อย ภารกิจ คำใบ้ และ feedback ควรอยู่ใน HTML UI ด้านบนหรือด้านข้าง ไม่ควรอยู่ใน canvas

---

## 5. แนวทางจัดการ Asset

### 5.1 ใช้ emoji เป็น prototype

รอบนี้ให้ใช้ emoji เป็น asset ต้นแบบได้ เพื่อให้พัฒนา gameplay ได้เร็ว แต่ต้องเขียน code ให้เปลี่ยนเป็นภาพจริงภายหลังได้ง่าย

### 5.2 ต้องมี `ASSET_MAP`

ให้สร้าง object กลางสำหรับกำหนด asset ทุกตัว

```javascript
const USE_EMOJI_ASSETS = true;

/**
 * TODO:
 * เมื่อมีภาพกราฟิก HD แล้ว ให้เปลี่ยน USE_EMOJI_ASSETS = false
 * และโหลดไฟล์ภาพจริง เช่น tractor.webp, basket.webp, rock.webp, hay.webp, barn.webp
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
    rock: {
        emoji: '🪨',
        texture: 'rock',
        fontSize: '48px',
        targetSize: 64
    },
    hay: {
        emoji: '🌾',
        texture: 'hay',
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

### 5.3 ต้องมี helper function สำหรับสร้าง object

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

ข้อกำหนด:  
ห้ามฝัง emoji กระจัดกระจายทั่วไฟล์โดยตรง ให้เรียกผ่าน `addGameObject()` เป็นหลัก เพื่อให้เปลี่ยนเป็นภาพจริงภายหลังได้ง่าย

---

## 6. โครงสร้าง UI ร่วมของบทที่ 2

ทั้ง `stage4.js`, `stage5.js`, `stage6.js` ควรใช้ layout เดียวกันหรือใกล้เคียงกัน

### 6.1 Layout ที่ต้องมี

```text
[หัวข้อด่านย่อย / ภารกิจ / Feedback]
------------------------------------------------
|                     |                        |
|   Phaser Canvas     |   แผงควบคุมคำสั่ง      |
|   Grid Game         |   - sequence list       |
|                     |   - arrow buttons       |
|                     |   - clear/run buttons   |
------------------------------------------------
```

### 6.2 ส่วนซ้าย: Phaser Canvas

ใช้สำหรับแสดง

- แผนที่ grid
- รถไถ
- เป้าหมาย
- สิ่งกีดขวาง
- ผลผลิต
- animation การเคลื่อนที่
- effect ถูก/ผิด

### 6.3 ส่วนขวา: Command Panel

ต้องมี

- ชื่อ “บล็อกคำสั่ง”
- ตัวนับจำนวนคำสั่ง เช่น `0 / 10`
- พื้นที่แสดงลำดับคำสั่ง
- ปุ่มลูกศร 4 ทิศทาง
- ปุ่ม “ล้าง”
- ปุ่ม “รันคำสั่ง”
- ปุ่มลบคำสั่งแต่ละตัวได้โดยคลิกที่ block คำสั่ง

### 6.4 ส่วนบน: Mission Panel

ต้องแสดงเป็น HTML ไม่ใช่ Phaser text

ต้องมี

- ชื่อด่านย่อย เช่น “ด่านย่อยที่ 1 / 3”
- ภารกิจ เช่น “พารถไถไปถึงตะกร้าผลผลิต”
- feedback ล่าสุด เช่น “ยังไม่ถึงจุดหมาย ลองเพิ่มคำสั่งอีกครั้ง”

---

## 7. Engine กลางที่ควรรักษาจาก `stage4.js`

ให้ใช้ `stage4.js` เป็นฐาน เพราะมีแนวคิดถูกต้องแล้ว ได้แก่

- `levelConfigs`
- `commands`
- `attempts`
- `startTime`
- `isPlaying`
- `createUI()`
- `addCommand()`
- `updateSequenceUI()`
- `clearCommands()`
- `runSequence()`
- `MainScene`
- `drawGrid()`
- `loadLevel()`
- `resetPlayerPosition()`
- `executeSequence()`
- `movePlayer()`
- `checkWinCondition()`
- `window.sendResult()`

แต่ต้อง refactor ให้ใช้ซ้ำกับ `stage5.js` และ `stage6.js` ได้ง่ายขึ้น

---

## 8. มาตรฐานตัวแปรร่วม

ทุกไฟล์ควรมีตัวแปรพื้นฐานเหล่านี้

```javascript
const COLS = 6;
const ROWS = 5;
const TILE_SIZE = 80;
const GAME_WIDTH = COLS * TILE_SIZE;
const GAME_HEIGHT = ROWS * TILE_SIZE;

let currentLevel = 0;
let commands = [];
let attempts = 0;
let mistakes = 0;
let startTime = Date.now();
let isPlaying = false;
let isGameEnded = false;

const MAX_COMMANDS = 10;
```

ใน `stage6.js` อาจเพิ่ม

```javascript
let collectedCrops = 0;
```

---

## 9. มาตรฐานการคำนวณดาวของบทที่ 2

ทุกเกมในบทที่ 2 ผ่านครบ 3 ด่านย่อยแล้วจึงส่งคะแนน 1 ครั้ง

เกณฑ์ดาวแนะนำ

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

ข้อกำหนด:  
ถ้าผู้เล่นผ่านด่านแล้ว ต้องได้อย่างน้อย 1 ดาว

---

## 10. มาตรฐานการจบเกมและส่งผล

ทุกไฟล์ต้องมี function ประมาณนี้

```javascript
function finishGame(scene) {
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

`showFinalResult()` อาจใช้ SweetAlert2 หรือ HTML overlay ก็ได้ แต่ต้องสวยงามและเป็นมิตรกับเด็ก

---

# 11. Stage 4: เดินหน้าสู่แปลงนา

## 11.1 เป้าหมายของ Stage 4

Stage 4 ต้องเป็นเกมเริ่มต้นของบทที่ 2  
เป้าหมายคือฝึกให้ผู้เรียนเข้าใจการเรียงคำสั่งเพื่อพารถไถไปถึงจุดหมาย

### ข้อสำคัญ

Stage 4 ต้องไม่เน้นสิ่งกีดขวาง  
Stage 4 ต้องไม่ยากเกินไป  
Stage 4 ต้องทำหน้าที่เป็น tutorial ของบทที่ 2

---

## 11.2 Gameplay ของ Stage 4

ผู้เล่นต้อง

1. ดูตำแหน่งรถไถ
2. ดูตำแหน่งตะกร้าหรือจุดหมาย
3. กดเพิ่มคำสั่งลูกศร
4. กดรัน
5. รถไถเคลื่อนที่จริง
6. ถ้าถึงเป้าหมาย จะผ่านด่านย่อย
7. ผ่านครบ 3 ด่านย่อย จึงจบ Stage 4

---

## 11.3 ด่านย่อยของ Stage 4

### ด่านย่อย 4.1: ทางตรง

| รายการ | รายละเอียด |
|---|---|
| เป้าหมาย | ให้รถไถเดินตรงไปถึงตะกร้า |
| ความยาก | ง่ายมาก |
| สิ่งกีดขวาง | ไม่มี |
| ตัวอย่าง start | `{ col: 1, row: 2 }` |
| ตัวอย่าง target | `{ col: 4, row: 2 }` |
| คำตอบตัวอย่าง | RIGHT, RIGHT, RIGHT |

### ด่านย่อย 4.2: ทางเลี้ยวรูปตัว L

| รายการ | รายละเอียด |
|---|---|
| เป้าหมาย | ให้รถไถเดินแล้วเลี้ยวไปถึงตะกร้า |
| ความยาก | ง่าย-กลาง |
| สิ่งกีดขวาง | ไม่มี |
| ตัวอย่าง start | `{ col: 1, row: 4 }` |
| ตัวอย่าง target | `{ col: 4, row: 1 }` |
| คำตอบตัวอย่าง | RIGHT, RIGHT, RIGHT, UP, UP, UP |

### ด่านย่อย 4.3: ทางซิกแซกง่าย

| รายการ | รายละเอียด |
|---|---|
| เป้าหมาย | ให้รถไถใช้หลายทิศทางไปถึงตะกร้า |
| ความยาก | กลาง |
| สิ่งกีดขวาง | ไม่มี |
| ตัวอย่าง start | `{ col: 0, row: 4 }` |
| ตัวอย่าง target | `{ col: 5, row: 0 }` |
| คำตอบมีได้หลายแบบ | ได้ |

---

## 11.4 `levelConfigs` ของ Stage 4

ให้ปรับ `levelConfigs` ของ `stage4.js` เป็นแนวนี้

```javascript
const levelConfigs = [
    {
        title: 'ทางตรงสู่แปลงนา',
        mission: 'เพิ่มคำสั่งให้รถไถเดินตรงไปถึงตะกร้าผลผลิต',
        start: { col: 1, row: 2 },
        target: { col: 4, row: 2 },
        obstacles: [],
        crops: [],
        barn: null
    },
    {
        title: 'เลี้ยวไปยังแปลงนา',
        mission: 'วางคำสั่งให้รถไถเดินและเลี้ยวไปถึงจุดหมาย',
        start: { col: 1, row: 4 },
        target: { col: 4, row: 1 },
        obstacles: [],
        crops: [],
        barn: null
    },
    {
        title: 'เส้นทางซิกแซก',
        mission: 'พารถไถไปถึงตะกร้าด้วยคำสั่งหลายทิศทาง',
        start: { col: 0, row: 4 },
        target: { col: 5, row: 0 },
        obstacles: [],
        crops: [],
        barn: null
    }
];
```

หมายเหตุ:  
ใช้ `obstacles` แทน `rocks` เพื่อให้ Stage 5 ใช้ต่อได้ยืดหยุ่นกว่า

---

## 11.5 กฎการเล่น Stage 4

- รถไถต้องไปถึง target
- ไม่มีสิ่งกีดขวาง
- ถ้าออกนอกแผนที่ถือว่าผิด
- ถ้าคำสั่งหมดแล้วยังไม่ถึง target ถือว่ายังไม่ผ่าน
- ทุกครั้งที่กดรัน นับ 1 attempt
- ทุกครั้งที่ออกนอกแผนที่หรือไม่ถึงเป้าหมาย นับ 1 mistake

---

## 11.6 Feedback Stage 4

| สถานการณ์ | Feedback |
|---|---|
| ถึงเป้าหมาย | “เยี่ยมมาก รถไถถึงแปลงนาแล้ว!” |
| ออกนอกแผนที่ | “รถไถออกนอกแปลง ลองตรวจทิศทางอีกครั้ง” |
| ยังไม่ถึงเป้าหมาย | “ยังไม่ถึงจุดหมาย ลองเพิ่มหรือเปลี่ยนคำสั่ง” |
| ไม่มีคำสั่ง | “เพิ่มคำสั่งลูกศรก่อนกดรันนะ” |

---

# 12. Stage 5: หลบหลีกกองฟาง

## 12.1 เป้าหมายของ Stage 5

Stage 5 ต่อยอดจาก Stage 4 โดยเพิ่มสิ่งกีดขวาง  
ผู้เรียนต้องวางแผนเส้นทางให้รถไถไปถึงเป้าหมายโดยไม่ชนกองฟางหรือหิน

---

## 12.2 Gameplay ของ Stage 5

ผู้เล่นต้อง

1. ดูตำแหน่งรถไถ
2. ดูตำแหน่งเป้าหมาย
3. สังเกตตำแหน่งกองฟาง/หิน
4. วางคำสั่งเพื่อเดินอ้อม
5. กดรัน
6. ถ้าชนอุปสรรค ต้องแก้คำสั่งใหม่
7. ผ่านครบ 3 ด่านย่อยจึงจบ Stage 5

---

## 12.3 ด่านย่อยของ Stage 5

### ด่านย่อย 5.1: กองฟางหนึ่งจุด

| รายการ | รายละเอียด |
|---|---|
| เป้าหมาย | เดินอ้อมกองฟาง 1 จุด |
| ความยาก | ง่าย |
| สิ่งกีดขวาง | 1 จุด |
| ทักษะ | รู้ว่าต้องไม่เดินตรงชน |

### ด่านย่อย 5.2: กำแพงกองฟาง

| รายการ | รายละเอียด |
|---|---|
| เป้าหมาย | เดินอ้อมกำแพงกองฟาง |
| ความยาก | กลาง |
| สิ่งกีดขวาง | 3 จุดเรียงกัน |
| ทักษะ | วางแผนเส้นทางอ้อม |

### ด่านย่อย 5.3: เส้นทางหลอก

| รายการ | รายละเอียด |
|---|---|
| เป้าหมาย | เลือกเส้นทางที่ปลอดภัย |
| ความยาก | กลาง-ยาก |
| สิ่งกีดขวาง | หลายจุด |
| ทักษะ | คิดก่อนรัน ไม่ลองแบบสุ่ม |

---

## 12.4 `levelConfigs` ของ Stage 5

```javascript
const levelConfigs = [
    {
        title: 'กองฟางขวางทาง',
        mission: 'พารถไถไปถึงตะกร้าโดยไม่ชนกองฟาง',
        start: { col: 0, row: 2 },
        target: { col: 5, row: 2 },
        obstacles: [
            { col: 2, row: 2, type: 'hay' }
        ],
        crops: [],
        barn: null
    },
    {
        title: 'กำแพงกองฟาง',
        mission: 'วางแผนเส้นทางอ้อมกำแพงกองฟาง',
        start: { col: 0, row: 2 },
        target: { col: 5, row: 2 },
        obstacles: [
            { col: 2, row: 1, type: 'hay' },
            { col: 2, row: 2, type: 'hay' },
            { col: 2, row: 3, type: 'hay' }
        ],
        crops: [],
        barn: null
    },
    {
        title: 'เส้นทางปลอดภัย',
        mission: 'หลบกองฟางและหินเพื่อไปถึงจุดหมาย',
        start: { col: 0, row: 4 },
        target: { col: 5, row: 0 },
        obstacles: [
            { col: 1, row: 3, type: 'rock' },
            { col: 2, row: 3, type: 'hay' },
            { col: 3, row: 2, type: 'rock' },
            { col: 4, row: 2, type: 'hay' }
        ],
        crops: [],
        barn: null
    }
];
```

---

## 12.5 กฎการเล่น Stage 5

- รถไถต้องไปถึง target
- ห้ามชน obstacles
- ห้ามออกนอกแผนที่
- ถ้าชน ให้หยุด animation ทันที
- ถ้าชน ให้นับ mistake
- ทุกครั้งที่กดรัน นับ attempt
- ให้ผู้เล่นล้างคำสั่งและลองใหม่ได้

---

## 12.6 Feedback Stage 5

| สถานการณ์ | Feedback |
|---|---|
| ชนกองฟาง | “รถไถชนกองฟาง ลองวางเส้นทางอ้อมดูนะ” |
| ชนหิน | “เส้นทางนี้มีหินขวางอยู่ ลองเปลี่ยนทิศทาง” |
| ออกนอกแผนที่ | “รถไถออกนอกแปลงแล้ว” |
| ถึงเป้าหมาย | “ยอดเยี่ยม รถไถหลบสิ่งกีดขวางได้สำเร็จ!” |

---

# 13. Stage 6: เก็บเกี่ยวผลผลิต

## 13.1 เป้าหมายของ Stage 6

Stage 6 เป็นเกมสรุปของบทที่ 2  
ผู้เรียนต้องวางแผนเส้นทางให้รถไถเก็บผลผลิตให้ครบก่อนกลับถึงโรงนา

---

## 13.2 Gameplay ของ Stage 6

ผู้เล่นต้อง

1. ดูตำแหน่งรถไถ
2. ดูตำแหน่งผลผลิต
3. ดูตำแหน่งโรงนา
4. วางลำดับคำสั่ง
5. กดรัน
6. รถไถเก็บผลผลิตเมื่อเดินผ่านช่องนั้น
7. ต้องเก็บครบก่อนจบที่โรงนา
8. ผ่านครบ 3 ด่านย่อยจึงจบ Stage 6

---

## 13.3 ด่านย่อยของ Stage 6

### ด่านย่อย 6.1: เก็บผลผลิต 1 จุด

| รายการ | รายละเอียด |
|---|---|
| เป้าหมาย | เก็บผลผลิต 1 จุดแล้วไปโรงนา |
| ความยาก | ง่าย |
| สิ่งกีดขวาง | ไม่มีหรือมีน้อยมาก |

### ด่านย่อย 6.2: เก็บผลผลิต 2 จุด

| รายการ | รายละเอียด |
|---|---|
| เป้าหมาย | เก็บผลผลิต 2 จุดแล้วไปโรงนา |
| ความยาก | กลาง |
| สิ่งกีดขวาง | มีได้ 1–2 จุด |

### ด่านย่อย 6.3: เก็บผลผลิต 3 จุดพร้อมหลบอุปสรรค

| รายการ | รายละเอียด |
|---|---|
| เป้าหมาย | เก็บผลผลิต 3 จุดแล้วกลับโรงนา |
| ความยาก | กลาง-ยาก |
| สิ่งกีดขวาง | มีหลายจุด |

---

## 13.4 `levelConfigs` ของ Stage 6

```javascript
const levelConfigs = [
    {
        title: 'เก็บผลผลิตแรก',
        mission: 'เก็บผลผลิต 1 จุด แล้วขับรถไถไปโรงนา',
        start: { col: 0, row: 4 },
        target: null,
        barn: { col: 5, row: 4 },
        crops: [
            { col: 3, row: 4 }
        ],
        obstacles: []
    },
    {
        title: 'เก็บผลผลิตสองแปลง',
        mission: 'เก็บผลผลิตให้ครบ 2 จุด แล้วกลับโรงนา',
        start: { col: 0, row: 4 },
        target: null,
        barn: { col: 5, row: 0 },
        crops: [
            { col: 2, row: 4 },
            { col: 4, row: 2 }
        ],
        obstacles: [
            { col: 3, row: 3, type: 'rock' }
        ]
    },
    {
        title: 'เก็บเกี่ยวรอบใหญ่',
        mission: 'เก็บผลผลิต 3 จุด หลบสิ่งกีดขวาง แล้วกลับโรงนา',
        start: { col: 0, row: 4 },
        target: null,
        barn: { col: 5, row: 0 },
        crops: [
            { col: 1, row: 2 },
            { col: 3, row: 4 },
            { col: 4, row: 1 }
        ],
        obstacles: [
            { col: 2, row: 2, type: 'hay' },
            { col: 2, row: 3, type: 'rock' },
            { col: 4, row: 3, type: 'hay' }
        ]
    }
];
```

---

## 13.5 กฎการเล่น Stage 6

- ต้องเก็บ crops ให้ครบทุกจุด
- ต้องจบที่ barn
- ถ้าถึง barn แต่เก็บไม่ครบ ถือว่ายังไม่ผ่าน
- ห้ามชน obstacles
- ห้ามออกนอกแผนที่
- เมื่อรถไถเดินผ่าน crop ให้ถือว่าเก็บแล้ว
- crop ที่เก็บแล้วควรหายไปหรือมี effect
- ต้องแสดงตัวนับ เช่น `เก็บแล้ว 1 / 3`

---

## 13.6 Feedback Stage 6

| สถานการณ์ | Feedback |
|---|---|
| เก็บผลผลิต | “เก็บผลผลิตแล้ว!” |
| ถึงโรงนาแต่ยังเก็บไม่ครบ | “ยังมีผลผลิตเหลืออยู่ ต้องเก็บให้ครบก่อนกลับโรงนา” |
| ชนสิ่งกีดขวาง | “รถไถชนสิ่งกีดขวาง ลองวางเส้นทางใหม่” |
| เก็บครบและถึงโรงนา | “สำเร็จ! เก็บเกี่ยวผลผลิตครบแล้ว” |

---

# 14. รายละเอียด function ที่ต้องมีหรือควรปรับ

## 14.1 `createUI()`

ต้องสร้าง HTML UI ต่อไปนี้

- mission panel
- level indicator
- feedback box
- phaser canvas
- command panel
- command sequence container
- arrow buttons
- clear button
- run button

ต้องเพิ่ม CSS สำหรับ scroll

```javascript
const style = document.createElement('style');
style.innerHTML = `
#phaser-canvas,
#phaser-canvas canvas {
    touch-action: pan-y;
}
`;
document.head.appendChild(style);
```

---

## 14.2 `updateMissionUI()`

ต้องอัปเดตชื่อด่านย่อยและภารกิจจาก `levelConfigs[currentLevel]`

```javascript
function updateMissionUI() {
    const config = levelConfigs[currentLevel];

    document.getElementById('level-indicator').innerHTML =
        `ด่านย่อยที่ ${currentLevel + 1} / ${levelConfigs.length}`;

    document.getElementById('mission-title').innerText = config.title;
    document.getElementById('mission-text').innerText = config.mission;
}
```

---

## 14.3 `showFeedback(message, type)`

ใช้แสดง feedback เป็น HTML ไม่ใช่ Phaser text

```javascript
function showFeedback(message, type = 'info') {
    const box = document.getElementById('feedback-box');
    if (!box) return;

    box.className = `alert alert-${type} rounded-4 shadow-sm mb-3`;
    box.innerText = message;
}
```

type ที่ใช้ได้

- `info`
- `success`
- `warning`
- `danger`

---

## 14.4 `movePlayer(dir)`

ต้องรองรับ

- ตรวจออกนอกแผนที่
- ตรวจชน obstacle
- animation เดินทีละช่อง
- หมุนหรือพลิกรถไถตามทิศทาง
- ส่งผลลัพธ์กลับเป็น string เช่น

```javascript
'SUCCESS'
'OUT_OF_BOUNDS'
'OBSTACLE'
```

---

## 14.5 `executeSequence(commands)`

ต้องทำงานแบบ async

```javascript
async executeSequence(cmds) {
    for (const dir of cmds) {
        const result = await this.movePlayer(dir);

        if (result !== 'SUCCESS') {
            mistakes++;
            handleMoveError(result);
            return;
        }

        this.checkCropCollection();
    }

    this.checkWinCondition();
}
```

ใน Stage 4 ไม่ต้องมี `checkCropCollection()` ก็ได้  
ใน Stage 6 ต้องมี

---

## 14.6 `checkWinCondition()`

ต้องแยก logic ตาม stage

### Stage 4 และ Stage 5

ผ่านเมื่อรถไถอยู่ตำแหน่งเดียวกับ `target`

### Stage 6

ผ่านเมื่อ

```javascript
collectedCrops === totalCrops
AND player position === barn position
```

---

# 15. ข้อกำหนดเฉพาะด้านความสวยงาม

ถึงจะใช้ emoji เป็น asset ชั่วคราว แต่ต้องทำให้ดูเป็นเกม

ต้องมี

- พื้นหลัง grid สีสวย ไม่ใช่ขาวโล่ง
- ช่อง grid สลับสีอ่อน ๆ เช่น เขียวอ่อน/น้ำตาลอ่อน
- effect ตอนรถไถเดิน
- effect ตอนชน
- effect ตอนเก็บผลผลิต
- effect ตอนผ่านด่านย่อย
- ปุ่ม UI สวยงามด้วย Bootstrap
- feedback box ที่อ่านง่าย
- final result ที่มีดาวและข้อความชมเชย

ตัวอย่างการวาด grid ให้สวยขึ้น

```javascript
drawGrid() {
    const graphics = this.add.graphics();

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const color = (r + c) % 2 === 0 ? 0xdff5d8 : 0xcdecc3;
            graphics.fillStyle(color, 1);
            graphics.fillRoundedRect(
                c * TILE_SIZE + 2,
                r * TILE_SIZE + 2,
                TILE_SIZE - 4,
                TILE_SIZE - 4,
                10
            );
        }
    }

    graphics.lineStyle(1, 0x9ccc9c, 0.8);
    for (let r = 0; r <= ROWS; r++) {
        graphics.moveTo(0, r * TILE_SIZE);
        graphics.lineTo(GAME_WIDTH, r * TILE_SIZE);
    }
    for (let c = 0; c <= COLS; c++) {
        graphics.moveTo(c * TILE_SIZE, 0);
        graphics.lineTo(c * TILE_SIZE, GAME_HEIGHT);
    }
    graphics.strokePath();
}
```

---

# 16. ข้อกำหนดการทดสอบ

หลัง Codex พัฒนาเสร็จ ให้ทดสอบตามรายการนี้

## 16.1 ทดสอบ Stage 4

- เข้า `play_game.php?stage_id=4`
- เล่นด่านย่อย 1 ผ่าน
- เล่นด่านย่อย 2 ผ่าน
- เล่นด่านย่อย 3 ผ่าน
- ตรวจว่าไม่มีสิ่งกีดขวาง
- ตรวจว่ารถไถไปถึง target แล้วผ่าน
- ตรวจว่าออกนอกแผนที่แล้วมี feedback
- ตรวจว่าส่งคะแนนหลังผ่านครบ 3 ด่านย่อย

## 16.2 ทดสอบ Stage 5

- เข้า `play_game.php?stage_id=5`
- เห็นกองฟาง/หิน
- รถไถชนแล้วหยุด
- มี feedback เมื่อชน
- สามารถล้างคำสั่งและลองใหม่
- ผ่านครบ 3 ด่านย่อย
- ส่งคะแนนได้

## 16.3 ทดสอบ Stage 6

- เข้า `play_game.php?stage_id=6`
- เห็นผลผลิตและโรงนา
- รถไถเก็บผลผลิตเมื่อเดินผ่าน
- ตัวนับผลผลิตเพิ่ม
- ถึงโรงนาแต่ยังเก็บไม่ครบแล้วไม่ผ่าน
- เก็บครบและถึงโรงนาแล้วผ่าน
- ส่งคะแนนได้

## 16.4 ทดสอบการใช้งานทั่วไป

- เมาส์อยู่บน canvas แล้วยังเลื่อนหน้าได้
- ภาษาไทยไม่เพี้ยนใน mission/feedback
- emoji แสดงได้
- UI ไม่ล้นบนหน้าจอ desktop
- responsive พอใช้บน tablet/mobile
- ไม่มี error ใน console
- ไม่เรียก `window.sendResult()` ซ้ำ

---

# 17. คำสั่งสำหรับ Codex

ให้ Codex ดำเนินการตามลำดับนี้

```text
1. เปิดไฟล์ assets/js/logic_game/stage4.js
2. ปรับ stage4.js ให้เป็นเกม “เดินหน้าสู่แปลงนา” ตามสเปกนี้
   - ไม่มีสิ่งกีดขวาง
   - มี 3 ด่านย่อย
   - เน้นการพารถไถไปถึงเป้าหมาย
   - ใช้ emoji เป็น prototype asset ผ่าน ASSET_MAP
   - เพิ่ม high-DPI config
   - แก้ปัญหา scroll บน canvas
   - แยกข้อความไทยไปอยู่ใน HTML UI
3. สร้างไฟล์ assets/js/logic_game/stage5.js โดยใช้ stage4.js เป็นฐาน
   - เปลี่ยนเป็นเกม “หลบหลีกกองฟาง”
   - มีสิ่งกีดขวาง
   - มี 3 ด่านย่อย
   - ชนแล้ว feedback และนับ mistake
4. สร้างไฟล์ assets/js/logic_game/stage6.js โดยใช้ stage4.js เป็นฐาน
   - เปลี่ยนเป็นเกม “เก็บเกี่ยวผลผลิต”
   - มี crops และ barn
   - ต้องเก็บ crops ครบก่อนถึง barn
   - มี 3 ด่านย่อย
5. ห้ามแก้ระบบสร้างชิ้นงานในรอบนี้
6. ห้ามแก้ logic อื่นนอกเหนือจากบทที่ 2 ถ้าไม่จำเป็น
7. ทดสอบทั้ง 3 ไฟล์ผ่าน play_game.php?stage_id=4, 5, 6
8. ตรวจว่าแต่ละไฟล์เรียก window.sendResult() หลังผ่านครบ 3 ด่านย่อยเท่านั้น
```

---

# 18. สิ่งที่ยังไม่ทำในรอบนี้

ยังไม่ต้องทำ

- ระบบสร้างชิ้นงาน
- หน้า `create_project_algo.php`
- บทที่ 3
- บทที่ 4
- asset ภาพ HD จริง
- ระบบออกแบบแผนที่โดยนักเรียน
- ระบบบันทึกคำสั่งเป็นชิ้นงาน

เหตุผล:  
ต้องทำให้ตัวเกมบทที่ 2 สมบูรณ์ก่อน แล้วจึงค่อยต่อยอดเป็นระบบสร้างชิ้นงานภายหลัง

---

# 19. นิยามความสำเร็จของบทที่ 2

บทที่ 2 ถือว่าเสร็จสมบูรณ์เมื่อ

| รายการ | ต้องผ่าน |
|---|---|
| `stage4.js` เป็นเกมเดินทางไปถึงจุดหมาย | ผ่าน |
| `stage5.js` เป็นเกมหลบสิ่งกีดขวาง | ผ่าน |
| `stage6.js` เป็นเกมเก็บผลผลิต | ผ่าน |
| แต่ละไฟล์มี 3 ด่านย่อย | ผ่าน |
| ใช้ระบบคำสั่งลูกศรเดียวกัน | ผ่าน |
| รถไถเคลื่อนที่จริงใน canvas | ผ่าน |
| มี animation/feedback | ผ่าน |
| มี attempts/mistakes/time/stars | ผ่าน |
| ส่งคะแนนผ่าน `window.sendResult()` | ผ่าน |
| ใช้ emoji เป็น prototype asset พร้อม TODO เปลี่ยนเป็นภาพจริง | ผ่าน |
| เลื่อนหน้าได้เมื่อเมาส์อยู่บนเกม | ผ่าน |
| ข้อความไทยสำคัญแสดงใน HTML และวรรณยุกต์ไม่หาย | ผ่าน |
| ไม่แตะระบบสร้างชิ้นงาน | ผ่าน |

---

## 20. สรุป

เอกสารนี้กำหนดให้บทที่ 2 เป็นเกมแนววางคำสั่งควบคุมรถไถบนแผนที่ โดยใช้ `stage4.js` เป็นฐาน แล้วแยกความยากออกเป็น 3 เกม

1. `stage4.js` — เดินทางไปถึงจุดหมาย
2. `stage5.js` — หลบสิ่งกีดขวาง
3. `stage6.js` — เก็บผลผลิตให้ครบก่อนกลับโรงนา

เป้าหมายคือทำให้บทที่ 2 มีความเป็นเกมจริง สวยงามพอในระดับ prototype ใช้งานได้จริง และพร้อมต่อยอดเป็นชิ้นงานปลายบทในภายหลัง
