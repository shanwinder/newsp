# แผนการพัฒนา Hybrid UI + Howler.js + GSAP สำหรับบทที่ 2

> แผนนี้อ้างอิงจากโครงสร้าง GitHub ล่าสุดของระบบเกมบทที่ 2 “เส้นทางเดินรถไถ” โดยเป้าหมายคือจัดสถาปัตยกรรมให้ชัดก่อน แล้วจึงเสริม Howler.js และ GSAP อย่างปลอดภัย ไม่รื้อระบบ Phaser เดิม

---

## 1. ข้อสรุปสำคัญ

จากโค้ดล่าสุด แนวทาง `stage4.js` ที่เป็นเพียงไฟล์ config แล้วส่งเข้า engine กลางผ่าน

```javascript
window.FarmMissions.sequence(config);
```

ถือว่าเป็นทิศทางที่ดีมาก ควรรักษาไว้ เพราะทำให้ `stage4.js`, `stage5.js`, `stage6.js` ใช้ engine เดียวกันได้

แต่ใน `farm_missions.js` ยังมีปัญหาเชิงสถาปัตยกรรม คือระบบ Sequence มีทั้ง

1. HTML UI ที่สร้างไว้ใน `createSequenceGame()`
2. Phaser UI ที่ยังวาดซ้ำใน `SequenceScene` เช่น command panel, feedback, header และปุ่มบางส่วน

ดังนั้นก่อนเพิ่ม Howler.js และ GSAP ควร refactor ให้ชัดก่อนว่า

```text
HTML / Bootstrap = UI, ภาษาไทย, ปุ่ม, feedback, command panel
Phaser Canvas = กระดานเกม, รถไถ, เป้าหมาย, สิ่งกีดขวาง, ผลผลิต, animation
Howler.js = ระบบเสียงกลาง
GSAP = animation ของ HTML UI
```

---

## 2. เป้าหมายการพัฒนา

1. ปรับบทที่ 2 ให้ใช้ Hybrid UI ที่ชัดเจน
2. ลดการวาดข้อความไทยและ UI ใน Phaser Canvas
3. ให้ HTML/Bootstrap เป็น UI จริงของ mission, feedback, command panel และปุ่มควบคุม
4. ให้ Phaser ทำเฉพาะสนามเกมและ animation
5. เพิ่มระบบเสียงกลางด้วย Howler.js แบบมี fallback
6. เพิ่ม animation ของ HTML UI ด้วย GSAP แบบมี fallback
7. ห้ามใส่ Howler/GSAP กระจายลงใน `stage4.js`, `stage5.js`, `stage6.js`
8. คงระบบ `window.sendResult()` ไว้เหมือนเดิม

---

## 3. งานระยะที่ 1: Refactor ระบบ Sequence ให้ HTML เป็น UI หลัก

### 3.1 สิ่งที่ต้องอยู่ใน HTML

- `level-indicator`
- `mission-title`
- `mission-text`
- `attempt-badge`
- `feedback-box`
- `sequence-container`
- ปุ่มลูกศร
- ปุ่มล้าง
- ปุ่มรันคำสั่ง
- ปุ่มเปิด/ปิดเสียง

### 3.2 สิ่งที่ต้องอยู่ใน Phaser

- grid
- รถไถ
- ตะกร้า/เป้าหมาย
- โรงนา
- กองฟาง
- หิน
- ผลผลิต
- animation รถไถเดิน
- effect ชน
- effect เก็บผลผลิต
- effect ผ่านด่าน

### 3.3 สิ่งที่ต้องลดหรือเลิกใช้ใน Sequence

| ส่วนเดิม | แนวทาง |
|---|---|
| `renderCommandPanel()` แบบ Phaser | ย้ายมา render ใน HTML |
| `showToast()` สำหรับ Sequence | เปลี่ยนเป็น `showSequenceFeedback()` ใน HTML |
| ปุ่มลูกศรที่วาดใน Phaser | ใช้ปุ่ม HTML |
| Header/ข้อความภาษาไทยใน Phaser | ใช้ HTML mission panel |
| Command blocks ใน Phaser | ใช้ HTML command blocks |

