/* =====================================================================
   v54 — Paie conforme à la législation camerounaise (calcul automatique)
   + bulletin de paie PDF (téléchargement / impression) + paramètres de paie
   Sources des taux : CNPS, CGI (barème IRPP), pages fiscales publiques — à valider
   avec votre comptable ; tous les taux sont modifiables dans Paramètres > Paie.
   ===================================================================== */
{
const DEF={pay_pvs:4.2,pay_pve:4.2,pay_pf:7,pay_at:1.75,pay_cap:750000,pay_cfcs:1,pay_cfce:1.5,pay_fne:1,pay_frais:30,pay_abat:500000,pay_cac:10,pay_exo:62000,
  pay_irpp:'2000000:10;3000000:15;5000000:25;*:35',
  pay_rav:'50000:0;100000:750;200000:1950;300000:3250;400000:4550;500000:5850;600000:7150;700000:8450;800000:9750;900000:11050;1000000:12350;*:13000',
  pay_tdl:'62000:0;75000:3000;100000:6000;125000:9000;150000:12000;200000:15000;250000:18000;300000:24000;500000:27000;*:30000'};
const S=()=>ST.set||{};
const kLbl=(m,f,v)=>{try{const o=(M[m].f[f].opts||[]).find(x=>x[0]===v);return o?(LANG==='fr'?o[1]:o[2]):(v||'')}catch(e){return v||''}};
const pn=k=>{const v=S()[k];return(v!=null&&v!==''&&isFinite(+v))?+v:DEF[k]};
const scale=k=>{const t=String(S()[k]||DEF[k]);return t.split(/[;\n]/).map(x=>x.trim()).filter(Boolean).map(x=>{const a=x.split(':');return [/^[*∞]|inf/i.test(a[0])?Infinity:+String(a[0]).replace(/\s/g,''),+String(a[1]).replace(/\s/g,'').replace(',','.')]}).filter(a=>!isNaN(a[0])&&!isNaN(a[1])).sort((a,b)=>a[0]-b[0])};
const pick=(sc,v)=>{for(const a of sc){if(v<=a[0])return a[1]}return sc.length?sc[sc.length-1][1]:0};
const progressive=(sc,v)=>{let prev=0,tot=0;for(const a of sc){if(v>prev){tot+=(Math.min(v,a[0])-prev)*a[1]/100}prev=a[0];if(v<=a[0])break}return tot};
const R=Math.round;
function legal(r){
  const gross=+r.gross||0,ntx=sum((r.inputs||[]).filter(l=>String(l.nt||'')==='1'),l=>l.amt);
  const sbt=Math.max(0,gross-ntx),cap=pn('pay_cap'),cot=Math.min(sbt,cap);
  const pvs=R(cot*pn('pay_pvs')/100),cfc=R(sbt*pn('pay_cfcs')/100);
  const exo=sbt<pn('pay_exo');
  const snc=Math.max(0,sbt*(1-pn('pay_frais')/100)-pvs-pn('pay_abat')/12);
  const irpp=exo?0:R(progressive(scale('pay_irpp'),snc*12)/12);
  const cac=R(irpp*pn('pay_cac')/100);
  const rav=S().pay_rav_off?0:R(pick(scale('pay_rav'),sbt));
  const tdl=(S().pay_tdl_off||exo)?0:R(pick(scale('pay_tdl'),sbt)/12);
  const ret=pvs+cfc+irpp+cac+rav+tdl+(+r.other||0);
  const pve=R(cot*pn('pay_pve')/100),pf=R(cot*pn('pay_pf')/100),at=R(cot*pn('pay_at')/100),cfce=R(sbt*pn('pay_cfce')/100),fne=R(sbt*pn('pay_fne')/100);
  return {sbt,ntx,cot,pvs,cfc,irpp,cac,rav,tdl,ret,net:gross-ret,pve,pf,at,cfce,fne,pat:pve+pf+at+cfce+fne,cost:gross+pve+pf+at+cfce+fne,snc:R(snc)}}
window.__payLegal=legal;

/* ---- champs ---- */
const addF=(m,k,t,fr,en,o)=>{if(M[m]&&!M[m].f[k])M[m].f[k]=Object.assign({k:k,t:t,fr:fr,en:en},o||{})};
[['sbt','Salaire brut imposable','Taxable gross salary'],['cfc','CFC (1 %)','CFC (1 %)'],['irpp','IRPP (impôt sur le revenu)','IRPP (income tax)'],['cac','CAC (10 % de l’IRPP)','CAC (10 % of IRPP)'],['tdl','Taxe de développement local (TDL)','Local development tax (TDL)'],['rav','Redevance audiovisuelle (RAV)','Audiovisual fee (RAV)'],['ret','Total des retenues','Total deductions'],['pat','Charges patronales','Employer charges'],['cost','Coût total employeur','Total employer cost']].forEach(a=>addF('payslip',a[0],'money',a[1],a[2],{ro:1,def:0}));
M.payslip.f.cnps.fr='CNPS — pension vieillesse (4,2 %)';M.payslip.f.cnps.en='CNPS — old-age pension (4.2 %)';
M.payslip.f.other.fr='Autres retenues (avances, prêts…)';M.payslip.f.other.en='Other deductions (advances, loans…)';
M.payslip.f.net.fr='NET À PAYER';M.payslip.f.net.en='NET PAY';
addF('employee','cnpsno','char','N° CNPS du salarié','Employee CNPS no.',{});
{const f=M.payslip.f.inputs;if(f&&f.cols&&!f.cols.some(c=>c.k==='nt')){f.cols.push({k:'nt',t:'sel',fr:'Cotisations / impôt',en:'Contributions / tax',opts:[['','Imposable','Taxable',''],['1','Non imposable','Non-taxable','']],w:130})}}

/* ---- calcul ---- */
{const pc=M.payslip.compute;M.payslip.compute=function(r){
  try{
    const sum2=(a,f)=>a.reduce((t,x)=>t+(+f(x)||0),0);
    r.bonus=Math.round(sum2(r.inputs||[],l=>l.amt));
    const ps=pdt(r.period);
    if(ps&&r.emp){const pe=new Date(ps.getFullYear(),ps.getMonth()+1,0);let un=0,pl=0;D.all('leave').forEach(l=>{if(l.emp!==r.emp||l.state!=='ok')return;const x=pdt(l.from),y=pdt(l.to);if(!x||!y)return;const lo=x>ps?x:ps,hi=y<pe?y:pe;const d=hi<lo?0:Math.round((hi-lo)/864e5)+1;if(l.kind==='unpaid')un+=d;else pl+=d});
      r.unpaid=un;r.pl=pl;r.wdays=Math.max(0,30-un);r.ded=Math.round((+r.base||0)/30*un)}
    if(+r.base>0)r.gross=Math.round(+r.base+r.bonus-(r.ded||0));
    const L=legal(r);
    r.sbt=L.sbt;r.cnps=L.pvs;r.cfc=L.cfc;r.irpp=L.irpp;r.cac=L.cac;r.rav=L.rav;r.tdl=L.tdl;r.ret=L.ret;r.net=L.net;r.pat=L.pat;r.cost=L.cost;
  }catch(e){try{console.error(e)}catch(x){}return pc.apply(this,arguments)}}}
function pdt(s){if(!s)return null;const m=String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);return m?new Date(+m[1],+m[2]-1,+m[3]):null}

