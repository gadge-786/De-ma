export type UserRole = 'USER' | 'CREATOR' | 'MERCHANT';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  bio: string;
  followersCount: number;
  followingCount: number;
  totalLikesReceived: number;
  isFollowing?: boolean;
  verified?: boolean;
  location?: string;
}

export interface ProductHotspot {
  id: string;
  noteId: string;
  productId: string;
  xCoordinate: number; // 0 to 100 percentage
  yCoordinate: number; // 0 to 100 percentage
  product?: Product;
}

export interface Product {
  id: string;
  merchantId: string;
  merchant?: User;
  title: string;
  price: number;
  originalPrice?: number;
  coverImage: string;
  stock: number;
  rating: number;
  salesCount: number;
  category: string;
  description: string;
  tags: string[];
}

export interface Comment {
  id: string;
  noteId: string;
  userId: string;
  user: User;
  content: string;
  imageUrl?: string;
  parentId?: string | null;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
  replies?: Comment[];
}

export interface Note {
  id: string;
  userId: string;
  user: User;
  title: string;
  content: string;
  mediaUrls: string[];
  tags: string[];
  category: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  distanceKm?: number; // Calculated dynamically for nearby feed
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  savesCount: number;
  commentsCount: number;
  viewCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  hotspots: ProductHotspot[];
  score?: number; // Time-decay mathematical score
  algoScore?: number; // Personalized Instagram-like Your Algo score
  algoMatchReason?: string; // e.g. "✨ 96% Match · #Cinema affinity"
  algoMatchPercentage?: number; // 0 - 100%
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  createdAt: string;
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber: string;
}

export interface UserAlgoPreferences {
  freshnessWeight: number; // 0 (popular/all-time) to 1 (newest first)
  discoveryBias: number; // 0 (pure echo-chamber match) to 1 (high exploration)
  shoppingBias: number; // 0 to 1 (priority on notes with product hotspots)
  boostedCategories: string[];
}

export interface UserTasteProfile {
  categoryWeights: Record<string, number>;
  tagWeights: Record<string, number>;
  creatorAffinities: Record<string, number>;
  preferences: UserAlgoPreferences;
  totalInteractions: number;
  lastUpdated: string;
}

export type FeedTab = 'explore' | 'algo' | 'follow' | 'nearby';
export type MainView = 'feed' | 'shop' | 'search' | 'profile' | 'notifications';
export type SortOption = 'trending' | 'algo' | 'latest' | 'likes' | 'nearby';

