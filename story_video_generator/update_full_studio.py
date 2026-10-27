import os, json, re

print("Starting update_full_studio.py...")

# 1. Read competitor base template
with open('kho-mau-v1.6.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# 2. Extract MAU data to build template lookup
m_mau = re.search(r'<script id="mau-data"[^>]*>(.*?)</script>', html, re.S)
mau_data = json.loads(m_mau.group(1))
print(f"Loaded {len(mau_data)} templates from MAU data.")

# Build dictionary of template configurations for the canvas renderer
template_configs = []
for idx, m in enumerate(mau_data):
    pal0 = m["pals"][0]
    # Extract CSS color variables
    colors = dict(re.findall(r"--(c[1-6]|red|cta|ink|bg|fg|accent):\s*(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\))", pal0["html"]))
    template_configs.append({
        "index": idx,
        "id": m["id"],
        "label": m["label"],
        "ho": m.get("ho", "khac"),
        "colors": colors,
        "palsCount": len(m["pals"])
    })

# 3. Collect background clips and avatars
bg_files = sorted([f for f in os.listdir('assets/backgrounds') if f.endswith('.mp4')])
avatar_files = sorted([f for f in os.listdir('assets/avatars') if f.lower().endswith(('.jpg', '.png', '.jpeg'))])

# 4. Load 30 stories
sample_stories_text = ""
if os.path.exists('batch_30_stories.txt'):
    with open('batch_30_stories.txt', 'r', encoding='utf-8') as f:
        sample_stories_text = f.read()

# Custom Lavender Tulip CSS
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
  background: rgba(22, 14, 38, 0.92) !important;
  backdrop-filter: blur(14px) !important;
  border-bottom: 1px solid rgba(168, 85, 247, 0.3) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

aside#side {
  background: rgba(25, 16, 44, 0.8) !important;
  backdrop-filter: blur(12px) !important;
  border-right: 1px solid rgba(168, 85, 247, 0.25) !important;
}

.m-card {
  background: rgba(31, 20, 53, 0.85) !important;
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
  box-shadow: 0 0 0 2px #ec4899, 0 8px 30px rgba(236, 72, 153, 0.45) !important;
  background: rgba(45, 20, 65, 0.9) !important;
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

/* FLOATING GEN BAR AT BOTTOM */
#floatingGenBar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  background: rgba(26, 14, 46, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(236, 72, 153, 0.5);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(236, 72, 153, 0.35);
  border-radius: 999px;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  animation: floatUp 0.3s ease;
}

