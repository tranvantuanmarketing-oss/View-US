/** Shared by page creation, imports, preview and server payloads. */
export const LOCALE_OPTIONS = [
  { id: "en", label: "🇺🇸 English (US)" },
  { id: "fr", label: "🇫🇷 Français (FR)" },
  { id: "nl", label: "🇳🇱 Nederlands (NL)" },
  { id: "vi", label: "🇻🇳 Tiếng Việt (VI)" },
  { id: "de", label: "🇩🇪 Deutsch (DE)" },
  { id: "es", label: "🇪🇸 Español (ES)" },
  { id: "pl", label: "🇵🇱 Polski — Tiếng Ba Lan (PL)" },
] as const;

const aliases: Record<string, string> = {
  polish: "pl", polski: "pl", polska: "pl", poland: "pl", "ba lan": "pl", balan: "pl",
  english: "en", french: "fr", dutch: "nl", german: "de", spanish: "es", vietnamese: "vi",
};

export function normalizeLocale(value: unknown): string {
  if (typeof value !== "string") return "";
  const text = value.trim().normalize("NFC").toLowerCase();
  return aliases[text] || text.split(/[-_]/)[0];
}

const words: Record<string, string> = {
  pl: "że nie się jest była był było kiedy moja mój moje mnie jako przez już tylko wtedy teraz jego jej ale dla przy więc tego którą który przed wszystko ojciec matka rodzina powiedział powiedziała domu pieniędzy spadek notariusz syn córka dlaczego", 
  en: "the was were she her his he they their when with from that this had have my mother father sister brother said would could before after", 
  fr: "je elle nous vous avec dans pour mais était quand avait une cette mon ma mes son ses puis chez pas mère père sœur frère avait dit", 
  nl: "het een mijn zijn haar voor niet toen maar werd waren heeft met van dat die deze moeder vader broer zus naar door huis", 
  de: "ich nicht und meine mein seine ihrer hatte als aber dass wurde waren mit auf dem den der die das mutter vater schwester bruder", 
  es: "que una con por para pero cuando había estaba dijo madre padre hermana hermano sus sin después sobre entonces nuestro", 
  vi: "tôi không của một người nhưng khi đã là với trong mẹ cha chị anh em cô ông bà nói rồi này được nhà", 
};

/** Conservative local detection: short/ambiguous text keeps the chosen locale. */
export function detectStoryLocale(story: { locale?: string; content: string; caption?: string }, fallback = "en"): string {
  const explicit = normalizeLocale(story.locale);
  if (explicit) return explicit;
  const text = `${story.content}\n${story.caption || ""}`.normalize("NFC").toLowerCase();
  const tokens = text.match(new RegExp("\\p{L}+", "gu")) || [];
  const scores = Object.entries(words).map(([locale, list]) => {
    const bank = new Set(list.split(" ").filter(Boolean));
    let score = tokens.reduce((n, word) => n + (bank.has(word) ? 1 : 0), 0);
    if (locale === "pl") score += Math.min(5, (text.match(/[ąćęłńśźż]/g) || []).length);
    if (locale === "vi") score += Math.min(5, (text.match(/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệịỉĩọỏốồổỗộớờởỡợụủũứừửữựỵỷỹ]/g) || []).length);
    return { locale, score };
  }).sort((a, b) => b.score - a.score);
  return scores[0].score >= 4 && scores[0].score >= scores[1].score * 1.4
    ? scores[0].locale : normalizeLocale(fallback) || "en";
}

/** A page is the authoritative market; detection is used for free batches. */
export function resolveStoryLocale(story: { locale?: string; content: string; caption?: string }, selectedLocale: string, pageLocale?: string): string {
  return pageLocale ? normalizeLocale(pageLocale) : detectStoryLocale(story, selectedLocale);
}
