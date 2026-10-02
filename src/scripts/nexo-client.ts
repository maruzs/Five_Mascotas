export interface NexoCheckout {
  kind: 'ORDER' | 'QUOTATION';
  shippingRateId: string;
  customer: { name: string; rut?: string; email: string; phone: string; city: string; address: string };
  notes?: string;
  items: { id: string; quantity: number }[];
}
export interface NexoResult {
  kind: 'ORDER' | 'QUOTATION'; id: string; number: string; totalProducts: string; shippingFee: number; totalDue: string;
  paymentStatus: 'PENDING'; validUntil?: string;
  bankDetails?: Record<string, string>;
  paymentQr?: string;
}
export async function submitToNexo(body: NexoCheckout, key: string): Promise<NexoResult> {
  const response = await fetch('/api/nexo/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'No se pudo enviar a Nexo.');
  return result;
}
