// Stage 8: รับมือฝนฟ้าคะนอง
(function () {
    const config = {
        title: 'ด่าน 8: รับมือฝนฟ้าคะนอง',
        subtitle: 'ใช้ If-Else และตรวจฝนก่อนตรวจดิน เพื่อไม่ให้น้ำมากเกินไป',
        hint: 'ฝนตกควรหยุดรดน้ำก่อนเสมอ แม้ดินจะแห้งอยู่ก็ตาม',
        feedback: 'ลองตรวจเงื่อนไขฝนตกก่อนตรวจดิน โดยเฉพาะกรณีฝนตกและดินแห้งพร้อมกัน',
        actions: [
            { value: 'stop', label: 'หยุดรดน้ำ' },
            { value: 'water', label: 'รดน้ำ' },
            { value: 'wait', label: 'รอดูสถานการณ์' }
        ],
        scenarios: [
            { icon: '⛈️', name: 'แปลง A', status: 'ฝนตกและดินแห้ง', prompt: 'ควรเปิดน้ำเพิ่มไหม?', answer: 'stop' },
            { icon: '☀️', name: 'แปลง B', status: 'ไม่มีฝนและดินแห้ง', prompt: 'เมื่อไม่มีฝนและดินแห้ง ระบบควรทำอะไร?', answer: 'water' },
            { icon: '🌤️', name: 'แปลง C', status: 'ไม่มีฝนแต่ดินยังชื้น', prompt: 'ระบบควรตัดสินใจอย่างไร?', answer: 'stop' }
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
