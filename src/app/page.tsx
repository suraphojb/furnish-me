'use client';

import { useState } from 'react';
import { useRoomState } from '@/hooks/useRoomState';
import { PreferencesState, OrderConfirmation } from '@/lib/types';
import RoomGrid from '@/components/RoomGrid';
import ResultsView from '@/components/ResultsView';
import PreferencesView from '@/components/PreferencesView';
import ShoppingCartView from '@/components/ShoppingCartView';
import OrderConfirmationView from '@/components/OrderConfirmationView';
import ReplenishmentView from '@/components/ReplenishmentView';
import CommunityView from '@/components/CommunityView';

type Screen = 'upload' | 'results' | 'preferences' | 'cart' | 'confirmation' | 'replenishment' | 'community';

const STEPS = [
  { key: 'upload', label: 'Upload' },
  { key: 'results', label: 'Product List' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'cart', label: 'Shopping Cart' },
  { key: 'confirmation', label: 'Confirmation' },
  { key: 'replenishment', label: 'Replenishment' },
];

export default function Home() {
  const {
    state,
    setImage,
    removeImage,
    removeSuggestion,
    analyzeAllRooms,
    reset,
    hasAnyContent,
    hasResults,
    isLoading,
  } = useRoomState();

  const [screen, setScreen] = useState<Screen>('upload');
  const [preferences, setPreferences] = useState<PreferencesState | null>(null);
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [prevScreen, setPrevScreen] = useState<Screen>('upload');

  const handleSubmit = async () => {
    await analyzeAllRooms();
    setScreen('results');
  };

  const handleReset = () => {
    reset();
    setPreferences(null);
    setOrder(null);
    setScreen('upload');
  };

  const handlePlaceOrder = (o: OrderConfirmation) => {
    setOrder(o);
    setScreen('confirmation');
  };

  const handleBuildCart = (prefs: PreferencesState) => {
    setPreferences(prefs);
    setScreen('cart');
  };

  const openCommunity = () => {
    setPrevScreen(screen);
    setScreen('community');
  };

  const closeCommunity = () => {
    setScreen(prevScreen);
  };

  const currentScreen = screen === 'community' ? 'community' : (!hasResults ? 'upload' : screen);
  const showStepIndicator = hasResults && currentScreen !== 'community';

  return (
    <main className="flex-1 flex flex-col">
      {/* Compact Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.2),transparent_40%)]" />
        <div className="relative max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
            NestIn
          </h1>
          <p className="text-white/70 text-sm">
            Settle in, sorted.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      {showStepIndicator && (
        <div className="bg-white/60 backdrop-blur-sm border-b border-purple-100">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 text-sm">
            {STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center gap-2">
                {i > 0 && <span className="text-purple-200">—</span>}
                <span
                  className={`px-3 py-1 rounded-full font-medium transition-colors ${
                    currentScreen === step.key
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm'
                      : 'text-gray-400'
                  }`}
                >
                  {i + 1}. {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-4 flex-1 w-full">
        {currentScreen === 'upload' && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold gradient-text">
                Walk us through your place
              </h2>
              <p className="text-gray-500 text-xs">
                Add a photo or video for each room — we&apos;ll handle the rest.
              </p>
            </div>

            <RoomGrid
              state={state}
              onImageSet={setImage}
              onImageRemove={removeImage}
              disabled={isLoading}
            />

            <div className="flex flex-col items-center pt-1">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !hasAnyContent}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-base font-semibold rounded-2xl
                           hover:from-violet-700 hover:to-fuchsia-600 active:scale-[0.98] transition-all shadow-lg shadow-purple-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analysing your space...
                  </span>
                ) : (
                  'Analyse my space \u2192'
                )}
              </button>
              {!hasAnyContent && !isLoading && (
                <p className="text-xs text-gray-400 mt-1.5">Upload at least one room photo to continue</p>
              )}
            </div>
          </div>
        )}

        {currentScreen === 'results' && (
          <div className="animate-fade-in-up">
            <ResultsView
              state={state}
              onBack={() => setScreen('upload')}
              onReset={handleReset}
              onContinue={() => setScreen('preferences')}
              onRemoveSuggestion={removeSuggestion}
            />
          </div>
        )}

        {currentScreen === 'preferences' && (
          <div className="animate-fade-in-up">
            <PreferencesView
              state={state}
              onBack={() => setScreen('results')}
              onContinue={handleBuildCart}
            />
          </div>
        )}

        {currentScreen === 'cart' && preferences && (
          <div className="animate-fade-in-up">
            <ShoppingCartView
              state={state}
              preferences={preferences}
              onBack={() => setScreen('preferences')}
              onReset={handleReset}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        )}

        {currentScreen === 'confirmation' && order && (
          <div className="animate-fade-in-up">
            <OrderConfirmationView
              order={order}
              onReset={handleReset}
              onViewReplenishment={() => setScreen('replenishment')}
            />
          </div>
        )}

        {currentScreen === 'replenishment' && order && (
          <div className="animate-fade-in-up">
            <ReplenishmentView
              order={order}
              onBack={() => setScreen('confirmation')}
              onReset={handleReset}
              onCommunity={openCommunity}
            />
          </div>
        )}

        {currentScreen === 'community' && (
          <div className="animate-fade-in-up">
            <CommunityView onClose={closeCommunity} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-3 text-sm">
        <span className="gradient-text font-medium">Built for Columbia Hackathon 2026</span>
      </footer>

      {/* Floating Community Bubble */}
      {currentScreen !== 'community' && (
        <button
          onClick={openCommunity}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-purple-300/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          title="Community"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </button>
      )}
    </main>
  );
}
