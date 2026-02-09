export type ProductType = {
  _id: string;
  image: string;
  title: string;
  price: number;
  mrp: number;
  discount: number;
  quantitiy: string;
  brand: string;
  skinType: string;
};

export interface Product {
  packaging: string | undefined;
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  imageUrl: string;
  category: string;
  subtitle?: string;
  stock: number;
  description?: string;

  // optional richer fields for detail page
  productImages?: { id: string; url: string }[];
  productHighlights?: string;
  directionsForUse?: string;
  safetyInformation?: string;
}
