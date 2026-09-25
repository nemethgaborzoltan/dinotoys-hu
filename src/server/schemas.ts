import { z } from 'zod'

export const productInputSchema = z.object({
  sku: z.string().min(1).max(120),
  ean: z.string().max(64).nullish(),
  name: z.string().min(2).max(240),
  slug: z.string().min(2).max(240).regex(/^[a-z0-9-]+$/),
  brand: z.string().max(160).nullish(),
  description: z.string().max(20000).nullish(),
  short_description: z.string().max(1000).nullish(),
  retail_price_huf: z.number().int().min(0),
  compare_at_price_huf: z.number().int().min(0).nullish(),
  cost_net_eur: z.number().min(0).nullish(),
  vat_rate: z.number().min(0).max(1).default(0.27),
  stock_on_hand: z.number().int().min(0).default(0),
  safety_stock: z.number().int().min(0).default(0),
  age_from: z.number().int().min(0).max(99).nullish(),
  weight_grams: z.number().int().min(0).nullish(),
  status: z.enum(['draft','review','active','archived','recalled']).default('draft'),
  manufacturer_name: z.string().max(240).nullish(),
  manufacturer_address: z.string().max(600).nullish(),
  manufacturer_email: z.string().email().nullish(),
  responsible_person_name: z.string().max(240).nullish(),
  responsible_person_address: z.string().max(600).nullish(),
  responsible_person_email: z.string().email().nullish(),
  safety_warning_hu: z.string().max(4000).nullish(),
  ce_marked: z.boolean().nullish(),
  seo_title: z.string().max(240).nullish(),
  seo_description: z.string().max(500).nullish(),
  variant_options: z.array(z.object({
    name:z.string().min(1).max(80),
    label:z.string().min(1).max(120),
    display:z.enum(['button','swatch']).default('button'),
    values:z.array(z.object({value:z.string().min(1).max(120),label:z.string().min(1).max(120),swatch:z.string().max(40).nullish()})).min(1).max(100),
  })).max(8).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
})
export const productPatchSchema = productInputSchema.partial()

export const variantSchema=z.object({
  id:z.string().uuid().optional(),
  sku:z.string().min(1).max(120),
  ean:z.string().max(64).nullish(),
  retail_price_huf:z.number().int().min(0),
  compare_at_price_huf:z.number().int().min(0).nullish(),
  cost_net_eur:z.number().min(0).nullish(),
  stock_on_hand:z.number().int().min(0).default(0),
  safety_stock:z.number().int().min(0).default(0),
  weight_grams:z.number().int().min(0).nullish(),
  image_url:z.string().url().nullish(),
  attributes:z.record(z.string(),z.string()).default({}),
  metadata:z.record(z.string(),z.unknown()).default({}),
  active:z.boolean().default(true),
  sort_order:z.number().int().default(0),
})
export const variantConfigSchema=z.object({
  options:productInputSchema.shape.variant_options,
  variants:z.array(variantSchema).max(500).default([]),
  upsellIds:z.array(z.string().uuid()).max(50).default([]),
  crossSellIds:z.array(z.string().uuid()).max(50).default([]),
})

export const categorySchema = z.object({
  parent_id: z.string().uuid().nullish(), name: z.string().min(1).max(160), slug: z.string().min(1).max(180),
  description: z.string().max(5000).nullish(), seo_title: z.string().max(240).nullish(), seo_description: z.string().max(500).nullish(),
  sort_order: z.number().int().default(0), active: z.boolean().default(true),
})
export const brandSchema = z.object({ name:z.string().min(1).max(160), slug:z.string().min(1).max(180), description:z.string().max(5000).nullish(), logo_url:z.string().url().nullish(), active:z.boolean().default(true) })
export const contentPageSchema = z.object({ slug:z.string().min(1).max(180), title:z.string().min(1).max(240), body:z.string().max(100000).default(''), seo_title:z.string().max(240).nullish(), seo_description:z.string().max(500).nullish(), published:z.boolean().default(false) })
export const navigationSchema = z.object({ location:z.string().min(1).max(80), label:z.string().min(1).max(120), href:z.string().min(1).max(500), sort_order:z.number().int().default(0), active:z.boolean().default(true), parent_id:z.string().uuid().nullish() })
export const homepageSectionSchema = z.object({ section_key:z.string().min(1).max(120), title:z.string().max(240).nullish(), enabled:z.boolean().default(true), sort_order:z.number().int().default(0), content:z.record(z.string(),z.unknown()).default({}) })
export const settingSchema = z.object({ key:z.string().min(1).max(180), value:z.unknown(), group_name:z.string().min(1).max(80).default('general'), public:z.boolean().default(false), description:z.string().max(500).nullish() })
export const priceRuleSchema = z.object({ name:z.string().min(1).max(160), target_margin:z.number().min(0).max(.89), fx_buffer:z.number().min(0).max(1).default(0), inbound_per_unit_huf:z.number().int().min(0).default(0), active:z.boolean().default(true) })
export const promotionSchema = z.object({
  name:z.string().min(1).max(180),code:z.string().max(80).nullish(),kind:z.enum(['percentage','fixed','free_shipping','bundle']),
  value:z.number().min(0).default(0),starts_at:z.string().datetime().nullish(),ends_at:z.string().datetime().nullish(),active:z.boolean().default(true),
  conditions:z.record(z.string(),z.unknown()).default({}),usage_limit:z.number().int().min(1).nullish(),per_customer_limit:z.number().int().min(1).nullish(),
  max_discount_huf:z.number().int().min(0).nullish(),combinable:z.boolean().default(false),priority:z.number().int().default(0),description:z.string().max(1000).nullish(),
})
export const marketingPopupSchema=z.object({
  name:z.string().min(1).max(180),title:z.string().min(1).max(240),body:z.string().max(3000).nullish(),eyebrow:z.string().max(120).nullish(),
  coupon_code:z.string().max(80).nullish(),cta_label:z.string().min(1).max(120).default('Ajánlat aktiválása'),cta_href:z.string().min(1).max(500).default('/termekek'),
  trigger_type:z.enum(['delay','exit_intent','cart_value']).default('delay'),delay_seconds:z.number().int().min(0).max(120).default(4),min_cart_huf:z.number().int().min(0).nullish(),
  page_scope:z.enum(['all','home','catalog','product','cart']).default('all'),frequency:z.enum(['always','session','day','once']).default('session'),
  starts_at:z.string().datetime().nullish(),ends_at:z.string().datetime().nullish(),active:z.boolean().default(true),content:z.record(z.string(),z.unknown()).default({}),sort_order:z.number().int().default(0),
})
export const supplierSchema = z.object({ name:z.string().min(1).max(180), code:z.string().min(1).max(80), active:z.boolean().default(true), feed_type:z.enum(['api','xml','csv','manual']).default('manual'), feed_url:z.string().url().nullish(), config:z.record(z.string(),z.unknown()).default({}) })
export const integrationSchema = z.object({ provider:z.string().min(1).max(100), kind:z.string().min(1).max(80), active:z.boolean().default(false), config:z.record(z.string(),z.unknown()).default({}), secret_names:z.array(z.string()).default([]) })
