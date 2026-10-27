import os, json, re

print("Starting make_v13.py: Enforce Page Name across all lower lines (.ts) and full 2-way live sync...")

# 1. Read studio_engine_v12.js
with open('studio_engine_v12.js', 'r', encoding='utf-8') as f:
    engine_js = f.read()

# Update version banner
engine_js = engine_js.replace(
    'Initializing Việt Reels Studio Pro Engine v12.0 (100% Native-Matched Typography & Full-Card AutoFit)',
    'Initializing Việt Reels Studio Pro Engine v13.0 (Unified Page Name on Subtitle .ts & Live 2-Way Sync)'
)

# 2. Add getActivePageName helper function right after constants
helper_code = '''  // Uniform Page Name Resolver across All Templates & Export
  function getActivePageName(story) {
    if (studioPageName && studioPageName.value && studioPageName.value.trim()) {
      return studioPageName.value.trim();
    }
    const pTenEl = typeof document !== "undefined" ? document.getElementById("pTen") : null;
    if (pTenEl && pTenEl.value && pTenEl.value.trim()) {
      return pTenEl.value.trim();
    }
    if (typeof page !== "undefined" && page.ten && page.ten.trim()) {
      return page.ten.trim();
    }
    if (story && story.page && story.page.trim()) {
      return story.page.trim();
    }
    if (typeof tenXuat === "function" && tenXuat()) {
      return tenXuat();
    }
    return "Daily Confessions";
  }
'''

# Insert getActivePageName before buildStoryHtml
engine_js = engine_js.replace(
    '  // 3. BUILD 100% NATIVE HTML (APPLYING OVALL MANUAL ADJUSTMENTS)',
    helper_code + '\n  // 3. BUILD 100% NATIVE HTML (APPLYING OVALL MANUAL ADJUSTMENTS)'
)

# 3. Rewrite buildStoryHtml to strictly use getActivePageName and guarantee .ts subtitle line shows Page Name
old_build_story_html = re.search(
    r'function buildStoryHtml\(mIdx, palIdx, story\) \{[\s\S]*?return tplHtml;\s*\}',
    engine_js
)

if not old_build_story_html:
    raise Exception("Could not find buildStoryHtml in engine_js!")

new_build_story_html = '''function buildStoryHtml(mIdx, palIdx, story) {
    if (typeof MAU === "undefined" || !MAU[mIdx]) return "";
    const m = MAU[mIdx];
    const pal = m.pals[palIdx] || m.pals[0];
    let tplHtml = pal.html;

    const isRandomAv = document.querySelector('input[name="studioAvatarMode"]:checked')?.value === "random";
    const avList = window.AVATAR_FILES || ["av_01.jpg"];
    const avFile = isRandomAv ? (avList[currentStoryIdx % avList.length]) : selectedAvatar;
    const avSrc = avFile.startsWith("data:") ? avFile : `assets/avatars/${avFile}`;

    if (typeof ASSET !== "undefined") {
      const bgList = window.BG_FILES || ["clip_01.mp4"];
      for (const [ma, uri] of ASSET) {
        if (ma === "@@AV@@") {
          tplHtml = tplHtml.split(ma).join(avSrc);
        } else if (ma === "@@CLIP@@") {
          const bgModeVal = selectStudioBgMode ? selectStudioBgMode.value : "random";
          const clipSrc = (bgModeVal === "random") 
            ? `assets/backgrounds/${bgList[currentStoryIdx % bgList.length] || bgList[0]}`
            : `assets/backgrounds/${activeSelectedBg || bgList[0]}`;
          tplHtml = tplHtml.split(ma).join(clipSrc);
        } else {
          tplHtml = tplHtml.split(ma).join(uri);
        }
      }
    }

    const pageName = getActivePageName(story);
    const timeDisplay = (story && story.timeAgo) ? story.timeAgo : "3h ago";
    const ctaDisplay = (story && story.cta) ? story.cta : "Continuer la lecture dans les commentaires";

    tplHtml = tplHtml
      .split("@@NAME@@").join(pageName)
      .split("@@TIME@@").join(timeDisplay)
      .split("@@CTA@@").join(ctaDisplay)
      .split("@@CTABOX@@").join(ctaDisplay)
      .split("@@CTAPILL@@").join(ctaDisplay)
      .split("@@BAR@@").join(ctaDisplay);

    // Strictly enforce that the lower subtitle line (.ts) ALWAYS displays the Page Name!
    tplHtml = tplHtml.replace(/(class=["'][^"']*ts[^"']*["'][^>]*>\s*\([^)]*\)\s*<svg[^>]*>)[^<]*(<\/div>)/gi, `$1${pageName}$2`);
    tplHtml = tplHtml.replace(/(class=["'][^"']*ts[^"']*["'][^>]*>)[^<]*(<\/div>)/gi, (full, p1, p2) => {
      if (!full.includes(pageName)) {
        return `${p1}(${timeDisplay}) • ${pageName}${p2}`;
      }
      return full;
    });

    let bodyHtml = "";
    const paragraphs = ((story && story.content) || "").split(/\\n+/).map(p => p.trim()).filter(Boolean);
    
    paragraphs.forEach((para, idx) => {
      let pText = para;
      if (story && story.highlights && story.highlights.length > 0) {
        story.highlights.forEach(hl => {
          if (hl.length > 3 && pText.includes(hl)) {
            pText = pText.split(hl).join(`<span class="r">${hl}</span>`);
          }
        });
      } else if (idx === 0) {
        pText = `<span class="r lead">${pText}</span>`;
      }
      bodyHtml += (idx > 0 ? `<span class="pg"></span>` : "") + pText + " ";
    });

    if (story && story.cta) {
      bodyHtml += ` <span class="cta">${ctaDisplay}</span>`;
    }

    tplHtml = tplHtml.replace(/(<div[^>]*id=["']body["'][^>]*>)([\s\S]*?)(<\/div>)/i, `$1${bodyHtml}$3`);
    return tplHtml;
  }'''

