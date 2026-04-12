'use client';

import { useState, useMemo } from 'react';
import { ReplenishmentItem, OrderConfirmation } from '@/lib/types';

interface ReplenishmentViewProps {
  order: OrderConfirmation;
  onBack: () => void;
  onReset: () => void;
  onCommunity: () => void;
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
  'Costco': 'bg-red-100 text-red-700',
  'Goodwill': 'bg-sky-100 text-sky-700',
};

function getSourceColor(source: string): string {
  return SOURCE_COLORS[source] || 'bg-gray-100 text-gray-600';
}

function generateMockReplenishments(order: OrderConfirmation): ReplenishmentItem[] {
  const consumables: { name: string; emoji: string; category: ReplenishmentItem['category']; shelfLife: ReplenishmentItem['shelfLife']; cycleDays: number }[] = [
    { name: 'Toilet Paper (12-pack)', emoji: '🧻', category: 'consumable', shelfLife: 'long', cycleDays: 30 },
    { name: 'Dish Soap', emoji: '🧴', category: 'consumable', shelfLife: 'long', cycleDays: 45 },
    { name: 'Paper Towels (6-pack)', emoji: '🧾', category: 'consumable', shelfLife: 'long', cycleDays: 28 },
    { name: 'Laundry Detergent', emoji: '🫧', category: 'consumable', shelfLife: 'long', cycleDays: 60 },
    { name: 'Sponges (3-pack)', emoji: '🧽', category: 'consumable', shelfLife: 'medium', cycleDays: 21 },
    { name: 'Trash Bags (50ct)', emoji: '🗑️', category: 'consumable', shelfLife: 'long', cycleDays: 40 },
    { name: 'All-Purpose Cleaner', emoji: '🧹', category: 'consumable', shelfLife: 'long', cycleDays: 50 },
    { name: 'Hand Soap Refill', emoji: '🧼', category: 'consumable', shelfLife: 'long', cycleDays: 35 },
    { name: 'Air Freshener', emoji: '🌸', category: 'consumable', shelfLife: 'medium', cycleDays: 30 },
    { name: 'Dryer Sheets (80ct)', emoji: '🌀', category: 'consumable', shelfLife: 'long', cycleDays: 55 },
  ];

  const retailers = ['Amazon', 'Target', 'Walmart', 'Costco'];
  const promoRetailers = ['Costco', 'Walmart', 'Target', 'Amazon'];

  const today = new Date();

  return consumables.map((item, i) => {
    const purchased = new Date(today);
    purchased.setDate(purchased.getDate() - Math.floor(Math.random() * 15 + 5));

    const nextDate = new Date(purchased);
    nextDate.setDate(nextDate.getDate() + item.cycleDays);

    const daysUntil = Math.max(0, Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    const currentRetailer = retailers[i % retailers.length];
    const basePrice = parseFloat((Math.random() * 12 + 4).toFixed(2));

    const hasPromo = i < 4 || Math.random() > 0.5;
    const promoRetailer = promoRetailers[(i + 1) % promoRetailers.length];
    const discountPct = [20, 25, 30, 35, 40][Math.floor(Math.random() * 5)];

    return {
      id: `repl-${i}`,
      name: item.name,
      emoji: item.emoji,
      category: item.category,
      currentSource: currentRetailer,
      currentPrice: basePrice,
      quantity: 1,
      lastPurchased: purchased.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      nextReplenishment: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      daysUntilNeeded: daysUntil,
      shelfLife: item.shelfLife,
      promo: hasPromo && promoRetailer !== currentRetailer ? {
        retailer: promoRetailer,
        discount: `-${discountPct}%`,
        newPrice: parseFloat((basePrice * (1 - discountPct / 100)).toFixed(2)),
      } : null,
      aiNote: item.shelfLife === 'long' && daysUntil < 20
        ? 'Long shelf life — consider stocking up 2-3x'
        : null,
    };
  });
}

export default function ReplenishmentView({ order, onBack, onReset, onCommunity }: ReplenishmentViewProps) {
  const [items, setItems] = useState<ReplenishmentItem[]>(() => generateMockReplenishments(order));

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const handleSwitchRetailer = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id || !item.promo) return item;
      return {
        ...item,
        currentSource: item.promo.retailer,
        currentPrice: item.promo.newPrice,
        promo: null,
      };
    }));
  };

  // Sort by days until needed (soonest first)
  const sortedItems = useMemo(() =>
    [...items].sort((a, b) => a.daysUntilNeeded - b.daysUntilNeeded),
    [items]
  );

  // Items due soonest for agent speech bubble
  const upcomingItems = sortedItems.filter(i => i.daysUntilNeeded <= 14).slice(0, 3);
  const nextPurchaseDate = upcomingItems.length > 0 ? upcomingItems[0].nextReplenishment : 'N/A';
  const promoItem = sortedItems.find(i => i.promo !== null);

  const totalCost = items.reduce((sum, item) => sum + item.currentPrice * item.quantity, 0);

  return (
    <div className="space-y-6 animate-fade-in-up pb-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium"
      >
        &larr; Back to order
      </button>

      {/* AI Agent Banner */}
      <div className="flex gap-4 items-start">
        {/* Agent Avatar */}
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-200">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>

        {/* Speech Bubble */}
        <div className="flex-1 relative bg-white/80 border border-purple-100 rounded-2xl rounded-tl-sm p-4 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed">
            {promoItem ? (
              <>
                Restocking{' '}
                <strong className="text-fuchsia-600">{upcomingItems.map(i => i.name.split(' (')[0]).join(', ')}</strong>
                {promoItem.promo && (
                  <> — <span className="text-emerald-600 font-semibold">{promoItem.name.split(' (')[0]} has a {promoItem.promo.discount} promo at {promoItem.promo.retailer}</span></>
                )}
                {' '}in the next purchase on <strong>{nextPurchaseDate}</strong>.
                {' '}Total: <strong className="text-fuchsia-600">${totalCost.toFixed(2)}</strong>.
              </>
            ) : (
              <>
                Your next replenishment is on <strong>{nextPurchaseDate}</strong> for{' '}
                <strong className="text-fuchsia-600">{upcomingItems.length} items</strong>.
                {' '}Estimated total: <strong>${totalCost.toFixed(2)}</strong>.
              </>
            )}
          </p>
          <p className="text-xs text-gray-400 mt-1">NestIn AI Agent</p>
        </div>
      </div>

      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Replenishment schedule</h2>
        <p className="text-gray-500 text-xs mt-1">Items you&apos;ll need to restock. Adjust quantities or remove what you don&apos;t need.</p>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {sortedItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-white/80 border border-purple-100 p-4 space-y-3 transition-all duration-200"
          >
            {/* Top Row */}
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getSourceColor(item.currentSource)}`}>
                    {item.currentSource}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>Bought {item.lastPurchased}</span>
                  <span>
                    Next:{' '}
                    <span className={item.daysUntilNeeded <= 7 ? 'text-red-500 font-semibold' : item.daysUntilNeeded <= 14 ? 'text-amber-500 font-semibold' : 'text-gray-600'}>
                      {item.nextReplenishment} ({item.daysUntilNeeded}d)
                    </span>
                  </span>
                </div>
              </div>

              {/* Price & Remove */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm">${(item.currentPrice * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors text-xs font-bold"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Qty:</span>
                <div className="flex items-center bg-purple-50 rounded-lg">
                  <button
                    onClick={() => handleQuantity(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center text-fuchsia-600 font-bold hover:bg-purple-100 rounded-l-lg transition-colors"
                  >
                    &minus;
                  </button>
                  <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantity(item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center text-fuchsia-600 font-bold hover:bg-purple-100 rounded-r-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* AI Notes / Promo */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {item.aiNote && (
                  <span className="text-xs bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full font-medium">
                    {item.aiNote}
                  </span>
                )}
              </div>
            </div>

            {/* Promo Banner */}
            {item.promo && (
              <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    {item.promo.discount}
                  </span>
                  <span className="text-xs text-emerald-800">
                    <strong>${item.promo.newPrice.toFixed(2)}</strong> at{' '}
                    <span className={`font-semibold px-1.5 py-0.5 rounded-full ${getSourceColor(item.promo.retailer)}`}>
                      {item.promo.retailer}
                    </span>
                    {' '}(save ${(item.currentPrice - item.promo.newPrice).toFixed(2)})
                  </span>
                </div>
                <button
                  onClick={() => handleSwitchRetailer(item.id)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                >
                  Switch
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No items to replenish</p>
          <p className="text-sm mt-1">You&apos;ve removed all items from the schedule.</p>
        </div>
      )}

      {/* Summary Footer */}
      {items.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white p-5 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-white/80">Next replenishment total</p>
              <p className="text-xs text-white/60">{items.length} item{items.length !== 1 ? 's' : ''} scheduled</p>
            </div>
            <p className="text-2xl font-extrabold">${totalCost.toFixed(2)}</p>
          </div>
          <button
            onClick={onReset}
            className="mt-3 w-full py-3 bg-white text-fuchsia-700 font-bold rounded-xl hover:bg-fuchsia-50 active:scale-[0.98] transition-all text-base"
          >
            Done — start fresh
          </button>
        </div>
      )}

      {/* Community CTA */}
      <div className="rounded-2xl bg-white/80 border border-purple-100 p-5 text-center space-y-3">
        <p className="text-2xl">🏘️</p>
        <h3 className="font-bold text-gray-800">You&apos;re all set up!</h3>
        <p className="text-sm text-gray-500">Now connect with your neighbours — find deals, sublets, and local favourites.</p>
        <button
          onClick={onCommunity}
          className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-fuchsia-600 active:scale-[0.98] transition-all shadow-md shadow-purple-200 text-sm"
        >
          Explore your community &rarr;
        </button>
      </div>
    </div>
  );
}
