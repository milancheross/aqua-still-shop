import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Calculator, AlertTriangle, Gauge, Droplets, Ruler, ShieldCheck, Wrench } from "lucide-react";
import ProductCard from "@/components/catalog/ProductCard";
import PumpGuideFilter from "@/components/guides/PumpGuideFilter";
import { getDbProducts } from "@/services/product-service";

const articles = {
  "renoviranje-kupatila-od-cega-poceti": {
    type: "TEHNIČKI VODIČ",
    title: "Renoviranje kupatila – tehnički vodič i kontrolni redosled radova",
    intro: "Renoviranje kupatila ne trpi improvizaciju. Greška u nagibu cevi ili preskočena hidroizolacija otkriva se tek kada se postavi keramika, a tada sanacija zahteva razbijanje novih pločica i višestruke troškove.",
    sections: [
      ["Pre kupovine", "Pre kupovine pločica i nameštaja, instalacije i pozicije odvoda moraju biti rešene po tačnim merama i standardima struke. Sve kote u nastavku računaju se od gotovog nivoa poda, odnosno nakon košuljice, lepka i pločica."],
    ],
    checklist: [
      "Kote svih vodovodnih priključaka",
      "Pozicije i padovi odvoda",
      "Ugradni vodokotlić nivelisan prema gotovom podu",
      "Hidroizolacija sa trakama i manžetnama",
      "Odgovarajući lepak i fug masa",
      "Servisni pristup ventilima i sifonima",
    ],
  },
  "sistemi-za-navodnjavanje-za-vase-dvoriste": {
    type: "INSPIRACIJA",
    title: "Sistemi za navodnjavanje za vaše dvorište",
    intro: "Pravilno navodnjavanje štedi vodu i vreme. Sistem treba prilagoditi površini, izvoru vode, biljkama i pritisku koji imate na raspolaganju.",
    sections: [
      ["1. Podelite dvorište na zone", "Travnjaci, leje, žbunje i kap po kap sistemi nemaju iste potrebe. Razdvajanje zona omogućava preciznije zalivanje."],
      ["2. Izaberite način navodnjavanja", "Prskalice su praktične za travnjake i veće površine, dok je kap po kap pogodan za bašte, žive ograde i pojedinačne biljke."],
      ["3. Proverite izvor vode", "Pre izbora pumpe i prskalica proverite raspoloživ protok i pritisak. Ako sistemu nedostaje pritisak, rezultat će biti neujednačeno zalivanje."],
      ["4. Ugradite filter i regulaciju", "Filter štiti kapaljke i mlaznice od nečistoća. Regulator pritiska može biti važan kada pojedine zone zahtevaju različite radne uslove."],
      ["5. Automatizujte kada ima smisla", "Tajmer ili kontroler omogućava zalivanje u odgovarajuće vreme i smanjuje potrebu za svakodnevnim ručnim uključivanjem."],
    ],
    checklist: ["Površina i zone", "Izvor vode", "Protok i pritisak", "Prskalice ili kap po kap", "Filter i automatika"],
  },
  "farbanje-zida-korak-po-korak": {
    type: "TEHNIČKI VODIČ",
    title: "Farbanje zidova – priprema podloge, potrošnja materijala i pravilan redosled radova",
    intro: "Profesionalan rezultat ne zavisi samo od završne boje. Čvrsta i čista podloga, odgovarajuća impregnacija, pravilna potrošnja i redosled rada odlučuju da li će zid ostati ujednačen ili će se pojaviti fleke, ljuštenje i tragovi valjka.",
    sections: [
      ["1. Priprema podloge i sanacija oštećenja", "Pre otvaranja kante sa bojom podloga mora biti čvrsta, suva i otprašena. Labave slojeve stare boje sastružite do čvrstog sloja. Manje pukotine otvorite u V profil i popunite odgovarajućom glet masom, a dublja oštećenja reparaturnim materijalom. Veće spojeve ojačajte bandaž trakom. Posle potpunog sušenja obrusite približno P120–P150 i temeljno uklonite finu prašinu."],
      ["2. Akrilna impregnacija / prajmer", "Podloga nije opcija kada zid različito upija. Sveže gletovane i stare površine mogu različito povlačiti vlagu iz završne boje, što stvara mat-sjajne prelaze i fleke. Dubinski akrilni prajmer razređuje se isključivo prema deklaraciji konkretnog proizvoda; koncentrati često imaju odnos 1:5 ili 1:8, ali to nije univerzalno pravilo. Vreme sušenja takođe pratite prema tehničkom listu; 4–6 sati je čest red veličine, ne garantovani minimum za svaki proizvod."],
      ["3. Tehnika nanošenja i potrošnja", "Boju razređujte samo prema uputstvu proizvođača. Prvi sloj se kod nekih disperzija razređuje, dok se drugi nanosi sa manjim razređenjem ili nerazređen; ne postoji bezbedan univerzalan procenat za sve boje. Radite metodom mokro na mokro: prvo uglove i spojeve, zatim glavnu površinu velikim valjkom u preklapajućim vertikalnim potezima. Ne vraćajte se polusuvim valjkom na deo koji je počeo da vezuje. Vreme između slojeva određuje tehnički list konkretnog premaza."],
      ["4. Zaštita prostora i alat", "Pre početka zaštitite pod i nameštaj folijom, ivice krep trakom, a za visoke zidove koristite teleskopsku dršku. Za ravne zidove birajte valjak prema vrsti boje i željenoj teksturi; mikrovlakna ili poliamid odgovaraju mnogim disperzionim premazima, ali dužinu dlake treba prilagoditi podlozi i preporuci proizvođača."],
    ],
    checklist: [
      "Podloga je čvrsta, suva, čista i bez labavih slojeva",
      "Pukotine i rupe su sanirane odgovarajućom masom",
      "Površina je obrušena i otprašena",
      "Prajmer je izabran i razređen prema deklaraciji",
      "Valjak, četka, teleskopska drška i zaštita su pripremljeni",
      "Potrošnja boje računa se prema stvarnoj kvadraturi i deklaraciji proizvoda",
    ],
  },
};

