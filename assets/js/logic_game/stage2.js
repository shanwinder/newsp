// assets/js/logic_game/stage2.js
(function () {
    'use strict'; // เปิดโหมด Strict เพื่อช่วยจับ Error

    document.addEventListener('DOMContentLoaded', function () {

        const STAGE_ID = window.STAGE_ID || 2; 

        // ตัวแปรสำหรับจัดการสถานะเกม
        let startTime;
        let totalAttempts = 0;
        let currentSubLevel = 0;
        const totalSubLevels = 3;
        let levelObjects = []; // เก็บวัตถุเพื่อลบทิ้งตอนเปลี่ยนด่าน

        const config = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.NO_CENTER,
                width: 900,
                height: 600,
            },
            parent: "game-container",
            backgroundColor: '#FFF8E1', // สีครีมพาสเทล
            scene: {
                preload: preload,
                create: create
            }
        };

        function preload() {
            this.load.setBaseURL('../'); 
            
            // โหลดรูปภาพ
            this.load.image("sq_red", "assets/img/red_square.webp");
            this.load.image("ci_green", "assets/img/green_circle.webp");
            this.load.image("tri_blue", "assets/img/blue_triangle.webp");
            this.load.image("sq_yellow", "assets/img/yellow_square.webp");
            
            // โหลดเสียง
            this.load.audio("correct", "assets/sound/correct.mp3");
            this.load.audio("wrong", "assets/sound/wrong.mp3");
        }

        function create() {
            const scene = this;
            startTime = Date.now();
            totalAttempts = 0;
            currentSubLevel = 0;
            levelObjects = [];

            // --- 0. เตรียม Particle System ---
            createShapeTexture(scene, 'part_circle', 'circle');
            createShapeTexture(scene, 'part_square', 'square');
            createShapeTexture(scene, 'part_triangle', 'triangle');

            const vibrantColors = [0xFF3333, 0x33FF33, 0x3333FF, 0xFFFF33, 0xFF33FF, 0x33FFFF];
            
            const particleConfig = {
                speed: { min: 150, max: 500 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.8, end: 0 },
                alpha: { start: 1, end: 0 },
                tint: vibrantColors,
                blendMode: 'NORMAL',
                lifespan: 1200,
                gravityY: 200,
                emitting: false
            };

            // สร้าง Emitter เก็บไว้ในตัวแปร scene เพื่อเรียกใช้ได้ทุกที่
            scene.emitters = [
                scene.add.particles(0, 0, 'part_circle', particleConfig).setDepth(100),
                scene.add.particles(0, 0, 'part_square', particleConfig).setDepth(100),
                scene.add.particles(0, 0, 'part_triangle', particleConfig).setDepth(100)
            ];

            // --- 1. เตรียมข้อมูลด่านย่อย (Level Data) ---
            scene.levelData = [
                {   // Level 1: ABAB (แดง, เขียว) - หายตัวท้าย
                    sequence: ["sq_red", "ci_green", "sq_red", "ci_green", "sq_red", "ci_green"],
                    missing: [5],
                    options: ["sq_red", "ci_green", "tri_blue"]
                },
                {   // Level 2: ABC (แดง, เขียว, ฟ้า) - หายตัวกลาง
                    sequence: ["sq_red", "ci_green", "tri_blue", "sq_red", "ci_green", "tri_blue"],
                    missing: [4], // หายที่ Green Circle ตัวที่ 2
                    options: ["sq_red", "ci_green", "tri_blue", "sq_yellow"]
                },
                {   // Level 3: ABC - หาย 2 ตัว (ตัวที่ 2 และ 6)
                    sequence: ["sq_red", "ci_green", "tri_blue", "sq_red", "ci_green", "tri_blue"],
                    missing: [1, 5], 
                    options: ["ci_green", "tri_blue", "sq_red", "sq_yellow"]
                }
            ];

            // เริ่มโหลดด่านย่อยแรก
            loadSubLevel(scene, 0);
        }

        // --- Helper Functions (ประกาศภายใน create Scope หรือ Scene Scope) ---

        function loadSubLevel(scene, index) {
            // ล้างวัตถุเก่า
            if (levelObjects.length > 0) {
                levelObjects.forEach(obj => obj.destroy());
            }
            levelObjects = [];

            const data = scene.levelData[index];

            // UI: หัวข้อด่าน
            const titleText = scene.add.text(450, 50, `ด่านย่อยที่ ${index + 1} / 3`, { 
                fontSize: '36px', color: '#555', fontFamily: 'Kanit', fontStyle: 'bold' 
            }).setOrigin(0.5);
            levelObjects.push(titleText);

            // UI: Progress Bar
            const barBg = scene.add.rectangle(450, 90, 300, 10, 0xdddddd, 1);
            const barFill = scene.add.rectangle(300, 90, (300 / totalSubLevels) * (index + 1), 10, 0x2ecc71, 1).setOrigin(0, 0.5);
            levelObjects.push(barBg, barFill);

            // พื้นหลังโจทย์
            const bg = scene.add.graphics();
            bg.fillStyle(0xffffff, 0.9);
            bg.fillRoundedRect(50, 130, 800, 160, 20);
            bg.lineStyle(4, 0xffb74d, 1);
            bg.strokeRoundedRect(50, 130, 800, 160, 20);
            levelObjects.push(bg);

            // สร้างโจทย์
            const dropZones = [];
            let startX = 150;

            data.sequence.forEach((shapeKey, i) => {
                const x = startX + (i * 120);
                const y = 210;

                if (data.missing.includes(i)) {
                    // ช่องว่าง
                    const zone = scene.add.zone(x, y, 100, 100).setRectangleDropZone(100, 100);
                    const graphics = scene.add.graphics();
                    graphics.lineStyle(2, 0x94a3b8, 1);
                    graphics.strokeRect(x - 50, y - 50, 100, 100);
                    
                    const qText = scene.add.text(x, y, "?", { fontSize: '40px', color: '#cbd5e1', fontFamily: 'Kanit' }).setOrigin(0.5);

                    zone.setData({ answer: shapeKey, isFilled: false });
                    dropZones.push(zone);
                    levelObjects.push(zone, graphics, qText);
                } else {
                    // รูปโจทย์
                    const img = scene.add.image(x, y, shapeKey).setDisplaySize(90, 90);
                    levelObjects.push(img);
                }
            });

            // สร้างตัวเลือก
            const options = [...data.options]; // Copy array
            Phaser.Utils.Array.Shuffle(options);

            const spacing = 140;
            const totalWidth = (options.length - 1) * spacing;
            const startOptionX = 450 - (totalWidth / 2);

            options.forEach((shapeKey, i) => {
                const x = startOptionX + (i * spacing);
                const y = 480;
                
                const base = scene.add.circle(x, y, 60, 0xffffff, 0.8).setStrokeStyle(2, 0xe2e8f0);
                const item = scene.add.image(x, y, shapeKey).setDisplaySize(100, 100).setInteractive();
                scene.input.setDraggable(item);
                
                const baseScale = item.scale;
                item.setData({ type: shapeKey, originX: x, originY: y, baseScale: baseScale });
                
                levelObjects.push(base, item);
            });

            // Setup Logic การลาก
            setupDragEvents(scene, dropZones);
        }

        function setupDragEvents(scene, dropZones) {
            // ล้าง Event เก่าป้องกันการซ้อนทับ
            scene.input.off('dragstart');
            scene.input.off('drag');
            scene.input.off('drop');
            scene.input.off('dragend');

            scene.input.on('dragstart', (pointer, gameObject) => {
                scene.children.bringToTop(gameObject);
                const startScale = gameObject.getData('baseScale');
                scene.tweens.add({ targets: gameObject, scale: startScale * 1.2, duration: 150, ease: 'Back.out' });
            });

            scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
                gameObject.x = dragX;
                gameObject.y = dragY;
            });

            scene.input.on('drop', (pointer, gameObject, dropZone) => {
                const correctAnswer = dropZone.getData('answer');
                const droppedType = gameObject.getData('type');
                const startScale = gameObject.getData('baseScale');

                if (droppedType === correctAnswer && !dropZone.getData('isFilled')) {
                    // ✅ Correct
                    gameObject.disableInteractive();
                    dropZone.setData('isFilled', true);
                    
                    scene.tweens.add({
                        targets: gameObject, x: dropZone.x, y: dropZone.y, scale: startScale * 0.9, duration: 300, ease: 'Back.out',
                        onComplete: () => {
                            explodeParticles(scene, dropZone.x, dropZone.y);
                            playSound(scene, 'correct');
                            
                            // เช็คว่าจบด่านย่อยยัง?
                            const isSubLevelComplete = dropZones.every(z => z.getData('isFilled'));
                            if (isSubLevelComplete) {
                                handleSubLevelComplete(scene);
                            }
                        }
                    });
                } else {
                    // ❌ Wrong
                    totalAttempts++;
                    returnToOrigin(scene, gameObject);
                    wrongEffect(scene, gameObject);
                }
            });

            scene.input.on('dragend', (pointer, gameObject, dropped) => {
                if (!dropped) {
                    returnToOrigin(scene, gameObject);
                }
            });
        }

        function handleSubLevelComplete(scene) {
            scene.time.delayedCall(1000, () => {
                if (currentSubLevel < totalSubLevels - 1) {
                    // ไปด่านย่อยถัดไป
                    currentSubLevel++;
                    scene.cameras.main.fade(300, 0, 0, 0);
                    scene.cameras.main.once('camerafadeoutcomplete', () => {
                        loadSubLevel(scene, currentSubLevel);
                        scene.cameras.main.fadeIn(300);
                    });
                } else {
                    // จบเกม (ผ่านครบ 3 ด่านย่อย)
                    checkGlobalWin(scene);
                }
            });
        }

        function checkGlobalWin(scene) {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            
            // ⭐ เกณฑ์ให้คะแนน
            let stars = 1;
            if (totalAttempts === 0 && duration < 60) stars = 3; 
            else if (totalAttempts <= 2) stars = 2; 

            showWinPopup(scene, stars, duration);
        }

        function showWinPopup(scene, stars, duration) {
            const overlay = scene.add.rectangle(450, 300, 900, 600, 0x000000, 0.8).setDepth(20).setAlpha(0);
            scene.tweens.add({ targets: overlay, alpha: 0.8, duration: 300 });

            const phrases = ["🎉 ยอดเยี่ยม! 🎉", "🌟 สุดยอด! 🌟", "✨ เก่งมาก! ✨", "🏆 ไร้ที่ติ! 🏆"];
            const randomPhrase = Phaser.Utils.Array.GetRandom(phrases);

            const text = scene.add.text(450, 250, randomPhrase, { 
                fontSize: '64px', color: '#ffd700', fontFamily: 'Kanit', stroke: '#fff', strokeThickness: 6
            }).setOrigin(0.5).setDepth(22).setScale(0);

            scene.tweens.add({ targets: text, scale: 1, duration: 500, ease: 'Back.out' });

            let starStr = "";
            for(let i=0; i<stars; i++) starStr += "⭐";
            const starText = scene.add.text(450, 350, starStr, { fontSize: '48px' }).setOrigin(0.5).setDepth(22).setAlpha(0);
            
            scene.tweens.add({ targets: starText, alpha: 1, delay: 300, duration: 500 });

            scene.time.delayedCall(2000, () => {
                window.location.href = `waiting_room.php?stage_id=${STAGE_ID}`;
            });
            
            if (typeof window.sendResult === 'function') {
                window.sendResult(STAGE_ID, stars, duration, totalAttempts);
            }
        }

        // --- Helpers ---
        function explodeParticles(scene, x, y) {
            if (scene.emitters) {
                scene.emitters.forEach(emitter => emitter.explode(20, x, y));
            }
        }

        function returnToOrigin(scene, gameObject) {
            const startScale = gameObject.getData('baseScale');
            scene.tweens.add({
                targets: gameObject, x: gameObject.getData('originX'), y: gameObject.getData('originY'), scale: startScale, duration: 400, ease: 'Cubic.out'
            });
        }

        function wrongEffect(scene, gameObject) {
            playSound(scene, 'wrong');
            scene.cameras.main.shake(100, 0.005);
            gameObject.setTint(0xff9999);
            scene.time.delayedCall(500, () => gameObject.clearTint());
        }

        function playSound(scene, key) {
            try { scene.sound.play(key, { volume: 0.5 }); } catch (e) {}
        }

        function createShapeTexture(scene, key, type) {
            if (scene.textures.exists(key)) return;
            const g = scene.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff, 1); 
            if (type === 'circle') g.fillCircle(16, 16, 14);
            else if (type === 'square') g.fillRect(4, 4, 24, 24);
            else if (type === 'triangle') {
                g.beginPath(); g.moveTo(16, 4); g.lineTo(28, 28); g.lineTo(4, 28); g.closePath(); g.fillPath();
            }
            g.generateTexture(key, 32, 32);
        }
        
        // เริ่มเกม
        new Phaser.Game(config);
    });
})();