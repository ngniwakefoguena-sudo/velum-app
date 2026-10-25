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
const BUILD='2026-10-25 · v49';window.__BUILD=BUILD;
{const st=document.createElement('style');st.textContent='#vbuild{position:fixed;left:50%;bottom:2px;transform:translateX(-50%);font-size:.66rem;opacity:.55;pointer-events:none;z-index:5;color:var(--ink-2,#666)}@media print{#vbuild{display:none}}';document.head.appendChild(st);
 const r0=render;render=function(){const x=r0.apply(this,arguments);try{let e=document.getElementById('vbuild');if(!e){e=document.createElement('div');e.id='vbuild';document.body.appendChild(e)}e.textContent='VELUME '+BUILD}catch(err){}return x}}
})();

/* ---------- v40 : anciennes catégories de recettes → nouvelles ---------- */
{const MAPC={hot:'classic',cold:'signature',food:'froid',iced:'signature',fresh:'presse',dessert:'gateau'};
function migRecipes(){try{D.all('recipe').forEach(r=>{if(MAPC[r.cat])D.write('recipe',r.id,{cat:MAPC[r.cat]},{silent:true})})}catch(e){}}
const pb=window.__pro4Boot;window.__pro4Boot=function(){try{migRecipes()}catch(e){}return pb&&pb.apply(this,arguments)};
setTimeout(()=>{try{migRecipes()}catch(e){}},2500)}

