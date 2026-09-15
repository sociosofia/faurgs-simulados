const CACHE='faurgs-simulados-v4';
const STATIC=['./','index.html','css/app.css','js/app.js','js/richtext.js','manifest.webmanifest','assets/icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.pathname.includes('/data/source/')){e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));return;}e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp;})));});
