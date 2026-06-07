// Stage 11: Order, numeric, and missing-else bugs.
(function () {
    const conditions = [
        { id: 'rainy', label: 'ฝนตก' },
        { id: 'soil_dry', label: 'ดินแห้ง' },
        { id: 'temp_gt_50', label: 'อุณหภูมิ > 50°C' },
        { id: 'temp_gt_35', label: 'อุณหภูมิ > 35°C' },
        { id: 'temp_lt_15', label: 'อุณหภูมิ < 15°C' },
        { id: 'else', label: 'ทุกกรณีที่เหลือ' }
    ];

    const actions = [
        { id: 'sprinkler_on', label: 'เปิดสปริงเกอร์' },
        { id: 'sprinkler_off', label: 'ปิดสปริงเกอร์' },
        { id: 'observe', label: 'รอดูสถานการณ์' },
        { id: 'fan_on', label: 'เปิดพัดลม' },
        { id: 'lamp_on', label: 'เปิดหลอดไฟ' },
        { id: 'all_off', label: 'ปิดระบบทั้งหมด' }
    ];

    const config = {
        title: 'ด่าน 11: โรงเรือนรวน ลำดับเพี้ยน',
        subtitle: 'ตรวจลำดับเงื่อนไข ตัวเลข และกรณี Else ที่ตกหล่น',
        levels: [
            {
                title: '11-1 ฝนตกแต่ยังรดน้ำ',
                subtitle: 'Order Bug: ลำดับเงื่อนไขมีผลต่อผลลัพธ์',
                intro: 'ฝนกำลังตก แต่ระบบยังเปิดสปริงเกอร์จนแปลงน้ำท่วม',
                observePrompt: 'ดูว่าระบบตรวจเงื่อนไขไหนก่อน แล้วเหตุใดฝนตกยังรดน้ำ',
                symptomPrompt: 'อาการที่เห็นคืออะไร',
                scene: {
                    item: { icon: '🌧️', label: 'ฝนตกและดินแห้ง' },
                    inputLabel: 'ข้อมูลเซ็นเซอร์',
                    scanLabel: 'ตัวตัดสินใจ',
                    outputALabel: 'เปิดน้ำ',
                    outputBLabel: 'ปิดน้ำ',
                    warning: 'ฝนตกแต่สปริงเกอร์ยังเปิด แปลงเริ่มน้ำท่วม',
                    fixedMessage: 'ระบบตรวจฝนก่อน จึงปิดสปริงเกอร์ทันที'
                },
                symptomOptions: [
                    { id: 'wrong_order', label: 'เครื่องจักรทำงานผิดเวลาเพราะลำดับเงื่อนไข', correct: true, feedback: 'ใช่ ดินแห้งถูกตรวจก่อนฝนตก ระบบจึงเปิดน้ำก่อน' },
                    { id: 'numeric', label: 'ค่าตัวเลขของอุณหภูมิผิด', correct: false, feedback: 'ด่านนี้ยังไม่เกี่ยวกับตัวเลข ลองดูว่ากฎไหนถูกตรวจก่อน' },
                    { id: 'missing_else', label: 'ไม่มี Else รองรับกรณีปกติ', correct: false, feedback: 'มี Else แล้ว แต่ระบบเข้าเงื่อนไขแรกก่อนถึง Else' }
                ],
                buggyRules: [
                    { type: 'if', condition: 'soil_dry', action: 'sprinkler_on' },
                    { type: 'else_if', condition: 'rainy', action: 'sprinkler_off' },
                    { type: 'else', condition: 'else', action: 'observe' }
                ],
                correctRules: [
                    { type: 'if', condition: 'rainy', action: 'sprinkler_off' },
                    { type: 'else_if', condition: 'soil_dry', action: 'sprinkler_on' },
                    { type: 'else', condition: 'else', action: 'observe' }
                ],
                bugTargets: [
                    { ruleIndex: 0, slot: 'rule', reason: 'ต้องตรวจฝนตกก่อนดินแห้ง ไม่เช่นนั้นระบบเปิดน้ำเร็วเกินไป' }
                ],
                repairOptions: { conditions, actions },
                hints: [
                    'เมื่อทั้ง “ฝนตก” และ “ดินแห้ง” เป็นจริง ระบบจะใช้กฎแรกที่เจอก่อน',
                    'ถ้าตรวจดินแห้งก่อน ระบบจะเปิดสปริงเกอร์ทันที',
                    'สลับให้ “ฝนตก -> ปิดสปริงเกอร์” เป็นกฎแรก'
                ],
                huntFeedback: 'ยังไม่ใช่จุดหลัก กฎแต่ละข้อดูถูก แต่ตำแหน่งของกฎผิด',
                repairFeedback: 'ลำดับยังทำให้ดินแห้งถูกตรวจก่อนฝนตก ลองเลื่อนกฎฝนตกขึ้น',
                success: 'เรียงลำดับถูกแล้ว ระบบให้ฝนตกมีความสำคัญก่อนการรดน้ำ',
                explain: 'บั๊กนี้เป็น Order Bug เพราะเงื่อนไขแต่ละข้อไม่ได้ผิด แต่เรียงลำดับผิด ทำให้กฎแรกจับสถานการณ์ก่อน'
            },
            {
                title: '11-2 โรงเรือนร้อนแต่ไม่เปิดพัดลม',
                subtitle: 'Numeric Bug: ตัวเลขผิดทำให้ไม่เข้าเงื่อนไข',
                intro: 'โรงเรือน 38°C แต่พัดลมไม่เปิด เพราะเงื่อนไขตั้งค่าสูงเกินไป',
                observePrompt: 'เทียบอุณหภูมิที่เกิดขึ้นกับตัวเลขในเงื่อนไข',
                symptomPrompt: 'อาการที่เห็นคืออะไร',
                scene: {
                    item: { icon: '🌡️', label: 'อุณหภูมิ 38°C' },
                    inputLabel: 'เซ็นเซอร์ร้อน',
                    scanLabel: 'ตรวจอุณหภูมิ',
                    outputALabel: 'ปิดระบบ',
                    outputBLabel: 'เปิดพัดลม',
                    warning: '38°C แต่พัดลมไม่เปิด โรงเรือนร้อนเกินไป',
                    fixedMessage: 'เมื่อเกิน 35°C พัดลมเปิดทันที'
                },
                symptomOptions: [
                    { id: 'numeric_wrong', label: 'ค่าตัวเลขในเงื่อนไขสูงเกินไป', correct: true, feedback: 'ถูกต้อง 38°C ไม่มากกว่า 50°C จึงไม่เปิดพัดลม' },
                    { id: 'wrong_action', label: 'คำสั่งเปิดพัดลมผิดปลายทาง', correct: false, feedback: 'คำสั่งเปิดพัดลมถูกแล้ว ปัญหาอยู่ที่ตัวเลขในเงื่อนไข' },
                    { id: 'wrong_order', label: 'ฝนตกถูกตรวจช้าเกินไป', correct: false, feedback: 'ด่านนี้เป็นโรงเรือนอุณหภูมิ ไม่เกี่ยวกับฝนตก' }
                ],
                buggyRules: [
                    { type: 'if', condition: 'temp_gt_50', action: 'fan_on' },
                    { type: 'else_if', condition: 'temp_lt_15', action: 'lamp_on' },
                    { type: 'else', condition: 'else', action: 'all_off' }
                ],
                correctRules: [
                    { type: 'if', condition: 'temp_gt_35', action: 'fan_on' },
                    { type: 'else_if', condition: 'temp_lt_15', action: 'lamp_on' },
                    { type: 'else', condition: 'else', action: 'all_off' }
                ],
                bugTargets: [
                    { ruleIndex: 0, slot: 'condition', reason: 'ตัวเลข 50°C สูงเกินไป ควรเปิดพัดลมเมื่อมากกว่า 35°C' }
                ],
                repairOptions: { conditions, actions },
                hints: [
                    '38°C ไม่เข้าเงื่อนไข “มากกว่า 50°C”',
                    'คำสั่งเปิดพัดลมถูกแล้ว ให้ดูตัวเลขในเงื่อนไขแรก',
                    'เปลี่ยนเงื่อนไขเป็น “อุณหภูมิ > 35°C”'
                ],
                huntFeedback: 'ยังไม่ใช่สาเหตุหลัก คำสั่งถูกแล้ว แต่ค่าที่ใช้เปรียบเทียบผิด',
                repairFeedback: 'ตัวเลขยังไม่ทำให้ 38°C เข้าเงื่อนไขเปิดพัดลม',
                success: 'แก้ตัวเลขถูกแล้ว โรงเรือนร้อนจึงเปิดพัดลมได้',
                explain: 'บั๊กนี้เป็น Numeric Bug เพราะเงื่อนไขใช้ค่า > 50°C สูงเกินไป ทำให้อุณหภูมิ 38°C ไม่เข้าเงื่อนไข'
            },
            {
                title: '11-3 อุณหภูมิปกติแต่ระบบค้าง',
                subtitle: 'Missing Else Bug: ไม่มีคำสั่งสำหรับกรณีปกติ',
                intro: 'อุณหภูมิ 25°C ไม่ร้อนและไม่หนาว แต่ระบบไม่มี Else จึงไม่รู้จะทำอะไร',
                observePrompt: 'ดูว่าเมื่อไม่เข้า If หรือ Else If แล้วระบบมีทางออกหรือไม่',
                symptomPrompt: 'อาการที่เห็นคืออะไร',
                scene: {
                    item: { icon: '🏡', label: 'อุณหภูมิ 25°C' },
                    inputLabel: 'โรงเรือนปกติ',
                    scanLabel: 'ตรวจอุณหภูมิ',
                    outputALabel: 'ระบบค้าง',
                    outputBLabel: 'ปิดระบบ',
                    warning: '25°C ไม่เข้าเงื่อนไขใด ระบบจึงค้าง',
                    fixedMessage: 'กรณีปกติเข้า Else แล้วปิดระบบทั้งหมด'
                },
                symptomOptions: [
                    { id: 'missing_else', label: 'ระบบไม่มีคำสั่งสำหรับกรณีปกติ', correct: true, feedback: 'ถูกต้อง 25°C ไม่เข้าเงื่อนไขร้อนหรือหนาว จึงต้องมี Else' },
                    { id: 'numeric', label: 'ตัวเลข 35°C ผิดเสมอ', correct: false, feedback: '35°C และ 15°C ใช้แบ่งร้อน/หนาวได้ ปัญหาคือกรณีปกติหายไป' },
                    { id: 'wrong_action', label: 'คำสั่งเปิดหลอดไฟผิด', correct: false, feedback: 'หลอดไฟใช้ตอนหนาว แต่สถานการณ์นี้คืออุณหภูมิปกติ' }
                ],
                buggyRules: [
                    { type: 'if', condition: 'temp_gt_35', action: 'fan_on' },
                    { type: 'else_if', condition: 'temp_lt_15', action: 'lamp_on' }
                ],
                correctRules: [
                    { type: 'if', condition: 'temp_gt_35', action: 'fan_on' },
                    { type: 'else_if', condition: 'temp_lt_15', action: 'lamp_on' },
                    { type: 'else', condition: 'else', action: 'all_off' }
                ],
                bugTargets: [
                    { ruleIndex: 2, slot: 'else', reason: 'ขาด Else สำหรับอุณหภูมิปกติ จึงต้องเพิ่มคำสั่งปิดระบบทั้งหมด' }
                ],
                repairOptions: { conditions, actions },
                hints: [
                    '25°C ไม่มากกว่า 35°C และไม่ต่ำกว่า 15°C',
                    'เมื่อไม่เข้าเงื่อนไขใดเลย ระบบต้องรู้ว่าจะทำอะไรต่อ',
                    'เพิ่ม Else -> ปิดระบบทั้งหมด'
                ],
                huntFeedback: 'ยังไม่ใช่จุดหลัก เงื่อนไขร้อนและหนาวถูกแล้ว แต่กรณีปกติไม่มีทางไป',
                repairFeedback: 'ระบบยังไม่มี Else สำหรับกรณีปกติ',
                success: 'เพิ่ม Else สำเร็จ ระบบไม่ค้างเมื่ออุณหภูมิปกติ',
                explain: 'บั๊กนี้เป็น Missing Else Bug เพราะเมื่อ 25°C ไม่เข้าเงื่อนไขร้อนหรือหนาว ระบบต้องมี Else เพื่อกำหนดผลลัพธ์ปกติ'
            }
        ]
    };

    function boot() {
        window.FarmMissions.smartFarmDebugger(config);
    }

    if (window.FarmMissions?.smartFarmDebugger) {
        boot();
    } else {
        const helper = document.createElement('script');
        helper.src = '../assets/js/logic_game/debug_drag_drop.js';
        document.head.appendChild(helper);
        const script = document.createElement('script');
        script.src = '../assets/js/logic_game/smart_farm_debugger.js';
        script.onload = boot;
        document.head.appendChild(script);
    }
})();
