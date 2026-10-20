import type { Metadata } from "next";
import CatalogPage, { generateMetadata as baseGenerateMetadata } from "../page";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const { category } = await props.params;
  const searchParams = await props.searchParams;

  return baseGenerateMetadata({
    searchParams: Promise.resolve({
      ...searchParams,
      category,
    }),
  });
}

export default async function CategoryCatalogPage(props: CategoryPageProps) {
  const { category } = await props.params;
  const searchParams = await props.searchParams;

  return (
    <CatalogPage
      searchParams={Promise.resolve({
        ...searchParams,
        category,
      })}
    />
  );
}

