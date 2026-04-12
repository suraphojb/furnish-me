'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  RoomType,
  RoomState,
  RoomConfig,
  ROOMS,
  PreferencesState,
  ItemWithProducts,
  Suggestion,
} from '@/lib/types';
import ProductCard from './ProductCard';

interface ShoppingCartViewProps {
  state: Record<RoomType, RoomState>;
  preferences: PreferencesState;
  onBack: () => void;
  onReset: () => void;
}

export default function ShoppingCartView({ state, preferences, onBack, onReset }: ShoppingCartViewProps) {
  const [items, setItems] = useState<ItemWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({ done: 0, total: 0 });

  const roomsWithResults = ROOMS.filter(r => state[r.id].suggestions !== null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    // Build list of all items across all rooms
    const allItems: { suggestion: Suggestion; room: RoomConfig }[] = [];
    for (const room of roomsWithResults) {
      const suggestions = state[room.id].suggestions;
      if (!suggestions) continue;
      for (const s of suggestions) {
        allItems.push({ suggestion: s, room });
      }
    }

    setLoadingProgress({ done: 0, total: allItems.length });
    const results: ItemWithProducts[] = [];

    // Fetch products in batches of 3 to avoid overwhelming the API
    for (let i = 0; i < allItems.length; i += 3) {
      const batch = allItems.slice(i, i + 3);
      const batchResults = await Promise.allSettled(
        batch.map(async ({ suggestion, room }) => {
          const res = await fetch('/api/find-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              itemName: suggestion.name,
              tier: preferences.tier,
              condition: preferences.categories[room.id],
              estimatedPrice: suggestion.estimatedPrice,
            }),
          });
          const data = await res.json();
          return {
            itemName: suggestion.name,
            itemEmoji: suggestion.emoji,
            roomId: room.id,
            roomLabel: room.label,
            products: data.products || [],
            selectedIndex: 0, // top pick is pre-selected
          } as ItemWithProducts;
        })
      );

      for (const r of batchResults) {
        if (r.status === 'fulfilled') {
          results.push(r.value);
        }
      }

      setLoadingProgress({ done: Math.min(i + 3, allItems.length), total: allItems.length });
      setItems([...results]);
    }

    setLoading(false);
  }, [state, preferences, roomsWithResults]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectProduct = (itemIndex: number, productIndex: number) => {
    setItems(prev => {
      const updated = [...prev];
      updated[itemIndex] = { ...updated[itemIndex], selectedIndex: productIndex };
      return updated;
    });
  };

  // Calculate total cost from selected products
  const totalCost = items.reduce((sum, item) => {
    if (item.products.length === 0) return sum;
    return sum + (item.products[item.selectedIndex]?.price || 0);
  }, 0);

  const selectedCount = items.filter(i => i.products.length > 0).length;

  // Group items by room for display
  const itemsByRoom = roomsWithResults.map(room => ({
    room,
    items: items
      .map((item, idx) => ({ ...item, globalIndex: idx }))
      .filter(item => item.roomId === room.id),
  })).filter(group => group.items.length > 0);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Your Shopping Cart</h2>
          <p className="text-gray-500 text-sm mt-1">
            AI-curated product options from top retailers. Click to choose your preferred option.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-blue-800 font-medium">
              Finding the best deals for you...
            </p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${loadingProgress.total > 0 ? (loadingProgress.done / loadingProgress.total) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-blue-600 mt-2">
            {loadingProgress.done} of {loadingProgress.total} items found
          </p>
        </div>
      )}

      {/* Product Listings by Room */}
      {itemsByRoom.map(({ room, items: roomItems }) => (
        <div key={room.id} className="space-y-6">
          {/* Room Divider */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-2xl">{room.emoji}</span>
            <h3 className="font-bold text-lg text-gray-800">{room.label}</h3>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Items in this room */}
          {roomItems.map((item) => (
            <div key={`${item.roomId}-${item.itemName}`} className="space-y-3">
              {/* Item Header */}
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.itemEmoji}</span>
                <h4 className="font-semibold text-gray-700">{item.itemName}</h4>
                {item.products.length > 0 && (
                  <span className="text-xs text-gray-400">
                    {item.products.length} options
                  </span>
                )}
              </div>

              {/* Product Cards Carousel */}
              {item.products.length > 0 ? (
                <div className="relative group">
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
                    {item.products.map((product, pIdx) => (
                      <ProductCard
                        key={pIdx}
                        product={product}
                        isSelected={item.selectedIndex === pIdx}
                        onSelect={() => handleSelectProduct(item.globalIndex, pIdx)}
                      />
                    ))}
                  </div>
                  {/* Scroll hint gradient */}
                  <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-gray-50/90 to-transparent pointer-events-none" />
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center text-sm text-gray-400">
                  {loading ? 'Searching...' : 'No products found'}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Cart Summary */}
      {!loading && items.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-blue-100">Cart Total</p>
              <p className="text-xs text-blue-200 mt-0.5">
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected across {itemsByRoom.length} room{itemsByRoom.length !== 1 ? 's' : ''}
              </p>
            </div>
            <p className="text-3xl font-extrabold">
              ${totalCost.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
