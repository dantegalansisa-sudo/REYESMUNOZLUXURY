/* ═══════════════════════════════════════════
   PAGE SHELL — injects navbar + footer + WhatsApp float
   for internal pages (favoritos, comparar, cita, etc.)
═══════════════════════════════════════════ */
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-shell="navbar"]')) {
      const nav = document.createElement('nav');
      nav.className = 'navbar navbar--floating navbar--solid';
      nav.id = 'navbar';
      nav.innerHTML = `
        <a href="index.html" class="navbar__logo">MATOS <span>DEALER</span></a>
        <div class="navbar__links">
          <a href="index.html#inventario">Inventario</a>
          <a href="comparar.html">Comparar</a>
          <a href="cita.html">Cita</a>
          <a href="valoracion.html">Valoración</a>
          <a href="favoritos.html" class="navbar__fav">
            Favoritos
            <span class="wish-counter-pill is-empty" data-wish-counter>0</span>
          </a>
        </div>
        <a href="https://wa.me/18293189380?text=Hola%2C%20escribo%20desde%20su%20sitio%20web%20%28https%3A%2F%2Fdealer-seven-blush.vercel.app%29%20y%20me%20gustar%C3%ADa%20conocer%20m%C3%A1s%20sobre%20los%20veh%C3%ADculos%20disponibles." class="navbar__cta" target="_blank" rel="noopener">
          <span>Contactar</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>`;
      const slot = document.querySelector('[data-shell="navbar"]');
      slot.replaceWith(nav);
    }

    if (document.querySelector('[data-shell="footer"]')) {
      const f = document.createElement('footer');
      f.className = 'footer-cinema';
      f.innerHTML = `
        <div class="footer-cinema__top">
          <h3 class="footer-cinema__bigword">Matos<br><em>Dealer</em>.</h3>
          <a href="https://wa.me/18293189380?text=Hola%2C%20escribo%20desde%20su%20sitio%20web%20%28https%3A%2F%2Fdealer-seven-blush.vercel.app%29%20y%20me%20gustar%C3%ADa%20conocer%20m%C3%A1s%20sobre%20los%20veh%C3%ADculos%20disponibles." class="footer-cinema__cta" target="_blank" rel="noopener">
            <span>Iniciar conversación</span>
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 16h20M20 8l8 8-8 8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
        <div class="footer-cinema__grid">
          <div>
            <span class="footer-cinema__label">Explorar</span>
            <ul>
              <li><a href="index.html#inventario">Inventario</a></li>
              <li><a href="comparar.html">Comparar vehículos</a></li>
              <li><a href="favoritos.html">Mis favoritos</a></li>
              <li><a href="editorial.html">Editorial</a></li>
              <li><a href="eventos.html">Eventos</a></li>
            </ul>
          </div>
          <div>
            <span class="footer-cinema__label">Servicios</span>
            <ul>
              <li><a href="cita.html">Agendar visita</a></li>
              <li><a href="valoracion.html">Valoración trade-in</a></li>
              <li><a href="club.html">Club Heritage</a></li>
              <li><a href="index.html#showroom">Showroom</a></li>
            </ul>
          </div>
          <div>
            <span class="footer-cinema__label">Contacto</span>
            <ul>
              <li><a href="https://wa.me/18293189380?text=Hola%2C%20escribo%20desde%20su%20sitio%20web%20%28https%3A%2F%2Fdealer-seven-blush.vercel.app%29%20y%20me%20gustar%C3%ADa%20conocer%20m%C3%A1s%20sobre%20los%20veh%C3%ADculos%20disponibles." target="_blank" rel="noopener">+1 (829) 318-9380</a></li>
              <li><a href="mailto:contacto@matosdealer.do">contacto@matosdealer.do</a></li>
              <li>Santo Domingo · D.N.</li>
            </ul>
          </div>
          <div>
            <span class="footer-cinema__label">Legal</span>
            <ul>
              <li><a href="privacidad.html">Privacidad</a></li>
              <li><a href="terminos.html">Términos</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-cinema__bottom">
          <p>&copy; 2026 Matos Dealer · Demo de referencia. Sitio no oficial.</p>
          <p>Diseño cinematográfico · República Dominicana</p>
        </div>`;
      document.querySelector('[data-shell="footer"]').replaceWith(f);
    }

    if (!document.querySelector('.whatsapp-float')) {
      const w = document.createElement('a');
      w.href = 'https://wa.me/18293189380?text=' + encodeURIComponent('Hola, escribo desde su sitio web (https://dealer-seven-blush.vercel.app) y me gustaría conocer más sobre los vehículos disponibles.');
      w.target = '_blank';
      w.rel = 'noopener';
      w.className = 'whatsapp-float';
      w.setAttribute('aria-label', 'Contactar por WhatsApp');
      w.innerHTML = `<svg viewBox="0 0 32 32"><path fill="#fff" d="M16.001 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.351.617 4.654 1.79 6.683L2.667 29.333l6.86-1.79A13.323 13.323 0 0 0 16 29.333c7.364 0 13.333-5.97 13.333-13.333S23.363 2.667 16 2.667zm0 24.4a11.04 11.04 0 0 1-5.626-1.539l-.404-.24-4.075 1.069 1.087-3.974-.263-.418A11.07 11.07 0 0 1 4.933 16C4.933 9.892 9.893 4.933 16 4.933s11.067 4.96 11.067 11.067-4.96 11.067-11.067 11.067zm6.07-8.293c-.333-.166-1.967-.97-2.272-1.082-.305-.111-.527-.166-.749.167s-.86 1.082-1.054 1.304c-.194.222-.388.25-.722.083-.333-.167-1.405-.519-2.677-1.654-.99-.882-1.659-1.97-1.853-2.303-.194-.333-.021-.514.146-.68.149-.149.333-.388.499-.583.166-.194.222-.333.333-.555.111-.222.056-.416-.028-.583-.084-.166-.749-1.804-1.027-2.471-.27-.65-.546-.563-.749-.573-.194-.01-.416-.012-.638-.012s-.583.083-.888.416c-.305.333-1.165 1.137-1.165 2.775s1.193 3.222 1.359 3.444c.166.222 2.348 3.585 5.687 5.026.795.343 1.415.547 1.898.7.798.254 1.524.218 2.098.132.64-.096 1.967-.804 2.244-1.582.277-.778.277-1.444.194-1.582-.083-.139-.305-.222-.638-.388z"/></svg>`;
      document.body.appendChild(w);
    }

    // Make solid navbar dark over any background
    document.body.classList.add('has-solid-nav');
  });
})();
