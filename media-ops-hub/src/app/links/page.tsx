'use client';

import { useState, useEffect } from 'react';
import { 
  Link2, 
  Copy, 
  Check, 
  Plus, 
  ExternalLink, 
  Globe, 
  BarChart3, 
  Search,
  RefreshCw 
} from 'lucide-react';

interface BlogArticle {
  id: string;
  title: string;
  url: string;
  lang: string;
  category?: string;
  clickCount: number;
}

export default function LinksPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [selectedLang, setSelectedLang] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form thêm link mới
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newLang, setNewLang] = useState('fr');
  const [newCategory, setNewCategory] = useState('');
  const [formMsg, setFormMsg] = useState('');

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/links?lang=${selectedLang}`);
      const data = await res.json();
      if (data.articles) setArticles(data.articles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedLang]);

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg('');
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          url: newUrl,
          lang: newLang,
          category: newCategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFormMsg('✓ Đã thêm link mới thành công!');
        setNewTitle('');
        setNewUrl('');
        setNewCategory('');
        setShowAddForm(false);
        fetchArticles();
      } else {
        setFormMsg(`Lỗi: ${data.message || data.error}`);
      }
    } catch (e: any) {
      setFormMsg(`Lỗi: ${e.message}`);
    }
  };

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Link2 className="w-4 h-4" />
            <span>Kéo Traffic AdSense Tự Động</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Kho Link Bài Viết thestorypress.online</h1>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý kho 185 link bài viết để gắn vào bình luận (Comment 1) kéo traffic từ Reels Facebook sang website blog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchArticles()}
            className="p-2.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Đóng Form' : 'Thêm Link Mới'}</span>
          </button>
        </div>
      </div>

      {/* Form thêm link */}
      {showAddForm && (
        <form
          onSubmit={handleAddArticle}
          className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 animate-in fade-in"
        >
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Thêm Bài Viết Blog Mới Vào Kho</span>
          </h3>

          {formMsg && (
            <div className="text-xs p-2.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
              {formMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Tiêu đề bài viết
              </label>
              <input
                type="text"
                required
                placeholder="VD: Le mystère du manoir hanté"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Ngôn ngữ thị trường
              </label>
              <select
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="fr">🇫🇷 Tiếng Pháp (FR)</option>
                <option value="nl">🇳🇱 Tiếng Hà Lan (NL)</option>
                <option value="en">🇺🇸 Tiếng Anh (EN)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                URL Đầy Đủ (thestorypress.online)
              </label>
              <input
                type="url"
                required
                placeholder="https://thestorypress.online/fr/le-mystere-du-manoir"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Thể Loại (Category)
              </label>
              <input
                type="text"
                placeholder="Romance / Drama / Mystery..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-md transition"
            >
              Lưu Link Mới
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          {['ALL', 'fr', 'nl', 'en'].map((lang) => {
            const labels: Record<string, string> = {
              ALL: 'Tất cả',
              fr: '🇫🇷 Tiếng Pháp',
              nl: '🇳🇱 Tiếng Hà Lan',
              en: '🇺🇸 Tiếng Anh',
            };
            return (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedLang === lang
                    ? 'bg-blue-600 text-white font-semibold shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {labels[lang]}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm link hoặc tiêu đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Link List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Ngôn Ngữ</th>
                <th className="py-3.5 px-4 font-semibold">Tiêu Đề Bài Viết</th>
                <th className="py-3.5 px-4 font-semibold">Thể Loại</th>
                <th className="py-3.5 px-4 font-semibold">Đường Dẫn URL</th>
                <th className="py-3.5 px-4 font-semibold text-center">Lượt Nhấp</th>
                <th className="py-3.5 px-4 font-semibold text-right">Copy Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredArticles.map((art) => (
                <tr key={art.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-bold rounded bg-slate-800 border border-slate-700">
                      {art.lang === 'fr' ? '🇫🇷 FR' : art.lang === 'nl' ? '🇳🇱 NL' : '🇺🇸 EN'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white max-w-sm truncate">
                    {art.title}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                    {art.category || 'General'}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate font-mono text-xs text-blue-400">
                    <a href={art.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                      <span className="truncate">{art.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-400 text-xs">
                    {art.clickCount}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => copyToClipboard(art.url, art.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ml-auto ${
                        copiedId === art.id
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700'
                      }`}
                    >
                      {copiedId === art.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã Copy!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredArticles.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                    Không tìm thấy bài viết nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
