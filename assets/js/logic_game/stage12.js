// Stage 12: วิกฤตน้ำท่วมฟาร์ม
(function () {
    const options = [
        { value: 'rain_stop', label: 'ถ้าฝนตก -> หยุดรดน้ำ' },
        { value: 'dry_water', label: 'มิฉะนั้น ถ้าดินแห้ง -> รดน้ำ' },
        { value: 'wet_stop', label: 'มิฉะนั้น -> ไม่ต้องรดน้ำ' },
        { value: 'rain_water', label: 'ถ้าฝนตก -> รดน้ำ' }
    ];
    const config = {
        title: 'ด่าน 12: วิกฤตน้ำท่วมฟาร์ม',
        subtitle: 'แก้บั๊กเงื่อนไขรดน้ำอัตโนมัติ เพื่อหยุดน้ำท่วมแปลงผัก',
        problem: 'ระบบเดิมตรวจดินก่อนฝน ทำให้ยังรดน้ำตอนฝนตกอยู่ ให้จัดลำดับและเปลี่ยนเงื่อนไขให้ปลอดภัย',
        hint: 'ตรวจฝนตกเป็นเงื่อนไขแรก แล้วค่อยตรวจดินแห้งเมื่อไม่มีฝน',
        feedback: 'เงื่อนไขนี้ควรตรวจฝนก่อนเปิดน้ำ และต้องมีกรณีมิฉะนั้นเมื่อดินชื้น',
        rows: [
            { label: 'กฎที่ 1', value: 'dry_water', options },
            { label: 'กฎที่ 2', value: 'rain_water', options },
            { label: 'กฎที่ 3', value: 'wet_stop', options }
        ],
        solution: ['rain_stop', 'dry_water', 'wet_stop']
    };

    function boot() {
        window.FarmMissions.debug(config);
    }

    if (window.FarmMissions) {
        boot();
    } else {
        const script = document.createElement('script');
        script.src = '../assets/js/logic_game/farm_missions.js';
        script.onload = boot;
        document.head.appendChild(script);
    }
})();
