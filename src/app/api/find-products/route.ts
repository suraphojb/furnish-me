import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ProductListing, BudgetTier, ConditionPreference } from '@/lib/types';

const client = new Anthropic();

interface FindProductsRequest {
  itemName: string;
  tier: BudgetTier;
  condition: ConditionPreference;
  estimatedPrice: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FindProductsRequest = await request.json();
    const { itemName, tier, condition, estimatedPrice } = body;

    const conditionGuidance = {
      'new-only': 'All products should be brand new.',
      'open-to-2nd-hand': 'Mix of new and used/refurbished options. Include at least 3-4 secondhand options.',
      'prefer-2nd-hand': 'Prioritize used, refurbished, or secondhand options. Include at most 2 new options.',
    }[condition];

    const tierGuidance = {
      'essentials': 'Budget-friendly options, focus on the lowest prices that still have decent quality.',
      'comfortable': 'Mid-range options balancing quality and price.',
      'full-setup': 'Higher quality options, premium brands are acceptable.',
    }[tier];

    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2500,
      messages: [
        {
          role: 'user',
          content: `You are a shopping assistant. Generate 8-10 realistic product listings for "${itemName}" from real e-commerce retailers.

Budget guidance: ${tierGuidance}
Condition preference: ${conditionGuidance}
Reference price range: ${estimatedPrice}

Use REAL retailer names like Amazon, Target, Walmart, IKEA, Wayfair, CB2, West Elm, FB Market, OfferUp, Craigslist, Goodwill, Habitat ReStore, HomeGoods, Overstock, Pottery Barn.
IMPORTANT: For Facebook Marketplace, ALWAYS use the abbreviation "FB Market" as the source name. Never write "Facebook Marketplace" or "FB Marketplace".

For each product, generate a realistic but fictional product name, a plausible price, and realistic review counts. Vary the price range — include some budget and some premium options.

The FIRST product should be the best overall recommendation (best value for quality).

For imageUrl, generate a URL using this format: https://loremflickr.com/400/400/KEYWORD
Replace KEYWORD with a single specific keyword for the product (e.g. "sofa", "coffeetable", "lamp", "towels"). Use different keywords for each product so images vary. Keep keywords simple, one word, no spaces.

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "products": [
    {
      "name": "Specific Product Name With Brand",
      "price": 29.99,
      "source": "Amazon",
      "sourceUrl": "https://amazon.com",
      "imageUrl": "https://loremflickr.com/400/400/sofa",
      "rating": 4.5,
      "reviewCount": 1247,
      "condition": "new",
      "isTopPick": true
    }
  ]
}

Only the first product should have "isTopPick": true. Conditions can be "new", "used", or "refurbished".`,
        },
      ],
    });

    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const parsed = JSON.parse(textBlock.text);
    const products: ProductListing[] = (parsed.products as ProductListing[]).map(p => ({
      ...p,
      source: p.source.replace(/Facebook Marketplace|FB Marketplace/gi, 'FB Market'),
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json({ products: [], error: 'Failed to find products' }, { status: 500 });
  }
}
