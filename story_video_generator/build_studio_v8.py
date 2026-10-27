import os, json, re

print("Starting build_studio_v8.py...")

# 1. Read base competitor template
with open('kho-mau-v1.6.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# 2. Extract MAU data & Assets
m_mau = re.search(r'<script id="mau-data"[^>]*>(.*?)</script>', html, re.S)
mau_data = json.loads(m_mau.group(1))

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
        "ho": m.get("ho") or ("dark-photo" if "photo" in m["id"] else ("notebook" if "notebook" in m["id"] else ("bang-dong" if "dong" in m["id"] else "the-vet"))),
        "pals": pals_info
    })

bg_files = sorted([f for f in os.listdir('assets/backgrounds') if f.endswith('.mp4')])
avatar_files = sorted([f for f in os.listdir('assets/avatars') if f.lower().endswith(('.jpg', '.png', '.jpeg'))])

sample_stories_fr = ""
if os.path.exists('batch_30_stories.txt'):
    with open('batch_30_stories.txt', 'r', encoding='utf-8') as f:
        sample_stories_fr = f.read()

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
Title: The silence on the wedding morning
Content:
On the morning of my wedding, my sister locked herself in the dressing room.
Everyone thought it was just bridal stress. But then the hotel manager handed me a cassette tape recorded the previous midnight...
Highlights: locked herself in the dressing room | cassette tape recorded
CTA: Read Full Story In Comments
Link: https://example.com/us/story-5""",

    "fr": sample_stories_fr or """=== STORY 1 ===
Author: Franck Meynard
Page: Vérités d'Hier
Time: Il y a 1 h
Title: Vingt familles avaient dit non...
Content:
J'ai adopté seul la petite que vingt familles avaient refusée.
Son diagnostic faisait reculer tout le monde. « Vous avez le temps de réfléchir, monsieur. »
J'ai signé les pages en moins de quatre minutes.
Elle avait onze mois. La première nuit dans notre deux-pièces, je lui ai chuchoté contre mon épaule : « On forme une équipe maintenant. »
Dix ans ont coulé. Elle a marché, elle a appris à lire, elle a ri plus fort que la moyenne.
Puis Greg, dont je n'avais plus de nouvelles depuis la signature, s'est pointé un mardi midi devant l'école...
Highlights: « Vous avez le temps de réfléchir, monsieur. » | « On forme une équipe maintenant. » | s'est pointé un mardi midi devant l'école...
CTA: Continuer la lecture dans les commentaires
Link: https://example.com/fr/histoire-1

=== STORY 2 ===
Author: Julien Tardieu
Page: Masques Tombés
Time: Il y a 3 h
Title: Deux petits garçons endormis dans mon fauteuil
Content:
Deux garçons dormaient dans mon fauteuil quand je suis entré au bureau ce matin-là.
Il était 7 h 10, le couloir sentait la cire et le café froid. « Ils sont arrivés avec une dame, patron », a dit le veilleur de nuit.
J'ai posé ma sacoche et je me suis assis par terre en face d'eux : « Laissez-les dormir. »
Dans la poche du plus grand, il y avait une enveloppe cachetée avec mon prénom écrit au feutre violet.
Un an plus tard, devant le notaire de famille, j'ai compris qui était leur mère...
Highlights: « Laissez-les dormir. » | enveloppe cachetée avec mon prénom | j'ai compris qui était leur mère...
CTA: Continuer la lecture dans les commentaires
Link: https://example.com/fr/histoire-2

=== STORY 3 ===
Author: Camille Laurent
Page: Mémoires Secrètes
Time: Il y a 4 h
Title: L'enveloppe jaune posée sur la commode
Content:
Au quatrième jour après l'opération, ma belle-mère a posé un dossier sur la commode sans me regarder dans les yeux.
Ma fille dormait dans son berceau en osier à côté de moi.
« Signe ça tout de suite et ne pose aucune question », m'a-t-elle murmuré d'un ton sec.
Quand j'ai refusé de prendre le stylo, elle a sorti une enveloppe jaune froissée contenant les dernières volontés de ma propre mère...
Highlights: « Signe ça tout de suite et ne pose aucune question » | dernières volontés de ma propre mère...
CTA: Continuer la lecture dans les commentaires
Link: https://example.com/fr/histoire-3""",

    "nl": """=== STORY 1 ===
Author: Daan van Dijk
Page: Verborgen Realiteit
Time: 2 uur geleden
Title: Het meisje dat twintig families weigerden
Content:
Ik adopteerde het kleine meisje dat door twintig families was afgewezen.
Haar diagnose schrikte iedereen af. "U heeft tijd om na te denken, meneer."
Ik tekende de papieren in minder dan vier minuten.
Ze was elf maanden oud. De eerste nacht fluisterde ik: "We zijn een team vanaf nu."
Tien jaar verstreken. Ze leerde lopen, lezen en lachte harder dan wie dan ook.
Toen stond Greg, die ik tien jaar niet had gezien, ineens voor de deur...
Highlights: "U heeft tijd om na te denken, meneer." | "We zijn een team vanaf nu." | ineens voor de deur...
CTA: Lees het volledige verhaal in de reacties
Link: https://example.com/nl/verhaal-1

=== STORY 2 ===
Author: Lucas Bakker
Page: Stille Getuigenissen
Time: 4 uur geleden
Title: Twee jongens in mijn kantoor
Content:
Twee jongens sliepen in mijn leunstoel toen ik maandagochtend vroeg op kantoor aankwam.
Het was tien over zeven en de gang was nog donker. "Ze kwamen met een dame," fluisterde de bewaker.
Ik pakte een stoel tegenover hen: "Laat ze maar slapen."
In de zak van de oudste vond ik een verzegelde paarse brief met mijn naam erop...
Highlights: "Laat ze maar slapen." | verzegelde paarse brief
CTA: Lees het volledige verhaal in de reacties
Link: https://example.com/nl/verhaal-2""",

    "de": """=== STORY 1 ===
Author: Markus Weber
Page: Stille Wahrheiten
Time: Vor 3 Std.
Title: Das Mädchen, das zwanzig Familien ablehnten
Content:
Ich adoptierte das kleine Mädchen, das zwanzig Familien zuvor abgelehnt hatten.
Ihre medizinische Diagnose jagte allen Angst ein. "Sie haben Bedenkzeit, mein Herr."
Ich unterschrieb die Papiere in weniger als vier Minuten.
Sie war elf Monate alt. In unserer ersten Nacht flüsterte ich ihr zu: "Wir schaffen das zusammen."
Zehn Jahre vergingen. Sie lernte laufen, lesen und lachte aus vollem Herzen.
Dann tauchte Greg, den ich seit Jahren nicht mehr gesehen hatte, plötzlich vor unserer Haustür auf...
Highlights: "Sie haben Bedenkzeit, mein Herr." | "Wir schaffen das zusammen." | plötzlich vor unserer Haustür auf...
CTA: Ganze Geschichte in den Kommentaren lesen
Link: https://example.com/de/geschichte-1""",

    "es": """=== STORY 1 ===
Author: Carlos Morales
Page: Historias Reales
Time: Hace 2 horas
Title: La niña que veinte familias rechazaron
Content:
Adopté a la pequeña niña que veinte familias habían rechazado.
Su diagnóstico asustaba a todos. "Tiene tiempo para pensarlo, señor."
Firmé los papeles de adopción en menos de cuatro minutos.
Tenía once meses. En nuestra primera noche le susurré: "Ahora somos un equipo."
Pasaron diez años. Aprendió a caminar, a leer y reía más fuerte que nadie.
Entonces Greg, a quien no veía desde el día del juicio, apareció en mi puerta...
Highlights: "Tiene tiempo para pensarlo, señor." | "Ahora somos un equipo." | apareció en mi puerta...
CTA: Seguir leyendo en los comentarios
Link: https://example.com/es/historia-1""",

    "vi": """=== STORY 1 ===
Author: Tuấn Minh
Page: Góc Nhìn Cuộc Sống
Time: 2 giờ trước
Title: Cô bé bị 20 gia đình từ chối nhận nuôi
Content:
Tôi đã một mình nhận nuôi đứa bé mà hơn hai mươi gia đình trước đó đều lắc đầu từ chối.
Bệnh án của con khiến mọi người sợ hãi rút lui. "Anh có thời gian suy nghĩ kỹ mà."
Tôi ký vào biên bản nhận con trong chưa đầy bốn phút.
Lúc đó con mới tròn mười một tháng tuổi. Đêm đầu tiên trong căn phòng trọ nhỏ, tôi ghé sát tai con thì thầm: "Hai bố con mình từ nay là một gia đình nhé."
Mười năm thấm thoát trôi qua. Con biết đi, biết đọc sách, nụ cười rạng rỡ như ánh mặt trời.
Rồi một ngày, Greg – người chú ruột chưa từng xuất hiện suốt mười năm – bất ngờ đứng trước cổng đòi quyền thừa kế...
Highlights: "Anh có thời gian suy nghĩ kỹ mà." | "Hai bố con mình từ nay là một gia đình nhé." | bất ngờ đứng trước cổng đòi quyền thừa kế...
CTA: Đọc tiếp toàn bộ câu chuyện dưới bình luận
Link: https://example.com/vi/cau-chuyen-1"""
}

