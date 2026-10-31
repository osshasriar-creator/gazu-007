/**
 * Turso Database (libSQL) Service Layer for GAZU E-Commerce
 * 
 * Provides:
 * - Edge SQLite connection via @libsql/client/web
 * - Automatic schema initialization (products, categories, orders, site_settings)
 * - Initial catalog seeding
 * - Product CRUD, Category updates, Order processing, and Site settings
 * - Graceful fallback to initial catalog if offline or credentials pending
 */

import { createClient, type Client } from '@libsql/client/web';
import { PRODUCTS as initialProducts, type Product } from '../data/products';
import { siteConfig } from '../config/siteConfig';

export interface TursoConfig {
  url: string;
  authToken: string;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  postalCode: string;
  items: Array<{
    productId: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  shippingFee: number;
  paymentMethod: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

const CONFIG_KEY = 'gazu_turso_config';

export function getTursoConfig(): TursoConfig {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
  }

  return {
    url: (typeof process !== 'undefined' && process.env?.TURSO_DATABASE_URL) || '',
    authToken: (typeof process !== 'undefined' && process.env?.TURSO_AUTH_TOKEN) || '',
  };
}

export function saveTursoConfig(config: TursoConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }
}

let cachedClient: Client | null = null;
let currentClientKey = '';

export function getTursoClient(customConfig?: TursoConfig): Client | null {
  const config = customConfig || getTursoConfig();
  if (!config.url || !config.authToken) {
    return null;
  }

  const key = `${config.url}::${config.authToken}`;
  if (cachedClient && currentClientKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient({
      url: config.url,
      authToken: config.authToken,
    });
    currentClientKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Turso client:', err);
    return null;
  }
}

/**
 * Initializes database tables in Turso if they do not already exist.
 */
