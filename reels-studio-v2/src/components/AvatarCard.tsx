"use client";

import React from "react";
import { Avatar, Gender } from "@/lib/types";
import { X, AlertCircle } from "lucide-react";

interface AvatarCardProps {
  avatar: Avatar;
  isSelectedForPage: boolean;
  currentPageId: string;
  onToggleSelect: (selected: boolean) => void;
  onUpdate: (updates: Partial<Avatar>) => void;
  onDelete?: () => void;
}

export function AvatarCard({
  avatar,
  isSelectedForPage,
  currentPageId,
  onToggleSelect,
  onUpdate,
  onDelete,
}: AvatarCardProps) {
  // Check if used by other pages
  const otherPages = avatar.used_by_page_ids?.filter((id) => id !== currentPageId) || [];
  const isUsedElsewhere = otherPages.length > 0;

  return (
    <div
      className={`rounded-2xl border p-2.5 flex flex-col gap-2 transition-all bg-white ${
        isSelectedForPage
          ? "border-blue-500 ring-2 ring-blue-100 shadow-sm"
          : "border-slate-200 hover:border-blue-300 shadow-2xs"
      }`}
    >
      {/* Top Image + Checkbox + Remove */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
        <img
          src={avatar.image_path}
          alt={avatar.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Checkbox select */}
        <label className="absolute top-2 left-2 cursor-pointer bg-white/90 rounded-md p-1 backdrop-blur-xs border border-slate-200 flex items-center justify-center shadow-xs">
          <input
            type="checkbox"
            checked={isSelectedForPage}
            onChange={(e) => onToggleSelect(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 accent-blue-600 cursor-pointer"
          />
        </label>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/60 hover:bg-red-500 text-white flex items-center justify-center transition-colors backdrop-blur-xs"
            title="Xoá avatar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Warning if also used in other pages */}
        {isUsedElsewhere && (
          <div className="absolute bottom-2 left-2 right-2 bg-amber-500 text-slate-950 font-bold text-[9.5px] px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 shadow-xs">
            <AlertCircle className="w-3 h-3 flex-none" />
            <span className="truncate">Cũng dùng ở {otherPages.length} page khác</span>
          </div>
        )}
      </div>

      {/* Inputs: Name, Gender, Age Range */}
      <div className="space-y-1.5 text-xs">
        <input
          type="text"
          value={avatar.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Tên nhân vật..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 font-bold text-xs focus:border-blue-500 focus:bg-white outline-none"
        />

        <div className="flex items-center gap-1.5">
          {/* Gender Toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 flex-1">
            <button
              type="button"
              onClick={() => onUpdate({ gender: "nu" })}
              className={`flex-1 py-0.5 text-[10.5px] font-bold rounded ${
                avatar.gender === "nu"
                  ? "bg-pink-100 text-pink-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Nữ
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ gender: "nam" })}
              className={`flex-1 py-0.5 text-[10.5px] font-bold rounded ${
                avatar.gender === "nam"
                  ? "bg-blue-100 text-blue-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Nam
            </button>
          </div>

          {/* Age range */}
          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-mono bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
            <input
              type="number"
              value={avatar.age_min}
              onChange={(e) => onUpdate({ age_min: parseInt(e.target.value) || 20 })}
              className="w-7 bg-transparent text-slate-900 font-bold text-center outline-none"
            />
            <span>-</span>
            <input
              type="number"
              value={avatar.age_max}
              onChange={(e) => onUpdate({ age_max: parseInt(e.target.value) || 60 })}
              className="w-7 bg-transparent text-slate-900 font-bold text-center outline-none"
            />
            <span className="text-[10px] text-slate-400">tuổi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
