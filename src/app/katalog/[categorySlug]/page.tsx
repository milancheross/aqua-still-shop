import React from "react";
import type { Metadata } from "next";
import CatalogPage, { generateMetadata as baseGenerateMetadata } from "../page";

interface CategoryCatalogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ searchParams, params }: CategoryCatalogPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return baseGenerateMetadata({
    searchParams: Promise.resolve({
      ...resolvedSearchParams,
      category: resolvedParams.categorySlug,
    }),
  });
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
