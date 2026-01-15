(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Stage 3: Logic Sorter Loading...");

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
      backgroundColor: "#F3E5F5", // สีม่วงอ่อน (Theme Logic/Wisdom)
      scene: {
        preload: preload,
        create: create,
      },
    };

    // ตัวแปร Global
    let startTime;
    let totalAttempts = 0;
    let currentSubLevel = 0;
    const totalSubLevels = 3;
    let levelObjects = [];

    function preload() {
      this.load.setBaseURL("../");

      // ใช้ Assets เดิมที่มีอยู่ (คุ้มค่ามาก!)
      this.load.image("sq_red", "assets/img/red_square.webp");
      this.load.image("sq_yellow", "assets/img/yellow_square.webp");
      this.load.image("ci_green", "assets/img/green_circle.webp");
      this.load.image("tri_blue", "assets/img/blue_triangle.webp");
      this.load.image("dog", "assets/img/dog.webp");
      this.load.image("cat", "assets/img/cat.webp");
      this.load.image("rabbit", "assets/img/rabbit.webp");

      this.load.audio("correct", "assets/sound/correct.mp3");
      this.load.audio("wrong", "assets/sound/wrong.mp3");
    }

    function create() {
      const scene = this;
      startTime = Date.now();
      totalAttempts = 0;
      currentSubLevel = 0;
      levelObjects = [];

      // --- 0. Effect Particle ---
      createStarTexture(scene);
      scene.emitter = scene.add
        .particles(0, 0, "star", {
          speed: { min: 200, max: 400 },
          scale: { start: 0.6, end: 0 },
          blendMode: "ADD",
          lifespan: 800,
          gravityY: 200,
          tint: [0x9c27b0, 0xe040fb, 0x7b1fa2], // ธีมสีม่วง
          emitting: false,
        })
        .setDepth(100);

      // --- 1. ข้อมูลด่านย่อย (Logic Rules) ---
      // เราจะกำหนดกฎ (Validator) เป็นฟังก์ชัน เพื่อความยืดหยุ่นของตรรกะ
      scene.levelData = [
        {
          // Sub-Level 1: แยกรูปร่าง (Shape Classification)
          title: "ภารกิจ 1: แยกรูปร่าง",
          desc: "แยก 'สี่เหลี่ยม' และ 'วงกลม' ออกจากกัน",
          bins: [
            {
              label: "สี่เหลี่ยม ⬛",
              color: 0x5c6bc0,
              validator: (type) => type.includes("sq_"),
            },
            {
              label: "วงกลม ⚫",
              color: 0xec407a,
              validator: (type) => type.includes("ci_"),
            },
          ],
          items: ["sq_red", "ci_green", "sq_yellow", "ci_green", "sq_red"],
        },
        {
          // Sub-Level 2: สิ่งมีชีวิต vs ไม่มีชีวิต (Semantic Logic)
          title: "ภารกิจ 2: สิ่งมีชีวิต",
          desc: "แยก 'สัตว์' และ 'สิ่งของ' ออกจากกัน",
          bins: [
            {
              label: "สัตว์ 🐶",
              color: 0x66bb6a,
              validator: (type) => ["dog", "cat", "rabbit"].includes(type),
            },
            {
              label: "สิ่งของ 📦",
              color: 0x78909c,
              validator: (type) =>
                ["sq_red", "ci_green", "tri_blue"].includes(type),
            },
          ],
          items: ["dog", "sq_red", "rabbit", "tri_blue", "cat"],
        },
        {
          // Sub-Level 3: ตรรกะเชิงปฏิเสธ (NOT Logic)
          title: "ภารกิจ 3: ไม่ใช่สีแดง",
          desc: "กล่องหนึ่งรับสีแดง อีกกล่องรับ 'ที่ไม่ใช่' สีแดง",
          bins: [
            {
              label: "สีแดง 🔴",
              color: 0xef5350,
              validator: (type) => type.includes("red"),
            },
            {
              label: "ไม่ใช่สีแดง ❌🔴",
              color: 0x424242,
              validator: (type) => !type.includes("red"),
            }, // NOT Logic
          ],
          items: ["sq_red", "ci_green", "sq_red", "tri_blue", "sq_yellow"],
        },
      ];

      loadSubLevel(scene, 0);
    }

    // --- Core Logic ---

    function loadSubLevel(scene, index) {
      // Clear Old Objects
      levelObjects.forEach((obj) => obj.destroy());
      levelObjects = [];

      const data = scene.levelData[index];

      // 1. UI Text
      const title = scene.add
        .text(450, 40, data.title, {
          fontSize: "36px",
          color: "#4A148C",
          fontFamily: "Kanit",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setPadding({ top: 5, bottom: 5 });

      const desc = scene.add
        .text(450, 90, data.desc, {
          fontSize: "22px",
          color: "#6A1B9A",
          fontFamily: "Kanit",
        })
        .setOrigin(0.5)
        .setPadding({ top: 5, bottom: 5 });

      levelObjects.push(title, desc);

      // 2. สร้างกล่องรับของ (Bins)
      const dropZones = [];
      const binCount = data.bins.length;
      const binWidth = 250;
      const binHeight = 180;
      const spacing = 50;
      const startX =
        450 -
        (binCount * binWidth + (binCount - 1) * spacing) / 2 +
        binWidth / 2;

      data.bins.forEach((binData, i) => {
        const x = startX + i * (binWidth + spacing);
        const y = 250;

        // วาดกราฟิกกล่อง (เปิดฝา)
        const graphics = scene.add.graphics();
        graphics.lineStyle(4, binData.color, 1);
        graphics.fillStyle(binData.color, 0.1);

        // วาดกล่องแบบ U shape
        graphics.strokeRoundedRect(
          x - binWidth / 2,
          y - binHeight / 2,
          binWidth,
          binHeight,
          15
        );
        graphics.fillRoundedRect(
          x - binWidth / 2,
          y - binHeight / 2,
          binWidth,
          binHeight,
          15
        );

        // ป้ายชื่อกล่อง
        const label = scene.add
          .text(x, y + 110, binData.label, {
            fontSize: "24px",
            color: "#333",
            fontFamily: "Kanit",
            fontStyle: "bold",
          })
          .setOrigin(0.5)
          .setPadding({ top: 5, bottom: 5 });

        // Drop Zone (ที่มองไม่เห็น)
        const zone = scene.add
          .zone(x, y, binWidth, binHeight)
          .setRectangleDropZone(binWidth, binHeight);
        zone.setData({ validator: binData.validator }); // ฝากฟังก์ชันตรวจสอบไว้ที่โซนเลย

        dropZones.push(zone);
        levelObjects.push(graphics, label, zone);
      });

      // 3. สร้างของที่จะลาก (Items)
      const items = [...data.items];
      Phaser.Utils.Array.Shuffle(items); // สลับลำดับ

      // จัดเรียงของไว้ด้านล่าง
      const itemSpacing = 110;
      const itemStartX = 450 - ((items.length - 1) * itemSpacing) / 2;

      items.forEach((itemKey, i) => {
        const x = itemStartX + i * itemSpacing;
        const y = 500;

        // ฐานวาง
        const base = scene.add.circle(x, y, 45, 0xffffff, 0.5);

        // ตัว Item
        const item = scene.add
          .image(x, y, itemKey)
          .setDisplaySize(80, 80)
          .setInteractive();
        scene.input.setDraggable(item);

        // เก็บค่าเริ่มต้น
        item.setData({
          type: itemKey,
          originX: x,
          originY: y,
          baseScale: item.scale,
          isCorrect: false, // สถานะว่าวางถูกหรือยัง
        });

        levelObjects.push(base, item);
      });

      // Setup Logic
      setupInteractions(scene, dropZones, items.length);
    }

    function setupInteractions(scene, dropZones, totalItems) {
      let correctCount = 0; // นับจำนวนที่วางถูกในด่านนี้

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
        });
      });

      scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
      });

      scene.input.on("drop", (pointer, gameObject, dropZone) => {
        const itemType = gameObject.getData("type");
        const validator = dropZone.getData("validator"); // ดึงฟังก์ชันตรวจสอบออกมา
        const startScale = gameObject.getData("baseScale");

        // เรียกใช้ฟังก์ชัน Validator เพื่อเช็คเงื่อนไข
        if (validator(itemType)) {
          // ✅ ถูกต้องตามตรรกะ
          gameObject.disableInteractive();

          // จัดวางของในกล่องให้สวยงาม (สุ่มตำแหน่งนิดหน่อยในกล่อง)
          const randomX = Phaser.Math.Between(dropZone.x - 60, dropZone.x + 60);
          const randomY = Phaser.Math.Between(dropZone.y - 40, dropZone.y + 40);

          scene.tweens.add({
            targets: gameObject,
            x: randomX,
            y: randomY,
            scale: startScale * 0.8,
            duration: 300,
            ease: "Back.out",
            onComplete: () => {
              if (scene.emitter) scene.emitter.explode(10, randomX, randomY);
              playSound(scene, "correct");

              correctCount++;
              // เช็คว่าวางครบทุกชิ้นยัง
              if (correctCount >= totalItems) {
                handleSubLevelComplete(scene);
              }
            },
          });
        } else {
          // ❌ ผิดเงื่อนไข
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
      // ให้เวลาเยอะหน่อยเพราะต้องคิดวิเคราะห์
      if (totalAttempts === 0 && duration < 80) stars = 3;
      else if (totalAttempts <= 3) stars = 2;

      showWinPopup(scene, stars, duration);
    }

    // --- Visual & Helpers ---

    function showWinPopup(scene, stars, duration) {
      const overlay = scene.add
        .rectangle(450, 300, 900, 600, 0x000000, 0.8)
        .setDepth(20)
        .setAlpha(0);
      scene.tweens.add({ targets: overlay, alpha: 0.8, duration: 300 });

      const phrases = [
        "🧠 ตรรกะดีมาก! 🧠",
        "✨ คิดเป็นระบบ! ✨",
        "🚀 อัจฉริยะ! 🚀",
      ];
      const randomPhrase = Phaser.Utils.Array.GetRandom(phrases);

      const text = scene.add
        .text(450, 250, randomPhrase, {
          fontSize: "64px",
          color: "#BA68C8",
          fontFamily: "Kanit",
          stroke: "#fff",
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setDepth(22)
        .setScale(0)
        .setPadding({ top: 10, bottom: 10 });

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
      const startScale = gameObject.getData("baseScale");
      scene.tweens.add({
        targets: gameObject,
        x: gameObject.getData("originX"),
        y: gameObject.getData("originY"),
        scale: startScale,
        duration: 400,
        ease: "Cubic.out",
      });
    }

    function wrongEffect(scene, gameObject) {
      playSound(scene, "wrong");
      scene.cameras.main.shake(100, 0.005);
      gameObject.setTint(0xff9999);
      scene.time.delayedCall(500, () => gameObject.clearTint());
    }

    function playSound(scene, key) {
      try {
        scene.sound.play(key, { volume: 0.5 });
      } catch (e) {}
    }

    function createStarTexture(scene) {
      if (scene.textures.exists("star")) return;
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

    new Phaser.Game(config);
  });
})();
