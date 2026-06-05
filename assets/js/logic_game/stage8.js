// Stage 8: Agri-Drone Rescue - พายุมาแล้ว เรียงเงื่อนไขให้ทัน
(function () {
    const config = {
        title: 'ด่าน 8: พายุมาแล้ว เรียงเงื่อนไขให้ทัน',
        subtitle: 'ใช้ Else If และจัดลำดับให้โดรนตรวจฝนก่อนดินแห้ง',
        briefing: 'เมฆฝนกำลังเคลื่อนเข้าฟาร์ม ถ้าโดรนตรวจดินแห้งก่อนฝนตก มันจะรดน้ำซ้ำจนแปลงน้ำท่วม',
        farmHp: 100,
        droneBattery: 100,
        droneWater: 100,
        badge: 'นักบินโดรนฝ่าพายุ',
        hint: 'วางกฎเป็น: ถ้าฝนตก -> กลับฐาน / มิฉะนั้นถ้าดินแห้ง -> รดน้ำ / มิฉะนั้น -> สำรวจต่อ',
        winMessage: 'Storm Safe! คุณเรียงเงื่อนไขถูก โดรนจึงหลบฝนก่อนคิดจะรดน้ำ',
        expectedPriority: ['rain', 'soil_dry', 'else'],
        strictPriority: true,
        ruleSlots: [
            { type: 'if', condition: null, action: null },
            { type: 'else_if', condition: null, action: null },
            { type: 'else', condition: 'else', action: null }
        ],
        cards: {
            conditions: [
                { value: 'rain', label: 'ฝนตก', icon: '⛈️' },
                { value: 'soil_dry', label: 'ดินแห้ง', icon: '🟫' }
            ],
            actions: [
                { value: 'return_base', label: 'กลับฐาน', icon: '🏠' },
                { value: 'water', label: 'รดน้ำ', icon: '💧' },
                { value: 'skip', label: 'สำรวจต่อ', icon: '🛰️' }
            ]
        },
        waves: [{
            name: 'ภารกิจ: พายุเข้าฟาร์ม',
            brief: 'แปลง A มีทั้งฝนตกและดินแห้ง ต้องให้โดรนหลบฝนก่อน',
            plots: [
                {
                    id: 'A',
                    name: 'แปลง A',
                    soil: 'dry',
                    rain: true,
                    pest: false,
                    crop: 'growing',
                    hp: 70,
                    expectedAction: 'return_base',
                    note: 'ฝนตกและดินแห้ง ระวังรดน้ำซ้ำ',
                    position: { x: 9, y: 10 }
                },
                {
                    id: 'B',
                    name: 'แปลง B',
                    soil: 'dry',
                    rain: false,
                    pest: false,
                    crop: 'growing',
                    hp: 65,
                    expectedAction: 'water',
                    note: 'ไม่มีฝนและดินแห้ง',
                    position: { x: 42, y: 32 }
                },
                {
                    id: 'C',
                    name: 'แปลง C',
                    soil: 'wet',
                    rain: false,
                    pest: false,
                    crop: 'growing',
                    hp: 90,
                    expectedAction: 'skip',
                    note: 'ดินชื้นและปลอดภัย',
                    position: { x: 14, y: 58 }
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
