// Stage 9: Smart Farm Manager - Greenhouse Controller.
(function () {
    const config = {
        title: 'Smart Farm Manager: ผู้ดูแลโรงเรือนไฮเทค',
        subtitle: 'ตั้งกฎควบคุมสภาพแวดล้อมด้วยความชื้น ฝน และอุณหภูมิ',
        levels: [
            {
                title: '9-1 ระบบรดน้ำอัตโนมัติ',
                brief: 'เปิดสปริงเกอร์เมื่อความชื้นในดินต่ำ ส่วนกระถางที่ชื้นดีแล้วไม่ต้องรดน้ำเพิ่ม',
                intro: 'ใช้ If กับค่าความชื้นต่ำ เพื่อให้สปริงเกอร์ทำงานเฉพาะตอนจำเป็น',
                lessonType: 'if',
                lessonTypeLabel: 'If',
                theme: 'greenhouse',
                hint: 'ถ้า [ความชื้นในดินต่ำ] -> [เปิดสปริงเกอร์รดน้ำ]',
                ruleSlots: [{ type: 'if' }],
                conditions: [
                    { id: 'soil_low_moisture', label: 'ความชื้นในดินต่ำ' }
                ],
                actions: [
                    { id: 'sprinkler_on', label: 'เปิดสปริงเกอร์รดน้ำ', successText: 'สปริงเกอร์หมุนพ่นน้ำ ต้นไม้ฟื้นตัว' },
                    { id: 'pass', label: 'ไม่ต้องรดน้ำเพิ่ม', successText: 'ดินชื้นดีแล้ว ระบบประหยัดน้ำ' }
                ],
                machines: [
                    { slot: 'a', label: 'สปริงเกอร์', icon: '💦', actions: ['sprinkler_on'] },
                    { slot: 'pass', label: 'โซนประหยัดน้ำ', icon: '🌱', actions: ['pass'] }
                ],
                itemQueue: [
                    pot('A', 18), pot('B', 44), pot('C', 25), pot('D', 62), pot('E', 21),
                    pot('F', 39), pot('G', 16), pot('H', 55), pot('I', 28), pot('J', 47)
                ],
                expectedLogic: [
                    { condition: 'soil_low_moisture', action: 'sprinkler_on' }
                ],
                scoring: { passAccuracy: 0.8, threeStarAccuracy: 0.95, maxDamaged: 3, maxDamagedForThreeStars: 1 }
            },
            {
                title: '9-2 ระบบเปิด-ปิดหลังคากันฝน',
                brief: 'ฝนตกให้กางหลังคาผ้าใบ ถ้าไม่ตกให้เปิดรับแสงแดด',
                intro: 'ใช้ If / Else เพื่อควบคุมหลังคาโรงเรือนเมลอน',
                lessonType: 'if_else',
                lessonTypeLabel: 'If / Else',
                theme: 'greenhouse',
                hint: 'ถ้า [ฝนตก] -> [กางหลังคาผ้าใบ] | นอกเหนือจากนี้ -> [เปิดรับแสงแดด]',
                ruleSlots: [{ type: 'if' }, { type: 'else' }],
                conditions: [
                    { id: 'rain', label: 'ฝนตก' }
                ],
                actions: [
                    { id: 'roof_close', label: 'กางหลังคาผ้าใบ', successText: 'หลังคากางออก กันฝนให้เมลอน' },
                    { id: 'roof_open', label: 'เปิดรับแสงแดด', successText: 'หลังคาเปิด แดดส่องให้เมลอนโต' }
                ],
                machines: [
                    { slot: 'a', label: 'หลังคาผ้าใบ', icon: '⛱️', actions: ['roof_close'] },
                    { slot: 'b', label: 'ช่องรับแสง', icon: '☀️', actions: ['roof_open'] }
                ],
                itemQueue: [
                    weather('A', 'rain'), weather('B', 'sun'), weather('C', 'sun'), weather('D', 'rain'),
                    weather('E', 'rain'), weather('F', 'sun'), weather('G', 'sun'), weather('H', 'rain'),
                    weather('I', 'sun'), weather('J', 'rain')
                ],
                expectedLogic: [
                    { condition: 'rain', action: 'roof_close' },
                    { condition: 'else', action: 'roof_open' }
                ],
                scoring: { passAccuracy: 0.85, threeStarAccuracy: 0.95, maxDamaged: 3, maxDamagedForThreeStars: 1 }
            },
            {
                title: '9-3 ควบคุมอุณหภูมิโรงเรือนเห็ด',
                brief: 'อุณหภูมิสูงเปิดพัดลม ต่ำเปิดหลอดไฟ และช่วงปกติปิดระบบทั้งหมด',
                intro: 'ใช้ Else If กับตัวเลขช่วงค่า เพื่อรักษาโรงเรือนเห็ดให้พอดี',
                lessonType: 'if_else_if_else',
                lessonTypeLabel: 'If / Else If / Else',
                theme: 'greenhouse',
                hint: 'ถ้า [อุณหภูมิ > 35°C] -> [เปิดพัดลม] | หรือถ้า [อุณหภูมิ < 15°C] -> [เปิดหลอดไฟ] | นอกเหนือจากนี้ -> [ปิดระบบทั้งหมด]',
                ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else' }],
                conditions: [
                    { id: 'temp_over_35', label: 'อุณหภูมิ > 35°C' },
                    { id: 'temp_under_15', label: 'อุณหภูมิ < 15°C' }
                ],
                actions: [
                    { id: 'fan_on', label: 'เปิดพัดลมระบายอากาศ', successText: 'พัดลมหมุน ลดความร้อนในโรงเรือน' },
                    { id: 'warm_light_on', label: 'เปิดหลอดไฟให้ความอบอุ่น', successText: 'หลอดไฟสีอุ่นช่วยเพิ่มอุณหภูมิ' },
                    { id: 'all_off', label: 'ปิดระบบปรับอากาศทั้งหมด', successText: 'อุณหภูมิปกติ ได้โบนัสประหยัดไฟ' }
                ],
                machines: [
                    { slot: 'a', label: 'พัดลม', icon: '🌀', actions: ['fan_on'] },
                    { slot: 'b', label: 'หลอดไฟอุ่น', icon: '💡', actions: ['warm_light_on'] },
                    { slot: 'c', label: 'ประหยัดไฟ', icon: '🔌', actions: ['all_off'] }
                ],
                itemQueue: [
                    temp('A', 38), temp('B', 24), temp('C', 12), temp('D', 36), temp('E', 18),
                    temp('F', 14), temp('G', 29), temp('H', 41), temp('I', 22), temp('J', 10)
                ],
                expectedLogic: [
                    { condition: 'temp_over_35', action: 'fan_on' },
                    { condition: 'temp_under_15', action: 'warm_light_on' },
                    { condition: 'else', action: 'all_off' }
                ],
                scoring: { passAccuracy: 0.85, threeStarAccuracy: 0.95, maxDamaged: 3, maxDamagedForThreeStars: 1 }
            }
        ]
    };

    function pot(id, moisture) {
        const low = moisture < 30;
        return {
            key: `pot_${id}`,
            label: `กระถาง ${moisture}%`,
            icon: low ? '🪴' : '🌿',
            props: { type: 'plant_pot', moisture },
            sensor: `เซ็นเซอร์ความชื้นอ่านค่า ${moisture}%`,
            expectedAction: low ? 'sprinkler_on' : 'pass',
            feedback: low
                ? `ค่าความชื้น ${moisture}% ต่ำกว่า 30% ควรเปิดสปริงเกอร์`
                : `ค่าความชื้น ${moisture}% ดีอยู่แล้ว ไม่ต้องรดน้ำเพิ่ม`
        };
    }

    function weather(id, state) {
        const raining = state === 'rain';
        return {
            key: `weather_${id}`,
            label: raining ? 'เมฆฝนเข้าโรงเรือน' : 'แดดดีไม่มีฝน',
            icon: raining ? '🌧️' : '☀️',
            props: { type: 'greenhouse', weather: raining ? 'rain' : 'sun' },
            sensor: raining ? 'เซ็นเซอร์ตรวจพบฝนกำลังตก' : 'เซ็นเซอร์ตรวจพบแดดพร้อมใช้งาน',
            expectedAction: raining ? 'roof_close' : 'roof_open',
            feedback: raining
                ? 'ฝนตกควรกางหลังคาผ้าใบกันเมลอนช้ำ'
                : 'ตอนนี้ไม่มีฝน ควรเปิดหลังคาให้เมลอนได้รับแสงแดด'
        };
    }

    function temp(id, temperature) {
        let expectedAction = 'all_off';
        let feedback = `อุณหภูมิ ${temperature}°C อยู่ช่วงปกติ ควรปิดระบบเพื่อประหยัดไฟ`;
        if (temperature > 35) {
            expectedAction = 'fan_on';
            feedback = `อุณหภูมิ ${temperature}°C สูงกว่า 35°C ควรเปิดพัดลมระบายอากาศ`;
        } else if (temperature < 15) {
            expectedAction = 'warm_light_on';
            feedback = `อุณหภูมิ ${temperature}°C ต่ำกว่า 15°C ควรเปิดหลอดไฟให้ความอบอุ่น`;
        }
        return {
            key: `temp_${id}`,
            label: `${temperature}°C`,
            icon: temperature > 35 ? '🌡️' : temperature < 15 ? '❄️' : '🍄',
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
