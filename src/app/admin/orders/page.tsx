import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getAdminOrders } from "@/actions/admin-cms-actions";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import { formatPrice } from "@/lib/utils";
import {
  formatReservationLeft,
  orderStatusClass,
  orderStatusLabel,
  reservationDeadline,
} from "@/lib/order-present";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams;
  const orders = await getAdminOrders();
  const status = params.status ?? "";
  const query = (params.q ?? "").trim().toLowerCase();
  const filters = [
    ["", "Sve"],
    ["pending", "Na čekanju"],
    ["processing", "U obradi"],
    ["shipped", "Poslato"],
    ["ready_for_pickup", "Za preuzimanje"],
    ["delivered", "Isporučeno"],
    ["cancelled", "Otkazano"],
  ];
  const visible = orders.filter((order) => {
    if (status && order.status !== status) return false;
    if (!query) return true;
    const customer = order.customerInfo;
    const haystack = [order.orderNumber, customer.firstName, customer.lastName, customer.email, customer.phone]
      .map((value) => String(value ?? ""))
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Upravljanje porudžbinama</h1>
        <p className="text-slate-500 text-xs mt-1">Pregledajte prispele porudžbine i pratite statuse isporuke i preuzimanja. Porudžbine na čekanju drže zalihe 48 sati, pa se same otkazuju ako ostanu nepotvrđene. Premestite prihvaćenu porudžbinu u obradu.</p>
      </div>

      <form className="grid gap-2 sm:flex sm:flex-wrap sm:items-center" action="/admin/orders">
        {filters.map(([value, label]) => (
          <Link
            key={value || "all"}
            href={value ? `/admin/orders?status=${value}` : "/admin/orders"}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${status === value ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            {label}
          </Link>
        ))}
        <input name="q" defaultValue={params.q ?? ""} placeholder="Broj, ime, telefon ili email" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:ml-auto sm:w-auto sm:min-w-52 outline-none focus:border-cyan-500" />
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <button className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white">Traži</button>
      </form>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {visible.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Nema evidentiranih porudžbina</h3>
            <p className="text-xs text-slate-500">Porudžbine kupaca će se automatski pojaviti ovde nakon završetka checkout-a.</p>
          </div>
        ) : (
          <>
          <div className="space-y-3 lg:hidden">
            {visible.map((order) => {
              const customer = order.customerInfo;
              const isStorePickup = customer.shippingMethod === "store_pickup";
              const reservation = order.status === "pending"
                ? formatReservationLeft(reservationDeadline(order.createdAt, order.stockReservedUntil))
                : null;
              return (
                <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/admin/orders/${order.id}`} className="font-mono text-sm font-black text-slate-900">{order.orderNumber}</Link>
                      <p className="mt-1 text-xs font-bold text-slate-700">{String(customer.firstName ?? "")} {String(customer.lastName ?? "")}</p>
                      <p className="text-[11px] text-slate-400">{String(customer.phone ?? "")}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${orderStatusClass(order.status)}`}>{orderStatusLabel(order.status)}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-xl bg-slate-50 p-3"><span className="block text-slate-400">Isporuka</span><strong>{isStorePickup ? "Preuzimanje u radnji" : "Dostava"}</strong></div>
                    <div className="rounded-xl bg-slate-50 p-3"><span className="block text-slate-400">Iznos</span><strong className="text-cyan-700">{formatPrice(order.total)}</strong></div>
                  </div>
                  {reservation && <p className="mt-2 text-[10px] font-bold text-amber-700">Rezervacija: {reservation}</p>}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link href={`/admin/orders/${order.id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white">Detalji</Link>
                    <OrderStatusSelect orderId={order.id} status={order.status} shippingMethod={customer.shippingMethod} />
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Broj porudžbine</th>
                  <th className="py-3 px-4">Kupac</th>
                  <th className="py-3 px-4">Način isporuke</th>
                  <th className="py-3 px-4">Iznos</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Datum</th>
                  <th className="py-3 px-4 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((order) => {
                  const customer = order.customerInfo;
                  const isStorePickup = customer.shippingMethod === "store_pickup";
                  const reservation = order.status === "pending"
                    ? formatReservationLeft(reservationDeadline(order.createdAt, order.stockReservedUntil))
                    : null;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-black text-slate-900 font-mono">
                        <Link href={`/admin/orders/${order.id}`} className="hover:text-cyan-700 hover:underline">{order.orderNumber}</Link>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 block">{String(customer.firstName ?? "")} {String(customer.lastName ?? "")}</span>
                        <span className="text-[10px] text-slate-400 block">{String(customer.phone ?? "")}</span>
                      </td>
                      <td className="py-4 px-4">
                        {isStorePickup ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-full text-[10px]">
                            Preuzimanje u radnji
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-full text-[10px]">
                            Dostava na adresu
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-black text-cyan-700">
                        {formatPrice(order.total)}
                        <span className={`mt-1 block text-[10px] ${order.customerInfo.paid === true ? "text-emerald-600" : "text-slate-400"}`}>
                          {order.customerInfo.paid === true ? "Plaćeno" : "Nije plaćeno"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 font-bold rounded-full text-[10px] ${orderStatusClass(order.status)}`}>
                          {orderStatusLabel(order.status)}
                        </span>
                        {reservation && (
                          <span className={`mt-1 block text-[10px] font-bold ${reservation.startsWith("Istekla") ? "text-red-600" : "text-amber-700"}`}>
                            Rezervacija {reservation}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString("sr-RS")} {new Date(order.createdAt).toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/orders/${order.id}`} className="rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-bold text-white">Detalji</Link>
                          <OrderStatusSelect orderId={order.id} status={order.status} shippingMethod={customer.shippingMethod} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
