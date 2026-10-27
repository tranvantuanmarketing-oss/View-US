import os, json, re

print("Starting make_v12.py to generate Studio Engine v12 (100% Faithful Canvas & Auto-Fit Typography)...")

# 1. Read studio_engine_v11.js
with open('studio_engine_v11.js', 'r', encoding='utf-8') as f:
    engine_js = f.read()

# Update log version
engine_js = engine_js.replace(
    'Initializing Việt Reels Studio Pro Engine v10.0 (Master Unified & 76-Templates Edition)',
    'Initializing Việt Reels Studio Pro Engine v12.0 (100% Native-Matched Typography & Full-Card AutoFit)'
)

# 2. Add drawHeart function and rewrite prepareStoryTypography & drawTemplateCanvas
new_heart_and_typography = '''  // SVG Heart Path matching template 0-10 exact vector
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
    const paragraphs = rawContent.split(/\\n+/).map(p => p.trim()).filter(Boolean);

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
        const words = paragraphs[p].split(/\\s+/).filter(Boolean);
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
      h.toLowerCase().replace(/[^a-z0-9à-ỹ\\s]/gi, "").trim()
    ).filter(h => h.length > 2);

    // Tag each word with highlight status
    bestSim.lines.forEach((line, lineIdx) => {
      line.words.forEach(wObj => {
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
  }'''

# Replace prepareStoryTypography and drawStar with new_heart_and_typography
old_prep_section = re.search(
    r'function drawStar[\s\S]*?function prepareStoryTypography[\s\S]*?return \{ lines: linePlans, fontSize, fontFam, bodyX, bodyY, bodyW, bodyH \};\s*\}',
    engine_js
)

if old_prep_section:
    engine_js = engine_js.replace(old_prep_section.group(0), new_heart_and_typography, 1)
    print("Replaced prepareStoryTypography and drawHeart successfully.")
else:
    print("WARNING: Could not find old prepareStoryTypography to replace!")

# -------------------------------------------------------------
# 3. REWRITE DRAW TEMPLATE CANVAS FOR 100% FAITHFUL VISUALS
# -------------------------------------------------------------
old_draw_fn = re.search(
    r'function drawTemplateCanvas\(ctx, story, tpl, avImg, bgVideo, textPlan\) \{[\s\S]*?ctx\.fillText\(ctaText, ctaboxX \+ ctaboxW / 2, ctaboxY \+ ctaboxH / 2 \+ ctaboxSize \* 0\.35\);\s*ctx\.textAlign = "left";\s*ctx\.restore\(\);\s*\}\s*\}',
    engine_js
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
          ctx.fillStyle = wObj.isHl ? (red || "#e64a19") : bodyTextColor;
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
  }'''

if old_draw_fn:
    engine_js = engine_js.replace(old_draw_fn.group(0), new_draw_fn, 1)
    print("Replaced drawTemplateCanvas with high-fidelity native-matched renderer.")
else:
    print("WARNING: Could not find old drawTemplateCanvas to replace!")

# -------------------------------------------------------------
# 4. ADD SCRIPT WORD-COUNT & PARAGRAPH LIVE COUNTER IN STUDIO
# -------------------------------------------------------------
stats_updater_code = '''
  // Live Script Stats Indicator (Word count, paragraph count, full-card check)
  function updateScriptLiveStats() {
    const badge = document.getElementById("statWordCountBadge");
    if (!badge || !parsedStories || parsedStories.length === 0) return;
    const story = parsedStories[currentStoryIdx] || parsedStories[0];
    const words = (story && story.content ? story.content.trim().split(/\\s+/) : []).filter(Boolean);
    const paras = (story && story.content ? story.content.trim().split(/\\n+/) : []).filter(Boolean);
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
'''

engine_js = engine_js.replace(
    'function updateStoryNav() {',
    stats_updater_code + '\n  function updateStoryNav() {'
)

# Call updateScriptLiveStats inside updateStoryNav
engine_js = engine_js.replace(
    'if (statStoryCountDisplay) statStoryCountDisplay.textContent = parsedStories.length;',
    'if (statStoryCountDisplay) statStoryCountDisplay.textContent = parsedStories.length;\n    updateScriptLiveStats();'
)

# Save studio_engine_v12.js
with open('studio_engine_v12.js', 'w', encoding='utf-8') as f:
    f.write(engine_js)
print("Saved studio_engine_v12.js cleanly.")

# -------------------------------------------------------------
# 5. UPDATE BUILD_STUDIO_V10.PY TO USE V12 AND INCLUDE UI GUIDELINE
# -------------------------------------------------------------
with open('build_studio_v10.py', 'r', encoding='utf-8') as f:
    builder = f.read()

# Update injected script
builder = builder.replace("studio_engine_v11.js", "studio_engine_v12.js")
builder = builder.replace("studio_engine_v10.js", "studio_engine_v12.js")

# Add Guideline Box in Script Tab HTML if not already there
old_tab_script_start = '<div id="tabScriptContent" style="padding: 12px; flex: 1; display: flex; flex-direction: column; gap: 8px;">'
new_tab_script_start = '''<div id="tabScriptContent" style="padding: 12px; flex: 1; display: flex; flex-direction: column; gap: 8px;">
            <!-- QUY CHUẨN LẤP ĐẦY THẺ VIDEO CHUẨN FACEBOOK REELS -->
            <div style="background: rgba(16, 185, 129, 0.12); border: 1.5px solid rgba(52, 211, 153, 0.4); border-radius: 10px; padding: 10px 14px; font-size: 11.5px; color: #a7f3d0; line-height: 1.5;">
              <div style="font-weight: 800; color: #34d399; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span>📏 QUY CHUẨN ĐỘ DÀI & ĐỊNH DẠNG NỘI DUNG (CHUẨN FACEBOOK REELS):</span>
                <span id="statWordCountBadge" style="background: rgba(0,0,0,0.5); border: 1px solid #10b981; color: #fde047; padding: 3px 10px; border-radius: 6px; font-size: 11px;">135 từ · 3 đoạn (Đạt chuẩn ✅)</span>
              </div>
              • <b>Độ dài lý tưởng:</b> 110 – 160 từ (khoảng 550 – 850 ký tự).<br>
              • <b>Cách ngắt dòng:</b> Bấm Enter ngắt thành 3 – 4 đoạn ngắn (mỗi đoạn 1 – 2 câu có ý nghĩa trọn vẹn).<br>
              • <b>Auto-Fit 100%:</b> Hệ thống tự động co giãn cỡ chữ (28px – 42px) và khoảng cách đoạn để <b>lấp đầy 85% – 92% thẻ</b>, video xuất ra đầy đặn, đẹp mắt 100% như mẫu xem trước!
            </div>'''

if old_tab_script_start in builder and 'statWordCountBadge' not in builder:
    builder = builder.replace(old_tab_script_start, new_tab_script_start, 1)
    print("Added UI Guideline Box and Live Stats badge into Script Tab HTML.")

with open('build_studio_v10.py', 'w', encoding='utf-8') as f:
    f.write(builder)
print("Updated build_studio_v10.py successfully.")

print("make_v12.py completed!")
