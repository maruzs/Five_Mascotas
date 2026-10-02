// Only imported by the Node server. Integration credentials never enter Astro/browser bundles.
export const nexoEnabled = () => Boolean(process.env.NEXO_API_URL && process.env.NEXO_STORE && process.env.NEXO_INTEGRATION_TOKEN);
export const nexoConfigured = () => Boolean(process.env.NEXO_API_URL || process.env.NEXO_STORE || process.env.NEXO_INTEGRATION_TOKEN);

export async function nexoRequest(resource, { method = 'GET', body, key } = {}) {
  const base = new URL(process.env.NEXO_API_URL);
  if (base.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && ['localhost','127.0.0.1'].includes(base.hostname))) throw new Error('Nexo requiere HTTPS');
  const response = await fetch(`${base.href.replace(/\/$/,'')}/${resource}`, {
    method, redirect: 'error', signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', 'X-Nexo-Integration-Token': process.env.NEXO_INTEGRATION_TOKEN, ...(key ? { 'Idempotency-Key': key } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = new Error(response.status === 409 ? 'El pedido cambió o no hay stock suficiente. Revisa el carrito.' : 'Nexo no pudo completar la operación. Intenta nuevamente.');
    error.status = response.status >= 400 && response.status < 500 ? response.status : 503;
    throw error;
  }
  return response;
}

export function mapCatalog(catalog) {
  const mapped = catalog.products.flatMap(p => p.variants.map(v => {
    const a = p.customAttributes || {};
    return { id: typeof a.web_id === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(a.web_id) && p.variants.length === 1 ? a.web_id : v.id, nexoVariantId: v.id, sku: v.sku, available: v.available,
      name: p.name, detail: p.description || '', category: p.category, brand: p.brand, subcategory: String(a.subcategory || ''),
      pet: String(a.pet_type || 'Perros Gatos'), lifeStage: String(a.life_stage || 'Todas las edades'), breedSize: String(a.breed_size || ''),
      format: v.weightKg ? `${v.weightKg} kg` : v.unitOfMeasure, price: Number(v.priceGross), oldPrice: 0, color: 'peach',
      image: a.gallery_images?.[0] || '/images/product-placeholder.svg', images: a.gallery_images || [],
      proteinPct: a.protein_percentage, fatPct: a.fat_percentage, fiberPct: a.fiber_percentage, moisturePct: a.moisture_percentage, ingredients: a.ingredients,
    };
  }));
  const occurrences = new Map();
  for (const p of mapped) occurrences.set(p.id, (occurrences.get(p.id) || 0) + 1);
  return mapped.map(p => occurrences.get(p.id) > 1 ? { ...p, id:p.nexoVariantId } : p);
}

export async function nexoCatalogData() {
  let page = 1, all = [], count, shippingRates = {};
  do {
    const data = await (await nexoRequest(`public/catalog?store=${encodeURIComponent(process.env.NEXO_STORE)}&page=${page}&limit=100`)).json();
    count = data.count;
    if (page === 1) shippingRates = data.shippingRates || {};
    all.push(...data.products);
    if (!data.products.length) break;
    page++;
  } while (all.length < count && page <= 100);
  if (all.length < count) throw new Error('Catálogo incompleto.');
  return { products: mapCatalog({ products: all }), shippingRates, source: 'nexo' };
}

export async function nexoCatalog() { return (await nexoCatalogData()).products; }

export async function nexoCheckout(input, key) {
  const catalog = await nexoCatalog();
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > 100) throw Object.assign(new Error('Carrito inválido'), { status: 400 });
  const items = input.items.map(i => {
    const product = catalog.find(p => p.id === i.id);
    if (!product || !Number.isSafeInteger(i.quantity) || i.quantity < 1) throw Object.assign(new Error('Producto o cantidad inválidos'), { status: 400 });
    return { variantId: product.nexoVariantId, quantity: i.quantity };
  });
  // All prices, tenant/location IDs, payment state and discounts from the browser are discarded.
  return (await nexoRequest(`integrations/storefront/${encodeURIComponent(process.env.NEXO_STORE)}/checkout`, {
    method: 'POST', key, body: { kind: input.kind, customer: input.customer, notes: input.notes, shippingRateId: input.shippingRateId, items },
  })).json();
}
