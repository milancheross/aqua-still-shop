import Link from "next/link";
import { getHomePageForAdmin, getPageById, getPages } from "@/actions/page-cms-actions";
import HomePageEditor from "@/components/admin/HomePageEditor";
import PageEditor from "@/components/admin/PageEditor";
import { DEFAULT_HOME, HOME_SLUG, parseHomeContent } from "@/lib/home-content";

export default async function AdminEditorPage({ searchParams }: { searchParams: Promise<{ id?: string; new?: string; home?: string }> }) {
  const params = await searchParams;
  const pages = await getPages();
  const options = pages
    .filter((item) => item.slug !== HOME_SLUG)
    .map((item) => ({ id: item.id, title: item.title, slug: item.slug }));

  if (params.new === "1") {
    return <PageEditor key="new" page={null} pages={options} />;
  }

  if (params.id && params.home !== "1") {
    const page = await getPageById(params.id);
    if (!page) {
      return (
        <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
          <h1 className="text-xl font-black text-slate-900">Stranica nije pronađena</h1>
          <p className="text-sm text-slate-500">Tražena stranica više ne postoji. Izaberite drugu sa liste stranica.</p>
          <Link href="/admin/pages" className="inline-flex text-sm font-bold text-cyan-700 hover:underline">Nazad na stranice</Link>
        </div>
      );
    }
    if (page.slug !== HOME_SLUG) {
      return <PageEditor key={page.id} page={page} pages={options} />;
    }
  }

  const home = await getHomePageForAdmin();
  return (
    <HomePageEditor
      key={home ? "saved-home" : "default-home"}
      content={home ? parseHomeContent(home.content) : DEFAULT_HOME}
      isPublished={home?.isPublished ?? true}
      pages={options}
    />
  );
}
