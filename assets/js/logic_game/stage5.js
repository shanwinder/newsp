// Stage 5: หลบหลีกกองฟาง
(function () {
    const config = {
        title: 'ด่าน 5: หลบหลีกกองฟาง',
        subtitle: 'เรียงคำสั่งให้รถไถอ้อมสิ่งกีดขวางโดยไม่ชนกองฟางหรือก้อนหิน',
        levels: [
            {
                title: 'กองฟางขวางทาง',
                name: 'กองฟางขวางทาง',
                mission: 'พารถไถไปถึงตะกร้าโดยไม่ชนกองฟาง',
                goal: 'พารถไถไปถึงตะกร้าโดยไม่ชนกองฟาง',
                cols: 6,
                rows: 5,
                start: { c: 0, r: 2 },
                target: { c: 5, r: 2 },
                obstacles: [
                    { col: 2, row: 2, type: 'hay' }
                ],
                crops: [],
                barn: null,
                maxCommands: 10,
                crashFeedback: 'รถไถชนกองฟาง เพราะยังไม่ได้เลี้ยวหลบสิ่งกีดขวาง'
            },
            {
                title: 'กำแพงกองฟาง',
                name: 'กำแพงกองฟาง',
                mission: 'วางแผนเส้นทางอ้อมกำแพงกองฟาง',
                goal: 'วางแผนเส้นทางอ้อมกำแพงกองฟาง',
                cols: 6,
                rows: 5,
                start: { c: 0, r: 2 },
                target: { c: 5, r: 2 },
                obstacles: [
                    { col: 2, row: 1, type: 'hay' },
                    { col: 2, row: 2, type: 'hay' },
                    { col: 2, row: 3, type: 'hay' }
                ],
                crops: [],
                barn: null,
                maxCommands: 12,
                crashFeedback: 'รถไถชนกองฟาง ลองวางเส้นทางอ้อมดูนะ'
            },
            {
                title: 'เส้นทางปลอดภัย',
                name: 'เส้นทางปลอดภัย',
                mission: 'หลบกองฟางและหินเพื่อไปถึงจุดหมาย',
                goal: 'หลบกองฟางและหินเพื่อไปถึงจุดหมาย',
                cols: 6,
                rows: 5,
                start: { c: 0, r: 4 },
                target: { c: 5, r: 0 },
                obstacles: [
                    { col: 1, row: 3, type: 'rock' },
                    { col: 2, row: 3, type: 'hay' },
                    { col: 3, row: 2, type: 'rock' },
                    { col: 4, row: 2, type: 'hay' }
                ],
                crops: [],
                barn: null,
                maxCommands: 14,
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
