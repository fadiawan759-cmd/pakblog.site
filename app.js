(function(){'use strict';
let articles=[],shown=0;const PAGE=9;
const $=id=>document.getElementById(id);
function slugify(s){return String(s||'article').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,120)||'article'}
function url(a){return '/news/'+encodeURIComponent(a.slug||slugify(a.title))}
function valueDate(a){
  const keys=['createdAt','publishedAt','updatedAt','date','publishedDate','timestamp','created_date','created'];
  for(const k of keys){const v=a?.[k]; if(v==null) continue; try{const d=v&&typeof v.toDate==='function'?v.toDate():new Date(v); if(!Number.isNaN(d.getTime())) return d;}catch(e){}}
  return new Date(0);
}
function dateText(v){const d=(v&&typeof v==='object'&&('title' in v||'category' in v))?valueDate(v):valueDate({createdAt:v});return d.getTime()>0?d.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}):'Recently'}
function text(s){return String(s??'')}
function observe(){const els=document.querySelectorAll('.reveal:not(.visible)');if(!('IntersectionObserver'in window)){els.forEach(x=>x.classList.add('visible'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.08});els.forEach(e=>io.observe(e))}
function card(a,i){const el=document.createElement('a');el.className='story-card reveal';el.href=url(a);el.style.transitionDelay=(i*45)+'ms';const img=document.createElement('div');img.className='story-image';const im=document.createElement('img');im.loading='lazy';im.src=a.imageURL||'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&h=600&fit=crop&fm=webp&q=75';im.alt=text(a.title);img.appendChild(im);const body=document.createElement('div');body.className='story-body';const cat=document.createElement('div');cat.className='story-cat';cat.textContent=a.category||'News';const h=document.createElement('h3');h.className='story-title';h.textContent=a.title||'Untitled story';const p=document.createElement('p');p.className='story-excerpt';p.textContent=a.excerpt||'Read the latest story on Pakblog.';const meta=document.createElement('div');meta.className='story-meta';meta.textContent=(a.author||'Pakblog Desk')+' • '+dateText(a);body.append(cat,h,p,meta);el.append(img,body);return el}
function setHero(a){if(!a)return;const img=$('heroImage'),title=$('heroTitle'),ex=$('heroExcerpt'),cat=$('heroCategory'),author=$('heroAuthor'),date=$('heroDate'),main=$('heroMain');if(img){img.style.opacity='0';img.src=a.imageURL||img.src;img.onload=()=>{img.style.opacity='1'}}if(title)title.textContent=a.title||'News that moves with you.';if(ex)ex.textContent=a.excerpt||'The latest story from Pakblog.';if(cat)cat.textContent=(a.category||'Featured').toUpperCase();if(author)author.textContent=a.author||'Pakblog Desk';if(date)date.textContent=dateText(a);if(main)main.href=url(a)}
function setSide(a,which){if(!a)return;const prefix=which==='one'?'sideOne':'sideTwo';$(prefix).href=url(a);$(prefix+'Img').src=a.imageURL||$(prefix+'Img').src;$(prefix+'Cat').textContent=a.category||'News';$(prefix+'Title').textContent=a.title||'Latest from Pakblog'}
async function loadHome(){
 const grid=$('storyGrid'); if(!grid)return;
 try{
  const response=await fetch('/api/home',{cache:'no-store',headers:{'accept':'application/json'}});
  if(!response.ok) throw new Error('home api '+response.status);
  const data=await response.json();
  articles=(data.articles||[]).map(a=>({...a,_date:valueDate(a)}));
  sortArticles(articles);
  articles=articles.filter(a=>(a.status||'published')==='published' || a.status==null);
  if(!articles.length){grid.innerHTML='<div class="empty" style="grid-column:1/-1">No stories yet. Publish your first article and it will appear here.</div>';if($('loadMoreWrap'))$('loadMoreWrap').style.display='none';return}
  setHero(articles[0]);setSide(articles[1],'one');setSide(articles[2],'two');grid.innerHTML='';shown=0;appendPage();observe();
 }catch(e){console.error(e);grid.innerHTML='<div class="empty" style="grid-column:1/-1">Could not load stories. Please refresh.</div>'}
}
function appendPage(){const grid=$('storyGrid');if(!grid)return;const next=articles.slice(Math.max(1,shown+1),Math.max(1,shown+1)+PAGE);next.forEach((a,i)=>grid.appendChild(card(a,i)));shown+=next.length;if($('loadMoreWrap'))$('loadMoreWrap').style.display=shown+1<articles.length?'block':'none';observe()}
function initUI(){
 const menu=$('menuBtn'),drawer=$('drawer'),overlay=$('drawerOverlay'),close=$('drawerClose');
 const setOpen=v=>{if(!drawer||!overlay||!menu)return;drawer.classList.toggle('open',v);overlay.classList.toggle('open',v);menu.classList.toggle('open',v);menu.setAttribute('aria-expanded',String(v));drawer.setAttribute('aria-hidden',String(!v));document.body.style.overflow=v?'hidden':''};
 if(menu&&drawer){menu.onclick=()=>setOpen(!drawer.classList.contains('open'));close?.addEventListener('click',()=>setOpen(false));overlay?.addEventListener('click',()=>setOpen(false));drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});}
