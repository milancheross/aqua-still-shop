import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

const articles = {
  "kako-izabrati-pravu-pumpu-za-vodu": {
    type: "VODIČ",
    title: "Kako izabrati pravu pumpu za vodu?",
    intro: "Pre kupovine pumpe najvažnije je da znate odakle uzimate vodu, gde je šaljete i koliki protok i pritisak su vam potrebni.",
    sections: [
      ["1. Odredite namenu", "Za bunar, cisternu, baštu, kuću ili povećanje pritiska ne bira se ista pumpa. Prvo definišite namenu, jer ona određuje tip pumpe."],
      ["2. Proverite visinu dizanja", "Visina dizanja govori koliko visoko pumpa može da potisne vodu. Računajte visinsku razliku između izvora i najviše tačke, ali i gubitke kroz cevi, kolena, filtere i ventile."],
      ["3. Pogledajte protok", "Protok se izražava u l/min ili m³/h. Za navodnjavanje je važan potreban protok prskalica, dok je za kuću bitno da pumpa može da obezbedi dovoljan protok pri realnom pritisku."],
      ["4. Ne birajte samo po snazi motora", "Veća snaga ne znači automatski bolju pumpu. Važna je kombinacija protoka, pritiska, visine dizanja, prečnika cevi i uslova rada."],
      ["5. Proverite uslove rada", "Obratite pažnju na temperaturu vode, dubinu usisa, zaštitu od rada na suvo i mogućnost automatskog uključivanja. Kod složenijih instalacija bolje je proveriti izbor sa stručnim licem."],
    ],
    checklist: ["Namena pumpe", "Visinska razlika", "Potreban protok", "Prečnik i dužina cevi", "Zaštita i način upravljanja"],
  },
  "renoviranje-kupatila-od-cega-poceti": {
    type: "KORISNI SAVET",
    title: "Renoviranje kupatila – od čega početi?",
    intro: "Dobar redosled radova sprečava skupe greške. Pre kupovine sanitarija prvo rešite instalacije, mere i raspored.",
    sections: [
      ["1. Izmerite prostor", "Zapišite dužinu, širinu, visinu, položaj vrata, prozora i postojećih priključaka. Nekoliko centimetara može odlučiti da li određena kada, tuš kabina ili ormarić može da stane."],
      ["2. Isplanirajte instalacije", "Pre zatvaranja zidova definišite položaj dovoda vode, odvoda, sifona i priključaka. Ne kupujte sanitarije pre nego što znate njihove tačne mere i priključke."],
      ["3. Birajte materijal prema nameni", "Za vodovod i odvodnju koristite odgovarajući cevni i spojni materijal. Kod slavina i baterija proverite priključke, razmak i način montaže."],
      ["4. Redosled radova je važan", "Grubi radovi i instalacije idu pre keramike i završne montaže. Tako se smanjuje rizik da novim pločicama ili sanitarijama napravite štetu tokom instalacije."],
      ["5. Ostavite pristup za servis", "Ventili, sifoni i elementi koji zahtevaju održavanje ne treba da budu trajno nedostupni. Servisni pristup danas znači manje problema kasnije."],
    ],
    checklist: ["Mere prostora", "Raspored sanitarija", "Dovod i odvod", "Izbor baterija i opreme", "Servisni pristup"],
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
      ["5. Nanosite ujednačene slojeve", "Nemojте наносити превише боје одједном. Радите равномерно, без дугог враћања на делове који су већ почели да се суше."],
    ],
    checklist: ["Čist i pripremljen zid", "Zaštita prostora", "Valjak i četka", "Odgovarajuća podloga", "Dva ili više tankih slojeva po potrebi"],
  },
};

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug as keyof typeof articles];
  if (!article) notFound();

  return (
    <main className="bg-slate-50">
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-700 hover:text-cyan-900">
          <ArrowLeft className="h-4 w-4" /> Nazad na početnu
        </Link>

        <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 px-6 py-8 sm:px-10 sm:py-10">
            <span className="inline-flex rounded-md bg-cyan-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-800">{article.type}</span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">{article.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{article.intro}</p>
          </header>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="space-y-8">
              {article.sections.map(([heading, text]) => (
                <section key={heading}>
                  <h2 className="text-xl font-black text-slate-900">{heading}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">{text}</p>
                </section>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-cyan-100 bg-cyan-50 p-5 sm:p-6">
              <h2 className="text-lg font-black text-slate-900">Brza kontrolna lista</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {article.checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 flex flex-col gap-3 rounded-2xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-black">Treba vam materijal za ovaj projekat?</h2>
                <p className="mt-1 text-sm text-slate-300">Pogledajte proizvode u Aqua Still katalogu.</p>
              </div>
              <Link href="/katalog" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold hover:bg-cyan-500">
                Otvori katalog <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
