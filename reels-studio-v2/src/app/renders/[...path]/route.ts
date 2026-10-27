import {serveLocalMedia} from '@/lib/localMedia';
export const dynamic='force-dynamic';
export async function GET(req:Request,{params}:{params:{path:string[]}}){return serveLocalMedia(req,'renders',params.path);}
export async function HEAD(req:Request,{params}:{params:{path:string[]}}){return serveLocalMedia(req,'renders',params.path,true);}
