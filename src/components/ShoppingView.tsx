import React, { useState } from 'react';
import { ShoppingBag, Star, Sparkles, Filter, Check, ArrowRight, Layers } from 'lucide-react';
import { Product, Note } from '../types';

interface ShoppingViewProps {
  products: Product[];
  notes: Note[];
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onSelectNote: (note: Note) => void;
}

export const ShoppingView: React.FC<ShoppingViewProps> = ({
  products,
  notes,
  onAddToCart,
  onBuyNow,
  onSelectNote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = ['All', 'Fashion & OOTD', 'Skincare & Beauty', 'Home & Living', 'Tech & Desk'];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  // Find community notes featuring this product
  const getNotesForProduct = (productId: string): Note[] => {
    return notes.filter((n) => n.hotspots && n.hotspots.some((h) => h.productId === productId));
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Banner / Header */}
      <div className="rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-[#FF2442]/90 text-white p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white tracking-wide uppercase">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Social Commerce · 创作者好物
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">
            Authentic Creator Lifestyle Picks
          </h2>
          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
            Every item is verified inside authentic community lifestyle notes. Tap any product to see how real creators style and use it.
          </p>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#FF2442] text-white shadow-sm shadow-[#FF2442]/20'
                : 'bg-white border border-neutral-200 text-[#666666] hover:bg-neutral-100 hover:text-[#111111]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {filteredProducts.map((product) => {
          const featuredNotes = getNotesForProduct(product.id);

          return (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              {/* Product Cover Image */}
              <div className="relative aspect-square overflow-hidden bg-neutral-100">
                <img
                  src={product.coverImage}
                  alt={product.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Tagged in Notes Badge */}
                {featuredNotes.length > 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                    <Layers className="w-3 h-3 text-[#FF2442]" />
                    <span>In {featuredNotes.length} Notes</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mb-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-neutral-400 font-normal">({product.salesCount}+ sold)</span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-[#111111] line-clamp-2 leading-snug tracking-tight mb-2 group-hover:text-[#FF2442] transition-colors">
                    {product.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm sm:text-base font-black text-[#FF2442]">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-neutral-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    id={`mall-quick-buy-${product.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    className="p-2 bg-neutral-100 hover:bg-[#FF2442] hover:text-white rounded-full text-[#111111] transition-colors cursor-pointer"
                    title="Add to bag"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setSelectedProduct(null)} />

          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            {/* Image */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-neutral-100">
              <img
                src={selectedProduct.coverImage}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content & Community Note Links */}
            <div className="w-full md:w-1/2 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto no-scrollbar">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold text-[#FF2442] bg-red-50 px-2 py-0.5 rounded-full">
                    {selectedProduct.category}
                  </span>
                  <span>{selectedProduct.stock} in stock</span>
                </div>

                <h3 className="text-base font-extrabold text-[#111111] leading-snug">
                  {selectedProduct.title}
                </h3>

                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-[#FF2442]">
                    ${selectedProduct.price.toFixed(2)}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-xs text-neutral-400 line-through">
                      ${selectedProduct.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#666666] leading-relaxed">
                  {selectedProduct.description}
                </p>

                {/* Community Notes That Feature This Product */}
                <div className="pt-3 border-t border-neutral-100 space-y-2">
                  <h4 className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF2442]" />
                    Featured In Community Notes:
                  </h4>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                    {getNotesForProduct(selectedProduct.id).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setSelectedProduct(null);
                          onSelectNote(n);
                        }}
                        className="p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img
                            src={n.mediaUrls[0]}
                            alt={n.title}
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                          />
                          <span className="text-xs font-semibold text-[#111111] truncate">{n.title}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-2 border-t border-neutral-100 mt-4">
                <button
                  id="modal-add-to-bag-btn"
                  onClick={() => {
                    onAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-[#111111] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Add to Bag
                </button>
                <button
                  id="modal-instant-checkout-btn"
                  onClick={() => {
                    onBuyNow(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-2.5 bg-[#FF2442] hover:bg-[#e01e38] text-white text-xs font-bold rounded-xl shadow-md shadow-[#FF2442]/20 transition-all cursor-pointer"
                >
                  1-Click Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
