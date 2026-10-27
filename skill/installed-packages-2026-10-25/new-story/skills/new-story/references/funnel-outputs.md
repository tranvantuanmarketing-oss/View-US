# 5-output funnel — what each output DELIVERS, what it HOLDS BACK, how long it is

One bible → 5 outputs. Outputs do not invent extra plot; they only choose *how far to open*. Lengths are
lint **warn** thresholds (not blocking). The CTA comes from `countries/<code>.md` → `cta`; never write your own.

| Output | Delivers (what the reader gets) | Holds back (not yet opened) | Stops at | Length | CTA / tail |
|---|---|---|---|---|---|
| `caption.md` | Situation + the object appears + the cruellest line | Inside the object, identities, the secret | **L1** verbatim from the bible | 250-450 words¹ | Pack's `cta.caption`, 1 sentence, after L1 |
| `comment.md` | Opens the object → discovery 1 (L2) | The final truth, consequences, what I do | **L2** verbatim, a gap BIGGER than L1 | 400-900 words, ≤ 90 lines | `cta.comment` + `{WEB_URL}` on the last line |
| `invideo.md` | Caption compressed into a reel card: hook ≤ 15 words, 5 beats | Same as caption | Beat 5 ends with `…`, has a time jump + a discovery verb | 50-165 words (target ~120) | No CTA in the card; reel-maker adds `ctaBar` from `lang/<code>.json` |
| `thumb-prompt.md` | 1 frame that tells the whole humiliation/abuse scene, who does what to whom | No text, no L2/L3 twist revealed | — | ≤ 350 words (512 T5 tokens) | None |
| `web/part-NN.md` | Opens gradually up to **L3**; each part ≥ 2 new reveals | The next part | Its own cliffhanger per part (rotate 8 types) | 800-1,200 words/part | Teaser for the next part, 1-2 sentences |

¹ Competitor exemplar corpus: caption p50 = 635 words (37 selected posts; 724 on the filtered corpus of 100), 13 dialogue turns (`exemplars/en/_stats.md`) — longer than this
threshold because they tell almost everything in the caption and then drop the link. The 250-450 threshold is a decision to hold L1 for the comment;
the pilot re-measures it; change it here if the numbers say otherwise.

## Reveal levels — hard rules

- L1 < L2 < L3 by *event*, not by emotion. Each level opens exactly 1 thing and exposes 1 new, bigger gap.
- Last sentence of the caption == `l1` in the bible (lint compares verbatim, ignoring whitespace). Last sentence of the comment == `l2`.
- Character names in every output ⊆ `names` in the bible. The symbolic object must appear in the caption, comment, and web.
- The comment does NOT retell the caption. The comment's first sentence continues straight from L1 ("I opened it in the car.").

## Downstream file formats (unchanged, the tools are in use)

- **reel-maker** takes `invideo.md` = the card body of beats 1-5, each beat a paragraph separated by a blank line, marked with `**bold**` / `==highlight==` (3-5 phrases, beats 2 and 5 carry most, no marks in beat 1), last line `Avatar: <female|male> <age range>` (e.g. `Avatar: female 45-60`). Plus `<slug>.txt`:
  ```
  CAPTION
  <full caption>

  COMMENT #1
  <full comment>
  ```
  Original validator: `drama-viral/drama-skills/caption-in-video/scripts/validate-card.py` (first sentence ≤ 15 words, no money/conjunctions/dialogue in the first sentence, ≥ 2 dialogue turns, 5-7 paragraphs, ends with `…`).
- **Web** takes 1 import file merged from `web/part-*.md` by `scripts/export-web-import.py`: front-matter `title/slug/description/seotitle/seodescription`, `#` story title (= the caption title verbatim), `##` per part. The word "Part/Teil/Deel…" follows the pack's language.
- **Thumb**: a prose prompt pasted into Draw Things (FLUX.1 dev). No negative syntax ("no text"), no `[...]` labels, nationality attached to each character. Post-generation checks: luma 107-112, main character 37-55% of frame height.

## Measurements ported from the old toolkit (measured, kept)

- Thumbs are ~45% brighter than video: thumb luma 107-112, video 63-77. Do not export the thumb from a video frame.
- 2-second hook: the character fills 37-55% of the frame.
- Reel card: first sentence > 15 words → top-placement rate drops 30.1% → 15.8%. Money in the first sentence 0.34x. Dialogue in the first sentence 0.68x.
- Masked letters to dodge filters (c0mment, stru:ck): 3.5x lower engagement.
