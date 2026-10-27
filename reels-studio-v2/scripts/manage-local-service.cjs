const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),label='com.thestory.studio',domain='gui/'+process.getuid(),service=domain+'/'+label;
const agentDir=path.join(os.homedir(),'Library/LaunchAgents'),plist=path.join(agentDir,label+'.plist'),logDir=path.join(os.homedir(),'Library/Logs/TheStoryStudio');
function command(args,ignore=false){const r=spawnSync('/bin/launchctl',args,{encoding:'utf8'});if(r.status&&!ignore)throw Error('launchctl '+args[0]+': '+r.stderr.trim());return r;}
const xml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
async function healthy(){try{const r=await fetch('http://127.0.0.1:3020/api/health',{signal:AbortSignal.timeout(1500)});const j=await r.json();return r.ok&&j.ok&&j.service==='the-story-studio'&&j.mode==='managed';}catch{return false;}}
(async()=>{
const action=process.argv[2]||'start';
if(action==='stop'){command(['bootout',domain,plist],true);console.log('Đã dừng The Story Studio.');return;}
if(action==='status'){console.log(JSON.stringify({healthy:await healthy(),registered:command(['print',service],true).status===0,logs:logDir}));return;}
if(action!=='update'&&await healthy()){console.log('The Story Studio đang hoạt động.');return;}
if(action==='update'||!fs.existsSync(path.join(root,'.next-runtime/BUILD_ID'))){
 if(!fs.existsSync(path.join(root,'.next-production/BUILD_ID')))throw Error('Chưa có bản production. Chạy npm run build:local trước.');
 const fresh=path.join(root,'.next-runtime-new-'+Date.now());fs.cpSync(path.join(root,'.next-production'),fresh,{recursive:true});
 command(['bootout',domain,plist],true);
 const active=path.join(root,'.next-runtime');if(fs.existsSync(active))fs.renameSync(active,path.join(root,'.next-runtime-old-'+Date.now()));
 fs.renameSync(fresh,active);
}
fs.mkdirSync(agentDir,{recursive:true});fs.mkdirSync(logDir,{recursive:true});
fs.writeFileSync(plist,`<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict>
<key>Label</key><string>${label}</string>
<key>ProgramArguments</key><array><string>${xml(process.execPath)}</string><string>${xml(path.join(root,'scripts/local-service-supervisor.cjs'))}</string></array>
<key>WorkingDirectory</key><string>${xml(root)}</string>
<key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
<key>ThrottleInterval</key><integer>10</integer>
<key>ProcessType</key><string>Background</string>
<key>EnvironmentVariables</key><dict><key>PATH</key><string>${xml(path.dirname(process.execPath))}:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string><key>NODE_ENV</key><string>production</string></dict>
<key>StandardOutPath</key><string>${xml(path.join(logDir,'server.log'))}</string>
<key>StandardErrorPath</key><string>${xml(path.join(logDir,'error.log'))}</string>
</dict></plist>\n`,{mode:0o600});
if(command(['print',service],true).status!==0)command(['bootstrap',domain,plist]);
command(['kickstart',service]);
for(let i=0;i<60;i++){if(await healthy()){console.log('The Story Studio sẵn sàng tại http://localhost:3020/render');return;}await new Promise(r=>setTimeout(r,1000));}
throw Error('Server chưa sẵn sàng. Xem log: '+logDir);
})().catch(error=>{console.error(error.message);process.exitCode=1;});
