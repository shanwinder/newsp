// Stage 10: ซ่อมระบบผักสวนครัว — Smart Farm Debugger Lite
(function () {
    const config = {
        title: 'ด่าน 10: ซ่อมระบบผักสวนครัว',
        subtitle: 'ฝึกหาบั๊กพื้นฐาน — คำสั่งผิดและเงื่อนไขผิด',
        levels: [
            // LEVEL 10-1
            {
                levelId: '10-1',
                title: 'แครอทเปื้อนโคลนไม่ถูกล้าง',
                theme: 'vegetable_repair',
                sceneType: 'farm_repair',
                problemText: 'แครอทเปื้อนโคลนหลุดผ่านไป',
                missionText: 'ช่วยซ่อมระบบให้แครอทเปื้อนโคลนไปล้างน้ำ',
                objects: [
                    {
                        id: 'dirty_carrot',
                        label: 'แครอทเปื้อนโคลน',
                        fallbackIcon: '🥕',
                        asset: {
                            key: 'dirty_carrot',
                            path: '../assets/img/debug/vegetable/dirty_carrot.png',
                            width: 96, height: 96,
                            description: 'แครอทเปื้อนโคลนสำหรับด่านซ่อมเครื่องล้าง'
                        },
                        anchor: 'cropBed'
                    },
                    {
                        id: 'washer',
                        label: 'เครื่องล้างผัก',
                        fallbackIcon: '🚿',
                        asset: {
                            key: 'washer',
                            path: '../assets/img/debug/machine/washer.png',
                            width: 128, height: 128,
                            description: 'เครื่องล้างผักในฟาร์ม'
                        },
                        anchor: 'washer'
                    },
                    {
                        id: 'warning_sign',
                        label: 'ป้ายเตือน',
                        fallbackIcon: '⚠️',
                        asset: {
                            key: 'warning_sign',
                            path: '../assets/img/debug/ui/warning_sign.png',
                            width: 64, height: 64,
                            description: 'ป้ายเตือนแสดงจุดที่มีปัญหา'
                        },
                        anchor: 'warningSign'
                    }
                ],
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
                    correct: 'ถูกต้อง! แครอทเปื้อนโคลนต้องเข้าเครื่องล้าง',
                    wrongTarget: 'ยังไม่ใช่จุดนี้ ลองดูว่าระบบสั่งให้แครอทไปไหน',
                    wrongFix: 'ยังไม่ถูกนะ แครอทเลอะต้องถูกล้างก่อน',
                    afterFix: 'แครอทเลอะต้องไปล้าง แต่ระบบปล่อยผ่านไป เมื่อเปลี่ยนเป็น "ส่งเข้าเครื่องล้าง" แครอทเปื้อนโคลนก็ถูกล้างแล้ว'
                },
                hints: [
                    'ลองดูว่าแครอทเปื้อนโคลนถูกส่งไปไหน',
                    'บั๊กนี้น่าจะอยู่ที่คำสั่ง ไม่ใช่เงื่อนไข',
                    'แครอทเปื้อนโคลนควรถูกส่งเข้าเครื่องล้าง'
                ]
            },
            // LEVEL 10-2
            {
                levelId: '10-2',
                title: 'ผักกาดมีหนอนหลุดผ่าน',
                theme: 'vegetable_repair',
                sceneType: 'farm_repair',
                problemText: 'ผักกาดมีหนอนหลุดผ่านโต๊ะตรวจ',
                missionText: 'ซ่อมระบบให้จับผักกาดที่มีหนอนได้ถูก',
                objects: [
                    {
                        id: 'cabbage_worm',
                        label: 'ผักกาดมีหนอน',
                        fallbackIcon: '🥬',
                        asset: {
                            key: 'cabbage_worm',
                            path: '../assets/img/debug/vegetable/cabbage_worm.png',
                            width: 96, height: 96,
                            description: 'ผักกาดที่มีหนอนเจาะ'
                        },
                        anchor: 'cropBed'
                    },
                    {
                        id: 'inspection_table',
                        label: 'โต๊ะตรวจศัตรูพืช',
                        fallbackIcon: '🔬',
                        asset: {
                            key: 'inspection_table',
                            path: '../assets/img/debug/machine/inspection_table.png',
                            width: 128, height: 128,
                            description: 'โต๊ะตรวจหาศัตรูพืช'
                        },
                        anchor: 'inspectionTable'
                    }
                ],
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
                    correct: 'ถูกต้อง! ต้องจับผักที่มีหนอน ไม่ใช่ผักใบแหว่งทุกใบ',
                    wrongTarget: 'ลองดูอีกครั้ง คำสั่งส่งไปโต๊ะตรวจถูกแล้ว แต่เงื่อนไขเลือกผักผิดชนิด',
                    wrongFix: 'ยังไม่ถูก ต้องจับผักที่มีหนอนจริง ๆ ไม่ใช่ใบแหว่งอย่างเดียว',
                    afterFix: 'ต้องจับผักที่มีหนอน ไม่ใช่ผักใบแหว่งทุกใบ เพราะใบแหว่งอาจไม่มีหนอนก็ได้'
                },
                hints: [
                    'ลองดูว่าผักกาดชนิดไหนหลุดผ่านไป',
                    'บั๊กนี้อยู่ที่เงื่อนไข ไม่ใช่คำสั่ง',
                    'ควรจับ "ผักกาดมีหนอน" ไม่ใช่ "ผักกาดใบแหว่ง"'
                ]
            },
            // LEVEL 10-3
            {
                levelId: '10-3',
                title: 'แครอทมีตำหนิถูกส่งไปล้าง',
                theme: 'vegetable_repair',
                sceneType: 'farm_repair',
                problemText: 'แครอทมีตำหนิถูกส่งเข้าเครื่องล้าง ทั้งที่ไม่ได้เปื้อนโคลน',
                missionText: 'ซ่อมเงื่อนไขให้ล้างเฉพาะแครอทที่เปื้อนโคลน',
                objects: [
                    {
                        id: 'damaged_carrot',
                        label: 'แครอทมีตำหนิ',
                        fallbackIcon: '🥕',
                        asset: {
                            key: 'damaged_carrot',
                            path: '../assets/img/debug/vegetable/damaged_carrot.png',
                            width: 96, height: 96,
                            description: 'แครอทที่มีตำหนิแต่ไม่เปื้อนโคลน'
                        },
                        anchor: 'cropBed'
                    },
                    {
                        id: 'washer',
                        label: 'เครื่องล้างผัก',
                        fallbackIcon: '🚿',
                        asset: {
                            key: 'washer',
                            path: '../assets/img/debug/machine/washer.png',
                            width: 128, height: 128,
                            description: 'เครื่องล้างผักในฟาร์ม'
                        },
                        anchor: 'washer'
                    }
                ],
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
                    correct: 'ถูกต้อง! ด่านนี้ล้างเฉพาะแครอทเปื้อนโคลนเท่านั้น',
                    wrongTarget: 'ลองดูอีกครั้ง คำสั่งล้างถูกแล้ว แต่เงื่อนไขจับแครอทผิดชนิด',
                    wrongFix: 'ยังไม่ถูก มีตำหนิไม่ใช่เปื้อนโคลน ล้างเฉพาะแครอทเปื้อนโคลนนะ',
                    afterFix: 'มีตำหนิไม่ใช่เปื้อนโคลน ด่านนี้ล้างเฉพาะแครอทเปื้อนโคลนเท่านั้น ถ้าไม่เข้าเงื่อนไข ให้ปล่อยผ่าน'
                },
                hints: [
                    'ลองดูว่าแครอทชนิดไหนถูกส่งไปล้างผิด',
                    'บั๊กนี้อยู่ที่เงื่อนไข ไม่ใช่คำสั่ง',
                    'ควรล้างเฉพาะ "แครอทเปื้อนโคลน" ไม่ใช่ "แครอทมีตำหนิ"'
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
