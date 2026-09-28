"use client";

import React, { useState, useEffect, useTransition } from "react";
import { ShoppingCart, Loader2, CheckCircle2, Clock, Truck, Check, AlertCircle } from "lucide-react";
import { getAdminOrders, updateOrderStatusAction } from "@/actions/admin-cms-actions";
import { formatPrice } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getAdminOrders>>>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    startTransition(async () => {
      try {
        await updateOrderStatusAction(orderId, newStatus);
        setSuccess(`Status porudžbine je uspešno ažuriran na: ${newStatus}`);
        await loadOrders();
      } catch (err: unknown) {
        alert((err instanceof Error ? err.message : null) || "Ažuriranje statusa nije uspelo.");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Upravljanje porudžbinama</h1>
        <p className="text-slate-500 text-xs mt-1">Pregledajte prispele porudžbine i pratite statuse isporuke i preuzimanja.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> <span>{success}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600 mx-auto" />
            <p className="text-xs text-slate-400 font-bold mt-2">Učitavanje porudžbina...</p>
          </div>
        ) : orders.length === 0 ? (
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
                {orders.map((o) => {
                  const customer = typeof o.customerInfo === "object" && o.customerInfo !== null && !Array.isArray(o.customerInfo) ? o.customerInfo as Record<string, unknown> : {};
                  const isStorePickup = customer.shippingMethod === "store_pickup";
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-black text-slate-900 font-mono">{o.orderNumber}</td>
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
                      <td className="py-4 px-4 font-black text-cyan-700">{formatPrice(o.total)}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 font-bold rounded-full text-[10px] ${
                          o.status === "delivered" ? "bg-emerald-50 text-emerald-700" :
                          o.status === "shipped" ? "bg-cyan-50 text-cyan-700" :
                          o.status === "processing" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-[11px]">
                        {new Date(o.createdAt).toLocaleDateString("sr-RS")} {new Date(o.createdAt).toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          disabled={isPending}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500"
                        >
                          <option value="pending">Na čekanju (Pending)</option>
                          <option value="processing">U obradi (Processing)</option>
                          <option value="shipped">Poslato (Shipped)</option>
                          <option value="delivered">Isporučeno (Delivered)</option>
                          <option value="ready_for_pickup">Spremno za preuzimanje</option>
                          <option value="picked_up">Preuzeto u radnji</option>
                          <option value="cancelled">Otkazano (Cancelled)</option>
                        </select>
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
