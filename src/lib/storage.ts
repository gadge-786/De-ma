import { Note, Product, Comment, CartItem, Order, User } from '../types';
import { MOCK_NOTES, MOCK_PRODUCTS, MOCK_COMMENTS, CURRENT_USER } from '../data/mockData';

const NOTES_STORAGE_KEY = 'red_notes_db_v1';
const PRODUCTS_STORAGE_KEY = 'red_products_db_v1';
const COMMENTS_STORAGE_KEY = 'red_comments_db_v1';
const USER_STORAGE_KEY = 'red_user_db_v1';
const CART_STORAGE_KEY = 'red_cart_db_v1';
const ORDERS_STORAGE_KEY = 'red_orders_db_v1';

/**
 * Phase 4 Implementation: Mathematical Time-Decay Score
 * Score = ((Saves * 3) + (Comments * 2) + (Likes * 1)) / (Age in Hours + 2)^1.5
 */
export function calculateNoteScore(note: Note): number {
  const createdTime = new Date(note.createdAt).getTime();
  const now = Date.now();
  const ageInHours = Math.max(0, (now - createdTime) / (1000 * 60 * 60));
  
  const interactionWeight = (note.savesCount * 3) + (note.commentsCount * 2) + (note.likesCount * 1);
  const decayFactor = Math.pow(ageInHours + 2, 1.5);
  
  return interactionWeight / decayFactor;
}

/**
 * Haversine distance calculation in Kilometers (mimics PostGIS ST_Distance)
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Client-Side S3 Pre-Processing Loop (Canvas WebP Compression)
 * Converts & compresses uploaded images into lightweight .webp at 75% quality
 */
export async function compressImageToWebP(file: File, maxWidth = 1440, quality = 0.75): Promise<{ dataUrl: string; originalSizeKB: number; compressedSizeKB: number }> {
  const originalSizeKB = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: e.target?.result as string, originalSizeKB, compressedSizeKB: originalSizeKB });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/webp', quality);
        const compressedSizeKB = Math.round((dataUrl.length * (3 / 4)) / 1024);

        resolve({ dataUrl, originalSizeKB, compressedSizeKB });
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Storage Operations
export function getStoredNotes(): Note[] {
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!stored) {
      // Initialize with mock notes + calculated scores
      const initial = MOCK_NOTES.map(n => ({ ...n, score: calculateNoteScore(n) }));
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const notes: Note[] = JSON.parse(stored);
    return notes.map(n => ({ ...n, score: calculateNoteScore(n) }));
  } catch (err) {
    console.error('Failed reading notes from storage', err);
    return MOCK_NOTES;
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed saving notes', err);
  }
}

export function getStoredProducts(): Product[] {
  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
      return MOCK_PRODUCTS;
    }
    return JSON.parse(stored);
  } catch (err) {
    return MOCK_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Failed saving products', err);
  }
}

export function getStoredComments(noteId: string): Comment[] {
  try {
    const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
    const commentsMap: Record<string, Comment[]> = stored ? JSON.parse(stored) : MOCK_COMMENTS;
    return commentsMap[noteId] || [];
  } catch (err) {
    return MOCK_COMMENTS[noteId] || [];
  }
}

export function saveComment(noteId: string, newComment: Comment): void {
  try {
    const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
    const commentsMap: Record<string, Comment[]> = stored ? JSON.parse(stored) : { ...MOCK_COMMENTS };
    
    if (!commentsMap[noteId]) {
      commentsMap[noteId] = [];
    }

    if (newComment.parentId) {
      // Find parent comment and append to its replies
      const parent = commentsMap[noteId].find(c => c.id === newComment.parentId);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(newComment);
      } else {
        commentsMap[noteId].push(newComment);
      }
    } else {
      commentsMap[noteId].unshift(newComment);
    }

    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(commentsMap));
  } catch (err) {
    console.error('Failed saving comment', err);
  }
}

export function getStoredUser(): User {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(CURRENT_USER));
      return CURRENT_USER;
    }
    return JSON.parse(stored);
  } catch (err) {
    return CURRENT_USER;
  }
}

export function saveUser(user: User): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed saving user', err);
  }
}

export function getStoredCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (err) {
    console.error('Failed saving cart', err);
  }
}

export function getStoredOrders(): Order[] {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    return [];
  }
}

export function saveOrder(order: Order): void {
  try {
    const orders = getStoredOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed saving order', err);
  }
}
