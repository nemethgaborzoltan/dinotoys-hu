import {useEffect,useMemo,useState} from 'react'
import {products} from '../../data/products'
import {
 activateDemoHero,getDemoActiveHero,getDemoHeroVersions,normalizeHero,saveAndActivateDemoHero,type HeroChip,type HeroConfig
} from '../../lib/hero'
import {
 defaultSiteEditorConfig,readDemoSiteEditorConfig,readDemoSiteEditorVersions,resetDemoSiteEditorConfig,restoreDemoSiteEditorVersion,
 saveDemoSiteEditorConfig,type CheckoutEditorConfig,type EditableLink,type FooterEditorConfig,type HeaderEditorConfig,type SiteEditorConfig
} from '../../lib/site-editor'

type Tab='hero'|'header'|'footer'|'checkout'|'versions'
type Props={demo:boolean;onMessage:(message:string|null)=>void}

const tabs:Array<{id:Tab;icon:string;label:string;hint:string}>=[
 {id:'hero',icon:'✦',label:'Hero',hint:'Fő üzenet és kiemelt játékok'},
 {id:'header',icon:'▰',label:'Fejléc',hint:'Logó, kereső és menü'},
 {id:'footer',icon:'▾',label:'Lábléc',hint:'Linkek és cégszövegek'},
 {id:'checkout',icon:'✓',label:'Checkout',hint:'Pénztár szövege és megjelenése'},
 {id:'versions',icon:'↶',label:'Verziók',hint:'Korábbi állapotok visszaállítása'},
]

export function SiteDesignWorkspace({demo,onMessage}:Props){
 const [tab,setTab]=useState<Tab>('hero')
 const [site,setSite]=useState<SiteEditorConfig>(()=>readDemoSiteEditorConfig())
 const [hero,setHero]=useState<HeroConfig>(()=>getDemoActiveHero())
 const [saved,setSaved]=useState<string|null>(null)
 const [versionTick,setVersionTick]=useState(0)
 useEffect(()=>{setSite(readDemoSiteEditorConfig());setHero(getDemoActiveHero())},[])
 const markSaved=(message:string)=>{setSaved(message);window.setTimeout(()=>setSaved(null),1800);setVersionTick(v=>v+1)}
 const saveSite=(section:'header'|'footer'|'checkout')=>{
  if(!demo){onMessage('Az éles tartalommentéshez előbb a CMS-adatbázis kötése szükséges. A demó szerkesztő most helyben működik.');return}
  saveDemoSiteEditorConfig(site,`${section==='header'?'Fejléc':section==='footer'?'Lábléc':'Checkout'} mentés`)
  setSite(readDemoSiteEditorConfig());markSaved('Mentve · a storefront azonnal frissült')
 }
 const saveHero=()=>{
  if(!demo){onMessage('Az éles hero mentéshez előbb a CMS-adatbázis kötése szükséges. A demó szerkesztő most helyben működik.');return}
  saveAndActivateDemoHero(hero,'Egyedi hero · admin szerkesztő')
  setHero(getDemoActiveHero());markSaved('Hero mentve és aktiválva')
 }
 return <>
  <div className="admin2-heading row site-builder-heading"><div><span className="eyebrow">Megjelenés szerkesztő</span><h1>Webshop szerkesztése</h1><p>Hero, fejléc, lábléc és checkout egy helyen. Mentés után a demó oldal azonnal az új beállítást használja.</p></div><div className="site-builder-heading-actions">{saved&&<span className="site-builder-saved">✓ {saved}</span>}<a className="btn btn-ghost" href="/" target="_blank" rel="noreferrer">Főoldal ↗</a><a className="btn btn-ghost" href="/checkout" target="_blank" rel="noreferrer">Checkout ↗</a></div></div>
  {!demo&&<div className="admin2-notice"><b>Éles adatkapcsolat aktív.</b> A vizuális builder adatbázisos mentése még külön CMS-bekötést igényel.</div>}
  <nav className="site-builder-tabs">{tabs.map(item=><button key={item.id} className={tab===item.id?'active':''} onClick={()=>setTab(item.id)}><i>{item.icon}</i><span><b>{item.label}</b><small>{item.hint}</small></span></button>)}</nav>
  {tab==='hero'&&<HeroBuilder value={hero} onChange={setHero} onSave={saveHero}/>}
  {tab==='header'&&<HeaderBuilder value={site.header} onChange={header=>setSite(current=>({...current,header}))} onSave={()=>saveSite('header')}/>}
  {tab==='footer'&&<FooterBuilder value={site.footer} onChange={footer=>setSite(current=>({...current,footer}))} onSave={()=>saveSite('footer')}/>}
  {tab==='checkout'&&<CheckoutBuilder value={site.checkout} onChange={checkout=>setSite(current=>({...current,checkout}))} onSave={()=>saveSite('checkout')}/>}
  {tab==='versions'&&<VersionManager tick={versionTick} onRestoreSite={()=>{setSite(readDemoSiteEditorConfig());markSaved('Korábbi webshop-beállítás visszaállítva')}} onRestoreHero={()=>{setHero(getDemoActiveHero());markSaved('Hero verzió aktiválva')}}/>}
 </>
}