# 3. CSS for Studio UI & Floating Action Bar
custom_head_css = """
<style>
/* VIỆT REELS STUDIO PRO V8 STYLES */
#floatingGenBar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, rgba(16, 24, 20, 0.96) 0%, rgba(6, 12, 9, 0.98) 100%);
  border: 1.5px solid rgba(52, 211, 153, 0.6);
  border-radius: 50px;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.75), 0 0 25px rgba(16, 185, 129, 0.3);
  z-index: 9999;
  backdrop-filter: blur(12px);
  animation: floatPopIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes floatPopIn {
  from { opacity: 0; transform: translate(-50%, 20px) scale(0.95); }
  to { opacity: 1; transform: translate(-50%, 0) scale(1); }
}
.btn-floating-gen {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  border: none;
  border-radius: 30px;
  padding: 10px 22px;
  font-weight: 800;
  font-size: 14.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.5);
  transition: all 0.2s ease;
}
.btn-floating-gen:hover {
  transform: scale(1.04);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.7);
}

/* Studio Wizard Modal Window */
#studioModal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(10px);
  z-index: 10000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.studio-dialog {
  background: #0d1511;
  border: 1.5px solid rgba(52, 211, 153, 0.4);
  border-radius: 20px;
  width: 96vw;
  max-width: 1400px;
  height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 30px 80px rgba(0,0,0,0.9), 0 0 40px rgba(16, 185, 129, 0.2);
  overflow: hidden;
}
.btn-preset-count {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #a7f3d0;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-preset-count:hover, .btn-preset-count.active {
  background: #10b981;
  color: #fff;
  border-color: #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}
</style>
"""

