"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Film,
  Download,
  PlaySquare,
  RotateCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Plus,
  Layers,
  FileText,
  Trash2,
} from "lucide-react";
import { Batch } from "@/lib/types";

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  async function deleteBatch(batch:Batch) {
    if(!confirm(`Xóa lịch sử lô "${batch.name}"? File MP4 trên đĩa vẫn được giữ.`)) return;
    const response=await fetch(`/api/batches/${batch.id}`,{method:"DELETE"});const json=await response.json();
    if(!response.ok) alert(json.error);else fetchBatches();
  }
  async function fetchBatches() {
    setLoading(true);
    try {
      const res = await fetch("/api/batches");
      const json = await res.json();
      if (json.success && json.data) {
        setBatches(json.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách lô video", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2.5">
              <span>Lô video (Video Batches)</span>
            </h1>
            <p className="text-xs text-blue-700/80 mt-1">
              Theo dõi tiến độ kết xuất, tải file mp4 và caption của các lô video theo thời gian thực
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBatches}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:border-blue-400 text-xs font-semibold shadow-2xs transition-all"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Làm mới</span>
            </button>
            <Link
              href="/render"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo lô video mới</span>
            </Link>
          </div>
        </div>

        {/* Batches Table Card */}
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-xs space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
              <RotateCw className="w-4 h-4 animate-spin text-blue-500" />
              <span>Đang tải danh sách lô video...</span>
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Layers className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800">Chưa có lô video nào</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Dữ liệu rỗng trong cơ sở dữ liệu SQLite. Hãy tạo lô mới từ Dựng video hoặc Kho thẻ.
              </p>
              <div className="pt-2">
                <Link
                  href="/render"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo lô video ngay</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-blue-200 text-blue-900 text-[11px] font-bold uppercase tracking-wider bg-blue-50/60">
                    <th className="py-3 px-3">Mã Lô</th>
                    <th className="py-3 px-3">Tên Lô Video</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3">Tiến độ</th>
                    <th className="py-3 px-3">Thời gian</th>
                    <th className="py-3 px-3 text-right">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {batches.map((batch) => {
                    const completed = batch.completed_items ?? batch.done_count ?? 0;
                    const total = batch.total_items ?? batch.count ?? 1;
                    const percent = Math.min(100, Math.round((completed / (total || 1)) * 100));
                    const isDone = batch.status === "completed" || batch.status === "done" || percent >= 100;

                    return (
                      <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Mã Lô */}
                        <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                          {batch.id.slice(0, 16)}
                        </td>

                        {/* Tên Lô */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900">{batch.name}</div>
                          <div className="text-[11px] text-slate-400">Page ID: {batch.page_id}</div>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3.5 px-3">
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Đã xong</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                              <span>Đang dựng</span>
                            </span>
                          )}
                        </td>

                        {/* Tiến độ */}
                        <td className="py-3.5 px-3 min-w-[140px]">
                          <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                            <span>{completed} / {total} video</span>
                            <span className="font-bold text-slate-800">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isDone ? "bg-emerald-500" : "bg-blue-600"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </td>



                        {/* Thời gian */}
                        <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                          {new Date(batch.created_at).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </td>

                        {/* Tác vụ */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`/api/batches/${batch.id}/download`}
                              className="p-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-700 rounded-lg transition-colors inline-block"
                              title="Tải video hoặc manifest của lô"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <Link
                              href={`/batches/${batch.id}`}
                              className="p-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-700 rounded-lg transition-colors inline-block"
                              title="Chi tiết lô video"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button onClick={()=>deleteBatch(batch)} title="Xóa lịch sử lô (giữ file)" className="rounded-lg border border-red-200 p-1.5 text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
