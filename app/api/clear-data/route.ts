// app/api/clear-data/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    await prisma.attendee.deleteMany({});
    
    return NextResponse.json({ success: true, message: 'Database cleared' });
  } catch (error) {
    console.error('Clear Data Error:', error);
    return NextResponse.json({ error: 'Failed to clear database' }, { status: 500 });
  }
}