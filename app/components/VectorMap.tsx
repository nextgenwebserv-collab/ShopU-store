'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';

export interface MapRef {
  updateLocation: (lat: number, lng: number, address?: string) => void;
  getCenter: () => { lat: number; lng: number };
}

interface VectorMapProps {
  onLocationChange?: (lat: number, lng: number) => void;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
}

const VectorMap = forwardRef<MapRef, VectorMapProps>(
  (
    { onLocationChange, defaultCenter = { lat: 25.6112236, lng: 85.1306922 }, defaultZoom = 12 },
    ref
  ) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const initAttempts = useRef(0);

    // Helper function to initialize the map
    const initializeMap = () => {
      if (!mapContainer.current) return false;

      // Check if Google Maps API is loaded
      if (typeof window === 'undefined' || !window.google || !window.google.maps) {
        return false;
      }

      try {
        // Create map instance
        mapInstance.current = new google.maps.Map(mapContainer.current, {
          center: defaultCenter,
          zoom: defaultZoom,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        // Create initial marker
        markerRef.current = new google.maps.Marker({
          position: defaultCenter,
          map: mapInstance.current,
          draggable: true,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#0d9488',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
          },
        });

        // Add click listener to map
        mapInstance.current.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng && markerRef.current) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            // Update marker position
            markerRef.current.setPosition({ lat, lng });

            // Close any open info window
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
            }

            // Callback with coordinates
            if (onLocationChange) {
              onLocationChange(lat, lng);
            }
          }
        });

        // Add drag listener to marker
        markerRef.current.addListener('dragend', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            // Callback with coordinates
            if (onLocationChange) {
              onLocationChange(lat, lng);
            }
          }
        });

        setIsMapReady(true);
        return true;
      } catch (error) {
        console.error('Error initializing map:', error);
        return false;
      }
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      updateLocation: (lat: number, lng: number, address?: string) => {
        if (!mapInstance.current || !markerRef.current) return;

        // Update map center and zoom
        mapInstance.current.setCenter({ lat, lng });
        mapInstance.current.setZoom(15);

        // Update marker position
        markerRef.current.setPosition({ lat, lng });

        // Handle info window
        if (address) {
          if (!infoWindowRef.current) {
            infoWindowRef.current = new google.maps.InfoWindow();
          }

          infoWindowRef.current.setContent(`
            <div style="padding: 8px; max-width: 200px;">
              <p style="margin: 0; font-size: 14px; color: #374151;">${address}</p>
            </div>
          `);

          infoWindowRef.current.open(mapInstance.current, markerRef.current);
        } else if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        // Trigger callback
        if (onLocationChange) {
          onLocationChange(lat, lng);
        }
      },
      getCenter: () => {
        if (mapInstance.current) {
          const center = mapInstance.current.getCenter();
          if (center) {
            return { lat: center.lat(), lng: center.lng() };
          }
        }
        return defaultCenter;
      },
    }));

    // Initialize map when component mounts
    useEffect(() => {
      let interval: NodeJS.Timeout;

      const tryInitialize = () => {
        if (initializeMap()) {
          if (interval) clearInterval(interval);
          return;
        }

        // If initialization fails, retry up to 20 times (10 seconds)
        initAttempts.current++;
        if (initAttempts.current >= 20) {
          console.error('Failed to initialize Google Maps after multiple attempts');
          if (interval) clearInterval(interval);
        }
      };

      // Try to initialize immediately
      if (!initializeMap()) {
        // If immediate initialization fails, set up retry interval
        interval = setInterval(tryInitialize, 500);
      }

      // Cleanup
      return () => {
        if (interval) clearInterval(interval);
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
          infoWindowRef.current = null;
        }
        if (markerRef.current) {
          markerRef.current.setMap(null);
          markerRef.current = null;
        }
        if (mapInstance.current) {
          mapInstance.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run once on mount

    return (
      <div className="relative h-full w-full">
        <div ref={mapContainer} className="h-full w-full rounded-xl" />
        {!isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-100">
            <div className="text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

VectorMap.displayName = 'VectorMap';

export default VectorMap;
