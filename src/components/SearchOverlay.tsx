import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  TrendingUp,
  Sparkles,
  Heart,
  ShoppingBag,
  MapPin,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Note, Product, User } from '../types';
import { TRENDING_SEARCHES } from '../data/mockData';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  products: Product[];
  onSelectNote: (note: Note) => void;
  onSelectProduct: (product: Product) => void;
}

type SearchFilter = 'all' | 'notes' | 'products' | 'tags';

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  notes,
  products,
  onSelectNote,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Tokyo Cafe Guide',
    'Glass Skin',
    'Ceramic Tumbler',
  ]);

  const handleSearchCommit = (term: string) => {
    setQuery(term);
    if (term && !recentSearches.includes(term)) {
      setRecentSearches([term, ...recentSearches.slice(0, 5)]);
    }
  };

  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { matchingNotes: [], matchingProducts: [], matchingTags: [] };

    const matchingNotes = notes.filter((n) => {
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTags = n.tags.some((t) => t.toLowerCase().includes(q));
      const matchAuthor = n.user?.displayName.toLowerCase().includes(q) || n.user?.username.toLowerCase().includes(q);
      const matchLocation = n.locationName?.toLowerCase().includes(q);
      return matchTitle || matchContent || matchTags || matchAuthor || matchLocation;
    });

    const matchingProducts = products.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTags;
    });

    const tagsSet = new Set<string>();
    notes.forEach((n) => {
      n.tags.forEach((t) => {
        if (t.toLowerCase().includes(q)) tagsSet.add(t);
      });
    });

    return {
      matchingNotes,
      matchingProducts,
      matchingTags: Array.from(tagsSet),
    };
  }, [query, notes, products]);

  return (
    <div className="fixed inset-0 z-50 bg-white/98 backdrop-blur-xl flex flex-col animate-in fade-in duration-150">
      {/* Top Search Header Bar */}
      <div className="border-b border-neutral-100 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 bg-neutral-100 rounded-full border border-neutral-200/80 focus-within:border-[#FF2442] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF2442]/10 transition-all">
            <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search lifestyle reviews, travel itineraries, product tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchCommit(query);
              }}
              className="w-full bg-transparent text-sm text-[#111111] font-medium focus:outline-none placeholder:text-neutral-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-sm font-bold text-[#666666] hover:text-[#111111] px-2 py-1 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Filter Tabs when Query Exists */}
      {query && (
        <div className="border-b border-neutral-100 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-6 text-xs font-bold text-[#666666]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`py-2.5 border-b-2 transition-all cursor-pointer ${
                activeFilter === 'all' ? 'border-[#FF2442] text-[#FF2442]' : 'border-transparent hover:text-[#111111]'
              }`}
            >
              All Results ({filteredResults.matchingNotes.length + filteredResults.matchingProducts.length})
            </button>
            <button
              onClick={() => setActiveFilter('notes')}
              className={`py-2.5 border-b-2 transition-all cursor-pointer ${
                activeFilter === 'notes' ? 'border-[#FF2442] text-[#FF2442]' : 'border-transparent hover:text-[#111111]'
              }`}
            >
              Notes ({filteredResults.matchingNotes.length})
            </button>
            <button
              onClick={() => setActiveFilter('products')}
              className={`py-2.5 border-b-2 transition-all cursor-pointer ${
                activeFilter === 'products' ? 'border-[#FF2442] text-[#FF2442]' : 'border-transparent hover:text-[#111111]'
              }`}
            >
              Products ({filteredResults.matchingProducts.length})
            </button>
          </div>
        </div>
      )}

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 no-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Default State: Trending & Recent Searches */}
          {!query && (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#666666] mb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Recent Searches
                    </span>
                    <button
                      onClick={() => setRecentSearches([])}
                      className="text-[11px] text-neutral-400 hover:text-neutral-600 font-normal cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearchCommit(term)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-[#111111] rounded-full transition-colors cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Discovery Searches */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111] mb-3">
                  <TrendingUp className="w-4 h-4 text-[#FF2442]" />
                  <span>Trending Search Topics · 实时热搜</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TRENDING_SEARCHES.map((topic, idx) => (
                    <div
                      key={topic}
                      onClick={() => handleSearchCommit(topic)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span
                          className={`w-5 text-center font-black text-xs ${
                            idx < 3 ? 'text-[#FF2442]' : 'text-neutral-400'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-[#111111] group-hover:text-[#FF2442] truncate transition-colors">
                          {topic}
                        </span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[#FF2442] transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Active Query Results */}
          {query && (
            <div className="space-y-6">
              {/* Matched Products Strip */}
              {(activeFilter === 'all' || activeFilter === 'products') &&
                filteredResults.matchingProducts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-[#FF2442]" />
                      Products Matching "{query}" ({filteredResults.matchingProducts.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {filteredResults.matchingProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectProduct(p);
                            onClose();
                          }}
                          className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <img
                            src={p.coverImage}
                            alt={p.title}
                            className="w-full aspect-square object-cover rounded-lg mb-2"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-[#111111] line-clamp-2 leading-tight">
                              {p.title}
                            </h4>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-xs font-black text-[#FF2442]">${p.price.toFixed(2)}</span>
                              {p.originalPrice && (
                                <span className="text-[10px] text-neutral-400 line-through">
                                  ${p.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Matched Notes Feed */}
              {(activeFilter === 'all' || activeFilter === 'notes') && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#FF2442]" />
                    Lifestyle Notes ({filteredResults.matchingNotes.length})
                  </h3>

                  {filteredResults.matchingNotes.length === 0 ? (
                    <div className="py-12 text-center text-xs text-neutral-500">
                      No lifestyle notes matching "{query}". Try checking product tags or trending topics!
                    </div>
                  ) : (
                    <div className="columns-2 sm:columns-3 gap-3">
                      {filteredResults.matchingNotes.map((note) => (
                        <div
                          key={note.id}
                          onClick={() => {
                            onSelectNote(note);
                            onClose();
                          }}
                          className="break-inside-avoid mb-3 bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                          <img
                            src={note.mediaUrls[0]}
                            alt={note.title}
                            className="w-full object-cover"
                          />
                          <div className="p-2.5">
                            <h4 className="text-xs font-bold text-[#111111] line-clamp-2 leading-snug">
                              {note.title}
                            </h4>
                            <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-500">
                              <span className="truncate">{note.user?.displayName}</span>
                              <span className="flex items-center gap-0.5 text-[#FF2442] font-semibold">
                                <Heart className="w-3 h-3 fill-[#FF2442]" />
                                {note.likesCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
