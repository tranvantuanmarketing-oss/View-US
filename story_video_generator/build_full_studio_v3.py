import os, json, re

print("Starting build_full_studio_v3.py...")

# 1. Read base competitor template
with open('kho-mau-v1.6.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# 2. Extract MAU data
m_mau = re.search(r'<script id="mau-data"[^>]*>(.*?)</script>', html, re.S)
mau_data = json.loads(m_mau.group(1))

# Inspect background clips and avatar assets
bg_files = sorted([f for f in os.listdir('assets/backgrounds') if f.endswith('.mp4')])
avatar_files = sorted([f for f in os.listdir('assets/avatars') if f.lower().endswith(('.jpg', '.png', '.jpeg'))])

# 3. Read sample stories
sample_stories_en = ""
if os.path.exists('batch_30_stories.txt'):
    with open('batch_30_stories.txt', 'r', encoding='utf-8') as f:
        sample_stories_en = f.read()

# Multi-language sample story templates
stories_by_country = {
    "us": sample_stories_en,
    "fr": """Author: Franck Meynard
Handle: @verites_dhier
Title: Le secret de ma belle-mère
Content: J'ai adopté seul la petite que vingt familles avaient refusée. Son diagnostic faisait reculer tout le monde. « Vous avez le temps de réfléchir, monsieur. » J'ai signé les pages en moins de quatre minutes. Elle avait onze mois. Je lui ai dit le premier soir : « On y va ensemble, d'accord ? » Dix ans ont passé. Elle marchait, elle lisait, elle riait fort. Puis Greg, que je n'avais pas revu depuis, s'est présenté devant chez nous.
Pin_Link: https://example.com/fr/histoire-1
---
Author: Camille Durand
Handle: @l_ame_silencieuse
Title: Une lettre retrouvée après 15 ans
Content: Le quatrième jour après l'opération, ma belle-mère a déposé un dossier devant moi. Ma fille dormait dans la pièce voisine. « Signe ceci sans poser de questions », m'a-t-elle ordonné. Quand j'ai refusé, elle a sorti une vieille enveloppe jaune avec l'écriture manuscrite de ma mère décédée.
Pin_Link: https://example.com/fr/histoire-2
---
Author: Pierre Laurent
Handle: @secrets_de_famille
Title: La vérité sous le plancher
Content: Mon grand-père m'a toujours interdit d'ouvrir la porte du grenier. Le jour de ses funérailles, j'ai trouvé une clé rouillée dans la poche de son manteau. Ce que j'ai découvert là-haut a changé l'histoire de notre famille à jamais.
Pin_Link: https://example.com/fr/histoire-3""",

    "nl": """Author: Sanne de Vries
Handle: @verborgen_tranen
Title: Het geheim achter de gesloten deur
Content: Vier dagen na de operatie legde mijn schoonmoeder een stapel papieren voor me neer. Mijn dochtertje sliep rustig in de kamer ernaast. "Teken dit gewoon en vraag niets," zei ze koud. Toen ik weigerde, trok ze een vergeelde envelop tevoorschijn met het handschrift van mijn overleden moeder.
Pin_Link: https://example.com/nl/verhaal-1
---
Author: Jan van Dijk
Handle: @stille_notities
Title: De brief die alles veranderde
Content: Ik adopteerde het meisje dat door twintig families was afgewezen. Iedereen deinsde terug voor haar medische dossier. Maar ik tekende binnen enkele minuten. Nu, tien jaar later, staat de biologische vader plotseling voor mijn voordeur.
Pin_Link: https://example.com/nl/verhaal-2
---
Author: Emma Bakker
Handle: @levenslessen_nl
Title: Wat mijn vader nooit vertelde
Content: Mijn vader had altijd één kluis in zijn werkkamer die niemand mocht aanraken. Na jeho overlijden vonden we het testament, en het eerste wat erin stond was een bekentenis die we nooit hadden verwacht.
Pin_Link: https://example.com/nl/verhaal-3""",

    "de": """Author: Anna Schmidt
Handle: @stille_wahrheiten
Title: Das Geheimnis meiner Schwiegermutter
Content: Vier Tage nach der Operation legte meine Schwiegermutter einen Stapel Dokumente vor mich hin. Meine Tochter schlief im Nebenzimmer. „Unterschreib das einfach und stell keine Fragen“, sagte sie kalt. Als ich mich weigerte, holte sie einen vergilbten Umschlag mit der Handschrift meiner verstorbenen Mutter hervor.
Pin_Link: https://example.com/de/geschichte-1
---
Author: Lukas Weber
Handle: @schicksalswege
Title: Das Mädchen aus Zimmer 4
Content: Ich habe das Mädchen adoptiert, das zwanzig Familien abgelehnt hatten. Ihre Diagnose machte allen Angst. Aber ich unterschrieb die Papiere in weniger als vier Minuten. Zehn Jahre vergingen voller Glück, bis plötzlich ihr leiblicher Vater vor der Tür stand.
Pin_Link: https://example.com/de/geschichte-2""",

    "es": """Author: Mateo Hernandez
Handle: @historias_del_alma
Title: El secreto de mi suegra
Content: Al cuarto día de la operación, mi suegra puso una carpeta frente a mí. Mi hija dormía en la habitación contigua. «Firma esto sin hacer preguntas», me ordenó con frialdad. Cuando me negué, sacó un viejo sobre amarillento con la letra de mi difunta madre.
Pin_Link: https://example.com/es/historia-1
---
Author: Sofia Martinez
Handle: @ecos_del_pasado
Title: La niña que nadie quería
Content: Adopté solo a la pequeña que veinte familias habían rechazado. Su diagnóstico asustaba a todos. Pero firmé los papeles en menos de cuatro minutos. Diez años después, alguien llamó a la puerta con una verdad desgarradora.
Pin_Link: https://example.com/es/historia-2""",

    "vi": """Author: Minh Tuấn
Handle: @goc_nhin_cuoc_song
Title: Đứa trẻ bị 20 gia đình từ chối
Content: Tôi một mình nhận nuôi đứa bé mà hai mươi gia đình trước đó đều lắc đầu từ chối. Hồ sơ bệnh án của con bé khiến ai cũng chùn bước. Nhưng tôi đã ký vào giấy nhận nuôi chỉ trong chưa đầy bốn phút. Mười năm trôi qua bình yên, cho đến buổi chiều hôm qua khi một người lạ xuất hiện...
Pin_Link: https://example.com/vi/truyen-1
---
Author: Hoài An
Handle: @chuyen_chua_ke
Title: Chiếc phong bì sau mười năm
Content: Ngày thứ tư sau ca mổ, mẹ chồng đặt trước mặt tôi một tập giấy tờ. Con gái tôi đang ngủ trong phòng bên. "Ký vào đây đi, đừng hỏi nhiều," bà nói dứt khoát. Khi tôi từ chối, bà rút ra chiếc phong bì ố vàng với nét chữ quen thuộc của mẹ đẻ tôi đã mất mười năm trước.
Pin_Link: https://example.com/vi/truyen-2"""
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

/* Tool Interface Wallpaper: Canopy sunlight image blended with dark emerald glass */
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

# Replace existing custom CSS if present, or append before </head>
if "/* === TULIP PASTEL LAVENDER THEME & GLASSMORPHISM === */" in html:
    html = re.sub(r'/\* === TULIP PASTEL.*?/\* STUDIO MODAL STYLING \*/.*?</style>', f"<style>{canopy_tool_css}</style>", html, flags=re.S)
elif "</head>" in html:
    html = html.replace("</head>", f"<style>{canopy_tool_css}</style>\n</head>", 1)

# 5. Replace Old Competitor Header with Sleek New Pro Header
# Note: we include dummy hidden inputs for pTen, pNv, pLang, tenXuat, btnTao so competitor legacy JS won't break
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
  <!-- Hidden legacy compatibility tags -->
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
else:
    html = html.replace("</body>", f"{upgraded_dlg_nen}\n</body>", 1)

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

# 8. Studio Modal HTML
studio_modal_html = f"""
{floating_bar_html}

<!-- STUDIO MODAL: BƯỚC GEN VIDEO ĐA QUỐC GIA -->
<div id="studioModal">
  <div class="studio-box">
    <!-- HEADER -->
    <div class="studio-header">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 26px;">🎬</span>
        <div>
          <h2 style="margin: 0; font-size: 18px; color: #fff; font-weight: 800;">Studio Gen Video & Đóng Gói Trọn Gói (.ZIP)</h2>
          <p style="margin: 2px 0 0; font-size: 12px; color: #a7f3d0;">Chọn quốc gia/ngôn ngữ • Tải avatar & nội dung • Chọn số lượng video cần xuất</p>
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
              <label style="display: block; font-size: 12px; color: #a7f3d0; margin-bottom: 4px; font-weight: 700;">Tên Fanpage / Kênh Video:</label>
              <input type="text" id="studioPageName" value="Daily Confessions" style="width: 100%; background: #0c1611; color: #fff; border: 1px solid #10b981; padding: 8px 10px; border-radius: 8px; font-size: 13px; font-weight: 600;" placeholder="Ví dụ: Daily Secrets, Góc Khuất...">
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
            <h4 style="margin: 0; color: #34d399; font-size: 14px;">📝 3. Nội Dung Kịch Bản (<span id="statStoryCountDisplay">30</span> câu chuyện)</h4>
            <div style="display: flex; gap: 8px;">
              <label style="cursor: pointer; background: rgba(52,211,153,0.2); border: 1px dashed #34d399; color: #a7f3d0; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                📂 Tải file kịch bản (.txt/.json)
                <input type="file" id="uploadScriptInput" accept=".txt,.json" style="display: none;">
              </label>
              <button id="btnReloadSampleStories" type="button" class="ghost" style="padding: 3px 10px; font-size: 12px; border-radius: 6px; cursor: pointer;">🔄 Nạp lại mẫu</button>
            </div>
          </div>
          <textarea id="studioBatchTextarea" style="width: 100%; height: 180px; background: #0a140f; color: #d1fae5; border: 1px solid #1e3a2b; border-radius: 8px; padding: 10px; font-family: monospace; font-size: 12px; resize: vertical;" placeholder="Dán nội dung các câu chuyện vào đây..."></textarea>
        </div>
      </div>

      <!-- RIGHT: LIVE PREVIEW & RENDER ACTIONS -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 14px; background: rgba(14, 25, 20, 0.6); border: 1px solid rgba(52,211,153,0.25); border-radius: 14px; padding: 16px;">
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
          <span style="font-size: 13px; font-weight: 700; color: #d1fae5;">👁️ Xem Trước Video (1080x1920):</span>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button id="btnPrevStory" class="ghost" style="padding: 3px 10px; border-radius: 6px; cursor: pointer;">◀</button>
            <span id="currentStoryIndexBadge" style="font-size: 12px; font-weight: 700; color: #34d399; background: rgba(52,211,153,0.15); padding: 3px 8px; border-radius: 99px;">1 / 30</span>
            <button id="btnNextStory" class="ghost" style="padding: 3px 10px; border-radius: 6px; cursor: pointer;">▶</button>
          </div>
        </div>

        <div id="previewTplInfo" style="width: 100%; font-size: 11px; color: #a7f3d0; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 6px;">
          Video #1: [Mẫu đang xem]
        </div>

        <!-- CANVAS WRAPPER -->
        <div style="position: relative; width: 270px; height: 480px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6); border: 2px solid rgba(52,211,153,0.4);">
          <canvas id="studioPreviewCanvas" width="1080" height="1920" style="width: 100%; height: 100%; object-fit: contain; background: #000;"></canvas>
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

# 9. Modern Studio JavaScript Engine
studio_script = f"""
<!-- STUDIO JAVASCRIPT ENGINE -->
<script>
(function() {{
  const BG_CLIPS = {json.dumps(bg_files)};
  let AVATARS = {json.dumps(avatar_files)};
  const STORIES_BY_COUNTRY = {json.dumps(stories_by_country)};
  
  let currentCountry = "us";
  let targetVideoCount = 30;
  let currentBgMode = "random"; // Default to 35 real video background clips!
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

  // Batch template mapping: assigns which template each video in the batch will use
  let batchTemplatePlan = [];

  // Helper to extract colors from a palette HTML
  function extractColorsFromPal(palHtml) {{
    const colors = {{}};
    const re = /--(c[1-6]|red|cta|ink|bg|fg|accent):\\s*(#[a-fA-F0-9]{{3,8}}|rgba?\\([^)]+\\))/g;
    let m;
    while ((m = re.exec(palHtml || "")) !== null) {{
      colors[m[1]] = m[2];
    }}
    return colors;
  }}

  // DOM Elements
  const dlgNen = document.getElementById("dlgNen");
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
          const colors = extractColorsFromPal(activePal.html || "");
          picked.push({{
            index: idx,
            id: m.id,
            label: m.label,
            ho: m.ho || "the-vet",
            palIdx: palIdx,
            palId: activePal.id,
            palName: `${{palIdx + 1}}/${{m.pals.length}} (${{activePal.id}})`,
            colors: colors
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
      // Fallback: if user didn't pick any card, use first template
      const m0 = MAU[0];
      const t0 = {{
        index: 0,
        id: m0.id,
        label: m0.label,
        ho: m0.ho || "the-vet",
        palIdx: 0,
        palId: m0.pals[0].id,
        palName: `1/${{m0.pals.length}} (${{m0.pals[0].id}})`,
        colors: extractColorsFromPal(m0.pals[0].html)
      }};
      batchTemplatePlan = Array(count).fill(t0);
      return;
    }}

    if (picked.length === 1) {{
      // USER REQUEST: Nếu chọn 1 mẫu thì sẽ làm đúng 1 mẫu thế!
      batchTemplatePlan = Array(count).fill(picked[0]);
      return;
    }}

    // USER REQUEST: Những mẫu nào chọn thì tự động random gen video lộn xộn giữa các mẫu!
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
    return {{
      index: 0,
      id: m0.id,
      label: m0.label,
      ho: m0.ho || "the-vet",
      palIdx: 0,
      palId: m0.pals[0].id,
      palName: `1/${{m0.pals.length}}`,
      colors: extractColorsFromPal(m0.pals[0].html)
    }};
  }}

  // 3. UPDATE PICKED UI (HEADER, FLOATING BAR, AND STUDIO BANNER)
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
      studioTemplateModeTitle.innerHTML = `🎲 CHẾ ĐỘ RANDOM LỘN XỘN GỮA ${{count}} MẪU ĐÃ CHỌN:`;
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
    updatePreviewBadge();
    renderCanvasPreview();
  }}

  function updatePreviewBadge() {{
    const story = parsedStories[currentStoryIdx] || parsedStories[0];
    const tpl = getTemplateForStory(currentStoryIdx);
    if (previewTplInfo && tpl) {{
      previewTplInfo.textContent = `Video #${{currentStoryIdx + 1}}: [${{tpl.label}} • ${{tpl.palName}}] - ${{story ? story.author : ""}}`;
    }}
  }}

  // Hook into grid events: whenever card checkbox or palette button is clicked
  document.addEventListener("click", (e) => {{
    if (e.target.closest(".card .pal button") || e.target.closest(".card .pick input") || e.target.closest(".card") || e.target.id === "clear") {{
      setTimeout(updatePickedUI, 40);
    }}
  }});

  // 4. OPEN & CLOSE STUDIO MODAL
  btnMoStudio.onclick = () => {{ studioModal.style.display = "flex"; updatePickedUI(); }};
  btnFloatingGen.onclick = () => {{ studioModal.style.display = "flex"; updatePickedUI(); }};
  studioCloseBtn.onclick = () => {{ studioModal.style.display = "none"; }};
  btnNenGoStudio.onclick = () => {{
    dlgNen.close();
    studioModal.style.display = "flex";
    updatePickedUI();
  }};

  // 5. TABS FOR KHO NỀN
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

  // 6. RENDER KHO NỀN GRID
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
        renderCanvasPreview();
      }};
      bgVideoGrid.appendChild(card);
    }});
  }}

  // 7. RENDER AVATARS
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
        renderCanvasPreview();
      }};
      studioAvatarList.appendChild(item);
    }});
  }}

  // Custom Avatar Upload
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
        renderCanvasPreview();
      }};
      reader.readAsDataURL(file);
    }});
  }};

  // 8. PARSE STORIES & MULTI-COUNTRY HANDLING
  function parseStories(text) {{
    const blocks = text.split(/\\n---+\\n/).map(b => b.trim()).filter(Boolean);
    const stories = [];
    blocks.forEach((block, idx) => {{
      const authorMatch = block.match(/Author:\\s*([^\\n]+)/i);
      const handleMatch = block.match(/Handle:\\s*([^\\n]+)/i);
      const titleMatch = block.match(/Title:\\s*([^\\n]+)/i);
      const pinMatch = block.match(/Pin_Link:\\s*([^\\n]+)/i);
      const contentMatch = block.match(/Content:\\s*([\\s\\S]+?)(?:Pin_Link:|$)/i);

      const defaultAuthor = studioAuthorName.value.replace('@', '') || "TrueStory";
      const defaultHandle = studioAuthorName.value || "@truestory";

      stories.push({{
        index: idx,
        author: authorMatch ? authorMatch[1].trim() : defaultAuthor,
        handle: handleMatch ? handleMatch[1].trim() : defaultHandle,
        title: titleMatch ? titleMatch[1].trim() : `Story #${{idx + 1}}`,
        content: contentMatch ? contentMatch[1].trim() : block,
        pinLink: pinMatch ? pinMatch[1].trim() : "https://example.com/story-" + (idx + 1)
      }});
    }});
    return stories;
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
    renderCanvasPreview();
  }}

  btnReloadSampleStories.onclick = reloadStories;

  studioBatchTextarea.oninput = () => {{
    parsedStories = parseStories(studioBatchTextarea.value);
    statStoryCountDisplay.textContent = parsedStories.length;
    buildBatchTemplatePlan(targetVideoCount);
    updateStoryNav();
    renderCanvasPreview();
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
      renderCanvasPreview();
    }};
    reader.readAsText(file);
  }};

  // Change Country / Target Language
  selectStudioCountry.onchange = () => {{
    currentCountry = selectStudioCountry.value;
    const countryNames = {{
      "us": {{ page: "Daily Confessions", author: "@daily_confessions" }},
      "fr": {{ page: "Vérités Cachées", author: "@verites_dhier" }},
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
      updateStoryNav();
      renderCanvasPreview();
    }};
  }});

  inputCustomVideoCount.onchange = () => {{
    const val = Math.max(1, parseInt(inputCustomVideoCount.value, 10) || 30);
    targetVideoCount = val;
    btnBatchNumLabel.textContent = val;
    buildBatchTemplatePlan(val);
    updateStoryNav();
    renderCanvasPreview();
  }};

  // 9. STORY NAVIGATION
  function updateStoryNav() {{
    const total = parsedStories.length || 1;
    currentStoryIndexBadge.textContent = `${{currentStoryIdx + 1}} / ${{total}}`;
    updatePreviewBadge();
  }}

  btnPrevStory.onclick = () => {{
    if (currentStoryIdx > 0) {{
      currentStoryIdx--;
      updateStoryNav();
      updateBgVideoSource();
      renderCanvasPreview();
    }}
  }};

  btnNextStory.onclick = () => {{
    if (currentStoryIdx < parsedStories.length - 1) {{
      currentStoryIdx++;
      updateStoryNav();
      updateBgVideoSource();
      renderCanvasPreview();
    }}
  }};

  // 10. BACKGROUND VIDEO MANAGEMENT
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
    renderCanvasPreview();
  }};

  // Custom Video Background Upload
  uploadCustomBg.onchange = (e) => {{
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const url = URL.createObjectURL(files[0]);
    studioBgVideo.src = url;
    currentBgMode = "fixed";
    selectStudioBgMode.value = "fixed";
    selectedBgBadge.textContent = "Đang chọn: Clip vừa tải lên";
    studioBgVideo.play().catch(() => {{}});
  }};

  // 11. HELPER CANVAS DRAWING FUNCTIONS
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

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines, highlightColor) {{
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

    if (lines.length > maxLines) {{
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] += "...";
    }}

    for (let k = 0; k < lines.length; k++) {{
      const curLine = lines[k];
      const curY = y + (k * lineHeight);
      if (k === 0 || k === lines.length - 1) {{
        ctx.fillStyle = highlightColor || "#10b981";
        ctx.fillText(curLine, x, curY);
      }} else {{
        ctx.fillText(curLine, x, curY);
      }}
    }}
  }}

  // 12. CANVAS RENDER (Live 1080x1920)
  async function renderCanvasPreview() {{
    if (!parsedStories || parsedStories.length === 0) return;
    const story = parsedStories[currentStoryIdx] || parsedStories[0];
    const tpl = getTemplateForStory(currentStoryIdx);
    const colors = tpl.colors || {{}};
    const ho = tpl.ho || "the-vet";

    const W = 1080;
    const H = 1920;

    // 1. DRAW VIDEO BACKGROUND
    if (currentBgMode !== "gradient" && studioBgVideo.readyState >= 2) {{
      studioCtx.drawImage(studioBgVideo, 0, 0, W, H);
      studioCtx.fillStyle = ho === "anh-kinh" ? "rgba(10, 20, 15, 0.45)" : "rgba(10, 20, 15, 0.55)";
      studioCtx.fillRect(0, 0, W, H);
    }} else {{
      const grad = studioCtx.createLinearGradient(0, 0, 0, H);
      const bgTop = colors.c1 || "#15241b";
      const bgBottom = colors.c3 || "#0a130e";
      grad.addColorStop(0, bgTop);
      grad.addColorStop(1, bgBottom);
      studioCtx.fillStyle = grad;
      studioCtx.fillRect(0, 0, W, H);
    }}

    // 2. MAIN CARD
    const cardX = 70;
    const cardY = 170;
    const cardW = 940;
    const cardH = 1580;
    const cardR = ho === "giay-rach" ? 18 : 36;

    studioCtx.save();
    
    if (ho === "anh-kinh") {{
      // Frosted Glassmorphism
      studioCtx.shadowColor = "rgba(0,0,0,0.6)";
      studioCtx.shadowBlur = 50;
      studioCtx.shadowOffsetY = 20;
      drawRoundedRect(studioCtx, cardX, cardY, cardW, cardH, cardR);
      studioCtx.fillStyle = "rgba(16, 28, 22, 0.78)";
      studioCtx.fill();
      studioCtx.lineWidth = 2.5;
      studioCtx.strokeStyle = colors.cta || "rgba(52, 211, 153, 0.5)";
      studioCtx.stroke();
    }} else if (ho === "giay-rach") {{
      studioCtx.shadowColor = "rgba(0,0,0,0.4)";
      studioCtx.shadowBlur = 40;
      drawRoundedRect(studioCtx, cardX, cardY, cardW, cardH, cardR);
      studioCtx.fillStyle = colors.c5 || "#f5ede0";
      studioCtx.fill();
      studioCtx.lineWidth = 4;
      studioCtx.strokeStyle = colors.c2 || "#432a17";
      studioCtx.stroke();
    }} else if (ho === "the-trang") {{
      studioCtx.shadowColor = "rgba(0,0,0,0.25)";
      studioCtx.shadowBlur = 40;
      drawRoundedRect(studioCtx, cardX, cardY, cardW, cardH, cardR);
      studioCtx.fillStyle = colors.c2 || "#ffffff";
      studioCtx.fill();
    }} else if (ho === "dark-max" || ho === "dark-photo") {{
      studioCtx.shadowColor = "rgba(0,0,0,0.8)";
      studioCtx.shadowBlur = 50;
      drawRoundedRect(studioCtx, cardX, cardY, cardW, cardH, cardR);
      studioCtx.fillStyle = "rgba(12, 18, 15, 0.9)";
      studioCtx.fill();
      studioCtx.lineWidth = 2;
      studioCtx.strokeStyle = colors.cta || "#10b981";
      studioCtx.stroke();
    }} else {{
      studioCtx.shadowColor = "rgba(0,0,0,0.25)";
      studioCtx.shadowBlur = 40;
      drawRoundedRect(studioCtx, cardX, cardY, cardW, cardH, cardR);
      studioCtx.fillStyle = colors.c5 || "#fffafb";
      studioCtx.fill();
      if (colors.c2) {{
        studioCtx.lineWidth = 3;
        studioCtx.strokeStyle = colors.c2;
        studioCtx.stroke();
      }}
    }}
    studioCtx.restore();

    // 3. AVATAR
    const isRandomAv = document.querySelector('input[name="studioAvatarMode"]:checked')?.value === "random";
    const avFile = isRandomAv ? (AVATARS[currentStoryIdx % AVATARS.length]) : selectedAvatar;
    const avImg = await loadAvatar(avFile);
    const avX = cardX + 48;
    const avY = cardY + 48;
    const avSize = 130;

    studioCtx.save();
    drawRoundedRect(studioCtx, avX, avY, avSize, avSize, 26);
    studioCtx.clip();
    if (avImg) {{
      studioCtx.drawImage(avImg, avX, avY, avSize, avSize);
    }} else {{
      studioCtx.fillStyle = colors.c4 || "#10b981";
      studioCtx.fillRect(avX, avY, avSize, avSize);
    }}
    studioCtx.restore();

    // 4. AUTHOR NAME & SIGNATURE BRUSH STROKE
    const textStartX = avX + avSize + 28;
    const authorY = avY + 60;
    
    if (ho === "the-vet" && colors.c4) {{
      studioCtx.save();
      studioCtx.fillStyle = colors.c4;
      studioCtx.beginPath();
      const strokeW = Math.min(cardW - (textStartX - cardX) - 60, 420);
      drawRoundedRect(studioCtx, textStartX, authorY + 8, strokeW, 14, 7);
      studioCtx.fill();
      studioCtx.restore();
    }}

    const fontSerif = (ho === "giay-rach" || tpl.id.includes("serif"));
    const fontFam = fontSerif ? "Georgia, serif" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    
    studioCtx.fillStyle = ho === "anh-kinh" || ho.includes("dark") ? "#ffffff" : (colors.c6 || "#1c1512");
    studioCtx.font = `bold 44px ${{fontFam}}`;
    studioCtx.fillText(story.author, textStartX, authorY);

    // Verified badge
    const nameWidth = studioCtx.measureText(story.author).width;
    if (nameWidth + 40 < cardW - (textStartX - cardX)) {{
      studioCtx.fillStyle = "#1d9bf0";
      studioCtx.beginPath();
      studioCtx.arc(textStartX + nameWidth + 24, authorY - 14, 14, 0, Math.PI * 2);
      studioCtx.fill();
      studioCtx.fillStyle = "#ffffff";
      studioCtx.font = "bold 18px sans-serif";
      studioCtx.fillText("✓", textStartX + nameWidth + 18, authorY - 8);
    }}

    // Localized Handle / Time
    const timeLabels = {{
      "us": "3h ago", "fr": "il y a 3 h", "nl": "3 uur geleden",
      "de": "vor 3 Std.", "es": "hace 3 h", "vi": "3 giờ trước"
    }};
    const timeStr = timeLabels[currentCountry] || "3h ago";
    studioCtx.fillStyle = ho === "anh-kinh" || ho.includes("dark") ? "#a7f3d0" : "#6b7280";
    studioCtx.font = `32px ${{fontFam}}`;
    studioCtx.fillText(`${{story.handle}} · ${{timeStr}}`, textStartX, authorY + 50);

    // 5. DIVIDER
    studioCtx.strokeStyle = ho === "anh-kinh" || ho.includes("dark") ? "rgba(52,211,153,0.25)" : (colors.c2 || "#e5e7eb");
    studioCtx.lineWidth = 1.5;
    studioCtx.beginPath();
    studioCtx.moveTo(cardX + 48, avY + avSize + 36);
    studioCtx.lineTo(cardX + cardW - 48, avY + avSize + 36);
    studioCtx.stroke();

    // 6. STORY BODY TEXT
    const bodyTextColor = ho === "anh-kinh" || ho.includes("dark") ? "#f0fdf4" : (colors.c6 || "#1f2937");
    studioCtx.fillStyle = bodyTextColor;
    studioCtx.font = `400 37px/1.55 ${{fontFam}}`;
    const highlight = colors.red || colors.c4 || "#10b981";
    wrapText(studioCtx, story.content, cardX + 48, avY + avSize + 90, cardW - 96, 58, 15, highlight);

    // 7. FOOTER BUTTON (LOCALIZED CTA)
    const ctaLabels = {{
      "us": "🔗 Read Full Story In Bio / Comments",
      "fr": "🔗 Lire la suite en commentaire",
      "nl": "🔗 Lees meer in de reacties",
      "de": "🔗 Weiterlesen im ersten Kommentar",
      "es": "🔗 Leer más en el primer comentario",
      "vi": "🔗 Bấm Link Để Đọc Tiếp Truyện"
    }};
    const ctaText = ctaLabels[currentCountry] || ctaLabels["us"];

    const btnW = cardW - 96;
    const btnH = 88;
    const btnBX = cardX + 48;
    const btnBY = cardY + cardH - 128;

    studioCtx.save();
    drawRoundedRect(studioCtx, btnBX, btnBY, btnW, btnH, 22);
    studioCtx.fillStyle = colors.cta || "#10b981";
    studioCtx.fill();

    studioCtx.fillStyle = "#ffffff";
    studioCtx.font = `bold 34px ${{fontFam}}`;
    studioCtx.textAlign = "center";
    studioCtx.fillText(ctaText, btnBX + btnW / 2, btnBY + 56);
    studioCtx.textAlign = "left";
    studioCtx.restore();

    updatePreviewBadge();
  }}

  // Continuous animation loop for video background in preview
  function startContinuousPreview() {{
    function tick() {{
      if (studioModal.style.display === "flex" && !isRecording) {{
        renderCanvasPreview();
      }}
      requestAnimationFrame(tick);
    }}
    requestAnimationFrame(tick);
  }}
  startContinuousPreview();

  // 13. AUDIO ENGINE & VIDEO RECORDING
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
      renderCanvasPreview();
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

  // 14. ZIP ARCHIVE CREATOR (100% Client-Side Pure JS)
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

  // 15. RENDER SINGLE VIDEO TEST
  btnRenderSingle.onclick = async () => {{
    if (!parsedStories || parsedStories.length === 0) return alert("Không có kịch bản để render!");
    const story = parsedStories[currentStoryIdx] || parsedStories[0];
    const dur = parseInt(selectStudioDuration.value, 10);
    const tpl = getTemplateForStory(currentStoryIdx);

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
    a.download = `preview_video_${{currentStoryIdx + 1}}_${{tpl.id}}_${{story.author.replace(/\\s+/g, '_')}}.mp4`;
    a.click();

    const txtContent = `${{story.title}}\\n\\n${{story.content}}\\n\\n👉 Link: ${{story.pinLink}}`;
    const txtBlob = new Blob([txtContent], {{ type: "text/plain;charset=utf-8" }});
    const a2 = document.createElement("a");
    a2.href = URL.createObjectURL(txtBlob);
    a2.download = `preview_video_${{currentStoryIdx + 1}}_${{story.author.replace(/\\s+/g, '_')}}.txt`;
    a2.click();

    btnRenderSingle.disabled = false;
    renderStatusText.textContent = "✓ Đã tải 1 Video thành công (.mp4 + .txt)";
  }};

  // 16. BATCH RENDER N STORIES & AUTO ZIP
  btnRenderBatch30.onclick = async () => {{
    if (!parsedStories || parsedStories.length === 0) return alert("Không có kịch bản để render!");
    const count = Math.min(targetVideoCount, parsedStories.length);
    const dur = parseInt(selectStudioDuration.value, 10);
    
    buildBatchTemplatePlan(count);

    btnRenderBatch30.disabled = true;
    renderProgressBox.style.display = "block";
    btnDownloadAllZip.style.display = "none";
    renderedFiles = [];

    for (let i = 0; i < count; i++) {{
      const story = parsedStories[i];
      const activeTpl = getTemplateForStory(i);
      renderStatusText.textContent = `Đang render video ${{i + 1}}/${{count}}: [${{activeTpl.label}} • ${{activeTpl.palName}}] - ${{story.author}}...`;
      const pct = Math.round(((i + 1) / count) * 100);
      renderProgressBar.style.width = pct + "%";
      renderPercentText.textContent = pct + "%";

      const mp4Blob = await recordStoryVideo(story, dur, i);
      const safeName = `story_${{i + 1}}_${{activeTpl.id}}_${{story.author.replace(/\\s+/g, '_')}}`;

      renderedFiles.push({{
        name: safeName + ".mp4",
        blob: mp4Blob
      }});

      const txtContent = `${{story.title}}\\n\\n${{story.content}}\\n\\n👉 Link: ${{story.pinLink}}`;
      renderedFiles.push({{
        name: safeName + ".txt",
        blob: new Blob([txtContent], {{ type: "text/plain;charset=utf-8" }})
      }});
    }}

    renderProgressBar.style.width = "100%";
    renderPercentText.textContent = "100%";
    renderStatusText.textContent = `✓ Đã render xong ${{count}} video! Đang nén file ZIP tự động tải về...`;
    
    // Auto download zip
    btnDownloadAllZip.style.display = "block";
    btnDownloadAllZip.textContent = `📦 TẢI TOÀN BỘ ${{count}} VIDEO & TXT (.ZIP TRỌN GÓI)`;
    btnDownloadAllZip.click();

    btnRenderBatch30.disabled = false;
  }};

  btnDownloadAllZip.onclick = async () => {{
    if (renderedFiles.length === 0) return;
    btnDownloadAllZip.textContent = "⏳ Đang nén file ZIP...";
    btnDownloadAllZip.disabled = true;
    const zipBlob = await createZipBlob(renderedFiles);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(zipBlob);
    a.download = `Batch_${{renderedFiles.length / 2}}_Reels_${{currentCountry.toUpperCase()}}.zip`;
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

# Insert Custom Canopy CSS right after <title>
html = html.replace("<title>Kho mẫu reel — dựng cấu hình page</title>", f"<title>Việt Reels Studio Pro — Tạo Video Tự Động</title>\n<style>\n{canopy_tool_css}\n</style>", 1)

# Append Studio modal and Studio script to end of html
html = html + "\n" + studio_modal_html + "\n" + studio_script + "\n"

# Save to index.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Build complete! Saved updated index.html with Canopy tool wallpaper, strict single template vs random scrambling, and redesigned studio wizard.")
