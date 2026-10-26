/* ===== VELUME CLOUD 8 — Supabase : comptes, rôles, synchronisation entre appareils, hors connexion ===== */
(function(){
const CFG=window.VELUME_CLOUD||{url:'https://fokajfvtrmmslcvvnstm.supabase.co',key:'sb_publishable_xwwOi6VxfgnwGUZ0oc_-qg_YEJjgLiS'};
const ON=!!(CFG&&CFG.url&&CFG.key&&CFG.enabled!==false);
window.__cloudOn=ON;
if(!ON)return;

/* ---------- petits outils ---------- */
const K={ses:'velume.cloud.session',cur:'velume.cloud.cursor',snap:'velume.cloud.snap',pool:'velume.cloud.pool',prof:'velume.cloud.profile',dev:'velume.cloud.dev',joined:'velume.cloud.joined',fb:'velume.cloud.fb',sset:'velume.cloud.sset',keep:'velume.cloud.keep',last:'velume.cloud.last'};
const lg=(k)=>{try{return localStorage.getItem(k)}catch(e){return null}};
const ls=(k,v)=>{try{if(v===null||v===undefined)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}};
const lj=(k,d)=>{try{const s=lg(k);return s?JSON.parse(s):d}catch(e){return d}};
const sj=(k,o)=>ls(k,JSON.stringify(o));
const enc=encodeURIComponent;
const canon=o=>{if(o===null||typeof o!=='object')return JSON.stringify(o);if(Array.isArray(o))return '['+o.map(canon).join(',')+']';return '{'+Object.keys(o).filter(k=>o[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+canon(o[k])).join(',')+'}'};
const H=s=>{let h=5381,i=s.length;while(i)h=(h*33)^s.charCodeAt(--i);return (h>>>0).toString(36)+'.'+s.length.toString(36)};
const hr=o=>H(canon(o));
const nrm=e=>String(e||'').trim().toLowerCase();
const okMail=e=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
const ROLE_LBL=r=>r==='cashier'?tr('Caissier (ancien rôle)','Cashier (old role)'):r==='admin'?tr('Administrateur','Administrator'):r==='portal'?tr('Portail','Portal'):((window.__ROLES||[]).find(x=>x[0]===r)?tr((window.__ROLES.find(x=>x[0]===r))[1],(window.__ROLES.find(x=>x[0]===r))[2]):r);

/* ---------- session ---------- */
let SES=null;
const keepFlag=()=>lg(K.keep)!=='0';
const loadSes=()=>{try{return JSON.parse(localStorage.getItem(K.ses)||sessionStorage.getItem(K.ses)||'null')}catch(e){return null}};
const saveSes=(s,keep)=>{SES=s;try{localStorage.removeItem(K.ses);sessionStorage.removeItem(K.ses);if(s){const st=(keep===false)?sessionStorage:localStorage;st.setItem(K.ses,JSON.stringify(s))}}catch(e){}};
const normSes=j=>(!j||!j.access_token)?null:{access_token:j.access_token,refresh_token:j.refresh_token,expires_at:Date.now()+((j.expires_in||3600)*1000)-60000,uid:j.user&&j.user.id,email:j.user&&j.user.email,name:j.user&&j.user.user_metadata&&(j.user.user_metadata.full_name||j.user.user_metadata.name)||''};

/* retour de Google ou lien « mot de passe oublié » : jetons dans l'adresse (traité avant le démarrage de l'appli) */
let HASHKIND=null;
(function(){try{const h=location.hash||'';if(/access_token=/.test(h)){const p=new URLSearchParams(h.replace(/^#\/?/,''));const at=p.get('access_token');if(at){HASHKIND=p.get('type')||'signin';
  const s={access_token:at,refresh_token:p.get('refresh_token'),expires_at:Date.now()+((+p.get('expires_in')||3600)*1000)-60000};
  let uid=null,email=null,name='';try{const pl=JSON.parse(decodeURIComponent(escape(atob(at.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))));uid=pl.sub;email=pl.email;name=(pl.user_metadata&&(pl.user_metadata.full_name||pl.user_metadata.name))||''}catch(e){}
  s.uid=uid;s.email=email;s.name=name;saveSes(s,keepFlag());history.replaceState(null,'',location.pathname+location.search)}}
  else if(/error_description=/.test(h)){HASHKIND='error:'+decodeURIComponent((h.match(/error_description=([^&]*)/)||[])[1]||'').replace(/\+/g,' ');history.replaceState(null,'',location.pathname+location.search)}}catch(e){}
  if(!SES)SES=loadSes()})();

async function raw(path,o){o=o||{};const h=Object.assign({apikey:CFG.key,'Content-Type':'application/json'},o.headers||{});
  if(o.auth!==false&&SES&&SES.access_token)h.Authorization='Bearer '+SES.access_token; /* la clé publique ne va que dans l'en-tête apikey */
  const r=await fetch(CFG.url+path,{method:o.method||'GET',headers:h,body:o.body!==undefined?JSON.stringify(o.body):undefined});
  const t=await r.text();let j=null;try{j=t?JSON.parse(t):null}catch(e){j=t}
  return {ok:r.ok,status:r.status,json:j}}
const errText=r=>{const j=r&&r.json;return (j&&(j.msg||j.message||j.error_description||j.error))||('HTTP '+(r&&r.status))};
async function refresh(){if(!SES||!SES.refresh_token)return false;
  const r=await raw('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:SES.refresh_token},auth:false});
  if(r.ok&&r.json&&r.json.access_token){const n=normSes(r.json);if(!n.name)n.name=SES.name||'';saveSes(n,keepFlag());return true}
  if(r.status>=400&&r.status<500){saveSes(null);return false}
  throw new Error('net')}
async function api(path,o){if(SES&&SES.expires_at<Date.now()){try{await refresh()}catch(e){}}
  let r=await raw(path,o);
  if(r.status===401&&SES){let ok=false;try{ok=await refresh()}catch(e){}if(ok)r=await raw(path,o)}
  return r}
const sb={
  signUp:(email,password,name)=>raw('/auth/v1/signup',{method:'POST',body:{email:email,password:password,data:{name:name||''}},auth:false}),
  signIn:(email,password)=>raw('/auth/v1/token?grant_type=password',{method:'POST',body:{email:email,password:password},auth:false}),
  recover:email=>raw('/auth/v1/recover?redirect_to='+enc(location.origin+location.pathname),{method:'POST',body:{email:email},auth:false}),
  setPassword:pw=>api('/auth/v1/user',{method:'PUT',body:{password:pw}}),
  rpc:(fn,args)=>api('/rest/v1/rpc/'+fn,{method:'POST',body:args||{}}),
  select:(t,q)=>api('/rest/v1/'+t+'?'+q),
  upsert:(t,rows,conf)=>api('/rest/v1/'+t+'?on_conflict='+conf,{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:rows})
};
const rpcErr=r=>{const m=String(errText(r));
  const map={owner_only:tr('Seul l’administrateur principal peut nommer ou retirer un administrateur.','Only the main administrator can appoint or remove an administrator.'),owner_protected:tr('L’administrateur principal ne peut pas être modifié.','The main administrator cannot be changed.'),not_yourself:tr('Vous ne pouvez pas modifier votre propre compte.','You cannot change your own account.'),admin_only:tr('Action réservée à l’administrateur.','Action reserved to the administrator.'),bad_code:tr('Code d’invitation invalide ou déjà utilisé.','Invalid or already used invitation code.'),already_initialized:tr('Une entreprise existe déjà sur le serveur.','A business already exists on the server.')};
  for(const k in map)if(m.indexOf(k)>=0)return map[k];return m};

/* ---------- état ---------- */
let READY=false,PROFILE=null,OFFLINE=false,APPLYING=false,SYNCING=false,TIMER=null,AGAIN=false;
let SNAP=lj(K.snap,{});
let SETSNAP=lg(K.sset)||'';
const CL=()=>UI.cl||(UI.cl={view:null,email:lg(K.last)||'',pw:'',name:'',code:'',err:'',info:'',busy:false,keep:keepFlag()});
const saveSnap=()=>sj(K.snap,SNAP);

/* ---------- numéros uniques (blocs réservés sur le serveur, utilisables hors connexion) ---------- */
const BLOCK=25;let POOL=lj(K.pool,{});
let DEVN=+lg(K.dev)||0;if(!DEVN){DEVN=1+Math.floor(Math.random()*80);ls(K.dev,String(DEVN))}
let FB=lj(K.fb,{});
function reserveSync(m,n){try{const x=new XMLHttpRequest();x.open('POST',CFG.url+'/rest/v1/rpc/reserve_ids',false);x.setRequestHeader('apikey',CFG.key);if(SES&&SES.access_token)x.setRequestHeader('Authorization','Bearer '+SES.access_token);x.setRequestHeader('Content-Type','application/json');x.send(JSON.stringify({m:m,n:n}));if(x.status===200){const v=parseInt(x.responseText,10);if(v>0)return v}}catch(e){}return null}
async function refill(m){const r=await sb.rpc('reserve_ids',{m:m,n:BLOCK});if(r.ok&&+r.json>0){const p=POOL[m];const s=+r.json;if(p&&p[0]<=p[1]&&p[1]+1===s)p[1]=s+BLOCK-1;else if(!p||p[0]>p[1])POOL[m]=[s,s+BLOCK-1];sj(K.pool,POOL)}}
const nid0=D.nextId;
D.nextId=function(m){if(!READY)return nid0.call(D,m);
  let p=POOL[m];
  if(!p||p[0]>p[1]){const s=OFFLINE?null:reserveSync(m,BLOCK);if(s!=null)p=POOL[m]=[s,s+BLOCK-1];else{FB[m]=(FB[m]||0)+1;sj(K.fb,FB);return 10000000+DEVN*100000+FB[m]}}
  const id=p[0]++;sj(K.pool,POOL);if(p[1]-p[0]<4&&!OFFLINE)refill(m).catch(()=>{});return id};

/* ---------- synchronisation des enregistrements ---------- */
const syncModels=()=>Object.keys(ST.db).filter(m=>m!=='user'&&m.indexOf('_chat_')!==0&&Array.isArray(ST.db[m]));
function scan(){const ch=[];
  for(const m of syncModels()){const sm=SNAP[m]||{};const seen={};
    for(const r of ST.db[m]){if(!r||r.id==null)continue;const h=hr(r);seen[r.id]=1;if(sm[r.id]!==h)ch.push({model:m,id:r.id,data:r,h:h})}
    for(const id in sm)if(!seen[id])ch.push({model:m,id:+id,del:true})}
  return ch}
const setSnap=(m,id,h)=>{const sm=SNAP[m]||(SNAP[m]={});if(h===null)delete sm[id];else sm[id]=h};
async function pushRecords(){const ch=scan();if(!ch.length)return 0;
  for(let i=0;i<ch.length;i+=150){const part=ch.slice(i,i+150);
    const r=await sb.upsert('records',part.map(c=>({model:c.model,id:c.id,data:c.del?{}:c.data,deleted:!!c.del})),'model,id');
    if(!r.ok)throw new Error(errText(r));
    part.forEach(c=>setSnap(c.model,c.id,c.del?null:c.h));saveSnap()}
  return ch.length}
function applyRows(rows,adopt){let n=0;
  for(const x of rows){const m=x.model;if(m==='user'||m.indexOf('_chat_')===0)continue;
    const arr=ST.db[m]||(ST.db[m]=[]);const i=arr.findIndex(r=>r.id===x.id);const sm=SNAP[m]||(SNAP[m]={});
    if(i>=0&&!adopt&&hr(arr[i])!==sm[x.id])continue; /* modification locale non envoyée : elle gagne */
    if(x.deleted){if(i>=0){arr.splice(i,1);n++}delete sm[x.id];continue}
    const d=x.data||{};if(d.id==null)d.id=x.id;
    if(i>=0){if(hr(arr[i])===hr(d)){sm[x.id]=hr(d);continue}arr[i]=d}else{arr.push(d);if(arr.length>1&&arr[arr.length-2].id>d.id)arr.sort((a,b)=>a.id-b.id)}
    sm[x.id]=hr(d);n++}
  return n}
async function pullRecords(full){let cur=full?null:lg(K.cur);let n=0;let guard=0;
  while(guard++<200){
    let q='select=model,id,data,deleted,updated_at&order=updated_at.asc&limit=1000';
    if(cur){const t=Date.parse(cur);q+='&updated_at=gt.'+enc(full||guard>1?cur:new Date((isNaN(t)?0:t)-4000).toISOString())}
    const r=await sb.select('records',q);if(!r.ok)throw new Error(errText(r));
    const rows=r.json||[];if(!rows.length)break;
    APPLYING=true;try{n+=applyRows(rows,!!full&&ADOPT)}finally{APPLYING=false}
    cur=rows[rows.length-1].updated_at;ls(K.cur,cur);
    if(rows.length<1000)break}
  saveSnap();return n}
let ADOPT=false;

/* ---------- réglages de l'entreprise ---------- */
const setPayload=()=>{const s=Object.assign({},ST.set);delete s.invites;return {set:s,installed:ST.installed||{}}};
async function pushSettings(){if(!PROFILE||PROFILE.role!=='admin')return;const p=setPayload();const h=hr(p);if(h===SETSNAP)return;
  const r=await sb.upsert('settings',[{key:'company',data:p}],'key');if(!r.ok)throw new Error(errText(r));SETSNAP=h;ls(K.sset,h)}
async function pullSettings(force){const r=await sb.select('settings','select=key,data,updated_at&key=eq.company');if(!r.ok)throw new Error(errText(r));
  const row=(r.json||[])[0];if(!row)return false;const d=row.data||{};
  const mine=hr(setPayload());if(!force&&SETSNAP&&mine!==SETSNAP&&PROFILE&&PROFILE.role==='admin')return false; /* réglages modifiés ici, pas encore envoyés */
  if(hr({set:d.set||{},installed:d.installed||{}})===mine)return false;
  const inv=ST.set.invites;ST.set=Object.assign({},d.set||{});if(inv)ST.set.invites=inv;ST.installed=d.installed||ST.installed||{};
  SETSNAP=hr(setPayload());ls(K.sset,SETSNAP);return true}

/* ---------- profils -> comptes locaux ---------- */
let INVITES_KEY='';
function syncUsers(profiles){let changed=false;const us=ST.db.user||(ST.db.user=[]);const keep=[];
  for(const p of profiles){let u=us.find(x=>x.sb===p.id)||us.find(x=>!x.sb&&nrm(x.login)===nrm(p.email));
    if(!u){const id=us.reduce((a,x)=>Math.max(a,+x.id||0),0)+1;u=Object.assign({},D.defaults('user'),{id:id,name:p.name||String(p.email).split('@')[0],login:p.email,code:'',lang:LANG,active:true});us.push(u);changed=true}
    const t={sb:p.id,login:p.email,group:p.role,owner:!!p.is_owner,pending:!p.approved,code:''};
    for(const k in t)if(u[k]!==t[k]){u[k]=t[k];changed=true}
    keep.push(u)}
  if(keep.length!==us.length||keep.some((u,i)=>u!==us[i])){ST.db.user=keep;changed=true}
  return changed}
async function pullProfiles(){const r=await sb.select('profiles','select=*&order=created_at.asc');if(!r.ok)throw new Error(errText(r));
  const rows=r.json||[];const me=rows.find(p=>PROFILE&&p.id===PROFILE.id);
  if(!me){forceOut(tr('Votre compte a été retiré.','Your account has been removed.'));return false}
  if(!me.approved){forceOut(tr('Votre accès a été suspendu par l’administrateur.','Your access was suspended by the administrator.'));return false}
  PROFILE=me;sj(K.prof,me);
  const ch=syncUsers(rows);const u=(ST.db.user||[]).find(x=>x.sb===me.id);if(u&&ST.uid!==u.id){ST.uid=u.id;}
  return ch}
async function pullInvites(){if(!PROFILE||PROFILE.role!=='admin')return false;const r=await sb.select('invites','select=code,role,used&order=created_at.asc');if(!r.ok)return false;
  const list=(r.json||[]).map(i=>({code:i.code,role:i.role,used:!!i.used}));const k=canon(list);if(k===INVITES_KEY)return false;INVITES_KEY=k;ST.set.invites=list;return true}

/* ---------- cycle de synchronisation ---------- */
function setStatus(s,extra){const el=document.getElementById('vsync');if(!el)return;
  const m={ok:[tr('Synchronisé','Synced'),'ok'],sync:[tr('Synchronisation…','Syncing…'),'sync'],off:[tr('Hors connexion','Offline')+(extra?' · '+extra+' '+tr('en attente','pending'):''),'off'],err:[tr('Erreur de synchronisation','Sync error'),'err']}[s]||['',''];
  el.className='vsync '+m[1]+(ST.auth?' show':'');el.textContent='● '+m[0];el.title=extra&&s==='err'?String(extra):''}
let rdT=null;
function renderSoon(){if(rdT)return;rdT=setTimeout(function t(){rdT=null;const a=document.activeElement;const typing=a&&(/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)||a.isContentEditable);if(typing||UI.modal||!ST.auth){if(ST.auth)rdT=setTimeout(t,2500);return}try{render()}catch(e){}},400)}
async function cycle(opt){opt=opt||{};if(!READY||!SES)return;if(SYNCING){AGAIN=true;return}SYNCING=true;let changed=false;
  try{setStatus('sync');
    const c1=await pullProfiles();if(!READY)return;
    const c2=await pullSettings(false);
    const c3=await pullRecords(false);
    await pushSettings();const pushed=await pushRecords();
    const c4=await pullInvites();
    changed=c1||c2||c3>0||c4;OFFLINE=false;setStatus('ok');
    if(changed){saveNow();renderSoon()}
  }catch(e){OFFLINE=!(e&&/HTTP 4|permission|row-level/i.test(String(e.message)));setStatus(OFFLINE?'off':'err',OFFLINE?scan().length:String(e.message))}
  finally{SYNCING=false;if(AGAIN){AGAIN=false;setTimeout(()=>cycle(),300)}}}
const schedPush=(()=>{let t=null;return()=>{if(!READY)return;clearTimeout(t);t=setTimeout(()=>{cycle()},1200)}})();
{const si=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){const r=si.apply(this,arguments);if(k==='velume.v2.state'&&READY)schedPush();return r}}
function startTimers(){if(TIMER)return;TIMER=setInterval(()=>{if(document.hidden&&Math.random()<.75)return;cycle()},8000);
  window.addEventListener('online',()=>cycle());document.addEventListener('visibilitychange',()=>{if(!document.hidden)cycle()});
  setInterval(()=>{if(SES&&SES.expires_at-Date.now()<120000)refresh().catch(()=>{})},60000)}
window.addEventListener('offline',()=>{OFFLINE=true;setStatus('off',READY?scan().length:0)});

/* ---------- entrée dans l'application ---------- */
function getProfileRows(){return sb.select('profiles','select=*&id=eq.'+enc(SES.uid))}
async function getProfile(){const r=await getProfileRows();if(!r.ok)throw new Error(errText(r));return (r.json||[])[0]||null}
function hardResetLocal(){const chat={};Object.keys(ST.db).forEach(k=>{if(k.indexOf('_chat_')===0)chat[k]=ST.db[k]});ST.db=chat;ST.seq={};SNAP={};saveSnap();ls(K.cur,null);ls(K.sset,null);SETSNAP='';POOL={};sj(K.pool,POOL)}
async function enter(p,opt){opt=opt||{};PROFILE=p;sj(K.prof,p);const c=CL();if(!opt.resume){c.view='boot';c.info=tr('Chargement de vos données…','Loading your data…');render()}
  READY=false;
  const joiner=!opt.owner&&!lg(K.joined);
  if(joiner&&ST.pro&&ST.pro.setup&&D.all('user').some(u=>u.owner&&!u.sb)){c.wipe=true;c.view='login';c.err=tr('Cet appareil contient une entreprise qui n’est pas encore sur le serveur. Utilisez d’abord « Activer le serveur avec les données de cet appareil » avec le compte administrateur.','This device holds a business that is not on the server yet. First use “Enable the server with this device’s data” with the administrator account.');saveSes(null);render();return}
  if(joiner){hardResetLocal();ADOPT=true}
  try{
    await pullProfiles().catch(e=>{throw e});if(!PROFILE)return;
    if(opt.owner){ /* première mise en ligne : numéros, réglages, toutes les données */
      READY=true;
      const mx={};syncModels().forEach(m=>{const a=ST.db[m];if(a.length)mx[m]=a.reduce((t,r)=>Math.max(t,+r.id||0),0)});
      await Promise.all(Object.keys(mx).map(m=>sb.rpc('seed_counter',{m:m,v:mx[m]})));
      await pushSettings();await pushRecords();READY=false}
    await pullSettings(joiner);
    ADOPT=joiner;await pullRecords(joiner||!!opt.owner);ADOPT=false;
  }catch(e){ADOPT=false;c.view=null;c.err=OFFLINE_MSG(e);render();return}
  const u=(ST.db.user||[]).find(x=>x.sb===p.id)||(ST.db.user||[]).find(x=>nrm(x.login)===nrm(p.email));
  if(!u){c.view=null;c.err=tr('Compte introuvable.','Account not found.');render();return}
  ST.uid=u.id;ST.pro=Object.assign({},ST.pro||{},{setup:true,at:(ST.pro&&ST.pro.at)||isoDT(new Date())});
  ST.me=ensureEmpCloud(u);ST.auth=true;if(u.lang)LANG=ST.lang=u.lang;
  c.view=null;c.err='';c.pw='';UI.wz=null;UI.who=null;
  ls(K.last,p.email);
  ls(K.joined,'1');READY=true;startTimers();if(!opt.resume){R.screen='home';R.app=null;R.menu=null;R.rid=null;FV=null;UI.pop=null}saveNow();setHash();render();setStatus('ok');
  setTimeout(()=>cycle(),1500);
  if(!opt.resume&&u.group==='cashier'&&window.__canApp&&window.__canApp('pos'))setTimeout(()=>openApp('pos'),0)}
const OFFLINE_MSG=e=>/Failed to fetch|NetworkError|Load failed|net/i.test(String(e&&e.message||e))?tr('Pas de connexion Internet.','No Internet connection.'):String(e&&e.message||e);
function ensureEmpCloud(u){const em=nrm(u.login);let e=(u.emp&&D.get('employee',u.emp))||D.all('employee').find(x=>nrm(x.email)===em);
  if(!e){e=D.create('employee',{name:u.name,email:u.login},{silent:true})}u.emp=e.id;return e.id}
function forceOut(msg){READY=false;ST.auth=false;ST.uid=null;saveSes(null);UI.modal=null;const c=CL();c.view=null;c.err=msg||'';c.pw='';R.screen='home';R.app=null;saveNow();setHash();render()}
async function afterAuth(opt){const c=CL();let p=null;try{p=await getProfile()}catch(e){c.err=OFFLINE_MSG(e);return false}
  if(!p){c.err=tr('Profil introuvable. Réessayez.','Profile not found. Try again.');return false}
  PROFILE=p;sj(K.prof,p);
  if(!p.approved){c.view='wait';pollWait();return true}
  await enter(p,opt);return true}

/* ---------- démarrage ---------- */
const b0=window.__pro4Boot;window.__pro4Boot=function(){b0&&b0();SES=SES||loadSes();
  if(ST.auth&&!SES){ST.auth=false;ST.uid=null}
  if(SES&&!ST.auth)CL().view='boot';
  if(HASHKIND==='recovery'&&SES){CL().view='newpw'}
  if(HASHKIND&&HASHKIND.indexOf('error:')===0){CL().err=HASHKIND.slice(6)}
  setTimeout(bootCloud,0)};
async function bootCloud(){
  const c=CL();
  if(!SES){if(c.view==='boot')c.view=null;render();return}
  if(c.view==='newpw'){render();return}
  if(SES.expires_at<Date.now()){try{await refresh()}catch(e){}}
  if(SES&&!SES.uid){try{const ur=await api('/auth/v1/user');if(ur.ok&&ur.json&&ur.json.id){SES.uid=ur.json.id;SES.email=ur.json.email;const m=ur.json.user_metadata||{};SES.name=m.full_name||m.name||'';saveSes(SES,keepFlag())}}catch(e){}}
  let p=null,netFail=false;
  try{p=await getProfile()}catch(e){netFail=true}
  if(!SES){c.view=null;ST.auth=false;render();return}
  if(netFail){const cached=lj(K.prof,null);
    if(cached&&cached.approved&&ST.pro&&ST.pro.setup&&ST.auth){PROFILE=cached;OFFLINE=true;READY=true;startTimers();c.view=null;render();setStatus('off',scan().length);setTimeout(()=>cycle(),4000);return}
    c.view=null;c.err=tr('Pas de connexion Internet.','No Internet connection.');render();return}
  if(!p){c.view=null;saveSes(null);ST.auth=false;render();return}
  PROFILE=p;sj(K.prof,p);
  if(!p.approved){ST.auth=false;c.view='wait';render();pollWait();return}
  await enter(p,{resume:ST.auth})}
function pollWait(){clearTimeout(pollWait.t);pollWait.t=setTimeout(async()=>{const c=CL();if(c.view!=='wait'||!SES)return;try{const p=await getProfile();if(p&&p.approved){c.view=null;await enter(p)}else pollWait()}catch(e){pollWait()}},6000)}

/* ---------- écrans ---------- */
const brand='<div style="text-align:center"><span class="brand" style="margin:0;font-size:1.3rem;letter-spacing:.3em"><i class="brand-mark"></i>VELUME</span></div>';
const fx='<div class="bgfx" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>';
const seg=()=>'<div class="seg" style="justify-self:center" role="group"><button data-a="lang" data-l="fr" aria-pressed="'+(LANG==='fr')+'">Français</button><button data-a="lang" data-l="en" aria-pressed="'+(LANG==='en')+'">English</button></div><div style="justify-self:center">'+window.__deviceHtml()+'</div>';
const field=(k,label,type,extra)=>'<div class="lf"><label for="cl-'+k+'">'+label+'</label><input id="cl-'+k+'" name="'+({email:'email',pw:'password'}[k]||k)+'" data-cl="'+k+'" type="'+(type||'text')+'" value="'+esc(CL()[k]||'')+'" '+(extra||'')+'></div>';
const gbtn=()=>'<div class="or">'+tr('ou','or')+'</div><div class="soc"><button type="button" data-a="cl-google"><b style="background:#ea4335">G</b>'+tr('Continuer avec Google','Continue with Google')+'</button></div>';
const errBox=()=>CL().err?'<div class="lerr" role="alert">'+esc(CL().err)+'</div>':'';
const infoBox=()=>CL().info?'<p class="muted" style="text-align:center;margin:0">'+esc(CL().info)+'</p>':'';
const card=body=>'<div class="login">'+fx+'<div class="lcard">'+brand+body+'</div></div>'+(UI.modal?modalHtml():'');
function viewHtml(){const c=CL(),v=c.view;
  const busy=c.busy?' disabled':'';
  if(v==='boot')return card('<p class="muted" style="text-align:center">'+esc(c.info||tr('Connexion…','Signing in…'))+'</p><div class="vspin" aria-hidden="true"></div>');
  if(v==='wait')return card('<h2 style="margin:0;text-align:center;font-family:var(--fd);font-size:1.15rem">'+tr('Compte en attente','Account pending')+'</h2><p class="muted" style="text-align:center">'+tr('Votre compte est créé. L’administrateur doit l’approuver avant que vous puissiez entrer. Cette page se met à jour toute seule.','Your account is created. The administrator must approve it before you can enter. This page updates by itself.')+'</p>'+errBox()+'<button class="btn pri" data-a="cl-check">'+tr('Vérifier maintenant','Check now')+'</button><button class="btn" data-a="cl-out">'+tr('Se déconnecter','Sign out')+'</button>'+seg());
  if(v==='newpw')return card('<h2 style="margin:0;text-align:center;font-family:var(--fd);font-size:1.15rem">'+tr('Nouveau mot de passe','New password')+'</h2><form id="clform" style="display:contents">'+field('pw',tr('Nouveau mot de passe (6 min.)','New password (min. 6)'),'password','autocomplete="new-password"')+errBox()+'<button class="btn pri" type="submit"'+busy+'>'+tr('Enregistrer','Save')+'</button></form>');
  if(v==='forgot')return card('<h2 style="margin:0;text-align:center;font-family:var(--fd);font-size:1.15rem">'+tr('Mot de passe oublié','Forgot password')+'</h2><p class="muted" style="text-align:center;margin:0">'+tr('Entrez votre e-mail : vous recevrez un lien pour choisir un nouveau mot de passe.','Enter your e-mail: you will receive a link to choose a new password.')+'</p><form id="clform" style="display:contents">'+field('email',tr('E-mail','E-mail'),'email','autocomplete="username" autocapitalize="none"')+errBox()+infoBox()+'<button class="btn pri" type="submit"'+busy+'>'+tr('Envoyer le lien','Send link')+'</button></form><button class="btn" data-a="cl-view" data-v="login">'+tr('Retour','Back')+'</button>');
  if(v==='signup')return card('<h2 style="margin:0;text-align:center;font-family:var(--fd);font-size:1.15rem">'+tr('Créer mon compte','Create my account')+'</h2><p class="muted" style="text-align:center;margin:0;font-size:.88rem">'+tr('Pour rejoindre l’entreprise. Avec un code d’invitation, vous entrez tout de suite ; sans code, l’administrateur doit approuver votre compte.','To join the business. With an invitation code you get in right away; without one, the administrator must approve your account.')+'</p><form id="clform" style="display:contents">'+field('name',tr('Nom complet','Full name'),'text','autocomplete="name"')+field('email',tr('E-mail','E-mail'),'email','autocomplete="username" autocapitalize="none"')+field('pw',tr('Mot de passe (6 caractères min.)','Password (min. 6 chars)'),'password','autocomplete="new-password"')+field('code',tr('Code d’invitation (facultatif)','Invitation code (optional)'),'text','autocapitalize="characters" placeholder="VLM-XXXXX"')+errBox()+'<button class="btn pri" type="submit"'+busy+'>'+tr('Créer mon compte','Create my account')+'</button></form>'+gbtn()+'<button class="btn" data-a="cl-view" data-v="login">'+tr('J’ai déjà un compte','I already have an account')+'</button>'+seg());
  if(v==='claim'){const ow=D.all('user').find(u=>u.owner);return card('<h2 style="margin:0;text-align:center;font-family:var(--fd);font-size:1.15rem">'+tr('Activer le serveur','Enable the server')+'</h2><p class="muted" style="margin:0">'+tr('Cet appareil contient déjà votre entreprise. Créez le compte administrateur principal en ligne : toutes les données de cet appareil seront envoyées sur le serveur et partagées avec vos autres appareils.','This device already holds your business. Create the main administrator account online: all data on this device will be sent to the server and shared with your other devices.')+'</p><form id="clform" style="display:contents">'+field('name',tr('Nom complet','Full name'),'text','autocomplete="name"')+field('email',tr('E-mail','E-mail'),'email','autocomplete="username" autocapitalize="none"')+field('pw',tr('Mot de passe (6 caractères min.)','Password (min. 6 chars)'),'password','autocomplete="new-password"')+errBox()+'<button class="btn pri" type="submit"'+busy+'>'+tr('Activer et envoyer mes données','Enable and upload my data')+'</button></form><button class="btn" data-a="cl-view" data-v="login">'+tr('Retour','Back')+'</button>')}
  /* connexion */
  const hasLocal=ST.pro&&ST.pro.setup&&D.all('user').some(u=>u.owner&&!u.sb);
  return card('<h2 style="margin:0;text-align:center;font-family:var(--fd);font-size:1.15rem">'+tr('Se connecter','Sign in')+'</h2><p class="muted" style="margin:-6px 0 0;text-align:center;font-size:.88rem">'+tr('Entrez votre e-mail et votre mot de passe.','Enter your e-mail and password.')+'</p><form id="clform" style="display:contents">'+field('email',tr('E-mail','E-mail'),'email','autocomplete="username" autocapitalize="none"')+field('pw',tr('Mot de passe','Password'),'password','autocomplete="current-password"')+'<label class="keep"><input type="checkbox" id="cl-keep"'+(c.keep!==false?' checked':'')+'> '+tr('Rester connecté sur cet appareil','Stay signed in on this device')+'</label>'+errBox()+'<button class="btn pri" type="submit"'+busy+'>'+tr('Se connecter','Sign in')+'</button></form><a href="#" data-a="cl-view" data-v="forgot" style="text-align:center;font-size:.88rem;color:var(--teal)">'+tr('Mot de passe oublié ?','Forgot password?')+'</a>'+gbtn()+'<div class="or">'+tr('Nouveau ici ?','New here?')+'</div><button class="btn" data-a="cl-view" data-v="signup">'+tr('Créer mon compte','Create my account')+'</button>'+(hasLocal?'<button class="btn" data-a="cl-view" data-v="claim">'+tr('Activer le serveur avec les données de cet appareil','Enable the server with this device’s data')+'</button>':'')+seg())}
{const l0=loginHtml;loginHtml=function(){
  const c=CL();
  if(c.view)return viewHtml();
  if(!(ST.pro&&ST.pro.setup)){
    if(UI.who==='employee'){c.view='login';return viewHtml()}
    return l0().replace(/<div class="prov">[\s\S]*?<\/div>(?:<p class="muted"[^>]*>[\s\S]*?<\/p>)?/,'')}
  return viewHtml()}}
A['cl-view']=el=>{const c=CL();c.view=el.dataset.v;c.err='';c.info='';if(c.view==='claim'){const ow=D.all('user').find(u=>u.owner);if(ow){c.name=c.name||ow.name;if(okMail(ow.login))c.email=ow.login}}render()};
{const w0=A.who;A.who=function(el){const r=w0.apply(this,arguments);if(el.dataset.w==='employee'){CL().view='login';CL().err='';render()}return r}}
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&el.dataset.cl&&UI.cl)UI.cl[el.dataset.cl]=el.value});
document.addEventListener('change',e=>{const el=e.target;if(el.id==='cl-keep'&&UI.cl){UI.cl.keep=el.checked;ls(K.keep,el.checked?'1':'0')}});
document.addEventListener('submit',e=>{if(e.target&&e.target.id==='clform'){e.preventDefault();const c=CL();({login:'cl-login',signup:'cl-signup',forgot:'cl-forgot',claim:'cl-claim',newpw:'cl-newpw'}[c.view]||'cl-login')&&A[({login:'cl-login',signup:'cl-signup',forgot:'cl-forgot',claim:'cl-claim',newpw:'cl-newpw'}[c.view]||'cl-login')]()}});
const mapAuth=r=>{const m=String(errText(r));
  if(/invalid_credentials|Invalid login/i.test(m))return tr('E-mail ou mot de passe incorrect.','Wrong e-mail or password.');
  if(/already registered|already_exists|user_already/i.test(m))return tr('Cet e-mail a déjà un compte : connectez-vous.','This e-mail already has an account: sign in.');
  if(/email_not_confirmed|not confirmed/i.test(m))return tr('E-mail non confirmé. L’administrateur doit désactiver « Confirm email » dans Supabase.','E-mail not confirmed. The administrator must disable “Confirm email” in Supabase.');
  if(/password/i.test(m)&&/6|short|weak/i.test(m))return tr('Mot de passe : 6 caractères minimum.','Password: 6 characters minimum.');
  if(/rate|too many|over_email/i.test(m))return tr('Trop de tentatives. Patientez quelques minutes.','Too many attempts. Please wait a few minutes.');
  return m};
