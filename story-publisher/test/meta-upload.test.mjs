import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {Meta} from '../meta.mjs';
test('binary Reel upload supplies actual Content-Length and file_size, not chunked-only',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'reel-upload-')),file=path.join(dir,'sample.mp4'),bytes=Buffer.from('sample bytes');writeFileSync(file,bytes);
 try{const api=new Meta('secret','v26.0',async(url,opts)=>{assert.equal(opts.headers['Content-Length'],String(bytes.length));assert.equal(opts.headers.file_size,String(bytes.length));assert.equal(opts.headers.offset,'0');let size=0;for await(const b of opts.body)size+=b.length;assert.equal(size,bytes.length);return new Response(JSON.stringify({success:true}));});assert.equal((await api.upload('https://rupload.facebook.com/video-upload/v26.0/12345',file)).success,true);}finally{rmSync(dir,{recursive:true});}
});
test('upload failures retain useful diagnostic detail without exposing token',async()=>{
 const api=new Meta('secret');await assert.rejects(api.readResponse(new Response(JSON.stringify({debug_info:{message:'Bad upload secret'}}),{status:400})),e=>e.message.includes('Bad upload [secret]')&&!e.message.includes('upload secret'));
});
