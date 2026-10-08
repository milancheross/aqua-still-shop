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
    type: "URADI SAM",
    title: "Farbanje zida korak po korak",
    intro: "Najbolji rezultat ne zavisi samo od boje. Priprema zida, pravi alat i pravilno nanošenje često su važniji od same brzine rada.",
    sections: [
      ["1. Pripremite površinu", "Uklonite prašinu, masnoću i delove stare boje koji se ljušte. Neravnine i pukotine popravite odgovarajućim materijalom i ostavite da se osuši."],
      ["2. Zaštitite prostor", "Prekrijte pod i nameštaj, zaštitite utičnice i ivice koje ne želite da obojite. Dobra priprema štedi mnogo vremena na čišćenju."],
      ["3. Izaberite odgovarajući alat", "Za veće ravne površine koristite kvalitetan valjak odgovarajuće dlake, a četku za uglove i detalje. Za visoke zidove praktična je teleskopska drška."],
      ["4. Grundiranje po potrebi", "Novi, jako upijajući ili problematični zidovi mogu zahtevati odgovarajuću podlogu. Ona ujednačava upijanje i pomaže završnom sloju."],
      ["5. Nanosite ujednačene slojeve", "Ne nanosite previše boje odjednom. Radite ravnomerno, bez dugog vraćanja na delove koji su već počeli da se suše."],
    ],
    checklist: ["Čist i pripremljen zid", "Zaštita prostora", "Valjak i četka", "Odgovarajuća podloga", "Dva ili više tankih slojeva po potrebi"],
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

export function generateStaticParams() {
  return [
    { slug: "kako-izabrati-pravu-pumpu-za-vodu" },
    ...Object.keys(articles).map((slug) => ({ slug })),
  ];
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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

  if (slug === "renoviranje-kupatila-od-cega-poceti") {
    const bathroomProducts = await getDbProducts({ sort: "newest" });
    const waterproofing = pickBundleProducts(bathroomProducts, /hidroizol|hidroizolacion/i, 4);
    const used = new Set(waterproofing.map((product) => product.id));
    const finishing = pickBundleProducts(bathroomProducts, /ventil|sifon|silikon|teflon|diht|zaptiv/i, 4, used);

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
