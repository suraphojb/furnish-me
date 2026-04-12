export type RoomType = 'living-room' | 'kitchen' | 'bedroom' | 'bathroom' | 'second-bedroom';

export interface RoomConfig {
  id: RoomType;
  label: string;
  emoji: string;
}

export const ROOMS: RoomConfig[] = [
  { id: 'living-room', label: 'Living Room', emoji: '🛋️' },
  { id: 'kitchen', label: 'Kitchen', emoji: '🍳' },
  { id: 'bedroom', label: 'Bedroom', emoji: '🛏️' },
  { id: 'bathroom', label: 'Bathroom', emoji: '🚿' },
  { id: 'second-bedroom', label: '2nd Bedroom', emoji: '🛌' },
];

export interface Suggestion {
  name: string;
  description: string;
  priority: 'essential' | 'nice-to-have';
  estimatedPrice: string;
  reason: string;
  emoji: string;
}

export interface RoomState {
  image: string | null; // base64 data URL
  fileName: string | null;
  suggestions: Suggestion[] | null;
  detectedItems: string[] | null;
  loading: boolean;
  error: string | null;
}

export interface AnalyzeRoomRequest {
  roomType: RoomType;
  image?: string; // base64 without data URL prefix
  mediaType?: string;
}

export interface AnalyzeRoomResponse {
  suggestions: Suggestion[];
  detectedItems?: string[];
}

// Screen 3: Preferences & Budget
export type BudgetTier = 'essentials' | 'comfortable' | 'full-setup';

export type ConditionPreference = 'new-only' | 'open-to-2nd-hand' | 'prefer-2nd-hand';

export interface TierConfig {
  id: BudgetTier;
  label: string;
  priceRange: string;
  description: string;
  emoji: string;
}

export const TIERS: TierConfig[] = [
  {
    id: 'essentials',
    label: 'Essentials',
    priceRange: '$400–$650',
    description: 'Just the basics to get settled in. Prioritize secondhand and budget finds.',
    emoji: '🎒',
  },
  {
    id: 'comfortable',
    label: 'Comfortable',
    priceRange: '$800–$1,200',
    description: 'A balanced mix of new and secondhand for a cozy, functional home.',
    emoji: '🏠',
  },
  {
    id: 'full-setup',
    label: 'Full Setup',
    priceRange: '$1,500+',
    description: 'All-new items for a polished, move-in-ready apartment.',
    emoji: '✨',
  },
];

export interface CategoryPreference {
  roomId: RoomType;
  condition: ConditionPreference;
}

export interface PreferencesState {
  tier: BudgetTier;
  categories: Record<RoomType, ConditionPreference>;
}

// Screen 4: Product Listings
export interface ProductListing {
  name: string;
  price: number;
  source: string;
  sourceUrl: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  condition: 'new' | 'used' | 'refurbished';
  isTopPick: boolean;
}

export interface ItemWithProducts {
  itemName: string;
  itemEmoji: string;
  roomId: RoomType;
  roomLabel: string;
  products: ProductListing[];
  selectedIndex: number;
}

// Screen 5: Order Confirmation
export interface OrderedItem {
  name: string;
  emoji: string;
  price: number;
  source: string;
  imageUrl: string;
  estimatedDelivery: string;
  condition: 'new' | 'used' | 'refurbished';
}

export interface OrderConfirmation {
  orderRef: string;
  items: OrderedItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  retailers: string[];
}