function BuilderShell({title,hint,children,onSave,onReset,previewHref}:{title:string;hint:string;children:React.ReactNode;onSave:()=>void;onReset?:()=>void;previewHref:string}){
 return <div className="site-builder-shell"><div className="site-builder-bar"><div><h2>{title}</h2><p>{hint}</p></div><div>{onReset&&<button className="btn btn-ghost" onClick={onReset}>Alaphelyzet</button>}<a className="btn btn-ghost" href={previewHref} target="_blank" rel="noreferrer">Előnézet ↗</a><button className="btn btn-primary" onClick={onSave}>Mentés és frissítés</button></div></div>{children}</div>
}
function BuilderGroup({title,children,wide=false}:{title:string;children:React.ReactNode;wide?:boolean}){return <section className={`site-builder-group ${wide?'wide':''}`}><h3>{title}</h3>{children}</section>}
function TextField({label,value,onChange,placeholder='',multiline=false}:{label:string;value:string;onChange:(value:string)=>void;placeholder?:string;multiline?:boolean}){return <label className="site-builder-field"><span>{label}</span>{multiline?<textarea rows={4} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/>:<input value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/>}</label>}
function SwitchField({label,checked,onChange}:{label:string;checked:boolean;onChange:(value:boolean)=>void}){return <label className="site-builder-switch"><span>{label}</span><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/></label>}
function ColorField({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}){return <label className="site-builder-field color"><span>{label}</span><div><input type="color" value={/^#[0-9a-f]{6}$/i.test(value)?value:'#ff5f3d'} onChange={e=>onChange(e.target.value)}/><input value={value} onChange={e=>onChange(e.target.value)}/></div></label>}
function LinesField({label,value,onChange,placeholder}:{label:string;value:string[];onChange:(value:string[])=>void;placeholder?:string}){return <label className="site-builder-field"><span>{label}</span><textarea rows={5} value={value.join('\n')} placeholder={placeholder} onChange={e=>onChange(e.target.value.split('\n').map(x=>x.trim()).filter(Boolean))}/></label>}

function HeroBuilder({value,onChange,onSave}:{value:HeroConfig;onChange:(value:HeroConfig)=>void;onSave:()=>void}){
 const set=<K extends keyof HeroConfig>(key:K,next:HeroConfig[K])=>onChange({...value,[key]:next})
 const orbit=[...value.orbitProductIds]
 while(orbit.length<4)orbit.push('')
 const updateOrbit=(index:number,id:string)=>{const next=[...orbit];next[index]=id;set('orbitProductIds',next.filter(Boolean))}
 return <BuilderShell title="Hero szerkesztő" hint="A főoldal első, legfontosabb blokkja." onSave={onSave} previewHref="/">
  <div className="site-builder-grid">
   <BuilderGroup title="Szövegek">
    <TextField label="Felső rövid sor" value={value.eyebrow} onChange={v=>set('eyebrow',v)}/>
    <TextField label="Főcím" value={value.title} onChange={v=>set('title',v)}/>
    <TextField label="Kiemelt címsor" value={value.emphasis} onChange={v=>set('emphasis',v)}/>
    <TextField label="Leírás" value={value.description} multiline onChange={v=>set('description',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Gombok">
    <TextField label="Elsődleges gomb" value={value.primaryCta} onChange={v=>set('primaryCta',v)}/>
    <TextField label="Másodlagos gomb" value={value.secondaryCta} onChange={v=>set('secondaryCta',v)}/>
    <LinesField label="Bizalmi elemek" value={value.trustItems} onChange={v=>set('trustItems',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Elrendezés és stílus">
    <label className="site-builder-field"><span>Hero stílus</span><select value={value.mode} onChange={e=>set('mode',e.target.value as HeroConfig['mode'])}><option value="showcase">DinoStage Clean 3D</option><option value="universe">DinoVerse 3D</option><option value="cinematic">Premium 3D</option><option value="orbits">Floating commerce</option><option value="legacy">Legacy</option></select></label>
    <TextField label="Háttér CSS / gradient" value={value.background} multiline onChange={v=>set('background',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Kiemelt termékek">
    <ProductSelect label="Fő termék" value={value.spotlightProductId} onChange={v=>set('spotlightProductId',v)}/>
    {orbit.slice(0,4).map((id,index)=><ProductSelect key={index} label={`Kísérő termék ${index+1}`} value={id} onChange={v=>updateOrbit(index,v)}/>)}
   </BuilderGroup>
   <BuilderGroup title="Alsó kiemelések">
    <LinesField label="Mozgó / alsó üzenetek" value={value.notes} onChange={v=>set('notes',v)}/>
    <ChipEditor value={value.chips} onChange={v=>set('chips',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Gyors előnézet">
    <div className="site-builder-mini-preview hero-mini" style={{background:value.background}}><small>{value.eyebrow}</small><b>{value.title}</b><strong>{value.emphasis}</strong><p>{value.description}</p></div>
   </BuilderGroup>
  </div>
 </BuilderShell>
}

function ProductSelect({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}){return <label className="site-builder-field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}><option value="">— nincs —</option>{products.map(product=><option key={product.id} value={product.id}>{product.brand} · {product.name}</option>)}</select></label>}
function ChipEditor({value,onChange}:{value:HeroChip[];onChange:(value:HeroChip[])=>void}){
 const rows=value.length?value:[{label:'01',value:'Play-Doh'}]
 const update=(index:number,patch:Partial<HeroChip>)=>onChange(rows.map((row,i)=>i===index?{...row,...patch}:row))
 return <div className="site-builder-repeat"><span className="site-builder-repeat-title">Kis kiemelések</span>{rows.map((row,index)=><div key={index}><input value={row.label} onChange={e=>update(index,{label:e.target.value})} placeholder="01"/><input value={row.value} onChange={e=>update(index,{value:e.target.value})} placeholder="Play-Doh"/><button onClick={()=>onChange(rows.filter((_,i)=>i!==index))}>×</button></div>)}<button className="site-builder-add" onClick={()=>onChange([...rows,{label:String(rows.length+1).padStart(2,'0'),value:'Új elem'}])}>+ Elem</button></div>
}

function HeaderBuilder({value,onChange,onSave}:{value:HeaderEditorConfig;onChange:(value:HeaderEditorConfig)=>void;onSave:()=>void}){
 const set=<K extends keyof HeaderEditorConfig>(key:K,next:HeaderEditorConfig[K])=>onChange({...value,[key]:next})
 return <BuilderShell title="Fejléc szerkesztő" hint="Logó, felső sáv, kereső és navigáció." onSave={onSave} previewHref="/">
  <div className="site-builder-grid">
   <BuilderGroup title="Márka">
    <TextField label="Logó betű" value={value.logoLetter} onChange={v=>set('logoLetter',v.slice(0,2))}/>
    <TextField label="Márkanév" value={value.brandName} onChange={v=>set('brandName',v)}/>
    <TextField label="Domain végződés" value={value.brandSuffix} onChange={v=>set('brandSuffix',v)}/>
    <TextField label="Alcím" value={value.tagline} onChange={v=>set('tagline',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Felső információs sáv">
    <SwitchField label="Információs sáv" checked={value.showAnnouncement} onChange={v=>set('showAnnouncement',v)}/>
    <LinesField label="Üzenetek" value={value.announcementItems} onChange={v=>set('announcementItems',v)}/>
    <ColorField label="Sáv háttér" value={value.announcementBackground} onChange={v=>set('announcementBackground',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Kereső és gyorsgombok">
    <SwitchField label="Kereső" checked={value.showSearch} onChange={v=>set('showSearch',v)}/>
    <TextField label="Kereső helykitöltő" value={value.searchPlaceholder} onChange={v=>set('searchPlaceholder',v)}/>
    <SwitchField label="Ajándékkereső" checked={value.showGiftFinder} onChange={v=>set('showGiftFinder',v)}/>
    <TextField label="Ajándékkereső felirat" value={value.giftFinderLabel} onChange={v=>set('giftFinderLabel',v)}/>
    <SwitchField label="Kedvencek" checked={value.showWishlist} onChange={v=>set('showWishlist',v)}/>
    <TextField label="Kedvencek felirat" value={value.wishlistLabel} onChange={v=>set('wishlistLabel',v)}/>
    <SwitchField label="Kosár" checked={value.showCart} onChange={v=>set('showCart',v)}/>
    <TextField label="Kosár felirat" value={value.cartLabel} onChange={v=>set('cartLabel',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Navigáció" wide>
    <LinkEditor value={value.navItems} onChange={v=>set('navItems',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Márkák menü">
    <SwitchField label="Márkák menü" checked={value.showBrandMenu} onChange={v=>set('showBrandMenu',v)}/>
    <TextField label="Menü felirat" value={value.brandMenuLabel} onChange={v=>set('brandMenuLabel',v)}/>
    <LinkEditor value={value.brandLinks} onChange={v=>set('brandLinks',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Megjelenés">
    <SwitchField label="Ragadós fejléc" checked={value.sticky} onChange={v=>set('sticky',v)}/>
    <SwitchField label="Kompakt fejléc" checked={value.compact} onChange={v=>set('compact',v)}/>
    <SwitchField label="Összehasonlítás link" checked={value.showCompare} onChange={v=>set('showCompare',v)}/>
    <TextField label="Összehasonlítás felirat" value={value.compareLabel} onChange={v=>set('compareLabel',v)}/>
    <ColorField label="Kiemelő szín" value={value.accent} onChange={v=>set('accent',v)}/>
    <ColorField label="Fejléc háttér" value={value.headerBackground} onChange={v=>set('headerBackground',v)}/>
   </BuilderGroup>
  </div>
 </BuilderShell>
}

function FooterBuilder({value,onChange,onSave}:{value:FooterEditorConfig;onChange:(value:FooterEditorConfig)=>void;onSave:()=>void}){
 const set=<K extends keyof FooterEditorConfig>(key:K,next:FooterEditorConfig[K])=>onChange({...value,[key]:next})
 return <BuilderShell title="Lábléc szerkesztő" hint="Alsó információk, linkoszlopok és jogi elemek." onSave={onSave} previewHref="/">
  <div className="site-builder-grid">
   <BuilderGroup title="Alapadatok">
    <SwitchField label="Lábléc megjelenítése" checked={value.enabled} onChange={v=>set('enabled',v)}/>
    <TextField label="Márkanév" value={value.brandName} onChange={v=>set('brandName',v)}/>
    <TextField label="Domain végződés" value={value.brandSuffix} onChange={v=>set('brandSuffix',v)}/>
    <TextField label="Bemutatkozás" value={value.intro} multiline onChange={v=>set('intro',v)}/>
    <TextField label="Jogi megjegyzés" value={value.legalNote} multiline onChange={v=>set('legalNote',v)}/>
    <TextField label="Copyright" value={value.copyright} onChange={v=>set('copyright',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Megjelenés">
    <ColorField label="Háttér" value={value.background} onChange={v=>set('background',v)}/>
    <ColorField label="Szövegszín" value={value.textColor} onChange={v=>set('textColor',v)}/>
    <SwitchField label="Cookie beállítás gomb" checked={value.showCookieButton} onChange={v=>set('showCookieButton',v)}/>
    <TextField label="Cookie gomb felirat" value={value.cookieLabel} onChange={v=>set('cookieLabel',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Vásárlás oszlop">
    <TextField label="Oszlop címe" value={value.shoppingTitle} onChange={v=>set('shoppingTitle',v)}/>
    <LinkEditor value={value.shoppingLinks} onChange={v=>set('shoppingLinks',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Ügyfélszolgálat oszlop">
    <TextField label="Oszlop címe" value={value.supportTitle} onChange={v=>set('supportTitle',v)}/>
    <LinkEditor value={value.supportLinks} onChange={v=>set('supportLinks',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Jogi oszlop" wide>
    <TextField label="Oszlop címe" value={value.legalTitle} onChange={v=>set('legalTitle',v)}/>
    <LinkEditor value={value.legalLinks} onChange={v=>set('legalLinks',v)}/>
   </BuilderGroup>
  </div>
 </BuilderShell>
}

function CheckoutBuilder({value,onChange,onSave}:{value:CheckoutEditorConfig;onChange:(value:CheckoutEditorConfig)=>void;onSave:()=>void}){
 const set=<K extends keyof CheckoutEditorConfig>(key:K,next:CheckoutEditorConfig[K])=>onChange({...value,[key]:next})
 const labels=[...value.progressLabels] as [string,string,string]
 return <BuilderShell title="Checkout szerkesztő" hint="A teljes pénztárszöveg és a fő vizuális beállítások." onSave={onSave} previewHref="/checkout">
  <div className="site-builder-grid">
   <BuilderGroup title="Oldal teteje">
    <TextField label="Felső sor" value={value.eyebrow} onChange={v=>set('eyebrow',v)}/>
    <TextField label="Főcím" value={value.title} onChange={v=>set('title',v)}/>
    <TextField label="Leírás" value={value.description} multiline onChange={v=>set('description',v)}/>
    <SwitchField label="Lépések mutatása" checked={value.showProgress} onChange={v=>set('showProgress',v)}/>
    {labels.map((label,index)=><TextField key={index} label={`Lépés ${index+1}`} value={label} onChange={v=>{const next=[...labels] as [string,string,string];next[index]=v;set('progressLabels',next)}}/>)}
   </BuilderGroup>
   <BuilderGroup title="Kapcsolattartás">
    <TextField label="Cím" value={value.contactTitle} onChange={v=>set('contactTitle',v)}/>
    <TextField label="Leírás" value={value.contactDescription} multiline onChange={v=>set('contactDescription',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Szállítás">
    <TextField label="Cím" value={value.shippingTitle} onChange={v=>set('shippingTitle',v)}/>
    <TextField label="Leírás" value={value.shippingDescription} multiline onChange={v=>set('shippingDescription',v)}/>
    <TextField label="Cím blokk neve" value={value.addressTitle} onChange={v=>set('addressTitle',v)}/>
    <TextField label="Cím blokk leírás" value={value.addressDescription} multiline onChange={v=>set('addressDescription',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Fizetés és jogi">
    <TextField label="Fizetés címe" value={value.paymentTitle} onChange={v=>set('paymentTitle',v)}/>
    <TextField label="Fizetés leírás" value={value.paymentDescription} multiline onChange={v=>set('paymentDescription',v)}/>
    <TextField label="Céges számla felirat" value={value.companyInvoiceLabel} onChange={v=>set('companyInvoiceLabel',v)}/>
    <TextField label="Elfogadó szöveg" value={value.consentText} multiline onChange={v=>set('consentText',v)}/>
    <TextField label="Rendelés gomb" value={value.submitLabel} onChange={v=>set('submitLabel',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Összesítő">
    <TextField label="Felső sor" value={value.summaryEyebrow} onChange={v=>set('summaryEyebrow',v)}/>
    <TextField label="Cím" value={value.summaryTitle} onChange={v=>set('summaryTitle',v)} placeholder="{{count}} termék"/>
    <TextField label="Kosár szerkesztése" value={value.editCartLabel} onChange={v=>set('editCartLabel',v)}/>
    <SwitchField label="Bizalmi elemek" checked={value.showTrust} onChange={v=>set('showTrust',v)}/>
    <LinesField label="Bizalmi üzenetek" value={value.trustItems} onChange={v=>set('trustItems',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Sikeres rendelés">
    <TextField label="Badge" value={value.successBadge} onChange={v=>set('successBadge',v)}/>
    <TextField label="Cím" value={value.successTitle} onChange={v=>set('successTitle',v)} placeholder="Rendelés #{{orderNumber}}"/>
    <TextField label="Szöveg" value={value.successText} multiline onChange={v=>set('successText',v)}/>
    <TextField label="Főoldal gomb" value={value.successPrimaryLabel} onChange={v=>set('successPrimaryLabel',v)}/>
    <TextField label="Admin gomb" value={value.successAdminLabel} onChange={v=>set('successAdminLabel',v)}/>
    <TextField label="Tovább vásárolok" value={value.successContinueLabel} onChange={v=>set('successContinueLabel',v)}/>
   </BuilderGroup>
   <BuilderGroup title="Megjelenés">
    <ColorField label="Kiemelő szín" value={value.accent} onChange={v=>set('accent',v)}/>
    <label className="site-builder-field"><span>Kártya lekerekítés: {value.panelRadius}px</span><input type="range" min="6" max="34" value={value.panelRadius} onChange={e=>set('panelRadius',Number(e.target.value))}/></label>
    <SwitchField label="Kompakt elrendezés" checked={value.compact} onChange={v=>set('compact',v)}/>
   </BuilderGroup>
  </div>
 </BuilderShell>
}

function LinkEditor({value,onChange}:{value:EditableLink[];onChange:(value:EditableLink[])=>void}){
 const update=(index:number,patch:Partial<EditableLink>)=>onChange(value.map((item,i)=>i===index?{...item,...patch}:item))
 return <div className="site-builder-links">{value.map((item,index)=><div key={item.id}><input type="checkbox" checked={item.enabled} onChange={e=>update(index,{enabled:e.target.checked})}/><input value={item.label} onChange={e=>update(index,{label:e.target.value})} placeholder="Felirat"/><input value={item.href} onChange={e=>update(index,{href:e.target.value})} placeholder="/eleresi-ut"/><button onClick={()=>onChange(value.filter((_,i)=>i!==index))}>×</button></div>)}<button className="site-builder-add" onClick={()=>onChange([...value,{id:'custom-'+Date.now(),label:'Új link',href:'/',enabled:true}])}>+ Link</button></div>
}

function VersionManager({tick,onRestoreSite,onRestoreHero}:{tick:number;onRestoreSite:()=>void;onRestoreHero:()=>void}){
 const siteVersions=useMemo(()=>readDemoSiteEditorVersions(),[tick])
 const heroVersions=useMemo(()=>getDemoHeroVersions(),[tick])
 return <div className="site-builder-version-columns">
  <section className="site-builder-version-panel"><div className="site-builder-version-head"><div><h2>Webshop beállítások</h2><p>Fejléc, lábléc és checkout mentések.</p></div><button className="btn btn-ghost" onClick={()=>{resetDemoSiteEditorConfig();onRestoreSite()}}>Alaphelyzet</button></div>{siteVersions.length?<div className="site-builder-version-list">{siteVersions.map(version=><div key={version.id}><span><b>{version.name}</b><small>{new Date(version.savedAt).toLocaleString('hu-HU')}</small></span><button onClick={()=>{restoreDemoSiteEditorVersion(version.id);onRestoreSite()}}>Visszaállítás</button></div>)}</div>:<div className="admin2-empty compact">Még nincs korábbi mentés.</div>}</section>
  <section className="site-builder-version-panel"><div className="site-builder-version-head"><div><h2>Hero verziók</h2><p>Beépített és egyedi hero változatok.</p></div></div><div className="site-builder-version-list">{heroVersions.map(version=><div key={version.id}><span><b>{version.name}</b><small>{version.content.mode} · {version.content.version}</small></span><button onClick={()=>{activateDemoHero(version.id);onRestoreHero()}}>Aktiválás</button></div>)}</div></section>
 </div>
}
