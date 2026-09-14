-- =====================================================================
-- gattone.art - Seed dati iniziali (dal catalogo statico esistente)
-- Eseguire DOPO schema.sql
-- =====================================================================

insert into public.artworks
  (id, title, subject, availability, size_category, orientation, dimensions, price, price_display, description, images, cover, sort_order)
values
  ('1', 'La Stella Piu Bella', 'Pin-up Art', 'Disponibile', 'Piccolo', 'vertical', '24 x 30 cm', 150, '€ 150', 'Opera realizzata con tecnica di collage e assemblaggio su supporto rigido.', ARRAY['/images/artworks/la-stella-piu-bella.jpeg']::text[], '/images/artworks/la-stella-piu-bella.jpeg', 0),
  ('2', 'Pane e Amore e...', 'Cinema & Vintage', 'Disponibile', 'Medio', 'square', '40 x 40 cm', 260, '€ 260', 'Opera realizzata con tecnica di collage e assemblaggio su supporto rigido.', ARRAY['/images/artworks/pane-amore.png']::text[], '/images/artworks/pane-amore.png', 1),
  ('3', 'A Qualcuno Piace Caldo', 'Cinema & Vintage', 'Disponibile', 'Medio', 'square', '40 x 40 cm', 260, '€ 260', 'Opera realizzata con tecnica di collage e assemblaggio su supporto rigido.', ARRAY['/images/artworks/qualcuno-piace-caldo.jpeg']::text[], '/images/artworks/qualcuno-piace-caldo.jpeg', 2),
  ('4', 'Cat on a Hot Tin Roof', 'Cinema & Vintage', 'Disponibile', 'Medio', 'square', '40 x 40 cm', 260, '€ 260', 'Opera realizzata con tecnica di collage e assemblaggio su supporto rigido.', ARRAY['/images/artworks/cat-on-hot-tin-roof.jpeg']::text[], '/images/artworks/cat-on-hot-tin-roof.jpeg', 3),
  ('5', 'Ladyhawke', 'Cinema & Vintage', 'Disponibile', 'Medio', 'square', '40 x 40 cm', 260, '€ 260', 'Opera realizzata con tecnica di collage e assemblaggio su supporto rigido, ispirata al film Ladyhawke.', ARRAY['/images/artworks/ladyhawke.jpeg']::text[], '/images/artworks/ladyhawke.jpeg', 4),
  ('6', 'Chinatown', 'Cinema & Vintage', 'Disponibile', 'Medio', 'square', '40 x 40 cm', 260, '€ 260', 'Opera realizzata con tecnica di collage e assemblaggio su supporto rigido.', ARRAY['/images/artworks/chinatown.jpeg']::text[], '/images/artworks/chinatown.jpeg', 5),
  ('7', 'Efficiency Excellency', 'Comics & Supereroi', 'Disponibile', 'Grande', 'vertical', '60 x 100 cm', 2300, '€ 2.300', 'Opera realizzata con tecnica di collage e assemblaggio su supporto rigido.', ARRAY['/images/artworks/efficiency-excellency.jpeg']::text[], '/images/artworks/efficiency-excellency.jpeg', 6),
  ('8', 'Pinup', 'Pin-up Art', 'Disponibile', 'Grande', 'horizontal', '60 x 120 cm', 2500, '€ 2.500', 'Opera realizzata con tecnica di collage e assemblaggio su supporto rigido.', ARRAY['/images/artworks/pinup.jpeg']::text[], '/images/artworks/pinup.jpeg', 7),
  ('9', 'X1', 'Comics & Supereroi', 'Disponibile', 'Grande', 'horizontal', '50 x 70 cm', 1200, '€ 1.200', 'Opera realizzata con tecnica di collage e assemblaggio su supporto rigido.', ARRAY['/images/artworks/x1.jpeg']::text[], '/images/artworks/x1.jpeg', 8),
  ('10', 'Simboli in Piccolo', 'Comics & Supereroi', 'Disponibile', 'Piccolo', 'square', '25 x 25 cm', 120, '€ 120', 'Opera realizzata con tecnica di collage e assemblaggio su supporto rigido.', ARRAY['/images/artworks/simboli-piccolo.jpeg']::text[], '/images/artworks/simboli-piccolo.jpeg', 9),
  ('11', 'A10', 'Pin-up Art', 'Disponibile', 'Medio', 'square', '50 x 50 cm', 1200, '€ 1.200', 'Opera realizzata con tecnica di collage e assemblaggio su supporto rigido, ispirata al film Mujeres al borde de un ataque de nervios.', ARRAY['/images/artworks/mujeres.jpeg']::text[], '/images/artworks/mujeres.jpeg', 10)
on conflict (id) do update set
  title = excluded.title,
  subject = excluded.subject,
  availability = excluded.availability,
  size_category = excluded.size_category,
  orientation = excluded.orientation,
  dimensions = excluded.dimensions,
  price = excluded.price,
  price_display = excluded.price_display,
  description = excluded.description,
  images = excluded.images,
  cover = excluded.cover,
  sort_order = excluded.sort_order;

insert into public.app_settings (key, value) values
  ('categories', '{"subjects": ["Cinema & Vintage", "Comics & Supereroi", "Pin-up Art"], "availabilities": ["Disponibile", "Riservato", "Venduto"], "sizeCategories": ["Piccolo", "Medio", "Grande"]}'::jsonb),
  ('flags', '{"enableBio": false, "enableContact": false, "enableInstagramFeed": false}'::jsonb),
  ('hero', '[{"id": "1", "image": "/images/artworks/pinup.jpeg", "eyebrow": "Collezione", "title": "Collage, colore e cultura pop", "text": "Opere originali che uniscono cinema vintage, pop art e pin-up, realizzate a mano.", "buttonText": "Esplora la galleria", "buttonLink": "/galleria"}, {"id": "2", "image": "/images/artworks/efficiency-excellency.jpeg", "eyebrow": "Fatto a mano", "title": "Ogni pezzo è unico", "text": "Tecnica di collage e assemblaggio, composizioni originali su supporto rigido.", "buttonText": "Scopri il catalogo", "buttonLink": "/galleria"}, {"id": "3", "image": "/images/artworks/mujeres.jpeg", "eyebrow": "Su richiesta", "title": "Porta a casa un''opera originale", "text": "Contattaci per informazioni su disponibilità e acquisto delle opere.", "buttonText": "Vedi tutte le opere", "buttonLink": "/galleria"}]'::jsonb),
  ('instagram', '{"profileUrl": "", "embedUrl": ""}'::jsonb)
on conflict (key) do update set value = excluded.value;
