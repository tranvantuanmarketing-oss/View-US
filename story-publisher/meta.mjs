import { createReadStream, statSync } from 'node:fs';
export class Meta {
  constructor(token,version='v26.0',fetcher=fetch){this.token=token;this.version=version;this.fetch=fetcher;}
  async readResponse(response) {
    const raw=await response.text();let json;try{json=JSON.parse(raw);}catch{json={};}
    if(!response.ok||json.error){const detail=json.error?.message||json.debug_info?.message||json.message||JSON.stringify(json)||raw;const e=Error(`Meta HTTP ${response.status}: ${String(detail).replaceAll(this.token,'[secret]').slice(0,1500)}`);e.code=json.error?.code;e.status=response.status;throw e;}
    return json;
  }
  async call(path,params={},method='GET') {
    if(!/^[\w/]+$/.test(path))throw Error('Đường dẫn Meta không hợp lệ.');
    const url=new URL(`https://graph.facebook.com/${this.version}/${path}`);
    if(method==='GET')url.search=new URLSearchParams(params).toString();
    return this.readResponse(await this.fetch(url,{method,headers:{Authorization:`Bearer ${this.token}`},body:method==='GET'?undefined:new URLSearchParams(params),signal:AbortSignal.timeout(45000),redirect:'error'}));
  }
  async verify(pageId) {
    const me=await this.call('me',{fields:'id,name'});
    if(String(me.id)!==String(pageId))throw Error('Token không đại diện cho Page ID này. Hãy dùng Page Access Token đúng Page.');
    return me;
  }
  async accounts() {
    const pages=[];let after;let truncated=false;
    for(let n=0;n<10;n++) {
      const result=await this.call('me/accounts',{fields:'id,name,access_token,tasks',limit:'100',...(after?{after}:{})});
      if(!Array.isArray(result.data))throw Error('Meta chưa trả danh sách Page. Kiểm tra User Access Token và pages_show_list.');
      pages.push(...result.data);after=result.paging?.next?result.paging?.cursors?.after:null;
      if(!after)break;if(n===9)truncated=true;
    }
    let permissions=null;
    try{const r=await this.call('me/permissions');if(Array.isArray(r.data))permissions=r.data.filter(p=>p.status==='granted').map(p=>p.permission);}catch{}
    return {pages,permissions,truncated};
  }
  start(pageId){return this.call(`${pageId}/video_reels`,{upload_phase:'start'},'POST');}
  async upload(url,file) {
    const parsed=new URL(url);
    if(parsed.protocol!=='https:'||parsed.hostname!=='rupload.facebook.com'||parsed.port||parsed.username||parsed.password)throw Error('Meta trả về URL upload không hợp lệ.');
    const size=String(statSync(file).size);
    return this.readResponse(await this.fetch(parsed,{method:'POST',headers:{Authorization:`OAuth ${this.token}`,offset:'0',file_size:size,'Content-Length':size,'Content-Type':'application/octet-stream'},body:createReadStream(file),duplex:'half',redirect:'error',signal:AbortSignal.timeout(300000)}));
  }
  finish(pageId,id,title,caption){return this.call(`${pageId}/video_reels`,{upload_phase:'finish',video_id:id,video_state:'PUBLISHED',title,description:caption},'POST');}
  schedule(pageId,id,title,caption,at){return this.call(`${pageId}/video_reels`,{upload_phase:'finish',video_id:id,video_state:'SCHEDULED',scheduled_publish_time:String(Math.floor(new Date(at).getTime()/1000)),title,description:caption},'POST');}
  scheduledStatus(id){return this.call(id,{fields:'id,status,scheduled_publish_time'});}
  status(id){return this.call(id,{fields:'status'});}
  async videos(pageId){
    const videos=new Map();let after;
    for(let n=0;n<100;n++){
      const r=await this.call(`${pageId}/videos`,{fields:'id,title,created_time,views',limit:'100',...(after?{after}:{})});
      if(!Array.isArray(r.data))throw Error('Meta không trả danh sách video hợp lệ.');
      for(const v of r.data)videos.set(String(v.id),v);
      if(!r.paging?.next)return {videos:[...videos.values()],complete:true};
      const cursor=r.paging?.cursors?.after;
      if(!cursor||cursor===after)throw Error('Meta trả phân trang không hợp lệ; chưa quét hết Page.');
      after=cursor;
    }
    return {videos:[...videos.values()],complete:false};
  }
  async commentCount(id){const result=await this.call(`${id}/comments`,{summary:'true',limit:'0'});const value=result.summary?.total_count;if(!Number.isSafeInteger(value)||value<0)throw Error('Meta chưa trả tổng số bình luận hợp lệ.');return value;}
  async views(id){const result=await this.call(id,{fields:'views'});const value=result.views;if(typeof value!=='number'||!Number.isSafeInteger(value)||value<0)throw Error('Meta chưa trả chỉ số views hợp lệ; chưa thể đối chiếu mốc 1.000.');return value;}
  comment(id,message){return this.call(`${id}/comments`,{message},'POST');}
}
