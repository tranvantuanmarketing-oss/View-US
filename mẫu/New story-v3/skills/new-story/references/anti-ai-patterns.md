# Anti-AI patterns — phrases and structures that make readers spot machine writing

One source, two users: the writer reads it to avoid, `scripts/lint-output.py` reads the tables to
catch. The tables are machine-readable data — keep exactly 6 columns, regex in backticks, no line breaks
inside a cell. Each time a row is added because a pilot post got criticised, record "which post" in the note column.

Columns: `id` · `lang` (en / de / nl / no / da / fr / es / it / pl / ar / all) · `scope` (any = full text · first = first sentence · last = last 2
sentences) · `level` (error = block · warn = warning) · `regex` (Python `re`, IGNORECASE) · note.

Numeric basis: EN exemplar corpus (`exemplars/en/_stats.md`; n=100 = corpus filtered to ≥ 800 comments, n=37 = selected top) — 0% open with
weather, 4% have a direct emotion-description sentence per the regex, sentence p50 8 words, 87% of paragraphs are 1-2 sentences. Posts from the old toolkit
(baseline in `_stats.md`) break these far more often.

Engagement bait ("type YES", "tag 3 people") is NOT here — see `fb-banned-words.md`; lint
reads both files.

## Phrases — English

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| little-did-i-know | en | any | error | `\blittle did (i\|we\|she\|he\|they) know\b` | Real people do not announce the twist in advance. |
| wave-of | en | any | error | `\ba (wave\|surge\|rush\|flood) of (grief\|relief\|nausea\|panic\|emotion\|sadness\|anger\|shame\|guilt\|dread)\b` | Emotion summary. Replace with the body: "my hands wouldn't stop". |
| in-that-moment | en | any | error | `\bin that (very \|exact )?moment,? (i\|she\|he) (realized\|knew\|understood)\b` | Explains instead of showing. |
| it-was-then | en | any | error | `\bit was (then\|at that moment\|in that instant) (that )?(i\|she\|he)\b` | Same fault as above. |
| as-a-mother | en | any | error | `\bas a (mother\|wife\|daughter\|woman\|father\|husband),? i\b` | Real people do not introduce their own role. |
| i-felt-adj | en | any | error | `\bi (felt\|was) (so \|completely \|utterly \|absolutely \|truly )?(devastated\|heartbroken\|shattered\|humiliated\|betrayed\|overwhelmed\|numb\|broken\|crushed)\b` | Direct emotion description. Exemplars 03780, 01780: 0 times. |
| my-heart | en | any | error | `\bmy heart (sank\|shattered\|broke into\|skipped a beat\|pounded in my chest\|stopped)\b` | Cliché. |
| tears-streamed | en | any | error | `\btears (streamed\|rolled\|welled up\|spilled)\b` | Cliché. Real people: "I didn't cry until the parking lot". |
| chill-spine | en | any | error | `\b(sent (shivers\|a chill) down my spine\|a chill ran (down\|through))\b` | Cliché. |
| words-hung | en | any | error | `\bwords hung in the air\b` | Cliché. |
| deafening-silence | en | any | error | `\b(deafening\|heavy\|thick\|palpable) silence\b` | Cliché. Real exemplar: "Nobody said anything. The kettle clicked off." |
| palpable | en | any | error | `\bpalpable\b` | Machine word. |
| testament | en | any | error | `\ba testament to\b` | Machine word. |
| tapestry-journey | en | any | error | `\b(tapestry\|a journey of\|navigat(e\|ed\|ing) the (complexities\|challenges))\b` | Machine word. |
| delve-unbeknownst | en | any | error | `\b(delve\|unbeknownst\|whirlwind of)\b` | Machine word. |
| never-the-same | en | any | error | `\b(would\|was\|were) never (be )?the same( again)?\b` | Summary-style paragraph ending. |
| everything-changed | en | any | error | `\b(and )?(then \|that('s\| is) when )?everything changed\b` | Announces the twist in advance. |
| profound-sense | en | any | error | `\ba (profound\|overwhelming\|deep\|strange) sense of\b` | Emotion summary. |
| three-adjectives | en | any | error | `\b[a-z]+, [a-z]+,? and [a-z]+ (eyes\|voice\|smile\|face\|silence\|house\|room\|woman\|man\|life\|night\|morning)\b` | 3 adjectives in a row. Real people use 1. |
| stood-in-disbelief | en | any | warn | `\b(stood\|sat) (there )?in (stunned \|complete )?(disbelief\|silence\|shock)\b` | Cliché, but appears in 2/33 real exemplars; warn. |
| couldnt-help-but | en | any | warn | `\bcouldn'?t help but\b` | Machines use it often; real people rarely. |
| what-happened-next | en | any | warn | `\bwhat (happened\|came) next (shocked\|changed\|left\|would)\b` | Machine-style clickbait; real exemplars stop on an action. |
| fast-forward | en | any | warn | `\bfast forward\b` | Machine-style time jump; real exemplars: "Three days later." |
| never-forget | en | any | warn | `\bi('ll\| will) never forget (the\|that\|how)\b` | Appears in real exemplars, but rarely; warn. |
| not-about-money | en | any | warn | `\bit('s\| is\| was\|s)n'?t about the money\b` | Cliché. |
| before-i-could-process | en | any | warn | `\bbefore i could (process\|react\|respond\|even)\b` | Machines use it often. |

