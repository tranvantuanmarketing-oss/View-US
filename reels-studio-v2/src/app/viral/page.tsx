"use client";

import React, { useState, useEffect } from "react";
import { LOCALE_OPTIONS } from "@/lib/locales";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Filter,
  Search,
  MessageCircle,
  Share2,
  ThumbsUp,
  ExternalLink,
  Copy,
  Check,
  X,
  PlaySquare,
  Sparkles,
  Plus,
  RotateCw,
  Layers,
  ArrowUpDown,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ViralPost {
  id: string;
  source: string;
  page_name: string;
  page_followers: number;
  locale: string;
  post_type: string;
  published_at: string;
  comments_count: number;
  reactions_count: number;
  shares_count: number;
  caption: string;
  image_url: string | null;
  post_url: string;
  has_website_link: boolean;
}

interface WritingJob {
  id: string;
  source_post_id: string;
  source_page?: string;
  source_caption?: string;
  source_url?: string;
  target_locale: string;
  status: "pending" | "writing" | "completed" | "failed";
  attempt_count: number;
  max_attempts: number;
  error?: string;
  created_at: string;
}

export default function ViralLibraryPage() {
  const router = useRouter();

  // Active view: "discover" (Khám phá bài) | "rewrite_monitor" (Theo dõi viết lại)
  const [activeView, setActiveView] = useState<"discover" | "rewrite_monitor">("discover");

  // Filters state
  const [localeFilter, setLocaleFilter] = useState("all");
  const [postTypeFilter, setPostTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("comments_count");
  const [minComments, setMinComments] = useState(0);
  const [hasLinkOnly, setHasLinkOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Posts state
  const [posts, setPosts] = useState<ViralPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Selected posts for bulk action
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [targetLocales, setTargetLocales] = useState<string[]>(["en"]);
  const [queueing, setQueueing] = useState(false);
  const [queueSuccess, setQueueSuccess] = useState("");

  // Drawer detail state
  const [selectedPost, setSelectedPost] = useState<ViralPost | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Writing jobs state (View 2)
  const [writingJobs, setWritingJobs] = useState<WritingJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    if (activeView === "discover") {
      fetchViralPosts();
    } else {
      fetchWritingJobs();
    }
  }, [activeView, localeFilter, postTypeFilter, sortBy, minComments, hasLinkOnly, searchQuery]);

  async function fetchViralPosts() {
    setLoadingPosts(true);
    try {
      const params = new URLSearchParams();
      if (localeFilter !== "all") params.set("locale", localeFilter);
      if (postTypeFilter !== "all") params.set("postType", postTypeFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (sortBy) params.set("sortBy", sortBy);
      if (minComments > 0) params.set("minComments", String(minComments));
      if (hasLinkOnly) params.set("hasLink", "1");
      params.set("limit", "50");

      const res = await fetch(`/api/viral?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setPosts(json.data.posts || []);
        setTotalCount(json.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Lỗi lấy bài viral", err);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function fetchWritingJobs() {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/writing-jobs");
      const json = await res.json();
      if (json.success && json.data) {
        setWritingJobs(json.data);
      }
    } catch (err) {
      console.error("Lỗi lấy writing jobs", err);
    } finally {
      setLoadingJobs(false);
    }
  }

  async function handleQueueRewrite() {
    if (selectedPostIds.length === 0) return;
    setQueueing(true);
    setQueueSuccess("");
    try {
      const res = await fetch("/api/viral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "queue_rewrite",
          postIds: selectedPostIds,
          targetLocales,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setQueueSuccess(`Đã thêm ${json.queuedJobs} job viết lại vào hàng chờ (đã lọc trùng lặp)!`);
        setSelectedPostIds([]);
        setTimeout(() => {
          setShowQueueModal(false);
          setQueueSuccess("");
          setActiveView("rewrite_monitor");
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQueueing(false);
    }
  }

  async function handleRetryJob(jobId: string) {
    try {
      const res = await fetch("/api/writing-jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, action: "retry" }),
      });
      const json = await res.json();
      if (json.success) {
        fetchWritingJobs();
      }
    } catch (err) {
      console.error(err);
    }
  }

  function toggleSelectPost(id: string) {
    if (selectedPostIds.includes(id)) {
      setSelectedPostIds(selectedPostIds.filter((p) => p !== id));
    } else {
      setSelectedPostIds([...selectedPostIds, id]);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 1500);
  }

  function handleSendToStudio(caption: string, pageName: string) {
    router.push(`/render?prefill=${encodeURIComponent(caption)}&author=${encodeURIComponent(pageName)}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xs flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-blue-900 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Kho Viral & Hàng Chờ Viết Lại (Viral Content Hub)</span>
            </h1>
            <p className="text-xs text-blue-700/80 mt-0.5">
              Khám phá bài đăng viral trên các fanpage đối thủ và điều phối viết lại kịch bản theo từng locale
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
            <button
              onClick={() => setActiveView("discover")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === "discover" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1. Khám phá bài ({totalCount})
            </button>
            <button
              onClick={() => setActiveView("rewrite_monitor")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === "rewrite_monitor" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              2. Theo dõi viết lại ({writingJobs.length})
            </button>
          </div>
        </div>

        {/* VIEW 1: KHÁM PHÁ BÀI */}
        {activeView === "discover" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm theo nội dung, tên page..."
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 w-64"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>

                  <select
                    value={localeFilter}
                    onChange={(e) => setLocaleFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  >
                    <option value="all">Tất cả ngôn ngữ</option>
                    {LOCALE_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                  </select>

                  <select
                    value={postTypeFilter}
                    onChange={(e) => setPostTypeFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  >
                    <option value="all">Tất cả định dạng</option>
                    <option value="bai-viet">Bài viết</option>
                    <option value="anh">Hình ảnh</option>
                    <option value="video">Video</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  >
                    <option value="comments_count">Nhiều bình luận nhất</option>
                    <option value="reactions_count">Nhiều tương tác nhất</option>
                    <option value="shares_count">Nhiều chia sẻ nhất</option>
                    <option value="published_at">Mới đăng gần đây</option>
                  </select>

                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasLinkOnly}
                      onChange={(e) => setHasLinkOnly(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>Có link website</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchViralPosts}
                    className="p-1.5 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-slate-600 transition-colors"
                    title="Làm mới"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  {selectedPostIds.length > 0 && (
                    <button
                      onClick={() => setShowQueueModal(true)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      Thêm {selectedPostIds.length} bài vào hàng chờ viết lại
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            {loadingPosts ? (
              <div className="bg-white border border-blue-200 rounded-2xl p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-blue-500" />
                <span>Đang tải kho bài viral...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white border-2 border-blue-200 rounded-2xl p-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-sm font-bold text-slate-800">Không có bài viral nào khớp bộ lọc</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Dữ liệu thực từ SQLite WAL. Thử nới lỏng bộ lọc tìm kiếm hoặc quét thêm từ Fanpage Radar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => {
                  const isSelected = selectedPostIds.includes(post.id);
                  return (
                    <div
                      key={post.id}
                      className={`bg-white border rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3 transition-all ${
                        isSelected ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Top meta & selection checkbox */}
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectPost(post.id)}
                              className="rounded text-blue-600"
                            />
                            <span className="font-bold text-xs text-slate-900">{post.page_name}</span>
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                            {post.locale}
                          </span>
                        </div>

                        {/* Caption preview */}
                        <p
                          onClick={() => setSelectedPost(post)}
                          className="text-xs text-slate-800 line-clamp-4 leading-relaxed cursor-pointer hover:text-blue-900"
                        >
                          {post.caption}
                        </p>

                        {/* Metrics Bar */}
                        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 pt-1">
                          <span className="flex items-center gap-1 text-blue-700">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{post.comments_count.toLocaleString("vi-VN")}</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{post.reactions_count.toLocaleString("vi-VN")}</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Share2 className="w-3.5 h-3.5" />
                            <span>{post.shares_count.toLocaleString("vi-VN")}</span>
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="text-slate-600 hover:text-blue-600 font-semibold"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => handleSendToStudio(post.caption, post.page_name)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold transition-colors"
                        >
                          <PlaySquare className="w-3 h-3" />
                          <span>Dựng Reels</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: THEO DÕI VIẾT LẠI */}
        {activeView === "rewrite_monitor" && (
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Tiến độ Hàng Chờ Viết Lại Kịch Bản</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tách biệt hoàn toàn hàng đợi của Writer với hàng đợi Render video
                </p>
              </div>
              <button
                onClick={fetchWritingJobs}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:border-blue-400 text-xs font-semibold shadow-2xs"
              >
                <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Làm mới tiến độ</span>
              </button>
            </div>

            {loadingJobs ? (
              <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-blue-500" />
                <span>Đang tải danh sách job viết lại...</span>
              </div>
            ) : writingJobs.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-700">Chưa có job viết lại nào trong hàng chờ</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Chọn các bài viral từ tab "Khám phá bài" và bấm "Thêm vào hàng chờ viết lại" để khởi động chu trình.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-blue-200 text-blue-900 text-[11px] font-bold uppercase tracking-wider bg-blue-50/60">
                      <th className="py-3 px-3">Mã Job</th>
                      <th className="py-3 px-3">Page Nguồn</th>
                      <th className="py-3 px-3">Nội dung nguồn</th>
                      <th className="py-3 px-3">Locale Đích</th>
                      <th className="py-3 px-3">Trạng thái</th>
                      <th className="py-3 px-3">Lần thử</th>
                      <th className="py-3 px-3 text-right">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {writingJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">{job.id.slice(0, 14)}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{job.source_page || "Facebook"}</td>
                        <td className="py-3 px-3 max-w-xs truncate text-slate-700">{job.source_caption || "Bài viết gốc"}</td>
                        <td className="py-3 px-3 uppercase font-bold text-blue-700">{job.target_locale}</td>
                        <td className="py-3 px-3">
                          {job.status === "completed" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Hoàn tất</span>
                            </span>
                          ) : job.status === "failed" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              <AlertCircle className="w-3 h-3" />
                              <span>Lỗi</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                              <span>Đang viết</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {job.attempt_count} / {job.max_attempts}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {job.status === "failed" ? (
                            <button
                              onClick={() => handleRetryJob(job.id)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold"
                            >
                              Thử lại
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal Thêm vào hàng chờ viết lại */}
        {showQueueModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Thêm {selectedPostIds.length} bài vào Hàng Chờ Viết Lại
              </h2>
              <p className="text-xs text-slate-600">
                Hệ thống sẽ tạo các writing job tương ứng theo từng ngôn ngữ mục tiêu được chọn và tự động loại bỏ các bài trùng lặp.
              </p>

              {queueSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
                  {queueSuccess}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700">Chọn ngôn ngữ đích:</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "en", label: "🇺🇸 Tiếng Anh (EN)" },
                    { id: "fr", label: "🇫🇷 Tiếng Pháp (FR)" },
                    { id: "nl", label: "🇳🇱 Tiếng Hà Lan (NL)" },
                    { id: "es", label: "🇪🇸 Tiếng Tây Ban Nha (ES)" },
                  ].map((loc) => {
                    const checked = targetLocales.includes(loc.id);
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          if (checked) {
                            if (targetLocales.length > 1) setTargetLocales(targetLocales.filter((l) => l !== loc.id));
                          } else {
                            setTargetLocales([...targetLocales, loc.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          checked ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-300"
                        }`}
                      >
                        {loc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQueueModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  onClick={handleQueueRewrite}
                  disabled={queueing}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  {queueing && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Xác nhận thêm vào hàng chờ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Drawer */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
            <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{selectedPost.page_name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {selectedPost.locale}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-center">
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold">Bình luận</div>
                  <div className="text-sm font-bold text-blue-700">{selectedPost.comments_count.toLocaleString("vi-VN")}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold">Tương tác</div>
                  <div className="text-sm font-bold text-slate-800">{selectedPost.reactions_count.toLocaleString("vi-VN")}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold">Chia sẻ</div>
                  <div className="text-sm font-bold text-slate-800">{selectedPost.shares_count.toLocaleString("vi-VN")}</div>
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Toàn bộ nội dung bài đăng:</span>
                  <button
                    onClick={() => handleCopy(selectedPost.caption)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCaption ? "Đã chép" : "Chép nội dung"}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {selectedPost.caption}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <a
                  href={selectedPost.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-white border border-slate-300 hover:border-blue-400 text-slate-700 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở bài gốc Facebook</span>
                </a>
                <button
                  onClick={() => {
                    handleSendToStudio(selectedPost.caption, selectedPost.page_name);
                    setSelectedPost(null);
                  }}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <PlaySquare className="w-3.5 h-3.5" />
                  <span>Dựng video ngay</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
