"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radar,
  Search,
  Plus,
  RotateCw,
  TrendingUp,
  ExternalLink,
  Sliders,
  Globe,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpDown,
} from "lucide-react";

interface MonitoredPage {
  id: string;
  page_name: string;
  page_avatar: string;
  followers: number;
  delta_7d: number | null;
  posts_today: number;
  posts_7d: number;
  comments_7d: number;
  total_posts: number;
  target_domain: string | null;
  ads_status: "active" | "inactive" | "unknown";
  last_scanned_at: string;
}

export default function RadarPage() {
  const [pages, setPages] = useState<MonitoredPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adsFilter, setAdsFilter] = useState("all");
  const [sortBy, setSortBy] = useState("followers");
  const [totalCount, setTotalCount] = useState(0);

  // Add Page Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPageName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newFollowers, setNewFollowers] = useState(50000);
  const [newAdsStatus, setNewAdsStatus] = useState("unknown");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRadar();
  }, [search, adsFilter, sortBy]);

  async function fetchRadar() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (adsFilter !== "all") params.set("ads", adsFilter);
      params.set("sortBy", sortBy);
      params.set("limit", "50");

      const res = await fetch(`/api/radar?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setPages(json.data.pages || []);
        setTotalCount(json.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách radar", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPage(e: React.FormEvent) {
    e.preventDefault();
    if (!newPageName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_name: newPageName.trim(),
          target_domain: newDomain.trim() || null,
          followers: Number(newFollowers) || 0,
          ads_status: newAdsStatus,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setNewName("");
        setNewDomain("");
        fetchRadar();
      } else {
        alert(json.error || "Lỗi thêm page.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xs flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-blue-900 flex items-center gap-2.5">
              <Radar className="w-5 h-5 text-blue-600" />
              <span>Fanpage Radar (Theo dõi Đối thủ)</span>
            </h1>
            <p className="text-xs text-blue-700/80 mt-0.5">
              Quét chỉ số bài đăng, tốc độ tăng trưởng follower và kiểm tra liên kết website của các page đối thủ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRadar}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:border-blue-400 text-xs font-semibold shadow-2xs"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Quét lại</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Fanpage theo dõi</span>
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm page hoặc domain đích..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 w-72"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Quảng cáo:</span>
              <select
                value={adsFilter}
                onChange={(e) => setAdsFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang chạy Ads</option>
                <option value="inactive">Không chạy Ads</option>
                <option value="unknown">Chưa xác định</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="followers">Followers cao nhất</option>
                <option value="delta_7d">Tăng trưởng 7 ngày</option>
                <option value="posts_today">Bài đăng hôm nay</option>
                <option value="posts_7d">Bài đăng 7 ngày</option>
                <option value="comments_7d">Comment 7 ngày</option>
                <option value="total_posts">Tổng số bài</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Tổng cộng: <span className="font-bold text-blue-900">{totalCount}</span> trang
          </div>
        </div>

        {/* Radar Table */}
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xs space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
              <RotateCw className="w-4 h-4 animate-spin text-blue-500" />
              <span>Đang quét dữ liệu radar...</span>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Radar className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800">Chưa có Fanpage đối thủ nào trong Radar</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Nhập tên các Fanpage đối thủ để theo dõi nhịp độ ra bài và mức độ viral nội dung.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Fanpage ngay</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-blue-200 text-blue-900 text-[11px] font-bold uppercase tracking-wider bg-blue-50/60">
                    <th className="py-3 px-3">Fanpage</th>
                    <th className="py-3 px-3 text-right">Follower</th>
                    <th className="py-3 px-3 text-right">Tăng trưởng 7d</th>
                    <th className="py-3 px-3 text-right">Hôm nay</th>
                    <th className="py-3 px-3 text-right">7 ngày</th>
                    <th className="py-3 px-3 text-right">Comment 7d</th>
                    <th className="py-3 px-3 text-right">Tổng bài</th>
                    <th className="py-3 px-3">Domain đích</th>
                    <th className="py-3 px-3 text-center">Ads</th>
                    <th className="py-3 px-3 text-right">Quét cuối</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {pages.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.page_avatar || "/assets/avatars/av_01.jpg"}
                            alt={p.page_name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-bold text-slate-900">{p.page_name}</span>
                        </div>
                      </td>

                      {/* Followers */}
                      <td className="py-3 px-3 text-right font-bold text-slate-800">
                        {p.followers.toLocaleString("vi-VN")}
                      </td>

                      {/* Delta 7d */}
                      <td className="py-3 px-3 text-right">
                        {p.delta_7d !== null ? (
                          <span className={`font-semibold ${p.delta_7d >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {p.delta_7d >= 0 ? `+${p.delta_7d.toLocaleString("vi-VN")}` : p.delta_7d.toLocaleString("vi-VN")}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Chưa đủ dữ liệu</span>
                        )}
                      </td>

                      {/* Posts today */}
                      <td className="py-3 px-3 text-right text-slate-700 font-semibold">
                        {p.posts_today}
                      </td>

                      {/* Posts 7d */}
                      <td className="py-3 px-3 text-right text-slate-700">
                        {p.posts_7d}
                      </td>

                      {/* Comments 7d */}
                      <td className="py-3 px-3 text-right font-bold text-blue-700">
                        {p.comments_7d.toLocaleString("vi-VN")}
                      </td>

                      {/* Total posts */}
                      <td className="py-3 px-3 text-right text-slate-500">
                        {p.total_posts}
                      </td>

                      {/* Target domain */}
                      <td className="py-3 px-3">
                        {p.target_domain ? (
                          <a
                            href={`https://${p.target_domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-mono text-[11px]"
                          >
                            <Globe className="w-3 h-3" />
                            <span>{p.target_domain}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Chưa gắn link</span>
                        )}
                      </td>

                      {/* Ads status */}
                      <td className="py-3 px-3 text-center">
                        {p.ads_status === "active" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đang chạy
                          </span>
                        ) : p.ads_status === "inactive" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Không
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Chưa xác định
                          </span>
                        )}
                      </td>

                      {/* Last scanned */}
                      <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                        {new Date(p.last_scanned_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Thêm Page Đối Thủ */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <h2 className="text-base font-bold text-slate-900">Thêm Fanpage Đối Thủ Theo Dõi</h2>
              <form onSubmit={handleAddPage} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tên Fanpage</label>
                  <input
                    type="text"
                    value={newPageName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="vd. Daily Quotes Official"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Followers hiện tại (ước lượng)</label>
                  <input
                    type="number"
                    value={newFollowers}
                    onChange={(e) => setNewFollowers(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Domain Blog / Website đích (nếu có)</label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="vd. bestnovel.danhngon.pro"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Trạng thái Quảng cáo</label>
                  <select
                    value={newAdsStatus}
                    onChange={(e) => setNewAdsStatus(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  >
                    <option value="unknown">Chưa xác định</option>
                    <option value="active">Đang chạy Ads</option>
                    <option value="inactive">Không chạy Ads</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                  >
                    Thêm vào Radar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
