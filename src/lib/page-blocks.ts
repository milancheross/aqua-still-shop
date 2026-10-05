export interface CanvasBlock {
  id: string;
  type: "heading" | "text" | "image" | "button" | "container" | "spacer";
  props: {
    content?: string;
    level?: "h1" | "h2" | "h3";
    url?: string;
    alt?: string;
    height?: string;
    align?: "left" | "center" | "right";
    variant?: "primary" | "secondary";
  };
  styles: {
    background?: string;
    color?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    fontSize?: string;
  };
}

const BLOCK_TYPES = ["heading", "text", "image", "button", "container", "spacer"];

export function normalizeBlocks(value: unknown): CanvasBlock[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const block = entry as Record<string, unknown>;
    if (typeof block.id !== "string" || !BLOCK_TYPES.includes(String(block.type))) return [];
    const props = block.props && typeof block.props === "object" && !Array.isArray(block.props) ? block.props : {};
    const styles = block.styles && typeof block.styles === "object" && !Array.isArray(block.styles) ? block.styles : {};
    return [{
      id: block.id,
      type: block.type as CanvasBlock["type"],
      props: props as CanvasBlock["props"],
      styles: styles as CanvasBlock["styles"],
    }];
  });
}

export const NEW_PAGE_BLOCKS: CanvasBlock[] = [
  {
    id: "block-1",
    type: "heading",
    props: { content: "Dobrodošli na novu stranicu", level: "h1", align: "center" },
    styles: { color: "#0f172a", padding: "py-8" },
  },
  {
    id: "block-2",
    type: "text",
    props: { content: "Ovo je vizuelno uređena sekcija kreirana pomoću Aqua Still CMS Editora.", align: "center" },
    styles: { color: "#475569", padding: "pb-6", fontSize: "text-base" },
  },
];

export function slugifyTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
