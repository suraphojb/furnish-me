'use client';

import { Suggestion } from '@/lib/types';

interface SuggestionItemProps {
  item: Suggestion;
  index: number;
}

export default function SuggestionItem({ item, index }: SuggestionItemProps) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all duration-200"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <span className="text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-gray-800">{item.name}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            item.priority === 'essential'
              ? 'bg-orange-100 text-orange-700'
              : 'bg-blue-100 text-blue-600'
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
