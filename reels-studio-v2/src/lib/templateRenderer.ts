import assetsMap from "../data/assets.json";
import languagesData from "../data/languages.json";
import { Template } from "./types";
import { normalizeLocale } from "./locales";

export interface LanguageConfig {
  id: string;
  label: string;
  ma: string;
  rtl: boolean;
  sampleName: string;
  ctaBar: string;
  ctaBox: string;
  ctaPill: string;
  time: string;
  cta: Record<string, string>;
}

export const languages: LanguageConfig[] = languagesData as LanguageConfig[];

export function getLanguage(locale: string): LanguageConfig {
  const normalized = normalizeLocale(locale);
  const found = languages.find((l) => l.id.toLowerCase() === normalized);
  return found || languages.find((l) => l.id === "en") || languages[0];
}

/**
 * CSS rule generator for individual layer colors (luatMauLop)
 */
export function generateLayerColorCss(key: string, o: { fg?: string; bg?: string }): string[] {
  const rules: string[] = [];
  const isBody = key === "body";
  const childSelector = isBody
    ? `[data-layer="body"] .inner`
    : `[data-layer="${key}"] *:not(.badge)`;

  if (o.fg) {
    rules.push(`[data-layer="${key}"]{color:${o.fg}!important;stroke:${o.fg}!important}`);
    rules.push(
      isBody
        ? `${childSelector}{color:${o.fg}!important}`
        : `${childSelector}{color:inherit!important;stroke:inherit!important}`
    );
  }
  if (o.bg) {
    rules.push(`[data-layer="${key}"]{background:${o.bg}!important;fill:${o.bg}!important}`);
    if (!isBody) {
      rules.push(`${childSelector}{fill:inherit!important}`);
    }
  }
  return rules;
}