type StandardArticle = typeof articles[keyof typeof articles];

const pumpChecklist = [
  "Izvor vode i nivo vode",
  "Geodetska visina do najviše tačke",
  "Potreban protok Q",
  "Dužina i prečnik cevi",
  "Radni pritisak",
  "Zaštita od rada na suvo",
];

function pickProducts(products: Awaited<ReturnType<typeof getDbProducts>>, matcher: RegExp, count: number, excluded = new Set<string>()) {
  const matched = products.filter((product) => matcher.test(product.name) && !excluded.has(product.id));
  const fallback = products.filter((product) => !excluded.has(product.id));
  return [...matched, ...fallback].filter((product, index, all) => all.findIndex((item) => item.id === product.id) === index).slice(0, count);
}

function pickBundleProducts(products: Awaited<ReturnType<typeof getDbProducts>>, matcher: RegExp, count: number, used = new Set<string>()) {
  const exact = products.filter((product) => matcher.test(product.name) && !used.has(product.id));
  return exact.slice(0, count);
}

function rankGuideProducts(
  products: Awaited<ReturnType<typeof getDbProducts>>,
  terms: string[],
  count: number,
  used = new Set<string>(),
) {
  const normalize = (value: string) => value.toLocaleLowerCase("sr-Latn-RS").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizedTerms = terms.map(normalize);

  return products
    .filter((product) => !used.has(product.id) && (product.stockQuantity > 0 || product.inStock))
    .map((product) => {
      const haystack = normalize(
        [product.name, product.brand, product.shortDescription, product.description, product.subcategoryName, product.categoryName].join(" "),
      );
      const score = normalizedTerms.reduce((total, term, index) => total + (haystack.includes(term) ? normalizedTerms.length - index : 0), 0);
      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name, "sr"))
    .slice(0, count)
    .map(({ product }) => product);
}

