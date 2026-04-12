import { RoomType, Suggestion } from './types';

const livingRoom: Suggestion[] = [
  { name: 'Sofa', description: 'Comfortable seating for your living space', priority: 'essential', estimatedPrice: '$200–600', reason: 'Primary seating for relaxation and guests', emoji: '🛋️' },
  { name: 'Coffee Table', description: 'Central surface for drinks, books, and remotes', priority: 'essential', estimatedPrice: '$50–150', reason: 'Every living room needs a functional surface', emoji: '☕' },
  { name: 'Floor Lamp', description: 'Standing lamp for ambient lighting', priority: 'essential', estimatedPrice: '$30–80', reason: 'Overhead lighting alone is often insufficient', emoji: '💡' },
  { name: 'TV Stand', description: 'Media console for TV and entertainment', priority: 'nice-to-have', estimatedPrice: '$60–200', reason: 'Organizes your entertainment setup', emoji: '📺' },
  { name: 'Area Rug', description: 'Soft rug to define the seating area', priority: 'nice-to-have', estimatedPrice: '$40–120', reason: 'Adds warmth and reduces noise on hard floors', emoji: '🟫' },
  { name: 'Curtains', description: 'Window coverings for privacy and light control', priority: 'essential', estimatedPrice: '$20–60', reason: 'Essential for privacy and blocking sunlight', emoji: '🪟' },
  { name: 'Throw Pillows & Blanket', description: 'Cozy accessories for the sofa', priority: 'nice-to-have', estimatedPrice: '$20–50', reason: 'Adds comfort and personal touch', emoji: '🧶' },
];

const kitchen: Suggestion[] = [
  { name: 'Dish Set (4-person)', description: 'Plates, bowls, and cups for everyday use', priority: 'essential', estimatedPrice: '$25–60', reason: 'You need dishes to eat meals at home', emoji: '🍽️' },
  { name: 'Pot & Pan Set', description: 'Starter cookware for basic cooking', priority: 'essential', estimatedPrice: '$30–80', reason: 'Essential for preparing any home-cooked meal', emoji: '🍳' },
  { name: 'Utensil Set', description: 'Spatula, ladle, tongs, and cooking spoons', priority: 'essential', estimatedPrice: '$10–25', reason: 'Needed for cooking and serving food', emoji: '🥄' },
  { name: 'Cutting Board & Knife Set', description: 'Board and basic knives for food prep', priority: 'essential', estimatedPrice: '$20–50', reason: 'Required for any food preparation', emoji: '🔪' },
  { name: 'Dish Drying Rack', description: 'Rack to dry dishes after washing', priority: 'essential', estimatedPrice: '$15–30', reason: 'Keeps counters organized while dishes dry', emoji: '🧹' },
  { name: 'Trash Can with Lid', description: 'Kitchen waste bin with odor control', priority: 'essential', estimatedPrice: '$15–40', reason: 'Proper waste management for the kitchen', emoji: '🗑️' },
  { name: 'Paper Towels & Cleaning Supplies', description: 'Basic kitchen cleaning essentials', priority: 'nice-to-have', estimatedPrice: '$10–20', reason: 'Needed for spills and daily cleanup', emoji: '🧽' },
];

const bedroom: Suggestion[] = [
  { name: 'Bed Frame', description: 'Sturdy frame for your mattress', priority: 'essential', estimatedPrice: '$100–300', reason: 'Foundation for a good sleep setup', emoji: '🛏️' },
  { name: 'Mattress', description: 'Comfortable mattress for quality sleep', priority: 'essential', estimatedPrice: '$200–500', reason: 'The most important item for your bedroom', emoji: '😴' },
  { name: 'Pillow Set (2)', description: 'Supportive pillows for sleeping', priority: 'essential', estimatedPrice: '$20–50', reason: 'Needed for comfortable sleep', emoji: '🛌' },
  { name: 'Bedsheet & Duvet Set', description: 'Fitted sheet, flat sheet, and duvet cover', priority: 'essential', estimatedPrice: '$30–80', reason: 'Bedding essentials for warmth and hygiene', emoji: '🧵' },
  { name: 'Nightstand', description: 'Small table beside the bed', priority: 'essential', estimatedPrice: '$30–80', reason: 'Place for phone, lamp, water, and alarm', emoji: '🪑' },
  { name: 'Desk Lamp', description: 'Small lamp for bedside or desk', priority: 'nice-to-have', estimatedPrice: '$15–40', reason: 'Reading light without overhead glare', emoji: '🔦' },
  { name: 'Hangers (20-pack)', description: 'Closet hangers for organizing clothes', priority: 'nice-to-have', estimatedPrice: '$10–25', reason: 'Keeps your wardrobe organized', emoji: '👔' },
];

