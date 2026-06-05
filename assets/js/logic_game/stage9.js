// Stage 9: Smart Farm Defense - บอสเมฆดำและถังน้ำรั่ว
(function () {
    const config = {
        title: 'ด่าน 9: บอสเมฆดำและถังน้ำรั่ว',
        subtitle: 'ใช้หลายเงื่อนไขและจัดลำดับให้ถูกต้อง เพื่อกำจัดบอสและป้องกันสวน',
        mode: 'boss',
        lanes: 4,
        timeLimit: 90,
        gardenHp: 100,
        bossHp: 100,
        tankWater: 80,
        badge: 'วิศวกรสวนอัจฉริยะ',
        hint: 'วางกฎเป็น: ถ้าถังน้ำหมด -> แจ้งเตือนเติมน้ำ / มิฉะนั้นถ้าฝนตก -> หยุดรดน้ำ / มิฉะนั้นถ้าดินแห้ง -> รดน้ำ / มิฉะนั้น -> สังเกตต่อ',
        winMessage: 'สุดยอด! คุณจัดลำดับเงื่อนไขได้ถูกต้อง ระบบตรวจถังน้ำ ฝน และดินแห้งตามลำดับ จึงกำจัดบอสได้สำเร็จ',
        expectedPriority: ['tank_empty', 'rain', 'soil_dry', 'else'],
        ruleSlots: [
            { type: 'if', condition: null, action: null },
            { type: 'else_if', condition: null, action: null },
            { type: 'else_if', condition: null, action: null },
            { type: 'else', condition: 'else', action: null }
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
                        note: 'ดินแห้ง ไม่มีฝน ถังน้ำพร้อม'
                    },
                    {
                        lane: 2,
                        name: 'แปลง B',
                        soil: 'wet',
                        rain: false,
                        tank: 'ready',
                        hp: 90,
                        enemy: null,
                        expectedAction: 'observe',
                        note: 'ดินชื้นและปลอดภัย'
                    },
                    {
                        lane: 3,
                        name: 'แปลง C',
                        soil: 'dry',
                        rain: false,
                        tank: 'ready',
                        hp: 68,
                        enemy: 'worm',
                        expectedAction: 'water',
                        note: 'หนอนดินแห้งทำให้ความชื้นลดลง'
                    },
                    {
                        lane: 4,
                        name: 'แปลง D',
                        soil: 'wet',
                        rain: false,
                        tank: 'ready',
                        hp: 88,
                        enemy: null,
                        expectedAction: 'observe',
                        note: 'เลนนี้ยังปลอดภัย ให้สังเกตต่อ'
                    }
                ]
            },
            {
                name: 'Wave 2: ฝนถล่ม',
                mode: 'storm',
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
                        note: 'ฝนตก แม้ดินแห้งก็ห้ามรดน้ำเพิ่ม'
                    },
                    {
                        lane: 2,
                        name: 'แปลง B',
                        soil: 'wet',
                        rain: true,
                        tank: 'ready',
                        hp: 85,
                        enemy: 'rainCloud',
                        expectedAction: 'stop',
                        note: 'ฝนตกและดินชื้น'
                    },
                    {
                        lane: 3,
                        name: 'แปลง C',
                        soil: 'dry',
                        rain: false,
                        tank: 'ready',
                        hp: 62,
                        enemy: 'sun',
                        expectedAction: 'water',
                        note: 'เลนนี้ไม่มีฝน ดินยังแห้ง'
                    },
                    {
                        lane: 4,
                        name: 'แปลง D',
                        soil: 'wet',
                        rain: false,
                        tank: 'ready',
                        hp: 90,
                        enemy: null,
                        expectedAction: 'observe',
                        note: 'ไม่มีภัยคุกคาม ให้สังเกตต่อ'
                    }
                ]
            },
            {
                name: 'Wave 3: ถังน้ำรั่ว',
                mode: 'boss',
                lanes: [
                    {
                        lane: 1,
                        name: 'แปลง A',
                        soil: 'dry',
                        rain: false,
                        tank: 'empty',
                        hp: 55,
                        enemy: 'leakingTank',
                        expectedAction: 'refill',
                        note: 'ถังน้ำหมดและพืชเริ่มเหี่ยว'
                    },
                    {
                        lane: 2,
                        name: 'แปลง B',
                        soil: 'dry',
                        rain: false,
                        tank: 'empty',
                        hp: 60,
                        enemy: 'leakingTank',
                        expectedAction: 'refill',
                        note: 'บอสทำถังน้ำรั่ว ต้องแจ้งเติมน้ำก่อน'
                    },
                    {
                        lane: 3,
                        name: 'แปลง C',
                        soil: 'wet',
                        rain: false,
                        tank: 'empty',
                        hp: 82,
                        enemy: 'leakingTank',
                        expectedAction: 'refill',
                        note: 'ถังน้ำหมด ต้องแก้วิกฤตก่อนสั่งอย่างอื่น'
                    },
                    {
                        lane: 4,
                        name: 'แปลง D',
                        soil: 'wet',
                        rain: true,
                        tank: 'ready',
                        hp: 84,
                        enemy: 'rainCloud',
                        expectedAction: 'stop',
                        note: 'ถังน้ำพร้อมแต่ฝนตก จึงควรหยุดรดน้ำ'
                    }
                ]
            }
        ]
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
