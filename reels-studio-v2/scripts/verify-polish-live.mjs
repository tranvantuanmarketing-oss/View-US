import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import Database from 'better-sqlite3';
import ffmpeg from 'ffmpeg-static';

const base = process.env.STUDIO_TEST_URL || 'http://127.0.0.1:3020';
async function api(url, method = 'GET', body) {
  const response = await fetch(base + url, { method, ...(body ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {}) });
  const json = await response.json();
  assert(response.ok && json.success, `${method} ${url}: ${JSON.stringify(json)}`);
  return json.data;
}
const content = 'Moja matka powiedziała, że nie chce się z nami spotkać.\nKiedy wróciłam do domu, ojciec już tam był.\nWtedy moja córka zobaczyła, że jego nazwisko jest na kopercie.';
const ids = { page: null, card: null, batches: [] };
let rendering = false;
const reportDir = path.resolve('data/verification/polish');
fs.mkdirSync(reportDir, { recursive: true });
const db = new Database('data/reels_studio.db');
await db.backup(path.join(reportDir, 'before-test.db'));
try {
  const page = await api('/api/pages', 'POST', { name: '[QA PL] Łódź — Polska', locale: ' pl-PL ' });
  ids.page = page.id;
  assert.equal(page.locale, 'pl');
  await api(`/api/pages/${page.id}`, 'PATCH', { locale: 'Polski' });
  assert.equal((await api(`/api/pages/${page.id}`)).locale, 'pl');
  const [card] = await api('/api/cards', 'POST', { locale: 'en', bulkText: `=== STORY 1 ===\nAutor: Łukasz Żółć\nTreść:\n${content}\nOpis: Żółć i źdźbło — test\nKomentarz 1: Część 2: Przeczytaj całość.` });
  ids.card = card.id;
  assert.equal(card.locale, 'pl');
  const templates = await api('/api/templates');
  const template = templates.find(t => t.id === 'centered') || templates[0];
  const item = {
    template_id: template.id, palette_id: template.pals[0].id,
    duration: 2, resolution: '1080x1920', background_video_url: '/assets/backgrounds/2.mp4',
    story_payload: { content, title: 'Zażółć gęślą jaźń', caption: 'Żółć i źdźbło — test', comment1: 'Część 2: Przeczytaj całość.', renderConfig: { fps: 24, muted: true } },
  };
  const batch = await api('/api/batches', 'POST', { page_id: page.id, locale: 'en', name: '[QA PL] render', items: [item] });
  ids.batches.push(batch.id);
  let result = await api(`/api/batches/${batch.id}`);
  assert.equal(result.batch.locale, 'pl');
  assert.equal(result.items[0].story_payload.locale, 'pl');
  const free = await api('/api/batches', 'POST', { page_id: 'free', locale: 'en', name: '[QA PL] auto detection', items: [item] });
  ids.batches.push(free.id);
  assert.equal((await api(`/api/batches/${free.id}`)).items[0].story_payload.locale, 'pl');
  rendering = true;
  await api(`/api/batches/${batch.id}/render`, 'POST', {});
  for (let i = 0; i < 90; i++) {
    await new Promise(r => setTimeout(r, 1000));
    result = await api(`/api/batches/${batch.id}`);
    if (['completed', 'failed', 'partial_failed'].includes(result.batch.status)) break;
  }
  rendering = false;
  assert.equal(result.batch.status, 'completed', JSON.stringify(result));
  const zip = await fetch(base + `/api/batches/${batch.id}/download`);
  assert(zip.ok);
  const zipFile = path.join(reportDir, 'polish-1080p.zip');
  fs.writeFileSync(zipFile, Buffer.from(await zip.arrayBuffer()));
  const report = JSON.parse(execFileSync('python3', ['-c', `import zipfile,json,sys
z=zipfile.ZipFile(sys.argv[1]); m=json.loads(z.read('manifest.json'))
assert m['locale']=='pl'
v=next(n for n in z.namelist() if n.endswith('.mp4')); t=z.read(v[:-4]+'.txt').decode('utf-8-sig')
assert 'Locale: pl' in t and 'Zażółć gęślą jaźń' in t and 'Część 2' in t
print(json.dumps({'manifestLocale':m['locale'],'files':z.namelist(),'textPreserved':True}))`, zipFile], { encoding: 'utf8' }));
  const output = result.items[0].output_path;
  const decode = execFileSync(ffmpeg, ['-hide_banner', '-i', output, '-f', 'null', '-'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '1', '-i', output, '-frames:v', '1', path.join(reportDir, 'frame.png')]);
  assert.equal(result.items[0].resolution, '1080x1920');
  const stats = await api('/api/stats?locale=pl');
  assert(stats.matrixData.some(r => r.pl >= 1));
  fs.writeFileSync(path.join(reportDir, 'result.json'), JSON.stringify({ ...report, resolution: result.items[0].resolution, duration: result.items[0].duration, decoded: true, localeDetection: true, pageLocale: true, statsPL: true }, null, 2));
  console.log('PASS live PL page create/update, Polish bulk import, automatic detection, page-locale priority, real 1080p render/decode, ZIP/TXT Unicode and PL statistics.');
} finally {
  if (rendering) console.error('Render still active; preserving QA data for recovery.');
  else {
    for (const id of ids.batches.reverse()) {
      const current = await api(`/api/batches/${id}`);
      if (['queued', 'running'].includes(current.batch.status)) await api(`/api/batches/${id}/render`, 'POST', { action: 'cancel' });
      await api(`/api/batches/${id}`, 'DELETE');
    }
    if (ids.card) db.prepare('DELETE FROM cards WHERE id=?').run(ids.card);
    if (ids.page) await api(`/api/pages/${ids.page}`, 'DELETE');
  }
  db.close();
}
