'use client';

import Navroute from '@/app/components/Navroute';
import { Suspense } from 'react';

export default function CancellationAndRefund() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Navroute />
      <div className="mx-auto hidden max-w-7xl px-6 py-6 md:block md:px-14">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">Cancellation and Refund</h1>
          <p className="mb-4 text-sm text-gray-500">Last updated on Aug 20 2025</p>

          <p className="mb-4 text-gray-700">
            <strong>SHIPU LOGISTICS PRIVATE LIMITED</strong> believes in helping its customers as
            far as possible, and has therefore a liberal cancellation policy. Under this policy:
          </p>

          <ul className="mb-4 list-disc pl-6 text-gray-700">
            <li>
              Cancellations will be considered only if the request is made within{' '}
              <strong>1-2 days</strong> of placing the order.
            </li>
            <li>
              Cancellation requests may not be entertained if the orders have already been
              communicated to the vendors/merchants and the shipping process has been initiated.
            </li>
            <li>
              We do not accept cancellation requests for perishable items like flowers, eatables,
              etc.
            </li>
            <li>
              Refund or replacement can be made if the customer establishes that the quality of the
              product delivered is not good.
            </li>
          </ul>

          <h2 className="mb-2 text-xl font-semibold text-gray-900">Damaged or Defective Items</h2>
          <p className="mb-4 text-gray-700">
            In case of receipt of damaged or defective items, please report the same to our Customer
            Service team. The request will be entertained once the merchant has checked and
            determined the issue at their end. This should be reported within{' '}
            <strong>1-2 days</strong> of receipt of the products.
          </p>

          <h2 className="mb-2 text-xl font-semibold text-gray-900">Product Not as Expected</h2>
          <p className="mb-4 text-gray-700">
            If you feel that the product received is not as shown on the site or not as per your
            expectations, you must bring it to the notice of our Customer Service team within{' '}
            <strong>1-2 days</strong> of receiving the product. After reviewing your complaint, the
            Customer Service Team will take an appropriate decision.
          </p>

          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Products with Manufacturer Warranty
          </h2>
          <p className="mb-4 text-gray-700">
            In case of complaints regarding products that come with a warranty from manufacturers,
            please refer the issue directly to them.
          </p>

          <h2 className="mb-2 text-xl font-semibold text-gray-900">Refund Timeline</h2>
          <p className="mb-4 text-gray-700">
            In case of any refunds approved by <strong>SHIPU LOGISTICS PRIVATE LIMITED</strong>, it
            will take <strong>6-8 days</strong> for the refund to be processed to the end customer.
          </p>
        </div>
      </div>
      <div className="p-4 md:hidden">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Cancellation and Refund</h1>
          <p className="mb-4 text-sm text-gray-500">Last updated on Aug 20 2025</p>

          <p className="mb-4 text-gray-700">
            <strong>SHIPU LOGISTICS PRIVATE LIMITED</strong> believes in helping its customers as
            far as possible, and has therefore a liberal cancellation policy. Under this policy:
          </p>

          <ul className="mb-4 list-disc pl-6 text-gray-700">
            <li>
              Cancellations will be considered only if the request is made within{' '}
              <strong>1-2 days</strong> of placing the order.
            </li>
            <li>
              Cancellation requests may not be entertained if the orders have already been
              communicated to the vendors/merchants and the shipping process has been initiated.
            </li>
            <li>
              We do not accept cancellation requests for perishable items like flowers, eatables,
              etc.
            </li>
            <li>
              Refund or replacement can be made if the customer establishes that the quality of the
              product delivered is not good.
            </li>
          </ul>

          <h2 className="mb-2 text-lg font-semibold text-gray-900">Damaged or Defective Items</h2>
          <p className="mb-4 text-gray-700">
            In case of receipt of damaged or defective items, please report the same to our Customer
            Service team. The request will be entertained once the merchant has checked and
            determined the issue at their end. This should be reported within{' '}
            <strong>1-2 days</strong> of receipt of the products.
          </p>

          <h2 className="mb-2 text-lg font-semibold text-gray-900">Product Not as Expected</h2>
          <p className="mb-4 text-gray-700">
            If you feel that the product received is not as shown on the site or not as per your
            expectations, you must bring it to the notice of our Customer Service team within{' '}
            <strong>1-2 days</strong> of receiving the product. After reviewing your complaint, the
            Customer Service Team will take an appropriate decision.
          </p>

          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Products with Manufacturer Warranty
          </h2>
          <p className="mb-4 text-gray-700">
            In case of complaints regarding products that come with a warranty from manufacturers,
            please refer the issue directly to them.
          </p>

          <h2 className="mb-2 text-xl font-semibold text-gray-900">Refund Timeline</h2>
          <p className="mb-4 text-gray-700">
            In case of any refunds approved by <strong>SHIPU LOGISTICS PRIVATE LIMITED</strong>, it
            will take <strong>6-8 days</strong> for the refund to be processed to the end customer.
          </p>
        </div>
      </div>
    </Suspense>
  );
}
