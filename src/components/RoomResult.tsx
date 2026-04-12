'use client';

import { useState } from 'react';
import { RoomConfig, RoomState } from '@/lib/types';
import SuggestionItem from './SuggestionItem';

interface RoomResultProps {
  room: RoomConfig;
  roomState: RoomState;
}

export function parsePriceRange(price: string): { low: number; high: number } {
  const numbers = price.match(/[\d,]+/g);
  if (!numbers || numbers.length === 0) return { low: 0, high: 0 };
  const parsed = numbers.map(n => parseInt(n.replace(/,/g, ''), 10));
  return { low: parsed[0] || 0, high: parsed[1] ?? parsed[0] ?? 0 };
}

export function getRoomTotal(roomState: RoomState): { low: number; high: number } {
  if (!roomState.suggestions) return { low: 0, high: 0 };
  return roomState.suggestions.reduce(
    (acc, s) => {
      const range = parsePriceRange(s.estimatedPrice);
      return { low: acc.low + range.low, high: acc.high + range.high };
    },
    { low: 0, high: 0 }
  );
}

export default function RoomResult({ room, roomState }: RoomResultProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!roomState.suggestions) return null;

  const isPersonalized = roomState.detectedItems && roomState.detectedItems.length > 0;
  const totalRange = getRoomTotal(roomState);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <span className="text-2xl">{room.emoji}</span>
        <h3 className="font-bold text-lg text-gray-800">{room.label}</h3>
        {isPersonalized ? (
          <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-medium">
            AI Personalized
          </span>
        ) : (
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-medium">
            Default Essentials
          </span>
        )}
        <span className="ml-auto font-bold text-gray-800 text-lg">
          ${totalRange.low.toLocaleString()}–${totalRange.high.toLocaleString()}
        </span>
        <span className="text-gray-400 text-lg transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          &#9660;
        </span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-5 pb-5">
          {/* Detected Items */}
          {isPersonalized && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100">
              <p className="text-sm font-medium text-green-800 mb-1">Already in your room:</p>
              <div className="flex flex-wrap gap-1.5">
                {roomState.detectedItems!.map((item, i) => (
                  <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions — sorted by price descending */}
          <div className="space-y-2">
            {[...roomState.suggestions]
              .sort((a, b) => {
                const priceA = parsePriceRange(a.estimatedPrice).high;
                const priceB = parsePriceRange(b.estimatedPrice).high;
                return priceB - priceA;
              })
              .map((suggestion, i) => (
              <SuggestionItem key={i} item={suggestion} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
