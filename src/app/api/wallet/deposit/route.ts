import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, amount, utr } = await req.json();

    if (!userId || !amount || !utr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: Number(userId),
        type: 'DEPOSIT',
        amount: Number(amount),
        status: 'PENDING',
        method: 'UPI',
        details: utr,
      }
    });

    return NextResponse.json({ success: true, message: 'Deposit request submitted successfully', transaction });
  } catch (error: any) {
    console.error('Deposit Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
