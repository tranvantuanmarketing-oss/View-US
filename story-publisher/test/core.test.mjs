import test from 'node:test';import assert from 'node:assert/strict';import {randomBytes} from 'node:crypto';
import {parseText,encrypt,decrypt,planSlots,isPublished,validateSlots} from '../core.mjs';import {Meta} from '../meta.mjs';
test('minute-level page slots validate, persist as HH:mm and reserve precise future minutes',()=>{
 assert.deepEqual(validateSlots(['16:15','12:10','12:10']),['12:10','16:15']);
 assert.throws(()=>validateSlots(['12:60']));
 assert.deepEqual(planSlots('Asia/Ho_Chi_Minh',['12:10','16:15'],2,Date.parse('2026-10-25T04:00:00Z')),['2026-10-25T05:10:00.000Z','2026-10-25T09:15:00.000Z']);
 assert.deepEqual(planSlots('Asia/Ho_Chi_Minh',['12:10','16:15'],1,Date.parse('2026-10-25T04:00:00Z'),['2026-10-25T05:10:00Z']),['2026-10-25T09:15:00.000Z']);
});
test('Studio TXT preserves multiline caption and comment, UTF-8 and UTF-16 BOM',()=>{
 const s='Title: Example\nContent:\nVideo story\n\nCaption:\nFirst line\nSecond line\n\nComment 1:\nRead here\nhttps://example.com/story\n';
 for(const b of [Buffer.from('\ufeff'+s),Buffer.concat([Buffer.from([255,254]),Buffer.from(s,'utf16le')])]){
 const p=parseText(b);assert.equal(p.caption,'First line\nSecond line');assert.equal(p.comment,'Read here\nhttps://example.com/story');assert.equal(p.content,'Video story');}
});
test('tokens encrypted with authenticated encryption',()=>{const k=randomBytes(32),v=encrypt('secret-token',k);assert.ok(!v.includes('secret-token'));assert.equal(decrypt(v,k),'secret-token');assert.throws(()=>decrypt(v,randomBytes(32)));});
test('spring DST nonexistent slot skipped; fall-back local slot not duplicated',()=>{
 const spring=planSlots('America/New_York',['02:30'],2,Date.parse('2026-03-08T00:00:00Z'));
 assert.deepEqual(spring,['2026-03-09T06:30:00.000Z','2026-03-10T06:30:00.000Z']);
 const fall=planSlots('America/New_York',['01:30'],2,Date.parse('2026-11-01T00:00:00Z'));
 assert.deepEqual(fall,['2026-11-01T05:30:00.000Z','2026-11-02T06:30:00.000Z']);
});
test('reserved slots skipped and timezone not machine-dependent',()=>{assert.deepEqual(planSlots('Europe/Paris',['19:00'],1,Date.parse('2026-10-23T00:00:00Z'),['2026-10-23T17:00:00Z']),['2026-10-24T17:00:00.000Z']);});
test('ready alone is not published',()=>{assert.equal(isPublished({video_status:'ready'}),false);assert.equal(isPublished({publishing_phase:{publish_status:'published'}}),true);});
test('Meta adapter uses Page token, returned upload host allowlist, and publication fields',async()=>{
 const calls=[],api=new Meta('test-token','v26.0',async(url,opts)=>{calls.push({url:String(url),opts});return new Response(JSON.stringify({id:'12345',name:'QA',success:true}));});
 await api.verify('12345');await assert.rejects(api.verify('99999'));
 await assert.rejects(api.upload('https://attacker.example/upload','/tmp/no-file'));
 await api.finish('12345','67890','Title','Caption');
 const last=calls.at(-1);assert.ok(last.url.endsWith('/12345/video_reels'));assert.equal(last.opts.body.get('video_state'),'PUBLISHED');assert.equal(last.opts.headers.Authorization,'Bearer test-token');assert.ok(!last.url.includes('test-token'));
 // Posting time belongs to the local worker, never a scheduled post on Meta.
 assert.equal(last.opts.body.has('scheduled_publish_time'),false);
 assert.equal(last.opts.body.get('upload_phase'),'finish');
});

import {connectionView} from '../connections.mjs';
test('connection evidence distinguishes missing token, stale checks, denied scopes and unknown rights',()=>{
 assert.equal(connectionView({token:null}).status,'missing');
 assert.equal(connectionView({token:'x',verified_at:'2020-01-01'}).status,'stale');
 const checked={token:'x',verified_at:new Date().toISOString()};
 assert.equal(connectionView(checked).canCreate,null);
 assert.equal(connectionView({...checked,connection_error:'Expired'}).status,'error');
 assert.equal(connectionView({...checked,connection_json:JSON.stringify({scopes:['pages_read_engagement'],tasks:['CREATE_CONTENT']})}).status,'permissions');
 assert.equal(connectionView({...checked,connection_json:JSON.stringify({scopes:['pages_read_engagement','pages_manage_posts'],tasks:['CREATE_CONTENT']})}).status,'verified');
});
test('accounts follows cursor on fixed Graph host, not next URL, and reports granted permissions only',async()=>{
 const calls=[],api=new Meta('sensitive-user-token','v26.0',async(url)=>{calls.push(new URL(url));const u=new URL(url);if(u.pathname.endsWith('permissions'))return Response.json({data:[{permission:'pages_manage_posts',status:'granted'},{permission:'other',status:'declined'}]});return Response.json(u.searchParams.has('after')?{data:[{id:'2'}]}:{data:[{id:'1'}],paging:{next:'https://evil.invalid/steal',cursors:{after:'cursor'}}});});
 const result=await api.accounts();assert.equal(result.pages.length,2);assert.deepEqual(result.permissions,['pages_manage_posts']);assert.ok(calls.every(u=>u.hostname==='graph.facebook.com'));assert.equal(calls[1].searchParams.get('after'),'cursor');
});