หมายเหตุ: ถ้าฟังก์ชันเหล่านี้ยังจำเป็นกับบทที่ 3 หรือ 4 ให้เก็บไว้ได้ แต่ Sequence ของบทที่ 2 ไม่ควรใช้ UI ใน Phaser เป็นหลัก

---

## 4. Helper ที่ควรเพิ่มใน `farm_missions.js`

### 4.1 อัปเดตภารกิจ

```javascript
function updateSequenceMissionUI(scene) {
    const level = scene.level();

    document.getElementById('level-indicator').innerText =
        `ด่านย่อยที่ ${scene.levelIndex + 1} / ${scene.gameConfig.levels.length}`;

    document.getElementById('mission-title').innerText = level.title || level.name;
    document.getElementById('mission-text').innerText = level.mission || level.goal;
}
```

### 4.2 อัปเดต badge attempts/mistakes

```javascript
function updateAttemptBadge(state) {
    const badge = document.getElementById('attempt-badge');
    if (!badge) return;

    badge.innerText = `ลอง ${state.attempts} | พลาด ${state.mistakes}`;

    if (window.GameMotion?.badgeUpdate) {
        window.GameMotion.badgeUpdate();
    }
}
```

### 4.3 แสดง feedback เป็น HTML

```javascript
function showSequenceFeedback(message, type = 'info') {
    const box = document.getElementById('feedback-box');
    if (!box) return;

    const map = {
        info: 'alert-info',
        success: 'alert-success',
        warning: 'alert-warning',
        error: 'alert-danger',
        danger: 'alert-danger'
    };

    box.className = `alert ${map[type] || 'alert-info'} rounded-4 shadow-sm mt-3 mb-0 py-2`;
    box.innerText = message;

    if (window.GameMotion?.feedback) {
        window.GameMotion.feedback(type);
    }
}
```

### 4.4 Render command panel เป็น HTML

```javascript
function renderSequenceCommands(scene) {
    const level = scene.level();
    const count = document.getElementById('command-count');
    const container = document.getElementById('sequence-container');

    if (count) {
        count.innerText = `${scene.commands.length} / ${level.maxCommands || 10}`;
    }

    if (!container) return;
    container.innerHTML = '';

    if (scene.commands.length === 0) {
        const placeholder = document.createElement('span');
        placeholder.className = 'text-muted small';
        placeholder.innerText = 'กดปุ่มลูกศรด้านล่างเพื่อเพิ่มคำสั่ง';
        container.appendChild(placeholder);
        return;
    }

    scene.commands.forEach((cmd, index) => {
        const block = document.createElement('button');
        block.type = 'button';
        block.className = 'sequence-block';
        block.innerText = DIRS[cmd].icon;
        block.title = `ลบคำสั่งที่ ${index + 1}`;

        block.addEventListener('click', () => {
            if (scene.isRunning) return;
            scene.commands.splice(index, 1);
            renderSequenceCommands(scene);
            playGameSound(scene, 'click');
        });

        container.appendChild(block);

        if (window.GameMotion?.commandAdded) {
            window.GameMotion.commandAdded(block);
        }
    });
}
```

### 4.5 ผูกปุ่ม HTML เข้ากับ Scene

```javascript
function bindSequenceControls(scene) {
    document.querySelectorAll('[data-dir]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const dir = btn.getAttribute('data-dir');
            scene.addCommand(dir);
        });
    });

    document.getElementById('clear-commands')?.addEventListener('click', () => {
        scene.clearCommands();
    });

    document.getElementById('run-commands')?.addEventListener('click', () => {
        scene.runCommands();
    });
}
```

---

## 5. งานระยะที่ 2: เพิ่ม Howler.js เป็นระบบเสียงกลาง

### 5.1 ไฟล์ใหม่ที่ควรสร้าง

```text
assets/js/game_audio.js
```

