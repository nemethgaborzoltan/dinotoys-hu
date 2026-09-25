import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { products as demoProducts } from '../../data/products'
import { money } from '../../lib/format'
import { adminApi, AdminApiError, jsonBody } from '../../lib/admin-api'
import { getSupabaseBrowser, hasSupabaseBrowserConfig } from '../../lib/supabase.browser'

type View='dashboard'|'products'|'content'|'commerce'|'orders'|'media'|'integrations'|'security'
type AdminMe={userId:string;email:string;role:string;permissions:string[]}
type JsonRow=Record<string,any>

const nav:Array<{id:View;icon:string;label:string;hint:string}>=[
  {id:'dashboard',icon:'◫',label:'Áttekintés',hint:'Rendszerállapot'},
  {id:'products',icon:'◈',label:'Termékek',hint:'Katalógus · ár · készlet'},
  {id:'content',icon:'✎',label:'Tartalom & oldal',hint:'Kategória · menü · CMS'},
  {id:'commerce',icon:'₣',label:'Kereskedelem',hint:'Árazás · promóció · beállítás'},
  {id:'orders',icon:'▤',label:'Rendelések',hint:'Státusz · fulfillment'},
  {id:'media',icon:'▧',label:'Médiatár',hint:'Képek · fájlok'},
  {id:'integrations',icon:'⌁',label:'Integrációk',hint:'Supplier · provider'},
  {id:'security',icon:'⌾',label:'Biztonság & audit',hint:'RBAC · események'},
]

const demoRows=demoProducts.map(p=>({
  id:p.id,sku:p.sourceSku,ean:p.ean,name:p.name,slug:p.slug,brand:p.brand,description:p.description,short_description:p.description.slice(0,120),
  retail_price_huf:p.retailPrice,compare_at_price_huf:p.compareAtPrice??null,cost_net_eur:null,vat_rate:.27,stock_on_hand:p.stock,safety_stock:0,
  age_from:p.ageFrom,weight_grams:null,status:'draft',manufacturer_name:p.compliance.manufacturer,manufacturer_address:null,manufacturer_email:null,
  responsible_person_name:p.compliance.responsiblePerson,responsible_person_address:null,responsible_person_email:null,safety_warning_hu:p.compliance.warning,
  ce_marked:p.compliance.ceMarked,seo_title:p.name,seo_description:p.description.slice(0,150),metadata:{demo:true},product_images:[{url:p.art,alt_text:p.name}]
}))

const blankProduct:JsonRow={
  sku:'',ean:'',name:'',slug:'',brand:'',description:'',short_description:'',retail_price_huf:0,compare_at_price_huf:null,cost_net_eur:null,
  vat_rate:.27,stock_on_hand:0,safety_stock:0,age_from:null,weight_grams:null,status:'draft',manufacturer_name:'',manufacturer_address:'',
  manufacturer_email:null,responsible_person_name:'',responsible_person_address:'',responsible_person_email:null,safety_warning_hu:'',ce_marked:null,
  seo_title:'',seo_description:'',metadata:{},
}

export function AdminApp(){
  const configured=hasSupabaseBrowserConfig()
  const [session,setSession]=useState<Session|null>(null)
  const [authReady,setAuthReady]=useState(!configured)
  const [me,setMe]=useState<AdminMe|null>(configured?null:{userId:'demo',email:'demo@local',role:'demo_admin',permissions:['*']})
  const [view,setView]=useState<View>('dashboard')
  const [sidebar,setSidebar]=useState(true)
  const [message,setMessage]=useState<string|null>(null)

  useEffect(()=>{
    if(!configured)return
    const client=getSupabaseBrowser()!
    client.auth.getSession().then(({data})=>{setSession(data.session);setAuthReady(true)})
    const {data}=client.auth.onAuthStateChange((_event,next)=>{setSession(next);if(!next)setMe(null)})
    return()=>data.subscription.unsubscribe()
  },[configured])

  useEffect(()=>{
    if(!configured||!session)return
    adminApi<AdminMe>('/api/v1/admin/me').then(setMe).catch((e)=>{if(e instanceof AdminApiError&&e.status===403)setMe(null);else setMessage(e.message)})
  },[configured,session?.access_token])

  if(!authReady)return <AdminLoading/>
  if(configured&&!session)return <LoginScreen onMessage={setMessage} message={message}/>
  if(configured&&session&&!me)return <BootstrapScreen email={session.user.email||''} onReady={()=>adminApi<AdminMe>('/api/v1/admin/me').then(setMe)} />

  return <div className={`admin2 ${sidebar?'':'sidebar-collapsed'}`}>
    <aside className="admin2-sidebar">
      <div className="admin2-brand"><span className="brand-mark">D</span><div><b>DinoAdmin</b><small>Commerce OS</small></div></div>
      <button className="admin2-collapse" onClick={()=>setSidebar(v=>!v)}>{sidebar?'‹':'›'}</button>
      <nav>{nav.map(item=><button key={item.id} className={view===item.id?'active':''} onClick={()=>setView(item.id)}><i>{item.icon}</i><span><b>{item.label}</b><small>{item.hint}</small></span></button>)}</nav>
      <div className="admin2-user"><span>{me?.email?.slice(0,1).toUpperCase()}</span><div><b>{me?.email}</b><small>{me?.role}</small></div>{configured&&<button onClick={()=>getSupabaseBrowser()?.auth.signOut()}>↪</button>}</div>
    </aside>
    <main className="admin2-main">
      <header className="admin2-top"><div><span className={configured?'env-live':'env-demo'}>{configured?'● LIVE BACKEND':'● DEMO / NINCS SUPABASE'}</span><b>{nav.find(n=>n.id===view)?.label}</b></div><div><span>API v1</span><span>RBAC</span><span>Audit</span></div></header>
      {!configured&&<div className="admin2-notice"><b>Frontend-demó mód.</b> Az összes admin munkaterület megtekinthető és lokálisan szerkeszthető. Éles mentéshez add meg a Supabase kulcsokat és futtasd a migrációkat.</div>}
      {message&&<div className="admin2-error" onClick={()=>setMessage(null)}>{message} ×</div>}
      <div className="admin2-content">
        {view==='dashboard'&&<Dashboard demo={!configured}/>}
        {view==='products'&&<ProductsWorkspace demo={!configured} onMessage={setMessage}/>}
        {view==='content'&&<MultiResourceWorkspace demo={!configured} kind="content" onMessage={setMessage}/>}
        {view==='commerce'&&<MultiResourceWorkspace demo={!configured} kind="commerce" onMessage={setMessage}/>}
        {view==='orders'&&<OrdersWorkspace demo={!configured} onMessage={setMessage}/>}
        {view==='media'&&<MediaWorkspace demo={!configured} onMessage={setMessage}/>}
        {view==='integrations'&&<><IntegrationHealth demo={!configured} onMessage={setMessage}/><MultiResourceWorkspace demo={!configured} kind="integrations" onMessage={setMessage}/></>}
        {view==='security'&&<SecurityWorkspace demo={!configured} me={me!} onMessage={setMessage}/>}
      </div>
    </main>
  </div>
}

