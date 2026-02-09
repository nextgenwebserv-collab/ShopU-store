'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationType {
  address:
    | string
    | {
        id: string;
        fullName: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        pincode?: string;
        phoneNumber: string;
        isDefault: boolean;
      };
  city?: string;
  state?: string;
  pincode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface LocationContextType {
  location: LocationType | null;
  setLocation: (location: LocationType | null) => void;
  addressId: string | null;
  setAddressId: (id: string | null) => void;
  isLoadingLocation?: boolean;
  setIsLoadingLocation?: (isLoading: boolean) => void;
  locationError?: string | null;
  setLocationError?: (error: string | null) => void;
  setFullAddress?: (newLocation: LocationType) => void;
}

const defaultContextValue: LocationContextType = {
  location: null,
  setLocation: () => {},
  addressId: null,
  setAddressId: () => {},
};

const LocationContext = createContext<LocationContextType>(defaultContextValue);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Function to set full address
  const setFullAddress = (newLocation: LocationType) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('userLocation', JSON.stringify(newLocation));
        console.log('Saved full address to localStorage:', newLocation);
      }
    } catch (error) {
      console.error('Failed to save location to localStorage:', error);
    }

    setLocation(newLocation);
  };

  // Mark that client is mounted
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load from localStorage once on client
  useEffect(() => {
    if (!isClient) return;

    try {
      const stored = localStorage.getItem('userLocation');
      if (stored) {
        const parsed: LocationType = JSON.parse(stored);
        if (parsed && parsed.address) {
          setLocation(parsed);
          console.log('Loaded location from localStorage:', parsed);
        }
      }
    } catch (err) {
      console.error('Failed to parse userLocation:', err);
      localStorage.removeItem('userLocation');
    }
  }, [isClient]);

  // Sync changes to localStorage
  useEffect(() => {
    if (!isClient || !location) return;

    try {
      localStorage.setItem('userLocation', JSON.stringify(location));
    } catch (err) {
      console.error('Failed to sync location to localStorage:', err);
    }
  }, [location, isClient]);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        isLoadingLocation,
        setIsLoadingLocation,
        locationError,
        setLocationError,
        addressId,
        setAddressId,
        setFullAddress,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
