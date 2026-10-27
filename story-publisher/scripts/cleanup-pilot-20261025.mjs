// Explicitly authorized one-off cleanup. Never DELETE a Page node.
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {decrypt} from '../core.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const execute=process.argv.includes('--execute-confirmed');
const targets=[
 ['783405241533648',12,10],['862640380267439',2,0],
 ['664859260049031',11,9],['107489462228044',2,0],['104625669131300',3,0]
];
const pageIds=new Set(targets.map(x=>x[0]));
const db=new DatabaseSync(path.join(root,'data/publisher.db'),{readOnly:true});
const key=readFileSync(path.join(root,'data/secret.key'));
const report={startedAt:new Date().toISOString(),execute,scope:'Old posts and videos only. Page nodes never deleted.',pages:[]};
const out=path.join(root,'data/verification/cleanup-20261025');
mkdirSync(out,{recursive:true,mode:0o700});
function save(){writeFileSync(path.join(out,execute?'execution.json':'inventory.json'),JSON.stringify(report,null,2),{mode:0o600});}
async function call(token,node,params={},method='GET'){
 if(!/^[\d_]+(?:\/(?:posts|videos))?$/.test(node)&&node!=='me')throw Error('Invalid target');
 if(method==='DELETE'&&(pageIds.has(node)||!/^[\d_]+$/.test(node)))throw Error('Refusing Page or edge deletion');
 const url=new URL(`https://graph.facebook.com/v26.0/${node}`);
 url.search=new URLSearchParams(params).toString();
 const r=await fetch(url,{method,headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(45000)});
 const b=await r.json();
 if(!r.ok||b.error)throw Error(`Meta ${b.error?.code||r.status}: ${String(b.error?.message||'Request failed').replaceAll(token,'[secret]')}`);
 return b;
}
async function list(token,id,edge){
 const items=new Map();let after;
 for(let n=0;n<100;n++){
  const b=await call(token,`${id}/${edge}`,{fields:'id,created_time',limit:'100',...(after?{after}:{})});
  if(!Array.isArray(b.data))throw Error('Missing list');
  for(const item of b.data){if(!/^[\d_]+$/.test(item.id)||pageIds.has(item.id))throw Error('Invalid content ID');items.set(item.id,item);}
  after=b.paging?.next?b.paging?.cursors?.after:null;
  if(!after)return [...items.values()];
 }
 throw Error('Incomplete pagination');
}
const sessions=[];
// Resolve and validate every exact Page before any mutation.
for(const [id,expectedPosts,expectedVideos] of targets){
 const page=db.prepare('SELECT id,name,token FROM pages WHERE id=?').get(id);
 if(!page?.token)throw Error(`Missing connection ${id}`);
 const token=decrypt(page.token,key),me=await call(token,'me',{fields:'id,name'});
 if(String(me.id)!==id)throw Error(`Token identity mismatch ${id}`);
 const posts=await list(token,id,'posts'),videos=await list(token,id,'videos');
 if(posts.some(p=>!p.id.startsWith(id+'_')))throw Error(`Post ownership mismatch ${id}`);
 if(posts.length!==expectedPosts||videos.length!==expectedVideos)throw Error(`Inventory changed on ${id}; stop for renewed scope review`);
 const entry={id,name:me.name,postsBefore:posts,videosBefore:videos,results:[]};
 report.pages.push(entry);sessions.push({token,entry});
 console.log(JSON.stringify({phase:'inventory',id,name:me.name,posts:posts.length,videos:videos.length}));save();
}
if(execute){
 for(const {token,entry} of sessions){
  // Delete videos first; deleting their feed stories may also remove their post nodes.
  for(const video of entry.videosBefore){
   try{const b=await call(token,video.id,{},'DELETE');entry.results.push({kind:'video',id:video.id,success:b===true||b.success===true,response:b});}
   catch(e){entry.results.push({kind:'video',id:video.id,error:e.message});}
   save();
  }
  const remaining=await list(token,entry.id,'posts'),oldPosts=new Set(entry.postsBefore.map(x=>x.id));
  for(const post of remaining.filter(x=>oldPosts.has(x.id))){
   try{const b=await call(token,post.id,{},'DELETE');entry.results.push({kind:'post',id:post.id,success:b===true||b.success===true,response:b});}
   catch(e){entry.results.push({kind:'post',id:post.id,error:e.message});}
   save();
  }
  entry.postsAfter=await list(token,entry.id,'posts');entry.videosAfter=await list(token,entry.id,'videos');
  entry.pageAfter=await call(token,'me',{fields:'id,name'});
  console.log(JSON.stringify({phase:'verified',id:entry.id,postsRemaining:entry.postsAfter.length,videosRemaining:entry.videosAfter.length,pageStillExists:entry.pageAfter.id===entry.id,errors:entry.results.filter(x=>x.error)}));save();
 }
}
report.finishedAt=new Date().toISOString();save();
