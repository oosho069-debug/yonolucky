import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, amount, bankAccount, bankIfsc } = await req.json();

    if (!userId || !amount || !bankAccount || !bankIfsc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      // Deduct balance immediately for withdrawal request
      await tx.user.update({
        where: { id: Number(userId) },
        data: { balance: { decrement: Number(amount) } }
      });

      return await tx.transaction.create({
        data: {
          userId: Number(userId),
          type: 'WITHDRAW',
          amount: Number(amount),
          status: 'PENDING',
          method: 'BANK',
          details: `A/C: ${bankAccount} | IFSC: ${bankIfsc}`,
        }
      });
    });

    return NextResponse.json({ success: true, message: 'Withdraw request submitted', transaction });
  } catch (error: any) {
    console.error('Withdraw Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
