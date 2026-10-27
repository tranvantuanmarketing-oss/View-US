import os, json, re

print("Starting build_full_studio_v2.py...")

# 1. Read base competitor template
with open('kho-mau-v1.6.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# 2. Extract MAU data
m_mau = re.search(r'<script id="mau-data"[^>]*>(.*?)</script>', html, re.S)
mau_data = json.loads(m_mau.group(1))

template_configs = []
for idx, m in enumerate(mau_data):
    pal0 = m["pals"][0]
    colors = dict(re.findall(r"--(c[1-6]|red|cta|ink|bg|fg|accent):\s*(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\))", pal0["html"]))
    template_configs.append({
        "index": idx,
        "id": m["id"],
        "label": m["label"],
        "ho": m.get("ho", "khac"),
        "colors": colors,
        "palsCount": len(m["pals"])
    })

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
Content: Mijn vader had altijd één kluis in zijn werkkamer die niemand mocht aanraken. Na zijn overlijden vonden we het testament, en het eerste wat erin stond was een bekentenis die we nooit hadden verwacht.
Pin_Link: https://example.com/nl/verhaal-3""",

    "de": """Author: Anna Schmidt
Handle: @stille_wahrheiten
Title: Das Geheimnis meiner Schwiegermutter
Content: Vier Tage nach der Operation legte meine Schwiegermutter einen Stapel Dokumente vor mich hin. Meine Tochter schlief im Nebenzimmer. „Unterschreib das einfach und stell keine Fragen“, sagte sie kalt. Als ich mich weigerte, holte sie einen vergilbten Umschlag mit der Handschrift meiner verstorbenen Mutter hervor.
Pin_Link: https://example.com/de/geschichte-1
---
Author: Lukas Weber
Handle: @wahre_geschichten
Title: Zehn Jahre des Schweigens
Content: Ich habe das kleine Mädchen adoptiert, das zwanzig andere Familien abgelehnt hatten. Ihre Diagnose hatte allen Angst gemacht. Ich unterschrieb in weniger als vier Minuten. Zehn Jahre vergingen glücklich – bis gestern plötzlich ein Unbekannter an unserer Tür klingelte.
Pin_Link: https://example.com/de/geschichte-2""",

    "es": """Author: Lucía Fernández
Handle: @verdades_ocultas
Title: La verdad tras la puerta cerrada
Content: Al cuarto día de la operación, mi suegra puso una pila de documentos frente a mí. Mi hija dormía en la habitación de al lado. «Firma esto sin hacer preguntas», me ordenó con frialdad. Cuando me negué, sacó un sobre amarillento con la letra de mi difunta madre.
Pin_Link: https://example.com/es/historia-1
---
Author: Mateo Gómez
Handle: @historias_reales
Title: El secreto que lo cambió todo
Content: Adopté solo a la pequeña que veinte familias habían rechazado. Su diagnóstico asustaba a todos. Pero firmé los papeles en menos de cuatro minutos. Diez años después, alguien del pasado llamó a nuestra puerta.
Pin_Link: https://example.com/es/historia-2""",

    "vi": """Author: Ngọc Hân
Handle: @tam_su_dem_khuya
Title: Bí mật của mẹ chồng sau cánh cửa
Content: Ngày thứ tư sau ca mổ, mẹ chồng đặt trước mặt tôi một tập giấy tờ. Con gái tôi đang ngủ trong phòng bên. "Ký vào đây đi, đừng hỏi nhiều," bà nói dứt khoát. Khi tôi từ chối, bà rút ra chiếc phong bì ố vàng với nét chữ quen thuộc của mẹ đẻ tôi đã mất mười năm trước.
Pin_Link: https://example.com/vi/truyen-1
---
Author: Hoàng Nam
Handle: @goc_nhin_cuoc_song
Title: Đứa trẻ bị 20 gia đình từ chối
Content: Tôi một mình nhận nuôi đứa bé mà hai mươi gia đình trước đó đều lắc đầu từ chối. Hồ sơ bệnh án của con bé khiến ai cũng chùn bước. Nhưng tôi đã ký vào giấy nhận nuôi chỉ trong chưa đầy bốn phút. Mười năm trôi qua bình yên, cho đến buổi chiều hôm qua...
Pin_Link: https://example.com/vi/truyen-2"""
}

# CSS Styling
tulip_css = """
/* === TULIP PASTEL LAVENDER THEME & GLASSMORPHISM === */
:root {
  --w: 200;
  --bg: #140d24;
  --card: #1f1435;
  --line: #3b285a;
  --ink: #f5f3ff;
  --dim: #c4b5fd;
  --acc: #c084fc;
  --tulip-purple: #a855f7;
  --tulip-pink: #f472b6;
  --tulip-soft: #e9d5ff;
  --tulip-glow: rgba(168, 85, 247, 0.35);
}

body {
  background-color: #140d24 !important;
  background-image: 
    radial-gradient(circle at 15% 15%, rgba(168, 85, 247, 0.18) 0%, transparent 40%),
    radial-gradient(circle at 85% 85%, rgba(244, 114, 182, 0.18) 0%, transparent 40%),
    url('assets/bg_tulips.png') !important;
  background-size: cover !important;
  background-attachment: fixed !important;
  background-position: center !important;
  background-blend-mode: soft-light !important;
  color: var(--ink) !important;
}

header {
  background: rgba(22, 14, 38, 0.94) !important;
  backdrop-filter: blur(14px) !important;
  border-bottom: 1px solid rgba(168, 85, 247, 0.3) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

aside#side {
  background: rgba(25, 16, 44, 0.82) !important;
  backdrop-filter: blur(12px) !important;
  border-right: 1px solid rgba(168, 85, 247, 0.25) !important;
}

.m-card {
  background: rgba(31, 20, 53, 0.88) !important;
  border: 1px solid rgba(168, 85, 247, 0.25) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 14px !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.m-card:hover {
  border-color: var(--tulip-purple) !important;
  box-shadow: 0 8px 25px var(--tulip-glow) !important;
  transform: translateY(-2px) !important;
}

.m-card.picked {
  border-color: #ec4899 !important;
  box-shadow: 0 0 0 2px #ec4899, 0 8px 30px rgba(236, 72, 153, 0.5) !important;
  background: rgba(50, 20, 75, 0.95) !important;
}

button.act, .act {
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%) !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4) !important;
  transition: all 0.2s ease !important;
}

button.act:hover, .act:hover {
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.6) !important;
  transform: translateY(-1px) !important;
}

button.ghost {
  background: rgba(168, 85, 247, 0.12) !important;
  color: var(--tulip-soft) !important;
  border: 1px solid rgba(168, 85, 247, 0.35) !important;
}

button.ghost:hover {
  background: rgba(168, 85, 247, 0.25) !important;
  border-color: var(--tulip-purple) !important;
}

/* FLOATING GEN BAR */
#floatingGenBar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  background: rgba(26, 14, 46, 0.96);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(236, 72, 153, 0.6);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(236, 72, 153, 0.4);
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
  background: rgba(10, 5, 20, 0.88);
  backdrop-filter: blur(18px);
  justify-content: center;
  align-items: center;
  padding: 16px;
}
.studio-box {
  width: 1460px;
  max-width: 96vw;
  height: 94vh;
  background: #190f30;
  border: 1px solid rgba(168, 85, 247, 0.35);
  box-shadow: 0 25px 80px rgba(0,0,0,0.8), 0 0 40px var(--tulip-glow);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.studio-header {
  padding: 14px 24px;
  background: rgba(26, 15, 52, 0.98);
  border-bottom: 1px solid rgba(168, 85, 247, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.studio-body {
  display: grid;
  grid-template-columns: 1fr 460px;
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}
@media (max-width: 1080px) {
  .studio-body { grid-template-columns: 1fr; }
}

/* PRESET BUTTONS */
.btn-preset-count {
  background: rgba(168,85,247,0.15);
  color: #c4b5fd;
  border: 1px solid rgba(168,85,247,0.3);
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-preset-count.active, .btn-preset-count:hover {
  background: #ec4899;
  color: #fff;
  border-color: #ec4899;
}
"""

