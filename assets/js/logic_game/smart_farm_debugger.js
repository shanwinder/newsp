// Smart Farm Debugger engine for chapter 4.
(function () {
    const FLOW = [
        { key: 'observe', label: 'Observe' },
        { key: 'diagnose', label: 'Diagnose' },
        { key: 'hunt', label: 'Bug Hunt' },
        { key: 'repair', label: 'Fix' },
        { key: 'test', label: 'Test' }
    ];

    const TYPE_LABELS = {
        if: 'ถ้า',
        else_if: 'นอกเหนือจากนี้ถ้า',
        else: 'นอกเหนือจากนี้'
    };

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeRule(rule) {
        return {
            type: rule.type,
            condition: rule.condition || 'else',
            action: rule.action || ''
        };
    }

    function sameRules(a, b) {
        if (window.DebugDragDrop?.sameRules) {
            return window.DebugDragDrop.sameRules(a.map(normalizeRule), b.map(normalizeRule));
        }
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
        return a.every((rule, index) => {
            const left = normalizeRule(rule);
            const right = normalizeRule(b[index] || {});
            return left.type === right.type && left.condition === right.condition && left.action === right.action;
        });
    }

    function moveItem(items, fromIndex, toIndex) {
        if (window.DebugDragDrop?.moveItem) return window.DebugDragDrop.moveItem(items, fromIndex, toIndex);
        const next = items.slice();
        const [item] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, item);
        return next;
    }

    function targetKey(target) {
        return `${target.ruleIndex}:${target.slot}`;
    }

    function starsFromState(state) {
        if (state.hintsUsed > 0) return 1;
        if (state.wrongHunts === 0 && state.failedTests === 0 && state.symptomMistakes === 0) return 3;
        if (state.wrongHunts <= 2 && state.failedTests <= 2 && state.symptomMistakes <= 1) return 2;
        return 1;
    }

    function labelFromList(list, id) {
        const found = (list || []).find((item) => item.id === id || item.value === id);
        return found ? found.label : id;
    }

    class SmartFarmDebugger {
        constructor(config) {
            this.config = config;
            this.root = document.getElementById(config.parentId || 'game-container');
            this.levelIndex = 0;
            this.state = {
                startedAt: Date.now(),
                attempts: 0,
                symptomMistakes: 0,
                wrongHunts: 0,
                failedTests: 0,
                hintsUsed: 0,
                ended: false
            };
            this.phase = 'observe';
            this.currentRules = [];
            this.foundTargets = new Set();
            this.repairedTargets = new Set();
            this.message = '';
            this.messageType = 'info';
            this.animationTimer = null;
        }

        boot() {
            if (!this.root) return;
            this.root.innerHTML = '<div class="debugger-shell"></div>';
            this.shell = this.root.querySelector('.debugger-shell');
            this.loadLevel();
        }

        level() {
            return this.config.levels[this.levelIndex];
        }

        loadLevel() {
            const level = this.level();
            this.phase = 'observe';
            this.currentRules = clone(level.buggyRules);
            this.foundTargets = new Set();
            this.repairedTargets = new Set();
            this.message = level.intro;
            this.messageType = 'warning';
            this.render();
            window.setTimeout(() => this.runScene(false), 180);
        }

        render() {
            const level = this.level();
            const stars = starsFromState(this.state);
            this.shell.innerHTML = `
                <section class="debugger-top">
                    <div>
                        <p class="debugger-kicker">ด่านย่อยที่ ${this.levelIndex + 1} / ${this.config.levels.length}</p>
                        <h3 class="debugger-title">${escapeHtml(level.title)}</h3>
                        <p class="debugger-subtitle">${escapeHtml(level.subtitle || this.config.subtitle || '')}</p>
                    </div>
                    <div class="debugger-badges">
                        <span class="debugger-badge">แก้ผิด ${this.state.failedTests}</span>
                        <span class="debugger-badge">จับผิด ${this.state.wrongHunts}</span>
                        <span class="debugger-badge">ดาวตอนนี้ ${'★'.repeat(stars)}</span>
                    </div>
                </section>
                <div class="debugger-flow">${this.renderFlow()}</div>
                <section class="debugger-layout">
                    <div class="debugger-panel">
                        <h4 class="debugger-panel-title">
                            <span>ระบบฟาร์มที่มีอาการผิด</span>
                            <button class="debugger-button" data-action="replay">ดูอาการซ้ำ</button>
                        </h4>
                        ${this.renderFarm()}
                    </div>
                    <div class="debugger-panel">
                        <h4 class="debugger-panel-title"><span>เครื่องมือ Debug</span></h4>
                        <div class="debugger-message ${this.messageType}">${escapeHtml(this.message)}</div>
                        <div class="mt-3">${this.renderToolPanel()}</div>
                    </div>
                </section>
            `;
            this.bindEvents();
        }

        renderFlow() {
            const currentIndex = FLOW.findIndex((step) => step.key === this.phase);
            return FLOW.map((step, index) => {
                const cls = index < currentIndex ? 'done' : (index === currentIndex ? 'active' : '');
                return `<div class="debugger-step ${cls}">${escapeHtml(step.label)}</div>`;
            }).join('');
        }

        renderFarm() {
            const level = this.level();
            const scene = level.scene || {};
            const item = scene.item || (scene.items || [])[0] || {};
            return `
                <div class="debugger-farm">
                    <div class="debugger-route"></div>
                    <div class="debugger-station input">${escapeHtml(scene.inputLabel || 'สายพานเข้า')}</div>
                    <div class="debugger-station scan">${escapeHtml(scene.scanLabel || 'เครื่องสแกน')}</div>
                    <div class="debugger-station output-a">${escapeHtml(scene.outputALabel || 'ปลายทาง A')}</div>
                    <div class="debugger-station output-b">${escapeHtml(scene.outputBLabel || 'ปลายทาง B')}</div>
                    <div class="debugger-item" id="debugger-moving-item" title="${escapeHtml(item.label || '')}">${escapeHtml(item.icon || '🌱')}</div>
                    <div class="debugger-alert" id="debugger-alert"><span>⚠</span><span>${escapeHtml(scene.warning || level.intro)}</span></div>
                </div>
            `;
        }

        renderToolPanel() {
            if (this.phase === 'observe') return this.renderObservePanel();
            if (this.phase === 'diagnose') return this.renderSymptomPanel();
            if (this.phase === 'hunt') return this.renderHuntPanel();
            if (this.phase === 'repair') return this.renderRepairPanel();
            return this.renderTestPanel();
        }

        renderObservePanel() {
            const level = this.level();
            return `
                <div class="debugger-actions mt-3">
                    <button class="debugger-button primary" data-action="start-diagnose">ฉันเห็นอาการแล้ว</button>
                    <button class="debugger-button" data-action="hint">คำใบ้</button>
                </div>
                <div class="debugger-hints mt-3">
                    <div class="debugger-rule">${escapeHtml(level.observePrompt || 'ดูผลลัพธ์ที่ผิดก่อน แล้วค่อยเลือกอาการที่เห็น')}</div>
                </div>
            `;
        }

        renderSymptomPanel() {
            const level = this.level();
            return `
                <div class="debugger-options mt-3">
                    ${(level.symptomOptions || []).map((option) => `
                        <button class="debugger-option" data-symptom="${escapeHtml(option.id)}">${escapeHtml(option.label)}</button>
                    `).join('')}
                </div>
                <div class="debugger-actions mt-3">
                    <button class="debugger-button" data-action="hint">คำใบ้</button>
                </div>
            `;
        }

        renderHuntPanel() {
            const level = this.level();
            return `
                <div class="debugger-rule-list mt-3">
                    ${this.currentRules.map((rule, index) => this.renderRule(rule, index, true)).join('')}
                    ${this.renderMissingElseTarget(true)}
                </div>
                <div class="debugger-actions mt-3">
                    <button class="debugger-button" data-action="hint">คำใบ้</button>
                </div>
                <div class="debugger-rule mt-3">
                    เจอแล้ว ${this.foundTargets.size} / ${(level.bugTargets || []).length} จุด
                </div>
            `;
        }

        renderRepairPanel() {
            return `
                <div class="debugger-rule-list mt-3">
                    ${this.currentRules.map((rule, index) => this.renderRule(rule, index, false, true)).join('')}
                    ${this.renderMissingElseTarget(false, true)}
                </div>
                <div class="debugger-repair-list mt-3">
                    ${this.renderRepairControls()}
                </div>
                <div class="debugger-actions mt-3">
                    <button class="debugger-button success" data-action="test">ทดสอบระบบอีกครั้ง</button>
                    <button class="debugger-button" data-action="hint">คำใบ้</button>
                </div>
            `;
        }

        renderTestPanel() {
            const level = this.level();
            return `
                <div class="debugger-rule-list mt-3">
                    ${this.currentRules.map((rule, index) => this.renderRule(rule, index, false)).join('')}
                </div>
                <div class="debugger-rule mt-3">${escapeHtml(level.explain)}</div>
                <div class="debugger-actions mt-3">
                    <button class="debugger-button primary" data-action="next-level">${this.levelIndex < this.config.levels.length - 1 ? 'ไปด่านย่อยถัดไป' : 'บันทึกผลลัพธ์'}</button>
                </div>
            `;
        }

        renderRule(rule, index, clickable, repairMode) {
            const level = this.level();
            const conditions = level.repairOptions?.conditions || [];
            const actions = level.repairOptions?.actions || [];
            const isOrderTarget = this.isTarget(index, 'rule');
            const ruleFound = this.foundTargets.has(`${index}:rule`);
            const conditionFound = this.foundTargets.has(`${index}:condition`);
            const actionFound = this.foundTargets.has(`${index}:action`);
            const ruleClasses = [
                'debugger-rule',
                clickable && isOrderTarget ? 'clickable' : '',
                ruleFound ? 'found' : ''
            ].filter(Boolean).join(' ');
            const conditionLabel = rule.type === 'else' ? 'ทุกกรณีที่เหลือ' : labelFromList(conditions, rule.condition);
            const actionLabel = labelFromList(actions, rule.action);
            return `
                <div class="${ruleClasses}" ${clickable && isOrderTarget ? `data-rule-target="${index}:rule"` : ''}>
                    <div class="debugger-rule-head">
                        <span class="debugger-rule-type">${escapeHtml(TYPE_LABELS[rule.type] || rule.type)}</span>
                        ${repairMode && rule.type !== 'else' ? `
                            <span class="debugger-order-controls">
                                <button class="debugger-icon-button" data-action="move-rule" data-index="${index}" data-dir="-1" title="เลื่อนขึ้น">↑</button>
                                <button class="debugger-icon-button" data-action="move-rule" data-index="${index}" data-dir="1" title="เลื่อนลง">↓</button>
                            </span>
                        ` : ''}
                    </div>
                    <div class="debugger-rule-body">
                        <button class="debugger-slot ${conditionFound ? 'found' : ''} ${clickable && rule.type !== 'else' ? 'clickable' : ''}" ${clickable && rule.type !== 'else' ? `data-slot-target="${index}:condition"` : ''}>
                            ${escapeHtml(conditionLabel)}
                        </button>
                        <span class="debugger-arrow">→</span>
                        <button class="debugger-slot action ${actionFound ? 'found' : ''} ${clickable ? 'clickable' : ''}" ${clickable ? `data-slot-target="${index}:action"` : ''}>
                            ${escapeHtml(actionLabel)}
                        </button>
                    </div>
                </div>
            `;
        }

        renderMissingElseTarget(clickable, repairMode) {
            const level = this.level();
            const target = (level.bugTargets || []).find((entry) => entry.slot === 'else');
            if (!target || this.currentRules[target.ruleIndex]?.type === 'else') return '';
            const found = this.foundTargets.has(`${target.ruleIndex}:else`);
            if (repairMode) {
                return `
                    <div class="debugger-missing-else ${found ? 'found' : ''}">
                        ระบบยังไม่มี Else สำหรับกรณีปกติ
                        <div class="mt-2">
                            <button class="debugger-button primary" data-action="add-else">เพิ่ม Else ที่ถูกต้อง</button>
                        </div>
                    </div>
                `;
            }
            return `
                <button class="debugger-missing-else ${found ? 'found' : ''}" ${clickable ? `data-slot-target="${target.ruleIndex}:else"` : ''}>
                    ช่อง Else ที่หายไป
                </button>
            `;
        }

        renderRepairControls() {
            const level = this.level();
            const targets = (level.bugTargets || []).filter((target) => this.foundTargets.has(targetKey(target)));
            return targets.map((target) => {
                if (target.slot === 'condition') {
                    const options = level.repairOptions?.conditions || [];
                    const value = this.currentRules[target.ruleIndex]?.condition || '';
                    return this.renderSelectRepair(target, 'condition', 'เปลี่ยนเงื่อนไข', options, value);
                }
                if (target.slot === 'action') {
                    const options = level.repairOptions?.actions || [];
                    const value = this.currentRules[target.ruleIndex]?.action || '';
                    return this.renderSelectRepair(target, 'action', 'เปลี่ยนคำสั่ง', options, value);
                }
                if (target.slot === 'rule') {
                    return `<div class="debugger-repair"><strong>สลับลำดับกฎ</strong><div class="text-secondary small mt-1">${escapeHtml(target.reason)}</div></div>`;
                }
                if (target.slot === 'else') {
                    return `<div class="debugger-repair"><strong>เพิ่ม Else</strong><div class="text-secondary small mt-1">${escapeHtml(target.reason)}</div></div>`;
                }
                return '';
            }).join('');
        }

        renderSelectRepair(target, field, label, options, value) {
            return `
                <div class="debugger-repair">
                    <label>${escapeHtml(label)}: ${escapeHtml(target.reason)}</label>
                    <select class="debugger-select" data-repair="${target.ruleIndex}:${field}">
                        ${options.map((option) => `
                            <option value="${escapeHtml(option.id)}" ${option.id === value ? 'selected' : ''}>${escapeHtml(option.label)}</option>
                        `).join('')}
                    </select>
                </div>
            `;
        }

        bindEvents() {
            this.shell.querySelectorAll('[data-action]').forEach((node) => {
                node.addEventListener('click', (event) => this.handleAction(event.currentTarget));
            });
            this.shell.querySelectorAll('[data-symptom]').forEach((node) => {
                node.addEventListener('click', (event) => this.chooseSymptom(event.currentTarget));
            });
            this.shell.querySelectorAll('[data-slot-target], [data-rule-target]').forEach((node) => {
                node.addEventListener('click', (event) => this.chooseBugTarget(event.currentTarget));
            });
            this.shell.querySelectorAll('[data-repair]').forEach((node) => {
                node.addEventListener('change', (event) => this.applyRepairSelect(event.currentTarget));
            });
        }

        handleAction(node) {
            const action = node.dataset.action;
            if (action === 'replay') this.runScene(false);
            if (action === 'start-diagnose') this.startDiagnose();
            if (action === 'hint') this.showHint();
            if (action === 'test') this.testRepair();
            if (action === 'next-level') this.nextLevel();
            if (action === 'move-rule') this.moveRule(Number(node.dataset.index), Number(node.dataset.dir));
            if (action === 'add-else') this.addElse();
        }

        startDiagnose() {
            this.phase = 'diagnose';
            this.message = this.level().symptomPrompt || 'เลือกอาการที่เห็นจากระบบก่อนเริ่มจับบั๊ก';
            this.messageType = 'info';
            this.render();
        }

        chooseSymptom(node) {
            const level = this.level();
            const chosen = (level.symptomOptions || []).find((option) => option.id === node.dataset.symptom);
            if (!chosen) return;
            if (chosen.correct) {
                node.classList.add('correct');
                this.phase = 'hunt';
                this.message = chosen.feedback || 'สังเกตอาการถูกต้องแล้ว ต่อไปคลิกบล็อกที่น่าสงสัย';
                this.messageType = 'success';
                window.setTimeout(() => this.render(), 280);
                return;
            }
            node.classList.add('wrong');
            this.state.symptomMistakes++;
            this.message = chosen.feedback || 'อาการนี้ยังไม่ตรง ลองดูผลลัพธ์ที่ผิดอีกครั้ง';
            this.messageType = 'error';
            this.render();
        }

        chooseBugTarget(node) {
            const raw = node.dataset.slotTarget || node.dataset.ruleTarget;
            const level = this.level();
            const target = (level.bugTargets || []).find((entry) => targetKey(entry) === raw);
            if (target) {
                this.foundTargets.add(raw);
                this.message = `เจอบั๊กแล้ว: ${target.reason}`;
                this.messageType = 'success';
                if (this.foundTargets.size >= (level.bugTargets || []).length) {
                    this.phase = 'repair';
                    this.message += ' ตอนนี้ซ่อมเฉพาะจุดที่เจอได้เลย';
                }
                this.render();
                return;
            }
            this.state.wrongHunts++;
            this.message = level.huntFeedback || 'บล็อกนี้ยังไม่ใช่สาเหตุหลัก ลองเชื่อมอาการกับกฎที่ทำให้ผลลัพธ์ผิด';
            this.messageType = 'error';
            this.render();
        }

        applyRepairSelect(node) {
            const [ruleIndexRaw, field] = node.dataset.repair.split(':');
            const ruleIndex = Number(ruleIndexRaw);
            if (!this.currentRules[ruleIndex]) return;
            this.currentRules[ruleIndex][field] = node.value;
            this.message = 'ปรับบล็อกแล้ว กดทดสอบระบบอีกครั้งเพื่อดูผล';
            this.messageType = 'info';
            this.render();
        }

        moveRule(index, direction) {
            const to = index + direction;
            if (to < 0 || to >= this.currentRules.length) return;
            this.currentRules = moveItem(this.currentRules, index, to);
            this.message = 'สลับลำดับกฎแล้ว กดทดสอบเพื่อดูว่าระบบหยุดผิดพลาดหรือยัง';
            this.messageType = 'info';
            this.render();
        }

        addElse() {
            const level = this.level();
            const target = (level.bugTargets || []).find((entry) => entry.slot === 'else');
            const elseRule = (level.correctRules || [])[target?.ruleIndex];
            if (!target || !elseRule || this.currentRules[target.ruleIndex]?.type === 'else') return;
            const insertAt = Math.min(target.ruleIndex, this.currentRules.length);
            this.currentRules.splice(insertAt, 0, clone(elseRule));
            this.message = 'เพิ่ม Else แล้ว ตอนนี้ระบบมีคำสั่งสำหรับกรณีปกติ';
            this.messageType = 'success';
            this.render();
        }

        testRepair() {
            const level = this.level();
            this.state.attempts++;
            if (sameRules(this.currentRules, level.correctRules)) {
                this.phase = 'test';
                this.message = level.success || 'ระบบกลับมาทำงานถูกต้องแล้ว';
                this.messageType = 'success';
                this.render();
                window.setTimeout(() => this.runScene(true), 80);
                return;
            }
            this.state.failedTests++;
            this.message = level.repairFeedback || 'ยังมีบล็อกที่ไม่ถูกต้อง ลองใช้หลักฐานจากอาการแล้วแก้เฉพาะจุด';
            this.messageType = 'error';
            this.render();
            window.setTimeout(() => this.runScene(false), 80);
        }

        showHint() {
            const level = this.level();
            const hints = level.hints || [];
            const index = Math.min(this.state.hintsUsed, hints.length - 1);
            this.state.hintsUsed++;
            this.message = hints[index] || 'ลองดูว่าผลลัพธ์ผิดเริ่มเกิดที่กฎข้อใด';
            this.messageType = 'warning';
            this.render();
        }

        isTarget(ruleIndex, slot) {
            return (this.level().bugTargets || []).some((target) => target.ruleIndex === ruleIndex && target.slot === slot);
        }

        runScene(fixed) {
            window.clearTimeout(this.animationTimer);
            const item = this.shell.querySelector('#debugger-moving-item');
            const alert = this.shell.querySelector('#debugger-alert');
            if (!item || !alert) return;
            item.className = 'debugger-item';
            alert.className = 'debugger-alert';
            alert.querySelector('span:last-child').textContent = fixed
                ? (this.level().scene?.fixedMessage || 'ระบบทำงานถูกต้อง')
                : (this.level().scene?.warning || this.level().intro);
            window.setTimeout(() => item.classList.add('run-1'), 80);
            window.setTimeout(() => item.classList.add(fixed ? 'run-3' : 'run-2'), 620);
            this.animationTimer = window.setTimeout(() => {
                item.classList.add(fixed ? 'fixed' : 'broken');
                alert.classList.toggle('success', fixed);
            }, 1120);
        }

        nextLevel() {
            if (this.levelIndex < this.config.levels.length - 1) {
                this.levelIndex++;
                this.loadLevel();
                return;
            }
            this.finishGame();
        }

        finishGame() {
            if (this.state.ended) return;
            this.state.ended = true;
            const duration = Math.max(1, Math.floor((Date.now() - this.state.startedAt) / 1000));
            const stars = starsFromState(this.state);
            const overlay = document.createElement('div');
            overlay.className = 'debugger-summary';
            overlay.innerHTML = `
                <div class="debugger-summary-card">
                    <h3>ภารกิจจับบั๊กสำเร็จ</h3>
                    <p>คุณสังเกตอาการ วิเคราะห์บล็อกที่ผิด ซ่อมระบบ และทดสอบซ้ำครบทุกด่านย่อยแล้ว</p>
                    <div class="debugger-stars">${'★'.repeat(stars)}</div>
                    <p>ใช้เวลา ${duration} วินาที | ทดสอบ ${this.state.attempts} ครั้ง</p>
                </div>
            `;
            document.body.appendChild(overlay);
            window.setTimeout(() => {
                if (typeof window.sendResult === 'function') {
                    window.sendResult(window.STAGE_ID, stars, duration, this.state.attempts);
                }
            }, 1800);
        }
    }

    function smartFarmDebugger(config) {
        const debuggerGame = new SmartFarmDebugger(config);
        debuggerGame.boot();
        return debuggerGame;
    }

    window.FarmMissions = window.FarmMissions || {};
    window.FarmMissions.smartFarmDebugger = smartFarmDebugger;
})();
