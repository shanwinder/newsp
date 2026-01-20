(function () {
  "use strict";

  // เช็คว่า Phaser โหลดหรือยัง
  if (typeof Phaser === "undefined") {
    console.error("Phaser not found");
    return;
  }

  const STAGE_ID = "2-1"; // Chapter 2, Stage 1

  const config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.NO_CENTER,
      width: 900,
      height: 600,
    },
    parent: "game-container",
    backgroundColor: "#e3f2fd", // สีฟ้าอ่อน สบายตา
    scene: {
      preload: preload,
      create: create,
    },
  };

  // --- ตัวแปรเกม ---
  let robot;
  let robotSprite;
  let commandQueue = []; // เก็บคำสั่งที่เลือก
  let isRunning = false;

  // ตั้งค่า Grid
  const TILE_SIZE = 64;
  const OFFSET_X = 60; // ขยับตารางไปทางขวา
  const OFFSET_Y = 50;

  // ตำแหน่งเริ่มต้น (Grid Index)
  const startPos = { x: 1, y: 3 };
  const goalPos = { x: 6, y: 3 }; // เดินเส้นตรงไปทางขวา 5 ช่อง

  // แผนที่ (0:พื้น, 1:กำแพง) - สร้างกรอบกำแพงกันตก
  const mapLayout = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1], // แถวที่ 3 คือทางเดิน
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];

  // สถานะหุ่นยนต์ปัจจุบัน
  let currentGrid = { ...startPos };
  let currentDir = 0; // 0:ขวา, 1:ล่าง, 2:ซ้าย, 3:บน (เริ่มเกมหันขวา)

  function preload() {
    this.load.setBaseURL("../");

    // โหลดเสียง
    this.load.audio("correct", "assets/sound/correct.mp3");
    this.load.audio("wrong", "assets/sound/wrong.mp3");

    // ✅ เรียกใช้ Asset Generator สร้างรูปภาพ (หุ่น, พื้น, แบต)
    if (typeof generateRobotAssets === "function") {
      generateRobotAssets(this);
    } else {
      console.error("❌ ไม่พบไฟล์ asset_generator.js กรุณาติดตั้งก่อน");
    }
  }

  function create() {
    const scene = this;

    // 1. วาดแผนที่ (Grid & Walls)
    drawMap(scene);

    // 2. วางแบตเตอรี่ (Goal)
    const gX = OFFSET_X + goalPos.x * TILE_SIZE + 32;
    const gY = OFFSET_Y + goalPos.y * TILE_SIZE + 32;
    scene.add.image(gX, gY, "battery").setScale(0.8);

    // 3. วางหุ่นยนต์ (Robot)
    const rX = OFFSET_X + startPos.x * TILE_SIZE + 32;
    const rY = OFFSET_Y + startPos.y * TILE_SIZE + 32;
    robotSprite = scene.add.image(rX, rY, "robot").setDepth(10);

    // 4. สร้าง UI (พื้นที่วางคำสั่ง)
    createUI(scene);
  }

  // --- ฟังก์ชันวาดแผนที่ ---
  function drawMap(scene) {
    for (let y = 0; y < mapLayout.length; y++) {
      for (let x = 0; x < mapLayout[y].length; x++) {
        const posX = OFFSET_X + x * TILE_SIZE + 32;
        const posY = OFFSET_Y + y * TILE_SIZE + 32;

        if (mapLayout[y][x] === 1) {
          scene.add.image(posX, posY, "wall");
        } else {
          scene.add.image(posX, posY, "floor");
        }
      }
    }

    // ข้อความโจทย์
    scene.add.text(
      50,
      10,
      "ภารกิจ: พาหุ่นยนต์ไปชาร์จแบตเตอรี่ (เดินหน้า 5 ครั้ง)",
      {
        fontFamily: "Kanit",
        fontSize: "20px",
        color: "#333",
      },
    );
  }

  // --- ฟังก์ชันสร้าง UI และระบบคำสั่ง ---
  function createUI(scene) {
    // พื้นหลังแผงควบคุม (ด้านล่าง)
    const panel = scene.add
      .rectangle(450, 520, 880, 140, 0xffffff)
      .setStrokeStyle(2, 0xcccccc);
    scene.add.text(60, 460, "เลือกคำสั่ง:", {
      fontFamily: "Kanit",
      fontSize: "18px",
      color: "#555",
    });
    scene.add.text(250, 460, "โปรแกรมของคุณ:", {
      fontFamily: "Kanit",
      fontSize: "18px",
      color: "#555",
    });

    // --- 1. ปุ่มคำสั่ง (Source) ---
    // ด่าน 1 มีแค่เดินหน้า (Forward)
    const cmdForward = scene.add
      .image(100, 520, "cmd_forward")
      .setInteractive({ cursor: "pointer" });

    // Effect ตอนเอาเมาส์ชี้
    cmdForward.on("pointerover", () => cmdForward.setScale(1.1));
    cmdForward.on("pointerout", () => cmdForward.setScale(1));

    // Logic: คลิกเพื่อเพิ่มคำสั่ง
    cmdForward.on("pointerdown", () => {
      if (isRunning) return;
      addCommand(scene, "forward");
    });

    // --- 2. ปุ่ม Play / Reset ---
    const btnPlay = scene.add
      .rectangle(800, 500, 100, 50, 0x2ecc71)
      .setInteractive({ cursor: "pointer" });
    const txtPlay = scene.add
      .text(800, 500, "▶ START", {
        fontFamily: "Kanit",
        fontSize: "18px",
        color: "#fff",
      })
      .setOrigin(0.5);

    const btnReset = scene.add
      .rectangle(800, 560, 100, 40, 0xe74c3c)
      .setInteractive({ cursor: "pointer" });
    scene.add
      .text(800, 560, "↺ RESET", {
        fontFamily: "Kanit",
        fontSize: "16px",
        color: "#fff",
      })
      .setOrigin(0.5);

    btnPlay.on("pointerdown", () => {
      if (!isRunning && commandQueue.length > 0) runAlgorithm(scene);
    });

    btnReset.on("pointerdown", () => {
      resetLevel(scene);
    });
  }

  // --- ระบบจัดการคำสั่ง ---
  let commandIcons = [];

  function addCommand(scene, type) {
    // จำกัดไม่ให้ยาวเกินจอ
    if (commandQueue.length >= 10) return;

    commandQueue.push(type);

    // วาดไอคอนในราง (Tray)
    const index = commandQueue.length - 1;
    const startX = 260;
    const gap = 50; // ระยะห่าง

    const iconKey = type === "forward" ? "cmd_forward" : "cmd_unknown";
    const icon = scene.add
      .image(startX + index * gap, 520, iconKey)
      .setDisplaySize(40, 40);

    // เพิ่มปุ่มลบ (เล็กๆ)
    icon.setInteractive({ cursor: "pointer" });
    icon.on("pointerdown", () => {
      if (isRunning) return;
      // ลบตัวเองและตัวหลังทั้งหมด (ง่ายๆ ก่อน)
      resetLevel(scene); // รีเซ็ตไปเลยเพื่อความไม่งง
    });

    commandIcons.push(icon);
  }

  function resetLevel(scene) {
    isRunning = false;

    // รีเซ็ตหุ่น
    currentGrid = { ...startPos };
    currentDir = 0; // หันขวา

    const rX = OFFSET_X + startPos.x * TILE_SIZE + 32;
    const rY = OFFSET_Y + startPos.y * TILE_SIZE + 32;
    robotSprite.setPosition(rX, rY);
    robotSprite.setAngle(0); // 0 องศา

    // รีเซ็ตคำสั่ง
    commandQueue = [];
    commandIcons.forEach((icon) => icon.destroy());
    commandIcons = [];
  }

  // --- ระบบประมวลผล (Algorithm Execution) ---
  async function runAlgorithm(scene) {
    isRunning = true;

    for (let i = 0; i < commandQueue.length; i++) {
      const cmd = commandQueue[i];

      // Highlight คำสั่งที่กำลังทำ
      scene.tweens.add({
        targets: commandIcons[i],
        scale: 1.2,
        duration: 200,
        yoyo: true,
      });

      if (cmd === "forward") {
        await moveRobot(scene);
      }

      // เช็คว่าชนกำแพงไหม? (ใน moveRobot เช็คแล้ว)
      // เช็คว่าถึงเส้นชัยยัง?
      if (currentGrid.x === goalPos.x && currentGrid.y === goalPos.y) {
        scene.sound.play("correct");
        showWin(scene);
        return; // จบเกม
      }

      // รอจังหวะนิดนึงก่อนทำคำสั่งถัดไป
      await new Promise((r) => scene.time.delayedCall(500, r));
    }

    isRunning = false;
    // ถ้าคำสั่งหมดแล้วยังไม่ถึง
    if (!(currentGrid.x === goalPos.x && currentGrid.y === goalPos.y)) {
      scene.sound.play("wrong");
      // สั่นหุ่นเตือนว่าผิด
      scene.tweens.add({
        targets: robotSprite,
        x: "+=5",
        duration: 50,
        yoyo: true,
        repeat: 3,
      });
    }
  }

  function moveRobot(scene) {
    return new Promise((resolve) => {
      // คำนวณเป้าหมาย
      let nextX = currentGrid.x;
      let nextY = currentGrid.y;

      if (currentDir === 0)
        nextX++; // ขวา
      else if (currentDir === 1)
        nextY++; // ล่าง
      else if (currentDir === 2)
        nextX--; // ซ้าย
      else if (currentDir === 3) nextY--; // บน

      // เช็คกำแพง (Collision)
      if (mapLayout[nextY][nextX] === 1) {
        scene.sound.play("wrong");
        scene.cameras.main.shake(100, 0.01);
        resolve(); // เดินไม่ได้ จบเทิร์นนี้
        return;
      }

      // เดินได้ -> อัปเดตข้อมูล
      currentGrid.x = nextX;
      currentGrid.y = nextY;

      // อัปเดตภาพ (Tween)
      const pixelX = OFFSET_X + nextX * TILE_SIZE + 32;
      const pixelY = OFFSET_Y + nextY * TILE_SIZE + 32;

      scene.tweens.add({
        targets: robotSprite,
        x: pixelX,
        y: pixelY,
        duration: 400,
        onComplete: resolve,
      });
    });
  }

  function showWin(scene) {
    // Effect ชนะ
    if (scene.emitter) scene.emitter.explode(20, robotSprite.x, robotSprite.y);

    const txt = scene.add
      .text(450, 300, "🎉 ภารกิจสำเร็จ! 🎉", {
        fontFamily: "Kanit",
        fontSize: "48px",
        color: "#2ecc71",
        stroke: "#fff",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setScale(0);

    scene.tweens.add({
      targets: txt,
      scale: 1,
      duration: 500,
      ease: "Back.out",
      onComplete: () => {
        // ส่งคะแนน (ถ้ามีฟังก์ชัน)
        if (typeof window.sendResult === "function") {
          window.sendResult(STAGE_ID, 3, 0, 0); // 3 ดาว
        } else {
          // Fallback: กลับหน้าหลัก
          setTimeout(
            () =>
              (window.location.href = "waiting_room.php?stage_id=" + STAGE_ID),
            2000,
          );
        }
      },
    });
  }

  // เริ่มเกม
  new Phaser.Game(config);
})();
