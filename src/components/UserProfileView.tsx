import React, { useState } from 'react';
import {
  User as UserIcon,
  Heart,
  Bookmark,
  ShoppingBag,
  Settings,
  Edit3,
  MapPin,
  Sparkles,
  Package,
  Layers,
  Store,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { User, Note, Order, Product, UserRole } from '../types';

interface UserProfileViewProps {
  user: User;
  onUpdateUser: (updated: Partial<User>) => void;
  myNotes: Note[];
  savedNotes: Note[];
  likedNotes: Note[];
  myOrders: Order[];
  allProducts: Product[];
  onSelectNote: (note: Note) => void;
  onToggleLike: (noteId: string) => void;
  onOpenPublish: () => void;
}

type ProfileTab = 'notes' | 'saved' | 'liked' | 'orders' | 'shop';

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  onUpdateUser,
  myNotes,
  savedNotes,
  likedNotes,
  myOrders,
  allProducts,
  onSelectNote,
  onToggleLike,
  onOpenPublish,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('notes');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [location, setLocation] = useState(user.location || 'Tokyo, Japan');

  const merchantProducts = allProducts.filter((p) => p.merchantId === user.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      displayName,
      bio,
      location,
    });
    setIsEditingProfile(false);
  };

  const handleRoleToggle = (role: UserRole) => {
    onUpdateUser({ role });
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-5">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-neutral-100"
              />
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#FF2442] text-white text-xs font-black flex items-center justify-center border-2 border-white">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-[#111111]">{user.displayName}</h2>
                <span className="px-2 py-0.5 rounded-full bg-red-50 text-[#FF2442] text-[10px] font-extrabold uppercase">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-[#666666] font-medium">RED ID: {user.username}</p>
              {user.location && (
                <p className="text-xs text-neutral-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FF2442]" />
                  {user.location}
                </p>
              )}
            </div>
          </div>

          {/* Edit Profile & Role Switcher Actions */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-3.5 py-1.5 rounded-full border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-[#111111] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            {/* Quick Role Switcher Pill */}
            <select
              value={user.role}
              onChange={(e) => handleRoleToggle(e.target.value as UserRole)}
              className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-xs font-bold text-[#111111] cursor-pointer focus:outline-none"
            >
              <option value="USER">Role: Shopper (User)</option>
              <option value="CREATOR">Role: Creator</option>
              <option value="MERCHANT">Role: Merchant</option>
            </select>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs sm:text-sm text-[#333333] leading-relaxed max-w-2xl font-normal">
          {user.bio}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-6 pt-3 border-t border-neutral-100 text-xs text-[#666666]">
          <div>
            <span className="font-extrabold text-sm text-[#111111] mr-1">{user.followingCount}</span>
            <span>Following</span>
          </div>
          <div>
            <span className="font-extrabold text-sm text-[#111111] mr-1">
              {user.followersCount > 999 ? `${(user.followersCount / 1000).toFixed(1)}k` : user.followersCount}
            </span>
            <span>Followers</span>
          </div>
          <div>
            <span className="font-extrabold text-sm text-[#111111] mr-1">
              {user.totalLikesReceived > 999
                ? `${(user.totalLikesReceived / 1000).toFixed(1)}k`
                : user.totalLikesReceived}
            </span>
            <span>Likes & Saves</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 text-xs font-bold text-[#666666]">
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'notes' ? 'border-[#FF2442] text-[#FF2442] font-black' : 'border-transparent hover:text-[#111111]'
            }`}
          >
            My Notes ({myNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'saved' ? 'border-[#FF2442] text-[#FF2442] font-black' : 'border-transparent hover:text-[#111111]'
            }`}
          >
            Collects ({savedNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'liked' ? 'border-[#FF2442] text-[#FF2442] font-black' : 'border-transparent hover:text-[#111111]'
            }`}
          >
            Liked ({likedNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders' ? 'border-[#FF2442] text-[#FF2442] font-black' : 'border-transparent hover:text-[#111111]'
            }`}
          >
            My Orders ({myOrders.length})
          </button>
          {user.role === 'MERCHANT' && (
            <button
              onClick={() => setActiveTab('shop')}
              className={`py-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'shop' ? 'border-[#FF2442] text-[#FF2442] font-black' : 'border-transparent hover:text-[#111111]'
              }`}
            >
              Merchant Shop ({merchantProducts.length})
            </button>
          )}
        </div>
      </div>

      {/* Tab Content Panels */}
      <div>
        {activeTab === 'notes' && (
          <div>
            {myNotes.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-neutral-100">
                <div className="w-12 h-12 rounded-full bg-red-50 text-[#FF2442] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#111111]">No notes published yet</h4>
                <p className="text-xs text-[#666666] max-w-xs mx-auto">
                  Share your first aesthetic lifestyle review, cafe finding, or routine!
                </p>
                <button
                  onClick={onOpenPublish}
                  className="px-4 py-2 bg-[#FF2442] text-white text-xs font-bold rounded-xl shadow-md shadow-[#FF2442]/20 cursor-pointer"
                >
                  + Create First Note
                </button>
              </div>
            ) : (
              <div className="columns-2 sm:columns-3 gap-3">
                {myNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => onSelectNote(note)}
                    className="break-inside-avoid mb-3 bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <img src={note.mediaUrls[0]} alt={note.title} className="w-full object-cover" />
                    <div className="p-2.5">
                      <h4 className="text-xs font-bold text-[#111111] line-clamp-2 leading-snug">{note.title}</h4>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-500">
                        <span>{note.viewCount} views</span>
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

        {activeTab === 'saved' && (
          <div className="columns-2 sm:columns-3 gap-3">
            {savedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="break-inside-avoid mb-3 bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <img src={note.mediaUrls[0]} alt={note.title} className="w-full object-cover" />
                <div className="p-2.5">
                  <h4 className="text-xs font-bold text-[#111111] line-clamp-2 leading-snug">{note.title}</h4>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-500">
                    <span>{note.user?.displayName}</span>
                    <Bookmark className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="columns-2 sm:columns-3 gap-3">
            {likedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="break-inside-avoid mb-3 bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <img src={note.mediaUrls[0]} alt={note.title} className="w-full object-cover" />
                <div className="p-2.5">
                  <h4 className="text-xs font-bold text-[#111111] line-clamp-2 leading-snug">{note.title}</h4>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-500">
                    <span>{note.user?.displayName}</span>
                    <Heart className="w-3 h-3 fill-[#FF2442] text-[#FF2442]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3">
            {myOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#666666] bg-white rounded-2xl border border-neutral-100">
                No orders placed yet. Tap any product hotspot to experience 1-click social checkout!
              </div>
            ) : (
              myOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100">
                    <span className="font-bold text-[#111111]">Order #{order.id}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.product.coverImage}
                          alt={item.product.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 overflow-hidden">
                          <h5 className="text-xs font-bold text-[#111111] truncate">{item.product.title}</h5>
                          <span className="text-[11px] text-[#666666]">
                            Qty: {item.quantity} · ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100 text-[#666666]">
                    <span>Tracking: {order.trackingNumber}</span>
                    <span className="font-black text-[#FF2442] text-sm">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {merchantProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl p-3 border border-neutral-100 shadow-sm flex flex-col justify-between"
              >
                <img src={prod.coverImage} alt={prod.title} className="w-full aspect-square object-cover rounded-xl mb-2" />
                <div>
                  <h4 className="text-xs font-bold text-[#111111] line-clamp-1">{prod.title}</h4>
                  <span className="text-xs font-black text-[#FF2442]">${prod.price.toFixed(2)}</span>
                  <span className="text-[10px] text-[#666666] block">{prod.stock} in stock · {prod.salesCount} sold</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-neutral-100 space-y-4">
            <h3 className="text-base font-extrabold text-[#111111]">Edit Lifestyle Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#111111]">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 font-medium focus:border-[#FF2442] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#111111]">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 font-medium focus:border-[#FF2442] focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#111111]">Location Tag</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 font-medium focus:border-[#FF2442] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF2442] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
