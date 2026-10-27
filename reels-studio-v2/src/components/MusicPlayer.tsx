"use client";

import React, { useState, useRef } from "react";
import { MusicTrack } from "@/lib/types";
import { Play, Pause, Music, Volume2 } from "lucide-react";

interface MusicPlayerProps {
  track: MusicTrack;
  isSelected: boolean;
  onToggleSelect: (selected: boolean) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

export function MusicPlayer({
  track,
  isSelected,
  onToggleSelect,
  isPlaying,
  onPlayToggle,
}: MusicPlayerProps) {
  const moodLabels: Record<string, { label: string; color: string }> = {
    tram: { label: "Gu trầm", color: "bg-purple-50 text-purple-700 border-purple-200" },
    vui: { label: "Gu vui", color: "bg-amber-50 text-amber-700 border-amber-200" },
    "tuoi-sang": { label: "Tươi sáng", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    "nhe-nhang": { label: "Nhẹ nhàng", color: "bg-sky-50 text-sky-700 border-sky-200" },
  };

  const moodBadge = moodLabels[track.mood] || {
    label: track.mood,
    color: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div
      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all bg-white ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/20 shadow-xs"
          : "border-blue-200/80 hover:border-blue-300 shadow-2xs"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={onPlayToggle}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isPlaying
              ? "bg-blue-600 text-white shadow-xs scale-105"
              : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
          }`}
          title={isPlaying ? "Tạm dừng" : "Nghe thử"}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
        </button>

        {/* Info */}
        <div>
          <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
            <span>{track.title}</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full border font-semibold ${moodBadge.color}`}>
              {moodBadge.label}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
            <span>{track.duration_sec}s</span>
            <span>·</span>
            <span className="truncate max-w-[200px] text-slate-400">{track.file_path}</span>
          </div>
        </div>
      </div>

      {/* Select checkbox */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          {isSelected ? "Đã bật" : "Bỏ chọn"}
        </span>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onToggleSelect(e.target.checked)}
          className="w-4 h-4 rounded text-blue-600 border-slate-300 accent-blue-600 cursor-pointer"
        />
      </label>
    </div>
  );
}
