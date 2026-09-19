var API = '/api';
var state = { artworks: [], categories: { subjects: [], availabilities: [], sizeCategories: [] }, flags: {}, hero: [], instagram: {} };

// Traccia se l'ordine è stato modificato ma non ancora salvato
var sortDirty = false;

document.addEventListener('DOMContentLoaded', function () {
  initTabs();
  initModal();
  initCategoryForms();
  initFlagToggles();
  initUpload();
  initHero();
  initInstagramConfig();
  initSortGrid();
  loadAll();
});

function initTabs() {
  var buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var panels = document.querySelectorAll('.tab-panel');
      panels.forEach(function (p) { p.classList.remove('active'); });
      var target = document.getElementById('tab-' + btn.dataset.tab);
      if (target) target.classList.add('active');
      // Aggiorna la griglia di ordinamento quando si apre quel tab
      if (btn.dataset.tab === 'ordinamento') {
        renderSortGrid();
      }
    });
  });
}

function loadAll() {
  fetch(API + '/artworks').then(function (r) { return r.json(); }).then(function (data) {
    state.artworks = data;
    renderArtworksTable();
  });
  fetch(API + '/categories').then(function (r) { return r.json(); }).then(function (data) {
    state.categories = data;
    renderCategoryLists();
    fillSelectOptions();
  });
  fetch(API + '/flags').then(function (r) { return r.json(); }).then(function (data) {
    state.flags = data;
    document.getElementById('flag-bio').checked = !!data.enableBio;
    document.getElementById('flag-contact').checked = !!data.enableContact;
    document.getElementById('flag-instagram').checked = !!data.enableInstagramFeed;
  });
}

