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
        const rows = [
            ['ผลทดสอบ', data.testResult?.tested ? `${Math.round((data.testResult.accuracy || 0) * 100)}% / ${data.testResult.stars || 0} ดาว` : 'ยังไม่มี'],
            ['เงื่อนไข', (data.conditions || []).map((item) => item.label).join(', ') || '-'],
            ['ปลายทาง', [
                ...(data.actions || []).map((item) => item.label),
                ...(isIfOnly(data) ? [((data.default_behavior || data.defaultBehavior || {}).label || 'ปล่อยผ่านอัตโนมัติ')] : [])
            ].join(', ') || '-'],
            ['ตัวหลอก', (data.items || []).filter((item) => item.isDecoy).map((item) => item.label).join(', ') || '-']
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
            stats: null
        };

        root.innerHTML = `
            <div class="builder-test-panel p-0 border-0 shadow-none">
                <div class="game-board">
                    <div class="conveyor-play-area">
                        <div class="destination-row"></div>
                        <div class="scan-station"><span class="scan-light"></span><strong>SCAN</strong></div>
                        <div class="belt-line"></div>
                        <div class="moving-item-layer"></div>
                    </div>
                    <div class="item-preview-bar"></div>
                </div>
                <div class="d-flex flex-wrap gap-2 align-items-center mt-3">
                    <button type="button" class="btn btn-success rounded-pill fw-bold run-player"><i class="bi bi-play-fill"></i> เล่นด่านนี้</button>
                    <button type="button" class="btn btn-outline-secondary rounded-pill fw-bold show-answers" disabled><i class="bi bi-eye-fill"></i> ดูเฉลยหลังเล่น</button>
                    <span class="player-result text-secondary">กดเล่นเพื่อทดสอบกฎของผู้ออกแบบ</span>
                </div>
                <div class="answer-panel mt-3 d-none"></div>
            </div>
        `;

        const destinationRow = root.querySelector('.destination-row');
        const previewBar = root.querySelector('.item-preview-bar');
        const movingLayer = root.querySelector('.moving-item-layer');
        const result = root.querySelector('.player-result');
        const answerPanel = root.querySelector('.answer-panel');
        const runButton = root.querySelector('.run-player');
        const answerButton = root.querySelector('.show-answers');

        const actions = data.actions || [];
        destinationRow.style.setProperty('--destination-count', String((actions.length || 1) + (isIfOnly(data) ? 1 : 0)));
        destinationRow.innerHTML = actions.map((action) => `
            <div class="destination-card"><strong>${escapeHtml(action.icon || '📦')}</strong><span>${escapeHtml(action.label)}</span></div>
        `).join('') + (isIfOnly(data) ? `
            <div class="pass-through-card"><strong><i class="bi bi-arrow-right-circle-fill"></i></strong><span>${escapeHtml((data.default_behavior || data.defaultBehavior || {}).label || 'ปล่อยผ่านอัตโนมัติ')}</span></div>
        ` : '');

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
            state.running = true;
            runButton.disabled = true;
            movingLayer.innerHTML = '';
            let correct = 0;

            for (const item of data.items || []) {
                const actual = evaluate(item, data.rules, data.conditions, data);
                const expected = normalizeAction(item.correctResult || item.correctAction, data);
                const ok = actual === expected;
                if (ok) correct++;
                const token = document.createElement('div');
                token.className = 'moving-token';
                token.textContent = item.fallbackIcon || '🌱';
                token.style.left = '8%';
                token.style.top = '72%';
                movingLayer.appendChild(token);
                await wait(80);
                token.style.left = '50%';
                token.style.top = '48%';
                await wait(420);
                token.classList.add(ok ? 'correct' : 'wrong');
                if (actual === defaultPassAction(data)) {
                    token.style.left = '91%';
                    token.style.top = '72%';
                } else {
                    const actionIndex = Math.max(0, actions.findIndex((action) => action.id === actual));
                    token.style.left = `${destinationLeft(actionIndex, actions.length)}%`;
                    token.style.top = '21%';
                }
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

        runButton.addEventListener('click', run);
        answerButton.addEventListener('click', renderAnswers);
        renderPreview(false);

        return { run, state };
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

    function destinationLeft(index, count) {
        const safeCount = Math.max(1, count || 1);
        if (safeCount === 1) return 50;
        const safeIndex = Math.min(Math.max(index, 0), safeCount - 1);
        return 14 + safeIndex * (72 / (safeCount - 1));
    }

    window.SmartFarmBuilderPreview = {
        evaluate,
        getSummary,
        renderSummary,
        renderBadges,
        createPlayer
    };
})();
