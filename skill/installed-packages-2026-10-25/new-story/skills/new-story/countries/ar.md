---
code: ar
language: العربية — عامية مصرية (Egyptian FB posts); فصحى مبسطة only when the page targets the whole Arab world
lang_pack: ar
nationality: Egyptian
status: untested
pov_pronouns: [أنا, لي, ليّ, معي, معايا, عندي, نفسي, بي, بيا, عليا, إليّ, مني, لديّ]
pov_min_ratio: 0.05   # first person is attached to verbs/nouns (ـت، ـي); lint counts only standalone forms, so the threshold is just a minimum floor
# cta = sentence inside the post (caption/comment); reel-maker/lang/<code>.json is the ctaBar on the video — two different things, not synced
cta:
  caption: "الجزء الثاني في أول تعليق."
  comment: "القصة كاملة هنا: {WEB_URL}"
currency_format: "2.3 مليون جنيه"
part_word: الجزء
quote_marks: ['"', '"']
---

# Country pack: AR (Egypt)

<!-- rules: data, no style rules. LOW confidence: no page yet, no sample corpus. Egypt chosen as the largest Arabic-speaking
FB audience; real Egyptian story pages write entirely in عامية, so both narration and dialogue are عامية مصرية. The Gulf (ar-sa: ريال،
عباية، الكفيل) and the Maghreb are separate packs. Right-to-left script: lint splits sentences on
"؟" and ".", counts standalone pronouns; reel-maker has not been checked for RTL — note the limitation in the README. Digits: use 0-9 consistently (Egyptian FB uses both). -->

## Names by age × class

| Group | Working-class (female / male) | Well-off (female / male) |
|---|---|---|
| age 56-75 (born ~1950-69) | فاطمة, سعدية, نعمات, زينب / محمود, سيد, عبد الرحمن, رمضان | سميرة, ليلى, نادية / كمال, شريف, عادل |
| age 36-55 (born ~1970-89) | منى, هالة, أمل, سماح / أحمد, محمد, حسن, علي | نهى, دينا, رانيا / خالد, طارق, عمرو |
| ≤ 35 and children (born ~1990-2020) | نور, ملك, حبيبة, جنى / يوسف, عمر, آدم, مالك | فريدة, تاليا, ليان / سيف, زين, كريم |

Kunya: older working-class women are called "أم محمد" (mother of the eldest son), "الحاجة فاطمة"; men "الحاج", "أبو أحمد".
Working-class surnames: عبد العال, الشيخ, إبراهيم, حسنين, عثمان, سليم. Surnames that sound "moneyed": أباظة, الألفي, راغب, الشوربجي, البرلسي, عز الدين.

## Places
- Small: شبرا, إمبابة, المطرية, بولاق الدكرور, المحلة, شبين الكوم, كفر الشيخ, دمنهور, المنيا, الحوامدية;
  "شقة في الدور الرابع من غير أسانسير", "الحارة اللي ورا الجامع", "بيت العيلة في البلد".
- Large: التجمع الخامس, الشيخ زايد, الزمالك, المعادي, مدينتي, الساحل الشمالي (مارينا), المهندسين, "فيلا في بالم هيلز".
- Addresses: "شارع النيل، عمارة 14، الدور الثالث", "الحي", "المركز" (rural), "القسم".

## Money
- Format: `2.3 مليون جنيه`, `47.50 جنيه`, `1200 جنيه`; in dialogue "ألف ومتين", "مليونين وتلتمية ألف"; فصحى: "مليونان وثلاثمائة ألف".
- Poor: مرتب 4000 جنيه, "شغل باليومية", إيجار 2500, فاتورة الكهربا 600, بطاقة التموين, "الجمعية" (rotating savings circle — very Egyptian), "السلف", "دين البقال", تكافل وكرامة.
- Rich: "فيلا في التجمع", ميراث 23 مليون, "الشركة", "الأراضي", "المحامي بتاعه", مرسيدس, "شاليه في الساحل", "ودايع في البنك".
- Small change: كوباية شاي بـ 5 جنيه, المواصلات 10 جنيه, العيش المدعم, "فكة", "خمسين جنيه في الشنطة", فودافون كاش.

## Institutions
- Health / end of life: المستشفى الحكومي, قصر العيني, مستشفى خاص, العناية المركزة, "الدكتور", الممرضة, التأمين الصحي, "دار المسنين" (putting mum there = shameful), "الرعاية في البيت".
- Legal / notary / inheritance: الشهر العقاري (registration, توثيق), المحامي, "إعلام الوراثة" (procedure), "القسمة", الوصية (at most 1/3 of the estate under شريعة),
  "الأنصبة الشرعية" (a daughter = half a son), التوكيل (power of attorney — classic fraud motif), "التنازل" (sisters forced to sign away their share), عقد البيع, "المحضر".
- Marriage / divorce / custody: "كتب الكتاب" (contract, المأذون), "الفرح" (party), المهر, الشبكة (gold), "قايمة المنقولات" (list of furnishings — textbook drama),
  الطلاق (husband unilaterally, "طلقني شفهي"), الخلع (wife-initiated), النفقة, الحضانة (mother by default until 15), محكمة الأسرة, العدة.
- Banking / insurance / benefits: بنك مصر, البنك الأهلي, شهادات, الجمعية, فودافون كاش, المعاش, تكافل وكرامة, التموين.
- Police / courts: القسم, "عمل محضر", النيابة, المحكمة, الظابط, "الحكم".

