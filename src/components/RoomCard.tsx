'use client';

import { useCallback, useRef, useState } from 'react';
import { RoomConfig, RoomState } from '@/lib/types';

interface RoomCardProps {
  room: RoomConfig;
  roomState: RoomState;
  onImageSet: (image: string, fileName: string) => void;
  onImageRemove: () => void;
  disabled?: boolean;
}

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(file.type || 'image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function RoomCard({ room, roomState, onImageSet, onImageRemove, disabled }: RoomCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const dataUrl = await resizeImage(file, 1024);
    onImageSet(dataUrl, file.name);
  }, [onImageSet]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const hasImage = roomState.image !== null;

  return (
    <div className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden
      ${isDragging ? 'border-violet-400 bg-violet-50 scale-[1.02]' : ''}
      ${hasImage ? 'border-fuchsia-300 bg-fuchsia-50/30' : 'border-dashed border-purple-200 bg-white/70 hover:border-purple-400'}
      ${roomState.loading ? 'animate-pulse' : ''}
      ${disabled ? 'opacity-60 pointer-events-none' : ''}
    `}>
      {/* Room Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <span className="text-2xl">{room.emoji}</span>
        <h3 className="font-semibold text-gray-800">{room.label}</h3>
        {hasImage && (
          <span className="ml-auto text-xs bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-2 py-0.5 rounded-full font-medium">
            Photo added
          </span>
        )}
      </div>

      {/* Upload Area / Preview */}
      <div
        className="px-4 pb-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {hasImage ? (
          <div className="relative group">
            <img
              src={roomState.image!}
              alt={`${room.label} preview`}
              className="w-full h-40 object-cover rounded-lg"
            />
            <button
              onClick={() => onImageRemove()}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center
                         opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold hover:bg-red-600"
            >
              x
            </button>
            <p className="text-xs text-gray-500 mt-2 truncate">{roomState.fileName}</p>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-40 rounded-lg border-2 border-dashed border-purple-200 hover:border-fuchsia-400
                       flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer
                       hover:bg-fuchsia-50/50"
          >
            <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            <span className="text-sm text-gray-500 text-center px-2">
              Take a video/photo or drop a video/photo
            </span>
            <span className="text-xs text-gray-400">JPG, PNG, WebP, MP4</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {/* Loading overlay */}
      {roomState.loading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600 font-medium">Analyzing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
