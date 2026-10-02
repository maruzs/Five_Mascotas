// Global Storefront Client Script: Cart, Predictive Search, Drawers, and Interactive Filters
import { products, formatMoney } from '../data/pim/catalog';
import { defaultShippingRates, type ShippingCityRate } from '../data/pim/shipping';
import { AdminStoreService } from './admin-store';
import { formatBankTransferPayload, type BankAccountConfig } from '../data/pim/bank';
import { submitToNexo } from './nexo-client';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

const CART_STORAGE_KEY = 'five_cart_v2';

class StoreManager {
  private cart: Map<string, CartItem> = new Map();
  private nexoState: 'loading' | 'enabled' | 'disabled' | 'error' = 'loading';
  private nexoProducts = new Map<string, { name: string; price: number; image: string; available: number }>();
  private nexoShipping: ShippingCityRate[] | null = null;

  constructor() {
    this.initShippingSync();
    this.initCart();
    this.initSearch();
    this.initDrawer();
    this.initPLP();
    this.initQuickView();
    this.initCheckout();
    void this.initNexo();
  }

  private async initNexo() {
    try {
      const status = await fetch('/api/nexo/status', { cache: 'no-store' });
      if (!status.ok) throw new Error('No se pudo verificar la conexión de la tienda.');
      const { enabled } = await status.json();
      if (!enabled) { this.nexoState = 'disabled'; return; }
      const response = await fetch('/api/pim', { cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudo actualizar el catálogo.');
      const { data } = await response.json();
      this.nexoShipping = Object.entries(data.shippingRates || {}).map(([id, price], index) => ({
        ...(defaultShippingRates.find(rate => rate.id === id) || { city: id, region: '' }),
        id, price: Number(price), isDefault: index === 0,
      }));
      this.populateShippingDropdowns();
      for (const p of data.products) this.nexoProducts.set(p.id, p);
      this.nexoState = 'enabled';
      document.querySelector<HTMLElement>('#chk-quotation-option')?.removeAttribute('hidden');
      const email = document.querySelector<HTMLInputElement>('#chk-email');
      if (email) email.required = true;
      for (const button of document.querySelectorAll<HTMLButtonElement>('[data-add]')) {
        const p = this.nexoProducts.get(button.dataset.add || '');
        button.disabled = !p || p.available < 1;
        if (p) { button.dataset.price = String(p.price); button.dataset.name = p.name; button.dataset.image = p.image; }
      }
      for (const card of document.querySelectorAll<HTMLElement>('[data-product]')) {
        const p = this.nexoProducts.get(card.dataset.id || '');
        const stock = card.querySelector('.five-stock-badge');
        if (stock) stock.textContent = p ? `${p.available} Unid.` : 'No disponible';
        if (p) {
          card.dataset.price = String(p.price);
          const price = card.querySelector('.five-price-hero, .five-current-price');
          if (price) price.textContent = formatMoney(p.price);
        }
      }
      for (const item of this.cart.values()) {
        const p = this.nexoProducts.get(item.id);
        if (p) { item.price = p.price; item.name = p.name; }
      }
      this.saveCart(); this.renderCartUI();
    } catch {
      this.nexoState = 'error';
      const status = document.querySelector('#five-status');
      if (status) status.textContent = 'No se pudo verificar el catálogo. Recarga antes de comprar.';
    }
  }

  // ===================== SHIPPING RATES SYNCHRONIZATION =====================
  public getShippingRates(): ShippingCityRate[] {
    if (this.nexoShipping !== null) return this.nexoShipping;
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('five_shipping_rates_v1');
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [...defaultShippingRates];
  }

  private initShippingSync() {
    this.populateShippingDropdowns();

    // Listen for cross-component or admin events
    if (typeof window !== 'undefined') {
      window.addEventListener('five:shipping-updated', () => {
        this.populateShippingDropdowns();
        this.renderCartUI();
      });
    }
  }

  private populateShippingDropdowns() {
    const rates = this.getShippingRates();

    // 1. Cart selector
    const cartSelect = document.querySelector<HTMLSelectElement>('#cart-city-select');
    if (cartSelect) {
      const prevVal = cartSelect.value;
      cartSelect.innerHTML = '';
      rates.forEach((r) => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.selected = prevVal ? r.id === prevVal : !!r.isDefault;
        opt.dataset.price = String(r.price);
        opt.dataset.note = r.deliveryNote || '';
        opt.textContent = `${r.city} — ${formatMoney(r.price)}`;
        cartSelect.appendChild(opt);
      });
      const selected = cartSelect.selectedOptions[0];
      const noteEl = document.querySelector('#cart-city-note');
      if (selected && noteEl && selected.dataset.note) {
        noteEl.textContent = selected.dataset.note;
      }
    }

    // 2. PDP selector
    const pdpSelect = document.querySelector<HTMLSelectElement>('#pdp-city-select');
    if (pdpSelect) {
      const prevVal = pdpSelect.value;
      pdpSelect.innerHTML = '';
      rates.forEach((r) => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.selected = prevVal ? r.id === prevVal : !!r.isDefault;
        opt.dataset.price = String(r.price);
        opt.dataset.note = r.deliveryNote || '';
        opt.textContent = `${r.city} — ${formatMoney(r.price)}`;
        pdpSelect.appendChild(opt);
      });
      const selected = pdpSelect.selectedOptions[0];
      const noteEl = document.querySelector('#pdp-ship-note-text');
      if (selected && noteEl && selected.dataset.note) {
        noteEl.textContent = selected.dataset.note;
      }
    }

    // 3. QuickView selector
    const qvSelect = document.querySelector<HTMLSelectElement>('#qv-city-select');
    if (qvSelect) {
      const prevVal = qvSelect.value;
      qvSelect.innerHTML = '';
      rates.forEach((r) => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.selected = prevVal ? r.id === prevVal : !!r.isDefault;
        opt.dataset.price = String(r.price);
        opt.dataset.note = r.deliveryNote || '';
        opt.textContent = `${r.city} — ${formatMoney(r.price)}`;
        qvSelect.appendChild(opt);
      });
      const selected = qvSelect.selectedOptions[0];
      const noteEl = document.querySelector('#qv-ship-city-note');
      if (selected && noteEl && selected.dataset.note) {
        noteEl.textContent = selected.dataset.note;
      }
    }
  }

  // ===================== CART SYSTEM =====================
  private initCart() {
    // Load from localStorage if available
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.entries(parsed).forEach(([id, item]) => {
            this.cart.set(id, item as CartItem);
          });
        }
      }
    } catch {
      // Ignore storage errors (private mode, SSR)
    }

    this.renderCartUI();

    // Listen for add-to-cart clicks anywhere on the page
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-add]');
      if (!target) return;

      const id = target.dataset.add || 'item';
      const name = target.dataset.name || 'Producto';
      const price = Number(target.dataset.price) || 0;
      const image = target.dataset.image;

      this.addToCart(id, name, price, image);

      // Feedback animation on button
      const originalText = target.innerHTML;
      target.classList.add('is-added');
      target.textContent = '✓ Agregado';
      setTimeout(() => {
        target.classList.remove('is-added');
        target.innerHTML = originalText;
      }, 1400);
    });

    // Basket opener
    document.querySelectorAll('[data-basket]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dialog = document.querySelector<HTMLDialogElement>('#five-cart-modal, .five-cart-dialog');
        if (dialog && typeof dialog.showModal === 'function') {
          this.renderCartUI();
          dialog.showModal();
        }
      });
    });

    // Dialog closer
    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dialog = document.querySelector<HTMLDialogElement>('#five-cart-modal, .five-cart-dialog');
        if (dialog && typeof dialog.close === 'function') {
          dialog.close();
        }
      });
    });
  }

  private saveCart() {
    try {
      if (typeof localStorage !== 'undefined') {
        const obj: Record<string, CartItem> = {};
        this.cart.forEach((v, k) => {
          obj[k] = v;
        });
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(obj));
      }
    } catch {
      // Ignore
    }
  }

  public addToCart(id: string, name: string, price: number, image?: string) {
    if (this.nexoState === 'enabled') {
      const p = this.nexoProducts.get(id);
      if (!p || (this.cart.get(id)?.quantity || 0) >= p.available) return;
      name = p.name; price = p.price; image = p.image;
    }
    const existing = this.cart.get(id);
    if (existing) {
      if (existing.quantity >= 10) return;
      existing.quantity += 1;
    } else {
      this.cart.set(id, { id, name, price, image, quantity: 1 });
    }
    this.saveCart();
    this.renderCartUI();

    const status = document.querySelector('#five-status');
    if (status) status.textContent = `${name} agregado al carrito de compras`;
  }

  private renderCartUI() {
    let count = 0;
    let total = 0;

    const list = document.querySelector('#five-cart-items');
    if (list) list.replaceChildren();

    this.cart.forEach((item, id) => {
      count += item.quantity;
      total += item.quantity * item.price;

      if (list) {
        const li = document.createElement('li');
        li.className = 'five-cart-item-row';

        const info = document.createElement('div');
        info.className = 'five-cart-item-info';
        const itemName = document.createElement('strong'); itemName.textContent = item.name;
        const quantityLabel = document.createElement('span'); quantityLabel.textContent = `${item.quantity} × ${formatMoney(item.price)}`;
        info.append(itemName, quantityLabel);

        const subtotal = document.createElement('span');
        subtotal.className = 'five-cart-item-subtotal';
        subtotal.textContent = formatMoney(item.quantity * item.price);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'five-cart-item-remove';
        removeBtn.setAttribute('aria-label', `Quitar ${item.name}`);
        removeBtn.textContent = 'Quitar';
        removeBtn.addEventListener('click', () => {
          this.cart.delete(id);
          this.saveCart();
          this.renderCartUI();
        });

        li.append(info, subtotal, removeBtn);
        list.append(li);
      }
    });

    if (list && count === 0) {
      const empty = document.createElement('li');
      empty.className = 'five-cart-empty-message';
      empty.textContent = 'Tu carrito está esperando a su compañero favorito.';
      list.append(empty);
    }

    // Update counts & labels
    const countEls = document.querySelectorAll('#five-cart-count, #five-mobile-cart-count');
    countEls.forEach((el) => {
      el.textContent = String(count);
    });

    const totalEl = document.querySelector('#five-total');
    if (totalEl) totalEl.textContent = formatMoney(total);

    const headerTotalEl = document.querySelector('#five-header-cart-total');
    if (headerTotalEl) headerTotalEl.textContent = formatMoney(total);

    // City shipping fee & dual totals (Transferencia vs Débito +5%)
    const citySelect = document.querySelector<HTMLSelectElement>('#cart-city-select');
    let shipFee = 1500;
    if (citySelect && citySelect.selectedOptions && citySelect.selectedOptions[0]) {
      shipFee = Number(citySelect.selectedOptions[0].dataset.price) || 0;
    }

    const shipFeeEl = document.querySelector('#five-cart-shipping-fee');
    if (shipFeeEl) shipFeeEl.textContent = formatMoney(shipFee);

    const grandTotal = count > 0 ? total + shipFee : 0;
    const debitTotal = count > 0 ? (this.nexoState === 'enabled' ? grandTotal : Math.round(grandTotal * 1.05)) : 0;

    const grandTotalEl = document.querySelector('#five-cart-grand-total');
    if (grandTotalEl) grandTotalEl.textContent = formatMoney(grandTotal);

    const debitTotalEl = document.querySelector('#five-cart-debit-total');
    if (debitTotalEl) debitTotalEl.textContent = formatMoney(debitTotal);

    // Update WhatsApp checkout link with items, city and breakdown
    const checkoutBtn = document.querySelector<HTMLAnchorElement>('#five-checkout-btn');
    if (checkoutBtn) {
      if (count === 0) {
        checkoutBtn.href = '/conoce-five#contacto';
      } else {
        const cityName = (citySelect && citySelect.selectedOptions[0]?.textContent) || 'Talca';
        const lines: string[] = ['¡Hola FIVE Mascotas! Quiero realizar el siguiente pedido:'];
        this.cart.forEach((item) => {
          lines.push(`• ${item.quantity}x ${item.name} (${formatMoney(item.price * item.quantity)})`);
        });
        lines.push('');
        lines.push(`📦 Subtotal: ${formatMoney(total)}`);
        lines.push(`🚚 Despacho (${cityName}): ${formatMoney(shipFee)}`);
        lines.push(`💰 Total Efectivo/Transferencia: ${formatMoney(grandTotal)}`);
        lines.push(`💳 Total Tarjeta Débito (+5%): ${formatMoney(debitTotal)}`);
        lines.push('');
        lines.push('Por favor confírmenme disponibilidad para coordinar el pago y entrega. ¡Gracias!');

        const textParam = encodeURIComponent(lines.join('\n'));
        checkoutBtn.href = `https://wa.me/56912345678?text=${textParam}`;
        checkoutBtn.target = '_blank';
        checkoutBtn.rel = 'noopener noreferrer';
      }
    }

    if (citySelect && !citySelect.dataset.listenerAttached) {
      citySelect.dataset.listenerAttached = 'true';
      citySelect.addEventListener('change', () => {
        const opt = citySelect.selectedOptions[0];
        const noteEl = document.querySelector('#cart-city-note');
        if (opt && noteEl && opt.dataset.note) {
          noteEl.textContent = opt.dataset.note;
        }
        this.renderCartUI();
      });
    }
  }

  // ===================== PREDICTIVE SEARCH =====================
  private initSearch() {
    const input = document.querySelector<HTMLInputElement>('#five-search');
    const dropdown = document.querySelector<HTMLElement>('#five-search-dropdown');
    const list = document.querySelector<HTMLElement>('#five-search-results-list');
    if (!input || !dropdown || !list) return;

    const normalize = (s: string) =>
      s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    // Sincronizar Ticker si fue editado en CMS
    try {
      if (typeof localStorage !== 'undefined') {
        const savedTickerRaw = localStorage.getItem('five_cms_ticker_v1');
        if (savedTickerRaw) {
          const ticker = JSON.parse(savedTickerRaw);
          const boldEl = document.querySelector('.five-ticker-bold');
          if (boldEl && ticker.text) boldEl.textContent = ticker.text;
          const pillCode = document.querySelector('.five-ticker-pill strong');
          if (pillCode && ticker.couponCode) pillCode.textContent = ticker.couponCode;
        }
      }
    } catch {
      // Ignore
    }

    input.addEventListener('input', () => {
      const q = normalize(input.value.trim());
      if (q.length < 2) {
        dropdown.hidden = true;
        list.innerHTML = '';
        return;
      }

      const activeProducts = (() => {
        try {
          if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('five_pim_products_v3');
            if (saved) return JSON.parse(saved);
          }
        } catch {
          // Fallback
        }
        return products;
      })();

      const matches = activeProducts.filter((p: any) => {
        const full = `${p.name} ${p.brand} ${p.detail} ${p.category} ${p.subcategory} ${p.pet}`;
        return normalize(full).includes(q);
      }).slice(0, 5);

      if (!matches.length) {
        dropdown.hidden = false;
        list.innerHTML = '<li class="five-search-empty">No se encontraron productos coincidentes.</li>';
        return;
      }

      list.innerHTML = '';
      matches.forEach((p: any) => {
        const li = document.createElement('li');
        li.className = 'five-search-suggestion';
        const targetHref = p.pet === 'Gatos' ? '/gatos' : '/perros';
        const link = document.createElement('a'); link.href = targetHref;
        const image = document.createElement('img'); image.src = p.image; image.alt = ''; image.width = 36; image.height = 36;
        const text = document.createElement('div'); text.className = 'five-suggestion-text';
        const name = document.createElement('strong'); name.textContent = p.name;
        const detail = document.createElement('small'); detail.textContent = `${p.brand} · ${formatMoney(p.price)}`;
        text.append(name, detail);
        const arrow = document.createElement('span'); arrow.className = 'five-suggestion-arrow'; arrow.textContent = '↗';
        link.append(image, text, arrow); li.append(link);
        list.append(li);
      });

      dropdown.hidden = false;
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target as Node) && e.target !== input) {
        dropdown.hidden = true;
      }
    });
  }

  // ===================== MOBILE DRAWER =====================
  private initDrawer() {
    const drawer = document.querySelector<HTMLElement>('#five-drawer');
    const overlay = document.querySelector<HTMLElement>('#five-drawer-overlay');
    const openBtns = document.querySelectorAll('#five-drawer-open, #five-bottom-categories-btn');
    const closeBtn = document.querySelector('#five-drawer-close');

    const open = () => {
      if (!drawer || !overlay) return;
      drawer.hidden = false;
      overlay.hidden = false;
      drawer.classList.add('is-open');
      document.body.classList.add('overflow-hidden');
    };

    const close = () => {
      if (!drawer || !overlay) return;
      drawer.classList.remove('is-open');
      setTimeout(() => {
        drawer.hidden = true;
        overlay.hidden = true;
        document.body.classList.remove('overflow-hidden');
      }, 250);
    };

    openBtns.forEach((btn) => btn.addEventListener('click', open));
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay) overlay.addEventListener('click', close);
  }

  // ===================== PLP REACTIVE FILTERING =====================
  private initPLP() {
    const cards = [...document.querySelectorAll<HTMLElement>('[data-product]')];
    if (!cards.length) return;

    const sortSelect = document.querySelector<HTMLSelectElement>('#five-sort-select');
    const resetBtn = document.querySelector('#five-reset');
    const clearBtn = document.querySelector('#five-clear');
    const resultsCount = document.querySelector('#five-results');
    const emptyState = document.querySelector<HTMLElement>('#five-empty');
    const grid = document.querySelector<HTMLElement>('#five-product-grid');

    const mobileSidebar = document.querySelector<HTMLElement>('#five-plp-sidebar');
    const mobileFilterOpen = document.querySelector('#five-mobile-filter-open');
    const mobileFilterClose = document.querySelector('#five-sidebar-close');
    const mobileApplyBtn = document.querySelector('#five-mobile-apply-btn');

    if (mobileFilterOpen && mobileSidebar) {
      mobileFilterOpen.addEventListener('click', () => {
        mobileSidebar.classList.add('is-mobile-open');
        document.body.classList.add('overflow-hidden');
      });
    }

    const closeMobileFilter = () => {
      if (mobileSidebar) {
        mobileSidebar.classList.remove('is-mobile-open');
        document.body.classList.remove('overflow-hidden');
      }
    };

    if (mobileFilterClose) mobileFilterClose.addEventListener('click', closeMobileFilter);
    if (mobileApplyBtn) mobileApplyBtn.addEventListener('click', closeMobileFilter);

    // Read initial URL params
    const applyURLParams = () => {
      const url = new URL(window.location.href);
      const petParam = url.searchParams.get('mascota');
      if (petParam) {
        const radio = document.querySelector<HTMLInputElement>(`input[name="facet-pet"][value="${petParam}"]`);
        if (radio) radio.checked = true;
      }
      const brandParam = url.searchParams.get('marca');
      if (brandParam) {
        const cb = document.querySelector<HTMLInputElement>(`input[name="facet-brand"][value="${brandParam}"]`);
        if (cb) cb.checked = true;
      }
    };

    applyURLParams();

    const applyFilter = () => {
      // 1. Get selected pet
      const petRadio = document.querySelector<HTMLInputElement>('input[name="facet-pet"]:checked');
      const selectedPet = petRadio ? petRadio.value : 'Todos';

      // 2. Get checked brands
      const checkedBrands = [...document.querySelectorAll<HTMLInputElement>('input[name="facet-brand"]:checked')].map(
        (el) => el.value
      );

      // 3. Get checked categories
      const checkedCategories = [...document.querySelectorAll<HTMLInputElement>('input[name="facet-category"]:checked')].map(
        (el) => el.value
      );

      // 4. Get checked formats
      const checkedFormats = [...document.querySelectorAll<HTMLInputElement>('input[name="facet-format"]:checked')].map(
        (el) => el.value
      );

      // 5. Get checked stages
      const checkedStages = [...document.querySelectorAll<HTMLInputElement>('input[name="facet-lifestage"]:checked')].map(
        (el) => el.value
      );

      // 6. Offers only
      const offersOnly = document.querySelector<HTMLInputElement>('[data-filter-offers]')?.checked || false;

      let visibleCount = 0;

      cards.forEach((card) => {
        const pet = card.dataset.pet || '';
        const brand = card.dataset.brand || '';
        const cat = card.dataset.category || card.dataset.type || '';
        const fmt = card.dataset.format || '';
        const stage = card.dataset.lifestage || '';
        const isOffer = card.dataset.offer === 'true';

        const matchesPet = selectedPet === 'Todos' || pet.includes(selectedPet);
        const matchesBrand = checkedBrands.length === 0 || checkedBrands.includes(brand);
        const matchesCategory = checkedCategories.length === 0 || checkedCategories.includes(cat);
        const matchesFormat = checkedFormats.length === 0 || checkedFormats.includes(fmt);
        const matchesStage = checkedStages.length === 0 || checkedStages.includes(stage);
        const matchesOffer = !offersOnly || isOffer;

        const isVisible = matchesPet && matchesBrand && matchesCategory && matchesFormat && matchesStage && matchesOffer;

        card.hidden = !isVisible;
        if (isVisible) visibleCount++;
      });

      // Update results counter
      if (resultsCount) {
        resultsCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'Resultado' : 'Resultados'}`;
      }

      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
      }

      // Sort visible cards if grid exists
      if (sortSelect && grid) {
        const mode = sortSelect.value;
        const visibleCards = cards.filter((c) => !c.hidden);
        visibleCards.sort((a, b) => {
          const priceA = Number(a.dataset.price) || 0;
          const priceB = Number(b.dataset.price) || 0;
          const nameA = a.dataset.search || '';
          const nameB = b.dataset.search || '';

          if (mode === 'price-asc') return priceA - priceB;
          if (mode === 'price-desc') return priceB - priceA;
          if (mode === 'name-asc') return nameA.localeCompare(nameB);
          return 0; // default order
        });
        visibleCards.forEach((c) => grid.appendChild(c));
      }

      // Sync URL query params cleanly without reload
      try {
        const url = new URL(window.location.href);
        if (selectedPet !== 'Todos') url.searchParams.set('mascota', selectedPet);
        else url.searchParams.delete('mascota');

        if (checkedBrands.length === 1) url.searchParams.set('marca', checkedBrands[0]);
        else url.searchParams.delete('marca');

        window.history.replaceState({}, '', url.toString());
      } catch {
        // Ignore
      }
    };

    // Attach listeners
    document.querySelectorAll('input[name="facet-pet"]').forEach((el) => {
      el.addEventListener('change', applyFilter);
    });

    document.querySelectorAll('input[name^="facet-"]').forEach((el) => {
      el.addEventListener('change', applyFilter);
    });

    document.querySelectorAll('[data-filter-offers]').forEach((el) => {
      el.addEventListener('change', applyFilter);
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', applyFilter);
    }

    const resetAll = () => {
      document.querySelectorAll<HTMLInputElement>('input[name="facet-pet"]').forEach((r) => {
        r.checked = r.value === 'Todos';
      });
      document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name^="facet-"], [data-filter-offers]').forEach((cb) => {
        cb.checked = false;
      });
      if (sortSelect) sortSelect.value = 'featured';
      applyFilter();
    };

    if (resetBtn) resetBtn.addEventListener('click', resetAll);
    if (clearBtn) clearBtn.addEventListener('click', resetAll);

    // Initial check
    applyFilter();
  }

  // ===================== QUICK VIEW MODAL SYSTEM =====================
  private initQuickView() {
    const dialog = document.querySelector<HTMLDialogElement>('#five-quickview-modal');
    if (!dialog) return;

    // Elements inside modal
    const mainImg = dialog.querySelector<HTMLImageElement>('#qv-main-image');
    const brandEl = dialog.querySelector<HTMLElement>('#qv-brand');
    const titleEl = dialog.querySelector<HTMLElement>('#qv-title');
    const detailEl = dialog.querySelector<HTMLElement>('#qv-detail');
    const skuEl = dialog.querySelector<HTMLElement>('#qv-sku');
    const discountEl = dialog.querySelector<HTMLElement>('#qv-discount-badge');
    const pricePrimEl = dialog.querySelector<HTMLElement>('#qv-price-primary');
    const priceDebEl = dialog.querySelector<HTMLElement>('#qv-price-debit');
    const formatBadgeEl = dialog.querySelector<HTMLElement>('#qv-format-badge');
    const formatBtnEl = dialog.querySelector<HTMLElement>('#qv-format-btn');
    const fullLinkEl = dialog.querySelector<HTMLAnchorElement>('#qv-full-link');
    const addBtn = dialog.querySelector<HTMLButtonElement>('#qv-add-btn');

    // Thumbs
    const thumb0 = dialog.querySelector<HTMLImageElement>('#qv-thumb-0');
    const thumb1 = dialog.querySelector<HTMLImageElement>('#qv-thumb-1');
    const thumb2 = dialog.querySelector<HTMLImageElement>('#qv-thumb-2');
    const thumbBtns = dialog.querySelectorAll<HTMLButtonElement>('.five-qv-thumb');

    // Quantity controls
    const qtyInput = dialog.querySelector<HTMLInputElement>('#qv-qty-input');
    const minusBtn = dialog.querySelector<HTMLButtonElement>('#qv-qty-minus');
    const plusBtn = dialog.querySelector<HTMLButtonElement>('#qv-qty-plus');

    // City Selector
    const qvCitySelect = dialog.querySelector<HTMLSelectElement>('#qv-city-select');
    const qvShipNote = dialog.querySelector<HTMLElement>('#qv-ship-city-note');

    // State for current quickview
    let currentProd = {
      id: '',
      name: '',
      price: 0,
      image: '',
    };

    // Thumbnail switcher
    thumbBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        thumbBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const img = btn.querySelector('img');
        if (img && mainImg) {
          mainImg.src = img.src;
        }
      });
    });

    // Quantity adjustments
    minusBtn?.addEventListener('click', () => {
      if (!qtyInput) return;
      let val = Number(qtyInput.value) || 1;
      if (val > 1) qtyInput.value = String(val - 1);
    });

    plusBtn?.addEventListener('click', () => {
      if (!qtyInput) return;
      let val = Number(qtyInput.value) || 1;
      if (val < 10) qtyInput.value = String(val + 1);
    });

    // City change note
    qvCitySelect?.addEventListener('change', () => {
      const opt = qvCitySelect.selectedOptions[0];
      if (opt && qvShipNote && opt.dataset.note) {
        qvShipNote.textContent = opt.dataset.note;
      }
    });

    // Close button
    dialog.querySelectorAll('[data-qv-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (typeof dialog.close === 'function') dialog.close();
      });
    });

    // Add to cart from QuickView modal
    addBtn?.addEventListener('click', () => {
      if (!currentProd.id) return;
      const qty = Number(qtyInput?.value) || 1;
      for (let i = 0; i < qty; i++) {
        this.addToCart(currentProd.id, currentProd.name, currentProd.price, currentProd.image);
      }

      // Visual feedback
      const origText = addBtn.innerHTML;
      addBtn.textContent = '✓ Agregado al Carrito';
      setTimeout(() => {
        addBtn.innerHTML = origText;
        if (typeof dialog.close === 'function') dialog.close();
      }, 900);
    });

    // Open QuickView on trigger button click anywhere
    document.addEventListener('click', (e) => {
      const trigger = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-quickview]');
      if (!trigger) return;

      const id = trigger.dataset.quickview || '';
      const name = trigger.dataset.name || '';
      const brand = trigger.dataset.brand || 'FIVE';
      const detail = trigger.dataset.detail || '';
      const price = Number(trigger.dataset.price) || 0;
      const oldPrice = Number(trigger.dataset.oldprice) || 0;
      const image = trigger.dataset.image || '/five-mascotas/alimento-0.svg';
      const format = trigger.dataset.format || 'Unidad';
      const cleanId = trigger.dataset.cleanid || '00001';

      currentProd = { id, name, price, image };

      // Set fields
      if (brandEl) brandEl.textContent = `${brand}®`;
      if (titleEl) titleEl.textContent = name;
      if (detailEl) detailEl.textContent = detail;
      if (skuEl) skuEl.textContent = `ID ${cleanId.padStart(5, '0')}`;
      if (formatBadgeEl) formatBadgeEl.textContent = format;
      if (formatBtnEl) formatBtnEl.textContent = format;
      if (fullLinkEl) fullLinkEl.href = `/producto/${id}`;

      // Reset quantity
      if (qtyInput) qtyInput.value = '1';

      // Images
      if (mainImg) mainImg.src = image;
      if (thumb0) thumb0.src = image;
      if (thumb1) thumb1.src = '/demos/miga/plato.svg';
      if (thumb2) thumb2.src = '/five-mascotas/botiquin.svg';
      thumbBtns.forEach((b, idx) => {
        b.classList.toggle('is-active', idx === 0);
      });

      // Discount badge
      if (discountEl) {
        if (oldPrice > price) {
          const pct = Math.round(((oldPrice - price) / oldPrice) * 100);
          discountEl.textContent = `-${pct}% OFF`;
          discountEl.hidden = false;
        } else {
          discountEl.hidden = true;
        }
      }

      // Dual Prices
      const debitPrice = Math.round(price * 1.05);
      if (pricePrimEl) pricePrimEl.textContent = formatMoney(price);
      if (priceDebEl) priceDebEl.textContent = formatMoney(debitPrice);

      // Open Modal
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    });
  }

  // ===================== CHECKOUT MODAL SYSTEM =====================
  private initCheckout() {
    const chkModal = document.querySelector<HTMLDialogElement>('#five-checkout-modal');
    if (!chkModal) return;

    // Steps
    const step1Pane = chkModal.querySelector<HTMLElement>('#chk-step-1');
    const step2Pane = chkModal.querySelector<HTMLElement>('#chk-step-2');
    const step3Pane = chkModal.querySelector<HTMLElement>('#chk-step-3');

    const stepPill1 = chkModal.querySelector<HTMLElement>('#chk-step-pill-1');
    const stepPill2 = chkModal.querySelector<HTMLElement>('#chk-step-pill-2');
    const stepPill3 = chkModal.querySelector<HTMLElement>('#chk-step-pill-3');

    // Forms & Controls
    const formStep1 = chkModal.querySelector<HTMLFormElement>('#chk-form-step1');
    const miniSummary = chkModal.querySelector<HTMLElement>('#chk-mini-summary');

    const backBtn = chkModal.querySelector<HTMLButtonElement>('#chk-back-to-step1');
    const confirmPayBtn = chkModal.querySelector<HTMLButtonElement>('#chk-confirm-pay-btn');
    const copyDataBtn = chkModal.querySelector<HTMLButtonElement>('#chk-copy-btn');

    const qrImage = chkModal.querySelector<HTMLImageElement>('#chk-qr-image');
    const bankAmountEl = chkModal.querySelector<HTMLElement>('#chk-bank-amount');
    const trackingCodeEl = chkModal.querySelector<HTMLElement>('#chk-tracking-code');
    const waProofBtn = chkModal.querySelector<HTMLAnchorElement>('#chk-whatsapp-proof-btn');
    const goTrackBtn = chkModal.querySelector<HTMLAnchorElement>('#chk-go-track-btn');

    let currentOrder = {
      code: '',
      customerName: '',
      phone: '',
      email: '',
      city: '',
      address: '',
      notes: '',
      items: [] as any[],
      subtotal: 0,
      shippingFee: 0,
      totalTransfer: 0,
      totalDebit: 0,
      status: 'Recibido', // 'Recibido' | 'Pago Confirmado' | 'En Reparto' | 'Entregado'
      createdAt: '',
    };
    let pendingPayload = '';
    let requestKey = '';
    let submitting = false;
    let sentToNexo = false;
    let nexoBank: BankAccountConfig | null = null;

    const showStep = (step: 1 | 2 | 3) => {
      if (step1Pane) step1Pane.hidden = step !== 1;
      if (step2Pane) step2Pane.hidden = step !== 2;
      if (step3Pane) step3Pane.hidden = step !== 3;

      stepPill1?.classList.toggle('is-active', step === 1);
      stepPill2?.classList.toggle('is-active', step === 2);
      stepPill3?.classList.toggle('is-active', step === 3);
    };

    // Close buttons
    chkModal.querySelectorAll('[data-chk-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (typeof chkModal.close === 'function') chkModal.close();
      });
    });

    backBtn?.addEventListener('click', () => showStep(1));

    // Helper to update mini summary dynamically
    const updateMiniSummary = () => {
      if (!miniSummary) return;
      let count = 0;
      let total = 0;
      this.cart.forEach((item) => {
        count += item.quantity;
        total += item.price * item.quantity;
      });

      const chkCitySelect = chkModal.querySelector<HTMLSelectElement>('#chk-city');
      const shipFee = chkCitySelect?.selectedOptions[0]
        ? Number(chkCitySelect.selectedOptions[0].dataset.price) || 1500
        : 1500;

      miniSummary.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Productos (${count} unidades):</span>
          <strong>${formatMoney(total)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Tarifa Plana Despacho:</span>
          <strong style="color:#7025a8;">${formatMoney(shipFee)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; border-top:1px dashed #e5dde9; padding-top:6px; margin-top:4px;">
          <span style="font-weight:800; color:#111827;">Total Transferencia:</span>
          <strong style="font-size:16px; color:#276717;">${formatMoney(total + shipFee)}</strong>
        </div>
      `;
    };

    // Live update when city changes in checkout
    const chkCitySelect = chkModal.querySelector<HTMLSelectElement>('#chk-city');
    chkCitySelect?.addEventListener('change', () => {
      updateMiniSummary();
    });

    // Check if customer is already logged in to prefill form
    const prefillUserSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const u = data.user;
            const nameInput = chkModal.querySelector<HTMLInputElement>('#chk-name');
            const emailInput = chkModal.querySelector<HTMLInputElement>('#chk-email');
            const phoneInput = chkModal.querySelector<HTMLInputElement>('#chk-phone');
            const addressInput = chkModal.querySelector<HTMLInputElement>('#chk-address');
            const notesInput = chkModal.querySelector<HTMLTextAreaElement>('#chk-notes');
            const chkCitySel = chkModal.querySelector<HTMLSelectElement>('#chk-city');

            if (nameInput && (!nameInput.value || nameInput.value.trim() === '')) nameInput.value = u.name || '';
            if (emailInput && (!emailInput.value || emailInput.value.trim() === '')) emailInput.value = u.email || '';
            if (phoneInput && (!phoneInput.value || phoneInput.value.trim() === '')) phoneInput.value = u.phone || '';
            if (addressInput && (!addressInput.value || addressInput.value.trim() === '')) addressInput.value = u.address || '';
            if (notesInput && (!notesInput.value || notesInput.value.trim() === '')) notesInput.value = u.notes || '';

            if (chkCitySel && u.city) {
              const matchedOption = Array.from(chkCitySel.options).find(
                (opt) => opt.value.toLowerCase() === u.city.toLowerCase() || opt.dataset.city?.toLowerCase() === u.city.toLowerCase()
              );
              if (matchedOption) {
                chkCitySel.value = matchedOption.value;
                updateMiniSummary();
              }
            }
          }
        }
      } catch {}
    };

    // Handle Cart Drawer Checkout Button click -> Open Checkout Modal
    const cartCheckoutBtn = document.querySelector<HTMLElement>('#five-checkout-btn');
    if (cartCheckoutBtn) {
      cartCheckoutBtn.addEventListener('click', (e) => {
        // If there are items in the cart, prevent default and open checkout modal
        if (this.cart.size > 0) {
          e.preventDefault();

          // Close cart drawer
          const cartDialog = document.querySelector<HTMLDialogElement>('#five-cart-modal, .five-cart-dialog');
          if (cartDialog && typeof cartDialog.close === 'function') {
            cartDialog.close();
          }

          // Sync shipping city from cart select if available
          const cartCitySelect = document.querySelector<HTMLSelectElement>('#cart-city-select');
          if (cartCitySelect && chkCitySelect) {
            chkCitySelect.value = cartCitySelect.value;
          }

          updateMiniSummary();
          prefillUserSession();
          showStep(1);

          if (typeof chkModal.showModal === 'function') {
            chkModal.showModal();
          }
        }
      });
    }

    // Step 1 Submit -> Generate order draft and go to Step 2 (QR)
    formStep1?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submitting) return;
      const feedback = chkModal.querySelector<HTMLElement>('#chk-nexo-feedback');
      const pdfLink = chkModal.querySelector<HTMLAnchorElement>('#chk-quotation-pdf');
      if (pdfLink) pdfLink.hidden = true;
      if (waProofBtn) waProofBtn.hidden = false;
      const proofHelp = chkModal.querySelector<HTMLElement>('#chk-proof-help');
      if (proofHelp) proofHelp.hidden = false;
      const resultStatus = chkModal.querySelector<HTMLElement>('#chk-result-status');
      if (resultStatus) resultStatus.textContent = 'Estado: Pendiente de confirmación de transferencia';
      if (goTrackBtn) goTrackBtn.hidden = false;
      if (this.nexoState === 'loading' || this.nexoState === 'error') {
        if (feedback) feedback.textContent = 'No se ha podido verificar el catálogo. Recarga la página y vuelve a intentar.';
        return;
      }

      const name = (chkModal.querySelector('#chk-name') as HTMLInputElement).value;
      const phone = (chkModal.querySelector('#chk-phone') as HTMLInputElement).value;
      const email = (chkModal.querySelector('#chk-email') as HTMLInputElement).value;
      const chkCity = chkModal.querySelector<HTMLSelectElement>('#chk-city')!;
      const city = chkCity.selectedOptions[0]?.dataset.city || chkCity.value;
      const shipFee = Number(chkCity.selectedOptions[0]?.dataset.price) || 0;
      const address = (chkModal.querySelector('#chk-address') as HTMLInputElement).value;
      const notes = (chkModal.querySelector('#chk-notes') as HTMLTextAreaElement).value;

      let subtotal = 0;
      const itemsList: any[] = [];
      this.cart.forEach((item) => {
        subtotal += item.price * item.quantity;
        itemsList.push({ ...item });
      });

      const totalTransfer = subtotal + shipFee;
      const totalDebit = Math.round(totalTransfer * 1.05);
      const code = `FIVE-TRK-${Math.floor(1000 + Math.random() * 9000)}`;

      currentOrder = {
        code,
        customerName: name,
        phone,
        email,
        city,
        address,
        notes,
        items: itemsList,
        subtotal,
        shippingFee: shipFee,
        totalTransfer,
        totalDebit,
        status: 'Recibido',
        createdAt: new Date().toISOString(),
      };

      if (this.nexoState === 'enabled') {
        const kind = chkModal.querySelector<HTMLInputElement>('#chk-quotation')?.checked ? 'QUOTATION' as const : 'ORDER' as const;
        const rut = chkModal.querySelector<HTMLInputElement>('#chk-rut')?.value.trim();
        const input = { kind, shippingRateId: chkCity.value, customer: { name, email, phone, city, address, ...(rut ? { rut } : {}) }, notes,
          items: itemsList.map(i => ({ id: i.id, quantity: i.quantity })) };
        const serialized = JSON.stringify(input);
        if (serialized !== pendingPayload) { pendingPayload = serialized; requestKey = crypto.randomUUID(); }
        submitting = true;
        const submit = formStep1.querySelector<HTMLButtonElement>('[type="submit"]');
        if (submit) submit.disabled = true;
        if (feedback) feedback.textContent = 'Enviando a Nexo…';
        try {
          const result = await submitToNexo(input, requestKey);
          sentToNexo = true;
          currentOrder.code = result.number;
          currentOrder.subtotal = Number(result.totalProducts);
          currentOrder.shippingFee = result.shippingFee;
          currentOrder.totalTransfer = Number(result.totalDue);
          currentOrder.totalDebit = Number(result.totalDue);
          if (result.bankDetails) {
            nexoBank = { ...result.bankDetails, bankName: result.bankDetails.bankName || '', accountType: result.bankDetails.accountType || '', accountNumber: result.bankDetails.accountNumber || '', holderName: result.bankDetails.holderName || '', holderRut: result.bankDetails.holderRut || '', email: result.bankDetails.email || '', customInstructions:'', active:true };
            for (const [key, selector] of Object.entries({ bankName: '#chk-bank-name', accountType: '#chk-bank-type', accountNumber: '#chk-bank-number', holderName: '#chk-bank-holder', holderRut: '#chk-bank-rut', email: '#chk-bank-email' })) {
              const element = chkModal.querySelector(selector);
              if (element) element.textContent = result.bankDetails[key] || '';
            }
          }
          if (qrImage && result.paymentQr) qrImage.src = result.paymentQr;
          if (feedback) feedback.textContent = '';
          if (kind === 'QUOTATION') {
            if (trackingCodeEl) trackingCodeEl.textContent = result.number;
            const message = chkModal.querySelector<HTMLElement>('#chk-result-message');
            if (message) message.textContent = 'Cotización registrada en Nexo. La tienda revisará disponibilidad y condiciones antes de convertirla en pedido. No se ha registrado un pago.';
            if (goTrackBtn) goTrackBtn.hidden = true;
            if (waProofBtn) waProofBtn.hidden = true;
            if (proofHelp) proofHelp.hidden = true;
            if (resultStatus) resultStatus.textContent = 'Cotización enviada · Sin reserva de stock';
            const download = chkModal.querySelector<HTMLAnchorElement>('#chk-quotation-pdf');
            if (download) { download.href = `/api/nexo/quotations/${requestKey}/pdf`; download.hidden = false; }
            showStep(3); return;
          }
        } catch (error) {
          if (feedback) feedback.textContent = error instanceof Error ? error.message : 'No se pudo enviar. Puedes reintentar.';
          return;
        } finally { submitting = false; if (submit) submit.disabled = false; }
      } else { sentToNexo = false; nexoBank = null; }

      // Set Step 2 data
      if (bankAmountEl) bankAmountEl.textContent = formatMoney(currentOrder.totalTransfer);

      // Generate QR Code URL with bank details payload
      const bankConfig = AdminStoreService.getBankAccount();
      const qrPayload = formatBankTransferPayload(bankConfig, currentOrder.code, currentOrder.totalTransfer);
      if (qrImage && !sentToNexo) {
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayload)}`;
      }

      showStep(2);
    });

    // Helper for per-field copy buttons
    chkModal.querySelectorAll<HTMLButtonElement>('.five-mini-copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetSelector = btn.getAttribute('data-copy-target');
        if (!targetSelector) return;
        const targetEl = chkModal.querySelector<HTMLElement>(targetSelector);
        if (!targetEl) return;

        const textToCopy = (targetEl.textContent || '').trim();
        if (!textToCopy) return;

        navigator.clipboard?.writeText(textToCopy);
        const originalHtml = btn.innerHTML;
        btn.classList.add('is-copied');
        btn.innerHTML = '<span>✓ Copiado</span>';

        setTimeout(() => {
          btn.classList.remove('is-copied');
          btn.innerHTML = originalHtml;
        }, 1800);
      });
    });

    // Copy all bank data button (Master button)
    copyDataBtn?.addEventListener('click', () => {
      const bankConfig = nexoBank || AdminStoreService.getBankAccount();
      const payload = formatBankTransferPayload(bankConfig, currentOrder.code, currentOrder.totalTransfer);
      navigator.clipboard?.writeText(payload);
      const origText = copyDataBtn.innerHTML;
      copyDataBtn.classList.add('is-copied');
      copyDataBtn.innerHTML = '<span>✓ ¡Todos los datos copiados al portapapeles!</span>';
      setTimeout(() => {
        copyDataBtn.classList.remove('is-copied');
        copyDataBtn.innerHTML = origText;
      }, 2200);
    });

    // Step 2 Confirm Payment -> Save Order & Show Step 3 (Tracking code)
    confirmPayBtn?.addEventListener('click', () => {
      // Save order to persistent store
      if (!sentToNexo) AdminStoreService.saveOrder(currentOrder);
      if (sentToNexo) {
        const message = chkModal.querySelector<HTMLElement>('#chk-result-message');
        if (message) message.textContent = 'Pedido registrado en Nexo. La transferencia sigue pendiente de verificación por la tienda.';
        if (goTrackBtn) goTrackBtn.hidden = true;
      }

      // Set Step 3 Tracking info
      if (trackingCodeEl) trackingCodeEl.textContent = currentOrder.code;

      // WhatsApp pre-formatted proof message
      const lines = [
        `¡Hola FIVE Mascotas! Acabo de realizar la transferencia de mi pedido *${currentOrder.code}*:`,
        '',
        `👤 Cliente: ${currentOrder.customerName}`,
        `📞 Teléfono: ${currentOrder.phone}`,
        `📍 Entrega en: ${currentOrder.address}, ${currentOrder.city}`,
        `💰 Monto Transferido: ${formatMoney(currentOrder.totalTransfer)}`,
        '',
        `Adjunto mi comprobante de transferencia para confirmación. ¡Muchas gracias!`,
      ];
      if (waProofBtn) {
        const supportPhone = sentToNexo ? String((nexoBank as unknown as Record<string,string> | null)?.whatsappPhone || '').replace(/\D/g,'') : '56912345678';
        waProofBtn.hidden = !supportPhone;
        const proofHelp = chkModal.querySelector<HTMLElement>('#chk-proof-help');
        if (proofHelp) proofHelp.hidden = !supportPhone;
        if (supportPhone) waProofBtn.href = `https://wa.me/${supportPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
      }

      if (goTrackBtn) {
        goTrackBtn.href = `/rastreo?codigo=${currentOrder.code}`;
      }

      // Clear cart
      this.cart.clear();
      this.saveCart();
      this.renderCartUI();

      showStep(3);
    });
  }
}

// Instantiate on document ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new StoreManager());
  } else {
    new StoreManager();
  }
}
