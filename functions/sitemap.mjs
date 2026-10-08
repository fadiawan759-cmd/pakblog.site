function toResponse(result) {
  if (result === undefined || result instanceof Response) return result;
  return new Response(result?.body ?? '', {status: result?.statusCode ?? 200, headers: result?.headers ?? {}});
}
import { getDb } from './_firebase.mjs';
import { SITE_URL, CATEGORIES, articleUrl, isPublished, slugify, publishedDate } from './_site.mjs';

const escXml = (value) => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const iso = d => new Date(d).toISOString().slice(0,10);
function buildXml(items){
  const unique = new Map(items.map(x => [x.loc, x]));
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    [...unique.values()].map(x=>`<url><loc>${escXml(x.loc)}</loc>${x.lastmod?`<lastmod>${escXml(x.lastmod)}</lastmod>`:''}</url>`).join('') +
    '</urlset>';
}
function baseUrls(){
  return [
    {loc:`${SITE_URL}/`},{loc:`${SITE_URL}/latest`},{loc:`${SITE_URL}/about`},{loc:`${SITE_URL}/search`},{loc:`${SITE_URL}/contact`},
    {loc:`${SITE_URL}/privacy`},{loc:`${SITE_URL}/terms`},{loc:`${SITE_URL}/disclaimer`},{loc:`${SITE_URL}/dmca`},{loc:`${SITE_URL}/cookie-policy`},
    ...CATEGORIES.map(c=>({loc:`${SITE_URL}/category/${slugify(c)}`}))
  ];
}
async function _handler(){
  const headers={'content-type':'application/xml; charset=utf-8','cache-control':'public, max-age=300, s-maxage=900','x-content-type-options':'nosniff'};
  try{
    const snap=await getDb().collection('articles').get();
    const urls=baseUrls();
    snap.forEach(d=>{
      const a={id:d.id,...d.data()};
      if(isPublished(a)) urls.push({loc:articleUrl(a),lastmod:iso(a.updatedAt||publishedDate(a))});
    });
    return {statusCode:200,headers,body:buildXml(urls)};
  }catch(e){
    console.error('sitemap:',e?.message||e);
    return {statusCode:200,headers,body:buildXml(baseUrls())};
  }
}
export const config={path:'/sitemap.xml'};
export default async(event,context)=>toResponse(await _handler(event,context));
