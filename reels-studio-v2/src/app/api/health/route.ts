import {NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
export const dynamic='force-dynamic';
export async function GET(){
  try {getDb().prepare('SELECT 1').get();return NextResponse.json({ok:true,service:'the-story-studio',uptimeSeconds:Math.floor(process.uptime()),mode:process.env.STORY_LOCAL_SERVICE==='1'?'managed':'development'},{headers:{'Cache-Control':'no-store'}});}
  catch {return NextResponse.json({ok:false,service:'the-story-studio'},{status:503});}
}
