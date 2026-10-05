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

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Upravljanje porudžbinama</h1>
        <p className="text-slate-500 text-xs mt-1">Pregledajte prispele porudžbine i pratite statuse isporuke i preuzimanja. Porudžbine na čekanju drže zalihe 48 sati, pa se same otkazuju ako ostanu nepotvrđene. Premestite prihvaćenu porudžbinu u obradu.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Nema evidentiranih porudžbina</h3>
            <p className="text-xs text-slate-500">Porudžbine kupaca će se automatski pojaviti ovde nakon završetka checkout-a.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                {orders.map((order) => {
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
                      <td className="py-4 px-4 font-black text-cyan-700">{formatPrice(order.total)}</td>
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
                        <OrderStatusSelect orderId={order.id} status={order.status} shippingMethod={customer.shippingMethod} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
