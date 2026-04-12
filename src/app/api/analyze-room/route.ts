import { NextRequest, NextResponse } from 'next/server';
import { analyzeRoomImage } from '@/lib/anthropic';
import { defaultSuggestions } from '@/lib/defaults';
import { RoomType, AnalyzeRoomResponse } from '@/lib/types';

const validRoomTypes: RoomType[] = ['living-room', 'kitchen', 'bedroom', 'bathroom', 'second-bedroom'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomType, image, mediaType } = body;

    if (!roomType || !validRoomTypes.includes(roomType)) {
      return NextResponse.json({ error: 'Invalid room type' }, { status: 400 });
    }

    // No image provided — return defaults
    if (!image) {
      const response: AnalyzeRoomResponse = {
        suggestions: defaultSuggestions[roomType as RoomType],
      };
      return NextResponse.json(response);
    }

    // Analyze with Claude Vision
    const result = await analyzeRoomImage(roomType, image, mediaType || 'image/jpeg');

    const response: AnalyzeRoomResponse = {
      suggestions: result.suggestions,
      detectedItems: result.detectedItems,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Room analysis error:', error);

    // Fall back to defaults on any error
    const roomType = (await request.clone().json().catch(() => ({}))).roomType;
    if (roomType && validRoomTypes.includes(roomType)) {
      return NextResponse.json({
        suggestions: defaultSuggestions[roomType as RoomType],
        error: 'Analysis failed, showing default suggestions',
      });
    }

    return NextResponse.json({ error: 'Failed to analyze room' }, { status: 500 });
  }
}
