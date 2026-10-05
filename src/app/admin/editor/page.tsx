import Link from "next/link";
import { getPageById, getPages } from "@/actions/page-cms-actions";
import PageEditor from "@/components/admin/PageEditor";

export default async function AdminEditorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const pages = await getPages();
  const options = pages.map((item) => ({ id: item.id, title: item.title, slug: item.slug }));

  if (!id) {
    return <PageEditor key="new" page={null} pages={options} />;
  }

  const page = await getPageById(id);
  if (!page) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
        <h1 className="text-xl font-black text-slate-900">Stranica nije pronađena</h1>
        <p className="text-sm text-slate-500">Tražena stranica više ne postoji. Izaberite drugu sa liste stranica.</p>
        <Link href="/admin/pages" className="inline-flex text-sm font-bold text-cyan-700 hover:underline">Nazad na stranice</Link>
      </div>
    );
  }

  return <PageEditor key={page.id} page={page} pages={options} />;
}
