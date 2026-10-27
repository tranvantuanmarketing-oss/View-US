// STORY VIDEO STUDIO - CORE LOGIC
// 1080 x 1920 CANVAS RENDERER, MEDIA RECORDER & NATIVE ZIP EXPORTER

const AVATAR_POOL = [
  "behind_closed_doors_avatar_1790529387878.jpg",
  "behind_the_camo_avatar_1790529308188.jpg",
  "brotherhood_of_honor_avatar_1790529228702.jpg",
  "charlotte_jade_avatar_1790242426201.jpg",
  "closed_doors_avatar_1791013368613.jpg",
  "echoes_of_valor_avatar_1790529159047.jpg",
  "ethan_cross_avatar_1790242524016.jpg",
  "fateful_turns_avatar_1791013255775.jpg",
  "gebroken_stilte_avatar_1789876290631.jpg",
  "inheritance_and_lies_avatar_1790529471524.jpg",
  "james_cooper_avatar_1790233083438.jpg",
  "larmes_avatar_char_1789875942265.jpg",
  "larmes_silencieuses_avatar_1789875829993.jpg",
  "masques_tombes_avatar_1791040281244.jpg",
  "noah_avatar_1790232991016.jpg",
  "pacte_brise_avatar_1790498179326.jpg",
  "richard_ross_avatar_1789742355051.jpg",
  "stille_schaduwen_avatar_1790498094838.jpg",
  "thomas_mitchell_avatar_1789741739372.jpg",
  "victoria_avatar_1790232897927.jpg"
];

const AUDIO_TRACKS = [
  "assets/audio/music_1.mp4",
  "assets/audio/music_2.mp4",
  "assets/audio/music_3.mp4"
];

// APP STATE
let stories = [];
let currentStoryIdx = 0;
let selectedAvatar = AVATAR_POOL[0];
let avatarCache = {};
let batch30RawText = "";

// DOM ELEMENTS
const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");
const batchTextarea = document.getElementById("batchTextarea");
const selectTheme = document.getElementById("selectTheme");
const selectDuration = document.getElementById("selectDuration");
const selectAudio = document.getElementById("selectAudio");
const avatarListEl = document.getElementById("avatarList");
const currentStoryIndexEl = document.getElementById("currentStoryIndex");
const statStoryCount = document.getElementById("statStoryCount");
const statAvatarCount = document.getElementById("statAvatarCount");
const audioPlayer = document.getElementById("audioPlayer");
const chkZipPackage = document.getElementById("chkZipPackage");

// PROGRESS ELEMENTS
const progressBox = document.getElementById("progressBox");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const progressDetail = document.getElementById("progressDetail");

// INIT
window.addEventListener("DOMContentLoaded", async () => {
  statAvatarCount.textContent = AVATAR_POOL.length;
  renderAvatarList();
  await preloadBatch30Text();
  loadSample30();
  setupEventListeners();
});

async function preloadBatch30Text() {
  try {
    const res = await fetch("batch_30_stories.txt");
    if (res.ok) {
      batch30RawText = await res.text();
    }
  } catch (e) {
    console.warn("Could not fetch batch_30_stories.txt:", e);
  }
}

function renderAvatarList() {
  avatarListEl.innerHTML = "";
  AVATAR_POOL.forEach((file, idx) => {
    const img = document.createElement("img");
    img.src = `assets/avatars/${file}`;
    img.className = `avatar-item ${idx === 0 ? "active" : ""}`;
    img.title = file;
    img.onclick = () => {
      document.querySelectorAll(".avatar-item").forEach(el => el.classList.remove("active"));
      img.classList.add("active");
      selectedAvatar = file;
      document.querySelector('input[name="avatarMode"][value="pick"]').checked = true;
      renderCurrentPreview();
    };
    avatarListEl.appendChild(img);
  });
}

function loadSample30() {
  if (batch30RawText) {
    batchTextarea.value = batch30RawText;
  }
  parseStories();
}

