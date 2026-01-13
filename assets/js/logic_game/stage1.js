// assets/js/logic_game/stage1.js
(function () {
    document.addEventListener('DOMContentLoaded', function () {

        const config = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.NO_CENTER,
                width: 900,
                height: 600,
            },
            parent: "game-container",
            backgroundColor: '#87CEEB',
            scene: {
                preload: preload,
                create: create
            }
        };

        let startTime;
        let attempts = 0;

        function preload() {
            this.load.setBaseURL('../'); 
            this.load.image("cat", "assets/img/cat.webp");
            this.load.image("dog", "assets/img/dog.webp");
            this.load.image("rabbit", "assets/img/rabbit.webp");
            // ❌ ไม่ต้องโหลด star.webp แล้ว เราจะวาดเอง
        }

        function create() {
            const scene = this;
            startTime = Date.now();
            attempts = 0;

            // --- 🛠️ สร้างรูปดาวด้วยโค้ด (Generate Star Texture) ---
            // ส่วนนี้จะวาดดาวขึ้นมาแล้วเก็บเป็น Texture ชื่อ 'star'
            if (!scene.textures.exists('star')) {
                const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
                graphics.fillStyle(0xffffff, 1);
                
                // วาดดาว 5 แฉก
                const cx = 16, cy = 16, outer = 15, inner = 7;
                graphics.beginPath();
                for (let i = 0; i < 5; i++) {
                    // จุดยอด
                    graphics.lineTo(
                        cx + Math.cos((18 + i * 72) * 0.01745) * outer,
                        cy - Math.sin((18 + i * 72) * 0.01745) * outer
                    );
                    // จุดร่อง
                    graphics.lineTo(
                        cx + Math.cos((54 + i * 72) * 0.01745) * inner,
                        cy - Math.sin((54 + i * 72) * 0.01745) * inner
                    );
                }
                graphics.closePath();
                graphics.fillPath();
                
                // แปลงกราฟิกเป็น Texture ขนาด 32x32 pixel
                graphics.generateTexture('star', 128, 128);
            }

            // --- 0. Setup Particle (ใช้ Texture 'star' ที่เพิ่งสร้าง) ---
            const emitter = scene.add.particles(0, 0, 'star', {
                speed: { min: 200, max: 500 },
                angle: { min: 0, max: 360 },
                scale: { start: 1, end: 0 },
                alpha: { start: 1, end: 0 },
                tint: [ 0xff0000, 0xffaa00, 0x00ff00, 0x00ffff, 0xff00ff ],
                blendMode: 'ADD',
                gravityY: 200,
                lifespan: 1000,
                quantity: 20,
                emitting: false
            });

            // --- 1. UI ---
            scene.add.text(450, 50, "โจทย์: เรียงลำดับสัตว์ให้ถูกต้อง 🐶🐱🐰", { 
                fontSize: '32px', color: '#ffffff', fontFamily: 'Kanit', stroke: '#000', strokeThickness: 4 
            }).setOrigin(0.5);

            const bg = scene.add.graphics();
            bg.fillStyle(0xffffff, 0.8);
            bg.fillRoundedRect(50, 120, 800, 160, 20);

            // --- 2. Create Zones ---
            const sequence = ["dog", "cat", "rabbit", "dog", "cat", "rabbit"];
            const missingIndices = [2, 4];
            const dropZones = [];
            let startX = 150;
            
            sequence.forEach((animal, i) => {
                const x = startX + (i * 120);
                const y = 200;

                if (missingIndices.includes(i)) {
                    const zone = scene.add.zone(x, y, 100, 100).setRectangleDropZone(100, 100);
                    const graphics = scene.add.graphics();
                    graphics.lineStyle(2, 0x000000, 0.5);
                    graphics.strokeRect(x - 50, y - 50, 100, 100);
                    zone.setData({ answer: animal, isFilled: false });
                    dropZones.push(zone);
                } else {
                    scene.add.image(x, y, animal).setDisplaySize(90, 90);
                }
            });

            // --- 3. Create Draggable Items ---
            const options = ["cat", "rabbit", "dog"];
            Phaser.Utils.Array.Shuffle(options);

            options.forEach((animal, i) => {
                const x = 300 + (i * 150);
                const y = 500;
                
                scene.add.circle(x, y, 60, 0xffffff, 0.5);

                const item = scene.add.image(x, y, animal).setDisplaySize(100, 100).setInteractive();
                scene.input.setDraggable(item);
                
                const baseScale = item.scale; 
                item.setData({ 
                    type: animal, 
                    originX: x, 
                    originY: y,
                    baseScale: baseScale 
                });
            });

            // --- 4. Animation Logic ---
            scene.input.on('dragstart', function (pointer, gameObject) {
                scene.children.bringToTop(gameObject);
                const startScale = gameObject.getData('baseScale');
                
                scene.tweens.add({
                    targets: gameObject,
                    scale: startScale * 1.2,
                    angle: 15,
                    duration: 100,
                    ease: 'Power2'
                });
            });

            scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
                gameObject.x = dragX;
                gameObject.y = dragY;
            });

            scene.input.on('drop', function (pointer, gameObject, dropZone) {
                const correctAnswer = dropZone.getData('answer');
                const droppedType = gameObject.getData('type');
                const startScale = gameObject.getData('baseScale');

                if (droppedType === correctAnswer && !dropZone.getData('isFilled')) {
                    // ✅ Correct
                    gameObject.disableInteractive();
                    dropZone.setData('isFilled', true);
                    
                    scene.tweens.add({
                        targets: gameObject,
                        x: dropZone.x,
                        y: dropZone.y,
                        scale: startScale * 0.9,
                        angle: 0,
                        duration: 300,
                        ease: 'Back.out',
                        onComplete: () => {
                            // 💥 จุดพลุดาว 50 เม็ด!
                            emitter.explode(50, dropZone.x, dropZone.y);
                            checkWin();
                        }
                    });

                    try { scene.sound.play('correct'); } catch(e){}

                } else {
                    // ❌ Wrong
                    wrongAnimation(gameObject);
                }
            });

            scene.input.on('dragend', (pointer, gameObject, dropped) => {
                if (!dropped) {
                    const startScale = gameObject.getData('baseScale');
                    scene.tweens.add({
                        targets: gameObject,
                        x: gameObject.getData('originX'),
                        y: gameObject.getData('originY'),
                        scale: startScale, 
                        angle: 0,
                        duration: 500,
                        ease: 'Cubic.out'
                    });
                }
            });

            function wrongAnimation(gameObject) {
                attempts++;
                const startScale = gameObject.getData('baseScale');
                
                gameObject.setTint(0xff5555);

                scene.tweens.add({
                    targets: gameObject,
                    x: gameObject.getData('originX'),
                    y: gameObject.getData('originY'),
                    scale: startScale,
                    angle: 0,
                    duration: 600,
                    ease: 'Back.out',
                    onComplete: () => {
                        gameObject.clearTint();
                    }
                });

                scene.cameras.main.shake(100, 0.01);
                try { scene.sound.play('wrong'); } catch(e){}
            }

            // --- 5. Win System ---
            function checkWin() {
                const isAllFilled = dropZones.every(zone => zone.getData('isFilled'));
                
                if (isAllFilled) {
                    const duration = Math.floor((Date.now() - startTime) / 1000);
                    let stars = 1;
                    if (attempts === 0 && duration < 40) stars = 3;
                    else if (attempts <= 2) stars = 2;

                    scene.time.delayedCall(800, () => {
                        showWinPopup(stars, duration);
                    });
                }
            }

            function showWinPopup(stars, duration) {
                const rect = scene.add.rectangle(450, 300, 900, 600, 0x000000, 0.7).setDepth(10).setAlpha(0);
                scene.tweens.add({ targets: rect, alpha: 0.7, duration: 300 });

                const text = scene.add.text(450, 250, "🎉 ยอดเยี่ยม! 🎉", { 
                    fontSize: '64px', color: '#ffd700', fontFamily: 'Kanit', stroke: '#fff', strokeThickness: 6
                }).setOrigin(0.5).setDepth(11).setScale(0);

                scene.tweens.add({
                    targets: text,
                    scale: 1,
                    duration: 500,
                    ease: 'Back.out'
                });

                let starStr = "";
                for(let i=0; i<stars; i++) starStr += "⭐";
                const starText = scene.add.text(450, 350, starStr, { fontSize: '48px' }).setOrigin(0.5).setDepth(11).setAlpha(0);
                
                scene.tweens.add({ targets: starText, alpha: 1, delay: 300, duration: 500 });

                scene.time.delayedCall(2000, () => {
                    if (typeof window.sendResult === 'function') {
                        window.sendResult(STAGE_ID, stars, duration, attempts);
                    }
                });
            }

        } 
        
        new Phaser.Game(config);
    });
})();