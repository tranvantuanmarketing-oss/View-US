"use client";

import React, { useState, useEffect } from "react";
import { LOCALE_OPTIONS } from "@/lib/locales";
import Link from "next/link";
import {
  Globe,
  Plus,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Settings,
  ShieldCheck,
  ExternalLink,
  Trash2,
  Sparkles,
  AlertTriangle,
  X,
} from "lucide-react";

interface WebsiteItem {
  id: string;
  name: string;
  domain: string;
  slug: string;
  owner_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface PageItem {
  id: string;
  name: string;
  display_name?: string;
  locale: string;
  owner_staff_id: string;
  owner_name?: string;
  created_at: string;
}

export default function WebPagesManagement() {
  const [activeTab, setActiveTab] = useState<"websites" | "pages">("websites");
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Register website modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Register page modal
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageDisplayName, setNewPageDisplayName] = useState("");
  const [newPageLocale, setNewPageLocale] = useState("en");

  // Clean demo data modal
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [demoStats, setDemoStats] = useState<any>(null);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    fetchWebPages();
  }, []);

  async function fetchWebPages() {
    setLoading(true);
    try {
      const res = await fetch("/api/web-pages");
      const json = await res.json();
      if (json.success && json.data) {
        setWebsites(json.data.websites || []);
        setPages(json.data.pages || []);
        setIsAdmin(json.data.isAdmin || false);
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu web-pages", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenCleanModal() {
    setShowCleanModal(true);
    try {
      const res = await fetch("/api/cleanup-demo");
      const json = await res.json();
      if (json.success) setDemoStats(json.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleConfirmCleanDemo() {
    setCleaning(true);
    try {
      const res = await fetch("/api/cleanup-demo", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        setShowCleanModal(false);
        fetchWebPages();
      } else {
        alert(json.error || "Lỗi khi dọn dữ liệu mẫu.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCleaning(false);
    }
  }

  async function handleRegisterWebsite(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newDomain.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/web-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          domain: newDomain.trim(),
          slug: newSlug.trim() || newName.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setNewName("");
        setNewDomain("");
        setNewSlug("");
        fetchWebPages();
      } else {
        alert(json.error || "Lỗi đăng ký website.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegisterPage(e: React.FormEvent) {
    e.preventDefault();
    if (!newPageName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPageName.trim(),
          display_name: newPageDisplayName.trim() || newPageName.trim(),
          locale: newPageLocale,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddPageModal(false);
        setNewPageName("");
        setNewPageDisplayName("");
        fetchWebPages();
      } else {
        alert(json.error || "Lỗi tạo page.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteWebsite(id: string, name: string) {
    if (!confirm(`Bạn có chắc chắn muốn xóa website "${name}"?`)) return;
    try {
      const res = await fetch(`/api/web-pages?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchWebPages();
      } else {
        alert(json.error || "Không thể xóa website.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeletePage(id: string, name: string) {
    if (id === "free") {
      alert("Không thể xóa cấu hình Lô tự do mặc định.");
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa page "${name}"?`)) return;
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchWebPages();
      } else {
        alert(json.error || "Không thể xóa page.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xs flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-blue-900 flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Quản lý Web & Page (Domains & Fanpages)</span>
            </h1>
            <p className="text-xs text-blue-700/80 mt-0.5">
              Đăng ký domain đích và quản lý danh sách Fanpage của riêng bạn
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenCleanModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Dọn dữ liệu mẫu</span>
            </button>

            <button
              onClick={fetchWebPages}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:border-blue-400 text-xs font-semibold shadow-2xs"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Làm mới</span>
            </button>

            {activeTab === "websites" ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Đăng ký Web mới</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAddPageModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Fanpage mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 max-w-xs gap-1">
          <button
            onClick={() => setActiveTab("websites")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "websites" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600"
            }`}
          >
            Web của tôi ({websites.length})
          </button>
          <button
            onClick={() => setActiveTab("pages")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "pages" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600"
            }`}
          >
            Page của tôi ({pages.filter((p) => p.id !== "free").length})
          </button>
        </div>

        {/* TAB 1: WEBSITES */}
        {activeTab === "websites" && (
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Danh sách Blog / Website đã đăng ký</h2>
              <span className="text-xs text-slate-500">Tự động kích hoạt không cần phê duyệt khác</span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-blue-500" />
                <span>Đang tải danh sách web...</span>
              </div>
            ) : websites.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Globe className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-700">Chưa có website nào được đăng ký</div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Đăng ký website đầu tiên
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-blue-200 text-blue-900 text-[11px] font-bold uppercase tracking-wider bg-blue-50/60">
                      <th className="py-3 px-3">Tên Website</th>
                      <th className="py-3 px-3">Domain</th>
                      <th className="py-3 px-3">Slug</th>
                      <th className="py-3 px-3">Trạng thái</th>
                      <th className="py-3 px-3 text-right">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {websites.map((web) => (
                      <tr key={web.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">{web.name}</td>
                        <td className="py-3 px-3 font-mono text-blue-600">
                          <a href={`https://${web.domain}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                            <span>{web.domain}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </td>
                        <td className="py-3 px-3 text-slate-500">{web.slug}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Hoạt động
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteWebsite(web.id, web.name)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="Xóa website này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PAGES */}
        {activeTab === "pages" && (
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Danh sách Fanpage trong tài khoản</h2>
              <Link
                href="/settings"
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Cài đặt mẫu & cấu hình page →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-blue-200 text-blue-900 text-[11px] font-bold uppercase tracking-wider bg-blue-50/60">
                    <th className="py-3 px-3">Tên Page (Quản lý)</th>
                    <th className="py-3 px-3">Tên hiển thị trên Video (F16)</th>
                    <th className="py-3 px-3">Ngôn ngữ</th>
                    <th className="py-3 px-3 text-right">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {pages
                    .filter((p) => p.id !== "free")
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3 px-3 text-slate-700">
                          {p.display_name ? (
                            <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              {p.display_name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Trùng tên quản lý</span>
                          )}
                        </td>
                        <td className="py-3 px-3 uppercase font-bold text-slate-600">{p.locale}</td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <Link
                            href={`/settings/${p.id}`}
                            className="px-3 py-1 bg-white border border-slate-200 hover:border-blue-500 text-blue-600 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                          >
                            <Settings className="w-3 h-3" />
                            <span>Cài đặt</span>
                          </Link>
                          <button
                            onClick={() => handleDeletePage(p.id, p.name)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors inline-flex items-center"
                            title="Xóa Fanpage này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Đăng Ký Web */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <h2 className="text-base font-bold text-slate-900">Đăng Ký Blog / Website Đích Mới</h2>
              <form onSubmit={handleRegisterWebsite} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tên Website / Thương hiệu</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="vd. My Daily Stories"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Domain (Tên miền chính thức)</label>
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="vd. mydailystories.com"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Slug (Đường dẫn rút gọn)</label>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="vd. my-daily-stories"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    {submitting ? "Đang lưu..." : "Đăng ký ngay"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Thêm Fanpage */}
        {showAddPageModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <h2 className="text-base font-bold text-slate-900">Thêm Fanpage Mới (Không bắt buộc Domain)</h2>
              <form onSubmit={handleRegisterPage} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tên Fanpage (Quản lý)</label>
                  <input
                    type="text"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    placeholder="vd. Daily American Confessions"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tên hiển thị trên Video (F16)</label>
                  <input
                    type="text"
                    value={newPageDisplayName}
                    onChange={(e) => setNewPageDisplayName(e.target.value)}
                    placeholder="vd. The Story · Daily US Insights"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ngôn ngữ chính (Locale)</label>
                  <select
                    value={newPageLocale}
                    onChange={(e) => setNewPageLocale(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold"
                  >
                    {LOCALE_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddPageModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    {submitting ? "Đang lưu..." : "Tạo Fanpage"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Dọn Dữ Liệu Mẫu (Clean Demo Data) */}
        {showCleanModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Xem trước & Dọn Dữ Liệu Mẫu (Demo Seed)</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Hệ thống sẽ giữ nguyên tài khoản chủ, kho avatar và nhạc nền, chỉ dọn các bản ghi mẫu ban đầu để bạn bắt đầu với dữ liệu sạch:
              </p>

              {demoStats ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span>Fanpage mẫu (Pháp, Hà Lan):</span>
                    <b className="text-slate-900">{demoStats.pages} trang</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Website mẫu (Best Novel, Love History...):</span>
                    <b className="text-slate-900">{demoStats.websites} web</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Thẻ kịch bản mẫu:</span>
                    <b className="text-slate-900">{demoStats.cards} thẻ</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Fanpage đối thủ Radar:</span>
                    <b className="text-slate-900">{demoStats.monitoredPages} đối thủ</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Bài viết Kho Viral:</span>
                    <b className="text-slate-900">{demoStats.viralPosts} bài</b>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-amber-800">
                    <span>Tổng số bản ghi mẫu sẽ dọn:</span>
                    <span>{demoStats.total}</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin text-blue-500" />
                  <span>Đang kiểm tra số lượng bản ghi mẫu...</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCleanModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCleanDemo}
                  disabled={cleaning}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  {cleaning ? "Đang dọn..." : "Xác nhận Dọn Dữ Liệu"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
