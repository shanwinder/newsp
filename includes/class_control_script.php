<div id="pause-overlay" class="class-control-overlay" role="status" aria-live="assertive">
    <div class="class-control-stop-icon" aria-hidden="true">🛑</div>
    <h1 class="class-control-title">ครูสั่งหยุดเกมชั่วคราว</h1>
    <p class="class-control-message">วางเมาส์ แล้วฟังคุณครูอธิบายก่อนนะครับ...</p>
</div>

<script>
// Heartbeat Script: เช็คสถานะทุก 3 วินาที
setInterval(() => {
    fetch('../api/heartbeat.php')
    .then(res => res.json())
    .then(data => {
        const overlay = document.getElementById('pause-overlay');

        if (data.class_status === 'paused') {
            // ถ้าครูสั่ง Pause -> แสดง Overlay, ปิดเสียงเกม (ถ้าทำได้)
            overlay.classList.add('is-visible');
            if(window.game && window.game.sound) window.game.sound.mute = true;
        } else {
            // ถ้า Active -> ซ่อน Overlay
            overlay.classList.remove('is-visible');
            if(window.game && window.game.sound) window.game.sound.mute = false;
        }
    })
    .catch(err => console.error("Connection Lost"));
}, 3000);
</script>