function AdminLoading(){return <div className="admin2-auth"><div className="admin2-auth-card"><div className="brand-mark">D</div><h1>DinoAdmin</h1><p>Admin munkamenet betöltése…</p></div></div>}

function LoginScreen({onMessage,message}:{onMessage:(v:string|null)=>void;message:string|null}){
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false)
  return <div className="admin2-auth"><form className="admin2-auth-card" onSubmit={async e=>{e.preventDefault();setBusy(true);const {error}=await getSupabaseBrowser()!.auth.signInWithPassword({email,password});setBusy(false);if(error)onMessage(error.message)}}><div className="brand-mark">D</div><span className="eyebrow">Védett admin</span><h1>Belépés</h1><p>Supabase Auth munkamenet + szerveroldali RBAC ellenőrzés.</p>{message&&<div className="admin2-error">{message}</div>}<label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Jelszó<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="btn btn-primary" disabled={busy}>{busy?'Belépés…':'Belépek →'}</button></form></div>
}

function BootstrapScreen({email,onReady}:{email:string;onReady:()=>void}){
  const [error,setError]=useState<string|null>(null)
  return <div className="admin2-auth"><div className="admin2-auth-card"><div className="brand-mark">D</div><span className="eyebrow">Első admin</span><h1>RBAC inicializálás</h1><p>A(z) <b>{email}</b> felhasználó be van jelentkezve, de még nincs admin szerepköre.</p><button className="btn btn-primary" onClick={async()=>{try{await adminApi('/api/v1/admin/bootstrap',{method:'POST'});onReady()}catch(e){setError(e instanceof Error?e.message:'Bootstrap hiba')}}}>Super Admin létrehozása</button>{error&&<div className="admin2-error">{error}</div>}<small>Csak az ADMIN_BOOTSTRAP_EMAIL környezeti változóban engedélyezett e-maillel működik, és csak akkor, ha még nincs admin.</small></div></div>
}

function Dashboard({demo}:{demo:boolean}){
  const totalStock=demoRows.reduce((s,p)=>s+p.stock_on_hand,0),value=demoRows.reduce((s,p)=>s+p.stock_on_hand*p.retail_price_huf,0)
  return <><div className="admin2-heading"><div><span className="eyebrow">Backend control center</span><h1>A webshop teljes operációja egy helyen</h1><p>Az admin nem közvetlenül táblákat piszkál: validált API → üzleti logika → auditált adatbázis művelet.</p></div></div>
  <div className="admin2-metrics"><Metric label="Katalógus" value={demo?String(demoRows.length):'API'} hint="Termék CRUD + publish gate"/><Metric label="Készlet" value={demo?String(totalStock):'Atomic'} hint="Reservation + movement ledger"/><Metric label="Demo retail érték" value={demo?money(value):'—'} hint="Valódi ár DB-ből"/><Metric label="Backend" value="API v1" hint="Auth · RBAC · audit"/></div>
  <div className="admin2-grid">
    <section className="admin2-card"><div className="admin2-card-head"><div><span className="eyebrow">Architektúra</span><h2>Backend rétegek</h2></div><span className="admin2-ok">Aktív</span></div><div className="backend-stack">{['REST /api/v1 + TanStack server routes','Zod request validation','Supabase Auth + Bearer token','RBAC permission matrix','Service / business logic layer','PostgreSQL + RLS','Supabase Storage media','Audit log + outbox/webhook store'].map((x,i)=><div key={x}><b>{String(i+1).padStart(2,'0')}</b><span>{x}</span><i>✓</i></div>)}</div></section>
    <section className="admin2-card"><div className="admin2-card-head"><div><span className="eyebrow">Domain</span><h2>Szerkeszthető területek</h2></div></div><div className="admin2-domain-grid">{['Termékek','Árak','Készlet','Kategóriák','Márkák','Oldalak','Főoldali blokkok','Navigáció','Promóciók','Szállítási beállítás','Supplier','Integrációk','Média','Rendelések','Jogosultságok'].map(x=><span key={x}>✓ {x}</span>)}</div></section>
  </div></>
}
function Metric({label,value,hint}:{label:string;value:string;hint:string}){return <div><span>{label}</span><b>{value}</b><small>{hint}</small></div>}

