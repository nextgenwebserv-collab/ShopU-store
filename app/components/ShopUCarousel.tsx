'use client';

import React, { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import Image from 'next/image';
import RightSideCard from './RightSideCard';

const ShopUCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: '/image4.png',
      title: 'Covid 19 pack',
    },
    {
      id: 2,
      image: '/image5.png',
      title: 'Health Pack',
    },
    {
      id: 3,
      image: '/image6.png',
      title: 'Wellness Bundle',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);

  return (
    <>
      {/* Desktop Card View */}
      <div className="mx-auto hidden w-[95%] max-w-7xl space-y-4 sm:block sm:p-4 md:w-[90%] md:p-2">
        {/* Main Carousel */}
        <div className="flex flex-col gap-5 py-2 lg:flex-row">
          {/* Carousel Banner */}
          <div className="relative min-h-[250px] flex-3 overflow-hidden rounded-lg bg-gradient-to-br">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map(slide => (
                <div key={slide.id} className="min-w-full">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    width={720}
                    height={400}
                    className="max-h-88 w-full object-cover md:max-h-110"
                    priority
                  />
                </div>
              ))}
            </div>

            {/* Dot Indicators */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 transform space-x-2 sm:bottom-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 w-2 rounded-full transition-all sm:h-3 sm:w-3 ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Side Card */}
          <RightSideCard />
        </div>

        {/* WhatsApp Banner */}
        <div className="bg-background1 flex h-40 w-full flex-col items-center justify-between rounded-lg px-4 py-4 text-white sm:flex-row md:h-46 md:px-14">
          {/* Left: Logo & Text */}
          <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row md:gap-10">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image src="/ShopULogo.png" alt="Shopu Logo" width={160} height={80} priority />
            </div>

            {/* Text */}
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium md:text-lg">Now available on</p>
              <h1 className="py-2 text-xl font-semibold md:text-4xl">WHATSAPP</h1>
              <p className="mt-1 text-sm sm:text-base">Click to order.</p>
            </div>
          </div>

          {/* Middle: WhatsApp Button */}
          <a
            href="https://wa.me/+918235989891?text=Hello%2C%20I%20want%20to%20place%20an%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="text-primaryColor flex items-center gap-2 rounded-md border border-white bg-white px-4 py-2 text-xl font-semibold shadow hover:shadow-lg md:px-8 md:py-3"
          >
            <FaWhatsapp className="text-2xl" />
            WhatsApp
          </a>

          {/* Right: Illustration */}
          <div>
            <Image src="/specialimage.png" alt="WhatsApp Illustration" width={200} height={144} />
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="flex flex-col gap-2 sm:hidden">
        <div className="relative min-h-[200px] flex-3 overflow-hidden rounded-lg bg-gradient-to-br">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map(slide => (
              <div key={slide.id} className="min-w-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  width={600}
                  height={250}
                  className="h-56 w-full object-cover"
                  priority
                />
              </div>
            ))}
          </div>

          {/* Dot Indicators */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 transform space-x-2 sm:bottom-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition-all sm:h-3 sm:w-3 ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-background1 flex w-full flex-col items-center justify-between px-2 py-3 text-white">
          {/* Left: Logo & Text */}
          <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-row">
            {/* Text */}
            <div className="text-left">
              <p className="mb-2 text-lg font-medium">
                Now available on WHATSAPP
                <br />
                Click to order.
              </p>

              <a
                href="https://wa.me/+918235989891?text=Hello%2C%20I%20want%20to%20place%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="text-primaryColor text-md flex w-34 items-center gap-1 rounded-full border border-white bg-white px-4 py-2 font-medium font-semibold shadow hover:shadow-lg"
              >
                <FaWhatsapp className="text-2xl" />
                WhatsApp
              </a>
            </div>

            <div>
              {/* Right: Illustration */}
              <div className="">
                <Image
                  src="/specialimage.png"
                  alt="WhatsApp Illustration"
                  width={150}
                  height={150}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopUCarousel;
