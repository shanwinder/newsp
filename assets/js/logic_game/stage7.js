// Stage 7: Agri-Drone Rescue - โดรนรดน้ำฉุกเฉิน
(function () {
    const config = {
        title: 'ด่าน 7: โดรนรดน้ำฉุกเฉิน',
        subtitle: 'ใช้ If-Else ให้โดรนรดน้ำเฉพาะแปลงที่ดินแห้ง',
        briefing: 'แดดแรงทำให้บางแปลงเริ่มเหี่ยว ตั้งกฎให้โดรนช่วยรดน้ำแปลงที่ดินแห้ง และบินสำรวจต่อเมื่อดินยังชื้น',
        farmHp: 100,
        droneBattery: 100,
        droneWater: 100,
        badge: 'ผู้ช่วยรดน้ำอัจฉริยะ',
        hint: 'วางกฎเป็น: ถ้าดินแห้ง -> รดน้ำ / มิฉะนั้น -> สำรวจต่อ',
        winMessage: 'Perfect Water! โดรนรดน้ำเฉพาะแปลงที่ต้องการน้ำและบินผ่านแปลงที่ดินชื้น',
        expectedPriority: ['soil_dry', 'else'],
        strictPriority: true,
        ruleSlots: [
            { type: 'if', condition: null, action: null },
            { type: 'else', condition: 'else', action: null }
        ],
        cards: {
            conditions: [
                { value: 'soil_dry', label: 'ดินแห้ง', icon: '🟫' }
            ],
            actions: [
                { value: 'water', label: 'รดน้ำ', icon: '💧' },
                { value: 'skip', label: 'สำรวจต่อ', icon: '🛰️' }
            ]
        },
        waves: [{
            name: 'ภารกิจ: แดดแรงกลางฟาร์ม',
            brief: 'สแกน 3 แปลง แล้วช่วยเฉพาะแปลงที่ดินแห้ง',
            plots: [
                {
                    id: 'A',
                    name: 'แปลง A',
                    soil: 'dry',
                    rain: false,
                    pest: false,
                    crop: 'growing',
                    hp: 62,
                    expectedAction: 'water',
                    note: 'ดินแห้ง พืชเริ่มเหี่ยว',
                    position: { x: 8, y: 10 }
                },
                {
                    id: 'B',
                    name: 'แปลง B',
                    soil: 'wet',
                    rain: false,
                    pest: false,
                    crop: 'growing',
                    hp: 90,
                    expectedAction: 'skip',
                    note: 'ดินชื้น พืชยังสดชื่น',
                    position: { x: 39, y: 30 }
                },
                {
                    id: 'C',
                    name: 'แปลง C',
                    soil: 'dry',
                    rain: false,
                    pest: false,
                    crop: 'growing',
                    hp: 66,
                    expectedAction: 'water',
                    note: 'ดินแห้ง พืชต้องการน้ำ',
                    position: { x: 13, y: 58 }
                }
            ]
        }]
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
