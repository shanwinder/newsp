// assets/js/logic_game/stage2.js
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const STAGE_ID = window.STAGE_ID || 2;

    const config = {
      type: Phaser.AUTO,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.NO_CENTER,
        width: 900,
        height: 600,
      },
      parent: "game-container",
      backgroundColor: "#FFF8E1",
      scene: {
        preload: preload,
        create: create,
      },
    };

    let startTime;
    let attempts = 0;

    function preload() {
      this.load.setBaseURL("../");

      // โหลดรูปภาพ
      this.load.image("sq_red", "assets/img/red_square.webp");
      this.load.image("ci_green", "assets/img/green_circle.webp");
      this.load.image("tri_blue", "assets/img/blue_triangle.webp");
      this.load.image("sq_yellow", "assets/img/yellow_square.webp");

      // โหลดเสียง
      this.load.audio("correct", "assets/sound/correct.mp3");
      this.load.audio("wrong", "assets/sound/wrong.mp3");
    }

    function create() {
      const scene = this;
      startTime = Date.now();
      attempts = 0;

      // --- 0. เตรียม Texture พลุรูปทรงเรขาคณิต (Geometric Particles) ---
      createShapeTexture(scene, "part_circle", "circle");
      createShapeTexture(scene, "part_square", "square");
      createShapeTexture(scene, "part_triangle", "triangle");

      // 🎨 Config สีสันสดใส (Vibrant Palette)
      const vibrantColors = [
        0xff3333, // แดงสด
        0x33ff33, // เขียวสด
        0x3333ff, // น้ำเงินสด
        0xffff33, // เหลืองสด
        0xff33ff, // ชมพูสด
        0x33ffff, // ฟ้าสด
      ];

      const particleConfig = {
        speed: { min: 150, max: 500 }, // เร็วขึ้นและกระจายตัวกว้างขึ้น
        angle: { min: 0, max: 360 },
        scale: { start: 0.8, end: 0 }, // เริ่มใหญ่แล้วหดเล็กลง
        alpha: { start: 1, end: 0 },
        tint: vibrantColors, // ใช้สีหลากหลาย
        blendMode: "NORMAL", // ใช้ Normal เพื่อให้เห็นสีชัดเจน (ADD จะขาวเกินไปในฉากสว่าง)
        lifespan: 1200, // อยู่นานขึ้นนิดนึง (1.2 วินาที)
        gravityY: 200, // แรงดึงดูด
        emitting: false,
      };

      // สร้าง Emitter 3 ตัวสำหรับ 3 รูปทรง และ setDepth(100) ให้บังทุกอย่าง
      const emitter1 = scene.add
        .particles(0, 0, "part_circle", particleConfig)
        .setDepth(100);
      const emitter2 = scene.add
        .particles(0, 0, "part_square", particleConfig)
        .setDepth(100);
      const emitter3 = scene.add
        .particles(0, 0, "part_triangle", particleConfig)
        .setDepth(100);

      function explodeParticles(x, y) {
        // ระเบิดออกมาพร้อมกันทั้ง 3 รูปทรง จำนวนเยอะๆ
        emitter1.explode(20, x, y);
        emitter2.explode(20, x, y);
        emitter3.explode(20, x, y);
      }

      // --- 1. UI โจทย์ ---
      scene.add
        .text(450, 60, "โจทย์: เติมรูปทรงให้สมบูรณ์ 🟥🟢🔵", {
          fontSize: "36px",
          color: "#555",
          fontFamily: "Kanit",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      const bg = scene.add.graphics();
      bg.fillStyle(0xffffff, 0.9);
      bg.fillRoundedRect(50, 130, 800, 160, 20);
      bg.lineStyle(4, 0xffb74d, 1);
      bg.strokeRoundedRect(50, 130, 800, 160, 20);

      // --- 2. สร้างโจทย์ ---
      const sequence = [
        "sq_red",
        "ci_green",
        "tri_blue",
        "sq_red",
        "ci_green",
        "tri_blue",
      ];
      const missingIndices = [2, 4];
      const dropZones = [];
      let startX = 150;

      sequence.forEach((shapeKey, i) => {
        const x = startX + i * 120;
        const y = 210;

        if (missingIndices.includes(i)) {
          const zone = scene.add
            .zone(x, y, 100, 100)
            .setRectangleDropZone(100, 100);
          const graphics = scene.add.graphics();
          graphics.lineStyle(2, 0x94a3b8, 1);
          graphics.strokeRect(x - 50, y - 50, 100, 100);

          scene.add
            .text(x, y, "?", {
              fontSize: "40px",
              color: "#cbd5e1",
              fontFamily: "Kanit",
            })
            .setOrigin(0.5);

          zone.setData({ answer: shapeKey, isFilled: false });
          dropZones.push(zone);
        } else {
          scene.add.image(x, y, shapeKey).setDisplaySize(90, 90);
        }
      });

      // --- 3. ตัวเลือก ---
      const options = ["tri_blue", "ci_green", "sq_yellow", "sq_red"];
      Phaser.Utils.Array.Shuffle(options);

      options.forEach((shapeKey, i) => {
        const spacing = 140;
        const totalWidth = (options.length - 1) * spacing;
        const startOptionX = 450 - totalWidth / 2;

        const x = startOptionX + i * spacing;
        const y = 480;

        scene.add.circle(x, y, 60, 0xffffff, 0.8).setStrokeStyle(2, 0xe2e8f0);

        const item = scene.add
          .image(x, y, shapeKey)
          .setDisplaySize(100, 100)
          .setInteractive();
        scene.input.setDraggable(item);

        const baseScale = item.scale;
        item.setData({
          type: shapeKey,
          originX: x,
          originY: y,
          baseScale: baseScale,
        });
      });

      // --- 4. Logic การลาก ---
      scene.input.on("dragstart", (pointer, gameObject) => {
        scene.children.bringToTop(gameObject);
        const startScale = gameObject.getData("baseScale");
        scene.tweens.add({
          targets: gameObject,
          scale: startScale * 1.2,
          duration: 150,
          ease: "Back.out",
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
          // ✅ Correct
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
              explodeParticles(dropZone.x, dropZone.y);
              playSound("correct");
              checkWin();
            },
          });
        } else {
          // ❌ Wrong
          returnToOrigin(gameObject);
          wrongEffect(gameObject);
        }
      });

      scene.input.on("dragend", (pointer, gameObject, dropped) => {
        if (!dropped) {
          returnToOrigin(gameObject);
        }
      });

      function returnToOrigin(gameObject) {
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

      function wrongEffect(gameObject) {
        attempts++;
        playSound("wrong");
        scene.cameras.main.shake(100, 0.005);
        gameObject.setTint(0xff9999);
        scene.time.delayedCall(500, () => gameObject.clearTint());
      }

      function playSound(key) {
        try {
          scene.sound.play(key, { volume: 0.5 });
        } catch (e) {}
      }

      // --- 5. Win System ---
      function checkWin() {
        const isAllFilled = dropZones.every((zone) => zone.getData("isFilled"));

        if (isAllFilled) {
          const duration = Math.floor((Date.now() - startTime) / 1000);
          let stars = 1;
          if (attempts === 0 && duration < 40) stars = 3;
          else if (attempts <= 2) stars = 2;

          scene.time.delayedCall(1000, () => {
            showWinPopup(stars, duration);
          });
        }
      }

      function showWinPopup(stars, duration) {
        // พื้นหลังดำโปร่งแสง (ใช้สีดำสนิท 0.8 เพื่อตัดกับ Popup สีขาว)
        const overlay = scene.add
          .rectangle(450, 300, 900, 600, 0x000000, 0.8)
          .setDepth(20)
          .setAlpha(0);
        scene.tweens.add({ targets: overlay, alpha: 0.8, duration: 300 });

        // คำชม (Random Praise)
        const phrases = [
          "🎉 ยอดเยี่ยม! 🎉",
          "🌟 สุดยอด! 🌟",
          "✨ เก่งมาก! ✨",
          "🚀 เยี่ยมยอด! 🚀",
          "🏆 ไร้ที่ติ! 🏆",
        ];
        const randomPhrase = Phaser.Utils.Array.GetRandom(phrases);

        // ข้อความหลัก (Main Text)
        // ใช้ Scale Effect เด้งดึ๋งเหมือนด่าน 1
        const text = scene.add
          .text(450, 250, randomPhrase, {
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

        // ดาว (Stars)
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

        // ส่งคะแนน
        scene.time.delayedCall(2000, () => {
          window.location.href = `waiting_room.php?stage_id=${STAGE_ID}`;
        });

        if (typeof window.sendResult === "function") {
          window.sendResult(STAGE_ID, stars, duration, attempts);
        }
      }

      // Helper: วาดรูปทรง
      function createShapeTexture(scene, key, type) {
        if (scene.textures.exists(key)) return;
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff, 1);

        if (type === "circle") {
          g.fillCircle(16, 16, 14);
        } else if (type === "square") {
          g.fillRect(4, 4, 24, 24); // ปรับขนาดให้สมดุล
        } else if (type === "triangle") {
          g.beginPath();
          g.moveTo(16, 4);
          g.lineTo(28, 28);
          g.lineTo(4, 28);
          g.closePath();
          g.fillPath();
        }
        g.generateTexture(key, 32, 32);
      }
    } // End Create

    new Phaser.Game(config);
  });
})();