# Replace ONLY first <style> in <head>
html = html.replace("<style>", f"<style>\n{tulip_css}\n", 1)

# Header button
old_btn = '<button class="act" id="btnTao">Tạo file page</button>'
new_btns = """<button class="act" id="btnMoStudio" style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%) !important; color: white !important; font-weight: 800; border-radius: 999px; padding: 7px 22px; margin: 0 8px; box-shadow: 0 4px 18px rgba(168,85,247,0.5); cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">👉 SANG BƯỚC GEN VIDEO (<span id="headerPickCount">0</span>)</button>
  <button class="act" id="btnTao">Tạo file page</button>"""
html = html.replace(old_btn, new_btns)

# Upgraded Background Library Dialog with Canopy Forest Image option
old_dlg_nen_pattern = re.compile(r'<dialog id="dlgNen">.*?</dialog>', re.S)

upgraded_dlg_nen = f"""<dialog id="dlgNen" style="max-width: 1000px; width: 94vw; max-height: 90vh; padding: 24px; border-radius: 20px; background: rgba(22, 14, 38, 0.97); backdrop-filter: blur(25px); border: 1px solid rgba(168, 85, 247, 0.4); color: #f3e8ff;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(168, 85, 247, 0.25); padding-bottom: 12px;">
    <div>
      <h3 style="margin: 0; font-size: 20px; color: #fff; display: flex; align-items: center; gap: 8px;">
        🎬 Kho Clip Nền Video Reels & Story
        <span style="font-size: 12px; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; padding: 2px 10px; border-radius: 99px; font-weight: 700;">{len(bg_files)} Clip + Tán Cây Nắng</span>
      </h3>
      <p class="hint" style="margin: 4px 0 0; color: #c084fc;">Đã tích hợp 35 video nền chuẩn HD Reels + Ảnh nền Tán cây nắng chiếu mới thêm.</p>
    </div>
    <button class="act" id="nenClose" style="border-radius: 10px; padding: 6px 16px; cursor: pointer;">✕ Đóng</button>
  </div>

  <div style="display: flex; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; align-items: center; flex-wrap: wrap;">
    <button type="button" id="tabRealClipsBtn" class="tab-btn active" style="background: #a855f7; color: white; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer;">🎞️ Kho Video & Ảnh Nền Thực Tế</button>
    <button type="button" id="tabCategoriesBtn" class="tab-btn" style="background: rgba(168,85,247,0.15); color: #c4b5fd; border: 1px solid rgba(168,85,247,0.3); padding: 8px 16px; border-radius: 10px; font-weight: 600; cursor: pointer;">📋 Chuyên Mục CMS (Hệ thống mẫu)</button>
    
    <div style="margin-left: auto; display: flex; gap: 8px; align-items: center;">
      <button type="button" id="btnNenCanopySelect" style="background: rgba(16,185,129,0.25); color: #34d399; border: 1px solid rgba(16,185,129,0.4); padding: 7px 14px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px;">🌲 Chọn Tán Cây Nắng Chiếu</button>
      <button type="button" id="btnNenRandomSelect" style="background: rgba(236,72,153,0.25); color: #f472b6; border: 1px solid rgba(236,72,153,0.4); padding: 7px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px;">🎲 Xoay vòng 35 clip</button>
      <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; background: rgba(168,85,247,0.2); border: 1px dashed #a855f7; padding: 7px 14px; border-radius: 8px; font-size: 13px; color: #e9d5ff;">
        ➕ Thêm Clip .mp4
        <input type="file" id="uploadCustomBg" accept="video/mp4,video/*" multiple style="display:none">
      </label>
    </div>
  </div>

  <div id="tabRealClips" style="max-height: 58vh; overflow-y: auto; padding-right: 6px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(255,255,255,0.03); padding: 8px 14px; border-radius: 8px;">
      <span style="font-size: 13px; color: #e9d5ff;">Rê chuột để phát nhanh • Bấm để chọn làm nền cho video:</span>
      <span id="selectedBgBadge" style="font-size: 12px; font-weight: 700; color: #34d399; background: rgba(52,211,153,0.15); padding: 3px 10px; border-radius: 99px;">Đang chọn: 🌲 Tán Cây Nắng Chiếu</span>
    </div>
    
    <div id="bgVideoGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 14px;">
    </div>
  </div>

  <div id="tabCategories" style="display: none; max-height: 58vh; overflow-y: auto;">
    <p class="hint" style="margin:0 0 10px">Tick chuyên mục clip nền muốn dùng theo định dạng cấu hình CMS đối thủ.</p>
    <div class="guNhom" id="nenList"></div>
    <div style="display:flex;gap:10px;margin-top:14px;justify-content:flex-end">
      <button type="button" class="guAll" id="nenAll">Chọn tất cả</button>
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(168,85,247,0.25);">
    <div style="font-size: 13px; color: #c4b5fd;">Chọn nền xong, bấm <b>Sang Bước Gen Video</b> để bắt đầu dựng.</div>
    <div style="display: flex; gap: 10px;">
      <button type="button" id="btnNenGoStudio" class="act" style="background: linear-gradient(135deg, #a855f7, #ec4899); border-radius: 10px; padding: 8px 20px; font-weight: 700; cursor: pointer;">👉 Sang Bước Gen Video</button>
      <button type="button" class="ghost" onclick="document.getElementById('dlgNen').close()" style="border-radius: 10px; padding: 8px 16px; cursor: pointer;">Xong</button>
    </div>
  </div>
</dialog>"""

