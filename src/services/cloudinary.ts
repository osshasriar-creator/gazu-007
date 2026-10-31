/**
 * Cloudinary Integration & Dynamic Image Optimization Utility
 *
 * Features:
 * - Secure unsigned upload implementation (uses only Cloud Name and Unsigned Upload Preset).
 * - Dynamic Cloudinary URL parameter builder (`f_webp`, `q_auto:good`, `c_fill`, `g_auto`, `w_...`, `h_...`).
 * - Idempotent transformation replacement (prevents duplicate transformation segments).
 * - Responsive `srcSet`, `sizes`, and explicit `width`/`height` attributes to eliminate Cumulative Layout Shift (CLS)
 *   and maximize page load speed.
 */

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'thumb' | 'scale';
  gravity?: 'auto' | 'face' | 'center' | 'north';
  quality?: 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | 'auto:low' | number;
  format?: 'webp' | 'auto' | 'avif';
  dpr?: 'auto' | number;
}

export type ProductImageVariant = 'card' | 'detail' | 'thumbnail' | 'search' | 'banner';

export interface ResponsiveImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  width: number;
  height: number;
  loading: 'lazy' | 'eager';
  decoding: 'async';
}

const CONFIG_KEY = 'gazu_cloudinary_config';

export function getCloudinaryConfig(): CloudinaryConfig {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(CONFIG_KEY) : null;
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore invalid JSON
    }
  }

  const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
  return {
    cloudName: metaEnv.VITE_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  };
}

export function saveCloudinaryConfig(config: CloudinaryConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }
}

/**
 * Strips any existing transformation segment from a Cloudinary `/image/upload/` URL
 * so new dynamic parameters can be cleanly applied without nesting.
 */
function stripExistingCloudinaryTransformations(url: string): string {
  const uploadMarker = '/image/upload/';
  const idx = url.indexOf(uploadMarker);
  if (idx === -1) return url;

  const prefix = url.slice(0, idx + uploadMarker.length);
  const rest = url.slice(idx + uploadMarker.length);

  // Split path segments after /image/upload/
  const segments = rest.split('/');
  if (segments.length > 1) {
    const firstSeg = segments[0];
    // A transformation segment typically contains commas or key_value pairs like f_, q_, w_, c_, dpr_
    // and is NOT a version segment like v1712345678
    const isVersionSegment = /^v\d+$/.test(firstSeg);
    const looksLikeTransform =
      !isVersionSegment &&
      (firstSeg.includes(',') || /^(f_|q_|w_|h_|c_|g_|dpr_|ar_|e_)/.test(firstSeg));

    if (looksLikeTransform) {
      return prefix + segments.slice(1).join('/');
    }
  }

  return url;
}

/**
 * Transforms an image URL on-the-fly with dynamic sizing and WebP optimization.
 * - For Cloudinary URLs: injects `f_webp,q_auto:good,c_fill,g_auto,w_...,h_...`
 * - For Unsplash catalog URLs: sets `fm=webp&auto=format&fit=crop&w=...&h=...&q=80`
 */
export function getOptimizedImageUrl(
  url: string,
  options: ImageTransformOptions = {}
): string {
  if (!url) return '';

  const {
    width = 600,
    height,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto:good',
    format = 'webp',
    dpr = 'auto',
  } = options;

  // 1. Handle Cloudinary URLs
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    const cleanUrl = stripExistingCloudinaryTransformations(url);
    const transformations = [
      `f_${format}`,
      `q_${quality}`,
      `c_${crop}`,
      crop === 'fill' || crop === 'thumb' ? `g_${gravity}` : '',
      width ? `w_${Math.round(width)}` : '',
      height ? `h_${Math.round(height)}` : '',
      dpr ? `dpr_${dpr}` : '',
    ]
      .filter(Boolean)
      .join(',');

    return cleanUrl.replace('/image/upload/', `/image/upload/${transformations}/`);
  }

  // 2. Handle Unsplash URLs (used in default curated catalog) with WebP & dynamic resize
  if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('fm', format === 'auto' ? 'webp' : format);
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      if (width) parsed.searchParams.set('w', String(Math.round(width)));
      if (height) parsed.searchParams.set('h', String(Math.round(height)));
      parsed.searchParams.set('q', quality === 'auto:eco' ? '72' : '80');
      return parsed.toString();
    } catch {
      return url;
    }
  }

  return url;
}

/**
 * Preset configurations for responsive product image variants across the storefront.
 * Enforces a consistent 3:4 aspect ratio for fashion product imagery and provides
 * explicit width/height attributes for zero layout shift.
 */
const VARIANT_PRESETS: Record<
  ProductImageVariant,
  {
    width: number;
    height: number;
    widths: number[];
    sizes: string;
    quality: ImageTransformOptions['quality'];
    crop: ImageTransformOptions['crop'];
    loading: 'lazy' | 'eager';
  }
