import test from 'node:test';import assert from 'node:assert/strict';
import {Meta} from '../meta.mjs';import {assertRemoteSchedule,uploadScheduledReel} from '../meta-schedule.mjs';
test('scheduled finish uses SCHEDULED and exact UTC Unix time, never PUBLISHED',async()=>{
 let form;const api=new Meta('secret','v26.0',async(url,o)=>{form=Object.fromEntries(o.body);return new Response('{"success":true}');});
 await api.schedule('123','456','title','caption','2026-10-27T06:00:00Z');assert.equal(form.video_state,'SCHEDULED');assert.equal(form.scheduled_publish_time,'1793080800');assert.equal(form.upload_phase,'finish');
});
test('upload requires confirmed matching remote timestamp; no fallback publication',async()=>{
 const at='2026-10-27T06:00:00Z',updates=[],events=[];let schedules=0;
 const api={start:async()=>({video_id:'123',upload_url:'x'}),upload:async()=>({success:true}),schedule:async()=>{schedules++;return {success:true};},scheduledStatus:async()=>({scheduled_publish_time:new Date(at).getTime()/1000})};
 const opts={job:{scheduled_at:at},page:{id:'p'},asset:{file:'file'},api,update:v=>updates.push(v),event:v=>events.push(v),clock:()=>new Date(at).getTime()-3600000};
 await uploadScheduledReel(opts);assert.equal(schedules,1);assert.equal(updates.at(-1).status,'checking');assert.equal(events.length,1);
 assert.throws(()=>assertRemoteSchedule({},at),/chưa xác nhận/);
 assert.equal(assertRemoteSchedule({scheduled_publish_time:'2026-10-27T06:00:00+0000'},at),true);
 await assert.rejects(()=>uploadScheduledReel({...opts,clock:()=>new Date(at).getTime()-60000}),/20 phút/);assert.equal(schedules,1);
});
