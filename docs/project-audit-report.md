# Nezavisni tehnički audit projekta — Aqua Still Shop

**Datum analize:** 26. mart 2026.  
**Sistem:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Prisma ORM 6, PostgreSQL 16 (Docker).

---

## A. Opšte stanje projekta
Aqua Still Shop je modernizovan e-commerce projekat zasnovan na visoko performansnom Next.js 16 App Router-u i TypeScript-u. Sistem je uspešno oslobođen spoljnih monolitnih zavisnosti (poput Meduse) i transformisan u modularnu arhitekturu sa sopstvenim servisnim slojem, server akcijama i pripremljenom osnovom za napredni CMS/administracijski panel (`/admin`). Projekat se uspešno kompilirа i gradi bez grešaka (`npm run build`).

---

## B. Implementirane funkcije
1. **Javni katalog i pretraga:** Prikaz proizvoda, filtriranje po kategorijama, podkategorijama, brendovima, statusu zaliha i tekstualna pretraga (`src/app/katalog/page.tsx`, `src/services/product-service.ts`).
2. **Stranice pojedinačnih proizvoda:** Dinamička ruta (`/proizvod/[slug]`) sa galerijom slika, tehničkim karakteristikama, cenama, PDV-om i WMS lokacijom.
3. **Sistem korpe sa Server-Side validacijom:** Hibridni pristup (gostujuća korpa u `localStorage` + server-authoritative provera cena i zaliha preko `validateAndGetProduct` Server Action).
4. **Trostepeni fallback mehanizam za proizvode:** Rešen problem „Proizvod nije pronađen” bezbednim pretraživanjem baze (ID/Slug) -> baze po slug-u -> mock podataka po ID-ju/slug-u (`src/actions/cart-actions.ts`).
5. **Checkout i kreiranje porudžbina:** Forma za naručivanje sa izborom načina isporuke (Dostava na adresu vs. **Lično preuzimanje u radnji** — besplatno, spremno narednog dana) i plaćanjem pouzećem (`/placanje`).
6. **Prisma transakcije za porudžbine:** Atomsko kreiranje porudžbine (`Order`), stavki (`OrderItem`) i automatsko umanjenje zaliha (`stockQuantity.decrement`) u bazi (`src/actions/checkout-actions.ts`).
7. **Stranica potvrde porudžbine:** Prikaz jedinstvenog broja porudžbine (`AS-XXXXXXXX`), detalja isporuke i ukupnog iznosa (`/porudzbina/[orderNumber]`).
8. **Integracija logotipa:** Postavljen zvanični Aqua Still logo u zaglavlje (`Header.tsx`) preko Next.js `Image` komponente.
9. **SaaS Admin Dashboard Layout:** Osnovni admin raspored (`/admin/layout.tsx`) sa bočnom navigacijom i gornjom trakom za svih 13 planiranih modula.

---

## C. Delimično implementirane funkcije
1. **Medijska biblioteka (`/admin/media`):** 
   - *Implementirano:* Server akcije za upload (`uploadMediaAction`), čuvanje u `public/uploads/` i bazu (`MediaAsset`), brisanje sa proverom da li se slika koristi na proizvodima, i fallback na fajl sistem.
   - *Nedostaje:* Kompletan vizuelni admin interfejs za upravljanje, filtriranje po folderima, izmenu alt teksta i pretragu unutar `/admin/media` stranice (trenutno je prikazana placeholder stranica).
2. **Upravljanje proizvodima i kategorijama u Adminu:** 
   - *Implementirano:* Model u Prisma šemi i servisni sloj za čitanje.
   - *Nedostaje:* CRUD interfejs ekrani u admin panelu (`/admin/products`, `/admin/categories`).

---

## D. Neimplementirane funkcije
1. **Vizuelni editor stranica (`/admin/editor`):** Arhitekturalno definisan (JSON schema builder), ali trenutno ima samo placeholder stranicu.
2. **Sistem autentifikacije za administratore (`/admin/login`):** Postoje osnovni NextAuth/Auth.js modeli (`User`, `Account`, `Session`), ali ruta `/admin` i serverske akcije još uvek nemaju aktivnu proveru `role === 'admin'` sesije.
3. **Email obaveštenja (Resend / Nodemailer):** Pripremljeno u planu, ali kôd za automatsko slanje email potvrda kupcu još uvek nije povezan.
4. **Elektronsko kartično plaćanje (Stripe / DinaCard):** Arhitekturalno predviđeno, ali implementirano je samo plaćanje pouzećem.

---

## E. Problemi, greške i rizici
1. **Rizik od nezaštićenih Admin ruta:** Trenutno svako ko unese `/admin` u pretraživač može pristupiti admin layout-u jer middleware/sesijska provera za uloge još uvek nije aktivna na nivou rute.
2. **Migracije baze:** Prisma šema je obogaćena novim modelima (`Page`, `MediaAsset`, `SiteSetting`, `Cart`, `Address`), ali migracije (`prisma migrate dev`) nisu pokrenute nad bazom, što znači da CMS modeli u bazi fizički još ne postoje dok se ne izvrši migracija.

