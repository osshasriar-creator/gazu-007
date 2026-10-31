import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { type Product } from '../data/products';
import { formatCurrency } from '../utils/cartRules';
import { siteConfig } from '../config/siteConfig';
import { ResponsiveProductImage } from './ResponsiveProductImage';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setQuickViewProduct, products } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchTerm('');
    }
  }, [isSearchOpen]);

  const popularKeywords = ['Overshirt', 'Tee', 'Trench Coat', 'Linen', 'Trouser', 'Kids', 'Fragrance'];

  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tag?.toLowerCase().includes(q)
    );
  }, [searchTerm, products]);

  if (!isSearchOpen) return null;

  const handleSelectProduct = (product: Product) => {
    setIsSearchOpen(false);
    setQuickViewProduct(product);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search catalog"
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Search Container */}
      <div className="relative min-h-screen sm:min-h-0 sm:mt-16 max-w-3xl mx-auto bg-[#f2f1ed] border border-neutral-300 shadow-2xl z-10 animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-neutral-300 flex items-center gap-3 bg-[#ecebe6]">
          <Search className="w-5 h-5 text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name, category, or style..."
            className="flex-1 bg-transparent text-sm sm:text-base text-neutral-900 placeholder-neutral-500 font-medium focus:outline-none"
            aria-label="Search input"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="p-1 text-neutral-500 hover:text-black"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="text-xs uppercase tracking-widest font-semibold text-neutral-600 hover:text-black pl-2 sm:pl-4 border-l border-neutral-300"
          >
            ESC / Close
          </button>
        </div>

        {/* Popular keywords */}
        {!searchTerm && (
          <div className="p-6">
            <p className="text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-3">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {popularKeywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setSearchTerm(kw)}
                  className="px-3.5 py-1.5 text-xs bg-neutral-200/80 hover:bg-black hover:text-white text-neutral-800 transition-colors cursor-pointer"
                >
                  {kw}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-300">
              <p className="text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-4">
                Featured Highlights
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {products.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className="group cursor-pointer bg-white/60 p-2 border border-neutral-300/60 hover:border-black transition-all"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-neutral-200 mb-2">
                      <ResponsiveProductImage
                        src={p.primaryImage}
                        alt={p.name}
                        variant="search"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-semibold text-neutral-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-neutral-600 font-bold mt-0.5">
                      {formatCurrency(p.salePrice || p.price, siteConfig.currency.symbol)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchTerm && (
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
              <p className="text-xs text-neutral-600">
                Found <strong className="text-neutral-900 font-semibold">{searchResults.length}</strong> {searchResults.length === 1 ? 'item' : 'items'} for &quot;{searchTerm}&quot;
              </p>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm font-semibold tracking-wider uppercase text-neutral-800">
                  No products found
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Try checking your spelling or search for broader keywords like &quot;shirt&quot;, &quot;black&quot;, or &quot;coat&quot;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="flex items-center space-x-3 p-2.5 bg-white/80 hover:bg-white border border-neutral-300/80 hover:border-black transition-all cursor-pointer group"
                  >
                    <div className="w-16 h-20 bg-neutral-200 shrink-0 overflow-hidden">
                      <ResponsiveProductImage
                        src={product.primaryImage}
                        alt={product.name}
                        variant="thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] tracking-wider uppercase text-neutral-500">
                        {product.category} • {product.subcategory}
                      </p>
                      <h4 className="text-xs font-semibold text-neutral-900 truncate group-hover:text-neutral-700">
                        {product.name}
                      </h4>
                      <p className="text-xs font-bold text-neutral-900 mt-1">
                        {formatCurrency(product.salePrice || product.price, siteConfig.currency.symbol)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
