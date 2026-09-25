import type { Product, AnnouncementTicker, PromoBanner, HeroSlide, CmsState } from '../data/pim/types';
import { products as defaultProducts } from '../data/pim/catalog';
import { announcementTickers as defaultTickers, promoBanners as defaultBanners, defaultHeroSlides } from '../data/pim/navigation';
import { defaultShippingRates, type ShippingCityRate } from '../data/pim/shipping';
import { defaultBankAccount, type BankAccountConfig, BANK_STORAGE_KEY } from '../data/pim/bank';

export const PIM_STORAGE_KEY = 'five_pim_products_v3';
export const CMS_STORAGE_KEY = 'five_cms_state_v2';
export const SHIPPING_STORAGE_KEY = 'five_shipping_rates_v1';
export const ORDERS_STORAGE_KEY = 'five_orders_v1';

export class AdminStoreService {
  private static cmsState: CmsState = {
    tickers: [...defaultTickers],
    banners: [...defaultBanners],
    heroSlides: [...defaultHeroSlides],
  };

  private static initialized = false;

  // Initialize and sync with server
  public static async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    // Load local cache first for instant rendering
    if (typeof localStorage !== 'undefined') {
      try {
        const cachedCms = localStorage.getItem(CMS_STORAGE_KEY);
        if (cachedCms) {
          const parsed = JSON.parse(cachedCms);
          if (parsed && Array.isArray(parsed.tickers)) {
            this.cmsState = {
              tickers: parsed.tickers.length ? parsed.tickers : [...defaultTickers],
              banners: parsed.banners?.length ? parsed.banners : [...defaultBanners],
              heroSlides: parsed.heroSlides?.length ? parsed.heroSlides : [...defaultHeroSlides],
            };
          }
        }
      } catch {
        // Fallback
      }
    }

