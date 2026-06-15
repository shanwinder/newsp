# แผนการพัฒนาปรับปรุง: Refactor `stage1.js`–`stage3.js` ให้ใช้ Engine/Layout กลาง

เอกสารนี้จัดทำเพื่อใช้เป็นแนวทางให้ Codex หรือผู้พัฒนาปรับปรุงเกมบทเรียนที่ 1 (`game_id=1`) ซึ่งประกอบด้วย `stage1.js`, `stage2.js`, `stage3.js` ให้ใช้โครงสร้าง engine/layout กลางเหมือนแนวทางของ `farm_missions.js` แทนการสร้าง Phaser game แบบแยกไฟล์และ hard-code ขนาดจอในแต่ละ stage

---

## 1. ปัญหาที่ต้องแก้

หน้า `game_select.php?game_id=1` แสดงการ์ดเลือกด่านได้ตามปกติ แต่เมื่อเข้าเล่นเกมจริงผ่าน `play_game.php?stage_id=1`, `stage_id=2`, `stage_id=3` จะเกิดปัญหาการจัดวางจอเกมผิดพลาดในบางขนาดหน้าจอ

สาเหตุหลัก:

1. `stage1.js`, `stage2.js`, `stage3.js` สร้าง `new Phaser.Game(...)` เองทุกไฟล์
2. ทุกไฟล์กำหนด canvas เป็นขนาดตายตัว `800 x 600`
3. ตำแหน่งวัตถุในเกมใช้พิกัด absolute เช่น `x = 400`, `y = 560`
4. `play_game.php` ใช้ CSS บีบ canvas ให้ responsive แต่ logic ข้างในเกมไม่ได้ responsive ตาม
5. บทเรียนอื่นเริ่มใช้ engine/layout กลาง เช่น `farm_missions.js` และ CSS shell ที่ควบคุม layout ได้ดีกว่า

---

## 2. เป้าหมายของงาน

เปลี่ยนโครงสร้างเกมบทเรียนที่ 1 จากแบบนี้:

```text
stage1.js = Phaser config + preload + create + input + scoring + result
stage2.js = Phaser config + preload + create + input + scoring + result
stage3.js = Phaser config + preload + create + input + scoring + result
```

เป็นแบบนี้:

```text
farm_logic_missions.js = engine/layout/scoring/result กลาง
stage1.js = config ของเกมเมล็ดพันธุ์
stage2.js = config ของเกมปุ๋ย
stage3.js = config ของเกมวัชพืช
```

ผลลัพธ์ที่ต้องการ:

- เกมบทเรียนที่ 1 ใช้ layout มาตรฐานเดียวกับบทเรียนอื่น
- canvas อยู่ใน shell ที่ควบคุม responsive ได้
- ลดการซ้ำของ code ใน `stage1.js`–`stage3.js`
- ควบคุม scoring, transition, result overlay, submit score จากจุดเดียว
- รองรับ desktop, tablet, mobile ได้ดีขึ้น

---

## 3. ไฟล์ที่เกี่ยวข้อง

### ไฟล์ที่ต้องแก้

```text
pages/play_game.php
assets/js/logic_game/stage1.js
assets/js/logic_game/stage2.js
assets/js/logic_game/stage3.js
```

### ไฟล์ใหม่ที่ควรสร้าง

```text
assets/js/logic_game/farm_logic_missions.js
```

### ไฟล์ที่ใช้อ้างอิงแนวทาง

```text
assets/js/logic_game/farm_missions.js
assets/css/conveyor_logic.css
```

---

## 4. แนวทางออกแบบ `farm_logic_missions.js`

สร้าง engine กลางชื่อ `FarmLogicMissions` โดย export ผ่าน `window`

```js
window.FarmLogicMissions = {
    sorting,
    mixed,
    clicker
};
```

หรือใช้ method กลางเดียวก็ได้:

```js
window.FarmLogicMissions.run(config);
```

แนะนำใช้ `run(config)` เพื่อให้ `stage1.js`–`stage3.js` เรียกเหมือนกันทั้งหมด

---

## 5. โครงสร้างหลักของ engine กลาง

### 5.1 `ensureLogicStyles()`

หน้าที่:

- inject CSS สำหรับ layout ของเกมบทเรียนที่ 1
- สร้าง responsive shell
- กำหนดขนาด canvas ผ่าน `#phaser-canvas`
- ใช้ media query สำหรับจอเล็ก

ตัวอย่างโครงสร้าง CSS:

