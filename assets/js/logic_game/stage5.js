// Stage 5: หลบหลีกกองฟาง
(function () {
    const config = {
        title: 'ด่าน 5: หลบหลีกกองฟาง',
        subtitle: 'เรียงคำสั่งให้รถไถอ้อมสิ่งกีดขวางโดยไม่ชนกองฟางหรือก้อนหิน',
        levels: [
            {
                name: 'เส้นทางอ้อมกองฟาง',
                goal: 'พารถไถจากมุมซ้ายไปตะกร้า โดยหลบกองฟางกลางแปลง',
                cols: 5,
                rows: 5,
                start: { c: 0, r: 4 },
                target: { c: 4, r: 0 },
                rocks: [{ c: 1, r: 3 }, { c: 2, r: 3 }, { c: 2, r: 2 }],
                rockIcon: '🟨',
                targetIcon: '🧺',
                maxCommands: 10,
                crashFeedback: 'รถไถชนกองฟาง เพราะยังไม่ได้เลี้ยวหลบสิ่งกีดขวาง'
            },
            {
                name: 'ทางคดรอบคันนา',
                goal: 'เลือกเส้นทางที่ปลอดภัยแล้วหยุดให้ตรงเป้าหมาย',
                cols: 6,
                rows: 5,
                start: { c: 0, r: 2 },
                target: { c: 5, r: 2 },
                rocks: [{ c: 2, r: 1 }, { c: 2, r: 2 }, { c: 2, r: 3 }, { c: 4, r: 3 }],
                rockIcon: '🪨',
                targetIcon: '🏁',
                maxCommands: 12,
                crashFeedback: 'ลำดับคำสั่งพาไปชนหิน ลองวางแผนเส้นทางอ้อมก่อนรัน'
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