function filterStoriesByCountry(prefix) {
  if (!batch30RawText) return;
  const parts = batch30RawText.split(/===\s*STORY\s*\d*\s*===/i).map(s => s.trim()).filter(Boolean);
  const filtered = parts.filter(p => {
    if (prefix === "FR") return p.includes("Vérités") || p.includes("Masques") || p.includes("Larmes") || p.includes("Pacte");
    if (prefix === "NL") return p.includes("Verhalen") || p.includes("Verborgen") || p.includes("Stille");
    if (prefix === "DE") return p.includes("Zu Spät");
    return true;
  });

  const formatted = filtered.map((f, i) => `=== STORY ${i + 1} ===\n${f}`).join("\n\n");
  batchTextarea.value = formatted;
  parseStories();
}

function parseStories() {
  const raw = batchTextarea.value;
  const parts = raw.split(/===\s*STORY\s*\d*\s*===/i).map(s => s.trim()).filter(Boolean);
  
  stories = parts.map((part, index) => {
    const lines = part.split("\n");
    let author = "Franck Meynard";
    let timeAgo = "Il y a 1 h";
    let pageName = "Fanpage";
    let text = "";
    let highlights = [];
    let cta = "Continuer la lecture dans les commentaires";
    let caption = "";
    let comment1 = "";

    let currentSection = "";

    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("Tác giả:")) {
        author = trimmed.replace("Tác giả:", "").trim();
      } else if (trimmed.startsWith("Thời gian:")) {
        timeAgo = trimmed.replace("Thời gian:", "").trim();
      } else if (trimmed.startsWith("Tên Page:")) {
        pageName = trimmed.replace("Tên Page:", "").trim();
      } else if (trimmed.startsWith("Nội dung thẻ:")) {
        currentSection = "text";
      } else if (trimmed.startsWith("Highlights:")) {
        currentSection = "highlights";
        highlights = trimmed.replace("Highlights:", "").split("|").map(h => h.trim()).filter(Boolean);
      } else if (trimmed.startsWith("Nút CTA:")) {
        cta = trimmed.replace("Nút CTA:", "").trim();
        currentSection = "";
      } else if (trimmed.startsWith("Caption:")) {
        currentSection = "caption";
        caption = trimmed.replace("Caption:", "").trim();
      } else if (trimmed.startsWith("Comment 1:")) {
        currentSection = "comment";
        comment1 = trimmed.replace("Comment 1:", "").trim();
      } else {
        if (currentSection === "text") {
          text += (text ? "\n" : "") + line;
        } else if (currentSection === "caption") {
          caption += " " + trimmed;
        } else if (currentSection === "comment") {
          comment1 += "\n" + line;
        }
      }
    }

    return {
      index: index + 1,
      author,
      timeAgo,
      pageName,
      text: text.trim(),
      highlights,
      cta,
      caption: caption.trim(),
      comment1: comment1.trim(),
      avatar: AVATAR_POOL[index % AVATAR_POOL.length]
    };
  });

  statStoryCount.textContent = stories.length;
  currentStoryIdx = 0;
  updateNavState();
  renderCurrentPreview();
}

function updateNavState() {
  if (stories.length === 0) {
    currentStoryIndexEl.textContent = "0 / 0";
    return;
  }
  currentStoryIndexEl.textContent = `Bài ${currentStoryIdx + 1} / ${stories.length}`;
}

function setupEventListeners() {
  document.getElementById("btnLoadSample30").onclick = () => loadSample30();
  document.getElementById("btnLoadSampleFR").onclick = () => filterStoriesByCountry("FR");
  document.getElementById("btnLoadSampleNL").onclick = () => filterStoriesByCountry("NL");
  document.getElementById("btnLoadSampleDE").onclick = () => filterStoriesByCountry("DE");

  document.getElementById("btnUpdatePreview").onclick = () => parseStories();
  selectTheme.onchange = () => renderCurrentPreview();

  document.getElementById("btnPrevStory").onclick = () => {
    if (currentStoryIdx > 0) {
      currentStoryIdx--;
      updateNavState();
      renderCurrentPreview();
    }
  };

  document.getElementById("btnNextStory").onclick = () => {
    if (currentStoryIdx < stories.length - 1) {
      currentStoryIdx++;
      updateNavState();
      renderCurrentPreview();
    }
  };

  document.getElementById("btnDownloadSingle").onclick = () => {
    if (stories.length === 0) return;
    renderAndExportSingle(stories[currentStoryIdx]);
  };

  const btn30Inner = document.getElementById("btnLoad30Inner");
  if (btn30Inner) {
    btn30Inner.onclick = () => loadSample30();
  }

  document.getElementById("btnRenderBatch").onclick = () => {
    startBatchRender();
  };

  const btnAllRight = document.getElementById("btnDownloadAllRight");
  if (btnAllRight) {
    btnAllRight.onclick = () => {
      startBatchRender();
    };
  }
}

