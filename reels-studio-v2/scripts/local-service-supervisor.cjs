const {spawn}=require('node:child_process');const path=require('node:path');const fs=require('node:fs');
const root=path.resolve(__dirname,'..');process.chdir(root);
if(!fs.existsSync(path.join(root,'.next-runtime/BUILD_ID'))){console.error('Missing production runtime. Open The Story Studio launcher to install.');process.exit(1);}
const child=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'start','-H','127.0.0.1','-p','3020'],{cwd:root,stdio:'inherit',env:{...process.env,NODE_ENV:'production',NEXT_BUILD_DIR:'.next-runtime',STORY_LOCAL_SERVICE:'1'}});
let stopping=false,checking=false,failures=0;const started=Date.now();
function stop(signal='SIGTERM'){
 if(stopping)return;stopping=true;clearInterval(timer);child.kill(signal);
 const force=setTimeout(()=>child.kill('SIGKILL'),10000);force.unref();
}
child.on('error',()=>{console.error('Cannot start local server');process.exit(1)});
child.on('exit',code=>{clearInterval(timer);process.exit(stopping?0:(code||1));});
const timer=setInterval(async()=>{
 if(stopping||checking||Date.now()-started<45000)return;checking=true;
 try{const r=await fetch('http://127.0.0.1:3020/api/health',{signal:AbortSignal.timeout(8000)});const j=await r.json();if(!r.ok||!j.ok||j.service!=='the-story-studio')throw Error();failures=0;}
 catch{failures++;console.error(`Health check failed (${failures}/3)`);if(failures>=3)stop();}
 finally{checking=false;}
},15000);timer.unref();
process.on('SIGTERM',()=>stop());process.on('SIGINT',()=>stop());
console.log('The Story Studio local service supervisor started');
