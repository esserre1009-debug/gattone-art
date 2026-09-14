# gattone.art

Catalogo online di opere di collage e assemblaggio.

## NOVITA' DI QUESTO AGGIORNAMENTO

1) **FIX label poco leggibili** (screenshot pagina dettaglio opera):
   le etichette "DIMENSIONI / SOGGETTO / DISPONIBILITA" erano quasi
   invisibili perché usavano un grigio chiaro (#8a8478) su sfondo crema
   (#f7f3e8) con un font "thin": contrasto reale ~2.3:1 (sotto il minimo
   WCAG AA di 4.5:1). Corretto in `frontend/src/styles/global.css`:
   - nuova variabile `--color-label: #6b6459` (contrasto ~4.6:1)
   - font-weight aumentato da 300 a 500
   - stessa correzione applicata a `.filter-group-label` e `.filter-reset`
     nella Galleria, che avevano lo stesso problema.

2) **Migrazione dati da JSON statici a Supabase (Postgres + Storage)**:
   - Opere, categorie, flags, hero slider e link Instagram ora vivono
     in un database Supabase, non più solo in file JSON nel repository.
   - Le immagini caricate dal pannello admin vanno su Supabase Storage
     (bucket pubblico `artwork-images`), non più su disco locale.
   - Il frontend pubblico legge da Supabase in tempo reale (chiave anon,
     solo lettura) e, se Supabase non è configurato o irraggiungibile,
     usa automaticamente i JSON statici come fallback: il sito NON si
     rompe mai.
   - Il pannello admin ora scrive su Supabase tramite la SERVICE ROLE
     KEY (mai esposta al pubblico).

## Struttura

- `frontend/` - sito pubblico (React + Vite), da deployare su Vercel
- `admin-server/` - pannello admin locale (Node + Express), NON va online,
  ora connesso a Supabase invece che ai file JSON
- `supabase/schema.sql` - schema del database (tabelle, RLS, bucket storage)
- `supabase/seed.sql` - dati iniziali (le opere/categorie/hero attuali)

---

## PARTE 1 - Creare il progetto Supabase