```js
function ensureLogicStyles() {
    if (document.getElementById('farm-logic-missions-style')) return;

    const style = document.createElement('style');
    style.id = 'farm-logic-missions-style';
    style.innerHTML = `
        #game-container {
            width: min(1000px, 94vw);
        }

        .logic-shell * {
            box-sizing: border-box;
        }

        .logic-mission,
        .logic-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 12px 28px rgba(15,23,42,.08);
            padding: 16px;
        }

        .logic-mission {
            margin-bottom: 14px;
        }

        .logic-layout {
            display: grid;
            grid-template-columns: minmax(360px, 1fr) 300px;
            gap: 18px;
            align-items: stretch;
        }

        #phaser-canvas {
            width: 100%;
            min-height: 420px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        #phaser-canvas canvas {
            width: min(640px, 100%) !important;
            height: auto !important;
            max-width: 100%;
            image-rendering: auto;
            display: block;
            border-radius: 8px;
        }

        .logic-side-panel {
            display: grid;
            gap: 12px;
            align-content: start;
        }

        .logic-stat-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
        }

        .logic-stat {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #f8fafc;
            padding: 10px;
            font-weight: 700;
        }

        @media (max-width: 900px) {
            .logic-layout {
                grid-template-columns: 1fr;
            }

            #phaser-canvas {
                min-height: 360px;
            }
        }

        @media (max-width: 576px) {
            .logic-mission,
            .logic-card {
                padding: 12px;
            }

            #phaser-canvas {
                min-height: 320px;
            }
        }
    `;
    document.head.appendChild(style);
}
```

---

### 5.2 `createLogicShell(config)`

หน้าที่:

- เคลียร์ `#game-container`
- สร้าง layout ภายในเกม
- แยกพื้นที่ mission, canvas, side panel, feedback, stats

ตัวอย่าง:

```js
function createLogicShell(config) {
    const container = document.getElementById('game-container');
    if (!container) return null;

    container.innerHTML = `
        <div class="logic-shell">
            <div class="logic-mission">
                <div id="logic-level-indicator" class="fw-bold text-success">ด่านย่อยที่ 1 / 3</div>
                <h4 id="logic-mission-title" class="fw-bold mb-1 text-dark">${escapeHtml(config.title)}</h4>
                <div id="logic-mission-text" class="text-secondary">${escapeHtml(config.subtitle || '')}</div>
                <div id="logic-feedback" class="alert alert-info rounded-3 shadow-sm mt-3 mb-0 py-2">
                    เริ่มทำภารกิจได้เลย
                </div>
            </div>

            <div class="logic-layout">
                <div class="logic-card">
                    <div id="phaser-canvas"></div>
                </div>

                <aside class="logic-card logic-side-panel">
                    <div>
                        <h5 class="fw-bold mb-2">เป้าหมาย</h5>
                        <div id="logic-goal" class="text-secondary">อ่านโจทย์แล้วทำตามเงื่อนไข</div>
                    </div>
                    <div class="logic-stat-grid">
                        <div class="logic-stat" id="logic-progress">ความคืบหน้า: 0 / 0</div>
                        <div class="logic-stat" id="logic-mistakes">พลาด: 0 ครั้ง</div>
                        <div class="logic-stat" id="logic-timer">เวลา: 0 วินาที</div>
                    </div>
                </aside>
            </div>
        </div>
    `;

    return container;
}
```

---

### 5.3 `createPhaserGame(sceneClass)`

หน้าที่:

- สร้าง Phaser game จากจุดเดียว
- ใช้ parent เป็น `phaser-canvas`
- ควบคุม responsive ผ่าน Phaser Scale Manager และ CSS

ตัวอย่าง:

```js
function createPhaserGame(sceneClass) {
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    return new Phaser.Game({
        type: Phaser.AUTO,
        width: 640,
        height: 480,
        resolution: DPR,
        antialias: true,
        roundPixels: true,
        transparent: true,
        parent: 'phaser-canvas',
        input: {
            mouse: { preventDefaultWheel: false },
            touch: { capture: false }
        },
        physics: {
            default: 'arcade',
            arcade: { debug: false }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: sceneClass
    });
}
```

---

## 6. รูปแบบ config ของ stage ใหม่

### 6.1 ตัวอย่างโครงสร้างรวม

