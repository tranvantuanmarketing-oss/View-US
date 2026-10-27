/** Optional local queue watcher. Rendering always uses the same engine as Studio. */
const base=process.env.API_BASE_URL || 'http://127.0.0.1:3020';
const once=process.argv.includes('--once');
async function tick(){
 const response=await fetch(`${base}/api/batches`);const json=await response.json();
 if(!response.ok)throw new Error(json.error || `HTTP ${response.status}`);
 for(const batch of json.data || []) if(batch.status==='queued') {
  const result=await fetch(`${base}/api/batches/${encodeURIComponent(batch.id)}/render`,{method:'POST'});
  if(!result.ok) throw new Error((await result.json()).error);
  console.log(`Đã chuyển ${batch.id} vào máy dựng local.`);
 }
}
console.log(`Theo dõi hàng đợi local ${base}; hãy giữ server View US đang chạy.`);
do {try{await tick();}catch(error){console.error(error.message);if(once)process.exitCode=1;}if(!once)await new Promise(r=>setTimeout(r,3000));}while(!once);