@keyframes floatUp {
  from { transform: translate(-50%, 20px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}

/* DIALOGS */
dialog {
  background: rgba(22, 14, 38, 0.96) !important;
  border: 1px solid rgba(168, 85, 247, 0.4) !important;
  border-radius: 18px !important;
  color: var(--ink) !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px var(--tulip-glow) !important;
  backdrop-filter: blur(20px) !important;
}

dialog::backdrop {
  background: rgba(10, 5, 20, 0.75) !important;
  backdrop-filter: blur(8px) !important;
}

/* STUDIO MODAL STYLING */
#studioModal {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(10, 5, 20, 0.85);
  backdrop-filter: blur(16px);
  justify-content: center;
  align-items: center;
  padding: 16px;
}
.studio-box {
  width: 1440px;
  max-width: 96vw;
  height: 92vh;
  background: #190f30;
  border: 1px solid rgba(168, 85, 247, 0.35);
  box-shadow: 0 25px 80px rgba(0,0,0,0.8), 0 0 40px var(--tulip-glow);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.studio-header {
  padding: 16px 24px;
  background: rgba(26, 15, 52, 0.95);
  border-bottom: 1px solid rgba(168, 85, 247, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.studio-body {
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}
@media (max-width: 1080px) {
  .studio-body { grid-template-columns: 1fr; }
}
"""

html = html.replace("<style>", f"<style>\n{tulip_css}\n")

# Replace header button to show Gen Video button
old_btn = '<button class="act" id="btnTao">Tạo file page</button>'
new_btns = """<button class="act" id="btnMoStudio" style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%) !important; color: white !important; font-weight: 800; border-radius: 999px; padding: 7px 22px; margin: 0 8px; box-shadow: 0 4px 18px rgba(168,85,247,0.5); cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">🎬 GEN VIDEO TỪ MẪU ĐÃ CHỌN (<span id="headerPickCount">0</span>)</button>
  <button class="act" id="btnTao">Tạo file page</button>"""
html = html.replace(old_btn, new_btns)

# Replace dialog dlgNen with upgraded background library dialog
old_dlg_nen_pattern = re.compile(r'<dialog id="dlgNen">.*?</dialog>', re.S)

upgraded_dlg_nen = f"""<dialog id="dlgNen" style="max-width: 1000px; width: 94vw; max-height: 90vh; padding: 24px; border-radius: 20px; background: rgba(22, 14, 38, 0.97); backdrop-filter: blur(25px); border: 1px solid rgba(168, 85, 247, 0.4); color: #f3e8ff;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(168, 85, 247, 0.25); padding-bottom: 12px;">
    <div>
      <h3 style="margin: 0; font-size: 20px; color: #fff; display: flex; align-items: center; gap: 8px;">
        🎬 Kho Clip Nền Video Reels & Story
        <span style="font-size: 12px; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; padding: 2px 10px; border-radius: 99px; font-weight: 700;">{len(bg_files)} Clip Thực Tế</span>
      </h3>
      <p class="hint" style="margin: 4px 0 0; color: #c084fc;">Đã tích hợp 35 video nền chuẩn HD Reels từ máy tính của bạn.</p>
    </div>
    <button class="act" id="nenClose" style="border-radius: 10px; padding: 6px 16px; cursor: pointer;">✕ Đóng</button>
  </div>

  <div style="display: flex; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; align-items: center; flex-wrap: wrap;">
    <button type="button" id="tabRealClipsBtn" class="tab-btn active" style="background: #a855f7; color: white; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer;">🎞️ Kho Video Nền Thực Tế ({len(bg_files)} Clip)</button>
    <button type="button" id="tabCategoriesBtn" class="tab-btn" style="background: rgba(168,85,247,0.15); color: #c4b5fd; border: 1px solid rgba(168,85,247,0.3); padding: 8px 16px; border-radius: 10px; font-weight: 600; cursor: pointer;">📋 Chuyên Mục CMS (Hệ thống mẫu)</button>
    
    <div style="margin-left: auto; display: flex; gap: 8px; align-items: center;">
      <button type="button" id="btnNenRandomSelect" style="background: rgba(236,72,153,0.25); color: #f472b6; border: 1px solid rgba(236,72,153,0.4); padding: 7px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px;">🎲 Xoay vòng ngẫu nhiên khi render</button>
      <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; background: rgba(168,85,247,0.2); border: 1px dashed #a855f7; padding: 7px 14px; border-radius: 8px; font-size: 13px; color: #e9d5ff;">
        ➕ Thêm Clip .mp4
        <input type="file" id="uploadCustomBg" accept="video/mp4,video/*" multiple style="display:none">
      </label>
    </div>
  </div>

  <div id="tabRealClips" style="max-height: 58vh; overflow-y: auto; padding-right: 6px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(255,255,255,0.03); padding: 8px 14px; border-radius: 8px;">
      <span style="font-size: 13px; color: #e9d5ff;">Rê chuột để phát nhanh • Bấm để chọn làm nền cho video:</span>
      <span id="selectedBgBadge" style="font-size: 12px; font-weight: 700; color: #34d399; background: rgba(52,211,153,0.15); padding: 3px 10px; border-radius: 99px;">Đang chọn: 🎲 Xoay vòng ngẫu nhiên</span>
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
    <div style="font-size: 13px; color: #c4b5fd;">Chọn video nền xong, bấm <b>Mở Studio Render</b> để ghép nền vào video.</div>
    <div style="display: flex; gap: 10px;">
      <button type="button" id="btnNenGoStudio" class="act" style="background: linear-gradient(135deg, #a855f7, #ec4899); border-radius: 10px; padding: 8px 18px; font-weight: 700; cursor: pointer;">🚀 Mở Studio Render Ngay</button>
      <button type="button" class="ghost" onclick="document.getElementById('dlgNen').close()" style="border-radius: 10px; padding: 8px 16px; cursor: pointer;">Xong</button>
    </div>
  </div>
</dialog>"""

html = old_dlg_nen_pattern.sub(upgraded_dlg_nen, html, count=1)

# Floating Gen Bar at bottom
floating_bar_html = """
<div id="floatingGenBar" style="display: none;">
  <span style="font-size: 20px;">🎨</span>
  <div>
    <b style="color: #fff; font-size: 14px;">Đã chọn <span id="floatPickNum" style="color: #f472b6;">0</span> mẫu thiết kế</b>
    <div style="font-size: 12px; color: #c4b5fd;" id="floatPickNames">Chưa chọn mẫu nào</div>
  </div>
  <button type="button" id="btnFloatingGen" class="act" style="background: linear-gradient(135deg, #a855f7, #ec4899) !important; padding: 8px 20px; border-radius: 999px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 15px rgba(236,72,153,0.5);">
    🚀 GEN 30 VIDEO TỪ CÁC MẪU NÀY
  </button>
</div>
"""

# Build grouped options for 76 templates
options_grouped_html = """
<option value="selected_picked" selected>🎯 DÙNG CÁC MẪU ĐÃ TICK TRÊN MÀN HÌNH (Xoay vòng 30 truyện)</option>
<option value="random_all">🎲 Ngẫu nhiên từ toàn bộ 76 mẫu</option>
"""

# Group by ho
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

# Studio Modal HTML
studio_modal_html = f"""
{floating_bar_html}

<!-- STUDIO MODAL: RENDER 30 VIDEO & GÓI ZIP -->
<div id="studioModal">
  <div class="studio-box">
    <!-- HEADER -->
    <div class="studio-header">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 26px;">🎬</span>
        <div>
          <h2 style="margin: 0; font-size: 18px; color: #fff; font-weight: 800;">Story Video Studio <span style="font-size: 12px; background: #ec4899; color: white; padding: 2px 8px; border-radius: 99px; margin-left: 6px;">Batch 30 Pro</span></h2>
          <p style="margin: 2px 0 0; font-size: 12px; color: #c4b5fd;">Kết hợp 76 Mẫu Chọn Đối Thủ + 35 Clip Nền Video + 22 Avatar + 30 Kịch bản</p>
        </div>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <span id="studioActiveTemplateBadge" style="font-size: 12px; color: #34d399; background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.3); padding: 5px 12px; border-radius: 8px; font-weight: 700;">Đang dùng: Các mẫu đã tick</span>
        <button id="studioCloseBtn" class="act" style="border-radius: 10px; padding: 6px 14px; cursor: pointer; background: rgba(255,255,255,0.1) !important; color: white !important;">✕ Đóng</button>
      </div>
    </div>

    <!-- BODY -->
    <div class="studio-body">
      <!-- LEFT: CONTROLS & STORIES -->
      <div style="display: flex; flex-direction: column; gap: 16px; overflow-y: auto; padding-right: 6px;">
        <!-- PANEL 1: CẤU HÌNH MẪU & NỀN -->
        <div style="background: rgba(31, 20, 53, 0.7); border: 1px solid rgba(168,85,247,0.25); border-radius: 14px; padding: 16px;">
          <h4 style="margin: 0 0 12px; color: #f472b6; font-size: 14px; display: flex; align-items: center; gap: 6px;">🎨 1. Chọn Mẫu Thẻ (Từ 76 Mẫu Đối Thủ) & Video Nền</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="grid-column: span 2;">
              <label style="display: block; font-size: 12px; color: #c4b5fd; margin-bottom: 4px; font-weight: 700;">Giao Diện Thẻ Chữ (76 Mẫu):</label>
              <select id="selectStudioTheme" style="width: 100%; background: #130c22; color: #fff; border: 1px solid #a855f7; padding: 10px; border-radius: 8px; font-size: 13px;">
                {options_grouped_html}
              </select>
              <div id="studioPickedSummary" style="margin-top: 6px; font-size: 12px; color: #f472b6;">
                Tip: Bạn có thể đóng cửa sổ này, tick chọn bất kỳ mẫu nào trên màn hình, rồi bấm Gen Video để áp dụng!
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 12px; color: #c4b5fd; margin-bottom: 4px;">Video Nền Phía Dưới:</label>
              <select id="selectStudioBgMode" style="width: 100%; background: #130c22; color: #fff; border: 1px solid #6b21a8; padding: 8px; border-radius: 8px;">
                <option value="random" selected>🎲 Xoay vòng 35 clip từ Kho Nền (Khuyên dùng)</option>
                <option value="single">🎯 Cố định 1 clip cụ thể từ Kho Nền</option>
                <option value="gradient">🌸 Nền Tulip Pastel Gradient (Không clip)</option>
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
                <option value="10" selected>⏱️ 10 giây (Chuẩn Giữ Chân Reels)</option>
                <option value="15">⏱️ 15 giây</option>
                <option value="20">⏱️ 20 giây</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 12px; color: #c4b5fd; margin-bottom: 4px;">Nhạc Nền Không Bản Quyền:</label>
              <select id="selectStudioAudio" style="width: 100%; background: #130c22; color: #fff; border: 1px solid #6b21a8; padding: 8px; border-radius: 8px;">
                <option value="assets/audio/music_1.mp4" selected>🎵 Nhạc 1 - Dịu êm, kịch tính nhẹ</option>
                <option value="assets/audio/music_2.mp4">🎵 Nhạc 2 - Sâu lắng, cảm xúc</option>
                <option value="assets/audio/music_3.mp4">🎵 Nhạc 3 - Bí ẩn, lôi cuốn</option>
              </select>
            </div>
          </div>
        </div>

        <!-- PANEL 2: KHO AVATAR -->
        <div style="background: rgba(31, 20, 53, 0.7); border: 1px solid rgba(168,85,247,0.25); border-radius: 14px; padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="margin: 0; color: #f472b6; font-size: 14px;">👤 2. Kho Avatar ({len(avatar_files)} ảnh)</h4>
            <div style="font-size: 12px; display: flex; gap: 10px; color: #e9d5ff;">
              <label style="cursor: pointer;"><input type="radio" name="studioAvatarMode" value="random" checked> 🎲 Xoay vòng Avatar</label>
              <label style="cursor: pointer;"><input type="radio" name="studioAvatarMode" value="fixed"> 🎯 Cố định 1 Avatar</label>
            </div>
          </div>
          <div id="studioAvatarList" style="display: flex; gap: 10px; overflow-x: auto; padding: 6px 0;">
          </div>
        </div>

        <!-- PANEL 3: 30 KỊCH BẢN TRUYỆN -->
        <div style="background: rgba(31, 20, 53, 0.7); border: 1px solid rgba(168,85,247,0.25); border-radius: 14px; padding: 16px; flex: 1; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="margin: 0; color: #f472b6; font-size: 14px;">📝 3. Nội Dung 30 Kịch Bản (Tự Động Xuất .mp4 + .txt)</h4>
            <div style="display: flex; gap: 8px;">
              <button id="btnReloadSampleStories" type="button" class="ghost" style="padding: 4px 10px; font-size: 12px; border-radius: 6px; cursor: pointer;">🔄 Nạp lại 30 bài mẫu US</button>
            </div>
          </div>
          <textarea id="studioBatchTextarea" style="width: 100%; height: 200px; background: #0f071d; color: #e9d5ff; border: 1px solid #4c1d95; border-radius: 8px; padding: 10px; font-family: monospace; font-size: 12px; resize: vertical;" placeholder="Dán 30 câu chuyện vào đây..."></textarea>
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
            🚀 BẮT ĐẦU RENDER BATCH 30 VIDEO
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

# Enhanced JavaScript Engine
studio_script = f"""
<!-- STUDIO JAVASCRIPT ENGINE -->
<script>
(function() {{
  const TEMPLATES = {json.dumps(template_configs)};
  const BG_CLIPS = {json.dumps(bg_files)};
  const AVATARS = {json.dumps(avatar_files)};
  const SAMPLE_STORIES_TEXT = {json.dumps(sample_stories_text)};
  
  let currentBgMode = "random";
  let activeSelectedBg = BG_CLIPS[0] || "";
  let currentStoryIdx = 0;
  let parsedStories = [];
  let avatarCache = {{}};
  let selectedAvatar = AVATARS[0];
  let renderedFiles = [];

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

  const selectStudioTheme = document.getElementById("selectStudioTheme");
  const studioPickedSummary = document.getElementById("studioPickedSummary");
  const studioActiveTemplateBadge = document.getElementById("studioActiveTemplateBadge");
  const selectStudioBgMode = document.getElementById("selectStudioBgMode");
  const singleBgSelectWrapper = document.getElementById("singleBgSelectWrapper");
  const selectStudioSingleBg = document.getElementById("selectStudioSingleBg");
  const selectStudioDuration = document.getElementById("selectStudioDuration");
  const selectStudioAudio = document.getElementById("selectStudioAudio");
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
      studioPickedSummary.innerHTML = `✅ <b>Đang áp dụng:</b> ${{count}} mẫu đã tick trên màn hình (${{names}}...). Các video sẽ tự động xoay vòng qua các mẫu này!`;
      studioActiveTemplateBadge.textContent = `🎯 Đang dùng: ${{count}} mẫu đã tick`;
      studioActiveTemplateBadge.style.color = "#34d399";
    }} else {{
      floatingGenBar.style.display = "none";
      studioPickedSummary.innerHTML = `💡 Chưa tick mẫu nào trên màn hình. Bạn có thể tick chọn trên lưới mẫu hoặc chọn 1 mẫu cố định bên dưới.`;
      studioActiveTemplateBadge.textContent = `Mẫu: ${{selectStudioTheme.options[selectStudioTheme.selectedIndex]?.text || "Mặc định"}}`;
      studioActiveTemplateBadge.style.color = "#c4b5fd";
    }}
    renderCanvasPreview();
  }}

  // Hook into competitor grid checkbox changes
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

  // 3. POPULATE BACKGROUND CLIPS GALLERY
  function renderBgGrid() {{
    bgVideoGrid.innerHTML = "";
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

  // Tab switching in dlgNen
  tabRealClipsBtn.onclick = () => {{
    tabRealClipsBtn.style.background = "#a855f7"; tabRealClipsBtn.style.color = "#fff";
    tabCategoriesBtn.style.background = "rgba(168,85,247,0.15)"; tabCategoriesBtn.style.color = "#c4b5fd";
    tabRealClips.style.display = "block"; tabCategories.style.display = "none";
  }};
  tabCategoriesBtn.onclick = () => {{
    tabCategoriesBtn.style.background = "#a855f7"; tabCategoriesBtn.style.color = "#fff";
    tabRealClipsBtn.style.background = "rgba(168,85,247,0.15)"; tabRealClipsBtn.style.color = "#c4b5fd";
    tabCategories.style.display = "block"; tabRealClips.style.display = "none";
  }};

  document.getElementById("btnNenRandomSelect").onclick = () => {{
    currentBgMode = "random";
    selectedBgBadge.textContent = "Đang chọn: 🎲 Xoay vòng ngẫu nhiên";
    selectedBgBadge.style.color = "#34d399";
    selectStudioBgMode.value = "random";
    singleBgSelectWrapper.style.display = "none";
    renderBgGrid();
    updateBgVideoSource();
    renderCanvasPreview();
  }};

  // 4. AVATARS
  function renderAvatars() {{
    studioAvatarList.innerHTML = "";
    AVATARS.forEach((av) => {{
      const img = document.createElement("img");
      img.src = "assets/avatars/" + av;
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

  // 5. STORIES
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
    studioBatchTextarea.value = SAMPLE_STORIES_TEXT;
    parsedStories = parseStories(SAMPLE_STORIES_TEXT);
    currentStoryIdx = 0;
    updateStoryNav();
    renderCanvasPreview();
  }}

  function updateStoryNav() {{
    currentStoryIndexBadge.textContent = `${{currentStoryIdx + 1}} / ${{parsedStories.length || 1}}`;
    btnPrevStory.disabled = currentStoryIdx <= 0;
    btnNextStory.disabled = currentStoryIdx >= parsedStories.length - 1;
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

  selectStudioTheme.onchange = () => {{ updatePickedUI(); renderCanvasPreview(); }};
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

  function updateBgVideoSource() {{
    if (currentBgMode === "gradient") {{
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

  async function loadAvatar(fileName) {{
    if (avatarCache[fileName]) return avatarCache[fileName];
    return new Promise(resolve => {{
      const img = new Image();
      img.onload = () => {{ avatarCache[fileName] = img; resolve(img); }};
      img.onerror = () => resolve(null);
      img.src = "assets/avatars/" + fileName;
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

  // 6. RESOLVE TEMPLATE CONFIG FOR STORY
  function getTemplateForStory(storyIndex) {{
    const val = selectStudioTheme.value;
    if (val === "selected_picked") {{
      const picked = getPickedTemplates();
      if (picked.length > 0) {{
        return picked[storyIndex % picked.length];
      }}
      return TEMPLATES[0]; // fallback
    }} else if (val === "random_all") {{
      return TEMPLATES[storyIndex % TEMPLATES.length];
    }} else {{
      const found = TEMPLATES.find(t => t.id === val);
      return found || TEMPLATES[0];
    }}
  }}

  // 7. CANVAS RENDER WITH FULL 76 TEMPLATE STYLES
  async function renderCanvasPreview() {{
    if (!parsedStories || parsedStories.length === 0) return;
    const story = parsedStories[currentStoryIdx] || parsedStories[0];
    const tpl = getTemplateForStory(currentStoryIdx);
    const colors = tpl.colors || {{}};
    const ho = tpl.ho || "the-vet";

    const W = 1080;
    const H = 1920;

    // 1. DRAW BACKGROUND (Video or Ambient Gradient)
    if (currentBgMode !== "gradient" && studioBgVideo.readyState >= 2) {{
      studioCtx.drawImage(studioBgVideo, 0, 0, W, H);
      // Dark blur overlay for high text legibility
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

    // 2. MAIN CARD DIMENSIONS
    const cardX = 70;
    const cardY = 170;
    const cardW = 940;
    const cardH = 1580;
    const cardR = ho === "giay-rach" ? 18 : 36;

    studioCtx.save();
    
    // RENDER CARD BASED ON TEMPLATE FAMILY
    if (ho === "anh-kinh") {{
      // Frosted Glassmorphism
      studioCtx.shadowColor = "rgba(0,0,0,0.6)";
      studioCtx.shadowBlur = 50;
      studioCtx.shadowOffsetY = 20;
      drawRoundedRect(studioCtx, cardX, cardY, cardW, cardH, cardR);
      studioCtx.fillStyle = "rgba(22, 14, 38, 0.72)";
      studioCtx.fill();
      studioCtx.lineWidth = 2.5;
      studioCtx.strokeStyle = colors.cta || "rgba(244, 114, 182, 0.5)";
      studioCtx.stroke();
    }} else if (ho === "giay-rach") {{
      // Vintage Parchment
      studioCtx.shadowColor = "rgba(0,0,0,0.4)";
      studioCtx.shadowBlur = 40;
      drawRoundedRect(studioCtx, cardX, cardY, cardW, cardH, cardR);
      studioCtx.fillStyle = colors.c5 || "#f5ede0";
      studioCtx.fill();
      studioCtx.lineWidth = 4;
      studioCtx.strokeStyle = colors.c2 || "#432a17";
      studioCtx.stroke();
    }} else if (ho === "the-trang") {{
      // Modern Clean Card
      studioCtx.shadowColor = "rgba(0,0,0,0.25)";
      studioCtx.shadowBlur = 40;
      drawRoundedRect(studioCtx, cardX, cardY, cardW, cardH, cardR);
      studioCtx.fillStyle = colors.c2 || "#ffffff";
      studioCtx.fill();
    }} else if (ho === "dark-max" || ho === "dark-photo") {{
      // Deep Dark Mode Card
      studioCtx.shadowColor = "rgba(0,0,0,0.8)";
      studioCtx.shadowBlur = 50;
      drawRoundedRect(studioCtx, cardX, cardY, cardW, cardH, cardR);
      studioCtx.fillStyle = "rgba(15, 15, 20, 0.88)";
      studioCtx.fill();
      studioCtx.lineWidth = 2;
      studioCtx.strokeStyle = colors.cta || "#ec4899";
      studioCtx.stroke();
    }} else {{
      // the-vet & others: Pastel Card
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
    const avFile = isRandomAv ? story.avatar : selectedAvatar;
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

    // 4. AUTHOR NAME & SIGNATURE BRUSH STROKE (THE-VET)
    const textStartX = avX + avSize + 28;
    const authorY = avY + 60;
    
    // Draw Signature Brush Underline if template is the-vet
    if (ho === "the-vet" && colors.c4) {{
      studioCtx.save();
      studioCtx.fillStyle = colors.c4;
      studioCtx.beginPath();
      // Organic rounded brush underline
      const strokeW = Math.min(cardW - (textStartX - cardX) - 60, 420);
      drawRoundedRect(studioCtx, textStartX, authorY + 8, strokeW, 14, 7);
      studioCtx.fill();
      studioCtx.restore();
    }}

    // Author Text
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

    // Handle / Subtitle
    studioCtx.fillStyle = ho === "anh-kinh" || ho.includes("dark") ? "#c4b5fd" : "#6b7280";
    studioCtx.font = `32px ${{fontFam}}`;
    studioCtx.fillText(story.handle, textStartX, authorY + 50);

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

    // 7. FOOTER BUTTON (CTA)
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
    studioCtx.fillText("🔗 Bấm Link Để Đọc Tiếp Truyện", btnBX + btnW / 2, btnBY + 56);
    studioCtx.restore();
  }}

  // CONTINUAL ANIMATION LOOP
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

  // 8. AUDIO & MEDIA RECORDER
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
    const audioTrackSrc = selectStudioAudio.value;
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

  // 9. NATIVE ZIP CREATOR
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
    ev.setUint16(20, 0, true);

    const allParts = [...parts, ...centralDirs, eocd];
    return new Blob(allParts, {{ type: "application/zip" }});
  }}

  // 10. RENDER SINGLE
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

    const txtBlob = new Blob([`${{story.title}}\\n\\n${{story.content}}\\n\\n👉 Link đọc trọn bộ: ${{story.pinLink}}`], {{ type: "text/plain;charset=utf-8" }});
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

  // 11. BATCH RENDER 30 STORIES & PACK ZIP
  btnRenderBatch30.onclick = async () => {{
    if (!parsedStories || parsedStories.length === 0) return alert("Không có kịch bản để render!");
    const count = parsedStories.length;
    const dur = parseInt(selectStudioDuration.value, 10);
    btnRenderBatch30.disabled = true;
    renderProgressBox.style.display = "block";
    btnDownloadAllZip.style.display = "none";
    renderedFiles = [];

    for (let i = 0; i < count; i++) {{
      const story = parsedStories[i];
      const activeTpl = getTemplateForStory(i);
      renderStatusText.textContent = `Đang render video ${{i + 1}}/${{count}}: [${{activeTpl.label}}] - ${{story.author}}...`;
      const pct = Math.round((i / count) * 100);
      renderProgressBar.style.width = pct + "%";
      renderPercentText.textContent = pct + "%";

      const mp4Blob = await recordStoryVideo(story, dur, i);
      const safeName = `story_${{i + 1}}_${{story.author.replace(/\\s+/g, '_')}}`;

      renderedFiles.push({{
        name: safeName + ".mp4",
        blob: mp4Blob
      }});

      const txtContent = `${{story.title}}\\n\\n${{story.content}}\\n\\n👉 Link đọc trọn bộ: ${{story.pinLink}}`;
      renderedFiles.push({{
        name: safeName + ".txt",
        blob: new Blob([txtContent], {{ type: "text/plain;charset=utf-8" }})
      }});
    }}

    renderProgressBar.style.width = "100%";
    renderPercentText.textContent = "100%";
    renderStatusText.textContent = `✓ Đã render xong toàn bộ ${{count}} video theo đúng các mẫu bạn chọn! Bấm nút bên dưới để tải trọn gói ZIP.`;
    btnRenderBatch30.disabled = false;
    btnDownloadAllZip.style.display = "block";
    btnDownloadAllZip.textContent = `📦 TẢI TOÀN BỘ ${{count}} VIDEO & TXT (.ZIP TRỌN GÓI)`;
  }};

  btnDownloadAllZip.onclick = async () => {{
    if (renderedFiles.length === 0) return;
    btnDownloadAllZip.textContent = "⏳ Đang nén file ZIP...";
    btnDownloadAllZip.disabled = true;
    const zipBlob = await createZipBlob(renderedFiles);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(zipBlob);
    a.download = `Batch_${{parsedStories.length}}_Reels_Stories.zip`;
    a.click();
    btnDownloadAllZip.textContent = "✓ Đã tải file ZIP thành công!";
    btnDownloadAllZip.disabled = false;
  }};

  // INIT
  renderBgGrid();
  renderAvatars();
  reloadStories();
  setTimeout(updatePickedUI, 300);
}})();
</script>
"""

# Append to html
html = html + "\n" + studio_modal_html + "\n" + studio_script

# Save to index.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Update completed! Final index.html size: {len(html)} bytes")
