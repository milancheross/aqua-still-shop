# Plan izrade sopstvenog e-commerce backend-a za Aqua Still Zlatibor

Ovaj dokument predstavlja sveobuhvatnu analizu, arhitekturu, spisak modula, Prisma modele, API strukturu i plan razvoja za izgradnju nativnog, modularnog e-commerce backend-a unutar postojećeg Next.js 16 projekta, čime se u potpunosti uklanja zavisnost od Medusa Commerce-a.

---

## 1. Analiza trenutnog projekta

### 1.1. Postojeća struktura
- **Frontend i Framework:** Next.js 16 (App Router) sa React 19, TypeScript i Tailwind CSS v4.
- **Baza podataka i ORM:** PostgreSQL 16 (pokrenut u Docker kontejneru `aquastill-postgres`, baza `aquastill_dev`) sa Prisma ORM 6.
- **Postojeći podaci i modeli (`prisma/schema.prisma`):**
  - `Category`, `Subcategory`, `Brand`, `Product` (sa šiframa, barkodovima, cenama, PDV stopama, zalihama, WMS lokacijama i JSON atributima).
  - `Order` (sa čuvanjem kupaca i stavki).
  - `User`, `Account`, `Session`, `VerificationToken` (osnova za Auth.js / autentifikaciju).
- **Frontend komponente i logika:**
  - Katalog proizvoda (`src/app/katalog/page.tsx`) sa naprednim filterima po kategorijama, brendovima, zalihama i pretragom.
  - Korpa (`src/lib/cart-context.tsx`) sa čuvanjem u `localStorage` i `CartDrawer` komponentom.
  - Statički mock podaci u `src/lib/mock-data.ts` koji se trenutno koriste za prikaz artikala.

### 1.2. Šta zadržavamo
- Kompletan vizuelni identitet, dizajn, Tailwind stilove i komponente Next.js frontenda.
- Postojeću šemu baze podataka i Prisma ORM konfiguraciju.
- Postojeće proizvode, kategorije i brendove iz seed skripte.
- Arhitekturu sa Next.js Server Actions i API rutama.

### 1.3. Uočeni problemi i izazovi
- Trenutna korpa se čuva isključivo klijentski (`localStorage`) bez sinhronizacije sa bazom podataka za ulogovane korisnike.
- Nedostaje centralizovani sloj za obradu porudžbina, upravljanje zalihama (WMS), dinamičke popuste, sisteme plaćanja (Stripe / DinaCard / gotovina pouzećem) i generisanje faktura/PDF računa.

---

## 2. Predložena arhitektura

Sistem se zasniva na **modularnoj monolitnoj arhitekturi** unutar Next.js 16 aplikacije:
- **Data Layer:** Prisma ORM 6 + PostgreSQL 16.
- **Business Logic Layer:** Servisni sloj (`src/services/`) podeljen po e-commerce domenima (modulima).
- **Interface Layer:** Next.js Server Actions za mutacije i API rute (`src/app/api/`) za eksterne integracije, webhook-ove i klijentska dohvatanja podataka.
- **Authentication:** Auth.js (NextAuth) za upravljanje korisnicima i sesijama.

---

## 3. Spisak modula

### 3.1. Autentifikacija i Autorizacija (`auth`)
- **Odgovornost:** Upravljanje registracijom, prijavom, sesijama i rolama korisnika (`customer`, `editor`, `admin`).
- **Zavisnosti:** Nema (osnovni modul).
- **Prisma modeli:** `User`, `Account`, `Session`, `VerificationToken`.
- **API / Server Actions:** Auth.js endcointi, `loginAction`, `registerAction`, `updateProfile`.
- **Testiranje:** Unit testovi za autorizacione middleware-e i end-to-end testovi prijave.

### 3.2. Proizvodi i Varijante (`products`)
- **Odgovornost:** Upravljanje artiklima, specifikacijama, jedinicama mere i WMS lokacijama u magacinu.
- **Zavisnosti:** Kategorije, brendovi.
- **Prisma modeli:** `Product`, `Brand`.
- **API / Server Actions:** `getProducts()`, `getProductBySlug()`, `createProduct()`, `updateProduct()`.
- **Testiranje:** Integracioni testovi za pretragu, filtriranje i paginaciju.

