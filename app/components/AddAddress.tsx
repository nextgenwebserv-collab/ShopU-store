'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Search, Home, Briefcase, MoreHorizontal, MapPin, Crosshair } from 'lucide-react';
import VectorMap, { MapRef } from '../components/VectorMap';

type Address = {
  id?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  latitude?: number; // Added latitude
  longitude?: number; // Added longitude
};

type Props = {
  onCancel: () => void;
  onSave: (address: Address) => void;
  formMode: 'add' | 'edit';
  initialData: Address | null;
};

type Prediction = {
  description: string;
  place_id: string;
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

export default function AddAddressForm({ onCancel, onSave, formMode, initialData }: Props) {
  const mapRef = useRef<MapRef>(null);

  const [formData, setFormData] = useState<Address>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    phoneNumber: '',
    latitude: undefined,
    longitude: undefined,
  });

  const [selectedAddressType, setSelectedAddressType] = useState<
    'home' | 'work' | 'hotel' | 'other'
  >('home');

  const [searchLocation, setSearchLocation] = useState('');
  const [results, setResults] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Show selected coordinates
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (formMode === 'edit' && initialData) {
      setFormData({ ...initialData });
      setSearchLocation(initialData.addressLine1 || '');

      // Update map if coordinates exist
      if (initialData.latitude && initialData.longitude && mapRef.current) {
        mapRef.current.updateLocation(
          initialData.latitude,
          initialData.longitude,
          initialData.addressLine1
        );
        setSelectedCoords({ lat: initialData.latitude, lng: initialData.longitude });
      }
    }
  }, [formMode, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Search API
  const searchLocationAPI = async (query: string) => {
    if (query.length < 3) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/maps/autocomplete?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.predictions || []);
    } catch (err) {
      console.error('Autocomplete failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Select API - Enhanced with coordinates
  const handleSelect = async (placeId: string, description: string) => {
    setLoading(true);

    try {
      const res = await fetch(`/api/maps/details?place_id=${placeId}`);
      const data = await res.json();

      if (data?.result) {
        let city = '',
          state = '',
          postalCode = '';

        // Extract address components
        if (data.result.address_components) {
          (data.result.address_components as AddressComponent[]).forEach(c => {
            if (c.types.includes('locality')) city = c.long_name;
            if (c.types.includes('administrative_area_level_1')) state = c.long_name;
            if (c.types.includes('postal_code')) postalCode = c.long_name;
          });
        }

        // Extract coordinates
        const geometry = data.result.geometry;
        let latitude: number | undefined, longitude: number | undefined;

        if (geometry?.location) {
          latitude = geometry.location.lat;
          longitude = geometry.location.lng;
        }

        // Update form data with coordinates
        setFormData(prev => ({
          ...prev,
          city,
          state,
          postalCode,
          addressLine1: description,
          latitude,
          longitude,
        }));

        // Update map location
        if (latitude && longitude && mapRef.current) {
          mapRef.current.updateLocation(latitude, longitude, description);
          setSelectedCoords({ lat: latitude, lng: longitude });
        }

        setSearchLocation(description);
        setResults([]);

        console.log('Selected Location:', {
          description,
          latitude,
          longitude,
          city,
          state,
          postalCode,
        });
      }
    } catch (err) {
      console.error('Details fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle map location changes
  const handleMapLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    setSelectedCoords({ lat, lng });

    console.log('Map location updated:', { lat, lng });
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(`/api/maps/reverse?lat=${latitude}&lng=${longitude}`);
      const data = await res.json();

      if (data?.result) {
        let city = '',
          state = '',
          postalCode = '';

        if (data.result.address_components) {
          (data.result.address_components as AddressComponent[]).forEach(c => {
            if (c.types.includes('locality')) city = c.long_name;
            if (c.types.includes('administrative_area_level_1')) state = c.long_name;
            if (c.types.includes('postal_code')) postalCode = c.long_name;
          });
        }

        setFormData(prev => ({
          ...prev,
          addressLine1: data.result.formatted_address || prev.addressLine1,
          city: city || prev.city,
          state: state || prev.state,
          postalCode: postalCode || prev.postalCode,
        }));

        setSearchLocation(data.result.formatted_address || '');
      }
    } catch (err) {
      console.error('Reverse geocode failed:', err);
    }
  };

  // Get current location from device with high accuracy
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setResults([]); // Clear search results

    // Use watchPosition for more accurate real-time location
    let watchId: number;
    let locationObtained = false;

    let bestAccuracy = Infinity;
    let stableCount = 0;

    const processLocation = async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;

      console.log('GPS update:', accuracy + 'm');

      // Update only if accuracy improves
      if (accuracy < bestAccuracy) {
        bestAccuracy = accuracy;
        stableCount++;

        // Map + state update
        mapRef.current?.updateLocation(latitude, longitude, '📍 Your Current Location');

        setFormData(prev => ({
          ...prev,
          latitude,
          longitude,
        }));

        setSelectedCoords({ lat: latitude, lng: longitude });
      }

      // Check if accuracy is good enough or stable enough
      if (accuracy <= 20 || stableCount >= 3) {
        console.log('✅ Exact location locked:', accuracy + 'm');

        navigator.geolocation.clearWatch(watchId);
        setGettingLocation(false);

        // Reverse geocode to get address
        reverseGeocode(latitude, longitude);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error('Geolocation error:', error);
      setGettingLocation(false);

      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }

      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert(
            'Location permission denied.\n\nPlease allow location access in your browser settings to use this feature.'
          );
          break;
        case error.POSITION_UNAVAILABLE:
          alert(
            'Location information is unavailable.\n\nPlease check your device location settings and try again.'
          );
          break;
        case error.TIMEOUT:
          alert(
            'Location request timed out.\n\nPlease try again. Make sure you have a clear view of the sky if using GPS.'
          );
          break;
        default:
          alert(
            'An unknown error occurred while getting your location.\n\nPlease try again or enter your address manually.'
          );
          break;
      }
    };

    // Options for high accuracy
    const options: PositionOptions = {
      enableHighAccuracy: true, // Use GPS for best accuracy
      timeout: 15000, // 15 seconds timeout
      maximumAge: 0, // Don't use cached position
    };

    // Try to get current position first (faster)
    navigator.geolocation.getCurrentPosition(
      position => {
        processLocation(position);
      },
      initialError => {
        // If getCurrentPosition fails, try watchPosition for continuous updates
        console.log('getCurrentPosition failed, trying watchPosition...', initialError.message);
        watchId = navigator.geolocation.watchPosition(processLocation, handleError, options);

        // Auto-clear watch after 20 seconds if no success
        setTimeout(() => {
          if (watchId && !locationObtained) {
            navigator.geolocation.clearWatch(watchId);
            handleError({
              code: 3,
              message: 'Timeout',
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            } as GeolocationPositionError);
          }
        }, 20000);
      },
      options
    );
  };

  // Submit Form - Include coordinates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate coordinates
    if (!formData.latitude || !formData.longitude) {
      alert('Please select a location on the map or search for an address');
      return;
    }

    try {
      const url =
        formMode === 'edit' && formData.id
          ? `/api/account/address/${formData.id}`
          : '/api/account/address';

      const method = formMode === 'edit' ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          addressType: selectedAddressType,
          latitude: formData.latitude,
          longitude: formData.longitude,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onSave(data.address || data);
        onCancel();
      } else {
        console.error('Failed to save:', await res.text());
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl">
        {/* Left Map / Search Section */}
        <div className="relative hidden flex-1 bg-gray-100 md:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
            {/* Search Bar */}
            <div className="absolute top-4 right-4 left-4 z-20">
              <div className="relative rounded-xl bg-white p-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your Location"
                    value={searchLocation}
                    onChange={e => {
                      setSearchLocation(e.target.value);
                      searchLocationAPI(e.target.value);
                    }}
                    className="flex-1 text-gray-700 outline-none"
                  />

                  {loading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
                  )}
                </div>

                {/* Suggestions */}
                {results.length > 0 && (
                  <div className="absolute top-full right-0 left-0 z-30 mt-2 max-h-60 overflow-y-auto rounded-xl border bg-white shadow-lg">
                    {results.map(r => (
                      <div
                        key={r.place_id}
                        onClick={() => handleSelect(r.place_id, r.description)}
                        className="cursor-pointer border-b p-3 last:border-none hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-teal-600" />
                          <span className="text-sm">{r.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Map Component */}
            <div className="flex h-[500px] w-full items-center justify-center rounded-xl shadow">
              <VectorMap ref={mapRef} onLocationChange={handleMapLocationChange} />
            </div>

            {/* Map Instructions */}
            <div className="absolute right-4 bottom-2 left-4">
              <div className="mb-4 flex items-end justify-between gap-10">
                {/* Use Current Location Button */}
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="mt-2 flex w-50 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-teal-600 to-green-500 p-2 text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {gettingLocation ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span className="text-sm font-medium">Getting your location...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="h-4 w-4" />
                      <span className="text-sm font-medium">Go to current location</span>
                    </>
                  )}
                </button>

                {/* Coordinates Display */}
                {selectedCoords && (
                  <div className="mt-2 rounded-lg bg-white/90 p-2 shadow-sm">
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Coordinates:</span>
                      <span className="ml-1">
                        {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="rounded-lg bg-white/90 p-2 text-center text-xs text-gray-600">
                💡 Click on the map to select a precise location
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section - Rest remains same */}
        <form onSubmit={handleSubmit} className="flex max-w-md flex-1 flex-col bg-white">
          {/* Header */}
          <div className="bg-primaryColor flex items-center justify-between border-b border-gray-300 px-6 py-3">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {formMode === 'edit' ? 'Edit Address' : 'Add Address'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="flex-1 space-y-6 overflow-y-auto px-8 py-2">
            {/* Address Type */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-800">
                Save address as
              </label>
              <div className="flex flex-wrap gap-4">
                {['home', 'work', 'other'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedAddressType(type as 'home' | 'work' | 'other')}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
                      selectedAddressType === type
                        ? 'border-primaryColor text-primaryColor bg-teal-50'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {type === 'home' && <Home className="h-4 w-4" />}
                    {type === 'work' && <Briefcase className="h-4 w-4" />}
                    {type === 'other' && <MoreHorizontal className="h-4 w-4" />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Address Inputs */}
            <div className="mb-4 space-y-4">
              <input
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Flat / House no / Building name"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                required
              />

              <input
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Floor (optional)"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
              />

              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                required
              />

              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
              />

              <input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal Code"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Coordinates Display in Form */}
            {formData.latitude && formData.longitude && (
              <div className="mb-4 rounded-lg bg-teal-50 px-3 py-2">
                <div className="text-sm text-teal-800">
                  <div className="font-medium">Selected Location:</div>
                  <div className="mt-1 text-xs">
                    Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            )}
            <p className="text-primaryColor my-4 text-sm">
              Enter your details for seamless delivery experience
            </p>

            {/* Personal Info */}
            <div className="">
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Name"
                className="mb-4 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                required
              />

              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                minLength={10}
                maxLength={10}
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 px-6 py-4">
            <button
              type="submit"
              disabled={!formData.latitude || !formData.longitude}
              className="bg-primaryColor w-full rounded-xl py-4 font-medium text-white shadow-lg transition disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Continue
              {!formData.latitude ||
                (!formData.longitude && (
                  <span className="mt-1 block text-xs">Select location first</span>
                ))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
