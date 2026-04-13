# NestIn — Complete Project Handoff Document

> AI-powered app that helps international students and new workers furnish empty apartments.
> Built for Columbia Hackathon 2026 (won 3rd place).

**Live**: https://furnish-me-ten.vercel.app
**Repo**: https://github.com/suraphojb/furnish-me

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS 4 |
| AI | Anthropic SDK (`@anthropic-ai/sdk` v0.88) — Claude Sonnet |
| Hosting | Vercel |
| Database | **None** — all state is client-side React state |
| Auth | **None** |
| Payments | **None** |

**Env vars required**: `ANTHROPIC_API_KEY` in `.env.local`

---

## 2. App Flow (6 Screens + Community)

```
Screen 1: Upload      → User uploads room photos (up to 5 rooms)
Screen 2: Product List → AI-generated furniture suggestions per room
Screen 3: Preferences  → Budget tier + per-category new/2nd-hand preferences
Screen 4: Shopping Cart → Product listings carousel from retailers (mock data from Claude)
Screen 5: Confirmation  → Mock order summary with delivery tracker
Screen 6: Replenishment → Consumable repurchase schedule with AI promo alerts
Community: Neighbourhood hub (accessible from floating bubble on all screens)
```

There is also a **floating AI chat bubble** ("Ask NestIn") on every screen that can execute natural language commands (remove items, change tier, update preferences, navigate).

---

## 3. File Structure & What Each File Does

### Entry Points

| File | Purpose |
|---|---|
| `src/app/page.tsx` | **Main orchestrator.** Manages all screen navigation, holds lifted state (room state, preferences tier, category prefs, order). Renders the correct screen component, the step indicator, header, floating community bubble, and the AI chat bubble. |
| `src/app/layout.tsx` | Root layout with metadata. Title: "NestIn - Settle in, sorted." |
| `src/app/globals.css` | GenZ theme: `#faf8ff` background, `.gradient-text` (pink→violet→blue), `.glass-card` (backdrop-blur), `.animate-shimmer`, purple scrollbar, `fadeInUp` animation. |

### API Routes (Server-Side)

| File | Purpose |
|---|---|
| `src/app/api/analyze-room/route.ts` | **Screen 1→2 transition.** Receives room photo (base64) + room type. Sends to Claude Vision API to detect existing items and suggest 5-7 missing items. Falls back to `defaults.ts` on error or if no image provided. |
| `src/app/api/find-products/route.ts` | **Screen 3→4 transition.** Receives item name + budget tier + condition preference. Asks Claude to generate 8-10 realistic product listings with prices, retailers, ratings. Server-side normalizes "Facebook Marketplace" → "FB Market". |
| `src/app/api/ai-chat/route.ts` | **AI chat assistant.** Receives conversation history + app context (current screen, item list, tier, prefs). Uses Claude with tool use — tools: `remove_items`, `change_budget_tier`, `update_category_preference`, `navigate`. Returns text response + actions array. |

### Components

