import test from 'node:test';
import assert from 'node:assert/strict';
import type { Client } from '@libsql/client/web';
import {
  fetchProducts,
  addProduct,
  deleteProduct,
  fetchDashboardMetrics,
  mapRowToProduct,
  formatProductsToCSV,
  exportProductsToCSV,
} from './tursoService';

function createMockTursoClient(options?: {
  productRows?: Array<Record<string, unknown>>;
  orderRows?: Array<Record<string, unknown>>;
}): {
  client: Client;
  executedCalls: Array<{ sql: string; args?: unknown[] }>;
} {
  const executedCalls: Array<{ sql: string; args?: unknown[] }> = [];

  const client = {
    execute: async (stmt: string | { sql: string; args?: unknown[] }) => {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql;
      const args = typeof stmt === 'string' ? undefined : stmt.args;
      executedCalls.push({ sql, args });

      if (sql.includes('FROM products')) {
        return {
          rows: options?.productRows ?? [],
        };
      }
      if (sql.includes('FROM orders')) {
        return {
          rows: options?.orderRows ?? [],
        };
      }
      return { rows: [] };
    },
    executeMultiple: async (sql: string) => {
      executedCalls.push({ sql });
    },
  } as unknown as Client;

  return { client, executedCalls };
}

test('mapRowToProduct maps raw database row to Product domain object', () => {
  const row = {
    id: 'gz-test-01',
    name: 'Architectural Wool Overcoat',
    category: 'Men',
    price: 4500,
    sale_price: 3900,
    rating: 4.9,
    reviews_count: 28,
    sizes_json: '["M","L","XL"]',
    colors_json: '[{"name":"Charcoal","hex":"#222222"}]',
    description: 'Tailored heavy wool overcoat.',
    images_json: '["https://res.cloudinary.com/demo/image/upload/coat.jpg"]',
    is_new: 1,
    is_featured: 1,
  };

  const product = mapRowToProduct(row);
  assert.equal(product.id, 'gz-test-01');
  assert.equal(product.name, 'Architectural Wool Overcoat');
  assert.equal(product.category, 'Men');
  assert.equal(product.price, 4500);
  assert.equal(product.salePrice, 3900);
  assert.deepEqual(product.sizes, ['M', 'L', 'XL']);
  assert.equal(product.isNew, true);
  assert.equal(product.isBestSeller, true);
});

test('fetchProducts returns mapped products from Turso database', async () => {
  const { client, executedCalls } = createMockTursoClient({
    productRows: [
      {
        id: 'gz-db-1',
        name: 'Linen Relaxed Shirt',
        category: 'Women',
        price: 2200,
        sale_price: null,
        rating: 4.8,
        reviews_count: 15,
        sizes_json: '["S","M"]',
        colors_json: '[{"name":"Ivory","hex":"#f5f5f0"}]',
        description: 'Breathable linen shirt.',
        images_json: '["https://example.com/linen.jpg"]',
        is_new: 1,
        is_featured: 0,
      },
    ],
  });

  const products = await fetchProducts(undefined, client);
  assert.equal(executedCalls.length, 1);
  assert.ok(executedCalls[0].sql.includes('SELECT * FROM products'));
  assert.equal(products.length, 1);
  assert.equal(products[0].id, 'gz-db-1');
  assert.equal(products[0].name, 'Linen Relaxed Shirt');
  assert.equal(products[0].category, 'Women');
  assert.equal(products[0].price, 2200);
});

test('fetchProducts falls back to initial catalog when client is null', async () => {
  const products = await fetchProducts(undefined, null);
  assert.ok(Array.isArray(products));
  assert.ok(products.length > 0);
});

test('addProduct validates inputs and inserts/upserts product into Turso', async () => {
  const { client, executedCalls } = createMockTursoClient();

  await assert.rejects(
    () =>
      addProduct(
        { name: '   ', price: 1500, category: 'Men' },
        undefined,
        client
      ),
    /Product name is required/
  );

  await assert.rejects(
    () =>
      addProduct(
        { name: 'Valid Name', price: 0, category: 'Men' },
        undefined,
        client
      ),
    /Product price must be greater than zero/
  );

  const created = await addProduct(
    {
      id: 'gz-new-99',
      name: 'Minimalist Pleated Trouser',
      category: 'Men',
      price: 2690,
      salePrice: 2190,
      sizes: ['M', 'L'],
      description: 'Sharp pleated silhouette.',
    },
    undefined,
    client
  );

  assert.equal(created.id, 'gz-new-99');
  assert.equal(created.name, 'Minimalist Pleated Trouser');
  assert.equal(created.price, 2690);
  assert.equal(created.salePrice, 2190);
  assert.equal(executedCalls.length, 1);
  assert.ok(executedCalls[0].sql.includes('INSERT INTO products'));
  assert.equal(executedCalls[0].args?.[0], 'gz-new-99');
  assert.equal(executedCalls[0].args?.[1], 'Minimalist Pleated Trouser');
});

test('deleteProduct removes product by ID from Turso', async () => {
  const { client, executedCalls } = createMockTursoClient();

  await assert.rejects(
    () => deleteProduct('   ', undefined, client),
    /valid productId is required/
  );

  const result = await deleteProduct('gz-new-99', undefined, client);
  assert.deepEqual(result, { deleted: true, id: 'gz-new-99' });
  assert.equal(executedCalls.length, 1);
  assert.equal(executedCalls[0].sql, 'DELETE FROM products WHERE id = ?');
  assert.deepEqual(executedCalls[0].args, ['gz-new-99']);
});

