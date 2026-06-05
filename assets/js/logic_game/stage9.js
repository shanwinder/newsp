// Stage 9: Agri-Drone Rescue - วิกฤตฟาร์มใหญ่
(function () {
    const config = {
        title: 'ด่าน 9: วิกฤตฟาร์มใหญ่',
        subtitle: 'ใช้หลายเงื่อนไขร่วมกันเพื่อช่วยฟาร์มจากแมลง ฝน ดินแห้ง และผลผลิตสุก',
        briefing: 'ฟาร์มเข้าสู่วันสำคัญก่อนเก็บเกี่ยว มีทั้งแมลง ดินแห้ง ฝนตก และผลผลิตสุก ตั้งลำดับกฎให้โดรนช่วยฟาร์มให้รอด',
        farmHp: 100,
        droneBattery: 100,
        droneWater: 100,
        harvestTarget: 2,
        badge: 'วิศวกรโดรนเกษตร',
        hint: 'วางกฎเป็น: ถ้ามีแมลง -> ไล่แมลง / มิฉะนั้นถ้าฝนตก -> กลับฐาน / มิฉะนั้นถ้าดินแห้ง -> รดน้ำ / มิฉะนั้นถ้าผลผลิตสุก -> เก็บเกี่ยว / มิฉะนั้น -> สำรวจต่อ',
        winMessage: 'ฟาร์มรอดแล้ว! โดรนจัดลำดับภารกิจได้เหมาะสมและเก็บผลผลิตสำคัญครบ',
        expectedPriority: ['pest', 'rain', 'soil_dry', 'crop_ripe', 'else'],
        strictPriority: true,
        ruleSlots: [
            { type: 'if', condition: null, action: null },
            { type: 'else_if', condition: null, action: null },
            { type: 'else_if', condition: null, action: null },
            { type: 'else_if', condition: null, action: null },
            { type: 'else', condition: 'else', action: null }
        ],
        cards: {
            conditions: [
                { value: 'pest', label: 'มีแมลง', icon: '🐛' },
                { value: 'rain', label: 'ฝนตก', icon: '⛈️' },
                { value: 'soil_dry', label: 'ดินแห้ง', icon: '🟫' },
                { value: 'crop_ripe', label: 'ผลผลิตสุก', icon: '🍅' }
            ],
            actions: [
                { value: 'repel_pest', label: 'ไล่แมลง', icon: '🌿' },
                { value: 'return_base', label: 'กลับฐาน', icon: '🏠' },
                { value: 'water', label: 'รดน้ำ', icon: '💧' },
                { value: 'harvest', label: 'เก็บเกี่ยว', icon: '🧺' },
                { value: 'skip', label: 'สำรวจต่อ', icon: '🛰️' }
            ]
        },
        waves: [
            {
                name: 'Wave 1: เตรียมเก็บเกี่ยว',
                brief: 'บางแปลงดินแห้ง บางแปลงผลผลิตสุก ให้โดรนเลือกงานตามสถานการณ์',
                plots: [
                    {
                        id: 'A',
                        name: 'แปลง A',
                        soil: 'dry',
                        rain: false,
                        pest: false,
                        crop: 'growing',
                        hp: 64,
                        expectedAction: 'water',
                        note: 'ดินแห้ง ต้องรดน้ำก่อนพืชเหี่ยว',
                        position: { x: 8, y: 10 }
                    },
                    {
                        id: 'B',
                        name: 'แปลง B',
                        soil: 'wet',
                        rain: false,
                        pest: false,
                        crop: 'ripe',
                        hp: 88,
                        expectedAction: 'harvest',
                        note: 'ผลผลิตสุกพร้อมเก็บเกี่ยว',
                        position: { x: 39, y: 10 }
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
                        note: 'ยังปลอดภัย ให้โดรนสำรวจต่อ',
                        position: { x: 18, y: 55 }
                    }
                ]
            },
            {
                name: 'Wave 2: แมลงบุก',
                brief: 'แมลงเริ่มเดินเข้าหาพืช ต้องจัดการก่อนภัยอื่น',
                plots: [
                    {
                        id: 'D',
                        name: 'แปลง D',
                        soil: 'dry',
                        rain: false,
                        pest: true,
                        crop: 'growing',
                        hp: 58,
                        expectedAction: 'repel_pest',
                        note: 'มีแมลง แม้ดินแห้งก็ต้องไล่แมลงก่อน',
                        position: { x: 8, y: 13 }
                    },
                    {
                        id: 'E',
                        name: 'แปลง E',
                        soil: 'wet',
                        rain: false,
                        pest: true,
                        crop: 'ripe',
                        hp: 72,
                        expectedAction: 'repel_pest',
                        note: 'แมลงกำลังกัดผลผลิตสุก',
                        position: { x: 39, y: 35 }
                    },
                    {
                        id: 'F',
                        name: 'แปลง F',
                        soil: 'dry',
                        rain: false,
                        pest: false,
                        crop: 'growing',
                        hp: 62,
                        expectedAction: 'water',
                        note: 'ไม่มีแมลงและดินแห้ง',
                        position: { x: 13, y: 60 }
                    }
                ]
            },
            {
                name: 'Wave 3: ฝนมา เก็บเกี่ยวให้ทัน',
                brief: 'ฝนตกบางแปลงและยังมีผลผลิตสุก ต้องหลบฝนก่อนรดน้ำ',
                plots: [
                    {
                        id: 'G',
                        name: 'แปลง G',
                        soil: 'dry',
                        rain: true,
                        pest: false,
                        crop: 'growing',
                        hp: 68,
                        expectedAction: 'return_base',
                        note: 'ฝนตกและดินแห้ง ถ้ารดน้ำจะท่วม',
                        position: { x: 8, y: 10 }
                    },
                    {
                        id: 'H',
                        name: 'แปลง H',
                        soil: 'wet',
                        rain: false,
                        pest: false,
                        crop: 'ripe',
                        hp: 86,
                        expectedAction: 'harvest',
                        note: 'ผลผลิตสุกอีกแปลง ต้องเก็บให้ครบ',
                        position: { x: 41, y: 30 }
                    },
                    {
                        id: 'I',
                        name: 'แปลง I',
                        soil: 'wet',
                        rain: false,
                        pest: false,
                        crop: 'growing',
                        hp: 92,
                        expectedAction: 'skip',
                        note: 'ปลอดภัย ให้สำรวจต่อ',
                        position: { x: 15, y: 58 }
                    }
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
