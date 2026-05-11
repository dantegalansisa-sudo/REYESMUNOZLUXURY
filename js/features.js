/* ═══════════════════════════════════════════
   MATOS DEALER · FEATURES (shared utilities)
   Wishlist · Cookies · Demo notice · Finance calc · Lightbox · Modals
═══════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ─── WISHLIST (localStorage) ─── */
  const WL_KEY = 'matos_wishlist_v1';
  const Wishlist = {
    get() {
      try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]'); } catch { return []; }
    },
    set(list) { localStorage.setItem(WL_KEY, JSON.stringify(list)); this._dispatch(); },
    has(id) { return this.get().includes(Number(id)); },
    toggle(id) {
      id = Number(id);
      const list = this.get();
      const i = list.indexOf(id);
      if (i >= 0) list.splice(i, 1); else list.push(id);
      this.set(list);
      return this.has(id);
    },
    count() { return this.get().length; },
    _dispatch() {
      window.dispatchEvent(new CustomEvent('wishlist:change', { detail: { count: this.count() } }));
    }
  };

  /* ─── DECORATE wishlist icons on page ─── */
  function refreshHearts() {
    document.querySelectorAll('[data-wish-id]').forEach(btn => {
      const id = btn.dataset.wishId;
      const active = Wishlist.has(id);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    const counters = document.querySelectorAll('[data-wish-counter]');
    counters.forEach(el => {
      const c = Wishlist.count();
      el.textContent = c;
      el.classList.toggle('is-empty', c === 0);
    });
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-wish-id]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    Wishlist.toggle(btn.dataset.wishId);
    refreshHearts();
  });
  window.addEventListener('wishlist:change', refreshHearts);
  document.addEventListener('DOMContentLoaded', refreshHearts);

  /* ─── COOKIES BANNER ─── */
  const COOKIE_KEY = 'matos_cookies_v1';
  function injectCookiesBanner() {
    if (localStorage.getItem(COOKIE_KEY)) return;
    const tpl = document.createElement('div');
    tpl.className = 'cookies-banner';
    tpl.innerHTML = `
      <div class="cookies-banner__inner">
        <p class="cookies-banner__text">
          Usamos cookies funcionales para recordar tus preferencias (favoritos, búsquedas).
          Sin tracking comercial.
          <a href="privacidad.html">Política de privacidad</a>.
        </p>
        <div class="cookies-banner__actions">
          <button type="button" class="cookies-banner__btn cookies-banner__btn--decline" data-cookies="decline">Solo necesarias</button>
          <button type="button" class="cookies-banner__btn cookies-banner__btn--accept" data-cookies="accept">Aceptar</button>
        </div>
      </div>`;
    document.body.appendChild(tpl);
    tpl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cookies]');
      if (!b) return;
      localStorage.setItem(COOKIE_KEY, b.dataset.cookies);
      tpl.classList.add('is-leaving');
      setTimeout(() => tpl.remove(), 400);
    });
    requestAnimationFrame(() => tpl.classList.add('is-visible'));
  }

  /* ─── DEMO NOTICE BAR ─── */
  function injectDemoNotice() {
    if (document.querySelector('.demo-notice')) return;
    const bar = document.createElement('div');
    bar.className = 'demo-notice';
    bar.innerHTML = `
      <span class="demo-notice__dot"></span>
      Sitio de demostración · Datos y vehículos ficticios · No es web oficial`;
    document.body.appendChild(bar);
  }

  /* ─── FINANCE CALCULATOR (PMT) ─── */
  // monthlyPayment = P * r / (1 - (1 + r)^-n)
  function pmt(principal, annualRate, months) {
    const r = annualRate / 12;
    if (r === 0) return principal / months;
    return (principal * r) / (1 - Math.pow(1 + r, -months));
  }

  function bindFinanceCalc(rootEl, defaultPrice) {
    if (!rootEl) return;
    const priceInput = rootEl.querySelector('[data-fc-price]');
    const downInput = rootEl.querySelector('[data-fc-down]');
    const downRange = rootEl.querySelector('[data-fc-down-range]');
    const termInput = rootEl.querySelector('[data-fc-term]');
    const rateInput = rootEl.querySelector('[data-fc-rate]');
    const monthlyOut = rootEl.querySelector('[data-fc-monthly]');
    const totalOut = rootEl.querySelector('[data-fc-total]');
    const interestOut = rootEl.querySelector('[data-fc-interest]');

    if (priceInput && defaultPrice) priceInput.value = defaultPrice;

    function fmt(n) {
      return 'RD$ ' + Math.round(n).toLocaleString('es-DO');
    }

    function recalc() {
      const price = Math.max(0, parseFloat(priceInput?.value) || 0);
      const downPct = Math.min(80, Math.max(0, parseFloat(downRange?.value || downInput?.value) || 0));
      const downAmt = price * (downPct / 100);
      const term = Math.max(12, parseInt(termInput?.value) || 60);
      const rate = Math.max(0.01, (parseFloat(rateInput?.value) || 12) / 100);
      const principal = Math.max(0, price - downAmt);
      const monthly = pmt(principal, rate, term);
      const total = monthly * term + downAmt;
      const interest = total - price;
      if (downInput) downInput.value = downPct;
      if (downRange) downRange.value = downPct;
      if (monthlyOut) monthlyOut.textContent = fmt(monthly);
      if (totalOut) totalOut.textContent = fmt(total);
      if (interestOut) interestOut.textContent = fmt(interest);
    }

    rootEl.querySelectorAll('input').forEach(i => i.addEventListener('input', recalc));
    recalc();
  }
  global.MatosFinance = { pmt, bindFinanceCalc };

  /* ─── LIGHTBOX (gallery) ─── */
  function openLightbox(images, startIndex) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML = `
      <button class="lightbox__close" aria-label="Cerrar">&times;</button>
      <button class="lightbox__nav lightbox__nav--prev" aria-label="Anterior">&#8249;</button>
      <button class="lightbox__nav lightbox__nav--next" aria-label="Siguiente">&#8250;</button>
      <div class="lightbox__stage"><img class="lightbox__img" alt=""></div>
      <div class="lightbox__counter"><span class="lightbox__counter-current"></span> / <span class="lightbox__counter-total"></span></div>`;
    document.body.appendChild(overlay);
    const img = overlay.querySelector('.lightbox__img');
    const cur = overlay.querySelector('.lightbox__counter-current');
    const tot = overlay.querySelector('.lightbox__counter-total');
    let i = startIndex || 0;
    function show(n) {
      i = (n + images.length) % images.length;
      img.src = images[i];
      cur.textContent = i + 1;
      tot.textContent = images.length;
    }
    overlay.querySelector('.lightbox__close').addEventListener('click', close);
    overlay.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(i - 1));
    overlay.querySelector('.lightbox__nav--next').addEventListener('click', () => show(i + 1));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(i - 1);
      else if (e.key === 'ArrowRight') show(i + 1);
    }
    function close() {
      document.removeEventListener('keydown', onKey);
      overlay.classList.add('is-leaving');
      setTimeout(() => overlay.remove(), 300);
    }
    show(i);
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
  }
  global.MatosLightbox = { open: openLightbox };

  /* ─── MODAL HELPER ─── */
  function openModal(html, opts) {
    opts = opts || {};
    const overlay = document.createElement('div');
    overlay.className = 'modal' + (opts.className ? ' ' + opts.className : '');
    overlay.innerHTML = `
      <div class="modal__panel" role="dialog" aria-modal="true">
        <button class="modal__close" aria-label="Cerrar">&times;</button>
        <div class="modal__body">${html}</div>
      </div>`;
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
    function close() {
      overlay.classList.add('is-leaving');
      document.body.classList.remove('no-scroll');
      setTimeout(() => overlay.remove(), 280);
      if (opts.onClose) opts.onClose();
    }
    overlay.querySelector('.modal__close').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', k); } });
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
    return { overlay, close };
  }
  global.MatosModal = { open: openModal };

  /* ─── INIT ─── */
  document.addEventListener('DOMContentLoaded', () => {
    // injectDemoNotice(); // replaced by hero__disclaimer
    injectCookiesBanner();
  });

  global.MatosWishlist = Wishlist;
})(window);
