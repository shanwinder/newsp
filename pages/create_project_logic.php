<?php
// pages/create_project_logic.php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
$game_id = 1; 
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
            /* 🟢 ปิดฟีเจอร์ "ดึงเพื่อรีเฟรช" (Pull-to-refresh) บน Tablet/มือถือ */
            overscroll-behavior-y: none; 
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
            padding: 15px;
            border: 2px dashed #cbd5e1;
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
            touch-action: none;
            /* 🟢 ป้องกันการเผลอคลุมดำรูปภาพเวลาแตะค้างบน Tablet */
            -webkit-user-select: none; 
            user-select: none;
            -webkit-touch-callout: none;
            background-color: #fff;
        }
    </style>
</head>

<body>

    <div class="container-fluid py-4 px-lg-5">
        <div class="text-center text-white mb-3 text-shadow">
            <h1 class="fw-bold"><i class="bi bi-controller"></i> สตูดิโอสร้างด่าน "จับผิดตรรกะ"</h1>
            <p class="fs-5 opacity-75 mb-0">ออกแบบเงื่อนไขที่ซับซ้อน แล้วส่งให้เพื่อนๆ มาไขปริศนา!</p>
        </div>

        <div class="editor-container">
            <div class="row g-3">
                
                <div class="col-lg-3 order-2 order-lg-1">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="fw-bold text-success m-0"><i class="bi bi-box-seam"></i> คลังไอเทม</h5>
                    </div>
                    <p class="small text-muted mb-3">คลิกเพื่อเสกไอเทมลงในฉาก</p>

                    <div class="toolbox-panel">
                        <div class="row g-2" id="container-items"></div>
                    </div>
                </div>

                <div class="col-lg-6 order-1 order-lg-2">
                    <div class="d-flex justify-content-center flex-wrap gap-2 mb-2 bg-light p-2 rounded border">
                        <span class="fw-bold text-muted mt-1 me-2"><i class="bi bi-image"></i> เลือกฉากหลัง:</span>
                        <button class="btn btn-sm btn-outline-secondary rounded-pill" onclick="changeBackground('grid')">ตารางกระดาษ</button>
                        <button class="btn btn-sm btn-outline-success rounded-pill" onclick="changeBackground('farm')">ฟาร์ม</button>
                        <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="changeBackground('barn')">โรงนา</button>
                        <button class="btn btn-sm btn-outline-info rounded-pill" onclick="changeBackground('v_garden')">แปลงผัก</button>
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
                            <i class="bi bi-lightbulb-fill text-warning"></i> <strong>วิธีตั้งค่าเป้าหมาย:</strong><br>
                            👉 <strong>ลากเมาส์</strong> เพื่อย้ายตำแหน่งไอเทม<br>
                            👉 <strong>คลิก 1 ครั้ง (แล้วปล่อย)</strong> เพื่อสลับเป็น 🎯 เป้าหมาย หรือ ❌ ตัวหลอก<br>
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

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
        const GAME_ID = <?php echo $game_id; ?>;
        let placedItems = []; 
        let sceneRef;
        let gridBg, bgImage;
        let currentBgType = 'grid';

        const assetList = [
            { key: 'basket', img: '../assets/img/basket.webp', label: 'ตะกร้า', scale: 160, role: 'decoy' }, 
            { key: 'weed_spiky', img: '../assets/img/weed_spiky.webp', label: 'หญ้าแหลม', scale: 120, role: 'decoy' },
            { key: 'weed_round', img: '../assets/img/weed_round.webp', label: 'หญ้ากลม', scale: 120, role: 'decoy' },
            { key: 'bug_red', img: '../assets/img/bug_red.webp', label: 'แมลงแดง', scale: 100, role: 'decoy' },
            { key: 'bug_blue', img: '../assets/img/bug_blue.webp', label: 'แมลงฟ้า', scale: 100, role: 'decoy' },
            { key: 'newseed', img: '../assets/img/newseed.webp', label: 'เมล็ดพันธุ์', scale: 100, role: 'decoy' },
            { key: 'fert_green_bag', img: '../assets/img/fert_green_bag.webp', label: 'กระสอบเขียว', scale: 120, role: 'decoy' },
            { key: 'fert_red_bag', img: '../assets/img/fert_red_bag.webp', label: 'กระสอบแดง', scale: 120, role: 'decoy' },
            { key: 'fert_green_round', img: '../assets/img/fert_green_round.webp', label: 'เม็ดกลมเขียว', scale: 100, role: 'decoy' },
            { key: 'fert_green_square', img: '../assets/img/fert_green_square.webp', label: 'แท่งเหลี่ยมเขียว', scale: 100, role: 'decoy' },
            { key: 'fert_red_round', img: '../assets/img/fert_red_round.webp', label: 'เม็ดกลมแดง', scale: 100, role: 'decoy' },
            { key: 'fert_red_square', img: '../assets/img/fert_red_square.webp', label: 'แท่งเหลี่ยมแดง', scale: 100, role: 'decoy' }
        ];

        function renderToolbox() {
            const container = document.getElementById('container-items');
            assetList.forEach(item => {
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
        renderToolbox();

        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-canvas',
            width: 800, 
            height: 480,
            backgroundColor: '#ffffff',
            scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
            input: { 
                mouse: { preventDefaultWheel: false }, 
                touch: { capture: true },
                activePointers: 2 
            },
            scene: { preload: preload, create: create }
        };

        // บล็อกการเลื่อนจอด้วยนิ้วเฉพาะจุดที่เป็นเกม
        document.getElementById('phaser-canvas').addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, { passive: false });

        function preload() {
            assetList.forEach(item => { this.load.image(item.key, item.img); });
            this.load.image('bg_farm', '../assets/img/bg_farm.webp');
            this.load.image('bg_barn', '../assets/img/bg_barn.webp');
            this.load.image('bg_v_garden', '../assets/img/bg_v_garden.webp');
        }

        function create() {
            sceneRef = this;
            gridBg = this.add.grid(400, 240, 800, 480, 40, 40, 0xffffff, 1, 0xcccccc, 0.5);
            bgImage = this.add.image(400, 240, 'bg_farm').setVisible(false);
            bgImage.setDisplaySize(800, 480);
        }

        window.changeBackground = function(type) {
            if(!sceneRef) return;
            currentBgType = type;
            if(type === 'grid') {
                gridBg.setVisible(true);
                bgImage.setVisible(false);
            } else {
                gridBg.setVisible(false);
                bgImage.setVisible(true);
                bgImage.setTexture('bg_' + type); 
                bgImage.setDisplaySize(800, 480); 
            }
            sceneRef.children.sendToBack(gridBg);
            sceneRef.children.sendToBack(bgImage);
        };

        window.spawnItem = function(key, targetSize, defaultRole) {
            if (!sceneRef) return;

            const x = Phaser.Math.Between(350, 450);
            const y = Phaser.Math.Between(200, 280);

            const touchAreaSize = targetSize + 20; 
            const container = sceneRef.add.container(x, y).setSize(touchAreaSize, touchAreaSize).setInteractive({ cursor: 'pointer' });
            sceneRef.input.setDraggable(container);
            
            const img = sceneRef.add.image(0, 0, key);
            img.setDisplaySize(targetSize, targetSize * (img.height / img.width));
            container.add(img);

            container.setData('type', key);
            container.setData('role', defaultRole); 

            let statusText = null;
            if (defaultRole !== 'decor') {
                statusText = sceneRef.add.text(0, -targetSize/2 - 15, '❌ ตัวหลอก', { 
                    fontSize: '14px', fontFamily: 'Kanit', color: '#fff', backgroundColor: '#e74c3c', padding: {x:6, y:3} 
                }).setOrigin(0.5);
                container.add(statusText);
            }

            const currentScale = container.scale;
            sceneRef.tweens.add({ targets: container, scale: { from: 0, to: currentScale }, duration: 300, ease: 'Back.out' });

            container.on('dragstart', function() {
                this.setAlpha(0.8);
                sceneRef.children.bringToTop(this);
            });

            container.on('drag', function(pointer, dragX, dragY) {
                this.x = dragX; 
                this.y = dragY;
            });

            container.on('dragend', function() {
                this.setAlpha(1);
            });

            container.on('pointerup', function(pointer) {
                // 🟢 ใช้ฟังก์ชันของ Phaser ตรวจสอบระยะทาง (ถ้าลากเกิน 10px ถือว่าไม่ได้ตั้งใจคลิก)
                if (pointer.getDistance() > 10) return;

                const now = new Date().getTime();
                const lastClick = this.getData('lastClickTime') || 0;
                const timeDiff = now - lastClick;

                if (timeDiff > 0 && timeDiff < 350) {
                    clearTimeout(this.getData('clickTimer'));
                    this.setData('lastClickTime', 0);
                    deleteItem(this); 
                } else {
                    this.setData('lastClickTime', now);
                    
                    let timer = setTimeout(() => {
                        if (!this.active || this.getData('role') === 'decor') return;
                        
                        let currentRole = this.getData('role');
                        let newRole = currentRole === 'decoy' ? 'target' : 'decoy';
                        this.setData('role', newRole);
                        
                        if (newRole === 'target') {
                            statusText.setText('🎯 เป้าหมาย');
                            statusText.setBackgroundColor('#27ae60');
                        } else {
                            statusText.setText('❌ ตัวหลอก');
                            statusText.setBackgroundColor('#e74c3c');
                        }
                        sceneRef.tweens.add({ targets: this, y: this.y - 10, yoyo: true, duration: 100 });

                    }, 360);

                    this.setData('clickTimer', timer);
                }
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

            let targetCount = placedItems.filter(item => item.getData('role') === 'target').length;
            if (targetCount === 0 && placedItems.some(i => i.getData('role') === 'decoy')) {
                alert('⚠️ ด่านนี้ไม่มี "🎯 เป้าหมาย" ให้คลิกเลยครับ!\nคลิก 1 ครั้งที่ไอเทมเพื่อเปลี่ยนให้เป็นเป้าหมายอย่างน้อย 1 ชิ้นนะ');
                return;
            }

            const finalDesc = `[ฉากหลัง: ${currentBgType}]\n\n` + desc;

            if (!confirm('ยืนยันจะสร้างชิ้นงานนี้ใช่ไหม?')) return;

            const itemsData = placedItems.map(item => ({
                type: item.getData('type'),
                x: Math.round(item.x),
                y: Math.round(item.y),
                role: item.getData('role')
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
                        if (confirm('🎉 สร้างชิ้นงานสำเร็จ!\n\nกด "OK" เพื่อไปดูผลงาน\nกด "Cancel" เพื่อกลับหน้าหลัก')) {
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