/* ---- lignes du bulletin (écran + PDF) ---- */
function slipRows(b){
  const L=legal(b),rows=[],pr=k=>pn(k)+' %';
  rows.push({k:'sub',label:tr('GAINS','EARNINGS')});
  rows.push({label:tr('Salaire de base','Base salary'),base:'30 j',gain:+b.base||(+b.gross||0)});
  (b.inputs||[]).forEach(l=>{if(+l.amt)rows.push({label:(l.label||tr('Prime / entrée','Bonus / input'))+(String(l.nt||'')==='1'?' ('+tr('non imposable','non-taxable')+')':''),gain:+l.amt>0?+l.amt:0,ret:+l.amt<0?-l.amt:0})});
  if(+b.ded)rows.push({label:tr('Congé sans solde ('+(b.unpaid||0)+' j)','Unpaid leave ('+(b.unpaid||0)+' d)'),ret:+b.ded});
  rows.push({k:'tot',label:tr('SALAIRE BRUT','GROSS SALARY'),gain:+b.gross||0});
  rows.push({label:tr('Salaire brut imposable','Taxable gross salary'),base:L.sbt,k:'info'});
  rows.push({k:'sub',label:tr('RETENUES SALARIALES','EMPLOYEE DEDUCTIONS')});
  rows.push({label:tr('CNPS — pension vieillesse (plafonnée)','CNPS — old-age pension (capped)'),base:L.cot,rate:pr('pay_pvs'),ret:L.pvs});
  rows.push({label:tr('Crédit Foncier du Cameroun (CFC)','Crédit Foncier (CFC)'),base:L.sbt,rate:pr('pay_cfcs'),ret:L.cfc});
  rows.push({label:tr('IRPP (impôt sur le revenu)','IRPP (income tax)'),base:L.irpp?L.snc:0,rate:'barème',ret:L.irpp});
  rows.push({label:tr('Centimes additionnels communaux (CAC)','Council surtax (CAC)'),base:L.irpp,rate:pr('pay_cac'),ret:L.cac});
  if(L.tdl||!S().pay_tdl_off)rows.push({label:tr('Taxe de développement local (TDL)','Local development tax (TDL)'),ret:L.tdl});
  if(L.rav||!S().pay_rav_off)rows.push({label:tr('Redevance audiovisuelle (RAV)','Audiovisual fee (RAV)'),ret:L.rav});
  if(+b.other)rows.push({label:tr('Autres retenues (avances…)','Other deductions'),ret:+b.other});
  rows.push({k:'tot',label:tr('TOTAL DES RETENUES','TOTAL DEDUCTIONS'),ret:L.ret});
  rows.push({k:'net',label:tr('NET À PAYER','NET PAY'),gain:L.net});
  return {rows,L}}