const bathroom: Suggestion[] = [
  { name: 'Shower Curtain & Rings', description: 'Curtain to keep water in the shower', priority: 'essential', estimatedPrice: '$10–25', reason: 'Prevents water damage to the bathroom floor', emoji: '🚿' },
  { name: 'Bath Towel Set', description: 'Bath towels and hand towels', priority: 'essential', estimatedPrice: '$15–40', reason: 'Essential for drying off after showers', emoji: '🛁' },
  { name: 'Bath Mat', description: 'Non-slip mat for outside the shower', priority: 'essential', estimatedPrice: '$10–25', reason: 'Prevents slipping on wet floors', emoji: '🟦' },
  { name: 'Toilet Brush & Holder', description: 'Cleaning brush for the toilet', priority: 'essential', estimatedPrice: '$8–15', reason: 'Needed for basic bathroom hygiene', emoji: '🧹' },
  { name: 'Small Trash Can', description: 'Compact waste bin for the bathroom', priority: 'essential', estimatedPrice: '$5–15', reason: 'Proper waste disposal in the bathroom', emoji: '🗑️' },
  { name: 'Shower Caddy', description: 'Organizer for shampoo and soap', priority: 'nice-to-have', estimatedPrice: '$10–20', reason: 'Keeps shower products organized and accessible', emoji: '🧴' },
  { name: 'Mirror', description: 'Wall mirror if not built-in', priority: 'nice-to-have', estimatedPrice: '$15–40', reason: 'Useful for grooming and makes the space feel larger', emoji: '🪞' },
];

const secondBedroom: Suggestion[] = [
  { name: 'Bed Frame or Futon', description: 'Sleeping surface for guests or daily use', priority: 'essential', estimatedPrice: '$100–250', reason: 'Versatile option for guest room or home office', emoji: '🛏️' },
  { name: 'Mattress', description: 'Comfortable mattress or futon pad', priority: 'essential', estimatedPrice: '$150–350', reason: 'Needed for a functional sleeping space', emoji: '😴' },
  { name: 'Desk & Chair', description: 'Workspace setup for studying or remote work', priority: 'essential', estimatedPrice: '$80–200', reason: 'Makes the room double as a home office', emoji: '💻' },
  { name: 'Bedsheet Set', description: 'Basic bedding for the second bed', priority: 'essential', estimatedPrice: '$25–50', reason: 'Required for comfortable sleeping', emoji: '🧵' },
  { name: 'Desk Lamp', description: 'Task lighting for the desk area', priority: 'essential', estimatedPrice: '$15–40', reason: 'Good lighting reduces eye strain while working', emoji: '💡' },
  { name: 'Small Bookshelf', description: 'Compact shelving for books and storage', priority: 'nice-to-have', estimatedPrice: '$30–70', reason: 'Extra storage without taking much floor space', emoji: '📚' },
  { name: 'Hangers (10-pack)', description: 'Closet organizers for guest clothing', priority: 'nice-to-have', estimatedPrice: '$5–10', reason: 'Keeps the closet ready for use', emoji: '👔' },
];

export const defaultSuggestions: Record<RoomType, Suggestion[]> = {
  'living-room': livingRoom,
  'kitchen': kitchen,
  'bedroom': bedroom,
  'bathroom': bathroom,
  'second-bedroom': secondBedroom,
};
