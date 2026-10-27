import {mkdirSync,writeFileSync} from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url)),label='com.thestory.publisher',domain='gui/'+process.getuid(),service=domain+'/'+label;
const dir=path.join(os.homedir(),'Library/LaunchAgents'),plist=path.join(dir,label+'.plist'),logs=path.join(os.homedir(),'Library/Logs/TheStoryPublisher');
const xml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function ctl(args,ignore=false){const r=spawnSync('/bin/launchctl',args,{encoding:'utf8'});if(r.status&&!ignore)throw Error(r.stderr||'launchctl failed');return r.status;}
async function health(){try{const r=await fetch('http://127.0.0.1:3030/api/health',{signal:AbortSignal.timeout(2000)});return (await r.json()).service==='story-publisher';}catch{return false;}}
const action=process.argv[2]||'start';
if(action==='stop'){ctl(['bootout',domain,plist],true);console.log('Đã dừng Publisher.');}
else if(action==='status')console.log(JSON.stringify({healthy:await health(),registered:ctl(['print',service],true)===0}));
else {
 if(action==='restart')ctl(['bootout',domain,plist],true);
 if(!await health()){
 mkdirSync(dir,{recursive:true});mkdirSync(logs,{recursive:true});
 writeFileSync(plist,`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>Label</key><string>${label}</string><key>ProgramArguments</key><array><string>${xml(process.execPath)}</string><string>${xml(path.join(root,'server.mjs'))}</string></array><key>WorkingDirectory</key><string>${xml(root)}</string><key>RunAtLoad</key><true/><key>KeepAlive</key><true/><key>ThrottleInterval</key><integer>10</integer><key>StandardOutPath</key><string>${xml(path.join(logs,'server.log'))}</string><key>StandardErrorPath</key><string>${xml(path.join(logs,'error.log'))}</string></dict></plist>`,{mode:0o600});
 if(ctl(['print',service],true)!==0)ctl(['bootstrap',domain,plist]);ctl(['kickstart',service]);
 for(let i=0;i<30&&!await health();i++)await new Promise(r=>setTimeout(r,1000));
 if(!await health())throw Error('Chưa khởi động được. Xem log tại '+logs);
 }
 console.log('Publisher đang chạy: http://localhost:3030');
}
