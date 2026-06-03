// Stage 4: เดินหน้าสู่แปลงนา
(function () {
    const config = {
        title: 'ด่าน 4: เดินหน้าสู่แปลงนา',
        subtitle: 'ฝึกเรียงลำดับคำสั่งพื้นฐาน เพื่อพารถไถไปถึงจุดหมาย',
        levels: [
            {
                title: 'ทางตรงสู่แปลงนา',
                name: 'ทางตรงสู่แปลงนา',
                mission: 'เพิ่มคำสั่งให้รถไถเดินตรงไปถึงตะกร้าผลผลิต',
                goal: 'เพิ่มคำสั่งให้รถไถเดินตรงไปถึงตะกร้าผลผลิต',
                cols: 6,
                rows: 5,
                start: { c: 1, r: 2 },
                target: { c: 4, r: 2 },
                obstacles: [],
                crops: [],
                barn: null,
                maxCommands: 6
            },
            {
                title: 'เลี้ยวไปยังแปลงนา',
                name: 'เลี้ยวไปยังแปลงนา',
                mission: 'วางคำสั่งให้รถไถเดินและเลี้ยวไปถึงจุดหมาย',
                goal: 'วางคำสั่งให้รถไถเดินและเลี้ยวไปถึงจุดหมาย',
                cols: 6,
                rows: 5,
                start: { c: 1, r: 4 },
                target: { c: 4, r: 1 },
                obstacles: [],
                crops: [],
                barn: null,
                maxCommands: 8
            },
            {
                title: 'เส้นทางซิกแซก',
                name: 'เส้นทางซิกแซก',
                mission: 'พารถไถไปถึงตะกร้าด้วยคำสั่งหลายทิศทาง',
                goal: 'พารถไถไปถึงตะกร้าด้วยคำสั่งหลายทิศทาง',
                cols: 6,
                rows: 5,
                start: { c: 0, r: 4 },
                target: { c: 5, r: 0 },
                obstacles: [],
                crops: [],
                barn: null,
                maxCommands: 12
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
