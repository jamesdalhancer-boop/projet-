/* PROJECT 79 : fonctionnement hors ligne.
   Stratégie : on sert la copie locale tout de suite, puis on la rafraîchit en arrière-plan
   quand le réseau est disponible. Une nouvelle version de l'app est donc visible au lancement suivant.
   Les données (IndexedDB) ne sont jamais touchées par ce fichier. */
const CACHE='project79-v2';
const ASSETS=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('project79-')&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true})||(r.mode==='navigate'?await c.match('index.html'):null);
    const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||new Response('Hors ligne',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }));
});
