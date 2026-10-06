import { Users, ShieldCheck, Warehouse, UserRound, CheckCircle2, XCircle } from "lucide-react";
import { getAdminUsers, createAdminUser, updateAdminUser } from "@/actions/admin-user-actions";

export const dynamic = "force-dynamic";

const roleLabels: Record<string,string> = {
  admin: "Administrator",
  warehouse: "Magacioner",
  editor: "Urednik",
};

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Korisnici i pristup</h1>
        <p className="mt-1 text-sm text-slate-500">Dodajte zaposlene i odredite šta mogu da koriste u Aqua Still sistemu.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Administrator","Potpun pristup",ShieldCheck],
          ["Magacioner","Magacin i rad sa zalihom",Warehouse],
          ["Urednik","Sadržaj i proizvodi",UserRound],
        ].map(([title,desc,Icon]) => (
          <div key={title as string} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Icon className="h-5 w-5 text-cyan-600" />
            <h2 className="mt-3 font-black">{title as string}</h2>
            <p className="mt-1 text-xs text-slate-500">{desc as string}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-black">Dodaj korisnika</h2>
        <form action={createAdminUser} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input name="name" placeholder="Ime i prezime" required className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
          <input name="email" type="email" placeholder="E-mail" required className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
          <input name="password" type="password" minLength={8} placeholder="Početna lozinka" required className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
          <select name="role" defaultValue="warehouse" className="h-11 rounded-xl border border-slate-200 px-3 text-sm">
            <option value="warehouse">Magacioner</option>
            <option value="editor">Urednik</option>
            <option value="admin">Administrator</option>
          </select>
          <button className="h-11 rounded-xl bg-cyan-600 px-4 text-sm font-black text-white hover:bg-cyan-700 sm:col-span-2 lg:col-span-4">Kreiraj korisnika</button>
        </form>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <h2 className="text-lg font-black">Postojeći korisnici</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {users.map((user) => (
            <form key={user.id} action={updateAdminUser.bind(null,user.id)} className="grid gap-3 p-4 sm:grid-cols-[1.2fr_1.4fr_1fr_1fr_auto] sm:items-center sm:p-5">
              <input name="name" defaultValue={user.name ?? ""} className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold" />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{user.email}</div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                  {user.isActive ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600"/> : <XCircle className="h-3.5 w-3.5 text-red-500"/>}
                  {user.isActive ? "Aktivan" : "Deaktiviran"}
                </div>
              </div>
              <select name="role" defaultValue={user.role} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">
                {Object.entries(roleLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <input name="password" type="password" placeholder="Nova lozinka (opciono)" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <input name="isActive" type="checkbox" defaultChecked={user.isActive} /> Aktivan
                </label>
                <button className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white">Sačuvaj</button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
