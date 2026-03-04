// assets/js/logic_game/stage1.js

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// ==========================================
// ⚙️ ตัวแปรปรับขนาดรูปภาพ (แยกอิสระ)
// ==========================================
// คุณครูสามารถปรับตัวเลขเหล่านี้แยกกันได้เลยเพื่อให้ขนาดพอดี
const SCALES = {
    seed: 0.2,    // ขนาดเมล็ด (newseed.webp) - ปรับให้น้อยลงถ้ายังใหญ่ไป
    rock: 0.2,     // ขนาดก้อนหิน (rock.webp)
    weed: 0.25,     // ขนาดวัชพืช (weed.webp)
    sprout: 0.25,   // ขนาดต้นกล้า (sprout.webp) - ต้นกล้าเดิมอาจจะเล็ก เลยตั้งไว้เยอะหน่อย
    plant: 0.25,    // ขนาดต้นไม้ (plant.webp)
    basket: 0.4    // ขนาดตะกร้า (basket.webp)
};

// ตัวแปรสถานะเกม
let currentSubLevel = 1;
let score = 0;
let mistakes = 0;
let startTime;
let levelGroup; 

function preload() {
    this.load.image('bg_farm', '../assets/img/bg_farm.webp'); 
    this.load.image('seed', '../assets/img/newseed.webp'); 
    this.load.image('basket', '../assets/img/basket.webp'); 
    this.load.image('rock', '../assets/img/rock.webp'); 
    this.load.image('weed', '../assets/img/weed.webp'); 
    this.load.image('sprout', '../assets/img/newsprout.webp'); 
    this.load.image('plant', '../assets/img/newplant.webp'); 
    
    this.load.audio('correct', '../assets/sound/correct.mp3');
    this.load.audio('wrong', '../assets/sound/wrong.mp3');
}

function create() {
    let bg = this.add.image(400, 300, 'bg_farm');
    bg.setDisplaySize(800, 600); 
    
    levelGroup = this.add.group();
    startTime = Date.now();
    currentSubLevel = 1;

    startLevel1(this);
}

function update() {}

// ==========================================
// 🔄 ระบบเปลี่ยนผ่านอัตโนมัติ
// ==========================================
function autoTransition(scene, nextLevelFunc) {
    scene.input.off('drop'); 
    currentSubLevel++;

    let txt = scene.add.text(400, 300, '✨ ยอดเยี่ยม! ไปต่อกันเลย ✨', { 
        fontSize: '40px', fontFamily: 'Kanit', color: '#f1c40f', 
        fontWeight: 'bold', stroke: '#000', strokeThickness: 5 
    }).setOrigin(0.5);
    
    scene.tweens.add({
        targets: txt,
        alpha: 0,
        y: 250,
        delay: 1000,
        duration: 500,
        onComplete: () => {
            txt.destroy();
            levelGroup.clear(true, true);
            nextLevelFunc(scene);
        }
    });
}

