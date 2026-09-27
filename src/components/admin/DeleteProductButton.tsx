"use client";

import React, { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteAdminProduct } from "@/actions/product-admin-actions";

export default function DeleteProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Da li ste sigurni da želite da obrišete ovaj proizvod?")) {
      startTransition(async () => {
        try {
          await deleteAdminProduct(id);
        } catch (e: any) {
          alert(e.message || "Brisanje nije uspelo.");
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
      title="Obriši"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
