import React from 'react';
import { X, Heart, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { type Product } from '../data/products';
import { formatCurrency } from '../utils/cartRules';
import { siteConfig } from '../config/siteConfig';
import { ResponsiveProductImage } from './ResponsiveProductImage';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    toggleWishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    addToCart,
    setQuickViewProduct,
    products,
  } = useStore();

  if (!isWishlistOpen) return null;

  const currencySymbol = siteConfig.currency.symbol;
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleMoveToBag = (product: Product) => {
    addToCart(product, product.sizes[0] || 'M', product.colors[0]?.name || 'Standard', 1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wishlist Drawer"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#f2f1ed] border-l border-neutral-300 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-neutral-300 flex items-center justify-between bg-[#ecebe6]">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-neutral-800 fill-black" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight uppercase font-display text-neutral-950">
                Saved Items ({wishlistedProducts.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsWishlistOpen(false)}
              aria-label="Close wishlist"
              className="p-1.5 text-neutral-600 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {wishlistedProducts.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <Heart className="w-12 h-12 text-neutral-400 stroke-[1.2] mb-3" />
                <p className="text-sm font-semibold tracking-wider uppercase text-neutral-800">
                  Your wishlist is empty
                </p>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Tap the heart icon on any product to save your favorite wardrobe staples here.
                </p>
                <button
                  type="button"
                  onClick={() => setIsWishlistOpen(false)}
                  className="mt-6 bg-black text-white px-6 py-2.5 text-xs tracking-widest uppercase font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              wishlistedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex space-x-4 p-3 bg-white/70 border border-neutral-300/80 transition-all"
                >
                  <div
                    className="w-20 h-24 bg-neutral-200 overflow-hidden shrink-0 cursor-pointer"
                    onClick={() => {
                      setQuickViewProduct(product);
                      setIsWishlistOpen(false);
                    }}
                  >
                    <ResponsiveProductImage
                      src={product.primaryImage}
                      alt={product.name}
                      variant="thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4
                          onClick={() => {
                            setQuickViewProduct(product);
                            setIsWishlistOpen(false);
                          }}
                          className="text-xs font-semibold text-neutral-900 truncate hover:text-neutral-600 cursor-pointer"
                        >
                          {product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          aria-label={`Remove ${product.name} from wishlist`}
                          className="text-neutral-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {product.category} • {product.subcategory}
                      </div>

                      <div className="mt-1 text-xs font-bold text-neutral-950">
                        {formatCurrency(product.salePrice || product.price, currencySymbol)}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleMoveToBag(product)}
                        className="w-full bg-black text-white py-1.5 px-3 text-[11px] tracking-wider uppercase font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Move to Bag</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {wishlistedProducts.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-neutral-300 bg-[#ecebe6]">
              <button
                type="button"
                onClick={() => {
                  wishlistedProducts.forEach((p) => handleMoveToBag(p));
                }}
                className="w-full bg-neutral-900 text-white py-3 text-xs tracking-widest uppercase font-semibold hover:bg-black transition-colors"
              >
                Move All to Bag
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
