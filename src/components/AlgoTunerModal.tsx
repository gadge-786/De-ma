import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Sliders,
  RotateCcw,
  Zap,
  Flame,
  ShoppingBag,
  TrendingUp,
  Film,
  Briefcase,
  Activity,
  Check,
  Info,
  Compass
} from 'lucide-react';
import { UserTasteProfile, UserAlgoPreferences } from '../types';
import { CATEGORIES } from '../data/mockData';
import { saveUserTasteProfile, DEFAULT_ALGO_PREFERENCES } from '../lib/algoEngine';

interface AlgoTunerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasteProfile: UserTasteProfile;
  onUpdateTasteProfile: (profile: UserTasteProfile) => void;
}

export const AlgoTunerModal: React.FC<AlgoTunerModalProps> = ({
  isOpen,
  onClose,
  tasteProfile,
  onUpdateTasteProfile,
}) => {
  if (!isOpen) return null;

  const [preferences, setPreferences] = useState<UserAlgoPreferences>({
    ...tasteProfile.preferences,
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Compute category weights breakdown
  const availableCategories = CATEGORIES.filter((c) => c !== 'All');
  const totalWeight = Object.entries(tasteProfile.categoryWeights).reduce(
    (acc, [, val]) => acc + val,
    0
  ) || 1;

  // Sort categories by user affinity
  const sortedCategories = [...availableCategories].map((cat) => {
    const weight = tasteProfile.categoryWeights[cat] || 0;
    const percentage = Math.round((weight / totalWeight) * 100);
    return { name: cat, weight, percentage };
  }).sort((a, b) => b.weight - a.weight);

  const handleToggleBoostCategory = (cat: string) => {
    const current = preferences.boostedCategories || [];
    const updated = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];

    const newPrefs = { ...preferences, boostedCategories: updated };
    setPreferences(newPrefs);

    const updatedProfile: UserTasteProfile = {
      ...tasteProfile,
      preferences: newPrefs,
    };
    saveUserTasteProfile(updatedProfile);
    onUpdateTasteProfile(updatedProfile);
  };

  const handleSliderChange = (key: keyof UserAlgoPreferences, value: number) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    const updatedProfile: UserTasteProfile = {
      ...tasteProfile,
      preferences: newPrefs,
    };
    saveUserTasteProfile(updatedProfile);
    onUpdateTasteProfile(updatedProfile);
  };

  const handleResetAlgo = () => {
    const freshProfile: UserTasteProfile = {
      categoryWeights: {
        'Shows & Cinema': 15,
        'Career': 15,
        'Trading': 15,
        'Fitness': 15,
        'Food & Cafes': 15,
        'Fashion & OOTD': 15,
        'Skincare & Beauty': 15,
        'Home & Living': 15,
        'Travel & Lifestyle': 15,
        'Tech & Desk': 15,
      },
      tagWeights: {},
      creatorAffinities: {},
      preferences: { ...DEFAULT_ALGO_PREFERENCES },
      totalInteractions: 0,
      lastUpdated: new Date().toISOString(),
    };
    setPreferences({ ...DEFAULT_ALGO_PREFERENCES });
    saveUserTasteProfile(freshProfile);
    onUpdateTasteProfile(freshProfile);
    setShowResetConfirm(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Shows & Cinema':
        return <Film className="w-3.5 h-3.5 text-rose-500" />;
      case 'Career':
        return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
      case 'Trading':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Fitness':
        return <Activity className="w-3.5 h-3.5 text-orange-500" />;
      case 'Tech & Desk':
        return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#FF2442]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="algo-tuner-modal-dialog"
        className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-neutral-100 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-linear-to-r from-neutral-900 via-[#1a1a1a] to-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-linear-to-br from-[#FF2442] to-amber-500 flex items-center justify-center shadow-lg shadow-[#FF2442]/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base tracking-tight">Your Algo</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase">
                  Personalized AI
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Transparent recommendation engine tuned to your lifestyle
              </p>
            </div>
          </div>

          <button
            id="algo-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm text-[#111111]">
          {/* Signal Stats Banner */}
          <div className="grid grid-cols-3 gap-2.5 bg-neutral-50 rounded-2xl p-3.5 border border-neutral-100 text-center">
            <div>
              <div className="text-lg font-black text-[#111111]">
                {tasteProfile.totalInteractions}
              </div>
              <div className="text-[11px] text-neutral-500 font-medium">Interactions Learned</div>
            </div>
            <div>
              <div className="text-lg font-black text-[#FF2442]">
                {sortedCategories[0]?.name.split(' ')[0] || 'Aesthetic'}
              </div>
              <div className="text-[11px] text-neutral-500 font-medium">Top Affinity Topic</div>
            </div>
            <div>
              <div className="text-lg font-black text-emerald-600">
                {Math.round((1 - preferences.discoveryBias) * 100)}%
              </div>
              <div className="text-[11px] text-neutral-500 font-medium">Taste Match Precision</div>
            </div>
          </div>

          {/* User Taste Profile Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#FF2442]" />
                Your Computed Taste Radar
              </h4>
              <span className="text-[11px] text-neutral-400">Updated continuously</span>
            </div>

            <div className="space-y-2 bg-neutral-50/70 p-3.5 rounded-2xl border border-neutral-100">
              {sortedCategories.slice(0, 5).map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-neutral-800">
                      {getCategoryIcon(cat.name)}
                      {cat.name}
                    </span>
                    <span className="text-neutral-500 font-mono text-[11px]">{cat.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-[#FF2442] to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(6, Math.min(100, cat.percentage * 2.5))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topic Boosters (Shows & Cinema, Career, Trading, Fitness, etc.) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Explicit Topic Boosters (+45% Weight)
              </h4>
              <span className="text-[11px] text-neutral-400">Tap to pin to feed</span>
            </div>
            <p className="text-xs text-neutral-500">
              Select topics you want Your Algo to heavily favor in today's recommendation stream:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {availableCategories.map((cat) => {
                const isBoosted = preferences.boostedCategories?.includes(cat);
                return (
                  <button
                    key={cat}
                    id={`boost-pill-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => handleToggleBoostCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isBoosted
                        ? 'bg-[#111111] text-white shadow-sm ring-2 ring-[#FF2442]'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80'
                    }`}
                  >
                    {getCategoryIcon(cat)}
                    <span>{cat}</span>
                    {isBoosted && <Check className="w-3 h-3 text-[#FF2442]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Fine-Tuning Sliders */}
          <div className="space-y-4 pt-2 border-t border-neutral-100">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              Tuning Sliders
            </h4>

            {/* Slider 1: Freshness vs Time-Decay Quality */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800">Freshness Velocity</span>
                <span className="text-neutral-500 text-[11px]">
                  {preferences.freshnessWeight < 0.35
                    ? 'All-Time High Quality'
                    : preferences.freshnessWeight > 0.65
                    ? 'Real-Time Latest'
                    : 'Balanced Discovery'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={preferences.freshnessWeight}
                onChange={(e) => handleSliderChange('freshnessWeight', parseFloat(e.target.value))}
                className="w-full accent-[#FF2442] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Top Viral Notes</span>
                <span>Real-Time Uploads</span>
              </div>
            </div>

            {/* Slider 2: Discovery vs Echo Chamber */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800">Serendipity & Novelty</span>
                <span className="text-neutral-500 text-[11px]">
                  {preferences.discoveryBias < 0.25
                    ? 'Laser-Focused to My Taste'
                    : preferences.discoveryBias > 0.6
                    ? 'High Serendipity / Exploratory'
                    : 'Curated Exploration'}
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.9"
                step="0.05"
                value={preferences.discoveryBias}
                onChange={(e) => handleSliderChange('discoveryBias', parseFloat(e.target.value))}
                className="w-full accent-[#FF2442] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Strict Match</span>
                <span>Unexpected Trends</span>
              </div>
            </div>

            {/* Slider 3: Shoppable Hotspots Priority */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#FF2442]" />
                  Shoppable Product Hotspots
                </span>
                <span className="text-neutral-500 text-[11px]">
                  {Math.round(preferences.shoppingBias * 100)}% Boost
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={preferences.shoppingBias}
                onChange={(e) => handleSliderChange('shoppingBias', parseFloat(e.target.value))}
                className="w-full accent-[#FF2442] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Organic Lifestyle Only</span>
                <span>Direct Tagged Products</span>
              </div>
            </div>
          </div>

          {/* Reset Engine Section */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
            {!showResetConfirm ? (
              <button
                id="algo-reset-trigger-btn"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-neutral-500 hover:text-[#FF2442] flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset algorithm history
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 font-medium">Reset all learned preferences?</span>
                <button
                  id="algo-reset-confirm-btn"
                  onClick={handleResetAlgo}
                  className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-medium hover:bg-neutral-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            <button
              id="algo-save-done-btn"
              onClick={onClose}
              className="px-4 py-2 bg-[#FF2442] hover:bg-[#e01e38] text-white rounded-xl text-xs font-bold shadow-md shadow-[#FF2442]/20 transition-all cursor-pointer"
            >
              Apply to Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
