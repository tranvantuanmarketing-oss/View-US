const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const module = { exports: {} }; cache.set(file, module.exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, resolveJsonModule: true },
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, console, TextDecoder, Uint8Array,
    require: name => load(path.resolve(path.dirname(file), name.endsWith('.json') ? name : name + '.ts')),
  }, { filename: file });
  return module.exports;
}
const { normalizeLocale, detectStoryLocale, resolveStoryLocale, LOCALE_OPTIONS } = load('src/lib/locales.ts');
const { parseStories, serializeStories, readStoryFile } = load('src/lib/storyImport.ts');
const { getLanguage, buildTemplateHtml } = load('src/lib/templateRenderer.ts');
const { exportStoryText } = load('src/lib/batchExport.ts');
const polish = 'Moja matka powiedziała, że nie chce się z nami spotkać. Kiedy wróciłam do domu, ojciec już tam był. Wtedy moja córka zobaczyła, że jego nazwisko jest na kopercie.';
assert(LOCALE_OPTIONS.some(o => o.id === 'pl'));
for (const value of ['PL', ' pl-PL ', 'pl_PL', 'Polski', 'Polish', 'Ba Lan']) assert.equal(normalizeLocale(value), 'pl');
assert.equal(detectStoryLocale({ content: polish }), 'pl');
assert.equal(detectStoryLocale({ content: polish.normalize('NFD') }), 'pl');
assert.equal(detectStoryLocale({ content: 'Moja matka powiedziala, ze nie chce sie z nami spotkac. Kiedy wrocilam do domu, ojciec juz tam byl. Wtedy moja corka zobaczyla jego nazwisko.' }), 'pl');
assert.equal(detectStoryLocale({ content: 'OK' }, 'fr'), 'fr');
assert.equal(resolveStoryLocale({ content: polish }, 'en', 'fr-FR'), 'fr');
assert.equal(resolveStoryLocale({ content: 'OK', locale: 'pl-PL' }, 'en'), 'pl');
for (const [locale, content] of Object.entries({
  en: 'My mother said she was waiting for the letter. When my father came home, he opened the door.',
  fr: "Ma mère était dans la maison avec mon père. Quand je suis arrivée chez elle, elle avait déjà ouvert cette lettre pour nous.",
  nl: 'Mijn moeder zei dat het huis niet van haar was. Toen mijn vader de brief las, werd het stil.',
  de: 'Meine Mutter hatte den Brief auf dem Tisch. Als mein Vater die Tür öffnete, wurde er still. Ich hatte nicht damit gerechnet.',
  es: 'Cuando mi madre estaba con mi padre, dijo que había una carta para nosotros. Pero sus palabras cambiaron después.',
  vi: 'Mẹ tôi nói rằng ngôi nhà này là của bà. Nhưng khi anh tôi mở cửa, chúng tôi đã thấy một người đang đợi trong nhà.',
})) assert.equal(detectStoryLocale({ content }), locale, locale);

const text = `=== STORY 1 ===\nJęzyk: pl-PL\nAutor: Łukasz Żółć\nTytuł: Zażółć gęślą jaźń\nTreść:\n${polish}\nWyróżnienia: moja córka\nOpis:\nPolski opis.\nKomentarz 1:\nCzęść 2: Więcej w komentarzu.`;
(async () => {
  const bytes = Buffer.from('\ufeff' + text, 'utf16le');
  const decoded = await readStoryFile({ arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
  const [story] = parseStories(decoded);
  assert.equal(story.content, polish);
  assert.equal(story.author, 'Łukasz Żółć');
  assert.equal(story.locale, 'pl-PL');
  assert.equal(JSON.stringify(parseStories(serializeStories([story]))[0]), JSON.stringify(story));
  assert.equal(parseStories(JSON.stringify({ ...story, language: 'Polski' }))[0].locale, 'pl-PL');
  assert(exportStoryText({ ...story, locale: 'pl' }).includes('Locale: pl\n'));
  assert(exportStoryText(story).includes('Część 2: Więcej w komentarzu.'));
  assert.equal(getLanguage('PL_pl').id, 'pl');
  const templates = JSON.parse(fs.readFileSync('src/data/templates.json', 'utf8'));
  for (const template of templates) {
    const html = buildTemplateHtml(template, 0, 'pl-PL', {}, { body: polish });
    assert(!/@@(?:CTA|TIME|NAME|BAR|CTABOX|CTAPILL)@@/.test(html), template.id);
    assert(html.includes('Czytaj') || html.includes('CAŁA HISTORIA'), template.id);
  }
  for (const file of ['src/app/render/page.tsx', 'src/app/web-pages/page.tsx', 'src/app/cards/page.tsx', 'src/app/viral/page.tsx']) {
    const source = fs.readFileSync(file, 'utf8');
    assert(source.includes('LOCALE_OPTIONS.map'), file);
    assert(!source.includes('<option value="en">'), file);
  }
  console.log(`PASS Polish detection, locale aliases, 6-language regression, page priority, UTF-16, Polish field headings, TXT/JSON/export, ${templates.length} template localizations and shared selectors.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
