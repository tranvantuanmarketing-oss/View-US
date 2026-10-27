const fs = require('fs');

console.log("=== Testing Full v11 Workflow ===");

const html = fs.readFileSync('index.html', 'utf8');
const engineJs = fs.readFileSync('studio_engine_v13.js', 'utf8');

// 1. Verify buildCompanionTxtContent output
const fnTxtMatch = engineJs.match(/function buildCompanionTxtContent\(story, safeFileName, pageRaw, tpl\) \{([\s\S]*?)\n  \}/);
if (!fnTxtMatch) throw new Error("Could not find buildCompanionTxtContent in engine!");

const buildCompanionTxtContent = new Function("story", "safeFileName", "pageRaw", "tpl", fnTxtMatch[1]);

const sampleStory = {
  author: "Élodie Laurent",
  page: "Vérités d'Hier",
  title: "L'expulsion pendant mon accouchement",
  content: "Pendant que j'accouchais de notre fille...",
  highlights: ["pendant que j'accouchais"],
  cta: "Lire la suite dans la légende",
  caption: "Ils attendaient sa mort depuis quinze ans dans leurs salons dorés... #paris #histoirevraie",
  comment1: "PARTIE 2: Julien souriait avec arrogance en brandissant un faux papier...",
  pinLink: "https://example.com/story-1"
};

const txtResult = buildCompanionTxtContent(sampleStory, "PT_dfd_edf_Video_01", "PT_dfd_edf", { label: "Thẻ vẹt" });
console.log("\n[TEST 1] Companion TXT output format:");
console.log("-----------------------------------------");
console.log(txtResult);
console.log("-----------------------------------------");

if (!txtResult.startsWith("Caption:\n") || !txtResult.includes("\n\nComment 1:\n")) {
  throw new Error("TXT file does not match expected format: 'Caption:\\n...\\n\\nComment 1:\\n...'");
}
if (txtResult.includes("BƯỚC 1") || txtResult.includes("BƯỚC 2") || txtResult.includes("THÔNG TIN XUẤT BẢN")) {
  throw new Error("TXT file contains unwanted guide clutter!");
}
console.log("✅ TEST 1 PASSED: TXT file strictly contains only Caption and Comment 1!");

// 2. Verify parseStories with user's Google Docs inline format (from Image 3)
const fnParseMatch = engineJs.match(/function parseStories\(text\) \{([\s\S]*?)\n  \}/);
if (!fnParseMatch) throw new Error("Could not find parseStories in engine!");

const tenXuat = () => "Vérités d'Hier";
const studioPageName = { value: "Vérités d'Hier" };
const studioAuthorName = { value: "@elodie" };
const parseStories = new Function("text", "tenXuat", "studioPageName", "studioAuthorName", fnParseMatch[1]);

const userRawText = `=== STORY 1 === Tác giả: Élodie Laurent Thời gian: 2h ago Tên Page: Vérités d'Hier Tiêu đề: L'expulsion pendant mon accouchement Nội dung thẻ: Pendant que j'accouchais de notre fille sous anesthésie d'urgence, mon mari a changé les serrures de notre appartement parisien. À mon réveil, j'ai trouvé mes valises abandonnées dans le couloir de la clinique avec une enveloppe de deux cents euros. « Ma mère a besoin de ce logement, trouve un hôtel », disait son message vocal. Dix mois plus tard, il a débarqué en larmes devant mon nouveau cabinet d'avocate pour réclamer la garde. Mais il ignorait que l'acte de propriété qu'il croyait avoir signé n'avait jamais été à son nom... Highlights: "pendant que j'accouchais de notre fille" | "trouve un hôtel!" | n'avait jamais été à son nom... Nút CTA: Lire la suite dans la légende Caption: Ils attendaient sa mort depuis quinze ans dans leurs salons dorés sans jamais lui avoir rendu một seule visite. Ils croyaient récupérer un manoir estimé à dix-huit millions d'euros... La révélation fatidique dans le premier commentaire 👇 #dramadefamille #histoirevraie #trahison #paris Comment 1: PARTIE 2: Julien souriait avec arrogance en brandissant un faux papier de cession signé pendant que j'étais sous morphine. Mais il ignorait que cet appartement avait été acheté via une fiducie familiale protégée par mon grand-père, ancien magistrat à la Cour de cassation. Quand l'huissier de justice et deux officiers de police lui ont signifié qu'il occupait illégalement les lieux depuis trois cents jours avec une dette locative de 120 000 euros, son visage est devenu livide...
=== STORY 2 === Tác giả: Marc Delacroix Thời gian: 4h ago Tên Page: Vérités d'Hier Tiêu đề: Le testament du vignoble bordelais Nội dung thẻ: Le jour des obsèques de mon père, mon frère aîné m'a tendu un chèque de cinq cents euros devant les vignes familiales. « Papa savait que tu n'étais qu'un bon à rien, signe ce renoncement et pars », a-t-il ricané devant sa femme. Pendant douze ans, j'avais taillé chaque cep de vigne pendant qu'il dilapidait les comptes à Monaco. J'ai refusé de prendre son chèque et j'ai sorti la clé en laiton que mon père m'avait glissée avant son dernier souffle. Le coffre de la cave ne contenait ni argent, ni titres de propriété, mais un dossier qui allait ruiner sa vie... Highlights: "un chèque de cinq cents euros" | "dilapidait les comptes à Monaco" | un dossier qui allait ruiner sa vie... Nút CTA: Lire la suite dans la légende Caption: Mon frère pensait m'écarter du domaine familial de quarante hectares avec une aumône insultante. Mais lorsque le notaire a brisé le sceau de cire sous la voûte du domaine, le véritable héritier a été proclamé... Découvrez le secret dans le premier commentaire 👇 #heritage #famille #bordeaux #revanche Comment 1: PARTIE 2: Ce dossier contenait les relevés bancaires secrets prouvant que mon frère avait contracté une hypothèque frauduleuse de 1,8 million d'euros sur le domaine en falsifiant la signature de notre père mourant. Quand le notaire de famille a lu le codicille enregistré deux jours avant le décès, désignant l'exploitation comme inaliénable et placée sous ma gestion exclusive, mon frère s'est effondré à genoux dans la poussière du chai...`;

