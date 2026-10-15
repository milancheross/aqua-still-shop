export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 48;

export type CatalogSort = "newest" | "popular" | "price-asc" | "price-desc" | "name";

export function parseCatalogPage(value: string | undefined) {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) return 1;
  return Math.min(page, 10_000);
}

export function parseCatalogTake(value: string | undefined) {
  if (!value) return DEFAULT_PAGE_SIZE;
  const take = Number(value);
  if (!Number.isInteger(take) || take < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(take, MAX_PAGE_SIZE);
}

export function catalogTotalPages(total: number, take: number) {
  if (total <= 0) return 1;
  return Math.ceil(total / take);
}

export function clampCatalogPage(page: number, total: number, take: number) {
  return Math.min(Math.max(page, 1), catalogTotalPages(total, take));
}

export function catalogOrderBy(sort: CatalogSort = "newest") {
  const id = { id: "asc" as const };
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" as const }, id];
    case "price-desc":
      return [{ price: "desc" as const }, id];
    case "name":
      return [{ name: "asc" as const }, id];
    case "popular":
      return [{ isFeatured: "desc" as const }, id];
    case "newest":
    default:
      return [{ createdAt: "desc" as const }, { id: "desc" as const }];
  }
}

export function buildCatalogQuery(input: {
  current: Record<string, string>;
  changes?: Record<string, string | null | undefined>;
  resetPage?: boolean;
}) {
  const next = { ...input.current };
  for (const [key, value] of Object.entries(input.changes ?? {})) {
    if (value === null || value === undefined || value === "") delete next[key];
    else next[key] = value;
  }
  if (input.resetPage) delete next.page;
  if (!next.take || next.take === String(DEFAULT_PAGE_SIZE)) delete next.take;
  if (!next.page || next.page === "1") delete next.page;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) query.set(key, value);
  const qs = query.toString();
  return qs ? `/katalog?${qs}` : "/katalog";
}

export function catalogCanonicalPath(input: {
  current: Record<string, string>;
  page: number;
}) {
  const current = { ...input.current };
  delete current.take;
  if (input.page <= 1) delete current.page;
  else current.page = String(input.page);
  return buildCatalogQuery({ current });
}
