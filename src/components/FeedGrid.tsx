import React from 'react';
import { Heart, ShoppingBag, MapPin, Sparkles, Layers } from 'lucide-react';
import { Note } from '../types';

interface FeedGridProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onToggleLike: (noteId: string, e: React.MouseEvent) => void;
  isNearbyTab?: boolean;
}

export const FeedGrid: React.FC<FeedGridProps> = ({
  notes,
  onSelectNote,
  onToggleLike,
  isNearbyTab,
}) => {
  if (notes.length === 0) {
    return (
      <div className="py-20 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-[#FF2442] flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-[#111111] mb-1">No Lifestyle Notes Found</h3>
        <p className="text-xs text-[#666666] max-w-sm mx-auto">
          Try adjusting your category filter or search keywords to discover more community reviews and itineraries.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-3">
      {/* Asymmetric Dual-Column Masonry Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-2.5 sm:gap-3.5 [column-fill:_balance]">
        {notes.map((note) => {
          const hasHotspots = note.hotspots && note.hotspots.length > 0;
          const isMultiImage = note.mediaUrls && note.mediaUrls.length > 1;

          return (
            <div
              key={note.id}
              id={`note-card-${note.id}`}
              onClick={() => onSelectNote(note)}
              className="break-inside-avoid mb-2.5 sm:mb-3.5 bg-white rounded-xl overflow-hidden border border-neutral-100/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col"
            >
              {/* Media Container */}
              <div className="relative w-full overflow-hidden bg-neutral-100">
                <img
                  src={note.mediaUrls[0]}
                  alt={note.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-300 min-h-[160px]"
                />

                {/* Multi-image Stack Badge */}
                {isMultiImage && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                    <Layers className="w-3 h-3" />
                    <span>{note.mediaUrls.length}</span>
                  </div>
                )}

                {/* Hotspot Indicator Pill */}
                {hasHotspots && (
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#111111] text-[10px] font-bold flex items-center gap-1 shadow-sm border border-black/5">
                    <ShoppingBag className="w-3 h-3 text-[#FF2442]" />
                    <span>{note.hotspots.length} {note.hotspots.length === 1 ? 'Product' : 'Products'}</span>
                  </div>
                )}

                {/* Location Distance Pill (Nearby Feed Mode) */}
                {isNearbyTab && note.locationName && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-[#FF2442]" />
                    <span>{note.locationName.split(',')[0]}</span>
                  </div>
                )}
              </div>

              {/* Note Content & Metadata */}
              <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1">
                {/* Note Title */}
                <h3 className="font-bold text-xs sm:text-sm text-[#111111] line-clamp-2 leading-snug tracking-tight mb-2 group-hover:text-[#FF2442] transition-colors">
                  {note.title}
                </h3>

                {/* Creator Avatar, Name & Like Action */}
                <div className="flex items-center justify-between text-xs text-[#666666] pt-1">
                  <div className="flex items-center gap-1.5 overflow-hidden flex-1 mr-2">
                    <img
                      src={note.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={note.user?.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="truncate text-[11px] sm:text-xs text-neutral-600 font-medium">
                      {note.user?.displayName || 'Creator'}
                    </span>
                  </div>

                  {/* Like Button */}
                  <button
                    id={`like-btn-${note.id}`}
                    onClick={(e) => onToggleLike(note.id, e)}
                    className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold transition-colors group/like p-1 -m-1 cursor-pointer"
                    title={note.isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-transform group-hover/like:scale-125 ${
                        note.isLiked
                          ? 'fill-[#FF2442] text-[#FF2442]'
                          : 'text-[#888888] group-hover/like:text-[#FF2442]'
                      }`}
                    />
                    <span className={note.isLiked ? 'text-[#FF2442]' : 'text-[#666666]'}>
                      {note.likesCount > 999
                        ? `${(note.likesCount / 1000).toFixed(1)}k`
                        : note.likesCount}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
