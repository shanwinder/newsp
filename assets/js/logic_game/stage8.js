// Stage 8: รับมือฝนฟ้าคะนอง
(function () {
    const config = {
        title: 'ด่าน 8: รับมือฝนฟ้าคะนอง',
        subtitle: 'จัดลำดับเงื่อนไขให้ถูกต้อง เพราะฝนตกต้องตรวจมาก่อนดินแห้ง',
        hint: 'วางกฎเป็น: ถ้าฝนตก -> หยุดรดน้ำ / มิฉะนั้นถ้าดินแห้ง -> รดน้ำ / มิฉะนั้น -> หยุดรดน้ำ',
        strictPriority: true,
        solutionPriority: ['rain', 'soil_dry', 'else'],
        conditions: [
            { value: 'rain', label: 'ฝนตก' },
            { value: 'soil_dry', label: 'ดินแห้ง' },
            { value: 'soil_wet', label: 'ดินชื้น' }
        ],
        actions: [
            { value: 'stop', label: 'หยุดรดน้ำ' },
            { value: 'water', label: 'รดน้ำ' },
            { value: 'observe', label: 'รอดูสถานการณ์' }
        ],
        plots: [
            {
                name: 'แปลง A',
                soil: 'dry',
                rain: true,
                tank: 'ready',
                health: 65,
                expectedAction: 'stop',
                note: 'ฝนตกและดินแห้ง ต้องระวังน้ำท่วม'
            },
            {
                name: 'แปลง B',
                soil: 'dry',
                rain: false,
                tank: 'ready',
                health: 60,
                expectedAction: 'water',
                note: 'ไม่มีฝนและดินแห้ง'
            },
            {
                name: 'แปลง C',
                soil: 'wet',
                rain: false,
                tank: 'ready',
                health: 90,
                expectedAction: 'stop',
                note: 'ไม่มีฝนแต่ดินยังชื้น'
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
