// Content script v4.0 - Injected Floating Widget "Giờ hẹn Fanpage"
// Tích hợp mặc định 2 Page Quân Đội Mỹ: Fateful Turns & Closed Doors (America/Chicago GMT-5)
console.log('[FB Scheduler v4.0] Injected Widget Loaded - Default: Fateful Turns & Closed Doors.');

(function () {
  if (!window.location.hostname.includes('facebook.com')) return;
  if (document.getElementById('fb-smart-scheduler-root')) return;

  const ROOT_ID = 'fb-smart-scheduler-root';
  let isMinimized = false;
  let currentTab = 'matrix'; // 'matrix' hoặc 'timezone'

  // Cấu hình các Page với múi giờ và khung giờ so le chuyên biệt
  const PAGE_CONFIGS = {
    'Fateful Turns': {
      name: 'Fateful Turns',
      country: '🇺🇸 Mỹ (Quân đội)',
      tz: 'America/Chicago',
      offset: -5,
      label: 'GMT-05:00 (Chicago)',
      slots: ['08:00', '11:30', '14:30', '18:00', '20:45'],
      displayLabels: {
        '08:00': { us: '08:00 AM', vn: '20:00 VN' },
        '11:30': { us: '11:30 AM', vn: '23:30 VN' },
        '14:30': { us: '02:30 PM', vn: '02:30 AM' },
        '18:00': { us: '06:00 PM', vn: '06:00 AM' },
        '20:45': { us: '08:45 PM', vn: '08:45 AM' }
      }
    },
    'Closed Doors': {
      name: 'Closed Doors',
      country: '🇺🇸 Mỹ (Quân đội)',
      tz: 'America/Chicago',
      offset: -5,
      label: 'GMT-05:00 (Chicago)',
      slots: ['08:15', '11:45', '14:45', '18:15', '21:00'],
      displayLabels: {
        '08:15': { us: '08:15 AM', vn: '20:15 VN' },
        '11:45': { us: '11:45 AM', vn: '23:45 VN' },
        '14:45': { us: '02:45 PM', vn: '02:45 AM' },
        '18:15': { us: '06:15 PM', vn: '06:15 AM' },
        '21:00': { us: '09:00 PM', vn: '09:00 AM' }
      }
    },
    'Stille Schaduwen': {
      name: 'Stille Schaduwen',
      country: '🇳🇱 Hà Lan (Drama)',
      tz: 'Europe/Amsterdam',
      offset: 2,
      label: 'GMT+02:00 (Amsterdam)',
      slots: ['08:00', '11:30', '15:00', '18:30', '21:15'],
      displayLabels: {
        '08:00': { us: '08:00', vn: '13:00 VN' },
        '11:30': { us: '11:30', vn: '16:30 VN' },
        '15:00': { us: '15:00', vn: '20:00 VN' },
        '18:30': { us: '18:30', vn: '23:30 VN' },
        '21:15': { us: '21:15', vn: '02:15 AM' }
      }
    },
    'Pacte Brisé': {
      name: 'Pacte Brisé',
      country: '🇫🇷 Pháp (Drama)',
      tz: 'Europe/Paris',
      offset: 2,
      label: 'GMT+02:00 (Paris)',
      slots: ['08:15', '11:45', '15:15', '18:45', '21:30'],
      displayLabels: {
        '08:15': { us: '08:15', vn: '13:15 VN' },
        '11:45': { us: '11:45', vn: '16:45 VN' },
        '15:15': { us: '15:15', vn: '20:15 VN' },
        '18:45': { us: '18:45', vn: '23:45 VN' },
        '21:30': { us: '21:30', vn: '02:30 AM' }
      }
    },
    'Verhalen van Ons': {
      name: 'Verhalen van Ons',
      country: '🇳🇱 Hà Lan',
      tz: 'Europe/Amsterdam',
      offset: 2,
      label: 'GMT+02:00 (Amsterdam)',
      slots: ['08:00', '11:00', '14:00', '17:00', '21:00'],
      displayLabels: {
        '08:00': { us: '08:00', vn: '13:00 VN' },
        '11:00': { us: '11:00', vn: '16:00 VN' },
        '14:00': { us: '14:00', vn: '19:00 VN' },
        '17:00': { us: '17:00', vn: '22:00 VN' },
        '21:00': { us: '21:00', vn: '02:00 AM' }
      }
    }
  };

  // Mặc định chọn Fateful Turns
  let currentSelectedKey = 'Fateful Turns';

  // Tự động nhận diện tên Page từ giao diện
  function detectCurrentPage() {
    const pageTexts = document.body ? document.body.innerText : '';
    if (pageTexts.includes('Closed Doors') || window.location.href.includes('Closed+Doors')) {
      return 'Closed Doors';
    }
    if (pageTexts.includes('Fateful Turns') || window.location.href.includes('Fateful+Turns')) {
      return 'Fateful Turns';
    }
    if (pageTexts.includes('Stille Schaduwen')) return 'Stille Schaduwen';
    if (pageTexts.includes('Pacte Brisé') || pageTexts.includes('Pacte Brise')) return 'Pacte Brisé';
    if (pageTexts.includes('Verhalen van Ons')) return 'Verhalen van Ons';
    return 'Fateful Turns'; // Mặc định luôn là Fateful Turns
  }

  currentSelectedKey = detectCurrentPage();

  function getAssetId() {
    const match = window.location.href.match(/asset_id=([0-9]+)/);
    return match ? match[1] : '100039714455965';
  }

  // Khởi tạo HTML Root
  const root = document.createElement('div');
  root.id = ROOT_ID;
  root.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 385px;
    max-height: 92vh;
    background: #18191a;
    color: #e4e6eb;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    z-index: 999999;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-size: 12px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  root.innerHTML = `
    <!-- Header -->
    <div id="sched-header" style="background: #242526; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #3a3b3c; cursor: move; user-select: none;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px; color: #fff;">
        <span style="color: #ff4081; font-size: 15px;">🕒</span> Giờ Hẹn Fanpage Pro
        <span id="sched-mode-badge" style="background: rgba(233, 30, 99, 0.2); color: #ff4081; padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: 700; border: 1px solid rgba(255,64,129,0.3);">US Military</span>
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <button id="sched-tab-btn" title="Chuyển chế độ xem" style="background: none; border: none; color: #b0b3b8; cursor: pointer; font-size: 13px;">🔄</button>
        <button id="sched-min-btn" title="Thu nhỏ/Mở rộng" style="background: none; border: none; color: #b0b3b8; cursor: pointer; font-size: 13px;">📌</button>
        <button id="sched-close-btn" title="Đóng" style="background: none; border: none; color: #b0b3b8; cursor: pointer; font-size: 14px;">✕</button>
      </div>
    </div>

    <!-- Body Container -->
    <div id="sched-body" style="padding: 12px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 10px;">
      
      <!-- Top Alert Banner -->
      <div id="sched-top-alert" style="background: #2c1b26; border: 1px solid #631f45; border-radius: 8px; padding: 10px 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div style="color: #ff80ab; font-weight: 700; font-size: 12px;" id="sched-next-slot-text">
            Bây giờ --:-- Chicago · khung trống tiếp: 08:00 AM
          </div>
          <button id="sched-btn-auto-fill" style="background: #e91e63; color: white; border: none; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">
            Điền ngay
          </button>
        </div>
        <div style="color: #b0b3b8; font-size: 10.5px;" id="sched-sub-alert-text">
          Đang kết nối: <b style="color: #fff;" id="sched-sub-page-text">Fateful Turns</b> · Bấm ô viền hồng để điền lịch
        </div>
      </div>

      <!-- Page Selector Box -->
      <div style="background: #242526; border-radius: 8px; padding: 10px 12px; border: 1px solid #3a3b3c;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <label style="font-weight: 700; color: #b0b3b8; font-size: 10.5px; text-transform: uppercase;">Chọn Page đang lên bài:</label>
          <select id="sched-page-select" style="background: #3a3b3c; color: #fff; border: 1px solid #4e4f50; padding: 4px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 600; outline: none;">
            <optgroup label="🇺🇸 MẶC ĐỊNH - Page Quân Đội Mỹ (Chicago)">
              <option value="Fateful Turns">Fateful Turns (Mỹ - 08:00 AM)</option>
              <option value="Closed Doors">Closed Doors (Mỹ - 08:15 AM)</option>
            </optgroup>
            <optgroup label="🇪🇺 Page Châu Âu (Hà Lan & Pháp)">
              <option value="Stille Schaduwen">Stille Schaduwen (Hà Lan)</option>
              <option value="Pacte Brisé">Pacte Brisé (Pháp)</option>
              <option value="Verhalen van Ons">Verhalen van Ons (Hà Lan)</option>
            </optgroup>
          </select>
        </div>
        <div style="color: #90949c; font-size: 10.5px; margin-top: 5px;" id="sched-tz-desc">
          America/Chicago (GMT-05:00) · ID <span id="sched-asset-id">100039714455965</span>
        </div>
        <div style="color: #00e676; font-size: 10px; margin-top: 2px;">
          ● Giờ Mỹ (CDT) chênh đúng 12 tiếng so với Giờ Việt Nam (Cùng số, đổi AM/PM)
        </div>
      </div>

      <!-- VIEW 1: MA TRẬN KHUNG GIỜ -->
      <div id="sched-view-matrix" style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; color: #b0b3b8; font-size: 11px;">
          <span style="font-weight: 700; color: #fff;">5 Khung Giờ Vàng Mỗi Ngày:</span>
          <div style="display: flex; gap: 8px; font-size: 10px;">
            <span style="color: #ff4081;">■ Bấm điền</span>
            <span style="color: #757575;">■ Trống</span>
          </div>
        </div>
        <div style="color: #8a8d91; font-size: 10px;">
          Mỗi ô: <b>Giờ Mỹ (Chicago)</b> / <i>Giờ VN</i>. Bấm ô bất kỳ để điền tự động vào Facebook!
        </div>

        <div id="sched-days-container" style="display: flex; flex-direction: column; gap: 6px;"></div>
      </div>

      <!-- VIEW 2: BẢNG QUY ĐỔI 3 MÚI GIỜ -->
      <div id="sched-view-timezone" style="display: none; flex-direction: column; gap: 6px;">
        <div style="font-weight: 700; color: #fff; margin-bottom: 2px;">
          Khung giờ 24h đối chiếu (Chicago ↔ VN)
        </div>
        <div style="background: #242526; border-radius: 6px; overflow: hidden; border: 1px solid #3a3b3c;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: center;">
            <thead>
              <tr style="background: #2f3031; color: #b0b3b8; border-bottom: 1px solid #3a3b3c;">
                <th style="padding: 6px;">Giờ Chicago</th>
                <th style="padding: 6px;">Giờ VN</th>
                <th style="padding: 6px;">Thao tác</th>
              </tr>
            </thead>
            <tbody id="sched-tz-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- VIEW 3: NẠP CAPTION & COMMENT 1 (DEEL 2) -->
      <div id="sched-view-content" style="background: #242526; border-radius: 8px; padding: 10px; border: 1px solid #3a3b3c; display: flex; flex-direction: column; gap: 6px;">
        <div style="font-weight: 700; color: #fff; font-size: 11.5px; display: flex; justify-content: space-between;">
          <span>⚡ Dán nhanh Caption & Bình luận 1:</span>
          <button id="sched-btn-fill-all" style="background: #1877f2; color: white; border: none; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; cursor: pointer;">
            Dán cả Caption & Cmt
          </button>
        </div>
        <textarea id="sched-input-caption" placeholder="Dán Caption video vào đây..." style="width: 100%; height: 50px; background: #18191a; border: 1px solid #3a3b3c; border-radius: 6px; color: #fff; padding: 6px; font-size: 11px; outline: none;"></textarea>
        <textarea id="sched-input-comment" placeholder="Dán link hoặc Bình luận đầu tiên vào đây..." style="width: 100%; height: 45px; background: #18191a; border: 1px solid #3a3b3c; border-radius: 6px; color: #fff; padding: 6px; font-size: 11px; outline: none;"></textarea>
      </div>

    </div>

    <!-- Toast Notification -->
    <div id="sched-toast" style="display: none; background: #2e7d32; color: #fff; padding: 8px 12px; font-size: 11px; font-weight: 700; text-align: center;">
      Đã điền lịch thành công!
    </div>
  `;

  document.body.appendChild(root);

  // Kéo thả widget
  let isDragging = false;
  let dragStartX, dragStartY, initialLeft, initialTop;
  const header = root.querySelector('#sched-header');

  header.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    const rect = root.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    root.style.left = `${initialLeft + (e.clientX - dragStartX)}px`;
    root.style.top = `${initialTop + (e.clientY - dragStartY)}px`;
    root.style.right = 'auto';
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  root.querySelector('#sched-close-btn').addEventListener('click', () => { root.style.display = 'none'; });
  root.querySelector('#sched-min-btn').addEventListener('click', () => {
    const body = root.querySelector('#sched-body');
    isMinimized = !isMinimized;
    body.style.display = isMinimized ? 'none' : 'flex';
  });

  root.querySelector('#sched-tab-btn').addEventListener('click', () => {
    const vMatrix = root.querySelector('#sched-view-matrix');
    const vTimezone = root.querySelector('#sched-view-timezone');
    if (currentTab === 'matrix') {
      currentTab = 'timezone';
      vMatrix.style.display = 'none';
      vTimezone.style.display = 'flex';
    } else {
      currentTab = 'matrix';
      vMatrix.style.display = 'flex';
      vTimezone.style.display = 'none';
    }
  });

  const pageSelect = root.querySelector('#sched-page-select');
  pageSelect.value = currentSelectedKey;
  pageSelect.addEventListener('change', (e) => {
    currentSelectedKey = e.target.value;
    updateWidgetData();
  });

  function updateWidgetData() {
    const cfg = PAGE_CONFIGS[currentSelectedKey] || PAGE_CONFIGS['Fateful Turns'];
    root.querySelector('#sched-sub-page-text').innerText = cfg.name;
    root.querySelector('#sched-asset-id').innerText = getAssetId();
    root.querySelector('#sched-tz-desc').innerText = `${cfg.tz} (${cfg.label}) · ID ${getAssetId()}`;

    // Tính giờ Page hiện tại
    const now = new Date();
    // Chênh lệch: VN (UTC+7) - offset
    const diffHours = 7 - cfg.offset; // ví dụ 7 - (-5) = 12 tiếng
    const pageNow = new Date(now.getTime() - diffHours * 3600000);

    const pageHour = String(pageNow.getHours()).padStart(2, '0');
    const pageMin = String(pageNow.getMinutes()).padStart(2, '0');

    // Tìm khung trống tiếp theo
    let nextSlot = cfg.slots[0];
    for (const slot of cfg.slots) {
      const [sh, sm] = slot.split(':').map(Number);
      if (sh > pageNow.getHours() || (sh === pageNow.getHours() && sm > pageNow.getMinutes())) {
        nextSlot = slot;
        break;
      }
    }

    const nextSlotLabel = cfg.displayLabels[nextSlot]?.us || nextSlot;
    root.querySelector('#sched-next-slot-text').innerText = 
      `Bây giờ ${pageHour}:${pageMin} (${cfg.tz.split('/')[1]}) · Trống tiếp: ${nextSlotLabel}`;

    renderCalendarMatrix(pageNow, nextSlot, diffHours, cfg);
    renderTimezoneTable(pageNow, diffHours, cfg);
  }

  function renderCalendarMatrix(pageNow, nextSlot, diffHours, cfg) {
    const container = root.querySelector('#sched-days-container');
    container.innerHTML = '';
    const daysName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let d = 0; d < 5; d++) {
      const targetDate = new Date(pageNow.getTime() + d * 86400000);
      const dayOfWeek = daysName[targetDate.getDay()];
      const dateStr = `${String(targetDate.getDate()).padStart(2, '0')}/${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      const isoDate = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

      const dayRow = document.createElement('div');
      dayRow.style.cssText = `background: #202122; border-radius: 6px; padding: 8px 10px; border: 1px solid #2f3031; display: flex; flex-direction: column; gap: 6px;`;

      const dayHeader = document.createElement('div');
      dayHeader.style.cssText = `display: flex; justify-content: space-between; font-weight: 700; color: #e4e6eb; font-size: 11px;`;
      dayHeader.innerHTML = `<span>${dayOfWeek} ${dateStr} ${d === 0 ? '<span style="color:#ff80ab; font-weight:normal;">Hôm nay</span>' : (d === 1 ? '<span style="color:#90949c; font-weight:normal;">Ngày mai</span>' : `<span style="color:#606770; font-weight:normal;">trống 5</span>`)}</span>`;
      dayRow.appendChild(dayHeader);

      const slotsContainer = document.createElement('div');
      slotsContainer.style.cssText = `display: flex; gap: 4px; flex-wrap: wrap;`;

      cfg.slots.forEach(slot => {
        const isNextRecommended = (d === 0 && slot === nextSlot);
        const [sh, sm] = slot.split(':').map(Number);
        const isPastToday = (d === 0 && (sh < pageNow.getHours() || (sh === pageNow.getHours() && sm <= pageNow.getMinutes())));

        const labels = cfg.displayLabels[slot] || { us: slot, vn: '' };

        const slotBtn = document.createElement('button');
        slotBtn.style.cssText = `
          flex: 1;
          min-width: 60px;
          background: ${isNextRecommended ? '#4a154b' : (isPastToday ? '#263238' : '#2b1b22')};
          color: ${isNextRecommended ? '#ff80ab' : (isPastToday ? '#81c784' : '#ff5252')};
          border: 1px solid ${isNextRecommended ? '#ff4081' : (isPastToday ? '#388e3c' : '#4a2228')};
          padding: 5px 2px;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1.15;
          font-family: inherit;
        `;

        if (isNextRecommended) slotBtn.style.boxShadow = '0 0 8px rgba(255, 64, 129, 0.45)';

        slotBtn.innerHTML = `
          <span style="font-weight: 700; font-size: 10.5px;">${labels.us}</span>
          <span style="font-size: 9px; opacity: 0.85;">${labels.vn}</span>
        `;

        slotBtn.title = `Bấm để điền ${isoDate} lúc ${labels.us} (${labels.vn})`;
        slotBtn.addEventListener('click', () => {
          injectTimeToMeta(isoDate, slot);
        });

        slotsContainer.appendChild(slotBtn);
      });

      dayRow.appendChild(slotsContainer);
      container.appendChild(dayRow);
    }
  }

  function renderTimezoneTable(pageNow, diffHours, cfg) {
    const tbody = root.querySelector('#sched-tz-tbody');
    tbody.innerHTML = '';

    for (let h = 0; h < 24; h++) {
      const pageHStr = `${String(h).padStart(2, '0')}:00`;
      const vnH = (h + diffHours) % 24;
      const vnHStr = `${String(vnH).padStart(2, '0')}:00`;
      const isMatch = cfg.slots.some(s => s.startsWith(String(h).padStart(2, '0')));

      const tr = document.createElement('tr');
      tr.style.cssText = `border-bottom: 1px solid #2f3031; ${isMatch ? 'background: rgba(233,30,99,0.12);' : ''}`;
      tr.innerHTML = `
        <td style="padding: 5px; color: ${isMatch ? '#ff80ab' : '#fff'}; font-weight: ${isMatch ? 'bold' : 'normal'};">${pageHStr}</td>
        <td style="padding: 5px; color: #4caf50;">${vnHStr}</td>
        <td style="padding: 5px;">
          <button style="background: #3a3b3c; border: none; color: #fff; border-radius: 3px; padding: 2px 6px; font-size: 9.5px; cursor: pointer;">Điền</button>
        </td>
      `;

      tr.querySelector('button').addEventListener('click', () => {
        const todayIso = `${pageNow.getFullYear()}-${String(pageNow.getMonth() + 1).padStart(2, '0')}-${String(pageNow.getDate()).padStart(2, '0')}`;
        injectTimeToMeta(todayIso, pageHStr);
      });

      tbody.appendChild(tr);
    }
  }

  // 1-Click Tự động điền ngày giờ vào Meta Composer
  async function injectTimeToMeta(dateStr, timeStr) {
    showToast(`⏳ Đang điền: ${dateStr} - ${timeStr}...`);

    // 1. Kích hoạt nút Lên lịch
    const scheduleRadios = Array.from(document.querySelectorAll('input[type="radio"], div[role="radio"], div[role="button"], span'))
      .filter(el => {
        const txt = (el.innerText || el.getAttribute('aria-label') || '').toLowerCase();
        return (txt.includes('lên lịch') || txt.includes('schedule') || txt.includes('zaplanuj')) && el.offsetParent !== null;
      });

    if (scheduleRadios.length > 0) {
      scheduleRadios[0].click();
      await new Promise(r => setTimeout(r, 600));
    }

    // 2. Điền Ngày & Giờ
    const inputs = Array.from(document.querySelectorAll('input'));
    for (const input of inputs) {
      if (input.type === 'date' || input.placeholder?.includes('YYYY') || input.getAttribute('aria-label')?.toLowerCase().includes('ngày')) {
        input.value = dateStr;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (input.type === 'time' || input.getAttribute('aria-label')?.toLowerCase().includes('giờ') || input.value?.match(/^[0-9]{2}:[0-9]{2}/)) {
        input.value = timeStr;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    showToast(`✅ Đã điền xong giờ hẹn: ${timeStr} (${dateStr})`);
  }

  // Nút Điền Ngay
  root.querySelector('#sched-btn-auto-fill').addEventListener('click', () => {
    const cfg = PAGE_CONFIGS[currentSelectedKey] || PAGE_CONFIGS['Fateful Turns'];
    const now = new Date();
    const diffHours = 7 - cfg.offset;
    const pageNow = new Date(now.getTime() - diffHours * 3600000);
    const isoToday = `${pageNow.getFullYear()}-${String(pageNow.getMonth() + 1).padStart(2, '0')}-${String(pageNow.getDate()).padStart(2, '0')}`;

    let nextSlot = cfg.slots[0];
    for (const slot of cfg.slots) {
      const [sh, sm] = slot.split(':').map(Number);
      if (sh > pageNow.getHours() || (sh === pageNow.getHours() && sm > pageNow.getMinutes())) {
        nextSlot = slot;
        break;
      }
    }
    injectTimeToMeta(isoToday, nextSlot);
  });

  // Nút Điền Caption & Comment
  root.querySelector('#sched-btn-fill-all').addEventListener('click', () => {
    const captionText = root.querySelector('#sched-input-caption').value.trim();
    const commentText = root.querySelector('#sched-input-comment').value.trim();

    if (!captionText && !commentText) {
      showToast('⚠️ Vui lòng dán Caption hoặc Bình luận trước!', '#d32f2f');
      return;
    }

    if (captionText) {
      const captionSelectors = [
        'div[contenteditable="true"][aria-label*="mô tả"]',
        'div[contenteditable="true"][aria-label*="description"]',
        'div[contenteditable="true"][role="textbox"]',
        'textarea[placeholder*="mô tả"]',
        'textarea[placeholder*="description"]',
        'div[contenteditable="true"]'
      ];
      for (const sel of captionSelectors) {
        const el = document.querySelector(sel);
        if (el && el.offsetParent !== null) {
          el.focus();
          document.execCommand('insertText', false, captionText);
          break;
        }
      }
    }

    if (commentText) {
      const commentInputs = Array.from(document.querySelectorAll('input[placeholder*="Bình luận"], textarea[placeholder*="Bình luận"], div[contenteditable="true"][aria-label*="bình luận"]'));
      if (commentInputs.length > 0) {
        commentInputs[0].focus();
        document.execCommand('insertText', false, commentText);
      } else {
        navigator.clipboard.writeText(commentText).catch(() => {});
        showToast('📋 Đã sao chép Comment vào bộ nhớ tạm (Ctrl+V để dán)!', '#1877f2');
        return;
      }
    }

    showToast('✅ Đã điền xong cả Caption & Bình luận!');
  });

  function showToast(msg, bg = '#2e7d32') {
    const toast = root.querySelector('#sched-toast');
    toast.style.background = bg;
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3500);
  }

  updateWidgetData();
  setInterval(updateWidgetData, 60000);
})();
