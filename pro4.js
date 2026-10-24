/* ===== VELUME PRO — assistant de démarrage, comptes/rôles, base vierge, modes d'affichage ===== */
(function(){
const css=document.createElement('style');css.textContent=`
.wz{max-width:520px;width:100%;display:grid;gap:14px}
.wz h2{margin:0;font-family:var(--fd);font-size:1.25rem}
.wz .steps{display:flex;gap:6px}.wz .steps i{flex:1;height:4px;border-radius:2px;background:var(--line)}.wz .steps i.on{background:var(--gold)}
.wz .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.wz .opt{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:10px;padding:10px 12px;cursor:pointer}
.wz .opt input{margin-top:3px;accent-color:var(--teal)}
.wz .opt.on{border-color:var(--gold);background:var(--gold-soft)}
.wz .err,.lerr{color:var(--bad);font-size:.88rem}
.wz .foot{display:flex;gap:8px;justify-content:space-between}
.qtiles{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.qtiles button{display:flex;gap:8px;align-items:center;border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:6px 12px 6px 6px}
.devseg{display:flex;flex-wrap:wrap;gap:6px}.devseg button{border:1px solid var(--line-2);background:var(--surface);border-radius:8px;padding:8px 12px}
.devseg button[aria-pressed=true]{border-color:var(--gold);background:var(--gold-soft);font-weight:700}
.acc table{border-collapse:collapse;width:100%;font-size:.88rem}.acc th,.acc td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:center}
.acc th:first-child,.acc td:first-child{text-align:left}.acc input{accent-color:var(--teal);width:18px;height:18px}
.hi{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
/* modes d'affichage */
html[data-device=tablet] body,html[data-device=pos] body{font-size:16px}
html[data-device=tablet] .btn,html[data-device=pos] .btn{min-height:46px;padding:10px 18px}
html[data-device=tablet] .ib,html[data-device=pos] .ib{min-width:46px;min-height:46px}
html[data-device=tablet] input:not([type=checkbox]):not([type=radio]),html[data-device=tablet] select,html[data-device=pos] input:not([type=checkbox]):not([type=radio]),html[data-device=pos] select{min-height:46px}
html[data-device=tablet] .menus button,html[data-device=pos] .menus button{padding:14px 14px}
html[data-device=tablet] .apps-grid,html[data-device=pos] .apps-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px}
html[data-device=tablet] .apptile,html[data-device=pos] .apptile{min-height:130px}
html[data-device=tablet] .posr .pbody,html[data-device=pos] .posr .pbody{grid-template-columns:minmax(0,1fr) 360px}
html[data-device=tablet] .posr .pbody .ord,html[data-device=pos] .posr .pbody .ord{display:flex}
html[data-device=tablet] .posr .pbody .pcat,html[data-device=pos] .posr .pbody .pcat{display:block}
html[data-device=tablet] .cartbar,html[data-device=pos] .cartbar{display:none}
html[data-device=pos] .pgrid{grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:14px}
html[data-device=pos] .pprod{min-height:150px}html[data-device=pos] .pprod .ph{height:72px}html[data-device=pos] .pprod .pn{font-size:1.05rem}
html[data-device=pos] .pad button{min-height:60px;font-size:1.15rem}html[data-device=pos] .payb{min-height:76px;font-size:1.1rem}
html[data-device=pos] .ticket{padding:14px;font-size:1.05rem}
html[data-device=pos] .nav .menus{display:none}html[data-device=pos] .nav .burger{display:inline-grid}
html[data-device=desktop] .va{font-size:.94rem}
html[data-device=phone] .posr .pbody{grid-template-columns:minmax(0,1fr)}
@media(max-width:700px){.wz .row2{grid-template-columns:1fr}}
`;document.head.appendChild(css);

/* ---------- utilitaires ---------- */
const hsh=s=>{let h=5381;const t=String(s)+'|velume';for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return 'h$'+(h>>>0).toString(36)};
window.__hsh=hsh;
const curUser=()=>D.all('user').find(u=>u.id===ST.uid);
const role=()=>{const u=curUser();return u?u.group:(ST.pro&&ST.pro.setup?'portal':'admin')};
const ROLES=[['manager','Gérant / comptable','Manager / accountant'],['cashier','Caissier / serveur','Cashier / waiter'],['studio','Studio / production','Studio / production'],['kitchen','Cuisine / bar','Kitchen / bar'],['user','Utilisateur interne','Internal user']];
const DEFAPPS={cashier:['pos','kitchen','loyalty','contacts','discuss','todo','calendar'],studio:['rental','planning','gallery','project','appointments','calendar','contacts','knowledge','discuss','todo','delivery'],kitchen:['kitchen','inventory','recipes','hygiene','discuss','todo'],user:['discuss','todo','calendar','knowledge','timeoff','attendance']};
const ALLAPPS=()=>APPS.filter(a=>a.id!=='config'&&a.id!=='apps'&&(a.core||ST.installed[a.id]!==false)).map(a=>a.id);
const roleApps=r=>{const o=ST.set.roleApps&&ST.set.roleApps[r];if(o)return o;return r==='manager'?ALLAPPS():(DEFAPPS[r]||[])};
const canApp=id=>{const r=role();if(r==='admin')return true;if(id==='config'||id==='apps')return false;if(r==='portal')return false;return roleApps(r).includes(id)};
window.__canApp=canApp;
const ROLELBL=r=>r==='admin'?tr('Administrateur','Administrator'):(ROLES.find(x=>x[0]===r)?tr(ROLES.find(x=>x[0]===r)[1],ROLES.find(x=>x[0]===r)[2]):r);
function ensureEmp(u){let e=u.emp&&D.get('employee',u.emp);if(!e){e=D.create('employee',{name:u.name,email:u.login},{silent:true});D.write('user',u.id,{emp:e.id},{silent:true})}return e.id}

/* groupes d'accès + champ code */
{const g=M.user.f.group;[['manager','Gérant / comptable','Manager / accountant','gold'],['cashier','Caissier / serveur','Cashier / waiter','info'],['studio','Studio / production','Studio / production','info'],['kitchen','Cuisine / bar','Kitchen / bar','info']].forEach(o=>g.opts.splice(1,0,o));
 M.user.f.pending={k:'pending',t:'bool',fr:'En attente de validation',en:'Pending approval'};
 M.user.f.owner={k:'owner',t:'bool',fr:'Administrateur principal',en:'Main administrator'};
 M.user.f.newcode={k:'newcode',t:'char',fr:'Nouveau mot de passe / code',en:'New password / code'};
 const c0=M.user.compute;M.user.compute=r=>{if(c0)c0(r);if(r.newcode){r.code=hsh(r.newcode);r.newcode=''}};
 if(ACT.users&&ACT.users.form)ACT.users.form.cols=[['login','emp','active'],['group','lang','newcode']];}

/* ---------- base vierge ---------- */
const KEEP=['poscfg','paymeth','journal','tax','pterm','currency','prepstage','taskstage','projstage','acttype','emptype','coinval','leavereason','fiscpos','dunning','payprov','badge','contracttpl','workschedule','channel'];
const DEMOK='velume.demo.v1';
function blankify(){
  try{localStorage.setItem(DEMOK,JSON.stringify({db:ST.db,seq:ST.seq,unread:ST.unread,acts:ST.acts}))}catch(e){}
  Object.keys(ST.db).forEach(m=>{if(!KEEP.includes(m)){ST.db[m]=[];ST.seq[m]=0}});
  const pc=(ST.db.poscfg||[])[0];ST.db.poscfg=pc?[Object.assign({},pc,{name:'Caisse principale'})]:[];ST.seq.poscfg=pc?1:0;
  const ch=(ST.db.channel||[])[0];ST.db.channel=ch?[Object.assign({},ch,{members:[],name:'général'})]:[];ST.seq.channel=ch?1:0;
  (ST.db.workschedule||[]).forEach((w,i)=>{w.company='';w.name=i?w.name:'Horaires standard (40 h/semaine)'});
  (ST.db.contracttpl||[]).forEach(c=>{c.dept=null;c.hr=null});
  ST.acts=[];ST.unread=0;ST.recent=[];ST.fav={};ST.ai=[];ST.set={};ST.installed=ST.installed||{};
  ST.pro={setup:false};ST.auth=false;ST.uid=null;ST.me=1;
}
window.__pro4Boot=function(){
  if(!ST.pro){blankify();saveNow()}
  if(ST.pro.setup&&!D.all('user').some(u=>u.owner)){const a=D.all('user').filter(u=>u.group==='admin').sort((x,y)=>x.id-y.id)[0];if(a)a.owner=true;saveNow()}
  if(ST.auth&&(!ST.pro.setup||!curUser())){ST.auth=false}
};
function hasDemo(){try{return !!localStorage.getItem(DEMOK)}catch(e){return false}}
function restoreDemo(){try{const d=JSON.parse(localStorage.getItem(DEMOK));if(!d)return false;ST.db=d.db;ST.seq=d.seq;ST.unread=d.unread||0;ST.acts=d.acts||[];return true}catch(e){return false}}
resetAll=function(){
  const lang=ST.lang,theme=ST.theme;
  if(!restoreDemo()){} 
  blankify();ST.lang=lang;ST.theme=theme;ST.dev=false;saveNow();
  Object.keys(VS).forEach(k=>delete VS[k]);R.screen='home';R.app=null;R.rid=null;FV=null;UI.modal=null;UI.till=null;UI.ch=null;UI.art=null;UI.wz=null;setHash();render();
};

/* ---------- modes d'affichage ---------- */
const DEVK='velume.device';let DEV='auto';try{DEV=localStorage.getItem(DEVK)||'auto'}catch(e){}
function devMode(){if(DEV!=='auto')return DEV;const w=window.innerWidth,co=window.matchMedia&&matchMedia('(pointer:coarse)').matches;if(w<700)return 'phone';if(co||w<1100)return 'tablet';return 'desktop'}
function applyDevice(){const h=document.documentElement;h.dataset.device=devMode();h.dataset.devpref=DEV}
const DEVS=[['auto','Automatique','Automatic'],['phone','Téléphone','Phone'],['tablet','Tablette','Tablet'],['desktop','Poste de travail','Workstation'],['pos','Caisse tactile','Touch register']];
window.__deviceHtml=()=>'<div class="devseg">'+DEVS.map(d=>'<button data-a="dev-set" data-m="'+d[0]+'" aria-pressed="'+(DEV===d[0])+'">'+esc(tr(d[1],d[2]))+'</button>').join('')+'</div>';
A['dev-set']=el=>{DEV=el.dataset.m;try{localStorage.setItem(DEVK,DEV)}catch(e){}UI.pop=null;render()};
window.addEventListener('resize',()=>{if(DEV==='auto'&&document.documentElement.dataset.device!==devMode()){applyDevice();render()}});

/* ---------- garde d'accès + rendu ---------- */
{const r0=render;render=function(){if(ST&&ST.auth&&R.screen==='app'&&R.app&&!canApp(R.app)){R.screen='home';R.app=null;R.menu=null;R.rid=null}applyDevice();return r0.apply(this,arguments)}}
{const nb=navbar;navbar=function(ap){const r=role();let o=null;
  try{return nb(ap).replace('<span class="co">Velume Coffee &amp; Studio</span>','<span class="co">'+esc(company())+'</span>')}finally{if(o)ap.menus=o}}}
{const h0=homeHtml;homeHtml=function(){const h=h0();const u=curUser();const first=u?String(u.name).split(' ')[0]:'';
  const n=APPS.filter(appVisible).length;
  const msg='<div class="hi"><b>'+tr('Bonjour','Hello')+(first?' '+esc(first):'')+'</b><span class="badge">'+esc(ROLELBL(role()))+'</span><span class="muted">'+esc(company())+'</span>'+(n?'':'<span class="muted">'+tr('Aucune application autorisée : demandez à l’administrateur.','No app allowed: ask the administrator.')+'</span>')+'</div>';
  return h.replace(/<div class="notice trial">[\s\S]*?<\/button><\/div>/,'<div class="notice">'+msg+'</div>')}}
{const p0=popoverHtml;popoverHtml=function(){let h=p0();if(UI.pop!=='user')return h;
  h=h.replace(/<button data-a="suser">[\s\S]*?<\/button>/,'<button data-a="lock">'+ic('user')+tr('Verrouiller / changer d’utilisateur','Lock / switch user')+'</button>');
  const u=curUser();if(u)h=h.replace(/<div class="muted" style="font-size:.84rem">[^<]*<\/div>/,'<div class="muted" style="font-size:.84rem">'+esc(ROLELBL(u.group))+'</div>');
  h=h.replace('<button data-a="dev">',DEVS.map(d=>'<button data-a="dev-set" data-m="'+d[0]+'">'+ic('gear')+tr('Affichage : ','Display: ')+esc(tr(d[1],d[2]))+(DEV===d[0]?' ✓':'')+'</button>').join('')+'<hr><button data-a="dev">');
  if(role()!=='admin')h=h.replace(/<button data-a="dev">[\s\S]*?<\/button>/,'').replace(/<button data-a="menu" data-app="config" data-id="st_gen">[\s\S]*?<\/button>/,'');
  return h}}
A.lock=()=>A.logout();

/* ---------- connexion ---------- */
loginHtml=function(){
  if(!ST.pro||!ST.pro.setup)return wizHtml();
  const us=D.all('user').filter(u=>u.active!==false&&!u.pending&&u.group!=='portal');
  const tiles=ST.set.quick_login!==false&&us.length>1?'<div class="qtiles">'+us.slice(0,12).map(u=>'<button data-a="lg-pick" data-id="'+u.id+'">'+avatar(u.name,'sm')+esc(String(u.name).split(' ')[0])+'</button>').join('')+'</div>':'';
  return '<div class="login"><div class="lcard"><div style="text-align:center"><span class="brand" style="margin:0;font-size:1.3rem;letter-spacing:.3em"><i class="brand-mark"></i>VELUME</span><p class="muted" style="margin-top:4px;font-size:.9rem">'+esc(company())+'</p></div>'+tiles+
   '<div class="lf"><label for="lg">'+tr('E-mail ou identifiant','E-mail or username')+'</label><input id="lg" type="text" value="'+esc(UI.lglogin||'')+'" autocomplete="username" autocapitalize="none"></div>'+
   '<div class="lf"><label for="lp">'+tr('Mot de passe / code','Password / code')+'</label><input id="lp" type="password" autocomplete="current-password"></div>'+
   (UI.lgerr?'<div class="lerr" role="alert">'+esc(UI.lgerr)+'</div>':'')+
   '<button class="btn pri" data-a="login">'+tr('Se connecter','Log in')+'</button>'+
   (((ST.set.signup||'approval')!=='off'||(ST.set.invites||[]).some(i=>!i.used))?'<button class="btn" data-a="su-open">'+tr('Créer mon compte','Create my account')+'</button>':'')+
   '<div class="seg" style="justify-self:center" role="group"><button data-a="lang" data-l="fr" aria-pressed="'+(LANG==='fr')+'">Français</button><button data-a="lang" data-l="en" aria-pressed="'+(LANG==='en')+'">English</button></div>'+
   '<div style="justify-self:center">'+window.__deviceHtml()+'</div>'+
   '<p class="muted" style="font-size:.8rem;text-align:center">'+tr('Les comptes sont créés par l’administrateur. Données enregistrées sur cet appareil.','Accounts are created by the administrator. Data is stored on this device.')+'</p></div></div>';
};
A['lg-pick']=el=>{const u=D.get('user',+el.dataset.id);UI.lglogin=u?u.login:'';UI.lgerr='';render();const p=document.getElementById('lp');if(p)p.focus()};
A.login=()=>{
  if(!ST.pro||!ST.pro.setup)return;
  const lg=((document.getElementById('lg')||{}).value||'').trim().toLowerCase(),pw=(document.getElementById('lp')||{}).value||'';
  UI.lglogin=lg;
  const u=D.all('user').find(x=>(x.login||'').toLowerCase()===lg||String(x.name||'').toLowerCase()===lg);
  if(!u||!u.code||(u.code!==hsh(pw)&&u.code!==pw)){UI.lgerr=tr('Identifiant ou mot de passe incorrect.','Wrong username or password.');return render()}
  if(u.pending){UI.lgerr=tr('Votre compte attend la validation de l’administrateur.','Your account is waiting for administrator approval.');return render()}
  if(u.active===false){UI.lgerr=tr('Ce compte est désactivé.','This account is disabled.');return render()}
  UI.lgerr='';UI.lglogin='';ST.uid=u.id;ST.me=ensureEmp(u);ST.auth=true;if(u.lang)LANG=ST.lang=u.lang;
  R.screen='home';R.app=null;R.menu=null;R.rid=null;FV=null;UI.pop=null;save();setHash();render();
  if(u.group==='cashier'&&canApp('pos'))setTimeout(()=>openApp('pos'),0);
};
const lo0=A.logout;A.logout=()=>{UI.modal=null;ST.auth=false;ST.uid=null;UI.till=null;save();UI.pop=null;R.screen='home';R.app=null;setHash();render()};

/* ---------- assistant de démarrage ---------- */
const WZ=()=>UI.wz||(UI.wz={step:1,company:'',address:'',city:'Douala',niu:'',phone:'',cafe:true,studio:true,name:'',email:'',code:'',code2:'',demo:false,err:''});
function wizHtml(){
  const w=WZ(),s=w.step;const f=(k,l,x)=>'<div class="lf"><label>'+l+'</label><input data-wz="'+k+'" value="'+esc(w[k])+'" '+(x||'')+'></div>';
  let b='';
  if(s===1)b='<h2>'+tr('Bienvenue dans VELUME','Welcome to VELUME')+'</h2><p class="muted">'+tr('Configurons votre espace en quelques étapes. Tout démarre vide : vous créez vos produits, vos équipes et vos comptes.','Let’s set up your workspace in a few steps. Everything starts empty: you create your products, teams and accounts.')+'</p><div><b>'+tr('Langue','Language')+'</b><div class="seg" style="margin-top:6px" role="group"><button data-a="lang" data-l="fr" aria-pressed="'+(LANG==='fr')+'">Français</button><button data-a="lang" data-l="en" aria-pressed="'+(LANG==='en')+'">English</button></div></div><div><b>'+tr('Mode d’affichage de cet appareil','Display mode for this device')+'</b><div style="margin-top:6px">'+window.__deviceHtml()+'</div></div>';
  if(s===2)b='<h2>'+tr('Votre entreprise','Your business')+'</h2>'+f('company',tr('Nom de l’entreprise','Business name'))+'<div class="row2">'+f('city',tr('Ville','City'))+f('phone',tr('Téléphone','Phone'))+'</div>'+f('address',tr('Adresse','Address'))+f('niu',tr('NIU (n° contribuable) — facultatif','Tax ID (NIU) — optional'))+'<div><b>'+tr('Activités (pour préparer des catégories de départ)','Activities (to prepare starter categories)')+'</b><label class="opt'+(w.cafe?' on':'')+'" style="margin-top:6px"><input type="checkbox" data-wzc="cafe"'+(w.cafe?' checked':'')+'><span>'+tr('Café / bar / restaurant','Café / bar / restaurant')+'</span></label><label class="opt'+(w.studio?' on':'')+'" style="margin-top:6px"><input type="checkbox" data-wzc="studio"'+(w.studio?' checked':'')+'><span>'+tr('Studios (photo, podcast, vidéo)','Studios (photo, podcast, video)')+'</span></label></div>';
  if(s===3)b='<h2>'+tr('Compte administrateur','Administrator account')+'</h2><p class="muted">'+tr('L’administrateur contrôle tout : utilisateurs, accès, paramètres, finances. Vous créerez ensuite les comptes de vos employés.','The administrator controls everything: users, access, settings, finances. You will then create your employees’ accounts.')+'</p>'+f('name',tr('Nom complet','Full name'))+f('email',tr('E-mail (identifiant de connexion)','E-mail (login)'),'type="text" autocapitalize="none"')+'<div class="row2"><div class="lf"><label>'+tr('Mot de passe (6 caractères min.)','Password (min. 6 chars)')+'</label><input type="password" data-wz="code" value="'+esc(w.code)+'"></div><div class="lf"><label>'+tr('Confirmer','Confirm')+'</label><input type="password" data-wz="code2" value="'+esc(w.code2)+'"></div></div>';
  if(s===4)b='<h2>'+tr('Données de départ','Starting data')+'</h2><label class="opt'+(!w.demo?' on':'')+'"><input type="radio" name="wzd" data-wzr="0"'+(!w.demo?' checked':'')+'><span><b>'+tr('Commencer vierge (recommandé)','Start empty (recommended)')+'</b><br><span class="muted">'+tr('Aucun produit, client ni employé : vous ajoutez les vôtres.','No products, customers or employees: you add yours.')+'</span></span></label>'+(hasDemo()?'<label class="opt'+(w.demo?' on':'')+'" style="margin-top:8px"><input type="radio" name="wzd" data-wzr="1"'+(w.demo?' checked':'')+'><span><b>'+tr('Charger les données d’exemple','Load sample data')+'</b><br><span class="muted">'+tr('Pour explorer l’application. Vous pourrez tout effacer ensuite (Paramètres › Données).','To explore the app. You can wipe everything afterwards (Settings › Data).')+'</span></span></label>':'');
  return '<div class="login"><div class="lcard wz"><div style="text-align:center"><span class="brand" style="margin:0;font-size:1.3rem;letter-spacing:.3em"><i class="brand-mark"></i>VELUME</span></div><div class="steps">'+[1,2,3,4].map(i=>'<i class="'+(i<=s?'on':'')+'"></i>').join('')+'</div>'+b+(w.err?'<div class="err" role="alert">'+esc(w.err)+'</div>':'')+'<div class="foot">'+(s>1?'<button class="btn" data-a="wz-prev">'+tr('Retour','Back')+'</button>':'<span></span>')+(s<4?'<button class="btn pri" data-a="wz-next">'+tr('Continuer','Continue')+'</button>':'<button class="btn pri" data-a="wz-done">'+tr('Terminer et ouvrir VELUME','Finish and open VELUME')+'</button>')+'</div></div></div>';
}
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&el.dataset.wz&&UI.wz)UI.wz[el.dataset.wz]=el.value});
document.addEventListener('change',e=>{const el=e.target;if(!el.dataset||!UI.wz)return;if(el.dataset.wzc){UI.wz[el.dataset.wzc]=el.checked;render()}if(el.dataset.wzr!=null){UI.wz.demo=el.dataset.wzr==='1';render()}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.wz){e.preventDefault();const b=document.querySelector('[data-a=wz-next],[data-a=wz-done]');if(b)b.click()}});
A['wz-prev']=()=>{WZ().step--;UI.wz.err='';render()};
A['wz-next']=()=>{const w=WZ();w.err='';
  if(w.step===2&&!w.company.trim())w.err=tr('Le nom de l’entreprise est requis.','Business name is required.');
  if(w.step===3){if(!w.name.trim()||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(w.email.trim()))w.err=tr('Nom et e-mail valide requis.','Name and a valid e-mail are required.');else if(w.code.length<6)w.err=tr('Mot de passe : 6 caractères minimum.','Password: 6 characters minimum.');else if(w.code!==w.code2)w.err=tr('Les mots de passe ne correspondent pas.','Passwords do not match.')}
  if(!w.err)w.step++;render()};
