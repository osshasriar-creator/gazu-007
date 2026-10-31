import React, { useState } from 'react';
import { X, CheckCircle2, ShieldAlert, CreditCard, Banknote, Smartphone, ArrowRight, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency, validateEmail } from '../utils/cartRules';
import { siteConfig } from '../config/siteConfig';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartShipping,
    cartPromo,
    cartTotal,
    placeDemoOrder,
    lastCompletedOrder,
    setIsTrackOrderOpen,
    user,
  } = useStore();

  const [step, setStep] = useState<'form' | 'success'>('form');

  // Form Fields
  const [email, setEmail] = useState(user?.email || 'alex@example.com');
  const [fullName, setFullName] = useState(user?.name || 'Alex Morgan');
  const [phone, setPhone] = useState(user?.phone || '+880 1711-223344');
  const [address, setAddress] = useState(user?.savedAddress || 'House 42, Road 11, Banani');
  const [city, setCity] = useState('Dhaka');
  const [postalCode, setPostalCode] = useState('1213');
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'mobile'>('cod');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencySymbol = siteConfig.currency.symbol;
  const deliveryFee = deliveryOption === 'express' ? siteConfig.shipping.expressRate : cartShipping;
  const finalTotal = cartTotal + (deliveryOption === 'express' ? siteConfig.shipping.expressRate - cartShipping : 0);

  if (!isCheckoutOpen) return null;

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!email.trim() || !validateEmail(email)) errs.email = 'Valid email is required';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    if (!address.trim()) errs.address = 'Street address is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!postalCode.trim()) errs.postalCode = 'Postal code is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      placeDemoOrder({
        items: [...cart],
        subtotal: cartSubtotal,
        discount: cartPromo.discountAmount,
        shipping: deliveryFee,
        total: finalTotal,
        customerName: fullName,
        email,
        phone,
        address: `${address}, ${city} - ${postalCode}`,
        paymentMethod:
          paymentMethod === 'cod'
            ? 'Cash on Delivery'
            : paymentMethod === 'card'
            ? 'Credit / Debit Card'
            : 'bKash / Nagad Mobile Banking',
      });
      setIsSubmitting(false);
      setStep('success');
    }, 700);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep('form');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Checkout Dialog"
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="relative min-h-screen sm:min-h-0 sm:my-10 max-w-3xl mx-auto bg-[#f2f1ed] border border-neutral-300 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-300 flex items-center justify-between bg-[#ecebe6]">
          <div>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-neutral-500">
              {siteConfig.brandName} STOREFRONT
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight uppercase font-display text-neutral-950">
              {step === 'form' ? 'Checkout' : 'Order Confirmation'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close checkout"
            className="p-1.5 text-neutral-600 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Warning Banner */}
        <div className="bg-amber-100/90 border-b border-amber-300 px-4 sm:px-6 py-2.5 text-xs text-amber-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <p>
            <strong>PROTOTYPE DEMO:</strong> This is an interactive store demonstration. No real payment is processed and no financial charges are made.
          </p>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmitOrder} className="p-4 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column: Form Fields */}
              <div className="md:col-span-7 space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-900 border-b border-neutral-300 pb-2 mb-3">
                    1. Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold tracking-wider uppercase text-neutral-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className={`w-full px-3 py-2 text-xs border bg-white focus:outline-none ${
                          errors.fullName ? 'border-red-500' : 'border-neutral-300 focus:border-black'
                        }`}
                      />
                      {errors.fullName && <p className="text-[10px] text-red-600 mt-1">{errors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold tracking-wider uppercase text-neutral-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@example.com"
                          className={`w-full px-3 py-2 text-xs border bg-white focus:outline-none ${
                            errors.email ? 'border-red-500' : 'border-neutral-300 focus:border-black'
                          }`}
                        />
                        {errors.email && <p className="text-[10px] text-red-600 mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold tracking-wider uppercase text-neutral-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+880 1700-000000"
                          className={`w-full px-3 py-2 text-xs border bg-white focus:outline-none ${
                            errors.phone ? 'border-red-500' : 'border-neutral-300 focus:border-black'
                          }`}
                        />
                        {errors.phone && <p className="text-[10px] text-red-600 mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-900 border-b border-neutral-300 pb-2 mb-3">
                    2. Shipping Address
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold tracking-wider uppercase text-neutral-700 mb-1">
                        Street Address / Apartment *
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House 42, Road 11, Banani"
                        className={`w-full px-3 py-2 text-xs border bg-white focus:outline-none ${
                          errors.address ? 'border-red-500' : 'border-neutral-300 focus:border-black'
                        }`}
                      />
                      {errors.address && <p className="text-[10px] text-red-600 mt-1">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold tracking-wider uppercase text-neutral-700 mb-1">
                          City / Division *
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Dhaka"
                          className={`w-full px-3 py-2 text-xs border bg-white focus:outline-none ${
                            errors.city ? 'border-red-500' : 'border-neutral-300 focus:border-black'
                          }`}
                        />
                        {errors.city && <p className="text-[10px] text-red-600 mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold tracking-wider uppercase text-neutral-700 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="1213"
                          className={`w-full px-3 py-2 text-xs border bg-white focus:outline-none ${
                            errors.postalCode ? 'border-red-500' : 'border-neutral-300 focus:border-black'
                          }`}
                        />
                        {errors.postalCode && <p className="text-[10px] text-red-600 mt-1">{errors.postalCode}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Method */}
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-900 border-b border-neutral-300 pb-2 mb-3">
                    3. Delivery Speed
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 border border-neutral-300 bg-white/60 cursor-pointer hover:border-black">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="deliveryOption"
                          checked={deliveryOption === 'standard'}
                          onChange={() => setDeliveryOption('standard')}
                          className="accent-black"
                        />
                        <div>
                          <p className="text-xs font-semibold text-neutral-900">Standard Delivery</p>
                          <p className="text-[11px] text-neutral-500">{siteConfig.shipping.estimatedDeliveryDays}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-neutral-900">
                        {cartShipping === 0 ? 'FREE' : formatCurrency(cartShipping, currencySymbol)}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-3 border border-neutral-300 bg-white/60 cursor-pointer hover:border-black">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="deliveryOption"
                          checked={deliveryOption === 'express'}
                          onChange={() => setDeliveryOption('express')}
                          className="accent-black"
                        />
                        <div>
                          <p className="text-xs font-semibold text-neutral-900">Express Priority (24h)</p>
                          <p className="text-[11px] text-neutral-500">Same day or next morning delivery</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-neutral-900">
                        {formatCurrency(siteConfig.shipping.expressRate, currencySymbol)}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-900 border-b border-neutral-300 pb-2 mb-3">
                    4. Payment Option
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        paymentMethod === 'cod' ? 'border-black bg-black text-white' : 'border-neutral-300 bg-white text-neutral-800'
                      }`}
                    >
                      <Banknote className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Cash on Delivery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        paymentMethod === 'card' ? 'border-black bg-black text-white' : 'border-neutral-300 bg-white text-neutral-800'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Card Demo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mobile')}
                      className={`p-3 border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        paymentMethod === 'mobile' ? 'border-black bg-black text-white' : 'border-neutral-300 bg-white text-neutral-800'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">bKash / Nagad</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="md:col-span-5 bg-[#ecebe6] p-5 border border-neutral-300 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-900 border-b border-neutral-300 pb-2 mb-3">
                    Order Summary ({cart.reduce((t, i) => t + i.quantity, 0)})
                  </h3>

                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 text-xs">
                        <img src={item.image} alt={item.name} className="w-10 h-12 object-cover shrink-0 bg-neutral-200" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-neutral-500">Qty: {item.quantity} • {item.size}</p>
                        </div>
                        <span className="font-bold text-neutral-900">
                          {formatCurrency((item.salePrice || item.price) * item.quantity, currencySymbol)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-neutral-300 mt-4 pt-3 space-y-1.5 text-xs text-neutral-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-neutral-900">{formatCurrency(cartSubtotal, currencySymbol)}</span>
                    </div>

                    {cartPromo.valid && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Promo ({cartPromo.code})</span>
                        <span>-{formatCurrency(cartPromo.discountAmount, currencySymbol)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Delivery ({deliveryOption})</span>
                      <span>{deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee, currencySymbol)}</span>
                    </div>

                    <div className="flex justify-between text-base font-extrabold text-neutral-950 pt-2 border-t border-neutral-300">
                      <span>Total Due</span>
                      <span>{formatCurrency(finalTotal, currencySymbol)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-300">
                  <button
                    type="submit"
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full bg-black text-white py-3.5 px-4 text-xs tracking-[0.2em] uppercase font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Confirming Demo Order...' : 'Confirm Order (Demo)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          /* Confirmation Success Screen */
          <div className="p-8 sm:p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-[11px] tracking-widest uppercase font-semibold text-neutral-500">
              Demo Order Placed Successfully
            </span>
            <h3 className="text-2xl font-extrabold text-neutral-950 font-display mt-1">
              Thank You, {lastCompletedOrder?.customerName}!
            </h3>

            <div className="my-6 p-4 bg-white border border-neutral-300 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Order ID:</span>
                <span className="font-mono font-bold text-neutral-900">{lastCompletedOrder?.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Estimated Delivery:</span>
                <span className="font-medium text-neutral-900">{siteConfig.shipping.estimatedDeliveryDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Delivery Address:</span>
                <span className="font-medium text-neutral-900 text-right max-w-xs">{lastCompletedOrder?.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment:</span>
                <span className="font-medium text-neutral-900">{lastCompletedOrder?.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-sm">
                <span>Total:</span>
                <span>{formatCurrency(lastCompletedOrder?.total || 0, currencySymbol)}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-600 mb-6 leading-relaxed">
              A demo confirmation email has been logged for <span className="font-semibold text-neutral-900">{lastCompletedOrder?.email}</span>. You can track this order in real time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setIsTrackOrderOpen(true);
                }}
                className="w-full sm:w-auto bg-neutral-900 text-white px-6 py-2.5 text-xs tracking-widest uppercase font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Track This Order</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto border border-neutral-400 text-neutral-800 px-6 py-2.5 text-xs tracking-widest uppercase font-semibold hover:bg-neutral-200 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
