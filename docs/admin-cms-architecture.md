# Arhitektura administracije i CMS sistema — Aqua Still Zlatibor

Ovaj dokument predstavlja sveobuhvatnu analizu (audit) postojećeg stanja projekta, identifikovane probleme (uključujući problem sa korpom i „Proizvod nije pronađen”), predloženu arhitekturu sopstvenog e-commerce CMS-a (alternative za WordPress + Elementor Pro), potrebne Prisma modele, sistem upravljanja medijima, vizuelni editor i plan implementacije po fazama.

---

## 1. Analiza trenutnog stanja projekta (Audit)

### 1.1. Next.js aplikacija i App Router
- **Framework:** Next.js 16 (App Router) sa React 19, TypeScript i Tailwind CSS v4.
- **Postojeće rute:** `/` (početna), `/katalog` (sve proizvode i filteri), `/katalog/[categorySlug]` (kategorije), `/proizvod/[slug]` (detalji proizvoda), `/placanje` (checkout), `/porudzbina/[orderNumber]` (potvrda).
- **Stanje:** Osnovne javne stranice su uspostavljene i uspešno se kompiliraju (`npm run build`).

### 1.2. Prisma šema i postojeći modeli (`prisma/schema.prisma`)
- **Postojeći modeli:** `Category`, `Subcategory`, `Brand`, `Product`, `Order`, `OrderItem`, `Cart`, `CartItem`, `Address`, `DiscountCode`, `User`, `Account`, `Session`, `VerificationToken`.
- **Stanje:** Šema je proširena sa e-commerce modelima, ali tabele u bazi još uvek nisu sinhronizovane preko migracija (`prisma migrate dev`).

### 1.3. Proizvodi, kategorije i brendovi
- **Stanje:** Podaci se trenutno dele između statičkih mock podataka (`src/lib/mock-data.ts`) i servisnog sloja (`src/services/product-service.ts`) koji pokušava da čita iz baze sa fallback-om na mock podatke ako baza nije dostupna ili nema zapisa.

### 1.4. Korpa (`CartContext` i `CartDrawer`) i Server Actions
- **Stanje:** Korpa koristi `localStorage` za goste, ali pri dodavanju u korpu poziva Server Action `validateAndGetProduct` koja vrši upit ka bazi (`db.product.findFirst`).

### 1.5. Identifikacija problema: „Proizvod nije pronađen”
- **Glavni uzrok:** Postoji neusklađenost (mismatch) između identifikatora proizvoda koji se čuvaju u klijentskom `localStorage` (iz `mock-data.ts`, npr. `id: "tool-1"`) i identifikatora u PostgreSQL bazi (ukoliko je baza seed-ovana sa CUID-jevima preko Prisme). Kada Server Action `validateAndGetProduct` pokuša da pronađe proizvod po ID-ju `"tool-1"` u bazi, ne nalazi ga i baca grešku `Proizvod nije pronađen`.
- **Rešenje:** Jedinstveni ID format između mock podataka i baze, ili robusniji lookup na serveru po `id` ILI `slug` ILI `sku` sa automatskim fallback-om na mock podatke ukoliko ID iz localStorage-a pripada mock asortimanu.

### 1.6. Autentifikacija, Media Storage i Stilovi
- **Autentifikacija:** Postoje modeli za korisnike i sesije, ali nedostaje kompletan sistem prijave za administratore (`/admin/login`) sa proverom uloga (`role === 'admin'`).
- **Media Storage:** Trenutno ne postoji centralizovana medijska biblioteka; koriste se statički placeholder fajlovi iz `/public/`.
- **Stilovi:** Tailwind CSS v4 sa definisanim bojama i komponentama.

---

## 2. Predložena arhitektura CMS-a i Administracije

### 2.1. Arhitektura rute `/admin`
- Zaštićene rute pod `/admin/*` sa middleware-om koji proverava admin sesiju i ulogu.
- **Layout:** Responzivni SaaS dashboard sa bočnom navigacijom (Sidebar), gornjom trakom (Topbar) i glavnim radnim prostorom.

### 2.2. Vizuelni editor stranica (Alternativa Elementoru)
- **Struktura ekrana:**
  - **Leva strana:** Panel sa komponentama (Naslov, Tekst, Slika, Dugme, Hero, Grid proizvoda, Baner, itd.) i podešavanjima selektovane sekcije.
  - **Sredina:** Live vizuelni prikaz stranice.
  - **Desna strana:** Struktura stranice (Layer tree / redosled sekcija).
- **Format čuvanja:** JSON struktura u bazi (Model `Page` sa poljem `contentJson`), koja se na javnom sajtu renderuje kroz server komponente bez rizika od izvršavanja proizvoljnog HTML/JS-a.

### 2.3. Sistem za upravljanje medijima (Media Library)
- Centralni model `MediaAsset` u bazi sa URL-om, nazivom, alt tekstom, tipom i veličinom.
- Skladištenje: Apstrakcija fajl skladišta (`src/lib/storage.ts`) sa lokalnim čuvanjem u `public/uploads/` i strukturom spremnom za S3.

---

## 3. Potrebni Prisma modeli za CMS

```prisma
model Page {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  contentJson Json     @default("[]")
  seoTitle    String?  @map("seo_title")
  seoDescription String? @map("seo_description")
  isPublished Boolean  @default(false) @map("is_published")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("pages")
}

model MediaAsset {
  id        String   @id @default(cuid())
  filename  String
  url       String
  mimeType  String   @map("mime_type")
  size      Int
  altText   String?  @map("alt_text")
  folder    String   @default("general") // logo, hero, products, categories, etc.
  createdAt DateTime @default(now()) @map("created_at")

  @@map("media_assets")
}

model SiteSetting {
  id    String @id @default(cuid())
  key   String @unique
  value Json

  @@map("site_settings")
}
```

---

## 4. Plan implementacije po fazama i procena složenosti

| Faza | Opis | Složenost | Procena |
| :--- | :--- | :--- | :--- |
| **Faza 1** | Audit, Arhitektura i Rešenje korpe (popravka „Proizvod nije pronađen”) | Srednja | 1 dan |
| **Faza 2** | Admin Dashboard Layout i Navigacija (`/admin`) | Niska | 1 dan |
| **Faza 3** | Medijska biblioteka i Upload sistem | Srednja | 1-2 dana |
| **Faza 4** | Upravljanje proizvodima, kategorijama i brendovima u adminu | Srednja | 2 dana |
| **Faza 5** | Upravljanje porudžbinama i kupcima | Niska | 1 dan |
| **Faza 6** | Vizuelni editor stranica (JSON schema builder) | Visoka | 3-4 dana |
| **Faza 7** | Upravljanje početnom stranicom i globalnim dizajnom | Srednja | 2 dana |
| **Faza 8** | SEO, Statetičke stranice i Podešavanja | Niska | 1 dan |
| **Faza 9** | Autentifikacija, bezbednost i zaštita admin ruta | Srednja | 1 dan |
| **Faza 10** | Optimizacija performansi, testiranje i produkcijski build | Srednja | 1 dan |

---

## 5. Rešenje problema „Proizvod nije pronađen” u korpi
Kako bi se trajno rešio problem sa korpom:
1. U Server Action-u `validateAndGetProduct`, ukoliko prosleđeni ID nije pronađen u bazi (jer je u pitanju mock ID poput `tool-1`), sistem treba automatski da potraži proizvod u `mock-data.ts` po ID-ju ili slug-u i vrati ga.
2. Time se omogućava da korpa radi besprekorno i sa bazom i sa mock podacima dok administrator u potpunosti ne unese proizvode u novu bazu kroz admin panel.
