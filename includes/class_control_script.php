<div id="pause-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 9999; justify-content: center; align-items: center; flex-direction: column; text-align: center; color: white;">
    <div style="font-size: 5rem; animation: pulse 1.5s infinite;">🛑</div>
    <h1 style="font-size: 3rem; margin-top: 20px; font-weight: bold;">ครูสั่งหยุดเกมชั่วคราว</h1>
    <p style="font-size: 1.5rem; color: #ccc;">วางเมาส์ แล้วฟังคุณครูอธิบายก่อนนะครับ...</p>
</div>

<style>
@keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
}
</style>

<script>
// Heartbeat Script: เช็คสถานะทุก 3 วินาที
setInterval(() => {
    fetch('../api/heartbeat.php')
    .then(res => res.json())
    .then(data => {
        const overlay = document.getElementById('pause-overlay');
        
        if (data.class_status === 'paused') {
            // ถ้าครูสั่ง Pause -> แสดง Overlay, ปิดเสียงเกม (ถ้าทำได้)
            overlay.style.display = 'flex';
            if(window.game && window.game.sound) window.game.sound.mute = true;
        } else {
            // ถ้า Active -> ซ่อน Overlay
            overlay.style.display = 'none';
            if(window.game && window.game.sound) window.game.sound.mute = false;
        }
    })
    .catch(err => console.error("Connection Lost"));
}, 3000);
</script>