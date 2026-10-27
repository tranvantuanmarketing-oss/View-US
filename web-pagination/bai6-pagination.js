/* Explicit opt-in only: existing pilot URLs or a STORY_PARTS marker in article content. */
(() => {
  'use strict';
  const allowed = new Set(['/blog/amstelveen-schenking-en-geheim', '/blog/test-part-bai-6-amstelveen', '/blog/le-jour-de-ma-retraite-il-a-exige-la-moitie-de-tout-il-avait-oublie-un-contrat']);
  const pathname = location.pathname.replace(/\/$/, '');
  if (!pathname.startsWith('/blog/')) return;
  function start() {
    const body = document.querySelector('.inkitt-reader__content.module-article-content__body');
    if (!body || body.dataset.storyPagination) return;
    const marker = [...body.children].find(e => e.tagName === 'P' && e.textContent.trim() === '[STORY_PARTS]');
    if (!allowed.has(pathname) && !marker && !body.innerHTML.includes('<!-- STORY_PARTS -->')) return;
    const headings = [...body.children].filter(e => e.tagName === 'H2' && /^(Deel|Partie|Część|Teil|Part)\s+\d+\s*:/i.test(e.textContent.trim()));
    if (headings.length < 2) return;
    const label = headings[0].textContent.trim().match(/^(Deel|Partie|Część|Teil|Part)/i)[0];
    const strings = {deel:['Vorig deel','Volgend deel','Laatste deel'],partie:['Partie précédente','Partie suivante','Dernière partie'],'część':['Poprzednia część','Następna część','Ostatnia część'],teil:['Vorheriger Teil','Nächster Teil','Letzter Teil'],part:['Previous part','Next part','Last part']}[label.toLowerCase()];
    // Require complete, sequential and non-empty parts before changing the reader.
    if (headings.some((h,i)=>Number(h.textContent.match(/\d+/)[0])!==i+1)) return;
    if (headings.some(h=>{let n=h.nextSibling,text='';while(n&&!headings.includes(n)){text+=n.textContent||'';if(n.nodeType===1&&n.querySelector?.('img,video'))text+='media';n=n.nextSibling;}return !text.trim();})) return;
    marker?.remove();
    body.dataset.storyPagination = '1';
    const sections = [];
    let section;
    const fragment = document.createDocumentFragment();
    for (const node of [...body.childNodes]) {
      if (headings.includes(node)) {
        section = document.createElement('section');
        section.className = 'story-part';
        section.setAttribute('aria-label', `${label} ${sections.length + 1}`);
        sections.push(section);
        fragment.append(section);
      }
      if (section) section.append(node); else fragment.append(node);
    }
    body.append(fragment);
    const requested = new URL(location.href).searchParams.get('part');
    const current = /^\d+$/.test(requested || '') ? Math.min(sections.length, Math.max(1, Number(requested))) : 1;
    sections.forEach((e, i) => { e.hidden = i + 1 !== current; });
    body.id = 'story-reader';
    const style = document.createElement('style');
    style.textContent = `#story-reader .story-part[hidden]{display:none!important}.story-part-nav{font:500 15px/1.5 system-ui,sans-serif;background:#f6f8fc;border:1px solid #dde4ee;border-radius:14px;padding:14px;margin:22px 0;box-sizing:border-box}.story-part-nav__row{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center}.story-part-nav a,.story-part-nav__disabled{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:8px 13px;border:1px solid #dbe2ec;border-radius:10px;text-decoration:none;background:#fff;color:#1247bd;box-sizing:border-box;white-space:nowrap}.story-part-nav__disabled{opacity:.45;color:#64748b}.story-part-nav__next{justify-self:end}.story-part-nav__numbers{display:flex;gap:7px;overflow-x:auto;padding:12px 1px 3px;scrollbar-width:thin}.story-part-nav__numbers a{flex:0 0 auto;color:#172338}.story-part-nav__numbers a[aria-current=page]{color:#fff;border-color:#1675dd;background:linear-gradient(120deg,#1452d4,#00b7d3)}.story-part-nav a:focus-visible{outline:3px solid #38bdf8;outline-offset:2px}.story-part-nav__status{font-weight:700;color:#334155;white-space:nowrap}@media(max-width:480px){.story-part-nav{padding:10px;font-size:13px}.story-part-nav a,.story-part-nav__disabled{padding:7px 9px}.story-part-nav__row{gap:6px}}`;
    document.head.append(style);
    function href(n) {
      const url = new URL(location.href);
      if (n === 1) url.searchParams.delete('part'); else url.searchParams.set('part', String(n));
      url.hash = 'story-reader';
      return url.pathname + url.search + url.hash;
    }
    function link(n, text, cls = '') {
      const a = document.createElement('a');
      a.href = href(n); a.textContent = text; a.className = cls;
      return a;
    }
    function nav(position) {
      const nav = document.createElement('nav');
      nav.className = 'story-part-nav';
      nav.setAttribute('aria-label', `${label} — ${position}`);
      const row = document.createElement('div'); row.className = 'story-part-nav__row';
      const prev = current > 1 ? link(current - 1, '← '+strings[0]) : document.createElement('span');
      if (current === 1) { prev.className = 'story-part-nav__disabled'; prev.textContent = '← '+strings[0]; prev.setAttribute('aria-disabled', 'true'); }
      const status = document.createElement('span'); status.className = 'story-part-nav__status'; status.textContent = `${label} ${current}/${sections.length}`;
      const next = current < sections.length ? link(current + 1, strings[1]+' →', 'story-part-nav__next') : document.createElement('span');
      if (current === sections.length) { next.className = 'story-part-nav__disabled story-part-nav__next'; next.textContent = strings[2]; next.setAttribute('aria-disabled', 'true'); }
      row.append(prev, status, next);
      const numbers = document.createElement('div'); numbers.className = 'story-part-nav__numbers';
      sections.forEach((_, i) => {
        const a = link(i + 1, `${label} ${i + 1}`);
        if (i + 1 === current) a.setAttribute('aria-current', 'page');
        numbers.append(a);
      });
      nav.append(row, numbers); return nav;
    }
    body.before(nav('boven')); body.after(nav('onder'));
    document.querySelectorAll('.story-part-nav__numbers').forEach(e => {
      const active = e.querySelector('[aria-current]');
      if (active) e.scrollLeft = Math.max(0, active.offsetLeft - e.offsetLeft - 25);
    });
    // This is client-side pagination on an existing URL, not server-side /part/N routes.
    document.title = document.title.replace(/\s*[—–-]\s*(Deel|Partie|Część|Teil|Part) \d+\/\d+$/, '') + ` — ${label} ${current}/${sections.length}`;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
