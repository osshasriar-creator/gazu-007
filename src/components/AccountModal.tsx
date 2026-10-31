import React, { useState } from 'react';
import { X, User, LogOut, Package, MapPin, ShieldAlert, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency, validateEmail } from '../utils/cartRules';
import { siteConfig } from '../config/siteConfig';

export const AccountModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, user, loginDemo, logoutDemo, orders, setIsTrackOrderOpen } = useStore();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isAuthOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !validateEmail(email)) {
      setError('Please provide a valid email');
      return;
    }
    loginDemo(email, name || 'Alex Morgan');
  };

  const handleOneClickDemo = () => {
    loginDemo('alex.morgan@gazu.demo', 'Alex Morgan');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="User Account"
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsAuthOpen(false)}
      />

      <div className="relative min-h-screen sm:min-h-0 sm:my-16 max-w-md mx-auto bg-[#f2f1ed] border border-neutral-300 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-neutral-300 flex items-center justify-between bg-[#ecebe6]">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-bold tracking-tight uppercase font-display text-neutral-950">
              {user ? 'My GAZU Account' : 'Sign In / Register'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthOpen(false)}
            aria-label="Close dialog"
            className="p-1.5 text-neutral-600 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Disclaimer */}
        <div className="bg-neutral-200/90 border-b border-neutral-300 px-5 py-2.5 text-[11px] text-neutral-600 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <span>Demo Authentication Prototype. Safe for evaluation without backend auth.</span>
        </div>

        {user ? (
          /* Logged In Dashboard */
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-300">
              <div>
                <h3 className="text-base font-bold text-neutral-900">{user.name}</h3>
                <p className="text-xs text-neutral-500">{user.email}</p>
                <p className="text-xs text-neutral-500">{user.phone}</p>
              </div>
              <button
                type="button"
                onClick={logoutDemo}
                className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 font-semibold px-2.5 py-1.5 border border-red-200 hover:border-red-400 bg-white"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Saved Address */}
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2">
                <MapPin className="w-4 h-4" />
                <span>Default Delivery Address</span>
              </div>
              <div className="p-3 bg-white border border-neutral-300 text-xs text-neutral-700">
                <p className="font-semibold text-neutral-900">{user.name}</p>
                <p className="mt-0.5">{user.savedAddress}</p>
                <p className="text-neutral-500">Dhaka, Bangladesh</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2">
                <div className="flex items-center space-x-1.5">
                  <Package className="w-4 h-4" />
                  <span>Recent Orders ({orders.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthOpen(false);
                    setIsTrackOrderOpen(true);
                  }}
                  className="text-[11px] text-neutral-500 hover:text-black underline cursor-pointer"
                >
                  Track Order
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {orders.map((ord) => (
                  <div key={ord.orderId} className="p-3 bg-white border border-neutral-300 text-xs">
                    <div className="flex justify-between items-baseline font-semibold">
                      <span className="font-mono text-neutral-900">{ord.orderId}</span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {ord.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-500 mt-1">
                      <span>{ord.items.length} items • {ord.date}</span>
                      <span className="font-bold text-neutral-900">
                        {formatCurrency(ord.total, siteConfig.currency.symbol)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="p-6">
            <div className="flex border-b border-neutral-300 mb-6">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`flex-1 pb-2.5 text-xs tracking-widest uppercase font-semibold text-center transition-colors ${
                  tab === 'signin' ? 'border-b-2 border-black text-black' : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`flex-1 pb-2.5 text-xs tracking-widest uppercase font-semibold text-center transition-colors ${
                  tab === 'register' ? 'border-b-2 border-black text-black' : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-neutral-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white focus:outline-none focus:border-black"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold tracking-wider uppercase text-neutral-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white focus:outline-none focus:border-black"
                />
                {error && <p className="text-[10px] text-red-600 mt-1">{error}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider uppercase text-neutral-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  defaultValue="password123"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 bg-white focus:outline-none focus:border-black"
                />
                <p className="text-[10px] text-neutral-400 mt-1">Any password works for this demo prototype.</p>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 text-xs tracking-widest uppercase font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {tab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-neutral-300 text-center">
              <p className="text-xs text-neutral-500 mb-3">Or test instantly:</p>
              <button
                type="button"
                onClick={handleOneClickDemo}
                className="w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider border border-neutral-400 bg-white/70 hover:bg-white text-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>1-Click Test Login as Alex</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
