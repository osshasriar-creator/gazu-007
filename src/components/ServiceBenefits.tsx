import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Lock } from 'lucide-react';

export const ServiceBenefits: React.FC = () => {
  const benefits = [
    {
      icon: Truck,
      title: 'FAST DELIVERY',
      subtitle: 'Quick & safe delivery',
    },
    {
      icon: RotateCcw,
      title: 'EASY RETURNS',
      subtitle: 'Within 15 days',
    },
    {
      icon: ShieldCheck,
      title: 'QUALITY ASSURED',
      subtitle: 'Best fashion, best quality',
    },
    {
      icon: Lock,
      title: 'SECURE PAYMENT',
      subtitle: '100% secure checkout',
    },
  ];

  return (
    <section aria-label="Store Benefits" className="bg-[#e7e6e1] border-b border-neutral-300 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center space-x-3.5 sm:space-x-4 p-2 transition-transform hover:-translate-y-0.5 duration-200"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-none border border-neutral-400/80 flex items-center justify-center shrink-0 text-neutral-900 bg-[#ebeae5]">
                  <Icon className="w-5 h-5 stroke-[1.4]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-xs tracking-[0.16em] uppercase font-bold text-neutral-900 font-sans truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-neutral-600 font-light truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