```js
const config = {
    title: 'แยกแยะเมล็ดพันธุ์',
    subtitle: 'ฝึกสังเกตและจำแนกวัตถุตามเงื่อนไข',
    background: '../assets/img/bg_farm.webp',
    resultText: 'คุณผ่านภารกิจตรรกะคัดแยกแล้ว',
    assets: [
        ['seed', '../assets/img/newseed.webp'],
        ['basket', '../assets/img/basket.webp'],
        ['rock', '../assets/img/rock.webp']
    ],
    scales: {
        seed: 0.2,
        rock: 0.2,
        basket: 0.35
    },
    levels: [
        {
            type: 'drag_sort',
            title: 'ด่าน 1/3: ลากเมล็ดพันธุ์ลงตะกร้า',
            goal: 'เลือกเฉพาะเมล็ดพันธุ์ที่ถูกต้อง',
            zones: [
                { id: 'basket', label: 'ตะกร้าเมล็ดพันธุ์', x: 0.5, y: 0.78, width: 0.28, height: 0.24 }
            ],
            items: [
                { key: 'seed', target: 'basket', x: 0.25, y: 0.35 },
                { key: 'rock', target: null, x: 0.44, y: 0.28 },
                { key: 'seed', target: 'basket', x: 0.58, y: 0.43 },
                { key: 'rock', target: null, x: 0.75, y: 0.32 }
            ]
        }
    ],
    scoring: {
        threeStarsMaxMistakes: 1,
        twoStarsMaxMistakes: 4
    }
};
```

### 6.2 หลักสำคัญของ config

- ใช้พิกัดแบบสัดส่วน `0.0` ถึง `1.0` แทน pixel ตายตัว
- engine แปลงเป็น pixel ด้วย `toX(value)` และ `toY(value)`
- ทุก level ระบุ `type` เพื่อเลือก handler
- stage files ไม่ควรมี `new Phaser.Game(...)`
- stage files ไม่ควรมี `window.sendResult(...)`

---

## 7. Handler ที่ engine ควรรองรับ

### 7.1 `drag_sort`

ใช้กับภารกิจลากของลงตะกร้า เช่น stage 1 และ stage 2

ความสามารถ:

- สร้าง drop zone ตาม config
- สร้าง item ตาม config
- ตรวจว่า item ลง zone ถูกหรือไม่
- item ที่ target เป็น `null` ถือเป็นตัวหลอก
- เมื่อลากตัวหลอกลง zone ให้นับ mistake และดีดกลับ
- เมื่อจัดครบ target ทั้งหมด ให้ไป level ถัดไป

Pseudo-code:

```js
function startDragSortLevel(scene, level) {
    state.currentTargets = countTargetItems(level.items);
    state.completedTargets = 0;

    renderLevelHeader(level);
    renderBackground(scene);
    renderZones(scene, level.zones);
    renderItems(scene, level.items);

    scene.input.on('drag', (pointer, item, dragX, dragY) => {
        item.x = dragX;
        item.y = dragY;
    });

    scene.input.on('drop', (pointer, item, zone) => {
        if (item.targetZoneId && item.targetZoneId === zone.zoneId) {
            markCorrect(scene, item, zone);
            state.completedTargets++;
            updateStats();

            if (state.completedTargets >= state.currentTargets) {
                goNextLevel(scene);
            }
        } else {
            markWrong(scene, item);
            state.mistakes++;
            updateStats();
            resetItemPosition(scene, item);
        }
    });
}
```

---

### 7.2 `click_targets`

ใช้กับ stage 3 หรือภารกิจกำจัดวัชพืช/แมลง

ความสามารถ:

- สร้าง item แบบ grid หรือสุ่มตำแหน่ง
- คลิก target ถูกแล้ว item หาย
- คลิกตัวหลอกแล้วนับ mistake
- เมื่อกำจัด target ครบ ให้ไป level ถัดไป

Pseudo-code:

```js
function startClickTargetsLevel(scene, level) {
    state.currentTargets = countTargetItems(level.items);
    state.completedTargets = 0;

    renderLevelHeader(level);
    renderBackground(scene);

    const positions = getShuffledGridPositions(level.items.length);
    level.items.forEach((data, index) => {
        const item = createItem(scene, data, positions[index]);
        item.setInteractive({ useHandCursor: true });

        item.on('pointerdown', () => {
            if (data.isTarget) {
                playCorrect(scene);
                removeItem(scene, item);
                state.completedTargets++;

                if (state.completedTargets >= state.currentTargets) {
                    goNextLevel(scene);
                }
            } else {
                playWrong(scene);
                state.mistakes++;
                showWrongMark(scene, item.x, item.y);
            }

            updateStats();
        });
    });
}
```

