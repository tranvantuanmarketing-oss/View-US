"use client";

import React from "react";
import { Save, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

interface StickyActionBarProps {
  hasChanges: boolean;
  isSaving: boolean;
  onUndo: () => void;
  onSave: () => void;
  summaryText?: string;
}

export function StickyActionBar({
  hasChanges,
  isSaving,
  onUndo,
  onSave,
  summaryText,
}: StickyActionBarProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md px-6 py-3 flex items-center justify-between shadow-xl border-t border-blue-200">
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border ${
            hasChanges
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {hasChanges ? (
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>{hasChanges ? "Có thay đổi chưa lưu" : "Đã đồng bộ"}</span>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          {summaryText ? (
            <span className="font-semibold text-slate-800">{summaryText} · </span>
          ) : null}
          <span>Chỉ áp dụng cho lô dựng mới, video đã lập giữ nguyên.</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onUndo}
          disabled={!hasChanges || isSaving}
          className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Hoàn tác</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save className="w-3.5 h-3.5 fill-current" />
          <span>{isSaving ? "Đang lưu..." : "Lưu cài đặt"}</span>
        </button>
      </div>
    </footer>
  );
}
