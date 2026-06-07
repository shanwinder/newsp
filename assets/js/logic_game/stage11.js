// Stage 11: IF / ELSE farm condition missions
(function () {
    const config = {
        title: 'ด่าน 11: ภารกิจ IF / ELSE ฟาร์มอัจฉริยะ',
        subtitle: 'ฝึกเลือกสองทาง ถ้าใช่ทำอย่างหนึ่ง มิฉะนั้นทำอีกอย่าง',
        levels: [
            {
                id: '11-1',
                stageId: 11,
                title: 'ดินแห้งให้รดน้ำ มิฉะนั้นให้ปิดน้ำ',
                concept: 'IF / ELSE',
                mission: 'ช่วยระบบรดน้ำแยกกรณีดินแห้งกับดินชื้นให้ถูกต้อง',
                problem: 'ดินชื้นแล้ว แต่ระบบยังเปิดน้ำ ทำให้น้ำเริ่มท่วมแปลงผัก',
                buggyRule: 'ถ้า ดินแห้ง → เปิดน้ำ\nมิฉะนั้น → เปิดน้ำ',
                correctRule: 'ถ้า ดินแห้ง → เปิดน้ำ\nมิฉะนั้น → ปิดน้ำ',
                question: 'เมื่อดินไม่แห้งแล้ว ควรให้ระบบทำอะไร',
                choices: [
                    { id: 'A', text: 'ถ้า ดินแห้ง → เปิดน้ำ / มิฉะนั้น → ปิดน้ำ', correct: true, feedback: 'ถูกต้อง! ถ้าดินไม่แห้ง ระบบควรปิดน้ำ' },
                    { id: 'B', text: 'ถ้า ดินแห้ง → เปิดน้ำ / มิฉะนั้น → เปิดน้ำ', correct: false, feedback: 'ลองดูว่าเมื่อดินไม่แห้งแล้ว ระบบควรเปิดน้ำต่อหรือไม่' },
                    { id: 'C', text: 'ถ้า ดินแห้ง → ปิดน้ำ / มิฉะนั้น → เปิดน้ำ', correct: false, feedback: 'ยังกลับทางอยู่ ดินแห้งควรได้น้ำ แต่ดินชื้นควรปิดน้ำ' }
                ],
                farmCells: [
                    { key: 'soil', label: 'ดินชื้น', icon: 'moist_soil', state: 'normal' },
                    { key: 'water', label: 'สปริงเกอร์เปิด', icon: 'water_on', state: 'error' },
                    { key: 'crop', label: 'น้ำเริ่มท่วม', icon: 'crop_wilted', state: 'warning' }
                ],
                fixedCells: [
                    { key: 'soil', label: 'ดินชื้น', icon: 'moist_soil', state: 'normal' },
                    { key: 'water', label: 'สปริงเกอร์ปิด', icon: 'water_off', state: 'success' },
                    { key: 'crop', label: 'แปลงปกติ', icon: 'crop_ok', state: 'success' }
                ],
                resultText: 'ระบบปิดน้ำเมื่อดินชื้น แปลงผักกลับมาปลอดภัย',
                hints: [
                    'ดูว่าดินตอนนี้แห้งหรือชื้น',
                    'ELSE คือกรณีที่ไม่ใช่ดินแห้ง',
                    'ถ้าดินชื้น ระบบควรปิดน้ำ'
                ],
                knowledge: 'ELSE ใช้บอกว่าถ้าไม่เข้าเงื่อนไขแรก ให้ทำอะไรต่อ'
            },
            {
                id: '11-2',
                stageId: 11,
                title: 'ฝนตกให้ปิดน้ำ มิฉะนั้นให้ตรวจดิน',
                concept: 'IF / ELSE',
                mission: 'ช่วยระบบรดน้ำให้หยุดทำงานเมื่อฝนตก',
                problem: 'ฝนตก แต่ระบบยังเปิดสปริงเกอร์',
                buggyRule: 'ถ้า ฝนตก → เปิดน้ำ\nมิฉะนั้น → ตรวจความชื้นดิน',
                correctRule: 'ถ้า ฝนตก → ปิดน้ำ\nมิฉะนั้น → ตรวจความชื้นดิน',
                question: 'เมื่อฝนตก ระบบควรเปิดหรือปิดน้ำ',
                choices: [
                    { id: 'A', text: 'ถ้า ฝนตก → ปิดน้ำ / มิฉะนั้น → ตรวจความชื้นดิน', correct: true, feedback: 'ถูกต้อง! เมื่อฝนตก ระบบควรปิดน้ำก่อน' },
                    { id: 'B', text: 'ถ้า ฝนตก → เปิดน้ำ / มิฉะนั้น → ตรวจความชื้นดิน', correct: false, feedback: 'ลองคิดดูว่าเมื่อฝนตก ยังจำเป็นต้องเปิดน้ำอีกหรือไม่' },
                    { id: 'C', text: 'ถ้า ฝนตก → เปิดพัดลม / มิฉะนั้น → ปิดประตู', correct: false, feedback: 'ยังไม่เกี่ยวกับพัดลมหรือประตู ด่านนี้คือระบบน้ำ' }
                ],
                farmCells: [
                    { key: 'rain', label: 'ฝนตก', icon: 'rain', state: 'warning' },
                    { key: 'water', label: 'สปริงเกอร์เปิด', icon: 'water_on', state: 'error' },
                    { key: 'crop', label: 'น้ำมากเกินไป', icon: 'crop_wilted', state: 'warning' }
                ],
                fixedCells: [
                    { key: 'rain', label: 'ฝนตก', icon: 'rain', state: 'normal' },
                    { key: 'water', label: 'สปริงเกอร์ปิด', icon: 'water_off', state: 'success' },
                    { key: 'crop', label: 'ปลอดภัย', icon: 'crop_ok', state: 'success' }
                ],
                resultText: 'ฝนตกอยู่ ระบบจึงปิดสปริงเกอร์และรอให้ตรวจดินในกรณีอื่น',
                hints: [
                    'ฝนตกทำให้แปลงได้รับน้ำอยู่แล้ว',
                    'บั๊กอยู่ที่คำสั่งหลังเงื่อนไขฝนตก',
                    'เมื่อฝนตก ควรปิดน้ำ'
                ],
                knowledge: 'IF / ELSE ช่วยให้ระบบเลือกทำงานได้ตามสถานการณ์'
            },
            {
                id: '11-3',
                stageId: 11,
                title: 'ประตูคอกไก่กลางวันกลางคืน',
                concept: 'IF / ELSE',
                mission: 'ช่วยระบบประตูคอกไก่เปิดตอนกลางวันและปิดตอนกลางคืน',
                problem: 'ตอนกลางคืน แต่ประตูคอกไก่ยังเปิดอยู่',
                buggyRule: 'ถ้า กลางวัน → เปิดประตู\nมิฉะนั้น → เปิดประตู',
                correctRule: 'ถ้า กลางวัน → เปิดประตู\nมิฉะนั้น → ปิดประตู',
                question: 'ถ้าไม่ใช่กลางวัน ประตูควรเป็นอย่างไร',
                choices: [
                    { id: 'A', text: 'ถ้า กลางวัน → เปิดประตู / มิฉะนั้น → ปิดประตู', correct: true, feedback: 'ถูกต้อง! ตอนกลางคืนควรปิดประตูคอกไก่' },
                    { id: 'B', text: 'ถ้า กลางวัน → เปิดประตู / มิฉะนั้น → เปิดประตู', correct: false, feedback: 'ลองดูว่าตอนนี้เป็นกลางวันหรือกลางคืน' },
                    { id: 'C', text: 'ถ้า กลางคืน → เปิดประตู / มิฉะนั้น → ปิดประตู', correct: false, feedback: 'ยังไม่ปลอดภัย กลางคืนไม่ควรเปิดประตู' }
                ],
                farmCells: [
                    { key: 'time', label: 'กลางคืน', emoji: '🌙', state: 'warning' },
                    { key: 'door', label: 'ประตูเปิด', icon: 'door_open', state: 'error' },
                    { key: 'chicken', label: 'ไก่เสี่ยงออกคอก', icon: 'chicken', state: 'warning' }
                ],
                fixedCells: [
                    { key: 'time', label: 'กลางคืน', emoji: '🌙', state: 'normal' },
                    { key: 'door', label: 'ประตูปิด', icon: 'door_closed', state: 'success' },
                    { key: 'chicken', label: 'ไก่ปลอดภัย', icon: 'chicken', state: 'success' }
                ],
                resultText: 'ระบบปิดประตูตอนกลางคืน ไก่อยู่ในคอกอย่างปลอดภัย',
                hints: [
                    'ตอนนี้เป็นกลางวันหรือกลางคืน',
                    'ELSE คือกรณีที่ไม่ใช่กลางวัน',
                    'กลางคืนควรปิดประตูคอกไก่'
                ],
                knowledge: 'ELSE คือทางเลือกเมื่อไม่ใช่กรณีแรก'
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
