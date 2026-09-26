# Strategija rezervnih kopija (Backup) i čuvanja van VPS-a

Ovaj dokument definiše proceduru za kreiranje redovnih rezervnih kopija (backup-a) PostgreSQL baze podataka i otpremanje kopija na spoljnu lokaciju van produkcionog VPS-a.

---

## 1. Automatizovani Backup na VPS-u (Cron job)

Kreirajte skriptu na VPS-u, npr. `/usr/local/bin/aquastill-backup.sh`:

```bash
#!/bin/bash
# Konfiguracija
BACKUP_DIR="/var/backups/aquastill"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_CONTAINER="aquastill-postgres"
DB_NAME="aquastill_prod"
DB_USER="aquastill_user"

mkdir -p $BACKUP_DIR

# 1. Kreiranje SQL dump-a iz PostgreSQL kontejnera
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/db_$DATE.sql"

# 2. Kompresija backup-a
gzip "$BACKUP_DIR/db_$DATE.sql"

# 3. Brisanje backup-a starijih od 30 dana lokalno
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -exec rm {} \;

echo "Backup kreiran uspešno: db_$DATE.sql.gz"
```

Dodelite prava izvršavanja skripti:
```bash
sudo chmod +x /usr/local/bin/aquastill-backup.sh
```

Podesite Cron da se backup izvršava svakog dana u 03:00 ujutru:
```bash
sudo crontab -e
```
Dodajte liniju:
```cron
0 3 * * * /usr/local/bin/aquastill-backup.sh >> /var/log/aquastill-backup.log 2>&1
```

---

## 2. Čuvanje rezervnih kopija van VPS-a (Off-site backup)

Radi zaštite u slučaju otkazivanja hardvera na VPS-u, preporučuje se automatska sinhronizacija backup foldera sa eksternim skladištem (npr. **AWS S3**, **Backblaze B2**, **Google Cloud Storage** ili udaljeni SFTP server).

### Primer slanja na S3 kompatibilni Storage (rclone):
1. Instalirajte i konfigurišite `rclone`:
   ```bash
   sudo apt install rclone
   rclone config
   ```
2. Dodajte komandu na kraj `/usr/local/bin/aquastill-backup.sh`:
   ```bash
   # Sinhronizacija sa udaljenim S3 bucket-om
   rclone sync $BACKUP_DIR remote:aquastill-backups-bucket
   ```

---

## 3. Vraćanje baze iz rezervne kopije (Restore)

U slučaju havarije, baza se vraća komandom:
```bash
gunzip -c /var/backups/aquastill/db_YYYY-MM-DD_HH-MM-SS.sql.gz | docker exec -i aquastill-postgres psql -U aquastill_user -d aquastill_prod
```
