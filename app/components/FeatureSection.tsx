import React from 'react';
import { Tag, RotateCcw, Truck } from 'lucide-react';

const FeatureCards = () => {
  const features = [
    {
      icon: <Tag className="h-6 w-6 text-gray-700" />,
      title: 'Best Prices & Deals',
      desc: 'Don’t miss our daily amazing deals and prices',
    },
    {
      icon: <RotateCcw className="h-6 w-6 text-gray-700" />,
      title: 'Refundable',
      desc: 'If your items have damage we agree to refund it',
    },
    {
      icon: <Truck className="mx-2 h-6 w-8 text-gray-700" />,
      title: 'Fast delivery',
      desc: 'Get your order delivered in minutes – fast, fresh, and right at your door!',
    },
  ];

  return (
    <section className="px-4 py-8 sm:px-8 sm:py-8 md:px-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-3">
        {features.map((item, index) => (
          <div key={index} className="flex items-start gap-4 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 sm:h-12 sm:w-12">
              {item.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 sm:text-base">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;
