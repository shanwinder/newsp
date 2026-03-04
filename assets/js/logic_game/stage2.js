// assets/js/logic_game/stage2.js

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
// ⚙️ ตัวแปรปรับขนาดรูปภาพ
// ==========================================
const SCALES = {
    basket: 0.3,
    item: 0.3 // ขนาดของรูปทรงต่างๆ ที่ใช้แทนปุ๋ย
};

let currentSubLevel = 1;
let score = 0;
let mistakes = 0;
let startTime;
let levelGroup;

function preload() {
    this.load.image('bg_farm', '../assets/img/bg_farm.webp'); 
    this.load.image('basket', '../assets/img/basket.webp'); 
    
    // โหลดรูปทรงมาใช้เป็นตัวแทน "ปุ๋ย" ชนิดต่างๆ
    this.load.image('green_sq', '../assets/img/green_square.webp'); 
    this.load.image('red_sq', '../assets/img/red_square.webp'); 
    this.load.image('green_ci', '../assets/img/green_circle.webp'); 
    this.load.image('red_ci', '../assets/img/red_circle.webp'); 

    this.load.audio('correct', '../assets/sound/correct.mp3');
    this.load.audio('wrong', '../assets/sound/wrong.mp3');
}

function create() {
    let bg = this.add.image(400, 300, 'bg_farm');
    bg.setDisplaySize(800, 600); 
    
    levelGroup = this.add.group();
    startTime = Date.now();
    currentSubLevel = 1;
    mistakes = 0;

    startLevel1(this);
}

function update() {}

// ==========================================
// 🔄 ระบบเปลี่ยนผ่านอัตโนมัติ
// ==========================================
function autoTransition(scene, nextLevelFunc) {
    scene.input.off('drop'); 
    currentSubLevel++;

    let txt = scene.add.text(400, 300, '✨ เยี่ยมมาก! ไปด่านต่อไปกันเลย ✨', { 
        fontSize: '36px', fontFamily: 'Kanit', color: '#f1c40f', 
        fontWeight: 'bold', stroke: '#000', strokeThickness: 5 
    }).setOrigin(0.5);
    
    scene.tweens.add({
        targets: txt, alpha: 0, y: 250, delay: 1500, duration: 500,
        onComplete: () => {
            txt.destroy();
            levelGroup.clear(true, true);
            nextLevelFunc(scene);
        }
    });
}

// ==========================================
// 🟢 ระดับย่อย 1: คัดแยกด้วย "สี"
// ==========================================
function startLevel1(scene) {
    let title = scene.add.text(400, 50, 'ด่าน 1/3: คัดแยกปุ๋ยตาม "สี" (ไม่สนรูปทรง)', {
        fontSize: '28px', fontFamily: 'Kanit', color: '#166534', fontWeight: 'bold', shadow: { fill: true, blur: 4, color: '#fff' }
    }).setOrigin(0.5);
    levelGroup.add(title);

    // ตะกร้า 2 ใบ ซ้าย-ขวา
    let basketLeft = scene.add.image(250, 480, 'basket').setScale(SCALES.basket);
    let basketRight = scene.add.image(550, 480, 'basket').setScale(SCALES.basket);
    
    // ป้ายบอกเงื่อนไข
    let lblLeft = scene.add.text(250, 560, 'ปุ๋ยสีเขียว', { fontSize: '22px', fontFamily: 'Kanit', color: '#fff', backgroundColor: '#27ae60', padding: {x:10, y:5} }).setOrigin(0.5);
    let lblRight = scene.add.text(550, 560, 'ปุ๋ยสีแดง', { fontSize: '22px', fontFamily: 'Kanit', color: '#fff', backgroundColor: '#c0392b', padding: {x:10, y:5} }).setOrigin(0.5);
    
    let zoneLeft = scene.add.zone(250, 480, 200, 150).setRectangleDropZone(200, 150);
    zoneLeft.targetType = 'green';
    let zoneRight = scene.add.zone(550, 480, 200, 150).setRectangleDropZone(200, 150);
    zoneRight.targetType = 'red';

    levelGroup.addMultiple([basketLeft, basketRight, lblLeft, lblRight]);

    let itemsSorted = 0;
    const itemsData = [
        { key: 'green_sq', type: 'green', x: 200, y: 200 },
        { key: 'red_ci', type: 'red', x: 350, y: 150 },
        { key: 'green_ci', type: 'green', x: 450, y: 250 },
        { key: 'red_sq', type: 'red', x: 600, y: 180 }
    ];

    itemsData.forEach(data => {
        let item = scene.add.image(data.x, data.y, data.key).setInteractive();
        item.setScale(SCALES.item);
        scene.input.setDraggable(item);
        item.itemType = data.type; // กำหนดประเภทเป็นสี
        item.originalX = data.x;
        item.originalY = data.y;
        levelGroup.add(item);
    });

    scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX; gameObject.y = dragY;
    });

    scene.input.on('drop', (pointer, gameObject, dropZone) => {
        if (currentSubLevel !== 1) return;

        if (gameObject.itemType === dropZone.targetType) {
            scene.sound.play('correct');
            gameObject.x = dropZone.x; gameObject.y = dropZone.y - 20;
            gameObject.input.enabled = false;
            itemsSorted++;
            if (itemsSorted >= 4) autoTransition(scene, startLevel2);
        } else {
            scene.sound.play('wrong');
            mistakes++;
            scene.tweens.add({ targets: gameObject, x: gameObject.originalX, y: gameObject.originalY, duration: 300 });
        }
    });
}