function ProductsWorkspace({demo,onMessage}:{demo:boolean;onMessage:(s:string|null)=>void}){
  const [rows,setRows]=useState<JsonRow[]>(demo?demoRows:[]),[loading,setLoading]=useState(!demo),[query,setQuery]=useState(''),[status,setStatus]=useState('')
  const [edit,setEdit]=useState<JsonRow|null>(null),[isNew,setIsNew]=useState(false)
  const load=async()=>{if(demo)return;setLoading(true);try{const data=await adminApi<{items:JsonRow[]}>(`/api/v1/admin/products?q=${encodeURIComponent(query)}&status=${encodeURIComponent(status)}`);setRows(data.items)}catch(e){onMessage((e as Error).message)}finally{setLoading(false)}}
  useEffect(()=>{void load()},[demo,status])
  const visible=demo?rows.filter(r=>!query||String(r.name).toLowerCase().includes(query.toLowerCase())||String(r.sku).toLowerCase().includes(query.toLowerCase())):rows
  return <><div className="admin2-heading row"><div><span className="eyebrow">Katalógus motor</span><h1>Termékek</h1><p>Minden kereskedelmi, SEO-, safety-, pricing- és inventory mező egy helyen.</p></div><button className="btn btn-primary" onClick={()=>{setIsNew(true);setEdit({...blankProduct})}}>+ Új termék</button></div>
  <div className="admin2-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')void load()}} placeholder="Név, SKU, EAN, márka…"/><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Minden státusz</option><option>draft</option><option>review</option><option>active</option><option>archived</option><option>recalled</option></select><button className="btn btn-ghost" onClick={()=>void load()}>Frissítés</button></div>
  <div className="admin2-table-wrap"><table className="admin2-table"><thead><tr><th>Termék</th><th>SKU / EAN</th><th>Ár</th><th>Készlet</th><th>Safety</th><th>Státusz</th><th></th></tr></thead><tbody>{loading?<tr><td colSpan={7}>Betöltés…</td></tr>:visible.map(p=><tr key={p.id}><td><div className="admin2-product-cell">{p.product_images?.[0]?.url?<img src={p.product_images[0].url}/>:<span>◈</span>}<div><b>{p.name}</b><small>{p.brand||'—'} · {p.age_from??'—'}+ év</small></div></div></td><td><b>{p.sku}</b><small>{p.ean||'—'}</small></td><td><b>{money(Number(p.retail_price_huf||0))}</b>{p.compare_at_price_huf&&<small><s>{money(p.compare_at_price_huf)}</s></small>}</td><td><b>{p.stock_on_hand}</b><small>safety: {p.safety_stock||0}</small></td><td><span className={p.manufacturer_name&&p.safety_warning_hu?'admin2-pill ok':'admin2-pill warn'}>{p.manufacturer_name&&p.safety_warning_hu?'kész':'hiányos'}</span></td><td><span className={`admin2-pill ${p.status==='active'?'ok':''}`}>{p.status}</span></td><td><button className="admin2-link" onClick={()=>{setIsNew(false);setEdit({...p})}}>Szerkesztés →</button></td></tr>)}</tbody></table></div>
  {edit&&<ProductDrawer product={edit} isNew={isNew} demo={demo} onClose={()=>setEdit(null)} onSaved={async(saved)=>{if(demo){setRows(cur=>isNew?[{...saved,id:crypto.randomUUID()},...cur]:cur.map(r=>r.id===saved.id?saved:r));setEdit(null)}else{await load();setEdit(null)}} onMessage={onMessage}/>}</>
}

function ProductDrawer({product,isNew,demo,onClose,onSaved,onMessage}:{product:JsonRow;isNew:boolean;demo:boolean;onClose:()=>void;onSaved:(p:JsonRow)=>void|Promise<void>;onMessage:(s:string|null)=>void}){
  const [form,setForm]=useState<JsonRow>(product),[busy,setBusy]=useState(false),[imageUrl,setImageUrl]=useState(''),[delta,setDelta]=useState(0),[reason,setReason]=useState('Kézi készletkorrekció')
  const set=(key:string,value:any)=>setForm(f=>({...f,[key]:value}))
  const save=async()=>{setBusy(true);try{if(demo){await onSaved(form);return}const path=isNew?'/api/v1/admin/products':`/api/v1/admin/products/${form.id}`;const saved=await adminApi<JsonRow>(path,{method:isNew?'POST':'PATCH',body:jsonBody(sanitizeProduct(form))});await onSaved({...form,...saved})}catch(e){onMessage((e as Error).message)}finally{setBusy(false)}}
  return <div className="admin2-drawer-backdrop" onMouseDown={onClose}><div className="admin2-drawer" onMouseDown={e=>e.stopPropagation()}><div className="admin2-drawer-head"><div><span className="eyebrow">{isNew?'Új termék':'Termék szerkesztése'}</span><h2>{form.name||'Névtelen termék'}</h2></div><button onClick={onClose}>×</button></div>
  <div className="admin2-tabs-note">A publikálás szerveroldali kapuhoz kötött: ár + készlet + gyártó + EU felelős személy + safety warning + legalább egy kép.</div>
  <EditorSection title="Alapadatok"><Field label="Név" value={form.name} onChange={v=>set('name',v)}/><Field label="Slug" value={form.slug} onChange={v=>set('slug',slugify(v))}/><Field label="SKU" value={form.sku} onChange={v=>set('sku',v)}/><Field label="EAN" value={form.ean||''} onChange={v=>set('ean',v||null)}/><Field label="Márka" value={form.brand||''} onChange={v=>set('brand',v)}/><SelectField label="Státusz" value={form.status} options={['draft','review','active','archived','recalled']} onChange={v=>set('status',v)}/></EditorSection>
  <EditorSection title="Ár & készlet"><NumberField label="Bruttó kisker ár (Ft)" value={form.retail_price_huf} onChange={v=>set('retail_price_huf',v)}/><NumberField label="Összehasonlító ár (Ft)" value={form.compare_at_price_huf} nullable onChange={v=>set('compare_at_price_huf',v)}/><NumberField label="Beszerzési nettó EUR" value={form.cost_net_eur} nullable decimals onChange={v=>set('cost_net_eur',v)}/><NumberField label="ÁFA" value={form.vat_rate} decimals onChange={v=>set('vat_rate',v)}/><NumberField label="Safety stock" value={form.safety_stock} onChange={v=>set('safety_stock',v)}/><NumberField label="Korhatár" value={form.age_from} nullable onChange={v=>set('age_from',v)}/></EditorSection>
  {!isNew&&<div className="admin2-inline-tool"><div><b>Atomikus készletkorrekció</b><small>Ledger-be is bekerül, negatív készletet nem enged.</small></div><input type="number" value={delta} onChange={e=>setDelta(Number(e.target.value))}/><input value={reason} onChange={e=>setReason(e.target.value)}/><button className="btn btn-ghost" onClick={async()=>{if(demo){set('stock_on_hand',Number(form.stock_on_hand)+delta);return}try{const r=await adminApi<{stock_on_hand:number}>(`/api/v1/admin/products/${form.id}/inventory`,{method:'POST',body:jsonBody({delta,reason})});set('stock_on_hand',r.stock_on_hand)}catch(e){onMessage((e as Error).message)}}}>Módosít</button></div>}
  <EditorSection title="Leírás & SEO"><TextArea label="Rövid leírás" value={form.short_description||''} onChange={v=>set('short_description',v)}/><TextArea label="Részletes leírás" value={form.description||''} onChange={v=>set('description',v)}/><Field label="SEO title" value={form.seo_title||''} onChange={v=>set('seo_title',v)}/><TextArea label="Meta description" value={form.seo_description||''} onChange={v=>set('seo_description',v)}/></EditorSection>
  <EditorSection title="Termékbiztonság / GPSR"><Field label="Gyártó" value={form.manufacturer_name||''} onChange={v=>set('manufacturer_name',v)}/><Field label="Gyártó címe" value={form.manufacturer_address||''} onChange={v=>set('manufacturer_address',v)}/><Field label="Gyártó e-mail" value={form.manufacturer_email||''} onChange={v=>set('manufacturer_email',v||null)}/><Field label="EU felelős személy" value={form.responsible_person_name||''} onChange={v=>set('responsible_person_name',v)}/><Field label="EU felelős cím" value={form.responsible_person_address||''} onChange={v=>set('responsible_person_address',v)}/><Field label="EU felelős e-mail" value={form.responsible_person_email||''} onChange={v=>set('responsible_person_email',v||null)}/><TextArea label="Magyar biztonsági figyelmeztetés" value={form.safety_warning_hu||''} onChange={v=>set('safety_warning_hu',v)}/><SelectField label="CE jelölés" value={form.ce_marked==null?'unknown':form.ce_marked?'yes':'no'} options={['unknown','yes','no']} onChange={v=>set('ce_marked',v==='unknown'?null:v==='yes')}/></EditorSection>
  {!isNew&&<EditorSection title="Képek"><div className="admin2-image-list">{(form.product_images||[]).map((im:any)=><div key={im.id||im.url}><img src={im.url}/><span>{im.alt_text||'Nincs alt'}</span></div>)}</div><div className="admin2-add-row"><input placeholder="Médiatárból vagy külső kép URL" value={imageUrl} onChange={e=>setImageUrl(e.target.value)}/><button className="btn btn-ghost" onClick={async()=>{if(!imageUrl)return;if(demo){set('product_images',[...(form.product_images||[]),{id:crypto.randomUUID(),url:imageUrl}]);setImageUrl('');return}try{const im=await adminApi<JsonRow>(`/api/v1/admin/products/${form.id}/images`,{method:'POST',body:jsonBody({url:imageUrl,alt_text:form.name})});set('product_images',[...(form.product_images||[]),im]);setImageUrl('')}catch(e){onMessage((e as Error).message)}}}>Kép hozzáadása</button></div></EditorSection>}
  <div className="admin2-drawer-actions"><button className="btn btn-ghost" onClick={onClose}>Mégse</button><button className="btn btn-primary" disabled={busy} onClick={()=>void save()}>{busy?'Mentés…':'Mentés'}</button></div></div></div>
}

function sanitizeProduct(form:JsonRow){
  const allowed=['sku','ean','name','slug','brand','description','short_description','retail_price_huf','compare_at_price_huf','cost_net_eur','vat_rate','stock_on_hand','safety_stock','age_from','weight_grams','status','manufacturer_name','manufacturer_address','manufacturer_email','responsible_person_name','responsible_person_address','responsible_person_email','safety_warning_hu','ce_marked','seo_title','seo_description','metadata']
  return Object.fromEntries(allowed.map(k=>[k,form[k]]))
}

const resourceGroups={
  content:[
    ['categories','Kategóriák','A katalógus hierarchiája','categories'],
    ['brands','Márkák','Márkaoldalak és logók','brands'],
    ['content_pages','CMS oldalak','Szállítás, jogi, landing tartalmak','content'],
    ['navigation_items','Navigáció','Header/footer menüpontok','navigation'],
    ['homepage_sections','Főoldal blokkok','Hero, trend, ajánló, CTA','homepage'],
  ],
  commerce:[
    ['settings','Beállítások','Kereskedelmi és feature konfiguráció','settings'],
    ['price_rules','Árképzési szabályok','Margin, FX buffer, inbound cost','pricing'],
    ['promotions','Promóciók','Kupon és kampányszabályok','promotions'],
  ],
  integrations:[
    ['suppliers','Beszállítók','Feed/API/XML/CSV konfiguráció','supplier'],
    ['integration_accounts','Provider kapcsolatok','Fizetés, e-mail, számlázó, shipping','integration'],
  ],
} as const

const fieldSets:Record<string,Array<{key:string;label:string;type?:'text'|'number'|'boolean'|'json'|'textarea'}>>={
 categories:[{key:'name',label:'Név'},{key:'slug',label:'Slug'},{key:'description',label:'Leírás',type:'textarea'},{key:'sort_order',label:'Sorrend',type:'number'},{key:'active',label:'Aktív',type:'boolean'}],
 brands:[{key:'name',label:'Név'},{key:'slug',label:'Slug'},{key:'description',label:'Leírás',type:'textarea'},{key:'logo_url',label:'Logó URL'},{key:'active',label:'Aktív',type:'boolean'}],
 content:[{key:'slug',label:'Slug'},{key:'title',label:'Cím'},{key:'body',label:'Tartalom',type:'textarea'},{key:'seo_title',label:'SEO title'},{key:'seo_description',label:'Meta description',type:'textarea'},{key:'published',label:'Publikált',type:'boolean'}],
 navigation:[{key:'location',label:'Hely (header/footer)'},{key:'label',label:'Felirat'},{key:'href',label:'URL'},{key:'sort_order',label:'Sorrend',type:'number'},{key:'active',label:'Aktív',type:'boolean'}],
 homepage:[{key:'section_key',label:'Blokk kulcs'},{key:'title',label:'Admin cím'},{key:'sort_order',label:'Sorrend',type:'number'},{key:'enabled',label:'Bekapcsolva',type:'boolean'},{key:'content',label:'Blokk tartalma (JSON)',type:'json'}],
 settings:[{key:'key',label:'Kulcs'},{key:'group_name',label:'Csoport'},{key:'description',label:'Leírás'},{key:'public',label:'Publikus',type:'boolean'},{key:'value',label:'Érték (JSON)',type:'json'}],
 pricing:[{key:'name',label:'Szabály neve'},{key:'target_margin',label:'Célárrés (0-0.89)',type:'number'},{key:'fx_buffer',label:'FX buffer',type:'number'},{key:'inbound_per_unit_huf',label:'Bejövő költség / db',type:'number'},{key:'active',label:'Aktív',type:'boolean'}],
 promotions:[{key:'name',label:'Név'},{key:'code',label:'Kód'},{key:'kind',label:'Típus'},{key:'value',label:'Érték',type:'number'},{key:'starts_at',label:'Kezdet ISO'},{key:'ends_at',label:'Vége ISO'},{key:'conditions',label:'Feltételek JSON',type:'json'},{key:'active',label:'Aktív',type:'boolean'}],
 supplier:[{key:'name',label:'Beszállító neve'},{key:'code',label:'Kód'},{key:'feed_type',label:'Feed típus'},{key:'feed_url',label:'Feed URL'},{key:'config',label:'Konfiguráció JSON',type:'json'},{key:'active',label:'Aktív',type:'boolean'}],
 integration:[{key:'provider',label:'Provider'},{key:'kind',label:'Típus'},{key:'config',label:'Publikus konfiguráció JSON',type:'json'},{key:'secret_names',label:'Secret nevek JSON',type:'json'},{key:'active',label:'Aktív',type:'boolean'}],
}

function MultiResourceWorkspace({demo,kind,onMessage}:{demo:boolean;kind:keyof typeof resourceGroups;onMessage:(s:string|null)=>void}){
  const choices=resourceGroups[kind], [resource,setResource]=useState<string>(choices[0][0]), [rows,setRows]=useState<JsonRow[]>([]),[edit,setEdit]=useState<JsonRow|null>(null),[isNew,setIsNew]=useState(false),[loading,setLoading]=useState(false)
  const def=choices.find(x=>x[0]===resource)!,fieldKey=def[3],fields=fieldSets[fieldKey]
  const load=async()=>{if(demo){setRows(demoResource(resource));return}setLoading(true);try{setRows(await adminApi<JsonRow[]>(`/api/v1/admin/resources/${resource}`))}catch(e){onMessage((e as Error).message)}finally{setLoading(false)}}
  useEffect(()=>{void load()},[resource,demo])
  return <><div className="admin2-heading row"><div><span className="eyebrow">Headless admin configuration</span><h1>{kind==='content'?'Tartalom & webhely':kind==='commerce'?'Kereskedelmi konfiguráció':'Integrációs központ'}</h1><p>Minden változás validált API-n és audit logon keresztül történik.</p></div><button className="btn btn-primary" onClick={()=>{setIsNew(true);setEdit(blankFor(fields))}}>+ Új elem</button></div>
  <div className="admin2-resource-tabs">{choices.map(c=><button key={c[0]} className={resource===c[0]?'active':''} onClick={()=>setResource(c[0])}><b>{c[1]}</b><small>{c[2]}</small></button>)}</div>
  <div className="admin2-list">{loading?<div className="admin2-empty">Betöltés…</div>:rows.length===0?<div className="admin2-empty"><b>Még nincs adat.</b><span>Az első elemet a + Új elem gombbal hozhatod létre.</span></div>:rows.map(row=><div className="admin2-list-row" key={row.id||row.key||row.slug}><div><b>{row.name||row.title||row.label||row.key||row.provider||row.section_key}</b><small>{row.slug||row.code||row.kind||row.group_name||row.location||row.feed_type||''}</small></div><div className="admin2-row-tags">{typeof row.active==='boolean'&&<span className={row.active?'admin2-pill ok':'admin2-pill'}>{row.active?'aktív':'inaktív'}</span>}{typeof row.published==='boolean'&&<span className={row.published?'admin2-pill ok':'admin2-pill'}>{row.published?'publikált':'draft'}</span>}</div><button className="admin2-link" onClick={()=>{setIsNew(false);setEdit({...row})}}>Szerkesztés →</button></div>)}</div>
  {edit&&<ResourceDrawer title={def[1]} row={edit} fields={fields} onClose={()=>setEdit(null)} onSave={async row=>{try{if(demo){setRows(cur=>isNew?[{...row,id:crypto.randomUUID()},...cur]:cur.map(x=>x.id===row.id?row:x));setEdit(null);return}const path=isNew?`/api/v1/admin/resources/${resource}`:`/api/v1/admin/resources/${resource}/${row.id}`;await adminApi(path,{method:isNew?'POST':'PATCH',body:jsonBody(row)});setEdit(null);await load()}catch(e){onMessage((e as Error).message)}}} onDelete={!isNew?async()=>{try{if(demo){setRows(cur=>cur.filter(x=>x.id!==edit.id));setEdit(null);return}await adminApi(`/api/v1/admin/resources/${resource}/${edit.id}`,{method:'DELETE'});setEdit(null);await load()}catch(e){onMessage((e as Error).message)}}:undefined}/>}</>
}

function ResourceDrawer({title,row,fields,onClose,onSave,onDelete}:{title:string;row:JsonRow;fields:Array<{key:string;label:string;type?:string}>;onClose:()=>void;onSave:(r:JsonRow)=>void|Promise<void>;onDelete?:()=>void|Promise<void>}){
  const [form,setForm]=useState<JsonRow>(row),[jsonErrors,setJsonErrors]=useState<Record<string,string>>({})
  return <div className="admin2-drawer-backdrop" onMouseDown={onClose}><div className="admin2-drawer narrow" onMouseDown={e=>e.stopPropagation()}><div className="admin2-drawer-head"><div><span className="eyebrow">Szerkesztő</span><h2>{title}</h2></div><button onClick={onClose}>×</button></div><div className="admin2-form-grid">{fields.map(f=>{const v=form[f.key];if(f.type==='boolean')return <label className="admin2-toggle" key={f.key}><span><b>{f.label}</b></span><input type="checkbox" checked={Boolean(v)} onChange={e=>setForm(x=>({...x,[f.key]:e.target.checked}))}/></label>;if(f.type==='json')return <label key={f.key}><span>{f.label}</span><textarea rows={7} value={typeof v==='string'?v:JSON.stringify(v??{},null,2)} onChange={e=>{try{setForm(x=>({...x,[f.key]:JSON.parse(e.target.value)}));setJsonErrors(x=>({...x,[f.key]:''}))}catch{setJsonErrors(x=>({...x,[f.key]:'Érvénytelen JSON'}))}}}/>{jsonErrors[f.key]&&<small className="field-error">{jsonErrors[f.key]}</small>}</label>;if(f.type==='textarea')return <label key={f.key}><span>{f.label}</span><textarea rows={7} value={v??''} onChange={e=>setForm(x=>({...x,[f.key]:e.target.value}))}/></label>;return <label key={f.key}><span>{f.label}</span><input type={f.type==='number'?'number':'text'} step={f.type==='number'?'any':undefined} value={v??''} onChange={e=>setForm(x=>({...x,[f.key]:f.type==='number'?Number(e.target.value):e.target.value}))}/></label>})}</div><div className="admin2-drawer-actions">{onDelete&&<button className="btn admin2-danger" onClick={()=>void onDelete()}>Törlés</button>}<span/><button className="btn btn-ghost" onClick={onClose}>Mégse</button><button className="btn btn-primary" onClick={()=>void onSave(form)}>Mentés</button></div></div></div>
}

function OrdersWorkspace({demo,onMessage}:{demo:boolean;onMessage:(s:string|null)=>void}){
 const [rows,setRows]=useState<JsonRow[]>([]),[loading,setLoading]=useState(!demo)
 const load=async()=>{if(demo){setRows([]);setLoading(false);return}setLoading(true);try{const d=await adminApi<{items:JsonRow[]}>('/api/v1/admin/orders');setRows(d.items)}catch(e){onMessage((e as Error).message)}finally{setLoading(false)}}
 useEffect(()=>{void load()},[demo])
 return <><div className="admin2-heading"><span className="eyebrow">Order state machine</span><h1>Rendelések</h1><p>A státusz nem szabad szöveg: csak engedélyezett üzleti átmenetek hajthatók végre.</p></div><div className="admin2-table-wrap"><table className="admin2-table"><thead><tr><th>Rendelés</th><th>Ügyfél</th><th>Összeg</th><th>Státusz</th><th>Létrehozva</th><th></th></tr></thead><tbody>{loading?<tr><td colSpan={6}>Betöltés…</td></tr>:rows.length===0?<tr><td colSpan={6}><div className="admin2-empty"><b>Még nincs valódi rendelés.</b><span>A checkout API után itt jelennek meg.</span></div></td></tr>:rows.map(o=><OrderRow key={o.id} order={o} onChanged={load} onMessage={onMessage}/>)}</tbody></table></div></>
}
function OrderRow({order,onChanged,onMessage}:{order:JsonRow;onChanged:()=>Promise<void>;onMessage:(s:string|null)=>void}){
 const [next,setNext]=useState(order.status)
 return <tr><td><b>#{order.order_number}</b><small>{order.id.slice(0,8)}</small></td><td><b>{order.email}</b><small>{order.phone}</small></td><td><b>{money(order.total_huf||0)}</b><small>{order.order_items?.length||0} tétel</small></td><td><span className="admin2-pill">{order.status}</span></td><td>{new Date(order.created_at).toLocaleString('hu-HU')}</td><td><div className="admin2-order-action"><select value={next} onChange={e=>setNext(e.target.value)}>{['draft','pending_payment','paid','processing','shipped','delivered','cancelled','returned','refunded'].map(x=><option key={x}>{x}</option>)}</select><button className="admin2-link" onClick={async()=>{try{await adminApi(`/api/v1/admin/orders/${order.id}`,{method:'PATCH',body:jsonBody({status:next})});await onChanged()}catch(e){onMessage((e as Error).message)}}}>Mentés</button></div></td></tr>
}

function MediaWorkspace({demo,onMessage}:{demo:boolean;onMessage:(s:string|null)=>void}){
 const [rows,setRows]=useState<JsonRow[]>([]),[busy,setBusy]=useState(false)
 const load=async()=>{if(demo)return;try{setRows(await adminApi<JsonRow[]>('/api/v1/admin/media'))}catch(e){onMessage((e as Error).message)}}
 useEffect(()=>{void load()},[demo])
 return <><div className="admin2-heading"><span className="eyebrow">Supabase Storage</span><h1>Médiatár</h1><p>Maximum 8 MB, MIME allowlist, szerveroldali feltöltés, metaadat és audit.</p></div><label className="admin2-upload"><span>▧</span><b>{busy?'Feltöltés…':'Kép feltöltése'}</b><small>JPEG · PNG · WebP · AVIF · SVG</small><input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" disabled={demo||busy} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);try{const fd=new FormData();fd.append('file',file);fd.append('folder','products');await adminApi('/api/v1/admin/media',{method:'POST',body:fd});await load()}catch(err){onMessage((err as Error).message)}finally{setBusy(false)}}}/></label>{demo&&<div className="admin2-notice">Feltöltéshez Supabase Storage kapcsolat szükséges; a migráció automatikusan létrehozza a <b>product-media</b> bucketet.</div>}<div className="admin2-media-grid">{rows.map(a=><div key={a.id}><img src={a.url}/><b>{a.file_name}</b><small>{Math.round(a.size_bytes/1024)} KB · {a.mime_type}</small><button onClick={async()=>{try{await adminApi(`/api/v1/admin/media/${a.id}`,{method:'DELETE'});await load()}catch(e){onMessage((e as Error).message)}}}>Törlés</button></div>)}</div></>
}

function IntegrationHealth({demo,onMessage}:{demo:boolean;onMessage:(s:string|null)=>void}){
 const [rows,setRows]=useState<Array<{provider:string;kind:string;ready:boolean;requiredSecrets:string[];configuredSecrets:string[]}>>([])
 useEffect(()=>{if(!demo)adminApi<typeof rows>('/api/v1/admin/integrations/health').then(setRows).catch(e=>onMessage(e.message))},[demo])
 const fallback=[
  {provider:'supabase',kind:'database/auth/storage',ready:false,requiredSecrets:['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'],configuredSecrets:[]},
  {provider:'stripe',kind:'payment',ready:false,requiredSecrets:['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET'],configuredSecrets:[]},
  {provider:'resend',kind:'email',ready:false,requiredSecrets:['RESEND_API_KEY'],configuredSecrets:[]},
  {provider:'billingo / számlázz.hu',kind:'invoice',ready:false,requiredSecrets:['BILLINGO_API_KEY / SZAMLAZZ_AGENT_KEY'],configuredSecrets:[]},
  {provider:'foxpost / packeta / gls',kind:'shipping',ready:false,requiredSecrets:['provider API key'],configuredSecrets:[]},
  {provider:'dinotoys',kind:'supplier',ready:false,requiredSecrets:['DINOTOYS_FEED_URL'],configuredSecrets:[]},
 ]
 const data=demo?fallback:rows
 return <section className="admin2-card integration-health"><div className="admin2-card-head"><div><span className="eyebrow">Runtime readiness</span><h2>Integrációs állapot</h2></div><span>{data.filter(x=>x.ready).length}/{data.length} kész</span></div><div className="integration-health-grid">{data.map(item=><div key={item.provider}><span className={item.ready?'health-dot ready':'health-dot'}></span><div><b>{item.provider}</b><small>{item.kind}</small></div><strong>{item.ready?'KÉSZ':'KONFIGURÁLANDÓ'}</strong></div>)}</div><p className="admin2-help">A panel csak azt jelzi, hogy a szükséges környezeti secret-ek jelen vannak. A secret értékek soha nem kerülnek a böngészőbe vagy az adatbázis publikus konfigurációjába.</p></section>
}

function SecurityWorkspace({demo,me,onMessage}:{demo:boolean;me:AdminMe;onMessage:(s:string|null)=>void}){
 const [audit,setAudit]=useState<JsonRow[]>([])
 const [directory,setDirectory]=useState<{users:JsonRow[];roles:JsonRow[]}>({users:[],roles:[]})
 const [email,setEmail]=useState(''),[displayName,setDisplayName]=useState(''),[roleId,setRoleId]=useState('')
 const canManage=me.permissions.includes('*')||me.permissions.includes('users.manage')
 const loadUsers=async()=>{if(demo||!canManage)return;try{const data=await adminApi<{users:JsonRow[];roles:JsonRow[]}>('/api/v1/admin/users');setDirectory(data);if(!roleId&&data.roles[0])setRoleId(data.roles[0].id)}catch(e){onMessage((e as Error).message)}}
 useEffect(()=>{if(!demo)adminApi<JsonRow[]>('/api/v1/admin/audit').then(setAudit).catch(e=>onMessage(e.message));void loadUsers()},[demo,canManage])
 return <><div className="admin2-heading"><span className="eyebrow">Zero-trust admin boundary</span><h1>Biztonság, csapat & audit</h1><p>A frontend menü csak UX. A tényleges jogosultság minden privát API végponton külön, szerveroldalon kerül ellenőrzésre.</p></div>
 <div className="admin2-grid"><section className="admin2-card"><h2>Aktuális szerepkör</h2><div className="admin2-role"><span>{me.email.slice(0,1).toUpperCase()}</span><div><b>{me.email}</b><small>{me.role}</small></div></div><h3>Jogosultságok</h3><div className="permission-cloud">{me.permissions.map(p=><span key={p}>{p}</span>)}</div></section><section className="admin2-card"><h2>Biztonsági rétegek</h2><div className="backend-stack">{['Supabase Auth token validáció','RBAC permission check / endpoint','PostgreSQL RLS','Zod input validation','CSRF védelem server functionökre','Security response headers','Server-only service role key','Audit log minden admin mutációhoz'].map(x=><div key={x}><b>✓</b><span>{x}</span></div>)}</div></section></div>
 {canManage&&<section className="admin2-card admin-users-card"><div className="admin2-card-head"><div><span className="eyebrow">RBAC csapat</span><h2>Admin felhasználók</h2></div><span>{directory.users.length} admin</span></div>{demo?<div className="admin2-empty"><b>Demo módban nincs Auth directory.</b><span>Supabase bekötés után innen hívhatsz meg adminokat és állíthatod a szerepkörüket.</span></div>:<><div className="admin-invite-row"><input type="email" placeholder="admin@ceg.hu" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="Megjelenő név" value={displayName} onChange={e=>setDisplayName(e.target.value)}/><select value={roleId} onChange={e=>setRoleId(e.target.value)}>{directory.roles.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select><button className="btn btn-primary" onClick={async()=>{try{await adminApi('/api/v1/admin/users',{method:'POST',body:jsonBody({email,displayName,roleId})});setEmail('');setDisplayName('');await loadUsers()}catch(e){onMessage((e as Error).message)}}}>Meghívás</button></div><div className="admin-user-list">{directory.users.map(u=><div key={u.user_id}><div className="admin2-role"><span>{String(u.email||'?').slice(0,1).toUpperCase()}</span><div><b>{u.email||u.display_name||u.user_id}</b><small>{u.display_name||'—'} · {u.active?'aktív':'letiltva'}</small></div></div><select value={u.role_id} disabled={u.user_id===me.userId} onChange={async e=>{try{await adminApi(`/api/v1/admin/users/${u.user_id}`,{method:'PATCH',body:jsonBody({roleId:e.target.value})});await loadUsers()}catch(err){onMessage((err as Error).message)}}}>{directory.roles.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select><label className="admin-active-toggle"><input type="checkbox" checked={Boolean(u.active)} disabled={u.user_id===me.userId} onChange={async e=>{try{await adminApi(`/api/v1/admin/users/${u.user_id}`,{method:'PATCH',body:jsonBody({active:e.target.checked})});await loadUsers()}catch(err){onMessage((err as Error).message)}}}/><span>Aktív</span></label></div>)}</div></>}</section>}
 <section className="admin2-card admin2-audit"><div className="admin2-card-head"><h2>Legutóbbi audit események</h2><span>{audit.length}</span></div>{demo?<div className="admin2-empty">Éles backend után minden admin módosítás itt követhető.</div>:audit.map(a=><div className="audit-row" key={a.id}><span>{new Date(a.created_at).toLocaleString('hu-HU')}</span><b>{a.action}</b><span>{a.entity_type}</span><code>{a.entity_id?.slice(0,12)||'—'}</code></div>)}</section></>
}

function EditorSection({title,children}:{title:string;children:React.ReactNode}){return <section className="admin2-editor-section"><h3>{title}</h3><div className="admin2-form-grid">{children}</div></section>}
function Field({label,value,onChange}:{label:string;value:any;onChange:(v:string)=>void}){return <label><span>{label}</span><input value={value??''} onChange={e=>onChange(e.target.value)}/></label>}
function TextArea({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label className="wide"><span>{label}</span><textarea rows={5} value={value??''} onChange={e=>onChange(e.target.value)}/></label>}
function NumberField({label,value,onChange,nullable=false,decimals=false}:{label:string;value:any;onChange:(v:number|null)=>void;nullable?:boolean;decimals?:boolean}){return <label><span>{label}</span><input type="number" step={decimals?'any':'1'} value={value??''} onChange={e=>onChange(e.target.value===''&&nullable?null:Number(e.target.value))}/></label>}
function SelectField({label,value,options,onChange}:{label:string;value:string;options:string[];onChange:(v:string)=>void}){return <label><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(x=><option key={x}>{x}</option>)}</select></label>}
function slugify(v:string){return v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}
function blankFor(fields:Array<{key:string;type?:string}>){return Object.fromEntries(fields.map(f=>[f.key,f.type==='boolean'?true:f.type==='number'?0:f.type==='json'?{}:'']))}
function demoResource(resource:string):JsonRow[]{
 const id=()=>crypto.randomUUID()
 const map:Record<string,JsonRow[]>={
 categories:[{id:id(),name:'Dínók & figurák',slug:'dinok-figurak',description:'Dinoszauruszok és játékfigurák',sort_order:10,active:true},{id:id(),name:'Plüss & kulcstartó',slug:'pluss-kulcstarto',sort_order:20,active:true}],
 brands:[{id:id(),name:'Schleich',slug:'schleich',description:'',logo_url:'',active:true},{id:id(),name:'Hot Wheels',slug:'hot-wheels',description:'',logo_url:'',active:true}],
 content_pages:[{id:id(),slug:'szallitas',title:'Szállítás és fizetés',body:'Adminból szerkeszthető teljes oldal.',published:true},{id:id(),slug:'aszf',title:'ÁSZF',body:'Jogi jóváhagyás után publikálandó.',published:false}],
 navigation_items:[{id:id(),location:'header',label:'Dínók',href:'/termekek?category=Dínók',sort_order:10,active:true}],
 homepage_sections:[{id:id(),section_key:'hero',title:'Hero',sort_order:10,enabled:true,content:{eyebrow:'Friss trendek hetente',title:'Találd meg gyorsan azt, aminek örülni fog.'}}],
 settings:[{id:id(),key:'shop.free_shipping_threshold_huf',group_name:'commerce',description:'Ingyenes szállítási küszöb',public:true,value:15000},{id:id(),key:'features.gift_finder',group_name:'features',description:'Dino Match',public:true,value:true}],
 price_rules:[{id:id(),name:'Alap retail margin',target_margin:.4,fx_buffer:.03,inbound_per_unit_huf:300,active:true}],
 promotions:[{id:id(),name:'Első vásárlás',code:'DINO10',kind:'percentage',value:10,conditions:{minCart:8000},active:false}],
 suppliers:[{id:id(),name:'Dino Toys NL',code:'dinotoys',feed_type:'api',feed_url:'',config:{sync:'incremental'},active:true}],
 integration_accounts:[{id:id(),provider:'stripe',kind:'payment',active:false,config:{currency:'HUF'},secret_names:['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET']},{id:id(),provider:'resend',kind:'email',active:false,config:{},secret_names:['RESEND_API_KEY']}],
 }
 return map[resource]??[]
}
