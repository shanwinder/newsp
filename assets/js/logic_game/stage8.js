// Stage 8: Water Hero - พายุฝนถล่มสวน
(function () {
    const config = {
        title: 'ด่าน 8: พายุฝนถล่มสวน',
        subtitle: 'จัดลำดับเงื่อนไขให้ถูกต้อง ฝนตกต้องมาก่อนดินแห้ง',
        mode: 'storm',
        timeLimit: 50,
        gardenHp: 100,
        badge: 'ผู้พิชิตพายุ',
        hint: 'วางกฎเป็น: ถ้าฝนตก -> หยุดรดน้ำ / มิฉะนั้นถ้าดินแห้ง -> รดน้ำ / มิฉะนั้น -> หยุดรดน้ำ',
        winMessage: 'คุณตรวจฝนก่อนดินแห้ง ระบบจึงไม่รดน้ำซ้ำตอนฝนตก',
        expectedPriority: ['rain', 'soil_dry', 'else'],
        ruleSlots: [
            { type: 'if' },
            { type: 'else_if' },
            { type: 'else' }
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
        plots: [
            {
                name: 'แปลง A',
                soil: 'dry',
                rain: true,
                tank: 'ready',
                hp: 70,
                expectedAction: 'stop',
                note: 'ฝนตกและดินแห้ง ต้องระวังน้ำท่วม'
            },
            {
                name: 'แปลง B',
                soil: 'dry',
                rain: false,
                tank: 'ready',
                hp: 65,
                expectedAction: 'water',
                note: 'ไม่มีฝนและดินแห้ง'
            },
            {
                name: 'แปลง C',
                soil: 'wet',
                rain: false,
                tank: 'ready',
                hp: 90,
                expectedAction: 'stop',
                note: 'ไม่มีฝนแต่ดินยังชื้น'
            }
        ]
    };

    function boot() {
        window.FarmMissions.conditionDefense(config);
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
