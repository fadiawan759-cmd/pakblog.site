function toResponse(result) {
  if (result === undefined || result instanceof Response) return result;
  return new Response(result?.body ?? '', {status: result?.statusCode ?? 200, headers: result?.headers ?? {}});
}
import { getDb } from './_firebase.mjs';
import { SITE_URL, articleUrl, isPublished, publishedDate } from './_site.mjs';
const esc = v => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const title = v => String(v||'Pakblog story').slice(0,200);
async function handler(){
  const headers={'content-type':'application/xml; charset=utf-8','cache-control':'public, max-age=300, s-maxage=900'};
  try{
    const cutoff=Date.now()-48*60*60*1000;
    const snap=await getDb().collection('articles').get();
    const items=[];
    snap.forEach(d=>{
      const a={id:d.id,...d.data()};
      const date=publishedDate(a);
      if(isPublished(a)&&date.getTime()>=cutoff){
        items.push({url:articleUrl(a),date,title:a.title});
      }
    });
    items.sort((a,b)=>b.date-a.date);
    const xml='<?xml version="1.0" encoding="UTF-8"?>' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">' +
      items.slice(0,1000).map(x=>`<url><loc>${esc(x.url)}</loc><news:news><news:publication><news:name>Pakblog</news:name><news:language>en</news:language></news:publication><news:publication_date>${x.date.toISOString()}</news:publication_date><news:title>${esc(title(x.title))}</news:title></news:news></url>`).join('') +
      '</urlset>';
    return {statusCode:200,headers,body:xml};
  }catch(e){
    console.error('news sitemap:',e?.message||e);
    return {statusCode:200,headers,body:'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"></urlset>'};
  }
}
export const config={path:'/news-sitemap.xml'};
export default async()=>toResponse(await handler());
