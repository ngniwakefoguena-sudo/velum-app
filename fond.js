/* VELUME — fond d'écran animé (diaporama) + mode rapide.
   AUTOMATIQUE : mettez vos photos dans le dossier "fonds" et nommez-les
   1.jpg, 2.jpg, 3.jpg ... (jpg, jpeg, png ou webp). Rien d'autre à écrire. */
(function(){
var DOSSIER='fonds';
var IMAGES=[];        /* facultatif : liste manuelle, ex. ['fonds/cafe.jpg'] ; sinon laissez vide */
var DUREE=8;          /* secondes par image */
var ASSOMBRI=0.35;    /* 0 = image d'origine, 0.5 = bien plus sombre (le texte reste lisible) */
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
'#vfond .v{position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,12,6,'+(ASSOMBRI*0.8)+'),rgba(18,12,6,'+ASSOMBRI+'))}'+
'html.has-fond .login{background:transparent!important}'+
'html.has-fond .login>*:not(.bgfx){position:relative;z-index:2}'+
'html.has-fond-home body{background:transparent}html.has-fond-home .home{background:transparent!important}'+
'html.has-fond-home .home .wrap{position:relative;z-index:1}'+
'html.has-fond-home .home h1,html.has-fond-home .home h2,html.has-fond-home .home .ahello,html.has-fond-home .home .atn,html.has-fond-home .home .apptile span,html.has-fond-home .home .apptile b,html.has-fond-home .home .apptile .lbl{color:#fff!important;text-shadow:0 1px 6px rgba(0,0,0,.65)}'+
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
