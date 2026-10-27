// Popup Logic v4.0 - Giờ Hẹn Fanpage Pro (US Military Defaults)
document.addEventListener('DOMContentLoaded', async () => {
  const marketSelect = document.getElementById('marketSelect');
  const todaySlotsGrid = document.getElementById('todaySlotsGrid');
  const txtCaption = document.getElementById('txtCaption');
  const txtComment = document.getElementById('txtComment');
  const btnInjectNow = document.getElementById('btnInjectNow');
  const btnFocusMetaTab = document.getElementById('btnFocusMetaTab');
  const statusBox = document.getElementById('statusBox');
  const lblNextSlot = document.getElementById('lblNextSlot');

  const PAGE_SLOTS = {
    'Fateful Turns': [
      { slot: '08:00', us: '08:00 AM', vn: '20:00 VN' },
      { slot: '11:30', us: '11:30 AM', vn: '23:30 VN' },
      { slot: '14:30', us: '02:30 PM', vn: '02:30 AM' },
      { slot: '18:00', us: '06:00 PM', vn: '06:00 AM' },
      { slot: '20:45', us: '08:45 PM', vn: '08:45 AM' }
    ],
    'Closed Doors': [
      { slot: '08:15', us: '08:15 AM', vn: '20:15 VN' },
      { slot: '11:45', us: '11:45 AM', vn: '23:45 VN' },
      { slot: '14:45', us: '02:45 PM', vn: '02:45 AM' },
      { slot: '18:15', us: '06:15 PM', vn: '06:15 AM' },
      { slot: '21:00', us: '09:00 PM', vn: '09:00 AM' }
    ],
    'Stille Schaduwen': [
      { slot: '08:00', us: '08:00', vn: '13:00 VN' },
      { slot: '11:30', us: '11:30', vn: '16:30 VN' },
      { slot: '15:00', us: '15:00', vn: '20:00 VN' },
      { slot: '18:30', us: '18:30', vn: '23:30 VN' },
      { slot: '21:15', us: '21:15', vn: '02:15 AM' }
    ],
    'Pacte Brisé': [
      { slot: '08:15', us: '08:15', vn: '13:15 VN' },
      { slot: '11:45', us: '11:45', vn: '16:45 VN' },
      { slot: '15:15', us: '15:15', vn: '20:15 VN' },
      { slot: '18:45', us: '18:45', vn: '23:45 VN' },
      { slot: '21:30', us: '21:30', vn: '02:30 AM' }
    ],
    'Verhalen van Ons': [
      { slot: '08:00', us: '08:00', vn: '13:00 VN' },
      { slot: '11:00', us: '11:00', vn: '16:00 VN' },
      { slot: '14:00', us: '14:00', vn: '19:00 VN' },
      { slot: '17:00', us: '17:00', vn: '22:00 VN' },
      { slot: '21:00', us: '21:00', vn: '02:00 AM' }
    ]
  };

  let selectedSlot = '08:00';

  function renderSlots(pageKey) {
    const slots = PAGE_SLOTS[pageKey] || PAGE_SLOTS['Fateful Turns'];
    todaySlotsGrid.innerHTML = '';
    selectedSlot = slots[0].slot;
    lblNextSlot.innerText = `Trống tiếp: ${slots[0].us} (${pageKey.includes('Stille') || pageKey.includes('Pacte') || pageKey.includes('Verhalen') ? 'EU' : 'Chicago'})`;

    slots.forEach((item, idx) => {
      const pill = document.createElement('div');
      pill.className = `slot-pill ${idx === 0 ? 'active' : ''}`;
      pill.setAttribute('data-slot', item.slot);
      pill.innerHTML = `<b>${item.us}</b><span>${item.vn}</span>`;

      pill.addEventListener('click', () => {
        todaySlotsGrid.querySelectorAll('.slot-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedSlot = item.slot;
      });

      todaySlotsGrid.appendChild(pill);
    });
  }

  // Load saved state
  const saved = await chrome.storage.local.get(['savedPage', 'savedCaption', 'savedComment']);
  if (saved.savedPage && PAGE_SLOTS[saved.savedPage]) {
    marketSelect.value = saved.savedPage;
  } else {
    marketSelect.value = 'Fateful Turns';
  }
  if (saved.savedCaption) txtCaption.value = saved.savedCaption;
  if (saved.savedComment) txtComment.value = saved.savedComment;

  renderSlots(marketSelect.value);

  marketSelect.addEventListener('change', (e) => {
    renderSlots(e.target.value);
  });

  btnFocusMetaTab.addEventListener('click', async () => {
    const tabs = await chrome.tabs.query({ url: '*://business.facebook.com/*' });
    if (tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, { active: true });
    } else {
      chrome.tabs.create({ url: 'https://business.facebook.com/latest/composer' });
    }
  });

  btnInjectNow.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url || (!tab.url.includes('facebook.com') && !tab.url.includes('business.facebook.com'))) {
      showStatus('Vui lòng mở tab Meta Business Suite Composer trước!', 'error');
      return;
    }

    await chrome.storage.local.set({
      savedPage: marketSelect.value,
      savedCaption: txtCaption.value,
      savedComment: txtComment.value
    });

    const now = new Date();
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    try {
      showStatus(`⏳ Đang điền slot ${selectedSlot} vào Meta Composer...`, 'success');

      await chrome.tabs.sendMessage(tab.id, {
        action: 'EXECUTE_BATCH_SCHEDULE',
        payload: {
          tasks: [
            {
              targetDate: todayIso,
              targetTime: selectedSlot,
              caption: txtCaption.value,
              comment: txtComment.value,
              fileName: 'Bài đăng tự động'
            }
          ]
        }
      });

      showStatus(`✅ Đã điền xong slot ${selectedSlot} & nội dung bài!`, 'success');
    } catch (err) {
      showStatus('Đã gửi lệnh lên trang Facebook. Hãy kiểm tra màn hình Meta Business Suite!', 'success');
    }
  });

  function showStatus(msg, type) {
    statusBox.style.display = 'block';
    statusBox.className = `status-box status-${type}`;
    statusBox.innerText = msg;
  }
});
