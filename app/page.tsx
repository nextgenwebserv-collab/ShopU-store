'use client';
import ChatBot from './components/ChatBot';
import HealthLayout from './components/ShopUHealthLayout';
import React from 'react';
import ShopUCarousel from './components/ShopUCarousel';
import DealOfTheWeek from './components/DealsOfTheWeek';
import ShopUSpecialOffers from './components/SpecialOffer';
import BabyCareSection from './components/BabyCareSection';
import WomenCareSection from './components/WomenCareSection';
import BrandSection from './components/ShopByBrand';
import PersonalCareSection from './components/PersonalCareSection';
import EverydayEssentialsSection from './components/EverydayEssentialsSection';
import FeatureSection from './components/FeatureSection';
import PromoBanner from './components/Promobanner';

export default function Home() {
  return (
    <>
      <ShopUCarousel />
      <HealthLayout />
      <DealOfTheWeek />
      <ShopUSpecialOffers />
      <BabyCareSection />
      <BrandSection />
      <WomenCareSection />
      <PersonalCareSection />
      <PromoBanner />
      <EverydayEssentialsSection />
      <FeatureSection />
      <ChatBot />
    </>
  );
}
