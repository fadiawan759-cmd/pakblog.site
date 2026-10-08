
function toResponse(result) {
  if (result === undefined || result instanceof Response) return result;
  return new Response(result?.body ?? '', {
    status: result?.statusCode ?? 200,
    headers: result?.headers ?? {}
  });
}

import { getDb, slugify } from './_firebase.mjs';
async function _handler(event, context){try{const u=new URL(event.rawUrl || event.url || '/', 'https://pakblog.site');const id=context?.params?.id||u.searchParams.get('id')||u.pathname.split('/').filter(Boolean).pop();if(!id)return{statusCode:400,body:'Missing article id'};const doc=await getDb().collection('articles').doc(id).get();if(!doc.exists)return{statusCode:404,body:'Article not found'};const a=doc.data();const slug=a.slug||slugify(a.title||id);return{statusCode:301,headers:{location:'/news/'+encodeURIComponent(slug),'cache-control':'public,max-age=3600'},body:''}}catch(e){return{statusCode:500,body:'Share service unavailable'}}};
export const config={path:['/share/:id','/api/share']};


export default async (event, context) => toResponse(await _handler(event, context));
