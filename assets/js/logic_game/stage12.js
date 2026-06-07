// Stage 12: ศูนย์ซ่อมฟาร์มฉุกเฉิน — Smart Farm Debugger Lite
(function () {
    const config = {
        title: 'ด่าน 12: ศูนย์ซ่อมฟาร์มฉุกเฉิน',
        subtitle: 'ฝึกซ่อมฟาร์มจากแผนที่ — เลือกจุดที่เสียแล้วซ่อมให้ถูก',
        levels: [
            // LEVEL 12-1
            {
                levelId: '12-1',
                title: 'ไฟแดงที่แปลงผัก',
                theme: 'farm_emergency',
                sceneType: 'farm_map',
                problemText: 'มีไฟแดง 2 จุดในฟาร์ม แต่เสียจริงแค่ 1 จุด',
                missionText: 'แตะจุดที่เสียจริง แล้วซ่อมให้ถูก',
                mapPoints: [
                    {
                        id: 'veggie_washer',
                        label: 'เครื่องล้างผัก',
                        icon: '🚿',
                        x: 30,
                        y: 50,
                        isBroken: true,
                        isDecoy: false,
                        subLevel: {
                            problemText: 'แครอทเปื้อนโคลนหลุดผ่านเครื่องล้าง',
                            buggyBlock: {
                                condition: 'แครอทเปื้อนโคลน',
                                action: 'ปล่อยผ่าน',
                                type: 'if'
                            },
                            correctBlock: {
                                condition: 'แครอทเปื้อนโคลน',
                                action: 'ส่งเข้าเครื่องล้าง',
                                type: 'if'
                            },
                            choices: {
                                bugTargetChoices: [
                                    { id: 'condition', label: 'เงื่อนไข' },
                                    { id: 'action', label: 'คำสั่ง' }
                                ],
                                fixChoices: [
                                    { id: 'pass', label: 'ปล่อยผ่าน' },
                                    { id: 'wash', label: 'ส่งเข้าเครื่องล้าง' }
                                ]
                            },
                            answer: {
                                bugTarget: 'action',
                                fixChoice: 'wash'
                            },
                            feedback: {
                                correct: 'ซ่อมสำเร็จ! แครอทเลอะถูกส่งเข้าเครื่องล้างแล้ว',
                                wrongTarget: 'ลองดูอีกครั้ง',
                                wrongFix: 'ยังไม่ถูก ลองเลือกใหม่'
                            },
                            hints: [
                                'ดูว่าแครอทเลอะไปไหน',
                                'บั๊กอยู่ที่คำสั่ง',
                                'ควรส่งเข้าเครื่องล้าง'
                            ]
                        }
                    },
                    {
                        id: 'noisy_washer',
                        label: 'เครื่องล้างเสียงดัง',
                        icon: '🔊',
                        x: 70,
                        y: 50,
                        isBroken: false,
                        isDecoy: true,
                        decoyMessage: 'เครื่องล้างมีเสียงดัง แต่ยังทำงานปกติ ไม่ใช่จุดที่ต้องซ่อม'
                    }
                ]
            },
            // LEVEL 12-2
            {
                levelId: '12-2',
                title: 'โรงเรือนกับแปลงผักรวนพร้อมกัน',
                theme: 'farm_emergency',
                sceneType: 'farm_map',
                problemText: 'ระบบรวน 2 จุด ทั้งโรงเรือนและแปลงผัก',
                missionText: 'แตะจุดที่มีปัญหา แล้วซ่อมทีละจุด',
                mapPoints: [
                    {
                        id: 'sprinkler_system',
                        label: 'ระบบสปริงเกอร์',
                        icon: '💦',
                        x: 25,
                        y: 45,
                        isBroken: true,
                        isDecoy: false,
                        subLevel: {
                            problemText: 'ฝนตกแล้ว แต่สปริงเกอร์ยังเปิด แปลงผักน้ำท่วม',
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
                                correct: 'ซ่อมสำเร็จ! ตอนนี้ระบบเช็คฝนตกก่อน สปริงเกอร์จะปิดทัน',
                                wrongTarget: 'ลองดูอีกครั้ง คำสั่งไม่ได้ผิด แต่ลำดับอาจไม่ถูก',
                                wrongFix: 'ยังไม่ถูก ควรดูฝนก่อนดินแห้ง'
                            },
                            hints: [
                                'ระบบเช็คอะไรก่อน?',
                                'ฝนตกแต่สปริงเกอร์ยังเปิด',
                                'สลับลำดับให้ดูฝนตกก่อน'
                            ]
                        }
                    },
                    {
                        id: 'inspection_station',
                        label: 'สถานีตรวจศัตรูพืช',
                        icon: '🔬',
                        x: 70,
                        y: 55,
                        isBroken: true,
                        isDecoy: false,
                        subLevel: {
                            problemText: 'ผักกาดมีหนอนหลุดผ่านโต๊ะตรวจ',
                            buggyBlock: {
                                condition: 'ผักกาดใบแหว่ง',
                                action: 'ส่งไปโต๊ะตรวจ',
                                type: 'if'
                            },
                            correctBlock: {
                                condition: 'ผักกาดมีหนอน',
                                action: 'ส่งไปโต๊ะตรวจ',
                                type: 'if'
                            },
                            choices: {
                                bugTargetChoices: [
                                    { id: 'condition', label: 'เงื่อนไข' },
                                    { id: 'action', label: 'คำสั่ง' }
                                ],
                                fixChoices: [
                                    { id: 'torn_leaf', label: 'ผักกาดใบแหว่ง' },
                                    { id: 'has_worm', label: 'ผักกาดมีหนอน' }
                                ]
                            },
                            answer: {
                                bugTarget: 'condition',
                                fixChoice: 'has_worm'
                            },
                            feedback: {
                                correct: 'ซ่อมสำเร็จ! ตอนนี้ระบบจับผักกาดที่มีหนอนได้ถูกแล้ว',
                                wrongTarget: 'ลองดูอีกครั้ง คำสั่งถูกแล้ว แต่เงื่อนไขจับผักผิดชนิด',
                                wrongFix: 'ยังไม่ถูก ต้องจับผักที่มีหนอน ไม่ใช่ใบแหว่ง'
                            },
                            hints: [
                                'ผักกาดชนิดไหนหลุดผ่าน?',
                                'บั๊กอยู่ที่เงื่อนไข',
                                'ควรจับ "ผักกาดมีหนอน"'
                            ]
                        }
                    }
                ]
            },
            // LEVEL 12-3
            {
                levelId: '12-3',
                title: 'ฟาร์มต้องพร้อมก่อนส่งผลผลิต',
                theme: 'farm_emergency',
                sceneType: 'farm_map',
                problemText: 'ฟาร์มมีระบบรวน 3 จุด ต้องซ่อมให้ครบก่อนส่งผลผลิต',
                missionText: 'ช่วยซ่อมฟาร์มให้พร้อมส่งผลผลิต แตะจุดที่มีปัญหา แล้วเลือกวิธีซ่อม',
                mapPoints: [
                    {
                        id: 'carrot_sorter',
                        label: 'เครื่องคัดแครอท',
                        icon: '🥕',
                        x: 20,
                        y: 40,
                        isBroken: true,
                        isDecoy: false,
                        subLevel: {
                            problemText: 'แครอทมีตำหนิถูกส่งเข้าเครื่องล้าง ทั้งที่ไม่ได้เปื้อนโคลน',
                            buggyBlock: {
                                condition: 'แครอทมีตำหนิ',
                                action: 'ส่งเข้าเครื่องล้าง',
                                type: 'if'
                            },
                            correctBlock: {
                                condition: 'แครอทเปื้อนโคลน',
                                action: 'ส่งเข้าเครื่องล้าง',
                                type: 'if'
                            },
                            choices: {
                                bugTargetChoices: [
                                    { id: 'condition', label: 'เงื่อนไข' },
                                    { id: 'action', label: 'คำสั่ง' }
                                ],
                                fixChoices: [
                                    { id: 'damaged', label: 'แครอทมีตำหนิ' },
                                    { id: 'muddy', label: 'แครอทเปื้อนโคลน' }
                                ]
                            },
                            answer: {
                                bugTarget: 'condition',
                                fixChoice: 'muddy'
                            },
                            feedback: {
                                correct: 'ซ่อมสำเร็จ! ตอนนี้ล้างเฉพาะแครอทเปื้อนโคลนแล้ว',
                                wrongTarget: 'ลองดูอีกครั้ง คำสั่งล้างถูกแล้ว แต่เงื่อนไขจับผิดชนิด',
                                wrongFix: 'ยังไม่ถูก ล้างเฉพาะแครอทเปื้อนโคลนนะ'
                            },
                            hints: [
                                'แครอทชนิดไหนถูกส่งไปล้างผิด?',
                                'บั๊กอยู่ที่เงื่อนไข',
                                'ควรล้างเฉพาะ "แครอทเปื้อนโคลน"'
                            ]
                        }
                    },
                    {
                        id: 'temp_control',
                        label: 'ระบบควบคุมอุณหภูมิ',
                        icon: '🌡️',
                        x: 50,
                        y: 30,
                        isBroken: true,
                        isDecoy: false,
                        subLevel: {
                            problemText: 'อุณหภูมิ 38°C แต่พัดลมไม่เปิด เพราะเงื่อนไขตั้งไว้สูงเกิน',
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
                                correct: 'ซ่อมสำเร็จ! พัดลมจะเปิดเมื่ออุณหภูมิเกิน 35°C แล้ว',
                                wrongTarget: 'ลองดูอีกครั้ง คำสั่งเปิดพัดลมถูกแล้ว แต่ตัวเลขอาจผิด',
                                wrongFix: 'ยังไม่ถูก 50°C สูงเกินไป ผักจะเหี่ยวก่อน'
                            },
                            hints: [
                                '38°C ร้อนเกินเท่าไหร่?',
                                'ตัวเลขในเงื่อนไขสูงเกินจริง',
                                'เปลี่ยนจาก 50°C เป็น 35°C'
                            ]
                        }
                    },
                    {
                        id: 'climate_system',
                        label: 'ระบบปรับอากาศ',
                        icon: '🎛️',
                        x: 80,
                        y: 60,
                        isBroken: true,
                        isDecoy: false,
                        subLevel: {
                            problemText: 'อุณหภูมิ 25°C ระบบไม่รู้ว่าจะทำอะไร เพราะไม่มีคำสั่งสำหรับกรณีปกติ',
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
                                correct: 'ซ่อมสำเร็จ! ตอนนี้ระบบจะปิดเมื่ออากาศปกติ ประหยัดไฟ',
                                wrongTarget: 'ลองดูอีกครั้ง เงื่อนไขและคำสั่งที่มีอยู่ถูกแล้ว แต่ดูเหมือนจะขาดอะไร',
                                wrongFix: 'ยังไม่ถูก อากาศไม่ร้อนไม่หนาว ไม่ต้องเปิดอะไรเพิ่ม'
                            },
                            hints: [
                                'ถ้าอากาศไม่ร้อนไม่หนาว ระบบควรทำอะไร?',
                                'ดูเหมือนจะขาดคำสั่งสำหรับกรณีปกติ',
                                'อากาศพอดี ให้ปิดระบบเพื่อประหยัดไฟ'
                            ]
                        }
                    }
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
