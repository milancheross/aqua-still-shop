"use client";

import React from "react";

export default function ProductStatusSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      name="status"
      defaultValue={defaultValue}
      onChange={(e) => e.target.form?.submit()}
      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none"
    >
      <option value="all">Svi statusi zaliha</option>
      <option value="in_stock">Na stanju</option>
      <option value="out_of_stock">Rasprodato</option>
    </select>
  );
}