const guard=async(fn)=>{const c=CL();if(c.busy)return;c.busy=true;c.err='';c.info='';render();try{await fn(c)}catch(e){c.err=OFFLINE_MSG(e)}c.busy=false;render()};
A['cl-login']=()=>guard(async c=>{const email=nrm(c.email);if(!okMail(email)||!c.pw){c.err=tr('E-mail et mot de passe requis.','E-mail and password required.');return}
  const k=document.getElementById('cl-keep');if(k)c.keep=k.checked;ls(K.keep,c.keep===false?'0':'1');
  const r=await sb.signIn(email,c.pw);if(!r.ok){c.err=mapAuth(r);return}
  try{if(window.PasswordCredential&&navigator.credentials&&navigator.credentials.store)navigator.credentials.store(new PasswordCredential({id:email,password:c.pw,name:email}))}catch(e){}
  saveSes(normSes(r.json),c.keep!==false);ls(K.last,email);await afterAuth();try{window.__bioOffer&&window.__bioOffer()}catch(e){}});
A['cl-signup']=()=>guard(async c=>{const email=nrm(c.email),name=(c.name||'').trim();
  if(!name||!okMail(email)){c.err=tr('Nom et e-mail valide requis.','Name and a valid e-mail are required.');return}
  if((c.pw||'').length<6){c.err=tr('Mot de passe : 6 caractères minimum.','Password: 6 characters minimum.');return}
  const r=await sb.signUp(email,c.pw,name);if(!r.ok){c.err=mapAuth(r);return}
  if(!r.json||!r.json.access_token){c.err=tr('Compte créé, mais l’e-mail doit être confirmé. L’administrateur doit désactiver « Confirm email » dans Supabase.','Account created, but the e-mail must be confirmed. The administrator must disable “Confirm email” in Supabase.');return}
  saveSes(normSes(r.json),c.keep!==false);ls(K.last,email);
  const code=(c.code||'').trim();
  if(code){const rr=await sb.rpc('redeem_invite',{c:code});if(!rr.ok){c.err=rpcErr(rr)+' '+tr('Votre compte attend l’approbation de l’administrateur.','Your account is waiting for administrator approval.')}}
  const okA=await afterAuth();if(c.view==='wait'&&c.err){/* garder le message */}
  c.pw=''});