---

## F. Administracija — Tabela modula i stvarno stanje

| Modul | Putanja | Status | Opis / Stvarno stanje |
| :--- | :--- | :--- | :--- |
| **Kontrolna tabla** | `/admin` | Završeno | SaaS dashboard sa metrikama i karticama. |
| **Vizuelni editor** | `/admin/editor` | Neimplementirano | Placeholder stranica. |
| **Stranice** | `/admin/pages` | Neimplementirano | Placeholder stranica. |
| **Proizvodi** | `/admin/products` | Neimplementirano | Placeholder stranica. |
| **Kategorije** | `/admin/categories` | Neimplementirano | Placeholder stranica. |
| **Brendovi** | `/admin/brands` | Neimplementirano | Placeholder stranica. |
| **Medijska biblioteka** | `/admin/media` | Delimično | Server akcije postoje (`media-actions.ts`), UI je placeholder. |
| **Navigacija** | `/admin/navigation` | Neimplementirano | Placeholder stranica. |
| **Porudžbine** | `/admin/orders` | Neimplementirano | Placeholder stranica. |
| **Kupci** | `/admin/customers` | Neimplementirano | Placeholder stranica. |
| **SEO** | `/admin/seo` | Neimplementirano | Placeholder stranica. |
| **Dizajn sajta** | `/admin/design` | Neimplementirano | Placeholder stranica. |
| **Podešavanja** | `/admin/settings` | Neimplementirano | Placeholder stranica. |

---

## G. Medijska galerija (Media Gallery)
- **Stvarno stanje:** Backend akcije (`src/actions/media-actions.ts`) su robusno napisane sa validacijom tipova (JPG, PNG, WebP), ograničenjem veličine (5MB), čuvanjem u `public/uploads/`, kreiranjem zapisa u bazi (`MediaAsset`) i bezbednosnom proverom da li se slika koristi pre brisanja. Međutim, frontend korisnički interfejs na `/admin/media` je trenutno u statusu placeholder-a i ne prikazuje galeriju vizuelno.

---

## H. Kupovina (Shopping & Purchase Flow)
- **Katalog:** 100% funkcionalan, podržava filtriranje, pretragu i sortiranje sa automatskim DB/mock fallback-om.
- **Proizvod:** Stranica detalja (`/proizvod/[slug]`) potpuno funkcionalna sa specifikacijama i dodavanjem u korpu.
- **Korpa (`CartContext` & `CartDrawer`):** Besprekorno radi za goste preko `localStorage`-a uz server-side validaciju cena i zaliha. Problem „Proizvod nije pronađen” je u potpunosti otklonjen.
- **Checkout & Porudžbine:** Forma za naplatu (`/placanje`) podržava dostavu na adresu i **preuzimanje u radnji** (besplatno, narednog dana). Kreiranje porudžbine koristi Prisma transakcije (`db.$transaction`) za siguran upis u bazu i umanjenje zaliha.

---

## I. Bezbednost (Security)
- **Šta je zaštićeno:** Server akcije validiraju sve ulazne podatke, nikada ne veruju cenama sa klijenta, i koriste autoritativne cene sa servera. Upload fajlova ima restrikciju MIME tipova i veličine.
- **Šta nije zaštićeno:** Admin rute (`/admin/*`) nemaju implementiranu proveru autentifikacije i autorizacije (nedostaje login stranica i middleware/session guard).

---

## J. Testovi (Tests)
- **Automatski testovi:** Nisu definisani u paketu (nema Jest/Playwright skripti).
- **Ručni i Build testovi:** Izvršen je `npm run build` koji je uspešno kompilirao i generisao svih **19 ruta** u aplikaciji bez grešaka ili upozorenja.

---

## K. Sledeći koraci (Prioriteti)

1. **Zadatak 1: Pokretanje Prisma migracija za CMS modele**
   - *Zašto:* Omogućava rad sa novim tabelama (`MediaAsset`, `Page`, `SiteSetting`) u PostgreSQL bazi.
   - *Fajlovi:* `prisma/schema.prisma`
   - *Složenost:* Mala.
2. **Zadatak 2: Implementacija Admin Autentifikacije (Login i Zaštita rute)**
   - *Zašto:* Sprečava neovlašćeni pristup administratoru i obezbeđuje `/admin` rute.
   - *Fajlovi:* `src/app/admin/login/page.tsx`, middleware ili sesijska provera u `src/app/admin/layout.tsx`.
   - *Složenost:* Srednja.
3. **Zadatak 3: Implementacija vizuelnog interfejsa Medijske biblioteke (`/admin/media`)**
   - *Zašto:* Povezivanje postojećih `media-actions.ts` sa UI-jem za pregled, upload i brisanje slika.
   - *Fajlovi:* `src/app/admin/media/page.tsx`, nove UI komponente.
   - *Složenost:* Srednja.