const theme=$('themeBtn');const dark=localStorage.getItem('pakblog-theme')==='dark';document.body.classList.toggle('dark',dark);if(theme)theme.onclick=()=>{const d=!document.body.classList.contains('dark');document.body.classList.toggle('dark',d);localStorage.setItem('pakblog-theme',d?'dark':'light')};
const header=document.getElementById('masthead');const top=$('backTop');window.addEventListener('scroll',()=>{const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;header?.classList.toggle('scrolled',y>8);top?.classList.toggle('show',y>450);const bar=$('readingBar');if(bar)bar.style.width=(h>0?Math.min(100,y/h*100):0)+'%'} ,{passive:true});top?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
const today=$('todayLine');if(today)today.textContent=new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
}
async function initSearch(){
 const form=$('searchForm'),input=$('searchInput'),grid=$('searchGrid'),info=$('searchInfo'),suggestions=$('searchSuggestions');
 if(!form||!input||!grid)return;
 let timer=0,controller=null;
 function hideSuggestions(){if(suggestions){suggestions.hidden=true;suggestions.innerHTML='';}}
 function showSuggestions(items){
   if(!suggestions)return;
   suggestions.innerHTML='';
   if(!items.length){hideSuggestions();return;}
   items.slice(0,8).forEach((a,i)=>{
     const b=document.createElement('button'); b.type='button'; b.className='search-suggestion'; b.setAttribute('role','option'); b.dataset.index=i;
     const t=document.createElement('span'); t.className='search-suggestion-title'; t.textContent=a.title||'Untitled story';
     const m=document.createElement('span'); m.className='search-suggestion-meta'; m.textContent=(a.category||'News')+' • '+(a.author||'Pakblog Desk');
     b.append(t,m); b.onclick=()=>{hideSuggestions(); if(a.slug) location.href=url(a); else {input.value=a.title||input.value; run(input.value)}}; suggestions.appendChild(b);
   });
   suggestions.hidden=false;
 }
 async function fetchResults(q,mode='results'){
   const urlPath='/api/search?q='+encodeURIComponent(q)+(mode==='suggest'?'&suggest=1':'');
   try{
     const r=await fetch(urlPath,{cache:'no-store',headers:{'accept':'application/json'},signal:controller?.signal});
     if(r.ok)return r.json();
   }catch(e){if(e.name==='AbortError')throw e;}
   // Safety net: the home feed is already required for the newsroom, so search can still work if the search function is temporarily unavailable.
   const home=await fetch('/api/home',{cache:'no-store',headers:{'accept':'application/json'},signal:controller?.signal});
   if(!home.ok)throw new Error('search and home unavailable');
   const data=await home.json();
   const terms=String(q||'').toLowerCase().split(/\s+/).filter(Boolean);
   const all=(data.articles||[]).filter(a=>!a.status||a.status==='published');
   const scored=all.map(a=>{
     const title=String(a.title||'').toLowerCase(), excerpt=String(a.excerpt||'').toLowerCase(), category=String(a.category||'').toLowerCase(), content=String(a.content||'').toLowerCase(), tags=Array.isArray(a.tags)?a.tags.join(' ').toLowerCase():String(a.tags||'').toLowerCase();
     let score=0; for(const t of terms){if(title.includes(t))score+=20;if(excerpt.includes(t))score+=8;if(category.includes(t))score+=6;if((title+' '+excerpt+' '+category+' '+content+' '+tags).includes(t))score+=1;}
     return {...a,score};
   }).filter(a=>a.score>0).sort((a,b)=>b.score-a.score);
   return {query:q,results:scored.slice(0,50),suggestions:scored.slice(0,8)};
 }
 async function suggest(q){
   if(q.trim().length<1){hideSuggestions();return;}
   if(controller)controller.abort(); controller=new AbortController();
   try{const res=await fetchResults(q,'suggest');showSuggestions(res.suggestions||res.results||[])}catch(e){if(e.name!=='AbortError')hideSuggestions();}
 }
 async function run(q){if(!q)return;hideSuggestions();grid.innerHTML='<div class="empty" style="grid-column:1/-1">Searching Pakblog…</div>';try{const res=await fetchResults(q);renderSearch(res.results||[],q)}catch(e){grid.innerHTML='<div class="empty" style="grid-column:1/-1">Search is temporarily unavailable. Please try again shortly.</div>'}}
 function renderSearch(res,q){grid.innerHTML='';if(info)info.textContent=res.length?`${res.length} result(s) for “${q}”`:`No results for “${q}”`;if(!res.length){grid.innerHTML='<div class="empty" style="grid-column:1/-1">Try another keyword or category.</div>';return}res.forEach((a,i)=>grid.appendChild(card(a,i)));observe()}
 input.addEventListener('input',()=>{clearTimeout(timer);const q=input.value.trim();timer=setTimeout(()=>suggest(q),180)});
 input.addEventListener('keydown',e=>{if(e.key==='Escape')hideSuggestions();});
 document.addEventListener('click',e=>{if(!form.contains(e.target))hideSuggestions()});
 form.onsubmit=e=>{e.preventDefault();const q=input.value.trim();if(q){history.replaceState({},'',`/search?q=${encodeURIComponent(q)}`);run(q)}};
 const q=new URLSearchParams(location.search).get('q');if(q){input.value=q;run(q)}
}
async function initCategory(){const root=$('categoryGrid');if(!root)return;const cat=(document.body.dataset.category||new URLSearchParams(location.search).get('cat')||'').replace(/-/g,' ');const wanted=cat.split(' ').map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(' ');const title=$('categoryTitle');if(title)title.textContent=wanted;try{let list=[];try{const r=await fetch('/api/search?q='+encodeURIComponent(wanted),{cache:'no-store',headers:{accept:'application/json'}});if(r.ok){const data=await r.json();list=(data.results||[]).filter(a=>String(a.category||'').toLowerCase()===wanted.toLowerCase());}}catch(e){}if(!list.length){const r=await fetch('/api/home',{cache:'no-store',headers:{accept:'application/json'}});if(!r.ok)throw new Error('category unavailable');const data=await r.json();list=(data.articles||[]).filter(a=>(!a.status||a.status==='published')&&String(a.category||'').toLowerCase()===wanted.toLowerCase());}root.innerHTML='';if(!list.length){root.innerHTML='<div class="empty" style="grid-column:1/-1"><h2>No stories in '+text(wanted)+' yet.</h2><p>Published stories will appear here automatically.</p></div>';return}list.forEach((a,i)=>root.appendChild(card(a,i)));observe()}catch(e){root.innerHTML='<div class="empty" style="grid-column:1/-1"><h2>Category temporarily unavailable.</h2><p>Please refresh and try again.</p></div>'}}
function initEngagement(){const bar=document.getElementById('mobileShare');if(bar){const toggle=()=>bar.classList.toggle('show',scrollY>420);window.addEventListener('scroll',toggle,{passive:true});toggle()}}
window.Pakblog={slugify,url};document.addEventListener('DOMContentLoaded',()=>{try{navigator.serviceWorker?.getRegistrations?.().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});if(window.caches)caches.keys().then(keys=>keys.forEach(k=>{if(/pakblog-static/i.test(k))caches.delete(k)})).catch(()=>{});}catch(e){}initUI();initEngagement();if(document.getElementById('storyGrid') && !document.getElementById('storyGrid').dataset.serverRendered)loadHome();if(document.getElementById('searchForm'))initSearch();if(document.getElementById('categoryGrid') && !document.getElementById('categoryGrid').dataset.serverRendered)initCategory();observe();});
})();