A['cl-forgot']=()=>guard(async c=>{const email=nrm(c.email);if(!okMail(email)){c.err=tr('E-mail valide requis.','A valid e-mail is required.');return}
  const r=await sb.recover(email);if(!r.ok){c.err=mapAuth(r);return}c.info=tr('Si cet e-mail a un compte, un lien vient d’être envoyé. Vérifiez aussi les courriers indésirables.','If this e-mail has an account, a link has been sent. Check your spam folder too.')});
A['cl-newpw']=()=>guard(async c=>{if((c.pw||'').length<6){c.err=tr('Mot de passe : 6 caractères minimum.','Password: 6 characters minimum.');return}
  const r=await sb.setPassword(c.pw);if(!r.ok){c.err=mapAuth(r);return}c.pw='';c.view=null;toast(tr('Mot de passe modifié.','Password changed.'));await afterAuth()});
A['cl-check']=async()=>{const c=CL();try{const p=await getProfile();if(p&&p.approved){c.view=null;await enter(p)}else{c.err=tr('Pas encore approuvé.','Not approved yet.');render()}}catch(e){c.err=OFFLINE_MSG(e);render()}};
A['cl-out']=()=>{saveSes(null);CL().view=null;CL().err='';render()};
A['cl-google']=()=>{const c=CL();ls(K.keep,c.keep===false?'0':'1');location.href=CFG.url+'/auth/v1/authorize?provider=google&redirect_to='+enc(location.origin+location.pathname)};
A['cl-claim']=()=>guard(async c=>{const email=nrm(c.email),name=(c.name||'').trim();
  if(!name||!okMail(email)){c.err=tr('Nom et e-mail valide requis.','Name and a valid e-mail are required.');return}
  if((c.pw||'').length<6){c.err=tr('Mot de passe : 6 caractères minimum.','Password: 6 characters minimum.');return}
  let r=await sb.signUp(email,c.pw,name);
  if(!r.ok&&/already|exists/i.test(errText(r)))r=await sb.signIn(email,c.pw);
  if(!r.ok){c.err=mapAuth(r);return}
  if(!r.json||!r.json.access_token){c.err=tr('Désactivez « Confirm email » dans Supabase puis réessayez.','Disable “Confirm email” in Supabase then try again.');return}
  saveSes(normSes(r.json),true);
  const rr=await sb.rpc('bootstrap_owner');
  if(!rr.ok&&!/already_initialized/.test(errText(rr))){c.err=rpcErr(rr);saveSes(null);return}
  if(!rr.ok){const p0=await getProfile();if(!p0||!p0.is_owner){c.err=rpcErr(rr)+' '+tr('Utilisez « Se connecter » avec votre compte, ou demandez un accès à l’administrateur.','Use “Sign in” with your account, or ask the administrator for access.');saveSes(null);return}}
  const p=await getProfile();const ow=D.all('user').find(u=>u.owner);if(ow){ow.sb=p.id;ow.login=email;ow.name=name;ow.code=''}
  ls(K.last,email);saveNow();
  await enter(p,{owner:true})});