/**
 * Build HTML document for live iframe preview or video render
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildTemplateHtml(
  template: Template,
  paletteIndex: number = 0,
  locale: string = "en",
  overrides: Record<string, any> = {},
  customContent?: {
    name?: string;
    time?: string;
    body?: string;
    bodyLines?: string[];
    highlights?: string[];
    cta?: string;
    avatarUrl?: string;
    locale?: string;
  }
): string {
  const effectiveLocale = customContent?.locale || locale || "en";
  const L = getLanguage(effectiveLocale);
  const pal = template.pals[paletteIndex % template.pals.length];
  let html = pal.html;

  // 1. Replace assets (@@AV@@, @@CLIP@@, @@ANH@@)
  const assetEntries = Object.entries(assetsMap as Record<string, string>);
  for (const [key, uri] of assetEntries) {
    if (key === "@@AV@@" && customContent?.avatarUrl) {
      html = html.split(key).join(customContent.avatarUrl);
    } else {
      html = html.split(key).join(uri);
    }
  }

  // 2. Replace localized text placeholders
  const authorName = customContent?.name ?? L.sampleName;
  const timeText = customContent?.time ?? L.time;
  const ctaText = customContent?.cta || L.cta[template.id] || L.cta.default;

  html = html
    .split("@@NAME@@").join(escapeHtml(authorName))
    .split("@@TIME@@").join(escapeHtml(timeText))
    .split("@@CTA@@").join(escapeHtml(ctaText))
    .split("@@CTABOX@@").join(escapeHtml(ctaText || L.ctaBox))
    .split("@@CTAPILL@@").join(escapeHtml(ctaText || L.ctaPill))
    .split("@@BAR@@").join(escapeHtml(ctaText || L.ctaBar));

  // If custom story text is provided, replace the body content
  const lines = customContent?.bodyLines && customContent.bodyLines.length > 0
    ? customContent.bodyLines
    : customContent?.body
    ? customContent.body.split("\n").filter((l) => l.trim().length > 0)
    : null;

  if (lines && lines.length > 0) {
    const linesHtml = lines
      .map((line, idx) => {
        let safeLine = escapeHtml(line);
        if (customContent?.highlights) {
          for (const hl of customContent.highlights) {
            if (hl && hl.trim()) {
              const safeHl = escapeHtml(hl.trim());
              if (safeLine.includes(safeHl)) {
                safeLine = safeLine.split(safeHl).join(`<span class="r font-bold">${safeHl}</span>`);
              }
            }
          }
        }
        return `<p class="line line-${idx + 1}" style="margin: 0 0 0.5em 0;">${safeLine}</p>`;
      })
      .join("");

    // Replace text inside <div class="inner" id="body"> or <div id="body"> cleanly
    html = html.replace(/(<div[^>]*\bid=["']?body["']?[^>]*>)([\s\S]*?)(<\/div>)/i, (_match, open, previous, close) => {
      // Some templates keep their CTA inside the body; retain that layer when replacing sample text.
      const inlineCta = previous.match(/<span\b[^>]*class=["'][^"']*\bcta\b[^"']*["'][^>]*>[\s\S]*?<\/span>/i)?.[0] || "";
      return `${open}${linesHtml}${inlineCta}${close}`;
    });
  }

  // 3. Prepare Injected CSS and Overrides
  const ovFather = overrides[template.id] || {};
  const ovChild = overrides[`${template.id}:${pal.id}`] || {};
  const mergedOv = {
    ...ovFather,
    ...ovChild,
    _colors: { ...(ovFather._colors || {}), ...(ovChild._colors || {}) },
  };

  const cssRules: string[] = [];

  // Custom colors
  if (mergedOv._colors) {
    for (const [k, v] of Object.entries(mergedOv._colors)) {
      if (v) cssRules.push(`:root { --${k}: ${v} !important; }`);
    }
  }

  // Layer coordinates and styles
  for (const [layerKey, layerVal] of Object.entries(mergedOv)) {
    if (layerKey === "_colors" || layerKey === "_tay" || layerKey === "_video" || typeof layerVal !== "object" || !layerVal) continue;
    const lObj = layerVal as Record<string, any>;
    for (const [prop, val] of Object.entries(lObj)) {
      if (prop !== "an" && val !== undefined) {
        const unit = prop === "scale" ? "" : "px";
        cssRules.push(`:root { --${layerKey}-${prop}: ${val}${unit} !important; }`);
      }
    }
    // Hidden layer
    if (lObj.an) {
      cssRules.push(`[data-layer="${layerKey}"] { display: none !important; }`);
    }
    // Layer specific fg/bg
    if (lObj.fg || lObj.bg) {
      cssRules.push(...generateLayerColorCss(layerKey, lObj));
    }
  }

  // RTL support
  if (L.rtl) {
    cssRules.push(`html { direction: rtl; --text-align: right; }`);
  }

  // Floating background motion support
  let bgMotionScript = "";
  if (template.motion && pal.bgTpl) {
    const co = { ...pal.bgMac, ...(mergedOv._colors || {}) };
    const bgCss = pal.bgTpl
      .split("@@C1@@").join(co.c1 || "#fff")
      .split("@@C2@@").join(co.c2 || "#ddd")
      .split("@@C3@@").join(co.c3 || "#aaa")
      .split("INKINK").join(encodeURIComponent(co.ink || "#000"));
    bgMotionScript = `
      try {
        const bg = document.getElementById("bglayer");
        if (bg) bg.style.cssText = ${JSON.stringify(bgCss)};
      } catch(e) {}
    `;
  }

  // Inject helper script to trigger fitBody and auto play video clips
  const injection = `
    <style id="studio-injected-overrides">
      ${cssRules.join("\n")}
    </style>
    <script>
      (function() {
        ${bgMotionScript}
        function initCard() {
          if (typeof window.fitBody === 'function') {
            window.fitBody();
          }
          if (document.fonts) document.fonts.ready.then(function(){ if(window.fitBody) window.fitBody(); });
          document.querySelectorAll('img').forEach(function(img){img.addEventListener('load',function(){if(window.fitBody) window.fitBody();});});
          document.querySelectorAll('video').forEach(function(v) {
            v.muted = true;
            v.playsInline = true;
            v.autoplay = true;
            v.play().catch(function() {});
          });
        }
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initCard);
        } else {
          initCard();
        }
        window.addEventListener('resize', initCard);
        window.addEventListener('message',function(event){
          if(event.source !== window.parent || !event.data || event.data.type !== 'studio-preview') return;
          document.querySelectorAll('video').forEach(function(v){
            if(Number.isFinite(v.duration) && Math.abs(v.currentTime-event.data.time)>0.4) v.currentTime=event.data.time % v.duration;
            if(event.data.playing) v.play().catch(function(){});else v.pause();
          });
          document.querySelectorAll('*').forEach(function(el){el.style.animationPlayState=event.data.playing?'running':'paused';});
        });
      })();
    </script>
  `;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${injection}</body>`);
  }
  return html + injection;
}