html = old_dlg_nen_pattern.sub(upgraded_dlg_nen, html, count=1)

# Floating Gen Bar at bottom
floating_bar_html = """
<div id="floatingGenBar" style="display: none;">
  <span style="font-size: 22px;">🎨</span>
  <div>
    <b style="color: #fff; font-size: 14px;">Đã chọn <span id="floatPickNum" style="color: #f472b6;">0</span> mẫu trên màn hình</b>
    <div style="font-size: 12px; color: #c4b5fd; max-width: 420px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="floatPickNames">Chưa chọn mẫu nào</div>
  </div>
  <button type="button" id="btnFloatingGen" class="act" style="background: linear-gradient(135deg, #a855f7, #ec4899) !important; padding: 9px 26px; border-radius: 999px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 18px rgba(236,72,153,0.5); font-size: 14px;">
    👉 TIẾP TỤC: SANG BƯỚC GEN VIDEO
  </button>
</div>
"""

# Grouped 76 templates
options_grouped_html = """
<option value="selected_picked" selected>🎯 DÙNG CÁC MẪU ĐÃ TICK TRÊN MÀN HÌNH (Xoay vòng các video)</option>
<option value="random_all">🎲 Ngẫu nhiên từ toàn bộ 76 mẫu</option>
"""

from collections import defaultdict
families = defaultdict(list)
for t in template_configs:
    families[t["ho"]].append(t)

family_titles = {
    "the-vet": "🌸 Thẻ màu + vệt tên (11 mẫu)",
    "anh-kinh": "🪟 Ánh sáng + khung kính (10 mẫu)",
    "giay-rach": "📜 Giấy cũ / giấy rách (10 mẫu)",
    "the-trang": "🤍 Thẻ trắng hiện đại (10 mẫu)",
    "dark-max": "🌙 Nhiều chữ trên ảnh tối (8 mẫu)",
    "leaf-drift": "🍃 Ló góc + pastel trời (7 mẫu)",
    "dark-photo": "🖤 Ánh tối chữ trắng (4 mẫu)",
    "hoa-roi": "🌺 Hoa rơi Déjà View (3 mẫu)",
    "wood-desk": "🪵 Bàn gỗ + thẻ lò xo (2 mẫu)",
    "khac": "✨ Mẫu khác / Độc bản (11 mẫu)"
}

for ho_key, t_list in families.items():
    title = family_titles.get(ho_key, f"✨ {ho_key} ({len(t_list)} mẫu)")
    options_grouped_html += f'<optgroup label="{title}">\n'
    for t in t_list:
        options_grouped_html += f'  <option value="{t["id"]}">{t["index"]+1:02d}. {t["label"]}</option>\n'
    options_grouped_html += '</optgroup>\n'

