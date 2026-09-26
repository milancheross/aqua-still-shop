import React from "react";
import CatalogPage from "../page";

interface CategoryCatalogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ categorySlug: string }>;
}

export default async function CategoryCatalogPage({ searchParams, params }: CategoryCatalogPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Inject category slug into searchParams
  const mergedSearchParams = Promise.resolve({
    ...resolvedSearchParams,
    category: resolvedParams.categorySlug,
  });

  return <CatalogPage searchParams={mergedSearchParams} />;
}
