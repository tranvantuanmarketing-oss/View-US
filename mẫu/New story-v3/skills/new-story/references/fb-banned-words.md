# Facebook banned words — engagement bait + violence/abuse

Ported from `drama-viral/drama-skills/caption-drama/references/banned-words.md`, keeping only the
Facebook part (engagement bait, violence, abuse, filter evasion) and the 5 replacement techniques. The style
part was dropped. Applies to **caption, comment, invideo**. Does NOT apply to web (`web/part-NN.md`) or
thumb-prompt (lint skips those two).

The tables are machine-readable data, same 6-column format as `anti-ai-patterns.md`: `id` · `lang` ·
`scope` · `level` · `regex` · note. Every row here is `error`.

## Engagement bait — Facebook penalises directly and stops recommending the page

The competitor exemplar corpus (37 top posts) uses "type YES / NEXT" in 30+ posts. They get away with it because the page already has
reach; a new page that gets flagged is finished. Decision: keep the ban (old-toolkit numbers: pages that split characters to dodge filters
had 3.5x lower engagement).

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| bait-type-word | all | any | error | `\b(type\|comment\|gõ\|tippe\|schreib\|schreibt)\s+["'“‘]?(yes\|next\|1\|có\|ja\|weiter\|continue\|c0ntinue)\b` | "type YES", "comment NEXT". |
| bait-unlock | all | any | error | `\b(to unlock\|comment to (get\|receive\|unlock)\|so we can post\|and i('ll\| will) send\|um freizuschalten\|damit wir (die\|den) (Fortsetzung\|Rest) posten)\b` | Action in exchange for content. |
| bait-tag-share | all | any | error | `\b(tag (3\|three\|a) friend\|share to (get\|receive)\|hit like (and\|to)\|press like\|markiere (drei\|3) Freunde\|teile (um\|damit))\b` | Tag/share/like bait. |
| bait-masked | all | any | error | `\b(c0mment\|st0ry\|c0ntinue\|l[\s.]+i[\s.]*ke\|f[\s.]+ull\|p[\s.]+art)\b` | Masked letters to dodge filters — 3.5x lower engagement. |
| bait-likes-count | all | any | error | `\b\d+\s+(likes?\|comments?)\s+(and\|&)\b` | "30 Likes & 50 Comments and…". |

Replace with the CTA in `countries/<code>.md` (`cta`) + the gap-opening technique in
`hook-techniques.md`: say there *is* a Part 2 in the first comment, do not give orders.

## Physical violence, sexual abuse, self-harm, threats, weapons — English

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| viol-en-hit | en | any | error | `\b(beat\|beating\|beaten\|hit (her\|him\|me\|my\|the (child\|kid\|baby))\|slap(ped)?\|punch(ed)?\|kick(ed)?\|stab(bed)?\|strangle[ds]?\|chok(e\|ed\|ing)\|smash(ed)?\|assault(ed)?\|bruise[sd]?\|bleed(ing)?\|blood (on\|in\|from\|everywhere\|all over\|dripping)\|(covered\|pool) (in\|of) blood\|wound(ed)?\|skull\|broken bones)\b` | Narrate the reaction instead of the act (technique 1). |
| viol-en-abuse | en | any | error | `\b(rape[d]?\|molest(ed)?\|sexually (abused\|assaulted)\|groped\|sexual assault\|forced himself)\b` | Sexual abuse. |
| viol-en-selfharm | en | any | error | `\b(suicide\|kill (myself\|herself\|himself)\|hang himself\|slit (her\|my) wrists\|cut herself\|overdose\|self-harm\|wanted to die\|end my life\|took pills\|jump off)\b` | Self-harm. |
| viol-en-child | en | any | error | `\b(beat the child\|hit the kid\|abused child\|child abuse\|starved the baby\|locked the child\|hurt my (daughter\|son))\b` | Child abuse. |
| viol-en-threat | en | any | error | `\b(i will kill\|going to kill\|destroy her\|make her pay\|deserves to die\|make him suffer)\b` | Threats. |
| viol-en-slur | en | any | error | `\b(you('re\| are)\|she('s\| is)\|he('s\| is)\|they('re\| are)) (so \|just \|nothing but )?(worthless\|disgusting\|trash\|garbage\|subhuman\|pathetic\|a loser\|a freak)\b\|\bretard(ed)?\b` | Insults aimed at a person (subject + adjective); everyday nouns (trash bag) are not caught. |
| viol-en-weapon | en | any | error | `\b(poison(ed)?\|drugged\|sedative\|laced (his\|her\|my\|the)\|spiked (his\|her\|my\|the)\|(pulled\|grabbed\|held\|raised\|pointed\|with) (a\|the\|his\|her) (gun\|knife\|weapon)\|gun to (my\|her\|his)\|at gunpoint\|knifepoint)\b` | Weapons in action; 'a kitchen knife on the counter' is not caught. |
| viol-mask | all | any | error | `(?<![/.@\w])[a-z]{2,}[:*]+[a-z]{2,}\b\|\b[a-z]+0[a-z]{2,}\b(?!\.[a-z])` | Split characters to dodge filters: stru:ck, bl00d, h*t; URLs/emails are skipped. |

