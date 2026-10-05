"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/actions/admin-cms-actions";
import { statusOptionsFor } from "@/lib/order-present";

export default function OrderStatusSelect({
  orderId,
  status,
  shippingMethod,
}: {
  orderId: string;
  status: string;
  shippingMethod?: unknown;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const options = statusOptionsFor(shippingMethod);
  const known = options.some(([value]) => value === status);
  const choices = known ? options : [[status, status], ...options];

  return (
    <select
      value={status}
      disabled={isPending}
      aria-label="Status porudžbine"
      onChange={(event) => {
        const next = event.target.value;
        startTransition(async () => {
          try {
            await updateOrderStatusAction(orderId, next);
            router.refresh();
          } catch (error: unknown) {
            alert((error instanceof Error ? error.message : null) || "Ažuriranje statusa nije uspelo.");
          }
        });
      }}
      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-cyan-500"
    >
      {choices.map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
}
