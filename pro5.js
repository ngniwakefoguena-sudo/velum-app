/* ===== VELUME PRO 2 — admin principal, profil, œil mot de passe, comptes Google/Outlook/Facebook, décor animé ===== */
(function(){
const bean="url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 56'%3E%3Cellipse cx='20' cy='28' rx='16' ry='24' fill='%23b8863b'/%3E%3Cpath d='M20 5C12 18 28 38 20 51' fill='none' stroke='%23fffdf7' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E\")";
const css=document.createElement('style');css.textContent=`
@keyframes vFloat{0%{transform:translate(0,0) scale(1)}100%{transform:translate(6vmax,5vmax) scale(1.18)}}
@keyframes vBean{0%{transform:translateY(105vh) rotate(0)}100%{transform:translateY(-15vh) rotate(360deg)}}
@keyframes vShine{0%{background-position:-120% 0}100%{background-position:220% 0}}
@keyframes vBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.login{position:relative;overflow:hidden;background:linear-gradient(135deg,color-mix(in srgb,var(--gold) 14%,var(--bg)),var(--bg) 45%,color-mix(in srgb,var(--teal) 12%,var(--bg)))}
.login::before,.login::after,.home::before,.home::after{content:'';position:fixed;width:46vmax;height:46vmax;border-radius:50%;filter:blur(80px);opacity:.42;z-index:0;pointer-events:none;animation:vFloat 18s ease-in-out infinite alternate}
.login::before,.home::before{background:color-mix(in srgb,var(--gold) 60%,transparent);left:-14vmax;top:-16vmax}
.login::after,.home::after{background:color-mix(in srgb,var(--teal) 45%,transparent);right:-16vmax;bottom:-18vmax;animation-duration:25s;animation-direction:alternate-reverse}
.home{position:relative}.home .wrap{position:relative;z-index:1}
.login .lcard{position:relative;z-index:2;backdrop-filter:blur(8px);background:color-mix(in srgb,var(--surface) 88%,transparent)}
.bgfx{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}
.bgfx i{position:absolute;bottom:0;width:26px;height:36px;background:${bean} center/contain no-repeat;opacity:.28;animation:vBean linear infinite}
.bgfx i:nth-child(1){left:6%;animation-duration:22s}.bgfx i:nth-child(2){left:19%;animation-duration:29s;animation-delay:-9s;width:18px;height:25px}
.bgfx i:nth-child(3){left:33%;animation-duration:25s;animation-delay:-16s}.bgfx i:nth-child(4){left:52%;animation-duration:32s;animation-delay:-4s;width:20px;height:28px}
.bgfx i:nth-child(5){left:68%;animation-duration:24s;animation-delay:-12s}.bgfx i:nth-child(6){left:81%;animation-duration:30s;animation-delay:-20s;width:30px;height:42px}
.bgfx i:nth-child(7){left:93%;animation-duration:27s;animation-delay:-7s;width:16px;height:22px}
.lcard .brand-mark{animation:vBob 3.2s ease-in-out infinite}
.apptile{transition:transform .25s cubic-bezier(.2,.9,.3,1.3),box-shadow .25s}
.apptile:hover{transform:translateY(-6px) scale(1.04);box-shadow:0 14px 28px color-mix(in srgb,var(--k,var(--gold)) 28%,transparent)}
.apptile:hover .ai{animation:vBob .7s ease-in-out infinite}
.apptile:active{transform:scale(.96)}
.btn{transition:transform .15s,box-shadow .2s,background .2s}.btn:active{transform:scale(.96)}
.btn.pri{background-image:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.28) 50%,transparent 70%);background-size:220% 100%;background-position:-120% 0}
.btn.pri:hover{animation:vShine .9s;box-shadow:0 6px 16px color-mix(in srgb,var(--gold) 38%,transparent)}
.nav{animation:vFade .5s both}
.lf{position:relative}.lf input[type=password],.lf input[data-eyed]{padding-right:44px}
.eye{position:absolute;right:6px;bottom:4px;width:34px;height:34px;border:0;background:transparent;border-radius:8px;display:grid;place-items:center;color:var(--ink-2);cursor:pointer}
.eye:hover{background:var(--surface-2);color:var(--ink)}.eye svg{width:18px;height:18px}
.prov{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.prov button{display:flex;align-items:center;gap:8px;justify-content:center;border:1px solid var(--line-2);background:var(--surface);border-radius:10px;padding:10px;font-weight:600;transition:transform .15s,border-color .15s}
.prov button:hover{transform:translateY(-2px);border-color:var(--gold)}.prov button[aria-pressed=true]{border-color:var(--gold);background:var(--gold-soft)}
.prov b{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;color:#fff;font-size:.78rem}
.adm{display:grid;gap:8px;margin-top:8px}.adm .r{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
`;document.head.appendChild(css);

const eyeSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const eyeOff='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.9 17.9A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A10.7 10.7 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22"/></svg>';
function addEyes(){document.querySelectorAll('.lf input[type=password]:not([data-eyed])').forEach(i=>{i.dataset.eyed='1';const b=document.createElement('button');b.type='button';b.className='eye';b.setAttribute('aria-label',tr('Afficher / masquer le mot de passe','Show / hide password'));b.innerHTML=eyeSvg;b.onclick=ev=>{ev.preventDefault();const show=i.type==='password';i.type=show?'text':'password';b.innerHTML=show?eyeOff:eyeSvg;i.focus()};i.after(b)})}
{const r0=render;render=function(){const x=r0.apply(this,arguments);try{addEyes()}catch(e){}return x}}
/* inputs mot de passe devenus type=text ne doivent pas être re-sélectionnés : on garde data-eyed, le bouton suit */

/* décor animé sur connexion */
{const l1=loginHtml;loginHtml=function(){return l1().replace('<div class="login">','<div class="login"><div class="bgfx" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>')}}

/* ---------- admin principal ---------- */
M.user.f.owner={k:'owner',t:'bool',fr:'Administrateur principal',en:'Main administrator'};
M.user.f.provider={k:'provider',t:'char',fr:'Compte lié',en:'Linked account'};
const me=()=>D.all('user').find(u=>u.id===ST.uid);
const isOwner=()=>{const u=me();return !!(u&&u.owner)};
const admins=()=>D.all('user').filter(u=>u.group==='admin'&&u.active!==false&&!u.pending);
{const w0=D.write;D.write=function(m,id,vals,opt){
  if(m==='user'&&vals&&ST.pro&&ST.pro.setup){const u=D.get('user',id);
    if(u&&u.owner&&((vals.group&&vals.group!=='admin')||vals.active===false||vals.owner===false||vals.pending===true)){toast(tr('L’administrateur principal ne peut pas être rétrogradé ou désactivé.','The main administrator cannot be demoted or disabled.'));return u}
    if(vals.owner&&!(u&&u.owner)){toast(tr('Propriété non modifiable ici.','Ownership cannot be changed here.'));delete vals.owner}
    if(u&&vals.group==='admin'&&u.group!=='admin'&&!isOwner()){toast(tr('Seul l’administrateur principal peut nommer un administrateur.','Only the main administrator can appoint an administrator.'));vals.group=u.group}
    if(u&&u.group==='admin'&&vals.group&&vals.group!=='admin'&&!isOwner()){toast(tr('Seul l’administrateur principal peut retirer un administrateur.','Only the main administrator can remove an administrator.'));vals.group='admin'}
  }
  return w0.call(this,m,id,vals,opt)}}
{const c0=D.create;D.create=function(m,vals,opt){if(m==='user'&&vals&&ST.pro&&ST.pro.setup&&vals.group==='admin'&&!isOwner()){vals.group='user';toast(tr('Seul l’administrateur principal peut créer un administrateur : compte créé en utilisateur interne.','Only the main administrator can create an administrator: account created as internal user.'))}
  return c0.call(this,m,vals,opt)}}
{const u0=D.unlink;D.unlink=function(m,id){if(m==='user'&&ST.pro&&ST.pro.setup){const u=D.get('user',id);
  if(u&&u.owner){toast(tr('L’administrateur principal ne peut pas être supprimé.','The main administrator cannot be deleted.'));return}
  if(u&&u.group==='admin'&&!isOwner()){toast(tr('Seul l’administrateur principal peut supprimer un administrateur.','Only the main administrator can delete an administrator.'));return}
  if(u&&u.id===ST.uid){toast(tr('Vous ne pouvez pas supprimer votre propre compte connecté.','You cannot delete your own signed-in account.'));return}}
  return u0.call(this,m,id)}}
window.__adminsHtml=()=>{
  const ow=isOwner(),ad=admins(),cand=D.all('user').filter(u=>u.group!=='admin'&&u.group!=='portal'&&u.active!==false&&!u.pending);
  return '<div class="st3o"><b>'+tr('Administrateurs','Administrators')+'</b><span class="st3d">'+tr('L’administrateur principal (le premier compte) peut nommer et retirer d’autres administrateurs. Les autres administrateurs ne peuvent ni en créer ni en supprimer.','The main administrator (the first account) can appoint and remove other administrators. Other administrators cannot create or delete any.')+'</span><div class="adm">'+
   ad.map(u=>'<div class="r"><span style="flex:1;min-width:140px"><b>'+esc(u.name)+'</b> <span class="muted">'+esc(u.login)+'</span></span>'+(u.owner?'<span class="badge gold">'+tr('Principal','Main')+'</span>':'<span class="badge">'+tr('Administrateur','Administrator')+'</span>'+(ow?'<button class="btn sm" data-a="adm-rm" data-id="'+u.id+'">'+tr('Retirer les droits','Remove rights')+'</button>':''))+'</div>').join('')+
   (ow?'<div class="r"><select id="admsel" class="st3i" style="flex:1;min-width:160px"><option value="">'+tr('Choisir un employé…','Choose an employee…')+'</option>'+cand.map(u=>'<option value="'+u.id+'">'+esc(u.name)+' — '+esc(u.login)+'</option>').join('')+'</select><button class="btn pri sm" data-a="adm-add">'+tr('Nommer administrateur','Appoint administrator')+'</button></div>':'<p class="muted">'+tr('Lecture seule : réservé à l’administrateur principal.','Read only: reserved to the main administrator.')+'</p>')+'</div></div>'};
A['adm-add']=()=>{const v=+((document.getElementById('admsel')||{}).value||0);if(!v)return toast(tr('Choisissez un employé.','Choose an employee.'));D.write('user',v,{group:'admin'});save();toast(tr('Administrateur nommé.','Administrator appointed.'));render()};
A['adm-rm']=el=>openModal('confirm',{msg:tr('Retirer les droits d’administrateur à cette personne ? Elle redevient utilisateur interne.','Remove administrator rights from this person? They become an internal user.'),ok:()=>{D.write('user',+el.dataset.id,{group:'user'});save();toast(tr('Droits retirés.','Rights removed.'));render()}});

/* ---------- mon profil ---------- */
const PF=()=>UI.pf||(UI.pf={name:'',cur:'',n1:'',n2:'',err:''});
MODALS.profile={title:()=>tr('Mon profil','My profile'),
  body:()=>{const u=me(),w=PF();const f=(k,l,t)=>'<div class="lf"><label>'+l+'</label><input data-pf="'+k+'" type="'+(t||'text')+'" value="'+esc(w[k])+'" autocomplete="off"></div>';
    return '<p class="muted">'+esc(u?u.login:'')+' · '+esc(u?(u.group==='admin'?(u.owner?tr('Administrateur principal','Main administrator'):tr('Administrateur','Administrator')):tr('Compte employé','Employee account')):'')+(u&&u.provider?' · '+esc(u.provider):'')+'</p>'+f('name',tr('Nom affiché','Display name'))+'<hr><b>'+tr('Changer mon mot de passe','Change my password')+'</b>'+f('cur',tr('Mot de passe actuel','Current password'),'password')+f('n1',tr('Nouveau mot de passe (6 min.)','New password (min. 6)'),'password')+f('n2',tr('Confirmer','Confirm'),'password')+(w.err?'<div class="lerr" role="alert">'+esc(w.err)+'</div>':'')},
  foot:()=>'<button class="btn pri" data-a="pf-ok">'+tr('Enregistrer','Save')+'</button><button class="btn" data-a="mclose">'+tr('Annuler','Cancel')+'</button>'};
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&el.dataset.pf&&UI.pf)UI.pf[el.dataset.pf]=el.value});
A.profile=()=>{const u=me();UI.pf={name:u?u.name:'',cur:'',n1:'',n2:'',err:''};openModal('profile')};
A['pf-ok']=()=>{const u=me(),w=PF();if(!u)return;w.err='';
  if(w.n1||w.cur||w.n2){const h=window.__hsh||(s=>s);if(!(u.code===window.__hsh(w.cur)||u.code===w.cur))w.err=tr('Mot de passe actuel incorrect.','Current password is wrong.');else if(w.n1.length<6)w.err=tr('Nouveau mot de passe : 6 caractères minimum.','New password: 6 characters minimum.');else if(w.n1!==w.n2)w.err=tr('Les mots de passe ne correspondent pas.','Passwords do not match.')}
  if(!w.name.trim())w.err=w.err||tr('Le nom est requis.','Name is required.');
  if(w.err)return render();
  const v={name:w.name.trim()};if(w.n1)v.code=window.__hsh(w.n1);D.write('user',u.id,v,{silent:true});if(u.emp)D.write('employee',u.emp,{name:v.name},{silent:true});
  UI.modal=null;UI.pf=null;save();toast(tr('Profil mis à jour.','Profile updated.'));render()};
{const p0=popoverHtml;popoverHtml=function(){let h=p0();if(UI.pop!=='user')return h;return h.replace('<button data-a="lock">','<button data-a="profile">'+ic('user')+tr('Mon profil et mot de passe','My profile & password')+'</button><button data-a="lock">')}}

