import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Product, PRODUCTS } from '../data/products';
import {
  type CartLineItem,
  type PromoResult,
  calculateSubtotal,
  calculateShipping,
  applyPromoDiscount,
  calculateOrderTotal,
} from '../utils/cartRules';
import { siteConfig, type SiteConfig } from '../config/siteConfig';
import {
  fetchProducts,
  addProduct as addProductToTurso,
  deleteProduct as deleteProductFromTurso,
  createOrder as createTursoOrder,
  getTursoConfig,
  saveTursoConfig,
  initializeTursoSchema,
  type TursoConfig,
} from '../services/tursoService';
import {
  getCloudinaryConfig,
  saveCloudinaryConfig,
  type CloudinaryConfig,
} from '../services/cloudinary';
import {
  validateEnvironment,
  isEnvPromptDismissed,
  type EnvKey,
  type EnvValidationResult,
} from '../utils/envValidator';

export interface UserAccount {
  name: string;
  email: string;
  phone: string;
  savedAddress?: string;
  orderCount: number;
}

export interface DemoOrder {
  orderId: string;
  date: string;
  items: CartLineItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  status: 'Order Placed' | 'Processing & Quality Check' | 'Out for Delivery' | 'Delivered';
}

interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warn';
}

interface StoreContextType {
  // Cart
  cart: CartLineItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartShipping: number;
  cartPromo: PromoResult;
  cartTotal: number;
  applyPromo: (code: string) => PromoResult;
  removePromo: () => void;
  freeShippingProgress: {
    threshold: number;
    needed: number;
    percentage: number;
    isFree: boolean;
  };

  // Wishlist
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;

  // Navigation & Category Filter
  activeCategory: string; // 'All' | 'Men' | 'Women' | 'Kids' | 'Beauty' | 'New In' | 'Best Sellers'
  setActiveCategory: (cat: string) => void;

  // Dynamic Catalog & Turso State
  products: Product[];
  isLoadingProducts: boolean;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Site Customization & Dynamic Settings
  siteSettings: SiteConfig;
  updateSiteSettings: (settings: Partial<SiteConfig>) => void;
  resetSiteSettings: () => void;

  // Integration Configs
  tursoConfig: TursoConfig;
  updateTursoConfig: (config: TursoConfig) => Promise<boolean>;
  isTursoConnected: boolean;

  cloudinaryConfig: CloudinaryConfig;
  updateCloudinaryConfig: (config: CloudinaryConfig) => void;
  isCloudinaryConfigured: boolean;

  // Environment Validation & Ephemeral Session Setup
  envValidation: EnvValidationResult;
  isEnvModalOpen: boolean;
  setIsEnvModalOpen: (open: boolean) => void;
  applyEphemeralSessionEnv: (values: Record<EnvKey, string>) => Promise<void>;
  clearEphemeralSessionEnv: () => void;

  // Admin Modal
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;

  // Modals & Drawers
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isTrackOrderOpen: boolean;
  setIsTrackOrderOpen: (open: boolean) => void;
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  isAppDownloadOpen: boolean;
  setIsAppDownloadOpen: (open: boolean) => void;

  // Quick View / Product Detail Modal
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Auth (Demo)
  user: UserAccount | null;
  loginDemo: (email: string, name?: string) => void;
  logoutDemo: () => void;

  // Demo Orders
  orders: DemoOrder[];
  placeDemoOrder: (orderData: Omit<DemoOrder, 'orderId' | 'date' | 'status'>) => DemoOrder;
  updateOrderStatus: (orderId: string, newStatus: DemoOrder['status']) => void;
  lastCompletedOrder: DemoOrder | null;