// PRELOAD IMAGE HELPER
function loadAvatarImage(filename) {
  return new Promise((resolve) => {
    if (avatarCache[filename]) {
      resolve(avatarCache[filename]);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `assets/avatars/${filename}`;
    img.onload = () => {
      avatarCache[filename] = img;
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
  });
}

// RENDER CANVAS (1080 x 1920)
async function drawStoryOnCanvas(story, themeName) {
  const isRandomAvatar = document.querySelector('input[name="avatarMode"]:checked').value === "random";
  const avatarFile = isRandomAvatar ? story.avatar : selectedAvatar;
  const avatarImg = await loadAvatarImage(avatarFile);

  const W = 1080;
  const H = 1920;

  // 1. BACKGROUND GRADIENT
  let bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  let cardBg = "#ffffff";
  let highlightColor = "#1e3a8a";
  let buttonBg = "#9d174d";
  let buttonTextColor = "#ffffff";
  let fontFam = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  if (themeName === "the-trang-hong") {
    bgGrad.addColorStop(0, "#fce7f3");
    bgGrad.addColorStop(1, "#fbcfe8");
    highlightColor = "#1e3a8a";
    buttonBg = "#9d174d";
  } else if (themeName === "the-trang-serif") {
    bgGrad.addColorStop(0, "#f7f4ed");
    bgGrad.addColorStop(1, "#ece6d8");
    fontFam = "Georgia, 'Times New Roman', serif";
    highlightColor = "#831843";
    buttonBg = "#831843";
  } else if (themeName === "the-trang-vang") {
    bgGrad.addColorStop(0, "#fffbeb");
    bgGrad.addColorStop(1, "#fef3c7");
    highlightColor = "#1d4ed8";
    buttonBg = "#ffffff";
    buttonTextColor = "#78350f";
  }

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. MAIN CARD
  const cardX = 64;
  const cardY = 140;
  const cardW = 952;
  const cardH = 1640;
  const cardR = 40;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;

  ctx.fillStyle = cardBg;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fill();
  ctx.restore();

  // 3. HEADER (AVATAR + NAME + BADGE + TIME)
  const avX = cardX + 44;
  const avY = cardY + 48;
  const avSize = 130;
  const avRadius = 24;

  ctx.save();
  drawRoundedRect(ctx, avX, avY, avSize, avSize, avRadius);
  ctx.clip();
  if (avatarImg) {
    ctx.drawImage(avatarImg, avX, avY, avSize, avSize);
  } else {
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(avX, avY, avSize, avSize);
  }
  ctx.restore();

  // Author Name
  const nameX = avX + avSize + 28;
  const nameY = avY + 54;
  ctx.fillStyle = "#111827";
  ctx.font = `bold 44px ${fontFam}`;
  ctx.fillText(story.author, nameX, nameY);

  // Verified Badge
  const nameWidth = ctx.measureText(story.author).width;
  drawVerifiedBadge(ctx, nameX + nameWidth + 16, nameY - 26, 32);

  // Subtitle / Time
  ctx.fillStyle = "#6b7280";
  ctx.font = `30px ${fontFam}`;
  const subText = story.pageName ? `(${story.timeAgo}) • ${story.pageName}` : `(${story.timeAgo})`;
  ctx.fillText(subText, nameX, nameY + 44);

  // 4. BODY STORY TEXT
  const textX = cardX + 44;
  let textY = avY + avSize + 60;
  const maxTextW = cardW - 88;

  const paragraphs = story.text.split("\n");
  ctx.font = `38px ${fontFam}`;

  for (let para of paragraphs) {
    if (!para.trim()) {
      textY += 24;
      continue;
    }
    textY = drawWrappedText(ctx, para, textX, textY, maxTextW, 62, story.highlights, highlightColor, fontFam);
    textY += 32;
  }

  // 5. BOTTOM CTA BUTTON
  const btnW = cardW - 88;
  const btnH = 96;
  const btnX = cardX + 44;
  const btnY = cardY + cardH - btnH - 48;
  const btnR = 48;

  ctx.fillStyle = buttonBg;
  if (themeName === "the-trang-vang") {
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, btnX, btnY, btnW, btnH, btnR);
    ctx.fill();
    ctx.stroke();
  } else {
    drawRoundedRect(ctx, btnX, btnY, btnW, btnH, btnR);
    ctx.fill();
  }

  ctx.fillStyle = buttonTextColor;
  ctx.font = `bold 34px ${fontFam}`;
  ctx.textAlign = "center";
  ctx.fillText(story.cta || "Continuer la lecture dans les commentaires", btnX + btnW / 2, btnY + 60);
  ctx.textAlign = "left";
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, highlights, highlightColor, fontFam) {
  const words = text.split(" ");
  let line = "";

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      drawLineWithHighlights(ctx, line.trim(), x, y, highlights, highlightColor, fontFam);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  drawLineWithHighlights(ctx, line.trim(), x, y, highlights, highlightColor, fontFam);
  return y + lineHeight;
}

function drawLineWithHighlights(ctx, lineText, x, y, highlights, highlightColor, fontFam) {
  let isHighlight = false;
  for (let h of highlights) {
    if (h && lineText.includes(h)) {
      isHighlight = true;
      break;
    }
  }

  if (isHighlight || (lineText.includes("«") && lineText.includes("»"))) {
    ctx.fillStyle = highlightColor;
    ctx.font = `bold 38px ${fontFam}`;
  } else {
    ctx.fillStyle = "#1f2937";
    ctx.font = `38px ${fontFam}`;
  }
  ctx.fillText(lineText, x, y);
}

function drawVerifiedBadge(ctx, x, y, size) {
  ctx.save();
  ctx.fillStyle = "#1D9BF0";
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y + size * 0.52);
  ctx.lineTo(x + size * 0.44, y + size * 0.68);
  ctx.lineTo(x + size * 0.74, y + size * 0.36);
  ctx.stroke();
  ctx.restore();
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y + r, x + r, y);
  ctx.closePath();
}

