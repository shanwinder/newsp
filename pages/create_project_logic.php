<?php
// pages/create_project_logic.php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
$game_id = 1; 
$team_mode = $_SESSION['mode'] ?? 'solo';
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>สร้างสรรค์ด่านคัดแยก - Young Smart Farmer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%); 
            min-height: 100vh;
            color: #333;
        }

        .editor-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
            padding: 20px;
            border: 4px solid #fff;
        }

        .toolbox-panel {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 10px;
            border: 2px solid #e9ecef;
            height: 480px;
            overflow-y: auto;
        }

        .tool-item {
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 10px;
            padding: 8px;
            text-align: center;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border: 2px solid transparent;
        }

        .tool-item:hover {
            transform: translateY(-3px) scale(1.02);
            border-color: #27ae60;
            background: #e9f7ef;
        }

        .tool-item img {
            width: 45px;
            height: 45px;
            object-fit: contain;
        }

        #phaser-canvas {
            border-radius: 15px;
            overflow: hidden;
            box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
            border: 3px solid #27ae60;
            touch-action: pan-y;
            background-color: #fff;
        }
        
        .nav-pills .nav-link {
            border-radius: 50px;
            font-size: 0.9rem;
            color: #555;
            padding: 5px 10px;
            margin: 0 2px;
        }
        .nav-pills .nav-link.active {
            background-color: #27ae60;
        }
    </style>
</head>

