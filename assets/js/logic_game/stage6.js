// Stage 6: เก็บเกี่ยวผลผลิต
(function () {
    const config = {
        title: 'ด่าน 6: เก็บเกี่ยวผลผลิต',
        subtitle: 'วางลำดับคำสั่งหลายเป้าหมาย เก็บผลผลิตให้ครบก่อนกลับโรงนา',
        levels: [
            {
                name: 'เก็บผลผลิตสองจุด',
                goal: 'รถไถต้องเก็บตะกร้าทั้งสองใบ แล้วกลับโรงนา',
                cols: 6,
                rows: 6,
                start: { c: 0, r: 5 },
                targets: [{ c: 1, r: 2 }, { c: 4, r: 1 }],
                finish: { c: 5, r: 5 },
                rocks: [{ c: 2, r: 3 }, { c: 3, r: 3 }, { c: 4, r: 4 }],
                rockIcon: '🪨',
                targetIcon: '🌽',
                maxCommands: 18,
                crashFeedback: 'รถไถชนสิ่งกีดขวาง ลองเลือกว่าจะเก็บจุดใดก่อน'
            },
            {
                name: 'ภารกิจเก็บเกี่ยวรอบใหญ่',
                goal: 'เก็บผลผลิต 3 จุดให้ครบ แล้วกลับโรงนาโดยใช้คำสั่งให้น้อยที่สุด',
                cols: 6,
                rows: 6,
                start: { c: 0, r: 0 },
                targets: [{ c: 2, r: 1 }, { c: 4, r: 2 }, { c: 1, r: 4 }],
                finish: { c: 5, r: 5 },
                rocks: [{ c: 3, r: 0 }, { c: 3, r: 1 }, { c: 3, r: 3 }, { c: 2, r: 4 }],
                rockIcon: '🪨',
                targetIcon: '🧺',
                maxCommands: 20,
                crashFeedback: 'ลำดับการเก็บผลผลิตยังไม่เหมาะ ลองวาดเส้นทางในใจก่อน'
            }
        ]
    };

    function boot() {
        window.FarmMissions.sequence(config);
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
