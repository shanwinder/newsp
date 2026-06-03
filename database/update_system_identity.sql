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
    `title` = 'เครื่องรดน้ำอัจฉริยะ (Condition)',
    `description` = 'ฝึกการใช้เงื่อนไข If-Then-Else เพื่อเลือกการทำงานที่เหมาะสมกับสถานการณ์ในเกม',
    `learning_topic` = 'การใช้เงื่อนไข',
    `instruction_html` = '<div class="text-center"><h4>ภารกิจฟาร์มแก้ปัญหา</h4><p>ใช้บล็อกเงื่อนไขเพื่อสร้างระบบรดน้ำอัตโนมัติ</p></div>'
WHERE `id` = 3;

UPDATE `games`
SET
    `title` = 'กู้วิกฤตฟาร์ม (Debugging)',
    `description` = 'ฝึกการตรวจสอบและแก้ไขข้อผิดพลาดในชุดคำสั่ง เพื่อกู้สถานการณ์ให้กลับมาถูกต้อง',
    `learning_topic` = 'การตรวจสอบและแก้ไขข้อผิดพลาด',
    `instruction_html` = '<div class="text-center"><h4>ภารกิจฟาร์มแก้ปัญหา</h4><p>ช่วยกันวิเคราะห์คำสั่งที่ผิดพลาดและปรับแก้ให้ถูกต้อง</p></div>'
WHERE `id` = 4;

UPDATE `titles` SET `title_name` = 'นักวางลำดับขั้นตอน' WHERE `id` = 4;
UPDATE `titles` SET `title_name` = 'นักแก้ไขปัญหา' WHERE `id` = 6;
UPDATE `titles` SET `title_name` = '⭐ Problem Solving Hero ⭐' WHERE `id` = 10;
