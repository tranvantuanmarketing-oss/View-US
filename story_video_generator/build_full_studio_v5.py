import os, json, re

print("Starting build_full_studio_v5.py...")

# 1. Read base competitor template
with open('kho-mau-v1.6.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# 2. Extract MAU data & Assets
m_mau = re.search(r'<script id="mau-data"[^>]*>(.*?)</script>', html, re.S)
mau_data = json.loads(m_mau.group(1))

m_asset = re.search(r'<script id="asset-data"[^>]*>(.*?)</script>', html, re.S)
asset_data = json.loads(m_asset.group(1))

# Extract all templates and their palettes' CSS variables and metadata
templates_info = []
for idx, m in enumerate(mau_data):
    pals_info = []
    for p_idx, pal in enumerate(m["pals"]):
        p_html = pal["html"]
        vars_found = dict(re.findall(r'--([a-zA-Z0-9_-]+):\s*([^;}]+)', p_html))
        pals_info.append({
            "id": pal["id"],
            "vars": vars_found
        })
    templates_info.append({
        "index": idx,
        "id": m["id"],
        "label": m["label"],
        "ho": m.get("ho", "khac"),
        "pals": pals_info
    })

bg_files = sorted([f for f in os.listdir('assets/backgrounds') if f.endswith('.mp4')])
avatar_files = sorted([f for f in os.listdir('assets/avatars') if f.lower().endswith(('.jpg', '.png', '.jpeg'))])

# 3. Read sample stories
sample_stories_fr = ""
if os.path.exists('batch_30_stories.txt'):
    with open('batch_30_stories.txt', 'r', encoding='utf-8') as f:
        sample_stories_fr = f.read()

# Multi-language sample story templates
stories_by_country = {
    "us": """=== STORY 1 ===
Author: Emily Vance
Page: Daily Confessions
Time: 3h ago
Title: The girl twenty families turned down
Content:
I adopted the little girl that twenty families had rejected alone.
Her medical diagnosis scared everyone away. "You have time to think about this, sir."
I signed the adoption papers in less than four minutes.
She was eleven months old. On our first night I whispered: "We're doing this together, okay?"
Ten years went by. She walked, she read, she laughed out loud.
Then Greg, whom I hadn't seen since the adoption, showed up at our front door claiming her inheritance...
Highlights: "You have time to think about this, sir." | "We're doing this together, okay?" | claiming her inheritance...
CTA: Read Full Story In Comments
Link: https://example.com/us/story-1

=== STORY 2 ===
Author: Robert Miller
Page: Hidden Realities
Time: 5h ago
Title: Two sleeping boys in my office
Content:
Two boys were asleep in my armchair when I arrived at the office early Monday morning.
It was seven-ten and the hallways were still pitch black. "They came with a lady, sir," the security guard whispered.
I pulled up a chair opposite them: "Let them sleep."
In the older boy's coat pocket, I found a sealed envelope with my first name written in purple ink.
One year later, I opened that letter before my attorney and learned who their mother truly was...
Highlights: "They came with a lady, sir." | "Let them sleep." | who their mother truly was...
CTA: Read Full Story In Comments
Link: https://example.com/us/story-2

=== STORY 3 ===
Author: Sarah Jenkins
Page: Silent Tears
Time: 2h ago
Title: The yellow envelope after surgery
Content:
On the fourth day after my surgery, my mother-in-law dropped a thick folder in front of me.
My newborn daughter was sleeping peacefully in the next room.
"Just sign this right now and don't ask questions," she ordered coldly.
When I pulled my hand away, she pulled out a stained yellow envelope with my late mother's handwritten letters...
Highlights: "Just sign this right now and don't ask questions" | my late mother's handwritten letters...
CTA: Read Full Story In Comments
Link: https://example.com/us/story-3

=== STORY 4 ===
Author: Thomas Cole
Page: Dark Whispers
Time: 4h ago
Title: The key in grandfather's coat
Content:
My grandfather strictly forbade anyone from unlocking the attic door for over forty years.
On the evening of his funeral, I discovered an antique brass key sewn into the inner lining of his winter coat.
What I uncovered in that attic beneath the floorboards changed the entire history of our family forever...
Highlights: strictly forbade anyone | antique brass key | changed the entire history of our family
CTA: Read Full Story In Comments
Link: https://example.com/us/story-4

=== STORY 5 ===
Author: Jessica Taylor
Page: Untold Secrets
Time: 1h ago
Title: The divorce papers in intensive care
Content:
My husband served me divorce papers while I was still attached to the oxygen ventilator in ICU.
I had just given birth to our premature twins. "Let's get this settled before she wakes up," he told his lawyer outside.
I opened my eyes two days later: "Give me the pen."
I signed with my left hand without shedding a single tear.
One month later, the probate court opened my grandfather's trust fund, and my ex-husband realized his irreversible mistake...
Highlights: "Let's get this settled before she wakes up" | without shedding a single tear | his irreversible mistake...
CTA: Read Full Story In Comments
Link: https://example.com/us/story-5""",

    "fr": sample_stories_fr if sample_stories_fr else """=== STORY 1 ===
Tác giả: Franck Meynard
Thời gian: Il y a 1 h
Tên Page: Vérités d'Hier
Tiêu đề: Vingt familles avaient dit non. Dix ans plus tard...
Nội dung thẻ:
J'ai adopté seul la petite que vingt familles avaient refusée.
Son diagnostic faisait reculer tout le monde. « Vous avez le temps de réfléchir, monsieur. »
J'ai signé les pages en moins de quatre minutes.
Elle avait onze mois. Je lui ai dit le premier soir : « On y va ensemble, d'accord ? »
Dix ans ont passé. Elle marchait, elle lisait, elle riait fort. Puis Greg, que je n'avais pas revu depuis, s'est présenté devant chez nous.
Trois mois plus tard, l'avocate a ressorti le dossier d'abandon et il a compris ce qu'il avait signé...
Highlights: « Vous avez le temps de réfléchir, monsieur. » | « On y va ensemble, d'accord ? » | il a compris ce qu'il avait signé...
Nút CTA: Continuer la lecture dans les commentaires
Link: https://example.com/fr/histoire-1

=== STORY 2 ===
Tác giả: Julien Tardieu
Thời gian: Il y a 3 h
Tên Page: Masques Tombés
Tiêu đề: Deux enfants abandonnés dans mon bureau à sept heures du matin...
Nội dung thẻ:
Deux garçons dormaient dans mon fauteuil quand je suis entré au bureau.
Il était sept heures dix et les couloirs étaient encore déserts. « Ils sont arrivés avec une dame, monsieur. » Le gardien parlait tout bas.
Je me suis assis en face d'eux : « Laissez-les dormir. »
Dans la poche du plus grand, il y avait une lettre pliée avec mon prénom écrit à l'encre violette.
Un an plus tard, j'ai ouvert cette lettre devant mon notaire et j'ai appris qui était leur mère...
Highlights: « Ils sont arrivés với une dame, monsieur. » | « Laissez-les dormir. » | j'ai appris qui était leur mère...
Nút CTA: Continuer la lecture dans les commentaires
Link: https://example.com/fr/histoire-2""",

    "nl": """=== STORY 1 ===
Author: Sanne de Vries
Page: Stille Verhalen
Time: 3 uur geleden
Title: Het geheim achter de gesloten deur
Content:
Vier dagen na de operatie legde mijn schoonmoeder een stapel papieren voor me neer.
Mijn dochtertje sliep rustig in de kamer ernaast.
"Teken dit gewoon en vraag niets," zei ze koud.
Toen ik weigerde, trok ze een vergeelde envelop tevoorschijn met het handschrift van mijn overleden moeder.
Highlights: "Teken dit gewoon en vraag niets" | het handschrift van mijn overleden moeder
CTA: Lees meer in de reacties
Link: https://example.com/nl/verhaal-1

=== STORY 2 ===
Author: Jan van Dijk
Page: Verborgen Tranen
Time: 5 uur geleden
Title: Het kind dat twintig families weigerden
Content:
Ik adopteerde alleen het meisje dat door twintig families was afgewezen.
Iedereen deinsde terug voor haar medische dossier.
Maar ik tekende binnen enkele minuten. Nu, tien jaar later, staat haar biologische vader plotseling voor mijn voordeur...
Highlights: "Binnen enkele minuten getekend" | biologische vader voor mijn voordeur
CTA: Lees meer in de reacties
Link: https://example.com/nl/verhaal-2""",

    "de": """=== STORY 1 ===
Author: Anna Schmidt
Page: Wahre Geschichten
Time: vor 3 Std.
Title: Das Geheimnis meiner Schwiegermutter
Content:
Vier Tage nach der Operation legte meine Schwiegermutter einen Stapel Dokumente vor mich hin.
Meine Tochter schlief im Nebenzimmer.
„Unterschreib das einfach und stell keine Fragen“, sagte sie kalt.
Als ich mich weigerte, holte sie einen vergilbten Umschlag mit der Handschrift meiner verstorbenen Mutter hervor.
Highlights: „Unterschreib das einfach und stell keine Fragen“ | Handschrift meiner verstorbenen Mutter
CTA: Weiterlesen im ersten Kommentar
Link: https://example.com/de/geschichte-1""",

    "es": """=== STORY 1 ===
Author: Mateo Hernandez
Page: Historias del Alma
Time: hace 3 h
Title: El secreto de mi suegra
Content:
Al cuarto día de la operación, mi suegra puso una carpeta frente a mí.
Mi hija dormía en la habitación contigua.
«Firma esto sin hacer preguntas», me ordenó con frialdad.
Cuando me negué, sacó un viejo sobre amarillento con la letra de mi difunta madre.
Highlights: «Firma esto sin hacer preguntas» | la letra de mi difunta madre
CTA: Leer más en el primer comentario
Link: https://example.com/es/historia-1""",

    "vi": """=== STORY 1 ===
Tác giả: Minh Tuấn
Tên Page: Góc Nhìn Cuộc Sống
Thời gian: 3 giờ trước
Tiêu đề: Đứa trẻ bị 20 gia đình từ chối
Nội dung thẻ:
Tôi một mình nhận nuôi đứa bé mà hai mươi gia đình trước đó đều lắc đầu từ chối.
Hồ sơ bệnh án của con bé khiến ai cũng chùn bước.
Nhưng tôi đã ký vào giấy nhận nuôi chỉ trong chưa đầy bốn phút.
Mười năm trôi qua bình yên, cho đến buổi chiều hôm qua khi người đàn ông ấy xuất hiện trước cổng...
Highlights: chưa đầy bốn phút | người đàn ông ấy xuất hiện trước cổng
Nút CTA: Bấm link để đọc tiếp truyện
Link: https://example.com/vi/truyen-1"""
}

# 4. Custom CSS: TOOL INTERFACE BACKGROUND USING CANOPY SUNLIGHT IMAGE
canopy_tool_css = """
/* === CANOPY SUNLIGHT FOREST THEME & MODERN GLASSMORPHISM === */
:root {
  --w: 200;
  --bg: #0c1410;
  --card: #151e18;
  --line: #2d4536;
  --ink: #f0fdf4;
  --dim: #a7f3d0;
  --acc: #10b981;
  --canopy-emerald: #10b981;
  --canopy-purple: #8b5cf6;
  --canopy-glow: rgba(16, 185, 129, 0.3);
}

body {
  background-color: #0a130e !important;
  background-image: 
    linear-gradient(180deg, rgba(10, 19, 14, 0.88) 0%, rgba(15, 12, 28, 0.92) 100%),
    radial-gradient(circle at 25% 15%, rgba(52, 211, 153, 0.16) 0%, transparent 55%),
    radial-gradient(circle at 80% 85%, rgba(139, 92, 246, 0.16) 0%, transparent 55%),
    url('assets/bg_canopy.jpg') !important;
  background-size: cover !important;
  background-attachment: fixed !important;
  background-position: center !important;
  background-blend-mode: normal, normal, normal, overlay !important;
  color: #f0fdf4 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif !important;
}

header {
  background: rgba(12, 22, 17, 0.94) !important;
  backdrop-filter: blur(16px) !important;
  border-bottom: 1px solid rgba(52, 211, 153, 0.3) !important;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.5) !important;
}

aside#side {
  background: rgba(14, 25, 20, 0.85) !important;
  backdrop-filter: blur(14px) !important;
  border-right: 1px solid rgba(52, 211, 153, 0.25) !important;
}

.card {
  background: rgba(18, 30, 24, 0.88) !important;
  border: 1px solid rgba(52, 211, 153, 0.25) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 14px !important;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.card:hover {
  border-color: #34d399 !important;
  box-shadow: 0 8px 30px rgba(52, 211, 153, 0.35) !important;
  transform: translateY(-2px) !important;
}

.card.picked {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 2px #10b981, 0 8px 30px rgba(16, 185, 129, 0.5) !important;
  background: rgba(16, 44, 30, 0.95) !important;
}

button.act, .act {
  background: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%) !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4) !important;
  transition: all 0.2s ease !important;
}

button.act:hover, .act:hover {
  box-shadow: 0 6px 22px rgba(139, 92, 246, 0.6) !important;
  transform: translateY(-1px) !important;
}

button.ghost {
  background: rgba(52, 211, 153, 0.12) !important;
  color: #a7f3d0 !important;
  border: 1px solid rgba(52, 211, 153, 0.3) !important;
}

button.ghost:hover {
  background: rgba(52, 211, 153, 0.22) !important;
  border-color: #34d399 !important;
}

/* FLOATING GEN BAR */
#floatingGenBar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  background: rgba(12, 24, 18, 0.96);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(52, 211, 153, 0.6);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.4);
  border-radius: 999px;
  padding: 10px 28px;
  display: flex;
  align-items: center;
  gap: 18px;
  animation: floatUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes floatUp {
  from { transform: translate(-50%, 25px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}

/* STUDIO MODAL STYLING */
#studioModal {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(8, 14, 11, 0.9);
  backdrop-filter: blur(18px);
  justify-content: center;
  align-items: center;
  padding: 16px;
}
.studio-box {
  width: 1480px;
  max-width: 96vw;
  height: 94vh;
  background: #0f1a14;
  border: 1px solid rgba(52, 211, 153, 0.35);
  box-shadow: 0 25px 80px rgba(0,0,0,0.85), 0 0 45px rgba(16, 185, 129, 0.3);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.studio-header {
  padding: 14px 24px;
  background: rgba(14, 26, 20, 0.98);
  border-bottom: 1px solid rgba(52, 211, 153, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.studio-body {
  display: grid;
  grid-template-columns: 1fr 470px;
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
}
.btn-preset-count {
  background: rgba(52, 211, 153, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.35);
  color: #a7f3d0;
  border-radius: 8px;
  padding: 5px 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-preset-count.active {
  background: linear-gradient(135deg, #10b981, #8b5cf6);
  color: #fff;
  border-color: #34d399;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);
}
"""

html = html.replace("<title>Kho mẫu reel — dựng cấu hình page</title>", f"<title>Việt Reels Studio Pro — Tạo Video Tự Động</title>\n<style>\n{canopy_tool_css}\n</style>", 1)

# 5. Header replacement
new_header_html = f"""<header style="background: rgba(14, 25, 20, 0.95); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(52, 211, 153, 0.3); padding: 10px 24px; display: flex; align-items: center; gap: 16px;">
  <div style="display: flex; align-items: center; gap: 10px;">
    <span style="font-size: 26px;">🌲</span>
    <div>
      <h1 style="margin: 0; font-size: 18px; font-weight: 800; background: linear-gradient(135deg, #34d399, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        VIỆT REELS STUDIO PRO
      </h1>
      <div style="font-size: 11px; color: #a7f3d0; margin-top: 1px;">Hệ thống chọn mẫu màn hình & Gen video hàng loạt tự động</div>
    </div>
  </div>
  <span style="flex: 1"></span>
  <button class="ghost" id="btnHd" style="border-radius: 8px; padding: 6px 14px; font-size: 13px;">📖 Hướng dẫn</button>
  <button class="ghost" id="btnGu" style="border-radius: 8px; padding: 6px 14px; font-size: 13px;">🎵 Gu nhạc</button>
  <button class="ghost" id="btnNen" style="border-radius: 8px; padding: 6px 14px; font-size: 13px;">🎬 Kho video nền ({len(bg_files)} clip)</button>
  <button class="act" id="btnMoStudio" style="background: linear-gradient(135deg, #10b981, #8b5cf6) !important; border-radius: 10px; padding: 8px 22px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 18px rgba(16, 185, 129, 0.4); display: flex; align-items: center; gap: 8px;">
    👉 SANG BƯỚC GEN VIDEO (<span id="headerPickCount">0</span>)
  </button>
  <div style="display: none;">
    <input id="pTen" value="">
    <input id="pNv" value="">
    <select id="pLang"></select>
    <span id="tenXuat"></span>
    <button id="btnTao"></button>
    <button id="btnTao2"></button>
  </div>
</header>"""

html = re.sub(r'<header>.*?</header>', new_header_html, html, flags=re.S, count=1)

# 6. Upgraded Kho Nền Dialog with 35 Real Video Clips
upgraded_dlg_nen = f"""
<dialog id="dlgNen" style="background: #0f1c15; color: #f0fdf4; border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 16px; padding: 22px; max-width: 1080px; width: 92vw; box-shadow: 0 20px 60px rgba(0,0,0,0.8);">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(52, 211, 153, 0.25); padding-bottom: 12px;">
    <div>
      <h3 style="margin: 0; font-size: 20px; color: #fff; display: flex; align-items: center; gap: 8px;">
        🎬 Kho Clip Nền Video Reels & Story
        <span style="font-size: 12px; background: linear-gradient(135deg, #10b981, #8b5cf6); color: white; padding: 2px 10px; border-radius: 99px; font-weight: 700;">{len(bg_files)} Clip HD</span>
      </h3>
      <p class="hint" style="margin: 4px 0 0; color: #a7f3d0;">Kho video nền thực tế chuyên dùng làm background cho Reels/TikTok.</p>
    </div>
    <button class="act" id="nenClose" style="border-radius: 10px; padding: 6px 16px; cursor: pointer;">✕ Đóng</button>
  </div>

  <div style="display: flex; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; align-items: center; flex-wrap: wrap;">
    <button type="button" id="tabRealClipsBtn" class="tab-btn active" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer;">🎞️ Kho Video Thực Tế ({len(bg_files)} Clip)</button>
    <button type="button" id="tabCategoriesBtn" class="tab-btn" style="background: rgba(52,211,153,0.15); color: #a7f3d0; border: 1px solid rgba(52,211,153,0.3); padding: 8px 16px; border-radius: 10px; font-weight: 600; cursor: pointer;">📋 Chuyên Mục CMS</button>
    
    <div style="margin-left: auto; display: flex; gap: 8px; align-items: center;">
      <button type="button" id="btnNenRandomSelect" style="background: rgba(139,92,246,0.25); color: #c4b5fd; border: 1px solid rgba(139,92,246,0.4); padding: 7px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px;">🎲 Xoay vòng 35 clip</button>
      <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; background: rgba(52,211,153,0.2); border: 1px dashed #10b981; padding: 7px 14px; border-radius: 8px; font-size: 13px; color: #d1fae5;">
        ➕ Thêm Clip .mp4
        <input type="file" id="uploadCustomBg" accept="video/mp4,video/*" multiple style="display:none">
      </label>
    </div>
  </div>

  <div id="tabRealClips" style="max-height: 58vh; overflow-y: auto; padding-right: 6px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(255,255,255,0.03); padding: 8px 14px; border-radius: 8px;">
      <span style="font-size: 13px; color: #d1fae5;">Rê chuột để phát thử • Bấm để chọn làm nền cho video:</span>
      <span id="selectedBgBadge" style="font-size: 12px; font-weight: 700; color: #34d399; background: rgba(52,211,153,0.15); padding: 3px 10px; border-radius: 99px;">Đang chọn: 🎲 Xoay vòng 35 clip</span>
    </div>
    
    <div id="bgVideoGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 14px;">
    </div>
  </div>

  <div id="tabCategories" style="display: none; max-height: 58vh; overflow-y: auto;">
    <p class="hint" style="margin:0 0 10px">Tick chuyên mục clip nền muốn dùng theo định dạng cấu hình CMS.</p>
    <div class="guNhom" id="nenList"></div>
    <div style="display:flex;gap:10px;margin-top:14px;justify-content:flex-end">
      <button type="button" class="guAll" id="nenAll">Chọn tất cả</button>
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(52,211,153,0.25);">
    <div style="font-size: 13px; color: #a7f3d0;">Chọn nền xong, bấm <b>Sang Bước Gen Video</b> để bắt đầu dựng.</div>
    <div style="display: flex; gap: 10px;">
      <button type="button" id="btnNenGoStudio" class="act" style="background: linear-gradient(135deg, #10b981, #8b5cf6); border-radius: 10px; padding: 8px 20px; font-weight: 700; cursor: pointer;">👉 Sang Bước Gen Video</button>
      <button type="button" class="ghost" onclick="document.getElementById('dlgNen').close()" style="border-radius: 10px; padding: 8px 16px; cursor: pointer;">Xong</button>
    </div>
  </div>
</dialog>"""

if '<dialog id="dlgNen"' in html:
    html = re.sub(r'<dialog id="dlgNen".*?</dialog>', upgraded_dlg_nen, html, flags=re.S, count=1)

# 7. Floating Bottom Bar
floating_bar_html = """
<div id="floatingGenBar" style="display: none;">
  <span style="font-size: 22px;">🌲</span>
  <div>
    <b style="color: #fff; font-size: 14px;">Đã chọn <span id="floatPickNum" style="color: #34d399;">0</span> mẫu trên màn hình</b>
    <div style="font-size: 12px; color: #a7f3d0; max-width: 440px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="floatPickNames">Chưa chọn mẫu nào</div>
  </div>
  <button type="button" id="btnFloatingGen" class="act" style="background: linear-gradient(135deg, #10b981, #8b5cf6) !important; padding: 9px 26px; border-radius: 999px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 18px rgba(16,185,129,0.5); font-size: 14px;">
    👉 TIẾP TỤC: SANG BƯỚC GEN VIDEO
  </button>
</div>
"""

# 8. Modal Quy Chuẩn Nạp File (.txt / .json)
modal_quychuan_html = """
<!-- MODAL QUY CHUẨN NẠP FILE KỊCH BẢN -->
<dialog id="dlgQuyChuan" style="background: #0f1c15; color: #f0fdf4; border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 16px; padding: 24px; max-width: 900px; width: 94vw; box-shadow: 0 25px 80px rgba(0,0,0,0.85); z-index: 2000;">
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(52, 211, 153, 0.3); padding-bottom: 12px; margin-bottom: 16px;">
    <div>
      <h3 style="margin: 0; font-size: 20px; color: #34d399; display: flex; align-items: center; gap: 8px;">
        📋 Quy Chuẩn Định Dạng File Kịch Bản (TXT & JSON)
      </h3>
      <p style="margin: 4px 0 0; font-size: 13px; color: #a7f3d0;">
        Hệ thống tự động nhận diện và bóc tách từng câu chuyện để xuất ra đúng số lượng video và tên file theo tên Page.
      </p>
    </div>
    <button class="ghost" onclick="document.getElementById('dlgQuyChuan').close()" style="border-radius: 8px; padding: 6px 14px; cursor: pointer;">✕ Đóng</button>
  </div>

  <div style="max-height: 62vh; overflow-y: auto; padding-right: 6px; display: flex; flex-direction: column; gap: 16px;">
    <!-- FORMAT TXT -->
    <div style="background: rgba(18, 30, 24, 0.9); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 12px; padding: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <b style="color: #34d399; font-size: 14px;">1. Định Dạng Chuẩn File Văn Bản (.txt) — Khuyên Dùng</b>
        <button type="button" id="btnCopySampleTxt" class="act" style="padding: 4px 12px; font-size: 12px; border-radius: 6px; cursor: pointer;">📋 Sao chép mẫu .txt</button>
      </div>
      <p style="font-size: 12px; color: #d1fae5; margin: 0 0 10px;">
        Mỗi video phân cách bởi dòng <code>=== STORY 1 ===</code> (hoặc <code>---</code>). Các thông tin gồm: Tác giả, Thời gian, Tên Page, Nội dung thẻ, Highlights (câu bôi đỏ), Nút CTA, Link ghim:
      </p>
      <pre style="background: #09130e; border: 1px solid #1c3527; border-radius: 8px; padding: 12px; font-size: 12px; color: #a7f3d0; overflow-x: auto; font-family: monospace; line-height: 1.5; margin: 0;">
=== STORY 1 ===
Tác giả: Franck Meynard
Thời gian: Il y a 1 h
Tên Page: Vérités d'Hier
Nội dung thẻ:
J'ai adopté seul la petite que vingt familles avaient refusée.
Son diagnostic faisait reculer tout le monde. « Vous avez le temps de réfléchir, monsieur. »
J'ai signé les pages en moins de quatre minutes.
Highlights: « Vous avez le temps de réfléchir, monsieur. » | il a compris ce qu'il avait signé...
Nút CTA: Continuer la lecture dans les commentaires
Link: https://example.com/fr/histoire-1

=== STORY 2 ===
Tác giả: Julien Tardieu
Thời gian: Il y a 3 h
Tên Page: Masques Tombés
Nội dung thẻ:
Deux garçons dormaient dans mon fauteuil quand je suis entré au bureau.
Il était sept heures dix et les couloirs étaient encore déserts.
Highlights: « Laissez-les dormir. » | j'ai appris qui était leur mère...
Nút CTA: Continuer la lecture dans les commentaires
Link: https://example.com/fr/histoire-2</pre>
    </div>

    <!-- FORMAT JSON -->
    <div style="background: rgba(18, 30, 24, 0.9); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 12px; padding: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <b style="color: #34d399; font-size: 14px;">2. Định Dạng Mảng JSON (.json)</b>
        <button type="button" id="btnCopySampleJson" class="ghost" style="padding: 4px 12px; font-size: 12px; border-radius: 6px; cursor: pointer;">📋 Sao chép mẫu .json</button>
      </div>
      <pre style="background: #09130e; border: 1px solid #1c3527; border-radius: 8px; padding: 12px; font-size: 12px; color: #a7f3d0; overflow-x: auto; font-family: monospace; line-height: 1.5; margin: 0;">
[
  {
    "author": "Franck Meynard",
    "pageName": "Vérités d'Hier",
    "timeAgo": "Il y a 1 h",
    "text": "J'ai adopté seul la petite que vingt familles avaient refusée...",
    "highlights": ["« Vous avez le temps de réfléchir, monsieur. »"],
    "cta": "Continuer la lecture dans les commentaires",
    "link": "https://example.com/fr/histoire-1"
  }
]</pre>
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(52, 211, 153, 0.3); padding-top: 14px; margin-top: 16px; flex-wrap: wrap; gap: 8px;">
    <div style="display: flex; gap: 10px;">
      <button type="button" id="btnDownloadSampleTxtFile" class="act" style="padding: 7px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px;">📥 Tải File Mẫu 30 Câu Chuyện (.txt)</button>
      <button type="button" id="btnDownloadSampleJsonFile" class="ghost" style="padding: 7px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px;">📥 Tải File Mẫu 30 Câu Chuyện (.json)</button>
    </div>
    <button type="button" class="act" onclick="document.getElementById('dlgQuyChuan').close()" style="padding: 7px 20px; border-radius: 8px; cursor: pointer;">Đã Hiểu</button>
  </div>
</dialog>
"""

# 9. Studio Modal HTML
studio_modal_html = f"""
{floating_bar_html}
{modal_quychuan_html}

<!-- STUDIO MODAL: BƯỚC GEN VIDEO ĐA QUỐC GIA -->
<div id="studioModal">
  <div class="studio-box">
    <!-- HEADER -->
    <div class="studio-header">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 26px;">🎬</span>
        <div>
          <h2 style="margin: 0; font-size: 18px; color: #fff; font-weight: 800;">Studio Gen Video & Đóng Gói Trọn Gói (.ZIP)</h2>
          <p style="margin: 2px 0 0; font-size: 12px; color: #a7f3d0;">Mẫu video bóc tách chuẩn 100% • Xem trước trực tiếp • Đặt tên file theo Fanpage</p>
        </div>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <span id="studioActiveTemplateBadge" style="font-size: 12px; color: #34d399; background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.3); padding: 5px 12px; border-radius: 8px; font-weight: 700;">Đang dùng: Các mẫu đã tick ngoài màn hình</span>
        <button id="studioCloseBtn" class="act" style="border-radius: 10px; padding: 6px 14px; cursor: pointer; background: rgba(255,255,255,0.1) !important; color: white !important;">✕ Đóng</button>
      </div>
    </div>

    <!-- BODY -->
    <div class="studio-body">
      <!-- LEFT: CONFIG & STORIES -->
      <div style="display: flex; flex-direction: column; gap: 16px; overflow-y: auto; padding-right: 6px;">
        
        <!-- SECTION 1: CẤU HÌNH TRANG, KÊNH & QUỐC GIA / SỐ LƯỢNG -->
        <div style="background: rgba(18, 30, 24, 0.75); border: 1px solid rgba(52,211,153,0.25); border-radius: 14px; padding: 16px;">
          <h4 style="margin: 0 0 12px; color: #34d399; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            🌐 1. Kênh Sáng Tạo, Ngôn Ngữ & Số Lượng Video
          </h4>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
              <label style="display: block; font-size: 12px; color: #a7f3d0; margin-bottom: 4px; font-weight: 700;">Tên Fanpage / Kênh (Dùng đặt tên file xuất ra):</label>
              <input type="text" id="studioPageName" value="Daily Confessions" style="width: 100%; background: #0c1611; color: #fff; border: 1px solid #10b981; padding: 8px 10px; border-radius: 8px; font-size: 13px; font-weight: 600;" placeholder="Ví dụ: Daily Secrets, Vérités d'Hier...">
            </div>

            <div>
              <label style="display: block; font-size: 12px; color: #a7f3d0; margin-bottom: 4px; font-weight: 700;">Tác Giả / Handle Kênh:</label>
              <input type="text" id="studioAuthorName" value="@daily_confessions" style="width: 100%; background: #0c1611; color: #fff; border: 1px solid #10b981; padding: 8px 10px; border-radius: 8px; font-size: 13px; font-weight: 600;" placeholder="Ví dụ: @franck_meynard, @emily_stories...">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
              <label style="display: block; font-size: 12px; color: #a7f3d0; margin-bottom: 4px; font-weight: 700;">Quốc Gia / Ngôn Ngữ Target:</label>
              <select id="selectStudioCountry" style="width: 100%; background: #0c1611; color: #fff; border: 1px solid #10b981; padding: 8px 10px; border-radius: 8px; font-size: 13px; font-weight: 600;">
                <option value="us" selected>🇺🇸 Hoa Kỳ (US - English)</option>
                <option value="fr">🇫🇷 Pháp (France - Français)</option>
                <option value="nl">🇳🇱 Hà Lan (Netherlands - Nederlands)</option>
                <option value="de">🇩🇪 Đức (Germany - Deutsch)</option>
                <option value="es">🇪🇸 Tây Ban Nha (Spain - Español)</option>
                <option value="vi">🇻🇳 Việt Nam (Tiếng Việt)</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 12px; color: #a7f3d0; margin-bottom: 4px; font-weight: 700;">Nhấp Chọn Số Video Cần Gen:</label>
              <div style="display: flex; gap: 6px; align-items: center;">
                <button type="button" class="btn-preset-count" data-num="5">5</button>
                <button type="button" class="btn-preset-count" data-num="10">10</button>
                <button type="button" class="btn-preset-count" data-num="15">15</button>
                <button type="button" class="btn-preset-count" data-num="20">20</button>
                <button type="button" class="btn-preset-count active" data-num="30">30</button>
                <input type="number" id="inputCustomVideoCount" value="30" min="1" max="100" style="width: 55px; background: #0c1611; color: #fff; border: 1px solid #10b981; padding: 5px; border-radius: 6px; text-align: center; font-size: 12px; font-weight: bold;">
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
              <label style="display: block; font-size: 12px; color: #a7f3d0; margin-bottom: 4px;">Video Nền Reels:</label>
              <select id="selectStudioBgMode" style="width: 100%; background: #0c1611; color: #fff; border: 1px solid #2d4536; padding: 8px; border-radius: 8px;">
                <option value="random" selected>🎲 Xoay vòng 35 clip từ Kho Nền (Khuyên dùng)</option>
                <option value="fixed">🎯 Cố định 1 clip nền đã chọn</option>
                <option value="gradient">🎨 Gradient nghệ thuật theo bảng màu</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 12px; color: #a7f3d0; margin-bottom: 4px;">Thời Lượng Mỗi Video:</label>
              <select id="selectStudioDuration" style="width: 100%; background: #0c1611; color: #fff; border: 1px solid #2d4536; padding: 8px; border-radius: 8px;">
                <option value="8">⚡ 8 giây (Chuẩn Viral Hook Reels)</option>
                <option value="12">12 giây</option>
                <option value="15">15 giây</option>
                <option value="20">20 giây</option>
              </select>
            </div>
          </div>

          <!-- STATUS BANNER CHO CÁC MẪU ĐÃ CHỌN -->
          <div id="studioTemplateStatusBox" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 10px; padding: 10px 14px; font-size: 12px;">
            <div id="studioTemplateModeTitle" style="font-weight: 800; color: #34d399; margin-bottom: 4px;">
              🎯 Đang kiểm tra các mẫu đã chọn...
            </div>
            <div id="studioTemplateDetailsList" style="color: #d1fae5; line-height: 1.4;">
              Đang tải danh sách mẫu...
            </div>
          </div>
        </div>

        <!-- SECTION 2: KHO AVATAR & UPLOAD AVATAR -->
        <div style="background: rgba(18, 30, 24, 0.75); border: 1px solid rgba(52,211,153,0.25); border-radius: 14px; padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h4 style="margin: 0; color: #34d399; font-size: 14px;">👤 2. Kho Avatar (<span id="statAvatarNum">{len(avatar_files)}</span> ảnh)</h4>
              <label style="cursor: pointer; background: rgba(16,185,129,0.2); border: 1px dashed #10b981; color: #34d399; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                📤 Tải lên Avatar từ máy
                <input type="file" id="uploadAvatarInput" accept="image/*" multiple style="display: none;">
              </label>
            </div>
            <div style="font-size: 12px; display: flex; gap: 10px; color: #d1fae5;">
              <label style="cursor: pointer;"><input type="radio" name="studioAvatarMode" value="random" checked> 🎲 Xoay vòng Avatar</label>
              <label style="cursor: pointer;"><input type="radio" name="studioAvatarMode" value="fixed"> 🎯 Cố định 1 Avatar</label>
            </div>
          </div>
          <div id="studioAvatarList" style="display: flex; gap: 10px; overflow-x: auto; padding: 6px 0;">
          </div>
        </div>

        <!-- SECTION 3: NỘI DUNG KỊCH BẢN & TẢI FILE KỊCH BẢN -->
        <div style="background: rgba(18, 30, 24, 0.75); border: 1px solid rgba(52,211,153,0.25); border-radius: 14px; padding: 16px; flex: 1; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h4 style="margin: 0; color: #34d399; font-size: 14px;">📝 3. Nội Dung Kịch Bản (<span id="statStoryCountDisplay">30</span> câu chuyện)</h4>
              <button type="button" id="btnOpenQuyChuan" class="ghost" style="padding: 3px 10px; font-size: 12px; border-radius: 6px; cursor: pointer; color: #fef08a; border-color: #facc15;">
                📋 Xem Quy Chuẩn File Mẫu
              </button>
            </div>
            <div style="display: flex; gap: 8px;">
              <label style="cursor: pointer; background: rgba(52,211,153,0.2); border: 1px dashed #34d399; color: #a7f3d0; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                📂 Tải file kịch bản (.txt/.json)
                <input type="file" id="uploadScriptInput" accept=".txt,.json" style="display: none;">
              </label>
              <button id="btnReloadSampleStories" type="button" class="ghost" style="padding: 3px 10px; font-size: 12px; border-radius: 6px; cursor: pointer;">🔄 Nạp lại mẫu</button>
            </div>
          </div>
          <textarea id="studioBatchTextarea" style="width: 100%; height: 180px; background: #0a140f; color: #d1fae5; border: 1px solid #1e3a2b; border-radius: 8px; padding: 10px; font-family: monospace; font-size: 12px; resize: vertical;" placeholder="Dán nội dung các câu chuyện vào đây theo quy chuẩn..."></textarea>
        </div>
      </div>

      <!-- RIGHT: LIVE PREVIEW & RENDER ACTIONS -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 14px; background: rgba(14, 25, 20, 0.6); border: 1px solid rgba(52,211,153,0.25); border-radius: 14px; padding: 16px;">
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
          <span style="font-size: 13px; font-weight: 700; color: #d1fae5;">👁️ Xem Trước Video (Đúng Mẫu Đã Chọn):</span>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button id="btnPrevStory" class="ghost" style="padding: 3px 10px; border-radius: 6px; cursor: pointer;">◀</button>
            <span id="currentStoryIndexBadge" style="font-size: 12px; font-weight: 700; color: #34d399; background: rgba(52,211,153,0.15); padding: 3px 8px; border-radius: 99px;">1 / 30</span>
            <button id="btnNextStory" class="ghost" style="padding: 3px 10px; border-radius: 6px; cursor: pointer;">▶</button>
          </div>
        </div>

        <div id="previewTplInfo" style="width: 100%; font-size: 11px; color: #a7f3d0; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 6px;">
          Video #1: [Mẫu đang xem]
        </div>

        <!-- LIVE NATIVE IFRAME PREVIEW CONTAINER (720x1280 SCALED TO 270x480) -->
        <div style="position: relative; width: 270px; height: 480px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.7); border: 2px solid rgba(52,211,153,0.4); background: #000;">
          <iframe id="studioPreviewIframe" style="position: absolute; left: 0; top: 0; width: 720px; height: 1280px; transform: scale(0.375); transform-origin: 0 0; border: none; background: #000;" allow="autoplay"></iframe>
          <!-- Background canvas used for MP4 frame recording -->
          <canvas id="studioPreviewCanvas" width="720" height="1280" style="display: none;"></canvas>
          <video id="studioBgVideoElement" loop muted playsinline crossOrigin="anonymous" style="display:none;"></video>
        </div>

        <!-- PROGRESS & STATUS -->
        <div id="renderProgressBox" style="width: 100%; display: none; background: rgba(10,20,15,0.85); border: 1px solid #10b981; border-radius: 10px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span id="renderStatusText" style="color: #34d399; font-weight: 700;">Đang render...</span>
            <span id="renderPercentText" style="color: #a7f3d0; font-weight: 700;">0%</span>
          </div>
          <div style="width: 100%; height: 8px; background: #132a1e; border-radius: 99px; overflow: hidden;">
            <div id="renderProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #10b981, #8b5cf6); transition: width 0.2s;"></div>
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
          <button id="btnRenderSingle" type="button" class="ghost" style="width: 100%; padding: 10px; font-weight: 700; border-radius: 10px; cursor: pointer; border-color: #10b981; color: #fff;">
            ⚡ Render Thử 1 Video Này (.mp4 + .txt)
          </button>
          
          <button id="btnRenderBatch30" type="button" class="act" style="width: 100%; padding: 14px; font-weight: 800; font-size: 15px; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 20px rgba(16,185,129,0.5);">
            🚀 BẮT ĐẦU GEN <span id="btnBatchNumLabel">30</span> VIDEO & GÓI ZIP
          </button>
          
          <button id="btnDownloadAllZip" type="button" style="display: none; width: 100%; padding: 14px; font-weight: 800; font-size: 15px; border-radius: 12px; cursor: pointer; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; box-shadow: 0 4px 20px rgba(16,185,129,0.5);">
            📦 TẢI TOÀN BỘ VỀ MÁY (.ZIP TRỌN GÓI)
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
"""

# 10. Modern Studio JavaScript Engine
studio_script = f"""
<!-- STUDIO JAVASCRIPT ENGINE -->
<script>
(function() {{
  const BG_CLIPS = {json.dumps(bg_files)};
  let AVATARS = {json.dumps(avatar_files)};
  const STORIES_BY_COUNTRY = {json.dumps(stories_by_country)};
  const TPL_METAS = {json.dumps(templates_info)};
  
  let currentCountry = "us";
  let targetVideoCount = 30;
  let currentBgMode = "random";
  let activeSelectedBg = BG_CLIPS[0] || "";
  let currentStoryIdx = 0;
  let parsedStories = [];
  let avatarCache = {{}};
  let selectedAvatar = AVATARS[0];
  let renderedFiles = [];
  let isRecording = false;

  let globalAudioCtx = null;
  let globalAudioElement = null;
  let globalAudioSourceNode = null;
  let globalAudioDestNode = null;

  let batchTemplatePlan = [];

  // DOM Elements
  const dlgNen = document.getElementById("dlgNen");
  const dlgQuyChuan = document.getElementById("dlgQuyChuan");
  const btnOpenQuyChuan = document.getElementById("btnOpenQuyChuan");
  const btnCopySampleTxt = document.getElementById("btnCopySampleTxt");
  const btnCopySampleJson = document.getElementById("btnCopySampleJson");
  const btnDownloadSampleTxtFile = document.getElementById("btnDownloadSampleTxtFile");
  const btnDownloadSampleJsonFile = document.getElementById("btnDownloadSampleJsonFile");

  const bgVideoGrid = document.getElementById("bgVideoGrid");
  const tabRealClipsBtn = document.getElementById("tabRealClipsBtn");
  const tabCategoriesBtn = document.getElementById("tabCategoriesBtn");
  const tabRealClips = document.getElementById("tabRealClips");
  const tabCategories = document.getElementById("tabCategories");
  const selectedBgBadge = document.getElementById("selectedBgBadge");
  const uploadCustomBg = document.getElementById("uploadCustomBg");

  const studioModal = document.getElementById("studioModal");
  const btnMoStudio = document.getElementById("btnMoStudio");
  const studioCloseBtn = document.getElementById("studioCloseBtn");
  const btnNenGoStudio = document.getElementById("btnNenGoStudio");
  const floatingGenBar = document.getElementById("floatingGenBar");
  const floatPickNum = document.getElementById("floatPickNum");
  const floatPickNames = document.getElementById("floatPickNames");
  const btnFloatingGen = document.getElementById("btnFloatingGen");
  const headerPickCount = document.getElementById("headerPickCount");

  const studioPageName = document.getElementById("studioPageName");
  const studioAuthorName = document.getElementById("studioAuthorName");
  const selectStudioCountry = document.getElementById("selectStudioCountry");
  const selectStudioBgMode = document.getElementById("selectStudioBgMode");
  const selectStudioDuration = document.getElementById("selectStudioDuration");
  const inputCustomVideoCount = document.getElementById("inputCustomVideoCount");
  const btnBatchNumLabel = document.getElementById("btnBatchNumLabel");
  const studioActiveTemplateBadge = document.getElementById("studioActiveTemplateBadge");
  const studioTemplateStatusBox = document.getElementById("studioTemplateStatusBox");
  const studioTemplateModeTitle = document.getElementById("studioTemplateModeTitle");
  const studioTemplateDetailsList = document.getElementById("studioTemplateDetailsList");

  const studioAvatarList = document.getElementById("studioAvatarList");
  const statAvatarNum = document.getElementById("statAvatarNum");
  const uploadAvatarInput = document.getElementById("uploadAvatarInput");
  const statStoryCountDisplay = document.getElementById("statStoryCountDisplay");
  const uploadScriptInput = document.getElementById("uploadScriptInput");
  const btnReloadSampleStories = document.getElementById("btnReloadSampleStories");
  const studioBatchTextarea = document.getElementById("studioBatchTextarea");

  const studioPreviewIframe = document.getElementById("studioPreviewIframe");
  const studioCanvas = document.getElementById("studioPreviewCanvas");
  const studioCtx = studioCanvas.getContext("2d");
  const studioBgVideo = document.getElementById("studioBgVideoElement");
  const btnPrevStory = document.getElementById("btnPrevStory");
  const btnNextStory = document.getElementById("btnNextStory");
  const currentStoryIndexBadge = document.getElementById("currentStoryIndexBadge");
  const previewTplInfo = document.getElementById("previewTplInfo");

  const renderProgressBox = document.getElementById("renderProgressBox");
  const renderStatusText = document.getElementById("renderStatusText");
  const renderPercentText = document.getElementById("renderPercentText");
  const renderProgressBar = document.getElementById("renderProgressBar");
  const btnRenderSingle = document.getElementById("btnRenderSingle");
  const btnRenderBatch30 = document.getElementById("btnRenderBatch30");
  const btnDownloadAllZip = document.getElementById("btnDownloadAllZip");

  // 1. READ ALL PICKED TEMPLATES AND THEIR EXACT SELECTED PALETTES
  function getPickedTemplates() {{
    const picked = [];
    if (typeof state !== "undefined" && Array.isArray(state) && typeof MAU !== "undefined") {{
      state.forEach((s, idx) => {{
        if (s.picked && MAU[idx]) {{
          const m = MAU[idx];
          const palIdx = (s.pal !== undefined && s.pal >= 0 && s.pal < m.pals.length) ? s.pal : 0;
          const activePal = m.pals[palIdx];
          const meta = TPL_METAS[idx] || {{}};
          const palMeta = (meta.pals && meta.pals[palIdx]) ? meta.pals[palIdx] : {{ vars: {{}} }};
          
          picked.push({{
            index: idx,
            id: m.id,
            label: m.label,
            ho: m.ho || "the-vet",
            palIdx: palIdx,
            palId: activePal.id,
            palName: `${{palIdx + 1}}/${{m.pals.length}} (${{activePal.id}})`,
            rawHtml: activePal.html,
            vars: palMeta.vars || {{}}
          }});
        }}
      }});
    }}
    return picked;
  }}

  // 2. BUILD BATCH TEMPLATE PLAN (Random Scramble vs Strict Single Template)
  function buildBatchTemplatePlan(count) {{
    const picked = getPickedTemplates();
    batchTemplatePlan = [];
    
    if (picked.length === 0) {{
      const m0 = MAU[0];
      const pal0 = m0.pals[0];
      const meta0 = TPL_METAS[0] || {{}};
      const palMeta0 = (meta0.pals && meta0.pals[0]) ? meta0.pals[0] : {{ vars: {{}} }};
      const t0 = {{
        index: 0,
        id: m0.id,
        label: m0.label,
        ho: m0.ho || "the-vet",
        palIdx: 0,
        palId: pal0.id,
        palName: `1/${{m0.pals.length}} (${{pal0.id}})`,
        rawHtml: pal0.html,
        vars: palMeta0.vars || {{}}
      }};
      batchTemplatePlan = Array(count).fill(t0);
      return;
    }}

    if (picked.length === 1) {{
      batchTemplatePlan = Array(count).fill(picked[0]);
      return;
    }}

    const pool = [];
    while (pool.length < count) {{
      const shuffled = [...picked].sort(() => Math.random() - 0.5);
      pool.push(...shuffled);
    }}
    batchTemplatePlan = pool.slice(0, count);
  }}

  function getTemplateForStory(storyIndex) {{
    if (batchTemplatePlan && batchTemplatePlan[storyIndex]) {{
      return batchTemplatePlan[storyIndex];
    }}
    const picked = getPickedTemplates();
    if (picked.length > 0) {{
      return picked[storyIndex % picked.length];
    }}
    const m0 = MAU[0];
    const pal0 = m0.pals[0];
    const meta0 = TPL_METAS[0] || {{}};
    const palMeta0 = (meta0.pals && meta0.pals[0]) ? meta0.pals[0] : {{ vars: {{}} }};
    return {{
      index: 0,
      id: m0.id,
      label: m0.label,
      ho: m0.ho || "the-vet",
      palIdx: 0,
      palId: pal0.id,
      palName: `1/${{m0.pals.length}}`,
      rawHtml: pal0.html,
      vars: palMeta0.vars || {{}}
    }};
  }}

  // 3. BUILD FULL NATIVE TEMPLATE HTML FOR LIVE IFRAME
  function buildStoryHtml(mIdx, palIdx, story) {{
    const m = MAU[mIdx];
    if (!m) return "";
    const pal = m.pals[palIdx] || m.pals[0];
    let tplHtml = pal.html;

    // Determine avatar src
    const isRandomAv = document.querySelector('input[name="studioAvatarMode"]:checked')?.value === "random";
    const avFile = isRandomAv ? (AVATARS[currentStoryIdx % AVATARS.length]) : selectedAvatar;
    const avSrc = avFile.startsWith("data:") ? avFile : `assets/avatars/${{avFile}}`;

    // Replace system assets
    if (typeof ASSET !== "undefined") {{
      for (const [ma, uri] of ASSET) {{
        if (ma === "@@AV@@") {{
          tplHtml = tplHtml.split(ma).join(avSrc);
        }} else if (ma === "@@CLIP@@") {{
          const clipSrc = (selectStudioBgMode.value === "random") 
            ? `assets/backgrounds/${{BG_CLIPS[currentStoryIdx % BG_CLIPS.length] || BG_CLIPS[0]}}`
            : `assets/backgrounds/${{activeSelectedBg || BG_CLIPS[0]}}`;
          tplHtml = tplHtml.split(ma).join(clipSrc);
        }} else {{
          tplHtml = tplHtml.split(ma).join(uri);
        }}
      }}
    }}

    const displayName = story.page || studioPageName.value || story.author;
    const timeDisplay = story.timeAgo || "3h ago";
    const ctaDisplay = story.cta || "Continuer la lecture dans les commentaires";

    tplHtml = tplHtml
      .split("@@NAME@@").join(displayName)
      .split("@@TIME@@").join(timeDisplay)
      .split("@@CTA@@").join(ctaDisplay)
      .split("@@CTABOX@@").join(ctaDisplay)
      .split("@@CTAPILL@@").join(ctaDisplay)
      .split("@@BAR@@").join(ctaDisplay);

    // Format body text with highlights
    let bodyHtml = "";
    const paragraphs = (story.content || "").split(/\\n+/).map(p => p.trim()).filter(Boolean);
    
    paragraphs.forEach((para, idx) => {{
      let pText = para;
      if (story.highlights && story.highlights.length > 0) {{
        story.highlights.forEach(hl => {{
          if (hl.length > 3 && pText.includes(hl)) {{
            pText = pText.split(hl).join(`<span class="r">${{hl}}</span>`);
          }}
        }});
      }} else if (idx === 0) {{
        pText = `<span class="r lead">${{pText}}</span>`;
      }}
      bodyHtml += (idx > 0 ? `<span class="pg"></span>` : "") + pText + " ";
    }});

    if (story.cta) {{
      bodyHtml += ` <span class="cta">${{ctaDisplay}}</span>`;
    }}

    // Replace inside <div class="inner" id="body">...</div>
    tplHtml = tplHtml.replace(/(<div[^>]*id=["']body["'][^>]*>)([\\s\\S]*?)(<\\/div>)/i, `$1${{bodyHtml}}$3`);

    return tplHtml;
  }}

  // 4. UPDATE LIVE PREVIEW (IFRAME + INFO BADGE)
  function updateLivePreview() {{
    if (!parsedStories || parsedStories.length === 0) return;
    const story = parsedStories[currentStoryIdx] || parsedStories[0];
    const tpl = getTemplateForStory(currentStoryIdx);
    
    if (previewTplInfo && tpl) {{
      const pName = story ? (story.page || studioPageName.value) : studioPageName.value;
      previewTplInfo.textContent = `Video #${{currentStoryIdx + 1}}: [${{tpl.label}} • ${{tpl.palName}}] - ${{pName}}`;
    }}

    // Update Live Native Iframe
    const fullHtml = buildStoryHtml(tpl.index, tpl.palIdx, story);
    if (studioPreviewIframe) {{
      studioPreviewIframe.srcdoc = fullHtml;
      // Trigger fitBody once loaded
      studioPreviewIframe.onload = () => {{
        try {{
          studioPreviewIframe.contentWindow?.fitBody?.();
          for (const v of studioPreviewIframe.contentDocument.querySelectorAll("video")) {{
            v.muted = true;
            v.play().catch(() => {{}});
          }}
        }} catch(e) {{}}
      }};
    }}
  }}

  // 5. UPDATE PICKED UI (HEADER, FLOATING BAR, AND STUDIO BANNER)
  function updatePickedUI() {{
    const picked = getPickedTemplates();
    const count = picked.length;
    if (headerPickCount) headerPickCount.textContent = count;
    if (floatPickNum) floatPickNum.textContent = count;
    
    if (count > 0) {{
      floatingGenBar.style.display = "flex";
      const names = picked.map(p => `${{p.label}} [${{p.palName}}]`).slice(0, 3).join(", ");
      floatPickNames.textContent = names + (count > 3 ? ` (+${{count - 3}} mẫu)` : "");
      studioActiveTemplateBadge.textContent = `🎯 Đang chọn: ${{count}} mẫu`;
      studioActiveTemplateBadge.style.color = "#34d399";
    }} else {{
      floatingGenBar.style.display = "none";
      studioActiveTemplateBadge.textContent = `Chưa tick mẫu nào ngoài màn hình`;
      studioActiveTemplateBadge.style.color = "#fca5a5";
    }}

    // Update Banner in Studio Modal
    if (count === 1) {{
      const p = picked[0];
      studioTemplateModeTitle.innerHTML = `🔒 CHẾ ĐỘ ĐỒNG NHẤT 1 MẪU: <span style="color:#fff;">${{p.label}}</span> (Màu: <span style="color:#fef08a;">${{p.palName}}</span>)`;
      studioTemplateDetailsList.innerHTML = `Tất cả <b>${{targetVideoCount}} video</b> gen ra sẽ làm <b>đúng 100% theo mẫu và màu sắc này</b>.`;
      studioTemplateStatusBox.style.borderColor = "rgba(16, 185, 129, 0.6)";
      studioTemplateStatusBox.style.background = "rgba(16, 185, 129, 0.15)";
    }} else if (count > 1) {{
      studioTemplateModeTitle.innerHTML = `🎲 CHẾ ĐỘ RANDOM LỘN XỘN GIỮA ${{count}} MẪU ĐÃ CHỌN:`;
      const chips = picked.map(p => `<span style="display:inline-block;background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:6px;margin:2px 4px 2px 0;">✓ <b>${{p.label}}</b> (${{p.palName}})</span>`).join("");
      studioTemplateDetailsList.innerHTML = `<div style="margin-bottom:4px;">${{chips}}</div>Hệ thống sẽ <b>tự động random xáo trộn lộn xộn</b> giữa các mẫu trên cho toàn bộ <b>${{targetVideoCount}} video</b>!`;
      studioTemplateStatusBox.style.borderColor = "rgba(139, 92, 246, 0.6)";
      studioTemplateStatusBox.style.background = "rgba(139, 92, 246, 0.15)";
    }} else {{
      studioTemplateModeTitle.innerHTML = `⚠️ CHƯA CHỌN MẪU NÀO TRÊN MÀN HÌNH:`;
      studioTemplateDetailsList.innerHTML = `Vui lòng đóng Studio và tick chọn các mẫu bạn muốn gen ngoài màn hình (chọn 1 mẫu để làm đồng nhất, hoặc nhiều mẫu để tự động random).`;
      studioTemplateStatusBox.style.borderColor = "rgba(239, 68, 68, 0.5)";
      studioTemplateStatusBox.style.background = "rgba(239, 68, 68, 0.15)";
    }}

    buildBatchTemplatePlan(targetVideoCount);
    updateLivePreview();
  }}

  document.addEventListener("click", (e) => {{
    if (e.target.closest(".card .pal button") || e.target.closest(".card .pick input") || e.target.closest(".card") || e.target.id === "clear") {{
      setTimeout(updatePickedUI, 40);
    }}
  }});

  // 6. OPEN & CLOSE STUDIO MODAL
  btnMoStudio.onclick = () => {{ studioModal.style.display = "flex"; updatePickedUI(); }};
  btnFloatingGen.onclick = () => {{ studioModal.style.display = "flex"; updatePickedUI(); }};
  studioCloseBtn.onclick = () => {{ studioModal.style.display = "none"; }};
  btnNenGoStudio.onclick = () => {{
    dlgNen.close();
    studioModal.style.display = "flex";
    updatePickedUI();
  }};

  // Quy chuẩn Modal Controls
  btnOpenQuyChuan.onclick = () => {{ dlgQuyChuan.showModal(); }};
  btnCopySampleTxt.onclick = () => {{
    const sample = `=== STORY 1 ===\\nTác giả: Franck Meynard\\nThời gian: Il y a 1 h\\nTên Page: Vérités d'Hier\\nNội dung thẻ:\\nJ'ai adopté seul la petite que vingt familles avaient refusée.\\nSon diagnostic faisait reculer tout le monde. « Vous avez le temps de réfléchir, monsieur. »\\nJ'ai signé les pages en moins de quatre minutes.\\nHighlights: « Vous avez le temps de réfléchir, monsieur. » | il a compris ce qu'il avait signé...\\nNút CTA: Continuer la lecture dans les commentaires\\nLink: https://example.com/fr/histoire-1\\n\\n=== STORY 2 ===\\nTác giả: Julien Tardieu\\nThời gian: Il y a 3 h\\nTên Page: Masques Tombés\\nNội dung thẻ:\\nDeux garçons dormaient dans mon fauteuil quand je suis entré au bureau...\\nHighlights: « Laissez-les dormir. » | j'ai appris qui était leur mère...\\nNút CTA: Continuer la lecture dans les commentaires\\nLink: https://example.com/fr/histoire-2`;
    navigator.clipboard.writeText(sample).then(() => {{
      btnCopySampleTxt.textContent = "✓ Đã sao chép!";
      setTimeout(() => btnCopySampleTxt.textContent = "📋 Sao chép mẫu .txt", 2000);
    }});
  }};

  btnCopySampleJson.onclick = () => {{
    const sample = `[\\n  {{\\n    "author": "Franck Meynard",\\n    "pageName": "Vérités d'Hier",\\n    "timeAgo": "Il y a 1 h",\\n    "text": "J'ai adopté seul la petite que vingt familles avaient refusée...",\\n    "highlights": ["« Vous avez le temps de réfléchir, monsieur. »"],\\n    "cta": "Continuer la lecture dans les commentaires",\\n    "link": "https://example.com/fr/histoire-1"\\n  }}\\n]`;
    navigator.clipboard.writeText(sample).then(() => {{
      btnCopySampleJson.textContent = "✓ Đã sao chép!";
      setTimeout(() => btnCopySampleJson.textContent = "📋 Sao chép mẫu .json", 2000);
    }});
  }};

  btnDownloadSampleTxtFile.onclick = () => {{
    const raw = STORIES_BY_COUNTRY["fr"] || STORIES_BY_COUNTRY["us"];
    const blob = new Blob([raw], {{ type: "text/plain;charset=utf-8" }});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Mau_Kich_Ban_30_Stories.txt";
    a.click();
  }};

  btnDownloadSampleJsonFile.onclick = () => {{
    const stories = parseStories(STORIES_BY_COUNTRY["fr"] || STORIES_BY_COUNTRY["us"]);
    const jsonStr = JSON.stringify(stories.map(s => ({{
      author: s.author,
      pageName: s.page,
      timeAgo: s.timeAgo,
      text: s.content,
      highlights: s.highlights,
      cta: s.cta,
      link: s.pinLink
    }})), null, 2);
    const blob = new Blob([jsonStr], {{ type: "application/json;charset=utf-8" }});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(jsonStr);
    a.download = "Mau_Kich_Ban_30_Stories.json";
    a.click();
  }};

  // 7. TABS FOR KHO NỀN
  tabRealClipsBtn.onclick = () => {{
    tabRealClipsBtn.classList.add("active");
    tabRealClipsBtn.style.background = "#10b981";
    tabCategoriesBtn.classList.remove("active");
    tabCategoriesBtn.style.background = "rgba(52,211,153,0.15)";
    tabRealClips.style.display = "block";
    tabCategories.style.display = "none";
  }};
  tabCategoriesBtn.onclick = () => {{
    tabCategoriesBtn.classList.add("active");
    tabCategoriesBtn.style.background = "#10b981";
    tabRealClipsBtn.classList.remove("active");
    tabRealClipsBtn.style.background = "rgba(52,211,153,0.15)";
    tabCategories.style.display = "block";
    tabRealClips.style.display = "none";
  }};

  // 8. RENDER KHO NỀN GRID
  function renderBgGrid() {{
    bgVideoGrid.innerHTML = "";
    BG_CLIPS.forEach((clip, idx) => {{
      const card = document.createElement("div");
      card.style.cssText = "background: rgba(18, 30, 24, 0.85); border: 1px solid rgba(52,211,153,0.25); border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.2s; position: relative;";
      card.innerHTML = `
        <div style="height: 140px; background: #000; position: relative; overflow: hidden;">
          <video src="assets/backgrounds/${{clip}}" preload="metadata" muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
          <span style="position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.7); font-size: 11px; padding: 2px 6px; border-radius: 4px; color: #fff;">#${{idx + 1}}</span>
        </div>
        <div style="padding: 8px 10px; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #d1fae5;">
          ${{clip}}
        </div>
      `;
      const vid = card.querySelector("video");
      card.onmouseenter = () => {{ vid.currentTime = 1; vid.play().catch(() => {{}}); card.style.borderColor = "#10b981"; }};
      card.onmouseleave = () => {{ vid.pause(); card.style.borderColor = "rgba(52,211,153,0.25)"; }};
      card.onclick = () => {{
        activeSelectedBg = clip;
        currentBgMode = "fixed";
        selectStudioBgMode.value = "fixed";
        selectedBgBadge.textContent = "Đang chọn: " + clip;
        updateBgVideoSource();
        updateLivePreview();
      }};
      bgVideoGrid.appendChild(card);
    }});
  }}

  // 9. RENDER AVATARS
  function renderAvatars() {{
    studioAvatarList.innerHTML = "";
    statAvatarNum.textContent = AVATARS.length;
    AVATARS.forEach((av, idx) => {{
      const item = document.createElement("div");
      item.style.cssText = `flex-shrink: 0; width: 64px; height: 64px; border-radius: 50%; overflow: hidden; border: 2px solid ${{av === selectedAvatar ? "#10b981" : "rgba(255,255,255,0.2)"}}; cursor: pointer; position: relative; transition: all 0.2s;`;
      const imgSrc = av.startsWith("data:") ? av : `assets/avatars/${{av}}`;
      item.innerHTML = `<img src="${{imgSrc}}" style="width: 100%; height: 100%; object-fit: cover;">`;
      item.onclick = () => {{
        selectedAvatar = av;
        renderAvatars();
        updateLivePreview();
      }};
      studioAvatarList.appendChild(item);
    }});
  }}

  uploadAvatarInput.onchange = (e) => {{
    const files = Array.from(e.target.files);
    if (!files.length) return;
    files.forEach(file => {{
      const reader = new FileReader();
      reader.onload = (ev) => {{
        const dataUrl = ev.target.result;
        AVATARS.unshift(dataUrl);
        selectedAvatar = dataUrl;
        renderAvatars();
        updateLivePreview();
      }};
      reader.readAsDataURL(file);
    }});
  }};

  // 10. MULTI-FORMAT SMART PARSER
  function parseStories(text) {{
    text = (text || "").trim();
    if (!text) return [];

    const defaultPage = studioPageName.value.trim() || "Daily Confessions";
    const defaultAuthor = studioAuthorName.value.replace('@', '').trim() || "Creator";
    const defaultHandle = studioAuthorName.value.trim() || "@creator";

    // 1. Try parsing JSON format
    if (text.startsWith('[') && text.endsWith(']')) {{
      try {{
        const arr = JSON.parse(text);
        if (Array.isArray(arr) && arr.length > 0) {{
          return arr.map((item, idx) => ({{
            index: idx,
            author: item.author || defaultAuthor,
            handle: item.handle || ('@' + (item.author || defaultAuthor).toLowerCase().replace(/[^a-z0-9]/g, '_')),
            timeAgo: item.timeAgo || item.time || '3h ago',
            page: item.pageName || item.page || defaultPage,
            title: item.title || item.caption || (`Story #${{idx + 1}}`),
            content: (item.text || item.content || '').trim(),
            highlights: Array.isArray(item.highlights) ? item.highlights : (item.highlights ? item.highlights.split('|').map(s=>s.trim()) : []),
            cta: item.cta || '🔗 Read Full Story In Bio / Comments',
            pinLink: item.pinLink || item.link || (`https://example.com/story-${{idx + 1}}`)
          }}));
        }}
      }} catch (e) {{}}
    }}

    // 2. Text Parser: Split by story headers or dashes
    let rawBlocks = [];
    if (/===\\s*(?:STORY|CÂU CHUYỆN|PHẦN)\\s*\\d*\\s*===/i.test(text)) {{
      const parts = text.split(/(?:^|\\n)===\\s*(?:STORY|CÂU CHUYỆN|PHẦN)\\s*\\d*\\s*===[^\\n]*/i);
      rawBlocks = parts.map(p => p.trim()).filter(Boolean);
    }} else if (/\\n---+\\n/.test(text)) {{
      rawBlocks = text.split(/\\n---+\\n/).map(p => p.trim()).filter(Boolean);
    }} else if (/\\n===+\\n/.test(text)) {{
      rawBlocks = text.split(/\\n===+\\n/).map(p => p.trim()).filter(Boolean);
    }} else {{
      rawBlocks = [text];
    }}

    return rawBlocks.map((block, idx) => {{
      const authorMatch = block.match(/(?:Tác giả|Tac gia|Author|Auteur):\\s*([^\\n]+)/i);
      const handleMatch = block.match(/(?:Handle|Kênh|Kenh|Username):\\s*([^\\n]+)/i);
      const timeMatch = block.match(/(?:Thời gian|Thoi gian|Time|Temps):\\s*([^\\n]+)/i);
      const pageMatch = block.match(/(?:Tên Page|Ten Page|Page|Fanpage):\\s*([^\\n]+)/i);
      const titleMatch = block.match(/(?:Title|Tiêu đề|Tieu de|Caption|Titre):\\s*([^\\n]+)/i);
      const ctaMatch = block.match(/(?:Nút CTA|Nut CTA|CTA|Bouton CTA|Kêu gọi):\\s*([^\\n]+)/i);
      const linkMatch = block.match(/(?:Link|Pin_Link|Liên kết|Lien ket|Url):\\s*([^\\n]+)/i);
      const hlMatch = block.match(/(?:Highlights?|Nổi bật|Noi bat|Bôi đỏ):\\s*([^\\n]+)/i);

      let content = '';
      const contentTagMatch = block.match(/(?:Nội dung thẻ|Nội dung|Noi dung|Content|Texte|Histoire):\\s*([\\s\\S]+?)(?=(?:Highlights?|Nổi bật|Nút CTA|CTA|Caption|Comment 1|Link|Pin_Link|$))/i);
      if (contentTagMatch) {{
        content = contentTagMatch[1].trim();
      }} else {{
        const cleanLines = block.split('\\n').filter(line => {{
          const l = line.trim();
          if (!l) return true;
          if (/^(?:Tác giả|Tac gia|Author|Auteur|Handle|Kênh|Thời gian|Time|Tên Page|Page|Title|Tiêu đề|Nút CTA|CTA|Caption|Comment|Highlights|Nổi bật|Link|Pin_Link):/i.test(l)) return false;
          if (/^===.*===$/.test(l)) return false;
          if (/^---+$/.test(l)) return false;
          return true;
        }});
        content = cleanLines.join('\\n').trim();
      }}

      const author = authorMatch ? authorMatch[1].trim() : defaultAuthor;
      const page = pageMatch ? pageMatch[1].trim() : (studioPageName.value.trim() || defaultPage);
      const handle = handleMatch ? handleMatch[1].trim() : ('@' + author.toLowerCase().replace(/[^a-z0-9]/g, '_'));
      const timeAgo = timeMatch ? timeMatch[1].trim() : '3h ago';
      const title = titleMatch ? titleMatch[1].trim() : (`Story #${{idx + 1}}`);
      const cta = ctaMatch ? ctaMatch[1].trim() : '🔗 Read Full Story In Bio / Comments';
      const pinLink = linkMatch ? linkMatch[1].trim() : (`https://example.com/story-${{idx + 1}}`);
      const highlights = hlMatch ? hlMatch[1].split('|').map(s => s.trim()).filter(Boolean) : [];

      return {{
        index: idx,
        author,
        handle,
        timeAgo,
        page,
        title,
        content,
        highlights,
        cta,
        pinLink
      }};
    }});
  }}

  function reloadStories() {{
    const raw = STORIES_BY_COUNTRY[currentCountry] || STORIES_BY_COUNTRY["us"];
    studioBatchTextarea.value = raw;
    parsedStories = parseStories(raw);
    statStoryCountDisplay.textContent = parsedStories.length;
    currentStoryIdx = 0;
    buildBatchTemplatePlan(targetVideoCount);
    updateStoryNav();
    updateBgVideoSource();
    updateLivePreview();
  }}

  btnReloadSampleStories.onclick = reloadStories;

  studioBatchTextarea.oninput = () => {{
    parsedStories = parseStories(studioBatchTextarea.value);
    statStoryCountDisplay.textContent = parsedStories.length;
    buildBatchTemplatePlan(targetVideoCount);
    updateStoryNav();
    updateLivePreview();
  }};

  studioPageName.oninput = () => {{
    parsedStories.forEach(s => {{
      if (!s._hasCustomPage) s.page = studioPageName.value.trim();
    }});
    updateLivePreview();
  }};

  uploadScriptInput.onchange = (e) => {{
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {{
      studioBatchTextarea.value = ev.target.result;
      parsedStories = parseStories(ev.target.result);
      statStoryCountDisplay.textContent = parsedStories.length;
      buildBatchTemplatePlan(targetVideoCount);
      updateStoryNav();
      updateLivePreview();
    }};
    reader.readAsText(file);
  }};

  selectStudioCountry.onchange = () => {{
    currentCountry = selectStudioCountry.value;
    const countryNames = {{
      "us": {{ page: "Daily Confessions", author: "@daily_confessions" }},
      "fr": {{ page: "Vérités d'Hier", author: "@verites_dhier" }},
      "nl": {{ page: "Stille Verhalen", author: "@verborgen_tranen" }},
      "de": {{ page: "Wahre Geschichten", author: "@stille_wahrheiten" }},
      "es": {{ page: "Historias Reales", author: "@historias_del_alma" }},
      "vi": {{ page: "Góc Nhìn Cuộc Sống", author: "@goc_nhin_cuoc_song" }}
    }};
    if (countryNames[currentCountry]) {{
      studioPageName.value = countryNames[currentCountry].page;
      studioAuthorName.value = countryNames[currentCountry].author;
    }}
    reloadStories();
  }};

  // Video Count Presets
  document.querySelectorAll(".btn-preset-count").forEach(btn => {{
    btn.onclick = () => {{
      document.querySelectorAll(".btn-preset-count").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const num = parseInt(btn.dataset.num, 10);
      targetVideoCount = num;
      inputCustomVideoCount.value = num;
      btnBatchNumLabel.textContent = num;
      buildBatchTemplatePlan(num);
      updatePickedUI();
    }};
  }});

  inputCustomVideoCount.onchange = () => {{
    const val = Math.max(1, parseInt(inputCustomVideoCount.value, 10) || 30);
    targetVideoCount = val;
    btnBatchNumLabel.textContent = val;
    buildBatchTemplatePlan(val);
    updatePickedUI();
  }};

  // 11. STORY NAVIGATION
  function updateStoryNav() {{
    const total = parsedStories.length || 1;
    currentStoryIndexBadge.textContent = `${{currentStoryIdx + 1}} / ${{total}}`;
    updateLivePreview();
  }}

  btnPrevStory.onclick = () => {{
    if (currentStoryIdx > 0) {{
      currentStoryIdx--;
      updateStoryNav();
      updateBgVideoSource();
      updateLivePreview();
    }}
  }};

  btnNextStory.onclick = () => {{
    if (currentStoryIdx < parsedStories.length - 1) {{
      currentStoryIdx++;
      updateStoryNav();
      updateBgVideoSource();
      updateLivePreview();
    }}
  }};

  // 12. BACKGROUND VIDEO MANAGEMENT
  function updateBgVideoSource() {{
    if (selectStudioBgMode.value === "random") {{
      const clip = BG_CLIPS[currentStoryIdx % BG_CLIPS.length] || BG_CLIPS[0];
      studioBgVideo.src = `assets/backgrounds/${{clip}}`;
    }} else if (selectStudioBgMode.value === "fixed") {{
      studioBgVideo.src = `assets/backgrounds/${{activeSelectedBg || BG_CLIPS[0]}}`;
    }} else {{
      studioBgVideo.removeAttribute("src");
    }}
    studioBgVideo.currentTime = 0;
    studioBgVideo.play().catch(() => {{}});
  }}

  selectStudioBgMode.onchange = () => {{
    currentBgMode = selectStudioBgMode.value;
    updateBgVideoSource();
    updateLivePreview();
  }};

  uploadCustomBg.onchange = (e) => {{
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const url = URL.createObjectURL(files[0]);
    studioBgVideo.src = url;
    currentBgMode = "fixed";
    selectStudioBgMode.value = "fixed";
    selectedBgBadge.textContent = "Đang chọn: Clip vừa tải lên";
    studioBgVideo.play().catch(() => {{}});
    updateLivePreview();
  }};

  // 13. HIGH-FIDELITY DECONSTRUCTED CANVAS RENDERER FOR VIDEO RECORDING
  async function loadAvatar(src) {{
    if (avatarCache[src]) return avatarCache[src];
    return new Promise((resolve) => {{
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {{
        avatarCache[src] = img;
        resolve(img);
      }};
      img.onerror = () => resolve(null);
      img.src = src.startsWith("data:") ? src : `assets/avatars/${{src}}`;
    }});
  }}

  function drawRoundedRect(ctx, x, y, w, h, r) {{
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }}

  function drawStar(ctx, cx, cy, size, fill, shadowColor) {{
    ctx.save();
    ctx.beginPath();
    ctx.translate(cx, cy);
    if (shadowColor) {{
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 8;
    }}
    ctx.moveTo(0, -size / 2);
    ctx.quadraticCurveTo(size * 0.08, -size * 0.08, size / 2, 0);
    ctx.quadraticCurveTo(size * 0.08, size * 0.08, 0, size / 2);
    ctx.quadraticCurveTo(-size * 0.08, size * 0.08, -size / 2, 0);
    ctx.quadraticCurveTo(-size * 0.08, -size * 0.08, 0, -size / 2);
    ctx.fillStyle = fill || "#ffffff";
    ctx.fill();
    ctx.restore();
  }}

  function wrapTextLines(ctx, text, maxWidth) {{
    const words = text.split(/\\s+/);
    let line = "";
    let lines = [];
    for (let n = 0; n < words.length; n++) {{
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {{
        lines.push(line.trim());
        line = words[n] + " ";
      }} else {{
        line = testLine;
      }}
    }}
    lines.push(line.trim());
    return lines;
  }}

  // Render the exact deconstructed template onto 720 x 1280 canvas
  async function renderDeconstructedTemplateToCanvas(story, tpl) {{
    const W = 720;
    const H = 1280;
    const vars = tpl.vars || {{}};
    const ho = tpl.ho || "the-vet";

    const c1 = vars["c1"] || "#d9d0e6";
    const c2 = vars["c2"] || "#b7a5cf";
    const c3 = vars["c3"] || "#d3c6e3";
    const c4 = vars["c4"] || "#e8b64c";
    const c5 = vars["c5"] || "#fbfafc";
    const c6 = vars["c6"] || "#151515";
    const red = vars["red"] || "#6b1b7a";
    const cta = vars["cta"] || "#1f3f7a";

    // 1. DRAW BACKGROUND
    if (ho === "photo-card" || ho === "dark-photo" || ho === "bright-photo") {{
      if (studioBgVideo.readyState >= 2) {{
        studioCtx.drawImage(studioBgVideo, 0, 0, W, H);
        studioCtx.fillStyle = "rgba(0,0,0,0.45)";
        studioCtx.fillRect(0, 0, W, H);
      }} else {{
        studioCtx.fillStyle = "#1e1e24";
        studioCtx.fillRect(0, 0, W, H);
      }}
    }} else if (ho === "wood-desk") {{
      // Repeating wood grain background
      const grad = studioCtx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, c1);
      grad.addColorStop(0.3, c2);
      grad.addColorStop(0.7, c1);
      grad.addColorStop(1, c3);
      studioCtx.fillStyle = grad;
      studioCtx.fillRect(0, 0, W, H);
    }} else if (ho === "giay-rach") {{
      studioCtx.fillStyle = "#2c1d11";
      studioCtx.fillRect(0, 0, W, H);
    }} else {{
      const grad = studioCtx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      studioCtx.fillStyle = grad;
      studioCtx.fillRect(0, 0, W, H);
    }}

    // 2. DRAW MAIN CARD
    const cardX = 22;
    const cardY = 22;
    const cardW = 676;
    const cardH = 1178;
    const cardR = 34;

    studioCtx.save();

    if (ho === "the-vet") {{
      // Card sheet
      studioCtx.shadowColor = "rgba(0,0,0,0.22)";
      studioCtx.shadowBlur = 40;
      studioCtx.shadowOffsetY = 16;
      drawRoundedRect(studioCtx, cardX, cardY, cardW, cardH, cardR);
      studioCtx.fillStyle = c5;
      studioCtx.fill();
      studioCtx.shadowColor = "transparent";

      // Bottom gradient band
      studioCtx.save();
      drawRoundedRect(studioCtx, cardX, cardY, cardW, cardH, cardR);
      studioCtx.clip();
      const bandGrad = studioCtx.createLinearGradient(0, 1110, 0, 1200);
      bandGrad.addColorStop(0, "rgba(255,255,255,0)");
      bandGrad.addColorStop(1, c3);
      studioCtx.fillStyle = bandGrad;
      studioCtx.fillRect(cardX, 1110, cardW, 90);
      studioCtx.restore();

      // Sparkle stars
      drawStar(studioCtx, 48, 1134, 44, "#fff", c4);
      drawStar(studioCtx, 96, 1122, 22, "#fff", c4);
      drawStar(studioCtx, 628, 1134, 44, "#fff", c4);
      drawStar(studioCtx, 602, 1168, 22, "#fff", c4);

    }} else if (ho === "photo-card" || ho === "dark-photo" || ho === "bright-photo") {{
      // Thick white photo card
      studioCtx.shadowColor = "rgba(0,0,0,0.5)";
      studioCtx.shadowBlur = 50;
      drawRoundedRect(studioCtx, 20, 36, 680, 1120, 28);
      studioCtx.fillStyle = "#ffffff";
      studioCtx.fill();
      studioCtx.shadowColor = "transparent";

      // Bottom black action bar
      drawRoundedRect(studioCtx, 0, 1194, W, 86, 0);
      studioCtx.fillStyle = c4 || "#17181a";
      studioCtx.fill();

      // Action icons
      studioCtx.fillStyle = "#ffffff";
      studioCtx.font = "bold 26px sans-serif";
      studioCtx.textAlign = "center";
      studioCtx.fillText("❤️   💬   ↗️   🔖", W / 2, 1248);
      studioCtx.textAlign = "left";

    }} else if (ho === "anh-kinh") {{
      // Frosted Glassmorphism card
      studioCtx.shadowColor = "rgba(0,0,0,0.6)";
      studioCtx.shadowBlur = 50;
      drawRoundedRect(studioCtx, cardX, cardY, cardW, cardH, cardR);
      studioCtx.fillStyle = "rgba(20, 15, 35, 0.78)";
      studioCtx.fill();
      studioCtx.lineWidth = 2;
      studioCtx.strokeStyle = "rgba(255,255,255,0.25)";
      studioCtx.stroke();
      studioCtx.shadowColor = "transparent";

    }} else if (ho === "giay-rach") {{
      // Vintage torn paper card
      studioCtx.shadowColor = "rgba(0,0,0,0.4)";
      studioCtx.shadowBlur = 30;
      drawRoundedRect(studioCtx, 24, 30, 672, 1160, 18);
      studioCtx.fillStyle = c5 || "#f5ede0";
      studioCtx.fill();
      studioCtx.lineWidth = 3;
      studioCtx.strokeStyle = c2 || "#432a17";
      studioCtx.stroke();

    }} else if (ho === "wood-desk") {{
      // Notebook with metal spiral rings
      studioCtx.shadowColor = "rgba(0,0,0,0.35)";
      studioCtx.shadowBlur = 30;
      drawRoundedRect(studioCtx, 16, 56, 688, 1110, 16);
      studioCtx.fillStyle = "#ffffff";
      studioCtx.fill();
      studioCtx.shadowColor = "transparent";

      // Spiral rings along top
      for (let rx = 50; rx < 670; rx += 48) {{
        studioCtx.strokeStyle = "#9aa0a6";
        studioCtx.lineWidth = 4;
        drawRoundedRect(studioCtx, rx, 40, 14, 32, 7);
        studioCtx.stroke();
      }}

    }} else {{
      // Standard clean card
      studioCtx.shadowColor = "rgba(0,0,0,0.18)";
      studioCtx.shadowBlur = 30;
      drawRoundedRect(studioCtx, cardX, cardY, cardW, cardH, cardR);
      studioCtx.fillStyle = c5 || "#ffffff";
      studioCtx.fill();
      studioCtx.shadowColor = "transparent";
    }}
    studioCtx.restore();

    // 3. AVATAR
    const isRandomAv = document.querySelector('input[name="studioAvatarMode"]:checked')?.value === "random";
    const avFile = isRandomAv ? (AVATARS[currentStoryIdx % AVATARS.length]) : selectedAvatar;
    const avImg = await loadAvatar(avFile);

    const avX = parseFloat(vars["avatar-x"]) || 54;
    const avY = parseFloat(vars["avatar-y"]) || 52;
    const avSize = parseFloat(vars["avatar-size"]) || 104;

    studioCtx.save();
    drawRoundedRect(studioCtx, avX, avY, avSize, avSize, avSize / 2);
    studioCtx.clip();
    if (avImg) {{
      studioCtx.drawImage(avImg, avX, avY, avSize, avSize);
    }} else {{
      studioCtx.fillStyle = c4;
      studioCtx.fillRect(avX, avY, avSize, avSize);
    }}
    studioCtx.restore();

    // 4. SIGNATURE HIGHLIGHTER BRUSH (FOR THE-VET)
    const nameX = parseFloat(vars["name-x"]) || 180;
    const nameY = parseFloat(vars["name-y"]) || 52;
    const nameSize = parseFloat(vars["name-size"]) || 32;

    if (ho === "the-vet") {{
      studioCtx.save();
      const nbarGrad = studioCtx.createLinearGradient(nameX, nameY, nameX + 430, nameY);
      nbarGrad.addColorStop(0, c4);
      nbarGrad.addColorStop(0.88, c4);
      nbarGrad.addColorStop(1, "transparent");
      studioCtx.fillStyle = nbarGrad;
      studioCtx.translate(nameX, nameY);
      studioCtx.rotate(-0.014); // -0.8deg
      drawRoundedRect(studioCtx, 0, 0, 420, 54, 24);
      studioCtx.fill();
      studioCtx.restore();
    }}

    // Author / Page Name
    const displayName = story.page || studioPageName.value || story.author;
    const isSerif = ho === "the-vet" || ho === "giay-rach" || tpl.id.includes("serif");
    const nameFontFam = isSerif ? "Georgia, serif" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

    studioCtx.fillStyle = (ho === "anh-kinh") ? "#ffffff" : (c6 || "#1c2b4a");
    studioCtx.font = `bold ${{nameSize}}px ${{nameFontFam}}`;
    const textDrawX = ho === "the-vet" ? nameX + 18 : nameX;
    const textDrawY = ho === "the-vet" ? nameY + 38 : nameY + 36;
    studioCtx.fillText(displayName, textDrawX, textDrawY);

    // Verified Blue Badge
    const nameWidth = studioCtx.measureText(displayName).width;
    studioCtx.fillStyle = "#1d9bf0";
    studioCtx.beginPath();
    studioCtx.arc(textDrawX + nameWidth + 20, textDrawY - 10, 12, 0, Math.PI * 2);
    studioCtx.fill();
    studioCtx.fillStyle = "#ffffff";
    studioCtx.font = "bold 14px sans-serif";
    studioCtx.fillText("✓", textDrawX + nameWidth + 15, textDrawY - 5);

    // Time & Handle
    const timeX = parseFloat(vars["time-x"]) || nameX;
    const timeY = parseFloat(vars["time-y"]) || (nameY + 50);
    const timeSize = parseFloat(vars["time-size"]) || 22;
    studioCtx.fillStyle = (ho === "anh-kinh") ? "#a7f3d0" : "#4a4f57";
    studioCtx.font = `500 ${{timeSize}}px ${{nameFontFam}}`;
    studioCtx.fillText(`(${{story.timeAgo || "3h ago"}}) • ${{story.handle || "@story"}}`, textDrawX, timeY + 28);

    // 5. BODY TEXT (WITH PROPORTIONAL AUTO-FIT)
    const bodyX = parseFloat(vars["body-x"]) || 58;
    const bodyY = parseFloat(vars["body-y"]) || 190;
    const bodyW = parseFloat(vars["body-w"]) || 604;
    const bodyH = parseFloat(vars["body-h"]) || 916;

    const bodyTextColor = (ho === "anh-kinh") ? "#f0fdf4" : (c6 || "#1c2b4a");
    const rawParagraphs = (story.content || "").split(/\\n+/).map(p => p.trim()).filter(Boolean);
    const allText = rawParagraphs.join(" ");

    // Determine optimal font size based on text length
    let fontSize = 34;
    if (allText.length > 500) fontSize = 26;
    else if (allText.length > 350) fontSize = 29;
    else if (allText.length > 200) fontSize = 32;

    const lineHeight = fontSize * 1.55;
    studioCtx.font = `500 ${{fontSize}}px ${{nameFontFam}}`;

    const lines = wrapTextLines(studioCtx, allText, bodyW);
    let curY = bodyY + fontSize;

    for (let k = 0; k < lines.length; k++) {{
      if (curY > bodyY + bodyH - 30) break;
      const l = lines[k];
      
      let isHl = false;
      if (story.highlights && story.highlights.length > 0) {{
        isHl = story.highlights.some(h => l.toLowerCase().includes(h.toLowerCase().slice(0, 15)));
      }} else {{
        isHl = (k === 0 || k === lines.length - 1);
      }}

      if (isHl) {{
        studioCtx.fillStyle = red || "#c2185b";
        studioCtx.font = `bold ${{fontSize}}px ${{nameFontFam}}`;
      }} else {{
        studioCtx.fillStyle = bodyTextColor;
        studioCtx.font = `500 ${{fontSize}}px ${{nameFontFam}}`;
      }}
      studioCtx.fillText(l, bodyX, curY);
      curY += lineHeight;
    }}

    // 6. BOTTOM CTA BUTTON / BOX
    const ctaboxX = parseFloat(vars["ctabox-x"]) || 90;
    const ctaboxY = parseFloat(vars["ctabox-y"]) || 1128;
    const ctaboxW = parseFloat(vars["ctabox-w"]) || 540;
    const ctaboxH = parseFloat(vars["ctabox-h"]) || 54;
    const ctaboxSize = parseFloat(vars["ctabox-size"]) || 22;

    if (ho !== "photo-card" && ho !== "dark-photo") {{
      studioCtx.save();
      drawRoundedRect(studioCtx, ctaboxX, ctaboxY, ctaboxW, ctaboxH, 27);
      studioCtx.fillStyle = cta || "#10b981";
      studioCtx.fill();
      studioCtx.fillStyle = "#ffffff";
      studioCtx.font = `bold ${{ctaboxSize}}px ${{nameFontFam}}`;
      studioCtx.textAlign = "center";
      studioCtx.fillText(story.cta || "Continuer la lecture", ctaboxX + ctaboxW / 2, ctaboxY + ctaboxH / 2 + ctaboxSize * 0.35);
      studioCtx.textAlign = "left";
      studioCtx.restore();
    }}
  }}

  // 14. AUDIO ENGINE & VIDEO RECORDING
  function getAudioStreamNodes(audioSrc) {{
    if (!globalAudioCtx) {{
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      globalAudioCtx = new AudioCtx();
      globalAudioElement = new Audio();
      globalAudioElement.crossOrigin = "anonymous";
      globalAudioElement.loop = true;
      globalAudioSourceNode = globalAudioCtx.createMediaElementSource(globalAudioElement);
      globalAudioDestNode = globalAudioCtx.createMediaStreamDestination();
      globalAudioSourceNode.connect(globalAudioDestNode);
      globalAudioSourceNode.connect(globalAudioCtx.destination);
    }}
    if (globalAudioCtx.state === "suspended") {{
      globalAudioCtx.resume();
    }}
    if (globalAudioElement.src !== audioSrc && !globalAudioElement.src.endsWith(audioSrc)) {{
      globalAudioElement.src = audioSrc;
    }}
    return {{ audioElem: globalAudioElement, destNode: globalAudioDestNode }};
  }}

  async function recordStoryVideo(story, durationSec, storyIndex) {{
    isRecording = true;
    currentStoryIdx = storyIndex;
    updateStoryNav();
    updateBgVideoSource();

    const tpl = getTemplateForStory(storyIndex);
    await renderDeconstructedTemplateToCanvas(story, tpl);
    
    const fps = 30;
    const canvasStream = studioCanvas.captureStream(fps);
    const audioTrackSrc = "assets/audio/music_1.mp4";
    const {{ audioElem, destNode }} = getAudioStreamNodes(audioTrackSrc);

    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...destNode.stream.getAudioTracks()
    ]);

    audioElem.currentTime = 0;
    await audioElem.play().catch(() => {{}});

    let animId;
    function pumpFrames() {{
      renderDeconstructedTemplateToCanvas(story, tpl);
      animId = requestAnimationFrame(pumpFrames);
    }}
    animId = requestAnimationFrame(pumpFrames);

    const recorder = new MediaRecorder(combinedStream, {{
      mimeType: MediaRecorder.isTypeSupported("video/mp4") ? "video/mp4" : "video/webm;codecs=vp9",
      videoBitsPerSecond: 6000000
    }});

    const chunks = [];
    recorder.ondataavailable = e => {{ if (e.data && e.data.size > 0) chunks.push(e.data); }};

    return new Promise(resolve => {{
      recorder.onstop = () => {{
        cancelAnimationFrame(animId);
        audioElem.pause();
        isRecording = false;
        const blob = new Blob(chunks, {{ type: "video/mp4" }});
        resolve(blob);
      }};
      recorder.start(100);
      setTimeout(() => recorder.stop(), durationSec * 1000);
    }});
  }}

  // 15. ZIP ARCHIVE CREATOR (100% Client-Side Pure JS)
  function crc32(buf) {{
    let c = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xFF];
    return (c ^ (-1)) >>> 0;
  }}
  const CRC_TABLE = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {{
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    CRC_TABLE[n] = c;
  }}

  async function createZipBlob(fileList) {{
    const textEncoder = new TextEncoder();
    const parts = [];
    const centralDirs = [];
    let offset = 0;

    for (const f of fileList) {{
      const nameBytes = textEncoder.encode(f.name);
      const dataBytes = new Uint8Array(await f.blob.arrayBuffer());
      const crc = crc32(dataBytes);
      const size = dataBytes.length;

      const lh = new Uint8Array(30);
      const lv = new DataView(lh.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, size, true);
      lv.setUint32(22, size, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);

      parts.push(lh, nameBytes, dataBytes);

      const ch = new Uint8Array(46);
      const cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, size, true);
      cv.setUint32(24, size, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);

      centralDirs.push(ch, nameBytes);
      offset += 30 + nameBytes.length + size;
    }}

    const cdOffset = offset;
    let cdSize = 0;
    for (const p of centralDirs) cdSize += p.length;

    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, fileList.length, true);
    ev.setUint16(10, fileList.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, cdOffset, true);
    ev.setUint16(20, 0, true);

    return new Blob([...parts, ...centralDirs, eocd], {{ type: "application/zip" }});
  }}

  // 16. RENDER SINGLE VIDEO TEST (WITH PAGE NAME)
  btnRenderSingle.onclick = async () => {{
    if (!parsedStories || parsedStories.length === 0) return alert("Không có kịch bản để render!");
    const story = parsedStories[currentStoryIdx] || parsedStories[0];
    const dur = parseInt(selectStudioDuration.value, 10);
    const tpl = getTemplateForStory(currentStoryIdx);

    const pageRaw = (story.page || studioPageName.value || "Reels").trim();
    const safePage = pageRaw.replace(/[/\\\\:*?"<>|]/g, '_').trim() || "Page";
    const safeNum = String(currentStoryIdx + 1).padStart(2, "0");
    const safeAuthor = (story.author || "Story").replace(/[/\\\\:*?"<>|]/g, '_').trim();
    const safeBaseName = `${{safePage}}_Video_${{safeNum}}_${{safeAuthor}}`;

    btnRenderSingle.disabled = true;
    renderProgressBox.style.display = "block";
    renderStatusText.textContent = `Đang render thử video #${{currentStoryIdx + 1}} [${{tpl.label}}] (${{dur}}s)...`;
    renderProgressBar.style.width = "40%";
    renderPercentText.textContent = "40%";

    const blob = await recordStoryVideo(story, dur, currentStoryIdx);
    
    renderProgressBar.style.width = "100%";
    renderPercentText.textContent = "100%";
    renderStatusText.textContent = "✓ Hoàn thành! Đang tải file xuống...";

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${{safeBaseName}}.mp4`;
    a.click();

    const txtContent = `========================================================\\n🎬 THÔNG TIN XUẤT BẢN REELS / TIKTOK\\n========================================================\\nTÊN FANPAGE / KÊNH: ${{pageRaw}}\\nVIDEO: Video #${{currentStoryIdx + 1}} (${{safeBaseName}}.mp4)\\nTÁC GIẢ / AUTHOR: ${{story.author}}\\nHANDLE / KÊNH: ${{story.handle}}\\nTHỜI GIAN HIỂN THỊ: ${{story.timeAgo}}\\nMẪU THIẾT KẾ: ${{tpl.label}} (Màu: ${{tpl.palName}})\\n\\n--------------------------------------------------------\\n📝 TIÊU ĐỀ / CAPTION:\\n${{story.title}}\\n\\n📖 NỘI DUNG TRUYỆN:\\n${{story.content}}\\n\\n🔥 HIGHLIGHTS (CÂU BÔI ĐỎ TRONG VIDEO):\\n${{(story.highlights && story.highlights.length) ? story.highlights.join(' | ') : 'Tự động bôi đỏ câu đầu & câu cuối'}}\\n\\n👉 NÚT KÊU GỌI (CTA):\\n${{story.cta}}\\n\\n🔗 LINK GHIM BÌNH LUẬN / BIO:\\n${{story.pinLink}}\\n========================================================`;

    const txtBlob = new Blob([txtContent], {{ type: "text/plain;charset=utf-8" }});
    const a2 = document.createElement("a");
    a2.href = URL.createObjectURL(txtBlob);
    a2.download = `${{safeBaseName}}.txt`;
    a2.click();

    btnRenderSingle.disabled = false;
    renderStatusText.textContent = `✓ Đã tải 1 Video thành công: [${{safeBaseName}}] (.mp4 + .txt)`;
  }};

  // 17. BATCH RENDER N STORIES (GUARANTEED COUNT & DECONSTRUCTED TEMPLATE MATCHING)
  btnRenderBatch30.onclick = async () => {{
    if (!parsedStories || parsedStories.length === 0) return alert("Không có kịch bản để render! Vui lòng nhập hoặc nạp kịch bản.");
    
    const count = targetVideoCount;
    const dur = parseInt(selectStudioDuration.value, 10);
    
    buildBatchTemplatePlan(count);

    btnRenderBatch30.disabled = true;
    renderProgressBox.style.display = "block";
    btnDownloadAllZip.style.display = "none";
    renderedFiles = [];

    const defaultPageRaw = studioPageName.value.trim() || "Reels_Page";

    for (let i = 0; i < count; i++) {{
      const story = parsedStories[i % parsedStories.length];
      const activeTpl = getTemplateForStory(i);

      const pageRaw = (story.page || defaultPageRaw).trim();
      const safePage = pageRaw.replace(/[/\\\\:*?"<>|]/g, '_').trim() || "Page";
      const safeNum = String(i + 1).padStart(2, "0");
      const safeAuthor = (story.author || "Story").replace(/[/\\\\:*?"<>|]/g, '_').trim();
      const safeFileName = `${{safePage}}_Video_${{safeNum}}_${{safeAuthor}}`;

      renderStatusText.textContent = `Đang render video ${{i + 1}}/${{count}}: [${{safeFileName}}] - Mẫu: ${{activeTpl.label}}...`;
      const pct = Math.round(((i + 1) / count) * 100);
      renderProgressBar.style.width = pct + "%";
      renderPercentText.textContent = pct + "%";

      const mp4Blob = await recordStoryVideo(story, dur, i);

      renderedFiles.push({{
        name: safeFileName + ".mp4",
        blob: mp4Blob
      }});

      const txtContent = `========================================================\\n🎬 THÔNG TIN XUẤT BẢN REELS / TIKTOK\\n========================================================\\nTÊN FANPAGE / KÊNH: ${{pageRaw}}\\nVIDEO: Video #${{i + 1}} / ${{count}} (${{safeFileName}}.mp4)\\nTÁC GIẢ / AUTHOR: ${{story.author}}\\nHANDLE / KÊNH: ${{story.handle}}\\nTHỜI GIAN HIỂN THỊ: ${{story.timeAgo}}\\nMẪU THIẾT KẾ: ${{activeTpl.label}} (Màu: ${{activeTpl.palName}})\\n\\n--------------------------------------------------------\\n📝 TIÊU ĐỀ / CAPTION:\\n${{story.title}}\\n\\n📖 NỘI DUNG TRUYỆN:\\n${{story.content}}\\n\\n🔥 HIGHLIGHTS (CÂU BÔI ĐỎ TRONG VIDEO):\\n${{(story.highlights && story.highlights.length) ? story.highlights.join(' | ') : 'Tự động bôi đỏ câu đầu & câu cuối'}}\\n\\n👉 NÚT KÊU GỌI (CTA):\\n${{story.cta}}\\n\\n🔗 LINK GHIM BÌNH LUẬN / BIO:\\n${{story.pinLink}}\\n========================================================`;

      renderedFiles.push({{
        name: safeFileName + ".txt",
        blob: new Blob([txtContent], {{ type: "text/plain;charset=utf-8" }})
      }});
    }}

    renderProgressBar.style.width = "100%";
    renderPercentText.textContent = "100%";
    renderStatusText.textContent = `✓ Đã render xong đúng ${{count}} video! Đang nén file ZIP tự động tải về...`;
    
    // Auto download zip
    btnDownloadAllZip.style.display = "block";
    btnDownloadAllZip.textContent = `📦 TẢI TOÀN BỘ ${{count}} VIDEO & TXT (.ZIP TRỌN GÓI)`;
    btnDownloadAllZip.click();

    btnRenderBatch30.disabled = false;
  }};

  btnDownloadAllZip.onclick = async () => {{
    if (renderedFiles.length === 0) return;
    const defaultPageRaw = studioPageName.value.trim() || "Reels_Page";
    const safePage = defaultPageRaw.replace(/[/\\\\:*?"<>|]/g, '_').trim();
    btnDownloadAllZip.textContent = "⏳ Đang nén file ZIP...";
    btnDownloadAllZip.disabled = true;
    const zipBlob = await createZipBlob(renderedFiles);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(zipBlob);
    a.download = `${{safePage}}_Tron_Goi_${{renderedFiles.length / 2}}_Videos.zip`;
    a.click();
    btnDownloadAllZip.textContent = "✓ Đã tải file ZIP thành công!";
    btnDownloadAllZip.disabled = false;
  }};

  // INIT
  renderBgGrid();
  renderAvatars();
  reloadStories();
  setTimeout(updatePickedUI, 400);
}})();
</script>
"""

# Append Studio modal and Studio script to end of html
html = html + "\n" + studio_modal_html + "\n" + studio_script + "\n"

# Save to index.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Build v5 complete! Saved updated index.html with live native iframe preview and deconstructed template canvas rendering.")
