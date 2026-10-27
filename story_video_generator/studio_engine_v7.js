// Việt Reels Studio Pro Engine v7.0
// Full Integration with #chinh Editor: Color adjustments, layer dragging/resizing, and instant video generation

(function() {
  console.log("Initializing Việt Reels Studio Pro Engine v7.0...");

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
  const studioPreviewIframe = document.getElementById("studioPreviewIframe");
  const studioCanvas = document.getElementById("studioCanvas");
  const studioCtx = studioCanvas.getContext("2d");
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

  // 2. BATCH TEMPLATE PLAN (Strict Single Template vs Random Scramble)
  function buildBatchTemplatePlan(count) {
    const picked = getPickedTemplates();
    batchTemplatePlan = [];
    
    if (picked.length === 0) {
      const m0 = MAU[0];
      const pal0 = m0.pals[0];
      const meta0 = (window.TPL_METAS && window.TPL_METAS[0]) || {};
      const palMeta0 = (meta0.pals && meta0.pals[0]) ? meta0.pals[0] : { vars: {} };
      const t0 = {
        index: 0,
        id: m0.id,
        label: m0.label,
        ho: meta0.ho || m0.ho || "the-vet",
        palIdx: 0,
        palId: pal0.id,
        palName: `1/${m0.pals.length} (${pal0.id})`,
        rawHtml: pal0.html,
        vars: palMeta0.vars || {}
      };
      batchTemplatePlan = Array(count).fill(t0);
      return;
    }

    if (picked.length === 1) {
      batchTemplatePlan = Array(count).fill(picked[0]);
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
    const picked = getPickedTemplates();
    if (picked.length > 0) {
      return picked[storyIndex % picked.length];
    }
    const m0 = MAU[0];
    const pal0 = m0.pals[0];
    const meta0 = (window.TPL_METAS && window.TPL_METAS[0]) || {};
    const palMeta0 = (meta0.pals && meta0.pals[0]) ? meta0.pals[0] : { vars: {} };
    return {
      index: 0,
      id: m0.id,
      label: m0.label,
      ho: meta0.ho || m0.ho || "the-vet",
      palIdx: 0,
      palId: pal0.id,
      palName: `1/${m0.pals.length}`,
      rawHtml: pal0.html,
      vars: palMeta0.vars || {}
    };
  }

  // 3. BUILD 100% NATIVE HTML (APPLYING OVALL MANUAL ADJUSTMENTS)
  function buildStoryHtml(mIdx, palIdx, story) {
    const m = MAU[mIdx];
    if (!m) return "";
    const pal = m.pals[palIdx] || m.pals[0];
    let tplHtml = pal.html;

    const isRandomAv = document.querySelector('input[name="studioAvatarMode"]:checked')?.value === "random";
    const avFile = isRandomAv ? (window.AVATAR_FILES[currentStoryIdx % window.AVATAR_FILES.length]) : selectedAvatar;
    const avSrc = avFile.startsWith("data:") ? avFile : `assets/avatars/${avFile}`;

    if (typeof ASSET !== "undefined") {
      for (const [ma, uri] of ASSET) {
        if (ma === "@@AV@@") {
          tplHtml = tplHtml.split(ma).join(avSrc);
        } else if (ma === "@@CLIP@@") {
          const clipSrc = (selectStudioBgMode.value === "random") 
            ? `assets/backgrounds/${window.BG_FILES[currentStoryIdx % window.BG_FILES.length] || window.BG_FILES[0]}`
            : `assets/backgrounds/${activeSelectedBg || window.BG_FILES[0]}`;
          tplHtml = tplHtml.split(ma).join(clipSrc);
        } else {
          tplHtml = tplHtml.split(ma).join(uri);
        }
      }
    }

    const displayName = story.page || studioPageName.value || story.author;
    const timeDisplay = story.timeAgo || "3h ago";
    const ctaDisplay = story.cta || "Continuer la lecture dans les commentaires";

    tplHtml = tplHtml
      .split("@@NAME@@").join(displayName)
      .split("@@TIME@@").join(timeDisplay)
      .split("@@CTA@@").join(ctaDisplay)
      .split("@@CTABOX@@").join(ctaDisplay)
      .split("@@CTAPILL@@").join(ctaDisplay)
      .split("@@BAR@@").join(ctaDisplay);

    let bodyHtml = "";
    const paragraphs = (story.content || "").split(/\n+/).map(p => p.trim()).filter(Boolean);
    
    paragraphs.forEach((para, idx) => {
      let pText = para;
      if (story.highlights && story.highlights.length > 0) {
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

    if (story.cta) {
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
      const pName = story ? (story.page || studioPageName.value) : studioPageName.value;
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
      floatingGenBar.style.display = "flex";
      const names = picked.map(p => `${p.label} [${p.palName}]`).slice(0, 3).join(", ");
      floatPickNames.textContent = names + (count > 3 ? ` (+${count - 3} mẫu)` : "");
      studioActiveTemplateBadge.textContent = `🎯 Đang chọn: ${count} mẫu`;
      studioActiveTemplateBadge.style.color = "#34d399";
    } else {
      floatingGenBar.style.display = "none";
      studioActiveTemplateBadge.textContent = `Chưa tick mẫu nào ngoài màn hình`;
      studioActiveTemplateBadge.style.color = "#fca5a5";
    }

    if (count === 1) {
      const p = picked[0];
      studioTemplateModeTitle.innerHTML = `🔒 CHẾ ĐỘ ĐỒNG NHẤT 1 MẪU: <span style="color:#fff;">${p.label}</span> (Màu: <span style="color:#fef08a;">${p.palName}</span>)`;
      studioTemplateDetailsList.innerHTML = `Tất cả <b>${targetVideoCount} video</b> gen ra sẽ làm <b>đúng 100% theo mẫu và màu sắc này</b> (bao gồm các chỉnh sửa kéo thả vị trí & màu sắc).`;
      studioTemplateStatusBox.style.borderColor = "rgba(16, 185, 129, 0.6)";
      studioTemplateStatusBox.style.background = "rgba(16, 185, 129, 0.15)";
    } else if (count > 1) {
      studioTemplateModeTitle.innerHTML = `🎲 CHẾ ĐỘ RANDOM LỘN XỘN GIỮA ${count} MẪU ĐÃ CHỌN:`;
      const chips = picked.map(p => `<span style="display:inline-block;background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:6px;margin:2px 4px 2px 0;">✓ <b>${p.label}</b> (${p.palName})</span>`).join("");
      studioTemplateDetailsList.innerHTML = `<div style="margin-bottom:4px;">${chips}</div>Hệ thống sẽ <b>tự động random xáo trộn lộn xộn</b> giữa các mẫu trên cho toàn bộ <b>${targetVideoCount} video</b>!`;
      studioTemplateStatusBox.style.borderColor = "rgba(139, 92, 246, 0.6)";
      studioTemplateStatusBox.style.background = "rgba(139, 92, 246, 0.15)";
    } else {
      studioTemplateModeTitle.innerHTML = `⚠️ CHƯA CHỌN MẪU NÀO TRÊN MÀN HÌNH:`;
      studioTemplateDetailsList.innerHTML = `Vui lòng đóng Studio và tick chọn các mẫu bạn muốn gen ngoài màn hình (chọn 1 mẫu để làm đồng nhất, hoặc nhiều mẫu để tự động random).`;
      studioTemplateStatusBox.style.borderColor = "rgba(239, 68, 68, 0.5)";
      studioTemplateStatusBox.style.background = "rgba(239, 68, 68, 0.15)";
    }

    buildBatchTemplatePlan(targetVideoCount);
    updateLivePreview();
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
      if (cTplIdBadge && MAU[i]) {
        cTplIdBadge.textContent = MAU[i].id;
      }
    };
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".card .pal button") || e.target.closest(".card .pick input") || e.target.closest(".card") || e.target.id === "clear" || e.target.closest("section header label input")) {
      setTimeout(updatePickedUI, 30);
    }
  });

  // Modal Dialog Open/Close
  btnMoStudio.onclick = () => { studioModal.style.display = "flex"; updatePickedUI(); };
  btnFloatingGen.onclick = () => { studioModal.style.display = "flex"; updatePickedUI(); };
  studioCloseBtn.onclick = () => { studioModal.style.display = "none"; };

  btnOpenQuyChuan.onclick = () => { dlgQuyChuan.showModal(); };
  btnCopySampleTxt.onclick = () => {
    const sample = `=== STORY 1 ===\nTác giả: Franck Meynard\nThời gian: Il y a 1 h\nTên Page: Vérités d'Hier\nTiêu đề: Vingt familles avaient dit non...\nNội dung thẻ:\nJ'ai adopté seul la petite que vingt familles avaient refusée.\nSon diagnostic faisait reculer tout le monde. « Vous avez le temps de réfléchir, monsieur. »\nJ'ai signé les pages en moins de quatre minutes.\nHighlights: « Vous avez le temps de réfléchir, monsieur. » | il a compris ce qu'il avait signé...\nNút CTA: Continuer la lecture dans les commentaires\nLink: https://example.com/fr/histoire-1\n\n=== STORY 2 ===\nTác giả: Julien Tardieu\nThời gian: Il y a 3 h\nTên Page: Masques Tombés\nNội dung thẻ:\nDeux garçons dormaient dans mon fauteuil quand je suis entré au bureau...\nHighlights: « Laissez-les dormir. » | j'ai appris qui était leur mère...\nNút CTA: Continuer la lecture dans les commentaires\nLink: https://example.com/fr/histoire-2`;
    navigator.clipboard.writeText(sample).then(() => {
      btnCopySampleTxt.textContent = "✓ Đã sao chép!";
      setTimeout(() => btnCopySampleTxt.textContent = "📋 Sao chép mẫu .txt", 2000);
    });
  };

  btnCopySampleJson.onclick = () => {
    const sample = `[\n  {\n    "author": "Franck Meynard",\n    "pageName": "Vérités d'Hier",\n    "timeAgo": "Il y a 1 h",\n    "text": "J'ai adopté seul la petite que vingt familles avaient refusée...",\n    "highlights": ["« Vous avez le temps de réfléchir, monsieur. »"],\n    "cta": "Continuer la lecture dans les commentaires",\n    "link": "https://example.com/fr/histoire-1"\n  }\n]`;
    navigator.clipboard.writeText(sample).then(() => {
      btnCopySampleJson.textContent = "✓ Đã sao chép!";
      setTimeout(() => btnCopySampleJson.textContent = "📋 Sao chép mẫu .json", 2000);
    });
  };

  btnDownloadSampleTxtFile.onclick = () => {
    const raw = window.STORIES_BY_COUNTRY["fr"] || window.STORIES_BY_COUNTRY["us"];
    const blob = new Blob([raw], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Mau_Kich_Ban_30_Stories.txt";
    a.click();
  };

  // Tabs Switching
  tabScriptBtn.onclick = () => {
    tabScriptBtn.style.background = "#10b981"; tabScriptBtn.style.color = "#fff";
    tabAvatarBtn.style.background = "transparent"; tabAvatarBtn.style.color = "#a7f3d0";
    tabBgVideoBtn.style.background = "transparent"; tabBgVideoBtn.style.color = "#a7f3d0";
    tabScriptContent.style.display = "flex"; tabAvatarContent.style.display = "none"; tabBgVideoContent.style.display = "none";
  };
  tabAvatarBtn.onclick = () => {
    tabAvatarBtn.style.background = "#10b981"; tabAvatarBtn.style.color = "#fff";
    tabScriptBtn.style.background = "transparent"; tabScriptBtn.style.color = "#a7f3d0";
    tabBgVideoBtn.style.background = "transparent"; tabBgVideoBtn.style.color = "#a7f3d0";
    tabAvatarContent.style.display = "flex"; tabScriptContent.style.display = "none"; tabBgVideoContent.style.display = "none";
  };
  tabBgVideoBtn.onclick = () => {
    tabBgVideoBtn.style.background = "#10b981"; tabBgVideoBtn.style.color = "#fff";
    tabScriptBtn.style.background = "transparent"; tabScriptBtn.style.color = "#a7f3d0";
    tabAvatarBtn.style.background = "transparent"; tabAvatarBtn.style.color = "#a7f3d0";
    tabBgVideoContent.style.display = "flex"; tabScriptContent.style.display = "none"; tabAvatarContent.style.display = "none";
  };

  // Preset Buttons for Video Count
  document.querySelectorAll(".btn-preset-count").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".btn-preset-count").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const num = parseInt(btn.dataset.num, 10);
      targetVideoCount = num;
      inputCustomVideoCount.value = num;
      btnBatchNumLabel.textContent = num;
      buildBatchTemplatePlan(num);
      updatePickedUI();
    };
  });

  inputCustomVideoCount.onchange = () => {
    const val = Math.max(1, parseInt(inputCustomVideoCount.value, 10) || 30);
    targetVideoCount = val;
    btnBatchNumLabel.textContent = val;
    buildBatchTemplatePlan(val);
    updatePickedUI();
  };

  // Language Selector
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
      studioPageName.value = countryNames[currentCountry].page;
      studioAuthorName.value = countryNames[currentCountry].author;
    }
    reloadStories();
  };

  // Story Parsing
  function parseStories(text) {
    text = (text || "").trim();
    if (!text) return [];

    const defaultPage = studioPageName.value.trim() || "Daily Confessions";
    const defaultAuthor = studioAuthorName.value.replace('@', '').trim() || "Creator";

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
            content: (item.text || item.content || '').trim(),
            highlights: Array.isArray(item.highlights) ? item.highlights : (item.highlights ? item.highlights.split('|').map(s=>s.trim()) : []),
            cta: item.cta || '🔗 Read Full Story In Bio / Comments',
            pinLink: item.pinLink || item.link || (`https://example.com/story-${idx + 1}`)
          }));
        }
      } catch (e) {}
    }

    let rawBlocks = [];
    if (/===\s*(?:STORY|CÂU CHUYỆN|PHẦN)\s*\d*\s*===/i.test(text)) {
      rawBlocks = text.split(/(?:^|\n)===\s*(?:STORY|CÂU CHUYỆN|PHẦN)\s*\d*\s*===[^\n]*/i).map(p => p.trim()).filter(Boolean);
    } else if (/\n---+\n/.test(text)) {
      rawBlocks = text.split(/\n---+\n/).map(p => p.trim()).filter(Boolean);
    } else if (/\n===+\n/.test(text)) {
      rawBlocks = text.split(/\n===+\n/).map(p => p.trim()).filter(Boolean);
    } else {
      rawBlocks = [text];
    }

    return rawBlocks.map((block, idx) => {
      const authorMatch = block.match(/(?:Tác giả|Tac gia|Author|Auteur):\s*([^\n]+)/i);
      const handleMatch = block.match(/(?:Handle|Kênh|Kenh|Username):\s*([^\n]+)/i);
      const timeMatch = block.match(/(?:Thời gian|Thoi gian|Time|Temps):\s*([^\n]+)/i);
      const pageMatch = block.match(/(?:Tên Page|Ten Page|Page|Fanpage):\s*([^\n]+)/i);
      const titleMatch = block.match(/(?:Title|Tiêu đề|Tieu de|Caption|Titre):\s*([^\n]+)/i);
      const ctaMatch = block.match(/(?:Nút CTA|Nut CTA|CTA|Bouton CTA|Kêu gọi):\s*([^\n]+)/i);
      const linkMatch = block.match(/(?:Link|Pin_Link|Liên kết|Lien ket|Url):\s*([^\n]+)/i);
      const hlMatch = block.match(/(?:Highlights?|Nổi bật|Noi bat|Bôi đỏ):\s*([^\n]+)/i);

      let content = '';
      const contentTagMatch = block.match(/(?:Nội dung thẻ|Nội dung|Noi dung|Content|Texte|Histoire):\s*([\s\S]+?)(?=(?:Highlights?|Nổi bật|Nút CTA|CTA|Caption|Comment 1|Link|Pin_Link|$))/i);
      if (contentTagMatch) {
        content = contentTagMatch[1].trim();
      } else {
        const cleanLines = block.split('\n').filter(line => {
          const l = line.trim();
          if (!l) return true;
          if (/^(?:Tác giả|Tac gia|Author|Auteur|Handle|Kênh|Thời gian|Time|Tên Page|Page|Title|Tiêu đề|Nút CTA|CTA|Caption|Comment|Highlights|Nổi bật|Link|Pin_Link):/i.test(l)) return false;
          if (/^===.*===$/.test(l)) return false;
          if (/^---+$/.test(l)) return false;
          return true;
        });
        content = cleanLines.join('\n').trim();
      }

      const author = authorMatch ? authorMatch[1].trim() : defaultAuthor;
      const page = pageMatch ? pageMatch[1].trim() : (studioPageName.value.trim() || defaultPage);
      const handle = handleMatch ? handleMatch[1].trim() : ('@' + author.toLowerCase().replace(/[^a-z0-9]/g, '_'));
      const timeAgo = timeMatch ? timeMatch[1].trim() : '3h ago';
      const title = titleMatch ? titleMatch[1].trim() : (`Story #${idx + 1}`);
      const cta = ctaMatch ? ctaMatch[1].trim() : '🔗 Read Full Story In Bio / Comments';
      const pinLink = linkMatch ? linkMatch[1].trim() : (`https://example.com/story-${idx + 1}`);
      const highlights = hlMatch ? hlMatch[1].split('|').map(s => s.trim()).filter(Boolean) : [];

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
        pinLink
      };
    });
  }

  function reloadStories() {
    const raw = (window.STORIES_BY_COUNTRY && window.STORIES_BY_COUNTRY[currentCountry]) || window.STORIES_BY_COUNTRY["us"];
    studioBatchTextarea.value = raw;
    parsedStories = parseStories(raw);
    statStoryCountDisplay.textContent = parsedStories.length;
    currentStoryIdx = 0;
    buildBatchTemplatePlan(targetVideoCount);
    updateStoryNav();
    updateBgVideoSource();
    updateLivePreview();
  }

  btnReloadSampleStories.onclick = reloadStories;
  studioBatchTextarea.oninput = () => {
    parsedStories = parseStories(studioBatchTextarea.value);
    statStoryCountDisplay.textContent = parsedStories.length;
    buildBatchTemplatePlan(targetVideoCount);
    updateStoryNav();
    updateLivePreview();
  };

  uploadScriptInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      studioBatchTextarea.value = ev.target.result;
      parsedStories = parseStories(ev.target.result);
      statStoryCountDisplay.textContent = parsedStories.length;
      buildBatchTemplatePlan(targetVideoCount);
      updateStoryNav();
      updateLivePreview();
    };
    reader.readAsText(file);
  };

  studioPageName.oninput = () => {
    parsedStories.forEach(s => s.page = studioPageName.value.trim());
    updateLivePreview();
  };

  function updateStoryNav() {
    const total = parsedStories.length || 1;
    currentStoryIndexBadge.textContent = `${currentStoryIdx + 1} / ${total}`;
    updateLivePreview();
  }

  btnPrevStory.onclick = () => {
    if (currentStoryIdx > 0) {
      currentStoryIdx--;
      updateStoryNav();
      updateBgVideoSource();
      updateLivePreview();
    }
  };

  btnNextStory.onclick = () => {
    if (currentStoryIdx < parsedStories.length - 1) {
      currentStoryIdx++;
      updateStoryNav();
      updateBgVideoSource();
      updateLivePreview();
    }
  };

  function updateBgVideoSource() {
    if (selectStudioBgMode.value === "random") {
      const clip = window.BG_FILES[currentStoryIdx % window.BG_FILES.length] || window.BG_FILES[0];
      studioBgVideo.src = `assets/backgrounds/${clip}`;
    } else if (selectStudioBgMode.value === "fixed") {
      studioBgVideo.src = `assets/backgrounds/${activeSelectedBg || window.BG_FILES[0]}`;
    } else {
      studioBgVideo.removeAttribute("src");
    }
    studioBgVideo.currentTime = 0;
    studioBgVideo.play().catch(() => {});
  }

  selectStudioBgMode.onchange = () => {
    currentBgMode = selectStudioBgMode.value;
    updateBgVideoSource();
    updateLivePreview();
  };

  function renderBgGrid() {
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
        selectStudioBgMode.value = "fixed";
        selectedBgBadge.textContent = "Đang chọn: " + clip;
        updateBgVideoSource();
        updateLivePreview();
      };
      bgVideoGrid.appendChild(card);
    });
  }

  function renderAvatars() {
    studioAvatarList.innerHTML = "";
    statAvatarNum.textContent = (window.AVATAR_FILES || []).length;
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

  uploadAvatarInput.onchange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        window.AVATAR_FILES.unshift(dataUrl);
        selectedAvatar = dataUrl;
        renderAvatars();
        updateLivePreview();
      };
      reader.readAsDataURL(file);
    });
  };

  async function loadAvatar(src) {
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

  function drawStar(ctx, cx, cy, size, fill, shadowColor) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(cx, cy);
    if (shadowColor) {
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 8;
    }
    ctx.moveTo(0, -size / 2);
    ctx.quadraticCurveTo(size * 0.08, -size * 0.08, size / 2, 0);
    ctx.quadraticCurveTo(size * 0.08, size * 0.08, 0, size / 2);
    ctx.quadraticCurveTo(-size * 0.08, size * 0.08, -size / 2, 0);
    ctx.quadraticCurveTo(-size * 0.08, -size * 0.08, 0, -size / 2);
    ctx.fillStyle = fill || "#ffffff";
    ctx.fill();
    ctx.restore();
  }

  // Pre-calculate Typography per story
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

    const isSerif = ho === "the-vet" || ho === "giay-rach" || tpl.id.includes("serif");
    const fontFam = isSerif ? 'Georgia, "Times New Roman", serif' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    const rawText = (story.content || "").replace(/\s+/g, ' ').trim();
    let fontSize = 34;
    if (rawText.length > 500) fontSize = 26;
    else if (rawText.length > 380) fontSize = 28;
    else if (rawText.length > 250) fontSize = 31;
    fontSize = Math.round(fontSize * bodyScale);

    const lineHeight = fontSize * 1.52;
    ctx.font = `500 ${fontSize}px ${fontFam}`;

    const words = rawText.split(' ');
    let lines = [];
    let curLine = "";

    for (let i = 0; i < words.length; i++) {
      const test = curLine ? (curLine + " " + words[i]) : words[i];
      if (ctx.measureText(test).width > bodyW && curLine) {
        lines.push(curLine);
        curLine = words[i];
      } else {
        curLine = test;
      }
    }
    if (curLine) lines.push(curLine);

    const linePlans = [];
    let curY = bodyY + fontSize + 4;

    for (let k = 0; k < lines.length; k++) {
      if (curY > bodyY + bodyH - 20) break;
      const lText = lines[k];
      let isHl = false;

      if (story.highlights && story.highlights.length > 0) {
        isHl = story.highlights.some(h => lText.toLowerCase().includes(h.toLowerCase().slice(0, 14)));
      } else {
        isHl = (k === 0 || k === lines.length - 1);
      }

      linePlans.push({
        text: lText,
        x: bodyX,
        y: curY,
        isHl: isHl,
        font: `${isHl ? "bold" : "500"} ${fontSize}px ${fontFam}`
      });
      curY += lineHeight;
    }

    return { lines: linePlans, fontSize, fontFam, bodyX, bodyY, bodyW, bodyH };
  }

  // 5. HIGH-FIDELITY DECONSTRUCTED CANVAS RENDERER WITH OVALL OVERRIDES
  function drawTemplateCanvas(ctx, story, tpl, avImg, bgVideo, textPlan) {
    const W = 720;
    const H = 1280;
    const vars = tpl.vars || {};
    const ho = tpl.ho || "the-vet";

    // MERGE MANUAL OVERRIDES FROM OVALL
    const ov = (typeof ovGop === "function") ? ovGop(tpl.index, tpl.palIdx) : {};
    const customColors = ov._colors || {};

    const c1 = customColors["c1"] || vars["c1"] || "#d9d0e6";
    const c2 = customColors["c2"] || vars["c2"] || "#b7a5cf";
    const c3 = customColors["c3"] || vars["c3"] || "#d3c6e3";
    const c4 = customColors["c4"] || vars["c4"] || "#e8b64c";
    const c5 = customColors["c5"] || vars["c5"] || "#fbfafc";
    const c6 = customColors["c6"] || vars["c6"] || "#151515";
    const red = customColors["red"] || vars["red"] || "#bf360c";
    const cta = customColors["cta"] || vars["cta"] || "#1f3f7a";

    // 1. BACKGROUND
    if (ho === "dark-photo" || ho === "bright-photo" || ho === "dark-max" || tpl.id.includes("photo") || tpl.id.includes("clip")) {
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
        ctx.fillStyle = "#0f1713";
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
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
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
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 16;
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
      ctx.fillStyle = c5 || "#fffbf8";
      ctx.fill();
      ctx.shadowColor = "transparent";

      ctx.save();
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
      ctx.clip();
      const bandGrad = ctx.createLinearGradient(0, 1110, 0, 1200);
      bandGrad.addColorStop(0, "rgba(255,255,255,0)");
      bandGrad.addColorStop(1, c3 || "#f3d6c4");
      ctx.fillStyle = bandGrad;
      ctx.fillRect(cardX, 1110, cardW, 90);
      ctx.restore();

      drawStar(ctx, 48, 1134, 44, "#fff", c4);
      drawStar(ctx, 96, 1122, 22, "#fff", c4);
      drawStar(ctx, 628, 1134, 44, "#fff", c4);
      drawStar(ctx, 602, 1168, 22, "#fff", c4);

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

    } else if (ho === "dark-photo" || ho === "bright-photo") {
      drawRoundedRect(ctx, 0, 1194, W, 86, 0);
      ctx.fillStyle = c4 || "#17181a";
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("❤️   💬   ↗️   🔖", W / 2, 1248);
      ctx.textAlign = "left";
    }
    ctx.restore();

    // 3. AVATAR (APPLY OVALL OVERRIDES)
    const avOv = ov.avatar || {};
    if (!avOv.an && ho !== "dark-photo" && ho !== "notebook") {
      const avX = avOv.x !== undefined ? avOv.x : (parseFloat(vars["avatar-x"]) || 54);
      const avY = avOv.y !== undefined ? avOv.y : (parseFloat(vars["avatar-y"]) || 52);
      const avSize = avOv.size !== undefined ? avOv.size : (parseFloat(vars["avatar-size"]) || 104);

      ctx.save();
      drawRoundedRect(ctx, avX, avY, avSize, avSize, avSize / 2);
      ctx.clip();
      if (avImg) {
        ctx.drawImage(avImg, avX, avY, avSize, avSize);
      } else {
        ctx.fillStyle = c4;
        ctx.fillRect(avX, avY, avSize, avSize);
      }
      ctx.restore();
    }

    // 4. SIGNATURE HIGHLIGHTER BRUSH & AUTHOR NAME (APPLY OVALL OVERRIDES)
    const nameOv = ov.name || {};
    const nameX = nameOv.x !== undefined ? nameOv.x : (parseFloat(vars["name-x"]) || 180);
    const nameY = nameOv.y !== undefined ? nameOv.y : (parseFloat(vars["name-y"]) || 52);
    const nameSize = nameOv.size !== undefined ? nameOv.size : (parseFloat(vars["name-size"]) || 32);

    if (ho === "the-vet" && !nameOv.an) {
      ctx.save();
      const nbarGrad = ctx.createLinearGradient(nameX, nameY, nameX + 430, nameY);
      nbarGrad.addColorStop(0, c4);
      nbarGrad.addColorStop(0.88, c4);
      nbarGrad.addColorStop(1, "transparent");
      ctx.fillStyle = nbarGrad;
      ctx.translate(nameX, nameY + 32);
      ctx.rotate(-0.014);
      drawRoundedRect(ctx, 0, 0, 420, 22, 10);
      ctx.fill();
      ctx.restore();
    }

    const displayName = story.page || studioPageName.value || story.author;
    const isSerif = ho === "the-vet" || ho === "giay-rach" || tpl.id.includes("serif");
    const nameFontFam = isSerif ? 'Georgia, "Times New Roman", serif' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    if (!nameOv.an) {
      ctx.fillStyle = (ho === "anh-kinh" || ho === "dark-photo" || ho === "dark-max") ? "#ffffff" : (c6 || "#1c2b4a");
      ctx.font = `bold ${nameSize}px ${nameFontFam}`;
      const textDrawX = (ho === "the-vet") ? nameX + 16 : nameX;
      const textDrawY = (ho === "the-vet") ? nameY + 36 : nameY + 36;
      ctx.fillText(displayName, textDrawX, textDrawY);

      // Verified Blue Badge
      const badgeOv = ov.badge || {};
      if (!badgeOv.an) {
        const nameWidth = ctx.measureText(displayName).width;
        ctx.fillStyle = "#1d9bf0";
        ctx.beginPath();
        ctx.arc(textDrawX + nameWidth + 20, textDrawY - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText("✓", textDrawX + nameWidth + 15, textDrawY - 5);
      }
    }

    // Time & Handle
    const timeOv = ov.time || {};
    if (!timeOv.an) {
      const timeX = timeOv.x !== undefined ? timeOv.x : nameX;
      const timeY = timeOv.y !== undefined ? timeOv.y : (parseFloat(vars["time-y"]) || (nameY + 48));
      const timeSize = timeOv.size !== undefined ? timeOv.size : (parseFloat(vars["time-size"]) || 22);
      ctx.fillStyle = (ho === "anh-kinh" || ho === "dark-photo") ? "#94a3b8" : "#4a4f57";
      ctx.font = `500 ${timeSize}px ${nameFontFam}`;
      ctx.fillText(`(${story.timeAgo || "3h ago"}) • ${story.handle || "@story"}`, timeX, timeY + 26);
    }

    // 5. BODY TEXT & HIGHLIGHTS
    const bodyOv = ov.body || {};
    if (!bodyOv.an) {
      const bodyTextColor = (ho === "anh-kinh" || ho === "dark-photo" || ho === "dark-max") ? "#f0fdf4" : (c6 || "#1c2b4a");
      if (textPlan && textPlan.lines) {
        for (let k = 0; k < textPlan.lines.length; k++) {
          const l = textPlan.lines[k];
          ctx.fillStyle = l.isHl ? (red || "#c2185b") : bodyTextColor;
          ctx.font = l.font;
          ctx.fillText(l.text, l.x, l.y);
        }
      }
    }

    // 6. BOTTOM CTA BUTTON / BOX
    const ctaOv = ov.ctabox || ov.bar || {};
    if (!ctaOv.an && ho !== "dark-photo" && ho !== "bright-photo") {
      const ctaboxX = ctaOv.x !== undefined ? ctaOv.x : (parseFloat(vars["ctabox-x"]) || 90);
      const ctaboxY = ctaOv.y !== undefined ? ctaOv.y : (parseFloat(vars["ctabox-y"]) || 1128);
      const ctaboxW = ctaOv.w !== undefined ? ctaOv.w : (parseFloat(vars["ctabox-w"]) || 540);
      const ctaboxH = ctaOv.h !== undefined ? ctaOv.h : (parseFloat(vars["ctabox-h"]) || 54);
      const ctaboxSize = ctaOv.size !== undefined ? ctaOv.size : (parseFloat(vars["ctabox-size"]) || 22);

      ctx.save();
      drawRoundedRect(ctx, ctaboxX, ctaboxY, ctaboxW, ctaboxH, 27);
      ctx.fillStyle = cta || "#10b981";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${ctaboxSize}px ${nameFontFam}`;
      ctx.textAlign = "center";
      ctx.fillText(story.cta || "Continuer la lecture", ctaboxX + ctaboxW / 2, ctaboxY + ctaboxH / 2 + ctaboxSize * 0.35);
      ctx.textAlign = "left";
      ctx.restore();
    }
  }

  // Continuous animation loop for video background in preview
  function startContinuousPreview() {
    function tick() {
      if (studioModal.style.display === "flex" && !isRecording) {
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
    const avFile = isRandomAv ? (window.AVATAR_FILES[storyIndex % window.AVATAR_FILES.length]) : selectedAvatar;
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
        renderProgressBar.style.width = pct + "%";
        renderPercentText.textContent = pct + "%";
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

  // 8. GEN SINGLE VIDEO DIRECTLY FROM CHINH EDITOR (USING ALL CURRENT EDITS)
  async function genVideoFromChinhEditor() {
    if (typeof cur === "undefined" || cur < 0 || !MAU[cur]) {
      return alert("Vui lòng mở một mẫu để chỉnh sửa trước khi xuất video!");
    }

    const mIdx = cur;
    const m = MAU[mIdx];
    const palIdx = state[mIdx].pal;
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

    const story = (parsedStories && parsedStories[0]) || {
      author: studioAuthorName.value.replace('@', '') || "Emily Vance",
      handle: studioAuthorName.value || "@daily_confessions",
      page: studioPageName.value || "Daily Confessions",
      title: "Story Sample",
      timeAgo: "3h ago",
      content: "I adopted the little girl that twenty families had rejected alone. Her medical diagnosis scared everyone away. I signed the adoption papers in less than four minutes.",
      highlights: ["rejected alone"],
      cta: "Read Full Story In Comments",
      pinLink: "https://example.com/story-1"
    };

    const dur = parseInt(cDuration.value, 10) || 10;
    const bgMode = cBgMode.value;

    btnGenFromChinh.disabled = true;
    cRenderProgress.style.display = "block";
    cRenderStatus.textContent = `Đang render video [${tpl.label}] (${dur}s)...`;
    cProgressBar.style.width = "10%";
    cRenderPercent.textContent = "10%";

    // Set background clip if video mode
    if (bgMode === "random") {
      studioBgVideo.src = `assets/backgrounds/${window.BG_FILES[0] || 'clip_01.mp4'}`;
    } else if (bgMode === "fixed") {
      studioBgVideo.src = `assets/backgrounds/${activeSelectedBg || 'clip_01.mp4'}`;
    } else {
      studioBgVideo.removeAttribute("src");
    }
    studioBgVideo.currentTime = 0;
    studioBgVideo.play().catch(() => {});

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
        cProgressBar.style.width = pct + "%";
        cRenderPercent.textContent = pct + "%";
      });
      cancelAnimationFrame(animId);

      cProgressBar.style.width = "100%";
      cRenderPercent.textContent = "100%";
      cRenderStatus.textContent = "✓ Hoàn thành! Đang tải file xuống...";

      const pageRaw = (story.page || studioPageName.value || "Reels").trim();
      const safePage = pageRaw.replace(/[/\\:*?"<>|]/g, '_').trim() || "Page";
      const safeAuthor = (story.author || "Story").replace(/[/\\:*?"<>|]/g, '_').trim();
      const fileName = `${safePage}_${m.id}_${safeAuthor}`;

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${fileName}.mp4`;
      a.click();

      const txtContent = `========================================================\n🎬 THÔNG TIN XUẤT BẢN REELS / TIKTOK (XUẤT TRỰC TIẾP TỪ EDITOR)\n========================================================\nTÊN FANPAGE / KÊNH: ${pageRaw}\nVIDEO: ${fileName}.mp4\nTÁC GIẢ / AUTHOR: ${story.author}\nTHỜI GIAN HIỂN THỊ: ${story.timeAgo}\nMẪU THIẾT KẾ: ${tpl.label} (Màu: ${tpl.palName})\n\n--------------------------------------------------------\n📝 TIÊU ĐỀ:\n${story.title}\n\n📖 NỘI DUNG:\n${story.content}\n\n👉 NÚT KÊU GỌI (CTA):\n${story.cta}\n========================================================`;
      const txtBlob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
      const a2 = document.createElement("a");
      a2.href = URL.createObjectURL(txtBlob);
      a2.download = `${fileName}.txt`;
      a2.click();

      cRenderStatus.textContent = `✓ Đã tải file: [${fileName}.mp4]!`;
      btnGenFromChinh.disabled = false;
    } catch(err) {
      cancelAnimationFrame(animId);
      console.error("Render from Chinh error:", err);
      cRenderStatus.textContent = "Lỗi khi xuất video: " + err.message;
      btnGenFromChinh.disabled = false;
    }
  }

  if (btnGenFromChinh) {
    btnGenFromChinh.onclick = genVideoFromChinhEditor;
  }

  if (btnOpenStudioWithThis) {
    btnOpenStudioWithThis.onclick = () => {
      if (typeof cur !== "undefined" && cur >= 0) {
        state[cur].picked = true;
        if (cards[cur]) {
          cards[cur].classList.add("picked");
          const cb = cards[cur].querySelector("input");
          if (cb) cb.checked = true;
        }
        dongChinh();
        updatePickedUI();
        studioModal.style.display = "flex";
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
  btnRenderSingle.onclick = async () => {
    if (!parsedStories || parsedStories.length === 0) return alert("Không có kịch bản để render!");
    const story = parsedStories[currentStoryIdx] || parsedStories[0];
    const dur = parseInt(selectStudioDuration.value, 10);
    const tpl = getTemplateForStory(currentStoryIdx);

    const pageRaw = (story.page || studioPageName.value || "Reels").trim();
    const safePage = pageRaw.replace(/[/\\:*?"<>|]/g, '_').trim() || "Page";
    const safeNum = String(currentStoryIdx + 1).padStart(2, "0");
    const safeAuthor = (story.author || "Story").replace(/[/\\:*?"<>|]/g, '_').trim();
    const safeBaseName = `${safePage}_Video_${safeNum}_${safeAuthor}`;

    btnRenderSingle.disabled = true;
    renderProgressBox.style.display = "block";
    renderStatusText.textContent = `Đang render thử video #${currentStoryIdx + 1} [${tpl.label}] (${dur}s)...`;
    renderProgressBar.style.width = "10%";
    renderPercentText.textContent = "10%";

    try {
      const blob = await recordStoryVideo(story, dur, currentStoryIdx);
      
      renderProgressBar.style.width = "100%";
      renderPercentText.textContent = "100%";
      renderStatusText.textContent = "✓ Hoàn thành! Đang tải file xuống...";

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${safeBaseName}.mp4`;
      a.click();

      const txtContent = `========================================================\n🎬 THÔNG TIN XUẤT BẢN REELS / TIKTOK\n========================================================\nTÊN FANPAGE / KÊNH: ${pageRaw}\nVIDEO: Video #${currentStoryIdx + 1} (${safeBaseName}.mp4)\nTÁC GIẢ / AUTHOR: ${story.author}\nHANDLE / KÊNH: ${story.handle}\nTHỜI GIAN HIỂN THỊ: ${story.timeAgo}\nMẪU THIẾT KẾ: ${tpl.label} (Màu: ${tpl.palName})\n\n--------------------------------------------------------\n📝 TIÊU ĐỀ / CAPTION:\n${story.title}\n\n📖 NỘI DUNG TRUYỆN:\n${story.content}\n\n🔥 HIGHLIGHTS (CÂU BÔI ĐỎ TRONG VIDEO):\n${(story.highlights && story.highlights.length) ? story.highlights.join(' | ') : 'Tự động bôi đỏ câu đầu & câu cuối'}\n\n👉 NÚT KÊU GỌI (CTA):\n${story.cta}\n\n🔗 LINK GHIM BÌNH LUẬN / BIO:\n${story.pinLink}\n========================================================`;

      const txtBlob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
      const a2 = document.createElement("a");
      a2.href = URL.createObjectURL(txtBlob);
      a2.download = `${safeBaseName}.txt`;
      a2.click();

      btnRenderSingle.disabled = false;
      renderStatusText.textContent = `✓ Đã tải 1 Video thành công: [${safeBaseName}] (.mp4 + .txt)`;
    } catch(err) {
      console.error("Single render error:", err);
      renderStatusText.textContent = "Lỗi khi render video: " + err.message;
      btnRenderSingle.disabled = false;
    }
  };

  // 11. BATCH RENDER N STORIES IN STUDIO
  btnRenderBatch30.onclick = async () => {
    if (!parsedStories || parsedStories.length === 0) return alert("Không có kịch bản để render! Vui lòng nạp hoặc nhập kịch bản.");
    
    const count = targetVideoCount;
    const dur = parseInt(selectStudioDuration.value, 10);
    
    buildBatchTemplatePlan(count);

    btnRenderBatch30.disabled = true;
    renderProgressBox.style.display = "block";
    btnDownloadAllZip.style.display = "none";
    renderedFiles = [];

    const defaultPageRaw = studioPageName.value.trim() || "Reels_Page";

    for (let i = 0; i < count; i++) {
      const story = parsedStories[i % parsedStories.length];
      const activeTpl = getTemplateForStory(i);

      const pageRaw = (story.page || defaultPageRaw).trim();
      const safePage = pageRaw.replace(/[/\\:*?"<>|]/g, '_').trim() || "Page";
      const safeNum = String(i + 1).padStart(2, "0");
      const safeAuthor = (story.author || "Story").replace(/[/\\:*?"<>|]/g, '_').trim();
      const safeFileName = `${safePage}_Video_${safeNum}_${safeAuthor}`;

      renderStatusText.textContent = `Đang render video ${i + 1}/${count}: [${safeFileName}] - Mẫu: ${activeTpl.label}...`;
      const basePct = Math.round((i / count) * 100);
      renderProgressBar.style.width = basePct + "%";
      renderPercentText.textContent = basePct + "%";

      try {
        const mp4Blob = await recordStoryVideo(story, dur, i);

        renderedFiles.push({
          name: safeFileName + ".mp4",
          blob: mp4Blob
        });

        const txtContent = `========================================================\n🎬 THÔNG TIN XUẤT BẢN REELS / TIKTOK\n========================================================\nTÊN FANPAGE / KÊNH: ${pageRaw}\nVIDEO: Video #${i + 1} / ${count} (${safeFileName}.mp4)\nTÁC GIẢ / AUTHOR: ${story.author}\nHANDLE / KÊNH: ${story.handle}\nTHỜI GIAN HIỂN THỊ: ${story.timeAgo}\nMẪU THIẾT KẾ: ${activeTpl.label} (Màu: ${activeTpl.palName})\n\n--------------------------------------------------------\n📝 TIÊU ĐỀ / CAPTION:\n${story.title}\n\n📖 NỘI DUNG TRUYỆN:\n${story.content}\n\n🔥 HIGHLIGHTS (CÂU BÔI ĐỎ TRONG VIDEO):\n${(story.highlights && story.highlights.length) ? story.highlights.join(' | ') : 'Tự động bôi đỏ câu đầu & câu cuối'}\n\n👉 NÚT KÊU GỌI (CTA):\n${story.cta}\n\n🔗 LINK GHIM BÌNH LUẬN / BIO:\n${story.pinLink}\n========================================================`;

        renderedFiles.push({
          name: safeFileName + ".txt",
          blob: new Blob([txtContent], { type: "text/plain;charset=utf-8" })
        });
      } catch(err) {
        console.error(`Error rendering video ${i + 1}:`, err);
      }
    }

    renderProgressBar.style.width = "100%";
    renderPercentText.textContent = "100%";
    renderStatusText.textContent = `✓ Đã render xong đúng ${renderedFiles.length / 2} video! Đang nén file ZIP tự động tải về...`;
    
    btnDownloadAllZip.style.display = "block";
    btnDownloadAllZip.textContent = `📦 TẢI TOÀN BỘ ${renderedFiles.length / 2} VIDEO & TXT (.ZIP TRỌN GÓI)`;
    btnDownloadAllZip.click();

    btnRenderBatch30.disabled = false;
  };

  btnDownloadAllZip.onclick = async () => {
    if (renderedFiles.length === 0) return;
    const defaultPageRaw = studioPageName.value.trim() || "Reels_Page";
    const safePage = defaultPageRaw.replace(/[/\\:*?"<>|]/g, '_').trim();
    btnDownloadAllZip.textContent = "⏳ Đang nén file ZIP...";
    btnDownloadAllZip.disabled = true;
    const zipBlob = await createZipBlob(renderedFiles);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(zipBlob);
    a.download = `${safePage}_Tron_Goi_${renderedFiles.length / 2}_Videos.zip`;
    a.click();
    btnDownloadAllZip.textContent = "✓ Đã tải file ZIP thành công!";
    btnDownloadAllZip.disabled = false;
  };

  // INITIALIZATION
  renderBgGrid();
  renderAvatars();
  reloadStories();
  setTimeout(updatePickedUI, 400);

})();