## Structure — English

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| weather-opener | en | first | error | `\b(rain\|raining\|rained\|snow\|snowing\|sunny\|sunlight\|sunshine\|storm\|thunder\|windy\|the sky\|clouds\|fog\|drizzle\|crisp (autumn\|morning)\|golden (light\|hour))\b` | 0/100 real exemplars open with weather. |
| scene-opener | en | first | warn | `^(the (sun\|light\|morning\|house\|kitchen\|room) (was\|had\|filtered)\|it was a (quiet\|beautiful\|cold\|warm\|typical))\b` | Opens with a scene instead of person + action. Real exemplars: 31% open with dialogue, the rest with "I"/a time marker/a situation. |
| lesson-ending | en | last | error | `\b(the lesson\|i learned that\|taught me that\|always remember\|never forget that\|what i know now\|if there's one thing)\b` | Ends with a lesson. Real exemplars end on an unfinished action or a question. |
| moral-ending | en | last | error | `\b(family isn'?t (always )?blood\|love (always )?wins\|karma\|the truth always comes out\|be kind)\b` | Ends with a maxim. |
| summary-ending | en | last | warn | `\b(in the end\|at the end of the day\|looking back\|to this day)\b` | Summarizes instead of stopping exactly at L1. |

## Phrases and structure — German

No DE exemplar corpus yet (n=10 collected by hand, low confidence). The rows below translate the EN faults plus
"translationese" faults seen in old-toolkit posts (`output/*_DE_*`). Revise from real comments during the pilot.

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| de-welle | de | any | error | `\b(eine Welle (der\|des\|von)\|ein Gefühl (der\|von) (Erleichterung\|Panik\|Scham\|Trauer) (überkam\|durchströmte\|überrollte))\b` | Emotion summary. |
| de-wenig-ahnte | de | any | error | `\b(wenig ahnte ich\|ich ahnte nicht,? dass\|nichts ahnend)\b` | Announces the twist in advance. |
| de-in-diesem-moment | de | any | error | `\bin (diesem\|jenem) (Moment\|Augenblick) (wurde mir klar\|erkannte ich\|begriff ich\|wusste ich)\b` | Explains instead of showing. |
| de-als-mutter | de | any | error | `\bals (Mutter\|Ehefrau\|Tochter\|Frau\|Vater),? (weiß\|wusste\|spürte) ich\b` | Introduces own role. |
| de-herz | de | any | error | `\bmein Herz (blieb stehen\|zerbrach\|raste\|setzte (kurz )?aus\|zersprang)\b` | Cliché. |
| de-traenen | de | any | error | `\bTränen (liefen\|rannen\|strömten\|schossen)\b` | Cliché. |
| de-schauer | de | any | error | `\b(ein Schauer lief mir\|es lief mir (eis)?kalt) (über\|den) (den )?Rücken\b` | Cliché. |
| de-worte-luft | de | any | error | `\bWorte (hingen\|schwebten) (in der Luft\|im Raum)\b` | Cliché. |
| de-stille | de | any | error | `\b(ohrenbetäubende\|drückende\|bleierne\|erdrückende) Stille\b` | Cliché. |
| de-nie-wieder | de | any | error | `\bnichts (war\|würde\|wäre) (mehr )?(je )?(wieder )?(so )?wie (zuvor\|vorher\|früher)\b` | Summary. |
| de-alles-aenderte | de | any | error | `\b(und )?(dann \|da )?(änderte\|veränderte) sich alles\b` | Announces the twist in advance. |
| de-nicht-anders | de | any | warn | `\bich konnte nicht anders,? als\b` | Translationese from "couldn't help but". |
| de-was-dann-geschah | de | any | warn | `\bwas (dann\|als Nächstes) geschah\b` | Machine clickbait. |
| de-nie-vergessen | de | any | warn | `\bich werde (den\|diesen\|diesen einen) (Tag\|Moment\|Blick\|Satz) nie vergessen\b` | Real people use it, but rarely. |
| de-am-ende | de | last | warn | `\b(am Ende des Tages\|rückblickend\|bis heute)\b` | Closing summary. |
| de-lektion | de | last | error | `\b(die Lektion\|ich habe gelernt,? dass\|hat mich gelehrt\|vergiss nie\|denk immer daran)\b` | Ends with a lesson. |
| de-wetter | de | first | error | `\b(Regen\|regnete\|Schnee\|schneite\|Sonne schien\|Sonnenlicht\|Gewitter\|Wind\|der Himmel\|Wolken\|Nebel\|Nieselregen)\b` | Opens with weather. |

