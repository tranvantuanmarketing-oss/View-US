"use client";

import React, { useState, useEffect } from "react";
import { Template } from "@/lib/types";
import { buildTemplateHtml } from "@/lib/templateRenderer";
import { Edit3, Check, ChevronLeft, ChevronRight } from "lucide-react";

interface TemplateCardProps {
  template: Template;
  index: number;
  paletteIndex: number;
  isPicked: boolean;
  onTogglePick: (picked: boolean) => void;
  onPaletteChange: (palIndex: number) => void;
  onOpenEditor: () => void;
  locale: string;
  overrides?: Record<string, any>;
  cardWidth?: number; // e.g. 200
}

export function TemplateCard({
  template,
  index,
  paletteIndex,
  isPicked,
  onTogglePick,
  onPaletteChange,
  onOpenEditor,
  locale,
  overrides = {},
  cardWidth = 200,
}: TemplateCardProps) {
  const cardHeight = Math.round((cardWidth * 1280) / 720);
  const scale = cardWidth / 720;
  const currentPal = template.pals[paletteIndex % template.pals.length];

  const [srcDoc, setSrcDoc] = useState<string>("");

  useEffect(() => {
    // Generate compiled HTML with real engine styles and locale
    const html = buildTemplateHtml(
      template,
      paletteIndex,
      locale,
      overrides
    );
    setSrcDoc(html);
  }, [template, paletteIndex, locale, overrides]);

  const hasCustomEdits =
    !!overrides[template.id] ||
    template.pals.some((p) => !!overrides[`${template.id}:${p.id}`]);

  function handlePrevPal(e: React.MouseEvent) {
    e.stopPropagation();
    const newIdx = (paletteIndex - 1 + template.pals.length) % template.pals.length;
    onPaletteChange(newIdx);
  }

  function handleNextPal(e: React.MouseEvent) {
    e.stopPropagation();
    const newIdx = (paletteIndex + 1) % template.pals.length;
    onPaletteChange(newIdx);
  }

  return (
    <article
      className={`group relative rounded-xl border transition-all duration-200 flex flex-col overflow-hidden bg-white ${
        isPicked
          ? "border-blue-500 ring-2 ring-blue-100 shadow-md"
          : "border-blue-200/80 hover:border-blue-400 shadow-2xs"
      }`}
      style={{ width: `${cardWidth}px` }}
    >
      {/* 9:16 Stage */}
      <div
        className="relative bg-slate-900 overflow-hidden cursor-pointer"
        style={{ width: `${cardWidth}px`, height: `${cardHeight}px` }}
        onClick={onOpenEditor}
        title="Bấm để mở trình chỉnh sửa lớp và màu sắc"
      >
        <iframe
          srcDoc={srcDoc}
          title={template.name}
          className="absolute left-0 top-0 border-0 pointer-events-none select-none"
          style={{
            width: "720px",
            height: "1280px",
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
          }}
          loading="lazy"
        />

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-slate-900 text-[11px] font-bold px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1.5 shadow-md">
            <Edit3 className="w-3 h-3 text-blue-600" /> Sửa mẫu
          </span>
        </div>

        {hasCustomEdits && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-sm">
            ✎ ĐÃ CHỈNH TAY
          </div>
        )}
      </div>

      {/* Meta Footer */}
      <div className="p-2.5 flex flex-col gap-1.5 bg-white text-xs">
        <div className="flex items-start justify-between gap-1">
          <div className="font-bold text-[12px] leading-snug line-clamp-1 text-slate-900">
            <span className="text-blue-600 mr-1">#{String(index + 1).padStart(2, "0")}</span>
            {template.name}
          </div>
        </div>

        <div className="text-[10.5px] text-slate-500 flex items-center justify-between">
          <span className="truncate max-w-[110px] font-mono">{template.id}</span>
          <span className="font-medium">{template.duration}s</span>
        </div>

        {/* Tags */}
        {template.nhan && template.nhan.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {template.nhan.slice(0, 2).map((tag, tIdx) => (
              <span
                key={tIdx}
                className="text-[9.5px] px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Palette Switcher */}
        <div className="flex items-center justify-between bg-slate-50 rounded-lg border border-slate-200 p-1 mt-1 text-[11px]">
          <button
            type="button"
            onClick={handlePrevPal}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600"
            title="Bảng màu trước"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[10.5px] text-slate-800 truncate px-1 text-center font-bold">
            {currentPal.id} · {paletteIndex + 1}/{template.pals.length}
          </span>
          <button
            type="button"
            onClick={handleNextPal}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600"
            title="Bảng màu tiếp"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pick Checkbox */}
        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPicked}
              onChange={(e) => onTogglePick(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
            />
            <span className={`text-[11px] ${isPicked ? "text-blue-700 font-bold" : "text-slate-700"}`}>
              {isPicked ? "Đã chọn" : "Chọn mẫu này"}
            </span>
          </label>

          <button
            type="button"
            onClick={onOpenEditor}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors"
          >
            <Edit3 className="w-3 h-3" /> Sửa
          </button>
        </div>
      </div>
    </article>
  );
}
