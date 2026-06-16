// Shared Phaser engine for lesson 1 logic missions.
(function () {
    const WIDTH = 640;
    const HEIGHT = 480;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const state = {
        game: null,
        config: null,
        scene: null,
        currentLevelIndex: 0,
        mistakes: 0,
        startTime: 0,
        completedTargets: 0,
        currentTargets: 0,
        levelGroup: null,
        timerInterval: null,
        activeTimers: [],
        levelCompleting: false,
        finished: false
    };

    function ensureLogicStyles() {
        if (document.getElementById('farm-logic-missions-style')) return;

        const style = document.createElement('style');
        style.id = 'farm-logic-missions-style';
        style.innerHTML = `
            #game-container {
                width: min(1000px, 94vw);
            }

            #phaser-canvas,
            #phaser-canvas canvas {
                touch-action: pan-y;
            }

            .logic-shell * {
                box-sizing: border-box;
            }

            .logic-mission,
            .logic-card {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                box-shadow: 0 12px 28px rgba(15,23,42,.08);
                padding: 16px;
            }

            .logic-mission {
                margin-bottom: 14px;
            }

            .logic-layout {
                display: grid;
                grid-template-columns: minmax(360px, 1fr) 300px;
                gap: 18px;
                align-items: stretch;
            }

            #phaser-canvas {
                width: 100%;
                min-height: 420px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            #phaser-canvas canvas {
                width: min(640px, 100%) !important;
                height: auto !important;
                max-width: 100%;
                image-rendering: auto;
                display: block;
                border-radius: 8px;
                box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05);
            }

            .logic-side-panel {
                display: grid;
                gap: 12px;
                align-content: start;
            }

            .logic-stat-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 8px;
            }

            .logic-stat {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                background: #f8fafc;
                padding: 10px;
                font-weight: 700;
                color: #1f2937;
            }

            @media (max-width: 900px) {
                .logic-layout {
                    grid-template-columns: 1fr;
                }

                #phaser-canvas {
                    min-height: 360px;
                }
            }

            @media (max-width: 576px) {
                #game-container {
                    width: 100%;
                }

                .logic-mission,
                .logic-card {
                    padding: 12px;
                }

                .logic-layout {
                    gap: 12px;
                }

                #phaser-canvas {
                    min-height: 320px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function createLogicShell(config) {
        const container = document.getElementById('game-container');
        if (!container) return null;

        container.innerHTML = `
            <div class="logic-shell">
                <div class="logic-mission">
                    <div id="logic-level-indicator" class="fw-bold text-success">ด่านย่อยที่ 1 / ${escapeHtml(config.levels.length)}</div>
                    <h4 id="logic-mission-title" class="fw-bold mb-1 text-dark">${escapeHtml(config.title)}</h4>
                    <div id="logic-mission-text" class="text-secondary">${escapeHtml(config.subtitle || '')}</div>
                    <div id="logic-feedback" class="alert alert-info rounded-3 shadow-sm mt-3 mb-0 py-2">
                        เริ่มทำภารกิจได้เลย
                    </div>
                </div>

                <div class="logic-layout">
                    <div class="logic-card">
                        <div id="phaser-canvas"></div>
                    </div>
                    <aside class="logic-card logic-side-panel">
                        <div>
                            <h5 class="fw-bold mb-2">เป้าหมาย</h5>
                            <div id="logic-goal" class="text-secondary">อ่านโจทย์แล้วทำตามเงื่อนไข</div>
                        </div>
                        <div class="logic-stat-grid">
                            <div class="logic-stat" id="logic-progress">ความคืบหน้า: 0 / 0</div>
                            <div class="logic-stat" id="logic-mistakes">พลาด: 0 ครั้ง</div>
                            <div class="logic-stat" id="logic-timer">เวลา: 0 วินาที</div>
                        </div>
                    </aside>
                </div>
            </div>
        `;

        return container;
    }

    function createPhaserGame(sceneClass) {
        return new Phaser.Game({
            type: Phaser.AUTO,
            width: WIDTH,
            height: HEIGHT,
            resolution: DPR,
            antialias: true,
            roundPixels: true,
            transparent: true,
            parent: 'phaser-canvas',
            input: {
                mouse: { preventDefaultWheel: false },
                touch: { capture: false }
            },
            physics: {
                default: 'arcade',
                arcade: { debug: false }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            scene: sceneClass
        });
    }

    function toX(value) {
        return value * WIDTH;
    }

    function toY(value) {
        return value * HEIGHT;
    }

    function pxX(value) {
        return value <= 1 ? toX(value) : value;
    }

    function pxY(value) {
        return value <= 1 ? toY(value) : value;
    }

    function getScale(key, fallback = 0.25) {
        return state.config.scales && state.config.scales[key] ? state.config.scales[key] : fallback;
    }

    function addToLevel(object) {
        if (state.levelGroup && object) {
            state.levelGroup.add(object);
        }
        return object;
    }

    function addManyToLevel(objects) {
        objects.forEach(addToLevel);
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function setFeedback(message, type = 'info') {
        const element = document.getElementById('logic-feedback');
        if (!element) return;
        element.className = `alert alert-${type} rounded-3 shadow-sm mt-3 mb-0 py-2`;
        element.textContent = message;
    }

    function updateStats() {
        const elapsed = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
        setText('logic-progress', `ความคืบหน้า: ${state.completedTargets} / ${state.currentTargets}`);
        setText('logic-mistakes', `พลาด: ${state.mistakes} ครั้ง`);
        setText('logic-timer', `เวลา: ${elapsed} วินาที`);
    }

    function renderLevelHeader(level) {
        setText('logic-level-indicator', `ด่านย่อยที่ ${state.currentLevelIndex + 1} / ${state.config.levels.length}`);
        setText('logic-mission-title', level.title || state.config.title);
        setText('logic-mission-text', level.mission || state.config.subtitle || '');
        setText('logic-goal', level.goal || 'อ่านโจทย์แล้วทำตามเงื่อนไข');
        setFeedback(level.feedback || 'เริ่มทำภารกิจได้เลย', 'info');
        updateStats();
    }

    function renderBackground(scene, level) {
        const backgroundKey = level.backgroundKey || state.config.backgroundKey;
        const backgroundColor = level.backgroundColor || state.config.backgroundColor || 0x87ceeb;

        if (backgroundKey && scene.textures.exists(backgroundKey)) {
            const bg = scene.add.image(WIDTH / 2, HEIGHT / 2, backgroundKey);
            bg.setDisplaySize(WIDTH, HEIGHT);
            addToLevel(bg);
            return;
        }

        addToLevel(scene.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, backgroundColor, 1));
    }

    function addCanvasTitle(scene, level) {
        if (level.showCanvasTitle === false) return;
        const title = scene.add.text(WIDTH / 2, 34, level.canvasTitle || level.title || '', {
            fontSize: level.titleFontSize || '23px',
            fontFamily: 'Kanit, sans-serif',
            color: level.titleColor || '#166534',
            fontStyle: 'bold',
            align: 'center',
            padding: { x: 10, y: 4 },
            backgroundColor: level.titleBackground || 'rgba(255,255,255,0.72)',
            shadow: { fill: true, blur: 3, color: '#ffffff' },
            wordWrap: { width: WIDTH - 40 }
        }).setOrigin(0.5);
        addToLevel(title);
    }

    function playSound(scene, key) {
        if (scene.sound && scene.cache.audio.exists(key)) {
            scene.sound.play(key, { volume: 0.65 });
        }
    }

    function showWrongMark(scene, x, y) {
        const cross = scene.add.text(x, y, 'X', {
            fontSize: '34px',
            fontFamily: 'Kanit, sans-serif',
            color: '#dc2626',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 4
        }).setOrigin(0.5);
        addToLevel(cross);
        scene.tweens.add({
            targets: cross,
            alpha: 0,
            y: y - 38,
            duration: 850,
            onComplete: () => cross.destroy()
        });
    }

    function clearActiveTimers() {
        state.activeTimers.forEach((timer) => clearTimeout(timer));
        state.activeTimers = [];
    }

    function addTimer(callback, delay) {
        const timer = setTimeout(() => {
            state.activeTimers = state.activeTimers.filter((item) => item !== timer);
            callback();
        }, delay);
        state.activeTimers.push(timer);
        return timer;
    }

    function clearInputEvents(scene) {
        scene.input.off('dragstart');
        scene.input.off('drag');
        scene.input.off('dragend');
        scene.input.off('drop');
        scene.input.off('dragleave');
    }

    function clearLevel(scene) {
        clearActiveTimers();
        clearInputEvents(scene);
        if (state.levelGroup) {
            state.levelGroup.clear(true, true);
        }
        state.levelGroup = scene.add.group();
        state.completedTargets = 0;
        state.currentTargets = 0;
        state.levelCompleting = false;
    }

    function countTargets(items) {
        return items.filter((item) => item.target || item.isTarget || item.answer === true).length;
    }

    function startCurrentLevel(scene) {
        if (state.finished) return;
        clearLevel(scene);

        const level = state.config.levels[state.currentLevelIndex];
        state.currentTargets = level.requiredTargets || level.targetCount || countTargets(level.items || level.options || []);
        renderLevelHeader(level);
        renderBackground(scene, level);
        addCanvasTitle(scene, level);

        if (level.type === 'drag_sort') {
            startDragSortLevel(scene, level);
        } else if (level.type === 'click_targets') {
            startClickTargetsLevel(scene, level);
        } else if (level.type === 'sequence_drop') {
            startSequenceDropLevel(scene, level);
        } else {
            throw new Error(`Unsupported farm logic level type: ${level.type}`);
        }

        updateStats();
    }

    function goNextLevel(scene) {
        if (state.levelCompleting || state.finished) return;
        state.levelCompleting = true;
        clearInputEvents(scene);
        clearActiveTimers();

        state.currentLevelIndex++;
        if (state.currentLevelIndex >= state.config.levels.length) {
            addTimer(() => finishGame(scene), 700);
            return;
        }

        const txt = scene.add.text(WIDTH / 2, HEIGHT / 2, state.config.transitionText || 'เยี่ยมมาก! ไปต่อกันเลย', {
            fontSize: '32px',
            fontFamily: 'Kanit, sans-serif',
            color: '#f1c40f',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center',
            wordWrap: { width: WIDTH - 50 }
        }).setOrigin(0.5);
        addToLevel(txt);

        scene.tweens.add({
            targets: txt,
            alpha: 0,
            y: HEIGHT / 2 - 40,
            delay: 900,
            duration: 450,
            onComplete: () => startCurrentLevel(scene)
        });
    }

    function calculateStars(mistakes, scoring = {}) {
        const threeStarsMaxMistakes = scoring.threeStarsMaxMistakes ?? 1;
        const twoStarsMaxMistakes = scoring.twoStarsMaxMistakes ?? 4;

        if (mistakes <= threeStarsMaxMistakes) return 3;
        if (mistakes <= twoStarsMaxMistakes) return 2;
        return 1;
    }

    function finishGame(scene) {
        if (state.finished) return;
        state.finished = true;
        clearInputEvents(scene);
        clearActiveTimers();
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
        if (state.levelGroup) {
            state.levelGroup.clear(true, true);
        }

        const duration = Math.floor((Date.now() - state.startTime) / 1000);
        const stars = calculateStars(state.mistakes, state.config.scoring);

        const overlay = scene.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.78);
        const title = scene.add.text(WIDTH / 2, HEIGHT / 2 - 62, state.config.resultText || 'ภารกิจเสร็จสิ้น!', {
            fontSize: '38px',
            fontFamily: 'Kanit, sans-serif',
            color: '#f1c40f',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: WIDTH - 70 }
        }).setOrigin(0.5);
        const starText = scene.add.text(WIDTH / 2, HEIGHT / 2, '★'.repeat(stars) + '☆'.repeat(3 - stars), {
            fontSize: '38px',
            fontFamily: 'Kanit, sans-serif',
            color: '#fde047'
        }).setOrigin(0.5);
        const detail = scene.add.text(WIDTH / 2, HEIGHT / 2 + 56, `ใช้เวลา: ${duration} วินาที | พลาด: ${state.mistakes} ครั้ง`, {
            fontSize: '22px',
            fontFamily: 'Kanit, sans-serif',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        addManyToLevel([overlay, title, starText, detail]);
        setFeedback('กำลังบันทึกคะแนน...', 'success');
        updateStats();

        scene.input.enabled = false;
        addTimer(() => {
            if (typeof window.sendResult === 'function') {
                window.sendResult(window.STAGE_ID, stars, duration, state.mistakes);
            }
        }, 2000);
    }

    function renderZone(scene, zoneData) {
        const x = toX(zoneData.x);
        const y = toY(zoneData.y);
        const width = pxX(zoneData.width || 0.24);
        const height = pxY(zoneData.height || 0.2);

        if (zoneData.image) {
            const zoneImage = scene.add.image(x, y, zoneData.image).setScale(zoneData.scale || getScale(zoneData.image, 0.32));
            addToLevel(zoneImage);
        } else if (zoneData.showRect) {
            const rect = scene.add.rectangle(x, y, width, height, zoneData.color || 0xffffff, zoneData.alpha || 0.22)
                .setStrokeStyle(2, zoneData.strokeColor || 0xffffff, 0.85);
            addToLevel(rect);
        }

        if (zoneData.label) {
            const label = scene.add.text(x, y + height / 2 + 22, zoneData.label, {
                fontSize: zoneData.labelFontSize || '17px',
                fontFamily: 'Kanit, sans-serif',
                color: zoneData.labelColor || '#111827',
                backgroundColor: zoneData.labelBackground || 'rgba(255,255,255,0.82)',
                padding: { x: 8, y: 4 },
                align: 'center',
                wordWrap: { width: Math.max(width + 90, 160) }
            }).setOrigin(0.5);
            addToLevel(label);
        }

        const zone = scene.add.zone(x, y, width, height).setRectangleDropZone(width, height);
        zone.zoneId = zoneData.id;
        zone.dropOffsetY = zoneData.dropOffsetY || 0;
        addToLevel(zone);
        return zone;
    }

    function createDraggableItem(scene, data) {
        const x = toX(data.x);
        const y = toY(data.y);
        const item = scene.add.image(x, y, data.key).setInteractive({ useHandCursor: true });
        item.setScale(data.scale || getScale(data.key));
        item.setData('logicItem', true);
        item.setData('targetZoneId', data.target || null);
        item.setData('answerKey', data.answerKey || null);
        item.originalX = x;
        item.originalY = y;
        scene.input.setDraggable(item);
        addToLevel(item);
        return item;
    }

    function resetItem(scene, item) {
        scene.tweens.add({
            targets: item,
            x: item.originalX,
            y: item.originalY,
            duration: 260,
            ease: 'Sine.easeOut'
        });
    }

    function startDragSortLevel(scene, level) {
        const zones = (level.zones || []).map((zone) => renderZone(scene, zone));
        state.currentTargets = level.requiredTargets || level.items.filter((item) => item.target).length;

        level.items.forEach((data) => createDraggableItem(scene, data));

        scene.input.on('drag', (pointer, item, dragX, dragY) => {
            if (!item.getData('logicItem')) return;
            item.x = dragX;
            item.y = dragY;
        });

        scene.input.on('drop', (pointer, item, zone) => {
            if (state.levelCompleting || !item.getData('logicItem') || !zones.includes(zone)) return;
            const targetZoneId = item.getData('targetZoneId');

            if (targetZoneId && targetZoneId === zone.zoneId) {
                playSound(scene, 'correct');
                item.x = zone.x;
                item.y = zone.y + zone.dropOffsetY;
                item.disableInteractive();
                item.setData('logicItem', false);
                state.completedTargets++;
                setFeedback('ถูกต้อง!', 'success');
                updateStats();
                if (state.completedTargets >= state.currentTargets) {
                    goNextLevel(scene);
                }
            } else {
                playSound(scene, 'wrong');
                state.mistakes++;
                showWrongMark(scene, item.x, item.y);
                resetItem(scene, item);
                setFeedback('ยังไม่ตรงเงื่อนไข ลองดูเป้าหมายอีกครั้ง', 'warning');
                updateStats();
            }
        });

        scene.input.on('dragend', (pointer, item, dropped) => {
            if (!item.getData || !item.getData('logicItem')) return;
            if (!dropped) resetItem(scene, item);
        });
    }

    function shuffledGridPositions(count, grid) {
        const cols = grid?.cols || 4;
        const rows = grid?.rows || Math.ceil(count / cols);
        const left = grid?.left ?? 0.2;
        const right = grid?.right ?? 0.8;
        const top = grid?.top ?? 0.3;
        const bottom = grid?.bottom ?? 0.82;
        const positions = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = cols === 1 ? (left + right) / 2 : left + ((right - left) * col) / (cols - 1);
                const y = rows === 1 ? (top + bottom) / 2 : top + ((bottom - top) * row) / (rows - 1);
                positions.push({ x: toX(x), y: toY(y) });
            }
        }

        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        return positions.slice(0, count);
    }

    function createClickableItem(scene, data, position, delay = 0) {
        const item = scene.add.image(position.x, position.y, data.key).setInteractive({ useHandCursor: true });
        item.setScale(0);
        item.setData('isTarget', Boolean(data.isTarget));
        item.setData('logicClickItem', true);
        addToLevel(item);

        scene.tweens.add({
            targets: item,
            alpha: 1,
            scale: data.scale || getScale(data.key, data.type === 'bug' ? 0.2 : 0.25),
            duration: 220,
            delay
        });

        item.on('pointerdown', () => {
            if (state.levelCompleting || !item.active) return;

            if (item.getData('isTarget')) {
                playSound(scene, 'correct');
                item.disableInteractive();
                scene.tweens.add({
                    targets: item,
                    scale: 0,
                    angle: 180,
                    duration: 180,
                    onComplete: () => {
                        item.destroy();
                        state.completedTargets++;
                        setFeedback('ถูกต้อง!', 'success');
                        updateStats();
                        if (state.completedTargets >= state.currentTargets) {
                            goNextLevel(scene);
                        }
                    }
                });
            } else {
                playSound(scene, 'wrong');
                state.mistakes++;
                showWrongMark(scene, item.x, item.y);
                scene.tweens.add({ targets: item, x: item.x + 8, yoyo: true, repeat: 2, duration: 45 });
                setFeedback('ตัวนี้ไม่ใช่เป้าหมาย ระวังตัวหลอก', 'warning');
                updateStats();
            }
        });

        return item;
    }

    function startSequentialClickTargets(scene, level) {
        let activeItem = null;
        let spawnedTargets = 0;

        state.currentTargets = level.targetCount || level.requiredTargets || 5;

        function randomChoice(list) {
            return list[Math.floor(Math.random() * list.length)];
        }

        function spawnNext() {
            if (state.levelCompleting || state.finished) return;
            const shouldSpawnFake = Math.random() > (level.targetChance ?? 0.6);
            const key = shouldSpawnFake ? randomChoice(level.fakeKeys) : randomChoice(level.targetKeys);
            const isTarget = !shouldSpawnFake;
            if (isTarget) spawnedTargets++;

            const x = Phaser.Math.Between(pxX(level.spawnArea?.left ?? 0.18), pxX(level.spawnArea?.right ?? 0.82));
            const y = Phaser.Math.Between(pxY(level.spawnArea?.top ?? 0.32), pxY(level.spawnArea?.bottom ?? 0.82));

            activeItem = scene.add.image(x, y, key).setInteractive({ useHandCursor: true });
            activeItem.setScale(0);
            addToLevel(activeItem);

            let consumed = false;
            const hideTween = scene.tweens.add({
                targets: activeItem,
                scale: key === level.fakeKeys?.[0] ? getScale(key, 0.25) : getScale(key, 0.25),
                duration: 180,
                onComplete: () => {
                    addTimer(() => {
                        if (consumed || !activeItem || !activeItem.active || state.levelCompleting) return;
                        consumed = true;
                        const wasTarget = isTarget;
                        activeItem.destroy();
                        activeItem = null;
                        if (wasTarget) {
                            state.mistakes++;
                            setFeedback('ปล่อยให้เป้าหมายหลุดไปหนึ่งครั้ง', 'warning');
                            updateStats();
                        }
                        spawnNext();
                    }, level.visibleDuration || 1500);
                }
            });

            activeItem.on('pointerdown', () => {
                if (consumed || state.levelCompleting) return;
                consumed = true;
                hideTween.stop();

                if (isTarget) {
                    playSound(scene, 'correct');
                    state.completedTargets++;
                    setFeedback('กำจัดเป้าหมายได้แล้ว', 'success');
                } else {
                    playSound(scene, 'wrong');
                    state.mistakes++;
                    showWrongMark(scene, activeItem.x, activeItem.y);
                    setFeedback('โดนตัวหลอกแล้ว ระวังต้นกล้า', 'warning');
                }

                activeItem.destroy();
                activeItem = null;
                updateStats();

                if (state.completedTargets >= state.currentTargets) {
                    goNextLevel(scene);
                } else {
                    addTimer(spawnNext, level.spawnDelay || 120);
                }
            });
        }

        spawnNext();
    }

    function startClickTargetsLevel(scene, level) {
        if (level.spawnMode === 'sequential') {
            startSequentialClickTargets(scene, level);
            return;
        }

        state.currentTargets = level.requiredTargets || level.items.filter((item) => item.isTarget).length;
        const positions = level.positions
            ? level.positions.map((pos) => ({ x: toX(pos.x), y: toY(pos.y) }))
            : shuffledGridPositions(level.items.length, level.grid);

        level.items.forEach((data, index) => {
            createClickableItem(scene, data, positions[index], index * 70);
        });
    }

    function startSequenceDropLevel(scene, level) {
        state.currentTargets = 1;

        const centerY = toY(level.sequenceY || 0.48);
        const sequence = level.sequence || [];
        sequence.forEach((entry) => {
            if (entry.type === 'arrow') {
                const arrow = scene.add.text(toX(entry.x), centerY, '>', {
                    fontSize: '36px',
                    fontFamily: 'Kanit, sans-serif',
                    color: '#ffffff',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 3
                }).setOrigin(0.5);
                addToLevel(arrow);
                return;
            }

            const image = scene.add.image(toX(entry.x), centerY, entry.key).setScale(entry.scale || getScale(entry.key));
            addToLevel(image);
        });

        const zoneData = level.answerZone;
        const zoneX = toX(zoneData.x);
        const zoneY = toY(zoneData.y);
        const zoneW = pxX(zoneData.width || 0.18);
        const zoneH = pxY(zoneData.height || 0.25);
        const graphics = scene.add.graphics();
        graphics.lineStyle(4, 0xffffff, 1);
        graphics.strokeRoundedRect(zoneX - zoneW / 2, zoneY - zoneH / 2, zoneW, zoneH, 12);
        addToLevel(graphics);

        const dropZone = scene.add.zone(zoneX, zoneY, zoneW, zoneH).setRectangleDropZone(zoneW, zoneH);
        dropZone.zoneId = 'answer';
        addToLevel(dropZone);

        level.options.forEach((option) => {
            const item = createDraggableItem(scene, option);
            item.setData('answerKey', option.answerKey || option.key);
        });

        scene.input.on('drag', (pointer, item, dragX, dragY) => {
            if (!item.getData('logicItem')) return;
            item.x = dragX;
            item.y = dragY;
        });

        scene.input.on('drop', (pointer, item, zone) => {
            if (state.levelCompleting || zone !== dropZone || !item.getData('logicItem')) return;

            if (item.getData('answerKey') === level.answerKey) {
                playSound(scene, 'correct');
                item.x = zone.x;
                item.y = zone.y;
                item.disableInteractive();
                item.setData('logicItem', false);
                state.completedTargets = 1;
                setFeedback('ลำดับถูกต้อง!', 'success');
                updateStats();
                addTimer(() => goNextLevel(scene), level.completeDelay || 700);
            } else {
                playSound(scene, 'wrong');
                state.mistakes++;
                showWrongMark(scene, item.x, item.y);
                resetItem(scene, item);
                setFeedback('ลำดับยังไม่ถูก ลองอีกครั้ง', 'warning');
                updateStats();
            }
        });

        scene.input.on('dragend', (pointer, item, dropped) => {
            if (!item.getData || !item.getData('logicItem')) return;
            if (!dropped) resetItem(scene, item);
        });
    }

    function resetState(config) {
        clearActiveTimers();
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
        }
        if (state.game) {
            state.game.destroy(true);
        }

        state.game = null;
        state.config = config;
        state.scene = null;
        state.currentLevelIndex = 0;
        state.mistakes = 0;
        state.startTime = 0;
        state.completedTargets = 0;
        state.currentTargets = 0;
        state.levelGroup = null;
        state.timerInterval = null;
        state.activeTimers = [];
        state.levelCompleting = false;
        state.finished = false;
    }

    function run(config) {
        if (!window.Phaser) {
            throw new Error('Phaser is required before FarmLogicMissions.run(config).');
        }

        resetState(config);
        ensureLogicStyles();
        if (!createLogicShell(config)) return;

        class FarmLogicScene extends Phaser.Scene {
            preload() {
                (config.assets || []).forEach(([key, path]) => this.load.image(key, path));
                (config.sounds || []).forEach(([key, path]) => this.load.audio(key, path));
            }

            create() {
                state.scene = this;
                state.levelGroup = this.add.group();
                state.startTime = Date.now();
                this.input.enabled = true;
                state.timerInterval = setInterval(updateStats, 1000);
                startCurrentLevel(this);
            }
        }

        state.game = createPhaserGame(FarmLogicScene);
    }

    window.FarmLogicMissions = { run };
})();
