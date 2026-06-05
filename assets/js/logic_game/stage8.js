// Stage 8: Smart Farm Defense - พายุฝนหลอกระบบ
(function () {
    const config = {
        title: 'ด่าน 8: พายุฝนหลอกระบบ',
        subtitle: 'ตรวจฝนตกก่อนดินแห้ง เพื่อหยุดน้ำและป้องกันน้ำท่วม',
        mode: 'storm',
        lanes: 3,
        timeLimit: 60,
        gardenHp: 100,
        tankWater: 100,
        badge: 'ผู้พิชิตพายุ',
        hint: 'วางกฎเป็น: ถ้าฝนตก -> หยุดรดน้ำ / มิฉะนั้นถ้าดินแห้ง -> รดน้ำ / มิฉะนั้น -> หยุดรดน้ำ',
        winMessage: 'Storm Guard! คุณตรวจฝนก่อนดินแห้ง ระบบจึงไม่รดน้ำซ้ำตอนฝนกำลังตก',
        expectedPriority: ['rain', 'soil_dry', 'else'],
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
                { value: 'stop', label: 'หยุดรดน้ำ', icon: '✋' },
                { value: 'water', label: 'รดน้ำ', icon: '💧' }
            ]
        },
        waves: [{
            name: 'Wave 1: ฝนมาแล้ว',
            lanes: [
            {
                lane: 1,
                name: 'แปลง A',
                soil: 'dry',
                rain: true,
                tank: 'ready',
                hp: 70,
                enemy: 'rainCloud',
                expectedAction: 'stop',
                note: 'ฝนตกและดินแห้ง ต้องระวังน้ำท่วม'
            },
            {
                lane: 2,
                name: 'แปลง B',
                soil: 'dry',
                rain: false,
                tank: 'ready',
                hp: 65,
                enemy: 'sun',
                expectedAction: 'water',
                note: 'ไม่มีฝนและดินแห้ง'
            },
            {
                lane: 3,
                name: 'แปลง C',
                soil: 'wet',
                rain: false,
                tank: 'ready',
                hp: 90,
                enemy: null,
                expectedAction: 'stop',
                note: 'ไม่มีฝนแต่ดินยังชื้น'
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