// ==========================================
// 🟦 ระดับย่อย 2: คัดแยกด้วย "รูปทรง"
// ==========================================
function startLevel2(scene) {
    let title = scene.add.text(400, 50, 'ด่าน 2/3: คัดแยกปุ๋ยตาม "รูปทรง" (ไม่สนสี)', {
        fontSize: '28px', fontFamily: 'Kanit', color: '#c0392b', fontWeight: 'bold', shadow: { fill: true, blur: 4, color: '#fff' }
    }).setOrigin(0.5);
    levelGroup.add(title);

    let basketLeft = scene.add.image(250, 480, 'basket').setScale(SCALES.basket);
    let basketRight = scene.add.image(550, 480, 'basket').setScale(SCALES.basket);
    
    let lblLeft = scene.add.text(250, 560, 'ปุ๋ยสี่เหลี่ยม', { fontSize: '22px', fontFamily: 'Kanit', color: '#000', backgroundColor: '#fff', padding: {x:10, y:5} }).setOrigin(0.5);
    let lblRight = scene.add.text(550, 560, 'ปุ๋ยวงกลม', { fontSize: '22px', fontFamily: 'Kanit', color: '#000', backgroundColor: '#fff', padding: {x:10, y:5} }).setOrigin(0.5);
    
    let zoneLeft = scene.add.zone(250, 480, 200, 150).setRectangleDropZone(200, 150);
    zoneLeft.targetType = 'square';
    let zoneRight = scene.add.zone(550, 480, 200, 150).setRectangleDropZone(200, 150);
    zoneRight.targetType = 'circle';

    levelGroup.addMultiple([basketLeft, basketRight, lblLeft, lblRight]);

    let itemsSorted = 0;
    const itemsData = [
        { key: 'red_sq', type: 'square', x: 150, y: 150 },
        { key: 'green_ci', type: 'circle', x: 300, y: 250 },
        { key: 'green_sq', type: 'square', x: 500, y: 150 },
        { key: 'red_ci', type: 'circle', x: 650, y: 250 }
    ];

    itemsData.forEach(data => {
        let item = scene.add.image(data.x, data.y, data.key).setInteractive();
        item.setScale(SCALES.item);
        scene.input.setDraggable(item);
        item.itemType = data.type; // กำหนดประเภทเป็นรูปทรง
        item.originalX = data.x;
        item.originalY = data.y;
        levelGroup.add(item);
    });

    scene.input.on('drop', (pointer, gameObject, dropZone) => {
        if (currentSubLevel !== 2) return;

        if (gameObject.itemType === dropZone.targetType) {
            scene.sound.play('correct');
            gameObject.x = dropZone.x; gameObject.y = dropZone.y - 20;
            gameObject.input.enabled = false;
            itemsSorted++;
            if (itemsSorted >= 4) autoTransition(scene, startLevel3);
        } else {
            scene.sound.play('wrong');
            mistakes++;
            scene.tweens.add({ targets: gameObject, x: gameObject.originalX, y: gameObject.originalY, duration: 300 });
        }
    });
}