## Phrases and structure — NL, NO, DA, FR, ES, IT, PL, AR

No exemplar corpus for these languages yet. Each table translates the 12 EN structural faults (announcing the twist,
explaining instead of showing, emotion summary, body clichés, weather opener, lesson ending). Phrases
real people also use often are `warn`. Revise from pilot comments; for each revised row record "which post".

### Dutch

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| nl-geen-idee | nl | any | error | `\b(weinig wist ik\|ik wist toen nog niet dat\|nietsvermoedend)\b` | Announces the twist in advance. |
| nl-had-geen-idee | nl | any | warn | `\bik had geen idee dat\b` | Real people say it too; frequent use is machine. |
| nl-op-dat-moment | nl | any | error | `\bop dat moment (besefte\|wist\|begreep\|realiseerde) ik\b` | Explains instead of showing. |
| nl-golf | nl | any | error | `\been golf van (opluchting\|paniek\|schaamte\|verdriet\|woede)\b` | Emotion summary. |
| nl-hart | nl | any | error | `\bmijn hart (stond stil\|brak\|bonkte\|sloeg over)\b` | Cliché. |
| nl-tranen | nl | any | error | `\btranen (stroomden\|liepen\|rolden) (over\|langs)\b` | Cliché. |
| nl-rilling | nl | any | error | `\been rilling liep (over\|langs) mijn rug\b` | Cliché. |
| nl-stilte | nl | any | error | `\b(oorverdovende\|drukkende\|beklemmende\|loodzware) stilte\b` | Cliché. |
| nl-alles-veranderde | nl | any | error | `\b(toen )?veranderde alles\b\|\bniets (was\|zou) ooit nog hetzelfde\b` | Announces the twist / summary. |
| nl-kon-niet-anders | nl | any | warn | `\bik kon niet anders dan\b` | Translationese of "couldn't help but". |
| nl-wat-daarna | nl | any | warn | `\bwat er (daarna\|toen\|vervolgens) gebeurde\b` | Machine clickbait. |
| nl-les | nl | last | error | `\b(de les\|ik heb geleerd dat\|heeft me geleerd\|vergeet nooit\|onthoud dit)\b` | Ends with a lesson. |
| nl-weer | nl | first | error | `\b(regen\|regende\|sneeuw\|sneeuwde\|de zon scheen\|zonlicht\|onweer\|de wind\|de lucht\|wolken\|mist\|motregen)\b` | Opens with weather. |

