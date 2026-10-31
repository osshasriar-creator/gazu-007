import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { siteConfig, FALLBACK_IMAGE } from '../config/siteConfig';

interface HeroSectionProps {
  onExplore: (category?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore }) => {
  const { setActiveCategory, siteSettings } = useStore();
  const currentHero = siteSettings?.hero || siteConfig.hero;
  const [modelImg, setModelImg] = useState(
    currentHero.modelImage || '/assets/model/male-model-transparent-clean.png'
  );

  React.useEffect(() => {
    if (currentHero.modelImage) {
      setModelImg(currentHero.modelImage);
    }
  }, [currentHero.modelImage]);

  const handleShopNow = () => {
    setActiveCategory('All');
    onExplore('All');
  };

  const handleExploreNewIn = () => {
    setActiveCategory('New In');
    onExplore('New In');
  };

  return (
    <section
      aria-label="Hero Collection"
      className="relative bg-[#ebeae5] overflow-hidden min-h-[580px] sm:min-h-[660px] lg:min-h-[740px] flex flex-col justify-between border-b border-neutral-300 select-none"
    >
      {/* 1. Top Editorial Motto */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 z-20 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <p className="text-[11px] sm:text-[13px] tracking-[0.28em] uppercase text-neutral-800 font-semibold leading-relaxed whitespace-pre-line">
            {currentHero.tagline || 'FASHION\nTHAT MOVES\nWITH YOU.'}
          </p>
          <div className="w-12 h-[1.5px] bg-neutral-900 mt-2.5" />
        </div>
      </div>

      {/* 2. Centerpiece: Giant Typographic GAZU Lettering + Background-Removed B&W Male Model */}
      <div className="relative w-full flex-1 flex items-center justify-center my-[-20px] sm:my-[-30px] lg:my-[-40px]">
        {/* Giant GAZU Typographic Watermark (Pure Live Text) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        >
          <span className="text-[25vw] sm:text-[23vw] lg:text-[21vw] font-black tracking-[-0.04em] text-neutral-900 font-display leading-none transform -translate-y-2 sm:-translate-y-4 opacity-95">
            {currentHero.brandWatermark || 'GAZU'}
          </span>
        </div>

        {/* Background-Removed Black & White Fashion Male Model (Transparent Cutout) */}
        <div className="relative z-10 w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[620px] h-[460px] sm:h-[550px] lg:h-[640px] mx-auto flex items-end justify-center pointer-events-none">
          <img
            src={modelImg}
            alt="GAZU Editorial Model"
            className="h-full w-auto max-w-none object-contain object-bottom drop-shadow-[0_25px_30px_rgba(0,0,0,0.35)] select-none transition-all duration-700"
            loading="eager"
            onError={() => setModelImg(FALLBACK_IMAGE)}
          />
        </div>
      </div>

      {/* 3. Bottom Actions & Collection Year Stamp */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 z-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        {/* Interactive Action Buttons */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <button
            type="button"
            onClick={handleShopNow}
            aria-label="Shop Now — Explore All Collections"
            className="bg-black text-white px-7 sm:px-9 py-3.5 text-xs sm:text-[13px] tracking-[0.2em] uppercase font-bold hover:bg-neutral-800 transition-all cursor-pointer shadow-md active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          >
            {currentHero.ctaPrimary || 'SHOP NOW'}
          </button>

          <button
            type="button"
            onClick={handleExploreNewIn}
            aria-label="Explore New In arrivals"
            className="text-xs sm:text-[13px] tracking-[0.2em] uppercase font-semibold text-neutral-900 hover:text-black border-b-2 border-black pb-1 hover:border-neutral-500 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
          >
            {currentHero.ctaSecondary || 'EXPLORE NEW IN'}
          </button>
        </div>

        {/* Collection Year Stamp */}
        <div className="text-left sm:text-right">
          <p className="text-[11px] sm:text-xs tracking-[0.25em] uppercase text-neutral-800 font-semibold leading-relaxed whitespace-pre-line">
            {currentHero.collectionStamp || 'NEW\nCOLLECTION\n2024'}
          </p>
          <div className="w-10 h-[1.5px] bg-neutral-900 mt-2 sm:ml-auto" />
        </div>
      </div>
    </section>
  );
};