/* ---------- création de l'entreprise (assistant) ---------- */
async function ownerCreate(w,session){ /* w : réponses de l'assistant ; session : déjà connecté (Google) */
  let p=null;
  if(!session){const r=await sb.signUp(nrm(w.email),w.code,w.name.trim());
    if(!r.ok)throw new Error(mapAuth(r));
    if(!r.json||!r.json.access_token)throw new Error(tr('Désactivez « Confirm email » dans Supabase (Authentication › Sign In / Providers › Email), puis réessayez.','Disable “Confirm email” in Supabase (Authentication › Sign In / Providers › Email), then try again.'));
    saveSes(normSes(r.json),true)}
  const rr=await sb.rpc('bootstrap_owner');
  if(!rr.ok){const m=rpcErr(rr);if(/already_initialized|existe déjà|already exists/.test(String(errText(rr))+m)){saveSes(null);throw new Error(tr('Une entreprise existe déjà sur ce serveur. Choisissez « Je suis employé » pour la rejoindre.','A business already exists on this server. Choose “I’m an employee” to join it.'))}throw new Error(m)}
  p=await getProfile();return p}
{A['wz-done']=async function(){
  const w=UI.wz;if(!w)return;if(w.busy)return;w.busy=true;w.err='';render();
  try{
    const p=await ownerCreate(w,false);
    w.demo=false;window.__wzDoneLocal(); /* crée l'entreprise localement (données de départ, compte administrateur) */
    const ow=D.all('user').find(u=>u.owner);if(ow){ow.sb=p.id;ow.login=nrm(w.email);ow.code=''}
    ls(K.last,nrm(w.email));saveNow();
    await enter(p,{owner:true});
  }catch(e){const ww=UI.wz||WZ_();ww.busy=false;ww.err=OFFLINE_MSG(e);return render()}
  if(UI.wz)UI.wz.busy=false}}
