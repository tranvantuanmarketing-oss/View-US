import re

with open('studio_engine_v8.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update Engine log
code = code.replace(
    'Initializing Việt Reels Studio Pro Engine v8.0',
    'Initializing Việt Reels Studio Pro Engine v9.0 (3-Tier Reels Funnel Edition)'
)

# 2. Add element queries for posting card
old_query_marker = 'const previewTplInfo = document.getElementById("previewTplInfo");'
new_queries = '''const previewTplInfo = document.getElementById("previewTplInfo");
  const previewStoryNumBadge = document.getElementById("previewStoryNumBadge");
  const previewCurrentCaption = document.getElementById("previewCurrentCaption");
  const btnCopyCurrentCaption = document.getElementById("btnCopyCurrentCaption");
  const previewCurrentComment1 = document.getElementById("previewCurrentComment1");
  const btnCopyCurrentComment1 = document.getElementById("btnCopyCurrentComment1");'''
code = code.replace(old_query_marker, new_queries)

# 3. Update sample copy buttons in Quy Chuẩn
new_sample_txt = '''const sample = `=== STORY 1 ===
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
Link: https://yourblog.com/us-story-2`;'''

code = re.sub(
    r'const sample = `=== STORY 1 ===[\s\S]*?Link: https://example.com/fr/histoire-2`;',
    new_sample_txt,
    code
)

# 4. Update JSON sample in Quy chuẩn
new_sample_json = '''const sample = JSON.stringify([
        {
          "author": "Emily Vance",
          "pageName": "Daily Confessions",
          "timeAgo": "3h ago",
          "title": "The girl twenty families turned down",
          "content": "I adopted the little girl that twenty families had rejected alone.\\nHer medical diagnosis scared everyone away. \\"You have time to think about this, sir.\\"\\nI signed the adoption papers in less than four minutes.\\nTen years went by. She walked, she read, she laughed out loud.\\nThen Greg, who abandoned her at birth, showed up at our front door claiming her inheritance...",
          "highlights": ["\\"You have time to think about this, sir.\\"", "claiming her inheritance..."],
          "cta": "Read Continuation In Caption",
          "caption": "He left her in a hospital room with medical bills ten years ago. Now that my father left his estate to my daughter, he stood on my porch with two lawyers claiming he was still her legal guardian... The confrontation continued in the first comment 👇 #familydrama #storytime #truestory",
          "comment1": "PART 2: Greg smirked and handed me a certified birth certificate: \\"Biological rights override private arrangements, brother.\\" But he made one fatal mistake...",
          "link": "https://yourblog.com/us-story-1"
        }
      ], null, 2);'''

code = re.sub(
    r'const sample = `\[\s*\{\s*\"author\":\s*\"Franck Meynard\"[\s\S]*?\]`;',
    new_sample_json,
    code
)

# 5. Wire copy buttons in posting card and replace entire updateStoryNav
old_story_nav = """  function updateStoryNav() {
    const total = parsedStories.length || 1;
    if (currentStoryIndexBadge) currentStoryIndexBadge.textContent = `${currentStoryIdx + 1} / ${total}`;
    updateLivePreview();
  }"""

new_story_nav = """  function updateStoryNav() {
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
  }"""

code = code.replace(old_story_nav, new_story_nav)

# 6. Update parseStories logic
old_parse_stories = re.search(
    r'function parseStories\(text\) \{[\s\S]*?return rawBlocks\.map\(\(block, idx\) => \{[\s\S]*?return \{\s*index:\s*idx,[\s\S]*?pinLink\s*\};\s*\}\);\s*\}',
    code
)
if old_parse_stories:
    new_parse_stories = '''function parseStories(text) {
    text = (text || "").trim();
    if (!text) return [];

    const defaultPage = studioPageName ? studioPageName.value.trim() : "Daily Confessions";
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
            highlights: Array.isArray(item.highlights) ? item.highlights : (item.highlights ? item.highlights.split('|').map(s=>s.trim()) : []),
            cta: item.cta || 'Read Continuation In Caption',
            caption: item.caption || item.description || (`${item.title || 'Story #' + (idx + 1)}. What happened next stunned everyone... Read the full Part 2 in the first comment! 👇 #storytime #truestory #familydrama`),
            comment1: item.comment1 || item.comment || item.part2 || (`PART 2: When the truth was finally revealed, nobody in the room could believe what had just transpired...`),
            pinLink: item.pinLink || item.link || (`https://example.com/story-${idx + 1}`)
          }));
        }
      } catch (e) {}
    }

    let rawBlocks = [];
    if (/===\\s*(?:STORY|CÂU CHUYỆN|PHẦN)\\s*\\d*\\s*===/i.test(text)) {
      rawBlocks = text.split(/(?:^|\\n)===\\s*(?:STORY|CÂU CHUYỆN|PHẦN)\\s*\\d*\\s*===[^\\n]*/i).map(p => p.trim()).filter(Boolean);
    } else if (/\\n---+\\n/.test(text)) {
      rawBlocks = text.split(/\\n---+\\n/).map(p => p.trim()).filter(Boolean);
    } else if (/\\n===+\\n/.test(text)) {
      rawBlocks = text.split(/\\n===+\\n/).map(p => p.trim()).filter(Boolean);
    } else {
      rawBlocks = [text];
    }

    return rawBlocks.map((block, idx) => {
      const authorMatch = block.match(/(?:Tác giả|Tac gia|Author|Auteur):\\s*([^\\n]+)/i);
      const handleMatch = block.match(/(?:Handle|Kênh|Kenh|Username):\\s*([^\\n]+)/i);
      const timeMatch = block.match(/(?:Thời gian|Thoi gian|Time|Temps):\\s*([^\\n]+)/i);
      const pageMatch = block.match(/(?:Tên Page|Ten Page|Page|Fanpage):\\s*([^\\n]+)/i);
      const titleMatch = block.match(/(?:Title|Tiêu đề|Tieu de|Titre):\\s*([^\\n]+)/i);
      const ctaMatch = block.match(/(?:Nút CTA|Nut CTA|CTA|Bouton CTA|Kêu gọi):\\s*([^\\n]+)/i);
      const linkMatch = block.match(/(?:Link|Pin_Link|Liên kết|Lien ket|Url):\\s*([^\\n]+)/i);
      const hlMatch = block.match(/(?:Highlights?|Nổi bật|Noi bat|Bôi đỏ):\\s*([^\\n]+)/i);

      const captionMatch = block.match(/(?:Caption|Mô tả|Mo ta|Description):\\s*([\\s\\S]+?)(?=(?:\\n(?:Comment\\s*1?|Bình luận\\s*1?|Binh luan\\s*1?|Part\\s*2|Phần\\s*2|Link|Pin_Link|===|---)|$))/i);

      const comment1Match = block.match(/(?:Comment\\s*1?|Comment|Bình luận\\s*1?|Binh luan\\s*1?|Bình luận|Binh luan|Part\\s*2|Phần\\s*2):\\s*([\\s\\S]+?)(?=(?:\\n(?:Link|Pin_Link|Liên kết|Lien ket|Url|===|---)|$))/i);

      let content = '';
      const contentTagMatch = block.match(/(?:Nội dung thẻ|Nội dung|Noi dung|Content|Video Text|Texte|Histoire):\\s*([\\s\\S]+?)(?=(?:\\n(?:Highlights?|Nổi bật|Nút CTA|CTA|Caption|Mô tả|Mo ta|Comment|Bình luận|Part\\s*2|Phần\\s*2|Link|Pin_Link)|$))/i);
      if (contentTagMatch) {
        content = contentTagMatch[1].trim();
      } else {
        const cleanLines = block.split('\\n').filter(line => {
          const l = line.trim();
          if (!l) return true;
          if (/^(?:Tác giả|Tac gia|Author|Auteur|Handle|Kênh|Thời gian|Time|Tên Page|Page|Title|Tiêu đề|Nút CTA|CTA|Caption|Comment|Bình luận|Part\\s*2|Phần\\s*2|Highlights|Nổi bật|Link|Pin_Link):/i.test(l)) return false;
          if (/^===.*===$/.test(l)) return false;
          if (/^---+$/.test(l)) return false;
          return true;
        });
        content = cleanLines.join('\\n').trim();
      }

      const author = authorMatch ? authorMatch[1].trim() : defaultAuthor;
      const page = pageMatch ? pageMatch[1].trim() : (studioPageName ? studioPageName.value.trim() : defaultPage);
      const handle = handleMatch ? handleMatch[1].trim() : ('@' + author.toLowerCase().replace(/[^a-z0-9]/g, '_'));
      const timeAgo = timeMatch ? timeMatch[1].trim() : '3h ago';
      const title = titleMatch ? titleMatch[1].trim() : (`Story #${idx + 1}`);
      const cta = ctaMatch ? ctaMatch[1].trim() : 'Read Continuation In Caption';
      const pinLink = linkMatch ? linkMatch[1].trim() : (`https://example.com/story-${idx + 1}`);
      const highlights = hlMatch ? hlMatch[1].split('|').map(s => s.trim()).filter(Boolean) : [];

      const rawCap = captionMatch ? captionMatch[1].trim() : '';
      const rawCmt = comment1Match ? comment1Match[1].trim() : '';

      const caption = rawCap || `${title}. What happened next stunned everyone... Read the full Part 2 in the first comment! 👇 #storytime #truestory #familydrama`;

      const comment1 = rawCmt || `PART 2: When the truth was finally revealed, nobody in the room could believe what had just transpired...`;

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
    code = code.replace(old_parse_stories.group(0), new_parse_stories)

# 7. Update formatHelper for txt companion file
format_txt_fn = '''function buildCompanionTxtContent(story, safeFileName, pageRaw, tpl) {
    const hlStr = (story.highlights && story.highlights.length) ? story.highlights.join(' | ') : 'Tự động bôi đỏ câu mở đầu và cao trào cuối';
    return `================================================================================
🎬 THÔNG TIN XUẤT BẢN FACEBOOK REELS (DÒNG CHẢY NỘI DUNG 3 NẤC)
================================================================================
TÊN FANPAGE / KÊNH: ${pageRaw}
FILE VIDEO: ${safeFileName}.mp4
TÁC GIẢ / AUTHOR: ${story.author} (${story.handle})
THỜI GIAN HIỂN THỊ: ${story.timeAgo}
MẪU THIẾT KẾ: ${tpl.label} (Màu: ${tpl.palName})

--------------------------------------------------------------------------------
📌 BƯỚC 1: NỘI DUNG HIỂN THỊ TRÊN VIDEO (9:16)
--------------------------------------------------------------------------------
${story.content}

🔥 Highlights (Bôi đỏ trong video):
${hlStr}

👉 Nút CTA trên video:
${story.cta}

--------------------------------------------------------------------------------
📝 BƯỚC 2: CAPTION ĐĂNG BÀI (DẪN CHUYỆN TIẾP THEO)
👉 HƯỚNG DẪN: Copy dán vào ô mô tả/caption khi đăng video Reels
--------------------------------------------------------------------------------
${story.caption}

--------------------------------------------------------------------------------
💬 BƯỚC 3: COMMENT 1 GHIM ĐẦU (PHẦN 2 CÂU CHUYỆN - CHƯA GẮN LINK)
👉 HƯỚNG DẪN: Dùng chính Via đăng video này bình luận ngay sau khi post,
   sau đó bấm "Ghim bình luận" (Pin Comment) lên trên cùng.
--------------------------------------------------------------------------------
${story.comment1}

--------------------------------------------------------------------------------
🚀 BƯỚC 4: KHI VIDEO VIRAL / ĐẠT ĐỀ XUẤT (GẮN LINK BLOG THU HOẠCH TRAFFIC)
👉 HƯỚNG DẪN: Khi video đạt >10k views, bấm Sửa Comment 1 hoặc Reply thêm link:
--------------------------------------------------------------------------------
🔗 Link Blog bài viết đầy đủ: ${story.pinLink}
📝 Câu chốt bổ sung: "👉 Read the complete ending here: ${story.pinLink}"
================================================================================`;
  }
'''

# Replace txtContent in genVideoFromChinhEditor, btnRenderSingle, and btnRenderBatch30
code = re.sub(
    r'const txtContent = `========================================================\\n🎬 THÔNG TIN XUẤT BẢN REELS[\s\S]*?========================================================`;',
    'const txtContent = buildCompanionTxtContent(story, fileName, pageRaw, tpl);',
    code,
    count=1
)

code = re.sub(
    r'const txtContent = `========================================================\\n🎬 THÔNG TIN XUẤT BẢN REELS[\s\S]*?========================================================`;',
    'const txtContent = buildCompanionTxtContent(story, safeBaseName, pageRaw, tpl);',
    code,
    count=1
)

code = re.sub(
    r'const txtContent = `========================================================\\n🎬 THÔNG TIN XUẤT BẢN REELS[\s\S]*?========================================================`;',
    'const txtContent = buildCompanionTxtContent(story, safeFileName, pageRaw, activeTpl);',
    code,
    count=1
)

# Prepend format_txt_fn before genVideoFromChinhEditor
code = code.replace(
    '// 8. GEN SINGLE VIDEO DIRECTLY FROM CHINH EDITOR',
    format_txt_fn + '\n  // 8. GEN SINGLE VIDEO DIRECTLY FROM CHINH EDITOR'
)

with open('studio_engine_v9.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('studio_engine_v9.js generated cleanly!')