test('fetchDashboardMetrics aggregates sales, orders, and top-selling products from Turso', async () => {
  const { client } = createMockTursoClient({
    productRows: [
      {
        id: 'gz-p1',
        name: 'Oversized Trench',
        category: 'Men',
        price: 3000,
        sale_price: 2500,
        rating: 4.9,
        reviews_count: 10,
        sizes_json: '["M","L"]',
        colors_json: '[{"name":"Black","hex":"#000"}]',
        description: 'Trench coat',
        images_json: '["https://example.com/trench.jpg"]',
        is_new: 1,
        is_featured: 1,
      },
      {
        id: 'gz-p2',
        name: 'Silk Slip Dress',
        category: 'Women',
        price: 2000,
        sale_price: null,
        rating: 4.7,
        reviews_count: 8,
        sizes_json: '["S","M"]',
        colors_json: '[{"name":"Cream","hex":"#fff"}]',
        description: 'Silk dress',
        images_json: '["https://example.com/dress.jpg"]',
        is_new: 0,
        is_featured: 1,
      },
    ],
    orderRows: [
      {
        id: 'ORD-1',
        customer_name: 'Rahim',
        customer_phone: '01700000000',
        customer_email: 'rahim@example.com',
        address: 'Banani',
        city: 'Dhaka',
        postal_code: '1213',
        items_json: JSON.stringify([
          { productId: 'gz-p1', quantity: 2, price: 2500 },
        ]),
        total: 5000,
        shipping_fee: 0,
        payment_method: 'Cash on Delivery',
        status: 'Delivered',
        created_at: '2026-10-30T10:00:00Z',
      },
      {
        id: 'ORD-2',
        customer_name: 'Karim',
        customer_phone: '01800000000',
        customer_email: 'karim@example.com',
        address: 'Gulshan',
        city: 'Dhaka',
        postal_code: '1212',
        items_json: JSON.stringify([
          { productId: 'gz-p2', quantity: 1, price: 2000 },
        ]),
        total: 2000,
        shipping_fee: 0,
        payment_method: 'bKash',
        status: 'Processing & Quality Check',
        created_at: '2026-10-31T10:00:00Z',
      },
    ],
  });

  const metrics = await fetchDashboardMetrics({ client });
  assert.equal(metrics.source, 'turso');
  assert.equal(metrics.totalOrders, 2);
  assert.equal(metrics.totalSales, 7000);
  assert.equal(metrics.avgOrderValue, 3500);
  assert.equal(metrics.totalProducts, 2);
  assert.equal(metrics.newSeasonCount, 1);
  assert.equal(metrics.statusCounts.delivered, 1);
  assert.equal(metrics.statusCounts.processing, 1);
  assert.equal(metrics.topSellingProducts[0].product.id, 'gz-p1');
  assert.equal(metrics.topSellingProducts[0].unitsSold, 2);
  assert.equal(metrics.topSellingProducts[0].totalSales, 5000);
  assert.equal(metrics.weeklySalesData.length, 7);
});

test('formatProductsToCSV formats product records with RFC 4180 CSV escaping', () => {
  const sampleProduct = mapRowToProduct({
    id: 'gz-csv-1',
    name: 'Heavyweight Parka, "Winter Edition"',
    category: 'Men',
    subcategory: 'Outerwear',
    price: 4990,
    sale_price: 4290,
    rating: 4.9,
    reviews_count: 34,
    sizes_json: '["M","L","XL"]',
    colors_json: '[{"name":"Obsidian","hex":"#111111"}]',
    description: 'Water-resistant shell, quilted lining',
    images_json: '["https://example.com/parka.jpg"]',
    is_new: 1,
    is_featured: 1,
  });

  const csv = formatProductsToCSV([sampleProduct]);
  const lines = csv.split('\n');
  assert.equal(lines.length, 2);
  assert.ok(lines[0].startsWith('ID,Title,Category,Subcategory,Regular Price (BDT)'));
  assert.ok(lines[1].includes('gz-csv-1'));
  // Verify double-quote and comma escaping
  assert.ok(lines[1].includes('"Heavyweight Parka, ""Winter Edition"""'));
  assert.ok(lines[1].includes('"Water-resistant shell, quilted lining"'));
  assert.ok(lines[1].includes('4990,4290,4290'));
});

test('exportProductsToCSV queries Turso and returns CSV inventory payload', async () => {
  const { client, executedCalls } = createMockTursoClient({
    productRows: [
      {
        id: 'gz-exp-1',
        name: 'Relaxed Linen Blazer',
        category: 'Women',
        price: 3600,
        sale_price: 3100,
        rating: 4.8,
        reviews_count: 19,
        sizes_json: '["S","M","L"]',
        colors_json: '[{"name":"Sand","hex":"#d8cfc4"}]',
        description: 'Unstructured summer blazer.',
        images_json: '["https://example.com/blazer.jpg"]',
        is_new: 1,
        is_featured: 0,
      },
    ],
  });

  const exported = await exportProductsToCSV({ client });
  assert.equal(executedCalls.length, 1);
  assert.ok(executedCalls[0].sql.includes('SELECT * FROM products'));
  assert.equal(exported.source, 'turso');
  assert.equal(exported.count, 1);
  assert.ok(exported.filename.startsWith('gazu-inventory-'));
  assert.ok(exported.filename.endsWith('.csv'));
  assert.ok(exported.csv.includes('Relaxed Linen Blazer'));
  assert.ok(exported.csv.includes('gz-exp-1'));
});

