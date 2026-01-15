// assets/js/logic_game/stage3.js
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Stage 3: Daily Algorithms Loading..."); // เช็คใน Console

    // รับค่า Stage ID (ถ้าไม่มีให้เป็น 3)
    const STAGE_ID = window.STAGE_ID || 3;

    const config = {
      type: Phaser.AUTO,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.NO_CENTER,
        width: 900,
        height: 600,
      },
      parent: "game-container",
      backgroundColor: "#E8F5E9", // สีเขียวอ่อน Theme ธรรมชาติ
      scene: {
        preload: preload,
        create: create,
      },
    };

    // Global Variables
    let startTime;
    let totalAttempts = 0;
    let currentSubLevel = 0;
    const totalSubLevels = 3;
    let levelObjects = [];

    function preload() {
      this.load.setBaseURL("../");
      // โหลดเสียง
      this.load.audio("correct", "assets/sound/correct.mp3");
      this.load.audio("wrong", "assets/sound/wrong.mp3");
    }

    function create() {
      const scene = this;
      startTime = Date.now();
      totalAttempts = 0;
      currentSubLevel = 0;
      levelObjects = [];

      // --- 0. สร้าง Texture ดาว (วาดสด) ---
      if (!scene.textures.exists("star")) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff, 1);
        const cx = 16,
          cy = 16,
          outer = 15,
          inner = 7;
        g.beginPath();
        for (let i = 0; i < 5; i++) {
          g.lineTo(
            cx + Math.cos((18 + i * 72) * 0.01745) * outer,
            cy - Math.sin((18 + i * 72) * 0.01745) * outer
          );
          g.lineTo(
            cx + Math.cos((54 + i * 72) * 0.01745) * inner,
            cy - Math.sin((54 + i * 72) * 0.01745) * inner
          );
        }
        g.closePath();
        g.fillPath();
        g.generateTexture("star", 32, 32);
      }

      // Emitter
      scene.emitter = scene.add
        .particles(0, 0, "star", {
          speed: { min: 200, max: 400 },
          scale: { start: 0.6, end: 0 },
          blendMode: "ADD",
          lifespan: 1000,
          gravityY: 200,
          tint: [0x4caf50, 0x8bc34a, 0xffeb3b, 0xff9800],
          emitting: false,
        })
        .setDepth(100);

      // --- 1. ข้อมูลด่านย่อย (Algorithms) ---
      scene.levelData = [
        {
          title: "ขั้นตอนการแปรงฟัน 🪥",
          steps: [
            { id: 1, text: "บีบยาสีฟัน", color: 0x42a5f5 },
            { id: 2, text: "แปรงให้ทั่ว", color: 0x66bb6a },
            { id: 3, text: "บ้วนปาก", color: 0xffa726 },
          ],
        },
        {
          title: "ขั้นตอนการปลูกต้นไม้ 🌱",
          steps: [
            { id: 1, text: "ขุดหลุมดิน", color: 0x795548 },
            { id: 2, text: "หยอดเมล็ด", color: 0x8d6e63 },
            { id: 3, text: "กลบดิน", color: 0xa1887f },
            { id: 4, text: "รดน้ำ", color: 0x29b6f6 },
          ],
        },
        {
          title: "ทำแซนด์วิช 🥪",
          steps: [
            { id: 1, text: "เตรียมขนมปัง", color: 0xffca28 },
            { id: 2, text: "ทาแยม/เนย", color: 0xef5350 },
            { id: 3, text: "วางไส้", color: 0x66bb6a },
            { id: 4, text: "ประกบขนมปัง", color: 0xffca28 },
            { id: 5, text: "ใส่จาน", color: 0xab47bc },
          ],
        },
      ];

      // เริ่มโหลดด่านย่อยแรก
      loadSubLevel(scene, 0);
    }

    // --- Core Functions ---
    function loadSubLevel(scene, index) {
      // ล้างวัตถุเก่า
      if (levelObjects.length > 0) {
        levelObjects.forEach((obj) => obj.destroy());
      }
      levelObjects = [];

      const data = scene.levelData[index];
      const stepCount = data.steps.length;

      // UI Header
      const title = scene.add
        .text(450, 50, data.title, {
          fontSize: "40px",
          color: "#2E7D32",
          fontFamily: "Kanit",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setPadding({ top: 10, bottom: 10 }); // <--- ⚠️ เพิ่มบรรทัดนี้ครับ!

      const subTitle = scene.add
        .text(450, 95, `ภารกิจย่อยที่ ${index + 1} / 3`, {
          fontSize: "24px",
          color: "#558B2F",
          fontFamily: "Kanit",
        })
        .setOrigin(0.5)
        .setPadding({ top: 10, bottom: 10 }); // <--- ⚠️ เพิ่มบรรทัดนี้ครับ!

      levelObjects.push(title, subTitle);

      // คำนวณตำแหน่งวาง Drop Zones (ด้านบน)
      const zoneWidth = 140;
      const gap = 20;
      const totalZoneWidth = stepCount * zoneWidth + (stepCount - 1) * gap;
      const startX = 450 - totalZoneWidth / 2 + zoneWidth / 2;

      const dropZones = [];

      for (let i = 0; i < stepCount; i++) {
        const x = startX + i * (zoneWidth + gap);
        const y = 220;

        // วาดกล่อง Drop Zone (เส้นประ)
        const graphics = scene.add.graphics();
        graphics.lineStyle(3, 0xbdbdbd, 1);
        graphics.strokeRoundedRect(
          x - zoneWidth / 2,
          y - 40,
          zoneWidth,
          80,
          10
        );

        // เลขลำดับ (1, 2, 3...)
        const num = scene.add
          .text(x, y - 60, `Step ${i + 1}`, {
            fontSize: "20px",
            color: "#9E9E9E",
            fontFamily: "Kanit",
            fontStyle: "bold",
          })
          .setOrigin(0.5);

        // สร้าง Zone
        const zone = scene.add
          .zone(x, y, zoneWidth, 80)
          .setRectangleDropZone(zoneWidth, 80);
        zone.setData({ stepId: i + 1, isFilled: false });

        dropZones.push(zone);
        levelObjects.push(graphics, num, zone);
      }

      // สร้างตัวเลือก (Draggable Cards)
      const options = [...data.steps];
      Phaser.Utils.Array.Shuffle(options); // สลับลำดับ

      // คำนวณตำแหน่งวางตัวเลือก (ด้านล่าง)
      options.forEach((step, i) => {
        let x, y;

        // จัดเรียงแบบ Grid ถ้าตัวเลือกเยอะ
        if (stepCount >= 5) {
          // จัด 2 แถว
          const row = Math.floor(i / 3);
          const col = i % 3;
          x = 300 + col * 150;
          y = 400 + row * 90;
        } else {
          // จัดแถวเดียว
          const optStartX = 450 - (options.length * 150) / 2 + 75;
          x = optStartX + i * 150;
          y = 450;
        }

        // สร้าง Card Container
        const card = createCard(scene, x, y, step.text, step.color, step.id);
        levelObjects.push(card);
      });

      setupDragEvents(scene, dropZones);
    }

    // ฟังก์ชันสร้างการ์ดข้อความ (ใช้ Container)
    // ฟังก์ชันสร้างการ์ดข้อความ (Update แก้สระลอยหาย)
    function createCard(scene, x, y, text, color, id) {
      const container = scene.add.container(x, y);
      container.setSize(140, 70);

      // พื้นหลังการ์ด
      const bg = scene.add.graphics();
      bg.fillStyle(0xffffff, 1);
      bg.fillRoundedRect(-70, -35, 140, 70, 10);
      bg.lineStyle(4, color, 1);
      bg.strokeRoundedRect(-70, -35, 140, 70, 10);

      // แถบสี
      const strip = scene.add.graphics();
      strip.fillStyle(color, 1);
      strip.fillRoundedRect(-70, -35, 20, 70, { tl: 10, bl: 10, tr: 0, br: 0 });

      // ข้อความ (แก้ไขสระหายตรงนี้)
      const label = scene.add
        .text(5, 0, text, {
          fontSize: "18px",
          color: "#333",
          fontFamily: "Kanit",
          wordWrap: { width: 110, useAdvancedWrap: true },
          testString: "|MÉqpy ปี่ที่ฮู้", // ช่วยวัดความสูงบรรทัดให้ถูกต้อง
        })
        .setOrigin(0.5)
        .setPadding({ top: 5, bottom: 5 }); // กันเหนียว เผื่อสระยังล้น

      container.add([bg, strip, label]);

      // ทำให้ลากได้
      container.setInteractive();
      scene.input.setDraggable(container);

      // เก็บ Data
      container.setData({ id: id, originX: x, originY: y });

      return container;
    }

    function setupDragEvents(scene, dropZones) {
      // ล้าง Event เก่าป้องกันการซ้อน
      scene.input.removeAllListeners("dragstart");
      scene.input.removeAllListeners("drag");
      scene.input.removeAllListeners("drop");
      scene.input.removeAllListeners("dragend");

      scene.input.on("dragstart", (pointer, gameObject) => {
        scene.children.bringToTop(gameObject);
        scene.tweens.add({ targets: gameObject, scale: 1.1, duration: 100 });
      });

      scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
      });

      scene.input.on("drop", (pointer, gameObject, dropZone) => {
        const zoneStepId = dropZone.getData("stepId");
        const itemStepId = gameObject.getData("id");

        // Logic: ID ต้องตรงกัน และช่องต้องว่าง
        if (zoneStepId === itemStepId && !dropZone.getData("isFilled")) {
          // ✅ Correct
          gameObject.disableInteractive();
          dropZone.setData("isFilled", true);

          scene.tweens.add({
            targets: gameObject,
            x: dropZone.x,
            y: dropZone.y,
            scale: 1,
            duration: 200,
            ease: "Back.out",
            onComplete: () => {
              if (scene.emitter) {
                scene.emitter.explode(15, dropZone.x, dropZone.y);
              }
              playSound(scene, "correct");

              // Check Level Complete
              const isComplete = dropZones.every((z) => z.getData("isFilled"));
              if (isComplete) {
                handleSubLevelComplete(scene);
              }
            },
          });
        } else {
          // ❌ Wrong
          totalAttempts++;
          returnToOrigin(scene, gameObject);
          wrongEffect(scene, gameObject);
        }
      });

      scene.input.on("dragend", (pointer, gameObject, dropped) => {
        if (!dropped) returnToOrigin(scene, gameObject);
      });
    }

    function handleSubLevelComplete(scene) {
      scene.time.delayedCall(1000, () => {
        if (currentSubLevel < totalSubLevels - 1) {
          currentSubLevel++;
          scene.cameras.main.fade(300, 0, 0, 0);
          scene.cameras.main.once("camerafadeoutcomplete", () => {
            loadSubLevel(scene, currentSubLevel);
            scene.cameras.main.fadeIn(300);
          });
        } else {
          checkGlobalWin(scene);
        }
      });
    }

    function checkGlobalWin(scene) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      let stars = 1;
      if (totalAttempts === 0 && duration < 90) stars = 3;
      else if (totalAttempts <= 3) stars = 2;

      showWinPopup(scene, stars, duration);
    }

    function showWinPopup(scene, stars, duration) {
      const overlay = scene.add
        .rectangle(450, 300, 900, 600, 0x000000, 0.8)
        .setDepth(20)
        .setAlpha(0);
      scene.tweens.add({ targets: overlay, alpha: 0.8, duration: 300 });

      const phrases = [
        "🧠 นักวางแผน! 🧠",
        "📅 เป็นระเบียบมาก! 📅",
        "✨ ขั้นตอนเป๊ะ! ✨",
      ];
      const randomPhrase = Phaser.Utils.Array.GetRandom(phrases);

      const text = scene.add
        .text(450, 250, randomPhrase, {
          fontSize: "64px",
          color: "#8BC34A",
          fontFamily: "Kanit",
          stroke: "#fff",
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setDepth(22)
        .setScale(0);
      scene.tweens.add({
        targets: text,
        scale: 1,
        duration: 500,
        ease: "Back.out",
      });

      let starStr = "";
      for (let i = 0; i < stars; i++) starStr += "⭐";
      const starText = scene.add
        .text(450, 350, starStr, { fontSize: "48px" })
        .setOrigin(0.5)
        .setDepth(22)
        .setAlpha(0);
      scene.tweens.add({
        targets: starText,
        alpha: 1,
        delay: 300,
        duration: 500,
      });

      scene.time.delayedCall(2000, () => {
        window.location.href = `waiting_room.php?stage_id=${STAGE_ID}`;
      });

      if (typeof window.sendResult === "function") {
        window.sendResult(STAGE_ID, stars, duration, totalAttempts);
      }
    }

    function returnToOrigin(scene, gameObject) {
      scene.tweens.add({
        targets: gameObject,
        x: gameObject.getData("originX"),
        y: gameObject.getData("originY"),
        scale: 1,
        duration: 400,
        ease: "Cubic.out",
      });
    }

    function wrongEffect(scene, gameObject) {
      playSound(scene, "wrong");
      scene.cameras.main.shake(100, 0.005);
      // Container ไม่มี setTint ต้อง Tint ลูกๆ
      gameObject.list.forEach((child) => {
        if (child.setTint) child.setTint(0xff9999);
      });
      scene.time.delayedCall(500, () => {
        gameObject.list.forEach((child) => {
          if (child.clearTint) child.clearTint();
        });
      });
    }

    function playSound(scene, key) {
      try {
        scene.sound.play(key, { volume: 0.5 });
      } catch (e) {}
    }

    // Start Game
    new Phaser.Game(config);
  });
})();
