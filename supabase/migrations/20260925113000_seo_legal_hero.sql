-- SEO/legal configuration and versioned homepage hero snapshots.

insert into public.settings(key,value,group_name,public,description) values
('legal.company_name','"[KITÖLTENDŐ – vállalkozás neve]"'::jsonb,'legal',true,'Webshop üzemeltető / adatkezelő neve'),
('legal.registered_office','"[KITÖLTENDŐ – székhely]"'::jsonb,'legal',true,'Székhely'),
('legal.mailing_address','"[KITÖLTENDŐ – levelezési cím]"'::jsonb,'legal',true,'Levelezési / panaszkezelési cím'),
('legal.tax_number','"[KITÖLTENDŐ – adószám]"'::jsonb,'legal',true,'Adószám'),
('legal.registration_number','"[KITÖLTENDŐ – cégjegyzékszám vagy nyilvántartási szám]"'::jsonb,'legal',true,'Cégjegyzékszám / nyilvántartási szám'),
('legal.email','"[KITÖLTENDŐ – ügyfélszolgálati e-mail]"'::jsonb,'legal',true,'Ügyfélszolgálati e-mail'),
('legal.phone','"[KITÖLTENDŐ – telefonszám]"'::jsonb,'legal',true,'Ügyfélszolgálati telefonszám'),
('legal.hosting_name','"Cloudflare / Supabase – a tényleges production konfiguráció szerint pontosítandó"'::jsonb,'legal',true,'Tárhely/felhő szolgáltató neve'),
('legal.hosting_address','"[KITÖLTENDŐ / szolgáltatói szerződés alapján]"'::jsonb,'legal',true,'Tárhelyszolgáltató címe'),
('legal.hosting_contact','"[KITÖLTENDŐ / szolgáltatói szerződés alapján]"'::jsonb,'legal',true,'Tárhelyszolgáltató elérhetősége'),
('legal.complaint_address','"[KITÖLTENDŐ – panaszkezelési cím]"'::jsonb,'legal',true,'Panaszkezelési cím'),
('legal.last_reviewed','"2026-09-25"'::jsonb,'legal',true,'Jogi dokumentumok utolsó felülvizsgálata'),
('seo.site_name','"DinoToys.hu"'::jsonb,'seo',true,'Webhely neve'),
('seo.default_title','"DinoToys.hu – játékok, ajándékötletek és trendtermékek"'::jsonb,'seo',true,'Alapértelmezett title'),
('seo.default_description','"Modern magyar játékwebshop variánsokkal, ajándékkeresővel, gyors kosárral és átlátható vásárlási információkkal."'::jsonb,'seo',true,'Alapértelmezett meta description'),
('seo.canonical_origin','"https://dinotoys.hu"'::jsonb,'seo',true,'Canonical origin')
on conflict (key) do nothing;

insert into public.content_pages(slug,title,body,seo_title,seo_description,published)
values
('impresszum','Impresszum','','Impresszum | DinoToys.hu','A DinoToys.hu webshop üzemeltetői és kapcsolattartási adatai.',false),
('aszf','Általános Szerződési Feltételek','','ÁSZF | DinoToys.hu','A DinoToys.hu online vásárlás szerződéses feltételei.',false),
('adatkezeles','Adatkezelési tájékoztató','','Adatkezelési tájékoztató | DinoToys.hu','Tájékoztató a DinoToys.hu személyesadat-kezeléseiről és az érintetti jogokról.',false),
('cookie','Cookie tájékoztató','','Cookie tájékoztató | DinoToys.hu','A DinoToys.hu szükséges, analitikai és marketing technológiáinak ismertetése.',false),
('elallas','Elállás és visszaküldés','','Elállás és visszaküldés | DinoToys.hu','Tájékoztató az online vásárlást követő elállási és visszaküldési folyamatról.',false),
('panaszkezeles','Panaszkezelés és jogorvoslat','','Panaszkezelés | DinoToys.hu','A vásárlói panaszok, békéltető testületi és fogyasztóvédelmi lehetőségek tájékoztatója.',false),
('szavatossag','Szavatosság és jótállás','','Szavatosság és jótállás | DinoToys.hu','Tájékoztató kellékszavatossági, termékszavatossági és jótállási ügyekhez.',false)
on conflict (slug) do nothing;

