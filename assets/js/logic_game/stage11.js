// Stage 11: ซ่อมโรงเรือนอัจฉริยะ — Smart Farm Debugger Lite
(function () {
    const config = {
        title: 'ด่าน 11: โรงเรือนอัจฉริยะรวน',
        subtitle: 'ฝึกหาบั๊กขั้นสูง — ลำดับผิด ตัวเลขผิด และขาดคำสั่ง',
        levels: [
            // LEVEL 11-1
            {
                levelId: '11-1',
                title: 'ฝนตกแต่สปริงเกอร์ยังเปิด',
                theme: 'greenhouse_repair',
                sceneType: 'farm_repair',
                bugType: 'condition_order',
                problemText: 'ฝนตกแล้ว แต่สปริงเกอร์ยังเปิด แปลงผักน้ำท่วม',
                missionText: 'ซ่อมลำดับเงื่อนไขให้ปิดสปริงเกอร์เมื่อฝนตก',
                simulation: {
                    type: 'greenhouse_sensor',
                    broken: {
                        caption: 'ฝนตกพร้อมสปริงเกอร์เปิด น้ำเริ่มท่วมแปลง',
                        weather: '🌧',
                        sprinkler: '💦',
                        fan: '◌',
                        panel: '!'
                    },
                    fixed: {
                        caption: 'ระบบตรวจฝนก่อน สปริงเกอร์จึงปิดทันที',
                        weather: '🌧',
                        sprinkler: 'ปิด',
                        fan: '◌',
                        panel: '✓'
                    }
                },
                objects: [
                    {
                        id: 'rain_cloud',
                        label: 'เมฆฝน',
                        fallbackIcon: '🌧️',
                        asset: {
                            key: 'rain_cloud',
                            path: '../assets/img/debug/weather/rain_cloud.png',
                            width: 96, height: 96,
                            description: 'เมฆฝนตกหนัก'
                        },
                        anchor: 'rain'
                    },
                    {
                        id: 'sprinkler',
                        label: 'สปริงเกอร์',
                        fallbackIcon: '💦',
                        asset: {
                            key: 'sprinkler',
                            path: '../assets/img/debug/machine/sprinkler.png',
                            width: 96, height: 96,
                            description: 'สปริงเกอร์รดน้ำอัตโนมัติ'
                        },
                        anchor: 'sprinkler'
                    },
                    {
                        id: 'flooded_crop',
                        label: 'แปลงผักน้ำท่วม',
                        fallbackIcon: '🥬',
                        asset: {
                            key: 'flooded_crop',
                            path: '../assets/img/debug/vegetable/flooded_crop.png',
                            width: 96, height: 96,
                            description: 'แปลงผักที่ถูกน้ำท่วม'
                        },
                        anchor: 'cropBed'
                    }
                ],
                additionalBlocks: [
                    { condition: 'ดินแห้ง', action: 'เปิดสปริงเกอร์', type: 'if' },
                    { condition: 'ฝนตก', action: 'ปิดสปริงเกอร์', type: 'else_if' }
                ],
                correctBlock: {
                    additionalBlocks: [
                        { condition: 'ฝนตก', action: 'ปิดสปริงเกอร์', type: 'if' },
                        { condition: 'ดินแห้ง', action: 'เปิดสปริงเกอร์', type: 'else_if' }
                    ]
                },
                questionText: 'ควรดูอะไรก่อน?',
                choices: {
                    bugTargetChoices: [
                        { id: 'order', label: 'ลำดับเงื่อนไข' },
                        { id: 'action', label: 'คำสั่ง' }
                    ],
                    fixChoices: [
                        { id: 'dry_first', label: 'ดูดินแห้งก่อน' },
                        { id: 'rain_first', label: 'ดูฝนตกก่อน' }
                    ]
                },
                answer: {
                    bugTarget: 'order',
                    fixChoice: 'rain_first'
                },
                feedback: {
                    correct: 'ถูกต้อง! ถ้าฝนตก ต้องหยุดรดน้ำก่อน ไม่อย่างนั้นน้ำจะท่วมแปลง',
                    wrongTarget: 'ลองดูอีกครั้ง คำสั่งไม่ได้ผิด แต่ลำดับการเช็คอาจไม่ถูก',
                    wrongFix: 'ยังไม่ถูก ถ้าดูดินแห้งก่อน ฝนตกก็จะไม่ถูกเช็ค',
                    afterFix: 'ระบบเดิมเช็คดินแห้งก่อน ทำให้เปิดสปริงเกอร์ทั้งที่ฝนตก พอสลับลำดับให้ดูฝนก่อน ก็จะปิดสปริงเกอร์ได้ทัน'
                },
                hints: [
                    'ลองดูว่าระบบเช็คอะไรก่อน',
                    'ฝนตกแล้วน้ำท่วม ควรเช็คฝนก่อน',
                    'เปลี่ยนลำดับให้ดูฝนตกก่อนดินแห้ง'
                ]
            },
            // LEVEL 11-2
            {
                levelId: '11-2',
                title: 'โรงเรือนร้อนแต่พัดลมไม่เปิด',
                theme: 'greenhouse_repair',
                sceneType: 'farm_repair',
                bugType: 'numeric_condition',
                problemText: 'อุณหภูมิ 38°C แต่พัดลมไม่เปิด',
                missionText: 'แก้ตัวเลขเงื่อนไขให้พัดลมเปิดได้ทัน',
                simulation: {
                    type: 'greenhouse_sensor',
                    broken: {
                        caption: 'อุณหภูมิ 38°C แต่พัดลมยังนิ่ง ต้นไม้เริ่มเหี่ยว',
                        weather: '🌡',
                        sprinkler: 'ปิด',
                        fan: '◌',
                        panel: '38°'
                    },
                    fixed: {
                        caption: 'ตั้งเงื่อนไขใหม่ พัดลมเปิดเมื่่ออุณหภูมิเกิน 35°C',
                        weather: '🌡',
                        sprinkler: 'ปิด',
                        fan: '🌀',
                        panel: '✓'
                    }
                },
                objects: [
                    {
                        id: 'thermometer',
                        label: 'เทอร์โมมิเตอร์',
                        fallbackIcon: '🌡️',
                        asset: {
                            key: 'thermometer',
                            path: '../assets/img/debug/sensor/thermometer.png',
                            width: 64, height: 96,
                            description: 'เทอร์โมมิเตอร์วัดอุณหภูมิ'
                        },
                        anchor: 'thermometer'
                    },
                    {
                        id: 'fan',
                        label: 'พัดลมระบายอากาศ',
                        fallbackIcon: '🌀',
                        asset: {
                            key: 'fan',
                            path: '../assets/img/debug/machine/fan.png',
                            width: 96, height: 96,
                            description: 'พัดลมระบายอากาศในโรงเรือน'
                        },
                        anchor: 'fan'
                    },
                    {
                        id: 'greenhouse',
                        label: 'โรงเรือน',
                        fallbackIcon: '🏠',
                        asset: {
                            key: 'greenhouse',
                            path: '../assets/img/debug/building/greenhouse.png',
                            width: 128, height: 128,
                            description: 'โรงเรือนปลูกผัก'
                        },
                        anchor: 'greenhouse'
                    }
                ],
                buggyBlock: {
                    condition: 'อุณหภูมิสูงกว่า 50°C',
                    action: 'เปิดพัดลม',
                    type: 'if'
                },
                correctBlock: {
                    condition: 'อุณหภูมิสูงกว่า 35°C',
                    action: 'เปิดพัดลม',
                    type: 'if'
                },
                choices: {
                    bugTargetChoices: [
                        { id: 'condition', label: 'เงื่อนไข (ตัวเลข)' },
                        { id: 'action', label: 'คำสั่ง' }
                    ],
                    fixChoices: [
                        { id: '50', label: 'มากกว่า 50°C' },
                        { id: '35', label: 'มากกว่า 35°C' }
                    ]
                },
                answer: {
                    bugTarget: 'condition',
                    fixChoice: '35'
                },
                feedback: {
                    correct: 'ถูกต้อง! 38°C ร้อนเกินแล้ว ระบบควรเปิดพัดลมตั้งแต่เกิน 35°C',
                    wrongTarget: 'ลองดูอีกครั้ง คำสั่งเปิดพัดลมถูกแล้ว แต่ตัวเลขเงื่อนไขอาจสูงเกินไป',
                    wrongFix: 'ยังไม่ถูก 50°C สูงเกินไป ผักจะเหี่ยวก่อนถึง 50°C',
                    afterFix: 'เงื่อนไขเดิมตั้งไว้ 50°C ซึ่งสูงเกินไป ผักทนไม่ได้ขนาดนั้น พอเปลี่ยนเป็น 35°C พัดลมก็เปิดทันเวลา'
                },
                hints: [
                    'อุณหภูมิ 38°C เกินเท่าไหร่?',
                    'ตัวเลขในเงื่อนไขสูงเกินจริง',
                    'เปลี่ยนจาก 50°C เป็น 35°C'
                ]
            },
            // LEVEL 11-3
            {
                levelId: '11-3',
                title: 'อากาศปกติแต่ระบบค้าง',
                theme: 'greenhouse_repair',
                sceneType: 'farm_repair',
                bugType: 'missing_else',
                problemText: 'อุณหภูมิ 25°C ระบบไม่รู้ว่าจะทำอะไร',
                missionText: 'เพิ่มคำสั่งสำหรับกรณีที่อากาศปกติ',
                simulation: {
                    type: 'greenhouse_sensor',
                    broken: {
                        caption: 'อากาศปกติ แต่แผงควบคุมขึ้นเครื่องหมายคำถาม',
                        weather: '25°',
                        sprinkler: 'ปิด',
                        fan: '◌',
                        panel: '?'
                    },
                    fixed: {
                        caption: 'เพิ่มกรณีอื่นแล้ว ระบบปิดอุปกรณ์และแสดงไฟเขียว',
                        weather: '25°',
                        sprinkler: 'ปิด',
                        fan: '◌',
                        panel: '✓'
                    }
                },
                objects: [
                    {
                        id: 'thermometer',
                        label: 'เทอร์โมมิเตอร์',
                        fallbackIcon: '🌡️',
                        asset: {
                            key: 'thermometer',
                            path: '../assets/img/debug/sensor/thermometer.png',
                            width: 64, height: 96,
                            description: 'เทอร์โมมิเตอร์วัดอุณหภูมิ'
                        },
                        anchor: 'thermometer'
                    },
                    {
                        id: 'control_panel',
                        label: 'แผงควบคุม',
                        fallbackIcon: '🎛️',
                        asset: {
                            key: 'control_panel',
                            path: '../assets/img/debug/machine/control_panel.png',
                            width: 96, height: 96,
                            description: 'แผงควบคุมระบบโรงเรือน'
                        },
                        anchor: 'controlPanel'
                    },
                    {
                        id: 'greenhouse',
                        label: 'โรงเรือน',
                        fallbackIcon: '🏠',
                        asset: {
                            key: 'greenhouse',
                            path: '../assets/img/debug/building/greenhouse.png',
                            width: 128, height: 128,
                            description: 'โรงเรือนปลูกผัก'
                        },
                        anchor: 'greenhouse'
                    }
                ],
                additionalBlocks: [
                    { condition: 'ร้อนมาก', action: 'เปิดพัดลม', type: 'if' },
                    { condition: 'หนาวมาก', action: 'เปิดหลอดไฟ', type: 'else_if' }
                ],
                missingBlock: {
                    condition: 'กรณีอื่น',
                    action: 'ปิดระบบ',
                    type: 'else'
                },
                choices: {
                    bugTargetChoices: [
                        { id: 'missing', label: 'ขาดคำสั่ง' },
                        { id: 'condition', label: 'เงื่อนไขผิด' },
                        { id: 'action', label: 'คำสั่งผิด' }
                    ],
                    fixChoices: [
                        { id: 'fan', label: 'เปิดพัดลม' },
                        { id: 'light', label: 'เปิดหลอดไฟ' },
                        { id: 'shutdown', label: 'ปิดระบบ' }
                    ]
                },
                answer: {
                    bugTarget: 'missing',
                    fixChoice: 'shutdown'
                },
                feedback: {
                    correct: 'ถูกต้อง! อากาศพอดีแล้ว ไม่ต้องเปิดอะไรเพิ่ม ให้ปิดระบบเพื่อประหยัดไฟ',
                    wrongTarget: 'ลองดูอีกครั้ง เงื่อนไขและคำสั่งที่มีอยู่ถูกแล้ว แต่ดูเหมือนจะขาดอะไรบางอย่าง',
                    wrongFix: 'ยังไม่ถูก อากาศไม่ร้อนและไม่หนาว ไม่ต้องเปิดอะไรเพิ่ม',
                    afterFix: 'ระบบเดิมมีแค่กรณีร้อนและหนาว แต่ไม่มีกรณีปกติ พออากาศ 25°C ระบบไม่รู้จะทำอะไร พอเพิ่ม else ปิดระบบ ก็ทำงานครบทุกกรณี'
                },
                hints: [
                    'ถ้าอากาศไม่ร้อนและไม่หนาว ระบบควรทำอะไร?',
                    'ดูเหมือนจะขาดคำสั่งสำหรับกรณีปกติ',
                    'ถ้าอากาศพอดี ให้ปิดระบบเพื่อประหยัดไฟ'
                ]
            }
        ]
    };

    function boot() {
        window.FarmMissions.smartFarmDebuggerLite(config);
    }

    if (window.FarmMissions?.smartFarmDebuggerLite) {
        boot();
    } else {
        const script = document.createElement('script');
        script.src = '../assets/js/logic_game/smart_farm_debugger_lite.js';
        script.onload = boot;
        document.head.appendChild(script);
    }
})();