export async function initializeTursoSchema(client?: Client): Promise<boolean> {
  const turso = client || getTursoClient();
  if (!turso) return false;

  try {
    await turso.executeMultiple(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        sale_price REAL,
        rating REAL DEFAULT 4.8,
        reviews_count INTEGER DEFAULT 12,
        sizes_json TEXT NOT NULL,
        colors_json TEXT NOT NULL,
        description TEXT NOT NULL,
        in_stock INTEGER DEFAULT 1,
        images_json TEXT NOT NULL,
        is_new INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category_key TEXT NOT NULL,
        description TEXT NOT NULL,
        cta_text TEXT NOT NULL,
        image TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        postal_code TEXT,
        items_json TEXT NOT NULL,
        total REAL NOT NULL,
        shipping_fee REAL NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY,
        hero_tagline TEXT,
        hero_watermark TEXT,
        hero_model_image TEXT,
        announcement_text TEXT,
        free_shipping_threshold REAL DEFAULT 999
      );
    `);

    // Check if products table is empty, and seed with default catalog
    const countRes = await turso.execute('SELECT COUNT(*) as cnt FROM products');
    const count = Number(countRes.rows[0]?.cnt || 0);

    if (count === 0) {
      await seedInitialProducts(turso);
    }

    return true;
  } catch (err) {
    console.error('Turso schema initialization error:', err);
    return false;
  }
}

/**
 * Seeds initial catalog into Turso
 */
async function seedInitialProducts(client: Client): Promise<void> {
  for (const p of initialProducts) {
    const imagesList = [p.primaryImage, ...(p.galleryImages || [])];
    await client.execute({
      sql: `INSERT OR IGNORE INTO products (
        id, name, category, price, sale_price, rating, reviews_count,
        sizes_json, colors_json, description, in_stock, images_json,
        is_new, is_featured, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        p.id,
        p.name,
        p.category,
        p.price,
        p.salePrice ?? null,
        p.rating,
        p.reviewCount || 12,
        JSON.stringify(p.sizes || []),
        JSON.stringify(p.colors || []),
        p.description || '',
        1,
        JSON.stringify(imagesList),
        p.isNew ? 1 : 0,
        p.isBestSeller ? 1 : 0,
        new Date().toISOString(),
      ],
    });
  }

  // Seed default site settings
  await client.execute({
    sql: `INSERT OR IGNORE INTO site_settings (
      id, hero_tagline, hero_watermark, hero_model_image, announcement_text, free_shipping_threshold
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      'default',
      siteConfig.hero.tagline,
      siteConfig.hero.brandWatermark,
      siteConfig.hero.modelImage,
      siteConfig.announcement.text,
      siteConfig.shipping.freeThreshold,
    ],
  });
}

/**
 * Fetch all products from Turso (or fallback to local memory)
 */
export async function fetchProducts(): Promise<Product[]> {
  const turso = getTursoClient();
  if (!turso) {
    return initialProducts;
  }

  try {
    const rs = await turso.execute('SELECT * FROM products ORDER BY created_at DESC');
    if (rs.rows.length === 0) {
      return initialProducts;
    }

    return rs.rows.map((r) => {
      const parsedImages = JSON.parse(String(r.images_json || '[]'));
      const fallbackImg =
        'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80';
      const primaryImage = parsedImages[0] || fallbackImg;

      return {
        id: String(r.id),
        name: String(r.name),
        category: r.category as Product['category'],
        subcategory: 'Apparel',
        price: Number(r.price),
        salePrice: r.sale_price !== null && r.sale_price !== undefined ? Number(r.sale_price) : undefined,
        rating: Number(r.rating || 4.8),
        reviewCount: Number(r.reviews_count || 12),
        sizes: JSON.parse(String(r.sizes_json || '["S","M","L","XL"]')),
        colors: JSON.parse(String(r.colors_json || '[{"name":"Black","hex":"#111111"}]')),
        description: String(r.description || ''),
        primaryImage,
        galleryImages: parsedImages.length > 0 ? parsedImages : [primaryImage],
        details: ['Tailored contemporary fit', 'Crafted from premium durable fabric'],
        composition: '100% Premium Twill Cotton',
        careGuide: ['Machine wash cold', 'Iron low temperature'],
        isNew: Boolean(r.is_new),
        isBestSeller: Boolean(r.is_featured),
      };
    });
  } catch (err) {
    console.warn('Failed to fetch products from Turso, falling back to local catalog:', err);
    return initialProducts;
  }
}

/**
 * Insert or update a product in Turso
 */
export async function saveProduct(product: Product): Promise<void> {
  const turso = getTursoClient();
  if (!turso) {
    throw new Error('Turso database is not connected. Please provide Turso credentials.');
  }

  const imagesList = [product.primaryImage, ...(product.galleryImages || [])].filter(Boolean);

  await turso.execute({
    sql: `INSERT INTO products (
      id, name, category, price, sale_price, rating, reviews_count,
      sizes_json, colors_json, description, in_stock, images_json,
      is_new, is_featured, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      price = excluded.price,
      sale_price = excluded.sale_price,
      rating = excluded.rating,
      reviews_count = excluded.reviews_count,
      sizes_json = excluded.sizes_json,
      colors_json = excluded.colors_json,
      description = excluded.description,
      in_stock = excluded.in_stock,
      images_json = excluded.images_json,
      is_new = excluded.is_new,
      is_featured = excluded.is_featured;`,
    args: [
      product.id,
      product.name,
      product.category,
      product.price,
      product.salePrice ?? null,
      product.rating,
      product.reviewCount || 12,
      JSON.stringify(product.sizes || []),
      JSON.stringify(product.colors || []),
      product.description || '',
      1,
      JSON.stringify(imagesList),
      product.isNew ? 1 : 0,
      product.isBestSeller ? 1 : 0,
      new Date().toISOString(),
    ],
  });
}

/**
 * Delete a product from Turso
 */
export async function deleteProduct(productId: string): Promise<void> {
  const turso = getTursoClient();
  if (!turso) {
    throw new Error('Turso database is not connected.');
  }

  await turso.execute({
    sql: 'DELETE FROM products WHERE id = ?',
    args: [productId],
  });
}

/**
 * Record a new order in Turso
 */
export async function createOrder(order: Omit<OrderRecord, 'id' | 'createdAt' | 'status'>): Promise<OrderRecord> {
  const turso = getTursoClient();
  const id = `GAZU-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const createdAt = new Date().toISOString();
  const record: OrderRecord = {
    ...order,
    id,
    status: 'Pending',
    createdAt,
  };

  if (!turso) {
    // If Turso is not connected yet, save to localStorage
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('gazu_local_orders') || '[]');
      existing.unshift(record);
      localStorage.setItem('gazu_local_orders', JSON.stringify(existing));
    }
    return record;
  }

  await turso.execute({
    sql: `INSERT INTO orders (
      id, customer_name, customer_phone, customer_email, address, city, postal_code,
      items_json, total, shipping_fee, payment_method, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      record.id,
      record.customerName,
      record.customerPhone,
      record.customerEmail,
      record.address,
      record.city,
      record.postalCode || '',
      JSON.stringify(record.items),
      record.total,
      record.shippingFee,
      record.paymentMethod,
      record.status,
      record.createdAt,
    ],
  });

  return record;
}

/**
 * Fetch orders from Turso
 */
export async function fetchOrders(): Promise<OrderRecord[]> {
  const turso = getTursoClient();
  if (!turso) {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('gazu_local_orders') || '[]');
    }
    return [];
  }

  try {
    const rs = await turso.execute('SELECT * FROM orders ORDER BY created_at DESC');
    return rs.rows.map((r) => ({
      id: String(r.id),
      customerName: String(r.customer_name),
      customerPhone: String(r.customer_phone),
      customerEmail: String(r.customer_email),
      address: String(r.address),
      city: String(r.city),
      postalCode: String(r.postal_code || ''),
      items: JSON.parse(String(r.items_json || '[]')),
      total: Number(r.total),
      shippingFee: Number(r.shipping_fee),
      paymentMethod: String(r.payment_method),
      status: r.status as OrderRecord['status'],
      createdAt: String(r.created_at),
    }));
  } catch (err) {
    console.error('Failed to fetch orders from Turso:', err);
    return [];
  }
}