---

### 7.3 `sequence_drop`

ใช้กับ sub-level ที่ต้องลากคำตอบเติมลำดับ เช่น stage 1 เดิมระดับย่อย 3

ความสามารถ:

- แสดงลำดับบางส่วน
- สร้างช่องว่างคำตอบ
- สร้างตัวเลือกด้านล่าง
- ตรวจคำตอบถูก/ผิด
- ถูกครบแล้วจบ level หรือจบ game

---

## 8. ระบบ state กลาง

ใน `farm_logic_missions.js` ให้มี state กลาง เช่น:

```js
const state = {
    game: null,
    scene: null,
    config: null,
    currentLevelIndex: 0,
    mistakes: 0,
    startTime: 0,
    completedTargets: 0,
    currentTargets: 0,
    levelGroup: null,
    timerInterval: null
};
```

---

## 9. ระบบ transition กลาง

ย้าย `autoTransition()` จากแต่ละ stage มาไว้ engine

```js
function goNextLevel(scene) {
    clearInputEvents(scene);
    state.currentLevelIndex++;

    if (state.currentLevelIndex >= state.config.levels.length) {
        finishGame(scene);
        return;
    }

    showTransitionText(scene, '✨ เยี่ยมมาก! ไปต่อกันเลย ✨', () => {
        clearLevel(scene);
        startCurrentLevel(scene);
    });
}
```

---

## 10. ระบบ scoring กลาง

```js
function calculateStars(mistakes, scoring = {}) {
    const threeStarsMaxMistakes = scoring.threeStarsMaxMistakes ?? 1;
    const twoStarsMaxMistakes = scoring.twoStarsMaxMistakes ?? 4;

    if (mistakes <= threeStarsMaxMistakes) return 3;
    if (mistakes <= twoStarsMaxMistakes) return 2;
    return 1;
}
```

---

## 11. ระบบจบเกมและส่งผลคะแนน

```js
function finishGame(scene) {
    clearInputEvents(scene);
    clearLevel(scene);

    const duration = Math.floor((Date.now() - state.startTime) / 1000);
    const stars = calculateStars(state.mistakes, state.config.scoring);

    showResultOverlay(scene, {
        title: state.config.resultText || 'ภารกิจเสร็จสิ้น!',
        stars,
        duration,
        mistakes: state.mistakes
    });

    setTimeout(() => {
        if (typeof window.sendResult === 'function') {
            window.sendResult(window.STAGE_ID, stars, duration, state.mistakes);
        }
    }, 2000);
}
```

---

## 12. การปรับ `stage1.js`

เปลี่ยนจากไฟล์ Phaser เต็มรูปแบบเป็น config

### ต้องคง gameplay เดิม

- level 1: ลากเมล็ดพันธุ์ลงตะกร้า หลีกเลี่ยงก้อนหิน
- level 2: clicker กำจัดวัชพืช ระวังต้นกล้า
- level 3: เติมลำดับวงจรชีวิตพืช

### โครงสร้างใหม่

```js
(function () {
    const config = {
        title: 'แยกแยะเมล็ดพันธุ์',
        subtitle: 'สังเกตและเลือกสิ่งที่ตรงตามเงื่อนไข',
        background: '../assets/img/bg_farm.webp',
        resultText: 'คุณแยกแยะเมล็ดพันธุ์และวงจรชีวิตพืชสำเร็จแล้ว',
        assets: [
            ['bg_farm', '../assets/img/bg_farm.webp'],
            ['seed', '../assets/img/newseed.webp'],
            ['basket', '../assets/img/basket.webp'],
            ['rock', '../assets/img/rock.webp'],
            ['weed', '../assets/img/weed.webp'],
            ['sprout', '../assets/img/newsprout.webp'],
            ['plant', '../assets/img/newplant.webp']
        ],
        sounds: [
            ['correct', '../assets/sound/correct.mp3'],
            ['wrong', '../assets/sound/wrong.mp3']
        ],
        scales: {
            seed: 0.2,
            rock: 0.2,
            weed: 0.25,
            sprout: 0.25,
            plant: 0.25,
            basket: 0.35
        },
        levels: [
            // drag_sort
            // click_targets
            // sequence_drop
        ],
        scoring: {
            threeStarsMaxMistakes: 1,
            twoStarsMaxMistakes: 4
        }
    };

    bootFarmLogic(config);
})();
```

---

## 13. การปรับ `stage2.js`

