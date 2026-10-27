import re

with open('studio_engine_v9.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update Engine log
code = code.replace(
    'Initializing Việt Reels Studio Pro Engine v9.0 (3-Tier Reels Funnel Edition)',
    'Initializing Việt Reels Studio Pro Engine v10.0 (Master Unified & 76-Templates Edition)'
)

# 2. Add element queries for Mode switching & Template selector
old_query_marker = 'const selectStudioCountry = document.getElementById("selectStudioCountry");'
new_queries = '''const selectStudioCountry = document.getElementById("selectStudioCountry");
  const btnModeSingle = document.getElementById("btnModeSingle");
  const btnModeRandom = document.getElementById("btnModeRandom");
  const boxSingleModeControls = document.getElementById("boxSingleModeControls");
  const boxRandomModeControls = document.getElementById("boxRandomModeControls");
  const selectStudioLockedTemplate = document.getElementById("selectStudioLockedTemplate");
  const btnClearAllPicked = document.getElementById("btnClearAllPicked");
  const btnPickAllTemplates = document.getElementById("btnPickAllTemplates");'''
code = code.replace(old_query_marker, new_queries)

# 3. Replace template plan and add Unified Single Mode logic
old_plan_section = re.search(
    r'// 2\. BATCH TEMPLATE PLAN[\s\S]*?function getTemplateForStory\(storyIndex\) \{[\s\S]*?return batchTemplatePlan\[storyIndex\];[\s\S]*?vars: palMeta0\.vars \|\| \{\}\s*\};\s*\}',
    code
)

new_plan_section = '''// 2. BATCH TEMPLATE PLAN & DUAL MODE ENGINE (100% UNIFIED SINGLE vs RANDOM)
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

  function populateTemplateDropdown() {
    if (!selectStudioLockedTemplate || typeof MAU === "undefined") return;
    const currentVal = selectStudioLockedTemplate.value ? parseInt(selectStudioLockedTemplate.value, 10) : studioLockedTemplateIdx;
    selectStudioLockedTemplate.innerHTML = "";
    MAU.forEach((m, idx) => {
      const palIdx = (state && state[idx]) ? state[idx].pal : 0;
      const pal = (m.pals && m.pals[palIdx]) ? m.pals[palIdx] : m.pals[0];
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = `${String(idx + 1).padStart(2, '0')}. ${m.label} • Màu: ${pal.id}`;
      selectStudioLockedTemplate.appendChild(opt);
    });
    selectStudioLockedTemplate.value = (!isNaN(currentVal) && currentVal >= 0 && currentVal < MAU.length) ? currentVal : studioLockedTemplateIdx;
  }

  function buildBatchTemplatePlan(count) {
    batchTemplatePlan = [];

    // Mode 1: Strict Single Locked Template (100% Uniform for all N videos)
    if (currentStudioMode === "single") {
      const lockedTpl = getTemplateObj(studioLockedTemplateIdx);
      batchTemplatePlan = Array(count).fill(lockedTpl);
      return;
    }

    // Mode 2: Random Scramble across picked templates
    const picked = getPickedTemplates();
    if (picked.length === 0) {
      const fallbackTpl = getTemplateObj(studioLockedTemplateIdx);
      batchTemplatePlan = Array(count).fill(fallbackTpl);
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
    return getTemplateObj(studioLockedTemplateIdx);
  }'''

if old_plan_section:
    code = code.replace(old_plan_section.group(0), new_plan_section)

# 4. Update updatePickedUI to reflect the active mode and count
old_update_ui = re.search(
    r'function updatePickedUI\(\) \{[\s\S]*?buildBatchTemplatePlan\(targetVideoCount\);\s*updateLivePreview\(\);\s*\}',
    code
)

new_update_ui = '''function updatePickedUI() {
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
  }'''

if old_update_ui:
    code = code.replace(old_update_ui.group(0), new_update_ui)

# 5. Wire Mode Toggle, Dropdown & Bulk Pick Buttons
mode_wiring = '''  // Wire Mode Toggle Buttons & Template Selector
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
    studioLockedTemplateIdx = i;
    currentStudioMode = "single";
    populateTemplateDropdown();
    if (selectStudioLockedTemplate) selectStudioLockedTemplate.value = i;
    setStudioMode("single");
    openStudio();
  };
'''

code = code.replace(
    '// Language Selector',
    mode_wiring + '\n  // Language Selector'
)

# 6. Update openStudio to populate dropdown
code = code.replace(
    'function openStudio() {\n    if (studioModal) {\n      studioModal.style.display = "flex";\n      updatePickedUI();\n    }\n  }',
    'function openStudio() {\n    if (studioModal) {\n      populateTemplateDropdown();\n      studioModal.style.display = "flex";\n      updatePickedUI();\n      updateLivePreview();\n    }\n  }'
)

# 7. Update btnOpenStudioWithThis in #chinh
code = re.sub(
    r'if \(btnOpenStudioWithThis\) \{[\s\S]*?openStudio\(\);\s*\}\s*\};\s*\}',
    '''if (btnOpenStudioWithThis) {
    btnOpenStudioWithThis.onclick = () => {
      if (typeof cur !== "undefined" && cur >= 0) {
        if (typeof dongChinh === "function") dongChinh();
        window.openStudioWithTemplate(cur);
      }
    };
  }''',
    code
)

# 8. Enhance drawTemplateCanvas to support all 76 templates & all 11 families seamlessly
old_draw_fn = re.search(
    r'function drawTemplateCanvas\(ctx, story, tpl, avImg, bgVideo, textPlan\) \{[\s\S]*?ctx\.textAlign = "left";\s*ctx\.restore\(\);\s*\}\s*\}',
    code
)

new_draw_fn = '''function drawTemplateCanvas(ctx, story, tpl, avImg, bgVideo, textPlan) {
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
    const red = customColors["red"] || vars["red"] || "#bf360c";
    const cta = customColors["cta"] || vars["cta"] || "#10b981";

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
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, c1 || "#0f172a");
      grad.addColorStop(1, c2 || "#1e293b");
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

    } else if (ho === "bang-dong") {
      // Golden Bronze Card
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

    // 4. AUTHOR NAME & HEADER (ONLY IF TEMPLATE HAS NAME LAYER)
    const nameOv = ov.name || {};
    const nameX = nameOv.x !== undefined ? nameOv.x : (parseFloat(vars["name-x"]) || 180);
    const nameY = nameOv.y !== undefined ? nameOv.y : (parseFloat(vars["name-y"]) || 52);
    const nameSize = nameOv.size !== undefined ? nameOv.size : (parseFloat(vars["name-size"]) || 32);

    if (ho === "the-vet" && !nameOv.an && hasNameLayer) {
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

    const displayName = (story && story.page) ? story.page : (studioPageName ? studioPageName.value : "Daily Confessions");
    const isSerif = ho === "the-vet" || ho === "giay-rach" || ho === "bang-dong" || tpl.id.includes("serif");
    const nameFontFam = isSerif ? 'Georgia, "Times New Roman", serif' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    if (hasNameLayer && !nameOv.an) {
      ctx.fillStyle = isDarkHo ? "#ffffff" : (c6 || "#1c2b4a");
      ctx.font = `bold ${nameSize}px ${nameFontFam}`;
      const textDrawX = (ho === "the-vet") ? nameX + 16 : nameX;
      const textDrawY = nameY + 36;
      ctx.fillText(displayName, textDrawX, textDrawY);

      // Verified Blue Badge
      const badgeOv = ov.badge || {};
      if (!badgeOv.an && "badge" in mLayers) {
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

    // Time & Handle (ONLY IF TEMPLATE HAS TIME LAYER)
    const timeOv = ov.time || {};
    if (hasTimeLayer && !timeOv.an) {
      const timeX = timeOv.x !== undefined ? timeOv.x : nameX;
      const timeY = timeOv.y !== undefined ? timeOv.y : (parseFloat(vars["time-y"]) || (nameY + 48));
      const timeSize = timeOv.size !== undefined ? timeOv.size : (parseFloat(vars["time-size"]) || 22);
      ctx.fillStyle = isDarkHo ? "#94a3b8" : "#4a4f57";
      ctx.font = `500 ${timeSize}px ${nameFontFam}`;
      const timeStr = (story && story.timeAgo) ? story.timeAgo : "3h ago";
      const handleStr = (story && story.handle) ? story.handle : "@story";
      ctx.fillText(`(${timeStr}) • ${handleStr}`, timeX, timeY + 26);
    }

    // 5. BODY TEXT & HIGHLIGHTS (ALWAYS RENDERED)
    const bodyOv = ov.body || {};
    if (!bodyOv.an) {
      const bodyTextColor = isDarkHo ? "#f0fdf4" : (c6 || "#1c2b4a");
      if (textPlan && textPlan.lines) {
        for (let k = 0; k < textPlan.lines.length; k++) {
          const l = textPlan.lines[k];
          ctx.fillStyle = l.isHl ? (red || "#c2185b") : bodyTextColor;
          ctx.font = l.font;
          ctx.fillText(l.text, l.x, l.y);
        }
      }
    }

    // 6. BOTTOM CTA BUTTON / BOX (ONLY IF TEMPLATE HAS CTA LAYER)
    const ctaOv = ov.ctabox || ov.bar || {};
    if (hasCtaLayer && !ctaOv.an && ho !== "dark-photo" && ho !== "bright-photo") {
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
      const ctaText = (story && story.cta) ? story.cta : "Read Continuation In Caption";
      ctx.fillText(ctaText, ctaboxX + ctaboxW / 2, ctaboxY + ctaboxH / 2 + ctaboxSize * 0.35);
      ctx.textAlign = "left";
      ctx.restore();
    }
  }'''

if old_draw_fn:
    code = code.replace(old_draw_fn.group(0), new_draw_fn)

with open('studio_engine_v10.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('studio_engine_v10.js generated cleanly!')
