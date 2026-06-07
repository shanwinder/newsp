// Stage 10: IF farm condition missions
(function () {
    const config = {
        title: 'ด่าน 10: ภารกิจ IF ฟาร์มพื้นฐาน',
        subtitle: 'ฝึกแก้เงื่อนไขแบบ ถ้า...แล้ว...',
        levels: [
            {
                id: '10-1',
                stageId: 10,
                title: 'ดินแห้งต้องรดน้ำ',
                concept: 'IF',
                mission: 'ช่วยระบบรดน้ำแปลงผักให้ทำงานถูกต้อง',
                problem: 'ดินแห้ง แต่ระบบไม่เปิดน้ำ',
                buggyRule: 'ถ้า ดินชื้น → เปิดน้ำ',
                correctRule: 'ถ้า ดินแห้ง → เปิดน้ำ',
                question: 'ควรแก้เงื่อนไขอย่างไร',
                choices: [
                    { id: 'A', text: 'ถ้า ดินแห้ง → เปิดน้ำ', correct: true, feedback: 'ถูกต้อง! เมื่อดินแห้ง ระบบต้องเปิดน้ำ' },
                    { id: 'B', text: 'ถ้า ฝนตก → เปิดน้ำ', correct: false, feedback: 'ลองดูอีกครั้ง ตอนนี้ปัญหาคือดินแห้ง ไม่ใช่ฝนตก' },
                    { id: 'C', text: 'ถ้า ดินชื้น → ปิดน้ำ', correct: false, feedback: 'ยังไม่ถูก เพราะตอนนี้ดินแห้งและต้องการน้ำ' }
                ],
                farmCells: [
                    { key: 'soil', label: 'ดินแห้ง', icon: 'dry_soil', state: 'warning' },
                    { key: 'crop', label: 'ผักเหี่ยว', icon: 'crop_wilted', state: 'warning' },
                    { key: 'water', label: 'น้ำปิด', icon: 'water_off', state: 'error' }
                ],
                fixedCells: [
                    { key: 'soil', label: 'ดินแห้ง', icon: 'dry_soil', state: 'normal' },
                    { key: 'crop', label: 'ผักสดชื่น', icon: 'crop_ok', state: 'success' },
                    { key: 'water', label: 'น้ำเปิด', icon: 'water_on', state: 'success' }
                ],
                resultText: 'ระบบเปิดน้ำให้แปลงผัก ผักกลับมาสดชื่น',
                hints: [
                    'ลองดูว่าในฟาร์มตอนนี้ ดินแห้งหรือดินชื้น',
                    'เงื่อนไขที่ผิดอยู่ตรงคำว่า “ดินชื้น”',
                    'ถ้าดินแห้ง ระบบควรเปิดน้ำ'
                ],
                knowledge: 'เงื่อนไข IF ต้องตรงกับสถานการณ์จริง'
            },
            {
                id: '10-2',
                stageId: 10,
                title: 'แดดแรงต้องเปิดสแลน',
                concept: 'IF',
                mission: 'ช่วยระบบบังแดดให้ป้องกันผักจากแดดแรง',
                problem: 'แดดแรงมาก ผักเริ่มเหี่ยว แต่ระบบไม่เปิดสแลนบังแดด',
                buggyRule: 'ถ้า ฝนตก → เปิดสแลน',
                correctRule: 'ถ้า แดดแรง → เปิดสแลน',
                question: 'เงื่อนไขใดควรใช้เปิดสแลน',
                choices: [
                    { id: 'A', text: 'ถ้า แดดแรง → เปิดสแลน', correct: true, feedback: 'ถูกต้อง! เมื่อแดดแรง ระบบควรกางสแลนบังแดด' },
                    { id: 'B', text: 'ถ้า ฝนตก → เปิดสแลน', correct: false, feedback: 'ลองดูว่าอะไรทำให้ผักเหี่ยวในด่านนี้' },
                    { id: 'C', text: 'ถ้า กลางคืน → เปิดสแลน', correct: false, feedback: 'ยังไม่ใช่ ตอนนี้ปัญหาเกิดจากแดดแรง' }
                ],
                farmCells: [
                    { key: 'weather', label: 'แดดแรง', icon: 'sun', state: 'warning' },
                    { key: 'crop', label: 'ผักเหี่ยว', icon: 'crop_wilted', state: 'warning' },
                    { key: 'shade', label: 'ยังไม่กาง', icon: 'shade_off', state: 'error' }
                ],
                fixedCells: [
                    { key: 'weather', label: 'แดดแรง', icon: 'sun', state: 'normal' },
                    { key: 'crop', label: 'ผักเริ่มฟื้น', icon: 'crop_ok', state: 'success' },
                    { key: 'shade', label: 'กางบังแดด', icon: 'shade_on', state: 'success' }
                ],
                resultText: 'สแลนกางขึ้น บังแดดให้ผักและลดอาการเหี่ยว',
                hints: [
                    'ดูสภาพอากาศก่อนว่าเป็นฝนหรือแดด',
                    'บั๊กอยู่ที่เงื่อนไข “ฝนตก”',
                    'ถ้าแดดแรง ระบบควรเปิดสแลน'
                ],
                knowledge: 'ต้องอ่านสถานการณ์ก่อนเลือกเงื่อนไข'
            },
            {
                id: '10-3',
                stageId: 10,
                title: 'ผลไม้สุกต้องเก็บ',
                concept: 'IF',
                mission: 'ช่วยหุ่นยนต์เก็บมะม่วงเมื่อผลไม้สุกแล้ว',
                problem: 'มะม่วงสุกแล้ว แต่หุ่นยนต์เก็บผลไม้ไม่ทำงาน',
                buggyRule: 'ถ้า ผลไม้ดิบ → เก็บผลไม้',
                correctRule: 'ถ้า ผลไม้สุก → เก็บผลไม้',
                question: 'ควรเปลี่ยนเงื่อนไขให้ตรวจอะไร',
                choices: [
                    { id: 'A', text: 'ถ้า ผลไม้สุก → เก็บผลไม้', correct: true, feedback: 'ถูกต้อง! ผลไม้สุกแล้วจึงควรเก็บลงตะกร้า' },
                    { id: 'B', text: 'ถ้า ผลไม้ดิบ → เก็บผลไม้', correct: false, feedback: 'ลองดูว่ามะม่วงในต้นเป็นผลไม้สุกหรือผลไม้ดิบ' },
                    { id: 'C', text: 'ถ้า ฝนตก → เก็บผลไม้', correct: false, feedback: 'ยังไม่ถูก ด่านนี้ไม่ได้เกี่ยวกับฝนตก' }
                ],
                farmCells: [
                    { key: 'tree', label: 'มีมะม่วงสุก', icon: 'mango_tree', state: 'warning' },
                    { key: 'robot', label: 'ไม่ทำงาน', icon: 'robot_idle', state: 'error' },
                    { key: 'basket', label: 'ว่างเปล่า', icon: 'basket_empty', state: 'warning' }
                ],
                fixedCells: [
                    { key: 'tree', label: 'มะม่วงถูกเก็บ', icon: 'mango_tree', state: 'success' },
                    { key: 'robot', label: 'ทำงาน', icon: 'robot_work', state: 'success' },
                    { key: 'basket', label: 'มีมะม่วง', icon: 'basket_full', state: 'success' }
                ],
                resultText: 'หุ่นยนต์เก็บผลไม้สุกลงตะกร้าเรียบร้อย',
                hints: [
                    'ดูว่าผลไม้บนต้นพร้อมเก็บหรือยัง',
                    'เงื่อนไขเดิมตรวจ “ผลไม้ดิบ”',
                    'เมื่อผลไม้สุก ระบบควรสั่งเก็บผลไม้'
                ],
                knowledge: 'IF ใช้ตรวจเงื่อนไขก่อนสั่งให้ระบบทำงาน'
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
