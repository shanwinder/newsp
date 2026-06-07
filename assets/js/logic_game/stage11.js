// Stage 11: Smart Farm Debug Mode - repair IF / ELSE rules from stage 8.
(function () {
    const config = {
        stageId: 11,
        mode: 'debug',
        sourceStage: 8,
        title: 'บทที่ 4: ช่างซ่อมกฎฟาร์มอัจฉริยะ',
        subtitle: 'Debug Mode: ซ่อมกฎ IF / ELSE ของโรงคัดผลไม้',
        resultText: 'คุณซ่อมกฎ IF / ELSE ของโรงคัดผลไม้ครบทั้ง 3 ภารกิจแล้ว',
        levels: [
            {
                id: '11-1',
                stageId: 11,
                title: '11-1 ซ่อมกฎคัดส้มพรีเมียม',
                mission: 'โรงคัดส้มต้องส่งส้มลูกใหญ่ไปกล่องพรีเมียม และส้มอื่นไปกล่องแปรรูปน้ำส้ม',
                brief: 'ซ่อมคำสั่ง ELSE ที่ส่งส้มลูกเล็กเข้ากล่องพรีเมียมผิด',
                intro: 'ทดสอบกฎเดิมก่อน แล้วดูว่า ELSE ส่งอะไรผิดทาง',
                lessonType: 'if_else',
                lessonTypeLabel: 'IF / ELSE',
                theme: 'fruit',
                debugGoal: 'แก้ปลายทางของ ELSE จากกล่องพรีเมียมเป็นกล่องแปรรูปน้ำส้ม',
                bugType: 'wrong_else_action',
                suspiciousBlocks: ['elseAction'],
                successFeedback: 'ถูกต้อง! ส้มที่ไม่ใช่ลูกใหญ่ไม่ควรเข้ากล่องพรีเมียม แต่ควรส่งไปแปรรูป',
                hint: 'ถ้า [ส้มลูกใหญ่] -> [กล่องพรีเมียม] | นอกเหนือจากนี้ -> [กล่องแปรรูปน้ำส้ม]',
                ruleSlots: [{ type: 'if' }, { type: 'else' }],
                brokenLogic: [
                    { type: 'if', condition: 'large_orange', action: 'premium_box' },
                    { type: 'else', condition: 'else', action: 'premium_box' }
                ],
                expectedLogic: [
                    { type: 'if', condition: 'large_orange', action: 'premium_box' },
                    { type: 'else', condition: 'else', action: 'juice_box' }
                ],
                debugReport: {
                    title: 'พบข้อผิดพลาดในระบบคัดส้ม',
                    summary: 'ส้มลูกเล็กถูกส่งเข้ากล่องพรีเมียม เพราะคำสั่ง ELSE ใช้ปลายทางเดียวกับ IF',
                    hints: [
                        'ดูส้มที่ไม่ใช่ลูกใหญ่ว่าควรไปที่ไหน',
                        'ELSE คือกรณีที่ไม่เข้า IF',
                        'ควรเปลี่ยน ELSE เป็นกล่องแปรรูปน้ำส้ม'
                    ]
                },
                conditions: [{ id: 'large_orange', label: 'ส้มลูกใหญ่', match: { type: 'orange', size: 'large' } }],
                actions: [
                    { id: 'premium_box', label: 'กล่องพรีเมียม', successText: 'ส้มลูกใหญ่เด้งเข้ากล่องพรีเมียม' },
                    { id: 'juice_box', label: 'กล่องแปรรูปน้ำส้ม', successText: 'ส้มที่เหลือไหลไปกล่องแปรรูปน้ำส้ม' }
                ],
                toolboxDecoys: {
                    conditions: [
                        { id: 'bright_orange', label: 'ส้มสีสวยสด', match: { type: 'orange', color: 'bright' } },
                        { id: 'medium_orange', label: 'ส้มขนาดกลาง', match: { type: 'orange', size: 'medium' } }
                    ],
                    actions: [
                        { id: 'premium_for_color', label: 'กล่องพรีเมียมเพราะสีสวย', routeSlot: 'a', successText: 'ส้มถูกส่งเข้ากล่องพรีเมียมตามสี' }
                    ]
                },
                machines: [
                    { slot: 'a', label: 'กล่องพรีเมียม', icon: '🎁', actions: ['premium_box'] },
                    { slot: 'b', label: 'กล่องแปรรูป', icon: '🧃', actions: ['juice_box'] }
                ],
                itemQueue: [
                    item('orange_large_a', 'ส้มลูกใหญ่', '🍊', { type: 'orange', size: 'large', color: 'orange' }, 'premium_box', 'วงแหวนวัดขนาดพบส้มลูกใหญ่', 'ส้มลูกใหญ่ควรเข้ากล่องพรีเมียม'),
                    item('orange_small_a', 'ส้มลูกเล็ก', '🍊', { type: 'orange', size: 'small', color: 'orange' }, 'juice_box', 'วงแหวนวัดขนาดพบส้มลูกเล็ก', 'ส้มลูกเล็กควรไปแปรรูปน้ำส้ม'),
                    item('orange_medium_a', 'ส้มขนาดกลางเกือบใหญ่', '🍊', { type: 'orange', size: 'medium', color: 'orange' }, 'juice_box', 'ขนาดกลาง ยังไม่ถึงเกณฑ์ลูกใหญ่', 'เกือบใหญ่ยังไม่ใช่ส้มลูกใหญ่', true, 'ส้มลูกนี้ขนาดกลางที่เกือบใหญ่ แต่ยังไม่ถึงเกณฑ์ จึงควรไปกล่องแปรรูป'),
                    item('orange_large_b', 'ส้มลูกใหญ่สีอ่อน', '🍊', { type: 'orange', size: 'large', color: 'pale' }, 'premium_box', 'สีอ่อนกว่า แต่ขนาดผ่านเกณฑ์ลูกใหญ่', 'สีอ่อนไม่ได้ทำให้ตกเกณฑ์ขนาด', true, 'สีอ่อนไม่ใช่เหตุผลตกเกณฑ์ ถ้าขนาดใหญ่ยังควรเข้ากล่องพรีเมียม'),
                    item('orange_small_b', 'ส้มลูกเล็กแต่สีสวย', '🍊', { type: 'orange', size: 'small', color: 'bright' }, 'juice_box', 'สีสวยแต่ขนาดยังเล็ก', 'สีสวยไม่ใช่เงื่อนไขพรีเมียม', true, 'ส้มลูกนี้สีสวย แต่เงื่อนไขคือขนาดใหญ่ ไม่ใช่สี จึงควรไปกล่องแปรรูป')
                ],
                scoring: strictScoring()
            },
            {
                id: '11-2',
                stageId: 11,
                title: '11-2 ซ่อมกฎคัดกล้วยสุก',
                mission: 'ระบบคัดกล้วยส่งขายหน้าร้านใช้เงื่อนไขกว้างเกินไป',
                brief: 'ซ่อมเงื่อนไขให้ส่งขายเฉพาะกล้วยสุกสีเหลืองพร้อมขาย',
                intro: 'ทดสอบกฎเดิมแล้วดูว่ากล้วยเหลืองอมเขียวถูกส่งผิดอย่างไร',
                lessonType: 'if_else',
                lessonTypeLabel: 'IF / ELSE',
                theme: 'fruit',
                debugGoal: 'แก้เงื่อนไขจาก “มีสีเหลืองบางส่วน” เป็น “กล้วยสุกสีเหลือง”',
                bugType: 'too_broad_condition',
                suspiciousBlocks: ['condition'],
                successFeedback: 'ถูกต้อง! กล้วยที่ยังเขียวบางส่วนควรถูกบ่มต่อ ไม่ควรส่งขายทันที',
                hint: 'ถ้า [กล้วยสุกสีเหลือง] -> [ส่งไปขายหน้าร้าน] | นอกเหนือจากนี้ -> [ส่งไปห้องบ่มต่อ]',
                ruleSlots: [{ type: 'if' }, { type: 'else' }],
                brokenLogic: [
                    { type: 'if', condition: 'banana_has_yellow', action: 'storefront' },
                    { type: 'else', condition: 'else', action: 'ripening_room' }
                ],
                expectedLogic: [
                    { type: 'if', condition: 'ripe_banana', action: 'storefront' },
                    { type: 'else', condition: 'else', action: 'ripening_room' }
                ],
                debugReport: {
                    title: 'พบข้อผิดพลาดในระบบคัดกล้วย',
                    summary: 'เงื่อนไข “มีสีเหลืองบางส่วน” กว้างเกินไป ทำให้กล้วยที่ยังไม่สุกถูกส่งขาย',
                    hints: [
                        'ลองดูสีของกล้วยทั้งลูก ไม่ใช่ดูแค่บางส่วน',
                        'บั๊กอยู่ที่เงื่อนไข IF',
                        'ควรใช้เงื่อนไขกล้วยสุกสีเหลือง'
                    ]
                },
                conditions: [{ id: 'ripe_banana', label: 'กล้วยสุกสีเหลือง', match: { type: 'banana', ripe: true } }],
                actions: [
                    { id: 'storefront', label: 'ส่งไปขายหน้าร้าน', successText: 'กล้วยสุกเข้าตะกร้าหน้าร้านพร้อมป้ายราคา' },
                    { id: 'ripening_room', label: 'ส่งไปห้องบ่มต่อ', successText: 'กล้วยที่ยังไม่สุกเข้าห้องบ่มอุ่น ๆ' }
                ],
                toolboxDecoys: {
                    conditions: [
                        { id: 'banana_has_yellow', label: 'กล้วยมีสีเหลืองบางส่วน', test: (props) => props.type === 'banana' && String(props.color || '').includes('yellow') },
                        { id: 'banana_has_spots', label: 'กล้วยมีจุดดำเล็กน้อย', match: { type: 'banana', spots: 'small' } }
                    ],
                    actions: [
                        { id: 'storefront_any_yellow', label: 'ขายทันทีถ้าเห็นสีเหลือง', routeSlot: 'a', successText: 'กล้วยถูกส่งหน้าร้านเพราะเห็นสีเหลือง' }
                    ]
                },
                machines: [
                    { slot: 'a', label: 'หน้าร้าน', icon: '🏪', actions: ['storefront'] },
                    { slot: 'b', label: 'ห้องบ่ม', icon: '♨️', actions: ['ripening_room'] }
                ],
                itemQueue: [
                    item('banana_ripe_a', 'กล้วยสุกสีเหลือง', '🍌', { type: 'banana', ripe: true, color: 'yellow', tip: 'yellow' }, 'storefront', 'เครื่องสแกนสีพบกล้วยเหลืองสุกพร้อมขาย', 'กล้วยสุกควรส่งไปขายหน้าร้าน'),
                    item('banana_green_a', 'กล้วยดิบสีเขียว', '🍌', { type: 'banana', ripe: false, color: 'green', tip: 'green' }, 'ripening_room', 'กล้วยยังเขียว ต้องบ่มต่อ', 'กล้วยดิบควรเข้าห้องบ่ม'),
                    item('banana_yellow_green_a', 'กล้วยเหลืองอมเขียว', '🍌', { type: 'banana', ripe: false, color: 'yellow_green', tip: 'green' }, 'ripening_room', 'เริ่มเหลืองแต่ยังอมเขียว ไม่พร้อมขาย', 'กล้วยอมเขียวยังควรบ่มต่อ', true, 'กล้วยลูกนี้เหลืองอมเขียว ยังไม่สุกพร้อมขาย จึงควรส่งไปห้องบ่มต่อ'),
                    item('banana_green_tip_a', 'กล้วยเหลืองแต่ปลายเขียว', '🍌', { type: 'banana', ripe: false, color: 'yellow', tip: 'green' }, 'ripening_room', 'ตัวผลเหลือง แต่ปลายยังเขียว', 'ปลายยังเขียวจึงยังไม่พร้อมขาย', true, 'กล้วยลูกนี้เหลืองแต่ปลายยังเขียว ยังไม่สุกพร้อมขาย จึงควรส่งไปห้องบ่มต่อ'),
                    item('banana_ripe_b', 'กล้วยสุกมีจุดดำเล็กน้อย', '🍌', { type: 'banana', ripe: true, color: 'yellow', spots: 'small' }, 'storefront', 'กล้วยสุกพร้อมขาย แม้มีจุดดำเล็กน้อย', 'จุดดำเล็กน้อยยังขายได้', true, 'กล้วยมีจุดดำเล็กน้อยแต่ยังสุกพร้อมขาย จึงควรส่งไปหน้าร้าน')
                ],
                scoring: strictScoring()
            },
            {
                id: '11-3',
                stageId: 11,
                title: '11-3 ซ่อมกฎคัดแตงโมเกรด A',
                mission: 'ระบบคัดแตงโมเกรด A ตรวจแค่น้ำหนัก แต่ไม่ตรวจเสียงกังวาน',
                brief: 'ซ่อมเงื่อนไขให้แตงโมเกรด A ต้องทั้งน้ำหนักพอดีและเสียงกังวาน',
                intro: 'ทดสอบกฎเดิมแล้วดูแตงโมน้ำหนักพอดีแต่เสียงไม่กังวาน',
                lessonType: 'if_else',
                lessonTypeLabel: 'IF / ELSE',
                theme: 'fruit',
                debugGoal: 'เพิ่มเงื่อนไขให้ครบทั้งน้ำหนักพอดีและเสียงกังวาน',
                bugType: 'too_broad_condition',
                suspiciousBlocks: ['condition'],
                successFeedback: 'ถูกต้อง! แตงโมเกรด A ต้องทั้งน้ำหนักพอดีและเสียงกังวาน',
                hint: 'ถ้า [แตงโมน้ำหนักพอดีและเสียงกังวาน] -> [ติดสติ๊กเกอร์เกรด A] | นอกเหนือจากนี้ -> [ส่งไปแปรรูป]',
                ruleSlots: [{ type: 'if' }, { type: 'else' }],
                brokenLogic: [
                    { type: 'if', condition: 'watermelon_weight_only', action: 'grade_a_sticker' },
                    { type: 'else', condition: 'else', action: 'process_juice' }
                ],
                expectedLogic: [
                    { type: 'if', condition: 'grade_a_watermelon', action: 'grade_a_sticker' },
                    { type: 'else', condition: 'else', action: 'process_juice' }
                ],
                debugReport: {
                    title: 'พบข้อผิดพลาดในระบบคัดแตงโม',
                    summary: 'ระบบตรวจแค่น้ำหนักพอดี ทำให้แตงโมที่เสียงไม่กังวานได้เกรด A ผิด',
                    hints: [
                        'แตงโมเกรด A ต้องผ่านกี่เกณฑ์',
                        'น้ำหนักพอดีอย่างเดียวพอหรือไม่',
                        'ควรใช้เงื่อนไขน้ำหนักพอดีและเสียงกังวาน'
                    ]
                },
                conditions: [{ id: 'grade_a_watermelon', label: 'แตงโมน้ำหนักพอดีและเสียงกังวาน', match: { type: 'watermelon', weightOk: true, sound: 'clear' } }],
                actions: [
                    { id: 'grade_a_sticker', label: 'ติดสติ๊กเกอร์เกรด A', successText: 'แตงโมเกรดดีได้รับสติ๊กเกอร์ดาว' },
                    { id: 'process_juice', label: 'ส่งไปแปรรูป', successText: 'แตงโมที่ไม่ผ่านเกณฑ์เข้าช่องแปรรูปน้ำแตงโม' }
                ],
                toolboxDecoys: {
                    conditions: [
                        { id: 'watermelon_weight_only', label: 'แตงโมน้ำหนักพอดี', match: { type: 'watermelon', weightOk: true } },
                        { id: 'watermelon_clear_sound_only', label: 'แตงโมเสียงกังวาน', match: { type: 'watermelon', sound: 'clear' } }
                    ],
                    actions: [
                        { id: 'sticker_for_color', label: 'ติดเกรด A เพราะสีสวย', routeSlot: 'a', successText: 'แตงโมถูกติดสติ๊กเกอร์ตามสี' }
                    ]
                },
                machines: [
                    { slot: 'a', label: 'สติ๊กเกอร์เกรด A', icon: '⭐', actions: ['grade_a_sticker'] },
                    { slot: 'b', label: 'เครื่องแปรรูป', icon: '🧃', actions: ['process_juice'] }
                ],
                itemQueue: [
                    item('watermelon_grade_a', 'แตงโมน้ำหนักพอดีและเสียงกังวาน', '🍉', { type: 'watermelon', weightOk: true, sound: 'clear' }, 'grade_a_sticker', 'แท่นชั่งผ่านเกณฑ์ และเสียงเคาะกังวาน', 'แตงโมเกรดดีควรติดสติ๊กเกอร์เกรด A'),
                    item('watermelon_weight_only', 'แตงโมน้ำหนักพอดีแต่เสียงไม่กังวาน', '🍉', { type: 'watermelon', weightOk: true, sound: 'dull' }, 'process_juice', 'น้ำหนักผ่าน แต่เสียงเคาะไม่กังวาน', 'แตงโมต้องผ่านทั้งน้ำหนักและเสียง', true, 'แตงโมลูกนี้น้ำหนักพอดี แต่เสียงไม่กังวาน จึงยังไม่ใช่แตงโมเกรดดี'),
                    item('watermelon_sound_only', 'แตงโมเสียงกังวานแต่น้ำหนักน้อย', '🍉', { type: 'watermelon', weightOk: false, sound: 'clear' }, 'process_juice', 'เสียงกังวาน แต่น้ำหนักยังน้อย', 'เสียงดีอย่างเดียวไม่พอ', true, 'แตงโมลูกนี้เสียงกังวาน แต่น้ำหนักไม่ผ่านเกณฑ์ จึงควรส่งไปแปรรูป'),
                    item('watermelon_pretty', 'แตงโมสีสวยแต่ไม่ผ่านเกณฑ์', '🍉', { type: 'watermelon', weightOk: false, sound: 'dull', color: 'pretty' }, 'process_juice', 'สีสวย แต่ค่าน้ำหนักและเสียงไม่ผ่าน', 'สีสวยไม่ใช่เกณฑ์หลัก', true, 'แตงโมลูกนี้สีสวย แต่ไม่ผ่านเกณฑ์น้ำหนักและเสียง จึงควรส่งไปแปรรูป'),
                    item('watermelon_grade_b', 'แตงโมเกรด A อีกลูก', '🍉', { type: 'watermelon', weightOk: true, sound: 'clear' }, 'grade_a_sticker', 'แท่นชั่งผ่านเกณฑ์ และเสียงเคาะกังวาน', 'แตงโมเกรดดีควรติดสติ๊กเกอร์เกรด A')
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
                warning: isDecoy ? 'ตัวหลอก: ต้องดูเกณฑ์หลักของด่าน ไม่ใช่ข้อมูลที่คล้ายกัน' : ''
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