function slipTable(b){
  const {rows,L}=slipRows(b);const c=n=>n===undefined||n===''?'':(typeof n==='string'?esc(n):fmt(n));
  const tr_=rows.map(r=>{if(r.k==='sub')return '<tr><td colspan="5" style="background:var(--bg-2,#f3ead8);font-weight:700;font-size:.8rem;letter-spacing:.06em">'+esc(r.label)+'</td></tr>';
    const st=r.k==='tot'||r.k==='net'?' style="font-weight:700;border-top:2px solid var(--line)"':(r.k==='info'?' style="color:var(--ink-2);font-size:.9rem"':'');
    return '<tr'+st+'><td>'+esc(r.label)+'</td><td class="r">'+c(r.base)+'</td><td class="r">'+esc(r.rate||'')+'</td><td class="r">'+(r.gain?c(r.gain):'')+'</td><td class="r">'+(r.ret?c(r.ret):'')+'</td></tr>'}).join('');
  return '<div class="scrollx"><table class="lv lines"><thead><tr><th>'+tr('Désignation','Item')+'</th><th class="r">'+tr('Base','Base')+'</th><th class="r">'+tr('Taux','Rate')+'</th><th class="r">'+tr('Gains','Earnings')+'</th><th class="r">'+tr('Retenues','Deductions')+'</th></tr></thead><tbody>'+tr_+'</tbody></table></div>'+
  '<p class="muted" style="font-size:.85rem;margin:10px 0 0">'+tr('Charges patronales (information) : ','Employer charges (info): ')+tr('CNPS pension ','CNPS pension ')+fmt(L.pve)+' · '+tr('prestations familiales ','family benefits ')+fmt(L.pf)+' · '+tr('accidents du travail ','work accidents ')+fmt(L.at)+' · CFC '+fmt(L.cfce)+' · FNE '+fmt(L.fne)+' = <b>'+money(L.pat)+'</b> · '+tr('coût total employeur ','total employer cost ')+'<b>'+money(L.cost)+'</b></p>'}

