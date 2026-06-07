// Stage 12: Smart Farm Debug Mode - repair IF / ELSE IF / ELSE rules from stage 9.
(function () {
    const config = {
        stageId: 12,
        mode: 'debug',
        sourceStage: 9,
        title: 'บทที่ 4: ช่างซ่อมกฎฟาร์มอัจฉริยะ',
        subtitle: 'Debug Mode: ซ่อมกฎ IF / ELSE IF / ELSE ของโรงคัดผลผลิตจากสัตว์',
        resultText: 'คุณซ่อมกฎหลายเงื่อนไขของโรงคัดผลผลิตจากสัตว์ครบทั้ง 3 ภารกิจแล้ว',
        levels: [
            {
                id: '12-1',
                stageId: 12,
                title: '12-1 ซ่อมกฎคัดเกรดไข่ไก่',
                mission: 'ระบบคัดเกรดไข่ต้องแยกไข่พรีเมียม ไข่มาตรฐาน และไข่คัดทิ้ง',
                brief: 'ซ่อมกฎพรีเมียมที่กว้างเกินไป เพราะตรวจแค่ไข่ใบใหญ่',
                intro: 'ทดสอบกฎเดิมก่อน แล้วดูว่าไข่ใหญ่แต่เปลือกร้าวถูกส่งผิดอย่างไร',
                lessonType: 'if_else_if_else',
                lessonTypeLabel: 'IF / ELSE IF / ELSE',
                theme: 'animal_product',
                allowReorder: true,
                debugGoal: 'แก้เงื่อนไขพรีเมียมให้ตรวจทั้ง “ใบใหญ่” และ “เปลือกสมบูรณ์”',
                bugType: 'too_broad_condition',
                suspiciousBlocks: ['condition'],
                successFeedback: 'ถูกต้อง! ไข่พรีเมียมต้องใบใหญ่และเปลือกสมบูรณ์เท่านั้น',
                hint: 'ถ้า [ไข่ใบใหญ่และเปลือกสมบูรณ์] -> [ถาดไข่พรีเมียม] | หรือถ้า [ไข่ใบเล็กแต่ไม่แตก] -> [ถาดไข่มาตรฐาน] | นอกเหนือจากนี้ -> [ถาดคัดทิ้ง]',
                ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else' }],
                brokenLogic: [
                    { type: 'if', condition: 'large_egg_only', action: 'premium_tray' },
                    { type: 'else_if', condition: 'standard_egg', action: 'standard_tray' },
                    { type: 'else', condition: 'else', action: 'reject_tray' }
                ],
                expectedLogic: [
                    { type: 'if', condition: 'premium_egg', action: 'premium_tray' },
                    { type: 'else_if', condition: 'standard_egg', action: 'standard_tray' },
                    { type: 'else', condition: 'else', action: 'reject_tray' }
                ],
                debugReport: {
                    title: 'พบข้อผิดพลาดในระบบคัดเกรดไข่',
                    summary: 'กฎแรกกว้างเกินไป ไข่ใบใหญ่แต่เปลือกแตกจึงถูกส่งเข้าถาดพรีเมียม',
                    hints: [
                        'ตรวจกฎแรกก่อน เพราะระบบอ่าน IF จากบนลงล่าง',
                        'ไข่พรีเมียมต้องผ่านทั้งขนาดและสภาพเปลือก',
                        'ควรเปลี่ยนเงื่อนไขแรกเป็นไข่ใบใหญ่และเปลือกสมบูรณ์'
                    ]
                },
                conditions: [
                    { id: 'premium_egg', label: 'ไข่ใบใหญ่และเปลือกสมบูรณ์', match: { type: 'egg', size: 'large', shell: 'perfect' } },
                    { id: 'standard_egg', label: 'ไข่ใบเล็กแต่ไม่แตก', test: (props) => props.type === 'egg' && props.size === 'small' && props.shell !== 'cracked' }
                ],
                actions: [
                    { id: 'premium_tray', label: 'ถาดไข่พรีเมียม', successText: 'ไข่ใบใหญ่เปลือกสมบูรณ์เข้าถาดพรีเมียม' },
                    { id: 'standard_tray', label: 'ถาดไข่มาตรฐาน', successText: 'ไข่ใบเล็กไม่แตกเข้าถาดมาตรฐาน' },
                    { id: 'reject_tray', label: 'ถาดคัดทิ้ง', successText: 'ไข่ที่ไม่ผ่านเกณฑ์ถูกคัดออกอย่างปลอดภัย' }
                ],
                toolboxDecoys: {
                    conditions: [
                        { id: 'large_egg_only', label: 'ไข่ใบใหญ่', match: { type: 'egg', size: 'large' } },
                        { id: 'pretty_shell_egg', label: 'ไข่เปลือกสวย', test: (props) => props.type === 'egg' && (props.color === 'pretty' || props.shell === 'perfect') }
                    ],
                    actions: [
                        { id: 'premium_for_size', label: 'ถาดพรีเมียมเพราะใบใหญ่', routeSlot: 'a', successText: 'ไข่ถูกส่งพรีเมียมตามขนาด' }
                    ]
                },
                machines: [
                    { slot: 'a', label: 'ถาดพรีเมียม', icon: '🏆', actions: ['premium_tray'] },
                    { slot: 'b', label: 'ถาดมาตรฐาน', icon: '🥚', actions: ['standard_tray'] },
                    { slot: 'c', label: 'ถาดคัดทิ้ง', icon: '🗑️', actions: ['reject_tray'] }
                ],
                itemQueue: [
                    item('egg_premium_a', 'ไข่ใบใหญ่เปลือกสมบูรณ์', '🥚', { type: 'egg', size: 'large', shell: 'perfect' }, 'premium_tray', 'ไข่ใบใหญ่และเปลือกสมบูรณ์', 'ไข่ใบใหญ่เปลือกสมบูรณ์ควรเข้าถาดพรีเมียม'),
                    item('egg_standard_a', 'ไข่ใบเล็กเปลือกสมบูรณ์', '🥚', { type: 'egg', size: 'small', shell: 'perfect' }, 'standard_tray', 'ไข่ใบเล็กแต่ไม่แตก', 'ไข่ใบเล็กไม่แตกควรเข้าถาดมาตรฐาน'),
                    item('egg_cracked_a', 'ไข่ร้าว', '🥚', { type: 'egg', size: 'small', shell: 'cracked' }, 'reject_tray', 'เครื่องสแกนพบรอยร้าวบนเปลือกไข่', 'ไข่ร้าวควรถูกคัดทิ้ง'),
                    item('egg_large_cracked_a', 'ไข่ใบใหญ่มีรอยร้าว', '🥚', { type: 'egg', size: 'large', shell: 'cracked' }, 'reject_tray', 'ไข่ใบใหญ่ แต่มีรอยร้าวเล็กน้อย', 'ไข่ใหญ่แต่ร้าวไม่ควรเข้าพรีเมียม', true, 'ไข่ใบนี้ใหญ่ แต่มีรอยร้าวเล็กน้อย จึงไม่ควรเข้าถาดพรีเมียม'),
                    item('egg_premium_b', 'ไข่ใบใหญ่เปลือกสมบูรณ์อีกใบ', '🥚', { type: 'egg', size: 'large', shell: 'perfect' }, 'premium_tray', 'ไข่ใบใหญ่และเปลือกสมบูรณ์', 'ไข่ใบใหญ่เปลือกสมบูรณ์ควรเข้าถาดพรีเมียม')
                ],
                scoring: strictScoring()
            },
            {
                id: '12-2',
                stageId: 12,
                title: '12-2 ซ่อมกฎคัดคุณภาพขนแกะ',
                mission: 'ระบบคัดขนแกะต้องแยกพรีเมียม ทำความสะอาด และรีไซเคิล',
                brief: 'ซ่อมกฎพรีเมียมที่ตรวจแค่สะอาด แต่ไม่ตรวจความนุ่ม',
                intro: 'ทดสอบกฎเดิมก่อน แล้วดูว่าขนสะอาดแต่ไม่นุ่มถูกส่งผิดอย่างไร',
                lessonType: 'if_else_if_else',
                lessonTypeLabel: 'IF / ELSE IF / ELSE',
                theme: 'animal_product',
                allowReorder: true,
                debugGoal: 'แก้เงื่อนไขพรีเมียมให้ตรวจทั้ง “สะอาด” และ “นุ่ม”',
                bugType: 'too_broad_condition',
                suspiciousBlocks: ['condition'],
                successFeedback: 'ถูกต้อง! ขนแกะพรีเมียมต้องทั้งสะอาดและนุ่ม',
                hint: 'ถ้า [ขนแกะสะอาดและนุ่ม] -> [ม้วนไหมพรมพรีเมียม] | หรือถ้า [ขนแกะมีเศษหญ้า] -> [ส่งไปเครื่องทำความสะอาด] | นอกเหนือจากนี้ -> [ส่งเข้าถังรีไซเคิล]',
                ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else' }],
                brokenLogic: [
                    { type: 'if', condition: 'clean_wool_only', action: 'premium_yarn' },
                    { type: 'else_if', condition: 'grassy_wool', action: 'cleaning_machine' },
                    { type: 'else', condition: 'else', action: 'recycle_bin' }
                ],
                expectedLogic: [
                    { type: 'if', condition: 'premium_wool', action: 'premium_yarn' },
                    { type: 'else_if', condition: 'grassy_wool', action: 'cleaning_machine' },
                    { type: 'else', condition: 'else', action: 'recycle_bin' }
                ],
                debugReport: {
                    title: 'พบข้อผิดพลาดในระบบคัดขนแกะ',
                    summary: 'กฎพรีเมียมตรวจแค่สะอาด ทำให้ขนแกะที่สะอาดแต่ไม่นุ่มถูกส่งไปเป็นพรีเมียม',
                    hints: [
                        'พรีเมียมต้องดูมากกว่าความสะอาด',
                        'ตรวจว่าขนแกะต้องนุ่มด้วยหรือไม่',
                        'ควรเปลี่ยนเงื่อนไขแรกเป็นขนแกะสะอาดและนุ่ม'
                    ]
                },
                conditions: [
                    { id: 'premium_wool', label: 'ขนแกะสะอาดและนุ่ม', match: { type: 'wool', clean: true, soft: true } },
                    { id: 'grassy_wool', label: 'ขนแกะมีเศษหญ้า', match: { type: 'wool', hasGrass: true } }
                ],
                actions: [
                    { id: 'premium_yarn', label: 'ม้วนไหมพรมพรีเมียม', successText: 'ขนดีถูกม้วนเป็นไหมพรมพรีเมียม' },
                    { id: 'cleaning_machine', label: 'ส่งไปเครื่องทำความสะอาด', successText: 'เครื่องเป่าลมแยกเศษหญ้าออกจากขนแกะ' },
                    { id: 'recycle_bin', label: 'ส่งเข้าถังรีไซเคิล', successText: 'ขนแกะที่ไม่ผ่านเกณฑ์ถูกส่งเข้าถังรีไซเคิล' }
                ],
                toolboxDecoys: {
                    conditions: [
                        { id: 'clean_wool_only', label: 'ขนแกะสะอาด', match: { type: 'wool', clean: true } },
                        { id: 'soft_wool_only', label: 'ขนแกะนุ่มหรือฟู', match: { type: 'wool', soft: true } }
                    ],
                    actions: [
                        { id: 'premium_for_clean', label: 'ไหมพรมพรีเมียมเพราะสะอาด', routeSlot: 'a', successText: 'ขนแกะถูกส่งพรีเมียมตามความสะอาด' }
                    ]
                },
                machines: [
                    { slot: 'a', label: 'ไหมพรมพรีเมียม', icon: '🧶', actions: ['premium_yarn'] },
                    { slot: 'b', label: 'เครื่องทำความสะอาด', icon: '💨', actions: ['cleaning_machine'] },
                    { slot: 'c', label: 'ถังรีไซเคิล', icon: '♻️', actions: ['recycle_bin'] }
                ],
                itemQueue: [
                    item('wool_premium_a', 'ขนแกะสะอาดและนุ่ม', '🐑', { type: 'wool', clean: true, soft: true, hasGrass: false }, 'premium_yarn', 'ขนแกะสะอาด นุ่ม และฟูพอดี', 'ขนแกะสะอาดและนุ่มควรเป็นไหมพรมพรีเมียม'),
                    item('wool_grass_a', 'ขนแกะมีเศษหญ้า', '🐑', { type: 'wool', clean: false, soft: true, hasGrass: true }, 'cleaning_machine', 'พบเศษหญ้าติดอยู่ในขนแกะ', 'ขนแกะมีเศษหญ้าควรเข้าเครื่องทำความสะอาด'),
                    item('wool_clean_not_soft_a', 'ขนแกะสะอาดแต่ไม่นุ่ม', '🐑', { type: 'wool', clean: true, soft: false, hasGrass: false }, 'recycle_bin', 'ขนสะอาดแต่เนื้อขนไม่นุ่ม', 'สะอาดอย่างเดียวไม่พอสำหรับพรีเมียม', true, 'ขนแกะสะอาดแต่ไม่นุ่ม จึงไม่ควรเป็นไหมพรมพรีเมียม'),
                    item('wool_dirty_a', 'ขนแกะเปียกและไม่สะอาด', '🐑', { type: 'wool', clean: false, soft: false, hasGrass: false, wet: true }, 'recycle_bin', 'ขนเปียกและไม่สะอาด', 'ขนแกะที่ไม่ผ่านเกณฑ์ควรรีไซเคิล'),
                    item('wool_premium_b', 'ขนแกะพรีเมียมอีกม้วน', '🐑', { type: 'wool', clean: true, soft: true, hasGrass: false }, 'premium_yarn', 'ขนแกะสะอาด นุ่ม และฟูพอดี', 'ขนแกะสะอาดและนุ่มควรเป็นไหมพรมพรีเมียม')
                ],
                scoring: strictScoring()
            },
            {
                id: '12-3',
                stageId: 12,
                title: '12-3 ซ่อมกฎตรวจอุณหภูมิน้ำนม',
                mission: 'ระบบตรวจคุณภาพน้ำนมต้องแยกนมพร้อมขาย นมที่ต้องทำความเย็น และนมคัดทิ้ง',
                brief: 'ซ่อมขอบเขตอุณหภูมิให้แยกต่ำกว่า 8°C กับช่วง 8-15°C ชัดเจน',
                intro: 'ทดสอบกฎเดิมก่อน แล้วดูค่าขอบเขต 8°C และ 15°C ให้ดี',
                lessonType: 'if_else_if_else',
                lessonTypeLabel: 'IF / ELSE IF / ELSE',
                theme: 'animal_product',
                allowReorder: true,
                debugGoal: 'แก้ขอบเขตอุณหภูมิให้ต่ำกว่า 8°C พร้อมขาย และ 8-15°C เข้าห้องเย็น',
                bugType: 'boundary_error',
                suspiciousBlocks: ['condition', 'elseIfCondition'],
                successFeedback: 'ถูกต้อง! นมพร้อมขายต้องเย็นต่ำกว่า 8°C ส่วน 8-15°C ต้องส่งไปทำความเย็นก่อน',
                hint: 'ถ้า [อุณหภูมินมต่ำกว่า 8°C] -> [บรรจุขวดพร้อมขาย] | หรือถ้า [อุณหภูมิ 8-15°C] -> [ส่งเข้าห้องทำความเย็น] | นอกเหนือจากนี้ -> [คัดทิ้ง]',
                ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else' }],
                brokenLogic: [
                    { type: 'if', condition: 'milk_not_over_8', action: 'bottle_ready' },
                    { type: 'else_if', condition: 'milk_under_15', action: 'cooling_room' },
                    { type: 'else', condition: 'else', action: 'discard_milk' }
                ],
                expectedLogic: [
                    { type: 'if', condition: 'milk_below_8', action: 'bottle_ready' },
                    { type: 'else_if', condition: 'milk_8_to_15', action: 'cooling_room' },
                    { type: 'else', condition: 'else', action: 'discard_milk' }
                ],
                debugReport: {
                    title: 'พบข้อผิดพลาดในขอบเขตอุณหภูมิน้ำนม',
                    summary: 'กฎเดิมใช้ “ไม่เกิน 8°C” และ “ต่ำกว่า 15°C” ทำให้ค่า 8°C และ 15°C ถูกจัดกลุ่มผิด',
                    hints: [
                        'ดูเครื่องหมาย < และ <= ให้ดี',
                        '8°C ควรอยู่ในช่วงทำความเย็น ไม่ใช่พร้อมขาย',
                        'ควรใช้ต่ำกว่า 8°C และช่วง 8-15°C'
                    ]
                },
                conditions: [
                    { id: 'milk_below_8', label: 'อุณหภูมินมต่ำกว่า 8°C', compare: { key: 'temperature', op: '<', value: 8 } },
                    { id: 'milk_8_to_15', label: 'อุณหภูมิ 8-15°C', test: (props) => props.type === 'milk' && props.temperature >= 8 && props.temperature <= 15 }
                ],
                actions: [
                    { id: 'bottle_ready', label: 'บรรจุขวดพร้อมขาย', successText: 'นมเย็นคุณภาพดีเข้ากล่องบรรจุขวด' },
                    { id: 'cooling_room', label: 'ส่งเข้าห้องทำความเย็น', successText: 'นมเข้าห้องเย็นพร้อมไอเย็นรอบขวด' },
                    { id: 'discard_milk', label: 'คัดทิ้ง', successText: 'นมที่อุณหภูมิสูงถูกคัดออกพร้อมป้ายเตือน' }
                ],
                toolboxDecoys: {
                    conditions: [
                        { id: 'milk_not_over_8', label: 'อุณหภูมินมไม่เกิน 8°C', compare: { key: 'temperature', op: '<=', value: 8 } },
                        { id: 'milk_under_15', label: 'อุณหภูมินมต่ำกว่า 15°C', compare: { key: 'temperature', op: '<', value: 15 } }
                    ],
                    actions: [
                        { id: 'cool_all_under_15', label: 'ทำความเย็นนมต่ำกว่า 15°C', routeSlot: 'b', successText: 'นมถูกส่งเข้าห้องเย็นตามช่วงกว้าง' }
                    ]
                },
                machines: [
                    { slot: 'a', label: 'บรรจุขวด', icon: '🍼', actions: ['bottle_ready'] },
                    { slot: 'b', label: 'ห้องทำความเย็น', icon: '❄️', actions: ['cooling_room'] },
                    { slot: 'c', label: 'คัดทิ้ง', icon: '⚠️', actions: ['discard_milk'] }
                ],
                itemQueue: [
                    milk('milk_65', 6.5, 'bottle_ready', 'นมเย็นคุณภาพดี 6.5°C'),
                    milk('milk_79', 7.9, 'bottle_ready', 'นม 7.9°C ใกล้ขอบเขต'),
                    milk('milk_8', 8, 'cooling_room', 'นม 8°C พอดี', true, 'นม 8°C อยู่ในช่วง 8-15°C จึงควรเข้าห้องทำความเย็น ไม่ใช่บรรจุขาย'),
                    milk('milk_12', 12, 'cooling_room', 'นมต้องทำความเย็น 12°C'),
                    milk('milk_15', 15, 'cooling_room', 'นม 15°C พอดี', true, 'นม 15°C ยังอยู่ในช่วง 8-15°C จึงควรเข้าห้องทำความเย็น'),
                    milk('milk_16', 16, 'discard_milk', 'นมอุณหภูมิสูง 16°C')
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
                warning: isDecoy ? 'ตัวหลอก: ตรวจหลายเงื่อนไขและลำดับกฎให้ละเอียด' : ''
            }
        };
    }

    function milk(id, temperature, expectedAction, label, isDecoy = false, decoyReason = '') {
        const feedback = temperature < 8
            ? `นม ${temperature}°C ต่ำกว่า 8°C ควรบรรจุขวดพร้อมขาย`
            : temperature <= 15
                ? `นม ${temperature}°C อยู่ช่วง 8-15°C ควรเข้าห้องทำความเย็น`
                : `นม ${temperature}°C สูงกว่า 15°C ควรคัดทิ้ง`;
        return item(
            id,
            label,
            '🥛',
            { type: 'milk', temperature },
            expectedAction,
            `เครื่องวัดอุณหภูมิอ่านค่า ${temperature}°C`,
            feedback,
            isDecoy,
            decoyReason
        );
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
