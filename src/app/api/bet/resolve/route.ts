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

    const { betId, status, winAmount } = await req.json();

    if (!betId || !status || (status === 'WON' && winAmount <= 0)) {
      return NextResponse.json({ error: 'Invalid resolution parameters' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const bet = await tx.bet.findUnique({ where: { id: betId } });
      if (!bet) throw new Error('Bet not found');
      if (bet.userId !== userId) throw new Error('Unauthorized for this bet');
      if (bet.status !== 'PENDING') throw new Error('Bet already resolved');

      // Update bet status
      const updatedBet = await tx.bet.update({
        where: { id: betId },
        data: { status, winAmount: status === 'WON' ? winAmount : 0 }
      });

      let updatedUser = null;
      if (status === 'WON') {
        // Add win amount to balance
        updatedUser = await tx.user.update({
          where: { id: userId },
          data: { balance: { increment: winAmount } }
        });
      } else {
        updatedUser = await tx.user.findUnique({ where: { id: userId } });
      }

      return { bet: updatedBet, user: updatedUser };
    });

    return NextResponse.json({
      success: true,
      message: 'Bet resolved',
      bet: result.bet,
      newBalance: result.user?.balance
    });

  } catch (error: any) {
    console.error('Bet Resolve Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
