"use client";
import { useEffect, useRef, useState } from "react";

export function VideoPreview({html, title, playing = false, time = 0}: {html:string;title:string;playing?:boolean;time?:number}) {
  const container = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.375);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 720));
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const send = () => frame.current?.contentWindow?.postMessage({type:"studio-preview",playing,time},"*");
  useEffect(send, [playing,time,html]);
  return <div ref={container} className="relative w-full aspect-[9/16] overflow-hidden bg-slate-950 rounded-xl">
    <iframe ref={frame} title={title} srcDoc={html} onLoad={send} sandbox="allow-scripts"
      style={{position:"absolute",width:720,height:1280,border:0,transform:`scale(${scale})`,transformOrigin:"top left"}} />
  </div>;
}
