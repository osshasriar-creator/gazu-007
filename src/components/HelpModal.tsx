import React, { useState } from 'react';
import { X, HelpCircle, ChevronDown, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { siteConfig } from '../config/siteConfig';

export const HelpModal: React.FC = () => {
  const { isHelpOpen, setIsHelpOpen } = useStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!isHelpOpen) return null;

  const faqs = [
    {
      q: 'How long does standard delivery take?',
      a: `Standard delivery takes ${siteConfig.shipping.estimatedDeliveryDays} nationwide across major metropolitan areas and regional districts. Priority Express delivery delivers within 24 hours.`,
    },
    {
      q: 'What is the return and exchange policy?',
      a: 'We offer an effortless 15-day return window for unworn, unwashed items with all original tags attached. Returns are completely free if dropped off at any partner hub, or picked up from your address for a nominal fee.',
    },
    {
      q: 'How does Free Delivery work?',
      a: `All orders above ${siteConfig.currency.symbol}${siteConfig.shipping.freeThreshold} automatically qualify for free standard doorstep delivery. No discount code needed!`,
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'We accept Cash on Delivery (COD), Visa, Mastercard, American Express, and mobile financial services including bKash and Nagad.',
    },
    {
      q: 'How do I choose the right size?',
      a: 'Our silhouettes are designed with a relaxed, modern drape. We recommend choosing your true standard size for the intended slouchy architectural fit, or sizing down for a closer classic look. Detailed inch measurements are provided on each product page.',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Customer Care and Help"
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsHelpOpen(false)}
      />

      <div className="relative min-h-screen sm:min-h-0 sm:my-14 max-w-xl mx-auto bg-[#f2f1ed] border border-neutral-300 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-neutral-300 flex items-center justify-between bg-[#ecebe6]">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-bold tracking-tight uppercase font-display text-neutral-950">
              Customer Support & FAQs
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsHelpOpen(false)}
            aria-label="Close help"
            className="p-1.5 text-neutral-600 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick contact banner */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-white border border-neutral-300 text-xs">
            <div className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-neutral-700 shrink-0" />
              <div>
                <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Direct Care</span>
                <span className="font-bold text-neutral-900">{siteConfig.contact.supportPhone}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-neutral-700 shrink-0" />
              <div>
                <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Email Desk</span>
                <span className="font-bold text-neutral-900">{siteConfig.contact.supportEmail}</span>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-800 mb-3">
              Frequently Asked Questions
            </h3>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-neutral-300 bg-white/70">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-3.5 text-left flex justify-between items-center text-xs font-semibold text-neutral-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-500 transition-transform ${
                        openFaq === i ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-200 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-neutral-200 text-neutral-700 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-800 shrink-0" />
            <p>Every GAZU garment is backed by our 100% Quality & Authenticity Guarantee.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
