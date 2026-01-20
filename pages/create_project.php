<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
$game_id = $_GET['game_id'] ?? 1;
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>Creative Studio - สร้างสรรค์ชิ้นงาน</title>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <style>
        /* 🎨 THEME DESIGN */
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%);
            /* Blue-Purple Gradient */
            min-height: 100vh;
            color: #333;
        }

        .page-header {
            color: white;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
            margin-bottom: 30px;
        }

        .editor-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 25px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            padding: 20px;
            border: 4px solid #fff;
        }

        .toolbox-panel {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 15px;
            height: 100%;
            border: 2px dashed #cbd5e0;
        }

        .tool-item {
            cursor: pointer;
            transition: transform 0.2s, background 0.2s;
            border-radius: 10px;
            padding: 10px;
            text-align: center;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            margin-bottom: 10px;
            border: 2px solid transparent;
        }

        .tool-item:hover {
            transform: scale(1.05);
            border-color: #9599E2;
            background: #eef2ff;
        }

        .tool-item img {
            width: 50px;
            height: 50px;
            object-fit: contain;
        }

        #phaser-canvas {
            border-radius: 15px;
            overflow: hidden;
            box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
            border: 2px solid #333;
        }

        /* เพิ่มใน <style> ของ pages/create_project.php */

        #phaser-canvas {
            /* ... ค่าเดิม ... */

            /* ✅ เพิ่มบรรทัดนี้: อนุญาตให้ใช้นิ้วเลื่อนผ่านได้ (สำหรับมือถือ/Touchpad) */
            touch-action: pan-y;
        }

        #phaser-canvas canvas {
            /* ✅ บังคับให้ Canvas ไม่ขวางการเลื่อน */
            touch-action: pan-y;
        }
    </style>
</head>

