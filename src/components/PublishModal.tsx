import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Tag,
  MapPin,
  Sparkles,
  ShoppingBag,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import { Product, ProductHotspot, User } from '../types';
import { CATEGORIES } from '../data/mockData';
import { compressImageToWebP } from '../lib/storage';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (newNote: {
    title: string;
    content: string;
    mediaUrls: string[];
    tags: string[];
    category: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
    hotspots: ProductHotspot[];
  }) => void;
  currentUser: User;
  allProducts: Product[];
  onCreateProduct: (product: Omit<Product, 'id'>) => Product;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  currentUser,
  allProducts,
  onCreateProduct,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1] || 'Fashion & OOTD');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['AestheticDaily', 'Lifestyle']);
  const [locationName, setLocationName] = useState('Daikanyama, Tokyo');
  const [latitude, setLatitude] = useState<number | undefined>(35.6486);
  const [longitude, setLongitude] = useState<number | undefined>(139.7005);
  
  // Media states
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [compressionStats, setCompressionStats] = useState<{ orig: number; comp: number } | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Hotspots creation
  const [hotspots, setHotspots] = useState<ProductHotspot[]>([]);
  const [isTaggingMode, setIsTaggingMode] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  
  // Quick create product modal state
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Fashion & OOTD');
  
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Preset lifestyle demo stock photos if user wants instant inspiration
  const samplePresets = [
    {
      title: 'Minimalist Ceramics & Matcha',
      url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=900&auto=format&fit=crop&q=80',
    },
    {
      title: 'Autumn Cozy Coat Outfit',
      url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&auto=format&fit=crop&q=80',
    },
    {
      title: 'Dewy Skincare Glow Essence',
      url: 'https://images.unsplash.com/photo-1608248597359-561352a92e21?w=900&auto=format&fit=crop&q=80',
    },
    {
      title: 'Architectural Desk Lighting',
      url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=900&auto=format&fit=crop&q=80',
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingImage(true);
    let totalOrig = 0;
    let totalComp = 0;
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await compressImageToWebP(files[i]);
        newUrls.push(result.dataUrl);
        totalOrig += result.originalSizeKB;
        totalComp += result.compressedSizeKB;
      } catch (err) {
        console.error('Image compression error', err);
      }
    }

    setMediaUrls((prev) => [...prev, ...newUrls]);
    setCompressionStats({ orig: totalOrig, comp: totalComp });
    setIsProcessingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddPreset = (url: string) => {
    setMediaUrls((prev) => [...prev, url]);
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTaggingMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;

    setPendingCoords({ x, y });
  };

  const handleConfirmHotspot = () => {
    if (!pendingCoords || !selectedProductId) return;

    const newHotspot: ProductHotspot = {
      id: `hs-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      noteId: 'temp-note',
      productId: selectedProductId,
      xCoordinate: pendingCoords.x,
      yCoordinate: pendingCoords.y,
    };

    setHotspots([...hotspots, newHotspot]);
    setPendingCoords(null);
    setSelectedProductId('');
    setIsTaggingMode(false);
  };

  const handleQuickCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle || !newProdPrice) return;
    const priceNum = parseFloat(newProdPrice);
    if (isNaN(priceNum)) return;

    const created = onCreateProduct({
      merchantId: currentUser.id,
      title: newProdTitle.trim(),
      price: priceNum,
      coverImage: mediaUrls[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
      stock: 50,
      rating: 5.0,
      salesCount: 1,
      category: newProdCategory,
      description: `Authentic lifestyle merchandise tagged by @${currentUser.username}`,
      tags: ['CreatorPick', 'Aesthetic'],
    });

    setSelectedProductId(created.id);
    setShowCreateProduct(false);
    setNewProdTitle('');
    setNewProdPrice('');
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationName('Current Location (Nearby)');
        },
        () => {
          setLocationName('Shibuya, Tokyo');
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || mediaUrls.length === 0) return;

    onPublish({
      title: title.trim(),
      content: content.trim(),
      mediaUrls,
      tags,
      category,
      locationName,
      latitude,
      longitude,
      hotspots,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-neutral-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FF2442] flex items-center justify-center text-white text-xs font-black">
              +
            </div>
            <h3 className="font-extrabold text-base text-[#111111]">Create Lifestyle Note · 发布笔记</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-[#666666] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
          {/* Media Upload & Canvas WebP Compressor Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#FF2442]" />
                Media Carousel ({mediaUrls.length}/9)
              </label>
              {compressionStats && (
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <FileCheck2 className="w-3 h-3" />
                  WebP Compressed: {compressionStats.orig}KB → {compressionStats.comp}KB (-
                  {Math.round((1 - compressionStats.comp / (compressionStats.orig || 1)) * 100)}%)
                </span>
              )}
            </div>

            {/* Media preview list & Dropzone */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {mediaUrls.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                    activeImageIndex === idx ? 'border-[#FF2442] ring-2 ring-[#FF2442]/20' : 'border-neutral-200'
                  }`}
                >
                  <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMediaUrls(mediaUrls.filter((_, i) => i !== idx));
                      if (activeImageIndex >= mediaUrls.length - 1) setActiveImageIndex(0);
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {/* Upload Action Button */}
              {mediaUrls.length < 9 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#FF2442] bg-neutral-50 hover:bg-red-50/30 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all text-neutral-500 hover:text-[#FF2442]"
                >
                  {isProcessingImage ? (
                    <div className="w-5 h-5 border-2 border-[#FF2442] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span className="text-[11px] font-bold">Add Photo</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Quick Sample Inspiration Presets */}
            {mediaUrls.length === 0 && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                <p className="text-[11px] font-semibold text-neutral-500 mb-2">
                  Or pick a curated aesthetic photo preset:
                </p>
                <div className="flex flex-wrap gap-2">
                  {samplePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPreset(preset.url)}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-xs text-[#111111] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#FF2442]" />
                      <span>{preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Product Hotspot Mapping Tool (Phase 5) */}
          {mediaUrls.length > 0 && (
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#FF2442]" />
                  <span className="text-xs font-bold text-[#111111]">
                    Interactive Product Hotspot Pins ({hotspots.length} tagged)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsTaggingMode(!isTaggingMode);
                    setPendingCoords(null);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isTaggingMode
                      ? 'bg-[#FF2442] text-white shadow-sm shadow-[#FF2442]/30'
                      : 'bg-white border border-neutral-200 text-[#111111] hover:bg-neutral-100'
                  }`}
                >
                  {isTaggingMode ? '✕ Cancel Pinning' : '📍 Tap Image to Pin Product'}
                </button>
              </div>

              {isTaggingMode && (
                <p className="text-[11px] text-[#FF2442] font-semibold bg-red-50 px-2.5 py-1 rounded-md">
                  👉 Tap anywhere on the cover photo below to drop a product tag pin.
                </p>
              )}

              {/* Tagging Interactive Preview Canvas */}
              <div
                ref={imageContainerRef}
                onClick={handleImageClick}
                className={`relative w-full h-64 bg-neutral-900 rounded-xl overflow-hidden select-none ${
                  isTaggingMode ? 'cursor-crosshair ring-2 ring-[#FF2442]' : ''
                }`}
              >
                <img
                  src={mediaUrls[activeImageIndex]}
                  alt="Cover"
                  className="w-full h-full object-contain"
                />

                {/* Existing Hotspots */}
                {hotspots.map((hs) => {
                  const prod = allProducts.find((p) => p.id === hs.productId);
                  return (
                    <div
                      key={hs.id}
                      style={{ left: `${hs.xCoordinate}%`, top: `${hs.yCoordinate}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/40 shadow-lg"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#FF2442]" />
                      <span>{prod ? prod.title.split(' ')[0] : 'Product'}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHotspots(hotspots.filter((h) => h.id !== hs.id));
                        }}
                        className="ml-1 text-neutral-400 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                {/* Pending Pin Coordinate */}
                {pendingCoords && (
                  <div
                    style={{ left: `${pendingCoords.x}%`, top: `${pendingCoords.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FF2442] border-2 border-white animate-bounce flex items-center justify-center text-white text-[10px] font-black shadow-xl"
                  >
                    !
                  </div>
                )}
              </div>

              {/* Link Product Selector Dialog */}
              {pendingCoords && (
                <div className="p-3 bg-white rounded-xl border border-[#FF2442]/30 shadow-md space-y-2.5 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
                    <span>Select Product for Pin at ({pendingCoords.x}%, {pendingCoords.y}%)</span>
                    <button
                      type="button"
                      onClick={() => setShowCreateProduct(true)}
                      className="text-[#FF2442] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      + Create New Product
                    </button>
                  </div>

                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-neutral-200 bg-white text-[#111111] focus:outline-none focus:border-[#FF2442]"
                  >
                    <option value="">-- Choose from existing catalog --</option>
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} (${p.price.toFixed(2)}) · {p.category}
                      </option>
                    ))}
                  </select>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPendingCoords(null)}
                      className="px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!selectedProductId}
                      onClick={handleConfirmHotspot}
                      className="px-3 py-1 bg-[#FF2442] disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Confirm Pin
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Create Product Inline Form */}
              {showCreateProduct && (
                <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-md space-y-2">
                  <h5 className="text-xs font-bold text-[#111111]">Add New Custom Product Tag</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Product Title (e.g. Linen Slouch Tote)"
                      value={newProdTitle}
                      onChange={(e) => setNewProdTitle(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-neutral-200 col-span-2 focus:border-[#FF2442] focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Price ($ USD)"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-neutral-200 focus:border-[#FF2442] focus:outline-none"
                    />
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-neutral-200 bg-white focus:border-[#FF2442] focus:outline-none"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCreateProduct(false)}
                      className="px-3 py-1 text-xs text-neutral-600 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickCreateProductSubmit}
                      className="px-3 py-1 bg-[#111111] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Save Product Tag
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#111111]">
              Headline / Title <span className="text-[#FF2442]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Short, bold, impactful title (e.g., Daikanyama 3 Hidden Cafes ☕)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-semibold p-3 rounded-xl border border-neutral-200 focus:border-[#FF2442] focus:ring-1 focus:ring-[#FF2442] focus:outline-none"
            />
          </div>

          {/* Content Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#111111]">Lifestyle Note Content</label>
            <textarea
              rows={4}
              placeholder="Share authentic tips, honest routine breakdown, coordinates, or sizing recommendations..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-neutral-200 focus:border-[#FF2442] focus:ring-1 focus:ring-[#FF2442] focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111111]">Primary Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 bg-white font-medium focus:border-[#FF2442] focus:outline-none"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Tag */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#111111]">Location Tag</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-[11px] text-[#FF2442] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3 h-3" />
                  Auto-Detect GPS
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. Daikanyama, Tokyo or Le Marais, Paris"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 font-medium focus:border-[#FF2442] focus:outline-none"
              />
            </div>
          </div>

          {/* Hashtag Chips Inserter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#111111]">Community Hashtags</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag (e.g. #OOTD, #TokyoCafe)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 text-xs p-2 rounded-xl border border-neutral-200 focus:border-[#FF2442] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#111111] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-red-50 text-[#FF2442] text-xs font-semibold flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-black cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-[11px] text-[#888888]">
              Initial traffic pool enabled · 0-cost WebP delivery
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || mediaUrls.length === 0}
                className="px-6 py-2 bg-[#FF2442] hover:bg-[#e01e38] disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md shadow-[#FF2442]/20 transition-all cursor-pointer"
              >
                Publish Note · 立即发布
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
