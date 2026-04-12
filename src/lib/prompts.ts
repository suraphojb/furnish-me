export function getRoomAnalysisPrompt(roomType: string): string {
  const roomLabel = roomType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return `You are a home furnishing advisor helping someone who just moved into an unfurnished apartment.

Look at this photo of their ${roomLabel} and:
1. List what furniture and items you can already see in the room.
2. Suggest 5-7 essential items that are MISSING from this ${roomLabel}.

IMPORTANT: Never suggest built-in appliances or fixtures like kitchen sinks, cooktops, stoves, ovens, or dishwashers. These come with the apartment. Only suggest portable items, supplies, and furniture the tenant needs to buy.

For each missing item, provide:
- name: short item name
- description: one sentence about why they need it
- priority: "essential" or "nice-to-have"
- estimatedPrice: price range in USD like "$20-40"
- reason: specific reason based on what you see (or don't see) in the photo
- emoji: a single relevant emoji

Respond ONLY with valid JSON in this exact format (no markdown, no code fences):
{
  "detectedItems": ["item1", "item2"],
  "suggestions": [
    { "name": "Item Name", "description": "Why they need it", "priority": "essential", "estimatedPrice": "$XX-YY", "reason": "Based on the photo...", "emoji": "🪑" }
  ]
}`;
}
