// Drag and drop manager for Smart Farm Manager rule blocks.
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

    function hasTransferType(event, type) {
        return Array.from(event.dataTransfer?.types || []).includes(type);
    }

    class DragDropManager {
        constructor({ rootElement, rulePanel, conditionContainer, actionContainer, trashElement, previewElement, onRulesChanged, onFeedback }) {
            this.rootElement = rootElement;
            this.rulePanel = rulePanel;
            this.conditionContainer = conditionContainer;
            this.actionContainer = actionContainer;
            this.trashElement = trashElement;
            this.previewElement = previewElement;
            this.onRulesChanged = onRulesChanged || function () {};
            this.onFeedback = onFeedback || function () {};
            this.rules = [];
            this.conditions = [];
            this.actions = [];
            this.allowReorder = false;
            this.selected = null;
            this.locked = false;
            this.history = [];
            this.bound = false;
            this.dragPayload = null;
            this.bind();
        }

        loadLevel({ ruleSlots, conditions, actions, allowReorder }) {
            this.rules = (ruleSlots || [{ type: 'if' }]).map((row, index) => ({
                type: row.type || (index === 0 ? 'if' : 'else_if'),
                condition: row.condition || (row.type === 'else' ? 'else' : null),
                action: row.action || null
            }));
            this.conditions = conditions || [];
            this.actions = actions || [];
            this.allowReorder = Boolean(allowReorder);
            this.selected = null;
            this.history = [];
            this.render();
            this.emit();
        }

        setLocked(locked) {
            this.locked = Boolean(locked);
            this.render();
        }

        getRules() {
            return this.rules.map((rule) => ({ ...rule }));
        }

        validateRules() {
            for (let index = 0; index < this.rules.length; index++) {
                const rule = this.rules[index];
                if (rule.type !== 'else' && !rule.condition) return 'ยังมีช่องเงื่อนไขว่างอยู่';
                if (!rule.action) return 'ยังมีช่องคำสั่งว่างอยู่';
            }
            return null;
        }

        clear() {
            if (this.locked) return;
            this.pushHistory();
            this.rules = this.rules.map((rule) => ({
                type: rule.type,
                condition: rule.type === 'else' ? 'else' : null,
                action: null
            }));
            this.selected = null;
            this.render();
            this.emit();
        }

        undo() {
            if (this.locked) return false;
            const previous = this.history.pop();
            if (!previous) return false;
            this.rules = JSON.parse(previous);
            this.selected = null;
            this.render();
            this.emit();
            return true;
        }

        createBlock(blockData) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `logic-block ${blockData.kind}${this.selected && this.selected.kind === blockData.kind && this.selected.value === blockData.id ? ' selected' : ''}`;
            button.draggable = !this.locked;
            button.dataset.kind = blockData.kind;
            button.dataset.value = blockData.id;
            button.textContent = blockData.label;
            button.title = blockData.kind === 'condition' ? `เงื่อนไข: ${blockData.label}` : `คำสั่ง: ${blockData.label}`;
            button.disabled = this.locked;
            return button;
        }

        registerSlot(slotElement) {
            slotElement.classList.toggle('can-drop', !this.locked && !slotElement.classList.contains('fixed'));
        }

        handleDrop(blockData, slotElement) {
            if (this.locked || !slotElement || slotElement.classList.contains('fixed')) return false;
            const accept = slotElement.dataset.accept;
            const ruleIndex = Number(slotElement.dataset.ruleIndex);
            if (!blockData || blockData.kind !== accept) {
                this.rejectSlot(slotElement);
                this.onFeedback(`ช่องนี้ต้องใช้${accept === 'condition' ? 'บล็อกเงื่อนไข' : 'บล็อกคำสั่ง'}เท่านั้น`, 'error');
                return false;
            }

            this.pushHistory();
            const targetRule = this.rules[ruleIndex];
            const oldValue = targetRule[accept];
            targetRule[accept] = blockData.value;

            if (blockData.source === 'slot') {
                const fromRule = this.rules[Number(blockData.ruleIndex)];
                if (fromRule && Number(blockData.ruleIndex) !== ruleIndex) {
                    fromRule[accept] = oldValue || null;
                }
            }

            this.selected = null;
            this.render();
            this.emit();
            this.onFeedback('วางบล็อกสำเร็จ กฎตัวอย่างอัปเดตแล้ว', 'success');
            return true;
        }

        removeBlock(slotElement) {
            if (this.locked || !slotElement || slotElement.classList.contains('fixed')) return false;
            const kind = slotElement.dataset.accept;
            const ruleIndex = Number(slotElement.dataset.ruleIndex);
            if (!this.rules[ruleIndex] || !this.rules[ruleIndex][kind]) return false;
            this.pushHistory();
            this.rules[ruleIndex][kind] = null;
            this.selected = null;
            this.render();
            this.emit();
            this.onFeedback('ลบบล็อกออกจากช่องแล้ว', 'info');
            return true;
        }

        swapRows(from, to) {
            if (this.locked || !this.allowReorder || from === to) return false;
            const source = this.rules[from];
            const target = this.rules[to];
            if (!source || !target || source.type === 'else' || target.type === 'else') {
                this.onFeedback('แถว Else ต้องอยู่ท้ายสุดเสมอ', 'error');
                return false;
            }
            this.pushHistory();
            const sourcePair = { condition: source.condition, action: source.action };
            source.condition = target.condition;
            source.action = target.action;
            target.condition = sourcePair.condition;
            target.action = sourcePair.action;
            this.render();
            this.emit();
            this.onFeedback('สลับลำดับ If / Else If แล้ว ระบบจะอ่านกฎบนสุดก่อน', 'info');
            return true;
        }

        bind() {
            if (this.bound || !this.rootElement) return;
            this.bound = true;

            this.rootElement.addEventListener('click', (event) => {
                const block = event.target.closest('.logic-block');
                if (block) {
                    if (this.locked) return;
                    this.selected = { source: 'palette', kind: block.dataset.kind, value: block.dataset.value };
                    this.render();
                    this.onFeedback(`เลือก "${block.textContent.trim()}" แล้ว แตะช่องที่ต้องการวาง`, 'info');
                    return;
                }

                const slot = event.target.closest('.drop-slot');
                if (!slot || slot.classList.contains('fixed')) return;
                if (this.selected) {
                    this.handleDrop(this.selected, slot);
                    return;
                }
                this.removeBlock(slot);
            });

            this.rootElement.addEventListener('dragstart', (event) => {
                const placed = event.target.closest('.placed-block');
                const block = event.target.closest('.logic-block');
                const row = event.target.closest('.rule-row');

                if (placed) {
                    const slot = placed.closest('.drop-slot');
                    const payload = {
                        source: 'slot',
                        kind: slot.dataset.accept,
                        value: placed.dataset.value,
                        ruleIndex: slot.dataset.ruleIndex
                    };
                    event.dataTransfer.setData('application/json', JSON.stringify(payload));
                    event.dataTransfer.effectAllowed = 'move';
                    this.dragPayload = payload;
                    placed.classList.add('dragging');
                    return;
                }

                if (block) {
                    if (this.locked) return event.preventDefault();
                    const payload = { source: 'palette', kind: block.dataset.kind, value: block.dataset.value };
                    event.dataTransfer.setData('application/json', JSON.stringify(payload));
                    event.dataTransfer.effectAllowed = 'copy';
                    this.dragPayload = payload;
                    this.selected = payload;
                    this.render();
                    return;
                }

                if (row && row.draggable) {
                    event.dataTransfer.setData('text/rule-row', row.dataset.ruleIndex);
                    row.classList.add('dragging');
                }
            });

            this.rootElement.addEventListener('dragover', (event) => {
                const slot = event.target.closest('.drop-slot');
                const row = event.target.closest('.rule-row');
                const trash = event.target.closest('.block-trash');
                if (slot && !slot.classList.contains('fixed') && hasTransferType(event, 'application/json')) {
                    event.preventDefault();
                    const payload = this.readPayload(event);
                    slot.classList.toggle('drop-target', payload?.kind === slot.dataset.accept);
                    slot.classList.toggle('drop-reject', payload?.kind !== slot.dataset.accept);
                    return;
                }
                if (trash && hasTransferType(event, 'application/json')) {
                    event.preventDefault();
                    trash.classList.add('drop-target');
                    return;
                }
                if (row && row.draggable && hasTransferType(event, 'text/rule-row')) {
                    event.preventDefault();
                    row.classList.add('drag-over');
                }
            });

            this.rootElement.addEventListener('dragleave', (event) => {
                event.target.closest('.drop-slot')?.classList.remove('drop-target', 'drop-reject');
                event.target.closest('.rule-row')?.classList.remove('drag-over');
                event.target.closest('.block-trash')?.classList.remove('drop-target');
            });

            this.rootElement.addEventListener('drop', (event) => {
                const slot = event.target.closest('.drop-slot');
                const row = event.target.closest('.rule-row');
                const trash = event.target.closest('.block-trash');
                this.rootElement.querySelectorAll('.drop-target, .drop-reject, .drag-over').forEach((item) => {
                    item.classList.remove('drop-target', 'drop-reject', 'drag-over');
                });

                if (slot && !slot.classList.contains('fixed')) {
                    event.preventDefault();
                    this.handleDrop(this.readPayload(event), slot);
                    return;
                }

                if (trash && hasTransferType(event, 'application/json')) {
                    event.preventDefault();
                    const payload = this.readPayload(event);
                    if (payload?.source === 'slot') {
                        const sourceSlot = this.rulePanel.querySelector(`.drop-slot[data-rule-index="${payload.ruleIndex}"][data-accept="${payload.kind}"]`);
                        this.removeBlock(sourceSlot);
                    } else {
                        this.onFeedback('ลากบล็อกที่วางแล้วมาที่ถังเพื่อลบออกจากโปรแกรม', 'info');
                    }
                    return;
                }

                if (row && row.draggable && hasTransferType(event, 'text/rule-row')) {
                    event.preventDefault();
                    this.swapRows(Number(event.dataTransfer.getData('text/rule-row')), Number(row.dataset.ruleIndex));
                }
            });

            this.rootElement.addEventListener('dragend', () => {
                this.dragPayload = null;
                this.rootElement.querySelectorAll('.dragging, .drop-target, .drop-reject, .drag-over').forEach((item) => {
                    item.classList.remove('dragging', 'drop-target', 'drop-reject', 'drag-over');
                });
            });
        }

        readPayload(event) {
            try {
                const raw = event.dataTransfer.getData('application/json');
                return raw ? JSON.parse(raw) : this.dragPayload;
            } catch (error) {
                return this.dragPayload;
            }
        }

        pushHistory() {
            this.history.push(JSON.stringify(this.rules));
            if (this.history.length > 24) this.history.shift();
        }

        emit() {
            this.onRulesChanged(this.getRules());
        }

        render() {
            this.renderRules();
            this.renderBlocks();
            this.renderPreview();
        }

        renderRules() {
            if (!this.rulePanel) return;
            this.rulePanel.innerHTML = '';
            this.rules.forEach((rule, index) => {
                const row = document.createElement('div');
                row.className = 'rule-row';
                row.dataset.ruleIndex = index;
                row.dataset.ruleType = rule.type;
                row.draggable = this.allowReorder && !this.locked && rule.type !== 'else';
                row.innerHTML = `
                    <div class="rule-label">${escapeHtml(this.ruleLabel(rule.type))}</div>
                    <div class="drop-slot condition-slot${rule.condition ? ' filled' : ''}${rule.type === 'else' ? ' fixed' : ''}"
                        data-rule-index="${index}" data-accept="condition">
                        ${this.renderConditionSlot(rule, index)}
                    </div>
                    <div class="rule-arrow">→</div>
                    <div class="drop-slot action-slot${rule.action ? ' filled' : ''}" data-rule-index="${index}" data-accept="action">
                        ${this.renderSlotContent('action', rule.action)}
                    </div>
                `;
                this.rulePanel.appendChild(row);
            });
            this.rulePanel.querySelectorAll('.drop-slot').forEach((slot) => this.registerSlot(slot));
        }

        renderBlocks() {
            if (!this.conditionContainer || !this.actionContainer) return;
            this.conditionContainer.innerHTML = '';
            this.actionContainer.innerHTML = '';
            this.conditions.forEach((condition) => this.conditionContainer.appendChild(this.createBlock({ ...condition, kind: 'condition' })));
            this.actions.forEach((action) => this.actionContainer.appendChild(this.createBlock({ ...action, kind: 'action' })));
        }

        renderPreview() {
            if (!this.previewElement) return;
            this.previewElement.innerHTML = this.rules.map((rule, index) => {
                const prefix = this.ruleLabel(rule.type);
                const condition = rule.type === 'else' ? 'กรณีอื่นทั้งหมด' : this.labelOf(this.conditions, rule.condition, '...');
                const action = this.labelOf(this.actions, rule.action, '...');
                return `<div>${index + 1}. ${escapeHtml(prefix)} ${escapeHtml(condition)} → ${escapeHtml(action)}</div>`;
            }).join('');
        }

        renderConditionSlot(rule) {
            if (rule.type === 'else') {
                return '<span class="slot-placeholder">กรณีอื่นทั้งหมด</span>';
            }
            return this.renderSlotContent('condition', rule.condition);
        }

        renderSlotContent(kind, value) {
            if (!value) return `<span class="slot-placeholder">วาง${kind === 'condition' ? 'เงื่อนไข' : 'คำสั่ง'}</span>`;
            const source = kind === 'condition' ? this.conditions : this.actions;
            const label = this.labelOf(source, value, value);
            return `<span class="placed-block" draggable="${this.locked ? 'false' : 'true'}" data-value="${escapeHtml(value)}">${escapeHtml(label)}</span>`;
        }

        labelOf(list, id, fallback) {
            const found = (list || []).find((item) => item.id === id);
            return found ? found.label : fallback;
        }

        ruleLabel(type) {
            if (type === 'else') return 'นอกเหนือจากนี้';
            if (type === 'else_if') return 'หรือถ้า';
            return 'ถ้า';
        }

        rejectSlot(slotElement) {
            slotElement.classList.add('drop-reject');
            window.setTimeout(() => slotElement.classList.remove('drop-reject'), 420);
        }
    }

    window.FarmMissions = window.FarmMissions || {};
    window.FarmMissions.DragDropManager = DragDropManager;
})();
