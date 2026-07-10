import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, amount, selection, period } = await req.json();

    if (!userId || !amount || !selection || !period) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Use a transaction to ensure atomic balance deduction and bet creation
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Deduct balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } }
      });

      // Create bet record
      const bet = await tx.bet.create({
        data: {
          userId,
          amount,
          selection,
          period,
          status: 'PENDING'
        }
      });

      return { user: updatedUser, bet };
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Bet placed successfully', 
      newBalance: result.user.balance 
    });

  } catch (error: any) {
    console.error('Bet Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
