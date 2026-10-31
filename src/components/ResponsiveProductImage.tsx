import React, { useState, useEffect } from 'react';
import {
  getResponsiveImageProps,
  getOptimizedImageUrl,
  type ProductImageVariant,
} from '../services/cloudinary';
import { FALLBACK_IMAGE } from '../config/siteConfig';

interface ResponsiveProductImageProps {
  src: string;
  alt: string;
  variant?: ProductImageVariant;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Reusable Product Image component that automatically applies:
 * - Cloudinary / catalog dynamic resize & WebP format optimization (`f_webp,q_auto:good,c_fill,w_...,h_...`)
 * - Responsive `srcSet` and `sizes` attributes for multi-DPI & viewport adaptation
 * - Explicit `width` and `height` HTML attributes to prevent Cumulative Layout Shift (CLS)
 * - Graceful fallback image recovery on network error
 */
export const ResponsiveProductImage: React.FC<ResponsiveProductImageProps> = ({
  src,
  alt,
  variant = 'card',
  className = '',
  width,
  height,
  loading,
  sizes,
  fetchPriority,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const effectiveUrl = !hasError && src ? src : FALLBACK_IMAGE;

  const responsiveProps = getResponsiveImageProps(effectiveUrl, variant, {
    width,
    height,
    loading,
    sizes,
    fetchPriority,
  });

  return (
    <img
      src={responsiveProps.src}
      srcSet={responsiveProps.srcSet}
      sizes={responsiveProps.sizes}
      width={responsiveProps.width}
      height={responsiveProps.height}
      loading={responsiveProps.loading}
      decoding={responsiveProps.decoding}
      fetchPriority={responsiveProps.fetchPriority}
      alt={alt}
      className={className}
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
    />
  );
};

export { getOptimizedImageUrl, getResponsiveImageProps };

