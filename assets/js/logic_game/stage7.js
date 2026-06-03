// Stage 7: เช็คดินแห้งหรือเปียก
(function () {
    const config = {
        title: 'ด่าน 7: เช็คดินแห้งหรือเปียก',
        subtitle: 'ใช้เงื่อนไข If อย่างง่ายเพื่อเลือกว่าควรรดน้ำหรือหยุดรดน้ำ',
        hint: 'ถ้าดินแห้งให้รดน้ำ แต่ถ้าดินชื้นแล้วให้หยุดรดน้ำ',
        feedback: 'คำสั่งนี้ยังไม่ครอบคลุมกรณีดินแห้ง/ดินชื้น ลองจับคู่สถานะกับการกระทำอีกครั้ง',
        actions: [
            { value: 'water', label: 'รดน้ำ' },
            { value: 'stop', label: 'ไม่ต้องรดน้ำ' },
            { value: 'alert', label: 'แจ้งเตือนครู' }
        ],
        scenarios: [
            { icon: '🌱', name: 'แปลง A', status: 'ดินแห้ง ใบเริ่มเหี่ยว', prompt: 'ถ้าดินแห้ง ระบบควรทำอะไร?', answer: 'water' },
            { icon: '🥬', name: 'แปลง B', status: 'ดินชื้นพอดี ต้นกล้าสดชื่น', prompt: 'ถ้าดินชื้นแล้ว ระบบควรทำอะไร?', answer: 'stop' }
        ]
    };

    function boot() {
        window.FarmMissions.condition(config);
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
