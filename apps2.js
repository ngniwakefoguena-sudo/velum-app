/* ===== apps2 : catalogue Apps façon Odoo + nouvelles applications VELUME ===== */
(function(){
const _st=document.createElement('style');_st.textContent=`
.ap2side h4{font-size:.74rem;letter-spacing:.06em;margin:14px 0 6px;color:var(--ink-2);display:flex;align-items:center;gap:6px}
.ap2side h4::before{content:"";width:3px;height:12px;background:var(--gold);border-radius:2px}
.ap2side button{font-size:.92rem}
.ap2side button.sub{padding-left:18px}
.ap2grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(min(100%,290px),1fr));align-content:start}
.appcat:has(.ap2side){grid-template-columns:236px minmax(0,1fr)}
.ap2side button{white-space:normal;text-align:left;gap:8px}
.ap2b .btn.sm{padding:2px 9px;font-size:.8rem;min-height:28px}
.ap2c{position:relative;display:flex;gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:12px;min-width:0;transition:box-shadow .15s,transform .15s}
.ap2c:hover{box-shadow:var(--shadow);transform:translateY(-1px)}
.ap2i{width:50px;height:50px;border-radius:12px;display:grid;place-items:center;color:var(--k);background:color-mix(in srgb,var(--k) 14%,var(--surface));flex:none}
.ap2i svg{width:30px;height:30px;stroke-width:1.6;fill:color-mix(in srgb,var(--k) 20%,transparent)}
.ap2m{min-width:0;flex:1;display:flex;flex-direction:column;gap:3px}
.ap2m b{font-size:.95rem;overflow-wrap:anywhere;padding-right:22px}
.ap2m p{font-size:.78rem;color:var(--ink-2);line-height:1.3;min-height:30px}
.ap2b{margin-top:6px;display:flex;gap:6px;flex-wrap:wrap}
.ap2dot{position:absolute;right:4px;top:4px;width:26px;height:26px}
.ap2n{display:inline-block;font-size:.66rem;font-weight:700;background:var(--gold-soft);color:var(--gold-ink);border-radius:999px;padding:0 7px;margin-left:5px;vertical-align:middle;letter-spacing:.03em}
.ap2ok{font-size:.7rem;color:var(--good);font-weight:700}
.ap2list td,.ap2list th{white-space:normal}
.ap2list .ap2i{width:34px;height:34px;border-radius:8px}
.ap2list .ap2i svg{width:20px;height:20px}
.ap2info{display:flex;gap:16px;align-items:flex-start}
.ap2info .ap2i{width:72px;height:72px;border-radius:16px}
.ap2info .ap2i svg{width:40px;height:40px}
.ap2kv{display:grid;grid-template-columns:130px minmax(0,1fr);gap:6px 12px;margin-top:12px;font-size:.9rem}
.ap2kv span:nth-child(odd){color:var(--ink-2);font-weight:600}
.ap2seg{display:flex;gap:6px;flex-wrap:wrap}
@media (max-width:820px){.ap2side{display:flex;overflow-x:auto;gap:4px;align-items:center}.ap2side h4{display:none}.ap2side button{width:auto;flex:none;gap:8px}}
`;document.head.appendChild(_st);

/* ---------- nouveaux modèles ---------- */
const yrr=()=>new Date().getFullYear();
defModel('saleorder','Commandes clients','Sales orders','name',{
  name:['char','Référence','Reference',{ro:1}], customer:['m2o','Client','Customer',{rel:'partner',req:1}],
  date:['date','Date du devis','Quotation date',{def:()=>iso(new Date())}], valid:['date','Validité du devis','Quotation expires'],
  state:['sel','Statut','Status',{opts:[['draft','Devis','Quotation',''],['sent','Devis envoyé','Quotation sent','info'],['sale','Commande client','Sales order','warn'],['inv','Facturé','Invoiced','good'],['cancel','Annulé','Cancelled','bad']],def:'draft'}],
  lines:['lines','Lignes de commande','Order lines',{cols:[{k:'item',t:'m2o',rel:'product',fr:'Produit',en:'Product',w:230},{k:'qty',t:'float',fr:'Quantité',en:'Quantity',def:1,w:90},{k:'price',t:'money',fr:'Prix unitaire HT',en:'Unit price (excl.)',w:120},{k:'sub',t:'money',fr:'Montant HT',en:'Amount (excl.)',ro:1}]}],
  ht:['money','Total HT','Total (excl.)',{ro:1}], ttc:['money','Total TTC','Total (incl.)',{ro:1}],
  invoice:['m2o','Facture','Invoice',{rel:'invoice',ro:1}], note:['text','Conditions','Terms']},
  {status:'state',seqfield:'name',seqname:r=>'S'+yrr()+'/'+p4(r.id),
   compute:r=>{(r.lines||[]).forEach(l=>{l.sub=Math.round((+l.qty||0)*(+l.price||0))});r.ht=sum(r.lines||[],l=>l.sub);r.ttc=r.ht+Math.round(r.ht*TVA()/100)},
   lines_on:(b,row,k)=>{if(k==='item'){const p=D.get('product',+row.item);if(p)row.price=Math.round((+p.price||0)/(1+TVA()/100))}}});

defModel('leave','Demandes de congés','Time off requests','name',{
  name:['char','Description','Description',{def:()=>tr('Congé','Time off')}], emp:['m2o','Employé','Employee',{rel:'employee',def:()=>ST.me,req:1}],
  kind:['sel','Type de congé','Time off type',{opts:[['paid','Congé payé','Paid time off','good'],['sick','Maladie','Sick leave','warn'],['unpaid','Sans solde','Unpaid',''],['fam','Événement familial','Family event','info'],['mat','Maternité / paternité','Maternity / paternity','gold']],def:'paid'}],
  from:['date','Du','From',{def:()=>iso(new Date()),req:1}], to:['date','Au','To',{def:()=>iso(addDays(new Date(),1)),req:1}],
  days:['float','Durée (jours)','Duration (days)',{ro:1,unit:'j'}], approver:['m2o','Approbateur','Approver',{rel:'employee'}],
  state:['sel','Statut','Status',{opts:[['draft','À soumettre','To submit',''],['sub','À approuver','To approve','info'],['ok','Approuvé','Approved','good'],['refused','Refusé','Refused','bad']],def:'sub'}],
  note:['text','Motif','Reason']},
  {status:'state',compute:r=>{const a=pd(r.from),b=pd(r.to);r.days=a&&b?Math.max(1,Math.round((b-a)/864e5)+1):0}});

defModel('attend','Présences','Attendance','name',{
  name:['char','Référence','Reference',{ro:1}], emp:['m2o','Employé','Employee',{rel:'employee',def:()=>ST.me,req:1}],
  cin:['datetime','Arrivée','Check in',{def:()=>isoDT(new Date())}], cout:['datetime','Départ','Check out'],
  hours:['float','Heures travaillées','Worked hours',{ro:1,unit:'h'}],
  place:['sel','Lieu','Place',{opts:[['bar','Velume Bar',' Velume Bar'],['studio','Studios','Studios'],['out','Extérieur (shooting)','On location']],def:'bar'}],
  note:['text','Note','Note']},
  {chatter:false,seqfield:'name',seqname:r=>'PR/'+p4(r.id),compute:r=>{const a=pd(r.cin),b=pd(r.cout);r.hours=a&&b?Math.max(0,Math.round((b-a)/36e5*100)/100):0}});

defModel('timesheet','Feuilles de temps','Timesheets','name',{
  name:['char','Description','Description',{req:1}], date:['date','Date','Date',{def:()=>iso(new Date())}],
  emp:['m2o','Employé','Employee',{rel:'employee',def:()=>ST.me}], project:['m2o','Projet','Project',{rel:'project'}],
  hours:['float','Heures','Hours',{def:1,unit:'h'}]},{chatter:false});

defModel('jobapp','Candidatures','Applications','name',{
  name:['char','Candidat','Applicant',{req:1}], job:['char','Poste visé','Applied job',{tx:1}],
  stage:['sel','Étape','Stage',{opts:[['new','Nouveau','New',''],['screen','Présélection','Screening','info'],['int','Entretien','Interview','warn'],['offer','Proposition','Offer','gold'],['hired','Embauché','Hired','good'],['refused','Refusé','Refused','bad']],def:'new'}],
  phone:['char','Téléphone / WhatsApp','Phone / WhatsApp'], email:['char','E-mail','E-mail'], salary:['money','Prétention salariale / mois','Expected salary / month',{def:0}],
  src:['sel','Source','Source',{opts:[['wa','WhatsApp','WhatsApp'],['insta','Instagram','Instagram'],['ref','Recommandation','Referral'],['walk','Candidature spontanée','Walk-in'],['web','Site web','Website']],def:'walk'}],
  prio:['stars','Appréciation','Rating'], date:['date','Reçue le','Received on',{def:()=>iso(new Date())}], note:['text','Notes d’entretien','Interview notes']},{status:'stage'});

defModel('payslip','Bulletins de paie','Payslips','name',{
  name:['char','Référence','Reference',{ro:1}], emp:['m2o','Employé','Employee',{rel:'employee',req:1}],
  period:['date','Période (1er du mois)','Period (1st of month)',{def:()=>iso(new Date()).slice(0,8)+'01'}],
  gross:['money','Salaire brut','Gross salary',{def:0}], cnps:['money','Retenue CNPS (2,8 %)','CNPS withholding (2.8%)',{ro:1}],
  other:['money','Autres retenues','Other deductions',{def:0}], net:['money','Net à payer','Net pay',{ro:1}],
  state:['sel','Statut','Status',{opts:[['draft','Brouillon','Draft',''],['ok','Validé','Validated','warn'],['paid','Payé','Paid','good']],def:'draft'}],
  how:['sel','Mode de paiement','Payment method',{opts:[['cash','Espèces','Cash'],['om','Orange Money','Orange Money'],['momo','MTN MoMo','MTN MoMo'],['bank','Virement','Bank transfer']],def:'cash'}],
  note:['text','Notes (calcul simplifié — à valider avec votre comptable)','Notes (simplified calculation — validate with your accountant)']},
  {status:'state',seqfield:'name',seqname:r=>'PAIE/'+yrr()+'/'+p4(r.id),compute:r=>{r.cnps=Math.round(Math.min(+r.gross||0,+((ST.set||{}).pay_cap||750000))*(((ST.set||{}).pay_cnps!=null?+ST.set.pay_cnps:2.8)/100));r.net=(+r.gross||0)-r.cnps-(+r.other||0)}});

defModel('gallery','Galeries clients','Client galleries','name',{
  name:['char','Séance','Session',{req:1}], client:['m2o','Client','Customer',{rel:'partner',req:1}],
  studio:['sel','Studio','Studio',{opts:[['photo','Photo','Photo','info'],['podcast','Podcast','Podcast','gold'],['video','Vidéo','Video','warn']],def:'photo'}],
  date:['date','Date de la séance','Session date',{def:()=>iso(new Date())}], count:['int','Nombre de fichiers','Files',{def:0}],
  link:['char','Lien de téléchargement','Download link'], expire:['date','Lien valable jusqu’au','Link valid until'],
  state:['sel','Statut','Status',{opts:[['shoot','Prise de vue','Shooting',''],['edit','Retouche en cours','Editing','warn'],['ready','Prête','Ready','info'],['sent','Envoyée au client','Sent to customer','good'],['arch','Archivée','Archived','']],def:'shoot'}],
  editor:['m2o','Retoucheur','Editor',{rel:'employee'}], note:['text','Notes / consignes de retouche','Notes / editing brief']},{status:'state'});

defModel('delivery','Livraisons','Deliveries','name',{
  name:['char','Référence','Reference',{ro:1}], client:['m2o','Client','Customer',{rel:'partner'}], phone:['char','Téléphone','Phone'], addr:['char','Adresse / quartier','Address / area'],
  amount:['money','Montant de la commande','Order amount',{def:0}], fee:['money','Frais de livraison','Delivery fee',{def:1000}],
  via:['sel','Livré par','Delivered by',{opts:[['own','Livreur Velume','Velume rider'],['moto','Moto-taxi','Moto-taxi'],['glovo','Glovo','Glovo'],['yango','Yango','Yango']],def:'own'}],
  rider:['m2o','Livreur','Rider',{rel:'employee'}], when:['datetime','Heure prévue','Planned time',{def:()=>isoDT(new Date())}],
  state:['sel','Statut','Status',{opts:[['new','Nouvelle','New',''],['prep','En préparation','Preparing','warn'],['way','En route','On the way','info'],['done','Livrée','Delivered','good'],['fail','Échec','Failed','bad']],def:'new'}],
  pay:['sel','Paiement','Payment',{opts:[['cash','Espèces à la livraison','Cash on delivery'],['om','Orange Money','Orange Money'],['momo','MTN MoMo','MTN MoMo']],def:'cash'}], note:['text','Instructions','Instructions']},
  {status:'state',seqfield:'name',seqname:r=>'LIV/'+p4(r.id)});

defModel('recipe','Recettes & coûts','Recipes & costs','name',{
  name:['char','Recette','Recipe',{req:1,tx:1}], cat:['sel','Catégorie','Category',{opts:[['hot','Boissons chaudes','Hot drinks','warn'],['cold','Boissons froides','Cold drinks','info'],['food','Plats','Dishes','gold'],['dessert','Desserts','Desserts','']],def:'hot'}],
  price:['money','Prix de vente TTC','Sales price (incl. VAT)',{def:0}],
  lines:['lines','Ingrédients','Ingredients',{cols:[{k:'item',t:'m2o',rel:'stockitem',fr:'Ingrédient',en:'Ingredient',w:240},{k:'qty',t:'float',fr:'Quantité (unité du stock)',en:'Quantity (stock unit)',def:1,w:130},{k:'cost',t:'money',fr:'Coût unitaire',en:'Unit cost',ro:1},{k:'sub',t:'money',fr:'Coût',en:'Cost',ro:1}]}],
  cost:['money','Coût matière','Ingredient cost',{ro:1}], ht:['money','Prix HT','Price (excl.)',{ro:1}], margin:['money','Marge brute','Gross margin',{ro:1}], pct:['int','Taux de marge','Margin rate',{ro:1,unit:'%'}],
  steps:['text','Méthode de préparation','Preparation method'], active:['bool','Active','Active',{def:true}]},
  {compute:r=>{(r.lines||[]).forEach(l=>{l.sub=Math.round((+l.qty||0)*(+l.cost||0))});r.cost=sum(r.lines||[],l=>l.sub);r.ht=Math.round((+r.price||0)/(1+TVA()/100));r.margin=r.ht-r.cost;r.pct=r.ht?Math.round(r.margin/r.ht*100):0},
   lines_on:(b,row,k)=>{if(k==='item'){const it=D.get('stockitem',+row.item);if(it)row.cost=it.cost}}});

defModel('hygiene','Contrôles hygiène','Hygiene checks','name',{
  name:['char','Contrôle','Check',{req:1,tx:1}], date:['datetime','Date et heure','Date & time',{def:()=>isoDT(new Date())}],
  kind:['sel','Type','Type',{opts:[['open','Ouverture','Opening','info'],['close','Fermeture','Closing','gold'],['temp','Température frigo / congélateur','Fridge / freezer temperature','warn'],['clean','Nettoyage machine / bar','Machine / bar cleaning',''],['pest','Contrôle nuisibles','Pest control','']],def:'open'}],
  zone:['sel','Zone','Area',{opts:[['bar','Bar','Bar'],['kit','Cuisine','Kitchen'],['fridge','Frigo / réserve','Fridge / storage'],['wc','Sanitaires','Toilets'],['studio','Studios','Studios']],def:'bar'}],
  temp:['float','Température (°C)','Temperature (°C)'], by:['m2o','Contrôlé par','Checked by',{rel:'employee',def:()=>ST.me}],
  result:['sel','Résultat','Result',{opts:[['ok','Conforme','Compliant','good'],['nok','Non conforme','Non-compliant','bad']],def:'ok'}],
  action:['text','Action corrective','Corrective action']},{chatter:false});

/* ---------- vues ---------- */
act('sales',{model:'saleorder',l:['Devis & commandes','Quotations & orders'],icon:'cart',views:['list','kanban','graph','pivot'],list:['name','date','customer','ttc','state'],sum:['ttc'],search:['name','customer'],groups:['state','customer'],
  filters:[['q',['Devis','Quotations'],r=>r.state==='draft'||r.state==='sent'],['so',['Commandes','Sales orders'],r=>r.state==='sale'||r.state==='inv'],['todo',['À facturer','To invoice'],r=>r.state==='sale']],order:(x,y)=>x.date<y.date?1:-1,
  kanban:{by:'state',sub:['customer','ttc']},
  graph:{measure:'ttc',by:'customer',type:'bar',measures:[['ttc',['Total TTC','Total']],['__count',['Nombre','Count']]],dims:['customer','state','date']},
  pivot:{row:'customer',col:'state',measure:'ttc',measures:[['ttc',['Total TTC','Total']],['__count',['Nombre','Count']]],dims:['customer','state','date']},
  form:{status:'state',title:'name',cols:[['customer','date','valid'],['ht','ttc','invoice']],tabs:[{l:['Lignes de commande','Order lines'],lines:'lines'},{l:['Conditions','Terms'],fields:['note']}],
    btns:[{l:['Envoyer par WhatsApp','Send by WhatsApp'],icon:'send',when:b=>b.state==='draft',pri:1,set:{state:'sent'}},{l:['Confirmer','Confirm'],when:b=>b.state==='draft'||b.state==='sent',pri:1,set:{state:'sale'}},
     {l:['Créer la facture','Create invoice'],icon:'receipt',when:b=>b.state==='sale'&&!b.invoice,pri:1,fn:b=>{const inv=D.create('invoice',{kind:'out_invoice',partner:b.customer,date:iso(new Date()),due:iso(addDays(new Date(),7)),journal:(D.all('journal').find(j=>j.kind==='sale')||{}).id,state:'posted',lines:(b.lines||[]).map(l=>({desc:D.name('product',l.item),qty:l.qty,price:l.price}))});
       D.write('saleorder',b.id,{invoice:inv.id,state:'inv'});if(FV&&FV.id===b.id)FV.buf=clone(D.get('saleorder',b.id));toast(tr('Facture créée : ','Invoice created: ')+inv.number);render()}},
     {l:['Annuler','Cancel'],when:b=>b.state!=='cancel'&&b.state!=='inv',set:{state:'cancel'}}],
    smart:[{l:['Facture','Invoice'],icon:'receipt',count:b=>b.invoice?1:0,fn:b=>b.invoice&&goTo('billing','inv_out',b.invoice)}]},ctx:()=>({})});
act('sales_report',Object.assign({},ACT.sales,{id:'sales_report',l:['Analyse des ventes','Sales analysis'],views:['graph','pivot','list'],create:false}));

act('leaves',{model:'leave',l:['Demandes de congés','Time off requests'],icon:'calendar',views:['calendar','list','kanban','graph'],list:['emp','kind','from','to','days','state'],sum:['days'],search:['emp','name'],groups:['state','kind','emp'],
  filters:[['mine',['Mes congés','My time off'],r=>r.emp===ST.me],['sub',['À approuver','To approve'],r=>r.state==='sub'],['ok',['Approuvés','Approved'],r=>r.state==='ok']],
  calendar:{start:'from',stop:'to',color:'kind',title:r=>D.name('employee',r.emp)},kanban:{by:'state',sub:['kind','from'],avatar:'emp'},
  graph:{measure:'days',by:'emp',type:'bar',measures:[['days',['Jours','Days']],['__count',['Nombre','Count']]],dims:['emp','kind','state','from']},
  form:{status:'state',title:'name',cols:[['emp','kind','from','to'],['days','approver']],tabs:[{l:['Motif','Reason'],fields:['note']}],
    btns:[{l:['Approuver','Approve'],when:b=>b.state==='sub',pri:1,set:{state:'ok'}},{l:['Refuser','Refuse'],when:b=>b.state==='sub',set:{state:'refused'}},{l:['Remettre à soumettre','Reset to submit'],when:b=>b.state==='refused'||b.state==='ok',set:{state:'sub'}}]},ctx:()=>({})});
act('attends',{model:'attend',l:['Présences','Attendances'],icon:'clock',views:['list','graph','pivot'],list:['emp','cin','cout','hours','place'],sum:['hours'],search:['emp'],groups:['emp','place'],order:(x,y)=>x.cin<y.cin?1:-1,
  graph:{measure:'hours',by:'emp',type:'bar',measures:[['hours',['Heures','Hours']],['__count',['Nombre','Count']]],dims:['emp','place','cin']},
  pivot:{row:'emp',col:'place',measure:'hours',measures:[['hours',['Heures','Hours']],['__count',['Nombre','Count']]],dims:['emp','place']},
  form:{title:'name',cols:[['emp','place'],['cin','cout','hours']],tabs:[{l:['Note','Note'],fields:['note']}],
    btns:[{l:['Pointer le départ','Check out'],icon:'clock',pri:1,when:b=>!!b.id&&!b.cout,fn:b=>{const t=isoDT(new Date());D.write('attend',b.id,{cout:t});if(FV&&FV.id===b.id)FV.buf=clone(D.get('attend',b.id));toast(tr('Départ enregistré','Check-out recorded'));render()}}]},ctx:()=>({})});
act('timesheets',{model:'timesheet',l:['Feuilles de temps','Timesheets'],icon:'clock',views:['list','graph','pivot'],list:['date','emp','project','name','hours'],sum:['hours'],search:['name','emp','project'],groups:['project','emp','date'],order:(x,y)=>x.date<y.date?1:-1,
  filters:[['mine',['Mes feuilles','My timesheets'],r=>r.emp===ST.me]],
  graph:{measure:'hours',by:'project',type:'pie',measures:[['hours',['Heures','Hours']],['__count',['Nombre','Count']]],dims:['project','emp','date']},
  pivot:{row:'project',col:'emp',measure:'hours',measures:[['hours',['Heures','Hours']],['__count',['Nombre','Count']]],dims:['project','emp','date']},
  form:{title:'name',cols:[['date','emp'],['project','hours']]},ctx:()=>({})});
act('jobapps',{model:'jobapp',l:['Candidatures','Applications'],icon:'team',views:['kanban','list','graph'],list:['name','job','stage','src','salary','date'],search:['name','job','phone'],groups:['stage','job','src'],
  filters:[['open',['En cours','Ongoing'],r=>r.stage!=='hired'&&r.stage!=='refused'],['hired',['Embauchés','Hired'],r=>r.stage==='hired']],kanban:{by:'stage',sub:['job','salary'],tags:['src'],stars:'prio'},
  graph:{measure:'__count',by:'stage',type:'bar',measures:[['__count',['Nombre','Count']]],dims:['stage','job','src']},
  form:{status:'stage',title:'name',cols:[['job','phone','email'],['src','salary','date','prio']],tabs:[{l:['Notes d’entretien','Interview notes'],fields:['note']}],
    btns:[{l:['Étape suivante','Next stage'],pri:1,when:b=>['new','screen','int','offer'].includes(b.stage),fn:b=>{const o=['new','screen','int','offer','hired'];const nx=o[o.indexOf(b.stage)+1];D.write('jobapp',b.id,{stage:nx});if(FV&&FV.id===b.id)FV.buf=clone(D.get('jobapp',b.id));render()}},
     {l:['Créer l’employé','Create employee'],icon:'team',when:b=>b.stage==='hired',fn:b=>{const e=D.create('employee',{name:b.name,job:b.job,phone:b.phone,email:b.email,since:iso(new Date())});toast(tr('Fiche employé créée','Employee record created'));goTo('employees','employees',e.id)}},
     {l:['Refuser','Refuse'],when:b=>b.stage!=='refused'&&b.stage!=='hired',set:{stage:'refused'}}]},ctx:()=>({})});
act('payslips',{model:'payslip',l:['Bulletins de paie','Payslips'],icon:'receipt',views:['list','kanban','graph'],list:['name','emp','period','gross','cnps','other','net','state'],sum:['gross','cnps','net'],search:['name','emp'],groups:['state','emp','period'],order:(x,y)=>x.period<y.period?1:-1,
  filters:[['draft',['Brouillons','Drafts'],r=>r.state==='draft'],['ok',['À payer','To pay'],r=>r.state==='ok']],kanban:{by:'state',sub:['emp','net'],money:'net'},
  graph:{measure:'net',by:'emp',type:'bar',measures:[['net',['Net','Net']],['gross',['Brut','Gross']],['cnps',['CNPS','CNPS']]],dims:['emp','state','period']},
  form:{status:'state',title:'name',cols:[['emp','period','how'],['gross','cnps','other','net']],tabs:[{l:['Notes','Notes'],fields:['note']}],
    btns:[{l:['Valider','Validate'],pri:1,when:b=>b.state==='draft',set:{state:'ok'}},{l:['Marquer comme payé','Mark as paid'],pri:1,when:b=>b.state==='ok',fn:b=>{D.write('payslip',b.id,{state:'paid'});D.create('payment',{partner:(D.all('partner')[0]||{}).id,date:iso(new Date()),amount:b.net,method:b.how==='bank'?'bank':b.how,dir:'out',ref:tr('Salaire ','Salary ')+D.name('employee',b.emp)},{silent:true});if(FV&&FV.id===b.id)FV.buf=clone(D.get('payslip',b.id));toast(tr('Paiement enregistré','Payment recorded'));render()}}]},ctx:()=>({})});
act('galleries',{model:'gallery',l:['Galeries clients','Client galleries'],icon:'image',views:['kanban','list','calendar'],list:['name','client','studio','date','count','expire','state'],sum:['count'],search:['name','client'],groups:['state','studio'],
  filters:[['edit',['En retouche','Editing'],r=>r.state==='edit'],['ready',['Prêtes à envoyer','Ready to send'],r=>r.state==='ready'],['exp',['Lien expire (7 j)','Link expiring (7 d)'],r=>r.state==='sent'&&r.expire&&r.expire<=iso(addDays(new Date(),7))]],
  kanban:{by:'state',sub:['client','date'],tags:['studio'],avatar:'editor'},calendar:{start:'date',title:r=>rn('gallery',r),color:'studio'},
  form:{status:'state',title:'name',cols:[['client','studio','date','editor'],['count','link','expire']],tabs:[{l:['Consignes','Brief'],fields:['note']}],
    btns:[{l:['Marquer comme prête','Mark as ready'],pri:1,when:b=>b.state==='shoot'||b.state==='edit',set:{state:'ready'}},
     {l:['Envoyer par WhatsApp','Send by WhatsApp'],icon:'send',pri:1,when:b=>b.state==='ready',fn:b=>{const p=D.get('partner',b.client)||{};const ph=String(p.phone||'').replace(/\D/g,'');const msg=tr('Bonjour ! Vos fichiers Velume sont prêts : ','Hello! Your Velume files are ready: ')+(b.link||'');
       D.write('gallery',b.id,{state:'sent'});if(FV&&FV.id===b.id)FV.buf=clone(D.get('gallery',b.id));try{window.open('https://wa.me/'+ph+'?text='+encodeURIComponent(msg),'_blank')}catch(e){}toast(tr('Statut : envoyée au client','Status: sent to customer'));render()}},
     {l:['Archiver','Archive'],when:b=>b.state==='sent',set:{state:'arch'}}]},ctx:()=>({expire:iso(addDays(new Date(),30))})});
act('deliveries',{model:'delivery',l:['Livraisons','Deliveries'],icon:'map',views:['kanban','list','graph'],list:['name','client','addr','via','amount','fee','state','when'],sum:['amount','fee'],search:['name','client','addr'],groups:['state','via','rider'],order:(x,y)=>x.when<y.when?1:-1,
  filters:[['open',['À livrer','To deliver'],r=>r.state==='new'||r.state==='prep'||r.state==='way'],['done',['Livrées','Delivered'],r=>r.state==='done'],['fail',['Échecs','Failed'],r=>r.state==='fail']],
  kanban:{by:'state',sub:['client','addr'],tags:['via'],money:'amount',avatar:'rider'},
  graph:{measure:'amount',by:'via',type:'pie',measures:[['amount',['Montant','Amount']],['fee',['Frais','Fees']],['__count',['Nombre','Count']]],dims:['via','state','rider','when']},
  form:{status:'state',title:'name',cols:[['client','phone','addr'],['amount','fee','via','rider','when','pay']],tabs:[{l:['Instructions','Instructions'],fields:['note']}],
    btns:[{l:['En préparation','Preparing'],when:b=>b.state==='new',pri:1,set:{state:'prep'}},{l:['Partie en livraison','Out for delivery'],when:b=>b.state==='prep',pri:1,set:{state:'way'}},{l:['Livrée','Delivered'],when:b=>b.state==='way',pri:1,set:{state:'done'}},{l:['Échec','Failed'],when:b=>b.state==='way',set:{state:'fail'}},
     {l:['Appeler sur WhatsApp','Open WhatsApp'],icon:'whatsapp',when:b=>!!b.phone,fn:b=>{try{window.open('https://wa.me/'+String(b.phone).replace(/\D/g,''),'_blank')}catch(e){}}}]},ctx:()=>({})});
act('recipes',{model:'recipe',l:['Recettes & coûts','Recipes & costs'],icon:'cup',views:['list','kanban','graph'],list:['name','cat','price','cost','margin','pct','active'],search:['name'],groups:['cat'],
  filters:[['low',['Marge < 60 %','Margin < 60%'],r=>r.pct<60]],kanban:{by:'cat',sub:['price','pct'],money:'price'},
  graph:{measure:'pct',by:'name',type:'bar',measures:[['pct',['Taux de marge %','Margin %']],['margin',['Marge brute','Gross margin']],['cost',['Coût matière','Ingredient cost']]],dims:['cat','name']},
  form:{title:'name',cols:[['cat','price','active'],['cost','ht','margin','pct']],tabs:[{l:['Ingrédients','Ingredients'],lines:'lines'},{l:['Méthode','Method'],fields:['steps']}]},ctx:()=>({})});
act('hygienes',{model:'hygiene',l:['Contrôles hygiène','Hygiene checks'],icon:'shield',views:['list','kanban','graph'],list:['date','name','kind','zone','temp','by','result'],search:['name','by'],groups:['kind','zone','result'],order:(x,y)=>x.date<y.date?1:-1,
  filters:[['nok',['Non conformes','Non-compliant'],r=>r.result==='nok'],['temp',['Températures','Temperatures'],r=>r.kind==='temp'],['today',['Aujourd’hui','Today'],r=>(r.date||'').slice(0,10)===iso(new Date())]],kanban:{by:'result',sub:['kind','zone'],tags:['kind']},
  graph:{measure:'temp',by:'date',type:'line',measures:[['temp',['Température °C','Temperature °C']],['__count',['Nombre','Count']]],dims:['date','zone','kind']},
  form:{title:'name',cols:[['kind','zone','date'],['temp','by','result']],tabs:[{l:['Action corrective','Corrective action'],fields:['action']}]},ctx:()=>({})});

/* ---------- applications ---------- */
const NEW2=[
 ['sales',{l:['Ventes','Sales'],icon:'cart',color:'var(--s1)',menus:[MC('sa_o',['Commandes','Orders'],[M_('sa_q',['Devis','Quotations'],'sales',{}),M_('sa_c',['Clients','Customers'],'customers')]),M_('sa_p',['Produits','Products'],'pos_products'),MC('sa_r',['Rapports','Reporting'],[M_('sa_an',['Analyse des ventes','Sales analysis'],'sales_report')])]}],
 ['contacts',{l:['Contacts','Contacts'],icon:'user',color:'var(--s7)',menus:[M_('ct_m',['Contacts','Contacts'],'customers'),M_('ct_v',['Fournisseurs','Vendors'],'vendors')]}],
 ['timeoff',{l:['Congés','Time Off'],icon:'calendar',color:'var(--s3)',menus:[M_('to_m',['Calendrier des congés','Time off calendar'],'leaves'),M_('to_l',['Demandes','Requests'],null,{act:'leaves',view:'list'}),MC('to_r',['Rapports','Reporting'],[M_('to_a',['Analyse des congés','Time off analysis'],'leaves',{view:'graph'})])]}],
 ['attendance',{l:['Présences','Attendances'],icon:'clock',color:'var(--s6)',menus:[M_('at_m',['Présences','Attendances'],'attends'),MC('at_r',['Rapports','Reporting'],[M_('at_a',['Heures par employé','Hours per employee'],'attends',{view:'graph'})])]}],
 ['timesheets',{l:['Feuilles de temps','Timesheets'],icon:'clock',color:'var(--s2)',menus:[M_('ts_m',['Mes feuilles de temps','My timesheets'],'timesheets'),MC('ts_r',['Rapports','Reporting'],[M_('ts_a',['Analyse par projet','By project'],'timesheets',{view:'pivot'})])]}],
 ['recruitment',{l:['Recrutement','Recruitment'],icon:'team',color:'var(--s5)',menus:[M_('rc_m',['Candidatures','Applications'],'jobapps'),MC('rc_r',['Rapports','Reporting'],[M_('rc_a',['Analyse du recrutement','Recruitment analysis'],'jobapps',{view:'graph'})])]}],
 ['payroll',{l:['Paie','Payroll'],icon:'dollar',color:'var(--gold)',menus:[M_('pa_m',['Bulletins de paie','Payslips'],'payslips'),MC('pa_r',['Rapports','Reporting'],[M_('pa_a',['Masse salariale','Payroll analysis'],'payslips',{view:'graph'})])]}],
 ['gallery',{l:['Galerie clients','Client Gallery'],icon:'image',color:'var(--s5)',menus:[M_('gl_m',['Galeries','Galleries'],'galleries'),MC('gl_c',['Configuration','Configuration'],[M_('gl_cl',['Clients','Customers'],'customers')])]}],
 ['delivery',{l:['Livraison','Delivery'],icon:'map',color:'var(--s4)',menus:[M_('dl_m',['Livraisons','Deliveries'],'deliveries'),MC('dl_r',['Rapports','Reporting'],[M_('dl_a',['Analyse des livraisons','Delivery analysis'],'deliveries',{view:'graph'})])]}],
 ['recipes',{l:['Recettes & coûts','Recipes & Costs'],icon:'cup',color:'var(--s2)',menus:[M_('re_m',['Recettes','Recipes'],'recipes'),M_('re_s',['Matières premières','Ingredients'],'stockitems'),MC('re_r',['Rapports','Reporting'],[M_('re_a',['Marges par recette','Margin per recipe'],'recipes',{view:'graph'})])]}],
 ['hygiene',{l:['Hygiène & HACCP','Hygiene & HACCP'],icon:'shield',color:'var(--s3)',menus:[M_('hy_m',['Contrôles','Checks'],'hygienes'),MC('hy_r',['Rapports','Reporting'],[M_('hy_a',['Courbe des températures','Temperature curve'],'hygienes',{view:'graph'})])]}]
];
(function(){
  const tail=APPS.filter(a=>a.core);
  for(let i=APPS.length-1;i>=0;i--)if(APPS[i].core)APPS.splice(i,1);
  NEW2.forEach(a=>{if(!APPS.some(x=>x.id===a[0]))app(a[0],a[1])});
  tail.forEach(a=>APPS.push(a));
})();

/* ---------- catalogue ---------- */
// [clé, fr, en, description fr, description en, catégorie, icône, couleur, app réelle, menu, nouveauté Velume, secteur]
const CATS={sales:['Ventes','Sales'],web:['Site Web','Website'],serv:['Services','Services'],acct:['Comptabilité','Accounting'],supply:['Chaîne d’approvisionnement','Supply Chain'],prod:['Productivité','Productivity'],mkt:['Marketing','Marketing'],hr:['Ressources humaines','Human Resources'],ship:['Connecteurs d’expédition','Shipping Connectors'],esg:['ESG','ESG'],cust:['Personnalisations','Customizations'],adm:['Administration','Administration'],inv:['Inventory','Inventory']};
const C_=(k,fr,en,dfr,den,cat,icon,col,real,menu,nv,sec)=>({k:k,fr:fr,en:en,dfr:dfr,den:den,cat:cat,icon:icon,col:col,real:real||null,menu:menu||null,nv:!!nv,sec:!!sec});
const CAT=[
 C_('sale','Ventes','Sales','Des devis aux factures','From quotations to invoices','sales','cart',0,'sales'),
 C_('restaurant','Restaurant','Restaurant','Extensions restaurant pour le point de vente','Restaurant extensions for the Point of Sale','sales','cup',1,'kitchen',null,0,1),
 C_('invoicing','Facturation','Invoicing','Factures et paiements','Invoices & payments','acct','receipt',2,'billing'),
 C_('crm','CRM','CRM','Suivre les pistes et conclure des opportunités','Track leads and close opportunities','sales','flag',3,'crm'),
 C_('website','Site Web','Website','Créateur de site web d’entreprise','Enterprise website builder','web','globe',4),
 C_('inventory','Inventaire','Inventory','Gérez vos stocks et vos activités logistiques','Manage your stock and logistics activities','supply','box',5,'inventory'),
 C_('accounting','Comptabilité','Accounting','Gérer la comptabilité financière et analytique','Manage financial and analytic accounting','acct','dollar',6,'billing'),
 C_('equity','Capitaux propres','Equity','Gérer titres, transactions et tables de capitalisation','Manage securities, transactions, and cap tables','acct','pie',7),
 C_('purchase','Achats','Purchase','Bons de commande, appels d’offres et accords','Purchase orders, tenders and agreements','supply','cart',0,'purchase'),
 C_('pos','Point de Vente','Point of Sale','Gérez paiements et caisses des boutiques et restaurants','Handle checkouts and payments for shops and restaurants','sales','pos',1,'pos',null,0,1),
 C_('project','Projet','Project','Organisez et planifiez vos projets','Organize and schedule your projects','serv','puzzle',2,'project'),
 C_('ecommerce','eCommerce','eCommerce','Vendez vos produits en ligne','Sell your products online','web','shop',3),
 C_('mrp','Fabrication','Manufacturing','Ordres de fabrication et nomenclatures','Manufacturing orders & BOMs','supply','gear',4),
 C_('emailmkt','E-mail Marketing','Email Marketing','Concevez, envoyez et suivez vos e-mails','Design, send and track emails','mkt','mail',5),
 C_('timesheet','Feuilles de temps','Timesheets','Suivez le temps passé par les employés sur les tâches','Track employee time on tasks','serv','clock',6,'timesheets'),
 C_('expenses','Dépenses','Expenses','Soumettez, validez et refacturez les notes de frais','Submit, validate and reinvoice employee expenses','acct','receipt',7,'expenses'),
 C_('studio','Studio','Studio','Créez et personnalisez vos applications','Create and customize your Odoo apps','cust','sliders',0),
 C_('documents','Documents','Documents','Collectez, organisez et partagez des documents','Collect, organize and share documents','prod','clip',1),
 C_('timeoff','Congés','Time Off','Allouez les congés et suivez les demandes','Allocate time off and follow leave requests','hr','calendar',2,'timeoff'),
 C_('recruitment','Recrutement','Recruitment','Suivez votre pipeline de recrutement','Track your recruitment pipeline','hr','team',3,'recruitment'),
 C_('employees','Employés','Employees','Centralisez les informations des employés','Centralize employee information','hr','team',4,'employees'),
 C_('ai','IA','AI','Une suite d’agents IA agissant sur votre environnement','A suite of AI agents acting on your environment','prod','bolt',5),
 C_('datarecycle','Data Recycle','Data Recycle','Trouvez les anciens enregistrements et archivez-les','Find old records and archive them','adm','refresh',6),
 C_('databases','Bases de données','Databases','Gérez vos bases de données','Manage your databases','adm','db',7),
 C_('dhl','DHL Express Shipping','DHL Express Shipping','Envoyez vos colis avec DHL','Send your shippings through DHL','ship','box',0),
 C_('envia','Envia Shipping','Envia Shipping','Envoyez vos colis avec Envia','Send your shippings through Envia','ship','box',1),
 C_('fedex','Fedex Shipping','Fedex Shipping','Envoyez vos colis avec Fedex','Send your shippings through Fedex','ship','box',2),
 C_('shipstation','ShipStation Shipping','ShipStation Shipping','Envoyez vos colis avec ShipStation','Send your shippings through ShipStation','ship','box',3),
 C_('starshipit','Starshipit Shipping','Starshipit Shipping','Envoyez vos colis avec Starshipit','Send your shippings through Starshipit','ship','box',4),
 C_('ups','UPS Shipping','UPS Shipping','Envoyez vos colis avec UPS','Send your shippings through UPS','ship','box',5),
 C_('esg','ESG','ESG','Calculez et suivez l’impact environnemental, social et de gouvernance','Calculate and report your company’s Environmental, Social and Governance impact','esg','globe',6),
 C_('reception','Réception','Reception','Gestion des visiteurs','Visitor management system','prod','user',7),
 C_('knowledge','Connaissances','Knowledge','Centralisez, gérez et partagez les connaissances de l’entreprise','Centralize, manage, share and grow your knowledge library','prod','book',0,'knowledge'),
 C_('maintenance','Maintenance','Maintenance','Suivez le matériel et gérez les demandes de maintenance','Track equipment and manage maintenance requests','supply','gear',1,'maintenance'),
 C_('mkcard','Carte Marketing','Marketing Cards','Générez des cartes dynamiques partageables','Generate dynamic shareable cards','mkt','card',2),
 C_('iotbox','Odoo IoT management','Odoo IoT management','Gérez les boîtiers IoT et les périphériques','Manage IoT boxes and devices','inv','wifi',3),
 C_('fieldservice','Service sur site','Field Service','Planifiez les interventions sur site','Plan on-site interventions','serv','map',4),
 C_('rooms','Salles de réunion','Meeting Rooms','Gérez les salles de réunion','Manage Meeting Rooms','prod','calendar',5),
 C_('lazada','Lazada Connector','Lazada Connector','Importez les commandes Lazada et synchronisez les livraisons','Import Lazada orders and sync deliveries','sales','shop',6),
 C_('whatsapp','WhatsApp Messaging','WhatsApp Messaging','Contactez vos clients et équipes via WhatsApp','Text your Contacts on WhatsApp','mkt','whatsapp',7,'whatsapp'),
 C_('sign','Signature','Sign','Envoyez et demandez des signatures électroniques','Send and request electronic signatures','prod','sign',0,'sign'),
 C_('helpdesk','Assistance','Helpdesk','Suivez, priorisez et résolvez les tickets clients','Track, prioritize, and solve customer tickets','serv','chat2',1),
 C_('subscriptions','Abonnements','Subscriptions','Générez des factures récurrentes et gérez les abonnements','Generate recurring invoices and manage renewals','sales','refresh',2,'loyalty','ly_sub'),
 C_('quality','Qualité','Quality','Contrôlez la qualité de vos produits','Control the quality of your products','supply','check',3),
 C_('elearning','eLearning','eLearning','Gérez et publiez une plateforme d’apprentissage','Manage and publish an eLearning platform','web','book',4),
 C_('planning','Planning','Planning','Planifiez le travail de vos employés','Manage your employees’ schedule','serv','plan',5,'planning'),
 C_('events','Événements','Events','Publiez des événements, vendez des billets','Publish events, sell tickets','web','calendar',6),
 C_('discuss','Discussion','Discuss','Passerelle de chat et canaux privés','Chat, mail gateway and private channels','prod','chat',7,'discuss'),
 C_('contacts','Contacts','Contacts','Centralisez votre carnet d’adresses','Centralize your address book','prod','user',0,'contacts'),
 C_('plm','Product Lifecycle Management (PLM)','Product Lifecycle Management (PLM)','Gérez les ordres de modification des produits et nomenclatures','Manage engineering change orders on products, bills of material','supply','refresh',1),
 C_('rental','Location','Rental','Gérez les contrats de location, livraisons et retours','Manage rental contracts, deliveries and returns','sales','key',2,'rental',null,0,1),
 C_('calendar','Calendrier','Calendar','Planifiez les réunions et les activités de vos employés','Schedule employees’ meetings','prod','calendar',3,'calendar'),
 C_('social','Marketing social','Social Marketing','Gérez vos réseaux sociaux et votre calendrier éditorial','Manage your social media and website visitors','mkt','heart',4,'marketing'),
 C_('appraisal','Évaluations','Appraisals','Évaluez vos employés','Assess your employees','hr','star',5),
 C_('fleet','Parc automobile','Fleet','Gérez votre parc de véhicules et vos coûts','Manage your fleet and track car costs','hr','map',6),
 C_('approvals','Validations','Approvals','Créez et validez des demandes d’approbation','Create and validate approvals requests','prod','check',7),
 C_('automation','Marketing Automation','Marketing Automation','Créez des campagnes marketing automatisées','Build automated mailing campaigns','mkt','bolt',0),
 C_('livechat','Live Chat','Live Chat','Discutez avec les visiteurs de votre site','Chat with your website visitors','web','chat2',1),
 C_('appointments','Rendez-vous','Appointments','Autorisez les clients à réserver des rendez-vous en ligne','Allow people to book appointments in your agenda','serv','appt',2,'appointments',null,0,1),
 C_('survey','Sondages','Surveys','Créez des enquêtes et analysez les réponses','Send your surveys or share them live','mkt','poll',3,'survey'),
 C_('repairs','Réparations','Repairs','Réparez les produits endommagés','Repair damaged products','supply','gear',4),
 C_('referral','Employee Referral','Employee Referral','Parrainage d’employés pour les postes ouverts','Let your employees share job positions and refer their friends','hr','heart',5),
 C_('attendance','Présences','Attendances','Suivez les présences des employés','Track employee attendance','hr','clock',6,'attendance'),
 C_('sms','SMS Marketing','SMS Marketing','Concevez, envoyez et suivez vos SMS','Design, send and track SMS','mkt','phone',7),
 C_('iot','Internet of Things','Internet of Things','Modèles de base et dispositifs pour la connexion IoT','Basic models and device handling for IoT','inv','wifi',0),
 C_('barcode','Codes-barres','Barcode','Utilisez les codes-barres pour traiter les opérations logistiques','Use barcode scanners to process logistics operations','supply','tag',1),
 C_('todo','À faire','To-do','Organisez votre travail avec des mémos et des tâches','Organize your work with memos and to-do lists','prod','todo',2,'todo'),
 C_('skills','Skills Management','Skills Management','Gérez les compétences, connaissances et CV de vos employés','Manage skills, knowledge and resumes of your employees','hr','pen',3),
 C_('voip','Téléphone','Phone','Passez et recevez des appels depuis le navigateur','Make and receive phone calls in your browser','prod','phone',4),
 C_('payroll','Paie','Payroll','Gérez la paie de vos employés','Manage your employee payroll','hr','dollar',5,'payroll'),
 C_('lunch','Déjeuner','Lunch','Gérez les repas de vos employés','Handle lunch orders of your employees','hr','cup',6),
 C_('usps','United States Postal Service (USPS) Shipping','United States Postal Service (USPS) Shipping','Envoyez vos colis avec USPS','Send your shippings through USPS','ship','box',7),
 C_('onlinejobs','Online Jobs','Online Jobs','Gérez vos offres d’emploi en ligne','Manage your online hiring process','hr','globe',0),
 C_('easypost','Easypost Shipping','Easypost Shipping','Envoyez vos colis avec Easypost','Send your shippings through Easypost','ship','box',1),
 C_('sendcloud','Expédition Sendcloud','Sendcloud Shipping','Envoyez vos colis avec Sendcloud','Send your shippings through Sendcloud','ship','box',2),
 C_('shiprocket','Shiprocket Shipping','Shiprocket Shipping','Envoyez vos colis avec Shiprocket','Send your shippings through Shiprocket','ship','box',3),
 C_('amazon','Amazon Connector','Amazon Connector','Importez les commandes Amazon et synchronisez les livraisons','Import Amazon orders and sync deliveries','sales','shop',4),
 C_('shopee','Shopee Connector','Shopee Connector','Importez les commandes Shopee et synchronisez les livraisons','Import Shopee orders and sync deliveries','sales','shop',5),
 C_('tiktok','TikTok Shop Connector','TikTok Shop Connector','Importez les commandes TikTok Shop et synchronisez les livraisons','Import TikTok Shop orders and sync deliveries','sales','shop',6),
 C_('bpost','bpost Shipping','bpost Shipping','Envoyez vos colis avec bpost','Send your shippings through bpost','ship','box',7),
 /* ---- ajouts VELUME : café + studios ---- */
 C_('club','Velume Club','Velume Club','Points, niveaux, solde prépayé et cartes cadeaux','Points, tiers, prepaid balance and gift cards','sales','heart',2,'loyalty','ly_mem',1,1),
 C_('delivery','Livraison','Delivery','Livraisons à domicile, livreurs, Glovo / Yango','Home deliveries, riders, Glovo / Yango','sales','map',3,'delivery',null,1,1),
 C_('cashbook','Caisse & Mobile Money','Cash & Mobile Money','Clôtures de caisse et rapprochement Orange Money / MTN MoMo','Cash closings and Orange Money / MTN MoMo matching','acct','dollar',5,'cashbook',null,1,1),
 C_('dashboards','Tableaux de bord','Dashboards','Indicateurs clés du café et des studios','Key figures for the café and the studios','prod','bars',2,'dashboards',null,1),
 C_('gallery','Galerie clients','Client Gallery','Livraison des photos / vidéos retouchées, liens et expirations','Delivery of edited photos / videos, links and expiry','serv','image',5,'gallery',null,1,1),
 C_('recipes','Recettes & coûts','Recipes & Costs','Fiches techniques, coût matière et marge par boisson ou plat','Recipe cards, ingredient cost and margin per drink or dish','supply','cup',0,'recipes',null,1,1),
 C_('hygiene','Hygiène & HACCP','Hygiene & HACCP','Contrôles d’ouverture / fermeture, températures frigo, non-conformités','Opening / closing checks, fridge temperatures, non-compliances','supply','shield',3,'hygiene',null,1,1),
 C_('momoapi','Orange Money / MTN MoMo (API)','Orange Money / MTN MoMo (API)','Encaissement automatique par API (compte marchand requis)','Automatic collection through API (merchant account required)','acct','phone',6,null,null,1,1),
 C_('glovoapi','Glovo / Yango Delivery Connector','Glovo / Yango Delivery Connector','Importez les commandes des plateformes de livraison','Import orders from delivery platforms','ship','map',7,null,null,1,1)
];
const apIns=e=>!!e.real&&ST.installed[e.real]!==false;
const apStatus=e=>e.real?(apIns(e)?'inst':'avail'):'na';

CUSTOM.apps=function(){
  ST.wish=ST.wish||{};
  const sec=UI.asec||'off',cat=UI.acat2||'all',q=(UI.aq||'').toLowerCase().trim(),flt=UI.aflt||'all',view=UI.aview||'k';
  const nm=e=>LANG==='fr'?e.fr:e.en,ds=e=>LANG==='fr'?e.dfr:e.den;
  const base=CAT.filter(e=>sec==='off'||e.sec);
  const inCat=base.filter(e=>cat==='all'||e.cat===cat);
  const list=inCat.filter(e=>(flt==='all'||(flt==='inst'&&apIns(e))||(flt==='avail'&&!apIns(e))||(flt==='nv'&&e.nv))&&(!q||(e.fr+' '+e.en+' '+e.dfr+' '+e.den).toLowerCase().includes(q)));
  const cc=c=>base.filter(e=>c==='all'||e.cat===c).length;
  const cats=Object.keys(CATS).filter(c=>cc(c)>0);
  const side='<nav class="cats ap2side"><h4>'+tr('APPLICATIONS','APPLICATIONS')+'</h4>'+
    '<button data-a="ap-sec" data-s="off" aria-current="'+(sec==='off')+'">'+tr('Applications officielles','Official Apps')+'</button>'+
    '<button data-a="ap-sec" data-s="sec" aria-current="'+(sec==='sec')+'">'+tr('Secteurs d’activité','Industries')+'</button>'+
    '<h4>'+tr('CATÉGORIES','CATEGORIES')+'</h4>'+
    '<button data-a="ap-cat" data-c="all" aria-current="'+(cat==='all')+'">'+tr('Tous','All')+'<span class="muted">'+cc('all')+'</span></button>'+
    cats.map(c=>'<button class="sub" data-a="ap-cat" data-c="'+c+'" aria-current="'+(cat===c)+'">'+esc(LANG==='fr'?CATS[c][0]:CATS[c][1])+'<span class="muted">'+cc(c)+'</span></button>').join('')+'</nav>';
  const btns=e=>{const s=apStatus(e);
    return (s==='inst'?'<button class="btn sm pri" data-a="ap-open" data-k="'+e.k+'">'+tr('Ouvrir','Open')+'</button>':'<button class="btn sm pri" data-a="ap-install" data-k="'+e.k+'">'+tr('Installer','Install')+'</button>')+
      '<button class="btn sm" data-a="ap-info" data-k="'+e.k+'">'+tr('En savoir plus','Learn more')+'</button>'};
  const tag=e=>(e.nv?'<span class="ap2n">VELUME</span>':'')+(apIns(e)?' <span class="ap2ok">✓</span>':'');
  const grid='<div class="ap2grid">'+list.map(e=>'<div class="ap2c" style="--k:'+pcol(e.col)+'"><span class="ap2i">'+ic(e.icon)+'</span><div class="ap2m"><b>'+esc(nm(e))+tag(e)+'</b><p>'+esc(ds(e))+'</p><div class="ap2b">'+btns(e)+'</div></div><button class="ib ap2dot" data-a="ap-info" data-k="'+e.k+'" aria-label="info">'+ic('more')+'</button></div>').join('')+'</div>';
  const tbl='<div class="vwrap scrollx"><table class="lv ap2list"><thead><tr><th></th><th>'+tr('Application','App')+'</th><th>'+tr('Description','Description')+'</th><th>'+tr('Catégorie','Category')+'</th><th>'+tr('État','Status')+'</th><th></th></tr></thead><tbody>'+
    list.map(e=>{const s=apStatus(e);return '<tr><td style="width:46px"><span class="ap2i" style="--k:'+pcol(e.col)+'">'+ic(e.icon)+'</span></td><td><b>'+esc(nm(e))+'</b>'+(e.nv?' <span class="ap2n">VELUME</span>':'')+'</td><td class="muted">'+esc(ds(e))+'</td><td>'+esc(LANG==='fr'?CATS[e.cat][0]:CATS[e.cat][1])+'</td><td>'+(s==='inst'?'<span class="badge good">'+tr('Installée','Installed')+'</span>':s==='avail'?'<span class="badge">'+tr('Non installée','Not installed')+'</span>':'<span class="badge warn">'+tr('Pas encore développée','Not built yet')+'</span>')+'</td><td><div class="ap2b" style="margin:0">'+btns(e)+'</div></td></tr>'}).join('')+'</tbody></table></div>';
  const empty='<div class="emp"><h3>'+tr('Aucune application trouvée','No app found')+'</h3></div>';
  const fl=(id,fr,en)=>'<button data-a="ap-flt" data-f="'+id+'" aria-pressed="'+(flt===id)+'">'+tr(fr,en)+'</button>';
  const n=list.length;
  const head='<div class="cp gut"><div class="cp-top"><div class="cp-left"><span class="cp-title">Apps</span></div>'+
    '<div class="cp-search"><div class="sbox"><span class="facet"><span class="fi">'+ic('filter')+'</span><span class="ft">Apps</span></span><input id="aq" data-fk="aq" placeholder="'+tr('Rechercher...','Search...')+'" value="'+esc(UI.aq||'')+'" autocomplete="off"></div></div>'+
    '<div class="cp-right"><span class="pager num">'+(n?'1-'+n:'0')+' / '+n+'</span><div class="viewsw"><button class="ib '+(view==='k'?'on':'')+'" data-a="ap-view" data-v="k" aria-label="kanban">'+ic('kanban')+'</button><button class="ib '+(view==='l'?'on':'')+'" data-a="ap-view" data-v="l" aria-label="list">'+ic('list')+'</button></div></div></div>'+
    '<div class="cp-bottom"><div class="seg" role="group">'+fl('all','Toutes','All')+fl('inst','Installées','Installed')+fl('avail','À installer','To install')+fl('nv','Nouveautés Velume','Velume additions')+'</div><span class="muted" style="font-size:.84rem">'+tr('Les applications « Pas encore développées » enregistrent votre demande.','Apps not built yet will register your request.')+'</span></div></div>';
  return head+'<div class="va gut"><div class="appcat">'+side+'<div>'+(n?(view==='k'?grid:tbl):empty)+'</div></div></div>';
};
A['ap-sec']=el=>{UI.asec=el.dataset.s;UI.acat2='all';render()};
A['ap-cat']=el=>{UI.acat2=el.dataset.c;render()};
A['ap-view']=el=>{UI.aview=el.dataset.v;render()};
A['ap-flt']=el=>{UI.aflt=el.dataset.f;render()};
A['ap-info']=el=>openModal('appinfo',{k:el.dataset.k});
A['ap-open']=el=>{const e=CAT.find(x=>x.k===el.dataset.k);if(!e||!e.real)return;UI.modal=null;openApp(e.real,e.menu||undefined)};
A['ap-install']=el=>{const e=CAT.find(x=>x.k===el.dataset.k);if(!e)return;
  if(!e.real){openModal('appinfo',{k:e.k});return}
  ST.installed[e.real]=true;save();UI.modal=null;toast(tr('Application installée : ','App installed: ')+(LANG==='fr'?e.fr:e.en));openApp(e.real,e.menu||undefined)};
A['ap-uninstall']=el=>{const e=CAT.find(x=>x.k===el.dataset.k);if(!e||!e.real)return;ST.installed[e.real]=false;save();UI.modal=null;toast(tr('Application désinstallée (vos données sont conservées).','App uninstalled (your data is kept).'));render()};
A['ap-wish']=el=>{ST.wish=ST.wish||{};ST.wish[el.dataset.k]=!ST.wish[el.dataset.k];save();toast(ST.wish[el.dataset.k]?tr('Demande enregistrée : on vous la propose en priorité.','Request saved: it will be prioritised.'):tr('Demande retirée.','Request removed.'));render()};
MODALS.appinfo={title:p=>{const e=CAT.find(x=>x.k===p.k)||{};return LANG==='fr'?e.fr:e.en},wide:false,
  body:p=>{const e=CAT.find(x=>x.k===p.k);if(!e)return '';const s=apStatus(e);ST.wish=ST.wish||{};
    const real=e.real?APPS.find(a=>a.id===e.real):null;
    const st=s==='inst'?'<span class="badge good">'+tr('Installée','Installed')+'</span>':s==='avail'?'<span class="badge">'+tr('Non installée','Not installed')+'</span>':'<span class="badge warn">'+tr('Pas encore développée dans VELUME','Not built in VELUME yet')+'</span>';
    return '<div class="ap2info"><span class="ap2i" style="--k:'+pcol(e.col)+'">'+ic(e.icon)+'</span><div style="min-width:0"><p>'+esc(LANG==='fr'?e.dfr:e.den)+'</p><div style="margin-top:8px">'+st+(e.nv?' <span class="ap2n">VELUME</span>':'')+'</div></div></div>'+
     '<div class="ap2kv"><span>'+tr('Catégorie','Category')+'</span><span>'+esc(LANG==='fr'?CATS[e.cat][0]:CATS[e.cat][1])+'</span><span>'+tr('Nom technique','Technical name')+'</span><span><code>'+esc(e.k)+'</code></span>'+
     (real?'<span>'+tr('Menus inclus','Included menus')+'</span><span>'+esc(real.menus.map(m=>L(m.l)).join(' · '))+'</span>':'')+
     (s==='na'?'<span>'+tr('Votre demande','Your request')+'</span><span>'+(ST.wish[e.k]?'✓ '+tr('enregistrée','saved'):tr('aucune','none'))+'</span>':'')+'</div>'+
     (s==='na'?'<p class="muted" style="margin-top:12px;font-size:.88rem">'+tr('Cette application d’Odoo n’est pas encore reproduite dans VELUME. Cliquez sur « Je la veux » pour la marquer comme prioritaire : elle sera construite d’après vos captures d’écran.','This Odoo app is not reproduced in VELUME yet. Click “I want it” to mark it as a priority: it will be built from your screenshots.')+'</p>':'');},
  foot:()=>{const p=UI.modal.p;const e=CAT.find(x=>x.k===p.k);if(!e)return '<button class="btn" data-a="mclose">'+tr('Fermer','Close')+'</button>';const s=apStatus(e);ST.wish=ST.wish||{};
    return (s==='inst'?'<button class="btn pri" data-a="ap-open" data-k="'+e.k+'">'+tr('Ouvrir','Open')+'</button><button class="btn danger" data-a="ap-uninstall" data-k="'+e.k+'">'+tr('Désinstaller','Uninstall')+'</button>':s==='avail'?'<button class="btn pri" data-a="ap-install" data-k="'+e.k+'">'+tr('Installer','Install')+'</button>':'<button class="btn pri" data-a="ap-wish" data-k="'+e.k+'">'+(ST.wish[e.k]?tr('Retirer ma demande','Remove my request'):tr('Je la veux','I want it'))+'</button>')+'<button class="btn" data-a="mclose">'+tr('Fermer','Close')+'</button>'}};

/* ---------- données de démonstration ---------- */
window.__seedApps2=function(){
  const C=(m,v)=>D.create(m,v,{silent:true});const today=new Date();const ago=n=>iso(addDays(today,-n)),ahead=n=>iso(addDays(today,n));const agoT=(n,h,mi)=>{const d=addDays(today,-n);d.setHours(h,mi||0,0,0);return isoDT(d)};
  const emp=D.all('employee'),eP=ST.me||(emp[0]||{}).id,e1=(emp[1]||emp[0]||{}).id,e2=(emp[2]||emp[0]||{}).id,e3=(emp[3]||emp[0]||{}).id;
  const cust=D.all('partner').filter(p=>p.kind!=='supplier');const cu=i=>(cust[i%Math.max(1,cust.length)]||{}).id;
  const prods=D.all('product'),pr=i=>prods[i%Math.max(1,prods.length)];
  const projs=D.all('project'),pj=i=>(projs[i%Math.max(1,projs.length)]||{}).id;
  // ventes
  [[0,'sale',[0,1]],[2,'sent',[2]],[4,'draft',[3,4]]].forEach((s,i)=>{const lines=s[2].map(k=>{const p=pr(k);return p?{item:p.id,qty:1+(k%3),price:Math.round((+p.price||0)/(1+TVA()/100))}:null}).filter(Boolean);
    C('saleorder',{customer:cu(s[0]),date:ago(i*2),valid:ahead(15),state:s[1],lines:lines})});
  // congés
  C('leave',{name:T('Congé annuel','Annual leave'),emp:e1,kind:'paid',from:ahead(10),to:ahead(14),state:'sub',approver:eP});
  C('leave',{name:T('Consultation médicale','Medical appointment'),emp:e2,kind:'sick',from:ago(3),to:ago(2),state:'ok',approver:eP});
  C('leave',{name:T('Mariage d’un proche','Relative’s wedding'),emp:e3,kind:'fam',from:ahead(20),to:ahead(22),state:'ok',approver:eP});
  C('leave',{name:T('Congé sans solde','Unpaid leave'),emp:e1,kind:'unpaid',from:ahead(30),to:ahead(33),state:'draft'});
  // présences
  [[1,eP,8,0,17,30,'bar'],[1,e1,9,0,18,0,'bar'],[1,e2,10,0,19,0,'studio'],[2,eP,8,15,17,0,'bar'],[2,e1,9,5,17,45,'bar'],[2,e3,11,0,20,0,'out'],[3,eP,8,0,16,30,'bar'],[0,e1,9,0,0,0,'bar']].forEach(a=>
    C('attend',{emp:a[1],cin:agoT(a[0],a[2],a[3]),cout:a[4]?agoT(a[0],a[4],a[5]):'',place:a[6]}));
  // feuilles de temps
  [['Retouche shooting lookbook',2,3],['Montage épisode podcast',1,4],['Planning du mois',0,2],['Tournage clip',2,6],['Accueil studio photo',1,2],['Mixage audio',1,3]].forEach((t,i)=>
    C('timesheet',{name:T(t[0],t[0]),date:ago(i),emp:[eP,e1,e2][i%3],project:pj(t[1]),hours:t[2]}));
  // recrutement
  [['Aïcha Ngono','Barista','screen','wa',120000,3],['Brice Tchamba','Serveur','int','walk',100000,4],['Carine Mbarga','Retoucheuse photo','new','insta',180000,0],['Dieudonné Fotso','Ingénieur du son','offer','ref',220000,5],['Estelle Kamga','Caissière','hired','walk',110000,4]].forEach((a,i)=>
    C('jobapp',{name:a[0],job:T(a[1],a[1]),stage:a[2],src:a[3],salary:a[4],prio:a[5],phone:'6 9'+(10+i)+' 55 '+(20+i)+' 0'+i,date:ago(i*3)}));
  // paie
  [[eP,350000],[e1,150000],[e2,200000]].forEach((a,i)=>C('payslip',{emp:a[0],period:iso(today).slice(0,8)+'01',gross:a[1],other:i===1?5000:0,state:i===0?'ok':'draft',how:i===0?'bank':'om'}));
  // galeries
  [['Shooting lookbook — Nyah',0,'photo','edit',48],['Interview — Douala Talks #12',2,'podcast','ready',1],['Clip — Studio Mbock',3,'video','shoot',0],['Portraits famille Essomba',1,'photo','sent',36]].forEach((g,i)=>
    C('gallery',{name:T(g[0],g[0]),client:cu(g[1]),studio:g[2],state:g[3],count:g[4],date:ago(i*2+1),editor:e2,link:g[3]==='sent'||g[3]==='ready'?'https://velume.example/galerie/'+(100+i):'',expire:g[3]==='sent'?ahead(5):ahead(30)}));
  // livraisons
  [['Akwa — rue Joss','way','own',4500],['Bonapriso — Ancien Aéroport','prep','glovo',7500],['Bonamoussadi — Carrefour Shell','new','moto',3200],['Makepe — Missoke','done','yango',5200]].forEach((d,i)=>
    C('delivery',{client:cu(i+1),phone:'6 77 12 3'+i+' 4'+i,addr:T(d[0],d[0]),state:d[1],via:d[2],amount:d[3],fee:1000,rider:d[2]==='own'?e3:null,when:agoT(0,10+i*2,15),pay:['cash','om','momo','cash'][i]}));
  // recettes
  const si=n=>D.all('stockitem').find(x=>String(tx(x.name)).toLowerCase().indexOf(n)===0);
  const R=(n,cat,price,ings)=>C('recipe',{name:T(n[0],n[1]),cat:cat,price:price,lines:ings.map(g=>{const it=si(g[0]);return it?{item:it.id,qty:g[1],cost:it.cost}:null}).filter(Boolean),steps:T('Doser, extraire, texturer le lait, servir.','Dose, extract, steam the milk, serve.')});
  R(['Cappuccino','Cappuccino'],'hot',1500,[['café arabica',0.018],['lait entier',0.15],['gobelets',1],['couvercles',1]]);
  R(['Latte vanille','Vanilla latte'],'hot',2000,[['café arabica',0.018],['lait entier',0.2],['sirop vanille',0.03],['gobelets',1],['couvercles',1]]);
  R(['Espresso','Espresso'],'hot',1000,[['café arabica',0.009],['gobelets',1]]);
  R(['Latte glacé avoine','Iced oat latte'],'cold',2300,[['café arabica',0.018],['lait d’avoine',0.2],['gobelets',1],['couvercles',1]]);
  R(['Croissant','Croissant'],'dessert',800,[['croissants',1]]);
  // hygiène
  [['Ouverture du bar','open','bar',null,'ok',0,8],['Température frigo principal','temp','fridge',4,'ok',0,9],['Température congélateur','temp','fridge',-14,'nok',1,9],['Nettoyage machine espresso','clean','bar',null,'ok',1,19],['Fermeture du bar','close','bar',null,'ok',1,21],['Sanitaires','clean','wc',null,'ok',0,12]].forEach(h=>
    C('hygiene',{name:T(h[0],h[0]),kind:h[1],zone:h[2],temp:h[3],result:h[4],date:agoT(h[5],h[6],0),by:[eP,e1,e3][h[6]%3],action:h[4]==='nok'?T('Vérifier le joint et la température, contrôle à nouveau dans 2 h.','Check the seal and temperature, re-check in 2 h.'):''}));
  // visibilité : les clones Odoo sont à installer ; les ajouts Velume sont déjà installés
  ST.installed=ST.installed||{};
  ['sales','contacts','timeoff','attendance','timesheets','recruitment','payroll'].forEach(k=>{if(ST.installed[k]===undefined)ST.installed[k]=false});
  ['gallery','delivery','recipes','hygiene'].forEach(k=>{if(ST.installed[k]===undefined)ST.installed[k]=true});
  ST.seedA2=1;
};
})();
