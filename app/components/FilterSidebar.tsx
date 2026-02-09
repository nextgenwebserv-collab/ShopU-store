'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface SubCategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

type SidebarProps = {
  onCategorySelect: (subCategoryId: string) => void;
  onPriceFilter: (min: number, max: number) => void;
  isOpen?: boolean; // whether sidebar is visible on mobile
  onClose?: () => void;
};

const Sidebar = ({ onCategorySelect, onPriceFilter, isOpen = true, onClose }: SidebarProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);

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
            setCategories([]);
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
    setSelectedSubs(prev =>
      prev.includes(subName) ? prev.filter(s => s !== subName) : [...prev, subName]
    );
    onCategorySelect(subName);
  };

  return (
    <>
      {/* Desktop view */}
      <aside className="hidden h-full w-auto rounded bg-white p-4 shadow-sm sm:block lg:w-64">
        <div className="mb-4">
          <div className="mb-4 flex items-center justify-center gap-8">
            <div className="flex w-18 flex-col">
              <label className="mb-2 text-sm text-gray-800">Minimum</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Min"
                className="text-md h-8 rounded bg-gray-100 px-4 py-1 text-gray-700 outline-none"
                value={minPrice}
                onChange={e => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    const num = Number(val);
                    setMinPrice(num);
                    onPriceFilter(num, maxPrice);
                  }
                }}
              />
            </div>
            <div className="flex w-18 flex-col">
              <label className="mb-2 text-sm text-gray-800">Maximum</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Max"
                className="h-8 rounded bg-gray-100 px-4 py-1 text-sm text-gray-700 outline-none"
                value={maxPrice}
                onChange={e => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    const num = Number(val);
                    setMaxPrice(num);
                    onPriceFilter(minPrice, num);
                  }
                }}
              />
            </div>
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
                      onClick={() => onCategorySelect(sub.name)}
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
        {/* Brand Filter */}
        <div className="mt-6">
          <h3 className="text-primaryColor mb-2 text-xl font-semibold">Filter By</h3>
          <hr className="mb-4 border text-gray-300" />

          {/* Brand Section */}
          <div>
            <div
              className="flex cursor-pointer items-center justify-between font-medium text-gray-800"
              onClick={() => toggleCategory('Brand')}
            >
              Brand
              <span className="text-2xl">{openCategory === 'Brand' ? '-' : '+'}</span>
            </div>

            {openCategory === 'Brand' && (
              <ul className="mt-2 ml-2 space-y-2">
                {[
                  'Mamy Poko Pants Diaper',
                  'Pampers Baby Diaper',
                  'Huggies Dry Diapers',
                  'Friends Adult Diapers',
                ].map((brand, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <input type="checkbox" id={`brand-${idx}`} className="accent-teal-600" />
                    <label
                      htmlFor={`brand-${idx}`}
                      className="cursor-pointer text-sm text-gray-700"
                    >
                      {brand}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Placeholder for other filter sections */}
          {['Maternity Care', 'Motherhood Stages', 'Age Group'].map((section, idx) => (
            <div
              key={idx}
              className="mt-4 flex cursor-pointer items-center justify-between font-medium text-gray-800"
              onClick={() => toggleCategory(section)}
            >
              {section}
              <span className="text-2xl">{openCategory === section ? '-' : '+'}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile view */}
      <div className="sm:hidden">
        {isOpen && (
          <div
            onClick={onClose}
            className="bg-opacity-30 fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          />
        )}

        {/* Sidebar drawer */}
        <aside
          className={`fixed top-0 left-0 z-50 h-full w-84 transform bg-white shadow-sm transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} sm:static sm:h-auto sm:w-auto sm:translate-x-0`}
        >
          <div className="mb-4 flex items-center gap-2 border-b border-gray-300 p-3">
            <button
              onClick={onClose}
              className="text-primaryColor p-2 leading-none font-bold"
              aria-label="Close filter sidebar"
            >
              <ArrowLeft size={28} />
            </button>
            <h2 className="text-primaryColor text-2xl font-semibold">Filter</h2>
          </div>

          <div className="p-2">
            <div className="mb-4 flex items-center gap-8 pl-4">
              <div className="flex w-20 flex-col">
                <label className="text-md mb-2 text-gray-800">Minimum</label>
                <input
                  type="text"
                  inputMode="numeric" // shows numeric keyboard on mobile
                  placeholder="Min"
                  className="h-10 rounded bg-gray-100 px-4 py-1 text-lg text-gray-700 outline-none"
                  value={minPrice}
                  onChange={e => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      const num = Number(val);
                      setMinPrice(num);
                      onPriceFilter(num, maxPrice);
                    }
                  }}
                />
              </div>
              <div className="flex w-20 flex-col">
                <label className="text-md mb-2 text-gray-800">Maximum</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Max"
                  className="h-10 rounded bg-gray-100 px-4 py-1 text-lg text-gray-700 outline-none"
                  value={maxPrice}
                  onChange={e => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      const num = Number(val);
                      setMaxPrice(num);
                      onPriceFilter(minPrice, num);
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="px-6">
            <h3 className="text-primaryColor mb-2 text-xl font-semibold">Categories</h3>
            <hr className="mb-4 border text-gray-300" />
            <ul className="space-y-3">
              {categories.map(category => (
                <li key={category.id}>
                  <div
                    className="text-md flex cursor-pointer items-center justify-between px-4 text-lg font-medium text-gray-800"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                    <span className="text-3xl">{openCategory === category.id ? '-' : '+'}</span>
                  </div>

                  {openCategory === category.id && category.subCategories.length > 0 && (
                    <ul className="mt-1 ml-4 space-y-1 px-3">
                      {category.subCategories.map(sub => (
                        <li
                          key={sub.id}
                          onClick={() => handleSubClick(sub.name)}
                          className="px-2 py-1"
                        >
                          <span
                            className={`rounded-full border border-teal-400 px-3 py-1 text-lg ${
                              selectedSubs.includes(sub.name)
                                ? 'bg-primaryColor border-none text-white'
                                : 'text-gray-600'
                            }`}
                          >
                            {sub.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
