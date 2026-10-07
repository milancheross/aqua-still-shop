import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

  const categoriesData = [
    { id: "cat-alati", name: "Alati i oprema", slug: "alati", description: "Profesionalni električni, akumulatorski i ručni alati, pribor, merni alati i oprema za radionicu.", itemCount: 0, iconName: "wrench" },
    { id: "cat-vodovod", name: "Vodovod i kanalizacija", slug: "vodovod", description: "Cevi, fiting, ventili, slavine, odvodnja, pumpe, vodomeri i montažni materijal za instalacije vode.", itemCount: 0, iconName: "droplet" },
    { id: "cat-kupatila", name: "Kupatilska oprema i sanitarije", slug: "kupatila", description: "Slavine, tuševi, sanitarije, ugradni sistemi, kupatilski nameštaj, oprema i galanterija.", itemCount: 0, iconName: "bath" },
    { id: "cat-navodnjavanje", name: "Navodnjavanje i bašta", slug: "navodnjavanje", description: "Kap po kap sistemi, prskalice, pumpe, creva, spojnice i automatika za baštu, voćnjak i plastenik.", itemCount: 0, iconName: "sprout" },
    { id: "cat-grejanje", name: "Grejanje", slug: "grejanje", description: "Radijatori, ventili, termostatska regulacija, cevi i pribor za sisteme grejanja.", itemCount: 0, iconName: "flame" },
    { id: "cat-boje-hemija", name: "Boje, lakovi, lepkovi i hemija", slug: "boje-lakovi-hemija", description: "Boje, lakovi, impregnacije, silikoni, pur-pene, lepkovi, trake i hidroizolacioni materijali.", itemCount: 0, iconName: "paintbrush" },
    { id: "cat-rasveta-elektro", name: "Elektro-oprema i rasveta", slug: "rasveta-elektro-oprema", description: "LED rasveta, kablovi, produžni kablovi, sklopke, utičnice i elektro pribor.", itemCount: 0, iconName: "lightbulb" },
    { id: "cat-vijcana-roba", name: "Vijčana roba i pričvrsni materijal", slug: "vijcana-roba", description: "Šrafovi, tiplovi, ekseri, matice, podloške i elementi za pričvršćivanje i montažu.", itemCount: 0, iconName: "nut" },
    { id: "cat-gradjevinska-oprema", name: "Građevinska i zaštitna oprema", slug: "gradjevinska-zastitna-oprema", description: "Merdevine, građevinska kolica, mešalice, ručni građevinski alat i lična zaštitna oprema.", itemCount: 0, iconName: "hard-hat" },
    { id: "cat-kuca-dvoriste", name: "Kuća, dvorište i čišćenje", slug: "kuca-dvoriste-ciscenje", description: "Oprema za domaćinstvo, dvorište, čišćenje, skladištenje i baštenske potrebe.", itemCount: 0, iconName: "house" },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
  }



  const subcategoriesData = [
    { id: "sub-aku-busilice", categoryId: "cat-alati", name: "Aku bušilice i odvijači", slug: "aku-busilice", itemCount: 0 },
    { id: "sub-brusilice", categoryId: "cat-alati", name: "Ugaone brusilice", slug: "brusilice", itemCount: 0 },
    { id: "sub-testere", categoryId: "cat-alati", name: "Testere i cirkulari", slug: "testere", itemCount: 0 },
    { id: "sub-rucni-alat", categoryId: "cat-alati", name: "Ručni alati i ključevi", slug: "rucni-alat", itemCount: 0 },
    { id: "sub-odvijaci", categoryId: "cat-alati", name: "Odvijači i bitovi", slug: "odvijaci-bitovi", itemCount: 0 },
    { id: "sub-klesta", categoryId: "cat-alati", name: "Klešta i sečice", slug: "klesta-secice", itemCount: 0 },
    { id: "sub-sekire-cekici", categoryId: "cat-alati", name: "Sekire i čekići", slug: "sekire-cekici", itemCount: 0 },
    { id: "sub-garniture-rucnog-alata", categoryId: "cat-alati", name: "Garniture ručnog alata", slug: "garniture-rucnog-alata", itemCount: 0 },
    { id: "sub-pribor-alati", categoryId: "cat-alati", name: "Pribor za električne alate", slug: "pribor-za-alate", itemCount: 0 },
    { id: "sub-merni-alat", categoryId: "cat-alati", name: "Merni i obeležavajući alat", slug: "merni-alat", itemCount: 0 },
    { id: "sub-tolsen-rucni", categoryId: "cat-alati", name: "Tolsen i ostali ručni alati", slug: "tolsen-rucni-alati", itemCount: 0 },
    { id: "sub-cevi", categoryId: "cat-vodovod", name: "Cevi", slug: "cevi", itemCount: 0 },
    { id: "sub-fiting", categoryId: "cat-vodovod", name: "Fiting i spojnice", slug: "fiting", itemCount: 0 },
    { id: "sub-ventili", categoryId: "cat-vodovod", name: "Ventili, zasuni i slavine", slug: "ventili", itemCount: 0 },
    { id: "sub-odvodnja", categoryId: "cat-vodovod", name: "Odvodnja, sifoni i slivnici", slug: "odvodnja-sifoni", itemCount: 0 },
    { id: "sub-pumpe-voda", categoryId: "cat-vodovod", name: "Pumpe za vodu i hidrofori", slug: "pumpe-za-vodu", itemCount: 0 },
    { id: "sub-zaptivni-materijal", categoryId: "cat-vodovod", name: "Zaptivni i montažni materijal", slug: "zaptivni-montazni-materijal", itemCount: 0 },
    { id: "sub-vodomeri", categoryId: "cat-vodovod", name: "Vodomer i regulacija", slug: "vodomeri-regulacija", itemCount: 0 },
    { id: "sub-vodovodni-alat", categoryId: "cat-vodovod", name: "Vodovodni alat", slug: "vodovodni-alat", itemCount: 0 },
    { id: "sub-cevna-izolacija", categoryId: "cat-vodovod", name: "Izolacija i nosači cevi", slug: "izolacija-nosaci-cevi", itemCount: 0 },
    { id: "sub-baterije", categoryId: "cat-kupatila", name: "Slavine i baterije", slug: "slavine-i-baterije", itemCount: 0 },
    { id: "sub-sanitarije", categoryId: "cat-kupatila", name: "WC šolje i sanitarije", slug: "sanitarije", itemCount: 0 },
    { id: "sub-ugradni-sistemi", categoryId: "cat-kupatila", name: "Ugradni sistemi i vodokotlići", slug: "ugradni-sistemi", itemCount: 0 },
    { id: "sub-tus-program", categoryId: "cat-kupatila", name: "Tuševi i tuš program", slug: "tus-program", itemCount: 0 },
    { id: "sub-tus-kabine", categoryId: "cat-kupatila", name: "Tuš kabine i paravani", slug: "tus-kabine", itemCount: 0 },
    { id: "sub-lavaboi", categoryId: "cat-kupatila", name: "Lavaboi", slug: "lavaboi", itemCount: 0 },
    { id: "sub-kade", categoryId: "cat-kupatila", name: "Kade i oprema za kade", slug: "kade", itemCount: 0 },
    { id: "sub-namestaj", categoryId: "cat-kupatila", name: "Kupatilski nameštaj", slug: "kupatilski-namestaj", itemCount: 0 },
    { id: "sub-kupatilski-pribor", categoryId: "cat-kupatila", name: "Kupatilski pribor i galanterija", slug: "kupatilski-pribor", itemCount: 0 },
    { id: "sub-ogledala", categoryId: "cat-kupatila", name: "Ogledala i ogledalni ormarići", slug: "ogledala", itemCount: 0 },
    { id: "sub-odvodi", categoryId: "cat-kupatila", name: "Kanalice, slivnici i odvodi", slug: "kupatilski-odvodi", itemCount: 0 },
    { id: "sub-kap-po-kap", categoryId: "cat-navodnjavanje", name: "Kap po kap sistemi", slug: "kap-po-kap", itemCount: 0 },
    { id: "sub-prskalice", categoryId: "cat-navodnjavanje", name: "Rasprskivači i rotori", slug: "prskalice", itemCount: 0 },
    { id: "sub-creva", categoryId: "cat-navodnjavanje", name: "Baštenska i tehnička creva", slug: "creva", itemCount: 0 },
    { id: "sub-automatika", categoryId: "cat-navodnjavanje", name: "Elektroventili i tajmeri", slug: "automatika", itemCount: 0 },
    { id: "sub-navodnjavanje-fiting", categoryId: "cat-navodnjavanje", name: "Spojnice i fiting za navodnjavanje", slug: "navodnjavanje-fiting", itemCount: 0 },
    { id: "sub-pumpe-navodnjavanje", categoryId: "cat-navodnjavanje", name: "Pumpe za navodnjavanje", slug: "pumpe-navodnjavanje", itemCount: 0 },
    { id: "sub-filteri-navodnjavanje", categoryId: "cat-navodnjavanje", name: "Filteri i regulacija pritiska", slug: "filteri-regulacija", itemCount: 0 },
    { id: "sub-basta-oprema", categoryId: "cat-navodnjavanje", name: "Baštenska oprema i pribor", slug: "basta-oprema", itemCount: 0 },
    { id: "sub-grejna-tela", categoryId: "cat-grejanje", name: "Radijatori i grejna tela", slug: "radijatori-grejna-tela", itemCount: 0 },
    { id: "sub-ventili-grejanje", categoryId: "cat-grejanje", name: "Ventili i termostatska regulacija", slug: "ventili-termostatska-regulacija", itemCount: 0 },
    { id: "sub-pribor-grejanje", categoryId: "cat-grejanje", name: "Pribor za grejanje", slug: "pribor-za-grejanje", itemCount: 0 },
    { id: "sub-cevi-grejanje", categoryId: "cat-grejanje", name: "Cevi i fiting za grejanje", slug: "cevi-fiting-grejanje", itemCount: 0 },
    { id: "sub-pumpe-grejanje", categoryId: "cat-grejanje", name: "Cirkulacione pumpe", slug: "cirkulacione-pumpe", itemCount: 0 },
    { id: "sub-elektricne-busilice", categoryId: "cat-alati", name: "Električne bušilice i odvijači", slug: "elektricne-busilice-odvijaci", itemCount: 0 },
    { id: "sub-elektricne-brusilice", categoryId: "cat-alati", name: "Električne brusilice", slug: "elektricne-brusilice", itemCount: 0 },
    { id: "sub-burgije", categoryId: "cat-alati", name: "Burgije i pribor za bušenje", slug: "burgije-pribor-busenje", itemCount: 0 },
    { id: "sub-brusne-ploce", categoryId: "cat-alati", name: "Brusne i rezne ploče", slug: "brusne-rezne-ploce", itemCount: 0 },
    { id: "sub-mesalice", categoryId: "cat-gradjevinska-oprema", name: "Mešalice za boju i malter", slug: "mesalice-boju-malter", itemCount: 0 },
    { id: "sub-elektro-pumpe", categoryId: "cat-alati", name: "Električne pumpe i ventilatori", slug: "elektricne-pumpe-ventilatori", itemCount: 0 },
    { id: "sub-boje-zidne", categoryId: "cat-boje-hemija", name: "Boje za zidove", slug: "boje-za-zidove", itemCount: 0 },
    { id: "sub-lakovi-impregnacije", categoryId: "cat-boje-hemija", name: "Lakovi i impregnacije", slug: "lakovi-impregnacije", itemCount: 0 },
    { id: "sub-silikoni-pur-pene", categoryId: "cat-boje-hemija", name: "Silikoni i pur-pene", slug: "silikoni-pur-pene", itemCount: 0 },
    { id: "sub-lepkovi-trake", categoryId: "cat-boje-hemija", name: "Lepkovi i trake", slug: "lepkovi-krep-trake", itemCount: 0 },
    { id: "sub-hidroizolacija", categoryId: "cat-boje-hemija", name: "Hidroizolacioni materijali", slug: "hidroizolacija", itemCount: 0 },
    { id: "sub-zaptivne-mase", categoryId: "cat-boje-hemija", name: "Zaptivne mase i kitovi", slug: "zaptivne-mase", itemCount: 0 },
    { id: "sub-led-rasveta", categoryId: "cat-rasveta-elektro", name: "LED rasveta", slug: "led-rasveta", itemCount: 0 },
    { id: "sub-kablovi", categoryId: "cat-rasveta-elektro", name: "Kablovi i produžni kablovi", slug: "kablovi-produzni", itemCount: 0 },
    { id: "sub-sklopke", categoryId: "cat-rasveta-elektro", name: "Sklopke, utičnice i elektro-pribor", slug: "sklopke-elektro-pribor", itemCount: 0 },
    { id: "sub-baterije-elektro", categoryId: "cat-rasveta-elektro", name: "Baterije i akumulatori", slug: "elektro-baterije", itemCount: 0 },
    { id: "sub-merenje-elektro", categoryId: "cat-rasveta-elektro", name: "Merni i ispitni uređaji", slug: "merni-ispitni-uredjaji", itemCount: 0 },
    { id: "sub-srafovi-tiplovi", categoryId: "cat-vijcana-roba", name: "Šrafovi i tiplovi", slug: "srafovi-tiplovi", itemCount: 0 },
    { id: "sub-ekseri", categoryId: "cat-vijcana-roba", name: "Ekseri", slug: "ekseri", itemCount: 0 },
    { id: "sub-matice-podloske", categoryId: "cat-vijcana-roba", name: "Matice i podloške", slug: "matice-podloske", itemCount: 0 },
    { id: "sub-metalni-elementi", categoryId: "cat-vijcana-roba", name: "Metalni elementi za pričvršćivanje", slug: "metalni-elementi-pricvrscivanje", itemCount: 0 },
    { id: "sub-ankeri", categoryId: "cat-vijcana-roba", name: "Ankeri i specijalno pričvršćivanje", slug: "ankeri-specijalno-pricvrscivanje", itemCount: 0 },
    { id: "sub-merdevine", categoryId: "cat-gradjevinska-oprema", name: "Merdevine i platforme", slug: "merdevine", itemCount: 0 },
    { id: "sub-kolica", categoryId: "cat-gradjevinska-oprema", name: "Građevinska kolica", slug: "gradjevinska-kolica", itemCount: 0 },
    { id: "sub-mesalice-beton", categoryId: "cat-gradjevinska-oprema", name: "Mešalice za beton", slug: "mesalice-za-beton", itemCount: 0 },
    { id: "sub-zastitna-oprema", categoryId: "cat-gradjevinska-oprema", name: "Radne rukavice i zaštitna oprema", slug: "radne-rukavice-zastitna-oprema", itemCount: 0 },
    { id: "sub-gradjevinski-alat", categoryId: "cat-gradjevinska-oprema", name: "Građevinski i zidarski alat", slug: "gradjevinski-alat", itemCount: 0 },
    { id: "sub-ciscenje", categoryId: "cat-kuca-dvoriste", name: "Četke i oprema za čišćenje", slug: "cetke-oprema-ciscenje", itemCount: 0 },
    { id: "sub-kante-kanisteri", categoryId: "cat-kuca-dvoriste", name: "Kante i kanisteri", slug: "kante-kanisteri", itemCount: 0 },
    { id: "sub-uzad-kace-burad", categoryId: "cat-kuca-dvoriste", name: "Užad, kace i burad", slug: "uzad-kace-burad", itemCount: 0 },
    { id: "sub-dvoriste", categoryId: "cat-kuca-dvoriste", name: "Oprema za dvorište", slug: "oprema-za-dvoriste", itemCount: 0 },
    { id: "sub-skladistenje", categoryId: "cat-kuca-dvoriste", name: "Kutije, posude i skladištenje", slug: "skladistenje", itemCount: 0 },
  ];

  for (const sub of subcategoriesData) {
    await prisma.subcategory.upsert({
      where: { id: sub.id },
      update: { name: sub.name },
      create: sub,
    });
  }



async function main() {
  console.log("Bootstrapping Aqua Still catalog taxonomy into the database...");

  const featuredSlugs = new Set([
    "alati",
    "vodovod",
    "kupatila",
    "navodnjavanje",
    "grejanje",
    "boje-lakovi-hemija",
    "rasveta-elektro-oprema",
    "vijcana-roba",
  ]);

  for (const [index, cat] of categoriesData.entries()) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        ...cat,
        featured: featuredSlugs.has(cat.slug),
        sortOrder: index + 1,
      },
    });
  }

  for (const sub of subcategoriesData) {
    await prisma.subcategory.upsert({
      where: { slug: sub.slug },
      update: {},
      create: sub,
    });
  }

  console.log("Catalog taxonomy bootstrap completed.");
}

main()
  .catch((error) => {
    console.error("Catalog bootstrap failed:", error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
