import Link from "next/link";
export default function IntegracijePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-slate-900">Integracije</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold">POS</h2>
        <p className="mt-1 text-sm text-slate-500">Припремљен је универзални CSV импорт. Конкретан API/конектор додајемо након што утврдимо који програм клијент користи.</p>
        <Link href="/admin/integracije/pos" className="mt-4 inline-flex rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white">Отвори POS интеграцију</Link>
      </div>
    </div>
  );
}
