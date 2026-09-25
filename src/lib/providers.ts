export type Money = { amount: number; currency: 'HUF' | 'EUR' }

export interface PaymentProvider {
  createCheckout(input: { orderId: string; amount: Money; returnUrl: string; customerEmail: string }): Promise<{ providerReference: string; clientSecret?: string; redirectUrl?: string }>
  refund(input: { providerReference: string; amount?: Money; reason?: string }): Promise<{ refundReference: string }>
  verifyWebhook(rawBody: string, signature: string): Promise<{ id: string; type: string; providerReference?: string }>
}

export interface ShippingProvider {
  quote(input: { postalCode: string; countryCode: string; totalWeightGrams: number; cartValue: Money }): Promise<Array<{ serviceId: string; name: string; price: Money; etaDays?: number }>>
  createShipment(input: { orderId: string; serviceId: string; recipient: Record<string, string> }): Promise<{ shipmentId: string; labelUrl?: string; trackingCode?: string }>
}

export interface InvoiceProvider {
  issue(input: { orderId: string; customer: Record<string, string>; lines: Array<{ name: string; quantity: number; grossUnitHuf: number; vatRate: number }> }): Promise<{ invoiceId: string; downloadUrl?: string }>
  cancel(invoiceId: string): Promise<void>
}

export interface EmailProvider {
  send(input: { to: string; template: string; variables: Record<string, string | number | boolean> }): Promise<{ messageId: string }>
}