<body>

    <div class="container py-5">

        <div class="text-center page-header">
            <h1 class="fw-bold display-5"><i class="bi bi-palette-fill"></i> ห้องสร้างสรรค์ผลงาน</h1>
            <p class="fs-5 opacity-75">ออกแบบแพทเทิร์นในจินตนาการ แล้วส่งมาอวดครูกันเถอะ!</p>
        </div>

        <div class="editor-container">
            <div class="row g-4">

                <div class="col-lg-2 order-2 order-lg-1">
                    <div class="toolbox-panel text-center">
                        <h5 class="fw-bold text-primary mb-3">📦 คลังภาพ</h5>
                        <p class="small text-muted">คลิกเพื่อเพิ่มรูป</p>

                        <div class="d-grid gap-2" id="tools-container">
                        </div>
                    </div>
                </div>

                <div class="col-lg-7 order-1 order-lg-2">
                    <div id="phaser-canvas" class="w-100 h-100"></div>
                </div>

                <div class="col-lg-3 order-3">
                    <div class="h-100 d-flex flex-column">
                        <div class="bg-light p-3 rounded-4 mb-3 border">
                            <label class="fw-bold mb-2 text-primary"><i class="bi bi-chat-quote-fill"></i> อธิบายแพทเทิร์น</label>
                            <textarea id="desc-input" class="form-control border-0 shadow-sm" rows="5"
                                placeholder="ตัวอย่าง: เรียงสลับกันทีละ 2 รูป คือ หมา-หมา-แมว-แมว..."
                                style="resize: none;"></textarea>
                        </div>

                        <div class="alert alert-warning small rounded-3 border-0 shadow-sm">
                            <i class="bi bi-info-circle-fill"></i> <strong>วิธีใช้:</strong><br>
                            1. คลิกรูปทางซ้ายเพื่อวาง<br>
                            2. ลากจัดตำแหน่งตามใจชอบ<br>
                            3. <strong>ดับเบิ้ลคลิก</strong> ที่รูปเพื่อลบออก
                        </div>

                        <div class="mt-auto d-grid gap-2">
                            <button onclick="submitWork()" class="btn btn-success btn-lg rounded-pill fw-bold shadow-sm">
                                <i class="bi bi-send-fill me-2"></i> ส่งผลงาน
                            </button>
                            <a href="game_select.php?game_id=<?php echo $game_id; ?>" class="btn btn-outline-secondary rounded-pill fw-bold">
                                ยกเลิก / กลับ
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script>
        // --- Phaser Game Config ---
        const GAME_ID = <?php echo $game_id; ?>;
        let placedItems = []; // Array เก็บ Object จริงๆ
        let game;

        // รายการรูปภาพที่มีให้เลือก
        const assetList = [{
                key: 'dog',
                img: '../assets/img/dog.webp',
                label: 'น้องหมา'
            },
            {
                key: 'cat',
                img: '../assets/img/cat.webp',
                label: 'น้องแมว'
            },
            {
                key: 'rabbit',
                img: '../assets/img/rabbit.webp',
                label: 'กระต่าย'
            },
            {
                key: 'sq_red',
                img: '../assets/img/red_square.webp',
                label: 'สี่เหลี่ยม'
            },
            {
                key: 'ci_green',
                img: '../assets/img/green_circle.webp',
                label: 'วงกลม'
            },
            {
                key: 'tri_blue',
                img: '../assets/img/blue_triangle.webp',
                label: 'สามเหลี่ยม'
            },
            {
                key: 'sq_yellow',
                img: '../assets/img/yellow_square.webp',
                label: 'สี่เหลี่ยมเหลือง'
            }
        ];

        // สร้าง Toolbox HTML ภายนอก (เพื่อความสวยงามและคลิกง่ายกว่าใน Canvas)
        const toolContainer = document.getElementById('tools-container');
        assetList.forEach(item => {
            const div = document.createElement('div');
            div.className = 'tool-item';
            div.innerHTML = `<img src="${item.img}"><div class="small fw-bold mt-1">${item.label}</div>`;
            div.onclick = () => spawnItem(item.key); // คลิก HTML ไปสั่ง Phaser
            toolContainer.appendChild(div);
        });

        // Phaser Config
        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-canvas',
            width: 600,
            height: 500,
            backgroundColor: '#ffffff',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },

            // ✅✅✅ เพิ่มส่วนนี้ครับ ✅✅✅
            input: {
                mouse: {
                    preventDefaultWheel: false // สำคัญ: บอกว่าอย่าขัดขวางการ Scroll เมาส์
                },
                touch: {
                    capture: false // สำคัญ: อย่าจับ Touch Event ทั้งหมดไว้คนเดียว
                }
            },
            // ✅✅✅ จบส่วนที่เพิ่ม ✅✅✅

            scene: {
                preload: preload,
                create: create
            }
        };

        let sceneRef; // เก็บ Scene ไว้เรียกใช้จากข้างนอก

        function preload() {
            this.load.setBaseURL('../'); // Base Path
            // โหลดรูปภาพ
            this.load.image("dog", "assets/img/dog.webp");
            this.load.image("cat", "assets/img/cat.webp");
            this.load.image("rabbit", "assets/img/rabbit.webp");
            this.load.image("sq_red", "assets/img/red_square.webp");
            this.load.image("ci_green", "assets/img/green_circle.webp");
            this.load.image("tri_blue", "assets/img/blue_triangle.webp");
            this.load.image("sq_yellow", "assets/img/yellow_square.webp");
            // โหลดภาพพื้นหลังกระดาษ (Optional: วาด Grid เอา)
        }

        function create() {
            sceneRef = this;

            // วาดเส้นบรรทัด (Grid) จางๆ ให้ดูเหมือนสมุด
            const graphics = this.add.graphics();
            graphics.lineStyle(1, 0xe0e0e0, 1);
            for (let i = 0; i < 600; i += 50) {
                graphics.moveTo(i, 0);
                graphics.lineTo(i, 500);
                graphics.moveTo(0, i);
                graphics.lineTo(600, i);
            }
            graphics.strokePath();

            this.add.text(20, 20, "พื้นที่วาดเขียน", {
                fontSize: '20px',
                color: '#ccc',
                fontFamily: 'Kanit'
            });
        }

        // ฟังก์ชันเสกของ (เรียกจาก HTML onclick)
        window.spawnItem = function(key) {
            if (!sceneRef) return;

            // สุ่มตำแหน่งกลางๆ จอ
            const x = Phaser.Math.Between(250, 350);
            const y = Phaser.Math.Between(200, 300);

            const item = sceneRef.add.image(x, y, key).setDisplaySize(80, 80).setInteractive();

            // ตั้งค่าให้ลากได้
            sceneRef.input.setDraggable(item);

            // Data สำหรับส่งงาน
            item.setData('type', key);

            // Effect เด้งดึ๋งตอนเกิด
            sceneRef.tweens.add({
                targets: item,
                scale: {
                    from: 0,
                    to: (80 / item.width)
                }, // คำนวณ Scale ให้ได้ size 80
                duration: 300,
                ease: 'Back.out'
            });

            // Event Drag
            item.on('drag', function(pointer, dragX, dragY) {
                this.x = dragX;
                this.y = dragY;
            });

            // Event Drag Start (ยกขึ้น)
            item.on('dragstart', function() {
                this.setAlpha(0.7);
                sceneRef.children.bringToTop(this);
            });

            // Event Drag End (วางลง)
            item.on('dragend', function() {
                this.setAlpha(1);
            });

            // Event Double Click (ลบ)
            let lastClickTime = 0;
            item.on('pointerdown', function() {
                const clickTime = new Date().getTime();
                if (clickTime - lastClickTime < 350) {
                    // Double Click Detected
                    deleteItem(this);
                }
                lastClickTime = clickTime;
            });

            // เพิ่มเข้า Array
            placedItems.push(item);
        };

        function deleteItem(item) {
            // ลบออกจาก Array
            const index = placedItems.indexOf(item);
            if (index > -1) {
                placedItems.splice(index, 1);
            }
            // Effect ตอนลบ
            sceneRef.tweens.add({
                targets: item,
                scale: 0,
                duration: 200,
                onComplete: () => item.destroy()
            });
        }

        // --- ฟังก์ชันส่งงาน (Fixed) ---
        window.submitWork = function() {
            // เช็คจำนวนไอเท็มจาก Array placedItems โดยตรง (แม่นยำกว่า)
            if (placedItems.length === 0) {
                alert('⚠️ กระดาษเปล่าส่งไม่ได้นะครับ!\nช่วยวางรูปภาพอย่างน้อย 1 รูปก่อนนะ');
                return;
            }

            const desc = document.getElementById('desc-input').value.trim();
            if (desc === '') {
                alert('⚠️ อย่าลืมเขียนคำอธิบายด้วยครับ\nครูจะได้เข้าใจแพทเทิร์นของเรา');
                return;
            }

            if (!confirm('ยืนยันการส่งชิ้นงาน?')) return;

            // เตรียมข้อมูล JSON
            const itemsData = placedItems.map(item => ({
                type: item.getData('type'),
                x: Math.round(item.x),
                y: Math.round(item.y)
            }));

            // ส่ง API
            fetch('../api/save_work.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        game_id: GAME_ID,
                        description: desc,
                        items: itemsData
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        // 🎉 เปลี่ยน Alert ธรรมดา เป็นตัวเลือก
                        if (confirm('🎉 ส่งชิ้นงานเรียบร้อย! ครูได้รับแล้วครับ\n\nกด "OK" เพื่อไปดูผลงานของเพื่อนๆ ใน Hall of Fame\nกด "Cancel" เพื่อกลับหน้าหลัก')) {
                            window.location.href = 'showcase.php?game_id=<?php echo $game_id; ?>'; // ไปหน้าโชว์เคส
                        } else {
                            window.location.href = 'student_dashboard.php'; // กลับหน้าหลัก
                        }
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
                });
        };

        // เริ่มเกม
        game = new Phaser.Game(config);
    </script>

</body>

</html>