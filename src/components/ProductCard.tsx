import React, { useState } from 'react';
import { Heart, Eye, Check, Plus } from 'lucide-react';
import { type Product } from '../data/products';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/cartRules';
import { siteConfig } from '../config/siteConfig';
import { ResponsiveProductImage } from './ResponsiveProductImage';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || 'Standard');
  const [showQuickSizes, setShowQuickSizes] = useState(false);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const currencySymbol = siteConfig.currency.symbol;

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.stopPropagation();
    setSelectedSize(size);
    addToCart(product, size, selectedColor, 1);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1800);
  };

  return (
    <div
      className="group relative flex flex-col min-w-0 bg-[#ecebe6] border border-neutral-300/80 transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setShowQuickSizes(true)}
      onMouseLeave={() => setShowQuickSizes(false)}
    >
      {/* Product Image Area (3:4 ratio) */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-200 cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <ResponsiveProductImage
          src={product.primaryImage}
          alt={product.name}
          variant="card"
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isFavorited ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-neutral-800 hover:text-black hover:bg-white transition-all shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-black cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited ? 'fill-red-600 text-red-600' : 'text-neutral-700'
            }`}
          />
        </button>

        {/* Badge (New / Sale / Tag) */}
        {product.tag && (
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 bg-black text-white text-[9px] tracking-widest uppercase font-semibold px-2 py-0.5 shadow-sm max-w-[calc(100%-3.5rem)] truncate">
            {product.tag}
          </span>
        )}

        {/* Mobile Quick Add Toggle Button (visible on touch screens where hover isn't available) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowQuickSizes((prev) => !prev);
          }}
          aria-label={`Quick add ${product.name}`}
          className="sm:hidden absolute bottom-2.5 right-2.5 z-10 w-9 h-9 rounded-full bg-black/85 text-white flex items-center justify-center shadow-md active:scale-95"
        >
          {isAddedRecently ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
        </button>

        {/* Quick View Button (desktop hover overlay) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          aria-label={`Quick view ${product.name}`}
          className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/85 text-white px-3.5 py-2 text-[11px] tracking-widest uppercase font-medium backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center space-x-1.5 shadow-md hover:bg-black cursor-pointer whitespace-nowrap"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View</span>
        </button>

        {/* Quick Size Bar (Slide up on desktop hover or mobile tap) */}
        <div
          className={`absolute bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur-xs p-2 transition-transform duration-300 ease-in-out border-t border-neutral-200 ${
            showQuickSizes ? 'translate-y-0' : 'translate-y-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between text-[10px] tracking-wider uppercase font-semibold text-neutral-500 mb-1.5">
            <span>Quick Add Size:</span>
            {isAddedRecently && (
              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                <Check className="w-3 h-3" /> Added
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={(e) => handleQuickAdd(e, sz)}
                className="flex-1 min-w-[30px] h-8 sm:h-7 text-[11px] font-semibold border border-neutral-300 hover:border-black hover:bg-black hover:text-white active:bg-black active:text-white transition-colors flex items-center justify-center cursor-pointer"
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between min-w-0">
        <div className="min-w-0">
          {/* Subcategory & Category */}
          <div className="flex items-center justify-between gap-1 text-[10px] tracking-widest uppercase text-neutral-500 mb-1 min-w-0">
            <span className="truncate">{product.subcategory}</span>
            <span className="font-medium text-neutral-700 shrink-0">{product.category}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-1 hover:text-neutral-600 cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          {/* Color swatches */}
          <div className="flex items-center flex-wrap gap-1.5 mt-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(c.name);
                }}
                className="p-1 -m-1 flex items-center justify-center cursor-pointer"
                aria-label={`Select color ${c.name}`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border transition-all block ${
                    selectedColor === c.name
                      ? 'ring-1 ring-black ring-offset-1 scale-110 border-black'
                      : 'border-neutral-400 opacity-80'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-3 pt-2.5 border-t border-neutral-300/60 flex items-baseline justify-between gap-1 flex-wrap">
          <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5 min-w-0">
            {product.salePrice ? (
              <>
                <span className="text-xs sm:text-sm font-bold text-neutral-950">
                  {formatCurrency(product.salePrice, currencySymbol)}
                </span>
                <span className="text-[10px] sm:text-[11px] text-neutral-500 line-through">
                  {formatCurrency(product.price, currencySymbol)}
                </span>
              </>
            ) : (
              <span className="text-xs sm:text-sm font-bold text-neutral-950">
                {formatCurrency(product.price, currencySymbol)}
              </span>
            )}
          </div>

          <span className="text-[10px] tracking-wider uppercase text-neutral-500 font-medium shrink-0">
            {product.sizes.length} sizes
          </span>
        </div>
      </div>
    </div>
  );
};