1. Vai su https://supabase.com, crea un account/progetto gratuito.
2. Annota, da **Project Settings > API**:
   - `Project URL` (es. https://xxxxxxxx.supabase.co)
   - `anon public key` (chiave pubblica, va nel frontend)
   - `service_role key` (chiave segreta, va SOLO nell'admin-server locale,
     MAI nel frontend, MAI in un repository pubblico)
3. Vai su **SQL Editor > New query**, apri il file `supabase/schema.sql`
   di questo progetto, copia tutto il contenuto, incollalo ed esegui
   (Run). Questo crea le tabelle `artworks` e `app_settings`, le policy
   di sicurezza (RLS) e il bucket storage pubblico `artwork-images`.
4. Sempre in SQL Editor, apri una nuova query, incolla il contenuto di
   `supabase/seed.sql` ed esegui. Questo popola il database con le 11
   opere e le impostazioni attuali (equivalenti ai vecchi JSON).
5. Verifica in **Table Editor** che compaiano le tabelle `artworks` e
   `app_settings` con i dati.
6. Verifica in **Storage** che esista il bucket `artwork-images` (pubblico).

## PARTE 2 - Migrare le immagini esistenti

Le immagini attuali (`frontend/public/images/artworks/*.jpeg` ecc.) NON
vengono spostate automaticamente. Due opzioni:

**Opzione A (più semplice, consigliata per iniziare):**
Lascia le immagini attuali dentro `frontend/public/images/...` e i
relativi percorsi (`/images/artworks/...`) nei dati: continueranno a
funzionare perché vengono servite da Vercel insieme al sito. Da questo
momento in avanti, le NUOVE immagini caricate dal pannello admin
andranno invece su Supabase Storage con URL tipo
`https://xxxxxxxx.supabase.co/storage/v1/object/public/artwork-images/...`.
Le vecchie e le nuove immagini convivono senza problemi.

**Opzione B (migrazione completa):**
Se preferisci avere tutte le immagini su Supabase Storage:
1. Vai su Supabase > Storage > bucket `artwork-images` > crea le
   cartelle `artworks` e `hero`.
2. Carica manualmente lì le immagini esistenti (drag&drop dalla
   dashboard Supabase).
3. Copia gli URL pubblici generati e aggiorna i campi `images`/`cover`
   delle righe in tabella `artworks` (Table Editor) e la colonna
   `image` nel record `hero` di `app_settings`.

## PARTE 3 - Configurare ed eseguire il pannello admin (locale)

```
cd admin-server
cp .env.example .env
```

Apri `.env` e inserisci:
```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<la tua service_role key>
SUPABASE_STORAGE_BUCKET=artwork-images
PORT=4000
```

Poi:
```
npm install
npm start
```
Apri http://localhost:4000 - da qui gestisci opere, categorie, hero,
flags e collegamento Instagram: tutto viene salvato direttamente su
Supabase.

**Il pannello admin NON deve mai essere esposto su internet**: non ha
autenticazione e usa una chiave con accesso completo al database.
Usalo solo su `localhost`.

## PARTE 4 - Configurare il frontend

Per sviluppo locale, in `frontend/`:
```
cp .env.example .env.local
```
Apri `.env.local` e inserisci:
```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=<la tua anon public key>
```

Poi:
```
npm install
npm run dev
```
Apri il link mostrato (di solito http://localhost:5173).

Se lasci `.env.local` vuoto o non lo crei, il sito funziona comunque
usando i JSON statici in `src/data/` come fallback (utile per provare
il sito senza aver ancora configurato Supabase).

## PARTE 5 - Deploy del sito pubblico su Vercel

1. Crea un repository Git (GitHub/GitLab/Bitbucket) con tutta la
   cartella `gattone-art` aggiornata (incluso questo aggiornamento).
   **Non committare** i file `.env` / `.env.local` (già in `.gitignore`).
2. Su https://vercel.com, importa il repository.
3. Root Directory = `frontend`
4. In **Project Settings > Environment Variables**, aggiungi:
   - `VITE_SUPABASE_URL` = URL del progetto Supabase
   - `VITE_SUPABASE_ANON_KEY` = anon public key
   (SOLO queste due, MAI la service_role key)
5. Deploy.

Da questo momento:
- Il sito pubblico su Vercel legge i dati live da Supabase (opere,
  disponibilità, prezzi, hero slider, categorie, Instagram).
- Ogni modifica fatta dal pannello admin locale è visibile sul sito
  pubblico dopo un refresh della pagina: **non serve più fare un nuovo
  deploy su Vercel per aggiornare i contenuti** (a differenza della
  versione precedente basata su JSON statici, dove ogni modifica
  richiedeva commit + push + nuovo deploy).
- Un nuovo deploy resta necessario solo se modifichi il CODICE del sito
  (componenti, stile, struttura pagine), non per i contenuti.

## Se la porta 4000 è occupata (admin locale)

```
kill -9 $(lsof -t -i:4000)
npm start
```

## Limitazioni note

- Nessuna autenticazione sul pannello admin: solo uso locale, protetto
  dal fatto che la service_role key resta sul tuo computer.
- Font titoli in versione DEMO: da sostituire con licenza completa
  prima del lancio pubblico definitivo.
- Masonry a colonne: le opere si dispongono colonna per colonna (non
  riga per riga), comportamento standard di questo tipo di layout senza
  librerie esterne.
- Se Supabase non è raggiungibile (down, chiavi sbagliate, ecc.), il
  frontend torna automaticamente ai dati JSON statici presenti nel
  repository, che quindi conviene mantenere ragionevolmente aggiornati
  come "rete di sicurezza" (es. rieseguendo l'export dal pannello admin
  e sostituendo i file in `frontend/src/data/`).
