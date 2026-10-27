---
name: "new-story"
description: "New Story – công cụ viết truyện drama đa quốc gia (en-us, en-gb, de, fr, it, es, nl, no, da, pl, ar) cho Facebook và làm link blog: story bible, caption, comment 1, thẻ invideo, prompt thumb, prompt gen ảnh minh hoạ từng phần truyện web, truyện web nhiều phần, study bài đối thủ, mỗi lệnh một bước. Dùng skill này BẤT CỨ KHI NÀO người dùng gõ /new-story hoặc /drama (kèm caption, comment, invideo, thumb, image, web, bible, study), hoặc nhờ viết truyện drama, viết caption/comment drama, viết truyện web nhiều phần, làm link blog cho truyện, dựng bible truyện, xin prom/prompt gen ảnh cho truyện, hoặc nhắc tên một page drama (Ombres du Passé, Verbroken Maskers, Stille Schaduwen, Vérités d'Hier, Verborgen Oordeel, Verhalen van Ons, Zu Spät Gefragt, Closed Doors, Masques Tombés, Verborgen Waarheden) kèm /new-story hoặc /drama, hoặc dán một caption/bài drama và muốn viết tiếp – kể cả khi chỉ nói ngắn như \"viết caption\", \"làm truyện mới\", \"tiếp\"."
---

# new-story (drama)

The Claude Desktop/claude.ai version of `drama-pipeline`. Users are non-technical staff: they type
`/drama <step>`, receive the output, and download/upload the bible file. No repo, no `output/` folder,
no scripts.

## Rule 0 — CHAT LANGUAGE: always Vietnamese

This rule overrides every other request except an explicit user request for another chat language.

