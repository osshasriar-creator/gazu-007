import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getOptimizedImageUrl, getResponsiveImageProps } from './cloudinary';

test('getOptimizedImageUrl injects WebP and dynamic dimensions into Cloudinary URL', () => {
  const rawUrl = 'https://res.cloudinary.com/gazu/image/upload/v1700000000/coat.jpg';
  const optimized = getOptimizedImageUrl(rawUrl, {
    width: 600,
    height: 800,
    crop: 'fill',
    format: 'webp',
    quality: 'auto:good',
  });

  assert.equal(
    optimized,
    'https://res.cloudinary.com/gazu/image/upload/f_webp,q_auto:good,c_fill,g_auto,w_600,h_800,dpr_auto/v1700000000/coat.jpg'
  );
});

test('getOptimizedImageUrl replaces existing Cloudinary transformations idempotently', () => {
  const alreadyTransformed =
    'https://res.cloudinary.com/gazu/image/upload/f_auto,q_auto:good,c_limit,w_1000/v1700000000/coat.webp';
  const reOptimized = getOptimizedImageUrl(alreadyTransformed, {
    width: 160,
    height: 200,
    crop: 'fill',
    format: 'webp',
    quality: 'auto:eco',
  });

  assert.equal(
    reOptimized,
    'https://res.cloudinary.com/gazu/image/upload/f_webp,q_auto:eco,c_fill,g_auto,w_160,h_200,dpr_auto/v1700000000/coat.webp'
  );
});

test('getOptimizedImageUrl optimizes Unsplash catalog URLs with WebP and dimensions', () => {
  const unsplashUrl =
    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80';
  const optimized = getOptimizedImageUrl(unsplashUrl, {
    width: 480,
    height: 640,
    format: 'webp',
  });

  assert.match(optimized, /fm=webp/);
  assert.match(optimized, /w=480/);
  assert.match(optimized, /h=640/);
});

test('getResponsiveImageProps generates srcSet, sizes, and explicit width/height attributes', () => {
  const rawUrl = 'https://res.cloudinary.com/gazu/image/upload/v1700000000/jacket.png';
  const props = getResponsiveImageProps(rawUrl, 'card');

  assert.equal(props.width, 600);
  assert.equal(props.height, 800);
  assert.equal(props.loading, 'lazy');
  assert.equal(props.decoding, 'async');
  assert.ok(props.src.includes('f_webp'));
  assert.ok(props.srcSet?.includes('320w'));
  assert.ok(props.srcSet?.includes('600w'));
  assert.ok(props.srcSet?.includes('800w'));
  assert.equal(props.sizes, '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw');
});
