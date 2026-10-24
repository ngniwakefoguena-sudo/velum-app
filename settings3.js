/* ===== VELUME — Paramètres façon Odoo (page unique, sections, navigation par application) ===== */
(function(){
const css=document.createElement('style');css.textContent=`
.st3{display:grid;grid-template-columns:200px minmax(0,1fr);background:var(--surface);border:1px solid var(--line);border-radius:6px;height:calc(100vh - 150px);min-height:480px;overflow:hidden}
.st3nav{border-right:1px solid var(--line);padding:8px 6px;display:flex;flex-direction:column;gap:1px;background:var(--surface);overflow:auto}
.st3nav button{display:flex;gap:10px;align-items:center;border:0;background:transparent;text-align:left;padding:8px 10px;border-radius:5px;color:var(--ink);font-size:.86rem}
.st3nav button[aria-current=true]{background:var(--surface-2);font-weight:600}
.st3nav .i{width:18px;height:18px}
.st3main{overflow:auto;min-width:0}
.st3bar{background:var(--surface-2);padding:10px 20px;font-weight:700;font-size:.9rem;border-top:1px solid var(--line);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:1}
.st3cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:4px 40px;padding:18px 34px 6px}
.st3o{border-left:1px solid var(--line);padding:2px 0 2px 12px;margin-bottom:18px;font-size:.88rem}
.st3o b{font-weight:600}
.st3l{display:flex;gap:9px;align-items:flex-start;cursor:pointer}
.st3l input{margin-top:3px;accent-color:var(--teal)}
.st3d{display:block;color:var(--ink-2);font-weight:400;margin-top:2px;font-size:.82rem}
.st3i{border:0;border-bottom:1px solid var(--line-2);background:transparent;padding:5px 2px;min-width:160px;color:var(--ink)}
.st3i:focus{outline:0;border-bottom-color:var(--teal)}
.st3sub{margin:8px 0 0 24px}
.st3row{display:flex;gap:10px;align-items:baseline;margin:6px 0}
.st3lk{display:grid;gap:3px;margin-top:8px}
.st3lk a,.st3o .sglk{color:var(--teal);text-decoration:none;font-size:.86rem}
.st3r{display:flex;gap:8px;align-items:center;margin:4px 0}
.st3hl{background:#fff3b0;color:#000;border-radius:2px}
.st3mark{display:inline-block;width:34px;height:34px;border-radius:50%;border:1px solid var(--line-2);vertical-align:middle;padding:0;background:none;overflow:hidden}
@media(max-width:820px){.st3{grid-template-columns:1fr;height:auto}.st3nav{flex-direction:row;overflow:auto;border-right:0;border-bottom:1px solid var(--line)}.st3nav button{white-space:nowrap}.st3cols{padding:14px 16px 4px}}
`;document.head.appendChild(css);

/* ---------- définitions ---------- */
const B=(k,fr,en,dfr,den,def,sub,links)=>({st:'bool',k:k,l:[fr,en],d:[dfr,den],def:!!def,sub:sub||null,links:links||null});
const F=(st,k,fr,en,dfr,den,def,x)=>Object.assign({st:st,k:k,l:[fr,en],d:[dfr,den],def:def},x||{});
const LK=(fr,en,dfr,den,links,x)=>Object.assign({st:'links',l:[fr,en],d:[dfr,den],links:links},x||{});
const NOCON=['Service externe non connecté dans cette version de démonstration.','External service not connected in this demo version.'];
const GEN=[
 {t:['Utilisateurs','Users'],c:[[{st:'invite',l:['Inviter de nouveaux utilisateurs','Invite new users'],d:['','']}],[{st:'ucount',l:['Utilisateur actif','Active user'],d:['','']},{st:'admins',l:['Administrateurs','Administrators'],d:['','']}]]},
 {t:['Langues','Languages'],c:[[{st:'lcount',l:['Langue','Language'],d:['','']}],[]]},
 {t:['Sociétés','Companies'],c:[[{st:'company',l:['Société','Company'],d:['','']},{st:'doclay',l:['Mise en page du document','Document layout'],d:['Choisir la mise en page de vos documents','Choose the layout of your documents']}],[{st:'ccount',l:['Société','Company'],d:['','']},{st:'mailtpl',l:['Modèles d’e-mail','Email templates'],d:['Personnaliser la présentation des e-mails automatisés','Customize the look of automated emails']}]]},
 {t:['Interface','Interface'],c:[[F('sel','theme','Thème','Theme','Clair, sombre ou automatique selon l’appareil.','Light, dark or automatic per device.','auto',{opts:[['auto','Automatique','Automatic'],['light','Clair','Light'],['dark','Sombre','Dark']]}),F('sel','lang_default','Langue de l’interface','Interface language','Français et anglais installés ; les données de démonstration sont traduites.','French and English installed; demo data is translated.','fr',{opts:[['fr','Français','French'],['en','English','English']]})],[{st:'device',l:['Mode d’affichage de cet appareil','Display mode for this device'],d:['Automatique, téléphone, tablette, poste de travail ou caisse tactile (grands boutons). Réglage propre à chaque appareil.','Automatic, phone, tablet, workstation or touch register (large buttons). Set per device.']},B('quick_login','Connexion rapide par vignettes','Quick login tiles','Affiche les prénoms des employés sur l’écran de connexion (mot de passe toujours demandé).','Shows employee first names on the login screen (password still required).',true),B('dev','Mode développeur','Developer mode','Affiche le menu Technique : actions automatisées, modèles, console API, import/export.','Shows the Technical menu: automated actions, models, API console, import/export.',false)]]},
 {t:['Unités de mesure','Units of measure'],c:[[F('radio','wunit','Poids','Weight','Définir votre unité de mesure de poids','Define your weight unit','kg',{opts:[['kg','Kilogrammes (kg)','Kilograms (kg)'],['lb','Livres (lb)','Pounds (lb)']]})],[F('radio','vunit','Volume','Volume','Définir l’unité de mesure de votre volume','Define your volume unit','m3',{opts:[['m3','Mètres cubes (m³)','Cubic meters (m³)'],['ft3','Pieds cubes (ft³)','Cubic feet (ft³)']]})]]},
 {t:['E-mails','Emails'],c:[
  [B('mail_custom','Utiliser les serveurs de messagerie personnalisés','Use custom email servers','Configurer vos propres serveurs de messagerie','Configure your own mail servers',false),
   B('digest','Digest d’e-mails','Email digests','Ajouter de nouveaux utilisateurs comme destinataires d’un e-mail périodique comprenant des métriques clés','Add new users as recipients of a periodic email with key metrics',true,[F('sel','digest_tpl','Template','Template','','','d1',{opts:[['d1','Votre digest périodique VELUME','Your periodic VELUME digest'],['d2','Digest hebdomadaire de la caisse','Weekly register digest']],inline:1})],[['Configurer les digests d’e-mails','Configure email digests','toastx']])],
  [F('text','alias_dom','Domaine alias','Alias domain','Utiliser différents domaines pour vos alias de messagerie','Use different domains for your mail aliases','velume.cm',{prefix:'@'}),
   B('tpl_restrict','Restreindre le rendu du modèle','Restrict template rendering','Restreindre l’édition des modèles d’e-mail et l’utilisation des placeholders.','Restrict editing of email templates and placeholder use.',true)]]},
 {t:['Discussion','Discuss'],c:[
  [LK('Activités','Activities','Configurez les types d’activité et utilisez les plans d’activités pour attribuer plusieurs activités','Configure activity types and use activity plans to assign several activities',[['Types d’activités','Activity types','acttypes'],['Plans d’activité','Activity plans','actplans'],['Rôles','Roles','roles']]),
   B('ds_translate','Traduire les messages','Translate messages','Traduisez les messages des clients à l’aide de l’API Google Translate','Translate customer messages using the Google Translate API',false)],
  [B('ds_gif','Envoyer des GIF','Send GIFs','Partager des GIF dans vos conversations','Share GIFs in your conversations',false),
   B('ds_calls','Serveurs d’appel personnalisés','Custom call servers','Utilisez vos propres serveurs SFU ou ICE pour les appels vidéo','Use your own SFU or ICE servers for video calls',false),
   B('ds_bot','Velume Bot','Velume Bot','Alertes automatiques (factures, locations, stock, sondages) dans la discussion.','Automatic alerts (invoices, rentals, stock, surveys) in chat.',true)]]},
 {t:['Contacts','Contacts'],c:[
  [LK('Envoyer un SMS','Send SMS','Envoyer des SMS à vos contacts','Send SMS to your contacts',[['Gérer les services et acheter des crédits','Manage services and buy credits','toastx']]),
   LK('Achat intégré VELUME','VELUME in-app purchase','Consulter vos services et recharger vos crédits','Check your services and top up credits',[['Voir mes services','View my services','toastx']])],
  [B('autocomp','Autocomplétion de partenaires','Partner autocomplete','Enrichir automatiquement votre base de contacts avec des données sur les entreprises','Automatically enrich your contacts with company data',true,null,[['Gérer les services et acheter des crédits','Manage services and buy credits','toastx']])]]},
 {t:['Permissions','Permissions'],c:[
  [F('radio','signup','Création de compte employé','Employee account creation','Les employés peuvent créer eux-mêmes un compte avec un identifiant (ou une adresse Gmail) et un mot de passe.','Employees can create their own account with a username (or Gmail address) and a password.','approval',{opts:[['off','Désactivée (l’administrateur crée tout)','Off (administrator creates all)'],['approval','Avec validation par l’administrateur','Needs administrator approval'],['open','Libre (accès de base immédiat)','Open (basic access right away)']]}),F('radio','portal','Compte client','Customer account','Permettre à vos clients de se connecter pour consulter leurs documents','Let your customers sign in to view their documents','free',{opts:[['invite','Sur invitation','By invitation'],['free','Inscription gratuite','Free sign-up']],links:[['Droits d’accès par défaut','Default access rights','groups']]}),
   LK('Droits d’accès par défaut','Default access rights','Définir les droits d’accès personnalisés pour les nouveaux utilisateurs','Set custom access rights for new users',[['Droits d’accès par défaut','Default access rights','groups']]),
   B('twofa','Appliquer l’authentification à deux facteurs','Enforce two-factor authentication','Appliquer l’authentification à deux facteurs par e-mail pour les employés ou pour tous les utilisateurs.','Enforce email two-factor authentication for employees or all users.',false)],
  [B('pwreset','Réinitialisation du mot de passe','Password reset','Permettre la réinitialisation du mot de passe depuis la page de connexion','Allow password reset from the login page',true),
   LK('Clés API','API keys','Les clés API permettent à vos utilisateurs d’accéder à VELUME avec des outils externes.','API keys let your users access VELUME with external tools.',[['Gérer les clés API','Manage API keys','rpc']])]]},
 {t:['Certificats et clés','Certificates and keys'],c:[[LK('Gérer vos certificats','Manage your certificates','','',[['Certificats','Certificates','toastx']],{}) ],[LK('Gérer vos clés','Manage your keys','','',[['Clés','Keys','toastx']])]]},
 {t:['Intégrations','Integrations'],c:[
  [B('oauth','Authentification OAuth','OAuth authentication','Utiliser des comptes externes pour vous connecter (Google, Facebook, etc.)','Use external accounts to sign in (Google, Facebook, etc.)',false),
   B('ldap','Authentification LDAP','LDAP authentication','Utiliser les informations d’identification LDAP pour vous connecter','Use LDAP credentials to sign in',false),
   B('geoloc','Géolocalisation','Geolocation','Obtenir la latitude et la longitude de vos partenaires','Get latitude and longitude of your partners',true,[F('sel','geo_prov','Fournisseur','Provider','','','gpm',{opts:[['gpm','Google Place Map','Google Place Map'],['osm','OpenStreetMap','OpenStreetMap']],inline:1}),F('text','geo_key','Clé','Key','','','',{inline:1})]),
   B('recaptcha','reCAPTCHA','reCAPTCHA','Protéger vos formulaires du spam et des abus.','Protect your forms from spam and abuse.',false),
   B('gaddr','Autocomplétion des adresses Google','Google address autocomplete','Complétion automatique des adresses des partenaires avec Google Places','Automatic address completion for partners with Google Places',true,[F('text','gaddr_key','Copier votre clé API','Paste your API key','','','',{inline:1,nolabel:1})],[['Create a Google Project and get a key','Create a Google Project and get a key','toastx']])],
  [B('barcode','Base de données de codes-barres','Barcode database','Créez des produits en les scannant à l’aide de Barcode Lookup','Create products by scanning them using Barcode Lookup',true,[F('text','barcode_key','API Key','API Key','','','',{inline:1})]),
   B('unsplash','Bibliothèque d’images Unsplash','Unsplash image library','Trouver des images gratuites haute résolution sur Unsplash','Find free high-resolution images on Unsplash',true),
   F('text','mapbox','Mapbox','Mapbox','Active l’itinéraire optimal et le style de carte fourni par Mapbox.','Enable optimal routing and the map style provided by Mapbox.','',{}),
   B('turnstile','Cloudflare Turnstile','Cloudflare Turnstile','Protégez vos formulaires grâce à CF Turnstile.','Protect your forms with CF Turnstile.',false)]]},
 {t:['Paiements & messagerie (VELUME)','Payments & messaging (VELUME)'],c:[
  [B('int_om','Orange Money','Orange Money','Active la méthode dans la caisse et les factures ; confirmation saisie à la main (pas d’appel à l’opérateur).','Enables the method in POS and invoices; confirmation is entered by hand (no operator call).',true),
   B('int_momo','MTN MoMo','MTN MoMo','Idem : suivi manuel des paiements pour l’instant.','Same: manual payment tracking for now.',true)],
  [F('text','wa_num','Numéro WhatsApp Business','WhatsApp Business number','Affiché aux clients, utilisé pour les liens WhatsApp de l’application.','Shown to customers, used for the app’s WhatsApp links.','+237 6 00 00 00 10',{}),
   B('int_wa','WhatsApp Business','WhatsApp Business','Active les boutons « Envoyer par WhatsApp » dans Ventes, Galerie, Achats.','Enables the “Send by WhatsApp” buttons in Sales, Gallery, Purchase.',true)]]},
 {t:['Outils développeur','Developer tools'],c:[[LK('','','','',[['Activer le mode développeur','Activate developer mode','dev'],['Activer le mode développeur (avec les assets)','Activate developer mode (with assets)','dev'],['Activer le mode développeur (avec les assets test)','Activate developer mode (with test assets)','dev']],{notitle:1})],[]]},
 {t:['Données','Data'],c:[[{st:'reset',l:['Réinitialiser les données de démonstration','Reset demo data'],d:['Efface vos modifications dans ce navigateur et recharge les exemples.','Erases your changes in this browser and reloads the samples.']}],[]]},
 {t:['À propos','About'],c:[[{st:'about',l:['À propos','About'],d:['','']}],[]]}
];

/* ---------- sections par application (SET existant + nouvelles apps) ---------- */
const SETX=(id,fr,en,icon,blocks)=>{const i=SET.findIndex(s=>s.id===id);const e={id:id,app:id,l:[fr,en],icon:icon,blocks:blocks};if(i>=0)SET[i]=e;else SET.push(e)};
{const bl=SET.find(s=>s.id==='billing');if(bl&&!bl.blocks.some(b=>b.o.some(o=>o.k==='tva')))bl.blocks.unshift({t:['Taxes','Taxes'],o:[{k:'tva',st:'num',l:['Taux de TVA (%)','VAT rate (%)'],d:['19,25 % au Cameroun (HT = TTC ÷ 1,1925). Appliqué en caisse, factures, devis, achats et déclaration de TVA.','19.25% in Cameroon (excl. = incl. ÷ 1.1925). Applied in POS, invoices, quotes, purchases and the VAT return.'],def:19.25}]});
 const sg=SET.find(s=>s.id==='sign');if(sg){sg.blocks=[{t:['Documents','Documents'],o:[{k:'sign_days',st:'num',l:['Validité d’un document envoyé (jours)','Sent document validity (days)'],d:['Date d’expiration calculée automatiquement à l’envoi.','Expiry date computed automatically on sending.'],def:30},{k:'sg_terms',st:'bool',l:['Conditions générales par défaut','Default terms and conditions'],d:['Ajouter des termes et conditions à l’e-mail de demande de signature','Add terms and conditions to the signature request email'],def:false},{k:'sg_access',st:'bool',l:['Gérer les accès aux modèles','Manage template access'],d:['Autoriser les utilisateurs à définir qui a accès au modèle','Allow users to define who can access the template'],def:false}]}]}}
SETX('inventory','Inventaire','Inventory','box',[{t:['Stocks','Stock'],o:[{k:'iv_alert',st:'bool',l:['Alertes de stock bas dans Discussion','Low-stock alerts in Discuss'],d:['Velume Bot prévient quand un article passe sous son seuil.','Velume Bot warns when an item falls below its level.'],def:true}]}]);
SETX('loyalty','Fidélité','Loyalty','heart',[{t:['Velume Club','Velume Club'],o:[{k:'ly_on',st:'bool',l:['Points à chaque vente en caisse','Points on every POS sale'],d:['Si le client de la commande est un membre du Club, ses points augmentent automatiquement.','If the order’s customer is a Club member, their points go up automatically.'],def:true},{k:'ly_rate',st:'num',l:['Points par tranche de 1 000 FCFA','Points per 1,000 FCFA'],d:['Calcul : total TTC ÷ 1 000 × ce taux.','Computed as total incl. VAT ÷ 1,000 × this rate.'],def:1}]}]);
SETX('payroll','Paie','Payroll','receipt',[{t:['Cotisations (calcul simplifié)','Contributions (simplified)'],o:[{k:'pay_cnps',st:'num',l:['Taux CNPS salarié (%)','Employee CNPS rate (%)'],d:['Utilisé dans les bulletins de paie. À valider avec votre comptable.','Used in payslips. Validate with your accountant.'],def:2.8},{k:'pay_cap',st:'num',l:['Plafond mensuel de cotisation (FCFA)','Monthly contribution ceiling (FCFA)'],d:['Salaire maximal retenu pour le calcul.','Maximum salary used in the calculation.'],def:750000}]}]);
SETX('delivery','Livraison','Delivery','map',[{t:['Livraisons','Deliveries'],o:[{k:'dl_fee',st:'num',l:['Frais de livraison par défaut (FCFA)','Default delivery fee (FCFA)'],d:['Pré-rempli sur chaque nouvelle livraison.','Pre-filled on every new delivery.'],def:1000}]}]);

/* ---------- état / valeurs ---------- */
const SPECIAL={theme:()=>ST.theme||'auto',dev:()=>!!ST.dev,lang_default:()=>ST.lang||'fr'};
const V=it=>{if(UI.sd&&it.k in UI.sd)return UI.sd[it.k];if(SPECIAL[it.k])return SPECIAL[it.k]();const v=ST.set[it.k];return v==null?it.def:v};
const lab=a=>Array.isArray(a)?tr(a[0],a[1]):a;
const optL=o=>tr(o[1],o[2]);
const hl=s=>{const q=(UI.stq||'').trim();if(!q)return esc(s);const i=s.toLowerCase().indexOf(q.toLowerCase());if(i<0)return esc(s);return esc(s.slice(0,i))+'<span class="st3hl">'+esc(s.slice(i,i+q.length))+'</span>'+esc(s.slice(i+q.length))};
const lnk=ls=>ls?'<div class="st3lk">'+ls.map(l=>'<a href="#" class="sglk" data-a="st3-go" data-t="'+l[2]+'">→ '+esc(tr(l[0],l[1]))+'</a>').join('')+'</div>':'';
function ctl(it,v){
  if(it.st==='sel')return '<select class="st3i" data-st3="'+it.k+'">'+it.opts.map(o=>'<option value="'+o[0]+'"'+(String(v)===String(o[0])?' selected':'')+'>'+esc(optL(o))+'</option>').join('')+'</select>';
  if(it.st==='radio')return it.opts.map(o=>'<label class="st3r"><input type="radio" name="st3_'+it.k+'" data-st3="'+it.k+'" data-v="'+o[0]+'"'+(String(v)===String(o[0])?' checked':'')+'>'+esc(optL(o))+'</label>').join('');
  if(it.st==='color')return '<input type="color" class="st3mark" data-st3="'+it.k+'" value="'+esc(v||'#ffffff')+'">';
  const pre=it.prefix?'<span class="muted">'+it.prefix+' </span>':'';
  return pre+'<input class="st3i" type="'+(it.st==='num'?'number':'text')+'" step="any" data-st3="'+it.k+'" data-t="'+it.st+'" value="'+esc(v==null?'':v)+'"'+(it.nolabel?' placeholder="'+esc(lab(it.l))+'"':'')+'>';
}
const CUST={
 admins:it=>window.__adminsHtml?window.__adminsHtml():'',
 device:it=>'<div class="st3o"><b>'+hl(lab(it.l))+'</b><span class="st3d">'+esc(lab(it.d))+'</span><div style="margin-top:8px">'+(window.__deviceHtml?window.__deviceHtml():'')+'</div></div>',
 quick:it=>'',
 invite:it=>'<div class="st3o"><b>'+hl(lab(it.l))+'</b><div style="display:flex;gap:8px;align-items:flex-end;margin-top:10px"><input id="st3inv" data-fk="st3inv" class="st3i" style="flex:1" placeholder="'+tr('Saisir une adresse e-mail','Enter an email address')+'" value="'+esc(UI.sinv||'')+'"><button class="btn pri sm" data-a="st3-invite">'+tr('Inviter','Invite')+'</button></div></div>',
 ucount:it=>{const n=D.all('user').filter(u=>u.active!==false).length;return '<div class="st3o"><b>'+n+' '+tr(n>1?'Utilisateurs actifs':'Utilisateur actif',n>1?'Active users':'Active user')+'</b>'+lnk([['Gérer les utilisateurs','Manage users','users']])+'</div>'},
 lcount:it=>'<div class="st3o"><b>2 '+tr('Langues','Languages')+'</b>'+lnk([['Ajouter des langues','Add languages','langs']])+'</div>',
 company:it=>'<div class="st3o"><b>'+esc(company())+'</b><span class="st3d">'+esc(ST.set.address||'Douala, Cameroun')+(ST.set.niu?' · NIU '+esc(ST.set.niu):'')+'</span>'+lnk([['Mettre à jour les informations','Update information','companyinfo']])+'</div>',
 doclay:it=>'<div class="st3o"><b>'+hl(lab(it.l))+'</b><span class="st3d">'+esc(lab(it.d))+' · '+esc({std:tr('Standard','Standard'),clean:tr('Épuré','Clean'),boxed:tr('Encadré','Boxed')}[ST.set.doclayout||'std'])+'</span>'+lnk([['Configurer la mise en page du document','Configure document layout','doclay']])+'</div>',
 ccount:it=>'<div class="st3o"><b>1 '+tr('Société','Company')+'</b>'+lnk([['Gérer des sociétés','Manage companies','companies']])+'</div>',
 mailtpl:it=>'<div class="st3o"><b>'+hl(lab(it.l))+'</b><span class="st3d">'+esc(lab(it.d))+'</span><div class="st3row" style="margin-top:12px"><span style="min-width:120px">'+tr('Texte du bouton','Button text')+'</span>'+ctl({st:'color',k:'mail_btn_fg'},V({k:'mail_btn_fg',def:'#ffffff'}))+'</div><div class="st3row"><span style="min-width:120px">'+tr('Couleur de bouton','Button color')+'</span>'+ctl({st:'color',k:'mail_btn_bg'},V({k:'mail_btn_bg',def:'#b8863b'}))+'</div>'+lnk([['Revoir tous les modèles','Review all templates','mailtpls']])+'</div>',
 reset:it=>'<div class="st3o"><b>'+hl(lab(it.l))+'</b><span class="st3d">'+esc(lab(it.d))+'</span><p style="margin-top:8px"><button class="btn danger sm" data-a="reset-ask">'+tr('Réinitialiser','Reset')+'</button></p></div>',
 about:it=>'<div class="st3o"><span class="st3d" style="margin:0">VELUME 1.0 — '+tr('édition démonstration','demo edition')+'</span><span class="st3d">'+tr('Interface inspirée d’Odoo. Données enregistrées dans ce navigateur.','Odoo-inspired interface. Data stored in this browser.')+'</span></div>'
};
function itemHtml(it,sub){
  if(CUST[it.st])return CUST[it.st](it);
  const v=V(it);
  if(it.st==='links')return '<div class="st3o">'+(it.notitle?'':'<b>'+hl(lab(it.l))+'</b>'+(lab(it.d)?'<span class="st3d">'+esc(lab(it.d))+'</span>':''))+lnk(it.links)+'</div>';
  if(it.st==='btn2')return '<div class="st3o"><b>'+hl(lab(it.l))+'</b><span class="st3d">'+esc(lab(it.d))+'</span><span class="badge warn" style="margin-top:6px">'+tr('Non connectée (démo)','Not connected (demo)')+'</span></div>';
  if(it.st==='bool')return '<div class="st3o"><label class="st3l"><input type="checkbox" data-st3="'+it.k+'"'+(v?' checked':'')+'><span><b>'+hl(lab(it.l))+'</b><span class="st3d">'+esc(lab(it.d))+'</span></span></label>'+(v&&it.sub?'<div class="st3sub">'+it.sub.map(x=>itemHtml(x,1)).join('')+'</div>':'')+(v?lnk(it.links):'')+'</div>';
  if(it.inline)return '<div class="st3row">'+(it.nolabel?'':'<span>'+esc(lab(it.l))+'</span>')+ctl(it,v)+'</div>';
  return '<div class="st3o"><b>'+hl(lab(it.l))+'</b><span class="st3d">'+esc(lab(it.d))+'</span><div style="margin-top:6px">'+ctl(it,v)+'</div>'+lnk(it.links)+'</div>';
}
const textOf=it=>(lab(it.l||'')+' '+lab(it.d||'')+' '+(it.links||[]).map(l=>tr(l[0],l[1])).join(' ')+' '+(it.sub||[]).map(textOf).join(' ')).toLowerCase();
function fromSET(s){return s.blocks.map(b=>{const o=b.o.map(x=>x.st==='btn'?{st:'reset',l:x.l,d:x.d}:{st:x.st==='text'?'text':x.st,k:x.k,l:x.l,d:x.d,def:x.def,opts:x.opts});return {t:b.t,c:[o.filter((_,i)=>i%2===0),o.filter((_,i)=>i%2===1)]}})}
const sections=id=>id==='general'?GEN:fromSET(SET.find(s=>s.id===id)||SET[0]);
const navApps=()=>SET.filter(s=>s.app&&s.id!=='dnotif'&&s.id!=='dvoice'&&s.id!=='general').filter(s=>{const ap=APPS.find(x=>x.id===s.app);return ap&&(ap.core||ST.installed[ap.id]!==false)});

CUSTOM.settings=function(m){
  const mid=m&&m.id||'st_gen';
  if(UI.stfrom!==mid){UI.stnav=(m&&m.app)||'general';UI.stfrom=mid;UI.stq=''}
  const cur=UI.stnav||'general';const q=(UI.stq||'').trim().toLowerCase();
  const navId=(cur==='dnotif'||cur==='dvoice')?'discuss':cur;
  const items=[['general',tr('Paramètres généraux','General settings'),'gear','var(--ink-2)']].concat(navApps().map(s=>{const ap=APPS.find(x=>x.id===s.app);return [s.id,L(s.l),s.icon,ap.color]}));
  const nav='<nav class="st3nav" aria-label="settings">'+items.map(x=>'<button data-a="st3-nav" data-s="'+x[0]+'" aria-current="'+(navId===x[0]&&!q)+'"><span style="color:'+x[3]+'">'+ic(x[2])+'</span>'+esc(x[1])+'</button>').join('')+'</nav>';
  const pool=q?[['general']].concat(navApps().map(s=>[s.id])).concat([['dnotif'],['dvoice']]).map(x=>x[0]):[cur];
  let out='';
  pool.forEach(id=>sections(id).forEach(sec=>{
    const cols=sec.c.map(c=>c.filter(it=>!q||textOf(it).includes(q)));
    if(!cols.some(c=>c.length))return;
    out+='<div class="st3bar">'+esc(lab(sec.t))+'</div><div class="st3cols"><div>'+cols[0].map(it=>itemHtml(it)).join('')+'</div><div>'+cols[1].map(it=>itemHtml(it)).join('')+'</div></div>';
  }));
  if(!out)out='<div class="emp"><h3>'+tr('Aucun paramètre trouvé','No setting found')+'</h3></div>';
  return '<div class="cp gut"><div class="cp-top"><div class="cp-left"><button class="btn pri" data-a="st3-save">'+tr('Enregistrer','Save')+'</button><button class="btn" data-a="st3-ign">'+tr('Ignorer','Discard')+'</button><span class="cp-title">'+tr('Paramètres','Settings')+'</span></div><div class="cp-search"><div class="sbox"><input id="st3q" data-fk="st3q" placeholder="'+tr('Rechercher...','Search...')+'" value="'+esc(UI.stq||'')+'" aria-label="search"></div></div></div></div><div class="va gut"><div class="st3">'+nav+'<div class="st3main">'+out+'</div></div></div>';
};
CUSTOM.appset=m=>CUSTOM.settings(m);
CUSTOM.sgset=m=>CUSTOM.settings(m);

A['st3-nav']=el=>{UI.stnav=el.dataset.s;UI.stq='';render()};
A['st3-ign']=()=>{UI.sd=null;UI.sinv='';toast(tr('Modifications ignorées.','Changes discarded.'));render()};
A['st3-save']=()=>{
  const d=UI.sd||{};const ks=Object.keys(d);let lang=null;
  ks.forEach(k=>{const v=d[k];if(k==='theme')ST.theme=v;else if(k==='dev')ST.dev=v;else if(k==='lang_default')lang=v;else ST.set[k]=v});
  UI.sd=null;save();
  if(lang&&lang!==ST.lang){setLang(lang);toast(tr('Paramètres enregistrés.','Settings saved.'));return}
  toast(ks.length?tr('Paramètres enregistrés et appliqués à toutes les applications.','Settings saved and applied to all apps.'):tr('Aucune modification.','No changes.'));render();
};
document.addEventListener('change',e=>{
  const el=e.target;if(!el.dataset||el.dataset.st3==null)return;
  UI.sd=UI.sd||{};const k=el.dataset.st3;
  if(el.type==='checkbox')UI.sd[k]=el.checked;else if(el.type==='radio')UI.sd[k]=el.dataset.v;else if(el.dataset.t==='num')UI.sd[k]=el.value===''?null:+el.value;else UI.sd[k]=el.value;
  if(el.type==='checkbox'||el.type==='radio'||el.tagName==='SELECT')render();
});
document.addEventListener('input',e=>{
  const el=e.target;
  if(el.dataset&&el.dataset.st3!=null&&el.type!=='checkbox'&&el.type!=='radio'&&el.tagName!=='SELECT'){UI.sd=UI.sd||{};UI.sd[el.dataset.st3]=el.dataset.t==='num'?(el.value===''?null:+el.value):el.value}
  if(el.id==='st3q'){UI.stq=el.value;render()}
  if(el.id==='st3inv')UI.sinv=el.value;
});
A['st3-invite']=()=>{
  const e=(UI.sinv||'').trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))return toast(tr('Adresse e-mail invalide.','Invalid email address.'));
  if(D.all('user').some(u=>(u.login||'').toLowerCase()===e))return toast(tr('Cet utilisateur existe déjà.','This user already exists.'));
  D.create('user',{name:e.split('@')[0],login:e,group:'user',lang:LANG,active:true},{silent:true});
  UI.sinv='';save();toast(tr('Invitation créée (aucun e-mail réel n’est envoyé dans cette version). Utilisateur ajouté.','Invitation created (no real email is sent in this version). User added.'));render();
};
A['st3-go']=el=>{
  const t=el.dataset.t;
  const T3={users:['config','st_u'],langs:['config','st_lang'],companies:['config','st_co'],groups:['config','st_gr'],rpc:['config','st_rpc'],acttypes:['project','acttypes'],actplans:['project','actplans'],roles:['discuss','droles'],mailtpls:['billing','dunnings']};
  if(T3[t]){const x=T3[t];const ap=APPS.find(a=>a.id===x[0]);if(ap&&!(ap.core||ST.installed[ap.id]!==false))return toast(tr('Installez d’abord l’application « '+L(ap.l)+' ».','Install the “'+L(ap.l)+'” app first.'));return goTo(x[0],x[1])}
  if(t==='companyinfo'||t==='doclay')return openModal(t);
  if(t==='dev'){ST.dev=true;save();toast(tr('Mode développeur activé : menu Technique visible dans Paramètres.','Developer mode on: Technical menu visible in Settings.'));return render()}
  toast(tr(NOCON[0],NOCON[1]));
};
MODALS.companyinfo={title:()=>tr('Informations de la société','Company information'),
  body:()=>{const d=UI.modal.data;const v=(k,def)=>d[k]!=null?d[k]:(ST.set[k]!=null?ST.set[k]:def);const f=(k,l,def)=>'<div class="fld"><label>'+l+'</label><input data-m="'+k+'" value="'+esc(v(k,def))+'"></div>';
    return f('company',tr('Nom de la société','Company name'),'Velume Coffee & Studio')+f('address',tr('Adresse','Address'),'Douala, Cameroun')+f('niu',tr('NIU (n° contribuable)','Tax ID (NIU)'),'')+f('rccm',tr('RCCM','Trade register no.'),'')+f('co_phone',tr('Téléphone','Phone'),'')+f('co_email',tr('E-mail','Email'),'')},
  foot:()=>'<button class="btn pri" data-a="co-ok">'+tr('Enregistrer','Save')+'</button><button class="btn" data-a="mclose">'+tr('Annuler','Cancel')+'</button>'};