A['wz-done']=()=>{
  const w=WZ();
  if(w.demo)restoreDemo();
  ST.set.company=w.company.trim();ST.set.address=[w.address.trim(),w.city.trim()].filter(Boolean).join(', ');ST.set.niu=w.niu.trim();ST.set.co_phone=w.phone.trim();
  const emp=D.create('employee',{name:w.name.trim(),email:w.email.trim().toLowerCase()},{silent:true});
  const u=D.create('user',{name:w.name.trim(),login:w.email.trim().toLowerCase(),code:hsh(w.code),group:'admin',owner:true,lang:LANG,active:true,emp:emp.id},{silent:true});
  if(!w.demo){
    const cats=[];if(w.cafe)cats.push('Boissons chaudes','Boissons froides','Pâtisserie','Plats');if(w.studio)cats.push('Studio photo','Studio podcast','Studio vidéo');
    cats.forEach((n,i)=>D.create('pcat',{name:n,seq:i*10},{silent:true}));
    if(w.studio)['Studio photo','Studio podcast','Studio vidéo'].forEach(n=>D.create('rentcat',{name:n},{silent:true}));
    const ch=(ST.db.channel||[])[0];if(ch)ch.members=[emp.id];
    const pc=ST.db.poscfg[0];if(pc)pc.name=w.company.trim()+' · '+tr('Caisse','Register');
  }
  ST.pro={setup:true,at:isoDT(new Date())};ST.uid=u.id;ST.me=emp.id;ST.auth=true;UI.wz=null;
  R.screen='home';R.app=null;saveNow();setHash();render();toast(tr('Bienvenue ! Commencez par ajouter vos produits et vos comptes employés.','Welcome! Start by adding your products and employee accounts.'));
};

