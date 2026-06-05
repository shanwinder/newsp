// Stage 9: Water Hero - บอสถังน้ำรั่วกับเมฆดำ
(function () {
    const config = {
        title: 'ด่าน 9: บอสถังน้ำรั่วกับเมฆดำ',
        subtitle: 'ใช้หลายเงื่อนไขและจัดลำดับให้ถูกต้อง เพื่อกำจัดบอสและป้องกันสวน',
        mode: 'boss',
        timeLimit: 60,
        gardenHp: 100,
        bossHp: 100,
        badge: 'วิศวกรระบบน้ำอัจฉริยะ',
        hint: 'วางกฎเป็น: ถ้าถังน้ำหมด -> แจ้งเตือนเติมน้ำ / มิฉะนั้นถ้าฝนตก -> หยุดรดน้ำ / มิฉะนั้นถ้าดินแห้ง -> รดน้ำ / มิฉะนั้น -> สังเกตต่อ',
        winMessage: 'ระบบของคุณตรวจถังน้ำ ฝน และดินแห้งได้ถูกลำดับ สวนปล่อยพลังหยดน้ำกำจัดบอสสำเร็จ',
        expectedPriority: ['tank_empty', 'rain', 'soil_dry', 'else'],
        ruleSlots: [
            { type: 'if' },
            { type: 'else_if' },
            { type: 'else_if' },
            { type: 'else' }
        ],
        cards: {
            conditions: [
                { value: 'tank_empty', label: 'ถังน้ำหมด', icon: '🪣' },
                { value: 'rain', label: 'ฝนตก', icon: '⛈️' },
                { value: 'soil_dry', label: 'ดินแห้ง', icon: '🟫' }
            ],
            actions: [
                { value: 'refill', label: 'แจ้งเติมน้ำ', icon: '🚨' },
                { value: 'stop', label: 'หยุดรดน้ำ', icon: '✋' },
                { value: 'water', label: 'รดน้ำ', icon: '💧' },
                { value: 'observe', label: 'สังเกตต่อ', icon: '👀' }
            ]
        },
        waves: [
            {
                name: 'Wave 1: แดดแรง',
                mode: 'sun',
                plots: [
                    {
                        name: 'แปลง A',
                        soil: 'dry',
                        rain: false,
                        tank: 'ready',
                        hp: 60,
                        expectedAction: 'water',
                        note: 'ดินแห้ง ไม่มีฝน ถังน้ำพร้อม'
                    },
                    {
                        name: 'แปลง B',
                        soil: 'wet',
                        rain: false,
                        tank: 'ready',
                        hp: 90,
                        expectedAction: 'observe',
                        note: 'ดินชื้นและปลอดภัย'
                    }
                ]
            },
            {
                name: 'Wave 2: ฝนถล่ม',
                mode: 'storm',
                plots: [
                    {
                        name: 'แปลง A',
                        soil: 'dry',
                        rain: true,
                        tank: 'ready',
                        hp: 70,
                        expectedAction: 'stop',
                        note: 'ฝนตก แม้ดินแห้งก็ห้ามรดน้ำเพิ่ม'
                    },
                    {
                        name: 'แปลง B',
                        soil: 'wet',
                        rain: true,
                        tank: 'ready',
                        hp: 85,
                        expectedAction: 'stop',
                        note: 'ฝนตกและดินชื้น'
                    }
                ]
            },
            {
                name: 'Wave 3: ถังน้ำรั่ว',
                mode: 'boss',
                plots: [
                    {
                        name: 'แปลง A',
                        soil: 'dry',
                        rain: false,
                        tank: 'empty',
                        hp: 55,
                        expectedAction: 'refill',
                        note: 'ถังน้ำหมดและพืชเริ่มเหี่ยว'
                    },
                    {
                        name: 'แปลง B',
                        soil: 'dry',
                        rain: false,
                        tank: 'empty',
                        hp: 60,
                        expectedAction: 'refill',
                        note: 'บอสทำถังน้ำรั่ว ต้องแจ้งเติมน้ำก่อน'
                    }
                ]
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