### Norwegian (Bokmål)

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| no-lite-visste | no | any | error | `\b(lite visste jeg\|intetanende)\b` | Announces the twist in advance. |
| no-ante-ikke | no | any | warn | `\bjeg ante ikke at\b` | Real people say it too. |
| no-i-det-oyeblikket | no | any | error | `\bi det (øyeblikket\|sekundet) (forsto\|skjønte\|visste\|innså) jeg\b` | Explains instead of showing. |
| no-bolge | no | any | error | `\ben bølge av (lettelse\|panikk\|skam\|sorg\|sinne)\b` | Emotion summary. |
| no-hjerte | no | any | error | `\bhjertet mitt (stoppet\|brast\|hamret\|hoppet over)\b` | Cliché. |
| no-tarer | no | any | error | `\btårene (rant\|strømmet\|trillet) (nedover\|ned)\b` | Cliché. |
| no-stillhet | no | any | error | `\b(øredøvende\|trykkende\|knugende) stillhet\b` | Cliché. |
| no-alt-forandret | no | any | error | `\b(da )?forandret alt seg\b\|\bingenting (ble\|var) (noen gang )?det samme\b` | Announces the twist / summary. |
| no-kunne-ikke-annet | no | any | warn | `\bjeg kunne ikke annet enn\b` | Translationese. |
| no-det-som-skjedde | no | any | warn | `\bdet som skjedde (etterpå\|deretter\|videre)\b` | Machine clickbait. |
| no-laerdom | no | last | error | `\b(lærdommen\|jeg har lært at\|lærte meg at\|glem aldri\|husk alltid)\b` | Ends with a lesson. |
| no-vaer | no | first | error | `\b(regnvær\|det regnet\|snø\|snødde\|sola skinte\|solskinn\|torden\|vinden\|himmelen\|skyene\|tåke\|yr)\b` | Opens with weather. |

### Danish

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| da-lidt-vidste | da | any | error | `\b(lidt vidste jeg\|intetanende)\b` | Announces the twist in advance. |
| da-anede-ikke | da | any | warn | `\bjeg anede ikke,? at\b` | Real people say it too. |
| da-i-det-ojeblik | da | any | error | `\bi det (øjeblik\|sekund) (forstod\|indså\|vidste) jeg\b\|\bi det øjeblik gik det op for mig\b` | Explains instead of showing. |
| da-bolge | da | any | error | `\ben bølge af (lettelse\|panik\|skam\|sorg\|vrede)\b` | Emotion summary. |
| da-hjerte | da | any | error | `\bmit hjerte (stoppede\|gik i stykker\|hamrede\|sprang over)\b` | Cliché. |
| da-tarer | da | any | error | `\btårerne (løb\|strømmede\|trillede) (ned\|ad)\b` | Cliché. |
| da-stilhed | da | any | error | `\b(øredøvende\|trykkende\|knugende) stilhed\b` | Cliché. |
| da-alt-aendrede | da | any | error | `\b(så )?ændrede alt sig\b\|\bintet (blev\|var) (nogensinde )?det samme\b` | Announces the twist / summary. |
| da-kunne-ikke-andet | da | any | warn | `\bjeg kunne ikke andet end\b` | Translationese. |
| da-hvad-der-skete | da | any | warn | `\bhvad der skete (bagefter\|derefter\|så)\b` | Machine clickbait. |
| da-laere | da | last | error | `\b(læren\|jeg har lært,? at\|lærte mig,? at\|glem aldrig\|husk altid)\b` | Ends with a lesson. |
| da-vejr | da | first | error | `\b(regnen\|det regnede\|sne\|sneede\|solen skinnede\|solskin\|torden\|vinden\|himlen\|skyerne\|tåge\|støvregn)\b` | Opens with weather. |

