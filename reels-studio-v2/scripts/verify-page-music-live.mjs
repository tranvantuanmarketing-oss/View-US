import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import Database from 'better-sqlite3';
import ffmpeg from 'ffmpeg-static';
const base = 'http://127.0.0.1:3020';
const ids = { page: null, batches: [] };
const dir = path.resolve('data/verification/page-music');
fs.mkdirSync(dir, { recursive: true });
const db = new Database('data/reels_studio.db');
await db.backup(path.join(dir, 'before-test.db'));
async function api(url, method = 'GET', body) {
  const r = await fetch(base + url, { method, ...(body ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {}) });
  const j = await r.json(); assert(r.ok && j.success, `${method} ${url}: ${JSON.stringify(j)}`); return j.data;
}
const report = {};
let active = false;
try {
  const pages = await api('/api/pages');
  const real = pages.find(p => p.name === 'Cienie Spadku');
  assert(real && real.settings.selected_track_ids.length >= 3);
  const tracks = (await api('/api/music')).filter(t => real.settings.selected_track_ids.includes(t.id));
  assert.equal(tracks.length, 18);
  const page = await api('/api/pages', 'POST', { name: '[QA Music] Shuffle', locale: 'pl' }); ids.page = page.id;
  await api(`/api/pages/${page.id}/settings`, 'PUT', { ...page.settings, selected_track_ids: tracks.map(t => t.id) });
  const tpl = (await api('/api/templates'))[0];
  const item = { template_id: tpl.id, palette_id: tpl.pals[0].id, duration: 2, resolution: '720x1280', background_video_url: '/assets/backgrounds/2.mp4',
    music_track_id: tracks[0].id, story_payload: { content: 'Moja matka powiedziała, że nie zna tej kobiety.\nWtedy ojciec otworzył kopertę.', renderConfig: { muted: false, fps: 24, volume: .4, trackPath: '/assets/invalid-stale.mp3' } } };
  const create = async (mode, count, seed, changes = {}) => {
    const b = await api('/api/batches', 'POST', { page_id: page.id, mode, locale: 'pl', music_seed: seed, name: '[QA Music] ' + mode, items: Array.from({ length: count }, () => ({ ...item, ...changes })) });
    ids.batches.push(b.id); return await api(`/api/batches/${b.id}`);
  };
  for (const mode of ['page', 'single', 'custom_per_video']) {
    const { items } = await create(mode, 20, 1234);
    assert.equal(new Set(items.slice(0, 18).map(i => i.music_track_id)).size, 18);
    assert(items.every((i, n) => !n || i.music_track_id !== items[n - 1].music_track_id));
    assert(items.every(i => tracks.some(t => t.id === i.music_track_id && t.file_path === i.story_payload.renderConfig.trackPath)));
    report[mode] = items.map(i => i.music_track_id);
  }
  assert.deepEqual(report.page, report.single, 'Template locking must not lock music');
  const muted = await create('page', 1, 123, { story_payload: { ...item.story_payload, renderConfig: { muted: true, trackPath: '/assets/stale.mp3' } } });
  assert.equal(muted.items[0].music_track_id, null);
  assert(!muted.items[0].story_payload.renderConfig.trackPath);
  const free = await api('/api/batches', 'POST', { page_id: 'free', mode: 'single', name: '[QA Music] fixed', items: [item, item] });
  ids.batches.push(free.id);
  assert((await api(`/api/batches/${free.id}`)).items.every(i => i.music_track_id === tracks[0].id));
  // Real library tracks have soft/silent intros in their first 2 seconds, so
  // use 8 seconds to verify the music after the intro rather than only the fade-in.
  const audio = await create('single', 3, 5678, { duration: 8 });
  active = true;
  await api(`/api/batches/${audio.batch.id}/render`, 'POST', {});
  let result;
  for (let i = 0; i < 1200; i++) {
    await new Promise(r => setTimeout(r, 1000)); result = await api(`/api/batches/${audio.batch.id}`);
    if (['completed', 'failed', 'partial_failed'].includes(result.batch.status)) break;
  }
  assert.equal(result.batch.status, 'completed', JSON.stringify(result)); active = false;
  report.audio = result.items.map(i => {
    const pcm = execFileSync(ffmpeg, ['-v', 'error', '-i', i.output_path, '-map', '0:a:0', '-f', 's16le', '-ac', '1', '-ar', '8000', '-']);
    assert(pcm.length > 8000); let sum = 0;
    for (let n = 0; n + 1 < pcm.length; n += 2) sum += pcm.readInt16LE(n) ** 2;
    const rms = Math.sqrt(sum / (pcm.length / 2)); assert(rms > 1, 'Audio is not silent');
    return { track: i.music_track_id, path: i.story_payload.renderConfig.trackPath, sha256: createHash('sha256').update(pcm).digest('hex'), rms };
  });
  assert.equal(new Set(report.audio.map(a => a.sha256)).size, 3);
  const before = result.items.map(i => i.music_track_id);
  // A completed output's assignment is stored, not regenerated when it is read again.
  assert.deepEqual((await api(`/api/batches/${audio.batch.id}`)).items.map(i => i.music_track_id), before);
  const zip = await fetch(base + `/api/batches/${audio.batch.id}/download`); assert(zip.ok);
  fs.writeFileSync(path.join(dir, 'three-different-tracks.zip'), Buffer.from(await zip.arrayBuffer()));
  fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(report, null, 2));
  console.log('PASS live 18/20 shuffle in all template modes, pool/path matching, mute, free fixed-track mode, 3 actual videos with different audible tracks, stable saved assignments and ZIP.');
} finally {
  if (active) console.error('QA render remains active; keeping records for diagnosis.');
  else {
    for (const id of ids.batches.reverse()) {
      const current = await api(`/api/batches/${id}`);
      if (['queued', 'running'].includes(current.batch.status)) await api(`/api/batches/${id}/render`, 'POST', { action: 'cancel' });
      // Worker finalization can finish shortly after the completed status is visible.
      for (let attempt = 0; attempt < 100; attempt++) {
        const response = await fetch(base + `/api/batches/${id}`, { method: 'DELETE' });
        if (response.ok) break;
        assert.equal(response.status, 409, await response.text());
        if (attempt === 99) throw new Error(`Worker is still finalizing QA batch ${id}`);
        await new Promise(r => setTimeout(r, 200));
      }
    }
    if (ids.page) await api(`/api/pages/${ids.page}`, 'DELETE');
  }
  db.close();
}