/* ---- paramètres Paie (Cameroun) ---- */
{const SETY=(id,fr,en,icon,blocks)=>{const i=SET.findIndex(s=>s.id===id);const e={id:id,app:id,l:[fr,en],icon:icon,blocks:blocks};if(i>=0)SET[i]=e;else SET.push(e)};
SETY('payroll','Paie','Payroll','receipt',[
 {t:['Cotisations sociales CNPS','CNPS social contributions'],o:[
  {k:'pay_pvs',st:'num',l:['Pension vieillesse — part salarié (%)','Old-age pension — employee (%)'],d:['Retenue sur le salaire (4,2 % en vigueur).','Withheld from salary (4.2 % in force).'],def:4.2},
  {k:'pay_pve',st:'num',l:['Pension vieillesse — part employeur (%)','Old-age pension — employer (%)'],d:['Charge patronale (4,2 %).','Employer charge (4.2 %).'],def:4.2},
  {k:'pay_pf',st:'num',l:['Prestations familiales — employeur (%)','Family benefits — employer (%)'],d:['7 % du salaire plafonné.','7 % of capped salary.'],def:7},
  {k:'pay_at',st:'num',l:['Accidents du travail — employeur (%)','Work accidents — employer (%)'],d:['1,75 % (risque faible), 2,5 % ou 5 % selon l’activité.','1.75 % (low risk), 2.5 % or 5 % depending on activity.'],def:1.75},
  {k:'pay_cap',st:'num',l:['Plafond mensuel de cotisation (FCFA)','Monthly contribution ceiling (FCFA)'],d:['Salaire maximal retenu pour la CNPS (750 000).','Maximum salary used for CNPS (750,000).'],def:750000}]},
 {t:['Impôts et retenues','Taxes and deductions'],o:[
  {k:'pay_cfcs',st:'num',l:['CFC — part salarié (%)','CFC — employee (%)'],d:['Crédit Foncier, sur le brut (1 %).','Crédit Foncier, on gross (1 %).'],def:1},
  {k:'pay_cfce',st:'num',l:['CFC — part employeur (%)','CFC — employer (%)'],d:['1,5 % du brut.','1.5 % of gross.'],def:1.5},
  {k:'pay_fne',st:'num',l:['FNE — employeur (%)','FNE — employer (%)'],d:['Fonds National de l’Emploi (1 %).','National Employment Fund (1 %).'],def:1},
  {k:'pay_frais',st:'num',l:['Frais professionnels (%)','Professional expenses (%)'],d:['Abattement de 30 % pour l’IRPP.','30 % allowance for IRPP.'],def:30},
  {k:'pay_abat',st:'num',l:['Abattement annuel (FCFA)','Annual allowance (FCFA)'],d:['500 000 FCFA déduits du revenu imposable.','FCFA 500,000 deducted from taxable income.'],def:500000},
  {k:'pay_cac',st:'num',l:['CAC (% de l’IRPP)','CAC (% of IRPP)'],d:['Centimes additionnels communaux (10 %).','Council surtax (10 %).'],def:10},
  {k:'pay_exo',st:'num',l:['Seuil d’exonération IRPP (FCFA / mois)','IRPP exemption threshold (FCFA / month)'],d:['Pas d’IRPP, CAC ni TDL sous ce brut (62 000).','No IRPP, CAC or TDL below this gross (62,000).'],def:62000},
  {k:'pay_rav_off',st:'bool',l:['Désactiver la RAV','Disable RAV'],d:['Redevance audiovisuelle.','Audiovisual fee.'],def:false},
  {k:'pay_tdl_off',st:'bool',l:['Désactiver la TDL','Disable TDL'],d:['Taxe de développement local.','Local development tax.'],def:false}]},
 {t:['Barèmes (modifiables)','Scales (editable)'],o:[
  {k:'pay_irpp',st:'text',l:['Barème IRPP annuel','Annual IRPP scale'],d:['Format « plafond:taux ; … ; *:taux ». Tranches progressives.','Format “ceiling:rate ; … ; *:rate”. Progressive brackets.'],def:DEF.pay_irpp},
  {k:'pay_rav',st:'text',l:['Barème RAV (mensuel)','RAV scale (monthly)'],d:['Format « brut jusqu’à:montant ; … ».','Format “gross up to:amount ; …”.'],def:DEF.pay_rav},
  {k:'pay_tdl',st:'text',l:['Barème TDL (montant ANNUEL)','TDL scale (ANNUAL amount)'],d:['Divisé par 12 chaque mois. Format « brut jusqu’à:montant annuel ».','Divided by 12 each month. Format “gross up to:annual amount”.'],def:DEF.pay_tdl}]},
 {t:['Identité de l’employeur (bulletin)','Employer identity (payslip)'],o:[
  {k:'pay_niu',st:'text',l:['N° de contribuable (NIU)','Taxpayer no. (NIU)'],d:['Imprimé sur le bulletin.','Printed on the payslip.'],def:''},
  {k:'pay_cnpsemp',st:'text',l:['N° employeur CNPS','CNPS employer no.'],d:['Imprimé sur le bulletin.','Printed on the payslip.'],def:''},
  {k:'pay_addr',st:'text',l:['Adresse de l’entreprise','Company address'],d:['Ex. : Douala, Cameroun.','E.g. Douala, Cameroon.'],def:'Douala, Cameroun'}]}])}