const WZ_=()=>UI.wz||(UI.wz={step:1,company:'',address:'',city:'Douala',niu:'',phone:'',cafe:true,studio:true,name:'',email:'',code:'',code2:'',demo:false,err:''});
window.__wzDoneLocal=function(){const w=UI.wz;if(!w)return;
  /* version locale de l'assistant (sans ré-ouvrir la clé de récupération) */
  const emp=D.create('employee',{name:w.name.trim(),email:nrm(w.email)},{silent:true});
  const u=D.create('user',{name:w.name.trim(),login:nrm(w.email),code:'',group:'admin',owner:true,lang:LANG,active:true,emp:emp.id},{silent:true});
  ST.set.company=(w.company||'').trim();ST.set.address=[(w.address||'').trim(),(w.city||'').trim()].filter(Boolean).join(', ');ST.set.niu=(w.niu||'').trim();ST.set.co_phone=(w.phone||'').trim();
  const cats=[];if(w.cafe)cats.push('Boissons chaudes','Boissons froides','Pâtisserie','Plats');if(w.studio)cats.push('Studio photo','Studio podcast','Studio vidéo');
  cats.forEach((n,i)=>D.create('pcat',{name:n,seq:i*10},{silent:true}));
  if(w.studio)['Studio photo','Studio podcast','Studio vidéo'].forEach(n=>D.create('rentcat',{name:n},{silent:true}));
  const ch=(ST.db.channel||[])[0];if(ch)ch.members=[emp.id];
  const pc=(ST.db.poscfg||[])[0];if(pc)pc.name=(w.company||'').trim()+' · '+tr('Caisse','Register');
  ST.pro={setup:true,at:isoDT(new Date())};ST.uid=u.id;ST.me=emp.id}

