# Revizija Prisma šeme (Prisma Schema Audit) - Aqua Still Zlatibor

Ovaj dokument predstavlja detaljnu reviziju (audit) postojeće Prisma šeme (`prisma/schema.prisma`) u odnosu na zahteve za razvoj nativnog, modularnog e-commerce backend-a za **Aqua Still Zlatibor**, u skladu sa planom iz `docs/commerce-engine-plan.md`.

---

## 1. Postojeći modeli i njihova namena

Postojeća šema sadrži čvrstu osnovu za osnovne entitete:
- **`Category` i `Subcategory`**: Definišu hijerarhijsku strukturu asortimana (Alati, Vodovod, Kupatila, Navodnjavanje) sa slug-ovima, brojem artikala i ikonama.
- **`Brand`**: Čuva spisak brendova (Makita, Bosch, Peštan, Grohe, itd.) sa jedinstvenim imenima i slug-ovima.
- **`Product`**: Centralni model koji čuva artikle sa SKU-om, barkodom, nazivom, cenama (`price`, `salePrice`), PDV stopom (`vatRate`), zalihama (`inStock`, `stockQuantity`), WMS lokacijom magacina, opisima, nizom slika, JSON atributima i promo oznakama.
- **`Order`**: Model za čuvanje kreiranih porudžbina sa sačuvanim podacima o kupcu (`customer_info` JSON) i stavkama (`items` JSON).
- **`User`, `Account`, `Session`, `VerificationToken`**: Standardna šema za autentifikaciju (kompatibilna sa Auth.js / NextAuth) sa rolama (`editor`, `admin`).

---

## 2. Nedostaci postojeće šeme (Gaps & Limitations)

1. **Upravljanje korpom (Cart):**
   - Trenutno ne postoje modeli `Cart` i `CartItem` u bazi (korpa se oslanja na klijentski `localStorage`). Za ulogovane korisnike i sinhronizaciju između uređaja neophodni su tabele u bazi.
2. **Stavke porudžbine (Order Items):**
   - Model `Order` čuva stavke u JSON formatu umesto relacione tabele `OrderItem`. To onemogućava naprednu analitiku prodaje, praćenje pojedinačnih artikala po porudžbinama i relacije sa modelom `Product`.
3. **Adrese i podaci kupaca:**
   - Model `Order` koristi JSON polje `customer_info` umesto strukturirane relacione tabele za adrese isporuke i računa (`Address`), što otežava ponovnu kupovinu i adresar korisnika.
4. **Varijante proizvoda (Product Variants):**
   - Model `Product` trenutno drži sve atribute i cene direktno na sebi. Ukoliko proizvod ima više varijanti (npr. različite dimenzije cevi ili napone baterija sa različitim cenama i zalihama), potreban je odvojen model `ProductVariant`.
5. **Popusti i Promo kodovi:**
   - Ne postoji model za upravljanje kuponima i popustima (`DiscountCode`).

---

## 3. Predložene izmene u postojećim modelima

- **`Product`**: Zadržati osnovna polja, ali pripremiti relaciju ka budućim varijantama i stavkama korpe/porudžbine.
- **`Order`**: Zameniti ili dopuniti JSON polja relacionim tabelama `OrderItem` radi lakšeg praćenja zaliha i finansijskog izveštavanja.
- **`User`**: Dodati relaciju ka tabelama `Cart`, `Address` i `Order`.

---

## 4. Modeli koje treba dodati (Prisma Schema Additions)

### 4.1. Korpa i Stavke korpe (`Cart` & `CartItem`)
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
```

### 4.2. Adrese kupaca (`Address`)
```prisma
model Address {
  id           String   @id @default(cuid())
  userId       String   @map("user_id")
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName     String   @map("full_name")
  phone        String
  street       String
  city         String
  postalCode   String   @map("postal_code")
  country      String   @default("Srbija")
  isDefault    Boolean  @default(false) @map("is_default")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("addresses")
}
```

### 4.3. Stavke porudžbine (`OrderItem`)
```prisma
model OrderItem {
  id          String   @id @default(cuid())
  orderId     String   @map("order_id")
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String   @map("product_id")
  product     Product  @relation(fields: [productId], references: [id])
  productName String   @map("product_name")
  sku         String
  price       Decimal  @db.Decimal(12, 2)
  quantity    Int
  total       Decimal  @db.Decimal(12, 2)
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("order_items")
}
```

### 4.4. Promo kodovi (`DiscountCode`)
```prisma
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

## 5. Redosled implementacije (Faza 1 - Priprema baze)

1. **Kreiranje rezervne kopije / provera baze:** Osigurati da je PostgreSQL baza `aquastill_dev` stabilna.
2. **Ažuriranje `prisma/schema.prisma`:** Dodavanje novih modela (`Cart`, `CartItem`, `Address`, `OrderItem`, `DiscountCode`) i uspostavljanje relacija ka `Product`, `Order` i `User`.
3. **Izvršavanje razvojne migracije (`npx prisma migrate dev`):** Kreiranje tabele u bazi bez brisanja postojećih podataka.
4. **Testiranje seed skripte:** Provera da li `prisma/seed.ts` i dalje uspešno puni bazu sa novom šemom.

---

## 6. Potencijalni rizici i mitigacija

- **Rizik:** Gubitak podataka pri izmeni šeme.
  - *Mitigacija:* Korišćenje `prisma migrate dev` sa novim migracijama umesto `db push` u produkciji; zadržavanje postojećih kolona netaknutim.
- **Rizik:** Nekompatibilnost JSON polja u starim narudžbinama sa novim `OrderItem` modelom.
  - *Mitigacija:* Zadržavanje JSON polja `items` u `Order` modelu tokom tranzicionog perioda dok se ne uspostavi puna migracija na relacioni model.
