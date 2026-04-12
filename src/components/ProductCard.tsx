'use client';

import { ProductListing } from '@/lib/types';

interface ProductCardProps {
  product: ProductListing;
  isSelected: boolean;
  onSelect: () => void;
}

const SOURCE_COLORS: Record<string, string> = {
  'Amazon': 'bg-orange-100 text-orange-700',
  'Target': 'bg-red-100 text-red-700',
  'Walmart': 'bg-blue-100 text-blue-700',
  'IKEA': 'bg-yellow-100 text-yellow-700',
  'Wayfair': 'bg-purple-100 text-purple-700',
  'CB2': 'bg-gray-100 text-gray-700',
  'West Elm': 'bg-green-100 text-green-700',
  'FB Market': 'bg-blue-100 text-blue-600',
  'OfferUp': 'bg-teal-100 text-teal-700',
  'Craigslist': 'bg-violet-100 text-violet-700',
  'Goodwill': 'bg-sky-100 text-sky-700',
  'Habitat ReStore': 'bg-emerald-100 text-emerald-700',
};

function getSourceColor(source: string): string {
  return SOURCE_COLORS[source] || 'bg-gray-100 text-gray-600';
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.25;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<span key={i} className="text-yellow-400">&#9733;</span>);
    } else if (i === full && hasHalf) {
      stars.push(<span key={i} className="text-yellow-400">&#9733;</span>);
    } else {
      stars.push(<span key={i} className="text-gray-300">&#9733;</span>);
    }
  }
  return stars;
}

export default function ProductCard({ product, isSelected, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`text-left rounded-2xl border-2 bg-white/80 overflow-hidden transition-all duration-200 hover:shadow-md
        w-48 sm:w-52 flex-shrink-0 snap-start
        ${isSelected
          ? 'border-fuchsia-400 shadow-md shadow-fuchsia-100 ring-1 ring-fuchsia-200'
          : 'border-purple-100 hover:border-purple-300'
        }`}
    >
      {/* Placeholder Image */}
      <div className="relative w-full h-32 bg-gradient-to-br from-violet-50 to-fuchsia-50 flex items-center justify-center">
        <span className="text-4xl opacity-60">
          {product.condition === 'used' ? '♻️' : product.condition === 'refurbished' ? '🔧' : '📦'}
        </span>
        {isSelected && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Selected
          </div>
        )}
        {product.isTopPick && !isSelected && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Top Pick
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        {/* Source & Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getSourceColor(product.source)}`}>
            {product.source}
          </span>
          {product.condition !== 'new' && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 capitalize">
              {product.condition}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h4 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
          {product.name}
        </h4>

        {/* Price */}
        <p className="text-xl font-extrabold text-gray-900">
          ${product.price.toFixed(2)}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex text-sm">{renderStars(product.rating)}</div>
          <span className="text-xs text-gray-500 font-medium">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">
            ({product.reviewCount.toLocaleString()} reviews)
          </span>
        </div>
      </div>
    </button>
  );
}