# Upgraded Studio Modal HTML
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
          <h2 style="margin: 0; font-size: 18px; color: #fff; font-weight: 800;">Bước Gen Video & Đóng Gói Trọn Gói (.ZIP)</h2>
          <p style="margin: 2px 0 0; font-size: 12px; color: #c4b5fd;">Chọn quốc gia/ngôn ngữ • Tải avatar & nội dung • Chọn số lượng video cần xuất</p>
        </div>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <span id="studioActiveTemplateBadge" style="font-size: 12px; color: #34d399; background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.3); padding: 5px 12px; border-radius: 8px; font-weight: 700;">Đang dùng: Các mẫu đã tick</span>
        <button id="studioCloseBtn" class="act" style="border-radius: 10px; padding: 6px 14px; cursor: pointer; background: rgba(255,255,255,0.1) !important; color: white !important;">✕ Đóng</button>
      </div>
    </div>

    <!-- BODY -->
    <div class="studio-body">
      <!-- LEFT: CONFIG & STORIES -->
      <div style="display: flex; flex-direction: column; gap: 16px; overflow-y: auto; padding-right: 6px;">
        
        <!-- SECTION 1: QUỐC GIA / NGÔN NGỮ & SỐ LƯỢNG VIDEO -->
        <div style="background: rgba(31, 20, 53, 0.7); border: 1px solid rgba(168,85,247,0.25); border-radius: 14px; padding: 16px;">
          <h4 style="margin: 0 0 12px; color: #f472b6; font-size: 14px; display: flex; align-items: center; gap: 6px;">🌐 1. Ngôn Ngữ Quốc Gia & Số Lượng Video</h4>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
              <label style="display: block; font-size: 12px; color: #c4b5fd; margin-bottom: 4px; font-weight: 700;">Quốc Gia / Ngôn Ngữ Target:</label>
              <select id="selectStudioCountry" style="width: 100%; background: #130c22; color: #fff; border: 1px solid #a855f7; padding: 8px 10px; border-radius: 8px; font-size: 13px; font-weight: 600;">
                <option value="us" selected>🇺🇸 Hoa Kỳ (US - English)</option>
                <option value="fr">🇫🇷 Pháp (France - Français)</option>
                <option value="nl">🇳🇱 Hà Lan (Netherlands - Nederlands)</option>
                <option value="de">🇩🇪 Đức (Germany - Deutsch)</option>
                <option value="es">🇪🇸 Tây Ban Nha (Spain - Español)</option>
                <option value="vi">🇻🇳 Việt Nam (Tiếng Việt)</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 12px; color: #c4b5fd; margin-bottom: 4px; font-weight: 700;">Nhấp Chọn Số Video Cần Gen:</label>
              <div style="display: flex; gap: 6px; align-items: center;">
                <button type="button" class="btn-preset-count" data-num="5">5</button>
                <button type="button" class="btn-preset-count" data-num="10">10</button>
                <button type="button" class="btn-preset-count" data-num="15">15</button>
                <button type="button" class="btn-preset-count" data-num="20">20</button>
                <button type="button" class="btn-preset-count active" data-num="30">30</button>
                <input type="number" id="inputCustomVideoCount" value="30" min="1" max="100" style="width: 55px; background: #130c22; color: #fff; border: 1px solid #ec4899; padding: 5px; border-radius: 6px; text-align: center; font-size: 12px; font-weight: bold;">
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="display: block; font-size: 12px; color: #c4b5fd; margin-bottom: 4px;">Ảnh / Video Nền:</label>
              <select id="selectStudioBgMode" style="width: 100%; background: #130c22; color: #fff; border: 1px solid #6b21a8; padding: 8px; border-radius: 8px;">
                <option value="canopy" selected>🌲 Ảnh Nền Tán Cây Nắng Chiếu (Mới thêm)</option>
                <option value="random">🎲 Xoay vòng 35 clip từ Kho Nền</option>
                <option value="single">🎯 Cố định 1 clip cụ thể từ Kho Nền</option>
                <option value="gradient">🌸 Nền Tulip Pastel Gradient</option>
              </select>
            </div>
            <div id="singleBgSelectWrapper" style="display: none;">
              <label style="display: block; font-size: 12px; color: #c4b5fd; margin-bottom: 4px;">Chọn Clip Cụ Thể:</label>
              <select id="selectStudioSingleBg" style="width: 100%; background: #130c22; color: #fff; border: 1px solid #6b21a8; padding: 8px; border-radius: 8px;">
                {''.join([f'<option value="{f}">{f}</option>' for f in bg_files])}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 12px; color: #c4b5fd; margin-bottom: 4px;">Thời Lượng Video:</label>
              <select id="selectStudioDuration" style="width: 100%; background: #130c22; color: #fff; border: 1px solid #6b21a8; padding: 8px; border-radius: 8px;">
                <option value="5">⚡ 5 giây (Test Nhanh)</option>
                <option value="10" selected>⏱️ 10 giây (Tối Ưu Giữ Chân Reels)</option>
                <option value="15">⏱️ 15 giây</option>
                <option value="20">⏱️ 20 giây</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SECTION 2: KHO AVATAR & UPLOAD AVATAR -->
        <div style="background: rgba(31, 20, 53, 0.7); border: 1px solid rgba(168,85,247,0.25); border-radius: 14px; padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h4 style="margin: 0; color: #f472b6; font-size: 14px;">👤 2. Kho Avatar (<span id="statAvatarNum">{len(avatar_files)}</span> ảnh)</h4>
              <label style="cursor: pointer; background: rgba(236,72,153,0.2); border: 1px dashed #ec4899; color: #f472b6; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                📤 Tải lên Avatar từ máy
                <input type="file" id="uploadAvatarInput" accept="image/*" multiple style="display: none;">
              </label>
            </div>
            <div style="font-size: 12px; display: flex; gap: 10px; color: #e9d5ff;">
              <label style="cursor: pointer;"><input type="radio" name="studioAvatarMode" value="random" checked> 🎲 Xoay vòng Avatar</label>
              <label style="cursor: pointer;"><input type="radio" name="studioAvatarMode" value="fixed"> 🎯 Cố định 1 Avatar</label>
            </div>
          </div>
          <div id="studioAvatarList" style="display: flex; gap: 10px; overflow-x: auto; padding: 6px 0;">
          </div>
        </div>

        <!-- SECTION 3: NỘI DUNG KỊCH BẢN & TẢI FILE KỊCH BẢN -->
        <div style="background: rgba(31, 20, 53, 0.7); border: 1px solid rgba(168,85,247,0.25); border-radius: 14px; padding: 16px; flex: 1; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <h4 style="margin: 0; color: #f472b6; font-size: 14px;">📝 3. Nội Dung Kịch Bản (<span id="statStoryCountDisplay">30</span> câu chuyện)</h4>
            <div style="display: flex; gap: 8px;">
              <label style="cursor: pointer; background: rgba(168,85,247,0.2); border: 1px dashed #a855f7; color: #c4b5fd; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                📂 Tải file kịch bản (.txt/.json)
                <input type="file" id="uploadScriptInput" accept=".txt,.json" style="display: none;">
              </label>
              <button id="btnReloadSampleStories" type="button" class="ghost" style="padding: 3px 10px; font-size: 12px; border-radius: 6px; cursor: pointer;">🔄 Nạp lại mẫu</button>
            </div>
          </div>
          <textarea id="studioBatchTextarea" style="width: 100%; height: 180px; background: #0f071d; color: #e9d5ff; border: 1px solid #4c1d95; border-radius: 8px; padding: 10px; font-family: monospace; font-size: 12px; resize: vertical;" placeholder="Dán nội dung các câu chuyện vào đây..."></textarea>
        </div>
      </div>

      <!-- RIGHT: LIVE PREVIEW & RENDER ACTIONS -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 14px; background: rgba(22, 14, 38, 0.6); border: 1px solid rgba(168,85,247,0.25); border-radius: 14px; padding: 16px;">
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
          <span style="font-size: 13px; font-weight: 700; color: #e9d5ff;">👁️ Xem Trước Video (1080x1920):</span>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button id="btnPrevStory" class="ghost" style="padding: 3px 10px; border-radius: 6px; cursor: pointer;">◀</button>
            <span id="currentStoryIndexBadge" style="font-size: 12px; font-weight: 700; color: #f472b6; background: rgba(244,114,182,0.15); padding: 3px 8px; border-radius: 99px;">1 / 30</span>
            <button id="btnNextStory" class="ghost" style="padding: 3px 10px; border-radius: 6px; cursor: pointer;">▶</button>
          </div>
        </div>

        <!-- CANVAS WRAPPER -->
        <div style="position: relative; width: 270px; height: 480px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6); border: 2px solid rgba(168,85,247,0.4);">
          <canvas id="studioPreviewCanvas" width="1080" height="1920" style="width: 100%; height: 100%; object-fit: contain; background: #000;"></canvas>
          <video id="studioBgVideoElement" loop muted playsinline crossOrigin="anonymous" style="display:none;"></video>
        </div>

        <!-- PROGRESS & STATUS -->
        <div id="renderProgressBox" style="width: 100%; display: none; background: rgba(15,7,29,0.8); border: 1px solid #7c3aed; border-radius: 10px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span id="renderStatusText" style="color: #f472b6; font-weight: 700;">Đang render...</span>
            <span id="renderPercentText" style="color: #34d399; font-weight: 700;">0%</span>
          </div>
          <div style="width: 100%; height: 8px; background: #2e1065; border-radius: 99px; overflow: hidden;">
            <div id="renderProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ec4899, #a855f7); transition: width 0.2s;"></div>
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
          <button id="btnRenderSingle" type="button" class="ghost" style="width: 100%; padding: 10px; font-weight: 700; border-radius: 10px; cursor: pointer; border-color: #a855f7; color: #fff;">
            ⚡ Render Thử 1 Video Này (.mp4 + .txt)
          </button>
          
          <button id="btnRenderBatch30" type="button" class="act" style="width: 100%; padding: 14px; font-weight: 800; font-size: 15px; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 20px rgba(236,72,153,0.5);">
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

