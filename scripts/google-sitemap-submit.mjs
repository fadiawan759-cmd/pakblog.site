import crypto from "node:crypto";

const baseUrl=(process.env.PAKBLOG_BASE_URL||"https://pakblog.site").replace(/\/+$/,"");
const property=process.env.PAKBLOG_SEARCH_CONSOLE_PROPERTY||`${baseUrl}/`;
const sitemapUrl=`${baseUrl}/sitemap.xml`;
const secret=process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if(!secret) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON GitHub secret.");

let credentials;
try{credentials=JSON.parse(secret)}catch{throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.")}
if(!credentials.client_email||!credentials.private_key) throw new Error("Service account JSON is missing client_email or private_key.");

const b64=v=>Buffer.from(v).toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
function jwt(){
 const now=Math.floor(Date.now()/1000);
 const h=b64(JSON.stringify({alg:"RS256",typ:"JWT"}));
 const p=b64(JSON.stringify({iss:credentials.client_email,scope:"https://www.googleapis.com/auth/webmasters",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600}));
 const u=`${h}.${p}`; const s=crypto.createSign("RSA-SHA256"); s.update(u); s.end();
 return `${u}.${b64(s.sign(credentials.private_key))}`;
}
async function token(){
 const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt()})});
 const b=await r.text(); if(!r.ok) throw new Error(`Google OAuth failed (${r.status}): ${b}`);
 const j=JSON.parse(b); if(!j.access_token) throw new Error("Google OAuth returned no access token."); return j.access_token;
}
const enc=v=>encodeURIComponent(v);
async function main(){
 const t=await token();
 const lr=await fetch("https://www.googleapis.com/webmasters/v3/sites",{headers:{Authorization:`Bearer ${t}`}});
 const lb=await lr.text(); if(!lr.ok) throw new Error(`Could not list Search Console properties (${lr.status}): ${lb}`);
 const sites=(JSON.parse(lb).siteEntry||[]).map(x=>x.siteUrl).filter(Boolean);
 console.log("Properties visible to service account:"); sites.forEach(x=>console.log(`- ${x}`));
 if(!sites.includes(property)) throw new Error(`Service account cannot access "${property}". Add ${credentials.client_email} to that exact Search Console property, or change PAKBLOG_SEARCH_CONSOLE_PROPERTY.`);
 const endpoint=`https://www.googleapis.com/webmasters/v3/sites/${enc(property)}/sitemaps/${enc(sitemapUrl)}`;
 const r=await fetch(endpoint,{method:"PUT",headers:{Authorization:`Bearer ${t}`}});
 const b=await r.text(); if(!r.ok) throw new Error(`Sitemap submission failed (${r.status}). Property="${property}", sitemap="${sitemapUrl}". Response: ${b}`);
 console.log(`SUCCESS: Google accepted sitemap ${sitemapUrl}`);
}
await main();
