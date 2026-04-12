'use client';

import { Suggestion } from '@/lib/types';

interface SuggestionItemProps {
  item: Suggestion;
  index: number;
}

export default function SuggestionItem({ item, index }: SuggestionItemProps) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-purple-100 hover:shadow-md hover:shadow-purple-100 transition-all duration-200"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <span className="text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-gray-800">{item.name}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            item.priority === 'essential'
              ? 'bg-gradient-to-r from-pink-100 to-fuchsia-100 text-fuchsia-700'
              : 'bg-violet-100 text-violet-600'
          }`}>
            {item.priority === 'essential' ? 'Essential' : 'Nice to have'}
          </span>
          <span className="text-xs text-gray-500 font-medium ml-auto">{item.estimatedPrice}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
      </div>
    </div>
  );
}
