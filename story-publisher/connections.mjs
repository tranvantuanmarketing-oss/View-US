export function isMetaAuthError(error){
 return [190,10,200].includes(error?.code)||/before impersonating|access token.*(?:expired|invalid)|invalid.*(?:oauth|access token)|permissions? (?:must be granted|error)|session has expired/i.test(String(error?.message||error||''));
}
export function connectionView(page,now=Date.now()) {
  let evidence;try{evidence=JSON.parse(page.connection_json||'{}')||{};}catch{evidence={};}
  const scopes=evidence.scopes, tasks=evidence.tasks;
  const missing=scopes?['pages_manage_posts','pages_read_engagement'].filter(x=>!scopes.includes(x)):[];
  const canCreate=Array.isArray(tasks)?tasks.some(x=>['CREATE_CONTENT','MANAGE','PROFILE_PLUS_CREATE_CONTENT','PROFILE_PLUS_FULL_CONTROL'].includes(x)):null;
  const stale=!page.verified_at||now-Date.parse(page.verified_at)>86400000;
  const status=!page.token?'missing':page.connection_error?'error':missing.length||canCreate===false?'permissions':stale?'stale':'verified';
  return {status,checkedAt:page.verified_at,missing,canCreate,scopes:scopes||null,tasks:tasks||null,commentPermission:scopes?scopes.includes('pages_manage_engagement'):null,error:page.connection_error||null,needsReconnect:isMetaAuthError(page.connection_error),livePublished:!!page.live_published};
}
