import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { status: 'PENDING' },
      include: { user: true },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { transactionId, action } = await req.json(); // action = 'APPROVE' or 'REJECT'
    
    if (!transactionId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const tx = await prisma.transaction.findUnique({ where: { id: Number(transactionId) } });
    if (!tx || tx.status !== 'PENDING') {
      return NextResponse.json({ error: 'Transaction not found or already processed' }, { status: 400 });
    }

    await prisma.$transaction(async (prismaTx) => {
      if (action === 'APPROVE') {
        await prismaTx.transaction.update({
          where: { id: tx.id },
          data: { status: 'APPROVED' }
        });

        // If it's a deposit, we add to user balance. (Withdrawals already deducted balance at request time).
        if (tx.type === 'DEPOSIT') {
          await prismaTx.user.update({
            where: { id: tx.userId },
            data: { balance: { increment: tx.amount } }
          });
        }
      } else if (action === 'REJECT') {
        await prismaTx.transaction.update({
          where: { id: tx.id },
          data: { status: 'REJECTED' }
        });

        // If a withdrawal is rejected, refund the user
        if (tx.type === 'WITHDRAW') {
          await prismaTx.user.update({
            where: { id: tx.userId },
            data: { balance: { increment: tx.amount } }
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: `Transaction ${action}D successfully` });
  } catch (error: any) {
    console.error('Admin Tx Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