// ==========================================
// 🧠 ระดับย่อย 3: คัดแยก "2 เงื่อนไข" (สี + รูปทรง)
// ==========================================
function startLevel3(scene) {
    let title = scene.add.text(400, 50, 'ด่าน 3/3: ต้องตรงทั้ง "สี" และ "รูปทรง" !', {
        fontSize: '28px', fontFamily: 'Kanit', color: '#2980b9', fontWeight: 'bold', shadow: { fill: true, blur: 4, color: '#fff' }
    }).setOrigin(0.5);
    levelGroup.add(title);

    let basketLeft = scene.add.image(250, 480, 'basket').setScale(SCALES.basket);
    let basketRight = scene.add.image(550, 480, 'basket').setScale(SCALES.basket);
    
    // เงื่อนไขซับซ้อนขึ้น
    let lblLeft = scene.add.text(250, 560, 'สี่เหลี่ยมสีเขียว เท่านั้น', { fontSize: '20px', fontFamily: 'Kanit', color: '#fff', backgroundColor: '#27ae60', padding: {x:10, y:5} }).setOrigin(0.5);
    let lblRight = scene.add.text(550, 560, 'วงกลมสีแดง เท่านั้น', { fontSize: '20px', fontFamily: 'Kanit', color: '#fff', backgroundColor: '#c0392b', padding: {x:10, y:5} }).setOrigin(0.5);
    
    let zoneLeft = scene.add.zone(250, 480, 200, 150).setRectangleDropZone(200, 150);
    zoneLeft.targetKey = 'green_sq'; // ต้องเป๊ะทั้งคีย์
    let zoneRight = scene.add.zone(550, 480, 200, 150).setRectangleDropZone(200, 150);
    zoneRight.targetKey = 'red_ci';

    levelGroup.addMultiple([basketLeft, basketRight, lblLeft, lblRight]);

    let itemsSorted = 0;
    // มีตัวหลอก (Distractors) ที่ใส่ตะกร้าไหนก็ไม่ได้ ต้องปล่อยทิ้งไว้
    const itemsData = [
        { key: 'green_sq', isTarget: true, targetZone: 'green_sq', x: 150, y: 250 },
        { key: 'red_ci', isTarget: true, targetZone: 'red_ci', x: 650, y: 150 },
        { key: 'green_ci', isTarget: false, x: 300, y: 150 }, // ตัวหลอก (สีถูก ทรงผิด)
        { key: 'red_sq', isTarget: false, x: 500, y: 250 }    // ตัวหลอก (ทรงถูก สีผิด)
    ];

    itemsData.forEach(data => {
        let item = scene.add.image(data.x, data.y, data.key).setInteractive();
        item.setScale(SCALES.item);
        scene.input.setDraggable(item);
        item.targetKey = data.targetZone; 
        item.isTarget = data.isTarget;
        item.originalX = data.x;
        item.originalY = data.y;
        levelGroup.add(item);
    });

    // ปุ่มกดส่งคำตอบ (เพราะมีตัวหลอก เลยต้องมีปุ่มยืนยัน)
    let submitBtn = scene.add.text(400, 350, '✅ ส่งคำตอบ', { 
        fontSize: '24px', fontFamily: 'Kanit', color: '#fff', backgroundColor: '#f39c12', padding: {x:20, y:10} 
    }).setOrigin(0.5).setInteractive();
    levelGroup.add(submitBtn);

    scene.input.on('drop', (pointer, gameObject, dropZone) => {
        if (currentSubLevel !== 3) return;
        // ด่านนี้ให้วางลงตะกร้าได้อิสระ แต่จะไปตรวจตอนกด "ส่งคำตอบ"
        gameObject.x = dropZone.x + Phaser.Math.Between(-20, 20); 
        gameObject.y = dropZone.y - 20;
        gameObject.currentZone = dropZone.targetKey;
    });

    submitBtn.on('pointerdown', () => {
        let isAllCorrect = true;
        
        // ตรวจสอบไอเทมทุกชิ้น
        levelGroup.getChildren().forEach(child => {
            if(child.texture && child.texture.key.includes('_')) {
                // ถ้าเป็นตัวที่ต้องใส่ตะกร้า แต่ใส่ผิดตะกร้า หรือไม่ได้ใส่
                if (child.isTarget && child.currentZone !== child.targetKey) {
                    isAllCorrect = false;
                }
                // ถ้าเป็นตัวหลอก แต่ดันเอาไปใส่ตะกร้า
                if (!child.isTarget && child.currentZone !== undefined) {
                    isAllCorrect = false;
                }
            }
        });

        if (isAllCorrect) {
            scene.sound.play('correct');
            checkWinCondition(scene);
        } else {
            scene.sound.play('wrong');
            mistakes++;
            // เด้งของทุกอย่างกลับที่เดิม
            levelGroup.getChildren().forEach(child => {
                if(child.texture && child.texture.key.includes('_')) {
                    scene.tweens.add({ targets: child, x: child.originalX, y: child.originalY, duration: 300 });
                    child.currentZone = undefined;
                }
            });
            
            let warn = scene.add.text(400, 300, '❌ ยังจัดปุ๋ยไม่ถูกต้อง ลองใหม่นะ!', { fontSize: '24px', fontFamily: 'Kanit', color: '#e74c3c', backgroundColor: '#fff' }).setOrigin(0.5);
            setTimeout(() => warn.destroy(), 1500);
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
    if (mistakes >= 1 && mistakes <= 2) stars = 2;
    if (mistakes >= 3) stars = 1;

    let overlay = scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    let t1 = scene.add.text(400, 250, '🏆 ภารกิจเสร็จสิ้น!', { fontSize: '52px', fontFamily: 'Kanit', color: '#f1c40f', fontWeight: 'bold' }).setOrigin(0.5);
    let t2 = scene.add.text(400, 330, `ใช้เวลา: ${duration} วินาที | ลากพลาด: ${mistakes} ครั้ง`, { fontSize: '24px', fontFamily: 'Kanit', color: '#ffffff' }).setOrigin(0.5);

    scene.input.enabled = false;

    setTimeout(() => {
        if (typeof window.sendResult === 'function') {
            window.sendResult(window.STAGE_ID, stars, duration, mistakes); 
        }
    }, 2000);
}