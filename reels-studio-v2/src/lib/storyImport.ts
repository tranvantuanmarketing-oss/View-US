export interface ImportedStory {
  locale?: string;
  author: string; timeAgo: string; pageName: string; title: string;
  content: string; highlights: string[]; cta: string; caption: string; comment1: string;
}

const fields: Record<string, keyof Omit<ImportedStory, "highlights"> | "highlights"> = {
  "tác giả": "author", author: "author", "thời gian": "timeAgo", time: "timeAgo",
  "tên page": "pageName", page: "pageName", "tiêu đề": "title", title: "title",
  "nội dung thẻ": "content", "nội dung": "content", content: "content", body: "content",
  highlights: "highlights", "từ nổi bật": "highlights", "nút cta": "cta", cta: "cta",
  caption: "caption", "mô tả": "caption", "comment 1": "comment1", "first comment": "comment1",
  "nội dung video": "content", "video text": "content", "caption facebook": "caption", "bình luận ghim": "comment1", "pinned comment": "comment1", "video content": "content", "cmt": "comment1", "comment": "comment1", "bình luận": "comment1", "cmt 1": "comment1",
  "bình luận 1": "comment1", "caption bài đăng": "caption",
  locale: "locale", language: "locale", "ngôn ngữ": "locale", język: "locale",
  autor: "author", czas: "timeAgo", strona: "pageName", tytuł: "title",
  treść: "content", "treść wideo": "content", wyróżnienia: "highlights", opis: "caption",
  "komentarz 1": "comment1", "pierwszy komentarz": "comment1",
};

export function parseStories(raw: string): ImportedStory[] {
  const text = raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trim();
  if (!text) return [];
  if (text.includes("\uFFFD")) throw new Error("File không đúng UTF-8. Hãy lưu lại bằng UTF-8.");
  if (/^\{|^\[\s*(?:\{|\]|\")/.test(text)) {
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : data.stories || data.items || ((data.content || data.body || data.story_payload) ? [data] : undefined);
    if (!Array.isArray(list)) throw new Error("JSON cần là danh sách story hoặc có trường stories/items.");
    return list.map((entry: any, i: number) => {
      const s = entry.story_payload || entry;
      const content = s.content || s.body || (Array.isArray(s.bodyLines) ? s.bodyLines.join("\n") : "");
      if (typeof content !== "string" || !content.trim()) throw new Error(`Story ${i + 1}: thiếu Nội dung thẻ.`);
      return { ...(s.locale || s.language ? { locale: String(s.locale || s.language) } : {}), author: String(s.author || ""), timeAgo: String(s.timeAgo || s.time || ""),
        pageName: String(s.pageName || s.page || ""), title: String(s.title || ""), content: content.trim(),
        highlights: Array.isArray(s.highlights) ? s.highlights.map(String) : [], cta: String(s.cta || ""),
        caption: String(s.caption || ""), comment1: String(s.comment1 || s.first_comment || "") };
    });
  }
  return text.split(/===\s*(?:STORY|CÂU CHUYỆN|PHẦN)\s*#?\d*\s*===/i).filter(b => b.trim()).map((block, i) => {
    const parts: Record<string, string[]> = {};
    let current = "content";
    for (const line of block.trim().split("\n")) {
      if (/^-{5,}$/.test(line.trim())) continue;
      const heading = line.trim().replace(/^#+\s*/, "").replace(/^\[|\]$/g, "").toLowerCase();
      if (fields[heading] && (fields[heading] !== current || /^\s*(?:\[|#)/.test(line))) { current = fields[heading]; parts[current] ||= []; continue; }
      const match = line.match(/^\s*([^:]{1,30}):\s*(.*)$/);
      const key = match && fields[match[1].trim().toLowerCase()];
      if (key) { current = key; (parts[current] ||= []).push(match![2]); }
      else (parts[current] ||= []).push(line);
    }
    const get = (k: string) => (parts[k] || []).join("\n").trim();
    if (!get("content")) throw new Error(`Story ${i + 1}: thiếu Nội dung thẻ.`);
    return { ...(get("locale") ? {locale: get("locale")} : {}), author: get("author"), timeAgo: get("timeAgo"), pageName: get("pageName"), title: get("title"),
      content: get("content"), highlights: get("highlights").split("|").map(x => x.trim().replace(/^["\']|["\']$/g, "")).filter(Boolean),
      cta: get("cta"), caption: get("caption"), comment1: get("comment1") };
  });
}

export function serializeStories(stories: ImportedStory[]): string {
  return stories.map((s, i) => `=== STORY ${i + 1} ===\n${s.locale ? `Locale: ${s.locale}\n` : ""}Author: ${s.author}\nTime: ${s.timeAgo}\nPage: ${s.pageName}\nTitle: ${s.title}\nContent:\n${s.content}\nHighlights: ${s.highlights.join(" | ")}\nCTA: ${s.cta}\nCaption:\n${s.caption}\nComment 1:\n${s.comment1}`).join("\n\n");
}

export async function readStoryFile(file: { arrayBuffer(): Promise<ArrayBuffer> }): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let encoding = 'utf-8';
  if(bytes[0] === 0xff && bytes[1] === 0xfe) encoding = 'utf-16le';
  else if(bytes[0] === 0xfe && bytes[1] === 0xff) encoding = 'utf-16be';
  try { return new TextDecoder(encoding,{fatal:true}).decode(bytes); }
  catch { throw new Error('Không đọc được mã hóa file. Hãy lưu TXT dạng UTF-8 hoặc UTF-16.'); }
}
