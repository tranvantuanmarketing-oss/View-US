import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({Intl,Date});
vm.runInContext(readFileSync(new URL('../public/time.js',import.meta.url),'utf8'),context);
const time=context.PublisherTime;
test('minute grid preserves all saved minute slots, including multiple in the same hour',()=>{
 const rows=time.slotRows(['12:10','12:45','16:15','23:59','00:00']);
 assert.equal(rows.length,25);assert.equal(rows.filter(r=>r.selected).length,5);
 assert.equal(rows.find(r=>r.time==='12:10').minute,'10');assert.equal(rows.find(r=>r.time==='23:59').minute,'59');
 assert.equal(rows.find(r=>r.hour==='11').time,'11:00');assert.equal(rows.find(r=>r.hour==='11').selected,false);
 assert.equal(time.slotRows(['12:10','12:10']).filter(r=>r.selected).length,1);
});
test('Vietnam input is explicit UTC+7 and round-trips independent of host timezone',()=>{
 assert.equal(time.inputISO('2026-10-25T21:00'),'2026-10-25T14:00:00.000Z');
 assert.equal(time.inputValue('2026-10-25T14:00:00Z'),'2026-10-25T21:00');
 assert.throws(()=>time.inputISO('2026-02-30T21:00'));
 assert.throws(()=>time.inputISO(''));
});
test('Polish comparison follows winter/summer and the exact DST transition',()=>{
 const display=at=>time.pair(at,'Europe/Warsaw','Ba Lan');
 assert.match(display('2026-07-01T14:00:00Z'),/Ba Lan 01\/07 04:00 PM/);
 assert.match(display('2026-12-01T14:00:00Z'),/Ba Lan 01\/12 03:00 PM/);
 assert.match(display('2026-10-25T00:30:00Z'),/Ba Lan 25\/10 02:30 AM/);
 assert.match(display('2026-10-25T01:30:00Z'),/Ba Lan 25\/10 02:30 AM/);
 assert.equal(display('2026-10-26T05:00:00Z'),'VN 26/10 12:00 PM ↔ Ba Lan 26/10 06:00 AM');
});
test('comparison includes date across midnight and supports other page markets',()=>{
 const text=time.pair(time.inputISO('2026-12-02T02:00'),'America/New_York','Mỹ');
 assert.match(text,/02\/12/);assert.match(text,/01\/12/);
 assert.match(text,/Mỹ 01\/12 02:00 PM/);assert.doesNotMatch(text,/GMT|2026|America/);
});
