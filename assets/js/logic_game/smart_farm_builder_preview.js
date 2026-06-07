(function () {
    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[char]));
    }

    function byId(list, id) {
        return (list || []).find((item) => item.id === id) || null;
    }

    function labelOf(list, id, fallback = '') {
        const found = byId(list, id);
        return found ? found.label : (fallback || id || '');
    }

    function matchProps(itemProps, conditionProps) {
        return window.SmartFarmBuilderValidation
            ? window.SmartFarmBuilderValidation.matchProps(itemProps, conditionProps)
            : Object.entries(conditionProps || {}).every(([key, value]) => itemProps?.[key] === value);
    }

    function defaultPassAction(config = {}) {
        const behavior = config.default_behavior || config.defaultBehavior || {};
        return behavior.type || behavior.id || 'pass_through';
    }

    function isIfOnly(config = {}) {
        return config.logic_type === 'if' || config.logicType === 'if' || config.mode === 'single_action_if';
    }

    function normalizeAction(action, config = {}) {
        if (isIfOnly(config) && action === 'pass') return defaultPassAction(config);
        return action;
    }

    function evaluate(item, rules, conditions, config = {}) {
        if (isIfOnly(config)) {
            const rule = (rules || []).find((entry) => entry && entry.type === 'if');
            if (!rule || !rule.condition || !rule.action) return defaultPassAction(config);
            const condition = byId(conditions, rule.condition);
            return condition && matchProps(item.props, condition.props)
                ? normalizeAction(rule.action, config)
                : defaultPassAction(config);
        }

        for (const rule of rules || []) {
            if (!rule || !rule.action) continue;
            if (rule.type === 'else' || rule.condition === 'else') return rule.action;
            const condition = byId(conditions, rule.condition);
            if (condition && matchProps(item.props, condition.props)) return rule.action;
        }
        return 'pass';
    }

    function getSummary(data) {
        if (!data || data.project_type !== 'smart_farm_mini_game') return null;
        const decoys = (data.items || []).filter((item) => item.isDecoy).length;
        const tested = Boolean(data.testResult?.tested);
        const accuracy = Number(data.testResult?.accuracy || 0);
        const logicLabels = {
            if: 'If',
            if_else: 'If / Else',
            if_else_if_else: 'If / Else If / Else'
        };
        return {
            title: data.title || 'ด่านฟาร์มอัจฉริยะ',
            mission: data.mission || '',
            logic: logicLabels[data.logic_type] || data.logic_type || 'Condition',
            theme: data.themeLabel || data.theme || 'ฟาร์ม',
            itemCount: (data.items || []).length,
            decoyCount: decoys,
            actionCount: (data.actions || []).length,
            tested,
            accuracy,
            stars: data.testResult?.stars || 0
        };
    }

    function renderSummary(stage, data, options = {}) {
        const summary = getSummary(data);
        if (!summary) return false;

        const ruleLines = (data.rules || []).map((rule) => {
            const prefix = rule.type === 'else' ? 'Else' : (rule.type === 'else_if' ? 'Else If' : 'If');
            const condition = rule.type === 'else' ? 'กลุ่มที่เหลือทั้งหมด' : labelOf(data.conditions, rule.condition, '-');
            const action = labelOf(data.actions, rule.action, '-');
            return `<div class="smart-rule-line"><strong>${escapeHtml(prefix)}</strong> ${escapeHtml(condition)} → ${escapeHtml(action)}</div>`;
        }).join('') + (isIfOnly(data)
            ? `<div class="smart-rule-line"><strong>System</strong> ไม่เข้าเงื่อนไข → ${escapeHtml((data.default_behavior || data.defaultBehavior || {}).label || 'ปล่อยผ่านอัตโนมัติ')}</div>`
            : '');

        const keepScalable = stage.classList.contains('scalable-canvas');
        stage.className = keepScalable ? 'scalable-canvas' : '';
        stage.style.backgroundImage = '';
        stage.style.background = '#eff8f0';
        stage.style.padding = '0';
        stage.style.overflow = 'hidden';
        stage.innerHTML = `
            <div class="smart-preview-card">
                <section class="smart-preview-stage">
                    <h3 class="smart-preview-title">${escapeHtml(summary.title)}</h3>
                    <div class="text-secondary" style="white-space:pre-wrap;">${escapeHtml(summary.mission || data.instruction || '')}</div>
                    <div class="smart-preview-belt">
                        ${(data.items || []).slice(0, 10).map((item) => `
                            <span class="smart-preview-item" title="${escapeHtml(item.label)}">${escapeHtml(item.fallbackIcon || '🌱')}</span>
                        `).join('')}
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                        <span class="badge text-bg-success rounded-pill">${escapeHtml(summary.logic)}</span>
                        <span class="badge text-bg-light border rounded-pill">${summary.itemCount} วัตถุ</span>
                        <span class="badge text-bg-warning rounded-pill">${summary.decoyCount} ตัวหลอก</span>
                        <span class="badge ${summary.tested ? 'text-bg-primary' : 'text-bg-secondary'} rounded-pill">
                            ${summary.tested ? `ทดสอบแล้ว ${Math.round(summary.accuracy * 100)}%` : 'ยังไม่ทดสอบ'}
                        </span>
                    </div>
                </section>
                <aside class="smart-preview-side">
                    <h4>กฎของด่าน</h4>
                    ${ruleLines || '<div class="text-muted small">ยังไม่มีข้อมูลกฎ</div>'}
                    ${options.teacher ? renderTeacherDetails(data) : ''}
                </aside>
            </div>
        `;
        return true;
    }

    function renderTeacherDetails(data) {
        const quality = data.qualityCheck || {};
        const assistance = data.builder_assistance || {};
        const qualityText = [
            quality.balancedBranches ? 'branch สมดุล' : 'branch ยังไม่สมดุล',
            quality.hasGoodDecoys ? 'ตัวหลอกเหมาะสม' : 'ตัวหลอกควรปรับ',
            quality.usesAllDestinations ? 'ใช้ปลายทางครบ' : 'ใช้ปลายทางไม่ครบ',
            quality.diverseItems ? 'วัตถุหลากหลาย' : 'วัตถุยังซ้ำมาก'
        ].join(' | ');
        const rows = [
            ['ผลทดสอบ', data.testResult?.tested ? `${Math.round((data.testResult.accuracy || 0) * 100)}% / ${data.testResult.stars || 0} ดาว` : 'ยังไม่มี'],
            ['เงื่อนไข', (data.conditions || []).map((item) => item.label).join(', ') || '-'],
            ['ปลายทาง', [
                ...(data.actions || []).map((item) => item.label),
                ...(isIfOnly(data) ? [((data.default_behavior || data.defaultBehavior || {}).label || 'ปล่อยผ่านอัตโนมัติ')] : [])
            ].join(', ') || '-'],
            ['ตัวหลอก', (data.items || []).filter((item) => item.isDecoy).map((item) => item.label).join(', ') || '-'],
            ['ผลตรวจคุณภาพ', qualityText],
            ['คำเตือนคุณภาพ', (quality.warnings || []).join(' | ') || '-'],
            ['การใช้ตัวช่วย', assistance.used_auto_fill ? `ใช้ใส่ตัวอย่างเริ่มต้น ${assistance.auto_fill_count || 1} ครั้ง` : 'ไม่ได้ใช้']
        ];
        return `
            <table class="smart-detail-table mt-3">
                ${rows.map(([key, value]) => `
                    <tr><th>${escapeHtml(key)}</th><td>${escapeHtml(value)}</td></tr>
                `).join('')}
            </table>
        `;
    }

    function renderBadges(summary) {
        if (!summary) return '';
        return `
            <div class="project-summary small mt-2">
                <span class="badge text-bg-success rounded-pill">${escapeHtml(summary.logic)}</span>
                <span class="badge text-bg-light border rounded-pill">${summary.itemCount} วัตถุ</span>
                <span class="badge text-bg-warning rounded-pill">${summary.decoyCount} ตัวหลอก</span>
                <span class="badge text-bg-light border rounded-pill">${summary.actionCount} ปลายทาง</span>
                <span class="badge ${summary.tested ? 'text-bg-primary' : 'text-bg-danger'} rounded-pill">
                    ${summary.tested ? `ทดสอบแล้ว ${Math.round(summary.accuracy * 100)}%` : 'ยังไม่พร้อม'}
                </span>
            </div>
        `;
    }

    function createPlayer(target, data, options = {}) {
        const root = typeof target === 'string' ? document.getElementById(target) : target;
        if (!root || !data) return null;

        const state = {
            played: false,
            running: false,
            stats: null,
            mode: options.mode || 'challenge',
            playerRules: []
        };

        function renderShell() {
            const isChallenge = state.mode !== 'preview';
            root.innerHTML = `
            <div class="builder-test-panel p-0 border-0 shadow-none">
                ${options.allowModeSwitch ? `
                    <div class="d-flex flex-wrap gap-2 mb-3">
                        <button type="button" class="btn btn-sm ${state.mode === 'preview' ? 'btn-success' : 'btn-outline-success'} rounded-pill mode-preview"><i class="bi bi-eye"></i> Preview Mode</button>
                        <button type="button" class="btn btn-sm ${state.mode === 'challenge' ? 'btn-primary' : 'btn-outline-primary'} rounded-pill mode-challenge"><i class="bi bi-controller"></i> Challenge Mode</button>
                    </div>
                ` : ''}
                <div class="game-board">
                    <div class="conveyor-play-area">
                        <div class="destination-row"></div>
                        <div class="scan-station"><span class="scan-light"></span><strong>SCAN</strong></div>
                        <div class="belt-line"></div>
                        <div class="moving-item-layer"></div>
                    </div>
                    <div class="item-preview-bar"></div>
                </div>
                ${isChallenge ? `
                    <div class="rule-builder-shell challenge-rule-shell mt-3">
                        <section class="conveyor-panel program-panel">
                            <div class="program-head">
                                <div>
                                    <h4>กฎของฉัน</h4>
                                    <p>ลากบล็อกเงื่อนไขและปลายทางให้ครบก่อนเริ่มสายพาน</p>
                                </div>
                                <div class="block-trash challenge-trash">ลากบล็อกที่วางแล้วมาที่นี่เพื่อลบ</div>
                            </div>
                            <div class="rule-list challenge-rule-list"></div>
                        </section>
                        <aside class="conveyor-panel toolbox-panel">
                            <div class="toolbox-head"><h4>คลังบล็อก</h4></div>
                            <section class="palette-group">
                                <h4>เงื่อนไข</h4>
                                <div class="block-list challenge-condition-blocks"></div>
                            </section>
                            <section class="palette-group">
                                <h4>ปลายทาง</h4>
                                <div class="block-list challenge-action-blocks"></div>
                            </section>
                        </aside>
                    </div>
                ` : `
                    <div class="readable-rules mt-3">
                        <div class="readable-title"><i class="bi bi-card-checklist"></i> Preview Mode ใช้กฎเฉลยของผู้ออกแบบ</div>
                    </div>
                `}
                <div class="d-flex flex-wrap gap-2 align-items-center mt-3">
                    <button type="button" class="btn btn-success rounded-pill fw-bold run-player"><i class="bi bi-play-fill"></i> ${isChallenge ? 'เริ่มสายพานด้วยกฎของฉัน' : 'เล่นด้วยกฎเฉลย'}</button>
                    <button type="button" class="btn btn-outline-secondary rounded-pill fw-bold show-answers" disabled><i class="bi bi-eye-fill"></i> ดูเฉลยหลังเล่น</button>
                    <span class="player-result text-secondary">${isChallenge ? 'สร้างกฎเองก่อนเล่น เฉลยจะถูกซ่อนไว้' : 'Preview Mode จะแสดงผลจากกฎของผู้ออกแบบ'}</span>
                </div>
                <div class="answer-panel mt-3 d-none"></div>
            </div>
        `;
            bindShell();
        }

        let destinationRow;
        let previewBar;
        let movingLayer;
        let result;
        let answerPanel;
        let runButton;
        let answerButton;
        let dragDrop = null;

        renderShell();

        function bindShell() {
            destinationRow = root.querySelector('.destination-row');
            previewBar = root.querySelector('.item-preview-bar');
            movingLayer = root.querySelector('.moving-item-layer');
            result = root.querySelector('.player-result');
            answerPanel = root.querySelector('.answer-panel');
            runButton = root.querySelector('.run-player');
            answerButton = root.querySelector('.show-answers');

            const actions = data.actions || [];
            destinationRow.style.setProperty('--destination-count', String((actions.length || 1) + (isIfOnly(data) ? 1 : 0)));
            destinationRow.innerHTML = actions.map((action) => `
                <div class="destination-card" data-action="${escapeHtml(action.id)}"><strong>${escapeHtml(action.icon || '📦')}</strong><span>${escapeHtml(action.label)}</span></div>
            `).join('') + (isIfOnly(data) ? `
                <div class="pass-through-card"><strong><i class="bi bi-arrow-right-circle-fill"></i></strong><span>${escapeHtml((data.default_behavior || data.defaultBehavior || {}).label || 'ปล่อยผ่านอัตโนมัติ')}</span></div>
            ` : '');

            root.querySelector('.mode-preview')?.addEventListener('click', () => switchMode('preview'));
            root.querySelector('.mode-challenge')?.addEventListener('click', () => switchMode('challenge'));
            runButton.addEventListener('click', run);
            answerButton.addEventListener('click', renderAnswers);
            renderPreview(false);
            initChallengeRules();
        }

        function switchMode(mode) {
            state.mode = mode;
            state.played = false;
            state.stats = null;
            state.playerRules = [];
            renderShell();
        }

        function initChallengeRules() {
            if (state.mode === 'preview') return;
            const shell = root.querySelector('.challenge-rule-shell');
            if (!shell || !window.FarmMissions?.DragDropManager) {
                if (result) result.textContent = 'โหลดคลังบล็อกไม่สำเร็จ กรุณารีเฟรชหน้า';
                return;
            }
            dragDrop = new window.FarmMissions.DragDropManager({
                rootElement: shell,
                rulePanel: root.querySelector('.challenge-rule-list'),
                conditionContainer: root.querySelector('.challenge-condition-blocks'),
                actionContainer: root.querySelector('.challenge-action-blocks'),
                trashElement: root.querySelector('.challenge-trash'),
                previewElement: null,
                onRulesChanged: (rules) => {
                    state.playerRules = rules;
                    state.played = false;
                    answerButton.disabled = true;
                },
                onFeedback: (message) => {
                    result.className = 'player-result text-secondary';
                    result.textContent = message;
                }
            });
            dragDrop.loadLevel({
                ruleSlots: makeChallengeRuleSlots(data),
                conditions: data.conditions || [],
                actions: data.actions || [],
                allowReorder: data.logic_type === 'if_else_if_else'
            });
            state.playerRules = dragDrop.getRules();
        }

        function renderPreview(showAnswers = false) {
            previewBar.innerHTML = (data.items || []).map((item, index) => `
                <button type="button" class="preview-chip" data-index="${index}">
                    <span class="emoji">${escapeHtml(item.fallbackIcon || '🌱')}</span>
                    <small>${escapeHtml(item.label)}</small>
                </button>
            `).join('');
            previewBar.querySelectorAll('.preview-chip').forEach((chip) => {
                chip.addEventListener('click', () => {
                    const item = data.items[Number(chip.dataset.index)];
                    if (options.onInspect) options.onInspect(item, showAnswers || state.played, data);
                    else alert(detailText(item, showAnswers || state.played, data));
                });
            });
        }

        function renderAnswers() {
            answerPanel.classList.remove('d-none');
            answerPanel.innerHTML = `
                <div class="builder-panel shadow-none">
                    <h5 class="fw-bold text-success mb-3"><i class="bi bi-check-circle-fill"></i> เฉลยและเหตุผล</h5>
                    <table class="smart-detail-table">
                        ${(data.items || []).map((item) => `
                            <tr>
                                <th>${escapeHtml(item.fallbackIcon || '')} ${escapeHtml(item.label)}</th>
                                <td>${escapeHtml(resultLabel(item, data))}<br><span class="text-secondary">${escapeHtml(item.explain || '')}</span></td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;
        }

        async function run() {
            if (state.running) return;
            const rulesToRun = state.mode === 'preview' ? (data.rules || []) : (dragDrop ? dragDrop.getRules() : state.playerRules);
            const missingRule = state.mode !== 'preview' && dragDrop?.validateRules();
            if (missingRule) {
                result.className = 'player-result text-warning fw-bold';
                result.textContent = missingRule;
                return;
            }
            state.running = true;
            runButton.disabled = true;
            movingLayer.innerHTML = '';
            let correct = 0;
            const board = root.querySelector('.conveyor-play-area');

            for (const item of data.items || []) {
                const actual = evaluate(item, rulesToRun, data.conditions, data);
                const expected = normalizeAction(item.correctResult || item.correctAction, data);
                const ok = actual === expected;
                if (ok) correct++;
                const token = document.createElement('div');
                token.className = 'moving-token';
                token.textContent = item.fallbackIcon || '🌱';
                setTokenPoint(token, getBoardPoint('start', board));
                movingLayer.appendChild(token);
                await wait(80);
                setTokenPoint(token, getBoardPoint('.scan-station', board));
                await wait(420);
                token.classList.add(ok ? 'correct' : 'wrong');
                const targetSelector = actual === defaultPassAction(data) ? '.pass-through-card' : `[data-action="${cssEscape(actual)}"]`;
                setTokenPoint(token, getBoardPoint(targetSelector, board));
                await wait(420);
                token.remove();
            }

            const total = Math.max(1, (data.items || []).length);
            const accuracy = correct / total;
            state.stats = { correct, total, accuracy };
            state.played = true;
            state.running = false;
            runButton.disabled = false;
            answerButton.disabled = false;
            result.className = accuracy >= .8 ? 'player-result text-success fw-bold' : 'player-result text-warning fw-bold';
            result.textContent = `ผลการเล่น: ถูก ${correct}/${total} ชิ้น (${Math.round(accuracy * 100)}%)`;
            renderPreview(true);
        }

        return { run, state };
    }

    function makeChallengeRuleSlots(data) {
        const slots = (data.rules || []).map((rule) => ({
            type: rule.type || 'if',
            condition: rule.type === 'else' ? 'else' : null,
            action: null
        }));
        if (slots.length) return slots;
        if (isIfOnly(data)) return [{ type: 'if', condition: null, action: null }];
        if (data.logic_type === 'if_else_if_else') return [{ type: 'if' }, { type: 'else_if' }, { type: 'else', condition: 'else' }];
        return [{ type: 'if' }, { type: 'else', condition: 'else' }];
    }

    function detailText(item, showAnswers, data) {
        const props = (item.propsDisplay || []).join(', ');
        if (!showAnswers) {
            return `${item.label}\nคุณสมบัติ: ${props}\n${item.isDecoy ? 'วัตถุนี้อาจเป็นตัวหลอก ลองสังเกตคุณสมบัติให้ดี' : 'ลองดูว่าเข้าเงื่อนไขใด'}`;
        }
        const expected = normalizeAction(item.correctResult || item.correctAction, data);
        const label = expected === defaultPassAction(data)
            ? ((data.default_behavior || data.defaultBehavior || {}).label || 'ปล่อยผ่านอัตโนมัติ')
            : labelOf(data.actions, expected, expected);
        return `${item.label}\nคุณสมบัติ: ${props}\nปลายทางที่ถูกต้อง: ${label}\n${item.explain || ''}`;
    }

    function resultLabel(item, data) {
        const expected = normalizeAction(item.correctResult || item.correctAction, data);
        if (expected === defaultPassAction(data)) {
            return (data.default_behavior || data.defaultBehavior || {}).label || 'ปล่อยผ่านอัตโนมัติ';
        }
        return labelOf(data.actions, expected, expected);
    }

    function wait(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    function getBoardPoint(selector, boardEl) {
        const boardRect = boardEl.getBoundingClientRect();
        if (selector === 'start') {
            return {
                x: Math.max(36, boardRect.width * 0.08),
                y: Math.max(36, boardRect.height - 42)
            };
        }
        const target = boardEl.querySelector(selector);
        if (!target) {
            return {
                x: boardRect.width * 0.92,
                y: Math.max(36, boardRect.height - 42)
            };
        }
        const targetRect = target.getBoundingClientRect();
        return {
            x: targetRect.left + targetRect.width / 2 - boardRect.left,
            y: Math.min(targetRect.top + targetRect.height / 2 - boardRect.top, boardRect.height - 42)
        };
    }

    function setTokenPoint(token, point) {
        token.style.left = `${point.x}px`;
        token.style.top = `${point.y}px`;
    }

    function cssEscape(value) {
        if (window.CSS?.escape) return window.CSS.escape(String(value));
        return String(value).replace(/["\\]/g, '\\$&');
    }

    window.SmartFarmBuilderPreview = {
        evaluate,
        getSummary,
        renderSummary,
        renderBadges,
        createPlayer
    };
})();