/* ---------- Rôles & accès + création de comptes ---------- */
CUSTOM.access=function(){
  const apps=APPS.filter(a=>a.id!=='config'&&a.id!=='apps'&&(a.core||ST.installed[a.id]!==false));
  const head='<tr><th>'+tr('Application','Application')+'</th><th>'+tr('Administrateur','Administrator')+'</th>'+ROLES.map(r=>'<th>'+esc(tr(r[1],r[2]))+'</th>').join('')+'</tr>';
  const rows=apps.map(a=>'<tr><td>'+esc(L(a.l))+'</td><td><input type="checkbox" checked disabled></td>'+ROLES.map(r=>'<td><input type="checkbox" data-ac="'+r[0]+'|'+a.id+'"'+(roleApps(r[0]).includes(a.id)?' checked':'')+'></td>').join('')+'</tr>').join('');
  return pageHead(tr('Rôles & accès','Roles & access'))+'<div class="va gut"><div class="card acc" style="overflow:auto"><p class="muted">'+tr('Choisissez les applications visibles pour chaque rôle. L’administrateur a toujours accès à tout, y compris aux Paramètres. Les menus Configuration et Rapports restent réservés à l’administrateur et au gérant.','Choose which apps each role can see. The administrator always has full access, including Settings. Configuration and Reporting menus stay reserved to administrator and manager.')+'</p><table>'+head+rows+'</table></div></div>';
};
document.addEventListener('change',e=>{const el=e.target;if(!el.dataset||!el.dataset.ac)return;const [r,a]=el.dataset.ac.split('|');ST.set.roleApps=ST.set.roleApps||{};const cur=roleApps(r).slice();const i=cur.indexOf(a);if(el.checked&&i<0)cur.push(a);if(!el.checked&&i>=0)cur.splice(i,1);ST.set.roleApps[r]=cur;save();toast(tr('Accès mis à jour.','Access updated.'))});
{const st=APPS.find(a=>a.id==='config');const g=st&&st.menus.find(m=>m.id==='st_usr');if(g&&!g.ch.some(c=>c.id==='st_acc'))g.ch.splice(1,0,M_('st_acc',['Rôles & accès','Roles & access'],null,{cus:'access'}))}
MODALS.newacct={title:()=>tr('Compte créé','Account created'),body:p=>'<p>'+tr('Transmettez ces identifiants à l’employé (notez-les maintenant, le mot de passe n’est plus affiché ensuite) :','Give these credentials to the employee (note them now, the password is not shown again):')+'</p><div class="card" style="font-family:var(--fm,monospace)"><div>'+tr('Identifiant','Login')+' : <b>'+esc(p.login)+'</b></div><div>'+tr('Mot de passe','Password')+' : <b>'+esc(p.code)+'</b></div><div>'+tr('Rôle','Role')+' : <b>'+esc(ROLELBL(p.group))+'</b></div></div><p class="muted">'+tr('Modifiez le rôle dans Paramètres › Utilisateurs.','Change the role in Settings › Users.')+'</p>',foot:()=>'<button class="btn pri" data-a="mclose">OK</button>'};
A['st3-invite']=()=>{
  const e=(UI.sinv||'').trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))return toast(tr('Adresse e-mail invalide.','Invalid email address.'));
  if(D.all('user').some(u=>(u.login||'').toLowerCase()===e))return toast(tr('Cet utilisateur existe déjà.','This user already exists.'));
  const code=String(Math.floor(100000+Math.random()*900000));
  const u=D.create('user',{name:e.split('@')[0],login:e,code:hsh(code),group:'cashier',lang:LANG,active:true},{silent:true});ensureEmp(u);
  UI.sinv='';save();openModal('newacct',{login:e,code:code,group:'cashier'});
};

