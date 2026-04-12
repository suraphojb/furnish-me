'use client';

import { useState } from 'react';
import { useRoomState } from '@/hooks/useRoomState';
import { PreferencesState } from '@/lib/types';
import RoomGrid from '@/components/RoomGrid';
import ResultsView from '@/components/ResultsView';
import PreferencesView from '@/components/PreferencesView';
import ShoppingCartView from '@/components/ShoppingCartView';

type Screen = 'upload' | 'results' | 'preferences' | 'cart';

const STEPS = [
  { key: 'upload', label: 'Upload' },
  { key: 'results', label: 'Furniture List' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'cart', label: 'Shopping Cart' },
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

  const handleSubmit = async () => {
    await analyzeAllRooms();
    setScreen('results');
  };

  const handleReset = () => {
    reset();
    setPreferences(null);
    setScreen('upload');
  };

  const handleBuildCart = (prefs: PreferencesState) => {
    setPreferences(prefs);
    setScreen('cart');
  };

  const currentScreen = !hasResults ? 'upload' : screen;

  return (
    <main className="flex-1">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            FurnishMe
          </h1>
          <p className="mt-3 text-blue-100 text-lg sm:text-xl max-w-2xl">
            Just moved into an empty apartment? Upload photos of your rooms and
            we&apos;ll tell you exactly what you need to make it feel like home.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      {hasResults && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-sm">
            {STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-300">—</span>}
                <span
                  className={`px-3 py-1 rounded-full font-medium transition-colors ${
                    currentScreen === step.key
                      ? 'bg-blue-100 text-blue-700'
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
              <h2 className="text-xl font-bold text-gray-800">
                Upload photos of your rooms
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                Add a photo or video for each room to get personalized suggestions.
                Upload at least one image to get started.
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
                className="px-8 py-3.5 bg-blue-600 text-white text-lg font-semibold rounded-2xl
                           hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200
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
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-xs">
        Built for Columbia Hackathon 2026
      </footer>
    </main>
  );
}
