-- =====================================================
-- Migration: standardize_lesson_names.sql
-- ปรับชื่อบทเรียนและหัวข้อความรู้ให้ตรงมาตรฐานกลาง
-- รันหลังจาก deploy code ที่ใช้ config/lessons.php
-- =====================================================

-- บทที่ 1: ลบ "(Logic)" ออก + ปรับ learning_topic
UPDATE `games` SET
    `title` = 'ตรรกะคัดแยก',
    `learning_topic` = 'การใช้เหตุผลเชิงตรรกะ'
WHERE `id` = 1;

-- บทที่ 2: ลบ "(Sequence)" ออก
UPDATE `games` SET
    `title` = 'เส้นทางเดินรถไถ'
WHERE `id` = 2;

-- บทที่ 3: ลบ prefix "บทที่ 3:" + ปรับ learning_topic + instruction_html เป็นไทย
UPDATE `games` SET
    `title` = 'ผู้จัดการฟาร์มอัจฉริยะ',
    `learning_topic` = 'การใช้เงื่อนไข IF / ELSE',
    `instruction_html` = '<div class="text-center"><h4>ผู้จัดการฟาร์มอัจฉริยะ</h4><p>ลากบล็อกเงื่อนไขและคำสั่งเพื่อคัดแยกผลผลิตจากพืชผัก ผลไม้ และผลผลิตจากสัตว์</p></div>'
WHERE `id` = 3;

-- บทที่ 4: เปลี่ยนชื่อเป็น "ซ่อมกฎฟาร์มอัจฉริยะ" (ลบ prefix "บทที่ 4:")
UPDATE `games` SET
    `title` = 'ซ่อมกฎฟาร์มอัจฉริยะ'
WHERE `id` = 4;
