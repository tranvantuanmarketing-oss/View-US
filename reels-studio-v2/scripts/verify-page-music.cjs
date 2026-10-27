const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
const e = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/studioPageConfig.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: e });
const tracks = Array.from({ length: 18 }, (_, i) => ({ id: `track-${i}`, file_path: `/assets/${i}.mp3`, mood: i % 2 ? 'tram' : 'tuoi-sang' }));
const page = { settings: { selected_track_ids: tracks.map(t => t.id), music_mood: 'tram' } };
const pool = e.pageTrackPool(page, tracks);
assert.equal(pool.length, 18, 'Explicit selection must include tracks across moods');
for (let seed = 0; seed < 100; seed++) {
  const plan = e.pageMusicPlan(pool, 55, seed);
  assert.equal(plan.length, 55);
  assert.equal(new Set(plan.slice(0, 18).map(t => t.id)).size, 18);
  assert.equal(new Set(plan.slice(18, 36).map(t => t.id)).size, 18);
  assert(plan.every((t, i) => !i || t.id !== plan[i - 1].id), 'No immediate repetition across deck boundaries');
  assert.equal(JSON.stringify(plan), JSON.stringify(e.pageMusicPlan(pool, 55, seed)), 'Preview/payload share the same stable plan');
}
assert.notEqual(JSON.stringify(e.pageMusicPlan(pool, 20, 12)), JSON.stringify(e.pageMusicPlan(pool, 20, 13)));
assert.equal(e.pageMusicPlan([], 20, 0).length, 0);
assert.equal(e.pageMusicPlan([tracks[0]], 20, 0).length, 20);
const duplicate = { ...tracks[0], id: 'duplicate-file' };
assert(e.pageMusicPlan([tracks[0], duplicate, tracks[1]], 20, 1).every((t, i, p) => !i || t.file_path !== p[i - 1].file_path));
assert.equal(e.pageTrackPool({ settings: { selected_track_ids: ['deleted'], music_mood: 'tram' } }, tracks).length, 0);
console.log('PASS shuffled 18-track pools, 100 seeds, no repeat until exhaustion, no adjacent duplicates, stable preview/payload, changed seeds, empty/single/duplicate files, explicit selection across moods.');
