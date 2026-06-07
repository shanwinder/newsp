// Stage 10: Smart Farm Debug Mode - repair IF rules from stage 7.
(function () {
    const passThrough = { type: 'pass_through', label: 'ปล่อยผ่านอัตโนมัติ', successText: 'ไม่เข้าเงื่อนไขพิเศษ จึงปล่อยผ่านไปตามสายพานหลัก' };

    const config = {
        stageId: 10,
        mode: 'debug',
        sourceStage: 7,
        title: 'บทที่ 4: ตรวจสอบและแก้ไขข้อผิดพลาด',
        subtitle: 'ซ่อมกฎฟาร์มอัจฉริยะ: ซ่อมกฎ IF',
        resultText: 'คุณซ่อมกฎ IF ของโรงคัดผักครบทั้ง 3 ภารกิจแล้ว',
        levels: [
            {
                id: '10-1',
                stageId: 10,
                title: '10-1 แครอทเปื้อนโคลน',
                mission: 'ระบบล้างแครอททำงานผิด เพราะดูจากสีแทนที่จะดูคราบโคลน',
                brief: 'ซ่อมกฎให้ล้างเฉพาะแครอทที่เปื้อนโคลน',
                intro: 'กฎเดิมถูกวางไว้แล้ว ลองทดสอบก่อนว่าผลผลิตชิ้นไหนถูกส่งผิดทาง',
                lessonType: 'if',
                lessonTypeLabel: 'IF',
                logicType: 'if',
                mode: 'single_action_if',
                theme: 'vegetable',
                defaultBehavior: passThrough,
                debugGoal: 'แก้เงื่อนไขให้ระบบล้างเฉพาะแครอทที่เปื้อนโคลน',
                bugType: 'wrong_condition',
                suspiciousBlocks: ['condition'],
                successFeedback: 'ถูกต้อง! ระบบควรตรวจว่าแครอทเปื้อนโคลนหรือไม่ ไม่ใช่ดูจากสีเข้มอย่างเดียว',
                hint: 'ถ้า [แครอทเปื้อนโคลน] -> [ส่งเข้าเครื่องล้าง]',
                ruleSlots: [{ type: 'if' }],
                brokenLogic: [{ type: 'if', condition: 'dark_carrot', action: 'wash' }],
                expectedLogic: [{ type: 'if', condition: 'muddy_carrot', action: 'wash' }],
                debugReport: {
                    title: 'พบข้อผิดพลาดในระบบล้างแครอท',
                    summary: 'ระบบตรวจจากสีเข้ม แทนที่จะตรวจว่าเปื้อนโคลนหรือไม่',
                    hints: [
                        'ลองดูว่าแครอทที่ควรล้างมีลักษณะอะไร',
                        'สีเข้มกับเปื้อนโคลนเป็นสิ่งเดียวกันหรือไม่',
                        'ควรเปลี่ยนเงื่อนไขเป็นแครอทเปื้อนโคลน'
                    ]
                },
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
                        { id: 'hold_for_shadow', label: 'พักไว้ตรวจเงาอีกครั้ง', routeSlot: 'a', successText: 'พักรายการไว้ตรวจซ้ำ' }
                    ]
                },
                machines: [{ slot: 'a', label: 'เครื่องล้าง', icon: '🚿', actions: ['wash'] }],
                itemQueue: [
                    item('carrot_muddy_a', 'แครอทเปื้อนโคลน', '🥕', { type: 'carrot', muddy: true, color: 'orange', mark: 'mud' }, 'wash', 'เครื่องสแกนพบคราบโคลนบนแครอท', 'แครอทเปื้อนโคลนควรเข้าเครื่องล้าง'),
                    item('carrot_clean_a', 'แครอทสะอาด', '🥕', { type: 'carrot', muddy: false, color: 'orange', mark: 'none' }, 'pass_through', 'แครอทสะอาด ไม่มีคราบโคลน', 'แครอทสะอาดควรปล่อยผ่าน'),
                    item('carrot_dark_a', 'แครอทสีเข้ม', '🥕', { type: 'carrot', muddy: false, color: 'dark_orange', mark: 'none' }, 'pass_through', 'สีแครอทเข้ม แต่ไม่พบคราบโคลน', 'สีเข้มไม่ใช่คราบโคลน', true, 'แครอทชิ้นนี้สีเข้ม แต่ไม่ได้มีคราบโคลนจริง จึงไม่ต้องส่งเข้าเครื่องล้าง'),
                    item('carrot_muddy_b', 'แครอทเปื้อนโคลน', '🥕', { type: 'carrot', muddy: true, color: 'orange', mark: 'mud' }, 'wash', 'เครื่องสแกนพบคราบโคลนบนแครอท', 'แครอทเปื้อนโคลนควรเข้าเครื่องล้าง'),
                    item('carrot_dust_a', 'แครอทมีดินติดปลาย', '🥕', { type: 'carrot', muddy: false, color: 'orange', mark: 'dust_tip' }, 'pass_through', 'มีดินติดปลายเล็กน้อย ยังไม่ถือว่าเปื้อนโคลน', 'ดินปลายเล็กน้อยไม่ตรงเงื่อนไขเปื้อนโคลน', true, 'แครอทมีดินติดปลายเล็กน้อย แต่ไม่ถือว่าเปื้อนโคลนทั้งชิ้น จึงควรปล่อยผ่าน'),
                    item('carrot_dark_b', 'แครอทสีเข้ม', '🥕', { type: 'carrot', muddy: false, color: 'dark_orange', mark: 'none' }, 'pass_through', 'สีแครอทเข้ม แต่ไม่พบคราบโคลน', 'สีเข้มไม่ใช่คราบโคลน', true, 'สีเข้มเป็นตัวหลอก ไม่ใช่คราบโคลนจริง')
                ],
                scoring: strictScoring()
            },
            {
                id: '10-2',
                stageId: 10,
                title: '10-2 ผักกาดมีหนอน',
                mission: 'ระบบตรวจศัตรูพืชดูจากรูบนใบแทนที่จะตรวจว่ามีหนอนจริง',
                brief: 'ซ่อมกฎให้ส่งเฉพาะผักกาดที่มีหนอนไปโต๊ะตรวจ',
                intro: 'ทดสอบกฎเดิมก่อน แล้วดูว่ารูบนใบกับหนอนจริงให้ผลต่างกันอย่างไร',
                lessonType: 'if',
                lessonTypeLabel: 'IF',
                logicType: 'if',
                mode: 'single_action_if',
                theme: 'vegetable',
                defaultBehavior: passThrough,
                debugGoal: 'แก้เงื่อนไขให้ตรวจ “มีหนอน” โดยตรง',
                bugType: 'too_broad_condition',
                suspiciousBlocks: ['condition'],
                successFeedback: 'ถูกต้อง! รอยบนใบอาจเกิดจากหลายสาเหตุ แต่สิ่งที่ต้องตรวจจริงคือมีหนอนหรือไม่',
                hint: 'ถ้า [ผักกาดมีหนอน] -> [ส่งไปโต๊ะตรวจศัตรูพืช]',
                ruleSlots: [{ type: 'if' }],
                brokenLogic: [{ type: 'if', condition: 'lettuce_has_holes', action: 'pest_table' }],
                expectedLogic: [{ type: 'if', condition: 'lettuce_has_worm', action: 'pest_table' }],
                debugReport: {
                    title: 'พบข้อผิดพลาดในระบบตรวจผักกาด',
                    summary: 'ระบบใช้เงื่อนไขที่กว้างเกินไป คือมีรูเล็ก ๆ แทนที่จะตรวจว่ามีหนอนจริง',
                    hints: [
                        'ลองดูว่าผักกาดที่ต้องส่งตรวจมีสิ่งใดเหมือนกัน',
                        'รูบนใบอาจเกิดจากอย่างอื่น ไม่จำเป็นต้องมีหนอน',
                        'ควรเปลี่ยนเงื่อนไขเป็นผักกาดมีหนอน'
                    ]
                },
                conditions: [
                    { id: 'lettuce_has_worm', label: 'ผักกาดมีหนอน', match: { type: 'lettuce', hasWorm: true } }
                ],
                actions: [
                    { id: 'pest_table', label: 'ส่งไปโต๊ะตรวจศัตรูพืช', successText: 'โต๊ะตรวจพบหนอนและแยกผักออกทันที' }
                ],
                toolboxDecoys: {
                    conditions: [
                        { id: 'lettuce_has_holes', label: 'ผักกาดมีรูเล็ก ๆ', match: { type: 'lettuce', holes: true } },
                        { id: 'lettuce_has_dirt', label: 'ผักกาดมีจุดดิน', match: { type: 'lettuce', dirt: true } }
                    ],
                    actions: [
                        { id: 'wash_leaf_dirt', label: 'ส่งไปล้างจุดดิน', routeSlot: 'a', successText: 'ผักถูกส่งไปล้างจุดดิน' }
                    ]
                },
                machines: [{ slot: 'a', label: 'โต๊ะตรวจศัตรูพืช', icon: '🔎', actions: ['pest_table'] }],
                itemQueue: [
                    item('lettuce_worm_a', 'ผักกาดมีหนอน', '🐛', { type: 'lettuce', hasWorm: true, holes: true, dirt: false }, 'pest_table', 'พบหนอนบนใบผักกาด', 'ผักกาดมีหนอนควรส่งตรวจ'),
                    item('lettuce_normal_a', 'ผักกาดปกติ', '🥬', { type: 'lettuce', hasWorm: false, holes: false, dirt: false }, 'pass_through', 'ผักกาดปกติ ไม่พบหนอน', 'ผักกาดปกติควรปล่อยผ่าน'),
                    item('lettuce_holes_a', 'ผักกาดมีรูเล็ก ๆ', '🥬', { type: 'lettuce', hasWorm: false, holes: true, dirt: false }, 'pass_through', 'มีรูเล็ก ๆ แต่ไม่พบหนอน', 'รูใบอย่างเดียวไม่พอ ต้องพบหนอน', true, 'ผักกาดมีรูเล็ก ๆ แต่ไม่พบหนอนจริง จึงควรปล่อยผ่าน'),
                    item('lettuce_worm_b', 'ผักกาดมีหนอน', '🐛', { type: 'lettuce', hasWorm: true, holes: true, dirt: false }, 'pest_table', 'พบหนอนบนใบผักกาด', 'ผักกาดมีหนอนควรส่งตรวจ'),
                    item('lettuce_dirt_a', 'ผักกาดมีจุดดิน', '🥬', { type: 'lettuce', hasWorm: false, holes: false, dirt: true }, 'pass_through', 'พบจุดดิน แต่ไม่พบหนอน', 'จุดดินไม่ใช่หนอน', true, 'ผักกาดมีจุดดิน แต่เงื่อนไขคือมีหนอน จึงไม่ต้องส่งไปโต๊ะตรวจศัตรูพืช')
                ],
                scoring: strictScoring()
            },
            {
                id: '10-3',
                stageId: 10,
                title: '10-3 มันฝรั่งงอก',
                mission: 'ระบบเข้าใจว่ามันฝรั่งเปื้อนดินคือปัญหา ทั้งที่ต้องตรวจหน่องอก',
                brief: 'ซ่อมกฎให้คัดแยกมันฝรั่งที่มีหน่องอก',
                intro: 'ทดสอบกฎเดิมก่อน แล้วแยกให้ได้ว่าดินกับหน่องอกไม่ใช่เรื่องเดียวกัน',
                lessonType: 'if',
                lessonTypeLabel: 'IF',
                logicType: 'if',
                mode: 'single_action_if',
                theme: 'vegetable',
                defaultBehavior: passThrough,
                debugGoal: 'เปลี่ยนเงื่อนไขจาก “เปื้อนดิน” เป็น “มีหน่องอก”',
                bugType: 'wrong_condition',
                suspiciousBlocks: ['condition'],
                successFeedback: 'ถูกต้อง! มันฝรั่งเปื้อนดินยังล้างได้ แต่ถ้ามีหน่องอกต้องคัดแยกพิเศษ',
                hint: 'ถ้า [มันฝรั่งมีหน่องอก] -> [ส่งไปคัดแยกพิเศษ]',
                ruleSlots: [{ type: 'if' }],
                brokenLogic: [{ type: 'if', condition: 'dirty_potato', action: 'special_sort' }],
                expectedLogic: [{ type: 'if', condition: 'sprouted_potato', action: 'special_sort' }],
                debugReport: {
                    title: 'พบข้อผิดพลาดในระบบคัดมันฝรั่ง',
                    summary: 'ระบบตรวจดินติดผิว แทนที่จะตรวจหน่องอกที่เป็นปัญหาจริง',
                    hints: [
                        'ดูว่ามันฝรั่งแบบใดควรถูกคัดแยกพิเศษ',
                        'เปื้อนดินยังล้างได้ แต่หน่องอกต้องคัดแยก',
                        'ควรเปลี่ยนเงื่อนไขเป็นมันฝรั่งมีหน่องอก'
                    ]
                },
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
                        { id: 'wash_potato_dirt', label: 'ส่งไปล้างดิน', routeSlot: 'a', successText: 'มันฝรั่งถูกส่งไปล้างดิน' }
                    ]
                },
                machines: [{ slot: 'a', label: 'คัดแยกพิเศษ', icon: '⚠️', actions: ['special_sort'] }],
                itemQueue: [
                    item('potato_sprout_a', 'มันฝรั่งมีหน่องอก', '🥔', { type: 'potato', sprout: true, dirty: false, darkSpot: false }, 'special_sort', 'พบหน่อเล็ก ๆ โผล่จากมันฝรั่ง', 'มันฝรั่งมีหน่องอกต้องคัดแยกพิเศษ'),
                    item('potato_normal_a', 'มันฝรั่งปกติ', '🥔', { type: 'potato', sprout: false, dirty: false, darkSpot: false }, 'pass_through', 'มันฝรั่งปกติ ไม่พบหน่องอก', 'มันฝรั่งปกติควรปล่อยผ่าน'),
                    item('potato_dirty_a', 'มันฝรั่งเปื้อนดิน', '🥔', { type: 'potato', sprout: false, dirty: true, darkSpot: false }, 'pass_through', 'มีดินติดผิว แต่ไม่พบหน่องอก', 'ดินติดผิวไม่ใช่หน่องอก', true, 'มันฝรั่งเปื้อนดิน แต่ไม่มีหน่องอก จึงไม่ต้องส่งไปคัดแยกพิเศษ'),
                    item('potato_sprout_b', 'มันฝรั่งมีหน่องอก', '🥔', { type: 'potato', sprout: true, dirty: false, darkSpot: false }, 'special_sort', 'พบหน่อเล็ก ๆ โผล่จากมันฝรั่ง', 'มันฝรั่งมีหน่องอกต้องคัดแยกพิเศษ'),
                    item('potato_spot_a', 'มันฝรั่งมีจุดสีเข้ม', '🥔', { type: 'potato', sprout: false, dirty: false, darkSpot: true }, 'pass_through', 'พบจุดสีเข้ม แต่ไม่พบหน่องอก', 'จุดสีเข้มไม่ใช่หน่องอก', true, 'มันฝรั่งมีจุดสีเข้ม แต่ไม่มีหน่องอก จึงไม่ควรคัดแยกพิเศษ')
                ],
                scoring: strictScoring()
            }
        ]
    };

    function item(id, label, icon, props, expectedAction, sensor, feedback, isDecoy = false, decoyReason = '') {
        return {
            id,
            key: id,
            label,
            fallbackIcon: icon,
            props,
            expectedAction,
            correctResult: expectedAction,
            sensor,
            feedback,
            isDecoy,
            decoyReason,
            inspect: {
                title: label,
                properties: Object.entries(props).map(([key, value]) => `${key}: ${value === true ? 'ใช่' : value === false ? 'ไม่ใช่' : value}`),
                hint: feedback,
                warning: isDecoy ? 'ตัวหลอก: ดูคล้ายเข้าเงื่อนไข แต่ยังไม่ใช่ปัญหาจริงของด่านนี้' : ''
            }
        };
    }

    function strictScoring() {
        return {
            oneStarAccuracy: 1,
            twoStarAccuracy: 1,
            threeStarAccuracy: 1,
            passAccuracy: 1,
            maxDamagedForThreeStars: 0
        };
    }

    function boot() {
        window.FarmMissions.conveyorDebugMode(config);
    }

    if (window.FarmMissions && window.FarmMissions.conveyorDebugMode) {
        boot();
    } else {
        const script = document.createElement('script');
        script.src = '../assets/js/logic_game/conveyor_debug_mode.js';
        script.onload = boot;
        document.head.appendChild(script);
    }
})();
