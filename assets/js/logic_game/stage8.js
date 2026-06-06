// Stage 8: Smart Farm Manager - Fruit Produce with If / Else.
(function () {
    const config = {
        title: 'บทที่ 3: ผู้จัดการฟาร์มอัจฉริยะ',
        subtitle: 'เกมที่ 2: โรงคัดผลไม้แสนอร่อย | ฝึกใช้ If / Else เท่านั้น',
        resultText: 'คุณเขียนกฎ If / Else เพื่อคัดแยกผลไม้ครบทั้ง 3 ภารกิจแล้ว',
        levels: [
            {
                title: '8-1 ส้มใหญ่ / ส้มเล็ก',
                mission: 'แยกส้มลูกใหญ่ไปกล่องพรีเมียม และส้มที่เหลือไปกล่องแปรรูป',
                brief: 'ถ้าส้มลูกใหญ่ให้เข้ากล่องพรีเมียม นอกเหนือจากนี้ส่งไปแปรรูปน้ำส้ม',
                intro: 'ใช้ If / Else เพื่อแยกผลไม้เป็น 2 เส้นทาง โดยดูขนาดเป็นหลัก',
                lessonType: 'if_else',
                lessonTypeLabel: 'If / Else',
                theme: 'fruit',
                hint: 'ถ้า [ส้มลูกใหญ่] -> [กล่องพรีเมียม] | นอกเหนือจากนี้ -> [กล่องแปรรูปน้ำส้ม]',
                ruleSlots: [{ type: 'if' }, { type: 'else' }],
                conditions: [
                    { id: 'large_orange', label: 'ส้มลูกใหญ่', match: { type: 'orange', size: 'large' } }
                ],
                actions: [
                    { id: 'premium_box', label: 'กล่องพรีเมียม', successText: 'ส้มลูกใหญ่เด้งเข้ากล่องพรีเมียม' },
                    { id: 'juice_box', label: 'กล่องแปรรูปน้ำส้ม', successText: 'ส้มที่เหลือไหลไปกล่องแปรรูปน้ำส้ม' }
                ],
                machines: [
                    { slot: 'a', label: 'กล่องพรีเมียม', icon: '🎁', actions: ['premium_box'] },
                    { slot: 'b', label: 'กล่องแปรรูป', icon: '🧃', actions: ['juice_box'] }
                ],
                itemQueue: [
                    orange('A', 'large'), orange('B', 'small'), orange('C', 'medium_decoy'), orange('D', 'large_pale_decoy'),
                    orange('E', 'pretty_small_decoy'), orange('F', 'large'), orange('G', 'small'), orange('H', 'medium_decoy'),
                    orange('I', 'large'), orange('J', 'pretty_small_decoy'), orange('K', 'small'), orange('L', 'large_pale_decoy')
                ],
                expectedLogic: [
                    { condition: 'large_orange', action: 'premium_box' },
                    { condition: 'else', action: 'juice_box' }
                ],
                scoring: defaultScoring()
            },
            {
                title: '8-2 กล้วยสุก / กล้วยดิบ',
                mission: 'คัดกล้วยสุกไปขายหน้าร้าน และกล้วยที่ยังไม่สุกไปห้องบ่มต่อ',
                brief: 'ถ้ากล้วยสุกสีเหลืองพร้อมขายให้ส่งหน้าร้าน นอกเหนือจากนี้ส่งไปห้องบ่มต่อ',
                intro: 'Else จะดูแลกล้วยที่ยังไม่พร้อมขายทั้งหมด แม้บางลูกจะเริ่มเหลืองแล้วก็ตาม',
                lessonType: 'if_else',
                lessonTypeLabel: 'If / Else',
                theme: 'fruit',
                hint: 'ถ้า [กล้วยสุกสีเหลือง] -> [ส่งไปขายหน้าร้าน] | นอกเหนือจากนี้ -> [ส่งไปห้องบ่มต่อ]',
                ruleSlots: [{ type: 'if' }, { type: 'else' }],
                conditions: [
                    { id: 'ripe_banana', label: 'กล้วยสุกสีเหลือง', match: { type: 'banana', ripe: true } }
                ],
                actions: [
                    { id: 'storefront', label: 'ส่งไปขายหน้าร้าน', successText: 'กล้วยสุกเข้าตะกร้าหน้าร้านพร้อมป้ายราคา' },
                    { id: 'ripening_room', label: 'ส่งไปห้องบ่มต่อ', successText: 'กล้วยที่ยังไม่สุกเข้าห้องบ่มอุ่น ๆ' }
                ],
                machines: [
                    { slot: 'a', label: 'หน้าร้าน', icon: '🏪', actions: ['storefront'] },
                    { slot: 'b', label: 'ห้องบ่ม', icon: '♨️', actions: ['ripening_room'] }
                ],
                itemQueue: [
                    banana('A', 'ripe'), banana('B', 'green'), banana('C', 'yellow_green_decoy'), banana('D', 'ripe_spotted_decoy'),
                    banana('E', 'green_tip_decoy'), banana('F', 'ripe'), banana('G', 'green'), banana('H', 'yellow_green_decoy'),
                    banana('I', 'ripe_spotted_decoy'), banana('J', 'green_tip_decoy'), banana('K', 'green'), banana('L', 'ripe')
                ],
                expectedLogic: [
                    { condition: 'ripe_banana', action: 'storefront' },
                    { condition: 'else', action: 'ripening_room' }
                ],
                scoring: defaultScoring()
            },
            {
                title: '8-3 แตงโมเกรดดี / แปรรูป',
                mission: 'คัดแตงโมเกรดดีไปติดสติ๊กเกอร์เกรด A ส่วนแตงโมที่ไม่ผ่านส่งไปแปรรูป',
                brief: 'แตงโมเกรดดีต้องน้ำหนักพอดีและเสียงกังวาน ถ้าขาดอย่างใดอย่างหนึ่งให้ส่งแปรรูป',
                intro: 'เงื่อนไข If มีข้อมูล 2 อย่าง แต่ยังแยกเพียงสองเส้นทางด้วย Else',
                lessonType: 'if_else',
                lessonTypeLabel: 'If / Else',
                theme: 'fruit',
                hint: 'ถ้า [แตงโมเกรดดี] -> [ติดสติ๊กเกอร์เกรด A] | นอกเหนือจากนี้ -> [ส่งไปแปรรูป]',
                ruleSlots: [{ type: 'if' }, { type: 'else' }],
                conditions: [
                    { id: 'grade_a_watermelon', label: 'แตงโมเกรดดี', match: { type: 'watermelon', weightOk: true, sound: 'clear' } }
                ],
                actions: [
                    { id: 'grade_a_sticker', label: 'ติดสติ๊กเกอร์เกรด A', successText: 'แตงโมเกรดดีได้รับสติ๊กเกอร์ดาว' },
                    { id: 'process_juice', label: 'ส่งไปแปรรูป', successText: 'แตงโมที่ไม่ผ่านเกณฑ์เข้าช่องแปรรูปน้ำแตงโม' }
                ],
                machines: [
                    { slot: 'a', label: 'สติ๊กเกอร์เกรด A', icon: '⭐', actions: ['grade_a_sticker'] },
                    { slot: 'b', label: 'เครื่องแปรรูป', icon: '🧃', actions: ['process_juice'] }
                ],
                itemQueue: [
                    watermelon('A', 'grade_a'), watermelon('B', 'weight_only_decoy'), watermelon('C', 'sound_only_decoy'), watermelon('D', 'pretty_color_decoy'),
                    watermelon('E', 'grade_a'), watermelon('F', 'pretty_stripe_decoy'), watermelon('G', 'weight_only_decoy'), watermelon('H', 'grade_a'),
                    watermelon('I', 'sound_only_decoy'), watermelon('J', 'pretty_color_decoy'), watermelon('K', 'grade_a'), watermelon('L', 'pretty_stripe_decoy')
                ],
                expectedLogic: [
                    { condition: 'grade_a_watermelon', action: 'grade_a_sticker' },
                    { condition: 'else', action: 'process_juice' }
                ],
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
        // ASSET NOTE: fallbackIcon แสดงผลทันที ส่วน logic อ่านจาก props เท่านั้น
        return {
            key,
            path: `../assets/img/conveyor/fruits/${key}.png`,
            width: 96,
            height: 96,
            description,
            futureSpriteSheet: {
                path: `../assets/img/conveyor/fruits/${key}_sheet.png`,
                frameWidth: 96,
                frameHeight: 96,
                animations: ['idle', 'scan', 'bounce_correct', 'drop_wrong']
            }
        };
    }

    function makeItem({ id, key, label, icon, props, expectedAction, sensor, feedback, isDecoy = false, decoyReason = '', inspect }) {
        return {
            id,
            key,
            label,
            category: 'fruit_produce',
            fallbackIcon: icon,
            isDecoy,
            decoyReason,
            asset: asset(key, `ภาพ${label}สำหรับด่านโรงคัดผลไม้`),
            inspect,
            props,
            sensor,
            expectedAction,
            feedback
        };
    }

    function withInspect(data, warning) {
        return {
            title: data.label,
            properties: data.properties,
            hint: data.hint,
            warning: data.isDecoy ? warning : ''
        };
    }

    function orange(id, variant) {
        const data = {
            large: {
                label: 'ส้มลูกใหญ่', props: { type: 'orange', size: 'large', color: 'orange' }, expectedAction: 'premium_box',
                sensor: 'วงแหวนวัดขนาดพบส้มลูกใหญ่', feedback: 'ส้มลูกใหญ่ควรเข้ากล่องพรีเมียม',
                properties: ['ชนิด: ส้ม', 'ขนาด: ใหญ่', 'สี: ส้มสด'], hint: 'เงื่อนไขคือขนาดใหญ่'
            },
            small: {
                label: 'ส้มลูกเล็ก', props: { type: 'orange', size: 'small', color: 'orange' }, expectedAction: 'juice_box',
                sensor: 'วงแหวนวัดขนาดพบส้มลูกเล็ก', feedback: 'ส้มลูกเล็กควรไปแปรรูปน้ำส้ม',
                properties: ['ชนิด: ส้ม', 'ขนาด: เล็ก', 'ปลายทาง: แปรรูป'], hint: 'ไม่เข้า If จึงใช้ Else'
            },
            medium_decoy: {
                label: 'ส้มขนาดกลางเกือบใหญ่', props: { type: 'orange', size: 'medium', color: 'orange' }, expectedAction: 'juice_box',
                sensor: 'ขนาดกลาง ยังไม่ถึงเกณฑ์ลูกใหญ่', feedback: 'เกือบใหญ่ยังไม่ใช่ส้มลูกใหญ่',
                isDecoy: true, decoyReason: 'ส้มลูกนี้ขนาดกลางที่เกือบใหญ่ แต่ยังไม่ถึงเกณฑ์ จึงควรไปกล่องแปรรูป',
                properties: ['ชนิด: ส้ม', 'ขนาด: กลาง', 'เกณฑ์ลูกใหญ่: ยังไม่ผ่าน'], hint: 'คำว่าเกือบใหญ่ยังไม่เท่ากับลูกใหญ่'
            },
            pretty_small_decoy: {
                label: 'ส้มลูกเล็กแต่สีสวย', props: { type: 'orange', size: 'small', color: 'bright' }, expectedAction: 'juice_box',
                sensor: 'สีสวยแต่ขนาดยังเล็ก', feedback: 'สีสวยไม่ใช่เงื่อนไขพรีเมียม',
                isDecoy: true, decoyReason: 'ส้มลูกนี้สีสวย แต่เงื่อนไขคือขนาดใหญ่ ไม่ใช่สี จึงควรไปกล่องแปรรูป',
                properties: ['ชนิด: ส้ม', 'ขนาด: เล็ก', 'สี: สวยสด'], hint: 'อย่าใช้สีแทนเกณฑ์ขนาด'
            },
            large_pale_decoy: {
                label: 'ส้มลูกใหญ่สีอ่อน', props: { type: 'orange', size: 'large', color: 'pale' }, expectedAction: 'premium_box',
                sensor: 'สีอ่อนกว่า แต่ขนาดผ่านเกณฑ์ลูกใหญ่', feedback: 'สีอ่อนไม่ได้ทำให้ตกเกณฑ์ขนาด',
                isDecoy: true, decoyReason: 'ส้มลูกนี้สีอ่อนกว่า แต่ยังเป็นส้มลูกใหญ่ จึงควรเข้ากล่องพรีเมียม',
                properties: ['ชนิด: ส้ม', 'ขนาด: ใหญ่', 'สี: อ่อน'], hint: 'ถ้าขนาดใหญ่ ยังเข้าเงื่อนไขแม้สีไม่สด'
            }
        }[variant];
        return makeItem({ id: `orange_${variant}_${id}`, key: `orange_${variant}`, icon: '🍊', inspect: withInspect(data, 'ตัวหลอก: ลองแยกข้อมูลสีออกจากข้อมูลขนาด'), ...data });
    }

    function banana(id, variant) {
        const data = {
            ripe: {
                label: 'กล้วยสุกสีเหลือง', props: { type: 'banana', ripe: true, color: 'yellow', tip: 'yellow' }, expectedAction: 'storefront',
                sensor: 'เครื่องสแกนสีพบกล้วยเหลืองสุกพร้อมขาย', feedback: 'กล้วยสุกควรส่งไปขายหน้าร้าน',
                properties: ['ชนิด: กล้วย', 'สี: เหลือง', 'ความสุก: พร้อมขาย'], hint: 'สุกพร้อมขายคือเข้า If'
            },
            green: {
                label: 'กล้วยดิบสีเขียว', props: { type: 'banana', ripe: false, color: 'green', tip: 'green' }, expectedAction: 'ripening_room',
                sensor: 'กล้วยยังเขียว ต้องบ่มต่อ', feedback: 'กล้วยดิบควรเข้าห้องบ่ม',
                properties: ['ชนิด: กล้วย', 'สี: เขียว', 'ความสุก: ยังไม่พร้อมขาย'], hint: 'ไม่เข้า If จึงใช้ Else'
            },
            yellow_green_decoy: {
                label: 'กล้วยเหลืองอมเขียว', props: { type: 'banana', ripe: false, color: 'yellow_green', tip: 'green' }, expectedAction: 'ripening_room',
                sensor: 'เริ่มเหลืองแต่ยังอมเขียว ไม่พร้อมขาย', feedback: 'กล้วยอมเขียวยังควรบ่มต่อ',
                isDecoy: true, decoyReason: 'กล้วยลูกนี้เหลืองอมเขียว ยังไม่สุกพร้อมขาย จึงควรส่งไปห้องบ่มต่อ',
                properties: ['ชนิด: กล้วย', 'สี: เหลืองอมเขียว', 'ความสุก: ยังไม่พร้อมขาย'], hint: 'เห็นเหลืองนิดเดียวไม่พอ ต้องพร้อมขาย'
            },
            ripe_spotted_decoy: {
                label: 'กล้วยสุกมีจุดดำเล็กน้อย', props: { type: 'banana', ripe: true, color: 'yellow', spots: 'small' }, expectedAction: 'storefront',
                sensor: 'กล้วยสุกพร้อมขาย แม้มีจุดดำเล็กน้อย', feedback: 'จุดดำเล็กน้อยยังขายได้',
                isDecoy: true, decoyReason: 'กล้วยมีจุดดำเล็กน้อยแต่ยังสุกพร้อมขาย จึงควรส่งไปหน้าร้าน',
                properties: ['ชนิด: กล้วย', 'ความสุก: พร้อมขาย', 'จุดดำ: เล็กน้อย'], hint: 'จุดเล็กน้อยไม่ใช่เหตุผลส่งบ่ม'
            },
            green_tip_decoy: {
                label: 'กล้วยเหลืองแต่ปลายเขียว', props: { type: 'banana', ripe: false, color: 'yellow', tip: 'green' }, expectedAction: 'ripening_room',
                sensor: 'ตัวผลเหลือง แต่ปลายยังเขียว', feedback: 'ปลายยังเขียวจึงยังไม่พร้อมขาย',
                isDecoy: true, decoyReason: 'กล้วยลูกนี้เหลืองแต่ปลายยังเขียว ยังไม่สุกพร้อมขาย จึงควรส่งไปห้องบ่มต่อ',
                properties: ['ชนิด: กล้วย', 'สีผล: เหลือง', 'ปลายผล: เขียว'], hint: 'ดูทั้งลูก ไม่ใช่ดูสีเหลืองบางส่วน'
            }
        }[variant];
        return makeItem({ id: `banana_${variant}_${id}`, key: `banana_${variant}`, icon: '🍌', inspect: withInspect(data, 'ตัวหลอก: สีบางส่วนอาจทำให้ตัดสินเร็วเกินไป'), ...data });
    }

    function watermelon(id, variant) {
        const data = {
            grade_a: {
                label: 'แตงโมเกรดดี', props: { type: 'watermelon', weightOk: true, sound: 'clear', color: 'normal' }, expectedAction: 'grade_a_sticker',
                sensor: 'แท่นชั่งผ่านเกณฑ์ และเสียงเคาะกังวาน', feedback: 'แตงโมเกรดดีควรติดสติ๊กเกอร์เกรด A',
                properties: ['น้ำหนัก: ผ่านเกณฑ์', 'เสียง: กังวาน', 'สถานะ: เกรด A'], hint: 'ต้องผ่านทั้งน้ำหนักและเสียง'
            },
            weight_only_decoy: {
                label: 'แตงโมน้ำหนักพอดีแต่เสียงไม่กังวาน', props: { type: 'watermelon', weightOk: true, sound: 'dull', color: 'normal' }, expectedAction: 'process_juice',
                sensor: 'น้ำหนักผ่าน แต่เสียงเคาะไม่กังวาน', feedback: 'แตงโมต้องผ่านทั้งน้ำหนักและเสียง',
                isDecoy: true, decoyReason: 'แตงโมลูกนี้น้ำหนักพอดี แต่เสียงไม่กังวาน จึงยังไม่ใช่แตงโมเกรดดี',
                properties: ['น้ำหนัก: ผ่านเกณฑ์', 'เสียง: ไม่กังวาน', 'สถานะ: ยังไม่ใช่เกรด A'], hint: 'เงื่อนไขนี้ต้องผ่าน 2 ข้อพร้อมกัน'
            },
            sound_only_decoy: {
                label: 'แตงโมเสียงกังวานแต่น้ำหนักน้อย', props: { type: 'watermelon', weightOk: false, sound: 'clear', color: 'normal' }, expectedAction: 'process_juice',
                sensor: 'เสียงกังวาน แต่น้ำหนักยังน้อย', feedback: 'เสียงดีอย่างเดียวไม่พอ',
                isDecoy: true, decoyReason: 'แตงโมลูกนี้เสียงกังวาน แต่น้ำหนักไม่ผ่านเกณฑ์ จึงควรส่งไปแปรรูป',
                properties: ['น้ำหนัก: ไม่ผ่านเกณฑ์', 'เสียง: กังวาน', 'สถานะ: ยังไม่ใช่เกรด A'], hint: 'อย่าลืมตรวจน้ำหนักด้วย'
            },
            pretty_color_decoy: {
                label: 'แตงโมสีสวยแต่ไม่ผ่านน้ำหนัก', props: { type: 'watermelon', weightOk: false, sound: 'dull', color: 'pretty' }, expectedAction: 'process_juice',
                sensor: 'สีสวย แต่ค่าน้ำหนักและเสียงไม่ผ่าน', feedback: 'สีสวยไม่ใช่เกณฑ์หลัก',
                isDecoy: true, decoyReason: 'แตงโมลูกนี้สีสวย แต่ไม่ผ่านเกณฑ์น้ำหนักและเสียง จึงควรส่งไปแปรรูป',
                properties: ['สี: สวย', 'น้ำหนัก: ไม่ผ่านเกณฑ์', 'เสียง: ไม่กังวาน'], hint: 'เกรดดีไม่ได้ตัดสินจากสีอย่างเดียว'
            },
            pretty_stripe_decoy: {
                label: 'แตงโมลายสวยแต่เสียงทึบ', props: { type: 'watermelon', weightOk: true, sound: 'dull', color: 'striped' }, expectedAction: 'process_juice',
                sensor: 'ลายสวยและน้ำหนักผ่าน แต่เสียงทึบ', feedback: 'เสียงทึบทำให้ยังไม่ใช่เกรดดี',
                isDecoy: true, decoyReason: 'แตงโมลายสวย แต่น้ำเสียงทึบไม่กังวาน จึงควรส่งไปแปรรูป',
                properties: ['ลาย: สวย', 'น้ำหนัก: ผ่านเกณฑ์', 'เสียง: ทึบ'], hint: 'เสียงกังวานเป็นหนึ่งในเงื่อนไขสำคัญ'
            }
        }[variant];
        return makeItem({ id: `watermelon_${variant}_${id}`, key: `watermelon_${variant}`, icon: '🍉', inspect: withInspect(data, 'ตัวหลอก: แตงโมเกรดดีต้องผ่านครบทั้งน้ำหนักและเสียง'), ...data });
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