## German

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| viol-de-hit | de | any | error | `\b(schlug\|schlagen\|geschlagen\|Schlag\|trat\|treten\|stach\|stechen\|würgte\|würgen\|Blut\|blutete\|Wunde\|Knochenbruch\|Prellung(en)?)\b` | Violence. |
| viol-de-abuse | de | any | error | `\b(Vergewaltigung\|vergewaltigt\|missbraucht\|Missbrauch\|begrapscht)\b` | Sexual abuse. |
| viol-de-selfharm | de | any | error | `\b(Selbstmord\|Suizid\|umbringen\|erhängt\|Pulsadern\|Überdosis\|sterben wollte\|Tabletten genommen)\b` | Self-harm. |
| viol-de-weapon | de | any | error | `\b(Gift\|vergiftet\|betäubt\|Messer\|Waffe\|Pistole)\b` | Weapons. |
| viol-de-threat | de | any | error | `\b(ich bringe (sie\|ihn) um\|ich werde (sie\|ihn) (vernichten\|zerstören)\|verdient zu sterben)\b` | Threats. |

## French / Spanish

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| viol-fr | fr | any | error | `\b(frapp(er\|é\|ée)\|gifle\|coups? de (poing\|pied\|ceinture\|batte\|couteau)\|poignard(er\|é)\|sang\|blessure\|viol\|suicide\|couteau\|arme\|poison)\b` | From the old toolkit. |
| viol-es | es | any | error | `\b(golpe(ar\|ó)\|bofetada\|puñalada\|sangre\|herida\|violaci[oó]n\|suicidio\|cuchillo\|arma\|veneno)\b` | From the old toolkit. |

## Dutch / Norwegian / Danish / Polish / Italian / Arabic

No exemplar corpus yet; translated from the EN/DE tables, low confidence. NO/DA avoid ambiguous words (`gift` = married,
`sparket` = fired from a job, `regnet` = calculated) so only phrases with an object are caught. AR: regex does not use `\b`
because prefixes (و، ف، ب، ل، ال) attach to the word; common prefixes/suffixes are allowed.

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| viol-nl | nl | any | error | `\b(sloeg\|slaan\|geslagen\|klap\|schopte\|schoppen\|stak\|steken\|wurgde\|wurgen\|bloed\|bloedde\|wond\|verkrachting\|verkracht\|misbruikt\|misbruik\|zelfmoord\|suïcide\|ophangen\|overdosis\|mes\|wapen\|pistool\|vergif\|vergiftigd)\b` | Violence, sexual abuse, self-harm, weapons. |
| viol-no | no | any | error | `\b(slo (meg\|henne\|ham\|barna?\|kona)\|slått (meg\|henne\|ham)\|stakk (meg\|henne\|ham)\|kvalte\|blod\|blødde\|voldtekt\|voldtatt\|misbrukt\|selvmord\|hengte seg\|overdose\|kniv\|våpen\|pistol\|forgiftet)\b` | Violence, sexual abuse, self-harm, weapons. |
| viol-da | da | any | error | `\b(slog (mig\|hende\|ham\|barnet\|børnene)\|slået (mig\|hende\|ham)\|stak (mig\|hende\|ham)\|kvalte\|blod\|blødte\|voldtægt\|voldtaget\|misbrugt\|selvmord\|hængte sig\|overdosis\|kniv\|våben\|pistol\|forgiftet)\b` | Violence, sexual abuse, self-harm, weapons. |
| viol-pl | pl | any | error | `\b(uderzył\|uderzyła\|pobił\|pobiła\|kopnął\|kopnęła\|dźgnął\|dźgnęła\|dusił\|dusiła\|krew\|krwawił\|krwawiła\|gwałt\|zgwałcił\|zgwałcona\|molestował\|samobójstwo\|powiesił się\|powiesiła się\|przedawkował\|przedawkowała\|nóż\|broń\|pistolet\|trucizna\|otruł\|otruła)\b` | Violence, sexual abuse, self-harm, weapons. |
| viol-it | it | any | error | `\b(picchi(are\|ato\|ata\|ò)\|schiaff(o\|i)\|pugn(o\|i)\|accoltell(are\|ato\|ata)\|sangue\|ferit[ao]\|stupro\|stuprat[ao]\|violenza sessuale\|suicid(io\|ata\|ato)\|coltello\|arma\|pistola\|veleno\|avvelenat[ao])\b` | Violence, sexual abuse, self-harm, weapons. |
| viol-ar | ar | any | error | `(?<![\w])(و\|ف)?(ال\|ب\|ل)?(ضرب\|طعن\|خنق\|دم\|دماء\|جرح\|اغتصاب\|اغتصب\|تحرش\|انتحار\|انتحر\|شنق\|سكين\|سلاح\|مسدس\|سم\|سمم)(ني\|ها\|ه\|ت\|تني\|تها\|وا\|ين\|ون)?(?![\w])` | Violence, sexual abuse, self-harm, weapons; word root + prefixes/suffixes. |

## 5 replacement techniques (kept as-is from the old toolkit)

1. **Reaction instead of action.** ❌ "He hit her across the face" → ✅ "She flinched. The room went completely still." / "My hand reached for my cheek before I could think."
2. **Silence instead of screaming.** ❌ "She screamed in pain" → ✅ "No one spoke. Not one person at that table said a word."
3. **Consequence instead of process.** ❌ "He beat her until she was bleeding" → ✅ "She wore long sleeves for the rest of the summer." / "The ER nurse asked three questions. The third made her cry."
4. **A look instead of violence.** ❌ "She was terrified of him" → ✅ "Every time he raised his voice, her son went completely still."
5. **Implied threat instead of direct.** ❌ "I will destroy you" → ✅ "'You'll understand soon enough,' she said. Then she smiled."

German: ❌ "Er schlug sie" → ✅ "Sie zuckte zusammen. Der Raum wurde still."
