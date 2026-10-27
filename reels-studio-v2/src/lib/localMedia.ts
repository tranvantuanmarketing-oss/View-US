import fs from 'fs';import path from 'path';import {Readable} from 'stream';
const types:Record<string,string>={'.mp4':'video/mp4','.webm':'video/webm','.mp3':'audio/mpeg','.m4a':'audio/mp4','.wav':'audio/wav','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.otf':'font/otf'};
export function serveLocalMedia(req:Request,folder:'assets'|'renders',parts:string[],head=false):Response {
 if(!parts.length||parts.some(p=>!p||p==='.'||p==='..'||/[\\/\x00]/.test(p)))return new Response(null,{status:404});
 try {
  const root=fs.realpathSync(path.join(process.cwd(),'public',folder)),file=fs.realpathSync(path.join(root,...parts));
  if(!file.startsWith(root+path.sep))return new Response(null,{status:404});
  const stat=fs.statSync(file),type=types[path.extname(file).toLowerCase()];if(!stat.isFile()||!type)return new Response(null,{status:404});
  let start=0,end=stat.size-1,status=200;const headers:Record<string,string>={'Content-Type':type,'Accept-Ranges':'bytes','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  const range=req.headers.get('range');
  if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m||(!m[1]&&!m[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${stat.size}`}});
   if(!m[1])start=Math.max(0,stat.size-Number(m[2]));else{start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}
   if(start>end||start>=stat.size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${stat.size}`}});status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
  }
  headers['Content-Length']=String(Math.max(0,end-start+1));
  return new Response(head||!stat.size?null:Readable.toWeb(fs.createReadStream(file,{start,end})) as ReadableStream,{status,headers});
 }catch{return new Response(null,{status:404});}
}
