import ProductCard from './ProductCard';

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  packaging?: string;
  rating?: number;
  reviews?: number;
  imageUrl?: string;
  category?: string;
  description?: string;
};

type ProductCardWrapperProps = {
  product: Product;
  favorites: Set<number | string>;
  toggleFavorite: (item: { id: string; name: string; image: string; category: string }) => void;
  handleAddToCart: (productId: string) => void;
  addingProductId: number | string | null;
};

export default function ProductCardWrapper({
  product,
  favorites,
  toggleFavorite,
  handleAddToCart,
  addingProductId,
}: ProductCardWrapperProps) {
  return (
    <ProductCard
      product={{
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount ?? 20,
        stock: product.stock,
        packaging: product.packaging,
        rating: product.rating ?? 4.5,
        reviews: product.reviews ?? 100,
        imageUrl: product.imageUrl ?? '/product-placeholder.jpg',
        category: product.category ?? 'Product',
        subtitle: product.description,
      }}
      isFavorite={favorites.has(product.id)}
      onToggleFavorite={() =>
        toggleFavorite({
          id: product.id,
          name: product.name,
          image: product.imageUrl ?? '/product-placeholder.jpg',
          category: product.category ?? 'Product',
        })
      }
      onAddToCart={() => handleAddToCart(product.id)}
      isAdding={addingProductId === product.id}
    />
  );
}