/* ---- fiche employé : n° CNPS ---- */
{const e=ACT.employees;if(e&&e.form&&e.form.tabs){const t=e.form.tabs.find(x=>x.fields&&x.fields.includes('paymode'));if(t&&!t.fields.includes('cnpsno'))t.fields.push('cnpsno')}}

/* ---- fiche de paie : formulaire ---- */
{const p=ACT.payslips;if(p){
  p.list=['name','emp','period','how','gross','cnps','irpp','ret','net','state'];
  p.sum=['gross','cnps','irpp','ret','net'];
  p.form.cols=[['emp','contract','period','batch','how'],['base','bonus','ded','gross','ret','net']];
  const t=p.form.tabs;const i=t.findIndex(x=>x.html);if(i>=0)t[i]={l:['Calcul du salaire','Salary computation'],html:slipTable};
  t.splice(2,0,{l:['Retenues & net','Deductions & net'],fields:['sbt','cnps','cfc','irpp','cac','tdl','rav','other']},{l:['Charges patronales','Employer charges'],fields:['pat','cost']});
  const pdfBtns=[{l:['Télécharger le PDF','Download PDF'],icon:'download',when:b=>!!b.id,fn:b=>slipPdf([D.get('payslip',b.id)||b],false)},{l:['Imprimer','Print'],icon:'print',when:b=>!!b.id,fn:b=>slipPdf([D.get('payslip',b.id)||b],true)}];
  p.form.btns=pdfBtns.concat(p.form.btns)}}
/* lots : PDF de tous les bulletins */
{const pb=ACT.paybatches;if(pb&&pb.form){pb.form.btns=[{l:['Bulletins en PDF','Payslips as PDF'],icon:'download',when:b=>!!b.id,fn:b=>slipPdf(D.all('payslip').filter(x=>x.batch===b.id),false)},{l:['Imprimer tous les bulletins','Print all payslips'],icon:'print',when:b=>!!b.id,fn:b=>slipPdf(D.all('payslip').filter(x=>x.batch===b.id),true)}].concat(pb.form.btns)}}

/* ====================== PDF (générateur intégré, sans bibliothèque) ====================== */
const WH=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const WB=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
const MAPC={'’':"'",'‘':"'",'“':'"','”':'"','–':'-','—':'-','…':'...','€':'EUR','·':'-','•':'-','œ':'oe','Œ':'OE',' ':' ',' ':' ',' ':' ','→':'->','◆':'-'};
const clean=s=>String(s==null?'':s).replace(/[^\x00-\xff]|[\x80-\x9f]|[ ]/g,c=>MAPC[c]!==undefined?MAPC[c]:'?');
const esc2=s=>s.replace(/[\\()]/g,'\\$&');
const tw=(s,sz,bold)=>{let w=0;const T=bold?WB:WH;for(const ch of clean(s)){const c=ch.normalize('NFD')[0].charCodeAt(0);w+=(c>=32&&c<=126?T[c-32]:556)}return w*sz/1000};
function newPage(){const o=[];const H=841.89;const y=v=>(H-v).toFixed(2);
  return {ops:o,
   text(x,yy,s,sz,bold,al,col){s=clean(s);if(al==='r')x-=tw(s,sz,bold);else if(al==='c')x-=tw(s,sz,bold)/2;o.push((col?col+' rg ':'0 g ')+'BT /F'+(bold?2:1)+' '+sz+' Tf '+x.toFixed(2)+' '+y(yy)+' Td ('+esc2(s)+') Tj ET')},
   line(x1,y1,x2,y2,w,col){o.push((col||'0.55 G')+' '+(w||.6)+' w '+x1.toFixed(2)+' '+y(y1)+' m '+x2.toFixed(2)+' '+y(y2)+' l S')},
   rect(x,yy,w,h,fill,stroke){o.push((fill?fill+' rg ':'')+(stroke?stroke+' RG .6 w ':'')+x.toFixed(2)+' '+y(yy+h)+' '+w.toFixed(2)+' '+h.toFixed(2)+' re '+(fill&&stroke?'B':fill?'f':'S'))}}}
