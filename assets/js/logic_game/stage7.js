// Stage 7: Smart Farm Manager - Fruit & Veggie Classifier.
(function () {
    const config = {
        title: 'Smart Farm Manager: โรงคัดแยกผลผลิตของพี่สมปอง',
        subtitle: 'ตั้งกฎ If / Else If / Else เพื่อคัดแยกผลผลิตบนสายพานอัจฉริยะ',
        levels: [
            {
                title: '7-1 แครอทเปื้อนโคลน',
                brief: 'คัดแครอทเปื้อนโคลนเข้าเครื่องล้าง ส่วนแครอทสะอาดปล่อยลงตะกร้า',
                intro: 'เริ่มจากกฎเดียว: ถ้าเจอแครอทเปื้อนโคลน ให้ส่งไปล้างน้ำ',
                lessonType: 'if',
                lessonTypeLabel: 'If',
                theme: 'produce',
                hint: 'ถ้า [แครอทเปื้อนโคลน] -> [ส่งไปเครื่องล้างน้ำ]',
                ruleSlots: [{ type: 'if' }],
                conditions: [
                    { id: 'carrot_dirty', label: 'แครอทเปื้อนโคลน' }
                ],
                actions: [
                    { id: 'wash', label: 'ส่งไปเครื่องล้างน้ำ', successText: 'เครื่องล้างหมุนพ่นน้ำ แครอทสะอาดลงตะกร้า' },
                    { id: 'pass', label: 'ปล่อยผ่านลงตะกร้า', successText: 'แครอทสะอาดลงตะกร้าแบบไม่เสียเวลา' }
                ],
                machines: [
                    { slot: 'a', label: 'เครื่องล้างน้ำ', icon: '🚿', actions: ['wash'] },
                    { slot: 'pass', label: 'ตะกร้าสะอาด', icon: '🧺', actions: ['pass'] }
                ],
                itemQueue: [
                    carrot('A', true), carrot('B', false), carrot('C', true), carrot('D', false),
                    carrot('E', true), carrot('F', false), carrot('G', true), carrot('H', false),
                    carrot('I', true), carrot('J', false)
                ],
                expectedLogic: [
                    { condition: 'carrot_dirty', action: 'wash' }
                ],
                scoring: { passAccuracy: 0.8, threeStarAccuracy: 0.95, maxDamaged: 3, maxDamagedForThreeStars: 1 }
            },
            {
                title: '7-2 คัดขนาดส้มแสนอร่อย',
                brief: 'ส้มลูกใหญ่เข้ากล่องพรีเมียม ส่วนส้มอื่นเข้ากล่องแปรรูป',
                intro: 'ด่านนี้ต้องใช้ Else เพื่อจัดการส้มที่ไม่เข้าเงื่อนไขลูกใหญ่',
                lessonType: 'if_else',
                lessonTypeLabel: 'If / Else',
                theme: 'produce',
                hint: 'ถ้า [ส้มลูกใหญ่] -> [ใส่กล่องพรีเมียม] | นอกเหนือจากนี้ -> [กล่องทำน้ำส้ม]',
                ruleSlots: [{ type: 'if' }, { type: 'else' }],
                conditions: [
                    { id: 'orange_big', label: 'ส้มลูกใหญ่' }
                ],
                actions: [
                    { id: 'premium_box', label: 'ใส่กล่องพรีเมียม', successText: 'ส้มลูกใหญ่เด้งเข้ากล่องพรีเมียม' },
                    { id: 'juice_box', label: 'ใส่กล่องทำน้ำส้ม', successText: 'ส้มขนาดอื่นเข้ากล่องแปรรูปพอดี' }
                ],
                machines: [
                    { slot: 'a', label: 'กล่องพรีเมียม', icon: '🎁', actions: ['premium_box'] },
                    { slot: 'b', label: 'กล่องทำน้ำส้ม', icon: '📦', actions: ['juice_box'] }
                ],
                itemQueue: [
                    orange('A', 'big'), orange('B', 'small'), orange('C', 'small'), orange('D', 'big'),
                    orange('E', 'big'), orange('F', 'small'), orange('G', 'big'), orange('H', 'small'),
                    orange('I', 'small'), orange('J', 'big')
                ],
                expectedLogic: [
                    { condition: 'orange_big', action: 'premium_box' },
                    { condition: 'else', action: 'juice_box' }
                ],
                scoring: { passAccuracy: 0.85, threeStarAccuracy: 0.95, maxDamaged: 3, maxDamagedForThreeStars: 1 }
            },
            {
                title: '7-3 คัดเกรดมะม่วงตามความสุก',
                brief: 'มะม่วงสุกขายแพ็คคู่ มะม่วงดิบทำดอง และมะม่วงเน่าลงถังปุ๋ยหมัก',
                intro: 'ด่านนี้ระบบอ่าน If ก่อน แล้วอ่าน Else If และจบที่ Else',
                lessonType: 'if_else_if_else',
                lessonTypeLabel: 'If / Else If / Else',
                theme: 'produce',
                hint: 'ถ้า [มะม่วงสีเหลืองสุก] -> [ขายแพ็คคู่] | หรือถ้า [มะม่วงสีเขียวดิบ] -> [ทำมะม่วงดอง] | นอกเหนือจากนี้ -> [ถังปุ๋ยหมัก]',
                ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else' }],
                conditions: [
                    { id: 'mango_ripe', label: 'มะม่วงสีเหลืองสุก' },
                    { id: 'mango_raw', label: 'มะม่วงสีเขียวดิบ' }
                ],
                actions: [
                    { id: 'pack_pair', label: 'ขายแพ็คคู่', successText: 'มะม่วงสุกเข้ากล่องแพ็คคู่' },
                    { id: 'pickle', label: 'ทำมะม่วงดอง', successText: 'มะม่วงดิบลงถังดองเรียบร้อย' },
                    { id: 'compost', label: 'ถังปุ๋ยหมัก', successText: 'มะม่วงเน่าไปเป็นปุ๋ยให้ฟาร์ม' }
                ],
                machines: [
                    { slot: 'a', label: 'แพ็คคู่', icon: '🥭', actions: ['pack_pair'] },
                    { slot: 'b', label: 'ถังมะม่วงดอง', icon: '🫙', actions: ['pickle'] },
                    { slot: 'c', label: 'ถังปุ๋ยหมัก', icon: '🍂', actions: ['compost'] }
                ],
                itemQueue: [
                    mango('A', 'ripe'), mango('B', 'raw'), mango('C', 'rotten'), mango('D', 'ripe'),
                    mango('E', 'rotten'), mango('F', 'raw'), mango('G', 'ripe'), mango('H', 'raw'),
                    mango('I', 'rotten'), mango('J', 'ripe')
                ],
                expectedLogic: [
                    { condition: 'mango_ripe', action: 'pack_pair' },
                    { condition: 'mango_raw', action: 'pickle' },
                    { condition: 'else', action: 'compost' }
                ],
                scoring: { passAccuracy: 0.85, threeStarAccuracy: 0.95, maxDamaged: 3, maxDamagedForThreeStars: 1 }
            }
        ]
    };

    function carrot(id, dirty) {
        return {
            key: `carrot_${id}`,
            label: dirty ? 'แครอทเปื้อนโคลน' : 'แครอทสะอาด',
            icon: '🥕',
            props: { type: 'carrot', dirty },
            sensor: dirty ? 'พบคราบโคลนที่ผิวแครอท' : 'ผิวแครอทสะอาดแล้ว',
            expectedAction: dirty ? 'wash' : 'pass',
            feedback: dirty
                ? 'แครอทเปื้อนโคลนหลุดลงตะกร้า ลองใช้เงื่อนไขแครอทเปื้อนโคลน'
                : 'แครอทสะอาดไม่ต้องเข้าเครื่องล้าง ปล่อยผ่านได้เลย'
        };
    }

    function orange(id, size) {
        return {
            key: `orange_${id}`,
            label: size === 'big' ? 'ส้มลูกใหญ่' : 'ส้มลูกเล็ก',
            icon: '🍊',
            props: { type: 'orange', size },
            sensor: size === 'big' ? 'วงแหวนสแกนพบส้มลูกใหญ่' : 'วงแหวนสแกนพบส้มลูกเล็ก',
            expectedAction: size === 'big' ? 'premium_box' : 'juice_box',
            feedback: size === 'big'
                ? 'ส้มลูกใหญ่ควรเข้ากล่องพรีเมียม'
                : 'ส้มลูกเล็กไม่ควรเข้ากล่องพรีเมียม ใช้ Else ส่งไปกล่องทำน้ำส้ม'
        };
    }

    function mango(id, ripeness) {
        const data = {
            ripe: ['มะม่วงสีเหลืองสุก', '🥭', 'mango', 'yellow', 'ripe', 'pack_pair', 'มะม่วงสุกควรขายแพ็คคู่'],
            raw: ['มะม่วงสีเขียวดิบ', '🥭', 'mango', 'green', 'raw', 'pickle', 'มะม่วงดิบควรส่งไปทำมะม่วงดอง'],
            rotten: ['มะม่วงเน่าดำ', '🥭', 'mango', 'black', 'rotten', 'compost', 'มะม่วงเน่าไม่เข้าเงื่อนไขสุกหรือดิบ จึงควรลงถังปุ๋ยหมัก']
        }[ripeness];
        return {
            key: `mango_${id}`,
            label: data[0],
            icon: data[1],
            props: { type: data[2], color: data[3], ripeness: data[4] },
            sensor: `เครื่องสแกนสีอ่านค่า: ${data[0]}`,
            expectedAction: data[5],
            feedback: data[6]
        };
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
