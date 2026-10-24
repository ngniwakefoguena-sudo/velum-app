/* ===== VELUME PRO 3 — premier accueil (admin / employé), droits sensibles, invitations, comptes Google/Outlook/Facebook pour l'admin ===== */
(function(){
const me=()=>D.all('user').find(u=>u.id===ST.uid);
const role=()=>{const u=me();return u?u.group:'admin'};
const isOwner=()=>{const u=me();return !!(u&&u.owner)};

/* ---------- droits sensibles (accordés par l'administrateur) ---------- */
const CAPS=[
 ['delete','Supprimer des enregistrements','Delete records','Factures, contacts, produits, articles… (suppression définitive).','Invoices, contacts, products, articles… (permanent).'],
 ['export','Exporter, importer, sauvegarder','Export, import, backup','Fichiers CSV, sauvegarde et restauration des données.','CSV files, data backup and restore.'],
 ['cashctl','Gérer la caisse','Manage the register','Clôturer la session, entrées/sorties d’espèces, tiroir.','Close the session, cash in/out, drawer.'],
 ['hr','Voir contrats, salaires et paies','See contracts, salaries and payroll','Menus Contrats et Paie, bulletins de salaire.','Contracts and Payroll menus, payslips.'],
 ['config','Modifier la configuration des applications','Edit app configuration','Menus Configuration et Paramètres de chaque application.','Configuration and Settings menus of each app.'],
 ['reports','Voir les rapports et analyses','See reports and analytics','Menus Reporting, Rapports, Analyse.','Reporting, Reports, Analysis menus.']
];
const DEFCAPS={manager:['delete','export','cashctl','hr','config','reports'],cashier:[],studio:[],kitchen:[],user:[]};
const caps=r=>{const o=ST.set.roleCaps&&ST.set.roleCaps[r];return o||DEFCAPS[r]||[]};
const can=c=>{const r=role();if(r==='admin')return true;if(r==='portal')return false;return caps(r).includes(c)};
window.__can=can;
const deny=()=>toast(tr('Droit insuffisant : seul l’administrateur peut vous l’accorder (Paramètres › Rôles & accès).','Not allowed: only the administrator can grant this right (Settings › Roles & access).'));
const guardA=(k,c)=>{const f=A[k];if(!f)return;A[k]=function(){if(!can(c))return deny();return f.apply(this,arguments)}};
['bulk-del','art-del'].forEach(k=>guardA(k,'delete'));
['bulk-export','io-exp','io-backup','io-restore','import-go','restore-go'].forEach(k=>guardA(k,'export'));
['till-closeses','close-ok','drawer-io'].forEach(k=>guardA(k,'cashctl'));
{const u0=D.unlink;D.unlink=function(m,id){if(m!=='user'&&ST.pro&&ST.pro.setup&&ST.auth&&!can('delete')){deny();return}return u0.call(this,m,id)}}
{const e0=exportCSV;exportCSV=function(){if(!can('export'))return deny();return e0.apply(this,arguments)}}

/* menus et accès HR / config / rapports */
const HRM=new Set(['contract','payslip','contracttpl']);
const menuAct=m=>{const a=m.act&&ACT[m.act];return a?a.model:null};
const blocked=m=>{
  if(m.ch)return false;
  if(HRM.has(menuAct(m))&&!can('hr'))return true;
  const l=(m.l&&m.l[0])||'';
  if(m.cus==='appset'&&!can('config'))return true;
  return false};
const hide=m=>{
  const l=(m.l&&m.l[0])||'';
  if(/^(Configuration|Paramètres)/i.test(l)&&!can('config'))return true;
  if(/^(Reporting|Rapports|Analyse)/i.test(l)&&!can('reports'))return true;
  if(/^(Contrats|Paie|Bulletins)/i.test(l)&&!can('hr'))return true;
  if(m.ch){const k=m.ch.filter(c=>!blocked(c));if(!k.length)return true}
  return blocked(m)};
{const nb=navbar;navbar=function(ap){if(!ap||role()==='admin')return nb(ap);const o=ap.menus;ap.menus=o.filter(m=>!hide(m));try{return nb(ap)}finally{ap.menus=o}}}
{const r0=render;render=function(){try{if(ST&&ST.auth&&R.screen==='app'&&R.app&&role()!=='admin'){const ap=appById(R.app);const m=ap&&findMenu(ap,R.menu);if(m&&(blocked(m)||(HRM.has(menuAct(m))&&!can('hr')))){R.menu=null;const f=ap.menus.filter(x=>!hide(x));if(f.length)openAppSafe(ap,f)}}}catch(e){}return r0.apply(this,arguments)}}
function openAppSafe(ap,f){const first=m=>m.ch?first(m.ch.filter(c=>!blocked(c))[0]):m;try{R.menu=first(f[0]).id}catch(e){R.screen='home'}}

/* tableau des droits dans Rôles & accès */
{const a0=CUSTOM.access;CUSTOM.access=function(){const base=a0();
  const ROLES=[['manager','Gérant / comptable','Manager / accountant'],['cashier','Caissier / serveur','Cashier / waiter'],['studio','Studio / production','Studio / production'],['kitchen','Cuisine / bar','Kitchen / bar'],['user','Utilisateur interne','Internal user']];
  const head='<tr><th>'+tr('Droit sensible','Sensitive right')+'</th><th>'+tr('Administrateur','Administrator')+'</th>'+ROLES.map(r=>'<th>'+esc(tr(r[1],r[2]))+'</th>').join('')+'</tr>';
  const rows=CAPS.map(c=>'<tr><td style="text-align:left"><b>'+esc(tr(c[1],c[2]))+'</b><div class="muted" style="font-size:.8rem">'+esc(tr(c[3],c[4]))+'</div></td><td><input type="checkbox" checked disabled></td>'+ROLES.map(r=>'<td><input type="checkbox" data-cap="'+r[0]+'|'+c[0]+'"'+(caps(r[0]).includes(c[0])?' checked':'')+'></td>').join('')+'</tr>').join('');
  return base.replace(/<\/table><\/div><\/div>$/,'</table><h3 style="margin:22px 0 6px">'+tr('Droits sensibles','Sensitive rights')+'</h3><p class="muted">'+tr('Seul l’administrateur peut accorder ces droits. Ils s’appliquent à tous les employés du rôle.','Only the administrator can grant these rights. They apply to every employee of the role.')+'</p><table>'+head+rows+'</table></div></div>')}}
document.addEventListener('change',e=>{const el=e.target;if(!el.dataset||!el.dataset.cap||role()!=='admin')return;const [r,c]=el.dataset.cap.split('|');ST.set.roleCaps=ST.set.roleCaps||{};const cur=caps(r).slice();const i=cur.indexOf(c);if(el.checked&&i<0)cur.push(c);if(!el.checked&&i>=0)cur.splice(i,1);ST.set.roleCaps[r]=cur;save();toast(tr('Droit mis à jour.','Right updated.'))});

/* ---------- invitations (code lié à un rôle) ---------- */
const invs=()=>ST.set.invites||(ST.set.invites=[]);
const RL=(r)=>{const x={manager:['Gérant / comptable','Manager / accountant'],cashier:['Caissier / serveur','Cashier / waiter'],studio:['Studio / production','Studio / production'],kitchen:['Cuisine / bar','Kitchen / bar'],user:['Utilisateur interne','Internal user']}[r];return x?tr(x[0],x[1]):r};
{const ah=window.__adminsHtml;window.__adminsHtml=function(){let h=ah();if(role()!=='admin')return h;
  const list=invs().filter(i=>!i.used);
  const block='<div class="st3o"><b>'+tr('Codes d’invitation','Invitation codes')+'</b><span class="st3d">'+tr('Donnez un code à un employé : en créant son compte avec ce code, il reçoit directement le rôle choisi, sans attendre de validation.','Give a code to an employee: when creating their account with this code they get the chosen role directly, without waiting for approval.')+'</span><div class="adm">'+
   list.map(i=>'<div class="r"><b style="font-family:monospace;font-size:1.05rem">'+esc(i.code)+'</b><span class="badge">'+esc(RL(i.role))+'</span><button class="btn sm" data-a="inv-del" data-c="'+esc(i.code)+'">'+tr('Annuler','Revoke')+'</button></div>').join('')+
   '<div class="r"><select id="invrole" class="st3i">'+['cashier','studio','kitchen','manager','user'].map(r=>'<option value="'+r+'">'+esc(RL(r))+'</option>').join('')+'</select><button class="btn pri sm" data-a="inv-new">'+tr('Générer un code','Generate a code')+'</button></div></div></div>';
  return h+block}}
A['inv-new']=()=>{const r=(document.getElementById('invrole')||{}).value||'user';const c='VLM-'+Math.random().toString(36).slice(2,7).toUpperCase();invs().push({code:c,role:r,used:false});save();toast(tr('Code créé : ','Code created: ')+c);render()};
A['inv-del']=el=>{ST.set.invites=invs().filter(i=>i.code!==el.dataset.c);save();render()};
{const ms=MODALS.signup;MODALS.signup=Object.assign({},ms,{body:()=>{let h=ms.body();const w=UI.su||{};return h.replace(/<div class="lf"><label>[^<]*<\/label><input data-su="code" type="password"/,'<div class="lf"><label>'+tr('Code d’invitation (facultatif)','Invitation code (optional)')+'</label><input data-su="inv" value="'+esc(w.inv||'')+'" autocapitalize="characters"></div>$&')}})}
{const ok=A['su-ok'];A['su-ok']=function(){const w=UI.su;const code=((w&&w.inv)||'').trim().toUpperCase();let inv=null;
  if(code){inv=invs().find(i=>!i.used&&i.code===code);if(!inv){w.err=tr('Code d’invitation invalide ou déjà utilisé.','Invalid or already used invitation code.');return render()}}
  const old=ST.set.signup;if(inv&&(old||'approval')==='off')ST.set.signup='approval';
  const n0=D.all('user').length;try{ok()}finally{if(inv)ST.set.signup=old}
  if(inv&&D.all('user').length>n0){const u=D.all('user')[D.all('user').length-1];D.write('user',u.id,{group:inv.role,pending:false},{silent:true});inv.used=true;inv.by=u.login;saveNow();UI.modal=null;toast(tr('Compte créé avec le rôle « '+RL(inv.role)+' ». Connectez-vous.','Account created with role “'+RL(inv.role)+'”. Please sign in.'));render()}}}

/* ---------- premier accueil : administrateur ou employé ? ---------- */
{const l1=loginHtml;loginHtml=function(){
  if(!ST.pro||!ST.pro.setup){
    if(!UI.who){
      return '<div class="login"><div class="bgfx" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="lcard wz"><div style="text-align:center"><span class="brand" style="margin:0;font-size:1.3rem;letter-spacing:.3em"><i class="brand-mark"></i>VELUME</span></div><h2>'+tr('Bienvenue ! Qui êtes-vous ?','Welcome! Who are you?')+'</h2>'+
       '<button class="opt" data-a="who" data-w="admin" style="text-align:left;font:inherit"><span><b>'+tr('Je crée l’espace de mon entreprise','I’m creating my business workspace')+'</b><br><span class="muted">'+tr('Vous devenez l’administrateur principal : vous configurez l’entreprise et vous donnez les droits à votre équipe.','You become the main administrator: you set up the business and grant rights to your team.')+'</span></span></button>'+
       '<button class="opt" data-a="who" data-w="employee" style="text-align:left;font:inherit"><span><b>'+tr('Je suis employé','I’m an employee')+'</b><br><span class="muted">'+tr('Vous rejoignez l’espace de votre entreprise avec le code ou le compte donné par votre administrateur.','You join your business workspace with the code or account given by your administrator.')+'</span></span></button>'+
       '<div class="seg" style="justify-self:center" role="group"><button data-a="lang" data-l="fr" aria-pressed="'+(LANG==='fr')+'">Français</button><button data-a="lang" data-l="en" aria-pressed="'+(LANG==='en')+'">English</button></div></div></div>'}
    if(UI.who==='employee'){
      return '<div class="login"><div class="bgfx" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="lcard wz"><div style="text-align:center"><span class="brand" style="margin:0;font-size:1.3rem;letter-spacing:.3em"><i class="brand-mark"></i>VELUME</span></div><h2>'+tr('Aucun espace sur cet appareil','No workspace on this device')+'</h2><p class="muted">'+tr('L’administrateur de votre entreprise doit d’abord créer l’espace VELUME. Ouvrez VELUME sur l’appareil de l’entreprise (caisse, tablette ou ordinateur du bureau) et connectez-vous avec le compte ou le code d’invitation qu’il vous a remis.','Your business administrator must first create the VELUME workspace. Open VELUME on the business device (register, tablet or office computer) and sign in with the account or invitation code they gave you.')+'</p><p class="muted" style="font-size:.84rem">'+tr('Le partage automatique entre appareils arrivera avec la version serveur.','Automatic sharing between devices will come with the server version.')+'</p><div class="foot"><button class="btn" data-a="who" data-w="">'+tr('Retour','Back')+'</button><button class="btn pri" data-a="who" data-w="admin">'+tr('Je suis l’administrateur','I’m the administrator')+'</button></div></div></div>'}
  }
  let h=l1();
  if(ST.pro&&ST.pro.setup)h=h.replace(/(<button class="btn" data-a="su-open">[^<]*<\/button>)/,'<div class="or">'+tr('Nouveau ici ?','New here?')+'</div>$1');
  return h}}
A.who=el=>{UI.who=el.dataset.w||null;UI.wz=null;render()};

/* administrateur : compte Google / Outlook / Facebook dans l'assistant */
const PV={google:['Google','#ea4335',/@(gmail|googlemail)\.com$/i,'nom@gmail.com'],outlook:['Outlook','#0078d4',/@(outlook|hotmail|live|msn)\.[a-z.]+$/i,'nom@outlook.com'],facebook:['Facebook','#1877f2',/^[^@\s]+@[^@\s]+\.[^@\s]+$/,'nom@exemple.com']};
{const l2=loginHtml;loginHtml=function(){let h=l2();const w=UI.wz;if(!w||w.step!==3||(ST.pro&&ST.pro.setup))return h;
  const pv=w.prov||'own';
  const btn=['google','own'].map(k=>'<button type="button" data-a="wz-prov" data-p="'+k+'" aria-pressed="'+(pv===k)+'"><b style="background:'+(k==='own'?'var(--gold)':PV[k][1])+'">'+(k==='own'?'@':PV[k][0][0])+'</b>'+(k==='own'?tr('E-mail','E-mail'):PV[k][0])+'</button>').join('');
  h=h.replace(/(<div class="lf"><label>[^<]*<\/label><input data-wz="name")/,'<div class="prov">'+btn+'</div>'+(pv==='own'?'':'<p class="muted" style="font-size:.84rem;margin:0">'+tr('Votre adresse '+PV[pv][0]+' sert d’identifiant. L’adresse n’est pas vérifiée dans cette version (pas de connexion à '+PV[pv][0]+') et vous choisissez un mot de passe VELUME.','Your '+PV[pv][0]+' address is your login. It is not verified in this version (no connection to '+PV[pv][0]+') and you choose a VELUME password.')+'</p>')+'$1');
  if(pv!=='own')h=h.replace(/data-wz="email" value="([^"]*)"/,'data-wz="email" placeholder="'+PV[pv][3]+'" value="$1"');
  return h}}
A['wz-prov']=el=>{const w=UI.wz;if(!w)return;w.prov=el.dataset.p;w.err='';render()};
{const nx=A['wz-next'];A['wz-next']=function(){const w=UI.wz;if(w&&w.step===3&&w.prov&&w.prov!=='own'&&!PV[w.prov][2].test((w.email||'').trim())){w.err=tr('Adresse '+PV[w.prov][0]+' invalide.',PV[w.prov][0]+' address is invalid.');return render()}return nx.apply(this,arguments)}}
{const dn=A['wz-done'];A['wz-done']=function(){const w=UI.wz,prov=w&&w.prov;dn.apply(this,arguments);if(prov&&prov!=='own'){const u=D.all('user').find(x=>x.owner);if(u){D.write('user',u.id,{provider:PV[prov][0]},{silent:true});save()}}}}

/* ---------- adaptation tous écrans ---------- */
{const c=document.createElement('style');c.textContent=`
html{overflow-x:clip}body{max-width:100%;overflow-x:clip}.wz .opt{background:var(--surface)}
.toast{width:max-content;max-width:calc(100vw - 32px);box-sizing:border-box}
#app{max-width:100vw}
.lcard input[type=checkbox],.lcard input[type=radio]{width:auto;flex:none;min-height:0;padding:0}
.lcard .opt{width:100%;box-sizing:border-box}
.lcard.wz{width:min(540px,100%)}
.login{padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));box-sizing:border-box}
.lcard{max-width:100%;box-sizing:border-box;overflow-wrap:anywhere}
.lcard .foot .btn{width:auto;flex:1}
.lcard .prov{grid-template-columns:repeat(2,minmax(0,1fr))}
.lcard .devseg{justify-content:center}
@media(max-width:480px){.lcard{padding:20px 16px}.lcard .devseg button{flex:1 1 40%}.wz h2{font-size:1.15rem}}
@media(min-width:1600px){.home .wrap{max-width:1500px;margin-inline:auto}.apps-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}}
@media(max-width:700px){.dlg{max-width:100vw}.va,.cp{max-width:100vw}table{display:block;overflow-x:auto}.st3cols{padding:12px}}
`;document.head.appendChild(c)}

/* ---------- déjà un compte : connexion claire, mot de passe oublié, clé de récupération ---------- */
{const l3=loginHtml;loginHtml=function(){let h=l3();if(!(ST.pro&&ST.pro.setup))return h;
  h=h.replace('<div class="lf"><label for="lg">','<h2 style="margin:0;font-family:var(--fd);font-size:1.15rem;text-align:center">'+tr('Se connecter','Sign in')+'</h2><p class="muted" style="margin:-6px 0 0;text-align:center;font-size:.88rem">'+tr('Vous avez déjà un compte ? Entrez votre identifiant et votre mot de passe.','Already have an account? Enter your username and password.')+'</p><div class="lf"><label for="lg">');
  h=h.replace('<button class="btn pri" data-a="login">','<a href="#" data-a="forgot" style="text-align:center;font-size:.88rem;color:var(--teal)">'+tr('Mot de passe oublié ?','Forgot password?')+'</a><button class="btn pri" data-a="login">');
  return h}}
const newRK=()=>{const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let k='';for(let i=0;i<12;i++){k+=c[Math.floor(Math.random()*c.length)];if(i%4===3&&i<11)k+='-'}return k};
MODALS.reckey={title:()=>tr('Clé de récupération','Recovery key'),body:p=>'<p>'+tr('Notez cette clé et gardez-la en lieu sûr (papier, coffre). Elle permet à l’administrateur principal de recréer son mot de passe s’il l’oublie. Elle n’est affichée qu’une fois.','Write this key down and keep it safe (paper, safe). It lets the main administrator reset their password if forgotten. It is shown only once.')+'</p><div class="card" style="text-align:center;font-family:monospace;font-size:1.3rem;letter-spacing:.08em"><b>'+esc(p.key)+'</b></div>',foot:()=>'<button class="btn pri" data-a="mclose">'+tr('J’ai noté la clé','I wrote it down')+'</button>'};
{const dn=A['wz-done'];A['wz-done']=function(){dn.apply(this,arguments);const k=newRK();ST.pro.rk=window.__hsh(k);saveNow();setTimeout(()=>openModal('reckey',{key:k}),600)}}
const FG=()=>UI.fg||(UI.fg={key:'',n1:'',err:''});
MODALS.forgot={title:()=>tr('Mot de passe oublié','Forgot password'),body:()=>{const w=FG();return '<p><b>'+tr('Employé :','Employee:')+'</b> '+tr('demandez à votre administrateur de vous donner un nouveau mot de passe (Paramètres › Utilisateurs).','ask your administrator to give you a new password (Settings › Users).')+'</p><hr><p><b>'+tr('Administrateur principal :','Main administrator:')+'</b> '+tr('entrez votre clé de récupération et un nouveau mot de passe.','enter your recovery key and a new password.')+'</p><div class="lf"><label>'+tr('Clé de récupération','Recovery key')+'</label><input data-fg="key" value="'+esc(w.key)+'" autocapitalize="characters" placeholder="XXXX-XXXX-XXXX"></div><div class="lf"><label>'+tr('Nouveau mot de passe (6 min.)','New password (min. 6)')+'</label><input data-fg="n1" type="password" value="'+esc(w.n1)+'"></div>'+(w.err?'<div class="lerr" role="alert">'+esc(w.err)+'</div>':'')},foot:()=>'<button class="btn pri" data-a="fg-ok">'+tr('Réinitialiser','Reset')+'</button><button class="btn" data-a="mclose">'+tr('Annuler','Cancel')+'</button>'};
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&el.dataset.fg&&UI.fg)UI.fg[el.dataset.fg]=el.value});
A.forgot=()=>{UI.fg=null;openModal('forgot')};
A['fg-ok']=()=>{const w=FG();w.err='';const ow=D.all('user').find(u=>u.owner);
  if(!ST.pro||!ST.pro.rk)w.err=tr('Aucune clé de récupération enregistrée sur cet appareil.','No recovery key stored on this device.');
  else if(window.__hsh((w.key||'').trim().toUpperCase())!==ST.pro.rk)w.err=tr('Clé incorrecte.','Wrong key.');
  else if((w.n1||'').length<6)w.err=tr('Mot de passe : 6 caractères minimum.','Password: 6 characters minimum.');
  if(w.err||!ow)return render();
  D.write('user',ow.id,{code:window.__hsh(w.n1)},{silent:true});UI.modal=null;UI.fg=null;UI.lglogin=ow.login;saveNow();toast(tr('Mot de passe réinitialisé. Connectez-vous.','Password reset. Please sign in.'));render()};
{const pb=MODALS.profile.body;MODALS.profile=Object.assign({},MODALS.profile,{body:()=>{let h=pb();const u=me();return h+(u&&u.owner?'<hr><button class="btn sm" data-a="pf-rk">'+tr('Générer une nouvelle clé de récupération','Generate a new recovery key')+'</button>':'')}})}
A['pf-rk']=()=>{const k=newRK();ST.pro.rk=window.__hsh(k);saveNow();openModal('reckey',{key:k})};
})();
