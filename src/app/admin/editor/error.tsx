"use client";

export default function EditorError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-red-200 bg-white p-8">
      <h1 className="text-xl font-black text-slate-900">Vizuelni editor nije učitan</h1>
      <p className="text-sm text-slate-600">{error.message || "Serverska greška. Osvežite stranicu."}</p>
      <button onClick={reset} className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white">Pokušaj ponovo</button>
    </div>
  );
}
