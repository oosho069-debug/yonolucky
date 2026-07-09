import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' }
    });

    const bets = await prisma.bet.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, transactions, bets });
  } catch (error: any) {
    console.error('History API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
