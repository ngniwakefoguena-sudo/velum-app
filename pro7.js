/* ===== VELUME PRO 4 — boutons Google/Outlook/Facebook, rester connecté, identifiant mémorisé ===== */
(function(){
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return null}};
const SS=(k,v)=>{try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}};
const rememberOk=()=>ST.set.remember_ok!==false;
const SOC=[['google','Google','#ea4335']];
const css=document.createElement('style');css.textContent=`
.soc{display:grid;gap:8px}.soc button{display:flex;gap:10px;align-items:center;justify-content:center;border:1px solid var(--line-2);background:var(--surface);border-radius:10px;padding:10px;font-weight:600;transition:transform .15s,border-color .15s}
.soc button:hover{transform:translateY(-2px);border-color:var(--gold)}.soc b{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;color:#fff;font-size:.8rem}
.keep{display:flex;gap:8px;align-items:center;font-size:.88rem;color:var(--ink-2)}.lcard .keep input{width:auto;flex:none}
`;document.head.appendChild(css);

/* session : si « rester connecté » est décoché, la session s'arrête à la fermeture de l'onglet */
const b0=window.__pro4Boot;window.__pro4Boot=function(){b0&&b0();if(ST.auth&&LS('velume.keep')==='0'&&!SS('velume.sess'))ST.auth=false};

{const l1=loginHtml;loginHtml=function(){let h=l1();if(!(ST.pro&&ST.pro.setup))return h;
  const mode=ST.set.signup||'approval';
  /* identifiant mémorisé */
  const last=rememberOk()?LS('velume.last'):null;
  if(last&&UI.lglogin===undefined)UI.lglogin=last;
  if(UI.lglogin&&!/id="lg"[^>]*value="[^"]+"/.test(h))h=h.replace(/id="lg" type="text" value=""/,'id="lg" type="text" value="'+esc(UI.lglogin)+'"');
  /* formulaire (le navigateur peut proposer d'enregistrer l'identifiant) */
  h=h.replace('<h2 style="margin:0;font-family','<form id="lgform" style="display:contents" autocomplete="on"><h2 style="margin:0;font-family');
  h=h.replace('<button class="btn pri" data-a="login">','<button class="btn pri" type="submit">');
  h=h.replace(/(<button class="btn pri" type="submit">[^<]*<\/button>)/,(m)=>(rememberOk()?'<label class="keep"><input type="checkbox" id="lkeep"'+(LS('velume.keep')!=='0'?' checked':'')+'> '+tr('Rester connecté et mémoriser mon identifiant sur cet appareil','Stay signed in and remember my username on this device')+'</label>':'')+m+'</form>');
  /* boutons de connexion rapide */
  if(mode!=='off'||(ST.set.invites||[]).some(i=>!i.used)){
    const soc='<div class="or">'+tr('ou continuer avec','or continue with')+'</div><div class="soc">'+SOC.map(s=>'<button type="button" data-a="soc" data-p="'+s[0]+'"><b style="background:'+s[2]+'">'+s[1][0]+'</b>'+tr('Continuer avec '+s[1],'Continue with '+s[1])+'</button>').join('')+'</div>';
    h=h.replace(/(<\/form>)/,'$1'+soc)}
  return h}}
document.addEventListener('submit',e=>{if(e.target&&e.target.id==='lgform'){e.preventDefault();A.login()}});
{const a0=A.login;A.login=function(){if(ST.auth)return;const lg=((document.getElementById('lg')||{}).value||'').trim();const keepEl=document.getElementById('lkeep');
  a0.apply(this,arguments);
  if(ST.auth){const keep=keepEl?keepEl.checked:false;LS('velume.keep',keep?'1':'0');SS('velume.sess','1');if(keep&&rememberOk())LS('velume.last',lg);else LS('velume.last',null)}}}
{const lo=A.logout;A.logout=function(){UI.lglogin=undefined;return lo.apply(this,arguments)}}
A.soc=el=>{UI.su={name:'',id:'',code:'',code2:'',err:'',prov:el.dataset.p};openModal('signup')};

/* note honnête dans la fenêtre d'inscription */
{const ms=MODALS.signup;MODALS.signup=Object.assign({},ms,{body:()=>{let h=ms.body();const pv=(UI.su||{}).prov;if(!pv||pv==='own')return h;const n=({google:'Google',outlook:'Outlook',facebook:'Facebook'})[pv];
  return h.replace(/<p class="muted" style="font-size:\.84rem">[\s\S]*?<\/p>/,'<p class="muted" style="font-size:.84rem">'+tr('Version actuelle : saisissez votre adresse '+n+' et choisissez un mot de passe. Avec la version serveur, un seul clic vous enverra sur '+n+' pour choisir votre compte, sans rien remplir.','Current version: enter your '+n+' address and choose a password. With the server version, a single click sends you to '+n+' to pick your account, with nothing to fill in.')+'</p>')}})}

/* autofill : attributs pour les gestionnaires de mots de passe */
{const r0=render;render=function(){const x=r0.apply(this,arguments);try{document.querySelectorAll('[data-su=id],[data-wz=email]').forEach(i=>i.setAttribute('autocomplete','username'));document.querySelectorAll('[data-su=code],[data-su=code2],[data-wz=code],[data-wz=code2],[data-pf=n1],[data-pf=n2],[data-fg=n1]').forEach(i=>i.setAttribute('autocomplete','new-password'));document.querySelectorAll('[data-pf=cur]').forEach(i=>i.setAttribute('autocomplete','current-password'))}catch(e){}return x}}

