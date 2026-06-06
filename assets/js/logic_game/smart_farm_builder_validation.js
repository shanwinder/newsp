(function () {
    function matchProps(itemProps, conditionProps) {
        return Object.entries(conditionProps || {}).every(([key, value]) => itemProps?.[key] === value);
    }

    function validateConfig(config, rules) {
        const errors = [];
        const logic = config.logic || {};
        const items = config.items || [];
        const conditions = config.conditions || [];
        const actions = config.actions || [];
        const activeRules = rules || config.rules || [];

        if (!config.title || config.title.trim().length === 0) errors.push('ยังไม่ได้ตั้งชื่อด่าน');
        if ((config.title || '').length > 60) errors.push('ชื่อด่านยาวเกิน 60 ตัวอักษร');
        if (!config.mission || config.mission.trim().length === 0) errors.push('ยังไม่ได้เขียนภารกิจ');
        if ((config.mission || '').length > 150) errors.push('ภารกิจยาวเกิน 150 ตัวอักษร');
        if (!config.instruction || config.instruction.trim().length === 0) errors.push('ยังไม่ได้เขียนคำแนะนำก่อนเล่น');
        if ((config.instruction || '').length > 150) errors.push('คำแนะนำยาวเกิน 150 ตัวอักษร');

        if (items.length < (logic.minItems || 0)) {
            errors.push(`ต้องมีวัตถุอย่างน้อย ${logic.minItems} ชิ้นสำหรับเกมชนิดนี้`);
        }

        const decoyCount = items.filter((item) => item.isDecoy).length;
        if (decoyCount < (logic.minDecoys || 0)) {
            errors.push(`ต้องมีตัวหลอกอย่างน้อย ${logic.minDecoys} ชิ้น`);
        }

        if (!conditions.length) errors.push('ยังไม่มีเงื่อนไขจากวัตถุที่เลือก');
        if (!actions.length) errors.push('ยังไม่มีคำสั่งหรือปลายทาง');

        const actionIds = new Set(actions.map((action) => action.id));
        activeRules.forEach((rule, index) => {
            const rowName = index === 0 ? 'If' : (rule.type === 'else' ? 'Else' : `Else If แถวที่ ${index}`);
            if (rule.type !== 'else' && !rule.condition) errors.push(`${rowName} ยังไม่มีเงื่อนไข`);
            if (!rule.action) errors.push(`${rowName} ยังไม่มีคำสั่ง/ปลายทาง`);
            if (rule.action && !actionIds.has(rule.action)) errors.push(`${rowName} ใช้คำสั่งที่ไม่มีปลายทางในระบบ`);
        });

        const requiredRules = (logic.ruleSlots || []).length;
        if (activeRules.length < requiredRules) {
            errors.push('จำนวนแถวกฎยังไม่ครบตามชนิดเกม');
        }

        activeRules
            .filter((rule) => rule.type !== 'else' && rule.condition)
            .forEach((rule) => {
                const condition = conditions.find((item) => item.id === rule.condition);
                if (!condition) {
                    errors.push(`ไม่พบเงื่อนไข "${rule.condition}"`);
                    return;
                }
                const matches = items.filter((item) => matchProps(item.props, condition.props)).length;
                if (matches < (logic.minMatchesPerCondition || 1)) {
                    errors.push(`ยังไม่มีวัตถุที่เข้าเงื่อนไข "${condition.label}" อย่างน้อย ${logic.minMatchesPerCondition || 1} ชิ้น`);
                }
            });

        if ((logic.requiresElse || false) && !activeRules.some((rule) => rule.type === 'else')) {
            errors.push('เกมชนิดนี้ต้องมีแถว Else');
        }

        const rulesHaveActions = activeRules.every((rule) => rule.action && (rule.type === 'else' || rule.condition));
        if (!rulesHaveActions) {
            errors.push('ต้องลากบล็อกเงื่อนไขและคำสั่งลงแผงกฎให้ครบก่อนทดสอบ');
        }

        items.forEach((item) => {
            if (!item.correctAction) {
                errors.push(`วัตถุ "${item.label}" ยังไม่ได้เลือกปลายทางที่ถูกต้อง`);
            }
        });

        return {
            ok: errors.length === 0,
            errors
        };
    }

    window.SmartFarmBuilderValidation = {
        matchProps,
        validateConfig
    };
})();
