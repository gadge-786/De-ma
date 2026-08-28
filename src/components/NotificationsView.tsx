import React from 'react';
import { Heart, MessageCircle, UserPlus, ShoppingBag, Sparkles } from 'lucide-react';
import { User, Note } from '../types';

interface NotificationsViewProps {
  currentUser: User;
  notes: Note[];
  onSelectNote: (note: Note) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  currentUser,
  notes,
  onSelectNote,
}) => {
  const notifications = [
    {
      id: 'notif-1',
      type: 'like',
      user: {
        name: 'Aria Chen ✨',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
      },
      text: 'liked your note "Sunday Morning Matcha Latte in Vintage Stoneware"',
      time: '12m ago',
      targetNote: notes[4] || notes[0],
    },
    {
      id: 'notif-2',
      type: 'comment',
      user: {
        name: 'Kenji Roasters',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      },
      text: 'commented: "Where did you get that ceramic mug? It looks so comfortable to hold!"',
      time: '1h ago',
      targetNote: notes[0],
    },
    {
      id: 'notif-3',
      type: 'follow',
      user: {
        name: 'Studio Minimal',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      },
      text: 'started following your lifestyle feed',
      time: '3h ago',
    },
    {
      id: 'notif-4',
      type: 'order',
      user: {
        name: 'RED Official Store',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      },
      text: 'Your order #ord-883921 for "Minimalist Matte Ceramic Tumbler" is now processing',
      time: '1d ago',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
        <h2 className="text-base font-extrabold text-[#111111]">Notifications & Mentions</h2>
        <span className="text-xs text-[#FF2442] font-bold">Mark all read</span>
      </div>

      <div className="space-y-2.5">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => notif.targetNote && onSelectNote(notif.targetNote)}
            className="p-3.5 bg-white rounded-2xl border border-neutral-100 hover:bg-neutral-50 shadow-sm flex items-center justify-between gap-3 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative flex-shrink-0">
                <img
                  src={notif.user.avatar}
                  alt={notif.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-neutral-100 flex items-center justify-center shadow-xs">
                  {notif.type === 'like' && <Heart className="w-2.5 h-2.5 fill-[#FF2442] text-[#FF2442]" />}
                  {notif.type === 'comment' && <MessageCircle className="w-2.5 h-2.5 text-blue-500" />}
                  {notif.type === 'follow' && <UserPlus className="w-2.5 h-2.5 text-emerald-500" />}
                  {notif.type === 'order' && <ShoppingBag className="w-2.5 h-2.5 text-amber-500" />}
                </span>
              </div>

              <div className="overflow-hidden">
                <p className="text-xs text-[#111111] leading-snug">
                  <span className="font-bold mr-1">{notif.user.name}</span>
                  {notif.text}
                </p>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">{notif.time}</span>
              </div>
            </div>

            {notif.targetNote && (
              <img
                src={notif.targetNote.mediaUrls[0]}
                alt="Target note"
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
