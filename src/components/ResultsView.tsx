'use client';

import { ROOMS, RoomType, RoomState } from '@/lib/types';
import RoomResult, { getRoomTotal } from './RoomResult';

interface ResultsViewProps {
  state: Record<RoomType, RoomState>;
  onReset: () => void;
  onContinue: () => void;
}

export default function ResultsView({ state, onReset, onContinue }: ResultsViewProps) {
  const roomsWithResults = ROOMS.filter(r => state[r.id].suggestions !== null);

  const grandTotal = roomsWithResults.reduce(
    (acc, room) => {
      const t = getRoomTotal(state[room.id]);
      return { low: acc.low + t.low, high: acc.high + t.high };
    },
    { low: 0, high: 0 }
  );

  const handleCopyList = () => {
    const lines: string[] = ['My Apartment Furniture List', '========================', ''];
    for (const room of roomsWithResults) {
      const rs = state[room.id];
      if (!rs.suggestions) continue;
      lines.push(`${room.emoji} ${room.label}`);
      lines.push('-'.repeat(30));
      for (const s of rs.suggestions) {
        const tag = s.priority === 'essential' ? '[Essential]' : '[Nice to have]';
        lines.push(`  ${s.emoji} ${s.name} — ${s.estimatedPrice} ${tag}`);
      }
      lines.push('');
    }
    lines.push(`Total: $${grandTotal.low.toLocaleString()} – $${grandTotal.high.toLocaleString()}`);
    navigator.clipboard.writeText(lines.join('\n'));
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Your Furniture List</h2>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s what we recommend for each room</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyList}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Copy as Shopping List
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>

      {/* Room Results — only rooms with uploads */}
      <div className="space-y-4">
        {roomsWithResults.map((room) => (
          <RoomResult key={room.id} room={room} roomState={state[room.id]} />
        ))}
      </div>

      {/* Grand Total */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white p-5 shadow-lg flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">Estimated Total Cost</p>
          <p className="text-xs text-white/60 mt-0.5">{roomsWithResults.length} room{roomsWithResults.length !== 1 ? 's' : ''} analyzed</p>
        </div>
        <p className="text-2xl font-extrabold">
          ${grandTotal.low.toLocaleString()} – ${grandTotal.high.toLocaleString()}
        </p>
      </div>

      {/* Continue to Preferences */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onContinue}
          className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-lg font-semibold rounded-2xl
                     hover:from-violet-700 hover:to-fuchsia-600 active:scale-[0.98] transition-all shadow-lg shadow-purple-200"
        >
          Set Preferences & Budget &rarr;
        </button>
      </div>
    </div>
  );
}