function buildPdf(pages){
  let out='%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';const off=[];const add=s=>{off.push(out.length);out+=(off.length)+' 0 obj\n'+s+'\nendobj\n'};
  const n=pages.length;const kids=pages.map((_,i)=>(7+2*i)+' 0 R').join(' ');
  add('<</Type/Catalog/Pages 2 0 R>>');add('<</Type/Pages/Kids ['+kids+']/Count '+n+'>>');
  add('<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>');add('<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>');
  add('<</Producer(Velume)/Title(Bulletin de paie)>>');
  pages.forEach((pg,i)=>{const c=pg.ops.join('\n');add('<</Length '+c.length+'>>\nstream\n'+c+'\nendstream');add('<</Type/Page/Parent 2 0 R/MediaBox [0 0 595.28 841.89]/Resources<</Font<</F1 3 0 R/F2 4 0 R>>>>/Contents '+(5+2*i+1)+' 0 R>>')});
  const xr=out.length;out+='xref\n0 '+(off.length+1)+'\n0000000000 65535 f \n'+off.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<</Size '+(off.length+1)+'/Root 1 0 R/Info 5 0 R>>\nstartxref\n'+xr+'\n%%EOF';
  const u=new Uint8Array(out.length);for(let i=0;i<out.length;i++)u[i]=out.charCodeAt(i)&255;return new Blob([u],{type:'application/pdf'})}

/* nombre en lettres (français) */
const U=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf'],T10=['','','vingt','trente','quarante','cinquante','soixante'];
function b100(n,fin){if(n<20)return U[n];if(n<70){const t=Math.floor(n/10),u=n%10;return T10[t]+(u===1?' et un':u?'-'+U[u]:'')}if(n<80){const u=n-60;return 'soixante'+(u===11?' et onze':'-'+U[u])}const u=n-80;return u===0?(fin?'quatre-vingts':'quatre-vingt'):'quatre-vingt-'+U[u]}
function b1000(n,fin){const c=Math.floor(n/100),r=n%100;let s='';if(c)s=(c===1?'cent':U[c]+' cent')+(c>1&&r===0&&fin?'s':'');if(r)s+=(s?' ':'')+b100(r,fin);return s}
function words(n){n=Math.round(Math.abs(+n||0));if(!n)return 'zéro';const m=Math.floor(n/1e6),th=Math.floor(n%1e6/1e3),r=n%1e3;const p=[];if(m)p.push(m===1?'un million':b1000(m,false)+' millions');if(th)p.push(th===1?'mille':b1000(th,false)+' mille');if(r)p.push(b1000(r,true));return p.join(' ')}
window.__words=words;

