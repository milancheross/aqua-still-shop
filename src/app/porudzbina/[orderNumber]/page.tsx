import React from "react";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, Truck, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { formatPrice } from "@/lib/utils";

interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ key?: string }>;
}

export default async function OrderConfirmationPage({ params, searchParams }: OrderConfirmationPageProps) {
  const { orderNumber } = await params;
  const { key } = await searchParams;

  type OrderWithItems = Prisma.OrderGetPayload<{ include: { orderItems: true } }>;
  let orderRecord: OrderWithItems | null = null;
  try {
    if (process.env.DATABASE_URL) {
      orderRecord = await db.order.findUnique({
        where: { orderNumber },
        include: { orderItems: true },
      });
    }
  } catch (error) {
    console.warn("Could not fetch order from DB:", error);
  }

  type CustomerInfo = {
    confirmationToken?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    shippingMethod?: string;
    pickupNotice?: string;
  };
  const storedInfo = orderRecord?.customerInfo as CustomerInfo | null;
  const order = storedInfo?.confirmationToken && key && storedInfo.confirmationToken === key ? orderRecord : null;
  const customerInfo = order?.customerInfo as CustomerInfo | null;
  const items = order?.orderItems ?? [];
  const isStorePickup = customerInfo?.shippingMethod === "store_pickup";

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider rounded-md">
              Porudžbina uspešno evidentirana
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Hvala vam na poverenju!</h1>
            <p className="text-slate-600 text-sm">
              Vaša porudžbina <strong className="text-slate-950 font-bold">{orderNumber}</strong> je primljena i ima početni status <strong className="text-cyan-700 font-bold">Nova</strong>.
            </p>
          </div>

          {/* INSTRUCTIONS BOX FOR STORE PICKUP OR COURIER */}
          {isStorePickup ? (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-5 sm:p-6 text-left space-y-3">
              <div className="flex items-center gap-2.5 text-cyan-900">
                <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-cyan-950">
                    Instrukcije za lično preuzimanje robe
                  </h4>
                  <p className="text-xs text-cyan-800 font-semibold">
                    Roba je dostupna za preuzimanje narednog radnog dana nakon potvrde porudžbine.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-cyan-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div>
                  <strong className="block text-slate-900 font-bold">📍 Lokacija salona:</strong>
                  <span>Aqua Still Zlatibor (Salon i magacin)</span>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">⏰ Radno vreme:</strong>
                  <span>Ponedeljak – Subota: 07:00 – 17:00h</span>
                </div>
              </div>
              <p className="text-[11px] text-cyan-900 bg-white/80 p-2.5 rounded-xl border border-cyan-100">
                💡 <strong>Savet:</strong> Prilikom dolaska u salon, na pultu samo navedite broj vaše porudžbine: <strong className="font-bold">{orderNumber}</strong>.
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-left flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-emerald-950">Dostava kurirskom službom</h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Vaša pošiljka se pakuje i biće predata kurirskoj službi. Očekivani rok isporuke je 1–2 radna dana na navedenu adresu. Iznos plaćate kuriru gotovinom pri preuzimanju paketa.
                </p>
              </div>
            </div>
          )}

          {order && (
            <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4 border border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-600" /> Detalji isporuke i plaćanja
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 block font-bold">Kupac / Primalac:</span>
                  <span className="text-slate-900 font-bold">{customerInfo?.firstName} {customerInfo?.lastName}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block font-bold">Kontakt telefon:</span>
                  <span className="text-slate-900 font-bold">{customerInfo?.phone}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block font-bold">{isStorePickup ? "Način preuzimanja:" : "Adresa dostave:"}</span>
                  <span className="text-slate-900 font-bold">{customerInfo?.street}, {customerInfo?.postalCode} {customerInfo?.city}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block font-bold">Način plaćanja:</span>
                  <span className="text-slate-900 font-bold">{isStorePickup ? "Plaćanje pri preuzimanju u radnji" : "Plaćanje pouzećem kuriru"}</span>
                </div>
              </div>

              {items.length > 0 && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Poručeni artikli:</span>
                  <div className="space-y-2 divide-y divide-slate-100">
                    {items.map((it) => (
                      <div key={it.id} className="flex justify-between items-center text-xs pt-1.5 first:pt-0">
                        <div>
                          <span className="font-bold text-slate-900">{it.productName}</span>
                          <span className="text-slate-500 text-[11px] block">Količina: {it.quantity} kom &bull; Cena: {formatPrice(Number(it.price))}</span>
                        </div>
                        <span className="font-black text-slate-900">{formatPrice(Number(it.total))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between text-sm font-black text-slate-900">
                  <span>Ukupan iznos za uplatu:</span>
                  <span className="text-cyan-700">{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/katalog"
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-2xl transition-colors shadow-lg flex items-center gap-2"
            >
              Nastavi kupovinu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
