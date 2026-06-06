// Stage 8: Smart Farm Manager - Robot Rancher with If / Else.
(function () {
    const config = {
        title: 'บทที่ 3: ผู้จัดการฟาร์มอัจฉริยะ',
        subtitle: 'เกมที่ 2: หุ่นยนต์เลี้ยงสัตว์อัจฉริยะ | ฝึกใช้ If / Else เท่านั้น',
        resultText: 'คุณเขียนกฎ If / Else ให้หุ่นยนต์เลี้ยงสัตว์ครบทั้ง 3 ภารกิจแล้ว',
        levels: [
            {
                title: '8-1 วัวกินหญ้า สัตว์อื่นกินรำ',
                mission: 'แจกอาหารให้สัตว์ถูกชนิด',
                brief: 'ถ้าเป็นวัวให้จ่ายหญ้าเนเปียร์ นอกเหนือจากนี้จ่ายรำข้าว',
                intro: 'ใช้ If / Else เพื่อแยกวัวออกจากสัตว์อื่นโดยไม่ต้องเขียนกฎหลายบรรทัด',
                lessonType: 'if_else',
                lessonTypeLabel: 'If / Else',
                theme: 'animal',
                hint: 'ถ้า [เป็นวัว] -> [จ่ายหญ้าเนเปียร์] | นอกเหนือจากนี้ -> [จ่ายรำข้าว]',
                ruleSlots: [{ type: 'if' }, { type: 'else' }],
                conditions: [
                    { id: 'animal_cow', label: 'เป็นวัว', match: { type: 'cow' } }
                ],
                actions: [
                    { id: 'feed_grass', label: 'จ่ายหญ้าเนเปียร์', successText: 'วัวได้หญ้าแล้วมีหัวใจขึ้น' },
                    { id: 'feed_bran', label: 'จ่ายรำข้าว', successText: 'สัตว์ตัวอื่นได้รำข้าวพอดี' }
                ],
                machines: [
                    { slot: 'a', label: 'ถังหญ้าเนเปียร์', icon: '🌾', actions: ['feed_grass'] },
                    { slot: 'b', label: 'ถังรำข้าว', icon: '🥣', actions: ['feed_bran'] }
                ],
                itemQueue: [
                    animal('A', 'cow'), animal('B', 'chicken'), animal('C', 'duck'), animal('D', 'pig'),
                    animal('E', 'cow'), animal('F', 'chicken'), animal('G', 'cow'), animal('H', 'duck'),
                    animal('I', 'pig'), animal('J', 'cow'), animal('K', 'duck'), animal('L', 'chicken')
                ],
                expectedLogic: [
                    { condition: 'animal_cow', action: 'feed_grass' },
                    { condition: 'else', action: 'feed_bran' }
                ],
                scoring: defaultScoring()
            },
            {
                title: '8-2 แกะขนยาวต้องตัดขน',
                mission: 'ตัดขนแกะที่ขนฟูมาก ที่เหลือไปกินหญ้า',
                brief: 'ถ้าแกะขนฟูมากให้ตัดขน นอกเหนือจากนี้ปล่อยไปกินหญ้า',
                intro: 'Else จะดูแลแกะขนสั้นและสัตว์อื่นที่ไม่ต้องตัดขน',
                lessonType: 'if_else',
                lessonTypeLabel: 'If / Else',
                theme: 'animal',
                hint: 'ถ้า [แกะขนฟูมาก] -> [ตัดขน] | นอกเหนือจากนี้ -> [ปล่อยไปกินหญ้า]',
                ruleSlots: [{ type: 'if' }, { type: 'else' }],
                conditions: [
                    { id: 'sheep_woolly', label: 'แกะขนฟูมาก', match: { type: 'sheep', wool: 'long' } }
                ],
                actions: [
                    { id: 'shear', label: 'ตัดขน', successText: 'เครื่องตัดขนทำงาน ขนแกะฟุ้งเป็นก้อนเมฆ' },
                    { id: 'graze', label: 'ปล่อยไปกินหญ้า', successText: 'สัตว์ที่ไม่ต้องตัดขนเดินไปกินหญ้าอย่างสบายใจ' }
                ],
                machines: [
                    { slot: 'a', label: 'เครื่องตัดขน', icon: '✂️', actions: ['shear'] },
                    { slot: 'b', label: 'ทุ่งหญ้า', icon: '🌿', actions: ['graze'] }
                ],
                itemQueue: [
                    sheep('A', 'long'), sheep('B', 'short'), grazingAnimal('C', 'goat'), sheep('D', 'long'),
                    grazingAnimal('E', 'cow'), sheep('F', 'short'), sheep('G', 'long'), grazingAnimal('H', 'duck'),
                    sheep('I', 'short'), sheep('J', 'long'), grazingAnimal('K', 'pig'), sheep('L', 'long')
                ],
                expectedLogic: [
                    { condition: 'sheep_woolly', action: 'shear' },
                    { condition: 'else', action: 'graze' }
                ],
                scoring: defaultScoring()
            },
            {
                title: '8-3 สัตว์ป่วยต้องเข้าคอกพยาบาล',
                mission: 'แยกสัตว์ป่วยไปคอกพยาบาล ที่เหลือไปคอกปกติ',
                brief: 'ถ้าสัตว์ป่วยให้ส่งคอกพยาบาล นอกเหนือจากนี้ส่งคอกปกติ',
                intro: 'สังเกตสัญลักษณ์ป่วยบนสัตว์หลายชนิด แล้วใช้ Else ดูแลสัตว์ปกติทั้งหมด',
                lessonType: 'if_else',
                lessonTypeLabel: 'If / Else',
                theme: 'animal',
                hint: 'ถ้า [สัตว์ป่วย] -> [ส่งคอกพยาบาล] | นอกเหนือจากนี้ -> [ส่งคอกปกติ]',
                ruleSlots: [{ type: 'if' }, { type: 'else' }],
                conditions: [
                    { id: 'animal_sick', label: 'สัตว์ป่วย', match: { sick: true } }
                ],
                actions: [
                    { id: 'hospital_pen', label: 'ส่งคอกพยาบาล', successText: 'หุ่นยนต์พาสัตว์ป่วยเข้าคอกพยาบาล' },
                    { id: 'normal_pen', label: 'ส่งคอกปกติ', successText: 'สัตว์ปกติเดินเข้าคอกสีเขียว' }
                ],
                machines: [
                    { slot: 'a', label: 'คอกพยาบาล', icon: '🏥', actions: ['hospital_pen'] },
                    { slot: 'b', label: 'คอกปกติ', icon: '✅', actions: ['normal_pen'] }
                ],
                itemQueue: [
                    healthAnimal('A', 'cow', true), healthAnimal('B', 'chicken', false),
                    healthAnimal('C', 'duck', true), healthAnimal('D', 'pig', false),
                    healthAnimal('E', 'sheep', true), healthAnimal('F', 'cow', false),
                    healthAnimal('G', 'goat', false), healthAnimal('H', 'duck', true),
                    healthAnimal('I', 'pig', true), healthAnimal('J', 'chicken', false),
                    healthAnimal('K', 'sheep', false), healthAnimal('L', 'goat', true)
                ],
                expectedLogic: [
                    { condition: 'animal_sick', action: 'hospital_pen' },
                    { condition: 'else', action: 'normal_pen' }
                ],
                scoring: defaultScoring()
            }
        ]
    };

    function defaultScoring() {
        return {
            oneStarAccuracy: 0.6,
            twoStarAccuracy: 0.75,
            threeStarAccuracy: 0.9,
            maxDamagedForThreeStars: 1,
            passAccuracy: 0.6
        };
    }

    function asset(key, description) {
        return {
            key,
            path: `../assets/img/conveyor/animals/${key}.png`,
            width: 96,
            height: 96,
            description,
            futureSpriteSheet: {
                path: `../assets/img/conveyor/animals/${key}_sheet.png`,
                frameWidth: 96,
                frameHeight: 96,
                animations: ['idle', 'move', 'happy_correct', 'sad_wrong']
            }
        };
    }

    function animal(id, type) {
        const labels = {
            cow: ['วัว', '🐄'],
            chicken: ['ไก่', '🐔'],
            duck: ['เป็ด', '🦆'],
            pig: ['หมู', '🐖'],
            goat: ['แพะ', '🐐']
        };
        const [label, icon] = labels[type];
        return {
            id: `${type}_${id}`,
            label,
            fallbackIcon: icon,
            asset: asset(type, `ภาพ${label}ใช้ในเกมหุ่นยนต์เลี้ยงสัตว์`),
            props: { type, sick: false },
            sensor: `บอทอ่านชนิดสัตว์: ${label}`,
            expectedAction: type === 'cow' ? 'feed_grass' : 'feed_bran',
            feedback: type === 'cow' ? 'วัวควรได้หญ้าเนเปียร์' : `${label} ควรใช้ Else เพื่อรับรำข้าว`
        };
    }

    function sheep(id, wool) {
        const woolly = wool === 'long';
        return {
            id: `sheep_${id}`,
            label: woolly ? 'แกะขนฟูมาก' : 'แกะขนสั้น',
            fallbackIcon: '🐑',
            asset: asset(woolly ? 'sheep_woolly' : 'sheep_short', woolly ? 'ภาพแกะขนฟูมาก' : 'ภาพแกะขนสั้น'),
            props: { type: 'sheep', wool, sick: false },
            sensor: woolly ? 'เซ็นเซอร์พบขนยาวฟูมาก' : 'ขนยังสั้น ไม่ต้องตัดซ้ำ',
            expectedAction: woolly ? 'shear' : 'graze',
            feedback: woolly ? 'แกะขนฟูมากควรเข้าเครื่องตัดขน' : 'ตัวนี้ไม่ต้องตัดขน ควรปล่อยไปกินหญ้า'
        };
    }

    function grazingAnimal(id, type) {
        const labels = {
            cow: ['วัว', '🐄'],
            duck: ['เป็ด', '🦆'],
            pig: ['หมู', '🐖'],
            goat: ['แพะ', '🐐']
        };
        const [label, icon] = labels[type];
        return {
            id: `graze_${type}_${id}`,
            label,
            fallbackIcon: icon,
            asset: asset(`${type}_graze`, `ภาพ${label}เดินผ่านสถานีตัดขน`),
            props: { type, wool: 'none', sick: false },
            sensor: `${label}ไม่ใช่แกะขนฟูมาก`,
            expectedAction: 'graze',
            feedback: `${label}ไม่ต้องตัดขน ควรปล่อยไปกินหญ้า`
        };
    }

    function healthAnimal(id, type, sick) {
        const labels = {
            cow: ['วัว', '🐄'],
            chicken: ['ไก่', '🐔'],
            duck: ['เป็ด', '🦆'],
            pig: ['หมู', '🐖'],
            sheep: ['แกะ', '🐑'],
            goat: ['แพะ', '🐐']
        };
        const [label, icon] = labels[type];
        return {
            id: `health_${type}_${id}`,
            label: sick ? `${label}ป่วย` : `${label}ปกติ`,
            fallbackIcon: sick ? '🤒' : icon,
            asset: asset(sick ? `${type}_sick` : `${type}_healthy`, sick ? `ภาพ${label}มีผ้าพันแผลหรือปรอท` : `ภาพ${label}ปกติ`),
            props: { type, sick },
            sensor: sick ? `พบสัญญาณป่วยบน${label}` : `${label}สุขภาพปกติ`,
            expectedAction: sick ? 'hospital_pen' : 'normal_pen',
            feedback: sick ? 'สัตว์ป่วยต้องเข้าคอกพยาบาล' : 'สัตว์ปกติควรเข้าคอกปกติ'
        };
    }

    function boot() {
        window.FarmMissions.conveyorLogic(config);
    }

    if (window.FarmMissions && window.FarmMissions.conveyorLogic) {
        boot();
    } else {
        const script = document.createElement('script');
        script.src = '../assets/js/logic_game/conveyor_logic_base.js';
        script.onload = boot;
        document.head.appendChild(script);
    }
})();
