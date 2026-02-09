'use client';

import Navroute from '@/app/components/Navroute';
import { Suspense } from 'react';

export default function ShippingAndDelivery() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Navroute />
      <div className="mx-auto hidden max-w-7xl px-6 py-6 md:block md:px-14">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">Shipping and Delivery</h1>
          <p className="mb-4 text-sm text-gray-500">Last updated on Aug 20 2025</p>
          <p className="mb-4 text-gray-700">
            For International buyers, orders are shipped and delivered through registered
            international courier companies and/or International speed post only. For domestic
            buyers, orders are shipped through registered domestic courier companies and/or speed
            post only. Orders are shipped within <strong>3-5 days</strong> or as per the delivery
            date agreed at the time of order confirmation and delivering of the shipment subject to
            Courier Company / post office norms.
          </p>
          <p className="mb-4 text-gray-700">
            SHIPU LOGISTICS PRIVATE LIMITED is not liable for any delay in delivery by the courier
            company / postal authorities and only guarantees to hand over the consignment to the
            courier company or postal authorities within <strong>3-5 days</strong> from the date of
            the order and payment or as per the delivery date agreed at the time of order
            confirmation.
          </p>
          <p className="mb-4 text-gray-700">
            Delivery of all orders will be to the address provided by the buyer. Delivery of our
            services will be confirmed on your mail ID as specified during registration. For any
            issues in utilizing our services you may contact our helpdesk on{' '}
            <strong>7070472634</strong> or{' '}
            <a href="mailto:ayushkumar9315983@gmail.com" className="text-blue-600 underline">
              ayushkumar9315983@gmail.com
            </a>
          </p>
        </div>
      </div>
      <div className="p-4 md:hidden">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Shipping and Delivery</h1>
          <p className="mb-4 text-sm text-gray-500">Last updated on Aug 20 2025</p>
          <p className="mb-4 text-gray-700">
            For International buyers, orders are shipped and delivered through registered
            international courier companies and/or International speed post only. For domestic
            buyers, orders are shipped through registered domestic courier companies and/or speed
            post only. Orders are shipped within <strong>3-5 days</strong> or as per the delivery
            date agreed at the time of order confirmation and delivering of the shipment subject to
            Courier Company / post office norms.
          </p>
          <p className="mb-4 text-gray-700">
            SHIPU LOGISTICS PRIVATE LIMITED is not liable for any delay in delivery by the courier
            company / postal authorities and only guarantees to hand over the consignment to the
            courier company or postal authorities within <strong>3-5 days</strong> from the date of
            the order and payment or as per the delivery date agreed at the time of order
            confirmation.
          </p>
          <p className="mb-4 text-gray-700">
            Delivery of all orders will be to the address provided by the buyer. Delivery of our
            services will be confirmed on your mail ID as specified during registration. For any
            issues in utilizing our services you may contact our helpdesk on{' '}
            <strong>7070472634</strong> or{' '}
            <a href="mailto:ayushkumar9315983@gmail.com" className="text-blue-600 underline">
              ayushkumar9315983@gmail.com
            </a>
          </p>
        </div>
      </div>
    </Suspense>
  );
}
