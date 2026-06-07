/* ==========================================================
   Smart Farm Debugger Lite
   Chapter 4 condition-table debugging game for Grade 4
   ========================================================== */
;(function () {
  'use strict';

  var ICONS = {
    dry_soil: '🟫',
    moist_soil: '🟩',
    crop_wilted: '🥀',
    crop_ok: '🥬',
    water_off: '🚱',
    water_on: '💧',
    sun: '☀️',
    shade_off: '▱',
    shade_on: '⛱️',
    mango_tree: '🥭',
    robot_idle: '🤖',
    robot_work: '🦾',
    basket_empty: '🧺',
    basket_full: '🧺',
    rain: '🌧️',
    chicken: '🐔',
    door_open: '🚪',
    door_closed: '🔒',
    fruit_yellow: '🍋',
    fruit_green: '🍏',
    crate: '📦',
    sorter: '🔎',
    thermometer: '🌡️',
    fan_off: '◌',
    fan_on: '🌀',
    panel_red: '🔴',
    panel_green: '🟢',
    farm: '🌾'
  };

  var STATE_LABELS = {
    normal: 'ปกติ',
    warning: 'ต้องสังเกต',
    error: 'ผิดปกติ',
    success: 'แก้แล้ว'
  };

  function esc(value) {
    if (value === null || value === undefined) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(value)));
    return div.innerHTML;
  }

  function el(id) {
    return document.getElementById(id);
  }

  function uid() {
    return 'dbg_' + Math.random().toString(36).slice(2, 9);
  }

  function asArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.additionalBlocks)) return value.additionalBlocks;
    return [value];
  }

  function ruleToText(rule) {
    var blocks = asArray(rule);
    if (!blocks.length && typeof rule === 'string') return rule;
    return blocks.map(function (block) {
      if (typeof block === 'string') return block;
      var type = block.type === 'else' ? 'มิฉะนั้น' : (block.type === 'else_if' ? 'มิฉะนั้นถ้า' : 'ถ้า');
      if (block.condition) return type + ' ' + block.condition + ' → ' + block.action;
      return type + ' → ' + block.action;
    }).join('\n');
  }

  function iconFor(cell) {
    if (!cell) return ICONS.farm;
    if (cell.emoji) return cell.emoji;
    if (cell.icon && ICONS[cell.icon]) return ICONS[cell.icon];
    return cell.icon || ICONS.farm;
  }

  function starsFromScore(score) {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score >= 50) return 1;
    return 0;
  }

  function scoreLevel(stats) {
    var score = 60;
    if (stats.wrong === 0) score += 20;
    if (stats.hints === 0) score += 10;
    else if (stats.hints === 1) score += 6;
    else if (stats.hints === 2) score += 3;
    if (stats.tested) score += 10;
    score -= Math.max(0, stats.wrong - 1) * 5;
    return Math.max(0, Math.min(100, score));
  }

  function legacyCells(level, fixed) {
    var objects = level.objects || [];
    if (!objects.length) {
      return [
        { key: 'problem', label: level.problemText || 'อาการผิดปกติ', icon: fixed ? 'panel_green' : 'panel_red', state: fixed ? 'success' : 'error' },
        { key: 'rule', label: fixed ? 'ระบบทำงานถูกต้อง' : 'ระบบยังมีบั๊ก', icon: fixed ? 'farm' : 'panel_red', state: fixed ? 'success' : 'warning' }
      ];
    }
    return objects.map(function (obj) {
      return {
        key: obj.id || obj.label,
        label: obj.label || '',
        icon: obj.fallbackIcon || (fixed ? 'panel_green' : 'panel_red'),
        state: fixed ? 'success' : 'warning'
      };
    });
  }

  function normalizeLevel(raw) {
    var level = raw || {};
    var fixChoices = level.choices && Array.isArray(level.choices.fixChoices)
      ? level.choices.fixChoices.map(function (choice) {
        return {
          id: choice.id,
          text: choice.text || choice.label,
          correct: choice.id === (level.answer || {}).fixChoice,
          feedback: choice.id === (level.answer || {}).fixChoice
            ? ((level.feedback || {}).correct || 'ถูกต้อง')
            : ((level.feedback || {}).wrongFix || 'ยังไม่ถูก ลองดูสถานการณ์อีกครั้ง')
        };
      })
      : null;

    var choices = Array.isArray(level.choices) ? level.choices : (fixChoices || []);
    var correctChoice = choices.filter(function (choice) { return choice.correct; })[0] || {};
    var stageId = level.stageId || (String(level.levelId || level.id || '').split('-')[0]);

    return {
      id: level.id || level.levelId || '',
      stageId: stageId,
      title: level.title || '',
      concept: level.concept || level.bugType || 'Debug',
      mission: level.mission || level.missionText || '',
      problem: level.problem || level.problemText || '',
      buggyRule: level.buggyRule || ruleToText(level.buggyBlock || level.additionalBlocks),
      correctRule: level.correctRule || ruleToText(level.correctBlock || level.missingBlock) || correctChoice.text || '',
      question: level.question || level.fixQuestionText || level.questionText || 'ควรแก้เงื่อนไขอย่างไร',
      choices: choices,
      farmCells: level.farmCells || legacyCells(level, false),
      fixedCells: level.fixedCells || legacyCells(level, true),
      resultText: level.resultText || ((level.feedback || {}).afterFix) || 'ระบบฟาร์มกลับมาทำงานถูกต้องแล้ว',
      hints: level.hints || [],
      feedback: level.feedback || {},
      knowledge: level.knowledge || ''
    };
  }

  function SmartFarmDebuggerLite(config) {
    this.cfg = config || {};
    this.levels = (this.cfg.levels || []).map(normalizeLevel);
    this.levelIdx = 0;
    this.selectedChoice = null;
    this.tested = false;
    this.feedback = null;
    this.hintIdx = -1;
    this.rootId = 'debug-root-' + uid();
    this.shellId = 'debug-shell-' + uid();
    this.startedAt = Date.now();
    this.summaryAdded = false;
    this.levelStats = this.levels.map(function () {
      return { attempts: 0, wrong: 0, hints: 0, tested: false, score: 0 };
    });
  }

  SmartFarmDebuggerLite.prototype.level = function () {
    return this.levels[this.levelIdx] || normalizeLevel({});
  };

  SmartFarmDebuggerLite.prototype.stats = function () {
    return this.levelStats[this.levelIdx] || { attempts: 0, wrong: 0, hints: 0, tested: false, score: 0 };
  };

  SmartFarmDebuggerLite.prototype.boot = function () {
    var mount = document.getElementById('game-container') || document.getElementById('game-area') || document.body;
    var root = document.createElement('div');
    root.id = this.rootId;
    mount.appendChild(root);
    this.render();
  };

  SmartFarmDebuggerLite.prototype.render = function () {
    var root = el(this.rootId);
    if (!root) return;

    var level = this.level();
    var progress = (this.levelIdx + 1) + '/' + this.levels.length;
    var score = this.tested ? this.stats().score : scoreLevel(this.stats());

    root.innerHTML =
      '<div id="' + this.shellId + '" class="debug-game-shell debug-condition-mode">'
      +   '<div class="debug-lesson-layout">'
      +     '<section class="debug-game-panel">'
      +       this.renderStageHeader(level, progress, score)
      +       this.renderFarmGrid(level)
      +       this.renderSimulationResult(level)
      +     '</section>'
      +     '<section class="debug-fix-panel">'
      +       this.renderMissionPanel(level)
      +       this.renderBugRule(level)
      +       this.renderChoiceList(level)
      +       this.renderActions()
      +       this.renderFeedback()
      +       this.renderHintBox(level)
      +     '</section>'
      +   '</div>'
      + '</div>';

    this.bindEvents();
  };

  SmartFarmDebuggerLite.prototype.renderStageHeader = function (level, progress, score) {
    return '<header class="debug-stage-header">'
      + '<div>'
      +   '<div class="debug-stage-kicker">ด่านย่อย ' + esc(level.id || progress) + '</div>'
      +   '<h3 class="debug-stage-title">' + esc(level.title || this.cfg.title || '') + '</h3>'
      + '</div>'
      + '<div class="debug-stage-meta">'
      +   '<span class="debug-concept-badge">' + esc(level.concept) + '</span>'
      +   '<span class="debug-progress-badge">' + esc(progress) + '</span>'
      +   '<span class="debug-score-badge">' + this.renderStars(starsFromScore(score)) + '</span>'
      + '</div>'
      + '</header>';
  };

  SmartFarmDebuggerLite.prototype.renderStars = function (count) {
    var html = '';
    for (var i = 0; i < 3; i++) {
      html += '<span class="' + (i < count ? 'is-earned' : '') + '">★</span>';
    }
    return html;
  };

  SmartFarmDebuggerLite.prototype.renderFarmGrid = function (level) {
    var cells = this.tested ? level.fixedCells : level.farmCells;
    var html = '<div class="farm-grid" aria-live="polite">';
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var state = cell.state || 'normal';
      html += '<div class="farm-cell is-' + esc(state) + (this.tested ? ' is-tested' : '') + '">'
        + '<div class="farm-cell-icon">' + esc(iconFor(cell)) + '</div>'
        + '<div class="farm-cell-label">' + esc(cell.label || '') + '</div>'
        + '<div class="farm-cell-state">' + esc(cell.status || STATE_LABELS[state] || '') + '</div>'
        + '</div>';
    }
    html += '</div>';
    return html;
  };

  SmartFarmDebuggerLite.prototype.renderSimulationResult = function (level) {
    var text = this.tested ? level.resultText : (level.problem || 'สังเกตอาการในตารางฟาร์ม แล้วเลือกวิธีแก้');
    var cls = this.tested ? 'is-success' : 'is-warning';
    return '<div class="simulation-result ' + cls + '">' + esc(text) + '</div>';
  };

  SmartFarmDebuggerLite.prototype.renderMissionPanel = function (level) {
    return '<div class="mission-card">'
      + '<div class="debug-panel-label">ภารกิจ</div>'
      + '<div class="debug-panel-text">' + esc(level.mission) + '</div>'
      + '<div class="debug-panel-label">อาการผิดปกติ</div>'
      + '<div class="debug-panel-text">' + esc(level.problem) + '</div>'
      + '<div class="debug-panel-label">คำถามนำคิด</div>'
      + '<div class="debug-panel-text">' + esc(level.question) + '</div>'
      + '</div>';
  };

  SmartFarmDebuggerLite.prototype.renderBugRule = function (level) {
    var fixed = this.tested;
    return '<div class="bug-rule-card ' + (fixed ? 'is-fixed' : '') + '">'
      + '<div class="debug-panel-label">' + (fixed ? 'เงื่อนไขหลังแก้' : 'เงื่อนไขที่มีบั๊ก') + '</div>'
      + '<pre class="debug-rule-pre">' + esc(fixed ? level.correctRule : level.buggyRule) + '</pre>'
      + '</div>';
  };

  SmartFarmDebuggerLite.prototype.renderChoiceList = function (level) {
    if (this.tested) {
      return '<div class="debug-knowledge-card">'
        + '<div class="debug-panel-label">ความรู้ที่ได้</div>'
        + '<div>' + esc(level.knowledge || 'การ Debug ต้องสังเกตผลลัพธ์ ทดสอบ และปรับเงื่อนไขให้ตรงกับสถานการณ์') + '</div>'
        + '</div>';
    }

    var html = '<div class="choice-list">';
    for (var i = 0; i < level.choices.length; i++) {
      var choice = level.choices[i];
      var cls = 'choice-btn';
      if (this.selectedChoice === choice.id) cls += ' is-selected';
      html += '<button class="' + cls + '" data-choice="' + esc(choice.id) + '">'
        + '<span class="choice-id">' + esc(choice.id || String.fromCharCode(65 + i)) + '</span>'
        + '<span class="choice-text">' + esc(choice.text || choice.label || '') + '</span>'
        + '</button>';
    }
    html += '</div>';
    return html;
  };

  SmartFarmDebuggerLite.prototype.renderActions = function () {
    if (this.tested) {
      if (this.levelIdx < this.levels.length - 1) {
        return '<div class="debug-actions"><button class="debug-btn debug-btn-success" data-action="next-level">ด่านถัดไป</button></div>';
      }
      return '<div class="debug-actions"><button class="debug-btn debug-btn-success" data-action="finish">จบภารกิจ</button></div>';
    }

    return '<div class="debug-actions">'
      + '<button class="debug-btn debug-btn-primary" data-action="test" ' + (this.selectedChoice ? '' : 'disabled') + '>ทดสอบระบบ</button>'
      + '<button class="debug-btn debug-btn-hint" data-action="hint">ขอคำใบ้</button>'
      + '</div>';
  };

  SmartFarmDebuggerLite.prototype.renderFeedback = function () {
    if (!this.feedback) return '';
    return '<div class="feedback-card is-' + esc(this.feedback.type || 'info') + '">'
      + esc(this.feedback.text || '')
      + '</div>';
  };

  SmartFarmDebuggerLite.prototype.renderHintBox = function (level) {
    if (this.hintIdx < 0 || !level.hints[this.hintIdx]) return '';
    return '<div class="debug-hint-box">'
      + '<div class="debug-hint-header"><span>คำใบ้</span><span>' + (this.hintIdx + 1) + '/' + level.hints.length + '</span></div>'
      + '<div class="debug-hint-text">' + esc(level.hints[this.hintIdx]) + '</div>'
      + '</div>';
  };

  SmartFarmDebuggerLite.prototype.bindEvents = function () {
    var self = this;
    var shell = el(this.shellId);
    if (!shell) return;

    var choices = shell.querySelectorAll('[data-choice]');
    for (var i = 0; i < choices.length; i++) {
      choices[i].addEventListener('click', function () {
        self.selectedChoice = this.getAttribute('data-choice');
        self.feedback = null;
        self.render();
      });
    }

    var actions = shell.querySelectorAll('[data-action]');
    for (var j = 0; j < actions.length; j++) {
      actions[j].addEventListener('click', function () {
        var action = this.getAttribute('data-action');
        if (action === 'test') self.handleTest();
        if (action === 'hint') self.showHint();
        if (action === 'next-level') self.nextLevel();
        if (action === 'finish') self.finishGame();
      });
    }
  };

  SmartFarmDebuggerLite.prototype.handleTest = function () {
    var level = this.level();
    var stats = this.stats();
    var choice = null;

    for (var i = 0; i < level.choices.length; i++) {
      if (level.choices[i].id === this.selectedChoice) {
        choice = level.choices[i];
        break;
      }
    }
    if (!choice) return;

    stats.attempts++;
    if (choice.correct) {
      stats.tested = true;
      stats.score = scoreLevel(stats);
      this.tested = true;
      this.feedback = {
        type: 'success',
        text: choice.feedback || (level.feedback && level.feedback.correct) || 'ถูกต้อง! ซ่อมสำเร็จ'
      };
    } else {
      stats.wrong++;
      this.feedback = {
        type: 'error',
        text: choice.feedback || (level.feedback && level.feedback.wrongFix) || 'ยังไม่ถูก ลองดูสถานการณ์ในตารางฟาร์มอีกครั้ง'
      };
    }
    this.render();
  };

  SmartFarmDebuggerLite.prototype.showHint = function () {
    var level = this.level();
    if (!level.hints.length) return;
    this.hintIdx = Math.min(this.hintIdx + 1, level.hints.length - 1);
    this.stats().hints++;
    this.render();
  };

  SmartFarmDebuggerLite.prototype.nextLevel = function () {
    this.levelIdx++;
    this.selectedChoice = null;
    this.tested = false;
    this.feedback = null;
    this.hintIdx = -1;
    this.render();
  };

  SmartFarmDebuggerLite.prototype.finishGame = function () {
    if (this.summaryAdded) return;
    var duration = Math.max(1, Math.floor((Date.now() - this.startedAt) / 1000));
    var totalAttempts = 0;
    var totalHints = 0;
    var totalWrong = 0;
    var totalScore = 0;

    for (var i = 0; i < this.levelStats.length; i++) {
      var stats = this.levelStats[i];
      totalAttempts += stats.attempts;
      totalHints += stats.hints;
      totalWrong += stats.wrong;
      totalScore += stats.score || scoreLevel(stats);
    }

    var averageScore = this.levelStats.length ? Math.round(totalScore / this.levelStats.length) : 0;
    var stars = starsFromScore(averageScore);
    var detail = {
      game_id: 4,
      stage_id: window.STAGE_ID || null,
      average_score: averageScore,
      level_ids: this.levels.map(function (level) { return level.id; }),
      attempts_by_level: this.levelStats.map(function (stats) { return stats.attempts; }),
      wrong_by_level: this.levelStats.map(function (stats) { return stats.wrong; }),
      hints_by_level: this.levelStats.map(function (stats) { return stats.hints; })
    };

    var overlay = document.createElement('div');
    overlay.className = 'debug-summary';
    overlay.innerHTML =
      '<div class="debug-summary-card">'
      + '<h3 class="debug-summary-title">ภารกิจซ่อมฟาร์มสำเร็จ!</h3>'
      + '<p class="debug-summary-subtitle">แก้ระบบเงื่อนไขครบทุกด่านแล้ว</p>'
      + '<div class="debug-summary-stars">' + this.renderStars(stars) + '</div>'
      + '<div class="debug-summary-stats">'
      +   '<div><strong>' + averageScore + '</strong><span>คะแนนเฉลี่ย</span></div>'
      +   '<div><strong>' + totalAttempts + '</strong><span>ครั้งที่ทดสอบ</span></div>'
      +   '<div><strong>' + totalHints + '</strong><span>คำใบ้</span></div>'
      + '</div>'
      + '</div>';
    document.body.appendChild(overlay);
    this.summaryAdded = true;

    window.setTimeout(function () {
      if (typeof window.sendResult === 'function') {
        window.sendResult(window.STAGE_ID, stars, duration, totalAttempts || 1, detail);
      }
    }, 1200);
  };

  SmartFarmDebuggerLite.prototype.destroy = function () {
    var root = el(this.rootId);
    if (root && root.parentNode) root.parentNode.removeChild(root);
    var summaries = document.querySelectorAll('.debug-summary');
    for (var i = 0; i < summaries.length; i++) {
      if (summaries[i].parentNode) summaries[i].parentNode.removeChild(summaries[i]);
    }
  };

  if (typeof window.FarmMissions === 'undefined') {
    window.FarmMissions = {};
  }

  window.FarmMissions.smartFarmDebuggerLite = function (config) {
    var game = new SmartFarmDebuggerLite(config);
    game.boot();
    return game;
  };
})();
