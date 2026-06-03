// Stage 11: รถไถหลงทาง
(function () {
    const options = [
        { value: 'RIGHT', label: 'เดินขวา ➡️' },
        { value: 'UP', label: 'เดินขึ้น ⬆️' },
        { value: 'DOWN', label: 'เดินลง ⬇️' },
        { value: 'LEFT', label: 'เดินซ้าย ⬅️' }
    ];
    const config = {
        title: 'ด่าน 11: รถไถหลงทาง',
        subtitle: 'แก้คำสั่งที่ทำให้รถไถเลี้ยวผิดและชนสิ่งกีดขวาง',
        problem: 'ชุดคำสั่งเดิมพารถไถชนกองฟาง มีบั๊กอยู่ 1 จุด ให้เปลี่ยนคำสั่งที่ผิดแล้วทดสอบใหม่',
        hint: 'รถไถควรเดินขึ้นก่อนอ้อมกองฟาง ไม่ใช่เดินลงไปชนสิ่งกีดขวาง',
        feedback: 'รถไถยังหลงทางอยู่ ลองตรวจว่าคำสั่งใดทำให้ผลลัพธ์เริ่มผิดพลาด',
        rows: [
            { label: 'คำสั่งที่ 1', value: 'RIGHT', options },
            { label: 'คำสั่งที่ 2', value: 'RIGHT', options },
            { label: 'คำสั่งที่ 3', value: 'DOWN', options },
            { label: 'คำสั่งที่ 4', value: 'RIGHT', options },
            { label: 'คำสั่งที่ 5', value: 'RIGHT', options },
            { label: 'คำสั่งที่ 6', value: 'DOWN', options }
        ],
        solution: ['RIGHT', 'RIGHT', 'UP', 'RIGHT', 'RIGHT', 'DOWN']
    };

    function boot() {
        window.FarmMissions.debug(config);
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
