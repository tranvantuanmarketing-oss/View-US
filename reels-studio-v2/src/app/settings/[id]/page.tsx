"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Template,
  Avatar,
  MusicTrack,
  Page,
  PageSettings,
  Gender,
  Mood,
} from "@/lib/types";
import { TemplateCard } from "@/components/TemplateCard";
import { TemplateEditorModal } from "@/components/TemplateEditorModal";
import { AvatarCard } from "@/components/AvatarCard";
import { MusicPlayer } from "@/components/MusicPlayer";
import { StickyActionBar } from "@/components/StickyActionBar";
import {
  ChevronLeft,
  LayoutGrid,
  Users,
  Music,
  Search,
  Sparkles,
  Upload,
  Plus,
  Sliders,
  Check,
  CheckSquare,
  Square,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function PageSettingsWorkspace() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;

  // Data states
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Reference libraries
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [allAvatars, setAllAvatars] = useState<Avatar[]>([]);
  const [allTracks, setAllTracks] = useState<MusicTrack[]>([]);
  const [groupNames, setGroupNames] = useState<Record<string, string>>({});

  // Local working copy of settings
  const [initialSettings, setInitialSettings] = useState<PageSettings | null>(null);
  const [workingSettings, setWorkingSettings] = useState<PageSettings>({
    templates: [],
    avatar_ids: [],
    music_mood: "tram",
    selected_track_ids: [],
    background_categories: ["hoa", "rung"],
    overrides: {},
  });

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // F16 Display Name state
  const [displayName, setDisplayName] = useState("");
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  // Template Tab States
  const [templateSearch, setTemplateSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [cardWidth, setCardWidth] = useState<number>(200); // 160, 200, 240
  const [activePaletteMap, setActivePaletteMap] = useState<Record<string, number>>({});
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Avatar Tab States
  const [avatarFilter, setAvatarFilter] = useState<"all" | "nu" | "nam" | "no_demographic">("all");
  const [avatarSearch, setAvatarSearch] = useState("");
  const [isAiFilling, setIsAiFilling] = useState(false);

  // Music Tab States
  const [musicSearch, setMusicSearch] = useState("");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const presetFileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [assetError, setAssetError] = useState("");

  // Load initial page and resources
  useEffect(() => {
    async function initData() {
      setLoading(true);
      try {
        const [pageRes, tplRes, avRes, musicRes] = await Promise.all([
          fetch(`/api/pages/${pageId}`),
          fetch("/api/templates"),
          fetch(`/api/avatars?page_id=${encodeURIComponent(pageId)}`),
          fetch("/api/music"),
        ]);

        const [pageJson, tplJson, avJson, musicJson] = await Promise.all([
          pageRes.json(),
          tplRes.json(),
          avRes.json(),
          musicRes.json(),
        ]);

        if (pageJson.success && pageJson.data) {
          setPage(pageJson.data);
          setDisplayName(pageJson.data.display_name || "");
          setInitialDisplayName(pageJson.data.display_name || "");
          const st = pageJson.data.settings || {};
          const fullSettings: PageSettings = {
            templates: st.templates || [],
            avatar_ids: st.avatar_ids || [],
            music_mood: st.music_mood || "tram",
            selected_track_ids: st.selected_track_ids || [],
            background_categories: st.background_categories || ["hoa", "rung"],
            overrides: st.overrides || {},
          };
          setInitialSettings(fullSettings);
          setWorkingSettings(fullSettings);
        }

        if (tplJson.success && tplJson.data) {
          setAllTemplates(tplJson.data);
          if (tplJson.groups) setGroupNames(tplJson.groups);
        }

        if (avJson.success && avJson.data) {
          setAllAvatars(avJson.data);
        }

        if (musicJson.success && musicJson.data) {
          setAllTracks(musicJson.data);
        }
      } catch (err) {
        console.error("Lỗi nạp dữ liệu workspace", err);
      } finally {
        setLoading(false);
      }
    }

    if (pageId) {
      initData();
    }
  }, [pageId]);

  // Audio preview playback handler
  function handlePlayAudioToggle(track: MusicTrack) {
    if (playingTrackId === track.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(track.file_path);
      audioRef.current = audio;
      audio.play().catch((err) => console.log("Audio play error", err));
      audio.onended = () => setPlayingTrackId(null);
      setPlayingTrackId(track.id);
    }
  }

  // Detect differences between working copy and initial settings
  const hasChanges = useMemo(() => {
    if (!initialSettings) return false;
    return JSON.stringify(initialSettings) !== JSON.stringify(workingSettings);
  }, [initialSettings, workingSettings]);

  // Save Settings to Backend API
  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workingSettings),
      });
      const json = await res.json();
      if (json.success) {
        setInitialSettings(workingSettings);
      } else {
        alert(json.error || "Lỗi lưu cài đặt.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối khi lưu cài đặt.");
    } finally {
      setIsSaving(false);
    }
  }

  // F16: Save display_name to Backend API
  async function handleSaveDisplayName() {
    setIsSavingName(true);
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName }),
      });
      const json = await res.json();
      if (json.success) {
        setInitialDisplayName(displayName);
        setPage((prev) => (prev ? { ...prev, display_name: displayName } : null));
      } else {
        alert(json.error || "Lỗi lưu tên hiển thị.");
      }
    } catch (err) {
      alert("Lỗi kết nối khi cập nhật tên hiển thị.");
    } finally {
      setIsSavingName(false);
    }
  }

  // F19: Export Preset JSON
  function handleExportPreset() {
    if (!page) return;
    const presetData = {
      schemaVersion: "1.0",
      page_id: page.id,
      page_name: page.name,
      display_name: displayName || page.name,
      locale: page.locale,
      exported_at: new Date().toISOString(),
      settings: workingSettings,
    };
    const blob = new Blob([JSON.stringify(presetData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preset_${page.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // F19: Import Preset JSON safely without eval
  function handleImportPreset(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.settings || typeof parsed.settings !== "object") {
          alert("File JSON không hợp lệ: Thiếu đối tượng 'settings'.");
          return;
        }
        const st = parsed.settings;
        const newSettings: PageSettings = {
          templates: Array.isArray(st.templates) ? st.templates : [],
          avatar_ids: Array.isArray(st.avatar_ids) ? st.avatar_ids : [],
          music_mood: typeof st.music_mood === "string" ? st.music_mood : "tram",
          selected_track_ids: Array.isArray(st.selected_track_ids) ? st.selected_track_ids : [],
          background_categories: Array.isArray(st.background_categories)
            ? st.background_categories
            : ["hoa", "rung"],
          overrides: typeof st.overrides === "object" ? st.overrides : {},
        };
        setWorkingSettings(newSettings);
        if (parsed.display_name) {
          setDisplayName(parsed.display_name);
        }
        alert(
          `Đã nạp thành công Preset (F19) với ${newSettings.templates.length} mẫu và ${newSettings.avatar_ids.length} avatar.`
        );
      } catch (err: any) {
        alert("Lỗi đọc file JSON preset: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // Undo changes
  function handleUndo() {
    if (initialSettings) {
      setWorkingSettings(JSON.parse(JSON.stringify(initialSettings)));
    }
  }

  // Group templates by their family (ho)
  const groupedTemplates = useMemo(() => {
    const map = new Map<string, Template[]>();
    for (const t of allTemplates) {
      const g = t.group || "le";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(t);
    }
    return map;
  }, [allTemplates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      const matchSearch =
        !templateSearch ||
        t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        t.id.toLowerCase().includes(templateSearch.toLowerCase());
      const matchGroup = !selectedGroup || t.group === selectedGroup;
      return matchSearch && matchGroup;
    });
  }, [allTemplates, templateSearch, selectedGroup]);

  // Step 1: Template selection handlers
  function toggleTemplatePick(templateId: string, picked: boolean) {
    const existing = [...workingSettings.templates];
    const idx = existing.findIndex((t) => t.template_id === templateId);

    if (picked && idx === -1) {
      const tObj = allTemplates.find((t) => t.id === templateId);
      existing.push({
        template_id: templateId,
        palette_ids: tObj ? tObj.pals.map((p) => p.id) : [],
      });
    } else if (!picked && idx !== -1) {
      existing.splice(idx, 1);
    }

    setWorkingSettings({ ...workingSettings, templates: existing });
  }

  function toggleAllInGroup(groupId: string, selectAll: boolean) {
    const tplsInGroup = allTemplates.filter((t) => t.group === groupId);
    const existing = [...workingSettings.templates];

    for (const t of tplsInGroup) {
      const idx = existing.findIndex((item) => item.template_id === t.id);
      if (selectAll && idx === -1) {
        existing.push({
          template_id: t.id,
          palette_ids: t.pals.map((p) => p.id),
        });
      } else if (!selectAll && idx !== -1) {
        existing.splice(idx, 1);
      }
    }

    setWorkingSettings({ ...workingSettings, templates: existing });
  }

  // Step 2: Avatar selection & management handlers
  function toggleAvatarSelection(avatarId: string, isSelected: boolean) {
    let ids = [...workingSettings.avatar_ids];
    if (isSelected && !ids.includes(avatarId)) {
      ids.push(avatarId);
    } else if (!isSelected) {
      ids = ids.filter((id) => id !== avatarId);
    }
    setWorkingSettings({ ...workingSettings, avatar_ids: ids });
  }

  function handleSelectAllAvatars(selectAll: boolean) {
    const ids = selectAll ? allAvatars.map((a) => a.id) : [];
    setWorkingSettings({ ...workingSettings, avatar_ids: ids });
  }

  async function handleUpdateAvatarMeta(avatarId: string, updates: Partial<Avatar>) {
    // Optimistic local update
    setAllAvatars((prev) =>
      prev.map((a) => (a.id === avatarId ? { ...a, ...updates } : a))
    );
    try {
      await fetch(`/api/avatars/${avatarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("Lỗi cập nhật avatar", err);
    }
  }

  async function handleTriggerAiFill() {
    if (!page) return;
    setIsAiFilling(true);
    try {
      const res = await fetch("/api/avatars/auto-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale: page.locale,
          avatar_ids: workingSettings.avatar_ids,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        // Update local list
        const updatedMap = new Map(json.data.map((a: Avatar) => [a.id, a]));
        setAllAvatars((prev) =>
          prev.map((a) => (updatedMap.has(a.id) ? (updatedMap.get(a.id) as Avatar) : a))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiFilling(false);
    }
  }

  // Demographic bucket counters for Step 2
  const demographicStats = useMemo(() => {
    const selectedAvatars = allAvatars.filter((a) =>
      workingSettings.avatar_ids.includes(a.id)
    );

    const buckets = {
      nu: { "20-34": 0, "35-49": 0, "50-64": 0, "65+": 0 },
      nam: { "20-34": 0, "35-49": 0, "50-64": 0, "65+": 0 },
    };

    for (const a of selectedAvatars) {
      const g = a.gender === "nam" ? "nam" : "nu";
      const mid = (a.age_min + a.age_max) / 2;
      if (mid < 35) buckets[g]["20-34"]++;
      else if (mid < 50) buckets[g]["35-49"]++;
      else if (mid < 65) buckets[g]["50-64"]++;
      else buckets[g]["65+"]++;
    }

    return buckets;
  }, [allAvatars, workingSettings.avatar_ids]);

  // Step 3: Music selection handlers
  function handleSelectMood(mood: Mood) {
    if (mood !== workingSettings.music_mood) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    }
    setWorkingSettings({ ...workingSettings, music_mood: mood });
  }

  const visibleTracks = allTracks.filter(
    (track) => track.mood === workingSettings.music_mood
  );

  function toggleMusicTrackSelection(trackId: string, isSelected: boolean) {
    let ids = [...(workingSettings.selected_track_ids || [])];
    if (isSelected && !ids.includes(trackId)) {
      ids.push(trackId);
    } else if (!isSelected) {
      ids = ids.filter((id) => id !== trackId);
    }
    setWorkingSettings({ ...workingSettings, selected_track_ids: ids });
  }

  async function deleteAsset(kind:"avatar" | "music", id:string) {
    if(!window.confirm(kind === "avatar" ? "Xóa ảnh này khỏi kho?" : "Xóa bài nhạc khỏi kho chung?")) return;
    const json = await (await fetch("/api/assets",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,id})})).json();
    if(!json.success) {setAssetError(json.error); return;}
    if(kind === "avatar") {setAllAvatars(prev=>prev.filter(a=>a.id!==id));setWorkingSettings(prev=>({...prev,avatar_ids:prev.avatar_ids.filter(x=>x!==id)}));}
    else {setAllTracks(prev=>prev.filter(t=>t.id!==id));setWorkingSettings(prev=>({...prev,selected_track_ids:prev.selected_track_ids?.filter(x=>x!==id)}));}
  }

  async function uploadFiles(files: FileList | null, kind: "avatar" | "music") {
    if (!files?.length) return;
    setUploadingAsset(true); setAssetError("");
    try {
      for (const file of Array.from(files)) {
        const form = new FormData(); form.append("file", file); form.append("kind", kind);
        form.append("name", file.name.replace(/\.[^.]+$/, ""));
        if (kind === "avatar") form.append("page_id", pageId);
        else form.append("mood", workingSettings.music_mood);
        const json = await (await fetch("/api/assets", {method:"POST", body:form})).json();
        if (!json.success) throw new Error(json.error || "Không tải được file");
        if (kind === "avatar") {
          setAllAvatars(prev => [...prev, json.data]);
          setWorkingSettings(prev => ({...prev, avatar_ids:[...prev.avatar_ids, json.data.id]}));
        } else setAllTracks(prev => [...prev, json.data]);
      }
    } catch (e:any) { setAssetError(e.message); }
    finally { setUploadingAsset(false); }
  }

  if (loading || !page) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-studio-muted text-xs">
        Đang nạp cấu hình Page...
      </div>
    );
  }

  const selectedTemplatesCount = workingSettings.templates.length;
  const selectedPalettesTotal = workingSettings.templates.reduce(
    (acc, t) => acc + (t.palette_ids?.length || 0),
    0
  );

  return (
    <div className="flex-1 flex flex-col pb-24 bg-slate-50 min-h-screen">
      {/* Top Breadcrumb & Step Navigation */}
      <div className="bg-white border-b border-blue-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="p-2 rounded-xl bg-white border border-blue-200 hover:border-blue-500 text-blue-700 hover:bg-blue-50 transition-colors shadow-2xs"
            title="Quay lại danh sách Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-blue-900 tracking-tight">
                {page.name}
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                {page.locale}
              </span>
            </div>
            <p className="text-[11px] text-blue-700/80">
              Cài đặt cấu hình hiển thị và âm nhạc cho các đợt dựng video Reels
            </p>
          </div>
        </div>

        {/* 3 Steps Pills */}
        <div className="flex items-center bg-blue-50/70 border border-blue-200 rounded-xl p-1 gap-1 text-xs">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeStep === 1
                ? "bg-blue-600 text-white shadow-xs"
                : "text-blue-900 hover:bg-blue-100/80"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>1 Mẫu ({selectedTemplatesCount})</span>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeStep === 2
                ? "bg-blue-600 text-white shadow-xs"
                : "text-blue-900 hover:bg-blue-100/80"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2 Avatar ({workingSettings.avatar_ids.length})</span>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeStep === 3
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>3 Gu nhạc</span>
          </button>
        </div>

        {/* F19: Preset Import / Export */}
        <div className="flex items-center gap-2">
          <input
            ref={presetFileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportPreset}
          />
          <button
            onClick={() => presetFileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Nhập Preset JSON cấu hình (F19)"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Nhập Preset</span>
          </button>
          <button
            onClick={handleExportPreset}
            className="px-3 py-1.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Xuất Preset JSON cấu hình (F19)"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Xuất Preset</span>
          </button>
        </div>
      </div>

      {/* F16: Tên Page hiển thị trên Video */}
      <div className="bg-blue-50/60 border-b border-blue-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-blue-900 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            Tên hiển thị trên Video (F16):
          </span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={page.name}
            className="px-3 py-1 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-2xs"
          />
          {displayName !== initialDisplayName && (
            <button
              onClick={handleSaveDisplayName}
              disabled={isSavingName}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              {isSavingName ? "Đang lưu..." : "Lưu tên hiển thị"}
            </button>
          )}
        </div>
        <span className="text-[11px] text-blue-700/80">
          Tên riêng biệt in lên video thay cho tên quản lý. Mặc định: <strong>{page.name}</strong>
        </span>
      </div>

      {/* ======================================================================= */}
      {/* STEP 1: MẪU (Template Library with live previews, editor, groups)       */}
      {/* ======================================================================= */}
      {activeStep === 1 && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Groups & Filters */}
          <aside className="w-64 flex-none border-r border-slate-200 bg-white p-4 space-y-4 overflow-y-auto">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Tìm kiếm mẫu
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, họ mẫu..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Preview Size Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Cỡ xem trước
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                {[
                  { label: "Nhỏ", w: 160 },
                  { label: "Vừa", w: 200 },
                  { label: "To", w: 240 },
                ].map((sz) => (
                  <button
                    key={sz.label}
                    onClick={() => setCardWidth(sz.w)}
                    className={`py-1 rounded-lg font-bold text-[11px] transition-all ${
                      cardWidth === sz.w
                        ? "bg-white text-blue-700 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Family Groups with counts */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Họ bố cục ({allTemplates.length} mẫu)</span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setSelectedGroup("")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedGroup === ""
                      ? "bg-blue-50 border border-blue-200 text-blue-700 font-bold shadow-2xs"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>Tất cả bố cục</span>
                  <span className="text-[10px] font-mono opacity-80">{allTemplates.length}</span>
                </button>

                {Array.from(groupedTemplates.entries()).map(([gKey, tpls]) => {
                  const gName = groupNames[gKey] || gKey;
                  const isSelected = selectedGroup === gKey;
                  return (
                    <button
                      key={gKey}
                      onClick={() => setSelectedGroup(gKey)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-blue-50 border border-blue-200 text-blue-700 font-bold shadow-2xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{gName}</span>
                      <span className="text-[10px] font-mono opacity-80 ml-1">
                        {tpls.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary Note */}
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-1">
              <div className="font-bold text-blue-900">Đã chọn:</div>
              <div className="text-slate-800 font-semibold">
                {selectedTemplatesCount} mẫu ({selectedPalettesTotal} bảng màu)
              </div>
              <div className="text-[10.5px] text-slate-500 leading-relaxed">
                Video được sinh ra sẽ tự động xoay vòng qua các mẫu và bảng màu đã chọn.
              </div>
            </div>
          </aside>

          {/* Right Area: Template Grid with Section Headers */}
          <main className="flex-1 p-6 overflow-y-auto space-y-8 bg-slate-50">
            {selectedGroup === "" ? (
              // Grouped Sections
              Array.from(groupedTemplates.entries()).map(([gKey, tplsInGroup]) => {
                const gName = groupNames[gKey] || gKey;
                const pickedInGroup = tplsInGroup.filter((t) =>
                  workingSettings.templates.some((item) => item.template_id === t.id)
                ).length;
                const allPicked = pickedInGroup === tplsInGroup.length;

                return (
                  <section key={gKey} className="space-y-3">
                    {/* Section Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{gName}</h3>
                        <span className="text-xs text-slate-500 font-mono">
                          ({pickedInGroup}/{tplsInGroup.length} mẫu)
                        </span>
                      </div>

                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-600 hover:text-slate-900 select-none">
                        <input
                          type="checkbox"
                          checked={allPicked}
                          onChange={(e) => toggleAllInGroup(gKey, e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 accent-blue-600"
                        />
                        <span>Chọn cả họ mẫu</span>
                      </label>
                    </div>

                    {/* Cards Grid */}
                    <div className="flex flex-wrap gap-4">
                      {tplsInGroup.map((tpl, idx) => {
                        const isPicked = workingSettings.templates.some(
                          (item) => item.template_id === tpl.id
                        );
                        const palIdx = activePaletteMap[tpl.id] || 0;

                        return (
                          <TemplateCard
                            key={tpl.id}
                            template={tpl}
                            index={idx}
                            paletteIndex={palIdx}
                            isPicked={isPicked}
                            locale={page.locale}
                            overrides={workingSettings.overrides}
                            cardWidth={cardWidth}
                            onTogglePick={(picked) => toggleTemplatePick(tpl.id, picked)}
                            onPaletteChange={(newIdx) =>
                              setActivePaletteMap({ ...activePaletteMap, [tpl.id]: newIdx })
                            }
                            onOpenEditor={() => setEditingTemplate(tpl)}
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })
            ) : (
              // Single Group View
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">
                      {groupNames[selectedGroup] || selectedGroup}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      ({filteredTemplates.length} mẫu)
                    </span>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-600 hover:text-slate-900 select-none">
                    <input
                      type="checkbox"
                      checked={
                        filteredTemplates.length > 0 &&
                        filteredTemplates.every((t) =>
                          workingSettings.templates.some((item) => item.template_id === t.id)
                        )
                      }
                      onChange={(e) => toggleAllInGroup(selectedGroup, e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 accent-blue-600"
                    />
                    <span>Chọn tất cả trong nhóm</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-4">
                  {filteredTemplates.map((tpl, idx) => {
                    const isPicked = workingSettings.templates.some(
                      (item) => item.template_id === tpl.id
                    );
                    const palIdx = activePaletteMap[tpl.id] || 0;

                    return (
                      <TemplateCard
                        key={tpl.id}
                        template={tpl}
                        index={idx}
                        paletteIndex={palIdx}
                        isPicked={isPicked}
                        locale={page.locale}
                        overrides={workingSettings.overrides}
                        cardWidth={cardWidth}
                        onTogglePick={(picked) => toggleTemplatePick(tpl.id, picked)}
                        onPaletteChange={(newIdx) =>
                          setActivePaletteMap({ ...activePaletteMap, [tpl.id]: newIdx })
                        }
                        onOpenEditor={() => setEditingTemplate(tpl)}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </main>
        </div>
      )}

      {/* ======================================================================= */}
      {/* STEP 2: AVATAR (Face library, gender/age demographics, AI autofill)     */}
      {/* ======================================================================= */}
      {activeStep === 2 && (
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="font-bold">Ảnh riêng của {page.name}</h3><p className="text-xs text-slate-500">Ảnh tải lên chỉ thuộc page này. Bấm Lưu cấu hình sau khi chọn.</p></div>
            <label className={`px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold ${uploadingAsset ? "opacity-50" : "cursor-pointer"}`}>
              {uploadingAsset ? "Đang tải…" : "Tải ảnh lên"}
              <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.webp" multiple disabled={uploadingAsset} onChange={e => {void uploadFiles(e.target.files,"avatar"); e.target.value="";}} />
            </label>
          </div>
          {assetError && <p role="alert" className="text-sm text-red-600">{assetError}</p>}
          {/* Demographic Buckets Overview Bar */}
          <div className="bg-white rounded-2xl border border-blue-200/80 p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" /> Phân bổ nhân khẩu người kể (Page {page.name})
                </h3>
                <p className="text-xs text-slate-500">
                  Quy tắc tự khớp: Khi dựng video, hệ thống đọc gợi ý giới tính & tuổi của người kể từ thẻ truyện để khớp tự động gương mặt phù hợp nhất.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTriggerAiFill}
                  disabled={isAiFilling}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                  title="Tự động sinh tên bản địa và phân phối độ tuổi đồng đều"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiFilling ? "Đang điền AI..." : "Nhờ AI điền tên, giới, tuổi"}</span>
                </button>
              </div>
            </div>

            {/* Age Brackets Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500">Thanh niên (20–34)</div>
                <div className="flex items-center gap-3 mt-1 font-mono">
                  <span className="text-pink-600 font-semibold">{demographicStats.nu["20-34"]} Nữ</span>
                  <span className="text-blue-600 font-semibold">{demographicStats.nam["20-34"]} Nam</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500">Trưởng thành (35–49)</div>
                <div className="flex items-center gap-3 mt-1 font-mono">
                  <span className="text-pink-600 font-semibold">{demographicStats.nu["35-49"]} Nữ</span>
                  <span className="text-blue-600 font-semibold">{demographicStats.nam["35-49"]} Nam</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500">Trung niên (50–64)</div>
                <div className="flex items-center gap-3 mt-1 font-mono">
                  <span className="text-pink-600 font-semibold">{demographicStats.nu["50-64"]} Nữ</span>
                  <span className="text-blue-600 font-semibold">{demographicStats.nam["50-64"]} Nam</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500">Cao niên (65+)</div>
                <div className="flex items-center gap-3 mt-1 font-mono">
                  <span className="text-pink-600 font-semibold">{demographicStats.nu["65+"]} Nữ</span>
                  <span className="text-blue-600 font-semibold">{demographicStats.nam["65+"]} Nam</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {[
                { id: "all", label: `Tất cả (${allAvatars.length})` },
                { id: "nu", label: `Nữ (${allAvatars.filter((a) => a.gender === "nu").length})` },
                { id: "nam", label: `Nam (${allAvatars.filter((a) => a.gender === "nam").length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAvatarFilter(f.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    avatarFilter === f.id
                      ? "bg-blue-600 text-white border-blue-600 font-bold shadow-2xs"
                      : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <button
                onClick={() => handleSelectAllAvatars(workingSettings.avatar_ids.length !== allAvatars.length)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-blue-300 flex items-center gap-1.5 shadow-2xs"
              >
                {workingSettings.avatar_ids.length === allAvatars.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm nhân vật..."
                value={avatarSearch}
                onChange={(e) => setAvatarSearch(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Avatar Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {allAvatars
              .filter((av) => {
                if (avatarFilter === "nu" && av.gender !== "nu") return false;
                if (avatarFilter === "nam" && av.gender !== "nam") return false;
                if (avatarSearch && !av.name.toLowerCase().includes(avatarSearch.toLowerCase())) {
                  return false;
                }
                return true;
              })
              .map((av) => {
                const isSelected = workingSettings.avatar_ids.includes(av.id);
                return (
                  <AvatarCard
                    key={av.id}
                    avatar={av}
                    isSelectedForPage={isSelected}
                    currentPageId={page.id}
                    onToggleSelect={(picked) => toggleAvatarSelection(av.id, picked)}
                    onUpdate={(updates) => handleUpdateAvatarMeta(av.id, updates)}
                    onDelete={() => void deleteAsset("avatar",av.id)}
                  />
                );
              })}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* STEP 3: GU NHẠC (Mood presets, track playlist, audio preview)            */}
      {/* ======================================================================= */}
      {activeStep === 3 && (
        <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto">
          {/* Mood Presets Selection */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Music className="w-4 h-4 text-blue-600" /> Chọn Gu Âm Nhạc Cho Page
            </h3>
            <p className="text-xs text-slate-500">
              Chọn phong cách âm thanh chủ đạo. Các bài trong gu sẽ được xoay vòng tự động khi ghép với video.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                {
                  id: "tram" as Mood,
                  name: "Gu trầm",
                  desc: "Truyện bi kịch, phản bội, hồi hộp, kịch tính sâu sắc",
                  badge: "bg-purple-50 text-purple-700 border-purple-200",
                },
                {
                  id: "nhe-nhang" as Mood,
                  name: "Nhẹ nhàng",
                  desc: "Truyện lắng đọng, tình cảm gia đình, chữa lành tâm hồn",
                  badge: "bg-sky-50 text-sky-700 border-sky-200",
                },
                {
                  id: "tuoi-sang" as Mood,
                  name: "Tươi sáng / Gu vui",
                  desc: "Truyện có hậu, công lý được thực thi, kết thúc ấm áp",
                  badge: "bg-amber-50 text-amber-700 border-amber-200",
                },
              ].map((moodItem) => {
                const isCurrent = workingSettings.music_mood === moodItem.id;
                return (
                  <div
                    key={moodItem.id}
                    onClick={() => handleSelectMood(moodItem.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      isCurrent
                        ? "bg-blue-50/70 border-blue-500 ring-2 ring-blue-100 shadow-sm"
                        : "bg-white border-blue-200/80 hover:border-blue-400 shadow-2xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-slate-900">{moodItem.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${moodItem.badge}`}>
                          {moodItem.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{moodItem.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className={`font-semibold ${isCurrent ? "text-blue-700" : "text-slate-400"}`}>
                        {isCurrent ? "Đang áp dụng" : "Bấm để chọn"}
                      </span>
                      {isCurrent && <Check className="w-4 h-4 text-blue-600 font-bold" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advanced Playlist Library */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Nhạc thuộc gu đã chọn ({visibleTracks.length} bài)</h4>
                <p className="text-xs text-slate-500">
                  {workingSettings.selected_track_ids && workingSettings.selected_track_ids.length > 0
                    ? `Đang chọn ${workingSettings.selected_track_ids.length} track chỉ định riêng cho page này.`
                    : "Mặc định: Sử dụng toàn bộ track thuộc gu đã chọn ở trên."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => document.getElementById("page-music-upload")?.click()}
                  disabled={uploadingAsset}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{uploadingAsset ? "Đang tải…" : "Tải nhạc lên (kho chung)"}</span>
                </button>
              </div>
            </div>

            <input id="page-music-upload" className="hidden" type="file" accept=".mp3,.m4a,.mp4,.wav" multiple disabled={uploadingAsset} onChange={e => {void uploadFiles(e.target.files,"music"); e.target.value="";}} />
            <p className="text-xs text-slate-500">Nhạc dùng chung cho mọi page; file mới được xếp vào gu đang chọn. Tối đa 30 MB/file.</p>
            {assetError && <p role="alert" className="text-sm text-red-600">{assetError}</p>}
            {/* Tracks List with HTML5 Audio Preview */}
            <div className="space-y-2">
              {visibleTracks.length === 0 && (
                <p className="rounded-xl border border-dashed border-blue-200 p-4 text-sm text-slate-500">
                  Chưa có bài nhạc thuộc gu này. Bấm “Thêm track” để thêm nhạc.
                </p>
              )}
              {visibleTracks.map((track) => {
                const isSelected =
                  workingSettings.selected_track_ids?.includes(track.id) ?? false;
                const isPlaying = playingTrackId === track.id;

                return (
                  <div key={track.id} className="space-y-1">
                  <MusicPlayer
                    track={track}
                    isSelected={isSelected}
                    isPlaying={isPlaying}
                    onPlayToggle={() => handlePlayAudioToggle(track)}
                    onToggleSelect={(checked) => toggleMusicTrackSelection(track.id, checked)}
                  />
                  <button type="button" className="text-xs font-semibold text-red-700 hover:underline" onClick={()=>void deleteAsset("music",track.id)}>Xóa khỏi kho nhạc chung</button>
                  </div>
                );
              })}
            </div>
          </div>


        </div>
      )}

      {/* Visual Template Editor Modal */}
      {editingTemplate && (
        <TemplateEditorModal
          template={editingTemplate}
          paletteIndex={activePaletteMap[editingTemplate.id] || 0}
          isPicked={workingSettings.templates.some((t) => t.template_id === editingTemplate.id)}
          locale={page.locale}
          overrides={workingSettings.overrides || {}}
          onClose={() => setEditingTemplate(null)}
          onUpdateOverrides={(newOv) => setWorkingSettings({ ...workingSettings, overrides: newOv })}
          onTogglePick={(picked) => toggleTemplatePick(editingTemplate.id, picked)}
          onPaletteChange={(newIdx) =>
            setActivePaletteMap({ ...activePaletteMap, [editingTemplate.id]: newIdx })
          }
        />
      )}

      {/* Sticky Bottom Action Bar */}
      <StickyActionBar
        hasChanges={hasChanges}
        isSaving={isSaving}
        onUndo={handleUndo}
        onSave={handleSave}
        summaryText={`Page: ${page.name} (${page.locale.toUpperCase()}) · ${selectedTemplatesCount} mẫu · ${workingSettings.avatar_ids.length} avatar`}
      />
    </div>
  );
}
