// assets/js/logic_game/stage1.js
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const STAGE_ID = window.STAGE_ID || 1;

    const config = {
      type: Phaser.AUTO,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.NO_CENTER,
        width: 900,
        height: 600,
      },
      parent: "game-container",
      backgroundColor: "#87CEEB", // สีฟ้าสดใส
      scene: {
        preload: preload,
        create: create,
      },
    };

    // ตัวแปร Global สำหรับจัดการด่านย่อย
    let startTime;
    let totalAttempts = 0; // นับจำนวนผิดรวมทุกด่านย่อย
    let currentSubLevel = 0; // ด่านย่อยปัจจุบัน (0, 1, 2)
    const totalSubLevels = 3;

    // เก็บ Object ในฉากเพื่อลบออกเวลาเปลี่ยนด่านย่อย
    let levelObjects = [];

    function preload() {
      this.load.setBaseURL("../");
      this.load.image("cat", "assets/img/cat.webp");
      this.load.image("dog", "assets/img/dog.webp");
      this.load.image("rabbit", "assets/img/rabbit.webp");

      // โหลดเสียง
      this.load.audio("correct", "assets/sound/correct.mp3");
      this.load.audio("wrong", "assets/sound/wrong.mp3");
    }

    function create() {
      const scene = this;
      startTime = Date.now();
      totalAttempts = 0;
      currentSubLevel = 0;

      // --- สร้าง Texture ดาว (วาดสด) ---
      if (!scene.textures.exists("star")) {
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff, 1);
        const cx = 16,
          cy = 16,
          outer = 15,
          inner = 7;
        graphics.beginPath();
        for (let i = 0; i < 5; i++) {
          graphics.lineTo(
            cx + Math.cos((18 + i * 72) * 0.01745) * outer,
            cy - Math.sin((18 + i * 72) * 0.01745) * outer
          );
          graphics.lineTo(
            cx + Math.cos((54 + i * 72) * 0.01745) * inner,
            cy - Math.sin((54 + i * 72) * 0.01745) * inner
          );
        }
        graphics.closePath();
        graphics.fillPath();
        graphics.generateTexture("star", 32, 32);
      }

      // --- เตรียมข้อมูลด่านย่อย (Sub-Level Data) ---
      scene.levelData = [
        {
          // Level 1/3: Pattern 2 ตัว (หมา, แมว) - หาย 1 ช่อง
          sequence: ["dog", "cat", "dog", "cat", "dog", "cat"],
          missing: [5], // หายตัวสุดท้าย
          options: ["dog", "cat", "rabbit"],
        },
        {
          // Level 2/3: Pattern 3 ตัว (หมา, แมว, กระต่าย) - หายตรงกลาง
          sequence: ["dog", "cat", "rabbit", "dog", "cat", "rabbit"],
          missing: [4], // หายตัวที่ 5 (Cat)
          options: ["cat", "dog", "rabbit"],
        },
        {
          // Level 3/3: Pattern 3 ตัว - หาย 2 ช่อง (หัวท้าย)
          sequence: ["rabbit", "dog", "cat", "rabbit", "dog", "cat"],
          missing: [0, 5], // หายตัวแรกและตัวสุดท้าย
          options: ["rabbit", "cat", "dog"],
        },
      ];

      // Setup Emitter (พลุ)
      scene.emitter = scene.add
        .particles(0, 0, "star", {
          speed: { min: 200, max: 500 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.6, end: 0 },
          blendMode: "ADD",
          lifespan: 800,
          gravityY: 200,
          tint: [0xff0000, 0xffff00, 0x00ff00, 0x00ffff, 0xff00ff],
          emitting: false,
        })
        .setDepth(100);

      // เริ่มรันด่านแรก
      loadSubLevel(scene, 0);
    }

    // --- ฟังก์ชันโหลดด่านย่อย ---
    function loadSubLevel(scene, index) {
      // 1. ล้างของเก่า (ถ้ามี)
      levelObjects.forEach((obj) => obj.destroy());
      levelObjects = [];

      const data = scene.levelData[index];

      // 2. แสดง UI หัวข้อด่าน
      const titleText = scene.add
        .text(450, 50, `ด่านย่อยที่ ${index + 1} / 3`, {
          fontSize: "32px",
          color: "#ffffff",
          fontFamily: "Kanit",
          stroke: "#000",
          strokeThickness: 4,
        })
        .setOrigin(0.5);
      levelObjects.push(titleText);

      // ProgressBar (หลอดความคืบหน้าด่านย่อย)
      const barBg = scene.add.rectangle(450, 90, 300, 10, 0xffffff, 0.3);
      const barFill = scene.add
        .rectangle(
          300,
          90,
          (300 / totalSubLevels) * (index + 1),
          10,
          0x00ff00,
          1
        )
        .setOrigin(0, 0.5);
      levelObjects.push(barBg, barFill);

      // พื้นหลังโจทย์
      const bg = scene.add.graphics();
      bg.fillStyle(0xffffff, 0.8);
      bg.fillRoundedRect(50, 120, 800, 160, 20);
      levelObjects.push(bg);

      // 3. สร้างโจทย์ (Sequence)
      const dropZones = [];
      let startX = 150;

      data.sequence.forEach((animal, i) => {
        const x = startX + i * 120;
        const y = 200;

        if (data.missing.includes(i)) {
          // ช่องว่าง (Drop Zone)
          const zone = scene.add
            .zone(x, y, 100, 100)
            .setRectangleDropZone(100, 100);
          const graphics = scene.add.graphics();
          graphics.lineStyle(2, 0x000000, 0.5);
          graphics.strokeRect(x - 50, y - 50, 100, 100);

          // ไอคอน ?
          const qText = scene.add
            .text(x, y, "?", { fontSize: "40px", color: "#555" })
            .setOrigin(0.5);

          zone.setData({ answer: animal, isFilled: false });
          dropZones.push(zone);
          levelObjects.push(zone, graphics, qText);
        } else {
          // โจทย์ที่มีอยู่แล้ว
          const img = scene.add.image(x, y, animal).setDisplaySize(90, 90);
          levelObjects.push(img);
        }
      });

      // 4. สร้างตัวเลือก (Options)
      const options = [...data.options]; // Copy array
      // Phaser.Utils.Array.Shuffle(options); // (ถ้าอยากสุ่มตำแหน่งตัวเลือก ให้เปิดบรรทัดนี้)

      options.forEach((animal, i) => {
        const x = 300 + i * 150;
        const y = 500;

        const base = scene.add.circle(x, y, 60, 0xffffff, 0.5);
        const item = scene.add
          .image(x, y, animal)
          .setDisplaySize(100, 100)
          .setInteractive();
        scene.input.setDraggable(item);

        const baseScale = item.scale;
        item.setData({
          type: animal,
          originX: x,
          originY: y,
          baseScale: baseScale,
        });

        levelObjects.push(base, item);
      });

      // 5. Setup Logic การลาก (เฉพาะด่านนี้)
      setupDragEvents(scene, dropZones);
    }

    function setupDragEvents(scene, dropZones) {
      // ล้าง Event เก่าก่อนเพื่อกันเบิ้ล
      scene.input.off("dragstart");
      scene.input.off("drag");
      scene.input.off("drop");
      scene.input.off("dragend");

      scene.input.on("dragstart", (pointer, gameObject) => {
        scene.children.bringToTop(gameObject);
        const startScale = gameObject.getData("baseScale");
        scene.tweens.add({
          targets: gameObject,
          scale: startScale * 1.2,
          duration: 100,
          ease: "Power2",
        });
      });

      scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
      });

      scene.input.on("drop", (pointer, gameObject, dropZone) => {
        const correctAnswer = dropZone.getData("answer");
        const droppedType = gameObject.getData("type");
        const startScale = gameObject.getData("baseScale");

        if (droppedType === correctAnswer && !dropZone.getData("isFilled")) {
          // ✅ ถูกต้อง
          gameObject.disableInteractive();
          dropZone.setData("isFilled", true);

          scene.tweens.add({
            targets: gameObject,
            x: dropZone.x,
            y: dropZone.y,
            scale: startScale * 0.9,
            duration: 300,
            ease: "Back.out",
            onComplete: () => {
              scene.emitter.explode(20, dropZone.x, dropZone.y);
              try {
                scene.sound.play("correct");
              } catch (e) {}

              // ตรวจสอบว่าครบทุกช่องในด่านย่อยนี้ยัง?
              const isSubLevelComplete = dropZones.every((z) =>
                z.getData("isFilled")
              );
              if (isSubLevelComplete) {
                handleSubLevelComplete(scene);
              }
            },
          });
        } else {
          // ❌ ผิด
          totalAttempts++; // นับรวมความผิดพลาด

          // Reset กลับที่เดิม
          scene.tweens.add({
            targets: gameObject,
            x: gameObject.getData("originX"),
            y: gameObject.getData("originY"),
            scale: startScale,
            duration: 500,
            ease: "Cubic.out",
          });

          gameObject.setTint(0xff5555);
          scene.time.delayedCall(500, () => gameObject.clearTint());
          scene.cameras.main.shake(100, 0.01);
          try {
            scene.sound.play("wrong");
          } catch (e) {}
        }
      });

      scene.input.on("dragend", (pointer, gameObject, dropped) => {
        if (!dropped) {
          const startScale = gameObject.getData("baseScale");
          scene.tweens.add({
            targets: gameObject,
            x: gameObject.getData("originX"),
            y: gameObject.getData("originY"),
            scale: startScale,
            duration: 500,
            ease: "Cubic.out",
          });
        }
      });
    }

    function handleSubLevelComplete(scene) {
      // หน่วงเวลาเล็กน้อยก่อนไปด่านถัดไป
      scene.time.delayedCall(1000, () => {
        if (currentSubLevel < totalSubLevels - 1) {
          // ยังไม่ครบ 3 ด่าน -> ไปด่านต่อไป
          currentSubLevel++;

          // เอฟเฟกต์เปลี่ยนฉาก (Fade out/in)
          scene.cameras.main.fade(300, 0, 0, 0);
          scene.cameras.main.once("camerafadeoutcomplete", () => {
            loadSubLevel(scene, currentSubLevel);
            scene.cameras.main.fadeIn(300);
          });
        } else {
          // ครบ 3 ด่านแล้ว -> จบเกม!
          checkGlobalWin(scene);
        }
      });
    }

    function checkGlobalWin(scene) {
      const duration = Math.floor((Date.now() - startTime) / 1000);

      // ⭐ คำนวณดาว (รวม 3 ด่านย่อย)
      // 3 ดาว: ห้ามผิดเลย (attempts=0) และต้องเร็ว (เช่น < 60 วิ สำหรับ 3 ด่าน)
      // 2 ดาว: ผิดได้ไม่เกิน 2 ครั้ง
      // 1 ดาว: ผ่านก็พอ
      let stars = 1;
      if (totalAttempts === 0 && duration < 60) stars = 3;
      else if (totalAttempts <= 2) stars = 2;

      showWinPopup(scene, stars, duration);
    }

    function showWinPopup(scene, stars, duration) {
      const overlay = scene.add
        .rectangle(450, 300, 900, 600, 0x000000, 0.8)
        .setDepth(20)
        .setAlpha(0);
      scene.tweens.add({ targets: overlay, alpha: 0.8, duration: 300 });

      // สุ่มคำชม
      const phrases = [
        "🎉 สุดยอดไปเลย! 🎉",
        "🧩 นักสืบตัวจริง! 🧩",
        "✨ สมบูรณ์แบบ! ✨",
      ];
      const textStr = Phaser.Utils.Array.GetRandom(phrases);

      const text = scene.add
        .text(450, 250, textStr, {
          fontSize: "64px",
          color: "#ffd700",
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

    new Phaser.Game(config);
  });
})();
