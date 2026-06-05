// Stage 7: Smart Farm Defense - แดดบุกสวน
(function () {
    const config = {
        title: 'ด่าน 7: แดดบุกสวน',
        subtitle: 'ใช้ If-Else เพื่อเปิดน้ำเมื่อดินแห้ง และหยุดน้ำเมื่อดินชื้น',
        mode: 'sun',
        lanes: 2,
        timeLimit: 45,
        gardenHp: 100,
        tankWater: 100,
        badge: 'นักป้องกันแดด',
        hint: 'วางกฎเป็น: ถ้าดินแห้ง -> รดน้ำ / มิฉะนั้น -> หยุดรดน้ำ',
        winMessage: 'ยอดเยี่ยม! ระบบตรวจพบดินแห้งแล้วเปิดน้ำช่วยพืชทันเวลา ส่วนดินชื้นไม่ถูกรดน้ำเพิ่ม',
        expectedPriority: ['soil_dry', 'else'],
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
                { value: 'stop', label: 'หยุดรดน้ำ', icon: '✋' }
            ]
        },
        waves: [{
            name: 'Wave 1: แดดแรง',
            lanes: [
            {
                lane: 1,
                name: 'แปลง A',
                soil: 'dry',
                rain: false,
                tank: 'ready',
                hp: 60,
                enemy: 'sun',
                expectedAction: 'water',
                note: 'ดินแห้ง พืชเริ่มเหี่ยว แดดจอมเผากำลังโจมตี'
            },
            {
                lane: 2,
                name: 'แปลง B',
                soil: 'wet',
                rain: false,
                tank: 'ready',
                hp: 90,
                enemy: null,
                expectedAction: 'stop',
                note: 'ดินชื้นพอดี ต้นกล้ายังสดชื่น'
            }
            ]
        }]
    };

    function boot() {
        window.FarmMissions.smartFarmDefense(config);
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