/* ---------- comptes : rôles, approbation, suppression, administrateurs, invitations ---------- */
{const w0=D.write;D.write=function(m,id,v,o){
  if(m!=='user'||!READY||APPLYING)return w0.apply(this,arguments);
  const b=D.get('user',id);const before=b?{g:b.group,p:!!b.pending,a:b.active}:null;
  const r=w0.apply(this,arguments);const u=D.get('user',id);
  if(before&&u&&u.sb&&(u.group!==before.g||!!u.pending!==before.p||u.active!==before.a)){
    const approved=!u.pending&&u.active!==false;
    sb.rpc('admin_set_user',{target:u.sb,new_role:u.group,new_approved:approved}).then(x=>{if(!x.ok)toast(rpcErr(x));return pullProfiles()}).then(()=>{saveNow();renderSoon()}).catch(()=>{toast(tr('Pas de connexion : changement non enregistré.','No connection: change not saved.'));pullProfiles().catch(()=>{})})}
  return r}}
{const u0=D.unlink;D.unlink=function(m,id){
  if(m!=='user'||!READY||APPLYING)return u0.apply(this,arguments);
  const u=D.get('user',id);const sbid=u&&u.sb;const r=u0.apply(this,arguments);
  if(sbid)sb.rpc('admin_remove_user',{target:sbid}).then(x=>{if(!x.ok)toast(rpcErr(x));return pullProfiles()}).then(()=>{saveNow();renderSoon()}).catch(()=>{toast(tr('Pas de connexion : suppression non enregistrée.','No connection: deletion not saved.'));pullProfiles().catch(()=>{})});
  return r}}
A['inv-new']=async()=>{const r=(document.getElementById('invrole')||{}).value||'user';const x=await sb.rpc('create_invite',{r:r});
  if(!x.ok)return toast(rpcErr(x));ST.set.invites=(ST.set.invites||[]).concat([{code:x.json,role:r,used:false}]);INVITES_KEY='';toast(tr('Code créé : ','Code created: ')+x.json);save();render()};
