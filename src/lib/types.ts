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

export type ProductCategory = 'furniture' | 'kitchen-supplies' | 'bathroom-essentials' | 'lighting-decor' | 'storage-organisation' | 'study-electronics';

export interface ProductCategoryConfig {
  id: ProductCategory;
  label: string;
  emoji: string;
  description: string;
}

export const PRODUCT_CATEGORIES: ProductCategoryConfig[] = [
  { id: 'furniture', label: 'Furniture', emoji: '🪑', description: 'Bed frames, desks, chairs, shelves' },
  { id: 'kitchen-supplies', label: 'Kitchen Supplies', emoji: '🍳', description: 'Cookware, utensils, appliances' },
  { id: 'bathroom-essentials', label: 'Bathroom Essentials', emoji: '🛁', description: 'Towels, bath mat, organisers' },
  { id: 'lighting-decor', label: 'Lighting & Decor', emoji: '💡', description: 'Lamps, rugs, curtains' },
  { id: 'storage-organisation', label: 'Storage & Organisation', emoji: '📦', description: 'Bins, hangers, shelving' },
  { id: 'study-electronics', label: 'Study & Electronics', emoji: '🖥️', description: 'Power strips, monitor stands, desk accessories' },
];

export interface PreferencesState {
  tier: BudgetTier;
  categories: Record<RoomType, ConditionPreference>;
  categoryPreferences: Record<ProductCategory, ConditionPreference>;
}

// Smart defaults per product category
export const BASE_CATEGORY_DEFAULTS: Record<ProductCategory, ConditionPreference> = {
  'furniture': 'open-to-2nd-hand',
  'kitchen-supplies': 'new-only',
  'bathroom-essentials': 'new-only',
  'lighting-decor': 'open-to-2nd-hand',
  'storage-organisation': 'open-to-2nd-hand',
  'study-electronics': 'new-only',
};

export function getCategoryDefaultsForTier(tier: BudgetTier): Record<ProductCategory, ConditionPreference> {
  const defaults = { ...BASE_CATEGORY_DEFAULTS };
  if (tier === 'essentials') {
    for (const key of Object.keys(defaults) as ProductCategory[]) {
      if (defaults[key] === 'new-only') defaults[key] = 'open-to-2nd-hand';
      else if (defaults[key] === 'open-to-2nd-hand') defaults[key] = 'prefer-2nd-hand';
    }
  } else if (tier === 'full-setup') {
    for (const key of Object.keys(defaults) as ProductCategory[]) {
      if (defaults[key] === 'prefer-2nd-hand') defaults[key] = 'open-to-2nd-hand';
      else if (defaults[key] === 'open-to-2nd-hand') defaults[key] = 'new-only';
    }
  }
  return defaults;
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

// Screen 6: Replenishment
export interface ReplenishmentItem {
  id: string;
  name: string;
  emoji: string;
  category: 'consumable' | 'perishable' | 'durable';
  currentSource: string;
  currentPrice: number;
  quantity: number;
  lastPurchased: string;
  nextReplenishment: string;
  daysUntilNeeded: number;
  shelfLife: 'short' | 'medium' | 'long';
  promo: {
    retailer: string;
    discount: string;
    newPrice: number;
  } | null;
  aiNote: string | null;
}