### ต้องคง gameplay เดิม

- level 1: คัดแยกกระสอบปุ๋ยตามสี
- level 2: คัดแยกปุ๋ยตามรูปทรง
- level 3: ตรวจทั้งสีและรูปทรงพร้อมกัน

### type ที่ใช้

ทุก level ใช้ `drag_sort`

### หมายเหตุสำคัญ

- ตัวหลอกใน level 3 ให้ตั้ง `target: null`
- target จริงให้ตั้ง target zone ชัดเจน เช่น `zone_green_round`, `zone_red_square`
- ใช้พิกัดแบบสัดส่วนแทน `x = 650`, `y = 250`

---

## 14. การปรับ `stage3.js`

### ต้องคง gameplay เดิม

- level 1: กำจัดวัชพืชใบแหลม
- level 2: กำจัดแมลงที่ไม่ใช่สีแดง
- level 3: กำจัดแมลงสีแดงและวัชพืชใบกลม

### type ที่ใช้

ทุก level ใช้ `click_targets`

### หมายเหตุสำคัญ

- ควรใช้ grid position กลางจาก engine เพื่อไม่ให้ item ทับกัน
- ไม่ควรสุ่มตำแหน่งแบบ hard-code ใน stage file
- item ต้องมี `isTarget: true/false`

---

## 15. การปรับ `play_game.php`

เพิ่ม flag สำหรับ stage 1–3:

```php
$is_logic_stage = in_array($stage_id, [1, 2, 3], true);
```

แก้ class ของ wrapper:

```php
<div class="game-wrapper <?php echo $is_logic_stage ? 'logic-wrapper' : ''; ?> <?php echo ($is_conveyor_condition_stage || $is_debugger_stage) ? 'conveyor-wrapper' : ''; ?> <?php echo $is_debugger_stage ? 'debug-mode-wrapper' : ''; ?>">
    <div id="game-container"></div>
</div>
```

เพิ่ม CSS:

```css
.game-wrapper.logic-wrapper {
    max-width: min(1080px, calc(100vw - 24px));
    padding: 14px;
    align-items: stretch;
    border: 1px solid <?php echo $theme['border']; ?>;
    outline: 0;
    overflow: visible;
}
```

---

## 16. Helper กลางที่ควรมี

```js
function bootFarmLogic(config) {
    function boot() {
        window.FarmLogicMissions.run(config);
    }

    if (window.FarmLogicMissions) {
        boot();
    } else {
        const script = document.createElement('script');
        script.src = '../assets/js/logic_game/farm_logic_missions.js';
        script.onload = boot;
        document.head.appendChild(script);
    }
}
```

หรือวาง logic นี้ซ้ำใน `stage1.js`–`stage3.js` แบบเดียวกับ `stage4.js` ก็ได้

---

## 17. Acceptance Criteria

งานจะถือว่าเสร็จเมื่อผ่านเงื่อนไขต่อไปนี้:

### Functional

- [ ] `play_game.php?stage_id=1` เล่นได้ครบ 3 level และส่งคะแนนได้
- [ ] `play_game.php?stage_id=2` เล่นได้ครบ 3 level และส่งคะแนนได้
- [ ] `play_game.php?stage_id=3` เล่นได้ครบ 3 level และส่งคะแนนได้
- [ ] `window.sendResult(window.STAGE_ID, stars, duration, mistakes)` ยังถูกเรียกเมื่อจบเกม
- [ ] ระบบดาวยังทำงานใกล้เคียง logic เดิม
- [ ] เสียง correct/wrong ยังทำงาน
- [ ] drag/drop ใช้ได้ทั้ง mouse และ touch เท่าที่ Phaser รองรับ
- [ ] click target ใช้ได้ทั้ง mouse และ touch

### Layout

- [ ] canvas ไม่ล้น wrapper
- [ ] canvas อยู่กึ่งกลางใน `#phaser-canvas`
- [ ] side panel ไม่ทับ canvas
- [ ] บนจอเล็ก layout เปลี่ยนเป็น 1 column
- [ ] ไม่มีวัตถุสำคัญชิดขอบล่างจนถูกตัด
- [ ] ไม่มี scroll แนวนอนที่เกิดจากเกม

### Code Quality

