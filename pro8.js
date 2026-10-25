
/* =====================================================================
   v52 — Paie (inspirée d'Odoo) · Congés liés à la paie · mode de paiement
   par employé · documents dans l'onglet « Contrats »
   ===================================================================== */
{
const PAYSEL=[['om','Orange Money','Orange Money'],['momo','MTN MoMo','MTN MoMo'],['cash','Espèces','Cash'],['card','Carte bancaire','Bank card'],['bank','Virement bancaire','Bank transfer']];
const payLbl=k=>{const o=PAYSEL.find(x=>x[0]===k);return o?(LANG==='fr'?o[1]:o[2]):(k||'')};
const addF=(m,k,t,fr,en,o)=>{if(M[m]&&!M[m].f[k])M[m].f[k]=Object.assign({k:k,t:t,fr:fr,en:en},o||{})};
const first=iso0=>String(iso0||iso(new Date())).slice(0,8)+'01';
const monthEnd=ps=>new Date(ps.getFullYear(),ps.getMonth()+1,0);
const overlap=(a,b,s,e)=>{const x=pd(a),y=pd(b);if(!x||!y)return 0;const lo=x>s?x:s,hi=y<e?y:e;return hi<lo?0:Math.round((hi-lo)/864e5)+1};
const contractOf=emp=>{const cs=D.all('contract').filter(c=>c.emp===emp);return cs.find(c=>c.state==='run')||cs.sort((a,b)=>b.id-a.id)[0]||null};
const kLbl=(m,f,v)=>{const o=(M[m].f[f].opts||[]).find(x=>x[0]===v);return o?(LANG==='fr'?o[1]:o[2]):(v||'')};

/* ---------- 1. Employé : mode de paiement du salaire + documents ---------- */
addF('employee','paymode','sel','Mode de paiement du salaire','Salary payment method',{opts:PAYSEL.map(o=>o.slice()),def:'cash'});
addF('employee','paynum','char','N° Mobile Money / compte / carte','Mobile Money no. / account / card',{});
addF('employee','docs','json','Documents','Documents',{hide:1});
addF('contract','docs','json','Documents','Documents',{hide:1});

/* ---------- 2. Widget « documents » (PDF, photo, scan) ---------- */
const MAXB=1500000;
const fsz=n=>n>1048576?(n/1048576).toFixed(1)+' Mo':Math.max(1,Math.round(n/1024))+' Ko';
function docsHtml(b){const L=b.docs||[];const lock=formLocked();
  const rows=L.map((d,i)=>'<tr><td>'+ic(/^image\//.test(d.type)?'image':'file')+' <b>'+esc(d.name)+'</b></td><td class="muted">'+esc(d.date||'')+'</td><td class="muted">'+fsz(d.size||0)+'</td><td style="text-align:right;white-space:nowrap"><button class="btn sm ghost" data-a="doc-open" data-i="'+i+'">'+tr('Ouvrir','Open')+'</button>'+(lock?'':'<button class="ib" data-a="doc-del" data-i="'+i+'" aria-label="delete">'+ic('trash')+'</button>')+'</td></tr>').join('');
  return '<h3 style="margin:18px 0 6px;font-size:.95rem">'+tr('Documents du contrat','Contract documents')+'</h3>'+
    '<p class="muted" style="margin:0 0 8px;font-size:.85rem">'+tr('Contrat signé, pièce d’identité, diplômes, attestations… (PDF, photo ou scan, 1,5 Mo max par fichier).','Signed contract, ID, diplomas, certificates… (PDF, photo or scan, 1.5 MB max per file).')+'</p>'+
    (L.length?'<div class="scrollx"><table class="lv lines"><thead><tr><th>'+tr('Document','Document')+'</th><th>'+tr('Ajouté le','Added')+'</th><th>'+tr('Taille','Size')+'</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<div class="muted" style="padding:10px 0">'+tr('Aucun document pour le moment.','No document yet.')+'</div>')+
    (lock?'':'<button class="btn sec" data-a="doc-add" style="margin-top:8px">'+ic('plus')+tr('Ajouter un document','Add a document')+'</button>')}
function pushDoc(d){if(!FV)return;FV.buf.docs=(FV.buf.docs||[]).concat([d]);FV.dirty=true;if(!FV.isNew)try{saveForm({quiet:true})}catch(e){}render();toast(tr('Document ajouté','Document added'))}
function addDoc(file){
  const isImg=/^image\//.test(file.type);
  if(!isImg&&file.size>MAXB)return toast(tr('Fichier trop lourd (max 1,5 Mo) : ','File too large (max 1.5 MB): ')+file.name);
  const rd=new FileReader();
  rd.onload=()=>{
    if(!isImg)return pushDoc({id:Date.now()+Math.random(),name:file.name,type:file.type||'application/octet-stream',size:file.size,date:iso(new Date()),data:rd.result});
    const im=new Image();im.onload=()=>{const s=Math.min(1,1600/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      const u=c.toDataURL('image/jpeg',.82);if(u.length*.75>MAXB*1.4)return toast(tr('Image trop lourde : ','Image too large: ')+file.name);
      pushDoc({id:Date.now()+Math.random(),name:file.name.replace(/\.[a-z0-9]+$/i,'')+'.jpg',type:'image/jpeg',size:Math.round(u.length*.75),date:iso(new Date()),data:u})};
    im.onerror=()=>toast(tr('Image illisible : ','Unreadable image: ')+file.name);im.src=rd.result};
  rd.readAsDataURL(file)}
A['doc-add']=()=>{let e=document.getElementById('docf');if(!e){e=document.createElement('input');e.type='file';e.id='docf';e.accept='application/pdf,image/*,.doc,.docx,.xls,.xlsx';e.multiple=true;e.hidden=true;document.body.appendChild(e);e.addEventListener('change',()=>{[...e.files].forEach(addDoc);e.value=''})}e.click()};
A['doc-open']=el=>{const d=((FV&&FV.buf.docs)||[])[+el.dataset.i];if(!d)return;try{const p=d.data.split(',');const bin=atob(p[1]);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const url=URL.createObjectURL(new Blob([u],{type:d.type}));const w=window.open(url,'_blank');if(!w){const a=document.createElement('a');a.href=url;a.download=d.name;a.click()}setTimeout(()=>URL.revokeObjectURL(url),60000)}catch(e){toast(tr('Ouverture impossible.','Cannot open.'))}};
A['doc-del']=el=>{if(!FV)return;const i=+el.dataset.i;FV.buf.docs=(FV.buf.docs||[]).filter((x,k)=>k!==i);FV.dirty=true;if(!FV.isNew)try{saveForm({quiet:true})}catch(e){}render()};

/* ---------- 3. Fiche employé : onglets Contrats (+ documents) et Paie ---------- */
function empContracts(b){
  const cs=b.id&&!FV.isNew?D.all('contract').filter(c=>c.emp===b.id):[];
  const rows=cs.map(c=>'<tr><td><button class="lnk" data-a="emp-ct" data-id="'+c.id+'">'+esc(c.name)+'</button></td><td>'+esc(kLbl('contract','kind',c.kind))+'</td><td>'+esc(c.start||'')+(c.end?' → '+esc(c.end):'')+'</td><td class="r">'+money(c.wage||0)+'</td><td>'+esc(kLbl('contract','state',c.state))+'</td></tr>').join('');
  return (cs.length?'<div class="scrollx"><table class="lv lines"><thead><tr><th>'+tr('Contrat','Contract')+'</th><th>'+tr('Type','Type')+'</th><th>'+tr('Période','Period')+'</th><th class="r">'+tr('Salaire','Wage')+'</th><th>'+tr('Statut','Status')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<div class="muted" style="padding:8px 0">'+tr('Aucun contrat pour cet employé.','No contract for this employee.')+'</div>')+
    (FV.isNew?'':'<button class="btn sec" data-a="emp-ct-new" style="margin-top:8px">'+ic('plus')+tr('Nouveau contrat','New contract')+'</button>')+
    (FV.isNew?'<p class="muted">'+tr('Enregistrez l’employé pour ajouter des contrats et des documents.','Save the employee to add contracts and documents.')+'</p>':docsHtml(b))}
A['emp-ct']=el=>{try{goTo('employees','contracts',+el.dataset.id)}catch(e){}};
A['emp-ct-new']=()=>{if(!FV||FV.isNew)return;if(FV.dirty&&!saveForm({quiet:true}))return;const r=D.create('contract',{name:tr('Contrat — ','Contract — ')+(FV.buf.name||''),emp:FV.id,kind:'cdd',state:'draft'});save();goTo('employees','contracts',r.id)};
{const e=ACT.employees;if(e&&e.form){e.form.tabs=[{l:['Contrats','Contracts'],html:empContracts},{l:['Paie','Payroll'],fields:['paymode','paynum']},{l:['Notes','Notes'],fields:['note']}]}}
{const c=ACT.contracts;if(c&&c.form){c.form.tabs=[{l:['Documents','Documents'],html:b=>docsHtml(b).replace(/^<h3[^>]*>[^<]*<\/h3>/,'')}]}}

/* ---------- 4. Congés : allocations & soldes (comme Odoo) ---------- */
defModel('leavealloc','Allocations de congés','Time off allocations','emp',{
  emp:['m2o','Employé','Employee',{rel:'employee'}],
  kind:['sel','Type de congé','Time off type',{opts:M.leave.f.kind.opts.map(o=>o.slice()),def:'paid'}],
  year:['int','Année','Year',{def:()=>new Date().getFullYear()}],
  days:['float','Jours alloués','Allocated days',{def:18,unit:' j'}],
  taken:['float','Jours pris (approuvés)','Days taken (approved)',{ro:1,unit:' j'}],
  left:['float','Solde restant','Balance left',{ro:1,unit:' j'}],
  note:['text','Note','Note']},
  {chatter:false,rname:r=>D.name('employee',r.emp)+' — '+kLbl('leavealloc','kind',r.kind)+' '+(r.year||''),
   compute:r=>{r.taken=sum(D.all('leave').filter(l=>l.emp===r.emp&&l.kind===r.kind&&l.state==='ok'&&String(l.from||'').slice(0,4)===String(r.year)),l=>l.days);r.left=(+r.days||0)-r.taken}});
M.leavealloc.f.emp.req=false;
function recalcAlloc(){try{D.all('leavealloc').forEach(a=>{const t=sum(D.all('leave').filter(l=>l.emp===a.emp&&l.kind===a.kind&&l.state==='ok'&&String(l.from||'').slice(0,4)===String(a.year)),l=>l.days);if(a.taken!==t||a.left!==(+a.days||0)-t)D.write('leavealloc',a.id,{taken:t,left:(+a.days||0)-t},{silent:true})})}catch(e){}}
['write','create','unlink'].forEach(fn=>{const o=D[fn];D[fn]=function(m){const r=o.apply(this,arguments);if(m==='leave')recalcAlloc();return r}});
act('leaveallocs',{model:'leavealloc',l:['Allocations & soldes','Allocations & balances'],icon:'calendar',views:['list','graph'],list:['emp','kind','year','days','taken','left'],sum:['days','taken','left'],search:['emp'],groups:['kind','emp','year'],
  graph:{measure:'left',by:'emp',type:'bar',measures:[['left',['Solde','Balance']],['taken',['Pris','Taken']],['days',['Alloué','Allocated']]],dims:['emp','kind','year']},
  form:{title:'emp',cols:[['emp','kind','year','days'],['taken','left','note']],
    btns:[{l:['Allouer à tous les employés','Allocate to all employees'],pri:1,new:true,fn:b=>{let n=0;D.all('employee').forEach(e=>{if(D.all('leavealloc').some(a=>a.emp===e.id&&a.kind===b.kind&&String(a.year)===String(b.year)))return;D.create('leavealloc',{emp:e.id,kind:b.kind,year:b.year,days:b.days,note:b.note||''},{silent:true});n++});if(!b.emp)try{D.unlink('leavealloc',b.id)}catch(x){}save();toast(n+' '+tr('allocation(s) créée(s)','allocation(s) created'));setTimeout(()=>{FV=null;R.rid=null;render()},0)}}]},ctx:()=>({})});
/* solde affiché sur la demande de congé */
addF('leave','bal','float','Solde après cette demande','Balance after this request',{ro:1,unit:' j',hideIf:b=>b.kind!=='paid'||b.bal==null});
{const lc=M.leave.compute;M.leave.compute=function(r){if(lc)lc.apply(this,arguments);try{r.bal=null;if(r.kind==='paid'&&r.emp&&r.from){const y=String(r.from).slice(0,4);const al=D.all('leavealloc').filter(a=>a.emp===r.emp&&a.kind==='paid'&&String(a.year)===y);if(al.length){const used=sum(D.all('leave').filter(l=>l.emp===r.emp&&l.kind==='paid'&&l.state==='ok'&&l.id!==r.id&&String(l.from||'').slice(0,4)===y),l=>l.days);r.bal=sum(al,a=>a.days)-used-(+r.days||0)}}}catch(e){}}}
{const l=ACT.leaves;if(l&&l.form)l.form.cols[1].push('bal')}

/* ---------- 5. Paie à la Odoo : fiche, calcul, lots ---------- */
{const f=M.payslip.f;f.how.opts=PAYSEL.map(o=>o.slice());f.how.def='cash'}
addF('payslip','contract','m2o','Contrat','Contract',{rel:'contract'});
addF('payslip','batch','m2o','Lot de paie','Payslip batch',{rel:'paybatch',ro:1});
addF('payslip','base','money','Salaire de base (contrat)','Base salary (contract)',{def:0});
addF('payslip','wdays','float','Jours travaillés (sur 30)','Worked days (of 30)',{ro:1,unit:' j'});
addF('payslip','pl','float','Jours de congé rémunéré','Paid time-off days',{ro:1,unit:' j'});
addF('payslip','unpaid','float','Jours de congé sans solde','Unpaid time-off days',{ro:1,unit:' j'});
addF('payslip','ded','money','Retenue congés sans solde','Unpaid leave deduction',{ro:1});
addF('payslip','bonus','money','Primes / autres entrées','Bonuses / other inputs',{ro:1});
addF('payslip','inputs','lines','Autres entrées','Other inputs',{cols:[{k:'label',t:'char',fr:'Description (prime, avance, heures sup…)',en:'Description (bonus, advance, overtime…)',w:260},{k:'amt',t:'money',fr:'Montant (+ prime / − retenue)',en:'Amount (+ bonus / − deduction)',w:190}]});
M.payslip.f.gross.roIf=b=>+b.base>0;
M.payslip.f.gross.help=['Calculé automatiquement quand un salaire de base est renseigné.','Computed automatically when a base salary is set.'];
{const pc=M.payslip.compute;M.payslip.compute=function(r){try{
  r.bonus=Math.round(sum(r.inputs||[],l=>l.amt));
  const ps=pd(r.period);
  if(ps&&r.emp){const pe=monthEnd(ps);let un=0,pl=0;D.all('leave').forEach(l=>{if(l.emp!==r.emp||l.state!=='ok')return;const d=overlap(l.from,l.to,ps,pe);if(l.kind==='unpaid')un+=d;else pl+=d});
    r.unpaid=un;r.pl=pl;r.wdays=Math.max(0,30-un);r.ded=Math.round((+r.base||0)/30*un)}
  if(+r.base>0)r.gross=Math.round(+r.base+r.bonus-(r.ded||0))}catch(e){}
  return pc.apply(this,arguments)}}
function fillSlip(b){const e=D.get('employee',+b.emp);if(!e)return;if(e.paymode)b.how=e.paymode;const c=contractOf(e.id);if(c){b.contract=c.id;b.base=+c.wage||0}}
{const ab=applyBufValue;applyBufValue=function(el){const r=ab.apply(this,arguments);try{if(r&&FV&&FV.a&&FV.a.model==='payslip'&&el.dataset.fld==='emp')fillSlip(FV.buf)}catch(e){}return r}}
function salaryTable(b){const row=(l,v,neg,bold)=>'<tr'+(bold?' style="font-weight:700;border-top:2px solid var(--line)"':'')+'><td>'+l+'</td><td class="r">'+(neg&&v?'− ':'')+money(Math.abs(v||0))+'</td></tr>';
  const ps=(b.inputs||[]).map(l=>row(esc(l.label||tr('Entrée','Input')),+l.amt||0,false)).join('');
  return '<div class="scrollx"><table class="lv lines"><thead><tr><th>'+tr('Règle salariale','Salary rule')+'</th><th class="r">'+tr('Montant','Amount')+'</th></tr></thead><tbody>'+
    row(tr('Salaire de base','Base salary'),b.base)+ps+row(tr('Retenue congés sans solde ('+(b.unpaid||0)+' j)','Unpaid leave deduction ('+(b.unpaid||0)+' d)'),b.ded,true)+
    row(tr('Salaire brut','Gross salary'),b.gross,false,true)+row(tr('Retenue CNPS','CNPS withholding'),b.cnps,true)+row(tr('Autres retenues','Other deductions'),b.other,true)+
    row(tr('NET À PAYER','NET PAY')+' — '+esc(payLbl(b.how)),b.net,false,true)+'</tbody></table></div>'}
{const p=ACT.payslips;if(p){
  p.list=['name','emp','period','how','gross','cnps','other','net','state'];
  p.form.cols=[['emp','contract','period','batch','how'],['base','bonus','ded','gross','cnps','other','net']];
  p.form.tabs=[{l:['Jours travaillés','Worked days'],fields:['wdays','pl','unpaid']},{l:['Autres entrées','Other inputs'],lines:'inputs'},{l:['Calcul du salaire','Salary computation'],html:salaryTable},{l:['Notes','Notes'],fields:['note']}];
  p.form.btns=[{l:['Calculer la fiche','Compute sheet'],icon:'refresh',pri:1,new:true,when:b=>b.state==='draft',fn:b=>{const cur=D.get('payslip',b.id);if(!cur)return;const v={};const c=contractOf(cur.emp),e=D.get('employee',cur.emp);if(c){v.contract=c.id;v.base=+c.wage||0}if(e&&e.paymode)v.how=e.paymode;D.write('payslip',b.id,v);toast(tr('Fiche recalculée (contrat, congés, mode de paiement).','Sheet recomputed (contract, time off, payment method).'))}}].concat(p.form.btns)}}
/* lots de paie */
defModel('paybatch','Lots de paie','Payslip batches','name',{
  name:['char','Nom du lot','Batch name',{req:1,def:()=>tr('Paie ','Payroll ')+iso(new Date()).slice(0,7)}],
  period:['date','Mois (1er du mois)','Month (1st)',{def:()=>first(),req:1}],
  state:['sel','Statut','Status',{opts:[['draft','Brouillon','Draft',''],['done','Clôturé','Closed','good']],def:'draft'}],
  count:['int','Bulletins','Payslips',{ro:1}], total:['money','Net total à payer','Total net pay',{ro:1}]},
  {status:'state',chatter:false,compute:r=>{const s=D.all('payslip').filter(x=>x.batch===r.id);r.count=s.length;r.total=sum(s,x=>x.net)}});
function batchSlips(b){const s=b.id&&!FV.isNew?D.all('payslip').filter(x=>x.batch===b.id):[];
  if(!s.length)return '<div class="muted" style="padding:8px 0">'+tr('Aucun bulletin. Cliquez sur « Générer les bulletins ».','No payslip yet. Click “Generate payslips”.')+'</div>';
  return '<div class="scrollx"><table class="lv lines"><thead><tr><th>'+tr('Bulletin','Payslip')+'</th><th>'+tr('Employé','Employee')+'</th><th>'+tr('Mode de paiement','Payment method')+'</th><th class="r">'+tr('Net','Net')+'</th><th>'+tr('Statut','Status')+'</th></tr></thead><tbody>'+
    s.map(x=>'<tr><td>'+esc(x.name||'')+'</td><td>'+esc(D.name('employee',x.emp))+'</td><td>'+esc(payLbl(x.how))+'</td><td class="r">'+money(x.net||0)+'</td><td>'+esc(kLbl('payslip','state',x.state))+'</td></tr>').join('')+'</tbody></table></div>'}
act('paybatches',{model:'paybatch',l:['Lots de paie','Payslip batches'],icon:'receipt',views:['list'],list:['name','period','count','total','state'],sum:['total'],search:['name'],groups:['state'],
  form:{status:'state',title:'name',cols:[['period'],['count','total']],tabs:[{l:['Bulletins du lot','Batch payslips'],html:batchSlips}],
    btns:[{l:['Générer les bulletins','Generate payslips'],pri:1,when:b=>b.state==='draft',fn:b=>{const per=first(b.period);let n=0,sk=0;D.all('employee').forEach(e=>{const c=contractOf(e.id);if(!c||c.state==='expired'){sk++;return}
        if(D.all('payslip').some(p=>p.emp===e.id&&p.period===per))return;
        D.create('payslip',{emp:e.id,period:per,batch:b.id,contract:c.id,base:+c.wage||0,how:e.paymode||'cash',inputs:[],state:'draft'},{silent:true});n++});
        save();toast(n+' '+tr('bulletin(s) généré(s)','payslip(s) generated')+(sk?' · '+sk+' '+tr('employé(s) sans contrat en cours ignoré(s)','employee(s) without active contract skipped'):''))}},
      {l:['Clôturer le lot','Close batch'],when:b=>b.state==='draft',set:{state:'done'}},{l:['Rouvrir','Reopen'],when:b=>b.state==='done',set:{state:'draft'}}]},ctx:()=>({})});
/* menus */
{const pa=APPS.find(a=>a.id==='payroll');if(pa&&!pa.menus.some(m=>m.id==='pa_b')){const i=pa.menus.findIndex(m=>m.id==='pa_m');pa.menus.splice(i+1,0,M_('pa_b',['Lots de paie','Payslip batches'],'paybatches'),M_('pa_ct',['Contrats','Contracts'],'contracts'))}}
{const to=APPS.find(a=>a.id==='timeoff');if(to&&!to.menus.some(m=>m.id==='to_al')){const i=to.menus.findIndex(m=>m.id==='to_l');to.menus.splice(i+1,0,M_('to_al',['Allocations & soldes','Allocations & balances'],'leaveallocs'))}}
/* l'application Congés est installée par défaut (une seule fois) */
{const pb=window.__pro4Boot;window.__pro4Boot=function(){try{if(ST.set&&!ST.set.v52){ST.set.v52=1;ST.installed=ST.installed||{};ST.installed.timeoff=true;save()}}catch(e){}return pb&&pb.apply(this,arguments)}}

/* ---------- v52b : Vue d'ensemble RH (tableau de bord simple) ---------- */
{const todayS=()=>iso(new Date());
A['hr-go']=el=>{try{goTo(el.dataset.app,el.dataset.act)}catch(e){}};
const btn=(app,act,label,pri)=>'<button class="btn '+(pri?'pri':'sec')+'" data-a="hr-go" data-app="'+app+'" data-act="'+act+'">'+label+'</button>';
CUSTOM.hrdash=function(){
  const per=first(todayS()),emps=D.all('employee'),today=todayS();
  const sl=D.all('payslip').filter(s=>s.period===per);
  const toPay=sl.filter(s=>s.state==='ok'),draft=sl.filter(s=>s.state==='draft'),paid=sl.filter(s=>s.state==='paid');
  const lv=D.all('leave'),pend=lv.filter(l=>l.state==='sub');
  const off=lv.filter(l=>l.state==='ok'&&l.from<=today&&l.to>=today);
  const in30=iso(addDays(new Date(),30));
  const endSoon=D.all('contract').filter(c=>c.state!=='expired'&&c.end&&c.end>=today&&c.end<=in30);
  const noCt=emps.filter(e=>!contractOf(e.id));
  const by={};PAYSEL.forEach(o=>by[o[0]]={n:0,net:0});
  emps.forEach(e=>{const k=by[e.paymode]?e.paymode:'cash';by[k].n++});
  sl.forEach(s=>{const k=by[s.how]?s.how:'cash';by[k].net+=(+s.net||0)});
  const kp=(l,v,c)=>'<div class="kpi"><span>'+l+'</span><b'+(c?' style="color:'+c+'"':'')+'>'+v+'</b></div>';
  const row=(a,b)=>'<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--line)"><span>'+a+'</span><b>'+b+'</b></div>';
  const todo=[];
  if(pend.length)todo.push(row('🌴 '+pend.length+' '+tr('demande(s) de congé à approuver','time-off request(s) to approve'),btn('timeoff','leaves',tr('Voir','Open'))));
  if(draft.length)todo.push(row('📝 '+draft.length+' '+tr('bulletin(s) à valider','payslip(s) to validate'),btn('payroll','payslips',tr('Voir','Open'))));
  if(toPay.length)todo.push(row('💸 '+toPay.length+' '+tr('bulletin(s) à payer','payslip(s) to pay')+' · '+money(sum(toPay,s=>s.net)),btn('payroll','payslips',tr('Payer','Pay'))));
  if(endSoon.length)todo.push(row('📄 '+endSoon.length+' '+tr('contrat(s) se termine(nt) sous 30 jours','contract(s) ending within 30 days'),btn('employees','contracts',tr('Voir','Open'))));
  if(noCt.length)todo.push(row('⚠️ '+noCt.length+' '+tr('employé(s) sans contrat','employee(s) without contract'),btn('employees','contracts',tr('Créer','Create'))));
  if(!sl.length&&emps.length)todo.push(row('🗓️ '+tr('Aucun bulletin ce mois-ci','No payslip this month'),btn('payroll','paybatches',tr('Générer la paie','Run payroll'),1)));
  return pageHead(tr('Ressources humaines — vue d’ensemble','Human resources — overview'),btn('employees','employees',tr('Employés','Employees'))+btn('payroll','paybatches',tr('Lancer la paie','Run payroll'),1))+
  '<div class="va gut"><div class="kpis">'+kp(tr('Employés','Employees'),emps.length)+kp(tr('En congé aujourd’hui','On leave today'),off.length)+kp(tr('Congés à approuver','Leave to approve'),pend.length,pend.length?'var(--warn)':'')+kp(tr('Masse salariale du mois','Payroll this month'),money(sum(sl,s=>s.gross)))+kp(tr('Net à payer','Net to pay'),money(sum(toPay.concat(draft),s=>s.net)))+kp(tr('Déjà payé','Already paid'),money(sum(paid,s=>s.net)),'var(--good)')+'</div>'+
  '<div class="grid2"><div class="card"><h3>'+tr('À faire','To do')+'</h3>'+(todo.length?todo.join(''):'<p class="muted">'+tr('Rien en attente. Tout est à jour 👍','Nothing pending. All up to date 👍')+'</p>')+'</div>'+
  '<div class="card"><h3>'+tr('Paiement des salaires par mode','Salary payment by method')+'</h3>'+PAYSEL.map(o=>row(esc(payLbl(o[0]))+' <span class="muted">· '+by[o[0]].n+' '+tr('employé(s)','employee(s)')+'</span>',by[o[0]].net?money(by[o[0]].net):'—')).join('')+'<p class="muted" style="margin:8px 0 0;font-size:.85rem">'+tr('Le mode se choisit sur la fiche de chaque employé, onglet « Paie ».','Choose the method on each employee, “Payroll” tab.')+'</p></div></div>'+
  '<div class="card" style="margin-top:12px"><h3>'+tr('Accès rapides','Quick links')+'</h3><div style="display:flex;flex-wrap:wrap;gap:8px">'+btn('employees','employees',tr('👥 Employés','👥 Employees'))+btn('employees','contracts',tr('📄 Contrats & documents','📄 Contracts & documents'))+btn('timeoff','leaves',tr('🌴 Demandes de congé','🌴 Time off requests'))+btn('timeoff','leaveallocs',tr('📊 Soldes de congés','📊 Leave balances'))+btn('payroll','payslips',tr('🧾 Bulletins de paie','🧾 Payslips'))+btn('payroll','paybatches',tr('🗂️ Lots de paie','🗂️ Payslip batches'))+'</div></div></div>'};
[['payroll','pa_m','pa_dash'],['employees','e_main','e_dash'],['timeoff','to_m','to_dash']].forEach(x=>{const a=APPS.find(z=>z.id===x[0]);if(a&&!a.menus.some(m=>m.id===x[2]))a.menus.unshift(M_(x[2],['Vue d’ensemble','Overview'],null,{cus:'hrdash'}))});
}
}