MODALS.cinv={title:()=>tr('Code d’invitation','Invitation code'),body:p=>'<p>'+tr('Donnez ce code à l’employé. Il ouvre VELUME, choisit « Je suis employé », puis « Créer mon compte » et saisit ce code : il entre directement. Vous pourrez changer son rôle ensuite (Paramètres › Rôles & accès).','Give this code to the employee. They open VELUME, choose “I’m an employee”, then “Create my account” and enter this code: they get straight in. You can change their role afterwards (Settings › Roles & access).')+'</p><div class="card" style="text-align:center;font-family:monospace;font-size:1.5rem;letter-spacing:.08em"><b>'+esc(p.code)+'</b></div>',foot:()=>'<button class="btn pri" data-a="mclose">OK</button>'};
A['st3-invite']=async()=>{const x=await sb.rpc('create_invite',{r:'user'});if(!x.ok)return toast(rpcErr(x));UI.sinv='';ST.set.invites=(ST.set.invites||[]).concat([{code:x.json,role:'user',used:false}]);INVITES_KEY='';save();openModal('cinv',{code:x.json})};
A['inv-del']=async el=>{const x=await sb.rpc('delete_invite',{c:el.dataset.c});if(!x.ok)return toast(rpcErr(x));ST.set.invites=(ST.set.invites||[]).filter(i=>i.code!==el.dataset.c);INVITES_KEY='';save();render()};
{const pf0=A['pf-ok'];A['pf-ok']=async function(){const w=UI.pf;
  if(w&&(w.n1||w.n2||w.cur)){w.err='';if((w.n1||'').length<6)w.err=tr('Nouveau mot de passe : 6 caractères minimum.','New password: 6 characters minimum.');else if(w.n1!==w.n2)w.err=tr('Les mots de passe ne correspondent pas.','Passwords do not match.');
    if(w.err)return render();
    const r=await sb.setPassword(w.n1);if(!r.ok){w.err=mapAuth(r);return render()}w.n1=w.n2=w.cur='';}
  return pf0.apply(this,arguments)}}
{const lo=A.logout;A.logout=function(){READY=false;clearInterval(TIMER);TIMER=null;saveSes(null);PROFILE=null;ls(K.prof,null);UI.cl=null;return lo.apply(this,arguments)}}

/* ---------- pastille d'état + style ---------- */
{const st=document.createElement('style');st.textContent=`
.vsync{position:fixed;left:10px;bottom:8px;z-index:30;font-size:.72rem;padding:3px 9px;border-radius:99px;background:color-mix(in srgb,var(--surface) 88%,transparent);border:1px solid var(--line-2);color:var(--ink-2);display:none;pointer-events:none}
.vsync.show{display:block}.vsync.ok{color:#2f7d4f}.vsync.sync{color:var(--gold)}.vsync.off{color:#b06a00}.vsync.err{color:#b3261e}
.vspin{width:28px;height:28px;border-radius:50%;border:3px solid var(--line-2);border-top-color:var(--gold);margin:6px auto;animation:vspin .8s linear infinite}@keyframes vspin{to{transform:rotate(360deg)}}
@media print{.vsync{display:none!important}}`;document.head.appendChild(st);
  const mk=()=>{if(document.getElementById('vsync')||!document.body)return;const d=document.createElement('div');d.id='vsync';d.className='vsync';document.body.appendChild(d)};
  if(document.body)mk();else document.addEventListener('DOMContentLoaded',mk);
  setInterval(()=>{mk();const el=document.getElementById('vsync');if(el)el.classList.toggle('show',!!ST.auth&&READY)},1500)}

