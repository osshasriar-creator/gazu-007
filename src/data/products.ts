export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Men' | 'Women' | 'Kids' | 'Beauty';
  subcategory: string;
  price: number;
  salePrice?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  tag?: string;
  rating: number;
  reviewCount: number;
  colors: ProductColor[];
  sizes: string[];
  primaryImage: string;
  galleryImages: string[];
  description: string;
  details: string[];
  composition: string;
  careGuide: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'gz-m-01',
    name: 'Minimalist Relaxed Overshirt',
    category: 'Men',
    subcategory: 'Shirts & Overshirts',
    price: 1890,
    salePrice: 1590,
    isBestSeller: true,
    tag: 'BEST OF GAZU',
    rating: 4.9,
    reviewCount: 142,
    colors: [
      { name: 'Charcoal Black', hex: '#1c1c1c' },
      { name: 'Washed Olive', hex: '#414833' },
      { name: 'Bone Off-White', hex: '#e8e6df' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    primaryImage: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'An architectural everyday layering piece tailored with a relaxed drape, clean placket, and substantial premium twill cotton fabric.',
    details: [
      'Relaxed boxy silhouette with dropped shoulders',
      'Matte horn button closures',
      'Clean square hem with twin side vents',
      'Heavyweight 280 GSM premium twill',
    ],
    composition: '100% Organic Heavy Twill Cotton',
    careGuide: ['Machine wash cold inside out', 'Do not tumble dry', 'Iron on low temperature'],
  },
  {
    id: 'gz-m-02',
    name: 'Vintage Washed Graphic Tee',
    category: 'Men',
    subcategory: 'T-Shirts',
    price: 990,
    salePrice: 850,
    isBestSeller: true,
    tag: 'NEW VIBES',
    rating: 4.8,
    reviewCount: 98,
    colors: [
      { name: 'Slate Grey', hex: '#595959' },
      { name: 'Faded Black', hex: '#2b2b2b' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    primaryImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Subtly weathered aesthetic wash treated garment with signature minimal chest typography and seamless ribbed collar.',
    details: [
      'Acid washed vintage patina finish',
      'Signature GAZU archival minimal graphic',
      'Pre-shrunk comb cotton',
      'Reinforced double-stitched cuffs',
    ],
    composition: '100% Combed Compact Cotton (220 GSM)',
    careGuide: ['Cold wash with similar colors', 'Hang dry in shade'],
  },
  {
    id: 'gz-m-03',
    name: 'Core Heavyweight Crewneck Tee',
    category: 'Men',
    subcategory: 'T-Shirts',
    price: 1090,
    isBestSeller: true,
    tag: 'ICONIC',
    rating: 4.9,
    reviewCount: 220,
    colors: [
      { name: 'Jet Black', hex: '#0a0a0a' },
      { name: 'Muted Taupe', hex: '#7a7265' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    primaryImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'The foundation of the GAZU everyday uniform. High-density jersey cotton that maintains its sharp boxy shape through endless washes.',
    details: [
      'Tight 1x1 micro-rib collar that will never sag',
      'Straight boxy torso cut with wide sleeves',
      'Heavyweight 260 GSM single jersey',
      'Clean interior neck tape',
    ],
    composition: '100% Ring-Spun Pima Cotton',
    careGuide: ['Gentle cycle 30°C', 'Do not bleach'],
  },
  {
    id: 'gz-m-04',
    name: 'Relaxed Slub Organic Tee',
    category: 'Men',
    subcategory: 'T-Shirts',
    price: 890,
    isNew: true,
    isBestSeller: true,
    tag: 'NEW SEASON',
    rating: 4.7,
    reviewCount: 74,
    colors: [
      { name: 'Bone Off-White', hex: '#f0ede6' },
      { name: 'Raw Natural', hex: '#d9d4c7' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    primaryImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Textured slub knit providing tactile depth and breathable lightness for elevated warm-weather comfort.',
    details: [
      'Natural undyed fiber finish',
      'Curved subtle drop-tail hem',
      'Breathable organic open-weave structure',
    ],
    composition: '100% Certified Organic Cotton',
    careGuide: ['Hand wash or delicate machine wash', 'Flat dry'],
  },
  {
    id: 'gz-m-05',
    name: 'Tailored Relaxed Trench Coat',
    category: 'Men',
    subcategory: 'Outerwear',
    price: 4490,
    salePrice: 3890,
    isNew: true,
    tag: 'HERO EDIT',
    rating: 5.0,
    reviewCount: 56,
    colors: [
      { name: 'Storm Grey', hex: '#484b4d' },
      { name: 'Midnight Charcoal', hex: '#1f2022' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    primaryImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'The definitive silhouette from the 2024 GAZU campaign. Extended length with a fluid architectural drape and clean throat latch.',
    details: [
      'Water-repellent woven gabardine finish',
      'Concealed double-breasted closure',
      'Deep welt storm pockets',
      'Unstructured natural shoulder line',
    ],
    composition: '65% Technical Cotton, 35% Recycled Polyamide',
    careGuide: ['Dry clean only'],
  },
  {
    id: 'gz-m-06',
    name: 'Pleated Wide-Leg Trousers',
    category: 'Men',
    subcategory: 'Trousers',
    price: 2490,
    isBestSeller: true,
    tag: 'ESSENTIAL',
    rating: 4.8,
    reviewCount: 88,
    colors: [
      { name: 'Obsidian Black', hex: '#111111' },
      { name: 'Dark Slate', hex: '#33373d' },
    ],
    sizes: ['30', '32', '34', '36'],
    primaryImage: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Tailored drape trousers with forward double pleats, relaxed taper, and an elasticated hidden waistband for comfort.',
    details: [
      'Deep double front pleats',
      'Concealed drawcord with belt loops',
      'Break hem designed to puddle over sneakers',
    ],
    composition: '70% Viscose, 28% Wool, 2% Elastane',
    careGuide: ['Gentle cycle or dry clean'],
  },
  {
    id: 'gz-w-01',
    name: 'Linen Blend Oversized Shirt',
    category: 'Women',
    subcategory: 'Tops & Shirts',
    price: 1790,
    isBestSeller: true,
    tag: 'EFFORTLESS',
    rating: 4.9,
    reviewCount: 164,
    colors: [
      { name: 'Oatmeal Natural', hex: '#e4dece' },
      { name: 'Soft Chalk', hex: '#f7f6f2' },
      { name: 'Onyx', hex: '#1a1a1a' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    primaryImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Effortless relaxed shirt in breathable textured linen. Features clean mother-of-pearl buttons and relaxed French seams.',
    details: [
      'Generous boyfriend cut with dropped shoulders',
      'Soft enzyme washed linen hand feel',
      'Extended back hem',
    ],
    composition: '55% European Flax Linen, 45% Organic Cotton',
    careGuide: ['Wash cold delicate', 'Air dry on hanger'],
  },
  {
    id: 'gz-w-02',
    name: 'Structured Cocoon Blazer',
    category: 'Women',
    subcategory: 'Blazers',
    price: 3690,
    salePrice: 3290,
    isNew: true,
    tag: 'NEW IN',
    rating: 4.9,
    reviewCount: 62,
    colors: [
      { name: 'Ecru Cream', hex: '#ede9df' },
      { name: 'Noir Black', hex: '#141414' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    primaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'A modern sculptural silhouette featuring softened shoulders, single statement button closure, and refined satin lining.',
    details: [
      'Architectural cocoon line',
      'Piped interior contrast seams',
      'Functional jetted pockets',
    ],
    composition: '68% Poly, 30% Rayon, 2% Spandex',
    careGuide: ['Professional dry clean only'],
  },
  {
    id: 'gz-k-01',
    name: 'Textured Striped Pullover',
    category: 'Kids',
    subcategory: 'Sweaters',
    price: 1190,
    salePrice: 990,
    isBestSeller: true,
    tag: 'KIDS FAVORITE',
    rating: 4.9,
    reviewCount: 82,
    colors: [
      { name: 'Sand & Ivory Striped', hex: '#e8e1cf' },
      { name: 'Charcoal Minimal', hex: '#3b3b3b' },
    ],
    sizes: ['4-5Y', '6-7Y', '8-9Y', '10-11Y'],
    primaryImage: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Ultra-soft hypoallergenic combed knit crafted with itch-free seams and durable rib trim for play and all-day ease.',
    details: [
      'Super-soft anti-itch brushed interior',
      'Wide stretchy neckband for quick dressing',
      'Reinforced elbow durability',
    ],
    composition: '100% GOTS Certified Organic Cotton Knit',
    careGuide: ['Warm machine wash with gentle detergent', 'Tumble dry low'],
  },
  {
    id: 'gz-k-02',
    name: 'Everyday Relaxed Chino Trouser',
    category: 'Kids',
    subcategory: 'Pants',
    price: 990,
    rating: 4.8,
    reviewCount: 45,
    colors: [
      { name: 'Khaki Beige', hex: '#c9bfae' },
      { name: 'Dark Navy', hex: '#20283b' },
    ],
    sizes: ['4-5Y', '6-7Y', '8-9Y', '10-11Y'],
    primaryImage: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Durable stretch cotton twill tailored with an adjustable button-hole inner waistband to grow along with your kid.',
    details: [
      'Hidden elastic button adjusters inside waist',
      'Bar-tacked stress points for playground resistance',
      'Breathable organic stretch twill',
    ],
    composition: '98% Organic Cotton, 2% Spandex',
    careGuide: ['Machine wash warm', 'Tumble dry low'],
  },
  {
    id: 'gz-b-01',
    name: 'GAZU Eau De Parfum No. 01 — Santal & Cedar',
    category: 'Beauty',
    subcategory: 'Fragrance',
    price: 2890,
    isNew: true,
    tag: 'SIGNATURE SCENT',
    rating: 5.0,
    reviewCount: 119,
    colors: [
      { name: 'Amber Glass Bottle (50ml)', hex: '#b3783a' },
    ],
    sizes: ['50ml', '100ml'],
    primaryImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'An evocative olfactory portrait of raw linen, smoked cedarwood, crushed cardamon, and warm Australian sandalwood.',
    details: [
      'Extrait concentration: 24% perfume oil',
      'Notes: Australian Sandalwood, Cardamom, Violet, Smoked Amber',
      'Heavy minimalist glass flacon with magnetic cap',
    ],
    composition: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water)',
    careGuide: ['Keep away from direct heat and sunlight'],
  },
  {
    id: 'gz-acc-01',
    name: 'GAZU Minimalist Wool Blend Cap',
    category: 'Men',
    subcategory: 'Accessories',
    price: 790,
    isBestSeller: true,
    tag: 'ACCESSORY',
    rating: 4.8,
    reviewCount: 180,
    colors: [
      { name: 'Matte Black', hex: '#181818' },
      { name: 'Chalk Beige', hex: '#e2dfd7' },
    ],
    sizes: ['One Size'],
    primaryImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Structured low-profile dad cap crafted with premium wool blend and an embossed brass metal clasp.',
    details: [
      'Low profile 6-panel crown',
      'Subtle tonal embroidered logo',
      'Adjustable antique brass sliding buckle',
    ],
    composition: '50% Wool, 50% Cotton Twill',
    careGuide: ['Spot clean only with damp cloth'],
  },
];
