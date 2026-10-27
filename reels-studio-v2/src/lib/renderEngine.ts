import fs from "fs";
import path from "path";
import os from "os";
import { execFile, spawn } from "child_process";
import { promisify } from "util";
import ffmpegStatic from "ffmpeg-static";
import templatesData from "@/data/templates.json";
import { buildTemplateHtml } from "./templateRenderer";
import { Template } from "./types";
import {isOpaquePng,renderThreads} from './renderPerformance';
const execute = promisify(execFile);
export interface RenderResult {success:boolean;outputPath?:string;outputVideoUrl?:string;captionPath?:string;duration?:number;resolution?:string;fileSizeBytes?:number;error?:string;}
export function findChromePath(): string | null {
  return [process.env.CHROME_BIN,"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome","C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe","/usr/bin/google-chrome","/usr/bin/chromium"].find(p=>p && fs.existsSync(p)) || null;
}
export function publicAsset(url:string,root=process.cwd()) {
  if (!url || !url.startsWith("/assets/")) throw new Error("Asset phải nằm trong kho /assets/.");
  const base=path.resolve(root,"public/assets");
  const candidate=path.resolve(root,"public",url.replace(/^\//,""));
  if(!candidate.startsWith(base+path.sep) || !fs.existsSync(candidate)) throw new Error(`Không tìm thấy asset: ${url}`);
  return candidate;
}
export async function renderBatchItemVideo(item:any,options:{cwd?:string;outputDir?:string;onProgress?:(p:number)=>void;isCancelled?:()=>boolean}={}):Promise<RenderResult> {
  const root=options.cwd || process.cwd();
  if(!/^[\w-]+$/.test(item.id) || !/^[\w-]+$/.test(item.batch_id)) throw new Error("Mã item/lô không hợp lệ.");
  const duration=Number(item.duration || 10);
  const resolution=item.resolution || "720x1280";
  if(!Number.isFinite(duration) || duration<1 || duration>180 || !["720x1280","1080x1920","1440x2560"].includes(resolution)) throw new Error("Thời lượng hoặc độ phân giải không hợp lệ.");
  const [w,h]=resolution.split("x").map(Number);
  const story=typeof item.story_payload === "string"?JSON.parse(item.story_payload):item.story_payload || {};
  const cfg=story.renderConfig || {};
  const fps=[24,30].includes(cfg.fps)?cfg.fps:30;
  const volume=Math.min(1,Math.max(0,Number(cfg.volume ?? .8)));
  const tpl=(templatesData as unknown as Template[]).find(t=>t.id===item.template_id);
  if(!tpl) throw new Error("Không tìm thấy mẫu đã chọn.");
  const pal=tpl.pals.findIndex(p=>p.id===item.palette_id);
  if(pal<0) throw new Error("Palette không thuộc mẫu đã chọn.");
  const bg=publicAsset(item.background_video_url || "/assets/backgrounds/2.mp4",root);
  const audio=!cfg.muted && cfg.trackPath?publicAsset(cfg.trackPath,root):null;
  let avatar=story.avatarUrl;
  if(avatar?.startsWith("/assets/")) {
    const file=publicAsset(avatar,root);const ext=path.extname(file).toLowerCase();
    avatar=`data:image/${ext===".png"?"png":ext===".webp"?"webp":"jpeg"};base64,${fs.readFileSync(file).toString("base64")}`;
  }
  const html=buildTemplateHtml(tpl,pal,story.locale || "en",cfg.overrides || {},{name:story.author || undefined,time:story.timeAgo || undefined,body:story.content,highlights:story.highlights,cta:story.cta,avatarUrl:avatar});
  const chrome=findChromePath();if(!chrome) throw new Error("Cần Google Chrome hoặc CHROME_BIN để dựng thẻ.");
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),"the-story-render-"));
  const output=options.outputDir || path.join(root,"public/renders",`batch_${item.batch_id}`);fs.mkdirSync(output,{recursive:true});
  const name=`story_${String(item.seq || 1).padStart(2,"0")}_${item.id}.mp4`;
  const destination=path.join(output,name);
  const pending=path.join(output,name+".part.mp4");
  try {
    options.onProgress?.(1);
    const htmlFile=path.join(temp,"card.html"),png=path.join(temp,"card.png");
    // Capture the exact same 720×1280 template as preview. Scale the full card, never crop its text.
    fs.writeFileSync(htmlFile,`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}<style>body{transform:scale(${w/720});transform-origin:top left}html{width:${w}px;height:${h}px;overflow:hidden}</style></body></html>`);
    await execute(chrome,["--headless=new","--disable-gpu",`--user-data-dir=${path.join(temp,"chrome")}`,"--hide-scrollbars","--no-first-run",`--window-size=${w},${h}`,"--force-device-scale-factor=1","--virtual-time-budget=2000",`--screenshot=${png}`,`file://${htmlFile}`],{timeout:60000,maxBuffer:4*1024*1024});
    options.onProgress?.(10);
    if(options.isCancelled?.()) throw new Error("Đã hủy lô.");
    const opaque=isOpaquePng(fs.readFileSync(png));
    // The old pipeline decoded/scaled a background that a full-frame opaque
    // card completely hides. Read the still once/second and duplicate frames
    // only after pixel conversion; preserve the same frame rate and CRF.
    const args=opaque?["-y","-loop","1","-framerate","1","-i",png]:["-y","-stream_loop","-1","-i",bg,"-loop","1","-framerate",String(fps),"-i",png];
    if(audio) args.push("-stream_loop","-1","-i",audio);
    if(opaque)args.push("-vf",`format=yuv420p,fps=${fps}`,"-map","0:v:0");
    else args.push("-filter_complex",`[0:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},setsar=1[bg];[1:v]scale=${w}:${h}[card];[bg][card]overlay=0:0:shortest=1[v]`,"-map","[v]");
    if(audio) args.push("-map",opaque?"1:a:0":"2:a:0","-af",`volume=${volume},afade=t=in:st=0:d=0.25,afade=t=out:st=${Math.max(0,duration-.6)}:d=0.6`,"-c:a","aac","-b:a","192k");
    else args.push("-an");
    args.push("-t",String(duration),"-r",String(fps),"-c:v","libx264","-threads",String(renderThreads()),"-preset","veryfast","-crf","20","-pix_fmt","yuv420p","-movflags","+faststart","-progress","pipe:1","-nostats",pending);
    await new Promise<void>((resolve,reject)=>{
      const child=spawn(ffmpegStatic!,args,{stdio:["ignore","pipe","pipe"]});let errors="";let buffer="";
      const timer=setInterval(()=>{if(options.isCancelled?.()) child.kill("SIGTERM");},300);
      child.stdout.on("data",chunk=>{buffer+=chunk.toString();const lines=buffer.split("\n");buffer=lines.pop() || "";for(const line of lines){const m=line.match(/^out_time_us=(\d+)/);if(m) options.onProgress?.(Math.min(98,10+Math.round(Number(m[1])/1e6/duration*88)));}});
      child.stderr.on("data",chunk=>errors=(errors+chunk).slice(-4000));
      child.on("error",err=>{clearInterval(timer);reject(err);});
      child.on("close",code=>{clearInterval(timer);if(code===0) resolve();else reject(new Error(options.isCancelled?.()?"Đã hủy lô.":`FFmpeg: ${errors.slice(-1500)}`));});
    });
    // Decode the complete artifact before promoting it to completed.
    await execute(ffmpegStatic!,["-v","error","-xerror","-threads","2","-i",pending,"-f","null","-"],{timeout:120000,maxBuffer:1024*1024});
    fs.renameSync(pending,destination);
    const caption=path.join(output,`story_${String(item.seq || 1).padStart(2,"0")}_caption.txt`);
    fs.writeFileSync(caption,`Author: ${story.author || ""}\nPage: ${cfg.pageDisplayName || ""}\nContent:\n${story.content || ""}\n\nCaption:\n${story.caption || ""}\n\nComment 1:\n${story.comment1 || ""}\n`);
    options.onProgress?.(100);
    return {success:true,outputPath:destination,outputVideoUrl:`/renders/batch_${item.batch_id}/${name}`,captionPath:caption,duration,resolution,fileSizeBytes:fs.statSync(destination).size};
  } finally {fs.rmSync(temp,{recursive:true,force:true});if(fs.existsSync(pending)) fs.unlinkSync(pending);}
}
