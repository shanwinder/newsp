// Stage 9: Drone Farm Tactics - ภารกิจใหญ่หลายข้อจำกัด
(function () {
    const config = {
        title: 'ด่าน 9: วิกฤตฟาร์มใหญ่',
        subtitle: 'ปรับลำดับ If / Else If และทรัพยากรให้เหมาะกับภารกิจแต่ละ Wave',
        briefing: 'ภารกิจสุดท้ายของบทเงื่อนไขไม่ได้มีคำตอบเดียว ทุก Wave มีเป้าหมายและข้อจำกัดต่างกัน ต้องปรับทั้งสมองโดรนและของที่บรรทุก',
        farmHp: 100,
        droneBattery: 100,
        loadoutCapacity: 6,
        loadoutSlots: 4,
        defaultLoadout: ['basket', 'basket', 'water'],
        harvestTarget: 3,
        badge: 'วิศวกรโดรนฟาร์ม',
        hint: 'ดูชื่อ Wave ปัจจุบันก่อน แล้วเรียงกฎตามสิ่งที่สำคัญที่สุดของภารกิจนั้น',
        winMessage: 'ฟาร์มรอดแล้ว! คุณปรับกฎและทรัพยากรให้เหมาะกับทุกสถานการณ์',
        expectedPriority: ['battery_low', 'rain', 'pest', 'crop_ripe', 'soil_dry', 'else'],
        strictPriority: true,
        ruleSlots: [
            { type: 'if', condition: null, action: null },
            { type: 'else_if', condition: null, action: null },
            { type: 'else_if', condition: null, action: null },
            { type: 'else_if', condition: null, action: null },
            { type: 'else_if', condition: null, action: null },
            { type: 'else', condition: 'else', action: null }
        ],
        cards: {
            conditions: [
                { value: 'battery_low', label: 'แบตต่ำ', icon: 'แบต' },
                { value: 'rain', label: 'ฝนตก', icon: 'ฝน' },
                { value: 'pest', label: 'มีแมลง', icon: 'แมลง' },
                { value: 'crop_ripe', label: 'พืชสุก', icon: 'สุก' },
                { value: 'soil_dry', label: 'ดินแห้ง', icon: 'ดิน' }
            ],
            actions: [
                { value: 'return_base', label: 'กลับฐาน', icon: 'ฐาน' },
                { value: 'skip', label: 'บินต่อ', icon: 'บิน' },
                { value: 'repel_pest', label: 'กำจัดศัตรูพืช', icon: 'พ่น' },
                { value: 'harvest', label: 'เก็บเกี่ยว', icon: 'เก็บ' },
                { value: 'water', label: 'รดน้ำ', icon: 'น้ำ' }
            ]
        },
        waves: [
            {
                name: 'Stage 9-1: วันเก็บเกี่ยว',
                brief: 'เป้าหมายคือเก็บเกี่ยวก่อน ถ้าใช้กฎจากภารกิจแมลงหรือฝนมาก่อนจะเสียจังหวะและไม่ผ่านเต็มดาว',
                rows: 4,
                cols: 6,
                battery: 100,
                defaultLoadout: ['basket', 'basket', 'water'],
                expectedPriority: ['crop_ripe', 'soil_dry'],
                plots: [
                    { id: 'A', name: 'แปลง A', row: 0, col: 1, soil: 'wet', crop: 'ripe', hp: 88, expectedAction: 'harvest', note: 'ผลผลิตสุก ต้องเก็บเกี่ยวก่อน' },
                    { id: 'B', name: 'แปลง B', row: 0, col: 4, soil: 'dry', crop: 'ripe', hp: 72, expectedAction: 'harvest', note: 'สุกและดินแห้ง ภารกิจนี้ให้เก็บก่อน' },
                    { id: 'C', name: 'แปลง C', row: 1, col: 2, soil: 'dry', hp: 60, expectedAction: 'water', note: 'ยังไม่สุก แต่ต้องรดน้ำ' },
                    { id: 'D', name: 'แปลง D', row: 2, col: 5, soil: 'wet', crop: 'ripe', hp: 90, expectedAction: 'harvest', note: 'ตะกร้าต้องมีพอ' },
                    { id: 'E', name: 'แปลง E', row: 3, col: 3, soil: 'wet', hp: 91, expectedAction: 'skip', note: 'ไม่มีงานต้องทำ' }
                ]
            },
            {
                name: 'Stage 9-2: ไร่ป่วยก่อนเก็บเกี่ยว',
                brief: 'บางแปลงมีทั้งแมลงและผลผลิตสุก ถ้าเก็บก่อนกำจัดแมลงจะได้ผลผลิตเสีย',
                rows: 4,
                cols: 6,
                battery: 100,
                defaultLoadout: ['pesticide', 'pesticide', 'basket', 'water'],
                expectedPriority: ['pest', 'crop_ripe', 'soil_dry'],
                plots: [
                    { id: 'F', name: 'แปลง F', row: 0, col: 1, soil: 'wet', pest: true, crop: 'ripe', hp: 64, expectedAction: 'repel_pest', note: 'มีแมลงและสุก ต้องกำจัดแมลงก่อน' },
                    { id: 'G', name: 'แปลง G', row: 0, col: 4, soil: 'wet', crop: 'ripe', hp: 86, expectedAction: 'harvest', note: 'ไม่มีแมลง เก็บเกี่ยวได้' },
                    { id: 'H', name: 'แปลง H', row: 1, col: 3, soil: 'dry', pest: true, hp: 57, expectedAction: 'repel_pest', note: 'แมลงสำคัญกว่ารดน้ำ' },
                    { id: 'I', name: 'แปลง I', row: 2, col: 5, soil: 'dry', crop: 'ripe', hp: 70, expectedAction: 'harvest', note: 'สุกและไม่มีแมลง เก็บก่อน' },
                    { id: 'J', name: 'แปลง J', row: 3, col: 2, soil: 'dry', hp: 60, expectedAction: 'water', note: 'ใช้ถังน้ำสุดท้ายกับแปลงนี้' }
                ]
            },
            {
                name: 'Stage 9-3: ภารกิจสุดท้าย ก่อนพายุเข้า',
                brief: 'แบตเริ่มต่ำและฝนเริ่มมา ต้องตรวจแบตก่อน ฝนก่อน แล้วค่อยจัดการแมลง เก็บเกี่ยว และรดน้ำ',
                rows: 4,
                cols: 7,
                battery: 45,
                defaultLoadout: ['pesticide', 'pesticide', 'basket', 'water'],
                expectedPriority: ['battery_low', 'rain', 'pest', 'crop_ripe', 'soil_dry'],
                plots: [
                    { id: 'K', name: 'แปลง K', row: 0, col: 1, soil: 'wet', rain: true, hp: 82, expectedAction: 'skip', note: 'ฝนตก ให้บินต่อและประหยัดน้ำ' },
                    { id: 'L', name: 'แปลง L', row: 0, col: 4, soil: 'wet', pest: true, hp: 56, expectedAction: 'repel_pest', note: 'กำจัดแมลงก่อนพืชเสียหาย' },
                    { id: 'M', name: 'แปลง M', row: 1, col: 2, soil: 'dry', crop: 'ripe', hp: 70, expectedAction: 'return_base', note: 'มาถึงตรงนี้แบตต่ำ ต้องกลับฐานก่อนเสี่ยงตก' },
                    { id: 'N', name: 'แปลง N', row: 2, col: 5, soil: 'wet', crop: 'ripe', hp: 86, expectedAction: 'harvest', note: 'หลังชาร์จแล้วเก็บเกี่ยวได้' },
                    { id: 'O', name: 'แปลง O', row: 3, col: 3, soil: 'dry', hp: 62, expectedAction: 'water', note: 'ไม่มีฝนแล้ว ใช้น้ำอย่างพอดี' }
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
