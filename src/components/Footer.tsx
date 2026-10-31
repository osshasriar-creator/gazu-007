import React, { useState } from 'react';
import { ArrowRight, Check, Instagram, Facebook, Twitter, Globe } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { validateEmail } from '../utils/cartRules';
import { siteConfig } from '../config/siteConfig';

interface FooterProps {
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToAdmin }) => {
  const { setActiveCategory, setIsHelpOpen, setIsTrackOrderOpen, setIsAppDownloadOpen } = useStore();
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
    <footer aria-label="Store Footer" className="bg-[#0e0e0e] text-white pt-16 pb-12 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-16 border-b border-neutral-800">
          {/* Brand & Newsletter Column */}
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
              {siteConfig.brandName}
            </h2>
            <p className="text-xs text-neutral-400 font-light max-w-sm leading-relaxed">
              Minimalist modern fashion crafted with intention. Elevated everyday uniforms, architectural silhouettes, and enduring tactile fabrics.
            </p>

            {/* Newsletter Form */}
            <div className="pt-4">
              <span className="text-[11px] tracking-[0.2em] uppercase font-bold text-neutral-300 block mb-2">
                JOIN THE GAZU EDITORIAL CLUB
              </span>
              <p className="text-xs text-neutral-400 mb-3 font-light">
                Receive private previews of new seasonal collections, archival drops, and exclusive community events.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterStatus !== 'idle') setNewsletterStatus('idle');
                    }}
                    placeholder="Enter your email address"
                    className="flex-1 bg-neutral-900 border border-neutral-700 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-white text-black px-5 py-2.5 text-xs uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
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
                    <Check className="w-3.5 h-3.5" />
                    {newsletterMessage}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Shop */}
            <div>
              <h3 className="text-[11px] tracking-[0.2em] uppercase font-bold text-white mb-4">
                COLLECTIONS
              </h3>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
                {['Men', 'Women', 'Kids', 'Beauty', 'New In', 'Best Sellers'].map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => handleCategory(cat)}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Client Service */}
            <div>
              <h3 className="text-[11px] tracking-[0.2em] uppercase font-bold text-white mb-4">
                CLIENT SERVICE
              </h3>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
                <li>
                  <button
                    type="button"
                    onClick={() => setIsTrackOrderOpen(true)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Track Order
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Shipping & Returns
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Help & FAQs
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsAppDownloadOpen(true)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Download Mobile App
                  </button>
                </li>
                <li>
                  <a href={`mailto:${siteConfig.contact.supportEmail}`} className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* About GAZU */}
            <div>
              <h3 className="text-[11px] tracking-[0.2em] uppercase font-bold text-white mb-4">
                THE BRAND
              </h3>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
                <li className="text-neutral-400">Design Philosophy</li>
                <li className="text-neutral-400">Sustainable Sourcing</li>
                <li className="text-neutral-400">Flagship Stores</li>
                <li className="text-neutral-400">Press & Editorial</li>
                <li className="text-neutral-400">Careers</li>
              </ul>

              <div className="mt-6 pt-4 border-t border-neutral-800">
                <span className="text-[10px] tracking-widest uppercase font-bold text-neutral-400 block mb-2">
                  CONNECT
                </span>
                <div className="flex space-x-3 text-neutral-400">
                  <a href="#instagram" aria-label="GAZU on Instagram" className="hover:text-white transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="#twitter" aria-label="GAZU on Twitter / X" className="hover:text-white transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#facebook" aria-label="GAZU on Facebook" className="hover:text-white transition-colors">
                    <Facebook className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} {siteConfig.brandName} Studio Inc. All rights reserved.</p>

          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Globe className="w-3.5 h-3.5" />
              <span>Bangladesh ({siteConfig.currency.code} {siteConfig.currency.symbol})</span>
            </span>
            <span>•</span>
            <span className="text-neutral-400">Cloudflare Pages Ready</span>
            {onNavigateToAdmin && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={onNavigateToAdmin}
                  className="text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
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
