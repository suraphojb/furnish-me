'use client';

import { OrderConfirmation } from '@/lib/types';

interface OrderConfirmationViewProps {
  order: OrderConfirmation;
  onReset: () => void;
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

const DELIVERY_STEPS = ['Ordered', 'Processing', 'Shipped', 'Delivered'];

export default function OrderConfirmationView({ order, onReset }: OrderConfirmationViewProps) {
  return (
    <div className="space-y-8 animate-fade-in-up max-w-3xl mx-auto">
      {/* Success Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Orders Placed Successfully!</h2>
          <p className="text-gray-500 text-sm mt-1">
            Your purchase agent has placed orders across {order.retailers.length} retailer{order.retailers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-2">
          <span className="text-xs text-gray-500 font-medium">Order Ref</span>
          <span className="text-sm font-bold text-gray-800 font-mono">{order.orderRef}</span>
        </div>
      </div>

      {/* Delivery Progress */}
      <div className="rounded-2xl bg-white/80 border border-purple-100 p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Delivery Progress</h3>
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200" />
          <div className="absolute left-0 top-4 h-0.5 bg-green-500" style={{ width: '33%' }} />
          {DELIVERY_STEPS.map((step, i) => (
            <div key={step} className="relative flex flex-col items-center gap-2 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${i <= 1
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-400'
                }`}
              >
                {i <= 1 ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs font-medium ${i <= 1 ? 'text-green-700' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Items Ordered */}
      <div className="rounded-2xl bg-white/80 border border-purple-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-purple-50">
          <h3 className="font-semibold text-gray-700">Items Ordered ({order.items.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              {/* Item Image */}
              <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/200x200/e2e8f0/64748b?text=${encodeURIComponent(item.emoji)}`;
                  }}
                />
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span>{item.emoji}</span>
                  <h4 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h4>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getSourceColor(item.source)}`}>
                    {item.source}
                  </span>
                  {item.condition !== 'new' && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 capitalize">
                      {item.condition}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    Est. {item.estimatedDelivery}
                  </span>
                </div>
              </div>

              {/* Price */}
              <p className="font-bold text-gray-900 text-sm flex-shrink-0">
                ${item.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="rounded-2xl bg-white/80 border border-purple-100 p-6 space-y-3">
        <h3 className="font-semibold text-gray-700 mb-4">Order Summary</h3>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tax</span>
          <span>${order.tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-bold text-gray-800">Total</span>
          <span className="font-extrabold text-lg text-gray-900">${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Retailers */}
      <div className="text-center space-y-3">
        <p className="text-xs text-gray-400">Orders placed across</p>
        <div className="flex flex-wrap justify-center gap-2">
          {order.retailers.map(r => (
            <span key={r} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getSourceColor(r)}`}>
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Start Over */}
      <div className="text-center pb-4">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-semibold rounded-2xl hover:from-violet-700 hover:to-fuchsia-600 active:scale-[0.98] transition-all shadow-lg shadow-purple-200"
        >
          Furnish Another Apartment
        </button>
      </div>
    </div>
  );
}
