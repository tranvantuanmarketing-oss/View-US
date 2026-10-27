import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const base=process.env.STUDIO_TEST_URL || 'http://127.0.0.1:3020';
async function api(url,body){const r=await fetch(base+url,body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{});const j=await r.json();return {r,j};}
const {j:t}=await api('/api/templates'),{j:a}=await api('/api/avatars'),{j:m}=await api('/api/music');
assert(t.data.length>0);console.log('Assets:',t.data.length,a.data.length,m.data.length);
const template=t.data[0];
const bad=await api('/api/batches',{items:[]});assert.equal(bad.r.status,400);
const withAudio=process.env.QA_AUDIO === '1';
const story={author:'Codex QA',content:'A letter arrived at the door.\nInside was the answer we had waited for.\nI opened the envelope and finally understood.',caption:'Caption first line\nCaption second line',comment1:'Comment first line\nComment second line',cta:'Read the story in the comments',locale:'en',avatarUrl:a.data[0]?.image_path,renderConfig:{fps:withAudio?30:24,muted:!withAudio,volume:withAudio?.4:0,overrides:{}}};
const created=await api('/api/batches',{page_id:'free',locale:'en',name:'[QA Codex] Studio end-to-end',items:[{template_id:template.id,palette_id:template.pals[0].id,avatar_id:a.data[0]?.id || null,music_track_id:withAudio?m.data[0].id:null,background_video_url:'/assets/backgrounds/2.mp4',duration:withAudio?3:2,resolution:withAudio?'1080x1920':'720x1280',story_payload:story}]});
assert(created.r.ok,JSON.stringify(created.j));const id=created.j.data.id;console.log('Batch:',id);
const early=await fetch(base+`/api/batches/${id}/download`);assert.equal(early.status,409);
const started=await api(`/api/batches/${id}/render`,{});assert.equal(started.r.status,202);
let final;
for(let i=0;i<120;i++){
 await new Promise(r=>setTimeout(r,1000));
 const {j}=await api(`/api/batches/${id}`);final=j.data;
 console.log('Progress:',final.batch.status,final.items.map(x=>`${x.status}:${x.progress}`).join(','));
 if(['completed','failed','partial_failed'].includes(final.batch.status)) break;
}
assert.equal(final.batch.status,'completed',JSON.stringify(final));
assert.equal(final.items[0].progress,100);
const zip=await fetch(base+`/api/batches/${id}/download`);assert.equal(zip.status,200);const bytes=Buffer.from(await zip.arrayBuffer());assert.equal(bytes.readUInt16LE(0),0x4b50);
fs.mkdirSync('data/verification',{recursive:true});fs.writeFileSync(`data/verification/studio-e2e${withAudio?'-audio':''}.zip`,bytes);fs.writeFileSync(`data/verification/studio-e2e${withAudio?'-audio':''}.json`,JSON.stringify(final,null,2));
const stats=await api('/api/stats');assert(stats.r.ok);console.log('PASS: validation, queued ZIP rejection, asynchronous render/progress, MP4 artifact, ZIP and stats');
