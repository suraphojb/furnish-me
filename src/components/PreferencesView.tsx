'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  RoomType,
  RoomState,
  RoomConfig,
  ROOMS,
  TIERS,
  BudgetTier,
  ConditionPreference,
  PreferencesState,
} from '@/lib/types';

interface PreferencesViewProps {
  state: Record<RoomType, RoomState>;
  onBack: () => void;
  onContinue: (preferences: PreferencesState) => void;
}

const CONDITION_OPTIONS: { value: ConditionPreference; label: string }[] = [
  { value: 'new-only', label: 'New only' },
  { value: 'open-to-2nd-hand', label: 'Open to 2nd hand' },
  { value: 'prefer-2nd-hand', label: 'Prefer 2nd hand' },
];

// Smart defaults per room type
const BASE_DEFAULTS: Record<RoomType, ConditionPreference> = {
  'bedroom': 'new-only',
  'second-bedroom': 'new-only',
  'bathroom': 'new-only',
  'kitchen': 'open-to-2nd-hand',
  'living-room': 'open-to-2nd-hand',
};

// How tier shifts the defaults
function getDefaultsForTier(tier: BudgetTier): Record<RoomType, ConditionPreference> {
  const defaults = { ...BASE_DEFAULTS };
  if (tier === 'essentials') {
    // Shift everything toward 2nd hand
    for (const key of Object.keys(defaults) as RoomType[]) {
      if (defaults[key] === 'new-only') defaults[key] = 'open-to-2nd-hand';
      else if (defaults[key] === 'open-to-2nd-hand') defaults[key] = 'prefer-2nd-hand';
    }
  } else if (tier === 'full-setup') {
    // Shift everything toward new
    for (const key of Object.keys(defaults) as RoomType[]) {
      if (defaults[key] === 'prefer-2nd-hand') defaults[key] = 'open-to-2nd-hand';
      else if (defaults[key] === 'open-to-2nd-hand') defaults[key] = 'new-only';
    }
  }
  return defaults;
}

export default function PreferencesView({ state, onBack, onContinue }: PreferencesViewProps) {
  const [tier, setTier] = useState<BudgetTier>('comfortable');
  const [categories, setCategories] = useState<Record<RoomType, ConditionPreference>>(
    () => getDefaultsForTier('comfortable')
  );
  const [userOverrides, setUserOverrides] = useState<Set<RoomType>>(new Set());

  const roomsWithResults = ROOMS.filter(r => state[r.id].suggestions !== null);

  // When tier changes, update non-overridden categories
  useEffect(() => {
    const newDefaults = getDefaultsForTier(tier);
    setCategories(prev => {
      const updated = { ...prev };
      for (const key of Object.keys(updated) as RoomType[]) {
        if (!userOverrides.has(key)) {
          updated[key] = newDefaults[key];
        }
      }
      return updated;
    });
  }, [tier, userOverrides]);

  const handleCategoryChange = useCallback((roomId: RoomType, value: ConditionPreference) => {
    setCategories(prev => ({ ...prev, [roomId]: value }));
    setUserOverrides(prev => new Set(prev).add(roomId));
  }, []);

  const handleContinue = () => {
    onContinue({ tier, categories });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Preferences & Budget</h2>
        <p className="text-gray-500 text-sm mt-1">
          Choose your budget tier and shopping preferences for each room
        </p>
      </div>

      {/* Tier Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Budget Tier</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIERS.map((t) => {
            const isSelected = tier === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTier(t.id);
                  setUserOverrides(new Set());
                }}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100 scale-[1.02]'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <span className="text-2xl">{t.emoji}</span>
                <h4 className={`font-bold text-lg mt-2 ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                  {t.label}
                </h4>
                <p className={`text-xl font-extrabold mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                  {t.priceRange}
                </p>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{t.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Preferences */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Shopping Preferences by Room
        </h3>
        <div className="space-y-3">
          {roomsWithResults.map((room) => (
            <CategoryCard
              key={room.id}
              room={room}
              itemCount={state[room.id].suggestions?.length ?? 0}
              value={categories[room.id]}
              onChange={(v) => handleCategoryChange(room.id, v)}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Back to Results
        </button>
        <button
          onClick={handleContinue}
          className="px-8 py-3.5 bg-blue-600 text-white text-lg font-semibold rounded-2xl
                     hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
        >
          Build my shopping cart &rarr;
        </button>
      </div>
    </div>
  );
}

// --- CategoryCard sub-component ---

interface CategoryCardProps {
  room: RoomConfig;
  itemCount: number;
  value: ConditionPreference;
  onChange: (value: ConditionPreference) => void;
}

function CategoryCard({ room, itemCount, value, onChange }: CategoryCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
      {/* Room Info */}
      <div className="flex items-center gap-3 sm:w-52 flex-shrink-0">
        <span className="text-2xl">{room.emoji}</span>
        <div>
          <h4 className="font-semibold text-gray-800">{room.label}</h4>
          <p className="text-xs text-gray-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* 3-way Toggle */}
      <div className="flex-1">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {CONDITION_OPTIONS.map((opt) => {
            const isActive = value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