  // Toast
  toasts: ToastNotification[];
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warn') => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'gazu_cart_v1';
const WISHLIST_STORAGE_KEY = 'gazu_wishlist_v1';
const USER_STORAGE_KEY = 'gazu_user_v1';
const ORDERS_STORAGE_KEY = 'gazu_orders_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Safe LocalStorage Loaders
  const [cart, setCart] = useState<CartLineItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['gz-m-01', 'gz-w-01'];
    } catch {
      return ['gz-m-01', 'gz-w-01'];
    }
  });

  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [orders, setOrders] = useState<DemoOrder[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [
        {
          orderId: 'GZ-82019',
          date: 'Yesterday at 4:15 PM',
          items: [
            {
              id: 'sample-1',
              productId: 'gz-m-01',
              name: 'Minimalist Relaxed Overshirt',
              price: 1890,
              salePrice: 1590,
              quantity: 1,
              size: 'M',
              color: 'Charcoal Black',
              image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80',
            },
          ],
          subtotal: 1590,
          discount: 0,
          shipping: 0,
          total: 1590,
          customerName: 'Alex Morgan',
          email: 'alex@example.com',
          phone: '+880 1711-223344',
          address: 'House 42, Road 11, Banani, Dhaka',
          paymentMethod: 'Cash on Delivery',
          status: 'Processing & Quality Check',
        },
      ];
    } catch {
      return [];
    }
  });

  // Navigation & Category state
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Dynamic Catalog State
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Dynamic Site Settings (Hero, Announcement, Campaign, Categories)
  const [siteSettings, setSiteSettings] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem('gazu_site_settings_v1');
      return saved ? { ...siteConfig, ...JSON.parse(saved) } : siteConfig;
    } catch {
      return siteConfig;
    }
  });

  const updateSiteSettings = (newSettings: Partial<SiteConfig>) => {
    setSiteSettings((prev) => {
      const updated: SiteConfig = {
        ...prev,
        ...newSettings,
        hero: { ...prev.hero, ...(newSettings.hero || {}) },
        campaign: { ...prev.campaign, ...(newSettings.campaign || {}) },
        announcement: { ...prev.announcement, ...(newSettings.announcement || {}) },
        shipping: { ...prev.shipping, ...(newSettings.shipping || {}) },
        categories: newSettings.categories || prev.categories,
      };
      try {
        localStorage.setItem('gazu_site_settings_v1', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    showToast('Storefront Settings Updated', 'Changes are live immediately', 'success');
  };

  const resetSiteSettings = () => {
    localStorage.removeItem('gazu_site_settings_v1');
    setSiteSettings(siteConfig);
    showToast('Settings Reset', 'Restored original editorial defaults', 'info');
  };

  // Integration Configs & Environment Validation
  const [envValidation, setEnvValidation] = useState<EnvValidationResult>(() =>
    validateEnvironment()
  );
  const [isEnvModalOpen, setIsEnvModalOpen] = useState<boolean>(() => {
    const initial = validateEnvironment();
    return !initial.isValid && !isEnvPromptDismissed();
  });

  const [tursoConfig, setTursoConfigState] = useState<TursoConfig>(getTursoConfig);
  const [cloudinaryConfig, setCloudinaryConfigState] = useState<CloudinaryConfig>(getCloudinaryConfig);
  const [isTursoConnected, setIsTursoConnected] = useState(false);

  const isCloudinaryConfigured = Boolean(
    cloudinaryConfig.cloudName && cloudinaryConfig.uploadPreset
  );

  // Modals state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);

  // Fetch products from Turso or local on mount & config change
  const refreshProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const items = await fetchProducts();
      if (items && items.length > 0) {
        setProducts(items);
      }
    } catch (err) {
      console.warn('Could not refresh products from Turso:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (tursoConfig.url && tursoConfig.authToken) {
        try {
          const success = await initializeTursoSchema();
          setIsTursoConnected(success);
          if (success) {
            await refreshProducts();
          }
        } catch (err) {
          console.error('Turso init error:', err);
          setIsTursoConnected(false);
        }
      }
    };
    init();
  }, [tursoConfig]);

  const updateTursoConfig = async (config: TursoConfig): Promise<boolean> => {
    saveTursoConfig(config);
    setTursoConfigState(config);
    setEnvValidation(validateEnvironment());
    if (!config.url || !config.authToken) {
      setIsTursoConnected(false);
      return false;
    }
    const success = await initializeTursoSchema();
    setIsTursoConnected(success);
    if (success) {
      await refreshProducts();
      showToast('Turso Database Connected', 'Schema ready & products synced', 'success');
    } else {
      showToast('Turso Connection Failed', 'Please verify your database URL and token', 'warn');
    }
    return success;
  };

  const updateCloudinaryConfig = (config: CloudinaryConfig) => {
    saveCloudinaryConfig(config);
    setCloudinaryConfigState(config);
    setEnvValidation(validateEnvironment());
    showToast('Cloudinary Config Saved', 'Unsigned preset active for image uploads', 'success');
  };

  const applyEphemeralSessionEnv = async (values: Record<EnvKey, string>): Promise<void> => {
    const updatedValidation = validateEnvironment();
    setEnvValidation(updatedValidation);

    const nextCloudinary: CloudinaryConfig = {
      cloudName: updatedValidation.values.VITE_CLOUDINARY_CLOUD_NAME || '',
      uploadPreset: updatedValidation.values.VITE_CLOUDINARY_UPLOAD_PRESET || '',
    };
    const nextTurso: TursoConfig = {
      url: updatedValidation.values.TURSO_DATABASE_URL || '',
      authToken: updatedValidation.values.TURSO_AUTH_TOKEN || '',
    };

    setCloudinaryConfigState(nextCloudinary);
    setTursoConfigState(nextTurso);

    if (nextTurso.url && nextTurso.authToken) {
      try {
        const connected = await initializeTursoSchema();
        setIsTursoConnected(connected);
        if (connected) {
          await refreshProducts();
        }
      } catch {
        setIsTursoConnected(false);
      }
    }

    const activeCount = Object.values(values).filter((v) => v?.trim().length > 0).length;
    showToast(
      'Ephemeral Session Active',
      `${activeCount} variable(s) loaded in sessionStorage for this tab`,
      'success'
    );
  };

  const clearEphemeralSessionEnv = () => {
    const updatedValidation = validateEnvironment();
    setEnvValidation(updatedValidation);
    setCloudinaryConfigState(getCloudinaryConfig());
    setTursoConfigState(getTursoConfig());
    showToast('Session Overrides Cleared', 'Reverted to .env / default configuration', 'info');
  };

  const addProduct = async (prod: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === prod.id);
      if (exists) {
        return prev.map((p) => (p.id === prod.id ? prod : p));
      }
      return [prod, ...prev];
    });

    try {
      const saved = await addProductToTurso(prod);
      setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      showToast('Product Saved', saved.name, 'success');
    } catch (err) {
      console.error('Failed to save to Turso:', err);
      showToast('Saved Locally', 'Turso sync failed, saved in session', 'info');
    }
  };

  const saveProduct = addProduct;

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteProductFromTurso(id);
      showToast('Product Deleted', id, 'info');
    } catch (err) {
      console.error('Failed to delete from Turso:', err);
    }
  };

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastCompletedOrder, setLastCompletedOrder] = useState<DemoOrder | null>(null);

  // Promo code state
  const [appliedPromo, setAppliedPromo] = useState<PromoResult>({
    valid: false,
    code: '',
    discountPercentage: 0,
    discountAmount: 0,
    message: '',
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'warn' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Cart actions
  const addToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    const lineItemId = `${product.id}-${size}-${color}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === lineItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === lineItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      const newItem: CartLineItem = {
        id: lineItemId,
        productId: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        quantity,
        size,
        color,
        image: product.primaryImage,
      };
      return [...prev, newItem];
    });

    showToast('Added to bag', `${product.name} (${size})`, 'success');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo({ valid: false, code: '', discountPercentage: 0, discountAmount: 0, message: '' });
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = calculateSubtotal(cart);

  // Recalculate promo discount if subtotal changes
  const activePromoResult: PromoResult = appliedPromo.valid
    ? applyPromoDiscount(cartSubtotal, appliedPromo.code)
    : appliedPromo;

  const cartShipping = calculateShipping(
    cartSubtotal - (activePromoResult.code === 'FREESHIP' ? cartSubtotal : 0),
    siteConfig.shipping.freeThreshold,
    siteConfig.shipping.standardRate
  );

  const cartTotal = calculateOrderTotal(
    cartSubtotal,
    activePromoResult.code === 'FREESHIP' ? 0 : activePromoResult.discountAmount,
    activePromoResult.code === 'FREESHIP' ? 0 : cartShipping
  );

  const applyPromo = (code: string): PromoResult => {
    const result = applyPromoDiscount(cartSubtotal, code);
    setAppliedPromo(result);
    if (result.valid) {
      showToast('Promo code applied!', result.message, 'success');
    } else {
      showToast('Promo invalid', result.message, 'warn');
    }
    return result;
  };

  const removePromo = () => {
    setAppliedPromo({ valid: false, code: '', discountPercentage: 0, discountAmount: 0, message: '' });
    showToast('Promo code removed', undefined, 'info');
  };

  // Free shipping progress
  const freeThreshold = siteConfig.shipping.freeThreshold;
  const remainingForFreeShipping = Math.max(0, freeThreshold - cartSubtotal);
  const freeShippingProgress = {
    threshold: freeThreshold,
    needed: remainingForFreeShipping,
    percentage: Math.min(100, Math.round((cartSubtotal / freeThreshold) * 100)),
    isFree: cartSubtotal >= freeThreshold,
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const prod = PRODUCTS.find((p) => p.id === productId);
      if (exists) {
        showToast('Removed from wishlist', prod?.name, 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to wishlist', prod?.name, 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);
  const wishlistCount = wishlist.length;

  // Demo Auth
  const loginDemo = (email: string, name: string = 'Alex Morgan') => {
    const newUser: UserAccount = {
      name,
      email,
      phone: '+880 1711-223344',
      savedAddress: 'House 42, Road 11, Banani, Dhaka',
      orderCount: orders.length,
    };
    setUser(newUser);
    setIsAuthOpen(false);
    showToast('Welcome back', `Signed in as ${name}`, 'success');
  };

  const logoutDemo = () => {
    setUser(null);
    showToast('Signed out', 'You are in guest browsing mode', 'info');
  };

  // Demo & Turso Order
  const placeDemoOrder = (orderData: Omit<DemoOrder, 'orderId' | 'date' | 'status'>): DemoOrder => {
    const newOrderId = `GZ-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: DemoOrder = {
      ...orderData,
      orderId: newOrderId,
      date: 'Just now',
      status: 'Order Placed',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLastCompletedOrder(newOrder);
    clearCart();

    // Async record into Turso
    createTursoOrder({
      customerName: orderData.customerName,
      customerPhone: orderData.phone,
      customerEmail: orderData.email,
      address: orderData.address,
      city: 'Dhaka',
      postalCode: '1212',
      items: orderData.items.map((it) => ({
        productId: it.productId,
        productName: it.name,
        size: it.size,
        color: it.color,
        quantity: it.quantity,
        price: it.salePrice ?? it.price,
        image: it.image,
      })),
      total: orderData.total,
      shippingFee: orderData.shipping,
      paymentMethod: orderData.paymentMethod,
    }).catch((err) => {
      console.warn('Failed to sync order to Turso:', err);
    });

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: DemoOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );
    showToast('Order Status Updated', `${orderId} marked as ${newStatus}`, 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartShipping,
        cartPromo: activePromoResult,
        cartTotal,
        applyPromo,
        removePromo,
        freeShippingProgress,

        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,

        activeCategory,
        setActiveCategory,

        products,
        isLoadingProducts,
        refreshProducts,
        addProduct,
        saveProduct,
        deleteProduct,

        siteSettings,
        updateSiteSettings,
        resetSiteSettings,

        tursoConfig,
        updateTursoConfig,
        isTursoConnected,

        cloudinaryConfig,
        updateCloudinaryConfig,
        isCloudinaryConfigured,

        envValidation,
        isEnvModalOpen,
        setIsEnvModalOpen,
        applyEphemeralSessionEnv,
        clearEphemeralSessionEnv,

        isAdminOpen,
        setIsAdminOpen,

        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isSearchOpen,
        setIsSearchOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAuthOpen,
        setIsAuthOpen,
        isTrackOrderOpen,
        setIsTrackOrderOpen,
        isHelpOpen,
        setIsHelpOpen,
        isAppDownloadOpen,
        setIsAppDownloadOpen,

        quickViewProduct,
        setQuickViewProduct,

        searchQuery,
        setSearchQuery,

        user,
        loginDemo,
        logoutDemo,

        orders,
        placeDemoOrder,
        updateOrderStatus,
        lastCompletedOrder,

        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
