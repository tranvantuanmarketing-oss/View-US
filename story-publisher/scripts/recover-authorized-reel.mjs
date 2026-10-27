// Single explicitly approved Reel. Never starts a new session or creates another ID.
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {decrypt,isPublished,safeError} from '../core.mjs';
import {Meta} from '../meta.mjs';
import {fileURLToPath} from 'node:url';
const db=new DatabaseSync(fileURLToPath(new URL('../data/publisher.db',import.meta.url)));
const id='ac729b07-074d-4e3a-878c-497d2e2d482b';
const j=db.prepare('SELECT * FROM jobs WHERE id=?').get(id);
if(j?.page_id!=='104625669131300'||j.video_id!=='1153294767279989')throw Error('Approved Reel identity changed; stop.');
const p=db.prepare('SELECT * FROM pages WHERE id=?').get(j.page_id),a=db.prepare('SELECT * FROM assets WHERE id=?').get(j.asset_id);
const api=new Meta(decrypt(p.token,readFileSync(new URL('../data/secret.key',import.meta.url))));
await api.verify(p.id);
const before=await api.status(j.video_id);console.log('Existing Reel status:',JSON.stringify(before));
if(isPublished(before.status)){console.log('Already published; no upload/finish repeated.');process.exit(0);}
if(before.status?.uploading_phase?.status!=='in_progress'||before.status?.processing_phase?.status!=='not_started'||before.status?.publishing_phase?.status!=='not_started')throw Error('Unexpected processing state; do not overwrite.');
try{
 const uploaded=await api.upload(`https://rupload.facebook.com/video-upload/v26.0/${j.video_id}`,a.file);console.log('Upload response:',JSON.stringify(uploaded));
 if(!uploaded.success)throw Error('Upload not confirmed; do not finish.');
 const done=await api.finish(p.id,j.video_id,j.title,j.caption);console.log('Finish response:',JSON.stringify(done));
 if(!done.success)throw Error('Finish not confirmed.');
 db.prepare("UPDATE jobs SET status='checking',next_check=?,error=NULL,attempts=0 WHERE id=? AND video_id=?").run(new Date().toISOString(),id,j.video_id);
 console.log('Same Reel queued for publication verification; worker handles Comment 1 and Telegram.');
}catch(e){console.log(safeError(e,api.token));process.exitCode=1;}finally{db.close();}