| File | Screen | Purpose |
|---|---|---|
| `RoomGrid.tsx` | 1 | 2x2+1 grid of RoomCards for the 5 rooms. Tight gap. |
| `RoomCard.tsx` | 1 | Individual room upload card. Drag-and-drop or click to upload. Shows preview after upload. Compact layout with purple-tinted borders. |
| `ResultsView.tsx` | 2 | "What you need" — shows AI suggestions per room. Has floating bottom bar with gradient showing estimated total cost and "Set my preferences →" button. `pb-28` padding for floating bar. Has "← Back" link. Passes `onRemoveSuggestion` to RoomResult. |
| `RoomResult.tsx` | 2 | Collapsible room section. Shows detected items (green) and suggestions sorted essential-first then nice-to-have, each group by price descending. Has `parsePriceRange()` and `getRoomTotal()` helpers (exported). |
| `SuggestionItem.tsx` | 2 | Individual suggestion row. Essential items get `bg-gray-50` background. Delete (X) button appears on hover. Shows emoji, name, priority badge, price, reason. |
| `PreferencesView.tsx` | 3 | Budget tier selection (3 tiers: essentials/comfortable/full-setup) + per-category condition toggles. 6 product categories. `classifySuggestion()` maps item names to categories via regex. `deriveRoomCategories()` maps category prefs back to room-level for cart compatibility. **Controlled component** — tier and catPrefs are props from page.tsx. |
| `ShoppingCartView.tsx` | 4 | Horizontal carousel of product cards per item. Has `generateMockOrder()` for Screen 5 data. Gradient bottom bar with "Place Order" button. Loading state with fuchsia spinner. |
| `ProductCard.tsx` | 4 | Individual product card. **No real images** — gradient placeholder with emoji (📦 new, ♻️ used, 🔧 refurbished). Top Pick and Selected badges overlay. Retailer badges use `SOURCE_COLORS` map. |
| `OrderConfirmationView.tsx` | 5 | Green checkmark, order ref, delivery progress tracker, items list, order summary totals. "View replenishment schedule →" and "Start fresh" buttons. |
| `ReplenishmentView.tsx` | 6 | AI agent banner with speech bubble. 10 mock consumable items sorted by urgency. Quantity ±, remove button, green promo banners with "Switch" retailer button, AI stock-up tips. "Explore your community →" CTA. |
| `CommunityView.tsx` | Community | Neighbourhood hub. 2x2 grid of category cards (Second-Hand Market, Sublets, Local Recs, Happy Hours) with **Unsplash background images** and dark gradient overlay. Scrollable community feed teaser (4 mock posts). "Create a post" CTA. Takes `onClose` prop. |
| `AIChatBubble.tsx` | All | Floating sparkle-icon bubble (bottom-right, z-60). Opens 360x480 draggable chat window. Header says "Ask NestIn" with current screen context. Sends messages to `/api/ai-chat`, executes returned actions (remove items, change tier, update prefs, navigate). Shows "AI is updating your list..." indicator. Minimizable without losing conversation. |

### Hooks

| File | Purpose |
|---|---|
| `src/hooks/useRoomState.ts` | Central state management via `useReducer`. Manages room images, suggestions, loading, errors across all 5 rooms. Actions: `SET_IMAGE`, `REMOVE_IMAGE`, `SET_LOADING`, `SET_RESULTS`, `SET_ERROR`, `REMOVE_SUGGESTION` (single item by index), `REMOVE_BY_PRIORITY` (bulk by essential/nice-to-have), `REMOVE_BY_NAME` (bulk by name match), `RESET`. Exposes: `state`, `setImage`, `removeImage`, `removeSuggestion`, `removeSuggestionsByPriority`, `removeSuggestionByName`, `analyzeAllRooms`, `reset`, `hasAnyContent`, `hasResults`, `isLoading`. |

### Lib (Shared Utilities)

| File | Purpose |
|---|---|
| `src/lib/types.ts` | All TypeScript types and constants. Room types, Suggestion, RoomState, BudgetTier, ConditionPreference, ProductCategory, ProductListing, OrderConfirmation, ReplenishmentItem. Also has `ROOMS`, `TIERS`, `PRODUCT_CATEGORIES`, `BASE_CATEGORY_DEFAULTS` constants and `getCategoryDefaultsForTier()` helper. |
| `src/lib/anthropic.ts` | Anthropic client singleton + `analyzeRoomImage()` function that calls Claude Vision API with base64 image and returns parsed suggestions. |
| `src/lib/prompts.ts` | `getRoomAnalysisPrompt()` — builds the system prompt for room analysis. Includes instruction to never suggest built-in appliances (sinks, stoves, etc.). |
| `src/lib/defaults.ts` | Hardcoded fallback suggestions for each of the 5 room types (7 items each). Used when no photo is uploaded or when API fails. |

### Config Files

| File | Purpose |
|---|---|
| `next.config.ts` | `devIndicators: false` (hides Next.js dev tools button) |
| `package.json` | Dependencies: `next`, `react`, `react-dom`, `@anthropic-ai/sdk`. Dev: `tailwindcss`, `typescript`, `eslint`. |

---

## 4. State Architecture

All state lives in `page.tsx` (no database, no context providers):

```
page.tsx state:
├── useRoomState()        → room images, suggestions, loading (via useReducer)
├── screen                → current screen ('upload' | 'results' | 'preferences' | ...)
├── tier                  → budget tier ('essentials' | 'comfortable' | 'full-setup')
├── catPrefs              → Record<ProductCategory, ConditionPreference>
├── preferences           → full PreferencesState (set when user clicks "Build cart")
├── order                 → OrderConfirmation (set when user places order)
└── prevScreen            → saved screen for community navigation
```

State flows **downward as props**. No global state, no context, no external state library.

---