### French

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| fr-loin-de-me-douter | fr | any | error | `\b(j[’']étais loin de (me douter\|m[’']imaginer)\|je ne me doutais pas que\|sans me douter\|j[’']ignorais (alors\|encore) que)\b` | Announces the twist in advance. |
| fr-a-cet-instant | fr | any | error | `\b[àa] (cet instant\|ce moment)(-là)?,? (j[’']ai compris\|je compris\|j[’']ai su\|j[’']ai réalisé)\b` | Explains instead of showing. |
| fr-vague | fr | any | error | `\bune vague de (soulagement\|panique\|honte\|tristesse\|colère)\b` | Emotion summary. |
| fr-coeur | fr | any | error | `\bmon c(œ\|oe)ur (s[’']est arrêté\|s[’']est brisé\|battait la chamade\|a raté un battement)\b` | Cliché. |
| fr-larmes | fr | any | error | `\blarmes (coulaient\|ruisselaient\|roulaient) (sur\|le long)\b` | Cliché. |
| fr-frisson | fr | any | error | `\bun frisson (me )?(parcourut\|a parcouru)( le long de)? (mon\|le) dos\b` | Cliché. |
| fr-silence | fr | any | error | `\bsilence (assourdissant\|pesant\|de plomb\|glacial)\b` | Cliché. |
| fr-tout-a-bascule | fr | any | error | `\btout a (basculé\|changé)\b\|\bplus rien (ne serait\|n[’']a été\|ne fut) (jamais )?(comme avant\|pareil)\b` | Announces the twist / summary. |
| fr-pas-pu-m-empecher | fr | any | warn | `\bje n[’']ai pas pu m[’']empêcher de\b` | Translationese. |
| fr-ce-qui-suivit | fr | any | warn | `\bce qui (s[’']est passé\|se passa\|suivit\|est arrivé) (ensuite\|après)\b` | Machine clickbait. |
| fr-lecon | fr | last | error | `\b(la leçon\|j[’']ai appris que\|m[’']a appris que\|n[’']oubliez jamais\|souvenez-vous)\b` | Ends with a lesson. |
| fr-meteo | fr | first | error | `\b(la pluie\|il pleuvait\|la neige\|il neigeait\|le soleil brillait\|l[’']orage\|le vent\|le ciel\|les nuages\|le brouillard\|la bruine)\b` | Opens with weather. |

### Spanish

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| es-poco-sabia | es | any | error | `\b(poco sabía yo\|sin sospechar que\|ignoraba (entonces )?que)\b` | Announces the twist in advance. |
| es-ni-idea | es | any | warn | `\bno tenía (ni )?idea de que\b` | Real people say it too. |
| es-en-ese-momento | es | any | error | `\ben (ese\|aquel) (momento\|instante),? (entendí\|comprendí\|supe\|me di cuenta)\b` | Explains instead of showing. |
| es-oleada | es | any | error | `\buna (oleada\|ola) de (alivio\|pánico\|vergüenza\|tristeza\|rabia\|ira)\b` | Emotion summary. |
| es-corazon | es | any | error | `\bmi corazón (se detuvo\|se paró\|se rompió\|latía con fuerza\|dio un vuelco)\b` | Cliché. |
| es-lagrimas | es | any | error | `\blágrimas (corrían\|rodaban\|caían\|brotaban) (por\|de)\b` | Cliché. |
| es-escalofrio | es | any | error | `\bun escalofrío (me )?recorrió (la\|mi) espalda\b` | Cliché. |
| es-silencio | es | any | error | `\bsilencio (ensordecedor\|sepulcral\|pesado\|incómodo)\b` | Cliché. |
| es-todo-cambio | es | any | error | `\b(entonces \|ahí )?todo cambió\b\|\bnada (volvió\|volvería) a ser (igual\|lo mismo)\b` | Announces the twist / summary. |
| es-no-pude-evitar | es | any | warn | `\bno pude evitar\b` | Translationese. |
| es-lo-que-paso | es | any | warn | `\blo que (pasó\|ocurrió\|sucedió) (después\|luego\|a continuación)\b` | Machine clickbait. |
| es-leccion | es | last | error | `\b(la lección\|aprendí que\|me enseñó que\|nunca olvides\|recuerda siempre)\b` | Ends with a lesson. |
| es-clima | es | first | error | `\b(la lluvia\|llovía\|la nieve\|nevaba\|el sol brillaba\|tormenta\|el viento\|el cielo\|las nubes\|la niebla\|llovizna)\b` | Opens with weather. |

