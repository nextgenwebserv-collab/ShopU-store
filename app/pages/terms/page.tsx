'use client';

import Navroute from '@/app/components/Navroute';
import { Suspense } from 'react';

export default function Terms() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Navroute />
      <div className="mx-auto hidden max-w-7xl px-6 py-6 md:block md:px-14">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">Terms and Conditions</h1>
          <p className="mb-8 text-sm text-gray-500">Last updated on Aug 20 2025</p>

          <p className="mb-4 text-gray-700">
            For the purpose of these Terms and Conditions, The term{' '}
            <strong>&quot;we&quot;, &quot;us&quot;, &quot;our&quot;</strong> used anywhere on this
            page shall mean <strong>SHIPU LOGISTICS PRIVATE LIMITED</strong>, whose
            registered/operational office is N C 105, NEAR SBI OFFICER, KANKARBAGH, Ashok Nagar
            (Patna), Sampatchak, Patna-800020, Bihar Patna BIHAR 800020.
            <strong>
              &quot;you&quot;, &quot;your&quot;, &quot;user&quot;, &quot;visitor&quot;
            </strong>{' '}
            shall mean any natural or legal person who is visiting our website and/or agreed to
            purchase from us.
          </p>

          <p className="mb-4 text-gray-700">
            Your use of the website and/or purchase from us are governed by following Terms and
            Conditions:
          </p>

          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>The content of the pages of this website is subject to change without notice.</li>
            <li>
              Neither we nor any third parties provide any warranty or guarantee as to the accuracy,
              timeliness, performance, completeness or suitability of the information and materials
              found or offered on this website for any particular purpose. You acknowledge that such
              information and materials may contain inaccuracies or errors and we expressly exclude
              liability for any such inaccuracies or errors to the fullest extent permitted by law.
            </li>
            <li>
              Your use of any information or materials on our website and/or product pages is
              entirely at your own risk, for which we shall not be liable. It shall be your own
              responsibility to ensure that any products, services or information available through
              our website and/or product pages meet your specific requirements.
            </li>
            <li>
              Our website contains material which is owned by or licensed to us. This material
              includes, but are not limited to, the design, layout, look, appearance and graphics.
              Reproduction is prohibited other than in accordance with the copyright notice, which
              forms part of these terms and conditions.
            </li>
            <li>
              All trademarks reproduced in our website which are not the property of, or licensed
              to, the operator are acknowledged on the website.
            </li>
            <li>
              Unauthorized use of information provided by us shall give rise to a claim for damages
              and/or be a criminal offense.
            </li>
            <li>
              From time to time our website may also include links to other websites. These links
              are provided for your convenience to provide further information.
            </li>
            <li>
              You may not create a link to our website from another website or document without
              SHIPU LOGISTICS PRIVATE LIMITED&rsquo;s prior written consent.
            </li>
            <li>
              Any dispute arising out of use of our website and/or purchase with us and/or any
              engagement with us is subject to the laws of India.
            </li>
            <li>
              We, shall be under no liability whatsoever in respect of any loss or damage arising
              directly or indirectly out of the decline of authorization for any Transaction, on
              Account of the Cardholder having exceeded the preset limit mutually agreed by us with
              our acquiring bank from time to time.
            </li>
          </ul>
        </div>
      </div>
      <div className="p-4 md:hidden">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Terms and Conditions</h1>
          <p className="mb-8 text-sm text-gray-500">Last updated on Aug 20 2025</p>

          <p className="mb-4 text-gray-700">
            For the purpose of these Terms and Conditions, The term{' '}
            <strong>&quot;we&quot;, &quot;us&quot;, &quot;our&quot;</strong> used anywhere on this
            page shall mean <strong>SHIPU LOGISTICS PRIVATE LIMITED</strong>, whose
            registered/operational office is N C 105, NEAR SBI OFFICER, KANKARBAGH, Ashok Nagar
            (Patna), Sampatchak, Patna-800020, Bihar Patna BIHAR 800020.
            <strong>
              &quot;you&quot;, &quot;your&quot;, &quot;user&quot;, &quot;visitor&quot;
            </strong>{' '}
            shall mean any natural or legal person who is visiting our website and/or agreed to
            purchase from us.
          </p>

          <p className="mb-4 text-gray-700">
            Your use of the website and/or purchase from us are governed by following Terms and
            Conditions:
          </p>

          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>The content of the pages of this website is subject to change without notice.</li>
            <li>
              Neither we nor any third parties provide any warranty or guarantee as to the accuracy,
              timeliness, performance, completeness or suitability of the information and materials
              found or offered on this website for any particular purpose. You acknowledge that such
              information and materials may contain inaccuracies or errors and we expressly exclude
              liability for any such inaccuracies or errors to the fullest extent permitted by law.
            </li>
            <li>
              Your use of any information or materials on our website and/or product pages is
              entirely at your own risk, for which we shall not be liable. It shall be your own
              responsibility to ensure that any products, services or information available through
              our website and/or product pages meet your specific requirements.
            </li>
            <li>
              Our website contains material which is owned by or licensed to us. This material
              includes, but are not limited to, the design, layout, look, appearance and graphics.
              Reproduction is prohibited other than in accordance with the copyright notice, which
              forms part of these terms and conditions.
            </li>
            <li>
              All trademarks reproduced in our website which are not the property of, or licensed
              to, the operator are acknowledged on the website.
            </li>
            <li>
              Unauthorized use of information provided by us shall give rise to a claim for damages
              and/or be a criminal offense.
            </li>
            <li>
              From time to time our website may also include links to other websites. These links
              are provided for your convenience to provide further information.
            </li>
            <li>
              You may not create a link to our website from another website or document without
              SHIPU LOGISTICS PRIVATE LIMITED&rsquo;s prior written consent.
            </li>
            <li>
              Any dispute arising out of use of our website and/or purchase with us and/or any
              engagement with us is subject to the laws of India.
            </li>
            <li>
              We, shall be under no liability whatsoever in respect of any loss or damage arising
              directly or indirectly out of the decline of authorization for any Transaction, on
              Account of the Cardholder having exceeded the preset limit mutually agreed by us with
              our acquiring bank from time to time.
            </li>
          </ul>
        </div>
      </div>
    </Suspense>
  );
}
