/* ═══════════════════════════════════════════
   CHARLIE AUTO SALES · CINEMATIC ENGINE v2
═══════════════════════════════════════════ */

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  /* ─── HERO VIDEO · trim last 10 seconds ─── */
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    const TRIM_END = 10; // skip last 10 seconds
    heroVideo.addEventListener('loadedmetadata', () => {
      const stopAt = Math.max(0, heroVideo.duration - TRIM_END);
      heroVideo.addEventListener('timeupdate', () => {
        if (heroVideo.currentTime >= stopAt) {
          heroVideo.currentTime = 0;
          heroVideo.play().catch(() => {});
        }
      });
    });
    // Force autoplay (mute + play after metadata)
    heroVideo.muted = true;
    heroVideo.playsInline = true;
    const tryPlay = () => {
      heroVideo.muted = true;
      const p = heroVideo.play();
      if (p && p.catch) p.catch(() => {});
    };
    if (heroVideo.readyState >= 2) tryPlay();
    heroVideo.addEventListener('canplay', tryPlay, { once: true });
    document.addEventListener('click', tryPlay, { once: true });
    document.addEventListener('scroll', tryPlay, { once: true });
  }

  /* ─── LENIS SMOOTH SCROLL ───
     Un solo loop de animación: Lenis se alimenta del ticker de GSAP.
     (Antes corría en su propio requestAnimationFrame Y en el ticker,
     avanzando dos veces por frame → tirones al hacer scroll.) */
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  let lenis;
  if (!reduceMotion && !isMobile && window.Lenis) {
    lenis = new Lenis({
      lerp: 0.11,
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: -60, duration: 1.2 });
          }
        }
      });
    });
  }

  /* ─── SCROLL PROGRESS BAR (transform only, sin layout) ─── */
  if (!reduceMotion) {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    let ticking = false;
    const paint = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }

  /* ─── NAVBAR SCROLL STATE ─── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let scrolled = null;
    const onScroll = () => {
      const next = window.scrollY > 80;
      if (next !== scrolled) { scrolled = next; navbar.classList.toggle('scrolled', next); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── MOBILE MENU ─── */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    function closeMenu() {
      burger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('active');
      if (isOpen) {
        closeMenu();
      } else {
        burger.classList.add('active');
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMenu);
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Cerrar al hacer click en el fondo del overlay (fuera del panel de links)
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMenu();
    });
  }

  /* ─── INVENTORY · render + filter + search ─── */
  const grid = document.getElementById('inventoryGrid');
  const filtersWrap = document.getElementById('inventoryFilters');
  const queryInput = document.getElementById('invQuery');

  let activeFilter = 'all';
  let activeQuery = '';
  const hasData = typeof VEHICULOS !== 'undefined';

  // Chips de marca generados desde el inventario real (evita filtros vacíos)
  if (filtersWrap && hasData) {
    filtersWrap.insertAdjacentHTML('beforeend', MARCAS_DISPONIBLES.map(m =>
      `<button class="inv-chip" data-filter="${m}">${m}</button>`).join(''));
  }

  /* ─── HERO SEARCH · opciones reales del inventario ─── */
  const heroForm = document.getElementById('heroSearch');
  if (heroForm && hasData) {
    const marcaSel = document.getElementById('heroMarca');
    const modeloSel = document.getElementById('heroModelo');
    const anoSel = document.getElementById('heroAno');
    const opts = (list) => list.map(v => `<option value="${v}">${v}</option>`).join('');
    const fillModels = () => {
      const marca = marcaSel.value;
      const models = [...new Set(VEHICULOS.filter(v => !marca || v.marca === marca).map(v => v.modelo))].sort();
      modeloSel.innerHTML = '<option value="">Modelo</option>' + opts(models);
    };
    marcaSel.insertAdjacentHTML('beforeend', opts(MARCAS_DISPONIBLES));
    anoSel.insertAdjacentHTML('beforeend', opts(ANOS_DISPONIBLES));
    fillModels();
    marcaSel.addEventListener('change', fillModels);
    // No enviar parámetros vacíos (?marca=&buscar=…)
    heroForm.addEventListener('submit', () => {
      heroForm.querySelectorAll('select').forEach(sel => { sel.disabled = !sel.value; });
      setTimeout(() => heroForm.querySelectorAll('select').forEach(sel => { sel.disabled = false; }), 0);
    });
  }

  function formatPrice(v) {
    if (v.precioConsultar) return 'Precio a consultar';
    return 'RD$ ' + v.precio.toLocaleString('es-DO');
  }

  function renderCard(v, i) {
    const img = (v.imagenes && v.imagenes[0]) || 'porche.png';
    return `
      <a class="inv-card" href="vehiculo.html#${v.id}" style="--i:${i}">
        <div class="inv-card__media">
          <img src="${img}" alt="${v.marca} ${v.modelo}" loading="lazy">
          <span class="inv-card__badge">${v.condicion}</span>
          <button class="wish-btn" data-wish-id="${v.id}" aria-label="Guardar en favoritos">
            <svg viewBox="0 0 24 24"><path class="wish-fill wish-stroke" stroke="currentColor" stroke-width="1.6" fill="none" d="M12 21s-7-4.534-7-10a4.5 4.5 0 0 1 8-2.83A4.5 4.5 0 0 1 19 11c0 5.466-7 10-7 10z"/></svg>
          </button>
        </div>
        <div class="inv-card__body">
          <div class="inv-card__head">
            <span class="inv-card__brand">${v.marca}</span>
            <span class="inv-card__year">${v.ano}</span>
          </div>
          <h3 class="inv-card__title">${v.modelo}</h3>
          <div class="inv-card__meta">
            <span>${v.tipo}</span><i>·</i>
            <span>${v.transmision}</span><i>·</i>
            <span>${v.combustible}</span>
          </div>
          <div class="inv-card__foot">
            <span class="inv-card__price">${formatPrice(v)}</span>
            <span class="inv-card__arrow">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
          </div>
        </div>
      </a>`;
  }

  function applyFilters() {
    if (!grid || !hasData) return;
    const q = activeQuery.trim().toLowerCase();
    const list = VEHICULOS.filter(v => {
      const matchBrand = activeFilter === 'all' ||
        v.marca === activeFilter;
      if (!matchBrand) return false;
      if (!q) return true;
      const haystack = `${v.marca} ${v.modelo} ${v.tipo} ${v.ano} ${v.color || ''}`.toLowerCase();
      return haystack.includes(q);
    });
    const top = list.slice(0, 6);
    grid.innerHTML = top.length
      ? top.map(renderCard).join('')
      : `<p class="inv-empty">No encontramos vehículos para tu búsqueda. Intenta con otra marca o término.</p>`;
  }

  if (filtersWrap) {
    filtersWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.inv-chip');
      if (!btn) return;
      filtersWrap.querySelectorAll('.inv-chip').forEach(c => c.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  }

  if (queryInput) {
    queryInput.addEventListener('input', (e) => {
      activeQuery = e.target.value;
      applyFilters();
    });
  }

  applyFilters();

  /* ─── REVEAL ON SCROLL ───
     ScrollTrigger.batch agrupa los elementos que entran juntos en una sola
     animación (menos triggers, menos trabajo por frame). Solo transform/opacity. */
  if (hasGsap && !reduceMotion) {
    const reveal = (selector, { y = 36, stagger = 0.08, start = 'top 88%', duration = 0.9 } = {}) => {
      const els = gsap.utils.toArray(selector).filter(el => !el.dataset.revealed);
      if (!els.length) return;
      els.forEach(el => { el.dataset.revealed = '1'; });
      gsap.set(els, { autoAlpha: 0, y });
      ScrollTrigger.batch(els, {
        start,
        once: true,
        onEnter: batch => gsap.to(batch, {
          autoAlpha: 1, y: 0, duration, ease: 'power3.out', stagger,
          overwrite: true, clearProps: 'transform,visibility',
        }),
      });
    };

    // Hero: entrada escalonada al cargar
    gsap.from('.hero__badge, .hero__title, .hero__sub, .hero__search, .hero__cats', {
      y: 24, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.1,
      clearProps: 'transform,visibility',
    });
    gsap.from('.hero__circle', { scale: 0.6, autoAlpha: 0, duration: 1.1, ease: 'expo.out', delay: 0.15, clearProps: 'all' });

    // Hero: parallax suave al salir (scrub, solo transform)
    if (!isMobile) {
      gsap.to('.hero__slider-wrap', {
        yPercent: -18, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero__text', {
        y: -60, autoAlpha: 0.2, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true },
      });
    }

    reveal('.section-eyebrow, .section-display, .section-lede', { y: 32, stagger: 0.1 });
    reveal('.manifesto__block', { y: 50, start: 'top 85%' });
    reveal('.exp__card', { y: 40, stagger: 0.07, start: 'top 92%' });
    reveal('.showroom__info-row, .showroom__cta, .showroom__map', { y: 28, stagger: 0.06 });
    reveal('.concierge__card', { y: 30, stagger: 0.08, start: 'top 92%' });
    reveal('.footer-cinema__bigword, .footer-cinema__cta', { y: 40, stagger: 0.1, start: 'top 95%' });

    // Tarjetas del inventario: se re-renderizan al filtrar
    const revealCards = () => {
      reveal('.inv-card', { y: 30, stagger: 0.06, start: 'top 94%', duration: 0.7 });
    };
    revealCards();
    if (grid) {
      let refreshTimer;
      new MutationObserver(() => {
        revealCards();
        // El alto del grid cambió: recalcular posiciones de todos los triggers
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
      }).observe(grid, { childList: true });
    }

    // Recalcular cuando terminan de cargar fuentes (cambian alturas de texto)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }

  /* ─── PAUSAR ANIMACIONES FUERA DE PANTALLA ─── */
  const marquee = document.querySelector('.brands-marquee');
  if (marquee && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      marquee.classList.toggle('is-paused', !entry.isIntersecting);
    }).observe(marquee);
  }

  /* ─── 3D TILT (experience cards) · rAF + rect cacheado ─── */
  if (!reduceMotion && !isMobile) {
    const invalidators = [];
    document.querySelectorAll('[data-tilt]').forEach(el => {
      let rect = null;
      invalidators.push(() => { rect = null; });
      let frame = 0;
      let px = 0, py = 0;
      const apply = () => {
        frame = 0;
        el.style.transform = `perspective(1000px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg)`;
      };
      el.addEventListener('mouseenter', () => {
        rect = el.getBoundingClientRect();
        el.classList.add('is-tilting');
      });
      el.addEventListener('mousemove', (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        px = (e.clientX - rect.left) / rect.width - 0.5;
        py = (e.clientY - rect.top) / rect.height - 0.5;
        if (!frame) frame = requestAnimationFrame(apply);
      });
      el.addEventListener('mouseleave', () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        rect = null;
        el.classList.remove('is-tilting');
        el.style.transform = '';
      });
    });
    // La posición cambia al hacer scroll: invalidar el rect cacheado
    window.addEventListener('scroll', () => invalidators.forEach(fn => fn()), { passive: true });
  }
})();
