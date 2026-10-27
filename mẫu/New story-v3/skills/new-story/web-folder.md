# Web step in folder mode — sequential sub-agents, no upload/download

Used instead of the chat-mode web rules in `SKILL.md` when the chat is in **folder mode** (see "Mode" in `SKILL.md`).
The progress fields (`web_parts`, `web_done`, `web_title`) and the writing rules for a part are the same; what changes
is where files live, who writes them, and how far one command goes. There is no 15-part limit and no handoff block.

## Story folder

```
drama-stories/<slug>/
  bible.md             ← the bible; web progress lives in its front-matter
  caption.md           ← caption text (part 1 opens on a scene before it)
  arc.md               ← the per-part plan
  parts/part-NN.md     ← one file per part (NN = 01, 02…)
  <slug>-import.md     ← the single import file, parts 1..web_done
```

**Which story:** the chat's locked bible → its folder. No bible in the chat → candidates are the
`drama-stories/*/bible.md` files whose `web_parts` is missing or whose `web_done` < `web_parts`: exactly one → use it and
say which `slug`; several → ask which `slug`; none → Rule 3 in `SKILL.md` (build the bible first). The story read here
locks the chat (Rule 1).

**From chat mode:** the user may drop the downloaded `<slug>-bible.md`, `<slug>-arc.md` and `<slug>-import.md` into
`drama-stories/<slug>/`; rename the first two to `bible.md` and `arc.md` before continuing.

## Before writing

1. Total: `<total>` from the command, else `web_parts`, else ask once. A command total that differs from an existing
   `web_parts` → ask which is correct; never change the total silently. `web_done` = `web_parts` → say the story is
   complete, write nothing.
2. `web_done` = 0: `caption.md` missing → write it from the caption in the chat, not in the chat → ask the user to paste
   it; then set `web_title` in `bible.md` from caption line 1.
3. `arc.md` missing and `web_done` = 0 → create it (below). `web_done` > 0 and no `arc.md` → ask for it.
   `/drama web arc <total>` → create the arc only; arc already present → show its path, change nothing.
4. An explicit range `<from>-<to>` must start at `web_done + 1`; otherwise say which part is next and ask.

## arc.md — the plan every sub-agent follows

Every folder-mode story has an arc, whatever its total. Header: the 5 arcs (discovery → escalation → rock bottom →
counterattack → climax, twists at part 10/20/30/40 scaled to the total). Then **one row per part**:

```
N | reveals: <the ≥ 2 things revealed> | open: <hook type 1-7> | cliff: <cliffhanger type 1-8> | ends on: <the concrete image or line>
```

Types from `templates/web-part.md`; `open` and `cliff` never repeat the previous part's type. The last part has no `cliff`.
Names, objects and places only from the bible. Never re-plan on your own; the user may explicitly ask to change rows:
rows above `web_done` → edit them; rows at or below `web_done` → also lower `web_done` to the first changed row − 1 so
those parts are rewritten.

## How far one command goes

- `web_done` = 0 → write the arc and parts 1-5 (fewer if `web_parts` < 5), then **stop for review**. Story not finished →
  print (in Vietnamese): "Đã xong dàn truyện + phần 1-<web_done> trong `drama-stories/<slug>/`. Đọc duyệt; cần sửa dàn
  thì nói. Gõ `tiếp` để viết đến phần <web_parts>." This first stop applies even when a longer range was asked.
- `web_done` ≥ 1 (`tiếp`, `/drama web`, `/drama web <total>`) → run batches back to back until `web_done` = `web_parts`,
  or until `<to>` for an explicit range.
- Between batches print one line only: `Phần <a>-<b> xong (<web_done>/<web_parts>)`.

## One batch = one sub-agent (≤ 5 parts)

Batches run **one after another, never in parallel**: part N+1 continues from the end of part N.

1. With code, delete every `parts/part-NN.md` numbered above `web_done` (leftovers of an interrupted batch).
2. Hand the batch to a fresh sub-agent with the prompt below. `<skill>` = the absolute path of the folder holding this
   file and `SKILL.md`; `<story>` = the absolute path of `drama-stories/<slug>`; `<lang>` = the `lang` column value of
   `anti-ai-patterns.md` for the target language (`en-us`, `en-gb` → `en`; other codes as is).
3. No sub-agent available, or it replies that it cannot read a listed file → write the batch yourself under the same
   contract, reading only the listed files.

```
Write parts <a>-<b> of a first-person drama web story in <target language>.
Read only:
- <story>/bible.md (the single source: names, objects, plot — invent nothing new)
- the rows numbered <a>-<b> in <story>/arc.md, plus row <a-1>
- the last ~40 lines of <story>/parts/part-<a-1>.md (part 1: <story>/caption.md instead;
  no previous part file: the last `## <part_word>` section of <story>/<slug>-import.md)
- <skill>/templates/web-part.md, <skill>/references/voice-first-person.md, <skill>/countries/<code>.md
- <skill>/checklist.md: the "web — each part" section and the shared items it names;
  rows of <skill>/references/anti-ai-patterns.md whose lang is <lang> or all
Those skill files also mention output/, scripts/, lint, _arc.md and export: ignore all such mentions.
Write each part to <story>/parts/part-NN.md: 800-1,200 words, line 1 `## <part_word> N: <title>`, last line the
teaser for the next part (part <web_parts> has none). Follow the arc row for reveals, opening and cliffhanger types.
Self-check each part against the checklist and fix what you can.
Write no other file. Do not return story text.
If a listed file cannot be read, write nothing and reply `cannot read: <path>`.
Otherwise reply with one line per part: `Part N: <x>/<y> · <words> words · warn: <short list or none>`.
```

## After each batch (the main agent only)

The main agent is the only writer of `bible.md` and `<slug>-import.md`.

1. Check with code, per part `<a>..<b>`:
   - missing or empty file → re-dispatch from that part to `<b>` once; still missing → stop and report the part.
   - line 1 not matching `^## <part_word> N:` → fix the heading per `web-import.md`.
   - outside 700-1,300 words → re-dispatch from that part to `<b>` once; still outside → keep it and list it as a warn
     (800-1,200 stays the checklist warn).
2. **Rebuild** `<slug>-import.md` with code from `parts/part-01..<b>` per `web-import.md` (front-matter, `#` title,
   teaser rules), then check it has exactly the headings 1..`<b>` in order. Never append to a half-written file.
   Story moved from chat mode with no part files for parts 1..`web_done` → append instead: first check the file's last
   heading = `web_done`, then append per `web-import.md`.
3. Only then set `web_done: <b>` in `bible.md`. An interruption before this step leaves the batch to be redone; the
   rebuild in step 2 makes that safe.

## End of the command

The end-of-step summary from `SKILL.md`, with: `File: drama-stories/<slug>/<slug>-import.md (parts 1-<web_done>)`,
self-check as one line — parts written plus the warned parts (e.g. `45 phần · warn: phần 7, 12, 31`) — and instead of
`Next:` either the review line above, "Truyện đã hoàn thành (<web_parts>/<web_parts>)." or, after an explicit range,
`/drama web <web_parts>` to continue.
