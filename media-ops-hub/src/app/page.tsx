'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import PostFormModal from '@/components/PostFormModal';
import { 
  Film, 
  Send, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Link2, 
  Play, 
  RefreshCw, 
  Layers,
  ExternalLink,
  PlusCircle,
  BellRing
} from 'lucide-react';

interface Fanpage {
  id: string;
  name: string;
  code: string;
  country: string;
  timezone: string;
  status: string;
  viaName: string;
  _count?: { posts: number };
}

interface Post {
  id: string;
  title: string;
  videoPath: string;
  status: string;
  scheduledAt: string;
  publishedAt?: string;
  fbPostUrl?: string;
  commentLink?: string;
  fanpage: Fanpage;
}

interface SystemLog {
  id: string;
  level: string;
  module: string;
  message: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [fanpages, setFanpages] = useState<Fanpage[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPages, resPosts] = await Promise.all([
        fetch('/api/fanpages').then((r) => r.json()),
        fetch('/api/posts').then((r) => r.json()),
      ]);

      if (resPages.fanpages) setFanpages(resPages.fanpages);
      if (resPosts.posts) setRecentPosts(resPosts.posts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerTelegramTest = async (type: string) => {
    setTelegramStatus('Đang gửi test...');
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      setTelegramStatus(data.message || 'Đã gửi test!');
      setTimeout(() => setTelegramStatus(null), 4000);
      fetchData();
    } catch (e: any) {
      setTelegramStatus(`Lỗi: ${e.message}`);
    }
  };

  // Tính toán số liệu thống kê
  const totalPublished = recentPosts.filter((p) => p.status === 'PUBLISHED').length;
  const totalScheduled = recentPosts.filter((p) => p.status === 'SCHEDULED').length;
  const totalReady = recentPosts.filter((p) => p.status === 'READY').length;
  const totalFailed = recentPosts.filter((p) => p.status === 'FAILED').length;

  return (
    <div className="p-8 space-y-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              TRUNG TÂM CHỈ HUY MEDIA VẬN HÀNH
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Auto-Post Bridge Ready
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Dashboard Vận Hành 4 Fanpage Facebook
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Theo dõi tiến độ đăng Reels tự động, kiểm soát link kéo traffic <code>thestorypress.online</code> và cảnh báo Telegram 24/7.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            className="p-2.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm Bài Hẹn Giờ</span>
          </button>
        </div>
      </div>

      {/* Thông báo trạng thái nhanh */}
      {telegramStatus && (
        <div className="p-3 bg-blue-900/30 border border-blue-500/40 rounded-xl text-blue-200 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-blue-400" />
            <span>{telegramStatus}</span>
          </div>
          <button onClick={() => setTelegramStatus(null)} className="text-xs text-blue-400 hover:underline">
            Đóng
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="ĐÃ XUẤT BẢN THÀNH CÔNG"
          value={totalPublished}
          subtext="Đã phát hành trên Reels FB"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          title="HÀNG ĐỢI HẸN GIỜ (SCHEDULED)"
          value={totalScheduled}
          subtext="Sẵn sàng cho Tool Auto-post lấy"
          icon={<Clock className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="BẢN NHÁP & SẴN SÀNG (READY)"
          value={totalReady}
          subtext="Chờ duyệt hoặc chưa đến lịch"
          icon={<Film className="w-5 h-5" />}
          variant="purple"
        />
        <StatCard
          title="CẢNH BÁO LỖI (FAILED)"
          value={totalFailed}
          subtext={totalFailed > 0 ? "Cần kiểm tra ngay" : "Hệ thống an toàn 100%"}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={totalFailed > 0 ? "rose" : "amber"}
        />
      </div>

      {/* Trạng thái 4 Fanpage */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">4 Fanpage Facebook Mục Tiêu</h2>
          </div>
          <span className="text-xs text-slate-400">2 Thị Trường: Pháp 🇫🇷 (Paris) & Hà Lan 🇳🇱 (Amsterdam)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fanpages.map((page) => {
            const isFR = page.country === 'FR';
            return (
              <div
                key={page.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition relative overflow-hidden group"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${isFR ? 'bg-blue-500' : 'bg-amber-500'}`} />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{isFR ? '🇫🇷' : '🇳🇱'}</span>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition text-sm">
                        {page.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">{page.code}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {page.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Múi giờ:</span>
                    <span className="text-slate-300 font-medium">{page.timezone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Via quản trị:</span>
                    <span className="text-slate-300">{page.viaName || 'Chưa gán'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tổng video:</span>
                    <span className="text-white font-bold">{page._count?.posts || 0} bài</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Bài trong hàng đợi & Test Telegram Bot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Hàng đợi bài đăng trực tiếp (2 phần) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Bài Đăng Gần Đây & Hàng Đợi (Reels Queue)</h2>
            </div>
            <a href="/posts" className="text-xs text-blue-400 hover:underline">
              Xem tất cả ({recentPosts.length})
            </a>
          </div>

          <div className="space-y-3">
            {recentPosts.slice(0, 5).map((post) => {
              const statusColors: Record<string, string> = {
                PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                SCHEDULED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                READY: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                FAILED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
              };

              return (
                <div
                  key={post.id}
                  className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{post.fanpage?.country === 'FR' ? '🇫🇷' : '🇳🇱'}</span>
                      <h4 className="text-sm font-semibold text-white truncate">{post.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>Page: {post.fanpage?.name}</span>
                      <span>•</span>
                      <span>
                        Hẹn: {new Date(post.scheduledAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                      </span>
                      {post.commentLink && (
                        <>
                          <span>•</span>
                          <span className="text-blue-400 truncate max-w-[200px]">Link Blog gắn Cmt 1</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[post.status] || 'text-slate-400'}`}>
                      {post.status}
                    </span>
                    {post.fbPostUrl && (
                      <a
                        href={post.fbPostUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition"
                        title="Mở link Reels"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {recentPosts.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Chưa có bài đăng nào. Hãy bấm "Thêm Bài Hẹn Giờ" để bắt đầu!
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Khối điều khiển Telegram Bot & Test Nhanh */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Telegram Bot 24/7 Control</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Bắn thông báo trực tiếp về điện thoại ngay khi Tool Auto-post hoàn thành đăng video.
            </p>

            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-750 text-xs space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Webhook Status:</span>
                <span className="text-emerald-400 font-semibold">Active & Listening</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Endpoint Callback:</span>
                <span className="text-slate-300 font-mono">/api/queue/callback</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Endpoint Queue:</span>
                <span className="text-slate-300 font-mono">/api/queue/pending</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Bắn Thử Nghiệm Thông Báo Mẫu:
              </label>
              
              <button
                onClick={() => triggerTelegramTest('PUBLISHED')}
                className="w-full text-left px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-medium flex items-center justify-between transition"
              >
                <span>🔔 Báo Xuất Bản Thành Công</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => triggerTelegramTest('FAILED')}
                className="w-full text-left px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-medium flex items-center justify-between transition"
              >
                <span>🚨 Báo Cảnh Báo Thất Bại (Error)</span>
                <AlertTriangle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => triggerTelegramTest('DAILY_REPORT')}
                className="w-full text-left px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium flex items-center justify-between transition"
              >
                <span>📊 Báo Cáo Tổng Kết Ngày (23:00)</span>
                <Clock className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            Token & Chat ID được cấu hình trong <code>.env</code>
          </div>
        </div>
      </div>

      {/* Modal Thêm bài */}
      <PostFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
}
