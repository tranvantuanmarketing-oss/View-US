// Việt Reels Studio Pro Engine v8.0
// Ultra-Robust: 100% Null-Guarded, Direct Editor Integration, Instant Video Generation

(function() {
  console.log("🚀 Initializing Việt Reels Studio Pro Engine v12.0 (100% Native-Matched Typography & Full-Card AutoFit)...");

  // DOM Elements - Studio Modal
  const studioModal = document.getElementById("studioModal");
  const studioCloseBtn = document.getElementById("studioCloseBtn");
  const btnMoStudio = document.getElementById("btnMoStudio");
  const btnFloatingGen = document.getElementById("btnFloatingGen");
  const floatingGenBar = document.getElementById("floatingGenBar");
  const floatPickNum = document.getElementById("floatPickNum");
  const floatPickNames = document.getElementById("floatPickNames");
  const headerPickCount = document.getElementById("headerPickCount");
  const studioActiveTemplateBadge = document.getElementById("studioActiveTemplateBadge");
  const studioTemplateStatusBox = document.getElementById("studioTemplateStatusBox");
  const studioTemplateModeTitle = document.getElementById("studioTemplateModeTitle");
  const studioTemplateDetailsList = document.getElementById("studioTemplateDetailsList");

  // Inputs & Controls
  const studioPageName = document.getElementById("studioPageName");
  const studioAuthorName = document.getElementById("studioAuthorName");
  const selectStudioCountry = document.getElementById("selectStudioCountry");
  const btnModeSingle = document.getElementById("btnModeSingle");
  const btnModeRandom = document.getElementById("btnModeRandom");
  const boxSingleModeControls = document.getElementById("boxSingleModeControls");
  const boxRandomModeControls = document.getElementById("boxRandomModeControls");
  const selectStudioLockedTemplate = document.getElementById("selectStudioLockedTemplate");
  const btnClearAllPicked = document.getElementById("btnClearAllPicked");
  const btnPickAllTemplates = document.getElementById("btnPickAllTemplates");
  const selectStudioDuration = document.getElementById("selectStudioDuration");
  const selectStudioBgMode = document.getElementById("selectStudioBgMode");
  const studioBatchTextarea = document.getElementById("studioBatchTextarea");
  const statStoryCountDisplay = document.getElementById("statStoryCountDisplay");
  const statAvatarNum = document.getElementById("statAvatarNum");
  const studioAvatarList = document.getElementById("studioAvatarList");
  const uploadAvatarInput = document.getElementById("uploadAvatarInput");
  const uploadScriptInput = document.getElementById("uploadScriptInput");
  const uploadCustomBg = document.getElementById("uploadCustomBg");
  const bgVideoGrid = document.getElementById("bgVideoGrid");
  const selectedBgBadge = document.getElementById("selectedBgBadge");
  const btnBatchNumLabel = document.getElementById("btnBatchNumLabel");
  const inputCustomVideoCount = document.getElementById("inputCustomVideoCount");
  const btnReloadSampleStories = document.getElementById("btnReloadSampleStories");

  // Tabs
  const tabScriptBtn = document.getElementById("tabScriptBtn");
  const tabAvatarBtn = document.getElementById("tabAvatarBtn");
  const tabBgVideoBtn = document.getElementById("tabBgVideoBtn");
  const tabScriptContent = document.getElementById("tabScriptContent");
  const tabAvatarContent = document.getElementById("tabAvatarContent");
  const tabBgVideoContent = document.getElementById("tabBgVideoContent");

  // Modals & Navigation
  const dlgQuyChuan = document.getElementById("dlgQuyChuan");
  const btnOpenQuyChuan = document.getElementById("btnOpenQuyChuan");
  const btnCopySampleTxt = document.getElementById("btnCopySampleTxt");
  const btnCopySampleJson = document.getElementById("btnCopySampleJson");
  const btnDownloadSampleTxtFile = document.getElementById("btnDownloadSampleTxtFile");
  const btnPrevStory = document.getElementById("btnPrevStory");
  const btnNextStory = document.getElementById("btnNextStory");
  const currentStoryIndexBadge = document.getElementById("currentStoryIndexBadge");
  const previewTplInfo = document.getElementById("previewTplInfo");
  const previewStoryNumBadge = document.getElementById("previewStoryNumBadge");
  const previewCurrentCaption = document.getElementById("previewCurrentCaption");
  const btnCopyCurrentCaption = document.getElementById("btnCopyCurrentCaption");
  const previewCurrentComment1 = document.getElementById("previewCurrentComment1");
  const btnCopyCurrentComment1 = document.getElementById("btnCopyCurrentComment1");
  const studioPreviewIframe = document.getElementById("studioPreviewIframe");
  const studioCanvas = document.getElementById("studioCanvas");
  const studioCtx = studioCanvas ? studioCanvas.getContext("2d") : null;
  const studioBgVideo = document.getElementById("studioBgVideoElement");

  // Action & Progress Buttons
  const btnRenderSingle = document.getElementById("btnRenderSingle");
  const btnRenderBatch30 = document.getElementById("btnRenderBatch30");
  const btnDownloadAllZip = document.getElementById("btnDownloadAllZip");
  const renderProgressBox = document.getElementById("renderProgressBox");
  const renderStatusText = document.getElementById("renderStatusText");
  const renderPercentText = document.getElementById("renderPercentText");
  const renderProgressBar = document.getElementById("renderProgressBar");

  // Chinh Editor Controls
  const btnGenFromChinh = document.getElementById("btnGenFromChinh");
  const btnOpenStudioWithThis = document.getElementById("btnOpenStudioWithThis");
  const cDuration = document.getElementById("cDuration");
  const cBgMode = document.getElementById("cBgMode");
  const cRenderProgress = document.getElementById("cRenderProgress");
  const cRenderStatus = document.getElementById("cRenderStatus");
  const cRenderPercent = document.getElementById("cRenderPercent");
  const cProgressBar = document.getElementById("cProgressBar");
  const cTplIdBadge = document.getElementById("cTplIdBadge");

  // Global Engine State
  let currentCountry = "us";
  let targetVideoCount = 30;
  let currentStoryIdx = 0;
  let parsedStories = [];
  let batchTemplatePlan = [];
  let selectedAvatar = (window.AVATAR_FILES && window.AVATAR_FILES[0]) || "av_01.jpg";
  let activeSelectedBg = (window.BG_FILES && window.BG_FILES[0]) || "clip_01.mp4";
  let currentBgMode = "random";
  let isRecording = false;
  let renderedFiles = [];
  let avatarCache = {};
  let globalAudioCtx = null;
  let globalAudioElement = null;
  let globalAudioSourceNode = null;
  let globalAudioDestNode = null;

  // 1. EXTRACT ALL PICKED TEMPLATES WITH ACTIVE PALETTES & MANUAL ADJUSTMENTS
  function getPickedTemplates() {
    const picked = [];
    if (typeof state !== "undefined" && Array.isArray(state) && typeof MAU !== "undefined") {
      state.forEach((s, idx) => {
        if (s.picked && MAU[idx]) {
          const m = MAU[idx];
          const palIdx = (s.pal !== undefined && s.pal >= 0 && s.pal < m.pals.length) ? s.pal : 0;
          const activePal = m.pals[palIdx];
          const meta = (window.TPL_METAS && window.TPL_METAS[idx]) || {};
          const palMeta = (meta.pals && meta.pals[palIdx]) ? meta.pals[palIdx] : { vars: {} };
          
          picked.push({
            index: idx,
            id: m.id,
            label: m.label,
            ho: meta.ho || m.ho || "the-vet",
            palIdx: palIdx,
            palId: activePal.id,
            palName: `${palIdx + 1}/${m.pals.length} (${activePal.id})`,
            rawHtml: activePal.html,
            vars: palMeta.vars || {}
          });
        }
      });
    }
    return picked;
  }

  // 2. BATCH TEMPLATE PLAN & DUAL MODE ENGINE (100% UNIFIED SINGLE vs RANDOM)
  let currentStudioMode = "single"; // "single" (Locked 1 template) | "random" (Scramble picked)
  let studioLockedTemplateIdx = 0;

  function getTemplateObj(idx) {
    if (typeof MAU === "undefined" || !MAU[idx]) idx = 0;
    const m = MAU[idx];
    const palIdx = (state && state[idx] && state[idx].pal !== undefined) ? state[idx].pal : 0;
    const activePal = (m.pals && m.pals[palIdx]) ? m.pals[palIdx] : m.pals[0];
    const meta = (window.TPL_METAS && window.TPL_METAS[idx]) || {};
    const palMeta = (meta.pals && meta.pals[palIdx]) ? meta.pals[palIdx] : { vars: {} };
    return {
      index: idx,
      id: m.id,
      label: m.label,
      ho: meta.ho || m.ho || "the-vet",
      palIdx: palIdx,
      palId: activePal.id,
      palName: `${palIdx + 1}/${m.pals.length} (${activePal.id})`,
      rawHtml: activePal.html,
      vars: palMeta.vars || {}
    };
  }

  function setStudioMode(mode) {
    currentStudioMode = mode;
    if (mode === "single") {
      if (btnModeSingle) { btnModeSingle.style.background = "#10b981"; btnModeSingle.style.color = "#fff"; }
      if (btnModeRandom) { btnModeRandom.style.background = "transparent"; btnModeRandom.style.color = "#a7f3d0"; }
      if (boxSingleModeControls) boxSingleModeControls.style.display = "flex";
      if (boxRandomModeControls) boxRandomModeControls.style.display = "none";
    } else {
      if (btnModeRandom) { btnModeRandom.style.background = "#10b981"; btnModeRandom.style.color = "#fff"; }
      if (btnModeSingle) { btnModeSingle.style.background = "transparent"; btnModeSingle.style.color = "#a7f3d0"; }
      if (boxSingleModeControls) boxSingleModeControls.style.display = "none";
      if (boxRandomModeControls) boxRandomModeControls.style.display = "flex";
    }
    buildBatchTemplatePlan(targetVideoCount);
    updatePickedUI();
    updateLivePreview();
  }

  function populateTemplateDropdown(targetIdx) {
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
  }

  function buildBatchTemplatePlan(count) {
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
  }

  function getTemplateForStory(storyIndex) {
    if (batchTemplatePlan && batchTemplatePlan[storyIndex]) {
      return batchTemplatePlan[storyIndex];
    }
    return getTemplateObj(studioLockedTemplateIdx);
  }

  // 3. BUILD 100% NATIVE HTML (APPLYING OVALL MANUAL ADJUSTMENTS)
  function buildStoryHtml(mIdx, palIdx, story) {
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

    const defaultPage = studioPageName ? studioPageName.value : "Daily Confessions";
    const displayName = (story && story.page) ? story.page : defaultPage;
    const timeDisplay = (story && story.timeAgo) ? story.timeAgo : "3h ago";
    const ctaDisplay = (story && story.cta) ? story.cta : "Continuer la lecture dans les commentaires";

    tplHtml = tplHtml
      .split("@@NAME@@").join(displayName)
      .split("@@TIME@@").join(timeDisplay)
      .split("@@CTA@@").join(ctaDisplay)
      .split("@@CTABOX@@").join(ctaDisplay)
      .split("@@CTAPILL@@").join(ctaDisplay)
      .split("@@BAR@@").join(ctaDisplay);

    let bodyHtml = "";
    const paragraphs = ((story && story.content) || "").split(/\n+/).map(p => p.trim()).filter(Boolean);
    
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
  }

  function updateLivePreview() {
    if (!parsedStories || parsedStories.length === 0) return;
    const story = parsedStories[currentStoryIdx] || parsedStories[0];
    const tpl = getTemplateForStory(currentStoryIdx);
    
    if (previewTplInfo && tpl) {
      const pName = story ? (story.page || (studioPageName ? studioPageName.value : "")) : "";
      previewTplInfo.textContent = `Video #${currentStoryIdx + 1}: [${tpl.label} • ${tpl.palName}] - ${pName}`;
    }

    const fullHtml = buildStoryHtml(tpl.index, tpl.palIdx, story);
    if (studioPreviewIframe) {
      studioPreviewIframe.srcdoc = fullHtml;
      studioPreviewIframe.onload = () => {
        try {
          if (typeof apChinh === "function") {
            apChinh(studioPreviewIframe, tpl.index);
          }
          studioPreviewIframe.contentWindow?.fitBody?.();
          for (const v of studioPreviewIframe.contentDocument.querySelectorAll("video")) {
            v.muted = true;
            v.play().catch(() => {});
          }
        } catch(e) {}
      };
    }
  }

  // 4. SYNCHRONOUS PICKED UI UPDATER
  function updatePickedUI() {
    const picked = getPickedTemplates();
    const count = picked.length;
    if (headerPickCount) headerPickCount.textContent = count;
    if (floatPickNum) floatPickNum.textContent = count;

    if (count > 0) {
      if (floatingGenBar) floatingGenBar.style.display = "flex";
      const names = picked.map(p => `${p.label}`).slice(0, 3).join(", ");
      if (floatPickNames) floatPickNames.textContent = names + (count > 3 ? ` (+${count - 3} mẫu)` : "");
    } else {
      if (floatingGenBar) floatingGenBar.style.display = "none";
    }

    if (currentStudioMode === "single") {
      const t = getTemplateObj(studioLockedTemplateIdx);
      if (studioActiveTemplateBadge) {
        studioActiveTemplateBadge.textContent = `🔒 Đồng nhất: ${t.label}`;
        studioActiveTemplateBadge.style.color = "#34d399";
      }
      if (studioTemplateModeTitle) {
        studioTemplateModeTitle.innerHTML = `🔒 CHẾ ĐỘ ĐỒNG NHẤT 1 MẪU DUY NHẤT: <span style="color:#fff;">${t.label}</span>`;
      }
      if (studioTemplateDetailsList) {
        studioTemplateDetailsList.innerHTML = `Tất cả <b>${targetVideoCount} video</b> xuất ra sẽ làm <b>đúng 100% theo mẫu [${t.label}]</b>, giữ nguyên màu sắc và vị trí kéo thả đã chỉnh.`;
      }
      if (studioTemplateStatusBox) {
        studioTemplateStatusBox.style.borderColor = "rgba(16, 185, 129, 0.7)";
        studioTemplateStatusBox.style.background = "rgba(16, 185, 129, 0.15)";
      }
    } else {
      if (studioActiveTemplateBadge) {
        studioActiveTemplateBadge.textContent = `🎲 Random: ${count} mẫu đã chọn`;
        studioActiveTemplateBadge.style.color = count > 0 ? "#60a5fa" : "#fca5a5";
      }
      if (studioTemplateModeTitle) {
        studioTemplateModeTitle.innerHTML = `🎲 CHẾ ĐỘ RANDOM LỘN XỘN GIỮA ${count} MẪU ĐÃ TICK:`;
      }
      if (studioTemplateDetailsList) {
        if (count === 0) {
          studioTemplateDetailsList.innerHTML = `<span style="color:#fca5a5;">Chưa tick mẫu nào. Hãy tick các mẫu bên dưới hoặc bấm [Chọn tất cả 76 mẫu].</span>`;
        } else {
          const chips = picked.map(p => `<span style="display:inline-block;background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:6px;margin:2px 4px 2px 0;">✓ <b>${p.label}</b> (${p.palName})</span>`).join("");
          studioTemplateDetailsList.innerHTML = chips;
        }
      }
      if (studioTemplateStatusBox) {
        studioTemplateStatusBox.style.borderColor = "rgba(96, 165, 250, 0.6)";
        studioTemplateStatusBox.style.background = "rgba(59, 130, 246, 0.12)";
      }
    }
  }

  // Hook into competitor's demChon()
  if (typeof window.demChon === "function") {
    const origDemChon = window.demChon;
    window.demChon = function() {
      origDemChon();
      updatePickedUI();
    };
  }

  // Hook into competitor's moChinh(i) to update the Chinh modal video box
  if (typeof window.moChinh === "function") {
    const origMoChinh = window.moChinh;
    window.moChinh = function(i) {
      origMoChinh(i);
      if (cTplIdBadge && typeof MAU !== "undefined" && MAU[i]) {
        cTplIdBadge.textContent = MAU[i].id;
      }
    };
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".card .pal button") || e.target.closest(".card .pick input") || e.target.closest(".card") || e.target.id === "clear" || e.target.closest("section header label input")) {
      setTimeout(updatePickedUI, 30);
    }
  });

  // Modal Dialog Open/Close with Full Null-Guards
  function openStudio() {
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
  }

  if (btnMoStudio) btnMoStudio.onclick = openStudio;
  if (btnFloatingGen) btnFloatingGen.onclick = openStudio;
  const btnFooterStudio = document.getElementById("btnFooterStudio");
  if (btnFooterStudio) btnFooterStudio.onclick = openStudio;

  if (studioCloseBtn) {
    studioCloseBtn.onclick = () => {
      if (studioModal) studioModal.style.display = "none";
    };
  }

  if (btnOpenQuyChuan && dlgQuyChuan) {
    btnOpenQuyChuan.onclick = () => { dlgQuyChuan.showModal(); };
  }

  if (btnCopySampleTxt) {
    btnCopySampleTxt.onclick = () => {
      const sample = `=== STORY 1 ===
Tác giả: Emily Vance
Thời gian: 3h ago
Tên Page: Daily Confessions
Tiêu đề: The girl twenty families turned down
Nội dung thẻ:
I adopted the little girl that twenty families had rejected alone.
Her medical diagnosis scared everyone away. "You have time to think about this, sir."
I signed the adoption papers in less than four minutes.
Ten years went by. She walked, she read, she laughed out loud.
Then Greg, who abandoned her at birth, showed up at our front door claiming her inheritance...
Highlights: "You have time to think about this, sir." | claiming her inheritance...
Nút CTA: Read Continuation In Caption
Caption: He left her in a hospital room with medical bills ten years ago. Now that my father left his estate to my daughter, he stood on my porch with two lawyers claiming he was still her legal guardian... The confrontation continued in the first comment 👇 #familydrama #storytime #truestory #inheritance
Comment 1: PART 2: Greg smirked and handed me a certified birth certificate: "Biological rights override private arrangements, brother." But he made one fatal mistake. He didn't know that three years ago, I legally finalized a closed adoption with full termination of parental rights signed by him while he was under debt settlement. When my lawyer stepped out of the study with the sealed judge's decree, the color drained from Greg's face completely...
Link: https://yourblog.com/us-story-1

=== STORY 2 ===
Tác giả: Robert Miller
Thời gian: 5h ago
Tên Page: Hidden Realities
Tiêu đề: Two sleeping boys in my office
Nội dung thẻ:
Two boys were asleep in my armchair when I arrived at the office early Monday morning.
It was seven-ten and the hallways were still pitch black. "They came with a lady, sir," the security guard whispered.
I pulled up a chair opposite them: "Let them sleep."
In the older boy's coat pocket, I found a sealed envelope with my first name written in purple ink.
One year later, I opened that letter before my attorney and learned who their mother truly was...
Highlights: "They came with a lady, sir." | "Let them sleep." | who their mother truly was...
Nút CTA: Read Continuation In Caption
Caption: The hallway was silent at 7:10 AM when I found two boys sleeping in my coat. The purple letter inside their pocket held a secret my family buried twelve years ago... Read the revelation in the first comment 👇 #mystery #familysecrets #confession #lifelessons
Comment 1: PART 2: The purple handwriting belonged to Clara — my fiancé who disappeared the night before our wedding without taking a single dime. For twelve years I believed she ran away with another man. But the letter wasn't an apology; it was a hospital discharge report and a legal custody transfer. She had been hiding from my own father's corporate lawyers, and before she passed away last month, she made sure her boys were delivered directly into my hands...
Link: https://yourblog.com/us-story-2`;
      navigator.clipboard.writeText(sample).then(() => {
        btnCopySampleTxt.textContent = "✓ Đã sao chép!";
        setTimeout(() => btnCopySampleTxt.textContent = "📋 Sao chép mẫu .txt", 2000);
      });
    };
  }

  if (btnCopySampleJson) {
    btnCopySampleJson.onclick = () => {
      const sample = `[\n  {\n    "author": "Franck Meynard",\n    "pageName": "Vérités d'Hier",\n    "timeAgo": "Il y a 1 h",\n    "text": "J'ai adopté seul la petite que vingt familles avaient refusée...",\n    "highlights": ["« Vous avez le temps de réfléchir, monsieur. »"],\n    "cta": "Continuer la lecture dans les commentaires",\n    "link": "https://example.com/fr/histoire-1"\n  }\n]`;
      navigator.clipboard.writeText(sample).then(() => {
        btnCopySampleJson.textContent = "✓ Đã sao chép!";
        setTimeout(() => btnCopySampleJson.textContent = "📋 Sao chép mẫu .json", 2000);
      });
    };
  }

  if (btnDownloadSampleTxtFile) {
    btnDownloadSampleTxtFile.onclick = () => {
      const raw = (window.STORIES_BY_COUNTRY && (window.STORIES_BY_COUNTRY["fr"] || window.STORIES_BY_COUNTRY["us"])) || "";
      const blob = new Blob([raw], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "Mau_Kich_Ban_30_Stories.txt";
      a.click();
    };
  }

  // Tabs Switching
  if (tabScriptBtn && tabAvatarBtn && tabBgVideoBtn) {
    tabScriptBtn.onclick = () => {
      tabScriptBtn.style.background = "#10b981"; tabScriptBtn.style.color = "#fff";
      tabAvatarBtn.style.background = "transparent"; tabAvatarBtn.style.color = "#a7f3d0";
      tabBgVideoBtn.style.background = "transparent"; tabBgVideoBtn.style.color = "#a7f3d0";
      if (tabScriptContent) tabScriptContent.style.display = "flex";
      if (tabAvatarContent) tabAvatarContent.style.display = "none";
      if (tabBgVideoContent) tabBgVideoContent.style.display = "none";
    };
    tabAvatarBtn.onclick = () => {
      tabAvatarBtn.style.background = "#10b981"; tabAvatarBtn.style.color = "#fff";
      tabScriptBtn.style.background = "transparent"; tabScriptBtn.style.color = "#a7f3d0";
      tabBgVideoBtn.style.background = "transparent"; tabBgVideoBtn.style.color = "#a7f3d0";
      if (tabAvatarContent) tabAvatarContent.style.display = "flex";
      if (tabScriptContent) tabScriptContent.style.display = "none";
      if (tabBgVideoContent) tabBgVideoContent.style.display = "none";
    };
    tabBgVideoBtn.onclick = () => {
      tabBgVideoBtn.style.background = "#10b981"; tabBgVideoBtn.style.color = "#fff";
      tabScriptBtn.style.background = "transparent"; tabScriptBtn.style.color = "#a7f3d0";
      tabAvatarBtn.style.background = "transparent"; tabAvatarBtn.style.color = "#a7f3d0";
      if (tabBgVideoContent) tabBgVideoContent.style.display = "flex";
      if (tabScriptContent) tabScriptContent.style.display = "none";
      if (tabAvatarContent) tabAvatarContent.style.display = "none";
    };
  }

  // Preset Buttons for Video Count
  document.querySelectorAll(".btn-preset-count").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".btn-preset-count").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const num = parseInt(btn.dataset.num, 10);
      targetVideoCount = num;
      if (inputCustomVideoCount) inputCustomVideoCount.value = num;
      if (btnBatchNumLabel) btnBatchNumLabel.textContent = num;
      buildBatchTemplatePlan(num);
      updatePickedUI();
    };
  });

  if (inputCustomVideoCount) {
    inputCustomVideoCount.onchange = () => {
      const val = Math.max(1, parseInt(inputCustomVideoCount.value, 10) || 30);
      targetVideoCount = val;
      if (btnBatchNumLabel) btnBatchNumLabel.textContent = val;
      buildBatchTemplatePlan(val);
      updatePickedUI();
    };
  }

    // Wire Mode Toggle Buttons & Template Selector
  if (btnModeSingle) {
    btnModeSingle.onclick = () => setStudioMode("single");
  }

  if (btnModeRandom) {
    btnModeRandom.onclick = () => setStudioMode("random");
  }

  if (selectStudioLockedTemplate) {
    selectStudioLockedTemplate.onchange = () => {
      const idx = parseInt(selectStudioLockedTemplate.value, 10);
      if (!isNaN(idx) && idx >= 0 && typeof MAU !== "undefined" && MAU[idx]) {
        studioLockedTemplateIdx = idx;
        buildBatchTemplatePlan(targetVideoCount);
        updatePickedUI();
        updateLivePreview();
      }
    };
  }

  if (btnClearAllPicked) {
    btnClearAllPicked.onclick = () => {
      if (typeof state !== "undefined") {
        state.forEach((s, idx) => {
          s.picked = false;
          if (typeof cards !== "undefined" && cards[idx]) {
            cards[idx].classList.remove("picked");
            const cb = cards[idx].querySelector("input");
            if (cb) cb.checked = false;
          }
        });
        if (typeof luu === "function") luu();
        if (typeof demChon === "function") demChon();
        buildBatchTemplatePlan(targetVideoCount);
        updatePickedUI();
      }
    };
  }

  if (btnPickAllTemplates) {
    btnPickAllTemplates.onclick = () => {
      if (typeof state !== "undefined") {
        state.forEach((s, idx) => {
          s.picked = true;
          if (typeof cards !== "undefined" && cards[idx]) {
            cards[idx].classList.add("picked");
            const cb = cards[idx].querySelector("input");
            if (cb) cb.checked = true;
          }
        });
        if (typeof luu === "function") luu();
        if (typeof demChon === "function") demChon();
        buildBatchTemplatePlan(targetVideoCount);
        updatePickedUI();
      }
    };
  }

  window.openStudioWithTemplate = function(i) {
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
  };

  // Language Selector
  if (selectStudioCountry) {
    selectStudioCountry.onchange = () => {
      currentCountry = selectStudioCountry.value;
      const countryNames = {
        "us": { page: "Daily Confessions", author: "@daily_confessions" },
        "fr": { page: "Vérités d'Hier", author: "@verites_dhier" },
        "nl": { page: "Verborgen Realiteit", author: "@verborgen_realiteit" },
        "de": { page: "Stille Wahrheiten", author: "@stille_wahrheiten" },
        "es": { page: "Historias Reales", author: "@historias_reales" },
        "vi": { page: "Góc Nhìn Cuộc Sống", author: "@goc_nhin_cuoc_song" }
      };
      if (countryNames[currentCountry]) {
        if (studioPageName) studioPageName.value = countryNames[currentCountry].page;
        if (studioAuthorName) studioAuthorName.value = countryNames[currentCountry].author;
      }
      reloadStories();
    };
  }

  // Story Parsing
  function parseStories(text) {
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
  }

  function reloadStories() {
    const raw = (window.STORIES_BY_COUNTRY && window.STORIES_BY_COUNTRY[currentCountry]) || (window.STORIES_BY_COUNTRY && window.STORIES_BY_COUNTRY["us"]) || "";
    if (studioBatchTextarea) studioBatchTextarea.value = raw;
    parsedStories = parseStories(raw);
    if (statStoryCountDisplay) statStoryCountDisplay.textContent = parsedStories.length;
    updateScriptLiveStats();
    currentStoryIdx = 0;
    buildBatchTemplatePlan(targetVideoCount);
    updateStoryNav();
    updateBgVideoSource();
    updateLivePreview();
  }

  if (btnReloadSampleStories) btnReloadSampleStories.onclick = reloadStories;
  if (studioBatchTextarea) {
    studioBatchTextarea.oninput = () => {
      parsedStories = parseStories(studioBatchTextarea.value);
      if (statStoryCountDisplay) statStoryCountDisplay.textContent = parsedStories.length;
    updateScriptLiveStats();
      buildBatchTemplatePlan(targetVideoCount);
      updateStoryNav();
      updateLivePreview();
    };
  }

  if (uploadScriptInput) {
    uploadScriptInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (studioBatchTextarea) studioBatchTextarea.value = ev.target.result;
        parsedStories = parseStories(ev.target.result);
        if (statStoryCountDisplay) statStoryCountDisplay.textContent = parsedStories.length;
    updateScriptLiveStats();
        buildBatchTemplatePlan(targetVideoCount);
        updateStoryNav();
        updateLivePreview();
      };
      reader.readAsText(file);
    };
  }

  if (studioPageName) {
    studioPageName.oninput = () => {
      parsedStories.forEach(s => s.page = studioPageName.value.trim());
      updateLivePreview();
    };
  }

  
  // Live Script Stats Indicator (Word count, paragraph count, full-card check)
  function updateScriptLiveStats() {
    const badge = document.getElementById("statWordCountBadge");
    if (!badge || !parsedStories || parsedStories.length === 0) return;
    const story = parsedStories[currentStoryIdx] || parsedStories[0];
    const words = (story && story.content ? story.content.trim().split(/\s+/) : []).filter(Boolean);
    const paras = (story && story.content ? story.content.trim().split(/\n+/) : []).filter(Boolean);
    const wCount = words.length;
    const pCount = paras.length;

    let statusNote = "✅ Đạt chuẩn lấp đầy đẹp";
    let color = "#34d399";
    if (wCount < 90) {
      statusNote = "⚠️ Hơi ngắn (Auto-Fit sẽ phóng to chữ)";
      color = "#fde047";
    } else if (wCount > 190) {
      statusNote = "⚠️ Hơi dài (Auto-Fit sẽ co nhỏ chữ)";
      color = "#fb923c";
    }
    badge.innerHTML = `${wCount} từ · ${pCount} đoạn · <span style="color:${color};font-weight:800;">${statusNote}</span>`;
  }

  function updateStoryNav() {
    const total = parsedStories.length || 1;
    if (currentStoryIndexBadge) currentStoryIndexBadge.textContent = `${currentStoryIdx + 1} / ${total}`;
    const story = parsedStories[currentStoryIdx] || parsedStories[0];
    if (previewStoryNumBadge) previewStoryNumBadge.textContent = `Video #${currentStoryIdx + 1}`;
    if (previewCurrentCaption && story) {
      previewCurrentCaption.textContent = story.caption || "(Chưa có caption - Hệ thống sẽ tự tạo khi xuất)";
    }
    if (previewCurrentComment1 && story) {
      previewCurrentComment1.textContent = story.comment1 || "(Chưa có Comment 1 - Hệ thống sẽ tự tạo khi xuất)";
    }
    updateLivePreview();
  }

  if (btnCopyCurrentCaption) {
    btnCopyCurrentCaption.onclick = () => {
      const story = parsedStories[currentStoryIdx] || parsedStories[0];
      const cap = story ? story.caption : "";
      if (!cap) return;
      navigator.clipboard.writeText(cap).then(() => {
        btnCopyCurrentCaption.textContent = "✓ Đã copy!";
        setTimeout(() => { if (btnCopyCurrentCaption) btnCopyCurrentCaption.textContent = "📋 Copy"; }, 2000);
      });
    };
  }

  if (btnCopyCurrentComment1) {
    btnCopyCurrentComment1.onclick = () => {
      const story = parsedStories[currentStoryIdx] || parsedStories[0];
      const cmt = story ? story.comment1 : "";
      if (!cmt) return;
      navigator.clipboard.writeText(cmt).then(() => {
        btnCopyCurrentComment1.textContent = "✓ Đã copy!";
        setTimeout(() => { if (btnCopyCurrentComment1) btnCopyCurrentComment1.textContent = "📋 Copy"; }, 2000);
      });
    };
  }

  if (btnPrevStory) {
    btnPrevStory.onclick = () => {
      if (currentStoryIdx > 0) {
        currentStoryIdx--;
        updateStoryNav();
        updateBgVideoSource();
        updateLivePreview();
      }
    };
  }

  if (btnNextStory) {
    btnNextStory.onclick = () => {
      if (currentStoryIdx < parsedStories.length - 1) {
        currentStoryIdx++;
        updateStoryNav();
        updateBgVideoSource();
        updateLivePreview();
      }
    };
  }

  function updateBgVideoSource() {
    if (!studioBgVideo) return;
    const bgList = window.BG_FILES || ["clip_01.mp4"];
    const mode = selectStudioBgMode ? selectStudioBgMode.value : "random";
    if (mode === "random") {
      const clip = bgList[currentStoryIdx % bgList.length] || bgList[0];
      studioBgVideo.src = `assets/backgrounds/${clip}`;
    } else if (mode === "fixed") {
      studioBgVideo.src = `assets/backgrounds/${activeSelectedBg || bgList[0]}`;
    } else {
      studioBgVideo.removeAttribute("src");
    }
    studioBgVideo.currentTime = 0;
    studioBgVideo.play().catch(() => {});
  }

  if (selectStudioBgMode) {
    selectStudioBgMode.onchange = () => {
      currentBgMode = selectStudioBgMode.value;
      updateBgVideoSource();
      updateLivePreview();
    };
  }

  function renderBgGrid() {
    if (!bgVideoGrid) return;
    bgVideoGrid.innerHTML = "";
    (window.BG_FILES || []).forEach((clip, idx) => {
      const card = document.createElement("div");
      card.style.cssText = "background: rgba(18, 30, 24, 0.85); border: 1px solid rgba(52,211,153,0.25); border-radius: 10px; overflow: hidden; cursor: pointer; transition: all 0.2s; position: relative;";
      card.innerHTML = `
        <div style="height: 90px; background: #000; position: relative; overflow: hidden;">
          <video src="assets/backgrounds/${clip}" preload="metadata" muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
          <span style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.7); font-size: 10px; padding: 2px 5px; border-radius: 4px; color: #fff;">#${idx + 1}</span>
        </div>
        <div style="padding: 6px 8px; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #d1fae5;">
          ${clip}
        </div>
      `;
      const vid = card.querySelector("video");
      card.onmouseenter = () => { vid.currentTime = 1; vid.play().catch(() => {}); card.style.borderColor = "#10b981"; };
      card.onmouseleave = () => { vid.pause(); card.style.borderColor = "rgba(52,211,153,0.25)"; };
      card.onclick = () => {
        activeSelectedBg = clip;
        currentBgMode = "fixed";
        if (selectStudioBgMode) selectStudioBgMode.value = "fixed";
        if (selectedBgBadge) selectedBgBadge.textContent = "Đang chọn: " + clip;
        updateBgVideoSource();
        updateLivePreview();
      };
      bgVideoGrid.appendChild(card);
    });
  }

  function renderAvatars() {
    if (!studioAvatarList) return;
    studioAvatarList.innerHTML = "";
    if (statAvatarNum) statAvatarNum.textContent = (window.AVATAR_FILES || []).length;
    (window.AVATAR_FILES || []).forEach(av => {
      const item = document.createElement("div");
      item.style.cssText = `flex-shrink: 0; width: 56px; height: 56px; border-radius: 50%; overflow: hidden; border: 2px solid ${av === selectedAvatar ? "#10b981" : "rgba(255,255,255,0.2)"}; cursor: pointer; position: relative; transition: all 0.2s;`;
      const imgSrc = av.startsWith("data:") ? av : `assets/avatars/${av}`;
      item.innerHTML = `<img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: cover;">`;
      item.onclick = () => {
        selectedAvatar = av;
        renderAvatars();
        updateLivePreview();
      };
      studioAvatarList.appendChild(item);
    });
  }

  if (uploadAvatarInput) {
    uploadAvatarInput.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target.result;
          if (window.AVATAR_FILES) window.AVATAR_FILES.unshift(dataUrl);
          selectedAvatar = dataUrl;
          renderAvatars();
          updateLivePreview();
        };
        reader.readAsDataURL(file);
      });
    };
  }

  async function loadAvatar(src) {
    if (!src) return null;
    if (avatarCache[src]) return avatarCache[src];
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        avatarCache[src] = img;
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = src.startsWith("data:") ? src : `assets/avatars/${src}`;
    });
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

    // SVG Heart Path matching template 0-10 exact vector
  const HEART_PATH_2D = new Path2D("M12 21s-7.5-4.6-9.5-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.5 6c-2 4.4-9.5 9-9.5 9z");

  function drawHeart(ctx, x, y, size, fill, glowColor) {
    ctx.save();
    ctx.translate(x, y);
    const s = size / 24;
    ctx.scale(s, s);
    if (glowColor) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 8;
    }
    ctx.fillStyle = fill || "#ffffff";
    ctx.fill(HEART_PATH_2D);
    ctx.restore();
  }

  // High-Fidelity Auto-Fit Typography Engine
  function prepareStoryTypography(ctx, story, tpl) {
    const vars = tpl.vars || {};
    const ho = tpl.ho || "the-vet";
    const ov = (typeof ovGop === "function") ? ovGop(tpl.index, tpl.palIdx) : {};
    const bodyOv = ov.body || {};

    const bodyW = bodyOv.w !== undefined ? bodyOv.w : (parseFloat(vars["body-w"]) || 604);
    const bodyH = bodyOv.h !== undefined ? bodyOv.h : (parseFloat(vars["body-h"]) || 916);
    const bodyX = bodyOv.x !== undefined ? bodyOv.x : (parseFloat(vars["body-x"]) || 58);
    const bodyY = bodyOv.y !== undefined ? bodyOv.y : (parseFloat(vars["body-y"]) || 190);
    const bodyScale = bodyOv.scale !== undefined ? bodyOv.scale : 1;

    // Font selection: modern sans-serif for the-vet and most templates; serif only if explicitly in id
    const isSerif = tpl.id.includes("serif") || ho === "bang-dong";
    const isCursive = ho === "thu-tay-giay-ke" || ho === "vo-o-ly" || tpl.id.includes("tay") || tpl.id.includes("ly");
    const fontFam = isCursive 
      ? '"Segoe Print", "Bradley Hand", "Chalkboard SE", cursive'
      : (isSerif ? 'Georgia, "Times New Roman", serif' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif');

    const rawContent = (story && story.content ? story.content : "").trim();
    const paragraphs = rawContent.split(/\n+/).map(p => p.trim()).filter(Boolean);
    const ctaInline = (story && story.cta) ? story.cta.trim() : "";
    if (ctaInline) {
      paragraphs.push(ctaInline);
    }

    function measureWordWidth(w, size) {
      if (ctx) {
        ctx.font = `800 ${size}px ${fontFam}`;
        return ctx.measureText(w).width;
      }
      return w.length * size * 0.53;
    }

    function measureSpaceWidth(size) {
      if (ctx) {
        ctx.font = `800 ${size}px ${fontFam}`;
        return ctx.measureText(" ").width;
      }
      return size * 0.28;
    }

    // Binary search for highest font size that fits 82% - 90% of bodyH
    function simulateLines(fontSize) {
      const lineHeight = Math.round(fontSize * 1.54);
      const paraGap = Math.round(fontSize * 0.75);
      let totalH = 0;
      const allLines = [];

      for (let p = 0; p < paragraphs.length; p++) {
        const words = paragraphs[p].split(/\s+/).filter(Boolean);
        let curLineWords = [];
        let curLineWidth = 0;
        const spaceW = measureSpaceWidth(fontSize);

        for (let w = 0; w < words.length; w++) {
          const word = words[w];
          const wWidth = measureWordWidth(word, fontSize);
          const addedSpace = curLineWords.length > 0 ? spaceW : 0;

          if (curLineWidth + addedSpace + wWidth > bodyW && curLineWords.length > 0) {
            allLines.push({ words: curLineWords, lineWidth: curLineWidth, p });
            totalH += lineHeight;
            curLineWords = [{ word, width: wWidth }];
            curLineWidth = wWidth;
          } else {
            curLineWords.push({ word, width: wWidth });
            curLineWidth += addedSpace + wWidth;
          }
        }
        if (curLineWords.length > 0) {
          allLines.push({ words: curLineWords, lineWidth: curLineWidth, p });
          totalH += lineHeight;
        }
        if (p < paragraphs.length - 1) {
          totalH += paraGap;
        }
      }
      return { lines: allLines, totalH, lineHeight, paraGap };
    }

    let lo = 24, hi = 42, bestSize = lo, bestSim = simulateLines(lo);
    for (let step = 0; step < 16; step++) {
      const mid = (lo + hi) / 2;
      const sim = simulateLines(mid);
      if (sim.totalH <= bodyH * 0.90) {
        bestSize = mid;
        bestSim = sim;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    bestSize = Math.round(bestSize * bodyScale);
    bestSim = simulateLines(bestSize);

    // If text is short, distribute top padding to center/balance vertically
    let offsetY = 0;
    if (bestSim.totalH < bodyH * 0.85) {
      offsetY = (bodyH * 0.88 - bestSim.totalH) * 0.22;
    }

    // Clean and match highlight keywords
    const cleanHls = (story && story.highlights ? story.highlights : []).map(h => 
      h.toLowerCase().replace(/[^a-z0-9à-ỹ\s]/gi, "").trim()
    ).filter(h => h.length > 2);

    // Tag each word with highlight status or cta status
    const ctaPIndex = ctaInline ? (paragraphs.length - 1) : -1;
    bestSim.lines.forEach((line, lineIdx) => {
      line.words.forEach(wObj => {
        if (ctaPIndex !== -1 && line.p === ctaPIndex) {
          wObj.isCta = true;
          return;
        }
        const cleanW = wObj.word.toLowerCase().replace(/[^a-z0-9à-ỹ]/gi, "");
        if (cleanHls.length > 0) {
          wObj.isHl = cleanHls.some(h => cleanW.length > 2 && h.includes(cleanW));
        } else {
          // If no highlight provided, highlight the opening lead sentence
          wObj.isHl = (lineIdx === 0 && line.p === 0);
        }
      });
    });

    return {
      fontSize: bestSize,
      fontFam,
      offsetY,
      bodyX,
      bodyY,
      bodyW,
      bodyH,
      ...bestSim
    };
  }

  // 5. HIGH-FIDELITY DECONSTRUCTED CANVAS RENDERER WITH OVALL OVERRIDES
  function drawTemplateCanvas(ctx, story, tpl, avImg, bgVideo, textPlan) {
    if (!ctx) return;
    const W = 720;
    const H = 1280;
    const vars = tpl.vars || {};
    const ho = tpl.ho || "the-vet";
    const m = (typeof MAU !== "undefined" && MAU[tpl.index]) ? MAU[tpl.index] : null;
    const mLayers = m ? (m.layers || {}) : {};

    const hasAvatarLayer = "avatar" in mLayers;
    const hasNameLayer = "name" in mLayers;
    const hasTimeLayer = "time" in mLayers;
    const hasCtaLayer = "ctabox" in mLayers || "bar" in mLayers || "ctapill" in mLayers;

    // MERGE MANUAL OVERRIDES FROM OVALL
    const ov = (typeof ovGop === "function") ? ovGop(tpl.index, tpl.palIdx) : {};
    const customColors = ov._colors || {};

    const c1 = customColors["c1"] || vars["c1"] || "#d9d0e6";
    const c2 = customColors["c2"] || vars["c2"] || "#b7a5cf";
    const c3 = customColors["c3"] || vars["c3"] || "#d3c6e3";
    const c4 = customColors["c4"] || vars["c4"] || "#e8b64c";
    const c5 = customColors["c5"] || vars["c5"] || "#fbfafc";
    const c6 = customColors["c6"] || vars["c6"] || "#151515";
    const red = customColors["red"] || vars["red"] || "#e64a19";
    const cta = customColors["cta"] || vars["cta"] || "#e64a19";

    const isDarkHo = ho === "dark-photo" || ho === "bright-photo" || ho === "dark-max" || ho === "anh-kinh" || ho === "bang-dong" || tpl.id.includes("photo") || tpl.id.includes("dark");

    // 1. BACKGROUND
    if (isDarkHo || tpl.id.includes("photo") || tpl.id.includes("clip")) {
      if (bgVideo && bgVideo.readyState >= 2) {
        ctx.drawImage(bgVideo, 0, 0, W, H);
        const vigGrad = ctx.createLinearGradient(0, 0, 0, H);
        vigGrad.addColorStop(0, "rgba(0,0,0,0.85)");
        vigGrad.addColorStop(0.25, "rgba(0,0,0,0.35)");
        vigGrad.addColorStop(0.75, "rgba(0,0,0,0.35)");
        vigGrad.addColorStop(1, "rgba(0,0,0,0.85)");
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.fillStyle = c1 || "#0f1713";
        ctx.fillRect(0, 0, W, H);
      }
    } else if (ho === "wood-desk") {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, c1 || "#8b5a2b");
      grad.addColorStop(0.5, c2 || "#5c3a1e");
      grad.addColorStop(1, c3 || "#3d2314");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (ho === "giay-rach") {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, c1 || "#3d2314");
      grad.addColorStop(1, c2 || "#24130a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (ho === "bang-dong") {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, c1 || "#241b12");
      grad.addColorStop(1, c2 || "#120d09");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (ho === "notebook") {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, c1 || "#e8dfd3");
      grad.addColorStop(1, c2 || "#cec1af");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (ho === "hoa-roi" || ho === "leaf-drift") {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, c1 || "#fdf2f8");
      grad.addColorStop(1, c2 || "#fce7f3");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      // The-vet family and clean cards: warm soft gradient from c1 -> c2
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, c1 || "#fcefe6");
      grad.addColorStop(1, c2 || "#f5dcd0");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // 2. CARD SHEET & DECORATIVE GEOMETRY
    const cardX = 22;
    const cardY = 22;
    const cardW = 676;
    const cardH = 1178;
    const cardR = 34;

    ctx.save();
    if (ho === "the-vet") {
      // Exact .sheet card styling
      ctx.shadowColor = "rgba(0,0,0,0.22)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 16;
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
      ctx.fillStyle = c5 || "#fffbf8";
      ctx.fill();
      ctx.shadowColor = "transparent";

      // Subtle card border
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.stroke();

      // Bottom .band gradient
      ctx.save();
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
      ctx.clip();
      const bandGrad = ctx.createLinearGradient(0, 1110, 0, 1200);
      bandGrad.addColorStop(0, "rgba(255,255,255,0)");
      bandGrad.addColorStop(1, c3 || "#f3d6c4");
      ctx.fillStyle = bandGrad;
      ctx.fillRect(cardX, 1110, cardW, 90);
      ctx.restore();

      // 4 Heart SVGs (.star class in template 0-10) with glow
      drawHeart(ctx, 48, 1134, 44, "#ffffff", c4);
      drawHeart(ctx, 96, 1122, 22, "#ffffff", c4);
      drawHeart(ctx, 628, 1134, 44, "#ffffff", c4);
      drawHeart(ctx, 602, 1168, 22, "#ffffff", c4);

    } else if (ho === "anh-kinh") {
      ctx.shadowColor = "rgba(0,0,0,0.65)";
      ctx.shadowBlur = 50;
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
      ctx.fillStyle = "rgba(18, 22, 28, 0.78)";
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.stroke();
      ctx.shadowColor = "transparent";

    } else if (ho === "giay-rach") {
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 32;
      drawRoundedRect(ctx, 24, 32, 672, 1160, 12);
      ctx.fillStyle = c4 || c5 || "#f5ede0";
      ctx.fill();
      ctx.shadowColor = "transparent";

      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.translate(50, 24);
      ctx.rotate(-0.1);
      ctx.fillRect(0, 0, 90, 26);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.translate(580, 26);
      ctx.rotate(0.08);
      ctx.fillRect(0, 0, 90, 26);
      ctx.restore();

    } else if (ho === "wood-desk") {
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 30;
      drawRoundedRect(ctx, 16, 56, 688, 1110, 16);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.shadowColor = "transparent";

      for (let rx = 52; rx < 670; rx += 48) {
        ctx.strokeStyle = "#9aa0a6";
        ctx.lineWidth = 4;
        drawRoundedRect(ctx, rx, 40, 14, 32, 7);
        ctx.stroke();
      }

    } else if (ho === "dark-max") {
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
      ctx.fillStyle = "rgba(13, 16, 20, 0.88)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = c2 || "#ff7e00";
      ctx.stroke();

    } else if (ho === "the-trang") {
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 35;
      drawRoundedRect(ctx, 16, 16, 688, 1220, 48);
      ctx.fillStyle = c2 || "#ffffff";
      ctx.fill();
      ctx.shadowColor = "transparent";

    } else if (ho === "bang-dong") {
      ctx.shadowColor = "rgba(0,0,0,0.65)";
      ctx.shadowBlur = 45;
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 24);
      const metalGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      metalGrad.addColorStop(0, c4 || "#d4af37");
      metalGrad.addColorStop(0.5, c3 || "#aa771c");
      metalGrad.addColorStop(1, c5 || "#ffd700");
      ctx.fillStyle = metalGrad;
      ctx.fill();

      drawRoundedRect(ctx, cardX + 12, cardY + 12, cardW - 24, cardH - 24, 18);
      ctx.fillStyle = c1 || "#1a140e";
      ctx.fill();
      ctx.strokeStyle = "rgba(212, 175, 55, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowColor = "transparent";

    } else if (ho === "notebook") {
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 35;
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 20);
      ctx.fillStyle = c5 || "#fffdfa";
      ctx.fill();
      ctx.shadowColor = "transparent";

      ctx.save();
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 20);
      ctx.clip();
      ctx.strokeStyle = "rgba(0, 100, 200, 0.08)";
      ctx.lineWidth = 1;
      for (let gy = cardY; gy < cardY + cardH; gy += 32) {
        ctx.beginPath();
        ctx.moveTo(cardX, gy);
        ctx.lineTo(cardX + cardW, gy);
        ctx.stroke();
      }
      for (let gx = cardX; gx < cardX + cardW; gx += 32) {
        ctx.beginPath();
        ctx.moveTo(gx, cardY);
        ctx.lineTo(gx, cardY + cardH);
        ctx.stroke();
      }
      ctx.restore();

    } else if (ho === "hoa-roi" || ho === "leaf-drift") {
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 35;
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 32);
      ctx.fillStyle = c5 || "#ffffff";
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = c3 || "rgba(244, 114, 182, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

    } else if (ho === "dark-photo" || ho === "bright-photo") {
      drawRoundedRect(ctx, 0, 1194, W, 86, 0);
      ctx.fillStyle = c4 || "#17181a";
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("❤️   💬   ↗️   🔖", W / 2, 1248);
      ctx.textAlign = "left";
    } else {
      ctx.shadowColor = "rgba(0,0,0,0.22)";
      ctx.shadowBlur = 35;
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
      ctx.fillStyle = c5 || c2 || "#ffffff";
      ctx.fill();
      ctx.shadowColor = "transparent";
    }
    ctx.restore();

    // 3. AVATAR (ONLY IF TEMPLATE HAS AVATAR LAYER)
    const avOv = ov.avatar || {};
    if (hasAvatarLayer && !avOv.an && ho !== "dark-photo" && ho !== "notebook") {
      const avX = avOv.x !== undefined ? avOv.x : (parseFloat(vars["avatar-x"]) || 54);
      const avY = avOv.y !== undefined ? avOv.y : (parseFloat(vars["avatar-y"]) || 52);
      const avSize = avOv.size !== undefined ? avOv.size : (parseFloat(vars["avatar-size"]) || 104);

      ctx.save();
      drawRoundedRect(ctx, avX, avY, avSize, avSize, avSize / 2);
      ctx.clip();
      if (avImg) {
        ctx.drawImage(avImg, avX, avY, avSize, avSize);
      } else {
        ctx.fillStyle = c4 || "#10b981";
        ctx.fillRect(avX, avY, avSize, avSize);
      }
      ctx.restore();
    }

    // 4. UNIFIED CHANNEL NAME & HEADER
    const nameOv = ov.name || {};
    const nameX = nameOv.x !== undefined ? nameOv.x : (parseFloat(vars["name-x"]) || 180);
    const nameY = nameOv.y !== undefined ? nameOv.y : (parseFloat(vars["name-y"]) || 52);
    const nameSize = nameOv.size !== undefined ? nameOv.size : (parseFloat(vars["name-size"]) || 34);

    // Get strictly uniform Fanpage Name from user inputs
    const defaultPage = (typeof tenXuat === "function" && tenXuat()) || (typeof page !== "undefined" && page.ten) || "Daily Confessions";
    const displayName = (studioPageName && studioPageName.value.trim()) || (story && story.page) || defaultPage;

    // Brush underline (.nbar) in the-vet
    if (ho === "the-vet" && !nameOv.an && hasNameLayer) {
      ctx.save();
      ctx.translate(nameX, nameY + 30);
      ctx.rotate(-0.0105); // -0.6 deg
      drawRoundedRect(ctx, 0, 0, 420, 16, 8);
      ctx.fillStyle = c4 || "#f97316";
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.restore();
    }

    if (hasNameLayer && !nameOv.an) {
      ctx.fillStyle = isDarkHo ? "#ffffff" : (c6 || "#1c2b4a");
      ctx.font = `bold ${nameSize}px Georgia, "Times New Roman", serif`;
      const textDrawX = (ho === "the-vet") ? nameX + 10 : nameX;
      const textDrawY = nameY + 36;
      ctx.fillText(displayName, textDrawX, textDrawY);

      // Verified Blue Badge
      const badgeOv = ov.badge || {};
      if (!badgeOv.an && "badge" in mLayers) {
        const nameWidth = ctx.measureText(displayName).width;
        ctx.fillStyle = "#1d9bf0";
        ctx.beginPath();
        ctx.arc(textDrawX + nameWidth + 18, textDrawY - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("✓", textDrawX + nameWidth + 14, textDrawY - 5);
      }
    }

    // Time & Channel line (Matching @@NAME@@ in template: e.g. (3h ago) • Secrets & Confidences)
    const timeOv = ov.time || {};
    if (hasTimeLayer && !timeOv.an) {
      const timeX = timeOv.x !== undefined ? timeOv.x : nameX;
      const timeY = timeOv.y !== undefined ? timeOv.y : (parseFloat(vars["time-y"]) || (nameY + 48));
      const timeSize = timeOv.size !== undefined ? timeOv.size : (parseFloat(vars["time-size"]) || 20);
      ctx.fillStyle = isDarkHo ? "#94a3b8" : "rgba(0,0,0,0.72)";
      ctx.font = `500 ${timeSize}px -apple-system, sans-serif`;
      const timeStr = (story && story.timeAgo) ? story.timeAgo : "3h ago";
      ctx.fillText(`(${timeStr}) • ${displayName}`, timeX, timeY + 24);
    }

    // 5. BODY TEXT & WORD-BY-WORD HIGHLIGHTS (AUTO-FIT FULL CARD)
    const bodyOv = ov.body || {};
    if (!bodyOv.an && textPlan && textPlan.lines) {
      const bodyTextColor = isDarkHo ? "#f0fdf4" : (c6 || "#1c2b4a");
      const startY = (textPlan.bodyY || 190) + (textPlan.offsetY || 0) + (textPlan.fontSize || 30);
      let curY = startY;

      ctx.font = `800 ${textPlan.fontSize}px ${textPlan.fontFam}`;
      const spaceW = ctx.measureText(" ").width;

      for (let k = 0; k < textPlan.lines.length; k++) {
        const line = textPlan.lines[k];
        let curX = textPlan.bodyX || 58;

        for (let w = 0; w < line.words.length; w++) {
          const wObj = line.words[w];
          const ctaInlineColor = customColors["cta"] || vars["cta"] || "#1f3f7a";
          ctx.fillStyle = wObj.isCta ? ctaInlineColor : (wObj.isHl ? (red || "#e64a19") : bodyTextColor);
          ctx.fillText(wObj.word, curX, curY);
          curX += wObj.width + spaceW;
        }

        curY += textPlan.lineHeight;
        if (k + 1 < textPlan.lines.length && textPlan.lines[k + 1].p !== line.p) {
          curY += textPlan.paraGap;
        }
      }
    }

    // 6. BOTTOM CTA BUTTON / PILL (MATCHING NATIVE TEMPLATE STYLE)
    const ctaOv = ov.ctabox || ov.bar || {};
    if (hasCtaLayer && !ctaOv.an && ho !== "dark-photo" && ho !== "bright-photo") {
      const ctaboxX = ctaOv.x !== undefined ? ctaOv.x : (parseFloat(vars["ctabox-x"]) || 90);
      const ctaboxY = ctaOv.y !== undefined ? ctaOv.y : (parseFloat(vars["ctabox-y"]) || 1128);
      const ctaboxW = ctaOv.w !== undefined ? ctaOv.w : (parseFloat(vars["ctabox-w"]) || 540);
      const ctaboxH = ctaOv.h !== undefined ? ctaOv.h : (parseFloat(vars["ctabox-h"]) || 54);
      const ctaboxSize = ctaOv.size !== undefined ? ctaOv.size : (parseFloat(vars["ctabox-size"]) || 22);

      ctx.save();
      if (ho === "the-vet") {
        // Native .ctabox in the-vet: White pill with orange-red border (2.5px solid #e64a19)
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        drawRoundedRect(ctx, ctaboxX, ctaboxY, ctaboxW, ctaboxH, 28);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.shadowColor = "transparent";

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = cta || "#e64a19";
        ctx.stroke();

        ctx.fillStyle = cta || "#e64a19";
        ctx.font = `bold ${ctaboxSize}px -apple-system, sans-serif`;
        ctx.textAlign = "center";
        const ctaText = (story && story.cta) ? story.cta : "Lire la suite dans la légende";
        ctx.fillText(ctaText, ctaboxX + ctaboxW / 2, ctaboxY + ctaboxH / 2 + ctaboxSize * 0.35);
        ctx.textAlign = "left";
      } else {
        // Default rounded CTA
        drawRoundedRect(ctx, ctaboxX, ctaboxY, ctaboxW, ctaboxH, 27);
        ctx.fillStyle = cta || "#10b981";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${ctaboxSize}px -apple-system, sans-serif`;
        ctx.textAlign = "center";
        const ctaText = (story && story.cta) ? story.cta : "Read Continuation In Caption";
        ctx.fillText(ctaText, ctaboxX + ctaboxW / 2, ctaboxY + ctaboxH / 2 + ctaboxSize * 0.35);
        ctx.textAlign = "left";
      }
      ctx.restore();
    }
  }

  // Continuous animation loop for video background in preview
  function startContinuousPreview() {
    function tick() {
      if (studioModal && studioModal.style.display === "flex" && !isRecording && studioCtx) {
        const story = parsedStories[currentStoryIdx] || parsedStories[0];
        const tpl = getTemplateForStory(currentStoryIdx);
        const avFile = selectedAvatar;
        const avImg = avatarCache[avFile];
        if (story && tpl) {
          const textPlan = prepareStoryTypography(studioCtx, story, tpl);
          drawTemplateCanvas(studioCtx, story, tpl, avImg, studioBgVideo, textPlan);
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  startContinuousPreview();

  // 6. AUDIO & BULLETPROOF MEDIARECORDER
  function getAudioStreamNodes(audioSrc) {
    if (!globalAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      globalAudioCtx = new AudioCtx();
      globalAudioElement = new Audio();
      globalAudioElement.crossOrigin = "anonymous";
      globalAudioElement.loop = true;
      globalAudioSourceNode = globalAudioCtx.createMediaElementSource(globalAudioElement);
      globalAudioDestNode = globalAudioCtx.createMediaStreamDestination();
      globalAudioSourceNode.connect(globalAudioDestNode);
      globalAudioSourceNode.connect(globalAudioCtx.destination);
    }
    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume().catch(() => {});
    }
    if (globalAudioElement.src !== audioSrc && !globalAudioElement.src.endsWith(audioSrc)) {
      globalAudioElement.src = audioSrc;
    }
    return { audioElem: globalAudioElement, destNode: globalAudioDestNode };
  }

  function createSafeRecorder(stream) {
    const candidates = [
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      ''
    ];
    for (const mime of candidates) {
      try {
        if (!mime || MediaRecorder.isTypeSupported(mime)) {
          return new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 6000000 } : {});
        }
      } catch (e) {}
    }
    return new MediaRecorder(stream);
  }

  async function recordStreamToBlob(canvas, durationSec, onProgress) {
    if (!canvas) throw new Error("Canvas element is null");
    const fps = 30;
    const canvasStream = canvas.captureStream(fps);
    let recordStream = canvasStream;
    let audioElem = null;

    try {
      const audioNodes = getAudioStreamNodes("assets/audio/music_1.mp4");
      audioElem = audioNodes.audioElem;
      const audioTracks = audioNodes.destNode.stream.getAudioTracks();
      if (audioTracks && audioTracks.length > 0) {
        recordStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...audioTracks
        ]);
        audioElem.currentTime = 0;
        await audioElem.play().catch(e => console.warn("Audio play blocked, recording video without sound:", e));
      }
    } catch(e) {
      console.warn("Audio setup failed, continuing with video only:", e);
      recordStream = canvasStream;
    }

    const recorder = createSafeRecorder(recordStream);
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };

    return new Promise((resolve, reject) => {
      let startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const pct = Math.min(99, Math.round((elapsed / durationSec) * 100));
        if (onProgress) onProgress(pct);
      }, 100);

      recorder.onerror = err => {
        clearInterval(interval);
        if (audioElem) audioElem.pause();
        reject(err);
      };

      recorder.onstop = () => {
        clearInterval(interval);
        if (audioElem) audioElem.pause();
        const mimeType = recorder.mimeType || "video/mp4";
        const blob = new Blob(chunks, { type: mimeType });
        if (onProgress) onProgress(100);
        resolve(blob);
      };

      recorder.start(100);
      setTimeout(() => {
        try {
          if (recorder.state === "recording") recorder.stop();
        } catch(e) {
          reject(e);
        }
      }, durationSec * 1000);
    });
  }

  // 7. RECORD STORY VIDEO FUNCTION FOR STUDIO BATCH
  async function recordStoryVideo(story, durationSec, storyIndex) {
    isRecording = true;
    currentStoryIdx = storyIndex;
    updateStoryNav();
    updateBgVideoSource();

    const tpl = getTemplateForStory(storyIndex);
    const isRandomAv = document.querySelector('input[name="studioAvatarMode"]:checked')?.value === "random";
    const avList = window.AVATAR_FILES || ["av_01.jpg"];
    const avFile = isRandomAv ? (avList[storyIndex % avList.length]) : selectedAvatar;
    const avImg = await loadAvatar(avFile);

    const textPlan = prepareStoryTypography(studioCtx, story, tpl);

    function drawFrame() {
      drawTemplateCanvas(studioCtx, story, tpl, avImg, studioBgVideo, textPlan);
    }
    drawFrame();

    let animId;
    function pumpFrames() {
      drawFrame();
      animId = requestAnimationFrame(pumpFrames);
    }
    animId = requestAnimationFrame(pumpFrames);

    try {
      const blob = await recordStreamToBlob(studioCanvas, durationSec, (pct) => {
        if (renderProgressBar) renderProgressBar.style.width = pct + "%";
        if (renderPercentText) renderPercentText.textContent = pct + "%";
      });
      cancelAnimationFrame(animId);
      isRecording = false;
      return blob;
    } catch(err) {
      cancelAnimationFrame(animId);
      isRecording = false;
      throw err;
    }
  }

  function buildCompanionTxtContent(story, safeFileName, pageRaw, tpl) {
    const cap = (story && story.caption) ? story.caption.trim() : "";
    const cmt = (story && story.comment1) ? story.comment1.trim() : "";
    return `Caption:
${cap}

Comment 1:
${cmt}`;
  }

  // 8. GEN SINGLE VIDEO DIRECTLY FROM CHINH EDITOR (USING ALL CURRENT EDITS)
  async function genVideoFromChinhEditor() {
    if (typeof cur === "undefined" || cur < 0 || !MAU || !MAU[cur]) {
      return alert("Vui lòng mở một mẫu để chỉnh sửa trước khi xuất video!");
    }

    const mIdx = cur;
    const m = MAU[mIdx];
    const palIdx = (state && state[mIdx]) ? state[mIdx].pal : 0;
    const meta = (window.TPL_METAS && window.TPL_METAS[mIdx]) || {};
    const palMeta = (meta.pals && meta.pals[palIdx]) ? meta.pals[palIdx] : { vars: {} };

    const tpl = {
      index: mIdx,
      id: m.id,
      label: m.label,
      ho: meta.ho || m.ho || "the-vet",
      palIdx: palIdx,
      palId: m.pals[palIdx].id,
      palName: `${palIdx + 1}/${m.pals.length}`,
      vars: palMeta.vars || {}
    };

    const defaultPage = studioPageName ? studioPageName.value : "Daily Confessions";
    const defaultAuthor = studioAuthorName ? studioAuthorName.value.replace('@', '') : "Emily Vance";
    const defaultHandle = studioAuthorName ? studioAuthorName.value : "@daily_confessions";

    const story = (parsedStories && parsedStories[0]) || {
      author: defaultAuthor,
      handle: defaultHandle,
      page: defaultPage,
      title: "Story Sample",
      timeAgo: "3h ago",
      content: "I adopted the little girl that twenty families had rejected alone. Her medical diagnosis scared everyone away. I signed the adoption papers in less than four minutes.",
      highlights: ["rejected alone"],
      cta: "Read Full Story In Comments",
      pinLink: "https://example.com/story-1"
    };

    const dur = cDuration ? (parseInt(cDuration.value, 10) || 10) : 10;
    const bgMode = cBgMode ? cBgMode.value : "random";

    if (btnGenFromChinh) btnGenFromChinh.disabled = true;
    if (cRenderProgress) cRenderProgress.style.display = "block";
    if (cRenderStatus) cRenderStatus.textContent = `Đang render video [${tpl.label}] (${dur}s)...`;
    if (cProgressBar) cProgressBar.style.width = "10%";
    if (cRenderPercent) cRenderPercent.textContent = "10%";

    if (studioBgVideo) {
      const bgList = window.BG_FILES || ["clip_01.mp4"];
      if (bgMode === "random") {
        studioBgVideo.src = `assets/backgrounds/${bgList[0] || 'clip_01.mp4'}`;
      } else if (bgMode === "fixed") {
        studioBgVideo.src = `assets/backgrounds/${activeSelectedBg || 'clip_01.mp4'}`;
      } else {
        studioBgVideo.removeAttribute("src");
      }
      studioBgVideo.currentTime = 0;
      studioBgVideo.play().catch(() => {});
    }

    const avImg = await loadAvatar(selectedAvatar);
    const textPlan = prepareStoryTypography(studioCtx, story, tpl);

    let animId;
    function pumpFrames() {
      drawTemplateCanvas(studioCtx, story, tpl, avImg, studioBgVideo, textPlan);
      animId = requestAnimationFrame(pumpFrames);
    }
    animId = requestAnimationFrame(pumpFrames);

    try {
      const blob = await recordStreamToBlob(studioCanvas, dur, (pct) => {
        if (cProgressBar) cProgressBar.style.width = pct + "%";
        if (cRenderPercent) cRenderPercent.textContent = pct + "%";
      });
      cancelAnimationFrame(animId);

      if (cProgressBar) cProgressBar.style.width = "100%";
      if (cRenderPercent) cRenderPercent.textContent = "100%";
      if (cRenderStatus) cRenderStatus.textContent = "✓ Hoàn thành! Đang tải file xuống...";

      const pageRaw = (story.page || defaultPage || "Reels").trim();
      const safePage = pageRaw.replace(/[/\\:*?"<>|]/g, '_').trim() || "Page";
      const safeAuthor = (story.author || "Story").replace(/[/\\:*?"<>|]/g, '_').trim();
      const fileName = `${safePage}_${m.id}_${safeAuthor}`;

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${fileName}.mp4`;
      a.click();

      const txtContent = buildCompanionTxtContent(story, fileName, pageRaw, tpl);
      const txtBlob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
      const a2 = document.createElement("a");
      a2.href = URL.createObjectURL(txtBlob);
      a2.download = `${fileName}.txt`;
      a2.click();

      if (cRenderStatus) cRenderStatus.textContent = `✓ Đã tải file: [${fileName}.mp4]!`;
      if (btnGenFromChinh) btnGenFromChinh.disabled = false;
    } catch(err) {
      cancelAnimationFrame(animId);
      console.error("Render from Chinh error:", err);
      if (cRenderStatus) cRenderStatus.textContent = "Lỗi khi xuất video: " + err.message;
      if (btnGenFromChinh) btnGenFromChinh.disabled = false;
    }
  }

  if (btnGenFromChinh) {
    btnGenFromChinh.onclick = genVideoFromChinhEditor;
  }

  if (btnOpenStudioWithThis) {
    btnOpenStudioWithThis.onclick = () => {
      if (typeof cur !== "undefined" && cur >= 0) {
        if (typeof dongChinh === "function") dongChinh();
        window.openStudioWithTemplate(cur);
      }
    };
  }

  // 9. PURE CLIENT-SIDE ZIP PACKAGER
  function crc32(buf) {
    let c = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xFF];
    return (c ^ (-1)) >>> 0;
  }
  const CRC_TABLE = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    CRC_TABLE[n] = c;
  }

  async function createZipBlob(fileList) {
    const textEncoder = new TextEncoder();
    const parts = [];
    const centralDirs = [];
    let offset = 0;

    for (const f of fileList) {
      const nameBytes = textEncoder.encode(f.name);
      const dataBytes = new Uint8Array(await f.blob.arrayBuffer());
      const crc = crc32(dataBytes);
      const size = dataBytes.length;

      const lh = new Uint8Array(30);
      const lv = new DataView(lh.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, size, true);
      lv.setUint32(22, size, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);

      parts.push(lh, nameBytes, dataBytes);

      const ch = new Uint8Array(46);
      const cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, size, true);
      cv.setUint32(24, size, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);

      centralDirs.push(ch, nameBytes);
      offset += 30 + nameBytes.length + size;
    }

    const cdOffset = offset;
    let cdSize = 0;
    for (const p of centralDirs) cdSize += p.length;

    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, fileList.length, true);
    ev.setUint16(10, fileList.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, cdOffset, true);
    ev.setUint16(20, 0, true);

    return new Blob([...parts, ...centralDirs, eocd], { type: "application/zip" });
  }

  // 10. RENDER SINGLE VIDEO TEST IN STUDIO
  if (btnRenderSingle) {
    btnRenderSingle.onclick = async () => {
      if (!parsedStories || parsedStories.length === 0) return alert("Không có kịch bản để render!");
      const story = parsedStories[currentStoryIdx] || parsedStories[0];
      const dur = selectStudioDuration ? parseInt(selectStudioDuration.value, 10) : 10;
      const tpl = getTemplateForStory(currentStoryIdx);

      const defaultPage = studioPageName ? studioPageName.value : "Reels";
      const pageRaw = (story.page || defaultPage).trim();
      const safePage = pageRaw.replace(/[/\\:*?"<>|]/g, '_').trim() || "Page";
      const safeNum = String(currentStoryIdx + 1).padStart(2, "0");
      const safeAuthor = (story.author || "Story").replace(/[/\\:*?"<>|]/g, '_').trim();
      const safeBaseName = `${safePage}_Video_${safeNum}_${safeAuthor}`;

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
        a.download = `${safeBaseName}.mp4`;
        a.click();

        const txtContent = buildCompanionTxtContent(story, safeBaseName, pageRaw, tpl);

        const txtBlob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
        const a2 = document.createElement("a");
        a2.href = URL.createObjectURL(txtBlob);
        a2.download = `${safeBaseName}.txt`;
        a2.click();

        btnRenderSingle.disabled = false;
        if (renderStatusText) renderStatusText.textContent = `✓ Đã tải 1 Video thành công: [${safeBaseName}] (.mp4 + .txt)`;
      } catch(err) {
        console.error("Single render error:", err);
        if (renderStatusText) renderStatusText.textContent = "Lỗi khi render video: " + err.message;
        btnRenderSingle.disabled = false;
      }
    };
  }

  // 11. BATCH RENDER N STORIES IN STUDIO
  if (btnRenderBatch30) {
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
      const safePrefix = basePrefix.replace(/[/\\:*?"<>|]/g, '_').trim() || "Reels";

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
  }

  if (btnDownloadAllZip) {
    btnDownloadAllZip.onclick = async () => {
      if (renderedFiles.length === 0) return;
      const defaultPageRaw = studioPageName ? studioPageName.value.trim() : "Reels_Page";
      const safePage = defaultPageRaw.replace(/[/\\:*?"<>|]/g, '_').trim();
      btnDownloadAllZip.textContent = "⏳ Đang nén file ZIP...";
      btnDownloadAllZip.disabled = true;
      const zipBlob = await createZipBlob(renderedFiles);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      const basePrefix = (typeof tenXuat === "function" && tenXuat()) || (studioPageName ? studioPageName.value.trim() : "") || "Reels";
      const safePrefix = basePrefix.replace(/[/\\:*?"<>|]/g, '_').trim() || "Reels";
      a.download = `${safePrefix}_Tron_Goi_${renderedFiles.length / 2}_Videos.zip`;
      a.click();
      btnDownloadAllZip.textContent = "✓ Đã tải file ZIP thành công!";
      btnDownloadAllZip.disabled = false;
    };
  }

  
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

  // INITIALIZATION
  renderBgGrid();
  renderAvatars();
  reloadStories();
  setTimeout(updatePickedUI, 400);

})();
