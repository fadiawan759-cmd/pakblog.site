
function toResponse(result) {
  if (result === undefined || result instanceof Response) return result;
  return new Response(result?.body ?? '', {
    status: result?.statusCode ?? 200,
    headers: result?.headers ?? {}
  });
}

import {getDb} from './_firebase.mjs';
const score=(a,q)=>{const terms=q.toLowerCase().split(/\s+/).filter(Boolean);let s=0;const hay=((a.title||'')+' '+(a.excerpt||'')+' '+(a.category||'')+' '+(a.content||'')+' '+(Array.isArray(a.tags)?a.tags.join(' '):(a.tags||''))).toLowerCase();for(const t of terms){if((a.title||'').toLowerCase().includes(t))s+=20;if((a.excerpt||'').toLowerCase().includes(t))s+=8;if((a.category||'').toLowerCase().includes(t))s+=6;if(hay.includes(t))s+=1}return s};
async function _handler(event){
 try{
  const rawUrl=event?.rawUrl||event?.url||''; const params=event?.queryStringParameters?new URLSearchParams(event.queryStringParameters):new URL(rawUrl||'https://pakblog.site/').searchParams;
  const q=params.get('q')?.trim();
  if(!q)return{statusCode:400,headers:{'content-type':'application/json; charset=utf-8'},body:JSON.stringify({error:'q is required'})};
  const snap=await getDb().collection('articles').get();
  const out=[];
  snap.forEach(d=>{const a={id:d.id,...d.data()};if(a.status&&a.status!=='published')return;const s=score(a,q);if(s)out.push({id:a.id,slug:a.slug,title:a.title,excerpt:a.excerpt,category:a.category,imageURL:a.imageURL,author:a.author,createdAt:a.createdAt,publishedAt:a.publishedAt,date:a.date,score:s})});
  out.sort((a,b)=>b.score-a.score);
  const results=out.slice(0,50);
  const suggestions=out.slice(0,8).map(a=>({id:a.id,slug:a.slug,title:a.title,category:a.category,author:a.author}));
  return{statusCode:200,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate, proxy-revalidate'},body:JSON.stringify({query:q,results,suggestions})}
 }catch(e){console.error('search failed',e);return{statusCode:500,headers:{'content-type':'application/json; charset=utf-8'},body:JSON.stringify({error:'Search service unavailable'})}}
}
export const config = { path: '/api/search' };
export default async (event, context) => toResponse(await _handler(event, context));