### Italian

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| it-poco-sapevo | it | any | error | `\b(poco sapevo\|mal sapevo\|non potevo immaginare che\|ignara di)\b` | Announces the twist in advance. |
| it-non-avevo-idea | it | any | warn | `\bnon avevo (la minima )?idea (che\|di)\b` | Real people say it too. |
| it-in-quel-momento | it | any | error | `\bin (quel\|quell[’']?)\s?(momento\|istante),? (ho capito\|capii\|ho realizzato\|mi sono resa conto)\b` | Explains instead of showing. |
| it-ondata | it | any | error | `\bun[’']?\s?ondata di (sollievo\|panico\|vergogna\|tristezza\|rabbia)\b` | Emotion summary. |
| it-cuore | it | any | error | `\bcuore (si è fermato\|si fermò\|si è spezzato\|batteva all[’']impazzata\|ha perso un battito)\b` | Cliché. |
| it-lacrime | it | any | error | `\blacrime (scendevano\|rigavano\|scorrevano\|sgorgavano)\b` | Cliché. |
| it-brivido | it | any | error | `\bun brivido (mi )?(corse\|percorse\|è corso) (lungo )?la schiena\b` | Cliché. |
| it-silenzio | it | any | error | `\bsilenzio (assordante\|di tomba\|pesante\|glaciale)\b` | Cliché. |
| it-tutto-cambio | it | any | error | `\b(poi \|lì )?tutto (è cambiato\|cambiò)\b\|\bniente (fu\|sarebbe stato\|è stato) (più )?(come prima\|lo stesso)\b` | Announces the twist / summary. |
| it-non-ho-potuto | it | any | warn | `\bnon ho potuto fare a meno di\b` | Translationese. |
| it-quello-che-successe | it | any | warn | `\bquello che (è successo\|successe\|accadde) (dopo\|poi)\b` | Machine clickbait. |
| it-lezione | it | last | error | `\b(la lezione\|ho imparato che\|mi ha insegnato che\|non dimenticate mai\|ricordatevi sempre)\b` | Ends with a lesson. |
| it-meteo | it | first | error | `\b(la pioggia\|pioveva\|la neve\|nevicava\|il sole splendeva\|temporale\|il vento\|il cielo\|le nuvole\|la nebbia\|pioggerella)\b` | Opens with weather. |

### Polish

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| pl-nieswiadoma | pl | any | error | `\b(niczego nie podejrzewając\|nieświadom[ay] (tego,? )?co\|nie wiedział[ae]m jeszcze,? że)\b` | Announces the twist in advance. |
| pl-nie-mialam-pojecia | pl | any | warn | `\bnie miał[ae]m pojęcia,? że\b` | Real people say it too. |
| pl-w-tej-chwili | pl | any | error | `\bw (tej\|tamtej) chwili (zrozumiał[ae]m\|wiedział[ae]m\|pojęł[ae]m\|dotarło do mnie)\b` | Explains instead of showing. |
| pl-fala | pl | any | error | `\bfala (ulgi\|paniki\|wstydu\|smutku\|złości\|gniewu)\b` | Emotion summary. |
| pl-serce | pl | any | error | `\bserce (mi )?(stanęło\|zamarło\|pękło\|waliło\|biło jak (szalone\|młot))\b` | Cliché. |
| pl-lzy | pl | any | error | `\błzy (płynęły\|spływały\|ciekły\|lały się) (po\|mi)\b` | Cliché. |
| pl-dreszcz | pl | any | error | `\bdreszcz (przeszedł\|przebiegł) (mi )?(po\|wzdłuż) (plecach\|kręgosłupa)\b` | Cliché. |
| pl-cisza | pl | any | error | `\b(ogłuszająca\|przytłaczająca\|grobowa) cisza\b` | Cliché. |
| pl-wszystko-sie-zmienilo | pl | any | error | `\b(wtedy )?wszystko się zmieniło\b\|\bnic (już )?nie było (już )?takie samo\b` | Announces the twist / summary. |
| pl-nie-moglam | pl | any | warn | `\bnie mogł[ae]m się powstrzymać\b` | Translationese. |
| pl-co-stalo-sie | pl | any | warn | `\bco (stało się\|się stało\|wydarzyło się) (potem\|później\|dalej)\b` | Machine clickbait. |
| pl-lekcja | pl | last | error | `\b(lekcja\|nauczył[ae]m się,? że\|nauczyło mnie\|nigdy nie zapominaj\|pamiętaj zawsze)\b` | Ends with a lesson. |
| pl-pogoda | pl | first | error | `\b(deszcz\|padało\|śnieg\|sypało\|słońce świeciło\|burza\|wiatr\|niebo\|chmury\|mgła\|mżawka)\b` | Opens with weather. |

