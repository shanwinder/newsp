// Stage 1: แยกแยะเมล็ดพันธุ์และวงจรชีวิตพืช
(function () {
    const config = {
        title: 'แยกแยะเมล็ดพันธุ์',
        subtitle: 'สังเกตและเลือกสิ่งที่ตรงตามเงื่อนไข',
        backgroundKey: 'bg_farm',
        resultText: 'ภารกิจเสร็จสิ้น!',
        transitionText: 'ยอดเยี่ยม! ไปต่อกันเลย',
        assets: [
            ['bg_farm', '../assets/img/bg_farm.webp'],
            ['seed', '../assets/img/newseed.webp'],
            ['basket', '../assets/img/basket.webp'],
            ['rock', '../assets/img/rock.webp'],
            ['weed', '../assets/img/weed.webp'],
            ['sprout', '../assets/img/newsprout.webp'],
            ['plant', '../assets/img/newplant.webp']
        ],
        sounds: [
            ['correct', '../assets/sound/correct.mp3'],
            ['wrong', '../assets/sound/wrong.mp3']
        ],
        scales: {
            seed: 0.2,
            rock: 0.2,
            weed: 0.25,
            sprout: 0.25,
            plant: 0.25,
            basket: 0.35
        },
        levels: [
            {
                type: 'drag_sort',
                title: 'ด่าน 1/3: ลากเมล็ดพันธุ์ลงตะกร้า',
                mission: 'เลือกเฉพาะเมล็ดพันธุ์ หลีกเลี่ยงก้อนหิน',
                goal: 'ลากเมล็ดพันธุ์ 2 ชิ้นลงตะกร้า',
                titleColor: '#166534',
                zones: [
                    { id: 'basket', label: 'ตะกร้าเมล็ดพันธุ์', image: 'basket', x: 0.5, y: 0.78, width: 0.31, height: 0.27 }
                ],
                items: [
                    { key: 'seed', target: 'basket', x: 0.25, y: 0.34 },
                    { key: 'rock', target: null, x: 0.44, y: 0.27 },
                    { key: 'seed', target: 'basket', x: 0.57, y: 0.43 },
                    { key: 'rock', target: null, x: 0.75, y: 0.32 }
                ]
            },
            {
                type: 'click_targets',
                spawnMode: 'sequential',
                title: 'ด่าน 2/3: กำจัดวัชพืช',
                mission: 'กำจัดวัชพืชให้ครบ ระวังอย่ากดโดนต้นกล้า',
                goal: 'คลิกวัชพืช 5 ครั้ง และหลีกเลี่ยงต้นกล้า',
                titleColor: '#c0392b',
                targetKeys: ['weed'],
                fakeKeys: ['sprout'],
                targetCount: 5,
                targetChance: 0.6,
                visibleDuration: 1500,
                spawnArea: { left: 0.19, right: 0.81, top: 0.36, bottom: 0.82 }
            },
            {
                type: 'sequence_drop',
                title: 'ด่าน 3/3: ลากภาพวงจรชีวิตให้สมบูรณ์',
                mission: 'เติมภาพลำดับสุดท้ายของวงจรชีวิตพืช',
                goal: 'ลากต้นไม้ไปเติมช่องว่างท้ายลำดับ',
                titleColor: '#2980b9',
                sequenceY: 0.48,
                answerKey: 'plant',
                sequence: [
                    { key: 'seed', x: 0.26 },
                    { type: 'arrow', x: 0.39 },
                    { key: 'sprout', x: 0.5 },
                    { type: 'arrow', x: 0.61 }
                ],
                answerZone: { x: 0.74, y: 0.48, width: 0.19, height: 0.25 },
                options: [
                    { key: 'rock', answerKey: 'rock', x: 0.38, y: 0.84 },
                    { key: 'plant', answerKey: 'plant', x: 0.62, y: 0.84 }
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
