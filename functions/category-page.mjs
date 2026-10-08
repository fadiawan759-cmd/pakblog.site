function toResponse(result) {
  if (result === undefined || result instanceof Response) return result;
  return new Response(result?.body ?? '', { status: result?.statusCode ?? 200, headers: result?.headers ?? {} });
}

import { getDb } from './_firebase.mjs';
import { pageShell, pageMessage, card, normalizeCategory, slugify, isPublished, publishedDate, escapeHtml } from './_site.mjs';

async function _handler(event, context){
  const raw = String(context?.params?.category || event?.queryStringParameters?.category || '').trim();
  if(!raw){return {statusCode:404,headers:{'content-type':'text/html; charset=utf-8','cache-control':'public, max-age=60, s-maxage=300'},body:pageShell({title:'Category not found — Pakblog',description:'Pakblog category',body:pageMessage('Category not found','Choose a category from the newsroom navigation.')})};}
  const wanted=normalizeCategory(raw.replace(/-/g,' '));
  try{
    const snap=await getDb().collection('articles').get();
    const list=[];
    snap.forEach(d=>{const a={id:d.id,...d.data()};if(isPublished(a)&&normalizeCategory(a.category).toLowerCase()===wanted.toLowerCase())list.push(a)});
    list.sort((a,b)=>publishedDate(b)-publishedDate(a));
    const body=`<section class="wrap" style="padding-top:52px"><div class="section-head"><div><div class="section-kicker">CATEGORY</div><h1 class="section-title" id="categoryTitle">${escapeHtml(wanted)}</h1></div><div class="section-link">${list.length} published ${list.length===1?'story':'stories'}</div></div><div class="story-grid" id="categoryGrid" data-server-rendered="true">${list.length?list.map((a,i)=>card(a,i)).join(''):`<div class="empty" style="grid-column:1/-1"><h2>No stories in ${escapeHtml(wanted)} yet.</h2><p>Published stories will appear here automatically.</p></div>`}</div></section>`;
    return {statusCode:200,headers:{'content-type':'text/html; charset=utf-8','cache-control':'public, max-age=60, s-maxage=300'},body:pageShell({title:`${wanted} News — Pakblog`,description:`Latest ${wanted} news and stories on Pakblog.`,canonical:`https://pakblog.site/category/${slugify(wanted)}`,body,activeCategory:wanted})};
  }catch(e){console.error(e);return{statusCode:500,headers:{'content-type':'text/html; charset=utf-8','cache-control':'public, max-age=60, s-maxage=300'},body:pageShell({title:`${wanted} — Pakblog`,description:'Pakblog category',canonical:`https://pakblog.site/category/${slugify(wanted)}`,body:pageMessage('Category temporarily unavailable','The newsroom could not reach its article database. Please try again shortly.'),activeCategory:wanted})};}
}
export const config={path:'/category/:category'};
export default async (event, context) => toResponse(await _handler(event, context));
