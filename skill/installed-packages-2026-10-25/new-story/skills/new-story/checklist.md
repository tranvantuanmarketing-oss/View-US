# Self-check checklist — replaces the machine lint

Distilled from `lint-output.py`, `references/fb-banned-words.md`, `references/anti-ai-patterns.md` of the
Claude Code version. The model grades itself, so things slip easily: check **every line of the output**, not by impression.

Two levels:
- **[block]** failed → fix it now and re-check; while it still fails, "ready to post" must not be printed.
- **[warn]** failed → still deliver, print the failed item so the writer decides.

How to print, after each output: `Self-check: x/y passed` (y = number of items for that step, including shared items), then
one line per failed item: `✗ [block|warn] <item>: <failing excerpt> → <how to fix>`.

## Shared items for caption, comment, invideo, web

1. [block] **Facebook banned words** (not applied to web and thumb). Open `references/fb-banned-words.md`,
   take every table row whose `lang` = the target language or `all`. For each row, scan the whole post for any
   word matching the regex column. The three groups that slip through most:
   - engagement bait: "type YES", "comment NEXT", "tag 3 friends", "share to", "like and";
   - violence/abuse/self-harm/weapons named directly (beat, slap, blood, knife, suicide, poison… and
     the target-language equivalents) → tell the reaction instead of the act;
   - masking letters to dodge filters (bl00d, stru:ck, h*t, c0mment) → banned, write around it instead of masking.
2. [block] **Anti-AI phrases.** Open `references/anti-ai-patterns.md`, scan the rows whose `lang` matches;
   rows with `level` error are [block], warn are [warn]. `scope: first` checks only the first sentence, `last` only the last 2 sentences.
3. **Names outside the bible.** [block] a name from the pack's name table that is not in the bible's
   `names`. [warn] another capitalised word that looks like a person's name, appears ≥ 2 times, and is in neither the bible
   nor the pack (invented name?).
4. [warn] **First-person ratio.** At least 1/4 of sentences contain a first-person pronoun (the pack's `pov_pronouns`;
   if the pack has `pov_min_ratio`, follow the pack).
5. [warn] **Rhythm.** No more than 3 CAPS phrases; em dashes `—` no more than 1 per 100 words; sentences over
   30 words no more than 5% of sentences (web 10%).
6. [warn] **Quote marks** match the pack's `quote_marks` (e.g. DE „…“, FR « … »).

## bible (5 items, all [block])

1. All front-matter fields present: slug, country, pov, narrator_gender, narrator_age, names, hook_type, l1, l2; no `<…>` left. `hook_type: tbd` is valid until the caption step.
2. The pack file `countries/<country>.md` exists.
3. The "Poor-real details" section has ≥ 2 filled lines.
4. `l1` and `l2` are complete target-language sentences (≥ 3 words), not descriptions.
5. The bible body (except the `## Native-check` section) has no `<…>` placeholders left.

## caption (shared items + 6)

1. [block] The last sentence before the CTA is **exactly** `l1`; after `l1` only the CTA remains.
2. [warn] CTA is exactly the pack's `cta.caption`.
3. [warn] Line 1 ≤ 25 words; `hook_type` written into the bible.
4. [warn] 250-450 words.
5. [warn] ≥ 8 dialogue turns.
6. [warn] Narration paragraphs ≤ 2 sentences, dialogue paragraphs ≤ 3 sentences.

## comment (shared items + 7)

1. [block] The last sentence before the link is **exactly** `l2`; after `l2` only the CTA remains.
2. [warn] The last line has `{WEB_URL}` or a link; CTA is exactly the pack's `cta.comment`.
3. [warn] Sentence 1 continues straight from L1, does not retell the caption.
4. [warn] 400-900 words.
5. [warn] ≥ 4 dialogue turns.
6. [warn] Narration paragraphs ≤ 2 sentences, dialogue paragraphs ≤ 3 sentences.
7. [block] At most 90 lines, blank lines included (count the posted text, CTA line too).

## invideo (shared items 1-3 and 6 + 8)

1. [warn] 5-7 beats, 50-165 words total (Avatar line not counted).
2. [warn] First sentence ≤ 15 words; no money, no linking conjunctions (but/until/aber/mais/ma…), no dialogue.
3. [warn] ≥ 2 dialogue turns.
4. [warn] 3-5 `**…**` / `==…==` phrases; beat 1 not highlighted.
5. [warn] The last beat has a time jump (later, the next morning, drei Tage später…) + a discovery verb (found, opened, learned…) and ends with `…`.
6. [warn] No blunt death words (died, dead, killed, tot, mort…) → write around them.
7. [warn] Last line `Avatar: <female|male> <age range>` matches the bible's narrator_gender/narrator_age.
8. [warn] The file `<slug>.txt` has been created with the `CAPTION` and `COMMENT #1` blocks.

## thumb (7, FB banned words not applied)

1. [warn] Prompt (above `---`) ≤ 350 words.
2. [warn] No negative syntax "no text", "no watermark", "no logo".
3. [warn] No `[..]` labels.
4. [warn] The pack's nationality (`nationality`) attached to the characters.
5. [warn] Contains "vertical 4:5" and "bright / daylight / high-key".
6. [warn] Every box in the checklist below `---` of `templates/thumb-prompt.md` is covered.
7. Names outside the bible: as shared item 3 ([block] for names from the pack's name table).

## image — each prompt (6, FB banned words not applied)

1. [warn] Every character is described with the exact sentence from the bible's `## Character look`.
2. [warn] Contains "horizontal 16:9" and a photo-style first sentence; ≤ 220 words.
3. [warn] No negative syntax ("no text", "no watermark"), no `[..]` labels, no brand or real-person names.
4. [warn] The moment comes from that part; it does not show the twist of a later part.
5. [block] No blood, violence, nudity; children calm, clothed, never in danger or humiliated.
6. [warn] Prompts were also appended to `<slug>-image-prompts.md`, not to the import file.

## web — each part (shared items 2-6 + 5, FB banned words not applied)

1. [warn] Line 1 is `## <part_word> N: <title>` (part_word from the pack).
2. [warn] The last line is a teaser `<part_word> N+1: …` with ≥ 1 concrete detail (the story's final part: no teaser, skip this item).
3. [warn] 800-1,200 words.
4. [warn] ≥ 5 dialogue turns; paragraphs ≤ 5 sentences.
5. [warn] Opening and cliffhanger are of a different type from the previous part (7 hook types, 8 cliffhanger types in the template).

## Native-check (end of caption, comment, invideo, thumb)

Run the 15 questions in `references/native-check.md`, checking against the pack. Write 1 line into the `## Native-check`
section of the bible (e.g. `caption: 15/15 · comment: 14/15 (question 6 fixed Sie)`), then re-export the bible file.
