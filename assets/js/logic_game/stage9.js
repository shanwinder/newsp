// Stage 9: Smart Farm Manager - Hi-Tech Greenhouse with If / Else If / Else.
(function () {
    const config = {
        title: 'บทที่ 3: ผู้จัดการฟาร์มอัจฉริยะ',
        subtitle: 'เกมที่ 3: ผู้ดูแลโรงเรือนไฮเทค | ฝึกใช้ If / Else If / Else เท่านั้น',
        resultText: 'คุณจัดลำดับเงื่อนไขเพื่อควบคุมโรงเรือนไฮเทคครบทั้ง 3 ภารกิจแล้ว',
        levels: [
            {
                title: '9-1 ควบคุมความชื้นในโรงเรือน',
                mission: 'ปรับความชื้นให้เหมาะสม',
                brief: 'ชื้นต่ำเปิดสปริงเกอร์ ชื้นสูงเปิดพัดลมลดความชื้น ที่เหลือปิดระบบ',
                intro: 'ระบบอ่าน If ก่อน แล้วค่อย Else If ถ้าไม่เข้าเงื่อนไขใดจึงใช้ Else',
                lessonType: 'if_else_if_else',
                lessonTypeLabel: 'If / Else If / Else',
                theme: 'greenhouse',
                hint: 'ถ้า [ความชื้น < 30%] -> [เปิดสปริงเกอร์] | หรือถ้า [ความชื้น > 80%] -> [เปิดพัดลมลดความชื้น] | นอกเหนือจากนี้ -> [ปิดระบบ]',
                allowReorder: true,
                ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else' }],
                conditions: [
                    { id: 'humidity_under_30', label: 'ความชื้น < 30%', compare: { key: 'moisture', op: '<', value: 30 } },
                    { id: 'humidity_over_80', label: 'ความชื้น > 80%', compare: { key: 'moisture', op: '>', value: 80 } }
                ],
                actions: [
                    { id: 'sprinkler_on', label: 'เปิดสปริงเกอร์', successText: 'สปริงเกอร์ทำงานเพิ่มความชื้นให้กระถาง' },
                    { id: 'dehumidify_fan', label: 'เปิดพัดลมลดความชื้น', successText: 'พัดลมระบายความชื้นส่วนเกินออกจากโรงเรือน' },
                    { id: 'all_off', label: 'ปิดระบบ', successText: 'ค่าปกติ ระบบปิดเพื่อประหยัดพลังงาน' }
                ],
                machines: [
                    { slot: 'a', label: 'สปริงเกอร์', icon: '💦', actions: ['sprinkler_on'] },
                    { slot: 'b', label: 'พัดลมลดชื้น', icon: '🌀', actions: ['dehumidify_fan'] },
                    { slot: 'c', label: 'ปิดระบบ', icon: '🔌', actions: ['all_off'] }
                ],
                itemQueue: [
                    pot('A', 18), pot('B', 44), pot('C', 86), pot('D', 28),
                    pot('E', 73), pot('F', 91), pot('G', 35), pot('H', 22),
                    pot('I', 80), pot('J', 88), pot('K', 52), pot('L', 16)
                ],
                expectedLogic: [
                    { condition: 'humidity_under_30', action: 'sprinkler_on' },
                    { condition: 'humidity_over_80', action: 'dehumidify_fan' },
                    { condition: 'else', action: 'all_off' }
                ],
                scoring: defaultScoring()
            },
            {
                title: '9-2 ควบคุมหลังคาโรงเรือนเมลอน',
                mission: 'ป้องกันฝนและจัดการแสงให้เหมาะกับเมลอน',
                brief: 'ฝนตกกางหลังคา แดดแรงกางสแลน นอกเหนือจากนี้เปิดรับแสงธรรมชาติ',
                intro: 'ลำดับกฎช่วยให้ฝนถูกจัดการก่อนแดดแรง ลองลากสลับ If / Else If เพื่อดูผลได้',
                lessonType: 'if_else_if_else',
                lessonTypeLabel: 'If / Else If / Else',
                theme: 'greenhouse',
                hint: 'ถ้า [ฝนตก] -> [กางหลังคา] | หรือถ้า [แดดแรงมาก] -> [กางสแลนพรางแสง] | นอกเหนือจากนี้ -> [เปิดรับแสงธรรมชาติ]',
                allowReorder: true,
                ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else' }],
                conditions: [
                    { id: 'rain', label: 'ฝนตก', match: { weather: 'rain' } },
                    { id: 'strong_sun', label: 'แดดแรงมาก', match: { weather: 'strong_sun' } }
                ],
                actions: [
                    { id: 'roof_close', label: 'กางหลังคา', successText: 'หลังคากางออกกันฝนให้เมลอน' },
                    { id: 'shade_net', label: 'กางสแลนพรางแสง', successText: 'สแลนพรางแสงลดแดดแรงให้โรงเรือน' },
                    { id: 'natural_light', label: 'เปิดรับแสงธรรมชาติ', successText: 'หลังคาเปิดรับแสงธรรมชาติพอดี' }
                ],
                machines: [
                    { slot: 'a', label: 'หลังคากันฝน', icon: '⛱️', actions: ['roof_close'] },
                    { slot: 'b', label: 'สแลนพรางแสง', icon: '☂️', actions: ['shade_net'] },
                    { slot: 'c', label: 'แสงธรรมชาติ', icon: '☀️', actions: ['natural_light'] }
                ],
                itemQueue: [
                    weather('A', 'rain'), weather('B', 'normal'), weather('C', 'strong_sun'), weather('D', 'rain'),
                    weather('E', 'normal'), weather('F', 'strong_sun'), weather('G', 'rain'), weather('H', 'normal'),
                    weather('I', 'strong_sun'), weather('J', 'normal'), weather('K', 'rain'), weather('L', 'strong_sun')
                ],
                expectedLogic: [
                    { condition: 'rain', action: 'roof_close' },
                    { condition: 'strong_sun', action: 'shade_net' },
                    { condition: 'else', action: 'natural_light' }
                ],
                scoring: defaultScoring()
            },
            {
                title: '9-3 ควบคุมอุณหภูมิโรงเรือนเห็ด',
                mission: 'ควบคุมอุณหภูมิให้เหมาะสมกับเห็ด',
                brief: 'ร้อนเกินเปิดพัดลม หนาวเกินเปิดหลอดไฟอุ่น ที่เหลือปิดระบบทั้งหมด',
                intro: 'ใช้ Else If กับช่วงตัวเลข และดูว่ากฎบนสุดถูกตรวจเป็นอันดับแรกเสมอ',
                lessonType: 'if_else_if_else',
                lessonTypeLabel: 'If / Else If / Else',
                theme: 'greenhouse',
                hint: 'ถ้า [อุณหภูมิ > 35°C] -> [เปิดพัดลม] | หรือถ้า [อุณหภูมิ < 15°C] -> [เปิดหลอดไฟอุ่น] | นอกเหนือจากนี้ -> [ปิดระบบทั้งหมด]',
                allowReorder: true,
                ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else' }],
                conditions: [
                    { id: 'temp_over_35', label: 'อุณหภูมิ > 35°C', compare: { key: 'temperature', op: '>', value: 35 } },
                    { id: 'temp_under_15', label: 'อุณหภูมิ < 15°C', compare: { key: 'temperature', op: '<', value: 15 } }
                ],
                actions: [
                    { id: 'fan_on', label: 'เปิดพัดลม', successText: 'พัดลมหมุนลดความร้อนในโรงเรือนเห็ด' },
                    { id: 'warm_light_on', label: 'เปิดหลอดไฟอุ่น', successText: 'หลอดไฟอุ่นช่วยเพิ่มอุณหภูมิ' },
                    { id: 'all_off', label: 'ปิดระบบทั้งหมด', successText: 'อุณหภูมิปกติ ระบบปิดทั้งหมด' }
                ],
                machines: [
                    { slot: 'a', label: 'พัดลม', icon: '🌀', actions: ['fan_on'] },
                    { slot: 'b', label: 'หลอดไฟอุ่น', icon: '💡', actions: ['warm_light_on'] },
                    { slot: 'c', label: 'ปิดระบบ', icon: '🔌', actions: ['all_off'] }
                ],
                itemQueue: [
                    temp('A', 38), temp('B', 24), temp('C', 12), temp('D', 36),
                    temp('E', 18), temp('F', 14), temp('G', 29), temp('H', 41),
                    temp('I', 22), temp('J', 10), temp('K', 35), temp('L', 16)
                ],
                expectedLogic: [
                    { condition: 'temp_over_35', action: 'fan_on' },
                    { condition: 'temp_under_15', action: 'warm_light_on' },
                    { condition: 'else', action: 'all_off' }
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
            path: `../assets/img/conveyor/greenhouse/${key}.png`,
            width: 96,
            height: 96,
            description,
            futureSpriteSheet: {
                path: `../assets/img/conveyor/greenhouse/${key}_sheet.png`,
                frameWidth: 96,
                frameHeight: 96,
                animations: ['idle', 'move', 'sensor_read', 'route_result']
            }
        };
    }

    function pot(id, moisture) {
        let expectedAction = 'all_off';
        let feedback = `ความชื้น ${moisture}% อยู่ช่วงปกติ ควรปิดระบบ`;
        if (moisture < 30) {
            expectedAction = 'sprinkler_on';
            feedback = `ความชื้น ${moisture}% ต่ำกว่า 30% ควรเปิดสปริงเกอร์`;
        } else if (moisture > 80) {
            expectedAction = 'dehumidify_fan';
            feedback = `ความชื้น ${moisture}% สูงกว่า 80% ควรเปิดพัดลมลดความชื้น`;
        }
        return {
            id: `pot_${id}`,
            label: `ความชื้น ${moisture}%`,
            fallbackIcon: '🪴',
            asset: asset(`pot_moisture_${moisture}`, `ภาพกระถางพร้อมตัวเลขความชื้น ${moisture}%`),
            props: { type: 'plant_pot', moisture },
            sensor: `เซ็นเซอร์ความชื้นอ่านค่า ${moisture}%`,
            expectedAction,
            feedback
        };
    }

    function weather(id, state) {
        const data = {
            rain: ['ฝนตก', '🌧️', 'roof_close', 'ฝนตกควรกางหลังคากันเมลอนช้ำ'],
            strong_sun: ['แดดแรงมาก', '☀️', 'shade_net', 'แดดแรงมากควรกางสแลนพรางแสง'],
            normal: ['อากาศปกติ', '🌤️', 'natural_light', 'อากาศปกติควรเปิดรับแสงธรรมชาติ']
        }[state];
        return {
            id: `weather_${id}`,
            label: data[0],
            fallbackIcon: data[1],
            asset: asset(`weather_${state}`, `ภาพสภาพอากาศ ${data[0]} เหนือโรงเรือนเมลอน`),
            props: { type: 'melon_greenhouse', weather: state },
            sensor: `เซ็นเซอร์อากาศ: ${data[0]}`,
            expectedAction: data[2],
            feedback: data[3]
        };
    }

    function temp(id, temperature) {
        let expectedAction = 'all_off';
        let feedback = `อุณหภูมิ ${temperature}°C อยู่ช่วงปกติ ควรปิดระบบทั้งหมด`;
        if (temperature > 35) {
            expectedAction = 'fan_on';
            feedback = `อุณหภูมิ ${temperature}°C สูงกว่า 35°C ควรเปิดพัดลม`;
        } else if (temperature < 15) {
            expectedAction = 'warm_light_on';
            feedback = `อุณหภูมิ ${temperature}°C ต่ำกว่า 15°C ควรเปิดหลอดไฟอุ่น`;
        }
        return {
            id: `temp_${id}`,
            label: `${temperature}°C`,
            fallbackIcon: temperature > 35 ? '🌡️' : temperature < 15 ? '❄️' : '🍄',
            asset: asset(`mushroom_temp_${temperature}`, `ภาพโรงเรือนเห็ดพร้อมเทอร์โมมิเตอร์ ${temperature}°C`),
            props: { type: 'mushroom_house', temperature },
            sensor: `เทอร์โมมิเตอร์แสดง ${temperature}°C`,
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
