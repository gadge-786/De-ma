import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Bookmark,
  Share2,
  Send,
  ShoppingBag,
  MapPin,
  Sparkles,
  Check,
  Tag,
  MessageCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Note, Product, Comment, User, ProductHotspot } from '../types';

interface NoteModalProps {
  note: Note | null;
  onClose: () => void;
  onToggleLike: (noteId: string) => void;
  onToggleSave: (noteId: string) => void;
  onFollowUser: (userId: string) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  comments: Comment[];
  onAddComment: (noteId: string, content: string, parentId?: string | null) => void;
  onToggleLikeComment: (commentId: string) => void;
  currentUser: User;
  allProducts: Product[];
}

export const NoteModal: React.FC<NoteModalProps> = ({
  note,
  onClose,
  onToggleLike,
  onToggleSave,
  onFollowUser,
  onAddToCart,
  onBuyNow,
  comments,
  onAddComment,
  onToggleLikeComment,
  currentUser,
  allProducts,
}) => {
  if (!note) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<Comment | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);

  // Map products into hotspots
  const enrichedHotspots: (ProductHotspot & { productDetails?: Product })[] = (note.hotspots || []).map((hs) => ({
    ...hs,
    productDetails: allProducts.find((p) => p.id === hs.productId),
  }));

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % note.mediaUrls.length);
    setActiveHotspotId(null);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + note.mediaUrls.length) % note.mediaUrls.length);
    setActiveHotspotId(null);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(note.id, commentText.trim(), replyingToComment?.id || null);
    setCommentText('');
    setReplyingToComment(null);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div className="relative z-10 w-full max-w-5xl h-full md:h-[90vh] bg-white md:rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-neutral-100">
        {/* Close Button Mobile/Desktop */}
        <button
          id="close-note-modal-btn"
          onClick={onClose}
          className="absolute top-3 left-3 md:top-4 md:left-4 z-30 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg"
          title="Close note"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Toggle Hotspots Visibility Button */}
        {enrichedHotspots.length > 0 && (
          <button
            id="toggle-hotspots-btn"
            onClick={() => setShowHotspots(!showHotspots)}
            className="absolute top-3 right-3 md:top-4 md:left-16 z-30 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer shadow-lg"
          >
            <Tag className="w-3.5 h-3.5 text-[#FF2442]" />
            <span>{showHotspots ? 'Hide Tags' : 'Show Tags'}</span>
          </button>
        )}

        {/* LEFT COLUMN: Media Carousel & Interactive Hotspots */}
        <div className="relative w-full md:w-[58%] h-[48vh] md:h-full bg-neutral-950 flex items-center justify-center select-none overflow-hidden group">
          {/* Main Image */}
          <img
            src={note.mediaUrls[activeImageIndex]}
            alt={note.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain md:object-cover"
          />

          {/* Hotspot Pins Overlay */}
          {showHotspots &&
            enrichedHotspots.map((hs) => {
              const product = hs.productDetails;
              const isActive = activeHotspotId === hs.id;

              return (
                <div
                  key={hs.id}
                  style={{
                    left: `${hs.xCoordinate}%`,
                    top: `${hs.yCoordinate}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspotId(isActive ? null : hs.id);
                  }}
                >
                  {/* Pulsing Hotspot Marker Pin */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-[#FF2442] text-white flex items-center justify-center shadow-lg border-2 border-white animate-hotspot">
                      <ShoppingBag className="w-3 h-3" />
                    </div>
                    {/* Hotspot Title Pill Tag */}
                    <div className="ml-2 whitespace-nowrap bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white/20 hidden sm:flex items-center gap-1">
                      <span>{product?.title ? product.title.split(' ')[0] : 'Product'}</span>
                      <span className="text-[#FF2442] font-extrabold">${product?.price}</span>
                    </div>
                  </div>

                  {/* Expanded Floating Product Card */}
                  {isActive && product && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 mt-3 w-64 bg-white rounded-xl shadow-2xl p-3 border border-neutral-200 z-30 animate-in zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-2.5 mb-2.5">
                        <img
                          src={product.coverImage}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-neutral-100"
                        />
                        <div className="overflow-hidden flex-1">
                          <h4 className="text-xs font-bold text-[#111111] line-clamp-2 leading-tight">
                            {product.title}
                          </h4>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-sm font-black text-[#FF2442]">${product.price.toFixed(2)}</span>
                            {product.originalPrice && (
                              <span className="text-[10px] text-neutral-400 line-through">
                                ${product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          id={`hotspot-add-cart-${product.id}`}
                          onClick={() => {
                            onAddToCart(product);
                            setActiveHotspotId(null);
                          }}
                          className="flex-1 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-[#111111] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Add to Bag
                        </button>
                        <button
                          id={`hotspot-buy-now-${product.id}`}
                          onClick={() => {
                            onBuyNow(product);
                            setActiveHotspotId(null);
                          }}
                          className="flex-1 py-1.5 bg-[#FF2442] hover:bg-[#e01e38] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          {/* Carousel Arrows */}
          {note.mediaUrls.length > 1 && (
            <>
              <button
                id="prev-image-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                id="next-image-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Carousel Pagination Dots */}
          {note.mediaUrls.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
              {note.mediaUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'w-4 bg-[#FF2442]' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Note Details, Creator Header, Comments & Actions */}
        <div className="w-full md:w-[42%] h-[52vh] md:h-full flex flex-col justify-between bg-white overflow-hidden">
          {/* Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
            {/* Creator Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <img
                  src={note.user?.avatarUrl}
                  alt={note.user?.displayName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-neutral-100"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="text-sm font-bold text-[#111111]">{note.user?.displayName}</h4>
                    {note.user?.verified && (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#FF2442] text-white flex items-center justify-center text-[9px] font-black">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#666666]">
                    @{note.user?.username} · {note.user?.followersCount > 999 ? `${(note.user.followersCount / 1000).toFixed(1)}k` : note.user?.followersCount} fans
                  </p>
                </div>
              </div>

              {note.user?.id !== currentUser.id && (
                <button
                  id={`follow-user-btn-${note.user?.id}`}
                  onClick={() => onFollowUser(note.user?.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    note.user?.isFollowing
                      ? 'bg-neutral-100 text-[#666666] hover:bg-neutral-200'
                      : 'bg-[#FF2442] text-white hover:bg-[#e01e38] shadow-sm shadow-[#FF2442]/20'
                  }`}
                >
                  {note.user?.isFollowing ? 'Following' : '+ Follow'}
                </button>
              )}
            </div>

            {/* Note Title & Content */}
            <div className="py-4 space-y-3">
              <h2 className="text-lg md:text-xl font-extrabold text-[#111111] leading-snug tracking-tight">
                {note.title}
              </h2>

              <p className="text-sm text-[#333333] whitespace-pre-line leading-relaxed font-normal">
                {note.content}
              </p>

              {/* Tags Cloud */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold text-[#1a56db] bg-blue-50/60 hover:bg-blue-100/70 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Timestamp & Location Pin */}
              <div className="flex items-center gap-3 text-[11px] text-[#888888] pt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                {note.locationName && (
                  <span className="flex items-center gap-1 text-[#666666] font-medium">
                    <MapPin className="w-3 h-3 text-[#FF2442]" />
                    {note.locationName}
                  </span>
                )}
                <span>{note.viewCount.toLocaleString()} views</span>
              </div>
            </div>

            {/* Social Commerce Hotspot Products Strip */}
            {enrichedHotspots.length > 0 && (
              <div className="my-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111]">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#FF2442]" />
                    <span>Items Featured in this Note ({enrichedHotspots.length})</span>
                  </div>
                  <span className="text-[10px] text-[#666666]">1-Click Checkout</span>
                </div>

                <div className="space-y-2">
                  {enrichedHotspots.map((hs) => {
                    const prod = hs.productDetails;
                    if (!prod) return null;
                    return (
                      <div
                        key={hs.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-neutral-100 shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={prod.coverImage}
                            alt={prod.title}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                          />
                          <div className="overflow-hidden">
                            <h5 className="text-xs font-bold text-[#111111] truncate">{prod.title}</h5>
                            <span className="text-xs font-black text-[#FF2442]">${prod.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          <button
                            id={`strip-add-cart-${prod.id}`}
                            onClick={() => onAddToCart(prod)}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-[#111111] text-[11px] font-bold rounded-md transition-colors cursor-pointer"
                          >
                            Bag
                          </button>
                          <button
                            id={`strip-buy-now-${prod.id}`}
                            onClick={() => onBuyNow(prod)}
                            className="px-2.5 py-1 bg-[#FF2442] hover:bg-[#e01e38] text-white text-[11px] font-bold rounded-md transition-colors cursor-pointer"
                          >
                            Buy
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-bold text-[#111111] mb-3 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-neutral-400" />
                Comments ({comments.length})
              </h4>

              {comments.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#888888]">
                  Be the first to leave an authentic review or question!
                </div>
              ) : (
                <div className="space-y-3.5">
                  {comments.map((c) => (
                    <div key={c.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <img
                            src={c.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={c.user?.displayName}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover mt-0.5 flex-shrink-0"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#111111] mr-1.5">
                              {c.user?.displayName}
                            </span>
                            <p className="text-xs text-[#333333] mt-0.5 leading-relaxed">{c.content}</p>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-[#888888]">
                              <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <button
                                onClick={() => setReplyingToComment(c)}
                                className="font-semibold text-[#666666] hover:text-[#111111] cursor-pointer"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Comment Like */}
                        <button
                          onClick={() => onToggleLikeComment(c.id)}
                          className="flex items-center gap-0.5 text-[11px] text-[#888888] hover:text-[#FF2442] transition-colors p-1 cursor-pointer"
                        >
                          <Heart className={`w-3 h-3 ${c.isLiked ? 'fill-[#FF2442] text-[#FF2442]' : ''}`} />
                          <span>{c.likesCount || ''}</span>
                        </button>
                      </div>

                      {/* Nested Replies */}
                      {c.replies && c.replies.length > 0 && (
                        <div className="ml-9 pl-3 border-l border-neutral-100 space-y-2">
                          {c.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <img
                                  src={reply.user?.avatarUrl}
                                  alt={reply.user?.displayName}
                                  referrerPolicy="no-referrer"
                                  className="w-5 h-5 rounded-full object-cover mt-0.5 flex-shrink-0"
                                />
                                <div>
                                  <span className="text-[11px] font-bold text-[#111111] mr-1">
                                    {reply.user?.displayName}
                                  </span>
                                  <p className="text-[11px] text-[#333333] leading-relaxed">{reply.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom Action & Comment Bar */}
          <div className="p-3 md:p-4 bg-white border-t border-neutral-100 flex flex-col gap-2">
            {/* Replying banner */}
            {replyingToComment && (
              <div className="flex items-center justify-between text-[11px] bg-red-50 text-[#FF2442] px-2.5 py-1 rounded-md">
                <span>Replying to @{replyingToComment.user.displayName}</span>
                <button onClick={() => setReplyingToComment(null)} className="font-bold cursor-pointer">
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Comment Input */}
              <form onSubmit={handleSubmitComment} className="flex-1 flex items-center gap-2 bg-neutral-100 rounded-full px-3 py-1.5">
                <input
                  type="text"
                  placeholder={replyingToComment ? `Reply to ${replyingToComment.user.displayName}...` : 'Say something authentic...'}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-[#111111] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="text-[#FF2442] disabled:text-neutral-300 p-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Like Button */}
              <button
                id="modal-like-btn"
                onClick={() => onToggleLike(note.id)}
                className="flex flex-col items-center justify-center p-1 text-[#666666] hover:text-[#FF2442] transition-colors cursor-pointer"
                title="Like note"
              >
                <Heart className={`w-5 h-5 transition-transform active:scale-125 ${note.isLiked ? 'fill-[#FF2442] text-[#FF2442]' : ''}`} />
                <span className="text-[10px] font-bold mt-0.5">
                  {note.likesCount > 999 ? `${(note.likesCount / 1000).toFixed(1)}k` : note.likesCount}
                </span>
              </button>

              {/* Bookmark / Save Button */}
              <button
                id="modal-save-btn"
                onClick={() => onToggleSave(note.id)}
                className="flex flex-col items-center justify-center p-1 text-[#666666] hover:text-[#f59e0b] transition-colors cursor-pointer"
                title="Collect / Bookmark"
              >
                <Bookmark className={`w-5 h-5 transition-transform active:scale-125 ${note.isSaved ? 'fill-[#f59e0b] text-[#f59e0b]' : ''}`} />
                <span className="text-[10px] font-bold mt-0.5">
                  {note.savesCount > 999 ? `${(note.savesCount / 1000).toFixed(1)}k` : note.savesCount}
                </span>
              </button>

              {/* Share Button */}
              <button
                id="modal-share-btn"
                onClick={handleShare}
                className="flex flex-col items-center justify-center p-1 text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
                title="Share link"
              >
                {copiedLink ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                <span className="text-[10px] font-bold mt-0.5">{copiedLink ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
