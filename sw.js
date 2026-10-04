// Fokusplan Service Worker: App offline verfügbar machen.
// Nach Änderungen an index.html die Version erhöhen, damit Geräte die neue Fassung laden.
const VERSION='fokusplan-v2';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  const sameOrigin=url.origin===location.origin;
  const fonts=url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';
  if(!sameOrigin&&!fonts)return;
  // App-Seite: zuerst Netz (neueste Fassung), offline aus dem Cache
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put('index.html',c));return r;}).catch(()=>caches.match('index.html')));
    return;
  }
  // Rest: zuerst Cache
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c));}return r;})));
});
