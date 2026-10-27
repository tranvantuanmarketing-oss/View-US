import prisma from './prisma';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramMessage(
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[Telegram] Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID. Ghi log nội bộ.');
    try {
      await prisma.systemLog.create({
        data: {
          level: 'WARN',
          module: 'TELEGRAM',
          message: `[MOCK / CHƯA CẤU HÌNH BOT] Tin nhắn dự kiến: ${text.substring(0, 150)}...`,
        },
      });
    } catch (e) {
      console.error('Không thể ghi SystemLog:', e);
    }
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json();
    
    // Ghi nhật ký hệ thống
    await prisma.systemLog.create({
      data: {
        level: data.ok ? 'INFO' : 'ERROR',
        module: 'TELEGRAM',
        message: data.ok
          ? `Gửi tin nhắn Telegram thành công (${text.slice(0, 80)}...)`
          : `Gửi tin Telegram thất bại: ${JSON.stringify(data)}`,
      },
    });

    return !!data.ok;
  } catch (error: any) {
    console.error('[Telegram] Lỗi gửi tin:', error);
    try {
      await prisma.systemLog.create({
        data: {
          level: 'ERROR',
          module: 'TELEGRAM',
          message: `Lỗi kết nối Telegram API: ${error?.message || error}`,
        },
      });
    } catch (_) {}
    return false;
  }
}

// 1. Hàm gửi thông báo xuất bản video thành công
export async function notifyPostPublished(post: {
  pageName: string;
  country: string;
  title: string;
  commentLink?: string | null;
  fbPostUrl?: string | null;
}) {
  const flag = post.country === 'FR' ? '🇫🇷' : post.country === 'NL' ? '🇳🇱' : '🇺🇸';
  const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const message = `
✅ <b>[XUẤT BẢN THÀNH CÔNG]</b> ${flag}
📌 <b>Page:</b> ${post.pageName}
🎬 <b>Video:</b> ${post.title}
⏰ <b>Thời gian:</b> ${time}
🔗 <b>Link kéo traffic:</b> ${post.commentLink ? `<a href="${post.commentLink}">${post.commentLink}</a>` : 'Không có'}
🌐 <b>Link Facebook:</b> ${post.fbPostUrl ? `<a href="${post.fbPostUrl}">${post.fbPostUrl}</a>` : 'Chưa cập nhật'}
  `.trim();

  return sendTelegramMessage(message, 'HTML');
}

// 2. Hàm gửi cảnh báo lỗi đăng bài
export async function notifyPostFailed(post: {
  pageName: string;
  title: string;
  errorMessage: string;
}) {
  const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const message = `
🚨 <b>[CẢNH BÁO ĐĂNG BÀI THẤT BẠI]</b>
📌 <b>Page:</b> ${post.pageName}
🎬 <b>Video:</b> ${post.title}
⏰ <b>Thời gian:</b> ${time}
❌ <b>Nguyên nhân:</b> <code>${post.errorMessage}</code>
🛠 <i>Vui lòng kiểm tra lại tài khoản hoặc công cụ tự đăng!</i>
  `.trim();

  return sendTelegramMessage(message, 'HTML');
}

// 3. Hàm gửi báo cáo tổng kết ngày
export async function notifyDailyReport(stats: {
  dateStr?: string;
  totalPublished: number;
  totalFailed: number;
  totalScheduled: number;
  pageBreakdown: { pageName: string; country: string; count: number }[];
}) {
  const today = stats.dateStr || new Date().toLocaleDateString('vi-VN');
  
  const pageDetails = stats.pageBreakdown
    .map((p) => {
      const flag = p.country === 'FR' ? '🇫🇷' : p.country === 'NL' ? '🇳🇱' : '🌐';
      return `  • ${flag} <b>${p.pageName}</b>: ${p.count} video`;
    })
    .join('\n');

  const message = `
📊 <b>[BÁO CÁO VẬN HÀNH NGÀY ${today}]</b>
━━━━━━━━━━━━━━━━━━━━
🎯 <b>Tổng video đã đăng:</b> ${stats.totalPublished} video
⏳ <b>Đang chờ trong hàng đợi:</b> ${stats.totalScheduled} video
⚠️ <b>Số bài phát sinh lỗi:</b> ${stats.totalFailed} video

📋 <b>Chi tiết từng Fanpage:</b>
${pageDetails || '  <i>Chưa có dữ liệu bài đăng hôm nay</i>'}

✨ <i>Hệ thống Media Ops Hub vận hành 24/7 ổn định!</i>
  `.trim();

  return sendTelegramMessage(message, 'HTML');
}
