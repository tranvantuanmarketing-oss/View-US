// Only the test harness imports this module. Production never installs a fetch mock.
import {appendFileSync} from 'node:fs';
let polls=0;
globalThis.fetch=async(input,options={})=>{
 const url=new URL(input),form=options.body instanceof URLSearchParams?Object.fromEntries(options.body):{};
 appendFileSync(process.env.TRACE_FILE,JSON.stringify({path:url.pathname,method:options.method,form})+'\n');
 let data;
 if(url.hostname==='api.telegram.org')data={ok:true,result:{message_id:1}};
 else if(url.hostname==='generativelanguage.googleapis.com')data={candidates:[{finishReason:'STOP',content:{parts:[{text:'Báo cáo thử có nguồn.'}]},groundingMetadata:{groundingChunks:[{web:{uri:'https://example.com/news',title:'Test source'}}],groundingSupports:[{segment:{text:'Báo cáo thử có nguồn.'},groundingChunkIndices:[0]}],searchEntryPoint:{renderedContent:'<div>Google Search Suggestions</div>'}}}]};
 else if(url.pathname.endsWith('/me/accounts'))data={data:[{id:'123456789',name:'QA Page',access_token:'discovered-page-secret',tasks:['CREATE_CONTENT','MODERATE']}]};
 else if(url.pathname.endsWith('/me/permissions'))data={data:['pages_manage_posts','pages_read_engagement','pages_manage_engagement'].map(permission=>({permission,status:'granted'}))};
 else if(url.pathname.endsWith('/me'))data={id:'123456789',name:'QA Page'};
 else if(form.upload_phase==='start')data={video_id:'987654321',upload_url:'https://rupload.facebook.com/test'};
 else if(url.hostname==='rupload.facebook.com'){for await(const chunk of options.body){}data={success:true};}
 else if(form.upload_phase==='finish')data={success:true};
 else if(url.pathname.endsWith('/comments'))data={id:'comment123'};
 else data={status:{video_status:'ready',publishing_phase:{publish_status:++polls>=2?'published':'processing'}}};
 return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
};
await import('../server.mjs');
