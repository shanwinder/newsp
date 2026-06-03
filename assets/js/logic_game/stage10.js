// Stage 10: ขั้นตอนที่ผิดเพี้ยน
(function () {
    const config = {
        title: 'ด่าน 10: ขั้นตอนที่ผิดเพี้ยน',
        subtitle: 'สลับขั้นตอนการปลูกข้าวให้เป็นลำดับที่ถูกต้อง',
        problem: 'มีคนเรียงขั้นตอนผิด ทำให้เก็บเกี่ยวก่อนหว่านเมล็ด ลองสลับขั้นตอนใหม่ให้ถูกต้อง',
        hint: 'เริ่มจากเตรียมดินก่อน แล้วค่อยหว่านเมล็ด รดน้ำ และเก็บเกี่ยว',
        feedback: 'บั๊กไม่ได้อยู่ที่จำนวนขั้นตอน แต่อยู่ที่ลำดับของขั้นตอน',
        rows: [
            { value: 'harvest' },
            { value: 'water' },
            { value: 'seed' },
            { value: 'soil' }
        ],
        solution: ['soil', 'seed', 'water', 'harvest']
    };

    const labels = {
        soil: 'พรวนดิน',
        seed: 'หว่านเมล็ด',
        water: 'รดน้ำ',
        harvest: 'เก็บเกี่ยว'
    };
    config.rows = config.rows.map((row, index) => ({ ...row, label: `บล็อกที่ ${index + 1}`, value: labels[row.value] }));
    config.solution = config.solution.map((value) => labels[value]);

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
