-- ============================================================================
-- Aqua Still Zlatibor - Supabase Seed Data (Preserving existing test products)
-- ============================================================================

-- 1. Categories
INSERT INTO categories (id, name, slug, description, item_count, icon_name) VALUES
('cat-alati', 'Alati i oprema', 'alati', 'Profesionalni i hobi električni i ručni alati, pribor i oprema za majstore i radionice.', 420, 'wrench'),
('cat-vodovod', 'Vodovod i kanalizacija', 'vodovod', 'Cevi, fiting, ventili, pumpe i kompletan materijal za vodovodne instalacije.', 380, 'droplet'),
('cat-kupatila', 'Kupatilska oprema i sanitarije', 'kupatila', 'Baterije za kadu i lavabo, sanitarije, tuš program i moderna oprema za kupatila.', 290, 'bath'),
('cat-navodnjavanje', 'Sistemi za navodnjavanje', 'navodnjavanje', 'Sve za profesionalno navodnjavanje voćnjaka, bašti, parkova i plastenika.', 215, 'sprout')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. Subcategories
INSERT INTO subcategories (id, category_id, name, slug, item_count) VALUES
('sub-aku-busilice', 'cat-alati', 'Aku bušilice i odvijači', 'aku-busilice', 110),
('sub-brusilice', 'cat-alati', 'Ugaone brusilice', 'brusilice', 85),
('sub-rucni-alat', 'cat-alati', 'Ručni alati i ključevi', 'rucni-alat', 145),
('sub-testere', 'cat-alati', 'Testere i cirkulari', 'testere', 80),
('sub-cevi', 'cat-vodovod', 'Cevi i kanali', 'cevi', 120),
('sub-fiting', 'cat-vodovod', 'Fiting i spojnice', 'fiting', 130),
('sub-ventili', 'cat-vodovod', 'Kugla ventili i zasuni', 'ventili', 75),
('sub-pumpe-voda', 'cat-vodovod', 'Pumpe za vodu i hidrofori', 'pumpe-za-vodu', 55),
('sub-baterije', 'cat-kupatila', 'Slavine i baterije', 'slavine-i-baterije', 110),
('sub-sanitarije', 'cat-kupatila', 'Sanitarije i ugradni sistemi', 'sanitarije', 95),
('sub-tus-program', 'cat-kupatila', 'Tuš kabine i stubovi', 'tus-program', 50),
('sub-namestaj', 'cat-kupatila', 'Kupatilski nameštaj', 'kupatilski-namestaj', 35),
('sub-kap-po-kap', 'cat-navodnjavanje', 'Sistemi kap po kap', 'kap-po-kap', 65),
('sub-prskalice', 'cat-navodnjavanje', 'Rasprskivači i rotori', 'prskalice', 60),
('sub-creva', 'cat-navodnjavanje', 'Baštenska i tehnička creva', 'creva', 50),
('sub-automatika', 'cat-navodnjavanje', 'Elektroventili i tajmeri', 'automatika', 40)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Brands
INSERT INTO brands (id, name, slug) VALUES
('brand-makita', 'Makita', 'makita'),
('brand-bosch', 'Bosch', 'bosch'),
('brand-dewalt', 'DeWalt', 'dewalt'),
('brand-unior', 'Unior', 'unior'),
('brand-pestan', 'Peštan', 'pestan'),
('brand-valvex', 'Valvex', 'valvex'),
('brand-pedrollo', 'Pedrollo', 'pedrollo'),
('brand-grohe', 'Grohe', 'grohe'),
('brand-hansgrohe', 'Hansgrohe', 'hansgrohe'),
('brand-geberit', 'Geberit', 'geberit'),
('brand-rain-bird', 'Rain Bird', 'rain-bird'),
('brand-gardena', 'Gardena', 'gardena'),
('brand-hunter', 'Hunter', 'hunter')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. Products (Test Products from mock-data.ts)
INSERT INTO products (
  id, sku, barcode, name, slug, brand, category_slug, category_name,
  subcategory_slug, subcategory_name, price, sale_price, vat_rate, unit,
  in_stock, stock_quantity, wms_location, short_description, description,
  images, pdf_manual_url, attributes, is_featured, is_promo
) VALUES
(
  'prod-1', 'MAK-DHP485Z', '0088381866385',
  'Makita DHP485Z Aku udarna bušilica-odvijač 18V (bez baterije i punjača)',
  'makita-dhp485z-aku-udarna-busilica-18v', 'Makita', 'alati', 'Alati i oprema',
  'aku-busilice', 'Aku bušilice i odvijači', 13990, 11990, 0.20, 'kom',
  true, 18, 'A-03-02-04',
  'Snažna udarna bušilica sa motorom bez četkica (Brushless), 50 Nm obrtnog momenta.',
  'Makita DHP485Z je kompaktna i izuzetno izdržljiva akumulatorska udarna bušilica. Opremljena je motorom bez četkica koji omogućava veću autonomiju rada i duži vek trajanja. Poseduje metalnu brzosteznu glavu 13mm i dvobrzinski prenosnik.',
  ARRAY['/placeholder-tool.svg'], NULL,
  '{"napon": "18V", "motor": "Brushless (bez četkica)", "prihvat": "13 mm", "obrtni_moment": "50 Nm", "broj_obrtaja": "0-500 / 0-1.900 min-1"}'::jsonb,
  true, true
),
(
  'prod-2', 'BOS-GSB18V50', '3165140982900',
  'Bosch Professional GSB 18V-50 Akumulatorska udarna bušilica',
  'bosch-professional-gsb-18v-50-aku-busilica', 'Bosch', 'alati', 'Alati i oprema',
  'aku-busilice', 'Aku bušilice i odvijači', 17490, NULL, 0.20, 'kom',
  true, 12, 'A-03-02-05',
  'Robustan motor bez četkica za teške poslove bušenja u zidu, drvetu i metalu.',
  'Inteligentni Brushless motor direktno komunicira sa elektronikom alata za optimalan rad i zaštitu od preopterećenja. Metalni futer 13 mm pruža maksimalan prenos snage.',
  ARRAY['/placeholder-tool.svg'], NULL,
  '{"napon": "18V", "motor": "Brushless (bez četkica)", "prihvat": "13 mm", "obrtni_moment": "50 Nm"}'::jsonb,
  true, false
),
(
  'prod-3', 'DEW-DWE4206', '5035048538203',
  'DeWalt DWE4206 Ugaona električna brusilica 115mm 1010W',
  'dewalt-dwe4206-ugaona-brusilica-115mm-1010w', 'DeWalt', 'alati', 'Alati i oprema',
  'brusilice', 'Ugaone brusilice', 10490, 9190, 0.20, 'kom',
  true, 24, 'A-01-04-02',
  'Kompaktna ugaona brusilica visoke efikasnosti sa No-Volt Release zaštitom.',
  'Sistem za izbacivanje prašine uklanja većinu čestica iz vazduha koji prolazi kroz motor, sprečavajući oštećenja i habanje. Meki start smanjuje trzaj pri pokretanju.',
  ARRAY['/placeholder-tool.svg'], NULL,
  '{"snaga": "850W - 1200W", "napon": "230V", "prihvat": "M14"}'::jsonb,
  false, true
),
(
  'prod-4', 'UNI-1201CB', '3838909120150',
  'Unior Garnitura viljuškasto-okastih ključeva u kartonu 6-22mm (17 kom)',
  'unior-garnitura-viljuskasto-okastih-kljuceva-6-22mm', 'Unior', 'alati', 'Alati i oprema',
  'rucni-alat', 'Ručni alati i ključevi', 15890, NULL, 0.20, 'pak',
  true, 9, 'A-02-01-08',
  'Hrom-vanadijumski kovani ključevi krunisani po DIN 3113 standardu.',
  'Unior profesionalni ključevi izradjeni od vrhunskog hrom-vanadijum čelika, kovani i u celosti ojačani. Dugovečan i pouzdan radionički komplet.',
  ARRAY['/placeholder-tool.svg'], NULL,
  '{"materijal": "Hrom-vanadijum", "broj_delova": "17 komada (6-22 mm)"}'::jsonb,
  false, false
),
(
  'prod-5', 'PES-3SK110-1000', '8605012304912',
  'Peštan 3P Niskošumna kanalizaciona cev fi 110 x 1000 mm',
  'pestan-3p-niskosumna-kanalizaciona-cev-110-1000', 'Peštan', 'vodovod', 'Vodovod i kanalizacija',
  'cevi', 'Cevi i kanali', 940, NULL, 0.20, 'kom',
  true, 140, 'B-01-01-01',
  'Troslojna bešumna cev za unutrašnju kanalizaciju sa integrisanom zaptivkom.',
  'Peštan 3P cevi izrađene su od mineralno ojačanog polipropilena. Pružaju znatno smanjenje buke protoka otpadnih voda i visoku otpornost na hemikalije i toplotu.',
  ARRAY['/placeholder-pipe.svg'], NULL,
  '{"precnik": "fi 110", "materijal": "PP mineralno ojačan", "duzina": "1000 mm"}'::jsonb,
  true, false
),
(
  'prod-6', 'PES-PPR25-PN20', '8605012308821',
  'Peštan PP-R Cev za toplu i hladnu vodu fi 25 mm PN20 (4m)',
  'pestan-ppr-cev-fi-25mm-pn20-4m', 'Peštan', 'vodovod', 'Vodovod i kanalizacija',
  'cevi', 'Cevi i kanali', 490, NULL, 0.20, 'kom',
  true, 220, 'B-01-02-03',
  'Polipropilenska cev za vodovodne instalacije, pritisak PN20.',
  'Ekološki materijal otporan na kamenac i koroziju. Koristi se za instalaciju pijaće tople i hladne vode u stambenim i industrijskim objektima.',
  ARRAY['/placeholder-pipe.svg'], NULL,
  '{"precnik": "fi 25", "materijal": "PP-R", "pritisak": "PN 20"}'::jsonb,
  false, false
),
(
  'prod-7', 'VAL-KV12-LEP', '5901234567891',
  'Valvex Kugla ventil sa leptir ručkom 1/2\" PN30 Ž-Ž',
  'valvex-kugla-ventil-leptir-rucka-1-2-pn30', 'Valvex', 'vodovod', 'Vodovod i kanalizacija',
  'ventili', 'Kugla ventili i zasuni', 680, 590, 0.20, 'kom',
  true, 85, 'B-03-01-14',
  'Mesingani kuglasti ventil sa punim protokom i crvenom leptir ručkom.',
  'Visokokvalitetni ventil za vodu i grejanje, testiran na radni pritisak do 30 bara. Telo od kovanog niklovanog mesinga.',
  ARRAY['/placeholder-valve.svg'], NULL,
  '{"precnik": "1/2\"", "materijal": "Mesing", "pritisak": "PN 30"}'::jsonb,
  false, true
),
(
  'prod-8', 'PED-TOP2', '8056789012345',
  'Pedrollo TOP 2 Potapajuća drenažna pumpa za čistu vodu',
  'pedrollo-top-2-potapajuca-pumpa', 'Pedrollo', 'vodovod', 'Vodovod i kanalizacija',
  'pumpe-voda', 'Pumpe za vodu i hidrofori', 18990, NULL, 0.20, 'kom',
  true, 7, 'B-04-03-01',
  'Italijanska potapajuća pumpa kapaciteta do 220 l/min (13.2 m³/h).',
  'Pedrollo TOP 2 je pogodna za drenažu bistre vode bez abrazivnih čestica. Odlična za pražnjenje poplavljenih podruma, rezervoara i bazena.',
  ARRAY['/placeholder-pump.svg'], NULL,
  '{"snaga": "370W", "protok": "2000+ l/h", "materijal": "Tehopolimer / Inox"}'::jsonb,
  true, false
),
(
  'prod-9', 'GRO-32815000', '4005176883204',
  'Grohe BauLoop Jednoručna stojeća slavina za lavabo',
  'grohe-bauloop-jednorucna-slavina-za-lavabo', 'Grohe', 'kupatila', 'Kupatilska oprema i sanitarije',
  'baterije', 'Slavine i baterije', 7990, 6690, 0.20, 'kom',
  true, 32, 'C-01-02-03',
  'Elegantna baterija sa Grohe Long-Life hromiranom obradom i EcoJoy perlatorom.',
  'Grohe BauLoop kombinuje moderan minimalistički dizajn sa vrhunskom tehnologijom. Opremljena je keramičkim mešačem 28 mm i perlatorom koji štedi do 50% vode.',
  ARRAY['/placeholder-faucet.svg'], NULL,
  '{"zavrsna_obrada": "Hrom sjaj", "montaza": "Stojeća (na lavabo)", "kartusa": "Keramički 28mm"}'::jsonb,
  true, true
),
(
  'prod-10', 'HAN-71400000', '4011097738246',
  'Hansgrohe Logis Jednoručna zidna baterija za kadu i tuš',
  'hansgrohe-logis-zidna-baterija-za-kadu', 'Hansgrohe', 'kupatila', 'Kupatilska oprema i sanitarije',
  'baterije', 'Slavine i baterije', 11990, NULL, 0.20, 'kom',
  true, 15, 'C-01-02-06',
  'Pouzdana nemačka baterija sa AirPower tehnologijom i keramičkim mešačem.',
  'Hansgrohe Logis nudi vrhunsku ergonomiju i dugovečnost. Zidna montaža na standardni razmak 150 mm sa S-priključcima i integrisanim prebacivačem kada/tuš.',
  ARRAY['/placeholder-faucet.svg'], NULL,
  '{"zavrsna_obrada": "Hrom sjaj", "montaza": "Zidna", "kartusa": "Keramički 35mm"}'::jsonb,
  false, false
),
(
  'prod-11', 'GEB-111300005', '4025416301294',
  'Geberit Duofix Delta Ugradni vodokotlić za suvu gradnju 112cm',
  'geberit-duofix-delta-ugradni-vodokotlic', 'Geberit', 'kupatila', 'Kupatilska oprema i sanitarije',
  'sanitarije', 'Sanitarije i ugradni sistemi', 24900, 21990, 0.20, 'kom',
  true, 11, 'C-03-01-01',
  'Samonoseći čelični ugradni element sa Delta rezervoarom za konzolnu WC šolju.',
  'Švajcarski standard pouzdanosti. Geberit Duofix element je potpuno zaštićen od kondenzacije i podržava dvokoličinsko ispiranje (3/6L) sa Delta aktivacionim tipkama.',
  ARRAY['/placeholder-toilet.svg'], NULL,
  '{"montaza": "Ugradna (skrivena)", "materijal": "Plastificirani čelik / PE"}'::jsonb,
  true, true
),
(
  'prod-12', 'RNB-5004PL-PC', '0779850123490',
  'Rain Bird 5004-Plus Rotor rasprskivač 3/4\" sa diznama (40-360°)',
  'rain-bird-5004-plus-rotor-rasprskivac', 'Rain Bird', 'navodnjavanje', 'Sistemi za navodnjavanje',
  'prskalice', 'Rasprskivači i rotori', 2190, NULL, 0.20, 'kom',
  true, 65, 'D-02-01-04',
  'Vodeći svetski rotor za travnjake sa tehnologijom Rain Curtain zavese kapi.',
  'Podesivi sektor navodnjavanja od 40° do 360°. Poseduje Flow Shut-off mehanizam koji omogućava isključivanje pojedinačnog rotora bez zaustavljanja cele zone.',
  ARRAY['/placeholder-sprinkler.svg'], NULL,
  '{"prikljucak": "3/4\"", "domet": "5 - 10 m", "materijal": "UV otporna plastika"}'::jsonb,
  true, false
),
(
  'prod-13', 'GAR-18036', '4078500012356',
  'Gardena Baštensko armirano crevo Comfort FLEX 1/2\" 25m',
  'gardena-bastensko-crevo-comfort-flex-1-2-25m', 'Gardena', 'navodnjavanje', 'Sistemi za navodnjavanje',
  'creva', 'Baštenska i tehnička creva', 3690, NULL, 0.20, 'kom',
  true, 40, 'D-01-03-02',
  'Crevo sa Power Grip profilom, otporno na pritisak do 25 bara i uvijanje.',
  'Kvalitetno spiralno pletivo osigurava optimalnu fleksibilnost bez prelamanja i gužvanja creva. Ne sadrži ftalate i teške metale.',
  ARRAY['/placeholder-hose.svg'], NULL,
  '{"prikljucak": "1/2\"", "pritisak": "PN 25", "duzina": "25 m"}'::jsonb,
  false, false
),
(
  'prod-14', 'HNT-PGV101', '0886543210987',
  'Hunter PGV-101 Elektromagnetni ventil 1\" Ž-Ž sa kontrolom protoka (24VAC)',
  'hunter-pgv-101-elektromagnetni-ventil-1', 'Hunter', 'navodnjavanje', 'Sistemi za navodnjavanje',
  'automatika', 'Elektroventili i tajmeri', 3290, NULL, 0.20, 'kom',
  true, 30, 'D-03-02-01',
  'Robusni 24V elektromagnetni ventil za automatsko navodnjavanje sa regulatorom protoka.',
  'Industrijski standard za pouzdano upravljanje zonama navodnjavanja. Visokokvalitetna membrana sa dvostrukom ivicom za rad bez curenja.',
  ARRAY['/placeholder-valve.svg'], NULL,
  '{"prikljucak": "1\"", "napon": "24V AC", "protok": "500 - 1500 l/h"}'::jsonb,
  false, false
)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  price = EXCLUDED.price, 
  sale_price = EXCLUDED.sale_price,
  stock_quantity = EXCLUDED.stock_quantity;