async function renderCurrentPreview() {
  if (stories.length === 0) return;
  const theme = selectTheme.value;
  await drawStoryOnCanvas(stories[currentStoryIdx], theme);
}

// GLOBAL AUDIO CONTEXT & NODES (REUSED ACROSS STORIES TO PREVENT INVALIDSTATEERROR)
let audioCtx = null;
let audioSourceNode = null;
let audioDestNode = null;

function getAudioStreamNodes() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioSourceNode = audioCtx.createMediaElementSource(audioPlayer);
    audioDestNode = audioCtx.createMediaStreamDestination();
    audioSourceNode.connect(audioDestNode);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return { audioCtx, audioDestNode };
}

// VIDEO RECORDING
async function recordVideoFromCanvas(durationSec, audioSrc, story, theme) {
  return new Promise(async (resolve, reject) => {
    try {
      const { audioCtx, audioDestNode } = getAudioStreamNodes();

      audioPlayer.src = audioSrc;
      audioPlayer.currentTime = 0;
      await audioPlayer.play();

      // 1. Initial draw
      await drawStoryOnCanvas(story, theme);

      // 2. Continuous render loop so Canvas stream pumps real video frames
      let isRecording = true;
      let frameCount = 0;
      const renderLoop = () => {
        if (!isRecording) return;
        drawStoryOnCanvas(story, theme);
        frameCount++;
        requestAnimationFrame(renderLoop);
      };
      renderLoop();

      // 3. Capture video stream at 30 fps
      const videoStream = canvas.captureStream(30);
      const audioTracks = audioDestNode.stream.getAudioTracks();
      if (audioTracks.length > 0) {
        videoStream.addTrack(audioTracks[0]);
      }

      let mimeType = "";
      const candidates = [
        "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
        "video/mp4;codecs=avc1",
        "video/mp4",
        "video/webm;codecs=h264,opus",
        "video/webm;codecs=vp9,opus",
        "video/webm"
      ];
      for (let c of candidates) {
        if (MediaRecorder.isTypeSupported(c)) {
          mimeType = c;
          break;
        }
      }

      console.log("Using recording MIME type:", mimeType);

      const recorder = new MediaRecorder(videoStream, {
        mimeType,
        videoBitsPerSecond: 3000000
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      let timerId = null;

      const finishRecording = () => {
        if (timerId) clearTimeout(timerId);
        if (recorder.state === "recording") {
          recorder.stop();
        }
      };

      recorder.onstop = () => {
        isRecording = false; // Stop canvas render loop
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        const blob = new Blob(chunks, { type: mimeType });
        console.log(`Finished recording: ${frameCount} frames, size: ${blob.size} bytes`);
        resolve({ blob, mimeType });
      };

      recorder.onerror = (err) => {
        isRecording = false;
        console.error("Recorder error:", err);
        reject(err);
      };

      recorder.start();

      timerId = setTimeout(finishRecording, durationSec * 1000);

    } catch (err) {
      console.error("recordVideoFromCanvas error:", err);
      reject(err);
    }
  });
}

// PURE JS ZIP CREATOR (NO EXTERNAL DEPENDENCIES)
function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createZipBlob(files) {
  let parts = [];
  let fileHeaders = [];
  let offset = 0;

  for (let f of files) {
    let nameBytes = new TextEncoder().encode(f.name);
    let dataBytes = f.data instanceof Uint8Array ? f.data : new Uint8Array(f.data);
    let crc = crc32(dataBytes);
    let len = dataBytes.length;

    let h = new Uint8Array(30 + nameBytes.length);
    let dv = new DataView(h.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 10, true);
    dv.setUint16(6, 0, true);
    dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true);
    dv.setUint16(12, 0, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, len, true);
    dv.setUint32(22, len, true);
    dv.setUint16(26, nameBytes.length, true);
    dv.setUint16(28, 0, true);
    h.set(nameBytes, 30);

    parts.push(h);
    parts.push(dataBytes);
    fileHeaders.push({ nameBytes, crc, len, offset });
    offset += h.length + dataBytes.length;
  }

  let cdStart = offset;
  let cdLen = 0;

  for (let fh of fileHeaders) {
    let cd = new Uint8Array(46 + fh.nameBytes.length);
    let dv = new DataView(cd.buffer);
    dv.setUint32(0, 0x02014b50, true);
    dv.setUint16(4, 10, true);
    dv.setUint16(6, 10, true);
    dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true);
    dv.setUint16(12, 0, true);
    dv.setUint16(14, 0, true);
    dv.setUint32(16, fh.crc, true);
    dv.setUint32(20, fh.len, true);
    dv.setUint32(24, fh.len, true);
    dv.setUint16(28, fh.nameBytes.length, true);
    dv.setUint16(30, 0, true);
    dv.setUint16(32, 0, true);
    dv.setUint16(34, 0, true);
    dv.setUint16(36, 0, true);
    dv.setUint32(38, 0, true);
    dv.setUint32(42, fh.offset, true);
    cd.set(fh.nameBytes, 46);

    parts.push(cd);
    cdLen += cd.length;
  }

  let eocd = new Uint8Array(22);
  let dv = new DataView(eocd.buffer);
  dv.setUint32(0, 0x06054b50, true);
  dv.setUint16(4, 0, true);
  dv.setUint16(6, 0, true);
  dv.setUint16(8, fileHeaders.length, true);
  dv.setUint16(10, fileHeaders.length, true);
  dv.setUint32(12, cdLen, true);
  dv.setUint32(16, cdStart, true);
  dv.setUint16(20, 0, true);

  parts.push(eocd);
  return new Blob(parts, { type: "application/zip" });
}

