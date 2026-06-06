// Stage 8: Drone Farm Tactics - Else If และลำดับความสำคัญ
(function () {
    const config = {
        title: 'ด่าน 8: เรียงเงื่อนไขให้โดรนคิดเป็น',
        subtitle: 'ใช้ Else If เพื่อจัดลำดับภารกิจเมื่อแปลงเดียวมีหลายสถานะ',
        briefing: 'แปลงเดียวอาจมีมากกว่าหนึ่งปัญหา ลำดับกฎจึงสำคัญมาก เพราะโดรนอ่านกฎจากบนลงล่างและทำคำสั่งแรกที่เข้าเงื่อนไข',
        farmHp: 100,
        droneBattery: 100,
        loadoutCapacity: 6,
        loadoutSlots: 4,
        defaultLoadout: ['water', 'water', 'pesticide', 'fertilizer'],
        badge: 'นักจัดลำดับภารกิจโดรน',
        hint: 'อ่านภารกิจของ Wave ปัจจุบัน แล้วเรียงเงื่อนไขเร่งด่วนที่สุดไว้ด้านบน',
        winMessage: 'คุณใช้ Else If จัดลำดับภารกิจให้โดรนได้ถูกต้อง',
        expectedPriority: ['rain', 'pest', 'need_fertilizer', 'soil_dry', 'else'],
        strictPriority: true,
        ruleSlots: [
            { type: 'if', condition: null, action: null },
            { type: 'else_if', condition: null, action: null },
            { type: 'else_if', condition: null, action: null },
            { type: 'else_if', condition: null, action: null },
            { type: 'else', condition: 'else', action: null }
        ],
        cards: {
            conditions: [
                { value: 'rain', label: 'ฝนตก', icon: 'ฝน' },
                { value: 'pest', label: 'มีแมลง', icon: 'แมลง' },
                { value: 'need_fertilizer', label: 'พืชขาดปุ๋ย', icon: 'ปุ๋ย' },
                { value: 'soil_dry', label: 'ดินแห้ง', icon: 'ดิน' }
            ],
            actions: [
                { value: 'skip', label: 'บินต่อ', icon: 'บิน' },
                { value: 'repel_pest', label: 'กำจัดศัตรูพืช', icon: 'พ่น' },
                { value: 'fertilize', label: 'ใส่ปุ๋ย', icon: 'ปุ๋ย' },
                { value: 'water', label: 'รดน้ำ', icon: 'น้ำ' }
            ]
        },
        waves: [
            {
                name: 'Stage 8-1: ปุ๋ยก่อนน้ำหรืออะไรก่อนดี',
                brief: 'บางช่องมีทั้งขาดปุ๋ยและดินแห้ง ต้องใส่ปุ๋ยก่อนเพื่อให้พืชฟื้นเต็มที่',
                rows: 3,
                cols: 6,
                battery: 100,
                defaultLoadout: ['water', 'water', 'fertilizer'],
                expectedPriority: ['need_fertilizer', 'soil_dry'],
                plots: [
                    { id: 'A', name: 'แปลง A', row: 0, col: 1, soil: 'dry', needFertilizer: true, hp: 54, expectedAction: 'fertilize', note: 'ขาดปุ๋ยและดินแห้ง ให้แก้ปุ๋ยก่อน' },
                    { id: 'B', name: 'แปลง B', row: 0, col: 4, soil: 'dry', hp: 62, expectedAction: 'water', note: 'ดินแห้งอย่างเดียว' },
                    { id: 'C', name: 'แปลง C', row: 1, col: 3, soil: 'wet', hp: 88, expectedAction: 'skip', note: 'ไม่มีงานต้องทำ' },
                    { id: 'D', name: 'แปลง D', row: 2, col: 2, soil: 'dry', hp: 60, expectedAction: 'water', note: 'ใช้น้ำอีกถังอย่างพอดี' }
                ]
            },
            {
                name: 'Stage 8-2: แมลงบุก ต้องจัดการก่อน',
                brief: 'ถ้าแปลงมีแมลง แม้ดินจะแห้งก็ต้องกำจัดแมลงก่อน',
                rows: 3,
                cols: 6,
                battery: 100,
                defaultLoadout: ['water', 'water', 'pesticide', 'pesticide'],
                expectedPriority: ['pest', 'soil_dry'],
                plots: [
                    { id: 'E', name: 'แปลง E', row: 0, col: 2, soil: 'dry', pest: true, hp: 52, expectedAction: 'repel_pest', note: 'มีแมลงและดินแห้ง แมลงเร่งด่วนกว่า' },
                    { id: 'F', name: 'แปลง F', row: 1, col: 4, soil: 'wet', pest: true, hp: 58, expectedAction: 'repel_pest', note: 'แมลงกำลังกัดใบ' },
                    { id: 'G', name: 'แปลง G', row: 2, col: 1, soil: 'dry', hp: 61, expectedAction: 'water', note: 'ไม่มีแมลง จึงรดน้ำได้' },
                    { id: 'H', name: 'แปลง H', row: 2, col: 5, soil: 'wet', hp: 91, expectedAction: 'skip', note: 'ปลอดภัย' }
                ]
            },
            {
                name: 'Stage 8-3: ฝนกำลังมา อย่าทำน้ำท่วม',
                brief: 'ถ้าฝนตก ให้บินต่อก่อนเสมอ ไม่อย่างนั้นดินแห้ง + ฝนตกจะถูกสั่งรดน้ำจนเสียหาย',
                rows: 4,
                cols: 6,
                battery: 100,
                defaultLoadout: ['water', 'water', 'fertilizer'],
                expectedPriority: ['rain', 'soil_dry', 'need_fertilizer'],
                plots: [
                    { id: 'I', name: 'แปลง I', row: 0, col: 1, soil: 'dry', rain: true, hp: 64, expectedAction: 'skip', note: 'ฝนตกอยู่ ห้ามรดน้ำซ้ำ' },
                    { id: 'J', name: 'แปลง J', row: 1, col: 3, soil: 'dry', hp: 59, expectedAction: 'water', note: 'ไม่มีฝนและดินแห้ง' },
                    { id: 'K', name: 'แปลง K', row: 2, col: 4, soil: 'wet', needFertilizer: true, hp: 63, expectedAction: 'fertilize', note: 'ดินชื้นแต่ขาดปุ๋ย' },
                    { id: 'L', name: 'แปลง L', row: 3, col: 2, soil: 'wet', hp: 88, expectedAction: 'skip', note: 'ไม่มีงานต้องทำ' }
                ]
            }
        ]
    };

    function boot() {
        window.FarmMissions.agriDroneRescue(config);
    }

    if (window.FarmMissions) {
        boot();
    } else {
        const script = document.createElement('script');
        script.src = '../assets/js/logic_game/farm_missions.js';
        script.onload = boot;
        document.head.appendChild(script);
    }
})();
