'use client';

import Image from 'next/image';
import React from 'react';

const PromoBanner = () => {
  return (
    <>
      {/* Desktop card view */}
      <div className="mx-auto grid hidden w-[90%] max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid md:grid-cols-3">
        {/* Card 1 - Hair Supplement */}
        <div className="flex h-56 items-center justify-between rounded-xl bg-[#FFEAE6] p-4 transition-transform duration-400 hover:scale-102 md:p-6">
          <div className="flex flex-col p-4 pt-6 text-[#993A26]">
            <h2 className="text-3xl leading-none font-black">Hair</h2>
            <span className="mb-2 text-lg font-bold">Supplement</span>
            <hr className="mb-1 h-0.5 bg-black" />
            <p className="mb-2 text-sm text-black">With Folic Acid, Iron & Vitamin E</p>
            <button className="mt-auto w-fit rounded-full bg-[#993A26] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c14b2d]">
              Order now →
            </button>
          </div>
          <div className="relative h-32 w-32 md:h-36 md:w-36">
            <Image src="/hair.png" alt="Hair Supplement" fill className="object-contain" />
          </div>
        </div>

        {/* Card 2 - Banner Image Only */}
        <div className="bg-background relative h-56 overflow-hidden rounded-xl transition-transform duration-400 hover:scale-102">
          <Image src="/banner1.jpg" alt="Banner" fill className="object-cover" />
        </div>

        {/* Card 3 - Image Only */}
        <div className="bg-background relative hidden h-56 overflow-hidden rounded-xl transition-transform duration-400 hover:scale-102 md:grid">
          <Image src="/image.png" alt="Banner" fill className="object-cover" />
        </div>
      </div>

      {/* Mobile card view */}
      <div className="w-full p-4 sm:hidden">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth">
          {/* Card 1 - Hair Supplement */}
          <div className="flex w-full flex-shrink-0 snap-start items-center justify-between rounded-xl bg-[#FFEAE6] p-4">
            <div className="flex flex-col p-2 text-[#993A26]">
              <h2 className="text-2xl leading-none font-black">Hair</h2>
              <span className="text-md mb-1 font-bold">Supplement</span>
              <hr className="mb-1 h-0.5 bg-black" />
              <p className="mb-2 text-sm text-black">With Folic Acid, Iron & Vitamin E</p>
              <button className="mt-auto w-fit rounded-full bg-[#993A26] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c14b2d]">
                Order now →
              </button>
            </div>
            <div className="relative h-24 w-24">
              <Image src="/hair.png" alt="Hair Supplement" fill className="object-contain" />
            </div>
          </div>

          {/* Card 2 - Banner Image Only */}
          <div className="bg-background relative h-56 w-full flex-shrink-0 snap-start overflow-hidden rounded-xl">
            <Image src="/banner1.jpg" alt="Banner" fill className="object-cover" />
          </div>

          {/* Card 3 - Image Only */}
          <div className="bg-background relative h-56 w-full flex-shrink-0 snap-start overflow-hidden rounded-xl">
            <Image src="/image.png" alt="Banner" fill className="object-cover" />
          </div>
        </div>
      </div>
    </>
  );
};

export default PromoBanner;
