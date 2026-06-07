// Debug wrapper for Smart Farm Manager conveyor stages 10-12.
(function () {
    const SCAN_DELAY_MS = 360;

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

    function allConditions(level) {
        return [
            ...(level.conditions || []),
            ...(level.toolboxDecoys?.conditions || [])
        ];
    }

    function allActions(level) {
        return [
            ...(level.actions || []),
            ...(level.toolboxDecoys?.actions || [])
        ].filter((action) => !action.internal);
    }

    function labelOf(list, id, fallback = '') {
        const found = findById(list, id);
        return found ? found.label : (fallback || id || '');
    }

    function isIfOnly(level = {}) {
        return level.logicType === 'if' || level.mode === 'single_action_if' || level.lessonType === 'if';
    }

    function defaultPassAction(level = {}) {
        return level.defaultBehavior?.type || level.defaultBehavior?.id || 'pass_through';
    }

    function expectedActionFor(item, level = {}) {
        return item.correctResult || item.expectedAction || defaultPassAction(level);
    }

    function starsForScore(score) {
        if (score >= 90) return 3;
        if (score >= 70) return 2;
        if (score >= 50) return 1;
        return 0;
    }

    function scoreLevel({ wrong, attempts, hints, testedBroken }) {
        let score = 40;
        if (testedBroken) score += 10;
        if (wrong === 0) score += 30;
        score += Math.max(0, 10 - Math.max(0, attempts - 1) * 4);
        score += Math.max(0, 10 - hints * 3);
        return Math.max(0, Math.min(100, score));
    }

    function ruleLabel(type) {
        if (type === 'else') return 'นอกเหนือจากนี้';
        if (type === 'else_if') return 'หรือถ้า';
        return 'ถ้า';
    }

    function rulesToText(rules, level) {
        return (rules || []).map((rule) => {
            const condition = rule.type === 'else' || rule.condition === 'else'
                ? 'กรณีอื่นทั้งหมด'
                : labelOf(allConditions(level), rule.condition);
            return `${ruleLabel(rule.type)} ${condition} -> ${labelOf(allActions(level), rule.action)}`;
        }).join('\n');
    }

    function playAudio(kind) {
        const src = kind === 'wrong' ? '../assets/sound/wrong.mp3' : '../assets/sound/correct.mp3';
        try {
            const audio = new Audio(src);
            audio.volume = kind === 'wrong' ? 0.35 : 0.42;
            audio.play().catch(() => {});
        } catch (error) {
            // Audio is optional and may be blocked by browser autoplay rules.
        }
    }

    function normalizeRule(rule, index) {
        return {
            type: rule.type || (index === 0 ? 'if' : 'else_if'),
            condition: rule.type === 'else' ? 'else' : (rule.condition || null),
            action: rule.action || null
        };
    }

    function initConveyorDebugMode(gameConfig) {
        const container = document.getElementById('game-container');
        if (!container) return;
        if (!window.FarmMissions?.DragDropManager || !window.FarmMissions?.evaluateConveyorRules) {
            throw new Error('Conveyor Debug Mode requires conveyor_drag_drop.js and conveyor_logic_base.js');
        }

        const state = {
            levelIndex: 0,
            phase: 'intro',
            startedAt: Date.now(),
            attempts: 0,
            totalCorrect: 0,
            totalItems: 0,
            totalDamaged: 0,
            processedCount: 0,
            running: false,
            paused: false,
            rules: [],
            levelScores: [],
            selectedInspectItemId: null,
            lastStats: null,
            hintsUsed: 0
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
                <div class="conveyor-shell debug-conveyor-shell">
                    <header class="conveyor-top">
                        <div>
                            <h3 class="conveyor-title">${escapeHtml(gameConfig.title)}</h3>
                            <p class="conveyor-subtitle">${escapeHtml(gameConfig.subtitle)}</p>
                        </div>
                        <section class="conveyor-statbar">
                            <div class="conveyor-stat">รายการ<strong id="conveyor-count">0/0</strong></div>
                            <div class="conveyor-stat">ถูกต้อง<strong id="conveyor-correct">0</strong></div>
                            <div class="conveyor-stat">ผิดพลาด<strong id="conveyor-wrong">0</strong></div>
                            <div class="conveyor-stat">ทดสอบซ่อม<strong id="debug-attempts">0</strong></div>
                            <div class="conveyor-stat">ดาว<strong id="conveyor-stars">-</strong></div>
                        </section>
                    </header>

                    <div class="smart-farm-shell">
                        <section class="mission-card">
                            <div class="conveyor-level" id="conveyor-level-pill">ด่านย่อย 1 / 3</div>
                            <h4 id="mission-title">Smart Farm Debug Mode</h4>
                            <dl class="mission-list">
                                <div><dt>เป้าหมายการซ่อม</dt><dd id="mission-goal">ตรวจบั๊กและแก้กฎ</dd></div>
                                <div><dt>ตรรกะที่ใช้</dt><dd id="mission-logic">If</dd></div>
                                <div><dt>ประเภทบั๊ก</dt><dd id="mission-bug-type">-</dd></div>
                            </dl>
                        </section>

                        <section class="conveyor-panel board-panel">
                            <div class="board-status">
                                <div class="status-label">สถานะ Debug</div>
                                <div class="sensor-readout" id="sensor-readout">ทดสอบกฎเดิมก่อนเริ่มซ่อม</div>
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
                                <h4>แผงซ่อมระบบ</h4>
                                <div class="control-grid">
                                    <button type="button" class="conveyor-control run" id="run-conveyor">ทดสอบกฎเดิม</button>
                                    <button type="button" class="conveyor-control pause" id="pause-conveyor">หยุดชั่วคราว</button>
                                    <button type="button" class="conveyor-control undo" id="undo-conveyor">ย้อนกลับ</button>
                                    <button type="button" class="conveyor-control clear" id="clear-conveyor">เริ่มซ่อมใหม่</button>
                                    <button type="button" class="conveyor-control hint" id="hint-conveyor">คำใบ้</button>
                                </div>
                            </section>
                            <section id="conveyor-feedback" class="feedback-card">
                                <div class="feedback-title">คำแนะนำ</div>
                                <div class="feedback-body">ลองเปิดระบบเดิม ดูผลลัพธ์ แล้วค่อยซ่อมกฎ</div>
                            </section>
                            <section id="debug-report" class="debug-report-card is-empty">
                                <h4>รายงานข้อผิดพลาด</h4>
                                <div class="debug-report-body">รายงานจะแสดงหลังทดสอบกฎเดิม</div>
                            </section>
                            <section class="item-inspector" id="item-inspector" aria-live="polite">
                                <h4>รายละเอียดวัตถุ</h4>
                                <div class="inspector-content">คลิกรายการในแถบวัตถุเพื่อดูคุณสมบัติก่อนเริ่มสายพาน</div>
                            </section>
                        </aside>

                        <section class="conveyor-panel program-panel">
                            <div class="program-head">
                                <div>
                                    <h4>Debug Program</h4>
                                    <p id="program-subtitle">กฎเสียถูกวางไว้แล้ว ให้ทดสอบก่อนซ่อม</p>
                                </div>
                                <div class="block-trash" id="block-trash">ลากบล็อกที่วางแล้วมาที่นี่เพื่อลบ</div>
                            </div>
                            <div class="rule-list" id="rule-list"></div>
                        </section>

                        <section class="conveyor-panel toolbox-panel">
                            <div class="toolbox-head">
                                <h4>Rule Toolbox</h4>
                                <span class="lesson-pill" id="lesson-pill">Debug</span>
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
                onRulesChanged: (rules) => {
                    state.rules = rules;
                    highlightSuspicious();
                },
                onFeedback: showFeedback
            });
        }

        function bindControls() {
            container.querySelector('#run-conveyor').addEventListener('click', runConveyor);
            container.querySelector('#pause-conveyor').addEventListener('click', togglePause);
            container.querySelector('#undo-conveyor').addEventListener('click', () => {
                if (state.phase !== 'repair') return showFeedback('ต้องทดสอบกฎเดิมก่อน จึงจะเริ่มแก้ไขได้', 'info');
                if (!dragDrop.undo()) showFeedback('ยังไม่มีขั้นตอนให้ย้อนกลับ', 'info');
            });
            container.querySelector('#clear-conveyor').addEventListener('click', () => {
                if (state.phase !== 'repair') return showFeedback('รอให้รายงานข้อผิดพลาดแสดงก่อน แล้วค่อยเริ่มซ่อมใหม่', 'info');
                dragDrop.loadLevel({
                    ruleSlots: level().brokenLogic.map(normalizeRule),
                    conditions: allConditions(level()),
                    actions: allActions(level()),
                    allowReorder: level().allowReorder
                });
                dragDrop.setLocked(false);
                highlightSuspicious();
                showFeedback('กลับไปที่กฎเสียเริ่มต้นแล้ว ลองซ่อมใหม่อีกครั้ง', 'info');
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
            state.phase = 'intro';
            state.processedCount = 0;
            state.paused = false;
            state.selectedInspectItemId = null;
            state.lastStats = null;
            state.hintsUsed = 0;
            const current = level();
            container.querySelector('#farm-stage').classList.toggle('greenhouse', current.theme === 'greenhouse');
            container.querySelector('#conveyor-level-pill').textContent = `ด่านย่อย ${index + 1} / ${gameConfig.levels.length}`;
            container.querySelector('#mission-title').textContent = current.title;
            container.querySelector('#mission-goal').textContent = current.debugGoal || current.mission || current.brief;
            container.querySelector('#mission-logic').textContent = current.lessonTypeLabel || current.lessonType;
            container.querySelector('#mission-bug-type').textContent = current.bugType || '-';
            container.querySelector('#lesson-pill').textContent = current.lessonTypeLabel || current.lessonType;
            container.querySelector('#program-subtitle').textContent = 'ระบบเริ่มจากกฎที่ผิด ลองทดสอบเพื่อดูอาการก่อนแก้';
            container.querySelector('#run-conveyor').textContent = 'ทดสอบกฎเดิม';
            container.querySelector('#pause-conveyor').textContent = 'หยุดชั่วคราว';
            dragDrop.loadLevel({
                ruleSlots: (current.brokenLogic || current.ruleSlots || []).map(normalizeRule),
                conditions: allConditions(current),
                actions: allActions(current),
                allowReorder: current.allowReorder
            });
            dragDrop.setLocked(true);
            renderMachines();
            renderQueue();
            renderInspector();
            renderDebugReport(null);
            updateStats();
            setControls(false);
            showFeedback(current.intro || 'กดทดสอบกฎเดิม เพื่อดูว่าระบบส่งผลผลิตผิดทางอย่างไร', 'info');
        }

        function renderMachines() {
            const current = level();
            ['a', 'b', 'c', 'pass'].forEach((slot) => {
                const element = container.querySelector(`#machine-${slot}`);
                const machine = (current.machines || []).find((item) => item.slot === slot);
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
                queue.appendChild(chip);
            });
        }

        function renderInspector() {
            const panel = container.querySelector('#item-inspector');
            const content = panel.querySelector('.inspector-content');
            const item = findById(level().itemQueue || [], state.selectedInspectItemId);
            if (!item) {
                content.innerHTML = 'คลิกรายการในแถบวัตถุเพื่อดูคุณสมบัติก่อนเริ่มสายพาน';
                panel.classList.remove('has-decoy');
                return;
            }
            const inspect = item.inspect || {};
            const properties = inspect.properties || Object.entries(item.props || {}).map(([key, value]) => `${key}: ${value}`);
            panel.classList.toggle('has-decoy', Boolean(item.isDecoy));
            content.innerHTML = `
                <div class="inspector-title-row">
                    <span class="inspector-icon">${escapeHtml(item.fallbackIcon || item.icon || '•')}</span>
                    <strong>${escapeHtml(inspect.title || item.label || item.key)}</strong>
                </div>
                <ul class="inspector-props">${properties.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
                ${inspect.hint ? `<div class="inspector-hint">${escapeHtml(inspect.hint)}</div>` : ''}
                ${inspect.warning ? `<div class="inspector-warning">${escapeHtml(inspect.warning)}</div>` : ''}
            `;
        }

        function showHint() {
            if (state.running) return;
            const hints = level().debugReport?.hints || [level().hint || 'ลองดูว่ารายการใดถูกส่งผิดทาง แล้วตรวจบล็อกที่รายงานชี้ไว้'];
            const hint = hints[Math.min(state.hintsUsed, hints.length - 1)];
            state.hintsUsed++;
            showFeedback(hint, 'info');
        }

        async function runConveyor() {
            if (state.running) return;
            const current = level();
            const isBrokenRun = state.phase === 'intro';
            if (!isBrokenRun) {
                const missing = dragDrop.validateRules();
                if (missing) {
                    showFeedback(`${missing} ซ่อมกฎให้ครบก่อนทดสอบหลังแก้ไข`, 'error');
                    playAudio('wrong');
                    return;
                }
                state.attempts++;
            }

            state.running = true;
            state.paused = false;
            state.processedCount = 0;
            setControls(true);
            renderQueue();
            updateStats();

            const stats = { total: current.itemQueue.length, correct: 0, damaged: 0, wrongItems: [] };
            container.querySelector('#conveyor-belt').classList.add('running');
            showFeedback(isBrokenRun ? 'กำลังทดสอบกฎเดิมเพื่อหาอาการผิดปกติ' : 'กำลังทดสอบกฎหลังซ่อม', 'info');

            for (const item of current.itemQueue) {
                await waitWhilePaused();
                const outcome = await processItem(item);
                if (outcome.correct) {
                    stats.correct++;
                    if (!isBrokenRun) state.totalCorrect++;
                    playAudio('correct');
                } else {
                    stats.damaged++;
                    stats.wrongItems.push({ item, actualAction: outcome.action });
                    if (!isBrokenRun) state.totalDamaged++;
                    playAudio('wrong');
                }
                if (!isBrokenRun) state.totalItems++;
                state.processedCount++;
                renderQueue();
                updateStats(stats);
                await delay(outcome.correct ? 260 : 440);
            }

            container.querySelector('#conveyor-belt').classList.remove('running');
            state.running = false;
            setControls(false);
            finishRun(stats, isBrokenRun);
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
            await moveItemTo(element, path.scan.x, path.scan.y, 460);
            scanner.classList.add('scanning');
            readout.textContent = `สแกน: ${item.sensor || item.label}`;
            await delay(SCAN_DELAY_MS);
            scanner.classList.remove('scanning');

            const action = window.FarmMissions.evaluateConveyorRules(item, state.rules, allConditions(current), current);
            const correct = action === expectedActionFor(item, current);
            const machine = machineForAction(current, action);
            const machineEl = machine ? container.querySelector(`#machine-${machine.slot}`) : null;
            if (machineEl) machineEl.classList.add(correct ? 'active' : 'error');

            readout.textContent = correct
                ? `${item.label}: ถูกทาง`
                : `${item.label}: ${wrongFeedback(current, item, action)}`;

            const target = machineEl ? centerOf(stage, machineEl) : path.pass;
            await moveItemTo(element, target.x, target.y, 540);
            element.style.opacity = correct ? '0.98' : '0.74';
            await delay(150);
            element.remove();
            return { correct, action };
        }

        function renderItemVisual(item) {
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
                pass: { x: stageRect.width - itemWidth, y }
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
            if (action === defaultPassAction(current)) return null;
            const actionMeta = findById(allActions(current), action);
            if (actionMeta?.routeSlot) {
                return (current.machines || []).find((machine) => machine.slot === actionMeta.routeSlot);
            }
            return (current.machines || []).find((machine) => (machine.actions || []).includes(action))
                || (current.machines || []).find((machine) => machine.slot === 'pass');
        }

        function wrongFeedback(current, item, actualAction) {
            if (item.isDecoy && item.decoyReason) return item.decoyReason;
            if (item.feedback) return item.feedback;
            const actual = labelOf(allActions(current), actualAction, 'ปล่อยผ่าน');
            const expectedId = expectedActionFor(item, current);
            const expected = expectedId === defaultPassAction(current)
                ? (current.defaultBehavior?.label || 'ปล่อยผ่านอัตโนมัติ')
                : labelOf(current.actions, expectedId, 'ปล่อยผ่าน');
            return `เลือก "${actual}" แต่ควรเป็น "${expected}"`;
        }

        function finishRun(stats, isBrokenRun) {
            const current = level();
            state.lastStats = stats;
            if (isBrokenRun) {
                state.phase = 'repair';
                dragDrop.setLocked(false);
                container.querySelector('#run-conveyor').textContent = 'ทดสอบหลังแก้ไข';
                container.querySelector('#program-subtitle').textContent = 'ซ่อมบล็อกที่น่าสงสัย แล้วทดสอบอีกครั้ง';
                renderDebugReport(stats);
                setControls(false);
                highlightSuspicious();
                showFeedback(`พบรายการไปผิดทาง ${stats.wrongItems.length} ชิ้น เปิดรายงานแล้วซ่อมกฎได้เลย`, 'error');
                return;
            }

            const wrong = stats.total - stats.correct;
            const passed = wrong === 0;
            const score = scoreLevel({ wrong, attempts: state.attempts, hints: state.hintsUsed, testedBroken: true });
            state.levelScores[state.levelIndex] = score;

            if (passed) {
                showFeedback(current.successFeedback || `ซ่อมสำเร็จ! ผลผลิตถูกทางครบ ${stats.total} ชิ้น`, 'success');
                if (state.levelIndex < gameConfig.levels.length - 1) {
                    window.setTimeout(() => loadLevel(state.levelIndex + 1), 1400);
                } else {
                    window.setTimeout(showFinalResult, 1000);
                }
            } else {
                showFeedback(`ยังมีผิดทาง ${wrong} ชิ้น ลองอ่านรายงานและซ่อมบล็อกอีกครั้ง`, 'error');
                renderDebugReport(stats);
                highlightSuspicious();
            }
            updateStats(stats);
        }

        function renderDebugReport(stats) {
            const current = level();
            const panel = container.querySelector('#debug-report');
            if (!stats) {
                panel.className = 'debug-report-card is-empty';
                panel.innerHTML = `
                    <h4>รายงานข้อผิดพลาด</h4>
                    <div class="debug-report-body">รายงานจะแสดงหลังทดสอบกฎเดิม</div>
                `;
                return;
            }
            const report = current.debugReport || {};
            const wrongLabels = stats.wrongItems.slice(0, 5).map(({ item }) => item.label || item.key);
            panel.className = 'debug-report-card';
            panel.innerHTML = `
                <h4>${escapeHtml(report.title || 'รายงานข้อผิดพลาด')}</h4>
                <div class="debug-report-body">
                    <p>${escapeHtml(report.summary || 'ระบบส่งผลผลิตบางชิ้นไปผิดทาง')}</p>
                    <div class="debug-report-metric">พบผิดทาง ${stats.wrongItems.length}/${stats.total} ชิ้น</div>
                    ${wrongLabels.length ? `<div class="debug-wrong-list">ตัวอย่าง: ${escapeHtml(wrongLabels.join(', '))}</div>` : ''}
                    <div class="debug-rule-compare">
                        <strong>กฎเสียเริ่มต้น</strong>
                        <pre>${escapeHtml(rulesToText(current.brokenLogic, current))}</pre>
                        <strong>เป้าหมายที่ต้องซ่อม</strong>
                        <pre>${escapeHtml(rulesToText(current.expectedLogic, current))}</pre>
                    </div>
                </div>
            `;
        }

        function highlightSuspicious() {
            const current = level();
            container.querySelectorAll('.debug-suspect, .debug-suspect-badge').forEach((item) => {
                item.classList.remove('debug-suspect');
                if (item.classList.contains('debug-suspect-badge')) item.remove();
            });
            if (state.phase !== 'repair') return;
            const targets = current.suspiciousBlocks || [];
            targets.forEach((target) => {
                let selector = '';
                if (target === 'condition' || target === 'ifCondition') selector = '.rule-row[data-rule-index="0"] .condition-slot';
                if (target === 'action' || target === 'ifAction') selector = '.rule-row[data-rule-index="0"] .action-slot';
                if (target === 'elseAction') selector = '.rule-row[data-rule-type="else"] .action-slot';
                if (target === 'elseIfCondition') selector = '.rule-row[data-rule-index="1"] .condition-slot';
                if (target === 'elseIfAction') selector = '.rule-row[data-rule-index="1"] .action-slot';
                if (!selector) return;
                container.querySelectorAll(selector).forEach((slot) => {
                    slot.classList.add('debug-suspect');
                    const badge = document.createElement('span');
                    badge.className = 'debug-suspect-badge';
                    badge.textContent = 'ตรวจดูตรงนี้';
                    slot.appendChild(badge);
                });
            });
        }

        function clearMachineState() {
            container.querySelectorAll('.machine').forEach((machine) => {
                machine.classList.remove('active', 'error');
            });
        }

        function updateStats(runStats = null) {
            const currentTotal = level().itemQueue.length;
            const runCorrect = runStats ? runStats.correct : 0;
            const wrong = runStats ? Math.max(0, runStats.total - runStats.correct) : 0;
            container.querySelector('#conveyor-count').textContent = `${state.processedCount}/${currentTotal}`;
            container.querySelector('#conveyor-correct').textContent = String(runCorrect);
            container.querySelector('#conveyor-wrong').textContent = String(wrong);
            container.querySelector('#debug-attempts').textContent = String(state.attempts);
            const score = state.levelScores[state.levelIndex] || 0;
            const stars = starsForScore(score);
            container.querySelector('#conveyor-stars').textContent = stars ? '★'.repeat(stars) : '-';
            if (runStats) {
                container.querySelector('#sensor-readout').textContent = `ถูก ${runStats.correct}/${runStats.total} | ผิด ${wrong}`;
            }
        }

        function setControls(running) {
            dragDrop.setLocked(running || state.phase === 'intro');
            container.querySelector('#run-conveyor').disabled = running;
            container.querySelector('#undo-conveyor').disabled = running || state.phase !== 'repair';
            container.querySelector('#clear-conveyor').disabled = running || state.phase !== 'repair';
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
            panel.querySelector('.feedback-title').textContent = type === 'success' ? 'ซ่อมได้แล้ว!' : type === 'error' ? 'พบจุดน่าสงสัย' : 'คำแนะนำ';
            panel.querySelector('.feedback-body').textContent = message;
        }

        function showFinalResult() {
            const duration = Math.max(1, Math.floor((Date.now() - state.startedAt) / 1000));
            const averageScore = Math.round(state.levelScores.reduce((sum, score) => sum + score, 0) / Math.max(1, state.levelScores.length));
            const stars = starsForScore(averageScore);
            const wrong = Math.max(0, state.totalItems - state.totalCorrect);
            const overlay = document.createElement('div');
            overlay.className = 'result-overlay';
            overlay.innerHTML = `
                <div class="result-card">
                    <h3>ภารกิจซ่อมกฎฟาร์มสำเร็จ!</h3>
                    <p>${escapeHtml(gameConfig.resultText || 'คุณตรวจบั๊กและซ่อมระบบครบทุกด่านแล้ว')}</p>
                    <div class="result-stars">${'★'.repeat(stars) || '0 ดาว'}</div>
                    <div class="result-metrics">
                        <div class="result-metric">คะแนนเฉลี่ย<strong>${averageScore}</strong></div>
                        <div class="result-metric">ถูกต้อง<strong>${state.totalCorrect}/${state.totalItems}</strong></div>
                        <div class="result-metric">ผิดพลาด<strong>${wrong}</strong></div>
                    </div>
                    <div class="result-actions">
                        <button type="button" class="result-button" id="replay-stage">เล่นซ้ำ</button>
                        <a class="result-button secondary" href="game_select.php?game_id=${encodeURIComponent(window.GAME_ID || 4)}">กลับหน้าเลือกด่าน</a>
                    </div>
                    <p class="result-saving">กำลังบันทึกผลลัพธ์...</p>
                </div>
            `;
            document.body.appendChild(overlay);
            overlay.querySelector('#replay-stage').addEventListener('click', () => window.location.reload());
            window.setTimeout(() => {
                if (typeof window.sendResult === 'function') {
                    window.sendResult(window.STAGE_ID, stars, duration, state.attempts || 1, {
                        mode: 'conveyor_debug',
                        average_score: averageScore,
                        level_scores: state.levelScores,
                        total_correct: state.totalCorrect,
                        total_items: state.totalItems
                    });
                }
            }, 1850);
        }
    }

    window.FarmMissions = window.FarmMissions || {};
    window.FarmMissions.conveyorDebugMode = initConveyorDebugMode;
})();