function monthLabel(per){const d=pdt(per);if(!d)return '';const m=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],e=['January','February','March','April','May','June','July','August','September','October','November','December'];return (LANG==='fr'?m:e)[d.getMonth()]+' '+d.getFullYear()}
const PAYN={om:'Orange Money',momo:'MTN MoMo',cash:'Espèces',card:'Carte bancaire',bank:'Virement bancaire'};
function slipPage(b){
  const pg=newPage(),X0=36,X1=559,e=D.get('employee',+b.emp)||{},ct=(b.contract&&D.get('contract',+b.contract))||D.all('contract').find(c=>c.emp===b.emp)||{};
  const {rows,L}=slipRows(b),co=S().company||'Vélume Coffee';
  pg.rect(0,0,595.28,70,'0.11 0.08 0.05');
  pg.text(X0,36,co.toUpperCase(),17,true,'l','0.91 0.77 0.48');pg.text(X0,54,(S().pay_addr||'Douala, Cameroun')+(S().pay_niu?'  -  NIU : '+S().pay_niu:'')+(S().pay_cnpsemp?'  -  CNPS : '+S().pay_cnpsemp:''),8.5,false,'l','0.85 0.8 0.7');
  pg.text(X1,34,tr('BULLETIN DE PAIE','PAYSLIP'),15,true,'r','1 1 1');pg.text(X1,52,monthLabel(b.period)+'  -  '+(b.name||''),9.5,false,'r','0.91 0.77 0.48');
  /* encadrés employeur / salarié */
  pg.rect(X0,86,255,92,null,'0.6 0.55 0.45');pg.rect(X0+268,86,255,92,null,'0.6 0.55 0.45');
  pg.text(X0+8,100,tr('EMPLOYEUR','EMPLOYER'),8,true,'l','0.6 0.45 0.15');pg.text(X0+8,116,co,10.5,true);pg.text(X0+8,130,S().pay_addr||'Douala, Cameroun',9);
  if(S().pay_niu)pg.text(X0+8,144,'NIU : '+S().pay_niu,9);if(S().pay_cnpsemp)pg.text(X0+8,157,tr('N° employeur CNPS : ','CNPS employer no.: ')+S().pay_cnpsemp,9);
  const xs=X0+276;pg.text(xs,100,tr('SALARIÉ','EMPLOYEE'),8,true,'l','0.6 0.45 0.15');pg.text(xs,116,e.name||D.name('employee',b.emp)||'',10.5,true);
  pg.text(xs,130,(e.job?tx(e.job):'')+(ct.kind?'  -  '+kLbl('contract','kind',ct.kind):''),9);
  pg.text(xs,143,tr('Matricule : ','ID: ')+'EMP-'+String(e.id||b.emp||'').padStart(4,'0')+(e.since?'   '+tr('Entrée : ','Hired: ')+e.since:''),9);
  pg.text(xs,156,tr('N° CNPS : ','CNPS no.: ')+(e.cnpsno||'-'),9);pg.text(xs,169,tr('Paiement : ','Payment: ')+(PAYN[b.how]||b.how||'')+(e.paynum&&b.how!=='cash'?' ('+e.paynum+')':''),9);
  /* tableau */
  let y=196;const cx={base:360,rate:410,gain:484,ret:X1};
  pg.rect(X0,y-12,X1-X0,18,'0.11 0.08 0.05');pg.text(X0+6,y,tr('Désignation','Item'),8.5,true,'l','1 1 1');
  [[cx.base,tr('Base','Base')],[cx.rate,tr('Taux','Rate')],[cx.gain,tr('Gains','Earnings')],[cx.ret,tr('Retenues','Deductions')]].forEach(a=>pg.text(a[0]-4,y,a[1],8.5,true,'r','1 1 1'));
  y+=18;
  const f=n=>n===undefined||n===''?'':(typeof n==='string'?n:fmt(n));
  rows.forEach(r=>{
    if(r.k==='sub'){pg.rect(X0,y-10,X1-X0,15,'0.95 0.91 0.83');pg.text(X0+6,y+1,r.label,8,true,'l','0.4 0.3 0.1');y+=17;return}
    const bold=r.k==='tot'||r.k==='net';
    if(r.k==='net'){y+=4;pg.rect(X0,y-12,X1-X0,24,'0.91 0.77 0.48');pg.text(X0+8,y+4,r.label,12,true);pg.text(X1-6,y+4,fmt(r.gain)+' FCFA',13,true,'r');y+=26;return}
    if(bold)pg.line(X0,y-10,X1,y-10,.8,'0.3 G');
    pg.text(X0+6,y,r.label,9,bold,'l',r.k==='info'?'0.4 0.4 0.4':null);
    if(r.base!==undefined&&r.base!=='')pg.text(cx.base-4,y,f(r.base),9,false,'r','0.3 0.3 0.3');
    if(r.rate)pg.text(cx.rate-4,y,String(r.rate),9,false,'r','0.3 0.3 0.3');
    if(r.gain)pg.text(cx.gain-4,y,f(r.gain),9,bold,'r');if(r.ret)pg.text(cx.ret-6,y,f(r.ret),9,bold,'r');
    y+=15;pg.line(X0,y-10,X1,y-10,.25,'0.85 G')});
  y+=6;pg.text(X0,y,tr('Arrêté le présent bulletin à la somme de : ','This payslip is closed at the sum of: ')+words(L.net)+' '+tr('francs CFA.','CFA francs.'),9,true);y+=20;
  /* charges patronales + congés */
  pg.rect(X0,y-12,X1-X0,16,'0.95 0.91 0.83');pg.text(X0+6,y,tr('CHARGES PATRONALES (information — non déduites du salaire)','EMPLOYER CHARGES (information — not deducted)'),8,true,'l','0.4 0.3 0.1');y+=15;
  const ch=[[tr('CNPS pension','CNPS pension'),L.pve],[tr('Prest. familiales','Family benefits'),L.pf],[tr('Accidents du travail','Work accidents'),L.at],['CFC',L.cfce],['FNE',L.fne]];
  const cw=(X1-X0)/ch.length;ch.forEach((a,i)=>{pg.text(X0+i*cw+6,y,a[0],8,false,'l','0.4 0.4 0.4');pg.text(X0+i*cw+6,y+12,fmt(a[1]),9.5,true)});y+=30;
  pg.text(X0+6,y,tr('Total charges patronales : ','Total employer charges: ')+fmt(L.pat)+' FCFA',9,true);pg.text(X1-6,y,tr('Coût total employeur : ','Total employer cost: ')+fmt(L.cost)+' FCFA',9,true,'r');y+=22;
  const al=D.all('leavealloc').filter(a=>a.emp===b.emp&&String(a.year)===String((b.period||'').slice(0,4)));
  const bal=al.filter(a=>a.kind==='paid').reduce((t,a)=>t+(+a.left||0),0);
  pg.text(X0+6,y,tr('Congés du mois : ','Time off this month: ')+(b.pl||0)+tr(' j payé(s), ',' d paid, ')+(b.unpaid||0)+tr(' j sans solde','  d unpaid')+(al.length?'   -   '+tr('Solde de congés payés : ','Paid leave balance: ')+bal+' j':''),9);y+=34;
  /* signatures */
  pg.rect(X0,y,250,56,null,'0.7 0.65 0.55');pg.rect(X0+273,y,250,56,null,'0.7 0.65 0.55');
  pg.text(X0+8,y+13,tr('Cachet et signature de l’employeur','Employer stamp and signature'),8,false,'l','0.4 0.4 0.4');pg.text(X0+281,y+13,tr('Signature du salarié (lu et approuvé)','Employee signature (read and approved)'),8,false,'l','0.4 0.4 0.4');
  pg.line(X0,800,X1,800,.4,'0.8 G');
  pg.text(X0,813,tr('Pour valoir ce que de droit. À conserver sans limitation de durée. Calcul indicatif selon les taux en vigueur paramétrés — à valider par votre comptable.','Keep without time limit. Indicative calculation using the configured rates — validate with your accountant.'),7,false,'l','0.5 0.5 0.5');
  pg.text(X1,826,'Vélume',7,true,'r','0.6 0.45 0.15');
  return pg}
