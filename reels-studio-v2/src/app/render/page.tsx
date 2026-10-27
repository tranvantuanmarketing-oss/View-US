"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PlaySquare,
  Sparkles,
  FileText,
  Copy,
  Download,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Layers,
  Settings,
  HelpCircle,
  Eye,
  RefreshCw,
  FolderDown,
  Info,
  X,
  Upload,
  Trash2,
  Edit3,
  Volume2,
  VolumeX,
  Maximize2,
  AlertTriangle,
  Plus,
  Play,
  Pause,
  Loader2,
} from "lucide-react";
import { Template, Avatar, Page, MusicTrack } from "@/lib/types";
import { AssetLibrary } from "@/components/AssetLibrary";
import { VideoPreview } from "@/components/VideoPreview";
import { pageTrackPool, pageVideoDefaults, pageMusicPlan } from "@/lib/studioPageConfig";
import { parseStories, serializeStories, readStoryFile } from "@/lib/storyImport";
import { buildTemplateHtml } from "@/lib/templateRenderer";
import { LOCALE_OPTIONS, normalizeLocale, detectStoryLocale, resolveStoryLocale } from "@/lib/locales";

interface StoryItem {
  locale?: string;
  id: string;
  index: number;
  author: string;
  pageName: string;
  timeAgo: string;
  title: string;
  content: string;
  highlights: string[];
  cta: string;
  caption: string;
  comment1: string;
  link?: string;
  selected: boolean;
  // Per-story template assignments
  templateId?: string;
  paletteIndex?: number;
  avatarId?: string;
  isOverridden?: boolean;
}

function RenderStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: "page" (Theo cài đặt page) | "single" (Khóa 1 mẫu cho cả lô) | "custom_per_video" (Tùy chỉnh riêng từng video)
  const [templateMode, setTemplateMode] = useState<"page" | "single" | "custom_per_video">("page");

  const [backgrounds,setBackgrounds]=useState<any[]>([]);
  async function refreshAssets(){const r=await fetch("/api/assets");const j=await r.json();if(j.success){setAllAvatars(j.data.avatars);setAllTracks(j.data.music);setBackgrounds(j.data.backgrounds);}}
  useEffect(()=>{refreshAssets();},[]);
  // Reference data
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [allAvatars, setAllAvatars] = useState<Avatar[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [allTracks, setAllTracks] = useState<MusicTrack[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>("free");
  const [selectedLocale, setSelectedLocale] = useState<string>("en");

  // Single mode global template & palette
  const [globalTemplateId, setGlobalTemplateId] = useState<string>("the-trang-hong");
  const [globalPaletteIndex, setGlobalPaletteIndex] = useState<number>(0);

  // Video settings
  const [targetVideoCount, setTargetVideoCount] = useState<number>(1);
  const [enableVariants, setEnableVariants] = useState<boolean>(false);
  const [variantsPerStory, setVariantsPerStory] = useState<number>(1);
  const [durationSec, setDurationSec] = useState<number>(15);
  const [resolution, setResolution] = useState<string>("1080x1920");
  const [fps, setFps] = useState<number>(30);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [musicSeed, setMusicSeed] = useState(1);
  const [batchNotice,setBatchNotice] = useState("");
  const [loadingPages,setLoadingPages] = useState(true);
  const [audioVolume, setAudioVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [backgroundVideo, setBackgroundVideo] = useState<string>("/assets/backgrounds/2.mp4");

  // Script text input & stories
  const [scriptText, setScriptText] = useState<string>("");
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [appendImport,setAppendImport] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  // Modals & Preview states
  const [showFullscreenPreview, setShowFullscreenPreview] = useState<boolean>(false);
  const [editingStory, setEditingStory] = useState<StoryItem | null>(null);
  const [showAddPageModal, setShowAddPageModal] = useState<boolean>(false);
  const [newPageName, setNewPageName] = useState<string>("");
  const [newPageLocale, setNewPageLocale] = useState<string>("en");

  // Fullscreen timeline state
  const [previewPlaying, setPreviewPlaying] = useState<boolean>(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState<number>(0);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!previewPlaying || !showFullscreenPreview) return;
    const timer = setInterval(() => setPreviewCurrentTime(t => t + 0.1 >= durationSec ? 0 : t + 0.1), 100);
    return () => clearInterval(timer);
  }, [previewPlaying,showFullscreenPreview,durationSec]);
  // Render Execution State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState<{
    status: string;
    total: number;
    done: number;
    failed: number;
    elapsedSec: number;
    items: any[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [draftReady,setDraftReady]=useState(false);
  // Load templates, avatars, pages, music tracks
  useEffect(() => {
    async function loadData() {
      const savedDraft=searchParams.get("prefill") || localStorage.getItem("studio.draft.v2");
      try {
        const [tplRes, avRes, pagesRes, musRes] = await Promise.all([
          fetch("/api/templates"),
          fetch("/api/avatars"),
          fetch("/api/pages"),
          fetch("/api/music"),
        ]);
        const [tplJson, avJson, pagesJson, musJson] = await Promise.all([
          tplRes.json(),
          avRes.json(),
          pagesRes.json(),
          musRes.json(),
        ]);

        if (tplJson.success && tplJson.data) {
          setAllTemplates(tplJson.data);
          if (tplJson.data.length > 0) setGlobalTemplateId(tplJson.data[0].id);
        }
        if (avJson.success && avJson.data) setAllAvatars(avJson.data);
        if (musJson.success && musJson.data) setAllTracks(musJson.data);
        const saved = savedDraft;
        if (saved) { setScriptText(saved); parseScript(saved); }
        if (pagesJson.success && pagesJson.data) {
          setPages(pagesJson.data.filter((p:Page) => p.id !== "free"));
          const requestedPage = searchParams.get("page") || localStorage.getItem("studio.selectedPage");
          setSelectedPageId(pagesJson.data.some((p:Page)=>p.id===requestedPage) ? requestedPage! : "free");
        }
      } catch (err) {
        setUploadStatus({msg:"Không tải được cấu hình Studio. Hãy tải lại trang; kịch bản của bạn vẫn được giữ.",ok:false});
        console.error("Lỗi nạp dữ liệu Studio:", err);
      } finally {setDraftReady(true);setLoadingPages(false); }
    }
    loadData();
  }, []);

  useEffect(() => {if(!draftReady) return; const timer=setTimeout(()=>{ if(scriptText) localStorage.setItem("studio.draft.v2",scriptText); else localStorage.removeItem("studio.draft.v2");},750);return ()=>clearTimeout(timer);},[scriptText,draftReady]);

  // Update locale and defaults when page changes
  useEffect(() => {
    setMusicSeed(Date.now() >>> 0);
    if (selectedPageId === "free") {
      setSelectedTrackId("");
      return;
    }
    const page = pages.find((p) => p.id === selectedPageId);
    if (page) {
      if (page.locale) setSelectedLocale(normalizeLocale(page.locale));
      setTemplateMode("page");
      const defaults=pageVideoDefaults(page);
      setDurationSec(defaults.duration);setResolution(defaults.resolution);setFps(defaults.fps);
      setAudioVolume(defaults.volume);setIsMuted(defaults.muted);setBackgroundVideo(defaults.background);
      localStorage.setItem("studio.selectedPage",page.id);

      if (page.settings?.templates && page.settings.templates.length > 0) {
        setGlobalTemplateId(page.settings.templates[0].template_id);
      }
      setSelectedTrackId(pageTrackPool(page,allTracks)[0]?.id || "");
    }
  }, [selectedPageId, pages]);

  useEffect(() => {
    const page = pages.find(p=>p.id===selectedPageId);
    if(page) setSelectedTrackId(pageTrackPool(page,allTracks)[0]?.id || "");
  },[allTracks,selectedPageId,pages]);

  // Check query params for prefilled caption
  useEffect(() => {
    const prefill = searchParams.get("prefill");
    const author = searchParams.get("author") || "The Story";
    if (prefill) {
      if (/^===/.test(prefill.trim())) {setScriptText(prefill);parseScript(prefill);return;}
      const sample = `=== STORY 1 ===\nTác giả: ${author}\nThời gian: 2h ago\nTên Page: ${author}\nNội dung thẻ:\n${prefill.split("\n\n")[0] || prefill}\nHighlights: ${prefill.slice(0, 30)}...\nNút CTA: Read Continuation In Comments 👇\nCaption: ${prefill}\nComment 1: Part 2: When the truth was finally revealed... (Full story in bio link!)`;
      setScriptText(sample);
      parseScript(sample);
    }
  }, [searchParams]);

  // Parse script whenever text changes
  function parseScript(text: string, append = false) {
    if (!text.trim()) {
      if (!append) setStories([]);
      return;
    }

    let imported;
    try { imported = parseStories(text); }
    catch (error: any) { setUploadStatus({ msg: error.message, ok: false }); setStories([]); return; }
    const previous = append ? stories : [];
    const parsed: StoryItem[] = [...previous, ...imported.map((story, idx) => ({
      ...story, id: `story_${Date.now()}_${idx}`, index: previous.length + idx + 1,
      selected: true, templateId: allTemplates[idx % Math.max(allTemplates.length, 1)]?.id,
      paletteIndex: 0, avatarId: allAvatars[idx % Math.max(allAvatars.length, 1)]?.id,
      isOverridden: false,
    }))];

    setStories(parsed);
    setMusicSeed(Date.now() >>> 0);
    if (selectedPageId === "free" && parsed.length) {
      const detected = new Set(parsed.map(s => detectStoryLocale(s, selectedLocale)));
      if (detected.size === 1) setSelectedLocale(Array.from(detected)[0]);
    }
    setTargetVideoCount(parsed.length);
    if (activePreviewIndex >= parsed.length) setActivePreviewIndex(0);
  }

  // File Upload logic supporting UTF-8 BOM, CRLF/LF, multiple files, TXT and JSON
  async function handleFileUpload(files: FileList | null, append = false) {
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files).filter(
      (f) => /\.(txt|json)$/i.test(f.name) || f.type.includes("text") || f.type.includes("json")
    );

    if (fileArr.length === 0) {
      setUploadStatus({ msg: "⚠️ Chỉ nhận file .txt hoặc .json", ok: false });
      return;
    }

    try {
      const imported = [];
      for (const file of fileArr) {
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name}: giới hạn 5 MB/file.`);
        try { imported.push(...parseStories(await readStoryFile(file))); }
        catch (error: any) { throw new Error(`${file.name}: ${error.message}`); }
      }
      if(!imported.length) throw new Error("File chưa có câu chuyện hợp lệ.");
      const text = serializeStories(imported);
      const combined = append && scriptText ? `${scriptText}\n\n${text}` : text;
      setScriptText(combined); parseScript(combined);
      setUploadStatus({msg: `Đã nhập ${imported.length} story từ ${fileArr.map(f => f.name).join(", ")}.`, ok:true});
    } catch (error: any) { setUploadStatus({msg:error.message, ok:false}); }
  }

  // Demo samples
  function loadSampleFr() {
    setSelectedLocale("fr");
    const sample = `=== STORY 1 ===
Tác giả: Franck Meynard
Thời gian: Il y a 1 h
Tên Page: Vérités d'Hier
Nội dung thẻ:
J'ai adopté seul la petite que vingt familles avaient refusée.
Son diagnostic faisait reculer tout le monde.
« Vous avez le temps de changer d'avis », m'a dit l'assistante sociale.
Mais quand elle a serré mon petit doigt, j'ai su que c'était ma fille.
Quatorze ans plus tard, une lettre anonyme a tout fait basculer.
Highlights: "vingt familles avaient refusée" | "serré mon petit doigt" | "lettre anonyme"
Nút CTA: Continuer la lecture dans les commentaires 👇
Caption: J'ai adopté seul la petite que vingt familles avaient refusée... 14 ans plus tard, une lettre anonyme bouleverse notre existence.
Comment 1: Épisode 2 : L'expéditeur de la lettre n'était autre que le médecin chef qui avait falsifié le dossier médical en 2012 pour la protéger de son grand-père biologique.`;
    setScriptText(sample);
    parseScript(sample);
  }

  function loadSampleNl() {
    setSelectedLocale("nl");
    const sample = `=== STORY 1 ===
Tác giả: Bram Van Dijk
Thời gian: 2 uur geleden
Tên Page: Gebroken Stilte
Nội dung thẻ:
Mijn vader onterfde mijn oudere broer op zijn sterfbed.
Iedereen dacht dat het om geld ging.
Maar in de verzegelde kluis lag alleen een politiedossier uit 1994.
Toen ik de eerste pagina las, begreep ik waarom mijn broer nooit meer naar huis kwam.
Highlights: "onterfde mijn oudere broer" | "politiedossier uit 1994" | "nooit meer naar huis"
Nút CTA: Lees het vervolg in de reacties 👇
Caption: Mijn vader onterfde mijn oudere broer op zijn sterfbed... Wat er in de kluis lag veranderde onze familie voor altijd.
Comment 1: Deel 2: Het dossier bevatte het officiële bewijs dat mijn broer 30 jaar lang de schuld op zich had genomen voor een misdrijf dat mijn vader zelf had begaan.`;
    setScriptText(sample);
    parseScript(sample);
  }

  function loadSampleUs() {
    setSelectedLocale("en");
    const sample = `=== STORY 1 ===
Tác giả: Sarah Jenkins
Thời gian: 2h ago
Tên Page: Daily American Confessions
Nội dung thẻ:
My husband told me he was working late at the clinic tonight.
He even sent a picture of his stethoscope on the messy desk.
Twenty minutes later, our joint credit card alerted me to a $420 charge.
It was at the most expensive rooftop steakhouse in downtown Chicago.
When I called the restaurant, the hostess said: 'Yes, Mr. Jenkins is celebrating an anniversary with his wife.'
Highlights: "working late at the clinic" | "$420 charge" | "celebrating an anniversary"
Nút CTA: Continue reading in comments 👇
Caption: My husband told me he was working late at the clinic... but our joint card just rang up a $420 dinner for two downtown.
Comment 1: Part 2: I drove straight to the restaurant. The woman sitting across from him wasn't a mistress—it was my own younger sister.`;
    setScriptText(sample);
    parseScript(sample);
  }

  // Selected stories
  const selectedStories = useMemo(() => stories.filter((s) => s.selected), [stories]);
  const effectiveN = Math.min(Math.max(0, targetVideoCount), selectedStories.length);

  // Resolved Preview Story & Template
  const currentPreviewStory = stories[activePreviewIndex] || stories[0] || null;

  const selectedPage = pages.find(p => p.id === selectedPageId);
  const pageMusicPool = useMemo(() => pageTrackPool(selectedPage, allTracks), [selectedPage, allTracks]);
  const musicVariants = enableVariants ? variantsPerStory : 1;
  const musicPlan = useMemo(() => selectedPage
    ? pageMusicPlan(pageMusicPool, Math.max(stories.length, effectiveN) * musicVariants, musicSeed) : [],
    [selectedPage, pageMusicPool, stories.length, effectiveN, musicVariants, musicSeed]);
  const pageAvatars = allAvatars.filter(a => selectedPageId === "free" ? !a.owner_page_id : a.owner_page_id === selectedPageId);
  function resolveStory(story: StoryItem, index: number, musicIndex = index, plan = musicPlan) {
    const pool = selectedPage?.settings?.templates || [];
    const entry = pool[index % Math.max(pool.length, 1)];
    const templateId = templateMode === "single" ? globalTemplateId
      : templateMode === "page" && entry ? entry.template_id
      : story.templateId || allTemplates[index % Math.max(allTemplates.length, 1)]?.id;
    const template = allTemplates.find(t => t.id === templateId) || allTemplates[0];
    const paletteIndex = templateMode === "single" ? globalPaletteIndex
      : templateMode === "page" && entry ? Math.max(0, template?.pals.findIndex(p => p.id === entry.palette_ids[Math.floor(index / Math.max(pool.length,1)) % Math.max(entry.palette_ids.length,1)]) || 0)
      : story.paletteIndex || 0;
    const avatarIds = templateMode === "page" && selectedPage?.settings?.avatar_ids?.length
      ? selectedPage.settings.avatar_ids : pageAvatars.map(a => a.id);
    const avatarId = templateMode === "custom_per_video" && pageAvatars.some(a => a.id === story.avatarId) ? story.avatarId : avatarIds[index % Math.max(avatarIds.length, 1)];
    const avatar = pageAvatars.find(a => a.id === avatarId);
    // Template locking affects the design only; page music always comes from its shuffled pool.
    const track = selectedPage ? plan[musicIndex % Math.max(plan.length, 1)] : allTracks.find(t=>t.id===selectedTrackId);
    return { template, paletteIndex, avatar, track, overrides: selectedPage?.settings?.overrides || {} };
  }
  const previewMusicIndex = Math.max(0, selectedStories.findIndex(s => s.id === currentPreviewStory?.id)) * musicVariants;
  const previewConfig = currentPreviewStory ? resolveStory(currentPreviewStory, activePreviewIndex, previewMusicIndex) : null;
  useEffect(() => {
    const track = previewConfig?.track;
    if (!track || !showFullscreenPreview || !previewPlaying || isMuted) return;
    const audio = new Audio(track.file_path); audio.loop = true; audio.volume = audioVolume / 100;
    audioPreviewRef.current = audio; audio.play().catch(() => {});
    return () => { audio.pause(); audioPreviewRef.current = null; };
  }, [previewConfig?.track?.file_path, showFullscreenPreview, previewPlaying, isMuted, audioVolume]);
  const resolvedTemplate = previewConfig?.template || allTemplates[0];
  const resolvedPaletteIndex = previewConfig?.paletteIndex || 0;
  const previewHtml = buildTemplateHtmlSafe();
  function buildTemplateHtmlSafe() {
    if (!resolvedTemplate) return "<body>Chưa có mẫu</body>";
    if (!currentPreviewStory) return "<body style='background:#eff6ff;color:#334155;font:32px sans-serif;display:grid;place-items:center;width:720px;height:1280px;margin:0'>Nhập kịch bản để xem trước</body>";
    const locale = resolveStoryLocale(currentPreviewStory, selectedLocale, selectedPage?.locale);
    return buildTemplateHtml(resolvedTemplate, resolvedPaletteIndex, locale, previewConfig?.overrides || {}, {
      name: currentPreviewStory.author || undefined, time: currentPreviewStory.timeAgo || undefined, body: currentPreviewStory.content,
      highlights: currentPreviewStory.highlights, cta: currentPreviewStory.cta,
      avatarUrl: previewConfig?.avatar?.image_path || previewConfig?.avatar?.url, locale,
    });
  }

  // Export Captions & Comments .txt (Renamed from old button)
  function handleExportCaptionsTxt() {
    if (stories.length === 0) return;
    const txtContent = stories
      .map(
        (s, idx) =>
          `=== STORY ${idx + 1} ===\nTác giả: ${s.author}\nThời gian: ${s.timeAgo}\nPage: ${s.pageName}\n\nNỘI DUNG THẺ:\n${s.content}\n\nCAPTION:\n${s.caption}\n\nCOMMENT 1:\n${s.comment1}`
      )
      .join("\n\n----------------------------------------\n\n");

    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `the_story_captions_${stories.length}_items.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Create Batch and trigger real render
  async function handleCreateAndRenderBatch() {
    if (selectedStories.length === 0) {
      alert("Vui lòng nhập ít nhất 1 câu chuyện hợp lệ để tạo lô.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedPageId !== "free" && templateMode === "page" && !selectedPage?.settings?.templates?.length)
        throw new Error("Page chưa chọn mẫu. Vào Cài đặt page hoặc dùng chế độ Khóa 1 mẫu.");
      if (selectedPage && !isMuted && !pageMusicPool.length) throw new Error("Page chưa có nhạc khả dụng. Hãy chọn/lưu nhạc trong Cài đặt page hoặc tắt nhạc.");
      const batchSeed = (musicSeed + 1) >>> 0;
      const batchPlan = pageMusicPlan(pageMusicPool, effectiveN * musicVariants, batchSeed);
      setMusicSeed(batchSeed);
      const itemsToRender = selectedStories.slice(0, effectiveN).flatMap((s, selectedIndex) => {
        const originalIndex = stories.findIndex(story => story.id === s.id);
        return Array.from({length: enableVariants ? variantsPerStory : 1}, (_, variant) => {
          const cfg = resolveStory(s, originalIndex + variant, selectedIndex * musicVariants + variant, batchPlan);
          if (!cfg.template) throw new Error("Chưa có mẫu video hợp lệ.");
          return {
            template_id: cfg.template.id, palette_id: cfg.template.pals[cfg.paletteIndex]?.id,
            avatar_id: cfg.avatar?.id || null, music_track_id: cfg.track?.id || null,
            background_video_url: backgroundVideo, duration:durationSec, resolution,
            story_payload: {...s, locale:resolveStoryLocale(s, selectedLocale, selectedPage?.locale), avatarUrl:cfg.avatar?.image_path || cfg.avatar?.url,
              renderConfig:{ fps, volume:audioVolume / 100, muted:isMuted, overrides:cfg.overrides, rendererVersion:2,
                pageDisplayName: selectedPage?.display_name || selectedPage?.name || s.pageName,
                trackPath:cfg.track?.file_path }},
          };
        });
      });

      const batchRes = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_id: selectedPageId,
          name: `Lô ${itemsToRender.length} video (${selectedLocale.toUpperCase()} · ${durationSec}s) - ${new Date().toLocaleTimeString("vi-VN")}`,
          locale: selectedLocale,
          mode: templateMode,
          music_seed: batchSeed,
          items: itemsToRender,
        }),
      });

      const batchJson = await batchRes.json();
      if (!batchJson.success) {
        throw new Error(batchJson.error || "Không thể khởi tạo lô video");
      }

      setBatchNotice("");
      const batchId = batchJson.data.id;
      setCurrentBatchId(batchId);
      setIsRendering(true);
      localStorage.setItem("studio.activeBatch", batchId);
      setRenderProgress({
        status: "running",
        total: itemsToRender.length,
        done: 0,
        failed: 0,
        elapsedSec: 0,
        items: [],
      });

      const start = await fetch(`/api/batches/${batchId}/render`, {method:"POST"});
      const started = await start.json();
      if (!start.ok) throw new Error(started.error || "Không thể khởi động máy dựng.");

    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("studio.activeBatch");
    if (saved) setCurrentBatchId(saved);
  }, []);
  useEffect(() => {
    if (!currentBatchId) return;
    let closed = false;
    let stopped = false;
    const poll = async () => {
      if(closed || stopped) return;
      try {
        const response = await fetch(`/api/batches/${encodeURIComponent(currentBatchId)}`, {cache:"no-store"});
        const json = await response.json();
        if(response.status === 404) {
          if(closed) return;
          stopped=true;setCurrentBatchId(null);setIsRendering(false);setRenderProgress(null);
          if(localStorage.getItem("studio.activeBatch") === currentBatchId) localStorage.removeItem("studio.activeBatch");
          setBatchNotice("Lô cũ đã bị xóa. Kịch bản vẫn được giữ; bạn có thể chọn page và dựng lô mới.");
          return;
        }
        if (!response.ok) throw new Error(json.error);
        if (closed) return;
        const {batch, items} = json.data;
        const done = items.filter((i:any) => i.status === "completed").length;
        const failed = items.filter((i:any) => i.status === "failed").length;
        setRenderProgress({status:batch.status, total:items.length, done, failed,
          elapsedSec:Math.max(0, Math.floor((Date.parse(batch.finished_at || new Date().toISOString()) - Date.parse(batch.created_at))/1000)), items});
        const active=["queued","running"].includes(batch.status);
        setIsRendering(active);
        if(!active) {stopped=true;if(localStorage.getItem("studio.activeBatch") === currentBatchId) localStorage.removeItem("studio.activeBatch");}
      } catch (error:any) { if (!closed) setBatchNotice(error.message || "Tạm thời không đọc được tiến trình; đang thử lại."); }
    };
    poll(); const timer = setInterval(poll, 1500);
    return () => {closed=true;clearInterval(timer);};
  }, [currentBatchId]);
  async function controlBatch(action: string) {
    if (!currentBatchId) return;
    const response = await fetch(`/api/batches/${currentBatchId}/render`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action})});
    const json = await response.json();
    if (!response.ok) setUploadStatus({msg:json.error,ok:false});
  }

  async function saveVideoDefaults() {
    if(!selectedPage || selectedPage.id === "free") return;
    const settings={...selectedPage.settings,overrides:{...selectedPage.settings.overrides,_video:{duration:durationSec,resolution,fps,volume:audioVolume,muted:isMuted,background:backgroundVideo}}};
    const response=await fetch(`/api/pages/${selectedPage.id}/settings`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(settings)});
    const json=await response.json();
    if(response.ok) {setPages(prev=>prev.map(p=>p.id===selectedPage.id?{...p,settings}:p));setUploadStatus({msg:"Đã lưu cấu hình video cho page. Chỉ áp dụng cho lô mới.",ok:true});}
    else setUploadStatus({msg:json.error,ok:false});
  }

  // Add Page Quick Modal
  async function handleCreateQuickPage() {
    if (!newPageName.trim()) return;
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPageName.trim(),
          display_name: newPageName.trim(),
          locale: newPageLocale,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPages((prev) => [...prev, json.data]);
        setSelectedPageId(json.data.id);
        setSelectedLocale(json.data.locale);
        setShowAddPageModal(false);
        setNewPageName("");
      } else {
        alert(json.error || "Không thể tạo page");
      }
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28">
      {/* Hidden file input for TXT/JSON upload */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept=".txt,.json"
        className="hidden"
        onChange={(e) => {
          handleFileUpload(e.target.files, appendImport);
          e.target.value = "";
        }}
      />

      {/* Header Banner */}
      <div className="bg-white border-b border-blue-200 px-6 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-blue-950 flex items-center gap-2">
              <PlaySquare className="w-6 h-6 text-blue-600" />
              <span>Reels Studio — Sản Xuất Video Thẻ Kịch Bản (The Story)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quy trình khép kín: Nhập kịch bản TXT → Cấu hình Page & Video → Xem trước 9:16 chuẩn xác → Dựng MP4 thật với tiến trình → Tải file ZIP.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Nhập file TXT/JSON</span>
            </button>

            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={appendImport} onChange={e=>setAppendImport(e.target.checked)} />Nối thêm file</label>
            <button
              onClick={handleExportCaptionsTxt}
              disabled={stories.length === 0}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Xuất caption & comment .txt</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Upload feedback banner */}
        {uploadStatus && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between ${
              uploadStatus.ok
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span>{uploadStatus.msg}</span>
            <button onClick={() => setUploadStatus(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {batchNotice && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 mb-4">{batchNotice}</div>}
        {/* Studio 4 Zones Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================== */}
          {/* VÙNG 1 & 2 (CỘT TRÁI - 7 COLS): NGUỒN KỊCH BẢN & CẤU HÌNH */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
<section className="bg-blue-50 border-2 border-blue-400 rounded-2xl p-5">
              {/* Target Page Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">CHỌN PAGE ĐỂ DỰNG VIDEO:</label>
                  <button
                    onClick={() => setShowAddPageModal(true)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Thêm Page mới
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <select
                      aria-label="Chọn page để dựng video"
                      disabled={loadingPages}
                      value={selectedPageId}
                      onChange={(e) => {setSelectedPageId(e.target.value);localStorage.setItem("studio.selectedPage",e.target.value);}}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="free">{loadingPages ? "Đang tải danh sách page…" : "🎯 Lô tự do"}  (Tự cấu hình & chọn Locale bên dưới)</option>
                      {pages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.locale.toUpperCase()})
                        </option>
                      ))}
                    </select>
                    {currentPreviewStory && <p className="mt-2 text-xs text-slate-600">
                      Ngôn ngữ video đang xem: {resolveStoryLocale(currentPreviewStory, selectedLocale, selectedPage?.locale).toUpperCase()}
                      {selectedPageId === "free" ? " · Tự nhận từ kịch bản; dùng lựa chọn trên nếu nội dung quá ngắn." : " · Theo Fanpage đã chọn."}
                    </p>}
                  </div>

                  <div>
                    <select
                      value={selectedLocale}
                      onChange={(e) => setSelectedLocale(e.target.value)}
                      disabled={selectedPageId !== "free"}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      {LOCALE_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>


{selectedPage && <p className="mt-3 text-xs font-semibold text-blue-800">Đang áp dụng cài đặt {selectedPage.name}: mẫu, màu, ảnh, nhạc và thông số video. <Link href={`/settings/${selectedPageId}`} className="underline">Mở cài đặt page</Link></p>}
</section>
            {/* VÙNG 1: NGUỒN KỊCH BẢN */}
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span>1. Nguồn kịch bản (Textarea & Kéo thả file)</span>
                </span>

                {/* Sample load demo buttons */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Nạp mẫu demo:</span>
                  <button
                    onClick={loadSampleUs}
                    className="px-2 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
                  >
                    🇺🇸 Mỹ (US)
                  </button>
                  <button
                    onClick={loadSampleFr}
                    className="px-2 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
                  >
                    🇫🇷 Pháp (FR)
                  </button>
                  <button
                    onClick={loadSampleNl}
                    className="px-2 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
                  >
                    🇳🇱 Hà Lan (NL)
                  </button>
                </div>
              </div>

              {/* Drag and drop script drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer && e.dataTransfer.files) handleFileUpload(e.dataTransfer.files, appendImport);
                }}
                className="relative"
              >
                <textarea
                  value={scriptText}
                  onChange={(e) => {
                    setScriptText(e.target.value);
                    parseScript(e.target.value);
                  }}
                  placeholder="Dán nội dung kịch bản theo định dạng === STORY 1 === ... hoặc kéo thả file .txt/.json vào đây."
                  rows={6}
                  className="w-full bg-slate-50/70 border border-slate-300 rounded-xl p-3.5 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  Đã đọc được: <b className="text-blue-700 font-extrabold">{stories.length} câu chuyện</b> ({selectedStories.length} được chọn)
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setScriptText("");
                      setStories([]);
                    }}
                    className="text-red-500 hover:underline text-[11px]"
                  >
                    Xóa sạch
                  </button>
                </div>
              </div>
            </div>

            {/* VÙNG 2: CẤU HÌNH VIDEO & PAGE */}
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-xs space-y-5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>2. Cấu hình Page & Video Xuất</span>
              </span>

              {/* Template Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Chế độ áp dụng mẫu thiết kế:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTemplateMode("page")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      templateMode === "page"
                        ? "border-blue-600 bg-blue-50/80 text-blue-900 ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="font-bold text-xs">🏛️ Theo cài đặt page</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Tự áp dụng pool mẫu, palette và avatar đã lưu</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateMode("single")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      templateMode === "single"
                        ? "border-blue-600 bg-blue-50/80 text-blue-900 ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="font-bold text-xs">🔒 Khóa 1 mẫu cả lô</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Dùng duy nhất 1 mẫu và bảng màu cho tất cả</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateMode("custom_per_video")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      templateMode === "custom_per_video"
                        ? "border-blue-600 bg-blue-50/80 text-blue-900 ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="font-bold text-xs">🎯 Tùy chỉnh từng video</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Chọn riêng mẫu và bảng màu cho từng bài</div>
                  </button>
                </div>

                {templateMode === "single" && (
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
                    <select
                      value={globalTemplateId}
                      onChange={(e) => {
                        setGlobalTemplateId(e.target.value);
                        setGlobalPaletteIndex(0);
                      }}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                    >
                      {allTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name || t.label} ({t.group})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs">
                      <span className="text-[11px] text-slate-500">Màu:</span>
                      <button
                        onClick={() =>
                          setGlobalPaletteIndex(
                            (p) =>
                              (p - 1 + (resolvedTemplate?.pals.length || 1)) % (resolvedTemplate?.pals.length || 1)
                          )
                        }
                        className="p-0.5 hover:bg-slate-100 rounded text-slate-600"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-blue-700 px-1">{globalPaletteIndex + 1}</span>
                      <button
                        onClick={() =>
                          setGlobalPaletteIndex((p) => (p + 1) % (resolvedTemplate?.pals.length || 1))
                        }
                        className="p-0.5 hover:bg-slate-100 rounded text-slate-600"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Count (N) & Variants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Số lượng video xuất (N):</span>
                    <span className="text-blue-700 font-extrabold">{effectiveN} video</span>
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[1, 5, 10, 20, 30].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTargetVideoCount(num)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                          targetVideoCount === num
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setTargetVideoCount(selectedStories.length || 1)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                    >
                      Tất cả ({selectedStories.length})
                    </button>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Thời lượng video:</span>
                    <span className="text-blue-700 font-extrabold">{durationSec} giây</span>
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[8, 10, 15, 20, 30].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setDurationSec(sec)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                          durationSec === sec
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={durationSec}
                      onChange={(e) => setDurationSec(Math.max(5, Math.min(60, parseInt(e.target.value) || 10)))}
                      className="w-14 px-1.5 py-1 text-xs border border-slate-300 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <label>Số story xuất<input aria-label="Số story xuất" type="number" min={1} max={selectedStories.length || 1} value={targetVideoCount} onChange={e=>setTargetVideoCount(Math.max(1,Math.min(selectedStories.length || 1, Number(e.target.value)||1)))} className="w-full rounded border p-2" /></label>
                <label>FPS<select aria-label="FPS" className="w-full rounded border p-2" value={fps} onChange={e=>setFps(Number(e.target.value))}><option value={24}>24</option><option value={30}>30</option></select></label>
                <label>Âm lượng {audioVolume}%<input aria-label="Âm lượng" type="range" min="0" max="100" value={audioVolume} onChange={e=>setAudioVolume(Number(e.target.value))} className="w-full" /></label>
                <label className="col-span-2">Video nền<select aria-label="Video nền" className="w-full rounded border p-2" value={backgroundVideo} onChange={e=>setBackgroundVideo(e.target.value)}>{backgrounds.map(f=><option key={f.id} value={f.file_path}>{f.name}</option>)}</select></label>
              </div>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={enableVariants} onChange={e=>setEnableVariants(e.target.checked)} />Tạo nhiều biến thể mỗi story</label>
              {enableVariants && <label className="block text-xs">Số biến thể / story <input aria-label="Số biến thể" type="number" min={1} max={5} value={variantsPerStory} onChange={e=>setVariantsPerStory(Math.max(1,Math.min(5,Number(e.target.value)||1)))} className="w-16 rounded border p-2" /> · Tổng {effectiveN * variantsPerStory} video</label>}
              {selectedPage && <button type="button" onClick={saveVideoDefaults} className="rounded border border-blue-300 px-3 py-2 text-xs text-blue-800">Lưu thời lượng / chất lượng / âm lượng / nền cho page này</button>}
              <AssetLibrary onChange={refreshAssets} />
              {/* Quality & Audio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Độ phân giải & Tỉ lệ:</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                  >
                    <option value="720x1280">720×1280 (Nhanh - Tối ưu)</option>
                    <option value="1080x1920">1080×1920 (Chuẩn HD 9:16)</option>
                    <option value="1440x2560">1440×2560 (2K Siêu nét)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nhạc nền & Âm lượng:</label>
                  {selectedPage && <p className="text-xs text-blue-800">Random từng video từ {pageMusicPool.length} bài đã lưu cho page. Dùng hết kho rồi mới lặp, tránh trùng liên tiếp. Khóa mẫu không khóa nhạc.</p>}
                  <div className="flex items-center gap-2">
                    <select
                      disabled={Boolean(selectedPage)}
                      value={selectedPage ? "page-random" : selectedTrackId}
                      onChange={(e) => setSelectedTrackId(e.target.value)}
                      className="min-w-0 flex-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800"
                    >
                      {selectedPage && <option value="page-random">🎲 Random {pageMusicPool.length} bài của page</option>}
                      <option value="">Không dùng nhạc</option>
                      {pageTrackPool(selectedPage,allTracks).map((t) => (
                        <option key={t.id} value={t.id}>
                          🎵 {t.title} ({t.mood})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-2 rounded-xl border ${
                        isMuted ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                      title={isMuted ? "Đã tắt nhạc" : "Đang bật nhạc"}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {selectedPage && <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-700">Video đang xem: {isMuted ? "Đã tắt nhạc" : previewConfig?.track?.title || "Chưa có bài nhạc"}</span>
                    <button type="button" disabled={isRendering || isSubmitting} onClick={() => setMusicSeed(seed => seed + 1)} className="rounded border border-blue-300 px-2 py-1 text-blue-700 disabled:opacity-50">🎲 Xáo lại nhạc</button>
                  </div>}
                </div>
              </div>
            </div>

            {/* DANH SÁCH BÀI SẼ DỰNG */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Danh sách kịch bản trong lô ({stories.length}):
                </h3>
                <span className="text-[11px] text-slate-500">
                  Bấm vào bài để xem trước trực tiếp ở khung bên phải
                </span>
              </div>

              {stories.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center text-xs text-slate-400">
                  Chưa có kịch bản nào. Hãy dán text kịch bản hoặc bấm &quot;Nhập file TXT/JSON&quot; ở trên.
                </div>
              ) : (
                stories.map((story, idx) => {
                  const isSelected = activePreviewIndex === idx;
                  const isChecked = story.selected;

                  return (
                    <div
                      key={story.id}
                      onClick={() => setActivePreviewIndex(idx)}
                      className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-600 ring-2 ring-blue-100 shadow-sm"
                          : "border-slate-200 hover:border-blue-300 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              e.stopPropagation();
                              setStories((prev) =>
                                prev.map((s, i) => (i === idx ? { ...s, selected: !s.selected } : s))
                              );
                            }}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                            #{story.index}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{story.author}</span>
                          <span className="text-[11px] text-slate-400">· {story.timeAgo}</span>
                        </div>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setEditingStory(story)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded"
                            title="Chỉnh sửa nội dung câu chuyện"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const updated=stories.filter((_,i)=>i!==idx);setStories(updated);setScriptText(serializeStories(updated));
                              if (activePreviewIndex >= stories.length - 1) setActivePreviewIndex(0);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Xóa câu chuyện này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {templateMode === "custom_per_video" && <div className="flex flex-wrap gap-2 py-2" onClick={e=>e.stopPropagation()}>
                        <select aria-label={`Mẫu video ${idx+1}`} className="max-w-full rounded border p-1 text-xs" value={story.templateId} onChange={e=>setStories(prev=>prev.map((s,i)=>i===idx?{...s,templateId:e.target.value,paletteIndex:0}:s))}>{allTemplates.map(t=><option key={t.id} value={t.id}>{t.name || t.label}</option>)}</select>
                        <select aria-label={`Màu video ${idx+1}`} className="rounded border p-1 text-xs" value={story.paletteIndex || 0} onChange={e=>setStories(prev=>prev.map((s,i)=>i===idx?{...s,paletteIndex:Number(e.target.value)}:s))}>{allTemplates.find(t=>t.id===story.templateId)?.pals.map((p,i)=><option key={p.id} value={i}>{p.id}</option>)}</select>
                        <select aria-label={`Avatar video ${idx+1}`} className="rounded border p-1 text-xs" value={story.avatarId} onChange={e=>setStories(prev=>prev.map((s,i)=>i===idx?{...s,avatarId:e.target.value}:s))}>{pageAvatars.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
                      </div>}
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed mt-2">
                        {story.content}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-4">
                        <span className="truncate max-w-[260px]">
                          <b>Caption:</b> {story.caption}
                        </span>
                        <span className="truncate max-w-[260px]">
                          <b>Comment:</b> {story.comment1}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* ======================================================== */}
          {/* VÙNG 3 (CỘT PHẢI - 5 COLS): XEM TRƯỚC 9:16 KHÔNG BỊ CẮT CHỮ */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span>Xem trước thời gian thực (9:16)</span>
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    {currentPreviewStory
                      ? `Bài #${currentPreviewStory.index} · ${currentPreviewStory.author}`
                      : "Chưa có bài"}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowFullscreenPreview(true)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs flex items-center gap-1 font-semibold"
                    title="Phóng to xem đầy đủ"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Phóng to</span>
                  </button>
                </div>
              </div>

              {/* 9:16 FRAME CONTAINER CÓ SCALE TRANSFORM CHỐNG TRÀN VÀ CẮT CHỮ */}
              <div className="mx-auto w-full max-w-[300px] rounded-2xl border-4 border-slate-800 shadow-xl"><VideoPreview html={previewHtml} title="Live Video Card Preview" /></div>

              {/* Story Navigator */}
              {stories.length > 1 && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setActivePreviewIndex((p) => Math.max(0, p - 1))}
                    disabled={activePreviewIndex === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Bài trước</span>
                  </button>

                  <span className="text-xs font-bold text-slate-800">
                    {activePreviewIndex + 1} / {stories.length}
                  </span>

                  <button
                    onClick={() => setActivePreviewIndex((p) => Math.min(stories.length - 1, p + 1))}
                    disabled={activePreviewIndex === stories.length - 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <span>Bài tiếp</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Summary of resolved configuration */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Mẫu thiết kế:</span>
                  <b className="text-slate-900">{resolvedTemplate?.name || "Mẫu mặc định"}</b>
                </div>
                <div className="flex justify-between">
                  <span>Thời lượng:</span>
                  <b className="text-slate-900">{durationSec} giây · {resolution}</b>
                </div>
                <div className="flex justify-between">
                  <span>Ngôn ngữ:</span>
                  <b className="text-slate-900">{selectedLocale.toUpperCase()}</b>
                </div>
              </div>
            </div>

            {/* TIẾN TRÌNH RENDER VÀ KẾT QUẢ KHI ĐANG DỰNG */}
            {renderProgress && (
              <div className="bg-white border-2 border-blue-500 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-2">
                    {isRendering ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>
                      {isRendering ? "Đang dựng video…" : renderProgress.status === "completed" ? "Đã dựng xong" : `Trạng thái: ${renderProgress.status} · ${renderProgress.failed} lỗi`}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-blue-700">
                    {renderProgress.done} / {renderProgress.total} xong ({renderProgress.elapsedSec}s)
                  </span>
                </div>

                <div className="flex gap-2 text-xs">
                  {isRendering && <button className="rounded border px-3 py-2" onClick={() => controlBatch("cancel")}>Hủy lô</button>}
                  {!isRendering && renderProgress.status !== "completed" && <button className="rounded border px-3 py-2" onClick={() => controlBatch("retry")}>Tiếp tục / Thử lại mục lỗi</button>}
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${renderProgress.items.reduce((sum:number,item:any)=>sum+(item.status==="completed"?100:item.progress || 0),0) / Math.max(renderProgress.total,1)}%`,
                    }}
                  ></div>
                </div>

                {/* Video gallery of completed items */}
                {renderProgress.items && renderProgress.items.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-slate-700">Thành phẩm video MP4:</span>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                      {renderProgress.items.map((it: any) => (
                        <div
                          key={it.id}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">Video #{it.seq}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                it.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : it.status === "rendering"
                                  ? "bg-blue-100 text-blue-800 animate-pulse"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {it.status} {typeof it.progress === "number" ? `${it.progress}%` : ""}
                            </span>
                          </div>

                          {it.error && <span className="text-red-700 max-w-48 truncate" title={it.error}>{it.error}</span>}
                          {it.output_video_url && (
                            <div className="flex items-center gap-2">
                              <a
                                href={it.output_video_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px]"
                              >
                                Xem MP4
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Download Full ZIP Button */}
                    {currentBatchId && renderProgress.done > 0 && (
                      <div className="pt-2">
                        <a
                          href={`/api/batches/${currentBatchId}/download${renderProgress.status === "completed" ? "" : "?partial=true"}`}
                          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Tải ZIP · {renderProgress.done} video đã xong + TXT</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* VÙNG 4: THANH DÍNH CHÂN TRANG (STICKY ACTION BAR) */}
      {/* ======================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-blue-200 px-6 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-700">
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-extrabold border border-blue-200">
              {effectiveN * (enableVariants ? variantsPerStory : 1)} video từ {effectiveN} / {selectedStories.length} story
            </span>
            <span className="font-semibold text-slate-600">
              Thời lượng: <b>{durationSec}s</b> · {resolution} · {selectedLocale.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCreateAndRenderBatch}
              disabled={isSubmitting || isRendering || selectedStories.length === 0 || effectiveN < 1}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang chuẩn bị lô video...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>⚡ BẮT ĐẦU DỰNG {effectiveN * (enableVariants ? variantsPerStory : 1)} VIDEO REELS</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL PHÓNG TO XEM ĐẦY ĐỦ 9:16 (FULLSCREEN PREVIEW) */}
      {/* ======================================================== */}
      {showFullscreenPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl p-6 max-w-lg w-full flex flex-col items-center space-y-4">
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Xem đầy đủ 9:16 · {resolvedTemplate?.name || resolvedTemplate?.label}
              </span>
              <button
                onClick={() => {
                  setShowFullscreenPreview(false);
                  setPreviewPlaying(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large 9:16 Preview Box */}
            <div style={{width:"min(360px, calc((100dvh - 240px) * 9 / 16), calc(100vw - 80px))"}}><VideoPreview html={previewHtml} title="Fullscreen Preview" playing={previewPlaying} time={previewCurrentTime} /></div>

            {/* Scrubber timeline and Play/Pause */}
            <div className="w-full space-y-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewPlaying(!previewPlaying)}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {previewPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={durationSec}
                  value={previewCurrentTime}
                  onChange={(e) => {setPreviewCurrentTime(parseFloat(e.target.value)); if(audioPreviewRef.current) audioPreviewRef.current.currentTime=Number(e.target.value) % (audioPreviewRef.current.duration || durationSec);}}
                  className="flex-1 accent-blue-600"
                />

                <span className="text-xs font-mono text-slate-300 w-12 text-right">
                  {previewCurrentTime.toFixed(1)}s / {durationSec}s
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL THÊM PAGE MỚI */}
      {/* ======================================================== */}
      {showAddPageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Thêm Fanpage Mới (Không cần Domain)</h3>
              <button onClick={() => setShowAddPageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Fanpage:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Daily US Confessions..."
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ngôn ngữ (Locale):</label>
                <select
                  value={newPageLocale}
                  onChange={(e) => setNewPageLocale(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden focus:border-blue-500"
                >
                  {LOCALE_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddPageModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateQuickPage}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                Tạo Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL CHỈNH SỬA CÂU CHUYỆN (EDIT STORY) */}
      {/* ======================================================== */}
      {editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Chỉnh sửa Câu Chuyện #{editingStory.index}</h3>
              <button onClick={() => setEditingStory(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tác giả:</label>
                <input
                  type="text"
                  value={editingStory.author}
                  onChange={(e) => setEditingStory({ ...editingStory, author: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-1.5 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung thẻ:</label>
                <textarea
                  rows={4}
                  value={editingStory.content}
                  onChange={(e) => setEditingStory({ ...editingStory, content: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nút CTA:</label>
                <input
                  type="text"
                  value={editingStory.cta}
                  onChange={(e) => setEditingStory({ ...editingStory, cta: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-1.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Caption:</label>
                <textarea
                  rows={2}
                  value={editingStory.caption}
                  onChange={(e) => setEditingStory({ ...editingStory, caption: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Comment 1:</label>
                <textarea
                  rows={2}
                  value={editingStory.comment1}
                  onChange={(e) => setEditingStory({ ...editingStory, comment1: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingStory(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const updated=stories.map(s=>s.id===editingStory.id?editingStory:s);
                  setStories(updated);setScriptText(serializeStories(updated));
                  setEditingStory(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RenderStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-400">
          Đang tải Studio...
        </div>
      }
    >
      <RenderStudioContent />
    </Suspense>
  );
}
