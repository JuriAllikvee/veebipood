# Veebipood

Veebipood on lihtne ja kiire e-poe näidisrakendus (näidis-API koos lihtsa kasutajaliidesega), mis võimaldab kasutajatel registreeruda, sisse logida, sirvida ja otsida tooteid, filtreerida tooteid kategooriate kaupa ning esitada tellimusi.

## Tehnoloogiad

- **Backend:** Node.js, Express raamistik
- **Andmed:** Mälusisene andmehoidla (in-memory data) failis `src/data.js`
- **Frontend:** Vanilla HTML, CSS ja JavaScript (kaustas `public/`)
- **Konteineriseerimine:** Docker ja Docker Compose
- **Testimine:** Kohandatud automaattestid (`src/test.js`)
- **CI/CD:** GitHub Actions

## Käivitamine

### 1. Docker Compose (Soovitatav)

Rakenduse käivitamiseks Dockeriga kasuta käsku:

```powershell
docker compose up --build -d
```

Seejärel ava rakendus brauseris aadressil: **http://localhost:3000**

### 2. Lokaalselt ilma Dockerita

Veendu, et sul on paigaldatud Node.js (soovitatavalt versioon 20 või uuem).

1. Paigalda vajalikud sõltuvused:
   ```powershell
   npm install
   ```

2. Käivita server:
   ```powershell
   node src/server.js
   ```

3. Ava rakendus brauseris aadressil: **http://localhost:3000**

Tooteid ja funktsionaalsust testivad automaattestid saad käivitada käiguga:
```powershell
node src/test.js
```

## Testikasutajad

Süsteemis on algselt loodud kaks kasutajat, keda saab kasutada sisselogimiseks ja tellimuste esitamiseks:

| Eesnimi | Kasutajanimi | Parool | Roll |
|---------|--------------|--------|------|
| Mari Maasikas | `mari` | `1234` | Tavakasutaja |
| Jaan Jansen | `jaan` | `1234` | Tavakasutaja |

## Teadaolevad vead (Parandatud)

Rakenduses olid järgmised vead, mis on nüüd edukalt lahendatud:
1. `src/routes/products.js` — toodete otsingus kasutati ekslikult olemata muutujat `data.items`, mis asendati korrektse muutujaga `data.products`.
2. `src/routes/orders.js` — uue tellimuse loomisel määrati tellimuse staatuseks vale ingliskeelne väärtus `"pending"`, mis asendati korrektse eestikeelse staatusega `"vastu võetud"`.

## API endpointid

### Kasutajad

| Meetod | URL | Kirjeldus |
|--------|-----|-----------|
| POST | `/api/users/signup` | Registreerib uue kasutaja (username, password, name). Tagastab autoriseerimise tokeni. |
| POST | `/api/users/login` | Logib kasutaja sisse (username, password). Tagastab autoriseerimise tokeni. |
| POST | `/api/users/logout` | Logib kasutaja välja ja tühistab sessiooni tokeni. |
| GET | `/api/users/me` | Tagastab sisselogitud kasutaja profiiliinfo (vajab Authorization päist). |

### Tooted

| Meetod | URL | Kirjeldus |
|--------|-----|-----------|
| GET | `/api/products` | Tagastab kõigi poes olevate toodete nimekirja. |
| GET | `/api/products/:id` | Tagastab ühe toote andmed selle ID alusel. |
| GET | `/api/products/search` | Otsib tooteid nime järgi kasutades päringu parameetrit (nt `?name=hiir`). |
| GET | `/api/products/categories` | Tagastab kõik süsteemis eksisteerivad tootekategooriad. |
| GET | `/api/products/category/:cat` | Tagastab kõik antud kategooriasse kuuluvad tooted. |

### Tellimused

| Meetod | URL | Kirjeldus |
|--------|-----|-----------|
| POST | `/api/orders` | Loob uue tellimuse (vajab Authorization päist ja toodete nimekirja kehas). Vähendab ka laoseisu. |
| GET | `/api/orders` | Tagastab kõigi süsteemis tehtud tellimuste nimekirja. |
| GET | `/api/orders/me` | Tagastab sisselogitud kasutaja tellimused. |
| GET | `/api/orders/:id` | Tagastab konkreetse tellimuse info selle ID alusel. |
| PATCH | `/api/orders/:id/status` | Uuendab tellimuse staatust (nt "töötlemisel", "saadetud", "kohale toimetatud"). |

## Arhitektuur

### 1. Mis arhitektuur see rakendus kasutab?
Rakendus kasutab **monoliitset klient-server** arhitektuuri. Nii kasutajaliides (frontend) kui ka server (backend) on ühes koodibaasis ja töötavad ühes protsessis.

### 2. Millest sa seda järeldad?
- **Koodi struktuur:** Kogu kood (server, marsruudid, staatilised failid) on ühes kohas ja käivitub korraga ühe käsuga.
- **Andmete jagamine:** Andmeid hoitakse otse serveri mälus (`data.js` failis). Puudub eraldi andmebaas või muud teenused.
- **Käivitamine:** Kogu rakendus töötab üheainsa Node.js protsessina ja seda saab tervikuna pakkida ühte Docker konteinerisse.

### 3. Miks see arhitektuur on siin õige valik?
Sest see on väike ja lihtne näidisrakendus. Monoliiti on ülimalt lihtne lokaalselt arendada, käivitada ja testida ilma keerulise infrastruktuurita.

### 4. Mis arhitektuuri kasutaksid kui rakendus peaks teenindama 1 miljonit kasutajat?
Kasutaksin **mikroteenuste (Microservices)** arhitektuuri:
- **Teenuste jagamine:** Tükeldaksin monoliidi eraldi mikroteenusteks (kasutajad, tooted, tellimused), et neid saaks eraldi skaleerida.
- **Eraldi andmebaasid:** Igale teenusele oma andmebaas (nt PostgreSQL või MongoDB) koos replikatsiooniga.
- **Koormuse jaotamine:** Lisaksin koormusjaoturi (Load Balancer) ja vahemälud (Redis), et päringuid kiirendada.
- **CDN:** Staatilise sisu serveerimiseks kasutaksin CDN-i.

## GitHub Actions

Projekt sisaldab GitHub Actionsi töövoogu failis `.github/workflows/ci.yml`. See käivitub automaatselt iga kord, kui tehakse commit või pull request harru `main`.

Workflow teeb automaatselt järgmist:
1. Laeb alla projekti lähtekoodi (`actions/checkout`).
2. Paigaldab Node.js 20 keskkonna (`actions/setup-node`).
3. Paigaldab projekti npm moodulid/sõltuvused (`npm install`).
4. Käivitab veebiserveri taustal (`node src/server.js &`).
5. Ootab 3 sekundit, et server jõuaks käivituda.
6. Käivitab testid (`node src/test.js`), et veenduda uute muudatuste korrektsuses enne nende ühendamist toodangusse.
