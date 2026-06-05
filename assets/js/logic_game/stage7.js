// Stage 7: Water Hero - สวนเหี่ยวกลางแดด
(function () {
    const config = {
        title: 'ด่าน 7: สวนเหี่ยวกลางแดด',
        subtitle: 'ภารกิจฮีโร่หยดน้ำ: สร้างกฎ If-Else เพื่อช่วยพืชที่ดินแห้ง',
        mode: 'sun',
        timeLimit: 40,
        gardenHp: 100,
        badge: 'นักตรวจดิน',
        hint: 'วางกฎเป็น: ถ้าดินแห้ง -> รดน้ำ / มิฉะนั้น -> หยุดรดน้ำ',
        winMessage: 'คุณใช้ If-Else ได้ถูกต้อง ดินแห้งได้รับน้ำ ส่วนดินชื้นไม่ถูกรดน้ำเพิ่ม',
        expectedPriority: ['soil_dry', 'else'],
        ruleSlots: [
            { type: 'if' },
            { type: 'else' }
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
        plots: [
            {
                name: 'แปลง A',
                soil: 'dry',
                rain: false,
                tank: 'ready',
                hp: 60,
                expectedAction: 'water',
                note: 'ดินแห้ง พืชเริ่มเหี่ยว แดดจอมเผากำลังโจมตี'
            },
            {
                name: 'แปลง B',
                soil: 'wet',
                rain: false,
                tank: 'ready',
                hp: 90,
                expectedAction: 'stop',
                note: 'ดินชื้นพอดี ต้นกล้ายังสดชื่น'
            }
        ]
    };

    function boot() {
        window.FarmMissions.waterHero(config);
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
