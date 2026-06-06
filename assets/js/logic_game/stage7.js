// Stage 7: Smart Farm Manager - Produce Sorting with If.
(function () {
    const config = {
        title: 'บทที่ 3: ผู้จัดการฟาร์มอัจฉริยะ',
        subtitle: 'เกมที่ 1: โรงคัดแยกผลผลิตของพี่สมปอง | ฝึกใช้ If เท่านั้น',
        resultText: 'คุณเขียนกฎ If เพื่อคัดแยกผลผลิตครบทั้ง 3 ภารกิจแล้ว',
        levels: [
            {
                title: '7-1 แครอทเปื้อนโคลน',
                mission: 'ส่งแครอทเปื้อนโคลนเข้าเครื่องล้าง',
                brief: 'แครอทเปื้อนโคลนต้องเข้าล้าง ส่วนแครอทสะอาดปล่อยผ่านอัตโนมัติ',
                intro: 'ใช้กฎ If เพียงบรรทัดเดียว: ถ้าเจอแครอทเปื้อนโคลน ให้ส่งไปเครื่องล้าง',
                lessonType: 'if',
                lessonTypeLabel: 'If',
                theme: 'produce',
                hint: 'ถ้า [แครอทเปื้อนโคลน] -> [ส่งเข้าเครื่องล้าง]',
                ruleSlots: [{ type: 'if' }],
                conditions: [
                    { id: 'dirty_carrot', label: 'แครอทเปื้อนโคลน', match: { type: 'carrot', dirty: true } }
                ],
                actions: [
                    { id: 'wash', label: 'ส่งเข้าเครื่องล้าง', successText: 'เครื่องล้างพ่นน้ำ แครอทสะอาดเด้งลงตะกร้า' },
                    { id: 'pass', label: 'ปล่อยผ่านอัตโนมัติ', successText: 'แครอทสะอาดลงตะกร้าโดยไม่ต้องล้างซ้ำ' }
                ],
                machines: [
                    { slot: 'a', label: 'เครื่องล้าง', icon: '🚿', actions: ['wash'] },
                    { slot: 'pass', label: 'ตะกร้าสะอาด', icon: '🧺', actions: ['pass'] }
                ],
                itemQueue: [
                    carrot('A', true), carrot('B', false), carrot('C', true), carrot('D', false),
                    carrot('E', true), carrot('F', false), carrot('G', true), carrot('H', false),
                    carrot('I', true), carrot('J', false), carrot('K', true), carrot('L', false)
                ],
                expectedLogic: [{ condition: 'dirty_carrot', action: 'wash' }],
                scoring: defaultScoring()
            },
            {
                title: '7-2 ไข่ร้าวต้องแยกออก',
                mission: 'ส่งไข่ร้าวเข้าถาดคัดทิ้ง',
                brief: 'ไข่มีรอยร้าวต้องแยกออก ส่วนไข่ดีปล่อยผ่านไปกล่องขาย',
                intro: 'ยังใช้ If เท่านั้น แต่ต้องสังเกตรอยแตกที่เล็กลง',
                lessonType: 'if',
                lessonTypeLabel: 'If',
                theme: 'produce',
                hint: 'ถ้า [ไข่มีรอยร้าว] -> [ส่งเข้าถาดคัดทิ้ง]',
                ruleSlots: [{ type: 'if' }],
                conditions: [
                    { id: 'cracked_egg', label: 'ไข่มีรอยร้าว', match: { type: 'egg', cracked: true } }
                ],
                actions: [
                    { id: 'reject_tray', label: 'ส่งเข้าถาดคัดทิ้ง', successText: 'ไข่ร้าวถูกวางลงถาดคัดทิ้งอย่างปลอดภัย' },
                    { id: 'pass', label: 'ปล่อยผ่านกล่องขาย', successText: 'ไข่ดีเข้ากล่องขายเรียบร้อย' }
                ],
                machines: [
                    { slot: 'a', label: 'ถาดคัดทิ้ง', icon: '🧺', actions: ['reject_tray'] },
                    { slot: 'pass', label: 'กล่องขาย', icon: '📦', actions: ['pass'] }
                ],
                itemQueue: [
                    egg('A', true), egg('B', false), egg('C', false), egg('D', true),
                    egg('E', false), egg('F', true), egg('G', false), egg('H', true),
                    egg('I', false), egg('J', true), egg('K', false), egg('L', true)
                ],
                expectedLogic: [{ condition: 'cracked_egg', action: 'reject_tray' }],
                scoring: defaultScoring()
            },
            {
                title: '7-3 ผักมีหนอนต้องตรวจพิเศษ',
                mission: 'ส่งผักที่มีหนอนไปโต๊ะตรวจพิเศษ',
                brief: 'ผักหลายชนิดวิ่งเร็วขึ้นเล็กน้อย ถ้ามีหนอนต้องแยกไปตรวจ',
                intro: 'ด่านสุดท้ายของเกม If มีตัวหลอกหลายชนิด แต่โครงสร้างกฎยังเป็น If บรรทัดเดียว',
                lessonType: 'if',
                lessonTypeLabel: 'If',
                theme: 'produce',
                hint: 'ถ้า [ผักมีหนอน] -> [ส่งไปโต๊ะตรวจพิเศษ]',
                ruleSlots: [{ type: 'if' }],
                conditions: [
                    { id: 'wormy_vegetable', label: 'ผักมีหนอน', match: { category: 'vegetable', worm: true } }
                ],
                actions: [
                    { id: 'inspect_table', label: 'ส่งไปโต๊ะตรวจพิเศษ', successText: 'โต๊ะตรวจเปิดแว่นขยายและแยกผักมีหนอนออก' },
                    { id: 'pass', label: 'ปล่อยผ่านลงตะกร้า', successText: 'ผักปกติลงตะกร้าขายได้' }
                ],
                machines: [
                    { slot: 'a', label: 'โต๊ะตรวจพิเศษ', icon: '🔎', actions: ['inspect_table'] },
                    { slot: 'pass', label: 'ตะกร้าผักดี', icon: '🧺', actions: ['pass'] }
                ],
                itemQueue: [
                    vegetable('A', 'lettuce', true), vegetable('B', 'cabbage', false),
                    vegetable('C', 'bok_choy', false), vegetable('D', 'lettuce', true),
                    vegetable('E', 'spinach', false), vegetable('F', 'cabbage', true),
                    vegetable('G', 'bok_choy', false), vegetable('H', 'spinach', true),
                    vegetable('I', 'lettuce', false), vegetable('J', 'cabbage', false),
                    vegetable('K', 'bok_choy', true), vegetable('L', 'spinach', false)
                ],
                expectedLogic: [{ condition: 'wormy_vegetable', action: 'inspect_table' }],
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
        return {
            key,
            path: `../assets/img/conveyor/produce/${key}.png`,
            width: 96,
            height: 96,
            description,
            futureSpriteSheet: {
                path: `../assets/img/conveyor/produce/${key}_sheet.png`,
                frameWidth: 96,
                frameHeight: 96,
                animations: ['idle', 'move', 'bounce_correct', 'drop_wrong']
            }
        };
    }

    function carrot(id, dirty) {
        return {
            id: `carrot_${id}`,
            label: dirty ? 'แครอทเปื้อนโคลน' : 'แครอทสะอาด',
            fallbackIcon: '🥕',
            asset: asset(dirty ? 'dirty_carrot' : 'clean_carrot', dirty ? 'ภาพแครอทมีคราบโคลน' : 'ภาพแครอทสะอาด'),
            props: { type: 'carrot', dirty },
            sensor: dirty ? 'เครื่องสแกนพบคราบโคลนบนแครอท' : 'เครื่องสแกนพบแครอทสะอาด',
            expectedAction: dirty ? 'wash' : 'pass',
            feedback: dirty ? 'แครอทเปื้อนโคลนควรเข้าเครื่องล้าง' : 'แครอทสะอาดไม่ต้องล้างซ้ำ'
        };
    }

    function egg(id, cracked) {
        return {
            id: `egg_${id}`,
            label: cracked ? 'ไข่มีรอยร้าว' : 'ไข่ดี',
            fallbackIcon: '🥚',
            asset: asset(cracked ? 'cracked_egg' : 'good_egg', cracked ? 'ภาพไข่มีรอยร้าว' : 'ภาพไข่ดีไม่มีรอยแตก'),
            props: { type: 'egg', cracked },
            sensor: cracked ? 'เลนส์สแกนพบรอยร้าวบนเปลือกไข่' : 'เปลือกไข่เรียบ ไม่มีรอยแตก',
            expectedAction: cracked ? 'reject_tray' : 'pass',
            feedback: cracked ? 'ไข่ร้าวควรถูกคัดออกก่อนลงกล่องขาย' : 'ไข่ดีควรปล่อยผ่านไปกล่องขาย'
        };
    }

    function vegetable(id, type, worm) {
        const labels = {
            lettuce: 'ผักกาดหอม',
            cabbage: 'กะหล่ำปลี',
            bok_choy: 'ผักกวางตุ้ง',
            spinach: 'ผักโขม'
        };
        return {
            id: `veg_${type}_${id}`,
            label: worm ? `${labels[type]}มีหนอน` : labels[type],
            fallbackIcon: worm ? '🐛' : '🥬',
            asset: asset(worm ? `${type}_worm` : `${type}_clean`, worm ? `ภาพ${labels[type]}มีหนอน` : `ภาพ${labels[type]}ปกติ`),
            props: { category: 'vegetable', type, worm },
            sensor: worm ? `พบหนอนบน${labels[type]}` : `${labels[type]}ไม่มีหนอน`,
            expectedAction: worm ? 'inspect_table' : 'pass',
            feedback: worm ? 'ผักมีหนอนต้องไปโต๊ะตรวจพิเศษ' : 'ผักปกติควรปล่อยผ่านลงตะกร้า'
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
