"use client";

import React, { useTransition } from "react";
import { Copy, Loader2 } from "lucide-react";
import { duplicateAdminProduct } from "@/actions/product-admin-actions";

export default function DuplicateProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDuplicate = () => {
    startTransition(async () => {
      try {
        await duplicateAdminProduct(id);
      } catch (e: any) {
        alert(e.message || "Dupliranje nije uspelo.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDuplicate}
      disabled={isPending}
      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50"
      title="Dupliraj"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