<body>

    <div class="container-fluid py-4 px-lg-5">
        <div class="text-center text-white mb-3 text-shadow">
            <h1 class="fw-bold"><i class="bi bi-controller"></i> สตูดิโอสร้างด่าน "จับผิดตรรกะ"</h1>
            <p class="fs-5 opacity-75 mb-0">ออกแบบเงื่อนไขที่ซับซ้อน (AND/OR/NOT) แล้วกำหนดเป้าหมายให้เพื่อนมาไขปริศนา!</p>
        </div>

        <div class="editor-container">
            <div class="row g-3">
                
                <div class="col-lg-3 order-2 order-lg-1">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="fw-bold text-success m-0"><i class="bi bi-box-seam"></i> คลังไอเทม</h5>
                    </div>

                    <ul class="nav nav-pills nav-fill mb-2" id="toolTabs" role="tablist">
                        <li class="nav-item">
                            <button class="nav-link active" data-bs-toggle="pill" data-bs-target="#tab-creatures" type="button">พืช/แมลง</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" data-bs-toggle="pill" data-bs-target="#tab-fert" type="button">ปุ๋ย</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" data-bs-toggle="pill" data-bs-target="#tab-decor" type="button">ฉาก</button>
                        </li>
                    </ul>

                    <div class="toolbox-panel tab-content" id="toolTabsContent">
                        <div class="tab-pane fade show active" id="tab-creatures" role="tabpanel">
                            <div class="row g-2" id="container-creatures"></div>
                        </div>
                        <div class="tab-pane fade" id="tab-fert" role="tabpanel">
                            <div class="row g-2" id="container-fert"></div>
                        </div>
                        <div class="tab-pane fade" id="tab-decor" role="tabpanel">
                            <div class="row g-2" id="container-decor"></div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6 order-1 order-lg-2">
                    <div class="d-flex justify-content-center gap-2 mb-2">
                        <span class="fw-bold text-muted mt-1">ฉากหลัง:</span>
                        <button class="btn btn-sm btn-outline-secondary rounded-pill" onclick="changeBackground('grid')">ตารางกระดาษ</button>
                        <button class="btn btn-sm btn-outline-success rounded-pill" onclick="changeBackground('farm')">แปลงผัก</button>
                    </div>
                    
                    <div id="phaser-canvas" class="w-100 d-flex justify-content-center" style="height: 480px;"></div>
                </div>

                <div class="col-lg-3 order-3">
                    <div class="h-100 d-flex flex-column">
                        <div class="bg-light p-3 rounded-3 mb-2 border flex-grow-1">
                            <label class="fw-bold mb-2 text-danger"><i class="bi bi-chat-text-fill"></i> ตั้งโจทย์/เงื่อนไขของด่าน</label>
                            <textarea id="desc-input" class="form-control border-0 shadow-sm" style="height: 120px; resize: none;"
                                placeholder="เช่น 'จงกำจัดแมลงสีแดง และวัชพืชใบกลมให้หมด!' หรือ 'คลิกเฉพาะปุ๋ยสีเขียวที่เป็นเม็ดกลม'"></textarea>
                        </div>

                        <div class="alert alert-warning small py-2 px-3 mb-3 rounded-3 border-0 shadow-sm">
                            <i class="bi bi-lightbulb-fill text-warning"></i> <strong>ระบบตั้งค่าตรรกะ (Logic):</strong><br>
                            👉 <strong>คลิก 1 ครั้ง</strong> ที่ไอเทม เพื่อสลับสถานะ:<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;🎯 <span class="text-success fw-bold">เป้าหมาย</span> (สิ่งที่เพื่อนต้องคลิก)<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;❌ <span class="text-danger fw-bold">ตัวหลอก</span> (คลิกแล้วโดนหักดาว)<br>
                            👉 <strong>ดับเบิ้ลคลิก</strong> เพื่อลบทิ้ง
                        </div>

                        <div class="d-grid gap-2 mt-auto">
                            <button onclick="submitWork()" class="btn btn-success btn-lg rounded-pill fw-bold shadow">
                                <i class="bi bi-cloud-arrow-up-fill me-2"></i> สร้างด่านเสร็จสิ้น
                            </button>
                            <a href="game_select.php?game_id=<?php echo $game_id; ?>" class="btn btn-light border rounded-pill fw-bold text-secondary">
                                ยกเลิก
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script>
        const GAME_ID = <?php echo $game_id; ?>;
        let placedItems = []; 
        let sceneRef;
        let bgImage;

        // 🎯 จัดหมวดหมู่ Asset (อิงจากที่เราเตรียมไว้ในด่าน 1-3)
        const assetCategories = {
            creatures: [
                { key: 'weed_spiky', img: '../assets/img/weed_spiky.webp', label: 'หญ้าแหลม', scale: 110, role: 'decoy' },
                { key: 'weed_round', img: '../assets/img/weed_round.webp', label: 'หญ้ากลม', scale: 110, role: 'decoy' },
                { key: 'bug_red', img: '../assets/img/bug_red.webp', label: 'แมลงแดง', scale: 100, role: 'decoy' },
                { key: 'bug_blue', img: '../assets/img/bug_blue.webp', label: 'แมลงฟ้า', scale: 100, role: 'decoy' },
                { key: 'seed', img: '../assets/img/newseed.webp', label: 'เมล็ดพันธุ์', scale: 100, role: 'decoy' }
            ],
            fert: [
                { key: 'fert_green_bag', img: '../assets/img/fert_green_bag.webp', label: 'กระสอบเขียว', scale: 60, role: 'decoy' },
                { key: 'fert_red_bag', img: '../assets/img/fert_red_bag.webp', label: 'กระสอบแดง', scale: 60, role: 'decoy' },
                { key: 'fert_green_round', img: '../assets/img/fert_green_round.webp', label: 'เม็ดกลมเขียว', scale: 50, role: 'decoy' },
                { key: 'fert_green_square', img: '../assets/img/fert_green_square.webp', label: 'แท่งเหลี่ยมเขียว', scale: 50, role: 'decoy' },
                { key: 'fert_red_round', img: '../assets/img/fert_red_round.webp', label: 'เม็ดกลมแดง', scale: 50, role: 'decoy' },
                { key: 'fert_red_square', img: '../assets/img/fert_red_square.webp', label: 'แท่งเหลี่ยมแดง', scale: 50, role: 'decoy' }
            ],
            decor: [
                { key: 'basket', img: '../assets/img/basket.webp', label: 'ตะกร้า', scale: 80, role: 'decor' },
                { key: 'fence', img: '../assets/img/fence.webp', label: 'รั้วไม้', scale: 90, role: 'decor' },
                { key: 'scarecrow', img: '../assets/img/scarecrow.webp', label: 'หุ่นไล่กา', scale: 110, role: 'decor' },
                { key: 'tractor', img: '../assets/img/tractor.webp', label: 'รถไถ', scale: 120, role: 'decor' }
            ]
        };

        function renderToolbox(category, containerId) {
            const container = document.getElementById(containerId);
            assetCategories[category].forEach(item => {
                const col = document.createElement('div');
                col.className = 'col-6'; 
                col.innerHTML = `
                    <div class="tool-item" onclick="spawnItem('${item.key}', ${item.scale}, '${item.role}')">
                        <img src="${item.img}" alt="${item.label}">
                        <div class="small fw-bold mt-1 text-truncate">${item.label}</div>
                    </div>`;
                container.appendChild(col);
            });
        }

        renderToolbox('creatures', 'container-creatures');
        renderToolbox('fert', 'container-fert');
        renderToolbox('decor', 'container-decor');

        // --- Phaser Config ---
        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-canvas',
            width: 800, 
            height: 480,
            backgroundColor: '#ffffff',
            scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
            input: { mouse: { preventDefaultWheel: false }, touch: { capture: false } },
            scene: { preload: preload, create: create }
        };

        function preload() {
            Object.values(assetCategories).forEach(cat => {
                cat.forEach(item => { this.load.image(item.key, item.img); });
            });
            this.load.image('bg_farm_plot', '../assets/img/bg_farm_plot.webp');
            this.load.image('grid_bg', 'https://www.transparenttextures.com/patterns/cubes.png');
        }

        function create() {
            sceneRef = this;
            bgImage = this.add.tileSprite(400, 240, 800, 480, 'grid_bg').setAlpha(0.2);
        }

        window.changeBackground = function(type) {
            if(!sceneRef) return;
            if(type === 'grid') {
                bgImage.setTexture('grid_bg'); bgImage.setAlpha(0.2);
            } else if(type === 'farm') {
                bgImage.setTexture('bg_farm_plot'); bgImage.setAlpha(1);
            }
            sceneRef.children.sendToBack(bgImage);
        };

        window.spawnItem = function(key, targetSize, defaultRole) {
            if (!sceneRef) return;

            const x = Phaser.Math.Between(350, 450);
            const y = Phaser.Math.Between(200, 280);

            // Container เพื่อรวมภาพและป้ายสถานะไว้ด้วยกัน
            const container = sceneRef.add.container(x, y).setSize(targetSize, targetSize).setInteractive();
            sceneRef.input.setDraggable(container);
            
            const img = sceneRef.add.image(0, 0, key);
            img.setDisplaySize(targetSize, targetSize * (img.height / img.width));
            container.add(img);

            // ซ่อน Data ไว้ใน Container
            container.setData('type', key);
            container.setData('role', defaultRole); 

            // สร้างป้ายบอกสถานะ (ถ้าไม่ใช่ของตกแต่ง)
            let statusText = null;
            if (defaultRole !== 'decor') {
                statusText = sceneRef.add.text(0, -targetSize/2 - 15, '❌ ตัวหลอก', { 
                    fontSize: '14px', fontFamily: 'Kanit', color: '#fff', backgroundColor: '#e74c3c', padding: {x:6, y:3} 
                }).setOrigin(0.5);
                container.add(statusText);
            }

            // แอนิเมชันตอนเกิด
            const currentScale = container.scale;
            sceneRef.tweens.add({ targets: container, scale: { from: 0, to: currentScale }, duration: 300, ease: 'Back.out' });

            // เหตุการณ์การลาก
            container.on('drag', function(pointer, dragX, dragY) {
                this.x = dragX; this.y = dragY;
            });
            container.on('dragstart', function() {
                this.setAlpha(0.8);
                sceneRef.children.bringToTop(this);
            });
            container.on('dragend', function() {
                this.setAlpha(1);
            });

            // คลิกเพื่อสลับสถานะ หรือ ดับเบิ้ลคลิกเพื่อลบ
            let lastClickTime = 0;
            container.on('pointerdown', function(pointer) {
                const clickTime = new Date().getTime();
                // ถ้าดับเบิ้ลคลิก (ลบทิ้ง)
                if (clickTime - lastClickTime < 350) {
                    deleteItem(this);
                    return;
                }
                lastClickTime = clickTime;

                // ถ้าคลิกครั้งเดียว (สลับสถานะ)
                setTimeout(() => {
                    if (!this.active) return; // ถูกลบไปแล้ว
                    if (new Date().getTime() - lastClickTime < 350) return; // มีคลิกที่สองตามมา (double click)

                    let currentRole = this.getData('role');
                    if (currentRole !== 'decor') {
                        let newRole = currentRole === 'decoy' ? 'target' : 'decoy';
                        this.setData('role', newRole);
                        
                        if (newRole === 'target') {
                            statusText.setText('🎯 เป้าหมาย');
                            statusText.setBackgroundColor('#27ae60');
                        } else {
                            statusText.setText('❌ ตัวหลอก');
                            statusText.setBackgroundColor('#e74c3c');
                        }
                        
                        // เด้งดึ๋งเบาๆ ตอนเปลี่ยนสถานะ
                        sceneRef.tweens.add({ targets: this, y: this.y - 10, yoyo: true, duration: 100 });
                    }
                }, 360);
            });

            placedItems.push(container);
        };

        function deleteItem(container) {
            const index = placedItems.indexOf(container);
            if (index > -1) placedItems.splice(index, 1);
            sceneRef.tweens.add({ targets: container, scale: 0, duration: 200, onComplete: () => container.destroy() });
        }

        window.submitWork = function() {
            if (placedItems.length === 0) {
                alert('⚠️ ยังไม่ได้จัดวางไอเทมในฉากเลยครับ!');
                return;
            }

            const desc = document.getElementById('desc-input').value.trim();
            if (desc === '') {
                alert('⚠️ อย่าลืมอธิบายโจทย์ให้เพื่อนฟังด้วยนะครับ ว่าต้องคลิกอะไรบ้าง');
                return;
            }

            // นับจำนวนเป้าหมาย เพื่อเช็คความสมเหตุสมผล
            let targetCount = placedItems.filter(item => item.getData('role') === 'target').length;
            if (targetCount === 0 && placedItems.some(i => i.getData('role') === 'decoy')) {
                alert('⚠️ ด่านนี้ไม่มี "🎯 เป้าหมาย" ให้คลิกเลยครับ!\nคลิกที่ไอเทมเพื่อเปลี่ยนให้เป็นเป้าหมายอย่างน้อย 1 ชิ้นนะ');
                return;
            }

            const currentBg = bgImage.texture.key;
            const finalDesc = `[ฉากหลัง: ${currentBg}]\n\n` + desc;

            if (!confirm('ยืนยันสร้างด่านนี้ให้เพื่อนๆ เล่นใช่ไหม?')) return;

            // 💾 บันทึกข้อมูล Role เข้าไปด้วย!!
            const itemsData = placedItems.map(item => ({
                type: item.getData('type'),
                x: Math.round(item.x),
                y: Math.round(item.y),
                role: item.getData('role') // บันทึกว่าชิ้นนี้คือ target, decoy หรือ decor
            }));

            fetch('../api/save_work.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        game_id: GAME_ID,
                        description: finalDesc,
                        items: itemsData
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        if (confirm('🎉 สร้างด่านสำเร็จ!\n\nกด "OK" เพื่อไปดูผลงาน\nกด "Cancel" เพื่อกลับหน้าหลัก')) {
                            window.location.href = 'showcase.php?game_id=<?php echo $game_id; ?>'; 
                        } else {
                            window.location.href = 'student_dashboard.php'; 
                        }
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
                });
        };

        new Phaser.Game(config);
    </script>
</body>
</html>