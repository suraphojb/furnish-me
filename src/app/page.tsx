'use client';

import { useState } from 'react';
import { useRoomState } from '@/hooks/useRoomState';
import { PreferencesState, OrderConfirmation } from '@/lib/types';
import RoomGrid from '@/components/RoomGrid';
import ResultsView from '@/components/ResultsView';
import PreferencesView from '@/components/PreferencesView';
import ShoppingCartView from '@/components/ShoppingCartView';
import OrderConfirmationView from '@/components/OrderConfirmationView';

type Screen = 'upload' | 'results' | 'preferences' | 'cart' | 'confirmation';

const STEPS = [
  { key: 'upload', label: 'Upload' },
  { key: 'results', label: 'Furniture List' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'cart', label: 'Shopping Cart' },
  { key: 'confirmation', label: 'Confirmation' },
];

export default function Home() {
  const {
    state,
    setImage,
    removeImage,
    analyzeAllRooms,
    reset,
    hasAnyContent,
    hasResults,
    isLoading,
  } = useRoomState();

  const [screen, setScreen] = useState<Screen>('upload');
  const [preferences, setPreferences] = useState<PreferencesState | null>(null);
  const [order, setOrder] = useState<OrderConfirmation | null>(null);

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

  const currentScreen = !hasResults ? 'upload' : screen;

  return (
    <main className="flex-1">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.2),transparent_40%)]" />
        <div className="relative max-w-5xl mx-auto px-4 py-10 sm:py-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-sm">
            FurnishMe
          </h1>
          <p className="mt-3 text-white/80 text-lg sm:text-xl max-w-2xl">
            Just moved into an empty apartment? Upload videos and photos of your rooms and
            we&apos;ll tell you exactly what you need to make it feel like home.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      {hasResults && (
        <div className="bg-white/60 backdrop-blur-sm border-b border-purple-100">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-sm">
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        {currentScreen === 'upload' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold gradient-text">
                Upload videos or photos of your space
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                Add a photo or video for each room to get personalized suggestions.
                Upload at least one to get started.
              </p>
            </div>

            <RoomGrid
              state={state}
              onImageSet={setImage}
              onImageRemove={removeImage}
              disabled={isLoading}
            />

            <div className="flex flex-col items-center pt-2">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !hasAnyContent}
                className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-lg font-semibold rounded-2xl
                           hover:from-violet-700 hover:to-fuchsia-600 active:scale-[0.98] transition-all shadow-lg shadow-purple-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing your rooms...
                  </span>
                ) : (
                  'Submit'
                )}
              </button>
              {!hasAnyContent && !isLoading && (
                <p className="text-sm text-gray-400 mt-2">Upload at least one room photo to continue</p>
              )}
            </div>
          </div>
        )}

        {currentScreen === 'results' && (
          <div className="animate-fade-in-up">
            <ResultsView
              state={state}
              onReset={handleReset}
              onContinue={() => setScreen('preferences')}
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
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-sm">
        <span className="gradient-text font-medium">Built for Columbia Hackathon 2026</span>
      </footer>
    </main>
  );
}