# Replace title and insert CSS
html = html.replace("<title>Kho mẫu reel — dựng cấu hình page</title>", "<title>Việt Reels Studio Pro — Tạo Video Tự Động Theo Mẫu</title>\n" + custom_head_css)

# Inject header buttons right before </header>
header_target = '</header>'
header_injection = """
  <button id="btnOpenQuyChuan" type="button" class="ghost" style="color: #a7f3d0; border-color: rgba(52,211,153,0.4); margin-left: 8px;">📋 Quy chuẩn nạp file</button>
  <button id="btnMoStudio" type="button" class="act" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; font-weight: 800; border: none; box-shadow: 0 4px 15px rgba(16,185,129,0.45); cursor: pointer; padding: 7px 16px; border-radius: 8px; margin-left: 8px;">
    🚀 MỞ STUDIO GEN VIDEO (<span id="headerPickCount">0</span> MẪU)
  </button>
</header>"""

if header_target in html:
    html = html.replace(header_target, header_injection, 1)

# Inject footer button right after btnTao2
footer_target = '<button class="act" id="btnTao2">Tạo file page</button>'
footer_replacement = """<button class="act" id="btnTao2">Tạo file page</button>
  <button id="btnFooterStudio" type="button" class="act" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; font-weight: 800; border: none; box-shadow: 0 4px 15px rgba(16,185,129,0.45); cursor: pointer; padding: 7px 16px; border-radius: 8px; margin-left: 8px;">
    🚀 MỞ STUDIO GEN VIDEO
  </button>"""

if footer_target in html:
    html = html.replace(footer_target, footer_replacement, 1)

# Modify taoThe in html to include "✏️ Chỉnh sửa mẫu" and "🎬 Gen video" buttons
old_tao_the_line = '<label class="pick"><input type="checkbox"> Chọn mẫu này</label>'
new_tao_the_line = """<label class="pick"><input type="checkbox"> Chọn mẫu này</label>
      <div class="card-actions" style="display:flex;gap:6px;margin-top:8px;">
        <button class="btn-card-edit" type="button" style="flex:1;background:rgba(52,211,153,0.18);border:1px solid rgba(52,211,153,0.45);color:#34d399;font-size:11.5px;font-weight:700;padding:6px 6px;border-radius:6px;cursor:pointer;">✏️ Chỉnh sửa mẫu</button>
        <button class="btn-card-gen" type="button" style="background:#10b981;border:none;color:#fff;font-size:11.5px;font-weight:700;padding:6px 10px;border-radius:6px;cursor:pointer;">🎬 Gen video</button>
      </div>"""
if old_tao_the_line in html:
    html = html.replace(old_tao_the_line, new_tao_the_line)

# Add event listeners inside taoThe function in script
old_onchange_code = """cb.onchange = () => {
    state[i].picked = cb.checked;
    el.classList.toggle("picked", cb.checked);
    luu(); demChon();
  };
  return el;"""

new_onchange_code = """cb.onchange = () => {
    state[i].picked = cb.checked;
    el.classList.toggle("picked", cb.checked);
    luu(); demChon();
  };
  const bEdit = el.querySelector(".btn-card-edit");
  if (bEdit) bEdit.onclick = (e) => { e.stopPropagation(); moChinh(i); };
  const bGen = el.querySelector(".btn-card-gen");
  if (bGen) bGen.onclick = (e) => { e.stopPropagation(); moChinh(i); };
  return el;"""
if old_onchange_code in html:
    html = html.replace(old_onchange_code, new_onchange_code)

# Add reactive updatePickedUI inside demChon()
old_dem_chon = """function demChon() {
  if (typeof veDauMuc === "function") veDauMuc();
  doc_("pickCount").textContent = `Đã chọn ${state.filter((s) => s.picked).length} mẫu`;"""
new_dem_chon = """function demChon() {
  if (typeof veDauMuc === "function") veDauMuc();
  doc_("pickCount").textContent = `Đã chọn ${state.filter((s) => s.picked).length} mẫu`;
  try { if (typeof updatePickedUI === "function") updatePickedUI(); } catch(e){}"""
