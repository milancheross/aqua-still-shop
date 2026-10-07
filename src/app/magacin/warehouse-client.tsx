"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Boxes, CheckCircle2,
  ChevronRight, ClipboardCheck, LayoutGrid, MapPin, PackageSearch,
  ScanLine, Search, Warehouse, X
} from "lucide-react";
import {
  assignWarehouseLocation, recordWarehouseMovement, searchWarehouseProduct
} from "@/actions/warehouse-actions";
import BarcodeScanner from "@/components/warehouse/BarcodeScanner";

type Product = {
  id: string; sku: string; barcode: string | null; name: string; brand: string;
  stockQuantity: number; unit: string; wmsLocation: string | null;
  warehouseLocation: { code: string; label: string } | null;
};
type Data = {
  stats: { productCount:number; lowStockCount:number; outOfStockCount:number; unassignedCount:number; locationCount:number };
  products: Product[];
  movements: { id:string; type:string; quantity:number; note:string|null; createdAt:string; productName:string; sku:string; location:string|null }[];
};

const labels: Record<string,string> = {
  receipt:"Prijem robe", issue:"Izdavanje robe", transfer:"Premeštanje", stocktake:"Provera stanja"
};
const icons = { receipt: ArrowDownToLine, issue: ArrowUpFromLine, transfer: ArrowLeftRight, stocktake: ClipboardCheck };

