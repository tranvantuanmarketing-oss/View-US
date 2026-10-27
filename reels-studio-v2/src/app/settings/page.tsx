"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Plus,
  Globe,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Search,
  Trash2,
} from "lucide-react";

interface PageRow {
  id: string;
  name: string;
  locale: string;
  owner_staff_id: string;
  owner_name?: string;
  owner_web?: string;
  settings: {
    templates?: Array<{ template_id: string; palette_ids: string[] }>;
    avatar_ids?: string[];
    music_mood?: string;
    selected_track_ids?: string[];
  };
  created_at: string;
}

export default function PagesListPage() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLocale, setNewLocale] = useState("fr");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    setLoading(true);
    try {
      const res = await fetch("/api/pages");
      const json = await res.json();
      if (json.success && json.data) {
        setPages(json.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách page", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePage(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          locale: newLocale,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setNewName("");
        fetchPages();
      } else {
        alert(json.error || "Lỗi tạo page.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeletePage(pageId: string, pageName: string) {
    if (!confirm(`Bạn có chắc muốn xoá page "${pageName}"?`)) return;
    try {
      const res = await fetch(`/api/pages/${pageId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setPages(pages.filter((p) => p.id !== pageId));
      } else {
        alert(json.error || "Không thể xoá page.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filteredPages = pages.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.locale.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-blue-600" /> Cài đặt Page Facebook
          </h2>
          <p className="text-xs text-blue-700/80 mt-1">
            Quản lý cấu hình Mẫu (76 mẫu), Avatar tự khớp người kể, và Gu nhạc theo từng Page. Cài đặt được lưu thành bản chụp (snapshot) độc lập cho từng lô dựng.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên page, ngôn ngữ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 fill-current" />
            <span>Thêm Page</span>
          </button>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-2xl border border-blue-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10.5px] tracking-wider font-semibold">
                <th className="py-3 px-4">Tên Page & Ngôn ngữ</th>
                <th className="py-3 px-4">Nhân viên phụ trách</th>
                <th className="py-3 px-4">Mẫu thiết kế</th>
                <th className="py-3 px-4">Kho Avatar</th>
                <th className="py-3 px-4">Gu nhạc</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Đang tải danh sách page...
                  </td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy page nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => {
                  const tplCount = page.settings.templates?.length || 0;
                  const totalPals = page.settings.templates?.reduce(
                    (acc, t) => acc + (t.palette_ids?.length || 0),
                    0
                  ) || 0;

                  const avatarCount = page.settings.avatar_ids?.length || 0;
                  const mood = page.settings.music_mood || "tram";
                  const moodLabel =
                    mood === "tram"
                      ? "Gu trầm"
                      : mood === "vui"
                      ? "Gu vui"
                      : "Tươi sáng/Nhẹ nhàng";

                  // Status check: >= 1 template and >= 10 avatars
                  const isHealthy = tplCount > 0 && avatarCount >= 10;
                  const warnings = [];
                  if (tplCount === 0) warnings.push("Chưa chọn mẫu");
                  if (avatarCount < 10) warnings.push(`Ít avatar (${avatarCount}/10)`);

                  return (
                    <tr
                      key={page.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name & Locale */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{page.name}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                            {page.locale}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {page.id}
                        </div>
                      </td>

                      {/* Staff */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{page.owner_name || "Chưa gán"}</span>
                        </div>
                        {page.owner_web && (
                          <div className="text-[10.5px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span>{page.owner_web}</span>
                          </div>
                        )}
                      </td>

                      {/* Templates count */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {tplCount > 0 ? (
                            <span>
                              <span className="text-blue-700 font-bold">{tplCount}</span> mẫu{" "}
                              <span className="text-slate-400 font-normal">({totalPals} bảng màu)</span>
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">Chưa chọn</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">Video xoay vòng qua tất cả</div>
                      </td>

                      {/* Avatars */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          <span className="text-blue-700 font-bold">{avatarCount}</span> mặt
                        </div>
                        <div className="text-[11px] text-slate-400">Tự khớp người kể truyện</div>
                      </td>

                      {/* Music */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {moodLabel}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {page.settings.selected_track_ids && page.settings.selected_track_ids.length > 0
                            ? `${page.settings.selected_track_ids.length} track chỉ định`
                            : "Dùng toàn bộ kho gu"}
                        </div>
                      </td>

                      {/* Health Status */}
                      <td className="py-3.5 px-4">
                        {isHealthy ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Ổn</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>{warnings.join(", ")}</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/settings/${page.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 font-bold text-xs transition-all shadow-2xs"
                          >
                            <span>Cài đặt</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDeletePage(page.id, page.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Xoá page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Page Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Thêm Page Facebook Mới</h3>
            <p className="text-xs text-slate-500">
              Khởi tạo trang để bắt đầu cấu hình mẫu thiết kế, avatar và gu âm nhạc.
            </p>

            <form onSubmit={handleCreatePage} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tên Page Facebook:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Vérités d'Hier"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Ngôn ngữ (Locale):
                </label>
                <select
                  value={newLocale}
                  onChange={(e) => setNewLocale(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="fr">Tiếng Pháp (FR)</option>
                  <option value="nl">Tiếng Hà Lan (NL)</option>
                  <option value="de">Tiếng Đức (DE)</option>
                  <option value="en">Tiếng Anh (EN)</option>
                  <option value="es">Tiếng Tây Ban Nha (ES)</option>
                  <option value="pl">Tiếng Ba Lan (PL)</option>
                  <option value="it">Tiếng Ý (IT)</option>
                  <option value="vi">Tiếng Việt (VI)</option>
                  <option value="da">Tiếng Đan Mạch (DA)</option>
                  <option value="no">Tiếng Na Uy (NO)</option>
                  <option value="sv">Tiếng Thụy Điển (SV)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all disabled:opacity-50 shadow-xs"
                >
                  {creating ? "Đang tạo..." : "Tạo Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