function renderArtworksTable() {
  var tbody = document.getElementById('artworks-tbody');
  tbody.innerHTML = '';
  state.artworks.forEach(function (a) {
    var tr = document.createElement('tr');

    var tdTitle = document.createElement('td');
    tdTitle.textContent = a.title;
    tr.appendChild(tdTitle);

    var tdSubject = document.createElement('td');
    tdSubject.textContent = a.subject;
    tr.appendChild(tdSubject);

    var tdDimensions = document.createElement('td');
    tdDimensions.textContent = a.dimensions;
    tr.appendChild(tdDimensions);

    var tdPrice = document.createElement('td');
    tdPrice.textContent = a.priceDisplay || '';
    tr.appendChild(tdPrice);

    var tdAvailability = document.createElement('td');
    tdAvailability.textContent = a.availability;
    tr.appendChild(tdAvailability);

    var tdActions = document.createElement('td');
    var editBtn = document.createElement('button');
    editBtn.className = 'btn btn-outline';
    editBtn.textContent = 'Modifica';
    editBtn.style.marginRight = '8px';
    editBtn.addEventListener('click', function () { openEditModal(a); });
    var delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger';
    delBtn.textContent = 'Elimina';
    delBtn.addEventListener('click', function () { deleteArtwork(a.id); });
    tdActions.appendChild(editBtn);
    tdActions.appendChild(delBtn);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
}

function fillSelectOptions() {
  fillSelect('field-subject', state.categories.subjects);
  fillSelect('field-availability', state.categories.availabilities);
  fillSelect('field-sizecategory', state.categories.sizeCategories);
}

function fillSelect(id, values) {
  var select = document.getElementById(id);
  select.innerHTML = '';
  values.forEach(function (v) {
    var opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

function initModal() {
  var modal = document.getElementById('artwork-modal');
  document.getElementById('btn-new-artwork').addEventListener('click', function () {
    openNewModal();
  });
  document.getElementById('btn-cancel').addEventListener('click', function () {
    modal.classList.add('hidden');
  });
  document.getElementById('artwork-form').addEventListener('submit', function (e) {
    e.preventDefault();
    saveArtwork();
  });
}

function openNewModal() {
  document.getElementById('modal-title').textContent = 'Nuova opera';
  document.getElementById('field-id').value = '';
  document.getElementById('field-title').value = '';
  document.getElementById('field-dimensions').value = '';
  document.getElementById('field-price').value = '';
  document.getElementById('field-pricedisplay').value = '';
  document.getElementById('field-description').value = '';
  document.getElementById('field-images').value = '';
  document.getElementById('field-orientation').value = 'square';
  document.getElementById('upload-status').textContent = '';
  document.getElementById('artwork-modal').classList.remove('hidden');
}

function openEditModal(artwork) {
  document.getElementById('modal-title').textContent = 'Modifica opera';
  document.getElementById('field-id').value = artwork.id;
  document.getElementById('field-title').value = artwork.title;
  document.getElementById('field-subject').value = artwork.subject;
  document.getElementById('field-availability').value = artwork.availability;
  document.getElementById('field-sizecategory').value = artwork.sizeCategory;
  document.getElementById('field-orientation').value = artwork.orientation;
  document.getElementById('field-dimensions').value = artwork.dimensions;
  document.getElementById('field-price').value = artwork.price || '';
  document.getElementById('field-pricedisplay').value = artwork.priceDisplay || '';
  document.getElementById('field-description').value = artwork.description;
  document.getElementById('field-images').value = (artwork.images || []).join('\n');
  document.getElementById('upload-status').textContent = '';
  document.getElementById('artwork-modal').classList.remove('hidden');
}

function initUpload() {
  var input = document.getElementById('field-image-upload');
  input.addEventListener('change', function () {
    if (!input.files || input.files.length === 0) return;
    var file = input.files[0];
    var formData = new FormData();
    formData.append('image', file);

    var statusEl = document.getElementById('upload-status');
    statusEl.textContent = 'Caricamento in corso...';

    fetch(API + '/upload', { method: 'POST', body: formData })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var textarea = document.getElementById('field-images');
        var current = textarea.value.trim();
        textarea.value = current ? current + '\n' + data.path : data.path;
        statusEl.textContent = 'Immagine caricata: ' + data.path;
        input.value = '';
      })
      .catch(function () {
        statusEl.textContent = 'Errore durante il caricamento.';
      });
  });
}

function saveArtwork() {
  var id = document.getElementById('field-id').value;
  var imagesRaw = document.getElementById('field-images').value.split('\n');
  var images = imagesRaw
    .map(function (line) { return line.trim(); })
    .filter(function (line) { return line.length > 0; });

  var payload = {
    title: document.getElementById('field-title').value,
    subject: document.getElementById('field-subject').value,
    availability: document.getElementById('field-availability').value,
    sizeCategory: document.getElementById('field-sizecategory').value,
    orientation: document.getElementById('field-orientation').value,
    dimensions: document.getElementById('field-dimensions').value,
    price: parseFloat(document.getElementById('field-price').value) || 0,
    priceDisplay: document.getElementById('field-pricedisplay').value,
    description: document.getElementById('field-description').value,
    images: images
  };

  var request;
  if (id) {
    request = fetch(API + '/artworks/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } else {
    request = fetch(API + '/artworks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  request.then(function () {
    document.getElementById('artwork-modal').classList.add('hidden');
    loadAll();
  });
}

function deleteArtwork(id) {
  if (!confirm('Eliminare questa opera?')) return;
  fetch(API + '/artworks/' + id, { method: 'DELETE' }).then(function () {
    loadAll();
  });
}

// =====================================================================
// ORDINAMENTO DRAG & DROP
// =====================================================================
var dragSrcEl = null;

function initSortGrid() {
  document.getElementById('btn-save-order').addEventListener('click', saveOrder);
}

function renderSortGrid() {
  var grid = document.getElementById('sort-grid');
  grid.innerHTML = '';
  sortDirty = false;
  updateSortUI();

  state.artworks.forEach(function (artwork, index) {
    var card = document.createElement('div');
    card.className = 'sort-card';
    card.draggable = true;
    card.dataset.id = artwork.id;
    card.dataset.index = index;

    // Thumbnail
    var img = document.createElement('div');
    img.className = 'sort-card-thumb';
    if (artwork.cover || (artwork.images && artwork.images[0])) {
      img.style.backgroundImage = 'url(' + (artwork.cover || artwork.images[0]) + ')';
    } else {
      img.style.background = '#e6ddc4';
    }
    card.appendChild(img);

    // Info
    var info = document.createElement('div');
    info.className = 'sort-card-info';

    var pos = document.createElement('span');
    pos.className = 'sort-card-pos';
    pos.textContent = (index + 1);
    info.appendChild(pos);

    var title = document.createElement('span');
    title.className = 'sort-card-title';
    title.textContent = artwork.title;
    info.appendChild(title);

    card.appendChild(info);

    // Drag handle hint
    var handle = document.createElement('div');
    handle.className = 'sort-card-handle';
    handle.innerHTML = '&#9776;';
    card.appendChild(handle);

    // Drag events
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('dragenter', handleDragEnter);
    card.addEventListener('dragleave', handleDragLeave);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragend', handleDragEnd);

    // Touch support
    card.addEventListener('touchstart', handleTouchStart, { passive: false });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd);

    grid.appendChild(card);
  });
}

function handleDragStart(e) {
  dragSrcEl = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  this.classList.add('drag-over');
}

function handleDragLeave() {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.stopPropagation();
  e.preventDefault();
  this.classList.remove('drag-over');

  if (dragSrcEl !== this) {
    var grid = document.getElementById('sort-grid');
    var cards = Array.from(grid.children);
    var fromIndex = cards.indexOf(dragSrcEl);
    var toIndex = cards.indexOf(this);

    // Sposta nell'array state
    var moved = state.artworks.splice(fromIndex, 1)[0];
    state.artworks.splice(toIndex, 0, moved);

    // Ri-renderizza
    renderSortGrid();
    sortDirty = true;
    updateSortUI();
  }
}

function handleDragEnd() {
  var cards = document.querySelectorAll('.sort-card');
  cards.forEach(function (c) {
    c.classList.remove('dragging');
    c.classList.remove('drag-over');
  });
}

// ---- Touch drag support (mobile) ----
var touchSrcEl = null;
var touchClone = null;
var touchStartY = 0;
var touchStartX = 0;

function handleTouchStart(e) {
  touchSrcEl = this;
  var touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;

  // Creiamo un clone visuale dopo un breve delay per distinguere tap da drag
  var self = this;
  this._touchTimeout = setTimeout(function () {
    self.classList.add('dragging');
    touchClone = self.cloneNode(true);
    touchClone.className = 'sort-card-ghost';
    touchClone.style.width = self.offsetWidth + 'px';
    document.body.appendChild(touchClone);
    positionGhost(touch.clientX, touch.clientY);
  }, 150);
}

function handleTouchMove(e) {
  if (!touchSrcEl) return;
  e.preventDefault();
  var touch = e.touches[0];

  if (touchClone) {
    positionGhost(touch.clientX, touch.clientY);
  }

  // Trova l'elemento sotto il dito
  if (touchClone) touchClone.style.display = 'none';
  var target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (touchClone) touchClone.style.display = '';

  // Risali fino alla .sort-card
  while (target && !target.classList.contains('sort-card')) {
    target = target.parentElement;
  }

  var cards = document.querySelectorAll('.sort-card');
  cards.forEach(function (c) { c.classList.remove('drag-over'); });
  if (target && target !== touchSrcEl) {
    target.classList.add('drag-over');
  }
}

function handleTouchEnd(e) {
  clearTimeout(this._touchTimeout);
  if (!touchSrcEl) return;

  // Trova dove abbiamo droppato
  var touch = e.changedTouches[0];
  if (touchClone) touchClone.style.display = 'none';
  var target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (touchClone) {
    document.body.removeChild(touchClone);
    touchClone = null;
  }

  while (target && !target.classList.contains('sort-card')) {
    target = target.parentElement;
  }

  if (target && target !== touchSrcEl) {
    var grid = document.getElementById('sort-grid');
    var cards = Array.from(grid.children);
    var fromIndex = cards.indexOf(touchSrcEl);
    var toIndex = cards.indexOf(target);

    var moved = state.artworks.splice(fromIndex, 1)[0];
    state.artworks.splice(toIndex, 0, moved);
    renderSortGrid();
    sortDirty = true;
    updateSortUI();
  }

  var allCards = document.querySelectorAll('.sort-card');
  allCards.forEach(function (c) {
    c.classList.remove('dragging');
    c.classList.remove('drag-over');
  });
  touchSrcEl = null;
}

function positionGhost(x, y) {
  if (!touchClone) return;
  touchClone.style.left = (x - 60) + 'px';
  touchClone.style.top = (y - 40) + 'px';
}

function updateSortUI() {
  var btn = document.getElementById('btn-save-order');
  var status = document.getElementById('sort-status');
  btn.disabled = !sortDirty;
  status.textContent = sortDirty ? 'Modifiche non salvate' : '';
  status.className = 'sort-status' + (sortDirty ? ' unsaved' : '');
}

function saveOrder() {
  var btn = document.getElementById('btn-save-order');
  var status = document.getElementById('sort-status');
  btn.disabled = true;
  status.textContent = 'Salvataggio...';
  status.className = 'sort-status';

  var payload = state.artworks.map(function (a, idx) {
    return { id: a.id, sortOrder: idx };
  });

  fetch(API + '/artworks/reorder', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        sortDirty = false;
        status.textContent = 'Ordinamento salvato!';
        status.className = 'sort-status saved';
        // Aggiorna sortOrder locale
        state.artworks.forEach(function (a, idx) { a.sortOrder = idx; });
        renderSortGrid();
        setTimeout(function () {
          status.textContent = '';
          status.className = 'sort-status';
        }, 2500);
      } else {
        status.textContent = 'Errore: ' + (data.error || 'sconosciuto');
        status.className = 'sort-status unsaved';
        btn.disabled = false;
      }
    })
    .catch(function () {
      status.textContent = 'Errore di rete.';
      status.className = 'sort-status unsaved';
      btn.disabled = false;
    });
}

// =====================================================================
// CATEGORIE
// =====================================================================
function renderCategoryLists() {
  renderTagList('list-subjects', state.categories.subjects, 'subjects');
  renderTagList('list-availabilities', state.categories.availabilities, 'availabilities');
  renderTagList('list-sizecategories', state.categories.sizeCategories, 'sizeCategories');
}

function renderTagList(elementId, values, categoryKey) {
  var list = document.getElementById(elementId);
  list.innerHTML = '';
  values.forEach(function (value) {
    var li = document.createElement('li');
    var span = document.createElement('span');
    span.textContent = value;
    var removeBtn = document.createElement('button');
    removeBtn.textContent = 'x';
    removeBtn.addEventListener('click', function () {
      removeCategoryValue(categoryKey, value);
    });
    li.appendChild(span);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

function removeCategoryValue(categoryKey, value) {
  state.categories[categoryKey] = state.categories[categoryKey].filter(function (v) { return v !== value; });
  saveCategories();
}

function addCategoryValue(categoryKey, value) {
  if (!value || value.trim() === '') return;
  if (state.categories[categoryKey].indexOf(value) !== -1) return;
  state.categories[categoryKey].push(value.trim());
  saveCategories();
}

function saveCategories() {
  fetch(API + '/categories', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state.categories)
  }).then(function () {
    renderCategoryLists();
    fillSelectOptions();
  });
}

function initCategoryForms() {
  document.getElementById('btn-add-subject').addEventListener('click', function () {
    var input = document.getElementById('input-new-subject');
    addCategoryValue('subjects', input.value);
    input.value = '';
  });
  document.getElementById('btn-add-availability').addEventListener('click', function () {
    var input = document.getElementById('input-new-availability');
    addCategoryValue('availabilities', input.value);
    input.value = '';
  });
  document.getElementById('btn-add-sizecategory').addEventListener('click', function () {
    var input = document.getElementById('input-new-sizecategory');
    addCategoryValue('sizeCategories', input.value);
    input.value = '';
  });
}

function initFlagToggles() {
  document.getElementById('flag-bio').addEventListener('change', saveFlags);
  document.getElementById('flag-contact').addEventListener('change', saveFlags);
  document.getElementById('flag-instagram').addEventListener('change', saveFlags);
}

function saveFlags() {
  var payload = {
    enableBio: document.getElementById('flag-bio').checked,
    enableContact: document.getElementById('flag-contact').checked,
    enableInstagramFeed: document.getElementById('flag-instagram').checked
  };
  fetch(API + '/flags', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

function initHero() {
  document.getElementById('btn-save-hero').addEventListener('click', saveHero);
  [1, 2, 3].forEach(function (i) {
    document.getElementById('hero-image-upload-' + i).addEventListener('change', function (e) {
      handleHeroUpload(e, i);
    });
  });
  loadHero();
}

function loadHero() {
  fetch(API + '/hero').then(function (r) { return r.json(); }).then(function (data) {
    state.hero = data;
    data.forEach(function (slide, idx) {
      var i = idx + 1;
      document.getElementById('hero-eyebrow-' + i).value = slide.eyebrow || '';
      document.getElementById('hero-title-' + i).value = slide.title || '';
      document.getElementById('hero-text-' + i).value = slide.text || '';
      document.getElementById('hero-buttontext-' + i).value = slide.buttonText || '';
      document.getElementById('hero-buttonlink-' + i).value = slide.buttonLink || '';
      document.getElementById('hero-image-path-' + i).value = slide.image || '';
      var preview = document.getElementById('hero-preview-' + i);
      if (slide.image) {
        preview.src = slide.image;
        preview.style.display = 'block';
      }
    });
  });
}

function handleHeroUpload(e, index) {
  var file = e.target.files[0];
  if (!file) return;
  var formData = new FormData();
  formData.append('image', file);

  fetch(API + '/upload?folder=hero', { method: 'POST', body: formData })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      document.getElementById('hero-image-path-' + index).value = data.path;
      var preview = document.getElementById('hero-preview-' + index);
      preview.src = data.path;
      preview.style.display = 'block';
    });
}

function saveHero() {
  var slides = [1, 2, 3].map(function (i) {
    return {
      id: String(i),
      image: document.getElementById('hero-image-path-' + i).value,
      eyebrow: document.getElementById('hero-eyebrow-' + i).value,
      title: document.getElementById('hero-title-' + i).value,
      text: document.getElementById('hero-text-' + i).value,
      buttonText: document.getElementById('hero-buttontext-' + i).value,
      buttonLink: document.getElementById('hero-buttonlink-' + i).value
    };
  });
  fetch(API + '/hero', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slides)
  }).then(function () {
    alert('Slide Hero salvate.');
  });
}

function initInstagramConfig() {
  fetch(API + '/instagram').then(function (r) { return r.json(); }).then(function (data) {
    state.instagram = data;
    document.getElementById('instagram-profile-url').value = data.profileUrl || '';
    document.getElementById('instagram-embed-url').value = data.embedUrl || '';
  });

  document.getElementById('btn-save-instagram').addEventListener('click', function () {
    var payload = {
      profileUrl: document.getElementById('instagram-profile-url').value.trim(),
      embedUrl: document.getElementById('instagram-embed-url').value.trim()
    };
    fetch(API + '/instagram', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function () {
      alert('Collegamento Instagram salvato.');
    });
  });
}
