'use client';

import Image from 'next/image';
import { useProducts } from '../hooks/useProduct';
import useAddToCart from '../hooks/handleAddToCart';

const RightSideDealCard = () => {
  const { handleAddToCart, addingProductId } = useAddToCart();
  const { products, loading, error } = useProducts({
    limit: 1,
  });

  if (loading) {
    return <div className="hidden w-64 animate-pulse rounded-xl bg-gray-200 p-6 lg:flex"></div>;
  }

  if (error || products.length === 0)
    return (
      <div className="flex hidden w-64 animate-pulse items-center justify-center rounded-xl bg-gray-200 p-6 lg:flex">
        <p className="text-center">No Special offer products available.</p>
      </div>
    );

  const product = products[0];

  return (
    <div className="relative hidden w-64 flex-col items-center space-y-3 rounded-xl bg-gray-100 px-6 py-4 text-center shadow lg:flex">
      {/* Top Badge */}
      <div className="text-secondaryColor absolute top-3 left-4 text-xl font-semibold">
        Special Deal
      </div>

      {/* Discount Badge */}
      <div className="bg-background2 absolute top-0 right-0 rounded-tr-xl rounded-bl-2xl px-3 py-1 text-sm font-bold text-white">
        {product.discount}% <br /> OFF
      </div>

      {/* Product Image */}
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={144}
        height={144}
        className="mt-10 object-contain"
      />

      {/* Product Name */}
      <p className="line-clamp-2 text-left text-sm font-medium text-gray-800">{product.name}</p>

      {/* Price + Add */}
      <div className="flex w-full items-center justify-between border-t border-gray-200 px-2 pt-1">
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-primaryColor text-lg font-bold">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        <button
          onClick={() => handleAddToCart(product.id.toString())}
          disabled={addingProductId === product.id}
          className="bg-background1 mt-1 flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-sm text-white"
        >
          {addingProductId === product.id ? (
            <span>Adding...</span>
          ) : (
            <span className="px-3">ADD</span>
          )}
        </button>
      </div>

      {/* Countdown (static for now) */}
      <div className="w-full px-2 text-left">
        <p className="pt-2 text-xs font-medium text-gray-700">Hurry Up! Offer ends in:</p>
        <div className="mt-1 flex justify-center gap-2 rounded bg-gray-100 p-2 text-sm font-semibold text-gray-800">
          <TimeBox label="Hours" value="00" />
          <span>:</span>
          <TimeBox label="Mins" value="00" />
          <span>:</span>
          <TimeBox label="Secs" value="00" />
        </div>
      </div>
    </div>
  );
};

const TimeBox = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div>{value}</div>
    <div className="text-xs font-normal">{label}</div>
  </div>
);

export default RightSideDealCard;