// ==========================================
// 🌾 ระดับย่อย 1: Drag & Drop คัดแยกเมล็ด
// ==========================================
function startLevel1(scene) {
    let title = scene.add.text(400, 50, 'ด่าน 1/3: ลาก "เมล็ดพันธุ์" ลงตะกร้า', {
        fontSize: '28px', fontFamily: 'Kanit', color: '#166534', fontWeight: 'bold', shadow: { fill: true, blur: 4, color: '#fff' }
    }).setOrigin(0.5);
    levelGroup.add(title);

    let basket = scene.add.image(400, 480, 'basket').setScale(SCALES.basket);
    let dropZone = scene.add.zone(400, 480, 200, 150).setRectangleDropZone(200, 150);
    levelGroup.add(basket);

    let caughtSeeds = 0;
    const itemsData = [
        { type: 'seed', x: 200, y: 200, isTarget: true },
        { type: 'rock', x: 350, y: 150, isTarget: false },
        { type: 'seed', x: 450, y: 250, isTarget: true },
        { type: 'rock', x: 600, y: 180, isTarget: false },
    ];

    itemsData.forEach(data => {
        let item = scene.add.image(data.x, data.y, data.type).setInteractive();
        item.setScale(SCALES[data.type]); // ดึงสเกลตามประเภท
        scene.input.setDraggable(item);
        item.isTarget = data.isTarget;
        item.originalX = data.x;
        item.originalY = data.y;
        levelGroup.add(item);
    });

    scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    scene.input.on('drop', (pointer, gameObject, target) => {
        if (currentSubLevel !== 1) return;

        if (gameObject.isTarget) {
            scene.sound.play('correct');
            gameObject.x = target.x;
            gameObject.y = target.y;
            gameObject.input.enabled = false;
            caughtSeeds++;
            
            if (caughtSeeds >= 2) {
                autoTransition(scene, startLevel2);
            }
        } else {
            scene.sound.play('wrong');
            mistakes++;
            scene.tweens.add({ targets: gameObject, x: gameObject.originalX, y: gameObject.originalY, duration: 300 });
        }
    });

    scene.input.on('dragleave', function (pointer, gameObject, dropZone) {
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
    });
}

// ==========================================
// 🌱 ระดับย่อย 2: Clicker กำจัดวัชพืช (มีตัวหลอก)
// ==========================================
function startLevel2(scene) {
    let title = scene.add.text(400, 50, 'ด่าน 2/3: กำจัดวัชพืช (ระวังอย่ากดโดนต้นกล้านะ!)', {
        fontSize: '26px', fontFamily: 'Kanit', color: '#c0392b', fontWeight: 'bold', shadow: { fill: true, blur: 4, color: '#fff' }
    }).setOrigin(0.5);
    levelGroup.add(title);

    let weedsKilled = 0;
    let weedsToKill = 5;

    function spawnTarget() {
        if (currentSubLevel !== 2) return;
        
        // สุ่มว่าจะเป็นตัวหลอก (ต้นกล้า) หรือเป้าหมายจริง (วัชพืช) - โอกาสเป็นวัชพืช 60%
        let isFake = Phaser.Math.Between(1, 10) > 6; 
        let type = isFake ? 'sprout' : 'weed';

        let x = Phaser.Math.Between(150, 650);
        let y = Phaser.Math.Between(200, 500);
        let target = scene.add.image(x, y, type).setInteractive();
        target.setScale(0); 
        levelGroup.add(target);

        scene.tweens.add({
            targets: target, 
            scale: SCALES[type], // ขยายตามสเกลที่ตั้งไว้
            duration: 200, 
            onComplete: () => {
                let hideTween = scene.tweens.add({
                    targets: target, scale: 0, delay: 1500, duration: 200,
                    onComplete: () => { 
                        target.destroy(); 
                        if (!isFake) mistakes++; // ถ้าปล่อยให้วัชพืชหายไปเอง โดนหักดาว
                        spawnTarget(); 
                    }
                });

                target.on('pointerdown', () => {
                    hideTween.stop();
                    
                    if (isFake) {
                        // กดโดนต้นกล้า (ตัวหลอก)
                        scene.sound.play('wrong');
                        mistakes++;
                        // แสดงกากบาทสีแดง
                        let cross = scene.add.text(target.x, target.y, '❌', { fontSize: '40px' }).setOrigin(0.5);
                        scene.tweens.add({ targets: cross, alpha: 0, y: target.y - 50, duration: 1000, onComplete: () => cross.destroy() });
                    } else {
                        // กดโดนวัชพืช (ถูกต้อง)
                        scene.sound.play('correct');
                        weedsKilled++;
                    }

                    target.destroy();

                    if (weedsKilled >= weedsToKill) {
                        autoTransition(scene, startLevel3);
                    } else {
                        spawnTarget(); 
                    }
                });
            }
        });
    }

    spawnTarget();
}

