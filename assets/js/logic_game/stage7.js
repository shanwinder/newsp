// Stage 7: เช็คดินแห้งหรือเปียก
(function () {
    const config = {
        title: 'ด่าน 7: เช็คดินแห้งหรือเปียก',
        subtitle: 'สร้างกฎ If-Else ให้เครื่องรดน้ำตัดสินใจจากความชื้นของดิน',
        hint: 'วางกฎเป็น: ถ้าดินแห้ง -> รดน้ำ / มิฉะนั้น -> หยุดรดน้ำ',
        strictPriority: true,
        solutionPriority: ['soil_dry', 'else'],
        conditions: [
            { value: 'soil_dry', label: 'ดินแห้ง' },
            { value: 'soil_wet', label: 'ดินชื้น' }
        ],
        actions: [
            { value: 'water', label: 'รดน้ำ' },
            { value: 'stop', label: 'หยุดรดน้ำ' }
        ],
        plots: [
            {
                name: 'แปลง A',
                soil: 'dry',
                rain: false,
                tank: 'ready',
                health: 55,
                expectedAction: 'water',
                note: 'ดินแห้ง ใบเริ่มเหี่ยว'
            },
            {
                name: 'แปลง B',
                soil: 'wet',
                rain: false,
                tank: 'ready',
                health: 90,
                expectedAction: 'stop',
                note: 'ดินชื้นพอดี ต้นกล้าสดชื่น'
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
