---
code: nl
language: Nederlands (Nederland)
lang_pack: nl
nationality: Dutch
status: untested
pov_pronouns: [ik, 'k, mij, me, mijn, m'n, mezelf, mijzelf]
# cta = sentence inside the post (caption/comment); reel-maker/lang/<code>.json is the ctaBar on the video — two different things, not synced
cta:
  caption: "Deel 2 staat in de eerste reactie."
  comment: "Het hele verhaal staat hier: {WEB_URL}"
currency_format: "2,3 miljoen euro"
part_word: Deel
quote_marks: ['"', '"']   # FB NL: straight quotes are standard; „…” only in books
---

# Country pack: NL

<!-- rules: data, no style rules. LOW confidence: no NL sample corpus. Sources: NL posts from the old toolkit
(output/*_NL_*, 4 stories) + general knowledge. The NL page is live: ask its writer for the 10 "translation tells"
they have been criticised for, add them to the last section, noting which post. -->

## Names by age × class

| Group | Working-class (female / male) | Well-off (female / male) |
|---|---|---|
| age 56-75 (born ~1950-69) | Ria, Gerda, Truus, Ans, Riet, Corrie, Nel, Annie, Dinie, Willy, Sjaan, Greet, Trees, Jannie, Marja, Ineke, Hennie, Elly, Lenie, Coby, Toos / Henk, Wim, Gerrit, Piet, Cor, Theo, Kees, Bertus, Harrie, Ton, Sjaak, Rinus, Jaap, Klaas, Freek, Bennie, Hans, Arie, Leo | Margriet, Josephine, Liesbeth, Machteld, Hermine, Cecile / Frederik, Reinier, Constantijn, Herman, Rutger, Aernout |
| age 36-55 (born ~1970-89) | Sandra, Chantal, Kim, Wendy, Monique, Linda, Bianca, Miranda, Esther, Jolanda, Natasja, Daniëlle, Petra, Angelique, Debbie, Vanessa, Cindy, Sonja, Yvonne, Karin, Ingrid, Saskia, Manon / Dennis, Patrick, Richard, Jeroen, Marco, Edwin, Sander, Michel, Erik, Ramon, Robert, Bas, Danny, Remco, Jurgen, Peter, Rob, Wesley, Mark, Rick, Barry, Ronald | Charlotte, Floor, Marjolein, Annemijn, Eveline, Willemijn / Floris, Sebastiaan, Diederik, Maurits, Reinout, Christiaan |
| ≤ 35 and children (born ~1990-2020) | Lisa, Sanne, Emma, Julia, Fenna, Tess, Britt, Noa, Amber, Lotte, Maud, Lynn, Nienke, Demi, Isa, Sophie, Eva, Anne, Iris, Jill, Kiki, Fleur, Jade, Naomi, Femke / Daan, Sem, Lucas, Finn, Jesse, Bram, Ruben, Thijs, Stijn, Milan, Luuk, Sven, Niek, Tim, Lars, Tygo, Mees, Cas, Dylan, Nick, Joep, Guus, Teun | Olivia, Isabella, Philippine, Quirine, Annabel, Eleonore, Cato / Olivier, Boudewijn, Willem, Pepijn, Casimir, Jurriaan |

Working-class surnames: de Vries, Jansen, de Jong, Bakker, Visser, Smit, van Dijk, Mulder, Meijer, Bos, Vos,
Peters, Hendriks, Dekker, Willems, van Leeuwen, Timmermans, van den Berg, van der Meer, Kuipers,
Brouwer, de Boer, Postma, Koster, Schouten, Molenaar, Prins, Huisman, Kramer, Veenstra, Jonker. Surnames that sound "moneyed": van Lynden, de Beaufort,
van Heemstra, Reuchlin, Dudok van Heel, Insinger.

<!-- Table expanded 2026-09-19 when the nl-radar-50 batch used up the 4 working-class girls' names in the first 11 posts.
A 50-post batch needs ≥ 10 names per cell; when short, writers take names outside the table and lint cannot block it.
Second expansion after 40 posts: the working-class pool ran dry, so parallel agents all grabbed the same basket of "unused" names
(Miranda 7 times, Tess/Nienke/Esther/Bianca/Amber 5). Large batches must ASSIGN names per slug, not let
each agent count and pick for itself.
Do NOT put names that double as common nouns or street-name parts (Jan, Frans, Job, Roos) in the table:
lint `name-outside-bible` would raise false errors on prose that has no such character. -->

## Places
- Small: Emmen, Heerlen, Almelo, Lelystad, Kerkrade, Den Helder, Spijkenisse, Hoogezand, Zaandam,
  Rotterdam-Zuid; "een flatje driehoog in Overvecht", "een portiekwoning in Charlois", "een rijtjeshuis in Almere Buiten".
- Large: Wassenaar, Blaricum, Laren, Aerdenhout, Bloemendaal, Amsterdam Oud-Zuid (Apollolaan), Naarden-Vesting,
  "het huis in Zeeland" (vakantiehuis).
- Addresses: "Meeuwenlaan 14, 3-hoog", postcode "7511 AB", kenteken "12-ABC-3", "de gemeente".

## Money
- Format: `2,3 miljoen euro`, `47,50 euro` or `€ 47,50`, `1.200 euro`; in dialogue "twaalfhonderd euro", "twee komma drie miljoen".
- Poor: 13 euro per uur, nachtdienst, sociale huurwoning 780 euro, huurtoeslag, zorgtoeslag, "ik stond rood",
  Voedselbank, schuldsanering, energierekening 310 euro, "de blauwe envelop".
- Rich: "een villa in Wassenaar", erfenis van 2,3 miljoen, aandelen in het familiebedrijf, notaris, beleggingspanden, "de zaak".
- Small change: OV-chipkaart opladen, statiegeld 15 cent, koffie 3,20, "een tientje", parkeerkaartje, "een euro voor het karretje".

## Institutions
- Health / end of life: huisarts (the first door, altijd), huisartsenpost, ziekenhuis, IC, verpleeghuis, hospice,
  thuiszorg, eigen risico 385 euro (18+ only; under-18s are insured for free with NO eigen risico — do not use a child's medical bills as a money motive), zorgverzekering, WMO, "de wijkverpleegkundige".
- Legal / notary / inheritance: notaris (verplicht: testament, huis kopen), verklaring van erfrecht, erfbelasting,
  legitieme portie (kind kan niet volledig onterfd worden), executeur, Kadaster.
- Marriage / divorce / custody: gemeentehuis/stadhuis (burgerlijk huwelijk verplicht), trouwambtenaar, samenlevingscontract,
  huwelijkse voorwaarden, scheiding via advocaat of mediator, ouderschapsplan (verplicht), co-ouderschap, kinderalimentatie, rechtbank.
- Banking / insurance / benefits: ING, Rabobank, ABN AMRO, betaalrekening, BKR-registratie, AOW, bijstand, kinderbijslag,
  toeslagen van de Belastingdienst, hypotheek, DigiD.
- Police / courts: politie, aangifte doen, wijkagent, rechtbank, kantonrechter, deurwaarder.

## Rituals
- Wedding: "trouwen op het stadhuis" is the main ceremony, kerk optional; daggasten vs avondgasten (evening guests only attend the party — being invited as an
  avondgast is an insulting detail), "de ceremoniemeester", "de speech", bruidstaart.
- Funeral: uitvaart, crematie more common than begrafenis, condoleance, rouwkaart, "koffie met cake" after the service, uitvaartverzekering (DELA, Monuta), "de kist".
- Inheritance: the notaris calls each person, no group "reading of the will"; verklaring van erfrecht; "de erfgenamen".
- Family occasions: Sinterklaas 5 december (pakjesavond, surprises, gedichten), Kerst = 1e en 2e Kerstdag (gourmetten, who brings what),
  Koningsdag, verjaardag: kringverjaardag, "gefeliciteerd" said to the whole family, jarige trakteert op werk; "koffie met één koekje".

## Common narrator jobs
verzorgende IG nachtdienst in het verpleeghuis, thuiszorgmedewerker, schoonmaakster, kassière bij Albert Heijn/Jumbo, vakkenvuller,
pedagogisch medewerker kinderopvang, kapster, postbezorger PostNL, orderpicker bij bol.com, uitzendkracht, buschauffeur, huishoudelijke hulp via de WMO.

Outside the care track (use these jobs so a batch is not monotonous — the first 30 posts of the nl-radar-50 batch had
8 verzorgende + 7 thuiszorg): pakketbezorger, heftruckchauffeur, productiemedewerker, medewerker
visverwerking, schoonmaker bij NS, beveiliger, glazenwasser, hovenier, stratenmaker, monteur,
loodgieter, taxichauffeur, marktkoopman, bakker, slager, kok in een bedrijfskantine, medewerker
kwekerij in het Westland, bollenpeller, naaister in een atelier, stukadoor, dakdekker, chauffeur op
de vuilniswagen, conciërge op een school, tramconducteur, callcentermedewerker, apothekersassistent,
onderwijsassistent, administratief medewerker bij de gemeente.

## Everyday objects
fiets met kapotte ketting, OV-chipkaart (old cards still work until the end of 2027, but from 1/7/2026 new anonymous cards can no longer be bought — in 2026 people mostly use OVpay with a betaalpas/mobiel), AH-tas, broodtrommel met boterhammen pindakaas, hagelslag, Kruidvat-tas, Ikea Billy,
Marktplaats-kinderwagen, Zeeman-jas, oude Opel Corsa, tweedehands Fiat Panda, de blauwe envelop van de Belastingdienst, boodschappenlijstje,
gourmetstel, verjaardagskalender op de wc, thermoskan koffie, kruidnoten, sloffen, de toeslagenbrief, het naamplaatje van de zorg, Hema-worst.

## Content taboos
- Zwarte Piet as a joke; WOII/NSB comparisons; Moroccan/Turkish Dutch people as villains by ethnicity; euthanasie as a joke;
  Groningen aardbevingen/toeslagenaffaire as a backdrop mocking the victims; religion (the bible belt) mocked.

## Translation tells (≥ 10)
1. Wrong u/je: mother-in-law and daughter-in-law use je/jij; "u" only with doctors, the notaris, older strangers. "U" to the daughter-in-law = DELIBERATE coldness.
2. "$", "dollar" slipping in → euro; "2.3 million" → 2,3 miljoen; "1,200" → 1.200 (dot for thousands, comma for decimals).
3. "Mom/Dad" → mam/pap (working-class), "mama/papa" a bit childish, "moeder/vader" cold; the schoonmoeder is called by first name.
4. Date "December 7" → 7 december (month in LOWER case); time "3 p.m." → 15.00 uur / "om drie uur"; "half three" = 2:30!
5. "Attorney/lawyer" for a will → notaris; advocaat/mediator for scheiding; there is no "reading of the will".
6. Church wedding as the main ceremony → the stadhuis/gemeentehuis is the real ceremony; "voor de kerk trouwen" is extra.
7. Thanksgiving, kalkoen, casserole → Kerst gourmetten, Sinterklaas pakjesavond, "kerstdiner bij schoonouders".
8. Miles, Fahrenheit, pounds → kilometer, graden, kilo.
9. Dialogue too standard → real people say "joh", "hè", "toch?", "gewoon", "nou ja", "echt niet", drop the subject ("Weet ik niet").
10. "Mrs. Jansen" → mevrouw Jansen (strangers only); within the family, first names.
11. "Hospital" for everything → huisarts first, then ziekenhuis / verpleeghuis / hospice are different places.
12. "Sheriff/officer" → politie, wijkagent; "court" → rechtbank, kantonrechter.
13. Address "1427 Maple St" → straatnaam + nummer, postcode of 4 digits and 2 letters.
14. Half-baked Dunglish: "ik was zo blessed", "ik had een breakdown" → "ik was er kapot van", "ik stortte in".
15. "Zij/hij" in every sentence → real people write "ze"; "zij" only for emphasis.
16. Long dash — → rare in Dutch; use a full stop or a comma.
17. Being invited as an avondgast, "koffie zonder koekje", sitting at "de kindertafel" → Dutch-style humiliating details, use instead of "the side table".

## Local FB banned words
`references/fb-banned-words.md` sections `lang: nl` and `all`.

## Native-check
`references/native-check.md`.