// ==========================================
// 🌳 ระดับย่อย 3: Sequence ลำดับการเติบโต (จัด Layout ใหม่)
// ==========================================
function startLevel3(scene) {
    let title = scene.add.text(400, 50, 'ด่าน 3/3: ลากภาพวงจรชีวิตให้สมบูรณ์', {
        fontSize: '28px', fontFamily: 'Kanit', color: '#2980b9', fontWeight: 'bold', shadow: { fill: true, blur: 4, color: '#fff' }
    }).setOrigin(0.5);
    levelGroup.add(title);

    // จัดตำแหน่งใหม่ให้อยู่กึ่งกลางหน้าจอ (Y = 250)
    scene.add.text(300, 250, '➡️', { fontSize: '40px', color: '#fff', shadow: { fill: true, blur: 2, color: '#000' } }).setOrigin(0.5);
    scene.add.text(500, 250, '➡️', { fontSize: '40px', color: '#fff', shadow: { fill: true, blur: 2, color: '#000' } }).setOrigin(0.5);

    let img1 = scene.add.image(200, 250, 'seed').setScale(SCALES.seed);
    let img2 = scene.add.image(400, 250, 'sprout').setScale(SCALES.sprout);
    
    // ช่องว่างสำหรับคำตอบ (ปรับพิกัดให้พอดีที่ X=600, Y=250)
    let graphics = scene.add.graphics();
    graphics.lineStyle(4, 0xffffff, 1);
    graphics.strokeRoundedRect(540, 190, 120, 120, 15); // กรอบสี่เหลี่ยม
    let dropZone = scene.add.zone(600, 250, 120, 120).setRectangleDropZone(120, 120);
    
    levelGroup.addMultiple([img1, img2, graphics]);

    // ตัวเลือกด้านล่าง (Y = 450)
    let option1 = scene.add.image(300, 450, 'rock').setInteractive(); 
    let option2 = scene.add.image(500, 450, 'plant').setInteractive(); 

    [option1, option2].forEach(opt => {
        // ใช้ชื่อ texture ค้นหาสเกลใน SCALES
        opt.setScale(SCALES[opt.texture.key]);
        scene.input.setDraggable(opt);
        opt.originalX = opt.x;
        opt.originalY = opt.y;
        levelGroup.add(opt);
    });

    scene.input.on('drop', (pointer, gameObject, target) => {
        if (currentSubLevel !== 3) return;

        if (gameObject.texture.key === 'plant') {
            scene.sound.play('correct');
            gameObject.x = target.x;
            gameObject.y = target.y;
            gameObject.input.enabled = false;
            
            setTimeout(() => checkWinCondition(scene), 1000);
        } else {
            scene.sound.play('wrong');
            mistakes++;
            scene.tweens.add({ targets: gameObject, x: gameObject.originalX, y: gameObject.originalY, duration: 300 });
        }
    });
}

// ==========================================
// 🏆 จบเกมและสรุปผล
// ==========================================
function checkWinCondition(scene) {
    levelGroup.clear(true, true);

    let duration = Math.floor((Date.now() - startTime) / 1000);
    
    let stars = 3;
    if (mistakes >= 2 && mistakes <= 4) stars = 2;
    if (mistakes >= 5) stars = 1; // ปรับเกณฑ์ดาวให้ใจดีขึ้นนิดนึง เพราะมีตัวหลอกเยอะ

    let overlay = scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    let t1 = scene.add.text(400, 250, '🏆 ภารกิจเสร็จสิ้น!', { fontSize: '52px', fontFamily: 'Kanit', color: '#f1c40f', fontWeight: 'bold' }).setOrigin(0.5);
    let t2 = scene.add.text(400, 330, `ใช้เวลา: ${duration} วินาที | พลาด: ${mistakes} ครั้ง`, { fontSize: '24px', fontFamily: 'Kanit', color: '#ffffff' }).setOrigin(0.5);

    scene.input.enabled = false;

    setTimeout(() => {
        if (typeof window.sendResult === 'function') {
            window.sendResult(window.STAGE_ID, stars, duration, mistakes); 
        }
    }, 2000);
}