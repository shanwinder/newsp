// Stage 7: Smart Farm Manager - Vegetable Produce with If.
(function () {
    const config = {
        title: 'บทที่ 3: ผู้จัดการฟาร์มอัจฉริยะ',
        subtitle: 'เกมที่ 1: โรงคัดผักสวนครัว | ฝึกใช้ If เท่านั้น',
        resultText: 'คุณเขียนกฎ If เพื่อคัดแยกผลผลิตจากพืชผักครบทั้ง 3 ภารกิจแล้ว',
        levels: [
            {
                title: '7-1 แครอทเปื้อนโคลน',
                mission: 'คัดแครอทเปื้อนโคลนไปล้างน้ำก่อนลงตะกร้า',
                brief: 'ถ้าเป็นแครอทเปื้อนโคลนให้ส่งเข้าเครื่องล้าง ส่วนแครอทอื่นปล่อยผ่านอัตโนมัติ',
                intro: 'ใช้กฎ If เพียงบรรทัดเดียว: ถ้าเจอแครอทเปื้อนโคลน ให้ส่งเข้าเครื่องล้าง',
                lessonType: 'if',
                lessonTypeLabel: 'If',
                logicType: 'if',
                mode: 'single_action_if',
                defaultBehavior: { type: 'pass_through', label: 'ปล่อยผ่านอัตโนมัติ', successText: 'ไม่เข้าเงื่อนไขพิเศษ จึงปล่อยผ่านไปตามสายพานหลัก' },
                theme: 'vegetable',
                hint: 'ถ้า [แครอทเปื้อนโคลน] -> [ส่งเข้าเครื่องล้าง]',
                ruleSlots: [{ type: 'if' }],
                conditions: [
                    { id: 'muddy_carrot', label: 'แครอทเปื้อนโคลน', match: { type: 'carrot', muddy: true } }
                ],
                actions: [
                    { id: 'wash', label: 'ส่งเข้าเครื่องล้าง', successText: 'เครื่องล้างพ่นน้ำ แครอทสะอาดเด้งลงตะกร้า' }
                ],
                toolboxDecoys: {
                    conditions: [
                        { id: 'dark_carrot', label: 'แครอทสีเข้ม', match: { type: 'carrot', color: 'dark_orange' } },
                        { id: 'carrot_dust_tip', label: 'แครอทมีดินติดปลาย', match: { type: 'carrot', mark: 'dust_tip' } }
                    ],
                    actions: [
                        { id: 'wash_for_color', label: 'ส่งเข้าเครื่องล้างเพราะสีเข้ม', routeSlot: 'a', successText: 'เครื่องล้างทำงานตามกฎสีเข้ม' },
                        { id: 'hold_for_shadow', label: 'พักไว้ตรวจเงาอีกครั้ง', routeSlot: 'a', successText: 'พักรายการไว้ตรวจซ้ำ' }
                    ]
                },
                machines: [
                    { slot: 'a', label: 'เครื่องล้าง', icon: '🚿', actions: ['wash'] }
                ],
                itemQueue: [
                    carrot('A', 'muddy'), carrot('B', 'clean'), carrot('C', 'dark_decoy'), carrot('D', 'muddy'),
                    carrot('E', 'dust_tip_decoy'), carrot('F', 'clean'), carrot('G', 'muddy'), carrot('H', 'shadow_decoy'),
                    carrot('I', 'clean'), carrot('J', 'muddy'), carrot('K', 'dark_decoy'), carrot('L', 'clean')
                ],
                expectedLogic: [{ condition: 'muddy_carrot', action: 'wash' }],
                scoring: defaultScoring()
            },
            {
                title: '7-2 ผักกาดมีหนอน',
                mission: 'ส่งผักกาดที่มีหนอนไปโต๊ะตรวจศัตรูพืช',
                brief: 'ถ้าผักกาดมีหนอนให้ส่งตรวจ ส่วนจุดดิน รูใบ และใบงอที่ไม่พบหนอนให้ปล่อยผ่าน',
                intro: 'ยังใช้ If เท่านั้น แต่ต้องดูว่าเงื่อนไขคือมีหนอนจริง ไม่ใช่แค่ผักดูไม่สมบูรณ์',
                lessonType: 'if',
                lessonTypeLabel: 'If',
                logicType: 'if',
                mode: 'single_action_if',
                defaultBehavior: { type: 'pass_through', label: 'ปล่อยผ่านอัตโนมัติ', successText: 'ไม่เข้าเงื่อนไขมีหนอน จึงปล่อยผ่านไปตามสายพานหลัก' },
                theme: 'vegetable',
                hint: 'ถ้า [ผักกาดมีหนอน] -> [ส่งไปโต๊ะตรวจศัตรูพืช]',
                ruleSlots: [{ type: 'if' }],
                conditions: [
                    { id: 'lettuce_has_worm', label: 'ผักกาดมีหนอน', match: { type: 'lettuce', hasWorm: true } }
                ],
                actions: [
                    { id: 'pest_table', label: 'ส่งไปโต๊ะตรวจศัตรูพืช', successText: 'แว่นขยายตรวจพบหนอนและแยกผักออกทันที' }
                ],
                toolboxDecoys: {
                    conditions: [
                        { id: 'lettuce_has_dirt', label: 'ผักกาดมีจุดดิน', match: { type: 'lettuce', dirt: true } },
                        { id: 'lettuce_has_holes', label: 'ผักกาดมีรูเล็ก ๆ', match: { type: 'lettuce', holes: true } }
                    ],
                    actions: [
                        { id: 'inspect_all_rough_leaves', label: 'ส่งผักที่ดูไม่สมบูรณ์ไปตรวจ', routeSlot: 'a', successText: 'โต๊ะตรวจรับผักที่ดูผิดปกติ' },
                        { id: 'wash_leaf_dirt', label: 'ส่งไปล้างจุดดิน', routeSlot: 'a', successText: 'ผักถูกส่งไปล้างจุดดิน' }
                    ]
                },
                machines: [
                    { slot: 'a', label: 'โต๊ะตรวจศัตรูพืช', icon: '🔎', actions: ['pest_table'] }
                ],
                itemQueue: [
                    lettuce('A', 'worm'), lettuce('B', 'normal'), lettuce('C', 'dirt_decoy'), lettuce('D', 'worm'),
                    lettuce('E', 'holes_decoy'), lettuce('F', 'normal'), lettuce('G', 'curled_decoy'), lettuce('H', 'worm'),
                    lettuce('I', 'dirt_decoy'), lettuce('J', 'normal'), lettuce('K', 'worm'), lettuce('L', 'holes_decoy')
                ],
                expectedLogic: [{ condition: 'lettuce_has_worm', action: 'pest_table' }],
                scoring: defaultScoring()
            },
            {
                title: '7-3 มันฝรั่งงอก',
                mission: 'แยกมันฝรั่งที่มีหน่องอกออกจากมันฝรั่งปกติ',
                brief: 'ถ้ามีหน่องอกให้ส่งไปคัดแยกพิเศษ สิ่งที่แค่เปื้อนดินหรือรูปร่างแปลกยังไม่ใช่เงื่อนไข',
                intro: 'ด่าน If ที่ละเอียดขึ้น ต้องสังเกตเฉพาะหน่องอก ไม่ตัดสินจากสีหรือรูปร่าง',
                lessonType: 'if',
                lessonTypeLabel: 'If',
                logicType: 'if',
                mode: 'single_action_if',
                defaultBehavior: { type: 'pass_through', label: 'ปล่อยผ่านอัตโนมัติ', successText: 'ไม่พบหน่องอก จึงปล่อยผ่านไปตามสายพานหลัก' },
                theme: 'vegetable',
                hint: 'ถ้า [มันฝรั่งมีหน่องอก] -> [ส่งไปคัดแยกพิเศษ]',
                ruleSlots: [{ type: 'if' }],
                conditions: [
                    { id: 'sprouted_potato', label: 'มันฝรั่งมีหน่องอก', match: { type: 'potato', sprout: true } }
                ],
                actions: [
                    { id: 'special_sort', label: 'ส่งไปคัดแยกพิเศษ', successText: 'ประตูพิเศษเปิดและแยกมันฝรั่งงอกออกจากตะกร้าปกติ' }
                ],
                toolboxDecoys: {
                    conditions: [
                        { id: 'dirty_potato', label: 'มันฝรั่งเปื้อนดิน', match: { type: 'potato', dirty: true } },
                        { id: 'potato_dark_spot', label: 'มันฝรั่งมีจุดสีเข้ม', match: { type: 'potato', darkSpot: true } }
                    ],
                    actions: [
                        { id: 'sort_odd_shape', label: 'คัดแยกเพราะรูปร่างแปลก', routeSlot: 'a', successText: 'ประตูพิเศษเปิดเพราะรูปร่างแปลก' },
                        { id: 'wash_potato_dirt', label: 'ส่งไปล้างดิน', routeSlot: 'a', successText: 'มันฝรั่งถูกส่งไปล้างดิน' }
                    ]
                },
                machines: [
                    { slot: 'a', label: 'คัดแยกพิเศษ', icon: '⚠️', actions: ['special_sort'] }
                ],
                itemQueue: [
                    potato('A', 'sprouted'), potato('B', 'normal'), potato('C', 'dirty_decoy'), potato('D', 'odd_decoy'),
                    potato('E', 'sprouted'), potato('F', 'dark_spot_decoy'), potato('G', 'normal'), potato('H', 'sprouted'),
                    potato('I', 'dirty_decoy'), potato('J', 'normal'), potato('K', 'sprouted'), potato('L', 'dark_spot_decoy')
                ],
                expectedLogic: [{ condition: 'sprouted_potato', action: 'special_sort' }],
                scoring: defaultScoring()
            }
        ]
    };

    function defaultScoring() {
        return {
            oneStarAccuracy: 0.6,
            twoStarAccuracy: 0.75,
            threeStarAccuracy: 0.9,
            maxDamagedForThreeStars: 1,
            passAccuracy: 0.6
        };
    }

    function asset(key, description) {
        // ASSET NOTE:
        // ตอนนี้ใช้ fallbackIcon เพื่อให้ prototype ทำงานได้ทันที
        // ในอนาคตสามารถเปลี่ยนเป็น PNG หรือ Sprite Sheet ได้โดยแก้เฉพาะ levelConfig.asset
        // ห้ามผูก logic กับ emoji โดยตรง เพราะ emoji เป็นเพียง fallback ด้านการแสดงผล
        // item ทุกชิ้นควรมี asset.path, width, height, description และ futureSpriteSheet
        return {
            key,
            path: `../assets/img/conveyor/vegetables/${key}.png`,
            width: 96,
            height: 96,
            description,
            futureSpriteSheet: {
                path: `../assets/img/conveyor/vegetables/${key}_sheet.png`,
                frameWidth: 96,
                frameHeight: 96,
                animations: ['idle', 'scan', 'route_result']
            }
        };
    }

    function makeItem({ id, key, label, icon, props, expectedAction, sensor, feedback, isDecoy = false, decoyReason = '', inspect }) {
        return {
            id,
            key,
            label,
            category: 'vegetable_produce',
            fallbackIcon: icon,
            isDecoy,
            decoyReason,
            asset: asset(key, `ภาพ${label}สำหรับด่านผักสวนครัว`),
            inspect,
            props,
            sensor,
            expectedAction,
            matchesCondition: expectedAction !== 'pass_through',
            correctResult: expectedAction,
            feedback
        };
    }

    function carrot(id, variant) {
        const data = {
            muddy: {
                label: 'แครอทเปื้อนโคลน', props: { type: 'carrot', muddy: true, color: 'orange', mark: 'mud' }, expectedAction: 'wash',
                sensor: 'เครื่องสแกนพบคราบโคลนบนแครอท', feedback: 'แครอทเปื้อนโคลนควรเข้าเครื่องล้าง',
                properties: ['ชนิด: แครอท', 'คราบโคลน: มี', 'สีเข้ม: ไม่ใช่ข้อมูลหลัก'], hint: 'เงื่อนไขของด่านนี้คือคราบโคลนจริง'
            },
            clean: {
                label: 'แครอทสะอาด', props: { type: 'carrot', muddy: false, color: 'orange', mark: 'none' }, expectedAction: 'pass_through',
                sensor: 'แครอทสะอาด ไม่มีคราบโคลน', feedback: 'แครอทสะอาดควรปล่อยผ่าน',
                properties: ['ชนิด: แครอท', 'คราบโคลน: ไม่มี', 'สถานะ: ลงตะกร้าได้'], hint: 'ไม่เข้าเงื่อนไข If จึงปล่อยผ่านอัตโนมัติ'
            },
            dark_decoy: {
                label: 'แครอทสีเข้ม', props: { type: 'carrot', muddy: false, color: 'dark_orange', mark: 'none' }, expectedAction: 'pass_through',
                sensor: 'สีแครอทเข้ม แต่ไม่พบคราบโคลน', feedback: 'สีเข้มไม่ใช่คราบโคลน',
                isDecoy: true, decoyReason: 'แครอทชิ้นนี้สีเข้ม แต่ไม่ได้มีคราบโคลนจริง จึงไม่ต้องส่งเข้าเครื่องล้าง',
                properties: ['ชนิด: แครอท', 'สี: เข้ม', 'คราบโคลน: ไม่มี'], hint: 'อย่าสับสนระหว่างสีเข้มกับคราบโคลน'
            },
            dust_tip_decoy: {
                label: 'แครอทมีดินติดปลาย', props: { type: 'carrot', muddy: false, color: 'orange', mark: 'dust_tip' }, expectedAction: 'pass_through',
                sensor: 'มีดินติดปลายเล็กน้อย ยังไม่ถือว่าเปื้อนโคลน', feedback: 'ดินปลายเล็กน้อยไม่ตรงเงื่อนไขเปื้อนโคลน',
                isDecoy: true, decoyReason: 'แครอทมีดินติดปลายเล็กน้อย แต่ไม่ถือว่าเปื้อนโคลนทั้งชิ้น จึงควรปล่อยผ่าน',
                properties: ['ชนิด: แครอท', 'ดินติดปลาย: เล็กน้อย', 'คราบโคลน: ไม่มี'], hint: 'ต้องมีคราบโคลนชัดเจนจึงเข้าเงื่อนไข'
            },
            shadow_decoy: {
                label: 'แครอทมีเงาสีน้ำตาล', props: { type: 'carrot', muddy: false, color: 'orange', mark: 'shadow' }, expectedAction: 'pass_through',
                sensor: 'เงาสีน้ำตาลจากแสง ไม่ใช่คราบโคลน', feedback: 'เงาจากแสงไม่ควรถูกส่งไปล้าง',
                isDecoy: true, decoyReason: 'แครอทมีเงาสีน้ำตาลจากแสง ไม่ใช่คราบโคลนจริง จึงควรปล่อยผ่าน',
                properties: ['ชนิด: แครอท', 'รอยที่เห็น: เงาจากแสง', 'คราบโคลน: ไม่มี'], hint: 'ดูว่ารอยนั้นเป็นคราบจริงหรือแค่เงา'
            }
        }[variant];
        return makeItem({
            id: `carrot_${variant}_${id}`,
            key: `carrot_${variant}`,
            icon: '🥕',
            inspect: { title: data.label, properties: data.properties, hint: data.hint, warning: data.isDecoy ? 'ตัวหลอก: ดูคล้ายเข้าเงื่อนไขแต่ยังไม่ใช่คราบโคลนจริง' : '' },
            ...data
        });
    }

    function lettuce(id, variant) {
        const data = {
            worm: {
                label: 'ผักกาดมีหนอน', props: { type: 'lettuce', hasWorm: true, dirt: false, holes: true }, expectedAction: 'pest_table',
                sensor: 'พบหนอนขยับอยู่บนใบผักกาด', feedback: 'ผักกาดมีหนอนต้องไปโต๊ะตรวจศัตรูพืช',
                properties: ['ชนิด: ผักกาด', 'หนอน: พบ', 'สถานะ: ต้องตรวจศัตรูพืช'], hint: 'ถ้าเห็นหนอนจริง ให้ใช้กฎ If'
            },
            normal: {
                label: 'ผักกาดปกติ', props: { type: 'lettuce', hasWorm: false, dirt: false, holes: false }, expectedAction: 'pass_through',
                sensor: 'ผักกาดปกติ ไม่พบหนอน', feedback: 'ผักกาดปกติควรปล่อยผ่าน',
                properties: ['ชนิด: ผักกาด', 'หนอน: ไม่พบ', 'สถานะ: ลงตะกร้าได้'], hint: 'ไม่เข้าเงื่อนไขจึงปล่อยผ่านอัตโนมัติ'
            },
            dirt_decoy: {
                label: 'ผักกาดมีจุดดิน', props: { type: 'lettuce', hasWorm: false, dirt: true, holes: false }, expectedAction: 'pass_through',
                sensor: 'พบจุดดิน แต่ไม่พบหนอน', feedback: 'จุดดินไม่ใช่หนอน',
                isDecoy: true, decoyReason: 'ผักกาดมีจุดดิน แต่เงื่อนไขคือมีหนอน จึงไม่ต้องส่งไปโต๊ะตรวจศัตรูพืช',
                properties: ['ชนิด: ผักกาด', 'จุดดิน: มี', 'หนอน: ไม่พบ'], hint: 'ด่านนี้ตรวจหนอน ไม่ได้ตรวจความสกปรก'
            },
            holes_decoy: {
                label: 'ผักกาดมีรูเล็ก ๆ', props: { type: 'lettuce', hasWorm: false, dirt: false, holes: true }, expectedAction: 'pass_through',
                sensor: 'มีรูเล็ก ๆ บนใบ แต่ไม่พบหนอน', feedback: 'รูใบอย่างเดียวไม่พอ ต้องพบหนอน',
                isDecoy: true, decoyReason: 'ผักกาดมีรูเล็ก ๆ แต่ไม่พบหนอนจริง จึงควรปล่อยผ่าน',
                properties: ['ชนิด: ผักกาด', 'รูบนใบ: มี', 'หนอน: ไม่พบ'], hint: 'ต้องสังเกตว่ามีตัวหนอนหรือไม่'
            },
            curled_decoy: {
                label: 'ผักกาดใบงอ', props: { type: 'lettuce', hasWorm: false, dirt: false, holes: false, curled: true }, expectedAction: 'pass_through',
                sensor: 'ใบผักกาดงอ แต่ไม่มีศัตรูพืช', feedback: 'ใบงอไม่ใช่เงื่อนไขมีหนอน',
                isDecoy: true, decoyReason: 'ผักกาดใบงอแต่ไม่มีหนอน จึงไม่ควรส่งไปตรวจเกินจำเป็น',
                properties: ['ชนิด: ผักกาด', 'ใบงอ: มี', 'หนอน: ไม่พบ'], hint: 'อย่าตัดสินจากผักดูไม่สมบูรณ์เพียงอย่างเดียว'
            }
        }[variant];
        return makeItem({
            id: `lettuce_${variant}_${id}`,
            key: `lettuce_${variant}`,
            icon: variant === 'worm' ? '🐛' : '🥬',
            inspect: { title: data.label, properties: data.properties, hint: data.hint, warning: data.isDecoy ? 'ตัวหลอก: ดูเหมือนมีปัญหา แต่ยังไม่ใช่เงื่อนไขมีหนอน' : '' },
            ...data
        });
    }

    function potato(id, variant) {
        const data = {
            sprouted: {
                label: 'มันฝรั่งมีหน่องอก', props: { type: 'potato', sprout: true, dirty: false, shape: 'normal' }, expectedAction: 'special_sort',
                sensor: 'กรอบขยายพบหน่อเล็ก ๆ โผล่จากมันฝรั่ง', feedback: 'มันฝรั่งมีหน่องอกต้องคัดแยกพิเศษ',
                properties: ['ชนิด: มันฝรั่ง', 'หน่องอก: มี', 'สถานะ: ต้องคัดแยกพิเศษ'], hint: 'มองหาหน่อที่โผล่ออกมา'
            },
            normal: {
                label: 'มันฝรั่งปกติ', props: { type: 'potato', sprout: false, dirty: false, shape: 'normal' }, expectedAction: 'pass_through',
                sensor: 'มันฝรั่งปกติ ไม่พบหน่องอก', feedback: 'มันฝรั่งปกติควรปล่อยผ่าน',
                properties: ['ชนิด: มันฝรั่ง', 'หน่องอก: ไม่มี', 'สถานะ: ลงตะกร้าได้'], hint: 'ไม่มีหน่องอกจึงไม่เข้าเงื่อนไข If'
            },
            dirty_decoy: {
                label: 'มันฝรั่งเปื้อนดิน', props: { type: 'potato', sprout: false, dirty: true, shape: 'normal' }, expectedAction: 'pass_through',
                sensor: 'มีดินติดผิว แต่ไม่พบหน่องอก', feedback: 'ดินติดผิวไม่ใช่หน่องอก',
                isDecoy: true, decoyReason: 'มันฝรั่งเปื้อนดิน แต่ไม่มีหน่องอก จึงไม่ต้องส่งไปคัดแยกพิเศษ',
                properties: ['ชนิด: มันฝรั่ง', 'ดินติดผิว: มี', 'หน่องอก: ไม่มี'], hint: 'แยกดินออกจากหน่องอกให้ได้'
            },
            odd_decoy: {
                label: 'มันฝรั่งรูปร่างบิดเบี้ยว', props: { type: 'potato', sprout: false, dirty: false, shape: 'odd' }, expectedAction: 'pass_through',
                sensor: 'รูปร่างบิดเบี้ยว แต่ไม่มีหน่องอก', feedback: 'รูปร่างแปลกไม่ใช่เงื่อนไขของด่านนี้',
                isDecoy: true, decoyReason: 'มันฝรั่งรูปร่างบิดเบี้ยว แต่ไม่มีหน่องอก จึงควรปล่อยผ่าน',
                properties: ['ชนิด: มันฝรั่ง', 'รูปร่าง: บิดเบี้ยว', 'หน่องอก: ไม่มี'], hint: 'เงื่อนไขไม่เกี่ยวกับรูปร่าง'
            },
            dark_spot_decoy: {
                label: 'มันฝรั่งมีจุดสีเข้ม', props: { type: 'potato', sprout: false, dirty: false, shape: 'normal', darkSpot: true }, expectedAction: 'pass_through',
                sensor: 'พบจุดสีเข้ม แต่ไม่พบหน่องอก', feedback: 'จุดสีเข้มไม่ใช่หน่องอก',
                isDecoy: true, decoyReason: 'มันฝรั่งมีจุดสีเข้ม แต่ไม่มีหน่องอก จึงไม่ควรคัดแยกพิเศษ',
                properties: ['ชนิด: มันฝรั่ง', 'จุดสีเข้ม: มี', 'หน่องอก: ไม่มี'], hint: 'ต้องเห็นหน่อ ไม่ใช่แค่จุดบนผิว'
            }
        }[variant];
        return makeItem({
            id: `potato_${variant}_${id}`,
            key: `potato_${variant}`,
            icon: '🥔',
            inspect: { title: data.label, properties: data.properties, hint: data.hint, warning: data.isDecoy ? 'ตัวหลอก: คล้ายผิดปกติ แต่ไม่ใช่มันฝรั่งงอก' : '' },
            ...data
        });
    }

    function boot() {
        window.FarmMissions.conveyorLogic(config);
    }

    if (window.FarmMissions && window.FarmMissions.conveyorLogic) {
        boot();
    } else {
        const script = document.createElement('script');
        script.src = '../assets/js/logic_game/conveyor_logic_base.js';
        script.onload = boot;
        document.head.appendChild(script);
    }
})();
