'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  RoomType,
  RoomState,
  ROOMS,
  TIERS,
  BudgetTier,
  ConditionPreference,
  PreferencesState,
  ProductCategory,
  PRODUCT_CATEGORIES,
  ProductCategoryConfig,
  getCategoryDefaultsForTier,
} from '@/lib/types';

interface PreferencesViewProps {
  state: Record<RoomType, RoomState>;
  tier: BudgetTier;
  catPrefs: Record<ProductCategory, ConditionPreference>;
  onTierChange: (tier: BudgetTier) => void;
  onCatPrefsChange: (prefs: Record<ProductCategory, ConditionPreference>) => void;
  onBack: () => void;
  onContinue: (preferences: PreferencesState) => void;
}

const CONDITION_OPTIONS: { value: ConditionPreference; label: string }[] = [
  { value: 'new-only', label: 'New only' },
  { value: 'open-to-2nd-hand', label: 'Open to 2nd hand' },
  { value: 'prefer-2nd-hand', label: 'Prefer 2nd hand' },
];

// Map suggestion names to product categories
function classifySuggestion(name: string): ProductCategory {
  const lower = name.toLowerCase();
  if (/bed|sofa|couch|frame|desk|chair|table|shelf|bookshelf|futon|nightstand|stand/.test(lower)) return 'furniture';
  if (/pot|pan|dish|utensil|cutting|knife|rack|cook|kitchen|plate|bowl|cup|mug/.test(lower)) return 'kitchen-supplies';
  if (/towel|bath|shower|toilet|mirror|mat|caddy|bathroom/.test(lower)) return 'bathroom-essentials';
  if (/lamp|light|rug|curtain|pillow|throw|decor|candle|art|plant/.test(lower)) return 'lighting-decor';
  if (/bin|hanger|organiz|storage|basket|hook|closet|container|box/.test(lower)) return 'storage-organisation';
  if (/power|strip|monitor|electronics|cable|charger|extension|adapter|usb/.test(lower)) return 'study-electronics';
  return 'furniture'; // default
}

// Derive room-level condition from the dominant category in that room's suggestions
function deriveRoomCategories(
  state: Record<RoomType, RoomState>,
  catPrefs: Record<ProductCategory, ConditionPreference>
): Record<RoomType, ConditionPreference> {
  const result: Record<string, ConditionPreference> = {};
  for (const room of ROOMS) {
    const suggestions = state[room.id].suggestions;
    if (!suggestions || suggestions.length === 0) {
      result[room.id] = 'open-to-2nd-hand';
      continue;
    }
    const catCounts: Record<string, number> = {};
    for (const s of suggestions) {
      const cat = classifySuggestion(s.name);
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }
    const dominantCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0] as ProductCategory;
    result[room.id] = catPrefs[dominantCat];
  }
  return result as Record<RoomType, ConditionPreference>;
}

export default function PreferencesView({ state, tier, catPrefs, onTierChange, onCatPrefsChange, onBack, onContinue }: PreferencesViewProps) {
  const [userOverrides, setUserOverrides] = useState<Set<ProductCategory>>(new Set());

  // Count items per product category across all rooms
  const categoryCounts = useMemo(() => {
    const counts: Record<ProductCategory, number> = {
      'furniture': 0, 'kitchen-supplies': 0, 'bathroom-essentials': 0,
      'lighting-decor': 0, 'storage-organisation': 0, 'study-electronics': 0,
    };
    for (const room of ROOMS) {
      const suggestions = state[room.id].suggestions;
      if (!suggestions) continue;
      for (const s of suggestions) {
        const cat = classifySuggestion(s.name);
        counts[cat]++;
      }
    }
    return counts;
  }, [state]);

  // Only show categories that have items
  const activeCategories = PRODUCT_CATEGORIES.filter(c => categoryCounts[c.id] > 0);

  const handleTierChange = useCallback((newTier: BudgetTier) => {
    onTierChange(newTier);
    setUserOverrides(new Set());
    onCatPrefsChange(getCategoryDefaultsForTier(newTier));
  }, [onTierChange, onCatPrefsChange]);

  const handleCatChange = useCallback((catId: ProductCategory, value: ConditionPreference) => {
    onCatPrefsChange({ ...catPrefs, [catId]: value });
    setUserOverrides(prev => new Set(prev).add(catId));
  }, [catPrefs, onCatPrefsChange]);

  const handleContinue = () => {
    const roomCategories = deriveRoomCategories(state, catPrefs);
    onContinue({ tier, categories: roomCategories, categoryPreferences: catPrefs });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Preferences & Budget</h2>
        <p className="text-gray-500 text-sm mt-1">
          Choose your budget tier and shopping preferences by category
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
                onClick={() => handleTierChange(t.id)}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200
                  ${isSelected
                    ? 'border-fuchsia-400 bg-fuchsia-50/50 shadow-md shadow-fuchsia-100 scale-[1.02]'
                    : 'border-purple-100 bg-white/80 hover:border-purple-300 hover:shadow-sm'
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <span className="text-2xl">{t.emoji}</span>
                <h4 className={`font-bold text-lg mt-2 ${isSelected ? 'text-fuchsia-800' : 'text-gray-800'}`}>
                  {t.label}
                </h4>
                <p className={`text-xl font-extrabold mt-1 ${isSelected ? 'text-fuchsia-600' : 'text-gray-900'}`}>
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
          Shopping Preferences by Category
        </h3>
        <div className="space-y-3">
          {activeCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              itemCount={categoryCounts[cat.id]}
              value={catPrefs[cat.id]}
              onChange={(v) => handleCatChange(cat.id, v)}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium"
        >
          &larr; Back
        </button>
        <button
          onClick={handleContinue}
          className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-lg font-semibold rounded-2xl
                     hover:from-violet-700 hover:to-fuchsia-600 active:scale-[0.98] transition-all shadow-lg shadow-purple-200"
        >
          Build my shopping cart &rarr;
        </button>
      </div>
    </div>
  );
}

// --- CategoryCard sub-component ---

interface CategoryCardProps {
  category: ProductCategoryConfig;
  itemCount: number;
  value: ConditionPreference;
  onChange: (value: ConditionPreference) => void;
}

function CategoryCard({ category, itemCount, value, onChange }: CategoryCardProps) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-white/80 p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
      {/* Category Info */}
      <div className="flex items-center gap-3 sm:w-56 flex-shrink-0">
        <span className="text-2xl">{category.emoji}</span>
        <div>
          <h4 className="font-semibold text-gray-800">{category.label}</h4>
          <p className="text-xs text-gray-400">{category.description}</p>
          <p className="text-xs text-fuchsia-500 font-medium mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* 3-way Toggle */}
      <div className="flex-1">
        <div className="flex bg-purple-50 rounded-xl p-1 gap-1">
          {CONDITION_OPTIONS.map((opt) => {
            const isActive = value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-white text-fuchsia-700 shadow-sm'
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
