// Stage 10: แปลงผักหลงทาง — Smart Farm Debugger Lite
(function () {
    const config = {
        title: 'ด่าน 10: แปลงผักหลงทาง',
        subtitle: 'ช่วยฟาร์มบอทแก้ลำดับคำสั่ง ทิศทาง และคำสั่งที่หายไป',
        levels: [
            {
                levelId: '10-1',
                title: 'รดน้ำผิดที่',
                theme: 'robot_crop_path',
                sceneType: 'farm_repair',
                bugType: 'order',
                problemText: 'หุ่นยนต์รดน้ำก่อนเดินถึงแปลงผัก พื้นเปียกแต่ผักยังแห้ง',
                missionText: 'ดูอาการ แล้วซ่อมลำดับคำสั่งให้รดน้ำหลังถึงแปลงผัก',
                simulation: {
                    type: 'robot_path',
                    broken: {
                        caption: 'ฟาร์มบอทรดน้ำลงพื้นว่างก่อนถึงแปลงผัก',
                        effect: '💧'
                    },
                    fixed: {
                        caption: 'ฟาร์มบอทเดินถึงแปลงผักแล้วค่อยรดน้ำ พืชโตขึ้น',
                        effect: '💧'
                    }
                },
                objects: [
                    { id: 'robot', label: 'ฟาร์มบอท', fallbackIcon: '🤖', anchor: 'robot' },
                    { id: 'dry_crop', label: 'แปลงผักแห้ง', fallbackIcon: '🥬', anchor: 'cropBed3' },
                    { id: 'water_drop', label: 'น้ำตกผิดที่', fallbackIcon: '💧', anchor: 'cropBed' }
                ],
                buggyBlock: {
                    additionalBlocks: [
                        { condition: 'เริ่มงาน', action: 'รดน้ำ', type: 'if' },
                        { condition: 'หลังจากนั้น', action: 'เดินถึงแปลงผัก', type: 'else_if' }
                    ]
                },
                correctBlock: {
                    additionalBlocks: [
                        { condition: 'เริ่มงาน', action: 'เดินถึงแปลงผัก', type: 'if' },
                        { condition: 'หลังจากนั้น', action: 'รดน้ำ', type: 'else_if' }
                    ]
                },
                questionText: 'อะไรทำให้ผักยังแห้ง?',
                fixQuestionText: 'ควรจัดคำสั่งใหม่อย่างไร?',
                choices: {
                    bugTargetChoices: [
                        { id: 'order', label: 'ลำดับคำสั่ง' },
                        { id: 'direction', label: 'ทิศทางเดิน' },
                        { id: 'missing_step', label: 'คำสั่งหาย' }
                    ],
                    fixChoices: [
                        { id: 'water_first', label: 'รดน้ำก่อนเดิน' },
                        { id: 'water_after_arrive', label: 'เดินถึงแปลงแล้วรดน้ำ' },
                        { id: 'skip_water', label: 'ข้ามคำสั่งรดน้ำ' }
                    ]
                },
                answer: {
                    bugTarget: 'order',
                    fixChoice: 'water_after_arrive'
                },
                feedback: {
                    correct: 'ถูกต้อง! ต้องเดินถึงแปลงผักก่อน แล้วค่อยรดน้ำ',
                    wrongTarget: 'ยังไม่ใช่จุดนี้ ลองดูว่าหุ่นยนต์ทำอะไรก่อนถึงแปลงผัก',
                    wrongFix: 'ยังไม่ถูกนะ ถ้ารดน้ำก่อนเดิน น้ำจะตกลงพื้นว่าง',
                    afterFix: 'เมื่อสลับลำดับให้เดินถึงแปลงก่อน หุ่นยนต์จึงรดน้ำถูกจุดและผักกลับมาสดชื่น'
                },
                hints: [
                    'ผักยังแห้ง เพราะน้ำไม่ได้ตกที่แปลงผัก',
                    'สังเกตคำสั่งแรกของหุ่นยนต์',
                    'ย้ายคำสั่งรดน้ำไปหลังเดินถึงแปลงผัก'
                ]
            },
            {
                levelId: '10-2',
                title: 'เลี้ยวผิดทาง',
                theme: 'robot_crop_path',
                sceneType: 'farm_repair',
                bugType: 'direction',
                problemText: 'หุ่นยนต์เลี้ยวผิดทางแล้วชนรั้ว ไปไม่ถึงแปลงผัก',
                missionText: 'ซ่อมคำสั่งทิศทางให้ฟาร์มบอทเดินผ่านทางที่ถูก',
                simulation: {
                    type: 'robot_path',
                    broken: {
                        caption: 'ฟาร์มบอทเลี้ยวผิดและชนรั้วก่อนถึงแปลง',
                        obstacle: true,
                        effect: '!'
                    },
                    fixed: {
                        caption: 'เปลี่ยนทิศทางแล้ว ฟาร์มบอทเดินผ่านทางถูกต้อง',
                        obstacle: false,
                        effect: '✓'
                    }
                },
                objects: [
                    { id: 'robot', label: 'ฟาร์มบอท', fallbackIcon: '🤖', anchor: 'robot' },
                    { id: 'fence', label: 'รั้ว', fallbackIcon: '▥', anchor: 'fence' },
                    { id: 'crop_goal', label: 'แปลงเป้าหมาย', fallbackIcon: '🥬', anchor: 'cropBed3' }
                ],
                buggyBlock: {
                    condition: 'ถึงทางแยก',
                    action: 'เลี้ยวซ้าย',
                    type: 'if'
                },
                correctBlock: {
                    condition: 'ถึงทางแยก',
                    action: 'เลี้ยวขวา',
                    type: 'if'
                },
                questionText: 'จุดไหนทำให้หุ่นยนต์ชนรั้ว?',
                fixQuestionText: 'ควรเปลี่ยนคำสั่งเป็นอะไร?',
                choices: {
                    bugTargetChoices: [
                        { id: 'order', label: 'ลำดับคำสั่ง' },
                        { id: 'direction', label: 'ทิศทางเดิน' },
                        { id: 'missing_step', label: 'คำสั่งหาย' }
                    ],
                    fixChoices: [
                        { id: 'turn_left', label: 'เลี้ยวซ้าย' },
                        { id: 'turn_right', label: 'เลี้ยวขวา' },
                        { id: 'water_now', label: 'รดน้ำทันที' }
                    ]
                },
                answer: {
                    bugTarget: 'direction',
                    fixChoice: 'turn_right'
                },
                feedback: {
                    correct: 'ถูกต้อง! ทางนี้ต้องเลี้ยวขวา หุ่นยนต์จึงไม่ชนรั้ว',
                    wrongTarget: 'ลองดูทิศทางตอนถึงทางแยก หุ่นยนต์ไม่ได้ขาดคำสั่ง',
                    wrongFix: 'ยังไม่ถูก ถ้าเลี้ยวซ้ายเหมือนเดิมก็ยังชนรั้ว',
                    afterFix: 'เมื่อเปลี่ยนคำสั่งเป็นเลี้ยวขวา หุ่นยนต์เดินไปถึงแปลงผักได้'
                },
                hints: [
                    'หุ่นยนต์ไปผิดทางตรงทางแยก',
                    'บั๊กนี้อยู่ที่คำสั่งทิศทาง',
                    'ลองเปลี่ยนเลี้ยวซ้ายเป็นเลี้ยวขวา'
                ]
            },
            {
                levelId: '10-3',
                title: 'รดน้ำไม่ครบ',
                theme: 'robot_crop_path',
                sceneType: 'farm_repair',
                bugType: 'missing_step',
                problemText: 'มีแปลงผัก 3 แปลง แต่หุ่นยนต์รดน้ำแค่ 2 แปลง แปลงสุดท้ายยังเหี่ยว',
                missionText: 'เพิ่มคำสั่งหรือจำนวนรอบให้รดน้ำครบทั้ง 3 แปลง',
                simulation: {
                    type: 'robot_path',
                    broken: {
                        caption: 'หุ่นยนต์หยุดหลังรดน้ำ 2 แปลง แปลงสุดท้ายยังเหี่ยว',
                        effect: '💧'
                    },
                    fixed: {
                        caption: 'ปรับจำนวนรอบเป็น 3 แล้ว ทุกแปลงได้รับน้ำครบ',
                        effect: '💧'
                    }
                },
                objects: [
                    { id: 'robot', label: 'ฟาร์มบอท', fallbackIcon: '🤖', anchor: 'robot' },
                    { id: 'crop_1', label: 'แปลง 1', fallbackIcon: '🥬', anchor: 'cropBed' },
                    { id: 'crop_2', label: 'แปลง 2', fallbackIcon: '🥬', anchor: 'cropBed2' },
                    { id: 'crop_3', label: 'แปลง 3', fallbackIcon: '🥀', anchor: 'cropBed3' }
                ],
                buggyBlock: {
                    condition: 'ทำซ้ำ 2 ครั้ง',
                    action: 'เดินไปแปลงถัดไปและรดน้ำ',
                    type: 'if'
                },
                correctBlock: {
                    condition: 'ทำซ้ำ 3 ครั้ง',
                    action: 'เดินไปแปลงถัดไปและรดน้ำ',
                    type: 'if'
                },
                questionText: 'ทำไมแปลงสุดท้ายยังเหี่ยว?',
                fixQuestionText: 'ควรแก้จำนวนรอบเป็นอะไร?',
                choices: {
                    bugTargetChoices: [
                        { id: 'order', label: 'ลำดับคำสั่ง' },
                        { id: 'direction', label: 'ทิศทางเดิน' },
                        { id: 'missing_step', label: 'จำนวนรอบไม่ครบ' }
                    ],
                    fixChoices: [
                        { id: 'repeat_1', label: 'ทำซ้ำ 1 ครั้ง' },
                        { id: 'repeat_2', label: 'ทำซ้ำ 2 ครั้ง' },
                        { id: 'repeat_3', label: 'ทำซ้ำ 3 ครั้ง' }
                    ]
                },
                answer: {
                    bugTarget: 'missing_step',
                    fixChoice: 'repeat_3'
                },
                feedback: {
                    correct: 'ถูกต้อง! มี 3 แปลง จึงต้องรดน้ำ 3 ครั้ง',
                    wrongTarget: 'ลองนับจำนวนแปลงกับจำนวนครั้งที่หุ่นยนต์รดน้ำ',
                    wrongFix: 'ยังไม่ครบนะ แปลงผักมีทั้งหมด 3 แปลง',
                    afterFix: 'เมื่อเปลี่ยนจำนวนรอบเป็น 3 หุ่นยนต์จึงรดน้ำครบทุกแปลง'
                },
                hints: [
                    'ลองนับแปลงผักทั้งหมด',
                    'หุ่นยนต์ทำซ้ำน้อยกว่าจำนวนแปลง',
                    'เปลี่ยนทำซ้ำ 2 ครั้งเป็น 3 ครั้ง'
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
