import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: 'remove_items',
    description: 'Remove items from the product list by priority level or by item name.',
    input_schema: {
      type: 'object' as const,
      properties: {
        filter: {
          type: 'string',
          enum: ['nice-to-have', 'essential', 'by-name'],
          description: 'Filter type: remove all nice-to-have items, all essential items, or a specific item by name',
        },
        name: {
          type: 'string',
          description: 'Item name to search for (partial match, case-insensitive). Only used when filter is "by-name".',
        },
      },
      required: ['filter'],
    },
  },
  {
    name: 'change_budget_tier',
    description: 'Change the budget tier. Options: essentials ($400-650), comfortable ($800-1200), full-setup ($1500+).',
    input_schema: {
      type: 'object' as const,
      properties: {
        tier: {
          type: 'string',
          enum: ['essentials', 'comfortable', 'full-setup'],
          description: 'The budget tier to switch to',
        },
      },
      required: ['tier'],
    },
  },
  {
    name: 'update_category_preference',
    description: 'Update the condition/shopping preference for a product category or all categories at once.',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          enum: ['furniture', 'kitchen-supplies', 'bathroom-essentials', 'lighting-decor', 'storage-organisation', 'study-electronics', 'all'],
          description: 'Product category to update, or "all" to update every category',
        },
        preference: {
          type: 'string',
          enum: ['new-only', 'open-to-2nd-hand', 'prefer-2nd-hand'],
          description: 'The condition preference to set',
        },
      },
      required: ['category', 'preference'],
    },
  },
  {
    name: 'navigate',
    description: 'Navigate to a different screen in the app.',
    input_schema: {
      type: 'object' as const,
      properties: {
        screen: {
          type: 'string',
          enum: ['upload', 'results', 'preferences', 'cart', 'confirmation', 'replenishment', 'community'],
          description: 'Screen to navigate to',
        },
      },
      required: ['screen'],
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    const systemPrompt = `You are NestIn's embedded AI assistant helping users furnish their apartments. You respond in a friendly, concise manner (1-2 sentences).

CURRENT APP STATE:
- Screen: ${context.screenLabel}
${context.summary}

You can use the provided tools to make changes. Always include a brief text response confirming what you did. If the user asks something you can't do with the tools, answer conversationally.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: systemPrompt,
      messages,
      tools,
    });

    let message = '';
    const actions: Record<string, unknown>[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        message += block.text;
      } else if (block.type === 'tool_use') {
        actions.push({
          type: block.name,
          ...(block.input as Record<string, unknown>),
        });
      }
    }

    if (!message && actions.length > 0) {
      message = "Done! I've applied the changes.";
    }

    return NextResponse.json({ message, actions });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { message: "Sorry, I couldn't process that. Try again!", actions: [] },
      { status: 500 }
    );
  }
}
