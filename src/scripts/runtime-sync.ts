// ============================================================================
// Runtime Catalog Sync
// ----------------------------------------------------------------------------
// The public storefront is statically generated from src/data/pim/catalog.ts,
// but the admin "Imágenes y Fichas" editor writes to data/pim.json (served by
// /api/pim). This client script reconciles both at runtime so image (and name)
// corrections made in the admin are reflected on the public site without a
// full rebuild. It fails silently when the API is unavailable.
// ============================================================================

const PIM_STORAGE_KEY = 'five_pim_products_v3';

interface RuntimeProduct {
  id: string;
  name?: string;
  price?: number;
  oldPrice?: number;
  image?: string;
  images?: string[];
}

const syncCatalog = async (): Promise<void> => {
  try {
    const res = await fetch('/api/pim', { cache: 'no-store' });
    if (!res.ok) return;

    const json = await res.json();
    const products: RuntimeProduct[] = json?.data?.products;
    if (!Array.isArray(products) || products.length === 0) return;

    try {
      localStorage.setItem(PIM_STORAGE_KEY, JSON.stringify(products));
    } catch {
      // Storage unavailable
    }
    window.dispatchEvent(new CustomEvent('five:pim-updated', { detail: products }));

    const map = new Map(products.map((p) => [p.id, p]));

    // 1. Product cards (PLP, related products, home grids)
    document.querySelectorAll<HTMLElement>('[data-product][data-id]').forEach((card) => {
      const product = map.get(card.dataset.id || '');
      if (!product) return;

      if (product.image) {
        const img = card.querySelector<HTMLImageElement>('.five-product-image-link img, img');
        if (img) img.src = product.image;

        card.querySelectorAll<HTMLElement>(`[data-quickview="${product.id}"], [data-add="${product.id}"]`).forEach((el) => {
          el.dataset.image = product.image;
        });
      }

      if (product.name) {
        const title = card.querySelector<HTMLAnchorElement>('.five-product-title a');
        if (title) title.textContent = product.name;
      }
    });

    // 2. Product detail page (PDP)
    const match = window.location.pathname.match(/^\/producto\/([^/]+)/);
    if (match) {
      const product = map.get(decodeURIComponent(match[1]));
      if (product) {
        const main = document.querySelector<HTMLImageElement>('#pdp-main-image');
        if (main && product.image) main.src = product.image;

        const title = document.querySelector<HTMLElement>('.five-pdp-title');
        if (title && product.name) title.textContent = product.name;
      }
    }
  } catch {
    // Offline or static preview: keep the server-rendered content.
  }
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void syncCatalog());
  } else {
    void syncCatalog();
  }
}
