/* VELUME — fond d'écran animé (diaporama) + mode rapide.
   AUTOMATIQUE : mettez vos photos dans le dossier "fonds" et nommez-les
   1.jpg, 2.jpg, 3.jpg ... (jpg, jpeg, png ou webp). Rien d'autre à écrire. */
(function(){
var DOSSIER='fonds';
var IMAGES=[];        /* facultatif : liste manuelle, ex. ['fonds/cafe.jpg'] ; sinon laissez vide */
var DUREE=8;          /* secondes par image */
var ASSOMBRI=0.62;    /* écrans de connexion : 0 = image d'origine, 0.6 = nettement plus sombre */
var ASSOMBRI_ACCUEIL=0.74; /* écran d'accueil des applications (plus sombre pour bien voir les icônes) */
var MOUVEMENT=true;   /* léger zoom lent */
var SUR_ACCUEIL=true; /* afficher aussi derrière l'écran d'accueil des applications */

var root=document.documentElement;
var faible=false;try{faible=(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)||(navigator.deviceMemory&&navigator.deviceMemory<=4)||matchMedia('(prefers-reduced-motion:reduce)').matches}catch(e){}
if(faible){root.classList.add('lite');MOUVEMENT=false}
function addCss(c){var s=document.createElement('style');s.textContent=c;document.head.appendChild(s)}
addCss('html.lite .login::before,html.lite .login::after,html.lite .home::before,html.lite .home::after,html.lite .bgfx{display:none!important}'+
'html.has-fond .login::before,html.has-fond .login::after,html.has-fond .home::before,html.has-fond .home::after,html.has-fond .bgfx,html.has-fond-home .home::before,html.has-fond-home .home::after{display:none!important}');

function init(list){
if(!list.length)return;
addCss('#vfond{position:fixed;inset:0;z-index:0;overflow:hidden;opacity:0;pointer-events:none;transition:opacity .4s;background:#1b140e;contain:strict}'+
'html.has-fond #vfond,html.has-fond-home #vfond{opacity:1}'+
'#vfond .s{position:absolute;inset:-3%;background-size:cover;background-position:center;opacity:0;transition:opacity 1.4s ease;will-change:opacity,transform}'+
'#vfond .s.on{opacity:1}'+
(MOUVEMENT?'#vfond .s.on{animation:vkb '+(DUREE+3)+'s linear forwards}@keyframes vkb{from{transform:scale(1)}to{transform:scale(1.08)}}':'')+
'#vfond{--vo:'+ASSOMBRI+'}html.has-fond-home #vfond{--vo:'+ASSOMBRI_ACCUEIL+'}'+
'#vfond .s{filter:saturate(.85) brightness(.8)}'+
'#vfond .v{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(18,12,6,calc(var(--vo)*.8)) 0%,rgba(10,7,3,calc(var(--vo) + .18)) 100%)}'+
'html.has-fond .login{background:transparent!important}'+
'html.has-fond .login>*:not(.bgfx){position:relative;z-index:2}'+
'html.has-fond-home body{background:transparent}html.has-fond-home .home{background:transparent!important}'+
'html.has-fond-home .home .wrap{position:relative;z-index:1}'+
'html.has-fond-home .home h1,html.has-fond-home .home h2,html.has-fond-home .home .ahello,html.has-fond-home .home .atn,html.has-fond-home .home .apptile .lb{color:#fff!important;font-weight:600;text-shadow:0 1px 3px rgba(0,0,0,.9),0 0 10px rgba(0,0,0,.6)}'+
'html.has-fond-home .home .apptile .ai{box-shadow:0 2px 10px rgba(0,0,0,.35)}'+
'html[data-theme="light"] #vfond{--vo:.55}html[data-theme="light"].has-fond-home #vfond{--vo:.66}'+
'html.has-fond-home .nav{background:color-mix(in srgb,var(--surface) 78%,transparent)}');
var box=document.createElement('div');box.id='vfond';box.setAttribute('aria-hidden','true');
var slides=list.map(function(u){var d=document.createElement('div');d.className='s';d.style.backgroundImage='url("'+u+'")';d.dataset.ok='1';box.appendChild(d);return d});
var v=document.createElement('div');v.className='v';box.appendChild(v);
function mount(){if(!document.body||box.parentNode)return;document.body.insertBefore(box,document.body.firstChild)}
if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount);
var i=-1,t=null;
function next(){if(document.hidden)return;i=(i+1)%slides.length;slides.forEach(function(s){s.classList.remove('on')});void slides[i].offsetWidth;slides[i].classList.add('on')}
function start(){if(!t){t=setInterval(next,DUREE*1000)}}function stop(){clearInterval(t);t=null}
document.addEventListener('visibilitychange',function(){document.hidden?stop():(start(),next())});
start();next();
var last='';function sync(){var l=!!document.querySelector('.login'),h=!l&&SUR_ACCUEIL&&!!document.querySelector('.home');var k=(l?1:0)+''+(h?1:0);if(k===last)return;last=k;root.classList.toggle('has-fond',l);root.classList.toggle('has-fond-home',h)}
var pend=false;new MutationObserver(function(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;sync()})}).observe(document.body||root,{childList:true,subtree:true});sync();
}

