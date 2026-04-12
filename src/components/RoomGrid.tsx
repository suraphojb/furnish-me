'use client';

import { ROOMS, RoomType, RoomState } from '@/lib/types';
import RoomCard from './RoomCard';

interface RoomGridProps {
  state: Record<RoomType, RoomState>;
  onImageSet: (roomId: RoomType, image: string, fileName: string) => void;
  onImageRemove: (roomId: RoomType) => void;
  disabled?: boolean;
}

export default function RoomGrid({ state, onImageSet, onImageRemove, disabled }: RoomGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {ROOMS.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          roomState={state[room.id]}
          onImageSet={(image, fileName) => onImageSet(room.id, image, fileName)}
          onImageRemove={() => onImageRemove(room.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
