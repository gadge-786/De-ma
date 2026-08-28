import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, SlidersHorizontal, MapPin, Sparkles, Flame, Clock, Heart } from 'lucide-react';
import { FeedTab, SortOption } from '../types';
import { CATEGORIES } from '../data/mockData';

interface HeaderProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  onOpenSearch,
  onOpenCart,
  cartCount,
}) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const searchPlaceholders = [
    'Search Tokyo Daikanyama Cafes ☕',
    'Korean Glass Skin Morning Routine ✨',
    'Autumn Wool Trench Coat Styling 🍂',
    'Aesthetic Minimalist Desk Setup 🪴',
    'Ceramic Handcrafted Tumbler',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-100 transition-all">
      {/* Top Branding & Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => onTabChange('explore')}>
          <div className="w-8 h-8 rounded-xl bg-[#FF2442] flex items-center justify-center shadow-sm shadow-[#FF2442]/20">
            <span className="text-white font-black text-xs tracking-tight">RED</span>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#111111] hidden sm:inline-block">
            Xiaohongshu <span className="text-[#FF2442] font-semibold text-xs ml-1 bg-red-50 px-1.5 py-0.5 rounded-full">小红书</span>
          </span>
        </div>

        {/* Central Feed Tabs: Follow | Explore | Nearby */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-semibold">
          <button
            id="tab-follow-btn"
            onClick={() => onTabChange('follow')}
            className={`relative py-1.5 transition-colors cursor-pointer ${
              activeTab === 'follow' ? 'text-[#111111] font-bold text-base' : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            Following
            {activeTab === 'follow' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.75 bg-[#FF2442] rounded-full" />
            )}
          </button>

          <button
            id="tab-explore-btn"
            onClick={() => onTabChange('explore')}
            className={`relative py-1.5 transition-colors cursor-pointer ${
              activeTab === 'explore' ? 'text-[#111111] font-bold text-base' : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            Explore
            {activeTab === 'explore' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.75 bg-[#FF2442] rounded-full" />
            )}
          </button>

          <button
            id="tab-nearby-btn"
            onClick={() => onTabChange('nearby')}
            className={`relative py-1.5 transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'nearby' ? 'text-[#111111] font-bold text-base' : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${activeTab === 'nearby' ? 'text-[#FF2442]' : 'text-neutral-400'}`} />
            Nearby
            {activeTab === 'nearby' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.75 bg-[#FF2442] rounded-full" />
            )}
          </button>
        </div>

        {/* Right Action Icons: Search Trigger & Shopping Bag */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            id="header-search-icon-btn"
            onClick={onOpenSearch}
            className="p-2 text-[#666666] hover:text-[#111111] hover:bg-neutral-100 rounded-full transition-colors"
            title="Search notes and products"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            id="header-cart-icon-btn"
            onClick={onOpenCart}
            className="relative p-2 text-[#666666] hover:text-[#111111] hover:bg-neutral-100 rounded-full transition-colors"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF2442] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Visual Search Bar Input Mock / Trigger Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2.5">
        <div className="flex items-center gap-2">
          <div
            id="header-search-bar-trigger"
            onClick={onOpenSearch}
            className="flex-1 flex items-center gap-2.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200/80 rounded-full cursor-pointer text-sm text-[#666666] transition-all border border-transparent hover:border-neutral-200"
          >
            <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <span className="truncate select-none text-neutral-500 text-xs sm:text-sm">
              {searchPlaceholders[placeholderIndex]}
            </span>
            <div className="ml-auto hidden sm:flex items-center gap-1 text-[11px] font-medium text-[#FF2442] bg-red-50 px-2 py-0.5 rounded-full flex-shrink-0">
              <Sparkles className="w-3 h-3" />
              <span>Visual Search</span>
            </div>
          </div>

          {/* Sort Menu Toggle */}
          <div className="relative">
            <button
              id="sort-menu-toggle-btn"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                showSortMenu ? 'border-[#FF2442] bg-red-50 text-[#FF2442]' : 'border-neutral-200 text-[#666666] hover:bg-neutral-100'
              }`}
              title="Sort Feed"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Distribution Sorting
                </div>
                <button
                  onClick={() => { onSortChange('trending'); setShowSortMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 ${
                    sortBy === 'trending' ? 'text-[#FF2442] font-bold bg-red-50/60' : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  Time-Decay Score (Trending)
                </button>
                <button
                  onClick={() => { onSortChange('latest'); setShowSortMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 ${
                    sortBy === 'latest' ? 'text-[#FF2442] font-bold bg-red-50/60' : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Latest Uploads
                </button>
                <button
                  onClick={() => { onSortChange('likes'); setShowSortMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 ${
                    sortBy === 'likes' ? 'text-[#FF2442] font-bold bg-red-50/60' : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  Most Liked & Saved
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2 overflow-x-auto no-scrollbar flex items-center gap-2">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              id={`cat-btn-${category.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectCategory(category)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-neutral-100 text-[#666666] hover:bg-neutral-200/70 hover:text-[#111111]'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </header>
  );
};