export function WarehouseClient({ initialData }: { initialData: Data }) {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState("pregled");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [busy, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.products;
    return data.products.filter((p) =>
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.barcode ?? "").includes(q)
    );
  }, [data.products, query]);

  async function refresh() {
    window.location.reload();
  }

  async function doMovement(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      try {
        await recordWarehouseMovement(formData);
        setMessage("Promena je sačuvana.");
        await refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Promena nije sačuvana.");
      }
    });
  }

  async function assignLocation(productId: string, locationId: string) {
    setMessage("");
    startTransition(async () => {
      try {
        await assignWarehouseLocation(productId, locationId);
        setMessage("Lokacija je sačuvana.");
        await refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Lokacija nije sačuvana.");
      }
    });
  }

  const findProduct = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    startTransition(async () => {
      try {
        const result = await searchWarehouseProduct(trimmed);
        if (!result) {
          setMessage("Proizvod nije pronađen po šifri, barkodu ili nazivu.");
          return;
        }
        setSelected({
          ...result,
          wmsLocation: result.warehouseLocation?.code ?? null,
          warehouseLocation: result.warehouseLocation,
        });
        setTab("proizvodi");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Pretraga nije uspela.");
      }
    });
  }, []);

  const handleBarcodeDetected = useCallback((value: string) => {
    setScannerOpen(false);
    findProduct(value);
  }, [findProduct]);

  const stats = [
    { label:"Artikli", value:data.stats.productCount, icon:Boxes, tone:"bg-blue-50 text-blue-700" },
    { label:"Pri kraju", value:data.stats.lowStockCount, icon:PackageSearch, tone:"bg-amber-50 text-amber-700" },
    { label:"Bez zalihe", value:data.stats.outOfStockCount, icon:X, tone:"bg-red-50 text-red-700" },
    { label:"Bez lokacije", value:data.stats.unassignedCount, icon:MapPin, tone:"bg-slate-100 text-slate-700" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6">
      <header className="rounded-3xl bg-slate-900 p-5 text-white sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              <Warehouse className="h-4 w-4" /> Aqua Still
            </div>
            <h1 className="text-2xl font-black sm:text-3xl">Magacin</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-300">Jednostavan pregled robe, lokacija i promena — napravljen da radi jednako dobro na telefonu, tabletu i računaru.</p>
          </div>
          <div className="hidden rounded-2xl bg-white/10 px-4 py-3 text-right sm:block">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kapacitet lokacija</div>
            <div className="text-xl font-black">{data.stats.locationCount}</div>
            <div className="text-xs text-slate-400">5 redova × 10 polja × 3 sprata</div>
          </div>
        </div>
      </header>

      {message && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800" role="status">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {stats.map(({label,value,icon:Icon,tone}) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></div>
            <div className="text-2xl font-black text-slate-900">{value}</div>
            <div className="text-xs font-bold text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <nav className="sticky top-0 z-20 -mx-1 rounded-2xl bg-white/95 p-1 shadow-sm backdrop-blur">
        <div className="grid grid-cols-2 gap-1 sm:flex sm:min-w-max">
          {[
            ["pregled","Pregled"],["proizvodi","Proizvodi"],["prijem","Prijem"],["izdavanje","Izdavanje"],
            ["premeštanje","Premeštanje"],["provera","Provera stanja"],["lokacije","Lokacije"]
          ].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)} className={`min-h-10 rounded-xl px-2 py-2 text-[11px] font-black transition sm:px-3 sm:text-xs ${tab===key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      {tab === "pregled" && (
        <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="text-lg font-black">Brze akcije</h2><p className="text-xs text-slate-500">Najčešće radnje radnika.</p></div>
              <LayoutGrid className="h-5 w-5 text-slate-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["prijem","Prijem robe",ArrowDownToLine,"bg-emerald-50 text-emerald-700"],
                ["izdavanje","Izdavanje",ArrowUpFromLine,"bg-orange-50 text-orange-700"],
                ["premeštanje","Premeštanje",ArrowLeftRight,"bg-blue-50 text-blue-700"],
                ["provera","Provera stanja",ClipboardCheck,"bg-slate-100 text-slate-700"],
              ].map(([key,label,Icon,tone]) => (
                <button key={key as string} onClick={() => setTab(key as string)} className="rounded-2xl border border-slate-200 p-4 text-left hover:border-blue-300 hover:bg-blue-50">
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone as string}`}><Icon className="h-5 w-5" /></div>
                  <div className="text-sm font-black">{label as string}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-black">Poslednje promene</h2>
            <div className="mt-4 space-y-3">
              {data.movements.slice(0,6).map((m) => {
                const Icon = icons[m.type as keyof typeof icons] ?? CheckCircle2;
                return <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <Icon className="h-4 w-4 shrink-0 text-blue-600" />
                  <div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{labels[m.type] ?? m.type}</div><div className="truncate text-[11px] text-slate-500">{m.sku} · {m.productName}</div></div>
                  <strong className="text-xs">{m.type==="issue" ? "-" : "+"}{m.quantity}</strong>
                </div>;
              })}
              {!data.movements.length && <p className="text-sm text-slate-500">Još nema zabeleženih promena.</p>}
            </div>
          </div>
        </section>
      )}

      {(tab === "proizvodi" || tab === "prijem" || tab === "izdavanje" || tab === "premeštanje" || tab === "provera") && (
        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter") findProduct(query);}} placeholder="Unesite šifru proizvoda..." className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white" />
              </div>
              <button onClick={() => { if (query.trim()) findProduct(query); else setScannerOpen(true); }} disabled={busy} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50">
                <ScanLine className="h-4 w-4" /> Pronađi / skeniraj
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Primarno koristimo šifru proizvoda. Barkod ostaje podržan kao rezervna opcija za ručni ili laserski skener.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-4 sm:px-6"><h2 className="font-black">Proizvodi</h2><p className="text-xs text-slate-500">{filtered.length} prikazanih artikala</p></div>
              <div className="divide-y divide-slate-100">
                {filtered.map((product) => (
                  <button key={product.id} onClick={()=>setSelected(product)} className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-slate-50 sm:px-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100"><Boxes className="h-5 w-5 text-slate-500" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-black">{product.name}</div>
                      <div className="text-[11px] text-slate-500">{product.sku} · {product.brand}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-black ${product.stockQuantity<=0 ? "text-red-600" : product.stockQuantity<=5 ? "text-amber-600" : "text-emerald-600"}`}>{product.stockQuantity} {product.unit}</div>
                      <div className="text-[10px] text-slate-400">{product.warehouseLocation?.code ?? "Bez lokacije"}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              {selected ? (
                <div className="space-y-4">
                  <button onClick={()=>setSelected(null)} className="text-xs font-bold text-slate-500">← Nazad na listu</button>
                  <div><div className="text-xs font-bold text-blue-600">{selected.sku}</div><h2 className="mt-1 text-xl font-black">{selected.name}</h2><p className="text-xs text-slate-500">{selected.brand}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Trenutno stanje</div><div className="mt-1 text-3xl font-black">{selected.stockQuantity} <span className="text-sm">{selected.unit}</span></div></div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-2 text-xs font-bold text-slate-500">Lokacija</div>
                    <div className="text-lg font-black">{selected.warehouseLocation?.code ?? "Nije dodeljena"}</div>
                    <div className="text-xs text-slate-400">{selected.warehouseLocation?.label ?? "Dodelite jednostavnu oznaku regala."}</div>
                  </div>

                  {tab !== "proizvodi" && (
                    <form onSubmit={(event) => { event.preventDefault(); void doMovement(new FormData(event.currentTarget)); }} className="space-y-3">
                      <input type="hidden" name="productId" value={selected.id} />
                      <input type="hidden" name="type" value={tab==="prijem"?"receipt":tab==="izdavanje"?"issue":tab==="premeštanje"?"transfer":"stocktake"} />
                      <label className="block text-xs font-bold">{tab==="provera" ? "Stvarno stanje" : "Količina"}
                        <input name="quantity" type="number" min="1" defaultValue={1} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" required />
                      </label>
                      {(tab==="prijem" || tab==="premeštanje" || tab==="provera") && (
                        <label className="block text-xs font-bold">Lokacija
                          <select name="locationId" defaultValue={selected.warehouseLocation?.code ? locationOptions.find((location) => location.code === selected.warehouseLocation?.code)?.id ?? "" : ""} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">
                            <option value="">Bez promene</option>
                            {locationOptions.map((location)=> <option key={location.id} value={location.id}>{location.code}</option>)}
                          </select>
                        </label>
                      )}
                      <label className="block text-xs font-bold">Napomena
                        <input name="note" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="Opcionalno" />
                      </label>
                      <button type="submit" disabled={busy} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white disabled:opacity-50">{labels[tab==="prijem"?"receipt":tab==="izdavanje"?"issue":tab==="premeštanje"?"transfer":"stocktake"]}</button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="flex min-h-60 flex-col items-center justify-center text-center"><PackageSearch className="h-10 w-10 text-slate-200" /><h2 className="mt-3 font-black">Izaberite proizvod</h2><p className="mt-1 max-w-xs text-xs text-slate-500">Na telefonu je dovoljno da unesete šifru i izaberete artikl.</p></div>
              )}
            </div>
          </div>
        </section>
      )}

      {tab === "lokacije" && (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5"><h2 className="text-xl font-black">Lokacije magacina</h2><p className="text-sm text-slate-500">Jednostavne oznake: Red · Polje · Sprat. Ukupno 150 pozicija.</p></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({length:5},(_,r)=>(
              <div key={r} className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 font-black">Red {r+1}</div>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({length:10},(_,c)=> <div key={c} className="rounded-lg bg-slate-50 px-1 py-2 text-center text-[10px] font-bold text-slate-500">K{String(c+1).padStart(2,"0")}</div>)}
                </div>
                <div className="mt-3 text-[11px] text-slate-400">Svako polje ima sprat 1–3.</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {scannerOpen && <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setScannerOpen(false)} />}

    <div className="text-center text-[11px] text-slate-400">Zaliha je vezana za isti Product zapis koji koristi webshop. Magacin vodi lokaciju i istoriju promena u istoj PostgreSQL bazi.</div>
    </div>
  );
}

const locationOptions = Array.from({length:150}, (_,i) => {
  const row = Math.floor(i/30)+1;
  const within = i%30;
  const level = Math.floor(within/10)+1;
  const column = within%10+1;
  return { id:`wh_${row}_${column}_${level}`, code:`R${row}-K${String(column).padStart(2,"0")}-S${level}` };
});
