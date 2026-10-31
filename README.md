# GAZU — Editorial Fashion Storefront

A modern, responsive fashion e-commerce storefront for **GAZU**, crafted with an editorial, minimalist aesthetic inspired by high-end studio fashion campaigns.

## Key Features

- **Editorial Homepage Layout**:
  - Slim black announcement bar with free shipping threshold progress (`৳999`) and quick links.
  - Sticky header with category navigation (`MEN`, `WOMEN`, `KIDS`, `BEAUTY`), centered grotesque `GAZU` wordmark, and interactive search, wishlist, login, and cart badges.
  - Giant hero typography watermark with editorial model imagery and quick collection CTA buttons.
  - Deep black category showcase strip (`MEN`, `WOMEN`, `KIDS`).
  - Wide seasonal campaign banner (`NEW VIBES`).
  - Service benefits row: Fast Delivery, Easy Returns (15 Days), Quality Assured, Secure Payment.
  - "BEST OF GAZU" product catalog with category filter tabs, subcategory filters, sorting (featured, price, newest, rating), and color/size swatches.
  - Clean monochrome footer with email newsletter validation, client care links, social media, and store information.
- **Interactive Storefront Capabilities**:
  - **Cart Drawer**: Slide-over bag with free delivery progress calculation, quantity adjustments, item removal, and promo code support (`GAZU10`, `GAZU20`, `WELCOME15`).
  - **Wishlist Drawer**: Instant saving and 1-tap "Move to Bag" functionality.
  - **Instant Search**: Fast local catalog search with keyword tags and query highlighting.
  - **Product Detail Modal**: Multi-angle gallery, color selector, interactive size selection, expandable size guide, composition, and care tips.
  - **Demo Checkout Flow**: Multi-step checkout with contact details, address validation, delivery options (Standard Free vs 24h Express), and payment methods (Cash on Delivery, Card, bKash / Nagad).
  - **Demo Account & Order Tracking**: Instant 1-click test sign-in, order history, and live milestone shipment status stepper.
  - **Robust Fallback Safety**: Built-in SVG data URL image fallback ensures no broken images ever appear.
  - **Persistent LocalStorage**: Cart, wishlist, and orders persist across page reloads.

## Centralized Configuration

All global settings can be edited in one single file:
- `src/config/siteConfig.ts`:
  - Currency symbol (default `৳`) and currency code (`BDT`)
  - Free delivery threshold (`999`)
  - Shipping rates (Standard `120`, Express `220`)
  - Announcement bar copy and quick links
  - Cloudinary delivery settings and fallback image generation

Product data is centralized in:
- `src/data/products.ts`:
  - Product IDs, titles, categories, pricing, sale prices, sizes, colors, and image URLs.

## Cloudinary Image Setup

To deliver images through your Cloudinary account:
1. Set `VITE_CLOUDINARY_CLOUD_NAME="your-cloud-name"` in `.env.local` or directly in `src/config/siteConfig.ts`.
2. Specify Cloudinary public IDs (e.g. `gazu/trench_coat_v1`) in `src/data/products.ts`.
3. The helper in `src/config/siteConfig.ts` will automatically apply responsive width sizing, auto-formatting (`f_auto`), and quality optimization (`q_auto`).
*Note: Never put Cloudinary API secrets in client-side code.*

## Local Development

```bash
# Install dependencies
npm install

# Run unit tests (Node test runner)
npx --yes tsx --test src/utils/cartRules.test.ts

# Start dev server on port 3000
npm run dev

# Build for production
npm run build
```

## Cloudflare Pages / Workers Deployment

1. **Build Command**: `npm run build`
2. **Build Output Directory**: `dist`
3. **SPA Routing**: The `public/_redirects` file (`/* /index.html 200`) is copied to `dist/_redirects` during build to ensure direct page refreshes work seamlessly.
4. **Environment Variables**: Add `VITE_CLOUDINARY_CLOUD_NAME` in Cloudflare Pages dashboard under Settings > Environment Variables if using Cloudinary.
