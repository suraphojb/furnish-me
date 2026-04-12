'use client';

import { useReducer, useCallback } from 'react';
import { RoomType, RoomState, ROOMS } from '@/lib/types';

type AppState = Record<RoomType, RoomState>;

type Action =
  | { type: 'SET_IMAGE'; roomId: RoomType; image: string; fileName: string }
  | { type: 'REMOVE_IMAGE'; roomId: RoomType }
  | { type: 'SET_LOADING'; roomId: RoomType; loading: boolean }
  | { type: 'SET_RESULTS'; roomId: RoomType; suggestions: RoomState['suggestions']; detectedItems?: string[] }
  | { type: 'SET_ERROR'; roomId: RoomType; error: string }
  | { type: 'REMOVE_SUGGESTION'; roomId: RoomType; suggestionIndex: number }
  | { type: 'RESET' };

const initialRoomState: RoomState = {
  image: null,
  fileName: null,
  suggestions: null,
  detectedItems: null,
  loading: false,
  error: null,
};

function createInitialState(): AppState {
  const state = {} as AppState;
  for (const room of ROOMS) {
    state[room.id] = { ...initialRoomState };
  }
  return state;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_IMAGE':
      return {
        ...state,
        [action.roomId]: {
          ...state[action.roomId],
          image: action.image,
          fileName: action.fileName,
          suggestions: null,
          detectedItems: null,
          error: null,
        },
      };
    case 'REMOVE_IMAGE':
      return {
        ...state,
        [action.roomId]: { ...initialRoomState },
      };
    case 'SET_LOADING':
      return {
        ...state,
        [action.roomId]: { ...state[action.roomId], loading: action.loading },
      };
    case 'SET_RESULTS':
      return {
        ...state,
        [action.roomId]: {
          ...state[action.roomId],
          suggestions: action.suggestions,
          detectedItems: action.detectedItems || null,
          loading: false,
          error: null,
        },
      };
    case 'SET_ERROR':
      return {
        ...state,
        [action.roomId]: {
          ...state[action.roomId],
          error: action.error,
          loading: false,
        },
      };
    case 'REMOVE_SUGGESTION': {
      const room = state[action.roomId];
      if (!room.suggestions) return state;
      const updated = room.suggestions.filter((_, i) => i !== action.suggestionIndex);
      return {
        ...state,
        [action.roomId]: { ...room, suggestions: updated.length > 0 ? updated : null },
      };
    }
    case 'RESET':
      return createInitialState();
    default:
      return state;
  }
}

export function useRoomState() {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);

  const setImage = useCallback((roomId: RoomType, image: string, fileName: string) => {
    dispatch({ type: 'SET_IMAGE', roomId, image, fileName });
  }, []);

  const removeImage = useCallback((roomId: RoomType) => {
    dispatch({ type: 'REMOVE_IMAGE', roomId });
  }, []);

  const analyzeAllRooms = useCallback(async () => {
    // Only analyze rooms that have an uploaded image
    const roomsWithImages = ROOMS.filter(r => state[r.id].image !== null);

    // Set only those rooms to loading
    for (const r of roomsWithImages) {
      dispatch({ type: 'SET_LOADING', roomId: r.id, loading: true });
    }

    // Fire API calls in parallel for rooms with images only
    const results = await Promise.allSettled(
      roomsWithImages.map(async (room) => {
        const roomState = state[room.id];
        const [header, base64] = roomState.image!.split(',');
        const mediaType = header.match(/data:(.*?);/)?.[1] || 'image/jpeg';
        const body = { roomType: room.id, image: base64, mediaType };

        const res = await fetch('/api/analyze-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error('API request failed');
        return { roomId: room.id, data: await res.json() };
      })
    );

    // Process results
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { roomId, data } = result.value;
        dispatch({
          type: 'SET_RESULTS',
          roomId,
          suggestions: data.suggestions,
          detectedItems: data.detectedItems,
        });
      } else {
        console.error('Room analysis failed:', result.reason);
      }
    }
  }, [state]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const hasAnyContent = ROOMS.some(r => state[r.id].image !== null);
  const hasResults = ROOMS.some(r => state[r.id].suggestions !== null);
  const isLoading = ROOMS.some(r => state[r.id].loading);

  const removeSuggestion = useCallback((roomId: RoomType, suggestionIndex: number) => {
    dispatch({ type: 'REMOVE_SUGGESTION', roomId, suggestionIndex });
  }, []);

  return {
    state,
    setImage,
    removeImage,
    removeSuggestion,
    analyzeAllRooms,
    reset,
    hasAnyContent,
    hasResults,
    isLoading,
  };
}
