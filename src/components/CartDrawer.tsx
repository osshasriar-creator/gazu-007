import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Tag, Check, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/cartRules';
import { siteConfig } from '../config/siteConfig';
import { ResponsiveProductImage } from './ResponsiveProductImage';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    cartSubtotal,
    cartShipping,
    cartPromo,
    cartTotal,
    applyPromo,
    removePromo,
    freeShippingProgress,
    setIsCheckoutOpen,
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const currencySymbol = siteConfig.currency.symbol;

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyPromo(promoInput);
      setPromoInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#f2f1ed] border-l border-neutral-300 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-neutral-300 flex items-center justify-between bg-[#ecebe6]">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-neutral-800" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight uppercase font-display text-neutral-950">
                Shopping Bag ({cart.reduce((t, i) => t + i.quantity, 0)})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              aria-label="Close cart"
              className="p-1.5 text-neutral-600 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#e2e0d8] px-5 sm:px-6 py-3 border-b border-neutral-300 text-xs">
            {freeShippingProgress.isFree ? (
              <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Congratulations! You qualified for FREE Delivery.
              </p>
            ) : (
              <div>
                <p className="text-neutral-700 font-medium">
                  Add{' '}
                  <span className="font-bold text-neutral-900">
                    {formatCurrency(freeShippingProgress.needed, currencySymbol)}
                  </span>{' '}
                  more to unlock <span className="font-bold">FREE Delivery</span>
                </p>
                <div className="w-full bg-neutral-300 h-1.5 mt-2 rounded-full overflow-hidden">
                  <div
                    className="bg-neutral-900 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingProgress.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-neutral-400 stroke-[1.2] mb-3" />
                <p className="text-sm font-semibold tracking-wider uppercase text-neutral-800">
                  Your bag is empty
                </p>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Explore our curated minimalist collections and add timeless everyday staples.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 bg-black text-white px-6 py-2.5 text-xs tracking-widest uppercase font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 p-3 bg-white/70 border border-neutral-300/80 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-neutral-200 overflow-hidden shrink-0">
                    <ResponsiveProductImage
                      src={item.image}
                      alt={item.name}
                      variant="thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-semibold text-neutral-900 truncate pr-2">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="text-neutral-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-500 mt-0.5 space-x-2">
                        <span>Size: <strong className="text-neutral-800 font-semibold">{item.size}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-neutral-800 font-semibold">{item.color}</strong></span>
                      </div>
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-neutral-300 bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-neutral-600 hover:text-black font-semibold"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-neutral-600 hover:text-black font-semibold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-neutral-900">
                          {formatCurrency(
                            (item.salePrice || item.price) * item.quantity,
                            currencySymbol
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-neutral-300 bg-[#ecebe6] space-y-4">
              {/* Promo code input */}
              <div>
                {cartPromo.valid ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-300 text-xs">
                    <div className="flex items-center space-x-1.5 text-emerald-800">
                      <Check className="w-4 h-4" />
                      <span className="font-semibold">Code: {cartPromo.code}</span>
                      <span className="text-emerald-700">(-{formatCurrency(cartPromo.discountAmount, currencySymbol)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removePromo}
                      className="text-emerald-900 hover:text-red-700 text-[11px] font-bold uppercase underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex space-x-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo code (e.g. GAZU10)"
                        className="w-full pl-8 pr-3 py-2 text-xs border border-neutral-300 bg-white placeholder-neutral-400 uppercase tracking-wider focus:outline-none focus:border-black"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-neutral-800 text-white px-3.5 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-black transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600 border-t border-neutral-300 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-neutral-900">
                    {formatCurrency(cartSubtotal, currencySymbol)}
                  </span>
                </div>

                {cartPromo.valid && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({cartPromo.code})</span>
                    <span>-{formatCurrency(cartPromo.discountAmount, currencySymbol)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span>
                    {cartShipping === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">Free</span>
                    ) : (
                      formatCurrency(cartShipping, currencySymbol)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm sm:text-base font-extrabold text-neutral-950 pt-2 border-t border-neutral-300">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal, currencySymbol)}</span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full bg-black text-white py-3.5 px-6 text-xs sm:text-[13px] tracking-[0.2em] uppercase font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-neutral-500 uppercase tracking-wider">
                Demo Store Prototype • Safe & Protected Checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
