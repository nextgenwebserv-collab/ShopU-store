'use client';

import ProductCard from '../components/ProductCard';
import { useWishlist } from '../hooks/useWishlist';
import useAddToCart from '../hooks/handleAddToCart';

interface Product {
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
}

interface ProductGridClientProps {
  products: Product[];
  isMobile?: boolean;
}

export default function ProductGridClient({ products, isMobile = false }: ProductGridClientProps) {
  const { favorites, toggleFavorite } = useWishlist();
  const { handleAddToCart, addingProductId } = useAddToCart();

  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {products.slice(0, 20).map(product => (
          <div key={product.id} className="w-full">
            <ProductCard
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                discount: product.discount || 20,
                stock: product.stock,
                packaging: product.packaging,
                rating: product.rating || 4.5,
                reviews: product.reviews || 100,
                imageUrl: product.imageUrl || '/product-placeholder.jpg',
                category: product.category || 'Product',
                subtitle: product.description,
              }}
              isFavorite={favorites.has(product.id)}
              onToggleFavorite={() =>
                toggleFavorite({
                  id: product.id,
                  name: product.name,
                  image: product.imageUrl || '/product-placeholder.jpg',
                  category: product.category || 'Product',
                })
              }
              onAddToCart={() => handleAddToCart(product.id)}
              isAdding={addingProductId === product.id}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.slice(0, 20).map(product => (
        <div key={product.id} className="max-w-[210px] min-w-[210px]">
          <ProductCard
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              discount: product.discount || 20,
              stock: product.stock,
              packaging: product.packaging,
              rating: product.rating || 4.5,
              reviews: product.reviews || 100,
              imageUrl: product.imageUrl || '/product-placeholder.jpg',
              category: product.category || 'Product',
              subtitle: product.description,
            }}
            isFavorite={favorites.has(product.id)}
            onToggleFavorite={() =>
              toggleFavorite({
                id: product.id,
                name: product.name,
                image: product.imageUrl || '/product-placeholder.jpg',
                category: product.category || 'Product',
              })
            }
            onAddToCart={() => handleAddToCart(product.id)}
            isAdding={addingProductId === product.id}
          />
        </div>
      ))}
    </div>
  );
}