/* ---------- inscription libre des employés ---------- */
const SU=()=>UI.su||(UI.su={name:'',id:'',code:'',code2:'',err:''});
MODALS.signup={title:()=>tr('Créer mon compte','Create my account'),wide:0,
  body:()=>{const w=SU(),f=(k,l,t)=>'<div class="lf"><label>'+l+'</label><input data-su="'+k+'" type="'+(t||'text')+'" value="'+esc(w[k])+'" autocapitalize="none"></div>';
    return '<p class="muted">'+((ST.set.signup||'approval')==='open'?tr('Votre compte sera actif immédiatement avec un accès de base.','Your account will be active immediately with basic access.'):tr('L’administrateur doit valider votre compte et vous attribuer un rôle avant votre première connexion.','The administrator must approve your account and assign a role before you can sign in.'))+'</p>'+f('name',tr('Nom complet','Full name'))+f('id',tr('Adresse Gmail / e-mail, ou identifiant au choix','Gmail / e-mail address, or any username'))+f('code',tr('Mot de passe (6 caractères min.)','Password (min. 6 chars)'),'password')+f('code2',tr('Confirmer le mot de passe','Confirm password'),'password')+(w.err?'<div class="lerr" role="alert">'+esc(w.err)+'</div>':'')},
  foot:()=>'<button class="btn pri" data-a="su-ok">'+tr('Créer mon compte','Create my account')+'</button><button class="btn" data-a="mclose">'+tr('Annuler','Cancel')+'</button>'};
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&el.dataset.su&&UI.su)UI.su[el.dataset.su]=el.value});
{const l1=loginHtml;loginHtml=function(){return l1()+(UI.modal?modalHtml():'')}}
A['su-open']=()=>{UI.su=null;openModal('signup')};
A['su-ok']=()=>{
  const w=SU(),id=w.id.trim().toLowerCase(),mode=ST.set.signup||'approval';
  if(mode==='off')return;
  w.err='';
  if(!w.name.trim()||id.length<3||/\s/.test(id))w.err=tr('Nom requis ; identifiant sans espace (3 caractères min.).','Name required; username without spaces (min. 3 chars).');
  else if(w.code.length<6)w.err=tr('Mot de passe : 6 caractères minimum.','Password: 6 characters minimum.');
  else if(w.code!==w.code2)w.err=tr('Les mots de passe ne correspondent pas.','Passwords do not match.');
  else if(D.all('user').some(u=>(u.login||'').toLowerCase()===id))w.err=tr('Cet identifiant existe déjà.','This username already exists.');
  if(w.err)return render();
  const open=mode==='open';
  const u=D.create('user',{name:w.name.trim(),login:id,code:hsh(w.code),group:'user',lang:LANG,active:true,pending:!open},{silent:true});
  ensureEmp(u);UI.su=null;UI.modal=null;save();
  if(open){UI.lglogin=id;toast(tr('Compte créé. Connectez-vous.','Account created. Please sign in.'))}
  else toast(tr('Demande envoyée. L’administrateur doit la valider.','Request sent. The administrator must approve it.'));
  render();
};
const pendingUsers=()=>D.all('user').filter(u=>u.pending);
MODALS.pending={title:()=>tr('Demandes de compte','Account requests'),
  body:()=>{const p=pendingUsers();return p.length?p.map(u=>'<div class="card" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px"><div style="flex:1;min-width:160px"><b>'+esc(u.name)+'</b><div class="muted">'+esc(u.login)+'</div></div><select data-pr="'+u.id+'">'+['cashier','studio','kitchen','manager','user'].map(r=>'<option value="'+r+'">'+esc(ROLELBL(r))+'</option>').join('')+'</select><button class="btn pri sm" data-a="pr-ok" data-id="'+u.id+'">'+tr('Approuver','Approve')+'</button><button class="btn sm" data-a="pr-no" data-id="'+u.id+'">'+tr('Refuser','Reject')+'</button></div>').join(''):'<p class="muted">'+tr('Aucune demande en attente.','No pending request.')+'</p>'},
  foot:()=>'<button class="btn" data-a="mclose">'+tr('Fermer','Close')+'</button>'};