engine_js = engine_js.replace(old_build_story_html.group(0), new_build_story_html, 1)
print("Updated buildStoryHtml with strict Page Name subtitle replacement.")

# 4. Update drawTemplateCanvas in engine_js to use getActivePageName
engine_js = engine_js.replace(
    '''    // Get strictly uniform Fanpage Name from user inputs
    const defaultPage = (typeof tenXuat === "function" && tenXuat()) || (typeof page !== "undefined" && page.ten) || "Daily Confessions";
    const displayName = (studioPageName && studioPageName.value.trim()) || (story && story.page) || defaultPage;''',
    '''    // Get strictly uniform Fanpage Name from user inputs
    const displayName = getActivePageName(story);'''
)
print("Updated drawTemplateCanvas to use getActivePageName.")

# 5. Update previewTplInfo in updateLivePreview
engine_js = engine_js.replace(
    'const pName = story ? (story.page || (studioPageName ? studioPageName.value : "")) : "";',
    'const pName = getActivePageName(story);'
)

# 6. Update single & batch render safePrefix / safeBaseName
engine_js = engine_js.replace(
    '''      const defaultPage = studioPageName ? studioPageName.value : "Reels";
      const pageRaw = (story.page || defaultPage).trim();
      const safePage = pageRaw.replace(/[/\\\\:*?"<>|]/g, '_').trim() || "Page";
      const safeNum = String(currentStoryIdx + 1).padStart(2, "0");
      const safeAuthor = (story.author || "Story").replace(/[/\\\\:*?"<>|]/g, '_').trim();
      const safeBaseName = `${safePage}_Video_${safeNum}_${safeAuthor}`;''',
    '''      const pageRaw = getActivePageName(story);
      const safePage = pageRaw.replace(/[/\\\\:*?"<>|]/g, '_').trim() || "Page";
      const safeNum = String(currentStoryIdx + 1).padStart(2, "0");
      const safeBaseName = `${safePage}_Video_${safeNum}`;'''
)

engine_js = engine_js.replace(
    '''      // Calculate uniform base name prefix from inputs: e.g. PT_dfd_edf
      const basePrefix = (typeof tenXuat === "function" && tenXuat()) || (studioPageName ? studioPageName.value.trim() : "") || (typeof page !== "undefined" && page.ten) || "Reels";
      const safePrefix = basePrefix.replace(/[/\\\\:*?"<>|]/g, '_').trim() || "Reels";''',
    '''      // Calculate uniform base name prefix from inputs: e.g. Daily Confessions
      const basePrefix = getActivePageName(parsedStories[0]);
      const safePrefix = basePrefix.replace(/[/\\\\:*?"<>|]/g, '_').trim() || "Reels";'''
)

