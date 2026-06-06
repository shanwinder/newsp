(function () {
    const logicTypes = {
        if: {
            id: 'if',
            label: 'เกม If',
            title: 'โรงคัดผักสวนครัว',
            caption: 'เหมาะกับมือใหม่ ตรวจกรณีพิเศษ 1 เงื่อนไข',
            theme: 'vegetables',
            themeLabel: 'ผลผลิตจากพืชผัก',
            minItems: 4,
            minDecoys: 2,
            minMatchesPerCondition: 1,
            requiresElse: false,
            ruleSlots: [{ type: 'if' }]
        },
        if_else: {
            id: 'if_else',
            label: 'เกม If / Else',
            title: 'โรงคัดผลไม้แสนอร่อย',
            caption: 'แยกวัตถุเป็น 2 กลุ่ม เข้าเงื่อนไขและกลุ่มที่เหลือ',
            theme: 'fruits',
            themeLabel: 'ผลผลิตจากผลไม้',
            minItems: 6,
            minDecoys: 2,
            minMatchesPerCondition: 2,
            requiresElse: true,
            ruleSlots: [{ type: 'if' }, { type: 'else', condition: 'else' }]
        },
        if_else_if_else: {
            id: 'if_else_if_else',
            label: 'เกม If / Else If / Else',
            title: 'โรงคัดผลผลิตจากฟาร์มสัตว์',
            caption: 'คัดหลายระดับ อ่านกฎจากบนลงล่าง',
            theme: 'animal_products',
            themeLabel: 'ผลผลิตจากสัตว์',
            minItems: 9,
            minDecoys: 2,
            minMatchesPerCondition: 2,
            requiresElse: true,
            ruleSlots: [{ type: 'if' }, { type: 'else_if' }, { type: 'else', condition: 'else' }]
        }
    };

    const actionsByTheme = {
        vegetables: [
            action('wash', 'ส่งเข้าเครื่องล้าง', 'เครื่องล้าง', '🚿'),
            action('pest_table', 'ส่งไปโต๊ะตรวจศัตรูพืช', 'โต๊ะตรวจ', '🔎'),
            action('special_sort', 'ส่งไปคัดแยกพิเศษ', 'คัดแยกพิเศษ', '⚠️'),
            action('compost', 'ส่งไปถังปุ๋ยหมัก', 'ถังปุ๋ยหมัก', '♻️'),
            action('pass', 'ปล่อยผ่านลงตะกร้า', 'ตะกร้าปกติ', '🧺')
        ],
        fruits: [
            action('sell_front', 'ส่งไปขายหน้าร้าน', 'หน้าร้าน', '🏪'),
            action('ripen_room', 'ส่งไปบ่มต่อ', 'ห้องบ่ม', '📦'),
            action('juice_process', 'ส่งไปแปรรูปน้ำผลไม้', 'แปรรูป', '🧃'),
            action('reject_bin', 'ส่งไปถังคัดทิ้ง', 'ถังคัดทิ้ง', '🗑️')
        ],
        animal_products: [
            action('premium_tray', 'ส่งเข้าถาดพรีเมียม', 'ถาดพรีเมียม', '⭐'),
            action('standard_tray', 'ส่งเข้าถาดมาตรฐาน', 'ถาดมาตรฐาน', '🥚'),
            action('clean_station', 'ส่งไปทำความสะอาด', 'ทำความสะอาด', '🧼'),
            action('cool_room', 'ส่งเข้าห้องเย็น', 'ห้องเย็น', '❄️'),
            action('reject_bin', 'ส่งไปถังคัดทิ้ง', 'ถังคัดทิ้ง', '🗑️')
        ]
    };

    const catalog = [
        item('carrot_clean', 'vegetables', 'แครอทสะอาด', '🥕', { type: 'carrot', muddy: false }, ['ชนิด: แครอท', 'คราบโคลน: ไม่มี'], 'clean_carrot', 'แครอทสะอาด', { type: 'carrot', muddy: false }, 'pass', false, ['carrot_muddy']),
        item('carrot_muddy', 'vegetables', 'แครอทเปื้อนโคลน', '🥕', { type: 'carrot', muddy: true }, ['ชนิด: แครอท', 'คราบโคลน: มี'], 'muddy_carrot', 'แครอทเปื้อนโคลน', { type: 'carrot', muddy: true }, 'wash', true, ['carrot_clean']),
        item('lettuce_normal', 'vegetables', 'ผักกาดปกติ', '🥬', { type: 'lettuce', worm: false }, ['ชนิด: ผักกาด', 'หนอน: ไม่มี'], 'normal_lettuce', 'ผักกาดปกติ', { type: 'lettuce', worm: false }, 'pass', false, ['lettuce_worm']),
        item('lettuce_worm', 'vegetables', 'ผักกาดมีหนอน', '🥬', { type: 'lettuce', worm: true }, ['ชนิด: ผักกาด', 'หนอน: มี'], 'worm_lettuce', 'ผักกาดมีหนอน', { type: 'lettuce', worm: true }, 'pest_table', true, ['lettuce_normal']),
        item('potato_normal', 'vegetables', 'มันฝรั่งปกติ', '🥔', { type: 'potato', sprout: false }, ['ชนิด: มันฝรั่ง', 'หน่องอก: ไม่มี'], 'normal_potato', 'มันฝรั่งปกติ', { type: 'potato', sprout: false }, 'pass', false, ['potato_sprout']),
        item('potato_sprout', 'vegetables', 'มันฝรั่งมีหน่องอก', '🥔', { type: 'potato', sprout: true }, ['ชนิด: มันฝรั่ง', 'หน่องอก: มี'], 'sprout_potato', 'มันฝรั่งมีหน่องอก', { type: 'potato', sprout: true }, 'special_sort', true, ['potato_normal']),
        item('cucumber_normal', 'vegetables', 'แตงกวาปกติ', '🥒', { type: 'cucumber', bruised: false }, ['ชนิด: แตงกวา', 'รอยช้ำ: ไม่มี'], 'normal_cucumber', 'แตงกวาปกติ', { type: 'cucumber', bruised: false }, 'pass', false, ['cucumber_bruised']),
        item('cucumber_bruised', 'vegetables', 'แตงกวามีรอยช้ำ', '🥒', { type: 'cucumber', bruised: true }, ['ชนิด: แตงกวา', 'รอยช้ำ: มี'], 'bruised_cucumber', 'แตงกวามีรอยช้ำ', { type: 'cucumber', bruised: true }, 'compost', true, ['cucumber_normal']),

        item('orange_big', 'fruits', 'ส้มลูกใหญ่', '🍊', { type: 'orange', size: 'big' }, ['ชนิด: ส้ม', 'ขนาด: ใหญ่'], 'big_orange', 'ส้มลูกใหญ่', { type: 'orange', size: 'big' }, 'sell_front', false, ['orange_small']),
        item('orange_small', 'fruits', 'ส้มลูกเล็ก', '🍊', { type: 'orange', size: 'small' }, ['ชนิด: ส้ม', 'ขนาด: เล็ก'], 'small_orange', 'ส้มลูกเล็ก', { type: 'orange', size: 'small' }, 'juice_process', true, ['orange_big']),
        item('banana_ripe', 'fruits', 'กล้วยสุก', '🍌', { type: 'banana', ripe: true }, ['ชนิด: กล้วย', 'ความสุก: สุก'], 'ripe_banana', 'กล้วยสุก', { type: 'banana', ripe: true }, 'sell_front', false, ['banana_green']),
        item('banana_green', 'fruits', 'กล้วยดิบ', '🍌', { type: 'banana', ripe: false }, ['ชนิด: กล้วย', 'ความสุก: ดิบ'], 'green_banana', 'กล้วยดิบ', { type: 'banana', ripe: false }, 'ripen_room', true, ['banana_ripe']),
        item('watermelon_good', 'fruits', 'แตงโมเกรดดี', '🍉', { type: 'watermelon', grade: 'good' }, ['ชนิด: แตงโม', 'เกรด: ดี'], 'good_watermelon', 'แตงโมเกรดดี', { type: 'watermelon', grade: 'good' }, 'sell_front', false, ['watermelon_fail']),
        item('watermelon_fail', 'fruits', 'แตงโมไม่ผ่านเกณฑ์', '🍉', { type: 'watermelon', grade: 'fail' }, ['ชนิด: แตงโม', 'เกรด: ไม่ผ่าน'], 'fail_watermelon', 'แตงโมไม่ผ่านเกณฑ์', { type: 'watermelon', grade: 'fail' }, 'reject_bin', true, ['watermelon_good']),
        item('mango_ripe', 'fruits', 'มะม่วงสุก', '🥭', { type: 'mango', ripe: true }, ['ชนิด: มะม่วง', 'ความสุก: สุก'], 'ripe_mango', 'มะม่วงสุก', { type: 'mango', ripe: true }, 'sell_front', false, ['mango_green']),
        item('mango_green', 'fruits', 'มะม่วงดิบ', '🥭', { type: 'mango', ripe: false }, ['ชนิด: มะม่วง', 'ความสุก: ดิบ'], 'green_mango', 'มะม่วงดิบ', { type: 'mango', ripe: false }, 'ripen_room', true, ['mango_ripe']),

        item('egg_big_good', 'animal_products', 'ไข่ใบใหญ่ไม่ร้าว', '🥚', { type: 'egg', size: 'big', cracked: false }, ['ประเภท: ไข่', 'ขนาด: ใหญ่', 'รอยร้าว: ไม่มี'], 'egg_big_good', 'ไข่ใบใหญ่และไม่ร้าว', { type: 'egg', size: 'big', cracked: false }, 'premium_tray', false, ['egg_big_cracked']),
        item('egg_small_good', 'animal_products', 'ไข่ใบเล็กไม่ร้าว', '🥚', { type: 'egg', size: 'small', cracked: false }, ['ประเภท: ไข่', 'ขนาด: เล็ก', 'รอยร้าว: ไม่มี'], 'egg_small_good', 'ไข่ใบเล็กและไม่ร้าว', { type: 'egg', size: 'small', cracked: false }, 'standard_tray', false, ['egg_cracked']),
        item('egg_big_cracked', 'animal_products', 'ไข่ใบใหญ่แต่ร้าว', '🥚', { type: 'egg', size: 'big', cracked: true }, ['ประเภท: ไข่', 'ขนาด: ใหญ่', 'รอยร้าว: มี'], 'egg_big_cracked', 'ไข่ใบใหญ่แต่ร้าว', { type: 'egg', size: 'big', cracked: true }, 'reject_bin', true, ['egg_big_good']),
        item('egg_cracked', 'animal_products', 'ไข่ร้าว', '🥚', { type: 'egg', cracked: true }, ['ประเภท: ไข่', 'รอยร้าว: มี'], 'egg_cracked', 'ไข่ร้าว', { type: 'egg', cracked: true }, 'reject_bin', true, ['egg_small_good']),
        item('wool_clean', 'animal_products', 'ขนแกะสะอาด', '🧶', { type: 'wool', clean: true, grass: false }, ['ประเภท: ขนแกะ', 'ความสะอาด: สะอาด'], 'clean_wool', 'ขนแกะสะอาด', { type: 'wool', clean: true }, 'standard_tray', false, ['wool_grass']),
        item('wool_grass', 'animal_products', 'ขนแกะมีเศษหญ้า', '🧶', { type: 'wool', clean: false, grass: true }, ['ประเภท: ขนแกะ', 'เศษหญ้า: มี'], 'wool_grass', 'ขนแกะมีเศษหญ้า', { type: 'wool', grass: true }, 'clean_station', true, ['wool_clean']),
        item('milk_good', 'animal_products', 'ขวดนมเย็นคุณภาพดี', '🥛', { type: 'milk', cold: true, spoiled: false }, ['ประเภท: นม', 'อุณหภูมิ: เย็น', 'เสีย: ไม่เสีย'], 'good_milk', 'ขวดนมเย็นคุณภาพดี', { type: 'milk', cold: true, spoiled: false }, 'cool_room', false, ['milk_hot']),
        item('milk_hot', 'animal_products', 'ขวดนมอุณหภูมิสูง', '🥛', { type: 'milk', cold: false, spoiled: false }, ['ประเภท: นม', 'อุณหภูมิ: สูง'], 'hot_milk', 'ขวดนมอุณหภูมิสูง', { type: 'milk', cold: false }, 'reject_bin', true, ['milk_good'])
    ];

    const state = {
        logicType: 'if',
        activeTheme: 'vegetables',
        selectedItems: [],
        rules: [],
        tested: false,
        testResult: null,
        dragDrop: null,
        booted: false
    };

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        const root = document.getElementById('smart-farm-builder');
        if (!root) return;

        state.root = root;
        renderLogicCards();
        bindFields();
        bindButtons();
        hydrateExisting(root);
        if (!state.booted) setLogicType(state.logicType);
        renderAll();
    }

    function hydrateExisting(root) {
        const raw = root.dataset.existing || '';
        let data = null;
        try {
            data = raw && raw !== 'null' ? JSON.parse(raw) : null;
        } catch (error) {
            data = null;
        }
        if (!data || data.project_type !== 'smart_farm_mini_game') return;

        state.logicType = data.logic_type || 'if';
        state.activeTheme = data.theme || logicTypes[state.logicType].theme;
        state.selectedItems = (data.items || []).map((saved) => ({
            ...saved,
            uid: saved.uid || uid(),
            catalogId: saved.catalogId || saved.id
        }));
        state.rules = (data.rules || []).map((rule) => ({ ...rule }));
        state.tested = Boolean(data.testResult?.tested);
        state.testResult = data.testResult || null;
        document.getElementById('level-title').value = data.title || '';
        document.getElementById('level-mission').value = data.mission || '';
        document.getElementById('level-instruction').value = data.instruction || '';
        state.booted = true;
    }

    function bindFields() {
        ['level-title', 'level-mission', 'level-instruction'].forEach((id) => {
            document.getElementById(id).addEventListener('input', () => {
                state.tested = false;
                renderValidation();
                updateSubmitState();
            });
        });
    }

    function bindButtons() {
        document.getElementById('add-decoys').addEventListener('click', addSuggestedDecoys);
        document.getElementById('auto-fill-rules').addEventListener('click', autoFillRules);
        document.getElementById('run-test').addEventListener('click', runTest);
        document.getElementById('submit-work').addEventListener('click', submitWork);
    }

    function renderLogicCards() {
        const container = document.getElementById('logic-type-cards');
        container.innerHTML = Object.values(logicTypes).map((logic) => `
            <button type="button" class="logic-type-card" data-logic="${logic.id}">
                <strong>${escapeHtml(logic.label)}</strong>
                <span>${escapeHtml(logic.title)}</span>
                <small>${escapeHtml(logic.caption)}</small>
            </button>
        `).join('');
        container.querySelectorAll('.logic-type-card').forEach((card) => {
            card.addEventListener('click', () => setLogicType(card.dataset.logic));
        });
    }

    function setLogicType(type) {
        const logic = logicTypes[type] || logicTypes.if;
        state.logicType = logic.id;
        state.activeTheme = logic.theme;
        state.selectedItems = state.selectedItems.filter((item) => item.theme === logic.theme);
        state.rules = makeRuleSlots(logic.ruleSlots, state.rules);
        state.tested = false;
        renderAll();
    }

    function renderAll() {
        updateLogicCards();
        renderCatalogFilter();
        renderCatalog();
        renderSelectedItems();
        renderRuleBuilder();
        renderDestinations();
        renderPreviewBar(false);
        renderValidation();
        renderTestResult();
        updateSubmitState();
    }

    function updateLogicCards() {
        document.querySelectorAll('.logic-type-card').forEach((card) => {
            card.classList.toggle('active', card.dataset.logic === state.logicType);
        });
    }

    function renderCatalogFilter() {
        const logic = logicTypes[state.logicType];
        const container = document.getElementById('catalog-filter');
        container.innerHTML = `
            <button type="button" class="active" data-theme="${logic.theme}">
                ${escapeHtml(logic.themeLabel)}
            </button>
        `;
    }

    function renderCatalog() {
        const container = document.getElementById('item-catalog');
        const items = catalog.filter((itemData) => itemData.theme === state.activeTheme);
        container.innerHTML = items.map((itemData) => `
            <button type="button" class="catalog-item" data-id="${itemData.id}">
                <span class="item-emoji">${escapeHtml(itemData.fallbackIcon)}</span>
                <span class="item-name">${escapeHtml(itemData.label)}</span>
                <span class="item-tags">${escapeHtml(itemData.propsDisplay.slice(0, 2).join(' | '))}</span>
            </button>
        `).join('');
        container.querySelectorAll('.catalog-item').forEach((button) => {
            button.addEventListener('click', () => addItem(button.dataset.id));
        });
    }

    function renderSelectedItems() {
        const container = document.getElementById('selected-items');
        const actions = getActions();
        document.getElementById('selected-count').textContent = `${state.selectedItems.length} ชิ้น`;

        if (!state.selectedItems.length) {
            container.innerHTML = '<div class="text-center text-secondary border rounded-3 p-4">ยังไม่มีวัตถุในด่าน เลือกจากคลังด้านบนเพื่อเริ่มสร้างสายพาน</div>';
            return;
        }

        container.innerHTML = state.selectedItems.map((itemData) => `
            <div class="selected-item-row" data-uid="${itemData.uid}">
                <span class="mini-emoji">${escapeHtml(itemData.fallbackIcon)}</span>
                <div>
                    <div class="name">${escapeHtml(itemData.label)}</div>
                    <div class="props">${escapeHtml(itemData.propsDisplay.join(' | '))}</div>
                </div>
                <select class="form-select form-select-sm correct-action">
                    ${actions.map((actionItem) => `
                        <option value="${actionItem.id}" ${actionItem.id === itemData.correctAction ? 'selected' : ''}>${escapeHtml(actionItem.label)}</option>
                    `).join('')}
                </select>
                <label class="decoy-toggle">
                    <input type="checkbox" class="form-check-input decoy-check" ${itemData.isDecoy ? 'checked' : ''}>
                    ตัวหลอก
                </label>
                <button type="button" class="btn btn-sm btn-outline-danger remove-item" title="ลบวัตถุ"><i class="bi bi-x-lg"></i></button>
            </div>
        `).join('');

        container.querySelectorAll('.selected-item-row').forEach((row) => {
            const uidValue = row.dataset.uid;
            row.querySelector('.correct-action').addEventListener('change', (event) => updateItem(uidValue, { correctAction: event.target.value }));
            row.querySelector('.decoy-check').addEventListener('change', (event) => updateItem(uidValue, { isDecoy: event.target.checked }));
            row.querySelector('.remove-item').addEventListener('click', () => removeItem(uidValue));
        });
    }

    function renderRuleBuilder() {
        const logic = logicTypes[state.logicType];
        const conditions = deriveConditions();
        const actions = getActions();

        if (!state.dragDrop) {
            state.dragDrop = new window.FarmMissions.DragDropManager({
                rootElement: document.querySelector('.rule-builder-shell'),
                rulePanel: document.getElementById('builder-rule-list'),
                conditionContainer: document.getElementById('builder-condition-blocks'),
                actionContainer: document.getElementById('builder-action-blocks'),
                trashElement: document.getElementById('builder-block-trash'),
                previewElement: null,
                onRulesChanged: (rules) => {
                    state.rules = rules;
                    state.tested = false;
                    renderValidation();
                    updateSubmitState();
                },
                onFeedback: showValidationMessage
            });
        }

        const slots = makeRuleSlots(logic.ruleSlots, state.rules);
        state.dragDrop.loadLevel({
            ruleSlots: slots,
            conditions,
            actions,
            allowReorder: logic.id === 'if_else_if_else'
        });
        state.rules = state.dragDrop.getRules();
        document.getElementById('builder-rule-caption').textContent = `${logic.label}: ${logic.caption}`;
    }

    function renderDestinations() {
        const container = document.getElementById('builder-destinations');
        container.innerHTML = getActions().slice(0, 4).map((actionItem) => `
            <div class="destination-card" data-action="${actionItem.id}">
                <strong>${escapeHtml(actionItem.icon)}</strong>
                <span>${escapeHtml(actionItem.destination)}</span>
            </div>
        `).join('');
    }

    function renderPreviewBar(showAnswers) {
        const container = document.getElementById('builder-preview-bar');
        if (!state.selectedItems.length) {
            container.innerHTML = '<span class="text-secondary small">แถบรายการวัตถุจะแสดงที่นี่ และไม่ทับพื้นที่สายพาน</span>';
            return;
        }
        container.innerHTML = state.selectedItems.map((itemData, index) => `
            <button type="button" class="preview-chip" data-index="${index}">
                <span class="emoji">${escapeHtml(itemData.fallbackIcon)}</span>
                <small>${escapeHtml(itemData.label)}</small>
            </button>
        `).join('');
        container.querySelectorAll('.preview-chip').forEach((chip) => {
            chip.addEventListener('click', () => showItemDetail(state.selectedItems[Number(chip.dataset.index)], showAnswers));
        });
    }

    function renderValidation() {
        const box = document.getElementById('validation-box');
        const result = validateCurrent();
        box.classList.toggle('has-errors', !result.ok);
        box.classList.toggle('is-ready', result.ok);
        box.innerHTML = result.ok
            ? '<i class="bi bi-check-circle-fill"></i> โครงสร้างด่านพร้อมทดลองเล่นแล้ว'
            : `<strong>สิ่งที่ยังต้องแก้:</strong><ul class="mb-0 mt-1">${result.errors.slice(0, 6).map((error) => `<li>${escapeHtml(error)}</li>`).join('')}</ul>`;
    }

    function renderTestResult() {
        const box = document.getElementById('test-result');
        if (!state.tested || !state.testResult) {
            box.textContent = 'ยังไม่ได้ทดลองเล่น';
            return;
        }
        const percent = Math.round((state.testResult.accuracy || 0) * 100);
        box.innerHTML = `<strong>ผลทดสอบล่าสุด:</strong> ถูก ${state.testResult.correct}/${state.testResult.total} ชิ้น (${percent}%) | ดาว ${'★'.repeat(state.testResult.stars)}${'☆'.repeat(3 - state.testResult.stars)}`;
    }

    function addItem(id) {
        const base = catalog.find((entry) => entry.id === id);
        if (!base) return;
        state.selectedItems.push({
            ...clone(base),
            uid: uid(),
            catalogId: base.id,
            isDecoy: Boolean(base.defaultDecoy),
            correctAction: base.defaultAction,
            explain: makeExplain(base, base.defaultAction)
        });
        state.tested = false;
        refreshAfterItemsChanged();
    }

    function addSuggestedDecoys() {
        const existingIds = new Set(state.selectedItems.map((entry) => entry.catalogId));
        const suggestions = [];
        state.selectedItems.forEach((entry) => {
            (entry.suggestedDecoyIds || []).forEach((id) => {
                if (!existingIds.has(id)) {
                    const found = catalog.find((catalogItem) => catalogItem.id === id && catalogItem.theme === state.activeTheme);
                    if (found) {
                        existingIds.add(id);
                        suggestions.push(found);
                    }
                }
            });
        });

        if (!suggestions.length) {
            alert('ยังไม่มีตัวหลอกแนะนำเพิ่มเติมจากวัตถุที่เลือก ลองเลือกวัตถุหลักเพิ่มก่อน');
            return;
        }

        suggestions.slice(0, 4).forEach((base) => {
            state.selectedItems.push({
                ...clone(base),
                uid: uid(),
                catalogId: base.id,
                isDecoy: true,
                correctAction: base.defaultAction,
                explain: makeExplain(base, base.defaultAction)
            });
        });
        state.tested = false;
        refreshAfterItemsChanged();
    }

    function updateItem(uidValue, updates) {
        const target = state.selectedItems.find((entry) => entry.uid === uidValue);
        if (!target) return;
        Object.assign(target, updates);
        target.explain = makeExplain(target, target.correctAction);
        state.tested = false;
        refreshAfterItemsChanged(false);
    }

    function removeItem(uidValue) {
        state.selectedItems = state.selectedItems.filter((entry) => entry.uid !== uidValue);
        state.tested = false;
        refreshAfterItemsChanged();
    }

    function refreshAfterItemsChanged(rebuildRules = true) {
        renderSelectedItems();
        if (rebuildRules) renderRuleBuilder();
        renderPreviewBar(false);
        renderValidation();
        renderTestResult();
        updateSubmitState();
    }

    function autoFillRules() {
        const logic = logicTypes[state.logicType];
        const conditions = deriveConditions();
        if (!conditions.length) {
            alert('ต้องเลือกวัตถุก่อน ระบบจึงจะสร้างเงื่อนไขได้');
            return;
        }
        const slots = logic.ruleSlots.map((slot, index) => {
            if (slot.type === 'else') {
                return { type: 'else', condition: 'else', action: mostCommonActionForElse() };
            }
            const condition = conditions[index] || conditions[0];
            return { type: slot.type, condition: condition.id, action: actionForCondition(condition) };
        });
        state.rules = slots;
        state.tested = false;
        renderRuleBuilder();
        renderValidation();
        updateSubmitState();
    }

    async function runTest() {
        const validation = validateCurrent();
        if (!validation.ok) {
            renderValidation();
            alert('ยังทดลองเล่นไม่ได้ กรุณาแก้ข้อมูลให้ครบก่อน');
            return;
        }

        const button = document.getElementById('run-test');
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> กำลังทดลองเล่น...';
        const movingLayer = document.getElementById('moving-item-layer');
        movingLayer.innerHTML = '';

        let correct = 0;
        const conditions = deriveConditions();
        for (const itemData of state.selectedItems) {
            const actualAction = window.SmartFarmBuilderPreview.evaluate(itemData, state.rules, conditions);
            const ok = actualAction === itemData.correctAction;
            if (ok) correct++;
            await animateItem(itemData, actualAction, ok);
        }

        const total = Math.max(1, state.selectedItems.length);
        const accuracy = correct / total;
        state.tested = true;
        state.testResult = {
            tested: true,
            correct,
            total,
            accuracy,
            stars: starsFor(accuracy),
            lastTestAt: new Date().toISOString()
        };
        renderPreviewBar(true);
        renderTestResult();
        updateSubmitState();
        button.disabled = false;
        button.innerHTML = '<i class="bi bi-play-fill"></i> ทดลองเล่นด่านของฉัน';
    }

    function animateItem(itemData, actualAction, ok) {
        return new Promise((resolve) => {
            const layer = document.getElementById('moving-item-layer');
            const token = document.createElement('div');
            token.className = 'moving-token';
            token.textContent = itemData.fallbackIcon || '🌱';
            token.style.left = '8%';
            token.style.top = '72%';
            layer.appendChild(token);

            window.setTimeout(() => {
                token.style.left = '50%';
                token.style.top = '48%';
            }, 80);

            window.setTimeout(() => {
                token.classList.add(ok ? 'correct' : 'wrong');
                const index = Math.max(0, getActions().findIndex((actionItem) => actionItem.id === actualAction));
                token.style.left = `${18 + (index % 4) * 21}%`;
                token.style.top = '20%';
            }, 540);

            window.setTimeout(() => {
                token.remove();
                resolve();
            }, 990);
        });
    }

    function submitWork() {
        const validation = validateCurrent();
        if (!validation.ok) {
            renderValidation();
            alert('ยังส่งงานไม่ได้ กรุณาแก้ข้อมูลให้ครบก่อน');
            return;
        }
        if (!state.tested) {
            alert('กรุณาทดลองเล่นด่านของตนเองก่อนส่งผลงาน');
            return;
        }

        const payload = buildPayload();
        const description = [
            payload.title,
            payload.mission,
            payload.instruction
        ].filter(Boolean).join('\n\n');

        if (!confirm('ยืนยันส่งด่านฟาร์มอัจฉริยะนี้ใช่ไหม?')) return;

        fetch('../api/save_work.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                game_id: 3,
                description,
                items: payload
            })
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    window.location.href = 'showcase.php?game_id=3';
                    return;
                }
                alert(data.error || data.message || 'บันทึกชิ้นงานไม่สำเร็จ');
            })
            .catch(() => alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'));
    }

    function buildPayload() {
        const logic = logicTypes[state.logicType];
        const actions = getActions();
        const conditions = deriveConditions();
        return {
            project_type: 'smart_farm_mini_game',
            game_id: 3,
            builder_version: '1.0',
            logic_type: state.logicType,
            theme: logic.theme,
            themeLabel: logic.themeLabel,
            title: document.getElementById('level-title').value.trim(),
            mission: document.getElementById('level-mission').value.trim(),
            instruction: document.getElementById('level-instruction').value.trim(),
            items: state.selectedItems.map((itemData) => ({
                uid: itemData.uid,
                catalogId: itemData.catalogId,
                id: itemData.id,
                label: itemData.label,
                fallbackIcon: itemData.fallbackIcon,
                theme: itemData.theme,
                props: itemData.props,
                propsDisplay: itemData.propsDisplay,
                conditionId: itemData.conditionId,
                conditionLabel: itemData.conditionLabel,
                conditionProps: itemData.conditionProps,
                correctAction: itemData.correctAction,
                isDecoy: Boolean(itemData.isDecoy),
                explain: itemData.explain || makeExplain(itemData, itemData.correctAction)
            })),
            conditions,
            actions,
            rules: state.rules,
            previewBar: {
                clickable: true,
                showDecoyHintBeforePlay: true,
                showAnswerAfterPlay: true
            },
            testResult: state.testResult || { tested: false }
        };
    }

    function validateCurrent() {
        return window.SmartFarmBuilderValidation.validateConfig({
            logic: logicTypes[state.logicType],
            title: document.getElementById('level-title').value.trim(),
            mission: document.getElementById('level-mission').value.trim(),
            instruction: document.getElementById('level-instruction').value.trim(),
            items: state.selectedItems,
            conditions: deriveConditions(),
            actions: getActions(),
            rules: state.rules
        }, state.rules);
    }

    function updateSubmitState() {
        const button = document.getElementById('submit-work');
        const valid = validateCurrent().ok;
        button.disabled = !(valid && state.tested);
    }

    function deriveConditions() {
        const map = new Map();
        state.selectedItems.forEach((itemData) => {
            if (!map.has(itemData.conditionId)) {
                map.set(itemData.conditionId, {
                    id: itemData.conditionId,
                    label: itemData.conditionLabel,
                    type: 'match',
                    props: itemData.conditionProps,
                    match: itemData.conditionProps
                });
            }
        });
        return Array.from(map.values());
    }

    function getActions() {
        return actionsByTheme[logicTypes[state.logicType].theme] || actionsByTheme.vegetables;
    }

    function makeRuleSlots(defaultSlots, existingRules) {
        return defaultSlots.map((slot, index) => {
            const existing = existingRules?.[index] || {};
            const type = slot.type;
            return {
                type,
                condition: type === 'else' ? 'else' : (existing.condition || slot.condition || null),
                action: existing.action || slot.action || null
            };
        });
    }

    function actionForCondition(condition) {
        const match = state.selectedItems.find((itemData) => itemData.conditionId === condition.id);
        return match?.correctAction || getActions()[0]?.id || null;
    }

    function mostCommonActionForElse() {
        const counts = new Map();
        state.selectedItems.forEach((itemData) => {
            counts.set(itemData.correctAction, (counts.get(itemData.correctAction) || 0) + 1);
        });
        return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || getActions().at(-1)?.id || null;
    }

    function showItemDetail(itemData, showAnswers) {
        const modal = new bootstrap.Modal(document.getElementById('itemDetailModal'));
        document.getElementById('item-detail-title').textContent = itemData.label;
        const actionLabel = getActions().find((actionItem) => actionItem.id === itemData.correctAction)?.label || itemData.correctAction;
        document.getElementById('item-detail-body').innerHTML = `
            <div class="text-center display-4 mb-2">${escapeHtml(itemData.fallbackIcon)}</div>
            <div class="detail-props">
                ${itemData.propsDisplay.map((prop) => `<span>${escapeHtml(prop)}</span>`).join('')}
            </div>
            <p class="mb-2"><strong>สถานะก่อนเล่น:</strong> ${itemData.isDecoy ? 'วัตถุนี้อาจเป็นตัวหลอก ลองสังเกตคุณสมบัติให้ดี' : 'วัตถุหลักของด่าน ลองจับคู่กับเงื่อนไข'}</p>
            ${showAnswers ? `
                <hr>
                <p class="mb-2"><strong>เงื่อนไขที่เกี่ยวข้อง:</strong> ${escapeHtml(itemData.conditionLabel)}</p>
                <p class="mb-2"><strong>ปลายทางที่ถูกต้อง:</strong> ${escapeHtml(actionLabel)}</p>
                <p class="mb-0 text-secondary">${escapeHtml(itemData.explain || '')}</p>
            ` : '<p class="mb-0 text-secondary">เฉลยปลายทางจะแสดงหลังทดลองเล่น</p>'}
        `;
        modal.show();
    }

    function showValidationMessage(message, type) {
        const box = document.getElementById('validation-box');
        box.classList.toggle('has-errors', type === 'error');
        box.classList.toggle('is-ready', type === 'success');
        box.textContent = message;
        window.setTimeout(renderValidation, 1200);
    }

    function action(id, label, destination, icon) {
        return { id, label, destination, icon };
    }

    function item(id, theme, label, fallbackIcon, props, propsDisplay, conditionId, conditionLabel, conditionProps, defaultAction, defaultDecoy, suggestedDecoyIds) {
        return {
            id,
            theme,
            label,
            fallbackIcon,
            props,
            propsDisplay,
            conditionId,
            conditionLabel,
            conditionProps,
            defaultAction,
            defaultDecoy,
            suggestedDecoyIds
        };
    }

    function makeExplain(itemData, actionId) {
        const actionLabel = getActions().find((actionItem) => actionItem.id === actionId)?.label || actionId;
        const decoyText = itemData.isDecoy ? ' เป็นตัวหลอกหรือกลุ่มอื่นที่ต้องระวัง' : '';
        return `${itemData.label}${decoyText} จึงควร${actionLabel}`;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function uid() {
        return `sf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function starsFor(accuracy) {
        if (accuracy >= .9) return 3;
        if (accuracy >= .75) return 2;
        if (accuracy >= .6) return 1;
        return 0;
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[char]));
    }
})();
