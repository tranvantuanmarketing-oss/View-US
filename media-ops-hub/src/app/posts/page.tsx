'use client';

import { useState, useEffect } from 'react';
import PostFormModal from '@/components/PostFormModal';
import { 
  PlusCircle, 
  Trash2, 
  Film, 
  ExternalLink, 
  Calendar, 
  Clock, 
  Play, 
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send
} from 'lucide-react';

interface Fanpage {
  id: string;
  name: string;
  code: string;
  country: string;
}

interface Post {
  id: string;
  fanpageId: string;
  title: string;
  videoPath: string;
  caption: string;
  commentLink?: string;
  scheduledAt: string;
  publishedAt?: string;
  fbPostUrl?: string;
  status: string;
  errorMessage?: string;
  fanpage: Fanpage;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [fanpages, setFanpages] = useState<Fanpage[]>([]);
  const [selectedPage, setSelectedPage] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPosts, resPages] = await Promise.all([
        fetch(`/api/posts?fanpageId=${selectedPage}&status=${selectedStatus}`).then((r) => r.json()),
        fetch('/api/fanpages').then((r) => r.json()),
      ]);

      if (resPosts.posts) setPosts(resPosts.posts);
      if (resPages.fanpages) setFanpages(resPages.fanpages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPage, selectedStatus]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này khỏi hàng đợi?')) return;
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Đã xóa bài viết thành công.');
        setTimeout(() => setActionMessage(null), 3000);
        fetchData();
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    }
  };

  // Giả lập Tool Auto-post gọi callback đánh dấu PUBLISHED hoặc FAILED
  const simulateAutoPostCallback = async (postId: string, status: 'PUBLISHED' | 'FAILED') => {
    try {
      setActionMessage(`Đang giả lập kết quả ${status} và kích hoạt Telegram Bot...`);
      const res = await fetch('/api/queue/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          status,
          fbPostUrl: status === 'PUBLISHED' ? `https://www.facebook.com/reel/${Date.now()}` : null,
          errorMessage: status === 'FAILED' ? 'Lỗi giả lập: Session Facebook bị checkpoint' : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage(`✓ Đã cập nhật trạng thái ${status}! Bot Telegram đã được kích hoạt.`);
        setTimeout(() => setActionMessage(null), 4000);
        fetchData();
      }
    } catch (e: any) {
      alert(`Lỗi callback: ${e.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string }> = {
      PUBLISHED: { label: 'PUBLISHED', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
      SCHEDULED: { label: 'SCHEDULED', class: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
      READY: { label: 'READY', class: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
      FAILED: { label: 'FAILED', class: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
      DRAFT: { label: 'DRAFT', class: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
    };
    const c = config[status] || { label: status, class: 'bg-slate-800 text-slate-300 border-slate-700' };
    return <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${c.class}`}>{c.label}</span>;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Film className="w-4 h-4" />
            <span>Kho Video Reels & Quy Trình Lên Lịch</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Quản Lý Bài Đăng & Hàng Đợi (Posts Queue)</h1>
          <p className="text-sm text-slate-400 mt-1">
            Quy trình trạng thái chuẩn: <code>DRAFT</code> ➔ <code>READY</code> ➔ <code>SCHEDULED</code> ➔ <code>PUBLISHED</code> ➔ <code>FAILED</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            className="p-2.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm Bài Hẹn Giờ Mới</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-blue-900/30 border border-blue-500/30 rounded-xl text-blue-200 text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs text-blue-400 hover:underline">
            Đóng
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Bộ Lọc:</span>
        </div>

        {/* Filter Fanpage */}
        <select
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">Tất cả Fanpage ({fanpages.length})</option>
          {fanpages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.country === 'FR' ? '🇫🇷' : '🇳🇱'} {p.name}
            </option>
          ))}
        </select>

        {/* Filter Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="SCHEDULED">SCHEDULED (Đang hẹn giờ)</option>
          <option value="READY">READY (Sẵn sàng)</option>
          <option value="PUBLISHED">PUBLISHED (Đã đăng)</option>
          <option value="FAILED">FAILED (Lỗi)</option>
          <option value="DRAFT">DRAFT (Bản nháp)</option>
        </select>

        <div className="ml-auto text-xs text-slate-400">
          Tổng số: <strong className="text-white">{posts.length}</strong> bài
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Tập / Tiêu Đề Video</th>
                <th className="py-3.5 px-4 font-semibold">Fanpage</th>
                <th className="py-3.5 px-4 font-semibold">Lịch Hẹn / Đăng</th>
                <th className="py-3.5 px-4 font-semibold">Link Comment 1 (Blog)</th>
                <th className="py-3.5 px-4 font-semibold">Trạng Thái</th>
                <th className="py-3.5 px-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-800/30 transition">
                  {/* Tiêu đề & Path */}
                  <td className="py-4 px-4 max-w-xs">
                    <div className="font-semibold text-white truncate">{post.title}</div>
                    <div className="text-xs text-slate-400 font-mono truncate mt-0.5" title={post.videoPath}>
                      {post.videoPath}
                    </div>
                    {post.errorMessage && (
                      <div className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{post.errorMessage}</span>
                      </div>
                    )}
                  </td>

                  {/* Fanpage */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-slate-200">
                      <span>{post.fanpage?.country === 'FR' ? '🇫🇷' : '🇳🇱'}</span>
                      <span>{post.fanpage?.name}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{post.fanpage?.code}</span>
                  </td>

                  {/* Lịch hẹn */}
                  <td className="py-4 px-4 whitespace-nowrap text-xs">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{new Date(post.scheduledAt).toLocaleString('vi-VN')}</span>
                    </div>
                    {post.publishedAt && (
                      <div className="text-emerald-400 mt-0.5">
                        Xong: {new Date(post.publishedAt).toLocaleTimeString('vi-VN')}
                      </div>
                    )}
                  </td>

                  {/* Comment Link */}
                  <td className="py-4 px-4 max-w-[220px]">
                    {post.commentLink ? (
                      <a
                        href={post.commentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:underline truncate block"
                        title={post.commentLink}
                      >
                        {post.commentLink}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Không gắn</span>
                    )}
                  </td>

                  {/* Trạng thái */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {getStatusBadge(post.status)}
                    {post.fbPostUrl && (
                      <a
                        href={post.fbPostUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Link Reel
                      </a>
                    )}
                  </td>

                  {/* Thao tác */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* Nút test callback cho bài SCHEDULED */}
                      {post.status === 'SCHEDULED' && (
                        <button
                          onClick={() => simulateAutoPostCallback(post.id, 'PUBLISHED')}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded transition flex items-center gap-1"
                          title="Giả lập Tool Auto-post đăng xong thành công"
                        >
                          <Send className="w-3 h-3" />
                          <span>Test Đăng</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {posts.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                    Không tìm thấy bài viết nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PostFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchData()}
      />
    </div>
  );
}