# Enhanced JavaScript Engine with Canopy Background & Multi-Country Support
studio_script = f"""
<!-- STUDIO JAVASCRIPT ENGINE -->
<script>
(function() {{
  const TEMPLATES = {json.dumps(template_configs)};
  const BG_CLIPS = {json.dumps(bg_files)};
  let AVATARS = {json.dumps(avatar_files)};
  const STORIES_BY_COUNTRY = {json.dumps(stories_by_country)};
  
  let currentCountry = "us";
  let targetVideoCount = 30;
  let currentBgMode = "canopy"; // Default to lush canopy forest image!
  let activeSelectedBg = BG_CLIPS[0] || "";
  let currentStoryIdx = 0;
  let parsedStories = [];
  let avatarCache = {{}};
  let selectedAvatar = AVATARS[0];
  let renderedFiles = [];

  let canopyImg = new Image();
  canopyImg.src = "assets/bg_canopy.jpg";

  let globalAudioCtx = null;
  let globalAudioElement = null;
  let globalAudioSourceNode = null;
  let globalAudioDestNode = null;

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

  const selectStudioCountry = document.getElementById("selectStudioCountry");
  const inputCustomVideoCount = document.getElementById("inputCustomVideoCount");
  const btnBatchNumLabel = document.getElementById("btnBatchNumLabel");
  const statStoryCountDisplay = document.getElementById("statStoryCountDisplay");
  const statAvatarNum = document.getElementById("statAvatarNum");
  const uploadAvatarInput = document.getElementById("uploadAvatarInput");
  const uploadScriptInput = document.getElementById("uploadScriptInput");

  const studioActiveTemplateBadge = document.getElementById("studioActiveTemplateBadge");
  const selectStudioBgMode = document.getElementById("selectStudioBgMode");
  const singleBgSelectWrapper = document.getElementById("singleBgSelectWrapper");
  const selectStudioSingleBg = document.getElementById("selectStudioSingleBg");
  const selectStudioDuration = document.getElementById("selectStudioDuration");
  const studioAvatarList = document.getElementById("studioAvatarList");
  const studioBatchTextarea = document.getElementById("studioBatchTextarea");
  const studioCanvas = document.getElementById("studioPreviewCanvas");
  const studioCtx = studioCanvas.getContext("2d");
  const studioBgVideo = document.getElementById("studioBgVideoElement");
  const btnPrevStory = document.getElementById("btnPrevStory");
  const btnNextStory = document.getElementById("btnNextStory");
  const currentStoryIndexBadge = document.getElementById("currentStoryIndexBadge");
  const btnRenderSingle = document.getElementById("btnRenderSingle");
  const btnRenderBatch30 = document.getElementById("btnRenderBatch30");
  const btnDownloadAllZip = document.getElementById("btnDownloadAllZip");
  const renderProgressBox = document.getElementById("renderProgressBox");
  const renderProgressBar = document.getElementById("renderProgressBar");
  const renderStatusText = document.getElementById("renderStatusText");
  const renderPercentText = document.getElementById("renderPercentText");

  // 1. WATCH SELECTIONS ON MAIN TEMPLATE GRID
  function getPickedTemplates() {{
    const picked = [];
    if (typeof state !== "undefined" && Array.isArray(state)) {{
      state.forEach((s, idx) => {{
        if (s.picked && TEMPLATES[idx]) {{
          picked.push({{ ...TEMPLATES[idx], pal: s.pal || 0 }});
        }}
      }});
    }}
    return picked;
  }}

  function updatePickedUI() {{
    const picked = getPickedTemplates();
    const count = picked.length;
    if (headerPickCount) headerPickCount.textContent = count;
    if (floatPickNum) floatPickNum.textContent = count;
    
    if (count > 0) {{
      floatingGenBar.style.display = "flex";
      const names = picked.map(p => p.label).slice(0, 3).join(", ");
      floatPickNames.textContent = names + (count > 3 ? ` (+${{count - 3}} mẫu)` : "");
      studioActiveTemplateBadge.textContent = `🎯 Đang dùng: ${{count}} mẫu đã tick`;
      studioActiveTemplateBadge.style.color = "#34d399";
    }} else {{
      floatingGenBar.style.display = "none";
      studioActiveTemplateBadge.textContent = `Mặc định (Tự động xoay vòng mẫu)`;
      studioActiveTemplateBadge.style.color = "#c4b5fd";
    }}
    renderCanvasPreview();
  }}

  document.addEventListener("change", (e) => {{
    if (e.target && e.target.closest(".m-card")) {{
      setTimeout(updatePickedUI, 50);
    }}
  }});

  // 2. OPEN STUDIO MODAL
  btnMoStudio.onclick = () => {{ studioModal.style.display = "flex"; updatePickedUI(); }};
  btnFloatingGen.onclick = () => {{ studioModal.style.display = "flex"; updatePickedUI(); }};
  studioCloseBtn.onclick = () => {{ studioModal.style.display = "none"; }};
  btnNenGoStudio.onclick = () => {{ dlgNen.close(); studioModal.style.display = "flex"; updatePickedUI(); }};

  // 3. TARGET VIDEO COUNT PRESETS
  document.querySelectorAll(".btn-preset-count").forEach(btn => {{
    btn.onclick = () => {{
      document.querySelectorAll(".btn-preset-count").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      targetVideoCount = parseInt(btn.dataset.num, 10);
      inputCustomVideoCount.value = targetVideoCount;
      btnBatchNumLabel.textContent = targetVideoCount;
      updateStoryNav();
    }};
  }});
  inputCustomVideoCount.oninput = () => {{
    targetVideoCount = parseInt(inputCustomVideoCount.value, 10) || 1;
    btnBatchNumLabel.textContent = targetVideoCount;
    updateStoryNav();
  }};

  // 4. COUNTRY / LANGUAGE SWITCHER
  selectStudioCountry.onchange = () => {{
    currentCountry = selectStudioCountry.value;
    const storiesTxt = STORIES_BY_COUNTRY[currentCountry] || STORIES_BY_COUNTRY["us"];
    studioBatchTextarea.value = storiesTxt;
    parsedStories = parseStories(storiesTxt);
    currentStoryIdx = 0;
    updateStoryNav();
    renderCanvasPreview();
  }};

  // 5. UPLOAD AVATARS
  uploadAvatarInput.onchange = (e) => {{
    const files = Array.from(e.target.files);
    if (!files.length) return;
    files.forEach(f => {{
      const blobUrl = URL.createObjectURL(f);
      AVATARS.unshift(blobUrl);
    }});
    statAvatarNum.textContent = AVATARS.length;
    renderAvatars();
    alert(`Đã tải lên thành công ${{files.length}} ảnh Avatar mới!`);
    renderCanvasPreview();
  }};

  // 6. UPLOAD SCRIPT (.TXT / .JSON)
  uploadScriptInput.onchange = (e) => {{
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {{
      const text = evt.target.result;
      studioBatchTextarea.value = text;
      parsedStories = parseStories(text);
      currentStoryIdx = 0;
      updateStoryNav();
      renderCanvasPreview();
      alert(`Đã nạp nội dung từ file ${{file.name}}!`);
    }};
    reader.readAsText(file);
  }};

  // 7. BACKGROUND GALLERY
  function renderBgGrid() {{
    bgVideoGrid.innerHTML = "";
    
    // Add Canopy Card as First item!
    const canopyCard = document.createElement("div");
    canopyCard.style.cssText = "background: rgba(31,20,53,0.85); border: 2px solid " + (currentBgMode === "canopy" ? "#10b981" : "rgba(16,185,129,0.3)") + "; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer;";
    canopyCard.innerHTML = `
      <div style="position: relative; width: 100%; padding-top: 130%; background: #000; overflow: hidden;">
        <img src="assets/bg_canopy.jpg" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;">
        <span style="position: absolute; top: 6px; left: 6px; background: #10b981; font-size: 11px; padding: 2px 6px; border-radius: 4px; color: #fff; font-weight: bold;">Mới thêm</span>
        <span class="sel-mark" style="position: absolute; top: 6px; right: 6px; background: #10b981; color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 99px; display: ${{currentBgMode === "canopy" ? "block" : "none"}};">✓ Đang chọn</span>
      </div>
      <div style="padding: 8px 10px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; font-weight: 700; color: #34d399;">🌲 Tán Cây Nắng Chiếu</span>
        <button type="button" style="background: rgba(16,185,129,0.3); border: 1px solid #10b981; color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 6px; cursor: pointer;">Chọn</button>
      </div>
    `;
    canopyCard.onclick = () => {{
      currentBgMode = "canopy";
      selectedBgBadge.textContent = "Đang chọn: 🌲 Tán Cây Nắng Chiếu";
      selectedBgBadge.style.color = "#34d399";
      selectStudioBgMode.value = "canopy";
      singleBgSelectWrapper.style.display = "none";
      renderBgGrid();
      renderCanvasPreview();
    }};
    bgVideoGrid.appendChild(canopyCard);

    BG_CLIPS.forEach((clip, idx) => {{
      const card = document.createElement("div");
      card.style.cssText = "background: rgba(31,20,53,0.85); border: 2px solid " + (currentBgMode === "single" && activeSelectedBg === clip ? "#ec4899" : "rgba(168,85,247,0.3)") + "; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s;";
      card.innerHTML = `
        <div style="position: relative; width: 100%; padding-top: 130%; background: #000; overflow: hidden;">
          <video src="assets/backgrounds/${{clip}}" loop muted playsinline preload="metadata" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;"></video>
          <span style="position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.7); font-size: 11px; padding: 2px 6px; border-radius: 4px; color: #fff;">#${{idx + 1}}</span>
          <span class="sel-mark" style="position: absolute; top: 6px; right: 6px; background: #ec4899; color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 99px; display: ${{currentBgMode === "single" && activeSelectedBg === clip ? "block" : "none"}};">✓ Đã chọn</span>
        </div>
        <div style="padding: 8px 10px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 600; color: #e9d5ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">${{clip}}</span>
          <button type="button" class="btn-pick-clip" style="background: rgba(168,85,247,0.25); border: 1px solid #a855f7; color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 6px; cursor: pointer;">Chọn</button>
        </div>
      `;
      
      const vid = card.querySelector("video");
      card.onmouseenter = () => {{ vid.play().catch(() => {{}}); card.style.borderColor = "#f472b6"; }};
      card.onmouseleave = () => {{ vid.pause(); if (!(currentBgMode === "single" && activeSelectedBg === clip)) card.style.borderColor = "rgba(168,85,247,0.3)"; }};
      card.onclick = () => {{
        currentBgMode = "single";
        activeSelectedBg = clip;
        selectedBgBadge.textContent = "Đang chọn: " + clip;
        selectedBgBadge.style.color = "#ec4899";
        selectStudioBgMode.value = "single";
        selectStudioSingleBg.value = clip;
        singleBgSelectWrapper.style.display = "block";
        renderBgGrid();
        updateBgVideoSource();
        renderCanvasPreview();
      }};
      bgVideoGrid.appendChild(card);
    }});
  }}

  document.getElementById("btnNenCanopySelect").onclick = () => {{
    currentBgMode = "canopy";
    selectedBgBadge.textContent = "Đang chọn: 🌲 Tán Cây Nắng Chiếu";
    selectedBgBadge.style.color = "#34d399";
    selectStudioBgMode.value = "canopy";
    singleBgSelectWrapper.style.display = "none";
    renderBgGrid();
    renderCanvasPreview();
  }};

  document.getElementById("btnNenRandomSelect").onclick = () => {{
    currentBgMode = "random";
    selectedBgBadge.textContent = "Đang chọn: 🎲 Xoay vòng 35 clip";
    selectedBgBadge.style.color = "#f472b6";
    selectStudioBgMode.value = "random";
    singleBgSelectWrapper.style.display = "none";
    renderBgGrid();
    updateBgVideoSource();
    renderCanvasPreview();
  }};

  selectStudioBgMode.onchange = () => {{
    currentBgMode = selectStudioBgMode.value;
    singleBgSelectWrapper.style.display = currentBgMode === "single" ? "block" : "none";
    updateBgVideoSource();
    renderCanvasPreview();
  }};
  selectStudioSingleBg.onchange = () => {{
    activeSelectedBg = selectStudioSingleBg.value;
    updateBgVideoSource();
    renderCanvasPreview();
  }};

  // 8. AVATARS
  function renderAvatars() {{
    studioAvatarList.innerHTML = "";
    AVATARS.forEach((av) => {{
      const img = document.createElement("img");
      img.src = av.startsWith("blob:") ? av : "assets/avatars/" + av;
      img.style.cssText = "width: 48px; height: 48px; border-radius: 10px; object-fit: cover; cursor: pointer; border: 2px solid " + (selectedAvatar === av ? "#ec4899" : "transparent") + "; flex-shrink: 0;";
      img.onclick = () => {{
        selectedAvatar = av;
        document.querySelectorAll('input[name="studioAvatarMode"]').forEach(r => {{ if (r.value === 'fixed') r.checked = true; }});
        renderAvatars();
        renderCanvasPreview();
      }};
      studioAvatarList.appendChild(img);
    }});
  }}

  // 9. STORIES PARSER
  function parseStories(raw) {{
    const blocks = raw.split(/---+/).map(b => b.trim()).filter(Boolean);
    const result = [];
    blocks.forEach((block, idx) => {{
      const lines = block.split("\\n").map(l => l.trim()).filter(Boolean);
      let author = "Anonymous";
      let handle = "@story_confessions";
      let title = "";
      let contentLines = [];
      let pinLink = "https://yourwebsite.com/read-more";

      lines.forEach(l => {{
        if (/^Author:\\s*/i.test(l)) author = l.replace(/^Author:\\s*/i, "");
        else if (/^Handle:\\s*/i.test(l)) handle = l.replace(/^Handle:\\s*/i, "");
        else if (/^Title:\\s*/i.test(l)) title = l.replace(/^Title:\\s*/i, "");
        else if (/^Pin_Link:\\s*/i.test(l)) pinLink = l.replace(/^Pin_Link:\\s*/i, "");
        else if (/^Content:\\s*/i.test(l)) contentLines.push(l.replace(/^Content:\\s*/i, ""));
        else contentLines.push(l);
      }});

      result.push({{
        index: idx + 1,
        author,
        handle,
        title: title || (contentLines[0] ? contentLines[0].slice(0, 40) + "..." : "Confession"),
        content: contentLines.join("\\n\\n"),
        pinLink,
        avatar: AVATARS[idx % AVATARS.length],
        bgClip: BG_CLIPS[idx % BG_CLIPS.length]
      }});
    }});
    return result;
  }}

  function reloadStories() {{
    const storiesTxt = STORIES_BY_COUNTRY[currentCountry] || STORIES_BY_COUNTRY["us"];
    studioBatchTextarea.value = storiesTxt;
    parsedStories = parseStories(storiesTxt);
    currentStoryIdx = 0;
    updateStoryNav();
    renderCanvasPreview();
  }}

  function updateStoryNav() {{
    const totalAvail = parsedStories.length || 1;
    statStoryCountDisplay.textContent = parsedStories.length;
    currentStoryIndexBadge.textContent = `${{currentStoryIdx + 1}} / ${{totalAvail}}`;
    btnPrevStory.disabled = currentStoryIdx <= 0;
    btnNextStory.disabled = currentStoryIdx >= totalAvail - 1;
  }}

  btnPrevStory.onclick = () => {{
    if (currentStoryIdx > 0) {{ currentStoryIdx--; updateStoryNav(); updateBgVideoSource(); renderCanvasPreview(); }}
  }};
  btnNextStory.onclick = () => {{
    if (currentStoryIdx < parsedStories.length - 1) {{ currentStoryIdx++; updateStoryNav(); updateBgVideoSource(); renderCanvasPreview(); }}
  }};
  document.getElementById("btnReloadSampleStories").onclick = reloadStories;
  studioBatchTextarea.oninput = () => {{
    parsedStories = parseStories(studioBatchTextarea.value);
    updateStoryNav();
    renderCanvasPreview();
  }};

  function updateBgVideoSource() {{
    if (currentBgMode === "canopy" || currentBgMode === "gradient") {{
      studioBgVideo.pause();
      studioBgVideo.src = "";
      return;
    }}
    let clipFile = activeSelectedBg;
    if (currentBgMode === "random" && parsedStories[currentStoryIdx]) {{
      clipFile = parsedStories[currentStoryIdx].bgClip || BG_CLIPS[0];
    }}
    const src = clipFile.startsWith("blob:") ? clipFile : `assets/backgrounds/${{clipFile}}`;
    if (studioBgVideo.src !== src) {{
      studioBgVideo.src = src;
      studioBgVideo.currentTime = 0;
      studioBgVideo.play().catch(() => {{}});
    }}
  }}

  async function loadAvatar(avFileOrUrl) {{
    if (avatarCache[avFileOrUrl]) return avatarCache[avFileOrUrl];
    return new Promise(resolve => {{
      const img = new Image();
      img.onload = () => {{ avatarCache[avFileOrUrl] = img; resolve(img); }};
      img.onerror = () => resolve(null);
      img.src = avFileOrUrl.startsWith("blob:") ? avFileOrUrl : "assets/avatars/" + avFileOrUrl;
    }});
  }}

  function drawRoundedRect(ctx, x, y, w, h, r) {{
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }}

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines, highlightColor) {{
    const paragraphs = text.split("\\n");
    let currentY = y;
    let lineCount = 0;

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {{
      if (lineCount >= maxLines) break;
      const para = paragraphs[pIdx];
      const words = para.split(" ");
      let line = "";
      for (let n = 0; n < words.length; n++) {{
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {{
          if (lineCount === 0 && highlightColor) {{
            ctx.fillStyle = highlightColor;
            ctx.font = "bold " + ctx.font;
            ctx.fillText(line.trim(), x, currentY);
          }} else {{
            ctx.fillText(line.trim(), x, currentY);
          }}
          line = words[n] + " ";
          currentY += lineHeight;
          lineCount++;
          if (lineCount >= maxLines) break;
        }} else {{
          line = testLine;
        }}
      }}
      if (lineCount < maxLines && line.trim()) {{
        if (lineCount === 0 && highlightColor) {{
          ctx.fillStyle = highlightColor;
          ctx.fillText(line.trim(), x, currentY);
        }} else {{
          ctx.fillText(line.trim(), x, currentY);
        }}
        currentY += lineHeight;
        lineCount++;
      }}
      currentY += lineHeight * 0.4;
    }}
  }}

  function getTemplateForStory(storyIndex) {{
    const picked = getPickedTemplates();
    if (picked.length > 0) {{
      return picked[storyIndex % picked.length];
    }}
    return TEMPLATES[0];
  }}

  // 10. CANVAS RENDER
  async function renderCanvasPreview() {{
    if (!parsedStories || parsedStories.length === 0) return;
    const story = parsedStories[currentStoryIdx] || parsedStories[0];
    const tpl = getTemplateForStory(currentStoryIdx);
    const colors = tpl.colors || {{}};
    const ho = tpl.ho || "the-vet";

    const W = 1080;
    const H = 1920;

    // 1. DRAW BACKGROUND
    if (currentBgMode === "canopy" && canopyImg.complete) {{
      // Lush green sunbeam canopy forest!
      studioCtx.drawImage(canopyImg, 0, 0, W, H);
      studioCtx.fillStyle = "rgba(10, 20, 15, 0.45)"; // soft green/dark tint for contrast
      studioCtx.fillRect(0, 0, W, H);
    }} else if (currentBgMode !== "gradient" && studioBgVideo.readyState >= 2) {{
      studioCtx.drawImage(studioBgVideo, 0, 0, W, H);
      studioCtx.fillStyle = ho === "anh-kinh" ? "rgba(10, 5, 20, 0.45)" : "rgba(10, 5, 20, 0.55)";
      studioCtx.fillRect(0, 0, W, H);
    }} else {{
      const grad = studioCtx.createLinearGradient(0, 0, 0, H);
      const bgTop = colors.c1 || "#1f1035";
      const bgBottom = colors.c3 || "#120722";
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
      studioCtx.fillStyle = "rgba(22, 14, 38, 0.75)";
      studioCtx.fill();
      studioCtx.lineWidth = 2.5;
      studioCtx.strokeStyle = colors.cta || "rgba(244, 114, 182, 0.5)";
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
      studioCtx.fillStyle = "rgba(15, 15, 20, 0.88)";
      studioCtx.fill();
      studioCtx.lineWidth = 2;
      studioCtx.strokeStyle = colors.cta || "#ec4899";
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
    const avFile = isRandomAv ? (story.avatar || AVATARS[currentStoryIdx % AVATARS.length]) : selectedAvatar;
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
      studioCtx.fillStyle = colors.c4 || "#a855f7";
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
    studioCtx.fillStyle = ho === "anh-kinh" || ho.includes("dark") ? "#c4b5fd" : "#6b7280";
    studioCtx.font = `32px ${{fontFam}}`;
    studioCtx.fillText(`${{story.handle}} · ${{timeStr}}`, textStartX, authorY + 50);

    // 5. DIVIDER
    studioCtx.strokeStyle = ho === "anh-kinh" || ho.includes("dark") ? "rgba(168,85,247,0.25)" : (colors.c2 || "#e5e7eb");
    studioCtx.lineWidth = 1.5;
    studioCtx.beginPath();
    studioCtx.moveTo(cardX + 48, avY + avSize + 36);
    studioCtx.lineTo(cardX + cardW - 48, avY + avSize + 36);
    studioCtx.stroke();

    // 6. STORY BODY TEXT
    const bodyTextColor = ho === "anh-kinh" || ho.includes("dark") ? "#f3e8ff" : (colors.c6 || "#1f2937");
    studioCtx.fillStyle = bodyTextColor;
    studioCtx.font = `400 37px/1.55 ${{fontFam}}`;
    const highlight = colors.red || colors.c4 || "#ec4899";
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
    studioCtx.fillStyle = colors.cta || "#ec4899";
    studioCtx.fill();

    studioCtx.fillStyle = "#ffffff";
    studioCtx.font = `bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    studioCtx.textAlign = "center";
    studioCtx.fillText(ctaText, btnBX + btnW / 2, btnBY + 56);
    studioCtx.restore();
  }}

  let isRecording = false;
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

  // 11. AUDIO & MEDIA RECORDER
  function getAudioStreamNodes(audioSrc) {{
    if (!globalAudioCtx) {{
      globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      globalAudioDestNode = globalAudioCtx.createMediaStreamDestination();
      globalAudioElement = new Audio();
      globalAudioElement.crossOrigin = "anonymous";
      globalAudioElement.loop = true;
      globalAudioSourceNode = globalAudioCtx.createMediaElementSource(globalAudioElement);
      globalAudioSourceNode.connect(globalAudioDestNode);
    }}
    if (globalAudioCtx.state === "suspended") {{
      globalAudioCtx.resume();
    }}
    if (globalAudioElement.src !== audioSrc) {{
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

  // 12. ZIP CREATOR
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
    centralDirs.forEach(p => cdSize += p.length);

    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, fileList.length, true);
    ev.setUint16(10, fileList.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, cdOffset, true);
    ev.setUint20 = 0;

    const allParts = [...parts, ...centralDirs, eocd];
    return new Blob(allParts, {{ type: "application/zip" }});
  }}

  // 13. RENDER SINGLE
  btnRenderSingle.onclick = async () => {{
    const story = parsedStories[currentStoryIdx] || parsedStories[0];
    const dur = parseInt(selectStudioDuration.value, 10);
    btnRenderSingle.disabled = true;
    btnRenderSingle.textContent = "⏳ Đang ghi hình...";
    renderProgressBox.style.display = "block";
    renderStatusText.textContent = `Đang render Truyện #${{story.index}}...`;
    renderProgressBar.style.width = "50%";
    renderPercentText.textContent = "50%";

    const mp4Blob = await recordStoryVideo(story, dur, currentStoryIdx);

    const a1 = document.createElement("a");
    a1.href = URL.createObjectURL(mp4Blob);
    a1.download = `story_${{story.index}}_${{story.author.replace(/\\s+/g, '_')}}.mp4`;
    a1.click();

    const txtBlob = new Blob([`${{story.title}}\\n\\n${{story.content}}\\n\\n👉 Link: ${{story.pinLink}}`], {{ type: "text/plain;charset=utf-8" }});
    const a2 = document.createElement("a");
    a2.href = URL.createObjectURL(txtBlob);
    a2.download = `story_${{story.index}}_${{story.author.replace(/\\s+/g, '_')}}.txt`;
    setTimeout(() => a2.click(), 400);

    renderProgressBar.style.width = "100%";
    renderPercentText.textContent = "100%";
    renderStatusText.textContent = "✓ Hoàn tất tải Video + File TXT!";
    btnRenderSingle.disabled = false;
    btnRenderSingle.textContent = "⚡ Render Thử 1 Video Này (.mp4 + .txt)";
  }};

  // 14. BATCH RENDER N STORIES
  btnRenderBatch30.onclick = async () => {{
    if (!parsedStories || parsedStories.length === 0) return alert("Không có kịch bản để render!");
    const count = Math.min(targetVideoCount, parsedStories.length);
    const dur = parseInt(selectStudioDuration.value, 10);
    btnRenderBatch30.disabled = true;
    renderProgressBox.style.display = "block";
    btnDownloadAllZip.style.display = "none";
    renderedFiles = [];

    for (let i = 0; i < count; i++) {{
      const story = parsedStories[i];
      const activeTpl = getTemplateForStory(i);
      renderStatusText.textContent = `Đang render video ${{i + 1}}/${{count}}: [${{activeTpl.label}}] - ${{story.author}}...`;
      const pct = Math.round(((i + 1) / count) * 100);
      renderProgressBar.style.width = pct + "%";
      renderPercentText.textContent = pct + "%";

      const mp4Blob = await recordStoryVideo(story, dur, i);
      const safeName = `story_${{i + 1}}_${{story.author.replace(/\\s+/g, '_')}}`;

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

html = html + "\n" + studio_modal_html + "\n" + studio_script

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"build_full_studio_v2.py completed! File size: {len(html)} bytes")