insert into public.homepage_sections(section_key,title,enabled,sort_order,content)
values
('hero_legacy_20260925','Hero – korábbi mentett verzió',false,901,
'{"version":"legacy-20260925","mode":"legacy","eyebrow":"✨ Friss trendek hetente","title":"Nem még egy játékwebshop.","emphasis":"Találd meg gyorsan azt, aminek örülni fog.","description":"Trendi játékok, variánsok, okos ajánlatok és gyors vásárlási élmény — felesleges kattintgatás nélkül.","primaryCta":"Felfedezem a játékokat →","secondaryCta":"✨ Segíts ajándékot választani","trustItems":["✓ Mobilra optimalizált","✓ Biztonságos fizetés","✓ 14 napos elállási jog"],"spotlightProductId":"p-stitch","orbitProductIds":["p-hotwheels","p-kawaii","p-squeeze"],"chips":[{"label":"Kupon","value":"WELCOME10"},{"label":"Variáns","value":"Szín + méret"},{"label":"Értékelés","value":"4.8/5"}],"notes":["🔥 Könnyű CSS 3D","🛍 Upsell + cross-sell","⚡ Responsive + reduced-motion"],"background":"#f3f5f4"}'::jsonb),
('hero_premium_v2','Hero – Premium 3D storefront',false,902,
'{"version":"premium-v2","mode":"cinematic","eyebrow":"🚀 Modern storefront élmény","title":"Prémium játékwebshop","emphasis":"ami minden kijelzőn ütős és gyors.","description":"Lebegő 3D termékkártyák, erős fókusztermék és tiszta kereskedelmi üzenetek — könnyű, GPU-barát animációkkal mobilon, tableten és desktopon.","primaryCta":"Felfedezem a katalógust →","secondaryCta":"✨ Ajándékkereső indítása","trustItems":["✓ Mobile-first élmény","✓ Variánsos kosár és checkout","✓ Kupon, upsell, cross-sell"],"spotlightProductId":"p-stitch","orbitProductIds":["p-hotwheels","p-schleich","p-kawaii","p-squeeze"],"chips":[{"label":"Konverzió","value":"Upsell + popup"},{"label":"Sebesség","value":"Lightweight motion"},{"label":"Kereskedelem","value":"Variáns SKU/ár/készlet"}],"notes":["3D mélység","Responsive minden eszközön","Adminból visszaállítható verziók"],"background":"linear-gradient(135deg,#f7f8ff 0%,#eef4ff 40%,#f7fbf7 100%)"}'::jsonb)
on conflict (section_key) do nothing;

insert into public.homepage_sections(section_key,title,enabled,sort_order,content)
values ('hero','Hero – aktív',true,1,
'{"version":"premium-v2","mode":"cinematic","eyebrow":"🚀 Modern storefront élmény","title":"Prémium játékwebshop","emphasis":"ami minden kijelzőn ütős és gyors.","description":"Lebegő 3D termékkártyák, erős fókusztermék és tiszta kereskedelmi üzenetek — könnyű, GPU-barát animációkkal mobilon, tableten és desktopon.","primaryCta":"Felfedezem a katalógust →","secondaryCta":"✨ Ajándékkereső indítása","trustItems":["✓ Mobile-first élmény","✓ Variánsos kosár és checkout","✓ Kupon, upsell, cross-sell"],"spotlightProductId":"p-stitch","orbitProductIds":["p-hotwheels","p-schleich","p-kawaii","p-squeeze"],"chips":[{"label":"Konverzió","value":"Upsell + popup"},{"label":"Sebesség","value":"Lightweight motion"},{"label":"Kereskedelem","value":"Variáns SKU/ár/készlet"}],"notes":["3D mélység","Responsive minden eszközön","Adminból visszaállítható verziók"],"background":"linear-gradient(135deg,#f7f8ff 0%,#eef4ff 40%,#f7fbf7 100%)"}'::jsonb)
on conflict (section_key) do update set title=excluded.title,enabled=true,content=excluded.content,updated_at=now();
