import{mkdtempSync,writeFileSync}from'node:fs';import{tmpdir}from'node:os';import path from'node:path';import assert from'node:assert/strict';import{planSlots,localParts}from'../core.mjs';
const base='http://127.0.0.1:3030',pageIds=['104625669131300','664859260049031','862640380267439','783405241533648','107489462228044'];
async function api(route,body){const r=await fetch(base+route,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json','X-Story-Client':'publisher'},body:JSON.stringify(body)}),j=await r.json();if(!r.ok)throw Error(j.error);return j;}
function build(state,after){
 const day=localParts(new Date(after),'Europe/Warsaw').day;
 return pageIds.map((id,index)=>{
  const p=state.pages.find(p=>p.id===id);assert(p&&p.country==='PL'&&p.zone==='Asia/Ho_Chi_Minh','Unexpected Page or timezone');
  const polishSlots=['06:30','09:30','12:30','16:00','19:00'].map(s=>{const [h,m]=s.split(':').map(Number),minutes=h*60+m+index*5;return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');});
  const sample=planSlots('Europe/Warsaw',polishSlots,5,Date.parse(day+'T00:00:00Z')-3600000);
  const vnSlots=sample.map(t=>localParts(new Date(t),'Asia/Ho_Chi_Minh').time).sort();
  const jobs=state.jobs.filter(j=>j.page_id===id&&j.status==='scheduled'&&!j.video_id).sort((a,b)=>{const an=state.assets.find(x=>x.id===a.asset_id),bn=state.assets.find(x=>x.id===b.asset_id);assert(an?.page_id===id&&bn?.page_id===id,'Wrong asset owner');return an.name.localeCompare(bn.name,'en',{numeric:true});});
  const reserved=state.jobs.filter(j=>j.page_id===id&&j.status!=='scheduled'&&j.status!=='cancelled').map(j=>j.scheduled_at);
  const times=jobs.length?planSlots('Europe/Warsaw',polishSlots,jobs.length,after,reserved):[];
  return {page:p,polishSlots,vnSlots,items:jobs.map((j,i)=>({id:j.id,at:times[i],oldAt:j.scheduled_at,assetId:j.asset_id,title:j.title}))};
 });
}
const before=await api('/api/state'),after=Date.now(),plans=build(before,after),all=plans.flatMap(p=>p.items).sort((a,b)=>a.at.localeCompare(b.at));
for(let i=1;i<all.length;i++)assert(Date.parse(all[i].at)-Date.parse(all[i-1].at)>=5*60000,'Schedules too close');
console.log(JSON.stringify(plans.map(p=>({name:p.page.name,poland:p.polishSlots,vietnam:p.vnSlots,waiting:p.items.length,first:p.items[0]?{vn:localParts(new Date(p.items[0].at),'Asia/Ho_Chi_Minh'),poland:localParts(new Date(p.items[0].at),'Europe/Warsaw')}:null})),null,2));
if(process.argv.includes('--apply')){
 const backup=mkdtempSync(path.join(tmpdir(),'story-polish-schedule-'));writeFileSync(path.join(backup,'before.json'),JSON.stringify(before,null,2),{mode:0o600});writeFileSync(path.join(backup,'plan.json'),JSON.stringify(plans,null,2),{mode:0o600});
 const current=await api('/api/state');assert.deepEqual(current.jobs,before.jobs,'Jobs changed; re-run preview');assert.deepEqual(current.pages,before.pages,'Pages changed; re-run preview');
 for(const p of plans)await api('/api/pages',{id:p.page.id,name:p.page.name,country:p.page.country,zone:p.page.zone,slots:p.vnSlots});
 for(const p of plans)for(const item of p.items)await api('/api/reschedule',{id:item.id,at:item.at});
 const final=await api('/api/state');assert.equal(final.jobs.length,before.jobs.length);assert.equal(final.assets.length,before.assets.length);
 for(const old of before.jobs){const job=final.jobs.find(j=>j.id===old.id),planned=all.find(p=>p.id===old.id);if(planned){assert.equal(job.scheduled_at,planned.at);for(const key of ['id','page_id','asset_id','title','caption','comment','status','video_id','published_at'])assert.equal(job[key],old[key]);}else assert.deepEqual(job,old);}
 for(const p of plans)assert.deepEqual(final.pages.find(x=>x.id===p.page.id).slots,p.vnSlots);
 writeFileSync(path.join(backup,'after.json'),JSON.stringify(final,null,2),{mode:0o600});console.log(JSON.stringify({applied:true,pages:plans.length,rescheduled:all.length,backup}));
}