/* ---------- gestion / suppression de comptes ---------- */
{const meU=()=>D.all('user').find(u=>u.id===ST.uid);
const isAdm=()=>{const u=meU();return !u||u.group==='admin'};
const isOwn=()=>{const u=meU();return !u||!!u.owner};
const rl=g=>({admin:tr('Administrateur','Administrator'),manager:tr('Gérant','Manager'),cashier:tr('Caissier','Cashier'),studio:'Studio',kitchen:tr('Cuisine','Kitchen'),user:tr('Employé','Employee')}[g]||g);
function rows(){const me=meU();return D.all('user').filter(u=>u.group!=='portal'&&u.active!==false).sort((a,b)=>(b.owner?1:0)-(a.owner?1:0)||a.id-b.id).map(u=>{
  const self=me&&u.id===me.id;const can=!u.owner&&!self&&(u.group!=='admin'||isOwn());
  return '<div class="card" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px"><div style="flex:1;min-width:150px"><b>'+esc(u.name||'')+'</b>'+(self?' <span class="badge">'+tr('Vous','You')+'</span>':'')+'<br><span class="muted">'+esc(u.login||'')+'</span></div><span class="badge'+(u.owner?' gold':'')+'">'+(u.owner?tr('Principal','Main'):u.pending?tr('En attente','Pending'):rl(u.group))+'</span>'+
   (can?'<button class="btn danger sm" data-a="acc-del" data-id="'+u.id+'">'+tr('Supprimer','Delete')+'</button>':'')+(self&&!u.owner?'<button class="btn danger sm" data-a="pf-del">'+tr('Supprimer mon compte','Delete my account')+'</button>':'')+'</div>'}).join('')}
MODALS.accounts={title:()=>tr('Gérer les comptes','Manage accounts'),body:()=>'<p class="muted">'+tr('Supprimer un compte retire définitivement l’accès de la personne (elle ne pourra plus se connecter). Ses données dans l’application (factures, contacts…) sont conservées.','Deleting an account permanently removes the person’s access (they can no longer sign in). Their records in the app (invoices, contacts…) are kept.')+'</p>'+(rows()||'<p class="muted">—</p>'),foot:()=>'<button class="btn" data-a="mclose">'+tr('Fermer','Close')+'</button>'};
A['acc-open']=()=>{if(!isAdm())return toast(tr('Réservé aux administrateurs.','Reserved to administrators.'));openModal('accounts')};
A['acc-del']=el=>{const id=+el.dataset.id,u=D.get('user',id);if(!u)return;
  openModal('confirm',{msg:tr('Supprimer définitivement le compte de '+(u.name||u.login)+' ? Cette personne ne pourra plus se connecter.','Permanently delete the account of '+(u.name||u.login)+'? This person will no longer be able to sign in.'),ok:()=>{D.unlink('user',id);save();toast(tr('Compte supprimé.','Account deleted.'));setTimeout(()=>openModal('accounts'),60)}})};
{const ah=window.__adminsHtml;window.__adminsHtml=function(){let h=ah?ah():'';h=h.replace(/<button class="btn sm" data-a="adm-rm" data-id="(\d+)">/g,function(m,id){return '<button class="btn pri sm" data-a="ad-owner" data-id="'+id+'">'+tr('Transférer la propriété','Transfer ownership')+'</button>'+m});if(!isAdm())return h;
  return h+'<div class="st3o"><b>'+tr('Comptes utilisateurs','User accounts')+'</b><span class="st3d">'+tr('Voir tous les comptes et en supprimer un.','See all accounts and delete one.')+'</span><div class="r"><button class="btn sm" data-a="acc-open">'+tr('Gérer / supprimer les comptes','Manage / delete accounts')+'</button></div></div>'}}
{const pb=MODALS.pending&&MODALS.pending.body;if(pb)MODALS.pending.body=function(p){return pb.call(this,p)+'<div style="margin-top:10px"><button class="btn sm" data-a="acc-open">'+tr('Gérer / supprimer les comptes','Manage / delete accounts')+'</button></div>'}}
/* supprimer mon propre compte */
{const pb=MODALS.profile&&MODALS.profile.body;if(pb)MODALS.profile.body=function(p){let h=pb.call(this,p);const u=meU();if(!u||u.owner)return h;
  return h+'<hr><b>'+tr('Supprimer mon compte','Delete my account')+'</b><p class="muted">'+tr('Vous ne pourrez plus vous connecter avec ce compte. Cette action est définitive.','You will no longer be able to sign in with this account. This is permanent.')+'</p><button class="btn danger sm" data-a="pf-del">'+tr('Supprimer mon compte','Delete my account')+'</button>'}}
{const ao=A['ad-owner'];A['ad-owner']=function(el){if(!READY)return ao.apply(this,arguments);
  const id=+el.dataset.id,u=D.get('user',id);if(!u||!u.sb)return ao.apply(this,arguments);
  if(!meU()||!meU().owner)return toast(tr('Action réservée à l’administrateur principal.','Action reserved to the main administrator.'));
  openModal('confirm',{msg:tr('Transférer le rôle d’administrateur principal à '+u.name+' ? Vous resterez administrateur mais perdrez le droit de nommer ou retirer des administrateurs. Vous pourrez ensuite supprimer votre compte.','Transfer main administrator role to '+u.name+'? You will remain an administrator but lose the right to appoint or remove administrators. You can then delete your account.'),ok:async()=>{
    const x=await sb.rpc('transfer_owner',{target:u.sb});if(!x.ok){const m=String(errText(x));return toast(m.indexOf('transfer_owner')>=0?tr('Mettez d’abord à jour la base (fichier velume-mise-a-jour-comptes.sql).','Update the database first (velume-mise-a-jour-comptes.sql file).'):rpcErr(x))}
    await pullProfiles();saveNow();renderSoon();toast(tr('Rôle transféré.','Role transferred.'))}})}}
{const pp=popoverHtml;popoverHtml=function(){let h=pp();if(UI.pop!=='user')return h;return h.replace(/<button data-a="prof-open">[\s\S]*?<\/button>/,'')}}
A['prof-open']=()=>A.profile();
A['pf-del']=()=>{const u=meU();if(!u||u.owner)return toast(tr('L’administrateur principal ne peut pas supprimer son compte (transférez d’abord le rôle).','The main administrator cannot delete their account (transfer the role first).'));
  openModal('confirm',{msg:tr('Supprimer définitivement votre compte ? Vous serez déconnecté et ne pourrez plus revenir avec ce compte.','Permanently delete your account? You will be signed out and cannot return with this account.'),ok:async()=>{
    if(READY){const x=await sb.rpc('delete_my_account',{});if(!x.ok){const m=String(errText(x));return toast(m.indexOf('delete_my_account')>=0?tr('Mettez d’abord à jour la base (fichier velume-schema.sql).','Update the database first (velume-schema.sql file).'):rpcErr(x))}}
    else D.write('user',u.id,{active:false});
    toast(tr('Compte supprimé.','Account deleted.'));A.logout()}})};
}
window.__cloud={sync:()=>cycle(),state:()=>({READY,OFFLINE,profile:PROFILE,pending:scan().length}),scan:scan};
/* ---------- v53 : connexion par empreinte / reconnaissance faciale (WebAuthn, sur l'appareil) ---------- */
{const KB='velume.bio',KS='velume.bio.ses',KN='velume.bio.no';
const gj=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
const sj=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const b64=u=>{let s='';new Uint8Array(u).forEach(x=>s+=String.fromCharCode(x));return btoa(s)};
const unb=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
const rnd=n=>crypto.getRandomValues(new Uint8Array(n));
let AVAIL=false;
try{if(window.PublicKeyCredential&&PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable&&window.isSecureContext)PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(v=>{AVAIL=!!v;if(v&&document.querySelector('.login'))try{render()}catch(e){}}).catch(()=>{})}catch(e){}
const enabled=()=>{const b=gj(KB);return !!(b&&b.cred)};
const ready=()=>AVAIL&&enabled()&&!!gj(KS);
async function enroll(){
  const em=(SES&&SES.email)||lg(K.last)||'';const nm=(SES&&SES.name)||em;
  const cr=await navigator.credentials.create({publicKey:{challenge:rnd(32),rp:{name:'Vélume',id:location.hostname},user:{id:rnd(16),name:em||'velume',displayName:nm||'Vélume'},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required',residentKey:'discouraged'},timeout:60000,attestation:'none'}});
  if(!cr)throw new Error('cancel');
  sj(KB,{cred:b64(cr.rawId),email:em,at:Date.now()});if(SES)sj(KS,SES);try{localStorage.removeItem(KN)}catch(e){}}
function snap(){if(enabled()&&SES&&SES.refresh_token)sj(KS,SES)}
{const lo=A.logout;A.logout=function(){try{snap()}catch(e){}return lo.apply(this,arguments)}}
{const co=A['cl-out'];A['cl-out']=function(){try{snap()}catch(e){}return co.apply(this,arguments)}}
window.addEventListener('pagehide',()=>{try{snap()}catch(e){}});
setInterval(()=>{try{if(SES)snap()}catch(e){}},60000);
A['cl-wipe']=()=>openModal('confirm',{msg:tr('Les données locales de cet appareil seront effacées, puis remplacées par celles du serveur (votre entreprise en ligne). Continuer ?','This device’s local data will be erased and replaced by the server data (your online business). Continue?'),ok:()=>{hardResetLocal();const c=CL();c.wipe=false;c.err='';save();render();setTimeout(()=>A['cl-login'](),80)}});
A['bio-on']=async()=>{try{if(!AVAIL)return toast(tr('Non disponible sur cet appareil (empreinte / visage non configuré, ou navigateur incompatible).','Not available on this device (fingerprint / face not set up, or unsupported browser).'));
  await enroll();toast(tr('Activé : la prochaine fois, connectez-vous avec l’empreinte ou le visage.','Enabled: next time, sign in with fingerprint or face.'));UI.pop=null;render()}
  catch(e){try{console.warn('bio-err',e&&e.name,e&&e.message)}catch(x){}toast(tr('Activation annulée.','Activation cancelled.'))}};
A['bio-off']=()=>{sj(KB,null);sj(KS,null);toast(tr('Connexion biométrique désactivée sur cet appareil.','Biometric sign-in disabled on this device.'));UI.pop=null;render()};
A['bio-no']=()=>{try{localStorage.setItem(KN,'1')}catch(e){}closeModalSafe()};
const closeModalSafe=()=>{try{A.mclose&&A.mclose()}catch(e){}};
A['bio-login']=()=>guard(async c=>{
  const b=gj(KB),s=gj(KS);if(!b||!s){c.err=tr('Connectez-vous une fois avec votre mot de passe.','Sign in once with your password.');return}
  try{await navigator.credentials.get({publicKey:{challenge:rnd(32),rpId:location.hostname,allowCredentials:[{type:'public-key',id:unb(b.cred)}],userVerification:'required',timeout:60000}})}
  catch(e){c.err=tr('Vérification annulée ou refusée.','Verification cancelled or refused.');return}
  SES=s;let ok=false;try{ok=await refresh()}catch(e){c.err=OFFLINE_MSG(e);SES=null;return}
  if(!ok){sj(KS,null);c.err=tr('Session expirée : entrez votre mot de passe une fois, puis réactivez l’empreinte.','Session expired: enter your password once, then re-enable fingerprint.');return}
  ls(K.last,b.email||s.email||'');await afterAuth()});
window.__bioOffer=function(){try{if(!AVAIL||enabled()||localStorage.getItem(KN))return;
  openModal('confirm',{msg:tr('Voulez-vous vous connecter plus vite sur cet appareil avec votre empreinte digitale ou la reconnaissance faciale ?','Do you want to sign in faster on this device with your fingerprint or face recognition?'),ok:()=>{setTimeout(()=>A['bio-on'](),60)}});
  const ft=document.querySelector('.dlg .dft,.dlg footer');}catch(e){}};
{const l1=loginHtml;loginHtml=function(){let h=l1.apply(this,arguments);try{if(CL().wipe&&(!CL().view||CL().view==='login'))h=h.replace('<button class="btn pri" type="submit"','<button class="btn" type="button" data-a="cl-wipe">'+tr('Cet appareil ne contient rien d’important : le vider et me connecter','Nothing important on this device: clear it and sign in')+'</button><button class="btn pri" type="submit"');if(ready()&&(!CL().view||CL().view==='login'))h=h.replace('</form><a href="#" data-a="cl-view" data-v="forgot"','</form><button class="btn" type="button" data-a="bio-login" style="display:flex;align-items:center;justify-content:center;gap:8px">🔐 '+tr('Empreinte / reconnaissance faciale','Fingerprint / face recognition')+'</button><a href="#" data-a="cl-view" data-v="forgot"')}catch(e){}return h}}
{const p1=popoverHtml;popoverHtml=function(){let h=p1();if(UI.pop!=='user'||!AVAIL)return h;return h.replace('<button data-a="lock">','<button data-a="'+(enabled()?'bio-off':'bio-on')+'">🔐 '+(enabled()?tr('Désactiver l’empreinte / le visage','Disable fingerprint / face'):tr('Activer l’empreinte / le visage','Enable fingerprint / face'))+'</button><button data-a="lock">')}}
}
})();