# 7. Update 2-way sync between studioPageName & pTenEl
sync_code = '''  // 2-Way Sync between Top Header Inputs (pTen, pNv, pLang, tenXuat) and Studio Inputs
  function syncHeaderAndStudioNames() {
    const activePage = (pTenEl && pTenEl.value.trim()) || (typeof page !== "undefined" && page.ten) || "";
    if (activePage && studioPageName) {
      studioPageName.value = activePage;
    } else if (studioPageName && studioPageName.value.trim() && pTenEl) {
      pTenEl.value = studioPageName.value.trim();
      if (typeof page !== "undefined") page.ten = studioPageName.value.trim();
    }
    if (typeof page !== "undefined" && page.nv && studioAuthorName) {
      studioAuthorName.value = "@" + page.nv;
    }
  }

  const pTenEl = document.getElementById("pTen");
  const pNvEl = document.getElementById("pNv");
  const pLangEl = document.getElementById("pLang");

  if (pTenEl) {
    pTenEl.addEventListener("input", () => {
      const val = pTenEl.value.trim();
      if (studioPageName) studioPageName.value = val;
      if (typeof page !== "undefined") page.ten = val;
      if (parsedStories) parsedStories.forEach(s => s.page = val);
      updateLivePreview();
      if (typeof veLaiKhung === "function") veLaiKhung();
    });
  }
  if (pNvEl) {
    pNvEl.addEventListener("input", () => {
      syncHeaderAndStudioNames();
      updateLivePreview();
    });
  }
  if (pLangEl) {
    pLangEl.addEventListener("change", () => {
      syncHeaderAndStudioNames();
      updateLivePreview();
    });
  }
  if (studioPageName) {
    studioPageName.addEventListener("input", () => {
      const val = studioPageName.value.trim();
      if (pTenEl) {
        pTenEl.value = val;
        if (typeof page !== "undefined") page.ten = val;
        if (typeof veTen === "function") veTen();
      }
      if (parsedStories) parsedStories.forEach(s => s.page = val);
      updateLivePreview();
      if (typeof veLaiKhung === "function") veLaiKhung();
    });
  }'''

engine_js = re.sub(
    r'// 2-Way Sync between Top Header Inputs[\s\S]*?// INITIALIZATION',
    sync_code + '\n\n  // INITIALIZATION',
    engine_js
)
print("Updated 2-way sync in engine_js.")

# Save studio_engine_v13.js
with open('studio_engine_v13.js', 'w', encoding='utf-8') as f:
    f.write(engine_js)
print("Saved studio_engine_v13.js successfully!")

# 8. Update build_studio_v10.py to use studio_engine_v13.js AND patch kho-mau-v1.6.html
with open('build_studio_v10.py', 'r', encoding='utf-8') as f:
    build_py = f.read()

build_py = build_py.replace('studio_engine_v12.js', 'studio_engine_v13.js')

# Also ensure docHtml in base HTML uses page.ten / studioPageName
patch_base_html = '''
# Patch docHtml & pTen.oninput in base HTML to strictly follow Page Name across all 76 templates
html = html.replace(
    '.split("@@NAME@@").join(L.sampleName)',
    '.split("@@NAME@@").join((page && page.ten && page.ten.trim()) || (document.getElementById("studioPageName") && document.getElementById("studioPageName").value.trim()) || L.sampleName)'
)

html = html.replace(
    'doc_("pTen").oninput = (e) => { page.ten = e.target.value; veTen(); luu(); };',
    'doc_("pTen").oninput = (e) => { page.ten = e.target.value; if(document.getElementById("studioPageName")) document.getElementById("studioPageName").value = e.target.value; veTen(); luu(); veLaiKhung(); };'
)
'''

if 'Patch docHtml & pTen.oninput' not in build_py:
    build_py = build_py.replace(
        '# 2. Extract MAU data & Assets',
        patch_base_html + '\n# 2. Extract MAU data & Assets'
    )
    print("Patched base HTML template renderer in build_studio_v10.py.")

with open('build_studio_v10.py', 'w', encoding='utf-8') as f:
    f.write(build_py)

print("make_v13.py completed successfully!")
