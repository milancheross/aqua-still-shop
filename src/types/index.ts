export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  itemCount: number;
  iconName: "wrench" | "droplet" | "bath" | "sprout" | "layers";
  subcategories: {
    id: string;
    name: string;
    slug: string;
    itemCount: number;
    imageUrl?: string;
  }[];
  attributes: {
    key: string;
    label: string;
    type: "select" | "range" | "boolean";
    options?: string[];
    unit?: string;
  }[];
}

export interface Product {
  id: string;
  sku: string;
  barcode: string; // EAN-13 bar-kod
  name: string;
  slug: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug?: string;
  subcategoryName?: string;
  price: number; // u RSD
  salePrice?: number; // akcijska cena
  vatRate: number; // obično 20%
  unit: string; // npr. "kom", "m", "pak"
  inStock: boolean;
  stockQuantity: number;
  wmsLocation: string; // npr. "A-03-02-04"
  shortDescription: string;
  description: string;
  images: string[];
  pdfManualUrl?: string;
  attributes: Record<string, string | number | boolean>;
  isFeatured?: boolean;
  isPromo?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  freeShippingThreshold: number;
  total: number;
}

export type ShippingMethod = "courier" | "warehouse_pickup";
export type PaymentMethod = "cash_on_delivery" | "card" | "wire_transfer";

export interface OrderCustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  isCompany: boolean;
  companyName?: string;
  pib?: string;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  notes?: string;
}
