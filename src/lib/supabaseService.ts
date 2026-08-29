import { supabase, isSupabaseConfigured } from './supabase';
import { Note, Product, User, Order, ProductHotspot } from '../types';
import { MOCK_USERS } from '../data/mockData';

const DEFAULT_AUTHOR: User = MOCK_USERS[0];

/**
 * Supabase Data Service
 * Provides asynchronous cloud database persistence with real-time support.
 */

// 1. Fetch all notes with author profile and tagged product hotspots
export async function fetchCloudNotes(): Promise<Note[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  try {
    const { data: notesData, error } = await supabase
      .from('notes')
      .select(`
        *,
        user:profiles(*),
        hotspots:note_hotspots(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch notes error (falling back):', error.message);
      return [];
    }

    if (!notesData) return [];

    return notesData.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      mediaUrls: row.media_urls || [],
      tags: row.tags || [],
      category: row.category,
      locationName: row.location_name,
      latitude: row.latitude ? Number(row.latitude) : undefined,
      longitude: row.longitude ? Number(row.longitude) : undefined,
      likesCount: row.likes_count || 0,
      savesCount: row.saves_count || 0,
      commentsCount: row.comments_count || 0,
      viewCount: row.view_count || 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      score: row.score ? Number(row.score) : 0,
      isLiked: false,
      isSaved: false,
      user: row.user ? {
        id: row.user.id || row.user_id,
        email: `${row.user.username || 'user'}@redlifestyle.app`,
        username: row.user.username || 'creator',
        displayName: row.user.display_name || 'Community Creator',
        avatarUrl: row.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        bio: row.user.bio || 'Lifestyle creator sharing daily notes.',
        role: row.user.role || 'CREATOR',
        followersCount: row.user.followers_count || 0,
        followingCount: row.user.following_count || 0,
        totalLikesReceived: row.user.total_likes_received || 0,
      } : (MOCK_USERS.find((u) => u.id === row.user_id) || DEFAULT_AUTHOR),
      hotspots: (row.hotspots || []).map((h: any) => ({
        id: h.id,
        noteId: h.note_id,
        productId: h.product_id,
        xCoordinate: Number(h.x_pct),
        yCoordinate: Number(h.y_pct),
      })),
    }));
  } catch (err) {
    console.error('fetchCloudNotes failed:', err);
    return [];
  }
}

// 2. Insert a new note and its associated hotspots
export async function createCloudNote(
  note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'savesCount' | 'commentsCount' | 'viewCount' | 'isLiked' | 'isSaved'>,
  hotspots: ProductHotspot[]
): Promise<Note | null> {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  try {
    const { data: noteRow, error: noteError } = await supabase
      .from('notes')
      .insert({
        user_id: note.userId,
        title: note.title,
        content: note.content,
        media_urls: note.mediaUrls,
        tags: note.tags,
        category: note.category,
        location_name: note.locationName,
        latitude: note.latitude,
        longitude: note.longitude,
        score: note.score || 0,
      })
      .select()
      .single();

    if (noteError || !noteRow) {
      console.error('Error inserting note into Supabase:', noteError);
      return null;
    }

    if (hotspots.length > 0) {
      const hotspotInserts = hotspots.map((h) => ({
        note_id: noteRow.id,
        product_id: h.productId || null,
        x_pct: h.xCoordinate,
        y_pct: h.yCoordinate,
        title: h.product?.title || 'Lifestyle Pick',
        price: h.product?.price || 0,
        image_url: h.product?.coverImage || null,
      }));

      await supabase.from('note_hotspots').insert(hotspotInserts);
    }

    return {
      ...note,
      id: noteRow.id,
      createdAt: noteRow.created_at,
      updatedAt: noteRow.updated_at,
      likesCount: 1,
      savesCount: 0,
      commentsCount: 0,
      viewCount: 1,
      isLiked: true,
      isSaved: false,
      hotspots,
    };
  } catch (err) {
    console.error('createCloudNote exception:', err);
    return null;
  }
}

// 3. Fetch verified marketplace products
export async function fetchCloudProducts(): Promise<Product[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sales_count', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((p: any) => ({
      id: p.id,
      merchantId: p.merchant_id,
      title: p.title,
      description: p.description || '',
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      coverImage: p.cover_image,
      category: p.category,
      rating: Number(p.rating),
      salesCount: p.sales_count || 0,
      stock: p.stock || 100,
      tags: [p.category],
    }));
  } catch (err) {
    console.error('fetchCloudProducts error:', err);
    return [];
  }
}

// 4. Create an order in Supabase
export async function createCloudOrder(order: Order): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) {
    return false;
  }

  try {
    const { error } = await supabase.from('orders').insert({
      id: order.id.startsWith('ord-') ? undefined : order.id,
      total_amount: order.totalAmount,
      status: order.status,
      shipping_address: order.shippingAddress,
      payment_method: order.paymentMethod,
      tracking_number: order.trackingNumber,
      items: order.items,
    });

    return !error;
  } catch (err) {
    console.error('createCloudOrder error:', err);
    return false;
  }
}
