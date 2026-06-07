// Stage 12: Multi-system Smart Farm Debugger crisis.
(function () {
    const conditions = [
        { id: 'egg_big', label: 'ไข่ใบใหญ่' },
        { id: 'egg_big_good', label: 'ไข่ใบใหญ่และไม่ร้าว' },
        { id: 'egg_small_good', label: 'ไข่ใบเล็กและไม่ร้าว' },
        { id: 'carrot_muddy', label: 'แครอทเปื้อนโคลน' },
        { id: 'temp_gt_50', label: 'อุณหภูมิ > 50°C' },
        { id: 'temp_gt_35', label: 'อุณหภูมิ > 35°C' },
        { id: 'temp_lt_15', label: 'อุณหภูมิ < 15°C' },
        { id: 'rainy', label: 'ฝนตก' },
        { id: 'soil_dry', label: 'ดินแห้ง' },
        { id: 'else', label: 'ทุกกรณีที่เหลือ' }
    ];

    const actions = [
        { id: 'premium_egg_tray', label: 'ถาดพรีเมียม' },
        { id: 'standard_egg_tray', label: 'ถาดมาตรฐาน' },
        { id: 'reject_bin', label: 'ถังคัดทิ้ง' },
        { id: 'wash_station', label: 'ส่งเข้าเครื่องล้าง' },
        { id: 'pass_through', label: 'ปล่อยผ่าน' },
        { id: 'fan_on', label: 'เปิดพัดลม' },
        { id: 'lamp_on', label: 'เปิดหลอดไฟ' },
        { id: 'all_off', label: 'ปิดระบบทั้งหมด' },
        { id: 'sprinkler_on', label: 'เปิดสปริงเกอร์' },
        { id: 'sprinkler_off', label: 'ปิดสปริงเกอร์' },
        { id: 'observe', label: 'รอดูสถานการณ์' }
    ];

    const config = {
        title: 'ด่าน 12: ศูนย์ควบคุมฟาร์มฉุกเฉิน',
        subtitle: 'วิเคราะห์หลายอาการ แยกสาเหตุ และซ่อมหลายระบบอย่างมีเหตุผล',
        levels: [
            {
                title: '12-1 สัญญาณเตือนจากโรงคัดแยก',
                subtitle: 'อาการหลายอย่างอาจเกิดจากบั๊กเดียว',
                intro: 'กล่องพรีเมียมมีของเสีย และถังคัดทิ้งแทบไม่มีของ',
                observePrompt: 'ดูว่าของเสียหายไปไหนก่อนตัดสินว่าต้องแก้กี่จุด',
                symptomPrompt: 'อาการรวมบอกอะไร',
                scene: {
                    item: { icon: '🥚', label: 'ไข่ใบใหญ่แต่ร้าว' },
                    inputLabel: 'โรงคัดไข่',
                    scanLabel: 'สแกนเกรด',
                    outputALabel: 'ถาดพรีเมียม',
                    outputBLabel: 'ถังคัดทิ้ง',
                    warning: 'ถาดพรีเมียมมีไข่ร้าว และถังคัดทิ้งแทบว่าง',
                    fixedMessage: 'ไข่ร้าวถูกกันออกจากถาดดี และเข้าถังคัดทิ้ง'
                },
                symptomOptions: [
                    { id: 'one_cause_many_symptoms', label: 'อาการหลายอย่างมาจากเงื่อนไขกว้างเกินไปหนึ่งจุด', correct: true, feedback: 'ใช่ แถวแรกจับไข่ร้าวไปก่อน Else จึงทำให้สองปลายทางผิดพร้อมกัน' },
                    { id: 'all_actions_wrong', label: 'ต้องเปลี่ยนคำสั่งทุกแถว', correct: false, feedback: 'คำสั่งปลายทางยังสมเหตุผล ปัญหาหลักคือเงื่อนไขแรกกว้างเกินไป' },
                    { id: 'missing_else', label: 'ไม่มี Else สำหรับถังคัดทิ้ง', correct: false, feedback: 'มี Else แล้ว แต่ไข่ร้าวถูก If แรกจับไปก่อนถึง Else' }
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
                    { ruleIndex: 0, slot: 'condition', reason: 'เงื่อนไขแรกกว้างเกินไป ทำให้ไข่ร้าวไม่ไหลไปถึง Else' }
                ],
                repairOptions: { conditions, actions },
                hints: [
                    'ถ้าของเสียไม่เข้า Else ให้ดูว่ามันถูกกฎก่อนหน้าจับไปหรือไม่',
                    'บั๊กเดียวอาจทำให้ทั้งถาดดีและถังคัดทิ้งมีอาการผิด',
                    'เปลี่ยนเงื่อนไขแรกเป็น “ไข่ใบใหญ่และไม่ร้าว”'
                ],
                huntFeedback: 'ยังไม่ใช่จุดหลัก อาการสองอย่างเริ่มจากเงื่อนไขแรกที่จับกว้างเกินไป',
                repairFeedback: 'ไข่ร้าวยังเข้าถาดดีอยู่ ต้องแก้เงื่อนไขแรกให้กันไข่ร้าวออก',
                success: 'วิเคราะห์ถูกแล้ว อาการหลายอย่างหายด้วยการซ่อมจุดเดียว',
                explain: 'อาการถาดดีมีของเสียและถังคัดทิ้งว่างเกิดจากสาเหตุเดียว คือเงื่อนไขแรกกว้างเกินไป'
            },
            {
                title: '12-2 โรงเรือนกับสายพานเสียพร้อมกัน',
                subtitle: 'สองระบบมีบั๊กคนละประเภท ต้องแยกวิเคราะห์',
                intro: 'โรงเรือนร้อนแต่พัดลมไม่เปิด และสายพานปล่อยแครอทเลอะผ่าน',
                observePrompt: 'แยกอาการโรงเรือนกับสายพาน อย่าแก้ทุกอย่างเป็นบั๊กชนิดเดียว',
                symptomPrompt: 'อาการรวมควรตีความอย่างไร',
                scene: {
                    item: { icon: '🚨', label: 'สัญญาณเตือนสองระบบ' },
                    inputLabel: 'ศูนย์ควบคุม',
                    scanLabel: 'ตรวจสองระบบ',
                    outputALabel: 'ยังผิดพลาด',
                    outputBLabel: 'กู้ระบบ',
                    warning: 'พัดลมไม่เปิด และแครอทเลอะหลุดสายพาน',
                    fixedMessage: 'พัดลมเปิดเมื่อร้อน และแครอทเลอะเข้าเครื่องล้าง'
                },
                symptomOptions: [
                    { id: 'two_bug_types', label: 'มีบั๊กสองชนิดในคนละระบบ', correct: true, feedback: 'ถูกต้อง โรงเรือนเป็นตัวเลขผิด ส่วนสายพานเป็นคำสั่งผิด' },
                    { id: 'only_order', label: 'เป็นบั๊กลำดับเงื่อนไขทั้งหมด', correct: false, feedback: 'ไม่มีการสลับลำดับในด่านนี้ ลองดูตัวเลขและคำสั่งหลังเงื่อนไข' },
                    { id: 'only_missing_else', label: 'ทุกระบบขาด Else', correct: false, feedback: 'ระบบมี Else แล้วในโรงเรือน และสายพานเป็น If เดี่ยวที่คำสั่งผิด' }
                ],
                buggyRules: [
                    { type: 'if', condition: 'temp_gt_50', action: 'fan_on' },
                    { type: 'else_if', condition: 'temp_lt_15', action: 'lamp_on' },
                    { type: 'else', condition: 'else', action: 'all_off' },
                    { type: 'if', condition: 'carrot_muddy', action: 'pass_through' }
                ],
                correctRules: [
                    { type: 'if', condition: 'temp_gt_35', action: 'fan_on' },
                    { type: 'else_if', condition: 'temp_lt_15', action: 'lamp_on' },
                    { type: 'else', condition: 'else', action: 'all_off' },
                    { type: 'if', condition: 'carrot_muddy', action: 'wash_station' }
                ],
                bugTargets: [
                    { ruleIndex: 0, slot: 'condition', reason: 'โรงเรือนร้อน 38°C ไม่เข้าเงื่อนไข > 50°C ต้องลดเป็น > 35°C' },
                    { ruleIndex: 3, slot: 'action', reason: 'แครอทเปื้อนโคลนควรถูกส่งเข้าเครื่องล้าง ไม่ใช่ปล่อยผ่าน' }
                ],
                repairOptions: { conditions, actions },
                hints: [
                    'แยกสองอาการก่อน: โรงเรือนเกี่ยวกับตัวเลข ส่วนสายพานเกี่ยวกับปลายทาง',
                    '38°C ต้องเข้าเงื่อนไขเปิดพัดลม และแครอทเลอะต้องเข้าเครื่องล้าง',
                    'แก้กฎแรกเป็น > 35°C และกฎแครอทเป็น “ส่งเข้าเครื่องล้าง”'
                ],
                huntFeedback: 'ยังไม่ใช่จุดหลัก ต้องหาให้ครบทั้งบั๊กตัวเลขในโรงเรือนและบั๊กคำสั่งในสายพาน',
                repairFeedback: 'ยังมีอย่างน้อยหนึ่งระบบผิดอยู่ ตรวจทั้งตัวเลขโรงเรือนและคำสั่งสายพาน',
                success: 'ซ่อมแยกสองระบบได้ถูกต้อง บั๊กแต่ละชนิดต้องใช้หลักฐานคนละแบบ',
                explain: 'ด่านนี้มี Numeric Bug ในโรงเรือนและ Action Bug ในสายพาน ต้องแก้ทั้งสองจุด ระบบจึงกลับมาปลอดภัย'
            },
            {
                title: '12-3 วิกฤตฟาร์มก่อนส่งตลาด',
                subtitle: 'Broad Condition, Order และ Missing Else พร้อมกัน',
                intro: 'ก่อนส่งตลาด ไข่ร้าวเข้าถาดดี ฝนตกแต่รดน้ำ และอุณหภูมิปกติทำให้ระบบค้าง',
                observePrompt: 'นี่คือภารกิจรวม ต้องจับบั๊กสามชนิดโดยไม่เดาสุ่ม',
                symptomPrompt: 'อาการรวมนี้ต้องแก้แบบใด',
                scene: {
                    item: { icon: '🧑‍🔧', label: 'ศูนย์ควบคุมฉุกเฉิน' },
                    inputLabel: 'สัญญาณเตือน',
                    scanLabel: 'วิเคราะห์รวม',
                    outputALabel: 'วิกฤต',
                    outputBLabel: 'พร้อมส่งตลาด',
                    warning: 'ไข่ร้าวปนถาดดี ฝนตกแต่รดน้ำ และโรงเรือนค้าง',
                    fixedMessage: 'ระบบคัดไข่ รดน้ำ และโรงเรือนกลับมาถูกต้อง'
                },
                symptomOptions: [
                    { id: 'three_bugs', label: 'มีบั๊กสามจุด: เงื่อนไขกว้าง ลำดับผิด และขาด Else', correct: true, feedback: 'ถูกต้อง ต้องแก้สามอาการด้วยเหตุผลคนละแบบ' },
                    { id: 'one_action_bug', label: 'ทุกอย่างเกิดจากคำสั่งปลายทางผิดแถวเดียว', correct: false, feedback: 'มีหลายอาการจากหลายระบบ ไม่ใช่ Action Bug จุดเดียว' },
                    { id: 'pass_through_only', label: 'ทั้งหมดเป็นเรื่อง If pass-through', correct: false, feedback: 'ด่านนี้มีทั้ง Else If และ Else หลายระบบ ต้องดูบั๊กตามอาการ' }
                ],
                buggyRules: [
                    { type: 'if', condition: 'egg_big', action: 'premium_egg_tray' },
                    { type: 'else_if', condition: 'egg_small_good', action: 'standard_egg_tray' },
                    { type: 'else', condition: 'else', action: 'reject_bin' },
                    { type: 'if', condition: 'soil_dry', action: 'sprinkler_on' },
                    { type: 'else_if', condition: 'rainy', action: 'sprinkler_off' },
                    { type: 'else', condition: 'else', action: 'observe' },
                    { type: 'if', condition: 'temp_gt_35', action: 'fan_on' },
                    { type: 'else_if', condition: 'temp_lt_15', action: 'lamp_on' }
                ],
                correctRules: [
                    { type: 'if', condition: 'egg_big_good', action: 'premium_egg_tray' },
                    { type: 'else_if', condition: 'egg_small_good', action: 'standard_egg_tray' },
                    { type: 'else', condition: 'else', action: 'reject_bin' },
                    { type: 'if', condition: 'rainy', action: 'sprinkler_off' },
                    { type: 'else_if', condition: 'soil_dry', action: 'sprinkler_on' },
                    { type: 'else', condition: 'else', action: 'observe' },
                    { type: 'if', condition: 'temp_gt_35', action: 'fan_on' },
                    { type: 'else_if', condition: 'temp_lt_15', action: 'lamp_on' },
                    { type: 'else', condition: 'else', action: 'all_off' }
                ],
                bugTargets: [
                    { ruleIndex: 0, slot: 'condition', reason: 'กฎไข่ใบใหญ่กว้างเกินไป ต้องกันไข่ร้าวออก' },
                    { ruleIndex: 3, slot: 'rule', reason: 'ระบบรดน้ำต้องตรวจฝนตกก่อนดินแห้ง' },
                    { ruleIndex: 8, slot: 'else', reason: 'ระบบโรงเรือนขาด Else สำหรับอุณหภูมิปกติ' }
                ],
                repairOptions: { conditions, actions },
                hints: [
                    'แยกอาการเป็นสามระบบ: ไข่, น้ำ, โรงเรือน',
                    'ไข่ต้องแก้เงื่อนไขแรก, น้ำต้องสลับลำดับ, โรงเรือนต้องเพิ่ม Else',
                    'คำตอบคือ ไข่ใบใหญ่และไม่ร้าว, ฝนตกมาก่อนดินแห้ง, และ Else -> ปิดระบบทั้งหมด'
                ],
                huntFeedback: 'ยังไม่ใช่จุดครบถ้วน ต้องเจอทั้งกฎไข่ กฎรดน้ำ และ Else ที่หายของโรงเรือน',
                repairFeedback: 'ยังมีระบบหนึ่งผิดอยู่ ตรวจว่าแก้ครบทั้งเงื่อนไขไข่ ลำดับรดน้ำ และ Else โรงเรือนหรือยัง',
                success: 'กู้ศูนย์ควบคุมสำเร็จ คุณจับบั๊กหลายชนิดและซ่อมอย่างเป็นขั้นตอน',
                explain: 'ภารกิจสุดท้ายรวม Broad Condition Bug, Order Bug และ Missing Else Bug ผู้เล่นต้องสังเกตหลักฐาน แยกสาเหตุ และทดสอบซ้ำ'
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
