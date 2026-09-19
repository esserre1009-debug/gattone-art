require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 4000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'artwork-images';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERRORE: variabili SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY mancanti.');
  console.error('Crea un file .env in admin-server/ partendo da .env.example');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const ALLOWED_FOLDERS = ['artworks', 'hero'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function slugifyFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const unique = Date.now();
  return `${base}-${unique}${ext}`;
}

function nextArtworkId(existingIds) {
  const maxId = existingIds.reduce(function (max, id) {
    return Math.max(max, parseInt(id, 10) || 0);
  }, 0);
  return String(maxId + 1);
}

function mapArtworkRowToApi(row) {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    availability: row.availability,
    sizeCategory: row.size_category,
    orientation: row.orientation,
    dimensions: row.dimensions,
    price: row.price,
    priceDisplay: row.price_display,
    description: row.description,
    images: row.images || [],
    cover: row.cover || (row.images && row.images[0]) || '',
    sortOrder: row.sort_order,
  };
}

function mapApiToArtworkRow(body) {
  const images = Array.isArray(body.images) ? body.images : [];
  return {
    title: body.title,
    subject: body.subject,
    availability: body.availability,
    size_category: body.sizeCategory,
    orientation: body.orientation,
    dimensions: body.dimensions,
    price: body.price != null ? Number(body.price) : null,
    price_display: body.priceDisplay,
    description: body.description,
    images: images,
    cover: images[0] || '',
  };
}

// -----------------------------------------------------------------------
// UPLOAD IMMAGINI -> Supabase Storage (bucket pubblico)
// -----------------------------------------------------------------------
app.post('/api/upload', upload.single('image'), async function (req, res) {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nessun file caricato' });
      return;
    }
    const folder = ALLOWED_FOLDERS.indexOf(req.query.folder) !== -1 ? req.query.folder : 'artworks';
    const filename = slugifyFilename(req.file.originalname);
    const storagePath = `${folder}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    res.json({ path: publicUrlData.publicUrl });
  } catch (err) {
    console.error('Errore upload immagine:', err);
    res.status(500).json({ error: 'Errore durante il caricamento su Supabase Storage' });
  }
});

// -----------------------------------------------------------------------
// OPERE (artworks)
// -----------------------------------------------------------------------
app.get('/api/artworks', async function (req, res) {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json(data.map(mapArtworkRowToApi));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore lettura opere' });
  }
});

// -----------------------------------------------------------------------
// REORDER — riceve array di { id, sortOrder } e aggiorna in batch
// (DEVE stare prima di /api/artworks/:id altrimenti Express matcha "reorder" come :id)
// -----------------------------------------------------------------------
app.put('/api/artworks/reorder', async function (req, res) {
  try {
    var items = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Payload deve essere un array di { id, sortOrder }' });
      return;
    }

    var promises = items.map(function (item) {
      return supabase
        .from('artworks')
        .update({ sort_order: item.sortOrder })
        .eq('id', String(item.id));
    });

    var results = await Promise.all(promises);
    var firstError = results.find(function (r) { return r.error; });
    if (firstError && firstError.error) throw firstError.error;

    res.json({ success: true, updated: items.length });
  } catch (err) {
    console.error('Errore reorder:', err);
    res.status(500).json({ error: 'Errore aggiornamento ordinamento' });
  }
});

app.post('/api/artworks', async function (req, res) {
  try {
    const { data: existing, error: readError } = await supabase.from('artworks').select('id, sort_order');
    if (readError) throw readError;

    const ids = existing.map(function (r) { return r.id; });
    const newId = nextArtworkId(ids);
    const maxSort = existing.reduce(function (max, r) { return Math.max(max, r.sort_order || 0); }, -1);

    const row = mapApiToArtworkRow(req.body);
    row.id = newId;
    row.sort_order = maxSort + 1;

    const { data, error } = await supabase.from('artworks').insert(row).select().single();
    if (error) throw error;

    res.json(mapArtworkRowToApi(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore creazione opera' });
  }
});

app.put('/api/artworks/:id', async function (req, res) {
  try {
    const row = mapApiToArtworkRow(req.body);
    const { data, error } = await supabase
      .from('artworks')
      .update(row)
      .eq('id', req.params.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Opera non trovata' });
      return;
    }
    res.json(mapArtworkRowToApi(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore aggiornamento opera' });
  }
});

app.delete('/api/artworks/:id', async function (req, res) {
  try {
    const { error } = await supabase.from('artworks').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore eliminazione opera' });
  }
});

// -----------------------------------------------------------------------
// SETTINGS generici: categories, flags, hero, instagram
// -----------------------------------------------------------------------
async function getSetting(key) {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) throw error;
  return data ? data.value : null;
}

async function putSetting(key, value) {
  const { data, error } = await supabase
    .from('app_settings')
    .upsert({ key: key, value: value }, { onConflict: 'key' })
    .select()
    .single();
  if (error) throw error;
  return data.value;
}

app.get('/api/categories', async function (req, res) {
  try {
    const value = await getSetting('categories');
    res.json(value || { subjects: [], availabilities: [], sizeCategories: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore lettura categorie' });
  }
});

app.put('/api/categories', async function (req, res) {
  try {
    const value = await putSetting('categories', req.body);
    res.json(value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore salvataggio categorie' });
  }
});

app.get('/api/flags', async function (req, res) {
  try {
    const value = await getSetting('flags');
    res.json(value || { enableBio: false, enableContact: false, enableInstagramFeed: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore lettura flags' });
  }
});

app.put('/api/flags', async function (req, res) {
  try {
    const value = await putSetting('flags', req.body);
    res.json(value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore salvataggio flags' });
  }
});

app.get('/api/hero', async function (req, res) {
  try {
    const value = await getSetting('hero');
    res.json(value || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore lettura hero' });
  }
});

app.put('/api/hero', async function (req, res) {
  try {
    const value = await putSetting('hero', req.body);
    res.json(value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore salvataggio hero' });
  }
});

app.get('/api/instagram', async function (req, res) {
  try {
    const value = await getSetting('instagram');
    res.json(value || { profileUrl: '', embedUrl: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore lettura instagram' });
  }
});

app.put('/api/instagram', async function (req, res) {
  try {
    const value = await putSetting('instagram', req.body);
    res.json(value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore salvataggio instagram' });
  }
});

// -----------------------------------------------------------------------
// EXPORT
// -----------------------------------------------------------------------
app.get('/api/export/artworks', async function (req, res) {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    const exported = data.map(mapArtworkRowToApi);
    res.setHeader('Content-Disposition', 'attachment; filename=artworks-export.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(exported, null, 2));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore esportazione opere' });
  }
});

app.listen(PORT, function () {
  console.log('Pannello admin gattone.art attivo su http://localhost:' + PORT);
  console.log('Connesso a Supabase: ' + SUPABASE_URL);
  console.log('ATTENZIONE: usare solo in locale, non esporre questo server su internet.');
  console.log('La SERVICE ROLE KEY non deve mai finire nel frontend pubblico.');
});