if old_dem_chon in html:
    html = html.replace(old_dem_chon, new_dem_chon)

# Add badge updater in moChinh()
old_mo_chinh = """function moChinh(i) {
  cur = i;
  const m = MAU[i], s = state[i];"""
new_mo_chinh = """function moChinh(i) {
  cur = i;
  const m = MAU[i], s = state[i];
  try {
    const bBadge = document.getElementById("cTplIdBadge");
    if (bBadge) bBadge.textContent = `${m.id} · ${m.pals[s.pal].id}`;
  } catch(e){}"""
if old_mo_chinh in html:
    html = html.replace(old_mo_chinh, new_mo_chinh)

# Inject Video Generation Box directly inside #cPanel in #chinh
chinh_injection_target = '<span style="flex:1"></span>\n    <div class="hang">\n      <button class="ghost" id="cClose" style="flex:1">Xong</button>'
chinh_video_box = """
    <!-- KHỐI XUẤT VIDEO TRỰC TIẾP TỪ MẪU NÀY (ÁP DỤNG MỌI CHỈNH SỬA) -->
    <div style="margin-top: 14px; padding: 14px; background: rgba(16,185,129,0.12); border: 1.5px solid rgba(52,211,153,0.4); border-radius: 12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
        <span style="color: #34d399; font-weight: 800; font-size: 13.5px; display: flex; align-items: center; gap: 6px;">
          🎬 Xuất video từ mẫu này ngay
        </span>
        <span id="cTplIdBadge" style="font-size: 10.5px; color: #a7f3d0; background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px;"></span>
      </div>
      <div style="font-size: 11.5px; color: #cbd5e1; line-height: 1.4; margin-bottom: 10px;">
        Áp dụng <b>100% mọi chỉnh sửa</b>: màu sắc, toạ độ kéo dời lớp, cỡ chữ và ẩn/hiện lớp vừa chỉnh ở trên!
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
        <div>
          <label style="font-size: 10.5px; color: #a7f3d0; display: block; margin-bottom: 2px;">Thời lượng:</label>
          <select id="cDuration" style="width: 100%; box-sizing: border-box; background: #0c1410; border: 1px solid rgba(52,211,153,0.3); color: #fff; font-size: 12px; border-radius: 6px; padding: 5px;">
            <option value="5">5 Giây (Test nhanh)</option>
            <option value="10" selected>10 Giây (Chuẩn Reels)</option>
            <option value="15">15 Giây (Story/TikTok)</option>
          </select>
        </div>
        <div>
          <label style="font-size: 10.5px; color: #a7f3d0; display: block; margin-bottom: 2px;">Nền video:</label>
          <select id="cBgMode" style="width: 100%; box-sizing: border-box; background: #0c1410; border: 1px solid rgba(52,211,153,0.3); color: #fff; font-size: 12px; border-radius: 6px; padding: 5px;">
            <option value="random">🎲 Random clip nền</option>
            <option value="fixed">🔒 Cố định clip 1</option>
            <option value="gradient">🎨 Nền màu mẫu</option>
          </select>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button id="btnGenFromChinh" type="button" style="width: 100%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; border: none; font-weight: 800; font-size: 13.5px; padding: 10px 14px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(16,185,129,0.45); transition: all 0.2s;">
          🎬 XUẤT VIDEO THEO MẪU NÀY NGAY (.MP4)
        </button>
        <button id="btnOpenStudioWithThis" type="button" style="width: 100%; background: rgba(52,211,153,0.18); border: 1px solid rgba(52,211,153,0.4); color: #a7f3d0; font-weight: 700; font-size: 12px; padding: 8px 12px; border-radius: 8px; cursor: pointer;">
          🚀 Dùng mẫu này gen hàng loạt (5 - 30 video)
        </button>
      </div>
      <div id="cRenderProgress" style="display: none; margin-top: 10px; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 6px; border: 1px solid rgba(52,211,153,0.3);">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #34d399; font-weight: 700; margin-bottom: 4px;">
          <span id="cRenderStatus">Đang ghi video...</span>
          <span id="cRenderPercent">0%</span>
        </div>
        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
          <div id="cProgressBar" style="width: 0%; height: 100%; background: #10b981; transition: width 0.1s;"></div>
        </div>
      </div>
    </div>

    <span style="flex:1"></span>
    <div class="hang">
      <button class="ghost" id="cClose" style="flex:1">Xong</button>"""

if chinh_injection_target in html:
    html = html.replace(chinh_injection_target, chinh_video_box, 1)

