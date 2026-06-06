// Shared engine for Smart Farm Manager stages 7-9.
(function () {
    const PASS_ACTIONS = new Set(['pass', 'all_off']);
    const DROP_OFFSETS = {
        a: { x: 16, y: -118 },
        b: { x: 565, y: -116 },
        c: { x: 520, y: 118 },
        pass: { x: 20, y: 116 }
    };

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[char]));
    }

    function delay(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function findById(list, id) {
        return (list || []).find((item) => item.id === id) || null;
    }

    function labelOf(list, id, fallback = '') {
        const found = findById(list, id);
        return found ? found.label : (fallback || id || '');
    }

    function checkCondition(item, conditionId) {
        const props = item.props || item;
        switch (conditionId) {
            case 'carrot_dirty':
                return props.type === 'carrot' && props.dirty === true;
            case 'orange_big':
                return props.type === 'orange' && props.size === 'big';
            case 'mango_ripe':
                return props.type === 'mango' && props.ripeness === 'ripe';
            case 'mango_raw':
                return props.type === 'mango' && props.ripeness === 'raw';
            case 'sheep_woolly':
                return props.type === 'sheep' && props.wool === 'long';
            case 'animal_cow':
                return props.type === 'cow';
            case 'pig_under_40':
                return props.type === 'pig' && props.weight < 40;
            case 'pig_over_80':
                return props.type === 'pig' && props.weight > 80;
            case 'soil_low_moisture':
                return props.type === 'plant_pot' && props.moisture < 30;
            case 'rain':
                return props.weather === 'rain';
            case 'temp_over_35':
                return props.temperature > 35;
            case 'temp_under_15':
                return props.temperature < 15;
            case 'else':
                return true;
            default:
                return false;
        }
    }

    function evaluateRules(item, rules) {
        for (const rule of rules) {
            if (!rule || !rule.action) continue;
            if (rule.type === 'else' || rule.condition === 'else') {
                return rule.action;
            }
            if (rule.condition && checkCondition(item, rule.condition)) {
                return rule.action;
            }
        }
        return 'pass';
    }

    function buildRules(rows) {
        return rows.map((row, index) => ({
            type: row.type || (index === 0 ? 'if' : 'else_if'),
            condition: row.condition || (row.type === 'else' ? 'else' : null),
            action: row.action || null
        }));
    }

    function starsForLevel(level, stats, hintUsed) {
        const total = Math.max(1, stats.total);
        const accuracy = stats.correct / total;
        const scoring = level.scoring || {};
        if (accuracy >= (scoring.threeStarAccuracy ?? 0.95)
            && stats.damaged <= (scoring.maxDamagedForThreeStars ?? 1)
            && !hintUsed) {
            return 3;
        }
        if (accuracy >= 0.8 && stats.damaged <= 4) return 2;
        if (accuracy >= (scoring.passAccuracy ?? 0.8)) return 1;
        return 0;
    }

    function getPassState(level, stats) {
        const total = Math.max(1, stats.total);
        const accuracy = stats.correct / total;
        const scoring = level.scoring || {};
        return {
            accuracy,
            passed: accuracy >= (scoring.passAccuracy ?? 0.8)
                && stats.damaged <= (scoring.maxDamaged ?? 4)
        };
    }

    function playAudio(kind) {
        const src = kind === 'wrong' ? '../assets/sound/wrong.mp3' : '../assets/sound/correct.mp3';
        try {
            const audio = new Audio(src);
            audio.volume = kind === 'wrong' ? 0.35 : 0.42;
            audio.play().catch(() => {});
        } catch (error) {
            // Audio is only a small flourish. Browsers may block it before user interaction.
        }
    }

    function initConveyorLogic(gameConfig) {
        const container = document.getElementById('game-container');
        if (!container) return;

        const state = {
            levelIndex: 0,
            startedAt: Date.now(),
            attempts: 0,
            mistakes: 0,
            totalCorrect: 0,
            totalItems: 0,
            coins: 0,
            combo: 0,
            maxCombo: 0,
            hintUsed: false,
            selected: null,
            history: [],
            running: false,
            paused: false,
            levelStars: [],
            processedCount: 0,
            rules: []
        };

        let eventRoot = null;

        renderShell();
        bindEvents();
        loadLevel(0);

        function level() {
            return gameConfig.levels[state.levelIndex];
        }

        function renderShell() {
            container.innerHTML = `
                <div class="conveyor-shell">
                    <div class="conveyor-top">
                        <div>
                            <h3 class="conveyor-title">${escapeHtml(gameConfig.title)}</h3>
                            <p class="conveyor-subtitle">${escapeHtml(gameConfig.subtitle)}</p>
                        </div>
                        <div class="conveyor-statbar">
                            <div class="conveyor-stat">คะแนน<strong id="conveyor-score">0</strong></div>
                            <div class="conveyor-stat">Combo<strong id="conveyor-combo">x0</strong></div>
                            <div class="conveyor-stat">เหรียญ<strong id="conveyor-coins">0</strong></div>
                            <div class="conveyor-stat">สินค้า<strong id="conveyor-count">0/0</strong></div>
                            <div class="conveyor-stat">ดาว<strong id="conveyor-stars">-</strong></div>
                        </div>
                    </div>

                    <div class="conveyor-layout">
                        <section class="conveyor-panel conveyor-main">
                            <div class="conveyor-brief">
                                <div class="conveyor-level" id="conveyor-level-pill">ด่านย่อย 1 / 3</div>
                                <h4 id="conveyor-level-title">Smart Farm Manager</h4>
                                <p id="conveyor-level-brief">ตั้งกฎให้เครื่องจักรฟาร์มทำงาน</p>
                            </div>
                            <div class="farm-stage" id="farm-stage">
                                <div class="farm-skyline"></div>
                                <div class="machine output-a" id="machine-a"></div>
                                <div class="machine output-b" id="machine-b"></div>
                                <div class="machine output-c" id="machine-c"></div>
                                <div class="machine output-pass" id="machine-pass"></div>
                                <div class="scan-gate" id="scan-gate"><span class="scan-label">SCAN</span></div>
                                <div class="conveyor-belt" id="conveyor-belt"></div>
                                <div class="combo-burst" id="combo-burst">Combo!</div>
                                <div class="sensor-readout" id="sensor-readout">เลือกบล็อกแล้ววางลงช่องกฎ</div>
                                <div class="queue-strip" id="queue-strip"></div>
                            </div>
                        </section>

                        <aside class="conveyor-panel builder-panel">
                            <div class="builder-head">
                                <h4>แผงสร้างโปรแกรม</h4>
                                <span class="lesson-pill" id="lesson-pill">If</span>
                            </div>
                            <div class="rule-list" id="rule-list"></div>

                            <div class="palette-grid">
                                <section class="palette-group">
                                    <h4>บล็อกเงื่อนไข</h4>
                                    <div class="block-list" id="condition-blocks"></div>
                                </section>
                                <section class="palette-group">
                                    <h4>บล็อกคำสั่ง</h4>
                                    <div class="block-list" id="action-blocks"></div>
                                </section>
                            </div>

                            <section class="control-panel">
                                <h4>แผงควบคุม</h4>
                                <div class="control-grid">
                                    <button type="button" class="conveyor-control run" id="run-conveyor">เริ่มสายพาน</button>
                                    <button type="button" class="conveyor-control pause" id="pause-conveyor">หยุดชั่วคราว</button>
                                    <button type="button" class="conveyor-control undo" id="undo-conveyor">ย้อนกลับ</button>
                                    <button type="button" class="conveyor-control clear" id="clear-conveyor">ล้างกฎ</button>
                                    <button type="button" class="conveyor-control hint" id="hint-conveyor">คำใบ้</button>
                                </div>
                            </section>

                            <section id="conveyor-feedback" class="feedback-card">
                                <div class="feedback-title">คำแนะนำ</div>
                                <div class="feedback-body">ลากบล็อกเงื่อนไขและคำสั่งไปใส่ช่องให้ครบ</div>
                            </section>
                        </aside>
                    </div>
                </div>
            `;
            eventRoot = container.querySelector('.conveyor-shell');
        }

        function bindEvents() {
            container.addEventListener('click', (event) => {
                const block = event.target.closest('.logic-block');
                if (block) {
                    if (state.running) return;
                    state.selected = { kind: block.dataset.kind, value: block.dataset.value };
                    renderBlocks();
                    showFeedback(`เลือก "${block.textContent.trim()}" แล้ว แตะช่องที่ต้องการวาง`, 'info');
                    return;
                }

                const slot = event.target.closest('.rule-slot');
                if (slot && !slot.classList.contains('fixed')) {
                    handleSlotTap(slot);
                }
            });

            container.addEventListener('dragstart', (event) => {
                const block = event.target.closest('.logic-block');
                const row = event.target.closest('.rule-row');
                if (block) {
                    if (state.running) return event.preventDefault();
                    const payload = { kind: block.dataset.kind, value: block.dataset.value };
                    event.dataTransfer.setData('application/json', JSON.stringify(payload));
                    event.dataTransfer.effectAllowed = 'copy';
                    state.selected = payload;
                    renderBlocks();
                    return;
                }
                if (row && row.draggable) {
                    event.dataTransfer.setData('text/rule-row', row.dataset.ruleIndex);
                    row.classList.add('dragging');
                }
            });

            container.addEventListener('dragend', (event) => {
                const row = event.target.closest('.rule-row');
                if (row) row.classList.remove('dragging');
                container.querySelectorAll('.drag-over').forEach((item) => item.classList.remove('drag-over'));
            });

            container.addEventListener('dragover', (event) => {
                const slot = event.target.closest('.rule-slot');
                const row = event.target.closest('.rule-row');
                if (slot && !slot.classList.contains('fixed')) {
                    event.preventDefault();
                    slot.classList.add('drop-target');
                    return;
                }
                if (row && row.draggable && hasTransferType(event, 'text/rule-row')) {
                    event.preventDefault();
                    row.classList.add('drag-over');
                }
            });

            container.addEventListener('dragleave', (event) => {
                const slot = event.target.closest('.rule-slot');
                const row = event.target.closest('.rule-row');
                if (slot) slot.classList.remove('drop-target');
                if (row) row.classList.remove('drag-over');
            });

            container.addEventListener('drop', (event) => {
                const slot = event.target.closest('.rule-slot');
                const row = event.target.closest('.rule-row');
                if (slot && !slot.classList.contains('fixed')) {
                    event.preventDefault();
                    slot.classList.remove('drop-target');
                    try {
                        const payload = JSON.parse(event.dataTransfer.getData('application/json'));
                        applyToSlot(slot, payload);
                    } catch (error) {
                        showFeedback('วางบล็อกนี้ไม่ได้ ช่องเงื่อนไขรับเฉพาะเงื่อนไข และช่องคำสั่งรับเฉพาะคำสั่ง', 'error');
                    }
                    return;
                }
                if (row && row.draggable && hasTransferType(event, 'text/rule-row')) {
                    event.preventDefault();
                    row.classList.remove('drag-over');
                    reorderRows(Number(event.dataTransfer.getData('text/rule-row')), Number(row.dataset.ruleIndex));
                }
            });

            container.querySelector('#run-conveyor').addEventListener('click', runConveyor);
            container.querySelector('#pause-conveyor').addEventListener('click', togglePause);
            container.querySelector('#undo-conveyor').addEventListener('click', undo);
            container.querySelector('#clear-conveyor').addEventListener('click', clearRules);
            container.querySelector('#hint-conveyor').addEventListener('click', showHint);
        }

        function hasTransferType(event, type) {
            return Array.from(event.dataTransfer?.types || []).includes(type);
        }

        function loadLevel(index) {
            state.levelIndex = index;
            const current = level();
            state.rules = buildRules(current.ruleSlots || [{ type: 'if' }]);
            state.history = [];
            state.selected = null;
            state.combo = 0;
            state.processedCount = 0;
            state.paused = false;
            container.querySelector('#farm-stage').classList.toggle('greenhouse', current.theme === 'greenhouse');
            container.querySelector('#conveyor-level-pill').textContent = `ด่านย่อย ${index + 1} / ${gameConfig.levels.length}`;
            container.querySelector('#conveyor-level-title').textContent = current.title;
            container.querySelector('#conveyor-level-brief').textContent = current.brief;
            container.querySelector('#lesson-pill').textContent = current.lessonTypeLabel || current.lessonType;
            renderMachines();
            renderRules();
            renderBlocks();
            renderQueue();
            updateStats();
            setControls(false);
            showFeedback(current.intro || 'ตั้งกฎจากบนลงล่าง แล้วกดเริ่มสายพาน', 'info');
        }

        function renderMachines() {
            const current = level();
            const machines = current.machines || [];
            ['a', 'b', 'c', 'pass'].forEach((slot) => {
                const element = container.querySelector(`#machine-${slot}`);
                const machine = machines.find((item) => item.slot === slot);
                element.className = `machine output-${slot}`;
                if (!machine) {
                    element.style.display = 'none';
                    return;
                }
                element.style.display = '';
                element.innerHTML = `<span class="machine-icon">${escapeHtml(machine.icon || '📦')}</span>${escapeHtml(machine.label)}`;
            });
        }

        function renderQueue() {
            const queue = container.querySelector('#queue-strip');
            queue.innerHTML = '';
            level().itemQueue.forEach((item, index) => {
                const chip = document.createElement('span');
                chip.className = `queue-chip${index < state.processedCount ? ' done' : ''}`;
                chip.textContent = item.icon || '•';
                chip.title = item.label || item.key;
                queue.appendChild(chip);
            });
        }

        function renderRules() {
            const current = level();
            const list = container.querySelector('#rule-list');
            list.innerHTML = '';
            const canReorder = current.allowReorder !== false;
            state.rules.forEach((rule, index) => {
                const row = document.createElement('div');
                row.className = 'rule-row';
                row.dataset.ruleIndex = index;
                row.draggable = canReorder && !state.running && rule.type !== 'else';
                const label = rule.type === 'else'
                    ? 'นอกเหนือ'
                    : rule.type === 'else_if'
                        ? 'หรือถ้า'
                        : 'ถ้า';
                row.innerHTML = `
                    <div class="rule-kind">${escapeHtml(label)}</div>
                    <div class="rule-slots">
                        ${renderConditionSlot(rule, index)}
                        ${renderActionSlot(rule, index)}
                    </div>
                `;
                list.appendChild(row);
            });
        }

        function renderConditionSlot(rule, index) {
            if (rule.type === 'else') {
                return `<div class="rule-slot fixed filled" data-rule-index="${index}" data-kind="condition">กรณีอื่นทั้งหมด</div>`;
            }
            const filled = Boolean(rule.condition);
            const text = filled ? labelOf(level().conditions, rule.condition) : 'วางเงื่อนไข';
            return `<div class="rule-slot condition-slot${filled ? ' filled' : ''}" data-rule-index="${index}" data-kind="condition">${escapeHtml(text)}</div>`;
        }

        function renderActionSlot(rule, index) {
            const filled = Boolean(rule.action);
            const text = filled ? labelOf(level().actions, rule.action) : 'วางคำสั่ง';
            return `<div class="rule-slot action-slot${filled ? ' filled' : ''}" data-rule-index="${index}" data-kind="action">${escapeHtml(text)}</div>`;
        }

        function renderBlocks() {
            const conditionRoot = container.querySelector('#condition-blocks');
            const actionRoot = container.querySelector('#action-blocks');
            conditionRoot.innerHTML = '';
            actionRoot.innerHTML = '';
            level().conditions.forEach((condition) => conditionRoot.appendChild(createBlock('condition', condition)));
            level().actions.forEach((action) => actionRoot.appendChild(createBlock('action', action)));
        }

        function createBlock(kind, item) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `logic-block ${kind}${state.selected && state.selected.kind === kind && state.selected.value === item.id ? ' selected' : ''}`;
            button.draggable = !state.running;
            button.dataset.kind = kind;
            button.dataset.value = item.id;
            button.textContent = item.label;
            button.title = kind === 'condition' ? `เงื่อนไข: ${item.label}` : `คำสั่ง: ${item.label}`;
            button.disabled = state.running;
            return button;
        }

        function handleSlotTap(slot) {
            const ruleIndex = Number(slot.dataset.ruleIndex);
            const kind = slot.dataset.kind;
            if (!state.selected) {
                if (state.rules[ruleIndex][kind]) {
                    pushHistory();
                    state.rules[ruleIndex][kind] = null;
                    renderRules();
                    showFeedback('ลบบล็อกออกจากช่องแล้ว', 'info');
                    return;
                }
                showFeedback('เลือกบล็อกด้านล่างก่อน แล้วค่อยแตะช่องนี้', 'info');
                return;
            }
            applyToSlot(slot, state.selected);
        }

        function applyToSlot(slot, payload) {
            const ruleIndex = Number(slot.dataset.ruleIndex);
            const kind = slot.dataset.kind;
            if (!payload || payload.kind !== kind) {
                const target = kind === 'condition' ? 'บล็อกเงื่อนไข' : 'บล็อกคำสั่ง';
                showFeedback(`ช่องนี้ต้องใช้${target}เท่านั้น`, 'error');
                return;
            }
            pushHistory();
            state.rules[ruleIndex][kind] = payload.value;
            state.selected = null;
            renderRules();
            renderBlocks();
            showFeedback('วางบล็อกสำเร็จ กฎนี้จะถูกอ่านตามลำดับจากบนลงล่าง', 'success');
        }

        function reorderRows(from, to) {
            if (from === to || state.running) return;
            const movable = state.rules[from];
            const target = state.rules[to];
            if (!movable || !target || movable.type === 'else' || target.type === 'else') {
                showFeedback('แถว Else ต้องอยู่ท้ายสุดเสมอ', 'error');
                return;
            }
            pushHistory();
            const [row] = state.rules.splice(from, 1);
            state.rules.splice(to, 0, row);
            renderRules();
            showFeedback('สลับลำดับกฎแล้ว ระบบจะอ่านกฎบนสุดก่อน', 'info');
        }

        function pushHistory() {
            state.history.push(JSON.stringify(state.rules));
            if (state.history.length > 24) state.history.shift();
        }

        function undo() {
            if (state.running) return;
            const previous = state.history.pop();
            if (!previous) {
                showFeedback('ยังไม่มีขั้นตอนให้ย้อนกลับ', 'info');
                return;
            }
            state.rules = JSON.parse(previous);
            state.selected = null;
            renderRules();
            renderBlocks();
            showFeedback('ย้อนกลับ 1 ขั้นแล้ว', 'info');
        }

        function clearRules() {
            if (state.running) return;
            pushHistory();
            state.rules = buildRules(level().ruleSlots || [{ type: 'if' }]);
            state.selected = null;
            renderRules();
            renderBlocks();
            showFeedback('ล้างกฎแล้ว ลองวางโปรแกรมใหม่อีกครั้ง', 'info');
        }

        function showHint() {
            if (state.running) return;
            state.hintUsed = true;
            const current = level();
            const hint = current.hint || expectedText(current);
            showFeedback(hint, 'info');
            updateStats();
        }

        function expectedText(current) {
            return (current.expectedLogic || []).map((rule, index) => {
                const prefix = index === 0 ? 'ถ้า' : rule.condition === 'else' ? 'นอกเหนือจากนี้' : 'หรือถ้า';
                const condition = rule.condition === 'else' ? '' : ` ${labelOf(current.conditions, rule.condition)}`;
                return `${prefix}${condition} -> ${labelOf(current.actions, rule.action)}`;
            }).join(' | ');
        }

        function getMissingRule() {
            for (let index = 0; index < state.rules.length; index++) {
                const rule = state.rules[index];
                if (rule.type !== 'else' && !rule.condition) return 'ยังมีช่องเงื่อนไขว่างอยู่';
                if (!rule.action) return 'ยังมีช่องคำสั่งว่างอยู่';
            }
            return null;
        }

        async function runConveyor() {
            if (state.running) return;
            const missing = getMissingRule();
            if (missing) {
                showFeedback(`${missing} ลากบล็อกให้ครบก่อนเริ่มสายพาน`, 'error');
                playAudio('wrong');
                return;
            }

            state.running = true;
            state.paused = false;
            state.attempts++;
            state.combo = 0;
            state.processedCount = 0;
            setControls(true);
            updateStats();
            renderQueue();

            const current = level();
            const stats = { total: current.itemQueue.length, correct: 0, damaged: 0, coins: 0, maxCombo: 0 };
            const belt = container.querySelector('#conveyor-belt');
            belt.classList.add('running');
            showFeedback('สายพานเริ่มทำงาน เครื่องสแกนจะอ่านกฎจากบนลงล่าง', 'info');

            for (const item of current.itemQueue) {
                await waitWhilePaused();
                const outcome = await processItem(item, stats);
                if (outcome.correct) {
                    stats.correct++;
                    state.totalCorrect++;
                    state.combo++;
                    state.maxCombo = Math.max(state.maxCombo, state.combo);
                    stats.maxCombo = Math.max(stats.maxCombo, state.combo);
                    state.coins += 5;
                    stats.coins += 5;
                    if (state.combo >= 3) {
                        const bonus = state.combo % 3 === 0 ? 10 : 0;
                        if (bonus) {
                            state.coins += bonus;
                            stats.coins += bonus;
                        }
                        showCombo(state.combo, bonus);
                    }
                    playAudio('correct');
                } else {
                    stats.damaged++;
                    state.mistakes++;
                    state.combo = 0;
                    playAudio('wrong');
                }
                state.totalItems++;
                state.processedCount++;
                renderQueue();
                updateStats(stats);
                await delay(outcome.correct ? 360 : 620);
            }

            belt.classList.remove('running');
            state.running = false;
            setControls(false);
            finishLevel(stats);
        }

        async function processItem(item, stats) {
            const current = level();
            clearMachineState();
            const stage = container.querySelector('#farm-stage');
            const readout = container.querySelector('#sensor-readout');
            const scanner = container.querySelector('#scan-gate');
            const element = document.createElement('div');
            element.className = 'conveyor-item';
            element.innerHTML = `<span class="item-icon">${escapeHtml(item.icon || '📦')}</span><span class="item-name">${escapeHtml(item.label || item.key)}</span>`;
            stage.appendChild(element);
            readout.textContent = item.sensor || item.label || 'กำลังเข้าจุดสแกน';

            await delay(80);
            element.style.transform = 'translate3d(270px, 0, 0)';
            await delay(760);
            scanner.classList.add('scanning');
            readout.textContent = `สแกน: ${item.sensor || item.label}`;
            await delay(720);
            scanner.classList.remove('scanning');

            const action = evaluateRules(item, state.rules);
            const actionMeta = findById(current.actions, action) || {};
            const correct = action === item.expectedAction;
            const machine = machineForAction(current, action);
            const targetOffset = DROP_OFFSETS[machine?.slot || (PASS_ACTIONS.has(action) ? 'pass' : 'c')] || DROP_OFFSETS.c;
            const machineEl = machine ? container.querySelector(`#machine-${machine.slot}`) : container.querySelector('#machine-pass');
            if (machineEl) machineEl.classList.add(correct ? 'active' : 'error');

            readout.textContent = correct
                ? `${item.label}: ${actionMeta.successText || 'ทำงานถูกต้อง'}`
                : `${item.label}: ${item.feedback || wrongText(current, item, action)}`;
            element.style.transform = `translate3d(${targetOffset.x}px, ${targetOffset.y}px, 0)`;
            element.style.opacity = correct ? '0.98' : '0.78';
            await delay(760);
            element.remove();
            return { correct, action };
        }

        function machineForAction(current, action) {
            return (current.machines || []).find((machine) => (machine.actions || []).includes(action))
                || (current.machines || []).find((machine) => machine.slot === 'pass');
        }

        function clearMachineState() {
            container.querySelectorAll('.machine').forEach((machine) => {
                machine.classList.remove('active', 'error');
            });
        }

        function wrongText(current, item, actualAction) {
            const actual = labelOf(current.actions, actualAction, 'ปล่อยผ่าน');
            const expected = labelOf(current.actions, item.expectedAction, 'ปล่อยผ่าน');
            return `เลือก "${actual}" แต่ควรเป็น "${expected}" ลองดูเงื่อนไขของรายการนี้อีกครั้ง`;
        }

        function finishLevel(stats) {
            const current = level();
            const passState = getPassState(current, stats);
            const stars = starsForLevel(current, stats, state.hintUsed);
            const percent = Math.round(passState.accuracy * 100);

            if (passState.passed) {
                state.levelStars[state.levelIndex] = stars;
                state.coins += 20 + (stars === 3 ? 30 : 0);
                updateStats(stats);
                showFeedback(`ผ่านด่าน! ถูกต้อง ${stats.correct}/${stats.total} (${percent}%) ได้ ${'⭐'.repeat(stars) || '0 ดาว'} และ Combo สูงสุด x${stats.maxCombo}`, 'success');
                if (state.levelIndex < gameConfig.levels.length - 1) {
                    window.setTimeout(() => loadLevel(state.levelIndex + 1), 1650);
                } else {
                    window.setTimeout(showFinalResult, 1250);
                }
            } else {
                showFeedback(`ยังไม่ผ่าน: ถูกต้อง ${stats.correct}/${stats.total} (${percent}%) เสียหาย ${stats.damaged} ชิ้น ลองแก้กฎแล้วเริ่มใหม่`, 'error');
            }
        }

        function showFinalResult() {
            const duration = Math.max(1, Math.floor((Date.now() - state.startedAt) / 1000));
            const averageStars = Math.max(1, Math.round(state.levelStars.reduce((sum, item) => sum + item, 0) / state.levelStars.length));
            const overlay = document.createElement('div');
            overlay.className = 'result-overlay';
            overlay.innerHTML = `
                <div class="result-card">
                    <h3>ภารกิจฟาร์มอัจฉริยะสำเร็จ!</h3>
                    <p>คุณตั้งกฎ If / Else If / Else ควบคุมสายพานครบทุกด่านย่อยแล้ว</p>
                    <div class="result-stars">${'⭐'.repeat(averageStars)}</div>
                    <div class="result-metrics">
                        <div class="result-metric">ถูกต้อง<strong>${state.totalCorrect}/${state.totalItems}</strong></div>
                        <div class="result-metric">Combo สูงสุด<strong>x${state.maxCombo}</strong></div>
                        <div class="result-metric">เหรียญ<strong>${state.coins}</strong></div>
                    </div>
                    <p class="mt-3 mb-0">กำลังบันทึกผลลัพธ์...</p>
                </div>
            `;
            document.body.appendChild(overlay);
            window.setTimeout(() => {
                if (typeof window.sendResult === 'function') {
                    window.sendResult(window.STAGE_ID, averageStars, duration, state.attempts);
                }
            }, 1850);
        }

        function showCombo(combo, bonus) {
            const burst = container.querySelector('#combo-burst');
            burst.textContent = bonus ? `Super Farm Combo x${combo} +${bonus}` : `Combo x${combo}`;
            burst.classList.remove('show');
            void burst.offsetWidth;
            burst.classList.add('show');
        }

        function updateStats(runStats = null) {
            const score = state.totalCorrect * 100 + state.coins * 3;
            container.querySelector('#conveyor-score').textContent = String(score);
            container.querySelector('#conveyor-combo').textContent = `x${state.combo}`;
            container.querySelector('#conveyor-coins').textContent = String(state.coins);
            container.querySelector('#conveyor-count').textContent = `${state.processedCount}/${level().itemQueue.length}`;
            const stars = state.levelStars[state.levelIndex];
            container.querySelector('#conveyor-stars').textContent = stars ? '⭐'.repeat(stars) : '-';
            if (runStats) {
                const readout = container.querySelector('#sensor-readout');
                readout.textContent = `ถูก ${runStats.correct}/${runStats.total} | เสียหาย ${runStats.damaged} | Combo สูงสุด x${runStats.maxCombo}`;
            }
        }

        function setControls(running) {
            container.querySelectorAll('.logic-block').forEach((button) => { button.disabled = running; });
            container.querySelector('#run-conveyor').disabled = running;
            container.querySelector('#undo-conveyor').disabled = running;
            container.querySelector('#clear-conveyor').disabled = running;
            container.querySelector('#hint-conveyor').disabled = running;
            container.querySelector('#pause-conveyor').disabled = !running;
            renderRules();
            renderBlocks();
        }

        function togglePause() {
            if (!state.running) return;
            state.paused = !state.paused;
            container.querySelector('#pause-conveyor').textContent = state.paused ? 'เล่นต่อ' : 'หยุดชั่วคราว';
            container.querySelector('#conveyor-belt').classList.toggle('running', !state.paused);
            showFeedback(state.paused ? 'หยุดสายพานไว้ชั่วคราว' : 'เดินสายพานต่อแล้ว', 'info');
        }

        async function waitWhilePaused() {
            while (state.paused) {
                await delay(160);
            }
        }

        function showFeedback(message, type = 'info') {
            const panel = container.querySelector('#conveyor-feedback');
            panel.className = `feedback-card ${type === 'success' ? 'success' : type === 'error' ? 'error' : ''}`;
            panel.querySelector('.feedback-title').textContent = type === 'success' ? 'เยี่ยม!' : type === 'error' ? 'ลองดูอีกครั้ง' : 'คำแนะนำ';
            panel.querySelector('.feedback-body').textContent = message;
        }
    }

    window.FarmMissions = window.FarmMissions || {};
    window.FarmMissions.conveyorLogic = initConveyorLogic;
    window.FarmMissions.checkConveyorCondition = checkCondition;
    window.FarmMissions.evaluateConveyorRules = evaluateRules;
})();
