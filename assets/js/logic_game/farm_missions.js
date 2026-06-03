// Shared mini-game engine for stages 5-12.
(function () {
    const DIRS = {
        UP: { icon: '⬆️', dc: 0, dr: -1 },
        DOWN: { icon: '⬇️', dc: 0, dr: 1 },
        LEFT: { icon: '⬅️', dc: -1, dr: 0 },
        RIGHT: { icon: '➡️', dc: 1, dr: 0 }
    };

    function byId(id) {
        return document.getElementById(id);
    }

    function escapeHtml(text) {
        return String(text || '').replace(/[&<>"']/g, function (char) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
        });
    }

    function ensureAlert() {
        if (window.Swal) return Promise.resolve();
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
            script.onload = resolve;
            script.onerror = resolve;
            document.head.appendChild(script);
        });
    }

    function showMessage(options) {
        if (window.Swal) {
            return window.Swal.fire(options);
        }
        alert(options.text || options.title || '');
        return Promise.resolve();
    }

    function buildShell(theme, title, subtitle) {
        const container = byId('game-container');
        if (!container) return null;
        container.innerHTML = `
            <div class="farm-mission-shell" style="width:min(1000px, 92vw);">
                <style>
                    .farm-mission-shell * { box-sizing: border-box; }
                    .farm-mission-head { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-bottom:16px; }
                    .farm-mission-title { font-weight:800; color:#1f2937; margin:0; }
                    .farm-mission-subtitle { color:#64748b; margin:4px 0 0; }
                    .farm-mission-badge { background:${theme}; color:#fff; border-radius:999px; padding:8px 14px; font-weight:800; white-space:nowrap; }
                    .farm-game-grid { display:grid; gap:4px; background:#94a3b8; padding:4px; border-radius:16px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.5); }
                    .farm-cell { aspect-ratio:1; min-width:54px; display:flex; align-items:center; justify-content:center; background:#ecfdf5; border-radius:10px; font-size:30px; position:relative; }
                    .farm-cell.path { background:#fef3c7; }
                    .farm-cell.rock { background:#e2e8f0; }
                    .farm-cell.target { background:#dcfce7; outline:3px solid #22c55e; }
                    .farm-cell.collected { background:#dbeafe; }
                    .farm-panel { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:18px; box-shadow:0 12px 28px rgba(15,23,42,.08); }
                    .command-zone { min-height:76px; display:flex; flex-wrap:wrap; gap:8px; align-content:flex-start; background:#f8fafc; border:2px dashed #cbd5e1; border-radius:14px; padding:12px; }
                    .cmd-block { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; background:${theme}; color:#fff; font-size:22px; cursor:pointer; box-shadow:0 4px 10px rgba(15,23,42,.15); }
                    .choice-card { border:2px solid #e2e8f0; border-radius:14px; padding:14px; background:#fff; height:100%; }
                    .choice-card.correct { border-color:#22c55e; background:#f0fdf4; }
                    .choice-card.wrong { border-color:#ef4444; background:#fef2f2; }
                    .debug-row { display:flex; gap:10px; align-items:center; padding:10px; border:1px solid #e2e8f0; border-radius:12px; background:#fff; margin-bottom:8px; }
                    .debug-handle { width:36px; height:36px; border-radius:10px; border:0; background:#e0f2fe; color:#0369a1; font-weight:800; }
                    .summary-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:14px; }
                    @media (max-width: 800px) {
                        .farm-mission-head { flex-direction:column; }
                        .farm-cell { min-width:42px; font-size:24px; }
                    }
                </style>
                <div class="farm-mission-head">
                    <div>
                        <h3 class="farm-mission-title">${escapeHtml(title)}</h3>
                        <p class="farm-mission-subtitle">${escapeHtml(subtitle)}</p>
                    </div>
                    <div class="farm-mission-badge" id="mission-attempts">ลอง: 0 ครั้ง</div>
                </div>
                <div id="mission-root"></div>
            </div>
        `;
        return byId('mission-root');
    }

    function finish(stars, startedAt, attempts) {
        const duration = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
        showMessage({
            title: 'ภารกิจสำเร็จ!',
            text: `ได้ ${stars} ดาว | ใช้เวลา ${duration} วินาที | ทดลอง ${attempts} ครั้ง`,
            icon: 'success',
            confirmButtonText: 'ไปสรุปผล'
        }).then(() => {
            if (typeof window.sendResult === 'function') {
                window.sendResult(window.STAGE_ID, stars, duration, attempts);
            }
        });
    }

    function starsFromAttempts(attempts) {
        if (attempts <= 1) return 3;
        if (attempts <= 3) return 2;
        return 1;
    }

    function initSequence(config) {
        ensureAlert().then(() => {
            const startedAt = Date.now();
            let attempts = 0;
            let levelIndex = 0;
            let commands = [];
            let player = null;
            let collected = new Set();
            const root = buildShell('#2563eb', config.title, config.subtitle);
            if (!root) return;

            function level() {
                return config.levels[levelIndex];
            }

            function updateAttempts() {
                const badge = byId('mission-attempts');
                if (badge) badge.textContent = `ลอง: ${attempts} ครั้ง`;
            }

            function key(pos) {
                return `${pos.c},${pos.r}`;
            }

            function isRock(c, r) {
                return (level().rocks || []).some((rock) => rock.c === c && rock.r === r);
            }

            function drawBoard() {
                const data = level();
                player = { c: data.start.c, r: data.start.r };
                collected = new Set();
                render();
            }

            function render() {
                const data = level();
                const targets = data.targets || [data.target];
                let html = `
                    <div class="d-flex flex-column flex-lg-row gap-4 align-items-stretch">
                        <div class="farm-panel flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <strong>${escapeHtml(data.name)}</strong>
                                <span class="badge text-bg-light">${levelIndex + 1} / ${config.levels.length}</span>
                            </div>
                            <div id="farm-board" class="farm-game-grid" style="grid-template-columns:repeat(${data.cols}, minmax(42px, 1fr));">
                `;
                for (let r = 0; r < data.rows; r++) {
                    for (let c = 0; c < data.cols; c++) {
                        const posKey = `${c},${r}`;
                        let cls = 'farm-cell';
                        let text = '';
                        if (player.c === c && player.r === r) {
                            text = '🚜';
                            cls += ' path';
                        } else if (isRock(c, r)) {
                            text = data.rockIcon || '🪨';
                            cls += ' rock';
                        } else if (targets.some((target) => target.c === c && target.r === r)) {
                            text = collected.has(posKey) ? '✅' : (data.targetIcon || '🧺');
                            cls += collected.has(posKey) ? ' collected' : ' target';
                        } else if (data.finish && data.finish.c === c && data.finish.r === r) {
                            text = '🏠';
                            cls += ' target';
                        } else {
                            text = '·';
                        }
                        html += `<div class="${cls}">${text}</div>`;
                    }
                }
                html += `
                            </div>
                            <div id="sequence-feedback" class="alert alert-info mt-3 mb-0 py-2">${escapeHtml(data.goal)}</div>
                        </div>
                        <div class="farm-panel" style="width:min(360px, 100%);">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <strong>พื้นที่เรียงคำสั่ง</strong>
                                <span class="badge text-bg-secondary">${commands.length} / ${data.maxCommands}</span>
                            </div>
                            <div id="sequence-zone" class="command-zone mb-3"></div>
                            <div class="d-flex flex-wrap gap-2 mb-3">
                                ${Object.keys(DIRS).map((dir) => `<button class="btn btn-outline-primary fw-bold" data-dir="${dir}">${DIRS[dir].icon}</button>`).join('')}
                            </div>
                            <div class="d-flex gap-2">
                                <button id="clear-commands" class="btn btn-outline-danger flex-fill">ล้าง</button>
                                <button id="run-commands" class="btn btn-success flex-fill fw-bold">รันคำสั่ง</button>
                            </div>
                        </div>
                    </div>
                `;
                root.innerHTML = html;
                renderCommands();
                root.querySelectorAll('[data-dir]').forEach((btn) => {
                    btn.addEventListener('click', () => {
                        if (commands.length >= data.maxCommands) {
                            showMessage({ title: 'คำสั่งเต็มแล้ว', text: 'ลองลบคำสั่งบางตัวก่อนนะ', icon: 'warning' });
                            return;
                        }
                        commands.push(btn.dataset.dir);
                        renderCommands();
                    });
                });
                byId('clear-commands').addEventListener('click', () => {
                    commands = [];
                    drawBoard();
                });
                byId('run-commands').addEventListener('click', runCommands);
            }

            function renderCommands() {
                const zone = byId('sequence-zone');
                if (!zone) return;
                if (commands.length === 0) {
                    zone.innerHTML = '<span class="text-muted small">กดลูกศรเพื่อเพิ่มคำสั่ง แล้วกดรัน</span>';
                    return;
                }
                zone.innerHTML = commands.map((cmd, index) => `<button class="cmd-block" data-remove="${index}" title="คลิกเพื่อลบ">${DIRS[cmd].icon}</button>`).join('');
                zone.querySelectorAll('[data-remove]').forEach((btn) => {
                    btn.addEventListener('click', () => {
                        commands.splice(Number(btn.dataset.remove), 1);
                        renderCommands();
                    });
                });
            }

            async function runCommands() {
                if (commands.length === 0) {
                    showMessage({ title: 'ยังไม่มีคำสั่ง', text: 'ลองเรียงลูกศรก่อนรันนะ', icon: 'info' });
                    return;
                }
                attempts++;
                updateAttempts();
                const data = level();
                player = { c: data.start.c, r: data.start.r };
                collected = new Set();
                for (const cmd of commands) {
                    const dir = DIRS[cmd];
                    const next = { c: player.c + dir.dc, r: player.r + dir.dr };
                    if (next.c < 0 || next.r < 0 || next.c >= data.cols || next.r >= data.rows) {
                        render();
                        byId('sequence-feedback').className = 'alert alert-danger mt-3 mb-0 py-2';
                        byId('sequence-feedback').textContent = 'รถไถตกขอบแปลง ลองนับช่องใหม่อีกครั้ง';
                        return;
                    }
                    if (isRock(next.c, next.r)) {
                        render();
                        byId('sequence-feedback').className = 'alert alert-danger mt-3 mb-0 py-2';
                        byId('sequence-feedback').textContent = data.crashFeedback || 'รถไถชนสิ่งกีดขวาง ลองเลี้ยวหลบก่อนเดินต่อ';
                        return;
                    }
                    player = next;
                    const targetHit = (data.targets || []).find((target) => target.c === player.c && target.r === player.r);
                    if (targetHit) collected.add(key(targetHit));
                    render();
                    await new Promise((resolve) => setTimeout(resolve, 220));
                }
                const allCollected = !data.targets || data.targets.every((target) => collected.has(key(target)));
                const destination = data.finish || data.target || (data.targets || [])[0];
                const atDestination = destination && player.c === destination.c && player.r === destination.r;
                if (allCollected && atDestination) {
                    if (levelIndex < config.levels.length - 1) {
                        showMessage({ title: 'ผ่านด่านย่อยแล้ว!', text: 'ลำดับคำสั่งถูกต้อง ไปต่อกันเลย', icon: 'success' }).then(() => {
                            levelIndex++;
                            commands = [];
                            drawBoard();
                        });
                    } else {
                        finish(starsFromAttempts(attempts), startedAt, attempts);
                    }
                } else {
                    const feedback = !allCollected ? 'คำสั่งถูกบางส่วนแล้ว แต่ยังเก็บผลผลิตไม่ครบ' : 'รถไถยังไม่หยุดที่เป้าหมาย ลองตรวจลำดับคำสั่งอีกครั้ง';
                    byId('sequence-feedback').className = 'alert alert-warning mt-3 mb-0 py-2';
                    byId('sequence-feedback').textContent = feedback;
                }
            }

            drawBoard();
        });
    }

    function initCondition(config) {
        ensureAlert().then(() => {
            const startedAt = Date.now();
            let attempts = 0;
            const root = buildShell('#0891b2', config.title, config.subtitle);
            if (!root) return;
            root.innerHTML = `
                <div class="farm-panel">
                    <div class="row g-3" id="scenario-list"></div>
                    <div class="d-flex justify-content-end gap-2 mt-4">
                        <button id="hint-btn" class="btn btn-outline-secondary">คำใบ้</button>
                        <button id="check-conditions" class="btn btn-info text-white fw-bold">ทดสอบระบบ</button>
                    </div>
                </div>
            `;
            const list = byId('scenario-list');
            list.innerHTML = config.scenarios.map((scenario, index) => `
                <div class="col-md-${config.scenarios.length > 2 ? '4' : '6'}">
                    <div class="choice-card h-100" id="scenario-${index}">
                        <h5 class="fw-bold">${escapeHtml(scenario.icon)} ${escapeHtml(scenario.name)}</h5>
                        <p class="text-secondary small">${escapeHtml(scenario.status)}</p>
                        <select class="form-select" data-answer="${index}">
                            <option value="">เลือกคำสั่ง...</option>
                            ${config.actions.map((action) => `<option value="${escapeHtml(action.value)}">${escapeHtml(action.label)}</option>`).join('')}
                        </select>
                        <div class="small text-muted mt-2">${escapeHtml(scenario.prompt)}</div>
                    </div>
                </div>
            `).join('');
            byId('hint-btn').addEventListener('click', () => {
                attempts++;
                const badge = byId('mission-attempts');
                if (badge) badge.textContent = `ลอง: ${attempts} ครั้ง`;
                showMessage({ title: 'คำใบ้', text: config.hint, icon: 'info' });
            });
            byId('check-conditions').addEventListener('click', () => {
                attempts++;
                const badge = byId('mission-attempts');
                if (badge) badge.textContent = `ลอง: ${attempts} ครั้ง`;
                let allCorrect = true;
                config.scenarios.forEach((scenario, index) => {
                    const card = byId(`scenario-${index}`);
                    const selected = root.querySelector(`[data-answer="${index}"]`).value;
                    card.classList.remove('correct', 'wrong');
                    if (selected === scenario.answer) {
                        card.classList.add('correct');
                    } else {
                        card.classList.add('wrong');
                        allCorrect = false;
                    }
                });
                if (allCorrect) {
                    finish(starsFromAttempts(attempts), startedAt, attempts);
                } else {
                    showMessage({
                        title: 'ระบบยังตัดสินใจไม่ครบ',
                        text: config.feedback,
                        icon: 'warning',
                        confirmButtonText: 'ปรับเงื่อนไข'
                    });
                }
            });
        });
    }

    function initDebug(config) {
        ensureAlert().then(() => {
            const startedAt = Date.now();
            let attempts = 0;
            let rows = config.rows.map((row) => ({ ...row }));
            const root = buildShell('#d97706', config.title, config.subtitle);
            if (!root) return;

            function render() {
                root.innerHTML = `
                    <div class="farm-panel">
                        <div class="alert alert-warning border-0">${escapeHtml(config.problem)}</div>
                        <div id="debug-list"></div>
                        <div class="d-flex flex-wrap justify-content-between gap-2 mt-4">
                            <button id="hint-btn" class="btn btn-outline-secondary">คำใบ้</button>
                            <button id="check-debug" class="btn btn-warning fw-bold text-dark">ทดสอบหลังแก้บั๊ก</button>
                        </div>
                    </div>
                `;
                const list = byId('debug-list');
                list.innerHTML = rows.map((row, index) => `
                    <div class="debug-row">
                        <div class="d-flex flex-column gap-1">
                            <button class="debug-handle" data-up="${index}" ${index === 0 ? 'disabled' : ''}>↑</button>
                            <button class="debug-handle" data-down="${index}" ${index === rows.length - 1 ? 'disabled' : ''}>↓</button>
                        </div>
                        <div class="flex-grow-1">
                            <label class="small text-muted">${escapeHtml(row.label || `ขั้นตอนที่ ${index + 1}`)}</label>
                            ${row.options ? `<select class="form-select" data-edit="${index}">${row.options.map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === row.value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select>` : `<div class="fw-bold">${escapeHtml(row.value)}</div>`}
                        </div>
                    </div>
                `).join('');
                list.querySelectorAll('[data-up]').forEach((btn) => {
                    btn.addEventListener('click', () => moveRow(Number(btn.dataset.up), -1));
                });
                list.querySelectorAll('[data-down]').forEach((btn) => {
                    btn.addEventListener('click', () => moveRow(Number(btn.dataset.down), 1));
                });
                list.querySelectorAll('[data-edit]').forEach((select) => {
                    select.addEventListener('change', () => {
                        rows[Number(select.dataset.edit)].value = select.value;
                    });
                });
                byId('hint-btn').addEventListener('click', () => {
                    attempts++;
                    updateAttempts();
                    showMessage({ title: 'คำใบ้', text: config.hint, icon: 'info' });
                });
                byId('check-debug').addEventListener('click', check);
            }

            function updateAttempts() {
                const badge = byId('mission-attempts');
                if (badge) badge.textContent = `ลอง: ${attempts} ครั้ง`;
            }

            function moveRow(index, offset) {
                const nextIndex = index + offset;
                const temp = rows[index];
                rows[index] = rows[nextIndex];
                rows[nextIndex] = temp;
                render();
            }

            function check() {
                attempts++;
                updateAttempts();
                const values = rows.map((row) => row.value);
                const correct = values.length === config.solution.length && values.every((value, index) => value === config.solution[index]);
                if (correct) {
                    finish(starsFromAttempts(attempts), startedAt, attempts);
                } else {
                    showMessage({ title: 'ยังมีบั๊กอยู่', text: config.feedback, icon: 'warning' });
                }
            }

            render();
        });
    }

    window.FarmMissions = {
        sequence: initSequence,
        condition: initCondition,
        debug: initDebug
    };
})();
