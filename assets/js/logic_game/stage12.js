// Stage 12: IF / ELSE IF / ELSE farm condition missions
(function () {
    const config = {
        title: 'ด่าน 12: ศูนย์ควบคุมฟาร์มหลายเงื่อนไข',
        subtitle: 'ฝึกตรวจหลายเงื่อนไขตามลำดับ',
        levels: [
            {
                id: '12-1',
                stageId: 12,
                title: 'คัดแยกผลไม้ตามสี',
                concept: 'IF / ELSE IF / ELSE',
                mission: 'ช่วยเครื่องคัดผลไม้ส่งผลไม้สีต่าง ๆ เข้าลังให้ถูกต้อง',
                problem: 'เครื่องคัดผลไม้ใส่ผลไม้ผิดลัง',
                buggyRule: 'ถ้า ผลไม้สีเขียว → ใส่ลังสุก\nมิฉะนั้นถ้า ผลไม้สีเหลือง → ใส่ลังใกล้สุก\nมิฉะนั้น → ใส่ลังดิบ',
                correctRule: 'ถ้า ผลไม้สีเหลือง → ใส่ลังสุก\nมิฉะนั้นถ้า ผลไม้สีเขียว → ใส่ลังดิบ\nมิฉะนั้น → ตรวจสอบอีกครั้ง',
                question: 'สีของผลไม้ควรเข้าลังใด',
                choices: [
                    { id: 'A', text: 'เหลือง → ลังสุก / เขียว → ลังดิบ / อื่น ๆ → ตรวจสอบ', correct: true, feedback: 'ถูกต้อง! ผลไม้สีเหลืองเป็นผลไม้สุก ส่วนสีเขียวเป็นผลไม้ดิบ' },
                    { id: 'B', text: 'เขียว → ลังสุก / เหลือง → ลังใกล้สุก / อื่น ๆ → ลังดิบ', correct: false, feedback: 'ลองดูว่าสีของผลไม้ควรเข้าลังใด' },
                    { id: 'C', text: 'เหลือง → ลังดิบ / เขียว → ลังสุก / อื่น ๆ → ส่งขาย', correct: false, feedback: 'ยังสลับลังอยู่ สีเหลืองควรเป็นผลไม้สุก' }
                ],
                farmCells: [
                    { key: 'yellow', label: 'สีเหลืองผิดลัง', icon: 'fruit_yellow', state: 'error' },
                    { key: 'green', label: 'สีเขียวผิดลัง', icon: 'fruit_green', state: 'error' },
                    { key: 'crate', label: 'ป้ายลังผิด', icon: 'crate', state: 'warning' }
                ],
                fixedCells: [
                    { key: 'yellow', label: 'เหลืองเข้าลังสุก', icon: 'fruit_yellow', state: 'success' },
                    { key: 'green', label: 'เขียวเข้าลังดิบ', icon: 'fruit_green', state: 'success' },
                    { key: 'sorter', label: 'เครื่องไฟเขียว', icon: 'sorter', state: 'success' }
                ],
                resultText: 'เครื่องคัดแยกผลไม้ตามสีได้ถูกต้องแล้ว',
                hints: [
                    'ดูผลไม้ทีละสี อย่ารีบดูทุกอย่างพร้อมกัน',
                    'สีเหลืองควรเป็นกรณีแรกของผลไม้สุก',
                    'สีเขียวควรไปลังดิบ ส่วนสีอื่นควรตรวจสอบ'
                ],
                knowledge: 'หลายเงื่อนไขต้องตรวจว่าแต่ละเงื่อนไขนำไปสู่คำสั่งที่ถูกต้องหรือไม่'
            },
            {
                id: '12-2',
                stageId: 12,
                title: 'ควบคุมโรงเรือนตามอุณหภูมิ',
                concept: 'IF / ELSE IF / ELSE',
                mission: 'ช่วยระบบโรงเรือนเลือกคำสั่งตามอุณหภูมิ',
                problem: 'อุณหภูมิ 38°C แต่ระบบไม่เปิดพัดลม',
                buggyRule: 'ถ้า อุณหภูมิต่ำกว่า 20°C → เปิดพัดลม\nมิฉะนั้นถ้า อุณหภูมิสูงกว่า 35°C → ปิดพัดลม\nมิฉะนั้น → ปิดระบบ',
                correctRule: 'ถ้า อุณหภูมิสูงกว่า 35°C → เปิดพัดลม\nมิฉะนั้นถ้า อุณหภูมิต่ำกว่า 20°C → ปิดพัดลม\nมิฉะนั้น → รักษาอุณหภูมิปกติ',
                question: 'เมื่ออุณหภูมิสูงกว่า 35°C ระบบควรทำอะไร',
                choices: [
                    { id: 'A', text: 'สูงกว่า 35°C → เปิดพัดลม / ต่ำกว่า 20°C → ปิดพัดลม / อื่น ๆ → รักษาปกติ', correct: true, feedback: 'ถูกต้อง! อากาศร้อนมากจึงต้องเปิดพัดลม' },
                    { id: 'B', text: 'ต่ำกว่า 20°C → เปิดพัดลม / สูงกว่า 35°C → ปิดพัดลม / อื่น ๆ → ปิดระบบ', correct: false, feedback: 'ลองดูว่า 38°C เป็นอากาศร้อนหรือเย็น' },
                    { id: 'C', text: 'สูงกว่า 35°C → ปิดน้ำ / ต่ำกว่า 20°C → เปิดน้ำ / อื่น ๆ → เปิดพัดลม', correct: false, feedback: 'ยังไม่ตรง ด่านนี้กำลังควบคุมพัดลมตามอุณหภูมิ' }
                ],
                farmCells: [
                    { key: 'temp', label: '38°C', icon: 'thermometer', state: 'warning' },
                    { key: 'fan', label: 'พัดลมปิด', icon: 'fan_off', state: 'error' },
                    { key: 'crop', label: 'ผักเหี่ยว', icon: 'crop_wilted', state: 'warning' }
                ],
                fixedCells: [
                    { key: 'temp', label: '38°C', icon: 'thermometer', state: 'normal' },
                    { key: 'fan', label: 'พัดลมเปิด', icon: 'fan_on', state: 'success' },
                    { key: 'crop', label: 'ผักฟื้นตัว', icon: 'crop_ok', state: 'success' }
                ],
                resultText: 'พัดลมเปิดเมื่ออุณหภูมิสูง โรงเรือนเย็นลงและผักฟื้นตัว',
                hints: [
                    'เทียบ 38°C กับ 35°C ก่อน',
                    'บั๊กอยู่ที่คำสั่งของกรณีอุณหภูมิสูง',
                    'ถ้าอากาศร้อนมาก ควรเปิดพัดลม'
                ],
                knowledge: 'ELSE IF ใช้ตรวจเงื่อนไขถัดไปเมื่อเงื่อนไขแรกไม่ตรง'
            },
            {
                id: '12-3',
                stageId: 12,
                title: 'ระบบดูแลฟาร์มอัตโนมัติ',
                concept: 'IF / ELSE IF / ELSE',
                mission: 'ช่วยศูนย์ควบคุมฟาร์มแก้คำสั่งหลายกรณีให้ปลอดภัย',
                problem: 'ระบบดูแลฟาร์มทำงานผิดหลายกรณี เช่น ฝนตกแต่เปิดน้ำ ดินแห้งแต่ปิดน้ำ',
                buggyRule: 'ถ้า ฝนตก → เปิดน้ำ\nมิฉะนั้นถ้า ดินแห้ง → ปิดน้ำ\nมิฉะนั้น → เปิดพัดลม',
                correctRule: 'ถ้า ฝนตก → ปิดน้ำ\nมิฉะนั้นถ้า ดินแห้ง → เปิดน้ำ\nมิฉะนั้น → ปิดน้ำและรอดูอาการ',
                question: 'ควรแก้ระบบแต่ละกรณีอย่างไร',
                choices: [
                    { id: 'A', text: 'ฝนตก → ปิดน้ำ / ดินแห้ง → เปิดน้ำ / อื่น ๆ → ปิดน้ำและรอดูอาการ', correct: true, feedback: 'ถูกต้อง! ระบบต้องปิดน้ำเมื่อฝนตก และเปิดน้ำเมื่อดินแห้ง' },
                    { id: 'B', text: 'ฝนตก → เปิดน้ำ / ดินแห้ง → ปิดน้ำ / อื่น ๆ → เปิดพัดลม', correct: false, feedback: 'ลองตรวจทีละกรณี ฝนตกควรเปิดน้ำหรือปิดน้ำ' },
                    { id: 'C', text: 'ฝนตก → เปิดพัดลม / ดินแห้ง → ปิดประตู / อื่น ๆ → เปิดน้ำ', correct: false, feedback: 'ยังไม่ตรงกับระบบน้ำของฟาร์ม ลองดูฝนและดินอีกครั้ง' }
                ],
                farmCells: [
                    { key: 'rain', label: 'ฝนตก', icon: 'rain', state: 'warning' },
                    { key: 'water', label: 'เปิดผิดเวลา', icon: 'water_on', state: 'error' },
                    { key: 'soil', label: 'ดินแห้งไม่ได้รับน้ำ', icon: 'dry_soil', state: 'warning' },
                    { key: 'panel', label: 'แผงไฟแดง', icon: 'panel_red', state: 'error' }
                ],
                fixedCells: [
                    { key: 'rain', label: 'ฝนตกปิดน้ำ', icon: 'rain', state: 'success' },
                    { key: 'soil', label: 'ดินแห้งรดน้ำ', icon: 'water_on', state: 'success' },
                    { key: 'system', label: 'ระบบไฟเขียว', icon: 'panel_green', state: 'success' },
                    { key: 'farm', label: 'ฟาร์มปลอดภัย', icon: 'farm', state: 'success' }
                ],
                resultText: 'ศูนย์ควบคุมเลือกคำสั่งถูกทุกกรณี ฟาร์มกลับมาปลอดภัย',
                hints: [
                    'ตรวจทีละกรณี เริ่มจากฝนตกก่อน',
                    'ดินแห้งต้องได้รับน้ำ ไม่ใช่ปิดน้ำ',
                    'กรณีอื่น ๆ ควรรอดูอาการและไม่เปิดน้ำเพิ่ม'
                ],
                knowledge: 'เมื่อมีหลายเงื่อนไข ต้องตรวจทีละกรณี และต้องมี ELSE สำหรับกรณีที่ไม่เข้าเงื่อนไขใดเลย'
            }
        ]
    };

    function boot() {
        window.FarmMissions.smartFarmDebuggerLite(config);
    }

    if (window.FarmMissions && window.FarmMissions.smartFarmDebuggerLite) {
        boot();
    } else {
        const script = document.createElement('script');
        script.src = '../assets/js/logic_game/smart_farm_debugger_lite.js';
        script.onload = boot;
        document.head.appendChild(script);
    }
})();
