"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileCode,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  PlaySquare,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { BatchItem } from "@/lib/types";

interface BatchDetail {
  id: string;
  name: string;
  page_id: string;
  page_name?: string;
  locale?: string;
  owner_staff_id: string;
  status: string;
  total_items: number;
  completed_items: number;
  failed_items: number;
  target_helper_id?: string;
  created_at: string;
  finished_at?: string;
}

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;

  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchBatchDetail();
  }, [batchId]);

  async function fetchBatchDetail() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/batches/${batchId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setBatch(json.data.batch);
        setItems(json.data.items || []);
      } else {
        setError(json.error || "Không thể tải chi tiết lô video.");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkCompleted() {
    setUpdatingStatus(true);
    try {
      const res=await fetch(`/api/batches/${batchId}/render`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"retry"})});
      const json = await res.json();
      if (json.success) {
        fetchBatchDetail();
      } else {
        alert(json.error || "Lỗi cập nhật.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center gap-2 text-xs text-slate-500">
        <RotateCw className="w-4 h-4 animate-spin text-blue-600" />
        <span>Đang tải chi tiết lô video...</span>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-red-200 rounded-2xl p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">{error || "Không tìm thấy lô video"}</h2>
          <Link
            href="/batches"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách lô</span>
          </Link>
        </div>
      </div>
    );
  }

  const completed = batch.completed_items ?? 0;
  const total = batch.total_items ?? items.length;
  const percent = Math.min(100, Math.round((completed / (total || 1)) * 100));
  const isDone = batch.status === "completed" || percent >= 100;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link
            href="/batches"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Danh sách lô</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBatchDetail}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:border-blue-400 text-xs font-semibold shadow-2xs"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Làm mới</span>
            </button>
            <a
              href={`/api/batches/${batch.id}/export`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-2xs"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600" />
              <span>Xuất JSON</span>
            </a>
            <a
              href={`/api/batches/${batch.id}/download`}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải trọn bộ ZIP</span>
            </a>
          </div>
        </div>

        {/* Batch Summary Card */}
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl font-bold text-slate-900">{batch.name}</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  {batch.locale}
                </span>
                {isDone ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã hoàn tất</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span>Đang kết xuất ({percent}%)</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Mã lô: <span className="font-mono text-slate-700">{batch.id}</span> · Page: <span className="font-semibold text-slate-800">{batch.page_name}</span> · Tạo lúc: {new Date(batch.created_at).toLocaleString("vi-VN")}
              </p>
            </div>

            {!isDone && (
              <button
                onClick={handleMarkCompleted}
                disabled={updatingStatus}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors"
              >
                Dựng / Tiếp tục / Thử lại mục lỗi
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold">Tiến độ dựng video: {completed} / {total} video hoàn tất</span>
              <span className="font-bold text-blue-700">{percent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isDone ? "bg-emerald-500" : "bg-blue-600"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Video Items List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Danh sách video trong lô ({items.length} mục)
            </h2>
            <span className="text-xs text-slate-500">
              Mỗi mục gồm kịch bản, thẻ video 9:16, Caption và Bình luận ghim
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => {
              const payload = typeof item.story_payload === "string" ? JSON.parse(item.story_payload) : item.story_payload;
              const isItemDone = item.status === "completed";

              return (
                <div
                  key={item.id}
                  className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                        #{item.seq}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{payload.title || `Câu chuyện #${item.seq}`}</div>
                        <div className="text-[11px] text-slate-500">
                          Tác giả: {payload.author} · Template: <span className="font-mono text-blue-600">{item.template_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isItemDone
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : item.status === "failed"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Story Content & Highlights */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono">
                    {payload.content}
                  </div>

                  {/* Caption & Comment Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                        <span>Caption bài viết (The Bridge):</span>
                        <button
                          onClick={() => handleCopy(payload.caption || "", `cap_${item.id}`)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          {copiedId === `cap_${item.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === `cap_${item.id}` ? "Đã chép" : "Chép"}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-700 line-clamp-2">{payload.caption || "Chưa có caption"}</p>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                        <span>Comment 1 (The Twist):</span>
                        <button
                          onClick={() => handleCopy(payload.comment1 || "", `comm_${item.id}`)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          {copiedId === `comm_${item.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === `comm_${item.id}` ? "Đã chép" : "Chép"}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-700 line-clamp-2">{payload.comment1 || "Chưa có bình luận 1"}</p>
                    </div>
                  </div>

                  {/* Video Output preview if rendered */}
                  {item.output_video_url && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>File video MP4 sẵn sàng tải</span>
                      </span>
                      <a
                        href={`/api/batches/${batch.id}/download?item=${encodeURIComponent(item.id)}&format=mp4`}
                        download
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Tải MP4</span>
                      </a>
                      <a href={`/api/batches/${batch.id}/download?item=${encodeURIComponent(item.id)}&format=txt`} className="px-3 py-1 rounded-lg border border-blue-500 text-blue-800 text-xs font-bold">Tải TXT caption & bình luận</a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