# Floating bar HTML
floating_bar_html = """
<!-- FLOATING ACTION BAR AT BOTTOM SCREEN -->
<div id="floatingGenBar" style="display: none;">
  <div style="display: flex; flex-direction: column;">
    <div style="font-size: 14px; font-weight: 800; color: #34d399;">
      🎯 Đã chọn <span id="floatPickNum" style="color:#fff; font-size:16px;">0</span> mẫu thiết kế
    </div>
    <div id="floatPickNames" style="font-size: 11.5px; color: #94a3b8; max-width: 480px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
      Chưa chọn mẫu nào
    </div>
  </div>
  <button id="btnFloatingGen" class="btn-floating-gen">
    <span>🚀 TIẾP TỤC QUA BƯỚC GEN VIDEO</span>
    <span style="background: rgba(0,0,0,0.25); padding: 3px 9px; border-radius: 12px; font-size: 13px;">➔</span>
  </button>
</div>
"""

# Dialog Quy chuẩn nạp file
dialog_quychuan_html = """
<!-- MODAL QUY CHUẨN NẠP FILE KỊCH BẢN -->
<dialog id="dlgQuyChuan" style="background: #111a14; color: #e2e8f0; border: 1px solid rgba(52,211,153,0.4); border-radius: 18px; max-width: 780px; width: 92vw; padding: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.8);">
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px; margin-bottom: 18px;">
    <div style="font-size: 18px; font-weight: 800; color: #34d399; display: flex; align-items: center; gap: 8px;">
      📋 Quy Chuẩn Định Dạng File Kịch Bản (TXT & JSON)
    </div>
    <button onclick="document.getElementById('dlgQuyChuan').close()" style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✕</button>
  </div>
  
  <div style="font-size: 13.5px; line-height: 1.6; color: #cbd5e1;">
    Hệ thống hỗ trợ <b>2 định dạng file nạp vào</b> để nhận diện tự động từng video, tiêu đề, tác giả, tên page và câu bôi đỏ (Highlights):
    
    <div style="margin-top: 14px; background: rgba(0,0,0,0.4); border: 1px solid rgba(52,211,153,0.25); border-radius: 10px; padding: 14px;">
      <div style="font-weight: 700; color: #fde047; margin-bottom: 6px;">1. Định dạng File Text (.txt) — Khuyên dùng (Đơn giản nhất):</div>
      <pre style="background: #080d0a; padding: 12px; border-radius: 8px; font-size: 12px; overflow-x: auto; color: #a7f3d0; margin: 0;">
=== STORY 1 ===
Tác giả: Franck Meynard
Thời gian: Il y a 1 h
Tên Page: Vérités d'Hier
Tiêu đề: Vingt familles avaient dit non...
Nội dung thẻ:
J'ai adopté seul la petite que vingt familles avaient refusée.
Son diagnostic faisait reculer tout le monde. « Vous avez le temps de réfléchir, monsieur. »
J'ai signé les pages en moins de quatre minutes...
Highlights: « Vous avez le temps de réfléchir, monsieur. » | il a compris ce qu'il avait signé...
Nút CTA: Continuer la lecture dans les commentaires
Link: https://example.com/fr/histoire-1

=== STORY 2 ===
Tác giả: Julien Tardieu
Thời gian: Il y a 3 h
Tên Page: Masques Tombés
...</pre>
    </div>

    <div style="margin-top: 14px; background: rgba(0,0,0,0.4); border: 1px solid rgba(52,211,153,0.25); border-radius: 10px; padding: 14px;">
      <div style="font-weight: 700; color: #60a5fa; margin-bottom: 6px;">2. Định dạng File JSON (.json):</div>
      <pre style="background: #080d0a; padding: 12px; border-radius: 8px; font-size: 12px; overflow-x: auto; color: #93c5fd; margin: 0;">
[
  {
    "author": "Franck Meynard",
    "pageName": "Vérités d'Hier",
    "timeAgo": "Il y a 1 h",
    "title": "Vingt familles avaient dit non...",
    "text": "J'ai adopté seul la petite que vingt familles avaient refusée...",
    "highlights": ["« Vous avez le temps de réfléchir, monsieur. »"],
    "cta": "Continuer la lecture dans les commentaires",
    "link": "https://example.com/fr/histoire-1"
  }
]</pre>
    </div>
  </div>

  <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
    <button id="btnCopySampleTxt" style="background: #10b981; color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 700; cursor: pointer;">📋 Sao chép mẫu .txt</button>
    <button id="btnCopySampleJson" style="background: #3b82f6; color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 700; cursor: pointer;">📋 Sao chép mẫu .json</button>
    <button id="btnDownloadSampleTxtFile" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 9px 18px; border-radius: 8px; font-weight: 700; cursor: pointer;">💾 Tải file mẫu 30 stories</button>
  </div>
</dialog>
"""