// EXPORT SINGLE STORY
async function renderAndExportSingle(story) {
  progressBox.style.display = "block";
  progressText.textContent = `Đang kết xuất Video cho: ${story.author}...`;
  progressFill.style.width = "40%";

  await drawStoryOnCanvas(story, selectTheme.value);

  const duration = parseInt(selectDuration.value) || 20;
  let audio = selectAudio.value;
  if (audio === "random") {
    audio = AUDIO_TRACKS[Math.floor(Math.random() * AUDIO_TRACKS.length)];
  }

  const { blob, mimeType } = await recordVideoFromCanvas(duration, audio, story, selectTheme.value);

  const ext = mimeType.includes("mp4") ? "mp4" : "webm";
  const slug = (story.author + "_" + story.index).toLowerCase().replace(/[^a-z0-9]/g, "_");
  downloadBlob(blob, `${slug}.${ext}`);

  const textContent = `${story.caption}\n\n--- COMMENT #1 ---\n\n${story.comment1}`;
  const textBlob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  downloadBlob(textBlob, `${slug}.txt`);

  progressFill.style.width = "100%";
  progressText.textContent = `Đã xuất xong cặp file: ${slug}.${ext} & ${slug}.txt!`;
  setTimeout(() => {
    progressBox.style.display = "none";
  }, 3000);
}

