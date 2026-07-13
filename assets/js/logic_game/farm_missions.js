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

        const container = document.getElementById('game-container');
        if (!container) return null;
        if (container) container.innerHTML = '';
        container.innerHTML = `
            <div class="farm-missions-game sequence-shell">
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


    function initIrrigationBuilder(gameConfig) {

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
        let eventRoot = null;

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
                <div class="farm-missions-game irrigation-shell">
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


    function initWaterHero(gameConfig) {

        const container = document.getElementById('game-container');
        if (!container) return;

        const conditionCards = gameConfig.cards?.conditions || gameConfig.conditions || [];
        const actionCards = gameConfig.cards?.actions || gameConfig.actions || [];
        const conditionMap = Object.fromEntries(conditionCards.map((item) => [item.value, item]));
        const actionMap = Object.fromEntries(actionCards.map((item) => [item.value, item]));
        const rows = (gameConfig.ruleSlots || buildRuleSlots(gameConfig.expectedPriority || gameConfig.solutionPriority || [])).map((row, index) => ({
            ...row,
            label: row.label || (index === 0 ? 'ถ้า' : row.type === 'else' ? 'มิฉะนั้น' : 'มิฉะนั้นถ้า')
        }));
        const waves = gameConfig.waves?.length
            ? gameConfig.waves
            : [{ name: gameConfig.waveName || 'Wave 1', plots: gameConfig.plots || [] }];
        const expectedPriority = gameConfig.expectedPriority || gameConfig.solutionPriority || [];
        const state = {
            startedAt: Date.now(),
            attempts: 0,
            mistakes: 0,
            hints: 0,
            selected: null,
            history: [],
            waveIndex: 0,
            gardenHp: gameConfig.gardenHp || 100,
            bossHp: gameConfig.bossHp || (gameConfig.mode === 'boss' ? 100 : 0),
            tankWater: gameConfig.tankWater ?? 100,
            waterWaste: 0,
            combo: 0,
            ended: false,
            rules: rows.map((row) => ({
                condition: row.type === 'else' || row.fixedCondition === 'else' ? 'else' : null,
                action: null
            })),
            results: null
        };

        renderShell();
        bindEvents();
        renderAll();
        showFeedback('info', 'ภารกิจเริ่มแล้ว', 'เก็บการ์ดเงื่อนไขและคำสั่ง แล้วติดตั้งกฎในตู้ควบคุมก่อนเริ่ม Wave');

        function buildRuleSlots(priority) {
            const source = priority.length ? priority : ['soil_dry', 'else'];
            return source.map((condition, index) => ({
                type: condition === 'else' ? 'else' : index === 0 ? 'if' : 'else_if'
            }));
        }

        function renderShell() {
            container.innerHTML = `
                <div class="farm-missions-game water-hero-shell">
                    <div class="water-top">
                        <div>
                            <h3 class="water-title">${escapeHtml(gameConfig.title)}</h3>
                            <p class="water-subtitle">${escapeHtml(gameConfig.subtitle)}</p>
                        </div>
                        <div class="water-stats">
                            <span class="water-stat" id="water-wave">Wave 1/${waves.length}</span>
                            <span class="water-stat" id="water-attempts">ลอง 0</span>
                            <span class="water-stat" id="water-mistakes">พลาด 0</span>
                            <span class="water-stat" id="water-combo">Combo 0</span>
                        </div>
                    </div>

                    <div class="water-bars">
                        <div class="water-meter">
                            <div class="meter-label"><span>HP สวน</span><span id="garden-hp-label">100%</span></div>
                            <div class="meter-track"><span class="meter-fill" id="garden-hp-fill"></span></div>
                        </div>
                        <div class="water-meter">
                            <div class="meter-label"><span>น้ำในถัง</span><span id="tank-water-label">100%</span></div>
                            <div class="meter-track"><span class="meter-fill tank" id="tank-water-fill"></span></div>
                        </div>
                        <div class="water-meter" id="boss-meter">
                            <div class="meter-label"><span>HP บอส</span><span id="boss-hp-label">100%</span></div>
                            <div class="meter-track"><span class="meter-fill boss" id="boss-hp-fill"></span></div>
                        </div>
                    </div>

                    <div class="water-layout">
                        <section class="water-panel water-field">
                            <div id="threat-sky" class="threat-sky"></div>
                            <div id="water-boss" class="water-boss">☁️ บอสเมฆดำ</div>
                            <div id="water-plots" class="water-plots"></div>
                            <div class="water-hero-avatar" title="น้องหยดน้ำ">💧</div>
                            <div id="field-card-tray" class="water-card-tray"></div>
                        </section>

                        <section class="water-panel">
                            <h4 class="water-panel-title">
                                <span>ตู้ควบคุมระบบน้ำ</span>
                                <span class="wave-name" id="wave-name">Wave</span>
                            </h4>
                            <div id="water-rules" class="water-rules"></div>
                            <div class="water-palette">
                                <div class="water-palette-group">
                                    <div class="water-palette-title">การ์ดเงื่อนไข</div>
                                    <div id="water-condition-blocks" class="water-blocks"></div>
                                </div>
                                <div class="water-palette-group">
                                    <div class="water-palette-title">การ์ดคำสั่ง</div>
                                    <div id="water-action-blocks" class="water-blocks"></div>
                                </div>
                            </div>
                            <div class="water-controls">
                                <button type="button" class="water-control" id="start-wave">เริ่ม Wave</button>
                                <button type="button" class="water-control secondary" id="water-hint">คำใบ้</button>
                                <button type="button" class="water-control warning" id="water-undo">ย้อนกลับ</button>
                                <button type="button" class="water-control danger" id="water-clear">ล้างกฎ</button>
                            </div>
                            <section id="water-feedback" class="water-feedback">
                                <strong>คำแนะนำ</strong>
                                <div>ติดตั้งกฎแล้วเริ่ม Wave เพื่อดูผลลัพธ์</div>
                            </section>
                        </section>
                    </div>
                </div>
            `;
            eventRoot = container.querySelector('.water-hero-shell');
        }

        function bindEvents() {
            container.querySelector('#start-wave').addEventListener('click', runWave);
            container.querySelector('#water-hint').addEventListener('click', () => {
                state.hints++;
                renderStats();
                showFeedback('info', 'คำใบ้จากครูโรบอท', gameConfig.hint || buildHint());
            });
            container.querySelector('#water-undo').addEventListener('click', undo);
            container.querySelector('#water-clear').addEventListener('click', clearRules);

            eventRoot.addEventListener('click', (event) => {
                const block = event.target.closest('.water-block');
                if (block) {
                    state.selected = { kind: block.dataset.kind, value: block.dataset.value };
                    renderBlocks();
                    showFeedback('info', 'เลือกการ์ดแล้ว', `แตะช่องในตู้ควบคุมเพื่อวาง "${block.textContent.trim()}"`);
                    return;
                }

                const slot = event.target.closest('.water-slot');
                if (!slot || slot.classList.contains('fixed')) return;
                if (!state.selected) {
                    const ruleIndex = Number(slot.dataset.ruleIndex);
                    const kind = slot.dataset.kind;
                    if (state.rules[ruleIndex][kind]) {
                        pushHistory();
                        state.rules[ruleIndex][kind] = null;
                        state.results = null;
                        renderAll();
                        showFeedback('info', 'นำการ์ดออกแล้ว', 'เลือกการ์ดใบใหม่จากถาดด้านล่างได้เลย');
                        return;
                    }
                    showFeedback('info', 'เลือกการ์ดก่อน', 'แตะการ์ดเงื่อนไขหรือคำสั่ง แล้วค่อยแตะช่องที่ต้องการวาง');
                    return;
                }
                applyToSlot(slot, state.selected);
            });

            eventRoot.addEventListener('dragstart', (event) => {
                const block = event.target.closest('.water-block');
                if (!block) return;
                const payload = { kind: block.dataset.kind, value: block.dataset.value };
                event.dataTransfer.setData('text/plain', JSON.stringify(payload));
                event.dataTransfer.effectAllowed = 'copy';
                state.selected = payload;
                renderBlocks();
            });
            eventRoot.addEventListener('dragover', (event) => {
                const slot = event.target.closest('.water-slot');
                if (!slot || slot.classList.contains('fixed')) return;
                event.preventDefault();
                slot.classList.add('target');
            });
            eventRoot.addEventListener('dragleave', (event) => {
                const slot = event.target.closest('.water-slot');
                if (slot) slot.classList.remove('target');
            });
            eventRoot.addEventListener('drop', (event) => {
                const slot = event.target.closest('.water-slot');
                if (!slot || slot.classList.contains('fixed')) return;
                event.preventDefault();
                slot.classList.remove('target');
                try {
                    applyToSlot(slot, JSON.parse(event.dataTransfer.getData('text/plain')));
                } catch (error) {
                    showFeedback('error', 'วางการ์ดไม่ได้', 'ลองเลือกการ์ดอีกครั้ง');
                }
            });
        }

        function applyToSlot(slot, payload) {
            const ruleIndex = Number(slot.dataset.ruleIndex);
            const kind = slot.dataset.kind;
            if (payload.kind !== kind) {
                showFeedback('error', 'ช่องไม่ตรงชนิดการ์ด', kind === 'condition'
                    ? 'ช่องนี้ต้องใช้การ์ดเงื่อนไข เช่น ฝนตก ดินแห้ง หรือถังน้ำหมด'
                    : 'ช่องนี้ต้องใช้การ์ดคำสั่ง เช่น รดน้ำ หยุดรดน้ำ หรือแจ้งเติมน้ำ');
                return;
            }
            pushHistory();
            state.rules[ruleIndex][kind] = payload.value;
            state.selected = null;
            state.results = null;
            renderAll();
        }

        function pushHistory() {
            state.history.push(JSON.stringify(state.rules));
            if (state.history.length > 20) state.history.shift();
        }

        function undo() {
            const previous = state.history.pop();
            if (!previous) {
                showFeedback('info', 'ยังย้อนกลับไม่ได้', 'ยังไม่มีการวางการ์ดก่อนหน้านี้');
                return;
            }
            state.rules = JSON.parse(previous);
            state.selected = null;
            state.results = null;
            renderAll();
        }

        function clearRules() {
            pushHistory();
            state.rules = rows.map((row) => ({
                condition: row.type === 'else' || row.fixedCondition === 'else' ? 'else' : null,
                action: null
            }));
            state.selected = null;
            state.results = null;
            renderAll();
            showFeedback('info', 'ล้างกฎแล้ว', 'เริ่มติดตั้งการ์ดใหม่ในตู้ควบคุมได้เลย');
        }

        function currentWave() {
            return waves[state.waveIndex] || waves[0];
        }

        function currentWavePlots() {
            return (currentWave().plots || currentWave().lanes || []).map((plot, index) => ({
                name: plot.name || `เลน ${plot.lane || plot.laneId || index + 1}`,
                lane: plot.lane || plot.laneId || index + 1,
                soil: plot.soil || 'wet',
                rain: Boolean(plot.rain),
                tank: plot.tank || (state.tankWater <= 0 ? 'empty' : 'ready'),
                hp: plot.hp ?? plot.health ?? plot.plantHp ?? 80,
                enemy: plot.enemy || plot.enemyType || null,
                expectedAction: plot.expectedAction,
                note: plot.note || ''
            }));
        }

        function renderAll() {
            renderStats();
            renderPlots();
            renderRules();
            renderBlocks();
            renderFieldCards();
        }

        function renderStats() {
            container.querySelector('#water-wave').textContent = `Wave ${state.waveIndex + 1}/${waves.length}`;
            container.querySelector('#water-attempts').textContent = `ลอง ${state.attempts}`;
            container.querySelector('#water-mistakes').textContent = `พลาด ${state.mistakes}`;
            container.querySelector('#water-combo').textContent = `Combo ${state.combo}`;
            container.querySelector('#garden-hp-label').textContent = `${Math.max(0, Math.round(state.gardenHp))}%`;
            container.querySelector('#garden-hp-fill').style.width = `${Math.max(0, Math.min(100, state.gardenHp))}%`;
            container.querySelector('#garden-hp-fill').style.background = state.gardenHp > 70 ? '#16a34a' : state.gardenHp > 40 ? '#f59e0b' : '#dc2626';
            container.querySelector('#tank-water-label').textContent = `${Math.max(0, Math.round(state.tankWater))}%`;
            container.querySelector('#tank-water-fill').style.width = `${Math.max(0, Math.min(100, state.tankWater))}%`;
            container.querySelector('#tank-water-fill').style.background = state.tankWater > 60 ? '#0284c7' : state.tankWater > 25 ? '#f59e0b' : '#dc2626';
            const bossMeter = container.querySelector('#boss-meter');
            const bossVisible = gameConfig.mode === 'boss';
            bossMeter.style.display = bossVisible ? 'block' : 'none';
            container.querySelector('#water-boss').classList.toggle('show', bossVisible);
            if (bossVisible) {
                container.querySelector('#boss-hp-label').textContent = `${Math.max(0, Math.round(state.bossHp))}%`;
                container.querySelector('#boss-hp-fill').style.width = `${Math.max(0, Math.min(100, state.bossHp))}%`;
            }
            container.querySelector('#wave-name').textContent = currentWave().name || `Wave ${state.waveIndex + 1}`;
            const sky = container.querySelector('#threat-sky');
            sky.className = `threat-sky ${gameConfig.mode === 'storm' || currentWave().mode === 'storm' ? 'storm' : gameConfig.mode === 'boss' ? 'boss' : ''}`;
        }

        function renderPlots() {
            const plots = currentWavePlots();
            const results = state.results || [];
            container.querySelector('#water-plots').innerHTML = plots.map((plot, index) => {
                const result = results[index];
                const health = result ? result.health : (plot.hp ?? plot.health ?? 80);
                const statusClass = result ? (result.safe ? ' good' : ' bad') : '';
                const actionClass = result?.action ? ` action-${result.action}` : '';
                const floodClass = result && (result.result === 'flood' || result.result === 'overwater') ? ' flooded' : '';
                const rainClass = plot.rain ? ' raining' : '';
                const plant = plotIcon(plot, result);
                const enemy = enemyIcon(plot);
                return `
                    <article class="water-plot${statusClass}${actionClass}${floodClass}${rainClass}">
                        <div class="lane-track"></div>
                        <div class="lane-rain"></div>
                        <div class="lane-flood"></div>
                        <div class="lane-bed">${plant}</div>
                        <div class="lane-sprinkler">🚿</div>
                        <div class="lane-spray"></div>
                        <div class="lane-enemy ${result ? '' : 'approach'}">${enemy}</div>
                        <div class="plot-line">
                            <span>${escapeHtml(plot.name)}</span>
                            <span class="plot-plant">${plant}</span>
                        </div>
                        <div class="plot-sensors">
                            <span>${plot.soil === 'dry' ? 'ดินแห้ง' : 'ดินชื้น'}</span>
                            <span>${plot.rain ? 'ฝนตก' : 'ไม่มีฝน'}</span>
                            <span>${plot.tank === 'empty' ? 'ถังน้ำหมด' : 'ถังน้ำพร้อม'}</span>
                        </div>
                        <div class="plot-health"><span style="width:${Math.max(4, Math.min(100, health))}%"></span></div>
                        <div class="plot-message">${escapeHtml(result ? result.message : (plot.note || 'รอระบบรดน้ำตัดสินใจ'))}</div>
                    </article>
                `;
            }).join('');
        }

        function renderRules() {
            container.querySelector('#water-rules').innerHTML = rows.map((row, index) => {
                const rule = state.rules[index];
                const fixed = row.type === 'else' || row.fixedCondition === 'else';
                return `
                    <div class="water-rule">
                        <div class="water-rule-label">${escapeHtml(row.label)}</div>
                        <div class="water-rule-slots">
                            <button type="button"
                                class="water-slot ${fixed ? 'fixed filled' : rule.condition ? 'filled' : ''}"
                                data-rule-index="${index}"
                                data-kind="condition">
                                ${escapeHtml(fixed ? 'กรณีอื่น ๆ' : rule.condition ? cardLabel(rule.condition, conditionMap) : 'วางเงื่อนไข')}
                            </button>
                            <button type="button"
                                class="water-slot ${rule.action ? 'filled' : ''}"
                                data-rule-index="${index}"
                                data-kind="action">
                                ${escapeHtml(rule.action ? cardLabel(rule.action, actionMap) : 'วางคำสั่ง')}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderBlocks() {
            container.querySelector('#water-condition-blocks').innerHTML = conditionCards.map((card) => blockHtml(card, 'condition')).join('');
            container.querySelector('#water-action-blocks').innerHTML = actionCards.map((card) => blockHtml(card, 'action')).join('');
        }

        function renderFieldCards() {
            const cards = [...conditionCards.slice(0, 3), ...actionCards.slice(0, 3)];
            container.querySelector('#field-card-tray').innerHTML = cards.map((card) => {
                const kind = conditionMap[card.value] ? 'condition' : 'action';
                return `<span class="field-chip ${kind}">${escapeHtml(card.icon || '')} ${escapeHtml(card.label)}</span>`;
            }).join('');
        }

        function blockHtml(card, kind) {
            const selected = state.selected?.kind === kind && state.selected?.value === card.value;
            return `
                <button type="button"
                    class="water-block ${kind}${selected ? ' selected' : ''}"
                    draggable="true"
                    data-kind="${kind}"
                    data-value="${escapeHtml(card.value)}">
                    ${escapeHtml(card.icon || '')} ${escapeHtml(card.label)}
                </button>
            `;
        }

        function validateRules() {
            for (let i = 0; i < state.rules.length; i++) {
                const row = rows[i];
                const rule = state.rules[i];
                if (!(row.type === 'else' || row.fixedCondition === 'else') && !rule.condition) {
                    return `กฎแถวที่ ${i + 1} ยังไม่มีเงื่อนไข`;
                }
                if (!rule.action) {
                    return `กฎแถวที่ ${i + 1} ยังไม่มีคำสั่ง`;
                }
            }
            return '';
        }

        function runWave() {
            if (state.ended) return;
            const validation = validateRules();
            if (validation) {
                showFeedback('error', 'ตู้ควบคุมยังไม่ครบ', `${validation} ระบบจึงยังเริ่ม Wave ไม่ได้`);
                return;
            }

            state.attempts++;
            const simulation = simulateWave();
            state.results = simulation.results;
            state.waterWaste += simulation.waterWaste;
            state.tankWater = Math.max(0, Math.min(100, state.tankWater + simulation.waterChange));
            if (simulation.passed) {
                state.combo += simulation.results.length;
                if (gameConfig.mode === 'boss') {
                    const bossDamage = Math.ceil((gameConfig.bossHp || 100) / waves.length);
                    state.bossHp = Math.max(0, state.bossHp - bossDamage);
                }
                renderAll();
                if (state.waveIndex < waves.length - 1 && state.gardenHp > 0) {
                    showFeedback('success', simulation.praise || 'Water Save!', `Wave นี้ผ่านแล้ว ${gameConfig.mode === 'boss' ? 'สวนปล่อยพลังหยดน้ำโจมตีบอส' : 'สวนยังปลอดภัย'} เตรียม Wave ถัดไป`, simulation.logs);
                    state.waveIndex++;
                    state.results = null;
                    window.setTimeout(() => {
                        if (!state.ended) {
                            renderAll();
                            showFeedback('info', 'Wave ใหม่มาแล้ว', 'ตรวจสถานการณ์บนแปลง แล้วปรับกฎได้ก่อนเริ่ม Wave ถัดไป');
                        }
                    }, 1400);
                    return;
                }
                if (gameConfig.mode !== 'boss' || state.bossHp <= 0) {
                    finishGame(simulation);
                    return;
                }
                showFeedback('success', 'โจมตีบอสสำเร็จ', 'กฎถูกต้องแล้ว เริ่ม Wave อีกครั้งเพื่อกำจัดบอสให้หมด HP', simulation.logs);
            } else {
                state.mistakes++;
                state.combo = 0;
                state.gardenHp = Math.max(0, state.gardenHp - simulation.damage);
                renderAll();
                if (state.gardenHp <= 0) {
                    showFeedback('error', 'สวนพังแล้ว', 'HP สวนหมด ล้างกฎหรือย้อนกลับแล้วลองจัดลำดับเงื่อนไขใหม่');
                    return;
                }
                showFeedback('error', 'Wave ยังไม่ผ่าน', simulation.feedback, simulation.logs);
            }
        }

        function simulateWave() {
            const rules = state.rules.map((rule) => ({ ...rule }));
            const logs = [];
            const errors = [];
            let waterWaste = 0;
            let waterChange = 0;
            let damage = 0;
            const priorityIssue = checkPriority(rules);
            const results = currentWavePlots().map((plot) => {
                const decision = evaluateRules(plot, rules);
                const outcome = applyAction(plot, decision.action);
                waterWaste += outcome.waterWaste;
                waterChange += outcome.waterChange || 0;
                if (!outcome.safe) damage += Math.abs(outcome.hpChange || 12);
                const expected = plot.expectedAction;
                const ok = expected ? decision.action === expected && outcome.safe : outcome.safe;
                logs.push(`${plot.name}: ${describePlot(plot)} → ${cardLabel(decision.action, actionMap)} → ${outcome.label}`);
                if (!ok) {
                    errors.push(buildError(plot, decision, outcome, expected));
                }
                return {
                    ...outcome,
                    action: decision.action,
                    health: Math.max(0, Math.min(100, (plot.hp ?? plot.health ?? 80) + outcome.hpChange)),
                    message: outcome.label
                };
            });
            if (priorityIssue) errors.unshift(priorityIssue);
            return {
                results,
                logs,
                waterWaste,
                waterChange,
                damage: Math.max(12, damage),
                passed: errors.length === 0,
                feedback: errors[0] || 'ลองตรวจผลลัพธ์แต่ละแปลง แล้วปรับกฎอีกครั้ง',
                praise: gameConfig.mode === 'storm' ? 'Storm Guard!' : gameConfig.mode === 'boss' ? 'Boss Hit!' : 'Water Save!'
            };
        }

        function checkPriority(rules) {
            if (!expectedPriority.length) return '';
            const actual = rules.map((rule) => rule.condition);
            for (let i = 0; i < expectedPriority.length; i++) {
                if (actual[i] !== expectedPriority[i]) {
                    if (expectedPriority[i] === 'rain') {
                        return 'ระบบควรตรวจฝนตกก่อนดินแห้ง เพื่อไม่ให้รดน้ำซ้ำตอนฝนกำลังตก';
                    }
                    if (expectedPriority[i] === 'tank_empty') {
                        return 'ถังน้ำหมดควรถูกตรวจเป็นเงื่อนไขแรก ก่อนระบบพยายามรดน้ำ';
                    }
                    return `ลำดับเงื่อนไขยังไม่ถูกต้อง ลองวาง "${cardLabel(expectedPriority[i], conditionMap)}" ในแถวที่ ${i + 1}`;
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
            let result = 'safe';
            let label = 'ปลอดภัย';
            let safe = true;
            let hpChange = 5;
            let waterWaste = 0;
            let waterChange = 0;

            if (action === 'water') {
                if (plot.tank === 'empty') {
                    result = 'no_water';
                    label = 'ถังน้ำหมด แต่ระบบยังพยายามรดน้ำ';
                    safe = false;
                    hpChange = -18;
                } else if (plot.rain) {
                    result = 'flood';
                    label = 'ฝนตกอยู่แล้ว แต่ระบบยังรดน้ำเพิ่มจนเสี่ยงน้ำท่วม';
                    safe = false;
                    hpChange = -25;
                    waterWaste = 1;
                    waterChange = -10;
                } else if (plot.soil === 'wet') {
                    result = 'overwater';
                    label = 'ดินชื้นแล้ว แต่ระบบยังรดน้ำเพิ่ม';
                    safe = false;
                    hpChange = -15;
                    waterWaste = 1;
                    waterChange = -10;
                } else {
                    result = 'healthy';
                    label = 'ดินแห้งได้รับน้ำ พืชฟื้นแล้ว';
                    hpChange = 22;
                    waterChange = -10;
                }
            } else if (action === 'stop') {
                if (plot.soil === 'dry' && !plot.rain) {
                    result = 'dry';
                    label = 'ดินแห้งแต่ระบบหยุดรดน้ำ พืชจึงเหี่ยวลง';
                    safe = false;
                    hpChange = -20;
                } else {
                    result = 'safe';
                    label = 'หยุดรดน้ำได้เหมาะสม';
                    hpChange = 6;
                }
            } else if (action === 'refill') {
                if (plot.tank === 'empty') {
                    result = 'refill';
                    label = 'ระบบแจ้งเติมน้ำได้ถูกต้อง';
                    hpChange = 8;
                    waterChange = 30;
                } else {
                    result = 'unneeded_refill';
                    label = 'ถังน้ำยังไม่หมด แต่ระบบแจ้งเติมน้ำ';
                    safe = false;
                    hpChange = -6;
                }
            } else if (action === 'observe') {
                if (plot.soil === 'wet' && !plot.rain && plot.tank !== 'empty') {
                    result = 'observe';
                    label = 'สถานการณ์ปลอดภัย ระบบสังเกตต่อได้';
                    hpChange = 6;
                } else {
                    result = 'miss';
                    label = 'ระบบสังเกตต่อ ทั้งที่ควรตัดสินใจทำอย่างอื่น';
                    safe = false;
                    hpChange = -12;
                }
            } else {
                result = 'no_action';
                label = 'ระบบไม่รู้ว่าต้องทำอะไร';
                safe = false;
                hpChange = -12;
            }

            return { result, label, safe, hpChange, waterWaste, waterChange };
        }

        function buildError(plot, decision, outcome, expected) {
            if (expected && decision.action !== expected) {
                return `${plot.name} ควรเป็น "${cardLabel(expected, actionMap)}" แต่ระบบเลือก "${cardLabel(decision.action, actionMap)}" ลองดูว่าเงื่อนไขแถวบนครอบคลุมสถานการณ์นี้ก่อนหรือไม่`;
            }
            if (outcome.result === 'flood' || outcome.result === 'overwater') {
                return `${plot.name} น้ำมากเกินไป เพราะระบบรดน้ำทั้งที่${plot.rain ? 'ฝนกำลังตก' : 'ดินชื้นแล้ว'} ลองตรวจฝนหรือดินชื้นก่อนสั่งรดน้ำ`;
            }
            if (outcome.result === 'dry') {
                return `${plot.name} ดินแห้งแต่ระบบไม่ได้รดน้ำ ลองตั้งกฎว่า ถ้าดินแห้ง แล้ว รดน้ำ`;
            }
            if (outcome.result === 'no_water') {
                return `${plot.name} ถังน้ำหมดแล้ว แต่ระบบยังพยายามรดน้ำ ลองตรวจถังน้ำหมดเป็นเงื่อนไขแรก`;
            }
            if (outcome.result === 'unneeded_refill') {
                return `${plot.name} ถังน้ำยังพร้อม จึงไม่ควรแจ้งเติมน้ำในกรณีนี้`;
            }
            return `${plot.name} ยังไม่ปลอดภัย ลองตรวจเงื่อนไขและคำสั่งอีกครั้ง`;
        }

        function finishGame(simulation) {
            state.ended = true;
            const duration = Math.max(1, Math.floor((Date.now() - state.startedAt) / 1000));
            const stars = calculateStars(duration);
            const badge = gameConfig.badge || 'ฮีโร่หยดน้ำ';
            showFeedback('success', 'ภารกิจสำเร็จ!', 'ระบบของคุณใช้ If-Then-Else ป้องกันสวนได้ครบทุกสถานการณ์', simulation.logs);
            const overlay = document.createElement('div');
            overlay.className = 'water-finish';
            overlay.innerHTML = `
                <div class="water-finish-card">
                    <h3>ภารกิจสำเร็จ!</h3>
                    <p>${escapeHtml(gameConfig.winMessage || 'คุณสร้างระบบรดน้ำอัจฉริยะได้สำเร็จ')}</p>
                    <div class="water-stars">${'⭐'.repeat(stars)}</div>
                    <p><strong>Badge:</strong> ${escapeHtml(badge)}</p>
                    <p>ใช้เวลา ${duration} วินาที | เริ่ม Wave ${state.attempts} ครั้ง | พลาด ${state.mistakes} ครั้ง</p>
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

        function calculateStars(duration) {
            const timeLimit = gameConfig.timeLimit || 60;
            if (state.hints === 0 && state.gardenHp >= 85 && state.mistakes <= 1 && state.waterWaste === 0 && duration <= timeLimit) return 3;
            if (state.gardenHp >= 60 && state.mistakes <= 3 && state.hints <= 1) return 2;
            return 1;
        }

        function showFeedback(type, title, message, logs = []) {
            const panel = container.querySelector('#water-feedback');
            panel.className = `water-feedback ${type === 'success' ? 'success' : type === 'error' ? 'error' : ''}`;
            panel.innerHTML = `
                <strong>${escapeHtml(title)}</strong>
                <div>${escapeHtml(message)}</div>
                ${logs.length ? `<ol class="water-log">${logs.map((log) => `<li>${escapeHtml(log)}</li>`).join('')}</ol>` : ''}
            `;
        }

        function buildHint() {
            if (!expectedPriority.length) return 'อ่านข้อมูลเซ็นเซอร์ แล้วเลือกเงื่อนไขที่ควรตรวจเป็นอันดับแรก';
            return `ลองเรียงกฎเป็น ${expectedPriority.map((item) => cardLabel(item, conditionMap)).join(' → ')}`;
        }

        function cardLabel(value, map) {
            if (value === 'else') return 'กรณีอื่น ๆ';
            if (value === 'no_action') return 'ไม่ทำอะไร';
            const card = map[value];
            return card ? `${card.icon ? `${card.icon} ` : ''}${card.label}` : (value || 'ยังไม่เลือก');
        }

        function describePlot(plot) {
            return [
                plot.soil === 'dry' ? 'ดินแห้ง' : 'ดินชื้น',
                plot.rain ? 'ฝนตก' : 'ไม่มีฝน',
                plot.tank === 'empty' ? 'ถังน้ำหมด' : 'ถังน้ำพร้อม'
            ].join(', ');
        }

        function plotIcon(plot, result) {
            if (result?.result === 'flood' || result?.result === 'overwater') return '🌊';
            if (result?.result === 'dry' || result?.result === 'no_water') return '🥀';
            if (result?.result === 'refill') return '🚨';
            if (result?.result === 'healthy') return '🌱';
            if (plot.tank === 'empty') return '🪣';
            if (plot.rain) return '⛈️';
            if (plot.soil === 'dry') return '🌾';
            return '🥬';
        }

        function enemyIcon(plot) {
            const enemy = plot.enemy || plot.enemyType || (plot.rain ? 'rainCloud' : plot.soil === 'dry' ? 'sun' : null);
            if (enemy === 'sun') return '☀️';
            if (enemy === 'rainCloud') return '⛈️';
            if (enemy === 'leakingTank') return '🪣';
            if (enemy === 'worm') return '〰️';
            if (enemy === 'boss') return '🌩️';
            return '🌤️';
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


    function initAgriDroneRescue(gameConfig) {

        const container = document.getElementById('game-container');
        if (!container) return;

        const conditionCards = gameConfig.cards?.conditions || [];
        const actionCards = gameConfig.cards?.actions || [];
        const conditionMap = Object.fromEntries(conditionCards.map((item) => [item.value, item]));
        const actionMap = Object.fromEntries(actionCards.map((item) => [item.value, item]));
        const resourceCatalog = gameConfig.resources || [
            { value: 'water', label: 'น้ำ', icon: '💧', weight: 2 },
            { value: 'fertilizer', label: 'ปุ๋ย', icon: '🌿', weight: 2 },
            { value: 'pesticide', label: 'น้ำยา', icon: '✨', weight: 1 },
            { value: 'basket', label: 'ตะกร้า', icon: '🧺', weight: 2, capacity: 3 }
        ];
        const resourceMap = Object.fromEntries(resourceCatalog.map((item) => [item.value, item]));
        const rows = (gameConfig.ruleSlots || buildRuleSlots(gameConfig.expectedPriority || [])).map((row, index) => ({
            ...row,
            label: row.label || (index === 0 ? 'ถ้า' : row.type === 'else' ? 'มิฉะนั้น' : 'มิฉะนั้นถ้า')
        }));
        const waves = gameConfig.waves?.length ? gameConfig.waves : [{ name: 'ภารกิจหลัก', plots: gameConfig.plots || [] }];
        const expectedPriority = gameConfig.expectedPriority || [];
        const basePosition = gameConfig.basePosition || { x: 86, y: 78 };
        const state = {
            startedAt: Date.now(),
            attempts: 0,
            mistakes: 0,
            hints: 0,
            combo: 0,
            waveIndex: 0,
            farmHp: gameConfig.farmHp || gameConfig.gardenHp || 100,
            droneBattery: gameConfig.droneBattery ?? 100,
            droneWater: gameConfig.droneWater ?? 100,
            droneResources: {},
            loadout: [],
            harvestedCount: 0,
            pestCleared: 0,
            wrongActions: 0,
            selected: null,
            running: false,
            ended: false,
            history: [],
            rules: rows.map((row) => ({
                condition: row.type === 'else' || row.fixedCondition === 'else' ? 'else' : null,
                action: null
            })),
            results: {}
        };
        state.loadout = normalizeLoadout(currentWave().defaultLoadout || gameConfig.defaultLoadout || ['water', 'water']);
        state.droneResources = loadoutCounts(state.loadout);
        let eventRoot = null;

        renderShell();
        bindEvents();
        renderAll();
        moveDroneTo(basePosition, false);
        showFeedback('info', 'รับภารกิจ', gameConfig.briefing || 'ตั้งสมองโดรนด้วยการ์ดเงื่อนไขและคำสั่ง แล้วปล่อยโดรนออกไปช่วยฟาร์ม');

        function buildRuleSlots(priority) {
            const source = priority.length ? priority : ['soil_dry', 'else'];
            return source.map((condition, index) => ({
                type: condition === 'else' ? 'else' : index === 0 ? 'if' : 'else_if'
            }));
        }

        function renderShell() {
            container.innerHTML = `
                <div class="farm-missions-game agri-shell">
                    <div class="agri-top">
                        <div>
                            <h3 class="agri-title">${escapeHtml(gameConfig.title)}</h3>
                            <p class="agri-subtitle">${escapeHtml(gameConfig.subtitle)}</p>
                        </div>
                        <div class="agri-stats">
                            <span class="agri-stat" id="agri-wave">Wave 1/${waves.length}</span>
                            <span class="agri-stat" id="agri-attempts">ลอง 0</span>
                            <span class="agri-stat" id="agri-mistakes">พลาด 0</span>
                            <span class="agri-stat" id="agri-combo">Combo 0</span>
                        </div>
                    </div>

                    <div class="agri-meters">
                        <div class="agri-meter">
                            <div class="agri-meter-label"><span>HP ฟาร์ม</span><span id="agri-hp-label">100%</span></div>
                            <div class="agri-meter-track"><span class="agri-meter-fill" id="agri-hp-fill"></span></div>
                        </div>
                        <div class="agri-meter">
                            <div class="agri-meter-label"><span>แบตโดรน</span><span id="agri-battery-label">100%</span></div>
                            <div class="agri-meter-track"><span class="agri-meter-fill" id="agri-battery-fill"></span></div>
                        </div>
                        <div class="agri-meter">
                            <div class="agri-meter-label"><span>น้ำในถัง</span><span id="agri-water-label">100%</span></div>
                            <div class="agri-meter-track"><span class="agri-meter-fill" id="agri-water-fill"></span></div>
                        </div>
                        <div class="agri-meter">
                            <div class="agri-meter-label"><span>ผลผลิต</span><span id="agri-harvest-label">0</span></div>
                            <div class="agri-meter-track"><span class="agri-meter-fill" id="agri-harvest-fill"></span></div>
                        </div>
                    </div>

                    <div class="agri-layout">
                        <section class="agri-map agri-panel">
                            <div class="agri-brief">
                                <div>
                                    <strong id="agri-brief-title">${escapeHtml(currentWave().name || 'ภารกิจโดรน')}</strong>
                                    <span id="agri-brief-text">${escapeHtml(currentWave().brief || gameConfig.briefing || '')}</span>
                                </div>
                                <div class="agri-wave-name" id="agri-wave-name">Wave 1</div>
                            </div>
                            <div id="agri-plots" class="agri-plots"></div>
                            <div class="agri-base">🏠</div>
                            <div id="agri-drone" class="agri-drone" aria-label="โดรนเกษตร">🚁</div>
                        </section>

                        <section class="agri-panel">
                            <h4 class="agri-panel-title">
                                <span>สมองโดรน If / Else If / Else</span>
                                <span>🧠</span>
                            </h4>
                            <div id="agri-rules" class="agri-rules"></div>
                            <div class="agri-palette">
                                <section class="agri-card-group">
                                    <div class="agri-card-title">1. คลังบล็อกเงื่อนไข</div>
                                    <div id="agri-condition-cards" class="agri-card-list"></div>
                                </section>
                                <section class="agri-card-group">
                                    <div class="agri-card-title">2. คลังบล็อกคำสั่ง</div>
                                    <div id="agri-action-cards" class="agri-card-list"></div>
                                </section>
                                <section class="agri-card-group">
                                    <div class="agri-card-title">3. ช่องบรรทุกโดรน</div>
                                    <div class="agri-loadout">
                                        <div class="agri-loadout-head">
                                            <span id="agri-loadout-weight">น้ำหนัก 0/6</span>
                                            <span id="agri-loadout-effect">แบต -5/ช่อง</span>
                                        </div>
                                        <div id="agri-loadout-slots" class="agri-loadout-slots"></div>
                                        <div id="agri-resource-cards" class="agri-resource-list"></div>
                                        <div id="agri-resource-status" class="agri-resource-status"></div>
                                    </div>
                                </section>
                                <section class="agri-card-group">
                                    <div class="agri-card-title">4. แผงควบคุมเกม</div>
                                    <div class="agri-controls">
                                        <button type="button" class="agri-control" id="agri-run">ปล่อยโดรน!</button>
                                        <button type="button" class="agri-control secondary" id="agri-hint">คำใบ้</button>
                                        <button type="button" class="agri-control warning" id="agri-undo">ย้อนกลับ</button>
                                        <button type="button" class="agri-control danger" id="agri-clear">ล้างกฎ</button>
                                    </div>
                                </section>
                            </div>
                            <section id="agri-feedback" class="agri-feedback">
                                <strong>คำแนะนำ</strong>
                                <div>เลือกการ์ด แล้วแตะช่องเพื่อวางกฎให้โดรน</div>
                            </section>
                        </section>
                    </div>
                </div>
            `;
            eventRoot = container.querySelector('.agri-shell');
        }

        function bindEvents() {
            container.querySelector('#agri-run').addEventListener('click', startMission);
            container.querySelector('#agri-hint').addEventListener('click', showHint);
            container.querySelector('#agri-undo').addEventListener('click', undo);
            container.querySelector('#agri-clear').addEventListener('click', clearRules);

            eventRoot.addEventListener('click', (event) => {
                const resourceCard = event.target.closest('.agri-resource-card');
                if (resourceCard && !state.running) {
                    state.selected = { kind: 'resource', value: resourceCard.dataset.value };
                    renderCards();
                    renderResources();
                    showFeedback('info', 'เลือกทรัพยากรแล้ว', `แตะช่องบรรทุกเพื่อใส่ "${resourceCard.textContent.trim()}"`);
                    return;
                }

                const card = event.target.closest('.agri-card');
                if (card && !state.running) {
                    state.selected = { kind: card.dataset.kind, value: card.dataset.value };
                    renderCards();
                    renderResources();
                    showFeedback('info', 'เลือกการ์ดแล้ว', `แตะช่องในสมองโดรนเพื่อวาง "${card.textContent.trim()}"`);
                    return;
                }

                const resourceSlot = event.target.closest('.agri-loadout-slot');
                if (resourceSlot && !state.running) {
                    handleLoadoutSlot(resourceSlot);
                    return;
                }

                const slot = event.target.closest('.agri-slot');
                if (!slot || slot.classList.contains('fixed') || state.running) return;
                if (!state.selected) {
                    const ruleIndex = Number(slot.dataset.ruleIndex);
                    const kind = slot.dataset.kind;
                    if (state.rules[ruleIndex][kind]) {
                        pushHistory();
                        state.rules[ruleIndex][kind] = null;
                        state.results = {};
                        renderAll();
                        showFeedback('info', 'นำการ์ดออกแล้ว', 'เลือกการ์ดใบใหม่จากถาดด้านล่างได้เลย');
                        return;
                    }
                    showFeedback('info', 'เลือกการ์ดก่อน', 'แตะการ์ดเงื่อนไขหรือคำสั่ง แล้วค่อยแตะช่องที่ต้องการวาง');
                    return;
                }
                applyToSlot(slot, state.selected);
            });

            eventRoot.addEventListener('dragstart', (event) => {
                const card = event.target.closest('.agri-card');
                const resourceCard = event.target.closest('.agri-resource-card');
                if ((!card && !resourceCard) || state.running) return;
                if (resourceCard) {
                    const payload = { kind: 'resource', value: resourceCard.dataset.value };
                    event.dataTransfer.setData('text/plain', JSON.stringify(payload));
                    event.dataTransfer.effectAllowed = 'copy';
                    state.selected = payload;
                    renderCards();
                    renderResources();
                    return;
                }
                const payload = { kind: card.dataset.kind, value: card.dataset.value };
                event.dataTransfer.setData('text/plain', JSON.stringify(payload));
                event.dataTransfer.effectAllowed = 'copy';
                state.selected = payload;
                renderCards();
                renderResources();
            });
            eventRoot.addEventListener('dragover', (event) => {
                const loadoutSlot = event.target.closest('.agri-loadout-slot');
                if (loadoutSlot && !state.running) {
                    event.preventDefault();
                    loadoutSlot.classList.add('target');
                    return;
                }
                const slot = event.target.closest('.agri-slot');
                if (!slot || slot.classList.contains('fixed') || state.running) return;
                event.preventDefault();
                slot.classList.add('target');
            });
            eventRoot.addEventListener('dragleave', (event) => {
                const loadoutSlot = event.target.closest('.agri-loadout-slot');
                if (loadoutSlot) loadoutSlot.classList.remove('target');
                const slot = event.target.closest('.agri-slot');
                if (slot) slot.classList.remove('target');
            });
            eventRoot.addEventListener('drop', (event) => {
                const loadoutSlot = event.target.closest('.agri-loadout-slot');
                if (loadoutSlot && !state.running) {
                    event.preventDefault();
                    loadoutSlot.classList.remove('target');
                    try {
                        applyResourceToSlot(loadoutSlot, JSON.parse(event.dataTransfer.getData('text/plain')));
                    } catch (error) {
                        showFeedback('error', 'วางทรัพยากรไม่ได้', 'ลองเลือกทรัพยากรอีกครั้ง');
                    }
                    return;
                }
                const slot = event.target.closest('.agri-slot');
                if (!slot || slot.classList.contains('fixed') || state.running) return;
                event.preventDefault();
                slot.classList.remove('target');
                try {
                    applyToSlot(slot, JSON.parse(event.dataTransfer.getData('text/plain')));
                } catch (error) {
                    showFeedback('error', 'วางการ์ดไม่ได้', 'ลองเลือกการ์ดอีกครั้ง');
                }
            });
        }

        function applyToSlot(slot, payload) {
            const ruleIndex = Number(slot.dataset.ruleIndex);
            const kind = slot.dataset.kind;
            if (payload.kind !== kind) {
                showFeedback('error', 'ช่องไม่ตรงชนิดการ์ด', kind === 'condition'
                    ? 'ช่องนี้ต้องใช้การ์ดเงื่อนไข เช่น ดินแห้ง ฝนตก มีแมลง หรือผลผลิตสุก'
                    : 'ช่องนี้ต้องใช้การ์ดคำสั่ง เช่น รดน้ำ กลับฐาน ไล่แมลง หรือเก็บเกี่ยว');
                return;
            }
            pushHistory();
            state.rules[ruleIndex][kind] = payload.value;
            state.selected = null;
            state.results = {};
            renderAll();
        }

        function handleLoadoutSlot(slot) {
            const slotIndex = Number(slot.dataset.slotIndex);
            if (state.selected?.kind === 'resource') {
                applyResourceToSlot(slot, state.selected);
                return;
            }
            if (state.loadout[slotIndex]) {
                pushHistory();
                state.loadout[slotIndex] = null;
                state.droneResources = loadoutCounts(state.loadout);
                state.selected = null;
                renderAll();
                showFeedback('info', 'นำทรัพยากรออกแล้ว', 'ปรับน้ำหนักบรรทุกก่อนปล่อยโดรนได้เลย');
                return;
            }
            showFeedback('info', 'เลือกทรัพยากรก่อน', 'ลากหรือแตะทรัพยากร แล้ววางลงช่องบรรทุกโดรน');
        }

        function applyResourceToSlot(slot, payload) {
            if (payload.kind !== 'resource' || !resourceMap[payload.value]) {
                showFeedback('error', 'ช่องนี้รับทรัพยากรเท่านั้น', 'เลือกน้ำ ปุ๋ย น้ำยา หรือตะกร้าจากคลังทรัพยากร');
                return;
            }
            const slotIndex = Number(slot.dataset.slotIndex);
            const nextLoadout = state.loadout.slice();
            nextLoadout[slotIndex] = payload.value;
            const weight = loadoutWeight(nextLoadout);
            const capacity = loadoutCapacity();
            if (weight > capacity) {
                showFeedback('error', 'โดรนบรรทุกหนักเกินไป', `น้ำหนักรวม ${weight}/${capacity} หน่วย ลองนำของบางอย่างออกก่อน`);
                return;
            }
            pushHistory();
            state.loadout = nextLoadout;
            state.droneResources = loadoutCounts(state.loadout);
            state.selected = null;
            renderAll();
            showFeedback('info', 'บรรทุกทรัพยากรแล้ว', `น้ำหนักรวม ${weight}/${capacity} หน่วย`);
        }

        function pushHistory() {
            state.history.push(JSON.stringify({
                rules: state.rules,
                loadout: state.loadout
            }));
            if (state.history.length > 20) state.history.shift();
        }

        function undo() {
            if (state.running) return;
            const previous = state.history.pop();
            if (!previous) {
                showFeedback('info', 'ยังย้อนกลับไม่ได้', 'ยังไม่มีการวางการ์ดก่อนหน้านี้');
                return;
            }
            const parsed = JSON.parse(previous);
            if (Array.isArray(parsed)) {
                state.rules = parsed;
            } else {
                state.rules = parsed.rules;
                state.loadout = parsed.loadout;
                state.droneResources = loadoutCounts(state.loadout);
            }
            state.selected = null;
            state.results = {};
            renderAll();
            showFeedback('info', 'ย้อนกลับแล้ว', 'ตรวจสมองโดรนอีกครั้งก่อนปล่อยโดรน');
        }

        function clearRules() {
            if (state.running) return;
            pushHistory();
            state.rules = rows.map((row) => ({
                condition: row.type === 'else' || row.fixedCondition === 'else' ? 'else' : null,
                action: null
            }));
            state.selected = null;
            state.results = {};
            renderAll();
            showFeedback('info', 'ล้างกฎแล้ว', 'เริ่มสร้างสมองโดรนใหม่ได้เลย');
        }

        function showHint() {
            if (state.running) return;
            state.hints++;
            renderStats();
            showFeedback('info', 'คำใบ้', gameConfig.hint || buildHint());
        }

        function currentWave() {
            return waves[state.waveIndex] || waves[0];
        }

        function currentPlots() {
            const plots = currentWave().plots || currentWave().lanes || [];
            return plots.map((plot, index) => ({
                id: plot.id || String.fromCharCode(65 + index),
                name: plot.name || `แปลง ${plot.id || String.fromCharCode(65 + index)}`,
                soil: plot.soil || 'wet',
                rain: Boolean(plot.rain),
                pest: Boolean(plot.pest),
                needFertilizer: Boolean(plot.needFertilizer),
                weed: Boolean(plot.weed),
                crop: plot.crop || 'growing',
                hp: plot.hp ?? plot.health ?? 80,
                expectedAction: plot.expectedAction || null,
                note: plot.note || '',
                cell: plot.cell || (Number.isInteger(plot.row) && Number.isInteger(plot.col) ? { row: plot.row, col: plot.col } : null),
                position: plot.position || defaultPlotPosition(index, plots.length, plot)
            }));
        }

        function defaultPlotPosition(index, total, plot = {}) {
            const wave = currentWave();
            const cell = plot.cell || (Number.isInteger(plot.row) && Number.isInteger(plot.col) ? { row: plot.row, col: plot.col } : null);
            if (cell && wave.rows && wave.cols) {
                const gap = 1.2;
                const cellW = 100 / wave.cols;
                const cellH = 100 / wave.rows;
                return {
                    x: cell.col * cellW + gap / 2,
                    y: cell.row * cellH + gap / 2,
                    w: cellW - gap,
                    h: cellH - gap
                };
            }
            const positions = total <= 3
                ? [{ x: 16, y: 10 }, { x: 43, y: 28 }, { x: 17, y: 55 }]
                : [{ x: 10, y: 10 }, { x: 38, y: 10 }, { x: 10, y: 52 }, { x: 38, y: 52 }, { x: 66, y: 31 }];
            return positions[index] || { x: 16 + (index % 3) * 28, y: 12 + Math.floor(index / 3) * 38 };
        }

        function renderAll() {
            renderStats();
            renderBrief();
            renderPlots();
            renderRules();
            renderCards();
            renderResources();
        }

        function renderStats() {
            setText('#agri-wave', `Wave ${state.waveIndex + 1}/${waves.length}`);
            setText('#agri-attempts', `ลอง ${state.attempts}`);
            setText('#agri-mistakes', `พลาด ${state.mistakes}`);
            setText('#agri-combo', `Combo ${state.combo}`);
            updateMeter('hp', state.farmHp);
            updateMeter('battery', state.droneBattery);
            const maxWater = Math.max(1, currentWave().maxWater || 3);
            updateResourceMeter('water', state.droneResources.water || 0, maxWater, 'ถัง');
            const targetHarvest = gameConfig.harvestTarget || currentPlots().filter((plot) => plot.crop === 'ripe').length || 1;
            setText('#agri-harvest-label', `${state.harvestedCount}/${targetHarvest}`);
            const harvestPercent = Math.min(100, (state.harvestedCount / targetHarvest) * 100);
            const harvestFill = container.querySelector('#agri-harvest-fill');
            if (harvestFill) {
                harvestFill.style.width = `${harvestPercent}%`;
                harvestFill.style.background = '#f59e0b';
            }
        }

        function updateMeter(name, value) {
            const safe = Math.max(0, Math.min(100, Math.round(value)));
            setText(`#agri-${name}-label`, `${safe}%`);
            const fill = container.querySelector(`#agri-${name}-fill`);
            if (!fill) return;
            fill.style.width = `${safe}%`;
            fill.style.background = safe > 65 ? '#16a34a' : safe > 30 ? '#f59e0b' : '#dc2626';
            if (name === 'water') fill.style.background = safe > 55 ? '#0284c7' : safe > 25 ? '#f59e0b' : '#dc2626';
        }

        function updateResourceMeter(name, value, max, unit) {
            setText(`#agri-${name}-label`, `${value} ${unit}`);
            const fill = container.querySelector(`#agri-${name}-fill`);
            if (!fill) return;
            const percent = clamp((value / max) * 100, 0, 100);
            fill.style.width = `${percent}%`;
            fill.style.background = percent > 55 ? '#0284c7' : percent > 25 ? '#f59e0b' : '#dc2626';
        }

        function renderBrief() {
            const wave = currentWave();
            setText('#agri-brief-title', wave.name || 'ภารกิจโดรน');
            setText('#agri-brief-text', wave.brief || gameConfig.briefing || '');
            setText('#agri-wave-name', `Wave ${state.waveIndex + 1}`);
        }

        function renderPlots() {
            const plots = currentPlots();
            container.querySelector('#agri-plots').innerHTML = `${renderGridCells()}${plots.map((plot) => {
                const result = state.results[plot.id];
                const resultClass = result ? ` result-${result.safe ? 'good' : 'bad'} result-${result.result}` : '';
                const effect = result?.effect ? `<div class="agri-effect">${escapeHtml(result.effect)}</div>` : '';
                const sizeStyle = plot.position.w
                    ? `width:calc(${plot.position.w}% - 4px); min-height:calc(${plot.position.h}% - 4px);`
                    : '';
                return `
                    <article class="agri-plot soil-${plot.soil}${plot.rain ? ' raining' : ''}${resultClass}"
                        id="agri-plot-${escapeHtml(plot.id)}"
                        style="left:${plot.position.x}%; top:${plot.position.y}%; ${sizeStyle}">
                        <div class="agri-rain"></div>
                        <div class="agri-flood"></div>
                        ${effect}
                        <div class="agri-plot-name">
                            <span>${escapeHtml(plot.name)}</span>
                            <span>${plot.hp}%</span>
                        </div>
                        <div class="agri-plant">${plantIcon(plot, result)}</div>
                        ${plot.pest && result?.result !== 'pest_cleared' ? '<div class="agri-pest">🐛</div>' : ''}
                        ${plot.crop === 'ripe' && result?.result !== 'harvested' ? '<div class="agri-crop">🍅</div>' : ''}
                        ${plot.needFertilizer && result?.result !== 'fertilized' ? '<div class="agri-fertilizer">🌿</div>' : ''}
                        ${plot.weed && result?.result !== 'weed_cleared' ? '<div class="agri-weed">🌱</div>' : ''}
                        <div class="agri-sensors">
                            <span>${plot.soil === 'dry' ? 'ดินแห้ง' : 'ดินชื้น'}</span>
                            <span>${plot.rain ? 'ฝนตก' : 'ไม่มีฝน'}</span>
                            ${plot.pest ? '<span>มีแมลง</span>' : ''}
                            ${plot.needFertilizer ? '<span>ขาดปุ๋ย</span>' : ''}
                            ${plot.weed ? '<span>วัชพืช</span>' : ''}
                            ${plot.crop === 'ripe' ? '<span>ผลผลิตสุก</span>' : ''}
                        </div>
                        <div class="agri-plot-message">${escapeHtml(result ? result.message : (plot.note || 'รอคำสั่งจากสมองโดรน'))}</div>
                    </article>
                `;
            }).join('')}`;
        }

        function renderGridCells() {
            const wave = currentWave();
            if (!wave.rows || !wave.cols) return '';
            const gap = 1.2;
            const cellW = 100 / wave.cols;
            const cellH = 100 / wave.rows;
            const cells = [];
            for (let row = 0; row < wave.rows; row++) {
                for (let col = 0; col < wave.cols; col++) {
                    cells.push(`
                        <div class="agri-grid-cell ${col === 0 ? 'base-cell' : ''}"
                            style="left:${col * cellW + gap / 2}%; top:${row * cellH + gap / 2}%; width:calc(${cellW - gap}% - 4px); height:calc(${cellH - gap}% - 4px);">
                        </div>
                    `);
                }
            }
            return cells.join('');
        }

        function renderRules() {
            container.querySelector('#agri-rules').innerHTML = rows.map((row, index) => {
                const rule = state.rules[index];
                const fixed = row.type === 'else' || row.fixedCondition === 'else';
                return `
                    <div class="agri-rule">
                        <div class="agri-rule-label">${escapeHtml(row.label)}</div>
                        <div class="agri-rule-slots">
                            <button type="button"
                                class="agri-slot ${fixed ? 'fixed filled' : rule.condition ? 'filled' : ''}"
                                data-rule-index="${index}"
                                data-kind="condition">
                                ${escapeHtml(fixed ? 'กรณีอื่น ๆ' : rule.condition ? cardLabel(rule.condition, conditionMap) : 'วางเงื่อนไข')}
                            </button>
                            <button type="button"
                                class="agri-slot ${rule.action ? 'filled' : ''}"
                                data-rule-index="${index}"
                                data-kind="action">
                                ${escapeHtml(rule.action ? cardLabel(rule.action, actionMap) : 'วางคำสั่ง')}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderCards() {
            container.querySelector('#agri-condition-cards').innerHTML = conditionCards.map((card) => cardHtml(card, 'condition')).join('');
            container.querySelector('#agri-action-cards').innerHTML = actionCards.map((card) => cardHtml(card, 'action')).join('');
        }

        function renderResources() {
            const slotCount = currentWave().loadoutSlots || gameConfig.loadoutSlots || 4;
            const weight = loadoutWeight(state.loadout);
            const capacity = loadoutCapacity();
            const drain = batteryDrainForWeight(weight);
            setText('#agri-loadout-weight', `น้ำหนัก ${weight}/${capacity}`);
            setText('#agri-loadout-effect', `แบต -${drain}/ช่อง`);

            const slotWrap = container.querySelector('#agri-loadout-slots');
            if (slotWrap) {
                slotWrap.innerHTML = Array.from({ length: slotCount }, (_, index) => {
                    const value = state.loadout[index] || null;
                    const resource = value ? resourceMap[value] : null;
                    return `
                        <button type="button"
                            class="agri-loadout-slot ${resource ? 'filled' : ''}"
                            data-slot-index="${index}">
                            ${resource ? escapeHtml(`${resource.icon} ${resource.label}`) : 'ช่องว่าง'}
                        </button>
                    `;
                }).join('');
            }

            const resourceWrap = container.querySelector('#agri-resource-cards');
            if (resourceWrap) {
                resourceWrap.innerHTML = resourceCatalog.map((resource) => {
                    const selected = state.selected?.kind === 'resource' && state.selected.value === resource.value;
                    return `
                        <button type="button"
                            class="agri-card agri-resource-card resource ${selected ? 'selected' : ''}"
                            draggable="true"
                            data-value="${escapeHtml(resource.value)}">
                            ${escapeHtml(`${resource.icon} ${resource.label}`)}
                        </button>
                    `;
                }).join('');
            }

            const counts = loadoutCounts(state.loadout);
            const statusWrap = container.querySelector('#agri-resource-status');
            if (statusWrap) {
                statusWrap.innerHTML = resourceCatalog.map((resource) => `
                    <span class="agri-resource-pill">${escapeHtml(resource.icon)} ${escapeHtml(resource.label)} ${counts[resource.value] || 0}</span>
                `).join('');
            }
        }

        function cardHtml(card, kind) {
            const selected = state.selected && state.selected.kind === kind && state.selected.value === card.value;
            return `
                <button type="button"
                    class="agri-card ${kind} ${selected ? 'selected' : ''}"
                    draggable="true"
                    data-kind="${kind}"
                    data-value="${escapeHtml(card.value)}">
                    ${escapeHtml(`${card.icon ? `${card.icon} ` : ''}${card.label}`)}
                </button>
            `;
        }

        async function startMission() {
            if (state.running || state.ended) return;
            const missing = findMissingRule();
            if (missing) {
                state.mistakes++;
                renderStats();
                showFeedback('error', 'สมองโดรนยังไม่ครบ', missing);
                return;
            }

            state.running = true;
            setControlsDisabled(true);
            state.attempts++;
            state.results = {};
            state.combo = 0;
            state.farmHp = currentWave().farmHp || gameConfig.farmHp || 100;
            state.droneBattery = currentWave().battery ?? gameConfig.droneBattery ?? 100;
            state.droneResources = loadoutCounts(state.loadout);
            state.harvestedCount = 0;
            state.pestCleared = 0;
            renderAll();
            moveDroneTo(basePosition, false);
            await wait(220);

            const logs = [];
            const errors = [];
            const priorityIssue = checkPriority(state.rules);
            if (priorityIssue) errors.push(priorityIssue);

            for (const plot of currentPlots()) {
                await flyToPlot(plot);
                const decision = evaluateRules(plot, state.rules);
                const outcome = applyAction(plot, decision.action);
                const expected = plot.expectedAction;
                const actionOk = expected ? decision.action === expected : outcome.safe;
                const safe = actionOk && outcome.safe;
                const result = {
                    ...outcome,
                    safe,
                    action: decision.action,
                    message: `${cardLabel(decision.action, actionMap)}: ${outcome.label}`
                };

                if (!safe) {
                    state.mistakes++;
                    state.wrongActions++;
                    state.combo = 0;
                    errors.push(buildError(plot, decision, outcome, expected));
                } else {
                    state.combo++;
                }

                state.farmHp = clamp(state.farmHp + outcome.hpChange, 0, 100);
                state.droneBattery = clamp(state.droneBattery + outcome.batteryChange, 0, 100);
                state.harvestedCount += outcome.harvestChange || 0;
                state.pestCleared += outcome.pestChange || 0;
                state.results[plot.id] = result;
                logs.push(`${plot.name}: ${describePlot(plot)} → ${cardLabel(decision.action, actionMap)} → ${outcome.label}`);
                renderAll();
                await wait(650);

                if (decision.action === 'return_base' || state.droneBattery <= 0) {
                    await returnToBase();
                }
            }

            await returnToBase();
            state.running = false;
            setControlsDisabled(false);
            const passed = errors.length === 0 && state.farmHp > 0 && state.droneBattery > 0;
            if (passed && state.waveIndex < waves.length - 1) {
                showFeedback('success', 'Wave สำเร็จ', 'โดรนทำภารกิจตามกฎได้ดี ไป Wave ถัดไป', logs);
                state.waveIndex++;
                state.results = {};
                state.loadout = normalizeLoadout(currentWave().defaultLoadout || gameConfig.defaultLoadout || state.loadout);
                state.droneResources = loadoutCounts(state.loadout);
                state.droneBattery = currentWave().battery ?? gameConfig.droneBattery ?? 100;
                renderAll();
                moveDroneTo(basePosition, false);
                return;
            }
            if (passed) {
                finishMission(logs);
                return;
            }
            showFeedback('error', 'ภารกิจยังไม่สำเร็จ', errors[0] || 'ลองปรับลำดับกฎให้โดรนตัดสินใจถูกขึ้น', logs);
        }

        async function flyToPlot(plot) {
            showFeedback('info', 'โดรนกำลังบิน', `กำลังไปตรวจ ${plot.name}`);
            moveDroneTo({ x: plot.position.x + 9, y: plot.position.y + 8 }, true);
            await wait(760);
            const drone = container.querySelector('#agri-drone');
            drone.classList.add('scanning');
            showFeedback('info', 'สแกนแปลง', `${plot.name}: ${describePlot(plot)}`);
            await wait(560);
            drone.classList.remove('scanning');
        }

        async function returnToBase() {
            const drone = container.querySelector('#agri-drone');
            drone.classList.add('returning');
            moveDroneTo(basePosition, true);
            await wait(720);
            drone.classList.remove('returning');
        }

        function moveDroneTo(position, animated = true) {
            const drone = container.querySelector('#agri-drone');
            if (!drone) return;
            if (!animated) {
                drone.style.transition = 'none';
                window.requestAnimationFrame(() => {
                    drone.style.left = `${position.x}%`;
                    drone.style.top = `${position.y}%`;
                    window.requestAnimationFrame(() => {
                        drone.style.transition = '';
                    });
                });
                return;
            }
            drone.style.left = `${position.x}%`;
            drone.style.top = `${position.y}%`;
        }

        function setControlsDisabled(disabled) {
            container.querySelectorAll('.agri-control, .agri-card, .agri-slot, .agri-loadout-slot').forEach((item) => {
                if (item.classList.contains('fixed')) return;
                item.disabled = disabled;
            });
        }

        function findMissingRule() {
            for (let i = 0; i < state.rules.length; i++) {
                const row = rows[i];
                const rule = state.rules[i];
                if (!(row.type === 'else' || row.fixedCondition === 'else') && !rule.condition) {
                    return `แถวที่ ${i + 1} ยังไม่มีเงื่อนไข`;
                }
                if (!rule.action) {
                    return `แถวที่ ${i + 1} ยังไม่มีคำสั่ง`;
                }
            }
            return '';
        }

        function evaluateRules(plot, rules) {
            const drone = {
                battery: state.droneBattery,
                water: state.droneResources.water || 0,
                fertilizer: state.droneResources.fertilizer || 0,
                pesticide: state.droneResources.pesticide || 0,
                basketCapacity: state.droneResources.basket || 0,
                harvest: state.harvestedCount
            };
            for (let i = 0; i < rules.length; i++) {
                const rule = rules[i];
                if (rule.condition === 'else' || checkCondition(plot, drone, rule.condition)) {
                    return { action: rule.action || 'skip', ruleIndex: i };
                }
            }
            return { action: 'skip', ruleIndex: -1 };
        }

        function checkCondition(plot, drone, condition) {
            if (condition === 'soil_dry') return plot.soil === 'dry';
            if (condition === 'rain') return plot.rain === true;
            if (condition === 'pest') return plot.pest === true;
            if (condition === 'crop_ripe') return plot.crop === 'ripe';
            if (condition === 'need_fertilizer') return plot.needFertilizer === true;
            if (condition === 'weed') return plot.weed === true;
            if (condition === 'battery_low') return drone.battery <= 25;
            if (condition === 'water_low' || condition === 'water_empty') return drone.water <= 0;
            if (condition === 'basket_full') return drone.basketCapacity > 0 && drone.harvest >= drone.basketCapacity;
            return false;
        }

        function applyAction(plot, action) {
            let result = 'safe';
            let label = 'โดรนสำรวจต่ออย่างปลอดภัย';
            let hpChange = 4;
            let batteryChange = -batteryDrainForWeight(loadoutWeight(state.loadout));
            let harvestChange = 0;
            let pestChange = 0;
            let effect = '✅';

            if (action === 'water') {
                batteryChange -= 2;
                if ((state.droneResources.water || 0) <= 0) {
                    result = 'no_water';
                    label = 'น้ำในถังหมด พืชยังไม่ได้รับน้ำ';
                    hpChange = -16;
                    effect = '⚠️';
                } else if (plot.rain) {
                    state.droneResources.water -= 1;
                    result = 'flood';
                    label = 'ฝนตกอยู่แล้ว แต่โดรนรดน้ำซ้ำจนเสี่ยงน้ำท่วม';
                    hpChange = -22;
                    effect = '🌊';
                } else if (plot.soil === 'dry') {
                    state.droneResources.water -= 1;
                    result = 'recover';
                    label = 'พืชฟื้นจากการรดน้ำพอดี';
                    hpChange = 18;
                    effect = '💧';
                } else {
                    state.droneResources.water -= 1;
                    result = 'overwater';
                    label = 'ดินชื้นอยู่แล้ว โดรนรดน้ำเกินจำเป็น';
                    hpChange = -12;
                    effect = '🌊';
                }
            } else if (action === 'return_base') {
                result = 'return_base';
                if (plot.rain || state.droneBattery <= 25) {
                    label = plot.rain ? 'โดรนกลับฐานหลบฝนได้ทัน' : 'โดรนกลับฐานเพื่อชาร์จแบต';
                    hpChange = 4;
                    batteryChange = 18;
                } else {
                    label = 'โดรนกลับฐานทั้งที่ยังควรทำภารกิจในแปลงนี้';
                    hpChange = plot.soil === 'dry' || plot.pest || plot.crop === 'ripe' ? -10 : 0;
                }
                effect = '🏠';
            } else if (action === 'repel_pest' || action === 'spray') {
                batteryChange -= 3;
                if ((state.droneResources.pesticide || 0) <= 0) {
                    result = 'no_pesticide';
                    label = 'ไม่มีน้ำยากำจัดศัตรูพืชพอ';
                    hpChange = -16;
                    effect = '⚠️';
                } else if (plot.pest) {
                    state.droneResources.pesticide -= 1;
                    result = 'pest_cleared';
                    label = 'โดรนพ่นละอองสมุนไพรไล่แมลงสำเร็จ';
                    hpChange = 16;
                    pestChange = 1;
                    effect = '✨';
                } else {
                    state.droneResources.pesticide -= 1;
                    result = 'wrong_pest_action';
                    label = 'ไม่มีแมลง แต่โดรนเสียเวลาไล่แมลง';
                    hpChange = -6;
                    effect = '⚠️';
                }
            } else if (action === 'fertilize') {
                batteryChange -= 2;
                if ((state.droneResources.fertilizer || 0) <= 0) {
                    result = 'no_fertilizer';
                    label = 'ไม่มีปุ๋ยพอสำหรับแปลงนี้';
                    hpChange = -14;
                    effect = '⚠️';
                } else if (plot.needFertilizer) {
                    state.droneResources.fertilizer -= 1;
                    result = 'fertilized';
                    label = 'ใส่ปุ๋ยสำเร็จ พืชโตแข็งแรงขึ้น';
                    hpChange = plot.soil === 'dry' ? 12 : 18;
                    effect = '🌿';
                } else {
                    state.droneResources.fertilizer -= 1;
                    result = 'wrong_fertilizer_action';
                    label = 'พืชไม่ได้ขาดปุ๋ย จึงใช้ปุ๋ยเกินจำเป็น';
                    hpChange = -6;
                    effect = '⚠️';
                }
            } else if (action === 'harvest') {
                batteryChange -= 3;
                if ((state.droneResources.basket || 0) <= 0) {
                    result = 'basket_full';
                    label = 'ไม่มีตะกร้าหรือความจุตะกร้าเต็ม';
                    hpChange = -14;
                    effect = '⚠️';
                } else if (plot.pest) {
                    state.droneResources.basket -= 1;
                    result = 'tainted_harvest';
                    label = 'เก็บเกี่ยวทั้งที่ยังมีแมลง ทำให้ผลผลิตเสีย';
                    hpChange = -18;
                    harvestChange = 1;
                    effect = '🥀';
                } else if (plot.crop === 'ripe') {
                    state.droneResources.basket -= 1;
                    result = 'harvested';
                    label = 'เก็บผลผลิตสุกเข้าตะกร้าแล้ว';
                    hpChange = 6;
                    harvestChange = 1;
                    effect = '🧺';
                } else {
                    result = 'unripe_harvest';
                    label = 'ผลผลิตยังไม่สุก จึงไม่ควรเก็บเกี่ยวตอนนี้';
                    hpChange = -10;
                    effect = '⚠️';
                }
            } else if (action === 'clear_weed') {
                batteryChange -= 3;
                if (plot.weed) {
                    result = 'weed_cleared';
                    label = 'กำจัดวัชพืชออกจากแปลงแล้ว';
                    hpChange = 12;
                    effect = '🧤';
                } else {
                    result = 'wrong_weed_action';
                    label = 'ไม่มีวัชพืชในช่องนี้';
                    hpChange = -5;
                    effect = '⚠️';
                }
            } else if (action === 'refill_water') {
                result = 'refill_water';
                label = 'โดรนเติมน้ำที่ฐานแล้วพร้อมทำงานต่อ';
                hpChange = 2;
                state.droneResources.water += 1;
                batteryChange = -2;
                effect = '🪣';
            } else if (action === 'recharge') {
                result = 'recharge';
                label = 'โดรนชาร์จแบตที่ฐานแล้ว';
                hpChange = 2;
                batteryChange = 35;
                effect = '🔋';
            } else if (action === 'skip') {
                if ((plot.soil === 'dry' && !plot.rain) || plot.pest || plot.crop === 'ripe' || plot.needFertilizer || plot.weed) {
                    result = 'miss';
                    label = 'โดรนบินผ่าน ทั้งที่แปลงนี้ต้องได้รับการช่วยเหลือ';
                    hpChange = -12;
                    effect = '⚠️';
                } else {
                    result = 'skip';
                    label = 'ไม่มีเหตุฉุกเฉิน โดรนสำรวจต่อได้ถูกต้อง';
                    hpChange = 4;
                    effect = '🛰️';
                }
            } else {
                result = 'no_action';
                label = 'โดรนไม่รู้ว่าต้องทำอะไร';
                hpChange = -10;
                batteryChange = -2;
                effect = '⚠️';
            }

            return { result, label, hpChange, batteryChange, harvestChange, pestChange, effect, safe: hpChange >= 0 };
        }

        function checkPriority(rules) {
            const wavePriority = currentWave().expectedPriority || expectedPriority;
            if (!gameConfig.strictPriority || !wavePriority.length) return '';
            const actual = rules.map((rule) => rule.condition);
            for (let i = 0; i < wavePriority.length; i++) {
                if (actual[i] !== wavePriority[i]) {
                    if (wavePriority[i] === 'rain') {
                        return 'ลำดับเงื่อนไขยังไม่ถูกต้อง ควรตรวจ “ฝนตก” ก่อน “ดินแห้ง” เพราะระบบอ่านกฎจากบนลงล่าง';
                    }
                    if (wavePriority[i] === 'pest') {
                        return 'แมลงทำลายพืชเร็ว ควรตรวจ “มีแมลง” เป็นเงื่อนไขแรกในภารกิจใหญ่';
                    }
                    return `ลำดับเงื่อนไขยังไม่ถูกต้อง ลองวาง "${cardLabel(wavePriority[i], conditionMap)}" ในแถวที่ ${i + 1}`;
                }
            }
            return '';
        }

        function buildError(plot, decision, outcome, expected) {
            if (expected && decision.action !== expected) {
                return `${plot.name} ควรเป็น "${cardLabel(expected, actionMap)}" แต่โดรนเลือก "${cardLabel(decision.action, actionMap)}" เพราะกฎแถวบนสุดที่เข้าเงื่อนไขถูกใช้ก่อน`;
            }
            if (outcome.result === 'flood' || outcome.result === 'overwater') {
                return `${plot.name} น้ำมากเกินไป ลองตรวจเงื่อนไข “ฝนตก” หรือใช้ “สำรวจต่อ” เมื่อดินไม่แห้ง`;
            }
            if (outcome.result === 'miss') {
                if (plot.pest) return `${plot.name} มีแมลงแต่โดรนไม่ได้ไล่แมลง ลองเพิ่มกฎ ถ้ามีแมลง → ไล่แมลง`;
                if (plot.crop === 'ripe') return `${plot.name} ผลผลิตสุกแต่โดรนไม่ได้เก็บเกี่ยว ลองเพิ่มกฎ ถ้าผลผลิตสุก → เก็บเกี่ยว`;
                return `${plot.name} ดินแห้งแต่โดรนไม่ได้รดน้ำ ลองใช้กฎ ถ้าดินแห้ง → รดน้ำ`;
            }
            if (outcome.result === 'unripe_harvest') {
                return `${plot.name} ผลผลิตยังไม่สุก ควรเก็บเกี่ยวเฉพาะแปลงที่มีสถานะ “ผลผลิตสุก”`;
            }
            if (outcome.result === 'wrong_pest_action') {
                return `${plot.name} ไม่มีแมลง จึงไม่ควรใช้คำสั่งไล่แมลงในแปลงนี้`;
            }
            if (outcome.result === 'no_water') {
                return `${plot.name} น้ำในโดรนหมด ลองเพิ่มน้ำในช่องบรรทุกหรือปรับกฎไม่ให้รดน้ำเกินจำเป็น`;
            }
            if (outcome.result === 'no_pesticide') {
                return `${plot.name} มีปัญหาแมลงแต่ไม่ได้บรรทุกน้ำยาเพียงพอ`;
            }
            if (outcome.result === 'no_fertilizer') {
                return `${plot.name} ต้องใช้ปุ๋ย แต่โดรนไม่ได้บรรทุกปุ๋ยพอ`;
            }
            if (outcome.result === 'wrong_fertilizer_action') {
                return `${plot.name} ไม่ได้ขาดปุ๋ย จึงควรให้กฎอื่นจัดการก่อน`;
            }
            if (outcome.result === 'basket_full') {
                return `${plot.name} ต้องใช้ตะกร้าเก็บเกี่ยว ลองบรรทุกตะกร้าเพิ่มหรือลดทรัพยากรอื่น`;
            }
            if (outcome.result === 'tainted_harvest') {
                return `${plot.name} มีแมลงอยู่ ควรกำจัดศัตรูพืชก่อนเก็บเกี่ยว`;
            }
            if (outcome.result === 'wrong_weed_action') {
                return `${plot.name} ไม่มีวัชพืช จึงไม่ควรใช้คำสั่งกำจัดวัชพืช`;
            }
            return `${plot.name} ยังไม่ปลอดภัย ลองตรวจเงื่อนไขและคำสั่งอีกครั้ง`;
        }

        function finishMission(logs) {
            state.ended = true;
            const duration = Math.max(1, Math.floor((Date.now() - state.startedAt) / 1000));
            const stars = calculateStars();
            const badge = gameConfig.badge || 'วิศวกรโดรนเกษตร';
            showFeedback('success', 'ภารกิจสำเร็จ!', gameConfig.winMessage || 'โดรนทำงานตามสมองที่คุณสร้างและช่วยฟาร์มได้สำเร็จ', logs);
            const overlay = document.createElement('div');
            overlay.className = 'agri-finish';
            overlay.innerHTML = `
                <div class="agri-finish-card">
                    <h3>ภารกิจสำเร็จ!</h3>
                    <p>${escapeHtml(gameConfig.winMessage || 'คุณตั้งกฎให้โดรนพิทักษ์ฟาร์มได้สำเร็จ')}</p>
                    <div class="agri-stars">${'⭐'.repeat(stars)}</div>
                    <p><strong>Badge:</strong> ${escapeHtml(badge)}</p>
                    <p>ใช้เวลา ${duration} วินาที | ปล่อยโดรน ${state.attempts} ครั้ง | พลาด ${state.mistakes} ครั้ง</p>
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

        function calculateStars() {
            const harvestTarget = gameConfig.harvestTarget || 0;
            const harvestOk = !harvestTarget || state.harvestedCount >= harvestTarget;
            if (state.farmHp >= 85 && state.mistakes <= 1 && state.hints === 0 && state.droneBattery > 0 && harvestOk) return 3;
            if (state.farmHp >= 60 && state.mistakes <= 3 && state.hints <= 1) return 2;
            return 1;
        }

        function buildHint() {
            const wavePriority = currentWave().expectedPriority || expectedPriority;
            if (!wavePriority.length) return 'อ่านสถานะแปลงก่อน แล้วเลือกเงื่อนไขที่ควรตรวจเป็นอันดับแรก';
            return `ลองเรียงกฎเป็น ${wavePriority.map((item) => cardLabel(item, conditionMap)).join(' → ')}`;
        }

        function describePlot(plot) {
            return [
                plot.soil === 'dry' ? 'ดินแห้ง' : 'ดินชื้น',
                plot.rain ? 'ฝนตก' : 'ไม่มีฝน',
                plot.pest ? 'มีแมลง' : 'ไม่มีแมลง',
                plot.needFertilizer ? 'พืชขาดปุ๋ย' : 'ไม่ขาดปุ๋ย',
                plot.weed ? 'มีวัชพืช' : 'ไม่มีวัชพืช',
                plot.crop === 'ripe' ? 'ผลผลิตสุก' : 'ผลผลิตยังโต'
            ].join(', ');
        }

        function plantIcon(plot, result) {
            if (result?.result === 'flood' || result?.result === 'overwater') return '🌊';
            if (result?.result === 'miss' || result?.result === 'no_water') return '🥀';
            if (result?.result === 'harvested') return '🧺';
            if (result?.result === 'pest_cleared' || result?.result === 'recover' || result?.result === 'fertilized' || result?.result === 'weed_cleared') return '🌱';
            if (plot.soil === 'dry') return '🥀';
            if (plot.crop === 'ripe') return '🌿';
            return '🥬';
        }

        function cardLabel(value, map) {
            if (value === 'else') return 'กรณีอื่น ๆ';
            const card = map[value];
            return card ? `${card.icon ? `${card.icon} ` : ''}${card.label}` : (value || 'ยังไม่เลือก');
        }

        function showFeedback(type, title, message, logs = []) {
            const panel = container.querySelector('#agri-feedback');
            panel.className = `agri-feedback ${type === 'success' ? 'success' : type === 'error' ? 'error' : ''}`;
            panel.innerHTML = `
                <strong>${escapeHtml(title)}</strong>
                <div>${escapeHtml(message)}</div>
                ${logs.length ? `<ol class="agri-log">${logs.map((log) => `<li>${escapeHtml(log)}</li>`).join('')}</ol>` : ''}
            `;
        }

        function setText(selector, value) {
            const el = container.querySelector(selector);
            if (el) el.textContent = value;
        }

        function clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }

        function normalizeLoadout(loadout) {
            const slotCount = currentWave().loadoutSlots || gameConfig.loadoutSlots || 4;
            const source = Array.isArray(loadout) ? loadout : [];
            return Array.from({ length: slotCount }, (_, index) => source[index] || null);
        }

        function loadoutCapacity() {
            return currentWave().loadoutCapacity || gameConfig.loadoutCapacity || 6;
        }

        function loadoutWeight(loadout) {
            return (loadout || []).reduce((total, value) => {
                if (!value || !resourceMap[value]) return total;
                return total + (resourceMap[value].weight || 1);
            }, 0);
        }

        function loadoutCounts(loadout) {
            return (loadout || []).reduce((counts, value) => {
                if (!value) return counts;
                counts[value] = (counts[value] || 0) + (resourceMap[value]?.capacity || 1);
                return counts;
            }, {});
        }

        function batteryDrainForWeight(weight) {
            if (weight <= 2) return 5;
            if (weight <= 4) return 7;
            return 10;
        }

        function wait(ms) {
            return new Promise((resolve) => window.setTimeout(resolve, ms));
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
        smartFarmDefense: initWaterHero,
        waterHero: initWaterHero,
        conditionDefense: initWaterHero,
        agriDroneRescue: initAgriDroneRescue,
        debug: initDebug
    };
})();
