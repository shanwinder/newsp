// Lightweight helpers for Smart Farm Debugger rule reordering.
(function () {
    function moveItem(items, fromIndex, toIndex) {
        if (!Array.isArray(items)) return items;
        const from = Number(fromIndex);
        const to = Number(toIndex);
        if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
            return items;
        }
        const next = items.slice();
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
    }

    function sameRules(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
        return a.every((rule, index) => {
            const other = b[index] || {};
            return rule.type === other.type
                && rule.condition === other.condition
                && rule.action === other.action;
        });
    }

    window.DebugDragDrop = {
        moveItem,
        sameRules
    };
})();
