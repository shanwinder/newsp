// Stage 8: Smart Farm Manager - Robot Rancher.
(function () {
    const config = {
        title: 'Smart Farm Manager: หุ่นยนต์เลี้ยงสัตว์อัจฉริยะ',
        subtitle: 'ตั้งกฎให้บอทบัวบานดูแลสัตว์จากชนิดและค่าสถานะ',
        levels: [
            {
                title: '8-1 ตัดขนแกะเมื่อขนยาว',
                brief: 'แกะขนฟูมากต้องเข้าเครื่องตัดขน ส่วนแกะขนสั้นปล่อยไปกินหญ้า',
                intro: 'ใช้ If เพื่อสั่งตัดขนเฉพาะแกะที่ขนฟูมากเท่านั้น',
                lessonType: 'if',
                lessonTypeLabel: 'If',
                theme: 'animal',
                hint: 'ถ้า [แกะขนฟูมาก] -> [กดปุ่มตัดขน]',
                ruleSlots: [{ type: 'if' }],
                conditions: [
                    { id: 'sheep_woolly', label: 'แกะขนฟูมาก' }
                ],
                actions: [
                    { id: 'shear', label: 'กดปุ่มตัดขน', successText: 'เครื่องตัดขนทำงาน แกะยิ้มสบายตัว' },
                    { id: 'pass', label: 'ปล่อยไปกินหญ้า', successText: 'แกะขนสั้นเดินไปกินหญ้าอย่างสบายใจ' }
                ],
                machines: [
                    { slot: 'a', label: 'เครื่องตัดขน', icon: '✂️', actions: ['shear'] },
                    { slot: 'pass', label: 'ทุ่งหญ้า', icon: '🌿', actions: ['pass'] }
                ],
                itemQueue: [
                    sheep('A', 'long'), sheep('B', 'short'), sheep('C', 'long'), sheep('D', 'short'),
                    sheep('E', 'long'), sheep('F', 'long'), sheep('G', 'short'), sheep('H', 'long'),
                    sheep('I', 'short'), sheep('J', 'long')
                ],
                expectedLogic: [
                    { condition: 'sheep_woolly', action: 'shear' }
                ],
                scoring: { passAccuracy: 0.8, threeStarAccuracy: 0.95, maxDamaged: 3, maxDamagedForThreeStars: 1 }
            },
            {
                title: '8-2 แจกจ่ายอาหารให้สัตว์ในฟาร์ม',
                brief: 'วัวได้หญ้าเนเปียร์ ส่วนสัตว์อื่นใช้ Else เพื่อจ่ายรำข้าว',
                intro: 'Else ช่วยให้บอทบัวบานดูแลสัตว์อื่น ๆ ได้โดยไม่ต้องสร้างกฎหลายบรรทัด',
                lessonType: 'if_else',
                lessonTypeLabel: 'If / Else',
                theme: 'animal',
                hint: 'ถ้า [เป็นวัว] -> [จ่ายหญ้าเนเปียร์] | นอกเหนือจากนี้ -> [จ่ายรำข้าว]',
                ruleSlots: [{ type: 'if' }, { type: 'else' }],
                conditions: [
                    { id: 'animal_cow', label: 'เป็นวัว' }
                ],
                actions: [
                    { id: 'feed_grass', label: 'จ่ายหญ้าเนเปียร์', successText: 'วัวได้หญ้าแล้วมีหัวใจเด้งขึ้น' },
                    { id: 'feed_bran', label: 'จ่ายรำข้าว', successText: 'สัตว์ตัวอื่นได้รำข้าวถูกต้อง' }
                ],
                machines: [
                    { slot: 'a', label: 'ถังหญ้าเนเปียร์', icon: '🌾', actions: ['feed_grass'] },
                    { slot: 'b', label: 'ถังรำข้าว', icon: '🥣', actions: ['feed_bran'] }
                ],
                itemQueue: [
                    animal('A', 'cow'), animal('B', 'chicken'), animal('C', 'duck'), animal('D', 'pig'),
                    animal('E', 'cow'), animal('F', 'chicken'), animal('G', 'cow'), animal('H', 'duck'),
                    animal('I', 'pig'), animal('J', 'cow')
                ],
                expectedLogic: [
                    { condition: 'animal_cow', action: 'feed_grass' },
                    { condition: 'else', action: 'feed_bran' }
                ],
                scoring: { passAccuracy: 0.85, threeStarAccuracy: 0.95, maxDamaged: 3, maxDamagedForThreeStars: 1 }
            },
            {
                title: '8-3 เติมสารอาหารให้แม่หมูตามน้ำหนัก',
                brief: 'หมูน้ำหนักน้อยกว่า 40 ได้สูตรเร่งโต มากกว่า 80 ได้สูตรคุมน้ำหนัก ที่เหลืออาหารปกติ',
                intro: 'ด่านนี้ใช้เงื่อนไขตัวเลขและลำดับ If / Else If / Else',
                lessonType: 'if_else_if_else',
                lessonTypeLabel: 'If / Else If / Else',
                theme: 'animal',
                hint: 'ถ้า [น้ำหนัก < 40 กิโล] -> [สูตรเร่งโต] | หรือถ้า [น้ำหนัก > 80 กิโล] -> [สูตรคุมน้ำหนัก] | นอกเหนือจากนี้ -> [สูตรอาหารปกติ]',
                ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else' }],
                conditions: [
                    { id: 'pig_under_40', label: 'น้ำหนัก < 40 กิโล' },
                    { id: 'pig_over_80', label: 'น้ำหนัก > 80 กิโล' }
                ],
                actions: [
                    { id: 'feed_grow', label: 'ให้สูตรเร่งโต', successText: 'หมูตัวเล็กได้อาหารเร่งโตแล้วยิ้ม' },
                    { id: 'feed_control', label: 'ให้สูตรคุมน้ำหนัก', successText: 'หมูตัวใหญ่ได้สูตรคุมน้ำหนักถูกต้อง' },
                    { id: 'feed_normal', label: 'ให้สูตรอาหารปกติ', successText: 'หมูน้ำหนักปกติได้อาหารพอดี' }
                ],
                machines: [
                    { slot: 'a', label: 'สูตรเร่งโต', icon: '⚡', actions: ['feed_grow'] },
                    { slot: 'b', label: 'สูตรคุมน้ำหนัก', icon: '⚖️', actions: ['feed_control'] },
                    { slot: 'c', label: 'สูตรปกติ', icon: '🥣', actions: ['feed_normal'] }
                ],
                itemQueue: [
                    pig('A', 35), pig('B', 55), pig('C', 86), pig('D', 42), pig('E', 31),
                    pig('F', 80), pig('G', 91), pig('H', 64), pig('I', 38), pig('J', 84)
                ],
                expectedLogic: [
                    { condition: 'pig_under_40', action: 'feed_grow' },
                    { condition: 'pig_over_80', action: 'feed_control' },
                    { condition: 'else', action: 'feed_normal' }
                ],
                scoring: { passAccuracy: 0.85, threeStarAccuracy: 0.95, maxDamaged: 3, maxDamagedForThreeStars: 1 }
            }
        ]
    };

    function sheep(id, wool) {
        const long = wool === 'long';
        return {
            key: `sheep_${id}`,
            label: long ? 'แกะขนฟูมาก' : 'แกะขนสั้น',
            icon: '🐑',
            props: { type: 'sheep', wool },
            sensor: long ? 'เซ็นเซอร์พบขนยาวฟูเต็มตัว' : 'เซ็นเซอร์พบว่าเพิ่งตัดขนแล้ว',
            expectedAction: long ? 'shear' : 'pass',
            feedback: long
                ? 'แกะขนฟูควรถูกส่งเข้าเครื่องตัดขน'
                : 'แกะขนสั้นไม่ควรถูกตัดซ้ำ ปล่อยไปกินหญ้าดีกว่า'
        };
    }

    function animal(id, type) {
        const labels = {
            cow: ['วัว', '🐄'],
            chicken: ['ไก่', '🐔'],
            duck: ['เป็ด', '🦆'],
            pig: ['หมู', '🐖']
        };
        const [label, icon] = labels[type];
        return {
            key: `${type}_${id}`,
            label,
            icon,
            props: { type },
            sensor: `บอทบัวบานอ่านชนิดสัตว์: ${label}`,
            expectedAction: type === 'cow' ? 'feed_grass' : 'feed_bran',
            feedback: type === 'cow'
                ? 'วัวควรได้หญ้าเนเปียร์ ไม่ใช่รำข้าว'
                : `${label} ใช้ Else เพื่อรับรำข้าวได้เลย`
        };
    }

    function pig(id, weight) {
        let expectedAction = 'feed_normal';
        let feedback = 'น้ำหนักอยู่ช่วงปกติ ควรได้สูตรอาหารปกติ';
        if (weight < 40) {
            expectedAction = 'feed_grow';
            feedback = `หมูน้ำหนัก ${weight} กิโล น้อยกว่า 40 ควรได้สูตรเร่งโต`;
        } else if (weight > 80) {
            expectedAction = 'feed_control';
            feedback = `หมูน้ำหนัก ${weight} กิโล มากกว่า 80 ควรได้สูตรคุมน้ำหนัก`;
        }
        return {
            key: `pig_weight_${id}`,
            label: `แม่หมู ${weight} กก.`,
            icon: '🐖',
            props: { type: 'pig', weight },
            sensor: `แท่นชั่งแสดงน้ำหนัก ${weight} กิโลกรัม`,
            expectedAction,
            feedback
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
