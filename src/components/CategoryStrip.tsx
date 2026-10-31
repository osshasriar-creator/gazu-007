import React from 'react';
import { useStore } from '../context/StoreContext';
import { siteConfig } from '../config/siteConfig';
import { ResponsiveProductImage } from './ResponsiveProductImage';

interface CategoryStripProps {
  onSelectCategory: (category: string) => void;
}

export const CategoryStrip: React.FC<CategoryStripProps> = ({ onSelectCategory }) => {
  const { setActiveCategory, siteSettings } = useStore();
  const currentCategories = siteSettings?.categories || siteConfig.categories;

  const handleClick = (categoryKey: string) => {
    setActiveCategory(categoryKey);
    onSelectCategory(categoryKey);
  };

  return (
    <section aria-label="Featured Categories" className="bg-[#0c0c0c] text-white py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {currentCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleClick(cat.categoryKey)}
              className="group cursor-pointer flex items-center space-x-4 sm:space-x-5 p-3 bg-neutral-900/40 sm:bg-transparent border border-neutral-800/80 sm:border-0 hover:bg-neutral-900/60 transition-colors duration-300 min-w-0"
            >
              {/* Thumbnail image with aspect ratio */}
              <div className="relative w-20 h-28 min-[380px]:w-24 min-[380px]:h-32 sm:w-28 sm:h-36 overflow-hidden bg-neutral-900 shrink-0">
                <ResponsiveProductImage
                  src={cat.image}
                  alt={cat.name}
                  variant="search"
                  width={224}
                  height={288}
                  className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Text info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base tracking-[0.18em] sm:tracking-[0.2em] font-bold uppercase text-white font-display truncate">
                  {cat.name}
                </h3>
                <p className="mt-1 sm:mt-1.5 text-xs text-neutral-400 font-light leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
                <button
                  type="button"
                  className="mt-2.5 sm:mt-3 min-h-[32px] inline-flex items-center text-[11px] sm:text-xs tracking-widest uppercase font-semibold text-neutral-300 group-hover:text-white group-hover:translate-x-1 transition-all"
                >
                  {cat.ctaText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