### 3.3. Kategorije i Brendovi (`categories`)
- **Odgovornost:** Hijerarhijska struktura kategorija, podkategorija i filtriranje po brendovima.
- **Zavisnosti:** Nema.
- **Prisma modeli:** `Category`, `Subcategory`, `Brand`.
- **API / Server Actions:** `getCategories()`, `getCategoryHierarchy()`.
- **Testiranje:** Unit testovi za hijerarhijske upite.

### 3.4. Cene i Promocije (`pricing`)
- **Odgovornost:** Upravljanje redovnim i akcijskim cenama, PDV stopama (20%) i promo kodovima.
- **Zavisnosti:** Proizvodi.
- **Prisma modeli:** Proširenje modela `Product` (`price`, `salePrice`, `vatRate`) + novi model `DiscountCode`.
- **API / Server Actions:** `validatePromoCode()`, `calculateTax()`.
- **Testiranje:** Testovi izračunavanja popusta i poreza.

### 3.5. Zalihe i Magacin (`inventory`)
- **Odgovornost:** Praćenje količina na stanju, statusa dostupnosti i WMS lokacija u magacinu Zlatibor.
- **Zavisnosti:** Proizvodi.
- **Prisma modeli:** Polja `inStock`, `stockQuantity`, `wmsLocation` na modelu `Product`.
- **API / Server Actions:** `updateStock()`, `checkAvailability()`.
- **Testiranje:** Testovi provere zaliha pri naručivanju.

### 3.6. Korpa (`cart`)
- **Odgovornost:** Upravljanje stavkama korpe (hibridno: localStorage za goste + baza za ulogovane).
- **Zavisnosti:** Proizvodi, cene.
- **Prisma modeli:** `Cart`, `CartItem`.
- **API / Server Actions:** `getCart()`, `addToCart()`, `removeFromCart()`, `updateCartItemQuantity()`.
- **Testiranje:** Testovi sinkronizacije korpe i proračuna podzbirova i dostave.

### 3.7. Checkout (`checkout`)
- **Odgovornost:** Prikupljanje podataka o kupcu, adresi isporuke, izboru dostave i načinu plaćanja.
- **Zavisnosti:** Korpa, kupci, dostava, plaćanja.
- **Prisma modeli:** Privremeni ili tranzicioni podaci u sesiji/bazi.
- **API / Server Actions:** `processCheckout()`.
- **Testiranje:** E2E testovi celog procesa naručivanja.

### 3.8. Porudžbine (`orders`)
- **Odgovornost:** Kreiranje i praćenje statusa porudžbina (`pending`, `processing`, `shipped`, `delivered`, `cancelled`).
- **Zavisnosti:** Checkout, Proizvodi, Korpa.
- **Prisma modeli:** `Order`, `OrderItem`.
- **API / Server Actions:** `createOrder()`, `getOrders()`, `updateOrderStatus()`.
- **Testiranje:** Integracioni testovi kreiranja porudžbina i smanjenja zaliha.

### 3.9. Kupci (`customers`)
- **Odgovornost:** Upravljanje profilima kupaca, istorijom porudžbina i adresama.
- **Zavisnosti:** Autentifikacija, Porudžbine.
- **Prisma modeli:** `User`, `Address`.
- **API / Server Actions:** `getCustomerProfile()`, `getCustomerOrders()`.
- **Testiranje:** Testovi izolacije podataka po korisnicima.

### 3.10. Dostava (`shipping`)
- **Odgovornost:** Izračunavanje troškova dostave (besplatna dostava iznad 5.000 RSD, fiksna cena 500 RSD).
- **Zavisnosti:** Korpa.
- **Prisma modeli Konfiguracija:** Podešavanja u bazi ili konstante.
- **API / Server Actions:** `calculateShippingCost()`.
- **Testiranje:** Unit testovi graničnih vrednosti za besplatnu dostavu.

### 3.11. Plaćanja (`payments`)
- **Odgovornost:** Integracija procesora plaćanja (pouzećem, platne kartice, virman).
- **Zavisnosti:** Porudžbine.
- **Prisma modeli:** Polje `paymentStatus` i `paymentMethod` na modelu `Order`.
- **API / Server Actions:** `createPaymentIntent()`, webhook rute.
- **Testiranje:** Testovi simulacije plaćanja.

### 3.12. Administracija (`admin`)
- **Odgovornost:** Dashboard za upravljanje proizvodima, porudžbinama, zalihama i kupcima.
- **Zavisnosti:** Svi moduli.
- **Prisma modeli:** Pristup svim modelima kroz admin role.
- **API / Server Actions:** Admin Server Actions sa proverom dozvola.
- **Testiranje:** Autorizacioni testovi (zabrana pristupa non-admin korisnicima).

