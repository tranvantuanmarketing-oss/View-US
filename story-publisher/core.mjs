import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
export const countries = {
  US:['Mỹ','America/New_York'], FR:['Pháp','Europe/Paris'], NL:['Hà Lan','Europe/Amsterdam'],
  GB:['Anh','Europe/London'], AU:['Úc','Australia/Sydney'], CA:['Canada','America/Toronto'],
  DE:['Đức','Europe/Berlin'], VN:['Việt Nam','Asia/Ho_Chi_Minh'], PL:['Ba Lan','Europe/Warsaw']
};
export function parseText(buffer) {
  const enc=buffer[0]===255&&buffer[1]===254?'utf-16le':buffer[0]===254&&buffer[1]===255?'utf-16be':'utf-8';
  const text=new TextDecoder(enc,{fatal:true}).decode(buffer).replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
  const result={title:'',author:'',content:'',caption:'',comment:''}; let field='content';
  const aliases={title:'title',author:'author',content:'content','nội dung':'content',caption:'caption','comment 1':'comment',comment:'comment',cmt:'comment',cmt1:'comment','bình luận':'comment'};
  for(const line of text.split('\n')) {
    const match=line.match(/^\s*(Title|Author|Content|Nội dung|Caption|Comment\s*1|Comment|CMT1?|Bình luận)\s*:\s*(.*)$/i);
    if(match) {field=aliases[match[1].toLowerCase().replace(/comment\s*1/i,'comment 1')];result[field]+=match[2]+'\n';}
    else result[field]+=line+'\n';
  }
  for(const key in result) result[key]=result[key].trim();
  return result;
}
export const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
export function encrypt(text,key) { const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);return Buffer.concat([iv,cipher.update(text,'utf8'),cipher.final(),cipher.getAuthTag()]).toString('base64'); }
export function decrypt(text,key) {const b=Buffer.from(text,'base64'),c=createDecipheriv('aes-256-gcm',key,b.subarray(0,12));c.setAuthTag(b.subarray(-16));return Buffer.concat([c.update(b.subarray(12,-16)),c.final()]).toString('utf8');}
export function validateTimezone(zone) { new Intl.DateTimeFormat('en',{timeZone:zone}).format();return zone; }
export function validateSlots(slots) {
  if(!Array.isArray(slots)||!slots.length||slots.length>12||slots.some(x=>!/^([01]\d|2[0-3]):[0-5]\d$/.test(x))) throw Error('Nhập 1–12 khung giờ HH:mm hợp lệ.');
  return [...new Set(slots)].sort();
}
export function localParts(date,zone) {
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date).map(x=>[x.type,x.value]));
  return {day:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`};
}
// Iterate real UTC minutes: spring-forward gaps are skipped; fall-back duplicate local slots occur once.
export function planSlots(zone,slots,count,after=Date.now(),reserved=[]) {
  validateTimezone(zone);validateSlots(slots);
  if(!Number.isInteger(count)||count<1||count>500) throw Error('Chọn 1–500 video.');
  const occupied=new Set(reserved.map(t=>{const p=localParts(new Date(t),zone);return p.day+' '+p.time;}));
  const result=[], start=Math.ceil((after+60000)/60000)*60000;
  const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  for(let t=start;t<start+366*86400000 && result.length<count;t+=60000) {
    const p=Object.fromEntries(formatter.formatToParts(new Date(t)).map(x=>[x.type,x.value]));
    const time=`${p.hour}:${p.minute}`,key=`${p.year}-${p.month}-${p.day} ${time}`;
    if(slots.includes(time)&&!occupied.has(key)){occupied.add(key);result.push(new Date(t).toISOString());}
  }
  if(result.length!==count)throw Error('Không đủ khung giờ trong 366 ngày.');
  return result;
}
export function isPublished(status) {return String(status?.publishing_phase?.publish_status||'').toLowerCase()==='published';}
export function safeError(error,token='') {
  return String(error?.message||error).replaceAll(token||'__NO_TOKEN__','[secret]').replace(/access_token=[^ &]+/gi,'access_token=[secret]').slice(0,700);
}