/* ---------- inscription avec compte Google / Outlook / Facebook ---------- */
const PROV={google:['Google','#ea4335',/@(gmail|googlemail)\.com$/i],outlook:['Outlook','#0078d4',/@(outlook|hotmail|live|msn)\.[a-z.]+$/i],facebook:['Facebook','#1877f2',/^[^@\s]+@[^@\s]+\.[^@\s]+$/],own:[null,'var(--gold)',null]};
{const m0=MODALS.signup;MODALS.signup=Object.assign({},m0,{body:()=>{const w=UI.su||(UI.su={name:'',id:'',code:'',code2:'',err:''});const pv=w.prov||'own';
  const b=['google','own'].map(k=>'<button type="button" data-a="su-prov" data-p="'+k+'" aria-pressed="'+(pv===k)+'"><b style="background:'+PROV[k][1]+'">'+(k==='own'?'@':PROV[k][0][0])+'</b>'+(k==='own'?tr('Identifiant','Username'):PROV[k][0])+'</button>').join('');
  let inner=m0.body();
  inner=inner.replace(/<div class="lf"><label>[^<]*<\/label><input data-su="id"/,'<div class="lf"><label>'+(pv==='own'?tr('Identifiant au choix (sans espace)','Username of your choice (no spaces)'):tr('Votre adresse '+PROV[pv][0],'Your '+PROV[pv][0]+' address'))+'</label><input data-su="id" placeholder="'+(pv==='google'?'nom@gmail.com':pv==='outlook'?'nom@outlook.com':pv==='facebook'?'nom@exemple.com':'')+'"');
  return '<div class="prov" style="margin-bottom:12px">'+b+'</div>'+(pv==='own'?'':'<p class="muted" style="font-size:.84rem">'+tr('Votre adresse '+PROV[pv][0]+' sert d’identifiant. Cette version ne contacte pas '+PROV[pv][0]+' : l’adresse n’est pas vérifiée et vous choisissez un mot de passe VELUME. La connexion en un clic nécessite le serveur.','Your '+PROV[pv][0]+' address is used as login. This version does not contact '+PROV[pv][0]+': the address is not verified and you choose a VELUME password. One-click sign-in needs the server.')+'</p>')+inner}})}
A['su-prov']=el=>{UI.su=UI.su||{name:'',id:'',code:'',code2:'',err:''};UI.su.prov=el.dataset.p;UI.su.err='';render()};
{const ok=A['su-ok'];A['su-ok']=()=>{const w=UI.su;if(w&&w.prov&&w.prov!=='own'){const id=(w.id||'').trim();if(!PROV[w.prov][2].test(id)){w.err=tr('Adresse '+PROV[w.prov][0]+' invalide.',PROV[w.prov][0]+' address is invalid.');return render()}}
  const n0=D.all('user').length;ok();if(w&&w.prov&&w.prov!=='own'&&D.all('user').length>n0){const u=D.all('user')[D.all('user').length-1];D.write('user',u.id,{provider:PROV[w.prov][0]},{silent:true});save()}}}
})();
