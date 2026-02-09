import { searchEventEmitter } from './SearchCard';
import { useState, useRef, useEffect, useCallback } from 'react';
import { SearchItem } from '../types/SearchItem';
import { usePathname } from 'next/navigation';

type SearchResult = Array<SearchItem>;

export default function Searchbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchCache, setSearchCache] = useState<{ [key: string]: SearchResult }>({});
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const pathname = usePathname();

  const placeholders = [
    'Search Medicines',
    'Search Baby Care Products',
    'Search Healthcare Essentials',
    'Search Groceries',
  ];

  useEffect(() => {
    const interval = setInterval(
      () => setPlaceholderIndex(prev => (prev + 1) % placeholders.length),
      3000
    );
    return () => clearInterval(interval);
  }, []);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        if (query.trim().length >= 3) {
          const key = query.trim().toLowerCase();

          if (searchCache[key]) {
            searchEventEmitter.emit(searchCache[key]);
            return;
          }

          setIsSearching(true);
          try {
            const res = await fetch(
              `/api/products/search?name=${encodeURIComponent(key)}&limit=20`
            );

            const data = await res.json();

            if (data.success) {
              const results: SearchResult = data.data;
              searchEventEmitter.emit(results);

              setSearchCache(prev => ({
                ...prev,
                [key]: results,
              }));
            } else {
              searchEventEmitter.emit([]);
            }
          } catch (err) {
            console.error('Search API error:', err);
            searchEventEmitter.emit([]);
          }
          setIsSearching(false);
        } else {
          searchEventEmitter.emit([]);
        }
      }, 300);
    },
    [searchCache]
  );

  const clearSearch = () => {
    setSearchQuery('');
    searchEventEmitter.emit([]);
  };

  useEffect(() => {
    setSearchQuery('');
    searchEventEmitter.emit([]);
  }, [pathname]);

  return (
    <>
      {/*Desktop view*/}
      <div className="relative mx-4 hidden max-w-lg flex-1 md:flex">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            placeholder={placeholders[placeholderIndex]}
            className="w-full rounded-lg bg-gray-100 px-4 py-2 pl-10 focus:outline-none"
          />

          {/* searching spinner */}
          {isSearching && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
              <div className="border-primaryColor h-5 w-5 animate-spin rounded-full border-b-2"></div>
            </div>
          )}

          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute top-1/2 right-4 -translate-y-1/2 transform text-gray-600 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/*Mobile view*/}
      <div className="relative max-w-lg flex-1 px-4 py-0.5 md:hidden">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            placeholder={placeholders[placeholderIndex]}
            className="w-full rounded-full bg-gray-100 px-6 py-3 focus:outline-none"
          />

          {/* searching spinner */}
          {isSearching && (
            <div className="absolute top-1/2 right-4 -translate-y-1/2 transform">
              <div className="border-primaryColor h-5 w-5 animate-spin rounded-full border-b-2"></div>
            </div>
          )}

          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute top-1/2 right-5 -translate-y-1/2 transform text-gray-600 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </>
  );
}
