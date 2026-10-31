/**
 * Central Configuration for GAZU E-Commerce
 * Easily configure currency, delivery thresholds, announcement copy, hero text, and Cloudinary settings.
 */

export interface SiteConfig {
  brandName: string;
  brandTagline: string;
  currency: {
    symbol: string;
    code: string;
    placement: 'before' | 'after';
  };
  shipping: {
    freeThreshold: number;
    standardRate: number;
    expressRate: number;
    estimatedDeliveryDays: string;
  };
  announcement: {
    text: string;
    highlightAmount: number;
    links: Array<{ label: string; actionId: string }>;
  };
  hero: {
    tagline: string;
    brandWatermark: string;
    collectionStamp: string;
    ctaPrimary: string;
    ctaSecondary: string;
    // Standalone high-res fashion model image (walking/trench coat look)
    modelImage: string;
  };
  campaign: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    ctaButton: string;
    // Standalone high-res campaign model photo
    modelImage: string;
  };
  categories: Array<{
    id: string;
    name: string;
    categoryKey: string;
    description: string;
    ctaText: string;
    image: string;
  }>;
  contact: {
    supportEmail: string;
    supportPhone: string;
    hours: string;
  };
  cloudinary: {
    cloudName: string;
    baseUrl: string;
    autoFormat: boolean;
    quality: string;
  };
}

export const siteConfig: SiteConfig = {
  brandName: 'GAZU',
  brandTagline: 'FASHION THAT MOVES WITH YOU.',
  currency: {
    symbol: '৳',
    code: 'BDT',
    placement: 'before',
  },
  shipping: {
    freeThreshold: 999,
    standardRate: 120,
    expressRate: 220,
    estimatedDeliveryDays: '2 - 4 business days',
  },
  announcement: {
    text: 'FREE DELIVERY ON ORDERS ABOVE ৳999',
    highlightAmount: 999,
    links: [
      { label: 'DOWNLOAD APP', actionId: 'app' },
      { label: 'TRACK ORDER', actionId: 'track' },
      { label: 'HELP', actionId: 'help' },
    ],
  },
  hero: {
    tagline: 'FASHION\nTHAT MOVES\nWITH YOU.',
    brandWatermark: 'GAZU',
    collectionStamp: 'NEW\nCOLLECTION\n2024',
    // High-fashion black and white male model cutout with transparent background
    modelImage: '/assets/model/male-model-transparent-clean.png',
  },
  campaign: {
    badge: 'NEW SEASON',
    title: 'NEW VIBES',
    subtitle: 'Discover everything new and now.',
    description: 'Discover everything new and now. Muted tones, structural silhouettes, and refined tactile staples.',
    ctaButton: 'EXPLORE COLLECTION',
    modelImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=85',
  },
  categories: [
    {
      id: 'men',
      name: 'MEN',
      categoryKey: 'Men',
      description: 'Elevated everyday essentials.',
      ctaText: 'SHOP MEN →',
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'women',
      name: 'WOMEN',
      categoryKey: 'Women',
      description: 'Effortless style for every you.',
      ctaText: 'SHOP WOMEN →',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'kids',
      name: 'KIDS',
      categoryKey: 'Kids',
      description: 'Comfort meets cool everyday.',
      ctaText: 'SHOP KIDS →',
      image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=700&q=80',
    },
  ],
  contact: {
    supportEmail: 'care@gazu.fashion',
    supportPhone: '+880 1700-000000',
    hours: 'Mon - Sat: 9:00 AM - 9:00 PM',
  },
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    baseUrl: 'https://res.cloudinary.com',
    autoFormat: true,
    quality: 'auto',
  },
};

/**
 * Fallback styled SVG data URI for any failed image load.
 * Ensures no broken-image icon ever appears.
 */
export const FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="#f0efe9">
  <rect width="600" height="800" fill="#f0efe9"/>
  <rect x="20" y="20" width="560" height="760" fill="none" stroke="#e2e0d8" stroke-width="2"/>
  <text x="50%" y="48%" font-family="sans-serif" font-size="28" font-weight="700" fill="#262626" text-anchor="middle" letter-spacing="4">GAZU</text>
  <text x="50%" y="54%" font-family="sans-serif" font-size="12" fill="#737373" text-anchor="middle" letter-spacing="2">EDITORIAL COLLECTION</text>
</svg>
`)}`;

/**
 * Resolves an image URL through Cloudinary if configured, or uses the direct URL,
 * with automatic fallback safety.
 */
export function resolveImageUrl(src: string, width: number = 800): string {
  if (!src) return FALLBACK_IMAGE;

  // If a Cloudinary cloud name is provided and URL is a public ID or raw asset
  if (siteConfig.cloudinary.cloudName && !src.startsWith('http') && !src.startsWith('data:')) {
    const { baseUrl, cloudName, quality, autoFormat } = siteConfig.cloudinary;
    const transforms = [`w_${width}`, 'c_limit', `q_${quality}`, autoFormat ? 'f_auto' : ''].filter(Boolean).join(',');
    return `${baseUrl}/${cloudName}/image/upload/${transforms}/${src}`;
  }

  // If using Unsplash CDN, optimize dimensions
  if (src.includes('images.unsplash.com')) {
    try {
      const url = new URL(src);
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', '80');
      url.searchParams.set('auto', 'format');
      return url.toString();
    } catch {
      return src;
    }
  }

  return src;
}
