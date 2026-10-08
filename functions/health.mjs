
function toResponse(result) {
  if (result === undefined || result instanceof Response) return result;
  return new Response(result?.body ?? '', {
    status: result?.statusCode ?? 200,
    headers: result?.headers ?? {}
  });
}

import { getDb } from './_firebase.mjs';
async function _handler(){try{await getDb().collection('articles').limit(1).get();return{statusCode:200,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify({ok:true,service:'pakblog',firebase:true})}}catch(e){return{statusCode:503,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify({ok:false,service:'pakblog',firebase:false,error:e?.message?.includes('Missing FIREBASE_SERVICE_ACCOUNT_JSON')?'FIREBASE_SERVICE_ACCOUNT_JSON is missing':'Firebase connection failed'})}}};
export const config={path:'/api/health'};


export default async (event, context) => toResponse(await _handler(event, context));
