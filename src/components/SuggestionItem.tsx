'use client';

import { Suggestion } from '@/lib/types';

interface SuggestionItemProps {
  item: Suggestion;
  index: number;
  onRemove: () => void;
}

export default function SuggestionItem({ item, index, onRemove }: SuggestionItemProps) {
  const isEssential = item.priority === 'essential';

  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
        isEssential
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white/80 border-purple-100 hover:shadow-md hover:shadow-purple-100'
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <span className="text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-gray-800">{item.name}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            isEssential
              ? 'bg-gradient-to-r from-pink-100 to-fuchsia-100 text-fuchsia-700'
              : 'bg-violet-100 text-violet-600'
          }`}>
            {isEssential ? 'Essential' : 'Nice to have'}
          </span>
          <span className="text-xs text-gray-500 font-medium ml-auto">{item.estimatedPrice}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 mt-1 w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
        title="Remove item"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
