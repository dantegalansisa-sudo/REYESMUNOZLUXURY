// ═══════════════════════════════════════════
// VEHICULO.JS — Isidro Motors
// Vehicle detail: gallery, specs, WhatsApp CTA, similar
// ═══════════════════════════════════════════

// Reload on hash change so similar-vehicle links re-render the page
window.addEventListener('hashchange', function() {
  window.location.reload();
});

document.addEventListener('DOMContentLoaded', function() {

  // Hash-routing primary (?id= as fallback for legacy links)
  var hashId = parseInt((window.location.hash || '').replace('#', ''));
  var queryId = parseInt(new URLSearchParams(window.location.search).get('id'));
  var id = !isNaN(hashId) ? hashId : queryId;
  var vehiculo = null;

  for (var i = 0; i < VEHICULOS.length; i++) {
    if (VEHICULOS[i].id === id) {
      vehiculo = VEHICULOS[i];
      break;
    }
  }

  if (!vehiculo) {
    window.location.href = 'inventario.html';
    return;
  }

  // ─── Page Title ───
  document.title = vehiculo.marca + ' ' + vehiculo.modelo + ' ' + vehiculo.ano + ' — Matos Dealer';

  // ─── Breadcrumb ───
  document.getElementById('breadcrumbCurrent').textContent = vehiculo.marca + ' ' + vehiculo.modelo + ' ' + vehiculo.ano;

  // ─── Gallery ───
  var mainImg = document.getElementById('mainImage');
  mainImg.src = vehiculo.imagenes[0];
  mainImg.alt = vehiculo.marca + ' ' + vehiculo.modelo;

  var thumbs = document.getElementById('thumbStrip');
  thumbs.innerHTML = vehiculo.imagenes.map(function(img, i) {
    return '<img src="' + img + '" alt="Vista ' + (i + 1) + '" class="detail-thumb' + (i === 0 ? ' active' : '') + '" data-src="' + img + '" loading="lazy">';
  }).join('');

  thumbs.querySelectorAll('.detail-thumb').forEach(function(thumb) {
    thumb.addEventListener('click', function() {
      mainImg.src = this.getAttribute('data-src');
      thumbs.querySelectorAll('.detail-thumb').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // ─── Badges ───
  var badgesEl = document.getElementById('detailBadges');
  var badgesHtml = '';
  if (vehiculo.condicion === 'Nuevo') {
    badgesHtml += '<span class="detail-badge detail-badge--new">Nuevo</span>';
  } else {
    badgesHtml += '<span class="detail-badge detail-badge--used">Usado</span>';
  }
  if (vehiculo.enOferta) {
    badgesHtml += '<span class="detail-badge detail-badge--offer">Oferta Especial</span>';
  }
  badgesEl.innerHTML = badgesHtml;

  // ─── Title & Subtitle ───
  document.getElementById('detailTitle').textContent = vehiculo.marca + ' ' + vehiculo.modelo + ' ' + vehiculo.ano;
  document.getElementById('detailSubtitle').textContent = vehiculo.tipo + ' · ' + vehiculo.color + ' · ' + vehiculo.combustible;

  // ─── Price ───
  var priceOld = document.getElementById('detailPriceOld');
  var priceMain = document.getElementById('detailPrice');
  if (vehiculo.enOferta && vehiculo.precioAnterior) {
    priceOld.textContent = 'RD$ ' + vehiculo.precioAnterior.toLocaleString('es-DO');
    priceOld.style.display = '';
  } else {
    priceOld.style.display = 'none';
  }
  priceMain.textContent = vehiculo.precioConsultar ? 'Consultar Precio' : 'RD$ ' + vehiculo.precio.toLocaleString('es-DO');

  // ─── Quick Specs ───
  document.getElementById('qsAno').textContent = vehiculo.ano;
  document.getElementById('qsKm').textContent = vehiculo.kilometraje > 0 ? vehiculo.kilometraje.toLocaleString('es-DO') + ' km' : '0 km';
  document.getElementById('qsFuel').textContent = vehiculo.combustible;
  document.getElementById('qsTrans').textContent = vehiculo.transmision;

  // ─── Description ───
  document.getElementById('detailDesc').textContent = vehiculo.descripcion;

  // ─── Specs Table ───
  var specs = [
    ['Marca', vehiculo.marca],
    ['Modelo', vehiculo.modelo],
    ['Año', vehiculo.ano],
    ['Tipo', vehiculo.tipo],
    ['Condición', vehiculo.condicion],
    ['Kilometraje', vehiculo.kilometraje > 0 ? vehiculo.kilometraje.toLocaleString('es-DO') + ' km' : '0 km (Nuevo)'],
    ['Combustible', vehiculo.combustible],
    ['Transmisión', vehiculo.transmision],
    ['Color', vehiculo.color]
  ];
  document.getElementById('specsTable').innerHTML = specs.map(function(s) {
    return '<tr><td class="spec-label">' + s[0] + '</td><td class="spec-value">' + s[1] + '</td></tr>';
  }).join('');

  // ─── Features List ───
  var featuresEl = document.getElementById('featuresList');
  if (vehiculo.caracteristicas && vehiculo.caracteristicas.length) {
    featuresEl.innerHTML = vehiculo.caracteristicas.map(function(f) {
      return '<li>' + f + '</li>';
    }).join('');
  } else {
    featuresEl.parentElement.style.display = 'none';
  }

  // ─── WhatsApp CTA ───
  document.getElementById('whatsappCTA').href = buildWhatsAppLink(vehiculo);
  document.getElementById('callCTA').href = 'tel:+18296806829';

  // ─── Social Proof ───
  var viewers = Math.floor(Math.random() * 8) + 2;
  document.getElementById('viewerCount').textContent = viewers + ' personas viendo este vehículo ahora';

  // ─── Similar Vehicles ───
  var similar = VEHICULOS.filter(function(v) {
    return v.id !== vehiculo.id && (v.tipo === vehiculo.tipo || v.marca === vehiculo.marca);
  }).slice(0, 4);

  var similarGrid = document.getElementById('similarGrid');
  if (similar.length > 0) {
    similarGrid.innerHTML = similar.map(function(v, i) {
      return renderVehicleCard(v, i);
    }).join('');
  } else {
    document.getElementById('similarSection').style.display = 'none';
  }

});