### 3.13. API (`api`)
- **Odgovornost:** Eksterni REST API endcointi za mobilne aplikacije ili partnere.
- **Zavisnosti:** Svi moduli.
- **Prisma modeli:** Svi modeli.
- **API rute:** `/api/v1/products`, `/api/v1/categories`, `/api/v1/orders`.
- **Testiranje:** API testovi (Supertest / Jest).

### 3.14. Email obaveštenja (`notifications`)
- **Odgovornost:** Slanje email potvrda porudžbina, statusa isporike i resetovanja lozinke.
- **Zavisnosti:** Porudžbine, Korisnici.
- **Alati:** Resend / Nodemailer.
- **API / Server Actions:** `sendOrderConfirmationEmail()`.
- **Testiranje:** Mocking email servisa u testovima.

### 3.15. Pozadinski zadaci (`jobs`)
- **Odgovornost:** Čišćenje napuštenih korpi, ažuriranje statusa, sinhronizacija magacina.
- **Zavisnosti:** Korpa, Porudžbine.
- **API / Server Actions:** Cron poslovi / API rute za pozadinske zadatke.

### 3.16. Logovanje i bezbednost (`security`)
- **Odgovornost:** Rate limiting, audit logovi, bezbednosni zaglavlja, validacija ulaza preko Zod-a.
- **Zavisnosti:** Svi moduli.
- **Alati:** Zod, Next.js security headers.

---

## 4. Prisma modeli koje treba napraviti (Dopuna)

Pored postojećih modela (`Category`, `Subcategory`, `Brand`, `Product`, `Order`, `User`, `Account`, `Session`, `VerificationToken`), dodajemo:

```prisma
model Cart {
  id        String     @id @default(cuid())
  userId    String?    @unique @map("user_id")
  user      User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  @@map("carts")
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String   @map("cart_id")
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String   @map("product_id")
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("cart_items")
}

model DiscountCode {
  id          String   @id @default(cuid())
  code        String   @unique
  discountPct Float?   @map("discount_pct")
  fixedAmount Decimal? @db.Decimal(12, 2) @map("fixed_amount")
  validUntil  DateTime @map("valid_until")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("discount_codes")
}
```

---

## 5. API struktura

- **Server Actions:** Smešteni u `src/actions/` (npr. `cart.actions.ts`, `order.actions.ts`, `product.actions.ts`).
- **REST API (`src/app/api/`):**
  - `/api/v1/products` - Lista i filtriranje proizvoda
  - `/api/v1/products/[slug` - Detalji proizvoda
  - `/api/v1/categories` - Lista kategorija
  - `/api/v1/cart` - Upravljanje korpom
  - `/api/v1/checkout` - Kreiranje narudžbine
  - `/api/v1/webhooks/payment` - Webhook za obradu plaćanja

---

## 6. Plan razvoja po fazama

- **Faza A:** Proširenje šeme baze podataka (Dodavanje `Cart`, `CartItem`, `DiscountCode` i migracija).
- **Faza B:** Servisni sloj i Server Actions (Implementacija logike za korpu, proizvode i porudžbine).
- **Faza C:** Povezivanje Frontenda sa novim backend-om (Zamena mock podataka i localStorage korpe sa server actions/bazu).
- **Faza D:** Checkout, plaćanje i email obaveštenja.
- **Faza E:** Admin Panel i API endcointi.
- **Faza F:** Testiranje i priprema za produkciju.

---

## 7. Plan testiranja
- **Unit testovi:** Jest za validacije, cene, izračunavanje popusta i dostave.
- **Integracioni testovi:** Testiranje Prisma upita i Server Actions.
- **E2E testovi:** Playwright za testiranje celog korisničkog puta (pretraga -> dodavanje u korpu -> checkout -> porudžbina).

---

## 8. Plan prelaska na VPS
1. Priprema produkcijskog PostgreSQL servera na VPS-u.
2. Konfiguracija produkcijskih environment promenljivih (`DATABASE_URL`, Auth secret, itd.).
3. Izvršavanje Prisma migracija na produkciji (`prisma migrate deploy`).
4. Pokretanje seed skripte za osnovne podatke (`prisma db seed`).
5. Deployment Next.js aplikacije (Docker / PM2 / Vercel).
6. Potpuno uklanjanje `backend/` Medusa foldera iz repozitorijuma.
