'use client';

import { useState, useEffect } from 'react';
import { Layers, RefreshCw, ExternalLink, ShieldCheck, Clock, Film } from 'lucide-react';

interface Fanpage {
  id: string;
  name: string;
  code: string;
  country: string;
  timezone: string;
  fbPageId?: string;
  viaName?: string;
  status: string;
  _count?: { posts: number };
}

export default function FanpagesPage() {
  const [fanpages, setFanpages] = useState<Fanpage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFanpages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fanpages');
      const data = await res.json();
      if (data.fanpages) setFanpages(data.fanpages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFanpages();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Hạ Tầng Kênh Facebook Reels</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Quản Lý 4 Fanpage Facebook Mục Tiêu</h1>
          <p className="text-sm text-slate-400 mt-1">
            2 Thị trường chính: Pháp 🇫🇷 (Paris, UTC+2) và Hà Lan 🇳🇱 (Amsterdam, UTC+2) được quản lý tự động.
          </p>
        </div>

        <button
          onClick={() => fetchFanpages()}
          className="p-2.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
          title="Làm mới"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fanpages.map((p) => {
          const isFR = p.country === 'FR';
          return (
            <div
              key={p.id}
              className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-slate-700 transition space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{isFR ? '🇫🇷' : '🇳🇱'}</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">{p.name}</h2>
                    <span className="text-xs font-mono text-blue-400">{p.code}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Quốc Gia & Thị Trường:</span>
                  <span className="font-semibold text-slate-200">
                    {isFR ? 'Pháp (France)' : 'Hà Lan (Netherlands)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Múi Giờ Vận Hành:</span>
                  <span className="font-semibold text-slate-200">{p.timezone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Via Quản Trị Cầm Page:</span>
                  <span className="font-semibold text-slate-200">{p.viaName || 'Chưa thiết lập'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">FB Page ID:</span>
                  <span className="font-mono text-slate-300">{p.fbPageId || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Film className="w-4 h-4 text-blue-400" />
                  <span>Tổng số video trong kho: <strong>{p._count?.posts || 0} bài</strong></span>
                </div>

                <a
                  href={`/posts?fanpageId=${p.id}`}
                  className="text-blue-400 hover:text-blue-300 font-medium hover:underline flex items-center gap-1"
                >
                  <span>Xem danh sách bài</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
