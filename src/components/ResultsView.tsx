'use client';

import { ROOMS, RoomType, RoomState } from '@/lib/types';
import RoomResult, { getRoomTotal } from './RoomResult';

interface ResultsViewProps {
  state: Record<RoomType, RoomState>;
  onBack: () => void;
  onReset: () => void;
  onContinue: () => void;
  onRemoveSuggestion: (roomId: RoomType, index: number) => void;
}

export default function ResultsView({ state, onBack, onContinue, onRemoveSuggestion }: ResultsViewProps) {
  const roomsWithResults = ROOMS.filter(r => state[r.id].suggestions !== null);

  const grandTotal = roomsWithResults.reduce(
    (acc, room) => {
      const t = getRoomTotal(state[room.id]);
      return { low: acc.low + t.low, high: acc.high + t.high };
    },
    { low: 0, high: 0 }
  );

  return (
    <div className="space-y-5 pb-28">
      {/* Back link */}
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium"
      >
        &larr; Back
      </button>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">What you need</h2>
        <p className="text-gray-500 text-sm mt-1">AI-picked for your space. Remove anything you already have.</p>
      </div>

      {/* Room Results — only rooms with uploads */}
      <div className="space-y-4">
        {roomsWithResults.map((room) => (
          <RoomResult key={room.id} room={room} roomState={state[room.id]} onRemoveSuggestion={(index) => onRemoveSuggestion(room.id, index)} />
        ))}
      </div>

      {/* Floating bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white px-4 py-4 shadow-2xl shadow-purple-500/30">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/80">Estimated Total Cost</p>
              <p className="text-xs text-white/60">{roomsWithResults.length} room{roomsWithResults.length !== 1 ? 's' : ''} analysed</p>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold">
              ${grandTotal.low.toLocaleString()} – ${grandTotal.high.toLocaleString()}
            </p>
            <button
              onClick={onContinue}
              className="px-5 py-2.5 bg-white text-fuchsia-700 font-bold rounded-xl hover:bg-fuchsia-50 active:scale-[0.98] transition-all text-sm sm:text-base whitespace-nowrap"
            >
              Set my preferences &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