A['pr-ok']=el=>{const id=+el.dataset.id;const sel=document.querySelector('[data-pr="'+id+'"]');D.write('user',id,{pending:false,group:sel?sel.value:'user'},{silent:true});save();toast(tr('Compte approuvé.','Account approved.'));render()};
A['pr-no']=el=>{D.unlink('user',+el.dataset.id);save();toast(tr('Demande refusée.','Request rejected.'));render()};
A['pr-open']=()=>openModal('pending');
{const h1=homeHtml;homeHtml=function(){const h=h1();const n=role()==='admin'?pendingUsers().length:0;if(!n)return h;return h.replace('</div></div><div class="apps-grid">','<button class="btn pri sm" data-a="pr-open">'+n+' '+tr('demande(s) de compte à valider','account request(s) to approve')+'</button></div></div><div class="apps-grid">')}}

/* ---------- administrateur principal ---------- */
const isOwner=()=>{const u=curUser();return !u||!!u.owner};
const deny=()=>toast(tr('Action réservée à l’administrateur principal.','Action reserved to the main administrator.'));
{const c0=D.create,w0=D.write,u0=D.unlink;
 D.create=function(m,v,o){if(m==='user'&&v&&v.group==='admin'&&ST.pro&&ST.pro.setup&&!isOwner()){v=Object.assign({},v,{group:'user'});deny()}return c0.call(D,m,v,o)};
 D.write=function(m,id,v,o){if(m==='user'&&ST.pro&&ST.pro.setup&&!isOwner()){const t=D.get('user',id);
   if(t&&t.id!==ST.uid&&(t.group==='admin'||t.owner)){deny();return t}
   if(v&&v.group==='admin'&&t&&t.group!=='admin'){deny();v=Object.assign({},v);delete v.group}
   if(t&&t.id===ST.uid&&v&&(('group' in v&&v.group!==t.group)||('active' in v&&v.active===false))){toast(tr('Vous ne pouvez pas modifier votre propre rôle.','You cannot change your own role.'));v=Object.assign({},v);delete v.group;delete v.active}}
   if(m==='user'&&v&&ST.pro&&ST.pro.setup){const t=D.get('user',id);if(t&&t.owner&&(('group' in v&&v.group!=='admin')||v.active===false)){toast(tr('L’administrateur principal ne peut pas être rétrogradé ni désactivé (transférez d’abord la propriété).','The main administrator cannot be demoted or disabled (transfer ownership first).'));v=Object.assign({},v);delete v.group;delete v.active}}
   return w0.call(D,m,id,v,o)};
 D.unlink=function(m,id,o){if(m==='user'&&ST.pro&&ST.pro.setup){const t=D.get('user',id);
   if(t&&(t.owner||t.id===ST.uid)){toast(tr('Ce compte ne peut pas être supprimé.','This account cannot be deleted.'));return}
   if(t&&t.group==='admin'&&!isOwner()){deny();return}}
   return u0.call(D,m,id,o)}}
