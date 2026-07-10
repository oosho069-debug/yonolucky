import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_91appt_key';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const { amount, selection, gameType, period } = await req.json();

    if (!amount || amount <= 0 || !selection || !gameType || !period) {
      return NextResponse.json({ error: 'Invalid bet parameters' }, { status: 400 });
    }

    // Use Prisma transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');
      
      if (user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Deduct balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } }
      });

      // Create pending bet
      const bet = await tx.bet.create({
        data: {
          userId,
          period,
          amount,
          selection,
          gameType,
          status: 'PENDING'
        }
      });

      return { user: updatedUser, bet };
    });

    return NextResponse.json({
      success: true,
      message: 'Bet placed successfully',
      bet: result.bet,
      newBalance: result.user.balance
    });

  } catch (error: any) {
    console.error('Bet Place Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
