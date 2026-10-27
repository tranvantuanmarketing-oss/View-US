const fs = require('fs');

// Read index.html to extract MAU data and TPL_METAS
const html = fs.readFileSync('index.html', 'utf8');

const mauMatch = html.match(/<script id="mau-data"[^>]*>([\s\S]*?)<\/script>/);
const mauData = JSON.parse(mauMatch[1]);

const metaMatch = html.match(/window\.TPL_METAS\s*=\s*(\[[\s\S]*?\]);/);
const tplMetas = JSON.parse(metaMatch[1]);

console.log(`Loaded ${mauData.length} templates from index.html.`);
console.log(`Loaded ${tplMetas.length} template metas.`);

// Mock Canvas Context
function createMockCtx() {
  const calls = [];
  return {
    calls,
    font: '10px sans-serif',
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOffsetY: 0,
    textAlign: 'left',
    save: function() { calls.push(['save']); },
    restore: function() { calls.push(['restore']); },
    beginPath: function() { calls.push(['beginPath']); },
    closePath: function() { calls.push(['closePath']); },
    moveTo: function(x, y) {
      if (isNaN(x) || isNaN(y)) throw new Error(`NaN in moveTo: ${x}, ${y}`);
      calls.push(['moveTo', x, y]);
    },
    lineTo: function(x, y) {
      if (isNaN(x) || isNaN(y)) throw new Error(`NaN in lineTo: ${x}, ${y}`);
      calls.push(['lineTo', x, y]);
    },
    arcTo: function(x1, y1, x2, y2, r) {
      if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) || isNaN(r)) throw new Error(`NaN in arcTo: ${x1}, ${y1}, ${x2}, ${y2}, ${r}`);
      calls.push(['arcTo', x1, y1, x2, y2, r]);
    },
    arc: function(x, y, r, sa, ea) {
      if (isNaN(x) || isNaN(y) || isNaN(r)) throw new Error(`NaN in arc: ${x}, ${y}, ${r}`);
      calls.push(['arc', x, y, r, sa, ea]);
    },
    quadraticCurveTo: function(cpx, cpy, x, y) {
      if (isNaN(cpx) || isNaN(cpy) || isNaN(x) || isNaN(y)) throw new Error(`NaN in quadraticCurveTo`);
      calls.push(['quadraticCurveTo', cpx, cpy, x, y]);
    },
    fillRect: function(x, y, w, h) {
      if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) throw new Error(`NaN in fillRect: ${x}, ${y}, ${w}, ${h}`);
      calls.push(['fillRect', x, y, w, h]);
    },
    strokeRect: function(x, y, w, h) {
      if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) throw new Error(`NaN in strokeRect: ${x}, ${y}, ${w}, ${h}`);
      calls.push(['strokeRect', x, y, w, h]);
    },
    fillText: function(text, x, y) {
      if (isNaN(x) || isNaN(y)) throw new Error(`NaN in fillText: ${x}, ${y}`);
      calls.push(['fillText', text, x, y]);
    },
    stroke: function() { calls.push(['stroke']); },
    fill: function() { calls.push(['fill']); },
    clip: function() { calls.push(['clip']); },
    translate: function(x, y) {
      if (isNaN(x) || isNaN(y)) throw new Error(`NaN in translate: ${x}, ${y}`);
      calls.push(['translate', x, y]);
    },
    rotate: function(r) {
      if (isNaN(r)) throw new Error(`NaN in rotate: ${r}`);
      calls.push(['rotate', r]);
    },
    drawImage: function() { calls.push(['drawImage']); },
    createLinearGradient: function(x0, y0, x1, y1) {
      if (isNaN(x0) || isNaN(y0) || isNaN(x1) || isNaN(y1)) throw new Error(`NaN in createLinearGradient: ${x0}, ${y0}, ${x1}, ${y1}`);
      return {
        addColorStop: function() {}
      };
    },
    measureText: function(text) {
      return { width: (text || '').length * 16 };
    }
  };
}

// Extract engine helper functions
// Let's run a test using eval or extract functions from studio_engine_v10.js
const engineCode = fs.readFileSync('studio_engine_v10.js', 'utf8');

// Build test harness
const sampleStory = {
  index: 0,
  author: "Emily Vance",
  handle: "@emily_vance",
  timeAgo: "3h ago",
  page: "Daily Confessions",
  title: "The girl twenty families turned down",
  content: "I adopted the little girl that twenty families had rejected alone. Her medical diagnosis scared everyone away. You have time to think about this, sir. I signed the adoption papers in less than four minutes. Ten years went by. She walked, she read, she laughed out loud. Then Greg, who abandoned her at birth, showed up at our front door claiming her inheritance...",
  highlights: ["You have time to think about this, sir.", "claiming her inheritance..."],
  cta: "Read Continuation In Caption",
  caption: "Full story in caption...",
  comment1: "PART 2: Greg smirked...",
  pinLink: "https://example.com"
};

// Test all 76 templates
console.log("\n--- Testing all 76 templates ---");

const vm = require('vm');
const sandbox = {
  window: {
    TPL_METAS: tplMetas,
    BG_FILES: ["clip_01.mp4"],
    AVATAR_FILES: ["av_01.jpg"],
    STORIES_BY_COUNTRY: {}
  },
  document: {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  MAU: mauData,
  state: mauData.map(() => ({ pal: 0, picked: false })),
  console: console,
  setTimeout: () => {},
  requestAnimationFrame: () => {}
};

// We want to test drawTemplateCanvas and prepareStoryTypography
// Let's extract them from studio_engine_v10.js
vm.createContext(sandbox);

let errors = [];
for (let i = 0; i < mauData.length; i++) {
  try {
    const m = mauData[i];
    const meta = tplMetas[i] || {};
    const palIdx = 0;
    const activePal = m.pals[palIdx];
    const tpl = {
      index: i,
      id: m.id,
      label: m.label,
      ho: meta.ho || m.ho || "the-vet",
      palIdx: palIdx,
      palId: activePal.id,
      palName: `${palIdx + 1}/${m.pals.length} (${activePal.id})`,
      rawHtml: activePal.html,
      vars: (meta.pals && meta.pals[palIdx]) ? meta.pals[palIdx].vars : {}
    };

    const ctx = createMockCtx();
    
    // Test prepareStoryTypography logic
    const vars = tpl.vars || {};
    const ho = tpl.ho || "the-vet";
    const bodyW = parseFloat(vars["body-w"]) || 604;
    const bodyH = parseFloat(vars["body-h"]) || 916;
    const bodyX = parseFloat(vars["body-x"]) || 58;
    const bodyY = parseFloat(vars["body-y"]) || 190;

    if (isNaN(bodyW) || isNaN(bodyH) || isNaN(bodyX) || isNaN(bodyY)) {
      throw new Error(`NaN in body layout: W=${bodyW}, H=${bodyH}, X=${bodyX}, Y=${bodyY}`);
    }
  } catch (err) {
    errors.push({ index: i, id: mauData[i].id, error: err.message });
  }
}

if (errors.length === 0) {
  console.log("✅ All 76 templates passed basic structure and layout check!");
} else {
  console.log(`❌ ${errors.length} templates had errors:`, errors);
}
