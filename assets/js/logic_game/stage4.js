// assets/js/logic_game/stage4.js

// ----------------------------------------------------------------------
// การตั้งค่าความกว้างและความสูงของส่วนแสดงผลเกม (Grid 6x5)
// ----------------------------------------------------------------------
const COLS = 6;
const ROWS = 5;
const TILE_SIZE = 80;
const GAME_WIDTH = COLS * TILE_SIZE;  // 480
const GAME_HEIGHT = ROWS * TILE_SIZE; // 400

// ----------------------------------------------------------------------
// โครงสร้างด่านย่อย (Sub-Levels Configurations)
// ----------------------------------------------------------------------
const levelConfigs = [
    {
        // ด่านย่อย 1 (ทางเดินตัว L)
        start: { col: 1, row: 4 },
        target: { col: 4, row: 1 },
        rocks: [{ col: 1, row: 1 }, { col: 5, row: 4 }]
    },
    {
        // ด่านย่อย 2 (กำแพงหินขวางทาง)
        start: { col: 0, row: 2 },
        target: { col: 5, row: 2 },
        rocks: [{ col: 2, row: 1 }, { col: 2, row: 2 }, { col: 2, row: 3 }]
    },
    {
        // ด่านย่อย 3 (ทางเดินซิกแซก)
        start: { col: 1, row: 1 },
        target: { col: 4, row: 3 },
        rocks: [{ col: 2, row: 1 }, { col: 2, row: 2 }, { col: 4, row: 2 }, { col: 3, row: 4 }]
    }
];

// ตัวแปรควบคุมระบบเกม
let currentLevel = 0;
let commands = [];
const MAX_COMMANDS = 10;
let attempts = 0;
let startTime = Date.now();
let isPlaying = false; // ป้องกันการกดปุ่มซ้ำขณะรถไถกำลังวิ่ง