CUSTOM.admins=function(){
  const ad=D.all('user').filter(u=>u.group==='admin'),own=isOwner();
  const cand=D.all('user').filter(u=>u.group!=='admin'&&u.group!=='portal'&&!u.pending&&u.active!==false);
  const rows=ad.map(u=>'<div class="card" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px">'+avatar(u.name,'',true)+'<div style="flex:1;min-width:160px"><b>'+esc(u.name)+'</b> '+(u.owner?'<span class="badge gold">'+tr('Administrateur principal','Main administrator')+'</span>':'<span class="badge">'+tr('Administrateur','Administrator')+'</span>')+'<div class="muted">'+esc(u.login)+'</div></div>'+(own&&!u.owner?'<button class="btn sm" data-a="ad-owner" data-id="'+u.id+'">'+tr('Transférer la propriété','Transfer ownership')+'</button><select data-adr="'+u.id+'">'+['manager','cashier','studio','kitchen','user'].map(r=>'<option value="'+r+'"'+(r==='user'?' selected':'')+'>'+esc(ROLELBL(r))+'</option>').join('')+'</select><button class="btn sm danger" data-a="ad-demote" data-id="'+u.id+'">'+tr('Retirer les droits admin','Remove admin rights')+'</button>':'')+'</div>').join('');
  const add=own?'<div class="card"><b>'+tr('Nommer un administrateur','Appoint an administrator')+'</b><p class="muted">'+tr('Choisissez un compte existant. Personne ne peut devenir administrateur en créant son propre compte.','Pick an existing account. Nobody can become administrator by creating their own account.')+'</p>'+(cand.length?'<div style="display:flex;gap:8px;flex-wrap:wrap"><select id="ad-pick">'+cand.map(u=>'<option value="'+u.id+'">'+esc(u.name)+' — '+esc(u.login)+'</option>').join('')+'</select><button class="btn pri" data-a="ad-add">'+tr('Nommer administrateur','Make administrator')+'</button></div>':'<p class="muted">'+tr('Aucun compte disponible : créez d’abord un compte employé.','No account available: create an employee account first.')+'</p>')+'</div>':'<p class="muted">'+tr('Seul l’administrateur principal peut nommer ou retirer des administrateurs.','Only the main administrator can appoint or remove administrators.')+'</p>';
  return pageHead(tr('Administrateurs','Administrators'))+'<div class="va gut">'+rows+add+'</div>';
};
A['ad-add']=()=>{if(!isOwner())return deny();const sel=document.getElementById('ad-pick');if(!sel)return;const id=+sel.value;const u=D.get('user',id);openModal('confirm',{msg:tr('Nommer '+u.name+' administrateur ? Cette personne aura accès à tout, y compris aux paramètres et aux finances.','Make '+u.name+' an administrator? They will have access to everything, including settings and finances.'),ok:()=>{D.write('user',id,{group:'admin'},{silent:true});save();toast(tr('Administrateur ajouté.','Administrator added.'))}})};
A['ad-demote']=el=>{if(!isOwner())return deny();const id=+el.dataset.id,u=D.get('user',id),sel=document.querySelector('[data-adr="'+id+'"]');const r=sel?sel.value:'user';openModal('confirm',{msg:tr('Retirer les droits administrateur à '+u.name+' ? Son nouveau rôle : '+ROLELBL(r)+'.','Remove administrator rights from '+u.name+'? New role: '+ROLELBL(r)+'.'),ok:()=>{D.write('user',id,{group:r},{silent:true});save();toast(tr('Droits retirés.','Rights removed.'))}})};
A['ad-owner']=el=>{if(!isOwner())return deny();const id=+el.dataset.id,u=D.get('user',id);openModal('confirm',{msg:tr('Transférer le rôle d’administrateur principal à '+u.name+' ? Vous resterez administrateur mais perdrez le droit de nommer ou retirer des administrateurs.','Transfer main administrator role to '+u.name+'? You will remain an administrator but lose the right to appoint or remove administrators.'),ok:()=>{const me=curUser();me.owner=false;u.owner=true;save();toast(tr('Propriété transférée.','Ownership transferred.'))}})};
{const st=APPS.find(a=>a.id==='config');const g=st&&st.menus.find(m=>m.id==='st_usr');if(g&&!g.ch.some(c=>c.id==='st_adm'))g.ch.splice(1,0,M_('st_adm',['Administrateurs','Administrators'],null,{cus:'admins'}))}

