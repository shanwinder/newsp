(function () {
    const logicTypes = {
        if: {
            id: 'if',
            label: 'เกม If',
            title: 'โรงคัดผักสวนครัว',
            caption: 'เหมาะกับมือใหม่ ตรวจกรณีพิเศษ 1 เงื่อนไข',
            theme: 'vegetables',
            themeLabel: 'วัตถุเกม If',
            minItems: 4,
            minNonMatchingItems: 2,
            minDecoys: 1,
            minMatchesPerCondition: 1,
            requiresElse: false,
            mode: 'single_action_if',
            defaultBehavior: { type: 'pass_through', label: 'ปล่อยผ่านอัตโนมัติ' },
            ruleSlots: [{ type: 'if' }]
        },
        if_else: {
            id: 'if_else',
            label: 'เกม If / Else',
            title: 'โรงคัดผลไม้แสนอร่อย',
            caption: 'แยกวัตถุเป็น 2 กลุ่ม เข้าเงื่อนไขและกลุ่มที่เหลือ',
            theme: 'fruits',
            themeLabel: 'วัตถุเกม If / Else',
            minItems: 6,
            minDecoys: 3,
            minMatchesPerCondition: 2,
            requiresElse: true,
            ruleSlots: [{ type: 'if' }, { type: 'else', condition: 'else' }]
        },
        if_else_if_else: {
            id: 'if_else_if_else',
            label: 'เกม If / Else If / Else',
            title: 'โรงคัดผลผลิตจากฟาร์มสัตว์',
            caption: 'คัดหลายระดับ อ่านกฎจากบนลงล่าง',
            theme: 'animal_products',
            themeLabel: 'วัตถุเกม If / Else If / Else',
            minItems: 9,
            minDecoys: 3,
            minMatchesPerCondition: 2,
            requiresElse: true,
            ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else', condition: 'else' }]
        }
    };

    const actionsByTheme = {
        vegetables: [
            action('wash', 'ส่งเข้าเครื่องล้าง', 'เครื่องล้าง', '🚿'),
            action('pest_table', 'ส่งไปโต๊ะตรวจศัตรูพืช', 'โต๊ะตรวจ', '🔎'),
            action('special_sort', 'ส่งไปคัดแยกพิเศษ', 'คัดแยกพิเศษ', '⚠️'),
            action('pass_through', 'ปล่อยผ่านอัตโนมัติ', 'ปล่อยผ่าน', '➡️')
        ],
        fruits: [
            action('premium_box', 'ส่งเข้ากล่องพรีเมียม', 'กล่องพรีเมียม', '🎁'),
            action('juice_box', 'ส่งไปกล่องแปรรูปน้ำส้ม', 'กล่องแปรรูปน้ำส้ม', '🧃'),
            action('storefront', 'ส่งไปขายหน้าร้าน', 'หน้าร้าน', '🏪'),
            action('ripening_room', 'ส่งไปห้องบ่มต่อ', 'ห้องบ่ม', '📦'),
            action('grade_a_sticker', 'ติดสติ๊กเกอร์เกรด A', 'สติ๊กเกอร์เกรด A', '⭐'),
            action('process_juice', 'ส่งไปแปรรูป', 'เครื่องแปรรูป', '🧃')
        ],
        animal_products: [
            action('premium_egg_tray', 'ส่งเข้าถาดไข่พรีเมียม', 'ถาดไข่พรีเมียม', '⭐'),
            action('standard_egg_tray', 'ส่งเข้าถาดไข่มาตรฐาน', 'ถาดไข่มาตรฐาน', '🥚'),
            action('premium_wool_roll', 'ส่งไปม้วนไหมพรมพรีเมียม', 'ไหมพรมพรีเมียม', '🧶'),
            action('wool_cleaning_machine', 'ส่งเข้าเครื่องทำความสะอาดขน', 'เครื่องทำความสะอาดขน', '🧼'),
            action('wool_recycle_bin', 'ส่งเข้าถังรีไซเคิลขนแกะ', 'ถังรีไซเคิลขนแกะ', '♻️'),
            action('milk_bottling', 'ส่งไปบรรจุขวดพร้อมส่ง', 'บรรจุขวดพร้อมส่ง', '🥛'),
            action('cool_room', 'ส่งเข้าห้องเย็น', 'ห้องเย็น', '❄️'),
            action('reject_bin', 'ส่งไปถังคัดทิ้ง', 'ถังคัดทิ้ง', '🗑️')
        ]
    };

    const catalog = [
        item('carrot_muddy', 'vegetables', 'แครอทเปื้อนโคลน', '🥕', { type: 'carrot', muddy: true, color: 'orange', mark: 'mud' }, ['ชนิด: แครอท', 'คราบโคลน: มี'], 'muddy_carrot', 'แครอทเปื้อนโคลน', { type: 'carrot', muddy: true }, 'wash'),
        item('carrot_clean', 'vegetables', 'แครอทสะอาด', '🥕', { type: 'carrot', muddy: false, color: 'orange', mark: 'none' }, ['ชนิด: แครอท', 'คราบโคลน: ไม่มี'], 'clean_carrot', 'แครอทสะอาด', { type: 'carrot', muddy: false }, 'pass_through'),
        item('carrot_dark', 'vegetables', 'แครอทสีเข้ม', '🥕', { type: 'carrot', muddy: false, color: 'dark_orange', mark: 'none' }, ['ชนิด: แครอท', 'สี: เข้ม', 'คราบโคลน: ไม่มี'], 'dark_carrot', 'แครอทสีเข้ม', { type: 'carrot', color: 'dark_orange' }, 'pass_through', true),
        item('carrot_dust_tip', 'vegetables', 'แครอทมีดินติดปลาย', '🥕', { type: 'carrot', muddy: false, color: 'orange', mark: 'dust_tip' }, ['ชนิด: แครอท', 'ดินติดปลาย: เล็กน้อย'], 'carrot_dust_tip', 'แครอทมีดินติดปลาย', { type: 'carrot', mark: 'dust_tip' }, 'pass_through', true),
        item('carrot_shadow', 'vegetables', 'แครอทมีเงาสีน้ำตาล', '🥕', { type: 'carrot', muddy: false, color: 'orange', mark: 'shadow' }, ['ชนิด: แครอท', 'รอยที่เห็น: เงาจากแสง'], 'carrot_shadow', 'แครอทมีเงาสีน้ำตาล', { type: 'carrot', mark: 'shadow' }, 'pass_through', true),
        item('lettuce_worm', 'vegetables', 'ผักกาดมีหนอน', '🐛', { type: 'lettuce', hasWorm: true, dirt: false, holes: true }, ['ชนิด: ผักกาด', 'หนอน: พบ'], 'lettuce_has_worm', 'ผักกาดมีหนอน', { type: 'lettuce', hasWorm: true }, 'pest_table'),
        item('lettuce_normal', 'vegetables', 'ผักกาดปกติ', '🥬', { type: 'lettuce', hasWorm: false, dirt: false, holes: false }, ['ชนิด: ผักกาด', 'หนอน: ไม่พบ'], 'normal_lettuce', 'ผักกาดปกติ', { type: 'lettuce', hasWorm: false }, 'pass_through'),
        item('lettuce_dirt', 'vegetables', 'ผักกาดมีจุดดิน', '🥬', { type: 'lettuce', hasWorm: false, dirt: true, holes: false }, ['ชนิด: ผักกาด', 'จุดดิน: มี', 'หนอน: ไม่พบ'], 'lettuce_has_dirt', 'ผักกาดมีจุดดิน', { type: 'lettuce', dirt: true }, 'pass_through', true),
        item('lettuce_holes', 'vegetables', 'ผักกาดมีรูเล็ก ๆ', '🥬', { type: 'lettuce', hasWorm: false, dirt: false, holes: true }, ['ชนิด: ผักกาด', 'รูบนใบ: มี', 'หนอน: ไม่พบ'], 'lettuce_has_holes', 'ผักกาดมีรูเล็ก ๆ', { type: 'lettuce', holes: true }, 'pass_through', true),
        item('lettuce_curled', 'vegetables', 'ผักกาดใบงอ', '🥬', { type: 'lettuce', hasWorm: false, dirt: false, holes: false, curled: true }, ['ชนิด: ผักกาด', 'ใบงอ: มี', 'หนอน: ไม่พบ'], 'lettuce_curled', 'ผักกาดใบงอ', { type: 'lettuce', curled: true }, 'pass_through', true),
        item('potato_sprouted', 'vegetables', 'มันฝรั่งมีหน่องอก', '🥔', { type: 'potato', sprout: true, dirty: false, shape: 'normal' }, ['ชนิด: มันฝรั่ง', 'หน่องอก: มี'], 'sprouted_potato', 'มันฝรั่งมีหน่องอก', { type: 'potato', sprout: true }, 'special_sort'),
        item('potato_normal', 'vegetables', 'มันฝรั่งปกติ', '🥔', { type: 'potato', sprout: false, dirty: false, shape: 'normal' }, ['ชนิด: มันฝรั่ง', 'หน่องอก: ไม่มี'], 'normal_potato', 'มันฝรั่งปกติ', { type: 'potato', sprout: false }, 'pass_through'),
        item('potato_dirty', 'vegetables', 'มันฝรั่งเปื้อนดิน', '🥔', { type: 'potato', sprout: false, dirty: true, shape: 'normal' }, ['ชนิด: มันฝรั่ง', 'ดินติดผิว: มี'], 'dirty_potato', 'มันฝรั่งเปื้อนดิน', { type: 'potato', dirty: true }, 'pass_through', true),
        item('potato_odd', 'vegetables', 'มันฝรั่งรูปร่างบิดเบี้ยว', '🥔', { type: 'potato', sprout: false, dirty: false, shape: 'odd' }, ['ชนิด: มันฝรั่ง', 'รูปร่าง: บิดเบี้ยว'], 'odd_potato', 'มันฝรั่งรูปร่างบิดเบี้ยว', { type: 'potato', shape: 'odd' }, 'pass_through', true),
        item('potato_dark_spot', 'vegetables', 'มันฝรั่งมีจุดสีเข้ม', '🥔', { type: 'potato', sprout: false, dirty: false, shape: 'normal', darkSpot: true }, ['ชนิด: มันฝรั่ง', 'จุดสีเข้ม: มี'], 'potato_dark_spot', 'มันฝรั่งมีจุดสีเข้ม', { type: 'potato', darkSpot: true }, 'pass_through', true),
        item('orange_large', 'fruits', 'ส้มลูกใหญ่', '🍊', { type: 'orange', size: 'large', color: 'orange' }, ['ชนิด: ส้ม', 'ขนาด: ใหญ่'], 'large_orange', 'ส้มลูกใหญ่', { type: 'orange', size: 'large' }, 'premium_box'),
        item('orange_small', 'fruits', 'ส้มลูกเล็ก', '🍊', { type: 'orange', size: 'small', color: 'orange' }, ['ชนิด: ส้ม', 'ขนาด: เล็ก'], 'small_orange', 'ส้มลูกเล็ก', { type: 'orange', size: 'small' }, 'juice_box'),
        item('orange_medium', 'fruits', 'ส้มขนาดกลางเกือบใหญ่', '🍊', { type: 'orange', size: 'medium', color: 'orange' }, ['ชนิด: ส้ม', 'ขนาด: กลาง'], 'medium_orange', 'ส้มขนาดกลางเกือบใหญ่', { type: 'orange', size: 'medium' }, 'juice_box', true),
        item('orange_pretty_small', 'fruits', 'ส้มลูกเล็กแต่สีสวย', '🍊', { type: 'orange', size: 'small', color: 'bright' }, ['ชนิด: ส้ม', 'ขนาด: เล็ก', 'สี: สวยสด'], 'bright_small_orange', 'ส้มลูกเล็กแต่สีสวย', { type: 'orange', color: 'bright' }, 'juice_box', true),
        item('orange_large_pale', 'fruits', 'ส้มลูกใหญ่สีอ่อน', '🍊', { type: 'orange', size: 'large', color: 'pale' }, ['ชนิด: ส้ม', 'ขนาด: ใหญ่', 'สี: อ่อน'], 'large_pale_orange', 'ส้มลูกใหญ่สีอ่อน', { type: 'orange', size: 'large', color: 'pale' }, 'premium_box', true),
        item('banana_ripe', 'fruits', 'กล้วยสุกสีเหลือง', '🍌', { type: 'banana', ripe: true, color: 'yellow', tip: 'yellow' }, ['ชนิด: กล้วย', 'ความสุก: พร้อมขาย'], 'ripe_banana', 'กล้วยสุกสีเหลือง', { type: 'banana', ripe: true }, 'storefront'),
        item('banana_green', 'fruits', 'กล้วยดิบสีเขียว', '🍌', { type: 'banana', ripe: false, color: 'green', tip: 'green' }, ['ชนิด: กล้วย', 'สี: เขียว'], 'green_banana', 'กล้วยดิบสีเขียว', { type: 'banana', ripe: false }, 'ripening_room'),
        item('banana_yellow_green', 'fruits', 'กล้วยเหลืองอมเขียว', '🍌', { type: 'banana', ripe: false, color: 'yellow_green', tip: 'green' }, ['ชนิด: กล้วย', 'สี: เหลืองอมเขียว'], 'yellow_green_banana', 'กล้วยเหลืองอมเขียว', { type: 'banana', color: 'yellow_green' }, 'ripening_room', true),
        item('banana_spotted', 'fruits', 'กล้วยสุกมีจุดดำเล็กน้อย', '🍌', { type: 'banana', ripe: true, color: 'yellow', spots: 'small' }, ['ชนิด: กล้วย', 'จุดดำ: เล็กน้อย'], 'spotted_ripe_banana', 'กล้วยสุกมีจุดดำเล็กน้อย', { type: 'banana', ripe: true, spots: 'small' }, 'storefront', true),
        item('banana_green_tip', 'fruits', 'กล้วยเหลืองแต่ปลายเขียว', '🍌', { type: 'banana', ripe: false, color: 'yellow', tip: 'green' }, ['ชนิด: กล้วย', 'ปลายผล: เขียว'], 'green_tip_banana', 'กล้วยเหลืองแต่ปลายเขียว', { type: 'banana', tip: 'green' }, 'ripening_room', true),
        item('watermelon_grade_a', 'fruits', 'แตงโมเกรดดี', '🍉', { type: 'watermelon', weightOk: true, sound: 'clear', color: 'normal' }, ['ชนิด: แตงโม', 'น้ำหนัก: ผ่าน', 'เสียง: กังวาน'], 'grade_a_watermelon', 'แตงโมเกรดดี', { type: 'watermelon', weightOk: true, sound: 'clear' }, 'grade_a_sticker'),
        item('watermelon_weight_only', 'fruits', 'แตงโมน้ำหนักพอดีแต่เสียงไม่กังวาน', '🍉', { type: 'watermelon', weightOk: true, sound: 'dull', color: 'normal' }, ['ชนิด: แตงโม', 'น้ำหนัก: ผ่าน', 'เสียง: ไม่กังวาน'], 'watermelon_weight_only', 'แตงโมน้ำหนักพอดีแต่เสียงไม่กังวาน', { type: 'watermelon', weightOk: true, sound: 'dull' }, 'process_juice', true),
        item('watermelon_sound_only', 'fruits', 'แตงโมเสียงกังวานแต่น้ำหนักน้อย', '🍉', { type: 'watermelon', weightOk: false, sound: 'clear', color: 'normal' }, ['ชนิด: แตงโม', 'เสียง: กังวาน', 'น้ำหนัก: ไม่ผ่าน'], 'watermelon_sound_only', 'แตงโมเสียงกังวานแต่น้ำหนักน้อย', { type: 'watermelon', weightOk: false, sound: 'clear' }, 'process_juice', true),
        item('watermelon_pretty_color', 'fruits', 'แตงโมสีสวยแต่ไม่ผ่านน้ำหนัก', '🍉', { type: 'watermelon', weightOk: false, sound: 'dull', color: 'pretty' }, ['ชนิด: แตงโม', 'สี: สวย', 'น้ำหนัก: ไม่ผ่าน'], 'watermelon_pretty_color', 'แตงโมสีสวยแต่ไม่ผ่านน้ำหนัก', { type: 'watermelon', color: 'pretty' }, 'process_juice', true),
        item('watermelon_pretty_stripe', 'fruits', 'แตงโมลายสวยแต่เสียงทึบ', '🍉', { type: 'watermelon', weightOk: true, sound: 'dull', color: 'striped' }, ['ชนิด: แตงโม', 'ลาย: สวย', 'เสียง: ทึบ'], 'watermelon_pretty_stripe', 'แตงโมลายสวยแต่เสียงทึบ', { type: 'watermelon', sound: 'dull' }, 'process_juice', true),
        item('egg_large_perfect', 'animal_products', 'ไข่ใบใหญ่เปลือกสมบูรณ์', '🥚', { type: 'egg', size: 'large', shell: 'perfect', color: 'normal' }, ['ประเภท: ไข่', 'ขนาด: ใหญ่', 'เปลือก: สมบูรณ์'], 'premium_egg', 'ไข่ใบใหญ่และเปลือกสมบูรณ์', { type: 'egg', size: 'large', shell: 'perfect' }, 'premium_egg_tray'),
        item('egg_small_perfect', 'animal_products', 'ไข่ใบเล็กเปลือกสมบูรณ์', '🥚', { type: 'egg', size: 'small', shell: 'perfect', color: 'normal' }, ['ประเภท: ไข่', 'ขนาด: เล็ก', 'เปลือก: ไม่แตก'], 'standard_egg', 'ไข่ใบเล็กแต่ไม่แตก', { type: 'egg', size: 'small', shell: 'perfect' }, 'standard_egg_tray'),
        item('egg_cracked', 'animal_products', 'ไข่ร้าว', '🥚', { type: 'egg', size: 'small', shell: 'cracked', color: 'normal' }, ['ประเภท: ไข่', 'เปลือก: มีรอยร้าว'], 'cracked_egg', 'ไข่ร้าว', { type: 'egg', shell: 'cracked' }, 'reject_bin'),
        item('egg_large_cracked', 'animal_products', 'ไข่ใบใหญ่มีรอยร้าว', '🥚', { type: 'egg', size: 'large', shell: 'cracked', color: 'normal' }, ['ประเภท: ไข่', 'ขนาด: ใหญ่', 'เปลือก: มีรอยร้าว'], 'large_cracked_egg', 'ไข่ใบใหญ่มีรอยร้าว', { type: 'egg', size: 'large', shell: 'cracked' }, 'reject_bin', true),
        item('egg_small_pretty', 'animal_products', 'ไข่ใบเล็กเปลือกสวยมาก', '🥚', { type: 'egg', size: 'small', shell: 'perfect', color: 'pretty' }, ['ประเภท: ไข่', 'ขนาด: เล็ก', 'เปลือก: สวย'], 'small_pretty_egg', 'ไข่ใบเล็กเปลือกสวยมาก', { type: 'egg', size: 'small', color: 'pretty' }, 'standard_egg_tray', true),
        item('egg_dark_small', 'animal_products', 'ไข่สีเข้มแต่ไม่ได้ร้าว', '🥚', { type: 'egg', size: 'small', shell: 'perfect', color: 'dark' }, ['ประเภท: ไข่', 'สี: เข้ม', 'เปลือก: ไม่ร้าว'], 'dark_small_egg', 'ไข่สีเข้มแต่ไม่ได้ร้าว', { type: 'egg', color: 'dark' }, 'standard_egg_tray', true),
        item('egg_shadow_large', 'animal_products', 'ไข่ใหญ่มีเงาคล้ายรอยร้าว', '🥚', { type: 'egg', size: 'large', shell: 'perfect', color: 'normal', shadow: true }, ['ประเภท: ไข่', 'ขนาด: ใหญ่', 'รอยที่เห็น: เงา'], 'shadow_large_egg', 'ไข่ใหญ่มีเงาคล้ายรอยร้าว', { type: 'egg', shadow: true }, 'premium_egg_tray', true),
        item('wool_clean_soft', 'animal_products', 'ขนแกะสะอาดและนุ่ม', '🐑', { type: 'wool', clean: true, soft: true, hasGrass: false, wet: false }, ['ประเภท: ขนแกะ', 'สะอาด: ใช่', 'นุ่ม: ใช่'], 'premium_wool', 'ขนแกะสะอาดและนุ่ม', { type: 'wool', clean: true, soft: true }, 'premium_wool_roll'),
        item('wool_grass', 'animal_products', 'ขนแกะมีเศษหญ้า', '🐑', { type: 'wool', clean: false, soft: true, hasGrass: true, wet: false }, ['ประเภท: ขนแกะ', 'เศษหญ้า: มี'], 'grassy_wool', 'ขนแกะมีเศษหญ้า', { type: 'wool', hasGrass: true }, 'wool_cleaning_machine'),
        item('wool_wet_dirty', 'animal_products', 'ขนแกะเปียกและสกปรกมาก', '🐑', { type: 'wool', clean: false, soft: false, hasGrass: false, wet: true }, ['ประเภท: ขนแกะ', 'เปียก: ใช่', 'สกปรกมาก: ใช่'], 'wet_dirty_wool', 'ขนแกะเปียกและสกปรกมาก', { type: 'wool', wet: true }, 'wool_recycle_bin'),
        item('wool_clean_not_fluffy', 'animal_products', 'ขนแกะสะอาดแต่ไม่ฟู', '🐑', { type: 'wool', clean: true, soft: false, hasGrass: false, wet: false }, ['ประเภท: ขนแกะ', 'สะอาด: ใช่', 'นุ่ม: ไม่ผ่าน'], 'clean_not_fluffy_wool', 'ขนแกะสะอาดแต่ไม่ฟู', { type: 'wool', clean: true, soft: false }, 'wool_recycle_bin', true),
        item('wool_tiny_grass', 'animal_products', 'ขนแกะมีเศษหญ้าน้อยมาก', '🐑', { type: 'wool', clean: false, soft: true, hasGrass: true, wet: false }, ['ประเภท: ขนแกะ', 'เศษหญ้า: มีเล็กน้อย'], 'tiny_grass_wool', 'ขนแกะมีเศษหญ้าน้อยมาก', { type: 'wool', hasGrass: true }, 'wool_cleaning_machine', true),
        item('wool_dark_natural', 'animal_products', 'ขนแกะสีเข้มตามธรรมชาติ', '🐑', { type: 'wool', clean: true, soft: true, hasGrass: false, wet: false, color: 'dark' }, ['ประเภท: ขนแกะ', 'สี: เข้มตามธรรมชาติ', 'สะอาด: ใช่'], 'dark_natural_wool', 'ขนแกะสีเข้มตามธรรมชาติ', { type: 'wool', color: 'dark' }, 'premium_wool_roll', true),
        item('wool_fluffy_wet', 'animal_products', 'ขนแกะฟูแต่มีคราบน้ำ', '🐑', { type: 'wool', clean: false, soft: true, hasGrass: false, wet: true }, ['ประเภท: ขนแกะ', 'ฟู: มี', 'คราบน้ำ: มี'], 'fluffy_wet_wool', 'ขนแกะฟูแต่มีคราบน้ำ', { type: 'wool', wet: true, soft: true }, 'wool_recycle_bin', true),
        item('milk_cold_6_5', 'animal_products', 'นมเย็นคุณภาพดี 6.5°C', '🥛', { type: 'milk', temperature: 6.5, labelStyle: 'cold' }, ['ประเภท: น้ำนม', 'อุณหภูมิ: 6.5°C'], 'milk_below_8', 'อุณหภูมินมต่ำกว่า 8°C', { type: 'milk', cold: true }, 'milk_bottling'),
        item('milk_edge_7_9', 'animal_products', 'นม 7.9°C ใกล้ขอบเขต', '🥛', { type: 'milk', temperature: 7.9, labelStyle: 'edge_good_decoy' }, ['ประเภท: น้ำนม', 'อุณหภูมิ: 7.9°C'], 'milk_below_8', 'อุณหภูมินมต่ำกว่า 8°C', { type: 'milk', cold: true }, 'milk_bottling', true),
        item('milk_edge_8', 'animal_products', 'นม 8°C พอดี', '🥛', { type: 'milk', temperature: 8, labelStyle: 'edge_cool_decoy' }, ['ประเภท: น้ำนม', 'อุณหภูมิ: 8°C'], 'milk_8_to_15', 'อุณหภูมิ 8-15°C', { type: 'milk', warm: true }, 'cool_room', true),
        item('milk_cool_12', 'animal_products', 'นมต้องทำความเย็น 12°C', '🥛', { type: 'milk', temperature: 12, labelStyle: 'cool' }, ['ประเภท: น้ำนม', 'อุณหภูมิ: 12°C'], 'milk_8_to_15', 'อุณหภูมิ 8-15°C', { type: 'milk', warm: true }, 'cool_room'),
        item('milk_edge_15', 'animal_products', 'นม 15°C พอดี', '🥛', { type: 'milk', temperature: 15, labelStyle: 'edge_cool_decoy' }, ['ประเภท: น้ำนม', 'อุณหภูมิ: 15°C'], 'milk_8_to_15', 'อุณหภูมิ 8-15°C', { type: 'milk', warm: true }, 'cool_room', true),
        item('milk_hot_16', 'animal_products', 'นมอุณหภูมิสูง 16°C', '🥛', { type: 'milk', temperature: 16, labelStyle: 'hot' }, ['ประเภท: น้ำนม', 'อุณหภูมิ: 16°C'], 'milk_over_15', 'อุณหภูมินมสูงกว่า 15°C', { type: 'milk', spoiled: true }, 'reject_bin'),
        item('milk_pretty_label_22', 'animal_products', 'นมฉลากสวย 22°C', '🥛', { type: 'milk', temperature: 22, labelStyle: 'pretty_label_decoy' }, ['ประเภท: น้ำนม', 'อุณหภูมิ: 22°C', 'ฉลาก: สวย'], 'milk_over_15', 'อุณหภูมินมสูงกว่า 15°C', { type: 'milk', spoiled: true }, 'reject_bin', true),
        item('milk_fancy_7_2', 'animal_products', 'ขวดนมสีสวย 7.2°C', '🥛', { type: 'milk', temperature: 7.2, labelStyle: 'fancy_bottle_decoy' }, ['ประเภท: น้ำนม', 'อุณหภูมิ: 7.2°C', 'ขวด: สีสวย'], 'milk_below_8', 'อุณหภูมินมต่ำกว่า 8°C', { type: 'milk', cold: true }, 'milk_bottling', true),
        item('milk_edge_15_1', 'animal_products', 'นม 15.1°C ใกล้ขอบเขต', '🥛', { type: 'milk', temperature: 15.1, labelStyle: 'edge_hot_decoy' }, ['ประเภท: น้ำนม', 'อุณหภูมิ: 15.1°C'], 'milk_over_15', 'อุณหภูมินมสูงกว่า 15°C', { type: 'milk', spoiled: true }, 'reject_bin', true)
    ];

    const state = {
        logicType: 'if',
        activeTheme: 'vegetables',
        selectedItems: [],
        rules: [],
        tested: false,
        testResult: null,
        dragDrop: null,
        booted: false,
        builderAssistance: {
            used_auto_fill: false,
            auto_fill_count: 0
        }
    };

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        const root = document.getElementById('smart-farm-builder');
        if (!root) return;

        state.root = root;
        renderLogicCards();
        bindFields();
        bindButtons();
        hydrateExisting(root);
        if (!state.booted) setLogicType(state.logicType);
        renderAll();
    }

    function hydrateExisting(root) {
        const raw = root.dataset.existing || '';
        let data = null;
        try {
            data = raw && raw !== 'null' ? JSON.parse(raw) : null;
        } catch (error) {
            data = null;
        }
        if (!data || data.project_type !== 'smart_farm_mini_game') return;

        state.logicType = data.logic_type || 'if';
        state.activeTheme = data.theme || logicTypes[state.logicType].theme;
        state.selectedItems = (data.items || []).map((saved) => ({
            ...saved,
            uid: saved.uid || uid(),
            catalogId: saved.catalogId || saved.id,
            correctAction: normalizeSavedAction(state.logicType === 'if' && saved.correctAction === 'pass' ? 'pass_through' : (saved.correctResult || saved.correctAction))
        }));
        state.rules = (data.rules || []).map((rule) => ({
            ...rule,
            action: normalizeSavedAction(state.logicType === 'if' && rule.action === 'pass' ? 'pass_through' : rule.action)
        }));
        state.tested = Boolean(data.testResult?.tested);
        state.testResult = data.testResult || null;
        state.builderAssistance = {
            used_auto_fill: Boolean(data.builder_assistance?.used_auto_fill),
            auto_fill_count: Number(data.builder_assistance?.auto_fill_count || 0)
        };
        document.getElementById('level-title').value = data.title || '';
        document.getElementById('level-mission').value = data.mission || '';
        document.getElementById('level-instruction').value = data.instruction || '';
        state.booted = true;
    }

    function bindFields() {
        ['level-title', 'level-mission', 'level-instruction'].forEach((id) => {
            document.getElementById(id).addEventListener('input', () => {
                state.tested = false;
                renderValidation();
                updateSubmitState();
            });
        });
    }

    function bindButtons() {
        document.getElementById('auto-fill-rules').addEventListener('click', autoFillRules);
        document.getElementById('run-test').addEventListener('click', runTest);
        document.getElementById('submit-work').addEventListener('click', submitWork);
    }

    function renderLogicCards() {
        const container = document.getElementById('logic-type-cards');
        container.innerHTML = Object.values(logicTypes).map((logic) => `
            <button type="button" class="logic-type-card" data-logic="${logic.id}">
                <strong>${escapeHtml(logic.label)}</strong>
                <span>${escapeHtml(logic.title)}</span>
                <small>${escapeHtml(logic.caption)}</small>
            </button>
        `).join('');
        container.querySelectorAll('.logic-type-card').forEach((card) => {
            card.addEventListener('click', () => setLogicType(card.dataset.logic));
        });
    }

    function setLogicType(type) {
        const logic = logicTypes[type] || logicTypes.if;
        state.logicType = logic.id;
        state.activeTheme = logic.theme;
        state.selectedItems = state.selectedItems.filter((item) => item.theme === logic.theme);
        state.rules = makeRuleSlots(logic.ruleSlots, state.rules);
        state.tested = false;
        renderAll();
    }

    function renderAll() {
        updateLogicCards();
        renderCatalogFilter();
        renderCatalog();
        renderSelectedItems();
        renderRuleBuilder();
        renderDestinations();
        renderPreviewBar(false);
        renderValidation();
        renderTestResult();
        updateSubmitState();
    }

    function updateLogicCards() {
        document.querySelectorAll('.logic-type-card').forEach((card) => {
            card.classList.toggle('active', card.dataset.logic === state.logicType);
        });
    }

    function renderCatalogFilter() {
        const logic = logicTypes[state.logicType];
        const container = document.getElementById('catalog-filter');
        container.innerHTML = `
            <button type="button" class="active" data-theme="${logic.theme}">
                ${escapeHtml(logic.themeLabel)}
            </button>
        `;
    }

    function renderCatalog() {
        const container = document.getElementById('item-catalog');
        const items = catalog.filter((itemData) => itemData.theme === state.activeTheme);
        const cardHtml = (itemData) => `
            <div class="catalog-item" data-id="${itemData.id}">
                <span class="item-emoji">${escapeHtml(itemData.fallbackIcon)}</span>
                <span class="item-name">${escapeHtml(itemData.label)}</span>
                <span class="item-tags">${escapeHtml(itemData.propsDisplay.slice(0, 2).join(' | '))}</span>
                <div class="catalog-actions">
                    <button type="button" class="btn btn-sm btn-success add-single-item" title="เพิ่มวัตถุนี้ลงในด่าน">
                        เพิ่มวัตถุนี้
                    </button>
                </div>
            </div>
        `;
        container.innerHTML = items.map(cardHtml).join('');
        container.querySelectorAll('.catalog-item').forEach((card) => {
            card.querySelector('.add-single-item').addEventListener('click', () => addItem(card.dataset.id));
        });
    }

    function renderSelectedItems() {
        const container = document.getElementById('selected-items');
        const actions = getSelectableActions();
        document.getElementById('selected-count').textContent = `${state.selectedItems.length} ชิ้น`;

        if (!state.selectedItems.length) {
            container.innerHTML = '<div class="text-center text-secondary border rounded-3 p-4">ยังไม่มีวัตถุในด่าน เลือกจากคลังด้านบนเพื่อเริ่มสร้างสายพาน</div>';
            return;
        }

        container.innerHTML = state.selectedItems.map((itemData) => `
            <div class="selected-item-row" data-uid="${itemData.uid}">
                <span class="mini-emoji">${escapeHtml(itemData.fallbackIcon)}</span>
                <div>
                    <div class="name">${escapeHtml(itemData.label)}</div>
                    <div class="props">${escapeHtml(itemData.propsDisplay.join(' | '))}</div>
                    ${itemData.isAutoDecoy ? '<span class="decoy-pill">ตัวหลอกที่ระบบแนะนำ</span>' : ''}
                </div>
                <select class="form-select form-select-sm correct-action" aria-label="เลือกปลายทางของ ${escapeHtml(itemData.label)}">
                    ${actions.map((actionItem) => `
                        <option value="${actionItem.id}" ${actionItem.id === itemData.correctAction ? 'selected' : ''}>${escapeHtml(actionItem.label)}</option>
                    `).join('')}
                </select>
                <label class="decoy-toggle">
                    <input type="checkbox" class="form-check-input decoy-check" ${itemData.isDecoy ? 'checked' : ''}>
                    ตัวหลอก
                </label>
                <button type="button" class="btn btn-sm btn-outline-danger remove-item" title="ลบวัตถุ"><i class="bi bi-x-lg"></i></button>
            </div>
        `).join('');

        container.querySelectorAll('.selected-item-row').forEach((row) => {
            const uidValue = row.dataset.uid;
            row.querySelector('.correct-action')?.addEventListener('change', (event) => updateItem(uidValue, { correctAction: event.target.value }));
            row.querySelector('.decoy-check').addEventListener('change', (event) => updateItem(uidValue, { isDecoy: event.target.checked }));
            row.querySelector('.remove-item').addEventListener('click', () => removeItem(uidValue));
        });
    }

    function renderRuleBuilder() {
        const logic = logicTypes[state.logicType];
        const conditions = deriveConditions();
        const actions = getActions();

        if (!state.dragDrop) {
            state.dragDrop = new window.FarmMissions.DragDropManager({
                rootElement: document.querySelector('.rule-builder-shell'),
                rulePanel: document.getElementById('builder-rule-list'),
                conditionContainer: document.getElementById('builder-condition-blocks'),
                actionContainer: document.getElementById('builder-action-blocks'),
                trashElement: document.getElementById('builder-block-trash'),
                previewElement: null,
                onRulesChanged: (rules) => {
                    state.rules = rules;
                    state.tested = false;
                    renderRuleGuide();
                    renderValidation();
                    updateSubmitState();
                },
                onFeedback: showValidationMessage
            });
        }

        const slots = makeRuleSlots(logic.ruleSlots, state.rules);
        state.dragDrop.loadLevel({
            ruleSlots: slots,
            conditions,
            actions,
            allowReorder: logic.id === 'if_else_if_else'
        });
        state.rules = state.dragDrop.getRules();
        document.getElementById('builder-rule-caption').textContent = `${logic.label}: ${logic.caption}`;
        if (!conditions.length) {
            document.getElementById('builder-condition-blocks').innerHTML = '<div class="empty-block-hint">เลือกวัตถุหลักก่อน แล้วเงื่อนไขจะปรากฏตรงนี้</div>';
        }
        renderRuleGuide();
    }

    function renderRuleGuide() {
        const logic = logicTypes[state.logicType];
        const conditions = deriveConditions();
        const actions = getActions();
        const guide = document.getElementById('builder-rule-guide');
        const readable = document.getElementById('builder-readable-rules');
        if (!guide || !readable) return;

        guide.innerHTML = `
            <div class="rule-guide-card">
                <strong>วิธีใช้ช่องนี้</strong>
                ${logic.id === 'if' ? `
                    <span>1. เลือกวัตถุที่เป็นกรณีพิเศษ 1 แบบ เช่น "${escapeHtml(conditions[0]?.label || 'แครอทเปื้อนโคลน')}"</span>
                    <span>2. ลากเงื่อนไขและคำสั่งพิเศษลงในแถว If แถวเดียว</span>
                    <span>3. วัตถุที่ไม่เข้าเงื่อนไขจะปล่อยผ่านอัตโนมัติ ไม่ต้องสร้าง Else</span>
                ` : `
                    <span>1. เลือกวัตถุหลักก่อน ระบบจะสร้างบล็อกเงื่อนไข เช่น "${escapeHtml(conditions[0]?.label || 'ไข่ใบใหญ่และไม่ร้าว')}"</span>
                    <span>2. ลากเงื่อนไขไปช่องซ้าย และลากปลายทางไปช่องขวา</span>
                    <span>3. กด “ใส่ตัวอย่างเริ่มต้น” ได้ ถ้าต้องการดูโครงกฎตั้งต้นจากปลายทางของวัตถุที่เลือก</span>
                `}
            </div>
            <div class="rule-guide-card muted">
                <strong>ตอนนี้มี</strong>
                <span>${conditions.length} เงื่อนไขจากวัตถุหลัก</span>
                <span>${state.selectedItems.filter((itemData) => itemData.isDecoy).length} ตัวหลอกสำหรับทดสอบ</span>
                <span>รูปแบบกฎ: ${escapeHtml(logic.id === 'if' ? 'Single-Action If' : logic.label)}</span>
            </div>
        `;

        readable.innerHTML = `
            <div class="readable-title"><i class="bi bi-card-checklist"></i> อ่านกฎเป็นประโยค</div>
            ${state.rules.map((rule, index) => {
                const prefix = rule.type === 'else' ? 'นอกเหนือจากนี้' : (rule.type === 'else_if' ? 'นอกเหนือจากนี้ถ้า' : 'ถ้า');
                const condition = rule.type === 'else' ? 'วัตถุที่เหลือทั้งหมด' : labelOf(conditions, rule.condition, 'ยังไม่ได้วางเงื่อนไข');
                const action = labelOf(actions, rule.action, 'ยังไม่ได้วางปลายทาง');
                return `<div class="readable-rule ${(!rule.action || (rule.type !== 'else' && !rule.condition)) ? 'incomplete' : ''}">
                    ${index + 1}. ${escapeHtml(prefix)} ${escapeHtml(condition)} → ${escapeHtml(action)}
                </div>`;
            }).join('')}
            ${logic.id === 'if' ? `<div class="readable-rule system-rule">ระบบ: วัตถุที่ไม่เข้าเงื่อนไข → ${escapeHtml(defaultBehavior().label)}</div>` : ''}
        `;
    }

    function renderDestinations() {
        const container = document.getElementById('builder-destinations');
        const actions = getActions();
        container.style.setProperty('--destination-count', String(actions.length + (state.logicType === 'if' ? 1 : 0)));
        container.innerHTML = actions.map((actionItem) => `
            <div class="destination-card" data-action="${actionItem.id}">
                <strong>${escapeHtml(actionItem.icon)}</strong>
                <span>${escapeHtml(actionItem.destination)}</span>
            </div>
        `).join('') + (state.logicType === 'if' ? `
            <div class="pass-through-card">
                <strong><i class="bi bi-arrow-right-circle-fill"></i></strong>
                <span>${escapeHtml(defaultBehavior().label)}</span>
            </div>
        ` : '');
    }

    function renderPreviewBar(showAnswers) {
        const container = document.getElementById('builder-preview-bar');
        if (!state.selectedItems.length) {
            container.innerHTML = '<span class="text-secondary small">แถบรายการวัตถุจะแสดงที่นี่ และไม่ทับพื้นที่สายพาน</span>';
            return;
        }
        container.innerHTML = state.selectedItems.map((itemData, index) => `
            <button type="button" class="preview-chip" data-index="${index}">
                <span class="emoji">${escapeHtml(itemData.fallbackIcon)}</span>
                <small>${escapeHtml(itemData.label)}</small>
            </button>
        `).join('');
        container.querySelectorAll('.preview-chip').forEach((chip) => {
            chip.addEventListener('click', () => showItemDetail(state.selectedItems[Number(chip.dataset.index)], showAnswers));
        });
    }

    function renderValidation() {
        const box = document.getElementById('validation-box');
        const result = validateCurrent();
        box.classList.toggle('has-errors', !result.ok);
        box.classList.toggle('is-ready', result.ok);
        const warnings = result.qualityCheck?.warnings || [];
        const warningHtml = warnings.length
            ? `<div class="quality-warning-list mt-2"><strong>ข้อแนะนำเพื่อให้ด่านท้าทายขึ้น:</strong><ul class="mb-0 mt-1">${warnings.slice(0, 4).map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}</ul></div>`
            : '';
        box.innerHTML = result.ok
            ? `<i class="bi bi-check-circle-fill"></i> โครงสร้างด่านพร้อมทดลองเล่นแล้ว${warningHtml}`
            : `<strong>สิ่งที่ยังต้องแก้:</strong><ul class="mb-0 mt-1">${result.errors.slice(0, 6).map((error) => `<li>${escapeHtml(error)}</li>`).join('')}</ul>${warningHtml}`;
    }

    function renderTestResult() {
        const box = document.getElementById('test-result');
        if (!state.tested || !state.testResult) {
            box.textContent = 'ยังไม่ได้ทดลองเล่น';
            return;
        }
        const percent = Math.round((state.testResult.accuracy || 0) * 100);
        box.innerHTML = `<strong>ผลทดสอบล่าสุด:</strong> ถูก ${state.testResult.correct}/${state.testResult.total} ชิ้น (${percent}%) | ดาว ${'★'.repeat(state.testResult.stars)}${'☆'.repeat(3 - state.testResult.stars)}`;
    }

    function addItem(id) {
        const base = catalog.find((entry) => entry.id === id);
        if (!base) return;
        state.selectedItems.push({
            ...clone(base),
            uid: uid(),
            catalogId: base.id,
            isDecoy: false,
            isAutoDecoy: false,
            correctAction: initialCorrectAction(base),
            explain: makeExplain(base, initialCorrectAction(base))
        });
        state.tested = false;
        refreshAfterItemsChanged();
    }

    function updateItem(uidValue, updates) {
        const target = state.selectedItems.find((entry) => entry.uid === uidValue);
        if (!target) return;
        Object.assign(target, updates);
        if (Object.prototype.hasOwnProperty.call(updates, 'correctAction')) {
            target.correctResult = updates.correctAction;
        }
        target.explain = makeExplain(target, target.correctAction);
        state.tested = false;
        refreshAfterItemsChanged(false);
    }

    function removeItem(uidValue) {
        state.selectedItems = state.selectedItems.filter((entry) => entry.uid !== uidValue);
        state.tested = false;
        refreshAfterItemsChanged();
    }

    function refreshAfterItemsChanged(rebuildRules = true) {
        renderSelectedItems();
        if (rebuildRules) renderRuleBuilder();
        renderPreviewBar(false);
        renderValidation();
        renderTestResult();
        updateSubmitState();
    }

    function autoFillRules() {
        const logic = logicTypes[state.logicType];
        const conditions = deriveConditions();
        if (!conditions.length) {
            alert('ต้องเลือกวัตถุก่อน ระบบจึงจะสร้างเงื่อนไขได้');
            return;
        }
        const slots = logic.ruleSlots.map((slot, index) => {
            if (slot.type === 'else') {
                return { type: 'else', condition: 'else', action: mostCommonActionForElse() };
            }
            const condition = conditions[index] || conditions[0];
            return { type: slot.type, condition: condition.id, action: actionForCondition(condition) };
        });
        state.rules = slots;
        state.tested = false;
        state.builderAssistance.used_auto_fill = true;
        state.builderAssistance.auto_fill_count += 1;
        renderRuleBuilder();
        renderValidation();
        updateSubmitState();
    }

    async function runTest() {
        const validation = validateCurrent();
        if (!validation.ok) {
            renderValidation();
            alert('ยังทดลองเล่นไม่ได้ กรุณาแก้ข้อมูลให้ครบก่อน');
            return;
        }

        const button = document.getElementById('run-test');
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> กำลังทดลองเล่น...';
        const movingLayer = document.getElementById('moving-item-layer');
        movingLayer.innerHTML = '';

        let correct = 0;
        const conditions = deriveConditions();
        for (const itemData of state.selectedItems) {
            const actualAction = window.SmartFarmBuilderPreview.evaluate(itemData, state.rules, conditions, buildEvaluationConfig());
            const expectedAction = itemData.correctAction;
            const ok = actualAction === expectedAction;
            if (ok) correct++;
            await animateItem(itemData, actualAction, ok);
        }

        const total = Math.max(1, state.selectedItems.length);
        const accuracy = correct / total;
        state.tested = true;
        state.testResult = {
            tested: true,
            correct,
            total,
            accuracy,
            stars: starsFor(accuracy),
            lastTestAt: new Date().toISOString()
        };
        renderPreviewBar(true);
        renderTestResult();
        updateSubmitState();
        button.disabled = false;
        button.innerHTML = '<i class="bi bi-play-fill"></i> ทดลองเล่นด่านของฉัน';
    }

    function animateItem(itemData, actualAction, ok) {
        return new Promise((resolve) => {
            const layer = document.getElementById('moving-item-layer');
            const token = document.createElement('div');
            token.className = 'moving-token';
            token.textContent = itemData.fallbackIcon || '🌱';
            const board = document.getElementById('builder-play-area');
            const startPoint = getBoardPoint('start', board);
            const scanPoint = getBoardPoint('.scan-station', board);
            setTokenPoint(token, startPoint);
            layer.appendChild(token);

            window.setTimeout(() => {
                setTokenPoint(token, scanPoint);
            }, 80);

            window.setTimeout(() => {
            token.classList.add(ok ? 'correct' : 'wrong');
            const targetSelector = actualAction === defaultPassAction()
                ? '.pass-through-card'
                : `[data-action="${cssEscape(actualAction)}"]`;
            setTokenPoint(token, getBoardPoint(targetSelector, board));
            }, 540);

            window.setTimeout(() => {
                token.remove();
                resolve();
            }, 990);
        });
    }

    function submitWork() {
        const validation = validateCurrent();
        if (!validation.ok) {
            renderValidation();
            alert('ยังส่งงานไม่ได้ กรุณาแก้ข้อมูลให้ครบก่อน');
            return;
        }
        if (!state.tested) {
            alert('กรุณาทดลองเล่นด่านของตนเองก่อนส่งผลงาน');
            return;
        }

        const payload = buildPayload();
        const description = [
            payload.title,
            payload.mission,
            payload.instruction
        ].filter(Boolean).join('\n\n');

        if (!confirm('ยืนยันส่งด่านฟาร์มอัจฉริยะนี้ใช่ไหม?')) return;

        fetch('../api/save_work.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                game_id: 3,
                description,
                items: payload
            })
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    window.location.href = 'showcase.php?game_id=3';
                    return;
                }
                alert(data.error || data.message || 'บันทึกชิ้นงานไม่สำเร็จ');
            })
            .catch(() => alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'));
    }

    function buildPayload() {
        const logic = logicTypes[state.logicType];
        const actions = getActions();
        const conditions = deriveConditions();
        const validationConfig = {
            logic,
            title: document.getElementById('level-title').value.trim(),
            mission: document.getElementById('level-mission').value.trim(),
            instruction: document.getElementById('level-instruction').value.trim(),
            items: state.selectedItems,
            conditions,
            actions,
            rules: state.rules,
            defaultBehavior: state.logicType === 'if' ? defaultBehavior() : null
        };
        const qualityCheck = window.SmartFarmBuilderValidation.qualityCheck(validationConfig, state.rules);
        return {
            project_type: 'smart_farm_mini_game',
            game_id: 3,
            builder_version: '2.0',
            logic_type: state.logicType,
            mode: logic.mode || null,
            theme: logic.theme,
            themeLabel: logic.themeLabel,
            title: document.getElementById('level-title').value.trim(),
            mission: document.getElementById('level-mission').value.trim(),
            instruction: document.getElementById('level-instruction').value.trim(),
            items: state.selectedItems.map((itemData) => ({
                uid: itemData.uid,
                catalogId: itemData.catalogId,
                id: itemData.id,
                label: itemData.label,
                fallbackIcon: itemData.fallbackIcon,
                theme: itemData.theme,
                props: itemData.props,
                propsDisplay: itemData.propsDisplay,
                conditionId: itemData.conditionId,
                conditionLabel: itemData.conditionLabel,
                conditionProps: itemData.conditionProps,
                correctAction: itemData.correctAction,
                matchesCondition: itemData.correctAction !== defaultPassAction(),
                correctResult: itemData.correctAction,
                expectedRuleBranch: window.SmartFarmBuilderValidation.branchForItem(itemData, validationConfig, state.rules),
                isDecoy: Boolean(itemData.isDecoy),
                isAutoDecoy: Boolean(itemData.isAutoDecoy),
                sourceCatalogId: itemData.sourceCatalogId || null,
                decoyVariant: itemData.decoyVariant || null,
                decoyReason: itemData.decoyReason || (itemData.isDecoy ? itemData.explain : ''),
                explain: itemData.explain || makeExplain(itemData, itemData.correctAction)
            })),
            conditions,
            actions,
            rules: state.rules,
            condition: state.logicType === 'if' ? (conditions[0] || null) : null,
            special_action: state.logicType === 'if' ? (actions.find((action) => action.id === state.rules[0]?.action) || null) : null,
            default_behavior: state.logicType === 'if' ? defaultBehavior() : null,
            previewBar: {
                clickable: true,
                showDecoyHintBeforePlay: true,
                showAnswerAfterPlay: true
            },
            builder_assistance: state.builderAssistance,
            qualityCheck,
            testResult: state.testResult || { tested: false }
        };
    }

    function validateCurrent() {
        return window.SmartFarmBuilderValidation.validateConfig({
            logic: logicTypes[state.logicType],
            title: document.getElementById('level-title').value.trim(),
            mission: document.getElementById('level-mission').value.trim(),
            instruction: document.getElementById('level-instruction').value.trim(),
            items: state.selectedItems,
            conditions: deriveConditions(),
            actions: getActions(),
            rules: state.rules,
            defaultBehavior: state.logicType === 'if' ? defaultBehavior() : null
        }, state.rules);
    }

    function updateSubmitState() {
        const button = document.getElementById('submit-work');
        const valid = validateCurrent().ok;
        button.disabled = !(valid && state.tested);
    }

    function deriveConditions() {
        const map = new Map();
        state.selectedItems
            .filter((itemData) => !itemData.isDecoy)
            .filter((itemData) => state.logicType !== 'if' || itemData.correctAction !== defaultPassAction())
            .forEach((itemData) => {
            if (!map.has(itemData.conditionId)) {
                map.set(itemData.conditionId, {
                    id: itemData.conditionId,
                    label: itemData.conditionLabel,
                    type: 'match',
                    props: itemData.conditionProps,
                    match: itemData.conditionProps
                });
            }
        });
        return Array.from(map.values());
    }

    function getActions() {
        const actions = actionsByTheme[logicTypes[state.logicType].theme] || actionsByTheme.vegetables;
        if (state.logicType !== 'if') return actions;
        return actions.filter((actionItem) => actionItem.id !== defaultPassAction());
    }

    function getSelectableActions() {
        const actions = actionsByTheme[logicTypes[state.logicType].theme] || actionsByTheme.vegetables;
        if (state.logicType === 'if') {
            const passAction = actions.find((actionItem) => actionItem.id === defaultPassAction()) || {
                id: defaultPassAction(),
                label: defaultBehavior().label,
                destination: defaultBehavior().label,
                icon: '➡️'
            };
            return [passAction, ...actions.filter((actionItem) => actionItem.id !== defaultPassAction())];
        }
        return actions;
    }

    function makeRuleSlots(defaultSlots, existingRules) {
        return defaultSlots.map((slot, index) => {
            const existing = existingRules?.[index] || {};
            const type = slot.type;
            return {
                type,
                condition: type === 'else' ? 'else' : (existing.condition || slot.condition || null),
                action: existing.action || slot.action || null
            };
        });
    }

    function actionForCondition(condition) {
        const match = state.selectedItems.find((itemData) => !itemData.isDecoy && itemData.conditionId === condition.id);
        return match?.correctAction || getActions()[0]?.id || null;
    }

    function buildEvaluationConfig() {
        return {
            logic_type: state.logicType,
            mode: logicTypes[state.logicType].mode || null,
            default_behavior: state.logicType === 'if' ? defaultBehavior() : null
        };
    }

    function defaultBehavior() {
        return logicTypes[state.logicType].defaultBehavior || { type: 'pass_through', label: 'ปล่อยผ่านอัตโนมัติ' };
    }

    function defaultPassAction() {
        const behavior = defaultBehavior();
        return behavior.type || behavior.id || 'pass_through';
    }

    function initialCorrectAction(itemData) {
        const defaultAction = normalizeSavedAction(itemData.defaultAction);
        return state.logicType === 'if' && defaultAction === 'pass'
            ? defaultPassAction()
            : defaultAction;
    }

    function mostCommonActionForElse() {
        const counts = new Map();
        const elseItems = state.selectedItems.filter((itemData) => itemData.isDecoy);
        (elseItems.length ? elseItems : state.selectedItems).forEach((itemData) => {
            counts.set(itemData.correctAction, (counts.get(itemData.correctAction) || 0) + 1);
        });
        return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || getActions().at(-1)?.id || null;
    }

    function showItemDetail(itemData, showAnswers) {
        const modal = new bootstrap.Modal(document.getElementById('itemDetailModal'));
        document.getElementById('item-detail-title').textContent = itemData.label;
        const actionLabel = itemData.correctAction === defaultPassAction()
            ? defaultBehavior().label
            : (getActions().find((actionItem) => actionItem.id === itemData.correctAction)?.label || itemData.correctAction);
        document.getElementById('item-detail-body').innerHTML = `
            <div class="text-center display-4 mb-2">${escapeHtml(itemData.fallbackIcon)}</div>
            <div class="detail-props">
                ${itemData.propsDisplay.map((prop) => `<span>${escapeHtml(prop)}</span>`).join('')}
            </div>
            <p class="mb-2"><strong>สถานะก่อนเล่น:</strong> ${itemData.isDecoy ? 'วัตถุนี้อาจเป็นตัวหลอก ลองสังเกตคุณสมบัติให้ดี' : 'วัตถุหลักของด่าน ลองจับคู่กับเงื่อนไข'}</p>
            ${showAnswers ? `
                <hr>
                <p class="mb-2"><strong>${itemData.correctAction === defaultPassAction() ? 'สถานะเงื่อนไข' : 'เงื่อนไขที่เกี่ยวข้อง'}:</strong> ${escapeHtml(itemData.correctAction === defaultPassAction() ? 'ไม่เข้าเงื่อนไขพิเศษ' : itemData.conditionLabel)}</p>
                <p class="mb-2"><strong>ผลลัพธ์ที่ถูกต้อง:</strong> ${escapeHtml(actionLabel)}</p>
                <p class="mb-0 text-secondary">${escapeHtml(itemData.explain || '')}</p>
            ` : '<p class="mb-0 text-secondary">เฉลยปลายทางจะแสดงหลังทดลองเล่น</p>'}
        `;
        modal.show();
    }

    function showValidationMessage(message, type) {
        const box = document.getElementById('validation-box');
        box.classList.toggle('has-errors', type === 'error');
        box.classList.toggle('is-ready', type === 'success');
        box.textContent = message;
        window.setTimeout(renderValidation, 1200);
    }

    function action(id, label, destination, icon) {
        return { id, label, destination, icon };
    }

    function item(id, theme, label, fallbackIcon, props, propsDisplay, conditionId, conditionLabel, conditionProps, defaultAction) {
        return {
            id,
            theme,
            label,
            fallbackIcon,
            props,
            propsDisplay,
            conditionId,
            conditionLabel,
            conditionProps,
            defaultAction
        };
    }

    function normalizeSavedAction(actionId) {
        const aliases = {
            pass: 'pass_through',
            sell_front: 'storefront',
            ripen_room: 'ripening_room',
            juice_process: 'process_juice',
            premium_tray: 'premium_egg_tray',
            standard_tray: 'standard_egg_tray',
            reject_tray: 'reject_bin',
            premium_yarn: 'premium_wool_roll',
            cleaning_machine: 'wool_cleaning_machine',
            recycle_bin: 'wool_recycle_bin',
            bottle_ready: 'milk_bottling',
            cooling_room: 'cool_room',
            discard_milk: 'reject_bin',
            clean_station: 'wool_cleaning_machine'
        };
        return aliases[actionId] || actionId;
    }

    function getBoardPoint(selector, boardEl) {
        const boardRect = boardEl.getBoundingClientRect();
        if (selector === 'start') {
            return {
                x: Math.max(36, boardRect.width * 0.08),
                y: Math.max(36, boardRect.height - 42)
            };
        }
        const target = boardEl.querySelector(selector);
        if (!target) {
            return {
                x: boardRect.width * 0.92,
                y: Math.max(36, boardRect.height - 42)
            };
        }
        const targetRect = target.getBoundingClientRect();
        return {
            x: targetRect.left + targetRect.width / 2 - boardRect.left,
            y: Math.min(targetRect.top + targetRect.height / 2 - boardRect.top, boardRect.height - 42)
        };
    }

    function setTokenPoint(token, point) {
        token.style.left = `${point.x}px`;
        token.style.top = `${point.y}px`;
    }

    function cssEscape(value) {
        if (window.CSS?.escape) return window.CSS.escape(String(value));
        return String(value).replace(/["\\]/g, '\\$&');
    }

    function makeExplain(itemData, actionId) {
        const actionLabel = actionId === defaultPassAction()
            ? defaultBehavior().label
            : (getActions().find((actionItem) => actionItem.id === actionId)?.label || actionId);
        const decoyText = itemData.isDecoy ? ' เป็นตัวหลอกหรือกลุ่มอื่นที่ต้องระวัง' : '';
        if (actionId === defaultPassAction()) {
            return `${itemData.label}${decoyText} ไม่เข้าเงื่อนไขพิเศษ จึงควร${actionLabel}`;
        }
        return `${itemData.label}${decoyText} เข้าเงื่อนไขพิเศษ จึงควร${actionLabel}`;
    }

    function labelOf(list, id, fallback) {
        const found = (list || []).find((itemData) => itemData.id === id);
        return found ? found.label : (fallback || id || '');
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function uid() {
        return `sf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function starsFor(accuracy) {
        if (accuracy >= .9) return 3;
        if (accuracy >= .75) return 2;
        if (accuracy >= .6) return 1;
        return 0;
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[char]));
    }
})();