// ----------------------------------------------------------------------
// ฟังก์ชันสร้าง UI พื้นฐานของชุดคำสั่ง
// ----------------------------------------------------------------------
function createUI() {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    // จัดระเบียบการแสดงผลของคอนเทนเนอร์หลัก (ปรับเพื่อรองรับสองคอลัมน์)
    gameContainer.style.display = 'flex';
    gameContainer.style.flexDirection = 'column';
    gameContainer.style.alignItems = 'center';
    gameContainer.style.gap = '15px';
    gameContainer.style.padding = '20px 0';
    gameContainer.style.width = '100%';

    // เพิ่ม SweetAlert2 ถ้ายังไม่มีในระบบ (เพื่อความมั่นใจว่า Alert สวยงามทำงานได้)
    if (!window.Swal) {
        const swalScript = document.createElement('script');
        swalScript.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
        document.head.appendChild(swalScript);
    }

    // สร้างโครงสร้าง HTML สำหรับโซนควบคุม (ปุ่มต่างๆ และกระดานลำดับคำสั่ง) โดยย้ายมาไว้ "ด้านข้าง"
    const uiHtml = `
        <div class="w-100 d-flex justify-content-start align-items-center mb-1" style="max-width: 900px;">
            <div id="level-indicator" class="h4 fw-bold text-primary mb-0">
                <i class="bi bi-geo-alt-fill"></i> ด่านย่อยที่ 1 / 3
            </div>
        </div>
        
        <!-- โครงสร้างแบบ 2 คอลัมน์ (ซ้าย: เกม, ขวา: แผงควบคุม) -->
        <div class="d-flex flex-column flex-lg-row align-items-stretch justify-content-center gap-4 w-100" style="max-width: 1000px;">
            
            <!-- ด้านซ้าย: Canvas เกม -->
            <div id="phaser-canvas" class="border rounded shadow-lg overflow-hidden bg-white flex-shrink-0" style="width: ${GAME_WIDTH}px; height: ${GAME_HEIGHT}px;">
                <!-- Canvas ของเกมจะถูกใส่เข้ามาที่นี่โดยอัตโนมัติ -->
            </div>

            <!-- ด้านขวา: แผงควบคุมและคำสั่ง -->
            <div class="d-flex flex-column bg-white p-4 rounded shadow-lg border w-100" style="max-width: 400px; min-height: ${GAME_HEIGHT}px;">
                
                <div class="w-100 d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                    <span class="fw-bold fs-5 text-dark"><i class="bi bi-terminal-fill text-warning"></i> บล็อกคำสั่ง</span>
                    <span class="badge bg-secondary fs-6 shadow-sm"><span id="command-count">0</span> / ${MAX_COMMANDS}</span>
                </div>
                
                <!-- กล่องบรรจุคำสั่งที่จะวางเรียงกัน -->
                <div id="sequence-container" class="d-flex align-content-start flex-wrap bg-light border rounded p-3 w-100 mb-4 shadow-inner" style="flex: 1; gap: 10px; overflow-y: auto;">
                    <span class="text-muted w-100 text-center mt-4" id="sequence-placeholder">
                        <i class="bi bi-arrow-down-square fs-1 text-black-50 opacity-25"></i><br>
                        ยังไม่มีคำสั่ง<br><small>กดปุ่มลูกศรด้านล่างเพื่อเพิ่ม</small>
                    </span>
                </div>
                
                <!-- แผงปุ่มควบคุมลูกศร -->
                <div class="d-flex gap-2 mb-4 justify-content-center w-100">
                    <button class="btn btn-outline-primary shadow-sm rounded-3" onclick="addCommand('UP')" style="width: 70px; height: 60px; font-size: 1.5rem;">⬆️</button>
                    <button class="btn btn-outline-primary shadow-sm rounded-3" onclick="addCommand('DOWN')" style="width: 70px; height: 60px; font-size: 1.5rem;">⬇️</button>
                    <button class="btn btn-outline-primary shadow-sm rounded-3" onclick="addCommand('LEFT')" style="width: 70px; height: 60px; font-size: 1.5rem;">⬅️</button>
                    <button class="btn btn-outline-primary shadow-sm rounded-3" onclick="addCommand('RIGHT')" style="width: 70px; height: 60px; font-size: 1.5rem;">➡️</button>
                </div>
                
                <!-- ปุ่มแอคชันหลัก -->
                <div class="d-flex gap-2 w-100 mt-auto border-top pt-3">
                    <button class="btn btn-danger flex-grow-1 shadow-sm py-2 fw-bold" onclick="clearCommands()">
                        <i class="bi bi-trash"></i> ล้าง
                    </button>
                    <button class="btn btn-success flex-grow-1 shadow-sm py-2 fw-bold" onclick="runSequence()">
                        <i class="bi bi-play-circle-fill"></i> รันคำสั่ง
                    </button>
                </div>
            </div>
        </div>
    `;

    gameContainer.innerHTML = uiHtml;
}

// ----------------------------------------------------------------------
// ฟังก์ชันจัดการคำสั่งและ UI
// ----------------------------------------------------------------------

// อัปเดตข้อความบอกด่านย่อย
function updateLevelUI() {
    const levelIndicator = document.getElementById('level-indicator');
    if (levelIndicator) {
        levelIndicator.innerHTML = `ด่านย่อยที่ ${currentLevel + 1} / ${levelConfigs.length}`;
    }
}

// ผูกฟังก์ชันเพิ่มคำสั่งกับหน้าต่างหลัก
window.addCommand = function(dir) {
    if (isPlaying) return; // ไม่ให้กดเพิ่มถ้ารถไถวิ่งอยู่
    if (commands.length >= MAX_COMMANDS) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'คำสั่งเต็มแล้ว!', showConfirmButton: false, timer: 1500 });
        return;
    }
    
    commands.push(dir);
    updateSequenceUI();
};

