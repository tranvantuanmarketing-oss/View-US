"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Template } from "@/lib/types";
import { buildTemplateHtml } from "@/lib/templateRenderer";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  AlertTriangle,
  Sliders,
  Palette,
} from "lucide-react";

interface TemplateEditorModalProps {
  template: Template | null;
  paletteIndex: number;
  isPicked: boolean;
  locale: string;
  overrides: Record<string, any>;
  onClose: () => void;
  onUpdateOverrides: (newOverrides: Record<string, any>) => void;
  onTogglePick: (picked: boolean) => void;
  onPaletteChange: (palIndex: number) => void;
}

export function TemplateEditorModal({
  template,
  paletteIndex,
  isPicked,
  locale,
  overrides,
  onClose,
  onUpdateOverrides,
  onTogglePick,
  onPaletteChange,
}: TemplateEditorModalProps) {
  if (!template) return null;

  const currentPal = template.pals[paletteIndex % template.pals.length];
  const layerKeys = Object.keys(template.layers || {});
  const [selectedLayer, setSelectedLayer] = useState<string>(layerKeys[0] || "body");
  const [testOverflow, setTestOverflow] = useState<boolean>(false);

  // Active overrides for this template and current palette
  const fatherKey = template.id;
  const childKey = `${template.id}:${currentPal.id}`;

  const currentFatherOv = overrides[fatherKey] || {};
  const currentChildOv = overrides[childKey] || {};

  const layerOv = currentFatherOv[selectedLayer] || {};
  const colorsOv = currentChildOv._colors || {};

  // Long text sample for overflow check
  const overflowSample = useMemo(() => {
    if (!testOverflow) return undefined;
    return {
      name: "Jean-Christophe de la Tour-d'Auvergne",
      time: "Il y a 14 heures · Modifié",
      bodyLines: [
        "J'ai découvert un testament secret dissimulé sous les lattes du parquet de notre domaine ancestral.",
        "Mon oncle m'avait pourtant juré devant notaire qu'aucun document officiel n'avait été signé avant le décès.",
        "« Ne pose plus jamais de questions indiscrètes sur cet héritage », m'avait-il ordonné d'un ton glacial.",
        "Mais en inspectant minutieusement le sceau en cire rouge, j'ai reconnu l'empreinte de la bague de ma mère...",
        "Trois jours plus tard, la police judiciaire a frappé à la porte de sa villa au bord du lac Léman...",
      ],
      highlights: [
        "un testament secret dissimulé",
        "l'empreinte de la bague de ma mère...",
        "la police judiciaire a frappé",
      ],
    };
  }, [testOverflow]);

  const compiledHtml = useMemo(() => {
    return buildTemplateHtml(
      template,
      paletteIndex,
      locale,
      overrides,
      overflowSample
    );
  }, [template, paletteIndex, locale, overrides, overflowSample]);

  // Color slots to show
  const colorSlots: Array<{ key: string; label: string }> = [
    { key: "c1", label: "Màu 1 (Chính)" },
    { key: "c2", label: "Màu 2 (Phụ)" },
    { key: "c3", label: "Màu 3 (Nền/Khung)" },
    { key: "red", label: "Chữ đỏ nhấn" },
    { key: "hl", label: "Bôi vàng nhấn" },
    { key: "cta", label: "Chữ nút CTA" },
    { key: "ink", label: "Hoa văn nền" },
  ];

  function handleLayerValueChange(prop: string, val: number) {
    const updatedFather = {
      ...currentFatherOv,
      [selectedLayer]: {
        ...(currentFatherOv[selectedLayer] || {}),
        [prop]: val,
      },
    };
    onUpdateOverrides({
      ...overrides,
      [fatherKey]: updatedFather,
    });
  }

  function handleToggleLayerHidden() {
    const isHidden = !!layerOv.an;
    const updatedFather = {
      ...currentFatherOv,
      [selectedLayer]: {
        ...(currentFatherOv[selectedLayer] || {}),
        an: isHidden ? 0 : 1,
      },
    };
    onUpdateOverrides({
      ...overrides,
      [fatherKey]: updatedFather,
    });
  }

  function handleLayerColorChange(prop: "fg" | "bg", colorHex: string) {
    const updatedFather = {
      ...currentFatherOv,
      [selectedLayer]: {
        ...(currentFatherOv[selectedLayer] || {}),
        [prop]: colorHex,
      },
    };
    onUpdateOverrides({
      ...overrides,
      [fatherKey]: updatedFather,
    });
  }

  function handlePaletteColorChange(key: string, colorHex: string) {
    const updatedChild = {
      ...currentChildOv,
      _colors: {
        ...(currentChildOv._colors || {}),
        [key]: colorHex,
      },
    };
    onUpdateOverrides({
      ...overrides,
      [childKey]: updatedChild,
    });
  }

  function handleResetColors() {
    const nextOverrides = { ...overrides };
    delete nextOverrides[childKey];
    if (nextOverrides[fatherKey]?._colors) {
      delete nextOverrides[fatherKey]._colors;
    }
    onUpdateOverrides(nextOverrides);
  }

  function handleResetPositions() {
    const nextOverrides = { ...overrides };
    delete nextOverrides[fatherKey];
    onUpdateOverrides(nextOverrides);
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        onPaletteChange((paletteIndex - 1 + template!.pals.length) % template!.pals.length);
      }
      if (e.key === "ArrowRight") {
        onPaletteChange((paletteIndex + 1) % template!.pals.length);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paletteIndex, template, onClose, onPaletteChange]);

  const activeLayerDef = template.layers[selectedLayer] || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 animate-fadeIn">
      {/* Top Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between pb-2 border-b border-studio-border text-xs mb-3">
        <div className="flex items-center gap-3">
          <div className="font-bold text-sm text-white flex items-center gap-2">
            <span>{template.name}</span>
            <span className="font-mono text-xs text-amber-400 font-semibold">({template.id})</span>
          </div>

          <div className="flex items-center gap-1 bg-studio-card border border-studio-border rounded-lg px-2 py-1">
            <button
              onClick={() => onPaletteChange((paletteIndex - 1 + template.pals.length) % template.pals.length)}
              className="p-1 hover:text-white text-studio-muted"
              title="Bảng màu trước (Phím ←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs font-semibold px-2 text-studio-text">
              {currentPal.id} · {paletteIndex + 1}/{template.pals.length}
            </span>
            <button
              onClick={() => onPaletteChange((paletteIndex + 1) % template.pals.length)}
              className="p-1 hover:text-white text-studio-muted"
              title="Bảng màu tiếp (Phím →)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={isPicked}
              onChange={(e) => onTogglePick(e.target.checked)}
              className="w-4 h-4 rounded text-amber-400 bg-studio-card border-studio-border accent-amber-400"
            />
            <span className="text-xs font-medium text-studio-text">Chọn mẫu này cho Page</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTestOverflow(!testOverflow)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              testOverflow
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold"
                : "bg-studio-card border-studio-border text-studio-muted hover:text-white"
            }`}
            title="Thử nghiệm bài viết dài để kiểm tra độ co chữ và tràn viền"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {testOverflow ? "Đang bật: Soát chữ tràn" : "Bật soát chữ tràn"}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-studio-card hover:bg-studio-border text-studio-muted hover:text-white transition-colors"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Editor Content Body: Preview on Left, Controls on Right */}
      <div className="w-full max-w-6xl flex-1 flex gap-4 overflow-hidden min-h-[500px]">
        {/* Left: 9:16 Canvas Stage */}
        <div className="flex-1 bg-studio-card rounded-2xl border border-studio-border p-4 flex items-center justify-center overflow-hidden relative">
          <div
            className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-studio-border"
            style={{
              width: "360px",
              height: "640px", // 720 * 0.5, 1280 * 0.5
            }}
          >
            <iframe
              srcDoc={compiledHtml}
              title={template.name}
              className="absolute left-0 top-0 border-0 pointer-events-none select-none"
              style={{
                width: "720px",
                height: "1280px",
                transform: "scale(0.5)",
                transformOrigin: "0 0",
              }}
            />
          </div>

          <div className="absolute bottom-3 left-4 text-[11px] text-studio-dim">
            Tỉ lệ thực: 720×1280 chuẩn thiết kế · Render thực tế Playwright: 1080×1920 Full HD
          </div>
        </div>

        {/* Right: Inspector Tabs & Controls */}
        <div className="w-96 bg-studio-card rounded-2xl border border-studio-border p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Layer Selector */}
          <div>
            <div className="text-[11px] font-bold text-studio-dim uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" /> Các lớp thiết kế
              </span>
              <button
                onClick={handleResetPositions}
                className="text-[10px] text-studio-muted hover:text-amber-400 flex items-center gap-1"
                title="Khôi phục vị trí mặc định"
              >
                <RotateCcw className="w-3 h-3" /> Reset vị trí
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {layerKeys.map((k) => {
                const def = template.layers[k] || {};
                const isHidden = !!currentFatherOv[k]?.an;
                const isSelected = selectedLayer === k;

                return (
                  <button
                    key={k}
                    onClick={() => setSelectedLayer(k)}
                    className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between border transition-all ${
                      isSelected
                        ? "bg-amber-400/15 border-amber-400 text-amber-300 font-bold"
                        : "bg-studio-bg border-studio-border text-studio-muted hover:text-white"
                    } ${isHidden ? "opacity-50 line-through" : ""}`}
                  >
                    <span className="truncate">{def.label || k}</span>
                    {isHidden && <span className="text-[9px] text-red-400">Ẩn</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Layer Settings */}
          <div className="p-3 bg-studio-bg rounded-xl border border-studio-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                Chỉnh lớp: <span className="text-amber-400">{activeLayerDef.label || selectedLayer}</span>
              </span>
              <button
                onClick={handleToggleLayerHidden}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 border ${
                  layerOv.an
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                }`}
              >
                {layerOv.an ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {layerOv.an ? "Hiện lại" : "Ẩn lớp này"}
              </button>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex flex-col gap-1">
                <span className="text-studio-dim text-[10.5px]">Toạ độ X (px)</span>
                <input
                  type="number"
                  value={layerOv.x !== undefined ? layerOv.x : activeLayerDef.x ?? 0}
                  onChange={(e) => handleLayerValueChange("x", parseInt(e.target.value) || 0)}
                  className="bg-studio-card border border-studio-border rounded-lg px-2 py-1 text-white font-mono text-xs focus:border-amber-400 outline-none"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-studio-dim text-[10.5px]">Toạ độ Y (px)</span>
                <input
                  type="number"
                  value={layerOv.y !== undefined ? layerOv.y : activeLayerDef.y ?? 0}
                  onChange={(e) => handleLayerValueChange("y", parseInt(e.target.value) || 0)}
                  className="bg-studio-card border border-studio-border rounded-lg px-2 py-1 text-white font-mono text-xs focus:border-amber-400 outline-none"
                />
              </label>

              {activeLayerDef.size !== undefined && (
                <label className="flex flex-col gap-1">
                  <span className="text-studio-dim text-[10.5px]">Cỡ (size)</span>
                  <input
                    type="number"
                    value={layerOv.size !== undefined ? layerOv.size : activeLayerDef.size ?? 0}
                    onChange={(e) => handleLayerValueChange("size", parseInt(e.target.value) || 0)}
                    className="bg-studio-card border border-studio-border rounded-lg px-2 py-1 text-white font-mono text-xs focus:border-amber-400 outline-none"
                  />
                </label>
              )}

              {activeLayerDef.scale !== undefined && (
                <label className="flex flex-col gap-1">
                  <span className="text-studio-dim text-[10.5px]">Tỉ lệ (scale)</span>
                  <input
                    type="number"
                    step="0.05"
                    value={layerOv.scale !== undefined ? layerOv.scale : activeLayerDef.scale ?? 1}
                    onChange={(e) => handleLayerValueChange("scale", parseFloat(e.target.value) || 1)}
                    className="bg-studio-card border border-studio-border rounded-lg px-2 py-1 text-white font-mono text-xs focus:border-amber-400 outline-none"
                  />
                </label>
              )}
            </div>

            {/* Layer Colors (fg / bg) */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-studio-border/50">
              <label className="flex items-center justify-between text-xs">
                <span className="text-studio-dim text-[11px]">Màu chữ lớp</span>
                <input
                  type="color"
                  value={layerOv.fg || "#ffffff"}
                  onChange={(e) => handleLayerColorChange("fg", e.target.value)}
                  className="w-7 h-7 rounded border border-studio-border cursor-pointer bg-transparent"
                />
              </label>

              <label className="flex items-center justify-between text-xs">
                <span className="text-studio-dim text-[11px]">Màu nền lớp</span>
                <input
                  type="color"
                  value={layerOv.bg || "#000000"}
                  onChange={(e) => handleLayerColorChange("bg", e.target.value)}
                  className="w-7 h-7 rounded border border-studio-border cursor-pointer bg-transparent"
                />
              </label>
            </div>
          </div>

          {/* Palette Color Slots */}
          <div>
            <div className="text-[11px] font-bold text-studio-dim uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" /> Bảng màu ({currentPal.id})
              </span>
              <button
                onClick={handleResetColors}
                className="text-[10px] text-studio-muted hover:text-amber-400 flex items-center gap-1"
                title="Khôi phục bảng màu mặc định"
              >
                <RotateCcw className="w-3 h-3" /> Reset màu
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-studio-bg p-3 rounded-xl border border-studio-border">
              {colorSlots.map((slot) => {
                const currentColor = colorsOv[slot.key] || "#ffffff";
                return (
                  <label key={slot.key} className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-studio-text truncate mr-1">{slot.label}</span>
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => handlePaletteColorChange(slot.key, e.target.value)}
                      className="w-6 h-6 rounded border border-studio-border cursor-pointer bg-transparent"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