const parsed = parseStories(userRawText, tenXuat, studioPageName, studioAuthorName);
console.log(`\n[TEST 2] Parsing user's Google Docs text (Stories parsed: ${parsed.length}):`);
if (parsed.length !== 2) throw new Error(`Expected 2 stories parsed, got ${parsed.length}`);

console.log("Story 1 Author:", parsed[0].author);
console.log("Story 1 Page:", parsed[0].page);
console.log("Story 1 Title:", parsed[0].title);
console.log("Story 1 Highlights:", parsed[0].highlights);
console.log("Story 1 CTA:", parsed[0].cta);
console.log("Story 1 Caption preview:", parsed[0].caption.slice(0, 60) + "...");
console.log("Story 1 Comment 1 preview:", parsed[0].comment1.slice(0, 60) + "...");

if (parsed[0].author !== "Élodie Laurent") throw new Error("Parsed author mismatch!");
if (parsed[0].title !== "L'expulsion pendant mon accouchement") throw new Error("Parsed title mismatch!");
if (!parsed[0].caption.includes("#paris")) throw new Error("Parsed caption missing hashtags!");
if (!parsed[0].comment1.includes("PARTIE 2:")) throw new Error("Parsed comment 1 missing PARTIE 2!");

console.log("✅ TEST 2 PASSED: Universal parser recognized Google Docs continuous text flawlessly!");

// 3. Verify Single Mode Plan Guarantee
const fnPlanMatch = engineJs.match(/function buildBatchTemplatePlan\(count\) \{([\s\S]*?)\n  \}/);
if (!fnPlanMatch) throw new Error("Could not find buildBatchTemplatePlan in engine!");

let currentStudioMode = "single";
let studioLockedTemplateIdx = 12;
const MAU = JSON.parse(html.match(/<script id="mau-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const state = MAU.map(() => ({ pal: 0, picked: false }));
const windowMock = { TPL_METAS: JSON.parse(html.match(/window\.TPL_METAS\s*=\s*(\[[\s\S]*?\]);/)[1]) };

function getTemplateObj(idx) {
  const m = MAU[idx];
  return {
    index: idx,
    id: m.id,
    label: m.label
  };
}
function getPickedTemplates() {
  return [];
}

const buildPlan = new Function("count", "getTemplateObj", "getPickedTemplates", "currentStudioMode", "studioLockedTemplateIdx", "var batchTemplatePlan = [];\n" + fnPlanMatch[1].replace(/return;/g, "return batchTemplatePlan;"));

const planResult = buildPlan(15, getTemplateObj, getPickedTemplates, "single", 12);
console.log(`\n[TEST 3] Batch Template Plan for 15 videos (mode: single, locked: 12):`);
console.log(`Plan length: ${planResult.length}`);
const allSame = planResult.every(t => t.index === 12);
console.log(`Are all 15 templates exactly template #12? ${allSame}`);
if (!allSame || planResult.length !== 15) throw new Error("Plan is not 100% uniform!");

console.log("✅ TEST 3 PASSED: 100% of batch videos are strictly locked to the chosen template!");

console.log("\n=======================================================");
console.log("🎉 ALL TESTS PASSED WITH 100% PERFECTION!");
console.log("=======================================================");
