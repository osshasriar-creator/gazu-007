import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { PRODUCTS, type Product } from '../data/products';
import { useStore } from '../context/StoreContext';

interface ProductSectionProps {
  onQuickView: (product: Product) => void;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

export const ProductSection: React.FC<ProductSectionProps> = ({ onQuickView }) => {
  const { activeCategory, setActiveCategory, products } = useStore();
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('All');

  const filterTabs = ['All', 'Men', 'Women', 'Kids', 'Beauty', 'New In', 'Best Sellers'];

  // Available subcategories based on current category
  const availableSubcategories = useMemo(() => {
    let items = products;
    if (activeCategory === 'Men' || activeCategory === 'Women' || activeCategory === 'Kids' || activeCategory === 'Beauty') {
      items = items.filter((p) => p.category === activeCategory);
    }
    const set = new Set<string>();
    items.forEach((p) => {
      if (p.subcategory) set.add(p.subcategory);
    });
    return ['All', ...Array.from(set)];
  }, [activeCategory, products]);

  // Filter and sort items
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (activeCategory === 'New In') {
      list = list.filter((p) => p.isNew);
    } else if (activeCategory === 'Best Sellers') {
      list = list.filter((p) => p.isBestSeller);
    } else if (activeCategory !== 'All') {
      list = list.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Subcategory filter
    if (selectedSubcategory !== 'All') {
      list = list.filter((p) => p.subcategory === selectedSubcategory);
    }

    // Size filter
    if (selectedSizeFilter !== 'All') {
      list = list.filter((p) => p.sizes.includes(selectedSizeFilter));
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-desc':
        list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'newest':
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
    }

    return list;
  }, [activeCategory, selectedSubcategory, selectedSizeFilter, sortBy]);

  const hasActiveFilters =
    activeCategory !== 'All' || selectedSubcategory !== 'All' || selectedSizeFilter !== 'All';

  const resetFilters = () => {
    setActiveCategory('All');
    setSelectedSubcategory('All');
    setSelectedSizeFilter('All');
    setSortBy('featured');
  };

  return (
    <section
      id="catalog-section"
      aria-label="Best of GAZU Catalog"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      {/* Top Header Row matching Reference */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-neutral-300 gap-4">
        <div>
          <span className="text-[11px] tracking-[0.25em] uppercase text-neutral-500 font-semibold block mb-1">
            CURATED EDIT
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] uppercase text-neutral-950 font-display">
            BEST OF GAZU
          </h2>
        </div>

        {/* View All / Category Tabs */}
        <div className="flex items-center space-x-6">
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs tracking-[0.2em] uppercase font-semibold text-neutral-900 border-b border-black pb-0.5 hover:text-neutral-600 transition-colors cursor-pointer"
          >
            VIEW ALL ({PRODUCTS.length})
          </button>
        </div>
      </div>

      {/* Category Tabs & Filter Toolbar */}
      <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          {filterTabs.map((tab) => {
            const isSelected = activeCategory.toLowerCase() === tab.toLowerCase();
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveCategory(tab);
                  setSelectedSubcategory('All');
                }}
                className={`px-4 py-2 text-xs tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white font-semibold'
                    : 'bg-transparent text-neutral-700 hover:text-black hover:bg-neutral-200/60 font-medium'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Controls: Subcategory & Sort Selector */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Subcategory dropdown if relevant */}
          {availableSubcategories.length > 2 && (
            <div className="flex items-center space-x-1.5 border border-neutral-300 bg-white/70 px-3 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="bg-transparent text-xs text-neutral-800 tracking-wider font-medium focus:outline-none cursor-pointer"
                aria-label="Filter by subcategory"
              >
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub === 'All' ? 'All Types' : sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort By */}
          <div className="flex items-center space-x-1.5 border border-neutral-300 bg-white/70 px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs text-neutral-800 tracking-wider font-medium focus:outline-none cursor-pointer"
              aria-label="Sort products"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 pt-4 pb-2">
          <span className="text-[11px] tracking-wider text-neutral-500 uppercase font-semibold">Active:</span>
          {activeCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 bg-neutral-200 text-neutral-800 text-[11px] px-2.5 py-1 font-medium">
              Category: {activeCategory}
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                aria-label="Remove category filter"
                className="hover:text-black"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSubcategory !== 'All' && (
            <span className="inline-flex items-center gap-1 bg-neutral-200 text-neutral-800 text-[11px] px-2.5 py-1 font-medium">
              Type: {selectedSubcategory}
              <button
                type="button"
                onClick={() => setSelectedSubcategory('All')}
                aria-label="Remove subcategory filter"
                className="hover:text-black"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] text-neutral-500 hover:text-black underline tracking-wider uppercase ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Product Cards Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 pt-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-[#ecebe6] border border-neutral-300 mt-8">
          <p className="text-sm font-semibold tracking-widest uppercase text-neutral-800">
            No products match the selected filters
          </p>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try adjusting your category or subcategory selection to explore our full range.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 bg-black text-white px-6 py-2.5 text-xs tracking-widest uppercase font-semibold hover:bg-neutral-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};
