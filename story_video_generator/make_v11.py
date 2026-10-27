import os, json, re

print("Starting make_v11.py to generate complete Studio Engine v11 and index.html...")

# Read base kho-mau-v1.6.html
with open('kho-mau-v1.6.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Read studio_engine_v10.js as base for engine v11
with open('studio_engine_v10.js', 'r', encoding='utf-8') as f:
    engine_js = f.read()

# -------------------------------------------------------------
# 1. UPDATE PARSER IN ENGINE (INLINE & MULTILINE ROBUST PARSER)
# -------------------------------------------------------------
old_parse_fn = re.search(r'function parseStories\(text\) \{[\s\S]*?return rawBlocks\.map\(\(block, idx\) => \{[\s\S]*?return \{\s*index: idx,[\s\S]*?pinLink\s*\};\s*\}\);\s*\}', engine_js)

new_parse_fn = r'''function parseStories(text) {
    text = (text || "").trim();
    if (!text) return [];

    const defaultPage = (typeof tenXuat === "function" && tenXuat()) || (studioPageName ? studioPageName.value.trim() : "Daily Confessions");
    const defaultAuthor = studioAuthorName ? studioAuthorName.value.replace('@', '').trim() : "Creator";

    if (text.startsWith('[') && text.endsWith(']')) {
      try {
        const arr = JSON.parse(text);
        if (Array.isArray(arr) && arr.length > 0) {
          return arr.map((item, idx) => ({
            index: idx,
            author: item.author || defaultAuthor,
            handle: item.handle || ('@' + (item.author || defaultAuthor).toLowerCase().replace(/[^a-z0-9]/g, '_')),
            timeAgo: item.timeAgo || item.time || '3h ago',
            page: item.pageName || item.page || defaultPage,
            title: item.title || item.caption || (`Story #${idx + 1}`),
            content: (item.content || item.text || '').trim(),
            highlights: Array.isArray(item.highlights) ? item.highlights : (item.highlights ? item.highlights.split('|').map(s=>s.trim().replace(/^["']|["']$/g, '')) : []),
            cta: item.cta || 'Read Continuation In Caption',
            caption: item.caption || item.description || (`${item.title || 'Story #' + (idx + 1)}. What happened next stunned everyone... Read the full Part 2 in the first comment! 👇 #storytime #truestory #familydrama`),
            comment1: item.comment1 || item.comment || item.part2 || (`PART 2: When the truth was finally revealed, nobody in the room could believe what had just transpired...`),
            pinLink: item.pinLink || item.link || (`https://example.com/story-${idx + 1}`)
          }));
        }
      } catch (e) {}
    }

    let rawBlocks = [];
    if (/===\s*(?:STORY|CÂU CHUYỆN|PHẦN)\s*\d*\s*===/i.test(text)) {
      rawBlocks = text.split(/(?:^|\n|\s*)===\s*(?:STORY|CÂU CHUYỆN|PHẦN)\s*\d*\s*===\s*/i).map(p => p.trim()).filter(Boolean);
    } else if (/\n---+(\n|$)/.test(text)) {
      rawBlocks = text.split(/\n---+(\n|$)/).map(p => p.trim()).filter(Boolean);
    } else if (/\n===+(\n|$)/.test(text)) {
      rawBlocks = text.split(/\n===+(\n|$)/).map(p => p.trim()).filter(Boolean);
    } else {
      rawBlocks = [text];
    }

    return rawBlocks.map((block, idx) => {
      // Universal tag scanner: works seamlessly for both inline (single line) & multiline
      const tagRegex = /(?:^|\s+)(Tác giả|Tac gia|Author|Auteur|Thời gian|Thoi gian|Time|Temps|Tên Page|Ten Page|Page|Fanpage|Tiêu đề|Tieu de|Title|Titre|Nội dung thẻ|Noi dung the|Nội dung|Noi dung|Content|Video Text|Texte|Histoire|Highlights?|Nổi bật|Noi bat|Bôi đỏ|Nút CTA|Nut CTA|CTA|Bouton CTA|Kêu gọi|Caption|Mô tả|Mo ta|Description|Comment\s*1?|Comment|Bình luận\s*1?|Binh luan\s*1?|Bình luận|Binh luan|Part\s*2|PARTIE\s*2|Phần\s*2|Link|Pin_Link|Liên kết|Lien ket|Url):\s*/gi;

      let matches = [];
      let m;
      while ((m = tagRegex.exec(block)) !== null) {
        matches.push({
          tag: m[1].toLowerCase().replace(/\s+/g, ""),
          index: m.index,
          length: m[0].length
        });
      }

      const fields = {};
      for (let k = 0; k < matches.length; k++) {
        const cur = matches[k];
        const nextStart = (k + 1 < matches.length) ? matches[k + 1].index : block.length;
        fields[cur.tag] = block.substring(cur.index + cur.length, nextStart).trim();
      }

      const author = fields["tácgiả"] || fields["tacgia"] || fields["author"] || fields["auteur"] || defaultAuthor;
      const page = fields["tênpage"] || fields["tenpage"] || fields["page"] || fields["fanpage"] || defaultPage;
      const timeAgo = fields["thờigian"] || fields["thoigian"] || fields["time"] || fields["temps"] || "3h ago";
      const title = fields["tiêuđề"] || fields["tieude"] || fields["title"] || fields["titre"] || (`Story #${idx + 1}`);
      const cta = fields["nútcta"] || fields["nutcta"] || fields["cta"] || fields["boutoncta"] || fields["kêugọi"] || "Read Continuation In Caption";
      const pinLink = fields["link"] || fields["pin_link"] || fields["liênkết"] || fields["lienket"] || fields["url"] || (`https://example.com/story-${idx + 1}`);

      const rawHl = fields["highlights"] || fields["highlight"] || fields["nổibật"] || fields["noibat"] || fields["bôiđỏ"] || "";
      const highlights = rawHl ? rawHl.split("|").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean) : [];

      let content = fields["nộidungthẻ"] || fields["noidungthe"] || fields["nộidung"] || fields["noidung"] || fields["content"] || fields["videotext"] || fields["texte"] || fields["histoire"] || "";
      if (!content && matches.length === 0) {
        content = block;
      }

      let caption = fields["caption"] || fields["môtả"] || fields["mota"] || fields["description"] || "";
      let comment1 = fields["comment1"] || fields["comment"] || fields["bìnhluận1"] || fields["binhluan1"] || fields["bìnhluận"] || fields["binhluan"] || fields["part2"] || fields["partie2"] || fields["phần2"] || "";

      if (!caption) {
        caption = `${title}. What happened next stunned everyone... Read the full Part 2 in the first comment! 👇 #storytime #truestory #familydrama`;
      }
      if (!comment1) {
        comment1 = `PART 2: When the truth was finally revealed, nobody in the room could believe what had just transpired...`;
      }

      const handle = "@" + author.toLowerCase().replace(/[^a-z0-9]/g, "_");

      return {
        index: idx,
        author,
        handle,
        timeAgo,
        page,
        title,
        content,
        highlights,
        cta,
        caption,
        comment1,
        pinLink
      };
    });
  }'''

if old_parse_fn:
    engine_js = engine_js.replace(old_parse_fn.group(0), new_parse_fn, 1)
    print("Replaced parseStories function successfully.")
else:
    print("WARNING: Could not find old parseStories function to replace!")

# -------------------------------------------------------------
# 2. UPDATE COMPANION TXT: ONLY CAPTION AND COMMENT 1
# -------------------------------------------------------------
old_txt_fn = re.search(r'function buildCompanionTxtContent\(story, safeFileName, pageRaw, tpl\) \{[\s\S]*?return `[\s\S]*?================================================================================`;\s*\}', engine_js)

new_txt_fn = '''function buildCompanionTxtContent(story, safeFileName, pageRaw, tpl) {
    const cap = (story && story.caption) ? story.caption.trim() : "";
    const cmt = (story && story.comment1) ? story.comment1.trim() : "";
    return `Caption:
${cap}

Comment 1:
${cmt}`;
  }'''

if old_txt_fn:
    engine_js = engine_js.replace(old_txt_fn.group(0), new_txt_fn, 1)
    print("Replaced buildCompanionTxtContent to output strictly Caption and Comment 1.")
else:
    print("WARNING: Could not find old buildCompanionTxtContent function to replace!")

# -------------------------------------------------------------
# 3. 2-WAY SYNCHRONIZATION: HEADER INPUTS <-> STUDIO INPUTS
# -------------------------------------------------------------
sync_code = '''
  // 2-Way Sync between Top Header Inputs (pTen, pNv, pLang, tenXuat) and Studio Inputs
  function syncHeaderAndStudioNames() {
    const headerPrefix = (typeof tenXuat === "function" && tenXuat()) || (typeof page !== "undefined" && page.ten) || "";
    if (headerPrefix && studioPageName) {
      studioPageName.value = headerPrefix;
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
      syncHeaderAndStudioNames();
      updateLivePreview();
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
      if (pTenEl && !pTenEl.value) {
        pTenEl.value = studioPageName.value;
        if (typeof veTen === "function") veTen();
      }
    });
  }
'''

# -------------------------------------------------------------
# 4. ROBUST TEMPLATE SELECTION, DROPDOWN & 100% UNIFORM MODE
# -------------------------------------------------------------
old_dropdown_fn = re.search(r'function populateTemplateDropdown\(\) \{[\s\S]*?selectStudioLockedTemplate\.value = \(.*?\) \? currentVal : studioLockedTemplateIdx;\s*\}', engine_js)

new_dropdown_fn = '''function populateTemplateDropdown(targetIdx) {
    if (!selectStudioLockedTemplate || typeof MAU === "undefined") return;
    const desired = (targetIdx !== undefined && !isNaN(targetIdx)) ? targetIdx : studioLockedTemplateIdx;
    selectStudioLockedTemplate.innerHTML = "";
    MAU.forEach((m, idx) => {
      const palIdx = (state && state[idx]) ? state[idx].pal : 0;
      const pal = (m.pals && m.pals[palIdx]) ? m.pals[palIdx] : m.pals[0];
      const isPicked = state && state[idx] && state[idx].picked;
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = `${String(idx + 1).padStart(2, '0')}. ${m.label} [${m.id}] • Màu: ${pal.id}${isPicked ? ' ★ (Đã tick)' : ''}`;
      selectStudioLockedTemplate.appendChild(opt);
    });
    selectStudioLockedTemplate.value = desired;
    studioLockedTemplateIdx = desired;
  }'''

if old_dropdown_fn:
    engine_js = engine_js.replace(old_dropdown_fn.group(0), new_dropdown_fn, 1)
    print("Replaced populateTemplateDropdown function successfully.")

# Replace openStudio function to auto-lock picked template
old_open_studio = re.search(r'function openStudio\(\) \{[\s\S]*?studioModal\.style\.display = "flex";[\s\S]*?updateLivePreview\(\);\s*\}\s*\}', engine_js)

new_open_studio = '''function openStudio() {
    if (!studioModal) return;
    syncHeaderAndStudioNames();

    const picked = getPickedTemplates();
    if (picked.length === 1) {
      // Exactly 1 template is picked: strictly lock to this single template!
      studioLockedTemplateIdx = picked[0].index;
      currentStudioMode = "single";
    } else if (picked.length > 1) {
      if (currentStudioMode === "single") {
        if (typeof window.lastPickedTemplateIdx === "number" && picked.some(p => p.index === window.lastPickedTemplateIdx)) {
          studioLockedTemplateIdx = window.lastPickedTemplateIdx;
        } else if (!picked.some(p => p.index === studioLockedTemplateIdx)) {
          studioLockedTemplateIdx = picked[0].index;
        }
      }
    }

    populateTemplateDropdown(studioLockedTemplateIdx);
    setStudioMode(currentStudioMode);
    studioModal.style.display = "flex";
    buildBatchTemplatePlan(targetVideoCount);
    updatePickedUI();
    updateLivePreview();
  }'''

if old_open_studio:
    engine_js = engine_js.replace(old_open_studio.group(0), new_open_studio, 1)
    print("Replaced openStudio function successfully.")

# Replace openStudioWithTemplate
old_open_with_tpl = re.search(r'window\.openStudioWithTemplate = function\(i\) \{[\s\S]*?openStudio\(\);\s*\};', engine_js)

new_open_with_tpl = '''window.openStudioWithTemplate = function(i) {
    if (typeof i !== "number" || isNaN(i) || typeof MAU === "undefined" || !MAU[i]) i = 0;
    studioLockedTemplateIdx = i;
    window.lastPickedTemplateIdx = i;
    currentStudioMode = "single";

    // Unpick all other templates, mark ONLY template i as picked
    if (typeof state !== "undefined" && Array.isArray(state)) {
      state.forEach((s, k) => {
        s.picked = (k === i);
        if (typeof cards !== "undefined" && cards[k]) {
          cards[k].classList.toggle("picked", k === i);
          const cb = cards[k].querySelector("input");
          if (cb) cb.checked = (k === i);
        }
      });
      if (typeof luu === "function") luu();
      if (typeof demChon === "function") demChon();
    }

    populateTemplateDropdown(i);
    setStudioMode("single");
    if (studioModal) studioModal.style.display = "flex";
    buildBatchTemplatePlan(targetVideoCount);
    updatePickedUI();
    updateLivePreview();
  };'''

if old_open_with_tpl:
    engine_js = engine_js.replace(old_open_with_tpl.group(0), new_open_with_tpl, 1)
    print("Replaced openStudioWithTemplate function successfully.")

# Replace buildBatchTemplatePlan to ensure 100% clone in Single Mode
old_build_plan = re.search(r'function buildBatchTemplatePlan\(count\) \{[\s\S]*?batchTemplatePlan = pool\.slice\(0, count\);\s*\}', engine_js)

new_build_plan = '''function buildBatchTemplatePlan(count) {
    batchTemplatePlan = [];

    // Mode 1: Strict Single Locked Template (100% Uniform for all N videos)
    if (currentStudioMode === "single") {
      const lockedTpl = getTemplateObj(studioLockedTemplateIdx);
      batchTemplatePlan = Array.from({ length: count }, () => ({ ...lockedTpl }));
      return;
    }

    // Mode 2: Random Scramble across picked templates
    const picked = getPickedTemplates();
    if (picked.length === 0) {
      const fallbackTpl = getTemplateObj(studioLockedTemplateIdx);
      batchTemplatePlan = Array.from({ length: count }, () => ({ ...fallbackTpl }));
      return;
    }

    if (picked.length === 1) {
      batchTemplatePlan = Array.from({ length: count }, () => ({ ...picked[0] }));
      return;
    }

    const pool = [];
    while (pool.length < count) {
      const shuffled = [...picked].sort(() => Math.random() - 0.5);
      pool.push(...shuffled);
    }
    batchTemplatePlan = pool.slice(0, count);
  }'''

if old_build_plan:
    engine_js = engine_js.replace(old_build_plan.group(0), new_build_plan, 1)
    print("Replaced buildBatchTemplatePlan function successfully.")

# Replace batch render loop to ensure exact naming and strictly locked template
old_batch_render = re.search(r'if \(btnRenderBatch30\) \{[\s\S]*?btnRenderBatch30\.onclick = async \(\) => \{[\s\S]*?btnRenderBatch30\.disabled = false;\s*\};\s*\}', engine_js)

new_batch_render = '''if (btnRenderBatch30) {
    btnRenderBatch30.onclick = async () => {
      if (!parsedStories || parsedStories.length === 0) return alert("Không có kịch bản để render! Vui lòng nạp hoặc nhập kịch bản.");
      
      const count = targetVideoCount;
      const dur = selectStudioDuration ? parseInt(selectStudioDuration.value, 10) : 10;
      
      buildBatchTemplatePlan(count);

      btnRenderBatch30.disabled = true;
      if (renderProgressBox) renderProgressBox.style.display = "block";
      if (btnDownloadAllZip) btnDownloadAllZip.style.display = "none";
      renderedFiles = [];

      // Calculate uniform base name prefix from inputs: e.g. PT_dfd_edf
      const basePrefix = (typeof tenXuat === "function" && tenXuat()) || (studioPageName ? studioPageName.value.trim() : "") || (typeof page !== "undefined" && page.ten) || "Reels";
      const safePrefix = basePrefix.replace(/[/\\\\:*?"<>|]/g, '_').trim() || "Reels";

      for (let i = 0; i < count; i++) {
        const story = parsedStories[i % parsedStories.length];
        const activeTpl = (currentStudioMode === "single") ? getTemplateObj(studioLockedTemplateIdx) : getTemplateForStory(i);

        const safeNum = String(i + 1).padStart(2, "0");
        const safeFileName = `${safePrefix}_Video_${safeNum}`;

        if (renderStatusText) {
          renderStatusText.textContent = `Đang render video ${i + 1}/${count}: [${safeFileName}] - Mẫu: ${activeTpl.label}...`;
        }
        const basePct = Math.round((i / count) * 100);
        if (renderProgressBar) renderProgressBar.style.width = basePct + "%";
        if (renderPercentText) renderPercentText.textContent = basePct + "%";

        try {
          const mp4Blob = await recordStoryVideo(story, dur, i);

          renderedFiles.push({
            name: safeFileName + ".mp4",
            blob: mp4Blob
          });

          const txtContent = buildCompanionTxtContent(story, safeFileName, safePrefix, activeTpl);

          renderedFiles.push({
            name: safeFileName + ".txt",
            blob: new Blob([txtContent], { type: "text/plain;charset=utf-8" })
          });
        } catch(err) {
          console.error(`Error rendering video ${i + 1}:`, err);
        }
      }

      if (renderProgressBar) renderProgressBar.style.width = "100%";
      if (renderPercentText) renderPercentText.textContent = "100%";
      if (renderStatusText) renderStatusText.textContent = `✓ Đã render xong đúng ${renderedFiles.length / 2} video! Đang nén file ZIP tự động tải về...`;
      
      if (btnDownloadAllZip) {
        btnDownloadAllZip.style.display = "block";
        btnDownloadAllZip.textContent = `📦 TẢI TOÀN BỘ ${renderedFiles.length / 2} VIDEO & TXT (.ZIP TRỌN GÓI)`;
        btnDownloadAllZip.click();
      }

      btnRenderBatch30.disabled = false;
    };
  }'''

if old_batch_render:
    engine_js = engine_js.replace(old_batch_render.group(0), new_batch_render, 1)
    print("Replaced batch render loop successfully.")

# Replace btnRenderSingle to use exact naming
old_single_render = re.search(r'if \(btnRenderSingle\) \{[\s\S]*?btnRenderSingle\.onclick = async \(\) => \{[\s\S]*?btnRenderSingle\.disabled = false;\s*\}\s*catch\(err\) \{[\s\S]*?btnRenderSingle\.disabled = false;\s*\}\s*\};\s*\}', engine_js)

new_single_render = '''if (btnRenderSingle) {
    btnRenderSingle.onclick = async () => {
      if (!parsedStories || parsedStories.length === 0) return alert("Không có kịch bản để render!");
      const story = parsedStories[currentStoryIdx] || parsedStories[0];
      const dur = selectStudioDuration ? parseInt(selectStudioDuration.value, 10) : 10;
      const tpl = (currentStudioMode === "single") ? getTemplateObj(studioLockedTemplateIdx) : getTemplateForStory(currentStoryIdx);

      const basePrefix = (typeof tenXuat === "function" && tenXuat()) || (studioPageName ? studioPageName.value.trim() : "") || (typeof page !== "undefined" && page.ten) || "Reels";
      const safePrefix = basePrefix.replace(/[/\\\\:*?"<>|]/g, '_').trim() || "Reels";
      const safeNum = String(currentStoryIdx + 1).padStart(2, "0");
      const safeFileName = `${safePrefix}_Video_${safeNum}`;

      btnRenderSingle.disabled = true;
      if (renderProgressBox) renderProgressBox.style.display = "block";
      if (renderStatusText) renderStatusText.textContent = `Đang render thử video #${currentStoryIdx + 1} [${tpl.label}] (${dur}s)...`;
      if (renderProgressBar) renderProgressBar.style.width = "10%";
      if (renderPercentText) renderPercentText.textContent = "10%";

      try {
        const blob = await recordStoryVideo(story, dur, currentStoryIdx);
        
        if (renderProgressBar) renderProgressBar.style.width = "100%";
        if (renderPercentText) renderPercentText.textContent = "100%";
        if (renderStatusText) renderStatusText.textContent = "✓ Hoàn thành! Đang tải file xuống...";

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${safeFileName}.mp4`;
        a.click();

        const txtContent = buildCompanionTxtContent(story, safeFileName, safePrefix, tpl);

        const txtBlob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
        const a2 = document.createElement("a");
        a2.href = URL.createObjectURL(txtBlob);
        a2.download = `${safeFileName}.txt`;
        a2.click();

        btnRenderSingle.disabled = false;
        if (renderStatusText) renderStatusText.textContent = `✓ Đã tải 1 Video thành công: [${safeFileName}] (.mp4 + .txt)`;
      } catch(err) {
        console.error("Single render error:", err);
        if (renderStatusText) renderStatusText.textContent = "Lỗi khi render video: " + err.message;
        btnRenderSingle.disabled = false;
      }
    };
  }'''

if old_single_render:
    engine_js = engine_js.replace(old_single_render.group(0), new_single_render, 1)
    print("Replaced single render function successfully.")

# Replace zip file naming
engine_js = engine_js.replace(
    'a.download = `${safePage}_Tron_Goi_${renderedFiles.length / 2}_Videos.zip`;',
    '''const basePrefix = (typeof tenXuat === "function" && tenXuat()) || (studioPageName ? studioPageName.value.trim() : "") || "Reels";
      const safePrefix = basePrefix.replace(/[/\\\\:*?"<>|]/g, '_').trim() || "Reels";
      a.download = `${safePrefix}_Tron_Goi_${renderedFiles.length / 2}_Videos.zip`;'''
)

# Append 2-way sync code to initialization
engine_js = engine_js.replace(
    '// INITIALIZATION',
    sync_code + '\n  // INITIALIZATION'
)

# Save studio_engine_v11.js
with open('studio_engine_v11.js', 'w', encoding='utf-8') as f:
    f.write(engine_js)
print("Saved studio_engine_v11.js cleanly.")

# -------------------------------------------------------------
# 5. ASSEMBLE INDEX.HTML WITH CARD BUTTONS & STUDIO ENGINE V11
# -------------------------------------------------------------
# Check if build_studio_v10.py has the HTML templates
with open('build_studio_v10.py', 'r', encoding='utf-8') as f:
    builder_code = f.read()

# Extract floating_bar_html, dialog_quychuan_html, studio_modal_html from build_studio_v10.py
m_floating = re.search(r'floating_bar_html\s*=\s*"""([\s\S]*?)"""', builder_code)
m_dialog = re.search(r'dialog_quychuan_html\s*=\s*"""([\s\S]*?)"""', builder_code)
m_studio = re.search(r'studio_modal_html\s*=\s*"""([\s\S]*?)"""', builder_code)

floating_bar_html = m_floating.group(0).split('=', 1)[1].strip()[3:-3]
dialog_quychuan_html = m_dialog.group(0).split('=', 1)[1].strip()[3:-3]
studio_modal_html = m_studio.group(0).split('=', 1)[1].strip()[3:-3]

# Extract MAU data & Assets from kho-mau-v1.6.html
m_mau = re.search(r'<script id="mau-data"[^>]*>(.*?)</script>', html, re.S)
mau_data = json.loads(m_mau.group(1))

templates_info = []
for idx, m in enumerate(mau_data):
    pals_info = []
    for p_idx, pal in enumerate(m["pals"]):
        p_html = pal["html"]
        vars_found = dict(re.findall(r'--([a-zA-Z0-9_-]+):\s*([^;}]+)', p_html))
        pals_info.append({
            "id": pal["id"],
            "vars": vars_found
        })
    templates_info.append({
        "index": idx,
        "id": m["id"],
        "label": m["label"],
        "ho": m.get("ho") or ("dark-photo" if "photo" in m["id"] else ("notebook" if "notebook" in m["id"] else ("bang-dong" if "dong" in m["id"] else "the-vet"))),
        "pals": pals_info
    })

bg_files = sorted([f for f in os.listdir('assets/backgrounds') if f.endswith('.mp4')])
avatar_files = sorted([f for f in os.listdir('assets/avatars') if f.lower().endswith(('.jpg', '.png', '.jpeg'))])

# Extract sample stories by country from build_studio_v10.py
m_stories = re.search(r'stories_by_country\s*=\s*(\{[\s\S]*?\n\})', builder_code)
stories_by_country = eval(m_stories.group(1))

# Modify taoThe in base html to include "✏️ Chỉnh sửa mẫu" and "⚡ Tạo video mẫu này"
old_tao_the_line = '<label class="pick"><input type="checkbox"> Chọn mẫu này</label>'
new_tao_the_line = """<label class="pick"><input type="checkbox"> Chọn mẫu này</label>
      <div class="card-actions" style="display:flex;gap:6px;margin-top:8px;">
        <button class="btn-card-edit" type="button" style="flex:1;background:rgba(52,211,153,0.18);border:1px solid rgba(52,211,153,0.45);color:#34d399;font-size:11.5px;font-weight:700;padding:6px 6px;border-radius:6px;cursor:pointer;">✏️ Chỉnh sửa mẫu</button>
        <button class="btn-card-gen" type="button" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);border:none;color:#fff;font-size:11.5px;font-weight:800;padding:6px 12px;border-radius:6px;cursor:pointer;box-shadow:0 2px 8px rgba(16,185,129,0.35);">⚡ Tạo video mẫu này</button>
      </div>"""
if old_tao_the_line in html:
    html = html.replace(old_tao_the_line, new_tao_the_line)

# Add event listeners inside taoThe function in script
old_onchange_code = """cb.onchange = () => {
    state[i].picked = cb.checked;
    el.classList.toggle("picked", cb.checked);
    luu(); demChon();
  };
  return el;"""

new_onchange_code = """cb.onchange = () => {
    state[i].picked = cb.checked;
    el.classList.toggle("picked", cb.checked);
    if (cb.checked) {
      window.lastPickedTemplateIdx = i;
      if (typeof window.openStudioWithTemplate === "function") {
        // Do not auto-open on tick, but store active selection
      }
    }
    luu(); demChon();
  };
  const bEdit = el.querySelector(".btn-card-edit");
  if (bEdit) bEdit.onclick = (e) => { e.stopPropagation(); moChinh(i); };
  const bGen = el.querySelector(".btn-card-gen");
  if (bGen) bGen.onclick = (e) => {
    e.stopPropagation();
    if (typeof window.openStudioWithTemplate === "function") window.openStudioWithTemplate(i);
    else moChinh(i);
  };
  return el;"""

if old_onchange_code in html:
    html = html.replace(old_onchange_code, new_onchange_code)

# Add Top Header Button "🚀 MỞ STUDIO TẠO VIDEO"
header_target = '<button id="btnTaoFile" class="act primary">Tạo file page</button>'
header_replacement = """<button id="btnTaoFile" class="act primary">Tạo file page</button>
  <button id="btnOpenQuyChuan" type="button" class="act" style="background: rgba(255,255,255,0.08); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.2); font-weight: 700; cursor: pointer; padding: 7px 14px; border-radius: 8px;">
    📋 Quy chuẩn nạp file
  </button>
  <button id="btnMoStudio" type="button" class="act" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; font-weight: 800; border: none; box-shadow: 0 4px 15px rgba(16,185,129,0.45); cursor: pointer; padding: 7px 18px; border-radius: 8px;">
    🚀 MỞ STUDIO TẠO VIDEO
  </button>"""
if header_target in html:
    html = html.replace(header_target, header_replacement)

# Add Footer Button
footer_target = '<button id="tao" class="pri">Tạo hồ sơ page</button>'
footer_replacement = """<button id="tao" class="pri">Tạo hồ sơ page</button>
  <button id="btnFooterStudio" type="button" class="act" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; font-weight: 800; border: none; box-shadow: 0 4px 15px rgba(16,185,129,0.45); cursor: pointer; padding: 7px 16px; border-radius: 8px; margin-left: 8px;">
    🚀 MỞ STUDIO GEN VIDEO
  </button>"""
if footer_target in html:
    html = html.replace(footer_target, footer_replacement)

# Inject Chinh Editor action buttons
chinh_actions_target = '<button id="cDong">Đóng</button>'
chinh_actions_replacement = """<button id="cDong">Đóng</button>
      <button id="btnGenFromChinh" type="button" style="background: #10b981; color: #fff; font-weight: 800; border: none; border-radius: 8px; padding: 6px 14px; cursor: pointer; box-shadow: 0 2px 10px rgba(16,185,129,0.4);">
        🎬 Xuất video mẫu này ngay
      </button>
      <button id="btnOpenStudioWithThis" type="button" style="background: rgba(52,211,153,0.2); color: #34d399; font-weight: 800; border: 1px solid #10b981; border-radius: 8px; padding: 6px 14px; cursor: pointer;">
        🚀 Mở Studio làm hàng loạt từ mẫu này
      </button>"""
if chinh_actions_target in html:
    html = html.replace(chinh_actions_target, chinh_actions_replacement)

# Build Script with Injected Data
script_with_data = f"""
<script>
window.TPL_METAS = {json.dumps(templates_info)};
window.BG_FILES = {json.dumps(bg_files)};
window.AVATAR_FILES = {json.dumps(avatar_files)};
window.STORIES_BY_COUNTRY = {json.dumps(stories_by_country)};
</script>
<script>
{engine_js}
</script>
"""

final_html = html + "\n" + floating_bar_html + "\n" + dialog_quychuan_html + "\n" + studio_modal_html + "\n" + script_with_data

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(final_html)

print("make_v11.py executed successfully! index.html written.")