## 5. Key Design Decisions & Constraints

1. **No real product images** — ProductCard uses gradient placeholders with condition emojis. This was intentional for the hackathon.
2. **Product data is AI-generated** — Claude generates mock product listings on each request. No real retailer APIs.
3. **"FB Market" abbreviation** — The API prompt instructs Claude to use "FB Market", and server-side normalization (`String.replace`) ensures consistency.
4. **No built-in appliances** — The room analysis prompt explicitly excludes sinks, cooktops, stoves, ovens, dishwashers from suggestions.
5. **Category-based preferences** — Screen 3 uses 6 product categories (furniture, kitchen, bathroom, lighting, storage, electronics) rather than per-room preferences. `classifySuggestion()` in PreferencesView maps items to categories via regex keyword matching.
6. **Floating bars** — Screen 2 has a fixed-bottom gradient bar with cost estimate. The community bubble (green/teal, `bottom-24 right-6`) and AI chat bubble (purple gradient, `bottom-6 right-6`) are both fixed-position and coexist.
7. **AI chat uses Claude tool use** — The `/api/ai-chat` route defines 4 tools. Claude returns text + tool_use blocks. The client-side `AIChatBubble` component extracts actions and calls the appropriate state modifiers passed as props.

---

## 6. What Is Real vs. Mock

| Feature | Status |
|---|---|
| Room photo analysis (Claude Vision) | **Real** — actually analyzes uploaded photos |
| Detected items list | **Real** — from Claude Vision response |
| Furniture suggestions | **Real** when photo uploaded, **fallback defaults** when no photo |
| Product listings (Screen 4) | **Mock** — Claude generates fictional but realistic listings |
| Product images | **Mock** — gradient placeholders, no real images |
| Order confirmation | **Mock** — generated from selected products |
| Replenishment schedule | **Mock** — hardcoded 10 consumable items |
| Community posts | **Mock** — hardcoded 4 sample posts |
| AI chat commands | **Real** — actually modifies app state via Claude tool use |
| Checkout/payment | **Mock** — no real payment processing |

---

## 7. What Needs To Be Built for Production

### Must-Have (MVP)

1. **Database** — PostgreSQL or Supabase for users, orders, saved preferences, community posts
2. **Authentication** — OAuth (Google/Apple) + email signup
3. **Real product data** — Integrate retailer APIs (Amazon Product Advertising API, IKEA, etc.) or build a product catalog
4. **Real product images** — From retailer feeds, replacing gradient placeholders
5. **Payment processing** — Stripe Checkout for concierge model (user pays, team orders manually). Requires Stripe account — needs SSN/ITIN for US, or use home country Stripe account
6. **Order management** — Admin dashboard to see incoming orders, mark as purchased/shipped/delivered
7. **Notifications** — Email/SMS when order is placed, purchased, shipped, delivered

### Should-Have (Beta)

8. **Community backend** — Real posts, user profiles, image uploads, moderation
9. **Mobile optimization** — PWA or React Native wrapper for camera-first experience
10. **Caching** — Cache room analysis results and product searches to reduce AI costs
11. **Rate limiting** — Prevent API abuse on Claude endpoints
12. **Error tracking** — Sentry or similar for production monitoring

### Nice-to-Have (Growth)

13. **Affiliate links** — Replace mock retailer URLs with real affiliate links for commission revenue
14. **Browser extension** — Pre-fill carts at multiple retailers
15. **Roommate matching** — Share apartment furnishing lists with co-tenants
16. **Price tracking** — Monitor prices and alert when items drop

---

## 8. Running the Project

```bash
# Install dependencies
npm install

# Set up environment
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npx vercel deploy --prod --yes
```

---

## 9. Important Notes for Future Development

- **Next.js 16 has breaking changes** — read docs in `node_modules/next/dist/docs/` before making framework-level changes. See `AGENTS.md`.
- **PreferencesView is a controlled component** — tier and catPrefs are managed in `page.tsx` and passed as props. This was done so the AI chat bubble can modify preferences from any screen.
- **useRoomState hook** is the single source of truth for room data. All bulk operations (remove by priority, remove by name) go through it.
- **The AI chat sends full context each request** — current screen, all items with priorities/prices, tier, category prefs. This makes each API call self-contained (no server-side session).
- **Unsplash images** are used for community category cards — loaded via direct URL (no API key needed for `images.unsplash.com` direct links).
