import React from 'react';
import { Compass, ShoppingBag, Plus, Bell, User as UserIcon } from 'lucide-react';
import { MainView, User } from '../types';

interface NavigationDockProps {
  currentView: MainView;
  onChangeView: (view: MainView) => void;
  onOpenPublish: () => void;
  currentUser: User;
  cartCount: number;
}

export const NavigationDock: React.FC<NavigationDockProps> = ({
  currentView,
  onChangeView,
  onOpenPublish,
  currentUser,
  cartCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-100/80 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] py-1.5 px-4">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Explore / Home */}
        <button
          id="dock-home-btn"
          onClick={() => onChangeView('feed')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            currentView === 'feed' ? 'text-[#FF2442]' : 'text-[#666666] hover:text-[#111111]'
          }`}
        >
          <Compass className={`w-5 h-5 transition-transform ${currentView === 'feed' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-semibold mt-0.5">Explore</span>
        </button>

        {/* Mall / Social Commerce Shop */}
        <button
          id="dock-shop-btn"
          onClick={() => onChangeView('shop')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            currentView === 'shop' ? 'text-[#FF2442]' : 'text-[#666666] hover:text-[#111111]'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 transition-transform ${currentView === 'shop' ? 'scale-110' : ''}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#FF2442] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-0.5">Shop</span>
        </button>

        {/* Central Signature Red Posting Button */}
        <div className="flex-1 flex justify-center items-center">
          <button
            id="dock-publish-btn"
            onClick={onOpenPublish}
            className="w-11 h-9 rounded-xl bg-[#FF2442] hover:bg-[#e01e38] active:scale-95 text-white flex items-center justify-center shadow-md shadow-[#FF2442]/30 transition-all cursor-pointer group"
            title="Publish Lifestyle Note"
          >
            <Plus className="w-5 h-5 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Notifications / Messages */}
        <button
          id="dock-notifications-btn"
          onClick={() => onChangeView('notifications')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            currentView === 'notifications' ? 'text-[#FF2442]' : 'text-[#666666] hover:text-[#111111]'
          }`}
        >
          <div className="relative">
            <Bell className={`w-5 h-5 transition-transform ${currentView === 'notifications' ? 'scale-110' : ''}`} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FF2442] rounded-full" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">Messages</span>
        </button>

        {/* Profile / Me */}
        <button
          id="dock-profile-btn"
          onClick={() => onChangeView('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            currentView === 'profile' ? 'text-[#FF2442]' : 'text-[#666666] hover:text-[#111111]'
          }`}
        >
          <div className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
            currentView === 'profile' ? 'border-[#FF2442] ring-1 ring-[#FF2442]' : 'border-neutral-200'
          }`}>
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">Me</span>
        </button>
      </div>
    </nav>
  );
};