- [ ] `stage1.js`, `stage2.js`, `stage3.js` ไม่มี `new Phaser.Game(...)`
- [ ] `stage1.js`, `stage2.js`, `stage3.js` ไม่มี `checkWinCondition()` ซ้ำกัน
- [ ] `stage1.js`, `stage2.js`, `stage3.js` เป็น config-driven เป็นหลัก
- [ ] scoring อยู่ใน `farm_logic_missions.js`
- [ ] result overlay อยู่ใน `farm_logic_missions.js`
- [ ] transition อยู่ใน `farm_logic_missions.js`
- [ ] ไม่มี global variable ชื่อทั่วไป เช่น `config`, `game`, `mistakes` รั่วออกนอก IIFE

---

## 18. Manual Test Checklist

ทดสอบบน browser:

```text
Chrome desktop
Chrome responsive mode: 390x844
Chrome responsive mode: 768x1024
Chrome responsive mode: 1366x768
```

URL ที่ต้องทดสอบ:

```text
pages/play_game.php?stage_id=1
pages/play_game.php?stage_id=2
pages/play_game.php?stage_id=3
pages/game_select.php?game_id=1
```

สิ่งที่ต้องเช็ก:

- [ ] หน้าเลือกด่านยังลิงก์ไปด่านถูกต้อง
- [ ] กดออกจากด่านกลับ `game_select.php?game_id=1` ได้
- [ ] เล่นจบแล้วไป `waiting_room.php?stage_id=...` ได้เหมือนเดิม
- [ ] คะแนนถูกบันทึกใน flow เดิมผ่าน `api/submit_score.php`
- [ ] ไม่มี error ใน console
- [ ] ไม่มี 404 ของ asset ภาพ/เสียง
- [ ] ไม่มี canvas ซ้อนหลายอันเมื่อ replay หรือเปลี่ยน level

---

## 19. Prompt สำหรับใช้กับ Codex

ใช้ prompt นี้ใน Codex เพื่อเริ่มงาน:

```text
Refactor lesson 1 game files stage1.js, stage2.js, and stage3.js to use a shared engine/layout similar to farm_missions.js.

Create a new file assets/js/logic_game/farm_logic_missions.js that owns:
- responsive shell layout inside #game-container
- Phaser bootstrapping inside #phaser-canvas
- shared state
- level transition
- scoring
- result overlay
- sendResult integration
- handlers for drag_sort, click_targets, and sequence_drop levels

Then rewrite assets/js/logic_game/stage1.js, stage2.js, and stage3.js to be config-driven files that call window.FarmLogicMissions.run(config). Preserve the existing gameplay, assets, sounds, scoring behavior, and final score submission.

Also update pages/play_game.php to add a logic-wrapper class for stage_id 1, 2, and 3 so the wrapper uses responsive layout and overflow visible, similar to conveyor-wrapper.

Acceptance criteria:
- stage_id=1, 2, 3 all play to completion
- scores are submitted using window.sendResult
- no duplicate Phaser.Game creation in stage1.js-stage3.js
- no canvas overflow or horizontal scroll on desktop/tablet/mobile
- existing stages 4-12 continue to work unchanged
```

---

## 20. Suggested Commit Plan

แนะนำแบ่งงานเป็น commit ย่อย:

1. `Add shared farm logic mission engine`
2. `Refactor lesson 1 stage configs to use shared engine`
3. `Update play game wrapper for lesson 1 layout`
4. `Test and tune responsive positions for lesson 1 games`

---

## 21. ความเสี่ยงและข้อควรระวัง

1. Phaser drag/drop อาจต้องทดสอบ touch จริง เพราะ browser mobile จัดการ pointer event ต่างกัน
2. ถ้าใช้ `scene.input.removeAllListeners()` ต้องระวังลบ listener ที่ Phaser หรือ plugin อื่นต้องใช้
3. ถ้ามีการสร้าง `new Phaser.Game` ซ้ำโดยไม่ destroy game เดิม อาจเกิด canvas ซ้อนหรือ memory leak
4. ต้องระวัง path asset เพราะ stage files อยู่ใน `pages/play_game.php` context ทำให้ path ปัจจุบันใช้ `../assets/...`
5. อย่าแก้ stage 4–12 ในรอบนี้ เพื่อลดความเสี่ยง regression

---

## 22. นิยามงานเสร็จสมบูรณ์

งานนี้เสร็จสมบูรณ์เมื่อเกมบทเรียนที่ 1 ทั้ง 3 ด่านใช้ engine กลางเดียวกัน แสดงผลถูกต้องบนหลายขนาดจอ เล่นจบได้ ส่งคะแนนได้ และไม่มีผลกระทบกับบทเรียนที่ 2–4
