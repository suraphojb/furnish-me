import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function analyzeRoomImage(
  roomType: string,
  imageBase64: string,
  mediaType: string
): Promise<{ suggestions: Array<{ name: string; description: string; priority: 'essential' | 'nice-to-have'; estimatedPrice: string; reason: string; emoji: string }>; detectedItems: string[] }> {
  const { getRoomAnalysisPrompt } = await import('./prompts');

  const response = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: getRoomAnalysisPrompt(roomType),
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return JSON.parse(textBlock.text);
}
