import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { getAdminOrderById } from "@/actions/admin-cms-actions";
import OrderDesk from "@/components/admin/OrderDesk";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import { formatPrice } from "@/lib/utils";
import {
  formatReservationLeft,
  orderStatusClass,
  orderStatusLabel,
  reservationDeadline,
} from "@/lib/order-present";

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function privateNotes(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const note = entry as Record<string, unknown>;
    if (typeof note.message !== "string" || typeof note.createdAt !== "string") return [];
    return [{ id: typeof note.id === "string" ? note.id : note.createdAt, message: note.message, createdAt: note.createdAt }];
  });
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const customer = order.customerInfo;
  const pickup = customer.shippingMethod === "store_pickup";
  const notes = text(customer.notes);
  const deadline = reservationDeadline(order.createdAt, order.stockReservedUntil);
  const reservationText = order.status === "pending" ? formatReservationLeft(deadline) : null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Sve porudžbine
          </Link>
          <h1 className="mt-2 font-mono text-2xl font-black text-slate-900">{order.orderNumber}</h1>
          <p className="mt-1 text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleDateString("sr-RS")}{" "}
            {new Date(order.createdAt).toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${orderStatusClass(order.status)}`}>
            {orderStatusLabel(order.status)}
          </span>
          <OrderStatusSelect orderId={order.id} status={order.status} shippingMethod={customer.shippingMethod} />
        </div>
      </div>

      {reservationText && (
        <p className={`rounded-2xl border px-4 py-3 text-xs font-bold ${reservationText.startsWith("Istekla") ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
          Rezervacija zaliha: {reservationText}. Premestite porudžbinu u obradu ako je prihvatate.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-5 lg:gap-6">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          <h2 className="text-sm font-black text-slate-900">Kupac i isporuka</h2>
          <p className="text-base font-black text-slate-900">{text(customer.firstName)} {text(customer.lastName)}</p>
          <p className="flex items-center gap-2 text-sm text-slate-700"><Phone className="h-4 w-4 text-cyan-700" /> {text(customer.phone) || "—"}</p>
          <p className="flex items-center gap-2 text-sm text-slate-700"><Mail className="h-4 w-4 text-cyan-700" /> {text(customer.email) || "—"}</p>
          <p className="flex items-start gap-2 text-sm text-slate-700">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
            <span>
              {pickup ? "Lično preuzimanje u radnji, Zlatibor" : `${text(customer.street)}, ${text(customer.postalCode)} ${text(customer.city)}`}
            </span>
          </p>
          <p className="text-xs font-bold text-slate-500">
            Plaćanje: {pickup ? "pri preuzimanju u radnji" : "pouzećem kuriru"} · {customer.paid === true ? "plaćeno" : "nije plaćeno"}
          </p>
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-black uppercase tracking-wide text-slate-400">Napomena</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{notes || "Nema napomene."}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="mb-4 text-sm font-black text-slate-900">Stavke</h2>
          <div className="space-y-2 lg:hidden">
            {order.orderItems.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-3">
                <div className="font-bold text-sm text-slate-900">{item.productName}</div>
                <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-slate-500">
                  <span className="font-mono">{item.sku}</span>
                  <span>Količina: <strong>{item.quantity}</strong></span>
                </div>
                <div className="mt-2 flex justify-between text-xs">
                  <span>{formatPrice(item.price)} / kom</span>
                  <strong>{formatPrice(item.total)}</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2 pr-3">Proizvod</th>
                  <th className="py-2 pr-3">Šifra</th>
                  <th className="py-2 pr-3 text-right">Kol.</th>
                  <th className="py-2 pr-3 text-right">Cena</th>
                  <th className="py-2 text-right">Ukupno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.orderItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-3 font-bold text-slate-900">{item.productName}</td>
                    <td className="py-3 pr-3 font-mono text-slate-500">{item.sku}</td>
                    <td className="py-3 pr-3 text-right">{item.quantity}</td>
                    <td className="py-3 pr-3 text-right">{formatPrice(item.price)}</td>
                    <td className="py-3 text-right font-black text-slate-900">{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Međuzbir</dt><dd className="font-bold">{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">PDV (uračunat)</dt><dd className="font-bold">{formatPrice(order.taxAmount)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Dostava</dt><dd className="font-bold">{order.shippingCost === 0 ? "Besplatno" : formatPrice(order.shippingCost)}</dd></div>
            <div className="flex justify-between text-base"><dt className="font-black text-slate-900">Ukupno</dt><dd className="font-black text-cyan-700">{formatPrice(order.total)}</dd></div>
          </dl>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-black text-slate-900">Radnje na porudžbini</h2>
        <OrderDesk orderId={order.id} paid={customer.paid === true} notes={privateNotes(customer.privateNotes)} />
      </section>
    </div>
  );
}