export function generateStaticParams() {
  return [
    { slug: "kako-izabrati-pravu-pumpu-za-vodu" },
    { slug: "sistemi-za-navodnjavanje-za-vase-dvoriste" },
    ...Object.keys(articles).map((slug) => ({ slug })),
  ];
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === "sistemi-za-navodnjavanje-za-vase-dvoriste") {
    const [sprinklerProducts, dripProducts, automationProducts] = await Promise.all([
      getDbProducts({ search: "rasprskiv", sort: "newest" }),
      getDbProducts({ search: "kap po kap", sort: "newest" }),
      getDbProducts({ search: "ventil", sort: "newest" }),
    ]);

    const sprinklerBundle = pickBundleProducts(
      sprinklerProducts,
      /rasprskiv|rotor|pop.?up|prskal/i,
      2,
    );
    const usedSprinklers = new Set(sprinklerBundle.map((product) => product.id));
    const pipeAndValves = pickBundleProducts(
      [...sprinklerProducts, ...automationProducts],
      /pehd|polietilen|cev|ventil|spojn|t.?kom|razvodnik/i,
      4,
      usedSprinklers,
    );
    const dripBundle = pickBundleProducts(
      dripProducts,
      /kap.?po.?kap|kapalj|traka/i,
      2,
    );
    const usedDrip = new Set(dripBundle.map((product) => product.id));
    const dripAccessories = pickBundleProducts(
      [...dripProducts, ...automationProducts],
      /filter|regulator|ventil|čep|cep|nastav|spojn/i,
      4,
      usedDrip,
    );

    return (
      <main className="bg-slate-50">
        <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-700 hover:text-cyan-900">
            <ArrowLeft className="h-4 w-4" /> Nazad na početnu
          </Link>

          <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 px-6 py-8 sm:px-10 sm:py-10">
              <span className="inline-flex rounded-md bg-cyan-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-800">TEHNIČKI VODIČ</span>
              <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Sistemi za navodnjavanje – proračun pritiska, zone i izbor opreme
              </h1>
              <p className="mt-5 max-w-4xl text-base leading-7 text-slate-600 sm:text-lg">
                Pogrešno dimenzionisan sistem rezultira suvim delovima travnjaka, zapušenim kapaljkama ili padom pritiska zbog koga se rasprskivači ne podižu iz zemlje. Pre kupovine cevi i prskalica prvo izmerite izvor vode i podelite parcelu na hidraulički nezavisne zone.
              </p>
            </header>

            <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
              <section className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 sm:p-7">
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-cyan-700" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Pre kupovine</p>
                    <h2 className="text-xl font-black text-slate-900">Izmerite izvor vode</h2>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Za osnovni proračun potrebne su dve vrednosti: raspoloživ <strong>protok Q</strong> i <strong>radni pritisak</strong>. Test kante daje brzu procenu protoka na konkretnoj tački uzimanja vode.
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-cyan-100 bg-white p-5">
                    <p className="text-xs font-black uppercase tracking-wide text-cyan-700">Test kante</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">Napravite merenje sa kantom od 10 l i štopericom. Otvorite slavinu do kraja i izmerite vreme punjenja <strong>t</strong> u sekundama.</p>
                    <div className="mt-4 rounded-lg bg-slate-900 px-4 py-3 text-center text-base font-black text-white sm:text-lg">Q = (10 / t) × 3600 [l/h]</div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">Primer: 10 l za 20 s = 1.800 l/h = 1,8 m³/h.</p>
                  </div>
                  <div className="rounded-xl border border-cyan-100 bg-white p-5">
                    <p className="text-xs font-black uppercase tracking-wide text-cyan-700">Radni pritisak</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">Izmerite manometrom. Statički pritisak bez protoka nije dovoljan za dimenzionisanje — proverite kako pritisak izgleda dok voda stvarno teče.</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                      <div className="rounded-lg bg-slate-50 p-3"><strong className="block text-sm text-slate-900">Rasprskivači</strong><span className="text-xs text-slate-600">često 2,5–3,5 bar</span></div>
                      <div className="rounded-lg bg-slate-50 p-3"><strong className="block text-sm text-slate-900">Kap po kap</strong><span className="text-xs text-slate-600">često 1,0–1,5 bar</span></div>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">Tačan radni pritisak uvek proverite prema karakteristikama konkretnog rasprskivača, kapaljke i regulatora.</p>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-5 flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-cyan-700" />
                  <h2 className="text-2xl font-black text-slate-900">1. Podela na zone i hidraulička pravila</h2>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Zona 01 · Travnjak</p>
                    <h3 className="mt-2 text-lg font-black text-slate-900">Pop-up rasprskivači, rotori i sprej dizne</h3>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                      <li>• Zbir potrošnje rasprskivača držite do približno <strong>80% izmerenog protoka</strong> kao konzervativnu rezervu za pad pritiska i promene uslova.</li>
                      <li>• Primer: izvor 1.800 l/h × 80% = 1.440 l/h. Ako jedan rotor troši 450 l/h, praktično staju najviše 3 rotora.</li>
                      <li>• Glavne/lateralne cevi birajte prema dužini, protoku i padu pritiska; PEHD Ø25 ili Ø32 mm može biti polazna veličina za manje sisteme, ali ne kao univerzalno pravilo.</li>
                    </ul>
                    {sprinklerBundle.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Rasprskivači iz kataloga</p>
                        <div className="grid grid-cols-2 gap-3">{sprinklerBundle.map((product) => <ProductCard key={product.id} product={product} />)}</div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Zona 02 · Bašta i živa ograda</p>
                    <h3 className="mt-2 text-lg font-black text-slate-900">Kap po kap</h3>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                      <li>• Ne mešajte kap po kap i pop-up rasprskivače na istoj zoni: imaju različite zahteve za pritisak i protok.</li>
                      <li>• Regulator pritiska postavite prema zahtevima trake/kapaljki; <strong>1,2–1,4 bar</strong> je česta radna vrednost, ali proverite deklaraciju konkretnog proizvoda.</li>
                      <li>• Potrošnja zavisi od razmaka kapaljki i protoka po kapaljci. Nemojte računati „po metru“ bez specifikacije proizvođača.</li>
                    </ul>
                    {dripBundle.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Kap po kap iz kataloga</p>
                        <div className="grid grid-cols-2 gap-3">{dripBundle.map((product) => <ProductCard key={product.id} product={product} />)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-cyan-700" />
                  <h2 className="text-2xl font-black text-slate-900">2. Filtracija i automatika</h2>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="font-black text-slate-900">Filter prema kvalitetu vode</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Kod bunara, reka i cisterni filter je praktično obavezan. Mrežasti ili diskasti filter birajte prema zaprljanosti vode i zahtevima sistema; 120 mesh je primer za finu filtraciju, ne univerzalna specifikacija za svaki sistem.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="font-black text-slate-900">Elektromagnetni ventili</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Svaka zona može imati svoj ventil na kolektoru. Kontroler zatim otvara zone prema rasporedu. Izbor 24 V AC ili 9 V DC zavisi od konkretnog kontrolera i načina napajanja.</p>
                  </div>
                </div>
                {pipeAndValves.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Armatura i razvod iz kataloga</p>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{pipeAndValves.map((product) => <ProductCard key={product.id} product={product} />)}</div>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 sm:p-7">
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-cyan-700" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Paket 01</p>
                    <h2 className="text-xl font-black text-slate-900">Zona travnjaka · pop-up rasprskivači i armatura</h2>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">Polazni paket za stabilan razvod. Pre naručivanja proverite broj zona, radijus i potrošnju izabranih rasprskivača.</p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    "Pop-up rotacioni rasprskivač · radijus prema konkretnom modelu, okvirno 4,5–9 m",
                    "PEHD polietilenska cev Ø32 mm, 10 bar · kotur 50 ili 100 m",
                    "Kompresione spojnice i T-komadi Ø32 mm sa navojnim izlazom 1/2″",
                    "Elektromagnetni ventil 1″ sa kontrolom protoka · napon prema kontroleru",
                  ].map((item) => <div key={item} className="rounded-xl border border-cyan-100 bg-white p-4 text-sm font-semibold text-slate-800">{item}</div>)}
                </div>
                <p className="mt-5 flex items-center gap-2 text-xs font-black text-emerald-700"><CheckCircle2 className="h-4 w-4" />Stanje se proverava prema trenutnom katalogu; ne prikazujemo fiksno obećanje isporuke 24/48 h.</p>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Paket 02</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">Živa ograda i bašta · kap po kap</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">Paket sa regulacijom pritiska i filtracijom. Razmak kapaljki i protok po kapaljci moraju odgovarati biljkama i dužini laterala.</p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    "Cev za navodnjavanje kap po kap Ø16 mm · integrisane kapaljke prema izabranom modelu",
                    "Linijski regulator pritiska 3/4″ · izlazna vrednost prema specifikaciji sistema",
                    "Mrežasti filter za vodu 1″ · finoća filtracije prema kvalitetu vode i zahtevima kapaljki",
                    "Završni čepovi, ubodni nastavci i pričvrsne kukice Ø16 mm",
                  ].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-800">{item}</div>)}
                </div>
                {dripAccessories.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Prateća oprema iz kataloga</p>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{dripAccessories.map((product) => <ProductCard key={product.id} product={product} />)}</div>
                  </div>
                )}
                <p className="mt-5 flex items-center gap-2 text-xs font-black text-emerald-700"><CheckCircle2 className="h-4 w-4" />Dostupnost proveravajte na karticama proizvoda pre poručivanja.</p>
              </section>

              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Kontrola pre kupovine</h2>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                      <li>• Izmeren protok izvora u l/h ili m³/h.</li>
                      <li>• Izmeren radni pritisak dok voda teče.</li>
                      <li>• Parcela podeljena na zone prema potrošnji i pritisku.</li>
                      <li>• Izabran prečnik cevi prema dužini trase i protoku, ne samo prema priključku.</li>
                      <li>• Predviđeni filter, regulator i ventili.</li>
                      <li>• Proverena izdašnost bunara/cisterne ako se sistem napaja iz sopstvenog izvora.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-7">
                <h2 className="text-xl font-black">Proračun zone pre poručivanja</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Pošaljite skicu dvorišta sa dimenzijama i rezultat testa kante — vreme punjenja u sekundama. Na osnovu toga možemo proceniti potreban broj rasprskivača, podelu zona i početnu dimenziju cevi pre konačnog izbora opreme.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/katalog?category=navodnjavanje" className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">Otvori navodnjavanje <ArrowRight className="h-4 w-4" /></Link>
                  <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">Nazad na početnu</Link>
                </div>
              </section>
            </div>
          </article>
        </div>
      </main>
    );
  }

  if (slug === "kako-izabrati-pravu-pumpu-za-vodu") {
    const pumpProducts = await getDbProducts({ subcategorySlug: "pumpe-za-vodu", sort: "newest" });
    const deepPumps = pickProducts(pumpProducts, /potap|dubinsk|3['’"]|4['’"]/i, 2);
    const usedIds = new Set(deepPumps.map((product) => product.id));
    const hydropaks = pickProducts(pumpProducts, /hidropak|hidrofor|hidrofors/i, 2, usedIds);
    const accessoryProducts = await getDbProducts({ search: "ventil", sort: "newest" });

    return (
      <main className="bg-slate-50">
        <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-700 hover:text-cyan-900"><ArrowLeft className="h-4 w-4" /> Nazad na početnu</Link>
          <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 px-6 py-8 sm:px-10 sm:py-10">
              <span className="inline-flex rounded-md bg-cyan-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-800">TEHNIČKI VODIČ</span>
              <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">Kako izabrati pravu pumpu za vodu?</h1>
              <p className="mt-5 max-w-4xl text-base leading-7 text-slate-600 sm:text-lg">Ne birajte pumpu samo po snazi motora. Prvo odredite izvor vode, dubinu nivoa vode, potrebni protok i visinu do najviše tačke sistema. Tek onda birajte model.</p>
            </header>
            <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
              <PumpGuideFilter />
              <section>
                <div className="mb-5 flex items-center gap-3"><Droplets className="h-5 w-5 text-cyan-700" /><h2 className="text-2xl font-black text-slate-900">1. Prvo odredite izvor vode i dubinu</h2></div>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    ["Dubina do 7–8 m", "Površinska centrifugalna pumpa ili hidropak, ako su uslovi usisa odgovarajući.", "Za bunare, cisterne i rezervoare sa nivoom vode koji je dovoljno blizu pumpe."],
                    ["Dubina preko 8 m", "Potapajuća / dubinska pumpa.", "Površinska pumpa više nema realnu usisnu rezervu. Kod bušotina proverite prečnik i statički/dinamički nivo vode."],
                    ["Prljava ili otpadna voda", "Drenažna potapajuća pumpa, po potrebi sa plovkom i radnim kolom/nožem za nečistoće.", "Za podrume, šahtove i poplavljene prostore. Izbor radnog kola zavisi od veličine i vrste čestica."],
                  ].map(([title, recommendation, detail]) => (
                    <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-black uppercase tracking-wide text-cyan-700">{title}</p>
                      <h3 className="mt-2 text-base font-black text-slate-900">{recommendation}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
                <div className="flex items-center gap-3"><Calculator className="h-5 w-5 text-cyan-700" /><h2 className="text-2xl font-black text-slate-900">2. Izračunajte potrebnu visinu dizanja</h2></div>
                <p className="mt-3 text-sm leading-7 text-slate-600">Za brzu orijentaciju koristite zbir geodetske visine, približnog pada kroz cevovod i pritiska koji želite na izlazu:</p>
                <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-5"><p className="whitespace-nowrap text-center text-lg font-black text-slate-900 sm:text-2xl">H = H<sub>geodetska</sub> + (L<sub>cevi</sub> × 0,1) + H<sub>radni</sub></p></div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div><strong className="text-sm text-slate-900">H geodetska</strong><p className="mt-1 text-xs leading-5 text-slate-600">Visinska razlika od nivoa vode do najviše tačke izliva.</p></div>
                  <div><strong className="text-sm text-slate-900">L cevi × 0,1</strong><p className="mt-1 text-xs leading-5 text-slate-600">Gruba orijentacija za pad pritiska. Stvarni gubici zavise od prečnika, protoka, kolena, ventila i armature.</p></div>
                  <div><strong className="text-sm text-slate-900">H radni</strong><p className="mt-1 text-xs leading-5 text-slate-600">Željeni pritisak na izlazu. 2,5–3 bar odgovara približno 25–30 m vodenog stuba.</p></div>
                </div>
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><strong>Važno:</strong> Hmax iz kataloga nije radna tačka. Na Hmax je protok praktično nula; model treba birati prema krivoj pumpe, tako da na potrebnoj visini i pritisku i dalje daje traženi Q.</div>
              </section>
              <section>
                <div className="mb-5 flex items-center gap-3"><Gauge className="h-5 w-5 text-cyan-700" /><h2 className="text-2xl font-black text-slate-900">3. Koliki protok Q vam je potreban?</h2></div>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[680px] border-collapse bg-white text-left text-sm">
                    <thead className="bg-slate-900 text-white"><tr><th className="p-3 font-black">Namena</th><th className="p-3 font-black">Potreban protok Q</th><th className="p-3 font-black">Preporučeni sistem</th></tr></thead>
                    <tbody>
                      {[
                        ["Jedna baštenska prskalica", "15–25 l/min (0,9–1,5 m³/h)", "Centrifugalna baštenska pumpa"],
                        ["Domaćinstvo, 3–4 člana, 2 kupatila", "40–60 l/min (2,4–3,6 m³/h)", "Hidropak ili pumpa sa odgovarajućom automatikom"],
                        ["Kap po kap, 100 m trake", "10–15 l/min pri nižem pritisku", "Površinska pumpa + regulacija pritiska"],
                      ].map(([use, flow, system]) => <tr key={use} className="border-t border-slate-200"><td className="p-3 font-bold text-slate-900">{use}</td><td className="p-3 text-slate-700">{flow}</td><td className="p-3 text-slate-600">{system}</td></tr>)}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">Ovo su orijentacione vrednosti. Kod više istovremenih potrošača računajte realnu radnu tačku i izdašnost izvora vode.</p>
              </section>
              {deepPumps.length > 0 && (
                <section>
                  <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Za bunare preko 8 m</p><h2 className="mt-1 text-2xl font-black text-slate-900">Potapajuće pumpe iz ponude</h2></div><Link href="/katalog?category=navodnjavanje&subcategory=pumpe-za-vodu&q=potapajuća" className="text-xs font-black text-cyan-700">Sve pumpe <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link></div>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{deepPumps.map((product) => <ProductCard key={product.id} product={product} />)}</div>
                </section>
              )}
              <section>
                <div className="mb-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Za kuću</p><h2 className="mt-1 text-2xl font-black text-slate-900">Hidropak / hidrofor</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Za plitke izvore i vodosnabdevanje domaćinstva, hidrofor sa posudom i presostatom može obezbediti stabilniji pritisak i ređe uključivanje pumpe.</p></div>
                {hydropaks.length > 0 ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{hydropaks.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <Link href="/katalog?category=navodnjavanje&subcategory=pumpe-za-vodu&q=hidropak" className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white">Pogledaj hidropak ponudu <ArrowRight className="h-4 w-4" /></Link>}
              </section>
              <section className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
                <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" /><div><h2 className="text-xl font-black text-slate-900">4. Zamke koje prave probleme na terenu</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                  <li><strong>Usisno crevo:</strong> Nemojte sužavati usis bez razloga. Prečnik i dužina direktno utiču na gubitke i rizik od kavitacije. Ako sistem traži 1&quot; usis, nemojte ga svesti na 1/2&quot; da biste „uštedeli“ na crevu.</li>
                  <li><strong>Rad na suvo:</strong> Plovak, zaštita od suvog rada ili odgovarajuća automatika mogu sprečiti ozbiljno oštećenje motora.</li>
                  <li><strong>Izdašnost bunara:</strong> Pumpa ne sme da zahteva više vode nego što izvor može stabilno da daje. Statički nivo nije isto što i dinamički nivo tokom rada.</li>
                  <li><strong>Prečnik bušotine:</strong> Kod dubinskih pumpi proverite da model fizički odgovara prečniku bunara pre kupovine.</li>
                </ul></div></div>
              </section>
              {accessoryProducts.length > 0 && (
                <section>
                  <div className="mb-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Ne zaboravite dodatnu opremu</p><h2 className="mt-1 text-2xl font-black text-slate-900">Delovi bez kojih sistem često nije kompletan</h2><p className="mt-2 text-sm leading-6 text-slate-600">Izbor zavisi od konkretnog sistema, ali najčešće se proveravaju nepovratni ventili, usisne korpe, filteri, automatika, creva i zaptivni materijal.</p></div>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{accessoryProducts.slice(0,4).map((product) => <ProductCard key={product.id} product={product} />)}</div>
                </section>
              )}
              <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-7"><h2 className="text-xl font-black">Pre kupovine pripremite ovih 6 podataka</h2><ul className="mt-4 grid gap-2 sm:grid-cols-2">{pumpChecklist.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />{item}</li>)}</ul><Link href="/katalog?category=navodnjavanje&subcategory=pumpe-za-vodu" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">Otvori sve pumpe za vodu <ArrowRight className="h-4 w-4" /></Link></section>
            </div>
          </article>
        </div>
      </main>
    );
  }

  if (slug === "farbanje-zida-korak-po-korak") {
    const [wallPaints, primers, fillers, tapes, paintingTools] = await Promise.all([
      getDbProducts({ categorySlug: "boje-lakovi-hemija", subcategorySlug: "boje-za-zidove", sort: "name", limit: 40 }),
      getDbProducts({ categorySlug: "boje-lakovi-hemija", subcategorySlug: "lakovi-impregnacije", sort: "name", limit: 40 }),
      getDbProducts({ categorySlug: "boje-lakovi-hemija", search: "glet", sort: "name", limit: 40 }),
      getDbProducts({ categorySlug: "boje-lakovi-hemija", subcategorySlug: "lepkovi-krep-trake", sort: "name", limit: 40 }),
      getDbProducts({ categorySlug: "alati", search: "valjak", sort: "name", limit: 40 }),
    ]);

    const paintProducts = rankGuideProducts(wallPaints, ["disperz", "poludisperz", "unutrasnja", "zidna", "bela"], 4);
    const usedPaints = new Set(paintProducts.map((product) => product.id));
    const primerProducts = rankGuideProducts(primers, ["impregn", "prajmer", "podloga", "akril"], 3, usedPaints);
    const usedPrimer = new Set([...usedPaints, ...primerProducts.map((product) => product.id)]);
    const fillerProducts = rankGuideProducts(fillers, ["glet", "masa", "reparat"], 3, usedPrimer);
    const usedFillers = new Set([...usedPrimer, ...fillerProducts.map((product) => product.id)]);
    const tapeProducts = rankGuideProducts(tapes, ["krep", "bandaz", "traka"], 2, usedFillers);
    const usedTapes = new Set([...usedFillers, ...tapeProducts.map((product) => product.id)]);
    const toolProducts = rankGuideProducts(paintingTools, ["valjak", "molers", "cetka", "teleskop"], 4, usedTapes);

    return (
      <main className="bg-slate-50">
        <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-700 hover:text-cyan-900"><ArrowLeft className="h-4 w-4" /> Nazad na početnu</Link>
          <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 px-6 py-8 sm:px-10 sm:py-10">
              <span className="inline-flex rounded-md bg-cyan-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-800">TEHNIČKI VODIČ</span>
              <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">{articles["farbanje-zida-korak-po-korak"].title}</h1>
              <p className="mt-5 max-w-4xl text-base leading-7 text-slate-600 sm:text-lg">{articles["farbanje-zida-korak-po-korak"].intro}</p>
            </header>
            <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
              <section>
                <div className="mb-5 flex items-center gap-3"><Ruler className="h-5 w-5 text-cyan-700" /><h2 className="text-2xl font-black text-slate-900">1. Priprema podloge i sanacija oštećenja</h2></div>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    ["Uklonite labave slojeve", "Špahtlom uklonite sve što se ljušti, bubri ili kredasto ostaje na prstima."],
                    ["Sanirajte pukotine", "Do oko 3 mm može odgovarajuća unutrašnja glet masa; dublja oštećenja traže reparaturni materijal."],
                    ["Obrusite i otprašite", "Posle sušenja gleta obrusite približno P120–P150 i uklonite finu prašinu pre impregnacije."],
                  ].map(([title, detail]) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-black text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></div>)}
                </div>
                {fillerProducts.length > 0 && <div className="mt-6"><p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Glet i reparaturni materijal iz kataloga</p><div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{fillerProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></div>}
              </section>
              <section className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 sm:p-7">
                <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-cyan-700" /><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Podloga</p><h2 className="text-xl font-black text-slate-900">Akrilna impregnacija nije preskočiv korak</h2></div></div>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">Različita upojnost stare i sveže obrađene površine pravi fleke i razlike u sjaju. Odnos razređivanja i vreme sušenja moraju se uzeti sa deklaracije konkretnog prajmera.</p>
                {primerProducts.length > 0 && <div className="mt-6"><p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Prajmeri i impregnacije iz kataloga</p><div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{primerProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></div>}
              </section>
              <section>
                <div className="mb-5 flex items-center gap-3"><Calculator className="h-5 w-5 text-cyan-700" /><h2 className="text-2xl font-black text-slate-900">2. Potrošnja i pravilno nanošenje</h2></div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <h3 className="font-black text-slate-900">Ne računajte potrošnju napamet</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">Prvo izmerite površinu zidova: <strong>A = obim prostorije × visina − površine otvora</strong>. Zatim proverite deklarisanu potrošnju konkretnog proizvoda, npr. u m²/l ili kg/m², i računajte sa rezervom zbog upojnosti podloge i načina nanošenja.</p>
                    <div className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-black text-white">Potrebna količina ≈ površina ÷ deklarisana pokrivnost × broj slojeva</div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">Primer: 60 m² ÷ 8 m²/l po sloju × 2 sloja ≈ 15 l, pre dodatne rezerve i uz pretpostavku da je deklaracija 8 m²/l.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <h3 className="font-black text-slate-900">Mokro na mokro</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">Prvo usecite uglove i spojeve, zatim glavnu površinu velikim valjkom. Preklapajte poteze i ne vraćajte se polusuvim valjkom na zonu koja je počela da vezuje. Razređivanje i vreme između slojeva pratite prema tehničkom listu proizvoda.</p>
                  </div>
                </div>
                {paintProducts.length > 0 && <div className="mt-6"><p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Boje za zidove iz kataloga</p><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{paintProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></div>}
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <div className="flex items-center gap-3"><Wrench className="h-5 w-5 text-cyan-700" /><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Alat i zaštita</p><h2 className="text-xl font-black text-slate-900">Pripremite komplet pre početka rada</h2></div></div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {["Valjak od mikrovlakana/poliamida · 250 mm · dlaka prema vrsti podloge i boje","Mali valjak ili kosa četka za usecanje ivica","Teleskopska drška za rad na višim zidovima","Mrežica za ceđenje boje i molerska kadica","Krep traka za zaštitu ivica i prekidača","Zaštitna folija za podove i nameštaj"].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-800">{item}</div>)}
                </div>
                {tapeProducts.length > 0 && <div className="mt-6"><p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Krep trake iz kataloga</p><div className="grid grid-cols-2 gap-3 lg:grid-cols-2">{tapeProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></div>}
                {toolProducts.length > 0 && <div className="mt-6"><p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Molerski alat iz kataloga</p><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{toolProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></div>}
              </section>
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h2 className="text-xl font-black text-slate-900">Pre poručivanja proverite 6 stvari</h2><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">{articles["farbanje-zida-korak-po-korak"].checklist.map((item) => <li key={item}>• {item}</li>)}</ul></div></div>
              </section>
              <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-7">
                <h2 className="text-xl font-black">Proračun materijala za vaš zid</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Pošaljite širinu, dužinu i visinu prostorije, kao i broj i dimenzije otvora. Na osnovu kvadrature i deklarisane potrošnje konkretnog proizvoda može se izračunati potrebna količina pre poručivanja.</p>
                <Link href="/katalog?category=boje-lakovi-hemija&subcategory=boje-za-zidove" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">Pogledaj boje za zidove <ArrowRight className="h-4 w-4" /></Link>
              </section>
            </div>
          </article>
        </div>
      </main>
    );
  }

  if (slug === "renoviranje-kupatila-od-cega-poceti") {
    const [waterproofingCandidates, drainCandidates, finishingCandidates] = await Promise.all([
      getDbProducts({ search: "hidroizol", sort: "newest" }),
      getDbProducts({ search: "slivnik", sort: "newest" }),
      getDbProducts({ search: "ventil", sort: "newest" }),
    ]);
    const waterproofing = pickBundleProducts([...waterproofingCandidates, ...drainCandidates], /hidroizol|hidroizolacion|slivnik/i, 4);
    const used = new Set(waterproofing.map((product) => product.id));
    const finishing = pickBundleProducts(finishingCandidates, /ventil|sifon|silikon|teflon|diht|zaptiv/i, 4, used);

    return (
      <main className="bg-slate-50">
        <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-700 hover:text-cyan-900"><ArrowLeft className="h-4 w-4" /> Nazad na početnu</Link>
          <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <header className="border-b border-slate-200 px-6 py-8 sm:px-10 sm:py-10">
              <span className="inline-flex rounded-md bg-cyan-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-800">TEHNIČKI VODIČ</span>
              <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">Renoviranje kupatila – tehnički vodič i kontrolni redosled radova</h1>
              <p className="mt-5 max-w-4xl text-base leading-7 text-slate-600 sm:text-lg">Renoviranje kupatila ne trpi improvizaciju. Greška u nagibu cevi ili preskočena hidroizolacija otkriva se tek kada se postavi keramika, a tada sanacija zahteva razbijanje novih pločica i višestruke troškove.</p>
            </header>

            <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
              <section className="border-l-4 border-cyan-600 bg-slate-50 px-5 py-4">
                <p className="text-sm leading-7 text-slate-700">Pre kupovine pločica i nameštaja, instalacije i pozicije odvoda moraju biti rešene po tačnim standardima struke. Sve kote u nastavku merite od <strong>gotovog nivoa poda</strong>, nakon košuljice, lepka i pločica.</p>
              </section>

              <section>
                <div className="mb-5 flex items-center gap-3"><Ruler className="h-5 w-5 text-cyan-700" /><h2 className="text-2xl font-black text-slate-900">1. Fiksne tehničke mere pre zatvaranja zidova</h2></div>
                <div className="space-y-3">
                  {[
                    ["Priključak za bateriju tuša/kade", "Visina ose dovoda tople i hladne vode: 110–120 cm. Standardni osovinski razmak je 150 mm, uz toleranciju koju daju ekscentri 1/2″ × 3/4″."],
                    ["Umivaonik i prateći ventili", "Odvodna cev Ø40 mm ili Ø50 mm: 50–55 cm. Ugaoni ventili 1/2″ × 3/8″: 55–60 cm, sa međusobnim razmakom 8–10 cm."],
                    ["Ugradni vodokotlić", "Fabrička oznaka 1 m na metalnom ramu ravna se prema projektovanom gotovom podu, a ne prema trenutnoj betonskoj ploči."],
                    ["Linijski slivnik / tuš kanalica", "Planirajte pad 1,5–2% ka odvodu, odnosno približno 1,5–2 cm pada po dužnom metru, kako se voda ne bi zadržavala u zoni tuširanja."],
                  ].map(([title, detail]) => (
                    <div key={title} className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[250px_1fr]">
                      <h3 className="text-sm font-black text-slate-900">{title}</h3>
                      <p className="text-sm leading-6 text-slate-600">{detail}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-5 flex items-center gap-3"><Wrench className="h-5 w-5 text-cyan-700" /><h2 className="text-2xl font-black text-slate-900">2. Redosled radova bez rizika od havarije</h2></div>
                <ol className="space-y-3">
                  {[
                    ["Zamena grubih instalacija", "Uklanjanje starih metalnih/olovnih cevi. Postavljanje PPR ili PEX vodovodnih cevi i niskošumnih HT PVC cevi za odvod."],
                    ["Montaža ugradnih elemenata", "Fiksiranje ugradnog vodokotlića i precizno nivelisanje podnog slivnika pre izlivanja završne košuljice."],
                    ["Dvokomponentna hidroizolacija", "Nanošenje elastičnog hidroizolacionog premaza u dva unakrsna sloja. Elastične zaptivne trake utopiti na spojeve pod–zid i zid–zid, a manžetne postaviti oko izlaza cevi."],
                    ["Keramika i fugovanje", "Koristiti fleksibilan lepak odgovarajuće klase; za veće formate i konkretan sistem proveriti zahtev proizvođača. U zoni tuša koristiti vodoodbojnu ili epoksidnu fug masu prema predviđenom sistemu."],
                    ["Završna montaža", "Povezati sanitarije, ugraditi ugaone filter ventile i silikonisati spojeve sanitarnim silikonom sa fungicidnom zaštitom."],
                  ].map(([title, detail], index) => (
                    <li key={title} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[44px_220px_1fr]">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-black text-white">{index + 1}</span>
                      <strong className="self-center text-sm text-slate-900">{title}</strong>
                      <p className="text-sm leading-6 text-slate-600">{detail}</p>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 sm:p-7">
                <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-cyan-700" /><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Paket 01</p><h2 className="text-xl font-black text-slate-900">Hidroizolacija tuš zone · do 5 m²</h2></div></div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Zaštita se ne rešava samo premazom. Komplet treba da pokrije površinu, uglove i sve prodore instalacija.</p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    "Dvokomponentni elastični hidroizolacioni premaz · kanta 15 kg",
                    "Zaptivna elastična traka za uglove · rolna 10 m",
                    "Zaptivne zidne manžetne za slavinu · 2 kom",
                    "Linijski podni tuš slivnik sa prohromskom rešetkom i suvim zatvaračem · 650 ili 750 mm",
                  ].map((item) => <div key={item} className="rounded-xl border border-cyan-100 bg-white p-4 text-sm font-semibold text-slate-800">{item}</div>)}
                </div>
                {waterproofing.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Proizvodi iz trenutnog kataloga</p>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{waterproofing.map((product) => <ProductCard key={product.id} product={product} />)}</div>
                  </div>
                )}
                <div className="mt-5 flex items-center gap-2 text-xs font-black text-emerald-700"><CheckCircle2 className="h-4 w-4" />Dostupnost proveravajte na kartici proizvoda pre poručivanja; lager je promenljiv.</div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Paket 02</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">Spojni materijal za završnu montažu</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">Sitni elementi često zaustave završetak posla. Proverite dimenzije i broj priključaka pre poručivanja.</p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    "Filter ugaoni ventili sa kapom · 1/2″ × 3/8″ · 4 kom za lavabo i vodokotlić",
                    "Sifon za lavabo · hromirani mesingani ili fleksibilni sa prelivom",
                    "Sanitarni silikon sa zaštitom od buđi · transparentni ili beli · 280 ml",
                    "Teflon konac / nit za dihtovanje navoja · za sigurne navojne veze",
                  ].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-800">{item}</div>)}
                </div>
                {finishing.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Proizvodi iz trenutnog kataloga</p>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{finishing.map((product) => <ProductCard key={product.id} product={product} />)}</div>
                  </div>
                )}
                <div className="mt-5 flex items-center gap-2 text-xs font-black text-emerald-700"><CheckCircle2 className="h-4 w-4" />Na stanju prikazuje se prema trenutnom stanju kataloga.</div>
              </section>

              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h2 className="text-xl font-black text-slate-900">Kontrola pre zatvaranja zidova</h2><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700"><li>• Proverene kote od gotovog poda.</li><li>• Proveren razmak baterije 150 mm.</li><li>• Odvodi imaju planiran pad i dostupni su za servis gde je potrebno.</li><li>• Vodokotlić i slivnik su nivelisani prema završnim kotama.</li><li>• Hidroizolacija je izvedena na podu, zidovima, uglovima i prodorima.</li><li>• Pre keramike je proverena kompatibilnost lepka, fug mase i podloge.</li></ul></div></div>
              </section>

              <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-7">
                <h2 className="text-xl font-black">Tehnička podrška pre poručivanja</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Niste sigurni koje dimenzije odvodnih redukcija ili koji tip lepka odgovara vašim pločicama? Pošaljite specifikaciju ili se obratite tehničkoj službi da proverimo kompatibilnost elemenata pre poručivanja.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/katalog" className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white hover:bg-cyan-500">Otvori katalog <ArrowRight className="h-4 w-4" /></Link>
                  <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">Nazad na početnu</Link>
                </div>
              </section>
            </div>
          </article>
        </div>
      </main>
    );
  }

  const article = articles[slug as keyof typeof articles];
  if (!article) notFound();
  return <StandardArticlePage article={article} />;
}

function StandardArticlePage({ article }: { article: StandardArticle }) {
  return (
    <main className="bg-slate-50">
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-700 hover:text-cyan-900"><ArrowLeft className="h-4 w-4" /> Nazad na početnu</Link>
        <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 px-6 py-8 sm:px-10 sm:py-10">
            <span className="inline-flex rounded-md bg-cyan-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-800">{article.type}</span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">{article.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{article.intro}</p>
          </header>
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="space-y-8">{article.sections.map(([heading, text]) => <section key={heading}><h2 className="text-xl font-black text-slate-900">{heading}</h2><p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">{text}</p></section>)}</div>
            <div className="mt-10 rounded-2xl border border-cyan-100 bg-cyan-50 p-5 sm:p-6"><h2 className="text-lg font-black text-slate-900">Brza kontrolna lista</h2><ul className="mt-4 grid gap-2 sm:grid-cols-2">{article.checklist.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" /> {item}</li>)}</ul></div>
            <div className="mt-10 flex flex-col gap-3 rounded-2xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-black">Treba vam materijal za ovaj projekat?</h2><p className="mt-1 text-sm text-slate-300">Pogledajte proizvode u Aqua Still katalogu.</p></div><Link href="/katalog" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold hover:bg-cyan-500">Otvori katalog <ArrowRight className="h-4 w-4" /></Link></div>
          </div>
        </article>
      </div>
    </main>
  );
}