### 5.2 หน้าที่ของ `GameAudio`

- โหลดเสียงกลางของเกม
- เล่นเสียงตาม key
- เปิด/ปิดเสียง
- จำค่าปิดเสียงไว้ใน `localStorage`
- ทำงานแบบไม่ทำให้เกมพัง ถ้า Howler.js ไม่ถูกโหลด

### 5.3 ตัวอย่างโครง `game_audio.js`

```javascript
(function () {
    let enabled = localStorage.getItem('game_sound_enabled') !== 'false';
    let sounds = {};

    function init() {
        if (typeof Howl === 'undefined') {
            console.warn('Howler.js not loaded.');
            return;
        }

        sounds = {
            click: new Howl({ src: ['../assets/sound/click.mp3'], volume: 0.35 }),
            run: new Howl({ src: ['../assets/sound/tractor_start.mp3'], volume: 0.45 }),
            move: new Howl({ src: ['../assets/sound/tractor_move.mp3'], volume: 0.25 }),
            crash: new Howl({ src: ['../assets/sound/crash.mp3'], volume: 0.65 }),
            collect: new Howl({ src: ['../assets/sound/collect.mp3'], volume: 0.6 }),
            correct: new Howl({ src: ['../assets/sound/correct.mp3'], volume: 0.6 }),
            wrong: new Howl({ src: ['../assets/sound/wrong.mp3'], volume: 0.55 }),
            success: new Howl({ src: ['../assets/sound/success.mp3'], volume: 0.7 }),
            victory: new Howl({ src: ['../assets/sound/victory.mp3'], volume: 0.8 })
        };

        Howler.mute(!enabled);
    }

    window.GameAudio = {
        init,
        play(key) {
            if (!enabled || !sounds[key]) return;
            sounds[key].stop();
            sounds[key].play();
        },
        setEnabled(value) {
            enabled = !!value;
            localStorage.setItem('game_sound_enabled', enabled ? 'true' : 'false');
            if (typeof Howler !== 'undefined') Howler.mute(!enabled);
        },
        isEnabled() {
            return enabled;
        },
        toggle() {
            this.setEnabled(!enabled);
            return enabled;
        }
    };

    document.addEventListener('DOMContentLoaded', init);
})();
```

### 5.4 Wrapper เสียงใน `farm_missions.js`

```javascript
function playGameSound(scene, key) {
    if (window.GameAudio?.play) {
        window.GameAudio.play(key);
        return;
    }

    // fallback เดิมด้วย Phaser sound
    if (scene?.sound && scene.cache.audio.exists(key)) {
        scene.sound.play(key, { volume: 0.6 });
    }
}
```

### 5.5 จุดที่ควรเล่นเสียง

| เหตุการณ์ | key |
|---|---|
| เพิ่มคำสั่ง | `click` |
| ลบคำสั่ง | `click` |
| ล้างคำสั่ง | `click` |
| กดรันรถไถ | `run` |
| รถไถเดิน | `move` |
| ชนสิ่งกีดขวาง | `crash` |
| ออกนอกแปลง | `wrong` |
| เก็บผลผลิต | `collect` |
| ผ่านด่านย่อย | `success` |
| ผ่านครบ stage | `victory` |

---

## 6. งานระยะที่ 3: เพิ่ม GSAP สำหรับ HTML UI Motion

### 6.1 ไฟล์ใหม่ที่ควรสร้าง

```text
assets/js/game_ui_motion.js
```

### 6.2 ใช้ GSAP กับอะไร

ใช้กับ HTML UI เท่านั้น เช่น

- mission panel
- feedback box
- command block
- attempt badge
- completion hero
- sticky CTA
- result stars

ไม่ใช้กับ

- รถไถ
- grid
- obstacle
- crop
- Phaser object

### 6.3 ตัวอย่าง `game_ui_motion.js`

