import React, { useState } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
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
    user,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = ['MEN', 'WOMEN', 'KIDS', 'BEAUTY'];

  const handleCategoryClick = (cat: string) => {
    // Map to title case
    const normalized = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
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
    <header className="sticky top-0 z-30 bg-[#f2f1ed]/95 backdrop-blur-md border-b border-neutral-300/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
            className="p-2 -ml-2 text-neutral-800 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
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
        <div className="flex-1 lg:flex-initial text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveCategory('All');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-block text-2xl sm:text-3xl font-extrabold tracking-[-0.04em] text-neutral-950 font-display select-none hover:opacity-90 transition-opacity"
            aria-label="GAZU Homepage"
          >
            {siteConfig.brandName}
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* Search */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Open search"
            className="flex items-center space-x-1.5 text-neutral-700 hover:text-black transition-colors py-1 px-1 cursor-pointer group"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
            <span className="hidden sm:inline text-xs tracking-widest uppercase font-medium group-hover:text-black">
              Search
            </span>
          </button>

          {/* User / Login */}
          <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            aria-label={user ? `Account: ${user.name}` : 'Login or register'}
            className="flex items-center space-x-1.5 text-neutral-700 hover:text-black transition-colors py-1 px-1 cursor-pointer group"
          >
            <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
            <span className="hidden sm:inline text-xs tracking-widest uppercase font-medium group-hover:text-black">
              {user ? user.name.split(' ')[0] : 'Login'}
            </span>
          </button>

          {/* Wishlist */}
          <button
            type="button"
            onClick={() => setIsWishlistOpen(true)}
            aria-label={`Wishlist, ${wishlistCount} items`}
            className="flex items-center space-x-1.5 text-neutral-700 hover:text-black transition-colors py-1 px-1 cursor-pointer group relative"
          >
            <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
            <span className="hidden sm:inline text-xs tracking-widest uppercase font-medium group-hover:text-black">
              Wishlist
            </span>
            {wishlistCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-black rounded-full">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Shopping Cart, ${cartCount} items`}
            className="flex items-center space-x-1.5 text-neutral-900 hover:text-black transition-colors py-1 px-1 cursor-pointer font-medium group"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
            <span className="text-xs tracking-widest uppercase font-semibold">
              Cart ({cartCount})
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#f2f1ed] p-6 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-neutral-300">
                <span className="text-xl font-extrabold tracking-tight font-display">
                  {siteConfig.brandName}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 text-neutral-600 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-4">
                <p className="text-[11px] tracking-widest uppercase text-neutral-400 font-semibold">
                  Categories
                </p>
                <div className="flex flex-col space-y-3">
                  {['All', ...categories].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleCategoryClick(item === 'All' ? 'All' : item)}
                      className="text-left text-base tracking-widest uppercase font-medium hover:text-black text-neutral-700 py-1"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-300 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsTrackOrderOpen(true);
                  }}
                  className="w-full text-left text-xs tracking-widest uppercase text-neutral-600 hover:text-black py-2"
                >
                  Track Order
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsHelpOpen(true);
                  }}
                  className="w-full text-left text-xs tracking-widest uppercase text-neutral-600 hover:text-black py-2"
                >
                  Help & FAQs
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-300 text-xs text-neutral-500">
              <p>Currency: {siteConfig.currency.code} ({siteConfig.currency.symbol})</p>
              <p className="mt-1">Free delivery above {siteConfig.currency.symbol}{siteConfig.shipping.freeThreshold}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
