import React, { useState } from 'react';
import { X, Heart, Star, Shield, ArrowRight, Check, HelpCircle } from 'lucide-react';
import { type Product } from '../data/products';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/cartRules';
import { siteConfig } from '../config/siteConfig';
import { ResponsiveProductImage } from './ResponsiveProductImage';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, isInWishlist, toggleWishlist, setIsCartOpen } = useStore();
  const [selectedImage, setSelectedImage] = useState<string>(product.primaryImage);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || 'Standard');
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const isFavorited = isInWishlist(product.id);
  const currencySymbol = siteConfig.currency.symbol;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      setIsCartOpen(true);
      onClose();
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#f2f1ed] border border-neutral-300 shadow-2xl z-10 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-black hover:text-white flex items-center justify-center text-neutral-800 transition-colors shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 bg-neutral-200 p-4 sm:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-300">
            {/* Main Image */}
            <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden bg-neutral-300 shadow-sm">
              <ResponsiveProductImage
                src={selectedImage}
                alt={product.name}
                variant="detail"
                className="w-full h-full object-cover object-top"
              />
              {product.tag && (
                <span className="absolute top-3 left-3 bg-black text-white text-[9px] tracking-widest uppercase font-semibold px-2 py-0.5">
                  {product.tag}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.galleryImages.length > 1 && (
              <div className="flex items-center space-x-2 mt-4 overflow-x-auto no-scrollbar">
                {product.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-18 overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImage === img ? 'border-black scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ResponsiveProductImage
                      src={img}
                      alt={`${product.name} angle ${idx + 1}`}
                      variant="thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Specs & Actions */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-[11px] tracking-widest uppercase text-neutral-500 font-semibold mb-2">
                <span>{product.category} / {product.subcategory}</span>
                <div className="flex items-center space-x-1 text-neutral-800">
                  <Star className="w-3.5 h-3.5 fill-black text-black" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-neutral-500">({product.reviewCount})</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 font-display">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline space-x-3 mt-3">
                {product.salePrice ? (
                  <>
                    <span className="text-xl font-extrabold text-neutral-950">
                      {formatCurrency(product.salePrice, currencySymbol)}
                    </span>
                    <span className="text-sm text-neutral-500 line-through">
                      {formatCurrency(product.price, currencySymbol)}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5">
                      Save {formatCurrency(product.price - product.salePrice, currencySymbol)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-extrabold text-neutral-950">
                    {formatCurrency(product.price, currencySymbol)}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-[13px] text-neutral-600 font-light mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Color Selection */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-neutral-500 tracking-wider uppercase font-semibold text-[11px]">
                    Color:
                  </span>
                  <span className="font-medium text-neutral-900">{selectedColor}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`group relative flex items-center justify-center p-1 border transition-all cursor-pointer ${
                        selectedColor === c.name ? 'border-black' : 'border-neutral-300 hover:border-neutral-500'
                      }`}
                    >
                      <span
                        className="w-5 h-5 block border border-black/10"
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-neutral-500 tracking-wider uppercase font-semibold text-[11px]">
                    Select Size:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-neutral-600 hover:text-black underline cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" /> Size Guide
                  </button>
                </div>

                {/* Size guide popup */}
                {showSizeGuide && (
                  <div className="mb-3 p-3 bg-neutral-200/80 text-[11px] text-neutral-700 border border-neutral-300">
                    <p className="font-semibold mb-1 uppercase tracking-wider">Garment Measurements (Inches)</p>
                    <div className="grid grid-cols-4 gap-1 text-center py-1 font-mono">
                      <span>S: Chest 38&quot;</span>
                      <span>M: Chest 40&quot;</span>
                      <span>L: Chest 42&quot;</span>
                      <span>XL: Chest 44&quot;</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 text-xs font-semibold tracking-wider uppercase border transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-300 bg-white/60 text-neutral-800 hover:border-black'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-5 flex items-center space-x-4">
                <span className="text-neutral-500 tracking-wider uppercase font-semibold text-[11px]">
                  Quantity:
                </span>
                <div className="flex items-center border border-neutral-300 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-black font-semibold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-black font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart & Wishlist Actions */}
              <div className="mt-6 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-6 text-xs sm:text-[13px] tracking-[0.2em] uppercase font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                    addedAnimation
                      ? 'bg-emerald-700 text-white'
                      : 'bg-black text-white hover:bg-neutral-800 active:scale-98'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Bag
                    </>
                  ) : (
                    <>
                      Add to Bag <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
                  className="w-12 h-12 border border-neutral-300 bg-white/80 hover:bg-white flex items-center justify-center text-neutral-800 hover:text-black transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorited ? 'fill-red-600 text-red-600' : ''}`}
                  />
                </button>
              </div>

              {/* Guarantees */}
              <div className="mt-4 flex items-center space-x-2 text-[11px] text-neutral-500">
                <Shield className="w-3.5 h-3.5 text-neutral-700" />
                <span>Free delivery over {currencySymbol}{siteConfig.shipping.freeThreshold} • 15 days easy returns</span>
              </div>
            </div>

            {/* Accordion Tabs */}
            <div className="mt-6 pt-4 border-t border-neutral-300 text-xs">
              <div className="flex space-x-6 border-b border-neutral-200 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`tracking-wider uppercase font-semibold text-[11px] pb-1 transition-colors ${
                    activeTab === 'details' ? 'border-b-2 border-black text-black' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  Details & Composition
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('care')}
                  className={`tracking-wider uppercase font-semibold text-[11px] pb-1 transition-colors ${
                    activeTab === 'care' ? 'border-b-2 border-black text-black' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  Care Guide
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('shipping')}
                  className={`tracking-wider uppercase font-semibold text-[11px] pb-1 transition-colors ${
                    activeTab === 'shipping' ? 'border-b-2 border-black text-black' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  Shipping & Delivery
                </button>
              </div>

              <div className="pt-3 text-neutral-600">
                {activeTab === 'details' && (
                  <div>
                    <p className="font-medium text-neutral-800 mb-1">{product.composition}</p>
                    <ul className="list-disc list-inside space-y-1 text-neutral-600">
                      {product.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {activeTab === 'care' && (
                  <ul className="list-disc list-inside space-y-1 text-neutral-600">
                    {product.careGuide.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-1 text-neutral-600 leading-relaxed">
                    <p>• Estimated delivery: {siteConfig.shipping.estimatedDeliveryDays}</p>
                    <p>• Free shipping on orders over {formatCurrency(siteConfig.shipping.freeThreshold, currencySymbol)}</p>
                    <p>• Hassle-free door-to-door returns within 15 calendar days</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
