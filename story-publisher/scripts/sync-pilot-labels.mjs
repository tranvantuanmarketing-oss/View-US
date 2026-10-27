import {DatabaseSync,backup} from 'node:sqlite';
import {mkdirSync,chmodSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {pilotPageNames} from '../pageIdentity.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const db=new DatabaseSync(path.join(root,'data/publisher.db'));
db.exec('PRAGMA busy_timeout=5000');
if(db.prepare("SELECT id FROM jobs WHERE status IN ('starting','uploading','finishing') LIMIT 1").get())throw Error('Wait until active upload finishes');
const dir=path.join(root,'data/verification/label-sync');mkdirSync(dir,{recursive:true,mode:0o700});
const dest=path.join(dir,`before-${Date.now()}.db`);await backup(db,dest);chmodSync(dest,0o600);
db.exec('BEGIN IMMEDIATE');
try{for(const [id,name]of Object.entries(pilotPageNames)){
 const p=db.prepare('SELECT name,connection_json FROM pages WHERE id=?').get(id);if(!p)throw Error('Missing Page '+id);
 const evidence=JSON.parse(p.connection_json||'{}');evidence.facebookName ||= p.name;
 db.prepare('UPDATE pages SET name=?,country=?,zone=?,connection_json=? WHERE id=?').run(name,'PL','Europe/Warsaw',JSON.stringify(evidence),id);
}db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
console.log('Synced 5 workspace labels and Warsaw timezone. Existing job snapshots unchanged; no jobs created.');
