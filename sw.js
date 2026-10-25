/* VELUME — cache hors connexion (coquille de l'application). Les données restent dans le navigateur. */
const V='velume-shell-v17';
const SHELL=['/','/index.html','/manifest.webmanifest','/icon-192.png','/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(ca=>ca.put('/index.html',c));return x}).catch(()=>caches.match('/index.html')));return}
  if(u.origin===location.origin||u.host.endsWith('fonts.googleapis.com')||u.host.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.match(r).then(h=>{const n=fetch(r).then(x=>{if(x&&x.ok){const c=x.clone();caches.open(V).then(ca=>ca.put(r,c))}return x}).catch(()=>h);return h||n}))}
});