```javascript
(function () {
    function hasGsap() {
        return typeof window.gsap !== 'undefined';
    }

    window.GameMotion = {
        missionEnter() {
            if (!hasGsap()) return;
            gsap.from('.sequence-mission', {
                y: -18,
                opacity: 0,
                duration: 0.35,
                ease: 'back.out(1.5)'
            });
        },

        commandAdded(el) {
            if (!hasGsap() || !el) return;
            gsap.from(el, {
                scale: 0,
                y: -8,
                duration: 0.22,
                ease: 'back.out(2)'
            });
        },

        feedback(type = 'info') {
            if (!hasGsap()) return;

            const box = document.getElementById('feedback-box');
            if (!box) return;

            if (type === 'error' || type === 'danger') {
                gsap.fromTo(box, { x: -8 }, {
                    x: 8,
                    duration: 0.06,
                    repeat: 5,
                    yoyo: true,
                    clearProps: 'x'
                });
            } else {
                gsap.fromTo(box, { scale: 0.96, opacity: 0.6 }, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.24,
                    ease: 'back.out(1.7)'
                });
            }
        },

        badgeUpdate() {
            if (!hasGsap()) return;
            const badge = document.getElementById('attempt-badge');
            if (!badge) return;

            gsap.fromTo(badge, { scale: 1.12 }, {
                scale: 1,
                duration: 0.18,
                ease: 'power2.out'
            });
        },

        completionHero() {
            if (!hasGsap()) return;
            gsap.from('.completion-hero', {
                y: -28,
                opacity: 0,
                duration: 0.5,
                ease: 'back.out(1.6)'
            });
        },

        stickyCta() {
            if (!hasGsap()) return;
            gsap.from('.project-sticky-cta', {
                y: 70,
                opacity: 0,
                duration: 0.4,
                ease: 'power3.out'
            });
        },

        resultStars() {
            if (!hasGsap()) return;
            gsap.from('.result-star', {
                scale: 0,
                rotation: -20,
                duration: 0.28,
                stagger: 0.12,
                ease: 'back.out(2)'
            });
        }
    };
})();
```

---

## 7. การโหลด Library

### 7.1 ทดลองด้วย CDN

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="../assets/js/game_audio.js"></script>
<script src="../assets/js/game_ui_motion.js"></script>
```

### 7.2 ใช้งานจริงควรเก็บเป็น local files

แนะนำโครงสร้าง

```text
assets/vendor/howler/howler.min.js
assets/vendor/gsap/gsap.min.js
assets/js/game_audio.js
assets/js/game_ui_motion.js
```

แล้วเรียกใช้

```html
<script src="../assets/vendor/howler/howler.min.js"></script>
<script src="../assets/vendor/gsap/gsap.min.js"></script>
<script src="../assets/js/game_audio.js"></script>
<script src="../assets/js/game_ui_motion.js"></script>
```

ข้อเสนอ: ช่วงทดลองใช้ CDN ได้ แต่ก่อนใช้จริงในโรงเรียนควรใช้ไฟล์ local เพื่อลดปัญหาอินเทอร์เน็ตหรือ CDN ช้า

---

## 8. ปรับ Final Result ให้เป็น HTML Overlay

ปัจจุบันผลลัพธ์ท้ายเกมอาจวาดด้วย Phaser text ได้ แต่ถ้าต้องการความคมชัดของภาษาไทยและใช้ GSAP กับดาว ควรเปลี่ยนเป็น HTML overlay

ตัวอย่าง

```javascript
function showHtmlResult(stars, duration, attempts, message, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'game-result-overlay';
    overlay.innerHTML = `
        <div class="game-result-card">
            <h2>🏆 ภารกิจสำเร็จ!</h2>
            <p>${message}</p>
            <div class="stars">
                ${Array.from({ length: stars }).map(() => '<span class="result-star">⭐</span>').join('')}
            </div>
            <div class="text-muted">ใช้เวลา ${duration} วินาที | พยายาม ${attempts} ครั้ง</div>
        </div>
    `;

    document.body.appendChild(overlay);

    window.GameAudio?.play('victory');
    window.GameMotion?.resultStars();

    setTimeout(() => {
        callback?.();
    }, 1900);
}
```

CSS

```css
.game-result-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.72);
}