## Rituals
- Wedding: كتب الكتاب (at home/جامع), الشبكة, الفرح in a قاعة or الشارع (working-class), الزفة, النقوط (gift money written in a book), الصباحية (mother-in-law visits the next morning), "الشقة على اسم مين".
- Funeral: العزاء 3 days (صوان for men, women at home), الدفن the same day, القرآن, الأربعين, السنوية, الحداد, "قراءة الفاتحة".
- Inheritance: إعلام الوراثة at المحكمة, القسمة at الشهر العقاري; textbook drama: "عمي أخد الأرض", "أخويا خلاني أمضي على تنازل", "الشقة باسم مراته".
- Family occasions: رمضان (الإفطار عند ماما, السحور, "طبق من عند الجيران"), عيد الفطر (العيدية, الكحك — who makes it), عيد الأضحى (الذبيحة, توزيع اللحم),
  "الخميس" family gathering, شم النسيم, المولد, "جمعة العيلة".

## Common narrator jobs
ممرضة نوبتجية ليل, عاملة نظافة, "شغالة" (stigmatised — use deliberately), بائعة في سوبر ماركت, مدرّسة بتدي دروس خصوصية, خياطة في البيت, كوافيرة,
موظفة حكومة بمرتب 3000, عاملة في مصنع الملابس, عاملة في مطعم, مربية في حضانة, "بتبيع على الفيسبوك".

## Everyday objects
الجلابية, الإيشارب, الطرحة, الشنطة البلاستيك, كوباية الشاي, الفول والطعمية, العيش البلدي, بطاقة التموين, الميكروباص, التوك توك, الحلة, البوتاجاز,
دفتر الجمعية, الموبايل القديم بشاشة مكسورة, البطانية, الفانوس, الكحك, دبلة الجواز, علبة الحلاوة الطحينية, ورقة التوكيل, الملاية, "طبق المحشي", "الشبشب".

## Content taboos
- Religion (إسلام/مسيحية) mocked, or Copt-Muslim tension as the plot; الجيش, الرئيس, السياسة, ثورة يناير, الإخوان (real danger to the page);
  "جرائم الشرف" as sensationalism; الجنس; ألفاظ; الصعايدة stereotypes; الفلاحين mocked.

## Translation tells (≥ 10)
1. "أنا" opening every sentence → Arabic attaches the first person to the verb (رحت، قلت، شفت); "أنا" only for emphasis. Lint counts only standalone forms, the 5 % threshold is a floor; the writer checks by hand.
2. "Mrs. X" → "مدام منى" (urban), "الحاجة" (older, respectful), "أم محمد" (kunya); men "الأستاذ", "الحاج".
3. "$" → جنيه; "$2.3 million" → 2.3 مليون جنيه; the Gulf (ريال، درهم) is a separate pack.
4. "Christmas/Thanksgiving" → رمضان, العيد, الخميس; "بابا نويل" only for Copts and the urban class.
5. Mother-in-law: narrate "حماتي"; address directly "يا ماما" (close), "يا حاجة"/"يا مدام" (cold), "أم [husband's name]" (traditional).
6. Plot "the will leaves everything to one person" → impossible: الوصية is at most 1/3, the rest is split by fixed shares; the real drama is a forced التنازل, الأرض, a fake التوكيل.
7. "Reading of the will" → إعلام الوراثة at المحكمة, القسمة; "المحامي قرا الوصية" reads as translated.
8. Divorce: the husband says "طلّقني" verbally, then "ورقة"; the wife "رفعت خلع"; حضانة defaults to the mother; "بيت الطاعة" is old-style drama.
9. Wedding: كتب الكتاب (contract) and الفرح (party) are two separate days; الشبكة, القايمة, "الشقة باسم مين" are identifying details.
10. Date "December 7" → 7 ديسمبر; time "3 p.m." → الساعة 3 العصر / "الساعة تلاتة"; digits 0-9 consistently across the post.
11. "?" → "؟"; "," → "،"; semicolon "؛". Lint splits sentences on "؟".
12. Narrating in bookish فصحى ("قالت لي", "ذهبت", "لم أكن") → Egyptian FB posts narrate in عامية ("قالتلي", "رحت", "مكنتش"); فصحى only for a pan-Arab page. Dialogue: "إيه", "مش", "عايزة", "خلاص", "يا ستي", "معلش", "طب".
13. "Nursing home" → دار المسنين is shameful; "hospice" does not exist → "المستشفى", "في البيت"; "ER" → الطوارئ/الاستقبال.
14. "Police officer/sheriff" → الظابط, القسم, "عملت محضر".
15. Miles → كيلومتر; pounds (weight) → كيلو; "pounds" as money → جنيه.
16. "Aunt/uncle" → عمتي/خالتي, عمي/خالي (the father's side has inheritance rights; "عمي" is the classic villain).
17. No "الحمد لله", "إن شاء الله", "ربنا يستر", "يا رب" in dialogue → translation tell; real people say them naturally, without explanation.
18. English names ("Jessica", "Tyler") → see the table; "سارة", "آدم", "يوسف" exist on both sides.

## Local FB banned words
`references/fb-banned-words.md` sections `lang: ar` and `all`.

## Native-check
`references/native-check.md`.
