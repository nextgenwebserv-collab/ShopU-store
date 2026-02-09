'use client';

import { useState, useEffect } from 'react';

interface Medicine {
  stock: number;
  imageUrl: string;
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  subtitle?: string;
  manufacturerName?: string;
  packSizeLabel?: string;
  type?: string;
  category?: string;
}

interface UseMedicinesOptions {
  type?: string;
  limit?: number;
}

export function useMedicines(options: UseMedicinesOptions = {}) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (options.type) queryParams.append('type', options.type);
        if (options.limit) queryParams.append('limit', options.limit.toString());

        const response = await fetch(`/api/get-medicine?${queryParams.toString()}`);

        if (!response.ok) throw new Error('Failed to fetch medicines');

        const data = await response.json();

        type ApiMedicine = {
          id: string;
          name: string;
          price: string | number;
          manufacturerName?: string;
          packSizeLabel?: string;
          type?: string;
        };

        const transformed =
          data.data?.map(
            (medicine: ApiMedicine): Medicine => ({
              id: medicine.id,
              name: medicine.name,
              price: parseFloat(medicine.price as string),
              manufacturerName: medicine.manufacturerName,
              packSizeLabel: medicine.packSizeLabel,
              type: medicine.type,
              originalPrice: parseFloat(medicine.price as string) * 1.2,
              discount: 20,
              rating: 4.5,
              reviews: 10,
              category: medicine.type || 'Medicine',
              imageUrl: '',
              stock: 0,
            })
          ) || [];

        setMedicines(transformed);
      } catch (err) {
        console.error('Error fetching medicines:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch medicines');
        setMedicines([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [options.type, options.limit]);

  return { medicines, loading, error };
}
