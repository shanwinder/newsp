UPDATE `stages` SET
    `title` = 'หลบหลีกกองฟาง',
    `instruction` = 'เขียนคำสั่งให้รถไถเดินและเลี้ยวหลบกองฟางหรือก้อนหินไปให้ถึงเป้าหมาย'
WHERE `id` = 5;

UPDATE `stages` SET
    `title` = 'เก็บเกี่ยวผลผลิต',
    `instruction` = 'วางแผนเส้นทางให้รถไถเก็บผลผลิตครบทุกจุด แล้วกลับถึงโรงนา'
WHERE `id` = 6;

UPDATE `stages` SET
    `title` = 'โรงคัดผักสวนครัว',
    `instruction` = 'เกมที่ 1 ฝึกใช้ If เพื่อจับเงื่อนไขพิเศษของผลผลิตจากพืชผัก'
WHERE `id` = 7;

UPDATE `stages` SET
    `title` = 'โรงคัดผลไม้แสนอร่อย',
    `instruction` = 'เกมที่ 2 ฝึกใช้ If / Else เพื่อแยกผลไม้เป็น 2 เส้นทาง'
WHERE `id` = 8;

UPDATE `stages` SET
    `title` = 'โรงคัดผลผลิตจากฟาร์มสัตว์',
    `instruction` = 'เกมที่ 3 ฝึกใช้ If / Else If / Else เพื่อคัดเกรดผลผลิตหลายระดับ'
WHERE `id` = 9;

UPDATE `games` SET
    `title` = 'บทที่ 4: ช่างซ่อมระบบฟาร์มอัจฉริยะ',
    `description` = 'ฝึกกระบวนการ Debugging โดยสังเกตอาการ วิเคราะห์สาเหตุ จับบล็อกที่ผิด แก้ไข และทดสอบระบบฟาร์มอีกครั้ง',
    `learning_topic` = 'การตรวจหาและแก้ไขข้อผิดพลาด',
    `instruction_html` = '<div class="text-center"><h4>Smart Farm Debugger</h4><p>สังเกตอาการ จับบั๊ก ซ่อมกฎ และทดสอบระบบฟาร์มให้กลับมาถูกต้อง</p></div>'
WHERE `id` = 4;

UPDATE `stages` SET
    `title` = 'บั๊กจิ๋วในโรงคัดแยก',
    `instruction` = 'สังเกตอาการก่อนแก้ แล้วจับบั๊กคำสั่ง เงื่อนไข และเงื่อนไขกว้างเกินไป'
WHERE `id` = 10;

UPDATE `stages` SET
    `title` = 'โรงเรือนรวน ลำดับเพี้ยน',
    `instruction` = 'ตรวจลำดับเงื่อนไข ค่าตัวเลข และ Else ที่ตกหล่นก่อนทดสอบระบบใหม่'
WHERE `id` = 11;

UPDATE `stages` SET
    `title` = 'ศูนย์ควบคุมฟาร์มฉุกเฉิน',
    `instruction` = 'วิเคราะห์หลายอาการ แยกสาเหตุ และซ่อมหลายระบบด้วยกระบวนการ Debugging'
WHERE `id` = 12;
