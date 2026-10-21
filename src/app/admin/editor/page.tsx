import Link from "next/link";
import {
  getHomePageForAdmin,
  getPageForEditor,
  getEditorPageOptions,
} from "@/actions/page-cms-actions";
import HomePageEditor from "@/components/admin/HomePageEditor";
import PageEditor from "@/components/admin/PageEditor";
import { DEFAULT_HOME, HOME_SLUG, parseHomeContent } from "@/lib/home-content";

export default async function AdminEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; new?: string; home?: string; slug?: string }>;
}) {
  const params = await searchParams;
  const options = await getEditorPageOptions();

  if (params.new === "1") {
    return <PageEditor key="new" initialPageData={null} pages={options} />;
  }

  // Ako je zatražena konkretna stranica (preko slug-a ili id-ja) i nije početna
  const targetKey = params.id || params.slug;
  if (
    targetKey &&
    targetKey !== HOME_SLUG &&
    targetKey !== "pocetna" &&
    targetKey !== "home" &&
    params.home !== "1"
  ) {
    const pageData = await getPageForEditor(targetKey);
    if (!pageData) {
      return (
        <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
          <h1 className="text-xl font-black text-slate-900">Stranica nije pronađena</h1>
          <p className="text-sm text-slate-500">
            Tražena stranica ne postoji. Izaberite neku od ponuđenih stranica iz menija.
          </p>
          <Link
            href="/admin/editor?home=1"
            className="inline-flex text-sm font-bold text-cyan-700 hover:underline"
          >
            Nazad na početnu stranicu
          </Link>
        </div>
      );
    }
    return (
      <PageEditor
        key={pageData.slug || pageData.id}
        initialPageData={pageData}
        pages={options}
      />
    );
  }

  // Podrazumevani prikaz: Uređivanje početne stranice i hero banera
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
