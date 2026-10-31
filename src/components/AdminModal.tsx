import React, { useState } from 'react';
import {
  X,
  Database,
  Cloud,
  Plus,
  Trash2,
  Edit2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Layers,
  ShoppingBag,
  Sparkles,
  LayoutTemplate,
  RotateCcw,
  Search,
  Check,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { uploadToCloudinary, getOptimizedImageUrl } from '../services/cloudinary';
import { type Product } from '../data/products';
import { formatCurrency } from '../utils/cartRules';

export const AdminModal: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
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
    saveProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'hero' | 'products' | 'categories' | 'orders' | 'integrations'>('hero');

  // Hero & Showcase Settings Form State
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

  // Image Uploading States
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingCampaign, setIsUploadingCampaign] = useState(false);
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);

  // Connection Credentials State
  const [tursoUrl, setTursoUrl] = useState(tursoConfig.url);
  const [tursoToken, setTursoToken] = useState(tursoConfig.authToken);
  const [cloudName, setCloudName] = useState(cloudinaryConfig.cloudName);
  const [uploadPreset, setUploadPreset] = useState(cloudinaryConfig.uploadPreset);
  const [isTestingTurso, setIsTestingTurso] = useState(false);

  // Product Catalog State
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState<string>('All');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Product Form State (Used for both Create and Edit)
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Men' | 'Women' | 'Kids' | 'Beauty'>('Men');
  const [formSubcategory, setFormSubcategory] = useState('Apparel');
  const [formPrice, setFormPrice] = useState(1990);
  const [formSalePrice, setFormSalePrice] = useState<number | ''>('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrimaryImage, setFormPrimaryImage] = useState('');
  const [formSizes, setFormSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [formInStock, setFormInStock] = useState(true);

  if (!isAdminOpen) return null;

  // Handle Hero Image Upload via Cloudinary
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

  // Save Hero & Showcase
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

  // Open Edit Product
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
    setFormInStock(true);
    setIsAddingProduct(true);
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

  // Save Product (Create or Edit)
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
      // Editing existing product
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

      await saveProduct(updated);
      showToast('Product Updated', updated.name, 'success');
    } else {
      // Creating new product
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

      await saveProduct(newProd);
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

  // Toggle Size in Form
  const toggleSizeSelection = (size: string) => {
    setFormSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Save Connection Config
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

  // Filter products for Catalog tab
  const filteredCatalog = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCatFilter === 'All' || p.category === productCatFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/65 backdrop-blur-sm"
    >
      <div className="bg-[#f6f5f0] text-neutral-900 w-full max-w-5xl h-[92vh] max-h-[850px] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-neutral-300">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <span className="font-display font-black text-xl tracking-tight">GAZU</span>
            <div className="h-4 w-[1px] bg-neutral-300" />
            <span className="bg-black text-white text-[10px] tracking-widest uppercase font-bold px-2 py-0.5 rounded-sm">
              Admin Control Center
            </span>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                  isTursoConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                <Database className="w-3 h-3" />
                {isTursoConnected ? 'Turso DB Active' : 'Local Storage Mode'}
              </span>
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                  isCloudinaryConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                <Cloud className="w-3 h-3" />
                {isCloudinaryConfigured ? 'Cloudinary Ready' : 'Cloudinary Pending'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAdminOpen(false)}
            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close Admin Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-neutral-200 bg-neutral-100 px-4 sm:px-6 gap-2 sm:gap-6 text-xs uppercase tracking-wider font-semibold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`py-3 flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'hero'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Hero & Showcase
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`py-3 flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'products'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Products ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`py-3 flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'categories'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            Category Strips
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-3 flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'orders'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Orders ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`py-3 flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'integrations'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Database className="w-4 h-4" />
            Turso & Cloudinary
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: HERO & SHOWCASE CUSTOMIZER */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                    Hero Showcase & Banner Customizer
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Modify the big center image, typography, announcement bar, and campaign banner in real-time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetSiteSettings}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-black border border-neutral-300 hover:border-black px-3 py-1.5 rounded transition-colors self-start cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore Defaults
                </button>
              </div>

              <form onSubmit={handleSaveShowcase} className="space-y-6">
                {/* 1. Big Center Hero Model Image */}
                <div className="bg-white p-5 rounded-md border border-neutral-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                        1. Centerpiece Big Hero Model Image (Transparent Cutout)
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        This is the prominent cutout image in front of the giant GAZU watermark lettering.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Live Preview Box */}
                    <div className="md:col-span-4 bg-[#ebeae5] p-3 rounded border border-neutral-200 flex flex-col items-center justify-center relative overflow-hidden h-52">
                      <span className="absolute inset-0 flex items-center justify-center font-display font-black text-6xl text-neutral-900/15 pointer-events-none">
                        GAZU
                      </span>
                      <img
                        src={heroModelImage}
                        alt="Hero Preview"
                        className="h-full w-auto object-contain object-bottom relative z-10 drop-shadow-md"
                      />
                    </div>

                    {/* Upload & Options */}
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
                          className="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {/* Cloudinary Upload Trigger */}
                        <label className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2 rounded cursor-pointer hover:bg-black transition-colors flex items-center gap-2">
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

                        {/* Reset to Curated Cutout */}
                        <button
                          type="button"
                          onClick={() => setHeroModelImage('/assets/model/male-model-transparent-clean.png')}
                          className="text-xs text-neutral-700 hover:text-black border border-neutral-300 px-3 py-2 rounded transition-colors cursor-pointer"
                        >
                          Use B&W Overcoat Model
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Tip: For best results, use a transparent PNG or WebP image. When uploaded to Cloudinary, it auto-compresses under 100KB while preserving sharp contrast.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Hero Typography & Buttons */}
                <div className="bg-white p-5 rounded-md border border-neutral-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    2. Hero Typography & Action Buttons
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        placeholder="SHOP NOW"
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
                        placeholder="EXPLORE NEW IN"
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
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
                        Collection Year Stamp
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

                {/* 3. Announcement Bar & Free Delivery Threshold */}
                <div className="bg-white p-5 rounded-md border border-neutral-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    3. Announcement Notice & Free Delivery Threshold
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                        Announcement Bar Text
                      </label>
                      <input
                        type="text"
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        placeholder="FREE DELIVERY ON ORDERS ABOVE ৳999"
                        className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                        Free Delivery Threshold (৳)
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

                {/* 4. Seasonal Campaign Banner "NEW VIBES" */}
                <div className="bg-white p-5 rounded-md border border-neutral-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    4. Seasonal Campaign Banner ("NEW VIBES")
                  </h4>

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
                        Campaign Model Photo URL or Upload
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

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="bg-black text-white px-7 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-md cursor-pointer"
                  >
                    Save All Changes (Live Immediately)
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG (ADD, EDIT, DELETE) */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Product Controls Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search catalog by name or description..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded text-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  <select
                    value={productCatFilter}
                    onChange={(e) => setProductCatFilter(e.target.value)}
                    className="bg-white border border-neutral-300 rounded text-xs px-3 py-2 focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Beauty">Beauty</option>
                  </select>
                </div>

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
                  className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAddingProduct ? 'Close Form' : 'Add New Product'}
                </button>
              </div>

              {/* Product Add / Edit Form */}
              {isAddingProduct && (
                <form
                  onSubmit={handleSaveProduct}
                  className="bg-white p-5 rounded-md border-2 border-black space-y-4 shadow-md"
                >
                  <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      {editingProductId ? `Edit Product: ${formName}` : 'Add New Product to Store'}
                    </h4>
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
                        placeholder="e.g. Minimalist Structured Overcoat"
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
                              className={`text-xs px-3 py-1 border transition-colors cursor-pointer ${
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
                      placeholder="Tailored architecture with effortless proportions..."
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none"
                    />
                  </div>

                  {/* Image Options: Upload or URL */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                      Product Image (Cloudinary Upload &lt;100KB or Image URL)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <input
                        type="text"
                        value={formPrimaryImage}
                        onChange={(e) => setFormPrimaryImage(e.target.value)}
                        placeholder="https://... or upload below"
                        className="flex-1 text-xs px-3 py-2 border border-neutral-300 rounded focus:border-black focus:outline-none w-full"
                      />

                      <label className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2 rounded cursor-pointer hover:bg-black transition-colors flex items-center gap-2 shrink-0">
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
                      className="bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      {editingProductId ? 'Update Product' : 'Add to Catalog'}
                    </button>
                  </div>
                </form>
              )}

              {/* Product Catalog List */}
              <div className="bg-white border border-neutral-200 rounded-md divide-y divide-neutral-200">
                {filteredCatalog.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-500">
                    No products match your current search or filter.
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
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors"
                      >
                        {/* Info & Thumbnail */}
                        <div className="flex items-center gap-3">
                          <img
                            src={displayImg}
                            alt={p.name}
                            className="w-12 h-16 object-cover rounded bg-neutral-100 border border-neutral-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-neutral-900">{p.name}</h5>
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

                        {/* Actions: Edit & Delete */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => startEditProduct(p)}
                            className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-200 rounded transition-colors cursor-pointer flex items-center gap-1 text-xs"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
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

          {/* TAB 3: CATEGORY STRIPS */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Featured Category Strips (Men, Women, Kids)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Customize the 3 prominent black category cards on the homepage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {siteSettings.categories.map((cat, idx) => (
                  <div key={cat.id} className="bg-white p-4 rounded-md border border-neutral-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-14 h-18 object-cover rounded bg-neutral-100"
                      />
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
                          Category {idx + 1}
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

          {/* TAB 4: ORDERS & SALES */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                    Live Customer Orders
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Orders placed via checkout are recorded dynamically.
                  </p>
                </div>
                <span className="text-xs font-semibold bg-neutral-200 px-2.5 py-1 rounded">
                  Total Orders: {orders.length}
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white p-12 text-center text-xs text-neutral-500 border border-neutral-200 rounded-md">
                  No orders placed yet. Place a test order through the storefront cart & checkout!
                </div>
              ) : (
                <div className="bg-white border border-neutral-200 rounded-md divide-y divide-neutral-200">
                  {orders.map((o) => (
                    <div key={o.orderId} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Customer Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold">{o.orderId}</span>
                          <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                            {o.date}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-neutral-900 mt-1">
                          {o.customerName} • {o.phone}
                        </p>
                        <p className="text-[11px] text-neutral-500">{o.address}</p>
                        <p className="text-[11px] text-neutral-600 mt-1">
                          Payment: <strong>{o.paymentMethod}</strong> • Items: {o.items?.length || 0}
                        </p>
                      </div>

                      {/* Status & Total */}
                      <div className="flex items-center gap-4 self-end lg:self-center">
                        <div className="text-right">
                          <span className="text-sm font-bold text-neutral-900">৳{o.total}</span>
                          <span className="block text-[10px] text-neutral-400">Total Charged</span>
                        </div>

                        {/* Status Dropdown */}
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.orderId, e.target.value as any)}
                          className="text-xs font-semibold px-2.5 py-1.5 border border-neutral-300 rounded bg-neutral-50 focus:border-black focus:outline-none cursor-pointer"
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

          {/* TAB 5: TURSO & CLOUDINARY INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Cloud Backend & Media Credentials
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Link your Turso database and Cloudinary storage. Unsigned mode requires zero API secrets.
                </p>
              </div>

              {/* Status Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-neutral-200 rounded-md">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold tracking-wider uppercase text-neutral-700 flex items-center gap-1.5">
                      <Database className="w-4 h-4" /> Turso Database
                    </span>
                    {isTursoConnected ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3.5 h-3.5" /> Standby / Local Mode
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">
                    Stores live products, catalog inventory, site settings, and checkout orders.
                  </p>
                </div>

                <div className="p-4 bg-white border border-neutral-200 rounded-md">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold tracking-wider uppercase text-neutral-700 flex items-center gap-1.5">
                      <Cloud className="w-4 h-4" /> Cloudinary Media
                    </span>
                    {isCloudinaryConfigured ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Unsigned Ready
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3.5 h-3.5" /> Setup Needed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">
                    Auto-compresses uploaded photos under 100KB with on-the-fly transformations (f_auto, q_auto).
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveConnections} className="bg-white p-5 rounded-md border border-neutral-200 space-y-4">
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
                    className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isTestingTurso ? 'Verifying...' : 'Save & Verify Services'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