function openPdf(blob,name,print){
  const url=URL.createObjectURL(blob);
  const touch=/iPad|iPhone|iPod|Android/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(!print){const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),120000);return}
  if(touch){window.open(url,'_blank')||(location.href=url);return}
  try{const f=document.createElement('iframe');f.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0';f.src=url;f.onload=()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){window.open(url,'_blank')}};document.body.appendChild(f);setTimeout(()=>{try{f.remove()}catch(e){}},180000)}catch(e){window.open(url,'_blank')}}
function slipPdf(list,print){
  list=list.filter(Boolean);if(!list.length)return toast(tr('Aucun bulletin à imprimer.','No payslip to print.'));
  try{const blob=buildPdf(list.map(slipPage));const nm=list.length===1?('bulletin-'+String(list[0].name||'paie').replace(/[^\w.-]+/g,'_')+'.pdf'):('bulletins-'+(list[0].period||'').slice(0,7)+'.pdf');
    window.__lastPdf={blob,name:nm,n:list.length};openPdf(blob,nm,print);toast(list.length+' '+tr('bulletin(s) PDF','payslip PDF(s)'))}
  catch(e){try{console.error(e)}catch(x){}toast(tr('Erreur de génération du PDF.','PDF generation error.'))}}
window.__slipPdf=slipPdf;window.__buildPdf=buildPdf;window.__newPdfPage=newPage;window.__openPdf=openPdf;
}
