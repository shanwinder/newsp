// Shared engine for Smart Farm Manager stages 7-9.
(function () {
    const SCAN_DELAY_MS = 420;

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

    function findById(list, id) {
        return (list || []).find((item) => item.id === id) || null;
    }

    function labelOf(list, id, fallback = '') {
        const found = findById(list, id);
        return found ? found.label : (fallback || id || '');
    }

    function playAudio(kind) {
        const src = kind === 'wrong' ? '../assets/sound/wrong.mp3' : '../assets/sound/correct.mp3';
        try {
            const audio = new Audio(src);
            audio.volume = kind === 'wrong' ? 0.35 : 0.42;
            audio.play().catch(() => {});
        } catch (error) {
            // Browser autoplay rules may block this flourish before interaction.
        }
    }

    function createPredicate(condition) {
        if (!condition) return () => false;
        if (typeof condition.test === 'function') {
            return (props, item) => Boolean(condition.test(props, item));
        }
        if (condition.match && typeof condition.match === 'object') {
            return (props) => Object.entries(condition.match).every(([key, value]) => props[key] === value);
        }
        if (condition.compare) {
            const { key, op, value } = condition.compare;
            return (props) => {
                const actual = props[key];
                if (op === '<') return actual < value;
                if (op === '<=') return actual <= value;
                if (op === '>') return actual > value;
                if (op === '>=') return actual >= value;
                if (op === '!=') return actual !== value;
                return actual === value;
            };
        }
        return () => false;
    }

    function checkCondition(item, conditionId, conditions = []) {
        if (conditionId === 'else') return true;
        const condition = findById(conditions, conditionId);
        return createPredicate(condition)(item.props || {}, item);
    }

    function defaultPassAction(config = {}) {
        return config.defaultBehavior?.type || config.defaultBehavior?.id || 'pass_through';
    }

    function isIfOnly(config = {}) {
        return config.logicType === 'if' || config.mode === 'single_action_if' || config.lessonType === 'if';
    }

    function normalizeAction(action, config = {}) {
        if (isIfOnly(config) && action === 'pass') return defaultPassAction(config);
        return action;
    }

    function expectedActionFor(item, config = {}) {
        return normalizeAction(item.correctResult || item.expectedAction || defaultPassAction(config), config);
    }

    function evaluateRules(item, rules, conditions = [], config = {}) {
        if (isIfOnly(config)) {
            const rule = (rules || []).find((entry) => entry && entry.type === 'if');
            if (!rule || !rule.condition || !rule.action) return defaultPassAction(config);
            return checkCondition(item, rule.condition, conditions)
                ? normalizeAction(rule.action, config)
                : defaultPassAction(config);
        }

        for (const rule of rules || []) {
            if (!rule || !rule.action) continue;
            if (rule.type === 'else' || rule.condition === 'else') return rule.action;
            if (rule.condition && checkCondition(item, rule.condition, conditions)) return rule.action;
        }
        return 'pass';
    }

    function getPassState(level, stats) {
        const total = Math.max(1, stats.total);
        const accuracy = stats.correct / total;
        const scoring = level.scoring || {};
        return {
            accuracy,
            passed: accuracy >= (scoring.passAccuracy ?? 0.6)
                && stats.damaged <= (scoring.maxDamaged ?? Number.POSITIVE_INFINITY)
        };
    }

    function starsForLevel(level, stats) {
        const total = Math.max(1, stats.total);
        const accuracy = stats.correct / total;
        const scoring = level.scoring || {};
        if (accuracy >= (scoring.threeStarAccuracy ?? 0.9) && stats.damaged <= (scoring.maxDamagedForThreeStars ?? 1)) return 3;
        if (accuracy >= (scoring.twoStarAccuracy ?? 0.75)) return 2;
        if (accuracy >= (scoring.oneStarAccuracy ?? 0.6)) return 1;
        return 0;
    }

    function initConveyorLogic(gameConfig) {
        const container = document.getElementById('game-container');
        if (!container) return;
        if (!window.FarmMissions?.DragDropManager) {
            throw new Error('Smart Farm Manager requires conveyor_drag_drop.js before conveyor_logic_base.js');
        }

        const state = {
            levelIndex: 0,
            startedAt: Date.now(),
            attempts: 0,
            totalCorrect: 0,
            totalItems: 0,
            totalDamaged: 0,
            processedCount: 0,
            running: false,
            paused: false,
            rules: [],
            levelStars: [],
            selectedInspectItemId: null
        };

        let eventRoot = null;
        let dragDrop = null;

        renderShell();
        bindControls();
        loadLevel(0);

        function level() {
            return gameConfig.levels[state.levelIndex];
        }

        function renderShell() {
            container.innerHTML = `
                <div class="conveyor-shell">
                    <header class="conveyor-top">
                        <div>
                            <h3 class="conveyor-title">${escapeHtml(gameConfig.title)}</h3>
                            <p class="conveyor-subtitle">${escapeHtml(gameConfig.subtitle)}</p>
                        </div>
                        <section class="conveyor-statbar">
                            <div class="conveyor-stat">รายการ<strong id="conveyor-count">0/0</strong></div>
                            <div class="conveyor-stat">ถูกต้อง<strong id="conveyor-correct">0</strong></div>
                            <div class="conveyor-stat">ผิดพลาด<strong id="conveyor-wrong">0</strong></div>
                            <div class="conveyor-stat">เสียหาย<strong id="conveyor-damaged">0</strong></div>
                            <div class="conveyor-stat">ดาว<strong id="conveyor-stars">-</strong></div>
                        </section>
                    </header>

                    <div class="smart-farm-shell">
                        <section class="mission-card">
                            <div class="conveyor-level" id="conveyor-level-pill">ด่านย่อย 1 / 3</div>
                            <h4 id="mission-title">Smart Farm Manager</h4>
                            <dl class="mission-list">
                                <div><dt>เป้าหมาย</dt><dd id="mission-goal">ตั้งกฎควบคุมฟาร์ม</dd></div>
                                <div><dt>ตรรกะที่ใช้</dt><dd id="mission-logic">If</dd></div>
                                <div><dt>รายการทั้งหมด</dt><dd id="mission-total">0 ชิ้น</dd></div>
                            </dl>
                        </section>

                        <section class="conveyor-panel board-panel">
                            <div class="board-status">
                                <div class="status-label">สถานะสายพาน</div>
                                <div class="sensor-readout" id="sensor-readout">ลากบล็อกเพื่อสร้างกฎ แล้วเริ่มสายพาน</div>
                            </div>
                            <div class="farm-stage" id="farm-stage">
                                <div class="farm-skyline"></div>
                                <div class="machine output-a" id="machine-a"></div>
                                <div class="machine output-b" id="machine-b"></div>
                                <div class="machine output-c" id="machine-c"></div>
                                <div class="machine output-pass" id="machine-pass"></div>
                                <div class="scan-gate" id="scan-gate"><span class="scan-label">SCAN</span></div>
                                <div class="conveyor-belt" id="conveyor-belt"></div>
                            </div>
                            <div class="item-tray" id="queue-strip" aria-label="รายการวัตถุในรอบนี้"></div>
                        </section>

                        <aside class="conveyor-panel side-panel">
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
                            <section class="item-inspector" id="item-inspector" aria-live="polite">
                                <h4>รายละเอียดวัตถุ</h4>
                                <div class="inspector-content">คลิกรายการในแถบวัตถุเพื่อดูคุณสมบัติก่อนเริ่มสายพาน</div>
                            </section>
                        </aside>

                        <section class="conveyor-panel program-panel">
                            <div class="program-head">
                                <div>
                                    <h4>Program Builder</h4>
                                    <p id="program-subtitle">วางกฎให้ระบบอ่านจากบนลงล่าง</p>
                                </div>
                                <div class="block-trash" id="block-trash">ลากบล็อกที่วางแล้วมาที่นี่เพื่อลบ</div>
                            </div>
                            <div class="rule-list" id="rule-list"></div>
                        </section>

                        <section class="conveyor-panel toolbox-panel">
                            <div class="toolbox-head">
                                <h4>Rule Toolbox</h4>
                                <span class="lesson-pill" id="lesson-pill">If</span>
                            </div>
                            <section class="palette-group">
                                <h4>บล็อกเงื่อนไข</h4>
                                <div class="block-list" id="condition-blocks"></div>
                            </section>
                            <section class="palette-group">
                                <h4>บล็อกคำสั่ง</h4>
                                <div class="block-list" id="action-blocks"></div>
                            </section>
                        </section>
                    </div>
                </div>
            `;
            eventRoot = container.querySelector('.conveyor-shell');
            dragDrop = new window.FarmMissions.DragDropManager({
                rootElement: eventRoot,
                rulePanel: container.querySelector('#rule-list'),
                conditionContainer: container.querySelector('#condition-blocks'),
                actionContainer: container.querySelector('#action-blocks'),
                trashElement: container.querySelector('#block-trash'),
                previewElement: null,
                onRulesChanged: (rules) => { state.rules = rules; },
                onFeedback: showFeedback
            });
        }

        function bindControls() {
            container.querySelector('#run-conveyor').addEventListener('click', runConveyor);
            container.querySelector('#pause-conveyor').addEventListener('click', togglePause);
            container.querySelector('#undo-conveyor').addEventListener('click', () => {
                if (!dragDrop.undo()) showFeedback('ยังไม่มีขั้นตอนให้ย้อนกลับ', 'info');
            });
            container.querySelector('#clear-conveyor').addEventListener('click', () => {
                dragDrop.clear();
                showFeedback('ล้างกฎแล้ว ลองวางโปรแกรมใหม่อีกครั้ง', 'info');
            });
            container.querySelector('#hint-conveyor').addEventListener('click', showHint);
            container.querySelector('#queue-strip').addEventListener('click', (event) => {
                const itemButton = event.target.closest('.tray-item');
                if (!itemButton) return;
                state.selectedInspectItemId = itemButton.dataset.itemId;
                renderQueue();
                renderInspector();
            });
        }

        function loadLevel(index) {
            state.levelIndex = index;
            state.processedCount = 0;
            state.paused = false;
            state.selectedInspectItemId = null;
            const current = level();
            container.querySelector('#farm-stage').classList.toggle('greenhouse', current.theme === 'greenhouse');
            container.querySelector('#conveyor-level-pill').textContent = `ด่านย่อย ${index + 1} / ${gameConfig.levels.length}`;
            container.querySelector('#mission-title').textContent = current.title;
            container.querySelector('#mission-goal').textContent = current.mission || current.brief;
            container.querySelector('#mission-logic').textContent = current.lessonTypeLabel || current.lessonType;
            container.querySelector('#mission-total').textContent = `${current.itemQueue.length} ชิ้น`;
            container.querySelector('#lesson-pill').textContent = current.lessonTypeLabel || current.lessonType;
            container.querySelector('#program-subtitle').textContent = isIfOnly(current)
                ? 'วางกฎ If เพียง 1 แถว วัตถุอื่นปล่อยผ่านอัตโนมัติ'
                : (current.allowReorder
                    ? 'ลากแถว If / Else If เพื่อสลับลำดับได้'
                    : 'วางกฎให้ครบก่อนเริ่มสายพาน');
            dragDrop.loadLevel({
                ruleSlots: current.ruleSlots,
                conditions: [
                    ...(current.conditions || []),
                    ...(current.toolboxDecoys?.conditions || [])
                ],
                actions: [
                    ...(current.actions || []),
                    ...(current.toolboxDecoys?.actions || [])
                ].filter((action) => !action.internal),
                allowReorder: current.allowReorder
            });
            renderMachines();
            renderQueue();
            renderInspector();
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
                element.innerHTML = `<span class="machine-icon">${escapeHtml(machine.icon || '□')}</span>${escapeHtml(machine.label)}`;
            });
            let passNote = container.querySelector('#pass-through-note');
            if (isIfOnly(current)) {
                if (!passNote) {
                    passNote = document.createElement('div');
                    passNote.id = 'pass-through-note';
                    passNote.className = 'pass-through-note';
                    container.querySelector('#farm-stage').appendChild(passNote);
                }
                passNote.textContent = current.defaultBehavior?.label || 'ไม่เข้าเงื่อนไข: ปล่อยผ่านอัตโนมัติ';
                passNote.style.display = '';
            } else if (passNote) {
                passNote.style.display = 'none';
            }
        }

        function renderQueue() {
            const queue = container.querySelector('#queue-strip');
            queue.innerHTML = '';
            level().itemQueue.forEach((item, index) => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = `tray-item${index < state.processedCount ? ' done' : ''}${item.id === state.selectedInspectItemId ? ' selected' : ''}`;
                chip.dataset.itemId = item.id;
                chip.innerHTML = `
                    <span class="tray-icon">${escapeHtml(item.fallbackIcon || item.icon || '•')}</span>
                    <span class="tray-label">${escapeHtml(item.label || item.key)}</span>
                `;
                chip.title = item.inspect?.title || item.label || item.key;
                queue.appendChild(chip);
            });
        }

        function renderInspector() {
            const panel = container.querySelector('#item-inspector');
            const content = panel.querySelector('.inspector-content');
            const items = level().itemQueue || [];
            const item = findById(items, state.selectedInspectItemId);
            if (!item) {
                content.innerHTML = 'คลิกรายการในแถบวัตถุเพื่อดูคุณสมบัติก่อนเริ่มสายพาน';
                panel.classList.remove('has-decoy');
                return;
            }

            const inspect = item.inspect || {};
            const properties = inspect.properties || inferProperties(item.props || {});
            const warning = inspect.warning || (item.isDecoy ? 'ตัวหลอก: สังเกตเงื่อนไขให้ละเอียดก่อนเลือกเส้นทาง' : '');
            panel.classList.toggle('has-decoy', Boolean(item.isDecoy));
            content.innerHTML = `
                <div class="inspector-title-row">
                    <span class="inspector-icon">${escapeHtml(item.fallbackIcon || item.icon || '•')}</span>
                    <strong>${escapeHtml(inspect.title || item.label || item.key)}</strong>
                </div>
                <ul class="inspector-props">
                    ${properties.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}
                </ul>
                ${inspect.hint ? `<div class="inspector-hint">${escapeHtml(inspect.hint)}</div>` : ''}
                ${warning ? `<div class="inspector-warning">${escapeHtml(warning)}</div>` : ''}
            `;
        }

        function inferProperties(props) {
            const entries = Object.entries(props || {});
            if (!entries.length) return ['ยังไม่มีข้อมูลคุณสมบัติเพิ่มเติม'];
            return entries.map(([key, value]) => `${key}: ${value}`);
        }

        function showHint() {
            if (state.running) return;
            showFeedback(level().hint || expectedText(level()), 'info');
        }

        function expectedText(current) {
            return (current.expectedLogic || []).map((rule, index) => {
                const prefix = index === 0 ? 'ถ้า' : rule.condition === 'else' ? 'นอกเหนือจากนี้' : 'หรือถ้า';
                const condition = rule.condition === 'else' ? '' : ` ${labelOf(current.conditions, rule.condition)}`;
                return `${prefix}${condition} -> ${labelOf(current.actions, rule.action)}`;
            }).join(' | ');
        }

        async function runConveyor() {
            if (state.running) return;
            const missing = dragDrop.validateRules();
            if (missing) {
                showFeedback(`${missing} ลากบล็อกให้ครบก่อนเริ่มสายพาน`, 'error');
                playAudio('wrong');
                return;
            }

            state.running = true;
            state.paused = false;
            state.attempts++;
            state.processedCount = 0;
            setControls(true);
            renderQueue();
            updateStats();

            const current = level();
            const stats = { total: current.itemQueue.length, correct: 0, damaged: 0 };
            container.querySelector('#conveyor-belt').classList.add('running');
            showFeedback('สายพานเริ่มทำงาน เครื่องสแกนจะอ่านกฎจากบนลงล่าง', 'info');

            for (const item of current.itemQueue) {
                await waitWhilePaused();
                const outcome = await processItem(item);
                if (outcome.correct) {
                    stats.correct++;
                    state.totalCorrect++;
                    playAudio('correct');
                } else {
                    stats.damaged++;
                    state.totalDamaged++;
                    playAudio('wrong');
                }
                state.totalItems++;
                state.processedCount++;
                renderQueue();
                updateStats(stats);
                await delay(outcome.correct ? 320 : 580);
            }

            container.querySelector('#conveyor-belt').classList.remove('running');
            state.running = false;
            setControls(false);
            finishLevel(stats);
        }

        async function processItem(item) {
            const current = level();
            clearMachineState();
            const stage = container.querySelector('#farm-stage');
            const readout = container.querySelector('#sensor-readout');
            const scanner = container.querySelector('#scan-gate');
            const element = document.createElement('div');
            element.className = 'conveyor-item';
            element.innerHTML = `${renderItemVisual(item)}<span class="item-name">${escapeHtml(item.label || item.key)}</span>`;
            stage.appendChild(element);

            const path = getStagePath(stage, scanner, element);
            moveItemTo(element, path.start.x, path.start.y, 0);
            readout.textContent = item.sensor || item.label || 'กำลังเข้าจุดสแกน';

            await delay(80);
            await moveItemTo(element, path.scan.x, path.scan.y, 520);

            // SCAN ALIGNMENT NOTE:
            // ก่อนตรวจเงื่อนไข ต้องจัดตำแหน่งวัตถุให้ตรงกลางเครื่องสแกนเสมอ
            // เพื่อป้องกัน sprite/ภาพ fallback คลาดเคลื่อนหรือดูเหมือนยังไม่เข้าเครื่องสแกน
            scanner.classList.add('scanning');
            readout.textContent = `สแกน: ${item.sensor || item.label}`;
            await delay(SCAN_DELAY_MS);
            scanner.classList.remove('scanning');

            const action = normalizeAction(evaluateRules(item, state.rules, current.conditions, current), current);
            const actionMeta = findById(current.actions, action)
                || findById(current.toolboxDecoys?.actions, action)
                || current.defaultBehavior
                || {};
            const correct = action === expectedActionFor(item, current);
            const machine = machineForAction(current, action);
            const machineEl = machine ? container.querySelector(`#machine-${machine.slot}`) : null;
            if (machineEl) machineEl.classList.add(correct ? 'active' : 'error');

            readout.textContent = correct
                ? `${item.label}: ${actionMeta.successText || 'ทำงานถูกต้อง'}`
                : `${item.label}: ${wrongFeedback(current, item, action)}`;

            const target = machineEl ? centerOf(stage, machineEl) : path.pass;
            await moveItemTo(element, target.x, target.y, 620);
            element.style.opacity = correct ? '0.98' : '0.74';
            await delay(180);
            element.remove();
            return { correct, action };
        }

        function renderItemVisual(item) {
            // ASSET NOTE:
            // ตอนนี้ระบบใช้ fallbackIcon เพื่อให้ prototype ทำงานได้ทันที
            // ในอนาคตสามารถเปลี่ยนเป็น PNG หรือ Sprite Sheet ได้โดยแก้เฉพาะ levelConfig.asset
            // ห้ามผูก logic กับ emoji โดยตรง เพราะ emoji เป็นเพียง fallback ด้านการแสดงผล
            // Logic ต้องอ่านจาก props เท่านั้น เช่น type, dirty, size, ripeness, weight, shell, temperature
            if (item.asset?.path && item.asset?.ready === true) {
                return `<img class="item-asset" src="${escapeHtml(item.asset.path)}" alt="${escapeHtml(item.asset.description || item.label || '')}">`;
            }
            return `<span class="item-icon">${escapeHtml(item.fallbackIcon || item.icon || '□')}</span>`;
        }

        function getStagePath(stage, scanner, element) {
            const stageRect = stage.getBoundingClientRect();
            const scannerCenter = centerOf(stage, scanner);
            const belt = container.querySelector('#conveyor-belt');
            const beltRect = belt.getBoundingClientRect();
            const y = beltRect.top - stageRect.top + (beltRect.height / 2);
            const itemWidth = element.offsetWidth || 86;
            return {
                start: { x: itemWidth / 2 + 16, y },
                scan: { x: scannerCenter.x, y },
                pass: { x: stageRect.width - itemWidth, y },
            };
        }

        function centerOf(stage, element) {
            const stageRect = stage.getBoundingClientRect();
            const rect = element.getBoundingClientRect();
            return {
                x: rect.left - stageRect.left + (rect.width / 2),
                y: rect.top - stageRect.top + (rect.height / 2)
            };
        }

        function moveItemTo(element, x, y, duration) {
            return new Promise((resolve) => {
                element.style.transitionDuration = `${duration}ms`;
                element.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%, -50%)`;
                window.setTimeout(resolve, Math.max(0, duration));
            });
        }

        function machineForAction(current, action) {
            if (normalizeAction(action, current) === defaultPassAction(current)) return null;
            const actionMeta = findById(current.actions, action)
                || findById(current.toolboxDecoys?.actions, action);
            if (actionMeta?.routeSlot) {
                return (current.machines || []).find((machine) => machine.slot === actionMeta.routeSlot);
            }
            return (current.machines || []).find((machine) => (machine.actions || []).includes(action))
                || (current.machines || []).find((machine) => machine.slot === 'pass');
        }

        function clearMachineState() {
            container.querySelectorAll('.machine').forEach((machine) => {
                machine.classList.remove('active', 'error');
            });
        }

        function wrongFeedback(current, item, actualAction) {
            if (item.isDecoy && item.decoyReason) return item.decoyReason;
            if (item.feedback) return item.feedback;
            const allActions = [
                ...(current.actions || []),
                ...(current.toolboxDecoys?.actions || [])
            ];
            const actual = labelOf(allActions, actualAction, 'ปล่อยผ่าน');
            const expectedId = expectedActionFor(item, current);
            const expected = expectedId === defaultPassAction(current)
                ? (current.defaultBehavior?.label || 'ปล่อยผ่านอัตโนมัติ')
                : labelOf(current.actions, expectedId, 'ปล่อยผ่าน');
            return `เลือก "${actual}" แต่ควรเป็น "${expected}" ลองดูเงื่อนไขของรายการนี้อีกครั้ง`;
        }

        function finishLevel(stats) {
            const current = level();
            const passState = getPassState(current, stats);
            const stars = starsForLevel(current, stats);
            const percent = Math.round(passState.accuracy * 100);

            if (passState.passed) {
                state.levelStars[state.levelIndex] = stars;
                updateStats(stats);
                showFeedback(`ผ่านด่าน! ถูกต้อง ${stats.correct}/${stats.total} (${percent}%) เสียหาย ${stats.damaged} ได้ ${'★'.repeat(stars) || '0 ดาว'}`, 'success');
                if (state.levelIndex < gameConfig.levels.length - 1) {
                    window.setTimeout(() => loadLevel(state.levelIndex + 1), 1500);
                } else {
                    window.setTimeout(showFinalResult, 1100);
                }
            } else {
                showFeedback(`ยังไม่ผ่าน: ถูกต้อง ${stats.correct}/${stats.total} (${percent}%) เสียหาย ${stats.damaged} ชิ้น ลองแก้กฎแล้วเริ่มใหม่`, 'error');
            }
        }

        function showFinalResult() {
            const duration = Math.max(1, Math.floor((Date.now() - state.startedAt) / 1000));
            const stars = Math.max(0, Math.round(state.levelStars.reduce((sum, item) => sum + item, 0) / Math.max(1, state.levelStars.length)));
            const wrong = Math.max(0, state.totalItems - state.totalCorrect);
            const overlay = document.createElement('div');
            overlay.className = 'result-overlay';
            overlay.innerHTML = `
                <div class="result-card">
                    <h3>ภารกิจฟาร์มอัจฉริยะสำเร็จ!</h3>
                    <p>${escapeHtml(gameConfig.resultText || 'คุณสร้างกฎควบคุมฟาร์มครบทุกด่านย่อยแล้ว')}</p>
                    <div class="result-stars">${'★'.repeat(stars) || '0 ดาว'}</div>
                    <div class="result-metrics">
                        <div class="result-metric">ถูกต้อง<strong>${state.totalCorrect}/${state.totalItems}</strong></div>
                        <div class="result-metric">ผิดพลาด<strong>${wrong}</strong></div>
                        <div class="result-metric">เสียหาย<strong>${state.totalDamaged}</strong></div>
                    </div>
                    <div class="result-actions">
                        <button type="button" class="result-button" id="replay-stage">เล่นซ้ำ</button>
                        <a class="result-button secondary" href="game_select.php?game_id=${encodeURIComponent(window.GAME_ID || 3)}">กลับหน้าเลือกด่าน</a>
                    </div>
                    <p class="result-saving">กำลังบันทึกผลลัพธ์...</p>
                </div>
            `;
            document.body.appendChild(overlay);
            overlay.querySelector('#replay-stage').addEventListener('click', () => window.location.reload());
            window.setTimeout(() => {
                if (typeof window.sendResult === 'function') {
                    window.sendResult(window.STAGE_ID, stars, duration, state.attempts);
                }
            }, 1850);
        }

        function updateStats(runStats = null) {
            const currentTotal = level().itemQueue.length;
            const runCorrect = runStats ? runStats.correct : 0;
            const runDamaged = runStats ? runStats.damaged : 0;
            container.querySelector('#conveyor-count').textContent = `${state.processedCount}/${currentTotal}`;
            container.querySelector('#conveyor-correct').textContent = String(runStats ? runCorrect : 0);
            container.querySelector('#conveyor-wrong').textContent = String(runStats ? Math.max(0, state.processedCount - runCorrect) : 0);
            container.querySelector('#conveyor-damaged').textContent = String(runStats ? runDamaged : 0);
            const stars = state.levelStars[state.levelIndex];
            container.querySelector('#conveyor-stars').textContent = stars ? '★'.repeat(stars) : '-';
            if (runStats) {
                container.querySelector('#sensor-readout').textContent = `ถูก ${runStats.correct}/${runStats.total} | ผิด ${Math.max(0, state.processedCount - runStats.correct)} | เสียหาย ${runStats.damaged}`;
            }
        }

        function setControls(running) {
            dragDrop.setLocked(running);
            container.querySelector('#run-conveyor').disabled = running;
            container.querySelector('#undo-conveyor').disabled = running;
            container.querySelector('#clear-conveyor').disabled = running;
            container.querySelector('#hint-conveyor').disabled = running;
            container.querySelector('#pause-conveyor').disabled = !running;
        }

        function togglePause() {
            if (!state.running) return;
            state.paused = !state.paused;
            container.querySelector('#pause-conveyor').textContent = state.paused ? 'เล่นต่อ' : 'หยุดชั่วคราว';
            container.querySelector('#conveyor-belt').classList.toggle('running', !state.paused);
            showFeedback(state.paused ? 'หยุดสายพานไว้ชั่วคราว' : 'เดินสายพานต่อแล้ว', 'info');
        }

        async function waitWhilePaused() {
            while (state.paused) await delay(160);
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