A['co-ok']=()=>{const d=UI.modal.data;['company','address','niu','rccm','co_phone','co_email'].forEach(k=>{if(d[k]!=null)ST.set[k]=d[k]});UI.modal=null;save();toast(tr('Société mise à jour : visible sur factures, devis et tickets.','Company updated: shown on invoices, quotes and receipts.'));render()};
MODALS.doclay={title:()=>tr('Mise en page du document','Document layout'),
  body:()=>{const d=UI.modal.data;const l=d.lay||ST.set.doclayout||'std';const f=d.foot!=null?d.foot:(ST.set.inv_note||'');
    return '<div class="fld"><label>'+tr('Mise en page','Layout')+'</label><select data-m="lay">'+[['std',tr('Standard','Standard')],['clean',tr('Épuré','Clean')],['boxed',tr('Encadré','Boxed')]].map(o=>'<option value="'+o[0]+'"'+(l===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div><div class="fld"><label>'+tr('Mention en pied de facture','Invoice footer note')+'</label><textarea data-m="foot" rows="3">'+esc(f)+'</textarea></div><div class="doc lay-'+l+'" style="margin-top:8px;pointer-events:none;transform:scale(.9);transform-origin:top left">'+docHead()+'<p class="muted">'+tr('Aperçu de l’en-tête','Header preview')+'</p></div>'},
  foot:()=>'<button class="btn pri" data-a="lay-ok">'+tr('Enregistrer','Save')+'</button><button class="btn" data-a="mclose">'+tr('Annuler','Cancel')+'</button>'};
A['lay-ok']=()=>{const d=UI.modal.data;if(d.lay)ST.set.doclayout=d.lay;if(d.foot!=null)ST.set.inv_note=d.foot;UI.modal=null;save();toast(tr('Mise en page appliquée aux factures, devis et tickets.','Layout applied to invoices, quotes and receipts.'));render()};
document.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.m==='lay'&&UI.modal&&UI.modal.type==='doclay')render()});

