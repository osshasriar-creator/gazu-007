import React, { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { siteConfig } from '../config/siteConfig';

interface HeaderProps {
  onScrollToCatalog?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onScrollToCatalog }) => {
  const {
    activeCategory,
    setActiveCategory,
    cartCount,
    wishlistCount,
    setIsSearchOpen,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsAuthOpen,
    setIsTrackOrderOpen,
    setIsHelpOpen,
    setIsAppDownloadOpen,
    user,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = ['MEN', 'WOMEN', 'KIDS', 'BEAUTY'];

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleCategoryClick = (cat: string) => {
    const normalized =
      cat === 'All' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
    setActiveCategory(normalized);
    setMobileMenuOpen(false);
    if (onScrollToCatalog) {
      onScrollToCatalog();
    } else {
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#f2f1ed]/95 backdrop-blur-md border-b border-neutral-300/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between gap-2">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              className="min-w-[44px] min-h-[44px] -ml-1.5 flex items-center justify-center text-neutral-800 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-black cursor-pointer"
            >
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>
          </div>

          {/* Desktop Left Navigation */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center space-x-8">
            {categories.map((cat) => {
              const isCurrent = activeCategory.toUpperCase() === cat.toUpperCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`text-[13px] tracking-[0.2em] font-medium transition-colors uppercase relative py-1 cursor-pointer ${
                    isCurrent ? 'text-black font-semibold' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  {cat}
                  {isCurrent && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-black transition-all" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Center Brand Wordmark */}
          <div className="flex-1 lg:flex-initial text-left sm:text-center min-w-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveCategory('All');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-block text-xl min-[360px]:text-2xl sm:text-3xl font-extrabold tracking-[-0.04em] text-neutral-950 font-display select-none hover:opacity-90 transition-opacity truncate"
              aria-label="GAZU Homepage"
            >
              {siteConfig.brandName}
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-0.5 min-[380px]:space-x-1.5 sm:space-x-6 shrink-0">
            {/* Search */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search"
              className="min-w-[40px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center sm:space-x-1.5 text-neutral-700 hover:text-black transition-colors py-1 px-1.5 sm:px-1 cursor-pointer group"
            >
              <Search className="w-[18px] h-[18px] sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
              <span className="hidden sm:inline text-xs tracking-widest uppercase font-medium group-hover:text-black">
                Search
              </span>
            </button>

            {/* User / Login */}
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              aria-label={user ? `Account: ${user.name}` : 'Login or register'}
              className="min-w-[40px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center sm:space-x-1.5 text-neutral-700 hover:text-black transition-colors py-1 px-1.5 sm:px-1 cursor-pointer group"
            >
              <User className="w-[18px] h-[18px] sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
              <span className="hidden sm:inline text-xs tracking-widest uppercase font-medium group-hover:text-black">
                {user ? user.name.split(' ')[0] : 'Login'}
              </span>
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              aria-label={`Wishlist, ${wishlistCount} items`}
              className="min-w-[40px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center sm:space-x-1.5 text-neutral-700 hover:text-black transition-colors py-1 px-1.5 sm:px-1 cursor-pointer group relative"
            >
              <Heart className="w-[18px] h-[18px] sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
              <span className="hidden sm:inline text-xs tracking-widest uppercase font-medium group-hover:text-black">
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-0.5 sm:static inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-black rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Shopping Cart, ${cartCount} items`}
              className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center space-x-1 sm:space-x-1.5 text-neutral-900 hover:text-black transition-colors py-1 px-1.5 sm:px-1 cursor-pointer font-medium group relative"
            >
              <ShoppingBag className="w-[18px] h-[18px] sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
              <span className="hidden sm:inline text-xs tracking-widest uppercase font-semibold">
                Cart ({cartCount})
              </span>
              <span className="sm:hidden inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-black rounded-full">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer (rendered outside sticky header so backdrop-filter does not clip fixed height) */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="fixed inset-0 z-50 lg:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 left-0 w-[86vw] max-w-xs h-svh bg-[#f2f1ed] p-5 sm:p-6 shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-300">
                <span className="text-xl font-extrabold tracking-tight font-display">
                  {siteConfig.brandName}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-neutral-600 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-5 space-y-2">
                <p className="text-[11px] tracking-widest uppercase text-neutral-400 font-semibold mb-2">
                  Collections
                </p>
                <div className="flex flex-col divide-y divide-neutral-200/80">
                  {['All', ...categories, 'New In', 'Best Sellers'].map((item) => {
                    const isCurrent = activeCategory.toUpperCase() === item.toUpperCase();
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleCategoryClick(item)}
                        className={`min-h-[44px] flex items-center justify-between text-left text-sm tracking-[0.18em] uppercase transition-colors cursor-pointer ${
                          isCurrent ? 'text-black font-bold' : 'text-neutral-700 font-medium hover:text-black'
                        }`}
                      >
                        <span>{item === 'All' ? 'Shop All' : item}</span>
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-300 space-y-1">
                <p className="text-[11px] tracking-widest uppercase text-neutral-400 font-semibold mb-2">
                  Quick Access
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="w-full min-h-[44px] flex items-center gap-3 text-left text-xs tracking-widest uppercase text-neutral-700 hover:text-black font-medium cursor-pointer"
                >
                  <Search className="w-4 h-4 text-neutral-500" />
                  <span>Search Catalog</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full min-h-[44px] flex items-center gap-3 text-left text-xs tracking-widest uppercase text-neutral-700 hover:text-black font-medium cursor-pointer"
                >
                  <User className="w-4 h-4 text-neutral-500" />
                  <span>{user ? `Account (${user.name.split(' ')[0]})` : 'Sign In / Register'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsTrackOrderOpen(true);
                  }}
                  className="w-full min-h-[44px] flex items-center text-left text-xs tracking-widest uppercase text-neutral-600 hover:text-black font-medium cursor-pointer"
                >
                  Track Order
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsHelpOpen(true);
                  }}
                  className="w-full min-h-[44px] flex items-center text-left text-xs tracking-widest uppercase text-neutral-600 hover:text-black font-medium cursor-pointer"
                >
                  Help & FAQs
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAppDownloadOpen(true);
                  }}
                  className="w-full min-h-[44px] flex items-center text-left text-xs tracking-widest uppercase text-neutral-600 hover:text-black font-medium cursor-pointer"
                >
                  Download Mobile App
                </button>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-neutral-300 text-xs text-neutral-500">
              <p>Currency: {siteConfig.currency.code} ({siteConfig.currency.symbol})</p>
              <p className="mt-1">Free delivery above {siteConfig.currency.symbol}{siteConfig.shipping.freeThreshold}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

