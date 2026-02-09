/**
 * Search utility functions to optimize search performance
 */

// Simple LRU cache implementation for search
class SearchLRUCache<T> {
  private capacity: number;
  private cache: Map<string, { data: T; timestamp: number }>;
  private ttl: number; // Time to live in milliseconds

  constructor(capacity: number = 100, ttl: number = 60 * 60 * 1000) {
    this.capacity = capacity;
    this.cache = new Map();
    this.ttl = ttl;
  }

  // Get an item from cache
  get(key: string): T | undefined {
    if (!this.cache.has(key)) return undefined;

    const item = this.cache.get(key);
    if (!item) return undefined;

    // Check if the item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to the end to mark as recently used
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.data;
  }

  // Add an item to cache
  set(key: string, value: T): void {
    // If key exists, delete it first
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // If at capacity, remove the oldest item
    else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    // Add new item
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  // Clear all expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Clear the entire cache
  clear(): void {
    this.cache.clear();
  }
}

// Create a normalized search term from a raw query
export function normalizeSearchTerm(term: string): string {
  return term
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

// Export the cache for use in API routes
export const medicineSearchCache = new SearchLRUCache<Medicine[]>(200);
export const productSearchCache = new SearchLRUCache<Product[]>(200);

// Define interfaces for the cached data types
export interface Medicine {
  id: string;
  name: string;
  // Add other medicine properties as needed
}

export interface Product {
  id: string;
  name: string;
  // Add other product properties as needed
}

// Start cache cleanup interval
if (typeof window === 'undefined') {
  // Only run on server
  setInterval(
    () => {
      medicineSearchCache.cleanup();
      productSearchCache.cleanup();
    },
    15 * 60 * 1000
  ); // Clean up every 15 minutes
}
