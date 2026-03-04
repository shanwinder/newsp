// assets/js/logic_game/stage2.js

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    parent: 'game-container',
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

// ==========================================
// ⚙️ ตัวแปรปรับขนาดรูปภาพ
// ==========================================
const SCALES = {
    basket: 0.3,
    item: 0.2 // ขนาดของถุงปุ๋ยและเม็ดปุ๋ย
};

let currentSubLevel = 1;
let mistakes = 0;
let startTime;
let levelGroup;

function preload() {
    this.load.image('bg_farm', '../assets/img/bg_farm.webp'); 
    this.load.image('basket', '../assets/img/basket.webp'); 
    
    // โหลดรูปภาพปุ๋ยชนิดต่างๆ (ภาพใหม่ที่คุณครูจะไปหามา)
    this.load.image('fert_green_bag', '../assets/img/fert_green_bag.webp'); 
    this.load.image('fert_red_bag', '../assets/img/fert_red_bag.webp'); 
    this.load.image('fert_green_round', '../assets/img/fert_green_round.webp'); 
    this.load.image('fert_red_round', '../assets/img/fert_red_round.webp'); 
    this.load.image('fert_green_square', '../assets/img/fert_green_square.webp'); 
    this.load.image('fert_red_square', '../assets/img/fert_red_square.webp'); 

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
// 🧹 ล้าง Event ป้องกันการทำงานซ้ำซ้อน
// ==========================================
function clearInputEvents(scene) {
    scene.input.removeAllListeners('dragstart');
    scene.input.removeAllListeners('drag');
    scene.input.removeAllListeners('drop');
    scene.input.removeAllListeners('dragleave');
}

// ==========================================
// 🔄 ระบบเปลี่ยนผ่านอัตโนมัติ (ไร้รอยต่อ)
// ==========================================
function autoTransition(scene, nextLevelFunc) {
    clearInputEvents(scene);
    currentSubLevel++;

    let txt = scene.add.text(400, 300, '✨ เยี่ยมมาก! ไปกันต่อเลย ✨', { 
        fontSize: '40px', fontFamily: 'Kanit', color: '#f1c40f', 
        fontWeight: 'bold', stroke: '#000', strokeThickness: 5 
    }).setOrigin(0.5);
    
    scene.tweens.add({
        targets: txt, alpha: 0, y: 250, delay: 1000, duration: 500,
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
    clearInputEvents(scene);

    let title = scene.add.text(400, 50, 'ด่าน 1/3: คัดแยกกระสอบปุ๋ยตาม "สี"', {
        fontSize: '28px', fontFamily: 'Kanit', color: '#166534', fontWeight: 'bold', shadow: { fill: true, blur: 4, color: '#fff' }
    }).setOrigin(0.5);
    levelGroup.add(title);

    let basketLeft = scene.add.image(250, 480, 'basket').setScale(SCALES.basket);
    let basketRight = scene.add.image(550, 480, 'basket').setScale(SCALES.basket);
    
    let lblLeft = scene.add.text(250, 560, 'กระสอบสีเขียว', { fontSize: '22px', fontFamily: 'Kanit', color: '#fff', backgroundColor: '#27ae60', padding: {x:10, y:5} }).setOrigin(0.5);
    let lblRight = scene.add.text(550, 560, 'กระสอบสีแดง', { fontSize: '22px', fontFamily: 'Kanit', color: '#fff', backgroundColor: '#c0392b', padding: {x:10, y:5} }).setOrigin(0.5);
    
    let zoneLeft = scene.add.zone(250, 480, 200, 150).setRectangleDropZone(200, 150);
    zoneLeft.zoneName = 'green';
    let zoneRight = scene.add.zone(550, 480, 200, 150).setRectangleDropZone(200, 150);
    zoneRight.zoneName = 'red';

    levelGroup.addMultiple([basketLeft, basketRight, lblLeft, lblRight]);

    let itemsSorted = 0;
    const itemsData = [
        { key: 'fert_green_bag', type: 'green', x: 200, y: 200 },
        { key: 'fert_red_bag', type: 'red', x: 350, y: 150 },
        { key: 'fert_green_bag', type: 'green', x: 450, y: 250 },
        { key: 'fert_red_bag', type: 'red', x: 600, y: 180 }
    ];

    itemsData.forEach(data => {
        let item = scene.add.image(data.x, data.y, data.key).setInteractive();
        item.setScale(SCALES.item);
        scene.input.setDraggable(item);
        item.itemType = data.type; 
        item.originalX = data.x;
        item.originalY = data.y;
        levelGroup.add(item);
    });

    scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX; gameObject.y = dragY;
    });

    scene.input.on('drop', (pointer, gameObject, dropZone) => {
        if (gameObject.itemType === dropZone.zoneName) {
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

    scene.input.on('dragleave', (pointer, gameObject, dropZone) => {
        gameObject.x = gameObject.originalX; gameObject.y = gameObject.originalY;
    });
}

// ==========================================
// 🟦 ระดับย่อย 2: คัดแยกด้วย "รูปทรง"
// ==========================================
function startLevel2(scene) {
    clearInputEvents(scene);

    let title = scene.add.text(400, 50, 'ด่าน 2/3: คัดแยกปุ๋ยตาม "รูปทรง" (ไม่สนสี)', {
        fontSize: '28px', fontFamily: 'Kanit', color: '#c0392b', fontWeight: 'bold', shadow: { fill: true, blur: 4, color: '#fff' }
    }).setOrigin(0.5);
    levelGroup.add(title);

    let basketLeft = scene.add.image(250, 480, 'basket').setScale(SCALES.basket);
    let basketRight = scene.add.image(550, 480, 'basket').setScale(SCALES.basket);
    
    let lblLeft = scene.add.text(250, 560, 'ปุ๋ยเม็ดกลม', { fontSize: '22px', fontFamily: 'Kanit', color: '#000', backgroundColor: '#fff', padding: {x:10, y:5} }).setOrigin(0.5);
    let lblRight = scene.add.text(550, 560, 'ปุ๋ยอัดแท่งเหลี่ยม', { fontSize: '22px', fontFamily: 'Kanit', color: '#000', backgroundColor: '#fff', padding: {x:10, y:5} }).setOrigin(0.5);
    
    let zoneLeft = scene.add.zone(250, 480, 200, 150).setRectangleDropZone(200, 150);
    zoneLeft.zoneName = 'round';
    let zoneRight = scene.add.zone(550, 480, 200, 150).setRectangleDropZone(200, 150);
    zoneRight.zoneName = 'square';

    levelGroup.addMultiple([basketLeft, basketRight, lblLeft, lblRight]);

    let itemsSorted = 0;
    const itemsData = [
        { key: 'fert_green_round', type: 'round', x: 150, y: 150 },
        { key: 'fert_red_square', type: 'square', x: 300, y: 250 },
        { key: 'fert_red_round', type: 'round', x: 500, y: 150 },
        { key: 'fert_green_square', type: 'square', x: 650, y: 250 }
    ];

    itemsData.forEach(data => {
        let item = scene.add.image(data.x, data.y, data.key).setInteractive();
        item.setScale(SCALES.item);
        scene.input.setDraggable(item);
        item.itemType = data.type; 
        item.originalX = data.x;
        item.originalY = data.y;
        levelGroup.add(item);
    });

    scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX; gameObject.y = dragY;
    });

    scene.input.on('drop', (pointer, gameObject, dropZone) => {
        if (gameObject.itemType === dropZone.zoneName) {
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

    scene.input.on('dragleave', (pointer, gameObject, dropZone) => {
        gameObject.x = gameObject.originalX; gameObject.y = gameObject.originalY;
    });
}

// ==========================================
// 🧠 ระดับย่อย 3: บอส! 2 เงื่อนไข พร้อมปุ่มส่งคำตอบ
// ==========================================
function startLevel3(scene) {
    clearInputEvents(scene);

    let title = scene.add.text(400, 50, 'ด่าน 3/3: ต้องตรงทั้ง "สี" และ "รูปทรง" !', {
        fontSize: '28px', fontFamily: 'Kanit', color: '#2980b9', fontWeight: 'bold', shadow: { fill: true, blur: 4, color: '#fff' }
    }).setOrigin(0.5);
    levelGroup.add(title);

    let basketLeft = scene.add.image(250, 480, 'basket').setScale(SCALES.basket);
    let basketRight = scene.add.image(550, 480, 'basket').setScale(SCALES.basket);
    
    let lblLeft = scene.add.text(250, 560, 'เม็ดกลม สีเขียว เท่านั้น', { fontSize: '20px', fontFamily: 'Kanit', color: '#fff', backgroundColor: '#27ae60', padding: {x:10, y:5} }).setOrigin(0.5);
    let lblRight = scene.add.text(550, 560, 'แท่งเหลี่ยม สีแดง เท่านั้น', { fontSize: '20px', fontFamily: 'Kanit', color: '#fff', backgroundColor: '#c0392b', padding: {x:10, y:5} }).setOrigin(0.5);
    
    let zoneLeft = scene.add.zone(250, 480, 200, 150).setRectangleDropZone(200, 150);
    zoneLeft.zoneName = 'zone_green_round'; 
    let zoneRight = scene.add.zone(550, 480, 200, 150).setRectangleDropZone(200, 150);
    zoneRight.zoneName = 'zone_red_square';

    levelGroup.addMultiple([basketLeft, basketRight, lblLeft, lblRight]);

    const itemsData = [
        { key: 'fert_green_round', isTarget: true, targetZone: 'zone_green_round', x: 150, y: 250 },
        { key: 'fert_red_square', isTarget: true, targetZone: 'zone_red_square', x: 650, y: 150 },
        { key: 'fert_green_square', isTarget: false, targetZone: null, x: 300, y: 150 }, // หลอก: เขียวแต่เหลี่ยม
        { key: 'fert_red_round', isTarget: false, targetZone: null, x: 500, y: 250 }    // หลอก: แดงแต่กลม
    ];

    itemsData.forEach(data => {
        let item = scene.add.image(data.x, data.y, data.key).setInteractive();
        item.setScale(SCALES.item);
        scene.input.setDraggable(item);
        
        // แนบ property สำหรับระบบตรวจคำตอบ
        item.isGameItem = true; 
        item.isTarget = data.isTarget;
        item.targetZone = data.targetZone;
        item.currentZone = null; // เก็บว่าตอนนี้วางอยู่ตะกร้าไหน
        
        item.originalX = data.x;
        item.originalY = data.y;
        levelGroup.add(item);
    });

    // ปุ่มกดส่งคำตอบ
    let submitBtn = scene.add.text(400, 350, '✅ ส่งคำตอบ', { 
        fontSize: '26px', fontFamily: 'Kanit', color: '#fff', backgroundColor: '#f39c12', padding: {x:20, y:10} 
    }).setOrigin(0.5).setInteractive();
    levelGroup.add(submitBtn);

    scene.input.on('dragstart', (pointer, gameObject) => {
        gameObject.currentZone = null; // รีเซ็ตตำแหน่งตะกร้าเมื่อเริ่มลากใหม่
    });

    scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX; gameObject.y = dragY;
    });

    scene.input.on('drop', (pointer, gameObject, dropZone) => {
        gameObject.x = dropZone.x + Phaser.Math.Between(-15, 15); 
        gameObject.y = dropZone.y - 15;
        gameObject.currentZone = dropZone.zoneName; // บันทึกว่าถูกวางในโซนไหน
    });

    // การตรวจคำตอบที่แก้ไขใหม่ ทำงานแม่นยำ 100%
    submitBtn.on('pointerdown', () => {
        let isAllCorrect = true;
        
        levelGroup.getChildren().forEach(child => {
            if (child.isGameItem) {
                if (child.isTarget) {
                    // ถ้าเป็นตัวจริง ต้องอยู่ในตะกร้าที่ถูกต้อง
                    if (child.currentZone !== child.targetZone) isAllCorrect = false;
                } else {
                    // ถ้าเป็นตัวหลอก ห้ามอยู่ในตะกร้าเด็ดขาด
                    if (child.currentZone !== null && child.currentZone !== undefined) isAllCorrect = false;
                }
            }
        });

        if (isAllCorrect) {
            scene.sound.play('correct');
            checkWinCondition(scene);
        } else {
            scene.sound.play('wrong');
            mistakes++;
            // เด้งกลับที่เดิม
            levelGroup.getChildren().forEach(child => {
                if (child.isGameItem) {
                    scene.tweens.add({ targets: child, x: child.originalX, y: child.originalY, duration: 300 });
                    child.currentZone = null;
                }
            });
            
            let warn = scene.add.text(400, 300, '❌ ยังคัดแยกไม่ถูกต้อง ลองดูใหม่นะ!', { fontSize: '24px', fontFamily: 'Kanit', color: '#e74c3c', backgroundColor: '#fff', padding: {x:10, y:5} }).setOrigin(0.5);
            setTimeout(() => warn.destroy(), 2000);
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