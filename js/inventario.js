// ═══════════════════════════════════════════
// INVENTARIO.JS — Isidro Motors
// Filter engine, search, sort, pagination
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {

  var ITEMS_PER_PAGE = 12;
  var currentPage = 1;
  var filteredVehicles = [];

  // State
  var state = {
    search: '',
    condicion: [],
    marcas: [],
    tipos: [],
    combustibles: [],
    transmisiones: [],
    yearFrom: null,
    yearTo: null,
    priceFrom: null,
    priceTo: null,
    sort: 'recientes'
  };

  // ─── Read URL params on load ───
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('buscar')) {
    state.search = urlParams.get('buscar');
    document.getElementById('searchInput').value = state.search;
  }
  if (urlParams.get('marca')) {
    state.marcas = urlParams.get('marca').split(',');
  }
  if (urlParams.get('tipo')) {
    state.tipos = urlParams.get('tipo').split(',');
  }

  // ─── Populate Dynamic Filters ───
  function populateFilters() {
    // Brands
    var brandContainer = document.getElementById('brandFilters');
    brandContainer.innerHTML = MARCAS_DISPONIBLES.map(function(m) {
      var count = VEHICULOS.filter(function(v) { return v.marca === m; }).length;
      return '<label class="inv-checkbox"><input type="checkbox" value="' + m + '" name="marca"' +
        (state.marcas.includes(m) ? ' checked' : '') + '> ' + m +
        '<span class="inv-checkbox__count">' + count + '</span></label>';
    }).join('');

    // Types
    var typeContainer = document.getElementById('typeFilters');
    typeContainer.innerHTML = TIPOS_DISPONIBLES.map(function(t) {
      var count = VEHICULOS.filter(function(v) { return v.tipo === t; }).length;
      return '<label class="inv-checkbox"><input type="checkbox" value="' + t + '" name="tipo"' +
        (state.tipos.includes(t) ? ' checked' : '') + '> ' + t +
        '<span class="inv-checkbox__count">' + count + '</span></label>';
    }).join('');

    // Fuel
    var fuelContainer = document.getElementById('fuelFilters');
    fuelContainer.innerHTML = COMBUSTIBLES_DISPONIBLES.map(function(f) {
      return '<label class="inv-checkbox"><input type="checkbox" value="' + f + '" name="combustible"> ' + f + '</label>';
    }).join('');

    // Years
    var yearFrom = document.getElementById('yearFrom');
    var yearTo = document.getElementById('yearTo');
    yearFrom.innerHTML = '<option value="">Desde</option>' + ANOS_DISPONIBLES.map(function(y) {
      return '<option value="' + y + '">' + y + '</option>';
    }).join('');
    yearTo.innerHTML = '<option value="">Hasta</option>' + ANOS_DISPONIBLES.map(function(y) {
      return '<option value="' + y + '">' + y + '</option>';
    }).join('');

    // Price ranges
    var priceRanges = [500000, 800000, 1000000, 1200000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000];
    var priceFrom = document.getElementById('priceFrom');
    var priceTo = document.getElementById('priceTo');
    priceFrom.innerHTML = '<option value="">Mínimo</option>' + priceRanges.map(function(p) {
      return '<option value="' + p + '">RD$ ' + p.toLocaleString('es-DO') + '</option>';
    }).join('');
    priceTo.innerHTML = '<option value="">Máximo</option>' + priceRanges.map(function(p) {
      return '<option value="' + p + '">RD$ ' + p.toLocaleString('es-DO') + '</option>';
    }).join('');
  }

  // ─── Apply Filters ───
  function applyFilters() {
    filteredVehicles = VEHICULOS.filter(function(v) {
      // Text search
      if (state.search) {
        var q = state.search.toLowerCase();
        var searchable = (v.marca + ' ' + v.modelo + ' ' + v.tipo + ' ' + v.descripcion + ' ' + v.ano + ' ' + v.color).toLowerCase();
        if (searchable.indexOf(q) === -1) return false;
      }
      // Checkbox filters
      if (state.condicion.length && state.condicion.indexOf(v.condicion) === -1) return false;
      if (state.marcas.length && state.marcas.indexOf(v.marca) === -1) return false;
      if (state.tipos.length && state.tipos.indexOf(v.tipo) === -1) return false;
      if (state.combustibles.length && state.combustibles.indexOf(v.combustible) === -1) return false;
      if (state.transmisiones.length && state.transmisiones.indexOf(v.transmision) === -1) return false;
      // Range filters
      if (state.yearFrom && v.ano < state.yearFrom) return false;
      if (state.yearTo && v.ano > state.yearTo) return false;
      if (state.priceFrom && (v.precioConsultar || v.precio < state.priceFrom)) return false;
      if (state.priceTo && (v.precioConsultar || v.precio > state.priceTo)) return false;
      return true;
    });

    applySort();
    currentPage = 1;
    renderGrid();
    renderActiveChips();
    updateCount();
    updateURL();
  }

  // ─── Sort ───
  function applySort() {
    var s = state.sort;
    filteredVehicles.sort(function(a, b) {
      switch (s) {
        case 'precio-asc': return (a.precioConsultar ? Infinity : a.precio) - (b.precioConsultar ? Infinity : b.precio);
        case 'precio-desc': return (b.precioConsultar ? 0 : b.precio) - (a.precioConsultar ? 0 : a.precio);
        case 'ano-desc': return b.ano - a.ano;
        case 'ano-asc': return a.ano - b.ano;
        case 'marca-az': return a.marca.localeCompare(b.marca);
        case 'recientes':
        default: return new Date(b.fechaAgregado) - new Date(a.fechaAgregado);
      }
    });
  }

  // ─── Render Grid ───
  function renderGrid() {
    var grid = document.getElementById('vehicleGrid');
    var visible = filteredVehicles.slice(0, currentPage * ITEMS_PER_PAGE);

    grid.innerHTML = visible.map(function(v, i) {
      return renderVehicleCard(v, i);
    }).join('');

    // Show/hide load more
    var hasMore = filteredVehicles.length > currentPage * ITEMS_PER_PAGE;
    document.getElementById('pagination').style.display = hasMore ? '' : 'none';

    // Show/hide empty state
    var empty = document.getElementById('emptyState');
    empty.style.display = filteredVehicles.length === 0 ? '' : 'none';
    grid.style.display = filteredVehicles.length === 0 ? 'none' : '';
  }

  // ─── Update Count ───
  function updateCount() {
    var shown = Math.min(currentPage * ITEMS_PER_PAGE, filteredVehicles.length);
    document.getElementById('resultCount').textContent =
      'Mostrando ' + shown + ' de ' + filteredVehicles.length + ' vehículos';
  }

  // ─── Active Filter Chips ───
  function renderActiveChips() {
    var chips = [];

    state.condicion.forEach(function(c) {
      chips.push({ label: c, type: 'condicion', value: c });
    });
    state.marcas.forEach(function(m) {
      chips.push({ label: m, type: 'marcas', value: m });
    });
    state.tipos.forEach(function(t) {
      chips.push({ label: t, type: 'tipos', value: t });
    });
    state.combustibles.forEach(function(f) {
      chips.push({ label: f, type: 'combustibles', value: f });
    });
    state.transmisiones.forEach(function(t) {
      chips.push({ label: t, type: 'transmisiones', value: t });
    });
    if (state.yearFrom) chips.push({ label: 'Desde ' + state.yearFrom, type: 'yearFrom', value: null });
    if (state.yearTo) chips.push({ label: 'Hasta ' + state.yearTo, type: 'yearTo', value: null });
    if (state.priceFrom) chips.push({ label: 'Min RD$ ' + parseInt(state.priceFrom).toLocaleString('es-DO'), type: 'priceFrom', value: null });
    if (state.priceTo) chips.push({ label: 'Max RD$ ' + parseInt(state.priceTo).toLocaleString('es-DO'), type: 'priceTo', value: null });
    if (state.search) chips.push({ label: '"' + state.search + '"', type: 'search', value: null });

    var container = document.getElementById('activeFilters');
    container.innerHTML = chips.map(function(chip, i) {
      return '<span class="inv-chip" data-index="' + i + '" data-type="' + chip.type + '" data-value="' + (chip.value || '') + '">' +
        chip.label + ' <span class="inv-chip__x">&times;</span></span>';
    }).join('');

    // Click handler for chips
    container.querySelectorAll('.inv-chip').forEach(function(chipEl) {
      chipEl.addEventListener('click', function() {
        var type = this.getAttribute('data-type');
        var value = this.getAttribute('data-value');

        if (type === 'search') {
          state.search = '';
          document.getElementById('searchInput').value = '';
          document.getElementById('searchClear').style.display = 'none';
        } else if (type === 'yearFrom') {
          state.yearFrom = null;
          document.getElementById('yearFrom').value = '';
        } else if (type === 'yearTo') {
          state.yearTo = null;
          document.getElementById('yearTo').value = '';
        } else if (type === 'priceFrom') {
          state.priceFrom = null;
          document.getElementById('priceFrom').value = '';
        } else if (type === 'priceTo') {
          state.priceTo = null;
          document.getElementById('priceTo').value = '';
        } else {
          // Array-based filters
          var idx = state[type].indexOf(value);
          if (idx > -1) state[type].splice(idx, 1);
          // Uncheck the corresponding checkbox
          var checkboxName = { condicion: 'condicion', marcas: 'marca', tipos: 'tipo', combustibles: 'combustible', transmisiones: 'transmision' }[type];
          if (checkboxName) {
            var cb = document.querySelector('input[name="' + checkboxName + '"][value="' + value + '"]');
            if (cb) cb.checked = false;
          }
        }
        applyFilters();
      });
    });
  }

  // ─── URL State ───
  function updateURL() {
    var params = new URLSearchParams();
    if (state.search) params.set('buscar', state.search);
    if (state.marcas.length) params.set('marca', state.marcas.join(','));
    if (state.tipos.length) params.set('tipo', state.tipos.join(','));
    if (state.sort !== 'recientes') params.set('orden', state.sort);
    var newURL = params.toString() ? '?' + params.toString() : window.location.pathname;
    history.replaceState(null, '', newURL);
  }

  // ─── Search Input ───
  var searchTimeout;
  document.getElementById('searchInput').addEventListener('input', function(e) {
    clearTimeout(searchTimeout);
    var clearBtn = document.getElementById('searchClear');
    clearBtn.style.display = e.target.value ? '' : 'none';
    searchTimeout = setTimeout(function() {
      state.search = e.target.value.trim();
      applyFilters();
    }, 300);
  });

  document.getElementById('searchClear').addEventListener('click', function() {
    document.getElementById('searchInput').value = '';
    this.style.display = 'none';
    state.search = '';
    applyFilters();
  });

  // ─── Load More ───
  document.getElementById('loadMoreBtn').addEventListener('click', function() {
    currentPage++;
    renderGrid();
    updateCount();
  });

  // ─── Sort ───
  document.getElementById('sortSelect').addEventListener('change', function(e) {
    state.sort = e.target.value;
    applyFilters();
  });

  // ─── Filter Checkboxes (event delegation) ───
  document.getElementById('filterSidebar').addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') {
      var name = e.target.name;
      var value = e.target.value;
      var stateKey = { marca: 'marcas', condicion: 'condicion', tipo: 'tipos', combustible: 'combustibles', transmision: 'transmisiones' }[name];
      if (stateKey) {
        if (e.target.checked) {
          state[stateKey].push(value);
        } else {
          state[stateKey] = state[stateKey].filter(function(v) { return v !== value; });
        }
        applyFilters();
      }
    }
    // Selects (year, price)
    if (e.target.tagName === 'SELECT' || e.target.type === 'select-one') return;
  });

  // Year and price selects
  document.getElementById('yearFrom').addEventListener('change', function() {
    state.yearFrom = this.value ? parseInt(this.value) : null;
    applyFilters();
  });
  document.getElementById('yearTo').addEventListener('change', function() {
    state.yearTo = this.value ? parseInt(this.value) : null;
    applyFilters();
  });
  document.getElementById('priceFrom').addEventListener('change', function() {
    state.priceFrom = this.value ? parseInt(this.value) : null;
    applyFilters();
  });
  document.getElementById('priceTo').addEventListener('change', function() {
    state.priceTo = this.value ? parseInt(this.value) : null;
    applyFilters();
  });

  // ─── Reset Filters ───
  function resetAll() {
    state.search = '';
    state.condicion = [];
    state.marcas = [];
    state.tipos = [];
    state.combustibles = [];
    state.transmisiones = [];
    state.yearFrom = null;
    state.yearTo = null;
    state.priceFrom = null;
    state.priceTo = null;
    state.sort = 'recientes';

    document.getElementById('searchInput').value = '';
    document.getElementById('searchClear').style.display = 'none';
    document.getElementById('sortSelect').value = 'recientes';
    document.getElementById('yearFrom').value = '';
    document.getElementById('yearTo').value = '';
    document.getElementById('priceFrom').value = '';
    document.getElementById('priceTo').value = '';
    document.querySelectorAll('.inv-filters input[type="checkbox"]').forEach(function(cb) {
      cb.checked = false;
    });
    applyFilters();
  }

  document.getElementById('resetFilters').addEventListener('click', resetAll);
  document.getElementById('emptyReset').addEventListener('click', resetAll);

  // ─── Mobile Filter Toggle ───
  var sidebar = document.getElementById('filterSidebar');
  var overlay = document.getElementById('filtersOverlay');

  function openFilters() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeFilters() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('mobileFilterToggle').addEventListener('click', openFilters);
  document.getElementById('filtersClose').addEventListener('click', closeFilters);
  overlay.addEventListener('click', closeFilters);

  // ─── Initialize ───
  populateFilters();
  applyFilters();

});
