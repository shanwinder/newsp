// assets/js/logic_game/stage3.js

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
    weed: 0.25,  // ขนาดของวัชพืช
    bug: 0.2     // ขนาดของแมลง
};

let currentSubLevel = 1;
let mistakes = 0;
let startTime;
let levelGroup;

function preload() {
    // ใช้พื้นหลังแปลงผัก (ถ้าหาไม่ได้ใช้ bg_farm ตัวเดิมได้ครับ)
    this.load.image('bg_farm_plot', '../assets/img/bg_farm.webp'); 
    
    // โหลดภาพเป้าหมายและตัวหลอก
    this.load.image('weed_spiky', '../assets/img/weed_spiky.webp'); 
    this.load.image('weed_round', '../assets/img/weed_round.webp'); 
    this.load.image('bug_red', '../assets/img/bug_red.webp'); 
    this.load.image('bug_blue', '../assets/img/bug_blue.webp'); 

    this.load.audio('correct', '../assets/sound/correct.mp3');
    this.load.audio('wrong', '../assets/sound/wrong.mp3');
}

function create() {
    let bg = this.add.image(400, 300, 'bg_farm_plot');
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
    currentSubLevel++;
    let txt = scene.add.text(400, 300, '✨ กวาดล้างสำเร็จ! ไปแปลงต่อไป ✨', { 
        fontSize: '36px', fontFamily: 'Kanit', color: '#f1c40f', 
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

// ฟังก์ชันช่วยสร้างตารางตำแหน่งแบบสุ่ม (Grid) เพื่อไม่ให้รูปทับกัน
function getShuffledGridPositions() {
    let positions = [];
    // สร้างตาราง 4x3 แถว
    for(let r=0; r<3; r++) {
        for(let c=0; c<4; c++) {
            positions.push({ x: 150 + (c * 160), y: 200 + (r * 130) });
        }
    }
    // สับเปลี่ยนตำแหน่ง (Fisher-Yates Shuffle)
    for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    return positions;
}

// ฟังก์ชันสร้างไอเทมในแปลงผัก
function spawnFarmItems(scene, itemsData, requiredTargets, nextLevelFunc) {
    let positions = getShuffledGridPositions();
    let targetsEliminated = 0;

    itemsData.forEach((data, index) => {
        if (index >= positions.length) return; // ป้องกันเกินช่องตาราง

        let pos = positions[index];
        let item = scene.add.image(pos.x, pos.y, data.key).setInteractive();
        item.setScale(SCALES[data.type] || 0.3); // ดึงสเกลตาม weed หรือ bug
        
        item.isTarget = data.isTarget;
        levelGroup.add(item);

        // แอนิเมชันตอนเกิด
        item.alpha = 0;
        scene.tweens.add({ targets: item, alpha: 1, duration: 300, delay: index * 100 });

        item.on('pointerdown', () => {
            if (item.isTarget) {
                // คลิกถูกตัว
                scene.sound.play('correct');
                
                // เอฟเฟกต์เด้งและหายไป
                scene.tweens.add({
                    targets: item, scale: 0, angle: 180, duration: 200,
                    onComplete: () => {
                        item.destroy();
                        targetsEliminated++;
                        if (targetsEliminated >= requiredTargets) {
                            // เก็บเป้าหมายครบแล้ว ไปด่านต่อไป
                            levelGroup.getChildren().forEach(child => child.disableInteractive());
                            autoTransition(scene, nextLevelFunc);
                        }
                    }
                });
            } else {
                // คลิกผิดตัว (ตัวหลอก)
                scene.sound.play('wrong');
                mistakes++;
                
                // กากบาทสีแดงแจ้งเตือน
                let cross = scene.add.text(item.x, item.y, '❌', { fontSize: '40px' }).setOrigin(0.5);
                scene.tweens.add({ targets: cross, alpha: 0, y: item.y - 50, duration: 1000, onComplete: () => cross.destroy() });
                
                // ไอเทมสั่นเตือนว่าผิด
                scene.tweens.add({ targets: item, x: item.x + 10, yoyo: true, repeat: 2, duration: 50 });
            }
        });
    });
}

// ==========================================
// 🟢 ระดับย่อย 1: เงื่อนไขตรงตัว
// ==========================================
function startLevel1(scene) {
    let title = scene.add.text(400, 50, 'ด่าน 1/3: กำจัด "วัชพืชใบแหลม" ให้หมด!', {
        fontSize: '28px', fontFamily: 'Kanit', color: '#c0392b', fontWeight: 'bold', shadow: { fill: true, blur: 4, color: '#fff' }, backgroundColor: 'rgba(255,255,255,0.7)', padding: 10
    }).setOrigin(0.5);
    levelGroup.add(title);

    // สร้างไอเทม 6 ชิ้น (เป้าหมาย 3, หลอก 3)
    const itemsData = [
        { key: 'weed_spiky', type: 'weed', isTarget: true },
        { key: 'weed_spiky', type: 'weed', isTarget: true },
        { key: 'weed_spiky', type: 'weed', isTarget: true },
        { key: 'weed_round', type: 'weed', isTarget: false },
        { key: 'weed_round', type: 'weed', isTarget: false },
        { key: 'bug_red', type: 'bug', isTarget: false }
    ];

    spawnFarmItems(scene, itemsData, 3, startLevel2);
}

// ==========================================
// 🟦 ระดับย่อย 2: ตรรกะ "ไม่ใช่" (NOT)
// ==========================================
function startLevel2(scene) {
    let title = scene.add.text(400, 50, 'ด่าน 2/3: กำจัดแมลงที่ "ไม่ใช่สีแดง" !', {
        fontSize: '28px', fontFamily: 'Kanit', color: '#c0392b', fontWeight: 'bold', shadow: { fill: true, blur: 4, color: '#fff' }, backgroundColor: 'rgba(255,255,255,0.7)', padding: 10
    }).setOrigin(0.5);
    levelGroup.add(title);

    // เป้าหมายคือ แมลงที่ไม่ใช่สีแดง (คือ bug_blue) เป้าหมาย 4 ตัว
    const itemsData = [
        { key: 'bug_blue', type: 'bug', isTarget: true },
        { key: 'bug_blue', type: 'bug', isTarget: true },
        { key: 'bug_blue', type: 'bug', isTarget: true },
        { key: 'bug_blue', type: 'bug', isTarget: true },
        { key: 'bug_red', type: 'bug', isTarget: false },
        { key: 'bug_red', type: 'bug', isTarget: false },
        { key: 'weed_spiky', type: 'weed', isTarget: false },
        { key: 'weed_round', type: 'weed', isTarget: false }
    ];

    spawnFarmItems(scene, itemsData, 4, startLevel3);
}

// ==========================================
// 🧠 ระดับย่อย 3: ตรรกะซ้อน (AND / OR) บอส!
// ==========================================
function startLevel3(scene) {
    let title = scene.add.text(400, 50, 'ด่าน 3/3: กำจัด "แมลงสีแดง" และ "วัชพืชใบกลม" !', {
        fontSize: '26px', fontFamily: 'Kanit', color: '#c0392b', fontWeight: 'bold', shadow: { fill: true, blur: 4, color: '#fff' }, backgroundColor: 'rgba(255,255,255,0.7)', padding: 10
    }).setOrigin(0.5);
    levelGroup.add(title);

    // เป้าหมาย 5 ตัว (แดง 2 + กลม 3)
    const itemsData = [
        { key: 'bug_red', type: 'bug', isTarget: true },
        { key: 'bug_red', type: 'bug', isTarget: true },
        { key: 'weed_round', type: 'weed', isTarget: true },
        { key: 'weed_round', type: 'weed', isTarget: true },
        { key: 'weed_round', type: 'weed', isTarget: true },
        { key: 'bug_blue', type: 'bug', isTarget: false },
        { key: 'bug_blue', type: 'bug', isTarget: false },
        { key: 'weed_spiky', type: 'weed', isTarget: false },
        { key: 'weed_spiky', type: 'weed', isTarget: false }
    ];

    // ส่ง checkWinCondition แทนฟังก์ชัน startLevel ถัดไป เพื่อให้จบเกม
    spawnFarmItems(scene, itemsData, 5, checkWinCondition);
}

// ==========================================
// 🏆 จบเกมและสรุปผล
// ==========================================
function checkWinCondition(scene) {
    let duration = Math.floor((Date.now() - startTime) / 1000);
    
    // เกณฑ์การให้ดาวแบบ Clicker ถ้าพลาดเยอะจะถูกหัก
    let stars = 3;
    if (mistakes >= 2 && mistakes <= 4) stars = 2;
    if (mistakes >= 5) stars = 1;

    let overlay = scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    let t1 = scene.add.text(400, 250, '🏆 ปกป้องฟาร์มสำเร็จ!', { fontSize: '52px', fontFamily: 'Kanit', color: '#f1c40f', fontWeight: 'bold' }).setOrigin(0.5);
    let t2 = scene.add.text(400, 330, `ใช้เวลา: ${duration} วินาที | คลิกพลาด: ${mistakes} ครั้ง`, { fontSize: '24px', fontFamily: 'Kanit', color: '#ffffff' }).setOrigin(0.5);

    scene.input.enabled = false;

    setTimeout(() => {
        if (typeof window.sendResult === 'function') {
            window.sendResult(window.STAGE_ID, stars, duration, mistakes); 
        }
    }, 2000);
}