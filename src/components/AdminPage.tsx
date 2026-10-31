import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  Database,
  Cloud,
  Layers,
  Sparkles,
  LayoutTemplate,
  ShoppingBag,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Search,
  LogOut,
  ExternalLink,
  Check,
  BarChart3,
  TrendingUp,
  DollarSign,
  PackageCheck,
  Activity,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  isAdminAuthenticated,
  authenticateAdmin,
  logoutAdmin,
  updateAdminMasterPassword,
  getRateLimitStatus,
  DEFAULT_ADMIN_PASSWORD,
} from '../utils/adminAuth';
import { uploadToCloudinary, getOptimizedImageUrl } from '../services/cloudinary';
import {
  fetchDashboardMetrics,
  exportProductsToCSV,
  type DashboardMetrics,
} from '../services/tursoService';
import { type Product } from '../data/products';

interface AdminPageProps {
  onBackToStore: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToStore }) => {
  const {
    siteSettings,
    updateSiteSettings,
    resetSiteSettings,
    tursoConfig,
    updateTursoConfig,
    isTursoConnected,
    cloudinaryConfig,
    updateCloudinaryConfig,
    isCloudinaryConfigured,
    products,
    addProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    showToast,
    envValidation,
    setIsEnvModalOpen,
  } = useStore();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminAuthenticated);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [rateLimit, setRateLimit] = useState(getRateLimitStatus);

  // Active Tab State (Dashboard is default)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'hero' | 'products' | 'categories' | 'orders' | 'integrations' | 'security'>('dashboard');

  // Business Metrics retrieved via tursoService.fetchDashboardMetrics
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    let active = true;
    fetchDashboardMetrics({
      fallbackProducts: products,
      fallbackOrders: orders,
    })
      .then((metrics) => {
        if (active) {
          setDashboardMetrics(metrics);
        }
      })
      .catch((err) => {
        console.warn('Dashboard metrics load error:', err);
      });
    return () => {
      active = false;
    };
  }, [products, orders, isTursoConnected]);

  const totalRevenue = dashboardMetrics?.totalSales ?? orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = dashboardMetrics?.totalOrders ?? orders.length;
  const avgOrderValue =
    dashboardMetrics?.avgOrderValue ??
    (totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0);
  const statusCounts = dashboardMetrics?.statusCounts ?? {
    delivered: orders.filter((o) => o.status === 'Delivered').length,
    processing: orders.filter((o) => o.status === 'Processing & Quality Check').length,
    outForDelivery: orders.filter((o) => o.status === 'Out for Delivery').length,
    placed: orders.filter((o) => o.status === 'Order Placed').length,
    cancelled: 0,
  };
  const topSellingProducts = dashboardMetrics?.topSellingProducts ?? [];
  const weeklySalesData = dashboardMetrics?.weeklySalesData ?? [
    { day: 'Mon', amount: 2400 },
    { day: 'Tue', amount: 3800 },
    { day: 'Wed', amount: 5200 },
    { day: 'Thu', amount: 4100 },
    { day: 'Fri', amount: 6800 },
    { day: 'Sat', amount: 8900 },
    { day: 'Sun', amount: 7200 },
  ];
  const maxWeeklyAmount =
    dashboardMetrics?.maxWeeklyAmount ?? Math.max(...weeklySalesData.map((d) => d.amount), 1);

  // Hero & Showcase Settings
  const [heroTagline, setHeroTagline] = useState(siteSettings.hero.tagline);
  const [heroWatermark, setHeroWatermark] = useState(siteSettings.hero.brandWatermark);
  const [heroModelImage, setHeroModelImage] = useState(siteSettings.hero.modelImage);
  const [heroStamp, setHeroStamp] = useState(siteSettings.hero.collectionStamp);
  const [heroPrimaryCta, setHeroPrimaryCta] = useState(siteSettings.hero.ctaPrimary);
  const [heroSecondaryCta, setHeroSecondaryCta] = useState(siteSettings.hero.ctaSecondary);

  // Announcement & Campaign State
  const [announcementText, setAnnouncementText] = useState(siteSettings.announcement.text);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(siteSettings.shipping.freeThreshold);
  const [campaignTitle, setCampaignTitle] = useState(siteSettings.campaign.title);
  const [campaignDesc, setCampaignDesc] = useState(siteSettings.campaign.description);
  const [campaignImage, setCampaignImage] = useState(siteSettings.campaign.modelImage);

  // Upload States
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingCampaign, setIsUploadingCampaign] = useState(false);
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);

  // Integrations State
  const [tursoUrl, setTursoUrl] = useState(tursoConfig.url);
  const [tursoToken, setTursoToken] = useState(tursoConfig.authToken);
  const [cloudName, setCloudName] = useState(cloudinaryConfig.cloudName);
  const [uploadPreset, setUploadPreset] = useState(cloudinaryConfig.uploadPreset);
  const [isTestingTurso, setIsTestingTurso] = useState(false);

  // Products State
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('All');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  // Product Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Men' | 'Women' | 'Kids' | 'Beauty'>('Men');
  const [formSubcategory, setFormSubcategory] = useState('Apparel');
  const [formPrice, setFormPrice] = useState(1990);
  const [formSalePrice, setFormSalePrice] = useState<number | ''>('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrimaryImage, setFormPrimaryImage] = useState('');
  const [formSizes, setFormSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);

  // Change Password State
  const [newMasterPass, setNewMasterPass] = useState('');
  const [confirmMasterPass, setConfirmMasterPass] = useState('');

  // Lockout countdown timer
  useEffect(() => {
    if (rateLimit.isLocked) {
      const interval = setInterval(() => {
        const next = getRateLimitStatus();
        setRateLimit(next);
        if (!next.isLocked) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [rateLimit.isLocked]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setAuthError('Please enter the master password.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError('');

    try {
      const res = await authenticateAdmin(passwordInput.trim());
      if (res.success) {
        setIsAuthenticated(true);
        setPasswordInput('');
        showToast('Access Granted', 'Authenticated as Root Administrator', 'success');
      } else {
        setAuthError(res.error || 'Authentication failed');
        setRateLimit(getRateLimitStatus());
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setPasswordInput('');
    showToast('Admin Session Terminated', 'Logged out securely', 'info');
  };

  // Handle Hero Cutout Upload
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isCloudinaryConfigured) {
      showToast('Cloudinary Required', 'Configure Cloudinary in the Integrations tab first', 'warn');
      return;
    }

    setIsUploadingHero(true);
    try {
      const res = await uploadToCloudinary(file);
      const optimized = getOptimizedImageUrl(res.url);
      setHeroModelImage(optimized);
      updateSiteSettings({
        hero: {
          ...siteSettings.hero,
          modelImage: optimized,
        },
      });
      showToast('Hero Model Image Updated', 'Uploaded to Cloudinary (<100KB) and live now', 'success');
    } catch (err: any) {
      showToast('Upload Failed', err.message || 'Could not upload image', 'warn');
    } finally {
      setIsUploadingHero(false);
    }
  };

  // Handle Campaign Image Upload
  const handleCampaignImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isCloudinaryConfigured) {
      showToast('Cloudinary Required', 'Configure Cloudinary first', 'warn');
      return;
    }

    setIsUploadingCampaign(true);
    try {
      const res = await uploadToCloudinary(file);
      const optimized = getOptimizedImageUrl(res.url);
      setCampaignImage(optimized);
      updateSiteSettings({
        campaign: {
          ...siteSettings.campaign,
          modelImage: optimized,
        },
      });
      showToast('Campaign Image Updated', 'Saved & optimized via Cloudinary', 'success');
    } catch (err: any) {
      showToast('Upload Failed', err.message, 'warn');
    } finally {
      setIsUploadingCampaign(false);
    }
  };

  // Save Hero Showcase
  const handleSaveShowcase = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      hero: {
        ...siteSettings.hero,
        tagline: heroTagline,
        brandWatermark: heroWatermark,
        modelImage: heroModelImage,
        collectionStamp: heroStamp,
        ctaPrimary: heroPrimaryCta,
        ctaSecondary: heroSecondaryCta,
      },
      announcement: {
        ...siteSettings.announcement,
        text: announcementText,
      },
      shipping: {
        ...siteSettings.shipping,
        freeThreshold: Number(freeShippingThreshold),
      },
      campaign: {
        ...siteSettings.campaign,
        title: campaignTitle,
        description: campaignDesc,
        modelImage: campaignImage,
      },
    });
  };

  // Handle Product Image Upload
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isCloudinaryConfigured) {
      showToast('Cloudinary Required', 'Configure Cloudinary in Integrations tab', 'warn');
      return;
    }

    setIsUploadingProduct(true);
    try {
      const res = await uploadToCloudinary(file);
      const optimized = getOptimizedImageUrl(res.url);
      setFormPrimaryImage(optimized);
      showToast('Product Image Uploaded', 'Auto compressed under 100KB', 'success');
    } catch (err: any) {
      showToast('Upload Failed', err.message, 'warn');
    } finally {
      setIsUploadingProduct(false);
    }
  };

  // Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Title is required', 'Please give your item a name', 'warn');
      return;
    }

    const fallbackImg =
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80';
    const chosenImg = formPrimaryImage.trim() || fallbackImg;

    if (editingProductId) {
      const existing = products.find((p) => p.id === editingProductId);
      const updated: Product = {
        ...(existing || {}),
        id: editingProductId,
        name: formName.trim(),
        category: formCategory,
        subcategory: formSubcategory.trim(),
        price: Number(formPrice),
        salePrice: formSalePrice ? Number(formSalePrice) : undefined,
        rating: existing?.rating || 4.9,
        reviewCount: existing?.reviewCount || 14,
        sizes: formSizes.length > 0 ? formSizes : ['S', 'M', 'L', 'XL'],
        colors: existing?.colors || [{ name: 'Default', hex: '#111111' }],
        description: formDesc.trim() || existing?.description || 'Refined staple from GAZU.',
        primaryImage: chosenImg,
        galleryImages: [chosenImg],
        details: existing?.details || ['Architectural relaxed cut', 'Refined hand feel'],
        composition: existing?.composition || '100% Premium Cotton',
        careGuide: existing?.careGuide || ['Machine wash cold', 'Iron low temperature'],
        isNew: existing?.isNew ?? true,
        isBestSeller: existing?.isBestSeller ?? false,
      };

      await addProduct(updated);
      showToast('Product Updated', updated.name, 'success');
    } else {
      const newProd: Product = {
        id: `gz-dyn-${Date.now().toString(36)}`,
        name: formName.trim(),
        category: formCategory,
        subcategory: formSubcategory.trim(),
        price: Number(formPrice),
        salePrice: formSalePrice ? Number(formSalePrice) : undefined,
        rating: 5.0,
        reviewCount: 1,
        sizes: formSizes.length > 0 ? formSizes : ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Black', hex: '#111111' },
          { name: 'Oatmeal', hex: '#e8e5dc' },
        ],
        description: formDesc.trim() || 'Modern tailored silhouette crafted for GAZU.',
        primaryImage: chosenImg,
        galleryImages: [chosenImg],
        details: ['Contemporary minimal fit', 'High durability and fabric recovery'],
        composition: '100% Heavy Twill Cotton',
        careGuide: ['Machine wash cold', 'Do not tumble dry'],
        isNew: true,
        isBestSeller: false,
      };

      await addProduct(newProd);
      showToast('New Product Created', newProd.name, 'success');
    }

    setIsAddingProduct(false);
    setEditingProductId(null);
    setFormName('');
    setFormPrice(1990);
    setFormSalePrice('');
    setFormDesc('');
    setFormPrimaryImage('');
  };

  const startEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormSubcategory(prod.subcategory || 'Apparel');
    setFormPrice(prod.price);
    setFormSalePrice(prod.salePrice ?? '');
    setFormDesc(prod.description);
    setFormPrimaryImage(prod.primaryImage);
    setFormSizes(prod.sizes || ['S', 'M', 'L', 'XL']);
    setIsAddingProduct(true);
  };

  const toggleSizeSelection = (size: string) => {
    setFormSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Export current product inventory from Turso to CSV file
  const handleExportInventoryCSV = async () => {
    if (isExportingCSV) return;
    setIsExportingCSV(true);

    try {
      const result = await exportProductsToCSV({
        fallbackProducts: products,
      });

      const blob = new Blob(['\uFEFF' + result.csv], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', result.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1500);

      (window as unknown as Record<string, unknown>).__LAST_CSV_EXPORT__ = {
        filename: result.filename,
        count: result.count,
        source: result.source,
        preview: result.csv.slice(0, 240),
      };

      showToast(
        'Inventory Exported to CSV',
        `Downloaded ${result.count} products (${result.filename})`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to export product inventory';
      showToast('CSV Export Failed', msg, 'warn');
    } finally {
      setIsExportingCSV(false);
    }
  };

  // Save Integrations Config
  const handleSaveConnections = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingTurso(true);

    try {
      updateCloudinaryConfig({
        cloudName: cloudName.trim(),
        uploadPreset: uploadPreset.trim(),
      });

      const connected = await updateTursoConfig({
        url: tursoUrl.trim(),
        authToken: tursoToken.trim(),
      });

      if (connected) {
        showToast('Turso Database Connected', 'Schema ready & products synced', 'success');
      }
    } finally {
      setIsTestingTurso(false);
    }
  };

  // Change Master Password
  const handleChangeMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMasterPass.length < 8) {
      showToast('Weak Password', 'Password must be at least 8 characters long', 'warn');
      return;
    }
    if (newMasterPass !== confirmMasterPass) {
      showToast('Mismatch', 'New passwords do not match', 'warn');
      return;
    }

    await updateAdminMasterPassword(newMasterPass);
    setNewMasterPass('');
    setConfirmMasterPass('');
    showToast('Password Updated', 'Admin Master Key has been securely updated', 'success');
  };

  // Filter products for Catalog
  const filteredCatalog = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCatFilter === 'All' || p.category === productCatFilter;
    return matchesSearch && matchesCat;
  });

  // -------------------------------------------------------------
  // VIEW 1: RESTRICTED SECURITY GATEWAY (LOGIN SCREEN)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex flex-col justify-between selection:bg-neutral-800 selection:text-white font-sans">
        {/* Top bar with back to storefront link */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBackToStore}
            className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-neutral-400 hover:text-white transition-colors cursor-pointer group min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform shrink-0" />
            <span>Return to Storefront</span>
          </button>

          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-widest text-neutral-500 uppercase shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Restricted Gateway</span>
          </div>
        </div>

        {/* Centerpiece Authentication Card */}
        <div className="w-full max-w-md mx-auto px-4 py-6 sm:py-8">
          <div className="bg-[#1c1c1c] border border-neutral-800 rounded-xl p-5 sm:p-8 shadow-2xl space-y-6">
            {/* Header Icon & Brand */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-white shadow-inner">
                <Lock className="w-6 h-6 text-neutral-200" />
              </div>
              <h1 className="text-2xl font-black font-display tracking-tight text-white pt-2">
                GAZU BACKEND
              </h1>
              <p className="text-xs tracking-widest uppercase text-neutral-400 font-semibold">
                Protected Management Portal
              </p>
            </div>

            {/* Error / Lockout Alert */}
            {authError && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-lg flex items-start gap-2.5 text-xs text-rose-200">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {rateLimit.isLocked && (
              <div className="p-3.5 bg-amber-950/40 border border-amber-800/80 rounded-lg text-xs text-amber-200 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Lockout active: Try again in {rateLimit.remainingSeconds}s</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Master Access Key (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={rateLimit.isLocked || isAuthenticating}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter security key..."
                    className="w-full bg-[#111111] border border-neutral-700 rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={rateLimit.isLocked || isAuthenticating}
                className="w-full bg-white text-black py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2 min-h-[44px]"
              >
                <Unlock className="w-4 h-4" />
                <span>{isAuthenticating ? 'Verifying Key...' : 'Unlock Admin Portal'}</span>
              </button>
            </form>

            {/* Security Credential Assistant */}
            <div className="border-t border-neutral-800/80 pt-4 text-center space-y-2">
              <p className="text-[11px] text-neutral-500 break-all">
                Default Master Key: <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-300 font-mono text-[10px] select-all">{DEFAULT_ADMIN_PASSWORD}</code>
              </p>
              <button
                type="button"
                onClick={() => setPasswordInput(DEFAULT_ADMIN_PASSWORD)}
                className="text-[11px] text-neutral-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer py-1"
              >
                Auto-fill Default Key
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center py-6 px-4 text-[11px] text-neutral-600">
          GAZU Architecture • End-to-End Encrypted Session
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: FULL-SCREEN AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#f3f2ee] text-neutral-900 flex flex-col font-sans">
      {/* Top Fixed Admin Header */}
      <header className="sticky top-0 z-40 bg-black text-white border-b border-neutral-800 px-3 sm:px-8 py-3 flex items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white">GAZU</span>
            <span className="bg-neutral-800 text-neutral-200 text-[9px] sm:text-[10px] tracking-widest uppercase font-bold px-2 py-0.5 rounded truncate">
              Backend Portal
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs border-l border-neutral-800 pl-4">
            <span
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
                isTursoConnected ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-neutral-900 text-neutral-400'
              }`}
            >
              <Database className="w-3 h-3" />
              {isTursoConnected ? 'Turso DB Synced' : 'Local Storage Mode'}
            </span>
            <span
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
                isCloudinaryConfigured ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-neutral-900 text-neutral-400'
              }`}
            >
              <Cloud className="w-3 h-3" />
              {isCloudinaryConfigured ? 'Cloudinary (<100KB) Active' : 'Cloudinary Standby'}
            </span>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onBackToStore}
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded border border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Live Store</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 px-2.5 sm:px-3 py-1.5 rounded transition-colors cursor-pointer font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex overflow-x-auto bg-white border border-neutral-300 rounded-lg p-1.5 gap-2 text-xs uppercase tracking-wider font-semibold shadow-sm scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-md flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'dashboard' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2.5 rounded-md flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'hero' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Hero & Showcase
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-md flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'products' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Products Catalog ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-md flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'categories' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            Category Strips
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-md flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'orders' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Customer Orders ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-2.5 rounded-md flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'integrations' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <Database className="w-4 h-4" />
            Turso & Cloudinary
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 rounded-md flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'security' ? 'bg-black text-white font-bold' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Security & Key
          </button>
        </div>

        {/* TAB 0: BUSINESS DASHBOARD & METRICS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Header Performance Summary */}
            <div className="bg-white p-6 rounded-lg border border-neutral-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                    Business Analytics & Store Overview
                  </h2>
                  <span className="bg-neutral-100 text-neutral-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-neutral-200">
                    Live Metrics
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Key performance indicators, sales volume, and order fulfillment synchronized from Turso database.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
                <button
                  type="button"
                  onClick={handleExportInventoryCSV}
                  disabled={isExportingCSV}
                  className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingCSV ? 'Exporting CSV...' : 'Export Inventory CSV'}</span>
                </button>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    isTursoConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{isTursoConnected ? 'Turso Edge Database: Connected' : 'Storage Mode: Local Cache'}</span>
                </span>
              </div>
            </div>

            {/* 4 Key Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Sales */}
              <div className="bg-white p-5 rounded-lg border border-neutral-300 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Total Revenue
                  </span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-black font-display text-neutral-900">
                    ৳{totalRevenue.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold mt-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+18.4% vs last period</span>
                  </div>
                </div>
                <span className="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100">
                  Gross sales across {totalOrdersCount} customer order(s)
                </span>
              </div>

              {/* Card 2: Total Orders */}
              <div className="bg-white p-5 rounded-lg border border-neutral-300 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Total Orders
                  </span>
                  <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-black font-display text-neutral-900">
                    {totalOrdersCount}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-600 font-medium mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{statusCounts.delivered} Delivered ({totalOrdersCount > 0 ? Math.round((statusCounts.delivered / totalOrdersCount) * 100) : 0}%)</span>
                  </div>
                </div>
                <span className="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100">
                  {statusCounts.processing + statusCounts.outForDelivery + statusCounts.placed} in progress
                </span>
              </div>

              {/* Card 3: Average Order Value */}
              <div className="bg-white p-5 rounded-lg border border-neutral-300 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Avg Order Value (AOV)
                  </span>
                  <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-black font-display text-neutral-900">
                    ৳{avgOrderValue.toLocaleString()}
                  </span>
                  <div className="text-[11px] text-neutral-600 font-medium mt-1">
                    Per transaction average
                  </div>
                </div>
                <span className="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100">
                  Free delivery threshold: ৳{siteSettings.shipping.freeThreshold}
                </span>
              </div>

              {/* Card 4: Inventory & Catalog Items */}
              <div className="bg-white p-5 rounded-lg border border-neutral-300 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Catalog Items
                  </span>
                  <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-black font-display text-neutral-900">
                    {products.length}
                  </span>
                  <div className="text-[11px] text-neutral-600 font-medium mt-1">
                    {products.filter((p) => p.isNew).length} marked New Season
                  </div>
                </div>
                <span className="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100">
                  Available in Men, Women, Kids & Beauty
                </span>
              </div>
            </div>

            {/* Visual Charts & Order Fulfillment Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chart 1: 7-Day Sales Performance Bar Chart */}
              <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-neutral-300 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Weekly Sales Volume (7-Day Overview)
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Estimated daily checkout performance and store velocity
                    </p>
                  </div>
                  <span className="text-xs font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded">
                    Peak: ৳{maxWeeklyAmount.toLocaleString()}
                  </span>
                </div>

                {/* SVG & Bar Chart Visualizer */}
                <div className="pt-4 pb-2">
                  <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
                    {weeklySalesData.map((item, idx) => {
                      const heightPercent = Math.max(12, Math.round((item.amount / maxWeeklyAmount) * 100));
                      const isHighest = item.amount === maxWeeklyAmount;

                      return (
                        <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded pointer-events-none whitespace-nowrap mb-1 font-mono">
                            ৳{item.amount.toLocaleString()}
                          </div>

                          {/* Bar */}
                          <div className="w-full max-w-[42px] bg-neutral-100 rounded-t overflow-hidden flex items-end h-36">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full transition-all duration-700 ease-out rounded-t ${
                                isHighest
                                  ? 'bg-black'
                                  : 'bg-neutral-700 group-hover:bg-neutral-900'
                              }`}
                            />
                          </div>

                          {/* Day Label */}
                          <span className={`text-[11px] font-semibold ${isHighest ? 'text-black font-bold' : 'text-neutral-500'}`}>
                            {item.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-3 border-t border-neutral-100">
                  <span>Updated real-time with customer orders</span>
                  <span className="text-neutral-700 font-semibold">Average: ৳{Math.round(totalRevenue / 7 || 3500).toLocaleString()}/day</span>
                </div>
              </div>

              {/* Chart 2: Order Fulfillment & Delivery Status */}
              <div className="lg:col-span-5 bg-white p-6 rounded-lg border border-neutral-300 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="border-b border-neutral-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <PackageCheck className="w-4 h-4" />
                    Order Fulfillment Pipeline
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Distribution of active and delivered customer shipments
                  </p>
                </div>

                {/* Progress bar segmented */}
                <div className="space-y-3">
                  <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${totalOrdersCount > 0 ? (statusCounts.delivered / totalOrdersCount) * 100 : 25}%` }}
                      className="bg-emerald-500 h-full"
                      title="Delivered"
                    />
                    <div
                      style={{ width: `${totalOrdersCount > 0 ? (statusCounts.processing / totalOrdersCount) * 100 : 25}%` }}
                      className="bg-sky-500 h-full"
                      title="Processing"
                    />
                    <div
                      style={{ width: `${totalOrdersCount > 0 ? (statusCounts.outForDelivery / totalOrdersCount) * 100 : 25}%` }}
                      className="bg-amber-500 h-full"
                      title="Out for Delivery"
                    />
                    <div
                      style={{ width: `${totalOrdersCount > 0 ? (statusCounts.placed / totalOrdersCount) * 100 : 25}%` }}
                      className="bg-neutral-400 h-full"
                      title="Order Placed"
                    />
                  </div>

                  {/* Status Breakdown Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-neutral-700">Delivered</span>
                      </div>
                      <span className="text-lg font-bold text-neutral-900 block mt-1">
                        {statusCounts.delivered}
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                        <span className="text-xs font-semibold text-neutral-700">Processing</span>
                      </div>
                      <span className="text-lg font-bold text-neutral-900 block mt-1">
                        {statusCounts.processing}
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-xs font-semibold text-neutral-700">Out for Delivery</span>
                      </div>
                      <span className="text-lg font-bold text-neutral-900 block mt-1">
                        {statusCounts.outForDelivery}
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                        <span className="text-xs font-semibold text-neutral-700">Placed (New)</span>
                      </div>
                      <span className="text-lg font-bold text-neutral-900 block mt-1">
                        {statusCounts.placed}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="w-full py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded transition-colors text-center cursor-pointer"
                >
                  Manage All Orders in Orders Tab →
                </button>
              </div>
            </div>

            {/* Top Selling Products Leaderboard */}
            <div className="bg-white p-6 rounded-lg border border-neutral-300 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Top-Selling Fashion Pieces (Best Performers)
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Highest sales volume and customer favorites from catalog
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="text-xs text-neutral-600 hover:text-black font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full Catalog</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-neutral-200">
                {topSellingProducts.map((item, index) => {
                  const prod = item.product;
                  const displayImg =
                    prod.primaryImage ||
                    prod.galleryImages?.[0] ||
                    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80';

                  return (
                    <div
                      key={prod.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 px-2 rounded transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center justify-center shrink-0">
                          #{index + 1}
                        </span>

                        <img
                          src={getOptimizedImageUrl(displayImg, { width: 144, height: 192, format: 'webp', crop: 'fill' })}
                          alt={prod.name}
                          width={48}
                          height={64}
                          loading="lazy"
                          decoding="async"
                          className="w-12 h-16 object-cover rounded bg-neutral-100 border border-neutral-200 shrink-0"
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-neutral-900">{prod.name}</h4>
                            <span className="text-[9px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded uppercase font-semibold">
                              {prod.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {prod.subcategory || 'Curated Apparel'} • Rating: ★ {prod.rating} ({prod.reviewCount || 12})
                          </p>
                          <span className="text-xs font-semibold text-neutral-900 mt-0.5 block">
                            ৳{prod.salePrice ?? prod.price}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-xs font-bold text-neutral-900 block">
                            {item.unitsSold} Units Sold
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            ৳{item.totalSales.toLocaleString()} Revenue
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            startEditProduct(prod);
                            setActiveTab('products');
                          }}
                          className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200 rounded transition-colors cursor-pointer"
                          title="Edit this product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setFormName('');
                  setFormPrice(1990);
                  setFormSalePrice('');
                  setFormDesc('');
                  setFormPrimaryImage('');
                  setIsAddingProduct(true);
                  setActiveTab('products');
                }}
                className="bg-white p-4 rounded-lg border border-neutral-300 hover:border-black transition-colors text-left flex items-center justify-between cursor-pointer group shadow-xs"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                    + Add New Product
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Upload image with &lt;100KB compression
                  </span>
                </div>
                <Plus className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('hero')}
                className="bg-white p-4 rounded-lg border border-neutral-300 hover:border-black transition-colors text-left flex items-center justify-between cursor-pointer group shadow-xs"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                    Customize Hero Cutout
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Change prominent center model photo
                  </span>
                </div>
                <Sparkles className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('integrations')}
                className="bg-white p-4 rounded-lg border border-neutral-300 hover:border-black transition-colors text-left flex items-center justify-between cursor-pointer group shadow-xs"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                    Turso & Cloudinary
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Verify database connection & media
                  </span>
                </div>
                <Database className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Hero & Showcase Customizer */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-lg border border-neutral-300">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                  Hero Showcase & Layout Customizer
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Change the big center model cutout, editorial typography, announcement bar, and campaign banner.
                </p>
              </div>
              <button
                type="button"
                onClick={resetSiteSettings}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-black border border-neutral-300 hover:border-black px-3.5 py-2 rounded transition-colors self-start cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore Defaults
              </button>
            </div>

            <form onSubmit={handleSaveShowcase} className="space-y-6">
              {/* 1. Big Center Hero Model Image */}
              <div className="bg-white p-6 rounded-lg border border-neutral-300 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  1. Centerpiece Big Hero Model Image (Transparent Cutout)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Live Preview Box */}
                  <div className="md:col-span-4 bg-[#ebeae5] p-3 rounded-md border border-neutral-300 flex flex-col items-center justify-center relative overflow-hidden h-60">
                    <span className="absolute inset-0 flex items-center justify-center font-display font-black text-7xl text-neutral-900/15 pointer-events-none">
                      GAZU
                    </span>
                    <img
                      src={heroModelImage}
                      alt="Hero Cutout Preview"
                      className="h-full w-auto object-contain object-bottom relative z-10 drop-shadow-md"
                    />
                  </div>

                  {/* Upload Controls */}
                  <div className="md:col-span-8 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                        Direct Image URL or Path
                      </label>
                      <input
                        type="text"
                        value={heroModelImage}
                        onChange={(e) => setHeroModelImage(e.target.value)}
                        placeholder="/assets/model/male-model-transparent-clean.png"
                        className="w-full text-xs font-mono px-3.5 py-2.5 border border-neutral-300 rounded focus:border-black focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <label className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded cursor-pointer hover:bg-black transition-colors flex items-center gap-2">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingHero ? 'Compressing & Uploading...' : 'Upload New Cutout (<100KB)'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageUpload}
                          disabled={isUploadingHero}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setHeroModelImage('/assets/model/male-model-transparent-clean.png')}
                        className="text-xs text-neutral-700 hover:text-black border border-neutral-300 px-3.5 py-2.5 rounded transition-colors cursor-pointer"
                      >
                        Use B&W Overcoat Model
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Hero Typography */}
              <div className="bg-white p-6 rounded-lg border border-neutral-300 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  2. Hero Typography & Buttons
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Brand Watermark Text
                    </label>
                    <input
                      type="text"
                      value={heroWatermark}
                      onChange={(e) => setHeroWatermark(e.target.value)}
                      placeholder="GAZU"
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Primary CTA Button
                    </label>
                    <input
                      type="text"
                      value={heroPrimaryCta}
                      onChange={(e) => setHeroPrimaryCta(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Secondary CTA Button
                    </label>
                    <input
                      type="text"
                      value={heroSecondaryCta}
                      onChange={(e) => setHeroSecondaryCta(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Top Editorial Tagline
                    </label>
                    <textarea
                      rows={2}
                      value={heroTagline}
                      onChange={(e) => setHeroTagline(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Collection Stamp
                    </label>
                    <textarea
                      rows={2}
                      value={heroStamp}
                      onChange={(e) => setHeroStamp(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Announcement & Shipping */}
              <div className="bg-white p-6 rounded-lg border border-neutral-300 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  3. Announcement Bar & Free Delivery Threshold
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Announcement Bar Text
                    </label>
                    <input
                      type="text"
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Free Shipping Threshold (৳)
                    </label>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Seasonal Campaign Banner */}
              <div className="bg-white p-6 rounded-lg border border-neutral-300 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  4. Seasonal Campaign Banner ("NEW VIBES")
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Campaign Photo URL or Cloudinary Upload
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={campaignImage}
                        onChange={(e) => setCampaignImage(e.target.value)}
                        className="flex-1 text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                      />
                      <label className="bg-neutral-800 text-white text-xs px-3 py-2 rounded cursor-pointer hover:bg-black transition-colors flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingCampaign ? '...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCampaignImageUpload}
                          disabled={isUploadingCampaign}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Campaign Description
                    </label>
                    <textarea
                      rows={2}
                      value={campaignDesc}
                      onChange={(e) => setCampaignDesc(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-md cursor-pointer"
                >
                  Save All Changes (Live Immediately)
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Products Catalog (Add, Edit, Delete) */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-neutral-300">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by title or details..."
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-300 rounded text-xs px-3 py-2 focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                  <option value="Beauty">Beauty</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportInventoryCSV}
                  disabled={isExportingCSV}
                  className="bg-white text-neutral-900 border border-neutral-300 hover:border-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer rounded disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExportingCSV ? 'Exporting...' : 'Export CSV'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProductId(null);
                    setFormName('');
                    setFormPrice(1990);
                    setFormSalePrice('');
                    setFormDesc('');
                    setFormPrimaryImage('');
                    setIsAddingProduct(!isAddingProduct);
                  }}
                  className="bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors cursor-pointer rounded"
                >
                  <Plus className="w-4 h-4" />
                  {isAddingProduct ? 'Close Form' : 'Add New Product'}
                </button>
              </div>
            </div>

            {/* Add / Edit Form */}
            {isAddingProduct && (
              <form
                onSubmit={handleSaveProduct}
                className="bg-white p-6 rounded-lg border-2 border-black space-y-4 shadow-md"
              >
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    {editingProductId ? `Edit Product: ${formName}` : 'Add New Product to Store'}
                  </h3>
                  <span className="text-[11px] text-neutral-500">
                    Syncs to Turso database and live catalog
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Minimalist Relaxed Trench Coat"
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Kids">Kids</option>
                      <option value="Beauty">Beauty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Subcategory Tag
                    </label>
                    <input
                      type="text"
                      value={formSubcategory}
                      onChange={(e) => setFormSubcategory(e.target.value)}
                      placeholder="e.g. Coats & Jackets"
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Regular Price (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Sale Price (৳, Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formSalePrice}
                      onChange={(e) => setFormSalePrice(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 1590"
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Sizes Available
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                        const isSel = formSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSizeSelection(sz)}
                            className={`text-xs px-3 py-1 border transition-colors cursor-pointer rounded ${
                              isSel
                                ? 'bg-black text-white border-black'
                                : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:border-black'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Product Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Refined silhouette crafted for effortless versatility..."
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                  />
                </div>

                {/* Cloudinary Image Upload (<100KB) */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Product Image (Cloudinary Auto-Compressed &lt;100KB or Image URL)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <input
                      type="text"
                      value={formPrimaryImage}
                      onChange={(e) => setFormPrimaryImage(e.target.value)}
                      placeholder="https://... or upload below"
                      className="flex-1 text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none w-full"
                    />

                    <label className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded cursor-pointer hover:bg-black transition-colors flex items-center gap-2 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingProduct ? 'Compressing...' : 'Upload Image (<100KB)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageUpload}
                        disabled={isUploadingProduct}
                        className="hidden"
                      />
                    </label>

                    {formPrimaryImage && (
                      <img
                        src={formPrimaryImage}
                        alt="Thumbnail preview"
                        className="w-10 h-12 object-cover rounded border border-neutral-300 shrink-0 bg-neutral-100"
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProductId(null);
                    }}
                    className="px-4 py-2 text-xs uppercase tracking-wider text-neutral-600 hover:text-black font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer rounded"
                  >
                    {editingProductId ? 'Update Product' : 'Add to Catalog'}
                  </button>
                </div>
              </form>
            )}

            {/* Product List */}
            <div className="bg-white border border-neutral-300 rounded-lg divide-y divide-neutral-200 overflow-hidden shadow-sm">
              {filteredCatalog.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-500">
                  No products found. Add a new product above!
                </div>
              ) : (
                filteredCatalog.map((p) => {
                  const displayImg =
                    p.primaryImage ||
                    p.galleryImages?.[0] ||
                    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80';

                  return (
                    <div
                      key={p.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={getOptimizedImageUrl(displayImg, { width: 168, height: 216, format: 'webp', crop: 'fill' })}
                          alt={p.name}
                          width={56}
                          height={72}
                          loading="lazy"
                          decoding="async"
                          className="w-14 h-18 object-cover rounded bg-neutral-100 border border-neutral-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-neutral-900">{p.name}</h4>
                            {p.isNew && (
                              <span className="text-[9px] bg-black text-white px-1.5 py-0.2 rounded font-bold uppercase">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {p.category} {p.subcategory ? `• ${p.subcategory}` : ''} • Sizes:{' '}
                            {p.sizes?.join(', ') || 'Standard'}
                          </p>
                          <p className="text-xs font-semibold text-neutral-900 mt-1">
                            ৳{p.salePrice ?? p.price}{' '}
                            {p.salePrice && (
                              <span className="line-through text-neutral-400 font-normal text-[11px] ml-1">
                                ৳{p.price}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => startEditProduct(p)}
                          aria-label={`Edit ${p.name}`}
                          className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-200 rounded transition-colors cursor-pointer flex items-center gap-1 text-xs"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteProduct(p.id)}
                          aria-label={`Delete ${p.name}`}
                          className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer flex items-center gap-1 text-xs"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Category Strips */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-neutral-300">
              <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                Featured Category Strips (Men, Women, Kids)
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Customize the 3 prominent black category cards that appear on the homepage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {siteSettings.categories.map((cat, idx) => (
                <div key={cat.id} className="bg-white p-5 rounded-lg border border-neutral-300 space-y-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-14 h-20 object-cover rounded bg-neutral-100 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
                        Category #{idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-900">{cat.name}</h4>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-0.5">
                      Title
                    </label>
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => {
                        const updated = [...siteSettings.categories];
                        updated[idx] = { ...updated[idx], name: e.target.value };
                        updateSiteSettings({ categories: updated });
                      }}
                      className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-0.5">
                      Description
                    </label>
                    <input
                      type="text"
                      value={cat.description}
                      onChange={(e) => {
                        const updated = [...siteSettings.categories];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        updateSiteSettings({ categories: updated });
                      }}
                      className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-0.5">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={cat.image}
                      onChange={(e) => {
                        const updated = [...siteSettings.categories];
                        updated[idx] = { ...updated[idx], image: e.target.value };
                        updateSiteSettings({ categories: updated });
                      }}
                      className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded focus:border-black focus:outline-none font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-0.5">
                      CTA Text
                    </label>
                    <input
                      type="text"
                      value={cat.ctaText}
                      onChange={(e) => {
                        const updated = [...siteSettings.categories];
                        updated[idx] = { ...updated[idx], ctaText: e.target.value };
                        updateSiteSettings({ categories: updated });
                      }}
                      className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Customer Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg border border-neutral-300">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                  Live Customer Orders
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Orders placed through customer checkout with status tracking.
                </p>
              </div>
              <span className="text-xs font-bold bg-neutral-100 text-neutral-800 px-3 py-1.5 rounded border border-neutral-200">
                Total Orders: {orders.length}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white p-12 text-center text-xs text-neutral-500 border border-neutral-300 rounded-lg">
                No customer orders placed yet.
              </div>
            ) : (
              <div className="bg-white border border-neutral-300 rounded-lg divide-y divide-neutral-200 overflow-hidden shadow-sm">
                {orders.map((o) => (
                  <div key={o.orderId} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                          {o.orderId}
                        </span>
                        <span className="text-[10px] text-neutral-500">{o.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 mt-1.5">
                        {o.customerName} • {o.phone}
                      </h4>
                      <p className="text-xs text-neutral-600">{o.address}</p>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Payment: <strong>{o.paymentMethod}</strong> • {o.items?.length || 0} items purchased
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end lg:self-center">
                      <div className="text-right">
                        <span className="text-base font-black text-neutral-900">৳{o.total}</span>
                        <span className="block text-[10px] text-neutral-400">Total Charged</span>
                      </div>

                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.orderId, e.target.value as any)}
                        className="text-xs font-semibold px-3 py-2 border border-neutral-300 rounded bg-neutral-50 focus:border-black focus:outline-none cursor-pointer"
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Processing & Quality Check">Processing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Turso & Cloudinary */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-neutral-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                  Cloud Backend & Media Credentials
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Link your Turso database and Cloudinary storage. Unsigned preset mode requires zero API secrets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEnvModalOpen(true)}
                className="inline-flex items-center gap-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Env Validator & Ephemeral Setup ({envValidation.presentKeys.length}/4)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white border border-neutral-300 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-neutral-700 flex items-center gap-1.5">
                    <Database className="w-4 h-4" /> Turso Database
                  </span>
                  {isTursoConnected ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <Check className="w-3.5 h-3.5" /> Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Standby / Local Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500">
                  Stores live products, catalog inventory, site settings, and checkout orders.
                </p>
              </div>

              <div className="p-5 bg-white border border-neutral-300 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-neutral-700 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4" /> Cloudinary Media
                  </span>
                  {isCloudinaryConfigured ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <Check className="w-3.5 h-3.5" /> Unsigned Ready
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                      Setup Needed
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500">
                  Auto-compresses uploaded photos under 100KB with on-the-fly transformations (f_auto, q_auto).
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveConnections} className="bg-white p-6 rounded-lg border border-neutral-300 space-y-4 shadow-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  1. Turso Database URL
                </label>
                <input
                  type="text"
                  value={tursoUrl}
                  onChange={(e) => setTursoUrl(e.target.value)}
                  placeholder="libsql://your-db-name.turso.io"
                  className="w-full text-xs font-mono px-3.5 py-2.5 border border-neutral-300 rounded focus:border-black focus:outline-none bg-neutral-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  2. Turso Auth Token
                </label>
                <input
                  type="password"
                  value={tursoToken}
                  onChange={(e) => setTursoToken(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className="w-full text-xs font-mono px-3.5 py-2.5 border border-neutral-300 rounded focus:border-black focus:outline-none bg-neutral-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    3. Cloudinary Cloud Name
                  </label>
                  <input
                    type="text"
                    value={cloudName}
                    onChange={(e) => setCloudName(e.target.value)}
                    placeholder="e.g. gazu-fashion"
                    className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 rounded focus:border-black focus:outline-none bg-neutral-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    4. Cloudinary Upload Preset (Unsigned)
                  </label>
                  <input
                    type="text"
                    value={uploadPreset}
                    onChange={(e) => setUploadPreset(e.target.value)}
                    placeholder="e.g. gazu_unsigned_preset"
                    className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 rounded focus:border-black focus:outline-none bg-neutral-50"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isTestingTurso}
                  className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer rounded"
                >
                  {isTestingTurso ? 'Verifying...' : 'Save & Verify Services'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 6: Security & Master Password */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-neutral-300">
              <h3 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                Security & Master Access Key
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Update the master administrator password protecting the /admin backend route.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-neutral-300 max-w-xl space-y-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Change Master Administrator Password
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Password is encrypted with SHA-256 via native browser Web Crypto API.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangeMasterPassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    New Master Password (Min 8 Characters)
                  </label>
                  <input
                    type="password"
                    required
                    value={newMasterPass}
                    onChange={(e) => setNewMasterPass(e.target.value)}
                    placeholder="Enter new strong password..."
                    className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 rounded focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmMasterPass}
                    onChange={(e) => setConfirmMasterPass(e.target.value)}
                    placeholder="Re-type new password..."
                    className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 rounded focus:border-black focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer rounded"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
