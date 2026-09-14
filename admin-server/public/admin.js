var API = '/api';
var state = { artworks: [], categories: { subjects: [], availabilities: [], sizeCategories: [] }, flags: {}, hero: [], instagram: {} };

document.addEventListener('DOMContentLoaded', function () {
  initTabs();
  initModal();
  initCategoryForms();
  initFlagToggles();
  initUpload();
  initHero();
  initInstagramConfig();
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