# Studio Wizard Modal HTML
studio_modal_html = """
<!-- STUDIO GEN VIDEO MODAL WIZARD -->
<div id="studioModal">
  <div class="studio-dialog">
    <!-- Header -->
    <div style="padding: 14px 22px; background: rgba(10, 18, 14, 0.95); border-bottom: 1px solid rgba(52,211,153,0.3); display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 20px;">🎬</span>
        <div>
          <div style="font-weight: 800; font-size: 16px; color: #f0fdf4;">VIỆT REELS STUDIO PRO — DỰNG VIDEO THEO MẪU CHỌN</div>
          <div style="font-size: 11.5px; color: #a7f3d0;">Gen đúng số lượng video, random hoặc đồng nhất 100% mẫu đã chọn, xuất file theo tên Page</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 14px;">
        <span id="studioActiveTemplateBadge" style="background: rgba(16,185,129,0.2); border: 1px solid #10b981; color: #34d399; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px;">
          🎯 Đang chọn: 0 mẫu
        </span>
        <button id="studioCloseBtn" style="background: rgba(255,255,255,0.1); border: none; color: #e2e8f0; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 18px;">✕</button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div style="flex: 1; display: flex; overflow: hidden;">
      
      <!-- Left Panel: Configurations -->
      <div style="flex: 1.2; display: flex; flex-direction: column; border-right: 1px solid rgba(52,211,153,0.2); padding: 18px; overflow-y: auto; gap: 16px; background: rgba(10, 18, 14, 0.6);">
        
        <!-- Template Selection Status Banner -->
        <div id="studioTemplateStatusBox" style="background: rgba(16,185,129,0.12); border: 1.5px solid rgba(52,211,153,0.5); border-radius: 12px; padding: 12px 16px;">
          <div id="studioTemplateModeTitle" style="font-size: 13.5px; font-weight: 800; color: #34d399; margin-bottom: 4px;">
            🔒 CHẾ ĐỘ ĐỒNG NHẤT 1 MẪU:
          </div>
          <div id="studioTemplateDetailsList" style="font-size: 12px; color: #cbd5e1; line-height: 1.5;">
            Đang tải thông tin mẫu...
          </div>
        </div>

        <!-- Row 1: Fanpage, Author & Language -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
          <div>
            <label style="font-size: 11.5px; font-weight: 700; color: #a7f3d0; margin-bottom: 4px; display: block;">TÊN KÊNH / FANPAGE (XUẤT TÊN FILE)</label>
            <input type="text" id="studioPageName" value="Daily Confessions" style="width: 100%; box-sizing: border-box; background: #070e0a; border: 1px solid rgba(52,211,153,0.3); border-radius: 8px; padding: 8px 10px; color: #fff; font-size: 13px; font-weight: 700;">
          </div>
          <div>
            <label style="font-size: 11.5px; font-weight: 700; color: #a7f3d0; margin-bottom: 4px; display: block;">TÁC GIẢ / HANDLE TRUYỆN</label>
            <input type="text" id="studioAuthorName" value="@daily_confessions" style="width: 100%; box-sizing: border-box; background: #070e0a; border: 1px solid rgba(52,211,153,0.3); border-radius: 8px; padding: 8px 10px; color: #fff; font-size: 13px;">
          </div>
          <div>
            <label style="font-size: 11.5px; font-weight: 700; color: #a7f3d0; margin-bottom: 4px; display: block;">QUỐC GIA / NGÔN NGỮ</label>
            <select id="selectStudioCountry" style="width: 100%; box-sizing: border-box; background: #070e0a; border: 1px solid rgba(52,211,153,0.3); border-radius: 8px; padding: 8px 10px; color: #fff; font-size: 13px;">
              <option value="us" selected>🇺🇸 US / English (Hoa Kỳ)</option>
              <option value="fr">🇫🇷 France / French (Pháp)</option>
              <option value="nl">🇳🇱 Netherlands / Dutch (Hà Lan)</option>
              <option value="de">🇩🇪 Germany / German (Đức)</option>
              <option value="es">🇪🇸 Spain / Spanish (Tây Ban Nha)</option>
              <option value="vi">🇻🇳 Vietnam / Tiếng Việt</option>
            </select>
          </div>
        </div>

        <!-- Row 2: Target Video Count Buttons & Duration -->
        <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(52,211,153,0.25); border-radius: 12px; padding: 12px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label style="font-size: 12px; font-weight: 800; color: #34d399;">SỐ LƯỢNG VIDEO CẦN GEN (CHỌN CHÍNH XÁC):</label>
            <div style="font-size: 11.5px; color: #94a3b8;">Hệ thống sẽ render đúng số video đã chọn</div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button class="btn-preset-count" data-num="5">5 Video</button>
            <button class="btn-preset-count" data-num="10">10 Video</button>
            <button class="btn-preset-count" data-num="15">15 Video</button>
            <button class="btn-preset-count" data-num="20">20 Video</button>
            <button class="btn-preset-count active" data-num="30">30 Video (Chuẩn 1 tháng)</button>
            <div style="display: flex; align-items: center; gap: 6px; margin-left: auto;">
              <span style="font-size: 12px; color: #cbd5e1;">Hoặc tự nhập:</span>
              <input type="number" id="inputCustomVideoCount" value="30" min="1" max="100" style="width: 60px; background: #070e0a; border: 1px solid rgba(52,211,153,0.4); border-radius: 6px; padding: 5px 8px; color: #fff; text-align: center; font-weight: 700;">
            </div>
          </div>
        </div>

        <!-- Row 3: Tabs for Script Input / Backgrounds / Avatars -->
        <div style="flex: 1; display: flex; flex-direction: column; background: rgba(0,0,0,0.25); border: 1px solid rgba(52,211,153,0.2); border-radius: 12px; overflow: hidden;">
          <div style="display: flex; background: rgba(0,0,0,0.4); border-bottom: 1px solid rgba(52,211,153,0.2);">
            <button id="tabScriptBtn" class="tab-btn active" style="padding: 10px 18px; background: #10b981; color: #fff; border: none; font-weight: 700; font-size: 12.5px; cursor: pointer;">
              📝 Kịch Bản Truyện (<span id="statStoryCountDisplay">5</span> truyện)
            </button>
            <button id="tabAvatarBtn" class="tab-btn" style="padding: 10px 18px; background: transparent; color: #a7f3d0; border: none; font-weight: 700; font-size: 12.5px; cursor: pointer;">
              🖼️ Ảnh Avatar Video (<span id="statAvatarNum">22</span> ảnh)
            </button>
            <button id="tabBgVideoBtn" class="tab-btn" style="padding: 10px 18px; background: transparent; color: #a7f3d0; border: none; font-weight: 700; font-size: 12.5px; cursor: pointer;">
              🎬 Video Nền Chuyển Động (35 clip)
            </button>
          </div>

          <!-- Tab Content 1: Script Input -->
          <div id="tabScriptContent" style="padding: 12px; flex: 1; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 11.5px; color: #cbd5e1;">Nội dung kịch bản (chia bằng <code>=== STORY X ===</code> hoặc <code>---</code>):</span>
              <div style="display: flex; gap: 8px;">
                <label style="background: rgba(52,211,153,0.2); color: #34d399; border: 1px solid rgba(52,211,153,0.4); border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer;">
                  📂 Tải file TXT / JSON lên
                  <input type="file" id="uploadScriptInput" accept=".txt,.json" style="display:none;">
                </label>
                <button id="btnReloadSampleStories" style="background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 4px 10px; font-size: 11.5px; cursor: pointer;">
                  ↺ Nạp mẫu theo quốc gia
                </button>
              </div>
            </div>
            <textarea id="studioBatchTextarea" style="flex: 1; min-height: 140px; background: #070d0a; border: 1px solid rgba(52,211,153,0.25); border-radius: 8px; color: #f0fdf4; font-family: Consolas, monospace; font-size: 12px; line-height: 1.5; padding: 10px; resize: none;"></textarea>
          </div>

          <!-- Tab Content 2: Avatar Manager -->
          <div id="tabAvatarContent" style="padding: 12px; flex: 1; display: none; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; gap: 14px; align-items: center;">
                <label style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #cbd5e1; cursor: pointer;">
                  <input type="radio" name="studioAvatarMode" value="random" checked> Random Avatar mỗi video
                </label>
                <label style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #cbd5e1; cursor: pointer;">
                  <input type="radio" name="studioAvatarMode" value="fixed"> Cố định 1 Avatar
                </label>
              </div>
              <label style="background: #10b981; color: #fff; border-radius: 6px; padding: 5px 12px; font-size: 11.5px; font-weight: 700; cursor: pointer;">
                + Tải thêm ảnh Avatar
                <input type="file" id="uploadAvatarInput" accept="image/*" multiple style="display: none;">
              </label>
            </div>
            <div id="studioAvatarList" style="display: flex; gap: 10px; overflow-x: auto; padding: 8px 0;"></div>
          </div>

          <!-- Tab Content 3: Video Nền -->
          <div id="tabBgVideoContent" style="padding: 12px; flex: 1; display: none; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; gap: 14px; align-items: center;">
                <label style="font-size: 12px; color: #cbd5e1;">Chế độ nền video:</label>
                <select id="selectStudioBgMode" style="background: #070e0a; border: 1px solid rgba(52,211,153,0.3); border-radius: 6px; color: #fff; padding: 4px 8px; font-size: 12px;">
                  <option value="random" selected>🎲 Random ngẫu nhiên giữa 35 clips</option>
                  <option value="fixed">🔒 Cố định clip đã chọn</option>
                  <option value="gradient">🎨 Dùng màu nền gốc của mẫu</option>
                </select>
              </div>
              <label style="background: #10b981; color: #fff; border-radius: 6px; padding: 5px 12px; font-size: 11.5px; font-weight: 700; cursor: pointer;">
                + Tải video nền riêng (.mp4)
                <input type="file" id="uploadCustomBg" accept="video/mp4" style="display: none;">
              </label>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span id="selectedBgBadge" style="font-size: 11.5px; color: #34d399; font-weight: 700;">Đang chọn: 35 clip MP4 tự nhiên</span>
            </div>
            <!-- Video Grid -->
            <div id="bgVideoGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; max-height: 160px; overflow-y: auto;"></div>
          </div>
        </div>

        <!-- Row 4: Render Settings & Action Buttons -->
        <div style="display: flex; flex-direction: column; gap: 10px; border-top: 1px solid rgba(52,211,153,0.25); padding-top: 14px;">
          <div style="display: flex; gap: 14px; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; color: #cbd5e1;">Thời lượng mỗi video:</span>
              <select id="selectStudioDuration" style="background: #070e0a; border: 1px solid rgba(52,211,153,0.3); border-radius: 6px; color: #34d399; font-weight: 700; padding: 6px 10px; font-size: 12.5px;">
                <option value="5">5 Giây (Test nhanh siêu tốc)</option>
                <option value="10" selected>10 Giây (Chuẩn Facebook Reels)</option>
                <option value="15">15 Giây (TikTok / Story)</option>
                <option value="20">20 Giây</option>
                <option value="30">30 Giây</option>
              </select>
            </div>
            <div style="margin-left: auto; display: flex; gap: 10px;">
              <button id="btnRenderSingle" style="background: rgba(52,211,153,0.2); color: #34d399; border: 1px solid #10b981; font-weight: 800; font-size: 13px; padding: 10px 16px; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                🎬 Render thử 1 video (MP4 + TXT)
              </button>
              <button id="btnRenderBatch30" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; border: none; font-weight: 800; font-size: 14px; padding: 10px 22px; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 18px rgba(16, 185, 129, 0.4); transition: all 0.2s;">
                🚀 BẮT ĐẦU TẠO <span id="btnBatchNumLabel">30</span> VIDEO (THEO MẪU CHỌN)
              </button>
            </div>
          </div>

          <!-- Progress Bar & Download ZIP button -->
          <div id="renderProgressBox" style="display: none; background: rgba(0,0,0,0.5); border: 1px solid rgba(52,211,153,0.3); border-radius: 10px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 700; margin-bottom: 6px;">
              <span id="renderStatusText" style="color: #34d399;">Đang chuẩn bị render...</span>
              <span id="renderPercentText" style="color: #fff;">0%</span>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
              <div id="renderProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #10b981, #34d399); transition: width 0.2s;"></div>
            </div>
            <button id="btnDownloadAllZip" style="display: none; margin-top: 10px; width: 100%; background: #3b82f6; color: #fff; border: none; padding: 10px; border-radius: 8px; font-weight: 800; font-size: 14px; cursor: pointer;">
              📦 TẢI TOÀN BỘ VIDEO & TXT (.ZIP TRỌN GÓI)
            </button>
          </div>
        </div>

      </div>

      <!-- Right Panel: Live Native Iframe Preview & Recording Canvas -->
      <div style="flex: 0.9; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #070d0a; padding: 16px; position: relative;">
        <!-- Top Story Navigator -->
        <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; background: rgba(255,255,255,0.05); padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
          <button id="btnPrevStory" style="background: rgba(255,255,255,0.1); border: none; color: #fff; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-weight: 700;">◄ Trước</button>
          <div style="text-align: center;">
            <div id="currentStoryIndexBadge" style="font-size: 13px; font-weight: 800; color: #34d399;">1 / 5</div>
            <div id="previewTplInfo" style="font-size: 11px; color: #94a3b8;">Mẫu: Đang tải...</div>
          </div>
          <button id="btnNextStory" style="background: rgba(255,255,255,0.1); border: none; color: #fff; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-weight: 700;">Sau ►</button>
        </div>

        <!-- Phone Mockup Container for Live Native Iframe Preview -->
        <div style="position: relative; width: 270px; height: 480px; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 0 8px #1a2720; background: #000;">
          <iframe id="studioPreviewIframe" style="width: 720px; height: 1280px; transform: scale(0.375); transform-origin: top left; border: none; pointer-events: none;"></iframe>
        </div>

        <div style="margin-top: 10px; font-size: 11.5px; color: #a7f3d0; text-align: center;">
          ⚡ Khung xem trước chuẩn 100% mẫu thật (720 x 1280 Reels 9:16)
        </div>

        <!-- Hidden Canvas & Video for 30fps MediaRecorder stream -->
        <canvas id="studioCanvas" width="720" height="1280" style="display: none;"></canvas>
        <video id="studioBgVideoElement" loop muted playsinline style="display: none;"></video>
      </div>

    </div>
  </div>
</div>
"""

# Read studio_engine_v8.js
with open('studio_engine_v8.js', 'r', encoding='utf-8') as f:
    engine_js = f.read()

# Build Script with Injected Data
script_with_data = f"""
<script>
window.TPL_METAS = {json.dumps(templates_info)};
window.BG_FILES = {json.dumps(bg_files)};
window.AVATAR_FILES = {json.dumps(avatar_files)};
window.STORIES_BY_COUNTRY = {json.dumps(stories_by_country)};
</script>
<script>
{engine_js}
</script>
"""

# Assemble HTML
final_html = html + "\n" + floating_bar_html + "\n" + dialog_quychuan_html + "\n" + studio_modal_html + "\n" + script_with_data

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(final_html)

print("build_studio_v8.py completed successfully! index.html written cleanly.")
