// Global Storefront Client Script: Cart, Predictive Search, Drawers, and Interactive Filters
import { products, formatMoney } from '../data/pim/catalog';

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

  constructor() {
    this.initCart();
    this.initSearch();
    this.initDrawer();
    this.initPLP();
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
        info.innerHTML = `<strong>${item.name}</strong><span>${item.quantity} × ${formatMoney(item.price)}</span>`;

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
            const saved = localStorage.getItem('five_pim_products_v1');
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
        li.innerHTML = `
          <a href="${targetHref}">
            <img src="${p.image}" alt="" width="36" height="36" />
            <div class="five-suggestion-text">
              <strong>${p.name}</strong>
              <small>${p.brand} · ${formatMoney(p.price)}</small>
            </div>
            <span class="five-suggestion-arrow">↗</span>
          </a>
        `;
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
}

// Instantiate on document ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new StoreManager());
  } else {
    new StoreManager();
  }
}
