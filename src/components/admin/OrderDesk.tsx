"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addOrderNoteAction, setOrderPaidAction } from "@/actions/admin-cms-actions";

export interface PrivateNote {
  id: string;
  message: string;
  createdAt: string;
}

export default function OrderDesk({
  orderId,
  paid,
  notes,
}: {
  orderId: string;
  paid: boolean;
  notes: PrivateNote[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<unknown>) => {
    startTransition(async () => {
      try {
        await action();
        setMessage("");
        router.refresh();
      } catch (error: unknown) {
        alert(error instanceof Error ? error.message : "Radnja nije uspela.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">
        <span>Plaćeno</span>
        <input
          type="checkbox"
          checked={paid}
          disabled={isPending}
          onChange={(event) => run(() => setOrderPaidAction(orderId, event.target.checked))}
          className="h-4 w-4 rounded text-cyan-600"
        />
      </label>
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wide text-slate-400">Interne beleške</h3>
        {notes.length === 0 ? (
          <p className="text-sm text-slate-500">Nema internih beleški. Kupac ih ne vidi.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note.id} className="rounded-2xl bg-amber-50 px-3 py-2 text-sm text-slate-800">
                <p className="whitespace-pre-line">{note.message}</p>
                <p className="mt-1 text-[10px] font-bold text-slate-400">
                  {new Date(note.createdAt).toLocaleString("sr-RS")}
                </p>
              </li>
            ))}
          </ul>
        )}
        <textarea
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Beleška za radnju, kupac je ne vidi..."
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />
        <button
          type="button"
          disabled={isPending || message.trim().length < 2}
          onClick={() => run(() => addOrderNoteAction(orderId, message))}
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white disabled:bg-slate-300"
        >
          Dodaj belešku
        </button>
      </div>
    </div>
  );
}
