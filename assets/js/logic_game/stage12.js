// Stage 12: เครื่องคัดผลไม้เจอบั๊ก — Smart Farm Debugger Lite
(function () {
    const config = {
        title: 'ด่าน 12: เครื่องคัดผลไม้เจอบั๊ก',
        subtitle: 'ซ่อมจำนวนรอบ เงื่อนไขคัดแยก และจุดเสียหลายจุดก่อนส่งตลาด',
        levels: [
            {
                levelId: '12-1',
                title: 'เก็บมะม่วงไม่ครบ',
                theme: 'fruit_sorting',
                sceneType: 'farm_repair',
                bugType: 'repeat_count',
                problemText: 'ใบสั่งต้องการมะม่วง 3 ลูก แต่เครื่องหยิบลงลังแค่ 2 ลูก',
                missionText: 'ซ่อมจำนวนรอบให้เครื่องหยิบมะม่วงครบตามใบสั่ง',
                simulation: {
                    type: 'conveyor_sorting',
                    broken: {
                        caption: 'ลังมีมะม่วงแค่ 2 ลูก ยังไม่ครบใบสั่ง',
                        fruitOne: '🥭',
                        fruitTwo: '🥭',
                        fruitThree: ' ',
                        crate: '2/3'
                    },
                    fixed: {
                        caption: 'เปลี่ยนทำซ้ำเป็น 3 ครั้ง ลังจึงมีมะม่วงครบ',
                        fruitOne: '🥭',
                        fruitTwo: '🥭',
                        fruitThree: '🥭',
                        crate: '3/3'
                    }
                },
                objects: [
                    { id: 'conveyor', label: 'สายพาน', fallbackIcon: '▰', anchor: 'conveyor' },
                    { id: 'mango_crate', label: 'ลังมะม่วง', fallbackIcon: '▤', anchor: 'crate' },
                    { id: 'status_light', label: 'ไฟสถานะ', fallbackIcon: '🔴', anchor: 'statusLight' }
                ],
                buggyBlock: {
                    condition: 'ทำซ้ำ 2 ครั้ง',
                    action: 'หยิบมะม่วงลงลัง',
                    type: 'if'
                },
                correctBlock: {
                    condition: 'ทำซ้ำ 3 ครั้ง',
                    action: 'หยิบมะม่วงลงลัง',
                    type: 'if'
                },
                questionText: 'จุดไหนทำให้มะม่วงไม่ครบ?',
                fixQuestionText: 'ควรเปลี่ยนจำนวนรอบเป็นอะไร?',
                choices: {
                    bugTargetChoices: [
                        { id: 'repeat_count', label: 'จำนวนรอบ' },
                        { id: 'broad_condition', label: 'เงื่อนไขคัดสี' },
                        { id: 'multi_bug', label: 'หลายจุด' }
                    ],
                    fixChoices: [
                        { id: 'repeat_2', label: 'ทำซ้ำ 2 ครั้ง' },
                        { id: 'repeat_3', label: 'ทำซ้ำ 3 ครั้ง' },
                        { id: 'sort_red', label: 'คัดเฉพาะสีแดง' }
                    ]
                },
                answer: {
                    bugTarget: 'repeat_count',
                    fixChoice: 'repeat_3'
                },
                feedback: {
                    correct: 'ถูกต้อง! ใบสั่งต้องการ 3 ลูก จึงต้องทำซ้ำ 3 ครั้ง',
                    wrongTarget: 'ลองนับจำนวนที่เครื่องหยิบกับจำนวนในใบสั่ง',
                    wrongFix: 'ยังไม่ครบ ใบสั่งต้องการมะม่วง 3 ลูก',
                    afterFix: 'เมื่อเปลี่ยนจำนวนรอบเป็น 3 เครื่องจึงหยิบมะม่วงครบตามใบสั่ง'
                },
                hints: [
                    'ใบสั่งต้องการกี่ลูก?',
                    'เครื่องหยิบมะม่วงน้อยกว่าที่ต้องการ',
                    'เปลี่ยนทำซ้ำ 2 ครั้งเป็น 3 ครั้ง'
                ]
            },
            {
                levelId: '12-2',
                title: 'คัดผลไม้ผิดสี',
                theme: 'fruit_sorting',
                sceneType: 'farm_repair',
                bugType: 'broad_condition',
                problemText: 'เครื่องส่งมะเขือเทศสีเขียวเข้าลังเดียวกับสีแดง',
                missionText: 'ซ่อมเงื่อนไขให้รับเฉพาะผลไม้สีแดงเข้าลัง',
                simulation: {
                    type: 'conveyor_sorting',
                    broken: {
                        caption: 'สีเขียวหลุดเข้าลังเดียวกับสีแดง เพราะเงื่อนไขกว้างเกินไป',
                        fruitOne: '🍅',
                        fruitTwo: '🟢',
                        fruitThree: '🍅',
                        crate: 'ปน'
                    },
                    fixed: {
                        caption: 'ตรวจสีแดงเท่านั้น สีเขียวจึงถูกปล่อยผ่าน',
                        fruitOne: '🍅',
                        fruitTwo: '🟢',
                        fruitThree: '🍅',
                        crate: 'แดง'
                    }
                },
                objects: [
                    { id: 'scanner', label: 'เครื่องสแกนสี', fallbackIcon: '🔎', anchor: 'conveyor' },
                    { id: 'red_crate', label: 'ลังสีแดง', fallbackIcon: '▤', anchor: 'crate' },
                    { id: 'status_light', label: 'ไฟสถานะ', fallbackIcon: '🔴', anchor: 'statusLight' }
                ],
                buggyBlock: {
                    condition: 'ถ้าเป็นมะเขือเทศ',
                    action: 'ใส่ลังสีแดง',
                    type: 'if'
                },
                correctBlock: {
                    condition: 'ถ้าเป็นมะเขือเทศสีแดง',
                    action: 'ใส่ลังสีแดง',
                    type: 'if'
                },
                questionText: 'ทำไมสีเขียวถึงเข้าลังสีแดง?',
                fixQuestionText: 'ควรเปลี่ยนเงื่อนไขเป็นอะไร?',
                choices: {
                    bugTargetChoices: [
                        { id: 'repeat_count', label: 'จำนวนรอบ' },
                        { id: 'broad_condition', label: 'เงื่อนไขกว้างเกินไป' },
                        { id: 'multi_bug', label: 'หลายจุด' }
                    ],
                    fixChoices: [
                        { id: 'any_tomato', label: 'ถ้าเป็นมะเขือเทศ' },
                        { id: 'red_tomato', label: 'ถ้าเป็นมะเขือเทศสีแดง' },
                        { id: 'green_tomato', label: 'ถ้าเป็นมะเขือเทศสีเขียว' }
                    ]
                },
                answer: {
                    bugTarget: 'broad_condition',
                    fixChoice: 'red_tomato'
                },
                feedback: {
                    correct: 'ถูกต้อง! ต้องตรวจสีแดงก่อนใส่ลังสีแดง',
                    wrongTarget: 'ลองดูว่าเงื่อนไขแยกสีชัดพอหรือยัง',
                    wrongFix: 'ยังไม่ถูก ถ้าไม่ระบุสีแดง สีเขียวก็ยังเข้าลังได้',
                    afterFix: 'เมื่อเพิ่มคำว่าสีแดงในเงื่อนไข เครื่องจะส่งเฉพาะสีแดงเข้าลัง ส่วนสีเขียวปล่อยผ่าน'
                },
                hints: [
                    'ผลไม้ที่เข้าผิดต่างจากผลไม้ที่ถูกตรงไหน?',
                    'เงื่อนไขเดิมกว้างเกินไป',
                    'ระบุให้ชัดว่าเป็นมะเขือเทศสีแดง'
                ]
            },
            {
                levelId: '12-3',
                title: 'ส่งผลผลิตก่อนระบบพร้อม',
                theme: 'fruit_sorting_map',
                sceneType: 'farm_map',
                bugType: 'multi_bug',
                problemText: 'ระบบคัดผลไม้มีบั๊ก 3 จุด ต้องซ่อมครบก่อนรถส่งผลผลิตออกจากฟาร์ม',
                missionText: 'แตะจุดไฟแดง ซ่อมทีละจุด และระวังจุดหลอกที่ยังทำงานปกติ',
                mapPoints: [
                    {
                        id: 'mango_counter',
                        label: 'ตัวนับมะม่วง',
                        icon: '🥭',
                        x: 22,
                        y: 46,
                        isBroken: true,
                        isDecoy: false,
                        subLevel: {
                            title: 'ตัวนับมะม่วงหยุดเร็ว',
                            bugType: 'repeat_count',
                            problemText: 'ใบสั่งต้องการมะม่วง 3 ลูก แต่ตัวนับหยุดที่ 2',
                            missionText: 'ซ่อมจำนวนรอบให้ครบ 3',
                            simulation: {
                                type: 'conveyor_sorting',
                                broken: { caption: 'ตัวนับหยุดที่ 2/3', fruitOne: '🥭', fruitTwo: '🥭', fruitThree: ' ', crate: '2/3' },
                                fixed: { caption: 'ตัวนับครบ 3/3', fruitOne: '🥭', fruitTwo: '🥭', fruitThree: '🥭', crate: '3/3' }
                            },
                            buggyBlock: { condition: 'ทำซ้ำ 2 ครั้ง', action: 'หยิบมะม่วงลงลัง', type: 'if' },
                            correctBlock: { condition: 'ทำซ้ำ 3 ครั้ง', action: 'หยิบมะม่วงลงลัง', type: 'if' },
                            choices: {
                                bugTargetChoices: [
                                    { id: 'repeat_count', label: 'จำนวนรอบ' },
                                    { id: 'broad_condition', label: 'เงื่อนไขคัดสี' }
                                ],
                                fixChoices: [
                                    { id: 'repeat_2', label: 'ทำซ้ำ 2 ครั้ง' },
                                    { id: 'repeat_3', label: 'ทำซ้ำ 3 ครั้ง' }
                                ]
                            },
                            answer: { bugTarget: 'repeat_count', fixChoice: 'repeat_3' },
                            feedback: {
                                correct: 'ซ่อมสำเร็จ! มะม่วงครบ 3 ลูกแล้ว',
                                wrongTarget: 'ลองนับจำนวนรอบ',
                                wrongFix: 'ยังไม่ครบ ต้องเป็น 3 ครั้ง'
                            },
                            hints: ['ดูตัวเลขในคำสั่งทำซ้ำ', 'ใบสั่งต้องการ 3 ลูก', 'แก้เป็นทำซ้ำ 3 ครั้ง']
                        }
                    },
                    {
                        id: 'color_scanner',
                        label: 'สแกนสีผลไม้',
                        icon: '🔎',
                        x: 50,
                        y: 38,
                        isBroken: true,
                        isDecoy: false,
                        subLevel: {
                            title: 'สแกนสีไม่ละเอียด',
                            bugType: 'broad_condition',
                            problemText: 'สีเขียวหลุดเข้าลังสีแดง',
                            missionText: 'ซ่อมเงื่อนไขให้ตรวจสีแดงเท่านั้น',
                            simulation: {
                                type: 'conveyor_sorting',
                                broken: { caption: 'ผลไม้สีเขียวปนในลังสีแดง', fruitOne: '🍅', fruitTwo: '🟢', fruitThree: '🍅', crate: 'ปน' },
                                fixed: { caption: 'สีแดงเข้าลัง สีเขียวผ่านไป', fruitOne: '🍅', fruitTwo: '🟢', fruitThree: '🍅', crate: 'แดง' }
                            },
                            buggyBlock: { condition: 'ถ้าเป็นมะเขือเทศ', action: 'ใส่ลังสีแดง', type: 'if' },
                            correctBlock: { condition: 'ถ้าเป็นมะเขือเทศสีแดง', action: 'ใส่ลังสีแดง', type: 'if' },
                            choices: {
                                bugTargetChoices: [
                                    { id: 'repeat_count', label: 'จำนวนรอบ' },
                                    { id: 'broad_condition', label: 'เงื่อนไขกว้างเกินไป' }
                                ],
                                fixChoices: [
                                    { id: 'any_tomato', label: 'ถ้าเป็นมะเขือเทศ' },
                                    { id: 'red_tomato', label: 'ถ้าเป็นมะเขือเทศสีแดง' }
                                ]
                            },
                            answer: { bugTarget: 'broad_condition', fixChoice: 'red_tomato' },
                            feedback: {
                                correct: 'ซ่อมสำเร็จ! สีเขียวไม่เข้าลังแดงแล้ว',
                                wrongTarget: 'ลองดูว่าเงื่อนไขกว้างเกินไปไหม',
                                wrongFix: 'ต้องระบุสีแดงให้ชัด'
                            },
                            hints: ['ผลไม้ผิดสีหลุดเข้าไป', 'เงื่อนไขควรระบุสี', 'เลือกมะเขือเทศสีแดง']
                        }
                    },
                    {
                        id: 'shipping_gate',
                        label: 'ประตูส่งของ',
                        icon: '🚚',
                        x: 78,
                        y: 58,
                        isBroken: true,
                        isDecoy: false,
                        subLevel: {
                            title: 'ประตูส่งของยังไม่พร้อม',
                            bugType: 'multi_bug',
                            problemText: 'รถส่งของออกก่อนตรวจว่าเครื่องคัดและลังผลไม้พร้อมแล้ว',
                            missionText: 'ซ่อมเงื่อนไขให้ส่งของเมื่อทุกระบบพร้อม',
                            simulation: {
                                type: 'conveyor_sorting',
                                broken: { caption: 'รถขยับทั้งที่ไฟสถานะยังแดง', fruitOne: '🥭', fruitTwo: '🍅', fruitThree: '🟢', crate: 'รอ', truck: true },
                                fixed: { caption: 'ทุกจุดเป็นไฟเขียว รถจึงออกจากฟาร์ม', fruitOne: '🥭', fruitTwo: '🍅', fruitThree: '🥭', crate: 'พร้อม', truck: true }
                            },
                            buggyBlock: { condition: 'ถ้ามีผลไม้อยู่ในลัง', action: 'ส่งรถออก', type: 'if' },
                            correctBlock: { condition: 'ถ้ามะม่วงครบ และคัดสีถูก และประตูพร้อม', action: 'ส่งรถออก', type: 'if' },
                            choices: {
                                bugTargetChoices: [
                                    { id: 'broad_condition', label: 'เงื่อนไขตรวจไม่ครบ' },
                                    { id: 'repeat_count', label: 'จำนวนรอบ' }
                                ],
                                fixChoices: [
                                    { id: 'any_crate', label: 'มีผลไม้อยู่ในลัง' },
                                    { id: 'all_ready', label: 'ทุกระบบพร้อมแล้ว' }
                                ]
                            },
                            answer: { bugTarget: 'broad_condition', fixChoice: 'all_ready' },
                            feedback: {
                                correct: 'ซ่อมสำเร็จ! รถจะออกเมื่อทุกระบบพร้อมเท่านั้น',
                                wrongTarget: 'ลองดูว่าเงื่อนไขตรวจครบทุกจุดหรือยัง',
                                wrongFix: 'ยังเร็วไป ต้องรอทุกระบบพร้อมก่อน'
                            },
                            hints: ['มีผลไม้ในลังอย่างเดียวพอไหม?', 'ต้องตรวจหลายจุดก่อนส่ง', 'เลือกทุกระบบพร้อมแล้ว']
                        }
                    },
                    {
                        id: 'clean_belt',
                        label: 'สายพานสะอาด',
                        icon: '✨',
                        x: 62,
                        y: 72,
                        isBroken: false,
                        isDecoy: true,
                        decoyMessage: 'สายพานสะอาดและทำงานปกติ ไม่ใช่จุดที่ต้องซ่อม'
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
