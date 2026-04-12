'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { RoomType, RoomState, ROOMS, BudgetTier, ProductCategory, ConditionPreference, getCategoryDefaultsForTier } from '@/lib/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatAction {
  type: string;
  [key: string]: unknown;
}

const SCREEN_LABELS: Record<string, string> = {
  upload: 'Upload Photos',
  results: 'Product List',
  preferences: 'Preferences & Budget',
  cart: 'Shopping Cart',
  confirmation: 'Order Confirmation',
  replenishment: 'Replenishment',
  community: 'Community',
};

interface AIChatBubbleProps {
  currentScreen: string;
  state: Record<RoomType, RoomState>;
  tier: BudgetTier;
  catPrefs: Record<ProductCategory, ConditionPreference>;
  onRemoveByPriority: (priority: 'essential' | 'nice-to-have') => void;
  onRemoveByName: (name: string) => void;
  onSetTier: (tier: BudgetTier) => void;
  onSetCatPrefs: (prefs: Record<ProductCategory, ConditionPreference>) => void;
  onNavigate: (screen: string) => void;
}

export default function AIChatBubble({
  currentScreen,
  state,
  tier,
  catPrefs,
  onRemoveByPriority,
  onRemoveByName,
  onSetTier,
  onSetCatPrefs,
  onNavigate,
}: AIChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getContextSummary = useCallback(() => {
    const lines: string[] = [];
    const roomsWithResults = ROOMS.filter(r => state[r.id].suggestions);
    if (roomsWithResults.length > 0) {
      lines.push(`Product list (${roomsWithResults.length} rooms):`);
      for (const room of roomsWithResults) {
        const suggestions = state[room.id].suggestions!;
        const essential = suggestions.filter(s => s.priority === 'essential');
        const niceToHave = suggestions.filter(s => s.priority === 'nice-to-have');
        lines.push(`  ${room.label}: ${essential.length} essential, ${niceToHave.length} nice-to-have`);
        for (const s of suggestions) {
          lines.push(`    - ${s.name} (${s.priority}, ${s.estimatedPrice})`);
        }
      }
    }
    lines.push(`Budget tier: ${tier}`);
    lines.push('Category preferences:');
    for (const [cat, pref] of Object.entries(catPrefs)) {
      lines.push(`  ${cat}: ${pref}`);
    }
    return lines.join('\n');
  }, [state, tier, catPrefs]);

  const executeActions = useCallback((actions: ChatAction[]) => {
    if (actions.length === 0) return;
    setIsUpdating(true);

    for (const action of actions) {
      switch (action.type) {
        case 'remove_items':
          if (action.filter === 'by-name' && typeof action.name === 'string') {
            onRemoveByName(action.name);
          } else if (action.filter === 'nice-to-have' || action.filter === 'essential') {
            onRemoveByPriority(action.filter);
          }
          break;
        case 'change_budget_tier':
          if (typeof action.tier === 'string') {
            const newTier = action.tier as BudgetTier;
            onSetTier(newTier);
            onSetCatPrefs(getCategoryDefaultsForTier(newTier));
          }
          break;
        case 'update_category_preference':
          if (typeof action.preference === 'string') {
            const pref = action.preference as ConditionPreference;
            if (action.category === 'all') {
              const updated = { ...catPrefs };
              for (const key of Object.keys(updated) as ProductCategory[]) {
                updated[key] = pref;
              }
              onSetCatPrefs(updated);
            } else if (typeof action.category === 'string') {
              onSetCatPrefs({ ...catPrefs, [action.category]: pref });
            }
          }
          break;
        case 'navigate':
          if (typeof action.screen === 'string') {
            onNavigate(action.screen);
          }
          break;
      }
    }

    setTimeout(() => setIsUpdating(false), 1500);
  }, [onRemoveByPriority, onRemoveByName, onSetTier, onSetCatPrefs, onNavigate, catPrefs]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          context: {
            screenLabel: SCREEN_LABELS[currentScreen] || currentScreen,
            summary: getContextSummary(),
          },
        }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      if (data.actions?.length > 0) {
        executeActions(data.actions);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Try again!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed z-[60] flex flex-col bg-white rounded-2xl shadow-2xl shadow-purple-300/30 border border-purple-100 overflow-hidden"
          style={{
            width: 360,
            height: 480,
            right: 24 - position.x,
            bottom: 88 - position.y,
          }}
        >
          {/* Header — draggable */}
          <div
            className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white px-4 py-3 flex items-center gap-3 cursor-move select-none flex-shrink-0"
            onMouseDown={handleDragStart}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                <span className="font-bold text-sm">Ask NestIn</span>
              </div>
              <p className="text-white/60 text-xs mt-0.5 truncate">
                You&apos;re on: {SCREEN_LABELS[currentScreen] || currentScreen}
              </p>
            </div>
            {/* Drag handle dots */}
            <div className="flex flex-col gap-0.5 opacity-40 flex-shrink-0">
              <div className="flex gap-0.5">
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>
              <div className="flex gap-0.5">
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>
            </div>
            {/* Minimize */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          {/* Updating indicator */}
          {isUpdating && (
            <div className="px-4 py-2 bg-fuchsia-50 border-b border-fuchsia-100 flex items-center gap-2 flex-shrink-0">
              <div className="w-3 h-3 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-fuchsia-600 font-medium">AI is updating your list&hellip;</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-2">
                <p className="text-2xl">&#10024;</p>
                <p className="text-sm font-medium text-gray-700">How can I help?</p>
                <p className="text-xs text-gray-400 max-w-[240px] mx-auto">
                  Try: &ldquo;Remove all nice-to-have items&rdquo; or &ldquo;Switch to essentials tier&rdquo;
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5 flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-purple-100 bg-white flex-shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 px-3 py-2 rounded-xl border border-purple-100 text-sm focus:outline-none focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white flex items-center justify-center hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-40 transition-all flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-purple-300/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all ${isOpen ? 'ring-2 ring-fuchsia-300 ring-offset-2' : ''}`}
        title="Ask NestIn"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      </button>
    </>
  );
}
