<!-- rules: image prompts for the WEB story — one illustration per web part, pasted into Flux / Draw Things / Meta AI /
Midjourney. Source: bible (`## Character look` + the part text). Written in ENGLISH whatever the story language.
Printed in chat at the END of every web reply (one code block per part written in that reply) and also saved in
`<slug>-image-prompts.md` (one file per story, appended part by part like the import file, never imported to the site).

Consistency: every character in a prompt is described with the EXACT sentence from the bible's `## Character look`
(copy it word for word; never re-describe a face, hair or age). Missing section → write it into the bible first
(nationality + age + build + hair + 1 signature garment/accessory per main character) and re-export the bible.

Frame choice: the ONE moment of the part with the strongest visual reversal (object revealed, someone walking in,
a face changing). Never the final twist of the NEXT part. No text in the image except a short document line when the
document IS the moment (Flux renders short readable text; keep it ≤ 6 words, in the story language).

Flux: first sentence = photo style; positions as relations between people; NO negative syntax ("no text", "no
watermark"); NO [..] labels; ≤ 220 words per prompt. Safety: no blood, no violence shown, no nudity, children
fully clothed, calm, never in danger, never the focus of a humiliation; no real logos, no real people, no brand names. -->

**Part <N> — <part title>** · 16:9 · <moment in 1 line, in Vietnamese for the user>

```
Cinematic editorial photograph, horizontal 16:9, natural warm light, shallow depth of field, sharp focus on faces, realistic skin texture, muted European interior palette.

<Setting of the moment — 1 sentence, concrete French/German/… place from the pack (CHU corridor, notary office, family living room after a party), time of day.>

<Main character: copy the bible's Character look sentence, then pose + action + exact expression in this moment.>

<Second character: copy the Character look sentence, then position relative to the main character + expression.>

<Optional 1-2 background characters or objects that carry the plot (the symbolic object, a document, a phone screen).>

<One concrete colour anchor (exactly one saturated object) + camera: eye level / over-the-shoulder / close-up.>
```

## Cover image (optional, once per story)
Use `templates/thumb-prompt.md` (vertical 4:5) for the blog cover / FB thumb; do not duplicate it here.
