import React, { useState, useEffect, useMemo } from 'react';
import {
  Note,
  Product,
  Comment,
  CartItem,
  Order,
  User,
  FeedTab,
  MainView,
  SortOption,
  ProductHotspot
} from './types';
import {
  getStoredNotes,
  saveNotes,
  getStoredProducts,
  saveProducts,
  getStoredComments,
  saveComment,
  getStoredUser,
  saveUser,
  getStoredCart,
  saveCart,
  getStoredOrders,
  saveOrder,
  calculateNoteScore,
  calculateDistanceKm
} from './lib/storage';
import { Header } from './components/Header';
import { NavigationDock } from './components/NavigationDock';
import { FeedGrid } from './components/FeedGrid';
import { NoteModal } from './components/NoteModal';
import { PublishModal } from './components/PublishModal';
import { SearchOverlay } from './components/SearchOverlay';
import { ShoppingView } from './components/ShoppingView';
import { CartDrawer } from './components/CartDrawer';
import { UserProfileView } from './components/UserProfileView';
import { NotificationsView } from './components/NotificationsView';

export default function App() {
  // Core application data stores
  const [notes, setNotes] = useState<Note[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(getStoredUser());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Navigation & View States
  const [currentView, setCurrentView] = useState<MainView>('feed');
  const [activeFeedTab, setActiveFeedTab] = useState<FeedTab>('explore');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('trending');

  // Modal / Drawer Overlays
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [activeNoteComments, setActiveNoteComments] = useState<Comment[]>([]);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // User location for Nearby tab
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number }>({
    lat: 35.6762,
    lon: 139.6503, // Tokyo default
  });

  // Initial Load from Persistence
  useEffect(() => {
    const loadedNotes = getStoredNotes();
    const loadedProducts = getStoredProducts();
    const loadedCart = getStoredCart();
    const loadedOrders = getStoredOrders();
    const loadedUser = getStoredUser();

    setNotes(loadedNotes);
    setProducts(loadedProducts);
    setCart(loadedCart);
    setOrders(loadedOrders);
    setCurrentUser(loadedUser);

    // Try detecting browser geolocation for Spatial PostGIS simulation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        () => {
          // Keep default
        }
      );
    }
  }, []);

  // Update selected note comments when selectedNote changes
  useEffect(() => {
    if (selectedNote) {
      const comms = getStoredComments(selectedNote.id);
      setActiveNoteComments(comms);
    }
  }, [selectedNote]);

  // Compute feed notes based on Tab, Category, Sorting, and PostGIS distance
  const displayedNotes = useMemo(() => {
    let result = [...notes];

    // Filter by tab:
    if (activeFeedTab === 'follow') {
      result = result.filter((n) => n.user?.isFollowing || n.userId === currentUser.id);
    } else if (activeFeedTab === 'nearby') {
      // Calculate spatial distance from userLocation
      result = result.map((n) => {
        const lat = n.latitude || 35.6762;
        const lon = n.longitude || 139.6503;
        const dist = calculateDistanceKm(userLocation.lat, userLocation.lon, lat, lon);
        return { ...n, distanceKm: dist };
      });
      result.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    // Filter by category:
    if (selectedCategory !== 'All') {
      result = result.filter((n) => n.category === selectedCategory);
    }

    // Sort:
    if (activeFeedTab !== 'nearby') {
      if (sortBy === 'trending') {
        result.sort((a, b) => (b.score || 0) - (a.score || 0));
      } else if (sortBy === 'latest') {
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'likes') {
        result.sort((a, b) => b.likesCount + b.savesCount - (a.likesCount + a.savesCount));
      }
    }

    return result;
  }, [notes, activeFeedTab, selectedCategory, sortBy, currentUser, userLocation]);

  // User Action Handlers
  const handleToggleLike = (noteId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const updated = notes.map((n) => {
      if (n.id === noteId) {
        const isLiked = !n.isLiked;
        const count = isLiked ? n.likesCount + 1 : Math.max(0, n.likesCount - 1);
        const updatedNote = { ...n, isLiked, likesCount: count };
        return { ...updatedNote, score: calculateNoteScore(updatedNote) };
      }
      return n;
    });

    setNotes(updated);
    saveNotes(updated);

    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote((prev) => (prev ? { ...prev, isLiked: !prev.isLiked, likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1 } : null));
    }
  };

  const handleToggleSave = (noteId: string) => {
    const updated = notes.map((n) => {
      if (n.id === noteId) {
        const isSaved = !n.isSaved;
        const count = isSaved ? n.savesCount + 1 : Math.max(0, n.savesCount - 1);
        const updatedNote = { ...n, isSaved, savesCount: count };
        return { ...updatedNote, score: calculateNoteScore(updatedNote) };
      }
      return n;
    });

    setNotes(updated);
    saveNotes(updated);

    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote((prev) => (prev ? { ...prev, isSaved: !prev.isSaved, savesCount: prev.isSaved ? prev.savesCount - 1 : prev.savesCount + 1 } : null));
    }
  };

  const handleFollowUser = (userId: string) => {
    const updated = notes.map((n) => {
      if (n.user?.id === userId) {
        const isFollowing = !n.user.isFollowing;
        return {
          ...n,
          user: {
            ...n.user,
            isFollowing,
            followersCount: isFollowing ? n.user.followersCount + 1 : n.user.followersCount - 1,
          },
        };
      }
      return n;
    });

    setNotes(updated);
    saveNotes(updated);

    if (selectedNote && selectedNote.user?.id === userId) {
      setSelectedNote((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                isFollowing: !prev.user.isFollowing,
                followersCount: !prev.user.isFollowing ? prev.user.followersCount + 1 : prev.user.followersCount - 1,
              },
            }
          : null
      );
    }
  };

  const handleAddComment = (noteId: string, content: string, parentId?: string | null) => {
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      noteId,
      userId: currentUser.id,
      user: currentUser,
      content,
      parentId,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
    };

    saveComment(noteId, newComment);
    setActiveNoteComments(getStoredComments(noteId));

    // Increment comment count on note
    const updated = notes.map((n) => {
      if (n.id === noteId) {
        const updatedNote = { ...n, commentsCount: n.commentsCount + 1 };
        return { ...updatedNote, score: calculateNoteScore(updatedNote) };
      }
      return n;
    });
    setNotes(updated);
    saveNotes(updated);
  };

  const handleToggleLikeComment = (commentId: string) => {
    setActiveNoteComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = !c.isLiked;
          return { ...c, isLiked, likesCount: isLiked ? c.likesCount + 1 : c.likesCount - 1 };
        }
        return c;
      })
    );
  };

  // Commerce & Cart Handlers
  const handleAddToCart = (product: Product) => {
    let updated: CartItem[];
    const exists = cart.find((i) => i.product.id === product.id);
    if (exists) {
      updated = cart.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      updated = [...cart, { id: `cart-${Date.now()}`, product, quantity: 1 }];
    }
    setCart(updated);
    saveCart(updated);
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    const updated = cart
      .map((i) => {
        if (i.product.id === productId) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      })
      .filter(Boolean) as CartItem[];

    setCart(updated);
    saveCart(updated);
  };

  const handleRemoveFromCart = (productId: string) => {
    const updated = cart.filter((i) => i.product.id !== productId);
    setCart(updated);
    saveCart(updated);
  };

  const handleCheckoutSuccess = (newOrder: Order) => {
    saveOrder(newOrder);
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    saveCart([]);
  };

  // Creator Note Publishing
  const handlePublishNote = (newNoteData: {
    title: string;
    content: string;
    mediaUrls: string[];
    tags: string[];
    category: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
    hotspots: ProductHotspot[];
  }) => {
    const newNoteId = `note-${Date.now()}`;
    const newNote: Note = {
      id: newNoteId,
      userId: currentUser.id,
      user: currentUser,
      title: newNoteData.title,
      content: newNoteData.content,
      mediaUrls: newNoteData.mediaUrls,
      tags: newNoteData.tags,
      category: newNoteData.category,
      locationName: newNoteData.locationName || 'Tokyo, Japan',
      latitude: newNoteData.latitude || 35.6762,
      longitude: newNoteData.longitude || 139.6503,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 1,
      savesCount: 0,
      commentsCount: 0,
      viewCount: 1,
      isLiked: true,
      isSaved: false,
      hotspots: newNoteData.hotspots.map((h) => ({ ...h, noteId: newNoteId })),
    };

    newNote.score = calculateNoteScore(newNote);

    const updated = [newNote, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setCurrentView('feed');
    setActiveFeedTab('explore');
  };

  const handleCreateProduct = (newProd: Omit<Product, 'id'>): Product => {
    const created: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
    };
    const updated = [created, ...products];
    setProducts(updated);
    saveProducts(updated);
    return created;
  };

  const handleUpdateUser = (updatedFields: Partial<User>) => {
    const updated = { ...currentUser, ...updatedFields };
    setCurrentUser(updated);
    saveUser(updated);
  };

  // Profile Sub-queries
  const myNotes = useMemo(() => notes.filter((n) => n.userId === currentUser.id), [notes, currentUser]);
  const savedNotes = useMemo(() => notes.filter((n) => n.isSaved), [notes]);
  const likedNotes = useMemo(() => notes.filter((n) => n.isLiked), [notes]);
  const totalCartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#111111] pb-20">
      {/* Top App Header (Visible in Feed mode) */}
      {currentView === 'feed' && (
        <Header
          activeTab={activeFeedTab}
          onTabChange={setActiveFeedTab}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={totalCartCount}
        />
      )}

      {/* Main View Router */}
      <main className="w-full">
        {currentView === 'feed' && (
          <FeedGrid
            notes={displayedNotes}
            onSelectNote={setSelectedNote}
            onToggleLike={handleToggleLike}
            isNearbyTab={activeFeedTab === 'nearby'}
          />
        )}

        {currentView === 'shop' && (
          <ShoppingView
            products={products}
            notes={notes}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSelectNote={setSelectedNote}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationsView
            currentUser={currentUser}
            notes={notes}
            onSelectNote={setSelectedNote}
          />
        )}

        {currentView === 'profile' && (
          <UserProfileView
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            myNotes={myNotes}
            savedNotes={savedNotes}
            likedNotes={likedNotes}
            myOrders={orders}
            allProducts={products}
            onSelectNote={setSelectedNote}
            onToggleLike={handleToggleLike}
            onOpenPublish={() => setIsPublishOpen(true)}
          />
        )}
      </main>

      {/* Modals and Drawers */}
      <NoteModal
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onToggleLike={handleToggleLike}
        onToggleSave={handleToggleSave}
        onFollowUser={handleFollowUser}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        comments={activeNoteComments}
        onAddComment={handleAddComment}
        onToggleLikeComment={handleToggleLikeComment}
        currentUser={currentUser}
        allProducts={products}
      />

      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onPublish={handlePublishNote}
        currentUser={currentUser}
        allProducts={products}
        onCreateProduct={handleCreateProduct}
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        notes={notes}
        products={products}
        onSelectNote={setSelectedNote}
        onSelectProduct={(p) => {
          handleAddToCart(p);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      {/* Signature Bottom Mobile Navigation Dock */}
      <NavigationDock
        currentView={currentView}
        onChangeView={setCurrentView}
        onOpenPublish={() => setIsPublishOpen(true)}
        currentUser={currentUser}
        cartCount={totalCartCount}
      />
    </div>
  );
}
