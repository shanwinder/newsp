// Stage 10: Basic Smart Farm Debugger bugs.
(function () {
    const conditions = [
        { id: 'carrot_muddy', label: 'แครอทเปื้อนโคลน' },
        { id: 'carrot_clean', label: 'แครอทสะอาด' },
        { id: 'carrot_damaged', label: 'แครอทมีตำหนิแต่ไม่เปื้อนโคลน' },
        { id: 'egg_big', label: 'ไข่ใบใหญ่' },
        { id: 'egg_big_good', label: 'ไข่ใบใหญ่และไม่ร้าว' },
        { id: 'egg_small_good', label: 'ไข่ใบเล็กและไม่ร้าว' },
        { id: 'egg_cracked', label: 'ไข่ร้าว' }
    ];

    const actions = [
        { id: 'pass_through', label: 'ปล่อยผ่าน' },
        { id: 'wash_station', label: 'ส่งเข้าเครื่องล้าง' },
        { id: 'premium_egg_tray', label: 'ถาดพรีเมียม' },
        { id: 'standard_egg_tray', label: 'ถาดมาตรฐาน' },
        { id: 'reject_bin', label: 'ถังคัดทิ้ง' }
    ];

    const config = {
        title: 'ด่าน 10: บั๊กจิ๋วในโรงคัดแยก',
        subtitle: 'แยกบั๊กคำสั่ง เงื่อนไข และเงื่อนไขกว้างเกินไป',
        levels: [
            {
                title: '10-1 แครอทเลอะหลุดตะกร้า',
                subtitle: 'Action Bug: เงื่อนไขถูก แต่คำสั่งผิด',
                intro: 'ระบบปล่อยแครอทเปื้อนโคลนผ่านไป ทั้งที่ควรเข้าเครื่องล้าง',
                observePrompt: 'ดูว่าแครอทเลอะถูกส่งไปปลายทางไหนก่อนค่อยแก้บล็อก',
                symptomPrompt: 'อาการที่เห็นคืออะไร',
                scene: {
                    item: { icon: '🥕', label: 'แครอทเปื้อนโคลน' },
                    inputLabel: 'แครอทเข้า',
                    scanLabel: 'สแกนโคลน',
                    outputALabel: 'ตะกร้าผ่าน',
                    outputBLabel: 'เครื่องล้าง',
                    warning: 'แครอทเปื้อนโคลนถูกปล่อยผ่าน ตะกร้าสกปรก',
                    fixedMessage: 'เครื่องล้างพ่นน้ำ แครอทกลับมาสะอาด'
                },
                symptomOptions: [
                    { id: 'wrong_destination', label: 'วัตถุถูกส่งผิดปลายทาง', correct: true, feedback: 'ถูกต้อง แครอทเลอะไปปลายทางผิด' },
                    { id: 'machine_off', label: 'ระบบไม่มีคำสั่งสำหรับกรณีปกติ', correct: false, feedback: 'ด่านนี้มีคำสั่งอยู่ แต่คำสั่งหลังเงื่อนไขทำงานผิด' },
                    { id: 'too_broad', label: 'ตัวหลอกหลุดเข้าเงื่อนไข', correct: false, feedback: 'ยังไม่มีตัวหลอกในด่านนี้ ลองดูคำสั่งหลัง If' }
                ],
                buggyRules: [
                    { type: 'if', condition: 'carrot_muddy', action: 'pass_through' }
                ],
                correctRules: [
                    { type: 'if', condition: 'carrot_muddy', action: 'wash_station' }
                ],
                bugTargets: [
                    { ruleIndex: 0, slot: 'action', reason: 'คำสั่งหลังเงื่อนไขควรส่งไปเครื่องล้าง ไม่ใช่ปล่อยผ่าน' }
                ],
                repairOptions: { conditions, actions },
                hints: [
                    'เงื่อนไขตรวจแครอทเปื้อนโคลนถูกแล้ว ลองดูคำสั่งด้านขวา',
                    'ถ้าแครอทเปื้อนโคลน ต้องส่งเข้าเครื่องล้าง',
                    'เปลี่ยนคำสั่งจาก “ปล่อยผ่าน” เป็น “ส่งเข้าเครื่องล้าง”'
                ],
                huntFeedback: 'บล็อกนี้ยังไม่ใช่จุดหลัก เงื่อนไขถูกแล้วแต่ผลลัพธ์หลังลูกศรผิด',
                repairFeedback: 'ยังไม่ได้ส่งแครอทเลอะเข้าเครื่องล้าง ลองแก้คำสั่งอีกครั้ง',
                success: 'ซ่อมถูกจุดแล้ว เงื่อนไขเดิมถูก แต่ต้องเปลี่ยนคำสั่งให้ถูกปลายทาง',
                explain: 'บั๊กนี้เป็น Action Bug เพราะ “ถ้าแครอทเปื้อนโคลน” ถูกต้องอยู่แล้ว แต่คำสั่ง “ปล่อยผ่าน” ทำให้ของสกปรกหลุดไป'
            },
            {
                title: '10-2 แครอทสะอาดถูกส่งไปล้าง',
                subtitle: 'Condition Bug และทบทวน If pass-through',
                intro: 'แครอทสะอาดถูกส่งเข้าเครื่องล้าง ส่วนแครอทเปื้อนโคลนกลับผ่านไป',
                observePrompt: 'สังเกตว่าของที่ไม่ควรเข้า If กลับเข้าเงื่อนไข และของที่ควรเข้ากลับผ่านไป',
                symptomPrompt: 'อาการที่เห็นคืออะไร',
                scene: {
                    item: { icon: '🥕', label: 'แครอทสะอาด' },
                    inputLabel: 'แครอทเข้า',
                    scanLabel: 'สแกนสภาพ',
                    outputALabel: 'เครื่องล้าง',
                    outputBLabel: 'ปล่อยผ่าน',
                    warning: 'แครอทสะอาดถูกส่งไปล้างโดยไม่จำเป็น',
                    fixedMessage: 'แครอทสะอาดปล่อยผ่าน และแครอทเลอะเข้าเครื่องล้าง'
                },
                symptomOptions: [
                    { id: 'condition_wrong', label: 'เงื่อนไขเลือกวัตถุผิดชนิด', correct: true, feedback: 'ใช่ คำสั่งล้างถูกแล้ว แต่เงื่อนไขเลือกแครอทผิด' },
                    { id: 'pass_bug', label: 'ทุกวัตถุที่ผ่านไปเฉย ๆ เป็นบั๊ก', correct: false, feedback: 'ใน If เดี่ยว วัตถุที่ไม่เข้าเงื่อนไขแล้วผ่านไปเฉย ๆ อาจเป็นพฤติกรรมที่ถูกต้อง' },
                    { id: 'missing_else', label: 'ต้องเพิ่ม Else เสมอ', correct: false, feedback: 'If เดี่ยวในด่านนี้ไม่ต้องมี Else เพราะวัตถุที่ไม่เข้าเงื่อนไขควรปล่อยผ่าน' }
                ],
                buggyRules: [
                    { type: 'if', condition: 'carrot_clean', action: 'wash_station' }
                ],
                correctRules: [
                    { type: 'if', condition: 'carrot_muddy', action: 'wash_station' }
                ],
                bugTargets: [
                    { ruleIndex: 0, slot: 'condition', reason: 'เงื่อนไขควรตรวจแครอทเปื้อนโคลน ไม่ใช่แครอทสะอาด' }
                ],
                repairOptions: { conditions, actions },
                hints: [
                    'คำสั่ง “ส่งเข้าเครื่องล้าง” ถูกแล้ว ลองดูเงื่อนไขด้านซ้าย',
                    'แครอทสะอาดควรปล่อยผ่านในเกม If เดี่ยว',
                    'เปลี่ยนเงื่อนไขเป็น “แครอทเปื้อนโคลน”'
                ],
                huntFeedback: 'ยังไม่ใช่จุดหลัก คำสั่งล้างถูกแล้ว แต่เงื่อนไขกำลังเลือกวัตถุผิด',
                repairFeedback: 'เงื่อนไขยังไม่จับแครอทเปื้อนโคลน ลองเปลี่ยนด้านซ้ายของ If',
                success: 'ยอดเยี่ยม แครอทสะอาดไม่ต้องเข้าเครื่องล้าง และการปล่อยผ่านใน If เดี่ยวเป็นเรื่องปกติ',
                explain: 'บั๊กนี้เป็น Condition Bug เพราะคำสั่ง “ส่งเข้าเครื่องล้าง” ถูก แต่เงื่อนไขผิด ด่านนี้ยังย้ำว่า If เดี่ยวไม่ต้องมี Else เสมอไป'
            },
            {
                title: '10-3 ไข่ร้าวปนถาดดี',
                subtitle: 'Broad Condition Bug: เงื่อนไขกว้างเกินไป',
                intro: 'ไข่ใบใหญ่แต่ร้าวถูกส่งเข้าถาดพรีเมียม ทำให้ถาดดีมีของเสียปน',
                observePrompt: 'มองหาว่าตัวหลอกชนิดใดหลุดเข้าเงื่อนไขที่ดูเหมือนถูก',
                symptomPrompt: 'อาการที่เห็นคืออะไร',
                scene: {
                    item: { icon: '🥚', label: 'ไข่ใบใหญ่แต่ร้าว' },
                    inputLabel: 'ไข่เข้า',
                    scanLabel: 'คัดเกรดไข่',
                    outputALabel: 'ถาดพรีเมียม',
                    outputBLabel: 'ถังคัดทิ้ง',
                    warning: 'ไข่ใบใหญ่แต่ร้าวเข้าถาดพรีเมียม',
                    fixedMessage: 'ไข่ดีเข้าถาดดี ส่วนไข่ร้าวเข้าถังคัดทิ้ง'
                },
                symptomOptions: [
                    { id: 'decoy_entered', label: 'ตัวหลอกหลุดเข้าเงื่อนไข', correct: true, feedback: 'ถูกต้อง ไข่ใหญ่แต่ร้าวเป็นตัวหลอกที่เงื่อนไขกว้างเกินไปจับเข้า' },
                    { id: 'wrong_action', label: 'คำสั่งถาดพรีเมียมผิดเสมอ', correct: false, feedback: 'ถาดพรีเมียมถูกสำหรับไข่ใบใหญ่ที่ไม่ร้าว ปัญหาอยู่ที่เงื่อนไขกว้างเกินไป' },
                    { id: 'missing_else', label: 'ระบบไม่มี Else', correct: false, feedback: 'มี Else แล้ว แต่แถวแรกจับไข่ร้าวไปก่อนถึง Else' }
                ],
                buggyRules: [
                    { type: 'if', condition: 'egg_big', action: 'premium_egg_tray' },
                    { type: 'else_if', condition: 'egg_small_good', action: 'standard_egg_tray' },
                    { type: 'else', condition: 'else', action: 'reject_bin' }
                ],
                correctRules: [
                    { type: 'if', condition: 'egg_big_good', action: 'premium_egg_tray' },
                    { type: 'else_if', condition: 'egg_small_good', action: 'standard_egg_tray' },
                    { type: 'else', condition: 'else', action: 'reject_bin' }
                ],
                bugTargets: [
                    { ruleIndex: 0, slot: 'condition', reason: 'เงื่อนไข “ไข่ใบใหญ่” กว้างเกินไป ต้องกันไข่ร้าวออก' }
                ],
                repairOptions: { conditions, actions },
                hints: [
                    'คำว่า “ไข่ใบใหญ่” รวมไข่ใบใหญ่ที่ร้าวด้วย',
                    'ต้องเพิ่มคุณสมบัติ “ไม่ร้าว” เข้าไปในเงื่อนไขแรก',
                    'เปลี่ยนเงื่อนไขแรกเป็น “ไข่ใบใหญ่และไม่ร้าว”'
                ],
                huntFeedback: 'ยังไม่ใช่สาเหตุหลัก ตัวหลอกถูกจับตั้งแต่เงื่อนไข If แรก',
                repairFeedback: 'เงื่อนไขแรกยังเปิดให้ไข่ร้าวเข้าถาดดี ลองเลือกเงื่อนไขที่ละเอียดขึ้น',
                success: 'ดีมาก เงื่อนไขละเอียดพอแล้ว ไข่ร้าวจึงไม่หลุดเข้าถาดพรีเมียม',
                explain: 'บั๊กนี้เป็น Broad Condition Bug เพราะเงื่อนไข “ไข่ใบใหญ่” กว้างเกินไป ต้องเป็น “ไข่ใบใหญ่และไม่ร้าว”'
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
