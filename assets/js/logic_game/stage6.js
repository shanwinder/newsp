// Stage 6: เก็บเกี่ยวผลผลิต
(function () {
    const config = {
        title: 'ด่าน 6: เก็บเกี่ยวผลผลิต',
        subtitle: 'วางลำดับคำสั่งหลายเป้าหมาย เก็บผลผลิตให้ครบก่อนกลับโรงนา',
        levels: [
            {
                title: 'เก็บผลผลิตแรก',
                name: 'เก็บผลผลิตแรก',
                mission: 'เก็บผลผลิต 1 จุด แล้วขับรถไถไปโรงนา',
                goal: 'เก็บผลผลิต 1 จุด แล้วขับรถไถไปโรงนา',
                cols: 6,
                rows: 5,
                start: { c: 0, r: 4 },
                target: null,
                barn: { col: 5, row: 4 },
                crops: [
                    { col: 3, row: 4, type: 'crop' }
                ],
                obstacles: [],
                maxCommands: 10,
                crashFeedback: 'รถไถชนสิ่งกีดขวาง ลองวางเส้นทางใหม่'
            },
            {
                title: 'เก็บผลผลิตสองแปลง',
                name: 'เก็บผลผลิตสองแปลง',
                mission: 'เก็บผลผลิตให้ครบ 2 จุด แล้วกลับโรงนา',
                goal: 'เก็บผลผลิตให้ครบ 2 จุด แล้วกลับโรงนา',
                cols: 6,
                rows: 5,
                start: { c: 0, r: 4 },
                target: null,
                barn: { col: 5, row: 0 },
                crops: [
                    { col: 2, row: 4, type: 'crop' },
                    { col: 4, row: 2, type: 'crop' }
                ],
                obstacles: [
                    { col: 3, row: 3, type: 'rock' }
                ],
                maxCommands: 16,
                crashFeedback: 'รถไถชนสิ่งกีดขวาง ลองวางเส้นทางใหม่'
            },
            {
                title: 'เก็บเกี่ยวรอบใหญ่',
                name: 'เก็บเกี่ยวรอบใหญ่',
                mission: 'เก็บผลผลิต 3 จุด หลบสิ่งกีดขวาง แล้วกลับโรงนา',
                goal: 'เก็บผลผลิต 3 จุด หลบสิ่งกีดขวาง แล้วกลับโรงนา',
                cols: 6,
                rows: 5,
                start: { c: 0, r: 4 },
                target: null,
                barn: { col: 5, row: 0 },
                crops: [
                    { col: 1, row: 2, type: 'crop' },
                    { col: 3, row: 4, type: 'crop' },
                    { col: 4, row: 1, type: 'crop' }
                ],
                obstacles: [
                    { col: 2, row: 2, type: 'hay' },
                    { col: 2, row: 3, type: 'rock' },
                    { col: 4, row: 3, type: 'hay' }
                ],
                maxCommands: 20,
                crashFeedback: 'รถไถชนสิ่งกีดขวาง ลองวางเส้นทางใหม่'
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
