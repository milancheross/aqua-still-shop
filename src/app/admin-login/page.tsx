import React from "react";
import { loginAdminAction } from "@/actions/admin-auth-actions";

interface AdminLoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-600 text-xl font-black text-white">A</div>
          <h1 className="text-2xl font-black text-slate-900">Aqua Still CMS</h1>
          <p className="mt-2 text-sm text-slate-500">Prijavite se u administraciju</p>
        </div>

        {error === "credentials" && (
          <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
            E-mail ili lozinka nisu ispravni.
          </p>
        )}
        {error === "rate-limit" && (
          <p role="alert" className="mb-5 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800">
            Previše neuspešnih pokušaja. Sačekajte 15 minuta pre ponovnog pokušaja.
          </p>
        )}
        {error === "configuration" && (
          <p role="alert" className="mb-5 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800">
            Administracija nije podešena. Proverite serverske promenljive okruženja.
          </p>
        )}

        <form action={loginAdminAction} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="username" required className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-700">Lozinka</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" />
          </div>
          <button type="submit" className="w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-cyan-700">
            Prijavi se
          </button>
        </form>
      </div>
    </main>
  );
}
