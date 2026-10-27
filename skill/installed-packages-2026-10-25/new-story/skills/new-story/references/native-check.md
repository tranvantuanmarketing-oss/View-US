# Native-check — 15 questions run at the end of every output

Lint catches raw machine voice; this checklist catches **cultural mismatches** that regex cannot see. Answer each
question by looking up `countries/<code>.md`. Any "no" → fix before lint. Wrong → right examples
use EN-US and DE; for other countries look up the matching pack.

| # | Question | Wrong → right |
|---|---|---|
| 1 | Do character names fit the generation and class? (a 70-year-old grandmother is not named Kayla; a poor daughter-in-law is not named Seraphina) | DE 68-year-old grandmother "Jessica" → Renate · EN-US 4-year-old girl "Margaret" → Ava |
| 2 | Is money in the right format and range? (symbol, comma/period, a poor figure must be really poor) | "2,3 Millionen $" → 2,3 Millionen Euro · "$950 rent" in Manhattan → Dayton or $2,900 |
| 3 | Do the institutions exist and do the right job? (who draws up a will, who witnesses a signature, who handles a divorce) | US "the notary read the will" → the attorney / probate · DE "der Anwalt beurkundete den Hausverkauf" → der Notar |
| 4 | Are the rituals right for the country? (where weddings happen, what food follows a funeral, how an inheritance is opened) | DE "reading of the will" before the whole family → Brief vom Nachlassgericht · US "Kaffee und Kuchen after the funeral" → casseroles, the reception at the church hall |
| 5 | Does the dialogue have translated sentence patterns? (read it aloud: would a native speaker say that) | DE "Ich konnte nicht anders, als zu weinen" → Ich hab geheult, fertig · US "I cannot believe what you are saying" → I can't believe you just said that |
| 6 | Do forms of address fit the relationship and closeness? (Sie/du, Mrs./first name, mom/mother) | DE lawyer calls the client "du" → Sie · US daughter-in-law calls her mother-in-law "Mother" → Linda / his mom |
| 7 | Are dates, times, and units in the country's standard? | US "15:30", "12 km" → 3:30 p.m., 7 miles · DE "3 p.m.", "December 7" → 15 Uhr, 7. Dezember |
| 8 | Are small places real and right for the class? (poor people do not live in Malibu/Blankenese) | US narrator works as a CNA "in Greenwich" → in Scranton · DE Pflegerin "in Grünwald" → in Gelsenkirchen |
| 9 | Is the narrator's job a real job in that country, with the right shift/hours? | DE "night shift at Walmart" → Nachtschicht im Pflegeheim · US "Minijob" → part-time at Dollar General |
| 10 | Are the poor-real objects from that country? (no Ikea Billy in Ohio, no Crock-Pot in Herne) | US "Pfandflaschen" → aluminum cans in a bag · DE "casserole dish" → Tupperdose / Auflaufform |
| 11 | Are quotation marks and punctuation right for the language? | DE "…" → „…“ · FR missing space before : ! ? |
| 12 | Do any of the pack's "translation tell" phrases appear? (grep the "Translation tells" section) | Each line in the pack is 1 grep |
| 13 | Is any of the country's content taboos touched? | DE comparing the mother-in-law to the "Führer" → remove · US veteran as the villain → swap roles |
| 14 | Does the antagonist have motives typical of people in that country? (what kind of face-saving, what they fear losing) | DE fears "Nachbarn reden" / Erbe · US fears "the church", "his reputation at the firm" |
| 15 | Is the CTA the pack's verbatim text, no bait, not re-translated? | "Type YES" → the pack's `cta.caption` · "Teil 2 in den Kommentaren" (self-translated) → Teil 2 steht im ersten Kommentar. |

Record the result in 1 line at the end of `output/<slug>/bible.md` under `## Native-check`: `caption: 15/15 ·
comment: 14/15 (question 6 fixed to Sie)`. Without this line → SKILL.md does not print "ready to post".
