// Input time is always Vietnam time, independent of the browser's timezone.
globalThis.PublisherTime = (() => {
 const zone = 'Asia/Ho_Chi_Minh';
 function inputISO(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw Error('Chọn ngày giờ Việt Nam hợp lệ.');
  const date = new Date(value + ':00+07:00');
  if (!Number.isFinite(date.getTime()) || inputValue(date) !== value) throw Error('Ngày giờ không hợp lệ.');
  return date.toISOString();
 }
 function inputValue(at) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(at)).map(p=>[p.type,p.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
 }
 function pair(at, marketZone, marketName) {
  const format = timeZone => {
   const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone,day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hour12:true}).formatToParts(new Date(at)).map(p=>[p.type,p.value]));
   return `${p.day}/${p.month} ${p.hour}:${p.minute} ${p.dayPeriod}`;
  };
  return `VN ${format(zone)} ↔ ${marketName} ${format(marketZone)}`;
 }
 function slotRows(slots){
  const saved=[...new Set(slots)].filter(t=>/^([01]\d|2[0-3]):[0-5]\d$/.test(t)).sort();
  return Array.from({length:24},(_,h)=>{const hour=String(h).padStart(2,'0'),times=saved.filter(t=>t.startsWith(hour+':'));return (times.length?times:[hour+':00']).map(time=>({hour,minute:time.slice(3),time,selected:saved.includes(time)}));}).flat();
 }
 return {zone,inputISO,inputValue,pair,slotRows};
})();