// อัปเดตกล่องแสดงคำสั่งที่ผู้เล่นกรอก
function updateSequenceUI() {
    const container = document.getElementById('sequence-container');
    const countDisplay = document.getElementById('command-count');
    const placeholder = document.getElementById('sequence-placeholder');
    
    if (container && countDisplay) {
        if (commands.length > 0) {
            if (placeholder) placeholder.style.display = 'none';
        } else {
            if (placeholder) placeholder.style.display = 'block';
        }

        // ล้างกล่องเหลือแค่ Placeholder ที่อาจจะซ่อนอยู่
        container.innerHTML = placeholder ? placeholder.outerHTML : '';
        
        const dirIcons = { 'UP': '⬆️', 'DOWN': '⬇️', 'LEFT': '⬅️', 'RIGHT': '➡️' };
        
        commands.forEach((cmd, idx) => {
            const block = document.createElement('div');
            block.className = 'bg-primary text-white rounded d-flex align-items-center justify-content-center shadow-sm';
            block.style.width = '40px';
            block.style.height = '40px';
            block.style.fontSize = '1.2rem';
            block.style.flexShrink = '0';
            block.innerText = dirIcons[cmd];
            
            // ทำให้สามารถคว้กบล็อคทิ้งได้โดยการกดที่ตัวมัน (ลูกเล่นเสริม)
            block.style.cursor = 'pointer';
            block.onclick = () => {
                if (!isPlaying) {
                    commands.splice(idx, 1);
                    updateSequenceUI();
                }
            };
            
            container.appendChild(block);
        });
        
        countDisplay.innerText = commands.length;
    }
}

// ล้างคำสั่งทั้งหมดและพาตัวละครกลับจุดเริ่มต้น
window.clearCommands = function() {
    if (isPlaying) return;
    commands = [];
    updateSequenceUI();
    
    if (window.gameScene) {
        window.gameScene.resetPlayerPosition();
    }
};

// สั่งให้ตัวละครเล่นตามชุดคำสั่ง
window.runSequence = async function() {
    if (isPlaying || commands.length === 0) {
        if(commands.length === 0 && !isPlaying && window.Swal) {
            Swal.fire({ toast: true, position: 'top', icon: 'info', title: 'กรุณาใส่คำสั่งอย่างน้อย 1 ทิศทาง', showConfirmButton: false, timer: 2000 });
        }
        return;
    }
    
    isPlaying = true;
    attempts++; // นับจำนวนครั้งที่กดรัน (เพื่อให้มีผลต่อการตัดเกรดดาว)
    
    // คืนตำแหน่งก่อนเริ่มเสมอ (เผื่อรันซ้ำ)
    window.gameScene.resetPlayerPosition();
    
    // หน่วงเวลาเล็กน้อยเพื่อให้ดูเป็นธรรมชาติ
    await new Promise(r => setTimeout(r, 200));
    
    await window.gameScene.executeSequence(commands);
    
    isPlaying = false;
};