{const c=document.createElement('style');c.textContent=`
.appcat,.appcat>*{min-width:0}
@media(max-width:820px){.appcat{grid-template-columns:minmax(0,1fr)!important}}
@media(max-width:820px){.ap2side,.appcat .cats{display:flex;overflow-x:auto;max-width:100%;gap:4px;-webkit-overflow-scrolling:touch}.ap2side button{flex:none;white-space:nowrap}}
@media(pointer:coarse),(max-width:820px){
 button,.btn,select,input:not([type=checkbox]):not([type=radio]),.ib{min-height:40px}
 .ib{min-width:40px}
 .btn.sm,.btn.pri.sm,.btn.sm.pri,.btn.sm.ghost,button.sm{min-height:40px!important;padding-inline:14px}
 a[data-a],.sglk,.st3lk a{display:inline-flex;align-items:center;min-height:36px;padding-block:6px}
 input[type=checkbox],input[type=radio]{width:20px;height:20px}
 .mi button,.menus button{min-height:44px}
 tr td,tr th{padding-block:10px}
}
`;document.head.appendChild(c)}

/* ---------- numéro de version visible (pour vérifier que la bonne version est chargée) ---------- */
const BUILD='2026-10-24 · v41';window.__BUILD=BUILD;
{const st=document.createElement('style');st.textContent='#vbuild{position:fixed;left:50%;bottom:2px;transform:translateX(-50%);font-size:.66rem;opacity:.55;pointer-events:none;z-index:5;color:var(--ink-2,#666)}@media print{#vbuild{display:none}}';document.head.appendChild(st);
 const r0=render;render=function(){const x=r0.apply(this,arguments);try{let e=document.getElementById('vbuild');if(!e){e=document.createElement('div');e.id='vbuild';document.body.appendChild(e)}e.textContent='VELUME '+BUILD}catch(err){}return x}}
})();

/* ---------- v40 : anciennes catégories de recettes → nouvelles ---------- */
{const MAPC={hot:'classic',cold:'iced',food:'froid'};
function migRecipes(){try{D.all('recipe').forEach(r=>{if(MAPC[r.cat])D.write('recipe',r.id,{cat:MAPC[r.cat]},{silent:true})})}catch(e){}}
const pb=window.__pro4Boot;window.__pro4Boot=function(){try{migRecipes()}catch(e){}return pb&&pb.apply(this,arguments)};
setTimeout(()=>{try{migRecipes()}catch(e){}},2500)}

/* ---------- v41 : familles de matières premières + recettes → caisse ---------- */
{const f=M.stockitem&&M.stockitem.f&&M.stockitem.f.cat;
if(f)f.opts=[['coffee','Café & thé','Coffee & tea',''],['perish','Denrées périssables','Perishable goods','bad'],['dairy','Boissons','Drinks','info'],['bakery','Pâtisseries et viennoiseries','Pastries & viennoiserie','warn'],['pack','Consommables Coffee','Coffee supplies',''],['studio','Consommables studio','Studio supplies','gold']]}
{const RC=[['grill','Grillades','Grills'],['pancake','Pancakes et gaufres','Pancakes & waffles'],['pain','Pains et conforts','Breads & comfort food'],['froid','Plats froids','Cold dishes'],['vienn','Viennoiserie','Pastries'],['classic','Café classique','Classic coffee'],['signature','Café signature','Signature coffee'],['iced','Café glacé','Iced coffee'],['fresh','Boissons fresh','Fresh drinks'],['mocktail','Mocktails','Mocktails'],['dessert','Desserts','Desserts']];
if(M.product&&!M.product.f.rec)M.product.f.rec={k:'rec',t:'int',fr:'Recette liée',en:'Linked recipe',hide:1};
function pcatFor(key){const c=RC.find(x=>x[0]===key)||RC[5];const i=RC.indexOf(c);
  let p=D.all('pcat').find(x=>x.rkey===c[0]||x.name===c[1]);
  if(!p)p=D.create('pcat',{name:T(c[1],c[2]),seq:10+i*5,rkey:c[0]},{silent:true});
  else if(!p.rkey)D.write('pcat',p.id,{rkey:c[0]},{silent:true});
  return p.id}
window.__recipesToPos=function(){try{
  const rs=D.all('recipe'),ps=D.all('product');const seen={};
  ps.filter(p=>p.rec).sort((a,b)=>a.id-b.id).forEach(p=>{if(seen[p.rec]){D.unlink('product',p.id)}else seen[p.rec]=p});
  rs.forEach(r=>{const on=r.active!==false&&!!r.name;const p=seen[r.id];
    if(!on){if(p&&p.active!==false)D.write('product',p.id,{active:false,pos:false},{silent:true});return}
    const v={name:r.name,price:+r.price||0,cat:pcatFor(r.cat),reg:'bar',kind:'consu',pos:true,active:true,rec:r.id};
    if(!p)D.create('product',v,{silent:true});
    else if(p.name!==v.name||p.price!==v.price||p.cat!==v.cat||p.active===false||p.pos===false)D.write('product',p.id,v,{silent:true})});
  D.all('product').filter(p=>p.rec&&!seen[p.rec]&&!D.get('recipe',p.rec)).forEach(p=>{});
  saveNow()}catch(e){try{console.error(e)}catch(x){}}};
{const ot=openTill;openTill=function(id){try{window.__recipesToPos()}catch(e){}return ot.apply(this,arguments)}}
{const fs=A.fsave;A.fsave=function(){const isR=FV&&FV.a&&FV.a.model==='recipe';const r=fs.apply(this,arguments);if(isR)try{window.__recipesToPos()}catch(e){}return r}}
}