> = {
  card: {
    width: 600,
    height: 800,
    widths: [320, 480, 600, 800],
    sizes: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
    quality: 'auto:good',
    crop: 'fill',
    loading: 'lazy',
  },
  detail: {
    width: 800,
    height: 1067,
    widths: [480, 640, 800, 1080],
    sizes: '(max-width: 768px) 92vw, 440px',
    quality: 'auto:good',
    crop: 'fill',
    loading: 'eager',
  },
  thumbnail: {
    width: 160,
    height: 200,
    widths: [80, 160, 240],
    sizes: '80px',
    quality: 'auto:eco',
    crop: 'fill',
    loading: 'lazy',
  },
  search: {
    width: 240,
    height: 320,
    widths: [120, 240, 360],
    sizes: '(max-width: 640px) 45vw, 180px',
    quality: 'auto:eco',
    crop: 'fill',
    loading: 'lazy',
  },
  banner: {
    width: 1200,
    height: 900,
    widths: [640, 960, 1200, 1600],
    sizes: '(max-width: 768px) 100vw, 50vw',
    quality: 'auto:good',
    crop: 'fill',
    loading: 'lazy',
  },
};

/**
 * Generates responsive `src`, `srcSet`, `sizes`, `width`, `height`, `loading`, and `decoding`
 * attributes for any product or editorial image URL.
 */
export function getResponsiveImageProps(
  url: string,
  variant: ProductImageVariant = 'card',
  overrides?: Partial<{
    width: number;
    height: number;
    loading: 'lazy' | 'eager';
    sizes: string;
  }>
): ResponsiveImageProps {
  const preset = VARIANT_PRESETS[variant];
  const targetWidth = overrides?.width || preset.width;
  const targetHeight = overrides?.height || preset.height;
  const aspectRatio = targetHeight / targetWidth;

  const src = getOptimizedImageUrl(url, {
    width: targetWidth,
    height: targetHeight,
    crop: preset.crop,
    quality: preset.quality,
    format: 'webp',
  });

  // Build responsive srcSet if URL supports dynamic resizing (Cloudinary or Unsplash)
  const supportsDynamicResize =
    url.includes('res.cloudinary.com') || url.includes('images.unsplash.com');

  const srcSet = supportsDynamicResize
    ? preset.widths
        .map((w) => {
          const h = Math.round(w * aspectRatio);
          const candidateUrl = getOptimizedImageUrl(url, {
            width: w,
            height: h,
            crop: preset.crop,
            quality: preset.quality,
            format: 'webp',
          });
          return `${candidateUrl} ${w}w`;
        })
        .join(', ')
    : undefined;

  return {
    src,
    srcSet,
    sizes: srcSet ? overrides?.sizes || preset.sizes : undefined,
    width: targetWidth,
    height: targetHeight,
    loading: overrides?.loading || preset.loading,
    decoding: 'async',
  };
}

/**
 * Pre-compresses an image client-side using HTML5 Canvas to guarantee the payload is under 100KB
 * before hitting the Cloudinary unsigned upload endpoint.
 */
export async function precompressImage(
  file: File,
  targetMaxBytes = 100 * 1024 // 100 KB
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Max dimension bounds for fashion catalog (keeps crisp detail while reducing footprint)
        const maxDimension = 1600;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Iterative quality reduction to guarantee under targetMaxBytes
        let quality = 0.88;
        const attemptCompress = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              if (blob.size <= targetMaxBytes || q <= 0.45) {
                resolve(blob);
              } else {
                // Step down quality slightly
                attemptCompress(Math.max(0.45, q - 0.12));
              }
            },
            'image/webp',
            q
          );
        };

        attemptCompress(quality);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Direct Unsigned Upload to Cloudinary.
 * Does NOT require API Secret.
 */
export async function uploadToCloudinary(
  file: File,
  customConfig?: CloudinaryConfig
): Promise<{ url: string; publicId: string; bytes: number }> {
  const config = customConfig || getCloudinaryConfig();

  if (!config.cloudName || !config.uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Please supply Cloud Name and Unsigned Upload Preset.'
    );
  }

  // Pre-compress image in browser under 100KB
  const optimizedBlob = await precompressImage(file, 95 * 1024);

  const formData = new FormData();
  formData.append('file', optimizedBlob, file.name.replace(/\.[^/.]+$/, '') + '.webp');
  formData.append('upload_preset', config.uploadPreset);

  const endpoint = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Cloudinary upload failed with status ${response.status}`
    );
  }

  const result = await response.json();

  // Return optimized delivery URL with WebP and dynamic sizing parameters
  const optimizedUrl = getOptimizedImageUrl(result.secure_url, {
    width: 800,
    height: 1067,
    crop: 'fill',
    quality: 'auto:good',
    format: 'webp',
  });

  return {
    url: optimizedUrl,
    publicId: result.public_id,
    bytes: result.bytes,
  };
}