/* ---------- mon profil (tout utilisateur) ---------- */
MODALS.profile={title:()=>tr('Mon profil','My profile'),
  body:()=>{const u=curUser()||{},d=UI.modal.data;const f=(k,l,t)=>'<div class="fld"><label>'+l+'</label><input data-m="'+k+'" type="'+(t||'text')+'" value="'+esc(d[k]!=null?d[k]:'')+'"></div>';
    return '<p><b>'+esc(u.name||'')+'</b> · '+esc(u.login||'')+' <span class="badge">'+esc(ROLELBL(u.group))+'</span></p>'+f('name',tr('Nom','Name'))+'<hr><b>'+tr('Changer mon mot de passe','Change my password')+'</b>'+f('old',tr('Mot de passe actuel','Current password'),'password')+f('new',tr('Nouveau mot de passe (6 min.)','New password (min. 6)'),'password')+(d.err?'<div class="lerr">'+esc(d.err)+'</div>':'')},
  foot:()=>'<button class="btn pri" data-a="prof-ok">'+tr('Enregistrer','Save')+'</button><button class="btn" data-a="mclose">'+tr('Annuler','Cancel')+'</button>'};
A['prof-open']=()=>{const u=curUser();if(!u)return;openModal('profile');UI.modal.data={name:u.name}};
A['prof-ok']=()=>{const d=UI.modal.data,u=curUser();if(!u)return;const v={};
  if(d.name&&d.name.trim()&&d.name!==u.name)v.name=d.name.trim();
  if(d.new){if(u.code!==hsh(d.old||'')&&u.code!==d.old){d.err=tr('Mot de passe actuel incorrect.','Current password is wrong.');return render()}if(d.new.length<6){d.err=tr('6 caractères minimum.','6 characters minimum.');return render()}v.code=hsh(d.new)}
  if(Object.keys(v).length)D.write('user',u.id,v,{silent:true});if(v.name&&u.emp)D.write('employee',u.emp,{name:v.name},{silent:true});
  UI.modal=null;save();toast(tr('Profil mis à jour.','Profile updated.'));render()};
{const p1=popoverHtml;popoverHtml=function(){let h=p1();if(UI.pop!=='user')return h;return h.replace('<button data-a="lock">','<button data-a="prof-open">'+ic('user')+tr('Mon profil et mot de passe','My profile & password')+'</button><button data-a="lock">')}}
})();
