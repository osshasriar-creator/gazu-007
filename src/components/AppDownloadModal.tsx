import React from 'react';
import { X, Smartphone, QrCode, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { siteConfig } from '../config/siteConfig';

export const AppDownloadModal: React.FC = () => {
  const { isAppDownloadOpen, setIsAppDownloadOpen } = useStore();

  if (!isAppDownloadOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Download GAZU Mobile App"
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsAppDownloadOpen(false)}
      />

      <div className="relative min-h-screen sm:min-h-0 sm:my-16 max-w-md mx-auto bg-[#f2f1ed] border border-neutral-300 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-neutral-300 flex items-center justify-between bg-[#ecebe6]">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-bold tracking-tight uppercase font-display text-neutral-950">
              Download {siteConfig.brandName} App
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAppDownloadOpen(false)}
            aria-label="Close dialog"
            className="p-1.5 text-neutral-600 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 text-center space-y-6">
          <div className="inline-block p-4 bg-white border border-neutral-300 shadow-sm">
            <QrCode className="w-36 h-36 mx-auto text-neutral-900" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mt-2">
              Scan to install GAZU App
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-neutral-900 font-display">
              Elevate Your Mobile Shopping
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-xs mx-auto leading-relaxed">
              Unlock exclusive app-only drops, early access to new seasonal collections, and 1-tap express checkout.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-300 p-3 text-xs text-emerald-800 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Use code <strong>APP10</strong> for 10% off your first mobile order!</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              className="py-2.5 px-3 bg-black text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              App Store (iOS)
            </button>
            <button
              type="button"
              className="py-2.5 px-3 bg-black text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              Google Play (Android)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