// ----------------------------------------------------------------------
// Phaser 3 Main Scene Logic (การจำลองตัวเกมกระดาน)
// ----------------------------------------------------------------------
class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        window.gameScene = this; // แนบ instance ตัวเองกับหน้าต่างเพื่อให้ JS ภายนอกเรียกสั่งงานได้
    }

    preload() {
        // ใช้ Emoji จึงไม่ต้องโหลดไฟล์รูปภาพหรือ Assets ลดการใช้ทรัพยากร
    }

    create() {
        // 1. วาดตารางพื้นหลังและทำสี
        this.drawGrid();
        
        // 2. สร้างกลุ่ม (Group) เก็บวัตถุพวกก้อนหิน (อุปสรรค)
        this.rocksGroup = this.add.group();
        
        // 3. สร้างตัวตะกร้า (เป้าหมาย) และรถไถ (ตัวแก้โจทย์)
        this.targetSprite = this.add.text(0, 0, '🧺', { fontSize: '45px' }).setOrigin(0.5);
        this.playerSprite = this.add.text(0, 0, '🚜', { fontSize: '45px', padding: { x: 5, y: 5 } }).setOrigin(0.5);
        
        // รถไถปกติหันหัวไปทางซ้าย (🚜) จึงต้องจับสลับพลิกด้านให้หันหน้าไปทางขวาตามธรรมชาติของเกม
        this.playerSprite.setScale(-1, 1);
        
        // 4. โหลดข้อมูลด่านแรกทันที
        this.loadLevel(currentLevel);
    }

    // ฟังก์ชันวาดลายพื้นตารางช่องๆ
    drawGrid() {
        // ลงสีพื้นหลัก
        this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0xebf5fb); // สีฟ้าอ่อนเข้ากับธีมของระบบ
        
        // ตีเส้นขอบตาราง
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0xbdc3c7, 0.8);
        
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

    // โหลดกระดานสำหรับด่านย่อย
    loadLevel(index) {
        const config = levelConfigs[index];
        
        // สั่งอัปเดตตัวหนังสือแจ้งด่านให้ตรง
        updateLevelUI();
        
        // เคลียร์หินของด่านก่อนหน้าออกทั้งหมด
        this.rocksGroup.clear(true, true);
        
        // ตั้งตำแหน่งใหม่ให้ตะกร้า (จุดเป้าหมาย)
        this.targetSprite.setPosition(
            config.target.col * TILE_SIZE + TILE_SIZE / 2,
            config.target.row * TILE_SIZE + TILE_SIZE / 2
        );
        
        // ปูหิน (โขดหินสิ่งกีดขวาง) ใหม่ตาม Array configs
        config.rocks.forEach(r => {
            let rock = this.add.text(
                r.col * TILE_SIZE + TILE_SIZE / 2,
                r.row * TILE_SIZE + TILE_SIZE / 2,
                '🪨',
                { fontSize: '45px' }
            ).setOrigin(0.5);
            this.rocksGroup.add(rock);
        });
        
        // จับรถไถไปเริ่มต้น ณ จุดเกิดใหม่
        this.resetPlayerPosition();
    }

    // ยกเครื่องรถไถให้กลับไปจุด Start point
    resetPlayerPosition() {
        const config = levelConfigs[currentLevel];
        this.playerGridPos = { col: config.start.col, row: config.start.row };
        
        this.playerSprite.setPosition(
            this.playerGridPos.col * TILE_SIZE + TILE_SIZE / 2,
            this.playerGridPos.row * TILE_SIZE + TILE_SIZE / 2
        );
        
        // ตั้งทิศทางหันหน้าเริ่มต้น (หันขวา)
        this.playerSprite.setAngle(0);
        this.playerSprite.setScale(-1, 1);
    }

    // ตัวประมวลผลคำสั่งทั้งหมดแบบเรียงลำดับลูกศร
    async executeSequence(cmds) {
        for (let i = 0; i < cmds.length; i++) {
            const dir = cmds[i];
            
            // รอให้รถวิ่งทีละช่อง 400ms ตามที่โจทย์ระบุ
            const result = await this.movePlayer(dir);
            
            // ถ้าวิ่งตกขอบโลก (สุดกระดาน)
            if (result === 'OUT_OF_BOUNDS') {
                if (window.Swal) {
                    Swal.fire({
                        title: 'อุ๊ย!',
                        text: '💥 ตกขอบแปลงเกษตร!',
                        icon: 'error',
                        confirmButtonText: 'ตั้งสติใหม่'
                    }).then(() => { window.clearCommands(); });
                }
                return; // หยุดกระบวนการทั้งหมดทันที
            // ถ้าวิ่งไปชนก้อนหิน
            } else if (result === 'ROCK') {
                if (window.Swal) {
                    Swal.fire({
                        title: 'ระวัง!',
                        text: '💥 ชนโขดหินเข้าอย่างจัง!',
                        icon: 'error',
                        confirmButtonText: 'เอาใหม่'
                    }).then(() => { window.clearCommands(); });
                }
                return; // หยุดกระบวนการทั้งหมดทันที
            }
        }
        
        // หากรถวิ่งครบคำสั่งแล้ว ไม่ชนอะไรเลย -> ตรวจสอบว่าถึงปลายทางหรือไม่
        this.checkWinCondition();
    }

    // ฟังก์ชันคำนวณทิศทางการเดินและแอนิเมชัน 1 ช่องกระดาน
    movePlayer(dir) {
        return new Promise((resolve) => {
            let targetCol = this.playerGridPos.col;
            let targetRow = this.playerGridPos.row;
            
            let angle = 0;
            let scaleX = -1; // -1 สำหรับรถไถตัวนี้เพื่อให้หันขวา

            if (dir === 'UP') {
                targetRow -= 1;
                angle = -90; // เชิดหน้าขึ้นทิศเหนือ
                scaleX = -1;
            } else if (dir === 'DOWN') {
                targetRow += 1;
                angle = 90; // ทิ่มหัวลงทิศใต้
                scaleX = -1;
            } else if (dir === 'LEFT') {
                targetCol -= 1;
                angle = 0;
                scaleX = 1; // เลิกกลับด้าน รถจะหันซ้ายตามธรรมชาติ
            } else if (dir === 'RIGHT') {
                targetCol += 1;
                angle = 0;
                scaleX = -1; // กลับด้าน ให้รถหันขวา
            }
            
            // อัปเดตการหันหน้าก่อนเคลื่อนที่
            this.playerSprite.setAngle(angle);
            this.playerSprite.setScale(scaleX, 1);

            // [ กฎที่ 1: ตรวจตกกระดาน ]
            if (targetCol < 0 || targetCol >= COLS || targetRow < 0 || targetRow >= ROWS) {
                // เอฟเฟกต์เด้งชนขอบ เพื่อให้เด็กเห็นภาพว่าวิ่งทะลุไม่ได้
                const bumpCol = this.playerGridPos.col + (targetCol - this.playerGridPos.col) * 0.3;
                const bumpRow = this.playerGridPos.row + (targetRow - this.playerGridPos.row) * 0.3;
                
                this.tweens.add({
                    targets: this.playerSprite,
                    x: bumpCol * TILE_SIZE + TILE_SIZE / 2,
                    y: bumpRow * TILE_SIZE + TILE_SIZE / 2,
                    duration: 200,
                    yoyo: true, // สั่งเด้งกลับตำแหน่งเดิม
                    onComplete: () => { resolve('OUT_OF_BOUNDS'); }
                });
                return;
            }

            // [ กฎที่ 2: ตรวจชนอุปสรรคหิน ]
            const isRock = levelConfigs[currentLevel].rocks.some(r => r.col === targetCol && r.row === targetRow);
            if (isRock) {
                // เอฟเฟกต์หน้าทิ่มชนหินช้าๆ แล้วเด้งกลับ
                const bumpCol = this.playerGridPos.col + (targetCol - this.playerGridPos.col) * 0.4;
                const bumpRow = this.playerGridPos.row + (targetRow - this.playerGridPos.row) * 0.4;
                
                this.tweens.add({
                    targets: this.playerSprite,
                    x: bumpCol * TILE_SIZE + TILE_SIZE / 2,
                    y: bumpRow * TILE_SIZE + TILE_SIZE / 2,
                    duration: 200,
                    yoyo: true,
                    onComplete: () => { resolve('ROCK'); }
                });
                return;
            }

            // [ ปกติ: เดินทางราบรื่น ]
            this.playerGridPos = { col: targetCol, row: targetRow };
            
            // แอนิเมชันขยับไปยังช่องถัดไป ใช้เวลา 400ms ตามหลักสูตรเด็กเล็ก
            this.tweens.add({
                targets: this.playerSprite,
                x: targetCol * TILE_SIZE + TILE_SIZE / 2,
                y: targetRow * TILE_SIZE + TILE_SIZE / 2,
                duration: 400,
                onComplete: () => { resolve('SUCCESS'); }
            });
        });
    }

    // ตรวจสอบเมื่อวิ่งคำสั่งจบครบถ้วนแล้ว ว่ามาหยุดอยู่ที่ช่องของเป้าหมายหรือไม่
    checkWinCondition() {
        const config = levelConfigs[currentLevel];
        
        // ถ้ายืนอยู่ที่เดียวกันกับตะกร้า ถือว่าชนะ!
        if (this.playerGridPos.col === config.target.col && this.playerGridPos.row === config.target.row) {
            
            if (currentLevel < levelConfigs.length - 1) {
                // กรณีด่านย่อยที่ 1 และ 2
                Swal.fire({
                    title: 'ยอดเยี่ยม!',
                    text: '🎉 ไปด่านต่อไปกันเลย',
                    icon: 'success',
                    confirmButtonText: 'ตกลง'
                }).then(() => {
                    currentLevel++; // เพิ่มระดับ
                    window.clearCommands(); // ล้างคำสั่งเก่าทิ้ง
                    this.loadLevel(currentLevel); // โหลด맵ใหม่
                });
            } else {
                // กรณีด่านย่อยสุดท้าย (ด่านที่ 3 สำเร็จแล้ว)
                Swal.fire({
                    title: 'เก่งมาก!',
                    text: '🏆 คุณผ่านด่านเส้นทางเดินรถไถครบทั้งหมดแล้ว',
                    icon: 'success',
                    confirmButtonText: 'ยอดเยี่ยม!'
                }).then(() => {
                    // คำนวณระยะเวลาและความพยายามทั้งหมดของทั้ง 3 ด่าน เพื่อส่งผลกลับไปบันทึก
                    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
                    
                    // เกณฑ์การให้ดาวคณิตศาสตร์เบื้องต้น: (นับจากรอบการลองผิดลองถูก)
                    let stars = 3;
                    if (attempts > 8) stars = 1;
                    else if (attempts > 4) stars = 2;
                    
                    // เรียก Bridge Function ที่เชื่อมกับ Web Server ใน play_game.php
                    if (window.sendResult && typeof window.STAGE_ID !== 'undefined') {
                        window.sendResult(window.STAGE_ID, stars, timeTaken, attempts);
                    } else {
                        // เพื่อกรณีทดสอบบน local แบบไม่มี Database
                        console.log(`ผ่านครบทุกด่าน! ใช้เวลา ${timeTaken} วิ, ลองไป ${attempts} ครั้ง, ได้ ${stars} ดาว`);
                        alert('จบการทดสอบด่าน!');
                    }
                });
            }
        } else {
            // เดินคำสั่งหมดแล้ว ยังไม่ถึงตะกร้า
            Swal.fire({
                title: 'ยังไม่ถึงจุดหมาย!', 
                text: 'ลองคิดจัดลำดับลูกศรใหม่อีกทีนะ สู้ๆ', 
                icon: 'info',
                confirmButtonText: 'จัดคำสั่งใหม่'
            }).then(() => {
                window.clearCommands();
            });
        }
    }
}

// ----------------------------------------------------------------------
// ระบบเตรียมความพร้อมเมื่อหน้าเว็บโหลดเสร็จสมบูรณ์
// ----------------------------------------------------------------------
window.addEventListener('load', function() {
    // 1. นำโครงสร้างชุดปุ่มกดและ UI ควบคุมไปสร้างก่อน
    createUI();

    // 2. ตั้งค่า Configuration ของไลบรารี Phaser
    const config = {
        type: Phaser.AUTO,
        parent: 'phaser-canvas', // อ้างอิง ID ที่เราเพิ่งพ่น HTML ใส่ไป
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        transparent: true,
        scene: MainScene
    };

    // 3. เริ่มต้นกระบวนการ Engine ของเกม
    new Phaser.Game(config);
});
