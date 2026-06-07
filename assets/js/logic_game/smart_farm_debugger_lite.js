/* ==========================================================
   Smart Farm Debugger Lite – Game Engine
   Chapter 4 • Educational Debugging Game for Grade 4 (TH)
   ========================================================== */
;(function () {
  'use strict';

  /* ---------- dev helpers ---------- */
  var DEBUGGER_DEV_LOG = (typeof window !== 'undefined' && window.DEBUGGER_DEV_LOG) || false;
  function devLog() {
    if (DEBUGGER_DEV_LOG) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('[DebuggerLite]');
      console.log.apply(console, args);
    }
  }

  /* ---------- constants ---------- */
  var PHASES = ['observe', 'identify', 'fix', 'test'];
  var PHASE_LABELS = {
    observe:  'ดูอาการ',
    identify: 'หาจุดผิด',
    fix:      'ซ่อม',
    test:     'ลองใหม่'
  };

  var FARM_POINTS = {
    cropBed:         { x: 25, y: 60 },
    cropBed2:        { x: 47, y: 62 },
    cropBed3:        { x: 69, y: 62 },
    washer:          { x: 70, y: 55 },
    sprinkler:       { x: 50, y: 25 },
    greenhouse:      { x: 50, y: 55 },
    controlPanel:    { x: 82, y: 30 },
    warningSign:     { x: 78, y: 18 },
    inspectionTable: { x: 55, y: 70 },
    robot:           { x: 18, y: 68 },
    fence:           { x: 82, y: 60 },
    crate:           { x: 78, y: 62 },
    conveyor:        { x: 50, y: 58 },
    deliveryTruck:   { x: 84, y: 74 },
    statusLight:     { x: 82, y: 22 },
    fan:             { x: 65, y: 30 },
    heater:          { x: 35, y: 30 },
    thermometer:     { x: 15, y: 25 },
    humidity:        { x: 15, y: 55 },
    rain:            { x: 40, y: 10 }
  };

  var DEBUG_SAFE_AREA = { top: 24, left: 24, right: 24, bottom: 96 };

  /* ---------- scoring ---------- */
  function starsFromState(state) {
    var totalMistakes = state.wrongTargets + state.wrongFixes;
    if (totalMistakes === 0 && state.hintsUsed === 0) return 3;
    if (totalMistakes <= 2 && state.hintsUsed <= 1) return 2;
    return 1;
  }

  /* ---------- helpers ---------- */
  function esc(str) {
    if (typeof str !== 'string') return '';
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  function el(id) {
    return document.getElementById(id);
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function uid() {
    return 'dbg_' + Math.random().toString(36).substr(2, 9);
  }

  function normalizeBlocks(blockSource) {
    if (!blockSource) return [];
    if (Array.isArray(blockSource)) return blockSource;
    if (Array.isArray(blockSource.additionalBlocks)) return blockSource.additionalBlocks;
    return [blockSource];
  }

  /* ==========================================================
     SmartFarmDebuggerLite class
     ========================================================== */
  function SmartFarmDebuggerLite(config) {
    this.cfg = config || {};
    this.levels = this.cfg.levels || [];
    this.levelIdx = 0;
    this.phase = 'observe';         // observe | identify | fix | test
    this.feedback = null;           // {type, text}
    this.hintIdx = -1;              // -1 = no hint shown yet
    this.selectedChoice = null;
    this.choicesDisabled = false;
    this.rootId = 'debug-root-' + uid();
    this.shellId = 'debug-shell-' + uid();
    this.summaryAdded = false;

    // Map mode (Stage 12)
    this.mapFixedPoints = {};       // pointId → true
    this.activeMapPoint = null;     // pointId currently being played
    this.inMapSubLevel = false;

    this.state = this._freshState();

    devLog('constructor', config);
  }

  /* ---------- state helpers ---------- */
  SmartFarmDebuggerLite.prototype._freshState = function () {
    return {
      startedAt: Date.now(),
      attempts: 0,
      wrongTargets: 0,
      wrongFixes: 0,
      hintsUsed: 0,
      ended: false
    };
  };

  SmartFarmDebuggerLite.prototype.level = function () {
    return this.levels[this.levelIdx] || {};
  };

  /* ==========================================================
     BOOT
     ========================================================== */
  SmartFarmDebuggerLite.prototype.boot = function () {
    devLog('boot');
    var root = document.getElementById('game-container')
            || document.getElementById('game-area')
            || document.body;

    var wrapper = document.createElement('div');
    wrapper.id = this.rootId;
    root.appendChild(wrapper);

    this.loadLevel();
  };

  /* ==========================================================
     LOAD LEVEL
     ========================================================== */
  SmartFarmDebuggerLite.prototype.loadLevel = function () {
    this.phase = 'observe';
    this.feedback = null;
    this.hintIdx = -1;
    this.selectedChoice = null;
    this.choicesDisabled = false;
    this.inMapSubLevel = false;
    this.activeMapPoint = null;
    devLog('loadLevel', this.levelIdx, this.level().title);
    this.render();
  };

  /* ==========================================================
     RENDER — main entry
     ========================================================== */
  SmartFarmDebuggerLite.prototype.render = function () {
    var root = el(this.rootId);
    if (!root) return;

    var lv = this.level();
    var isMap = lv.sceneType === 'farm_map' && !this.inMapSubLevel;

    var html = '<div id="' + this.shellId + '" class="debug-game-shell">';
    html += this.renderMissionCard();
    html += isMap ? this.renderMapView() : this.renderFarmArea();
    html += this.renderBlockPanel();
    html += this.renderControlPanel();
    html += '</div>';

    root.innerHTML = html;
    this.bindEvents();
    devLog('render done, phase=' + this.phase);
  };

  /* ==========================================================
     SECTION 1 — Mission Card
     ========================================================== */
  SmartFarmDebuggerLite.prototype.renderMissionCard = function () {
    var lv = this.level();
    var activeLv = this.inMapSubLevel ? this._activeSubLevel() : lv;
    var title = activeLv.title || this.cfg.title || '';
    var kicker = activeLv.levelId ? ('ด่านย่อย ' + esc(activeLv.levelId)) : '';
    var problem = activeLv.problemText || '';
    var starsHtml = this._renderInlineStars(starsFromState(this.state));

    var html = '<div class="debug-mission-card">';
    html += '<div class="debug-mission-header">';
    if (kicker) html += '<div class="debug-mission-kicker">' + kicker + '</div>';
    html += '<div class="debug-mission-title">' + esc(title) + '</div>';
    html += '</div>';
    if (problem) {
      html += '<div class="debug-mission-problem">' + esc(problem) + '</div>';
    }
    html += '<div class="debug-mission-badges">';
    html += '<span class="debug-badge">' + esc(PHASE_LABELS[this.phase] || this.phase) + '</span>';
    html += '<span class="debug-badge debug-badge-star">' + starsHtml + '</span>';
    html += '</div>';
    html += '</div>';
    return html;
  };

  SmartFarmDebuggerLite.prototype._renderInlineStars = function (count) {
    var s = '';
    for (var i = 0; i < 3; i++) {
      s += '<span style="color:' + (i < count ? '#f59e0b' : '#d1d5db') + '">★</span>';
    }
    return s;
  };

  /* ==========================================================
     SECTION 2 — Farm Area
     ========================================================== */
  SmartFarmDebuggerLite.prototype.renderFarmArea = function () {
    var lv = this.inMapSubLevel ? this._activeSubLevel() : this.level();
    var objects = lv.objects || [];

    var overlayClass = '';
    if (this.phase === 'observe') overlayClass = ' broken';
    if (this.phase === 'test') overlayClass = ' fixed';

    var objectsHtml = '';
    for (var i = 0; i < objects.length; i++) {
      var obj = objects[i];
      var pt = FARM_POINTS[obj.anchor] || { x: 50, y: 50 };
      var px = pt.x;
      var py = pt.y;

      var extraClass = '';
      if (this.phase === 'observe') extraClass = ' debug-anim-bounce';
      if (this.phase === 'test') extraClass = ' debug-anim-glow';

      objectsHtml += '<div class="debug-object' + extraClass + '" '
        + 'style="left:' + px + '%;top:' + py + '%" '
        + 'title="' + esc(obj.label) + '">'
        + '<div class="debug-object-icon">' + this._renderObjectVisual(obj) + '</div>'
        + '<div class="debug-object-label">' + esc(obj.label) + '</div>'
        + '</div>';
    }

    var warningHtml = '';
    if (this.phase === 'observe' && lv.missionText) {
      warningHtml = '<div class="debug-warning">' + esc(lv.missionText) + '</div>';
    }

    var html = '<div class="debug-farm-area">';
    html += '<div class="debug-farm-overlay' + overlayClass + '"></div>';
    html += this._renderSimulationScene(lv);
    html += objectsHtml;
    html += warningHtml;
    html += '</div>';
    return html;
  };

  SmartFarmDebuggerLite.prototype._renderObjectVisual = function (obj) {
    var fallback = esc(obj.fallbackIcon || '?');
    if (!obj.asset || !obj.asset.path) {
      return fallback;
    }
    var width = obj.asset.width ? 'width:' + clamp(parseInt(obj.asset.width, 10) || 72, 32, 160) + 'px;' : '';
    var height = obj.asset.height ? 'height:' + clamp(parseInt(obj.asset.height, 10) || 72, 32, 160) + 'px;' : '';
    return '<span class="debug-object-fallback">' + fallback + '</span>'
      + '<img class="debug-object-img" src="' + esc(obj.asset.path) + '" alt="' + esc(obj.label || '') + '" '
      + 'style="' + width + height + '" onerror="this.style.display=\'none\';this.previousElementSibling.style.display=\'inline-flex\';" '
      + 'onload="this.previousElementSibling.style.display=\'none\';">';
  };

  SmartFarmDebuggerLite.prototype._renderSimulationScene = function (lv) {
    var sim = lv.simulation || {};
    var phaseKey = this.phase === 'test' ? 'fixed' : 'broken';
    var state = sim[phaseKey] || {};
    var type = sim.type || lv.sceneType || 'farm_repair';
    var statusText = state.caption || (phaseKey === 'fixed' ? 'ระบบทำงานถูกต้องแล้ว' : 'ระบบกำลังทำงานผิด ลองสังเกตอาการ');
    var cls = 'debug-sim-scene debug-sim-' + esc(type) + ' ' + (phaseKey === 'fixed' ? 'is-fixed' : 'is-broken');
    var html = '<div class="' + cls + '" data-sim-type="' + esc(type) + '">';
    html += '<div id="debug-phaser-scene" class="debug-phaser-scene" aria-hidden="true"></div>';
    html += '<div class="debug-sim-track">';

    if (type === 'robot_path') {
      html += '<span class="debug-sim-actor robot">🤖</span>';
      html += '<span class="debug-sim-tile tile-a">🥬</span><span class="debug-sim-tile tile-b">🥬</span><span class="debug-sim-tile tile-c">🥬</span>';
      html += '<span class="debug-sim-effect water">' + esc(state.effect || '💧') + '</span>';
      if (state.obstacle) html += '<span class="debug-sim-obstacle">▥</span>';
    } else if (type === 'greenhouse_sensor') {
      html += '<span class="debug-sim-actor greenhouse">⌂</span>';
      html += '<span class="debug-sim-effect weather">' + esc(state.weather || '☀') + '</span>';
      html += '<span class="debug-sim-effect sprinkler">' + esc(state.sprinkler || '💦') + '</span>';
      html += '<span class="debug-sim-effect fan">' + esc(state.fan || '◌') + '</span>';
      html += '<span class="debug-sim-effect panel">' + esc(state.panel || '?') + '</span>';
    } else if (type === 'conveyor_sorting') {
      html += '<span class="debug-sim-belt"></span>';
      html += '<span class="debug-sim-actor fruit fruit-one">' + esc(state.fruitOne || '🥭') + '</span>';
      html += '<span class="debug-sim-actor fruit fruit-two">' + esc(state.fruitTwo || '🥭') + '</span>';
      html += '<span class="debug-sim-actor fruit fruit-three">' + esc(state.fruitThree || '🥭') + '</span>';
      html += '<span class="debug-sim-crate">' + esc(state.crate || '▤') + '</span>';
      if (state.truck) html += '<span class="debug-sim-truck">🚚</span>';
    } else {
      html += '<span class="debug-sim-actor robot">🤖</span>';
      html += '<span class="debug-sim-effect panel">' + esc(state.panel || '!') + '</span>';
    }

    html += '</div>';
    html += '<div class="debug-sim-caption">' + esc(statusText) + '</div>';
    html += '</div>';
    return html;
  };

  /* ==========================================================
     SECTION 2b — Map View (Stage 12)
     ========================================================== */
  SmartFarmDebuggerLite.prototype.renderMapView = function () {
    var lv = this.level();
    var points = lv.mapPoints || [];

    var html = '<div class="debug-farm-map">';
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      var cls = 'debug-map-point';
      if (this.mapFixedPoints[p.id]) {
        cls += ' fixed';
      } else if (p.isBroken) {
        cls += ' broken';
      } else if (p.isDecoy) {
        cls += ' decoy';
      }
      if (this.activeMapPoint === p.id) cls += ' active-point';

      html += '<div class="' + cls + '" '
        + 'style="left:' + p.x + '%;top:' + p.y + '%" '
        + 'data-map-point="' + esc(p.id) + '">'
        + esc(p.icon || '📍')
        + '<div class="debug-map-label">' + esc(p.label) + '</div>'
        + '</div>';
    }
    html += '</div>';
    return html;
  };

  /* ==========================================================
     SECTION 3 — Block Panel
     ========================================================== */
  SmartFarmDebuggerLite.prototype.renderBlockPanel = function () {
    var html = '<div class="debug-block-panel">';
    html += this.renderPhaseIndicator();

    switch (this.phase) {
      case 'observe':
        html += this._renderObservePanel();
        break;
      case 'identify':
        html += this._renderIdentifyPanel();
        break;
      case 'fix':
        html += this._renderFixPanel();
        break;
      case 'test':
        html += this._renderTestPanel();
        break;
    }

    html += this.renderFeedback();
    html += this.renderHintBox();
    html += '</div>';
    return html;
  };

  /* --- phase indicator --- */
  SmartFarmDebuggerLite.prototype.renderPhaseIndicator = function () {
    var html = '<div class="debug-phase-indicator">';
    var currentIdx = PHASES.indexOf(this.phase);
    for (var i = 0; i < PHASES.length; i++) {
      var cls = 'debug-phase-step';
      if (i < currentIdx) cls += ' done';
      else if (i === currentIdx) cls += ' active';
      if (i > 0) html += '<span class="debug-phase-sep">›</span>';
      html += '<span class="' + cls + '">' + esc(PHASE_LABELS[PHASES[i]]) + '</span>';
    }
    html += '</div>';
    return html;
  };

  /* --- observe panel --- */
  SmartFarmDebuggerLite.prototype._renderObservePanel = function () {
    var lv = this.inMapSubLevel ? this._activeSubLevel() : this.level();
    var html = '';

    // Show mission text
    if (lv.missionText) {
      html += '<div class="debug-question" style="margin-bottom:14px;">' + esc(lv.missionText) + '</div>';
    }

    // Show the buggy block for observation
    html += this._renderBuggyBlockHtml(lv);

    return html;
  };

  /* --- identify panel --- */
  SmartFarmDebuggerLite.prototype._renderIdentifyPanel = function () {
    var lv = this.inMapSubLevel ? this._activeSubLevel() : this.level();
    var html = '';

    html += this._renderBuggyBlockHtml(lv);
    html += '<div class="debug-question">' + esc(lv.questionText || 'จุดไหนน่าจะผิด?') + '</div>';
    html += this.renderChoices(lv.choices ? lv.choices.bugTargetChoices : [], 'identify');

    return html;
  };

  /* --- fix panel --- */
  SmartFarmDebuggerLite.prototype._renderFixPanel = function () {
    var lv = this.inMapSubLevel ? this._activeSubLevel() : this.level();
    var html = '';

    html += this._renderBuggyBlockHtml(lv);
    html += '<div class="debug-question">' + esc(lv.fixQuestionText || 'ควรเปลี่ยนเป็นอะไร?') + '</div>';
    html += this.renderChoices(lv.choices ? lv.choices.fixChoices : [], 'fix');

    return html;
  };

  /* --- test panel --- */
  SmartFarmDebuggerLite.prototype._renderTestPanel = function () {
    var lv = this.inMapSubLevel ? this._activeSubLevel() : this.level();
    var html = '';

    // Show the corrected block
    html += '<div class="debug-block-correct">';
    html += '<div class="debug-block-correct-title">✅ บล็อกที่ซ่อมแล้ว</div>';
    if (lv.correctBlock) {
      html += this._renderRuleList(normalizeBlocks(lv.correctBlock), false);
    }
    if (!lv.correctBlock && lv.missingBlock) {
      html += this._renderRuleList(normalizeBlocks(lv.additionalBlocks), false);
      html += this._renderRuleRow(lv.missingBlock, false);
    }
    html += '</div>';

    var fb = lv.feedback || {};
    html += '<div class="debug-feedback success">';
    html += '<span class="debug-feedback-icon">🎉</span>';
    html += '<span>' + esc(fb.correct || 'ถูกต้อง!') + '</span>';
    html += '</div>';

    if (fb.afterFix) {
      html += '<div class="debug-feedback info" style="margin-top:8px;">';
      html += '<span class="debug-feedback-icon">📝</span>';
      html += '<span>' + esc(fb.afterFix) + '</span>';
      html += '</div>';
    }

    return html;
  };

  /* --- buggy block HTML --- */
  SmartFarmDebuggerLite.prototype._renderBuggyBlockHtml = function (lv) {
    var blocks = [];
    if (lv.buggyBlock) {
      blocks = normalizeBlocks(lv.buggyBlock);
    } else if (lv.additionalBlocks && lv.additionalBlocks.length > 0) {
      blocks = normalizeBlocks(lv.additionalBlocks);
    }
    if (blocks.length === 0 && !lv.missingBlock) return '';

    var html = '<div class="debug-block-buggy">';
    html += '<div class="debug-block-buggy-title">🐛 บล็อกที่มีปัญหา</div>';
    html += this._renderRuleList(blocks, true);
    if (lv.missingBlock) {
      html += '<div class="debug-missing-block">';
      html += '<div class="debug-missing-block-label">ยังขาดบล็อกนี้</div>';
      html += this._renderRuleRow(lv.missingBlock, false);
      html += '</div>';
    }
    html += '</div>';
    return html;
  };

  SmartFarmDebuggerLite.prototype._renderRuleList = function (blocks, isBuggy) {
    var html = '';
    for (var i = 0; i < blocks.length; i++) {
      html += this._renderRuleRow(blocks[i], isBuggy);
    }
    return html;
  };

  /* --- rule row (IF / ELSE / ELSE-IF block) --- */
  SmartFarmDebuggerLite.prototype._renderRuleRow = function (block, isBuggy) {
    var badgeClass = 'debug-rule-type-badge';
    var badgeText = 'ถ้า';
    if (block.type === 'else') {
      badgeClass += ' else-badge';
      badgeText = 'นอกเหนือจากนี้';
    } else if (block.type === 'else_if') {
      badgeClass += ' else-if-badge';
      badgeText = 'แต่ถ้า';
    } else {
      badgeClass += ' if-badge';
    }

    var condHighlight = (isBuggy && this.phase === 'identify') ? ' highlight' : '';
    var actHighlight = (isBuggy && this.phase === 'identify') ? ' highlight' : '';
    var actClass = isBuggy ? ' buggy-action debug-anim-pulse' : '';

    var html = '<div class="debug-rule-display">';
    html += '<span class="' + badgeClass + '">' + esc(badgeText) + '</span>';
    html += '<div class="debug-rule-body">';
    if (block.condition) {
      html += '<span class="debug-rule-condition' + condHighlight + '">' + esc(block.condition) + '</span>';
      html += '<span class="debug-rule-arrow">→</span>';
    }
    html += '<span class="debug-rule-action' + actClass + '">' + esc(block.action) + '</span>';
    html += '</div></div>';
    return html;
  };

  /* --- choice buttons --- */
  SmartFarmDebuggerLite.prototype.renderChoices = function (choices, handlerType) {
    if (!choices || choices.length === 0) return '';
    var html = '<div class="debug-choices">';
    for (var i = 0; i < choices.length; i++) {
      var c = choices[i];
      var cls = 'debug-choice-btn';
      if (this.selectedChoice === c.id) {
        cls += ' selected';
      }
      var disabled = this.choicesDisabled ? ' disabled' : '';
      html += '<button class="' + cls + '" data-choice="' + esc(c.id)
        + '" data-handler="' + handlerType + '"' + disabled + '>'
        + esc(c.label) + '</button>';
    }
    html += '</div>';
    return html;
  };

  /* --- feedback --- */
  SmartFarmDebuggerLite.prototype.renderFeedback = function () {
    if (!this.feedback) return '';
    var html = '<div class="debug-feedback ' + esc(this.feedback.type || 'info') + '">';
    html += '<span class="debug-feedback-icon">';
    switch (this.feedback.type) {
      case 'success': html += '✅'; break;
      case 'error':   html += '❌'; break;
      case 'warning': html += '⚠️'; break;
      default:        html += 'ℹ️'; break;
    }
    html += '</span>';
    html += '<span>' + esc(this.feedback.text) + '</span>';
    html += '</div>';
    return html;
  };

  /* --- hint box --- */
  SmartFarmDebuggerLite.prototype.renderHintBox = function () {
    if (this.hintIdx < 0) return '';
    var lv = this.inMapSubLevel ? this._activeSubLevel() : this.level();
    var hints = lv.hints || [];
    if (this.hintIdx >= hints.length) return '';

    var html = '<div class="debug-hint-box">';
    html += '<div class="debug-hint-header">';
    html += '<span style="font-weight:700;color:#92400e;">คำใบ้</span>';
    html += '<span class="debug-hint-level">' + (this.hintIdx + 1) + '/' + hints.length + '</span>';
    html += '</div>';
    html += '<div class="debug-hint-text">' + esc(hints[this.hintIdx]) + '</div>';
    html += '</div>';
    return html;
  };

  /* ==========================================================
     SECTION 4 — Control Panel
     ========================================================== */
  SmartFarmDebuggerLite.prototype.renderControlPanel = function () {
    var html = '<div class="debug-control-panel">';
    var lv = this.level();
    var isMap = lv.sceneType === 'farm_map' && !this.inMapSubLevel;

    switch (this.phase) {
      case 'observe':
        html += '<button class="debug-btn debug-btn-ghost" data-action="replay">🔄 ดูอาการซ้ำ</button>';
        html += '<span class="debug-control-spacer"></span>';
        html += '<button class="debug-btn debug-btn-hint" data-action="hint">ขอคำใบ้</button>';
        html += '<button class="debug-btn debug-btn-primary" data-action="go-identify">หาบั๊ก →</button>';
        break;
      case 'identify':
        html += '<button class="debug-btn debug-btn-ghost" data-action="replay">🔄 ดูอาการซ้ำ</button>';
        html += '<span class="debug-control-spacer"></span>';
        html += '<button class="debug-btn debug-btn-hint" data-action="hint">ขอคำใบ้</button>';
        break;
      case 'fix':
        html += '<button class="debug-btn debug-btn-ghost" data-action="replay">🔄 ดูอาการซ้ำ</button>';
        html += '<span class="debug-control-spacer"></span>';
        html += '<button class="debug-btn debug-btn-hint" data-action="hint">ขอคำใบ้</button>';
        break;
      case 'test':
        if (this.inMapSubLevel) {
          html += '<button class="debug-btn debug-btn-success" data-action="back-to-map">✅ กลับดูแผนที่</button>';
        } else if (this.levelIdx < this.levels.length - 1) {
          html += '<button class="debug-btn debug-btn-success" data-action="next-level">ด่านถัดไป →</button>';
        } else {
          html += '<button class="debug-btn debug-btn-success" data-action="finish">🏆 จบภารกิจ</button>';
        }
        break;
    }

    html += '</div>';
    return html;
  };

  /* ==========================================================
     EVENT BINDING
     ========================================================== */
  SmartFarmDebuggerLite.prototype.bindEvents = function () {
    var self = this;
    var shell = el(this.shellId);
    if (!shell) return;

    // Choice buttons
    var choiceBtns = shell.querySelectorAll('.debug-choice-btn');
    for (var i = 0; i < choiceBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          if (btn.disabled) return;
          var choiceId = btn.getAttribute('data-choice');
          var handler = btn.getAttribute('data-handler');
          if (handler === 'identify') {
            self.handleIdentify(choiceId, btn);
          } else if (handler === 'fix') {
            self.handleFix(choiceId, btn);
          }
        });
      })(choiceBtns[i]);
    }

    // Control buttons
    var actionBtns = shell.querySelectorAll('[data-action]');
    for (var j = 0; j < actionBtns.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var action = btn.getAttribute('data-action');
          switch (action) {
            case 'replay':       self.handleReplay(); break;
            case 'go-identify':  self.handleObserve(); break;
            case 'hint':         self.showHint(); break;
            case 'next-level':   self.nextLevel(); break;
            case 'finish':       self.finishGame(); break;
            case 'back-to-map':  self.handleBackToMap(); break;
          }
        });
      })(actionBtns[j]);
    }

    // Map points
    var mapPts = shell.querySelectorAll('[data-map-point]');
    for (var k = 0; k < mapPts.length; k++) {
      (function (ptEl) {
        ptEl.addEventListener('click', function () {
          var pid = ptEl.getAttribute('data-map-point');
          self.handleMapPointClick(pid);
        });
      })(mapPts[k]);
    }
  };

  /* ==========================================================
     GAME LOGIC
     ========================================================== */

  /* --- observe → identify --- */
  SmartFarmDebuggerLite.prototype.handleObserve = function () {
    devLog('handleObserve → identify');
    this.phase = 'identify';
    this.feedback = null;
    this.selectedChoice = null;
    this.choicesDisabled = false;
    this.render();
  };

  /* --- replay --- */
  SmartFarmDebuggerLite.prototype.handleReplay = function () {
    devLog('handleReplay');
    var prevPhase = this.phase;
    this.phase = 'observe';
    this.feedback = null;
    this.render();

    // Auto-return to previous phase after a brief view
    var self = this;
    if (prevPhase !== 'observe') {
      window.setTimeout(function () {
        self.phase = prevPhase;
        self.render();
      }, 2200);
    }
  };

  /* --- identify answer --- */
  SmartFarmDebuggerLite.prototype.handleIdentify = function (choiceId, btnEl) {
    var lv = this.inMapSubLevel ? this._activeSubLevel() : this.level();
    var answer = lv.answer || {};
    this.state.attempts++;
    this.selectedChoice = choiceId;

    if (choiceId === answer.bugTarget) {
      devLog('identify correct');
      this.feedback = { type: 'success', text: 'ถูกต้อง! เจอจุดผิดแล้ว' };
      this.choicesDisabled = true;
      if (btnEl) btnEl.classList.add('correct');
      var self = this;
      window.setTimeout(function () {
        self.phase = 'fix';
        self.feedback = null;
        self.selectedChoice = null;
        self.choicesDisabled = false;
        self.render();
      }, 1200);
    } else {
      devLog('identify wrong');
      this.state.wrongTargets++;
      var fb = (lv.feedback || {}).wrongTarget || 'ยังไม่ใช่จุดนี้ ลองดูใหม่นะ';
      this.feedback = { type: 'error', text: fb };
      if (btnEl) {
        btnEl.classList.add('wrong');
        var self2 = this;
        window.setTimeout(function () {
          btnEl.classList.remove('wrong');
          self2.selectedChoice = null;
          self2.render();
        }, 800);
      }
      this.render();
    }
  };

  /* --- fix answer --- */
  SmartFarmDebuggerLite.prototype.handleFix = function (choiceId, btnEl) {
    var lv = this.inMapSubLevel ? this._activeSubLevel() : this.level();
    var answer = lv.answer || {};
    this.state.attempts++;
    this.selectedChoice = choiceId;

    if (choiceId === answer.fixChoice) {
      devLog('fix correct');
      var fb = (lv.feedback || {}).correct || 'ถูกต้อง! ซ่อมเสร็จแล้ว';
      this.feedback = { type: 'success', text: fb };
      this.choicesDisabled = true;
      if (btnEl) btnEl.classList.add('correct');
      var self = this;
      window.setTimeout(function () {
        self.handleTest();
      }, 1300);
    } else {
      devLog('fix wrong');
      this.state.wrongFixes++;
      var fbText = (lv.feedback || {}).wrongFix || 'ยังไม่ถูก ลองคิดใหม่นะ';
      this.feedback = { type: 'error', text: fbText };
      if (btnEl) {
        btnEl.classList.add('wrong');
        var self2 = this;
        window.setTimeout(function () {
          btnEl.classList.remove('wrong');
          self2.selectedChoice = null;
          self2.render();
        }, 800);
      }
      this.render();
    }
  };

  /* --- test phase --- */
  SmartFarmDebuggerLite.prototype.handleTest = function () {
    devLog('handleTest');
    this.phase = 'test';
    this.feedback = null;
    this.selectedChoice = null;
    this.choicesDisabled = false;
    this.playFixedAnimation();
    this.render();
  };

  /* ==========================================================
     MAP MODE (Stage 12)
     ========================================================== */
  SmartFarmDebuggerLite.prototype.handleMapPointClick = function (pointId) {
    var lv = this.level();
    var points = lv.mapPoints || [];
    var point = null;
    for (var i = 0; i < points.length; i++) {
      if (points[i].id === pointId) { point = points[i]; break; }
    }
    if (!point) return;

    // Already fixed
    if (this.mapFixedPoints[pointId]) {
      this.feedback = { type: 'info', text: 'จุดนี้ซ่อมเรียบร้อยแล้ว ✅' };
      this.render();
      return;
    }

    // Decoy point
    if (point.isDecoy) {
      this.feedback = { type: 'warning', text: point.decoyMessage || 'จุดนี้ไม่มีปัญหานะ ลองดูจุดอื่น' };
      this.render();
      return;
    }

    // Broken point — enter sub-level
    if (point.isBroken && point.subLevel) {
      devLog('entering map sub-level', pointId);
      this.activeMapPoint = pointId;
      this.inMapSubLevel = true;
      this.phase = 'observe';
      this.feedback = null;
      this.hintIdx = -1;
      this.selectedChoice = null;
      this.choicesDisabled = false;
      this.render();
    }
  };

  SmartFarmDebuggerLite.prototype._activeSubLevel = function () {
    if (!this.activeMapPoint) return this.level();
    var lv = this.level();
    var points = lv.mapPoints || [];
    for (var i = 0; i < points.length; i++) {
      if (points[i].id === this.activeMapPoint && points[i].subLevel) {
        return points[i].subLevel;
      }
    }
    return this.level();
  };

  SmartFarmDebuggerLite.prototype.handleBackToMap = function () {
    devLog('back to map');
    if (this.activeMapPoint) {
      this.completeMapPoint(this.activeMapPoint);
    }
    this.inMapSubLevel = false;
    this.activeMapPoint = null;
    this.phase = 'observe';
    this.feedback = null;
    this.hintIdx = -1;

    if (this.checkMapComplete()) {
      devLog('map complete');
      // Move to next level or finish
      if (this.levelIdx < this.levels.length - 1) {
        this.nextLevel();
      } else {
        this.finishGame();
      }
    } else {
      this.render();
    }
  };

  SmartFarmDebuggerLite.prototype.completeMapPoint = function (pointId) {
    devLog('completeMapPoint', pointId);
    this.mapFixedPoints[pointId] = true;
  };

  SmartFarmDebuggerLite.prototype.checkMapComplete = function () {
    var lv = this.level();
    var points = lv.mapPoints || [];
    for (var i = 0; i < points.length; i++) {
      if (points[i].isBroken && !this.mapFixedPoints[points[i].id]) {
        return false;
      }
    }
    return true;
  };

  /* ==========================================================
     HINTS
     ========================================================== */
  SmartFarmDebuggerLite.prototype.showHint = function () {
    var lv = this.inMapSubLevel ? this._activeSubLevel() : this.level();
    var hints = lv.hints || [];
    if (hints.length === 0) return;

    this.hintIdx++;
    if (this.hintIdx >= hints.length) {
      this.hintIdx = hints.length - 1; // stay at last hint
    }
    this.state.hintsUsed++;
    devLog('showHint', this.hintIdx, '/', hints.length);
    this.render();
  };

  /* ==========================================================
     FARM ANIMATIONS
     ========================================================== */
  SmartFarmDebuggerLite.prototype.playBrokenAnimation = function () {
    var shell = el(this.shellId);
    if (!shell) return;
    var overlay = shell.querySelector('.debug-farm-overlay');
    if (overlay) {
      overlay.classList.remove('fixed');
      overlay.classList.add('broken');
    }
    var objects = shell.querySelectorAll('.debug-object');
    for (var i = 0; i < objects.length; i++) {
      objects[i].classList.add('debug-anim-bounce');
    }
  };

  SmartFarmDebuggerLite.prototype.playFixedAnimation = function () {
    var shell = el(this.shellId);
    if (!shell) return;
    var overlay = shell.querySelector('.debug-farm-overlay');
    if (overlay) {
      overlay.classList.remove('broken');
      overlay.classList.add('fixed');
    }
    var objects = shell.querySelectorAll('.debug-object');
    for (var i = 0; i < objects.length; i++) {
      objects[i].classList.remove('debug-anim-bounce');
      objects[i].classList.add('debug-anim-glow');
    }
  };

  /* ==========================================================
     NAVIGATION
     ========================================================== */
  SmartFarmDebuggerLite.prototype.nextLevel = function () {
    devLog('nextLevel');
    this.levelIdx++;
    if (this.levelIdx >= this.levels.length) {
      this.finishGame();
      return;
    }
    // Reset map state for new level
    this.mapFixedPoints = {};
    this.loadLevel();
  };

  /* ==========================================================
     FINISH
     ========================================================== */
  SmartFarmDebuggerLite.prototype.finishGame = function () {
    if (this.state.ended) return;
    this.state.ended = true;
    devLog('finishGame');

    var duration = Math.max(1, Math.floor((Date.now() - this.state.startedAt) / 1000));
    var stars = starsFromState(this.state);
    var totalAttempts = this.state.attempts;
    var detail = {
      game_id: 4,
      stage_id: window.STAGE_ID || null,
      level_ids: this.levels.map(function (level) { return level.levelId || ''; }),
      bug_types: this.levels.map(function (level) { return level.bugType || ''; }),
      wrong_targets: this.state.wrongTargets,
      wrong_fixes: this.state.wrongFixes,
      hints_used: this.state.hintsUsed
    };

    // Build star display
    var starsHtml = '';
    for (var i = 0; i < 3; i++) {
      if (i < stars) {
        starsHtml += '<span class="star-earned" style="animation:debugStarPop .4s ease ' + (i * 0.2) + 's both;">★</span>';
      } else {
        starsHtml += '<span class="star-empty">☆</span>';
      }
    }

    // Build time display
    var mins = Math.floor(duration / 60);
    var secs = duration % 60;
    var timeStr = mins > 0 ? (mins + ' นาที ' + secs + ' วินาที') : (secs + ' วินาที');

    var overlay = document.createElement('div');
    overlay.className = 'debug-summary';
    overlay.innerHTML =
      '<div class="debug-summary-card debug-anim-fade-in">'
      + '<h3 class="debug-summary-title">🎉 ภารกิจซ่อมฟาร์มสำเร็จ!</h3>'
      + '<p class="debug-summary-subtitle">หนูซ่อมระบบฟาร์มได้ครบทุกด่านแล้ว</p>'
      + '<div class="debug-summary-stars">' + starsHtml + '</div>'
      + '<div class="debug-summary-stats">'
      +   '<div class="debug-summary-stat">'
      +     '<span class="debug-summary-stat-value">' + timeStr + '</span>'
      +     '<span class="debug-summary-stat-label">⏱ เวลาที่ใช้</span>'
      +   '</div>'
      +   '<div class="debug-summary-stat">'
      +     '<span class="debug-summary-stat-value">' + totalAttempts + '</span>'
      +     '<span class="debug-summary-stat-label">🔧 จำนวนครั้งที่ลอง</span>'
      +   '</div>'
      +   '<div class="debug-summary-stat">'
      +     '<span class="debug-summary-stat-value">' + this.state.hintsUsed + '</span>'
      +     '<span class="debug-summary-stat-label">💡 คำใบ้ที่ใช้</span>'
      +   '</div>'
      + '</div>'
      + '</div>';

    document.body.appendChild(overlay);
    this.summaryAdded = true;

    // Send result after delay
    window.setTimeout(function () {
      if (typeof window.sendResult === 'function') {
        window.sendResult(window.STAGE_ID, stars, duration, totalAttempts, detail);
      }
    }, 1800);
  };

  /* ==========================================================
     HELPER — escapeHtml (exposed on prototype)
     ========================================================== */
  SmartFarmDebuggerLite.prototype.escapeHtml = function (str) {
    return esc(str);
  };

  /* ==========================================================
     CLEANUP
     ========================================================== */
  SmartFarmDebuggerLite.prototype.destroy = function () {
    var root = el(this.rootId);
    if (root && root.parentNode) {
      root.parentNode.removeChild(root);
    }
    if (this.summaryAdded) {
      var summaries = document.querySelectorAll('.debug-summary');
      for (var i = 0; i < summaries.length; i++) {
        if (summaries[i].parentNode) {
          summaries[i].parentNode.removeChild(summaries[i]);
        }
      }
    }
  };

  /* ==========================================================
     EXPORT
     ========================================================== */
  if (typeof window.FarmMissions === 'undefined') {
    window.FarmMissions = {};
  }

  window.FarmMissions.smartFarmDebuggerLite = function (config) {
    devLog('factory called');
    var game = new SmartFarmDebuggerLite(config);
    game.boot();
    return game;
  };

})();
