globalThis.PublisherDashboard=(()=>{
 const zone='Asia/Ho_Chi_Minh';
 function dayKey(at){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(at)).map(p=>[p.type,p.value]));return `${p.year}-${p.month}-${p.day}`;}
 function addDays(day,n){return new Date(Date.parse(day+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);}
 function time24(at){return new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(at));}
 function stamp(j){return j.published_at||j.scheduled_at;}
 function jobsFor(jobs,pageId=''){return jobs.filter(j=>j.status!=='cancelled'&&(!pageId||j.page_id===pageId));}
 function hours(jobs,day,pageId=''){const rows=Array.from({length:24},(_,h)=>({hour:String(h).padStart(2,'0')+':00',jobs:[]}));for(const j of jobsFor(jobs,pageId).filter(j=>dayKey(stamp(j))===day).sort((a,b)=>stamp(a).localeCompare(stamp(b))))rows[Number(time24(stamp(j)).slice(0,2))].jobs.push(j);return rows;}
 function series(jobs,{pageId='',period='day',month,year}){
  const chosen=jobsFor(jobs,pageId),monthly=period==='month';
  const count=monthly?12:new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5)),0)).getUTCDate();
  const bins=Array.from({length:count},(_,i)=>{const key=monthly?`${year}-${String(i+1).padStart(2,'0')}`:`${month}-${String(i+1).padStart(2,'0')}`;return {key,label:monthly?'T'+String(i+1).padStart(2,'0'):String(i+1).padStart(2,'0'),published:0,waiting:0};});
  const byKey=new Map(bins.map(b=>[b.key,b]));
  for(const j of chosen){if(j.published_at){const key=dayKey(j.published_at).slice(0,monthly?7:10);if(byKey.has(key))byKey.get(key).published++;}else if(['scheduled','starting','uploading','finishing','checking'].includes(j.status)){const key=dayKey(j.scheduled_at).slice(0,monthly?7:10);if(byKey.has(key))byKey.get(key).waiting++;}}
  return bins;
 }
 return {dayKey,addDays,time24,stamp,jobsFor,hours,series};
})();
