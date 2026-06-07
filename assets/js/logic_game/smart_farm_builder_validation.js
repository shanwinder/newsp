(function () {
    function matchProps(itemProps, conditionProps) {
        return Object.entries(conditionProps || {}).every(([key, value]) => itemProps?.[key] === value);
    }

    function defaultPassAction(config = {}) {
        const behavior = config.defaultBehavior || config.default_behavior || {};
        return behavior.type || behavior.id || 'pass_through';
    }

    function isIfOnly(logic = {}) {
        return logic.id === 'if' || logic.mode === 'single_action_if';
    }

    function branchForItem(item, config = {}, activeRules = []) {
        if (item.expectedRuleBranch) return item.expectedRuleBranch;
        const logic = config.logic || {};
        const conditions = config.conditions || [];
        const passAction = defaultPassAction(config);
        const result = item.correctResult || item.correctAction;

        if (isIfOnly(logic)) {
            return result === passAction ? 'pass_through' : 'if';
        }

        for (const rule of activeRules || []) {
            if (!rule) continue;
            if (rule.type === 'else' || rule.condition === 'else') return 'else';
            const condition = conditions.find((entry) => entry.id === rule.condition);
            if (condition && matchProps(item.props, condition.props)) {
                return rule.type === 'else_if' ? 'else_if' : 'if';
            }
        }
        return 'else';
    }

    function hasSimilarDecoys(items) {
        const targets = items.filter((item) => !item.isDecoy);
        const decoys = items.filter((item) => item.isDecoy);
        if (!decoys.length) return false;
        return decoys.every((decoy) => {
            if (decoy.sourceCatalogId || decoy.decoyVariant || decoy.decoyReason) return true;
            return targets.some((target) => {
                const targetProps = target.props || {};
                const decoyProps = decoy.props || {};
                return Object.keys(targetProps).some((key) => key !== 'decoyVariant' && decoyProps[key] === targetProps[key]);
            });
        });
    }

    function qualityCheck(config, activeRules) {
        const logic = config.logic || {};
        const items = config.items || [];
        const actions = config.actions || [];
        const warnings = [];
        const branchCounts = { if: 0, else_if: 0, else: 0, pass_through: 0 };

        items.forEach((item) => {
            const branch = branchForItem(item, config, activeRules);
            if (branchCounts[branch] !== undefined) branchCounts[branch]++;
        });

        let balancedBranches = true;
        if (isIfOnly(logic)) {
            balancedBranches = branchCounts.if >= 1 && branchCounts.pass_through >= (logic.minNonMatchingItems || 2);
            if (!balancedBranches) warnings.push('ด่าน If ควรมีวัตถุเข้าเงื่อนไขอย่างน้อย 1 ชิ้น และวัตถุปล่อยผ่านอย่างน้อย 2 ชิ้น');
        } else if (logic.id === 'if_else') {
            balancedBranches = branchCounts.if >= 2 && branchCounts.else >= 2;
            if (!balancedBranches) warnings.push('ด่าน If / Else ควรมีวัตถุใน If และ Else อย่างน้อยฝั่งละ 2 ชิ้น');
        } else if (logic.id === 'if_else_if_else') {
            balancedBranches = branchCounts.if >= 2 && branchCounts.else_if >= 2 && branchCounts.else >= 2;
            if (!balancedBranches) warnings.push('ด่าน If / Else If / Else ควรมีวัตถุครบทุก branch อย่างน้อย branch ละ 2 ชิ้น');
        }

        const hasGoodDecoys = hasSimilarDecoys(items);
        if (!hasGoodDecoys) warnings.push('ตัวหลอกอาจง่ายเกินไป ลองเลือกวัตถุที่หน้าตาหรือคุณสมบัติคล้ายวัตถุเป้าหมายมากขึ้น');

        const usedResults = new Set(items.map((item) => item.correctResult || item.correctAction).filter(Boolean));
        const usesAllDestinations = actions.every((action) => usedResults.has(action.id));
        if (!usesAllDestinations && actions.length > 1) warnings.push('ยังมีปลายทางบางจุดที่ไม่มีวัตถุใดควรไปถึง');

        const typeCounts = new Map();
        items.forEach((item) => {
            const type = item.props?.type || item.conditionId || item.id;
            typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
        });
        const mostCommon = Math.max(0, ...Array.from(typeCounts.values()));
        const diverseItems = items.length < 4 || mostCommon <= Math.ceil(items.length * 0.67);
        if (!diverseItems) warnings.push('วัตถุชนิดเดียวกันมีมากเกินไป ลองเพิ่มชนิดอื่นเพื่อให้ด่านน่าสังเกตขึ้น');

        return {
            balancedBranches,
            hasGoodDecoys,
            usesAllDestinations,
            diverseItems,
            branchCounts,
            warnings
        };
    }

    function validateConfig(config, rules) {
        const errors = [];
        const logic = config.logic || {};
        const items = config.items || [];
        const conditions = config.conditions || [];
        const actions = config.actions || [];
        const activeRules = rules || config.rules || [];
        const ifOnly = isIfOnly(logic);
        const passAction = defaultPassAction(config);
        const quality = qualityCheck(config, activeRules);

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
        if (!actions.length) errors.push('ยังไม่มีคำสั่งหรือปลายทางพิเศษ');

        if (ifOnly) {
            if (activeRules.length !== 1 || activeRules.some((rule) => rule.type === 'else')) {
                errors.push('เกม If ต้องมีแถว If เพียง 1 แถว และไม่ต้องมี Else');
            }
            if (!config.defaultBehavior || passAction !== 'pass_through') {
                errors.push('เกม If ต้องตั้งค่า defaultBehavior เป็น pass_through');
            }
            if (actions.some((action) => action.id === 'pass' || action.id === 'pass_through')) {
                errors.push('เกม If ไม่ควรมีปลายทางปกติเป็นบล็อกคำสั่ง ระบบจะปล่อยผ่านอัตโนมัติ');
            }
            if (conditions.length !== 1) {
                errors.push('เกม If ต้องมีเงื่อนไขพิเศษ 1 เงื่อนไขเท่านั้น');
            }
            const matchingItems = items.filter((item) => branchForItem(item, config, activeRules) === 'if');
            const nonMatchingItems = items.filter((item) => branchForItem(item, config, activeRules) === 'pass_through');
            if (matchingItems.length < 1) {
                errors.push('ยังไม่มีวัตถุที่เข้าเงื่อนไขพิเศษ กรุณาเพิ่มอย่างน้อย 1 ชิ้น');
            }
            if (nonMatchingItems.length < (logic.minNonMatchingItems || 2)) {
                errors.push(`เกม If ต้องมีวัตถุไม่เข้าเงื่อนไขอย่างน้อย ${logic.minNonMatchingItems || 2} ชิ้นเพื่อให้เห็นการปล่อยผ่านอัตโนมัติ`);
            }
        }

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

        if (logic.id === 'if_else' && (quality.branchCounts.if < 2 || quality.branchCounts.else < 2)) {
            errors.push('เกม If / Else ต้องมีวัตถุเข้า branch If และ Else อย่างน้อยฝั่งละ 2 ชิ้น');
        }

        if (logic.id === 'if_else_if_else' && (quality.branchCounts.if < 2 || quality.branchCounts.else_if < 2 || quality.branchCounts.else < 2)) {
            errors.push('เกม If / Else If / Else ต้องมีวัตถุครบ If, Else If และ Else อย่างน้อย branch ละ 2 ชิ้น');
        }

        if (ifOnly && activeRules.some((rule) => rule.type === 'else')) {
            errors.push('เกม If ไม่ต้องมี Else ระบบจะปล่อยวัตถุที่ไม่เข้าเงื่อนไขผ่านอัตโนมัติ');
        }

        const rulesHaveActions = activeRules.every((rule) => rule.action && (rule.type === 'else' || rule.condition));
        if (!rulesHaveActions) {
            errors.push('ต้องลากบล็อกเงื่อนไขและคำสั่งลงแผงกฎให้ครบก่อนทดสอบ');
        }

        items.forEach((item) => {
            if (!item.correctAction) {
                errors.push(`วัตถุ "${item.label}" ยังไม่ได้เลือกปลายทางที่ถูกต้อง`);
            }
            if (!item.correctResult && !item.correctAction) {
                errors.push(`วัตถุ "${item.label}" ยังไม่มี correctResult`);
            }
        });

        return {
            ok: errors.length === 0,
            errors,
            qualityCheck: quality
        };
    }

    window.SmartFarmBuilderValidation = {
        matchProps,
        branchForItem,
        qualityCheck,
        validateConfig
    };
})();
