import assert from 'node:assert/strict';
const base='http://127.0.0.1:3020';
async function request(url,method='GET',body){const r=await fetch(base+url,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});return {status:r.status,...await r.json()};}
if(!process.argv.includes('--assets-only')) {
const template=(await request('/api/templates')).data[0];
const created=await request('/api/batches','POST',{page_id:'free',locale:'fr',name:'[QA Codex] Cancel / Retry',items:[{template_id:template.id,palette_id:template.pals[0].id,background_video_url:'/assets/backgrounds/2.mp4',duration:5,resolution:'720x1280',story_payload:{author:'QA',content:'Ceci est une vérification du rendu.\nLe texte doit rester lisible.',caption:'Test',comment1:'Test',locale:'fr',renderConfig:{muted:true,fps:24}}}]});assert.equal(created.status,200);const id=created.data.id;
await request(`/api/batches/${id}/render`,'POST',{});
assert.equal((await request(`/api/batches/${id}/render`,'POST',{action:'cancel'})).status,200);
await new Promise(r=>setTimeout(r,3500));
const cancelled=await request(`/api/batches/${id}`);assert.equal(cancelled.data.batch.status,'cancelled');console.log('PASS cancel',id);
await request(`/api/batches/${id}/render`,'POST',{action:'retry'});
let detail;for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,1000));detail=await request(`/api/batches/${id}`);if(['completed','failed'].includes(detail.data.batch.status))break;}
assert.equal(detail.data.batch.status,'completed',JSON.stringify(detail));assert.equal(detail.data.batch.completed_items,1);
await request(`/api/batches/${id}/render`,'POST',{});await new Promise(r=>setTimeout(r,1000));
const again=await request(`/api/batches/${id}`);assert.equal(again.data.batch.completed_items,1);console.log('PASS retry/idempotent completed count');
const page=await request('/api/pages','POST',{name:'[QA disposable] Test preset',locale:'en'});assert.equal(page.status,200);
const deleted=await request(`/api/pages/${page.data.id}`,'DELETE');assert.equal(deleted.status,200);console.log('PASS add/delete isolated page');

}

const form=new FormData();form.set('kind','avatar');form.set('file',new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')],{type:'image/png'}),'qa-fixture.png');
const uploaded=await fetch(base+'/api/assets',{method:'POST',body:form});const upload=await uploaded.json();assert.equal(uploaded.status,200,JSON.stringify(upload));
const assets=await request('/api/assets');const avatar=assets.data.avatars.find(a=>a.image_path===upload.file_path);assert(avatar);
const removed=await request('/api/assets','DELETE',{kind:'avatar',id:avatar.id});assert.equal(removed.status,200);console.log('PASS multipart asset upload/list/delete');
