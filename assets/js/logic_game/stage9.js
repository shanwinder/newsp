// Stage 9: ระบบน้ำครอบจักรวาล
(function () {
    const config = {
        title: 'ด่าน 9: ระบบน้ำครอบจักรวาล',
        subtitle: 'สร้างกฎหลายเงื่อนไขให้ฟาร์มรอดจากถังน้ำหมด ฝนตก และดินแห้ง',
        hint: 'วางกฎเป็น: ถ้าถังน้ำหมด -> แจ้งเตือนเติมน้ำ / มิฉะนั้นถ้าฝนตก -> หยุดรดน้ำ / มิฉะนั้นถ้าดินแห้ง -> รดน้ำ / มิฉะนั้น -> สังเกตต่อ',
        strictPriority: true,
        solutionPriority: ['tank_empty', 'rain', 'soil_dry', 'else'],
        conditions: [
            { value: 'tank_empty', label: 'ถังน้ำหมด' },
            { value: 'rain', label: 'ฝนตก' },
            { value: 'soil_dry', label: 'ดินแห้ง' },
            { value: 'soil_wet', label: 'ดินชื้น' },
            { value: 'tank_ready', label: 'ถังน้ำพร้อม' }
        ],
        actions: [
            { value: 'refill', label: 'แจ้งเตือนเติมน้ำ' },
            { value: 'stop', label: 'หยุดรดน้ำ' },
            { value: 'water', label: 'รดน้ำ' },
            { value: 'observe', label: 'สังเกตต่อ' }
        ],
        plots: [
            {
                name: 'แปลง A',
                soil: 'dry',
                rain: false,
                tank: 'ready',
                health: 55,
                expectedAction: 'water',
                note: 'ดินแห้ง ไม่มีฝน ถังน้ำพร้อม'
            },
            {
                name: 'แปลง B',
                soil: 'wet',
                rain: true,
                tank: 'ready',
                health: 88,
                expectedAction: 'stop',
                note: 'ฝนตกและดินชื้น'
            },
            {
                name: 'แปลง C',
                soil: 'dry',
                rain: false,
                tank: 'empty',
                health: 50,
                expectedAction: 'refill',
                note: 'ถังน้ำหมดและพืชเริ่มเหี่ยว'
            },
            {
                name: 'แปลง D',
                soil: 'wet',
                rain: false,
                tank: 'ready',
                health: 92,
                expectedAction: 'observe',
                note: 'ดินชื้น ไม่มีฝน ถังน้ำพร้อม'
            }
        ]
    };

    function boot() {
        window.FarmMissions.irrigationBuilder(config);
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
