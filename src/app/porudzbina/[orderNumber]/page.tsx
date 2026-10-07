import React from "react";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, Truck, MapPin, Phone, Mail } from "lucide-react";
import { db } from "@/lib/db";\nimport type { Prisma } from "@prisma/client";
import { formatPrice } from "@/lib/utils";

interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ key?: string }>;
}

export default async function OrderConfirmationPage({ params, searchParams }: OrderConfirmationPageProps) {
  const { orderNumber } = await params;
  const { key } = await searchParams;

  type OrderWithItems = Prisma.OrderGetPayload<{ include: { orderItems: true } }>;\n  let orderRecord: OrderWithItems | null = null;
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

  type CustomerInfo = {\n    confirmationToken?: string;\n    firstName?: string;\n    lastName?: string;\n    phone?: string;\n    street?: string;\n    postalCode?: string;\n    city?: string;\n    shippingMethod?: string;\n  };\n  const storedInfo = orderRecord?.customerInfo as CustomerInfo | null;
  const order = storedInfo?.confirmationToken && key && storedInfo.confirmationToken === key ? orderRecord : null;
  const customerInfo = order?.customerInfo as CustomerInfo | null;
  const items = order?.orderItems ?? [];

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider rounded-md">
              Uspešno kreirana porudžbina
            </span>
            <h1 className="text-3xl font-black text-slate-900">Hvala vam na kupovini!</h1>
            <p className="text-slate-600 text-sm">
              Vaša porudžbina <strong className="text-slate-950 font-bold">{orderNumber}</strong> je uspešno primljena i prosleđena u obradu.
            </p>
          </div>

          {order && (
            <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4 border border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-600" /> Detalji isporuke i plaćanja
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 block font-bold">Primalac:</span>
                  <span className="text-slate-900 font-bold">{customerInfo?.firstName} {customerInfo?.lastName}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block font-bold">Kontakt telefon:</span>
                  <span className="text-slate-900 font-bold">{customerInfo?.phone}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block font-bold">{customerInfo?.shippingMethod === "store_pickup" ? "Način preuzimanja:" : "Adresa dostave:"}</span>
                  <span className="text-slate-900 font-bold">{customerInfo?.street}, {customerInfo?.postalCode} {customerInfo?.city}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block font-bold">Način plaćanja:</span>
                  <span className="text-slate-900 font-bold">{customerInfo?.shippingMethod === "store_pickup" ? "Plaćanje pri preuzimanju u radnji" : "Plaćanje pouzećem kuriru"}</span>
                </div>
              </div>

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
