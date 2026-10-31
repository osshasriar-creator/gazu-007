import React from 'react';
import { useStore } from '../context/StoreContext';
import { siteConfig } from '../config/siteConfig';
import { ResponsiveProductImage } from './ResponsiveProductImage';

interface CampaignBannerProps {
  onExplore: () => void;
}

export const CampaignBanner: React.FC<CampaignBannerProps> = ({ onExplore }) => {
  const { setActiveCategory, siteSettings } = useStore();
  const currentCampaign = siteSettings?.campaign || siteConfig.campaign;
  const imgSrc =
    currentCampaign.modelImage ||
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=85';

  const handleExplore = () => {
    setActiveCategory('New In');
    onExplore();
  };

  return (
    <section aria-label="Seasonal Campaign" className="relative bg-[#cfcec9] border-b border-neutral-300 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 min-h-[420px] sm:min-h-[520px]">
        {/* Left Copy Column */}
        <div className="md:col-span-6 px-4 sm:px-12 lg:px-16 py-8 sm:py-20 flex flex-col justify-center items-start z-10 min-w-0">
          <span className="text-[11px] sm:text-xs tracking-[0.26em] sm:tracking-[0.3em] uppercase text-neutral-700 font-semibold mb-2.5 sm:mb-3">
            {currentCampaign.badge}
          </span>

          <h2 className="text-[clamp(2.35rem,9vw,3.75rem)] sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] uppercase text-neutral-950 font-display leading-[0.94] mb-3.5 sm:mb-4 whitespace-pre-line text-balance max-w-full">
            {currentCampaign.title || 'NEW\nVIBES'}
          </h2>

          <p className="text-sm sm:text-base text-neutral-700 font-light max-w-sm mb-6 sm:mb-8 leading-relaxed">
            {currentCampaign.description}
          </p>

          <button
            type="button"
            onClick={handleExplore}
            className="min-h-[44px] bg-black text-white px-7 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-[13px] tracking-[0.2em] uppercase font-bold hover:bg-neutral-800 transition-all cursor-pointer shadow-md active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black flex items-center justify-center"
          >
            {currentCampaign.ctaButton}
          </button>
        </div>

        {/* Right Model Portrait */}
        <div className="md:col-span-6 relative h-[280px] sm:h-[360px] md:h-auto md:min-h-[520px] flex items-end justify-center overflow-hidden">
          <ResponsiveProductImage
            src={imgSrc}
            alt="GAZU New Vibes Seasonal Editorial Campaign"
            variant="banner"
            className="w-full h-full object-cover object-top grayscale contrast-115"
          />
          {/* Subtle gradient overlay to merge into left background on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#cfcec9]/50 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

