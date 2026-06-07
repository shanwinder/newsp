UPDATE `games`
SET
    `title` = 'ตรรกะคัดแยก (Logic)',
    `description` = 'ฝึกการคิดเชิงตรรกะและการจำแนกเงื่อนไข โดยแยกแยะเมล็ดพันธุ์ ปุ๋ย และวัชพืชให้ถูกต้องตามโจทย์',
    `learning_topic` = 'การคิดเชิงตรรกะและการจำแนกเงื่อนไข',
    `instruction_html` = '<div class="text-center"><h4>ภารกิจฟาร์มแก้ปัญหา</h4><p>สังเกตเงื่อนไข แยกแยะข้อมูล และเลือกคำตอบอย่างมีเหตุผล</p></div>'
WHERE `id` = 1;

UPDATE `games`
SET
    `title` = 'เส้นทางเดินรถไถ (Sequence)',
    `description` = 'ฝึกการเรียงลำดับขั้นตอน โดยวางแผนคำสั่งให้รถไถเดินทางไปถึงเป้าหมายอย่างถูกต้อง',
    `learning_topic` = 'การเรียงลำดับขั้นตอน',
    `instruction_html` = '<div class="text-center"><h4>ภารกิจฟาร์มแก้ปัญหา</h4><p>ช่วยกันวางแผนและเรียงบล็อกคำสั่งพารถไถเข้าเป้าหมาย</p></div>'
WHERE `id` = 2;

UPDATE `games`
SET
    `title` = 'บทที่ 3: ผู้จัดการฟาร์มอัจฉริยะ',
    `description` = 'ฝึกใช้เงื่อนไข If / Else / Else If เพื่อคัดแยกผลผลิตจากพืชผัก ผลไม้ และผลผลิตจากสัตว์ ด้วยระบบสายพานฟาร์มอัจฉริยะ',
    `learning_topic` = 'การใช้เงื่อนไข',
    `instruction_html` = '<div class="text-center"><h4>Smart Farm Manager</h4><p>ลากบล็อกเงื่อนไขและคำสั่งเพื่อคัดแยกผลผลิตจากพืชผัก ผลไม้ และผลผลิตจากสัตว์</p></div>'
WHERE `id` = 3;

UPDATE `games`
SET
    `title` = 'บทที่ 4: ตรวจสอบและแก้ไขข้อผิดพลาด',
    `description` = 'ฝึกตรวจสอบกฎที่ผิดพลาด ทดลองรันระบบ สังเกตผลลัพธ์ที่ผิด แล้วแก้ไขเงื่อนไขและคำสั่งให้ระบบฟาร์มทำงานถูกต้อง',
    `learning_topic` = 'การตรวจสอบและแก้ไขข้อผิดพลาด',
    `instruction_html` = '<div class="text-center"><h4>ซ่อมกฎฟาร์มอัจฉริยะ</h4><p>ทดสอบระบบฟาร์ม หาเหตุที่ผิด แล้วซ่อมกฎให้ถูกต้อง</p></div>'
WHERE `id` = 4;

UPDATE `titles` SET `title_name` = 'นักวางลำดับขั้นตอน' WHERE `id` = 4;
UPDATE `titles` SET `title_name` = 'นักแก้ไขปัญหา' WHERE `id` = 6;
UPDATE `titles` SET `title_name` = '⭐ Problem Solving Hero ⭐' WHERE `id` = 10;
