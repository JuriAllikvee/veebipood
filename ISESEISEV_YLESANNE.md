# Veebipood — kokkuvõtte labor
---

## Stsenaarium

Sa oled arendaja. Saad emaili tiimijuhilt:

---

*Tere!*

*Meie veebipoe rakendus on peaaegu valmis, aga on probleeme:*

*1. Kaks viga koodis — testid ebaõnnestuvad*
*2. GitHub Actions puudub — kood pole automaatselt testitud*
*3. README on poolik — uus arendaja ei saa aru kuidas käivitada*
*4. Arhitektuuri analüüs puudub*

*Sinu ülesanne: paranda vead, lisa automatiseerimine, dokumenteeri ja analüüsi arhitektuur.*

*Tähtaeg: 90 minutit.*

*Edu!*

---

## Ettevalmistus

Fork repo GitHubis, klooni ja käivita:

```powershell
cd ~\Desktop
git clone https://github.com/SINU_KONTO/veebipood.git
cd veebipood
docker compose up --build -d
```

Ava brauseris: **http://localhost:3000**

---

## Etapp 1 — Leia vead

Käivita automaattestid:

```powershell
npm install
node src/test.js
```

Näed kahte ebaõnnestunud testi:
- `FAIL: Otsing töötab`
- `FAIL: Staatus on 'vastu võetud'`

Ava koodifailid ja leia vead:

```powershell
code src/routes/products.js
code src/routes/orders.js
```

**Vihje 1:** `products.js` — leia rida kus on `data.items`. Mis peaks seal olema?

**Vihje 2:** `orders.js` — leia rida kus on `status: "pending"`. Mis peaks seal olema?

---

## Etapp 2 — Paranda vead

Paranda mõlemad vead. Pärast iga parandust käivita testid uuesti:

```powershell
node src/test.js
```

Kõik 7 testi peavad näitama `PASS`.

Rebuild Docker:

```powershell
docker compose up --build -d
```

Commit:

```powershell
git add src/routes/products.js src/routes/orders.js
git commit -m "Paranda kaks viga"
```

---

## Etapp 3 — GitHub Actions

Loo GitHub Actions workflow. Otsi internetist kuidas luua `.github/workflows` kausta ja `ci.yml` faili.

YAML sisu:

```yaml
name: CI Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    name: Automaattestid
    runs-on: ubuntu-latest
    steps:
      - name: Lae kood alla
        uses: actions/checkout@v4

      - name: Paigalda Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Paigalda sõltuvused
        run: npm install

      - name: Käivita rakendus
        run: node src/server.js &

      - name: Oota kuni server käivitub
        run: sleep 3

      - name: Käivita testid
        run: node src/test.js
```

Commit ja push:

```powershell
git add .github
git commit -m "Lisa GitHub Actions"
git push
```

Kontrolli GitHubis → **Actions** — pipeline peab läbima.

---

## Etapp 4 — Dokumenteerimine

Ava `README.md` ja täida kõik `<!-- TODO -->` kohad.

README peab sisaldama:
- Rakenduse kirjeldus
- Käivitamise juhised
- Testikasutajad
- Kõigi API endpointide kirjeldused
- Arhitektuuri analüüs (vt Etapp 5)
- GitHub Actions selgitus

Commit ja push:

```powershell
git add README.md
git commit -m "Täida README dokumentatsioon"
git push
```

---

## Etapp 5 — Arhitektuuri analüüs

Vaata koodi struktuuri:

```powershell
ls src\routes\
```

Vasta README-s järgmistele küsimustele:

1. **Mis arhitektuur see rakendus kasutab?** (monoliit, mikroteenused, klient-server, MVC?)
2. **Millest sa seda järeldad?** — vaata kaustade struktuuri, kuidas kood on jagatud
3. **Miks see arhitektuur on siin õige valik?**
4. **Mis arhitektuuri kasutaksid kui rakendus peaks teenindama 1 miljonit kasutajat?**

---

## Etapp 6 — Sprint lõpetamine

Kontrolli et kõik on tehtud:

```powershell
node src/test.js
```

Kõik testid peavad läbima.

Vaata git ajalugu:

```powershell
git log --oneline
```

Peata konteiner:

```powershell
docker compose down
```

---

## Labor on lõpetatud kui

- Kaks viga on parandatud
- Kõik 7 automaattesti läbivad
- GitHub Actions pipeline on roheline
- README on täidetud
- Arhitektuuri analüüs on kirjas README-s
