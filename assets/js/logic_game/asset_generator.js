// assets/js/logic_game/asset_generator.js

/**
 * ฟังก์ชันสำหรับสร้าง Texture (รูปภาพ) ขึ้นมาใช้เองโดยไม่ต้องโหลดไฟล์
 * ใช้สำหรับเกมหุ่นยนต์ (Chapter 2)
 */
function generateRobotAssets(scene) {
  console.log("🎨 Generating Robot Assets...");

  // 1. พื้น (Floor Tile) - สี่เหลี่ยมสีเทาอ่อน มีขอบ
  if (!scene.textures.exists("floor")) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xecf0f1, 1); // สีพื้น
    g.fillRect(0, 0, 64, 64);
    g.lineStyle(2, 0xbdc3c7, 1); // สีขอบ
    g.strokeRect(0, 0, 64, 64);
    g.generateTexture("floor", 64, 64);
  }

  // 2. กำแพง (Wall) - สีเข้ม ดูแข็งแรง
  if (!scene.textures.exists("wall")) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x34495e, 1);
    g.fillRect(0, 0, 64, 64);
    // ลวดลายอิฐ
    g.lineStyle(2, 0x2c3e50, 1);
    g.strokeRect(0, 0, 64, 64);
    g.beginPath();
    g.moveTo(0, 32);
    g.lineTo(64, 32); // เส้นกลาง
    g.moveTo(32, 0);
    g.lineTo(32, 32); // เส้นตั้งบน
    g.moveTo(32, 32);
    g.lineTo(32, 64); // เส้นตั้งล่าง (ขยับได้ถ้าอยากให้สลับหว่าง)
    g.strokePath();
    g.generateTexture("wall", 64, 64);
  }

  // 3. หุ่นยนต์ (Robot) - ตัวเหลี่ยม มีลูกศรบอกทิศ
  if (!scene.textures.exists("robot")) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    // ตัวหุ่น
    g.fillStyle(0x3498db, 1); // สีฟ้า
    g.fillRoundedRect(4, 4, 56, 56, 10);
    // หน้าจอ/ตา
    g.fillStyle(0x2c3e50, 1);
    g.fillRect(14, 15, 36, 20);
    // ลูกศรบอกทิศ (สีเหลือง)
    g.fillStyle(0xf1c40f, 1);
    g.beginPath();
    g.moveTo(32, 40); // บน
    g.lineTo(42, 55); // ขวาล่าง
    g.lineTo(22, 55); // ซ้ายล่าง
    g.closePath();
    g.fillPath();
    g.generateTexture("robot", 64, 64);
  }

  // 4. แบตเตอรี่ (Goal) - สีเขียว มีขั้วบวก
  if (!scene.textures.exists("battery")) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    // ตัวถัง
    g.fillStyle(0x2ecc71, 1); // สีเขียว
    g.fillRect(16, 20, 32, 40);
    // ขั้ว
    g.fillStyle(0x7f8c8d, 1); // สีเทา
    g.fillRect(24, 12, 16, 8);
    // สัญลักษณ์สายฟ้า
    g.fillStyle(0xf1c40f, 1);
    g.beginPath();
    g.moveTo(36, 28);
    g.lineTo(24, 40);
    g.lineTo(32, 40);
    g.lineTo(28, 52);
    g.lineTo(40, 40);
    g.lineTo(32, 40);
    g.closePath();
    g.fillPath();
    g.generateTexture("battery", 64, 64);
  }

  // 5. กุญแจ (Key) - สีทอง
  if (!scene.textures.exists("key")) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.lineStyle(4, 0xf1c40f, 1);
    g.strokeCircle(32, 20, 10); // หัวกุญแจ
    g.beginPath();
    g.moveTo(32, 30);
    g.lineTo(32, 55); // ก้าน
    g.moveTo(32, 45);
    g.lineTo(42, 45); // ฟันกุญแจ
    g.strokePath();
    g.generateTexture("key", 64, 64);
  }

  // 6. ประตู (Door) - สีน้ำตาล/ส้ม
  if (!scene.textures.exists("door")) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xe67e22, 1);
    g.fillRect(10, 10, 44, 54);
    g.fillStyle(0xd35400, 1); // ขอบ
    g.lineStyle(4, 0xd35400, 1);
    g.strokeRect(10, 10, 44, 54);
    // ลูกบิด
    g.fillStyle(0xf1c40f, 1);
    g.fillCircle(45, 35, 4);
    g.generateTexture("door", 64, 64);
  }

  // 7. ปุ่มคำสั่ง (UI Buttons)
  const commands = [
    {
      key: "cmd_forward",
      color: 0x3498db,
      icon: (g) => {
        // ลูกศรขึ้น
        g.beginPath();
        g.moveTo(32, 15);
        g.lineTo(15, 35);
        g.lineTo(25, 35);
        g.lineTo(25, 55);
        g.lineTo(39, 55);
        g.lineTo(39, 35);
        g.lineTo(49, 35);
        g.closePath();
        g.fill();
      },
    },
    {
      key: "cmd_left",
      color: 0x9b59b6,
      icon: (g) => {
        // ลูกศรเลี้ยวซ้าย
        g.beginPath();
        g.moveTo(45, 50);
        g.lineTo(45, 25);
        g.lineTo(25, 25);
        g.lineTo(25, 15);
        g.lineTo(10, 32);
        g.lineTo(25, 50);
        g.lineTo(25, 40);
        g.lineTo(35, 40);
        g.lineTo(35, 50);
        g.closePath();
        g.fill();
      },
    },
    {
      key: "cmd_right",
      color: 0x9b59b6,
      icon: (g) => {
        // ลูกศรเลี้ยวขวา
        g.beginPath();
        g.moveTo(19, 50);
        g.lineTo(19, 25);
        g.lineTo(39, 25);
        g.lineTo(39, 15);
        g.lineTo(54, 32);
        g.lineTo(39, 50);
        g.lineTo(39, 40);
        g.lineTo(29, 40);
        g.lineTo(29, 50);
        g.closePath();
        g.fill();
      },
    },
    {
      key: "cmd_action",
      color: 0xe74c3c,
      icon: (g) => {
        // รูปมือ
        g.fillCircle(32, 32, 15);
      },
    },
  ];

  commands.forEach((cmd) => {
    if (!scene.textures.exists(cmd.key)) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      // พื้นหลังปุ่ม
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(0, 0, 64, 64, 10);
      g.lineStyle(4, cmd.color, 1);
      g.strokeRoundedRect(0, 0, 64, 64, 10);

      // ไอคอน
      g.fillStyle(cmd.color, 1);
      cmd.icon(g);

      g.generateTexture(cmd.key, 64, 64);
    }
  });

  console.log("✅ Assets Generated Successfully!");
}
