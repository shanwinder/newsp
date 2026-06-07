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
    `title` = 'บทที่ 4: Farm Debug Quest',
    `description` = 'ฝึกกระบวนการ Debugging โดยสังเกตอาการ วิเคราะห์สาเหตุ จับบล็อกที่ผิด แก้ไข และทดสอบระบบฟาร์มอีกครั้ง',
    `learning_topic` = 'การตรวจหาและแก้ไขข้อผิดพลาด',
    `instruction_html` = '<div class="text-center"><h4>Farm Debug Quest</h4><p>ดูอาการ รันทดสอบ หาจุดผิด ซ่อม และลองใหม่ให้ระบบฟาร์มกลับมาถูกต้อง</p></div>'
WHERE `id` = 4;

UPDATE `stages` SET
    `title` = 'แปลงผักหลงทาง',
    `instruction` = 'ฝึกตรวจหาข้อผิดพลาดจากลำดับคำสั่ง คำสั่งทิศทาง และคำสั่งที่หายไป ผ่านภารกิจหุ่นยนต์รดน้ำในแปลงผัก'
WHERE `id` = 10;

UPDATE `stages` SET
    `title` = 'โรงเรือนอัจฉริยะรวน',
    `instruction` = 'ฝึกตรวจหาข้อผิดพลาดจากเงื่อนไข ลำดับเงื่อนไข ตัวเลข และกรณีอื่น ผ่านระบบโรงเรือนอัจฉริยะ'
WHERE `id` = 11;

UPDATE `stages` SET
    `title` = 'เครื่องคัดผลไม้เจอบั๊ก',
    `instruction` = 'ฝึกตรวจหาข้อผิดพลาดจากการทำซ้ำ การคัดแยกผิด และการซ่อมหลายจุด ผ่านเครื่องคัดผลไม้ก่อนส่งตลาด'
WHERE `id` = 12;
