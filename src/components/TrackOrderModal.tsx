import React, { useState } from 'react';
import { X, Truck, CheckCircle2, Clock, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/cartRules';
import { siteConfig } from '../config/siteConfig';

export const TrackOrderModal: React.FC = () => {
  const { isTrackOrderOpen, setIsTrackOrderOpen, orders } = useStore();
  const [searchId, setSearchId] = useState(orders[0]?.orderId || 'GZ-82019');
  const [selectedOrder, setSelectedOrder] = useState(orders[0] || null);

  if (!isTrackOrderOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(
      (o) => o.orderId.toLowerCase() === searchId.trim().toLowerCase()
    );
    if (found) {
      setSelectedOrder(found);
    }
  };

  const steps = [
    { label: 'Order Confirmed', desc: 'Payment verified & order created' },
    { label: 'Quality Check & Packing', desc: 'Hand-inspected at GAZU Central Hub' },
    { label: 'Out for Delivery', desc: 'With courier partner for doorstep delivery' },
    { label: 'Delivered', desc: 'Delivered to your address' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Track Order"
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsTrackOrderOpen(false)}
      />

      <div className="relative min-h-screen sm:min-h-0 sm:my-16 max-w-lg mx-auto bg-[#f2f1ed] border border-neutral-300 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-neutral-300 flex items-center justify-between bg-[#ecebe6]">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-bold tracking-tight uppercase font-display text-neutral-950">
              Track Your Order
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsTrackOrderOpen(false)}
            aria-label="Close dialog"
            className="p-1.5 text-neutral-600 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex space-x-2 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Order ID (e.g. GZ-82019)"
                className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white font-mono uppercase focus:outline-none focus:border-black"
              />
            </div>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track</span>
            </button>
          </form>

          {selectedOrder ? (
            <div className="space-y-6">
              <div className="p-4 bg-white border border-neutral-300">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Order Reference</span>
                    <p className="font-mono font-bold text-sm text-neutral-900">{selectedOrder.orderId}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-neutral-900 text-white">
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-3 text-neutral-600">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase">Recipient:</span>
                    <p className="font-semibold text-neutral-800 truncate">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase">Delivery Window:</span>
                    <p className="font-semibold text-neutral-800">{siteConfig.shipping.estimatedDeliveryDays}</p>
                  </div>
                </div>
              </div>

              {/* Stepper */}
              <div className="px-2">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-800 mb-4">
                  Shipment Milestones
                </p>
                <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-300">
                  {steps.map((st, idx) => {
                    const isDone = idx <= 1; // sample progress
                    const isCurrent = idx === 1;
                    return (
                      <div key={idx} className="relative flex items-start space-x-4 pl-1">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                            isDone ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-400 border border-neutral-300'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3 h-3" />}
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${isCurrent ? 'text-black font-bold' : 'text-neutral-700'}`}>
                            {st.label}
                          </p>
                          <p className="text-[11px] text-neutral-500">{st.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items in order */}
              <div className="pt-4 border-t border-neutral-300">
                <p className="text-[11px] tracking-wider uppercase font-semibold text-neutral-500 mb-2">
                  Items in shipment ({selectedOrder.items.length})
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <span className="text-neutral-800 font-medium">{item.name} ({item.size})</span>
                      <span className="text-neutral-600">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-xs pt-3 mt-3 border-t border-neutral-200">
                  <span>Order Total:</span>
                  <span>{formatCurrency(selectedOrder.total, siteConfig.currency.symbol)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500 text-xs">
              No order found matching &quot;{searchId}&quot;. Try checking recent orders in your account.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
