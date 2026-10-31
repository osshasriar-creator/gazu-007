/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryStrip } from './components/CategoryStrip';
import { CampaignBanner } from './components/CampaignBanner';
import { ServiceBenefits } from './components/ServiceBenefits';
import { ProductSection } from './components/ProductSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AccountModal } from './components/AccountModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { HelpModal } from './components/HelpModal';
import { AppDownloadModal } from './components/AppDownloadModal';
import { AdminPage } from './components/AdminPage';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';

interface MainLayoutProps {
  onNavigateToAdmin: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onNavigateToAdmin }) => {
  const { quickViewProduct, setQuickViewProduct } = useStore();
  const catalogRef = useRef<HTMLDivElement>(null);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f1ed] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* 1. Slim announcement bar */}
      <AnnouncementBar />

      {/* 2. Main header */}
      <Header onScrollToCatalog={scrollToCatalog} />

      {/* Main content flow */}
      <main className="flex-1">
        {/* 3. Hero Section with oversized GAZU watermark and editorial model */}
        <HeroSection onExplore={scrollToCatalog} />

        {/* 4. Category Strip (Men, Women, Kids) */}
        <CategoryStrip onSelectCategory={scrollToCatalog} />

        {/* 5. Wide seasonal campaign banner "NEW VIBES" */}
        <CampaignBanner onExplore={scrollToCatalog} />

        {/* 6. Service benefits row */}
        <ServiceBenefits />

        {/* 7. "BEST OF GAZU" Product Catalog */}
        <div ref={catalogRef}>
          <ProductSection onQuickView={(prod) => setQuickViewProduct(prod)} />
        </div>
      </main>

      {/* 8. Clean Editorial Footer */}
      <Footer onNavigateToAdmin={onNavigateToAdmin} />

      {/* Customer Modals, Drawers & Overlays */}
      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
      <CartDrawer />
      <WishlistDrawer />
      <SearchModal />
      <CheckoutModal />
      <AccountModal />
      <TrackOrderModal />
      <HelpModal />
      <AppDownloadModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const isAdm =
      window.location.pathname.startsWith('/admin') ||
      window.location.hash.startsWith('#/admin');
    return isAdm ? '/admin' : '/';
  });

  useEffect(() => {
    const checkRoute = () => {
      const isAdm =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#/admin');
      setCurrentRoute(isAdm ? '/admin' : '/');
    };

    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentRoute(path);
  };

  return (
    <StoreProvider>
      {currentRoute === '/admin' ? (
        <AdminPage onBackToStore={() => navigateTo('/')} />
      ) : (
        <MainLayout onNavigateToAdmin={() => navigateTo('/admin')} />
      )}
    </StoreProvider>
  );
}
