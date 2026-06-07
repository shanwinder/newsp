;(function () {
  'use strict';

  const PRESETS = {
    muddy_carrot: {
      title: 'แครอทเลอะไม่ถูกล้าง',
      theme: 'vegetable_repair',
      themeLabel: 'แปลงผัก',
      problemText: 'แครอทเปื้อนโคลนหลุดผ่านเครื่องล้าง',
      missionText: 'ซ่อมคำสั่งให้แครอทเปื้อนโคลนถูกส่งเข้าเครื่องล้าง',
      bugTarget: 'action',
      correctFix: 'wash',
      bugTargetChoices: [
        { id: 'condition', label: 'เงื่อนไข' },
        { id: 'action', label: 'คำสั่ง' }
      ],
      fixChoices: [
        { id: 'pass', label: 'ปล่อยผ่าน' },
        { id: 'wash', label: 'ส่งเข้าเครื่องล้าง' }
      ],
      buggyBlock: { condition: 'แครอทเปื้อนโคลน', action: 'ปล่อยผ่าน', type: 'if' },
      correctBlock: { condition: 'แครอทเปื้อนโคลน', action: 'ส่งเข้าเครื่องล้าง', type: 'if' },
      simulation: {
        type: 'conveyor_sorting',
        broken: { caption: 'แครอทเลอะหลุดผ่านเครื่องล้าง', fruitOne: '🥕', fruitTwo: '🥕', fruitThree: ' ', crate: 'เลอะ' },
        fixed: { caption: 'แครอทเลอะถูกส่งเข้าเครื่องล้างแล้ว', fruitOne: '🥕', fruitTwo: '💧', fruitThree: '🥕', crate: 'สะอาด' }
      },
      objects: [
        { id: 'dirty_carrot', label: 'แครอทเลอะ', fallbackIcon: '🥕', anchor: 'cropBed' },
        { id: 'washer', label: 'เครื่องล้าง', fallbackIcon: '💧', anchor: 'washer' }
      ],
      feedback: {
        correct: 'ถูกต้อง! แครอทเปื้อนโคลนต้องเข้าเครื่องล้าง',
        wrongTarget: 'ลองดูว่าระบบสั่งให้แครอทไปไหน',
        wrongFix: 'แครอทเลอะต้องถูกล้างก่อน',
        afterFix: 'เมื่อเปลี่ยนคำสั่งเป็นส่งเข้าเครื่องล้าง แครอทเปื้อนโคลนก็ถูกล้างแล้ว'
      },
      hints: ['ดูปลายทางของแครอทเลอะ', 'บั๊กอยู่ที่คำสั่ง', 'เลือกส่งเข้าเครื่องล้าง']
    },
    rain_sprinkler: {
      title: 'ฝนตกแต่สปริงเกอร์ยังเปิด',
      theme: 'greenhouse_repair',
      themeLabel: 'โรงเรือน',
      problemText: 'ฝนตกแล้ว แต่สปริงเกอร์ยังเปิดจนน้ำท่วมแปลง',
      missionText: 'ซ่อมลำดับเงื่อนไขให้ระบบตรวจฝนก่อน',
      bugTarget: 'order',
      correctFix: 'rain_first',
      bugTargetChoices: [
        { id: 'order', label: 'ลำดับเงื่อนไข' },
        { id: 'action', label: 'คำสั่ง' }
      ],
      fixChoices: [
        { id: 'dry_first', label: 'ดูดินแห้งก่อน' },
        { id: 'rain_first', label: 'ดูฝนตกก่อน' }
      ],
      buggyBlock: {
        additionalBlocks: [
          { condition: 'ดินแห้ง', action: 'เปิดสปริงเกอร์', type: 'if' },
          { condition: 'ฝนตก', action: 'ปิดสปริงเกอร์', type: 'else_if' }
        ]
      },
      correctBlock: {
        additionalBlocks: [
          { condition: 'ฝนตก', action: 'ปิดสปริงเกอร์', type: 'if' },
          { condition: 'ดินแห้ง', action: 'เปิดสปริงเกอร์', type: 'else_if' }
        ]
      },
      simulation: {
        type: 'greenhouse_sensor',
        broken: { caption: 'ฝนตกพร้อมสปริงเกอร์เปิด น้ำท่วมแปลง', weather: '🌧', sprinkler: '💦', fan: '◌', panel: '!' },
        fixed: { caption: 'ตรวจฝนก่อน สปริงเกอร์จึงปิดทันที', weather: '🌧', sprinkler: 'ปิด', fan: '◌', panel: '✓' }
      },
      objects: [
        { id: 'rain', label: 'ฝนตก', fallbackIcon: '🌧', anchor: 'rain' },
        { id: 'sprinkler', label: 'สปริงเกอร์', fallbackIcon: '💦', anchor: 'sprinkler' }
      ],
      feedback: {
        correct: 'ถูกต้อง! ฝนตกต้องปิดสปริงเกอร์ก่อน',
        wrongTarget: 'คำสั่งไม่ได้ผิด ลองดูว่าระบบตรวจอะไรก่อน',
        wrongFix: 'ถ้าดูดินแห้งก่อน สปริงเกอร์ยังเปิดทั้งที่ฝนตก',
        afterFix: 'เมื่อสลับให้ตรวจฝนก่อน ระบบจะปิดสปริงเกอร์ทัน'
      },
      hints: ['ฝนตกแล้วน้ำท่วม', 'ลำดับการตรวจสำคัญมาก', 'ให้ดูฝนตกก่อนดินแห้ง']
    },
    red_tomato: {
      title: 'ผลไม้เข้าลังผิดสี',
      theme: 'fruit_sorting',
      themeLabel: 'เครื่องคัดผลไม้',
      problemText: 'มะเขือเทศสีเขียวเข้าลังเดียวกับสีแดง',
      missionText: 'ซ่อมเงื่อนไขให้รับเฉพาะสีแดงเข้าลัง',
      bugTarget: 'broad_condition',
      correctFix: 'red_tomato',
      bugTargetChoices: [
        { id: 'broad_condition', label: 'เงื่อนไขกว้างเกินไป' },
        { id: 'repeat_count', label: 'จำนวนรอบ' }
      ],
      fixChoices: [
        { id: 'any_tomato', label: 'ถ้าเป็นมะเขือเทศ' },
        { id: 'red_tomato', label: 'ถ้าเป็นมะเขือเทศสีแดง' }
      ],
      buggyBlock: { condition: 'ถ้าเป็นมะเขือเทศ', action: 'ใส่ลังสีแดง', type: 'if' },
      correctBlock: { condition: 'ถ้าเป็นมะเขือเทศสีแดง', action: 'ใส่ลังสีแดง', type: 'if' },
      simulation: {
        type: 'conveyor_sorting',
        broken: { caption: 'สีเขียวปนในลังแดง', fruitOne: '🍅', fruitTwo: '🟢', fruitThree: '🍅', crate: 'ปน' },
        fixed: { caption: 'สีแดงเข้าลัง สีเขียวปล่อยผ่าน', fruitOne: '🍅', fruitTwo: '🟢', fruitThree: '🍅', crate: 'แดง' }
      },
      objects: [
        { id: 'scanner', label: 'เครื่องสแกนสี', fallbackIcon: '🔎', anchor: 'conveyor' },
        { id: 'crate', label: 'ลังสีแดง', fallbackIcon: '▤', anchor: 'crate' }
      ],
      feedback: {
        correct: 'ถูกต้อง! ต้องระบุสีแดงให้ชัด',
        wrongTarget: 'ลองดูว่าเงื่อนไขแยกสีชัดพอหรือยัง',
        wrongFix: 'ถ้าไม่ระบุสีแดง สีเขียวก็ยังเข้าลังได้',
        afterFix: 'เมื่อเพิ่มคำว่าสีแดงในเงื่อนไข สีเขียวจะไม่เข้าลังสีแดง'
      },
      hints: ['ผลไม้ผิดสีหลุดเข้าไป', 'เงื่อนไขเดิมกว้างเกินไป', 'เลือกมะเขือเทศสีแดง']
    },
    mango_count: {
      title: 'เครื่องหยิบผลไม้ไม่ครบ',
      theme: 'fruit_sorting',
      themeLabel: 'เครื่องคัดผลไม้',
      problemText: 'ใบสั่งต้องการมะม่วง 3 ลูก แต่เครื่องหยิบแค่ 2 ลูก',
      missionText: 'ซ่อมจำนวนรอบให้หยิบมะม่วงครบ',
      bugTarget: 'repeat_count',
      correctFix: 'repeat_3',
      bugTargetChoices: [
        { id: 'repeat_count', label: 'จำนวนรอบ' },
        { id: 'broad_condition', label: 'เงื่อนไขคัดสี' }
      ],
      fixChoices: [
        { id: 'repeat_2', label: 'ทำซ้ำ 2 ครั้ง' },
        { id: 'repeat_3', label: 'ทำซ้ำ 3 ครั้ง' }
      ],
      buggyBlock: { condition: 'ทำซ้ำ 2 ครั้ง', action: 'หยิบมะม่วงลงลัง', type: 'if' },
      correctBlock: { condition: 'ทำซ้ำ 3 ครั้ง', action: 'หยิบมะม่วงลงลัง', type: 'if' },
      simulation: {
        type: 'conveyor_sorting',
        broken: { caption: 'ลังมีมะม่วงแค่ 2/3', fruitOne: '🥭', fruitTwo: '🥭', fruitThree: ' ', crate: '2/3' },
        fixed: { caption: 'ลังมีมะม่วงครบ 3/3', fruitOne: '🥭', fruitTwo: '🥭', fruitThree: '🥭', crate: '3/3' }
      },
      objects: [
        { id: 'mango', label: 'มะม่วง', fallbackIcon: '🥭', anchor: 'conveyor' },
        { id: 'crate', label: 'ลังมะม่วง', fallbackIcon: '▤', anchor: 'crate' }
      ],
      feedback: {
        correct: 'ถูกต้อง! ต้องทำซ้ำ 3 ครั้ง',
        wrongTarget: 'ลองนับจำนวนรอบกับจำนวนผลไม้',
        wrongFix: 'ยังไม่ครบ ใบสั่งต้องการ 3 ลูก',
        afterFix: 'เมื่อทำซ้ำ 3 ครั้ง เครื่องจึงหยิบมะม่วงครบ'
      },
      hints: ['ใบสั่งต้องการกี่ลูก?', 'เครื่องหยิบน้อยไป 1 ลูก', 'เลือกทำซ้ำ 3 ครั้ง']
    }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getPreset(id) {
    return clone(PRESETS[id] || PRESETS.muddy_carrot);
  }

  function workDataToLevel(workData) {
    const preset = getPreset(workData.symptomId || 'muddy_carrot');
    const level = {
      levelId: 'เพื่อน',
      title: workData.title || preset.title,
      theme: workData.theme || preset.theme,
      sceneType: 'farm_repair',
      bugType: workData.bugTarget || preset.bugTarget,
      problemText: workData.problemText || preset.problemText,
      missionText: preset.missionText,
      simulation: preset.simulation,
      objects: preset.objects,
      buggyBlock: preset.buggyBlock,
      correctBlock: preset.correctBlock,
      questionText: 'จุดไหนน่าจะผิด?',
      fixQuestionText: 'ควรซ่อมอย่างไร?',
      choices: {
        bugTargetChoices: workData.bugTargetChoices || preset.bugTargetChoices,
        fixChoices: workData.fixChoices || preset.fixChoices
      },
      answer: {
        bugTarget: workData.bugTarget || preset.bugTarget,
        fixChoice: workData.correctFix || preset.correctFix
      },
      feedback: preset.feedback,
      hints: preset.hints
    };
    return level;
  }

  function workDataToConfig(workData) {
    return {
      title: workData.title || 'โจทย์บั๊กฟาร์มของเพื่อน',
      subtitle: 'สังเกตอาการ หาจุดผิด ซ่อม แล้วลองใหม่',
      levels: [workDataToLevel(workData)]
    };
  }

  function buildWorkData(values) {
    const preset = getPreset(values.symptomId);
    const title = (values.title || preset.title).trim();
    return {
      project_type: 'smart_farm_debug_lite_challenge',
      game_id: 4,
      builder_version: '2.0',
      title,
      symptomId: values.symptomId,
      theme: preset.theme,
      themeLabel: preset.themeLabel,
      problemText: preset.problemText,
      bugTarget: values.bugTarget || preset.bugTarget,
      correctFix: values.correctFix || preset.correctFix,
      bugTargetChoices: preset.bugTargetChoices,
      fixChoices: preset.fixChoices,
      tested: !!values.tested,
      playtest_note: values.playtest_note || ''
    };
  }

  function renderPreview(containerId, workData) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const preset = getPreset(workData.symptomId);
    const bugLabel = (preset.bugTargetChoices.find((item) => item.id === workData.bugTarget) || {}).label || workData.bugTarget;
    const fixLabel = (preset.fixChoices.find((item) => item.id === workData.correctFix) || {}).label || workData.correctFix;
    el.innerHTML = `
      <div class="debug-builder-preview">
        <div class="debug-builder-scene">${preset.themeLabel}</div>
        <h5>${escapeHtml(workData.title || preset.title)}</h5>
        <p><strong>อาการ:</strong> ${escapeHtml(preset.problemText)}</p>
        <p><strong>จุดผิด:</strong> ${escapeHtml(bugLabel)}</p>
        <p class="mb-0"><strong>วิธีซ่อม:</strong> ${escapeHtml(fixLabel)}</p>
      </div>
    `;
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

  window.DebugChallengePreview = {
    presets: PRESETS,
    getPreset,
    buildWorkData,
    workDataToLevel,
    workDataToConfig,
    renderPreview
  };
})();
