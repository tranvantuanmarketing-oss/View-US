"use client";

import React, { useState, useEffect, Suspense } from "react";
import { LOCALE_OPTIONS } from "@/lib/locales";
import Link from "next/link";
import { parseStories, serializeStories, readStoryFile } from "@/lib/storyImport";
import { useSearchParams, useRouter } from "next/navigation";
import {
  PenTool,
  Library,
  Layers,
  Search,
  Plus,
  PlaySquare,
  Sparkles,
  Check,
  Tag,
  Calendar,
  Globe,
  FileText,
  Copy,
  ExternalLink,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Page } from "@/lib/types";

interface StoryCard {
  id: string;
  author: string;
  page: string;
  locale: string;
  title: string;
  content: string;
  highlights: string[];
  cta: string;
  caption: string;
  comment1: string;
  status: "draft" | "ready" | "reserved" | "used" | "archived";
  reserved_by_batch_id?: string;
  used_by_page_id?: string;
  created_at: string;
}

function CardsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTabQuery = searchParams.get("tab") || "library";

  const [activeTab, setActiveTab] = useState<"library" | "write" | "pull">(
    activeTabQuery === "write" ? "write" : "library"
  );

  useEffect(() => {
    if (activeTabQuery === "write") setActiveTab("write");
    else if (activeTabQuery === "pull") setActiveTab("write");
    else setActiveTab("library");
  }, [activeTabQuery]);

  // Writer form state
  const [writeMode, setWriteMode] = useState<"single" | "bulk">("single");
  const [author, setAuthor] = useState("Emily Vance");
  const [pageName, setPageName] = useState("Daily Confessions");
  const [locale, setLocale] = useState("en");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [highlights, setHighlights] = useState("");
  const [cta, setCta] = useState("Read Continuation In Comments 👇");
  const [caption, setCaption] = useState("");
  const [comment1, setComment1] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Cards library state
  const [cards, setCards] = useState<StoryCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLocale, setFilterLocale] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [totalCount, setTotalCount] = useState(0);

  // Pull cards state
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [pullCount, setPullCount] = useState(10);
  const [pullPreviewCards, setPullPreviewCards] = useState<StoryCard[]>([]);
  const [pullLoading, setPullLoading] = useState(false);
  const [pullError, setPullError] = useState("");
  const [pullSuccess, setPullSuccess] = useState("");

  useEffect(() => {
    fetchCards();
    fetchPages();
  }, [filterLocale, filterStatus, search]);

  async function fetchCards() {
    setLoadingCards(true);
    try {
      const params = new URLSearchParams();
      if (filterLocale !== "all") params.set("locale", filterLocale);
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "100");

      const res = await fetch(`/api/cards?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCards(json.data.cards || []);
        setTotalCount(json.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách thẻ", err);
    } finally {
      setLoadingCards(false);
    }
  }

  async function fetchPages() {
    try {
      const res = await fetch("/api/pages");
      const json = await res.json();
      if (json.success && json.data) {
        setPages(json.data);
        if (json.data.length > 0 && !selectedPageId) {
          const usPage = json.data.find((p: Page) => p.id === "page_us_01" || p.locale?.startsWith("en")) || json.data[0];
          setSelectedPageId(usPage.id);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy pages", err);
    }
  }

  // Handle saving new card (single)
  async function handleSaveSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: author.trim() || "Emily Vance",
          page: pageName.trim() || "Daily Confessions",
          locale,
          title: title.trim() || content.slice(0, 60) + "...",
          content: content.trim(),
          highlights: highlights.split("|").map((h) => h.trim()).filter(Boolean),
          cta: cta.trim(),
          caption: caption.trim() || content.slice(0, 120) + "...",
          comment1: comment1.trim() || "Part 2 in the comments! 👇",
          status: "ready",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setContent("");
        setTitle("");
        setHighlights("");
        setCaption("");
        setComment1("");
        fetchCards();
        setTimeout(() => {
          setSaveSuccess(false);
          setActiveTab("library");
        }, 1000);
      } else {
        setSaveError(json.error || "Lỗi lưu thẻ.");
      }
    } catch (err: any) {
      setSaveError(err.message || "Lỗi kết nối.");
    } finally {
      setSaving(false);
    }
  }

  // Handle saving bulk text (=== STORY X ===)
  async function handleSaveBulk(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkText.trim()) return;

    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulkText,
          defaultAuthor: author,
          defaultPage: pageName,
          locale,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setBulkText("");
        fetchCards();
        setTimeout(() => {
          setSaveSuccess(false);
          setActiveTab("library");
        }, 1200);
      } else {
        setSaveError(json.error || "Lỗi nhập hàng loạt.");
      }
    } catch (err: any) {
      setSaveError(err.message || "Lỗi kết nối.");
    } finally {
      setSaving(false);
    }
  }

  // Handle pull cards preview
  async function handlePreviewPull() {
    if (!selectedPageId) return;
    setPullLoading(true);
    setPullError("");
    setPullSuccess("");
    try {
      const res = await fetch("/api/cards/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedPageId,
          count: pullCount,
          action: "preview",
        }),
      });
      const json = await res.json();
      if (json.success && json.cards) {
        setPullPreviewCards(json.cards);
      } else {
        setPullPreviewCards([]);
        setPullError(json.error || "Không thể lấy trước thẻ.");
      }
    } catch (err: any) {
      setPullError(err.message || "Lỗi kết nối.");
    } finally {
      setPullLoading(false);
    }
  }

  // Handle pull and commit reservation
  async function handleCommitPull() {
    if (!selectedPageId) return;
    setPullLoading(true);
    setPullError("");
    setPullSuccess("");
    try {
      const res = await fetch("/api/cards/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedPageId,
          count: pullCount,
          action: "reserve",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPullSuccess(`Đã giữ thành công ${json.reservedCount} thẻ cho page! Đang chuyển đến Studio dựng video...`);
        fetchCards();
        // Construct script to send to studio
        if (pullPreviewCards.length > 0) {
          const scripts = pullPreviewCards.map((c, i) => `=== STORY ${i + 1} ===
Tác giả: ${c.author}
Thời gian: 2h ago
Tên Page: ${c.page}
Nội dung thẻ:
${c.content}
Highlights: ${c.highlights.join(" | ")}
Nút CTA: ${c.cta}
Caption: ${c.caption}
Comment 1: ${c.comment1}`).join("\n\n");
          setTimeout(() => {
            router.push(`/render?page=${encodeURIComponent(selectedPageId)}&prefill=${encodeURIComponent(scripts)}&author=${encodeURIComponent(pullPreviewCards[0]?.author || "")}`);
          }, 1000);
        }
      } else {
        setPullError(json.error || "Không thể giữ thẻ.");
      }
    } catch (err: any) {
      setPullError(err.message || "Lỗi kết nối.");
    } finally {
      setPullLoading(false);
    }
  }

  const handleSendToStudio = (card: StoryCard) => {
    const script = `=== STORY 1 ===
Tác giả: ${card.author}
Thời gian: 2h ago
Tên Page: ${card.page}
Nội dung thẻ:
${card.content}
Highlights: ${card.highlights.join(" | ")}
Nút CTA: ${card.cta}
Caption: ${card.caption}
Comment 1: ${card.comment1}`;

    router.push(`/render?prefill=${encodeURIComponent(script)}&author=${encodeURIComponent(card.author)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Tabs */}
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xs flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-blue-900 flex items-center gap-2.5">
              <span>Hệ Thống Thẻ Kịch Bản (Card Studio)</span>
            </h1>
            <p className="text-xs text-blue-700/80 mt-0.5">
              Soạn thảo kịch bản, quản lý kho thẻ dùng chung và phân phối thẻ theo page (SQLite WAL)
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
            <button
              onClick={() => setActiveTab("library")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "library"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>Kho thẻ ({totalCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("write")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "write"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Viết thẻ mới / Nhập nhanh</span>
            </button>


          </div>
        </div>

        {/* TAB 1: KHO THẺ (LIBRARY) */}
        {activeTab === "library" && (
          <div className="space-y-4">
            {/* Filter and Search */}
            <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo nội dung, tác giả..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 w-64"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={filterLocale}
                  onChange={(e) => setFilterLocale(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
                >
                  <option value="all">Tất cả ngôn ngữ</option>
                  {LOCALE_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="ready">Sẵn sàng (ready)</option>
                  <option value="reserved">Đang giữ (reserved)</option>
                  <option value="used">Đã dựng (used)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchCards}
                  className="p-1.5 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-slate-600 transition-colors"
                  title="Làm mới"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab("write")}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Viết thẻ mới</span>
                </button>
              </div>
            </div>

            {/* Cards Grid / Empty State */}
            {loadingCards ? (
              <div className="bg-white border border-blue-200 rounded-2xl p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-blue-500" />
                <span>Đang tải kho thẻ...</span>
              </div>
            ) : cards.length === 0 ? (
              <div className="bg-white border-2 border-blue-200 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Library className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">Kho thẻ hiện đang rỗng</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Chưa có thẻ kịch bản nào khớp bộ lọc. Bạn có thể tự viết thẻ đơn hoặc nhập hàng loạt từ kịch bản mẫu.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab("write")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Viết hoặc Nhập thẻ ngay</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3 transition-all"
                  >
                    <div>
                      {/* Meta chips */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                          {card.locale}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            card.status === "ready"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : card.status === "reserved"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {card.status}
                        </span>
                      </div>

                      {/* Content preview */}
                      <p className="text-xs font-semibold text-slate-900 line-clamp-3 leading-relaxed mb-2">
                        {card.content}
                      </p>

                      {/* Author & Page */}
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{card.author}</span>
                        <span className="text-slate-400">· {card.page}</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {new Date(card.created_at).toLocaleDateString("vi-VN")}
                      </span>
                      <button
                        onClick={() => handleSendToStudio(card)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        <PlaySquare className="w-3 h-3" />
                        <span>Dựng video</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VIẾT THẺ MỚI / NHẬP HÀNG LOẠT */}
        {activeTab === "write" && (
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-blue-600" />
                  <span>Soạn thảo Kịch bản Thẻ</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thẻ được lưu trực tiếp vào cơ sở dữ liệu SQLite để phân phối cho các Fanpage
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setWriteMode("single")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    writeMode === "single" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Viết từng thẻ
                </button>
                <button
                  type="button"
                  onClick={() => setWriteMode("bulk")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    writeMode === "bulk" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Nhập nhanh hàng loạt (STORY X)
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2">
              <label className="inline-flex cursor-pointer rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white">
                Tải file TXT / JSON lên
                <input type="file" accept=".txt,.json,text/plain,application/json" multiple className="hidden" onChange={async e => {
                  const files = Array.from(e.target.files || []); e.target.value = "";
                  try {
                    const stories = (await Promise.all(files.map(async f => { if(f.size > 5*1024*1024) throw new Error("Mỗi file tối đa 5 MB"); return parseStories(await readStoryFile(f)); }))).flat();
                    if(!stories.length) throw new Error("Chưa tìm thấy nội dung video.");
                    setBulkText(serializeStories(stories)); setWriteMode("bulk"); setSaveError("");
                  } catch(err:any) {setSaveError(err.message);}
                }} />
              </label>
              <p className="text-xs text-slate-600">Nhận diện Nội dung video, Caption và Comment/CMT. Kiểm tra nội dung rồi bấm Lưu; hoặc dựng trực tiếp từ file tại Studio.</p>
            </div>
            {saveError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Đã lưu kịch bản vào cơ sở dữ liệu thành công!</span>
              </div>
            )}

            {writeMode === "single" ? (
              <form onSubmit={handleSaveSingle} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tác giả</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tên Page</label>
                    <input
                      type="text"
                      value={pageName}
                      onChange={(e) => setPageName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ngôn ngữ</label>
                    <select
                      value={locale}
                      onChange={(e) => setLocale(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    >
                      {LOCALE_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Nội dung thẻ trên video (4–5 câu gây tò mò, kịch tính):
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung câu chuyện xuất hiện trên thẻ video 9:16..."
                    rows={4}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Từ nổi bật (Highlights - bôi đỏ nhấn mạnh, cách nhau bằng dấu |):
                  </label>
                  <input
                    type="text"
                    value={highlights}
                    onChange={(e) => setHighlights(e.target.value)}
                    placeholder='vd. "You have time to think about this" | claiming her inheritance...'
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Caption bài viết</label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Đoạn dẫn tiếp theo dẫn người xem mở bình luận đầu tiên..."
                      rows={3}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Bình luận đầu tiên (Comment 1)</label>
                    <textarea
                      value={comment1}
                      onChange={(e) => setComment1(e.target.value)}
                      placeholder="Nút thắt câu chuyện..."
                      rows={3}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab("library")}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    {saving && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Lưu thẻ vào kho</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveBulk} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tác giả mặc định</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tên Page mặc định</label>
                    <input
                      type="text"
                      value={pageName}
                      onChange={(e) => setPageName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ngôn ngữ</label>
                    <select
                      value={locale}
                      onChange={(e) => setLocale(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    >
                      {LOCALE_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Dán nội dung hàng loạt theo chuẩn === STORY 1 ===:
                  </label>
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={`=== STORY 1 ===
Tác giả: Emily Vance
Thời gian: 2h ago
Tên Page: Daily Confessions
Nội dung thẻ:
I adopted the little girl that twenty families had rejected alone...
Highlights: "You have time to think about this" | claiming her inheritance
Nút CTA: Read Continuation In Comments 👇
Caption: He left her in a hospital room...
Comment 1: PART 2: Greg smirked and handed me a certified birth certificate...

=== STORY 2 ===
...`}
                    rows={10}
                    className="w-full font-mono bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab("library")}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    {saving && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Nhập toàn bộ vào kho</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: LẤY THẺ CHO PAGE (PULL) */}
        {activeTab === "pull" && (
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Phân phối và Lấy thẻ cho Fanpage</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Bốc thẻ sẵn sàng (status: ready) khớp ngôn ngữ của page mục tiêu, thực hiện bằng giao dịch khoá chống trùng lặp (SQLite transaction).
              </p>
            </div>

            {pullError && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{pullError}</span>
              </div>
            )}

            {pullSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{pullSuccess}</span>
              </div>
            )}

            {/* Selection control */}
            <div className="p-5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">Chọn Page nhận thẻ:</label>
                  <select
                    value={selectedPageId}
                    onChange={(e) => {
                      setSelectedPageId(e.target.value);
                      setPullPreviewCards([]);
                    }}
                    className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    {pages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.locale.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">Số lượng thẻ cần bốc (N):</label>
                  <div className="flex items-center gap-2">
                    {[10, 20, 30, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setPullCount(num);
                          setPullPreviewCards([]);
                        }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          pullCount === num
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviewPull}
                    disabled={pullLoading}
                    className="flex-1 py-2 bg-white hover:bg-slate-50 border border-blue-300 text-blue-700 text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {pullLoading && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>1. Xem trước thẻ</span>
                  </button>
                  <button
                    onClick={handleCommitPull}
                    disabled={pullLoading || pullPreviewCards.length === 0}
                    className={`flex-1 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
                      pullPreviewCards.length > 0 ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-300 cursor-not-allowed"
                    }`}
                  >
                    <span>2. Giữ thẻ & Dựng</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Preview cards list */}
            {pullPreviewCards.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                  <span>Danh sách {pullPreviewCards.length} thẻ được chọn:</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Đủ điều kiện phân bổ
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-80 overflow-y-auto bg-slate-50/50">
                  {pullPreviewCards.map((c, i) => (
                    <div key={c.id} className="p-3 text-xs flex items-center justify-between gap-4 bg-white">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-400 text-[11px] w-6">#{i + 1}</span>
                        <div>
                          <div className="font-semibold text-slate-800 line-clamp-1">{c.content}</div>
                          <div className="text-[11px] text-slate-400">Tác giả: {c.author} · {c.locale.toUpperCase()}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        Sẵn sàng
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function CardsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">Đang tải Kho thẻ...</div>}>
      <CardsContent />
    </Suspense>
  );
}
