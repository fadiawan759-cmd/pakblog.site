
function toResponse(result) {
  if (result === undefined || result instanceof Response) return result;
  return new Response(result?.body ?? '', {
    status: result?.statusCode ?? 200,
    headers: result?.headers ?? {}
  });
}

import {getDb} from './_firebase.mjs';
async function _handler() { try { const snap=await getDb().collection('articles').get(); const articles=[]; snap.forEach(d=>{const a={id:d.id,...d.data()}; if(!a.status || a.status==='published') articles.push(a)}); const date=a=>{for(const k of ['createdAt','publishedAt','updatedAt','date','timestamp']){const v=a[k]; if(v==null)continue; const d=v?.toDate?v.toDate():new Date(v); if(!isNaN(d))return d.getTime()}return 0}; articles.sort((x,y)=>date(y)-date(x)); return {statusCode:200,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate, proxy-revalidate'},body:JSON.stringify({articles:articles.slice(0,100)})}; } catch(e){ return {statusCode:500,headers:{'content-type':'application/json; charset=utf-8'},body:JSON.stringify({error:'Home feed unavailable',detail:e.message})}; } };

export const config = { path: '/api/home' };


export default async (event, context) => toResponse(await _handler(event, context));
