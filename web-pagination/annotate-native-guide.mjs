import {readFileSync,writeFileSync,mkdtempSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const tmp=mkdtempSync('/private/tmp/story-narrated-');
const ff=path.resolve(root,'../reels-studio-v2/node_modules/ffmpeg-static/ffmpeg');
const source=path.join(root,'HUONG-DAN-SERIES-CHAPTER-TRANG-RIENG.mp4');
const seconds=s=>s.split(/[:,]/).reduce((a,n,i)=>a+Number(n)*[3600,60,1,.001][i],0);
const cues=readFileSync(source.replace('.mp4','.srt'),'utf8').trim().split(/\n\s*\n/).map(block=>{const [id,t,...text]=block.split('\n');const [start,end]=t.split(' --> ').map(seconds);return {id:Number(id),start,end,text:text.join(' ')};});
const voices=[
'Bước một. Vào mục Series bên trái. Bấm New series để tạo bộ truyện mới.',
'Điền tên truyện, chọn ảnh bìa và viết mô tả ngắn. Lưu ý: mô tả của bộ truyện chỉ là giới thiệu, không dán toàn bộ các phần vào đây.',
'Đây là tên và mô tả minh họa. Bạn thay bằng thông tin của truyện thật.',
'Khi làm thật, bấm Save để lưu bộ truyện. Trong video, tôi hủy bản mẫu và dùng bộ truyện đã tạo sẵn.',
'Tìm bộ truyện cần thêm phần. Tại cột thao tác, bấm biểu tượng danh sách. Trong cửa sổ vừa mở, bấm Create chapter để tạo chương.',
'Dán nội dung vào ô Description. Đầu mỗi phần ghi chữ CHAPTER, số thứ tự, dấu gạch ngang, rồi tên phần. Tiếp theo là nội dung của phần đó.',
'Bật Keep chapter name để giữ tên chương. Bấm Analyze chapters. Kiểm tra xem hệ thống đã tách đúng số phần hay chưa.',
'Sửa tên từng phần ngay trong danh sách chương. Bạn có thể đặt tên theo ngôn ngữ của bài.',
'Bấm Edit ở từng chương để kiểm tra nội dung. Đảm bảo mỗi chương chỉ chứa đúng phần của nó, không bị thiếu hay lặp.',
'Published nghĩa là xuất bản. Hai ô Show on home và Top news là tùy chọn hiển thị, bật hoặc tắt theo nhu cầu.',
'Sau khi kiểm tra xong nội dung thật, bấm Save để tạo trang riêng cho từng chương. Riêng bản minh họa này, tôi bấm Cancel để không đăng thêm dữ liệu mẫu.',
'Đây là kết quả thật trên website. Cuối phần một có nút Next Chapter. Bấm nút này để sang phần hai.',
'Hệ thống đã chuyển sang chương hai, với nội dung và đường dẫn riêng. Đây không phải cách ẩn hiện các phần trên cùng một trang.',
'Kiểm tra nút phần trước, phần sau và danh sách chương ở bên phải. Cuối cùng, sao chép đường dẫn của chương một để gắn vào bài Facebook.'
];
// Coordinates measured against the captured 1920×1080 viewport; show pointers only on stable shots.
const arrows=[
 [0,1.8,1690,162], [4,6.8,1410,275], [8,10.1,1040,550],
 [16,19.1,1280,175],
 [21.3,23,780,635], [24,27.2,850,450],
 [28,29.4,760,480], [29.5,31.6,530,560],
 [33,35,920,330], [35.2,36,1350,330], [37,41.6,900,790],
 [41.9,44.7,470,820], [45,47.5,1410,875],
 [52,54.8,1100,285], [59,62.3,1505,300]
];
const stamp=t=>{const cs=Math.round(t*100);return `${Math.floor(cs/360000)}:${String(Math.floor(cs/6000)%60).padStart(2,'0')}:${String(Math.floor(cs/100)%60).padStart(2,'0')}.${String(cs%100).padStart(2,'0')}`;};
const header=`[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,32,&H000000FF,&H000000FF,&H00FFFFFF,&H00000000,1,0,0,0,100,100,0,0,1,2,0,7,0,0,0,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
const run=(bin,args)=>{const p=spawnSync(bin,args,{encoding:'utf8',maxBuffer:8e6});if(p.status!==0)throw Error(p.stderr||`Failed ${bin}`);return p.stdout;};
let total=0;const chapters=[];
for(const c of cues){
 const audio=path.join(tmp,`${c.id}.aiff`);
 run('/usr/bin/say',['-v','Linh','-r','165','-o',audio,voices[c.id-1]]);
 const info=run('/usr/bin/afinfo',[audio]);
 const spoken=Number(info.match(/estimated duration:\s+([\d.]+)/)?.[1]);
 if(!(spoken>.1))throw Error('No speech generated');
 const original=c.end-c.start,duration=Math.max(original,spoken+.9),factor=duration/original;
 let ass=header;
 for(const [a,b,x,y] of arrows){
  const begin=Math.max(a,c.start)-c.start,end=Math.min(b,c.end)-c.start;
  if(end<=begin)continue;
  const sx=x>1250?x-190:x+190,sy=y<190?y+130:y-100;
  const dx=x-sx,dy=y-sy,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
  const bx=x-34*ux,by=y-34*uy;
  const p=(px,py)=>`${Math.round(px)} ${Math.round(py)}`;
  const poly=`m ${p(sx-5*uy,sy+5*ux)} l ${p(bx-5*uy,by+5*ux)} ${p(bx-18*uy,by+18*ux)} ${p(x,y)} ${p(bx+18*uy,by-18*ux)} ${p(bx+5*uy,by-5*ux)} ${p(sx+5*uy,sy-5*ux)}`;
  ass+=`Dialogue: 1,${stamp(begin)},${stamp(end)},Default,,0,0,0,,{\\an7\\pos(0,0)\\p1}${poly}\n`;
 }
 ass+=`Dialogue: 2,0:00:00.00,${stamp(original)},Default,,0,0,0,,{\\an7\\pos(105,35)\\bord3\\1c&HFFFFFF&\\3c&H1D1DDC&}HƯỚNG DẪN ${c.id}/${cues.length}\n`;
 const assfile=path.join(tmp,`${c.id}.ass`),out=path.join(tmp,`${c.id}.mp4`);writeFileSync(assfile,ass);
 run(ff,['-hide_banner','-loglevel','error','-y','-ss',String(c.start),'-t',String(original),'-i',source,'-i',audio,'-filter_complex',`[0:v]subtitles=${assfile},setpts=${factor}*PTS,fps=25[v];[1:a]aresample=48000,apad,atrim=duration=${duration},asetpts=PTS-STARTPTS[a]`,'-map','[v]','-map','[a]','-t',String(duration),'-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k',out]);
 chapters.push({step:c.id,start:total,duration,narration:voices[c.id-1]});total+=duration;
 console.log(`Finished ${c.id}/${cues.length}, ${duration.toFixed(1)} seconds`);
}
const list=path.join(tmp,'concat.txt');writeFileSync(list,cues.map(c=>`file '${path.join(tmp,`${c.id}.mp4`)}'`).join('\n'));
const output=path.join(root,'HUONG-DAN-SERIES-MUI-TEN-VA-GIONG-DOC.mp4');
run(ff,['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart',output]);
writeFileSync(path.join(root,'HUONG-DAN-SERIES-MUI-TEN-VA-GIONG-DOC.json'),JSON.stringify({output,total,voice:'macOS Linh vi_VN',chapters},null,2));
console.log(JSON.stringify({output,total,tmp}));