/* ---------- libellés de menus ---------- */
{const cf=APPS.find(a=>a.id==='config');if(cf){const g=cf.menus.find(m=>m.id==='st_gen');if(g)g.l=['Paramètres généraux','General settings'];const u=cf.menus.find(m=>m.id==='st_usr');if(u)u.l=['Utilisateurs & Sociétés','Users & Companies']}}

/* ---------- interactions avec les applications ---------- */
{const pb=postBot;postBot=function(t){if(ST.set.ds_bot===false)return;if(/^(Stock bas|Low stock)/.test(String(t))&&ST.set.iv_alert===false)return;return pb(t)}}
{const dh=docHead;docHead=function(){const h=dh();const c=ST.set.mail_btn_bg;return c?h.replace('<b style="','<b style="color:'+c+';'):h}}
{const nb=MODALS.newproj.body;MODALS.newproj.body=function(){return nb.apply(this,arguments).split(PJDOM).join('@'+(ST.set.alias_dom||'velume.cm'))}}
{const sd=CUSTOM.stockdash;CUSTOM.stockdash=function(){const h=sd.apply(this,arguments);const it=D.all('stockitem');
  const kg=sum(it.filter(r=>r.unit==='kg'),r=>+r.qty||0),lit=sum(it.filter(r=>r.unit==='L'),r=>+r.qty||0);
  const w=ST.set.wunit==='lb'?fmt2(kg*2.20462)+' lb':fmt2(kg)+' kg',vol=ST.set.vunit==='ft3'?fmt2(lit/1000*35.3147)+' ft³':fmt2(lit/1000)+' m³';
  return h.replace('</div><div class="grid2">','<div class="kpi"><span>'+tr('Poids en stock','Weight in stock')+'</span><b>'+w+'</b></div><div class="kpi"><span>'+tr('Volume liquide','Liquid volume')+'</span><b>'+vol+'</b></div></div><div class="grid2">')}}
{const b=RENTF.btns.find(x=>x.set&&x.set.state==='confirmed');if(b){delete b.set;b.fn=r=>{
  if(ST.set.rent_dep!==false&&!r.deposit)return toast(tr('Acompte requis avant confirmation (Paramètres › Location).','Deposit required before confirming (Settings › Rental).'));
  if(ST.set.rent_min&&(+r.hours||0)<+ST.set.rent_min)return toast(tr('Durée minimale : '+ST.set.rent_min+' h (Paramètres › Location).','Minimum duration: '+ST.set.rent_min+' h (Settings › Rental).'));
  D.write('rental',r.id,{state:'confirmed'})}}}
{const t=SLOTBASE.tools&&SLOTBASE.tools[0];if(t){const f=t.fn;t.fn=()=>{const n=D.all('slot').filter(s=>s.state==='draft').length;f();if(n&&ST.set.pl_x!==false)postBot(tr(n+' créneau(x) de planning publié(s).',n+' planning shift(s) published.'))}}}
{const sv=A['sv-send'];A['sv-send']=()=>{if(ST.set.sv_x===false&&!((UI.modal.data.who||'').trim()))return toast(tr('Le nom est requis (réponses anonymes désactivées).','Name required (anonymous answers disabled).'));sv()}}
{const c0=M.sigdoc.compute;M.sigdoc.compute=r=>{if(c0)c0(r);if(r.state==='sent'&&!r.expire&&r.date){const d=pd(r.date);if(d)r.expire=iso(addDays(d,+ST.set.sign_days||30))}}}
M.delivery.f.fee.def=()=>(ST.set.dl_fee!=null?+ST.set.dl_fee:1000);
{const tv=A['till-validate'];A['till-validate']=()=>{const t=UI.till;const n0=D.all('posorder').length;const part=t&&t.partner;const total=t?cartTotal(t):0;tv();
  if(ST.set.ly_on===false||!part||D.all('posorder').length<=n0)return;
  const m=D.all('member').find(x=>x.partner===part);if(!m)return;
  const pts=Math.floor(total/1000*(ST.set.ly_rate!=null?+ST.set.ly_rate:1));if(pts>0){D.write('member',m.id,{points:(+m.points||0)+pts},{silent:true});setTimeout(()=>toast('★ '+m.name+' : +'+pts+' '+tr('points Velume Club','Velume Club points')),700)}}}
})();
