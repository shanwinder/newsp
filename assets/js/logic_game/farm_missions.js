// Phaser-based shared game engine for stages 4-12.
(function () {
    const WIDTH = 800;
    const HEIGHT = 600;
    const DIRS = {
        UP: { icon: '⬆️', label: 'ขึ้น', dc: 0, dr: -1 },
        DOWN: { icon: '⬇️', label: 'ลง', dc: 0, dr: 1 },
        LEFT: { icon: '⬅️', label: 'ซ้าย', dc: -1, dr: 0 },
        RIGHT: { icon: '➡️', label: 'ขวา', dc: 1, dr: 0 }
    };
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const USE_EMOJI_ASSETS = true;

    /**
     * TODO:
     * เมื่อมีภาพกราฟิก HD ครบชุดแล้ว ให้เปลี่ยน USE_EMOJI_ASSETS = false
     * และโหลดไฟล์ภาพจริง เช่น hay.webp, barn.webp, crop.webp ใน preloadCommon()
     */
    const ASSET_MAP = {
        tractor: { emoji: '🚜', texture: 'tractor', fontSize: '42px', targetSize: 58 },
        target: { emoji: '🧺', texture: 'basket', fontSize: '42px', targetSize: 54 },
        basket: { emoji: '🧺', texture: 'basket', fontSize: '42px', targetSize: 54 },
        rock: { emoji: '🪨', texture: 'rock', fontSize: '42px', targetSize: 54 },
        hay: { emoji: '🌾', texture: 'hay', fontSize: '42px', targetSize: 54 },
        barn: { emoji: '🏚️', texture: 'barn', fontSize: '42px', targetSize: 54 },
        crop: { emoji: '🌽', texture: 'crop', fontSize: '42px', targetSize: 54 },
        check: { emoji: '✅', texture: 'check', fontSize: '36px', targetSize: 48 }
    };

    function ensureSequenceStyles() {
        if (document.getElementById('farm-missions-sequence-style')) return;
        const style = document.createElement('style');
        style.id = 'farm-missions-sequence-style';
        style.innerHTML = `
            #game-container { width: min(1000px, 94vw); }
            #phaser-canvas,
            #phaser-canvas canvas {
                touch-action: pan-y;
            }
            .sequence-shell * { box-sizing: border-box; }
            .sequence-mission {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                box-shadow: 0 12px 28px rgba(15,23,42,.08);
                padding: 16px 18px;
                margin-bottom: 14px;
            }
            .sequence-layout {
                display: grid;
                grid-template-columns: minmax(360px, 1fr) 330px;
                gap: 18px;
                align-items: stretch;
            }
            .sequence-card {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                box-shadow: 0 12px 28px rgba(15,23,42,.08);
                padding: 16px;
            }
            #phaser-canvas {
                width: 100%;
                min-height: 400px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            #phaser-canvas canvas {
                width: min(480px, 100%) !important;
                height: auto !important;
                max-width: 100%;
                image-rendering: auto;
                display: block;
            }
            .sequence-zone {
                min-height: 132px;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-content: flex-start;
                background: #f8fafc;
                border: 2px dashed #cbd5e1;
                border-radius: 8px;
                padding: 12px;
            }
            .sequence-block {
                width: 44px;
                height: 44px;
                border: 0;
                border-radius: 8px;
                background: #2563eb;
                color: #ffffff;
                font-size: 22px;
                box-shadow: 0 4px 10px rgba(15,23,42,.15);
            }
            .sequence-block:disabled,
            .sequence-control:disabled {
                opacity: .62;
                cursor: not-allowed;
            }
            .sequence-arrow-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
            }
            @media (max-width: 900px) {
                .sequence-layout { grid-template-columns: 1fr; }
                #phaser-canvas { min-height: 360px; }
            }
        `;
        document.head.appendChild(style);
    }

    function createGame(sceneClass, parentId = 'game-container', clearParent = true) {
        const container = document.getElementById(parentId);
        if (clearParent && container) container.innerHTML = '';
        return new Phaser.Game({
            type: Phaser.AUTO,
            width: WIDTH,
            height: HEIGHT,
            resolution: DPR,
            antialias: true,
            roundPixels: true,
            backgroundColor: '#87CEEB',
            parent: parentId,
            input: {
                mouse: { preventDefaultWheel: false },
                touch: { capture: false }
            },
            physics: {
                default: 'arcade',
                arcade: { debug: false }
            },
            scene: sceneClass
        });
    }

    function createSequenceGame(sceneClass) {
        ensureSequenceStyles();
        const container = document.getElementById('game-container');
        if (!container) return null;
        if (container) container.innerHTML = '';
        container.innerHTML = `
            <div class="sequence-shell">
                <div class="sequence-mission">
                    <div class="d-flex flex-wrap justify-content-between align-items-start gap-2">
                        <div>
                            <div id="level-indicator" class="fw-bold text-primary">ด่านย่อยที่ 1 / 3</div>
                            <h4 id="mission-title" class="fw-bold mb-1 text-dark">ภารกิจรถไถ</h4>
                            <div id="mission-text" class="text-secondary">วางแผนลำดับคำสั่งให้รถไถ</div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <button id="sound-toggle" type="button" class="btn btn-light btn-sm rounded-pill border">🔊 เสียง</button>
                            <div id="attempt-badge" class="badge text-bg-primary fs-6 rounded-pill px-3 py-2">ลอง 0 | พลาด 0</div>
                        </div>
                    </div>
                    <div id="feedback-box" class="alert alert-info rounded-3 shadow-sm mt-3 mb-0 py-2">เริ่มวางแผนเส้นทางได้เลย</div>
                </div>
                <div class="sequence-layout">
                    <div class="sequence-card">
                        <div id="phaser-canvas"></div>
                    </div>
                    <div class="sequence-card">
                        <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                            <span class="fw-bold text-dark">บล็อกคำสั่ง</span>
                            <span id="command-count" class="badge text-bg-secondary">0 / 10</span>
                        </div>
                        <div id="sequence-container" class="sequence-zone mb-3">
                            <span id="sequence-placeholder" class="text-muted small">กดปุ่มลูกศรด้านล่างเพื่อเพิ่มคำสั่ง</span>
                        </div>
                        <div class="sequence-arrow-grid mb-3">
                            <button class="btn btn-outline-primary fw-bold py-2 sequence-control" data-dir="UP">⬆️</button>
                            <button class="btn btn-outline-primary fw-bold py-2 sequence-control" data-dir="DOWN">⬇️</button>
                            <button class="btn btn-outline-primary fw-bold py-2 sequence-control" data-dir="LEFT">⬅️</button>
                            <button class="btn btn-outline-primary fw-bold py-2 sequence-control" data-dir="RIGHT">➡️</button>
                        </div>
                        <div class="d-flex gap-2">
                            <button id="clear-commands" class="btn btn-outline-danger flex-fill fw-bold sequence-control">ล้าง</button>
                            <button id="run-commands" class="btn btn-success flex-fill fw-bold sequence-control">รันคำสั่ง</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return new Phaser.Game({
            type: Phaser.AUTO,
            width: 480,
            height: 400,
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
            scene: sceneClass
        });
    }

    function addButton(scene, x, y, w, h, label, color, callback) {
        const bg = scene.add.rectangle(x, y, w, h, color, 1)
            .setStrokeStyle(2, 0xffffff, 0.9)
            .setInteractive({ useHandCursor: true });
        const text = scene.add.text(x, y, label, {
            fontFamily: 'Kanit, sans-serif',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        bg.on('pointerover', () => bg.setScale(1.03));
        bg.on('pointerout', () => bg.setScale(1));
        bg.on('pointerdown', callback);
        return scene.add.container(0, 0, [bg, text]);
    }

    function addPanel(scene, x, y, w, h, color = 0xffffff, alpha = 0.95) {
        return scene.add.rectangle(x, y, w, h, color, alpha)
            .setStrokeStyle(2, 0xd1d5db, 1);
    }

    function playSound(scene, key) {
        if (scene.sound && scene.cache.audio.exists(key)) {
            scene.sound.play(key, { volume: 0.6 });
        }
    }

    function playGameSound(scene, key) {
        const fallbackKeys = {
            click: 'correct',
            run: 'correct',
            crash: 'wrong',
            collect: 'correct',
            success: 'correct',
            victory: 'correct'
        };

        if (window.GameAudio && typeof window.GameAudio.play === 'function') {
            if (typeof window.GameAudio.isEnabled === 'function' && !window.GameAudio.isEnabled()) {
                return;
            }
            if (window.GameAudio.play(key)) {
                return;
            }
        }

        const fallbackKey = fallbackKeys[key] || key;
        if (scene && scene.sound && scene.cache.audio.exists(fallbackKey)) {
            scene.sound.play(fallbackKey, { volume: 0.6 });
        }
    }

    function addGameObject(scene, key, x, y, size = null) {
        const asset = ASSET_MAP[key] || ASSET_MAP.target;
        if (USE_EMOJI_ASSETS) {
            return scene.add.text(x, y, asset.emoji, {
                fontSize: asset.fontSize,
                fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
            }).setOrigin(0.5);
        }

        return scene.add.image(x, y, asset.texture)
            .setDisplaySize(size || asset.targetSize, size || asset.targetSize)
            .setOrigin(0.5);
    }

    function starsFromState(attempts, mistakes, hintUsed) {
        if (hintUsed) return 1;
        if (attempts <= 3 && mistakes === 0) return 3;
        if (attempts <= 6 || mistakes <= 2) return 2;
        return 1;
    }

    function showToast(scene, message, type = 'info') {
        if (scene.toastGroup) scene.toastGroup.destroy(true);
        const colors = { info: 0x0ea5e9, success: 0x16a34a, warning: 0xf59e0b, error: 0xdc2626 };
        const group = scene.add.container(400, 548).setDepth(1000);
        const bg = scene.add.rectangle(0, 0, 700, 54, colors[type] || colors.info, 0.95)
            .setStrokeStyle(2, 0xffffff, 0.9);
        const txt = scene.add.text(0, 0, message, {
            fontFamily: 'Kanit, sans-serif',
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 650 }
        }).setOrigin(0.5);
        group.add([bg, txt]);
        scene.toastGroup = group;
        scene.tweens.add({ targets: group, y: 532, duration: 160, ease: 'Back.out' });
        scene.time.delayedCall(2600, () => {
            if (group.active) scene.tweens.add({ targets: group, alpha: 0, duration: 250, onComplete: () => group.destroy(true) });
        });
    }

    function endGame(scene, state, praise) {
        if (state.ended) return;
        state.ended = true;
        const duration = Math.max(1, Math.floor((Date.now() - state.startedAt) / 1000));
        const stars = starsFromState(state.attempts, state.mistakes, state.hintUsed);
        const starText = '⭐'.repeat(stars);

        const overlay = scene.add.container(400, 300).setDepth(2000);
        overlay.add(scene.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, 0.75));
        overlay.add(scene.add.text(0, -110, '🏆 ภารกิจสำเร็จ!', {
            fontFamily: 'Kanit, sans-serif',
            fontSize: '48px',
            color: '#facc15',
            fontStyle: 'bold'
        }).setOrigin(0.5));
        overlay.add(scene.add.text(0, -42, praise, {
            fontFamily: 'Kanit, sans-serif',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 650 }
        }).setOrigin(0.5));
        overlay.add(scene.add.text(0, 30, starText, {
            fontFamily: 'Kanit, sans-serif',
            fontSize: '50px',
            color: '#ffffff'
        }).setOrigin(0.5));
        overlay.add(scene.add.text(0, 96, `ใช้เวลา ${duration} วินาที | พยายาม ${state.attempts} ครั้ง`, {
            fontFamily: 'Kanit, sans-serif',
            fontSize: '22px',
            color: '#e5e7eb'
        }).setOrigin(0.5));

        scene.time.delayedCall(1900, () => {
            if (typeof window.sendResult === 'function') {
                window.sendResult(window.STAGE_ID, stars, duration, state.attempts);
            }
        });
    }

    function drawCommonHeader(scene, title, subtitle, state) {
        scene.add.rectangle(400, 38, 760, 58, 0xffffff, 0.95)
            .setStrokeStyle(2, 0xe5e7eb, 1);
        scene.add.text(38, 20, title, {
            fontFamily: 'Kanit, sans-serif',
            fontSize: '23px',
            color: '#1f2937',
            fontStyle: 'bold'
        });
        scene.add.text(38, 48, subtitle, {
            fontFamily: 'Kanit, sans-serif',
            fontSize: '15px',
            color: '#64748b'
        });
        state.attemptText = scene.add.text(650, 25, 'ลอง: 0 | พลาด: 0', {
            fontFamily: 'Kanit, sans-serif',
            fontSize: '17px',
            color: '#0f172a',
            fontStyle: 'bold'
        });
    }

    function updateAttemptText(state) {
        if (state.attemptText) {
            state.attemptText.setText(`ลอง: ${state.attempts} | พลาด: ${state.mistakes}`);
        }
        const attemptBadge = document.getElementById('attempt-badge');
        if (attemptBadge) {
            attemptBadge.textContent = `ลอง ${state.attempts} | พลาด ${state.mistakes}`;
            window.GameMotion?.badgeUpdate?.();
        }
    }

    function preloadCommon(scene) {
        scene.load.image('bg_farm', '../assets/img/bg_farm.webp');
        scene.load.image('bg_garden', '../assets/img/bg_v_garden.webp');
        scene.load.image('tractor', '../assets/img/tractor.webp');
        scene.load.image('rock', '../assets/img/rock.webp');
        scene.load.image('basket', '../assets/img/basket.webp');
        scene.load.image('plant', '../assets/img/newplant.webp');
        scene.load.image('sprout', '../assets/img/newsprout.webp');
        scene.load.audio('correct', '../assets/sound/correct.mp3');
        scene.load.audio('wrong', '../assets/sound/wrong.mp3');
    }

    function initSequence(gameConfig) {
        const feedbackClasses = {
            info: 'alert alert-info rounded-3 shadow-sm mt-3 mb-0 py-2',
            success: 'alert alert-success rounded-3 shadow-sm mt-3 mb-0 py-2',
            warning: 'alert alert-warning rounded-3 shadow-sm mt-3 mb-0 py-2',
            error: 'alert alert-danger rounded-3 shadow-sm mt-3 mb-0 py-2'
        };

        class SequenceScene extends Phaser.Scene {
            constructor() {
                super({ key: 'SequenceScene' });
                this.state = {
                    startedAt: Date.now(),
                    attempts: 0,
                    mistakes: 0,
                    hintUsed: false,
                    ended: false
                };
                this.levelIndex = 0;
                this.commands = [];
                this.collected = new Set();
                this.isRunning = false;
                this.facingDir = null;
            }

            preload() {
                preloadCommon(this);
            }

            create() {
                this.add.image(240, 200, 'bg_farm').setDisplaySize(480, 400).setAlpha(0.42);
                this.boardLayer = this.add.container(0, 0);
                this.fxLayer = this.add.container(0, 0);
                this.cacheDom();
                this.bindDomControls();
                this.loadLevel();
            }

            cacheDom() {
                const root = document.getElementById('game-container');
                this.dom = {
                    indicator: root.querySelector('#level-indicator'),
                    title: root.querySelector('#mission-title'),
                    mission: root.querySelector('#mission-text'),
                    feedback: root.querySelector('#feedback-box'),
                    soundToggle: root.querySelector('#sound-toggle'),
                    commandCount: root.querySelector('#command-count'),
                    sequence: root.querySelector('#sequence-container'),
                    clear: root.querySelector('#clear-commands'),
                    run: root.querySelector('#run-commands'),
                    arrows: Array.from(root.querySelectorAll('[data-dir]')),
                    controls: Array.from(root.querySelectorAll('.sequence-control'))
                };
            }

            bindDomControls() {
                window.GameAudio?.init?.();

                this.dom.arrows.forEach((button) => {
                    button.addEventListener('click', () => this.addCommand(button.dataset.dir));
                });
                this.dom.clear.addEventListener('click', () => this.clearCommands());
                this.dom.run.addEventListener('click', () => this.runCommands());

                if (this.dom.soundToggle && window.GameAudio) {
                    const updateSoundLabel = () => {
                        const soundEnabled = window.GameAudio.isEnabled();
                        this.dom.soundToggle.textContent = soundEnabled ? '🔊 เสียง' : '🔇 ปิดเสียง';
                        this.dom.soundToggle.setAttribute('aria-label', soundEnabled ? 'ปิดเสียงเกม' : 'เปิดเสียงเกม');
                    };

                    updateSoundLabel();
                    this.dom.soundToggle.addEventListener('click', () => {
                        window.GameAudio.toggle();
                        updateSoundLabel();
                        playGameSound(this, 'click');
                    });
                } else if (this.dom.soundToggle) {
                    this.dom.soundToggle.style.display = 'none';
                }
            }

            level() {
                return gameConfig.levels[this.levelIndex];
            }

            posKey(pos) {
                return `${pos.c},${pos.r}`;
            }

            point(raw) {
                if (!raw) return null;
                return {
                    c: Number.isInteger(raw.c) ? raw.c : raw.col,
                    r: Number.isInteger(raw.r) ? raw.r : raw.row,
                    type: raw.type
                };
            }

            obstacles() {
                return (this.level().obstacles || this.level().rocks || []).map((item) => this.point(item));
            }

            crops() {
                return (this.level().crops || this.level().targets || []).map((item) => ({ ...this.point(item), type: item.type || 'crop' }));
            }

            destination() {
                const level = this.level();
                return this.point(level.barn || level.finish || level.target || null);
            }

            isObstacle(c, r) {
                return this.obstacles().find((obstacle) => obstacle.c === c && obstacle.r === r) || null;
            }

            loadLevel() {
                const level = this.level();
                this.player = { c: level.start.c, r: level.start.r };
                this.collected = new Set();
                this.commands = [];
                this.facingDir = null;
                this.renderDom();
                this.renderBoard();
                this.showFeedback(level.goal || level.mission, 'info');
                window.GameMotion?.missionEnter?.();
            }

            renderDom() {
                const level = this.level();
                this.dom.indicator.textContent = `ด่านย่อยที่ ${this.levelIndex + 1} / ${gameConfig.levels.length}`;
                this.dom.title.textContent = level.title || level.name || gameConfig.title;
                this.dom.mission.textContent = level.mission || level.goal || gameConfig.subtitle;
                this.renderCommandPanel();
                updateAttemptText(this.state);
            }

            renderCommandPanel() {
                const level = this.level();
                this.dom.commandCount.textContent = `${this.commands.length} / ${level.maxCommands}`;
                this.dom.sequence.innerHTML = '';

                if (this.commands.length === 0) {
                    const placeholder = document.createElement('span');
                    placeholder.id = 'sequence-placeholder';
                    placeholder.className = 'text-muted small';
                    placeholder.textContent = 'กดปุ่มลูกศรด้านล่างเพื่อเพิ่มคำสั่ง';
                    this.dom.sequence.appendChild(placeholder);
                    this.animateLatestCommand = false;
                    return;
                }

                this.commands.forEach((cmd, index) => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'sequence-block';
                    button.disabled = this.isRunning;
                    button.textContent = DIRS[cmd].icon;
                    button.title = `ลบคำสั่ง ${DIRS[cmd].label}`;
                    button.setAttribute('aria-label', `ลบคำสั่ง ${DIRS[cmd].label}`);
                    button.addEventListener('click', () => {
                        if (this.isRunning) return;
                        this.commands.splice(index, 1);
                        playGameSound(this, 'click');
                        this.renderCommandPanel();
                    });
                    this.dom.sequence.appendChild(button);
                    if (this.animateLatestCommand && index === this.commands.length - 1) {
                        window.GameMotion?.commandAdded?.(button);
                    }
                });
                this.animateLatestCommand = false;
            }

            showFeedback(message, type = 'info') {
                this.dom.feedback.className = feedbackClasses[type] || feedbackClasses.info;
                this.dom.feedback.textContent = message;
                window.GameMotion?.feedback?.(type);
            }

            setControlsDisabled(disabled) {
                this.dom.controls.forEach((control) => {
                    control.disabled = disabled;
                });
                this.renderCommandPanel();
            }

            addCommand(dir) {
                const level = this.level();
                if (this.isRunning || !DIRS[dir]) return;
                if (this.commands.length >= level.maxCommands) {
                    playGameSound(this, 'wrong');
                    this.showFeedback('คำสั่งเต็มแล้ว ลบคำสั่งบางตัวก่อนนะ', 'warning');
                    return;
                }
                this.commands.push(dir);
                this.animateLatestCommand = true;
                playGameSound(this, 'click');
                this.renderCommandPanel();
            }

            clearCommands() {
                if (this.isRunning) return;
                const level = this.level();
                this.commands = [];
                this.facingDir = null;
                this.player = { c: level.start.c, r: level.start.r };
                this.collected = new Set();
                playGameSound(this, 'click');
                this.renderBoard();
                this.renderCommandPanel();
                this.showFeedback('ล้างคำสั่งแล้ว ลองวางเส้นทางใหม่ได้เลย', 'info');
            }

            updateTractorDirection(dirName) {
                if (!this.tractor) return;
                this.facingDir = dirName;

                const baseScaleX = Math.abs(this.tractor.scaleX);
                const baseScaleY = Math.abs(this.tractor.scaleY);

                if (dirName === 'LEFT') {
                    this.tractor.setAngle(0);
                    this.tractor.setScale(baseScaleX, baseScaleY);
                } else if (dirName === 'RIGHT') {
                    this.tractor.setAngle(0);
                    this.tractor.setScale(-baseScaleX, baseScaleY);
                } else if (dirName === 'UP') {
                    this.tractor.setAngle(90);
                    this.tractor.setScale(baseScaleX, baseScaleY);
                } else if (dirName === 'DOWN') {
                    this.tractor.setAngle(-90);
                    this.tractor.setScale(baseScaleX, baseScaleY);
                }
            }

            renderBoard() {
                const level = this.level();
                const tile = Math.min(62, Math.floor(Math.min(420 / level.cols, 324 / level.rows)));
                const boardW = level.cols * tile;
                const boardH = level.rows * tile;
                this.tile = tile;
                this.originX = Math.floor((480 - boardW) / 2);
                this.originY = Math.floor((400 - boardH) / 2);
                this.boardLayer.removeAll(true);

                this.boardLayer.add(this.add.rectangle(240, 200, boardW + 24, boardH + 24, 0xffffff, 0.84)
                    .setStrokeStyle(2, 0xd1d5db, 1));

                const crops = this.crops();
                const destination = this.destination();
                for (let r = 0; r < level.rows; r++) {
                    for (let c = 0; c < level.cols; c++) {
                        const x = this.originX + c * tile + tile / 2;
                        const y = this.originY + r * tile + tile / 2;
                        const fill = (r + c) % 2 === 0 ? 0xecfdf5 : 0xdcfce7;
                        const cell = this.add.rectangle(x, y, tile - 4, tile - 4, fill, 0.95)
                            .setStrokeStyle(1, 0x94a3b8, 0.9);
                        this.boardLayer.add(cell);

                        const obstacle = this.isObstacle(c, r);
                        if (obstacle) {
                            this.boardLayer.add(addGameObject(this, obstacle.type || 'rock', x, y, tile * 0.72));
                        }
                        crops.forEach((crop) => {
                            if (crop.c === c && crop.r === r && !this.collected.has(this.posKey(crop))) {
                                this.boardLayer.add(addGameObject(this, crop.type || 'crop', x, y, tile * 0.68));
                            }
                        });
                        if (destination && destination.c === c && destination.r === r) {
                            this.boardLayer.add(addGameObject(this, level.barn ? 'barn' : 'target', x, y, tile * 0.72));
                        }
                    }
                }

                const px = this.originX + this.player.c * tile + tile / 2;
                const py = this.originY + this.player.r * tile + tile / 2;
                this.tractor = addGameObject(this, 'tractor', px, py, tile * 0.82);
                this.boardLayer.add(this.tractor);

                const initialDir = this.facingDir || (this.commands && this.commands[0]) || 'RIGHT';
                this.updateTractorDirection(initialDir);

                if (crops.length > 0) {
                    const remaining = crops.length - this.collected.size;
                    this.dom.mission.textContent = `${level.mission || level.goal} (เก็บแล้ว ${this.collected.size} / ${crops.length}, เหลือ ${remaining})`;
                }
            }

            async runCommands() {
                if (this.isRunning || this.commands.length === 0) {
                    playGameSound(this, 'wrong');
                    this.showFeedback('ต้องเรียงคำสั่งอย่างน้อย 1 บล็อกก่อนรันรถไถ', 'warning');
                    return;
                }
                this.isRunning = true;
                this.setControlsDisabled(true);
                this.state.attempts++;
                updateAttemptText(this.state);
                playGameSound(this, 'run');
                const level = this.level();
                this.player = { c: level.start.c, r: level.start.r };
                this.collected = new Set();
                this.renderBoard();
                this.showFeedback('รถไถกำลังทำตามลำดับคำสั่ง', 'info');

                for (const cmd of this.commands) {
                    const dir = DIRS[cmd];
                    this.updateTractorDirection(cmd);
                    const next = { c: this.player.c + dir.dc, r: this.player.r + dir.dr };
                    const badOut = next.c < 0 || next.r < 0 || next.c >= level.cols || next.r >= level.rows;
                    const obstacle = !badOut ? this.isObstacle(next.c, next.r) : null;
                    if (badOut || obstacle) {
                        this.state.mistakes++;
                        updateAttemptText(this.state);
                        playGameSound(this, obstacle ? 'crash' : 'wrong');
                        this.tweens.add({ targets: this.tractor, x: this.tractor.x + dir.dc * 16, y: this.tractor.y + dir.dr * 16, yoyo: true, duration: 120 });
                        const obstacleText = obstacle && obstacle.type === 'hay'
                            ? 'รถไถชนกองฟาง ลองวางเส้นทางอ้อมดูนะ'
                            : 'เส้นทางนี้มีหินหรือสิ่งกีดขวาง ลองเปลี่ยนทิศทาง';
                        this.showFeedback(badOut ? 'รถไถออกนอกแปลง ลองตรวจทิศทางอีกครั้ง' : (level.crashFeedback || obstacleText), 'error');
                        this.isRunning = false;
                        this.setControlsDisabled(false);
                        return;
                    }
                    this.player = next;
                    const x = this.originX + next.c * this.tile + this.tile / 2;
                    const y = this.originY + next.r * this.tile + this.tile / 2;
                    await new Promise((resolve) => {
                        this.tweens.add({ targets: this.tractor, x, y, duration: 330, onComplete: resolve });
                    });
                    const cropHit = this.crops().find((crop) => crop.c === next.c && crop.r === next.r);
                    if (cropHit && !this.collected.has(this.posKey(cropHit))) {
                        this.collected.add(this.posKey(cropHit));
                        playGameSound(this, 'collect');
                        this.showFeedback('เก็บผลผลิตแล้ว!', 'success');
                        const effect = this.add.text(x, y - 28, '+1', { fontFamily: 'Arial, sans-serif', fontSize: '22px', color: '#16a34a', fontStyle: 'bold' }).setOrigin(0.5);
                        this.tweens.add({ targets: effect, y: effect.y - 20, alpha: 0, duration: 700, onComplete: () => effect.destroy() });
                        this.renderBoard();
                    }
                }

                this.isRunning = false;
                this.setControlsDisabled(false);
                const crops = this.crops();
                const allCollected = crops.every((crop) => this.collected.has(this.posKey(crop)));
                const destination = this.destination() || crops[0];
                const atDestination = destination && this.player.c === destination.c && this.player.r === destination.r;
                if (atDestination && crops.length > 0 && !allCollected) {
                    this.state.mistakes++;
                    updateAttemptText(this.state);
                    playGameSound(this, 'wrong');
                    this.showFeedback('ยังมีผลผลิตเหลืออยู่ ต้องเก็บให้ครบก่อนกลับโรงนา', 'warning');
                } else if (allCollected && atDestination) {
                    if (this.levelIndex < gameConfig.levels.length - 1) {
                        playGameSound(this, 'success');
                        this.showFeedback('ยอดเยี่ยม! ลำดับคำสั่งถูกต้อง ไปด่านย่อยถัดไป', 'success');
                        this.time.delayedCall(1200, () => {
                            this.levelIndex++;
                            this.loadLevel();
                        });
                    } else {
                        this.finishGame('คุณวางแผนเส้นทางและเรียงคำสั่งได้ดีมาก');
                    }
                } else {
                    this.state.mistakes++;
                    updateAttemptText(this.state);
                    playGameSound(this, 'wrong');
                    this.showFeedback(crops.length > 0 && !allCollected ? 'คำสั่งถูกบางส่วนแล้ว แต่ยังเก็บผลผลิตไม่ครบ' : 'ยังไม่ถึงจุดหมาย ลองเพิ่มหรือเปลี่ยนคำสั่ง', 'warning');
                }
            }

            finishGame(praise) {
                if (this.state.ended) return;
                this.state.ended = true;
                this.setControlsDisabled(true);
                playGameSound(this, 'victory');
                const duration = Math.max(1, Math.floor((Date.now() - this.state.startedAt) / 1000));
                const stars = starsFromState(this.state.attempts, this.state.mistakes, this.state.hintUsed);
                this.dom.title.textContent = 'ภารกิจสำเร็จ!';
                this.dom.mission.textContent = `${praise} ได้ ${'⭐'.repeat(stars)} ใช้เวลา ${duration} วินาที`;
                this.showFeedback(`ผ่านครบ ${gameConfig.levels.length} ด่านย่อยแล้ว กำลังบันทึกผลลัพธ์`, 'success');
                this.time.delayedCall(1900, () => {
                    if (typeof window.sendResult === 'function') {
                        window.sendResult(window.STAGE_ID, stars, duration, this.state.attempts);
                    }
                });
            }
        }

        createSequenceGame(SequenceScene);
    }

    function initCondition(gameConfig) {
        class ConditionScene extends Phaser.Scene {
            constructor() {
                super({ key: 'ConditionScene' });
                this.state = {
                    startedAt: Date.now(),
                    attempts: 0,
                    mistakes: 0,
                    hintUsed: false,
                    ended: false
                };
                this.assignments = {};
            }

            preload() {
                preloadCommon(this);
            }

            create() {
                this.add.image(400, 300, 'bg_garden').setDisplaySize(WIDTH, HEIGHT).setAlpha(0.55);
                drawCommonHeader(this, gameConfig.title, gameConfig.subtitle, this.state);
                this.slotRects = [];
                this.slotTexts = [];
                this.drawPlots();
                this.drawActionBlocks();
                this.drawControls();
                showToast(this, gameConfig.hint, 'info');
            }

            drawPlots() {
                const count = gameConfig.scenarios.length;
                const width = count > 2 ? 230 : 300;
                const startX = count > 2 ? 150 : 250;
                gameConfig.scenarios.forEach((scenario, index) => {
                    const x = startX + index * (width + 20);
                    addPanel(this, x, 245, width, 250, 0xffffff, 0.95);
                    this.add.text(x, 135, `${scenario.icon} ${scenario.name}`, {
                        fontFamily: 'Kanit',
                        fontSize: '23px',
                        color: '#0f172a',
                        fontStyle: 'bold'
                    }).setOrigin(0.5);
                    this.add.text(x, 172, scenario.status, {
                        fontFamily: 'Kanit',
                        fontSize: '16px',
                        color: '#475569',
                        align: 'center',
                        wordWrap: { width: width - 24 }
                    }).setOrigin(0.5);
                    this.add.text(x, 226, scenario.status.includes('ฝน') ? '☁️💧' : '☀️', { fontSize: '42px' }).setOrigin(0.5);
                    this.add.image(x - 40, 274, scenario.status.includes('เหี่ยว') || scenario.status.includes('แห้ง') ? 'sprout' : 'plant').setDisplaySize(58, 58);
                    this.add.text(x + 36, 274, '🚿', { fontSize: '44px' }).setOrigin(0.5);
                    const slot = this.add.rectangle(x, 345, width - 42, 56, 0xecfeff, 1)
                        .setStrokeStyle(3, 0x0891b2, 1)
                        .setData('scenarioIndex', index);
                    const label = this.add.text(x, 345, 'ลากคำสั่งมาวางที่นี่', {
                        fontFamily: 'Kanit',
                        fontSize: '15px',
                        color: '#0891b2'
                    }).setOrigin(0.5);
                    this.slotRects[index] = slot;
                    this.slotTexts[index] = label;
                });
            }

            drawActionBlocks() {
                const paletteY = 455;
                const startX = 400 - ((gameConfig.actions.length - 1) * 155) / 2;
                gameConfig.actions.forEach((action, index) => {
                    const x = startX + index * 155;
                    const block = this.add.container(x, paletteY);
                    const rect = this.add.rectangle(0, 0, 136, 54, 0x0891b2, 1)
                        .setStrokeStyle(2, 0xffffff, 1);
                    const txt = this.add.text(0, 0, action.label, {
                        fontFamily: 'Kanit',
                        fontSize: '17px',
                        color: '#ffffff',
                        fontStyle: 'bold'
                    }).setOrigin(0.5);
                    block.add([rect, txt]);
                    block.setSize(136, 54).setInteractive({ draggable: true, useHandCursor: true });
                    block.setData('value', action.value);
                    block.setData('label', action.label);
                    block.setData('homeX', x);
                    block.setData('homeY', paletteY);
                    this.input.setDraggable(block);
                });

                this.input.on('dragstart', (pointer, obj) => obj.setDepth(500).setAlpha(0.82));
                this.input.on('drag', (pointer, obj, dragX, dragY) => {
                    obj.x = dragX;
                    obj.y = dragY;
                });
                this.input.on('dragend', (pointer, obj) => {
                    obj.setDepth(1).setAlpha(1);
                    const slotIndex = this.slotRects.findIndex((slot) => Phaser.Geom.Rectangle.Contains(slot.getBounds(), obj.x, obj.y));
                    if (slotIndex >= 0) {
                        this.assignments[slotIndex] = obj.getData('value');
                        this.slotTexts[slotIndex].setText(obj.getData('label'));
                        this.slotTexts[slotIndex].setColor('#0f172a');
                    }
                    this.tweens.add({ targets: obj, x: obj.getData('homeX'), y: obj.getData('homeY'), duration: 180, ease: 'Back.out' });
                });
            }

            drawControls() {
                addButton(this, 295, 532, 148, 44, 'คำใบ้', 0x64748b, () => {
                    this.state.hintUsed = true;
                    showToast(this, gameConfig.hint, 'info');
                });
                addButton(this, 470, 532, 210, 44, 'ทดสอบระบบ', 0x0891b2, () => this.checkSystem());
            }

            checkSystem() {
                this.state.attempts++;
                updateAttemptText(this.state);
                let correct = true;
                gameConfig.scenarios.forEach((scenario, index) => {
                    const ok = this.assignments[index] === scenario.answer;
                    if (!ok) correct = false;
                    this.slotRects[index].setFillStyle(ok ? 0xdcfce7 : 0xfee2e2);
                    this.slotRects[index].setStrokeStyle(3, ok ? 0x16a34a : 0xdc2626);
                    const x = this.slotRects[index].x;
                    const y = this.slotRects[index].y - 102;
                    this.add.text(x, y, ok ? '✅' : '⚠️', { fontSize: '34px' }).setOrigin(0.5);
                });

                if (correct) {
                    playSound(this, 'correct');
                    this.waterEffect();
                    endGame(this, this.state, 'คุณตั้งเงื่อนไขให้ระบบรดน้ำทำงานถูกต้อง');
                } else {
                    this.state.mistakes++;
                    updateAttemptText(this.state);
                    playSound(this, 'wrong');
                    showToast(this, gameConfig.feedback, 'error');
                }
            }

            waterEffect() {
                for (let i = 0; i < 18; i++) {
                    const drop = this.add.text(Phaser.Math.Between(120, 690), Phaser.Math.Between(180, 360), '💧', { fontSize: '24px' }).setOrigin(0.5);
                    this.tweens.add({ targets: drop, y: drop.y + 60, alpha: 0, duration: 900, delay: i * 30, onComplete: () => drop.destroy() });
                }
            }
        }

        createGame(ConditionScene);
    }

    function ensureIrrigationStyles() {
        if (document.getElementById('farm-missions-irrigation-style')) return;
        const style = document.createElement('style');
        style.id = 'farm-missions-irrigation-style';
        style.innerHTML = `
            #game-container { width: min(1000px, 94vw); }
            .irrigation-shell,
            .irrigation-shell * { box-sizing: border-box; }
            .irrigation-shell {
                width: min(1000px, 94vw);
                font-family: 'Kanit', sans-serif;
                color: #0f172a;
            }
            .irrigation-top,
            .irrigation-panel {
                background: #ffffff;
                border: 1px solid #dbeafe;
                border-radius: 8px;
                box-shadow: 0 12px 28px rgba(15, 23, 42, .08);
            }
            .irrigation-top {
                padding: 14px 16px;
                margin-bottom: 12px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 12px;
            }
            .irrigation-title {
                font-weight: 800;
                font-size: 22px;
                margin: 0 0 4px;
                color: #0f172a;
            }
            .irrigation-subtitle {
                margin: 0;
                color: #475569;
                font-size: 15px;
            }
            .irrigation-badges {
                display: flex;
                flex-wrap: wrap;
                justify-content: flex-end;
                gap: 8px;
                min-width: 210px;
            }
            .irrigation-badge {
                border-radius: 999px;
                padding: 7px 11px;
                font-weight: 700;
                font-size: 13px;
                background: #ecfeff;
                color: #0e7490;
                border: 1px solid #a5f3fc;
            }
            .irrigation-layout {
                display: grid;
                grid-template-columns: minmax(0, 1.08fr) minmax(320px, .92fr);
                gap: 12px;
                align-items: stretch;
            }
            .irrigation-panel { padding: 14px; }
            .irrigation-panel-title {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                font-size: 18px;
                font-weight: 800;
                margin: 0 0 12px;
                color: #164e63;
            }
            .irrigation-plots {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 10px;
            }
            .irrigation-plot {
                min-height: 178px;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 10px;
                background: #f8fafc;
                position: relative;
                overflow: hidden;
            }
            .irrigation-plot.result-healthy,
            .irrigation-plot.result-safe,
            .irrigation-plot.result-refill_needed,
            .irrigation-plot.result-observe { border-color: #22c55e; background: #f0fdf4; }
            .irrigation-plot.result-flood,
            .irrigation-plot.result-dry,
            .irrigation-plot.result-no_water,
            .irrigation-plot.result-no_action,
            .irrigation-plot.result-unnecessary_refill { border-color: #ef4444; background: #fef2f2; }
            .plot-head {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
                font-weight: 800;
                margin-bottom: 8px;
            }
            .plot-icon { font-size: 30px; line-height: 1; }
            .plot-status {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 8px;
            }
            .sensor-pill {
                border-radius: 999px;
                padding: 5px 8px;
                font-size: 12px;
                font-weight: 700;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                color: #334155;
            }
            .plot-health {
                height: 9px;
                border-radius: 999px;
                background: #e2e8f0;
                overflow: hidden;
                margin: 8px 0;
            }
            .plot-health > span {
                display: block;
                height: 100%;
                min-width: 4px;
                border-radius: 999px;
                background: #22c55e;
                transition: width .24s ease;
            }
            .plot-result {
                min-height: 46px;
                font-size: 13px;
                color: #475569;
                line-height: 1.45;
            }
            .rule-list {
                display: grid;
                gap: 9px;
            }
            .rule-row {
                display: grid;
                grid-template-columns: 96px minmax(0, 1fr);
                gap: 8px;
                align-items: center;
                border: 1px solid #bae6fd;
                border-radius: 8px;
                background: #f0f9ff;
                padding: 8px;
            }
            .rule-label {
                font-weight: 800;
                color: #0369a1;
                font-size: 14px;
            }
            .rule-slots {
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
                gap: 8px;
            }
            .rule-slot {
                min-height: 44px;
                border: 2px dashed #7dd3fc;
                border-radius: 8px;
                background: #ffffff;
                color: #64748b;
                font-weight: 700;
                font-size: 14px;
                padding: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                cursor: pointer;
                transition: transform .15s ease, border-color .15s ease, background .15s ease;
            }
            .rule-slot:hover,
            .rule-slot.slot-target {
                transform: translateY(-1px);
                border-color: #0891b2;
                background: #ecfeff;
            }
            .rule-slot.filled {
                border-style: solid;
                background: #ffffff;
                color: #0f172a;
            }
            .rule-slot.fixed {
                cursor: default;
                border-style: solid;
                background: #e0f2fe;
                color: #075985;
            }
            .block-palette {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-top: 12px;
            }
            .block-group {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                background: #ffffff;
                padding: 10px;
            }
            .block-group-title {
                font-size: 14px;
                font-weight: 800;
                color: #334155;
                margin-bottom: 8px;
            }
            .block-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            .logic-block {
                border: 0;
                border-radius: 8px;
                min-height: 42px;
                padding: 8px 11px;
                font-weight: 800;
                color: #ffffff;
                box-shadow: 0 4px 10px rgba(15, 23, 42, .14);
                cursor: grab;
                touch-action: manipulation;
            }
            .logic-block.condition { background: #0284c7; }
            .logic-block.action { background: #16a34a; }
            .logic-block.selected {
                outline: 3px solid #facc15;
                outline-offset: 2px;
                transform: translateY(-1px);
            }
            .irrigation-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 12px;
            }
            .irrigation-control {
                border: 0;
                border-radius: 999px;
                padding: 10px 15px;
                font-weight: 800;
                color: #ffffff;
                background: #0891b2;
                cursor: pointer;
            }
            .irrigation-control.secondary { background: #64748b; }
            .irrigation-control.warning { background: #d97706; }
            .irrigation-control.danger { background: #dc2626; }
            .feedback-panel {
                margin-top: 12px;
                border-radius: 8px;
                border: 1px solid #bae6fd;
                background: #ecfeff;
                padding: 12px;
            }
            .feedback-panel.success { border-color: #86efac; background: #f0fdf4; }
            .feedback-panel.error { border-color: #fecaca; background: #fef2f2; }
            .feedback-title {
                font-weight: 800;
                margin-bottom: 6px;
                color: #164e63;
            }
            .feedback-panel.error .feedback-title { color: #991b1b; }
            .feedback-panel.success .feedback-title { color: #166534; }
            .feedback-body {
                color: #334155;
                line-height: 1.55;
                font-size: 14px;
            }
            .run-log {
                margin: 8px 0 0;
                padding-left: 18px;
                color: #475569;
                font-size: 13px;
            }
            .irrigation-finish {
                position: fixed;
                inset: 0;
                z-index: 3000;
                background: rgba(15, 23, 42, .78);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .finish-card {
                width: min(560px, 92vw);
                background: #ffffff;
                border-radius: 8px;
                padding: 28px;
                text-align: center;
                box-shadow: 0 24px 80px rgba(15, 23, 42, .35);
            }
            .finish-card h3 {
                font-size: 34px;
                font-weight: 800;
                color: #166534;
                margin: 0 0 10px;
            }
            .finish-stars {
                font-size: 42px;
                margin: 12px 0;
                color: #f59e0b;
            }
            @media (max-width: 900px) {
                .irrigation-top { flex-direction: column; }
                .irrigation-badges { justify-content: flex-start; min-width: 0; }
                .irrigation-layout,
                .block-palette { grid-template-columns: 1fr; }
                .irrigation-plots { grid-template-columns: 1fr; }
            }
            @media (max-width: 560px) {
                .rule-row,
                .rule-slots { grid-template-columns: 1fr; }
                .irrigation-title { font-size: 19px; }
                .logic-block,
                .irrigation-control { width: 100%; }
            }
        `;
        document.head.appendChild(style);
    }

    function initIrrigationBuilder(gameConfig) {
        ensureIrrigationStyles();
        const container = document.getElementById('game-container');
        if (!container) return;

        const conditionMap = Object.fromEntries((gameConfig.conditions || []).map((item) => [item.value, item]));
        const actionMap = Object.fromEntries((gameConfig.actions || []).map((item) => [item.value, item]));
        const rows = (gameConfig.ruleRows || buildRuleRows(gameConfig.solutionPriority || [])).map((row, index) => ({
            ...row,
            label: row.label || (index === 0 ? 'ถ้า' : row.fixedCondition === 'else' ? 'มิฉะนั้น' : 'มิฉะนั้นถ้า')
        }));
        const state = {
            startedAt: Date.now(),
            attempts: 0,
            mistakes: 0,
            hints: 0,
            ended: false,
            selected: null,
            history: [],
            rules: rows.map((row) => ({
                condition: row.fixedCondition || null,
                action: null
            })),
            results: null
        };

        renderShell();
        bindEvents();
        renderAll();
        showFeedback('เริ่มจากเลือกบล็อกเงื่อนไขและคำสั่ง แล้ววางลงในแผงกฎจากบนลงล่าง', 'info');

        function buildRuleRows(priority) {
            const source = priority.length ? priority : ['soil_dry', 'else'];
            return source.map((condition, index) => ({
                label: index === 0 ? 'ถ้า' : condition === 'else' ? 'มิฉะนั้น' : 'มิฉะนั้นถ้า',
                fixedCondition: condition === 'else' ? 'else' : null
            }));
        }

        function renderShell() {
            container.innerHTML = `
                <div class="irrigation-shell">
                    <div class="irrigation-top">
                        <div>
                            <h3 class="irrigation-title">${escapeHtml(gameConfig.title)}</h3>
                            <p class="irrigation-subtitle">${escapeHtml(gameConfig.subtitle)}</p>
                        </div>
                        <div class="irrigation-badges">
                            <span class="irrigation-badge" id="irrigation-attempts">ลอง 0 ครั้ง</span>
                            <span class="irrigation-badge" id="irrigation-mistakes">พลาด 0 ครั้ง</span>
                            <span class="irrigation-badge" id="irrigation-hints">คำใบ้ 0</span>
                        </div>
                    </div>

                    <div class="irrigation-layout">
                        <section class="irrigation-panel">
                            <h4 class="irrigation-panel-title">
                                <span>แปลงผักและข้อมูลเซ็นเซอร์</span>
                                <span>🚿</span>
                            </h4>
                            <div id="irrigation-plots" class="irrigation-plots"></div>
                        </section>

                        <section class="irrigation-panel">
                            <h4 class="irrigation-panel-title">
                                <span>แผงสร้างกฎ If-Then-Else</span>
                                <span>🧩</span>
                            </h4>
                            <div id="irrigation-rules" class="rule-list"></div>
                            <div class="irrigation-controls">
                                <button type="button" class="irrigation-control" id="run-irrigation">ทดสอบระบบ</button>
                                <button type="button" class="irrigation-control secondary" id="hint-irrigation">คำใบ้</button>
                                <button type="button" class="irrigation-control warning" id="undo-irrigation">ย้อนกลับ</button>
                                <button type="button" class="irrigation-control danger" id="clear-irrigation">ล้างกฎ</button>
                            </div>
                        </section>
                    </div>

                    <div class="block-palette">
                        <section class="block-group">
                            <div class="block-group-title">บล็อกเงื่อนไข</div>
                            <div id="condition-blocks" class="block-list"></div>
                        </section>
                        <section class="block-group">
                            <div class="block-group-title">บล็อกคำสั่ง</div>
                            <div id="action-blocks" class="block-list"></div>
                        </section>
                    </div>

                    <section id="irrigation-feedback" class="feedback-panel">
                        <div class="feedback-title">คำแนะนำ</div>
                        <div class="feedback-body">เลือกบล็อกเพื่อเริ่มสร้างกฎ</div>
                    </section>
                </div>
            `;
        }

        function bindEvents() {
            container.querySelector('#run-irrigation').addEventListener('click', runSimulation);
            container.querySelector('#hint-irrigation').addEventListener('click', showHint);
            container.querySelector('#undo-irrigation').addEventListener('click', undo);
            container.querySelector('#clear-irrigation').addEventListener('click', clearRules);

            container.addEventListener('click', (event) => {
                const block = event.target.closest('.logic-block');
                if (block) {
                    state.selected = { kind: block.dataset.kind, value: block.dataset.value };
                    renderBlocks();
                    showFeedback(`เลือกบล็อก "${block.textContent.trim()}" แล้ว แตะช่องที่ต้องการวาง`, 'info');
                    return;
                }

                const slot = event.target.closest('.rule-slot');
                if (slot && !slot.classList.contains('fixed')) {
                    handleSlotChoice(slot);
                }
            });

            container.addEventListener('dragstart', (event) => {
                const block = event.target.closest('.logic-block');
                if (!block) return;
                event.dataTransfer.setData('text/plain', JSON.stringify({
                    kind: block.dataset.kind,
                    value: block.dataset.value
                }));
                event.dataTransfer.effectAllowed = 'copy';
                state.selected = { kind: block.dataset.kind, value: block.dataset.value };
                renderBlocks();
            });

            container.addEventListener('dragover', (event) => {
                const slot = event.target.closest('.rule-slot');
                if (!slot || slot.classList.contains('fixed')) return;
                event.preventDefault();
                slot.classList.add('slot-target');
            });

            container.addEventListener('dragleave', (event) => {
                const slot = event.target.closest('.rule-slot');
                if (slot) slot.classList.remove('slot-target');
            });

            container.addEventListener('drop', (event) => {
                const slot = event.target.closest('.rule-slot');
                if (!slot || slot.classList.contains('fixed')) return;
                event.preventDefault();
                slot.classList.remove('slot-target');
                try {
                    const payload = JSON.parse(event.dataTransfer.getData('text/plain'));
                    applyToSlot(slot, payload);
                } catch (error) {
                    showFeedback('วางบล็อกนี้ไม่ได้ ลองเลือกบล็อกอีกครั้ง', 'error');
                }
            });
        }

        function handleSlotChoice(slot) {
            const ruleIndex = Number(slot.dataset.ruleIndex);
            const kind = slot.dataset.kind;
            if (!state.selected) {
                const current = state.rules[ruleIndex][kind];
                if (current) {
                    pushHistory();
                    state.rules[ruleIndex][kind] = null;
                    state.results = null;
                    renderAll();
                    showFeedback('ลบบล็อกออกจากช่องแล้ว', 'info');
                    return;
                }
                showFeedback('เลือกบล็อกจากด้านล่างก่อน แล้วค่อยแตะช่องนี้', 'info');
                return;
            }
            applyToSlot(slot, state.selected);
        }

        function applyToSlot(slot, payload) {
            const ruleIndex = Number(slot.dataset.ruleIndex);
            const kind = slot.dataset.kind;
            if (payload.kind !== kind) {
                showFeedback(kind === 'condition'
                    ? 'ช่องนี้ต้องใช้บล็อกเงื่อนไข เช่น ดินแห้ง ฝนตก หรือถังน้ำหมด'
                    : 'ช่องนี้ต้องใช้บล็อกคำสั่ง เช่น รดน้ำ หยุดรดน้ำ หรือแจ้งเตือนเติมน้ำ', 'error');
                return;
            }
            pushHistory();
            state.rules[ruleIndex][kind] = payload.value;
            state.results = null;
            state.selected = null;
            renderAll();
        }

        function pushHistory() {
            state.history.push(JSON.stringify(state.rules));
            if (state.history.length > 20) state.history.shift();
        }

        function undo() {
            const previous = state.history.pop();
            if (!previous) {
                showFeedback('ยังไม่มีขั้นตอนให้ย้อนกลับ', 'info');
                return;
            }
            state.rules = JSON.parse(previous);
            state.results = null;
            state.selected = null;
            renderAll();
            showFeedback('ย้อนกลับ 1 ขั้นแล้ว', 'info');
        }

        function clearRules() {
            pushHistory();
            state.rules = rows.map((row) => ({ condition: row.fixedCondition || null, action: null }));
            state.results = null;
            state.selected = null;
            renderAll();
            showFeedback('ล้างกฎแล้ว เริ่มวางเงื่อนไขใหม่ได้เลย', 'info');
        }

        function showHint() {
            state.hints++;
            renderBadges();
            showFeedback(gameConfig.hint || buildSolutionHint(), 'info');
        }

        function buildSolutionHint() {
            const priority = gameConfig.solutionPriority || [];
            if (!priority.length) return 'ลองอ่านข้อมูลเซ็นเซอร์ แล้วเรียงเงื่อนไขจากสิ่งที่ต้องระวังก่อน';
            return `ลองเรียงกฎเป็น ${priority.map((condition) => conditionLabel(condition)).join(' → ')}`;
        }

        function renderAll() {
            renderBadges();
            renderPlots();
            renderRules();
            renderBlocks();
        }

        function renderBadges() {
            container.querySelector('#irrigation-attempts').textContent = `ลอง ${state.attempts} ครั้ง`;
            container.querySelector('#irrigation-mistakes').textContent = `พลาด ${state.mistakes} ครั้ง`;
            container.querySelector('#irrigation-hints').textContent = `คำใบ้ ${state.hints}`;
        }

        function renderPlots() {
            const wrap = container.querySelector('#irrigation-plots');
            const results = state.results || [];
            wrap.innerHTML = gameConfig.plots.map((plot, index) => {
                const result = results[index];
                const health = result ? result.health : plot.health;
                const className = result ? ` result-${result.result}` : '';
                return `
                    <article class="irrigation-plot${className}">
                        <div class="plot-head">
                            <span>${escapeHtml(plot.name)}</span>
                            <span class="plot-icon">${plotIcon(plot, result)}</span>
                        </div>
                        <div class="plot-status">
                            <span class="sensor-pill">${plot.soil === 'dry' ? 'ดินแห้ง' : 'ดินชื้น'}</span>
                            <span class="sensor-pill">${plot.rain ? 'ฝนตก' : 'ไม่มีฝน'}</span>
                            <span class="sensor-pill">${plot.tank === 'empty' ? 'ถังน้ำหมด' : 'ถังน้ำพร้อม'}</span>
                        </div>
                        <div class="plot-health"><span style="width:${Math.max(4, health)}%"></span></div>
                        <div class="plot-result">${result ? escapeHtml(result.message) : escapeHtml(plot.note || 'รอทดสอบกฎของเครื่องรดน้ำ')}</div>
                    </article>
                `;
            }).join('');
        }

        function renderRules() {
            const wrap = container.querySelector('#irrigation-rules');
            wrap.innerHTML = rows.map((row, index) => {
                const rule = state.rules[index];
                const fixed = row.fixedCondition === 'else';
                return `
                    <div class="rule-row">
                        <div class="rule-label">${escapeHtml(row.label)}</div>
                        <div class="rule-slots">
                            <button type="button"
                                class="rule-slot ${fixed ? 'fixed filled' : rule.condition ? 'filled' : ''}"
                                data-rule-index="${index}"
                                data-kind="condition">
                                ${escapeHtml(fixed ? 'กรณีอื่น ๆ' : rule.condition ? conditionLabel(rule.condition) : 'วางเงื่อนไข')}
                            </button>
                            <button type="button"
                                class="rule-slot ${rule.action ? 'filled' : ''}"
                                data-rule-index="${index}"
                                data-kind="action">
                                ${escapeHtml(rule.action ? actionLabel(rule.action) : 'วางคำสั่ง')}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderBlocks() {
            const conditionWrap = container.querySelector('#condition-blocks');
            const actionWrap = container.querySelector('#action-blocks');
            conditionWrap.innerHTML = (gameConfig.conditions || []).map((condition) => blockHtml(condition, 'condition')).join('');
            actionWrap.innerHTML = (gameConfig.actions || []).map((action) => blockHtml(action, 'action')).join('');
        }

        function blockHtml(item, kind) {
            const selected = state.selected && state.selected.kind === kind && state.selected.value === item.value;
            return `
                <button type="button"
                    class="logic-block ${kind} ${selected ? 'selected' : ''}"
                    draggable="true"
                    data-kind="${kind}"
                    data-value="${escapeHtml(item.value)}">
                    ${escapeHtml(item.label)}
                </button>
            `;
        }

        function runSimulation() {
            if (state.ended) return;
            state.attempts++;
            renderBadges();

            const missing = findMissingRule();
            if (missing) {
                state.mistakes++;
                renderBadges();
                showFeedback(missing, 'error');
                return;
            }

            const simulation = simulateRules();
            state.results = simulation.results;
            renderPlots();

            if (simulation.passed) {
                finishGame(simulation);
                return;
            }

            state.mistakes++;
            renderBadges();
            showFeedback(simulation.feedback, 'error', simulation.logs);
        }

        function findMissingRule() {
            for (let i = 0; i < state.rules.length; i++) {
                const row = rows[i];
                const rule = state.rules[i];
                if (!row.fixedCondition && !rule.condition) {
                    return `กฎแถวที่ ${i + 1} ยังไม่มีเงื่อนไข ลองวางบล็อกเงื่อนไขก่อน`;
                }
                if (!rule.action) {
                    return `กฎแถวที่ ${i + 1} ยังไม่มีคำสั่ง ระบบจึงยังตัดสินใจไม่ครบ`;
                }
            }
            return '';
        }

        function simulateRules() {
            const rules = state.rules.map((rule) => ({ ...rule }));
            const priorityIssue = checkPriority(rules);
            const logs = [];
            const errors = [];
            let waterWaste = 0;
            const results = gameConfig.plots.map((plot) => {
                const decision = evaluateRules(plot, rules);
                const outcome = applyAction(plot, decision.action);
                waterWaste += outcome.waterWaste;
                const expectedAction = plot.expectedAction;
                const actionOk = expectedAction ? decision.action === expectedAction : outcome.safe;
                const ok = actionOk && outcome.safe;
                const log = `${plot.name}: ${describePlot(plot)} → ${actionLabel(decision.action)} → ${outcome.label}`;
                logs.push(log);
                if (!ok) {
                    errors.push(buildPlotError(plot, decision, outcome, expectedAction));
                }
                return {
                    ...outcome,
                    action: decision.action,
                    ruleIndex: decision.ruleIndex,
                    message: `${actionLabel(decision.action)}: ${outcome.label}`
                };
            });

            if (priorityIssue) errors.unshift(priorityIssue);
            return {
                results,
                logs,
                waterWaste,
                passed: errors.length === 0,
                feedback: errors[0] || 'กฎยังไม่ครอบคลุมทุกสถานการณ์ ลองปรับลำดับเงื่อนไขอีกครั้ง'
            };
        }

        function checkPriority(rules) {
            const expected = gameConfig.solutionPriority || [];
            if (!gameConfig.strictPriority || !expected.length) return '';
            const actual = rules.map((rule) => rule.condition);
            for (let i = 0; i < expected.length; i++) {
                if (actual[i] !== expected[i]) {
                    return `ลำดับเงื่อนไขยังไม่ถูกต้อง ควรตรวจ "${conditionLabel(expected[i])}" ในแถวที่ ${i + 1} เพราะระบบอ่านกฎจากบนลงล่าง`;
                }
            }
            return '';
        }

        function evaluateRules(plot, rules) {
            for (let i = 0; i < rules.length; i++) {
                const rule = rules[i];
                if (rule.condition === 'else' || checkCondition(plot, rule.condition)) {
                    return { action: rule.action || 'no_action', ruleIndex: i };
                }
            }
            return { action: 'no_action', ruleIndex: -1 };
        }

        function checkCondition(plot, condition) {
            if (condition === 'soil_dry') return plot.soil === 'dry';
            if (condition === 'soil_wet') return plot.soil === 'wet';
            if (condition === 'rain') return plot.rain === true;
            if (condition === 'tank_empty') return plot.tank === 'empty';
            if (condition === 'tank_ready') return plot.tank === 'ready';
            return false;
        }

        function applyAction(plot, action) {
            let health = plot.health;
            let result = 'safe';
            let label = 'ปลอดภัย';
            let safe = true;
            let waterWaste = 0;

            if (action === 'water') {
                if (plot.tank === 'empty') {
                    result = 'no_water';
                    label = 'ถังน้ำหมด พืชยังไม่ได้รับน้ำ';
                    health -= 18;
                    safe = false;
                } else if (plot.rain || plot.soil === 'wet') {
                    result = 'flood';
                    label = 'น้ำมากเกินไป';
                    health -= 24;
                    safe = false;
                    waterWaste = 1;
                } else {
                    result = 'healthy';
                    label = 'พืชฟื้นและดินชุ่มพอดี';
                    health += 24;
                }
            } else if (action === 'stop') {
                if (plot.soil === 'dry' && !plot.rain) {
                    result = 'dry';
                    label = 'พืชยังขาดน้ำ';
                    health -= 18;
                    safe = false;
                } else {
                    result = 'safe';
                    label = 'หยุดรดน้ำได้ถูกต้อง';
                }
            } else if (action === 'refill') {
                if (plot.tank === 'empty') {
                    result = 'refill_needed';
                    label = 'แจ้งเตือนเติมน้ำก่อนรดน้ำ';
                } else {
                    result = 'unnecessary_refill';
                    label = 'แจ้งเติมน้ำทั้งที่ถังยังพร้อม';
                    safe = false;
                }
            } else if (action === 'observe') {
                if (plot.soil === 'dry' && !plot.rain && plot.tank !== 'empty') {
                    result = 'dry';
                    label = 'สังเกตเฉย ๆ ทำให้พืชยังขาดน้ำ';
                    health -= 12;
                    safe = false;
                } else {
                    result = 'observe';
                    label = 'สังเกตต่อได้อย่างปลอดภัย';
                }
            } else {
                result = 'no_action';
                label = 'ระบบไม่รู้ว่าต้องทำอะไร';
                health -= 12;
                safe = false;
            }

            return {
                result,
                label,
                safe,
                waterWaste,
                health: Math.max(0, Math.min(100, health))
            };
        }

        function buildPlotError(plot, decision, outcome, expectedAction) {
            if (expectedAction && decision.action !== expectedAction) {
                return `${plot.name} ควรเป็น "${actionLabel(expectedAction)}" แต่ระบบเลือก "${actionLabel(decision.action)}" ลองตรวจว่ากฎแถวบน ๆ ครอบคลุมสถานการณ์นี้ก่อนหรือไม่`;
            }
            if (outcome.result === 'flood') {
                return `${plot.name} น้ำมากเกินไป เพราะระบบสั่งรดน้ำทั้งที่${plot.rain ? 'ฝนตกอยู่' : 'ดินชื้นแล้ว'} ลองตรวจฝนหรือความชื้นก่อนสั่งรดน้ำ`;
            }
            if (outcome.result === 'dry') {
                return `${plot.name} ยังขาดน้ำ เพราะระบบไม่ได้รดน้ำเมื่อดินแห้งและไม่มีฝน`;
            }
            if (outcome.result === 'no_water') {
                return `${plot.name} ถังน้ำหมด แต่ระบบยังพยายามรดน้ำ ลองตรวจถังน้ำก่อนเงื่อนไขอื่น`;
            }
            if (outcome.result === 'unnecessary_refill') {
                return `${plot.name} ถังน้ำยังพร้อม จึงไม่ควรแจ้งเติมน้ำในกรณีนี้`;
            }
            return `${plot.name} ยังไม่ผ่าน ลองดูรายงานผลแล้วปรับกฎอีกครั้ง`;
        }

        function finishGame(simulation) {
            state.ended = true;
            const duration = Math.max(1, Math.floor((Date.now() - state.startedAt) / 1000));
            const stars = calculateIrrigationStars(simulation);
            showFeedback('กฎของคุณครอบคลุมทุกสถานการณ์แล้ว ระบบดูแลฟาร์มได้สำเร็จ', 'success', simulation.logs);
            const overlay = document.createElement('div');
            overlay.className = 'irrigation-finish';
            overlay.innerHTML = `
                <div class="finish-card">
                    <h3>ภารกิจสำเร็จ!</h3>
                    <p>คุณสร้างกฎ If-Then-Else ให้เครื่องรดน้ำตัดสินใจได้ถูกต้อง</p>
                    <div class="finish-stars">${'⭐'.repeat(stars)}</div>
                    <p>ใช้เวลา ${duration} วินาที | ทดสอบ ${state.attempts} ครั้ง</p>
                    <p class="text-secondary small">กำลังบันทึกคะแนน...</p>
                </div>
            `;
            document.body.appendChild(overlay);
            window.setTimeout(() => {
                if (typeof window.sendResult === 'function') {
                    window.sendResult(window.STAGE_ID, stars, duration, state.attempts);
                }
            }, 1700);
        }

        function calculateIrrigationStars(simulation) {
            if (state.hints === 0 && state.attempts <= 2 && state.mistakes === 0 && simulation.waterWaste === 0) return 3;
            if (state.attempts <= 4 && state.mistakes <= 2 && state.hints <= 1) return 2;
            return 1;
        }

        function showFeedback(message, type = 'info', logs = []) {
            const panel = container.querySelector('#irrigation-feedback');
            panel.className = `feedback-panel ${type === 'success' ? 'success' : type === 'error' ? 'error' : ''}`;
            panel.innerHTML = `
                <div class="feedback-title">${type === 'success' ? 'ผลการทดสอบ' : type === 'error' ? 'ลองปรับกฎอีกครั้ง' : 'คำแนะนำ'}</div>
                <div class="feedback-body">
                    ${escapeHtml(message)}
                    ${logs.length ? `<ol class="run-log">${logs.map((log) => `<li>${escapeHtml(log)}</li>`).join('')}</ol>` : ''}
                </div>
            `;
        }

        function conditionLabel(value) {
            if (value === 'else') return 'กรณีอื่น ๆ';
            return conditionMap[value]?.label || value || 'ยังไม่เลือก';
        }

        function actionLabel(value) {
            if (value === 'no_action') return 'ไม่ทำอะไร';
            return actionMap[value]?.label || value || 'ยังไม่เลือก';
        }

        function describePlot(plot) {
            return [
                plot.soil === 'dry' ? 'ดินแห้ง' : 'ดินชื้น',
                plot.rain ? 'ฝนตก' : 'ไม่มีฝน',
                plot.tank === 'empty' ? 'ถังน้ำหมด' : 'ถังน้ำพร้อม'
            ].join(', ');
        }

        function plotIcon(plot, result) {
            if (result?.result === 'flood') return '🌊';
            if (result?.result === 'dry' || result?.result === 'no_water') return '🥀';
            if (result?.result === 'refill_needed') return '🚨';
            if (result?.result === 'healthy') return '🌱';
            if (plot.rain) return '⛈️';
            if (plot.soil === 'dry') return '🌾';
            return '🥬';
        }

        function escapeHtml(value) {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    }

    function initDebug(gameConfig) {
        class DebugScene extends Phaser.Scene {
            constructor() {
                super({ key: 'DebugScene' });
                this.state = {
                    startedAt: Date.now(),
                    attempts: 0,
                    mistakes: 0,
                    hintUsed: false,
                    ended: false
                };
                this.rows = gameConfig.rows.map((row) => ({ ...row }));
            }

            preload() {
                preloadCommon(this);
            }

            create() {
                this.add.image(400, 300, 'bg_farm').setDisplaySize(WIDTH, HEIGHT).setAlpha(0.48);
                drawCommonHeader(this, gameConfig.title, gameConfig.subtitle, this.state);
                this.cardLayer = this.add.container(0, 0);
                this.drawCrisisScene();
                this.renderCards();
                this.drawControls();
                showToast(this, gameConfig.problem, 'warning');
            }

            drawCrisisScene() {
                addPanel(this, 215, 308, 350, 390, 0xfffbeb, 0.96);
                this.add.text(215, 128, 'สถานการณ์วิกฤต', {
                    fontFamily: 'Kanit',
                    fontSize: '21px',
                    color: '#92400e',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                this.add.text(215, 185, '⚠️', { fontSize: '60px' }).setOrigin(0.5);
                this.add.text(215, 250, gameConfig.problem, {
                    fontFamily: 'Kanit',
                    fontSize: '18px',
                    color: '#1f2937',
                    align: 'center',
                    wordWrap: { width: 295 }
                }).setOrigin(0.5);
                this.add.text(160, 350, '🔧', { fontSize: '54px' }).setOrigin(0.5);
                this.add.text(235, 350, '🐞', { fontSize: '54px' }).setOrigin(0.5);
                this.add.text(215, 426, 'ลากการ์ดเพื่อสลับลำดับ\nหรือกด “เปลี่ยน” เพื่อแก้คำสั่ง', {
                    fontFamily: 'Kanit',
                    fontSize: '17px',
                    color: '#64748b',
                    align: 'center'
                }).setOrigin(0.5);
            }

            renderCards() {
                this.cardLayer.removeAll(true);
                this.cardLayer.add(addPanel(this, 580, 308, 390, 390, 0xffffff, 0.96));
                this.cardLayer.add(this.add.text(430, 122, 'แผงคำสั่งที่ต้อง Debug', {
                    fontFamily: 'Kanit',
                    fontSize: '21px',
                    color: '#1f2937',
                    fontStyle: 'bold'
                }));

                this.rows.forEach((row, index) => {
                    const y = 168 + index * 60;
                    const card = this.add.container(580, y);
                    const rect = this.add.rectangle(0, 0, 310, 48, 0xfef3c7, 1)
                        .setStrokeStyle(2, 0xf59e0b, 1);
                    const label = this.add.text(-142, 0, `${index + 1}. ${this.displayValue(row)}`, {
                        fontFamily: 'Kanit',
                        fontSize: '17px',
                        color: '#1f2937',
                        fontStyle: 'bold'
                    }).setOrigin(0, 0.5);
                    card.add([rect, label]);
                    card.setSize(310, 48).setInteractive({ draggable: true, useHandCursor: true });
                    card.setData('index', index);
                    this.input.setDraggable(card);
                    this.cardLayer.add(card);

                    if (row.options) {
                        const btn = addButton(this, 725, y, 78, 34, 'เปลี่ยน', 0xd97706, () => this.cycleOption(index));
                        this.cardLayer.add(btn);
                    }
                });

                this.input.off('drag');
                this.input.off('dragend');
                this.input.on('drag', (pointer, obj, dragX, dragY) => {
                    if (typeof obj.getData('index') === 'undefined') return;
                    obj.y = dragY;
                });
                this.input.on('dragend', (pointer, obj) => {
                    if (typeof obj.getData('index') === 'undefined') return;
                    const from = obj.getData('index');
                    const to = Phaser.Math.Clamp(Math.round((obj.y - 168) / 60), 0, this.rows.length - 1);
                    const item = this.rows.splice(from, 1)[0];
                    this.rows.splice(to, 0, item);
                    this.renderCards();
                });
            }

            displayValue(row) {
                if (!row.options) return row.value;
                const found = row.options.find((option) => option.value === row.value);
                return found ? found.label : row.value;
            }

            cycleOption(index) {
                const row = this.rows[index];
                if (!row.options) return;
                const current = row.options.findIndex((option) => option.value === row.value);
                row.value = row.options[(current + 1) % row.options.length].value;
                this.renderCards();
            }

            drawControls() {
                addButton(this, 420, 532, 122, 44, 'รันระบบเดิม', 0x64748b, () => {
                    playSound(this, 'wrong');
                    this.cameras.main.shake(160, 0.004);
                    showToast(this, gameConfig.feedback, 'warning');
                });
                addButton(this, 555, 532, 92, 44, 'คำใบ้', 0x475569, () => {
                    this.state.hintUsed = true;
                    showToast(this, gameConfig.hint, 'info');
                });
                addButton(this, 690, 532, 180, 44, 'ทดสอบหลังแก้', 0xd97706, () => this.checkDebug());
            }

            checkDebug() {
                this.state.attempts++;
                updateAttemptText(this.state);
                const values = this.rows.map((row) => row.value);
                const correct = values.length === gameConfig.solution.length && values.every((value, index) => value === gameConfig.solution[index]);
                if (correct) {
                    playSound(this, 'correct');
                    this.add.text(215, 185, '✅', { fontSize: '68px' }).setOrigin(0.5);
                    endGame(this, this.state, 'คุณค้นพบบั๊กและแก้ไขระบบฟาร์มได้สำเร็จ');
                } else {
                    this.state.mistakes++;
                    updateAttemptText(this.state);
                    playSound(this, 'wrong');
                    this.cameras.main.shake(180, 0.006);
                    showToast(this, gameConfig.feedback, 'error');
                }
            }
        }

        createGame(DebugScene);
    }

    window.FarmMissions = {
        sequence: initSequence,
        condition: initCondition,
        irrigationBuilder: initIrrigationBuilder,
        conditionSimulator: initIrrigationBuilder,
        debug: initDebug
    };
})();
