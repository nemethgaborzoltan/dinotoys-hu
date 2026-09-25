/**
 * Supplier adapter contract. The webshop must not depend directly on the
 * supplier's CSV/XML/API shape. Dino Toys mapping belongs in one adapter.
 */
export type SupplierProduct = {
  supplier: 'dinotoys'
  sourceId: string
  sku: string
  ean?: string
  name: string
  brand?: string
  sourceCategory?: string
  supplierNetPriceEur?: number
  availableUnits?: number
  minimumOrderQty?: number
  innerPackQty?: number
  outerPackQty?: number
  imageUrls: string[]
  manufacturerName?: string
  manufacturerAddress?: string
  manufacturerEmail?: string
  euResponsiblePersonName?: string
  euResponsiblePersonAddress?: string
  euResponsiblePersonEmail?: string
  safetyWarnings: string[]
  ageFrom?: number
  sourceUpdatedAt: string
}

export interface SupplierCatalogAdapter {
  listChangedSince(since?: Date): Promise<SupplierProduct[]>
  getBySourceId(sourceId: string): Promise<SupplierProduct | null>
}

export class DinoToysAdapter implements SupplierCatalogAdapter {
  async listChangedSince(): Promise<SupplierProduct[]> {
    // Intentionally not scraping authenticated prices or stock.
    // Replace with the contractual API/feed/CSV once Dino Toys provides access.
    return []
  }
  async getBySourceId(): Promise<SupplierProduct | null> { return null }
}
