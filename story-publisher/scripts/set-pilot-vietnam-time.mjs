import {DatabaseSync,backup} from 'node:sqlite';
import {mkdirSync,chmodSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {pilotPageNames} from '../pageIdentity.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const db=new DatabaseSync(path.join(root,'data/publisher.db'));
db.exec('PRAGMA busy_timeout=5000');
const dir=path.join(root,'data/verification/timezone-sync');mkdirSync(dir,{recursive:true,mode:0o700});
const file=path.join(dir,`before-${Date.now()}.db`);await backup(db,file);chmodSync(file,0o600);
db.exec('BEGIN IMMEDIATE');
try{for(const id of Object.keys(pilotPageNames)){
 if(!db.prepare('SELECT id FROM pages WHERE id=?').get(id))throw Error('Missing Page '+id);
 db.prepare('UPDATE pages SET zone=? WHERE id=?').run('Asia/Ho_Chi_Minh',id);
}db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
console.log('5 Page input timezones set to Vietnam. Market PL retained. Existing job timestamps unchanged.');
console.log(JSON.stringify(db.prepare('SELECT status,count(*) n FROM jobs GROUP BY status').all()));