// BATCH RENDER ALL STORIES
async function startBatchRender() {
  if (stories.length === 0) {
    alert("Vui lòng nhập ít nhất 1 câu chuyện để render!");
    return;
  }

  const isZip = chkZipPackage.checked;
  const zipFiles = [];

  progressBox.style.display = "block";
  const duration = parseInt(selectDuration.value) || 20;
  const theme = selectTheme.value;

  for (let i = 0; i < stories.length; i++) {
    const s = stories[i];
    const pct = Math.round(((i) / stories.length) * 100);
    progressPercent.textContent = `${pct}%`;
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `Đang ghi video ${i + 1}/${stories.length}: ${s.author} (${s.pageName})`;
    progressDetail.textContent = `Thời lượng: ${duration}s/video | ${isZip ? "Đang gom vào gói ZIP..." : "Tải trực tiếp..."}`;

    // Render Canvas
    await drawStoryOnCanvas(s, theme);

    // Pick Audio
    let audio = selectAudio.value;
    if (audio === "random") {
      audio = AUDIO_TRACKS[i % AUDIO_TRACKS.length];
    }

    try {
      // Record with continuous canvas painting
      const { blob, mimeType } = await recordVideoFromCanvas(duration, audio, s, theme);
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      const slug = `story_${String(s.index).padStart(2, '0')}_${s.author.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const textContent = `${s.caption}\n\n--- COMMENT #1 ---\n\n${s.comment1}`;

      if (isZip) {
        // Add to ZIP files array
        const videoBuffer = await blob.arrayBuffer();
        zipFiles.push({ name: `${slug}.${ext}`, data: new Uint8Array(videoBuffer) });
        zipFiles.push({ name: `${slug}.txt`, data: new TextEncoder().encode(textContent) });
      } else {
        // Direct sequential downloads
        downloadBlob(blob, `${slug}.${ext}`);
        const textBlob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
        downloadBlob(textBlob, `${slug}.txt`);
      }
    } catch (err) {
      console.error(`Lỗi render bài ${i + 1}:`, err);
    }

    await new Promise(r => setTimeout(r, 400));
  }

  if (isZip) {
    progressText.textContent = `📦 Đang nén file ZIP chứa ${stories.length * 2} files...`;
    const zipBlob = createZipBlob(zipFiles);
    downloadBlob(zipBlob, `Batch_${stories.length}_Reels_Stories.zip`);
  }

  progressFill.style.width = "100%";
  progressPercent.textContent = "100%";
  progressText.textContent = `🎉 Hoàn tất thành công toàn bộ ${stories.length} Video & File TXT!`;
  progressDetail.textContent = isZip ? "File Batch_30_Reels_Stories.zip đã được tải về máy của bạn." : "Toàn bộ file đã tải về.";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