    // Attempt server fetch in background (Multi-Device Sync)
    await this.fetchCmsFromServer();
  }

  // ================= SERVER SYNC (CMS) =================
  public static async fetchCmsFromServer(): Promise<CmsState> {
    try {
      const res = await fetch('/api/cms', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          const remote = json.data;
          this.cmsState = {
            tickers: Array.isArray(remote.tickers) && remote.tickers.length ? remote.tickers : [...defaultTickers],
            banners: Array.isArray(remote.banners) && remote.banners.length ? remote.banners : [...defaultBanners],
            heroSlides: Array.isArray(remote.heroSlides) && remote.heroSlides.length ? remote.heroSlides : [...defaultHeroSlides],
          };
          this.saveLocalCms(this.cmsState, false);
          return this.cmsState;
        }
      }
    } catch {
      // Offline or static fallback
    }
    return this.cmsState;
  }

  private static async syncCmsToServer(): Promise<void> {
    try {
      await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.cmsState),
      });
    } catch (err) {
      console.warn('[AdminStore] Server sync offline, saved to local cache:', err);
    }
  }

  private static saveLocalCms(state: CmsState, triggerServerSync = true): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignored
      }
      window.dispatchEvent(new CustomEvent('five:cms-updated', { detail: state }));
    }
    if (triggerServerSync) {
      this.syncCmsToServer();
    }
  }

  // ================= TICKERS =================
  public static getTickers(): AnnouncementTicker[] {
    this.init();
    return [...this.cmsState.tickers];
  }

  public static getTicker(): AnnouncementTicker {
    const list = this.getTickers();
    return list.find((t) => t.active) || list[0] || defaultTickers[0];
  }

  public static saveTicker(ticker: AnnouncementTicker): void {
    this.init();
    const list = [...this.cmsState.tickers];
    const idx = list.findIndex((t) => t.id === ticker.id);
    if (idx >= 0) {
      list[idx] = ticker;
    } else {
      list.push(ticker);
    }
    this.cmsState.tickers = list;
    this.saveLocalCms(this.cmsState, true);
  }

  public static deleteTicker(id: string): void {
    this.init();
    this.cmsState.tickers = this.cmsState.tickers.filter((t) => t.id !== id);
    if (this.cmsState.tickers.length === 0) {
      this.cmsState.tickers = [...defaultTickers];
    }
    this.saveLocalCms(this.cmsState, true);
  }

  // ================= BANNERS =================
  public static getBanners(): PromoBanner[] {
    this.init();
    return [...this.cmsState.banners];
  }

  public static saveBanner(banner: PromoBanner): void {
    this.init();
    const list = [...this.cmsState.banners];
    const idx = list.findIndex((b) => b.id === banner.id);
    if (idx >= 0) {
      list[idx] = banner;
    } else {
      list.push(banner);
    }
    this.cmsState.banners = list;
    this.saveLocalCms(this.cmsState, true);
  }

  public static deleteBanner(id: string): void {
    this.init();
    this.cmsState.banners = this.cmsState.banners.filter((b) => b.id !== id);
    if (this.cmsState.banners.length === 0) {
      this.cmsState.banners = [...defaultBanners];
    }
    this.saveLocalCms(this.cmsState, true);
  }

  // ================= HERO SLIDES =================
  public static getHeroSlides(): HeroSlide[] {
    this.init();
    return [...this.cmsState.heroSlides];
  }

  public static saveHeroSlide(slide: HeroSlide): void {
    this.init();
    const list = [...this.cmsState.heroSlides];
    const idx = list.findIndex((s) => s.id === slide.id);
    if (idx >= 0) {
      list[idx] = slide;
    } else {
      list.push(slide);
    }
    this.cmsState.heroSlides = list;
    this.saveLocalCms(this.cmsState, true);
  }

  public static deleteHeroSlide(id: string): void {
    this.init();
    this.cmsState.heroSlides = this.cmsState.heroSlides.filter((s) => s.id !== id);
    if (this.cmsState.heroSlides.length === 0) {
      this.cmsState.heroSlides = [...defaultHeroSlides];
    }
    this.saveLocalCms(this.cmsState, true);
  }

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

  public static async fetchPimFromServer(): Promise<Product[]> {
    try {
      const res = await fetch('/api/pim', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data?.products)) {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(PIM_STORAGE_KEY, JSON.stringify(json.data.products));
            window.dispatchEvent(new CustomEvent('five:pim-updated', { detail: json.data.products }));
          }
          return json.data.products;
        }
      }
    } catch {
      // Fallback
    }
    return this.getProducts();
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
    this.syncPimToServer(list);
  }

  public static deleteProduct(id: string): void {
    const list = this.getProducts().filter((p) => p.id !== id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PIM_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('five:pim-updated', { detail: list }));
    }
    this.syncPimToServer(list);
  }

  public static resetProducts(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(PIM_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('five:pim-updated', { detail: defaultProducts }));
    }
    this.syncPimToServer(defaultProducts);
  }

  private static async syncPimToServer(products: Product[]): Promise<void> {
    try {
      await fetch('/api/pim', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });
    } catch (err) {
      console.warn('[AdminStore] PIM server sync offline:', err);
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

  // ================= SHIPPING RATES (TARIFA PLANA CIUDADES) =================
  public static getShippingRates(): ShippingCityRate[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(SHIPPING_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [...defaultShippingRates];
  }

  public static saveShippingRate(rate: ShippingCityRate): void {
    const list = this.getShippingRates();
    const idx = list.findIndex((r) => r.id === rate.id || r.city.toLowerCase() === rate.city.toLowerCase());
    if (idx >= 0) {
      list[idx] = rate;
    } else {
      list.push(rate);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('five:shipping-updated', { detail: list }));
    }
  }

  public static deleteShippingRate(id: string): void {
    const list = this.getShippingRates().filter((r) => r.id !== id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('five:shipping-updated', { detail: list }));
    }
  }

  public static resetShippingRates(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SHIPPING_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('five:shipping-updated', { detail: defaultShippingRates }));
    }
  }

  // ================= BANK ACCOUNT CONFIG (QR & TRANSFERENCIAS) =================
  public static getBankAccount(): BankAccountConfig {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(BANK_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return { ...defaultBankAccount };
  }

  public static saveBankAccount(config: BankAccountConfig): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('five:bank-updated', { detail: config }));
    }
  }

  // ================= ORDERS SYSTEM (SEGUIMIENTO Y RASTREO) =================
  public static getOrders(): any[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [];
  }

  public static saveOrder(order: any): void {
    const list = this.getOrders();
    const idx = list.findIndex((o) => o.code === order.code);
    if (idx >= 0) {
      list[idx] = order;
    } else {
      list.unshift(order);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('five:orders-updated', { detail: list }));
    }
  }

  public static getOrderByCode(code: string): any | null {
    const clean = code.trim().toUpperCase();
    const list = this.getOrders();
    return list.find((o) => o.code.toUpperCase() === clean || o.phone?.includes(clean)) || null;
  }
}