.game-result-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 32px;
    max-width: 480px;
    width: calc(100% - 32px);
    text-align: center;
    box-shadow: 0 24px 60px rgba(0,0,0,.25);
}

.result-star {
    display: inline-block;
    font-size: 42px;
    margin: 0 4px;
}
```

---

## 9. คำสั่งสำหรับ Codex

ให้ Codex ดำเนินการตามลำดับนี้

```text
1. ตรวจไฟล์ assets/js/logic_game/farm_missions.js
2. ปรับเฉพาะระบบ Sequence ของบทที่ 2 ก่อน
3. ให้ HTML/Bootstrap เป็น UI หลักของ Sequence:
   - mission panel
   - feedback box
   - command sequence
   - arrow buttons
   - clear/run buttons
   - attempt badge
4. ให้ Phaser ของ Sequence เหลือเฉพาะ:
   - board/grid
   - tractor
   - target
   - obstacles
   - crops
   - barn
   - movement animation
   - collision/collect effects
5. ลดหรือเลิกใช้ renderCommandPanel() แบบ Phaser ใน Sequence
6. เปลี่ยน feedback ของ Sequence จาก showToast ใน Phaser เป็น showSequenceFeedback ใน HTML
7. เพิ่ม helper สำหรับ render command panel แบบ HTML
8. เพิ่ม helper สำหรับ bind ปุ่ม HTML กับ SequenceScene
9. สร้างไฟล์ assets/js/game_audio.js สำหรับ Howler.js
10. สร้างไฟล์ assets/js/game_ui_motion.js สำหรับ GSAP
11. เพิ่ม wrapper playGameSound(scene, key) ใน farm_missions.js
12. ให้ playGameSound ใช้ window.GameAudio ก่อน ถ้าไม่มีจึง fallback ไป Phaser sound
13. เพิ่ม hook GameMotion ใน feedback, commandAdded, badgeUpdate, completionHero/stickyCTA
14. ห้ามเขียน Howler/GSAP กระจายใน stage4.js, stage5.js, stage6.js
15. ห้ามใช้ GSAP แทน Phaser tween ของรถไถ
16. ห้ามแก้บทที่ 3 และ 4 ในรอบนี้ เว้นแต่จำเป็นเพื่อไม่ให้ระบบพัง
17. ห้ามแก้ database ในรอบนี้
18. ทดสอบ play_game.php?stage_id=4, 5, 6
19. ตรวจว่า window.sendResult() ยังทำงานเหมือนเดิม
```

---

## 10. สิ่งที่ยังไม่ทำในรอบนี้

ยังไม่ต้องทำ

- เปลี่ยน emoji เป็นภาพ HD จริง
- ทำ asset pack ใหม่
- ใช้ Tiled Map Editor
- เพิ่มเพลงพื้นหลังยาว ๆ
- เพิ่ม GSAP animation จำนวนมาก
- แก้ระบบสร้างชิ้นงาน
- แก้บทที่ 3 และ 4
- เปลี่ยน Phaser เป็น framework อื่น

เหตุผลคือรอบนี้ต้องทำให้โครงสร้างบทที่ 2 สะอาดก่อน แล้วค่อยเสริมคุณภาพในระยะถัดไป

---

## 11. Checklist ตรวจรับงาน

| รายการตรวจสอบ | ต้องผ่าน |
|---|---|
| `stage4.js` ยังเป็น config file | ผ่าน |
| `window.FarmMissions.sequence(config)` ยังทำงาน | ผ่าน |
| `farm_missions.js` แยก HTML UI กับ Phaser ชัดขึ้น | ผ่าน |
| Command panel ของ Sequence เป็น HTML | ผ่าน |
| Feedback ของ Sequence เป็น HTML | ผ่าน |
| ปุ่มลูกศรของ Sequence เป็น HTML | ผ่าน |
| Phaser เหลือเฉพาะ board และ object เกม | ผ่าน |
| ภาษาไทยใน UI หลักไม่อยู่ใน Canvas | ผ่าน |
| มี `game_audio.js` | ผ่าน |
| มี `game_ui_motion.js` | ผ่าน |
| ถ้าไม่มี Howler ระบบยังไม่พัง | ผ่าน |
| ถ้าไม่มี GSAP ระบบยังไม่พัง | ผ่าน |
| มี wrapper `playGameSound()` | ผ่าน |
| มี hook `GameMotion` | ผ่าน |
| กดเพิ่มคำสั่งแล้ว UI update ถูกต้อง | ผ่าน |
| กดรันแล้วรถไถยังเคลื่อนที่ถูกต้อง | ผ่าน |
| ชน/ออกนอกแปลง/เก็บผลผลิต feedback ถูกต้อง | ผ่าน |
| attempts/mistakes update ถูกต้อง | ผ่าน |
| ผ่านครบ 3 ด่านย่อยแล้วยังส่ง `window.sendResult()` | ผ่าน |
| stage 4, 5, 6 ยังเล่นได้ครบ | ผ่าน |

---

## 12. ข้อดีของแนวทางนี้

| ด้าน | ข้อดี |
|---|---|
| คุณภาพ UI | คมชัดกว่า เพราะใช้ HTML/Bootstrap |
| ภาษาไทย | ลดปัญหาวรรณยุกต์ใน Canvas |
| โค้ด | แยกความรับผิดชอบชัดเจน |
| เสียง | มีระบบเสียงกลาง ใช้ซ้ำได้หลายด่าน |
| Animation | UI ดูมีชีวิตขึ้นโดยไม่รบกวน Phaser |
| ความปลอดภัย | มี fallback ถ้า library ไม่โหลด |
| การพัฒนาต่อ | พร้อมเปลี่ยน asset HD ภายหลัง |
| การดูแล | ไม่ต้องแก้โค้ดซ้ำในทุก stage |

---

## 13. ข้อเสียและความเสี่ยง

| ความเสี่ยง | วิธีลดความเสี่ยง |
|---|---|
| ต้อง refactor `farm_missions.js` | ทำเฉพาะ Sequence ก่อน |
| HTML UI กับ Phaser state อาจไม่ sync | สร้าง helper กลางสำหรับ update UI |
| เพิ่ม dependency ใหม่ | โหลดเฉพาะหน้าเกม หรือเก็บไฟล์ local |
| Codex อาจใส่ GSAP/Howler กระจาย | กำหนดให้เรียกผ่าน `GameAudio` และ `GameMotion` เท่านั้น |
| เสียงอาจรบกวนเด็ก | มีปุ่มปิดเสียง และใช้เสียงสั้น |
| Animation อาจเยอะเกินไป | ใช้เฉพาะ feedback, command, hero, sticky CTA |

---

## 14. สรุป

จากโค้ดปัจจุบัน สิ่งที่ควรทำก่อนเพิ่มลูกเล่นคือการทำให้สถาปัตยกรรม Hybrid ชัดเจน

```text
HTML/Bootstrap = UI ภาษาไทย ปุ่ม คำสั่ง feedback
Phaser = กระดานเกม รถไถ object และ animation
Howler.js = ระบบเสียงกลาง
GSAP = animation ของ HTML UI
```

Howler.js และ GSAP เหมาะกับโปรเจกต์นี้ แต่ควรเพิ่มหลังจาก refactor Sequence UI ให้สะอาดก่อน ไม่ควรใส่ทับลงไปในโค้ดที่ยังมี UI ซ้อนกันระหว่าง HTML กับ Phaser

เป้าหมายรอบนี้คือทำให้โครงสร้างพร้อมต่อยอดอย่างมั่นคง เพื่อให้บทที่ 2 มีคุณภาพดีขึ้นทั้งด้านการเล่น ความคมชัดของ UI ระบบเสียง และ animation โดยไม่ทำให้ระบบซับซ้อนเกินจำเป็น
