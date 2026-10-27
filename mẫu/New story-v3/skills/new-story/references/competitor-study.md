# Step `study` — learn from competitors, do not copy

Input: 1 competitor caption, image, or reel (pasted text, an image description, or a file path in
`exemplars/`). Output: `output/<slug>/study.md`. The `bible` step reads this file if it exists.

## Process (≤ 10 minutes)

1. Summarize the plot in 3-5 sentences **in English**. Do not copy any competitor sentence.
2. Extract 4 things, 1-2 lines each:
   - **Plot shape** — pick 1 of the 8 shapes in `hook-techniques.md`, section "Injustice → reversal".
   - **Reveal level** — where their caption stops, what the comment opens, what the web (if any) opens. Record it as events.
   - **CTA** — do they use bait (type YES…)? Note it, do NOT reuse it (see `fb-banned-words.md`).
   - **Thumb style** — composition (standing/kneeling, evidence object, crowd), which formula in `templates/thumb-prompt.md`.
3. Record 3 things **to avoid**: details already heavily repeated in the corpus (courtroom 33% in the new batch; "billionaire";
   "3:00 AM"), places where their voice reads as machine, places where they break FB banned words.
4. Swap details: list ≥ 5 of their concrete details (names, objects, amounts, places, jobs) and
   write next to each a **completely different** detail you will use. Rule from `reel-maker/lib/viet-the.mjs`:
   **≥ 3 matching details = not different enough**, rewrite.

## Forbidden

- Copying the competitor's character names, objects, figures, places, or lines of dialogue.
- Keeping the structure of their first sentence (change the hook shape: their `countdown` → your `object-first`).
- Putting study content into outputs. `study.md` is read only by the bible.

## Template `study.md`

```markdown
# Study: <source — page / url / file>

## Plot (in English, 3-5 sentences)

## Takeaways
- Plot shape:
- Reveal level: L1 = … · L2 = … · L3 = …
- CTA: <verbatim> → uses bait? yes/no
- Thumb style:

## Avoid
- 
- 
- 

## Swap details (≥ 5)
| Theirs | Ours |
|---|---|
| | |

## Ideas for the bible
- Chosen hook shape (different from theirs):
- Symbolic object (different from theirs):
- Poor-real details suggested by the pack:
```