### Arabic

Regex does not use `\b` (prefixes attach to words). Lint splits sentences on `.!?…؟`.

| id | lang | scope | level | regex | note |
|---|---|---|---|---|---|
| ar-lam-akun-aalam | ar | any | warn | `(لم أكن أعلم\|لم أكن أدري\|لم يخطر ببالي\|دون أن أدري)` | Announces the twist; real people use it too. |
| ar-fi-tilka-allahza | ar | any | error | `في (تلك\|هذه) اللحظة (أدركت\|فهمت\|عرفت\|علمت)` | Explains instead of showing. |
| ar-mawja | ar | any | error | `موجة من (الارتياح\|الذعر\|الخجل\|الحزن\|الغضب)` | Emotion summary. |
| ar-qalb | ar | any | error | `(توقف قلبي\|انكسر قلبي\|تحطم قلبي\|خفق قلبي بشدة\|قلبي ينبض بعنف)` | Cliché. |
| ar-dumue | ar | any | error | `(انهمرت\|سالت\|تدفقت\|انسابت) (دموعي\|الدموع)` | Cliché. |
| ar-qushaarira | ar | any | error | `قشعريرة (في\|سرت في) (جسدي\|ظهري)` | Cliché. |
| ar-samt | ar | any | error | `صمت (مطبق\|ثقيل\|قاتل\|رهيب)` | Cliché. |
| ar-taghayyar | ar | any | error | `(ثم \|و)?تغير كل شيء\|لم يعد شيء كما كان` | Announces the twist / summary. |
| ar-lam-astati | ar | any | warn | `لم أستطع (منع نفسي\|أن أمنع نفسي\|إلا أن)` | Translationese. |
| ar-ma-hadatha | ar | any | warn | `ما حدث (بعد ذلك\|بعدها\|لاحقا\|لاحقاً)` | Machine clickbait. |
| ar-dars | ar | last | error | `(الدرس\|تعلمت أن\|علمتني\|لا تنس أبدا\|لا تنسوا\|تذكروا دائما)` | Ends with a lesson. |
| ar-taqs | ar | first | error | `(المطر\|كانت تمطر\|الثلج\|أشعة الشمس\|الشمس مشرقة\|عاصفة\|الرياح\|السماء\|الغيوم\|الضباب)` | Opens with weather. |

## Structural checks lint counts itself (not regex)

`lint-output.py` counts these rules itself; thresholds come from `_stats.md`:

- CAPS runs (≥ 2 consecutive words, or 1 word of ≥ 3 letters standing alone before a period/exclamation mark): > 3 runs/post → warn (exemplar p90 = 1 in captions, 3 in comments).
- Paragraph too long → warn in caption/comment: threshold **2 sentences for narration paragraphs** (exemplars: 92% of narration paragraphs ≤ 2 sentences) and **3 sentences for dialogue paragraphs** (paragraphs starting with an opening quotation mark; exemplars: 94% of dialogue turns ≤ 3 sentences — natural dialogue runs longer than narration, and a shared 2-sentence threshold clashes with the `dialogue` rule requiring ≥ 10 dialogue turns/caption). Web relaxes to 5 sentences/paragraph and 10% of sentences > 30 words (`web-drama/references/part-structure.md`: inner-monologue scenes 3-5 sentences).
- Em dash `—` > 1 / 100 words → warn (machines overuse it; real exemplars use periods).
- Sentences > 30 words: > 5% of sentences → warn (exemplar p90 = 20 words).
- Share of sentences with first-person pronouns (`pov_pronouns` in the pack) < 25% → warn (exemplar corpus: p10 = 13%, p25 = 36%, p50 = 48%).
- Dialogue turns: caption < 8 → warn (corpus p25 = 10); comment < 4; web < 5.