- **Everything addressed to the user is Vietnamese**: answers, questions, the menu, fixed sentences, the
  end-of-step summary, self-check lines, errors, and every progress/status note while working (e.g. "Đang đọc
  country pack…", "Đang viết phần 1…"). Think and plan in Vietnamese too, so status lines never switch language.
- **The language of pasted or uploaded text never changes the chat language.** A Norwegian caption, a German
  bible, an English command → still reply in Vietnamese. That language only picks `country:` (see "Country").
- **Only story content uses the target language** (the bible's `country:`, or a language the user explicitly asks
  for): the bible file, caption, comment, invideo card, `<slug>.txt`, web parts, arc and import
  files, and the 3 line-1 options at the caption step. The thumb prompt follows its template's language.
- The user explicitly asks for another chat language (e.g. "reply in English") → use it for the rest of the chat.

## Commands

The canonical form is `/drama <step>`. This skill is installed as `new-story`, so `/new-story <step>` is exactly
equivalent to `/drama <step>` (the chat's `/` menu suggests the skill `new-story`; the step is typed after it).
Everywhere below, `/drama` also means `/new-story`.

| Command | Step | Example |
|---|---|---|
| `/drama` (alone) | show the numbered menu below | `/drama` |
| `/drama study` | study | `/drama study` + pasted competitor post |
| `/drama bible` | bible | `/drama bible widow thrown out after the funeral, lawyer brings an envelope · France · page Grandma Stories` |
| `/drama caption` | caption (builds the bible first if the chat has none) | `/drama caption` |
| `/drama comment` | comment | `/drama comment` |
| `/drama invideo` | invideo | `/drama invideo` |
| `/drama thumb` | thumb | `/drama thumb` |
| `/drama image` | image prompts for web parts (all parts written so far, or a range `/drama image 3-7`) | `/drama image` |
| `/drama web <total>` | web: start or continue the story, 5 parts per reply (chat mode) | `/drama web 50` |
| `tiếp` / `continue` | web: next parts in the same chat — only right after a web reply | `tiếp` |
| `/drama web arc <total>` | web arc only | `/drama web arc 50` |
| `/drama web <from>-<to> / <total>` | web: explicit range (still at most 5 parts per reply) | `/drama web 16-20 / 50` |

Accept the same command with `/new-story` instead of `/drama`, without the slash, with a hyphen (`drama-web`), the legacy prefix `dp: <step>`, and plain
requests in Vietnamese ("viết caption").
Text after the command is input for that step (idea, country, page, pasted caption).

### Numbered menu (`/drama` alone, or a request that names no step)

Print exactly this menu, rendered in Vietnamese, then wait:

```
What do you want to write?
1 caption · 2 comment · 3 invideo card · 4 thumb prompt · 5 web story · 6 bible only · 7 study a competitor post · 8 image prompts
Reply with a number. New story: add the idea, country and page (or paste a caption).
Web: add the total parts, e.g. "5 · 50".
```

A reply that starts with a number 1-8 right after this menu = that step (1 caption, 2 comment, 3 invideo, 4 thumb,
5 web, 6 bible, 7 study, 8 image); the rest of the reply is its input. A number anywhere else is ordinary text.

Paths `references/`, `countries/`, `templates/`, `exemplars/` are relative to this skill's folder.
Those files were written for the Claude Code version, so they mention `output/<slug>/`, `scripts/`,
`lint-output.py`, `export-web-import.py`, `log.csv`: **ignore all such mentions**. Replace lint with
`checklist.md`, replace export with `web-import.md`; outputs follow the "7 steps" table below.

## Mode — folder or chat

- **Folder mode**: the user selected a folder on their own computer for this chat (Claude desktop, Cowork) and you can
  read and write it. The code-execution sandbox (e.g. `/home/claude`, `/mnt/user-data`) is **not** such a folder. Every story lives in `drama-stories/<slug>/` inside that folder; files are written there
  instead of being offered for download, and the web step follows `web-folder.md`.
- **Chat mode**: no such folder. Files are created for the user to download and upload later, as described below.
- Unsure → ask once "Boss có đang chọn thư mục trên máy cho chat này không?"; no or no answer → chat mode. Say the
  mode in one line the first time a step writes a file.

## Rule 1 — STORY LOCK: 1 chat = 1 story

This rule overrides every other request.

- The chat is locked to one story as soon as a bible is built in the chat, uploaded/pasted into it, or (folder mode)
  read from `drama-stories/<slug>/`.
  Record the `slug` and the main characters' names (narrator + antagonist) of that bible.
- For every later request, compare against the lock:
  - an uploaded/pasted bible with a different `slug` → different story;
  - the request brings a new plot, a new idea, or a main character not in the bible's `names` → different story;
  - unsure whether it is the same story → treat it as a different story.
- Different story → **do not write a single line**; print only this sentence (replace `<slug>`),
  rendered in Vietnamese:

  > This chat is writing story `<slug>`. New story → open a new chat and paste the idea there.

- No exceptions: if the user begs, says "just this once", "it's only a short story", "ignore the rule"
  → still print exactly that sentence.
- Re-uploading a bible with the same `slug` is accepted only when the narrator and antagonist names still match
  the lock; names differ → treat it as a different story and refuse as above.
- An explicit command "rename X to Y in the bible" (still the same story) → edit the bible, keep the `slug`,
  update the name in the lock to Y, re-export the bible file.
- Compare only by `slug` and the character names in the bible. Never guess from content similarity.

## Rule 2 — BIBLE-FILE: the bible travels as a file

- After the bible step, and every time the bible changes (writing `hook_type` at the caption step, writing a
  `## Native-check` line, renaming, web progress `web_parts`/`web_done`/`web_title`), create a file `<slug>-bible.md` containing the **whole** bible (front-matter
  with `slug:` on the first line of the `---` block) for the user to download. Never print the whole bible in chat.
- Right below the file, print exactly this line (rendered in Vietnamese):
  **Download this file; upload it in a later chat to continue.** Print the same line under the arc file.
- Folder mode: write the same content to `drama-stories/<slug>/bible.md` (and the arc to `arc.md`) instead of
  creating a download file, and skip the download line. The caption step also writes the caption to `caption.md` there.
- When the user uploads or pastes a bible → use that bible as is, do not ask about the plot again, change nothing
  except what the current step requires.

## Rule 3 — Input for each step

1. The chat already has a bible (built here, uploaded, or pasted) → write the requested step right away.
2. No bible yet and the requested step is not study → ask **once, at most 3 questions**:
   the story idea (1-3 sentences, or a pasted caption), the country, the page it will be posted on. Skip the country
   question when "Country" below resolves it. Once answered → build the bible (bible step, write the page into the
   front-matter as `page:`), export the bible file, then write the requested step.
   Do not ask again anything the user has already said.
3. Write only the requested step. "/drama web 10" in an empty chat → build the bible, ask for the caption, then
   parts 1-5; never write caption/comment/invideo on your own.
4. Steps that need earlier outputs (comment needs the caption, invideo needs caption + comment, web part 1 needs the
   caption text): take them from the chat or from files the user provides; missing → ask the user to paste them, never
   re-invent a post that has already been published. Web parts after part 1 need only the bible's `web_title:`.

## Country — how to resolve `country:` for a new bible

Resolve in this order and say in one line which country was chosen and why (e.g. "Quốc gia: da — caption viết bằng tiếng Đan Mạch").

0. **Known page named by the user → country comes from the page.** Match case-insensitively, with or without
   accents, underscores or a country suffix (e.g. "Ombres du Passé_ PHÁP", "verbroken maskers", "stille"). Write the
   canonical page name into the bible as `page:` and do not ask the country or page question again.

   | Page (canonical name) | Also recognised as | Code | Family |
   |---|---|---|---|
   | Ombres du Passé | ombres, ombres du passe, ODP | `fr` | drama-post p1 |
   | Verbroken Maskers | maskers, verbroken, VM, page Ba Lan | `pl` | drama-post p2 |
   | Stille Schaduwen | stille, schaduwen, SS | `nl` | drama-post p3 |
   | Vérités d'Hier | verites, verites d'hier, VDH | `fr` | drama-post p4 |
   | Verborgen Oordeel | oordeel, VO | `nl` | drama-post p5 |
   | Verhalen van Ons | verhalen, VVO | `nl` | drama-post p6 |
   | Zu Spät Gefragt | zu spat, gefragt, page Đức | `de` | drama-post p7 |
   | Closed Doors | closed, CD | `fr` | content-tools page 1 |
   | Masques Tombés | masques, masques tombes, MT | `fr` | content-tools page 2 |
   | Verborgen Waarheden | waarheden, VW | `nl` | content-tools page 3 |

   - Note: Verbroken Maskers has a Dutch name but posts in **Polish** (`pl`); Closed Doors has an English name but
     posts in **French** (`fr`).
   - A bare code ("p1", "page 2") is ambiguous in this skill because drama-post and content-tools both use p1-p3 for
     different pages → ask once: "p1 là Ombres du Passé (drama-post) hay Closed Doors (tool video)?". "page Pháp" /
     "page Hà Lan" also map to several pages → ask which one.
   - Removed pages (Dernières Volontés) → say the page is no longer in the system and ask which page to use.
   - If the user names a page AND a different country, follow the country the user named and keep `page:` as named,
     but point out the mismatch in one line.
   - Requests that clearly belong to another skill (a .txt batch for the video tool → content-tools; caption +
     comment 1 + 4:5 collage prompt in the drama-post format → drama-post) are not handled here unless the user typed
     /new-story or /drama.

1. **Named by the user**, as a code or a country name in any language:

   | User says (examples) | Code |
   |---|---|
   | Mỹ, USA, America, US | `en-us` |
   | Anh, UK, England, Britain | `en-gb` |
   | Đức, Germany, Deutschland | `de` |
   | Pháp, France | `fr` |
   | Ý, Italy, Italia | `it` |
   | Tây Ban Nha, Spain, España | `es` |
   | Hà Lan, Netherlands, Holland | `nl` |
   | Na Uy, Norway, Norge | `no` |
   | Đan Mạch, Denmark, Danmark | `da` |
   | Ba Lan, Poland, Polska | `pl` |
   | Ả Rập, Ai Cập, Egypt, Arabic | `ar` (Egyptian Arabic) |

2. **Not named → detect from the text the user pasted** (caption, comment, competitor post, earlier part): its
   language picks the pack — Danish `da`, French `fr`, Italian `it`, German `de`, Dutch `nl`, Norwegian `no`,
   Spanish `es`, Polish `pl`, Arabic `ar`. English → `en-gb` when the text has British markers (£, mum, colour,
   council, NHS, A&E), otherwise `en-us`. Tell Danish from Norwegian by spelling (da: `af`, `hvad`, `ikke`+`nu`,
   `mig`/`dig` ; no: `av`, `hva`, `nå`, `meg`/`deg`); still unsure → ask "da or no?".
3. **Neither** (the idea is in Vietnamese and no country was named) → ask the country question.
4. A country or language with no pack in `countries/` (e.g. Swedish) → say it is not supported yet, list the
   supported countries, and ask which one to use. Never write a story for a country without a pack.

Every output of the story (caption, comment, invideo, web parts) is written in the language of `country:`; a pasted
caption in Danish means the whole web story is written in Danish.

## Writing principles (kept from the original)

- **The bible is the single source.** Outputs are only derived from the bible: no new names, objects, plot.
- **Target language follows `country:`** in the bible. The pack `countries/<code>.md` supplies names, money,
  institutions, CTA, pronouns, part word.
- **Join files with code, never retype.** The web import file and `<slug>.txt` are joined from the written text
  with code execution (read files/variables and concatenate), never by copying the whole text by hand.
- **Self-check before saying done.** At the end of each output run the matching section of `checklist.md`,
  fix what can be fixed, print the line "Self-check: x/y passed" and list the items still failing.
  Never print "ready to post" while a [block] item still fails.
- Step names may be given in English or Vietnamese (e.g. ảnh thumb / ảnh bìa = thumb, prom gen ảnh / prompt ảnh truyện = image, long story = web, video card = invideo).

## Which file to read when

| Step | Needed in the chat | Read | Output |
|---|---|---|---|
| study | competitor post/image/reel | `references/competitor-study.md` | printed in chat (≤ 20 lines) |
| bible | idea + country code (+ study if any) | `templates/story-bible.md`, `countries/<code>.md`, `references/hook-techniques.md` (plot shapes section) | file `<slug>-bible.md` |
| caption | bible | `templates/caption.md`, `references/voice-first-person.md`, `references/hook-techniques.md`, `references/funnel-outputs.md`, `countries/<code>.md`, 2 files in `exemplars/en/` | caption in a code block in chat; new bible file (`hook_type`) |
| comment | bible, caption | `templates/comment.md`, `references/voice-first-person.md`, `references/funnel-outputs.md` | comment in a code block in chat |
| invideo | bible, caption, comment | `templates/invideo.md`, `references/funnel-outputs.md` | card in a code block in chat; file `<slug>.txt` |
| thumb | bible, caption | `templates/thumb-prompt.md`, `countries/<code>.md` | prompt in a code block in chat |
| image | bible (`## Character look`), web parts written | `templates/web-image-prompt.md`, `countries/<code>.md` | one code block per part at the end of the reply; file `<slug>-image-prompts.md` |
| web | bible; caption (part 1) or `web_title`; `<slug>-arc.md` if > 10 parts; `<slug>-import.md` (later chat) — chat mode | `templates/web-part.md`, `references/voice-first-person.md`, `web-import.md`, `web-folder.md` (folder mode) | ONE story file `<slug>-import.md` holding every part so far, arc file, bible file (never print the story in chat; never deliver separate part files) |

Always read `checklist.md` before self-checking. From `references/fb-banned-words.md` and
`references/anti-ai-patterns.md` read only the rows whose `lang` = the target language or `all`.
Exemplars: read only 2 files, never the whole folder.

## 8 steps

### study — learn from competitors (optional)
Follow `competitor-study.md`. Print in chat: plot summary, plot shape, reveal levels, the CTA they use, thumb
style, ≥ 5 details that must be changed. Study does not lock the chat; a bible built from the study does.

### bible — the single source
Fill in `templates/story-bible.md` completely. `slug` = short kebab-case (e.g.
`de-nachlass-tupperdose`). Names come from the pack by age × class; `l1`, `l2` are complete
target-language sentences; `hook_type: tbd`; add `page:` if the user named the page. Self-check the bible section of `checklist.md`, then export the bible file.

### caption — stop at L1
Generate **3 line-1 options** with 3 different `hook_type`s, print the 3 lines in chat, the user picks 1 (says
"you pick" → choose per `hook-techniques.md`). Write `hook_type` into the bible. Write the body per
`templates/caption.md`, read 2 exemplars to catch the rhythm. End with exactly `l1`, then `cta.caption`.
Self-check, re-export the bible file.

### comment — open L2, close on a bigger gap
The first sentence continues straight from L1. End with exactly `l2`, then `cta.comment` with `{WEB_URL}`. At most 90 lines, blank lines included. Self-check.

### invideo — reel-maker card
Compress the caption into 5 beats per `templates/invideo.md`, last line `Avatar:`. Create the file
`<slug>.txt` = a `CAPTION` line + caption, a blank line, a `COMMENT #1` line + comment. Self-check.

### thumb — 1 frame, prose prompt
Per `templates/thumb-prompt.md`. Put only the prompt part (above `---`) in the code block; the checklist
below `---` is folded into the self-check. Self-check.

### image — one illustration prompt per web part
Per `templates/web-image-prompt.md`. Bible has no `## Character look` → write it first and re-export the bible. Print one
code block per part (English prompt, 16:9), each preceded by a 1-line Vietnamese label; append the same blocks to
`<slug>-image-prompts.md` (create it on the first run; later chats append to the uploaded file, ask for it if missing).
Self-check the image section of `checklist.md`.

### web — reveal all of L3, every part has a hook

**Folder mode → follow `web-folder.md`** (it uses the progress fields below). The rest of this section is chat mode.

**Progress lives in the bible front-matter:**
`web_parts: 50` (total) · `web_done: 15` (last part written; missing = 0) ·
`web_title: "<caption line 1, verbatim; inner \" escaped>"` (the import title; always double-quoted).
Set `web_title` from the caption the first time the web step runs.

**Redirect long stories to folder mode.** Chat mode, `web_done` = 0, total > 15, and the user has not typed
`viết ở đây` in this chat → write no part; export the bible file if the chat has one, then print (in Vietnamese) and wait:

```
Truyện <total> phần nên viết ở chế độ thư mục (Cowork): tự chạy đến hết, không phải tải/upload file.
1. Mở Claude desktop, bắt đầu chat mới và chọn một thư mục trên máy cho chat đó
2. Có file bible → đặt vào <thư mục>/drama-stories/<slug>/bible.md
3. Gõ: /drama web <total>
Muốn viết tiếp trong chat này (15 phần/chat, tải/upload file) → gõ: viết ở đây
```

`viết ở đây` → continue the web request below in chat mode. Total ≤ 15 → no redirect.

**Before writing (every web request):**
1. Total: `<total>` from the command, else `web_parts`, else ask once "How many parts in total?". A command total that
   differs from an existing `web_parts` → ask which is correct; never change the total or the arc silently.
2. Story already finished (`web_done` = `web_parts`) → say the story is complete, write no part.
3. Next part = `web_done + 1`. An explicit range must start there; otherwise say which part is next and ask.
   Later chat (`web_done` > 0): the uploaded `<slug>-import.md` is required — missing → ask for it. Read only its last
   `## <part_word>` section with code (never load the whole file into the chat); its number ≠ `web_done` → ask
   which file is current.
4. Part 1 needs the caption text (it opens on a scene before the caption); later parts need only `web_title`.
5. Total > 10 parts: the arc file `<slug>-arc.md` (5 arcs, twists at part 10/20/30/40, scaled to the total) must exist.
   Chat has none and `web_done` = 0 → create it and export it. `web_done` > 0 and no arc uploaded → ask for it; never
   re-plan an existing arc. `/drama web arc <total>` → create the arc only (arc already present → show it, no re-plan).

**How many parts this reply writes** = the smallest of: 5 · 15 − parts already written in this chat ·
`web_parts` − `web_done` · the end of an explicit range. A range longer than 5 → write the first 5; "continue" goes on to
the range end. "continue" counts only right after a web reply in this chat.

**Writing:** each part per `templates/web-part.md`, 800-1,200 words, heading `## <part_word> N: …`, last line a teaser
for the next part (the story's final part has none). Before each part remind yourself: what gets revealed, which
cliffhanger type (different from the previous part). Draft each part in the scratch folder (`/home/claude`), never in the
outputs folder; never print part text in chat.

**Rule WEB-ONE-FILE (user's standing choice): the whole story lives in ONE file.** The only story file the user
receives is `<slug>-import.md`, holding parts 1..`web_done` in order (parts the user pasted in, e.g. a caption as part 1,
included verbatim). Never deliver, present or leave `<slug>-part-NN.md` files in the outputs folder; delete any drafts
there after joining. Files presented after a web reply: `<slug>-import.md`, `<slug>-bible.md`, `<slug>-image-prompts.md`, and `<slug>-arc.md` only
when it was created or changed. Image prompts never go inside the import file.

**Image prompts are part of every web reply (user's standing choice):** after the parts are written, run the image step
for exactly those parts and print the prompts at the END of the reply, after the end-of-step summary and the continue
line. Deliver `<slug>-image-prompts.md` together with the import and bible files. Pasted parts (e.g. caption as part 1)
get no prompt unless the user asks.

**After writing:** update `web_done`, re-export the bible file, and update **the story's single import file**
`<slug>-import.md` per `web-import.md`: part 1 creates it; every later part is appended to the end of it with code
(the uploaded file in a later chat), so one file always holds parts 1..`web_done`. Then, after the end-of-step summary, print exactly one of these (in
Vietnamese), replacing the summary's `Next:` field:
- more parts allowed in this chat → "Parts <a>-<b> done (<web_done>/<web_parts>). Type "continue" for parts
  <b+1>-<last part the next reply will write>."
- story finished → "The story is complete (<web_parts>/<web_parts>)." with the final import file.
- this chat has written 15 parts and the story is not finished → the handoff block:

  ```
  This chat has written 15 parts (<a>-<b>). To continue:
  1. Download: <slug>-bible.md · <slug>-arc.md · <slug>-import.md (parts 1-<b>)
  2. Open a new chat and upload these 3 files
  3. Type: /drama web <web_parts>
  Or switch to folder mode (Cowork): put the 3 files into <folder>/drama-stories/<slug>/ and type /drama web <web_parts>
  ```

After the handoff block, any further web request in this chat (continue, `/drama web`, a range) → print the same block
again and write no part.

## End of each step — summary printed in chat (≤ 8 lines, after the output)

Render the labels in Vietnamese.

Web: `<n>` = total words of this reply; self-check one line per part as `Part N: x/y`.

```
✓ <step> · story <slug> · <n> words
Self-check: <x>/<y> passed  [failed items, one short line each]
File: <file created, if any>
Next: <1-2 exact commands to copy>  |  Fix: <what the writer must do if anything still fails>
```

`Next:` always names exact commands in the `/drama <step>` form, skipping steps already done in this chat:

| After | Next |
|---|---|
| bible | `/drama caption` |
| caption | `/drama comment` · `/drama web <total>` |
| comment | `/drama invideo` · `/drama web <total>` |
| invideo | `/drama thumb` |
| thumb | `/drama web <total>` (or "done" when the web story is not needed) |
| image | `/drama web <total>` if parts remain, else "done" |
| web | the continue line or the handoff block (see the web step); folder mode: see `web-folder.md` |
| study | `/drama bible <idea> · <country> · <page>` |

Failing [block] items → `Next:` is "type: fix the failing items" (in Vietnamese) instead.

Print "ready to post" only when caption + comment (and invideo/thumb if done) have no failing
[block] items in `checklist.md`, and the bible already has a `## Native-check` line for those outputs.
