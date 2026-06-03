// Stage 9: ระบบน้ำครอบจักรวาล
(function () {
    const config = {
        title: 'ด่าน 9: ระบบน้ำครอบจักรวาล',
        subtitle: 'ตัดสินใจหลายเงื่อนไขให้เหมาะกับแต่ละแปลงผัก',
        hint: 'ถังน้ำหมดต้องแจ้งเตือนก่อนรดน้ำ ฝนตกต้องหยุดรดน้ำ ดินแห้งและไม่มีฝนจึงค่อยรดน้ำ',
        feedback: 'คำสั่งบางแปลงยังไม่ตรงกับเงื่อนไข ลองตรวจถังน้ำ ฝน และความชื้นตามลำดับ',
        actions: [
            { value: 'water', label: 'รดน้ำ' },
            { value: 'stop', label: 'หยุดรดน้ำ' },
            { value: 'refill', label: 'แจ้งเตือนเติมน้ำ' },
            { value: 'observe', label: 'สังเกตต่อ' }
        ],
        scenarios: [
            { icon: '🌽', name: 'แปลง A', status: 'ดินแห้ง ไม่มีฝน ถังน้ำพร้อม', prompt: 'ควรดูแลอย่างไร?', answer: 'water' },
            { icon: '🥬', name: 'แปลง B', status: 'ฝนกำลังตก ดินเริ่มชื้น', prompt: 'ควรเปิดน้ำหรือหยุด?', answer: 'stop' },
            { icon: '🍅', name: 'แปลง C', status: 'ถังน้ำหมดและพืชเริ่มเหี่ยว', prompt: 'ระบบควรทำสิ่งใดก่อน?', answer: 'refill' }
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
