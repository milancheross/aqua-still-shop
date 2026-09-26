# Instalacija i podešavanje PostgreSQL-a na Windowsu (Lokalni razvoj)

Ovaj vodič objašnjava kako da brzo instalirate i pokrenete PostgreSQL na Windows operativnom sistemu za potrebe lokalnog razvoja projekta **Aqua Still Zlatibor**.

---

## Opcija 1: Instalacija putem zvaničnog instalera (Preporučeno)

1. Preuzmite PostgreSQL Windows installer sa zvaničnog sajta: [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Pokrenite preuzeti `.exe` fajl i pratite instalacioni čarobnjak:
   - **Installation Directory:** `C:\Program Files\PostgreSQL\16` (ili novija verzija)
   - **Components:** Označite `PostgreSQL Server`, `pgAdmin 4` (opciono grafičko okruženje) i `Command Line Tools`.
   - **Data Directory:** Ostavite podrazumevanu putanju.
   - **Password:** Postavite bezbednu lozinku za superkorisnika `postgres` (npr. `postgres` ili sopstvenu lozinku).
   - **Port:** Ostavite standardni port `5432`.
3. Završite instalaciju.

---

## Opcija 2: Instalacija putem Docker-a (Alternative)

Ako već koristite Docker Desktop na Windowsu, pokretanje PostgreSQL-a je najjednostavnije jednom komandom u terminalu:

```powershell
docker run --name aquastill-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=aquastill_dev -p 5432:5432 -d postgres:16-alpine
```

---

## Kreiranje baze podataka i povezivanje sa aplikacijom

1. Otvorite terminal (PowerShell ili pgAdmin Query Tool) i povežite se na PostgreSQL:
   ```powershell
   psql -U postgres
   ```
2. Kreirajte razvojnu bazu podataka:
   ```sql
   CREATE DATABASE aquastill_dev;
   ```
3. U root direktorijumu projekta kreirajte `.env.local` fajl (možete kopirati iz `.env.example`) i podesite `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aquastill_dev?schema=public"
   ```
4. Pokrenite Prisma migracije i seed skriptu:
   ```powershell
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
