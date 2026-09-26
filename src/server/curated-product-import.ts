import { products } from '../data/products'
import { writeAudit } from './audit'
import type { AdminPrincipal } from './auth'
import { ApiError } from './http'
import { getSupabaseAdmin } from './supabase'

const product = products.find(item => item.sourceSku === 'JFP42')!

/** Explicit admin action: imports the curated catalog entry into the editable live catalog. */
export async function importBarbieJfp42(actor: AdminPrincipal) {
  const db = getSupabaseAdmin()
  const { data: existing, error: lookupError } = await db.from('products').select('id,status,metadata').eq('sku', product.sourceSku).maybeSingle()
  if (lookupError) throw new ApiError(500, 'A termék ellenőrzése sikertelen.', 'PRODUCT_LOOKUP_FAILED', lookupError.message)
  if (existing?.status === 'active') return { id: existing.id, alreadyExists: true }
  if (existing && existing.metadata?.import_source !== 'curated:JFP42') {
    throw new ApiError(409, 'Ez az SKU már egy másik admin termékhez tartozik.', 'SKU_EXISTS')
  }

  let productId = existing?.id as string | undefined
  if (!productId) {
    const { data, error } = await db.from('products').insert({
      supplier: 'dinotoys', supplier_id: product.sourceSku, sku: product.sourceSku, ean: product.ean,
      name: product.name, slug: product.slug, brand: product.brand,
      description: product.description, short_description: product.description.slice(0, 155),
      retail_price_huf: product.retailPrice, stock_on_hand: 0, age_from: product.ageFrom,
      manufacturer_name: product.compliance.manufacturer,
      responsible_person_name: 'Mattel Europa B.V.',
      responsible_person_address: 'Gondel 1, 1186 MJ Amstelveen, Hollandia',
      safety_warning_hu: product.compliance.warning, ce_marked: false, status: 'draft',
      seo_title: `${product.name} | DinoToys.hu`, seo_description: product.description.slice(0, 155),
      metadata: { import_source: 'curated:JFP42', category: product.category, tags: product.tags,
        highlights: product.highlights, accent: product.accent, newArrival: product.newArrival, experience: product.experience },
    }).select('id').single()
    if (error || !data) throw new ApiError(400, 'A Barbie termék létrehozása sikertelen.', 'PRODUCT_IMPORT_FAILED', error?.message)
    productId = data.id
  }

  const { data: category, error: categoryError } = await db.from('categories').select('id').eq('name', product.category).limit(1).maybeSingle()
  if (categoryError) throw new ApiError(500, 'Kategória ellenőrzése sikertelen.', 'CATEGORY_LOOKUP_FAILED', categoryError.message)
  let categoryId = category?.id as string | undefined
  if (!categoryId) {
    const { data, error } = await db.from('categories').insert({ name: product.category, slug: 'babak-kiegeszitok' }).select('id').single()
    if (error || !data) throw new ApiError(400, 'Kategória létrehozása sikertelen.', 'CATEGORY_CREATE_FAILED', error?.message)
    categoryId = data.id
  }
  const { error: linkError } = await db.from('product_categories').upsert({ product_id: productId, category_id: categoryId }, { onConflict: 'product_id,category_id' })
  if (linkError) throw new ApiError(400, 'Kategória hozzárendelése sikertelen.', 'CATEGORY_LINK_FAILED', linkError.message)

  const { data: currentImages, error: imageLookupError } = await db.from('product_images').select('url').eq('product_id', productId)
  if (imageLookupError) throw new ApiError(500, 'Képek ellenőrzése sikertelen.', 'IMAGE_LOOKUP_FAILED', imageLookupError.message)
  const known = new Set((currentImages ?? []).map(image => image.url))
  const missingImages = (product.images ?? [product.art]).filter(url => !known.has(url)).map((url, index) => ({
    product_id: productId, url, alt_text: `${product.name} – ${index + 1}. kép`, sort_order: index,
  }))
  if (missingImages.length) {
    const { error } = await db.from('product_images').insert(missingImages)
    if (error) throw new ApiError(400, 'Termékképek hozzáadása sikertelen.', 'IMAGE_IMPORT_FAILED', error.message)
  }

  const { data: related } = await db.from('products').select('id').eq('sku', 'JFX99').maybeSingle()
  if (related) await db.from('product_relations').upsert({ product_id: productId, related_product_id: related.id, relation_type: 'cross_sell', sort_order: 1 }, { onConflict: 'product_id,related_product_id,relation_type' })

  const { error: publishError } = await db.from('products').update({ status: 'active', published_at: new Date().toISOString() }).eq('id', productId)
  if (publishError) throw new ApiError(400, 'Termék publikálása sikertelen.', 'PRODUCT_PUBLISH_FAILED', publishError.message)
  await writeAudit({ actorUserId: actor.userId, action: 'product.curated_import', entityType: 'products', entityId: productId, after: { sku: product.sourceSku, stock_on_hand: 0 } })
  return { id: productId, alreadyExists: false }
}
