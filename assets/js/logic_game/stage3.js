// Stage 3: กำจัดเป้าหมายตามเงื่อนไขตรรกะ
(function () {
    const config = {
        title: 'ปกป้องแปลงผัก',
        subtitle: 'ใช้เงื่อนไขตรรกะเพื่อเลือกเป้าหมายที่ต้องกำจัด',
        backgroundKey: 'bg_v_garden',
        resultText: 'ปกป้องฟาร์มสำเร็จ!',
        transitionText: 'กวาดล้างสำเร็จ! ไปแปลงต่อไป',
        assets: [
            ['bg_v_garden', '../assets/img/bg_v_garden.webp'],
            ['weed_spiky', '../assets/img/weed_spiky.webp'],
            ['weed_round', '../assets/img/weed_round.webp'],
            ['bug_red', '../assets/img/bug_red.webp'],
            ['bug_blue', '../assets/img/bug_blue.webp']
        ],
        sounds: [
            ['correct', '../assets/sound/correct.mp3'],
            ['wrong', '../assets/sound/wrong.mp3']
        ],
        scales: {
            weed_spiky: 0.25,
            weed_round: 0.25,
            bug_red: 0.2,
            bug_blue: 0.2
        },
        levels: [
            {
                type: 'click_targets',
                title: 'ด่าน 1/3: กำจัดวัชพืชใบแหลมให้หมด',
                mission: 'คลิกเฉพาะวัชพืชใบแหลม อย่าคลิกตัวหลอก',
                goal: 'กำจัดวัชพืชใบแหลม 3 ต้น',
                titleColor: '#c0392b',
                grid: { cols: 4, rows: 3, left: 0.19, right: 0.81, top: 0.34, bottom: 0.82 },
                items: [
                    { key: 'weed_spiky', type: 'weed', isTarget: true },
                    { key: 'weed_spiky', type: 'weed', isTarget: true },
                    { key: 'weed_spiky', type: 'weed', isTarget: true },
                    { key: 'weed_round', type: 'weed', isTarget: false },
                    { key: 'weed_round', type: 'weed', isTarget: false },
                    { key: 'bug_red', type: 'bug', isTarget: false }
                ]
            },
            {
                type: 'click_targets',
                title: 'ด่าน 2/3: กำจัดแมลงที่ไม่ใช่สีแดง',
                mission: 'เงื่อนไข NOT: เป้าหมายคือแมลงสีน้ำเงิน',
                goal: 'กำจัดแมลงที่ไม่ใช่สีแดง 4 ตัว',
                titleColor: '#c0392b',
                grid: { cols: 4, rows: 3, left: 0.19, right: 0.81, top: 0.34, bottom: 0.82 },
                items: [
                    { key: 'bug_blue', type: 'bug', isTarget: true },
                    { key: 'bug_blue', type: 'bug', isTarget: true },
                    { key: 'bug_blue', type: 'bug', isTarget: true },
                    { key: 'bug_blue', type: 'bug', isTarget: true },
                    { key: 'bug_red', type: 'bug', isTarget: false },
                    { key: 'bug_red', type: 'bug', isTarget: false },
                    { key: 'weed_spiky', type: 'weed', isTarget: false },
                    { key: 'weed_round', type: 'weed', isTarget: false }
                ]
            },
            {
                type: 'click_targets',
                title: 'ด่าน 3/3: กำจัดแมลงสีแดงและวัชพืชใบกลม',
                mission: 'เงื่อนไข OR: แมลงสีแดง หรือ วัชพืชใบกลม คือเป้าหมาย',
                goal: 'กำจัดเป้าหมายให้ครบ 5 ตัว',
                titleColor: '#c0392b',
                titleFontSize: '22px',
                grid: { cols: 4, rows: 3, left: 0.19, right: 0.81, top: 0.34, bottom: 0.82 },
                items: [
                    { key: 'bug_red', type: 'bug', isTarget: true },
                    { key: 'bug_red', type: 'bug', isTarget: true },
                    { key: 'weed_round', type: 'weed', isTarget: true },
                    { key: 'weed_round', type: 'weed', isTarget: true },
                    { key: 'weed_round', type: 'weed', isTarget: true },
                    { key: 'bug_blue', type: 'bug', isTarget: false },
                    { key: 'bug_blue', type: 'bug', isTarget: false },
                    { key: 'weed_spiky', type: 'weed', isTarget: false },
                    { key: 'weed_spiky', type: 'weed', isTarget: false }
                ]
            }
        ],
        scoring: {
            threeStarsMaxMistakes: 1,
            twoStarsMaxMistakes: 4
        }
    };

    function boot() {
        window.FarmLogicMissions.run(config);
    }

    if (window.FarmLogicMissions) {
        boot();
    } else {
        const script = document.createElement('script');
        script.src = '../assets/js/logic_game/farm_logic_missions.js';
        script.onload = boot;
        document.head.appendChild(script);
    }
})();
