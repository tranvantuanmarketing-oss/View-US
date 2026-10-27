import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const folders=process.argv.slice(2);
if(folders.length<2)throw Error('Pass at least two frame directories');
const stem=process.env.STORY_GUIDE_STEM||'HUONG-DAN-CHIA-PART';
if(!/^[A-Z0-9-]+$/.test(stem))throw Error('Invalid output stem');
const frames=folders.flatMap(folder=>{
 const source=JSON.parse(readFileSync(path.join(folder,'frames.json'),'utf8'));
 return source.map((f,i)=>({...f,duration:i+1<source.length?Math.max(.04,source[i+1].t-f.t):1}));
});
if(frames.length<20)throw Error('Not enough captured browser frames');
const stamp=t=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
const wrap=s=>s.length>100?s.replace(/(.{40,95})\s/,'$1\n'):s;
let time=0;const captions=[];
const concat=['ffconcat version 1.0'];
for(const f of frames){
 concat.push(`file '${f.file}'`,`duration ${f.duration.toFixed(3)}`);
 const last=captions.at(-1);
 if(last?.text===f.label)last.end=time+f.duration;
 else captions.push({start:time,end:time+f.duration,text:f.label});
 time+=f.duration;
}
concat.push(`file '${frames.at(-1).file}'`);
const list=path.join(root,`${stem}.ffconcat`),subs=path.join(root,`${stem}.srt`),output=path.join(root,`${stem}.mp4`);
writeFileSync(list,concat.join('\n'));
writeFileSync(subs,captions.map((c,i)=>`${i+1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${wrap(c.text)}\n`).join('\n'));
const ffmpeg=path.resolve(root,'../reels-studio-v2/node_modules/ffmpeg-static/ffmpeg');
const filter=`fps=25,scale=1920:960:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:0:color=0x0f172a,setsar=1,subtitles=${subs}:force_style='FontName=Arial,FontSize=12,PrimaryColour=&H00FFFFFF,OutlineColour=&H002A170F,BorderStyle=1,Outline=1,Alignment=2,MarginV=6'`;
const result=spawnSync(ffmpeg,['-hide_banner','-loglevel','warning','-y','-f','concat','-safe','0','-i',list,'-vf',filter,'-r','25','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',output],{stdio:'inherit'});
if(result.status)throw Error('Video encoding failed');
console.log(JSON.stringify({output,seconds:time,frames:frames.length,captions:captions.length}));
