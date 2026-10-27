# Web import file — replaces export-web-import.py

One story = **one import file** `<slug>-import.md`, grown part by part until it holds the whole story; the user imports
it once. Rules follow `scripts/export-web-import.py` from the Claude Code version; the differences: the title comes from
the bible's `web_title:` (else caption line 1 in the chat, else ask) instead of the folder name, and later chats append
to the uploaded file instead of writing a separate batch file.

## Part 1 → create `<slug>-import.md`

```
---
title: "<caption line 1, verbatim>"
slug: "<URL slug of the title>"
main_lang_id: <language code of the story, from `country:` — see table below>
description: "<the bible's description field; if absent, l1>"
seotitle: "<same as title>"
seodescription: "<description cut to ≤ 160 characters>"
---

# <caption line 1, verbatim>

## <part_word> 1: <part title>
…

## <part_word> 2: <part title>
…
```

- Every front-matter value goes in double quotes (except `main_lang_id`); inner double quotes are written `\"`.
- URL slug: strip accents (é→e, ü→u, ñ→n, ø→o, æ→ae, œ→oe, ß→ss, ł→l), lowercase, every character other than
  a-z and 0-9 becomes `-`, collapse consecutive `-`, trim `-` at both ends, max 100 characters (cut at the nearest
  `-`). Title has no Latin letters (Arabic) → use the bible's `slug`.
- `main_lang_id` = the language of the story content (not the site's language), taken from the bible's `country:`.
  Write the bare code, **no quotes** (the only front-matter value not quoted), one of these exactly:

  | `country:` | `main_lang_id` |
  |---|---|
  | `en-us`, `en-gb` | `en` |
  | `ar` | `ar` |
  | `da` | `da` |
  | `de` | `de` |
  | `es` | `es` |
  | `fr` | `fr` |
  | `it` | `it` |
  | `nl` | `nl` |
  | `no` | `no` |
  | `pl` | `pl` |

  Allowed codes on the site: en ar cs da de es fi fr id it ja ko nl no pl pt ro ru sv tr vi. A `country:` not in the
  table → strip the region part (`xx-yy` → `xx`) and use it only if it is in that allowed list; otherwise ask the user.
  Never leave `main_lang_id` empty and never invent a code — a wrong code makes the import fail.
- Title = the bible's `web_title:`; else caption line 1 in the chat; else ask the user to paste it. Never invent a title.

## Later parts → append to the same `<slug>-import.md`

- In the chat that created the file: append each new part to it. In a later chat: append to the uploaded file.
  Folder mode: append in place to `drama-stories/<slug>/<slug>-import.md`; nothing is exported.
- If the uploaded file's front-matter has no `main_lang_id:` line (made by an older version), insert it right after
  the `slug:` line, per the table above, before exporting.
- Before appending, delete the teaser line at the end of the file's current last part (the next heading replaces it).
- Do it with code: read the file, strip that one line, write the new parts after it, export the file under the same
  name. Never retype earlier parts; never load the whole file into the chat.
- After appending, the file must contain parts 1..`web_done` in order, each heading once — check it with code
  (count the `## <part_word> N` headings) and check the front-matter has exactly one `main_lang_id:` line with a valid
  code, before exporting.

## Shared rules

- Each part keeps its `## <part_word> N: …` heading; a part missing its heading → add `## <part_word> N`.
- Join with code execution from the part drafts in the scratch folder; never retype the text. The import file is the ONLY
  story file delivered to the user: no separate part files in the outputs folder (Rule WEB-ONE-FILE in SKILL.md).
- Drop the final teaser line of every part **except the last part in the file** (the website already shows the next part's title).
- Parts in numeric order, separated by one blank line.
