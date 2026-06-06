// Stage 7: Drone Farm Tactics - พื้นฐาน If / Else
(function () {
    const config = {
        title: 'ด่าน 7: Drone Farm Tactics',
        subtitle: 'วางกฎ If / Else ให้โดรนรดน้ำเฉพาะแปลงที่ต้องการ',
        briefing: 'เริ่มจากภารกิจง่าย ๆ: เลือกน้ำให้พอดี ตั้งกฎให้โดรนอ่านสภาพดิน แล้วบินดูแลแปลงแบบไม่ใช้น้ำมั่ว',
        farmHp: 100,
        droneBattery: 100,
        loadoutCapacity: 6,
        loadoutSlots: 4,
        defaultLoadout: ['water', 'water'],
        badge: 'นักบินโดรนดูแลดิน',
        hint: 'กฎพื้นฐานคือ: ถ้า [ดินแห้ง] -> [รดน้ำ] / มิฉะนั้น -> [บินต่อ]',
        winMessage: 'โดรนรดน้ำถูกแปลงและจัดทรัพยากรได้พอดี',
        expectedPriority: ['soil_dry', 'else'],
        strictPriority: true,
        ruleSlots: [
            { type: 'if', condition: null, action: null },
            { type: 'else', condition: 'else', action: null }
        ],
        cards: {
            conditions: [
                { value: 'soil_dry', label: 'ดินแห้ง', icon: 'ดิน' }
            ],
            actions: [
                { value: 'water', label: 'รดน้ำ', icon: 'น้ำ' },
                { value: 'skip', label: 'บินต่อ', icon: 'บิน' }
            ]
        },
        waves: [
            {
                name: 'Stage 7-1: รดน้ำให้ถูกแปลง',
                brief: 'รดน้ำเฉพาะช่องดินแห้ง 2 ช่อง แล้วบินผ่านช่องที่ดินชื้น',
                rows: 2,
                cols: 5,
                battery: 100,
                defaultLoadout: ['water', 'water'],
                expectedPriority: ['soil_dry', 'else'],
                plots: [
                    { id: 'A', name: 'แปลง A', row: 0, col: 1, soil: 'dry', hp: 62, expectedAction: 'water', note: 'ดินแห้ง พืชเริ่มเหี่ยว' },
                    { id: 'B', name: 'แปลง B', row: 0, col: 3, soil: 'wet', hp: 88, expectedAction: 'skip', note: 'ดินชื้น ไม่ต้องใช้น้ำ' },
                    { id: 'C', name: 'แปลง C', row: 1, col: 2, soil: 'dry', hp: 65, expectedAction: 'water', note: 'ต้องการน้ำอีกหนึ่งถัง' }
                ]
            },
            {
                name: 'Stage 7-2: อย่ารดน้ำมั่ว',
                brief: 'น้ำมีแค่ 2 ถัง ถ้ารดน้ำดินชื้นจะไม่พอสำหรับแปลงที่จำเป็น',
                rows: 3,
                cols: 5,
                battery: 100,
                defaultLoadout: ['water', 'water'],
                expectedPriority: ['soil_dry', 'else'],
                plots: [
                    { id: 'D', name: 'แปลง D', row: 0, col: 1, soil: 'wet', hp: 92, expectedAction: 'skip', note: 'ดินชื้น ห้ามรดน้ำ' },
                    { id: 'E', name: 'แปลง E', row: 0, col: 4, soil: 'dry', hp: 58, expectedAction: 'water', note: 'ดินแห้ง ต้องใช้น้ำ' },
                    { id: 'F', name: 'แปลง F', row: 1, col: 2, soil: 'wet', hp: 90, expectedAction: 'skip', note: 'ถ้ารดน้ำจะน้ำขัง' },
                    { id: 'G', name: 'แปลง G', row: 2, col: 3, soil: 'dry', hp: 61, expectedAction: 'water', note: 'แปลงสุดท้ายที่ต้องรดน้ำ' }
                ]
            },
            {
                name: 'Stage 7-3: น้ำกับแบตพอดีเป๊ะ',
                brief: 'เลือกบรรทุกน้ำให้พอดี ถ้าหนักเกินแบตจะลดเร็ว แต่ถ้าน้ำน้อยเกินจะรดน้ำไม่ครบ',
                rows: 3,
                cols: 6,
                battery: 100,
                defaultLoadout: ['water', 'water', 'water'],
                expectedPriority: ['soil_dry', 'else'],
                plots: [
                    { id: 'H', name: 'แปลง H', row: 0, col: 1, soil: 'dry', hp: 55, expectedAction: 'water', note: 'ต้องใช้น้ำถังที่ 1' },
                    { id: 'I', name: 'แปลง I', row: 0, col: 4, soil: 'wet', hp: 86, expectedAction: 'skip', note: 'บินผ่านเพื่อประหยัดน้ำ' },
                    { id: 'J', name: 'แปลง J', row: 1, col: 3, soil: 'dry', hp: 59, expectedAction: 'water', note: 'ต้องใช้น้ำถังที่ 2' },
                    { id: 'K', name: 'แปลง K', row: 2, col: 2, soil: 'dry', hp: 57, expectedAction: 'water', note: 'ต้องใช้น้ำถังที่ 3' }
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
