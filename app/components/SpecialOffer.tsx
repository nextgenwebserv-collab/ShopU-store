'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const SpecialOffers = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <section className="mx-auto hidden w-[90%] max-w-7xl px-4 py-8 sm:block">
          <h2 className="text-primaryColor mb-6 text-xl font-semibold">
            Special <span className="text-secondaryColor">Offer</span>
            <hr className="bg-background1 mt-1 h-1 w-32 rounded border-0" />{' '}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-64 animate-pulse rounded-xl bg-gray-200"></div>
            <div className="h-64 animate-pulse rounded-xl bg-gray-200"></div>
          </div>
        </section>

        {/* Mobile card view */}
        <section className="px-4 py-6 sm:hidden">
          <h2 className="text-primaryColor mb-5 text-lg font-medium">
            Special <span className="text-secondaryColor">Offer</span>
            <hr className="bg-background1 mt-1 w-30 rounded border-2" />
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-54 animate-pulse rounded-xl bg-gray-200"></div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Desktop card view */}
      <section className="mx-auto hidden w-[90%] max-w-7xl px-4 py-8 sm:block">
        <h2 className="text-primaryColor mb-6 text-xl font-semibold">
          Special <span className="text-secondaryColor">Offer</span>
          <hr className="bg-background1 mt-1 h-1 w-32 rounded border-0" />{' '}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Covid Pack */}
          <div
            className="bg-background flex h-64 rounded-xl bg-cover bg-right px-8 py-10 transition-transform duration-400 hover:scale-102"
            style={{ backgroundImage: `url('/covid.jpg')` }}
          >
            <div>
              <h3 className="mb-1 text-xl font-semibold text-gray-900">Covid 19 pack</h3>
              <p className="mb-6 text-xl font-semibold text-gray-800">Get it now 45% Off</p>
              <button className="bg-background1 rounded-full px-4 py-2 text-sm text-white">
                Show now →
              </button>
            </div>
          </div>
          {/* Moov Cream */}
          <div className="flex h-64 items-center justify-between rounded-xl bg-gradient-to-r from-[#6A1B6A] to-[#E72386] px-10 py-6 text-white transition-transform duration-400 hover:scale-102">
            <div>
              <h3 className="mb-2 text-2xl font-semibold">
                Moov Fast Pain
                <br />
                Relief Cream
              </h3>
              <p className="mb-4 text-sm">
                Quick Pain Relief From Muscle Pain,
                <br />
                Sprains, Strains, Spasms and even cramps
              </p>
              <button className="rounded-full bg-white px-4 py-2 text-sm text-[#7E067E] transition hover:bg-gray-100">
                Show now →
              </button>
            </div>
            <div className="flex flex-col items-end justify-center">
              <Image
                src="/moov.png"
                alt="Moov Cream"
                width={130}
                height={40}
                className="object-contain"
              />
              <Image
                src="/moov.png"
                alt="Moov Cream"
                width={130}
                height={40}
                className="object-contain"
              />
              <Image
                src="/moov.png"
                alt="Moov Cream"
                width={130}
                height={40}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile card view */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:hidden">
        <h2 className="text-primaryColor mb-5 text-lg font-medium">
          Special <span className="text-secondaryColor">Offer</span>
          <hr className="bg-background1 mt-1 w-30 rounded border-2" />
        </h2>

        {/* Slider wrapper for mobile */}
        <div className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth md:grid md:grid-cols-2">
          {/* Covid Pack */}
          <div
            className="bg-background flex h-50 min-w-[100%] flex-shrink-0 rounded-lg bg-cover bg-right p-6 md:min-w-0"
            style={{ backgroundImage: `url('/covid.jpg')` }}
          >
            <div>
              <h3 className="mb-1 text-xl font-semibold text-gray-900">Covid 19 pack</h3>
              <p className="mb-6 text-xl font-semibold text-gray-800">Get it now 45% Off</p>
              <button className="bg-background1 rounded-full px-4 py-2 text-sm text-white">
                Show now →
              </button>
            </div>
          </div>

          {/* Moov Cream */}
          <div className="flex h-50 min-w-[100%] flex-shrink-0 items-center justify-between rounded-xl bg-gradient-to-r from-[#6A1B6A] to-[#E72386] p-6 text-white md:min-w-0">
            <div className="">
              <h3 className="mb-2 text-lg font-semibold">
                Moov Fast Pain
                <br />
                Relief Cream
              </h3>
              <div className="w-40">
                <p className="mb-4 text-xs">
                  Quick Pain Relief From Muscle Pain, Sprains, Strains, Spasms and even cramps
                </p>
              </div>

              <button className="rounded-full bg-white px-4 py-2 text-sm text-[#7E067E] transition hover:bg-gray-100">
                Show now →
              </button>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Image
                src="/moov.png"
                alt="Moov Cream"
                width={80}
                height={40}
                className="object-contain"
              />
              <Image
                src="/moov.png"
                alt="Moov Cream"
                width={80}
                height={40}
                className="object-contain"
              />
              <Image
                src="/moov.png"
                alt="Moov Cream"
                width={80}
                height={40}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SpecialOffers;
