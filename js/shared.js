// ═══════════════════════════════════════════
// SHARED.JS — Isidro Motors
// Navbar, mobile menu, scroll reveal, smooth scroll
// ═══════════════════════════════════════════

// ─── Global Helpers (available immediately) ───

window.formatPrecio = function(vehiculo) {
  if (vehiculo.precioConsultar) return 'Consultar Precio';
  return 'RD$ ' + vehiculo.precio.toLocaleString('es-DO');
};

window.buildWhatsAppLink = function(vehiculo) {
  var price = (vehiculo.precio && !vehiculo.precioConsultar) ? ' (RD$ ' + vehiculo.precio.toLocaleString('es-DO') + ')' : '';
  var msg = encodeURIComponent(
    'Hola, escribo desde su sitio web (https://dealer-seven-blush.vercel.app) y me interesa el ' +
    vehiculo.marca + ' ' + vehiculo.modelo + ' ' + vehiculo.ano + price +
    '. ¿Tiene disponibilidad?'
  );
  return 'https://wa.me/18293189380?text=' + msg;
};

window.renderVehicleCard = function(v, index) {
  var delay = (index % 12) * 0.05;
  var badges = '';
  if (v.condicion === 'Nuevo') {
    badges += '<span class="inv-badge inv-badge--new">Nuevo</span>';
  } else {
    badges += '<span class="inv-badge inv-badge--used">Usado</span>';
  }
  if (v.enOferta) {
    badges += '<span class="inv-badge inv-badge--offer" style="left:auto;right:12px">Oferta</span>';
  }

  var priceHtml = '';
  if (v.enOferta && v.precioAnterior) {
    priceHtml += '<s style="color:var(--color-text-muted);font-size:0.85rem;margin-right:8px">RD$ ' + v.precioAnterior.toLocaleString('es-DO') + '</s>';
  }
  priceHtml += formatPrecio(v);

  return '<a class="featured__card" href="vehiculo.html#' + v.id + '" style="animation: fadeUp 0.4s ease ' + delay + 's forwards; opacity:0; text-decoration:none; color:inherit; display:block">' +
    '<div style="overflow:hidden; position:relative">' +
      '<img src="' + v.imagenes[0] + '" alt="' + v.marca + ' ' + v.modelo + '" class="featured__card-img" loading="lazy">' +
      badges +
      '<button class="wish-btn" data-wish-id="' + v.id + '" aria-label="Guardar en favoritos">' +
        '<svg viewBox="0 0 24 24"><path class="wish-fill wish-stroke" stroke="currentColor" stroke-width="1.6" fill="none" d="M12 21s-7-4.534-7-10a4.5 4.5 0 0 1 8-2.83A4.5 4.5 0 0 1 19 11c0 5.466-7 10-7 10z"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="featured__card-body">' +
      '<span class="featured__card-tag">' + v.tipo + ' · ' + v.ano + '</span>' +
      '<h3 class="featured__card-title">' + v.marca + ' ' + v.modelo + '</h3>' +
      '<p class="featured__card-desc">' + (v.kilometraje > 0 ? v.kilometraje.toLocaleString('es-DO') + ' km · ' : '0 km · ') + v.combustible + ' · ' + v.transmision + '</p>' +
      '<p class="featured__card-price">' + priceHtml + '</p>' +
    '</div>' +
  '</a>';
};

// ─── DOM-dependent setup ───

document.addEventListener('DOMContentLoaded', function() {

  // ─── Navbar Scroll Effect ───
  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function() {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ─── Mobile Menu Toggle ───
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', function() {
      burger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        burger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── Scroll Reveal Animations ───
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(function(el) {
    revealObserver.observe(el);
  });

  // Expose observer globally so dynamic content can use it
  window.revealObserver = revealObserver;

  // ─── Smooth Scroll for Anchor Links ───
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var navbarEl = document.getElementById('navbar');
        var offset = navbarEl ? navbarEl.offsetHeight + 20 : 92;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

});