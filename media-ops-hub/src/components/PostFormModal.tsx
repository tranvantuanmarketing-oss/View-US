'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Film, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Fanpage {
  id: string;
  name: string;
  country: string;
}

interface BlogArticle {
  id: string;
  title: string;
  url: string;
  lang: string;
}

export default function PostFormModal({ isOpen, onClose, onSuccess }: PostFormModalProps) {
  const [fanpages, setFanpages] = useState<Fanpage[]>([]);
  const [blogArticles, setBlogArticles] = useState<BlogArticle[]>([]);
  
  const [fanpageId, setFanpageId] = useState('');
  const [title, setTitle] = useState('');
  const [videoPath, setVideoPath] = useState('');
  const [caption, setCaption] = useState('');
  const [commentLink, setCommentLink] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [status, setStatus] = useState('SCHEDULED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Set default scheduled time to 15 mins from now in local ISO format (YYYY-MM-DDTHH:mm)
      const future = new Date(Date.now() + 15 * 60 * 1000);
      const tzOffset = future.getTimezoneOffset() * 60000;
      const localISOTime = new Date(future.getTime() - tzOffset).toISOString().slice(0, 16);
      setScheduledAt(localISOTime);

      // Tải fanpages & links
      fetch('/api/fanpages')
        .then((r) => r.json())
        .then((data) => {
          if (data.fanpages) {
            setFanpages(data.fanpages);
            if (data.fanpages.length > 0 && !fanpageId) {
              setFanpageId(data.fanpages[0].id);
            }
          }
        });

      fetch('/api/links')
        .then((r) => r.json())
        .then((data) => {
          if (data.articles) {
            setBlogArticles(data.articles);
          }
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fanpageId,
          title,
          videoPath,
          caption,
          commentLink: commentLink || null,
          scheduledAt: new Date(scheduledAt).toISOString(),
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Có lỗi xảy ra khi lưu bài.');
      }

      // Reset form
      setTitle('');
      setVideoPath('');
      setCaption('');
      setCommentLink('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/10 text-blue-400 rounded-lg">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Thêm Bài Đăng Mới & Hẹn Giờ</h2>
              <p className="text-xs text-slate-400">Đưa video vào hàng đợi để Tool Auto-post tự động xuất bản</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Chọn Fanpage */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Chọn Fanpage Facebook Target <span className="text-rose-400">*</span>
            </label>
            <select
              value={fanpageId}
              onChange={(e) => setFanpageId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {fanpages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.country === 'FR' ? '🇫🇷' : '🇳🇱'} {p.name} ({p.country})
                </option>
              ))}
            </select>
          </div>

          {/* Tiêu đề video */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tiêu Đề Video / Tên Tập Truyện <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Masques Tombés - Tập 2: Bức màn bí mật hé lộ"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Đường dẫn video trên máy */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Đường Dẫn File Video (Local Path hoặc URL) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="/Users/tony/Downloads/View US/videos/masques_ep2.mp4"
              value={videoPath}
              onChange={(e) => setVideoPath(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nội Dung Caption Facebook Reels <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Nhập nội dung caption tiếng Pháp hoặc Hà Lan kèm hashtags..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Link blog thả comment 1 */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Link Bài Blog Kéo View (Comment 1)</span>
              <span className="text-slate-400 lowercase font-normal">thestorypress.online</span>
            </label>
            <div className="space-y-2">
              <input
                type="url"
                placeholder="https://thestorypress.online/fr/heritage-secret-beaumont"
                value={commentLink}
                onChange={(e) => setCommentLink(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              {blogArticles.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Gợi ý nhanh:</span>
                  <select
                    onChange={(e) => setCommentLink(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1 text-xs focus:outline-none"
                    value=""
                  >
                    <option value="" disabled>-- Chọn từ 185 link có sẵn --</option>
                    {blogArticles.map((art) => (
                      <option key={art.id} value={art.url}>
                        [{art.lang.toUpperCase()}] {art.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Hàng hẹn giờ & trạng thái */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Thời Gian Hẹn Đăng <span className="text-rose-400">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Trạng Thái Ban Đầu
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="SCHEDULED">SCHEDULED (Đưa vào hàng đợi tự động)</option>
                <option value="READY">READY (Sẵn sàng - Chờ duyệt thủ công)</option>
                <option value="DRAFT">DRAFT (Bản nháp)</option>
              </select>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lên Lịch Đăng Bài'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
