import React, { useState } from 'react';
import { ArrowRight, Check, Instagram, Facebook, Twitter, Globe } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { validateEmail } from '../utils/cartRules';
import { siteConfig } from '../config/siteConfig';

interface FooterProps {
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToAdmin }) => {
  const {
    setActiveCategory,
    setIsHelpOpen,
    setIsTrackOrderOpen,
    setIsAppDownloadOpen,
    setIsEnvModalOpen,
    envValidation,
  } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(newsletterEmail)) {
      setNewsletterStatus('error');
      setNewsletterMessage('Please enter a valid email address.');
      return;
    }

    setNewsletterStatus('success');
    setNewsletterMessage('Thank you! You are now subscribed to the GAZU editorial newsletter.');
    setNewsletterEmail('');
  };

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer aria-label="Store Footer" className="bg-[#0e0e0e] text-white pt-10 pb-8 sm:pt-16 sm:pb-12 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 pb-10 sm:pb-16 border-b border-neutral-800">
          {/* Brand & Newsletter Column */}
          <div className="md:col-span-5 space-y-3 sm:space-y-4 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
              {siteConfig.brandName}
            </h2>
            <p className="text-xs text-neutral-400 font-light max-w-sm leading-relaxed">
              Minimalist modern fashion crafted with intention. Elevated everyday uniforms, architectural silhouettes, and enduring tactile fabrics.
            </p>

            {/* Newsletter Form */}
            <div className="pt-2 sm:pt-4">
              <span className="text-[11px] tracking-[0.2em] uppercase font-bold text-neutral-300 block mb-1.5 sm:mb-2">
                JOIN THE GAZU EDITORIAL CLUB
              </span>
              <p className="text-xs text-neutral-400 mb-3 font-light">
                Receive private previews of new seasonal collections, archival drops, and exclusive community events.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-2 max-w-md">
                <div className="flex w-full min-w-0">
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterStatus !== 'idle') setNewsletterStatus('idle');
                    }}
                    placeholder="Enter your email address"
                    aria-label="Email address for newsletter"
                    className="flex-1 min-w-0 min-h-[44px] bg-neutral-900 border border-neutral-700 px-3 sm:px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                  />
                  <button
                    type="submit"
                    className="min-h-[44px] bg-white text-black px-4 sm:px-5 py-2.5 text-xs uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>JOIN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {newsletterStatus === 'error' && (
                  <p className="text-[11px] text-rose-400 font-medium">{newsletterMessage}</p>
                )}
                {newsletterStatus === 'success' && (
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{newsletterMessage}</span>
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 min-w-0">
            {/* Shop */}
            <div className="min-w-0">
              <h3 className="text-[11px] tracking-[0.2em] uppercase font-bold text-white mb-3 sm:mb-4">
                COLLECTIONS
              </h3>
              <ul className="space-y-2 text-xs text-neutral-400 font-light">
                {['Men', 'Women', 'Kids', 'Beauty', 'New In', 'Best Sellers'].map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => handleCategory(cat)}
                      className="py-1 hover:text-white transition-colors cursor-pointer text-left"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Client Service */}
            <div className="min-w-0">
              <h3 className="text-[11px] tracking-[0.2em] uppercase font-bold text-white mb-3 sm:mb-4">
                CLIENT SERVICE
              </h3>
              <ul className="space-y-2 text-xs text-neutral-400 font-light">
                <li>
                  <button
                    type="button"
                    onClick={() => setIsTrackOrderOpen(true)}
                    className="py-1 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Track Order
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="py-1 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Shipping & Returns
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="py-1 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Help & FAQs
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsAppDownloadOpen(true)}
                    className="py-1 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Download Mobile App
                  </button>
                </li>
                <li>
                  <a
                    href={`mailto:${siteConfig.contact.supportEmail}`}
                    className="py-1 inline-block hover:text-white transition-colors break-words"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* About GAZU */}
            <div className="col-span-2 sm:col-span-1 pt-4 sm:pt-0 border-t border-neutral-800/80 sm:border-0 min-w-0">
              <h3 className="text-[11px] tracking-[0.2em] uppercase font-bold text-white mb-3 sm:mb-4">
                THE BRAND
              </h3>
              <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-0 sm:space-y-2.5 text-xs text-neutral-400 font-light">
                <li className="text-neutral-400">Design Philosophy</li>
                <li className="text-neutral-400">Sustainable Sourcing</li>
                <li className="text-neutral-400">Flagship Stores</li>
                <li className="text-neutral-400">Press & Editorial</li>
                <li className="text-neutral-400">Careers</li>
              </ul>

              <div className="mt-5 sm:mt-6 pt-4 border-t border-neutral-800">
                <span className="text-[10px] tracking-widest uppercase font-bold text-neutral-400 block mb-2.5">
                  CONNECT
                </span>
                <div className="flex space-x-3 text-neutral-400">
                  <a
                    href="#instagram"
                    aria-label="GAZU on Instagram"
                    className="w-9 h-9 rounded-full border border-neutral-800 hover:border-neutral-500 flex items-center justify-center hover:text-white transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="#twitter"
                    aria-label="GAZU on Twitter / X"
                    className="w-9 h-9 rounded-full border border-neutral-800 hover:border-neutral-500 flex items-center justify-center hover:text-white transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="#facebook"
                    aria-label="GAZU on Facebook"
                    className="w-9 h-9 rounded-full border border-neutral-800 hover:border-neutral-500 flex items-center justify-center hover:text-white transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-3 sm:gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} {siteConfig.brandName} Studio Inc. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-2">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>Bangladesh ({siteConfig.currency.code} {siteConfig.currency.symbol})</span>
            </span>
            <span className="hidden min-[380px]:inline">•</span>
            <button
              type="button"
              onClick={() => setIsEnvModalOpen(true)}
              className="py-1 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
              title="Check Environment Variables & Ephemeral Session Config"
            >
              Env Status ({envValidation.presentKeys.length}/4)
            </button>
            {onNavigateToAdmin && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={onNavigateToAdmin}
                  className="py-1 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                  title="Staff & Admin Portal (/admin)"
                >
                  Backend Access
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

