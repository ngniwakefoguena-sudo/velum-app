/* =====================================================================
   v54 — Location studio ⇄ Caisse ⇄ Tableaux de bord
   · un produit de location alimente automatiquement la caisse Podcast ou Shooting
   · « Encaisser à la caisse » depuis une réservation (le client paie, ticket du service)
   · Vue d'ensemble Studios : réservations, à encaisser, ventes par caisse
   ===================================================================== */
{
const addF=(m,k,t,fr,en,o)=>{if(M[m]&&!M[m].f[k])M[m].f[k]=Object.assign({k:k,t:t,fr:fr,en:en},o||{})};
const STUD={photo:['Studio photo','Photo studio'],podcast:['Studio podcast','Podcast studio'],video:['Studio vidéo','Video studio']};
const REGN={bar:['Vélume Coffee','Vélume Coffee'],podcast:['Vélume Studios — Podcast','Vélume Studios — Podcast'],shoot:['Vélume Studios — Photo / Shooting','Vélume Studios — Photo / Shoots']};
const rl=k=>(REGN[k]||[k,k])[LANG==='fr'?0:1];
const sl=k=>(STUD[k]||[k,k])[LANG==='fr'?0:1];
const regOf=p=>p&&p.studio==='podcast'?'podcast':'shoot';

/* 1. produits de location → bonne caisse, visibles à la caisse */
{const pc=M.product.compute;M.product.compute=function(r){if(pc)pc.apply(this,arguments);try{if(r.kind==='rental'){r.reg=regOf(r);if(r.pos==null)r.pos=true}}catch(e){}}}
function fixRentalProducts(){try{D.all('product').filter(p=>p.kind==='rental'&&(p.reg!==regOf(p)||p.pos===false&&false)).forEach(p=>D.write('product',p.id,{reg:regOf(p)},{silent:true}))}catch(e){}}
{const pb=window.__pro4Boot;window.__pro4Boot=function(){try{fixRentalProducts()}catch(e){}return pb&&pb.apply(this,arguments)};setTimeout(fixRentalProducts,2800)}
{addF('product','reg','sel','Caisse (point de vente)','Register (point of sale)',{});
 const rp=ACT.rent_products;if(rp&&rp.form&&rp.form.cols&&rp.form.cols[1]&&!rp.form.cols[1].includes('reg')){rp.form.cols[1].splice(1,0,'reg')}
 if(M.product.f.reg){M.product.f.reg.ro=true}}

/* 2. champs « payé » sur la location, lien commande */
addF('rental','paid','bool','Payée à la caisse','Paid at register',{def:false,ro:1});
addF('rental','order','m2o','Ticket de caisse','Register receipt',{rel:'posorder',ro:1});
addF('rental','paidat','datetime','Payée le','Paid on',{ro:1});
addF('posorder','rental','m2o','Location','Rental',{rel:'rental',ro:1});

/* 3. encaisser une location à la caisse */
function pickCfg(){const l=D.all('poscfg');return l.find(c=>c.reg==='studios')||l[0]}
function payRental(id){
  const r=D.get('rental',+id);if(!r)return;
  if(r.paid)return toast(tr('Cette location est déjà payée.','This rental is already paid.'));
  const lines=(r.lines||[]).filter(l=>l.product&&D.get('product',+l.product));
  if(!lines.length)return toast(tr('Ajoutez d’abord une formule ou un produit à la location.','First add a package or product to the rental.'));
  try{if(FV&&FV.dirty)saveForm({quiet:true})}catch(e){}
  const cfg=pickCfg();if(!cfg)return toast(tr('Aucun point de vente configuré.','No point of sale configured.'));
  UI.modal=null;openTill(cfg.id);
  const t=UI.till;if(!t)return;
  t.cart=lines.map(l=>({p:+l.product,q:+l.qty||1}));t.reg=regOf(D.get('product',+lines[0].product));t.partner=r.partner||null;t.rental=r.id;t.showord=true;t.cat='all';t.q='';
  const diff=lines.some(l=>(+l.price||0)!==(D.get('product',+l.product).price||0));
  render();toast(tr('Location chargée à la caisse : ','Rental loaded at the register: ')+(r.ref||'')+(diff?' · '+tr('tarif du catalogue appliqué','catalogue price applied'):''))}
window.__payRental=payRental;
A['loc-pay']=el=>payRental(el.dataset.id);
A['loc-ticket']=el=>openModal('report',{kind:'posorder',id:+el.dataset.id});
A['loc-new']=()=>{try{goTo('rental','rent_quotes');openForm(ACT.rent_quotes,'new');render()}catch(e){}};
A['loc-till']=el=>{const c=pickCfg();if(!c)return;openTill(c.id);if(UI.till){UI.till.reg=el.dataset.r;render()}};
{const tv=A['till-validate'];A['till-validate']=function(){
  const t=UI.till,rid=t&&t.rental;const ids=new Set(D.all('posorder').map(o=>o.id));
  const r=tv.apply(this,arguments);
  try{if(rid){const o=D.all('posorder').find(x=>!ids.has(x.id));if(o){D.write('posorder',o.id,{rental:rid},{silent:true});const rr=D.get('rental',rid);
      D.write('rental',rid,{paid:true,order:o.id,paidat:isoDT(new Date()),deposit:true,state:rr&&rr.state==='quote'?'confirmed':(rr?rr.state:'confirmed')},{silent:true});
      if(UI.till)UI.till.rental=null;save();render()}}}catch(e){try{console.error(e)}catch(x){}}
  return r}}
{const F=ACT.rent_quotes&&ACT.rent_quotes.form;if(F){
  if(F.cols&&F.cols[1]&&!F.cols[1].includes('paid'))F.cols[1].push('paid','order');
  if(!F.btns.some(b=>b.l[0]==='Encaisser à la caisse')){
   F.btns.unshift({l:['Encaisser à la caisse','Pay at the register'],icon:'pos',pri:1,when:b=>!!b.id&&!b.paid&&b.state!=='cancel'&&(b.lines||[]).length>0,fn:b=>payRental(b.id)},
                  {l:['Réimprimer le ticket','Reprint receipt'],icon:'print',when:b=>!!b.paid&&!!b.order,fn:b=>openModal('report',{kind:'posorder',id:b.order})})}}
 ['rent_quotes','rent_orders','rent_planning','rent_report'].forEach(k=>{const a=ACT[k];if(!a)return;if(a.list&&!a.list.includes('paid')){const i=a.list.indexOf('amount');a.list.splice(i>=0?i:a.list.length,0,'paid')}
   if(a.filters&&!a.filters.some(f=>f[0]==='unpaid'))a.filters.push(['unpaid',['À encaisser','To collect'],r=>!r.paid&&r.state!=='cancel'&&r.state!=='quote'])})}

/* 4. ticket du service choisi (écran) */
{const m=MODALS.report;if(m&&!m.__loc){m.__loc=1;const b0=m.body;m.body=function(p){let h=b0.apply(this,arguments);
  try{if(p&&p.kind==='posorder'){const o=D.get('posorder',p.id);const rt=o&&o.rental&&D.get('rental',o.rental);
    if(o&&(rt||o.reg==='podcast'||o.reg==='shoot')){
      const x='<div style="text-align:center;margin:6px 0 10px"><span class="badge gold" style="font-size:.9rem">'+esc(rl(o.reg||'shoot'))+'</span>'+(rt?'<div class="muted" style="margin-top:6px">'+esc(rt.ref||'')+' · '+esc(sl(rt.studio))+'<br>'+esc(fmtDT(rt.start))+' → '+esc((rt.stop||'').slice(11,16))+'</div>':'')+'</div>';
      h=h.replace(/(<h2 style="margin:10px 0 2px">[\s\S]*?<\/p><\/div>)/,'$1'+x)}}}catch(e){}
  return h}}}

/* 5. Vue d'ensemble Studios */
CUSTOM.studiodash=function(){
  const today=iso(new Date()),mon=today.slice(0,7);
  const os=D.all('posorder').filter(o=>o.state!=='cancel');
  const sumReg=(k,f)=>sum(os.filter(o=>(o.reg||'bar')===k&&f((o.date||'').slice(0,10))),o=>o.total);
  const rs=D.all('rental').filter(r=>r.state!=='cancel');
  const todayR=rs.filter(r=>(r.start||'').slice(0,10)===today).sort((a,b)=>a.start>b.start?1:-1);
  const next=rs.filter(r=>(r.start||'').slice(0,10)>today&&(r.start||'').slice(0,10)<=iso(addDays(new Date(),7))).sort((a,b)=>a.start>b.start?1:-1);
  const due=rs.filter(r=>!r.paid&&r.state!=='quote'&&(r.start||'').slice(0,10)<=iso(addDays(new Date(),7)));
  const kp=(l,v,c)=>'<div class="kpi"><span>'+l+'</span><b'+(c?' style="color:'+c+'"':'')+'>'+v+'</b></div>';
  const row=r=>'<tr><td><b>'+esc((r.start||'').slice(11,16))+'</b>–'+esc((r.stop||'').slice(11,16))+'<div class="muted" style="font-size:.8rem">'+esc((r.start||'').slice(5,10).split('-').reverse().join('/'))+'</div></td><td>'+esc(D.name('partner',r.partner)||'—')+'<div class="muted" style="font-size:.82rem">'+esc(sl(r.studio))+' · '+esc(r.ref||'')+'</div></td><td class="r">'+money(r.amount||0)+'</td><td>'+(r.paid?'<span class="badge good">'+tr('Payé','Paid')+'</span>':'<span class="badge warn">'+tr('À encaisser','To collect')+'</span>')+'</td><td style="text-align:right;white-space:nowrap">'+(r.paid&&r.order?'<button class="btn sm" data-a="loc-ticket" data-id="'+r.order+'">'+tr('Ticket','Receipt')+'</button>':(r.state==='cancel'?'':'<button class="btn pri sm" data-a="loc-pay" data-id="'+r.id+'">'+tr('Encaisser','Pay')+'</button>'))+'</td></tr>';
  const tbl=l=>l.length?'<div class="scrollx"><table class="lv lines"><tbody>'+l.map(row).join('')+'</tbody></table></div>':'<p class="muted">'+tr('Aucune réservation.','No booking.')+'</p>';
  const regs=['bar','podcast','shoot'];
  const recent=os.filter(o=>o.reg==='podcast'||o.reg==='shoot'||o.rental).sort((a,b)=>a.date<b.date?1:-1).slice(0,8);
  return pageHead(tr('Studios — vue d’ensemble','Studios — overview'),'<button class="btn" data-a="loc-till" data-r="podcast">🎙️ '+tr('Caisse Podcast','Podcast register')+'</button><button class="btn" data-a="loc-till" data-r="shoot">📷 '+tr('Caisse Shooting','Shoot register')+'</button><button class="btn pri" data-a="loc-new">'+ic('plus')+tr('Nouvelle réservation','New booking')+'</button>')+
  '<div class="va gut"><div class="kpis">'+kp(tr('Réservations aujourd’hui','Bookings today'),todayR.length)+kp(tr('À encaisser (7 j)','To collect (7 d)'),money(sum(due,r=>r.amount)),due.length?'var(--warn)':'')+regs.map(k=>kp(rl(k)+' · '+tr('aujourd’hui','today'),money(sumReg(k,d=>d===today)))).join('')+kp(tr('Studios — ce mois','Studios — this month'),money(sumReg('podcast',d=>d.slice(0,7)===mon)+sumReg('shoot',d=>d.slice(0,7)===mon)),'var(--good)')+'</div>'+
  '<div class="grid2"><div class="card"><h3>'+tr('Aujourd’hui','Today')+'</h3>'+tbl(todayR)+'</div><div class="card"><h3>'+tr('7 prochains jours','Next 7 days')+'</h3>'+tbl(next)+'</div></div>'+
  '<div class="grid2" style="margin-top:12px"><div class="card"><h3>'+tr('Ventes par caisse — ce mois','Sales by register — this month')+'</h3>'+regs.map(k=>'<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--line)"><span>'+esc(rl(k))+'</span><b>'+money(sumReg(k,d=>d.slice(0,7)===mon))+'</b></div>').join('')+'<p class="muted" style="margin:8px 0 0;font-size:.85rem">'+tr('Chaque paiement à la caisse alimente ce tableau et le tableau de bord du point de vente.','Every register payment feeds this page and the point-of-sale dashboard.')+'</p></div>'+
  '<div class="card"><h3>'+tr('Derniers tickets studios','Latest studio receipts')+'</h3>'+(recent.length?recent.map(o=>'<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line)"><span>'+esc(o.ref||'')+' <span class="muted">· '+esc(rl(o.reg))+'</span></span><span><b>'+money(o.total)+'</b> <button class="btn sm" data-a="loc-ticket" data-id="'+o.id+'">'+tr('Ticket','Receipt')+'</button></span></div>').join(''):'<p class="muted">—</p>')+'</div></div></div>'};
[['rental','r_q','r_dash'],['pos','p_dash','p_studio']].forEach(x=>{const a=APPS.find(z=>z.id===x[0]);if(a&&!a.menus.some(m=>m.id===x[2])){const mn=M_(x[2],['Vue d’ensemble Studios','Studios overview'],null,{cus:'studiodash'});if(x[0]==='rental')a.menus.unshift(mn);else a.menus.splice(1,0,mn)}});
}
