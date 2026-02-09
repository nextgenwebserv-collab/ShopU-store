'use client';

import React from 'react';
import Image from 'next/image';

const brandData = [
  { id: 'himalaya', name: 'Himalaya', image: '/himalaya.png' },
  { id: 'nivea', name: 'Nivea', image: '/nivea1.png' },
  { id: 'aveeno', name: 'Aveeno', image: '/aveeno.png' },
  { id: 'volini', name: 'Volini', image: '/volini.png' },
  { id: 'revital', name: 'Revital', image: '/revital.png' },
  { id: 'mamypoko', name: 'Mamypoko', image: '/manypoko.png' },
];

const BrandSection = () => {
  return (
    <>
      {/* Desktop card view */}
      <div className="justify-cente flex hidden bg-white px-4 py-2 sm:block">
        <section className="mx-auto w-[90%] max-w-7xl py-2">
          <div className="w-36">
            <h2 className="text-primaryColor text-xl font-semibold">
              Shop By <span className="text-secondaryColor">Brand</span>
            </h2>
            <hr className="bg-background1 mt-1 h-1 rounded border-0" />
          </div>

          <div className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
            {brandData.map(category => (
              <div
                key={category.id}
                className="group bg-background flex items-center justify-center rounded-lg px-6 py-14"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  width={100}
                  height={60}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Mobile card view */}
      <div className="bg-background px-4 py-2 sm:hidden">
        <section className="py-2">
          {/* Section Header */}
          <div>
            <h2 className="text-primaryColor text-lg font-medium">
              Shop By <span className="text-secondaryColor">Brand</span>
              <hr className="bg-background1 mt-1 w-32 rounded border-2" />{' '}
            </h2>
          </div>
          {/* Horizontal Scrollable Brand List */}
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto scroll-smooth p-1 whitespace-nowrap">
            {brandData.map(category => (
              <div
                key={category.id}
                className="max-w-[85px] min-w-[85px] flex-shrink-0 rounded-lg bg-white px-4 py-2 shadow-sm"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  width={80}
                  height={80}
                  className="mx-auto h-18 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default BrandSection;
