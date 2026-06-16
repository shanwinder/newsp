// Stage 2: คัดแยกปุ๋ยด้วยเงื่อนไขสีและรูปทรง
(function () {
    const config = {
        title: 'คัดแยกปุ๋ย',
        subtitle: 'ฝึกแยกประเภทจากเงื่อนไขเดียวและหลายเงื่อนไข',
        backgroundKey: 'bg_barn',
        resultText: 'ภารกิจเสร็จสิ้น!',
        transitionText: 'เยี่ยมมาก! ไปกันต่อเลย',
        assets: [
            ['bg_barn', '../assets/img/bg_barn.webp'],
            ['basket', '../assets/img/basket.webp'],
            ['fert_green_bag', '../assets/img/fert_green_bag.webp'],
            ['fert_red_bag', '../assets/img/fert_red_bag.webp'],
            ['fert_green_round', '../assets/img/fert_green_round.webp'],
            ['fert_red_round', '../assets/img/fert_red_round.webp'],
            ['fert_green_square', '../assets/img/fert_green_square.webp'],
            ['fert_red_square', '../assets/img/fert_red_square.webp']
        ],
        sounds: [
            ['correct', '../assets/sound/correct.mp3'],
            ['wrong', '../assets/sound/wrong.mp3']
        ],
        scales: {
            basket: 0.3,
            fert_green_bag: 0.2,
            fert_red_bag: 0.2,
            fert_green_round: 0.2,
            fert_red_round: 0.2,
            fert_green_square: 0.2,
            fert_red_square: 0.2
        },
        levels: [
            {
                type: 'drag_sort',
                title: 'ด่าน 1/3: คัดแยกกระสอบปุ๋ยตามสี',
                mission: 'ลากกระสอบสีเขียวและสีแดงไปยังตะกร้าที่ตรงกัน',
                goal: 'คัดแยกกระสอบปุ๋ยให้ครบ 4 ชิ้น',
                titleColor: '#166534',
                zones: [
                    { id: 'green', label: 'กระสอบสีเขียว', labelColor: '#ffffff', labelBackground: '#27ae60', image: 'basket', x: 0.31, y: 0.78, width: 0.31, height: 0.27, dropOffsetY: -18 },
                    { id: 'red', label: 'กระสอบสีแดง', labelColor: '#ffffff', labelBackground: '#c0392b', image: 'basket', x: 0.69, y: 0.78, width: 0.31, height: 0.27, dropOffsetY: -18 }
                ],
                items: [
                    { key: 'fert_green_bag', target: 'green', x: 0.25, y: 0.34 },
                    { key: 'fert_red_bag', target: 'red', x: 0.44, y: 0.27 },
                    { key: 'fert_green_bag', target: 'green', x: 0.56, y: 0.43 },
                    { key: 'fert_red_bag', target: 'red', x: 0.75, y: 0.32 }
                ]
            },
            {
                type: 'drag_sort',
                title: 'ด่าน 2/3: คัดแยกปุ๋ยตามรูปทรง',
                mission: 'คัดแยกปุ๋ยเม็ดกลมกับปุ๋ยอัดแท่งเหลี่ยมโดยไม่สนสี',
                goal: 'คัดแยกตามรูปทรงให้ครบ 4 ชิ้น',
                titleColor: '#c0392b',
                zones: [
                    { id: 'round', label: 'ปุ๋ยเม็ดกลม', image: 'basket', x: 0.31, y: 0.78, width: 0.31, height: 0.27, dropOffsetY: -18 },
                    { id: 'square', label: 'ปุ๋ยอัดแท่งเหลี่ยม', image: 'basket', x: 0.69, y: 0.78, width: 0.31, height: 0.27, dropOffsetY: -18 }
                ],
                items: [
                    { key: 'fert_green_round', target: 'round', x: 0.2, y: 0.28 },
                    { key: 'fert_red_square', target: 'square', x: 0.39, y: 0.43 },
                    { key: 'fert_red_round', target: 'round', x: 0.62, y: 0.28 },
                    { key: 'fert_green_square', target: 'square', x: 0.8, y: 0.43 }
                ]
            },
            {
                type: 'drag_sort',
                title: 'ด่าน 3/3: ต้องตรงทั้งสีและรูปทรง',
                mission: 'เลือกเฉพาะปุ๋ยที่ตรงตามเงื่อนไขสองข้อพร้อมกัน',
                goal: 'เก็บเป้าหมายจริง 2 ชิ้น ส่วนตัวหลอกให้หลีกเลี่ยง',
                titleColor: '#2980b9',
                zones: [
                    { id: 'zone_green_round', label: 'เม็ดกลม สีเขียว เท่านั้น', labelColor: '#ffffff', labelBackground: '#27ae60', image: 'basket', x: 0.31, y: 0.78, width: 0.31, height: 0.27, dropOffsetY: -18 },
                    { id: 'zone_red_square', label: 'แท่งเหลี่ยม สีแดง เท่านั้น', labelColor: '#ffffff', labelBackground: '#c0392b', image: 'basket', x: 0.69, y: 0.78, width: 0.31, height: 0.27, dropOffsetY: -18 }
                ],
                items: [
                    { key: 'fert_green_round', target: 'zone_green_round', x: 0.19, y: 0.43 },
                    { key: 'fert_red_square', target: 'zone_red_square', x: 0.81, y: 0.28 },
                    { key: 'fert_green_square', target: null, x: 0.38, y: 0.28 },
                    { key: 'fert_red_round', target: null, x: 0.62, y: 0.43 }
                ]
            }
        ],
        scoring: {
            threeStarsMaxMistakes: 0,
            twoStarsMaxMistakes: 2
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