/* ---------- v41 : familles de matières premières + recettes → caisse ---------- */
{const f=M.stockitem&&M.stockitem.f&&M.stockitem.f.cat;
if(f)f.opts=[['coffee','Café & thé','Coffee & tea',''],['perish','Denrées périssables','Perishable goods','bad'],['dairy','Boissons','Drinks','info'],['bakery','Pâtisseries et viennoiseries','Pastries & viennoiserie','warn'],['pack','Consommables Coffee','Coffee supplies',''],['studio','Consommables studio','Studio supplies','gold']]}
{const RC=[['mocktail','Mocktails','Mocktails'],['cocktail','Cocktails','Cocktails'],['biere','Bières','Beers'],['presse','Boissons pressées et infusées','Pressed juices & infusions'],['soft','Soft drinks','Soft drinks'],['gateau','Gâteaux & pâtisseries','Cakes & pastries'],['vienn','Viennoiseries','Viennoiserie'],['grill','Grillades','Grills'],['pain','Pains & conforts','Breads & comfort food'],['pancake','Gaufres & pancakes','Waffles & pancakes'],['froid','Plats froids','Cold dishes'],['classic','Cafés classiques','Classic coffees'],['signature','Cafés signatures','Signature coffees']];
if(M.product&&!M.product.f.rec)M.product.f.rec={k:'rec',t:'int',fr:'Recette liée',en:'Linked recipe',hide:1};
function pcatFor(key){const c=RC.find(x=>x[0]===key)||RC[5];const i=RC.indexOf(c);
  let p=D.all('pcat').find(x=>x.rkey===c[0]||x.name===c[1]);
  if(!p)p=D.create('pcat',{name:T(c[1],c[2]),seq:10+i*5,rkey:c[0]},{silent:true});
  else if(!p.rkey||p.name!==c[1])D.write('pcat',p.id,{rkey:c[0],name:T(c[1],c[2]),seq:10+i*5},{silent:true});
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

/* ---------- v42 : nom de la société + facture : partenaire libre, référence obligatoire ---------- */
{function fixCompany(){try{const c=(ST.set&&ST.set.company)||'';const n=String(c).toLowerCase().normalize('NFD').replace(/[^a-z]/g,'');
  if(/^velum+e?c+o+f+e+e?$/.test(n)&&c!=='Vélume Coffee'){ST.set.company='Vélume Coffee';save();try{render()}catch(e){}}}catch(e){}}
const pb=window.__pro4Boot;window.__pro4Boot=function(){try{fixCompany()}catch(e){}return pb&&pb.apply(this,arguments)};
setTimeout(fixCompany,2500);setInterval(fixCompany,20000)}
{const F=M.invoice.f;F.pname={k:'pname',t:'char',fr:'… ou écrire le nom du partenaire',en:'… or type the partner name',help:['Saisie libre : si le nom n’existe pas, le partenaire est créé automatiquement.','Free entry: if the name does not exist, the partner is created automatically.']};
F.partner.req=false;F.partner.fr='Partenaire (choisir)';F.partner.en='Partner (choose)';F.ref.req=true;
INVF.cols=[['partner','pname','kind','journal'],['date','due','ref']];
{const sf=saveForm;saveForm=function(opt){
  if(FV&&FV.a&&FV.a.model==='invoice'&&(FV.dirty||FV.isNew)){const b=FV.buf;const nm=String(b.pname||'').trim();
    if(nm){const ex=D.all('partner').find(p=>String(p.name||'').trim().toLowerCase()===nm.toLowerCase());
      const p=ex||D.create('partner',{name:nm,kind:/^in_/.test(b.kind||'')?'supplier':'part'});b.partner=p.id}
    delete b.pname;
    if(!b.partner){FV.errs={partner:1,pname:1};toast(tr('Choisissez ou écrivez le partenaire.','Choose or type the partner.'));render();return false}}
  return sf.apply(this,arguments)}}}

/* ---------- v44 : impression sur tout type de système (relais, tiroir-caisse, ticket client) ---------- */
{const f=M.posprinter.f;
f.kind.opts=[['browser','Navigateur / imprimante système (fenêtre d’impression)','Browser / system printer (print dialog)'],['sys','Imprimante installée sur l’ordinateur — via le relais','Printer installed on the computer — via relay'],['lan','Réseau (adresse IP) — via le relais','Network (IP address) — via relay'],['usb','USB / série direct (Chrome ou Edge)','USB / serial direct (Chrome or Edge)'],['bt','Bluetooth (utilisez plutôt « imprimante installée »)','Bluetooth (use “installed printer” instead)']];
f.sysname={k:'sysname',t:'char',fr:'Nom de l’imprimante (exactement comme dans l’ordinateur)',en:'Printer name (exactly as on the computer)',hideIf:b=>b.kind!=='sys'};
f.relay={k:'relay',t:'char',fr:'Adresse du relais',en:'Relay address',def:'http://127.0.0.1:9101',hideIf:b=>b.kind!=='sys'&&b.kind!=='lan'};
f.token={k:'token',t:'char',fr:'Jeton du relais (facultatif)',en:'Relay token (optional)',hideIf:b=>b.kind!=='sys'&&b.kind!=='lan'};
f.drawer={k:'drawer',t:'bool',fr:'Ouvre le tiroir-caisse (paiement espèces)',en:'Opens the cash drawer (cash payments)'};
f.receipt={k:'receipt',t:'bool',fr:'Imprime le ticket client à chaque encaissement',en:'Prints the customer receipt on every sale'};
if(f.ip)f.ip.hideIf=b=>b.kind!=='lan';if(f.port)f.port.hideIf=b=>b.kind!=='lan';
const a=ACT.posprinters;if(a){a.form.cols=[['kind','sysname','ip','port','relay','token'],['paper','copies','cut','auto','receipt','drawer']];
 a.list=['name','kind','paper','auto','receipt','drawer'];
 a.form.btns.push({l:['Tester le relais','Test the relay'],icon:'link',when:b=>!!b.id&&(b.kind==='lan'||b.kind==='sys'),fn:async b=>{const pr=D.get('posprinter',b.id);
   try{const j=await relayCall(pr,'/ping');toast(tr('Relais OK','Relay OK')+(j.printers&&j.printers.length?' · '+j.printers.slice(0,4).join(', '):''))}catch(e){toast(tr('Relais injoignable : lancez « velume-relay » sur l’ordinateur de la caisse.','Relay unreachable: start “velume-relay” on the register computer.'))}}},
  {l:['Tester le tiroir-caisse','Test cash drawer'],icon:'drawer',when:b=>!!b.id,fn:async b=>{const pr=D.get('posprinter',b.id);const r=await kickDrawer(pr);toast(r?tr('Impulsion envoyée au tiroir.','Pulse sent to the drawer.'):tr('Tiroir non joignable depuis cette imprimante.','Drawer not reachable from this printer.'))}})}
const b64=u=>{let s='';u.forEach(c=>s+=String.fromCharCode(c));return btoa(s)};
async function relayCall(pr,path,body){const url=String(pr.relay||'http://127.0.0.1:9101').replace(/\/$/,'')+path;
  const r=await fetch(url,{method:body?'POST':'GET',headers:Object.assign({'Content-Type':'application/json'},pr.token?{'X-Velume-Token':pr.token}:{}),body:body?JSON.stringify(body):undefined});
  const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw new Error(j.error||('HTTP '+r.status));return j}
async function relaySend(pr,bytes){const body=pr.kind==='lan'?{mode:'lan',host:pr.ip,port:pr.port||9100,data:b64(bytes)}:{mode:'sys',printer:pr.sysname,data:b64(bytes)};await relayCall(pr,'/print',body)}
async function sendBytes(pr,bytes){
  if(pr.kind==='lan'||pr.kind==='sys'){await relaySend(pr,bytes);return true}
  if(pr.kind==='usb'&&PRN[pr.id]){await PRN[pr.id].writer.write(bytes);return true}
  return false}
async function kickDrawer(pr){try{return await sendBytes(pr,new Uint8Array([0x1B,0x70,0x00,0x19,0xFA]))}catch(e){return false}}
{const st=sendTicket;sendTicket=async function(o,d,pr,inter){
  if(pr&&(pr.kind==='lan'||pr.kind==='sys')){
    try{const bytes=serialBytes(ticketText(o,d,pr),pr);for(let i=0;i<Math.max(1,pr.copies||1);i++)await relaySend(pr,bytes);logJob(pr,o,d,'sent',tr('Relais d’impression','Print relay'));return 'sent'}
    catch(e){logJob(pr,o,d,'preview',String(e&&e.message||e));if(inter)toast(tr('Impression impossible : ','Cannot print: ')+(e&&e.message||'relais injoignable'));return 'preview'}}
  return st.apply(this,arguments)}}
{const dp=drawerPulse;drawerPulse=async function(){const r=await dp.apply(this,arguments);if(r==='hw')return r;
  let ok=false;for(const p of D.all('posprinter').filter(x=>x.drawer)){if(await kickDrawer(p))ok=true}
  if(ok){DRW.last='hw';return 'hw'}return r}}
const money0=n=>String(Math.round(+n||0)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
function receiptText(o,pr){
  const w=pr&&pr.paper==='58'?32:42;const ctr=s=>' '.repeat(Math.max(0,Math.floor((w-s.length)/2)))+s;
  const ln=(a,b)=>{a=String(a);b=String(b||'');if(a.length+b.length+1>w)a=a.slice(0,w-b.length-1);return a+' '.repeat(Math.max(1,w-a.length-b.length))+b};
  const p=o.partner?D.name('partner',o.partner):tr('Client de passage','Walk-in');
  const pm=PAYOPT.find(x=>x[0]===o.pay);
  const L=['='.repeat(w),ctr(String((ST.set&&ST.set.company)||'VÉLUME').toUpperCase()),'='.repeat(w),ln(o.ref||'',(o.date||'').slice(0,10)+' '+(o.date||'').slice(11,16)),ln(tr('Client','Customer'),p),'-'.repeat(w)];
  (o.lines||[]).forEach(l=>{const nm=tx(D.name('product',l.product));L.push(ln((+l.qty||1)+' x '+nm,money0((+l.qty||1)*(+l.price||0))))});
  const ht=htOf(o.total||0);
  L.push('-'.repeat(w),ln(tr('Total HT','Total excl. VAT'),money0(ht)),ln('TVA '+fmt2(TVA())+' %',money0((o.total||0)-ht)),ln('TOTAL TTC (FCFA)',money0(o.total)),ln(tr('Paiement','Payment'),pm?(LANG==='fr'?pm[1]:pm[2]):''),'-'.repeat(w));
  const foot=(ST.set&&ST.set.pos_footer)||tr('Merci de votre visite !','Thank you for your visit!');String(foot).split('\n').forEach(s=>L.push(ctr(s.slice(0,w))));L.push('='.repeat(w));
  return L.join('\n')}
{const tv=A['till-validate'];A['till-validate']=function(){const n0=D.all('posorder').length;const r=tv.apply(this,arguments);
  try{const os=D.all('posorder');if(os.length>n0){const o=os.reduce((a,b)=>a.id>b.id?a:b);
    D.all('posprinter').filter(p=>p.receipt).forEach(async p=>{try{const bytes=serialBytes(receiptText(o,p),p);for(let i=0;i<Math.max(1,p.copies||1);i++)if(!(await sendBytes(p,bytes)))break}catch(e){toast(tr('Ticket client non imprimé : ','Receipt not printed: ')+(e&&e.message||''))}})}}catch(e){}
  return r}}
}

/* ---------- v45 : changer directement le rôle d'un administrateur ---------- */
{const RL=(window.__ROLES||[]);
const ah=window.__adminsHtml;window.__adminsHtml=function(){const h=ah?ah():'';
  return h.replace(/<button class="btn sm" data-a="adm-rm" data-id="(\d+)">/g,function(m,id){return '<select class="st3i" data-adr2="'+id+'" style="max-width:180px">'+RL.map(r=>'<option value="'+r[0]+'">'+esc(tr(r[1],r[2]))+'</option>').join('')+'</select><button class="btn pri sm" data-a="adm-role" data-id="'+id+'">'+tr('Changer le rôle','Change role')+'</button>'+m})};
A['adm-role']=el=>{const id=+el.dataset.id,u=D.get('user',id),sel=document.querySelector('[data-adr2="'+id+'"]');if(!u||!sel)return;const rn=sel.options[sel.selectedIndex].text;
  openModal('confirm',{msg:tr('Retirer les droits d’administrateur à '+(u.name||u.login)+' et lui donner le rôle « '+rn+' » ?','Remove administrator rights from '+(u.name||u.login)+' and give them the role “'+rn+'”?'),ok:()=>{D.write('user',id,{group:sel.value});save();toast(tr('Rôle modifié.','Role changed.'));render()}})}}

/* ---------- v46 : genre des employés (Serveur / Serveuse…) + rôles ---------- */
{M.employee.f.sex={k:'sex',t:'sel',fr:'Genre',en:'Gender',opts:[['m','Homme','Male',''],['f','Femme','Female','']]};
const ae=ACT.employees;if(ae&&ae.form&&ae.form.cols&&ae.form.cols[0]&&ae.form.cols[0].indexOf('sex')<0)ae.form.cols[0].splice(Math.min(2,ae.form.cols[0].length),0,'sex');
const g=M.user.f.group;if(g&&!g.opts.some(o=>o[0]==='studio'))g.opts.push(['studio','Studio (ancien rôle)','Studio (old role)','']);
const meU=()=>D.all('user').find(u=>u.id===ST.uid);
function empOf(u,create){if(!u)return null;let e=u.emp&&D.get('employee',u.emp);if(!e&&u.login)e=D.all('employee').find(x=>String(x.email||'').toLowerCase()===String(u.login).toLowerCase());
  if(!e&&create)e=D.create('employee',{name:u.name||u.login,email:u.login},{silent:true});return e}
{const pb=MODALS.profile&&MODALS.profile.body;if(pb)MODALS.profile.body=function(p){let h=pb.call(this,p);const u=meU();if(!u)return h;const e=empOf(u,false);const sx=(e&&e.sex)||'';
  const sel='<div class="lf"><label>'+tr('Genre (pour l’intitulé de votre poste)','Gender (for your job title)')+'</label><select data-pfsex="1"><option value=""></option><option value="m"'+(sx==='m'?' selected':'')+'>'+tr('Homme','Male')+'</option><option value="f"'+(sx==='f'?' selected':'')+'>'+tr('Femme','Female')+'</option></select></div>';
  return h.replace(/<hr>/,sel+'<hr>')}}
document.addEventListener('change',ev=>{const el=ev.target;if(!el.dataset||!el.dataset.pfsex)return;const u=meU();if(!u)return;const e=empOf(u,true);if(e){D.write('employee',e.id,{sex:el.value},{silent:true});save();toast(tr('Genre enregistré.','Gender saved.'));try{render()}catch(x){}}})}
