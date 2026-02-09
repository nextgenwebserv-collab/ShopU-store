export interface SearchItem {
  products: any;
  id: string;
  name: string;
  price?: number;
  imageUrl?: string;
  originalPrice?: number;
  discount?: number;
  packaging?: string;
  type: 'medicine' | 'product';
}
