"use client";

import React, { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deletePage } from "@/actions/page-cms-actions";

export default function DeletePageButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Da li ste sigurni da želite da obrišete stranicu "${title}"?`)) {
      startTransition(async () => {
        try {
          await deletePage(id);
        } catch (e: unknown) {
          alert(e instanceof Error ? e.message : "Brisanje stranice nije uspelo.");
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

