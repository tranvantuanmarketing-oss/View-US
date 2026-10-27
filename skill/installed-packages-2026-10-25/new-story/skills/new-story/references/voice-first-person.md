# First-person voice — 14 rules, each backed by a number or an exemplar

Source: 31 posts marked `keep: yes` in `exemplars/en/` (≥ 800 comments, measurements in `_stats.md`), compared against 3
old-toolkit posts as a baseline. Applies to every language; country differences live in `countries/<code>.md`.
Read in the caption, comment, and web steps. Lint catches rules 1, 2, 4, 7, 11; the remaining rules are the
writer's job + native-check.

Main finding from the baseline: the old-toolkit posts hit **no** AI phrase (0/31 patterns) yet were still called
fake. Measured differences: the old toolkit had 0 dialogue turns in the caption (exemplar p50 13), indirect narration, literary-style
irony ("he said 'heir' into a telephone"). Real people tell it *straight, in order, with lots of dialogue, one
sentence per line*. The new voice puts that ahead of everything else.

## 1. Short sentences: p50 8 words, p90 20
Real storytelling posts have a p50 of 5 to 13 words/sentence, none above 13. Sentences > 30 words ≤ 5% of sentences.
> *He looked at the cup on the floor. He looked at me.*

## 2. One sentence per line, or 1-2-sentence paragraphs: 87% of paragraphs
Blank line between ideas. A 3-sentence paragraph is the exception for a scene that needs to "breathe"; paragraphs of ≥ 5 sentences only on the web.
> *Twins.* / *Tiny.* / *Sleeping peacefully beneath pale blue caps.* (05781)

## 3. Open with a person + something happening; 0/100 posts open with weather
25/31 open with an absurd situation told straight; 31% have dialogue in the first sentence; 0% scene description, 0% "My name is X"
self-introductions that succeeded. Line 1 ≤ 25 words.
> *An elderly woman asked me to marry her as her dying wish.* (03780)

## 4. Lots of short dialogue: p50 13 turns/caption, p25 10
One-line dialogue back and forth, no explanation between two turns. Old toolkit: 0-3 turns. At least 1 turn is cut off by
an action or by the speaker stopping themselves (10% of exemplars use … inside the quotes; more common is cutting with
an interjected narration sentence).
> *"You signed every transfer."* / *"She told me it was temporary."* (00824)
> *"I didn't read it, Mom. I didn't read it, okay?"* — stop there, add no descriptive sentence.

## 5. Emotion: at most 1 sentence naming it, the rest is body and action
18/31 posts have exactly 1 short sentence like *My blood went cold.* within a chain of actions — no post has
a paragraph describing emotion. What real people do: physical actions instead of words.
> *I sat there without moving until the cup of tea became completely cold.*
> *Then I laughed. Not loudly. Not hysterically.* (01780)
> *I refreshed the app three times.* — instead of "I was in shock".
Lint blocks emotion-summary phrases (`a wave of`, `I felt devastated`, `my heart shattered`).

## 6. ≥ 2 poor-real details: 84% of posts have them
Cheap objects, small change, manual work, bills. Posts full of rich details still go viral but in a "them" voice;
an "I" voice needs my things. Source: the pack section "Everyday objects".
> *a bag filled with aluminum cans* · *the rusted coffee can* · *$117. Still $117.* · *white T-shirt*

## 7. CAPS ≤ 3 runs/post: exemplar p50 0, p90 1
CAPS only in the cruellest line of dialogue or for 1 word standing alone on a line (*FATHER.*). No CAPS in narration.

## 8. Concrete numbers instead of adjectives
Exact times, odd amounts of money, counts, number of plates. A number is evidence; an adjective is an opinion.
> *8:13 p.m.* · *Seven plates. Seven glasses. Seven chairs. Not a mistake. A decision.* · *the fourth missed call*

## 9. Verbless lists, triple negation then action — each pattern ≤ 1 time/post
Both patterns appear in ≥ 10/31 posts. Used once, it reads like the narrator gathering momentum; twice, it becomes a formula.
> *Not because she looked poor. Not because she looked tired. But because she looked at me with pity.*
> *I did not scream. I did not cry. I did not call Daniel. Instead, I took a photo of the screen.*

## 10. One sentence admitting limits, once per post
Real people do not know everything. One sentence admitting it makes the whole post more believable.
> *I don't know how to explain it.* · *I want to say I knew. I didn't.* · *I'm not proud of this part.*

## 11. End on a hanging event, no lesson, no summary
Last sentence of the caption = `l1` in the bible = something that just happened, not yet finished. No "I learned that", no
"family isn't blood". Lint blocks lesson/maxim endings.
> *The second line was already signed. In Gary's handwriting.*

## 12. One object runs through the post, appearing ≥ 3 times with different functions
Pruning shears → white roses → envelope (03762); photo → white shirt → group chat (01780). The object is recorded in the
bible; the caption shows it, the comment opens it, the web pays off its meaning.

## 13. No literary metaphors, no chapter titles mid-post
First-person posts with *glacier cracking*, *sparrow among swans*, or chapter titles ("The Gala She
Was Never Supposed to See") were all rejected during labelling: that is a novel voice, readers spot it immediately.
A concrete everyday image is fine (*like a cup of tea left too long*); big metaphors are not.

## 14. Dialogue and narration use the words that person really uses
Americans: *gonna, kinda, y'all, I don't know*; Germans: *halt, eh, ne?*, dropped subjects (*Hab ich nicht
gesehen*). Fully grammatical dialogue is a sign of translation. Country details: the pack section "Translation tells".

## Quick reference table before lint

| Check | Threshold | Number source |
|---|---|---|
| Sentence p50 | 5-13 words | `_stats.md` |
| 1-2-sentence paragraphs | ≥ 80% | 87% |
| Caption dialogue turns | ≥ 8 | p25 = 10 |
| Sentences naming an emotion | ≤ 1 | 18/31 have exactly 1 |
| Poor-real details | ≥ 2 | 84% |
| CAPS runs | ≤ 3 | p90 = 1 |
| "Not X. Not Y." / triple-negation pattern | ≤ 1 per pattern | ≥ 10/31 use it, each once |
| Weather / scene opener | 0 | 0/100 |

## Rule changes from the numbers (record here, do not edit SKILL.md)
- (empty — one line each: date · post · number · rule changed)
