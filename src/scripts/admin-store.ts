import type { Product, AnnouncementTicker, PromoBanner } from '../data/pim/types';
import { products as defaultProducts } from '../data/pim/catalog';
import { announcementTicker as defaultTicker, promoBanners as defaultBanners } from '../data/pim/navigation';

export const PIM_STORAGE_KEY = 'five_pim_products_v1';
export const CMS_TICKER_KEY = 'five_cms_ticker_v1';
export const CMS_BANNERS_KEY = 'five_cms_banners_v1';

export class AdminStoreService {
  // ================= PRODUCTS PIM =================
  public static getProducts(): Product[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(PIM_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [...defaultProducts];
  }

  public static saveProduct(product: Product): void {
    const list = this.getProducts();
    const idx = list.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      list[idx] = product;
    } else {
      list.unshift(product);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PIM_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('five:pim-updated', { detail: list }));
    }
  }

  public static deleteProduct(id: string): void {
    const list = this.getProducts().filter((p) => p.id !== id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PIM_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('five:pim-updated', { detail: list }));
    }
  }

  public static resetProducts(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(PIM_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('five:pim-updated', { detail: defaultProducts }));
    }
  }

  public static exportJSON(): void {
    const data = JSON.stringify(this.getProducts(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `five-mascotas-catalogo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ================= CMS BANNERS =================
  public static getTicker(): AnnouncementTicker {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(CMS_TICKER_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return { ...defaultTicker };
  }

  public static saveTicker(ticker: AnnouncementTicker): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CMS_TICKER_KEY, JSON.stringify(ticker));
      window.dispatchEvent(new CustomEvent('five:cms-updated', { detail: ticker }));
    }
  }

  public static getBanners(): PromoBanner[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(CMS_BANNERS_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [...defaultBanners];
  }

  public static saveBanner(banner: PromoBanner): void {
    const list = this.getBanners();
    const idx = list.findIndex((b) => b.id === banner.id);
    if (idx >= 0) {
      list[idx] = banner;
    } else {
      list.push(banner);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CMS_BANNERS_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('five:cms-updated', { detail: list }));
    }
  }
}
