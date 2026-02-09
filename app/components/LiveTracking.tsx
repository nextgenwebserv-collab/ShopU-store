'use client';

import { useEffect, useState } from 'react';
import { Truck, Check, AlertCircle, Clock, Package, MapPin, Loader } from 'lucide-react';
import OrderStatusUpdater from './OrderStatusUpdater';

interface Scan {
  scan_type: string;
  scan_location: string;
  scan_date: string;
}

interface TrackingStatus {
  Status: string;
  StatusDateTime: string;
}

interface TrackingData {
  success: boolean;
  ShipmentData?: Array<{
    Shipment: {
      Status?: TrackingStatus;
      Scans?: Scan[];
    };
  }>;
  error?: string;
}

export default function LiveTracking({
  awb,
  orderId,
  isAdmin = true,
}: {
  awb: string;
  orderId?: string;
  isAdmin?: boolean;
}) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      if (!awb) {
        setLoading(false);
        setError('No tracking number provided');
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/track/${awb}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || data.error || 'Failed to fetch tracking info');
        }

        setTrackingData(data);
        setError(null);
      } catch (err: unknown) {
        console.error('Error fetching tracking:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tracking information');
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 5 * 60 * 1000); // every 5 minutes
    return () => clearInterval(interval);
  }, [awb]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Loader className="h-8 w-8 animate-spin text-teal-600" />
        <p className="mt-4 text-gray-600">Loading tracking information...</p>
      </div>
    );
  }

  if (error || !trackingData?.success) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">
            {error || trackingData?.error || 'Unable to load tracking information'}
          </p>
        </div>
      </div>
    );
  }

  const shipment = trackingData?.ShipmentData?.[0]?.Shipment;
  const status = shipment?.Status?.Status || 'Unknown';
  const scans = shipment?.Scans || [];

  const getStatusIcon = (status: string) => {
    const iconClass = 'w-6 h-6';
    switch (status.toLowerCase()) {
      case 'delivered':
        return <Check className={`${iconClass} text-green-600`} />;
      case 'out for delivery':
        return <Truck className={`${iconClass} text-blue-600`} />;
      case 'in transit':
        return <Truck className={`${iconClass} text-yellow-600`} />;
      case 'shipped':
        return <Package className={`${iconClass} text-purple-600`} />;
      case 'pending':
        return <Clock className={`${iconClass} text-gray-600`} />;
      default:
        return <Package className={`${iconClass} text-gray-600`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'out for delivery':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in transit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleString('en-IN', options);
  };

  const renderStatusUpdater = () => {
    if (!isAdmin || !orderId) return null;

    return (
      <div className="mt-2 border-t pt-2">
        <p className="mb-1 text-sm font-medium text-gray-700">Update Status:</p>
        <OrderStatusUpdater
          orderId={orderId}
          currentStatus={status}
          onStatusChange={newStatus => {
            // Optionally refresh tracking data or update UI
            console.log('Status updated to:', newStatus);
          }}
        />
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border shadow-sm">
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Shipment Tracking</h2>
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(status)}`}>
            {status}
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">AWB: {awb}</p>
        {renderStatusUpdater()}
      </div>

      {scans.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <Package className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2">No tracking details available yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {scans.map((scan, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4">
              <div className="mt-1 flex-shrink-0">{getStatusIcon(scan.scan_type)}</div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{scan.scan_type}</p>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <MapPin className="mr-1 h-4 w-4" />
                  {scan.scan_location || 'Location not available'}
                </div>
                <p className="mt-1 text-sm text-gray-500">{formatDate(scan.scan_date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
