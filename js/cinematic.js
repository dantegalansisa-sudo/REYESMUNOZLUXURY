/* ═══════════════════════════════════════════
   MATOS DEALER · CINEMATIC ENGINE v2
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

  /* ─── LENIS SMOOTH SCROLL (lightweight) ─── */
  let lenis;
  if (!reduceMotion && !isMobile && window.Lenis) {
    lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

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

  /* ─── GSAP ScrollTrigger sync ─── */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ─── NAVBAR SCROLL STATE ─── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 80);
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
    if (!grid || typeof VEHICULOS === 'undefined') return;
    const q = activeQuery.trim().toLowerCase();
    const list = VEHICULOS.filter(v => {
      const matchBrand = activeFilter === 'all' ||
        v.marca.toLowerCase().includes(activeFilter.toLowerCase());
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

  /* ─── REVEAL ON SCROLL ─── */
  if (window.gsap && window.ScrollTrigger) {
    gsap.utils.toArray('.section-display, .section-eyebrow, .section-lede').forEach(el => {
      gsap.fromTo(el,
        { y: 32, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.95, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
      );
    });

    gsap.utils.toArray('.manifesto__block').forEach(el => {
      gsap.fromTo(el,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true }
        }
      );
    });

    gsap.utils.toArray('.exp__card').forEach((el, i) => {
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          delay: (i % 3) * 0.06,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        }
      );
    });

    // Inventory cards reveal
    const observer = new MutationObserver(() => {
      gsap.utils.toArray('.inv-card').forEach((el, i) => {
        if (el.dataset.revealed) return;
        el.dataset.revealed = '1';
        gsap.fromTo(el,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
            delay: (i % 3) * 0.05,
            scrollTrigger: { trigger: el, start: 'top 92%', once: true }
          }
        );
      });
    });
    if (grid) observer.observe(grid, { childList: true });
    // Initial trigger for cards already there
    gsap.utils.toArray('.inv-card').forEach((el, i) => {
      el.dataset.revealed = '1';
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          delay: (i % 3) * 0.05,
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        }
      );
    });
  }

  /* ─── 3D TILT (experience cards) ─── */
  if (!reduceMotion && !isMobile) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }
})();
