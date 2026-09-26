-- Barbie Deluxe Style #7 (JFP42). Safe to re-run; never changes an existing merchant price or stock.
insert into public.categories (name, slug, description)
select 'Babák & kiegészítők', 'babak-kiegeszitok', 'Babák és divatos kiegészítők'
where not exists (select 1 from public.categories where name='Babák & kiegészítők')
on conflict (slug) do nothing;

insert into public.products (
  supplier, supplier_id, sku, ean, name, slug, brand, description, short_description,
  retail_price_huf, stock_on_hand, age_from, manufacturer_name, responsible_person_name,
  responsible_person_address, safety_warning_hu, ce_marked, status, published_at,
  seo_title, seo_description, metadata
) values (
  'dinotoys', 'JFP42', 'JFP42', '0194735303090',
  'Barbie Deluxe Style #7 kék metálfényű divatbaba',
  'barbie-deluxe-style-kek-metalfenyu-divatbaba-jfp42', 'Barbie',
  'A Barbie Deluxe Style #7 ragyogó, jégkék metálfényű felsőben és hozzá illő fodros szoknyában érkezik. Hullámos barna haját magas konty díszíti; geometrikus fülbevaló, csillogó nyaklánc, szív alakú láncöv, kék lencsés napszemüveg, kristályhatású kézitáska és ezüst bokacsizma teszi teljessé a megjelenést. A mozgatható ízületek változatos pózokat és divatos történeteket inspirálnak. A doboz egy babát és divatkiegészítőket tartalmaz; a baba önmagában nem áll meg.',
  'Jégkék metálfényű Barbie Deluxe Style baba divatkiegészítőkkel, 4 éves kortól.',
  10790, 0, 4, 'Mattel', 'Mattel Europa B.V.',
  'Gondel 1, 1186 MJ Amstelveen, Hollandia',
  'Figyelem! 3 éves kor alatt nem alkalmas. Apró alkatrészek miatt fulladásveszély. A színek és díszítések eltérhetnek.',
  false, 'active', now(),
  'Barbie Deluxe Style #7 kék metálfényű divatbaba | DinoToys.hu',
  'Barbie Deluxe Style #7 kék metálfényű baba divatos kiegészítőkkel. Nézd meg a képeket és a részleteket a DinoToys kínálatában.',
  jsonb_build_object(
    'category', 'Babák & kiegészítők', 'accent', '#a38ce9', 'newArrival', true,
    'tags', jsonb_build_array('barbie','deluxe style','jfp42','divatbaba','kék','metálfényű','mattel','luxus stílusú pop','metálfényezéss'),
    'highlights', jsonb_build_array('Jégkék, metálfényű felső és hozzá illő fodros szoknya','Mozgatható ízületek a változatos pózokhoz','Napszemüveg, kézitáska, ékszerek és bokacsizma','Barbie Deluxe Style #7 divatbaba','Kreatív szerepjátékhoz 4 éves kortól'),
    'experience', jsonb_build_object(
      'primary','#a169dc','secondary','#83c9ef','accent','#ff78bc','dark','#2c2152','surface','#f9f2ff',
      'eyebrow','BARBIE · DELUXE STYLE #7','headline','A stílusod ragyogjon.',
      'subheadline','Metálfényű kék szett, ragyogó részletek és végtelen divatos történet.',
      'storyEyebrow','RAGYOGÓ RÉSZLETEK','storyHeadline','Egy szett. Megannyi történet.',
      'storyText','A jégkék csillogás, a fodros szoknya és az apró kiegészítők új jeleneteket adnak minden játékhoz. Válassz pózt, készítsd elő a kifutót, és indulhat a következő Barbie történet.',
      'storyImage','/products/barbie-jfp42/3.jpg',
      'pills',jsonb_build_array('Metálfényű szett','Mozgatható baba','4 éves kortól'),
      'motif','glow'
    )
  )
)
on conflict (sku) do nothing;

insert into public.product_categories (product_id, category_id)
select p.id, c.id from public.products p cross join public.categories c
where p.sku='JFP42' and c.name='Babák & kiegészítők'
on conflict do nothing;

insert into public.product_images (product_id, url, alt_text, sort_order)
select p.id, image.url, image.alt_text, image.sort_order
from public.products p
cross join (values
  ('/products/barbie-jfp42/1.jpg','Barbie Deluxe Style #7 kék metálfényű baba, szemből',0),
  ('/products/barbie-jfp42/2.jpg','Barbie Deluxe Style #7 baba oldalnézetben',1),
  ('/products/barbie-jfp42/3.jpg','Barbie Deluxe Style #7 baba arc és ruha részlet',2)
) as image(url,alt_text,sort_order)
where p.sku='JFP42' and not exists (
  select 1 from public.product_images existing where existing.product_id=p.id and existing.url=image.url
);

insert into public.product_relations (product_id, related_product_id, relation_type, sort_order)
select p.id, r.id, 'cross_sell', 1 from public.products p cross join public.products r
where p.sku='JFP42' and r.sku='JFX99'
on conflict do nothing;
