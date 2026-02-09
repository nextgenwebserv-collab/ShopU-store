'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface SubCategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

const Sidebar = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlug = searchParams.get('category');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/products/category');
        const data: Category[] = await res.json();

        if (categorySlug) {
          const matchedCategory = data.find(cat => cat.name === categorySlug);
          if (matchedCategory) {
            setCategories([matchedCategory]);
            setOpenCategory(matchedCategory.id);
          } else {
            setCategories(data);
          }
        } else {
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };

    fetchCategories();
  }, [categorySlug]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategory(prev => (prev === categoryId ? null : categoryId));
  };

  const handleSubClick = (subName: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('category', subName);
    params.delete('minPrice');
    params.delete('maxPrice');
    router.push(`?${params.toString()}`);
  };

  const handlePriceFilter = (newMinPrice: number, newMaxPrice: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('minPrice', newMinPrice.toString());
    params.set('maxPrice', newMaxPrice.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 sm:block">
        {/* Price Filter */}
        <div>
          <h3 className="text-primaryColor mb-2 text-xl font-semibold">Filter By Price</h3>
          <hr className="mb-4 border text-gray-300" />
          <div className="mb-4 flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Min"
              className="h-8 w-1/2 rounded bg-gray-100 px-4 py-1 text-sm text-gray-700 outline-none"
              value={minPrice}
              onChange={e => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  const num = Number(val);
                  setMinPrice(num);
                }
              }}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Max"
              className="h-8 w-1/2 rounded bg-gray-100 px-4 py-1 text-sm text-gray-700 outline-none"
              value={maxPrice}
              onChange={e => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  const num = Number(val);
                  setMaxPrice(num);
                  handlePriceFilter(minPrice, num);
                }
              }}
            />
          </div>
        </div>

        <h3 className="text-primaryColor mb-2 text-xl font-semibold">Categories</h3>
        <hr className="mb-4 border text-gray-300" />
        <ul className="space-y-3">
          {categories.map(category => (
            <li key={category.id}>
              <div
                className="text-md flex cursor-pointer items-center justify-between px-4 font-medium text-gray-800"
                onClick={() => toggleCategory(category.id)}
              >
                {category.name}
                <span className="text-2xl">{openCategory === category.id ? '-' : '+'}</span>
              </div>
              {openCategory === category.id && category.subCategories.length > 0 && (
                <ul className="mt-1 ml-4 space-y-1 px-3">
                  {category.subCategories.map(sub => (
                    <li
                      key={sub.id}
                      onClick={() => handleSubClick(sub.name)}
                      className="cursor-pointer text-sm text-gray-600 hover:text-teal-600"
                    >
                      {sub.name}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