/* détection automatique : 1.jpg, 2.jpg ... jusqu'au premier numéro manquant */
function detect(done){var ex=['jpg','jpeg','png','webp'],out=[],n=1,MAX=15;
 function tryNum(){if(n>MAX)return done(out);var k=0;
  (function tryExt(){if(k>=ex.length)return done(out);var u=DOSSIER+'/'+n+'.'+ex[k];var im=new Image();im.onload=function(){out.push(u);n++;tryNum()};im.onerror=function(){k++;tryExt()};im.src=u})()}
 tryNum()}
if(IMAGES.length)init(IMAGES);else detect(init);
})();

/* ===== Thème clair/sombre (bouton) + cookies ===== */
(function(){
var L=(document.documentElement.lang||'fr').slice(0,2)==='en'?'en':'fr';
var T={fr:{ck:'Nous utilisons uniquement des cookies essentiels (connexion, langue, thème). Aucun suivi publicitaire.',ok:'Accepter',no:'Refuser',more:'Seuls les cookies essentiels seront utilisés',dark:'Passer en mode sombre',light:'Passer en mode clair'},
en:{ck:'We only use essential cookies (sign-in, language, theme). No advertising tracking.',ok:'Accept',no:'Decline',more:'Only essential cookies will be used',dark:'Switch to dark mode',light:'Switch to light mode'}}[L];
function g(k){try{return localStorage.getItem(k)}catch(e){return null}}
function p(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function ck(n,v){try{document.cookie=n+'='+v+';path=/;max-age=31536000;SameSite=Lax'}catch(e){}}
var root=document.documentElement;
function cur(){var t=root.getAttribute('data-theme');if(t)return t;try{return matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}catch(e){return 'light'}}
var saved=g('velume.theme');if(saved&&!root.getAttribute('data-theme')&&(g('velume.v2.state')===null||!/"theme":"(light|dark)"/.test(g('velume.v2.state')||'')))root.setAttribute('data-theme',saved);
var b=document.createElement('button');b.type='button';b.id='vtheme';
function icon(){var d=cur()==='dark';b.innerHTML=d?'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>':'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';var t=d?T.light:T.dark;b.title=t;b.setAttribute('aria-label',t)}
b.onclick=function(){var n=cur()==='dark'?'light':'dark';root.setAttribute('data-theme',n);p('velume.theme',n);
 try{var st=window.VELUME&&window.VELUME.state&&window.VELUME.state();if(st)st.theme=n;var raw=g('velume.v2.state');if(raw){var o=JSON.parse(raw);o.theme=n;p('velume.v2.state',JSON.stringify(o))}}catch(e){}
 icon()};
var st=document.createElement('style');st.textContent='#vtheme{position:fixed;left:14px;bottom:14px;z-index:60;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(20,15,9,.72);color:#E8C47A;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.35)}#vtheme:hover{background:rgba(20,15,9,.9)}'+
'#vck{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:70;max-width:560px;width:calc(100% - 28px);background:rgba(24,18,11,.94);color:#F2EBDC;border:1px solid rgba(232,196,122,.35);border-radius:14px;padding:14px 16px;box-shadow:0 12px 36px rgba(0,0,0,.45);display:flex;gap:12px;align-items:center;flex-wrap:wrap;font:14px/1.4 system-ui,-apple-system,Segoe UI,sans-serif}#vck p{margin:0;flex:1 1 240px}#vck button{border-radius:9px;padding:8px 16px;font:600 13px system-ui;cursor:pointer;border:1px solid rgba(232,196,122,.5);background:transparent;color:#E8C47A}#vck button.y{background:#D7A94E;color:#1B1710;border-color:#D7A94E}';
document.head.appendChild(st);
function mount(){if(!document.body)return setTimeout(mount,30);icon();document.body.appendChild(b);
 if(!g('velume.cookies')){var c=document.createElement('div');c.id='vck';c.setAttribute('role','dialog');c.innerHTML='<p>🍪 '+T.ck+'</p><button class="n">'+T.no+'</button><button class="y">'+T.ok+'</button>';
  function done(v){p('velume.cookies',v);ck('velume_cookies',v);c.remove()}
  c.querySelector('.y').onclick=function(){done('accepted')};c.querySelector('.n').onclick=function(){done('essential')};document.body.appendChild(c)}
 else ck('velume_cookies',g('velume.cookies'))}
mount();
})();
